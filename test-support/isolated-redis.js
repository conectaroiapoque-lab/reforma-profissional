"use strict";
const { spawn, execFile } = require("node:child_process"),
  { promisify } = require("node:util"),
  fs = require("node:fs/promises"),
  os = require("node:os"),
  path = require("node:path");
const { ScheduleRepository } = require("../server/schedule-repository");
const exec = promisify(execFile);
async function isolatedRedis(t) {
  const server = process.env.REDIS_SERVER || "redis-server",
    cli = process.env.REDIS_CLI || "redis-cli";
  try {
    await exec(server, ["--version"]);
    await exec(cli, ["--version"]);
  } catch {
    t.skip("Integração exige redis-server e redis-cli isolados.");
    return null;
  }
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "rp-review-race-")),
    socket = path.join(dir, "redis.sock"),
    child = spawn(
      server,
      [
        "--port",
        "0",
        "--unixsocket",
        socket,
        "--save",
        "",
        "--appendonly",
        "no",
        "--dir",
        dir,
      ],
      { stdio: "ignore" },
    );
  t.after(async () => {
    const exited = new Promise((resolve) => child.once("exit", resolve));
    child.kill("SIGTERM");
    await exited;
    await fs.rm(dir, { recursive: true, force: true });
  });
  for (let i = 0; i < 100; i++) {
    try {
      await fs.access(socket);
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 20));
    }
  }
  class LocalRepository extends ScheduleRepository {
    constructor() {
      super({ url: "http://unused", token: "test-only" });
    }
    async command(...args) {
      const { stdout } = await exec(
        cli,
        ["--json", "-s", socket, ...args.map(String)],
        { maxBuffer: 20000000 },
      );
      const result = JSON.parse(stdout);
      if (result?.error) throw new Error("REDIS_ERROR");
      return result;
    }
  }
  return new LocalRepository();
}
module.exports = { isolatedRedis };
