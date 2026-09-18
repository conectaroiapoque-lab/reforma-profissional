"use strict";
const BRL_FORMATTER = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2, maximumFractionDigits: 2 });
function formatBRLFromCents(cents) { if (!Number.isInteger(cents)) throw new TypeError("INVALID_CENTS"); return BRL_FORMATTER.format(cents / 100); }
module.exports = Object.freeze({ BRL_FORMATTER, formatBRLFromCents });
