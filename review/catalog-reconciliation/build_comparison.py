"""Generate review artifacts only; no catalogue import, database write or activation."""
import collections, csv, hashlib, json, pathlib, re, unicodedata
ROOT=pathlib.Path(__file__).resolve().parent
read=lambda name:json.loads((ROOT/name).read_text(encoding='utf8'))
def write_json(name,value):
 p=ROOT/name;p.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf8');p.chmod(0o600)
def write_csv(name,rows,columns):
 p=ROOT/name
 with p.open('w',newline='',encoding='utf-8-sig') as out:
  writer=csv.DictWriter(out,fieldnames=columns,extrasaction='ignore');writer.writeheader()
  for row in rows:
   safe={}
   for key in columns:
    value=row.get(key)
    if isinstance(value,(list,dict)):value=json.dumps(value,ensure_ascii=False)
    if isinstance(value,str) and value.startswith(('=','+','-','@')):value="'"+value
    safe[key]=value
   writer.writerow(safe)
 p.chmod(0o600)
def normalized_description(value):return ' '.join(unicodedata.normalize('NFC',value).casefold().split())
def money(cents):
 if cents is None:return 'Sem preço fechado'
 return 'R$ '+f'{cents/100:,.2f}'.replace(',','X').replace('.',',').replace('X','.')
def md(value):return str(value or '—').replace('|',' / ').replace('<','&lt;').replace('>','&gt;').replace('\n',' ')
source=read('source-public-reference.json');meta=read('source-validation.json');active_doc=read('active-public.json');active={s['code']:s for s in active_doc['services']};hints=read('candidate-decisions.json')
# Analyst-written associations: the number here selects an exact source ID only.
# Active IDs are explicitly listed in candidate-decisions.json. No hyphen removal or suffix join.
source_hints={f'RP-{int(n):04d}':h for n,h in hints.items()}
assert len(source)==242 and len(active)==111 and not meta['errors']
assert set(source_hints)<=set(s['source_code'] for s in source)
records=[];pairs=[]
for s in source:
 hint=source_hints.get(s['source_code']);relations=[]
 if hint:
  for code in hint['active']:
   a=active[code];relation=hint['relation'];exact=normalized_description(s['description'])==normalized_description(a['description'])
   classification=('DESCRICAO_IDENTICA_CANDIDATA' if exact else 'ATIVIDADE_CANDIDATA') if relation=='DIRECT' else 'CONFLITO_ESCOPO_NAO_EQUIVALENTE' if relation=='INCOMPATIBLE' else 'SOBREPOSICAO_OU_DESDOBRAMENTO'
   risks=['UNIDADE_ATIVA_NAO_ESTRUTURADA','ESPECIALIDADE_ATIVA_NAO_ESTRUTURADA','ESCOPO_E_QUALIFICACAO_EXIGEM_REVISAO','PRECOS_SUGERIDOS_NAO_AUTORIZADOS','IDENTIDADES_DISTINTAS']
   if relation=='SCOPE':risks+=['NAO_IGUALAR_PACOTE_COMPONENTE_OU_PORTE']
   if relation=='INCOMPATIBLE':risks+=['NAO_MAPEAR_COMO_EQUIVALENTE']
   if s['condition']=='Vistoria / orçamento':risks+=['FONTE_EXIGE_VISTORIA_ORCAMENTO']
   if a['pricing_mode']=='QUOTE':risks+=['PRESERVAR_QUOTE_ATIVO']
   if a['pricing_mode']=='FROM':risks+=['PRESERVAR_FROM_NAO_FECHAR_PRECO']
   if s['condition']=='Vistoria / orçamento' and a['pricing_mode']=='FIXED':risks+=['VISTORIA_NA_FONTE_VS_FIXED_ATIVO']
   if s['unit']!='serviço':risks+=['NAO_COMPARAR_PRECO_UNITARIO_COM_TOTAL']
   if re.search(r'\b(mínimo|até|por\s|a partir)',s['description'],re.I):risks+=['LIMITE_QUANTIDADE_DURACAO_OU_MINIMO_NO_NOME']
   if not a['scope']:risks+=['ESCOPO_ATIVO_NAO_DETALHADO']
   if a['public_price_cents'] is None:price_relation='ATIVO_QUOTE_SEM_PRECO_FECHADO'
   elif s['p1_reference_cents']==a['public_price_cents']:price_relation='VALOR_NOMINAL_IGUAL_SEM_EQUIVALENCIA_COMERCIAL'
   else:price_relation='VALOR_NOMINAL_DIFERENTE_SEM_DELTA_COMPARAVEL'
   if a.get('public_policy'):risks+=['POLITICA_PUBLICA_COM_OPCOES_NAO_E_PRECO_UNICO']
   pair={'source_code':s['source_code'],'source_line':s['source_line'],'source_description':s['description'],'source_specialty':s['specialty'],'source_unit':s['unit'],'source_condition':s['condition'],'source_scope':s['source_scope'],'source_p1_suggested_cents':s['p1_reference_cents'],'active_code':code,'active_catalog_version':active_doc['version'],'active_description':a['description'],'active_category':a['category'],'active_unit_status':'NOT_STRUCTURED','active_specialty_status':'NOT_STRUCTURED_CATEGORY_IS_NOT_QUALIFICATION','active_scope':a['scope'],'active_pricing_mode':a['pricing_mode'],'active_public_price_cents':a['public_price_cents'],'active_public_policy':a.get('public_policy'),'classification':classification,'price_comparison':price_relation,'price_delta_cents':None,'price_delta_reason':'Unidade, escopo e equivalência comercial ainda não aprovados','analyst_reason':hint['note'],'risks':risks,'decision':'PENDENTE_REVISAO_HUMANA','approved':False}
   relations.append(pair);pairs.append(pair)
  relation_class='DESCRICAO_IDENTICA_CANDIDATA' if any(p['classification']=='DESCRICAO_IDENTICA_CANDIDATA' for p in relations) else relations[0]['classification']
  note=hint['note']
 else:
  relation_class='NOVO_CANDIDATO_SEM_CONTRAPARTE_DIRETA';note='Não identificado item ativo de mesma atividade/escopo nesta revisão. Categoria ampla não prova equivalência; avaliar inclusão específica.'
  if s['specialty'] in ['Mestre de Obra','Engenheiro Civil / Estrutural','Arquiteto']:note+=' Visita, projeto, laudo, ART e supervisão não são execução de reparo estrutural.'
  if 'Inteligente' in s['specialty']:note+=' Automação não equivale à instalação elétrica convencional.'
  if 'Gás' in s['specialty']:note+=' Serviço de gás exige habilitação própria; não mapear a equipamento elétrico.'
  if 'Solar' in s['specialty'] or 'Fotovoltaica' in s['specialty']:note+=' Geração/aquecimento solar/eólico são sistemas especializados, não hidráulica ou elétrica convencionais.'
 record={**s,'classification':relation_class,'active_candidates':[p['active_code'] for p in relations],'candidate_relations':len(relations),'analyst_reason':note,'decision':'PENDENTE_REVISAO_HUMANA','approved':False,'suggested_mode_restriction':'EXIGE_VISTORIA_ORCAMENTO_NAO_CONVERTER_FIXED' if s['condition']=='Vistoria / orçamento' else 'MODALIDADE_NAO_DECLARADA_TABELA_CONDICIONAL_NAO_PROVA_FIXED','unit_decision':'CONFIRMAR_COM_BASE_NO_ESCOPO_NAO_INFERIR_UNIDADE_ATIVA','provider_payout_status':'AMOUNT_UNDETERMINED_PERCENT_PRESENT_IN_PRIVATE_CSV'}
 records.append(record)
new=[r for r in records if not r['active_candidates']]
coverage=[]
for a in active.values():
 related=[p for p in pairs if p['active_code']==a['code']]
 positive=[p for p in related if p['classification'] in ['DESCRICAO_IDENTICA_CANDIDATA','ATIVIDADE_CANDIDATA']]
 coverage.append({'active_code':a['code'],'active_description':a['description'],'active_category':a['category'],'active_pricing_mode':a['pricing_mode'],'active_public_price_cents':a['public_price_cents'],'source_related_codes':[p['source_code'] for p in related],'direct_activity_candidates':[p['source_code'] for p in positive],'coverage_status':'CANDIDATO_DIRETO_NAO_APROVADO' if positive else 'APENAS_RELACAO_ESCOPO_OU_CONFLITO' if related else 'SEM_CONTRAPARTE_IDENTIFICADA_PRESERVAR_ATIVO','approved':False})
summary={'source_file':meta['source_file'],'source_sha256':meta['source_sha256'],'source_services':len(source),'active_services':len(active),'source_classification_counts':dict(collections.Counter(r['classification'] for r in records)),'candidate_relations':len(pairs),'active_coverage_counts':dict(collections.Counter(a['coverage_status'] for a in coverage)),'public_reference_comparison_counts':dict(collections.Counter(p['price_comparison'] for p in pairs)),'source_assessment_required':sum(r['condition']=='Vistoria / orçamento' for r in records),'source_assessment_vs_active_fixed_pairs':sum('VISTORIA_NA_FONTE_VS_FIXED_ATIVO' in p['risks'] for p in pairs),'existing_quote_relations':sum(p['active_pricing_mode']=='QUOTE' for p in pairs),'price_comparable_pairs':0,'approved_mappings':0,'activated':False,'all_242_require_human_review':True,'classification_method':'Analyst-curated content candidates; exact labels denote description only, never commercial equivalence. No numeric-code join.'}
write_json('comparison-summary.json',summary);write_json('comparison-public.json',{'summary':summary,'services':records,'pairs':pairs,'active_coverage':coverage})
source_cols=['source_code','source_line','specialty','description','unit','condition','p1_reference_cents','source_scope','classification','active_candidates','analyst_reason','suggested_mode_restriction','unit_decision','decision','approved']
write_csv('comparison-source-242.csv',records,source_cols)
write_csv('comparison-pairs.csv',pairs,list(pairs[0]))
write_csv('new-service-candidates.csv',new,source_cols)
write_csv('active-111-coverage.csv',coverage,list(coverage[0]))
write_csv('conflicts-and-decisions.csv',pairs,['source_code','active_code','classification','risks','analyst_reason','price_comparison','decision','approved'])
# Private references remain distinct from all public projections. P3 is never provider payout.
inside={r['source_code']:r for r in read('private/source-internal-reference.json')};financial={r['active_code']:r['financial'] for r in read('private/active-internal-reference.json')}
write_json('private/comparison-internal.json',{'status':'REVIEW_ONLY_NOT_AUTHORIZED','warning':'P2 negotiation reference, P3 confidential commercial floor. Neither defines provider payout. Original CSV provider percentage is preserved separately; its calculation base is not stated and no payout amount is computed. No live financial rules changed.','records':[{'source_code':r['source_code'],'source_internal':inside[r['source_code']],'active_financial_candidates':[{'active_code':code,'existing_internal_config':financial[code]} for code in r['active_candidates']],'source_provider_payout':None,'source_payout_status':'AMOUNT_UNDETERMINED_CALCULATION_BASE_NOT_STATED','decision':'PENDING_SEPARATE_FINANCIAL_REVIEW'} for r in records]})
class_labels={'DESCRICAO_IDENTICA_CANDIDATA':'Descrição idêntica; candidato, sem equivalência aprovada','ATIVIDADE_CANDIDATA':'Atividade relacionada; conferir escopo/unidade','SOBREPOSICAO_OU_DESDOBRAMENTO':'Sobreposição, pacote, componente ou desdobramento','CONFLITO_ESCOPO_NAO_EQUIVALENTE':'Escopo/operação incompatível; não equivalente','NOVO_CANDIDATO_SEM_CONTRAPARTE_DIRETA':'Novo candidato, sem contraparte direta identificada'}
lines=['# Comparação de referência: 242 serviços × 111 ativos','','**Somente revisão. Nenhum preço, mapeamento ou migração foi aprovado/ativado.** Os preços P1 da fonte são sugestões, não cotações confirmadas. Este relatório contém apenas preço público/referencial P1; negociação, piso comercial e dados financeiros internos estão segregados.','','Fonte primária CSV original: `'+meta['source_file']+'`; SHA-256 `'+meta['source_sha256']+'`. O TXT anterior foi conferido contra o CSV: há duas divergências internas em RP-0236 (P2/P3), além da omissão de % Prestador nas 242 linhas. A revisão anterior analisou o TXT, sem realizar conversão do CSV. Consulte source-concordance-report.md para a conferência de todos os campos. Foram verificados 242 códigos únicos, UTF-8, sem duplicatas, lacunas ou campos/valores inválidos na estrutura esperada. Nenhum site de concorrente foi consultado e suas referências não foram validadas.','','## Resultado por serviço da fonte','', '| Classificação | Quantidade |','| --- | ---: |']
for cls,n in summary['source_classification_counts'].items():lines.append(f'| {class_labels[cls]} | {n} |')
lines+=['',f"Total: **242**. Relações analíticas: **{len(pairs)}** (um serviço pode ter mais de um candidato). Aprovações: **0**. Todos os 242 serviços exigem revisão antes de implantação.",'','## Restrições e conflitos','', '- Os 95 registros com condição “Vistoria / orçamento” continuam dependentes de avaliação, mesmo tendo P1 numérico. Os 147 com “Tabela sujeita ao escopo” não declaram FIXED.','- Os 111 ativos não têm unidade nem especialidade técnica estruturadas. Categoria comercial não é habilitação. Não se calculou percentual/delta de alteração de preço: nenhuma dupla possui equivalência comercial integral validada.','- Valores P1 e preços públicos ativos aparecem lado a lado como referências nominais; igualdade numérica não prova equivalência. Ausência de preço QUOTE não é zero.','- Nenhuma rotina remove hífens para unir identidades. `RP-0001` é suporte de TV e se relaciona por descrição com `RP0030`; `RP0001` é tomada simples e não foi associado a ele.','- V7L001 tem política pública com opções de preço; comparar somente o valor base sem essa política seria incompleto.','', '### Fonte com vistoria versus candidato ativo FIXED','', '| Fonte | Candidato ativo | Motivo |','| --- | --- | --- |']
for p in pairs:
 if 'VISTORIA_NA_FONTE_VS_FIXED_ATIVO' in p['risks']:lines.append(f"| `{p['source_code']}` | `{p['active_code']}` | {md(p['analyst_reason'])} |")
lines+=['','### Sobreposições internas da fonte a revisar','', '- `RP-0113` e `RP-0160`: reparo de estrutura de madeira de telhado sob especialidades diferentes; possível sobreposição, não duplicação confirmada.','- `RP-0089`, `RP-0090`, `RP-0091`: limpeza/higienização e manutenção preventiva podem conter atividades comuns; definir composição para não cobrar duas vezes.','- `RP-0008` e `RP-0150`: vedação genérica versus vedação de esquadrias; manter contexto/material até decisão humana.','- ART, laudos e projetos de engenharia/arquitetura não devem ser fundidos a visitas de mestre de obra nem a reparos de execução.','','## Matriz completa por serviço da fonte','','Preços nesta tabela são P1 **sugeridos da fonte**. Modalidade ativa não é alterada. “Novo candidato” indica ausência de contraparte de mesma atividade/escopo identificada nesta análise, não inclusão autorizada. A planilha de pares detalha cada campo e o preço ativo.','','| Código fonte | Serviço | Especialidade / unidade | Condição | P1 sugerido | IDs ativos relacionados | Classificação |','| --- | --- | --- | --- | ---: | --- | --- |']
for r in records:lines.append(f"| `{r['source_code']}` | {md(r['description'])} | {md(r['specialty'])} / {md(r['unit'])} | {md(r['condition'])} | {money(r['p1_reference_cents'])} | {', '.join('`'+c+'`' for c in r['active_candidates']) or '—'} | {class_labels[r['classification']]} |")
lines+=['','## Referências públicas por par — sem comparação comercial aprovada','','| Fonte | Ativo | Descrição ativa | Modo ativo | P1 sugerido fonte | Preço público ativo | Diferença/decisão de escopo |','| --- | --- | --- | --- | ---: | ---: | --- |']
for p in pairs:lines.append(f"| `{p['source_code']}` | `{p['active_code']}` | {md(p['active_description'])} | {p['active_pricing_mode']} | {money(p['source_p1_suggested_cents'])} | {money(p['active_public_price_cents'])} | {md(p['analyst_reason'])} |")
lines+=['','## Ativos sem contraparte identificada','','Preservar todos: ausência na fonte não autoriza remoção/desativação. Nos demais ativos, uma relação de escopo também não significa cobertura aprovada.','','| Código ativo | Serviço | Modo |','| --- | --- | --- |']
for a in coverage:
 if a['coverage_status']=='SEM_CONTRAPARTE_IDENTIFICADA_PRESERVAR_ATIVO':lines.append(f"| `{a['active_code']}` | {md(a['active_description'])} | {a['active_pricing_mode']} |")
lines+=['','## Artefatos e segregação','','- `comparison-source-242.csv`: todas as linhas da fonte, candidatos e pendências.','- `comparison-pairs.csv`: descrição, especialidade/categoria, unidade, escopo, modalidade, preços públicos e riscos por relação.','- `new-service-candidates.csv`: lista completa dos candidatos sem contraparte direta.','- `active-111-coverage.csv`: todos os ativos, inclusive sem contraparte, para preservação.','- `conflicts-and-decisions.csv`: conflitos e decisões pendentes.','- `private/comparison-internal.json`: referência administrativa confidencial, fora do build; não encaminhar a clientes nem publicar. O CSV contém percentual de prestador; ele está registrado como dado da fonte no relatório privado, separado de P3, sem base de cálculo presumida nem valor de repasse calculado.','', 'Consulte a proposta de migração em `docs/catalog-reconciliation-pending.md`. Todos os artefatos permanecem locais, sem commit/push.']
p=ROOT/'comparison-report.md';p.write_text('\n'.join(lines)+'\n',encoding='utf8');p.chmod(0o600)
print(json.dumps(summary,ensure_ascii=False,indent=2))
