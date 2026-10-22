"""Browser smoke test against the explicit test fixture, never the production site.
Run after npm run build:web: python3 test-support/schedule-mobile.py
Requires playwright Python and Chromium (CHROMIUM_PATH may override the binary).
"""
import datetime
import os
import subprocess
import time
import urllib.request
from playwright.sync_api import sync_playwright

server = subprocess.Popen(['node', 'test-support/schedule-browser-server.js'], stdout=subprocess.DEVNULL)
try:
    for attempt in range(100):
        try:
            urllib.request.urlopen('http://127.0.0.1:8001/__test_sessions')
            break
        except OSError:
            time.sleep(.05)
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH', '/usr/bin/chromium'), args=['--no-sandbox'])
        for width in [390, 1280]:
            context = browser.new_context(viewport={'width': width, 'height': 900})
            context.route('**/*', lambda route: route.continue_() if route.request.url.startswith('http://127.0.0.1:8001/') else route.abort())
            page = context.new_page()
            page.clock.install(time=datetime.datetime(2030, 1, 7, 12, tzinfo=datetime.timezone.utc))
            page.goto('http://127.0.0.1:8001/')
            sessions = page.evaluate("fetch('/__test_sessions').then(r=>r.json())")
            page.evaluate("s=>{sessionStorage.setItem('reforma-profissional-order-reference',JSON.stringify(s.order));sessionStorage.setItem('rp_provider_session',s.tokens.provider);sessionStorage.setItem('rp_admin_session',s.tokens.admin)}", sessions)
            page.get_by_role('button', name='Acompanhar serviço', exact=True).click()
            page.locator('#customer-agenda [data-refresh]').wait_for()
            page.locator('#customer-agenda [data-id]').first.wait_for()
            assert page.locator('#customer-agenda').inner_text().find('Aguardando confirmações') >= 0
            assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'), 'Customer overflow'
            page.screenshot(path=f'/tmp/reforma-agenda-customer-{width}.png', full_page=True)
            page.goto('http://127.0.0.1:8001/prestador/painel/')
            page.locator('#provider-agenda [data-id]').first.wait_for()
            assert page.locator('#provider-agenda').inner_text().find('Minha agenda') >= 0
            if width == 390:
                page.locator('#provider-agenda [data-action="accept"]').click()
                page.locator('#provider-agenda .badge').filter(has_text='Confirmado pelas partes').wait_for()
            assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'), 'Provider overflow'
            page.screenshot(path=f'/tmp/reforma-agenda-provider-{width}.png', full_page=True)
            page.goto('http://127.0.0.1:8001/admin/agenda/')
            page.locator('#cac-agenda [data-id]').first.wait_for()
            page.locator('[name="calendar-view"]').select_option('month')
            assert page.locator('.day').count() == 31
            assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'), 'CAC overflow'
            page.get_by_text('Regras e habilitações — configuração autorizada do CAC', exact=True).click()
            assert page.get_by_role('button', name='Registrar regra', exact=True).is_visible()
            form = page.locator('[data-form="rule"]')
            values = {'serviceCode': 'RP0001', 'mode': 'VISIT', 'visitMinutes': '60', 'travelMinutes': '30', 'holdMinutes': '1440', 'cancelBeforeMinutes': '60', 'source': 'TEST POLICY ONLY', 'reason': 'Teste de revisão administrativa'}
            for name, value in values.items():
                if name == 'mode':
                    form.locator('[name="mode"]').select_option(value)
                else:
                    form.locator('[name="' + name + '"]').fill(value)
            with page.expect_response(lambda response: response.url.endswith('/api/admin/agenda') and response.request.method == 'POST') as response_info:
                form.get_by_role('button', name='Registrar regra', exact=True).click()
            response = response_info.value
            assert response.status == 200
            assert isinstance(response.request.post_data_json.get('expectedRevision'), int)
            page.locator('#cac-agenda [data-message]').filter(has_text='Agenda atualizada.').wait_for()
            page.get_by_text('Regras e habilitações — configuração autorizada do CAC', exact=True).click()
            for name, value in values.items():
                control = page.locator('[data-form="rule"] [name="' + name + '"]')
                if name == 'mode':
                    control.select_option(value)
                else:
                    control.fill(value)
            page.evaluate("""async token => {
                const headers = {authorization: 'Bearer ' + token, 'content-type': 'application/json'};
                const state = await fetch('/api/admin/agenda', {headers}).then(r => r.json());
                const response = await fetch('/api/admin/agenda', {method: 'POST', headers, body: JSON.stringify({action: 'rule', expectedRevision: state.revision, serviceCode: 'RP0001', ...state.rules.RP0001, source: 'Alteração concorrente', reason: 'Teste em outra sessão'})});
                if (!response.ok) throw new Error('Fixture concurrent update failed');
            }""", sessions['tokens']['admin'])
            with page.expect_response(lambda response: response.url.endswith('/api/admin/agenda') and response.request.method == 'POST') as stale_response_info:
                page.locator('[data-form="rule"]').get_by_role('button', name='Registrar regra', exact=True).click()
            assert stale_response_info.value.status == 409
            page.locator('#cac-agenda [data-message]').filter(has_text='A configuração mudou desde sua leitura').wait_for()
            page.screenshot(path=f'/tmp/reforma-agenda-cac-{width}.png', full_page=True)
            context.close()
        browser.close()
    print('PASS: cliente, profissional, aceite real pela API de teste, CAC mensal, envio de revisão e rejeição 409 de edição desatualizada; 390 e 1280 px, sem overflow.')
finally:
    server.terminate()
    server.wait(timeout=5)
