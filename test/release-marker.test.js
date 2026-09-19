"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),{execFileSync}=require("node:child_process");
const root=path.resolve(__dirname,"..");

test("build injects the Vercel Git SHA as a non-sensitive release marker",()=>{
  execFileSync(process.execPath,[path.join(root,"scripts","build-web.js")],{cwd:root,env:{...process.env,VERCEL_GIT_COMMIT_SHA:"0123456789abcdef0123456789abcdef01234567"}});
  const html=fs.readFileSync(path.join(root,"dist","index.html"),"utf8");
  assert.match(html,/<meta name="rp-release" content="0123456">/);
  assert.doesNotMatch(html,/__RP_RELEASE__/);
});
