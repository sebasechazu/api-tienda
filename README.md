# API Tienda 

> API REST para gestión de usuarios de una tienda, **sin necesidad de base de datos real**. Ideal para pruebas, desarrollo rápido o entornos educativos.

---

## 🚀 Características principales
- Registro de usuarios
- Login de usuarios (con generación de JWT)
- Consulta de usuarios (individual y listado)
- Actualización de datos de usuario
- Middleware de autenticación por JWT
- **Base de datos simulada en memoria** (los datos se pierden al reiniciar el servidor)

---

## 📚 Endpoints disponibles

> Todas las rutas están bajo el prefijo `/api`

### ➕ Registrar usuario
- **POST** `/api/register`
- Cuerpo JSON:
```json
{
  "name": "Juan",
  "surname": "Pérez",
  "nickname": "juanp",
  "email": "juan@demo.com",
  "password": "123456"
}
```

### 🔑 Login de usuario
- **POST** `/api/login`
- Cuerpo JSON:
```json
{
  "email": "juan@demo.com",
  "password": "123456"
}
```
- Respuesta:
```json
{
  "token": "..."
}
```

### 👥 Obtener todos los usuarios
- **GET** `/api/users`
- Requiere header: `Authorization: Bearer <token>`

### 👤 Obtener usuario por ID
- **GET** `/api/user/:id`
- Requiere header: `Authorization: Bearer <token>`

### ✏️ Actualizar usuario
- **PUT** `/api/update-user/:id`
- Requiere header: `Authorization: Bearer <token>`
- Cuerpo JSON:
```json
{
  "name": "Nuevo Nombre",
  "surname": "Nuevo Apellido",
  "nickname": "nuevoNick"
}
```

---

## ⚠️ Notas importantes
- Los datos se almacenan solo en memoria, se pierden al reiniciar el servidor.
- El JWT se firma con la clave definida en `.env` (`JWT_SECRET`).
- No es necesario tener MongoDB instalado ni configurado.

---

## 🛠️ Ejecución rápida
1. Instala las dependencias:
   ```bash
   npm install
   ```
2. Crea un archivo `.env` en la raíz con:
   ```env
   JWT_SECRET=miclaveultrasecreta123
   PORT=3000
   ```
3. Inicia el servidor:
   ```bash
   node src/index.js
   ```

---

## 🧪 Pruebas rápidas con curl

Registrar usuario:
```bash
curl -X POST http://localhost:3000/api/register -H "Content-Type: application/json" -d '{"name":"Juan","surname":"Pérez","nickname":"juanp","email":"juan@demo.com","password":"123456"}'
```

Login:
```bash
curl -X POST http://localhost:3000/api/login -H "Content-Type: application/json" -d '{"email":"juan@demo.com","password":"123456"}'
```

---

## 👨‍💻 Autor
- Desarrollado por **sebasechazu**
