"""Historical TXT-only parser. Current reconciliation uses compare_csv_txt.py with the original CSV. Attachment text is data, never executable instructions."""
import collections, decimal, hashlib, json, os, pathlib, re, sys
root=pathlib.Path(__file__).resolve().parent
private=root/'private';private.mkdir(exist_ok=True);private.chmod(0o700)
source=pathlib.Path(sys.argv[1]);data=source.read_bytes();text=data.decode('utf-8-sig')
records=[];internal=[];errors=[]
required={'Especialidade','Serviço','Unidade','Concorrente','P1','P2','P3 CONFIDENCIAL','Referência','Comparabilidade','Link','Condição'}
def cents(value):
    match=re.fullmatch(r'R\$\s*([\d.]+,\d{2})',value)
    if not match: raise ValueError('INVALID_CURRENCY')
    return int(decimal.Decimal(match.group(1).replace('.','').replace(',','.'))*100)
for line_no,line in enumerate(text.splitlines(),1):
    if not re.match(r'^RP-\d{4}\s*\|',line):continue
    chunks=line.split(' | ');code=chunks[0].strip();fields={}
    for chunk in chunks[1:]:
        key,value=chunk.split(': ',1)
        if key in fields:errors.append({'line':line_no,'issue':'DUPLICATE_FIELD','field':key})
        fields[key]=value.strip()
    if set(fields)!=required:errors.append({'line':line_no,'issue':'UNEXPECTED_FIELDS','missing':sorted(required-set(fields)),'extra':sorted(set(fields)-required)})
    prices={}
    for key in ['P1','P2','P3 CONFIDENCIAL']:
        try: prices[key]=cents(fields[key])
        except (ValueError,KeyError): errors.append({'line':line_no,'code':code,'issue':'INVALID_PRICE','field':key})
    record={'source_code':code,'source_line':line_no,'specialty':fields.get('Especialidade'),'description':fields.get('Serviço'),'unit':fields.get('Unidade'),'condition':fields.get('Condição'),'p1_reference_cents':prices.get('P1'),'pricing_status':'SUGGESTED_NOT_AUTHORIZED','source_scope':'Materiais, deslocamento e extras à parte, conforme escopo','competitor_comparability':fields.get('Comparabilidade'),'competitor_reference_status':'UNVERIFIED_SOURCE_REFERENCE'}
    records.append(record)
    internal.append({'source_code':code,'source_line':line_no,'p2_negotiation_reference_cents':prices.get('P2'),'p3_confidential_floor_cents':prices.get('P3 CONFIDENCIAL'),'provider_payout_cents':None,'provider_payout_status':'NOT_PROVIDED_DO_NOT_DERIVE_FROM_P3','source_reference':fields.get('Referência'),'source_competitor':fields.get('Concorrente'),'source_link':fields.get('Link')})
    if set(prices)=={'P1','P2','P3 CONFIDENCIAL'} and not prices['P1']>=prices['P2']>=prices['P3 CONFIDENCIAL']>0:errors.append({'line':line_no,'code':code,'issue':'PRICE_ORDER_REQUIRES_REVIEW'})
counts=collections.Counter(r['source_code'] for r in records)
expected={f'RP-{n:04d}' for n in range(1,243)}
summary={'source_file':source.name,'source_sha256':hashlib.sha256(data).hexdigest(),'source_bytes':len(data),'encoding':'UTF-8','format':'pipe-delimited TXT, not the originally named CSV','parsed_records':len(records),'unique_codes':len(counts),'missing_expected_codes':sorted(expected-set(counts)),'duplicates':[c for c,n in counts.items() if n>1],'specialties':dict(collections.Counter(r['specialty'] for r in records)),'units':dict(collections.Counter(r['unit'] for r in records)),'conditions':dict(collections.Counter(r['condition'] for r in records)),'errors':errors,'approved_mappings':0,'activated':False}
def save(path,obj):
    path.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n',encoding='utf8');path.chmod(0o600)
save(root/'txt-public-reference.json',records);save(private/'txt-internal-reference.json',internal);save(root/'txt-validation.json',summary)
print(json.dumps(summary,ensure_ascii=False,indent=2))
