"use strict";

const { deepFreeze } = require("./domain/financial-engine");

const CANDIDATE_VERSION = "RMBH-2026-09-v6-candidate";
const CANDIDATE_STATUS = "DRAFT";
const approved = false;
const effectiveDate = null;

// Isolado do catalog.js (V4 de produção). Nada deste arquivo é publicado automaticamente.
const services = [
  ["V6C001", "Troca de torneira simples", "FIXED", 9990, { scope: "Ponto existente", materialsIncluded: false }],
  ["V6C002", "Instalação simples de torneira em ponto existente", "FIXED", 14990],
  ["V6C003", "Instalação de torneira com criação/adaptação hidráulica", "FROM", 19990, { maximumCandidatePriceCents: 24990 }],
  ["V6C004", "Desentupimento simples pia", "FIXED", 19990], ["V6C005", "Desentupimento completo pia", "QUOTE", null],
  ["V6C006", "Desentupimento simples esgoto", "FROM", 24990], ["V6C007", "Desentupimento completo esgoto", "QUOTE", null],
  ["V6C008", "Reparo vazamento interno simples", "FROM", 19990], ["V6C009", "Reparo vazamento externo completo", "QUOTE", null],
  ["V6C010", "Instalação de registro e mangueira GLP", "QUOTE", null, { qualifiedProfessionalRequired: true }],
  ["V6C011", "Instalação de esquadria de alumínio", "QUOTE", null, { variants: ["janela", "porta", "fechamento", "reparo"] }],
  ["V6C012", "Instalação de telhado retrátil", "QUOTE", null, { intake: ["dimensions", "material", "height", "access", "motorization", "drainage", "photos"] }],
  ["V6C013", "Diarista 4h — simulação A", "FIXED", 14990], ["V6C014", "Diarista 4h — simulação B", "FIXED", 17990], ["V6C015", "Diarista 4h — simulação C", "FIXED", 19990], ["V6C016", "Diarista 8h", "FIXED", 24990],
  ["V6C017", "Limpeza pós-obra", "FROM", 29990, { maximumCandidatePriceCents: 49990, variables: ["area", "complexity"] }],
  ["V6C018", "Limpeza evaporadora", "FROM", 14990], ["V6C019", "Limpeza condensadora", "FROM", 14990], ["V6C020", "Limpeza completa de ar-condicionado", "FROM", 24990],
  ["V6C021", "Manutenção evaporadora", "QUOTE", null], ["V6C022", "Manutenção condensadora", "QUOTE", null], ["V6C023", "Manutenção completa de ar-condicionado", "QUOTE", null], ["V6C024", "Manutenção corretiva de ar-condicionado", "QUOTE", null],
  ["V6C025", "Infraestrutura de linha frigorígena", "QUOTE", null, { priceVariables: ["meter", "diameter", "btu", "height", "drain", "electrical", "duct", "access"] }],
  ["V6C026", "Pacote simples de ar-condicionado", "QUOTE", null, { units: 1 }], ["V6C027", "Pacote duplo de ar-condicionado", "QUOTE", null, { units: 2 }], ["V6C028", "Pacote triplo de ar-condicionado", "QUOTE", null, { units: 3 }],
  ["V6C029", "Pintura simples", "QUOTE", null], ["V6C030", "Laqueamento", "QUOTE", null]
].map(([code, name, pricingMode, candidatePriceCents, details = {}]) => ({ code, name, pricingMode, candidatePriceCents, ...details }));

module.exports = deepFreeze({ CANDIDATE_VERSION, CANDIDATE_STATUS, approved, effectiveDate, services });
