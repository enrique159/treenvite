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

La API queda en `http://localhost:3000/api/v1`. La documentación pública para integraciones forma parte del frontend en `/documentacion/api`; Swagger se conserva únicamente para inspección interna durante desarrollo en `http://localhost:3000/api/internal-docs`. TypeORM usa `synchronize: true`; no existen migraciones y el esquema se ajusta automáticamente al iniciar. Usa una base respaldada al cambiar entidades.

Configura `API_TOKEN_PEPPER` con un valor aleatorio de al menos 32 caracteres antes de iniciar. Los propietarios pueden crear tokens ligados a un evento desde su pestaña **API**. Las integraciones usan `Authorization: Bearer tv_api_...` contra `/api/v1/integrations/guests`; los secretos se muestran una sola vez y están pensados exclusivamente para comunicación servidor a servidor.

Verificación:

```bash
yarn build
yarn test --runInBand
cp .env.test.example .env.test
# Edita .env.test con el usuario y contraseña de la base treenvite_test.
yarn test:e2e --runInBand
```

Jest carga `backend/.env.test` automáticamente antes de evaluar las pruebas. El archivo está ignorado por Git para evitar publicar credenciales; `.env.test.example` conserva la lista de variables requeridas.

## Frontend

1. Copia `frontend/.env.example` a `frontend/.env`.
2. Instala y arranca:

```bash
cd frontend
yarn
yarn dev
```

Al ejecutar `yarn dev`, Vite carga `frontend/.env.local`, que puede apuntar directamente a `http://localhost:3333/api/v1`. El archivo está ignorado por Git. Si se usa la ruta relativa `/api/v1`, el proxy de desarrollo también redirige a `http://localhost:3333`. Durante `yarn build`, `.env.production` conserva la URL pública y evita incorporar localhost al bundle.

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
