<script setup lang="ts">
import { BookOpen, Braces, ChevronDown, KeyRound, Menu, ShieldCheck } from '@lucide/vue'
import { ref } from 'vue'
import ApiCodeBlock from '../components/ApiCodeBlock.vue'
import BrandMark from '../components/BrandMark.vue'
import LegalLinks from '../components/LegalLinks.vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const baseUrl = (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/$/, '')
const mobileNavigation = ref<HTMLDetailsElement | null>(null)

function closeMobileNavigation(): void {
  if (mobileNavigation.value) mobileNavigation.value.open = false
}

function navigateMobile(href: string): void {
  closeMobileNavigation()
  if (window.location.hash !== href) window.history.pushState(null, '', href)
  window.requestAnimationFrame(() => {
    document.querySelector<HTMLElement>(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

const navigation = [
  {
    title: 'Primeros pasos',
    items: [
      { href: '#introduccion', label: 'Introducción' },
      { href: '#autenticacion', label: 'Autenticación' },
      { href: '#paginacion', label: 'Paginación y filtros' },
      { href: '#errores', label: 'Errores' },
    ],
  },
  {
    title: 'Invitados',
    items: [
      { href: '#objeto-invitado', label: 'Objeto invitado' },
      { href: '#listar-invitados', label: 'Listar invitados', method: 'GET' },
      { href: '#consultar-invitado', label: 'Consultar invitado', method: 'GET' },
      { href: '#actualizar-invitado', label: 'Actualizar invitado', method: 'PATCH' },
    ],
  },
]

const guestFields = [
  ['id', 'string · UUID', 'Identificador estable del invitado.'],
  ['eventId', 'string · UUID', 'Evento al que pertenece. Coincide con el evento del token.'],
  ['parentId', 'string · UUID | null', 'Invitado padre dentro del árbol de relaciones.'],
  ['name', 'string', 'Nombre del invitado.'],
  ['email', 'string | null', 'Correo electrónico.'],
  ['phone', 'string | null', 'Teléfono de 7 a 15 dígitos.'],
  ['groupName', 'string', 'Grupo utilizado para organizar la lista.'],
  ['relationLabel', 'string', 'Relación en texto, por ejemplo “Amistad”.'],
  ['invitedBySide', 'groom | bride | null', 'Lado de la invitación cuando aplica.'],
  ['rsvp', 'pending | confirmed | declined', 'Estado de confirmación.'],
  ['companions', 'number', 'Número de acompañantes, entre 0 y 20.'],
  ['dietary', 'string | null', 'Restricciones o preferencias alimentarias.'],
  ['notes', 'string | null', 'Notas operativas.'],
  ['version', 'number', 'Versión requerida para actualizar sin sobrescribir cambios.'],
  ['createdAt', 'string · date-time', 'Fecha de creación en ISO 8601.'],
  ['updatedAt', 'string · date-time', 'Última modificación en ISO 8601.'],
]

const listParameters = [
  ['page', 'number', '1', 'Página solicitada, comenzando en 1.'],
  ['limit', 'number', '50', 'Resultados por página; máximo 200.'],
  ['search', 'string', '—', 'Busca parcialmente en nombre, correo o teléfono.'],
  ['rsvp', 'enum', '—', 'Filtra por pending, confirmed o declined.'],
  ['group', 'string', '—', 'Filtra por el nombre exacto del grupo.'],
  ['sort', 'enum', 'name', 'name, groupName, rsvp o createdAt.'],
  ['direction', 'enum', 'asc', 'asc o desc.'],
]

const errors = [
  ['400', 'VALIDATION_ERROR', 'Parámetros o cuerpo inválidos.'],
  ['400', 'NO_GUEST_CHANGES', 'PATCH no contiene ningún campo para modificar.'],
  ['401', 'INVALID_API_TOKEN', 'Token inexistente, vencido o revocado.'],
  ['403', 'API_TOKEN_INSUFFICIENT_PERMISSION', 'El token no permite escritura.'],
  ['404', 'GUEST_NOT_FOUND', 'El invitado no existe dentro del evento del token.'],
  ['409', 'GUEST_VERSION_CONFLICT', 'La versión enviada quedó obsoleta.'],
  ['429', 'HTTP_ERROR', 'Se excedió el límite de solicitudes.'],
]

const guestExample = JSON.stringify(
  {
    id: '8bdf3135-f41c-4c33-9a70-63f2340e6d85',
    eventId: 'fa77770e-73af-4ec8-a3ce-7ce755d1a923',
    parentId: null,
    name: 'Ana Pérez',
    email: 'ana@example.com',
    phone: '6691234567',
    groupName: 'Amistades',
    relationLabel: 'Amistad',
    invitedBySide: 'bride',
    rsvp: 'confirmed',
    companions: 1,
    dietary: 'Vegetariana',
    notes: null,
    version: 3,
    createdAt: '2026-08-13T18:24:00.000Z',
    updatedAt: '2026-08-14T02:10:00.000Z',
  },
  null,
  2,
)

const listRequest = `curl --request GET \\
  --url '${baseUrl}/integrations/guests?page=1&limit=50&rsvp=confirmed' \\
  --header 'Authorization: Bearer tv_api_TU_TOKEN'`

const listResponse = `{
  "items": [${guestExample.replace(/\n/g, '\n  ')}],
  "page": 1,
  "limit": 50,
  "total": 1,
  "totalPages": 1
}`

const getRequest = `curl --request GET \\
  --url '${baseUrl}/integrations/guests/8bdf3135-f41c-4c33-9a70-63f2340e6d85' \\
  --header 'Authorization: Bearer tv_api_TU_TOKEN'`

const updateRequest = `curl --request PATCH \\
  --url '${baseUrl}/integrations/guests/8bdf3135-f41c-4c33-9a70-63f2340e6d85' \\
  --header 'Authorization: Bearer tv_api_TU_TOKEN' \\
  --header 'Content-Type: application/json' \\
  --data '{
    "rsvp": "confirmed",
    "companions": 1,
    "version": 3
  }'`

const updateBody = `{
  "rsvp": "confirmed",
  "companions": 1,
  "version": 3
}`

const errorExample = `{
  "statusCode": 409,
  "code": "GUEST_VERSION_CONFLICT",
  "message": "El invitado cambió desde que lo consultaste",
  "details": null
}`
</script>

<template>
  <div class="min-h-screen bg-base-100">
    <header class="sticky top-0 z-40 border-b border-base-300 bg-base-100/95 backdrop-blur">
      <nav class="mx-auto flex h-18 max-w-[1600px] items-center gap-3 px-4 sm:gap-4 sm:px-8" aria-label="Documentación">
        <RouterLink to="/" aria-label="Treenvite, inicio"><BrandMark /></RouterLink>
        <span class="hidden h-6 w-px bg-base-300 sm:block"></span>
        <span class="flex items-center gap-2 text-sm font-semibold text-secondary">
          <BookOpen class="size-4 text-primary" /><span class="hidden sm:inline">Documentación</span> API
        </span>
        <RouterLink :to="auth.user ? '/events' : '/auth/login'" class="btn btn-primary btn-sm ml-auto">
          <span class="sm:hidden">{{ auth.user ? 'Eventos' : 'Entrar' }}</span>
          <span class="hidden sm:inline">{{ auth.user ? 'Ir a mis eventos' : 'Iniciar sesión' }}</span>
        </RouterLink>
      </nav>
    </header>

    <div class="mx-auto grid max-w-[1600px] lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside
        class="sticky top-18 hidden h-[calc(100vh-4.5rem)] overflow-y-auto border-r border-base-300 px-5 py-8 lg:block"
      >
        <nav class="grid gap-7" aria-label="Contenido de la documentación">
          <section v-for="group in navigation" :key="group.title">
            <h2 class="px-3 text-[11px] font-bold uppercase tracking-[0.16em] opacity-45">{{ group.title }}</h2>
            <ul class="menu menu-sm mt-2 gap-0.5 p-0">
              <li v-for="item in group.items" :key="item.href">
                <a :href="item.href" class="flex min-w-0 items-center gap-2 rounded-lg py-2">
                  <span
                    v-if="item.method"
                    class="w-11 shrink-0 font-mono text-[10px] font-bold"
                    :class="item.method === 'PATCH' ? 'text-warning' : 'text-success'"
                    >{{ item.method }}</span
                  >
                  <span class="truncate">{{ item.label }}</span>
                </a>
              </li>
            </ul>
          </section>
        </nav>
      </aside>

      <main class="min-w-0">
        <div class="sticky top-18 z-30 border-b border-base-300 bg-base-100 p-4 lg:hidden">
          <details ref="mobileNavigation" class="dropdown w-full">
            <summary class="btn btn-outline w-full justify-between">
              <span class="flex items-center gap-2"><Menu class="size-4" />Contenido</span
              ><ChevronDown class="size-4" />
            </summary>
            <div
              class="dropdown-content z-20 mt-2 max-h-[70vh] w-full overflow-auto rounded-box border border-base-300 bg-base-100 p-3 shadow-xl"
            >
              <section v-for="group in navigation" :key="group.title" class="mb-3 last:mb-0">
                <h2 class="px-3 py-2 text-[11px] font-bold uppercase tracking-wider opacity-45">{{ group.title }}</h2>
                <ul class="menu menu-sm p-0">
                  <li v-for="item in group.items" :key="item.href">
                    <a :href="item.href" @click.prevent="navigateMobile(item.href)">{{ item.label }}</a>
                  </li>
                </ul>
              </section>
            </div>
          </details>
        </div>

        <section
          id="introduccion"
          class="scroll-mt-36 border-b border-base-300 px-5 py-12 sm:px-10 sm:py-16 lg:scroll-mt-22 xl:px-14"
        >
          <div class="max-w-3xl">
            <p class="text-xs font-bold uppercase tracking-[0.18em] text-primary">API REST · v1</p>
            <h1 class="mt-3 font-display text-4xl leading-tight text-secondary sm:text-5xl">Referencia de la API</h1>
            <p class="mt-5 text-base leading-7 opacity-70 sm:text-lg">
              Conecta servicios externos con Treenvite para consultar y actualizar los invitados de un evento. Cada
              token pertenece a un solo evento, por lo que no necesitas enviar su identificador en las rutas.
            </p>
            <div class="mt-8 grid gap-3 sm:grid-cols-2">
              <div class="rounded-xl border border-base-300 bg-base-200/60 p-4">
                <p class="text-xs font-bold uppercase tracking-wide opacity-45">URL base</p>
                <code class="mt-2 block break-all text-sm font-semibold text-primary">{{ baseUrl }}</code>
              </div>
              <div class="rounded-xl border border-base-300 bg-base-200/60 p-4">
                <p class="text-xs font-bold uppercase tracking-wide opacity-45">Formato</p>
                <p class="mt-2 text-sm font-semibold">JSON · UTF-8 · HTTPS</p>
              </div>
            </div>
            <div class="alert alert-info mt-6 items-start" role="note">
              <ShieldCheck class="mt-0.5 size-5 shrink-0" />
              <span
                >Esta API está diseñada para comunicación servidor a servidor. No expongas tokens en código frontend,
                aplicaciones distribuibles, URLs ni repositorios.</span
              >
            </div>
          </div>
        </section>

        <section
          id="autenticacion"
          class="scroll-mt-36 border-b border-base-300 px-5 py-12 sm:px-10 sm:py-16 lg:scroll-mt-22 xl:px-14"
        >
          <div class="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,.8fr)]">
            <article class="max-w-3xl">
              <p class="text-xs font-bold uppercase tracking-[0.16em] text-primary">Primeros pasos</p>
              <h2 class="mt-2 font-display text-3xl text-secondary sm:text-4xl">Autenticación</h2>
              <p class="mt-4 leading-7 opacity-70">
                El propietario crea el token desde <strong>Evento → API</strong>. El secreto se muestra una sola vez y
                debe enviarse en cada solicitud mediante el encabezado Bearer.
              </p>
              <div class="mt-6 rounded-xl border border-base-300 p-5">
                <h3 class="flex items-center gap-2 font-semibold"><KeyRound class="size-4 text-primary" />Permisos</h3>
                <dl class="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt><code class="font-bold text-primary">read</code></dt>
                    <dd class="mt-1 leading-6 opacity-65">Listar y consultar invitados.</dd>
                  </div>
                  <div>
                    <dt><code class="font-bold text-primary">read_write</code></dt>
                    <dd class="mt-1 leading-6 opacity-65">Incluye lectura y actualización.</dd>
                  </div>
                </dl>
              </div>
              <p class="mt-5 text-sm leading-6 opacity-65">
                Los tokens pueden vencer o revocarse inmediatamente. Para rotar una credencial, crea una nueva,
                actualiza la integración y después revoca la anterior.
              </p>
            </article>
            <ApiCodeBlock code="Authorization: Bearer tv_api_TU_TOKEN" label="Encabezado HTTP" />
          </div>
        </section>

        <section
          id="paginacion"
          class="scroll-mt-36 border-b border-base-300 px-5 py-12 sm:px-10 sm:py-16 lg:scroll-mt-22 xl:px-14"
        >
          <div class="max-w-4xl">
            <h2 class="font-display text-3xl text-secondary sm:text-4xl">Paginación y filtros</h2>
            <p class="mt-4 leading-7 opacity-70">
              El listado usa paginación por página. Los resultados tienen orden secundario estable por ID y la respuesta
              incluye el total de registros y páginas.
            </p>
            <div class="mt-6 overflow-x-auto rounded-xl border border-base-300">
              <table class="table">
                <thead>
                  <tr>
                    <th>Parámetro</th>
                    <th>Tipo</th>
                    <th>Predeterminado</th>
                    <th>Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="parameter in listParameters" :key="parameter[0]">
                    <td>
                      <code class="font-semibold text-primary">{{ parameter[0] }}</code>
                    </td>
                    <td class="whitespace-nowrap text-xs opacity-60">{{ parameter[1] }}</td>
                    <td>{{ parameter[2] }}</td>
                    <td class="min-w-64">{{ parameter[3] }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section
          id="errores"
          class="scroll-mt-36 border-b border-base-300 px-5 py-12 sm:px-10 sm:py-16 lg:scroll-mt-22 xl:px-14"
        >
          <div class="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,.8fr)]">
            <article class="min-w-0">
              <h2 class="font-display text-3xl text-secondary sm:text-4xl">Errores</h2>
              <p class="mt-4 leading-7 opacity-70">
                Todos los errores usan la misma estructura JSON. El campo <code>code</code> es estable y resulta más
                apropiado para lógica de integración que el texto de <code>message</code>.
              </p>
              <div class="mt-6 overflow-x-auto rounded-xl border border-base-300">
                <table class="table table-sm">
                  <tbody>
                    <tr v-for="error in errors" :key="`${error[0]}-${error[1]}`">
                      <td class="font-bold">{{ error[0] }}</td>
                      <td>
                        <code class="text-xs text-primary">{{ error[1] }}</code>
                      </td>
                      <td class="min-w-56">{{ error[2] }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p class="mt-4 text-sm opacity-60">El límite general es de 120 solicitudes por minuto.</p>
            </article>
            <ApiCodeBlock :code="errorExample" label="Respuesta 409" />
          </div>
        </section>

        <section
          id="objeto-invitado"
          class="scroll-mt-36 border-b border-base-300 px-5 py-12 sm:px-10 sm:py-16 lg:scroll-mt-22 xl:px-14"
        >
          <div class="grid gap-8 2xl:grid-cols-[minmax(0,1fr)_minmax(24rem,.8fr)]">
            <article class="min-w-0">
              <p class="text-xs font-bold uppercase tracking-[0.16em] text-primary">Invitados</p>
              <h2 class="mt-2 font-display text-3xl text-secondary sm:text-4xl">Objeto invitado</h2>
              <p class="mt-4 leading-7 opacity-70">
                Representa una persona dentro del evento y su relación con el resto del árbol.
              </p>
              <div class="mt-6 overflow-x-auto rounded-xl border border-base-300">
                <table class="table table-sm">
                  <tbody>
                    <tr v-for="field in guestFields" :key="field[0]">
                      <td>
                        <code class="font-semibold text-primary">{{ field[0] }}</code>
                      </td>
                      <td class="whitespace-nowrap text-[11px] opacity-55">{{ field[1] }}</td>
                      <td class="min-w-60 py-3">{{ field[2] }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </article>
            <ApiCodeBlock :code="guestExample" label="Objeto invitado" />
          </div>
        </section>

        <section
          id="listar-invitados"
          class="scroll-mt-36 border-b border-base-300 px-5 py-12 sm:px-10 sm:py-16 lg:scroll-mt-22 xl:px-14"
        >
          <div class="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(24rem,.9fr)]">
            <article class="min-w-0">
              <div class="flex flex-wrap items-center gap-3">
                <span class="badge badge-success font-mono font-bold">GET</span
                ><code class="text-sm font-semibold">/integrations/guests</code>
              </div>
              <h2 class="mt-5 font-display text-3xl text-secondary sm:text-4xl">Listar invitados</h2>
              <p class="mt-4 leading-7 opacity-70">
                Devuelve una página de invitados del evento asociado al token. Admite búsqueda, filtros y ordenamiento.
              </p>
              <h3 class="mt-8 font-semibold">Respuesta</h3>
              <ul class="mt-3 grid gap-2 text-sm leading-6 opacity-70">
                <li><code>items</code>: objetos de invitado.</li>
                <li><code>page</code> y <code>limit</code>: página solicitada.</li>
                <li><code>total</code> y <code>totalPages</code>: tamaño completo del resultado.</li>
              </ul>
            </article>
            <div class="grid min-w-0 content-start gap-4">
              <ApiCodeBlock :code="listRequest" label="cURL" /><ApiCodeBlock
                :code="listResponse"
                label="Respuesta 200"
              />
            </div>
          </div>
        </section>

        <section
          id="consultar-invitado"
          class="scroll-mt-36 border-b border-base-300 px-5 py-12 sm:px-10 sm:py-16 lg:scroll-mt-22 xl:px-14"
        >
          <div class="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(24rem,.9fr)]">
            <article class="min-w-0">
              <div class="flex flex-wrap items-center gap-3">
                <span class="badge badge-success font-mono font-bold">GET</span
                ><code class="text-sm font-semibold">/integrations/guests/:guestId</code>
              </div>
              <h2 class="mt-5 font-display text-3xl text-secondary sm:text-4xl">Consultar un invitado</h2>
              <p class="mt-4 leading-7 opacity-70">
                Obtiene el estado más reciente de un invitado. Usa su <code>version</code> si después necesitas
                actualizarlo.
              </p>
              <div class="alert alert-warning mt-6 items-start">
                <Braces class="mt-0.5 size-5 shrink-0" /><span
                  >Un ID de otro evento también devuelve <code>404 GUEST_NOT_FOUND</code>; la API no revela recursos
                  fuera del alcance del token.</span
                >
              </div>
            </article>
            <div class="grid min-w-0 content-start gap-4">
              <ApiCodeBlock :code="getRequest" label="cURL" /><ApiCodeBlock
                :code="guestExample"
                label="Respuesta 200"
              />
            </div>
          </div>
        </section>

        <section id="actualizar-invitado" class="scroll-mt-36 px-5 py-12 sm:px-10 sm:py-16 lg:scroll-mt-22 xl:px-14">
          <div class="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(24rem,.9fr)]">
            <article class="min-w-0">
              <div class="flex flex-wrap items-center gap-3">
                <span class="badge badge-warning font-mono font-bold">PATCH</span
                ><code class="text-sm font-semibold">/integrations/guests/:guestId</code>
              </div>
              <h2 class="mt-5 font-display text-3xl text-secondary sm:text-4xl">Actualizar un invitado</h2>
              <p class="mt-4 leading-7 opacity-70">
                Modifica únicamente los campos enviados. Requiere un token <code>read_write</code>, la versión actual y
                al menos un campo editable.
              </p>
              <ul class="mt-6 grid gap-3 text-sm leading-6">
                <li class="flex gap-2">
                  <span class="text-success">✓</span><span>Los campos omitidos permanecen sin cambios.</span>
                </li>
                <li class="flex gap-2">
                  <span class="text-success">✓</span
                  ><span><code>null</code> limpia email, teléfono, lado, alimentación, notas o relación padre.</span>
                </li>
                <li class="flex gap-2">
                  <span class="text-success">✓</span
                  ><span>Una versión obsoleta devuelve <code>409</code>; consulta de nuevo antes de reintentar.</span>
                </li>
              </ul>
              <div class="mt-7 rounded-xl border border-base-300 p-5">
                <h3 class="font-semibold">Campos inmutables</h3>
                <p class="mt-2 text-sm leading-6 opacity-65">
                  <code>id</code>, <code>eventId</code>, <code>createdAt</code> y <code>updatedAt</code> no pueden
                  modificarse.
                </p>
              </div>
            </article>
            <div class="grid min-w-0 content-start gap-4">
              <ApiCodeBlock :code="updateRequest" label="cURL" /><ApiCodeBlock
                :code="updateBody"
                label="Cuerpo JSON"
              /><ApiCodeBlock :code="guestExample" label="Respuesta 200" />
            </div>
          </div>
        </section>

        <footer class="border-t border-base-300 bg-base-200 px-5 py-8 sm:px-10 xl:px-14">
          <div class="flex flex-col items-center justify-between gap-5 sm:flex-row">
            <LegalLinks /><a href="#introduccion" class="link link-hover text-xs">Volver arriba</a>
          </div>
        </footer>
      </main>
    </div>
  </div>
</template>
