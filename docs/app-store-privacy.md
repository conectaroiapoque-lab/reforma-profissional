# Matriz App Privacy (rascunho para validação)

Preencher o questionário com base no comportamento efetivo da versão enviada e no backend de produção. Não há tracking publicitário no app mobile nesta preparação.

| DATA TYPE | PURPOSE | LINKED TO USER? | USED FOR TRACKING? | REQUIRED? | RETENTION |
|---|---|---:|---:|---|---|
| Contact Info | Conta, contato e execução do atendimento | Sim | Não | Para contratar/cadastrar | Durante a relação e prazos legais |
| Precise Location | Encontrar prestadores, distância e despacho consentido | Sim, quando vinculada à OS | Não | Opcional; endereço manual existe | Pedido: política operacional/até 90 dias no MVP; revisar legalmente |
| User Content (photos/documents) | Orçamento, evidência do serviço e cadastro do prestador | Sim | Não | Fotos do serviço opcionais; documentos conforme fluxo | Somente pelo período operacional/legal definido |
| Identifiers | Protocolo, conta e instalação/token push futuro | Sim | Não | Conforme recurso habilitado | Enquanto necessários à conta/entrega |
| Purchases | Pagamento de serviço físico, conciliação, garantia e repasse | Sim | Não | Quando houver contratação | Prazos fiscais, contábeis e legais |
| Diagnostics | Segurança e diagnóstico futuro minimizado | Pode ser | Não | Não nesta versão sem SDK | Curta, a definir antes de habilitar |

Google Ads e suas conversões atuais permanecem no Web; nenhum SDK móvel novo foi incluído. O Privacy Manifest declara apenas a ausência atual de tracking e não inventa categorias/APIs. Reavalie plugins e APIs exigidas após a instalação real do Capacitor.
