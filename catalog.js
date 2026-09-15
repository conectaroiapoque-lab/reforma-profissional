"use strict";

/** Catálogo oficial unificado de mão de obra para Belo Horizonte e RMBH. */
const TIER_PROVIDER_PERCENT = Object.freeze({ STANDARD: 60, TECHNICAL: 65, SPECIALIST: 70 });
const rawCatalog = [
  { code: "RP0001", name: "Instalação de tomada simples", category: "ELÉTRICA", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 15000 },
  { code: "RP0002", name: "Troca de tomada", category: "ELÉTRICA", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 17000 },
  { code: "RP0003", name: "Instalação de interruptor", category: "ELÉTRICA", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 19500 },
  { code: "RP0004", name: "Troca de interruptor", category: "ELÉTRICA", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 22000 },
  { code: "RP0005", name: "Instalação de luminária", category: "ELÉTRICA", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 24500 },
  { code: "RP0006", name: "Troca de luminária", category: "ELÉTRICA", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 27000 },
  { code: "RP0007", name: "Instalação de chuveiro elétrico", category: "ELÉTRICA", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 29500 },
  { code: "RP0008", name: "Troca de resistência de chuveiro", category: "ELÉTRICA", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 12000 },
  { code: "RP0009", name: "Instalação de ventilador de teto", category: "ELÉTRICA", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 14500 },
  { code: "RP0010", name: "Instalação de disjuntor", category: "ELÉTRICA", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 17000 },
  { code: "RP0011", name: "Troca de disjuntor", category: "ELÉTRICA", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 19500 },
  { code: "RP0012", name: "Reparo em curto-circuito", category: "ELÉTRICA", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 22000 },
  { code: "RP0013", name: "Revisão elétrica de circuito", category: "ELÉTRICA", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 24500 },
  { code: "RP0014", name: "Instalação de torneira", category: "HIDRÁULICA", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 27000 },
  { code: "RP0015", name: "Troca de torneira", category: "HIDRÁULICA", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 29500 },
  { code: "RP0016", name: "Reparo de torneira pingando", category: "HIDRÁULICA", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 12000 },
  { code: "RP0017", name: "Instalação de sifão", category: "HIDRÁULICA", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 14500 },
  { code: "RP0018", name: "Troca de sifão", category: "HIDRÁULICA", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 17000 },
  { code: "RP0019", name: "Desentupimento de pia", category: "HIDRÁULICA", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 19500 },
  { code: "RP0020", name: "Desentupimento de vaso sanitário", category: "HIDRÁULICA", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 22000 },
  { code: "RP0021", name: "Reparo em descarga", category: "HIDRÁULICA", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 24500 },
  { code: "RP0022", name: "Troca de mecanismo de descarga", category: "HIDRÁULICA", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 27000 },
  { code: "RP0023", name: "Reparo de vazamento aparente", category: "HIDRÁULICA", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 29500 },
  { code: "RP0024", name: "Instalação de filtro de água", category: "HIDRÁULICA", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 12000 },
  { code: "RP0025", name: "Instalação de máquina de lavar", category: "HIDRÁULICA", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 14500 },
  { code: "RP0026", name: "Troca de registro", category: "HIDRÁULICA", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 17000 },
  { code: "RP0027", name: "Instalação de vaso sanitário", category: "HIDRÁULICA", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 19500 },
  { code: "RP0028", name: "Vedação de vaso sanitário", category: "HIDRÁULICA", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 22000 },
  { code: "RP0029", name: "Instalação de gabinete de banheiro", category: "HIDRÁULICA", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 24500 },
  { code: "RP0030", name: "Instalação de suporte de TV", category: "MONTAGEM E INSTALAÇÃO", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 27000 },
  { code: "RP0031", name: "Instalação de prateleira", category: "MONTAGEM E INSTALAÇÃO", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 29500 },
  { code: "RP0032", name: "Instalação de varal", category: "MONTAGEM E INSTALAÇÃO", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 12000 },
  { code: "RP0033", name: "Instalação de cortina ou persiana", category: "MONTAGEM E INSTALAÇÃO", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 14500 },
  { code: "RP0034", name: "Instalação de espelho", category: "MONTAGEM E INSTALAÇÃO", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 17000 },
  { code: "RP0035", name: "Fixação de quadro", category: "MONTAGEM E INSTALAÇÃO", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 19500 },
  { code: "RP0036", name: "Montagem de mesa", category: "MONTAGEM E INSTALAÇÃO", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 22000 },
  { code: "RP0037", name: "Montagem de móvel pequeno", category: "MONTAGEM E INSTALAÇÃO", tier: "STANDARD", pricingMode: "FIXED", customerPriceCents: 18000 },
  { code: "RP0038", name: "Montagem de guarda-roupa", category: "MONTAGEM E INSTALAÇÃO", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 27000 },
  { code: "RP0039", name: "Montagem de cômoda", category: "MONTAGEM E INSTALAÇÃO", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 29500 },
  { code: "RP0040", name: "Regulagem de porta de armário", category: "MONTAGEM E INSTALAÇÃO", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 12000 },
  { code: "RP0041", name: "Troca de dobradiça", category: "MONTAGEM E INSTALAÇÃO", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 14500 },
  { code: "RP0042", name: "Troca de fechadura", category: "MONTAGEM E INSTALAÇÃO", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 17000 },
  { code: "RP0043", name: "Instalação de fechadura", category: "MONTAGEM E INSTALAÇÃO", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 19500 },
  { code: "RP0044", name: "Reparo em porta de madeira", category: "MONTAGEM E INSTALAÇÃO", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 22000 },
  { code: "RP0045", name: "Instalação de porta", category: "MONTAGEM E INSTALAÇÃO", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 24500 },
  { code: "RP0046", name: "Instalação de ar-condicionado split", category: "CLIMATIZAÇÃO E EQUIPAMENTOS", tier: "SPECIALIST", pricingMode: "FIXED", customerPriceCents: 71000 },
  { code: "RP0047", name: "Limpeza de ar-condicionado", category: "CLIMATIZAÇÃO E EQUIPAMENTOS", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 29500 },
  { code: "RP0048", name: "Manutenção de ar-condicionado", category: "CLIMATIZAÇÃO E EQUIPAMENTOS", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 12000 },
  { code: "RP0049", name: "Carga de gás de ar-condicionado", category: "CLIMATIZAÇÃO E EQUIPAMENTOS", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 14500 },
  { code: "RP0050", name: "Instalação de coifa", category: "CLIMATIZAÇÃO E EQUIPAMENTOS", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 17000 },
  { code: "RP0051", name: "Instalação de cooktop", category: "CLIMATIZAÇÃO E EQUIPAMENTOS", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 19500 },
  { code: "RP0052", name: "Instalação de forno elétrico", category: "CLIMATIZAÇÃO E EQUIPAMENTOS", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 22000 },
  { code: "RP0053", name: "Instalação de depurador", category: "CLIMATIZAÇÃO E EQUIPAMENTOS", tier: "TECHNICAL", pricingMode: "FIXED", customerPriceCents: 24500 },
  { code: "RP0054", name: "Pintura de parede interna", category: "PINTURA", tier: "STANDARD", pricingMode: "FIXED", customerPriceCents: 27000 },
  { code: "RP0055", name: "Pintura de teto", category: "PINTURA", tier: "STANDARD", pricingMode: "FIXED", customerPriceCents: 29500 },
  { code: "RP0056", name: "Pintura de porta", category: "PINTURA", tier: "STANDARD", pricingMode: "FIXED", customerPriceCents: 12000 },
  { code: "RP0057", name: "Pintura de grade", category: "PINTURA", tier: "STANDARD", pricingMode: "FIXED", customerPriceCents: 14500 },
  { code: "RP0058", name: "Pintura residencial completa", category: "PINTURA", tier: "STANDARD", pricingMode: "QUOTE", customerPriceCents: null },
  { code: "RP0059", name: "Pintura externa", category: "PINTURA", tier: "STANDARD", pricingMode: "QUOTE", customerPriceCents: null },
  { code: "RP0060", name: "Aplicação de textura", category: "PINTURA", tier: "STANDARD", pricingMode: "QUOTE", customerPriceCents: null },
  { code: "RP0061", name: "Correção de infiltração", category: "REFORMA E CONSTRUÇÃO", tier: "STANDARD", pricingMode: "QUOTE", customerPriceCents: null },
  { code: "RP0062", name: "Impermeabilização de área", category: "REFORMA E CONSTRUÇÃO", tier: "STANDARD", pricingMode: "QUOTE", customerPriceCents: null },
  { code: "RP0063", name: "Reparo de reboco", category: "REFORMA E CONSTRUÇÃO", tier: "STANDARD", pricingMode: "QUOTE", customerPriceCents: null },
  { code: "RP0064", name: "Assentamento de piso", category: "REFORMA E CONSTRUÇÃO", tier: "STANDARD", pricingMode: "QUOTE", customerPriceCents: null },
  { code: "RP0065", name: "Assentamento de porcelanato", category: "REFORMA E CONSTRUÇÃO", tier: "STANDARD", pricingMode: "QUOTE", customerPriceCents: null },
  { code: "RP0066", name: "Reforma de banheiro", category: "REFORMA E CONSTRUÇÃO", tier: "SPECIALIST", pricingMode: "QUOTE", customerPriceCents: null },
  { code: "RP0067", name: "Reforma de cozinha", category: "REFORMA E CONSTRUÇÃO", tier: "SPECIALIST", pricingMode: "QUOTE", customerPriceCents: null },
  { code: "RP0068", name: "Reforma de apartamento", category: "REFORMA E CONSTRUÇÃO", tier: "SPECIALIST", pricingMode: "QUOTE", customerPriceCents: null },
  { code: "RP0069", name: "Reforma de casa", category: "REFORMA E CONSTRUÇÃO", tier: "SPECIALIST", pricingMode: "QUOTE", customerPriceCents: null },
  { code: "RP0070", name: "Construção de parede de alvenaria", category: "REFORMA E CONSTRUÇÃO", tier: "SPECIALIST", pricingMode: "QUOTE", customerPriceCents: null },
  { code: "RP0071", name: "Demolição de parede", category: "REFORMA E CONSTRUÇÃO", tier: "SPECIALIST", pricingMode: "QUOTE", customerPriceCents: null },
  { code: "RP0072", name: "Execução de contrapiso", category: "REFORMA E CONSTRUÇÃO", tier: "SPECIALIST", pricingMode: "QUOTE", customerPriceCents: null },
  { code: "RP0073", name: "Instalação de revestimento", category: "REFORMA E CONSTRUÇÃO", tier: "SPECIALIST", pricingMode: "QUOTE", customerPriceCents: null },
  { code: "RP0074", name: "Reparo estrutural", category: "REFORMA E CONSTRUÇÃO", tier: "SPECIALIST", pricingMode: "QUOTE", customerPriceCents: null },
  { code: "RP0075", name: "Instalação de drywall", category: "REFORMA E CONSTRUÇÃO", tier: "SPECIALIST", pricingMode: "QUOTE", customerPriceCents: null },
  { code: "RP0076", name: "Forro de gesso", category: "REFORMA E CONSTRUÇÃO", tier: "SPECIALIST", pricingMode: "QUOTE", customerPriceCents: null },
  { code: "RP0077", name: "Sanca de gesso", category: "REFORMA E CONSTRUÇÃO", tier: "SPECIALIST", pricingMode: "QUOTE", customerPriceCents: null },
  { code: "RP0078", name: "Reparo em telhado", category: "REFORMA E CONSTRUÇÃO", tier: "SPECIALIST", pricingMode: "QUOTE", customerPriceCents: null },
  { code: "RP0079", name: "Troca de telhas", category: "REFORMA E CONSTRUÇÃO", tier: "SPECIALIST", pricingMode: "QUOTE", customerPriceCents: null },
  { code: "RP0080", name: "Instalação de calha", category: "REFORMA E CONSTRUÇÃO", tier: "SPECIALIST", pricingMode: "QUOTE", customerPriceCents: null },
  { code: "RP0081", name: "Limpeza de calha", category: "REFORMA E CONSTRUÇÃO", tier: "SPECIALIST", pricingMode: "QUOTE", customerPriceCents: null },
  { code: "RP0082", name: "Construção de telhado", category: "REFORMA E CONSTRUÇÃO", tier: "SPECIALIST", pricingMode: "QUOTE", customerPriceCents: null },
  { code: "RP0083", name: "Serviço de serralheria", category: "REFORMA E CONSTRUÇÃO", tier: "SPECIALIST", pricingMode: "QUOTE", customerPriceCents: null },
  { code: "RP0084", name: "Instalação de portão", category: "REFORMA E CONSTRUÇÃO", tier: "SPECIALIST", pricingMode: "QUOTE", customerPriceCents: null },
  { code: "RP0085", name: "Serviço de vidraçaria", category: "REFORMA E CONSTRUÇÃO", tier: "SPECIALIST", pricingMode: "QUOTE", customerPriceCents: null },
  { code: "RP0086", name: "Instalação de box", category: "REFORMA E CONSTRUÇÃO", tier: "SPECIALIST", pricingMode: "QUOTE", customerPriceCents: null },
  { code: "RP0087", name: "Paisagismo", category: "REFORMA E CONSTRUÇÃO", tier: "SPECIALIST", pricingMode: "QUOTE", customerPriceCents: null },
  { code: "RP0088", name: "Poda de árvore", category: "REFORMA E CONSTRUÇÃO", tier: "SPECIALIST", pricingMode: "QUOTE", customerPriceCents: null },
  { code: "RP0089", name: "Reforma geral sob medida", category: "REFORMA E CONSTRUÇÃO", tier: "SPECIALIST", pricingMode: "QUOTE", customerPriceCents: null }
];

const catalog = Object.freeze(rawCatalog.map(service => {
  const providerPercent = TIER_PROVIDER_PERCENT[service.tier];
  const providerPayoutCents = service.customerPriceCents === null ? null : Math.round(service.customerPriceCents * providerPercent / 100);
  return Object.freeze({
    ...service,
    providerPercent,
    platformPercent: 100 - providerPercent,
    providerPayoutCents,
    platformRevenueCents: service.customerPriceCents === null ? null : service.customerPriceCents - providerPayoutCents,
    materialsIncluded: false
  });
}));

function getServiceByCode(code) {
  return catalog.find(service => service.code === code) || null;
}

const api = Object.freeze({ catalog, getServiceByCode, TIER_PROVIDER_PERCENT });
if (typeof module !== "undefined" && module.exports) module.exports = api;
if (typeof globalThis !== "undefined") globalThis.ReformaProfissionalCatalog = api;
