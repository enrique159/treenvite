# Treenvite — contexto para agentes de IA

## Objetivo del producto

Treenvite es una plataforma para organizar los invitados de un evento de forma tabular y visual. Cada evento pertenece a una cuenta, puede compartirse temporalmente mediante un código y permanentemente invitando colaboradores por correo.

La diferencia principal del producto es la vista de árbol: los invitados pueden relacionarse como anfitrión, pareja, familiar, acompañante o referido. La representación puede parecer un árbol binario en los ejemplos, pero el modelo debe permitir varios hijos para no limitar casos reales.

## Alcance funcional

- Registro e inicio de sesión con correo y contraseña o Google.
- Creación y edición de eventos.
- Acceso temporal a un evento mediante código compartible.
- Colaboración permanente mediante invitación por correo.
- Gestión de invitados en vista de tabla y vista de árbol.
- Datos de invitado suficientes para operación y exportación: nombre, correo, teléfono, grupo, relación, estado de confirmación, número de acompañantes, restricciones alimentarias y notas.
- Exportación CSV compatible con hojas de cálculo.
- Métricas rápidas: invitados, confirmados, pendientes y rechazados.

## Estructura del repositorio

- `frontend/`: Vue 3 + TypeScript + Vite. Es la aplicación visible.
- `backend/`: NestJS + TypeScript. Es la base para la API y persistencia real.
- `README.md`: visión general y comandos de arranque.

No sustituyas estos frameworks ni conviertas el monorepo a otra arquitectura sin una petición explícita.

## Estado actual y decisiones

La fuente de verdad es la API NestJS respaldada por MySQL. El frontend no debe leer `treenvite-workspace-v1` ni usar `localStorage` para información de dominio; Pinia conserva únicamente sesión y estado de interfaz.

La autenticación usa cookies HttpOnly host-only, access/refresh rotativo, CSRF en memoria y Google validado en el backend. Las contraseñas se almacenan con Argon2. Frontend y API se consideran subdominios HTTPS del mismo dominio registrable.

TypeORM usa `synchronize: true` por decisión del proyecto. No agregues migraciones mientras esta decisión siga vigente y advierte que los cambios de entidades pueden modificar automáticamente el esquema.

La conexión MySQL se configura con variables separadas: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` y `DB_PASSWORD`. Las pruebas E2E usan sus equivalentes con prefijo `TEST_`.

## Modelo de dominio recomendado

- `User` + `AuthIdentity`: perfil e identidades local/Google.
- `Event`: id, ownerId, name, type, startsAt, location, status, version y timestamps.
- `EventMember` / `EventInvitation`: acceso permanente y su invitación por correo.
- `EventAccessCode` / `EventAccessGrant`: códigos con hash, rol y caducidad.
- `Guest`: id, eventId, parentId nullable, name, email, phone, group, relation, rsvp (`confirmed`, `pending`, `declined`), companions, dietary, notes, createdAt, updatedAt.

Trata `parentId` como una lista de adyacencia. Evita borrar descendientes de forma implícita: al borrar un invitado, reasigna sus hijos o solicita una decisión.

## Reglas de implementación

- Mantén TypeScript estricto y componentes Vue con `<script setup lang="ts">`.
- Conserva la interfaz en español hasta que exista una estrategia de internacionalización.
- Prioriza accesibilidad: etiquetas de formulario, navegación por teclado, foco visible, contraste y estados no basados sólo en color.
- La interfaz debe ser responsive; valida escritorio y móvil.
- Usa componentes DaisyUI y utilities de Tailwind antes de escribir CSS nativo. Mantén `style.css` limitado a imports, tema y excepciones justificadas.
- Usa Vue Router para navegación y Pinia para estado compartido; `App.vue` debe permanecer como contenedor de `RouterView`.
- No incluyas secretos, tokens ni credenciales en el repositorio.
- No registres datos personales de invitados en logs.
- Mantén IDs estables; genera códigos compartibles distintos del ID interno.
- Los cambios de entidad deben validarse contra una base de desarrollo respaldada por el uso de `synchronize: true`.

## Verificación

Antes de entregar cambios de frontend:

```bash
cd frontend
yarn build
```

Antes de entregar cambios de backend:

```bash
cd backend
yarn build
yarn test
```

Prueba manualmente, como mínimo: crear evento, agregar/editar/eliminar invitado, alternar tabla/árbol, buscar, copiar código, acceder por código, invitar colaborador y exportar CSV.

## Criterio de terminado

Un cambio está terminado cuando compila, conserva los datos existentes o explica su migración, cubre estados vacíos/error/carga relevantes y documenta cualquier limitación que todavía impida uso en producción.
