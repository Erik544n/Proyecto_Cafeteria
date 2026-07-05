import urllib.request, urllib.parse, json
from urllib.error import HTTPError

base = 'http://127.0.0.1:8000'
email = 'general@cafeteria.com'
password = 'General1234!'

# Hacemos POST con query params (endpoint espera parámetros simples)
url = f"{base}/auth/login?email={urllib.parse.quote(email)}&password={urllib.parse.quote(password)}"
req = urllib.request.Request(url, data=b'', method='POST')
try:
    with urllib.request.urlopen(req, timeout=10) as r:
        body = r.read().decode()
        print('LOGIN_STATUS', r.status)
        print('LOGIN_BODY', body)
        data = json.loads(body)
        token = data.get('access_token')
except HTTPError as e:
    print('LOGIN_ERROR', e.code, e.read().decode())
    raise

# Probar endpoint protegido
headers = {'Authorization': f'Bearer {token}'}
for path in ['/admin/roles','/admin/usuarios','/mesero/productos']:
    req = urllib.request.Request(base+path, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            print(path, 'OK', r.status)
            txt = r.read().decode()
            print(txt[:200].replace('\n',' '))
    except HTTPError as e:
        print(path, 'ERROR', e.code, e.read().decode())

print('Done')
