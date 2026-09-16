"use strict";

const { deepFreeze } = require("./domain/financial-engine");

const CANDIDATE_VERSION = "RMBH-2026-09-v5-candidate";
const CANDIDATE_STATUS = "DRAFT";
const approved = false;
const effectiveDate = null;

// Deliberately isolated from catalog.js: this module is an analysis input, not a release catalogue.
const groups = [
  ["Encanador / Bombeiro hidráulico","TECHNICAL",[["Visita / diagnóstico","FIXED",9990,"visit"],["Instalação de torneira simples","FIXED",14990],["Troca de torneira","FIXED",14990],["Reparo torneira pingando","FIXED",12990],["Instalação/troca sifão","FIXED",11990],["Reparo descarga","FIXED",15990],["Troca mecanismo descarga","FIXED",18990],["Desentupimento simples pia/ralo","FIXED",19990],["Desentupimento simples vaso","FIXED",22990],["Vazamento aparente","FIXED",21990],["Filtro/purificador","FIXED",11990],["Máquina de lavar","FIXED",15990],["Troca registro acessível","FIXED",21990],["Instalação vaso sanitário","FIXED",29990],["Vazamento embutido","QUOTE",null],["Caça-vazamento","QUOTE",null],["Alteração de tubulação","QUOTE",null]]],
  ["Eletricista","TECHNICAL",[["Visita / diagnóstico","FIXED",8990,"visit"],["Troca tomada","FIXED",11990],["Instalação tomada","FIXED",14990],["Troca interruptor","FIXED",10990],["Instalação interruptor","FIXED",13990],["Instalação luminária","FIXED",14990],["Instalação chuveiro elétrico","FIXED",14990],["Troca resistência","FIXED",9990],["Ventilador teto","FIXED",17990],["Troca disjuntor","FIXED",16990],["Instalação disjuntor","FROM",19990],["Curto circuito","QUOTE",null],["Novo circuito","QUOTE",null],["Quadro elétrico","QUOTE",null]]],
  ["Pedreiro de Acabamento/Alvenaria","STANDARD",[["Visita técnica","FIXED",9990,"visit"],["Pequeno reparo até 2h","FROM",19990],["Cerâmica","FROM",4990,"m2"],["Alvenaria","FROM",5990,"m2"],["Porcelanato","QUOTE",null],["Reboco","QUOTE",null],["Contrapiso","QUOTE",null],["Revestimento","QUOTE",null],["Demolição","QUOTE",null],["Reforma banheiro","QUOTE",null],["Reforma cozinha","QUOTE",null],["Reforma casa/apartamento","QUOTE",null]]],
  ["Reparo e instalação de Ar-Condicionado","SPECIALIST",[["Higienização split","FIXED",24990],["Manutenção preventiva","FIXED",24990],["Diagnóstico/corretiva","FROM",29990],["Instalação split 9.000 a 12.000 BTU","FIXED",64990],["Split infraestrutura nova","QUOTE",null],["Split acima de 12.000 BTU","QUOTE",null],["Carga de gás","QUOTE",null],["Vazamento refrigerante","QUOTE",null],["Desinstalação","FROM",29990]]],
  ["Marido de Aluguel","STANDARD",[["Quadro","FIXED",7990],["Prateleira","FIXED",11990],["Varal","FIXED",11990],["Cortina/persiana","FIXED",11990],["Espelho","FIXED",13990],["Suporte TV","FIXED",15990],["Pacote até 2h","PACKAGE",24990],["Pacote até 4h","PACKAGE",39990]]],
  ["Gesseiro/Drywall","TECHNICAL",[["Visita técnica","FIXED",9990],["Pequeno reparo","FROM",15990],["Forro","QUOTE",null],["Sanca","QUOTE",null],["Parede drywall","QUOTE",null],["Divisória","QUOTE",null]]],
  ["Marceneiro","TECHNICAL",[["Regulagem","FIXED",11990],["Dobradiça","FIXED",13990],["Instalação fechadura","FIXED",17990],["Reparo móvel","QUOTE",null],["Instalação porta interna","FIXED",44990],["Móvel planejado","QUOTE",null]]],
  ["Montador de móveis","STANDARD",[["Móvel pequeno","FIXED",14990],["Mesa","FIXED",17990],["Cômoda","FIXED",21990],["Guarda-roupa pequeno","FIXED",25990],["Guarda-roupa médio","FIXED",39990],["Guarda-roupa grande","FROM",49990]]],
  ["Vidraceiro","SPECIALIST",[["Vedação/silicone","FIXED",14990],["Regulagem box","FROM",19990],["Box","QUOTE",null],["Espelho grande","QUOTE",null],["Guarda-corpo","QUOTE",null]]],
  ["Instalador de Esquadrias de Alumínio","SPECIALIST",[["Regulagem/reparo","FIXED",19990],["Janela","QUOTE",null],["Porta","QUOTE",null],["Sob medida","QUOTE",null]]],
  ["Telhadista/Telhadista Retrátil","SPECIALIST",[["Visita","FIXED",14990,"visit"],["Reparo/goteira","QUOTE",null],["Troca telha","QUOTE",null],["Calha","QUOTE",null],["Telhado novo","QUOTE",null],["Telhado retrátil","QUOTE",null]]],
  ["Serralheiro","SPECIALIST",[["Solda pontual","FIXED",19990],["Reparo portão","FIXED",19990],["Janela","QUOTE",null],["Porta","QUOTE",null],["Grade","QUOTE",null],["Guarda-corpo","QUOTE",null],["Corrimão","QUOTE",null],["Cobertura metálica","QUOTE",null]]],
  ["Instalador de Casa Inteligente","SPECIALIST",[["Configuração dispositivo","FIXED",14990],["Tomada inteligente","FIXED",17990],["Interruptor inteligente","FIXED",17990],["Alexa + automação básica","FIXED",24990],["Câmera Wi-Fi","FIXED",19990],["Fechadura inteligente","FROM",24990],["Projeto completo","QUOTE",null]]],
  ["Instalador de Energia Fotovoltaica/Energia Solar","SPECIALIST",[["Visita técnica","FIXED",14990,"visit"],["Limpeza até 10 módulos","FIXED",49990],["Manutenção","QUOTE",null],["Instalação","QUOTE",null],["Ampliação","QUOTE",null],["Projeto/homologação","QUOTE",null]]],
  ["Impermeabilizador","SPECIALIST",[["Diagnóstico","FIXED",14990],["Pequeno reparo","FROM",24990],["Laje","QUOTE",null],["Banheiro","QUOTE",null],["Manta","QUOTE",null],["Infiltração","QUOTE",null]]],
  ["Limpeza Pós Obra","STANDARD",[["Pequena","FROM",39990],["Até aproximadamente 60m2","FROM",59990],["Leve","FROM",1290,"m2"],["Média","FROM",1590,"m2"],["Pesada","FROM",1790,"m2"]]],
  ["Diarista","STANDARD",[["Diarista até 4h","FIXED",12990],["Diarista diária","FIXED",19990],["Limpeza pesada","FROM",24990]]]
];

const tierPercent = { STANDARD: 60, TECHNICAL: 65, SPECIALIST: 70 };
let sequence = 0;
const services = groups.flatMap(([professional, recommendedTier, rows]) => rows.map(([name, pricingMode, candidatePriceCents, flag]) => {
  sequence += 1;
  const packageHours = name.includes("4h") ? 4 : name.includes("2h") ? 2 : name === "Diarista diária" ? 8 : 0;
  const estimatedServiceMinutes = packageHours ? packageHours * 60 : pricingMode === "QUOTE" ? 0 : flag === "m2" ? 60 : candidatePriceCents >= 39990 ? 180 : candidatePriceCents >= 24990 ? 120 : 60;
  const estimatedTravelMinutes = pricingMode === "QUOTE" ? 0 : 30;
  const calculated = candidatePriceCents === null ? 0 : Math.round(candidatePriceCents * tierPercent[recommendedTier] / 100);
  const proposalPrice = sequence === 126 ? 17990 : sequence === 127 ? 24990 : null;
  const manualProposal = proposalPrice === null ? {} : {
    proposedCustomerPriceCents: proposalPrice,
    recommendedProviderPercent: 70,
    recommendedMaxRadiusKm: 3,
    reason: sequence === 126
      ? "Decisão comercial manual: melhor equilíbrio auditado na faixa aprovada de R$ 150,00 a R$ 200,00."
      : "Decisão comercial manual para análise da modalidade diária; depende de aprovação final e não substitui o preço candidato atual.",
    differenceCents: proposalPrice - candidatePriceCents,
    differencePercent: Math.round((proposalPrice - candidatePriceCents) * 10000 / candidatePriceCents) / 100,
    manualApprovalRequired: true,
    recurringServiceEligible: true
  };
  return {
    code: `V5C${String(sequence).padStart(3, "0")}`, professional, name, pricingMode, candidatePriceCents,
    unit: flag === "m2" ? "m2" : "service", creditableVisit: flag === "visit",
    recommendedTier, providerMinimumPayoutCents: candidatePriceCents === null ? 0 : Math.max(Math.round(calculated * 0.9), estimatedServiceMinutes >= 240 ? 12000 : 6000),
    estimatedServiceMinutes, estimatedTravelMinutes, estimatedTravelDistanceKm: pricingMode === "QUOTE" ? 0 : 12,
    ...manualProposal
  };
}));

const CANDIDATE_RELEASE = deepFreeze({ version: CANDIDATE_VERSION, status: CANDIDATE_STATUS, approved, effectiveDate });
module.exports = deepFreeze({ CANDIDATE_VERSION, CANDIDATE_STATUS, approved, effectiveDate, CANDIDATE_RELEASE, services });
