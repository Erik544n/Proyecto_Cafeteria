from passlib.context import CryptContext
from sqlalchemy import text
from app.database import engine

email = 'general@cafeteria.com'
password = 'General1234!'
nombre = 'Usuario'
apellido = 'General'
telefono = '0000000000'

pwd = CryptContext(schemes=['bcrypt'], deprecated='auto')
password_hash = pwd.hash(password)

with engine.begin() as conn:
    rol = conn.execute(text("SELECT rol_id FROM roles WHERE nombre='ADMIN' LIMIT 1")).fetchone()
    if rol is None:
        raise SystemExit('Rol ADMIN no encontrado')
    rol_id = rol[0]

    sql = text('''
    INSERT INTO usuarios (nombre, apellido, email, password_hash, telefono, rol_id, activo)
    VALUES (:nombre, :apellido, :email, :password_hash, :telefono, :rol_id, true)
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, rol_id = EXCLUDED.rol_id, activo = true
    RETURNING usuario_id
    ''')
    res = conn.execute(sql, {'nombre':nombre, 'apellido':apellido, 'email':email, 'password_hash':password_hash, 'telefono':telefono, 'rol_id':rol_id})
    uid = res.fetchone()[0]
    print('CREATED_OR_UPDATED_USER_ID', uid)
    print('EMAIL', email)
    print('PASSWORD', password)
