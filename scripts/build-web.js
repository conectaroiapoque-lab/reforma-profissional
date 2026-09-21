"use strict";
const fs=require("node:fs"),path=require("node:path"),{execFileSync}=require("node:child_process");
const root=path.resolve(__dirname,".."),out=path.join(root,"dist");
/* Public artifacts are deny-by-default. Server/domain code must never be added here. */
const entries=["catalog.js","styles.css","landing-pages.css","landing-pages.js","manifest.webmanifest","sw.js","robots.txt","sitemap.xml","icons","public/legal","public/provider","public/admin","public/postal-code.js","prestador","admin","privacidade","solicitar-servico","eletricista-bh","bombeiro-hidraulico-bh","ar-condicionado-bh","pedreiro-bh","marido-de-aluguel-bh"];
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
for(const entry of entries){const source=path.join(root,entry);if(fs.existsSync(source))fs.cpSync(source,path.join(out,entry),{recursive:true});}
fs.cpSync(path.join(root,"public","assets"),path.join(out,"assets"),{recursive:true});
fs.copyFileSync(path.join(root,"web","app.js"),path.join(out,"app.js"));
fs.copyFileSync(path.join(root,"web","index.html"),path.join(out,"index.html"));
fs.cpSync(path.join(root,"public",".well-known"),path.join(out,".well-known"),{recursive:true});
const releaseSource=process.env.VERCEL_GIT_COMMIT_SHA||execFileSync("git",["rev-parse","HEAD"],{cwd:root,encoding:"utf8"}).trim();
if(!/^[0-9a-f]{7,40}$/i.test(releaseSource))throw new Error("Release identifier must be a Git commit SHA");
const release=releaseSource.slice(0,7).toLowerCase(),indexPath=path.join(out,"index.html");
const releaseHtml=fs.readFileSync(indexPath,"utf8").replaceAll("__RP_RELEASE__",release);
if(!releaseHtml.includes(`<meta name="rp-build" content="go-live-main-${release}">`)||!releaseHtml.includes(`<!-- RP_BUILD:${release} -->`))throw new Error("Production HTML must contain both build markers");
fs.writeFileSync(indexPath,releaseHtml);
for(const file of ["index.html","styles.css","app.js","sw.js","manifest.webmanifest"]){
  const built=path.join(out,file);
  if(!fs.existsSync(built)||fs.statSync(built).size===0)throw new Error(`Incomplete web build: ${file}`);
}
const builtHtml=fs.readFileSync(path.join(out,"index.html"),"utf8");
for(const match of builtHtml.matchAll(/(?:href|src)="\/(styles\.css|app\.js)\?v=\d+"/g)){
  if(!fs.existsSync(path.join(out,match[1])))throw new Error(`HTML references missing production asset: ${match[1]}`);
}
if(!builtHtml.includes('href="/styles.css?v=')||!builtHtml.includes('src="/app.js?v='))throw new Error("Production HTML must use root-absolute, versioned CSS and JavaScript URLs");
function escape(value){return value.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");}
function inline(value){return escape(value).replace(/`([^`]+)`/g,"<code>$1</code>").replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>");}
function renderMarkdown(source){return source.split(/\r?\n/).filter(line=>line&&!line.startsWith("- **")).map(line=>line.startsWith("# ")?`<h1>${inline(line.slice(2))}</h1>`:line.startsWith("## ")?`<h2>${inline(line.slice(3))}</h2>`:line.startsWith("> ")?`<p class="meta">${inline(line.slice(2))}</p>`:`<p>${inline(line)}</p>`).join("\n");}
function buildLegal({route,file,title,version,acceptLabel,buttonLabel}){const content=renderMarkdown(fs.readFileSync(path.join(root,"docs",file),"utf8")),dir=path.join(out,"termos",route);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,"index.html"),`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="index,follow"><title>${title} | Reforma Profissional</title><link rel="stylesheet" href="/public/legal/legal.css"></head><body data-version="${version}"><main class="legal-shell"><div class="brand"><img src="/assets/brand/reforma-profissional-mark.svg" alt=""><span>REFORMA PROFISSIONAL</span></div><div class="actions" aria-label="Controles"><button id="font-less" type="button">A−</button><button id="font-more" type="button">A+</button><button type="button" onclick="history.length>1?history.back():location.assign('/')">Voltar</button><button id="print" type="button">Imprimir</button><button id="download" type="button">Baixar</button></div><header><h1>${title}</h1><p class="meta"><span><strong>Versão:</strong> ${version}</span><span><strong>Data de vigência:</strong> 21/09/2026</span></p></header>${content}<section class="accept"><label><input id="legal-accept" type="checkbox"><span>${acceptLabel}</span></label><button id="legal-continue" type="button" disabled>${buttonLabel}</button><p class="status">O aceite eletrônico é registrado pela Plataforma e vinculado à versão vigente deste documento.</p></section></main><script src="/public/legal/legal.js" defer></script></body></html>`);}
buildLegal({route:"cliente",file:"customer-service-terms-v1.md",title:"Termos de Contratação do Cliente",version:"customer-service-terms-v1",acceptLabel:"LI E ACEITO OS TERMOS DE CONTRATAÇÃO DA REFORMA PROFISSIONAL",buttonLabel:"ACEITAR E CONTINUAR"});
buildLegal({route:"prestador",file:"provider-service-agreement-v1.md",title:"Contrato de Intermediação — Prestador",version:"provider-service-agreement-v1",acceptLabel:"DECLARO QUE LI INTEGRALMENTE E ACEITO O CONTRATO DE INTERMEDIAÇÃO/PRESTAÇÃO DE SERVIÇOS E AS REGRAS OPERACIONAIS DA REFORMA PROFISSIONAL.",buttonLabel:"ACEITAR CONTRATO E CONTINUAR"});
const app=require(path.join(root,"config","app-config"));
const association=path.join(out,".well-known","apple-app-site-association");
fs.writeFileSync(association,fs.readFileSync(association,"utf8").replace("APP_BUNDLE_ID",app.iosBundleId));
console.log(`Web build ready: ${out} (release ${release})`);
