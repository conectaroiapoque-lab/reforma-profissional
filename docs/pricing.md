# Pricing e integridade financeira

As faixas iniciais são `STANDARD` 60/40, `TECHNICAL` 65/35 e `SPECIALIST` 70/30. Acima de 70% exige aprovação administrativa explícita.

O snapshot registra banda de mercado, preço recomendado/máximo competitivo, piso do prestador, contribuição mínima, bônus de viagem/urgência/escassez, duração, ganho horário estimado, CAC, taxas, tributos, suporte, reservas, subsídios e demais custos. O resultado classifica mercado (`COMPETITIVE`, `ATTENTION`, `ABOVE_MARKET`) e margem (`VIABLE`, `LOW_MARGIN`, `UNVIABLE`).

`recommendPricingAdjustment()` nunca aplica preço ilimitado: recomenda manter, baixar/subir preço, subir repasse, adicionar bônus ou revisão manual. Bônus respeitam teto em centavos e percentual.

O ledger registra cobrança, obrigação do prestador, receita, taxa, imposto, bônus, reembolso, materiais e repasse. A reconciliação verifica recebido = destinações + saldo pendente. Este controle local é demonstrativo; fonte confiável e dupla entrada completa pertencem ao backend.
