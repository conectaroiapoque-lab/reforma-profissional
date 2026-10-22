"""Checks for the read-only reconciliation; no credentials or database needed."""
import csv, hashlib, json, pathlib, re, stat
R=pathlib.Path(__file__).resolve().parent
read=lambda p:json.loads((R/p).read_text())
source=read('source-public-reference.json');data=read('comparison-public.json');summary=data['summary'];validation=read('source-validation.json');baseline=read('baseline-manifest.json')
assert len(source)==len(data['services'])==242
assert len({r['source_code'] for r in source})==242
assert {r['source_code'] for r in source}=={f'RP-{n:04d}' for n in range(1,243)}
assert not validation['errors'] and not validation['duplicates'] and not validation['missing_expected_codes']
assert len(data['active_coverage'])==111 and len({a['active_code'] for a in data['active_coverage']})==111
assert sum(summary['source_classification_counts'].values())==242
assert sum(summary['active_coverage_counts'].values())==111
assert summary['source_assessment_required']==95
assert summary['approved_mappings']==0 and not summary['activated']
assert summary['price_comparable_pairs']==0
assert len(data['pairs'])==summary['candidate_relations']
index={s['source_code']:s for s in source}
for r in data['services']:
 assert not r['approved'] and r['decision']=='PENDENTE_REVISAO_HUMANA'
 if r['condition']=='Vistoria / orçamento':assert r['suggested_mode_restriction']=='EXIGE_VISTORIA_ORCAMENTO_NAO_CONVERTER_FIXED'
for p in data['pairs']:
 assert p['source_code'] in index and p['source_line']==index[p['source_code']]['source_line']
 assert p['source_p1_suggested_cents']==index[p['source_code']]['p1_reference_cents']
 assert p['price_delta_cents'] is None and not p['approved']
 assert p['active_unit_status']=='NOT_STRUCTURED'
 assert p['active_specialty_status']=='NOT_STRUCTURED_CATEGORY_IS_NOT_QUALIFICATION'
 if p['active_pricing_mode']=='QUOTE':assert 'PRESERVAR_QUOTE_ATIVO' in p['risks'] and p['active_public_price_cents'] is None
 if p['source_code']=='RP-0001':assert p['active_code']=='RP0030'
assert not any(p['source_code']=='RP-0001' and p['active_code']=='RP0001' for p in data['pairs'])
assert any(p['source_code']=='RP-0032' and p['active_code']=='RP0001' for p in data['pairs'])
private=read('private/source-internal-reference.json')
assert len(private)==242 and all(r['provider_payout_cents'] is None and r.get('provider_percentage_source_raw') and r.get('provider_percentage_calculation_base') is None for r in private)
concordance=read('source-concordance.json');assert concordance['shared_field_checks']==2904 and concordance['total_csv_field_checks_including_percentage']==3146 and concordance['csv_only_nonempty_records']==242
assert concordance['shared_results']=={'EXACT':1936,'REPRESENTATION_EQUIVALENT':966,'CONTENT_DIFFERENT':2}
assert len(read('private/source-concordance-content-differences.json'))==2
assert hashlib.sha256((R/'private/source-original.csv').read_bytes()).hexdigest()==concordance['csv_sha256']
assert hashlib.sha256((R/'private/source-original.txt').read_bytes()).hexdigest()==concordance['txt_sha256']
with (R/'private/source-original.csv').open(encoding='utf-8-sig',newline='') as f:
 original={row['Código']:row for row in csv.DictReader(f,delimiter=';')}
assert len(original)==242
for row in private:
 assert row['provider_percentage_source_raw']==original[row['source_code']]['% Prestador']
assert {(row['code'],row['field']) for row in read('private/source-concordance-content-differences.json')}=={('RP-0236','Preço 2 negociação (R$)'),('RP-0236','Preço 3 piso (R$)')}

forbidden=re.compile(r'(^p[23]_|_p[23]_|providerMinimumPayoutCents|financialRules|providerTier|commission|margin|payout_cents|provider_percentage_source|providerPercent|% Prestador)',re.I)
def public_keys(value):
 if isinstance(value,dict):
  for key,child in value.items():
   assert not forbidden.search(key),f'Internal field in public projection: {key}'
   public_keys(child)
 elif isinstance(value,list):
  for child in value:public_keys(child)
for name in ['source-public-reference.json','comparison-public.json','active-public.json','comparison-summary.json']:
 public_keys(read(name))
for name in ['comparison-source-242.csv','comparison-pairs.csv','new-service-candidates.csv','active-111-coverage.csv','conflicts-and-decisions.csv']:
 with (R/name).open(encoding='utf-8-sig',newline='') as f:
  reader=csv.DictReader(f);assert not any(forbidden.search(k) for k in reader.fieldnames)
  rows=list(reader)
  if name=='comparison-source-242.csv':assert len(rows)==242
  if name=='active-111-coverage.csv':assert len(rows)==111
assert stat.S_IMODE((R/'private').stat().st_mode)==0o700
for file in (R/'private').iterdir():assert stat.S_IMODE(file.stat().st_mode)==0o600
root=R.parent.parent
for file,expected in baseline['fileSha256'].items():
 current=hashlib.sha256((root/file).read_bytes()).hexdigest()
 if file in baseline.get('localRuntimeChanges',{}):
  change=baseline['localRuntimeChanges'][file];stage4=json.loads((root/'review/stage4-runtime-changes.json').read_text()) if (root/'review/stage4-runtime-changes.json').exists() else {}; authorized=stage4.get(file);assert change['baselineSha256']==expected and current!=expected;assert (change['currentSha256']==current) or (authorized and authorized['previousReviewSha256']==change['currentSha256'] and authorized['currentSha256']==current)
 else:assert current==expected,file+' changed'
for path in [root/'dist/review',root/'dist/private',root/'dist/docs/catalog-reconciliation-pending.md']:
 assert not path.exists(),str(path)+' leaked into public build'
print('PASS: 242 fontes, 111 ativos, integridade das relações, códigos exatos, preços públicos segregados, vistoria/QUOTE preservados, catálogos/contratos originais preservados, alterações locais documentadas, 3.146 campos CSV conferidos/capturados e ausência no build.')
