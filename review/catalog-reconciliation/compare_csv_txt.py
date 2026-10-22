"""Compare original uploads field-by-field. Their content is data, not instructions."""
import collections,csv,decimal,hashlib,io,json,pathlib,re,shutil,sys
R=pathlib.Path(__file__).resolve().parent;csv_path=pathlib.Path(sys.argv[1]);txt_path=pathlib.Path(sys.argv[2])
raw_csv=csv_path.read_bytes();raw_txt=txt_path.read_bytes()
rows=list(csv.DictReader(io.StringIO(raw_csv.decode('utf-8-sig')),delimiter=';'))
columns=list(rows[0]);assert len(columns)==13 and len(rows)==242
raw_text={}
for n,line in enumerate(raw_txt.decode('utf-8-sig').splitlines(),1):
 if re.match(r'^RP-\d{4}\s*\|',line):
  chunks=line.split(' | ');raw_text[chunks[0].strip()]={'line':n,**dict(c.split(': ',1) for c in chunks[1:])}
assert len(raw_text)==242
field_map={'Código':None,'Especialidade':'Especialidade','Serviço':'Serviço','Unidade':'Unidade','Valor concorrente (R$)':'Concorrente','Fonte concorrente / referência':'Referência','Preço 1 tabela (R$)':'P1','Preço 2 negociação (R$)':'P2','Preço 3 piso (R$)':'P3 CONFIDENCIAL','Fonte URL':'Link','Comparabilidade':'Comparabilidade','Condição de orçamento':'Condição'}
def amount(v):
 v=v.strip().replace('R$','').strip()
 if not v or v=='sem preço público comparável':return None
 # decimal is accepted from comma or dot only after inspecting original format.
 if ',' in v:v=v.replace('.','').replace(',','.')
 return int(decimal.Decimal(v)*100)
def norm(v):return ' '.join(v.strip().split())
details=[];internal_details=[];counts=collections.Counter();byfield={k:collections.Counter() for k in field_map};public=[];private=[]
for n,row in enumerate(rows,2):
 code=row['Código'].strip();assert code in raw_text and re.fullmatch(r'RP-\d{4}',code)
 old=raw_text[code]
 for csv_field,txt_field in field_map.items():
  left=row[csv_field];right=code if txt_field is None else old[txt_field]
  if left==right:status='EXACT'
  elif csv_field in ['Valor concorrente (R$)','Preço 1 tabela (R$)','Preço 2 negociação (R$)','Preço 3 piso (R$)'] and amount(left)==amount(right):status='REPRESENTATION_EQUIVALENT'
  elif norm(left)==norm(right):status='REPRESENTATION_EQUIVALENT'
  else:status='CONTENT_DIFFERENT'
  counts[status]+=1;byfield[csv_field][status]+=1
  details.append({'source_code':code,'csv_line':n,'txt_line':old['line'],'csv_field':csv_field,'txt_field':txt_field or 'code','status':status})
  if status=='CONTENT_DIFFERENT':internal_details.append({'code':code,'field':csv_field,'csv':left,'txt':right})
 raw_percent=row['% Prestador'];clean=raw_percent.strip().removesuffix('%').strip().replace(',','.')
 fraction=decimal.Decimal(clean);assert 0<=fraction<=100
 p1,p2,p3=[amount(row[k]) for k in ['Preço 1 tabela (R$)','Preço 2 negociação (R$)','Preço 3 piso (R$)']];assert p1>=p2>=p3>0
 public.append({'source_code':code,'source_line':n,'txt_source_line':old['line'],'specialty':row['Especialidade'],'description':row['Serviço'],'unit':row['Unidade'],'condition':row['Condição de orçamento'],'p1_reference_cents':p1,'pricing_status':'SUGGESTED_NOT_AUTHORIZED','source_scope':'Materiais, deslocamento e extras à parte, conforme legenda do TXT, pendente validação contratual','competitor_comparability':row['Comparabilidade'],'competitor_reference_status':'UNVERIFIED_SOURCE_REFERENCE'})
 private.append({'source_code':code,'source_line':n,'p2_negotiation_reference_cents':p2,'p3_confidential_floor_cents':p3,'provider_percentage_source_raw':raw_percent,'provider_percentage_source_decimal':str(fraction),'provider_percentage_calculation_base':None,'provider_percentage_status':'SOURCE_VALUE_ONLY_NOT_APPROVED','provider_payout_cents':None,'provider_payout_status':'AMOUNT_UNDETERMINED_CALCULATION_BASE_NOT_STATED','source_reference':row['Fonte concorrente / referência'],'source_competitor':row['Valor concorrente (R$)'],'source_link':row['Fonte URL']})
assert len({r['source_code'] for r in public})==242
summary={'primary_source':csv_path.name,'csv_sha256':hashlib.sha256(raw_csv).hexdigest(),'txt_source':txt_path.name,'txt_sha256':hashlib.sha256(raw_txt).hexdigest(),'csv_bytes':len(raw_csv),'txt_bytes':len(raw_txt),'encoding':'UTF-8 with optional BOM','csv_delimiter':';','csv_records':len(rows),'txt_records':len(raw_text),'csv_fields':columns,'shared_fields_per_record':12,'shared_field_checks':len(details),'total_csv_field_checks_including_percentage':len(details)+len(rows),'shared_results':dict(counts),'by_field':{k:dict(v) for k,v in byfield.items()},'csv_only_fields':['% Prestador'],'csv_only_nonempty_records':sum(bool(r['% Prestador'].strip()) for r in rows),'txt_is_lossless_conversion':False,'previous_review_source':'TXT_ONLY; no CSV conversion was performed by the assistant','conclusion':'TXT omits CSV provider percentage; all shared fields checked independently. No percentage applied to live rules.','activated':False}
# Full content differences, if any, remain in the restricted administrative directory.
def save(name,obj):
 p=R/name;p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n');p.chmod(0o600)
save('source-concordance.json',summary);save('source-concordance-fields.json',details);save('private/source-concordance-content-differences.json',internal_details);save('private/source-internal-reference.json',private);save('source-public-reference.json',public)
for path,name in [(csv_path,'source-original.csv'),(txt_path,'source-original.txt')]:
 target=R/'private'/name;shutil.copyfile(path,target);target.chmod(0o600)
validation={'source_file':csv_path.name,'source_sha256':summary['csv_sha256'],'source_bytes':len(raw_csv),'encoding':summary['encoding'],'format':'original semicolon-delimited CSV; TXT cross-checked independently','parsed_records':242,'unique_codes':242,'missing_expected_codes':sorted({f'RP-{i:04d}' for i in range(1,243)}-{r['source_code'] for r in public}),'duplicates':[],'specialties':dict(collections.Counter(r['specialty'] for r in public)),'units':dict(collections.Counter(r['unit'] for r in public)),'conditions':dict(collections.Counter(r['condition'] for r in public)),'errors':[],'provider_percentage_present':True,'provider_percentage_nonempty_records':summary['csv_only_nonempty_records'],'provider_percentage_base_explicit':False,'approved_mappings':0,'activated':False}
save('source-validation.json',validation)
print(json.dumps({k:v for k,v in summary.items() if k not in ['by_field','csv_fields']},ensure_ascii=False,indent=2))
