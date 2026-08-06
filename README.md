# Treenvite

Plataforma full-stack para gestionar eventos e invitados en una tabla o árbol visual de relaciones.

## Arquitectura

- `backend/`: NestJS, TypeORM y MySQL. Es la única fuente de verdad para cuentas, eventos, permisos e invitados.
- `frontend/`: Vue 3, Vue Router, Pinia, TailwindCSS y DaisyUI.

No existe configuración de hosting en el repositorio. Frontend y API están preparados para ejecutarse en subdominios HTTPS del mismo dominio registrable.

## Backend

1. Copia `backend/.env.example` a `backend/.env` y configura MySQL mediante `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` y `DB_PASSWORD`, además de los secretos, Google y SMTP. El servidor SMTP utilizado (`mail.enriquemarin.xyz`) es un servicio independiente desplegado en este mismo VPS.
2. Instala y arranca:

```bash
cd backend
yarn
yarn start:dev
```

La API queda en `http://localhost:3000/api/v1` y Swagger en `http://localhost:3000/api/docs`. TypeORM usa `synchronize: true`; no existen migraciones y el esquema se ajusta automáticamente al iniciar. Usa una base respaldada al cambiar entidades.

Verificación:

```bash
yarn build
yarn test --runInBand
TEST_DB_HOST=127.0.0.1 TEST_DB_PORT=3306 TEST_DB_NAME=treenvite_test TEST_DB_USER=treenvite TEST_DB_PASSWORD=... yarn test:e2e
```

## Frontend

1. Copia `frontend/.env.example` a `frontend/.env`.
2. Instala y arranca:

```bash
cd frontend
yarn
yarn dev
```

En desarrollo, Vite redirige `/api` a `http://localhost:3000`. Para otro dominio configura `VITE_API_URL` con la URL completa terminada en `/api/v1`.

Verificación:

```bash
yarn build
yarn test
```

## Permisos

- `owner`: evento, invitados, colaboradores y códigos temporales.
- `editor`: edita evento e invitados.
- `viewer`: consulta y exporta.

El acceso por código requiere una cuenta y genera un permiso temporal; una invitación por correo crea acceso permanente al aceptarse.
