"use strict";
const escape=value=>`"${String(value??"").replaceAll('"','""')}"`;
function mapOrder(order){return{tipo:"Venda",ordem:order.orderId,protocolo:order.protocol,cliente:order.customerId,totalCentavos:order.pricingSnapshot?.customerPriceCents||0};}function mapProviderPayout(order){return{tipo:"Conta a Pagar",ordem:order.orderId,prestador:order.providerId,totalCentavos:order.pricingSnapshot?.providerTotalPayoutCents||0};}function exportCsv(rows){if(!rows.length)return"";const headers=Object.keys(rows[0]);return[headers.map(escape).join(","),...rows.map(row=>headers.map(h=>escape(row[h])).join(","))].join("\n");}
module.exports={mapOrder,mapProviderPayout,exportCsv};
