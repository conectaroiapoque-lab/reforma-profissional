# Runbook operacional de lançamento — 21/09/2026

## Condição de abertura
Não iniciar operação até haver uma pessoa nominalmente escalada para atendimento, compliance/segurança e incidente técnico, com contatos fora deste repositório. A escala humana ainda não foi informada e é uma **pendência operacional**.

## Fluxos

| Evento | Ação operacional | Meta inicial condicionada à escala |
|---|---|---|
| Entrada de pedido | Conferir protocolo, endereço mínimo, serviço e aceite; nunca copiar documento privado para canal público. | Primeira triagem em até 30 min no horário oficialmente publicado. |
| Procura de prestador | Selecionar apenas PJ aprovado e com antecedentes validados; registrar designação. | Escalar ao responsável se não houver aceite em 30 min. |
| Orçamento | Prestador envia escopo, mão de obra, materiais, prazo e evidências; Plataforma revisa; Cliente recebe somente após aprovação. | Revisão humana antes do envio. |
| Reclamação | Abrir registro ligado à OS, preservar evidências, ouvir as partes e não reduzir direitos legais. | Acusar recebimento no mesmo turno operacional. |
| Cancelamento | Registrar solicitante, fase, custos comprovados e decisão; aplicar lei e contrato. | Revisão humana quando houver valor ou disputa. |
| Emergência | Orientar contato com 190, 192 ou 193 conforme risco; a plataforma não substitui emergência pública. | Imediato. |
| Fraude | Suspender ação de risco, preservar log mínimo e encaminhar a segurança; sem banimento automático. | Revisão humana e direito de recurso. |
| Suporte | Usar somente canal oficial e protocolo; evitar dados sensíveis no WhatsApp. | Conforme escala publicada. |
| Indisponibilidade | Interromper novos pedidos se persistência/autenticação falhar, publicar aviso verdadeiro e registrar incidente. | Retomar apenas após criação/leitura e autorização serem verificadas. |

## Gate diário
Verificar criação/leitura de pedido, storage privado, sessões/RBAC, fila de compliance, gateway desativado sem credenciais, alertas, backup mais recente e WhatsApp `5531990102500`. Não simular pagamento nem designação.
