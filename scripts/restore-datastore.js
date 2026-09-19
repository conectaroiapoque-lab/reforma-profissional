#!/usr/bin/env node
"use strict";const fs=require("node:fs"),{RedisRestClient,restoreNamespace}=require("./datastore-backup-lib");
(async()=>{if(process.env.RESTORE_CONFIRM!=="ISOLATED_RESTORE_ONLY")throw new Error("RESTORE_CONFIRM_REQUIRED");const file=process.argv[2],targetNamespace=process.env.RESTORE_TARGET_NAMESPACE;if(!file)throw new Error("BACKUP_FILE_REQUIRED");const result=await restoreNamespace(new RedisRestClient(),JSON.parse(fs.readFileSync(file,"utf8")),{targetNamespace});console.log(JSON.stringify(result));})().catch(error=>{console.error(error.message);process.exitCode=1;});
