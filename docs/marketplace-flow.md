# Fluxo do marketplace

1. A solicitação cria uma `Order` idempotente em `REQUESTED`.
2. O pricing cria um snapshot imutável; a OS avança para `PRICING` e `SEARCHING_PROVIDER`.
3. Matching filtra aprovação, disponibilidade, documentação, suspensão, especialidade, serviço, agenda e raio antes do score 0–100.
4. Dispatch envia ondas limitadas: top 3, 5 seguintes, ampliação de raio e sugestão controlada de bônus. Recusar isoladamente não pune.
5. A reserva vincula um único prestador e torna reenvios com a mesma chave idempotentes; exclusão mútua real exige transação no backend.
6. Antes do aceite, a oportunidade contém apenas bairro/região, distância aproximada, serviço e remuneração. Contato e endereço completo só são liberados após aceite.
7. Execução, conclusão, validação, pagamento e repasse seguem transições explícitas, todas auditadas.

O prestador independente escolhe `OFFLINE`, `AVAILABLE`, `RESERVED`, `BUSY` ou `UNAVAILABLE`, pode recusar, atender clientes próprios e outras plataformas, sem jornada, exclusividade ou rastreamento permanente.

Combos previstos: Marido de Aluguel Express, Elétrica Pequenos Reparos, Hidráulica Pequenos Reparos e Montagem Express, com limite configurável de atividades por visita.
