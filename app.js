"use strict";

const WHATSAPP_NUMBER = "553125102500";
const WHATSAPP_MESSAGE = "Olá, vim pelo app Reforma Profissional e quero solicitar um serviço.";
const STORAGE_KEY = "reforma-profissional-solicitacoes";
const CURRENT_KEY = "reforma-profissional-protocolo-atual";

const popularServices = ["Marido de Aluguel","Eletricista","Encanador / Bombeiro Hidráulico","Pintor","Pedreiro","Montador de Móveis","Instalador","Técnico de Ar-Condicionado","Gesseiro","Serralheiro","Vidraceiro","Jardineiro","Telhadista","Reforma Geral"];
const commonProblems = ["Chuveiro queimado","Tomada sem funcionar","Disjuntor desarmando","Vazamento de água","Torneira pingando","Descarga com defeito","Infiltração na parede","Pintura de parede","Montagem de guarda-roupa","Instalação de suporte de TV","Instalação de ventilador","Troca de fechadura","Reparo em porta","Limpeza ou instalação de ar-condicionado","Conserto de telhado"];
const constructionServices = ["Reforma de banheiro","Reforma de cozinha","Reforma de apartamento","Reforma de casa","Alvenaria","Reboco","Contrapiso","Assentamento de piso","Assentamento de porcelanato","Revestimento de parede","Gesso e drywall","Forro de gesso","Pintura interna","Pintura externa","Textura","Impermeabilização","Telhado","Calha","Elétrica residencial","Hidráulica residencial","Acabamento"];
const serviceTypes = ["Elétrica","Hidráulica","Pintura","Montagem","Instalação","Reparo urgente","Reforma","Outro"];
const urgencies = ["Agora","Hoje","Amanhã","Agendar"];
const statuses = ["Solicitação recebida","Buscando profissional","Profissional designado","Profissional a caminho","Chegou ao local","Serviço em andamento","Serviço finalizado"];
const providers = [
  {name:"João Técnico",specialty:"Marido de aluguel",rating:"4.9",jobs:328,experience:"8 anos",initials:"JT"},
  {name:"Carlos Eletricista",specialty:"Elétrica",rating:"4.8",jobs:241,experience:"7 anos",initials:"CE"},
  {name:"Marcelo Hidráulico",specialty:"Hidráulica",rating:"4.9",jobs:296,experience:"9 anos",initials:"MH"},
  {name:"Paulo Pintor",specialty:"Pintura",rating:"4.7",jobs:184,experience:"6 anos",initials:"PP"}
];
const assistantData = {
  "Minha tomada não funciona":["Elétrica","Parece ser um serviço elétrico. Um eletricista pode verificar a tomada e a rede com segurança."],
  "Vazamento de água":["Hidráulica","Parece ser um serviço hidráulico. Podemos enviar um profissional para avaliar."],
  "Preciso pintar":["Pintura","Um pintor poderá avaliar a superfície e indicar o melhor acabamento."],
  "Quero montar móvel":["Montagem","Um montador de móveis é o profissional indicado para realizar o serviço com segurança."],
  "Preciso instalar algo":["Instalação","Vamos direcionar um instalador de acordo com o item e o local."],
  "Preciso de reparo urgente":["Reparo urgente","Entendido. Vamos priorizar a busca por um profissional disponível agora."],
  "Quero orçamento":["Reforma","Podemos agendar uma avaliação para preparar um orçamento transparente antes da execução."],
  "Não sei qual serviço escolher":["Outro","Sem problema. Descreva o que precisa e nossa equipe direcionará o especialista ideal."]
};
const icons = ["🧰","⚡","💧","🖌️","🧱","🪛","🔩","❄️","◻️","⚙️","◇","🌿","🏠","🏗️"];
let selectedService = "";
let selectedUrgency = "";
let currentStep = 1;
let assistantSelection = null;

const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
const escapeHtml = value => String(value ?? "").replace(/[&<>'"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));
const whatsappUrl = message => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
const getRequests = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; } };
const saveRequests = requests => localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
const showToast = message => { const toast=$("#toast"); toast.textContent=message; toast.classList.add("show"); setTimeout(()=>toast.classList.remove("show"),2600); };

function renderStaticContent(){
  const trust=["Profissionais verificados","Atendimento rápido","Segurança para o cliente","Orçamento transparente","Acompanhamento em tempo real","Suporte via WhatsApp"];
  const trustIcons=["✓","⚡","🛡️","▤","⌖","💬"];
  $(".trust-strip").innerHTML=trust.map((item,i)=>`<div class="trust-item"><i>${trustIcons[i]}</i><span>${item}</span></div>`).join("");
  $("#popular-services").innerHTML=popularServices.map((item,i)=>`<button class="service-card" data-service="${escapeHtml(item)}"><i>${icons[i]}</i><b>${escapeHtml(item)}</b><span>→</span></button>`).join("");
  const chips=items=>items.map(item=>`<button class="chip" data-service="${escapeHtml(item)}">${escapeHtml(item)}</button>`).join("");
  $("#common-problems").innerHTML=chips(commonProblems);
  $("#construction-services").innerHTML=chips(constructionServices);
  $("#service-types").innerHTML=serviceTypes.map(item=>`<button type="button" class="choice" data-type="${item}">${item}</button>`).join("");
  $("#urgency-options").innerHTML=urgencies.map(item=>`<button type="button" class="choice" data-urgency="${item}">${item}</button>`).join("");
  $("#assistant-options").innerHTML=Object.keys(assistantData).map(item=>`<button type="button" data-assistant="${item}">${item}</button>`).join("");
  $("#safety-list").innerHTML=["Profissional identificado","Acompanhamento pelo app","Atendimento registrado","Suporte via WhatsApp","Orçamento antes da execução","Avaliação após o serviço"].map(item=>`<div class="safety-item"><span>✓</span>${item}</div>`).join("");
  $$(".whatsapp-general").forEach(link=>link.href=whatsappUrl(WHATSAPP_MESSAGE));
  $("#year").textContent=new Date().getFullYear();
}

function showView(name){
  $$(".view").forEach(view=>view.classList.remove("active"));
  $(`#${name}-view`)?.classList.add("active");
  window.scrollTo({top:0,behavior:"smooth"});
  if(name==="tracking") renderTracking();
  if(name==="admin") renderAdmin();
}

function startRequest(service=""){
  selectedService=service;
  selectedUrgency="";
  currentStep=1;
  $("#request-form").reset();
  $$(".choice").forEach(button=>button.classList.remove("selected"));
  if(service){
    const inferred=inferType(service);
    selectType(inferred);
    $("#selected-detail").hidden=false;
    $("#selected-detail").innerHTML=`Selecionado: <strong>${escapeHtml(service)}</strong>`;
    $("#request-form [name=description]").value=service;
  }else $("#selected-detail").hidden=true;
  updateSteps();
  showView("request");
}

function inferType(service){
  const text=service.toLowerCase();
  if(/elétr|tomada|chuveiro|disjuntor|ventilador/.test(text)) return "Elétrica";
  if(/hidrául|água|torneira|vazamento|descarga/.test(text)) return "Hidráulica";
  if(/pint|textura/.test(text)) return "Pintura";
  if(/monta/.test(text)) return "Montagem";
  if(/instala/.test(text)) return "Instalação";
  if(/reforma|alvenaria|reboco|piso|gesso|telhado|calha|acabamento|impermeabil/.test(text)) return "Reforma";
  return "Outro";
}

function selectType(type){
  selectedService=selectedService || type;
  $$("[data-type]").forEach(button=>button.classList.toggle("selected",button.dataset.type===type));
}

function updateSteps(){
  $$(".form-step").forEach(step=>step.classList.toggle("active",Number(step.dataset.step)===currentStep));
  $$(".step").forEach((step,index)=>{ step.classList.toggle("active",index+1===currentStep); step.classList.toggle("done",index+1<currentStep); });
  $("#prev-step").hidden=currentStep===1;
  $("#next-step").hidden=currentStep===4;
  $("#submit-request").hidden=currentStep!==4;
  $("#request-form").scrollIntoView({behavior:"smooth",block:"start"});
}

function showFieldError(message,field){
  showToast(message);
  field?.focus();
  return false;
}

function validateStep(){
  if(currentStep===1 && !$("[data-type].selected")) return showFieldError("Escolha um tipo de serviço para continuar.",$("[data-type]"));
  if(currentStep===2){
    if(!$("[name=description]").value.trim()) return showFieldError("Descreva rapidamente o problema para continuar.",$("[name=description]"));
    if(!selectedUrgency) return showFieldError("Escolha a urgência para continuar.",$("[data-urgency]"));
    if(selectedUrgency==="Agendar" && !$("[name=schedule]").value) return showFieldError("Informe a data e o horário do agendamento.",$("[name=schedule]"));
  }
  if(currentStep===3){
    const fields={address:"endereço",number:"número",neighborhood:"bairro",city:"cidade"};
    for(const [name,label] of Object.entries(fields)){const field=$(`[name=${name}]`);if(!field.value.trim()) return showFieldError(`Informe o campo ${label} para continuar.`,field);}
  }
  if(currentStep===4){
    if(!$("[name=name]").value.trim()) return showFieldError("Informe seu nome para confirmar a solicitação.",$("[name=name]"));
    if(!$("[name=whatsapp]").value.trim()) return showFieldError("Informe seu WhatsApp para confirmar a solicitação.",$("[name=whatsapp]"));
    if(!$("[name=terms]").checked) return showFieldError("Aceite os termos para confirmar a solicitação.",$("[name=terms]"));
  }
  return true;
}

function generateProtocol(){
  const date=new Date();
  const stamp=`${String(date.getFullYear()).slice(-2)}${String(date.getMonth()+1).padStart(2,"0")}${String(date.getDate()).padStart(2,"0")}`;
  return `RP-${stamp}-${Math.floor(1000+Math.random()*9000)}`;
}

function submitRequest(event){
  event.preventDefault();
  const form=event.currentTarget;
  if(!validateStep()) return;
  if(!form.checkValidity()){form.reportValidity();showToast("Revise os campos obrigatórios destacados.");return;}
  const data=Object.fromEntries(new FormData(form).entries());
  delete data.photo;
  const protocol=generateProtocol();
  const request={...data,protocol,service:selectedService||$("[data-type].selected").dataset.type,type:$("[data-type].selected").dataset.type,urgency:selectedUrgency,status:statuses[0],statusIndex:0,provider:null,createdAt:new Date().toISOString()};
  const requests=getRequests(); requests.unshift(request); saveRequests(requests);
  localStorage.setItem(CURRENT_KEY,protocol);
  $("#success-protocol").textContent=protocol;
  $("#success-whatsapp").href=whatsappUrl(`Olá, quero acompanhar minha solicitação. Protocolo: ${protocol}`);
  showView("success");
}

function currentRequest(){
  const requests=getRequests();
  const protocol=localStorage.getItem(CURRENT_KEY);
  return requests.find(item=>item.protocol===protocol)||requests[0];
}

function renderTracking(){
  const request=currentRequest();
  $("#empty-tracking").hidden=Boolean(request);
  $("#tracking-content").hidden=!request;
  if(!request) return;
  $("#tracking-protocol").textContent=`Protocolo ${request.protocol}`;
  $("#map-address").textContent=`${request.address}, ${request.number} • ${request.neighborhood}`;
  $("#map-status").textContent=request.status;
  $("#status-timeline").innerHTML=statuses.map((status,index)=>`<li class="${index<request.statusIndex?'done':index===request.statusIndex?'current':''}">${status}</li>`).join("");
  const provider=request.provider||providers[0];
  $("#provider-avatar").textContent=provider.initials;
  $("#provider-name").textContent=provider.name;
  $("#provider-specialty").textContent=provider.specialty;
  $("#provider-rating").textContent=`★ ${provider.rating}`;
  $("#provider-jobs").textContent=provider.jobs;
  $("#provider-experience").textContent=provider.experience;
  const eta=new Date(Date.now()+25*60000);
  $("#provider-datetime").textContent=eta.toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});
  $("#provider-whatsapp").href=whatsappUrl(`Olá, você foi designado para um atendimento da Reforma Profissional. Protocolo: ${request.protocol}`);
  $("#notifications-list").innerHTML=statuses.slice(0,request.statusIndex+1).reverse().map((status,index)=>`<div class="notification-item"><i>✓</i><div><b>${status}</b><small>${index===0?' • atualização mais recente':''}</small></div></div>`).join("");
}

function renderAdmin(){
  const requests=getRequests();
  $("#metric-total").textContent=requests.length;
  $("#metric-new").textContent=requests.filter(item=>item.statusIndex<2).length;
  $("#metric-progress").textContent=requests.filter(item=>item.statusIndex>=2&&item.statusIndex<6).length;
  $("#metric-done").textContent=requests.filter(item=>item.statusIndex===6).length;
  $("#admin-list").innerHTML=requests.length?requests.map(request=>{
    const providerOptions=`<option value="">Selecionar prestador</option>`+providers.map(p=>`<option value="${p.name}" ${request.provider?.name===p.name?'selected':''}>${p.name} — ${p.specialty} — ${p.rating}</option>`).join("");
    return `<article class="admin-item" data-protocol="${request.protocol}"><div class="admin-item-head"><div><h3>${escapeHtml(request.name)}</h3><small>${escapeHtml(request.protocol)}</small></div><span class="status-pill">${escapeHtml(request.status)}</span></div><div class="admin-meta"><span>Serviço<b>${escapeHtml(request.service)}</b></span><span>WhatsApp<b>${escapeHtml(request.whatsapp)}</b></span><span>Urgência<b>${escapeHtml(request.urgency)}</b></span><span>Local<b>${escapeHtml(request.address)}, ${escapeHtml(request.number)} • ${escapeHtml(request.neighborhood)}</b></span><span>Prestador<b>${escapeHtml(request.provider?.name||"Não designado")}</b></span></div><div class="admin-actions"><select class="provider-select" aria-label="Selecionar prestador">${providerOptions}</select><button class="btn btn-light assign-provider">Designar prestador</button><button class="btn btn-light next-status">Alterar status →</button><a class="btn btn-whatsapp" href="https://wa.me/${String(request.whatsapp).replace(/\D/g,'')}?text=${encodeURIComponent(`Olá ${request.name}, falamos da Reforma Profissional sobre o protocolo ${request.protocol}.`)}" target="_blank" rel="noopener">Chamar cliente</a></div></article>`;
  }).join(""):`<div class="empty-state"><h3>Nenhuma solicitação registrada</h3><p>As novas solicitações aparecerão aqui.</p></div>`;
}

function updateRequest(protocol, callback){
  const requests=getRequests(); const index=requests.findIndex(item=>item.protocol===protocol);
  if(index<0)return; callback(requests[index]); saveRequests(requests); renderAdmin();
}

function bindEvents(){
  document.addEventListener("click",event=>{
    const viewButton=event.target.closest("[data-view]"); if(viewButton){showView(viewButton.dataset.view);return;}
    if(event.target.closest("[data-start]")){startRequest();return;}
    const service=event.target.closest("[data-service]"); if(service){startRequest(service.dataset.service);return;}
    const type=event.target.closest("[data-type]"); if(type){selectedService=type.dataset.type;selectType(type.dataset.type);return;}
    const urgency=event.target.closest("[data-urgency]"); if(urgency){selectedUrgency=urgency.dataset.urgency;$$('[data-urgency]').forEach(b=>b.classList.toggle('selected',b===urgency));$("#schedule-field").hidden=selectedUrgency!=="Agendar";return;}
    const assistant=event.target.closest("[data-assistant]"); if(assistant){assistantSelection=assistantData[assistant.dataset.assistant];$("#assistant-answer p").textContent=assistantSelection[1];$("#assistant-answer").hidden=false;return;}
    const item=event.target.closest(".admin-item");
    if(item&&event.target.closest(".assign-provider")){const name=$(".provider-select",item).value;if(!name){showToast("Selecione um prestador.");return;}updateRequest(item.dataset.protocol,r=>{r.provider=providers.find(p=>p.name===name);if(r.statusIndex<2){r.statusIndex=2;r.status=statuses[2];}});showToast("Prestador designado.");}
    if(item&&event.target.closest(".next-status")){updateRequest(item.dataset.protocol,r=>{r.statusIndex=Math.min(6,r.statusIndex+1);r.status=statuses[r.statusIndex];});showToast("Status atualizado.");}
  });
  $("#next-step").addEventListener("click",()=>{if(validateStep()&&currentStep<4){currentStep++;updateSteps();}});
  $("#prev-step").addEventListener("click",()=>{if(currentStep>1){currentStep--;updateSteps();}});
  $("#request-form").addEventListener("submit",submitRequest);
  $("#get-location").addEventListener("click",()=>{
    const status=$("#location-status");
    if(!navigator.geolocation){status.textContent="Geolocalização indisponível. Informe o endereço manualmente.";return;}
    status.textContent="Obtendo sua localização...";
    navigator.geolocation.getCurrentPosition(position=>{$("[name=latitude]").value=position.coords.latitude;$("[name=longitude]").value=position.coords.longitude;status.textContent=`✓ Localização capturada (${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}). Complete o endereço.`;},()=>{status.textContent="Não foi possível acessar sua localização. Informe o endereço manualmente.";});
  });
  $("#assistant-request").addEventListener("click",()=>{if(assistantSelection)startRequest(assistantSelection[0]);});
  $("#refresh-admin").addEventListener("click",()=>{renderAdmin();showToast("Painel atualizado.");});
  $("#share-tracking").addEventListener("click",async()=>{const request=currentRequest();const data={title:"Reforma Profissional",text:`Acompanhe a solicitação ${request?.protocol||''}`,url:location.href};try{if(navigator.share)await navigator.share(data);else{await navigator.clipboard.writeText(`${data.text} — ${data.url}`);showToast("Link copiado.");}}catch{/* Compartilhamento cancelado pelo usuário. */}});
}

renderStaticContent();
bindEvents();
if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));

// Futuro: conectar Google Maps ou Mapbox usando latitude/longitude já capturadas.
// Futuro: substituir o assistente simulado por IA real via API segura no backend.
// Futuro: registrar Push API e sincronizar notificações com o backend.
