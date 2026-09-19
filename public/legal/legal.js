"use strict";
const checkbox=document.querySelector("#legal-accept"),submit=document.querySelector("#legal-continue");
document.querySelector("#font-less").addEventListener("click",()=>{document.body.classList.remove("font-large");document.body.classList.add("font-small")});
document.querySelector("#font-more").addEventListener("click",()=>{document.body.classList.remove("font-small");document.body.classList.add("font-large")});
document.querySelector("#print").addEventListener("click",()=>window.print());
document.querySelector("#download").addEventListener("click",()=>{const copy=document.documentElement.cloneNode(true);copy.querySelector(".actions")?.remove();const blob=new Blob(["<!doctype html>\n"+copy.outerHTML],{type:"text/html;charset=utf-8"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`${document.body.dataset.version}.html`;a.click();URL.revokeObjectURL(a.href)});
checkbox.addEventListener("change",()=>{submit.disabled=!checkbox.checked});
submit.addEventListener("click",()=>{if(!checkbox.checked)return;const returnTo=new URLSearchParams(location.search).get("returnTo");if(returnTo?.startsWith("/")&&!returnTo.startsWith("//"))location.assign(returnTo);else history.length>1?history.back():location.assign("/")});
