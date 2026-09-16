"use strict";
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),out=path.join(root,"dist");
/* Public artifacts are deny-by-default. Server/domain code must never be added here. */
const entries=["catalog.js","styles.css","landing-pages.css","landing-pages.js","manifest.webmanifest","sw.js","robots.txt","sitemap.xml","icons","solicitar-servico","eletricista-bh","bombeiro-hidraulico-bh","ar-condicionado-bh","pedreiro-bh","marido-de-aluguel-bh"];
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
for(const entry of entries){const source=path.join(root,entry);if(fs.existsSync(source))fs.cpSync(source,path.join(out,entry),{recursive:true});}
fs.copyFileSync(path.join(root,"web","app.js"),path.join(out,"app.js"));
fs.copyFileSync(path.join(root,"web","index.html"),path.join(out,"index.html"));
fs.cpSync(path.join(root,"public",".well-known"),path.join(out,".well-known"),{recursive:true});
const app=require(path.join(root,"config","app-config"));
const association=path.join(out,".well-known","apple-app-site-association");
fs.writeFileSync(association,fs.readFileSync(association,"utf8").replace("APP_BUNDLE_ID",app.iosBundleId));
console.log(`Web build ready: ${out}`);
