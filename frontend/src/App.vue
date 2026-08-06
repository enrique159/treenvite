<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import GuestTreeNode from './components/GuestTreeNode.vue'
import type { EventItem, Guest, RsvpStatus, UserProfile } from './types'

type ModalName = 'event' | 'guest' | 'share' | 'join' | null
type ViewMode = 'table' | 'tree'

interface StoredState {
  user: UserProfile | null
  events: EventItem[]
}

const STORAGE_KEY = 'treenvite-workspace-v1'

const demoGuests: Guest[] = [
  {
    id: 'g-ana',
    parentId: null,
    name: 'Ana Torres',
    email: 'ana@ejemplo.com',
    phone: '+52 55 2140 8812',
    group: 'Familia Torres',
    relation: 'Anfitriona',
    rsvp: 'confirmed',
    companions: 1,
    dietary: 'Vegetariana',
    notes: 'Mesa cerca de la pista.',
  },
  {
    id: 'g-carlos',
    parentId: 'g-ana',
    name: 'Carlos Mendoza',
    email: 'carlos@ejemplo.com',
    phone: '+52 55 6084 1102',
    group: 'Familia Torres',
    relation: 'Pareja',
    rsvp: 'confirmed',
    companions: 0,
    dietary: '',
    notes: '',
  },
  {
    id: 'g-lucia',
    parentId: 'g-ana',
    name: 'Lucía Torres',
    email: 'lucia@ejemplo.com',
    phone: '+52 55 0192 4410',
    group: 'Familia Torres',
    relation: 'Hermana',
    rsvp: 'pending',
    companions: 1,
    dietary: 'Sin gluten',
    notes: '',
  },
  {
    id: 'g-elena',
    parentId: 'g-carlos',
    name: 'Elena Ruiz',
    email: 'elena@ejemplo.com',
    phone: '+52 33 8481 5522',
    group: 'Amigos universidad',
    relation: 'Amiga',
    rsvp: 'confirmed',
    companions: 0,
    dietary: '',
    notes: 'Llega después de las 18:00.',
  },
  {
    id: 'g-diego',
    parentId: 'g-carlos',
    name: 'Diego Salas',
    email: 'diego@ejemplo.com',
    phone: '+52 81 3491 0902',
    group: 'Amigos universidad',
    relation: 'Amigo',
    rsvp: 'declined',
    companions: 0,
    dietary: '',
    notes: '',
  },
  {
    id: 'g-sofia',
    parentId: 'g-lucia',
    name: 'Sofía Herrera',
    email: 'sofia@ejemplo.com',
    phone: '+52 55 6702 1108',
    group: 'Trabajo',
    relation: 'Compañera',
    rsvp: 'pending',
    companions: 1,
    dietary: 'Alergia a nueces',
    notes: '',
  },
  {
    id: 'g-mateo',
    parentId: 'g-lucia',
    name: 'Mateo Cruz',
    email: 'mateo@ejemplo.com',
    phone: '+52 55 9470 3610',
    group: 'Trabajo',
    relation: 'Compañero',
    rsvp: 'confirmed',
    companions: 0,
    dietary: '',
    notes: '',
  },
]

const defaultEvents: EventItem[] = [
  {
    id: 'event-boda',
    name: 'Boda de Ana & Carlos',
    type: 'Boda',
    date: '2026-11-14',
    location: 'Hacienda San Gabriel, Guadalajara',
    accessCode: 'BODA-7K2',
    status: 'Activo',
    color: '#e96f51',
    members: [{ email: 'planner@ejemplo.com', role: 'Editor', status: 'Activo' }],
    guests: demoGuests,
  },
  {
    id: 'event-cena',
    name: 'Cena anual del equipo',
    type: 'Cena',
    date: '2026-12-05',
    location: 'Casa Prunes, Ciudad de México',
    accessCode: 'CENA-4M8',
    status: 'Borrador',
    color: '#517a6a',
    members: [],
    guests: [],
  },
]

function cloneEvents(): EventItem[] {
  return JSON.parse(JSON.stringify(defaultEvents)) as EventItem[]
}

function loadState(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as StoredState
  } catch {
    // Se usa el estado inicial si el almacenamiento local no está disponible.
  }
  return { user: null, events: cloneEvents() }
}

const initialState = loadState()
const user = ref<UserProfile | null>(initialState.user)
const events = ref<EventItem[]>(initialState.events)
const authMode = ref<'login' | 'register'>('login')
const authForm = reactive({ name: '', email: '', password: '' })
const page = ref<'events' | 'event'>('events')
const currentEventId = ref(events.value[0]?.id ?? '')
const modal = ref<ModalName>(null)
const viewMode = ref<ViewMode>('table')
const search = ref('')
const statusFilter = ref<'all' | RsvpStatus>('all')
const joinCode = ref('')
const inviteEmail = ref('')
const inviteRole = ref<'Editor' | 'Solo lectura'>('Editor')
const editingGuestId = ref<string | null>(null)
const toast = ref('')
let toastTimer: ReturnType<typeof setTimeout> | undefined

const eventForm = reactive({
  name: '',
  type: 'Boda',
  date: '',
  location: '',
})

const guestForm = reactive({
  name: '',
  email: '',
  phone: '',
  group: '',
  relation: '',
  parentId: '' as string,
  rsvp: 'pending' as RsvpStatus,
  companions: 0,
  dietary: '',
  notes: '',
})

watch(
  [user, events],
  () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: user.value, events: events.value }))
  },
  { deep: true },
)

onBeforeUnmount(() => {
  if (toastTimer) clearTimeout(toastTimer)
})

const currentEvent = computed(() => events.value.find((item) => item.id === currentEventId.value) ?? null)
const rootGuests = computed(() => currentEvent.value?.guests.filter((guest) => !guest.parentId) ?? [])
const filteredGuests = computed(() => {
  const query = search.value.trim().toLowerCase()
  return (currentEvent.value?.guests ?? []).filter((guest) => {
    const matchesStatus = statusFilter.value === 'all' || guest.rsvp === statusFilter.value
    const haystack = `${guest.name} ${guest.email} ${guest.phone} ${guest.group}`.toLowerCase()
    return matchesStatus && (!query || haystack.includes(query))
  })
})
const stats = computed(() => {
  const guests = currentEvent.value?.guests ?? []
  return {
    total: guests.reduce((sum, guest) => sum + 1 + guest.companions, 0),
    confirmed: guests.filter((guest) => guest.rsvp === 'confirmed').length,
    pending: guests.filter((guest) => guest.rsvp === 'pending').length,
    declined: guests.filter((guest) => guest.rsvp === 'declined').length,
  }
})

function makeId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`}`
}

function showToast(message: string): void {
  toast.value = message
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = ''), 2800)
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function formatDate(value: string): string {
  if (!value) return 'Fecha por definir'
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(`${value}T12:00:00`),
  )
}

function submitAuth(): void {
  const email = authForm.email.trim()
  if (!email || !authForm.password) return
  const guessedName = email.split('@')[0]?.replace(/[._-]/g, ' ') || 'Organizador'
  user.value = {
    id: makeId('user'),
    name: authMode.value === 'register' && authForm.name.trim() ? authForm.name.trim() : guessedName,
    email,
  }
  showToast(authMode.value === 'register' ? 'Tu cuenta está lista' : 'Bienvenido de nuevo')
}

function continueWithGoogle(): void {
  user.value = { id: 'demo-user', name: 'Mariana López', email: 'mariana@treenvite.demo' }
  showToast('Sesión de demostración iniciada')
}

function logout(): void {
  user.value = null
  page.value = 'events'
}

function openEvent(event: EventItem): void {
  currentEventId.value = event.id
  page.value = 'event'
  search.value = ''
  statusFilter.value = 'all'
}

function openEventModal(): void {
  Object.assign(eventForm, { name: '', type: 'Boda', date: '', location: '' })
  modal.value = 'event'
}

function generateAccessCode(name: string): string {
  const prefix = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z]/g, '')
    .slice(0, 4)
    .toUpperCase()
    .padEnd(4, 'X')
  return `${prefix}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`
}

function createEvent(): void {
  if (!eventForm.name.trim() || !eventForm.date) return
  const colors = ['#e96f51', '#517a6a', '#7968a7', '#c49545']
  const event: EventItem = {
    id: makeId('event'),
    name: eventForm.name.trim(),
    type: eventForm.type,
    date: eventForm.date,
    location: eventForm.location.trim() || 'Ubicación por definir',
    accessCode: generateAccessCode(eventForm.name),
    status: 'Borrador',
    color: colors[events.value.length % colors.length] ?? '#517a6a',
    members: [],
    guests: [],
  }
  events.value.unshift(event)
  modal.value = null
  openEvent(event)
  showToast('Evento creado')
}

function accessByCode(): void {
  const code = joinCode.value.trim().toUpperCase()
  const event = events.value.find((item) => item.accessCode.toUpperCase() === code)
  if (!event) {
    showToast('No encontramos un evento con ese código')
    return
  }
  modal.value = null
  joinCode.value = ''
  openEvent(event)
  showToast('Acceso temporal concedido')
}

function resetGuestForm(parent: Guest | null = null): void {
  editingGuestId.value = null
  Object.assign(guestForm, {
    name: '',
    email: '',
    phone: '',
    group: parent?.group ?? '',
    relation: parent ? 'Invitado por' : '',
    parentId: parent?.id ?? '',
    rsvp: 'pending' as RsvpStatus,
    companions: 0,
    dietary: '',
    notes: '',
  })
}

function openGuestModal(parent: Guest | null = null): void {
  resetGuestForm(parent)
  modal.value = 'guest'
}

function editGuest(guest: Guest): void {
  editingGuestId.value = guest.id
  Object.assign(guestForm, {
    name: guest.name,
    email: guest.email,
    phone: guest.phone,
    group: guest.group,
    relation: guest.relation,
    parentId: guest.parentId ?? '',
    rsvp: guest.rsvp,
    companions: guest.companions,
    dietary: guest.dietary,
    notes: guest.notes,
  })
  modal.value = 'guest'
}

function saveGuest(): void {
  if (!currentEvent.value || !guestForm.name.trim()) return
  const data: Omit<Guest, 'id'> = {
    parentId: guestForm.parentId || null,
    name: guestForm.name.trim(),
    email: guestForm.email.trim(),
    phone: guestForm.phone.trim(),
    group: guestForm.group.trim() || 'Sin grupo',
    relation: guestForm.relation.trim() || 'Invitado',
    rsvp: guestForm.rsvp,
    companions: Math.max(0, Number(guestForm.companions) || 0),
    dietary: guestForm.dietary.trim(),
    notes: guestForm.notes.trim(),
  }
  if (editingGuestId.value) {
    const index = currentEvent.value.guests.findIndex((guest) => guest.id === editingGuestId.value)
    if (index >= 0) currentEvent.value.guests[index] = { id: editingGuestId.value, ...data }
    showToast('Invitado actualizado')
  } else {
    currentEvent.value.guests.push({ id: makeId('guest'), ...data })
    showToast('Invitado agregado')
  }
  modal.value = null
}

function deleteGuest(): void {
  if (!currentEvent.value || !editingGuestId.value) return
  const guest = currentEvent.value.guests.find((item) => item.id === editingGuestId.value)
  if (!guest || !window.confirm(`¿Eliminar a ${guest.name}? Sus relaciones directas se conservarán.`)) return
  currentEvent.value.guests.forEach((item) => {
    if (item.parentId === guest.id) item.parentId = guest.parentId
  })
  currentEvent.value.guests = currentEvent.value.guests.filter((item) => item.id !== guest.id)
  modal.value = null
  showToast('Invitado eliminado')
}

async function copyAccessCode(): Promise<void> {
  const code = currentEvent.value?.accessCode
  if (!code) return
  try {
    await navigator.clipboard.writeText(code)
    showToast('Código copiado')
  } catch {
    showToast(`Código: ${code}`)
  }
}

function inviteMember(): void {
  if (!currentEvent.value || !inviteEmail.value.trim()) return
  currentEvent.value.members.push({
    email: inviteEmail.value.trim(),
    role: inviteRole.value,
    status: 'Pendiente',
  })
  inviteEmail.value = ''
  modal.value = null
  showToast('Invitación registrada')
}

function exportCsv(): void {
  if (!currentEvent.value) return
  const headers = [
    'Nombre',
    'Correo',
    'Teléfono',
    'Grupo',
    'Relación',
    'Estado',
    'Acompañantes',
    'Restricciones alimentarias',
    'Notas',
  ]
  const statusNames: Record<RsvpStatus, string> = {
    confirmed: 'Confirmado',
    pending: 'Pendiente',
    declined: 'No asiste',
  }
  const escapeCell = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`
  const rows = currentEvent.value.guests.map((guest) =>
    [
      guest.name,
      guest.email,
      guest.phone,
      guest.group,
      guest.relation,
      statusNames[guest.rsvp],
      guest.companions,
      guest.dietary,
      guest.notes,
    ]
      .map(escapeCell)
      .join(','),
  )
  const blob = new Blob([`\uFEFF${headers.map(escapeCell).join(',')}\n${rows.join('\n')}`], {
    type: 'text/csv;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${currentEvent.value.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-invitados.csv`
  link.click()
  URL.revokeObjectURL(url)
  showToast('Lista exportada')
}

function rsvpLabel(status: RsvpStatus): string {
  if (status === 'confirmed') return 'Confirmado'
  if (status === 'declined') return 'No asiste'
  return 'Pendiente'
}
</script>

<template>
  <main v-if="!user" class="auth-page">
    <section class="auth-story">
      <a class="brand brand--light" href="#" aria-label="Treenvite, inicio">
        <span class="brand-mark"><i></i><i></i><i></i></span>
        <span>treenvite</span>
      </a>

      <div class="auth-story__content">
        <span class="eyebrow eyebrow--light">Invitaciones con sentido</span>
        <h1>Cada invitado tiene una historia. <em>Hazla visible.</em></h1>
        <p>
          Organiza tu evento desde las relaciones que lo hacen especial. Una lista clara, un árbol vivo y
          todo tu equipo en sintonía.
        </p>

        <div class="mini-tree" aria-hidden="true">
          <div class="mini-tree__root"><span>ML</span><b>Mariana</b></div>
          <div class="mini-tree__line"></div>
          <div class="mini-tree__children">
            <div><span>AT</span><b>Ana</b><small>Familia</small></div>
            <div><span>CG</span><b>Carlos</b><small>Amigos</small></div>
            <div><span>SR</span><b>Sofía</b><small>Trabajo</small></div>
          </div>
        </div>
      </div>

      <p class="auth-story__quote">“Por fin dejamos de perdernos entre hojas de cálculo.”</p>
    </section>

    <section class="auth-panel">
      <div class="auth-card">
        <div>
          <span class="mobile-brand">treenvite</span>
          <p class="auth-kicker">{{ authMode === 'login' ? 'Qué gusto verte' : 'Empieza a organizar' }}</p>
          <h2>{{ authMode === 'login' ? 'Entra a tu cuenta' : 'Crea tu cuenta' }}</h2>
          <p class="auth-subtitle">
            {{ authMode === 'login' ? 'Tus eventos te están esperando.' : 'Tu primer evento está a unos pasos.' }}
          </p>
        </div>

        <button class="google-button" type="button" @click="continueWithGoogle">
          <span class="google-g">G</span> Continuar con Google <small>demo</small>
        </button>
        <div class="divider"><span>o continúa con correo</span></div>

        <form class="auth-form" @submit.prevent="submitAuth">
          <label v-if="authMode === 'register'">
            Nombre completo
            <input v-model="authForm.name" required autocomplete="name" placeholder="Mariana López" />
          </label>
          <label>
            Correo electrónico
            <input v-model="authForm.email" required type="email" autocomplete="email" placeholder="tu@correo.com" />
          </label>
          <label>
            <span>Contraseña <a v-if="authMode === 'login'" href="#">¿La olvidaste?</a></span>
            <input
              v-model="authForm.password"
              required
              type="password"
              :autocomplete="authMode === 'login' ? 'current-password' : 'new-password'"
              placeholder="Mínimo 8 caracteres"
              minlength="8"
            />
          </label>
          <button class="button button--primary button--wide" type="submit">
            {{ authMode === 'login' ? 'Entrar a Treenvite' : 'Crear mi cuenta' }}
            <span aria-hidden="true">→</span>
          </button>
        </form>

        <p class="auth-switch">
          {{ authMode === 'login' ? '¿Aún no tienes cuenta?' : '¿Ya tienes cuenta?' }}
          <button type="button" @click="authMode = authMode === 'login' ? 'register' : 'login'">
            {{ authMode === 'login' ? 'Créala gratis' : 'Inicia sesión' }}
          </button>
        </p>
      </div>
    </section>
  </main>

  <div v-else class="app-shell">
    <aside class="sidebar">
      <button class="brand brand-button" type="button" @click="page = 'events'">
        <span class="brand-mark"><i></i><i></i><i></i></span>
        <span>treenvite</span>
      </button>

      <nav class="main-nav" aria-label="Navegación principal">
        <button class="nav-item nav-item--active" type="button" @click="page = 'events'">
          <span class="nav-icon">⌂</span> Mis eventos
        </button>
        <button class="nav-item" type="button" @click="modal = 'join'">
          <span class="nav-icon">⌁</span> Acceder con código
        </button>
      </nav>

      <div class="sidebar-bottom">
        <button class="nav-item" type="button"><span class="nav-icon">?</span> Ayuda</button>
        <div class="account-card">
          <span class="avatar">{{ initials(user.name) }}</span>
          <span><strong>{{ user.name }}</strong><small>{{ user.email }}</small></span>
          <button type="button" aria-label="Cerrar sesión" title="Cerrar sesión" @click="logout">↪</button>
        </div>
      </div>
    </aside>

    <section class="main-content">
      <template v-if="page === 'events'">
        <header class="topbar topbar--events">
          <div>
            <p class="breadcrumb">Tu espacio</p>
            <h1>Mis eventos</h1>
          </div>
          <div class="topbar-actions">
            <button class="button button--secondary" type="button" @click="modal = 'join'">Acceder con código</button>
            <button class="button button--primary" type="button" @click="openEventModal">+ Crear evento</button>
          </div>
        </header>

        <div class="events-page">
          <section class="welcome-card">
            <div>
              <span class="eyebrow">Tu próxima celebración</span>
              <h2>Todo empieza con una persona.</h2>
              <p>Crea tu evento, reúne a tu gente y deja que las relaciones tomen forma.</p>
              <button class="text-button" type="button" @click="openEventModal">Crear un nuevo evento <span>→</span></button>
            </div>
            <div class="welcome-orbit" aria-hidden="true">
              <span class="orbit orbit--one"></span><span class="orbit orbit--two"></span>
              <div class="orbit-person orbit-person--one">AL</div>
              <div class="orbit-person orbit-person--two">JR</div>
              <div class="orbit-person orbit-person--three">MS</div>
              <div class="orbit-heart">♥</div>
            </div>
          </section>

          <div class="section-heading">
            <div><h2>Tus eventos</h2><span>{{ events.length }} en total</span></div>
            <span class="section-rule"></span>
          </div>

          <section class="event-grid">
            <button
              v-for="event in events"
              :key="event.id"
              class="event-card"
              type="button"
              @click="openEvent(event)"
            >
              <div class="event-card__date" :style="{ '--event-color': event.color }">
                <span>{{ new Date(`${event.date}T12:00:00`).toLocaleDateString('es-MX', { month: 'short' }) }}</span>
                <strong>{{ new Date(`${event.date}T12:00:00`).getDate() }}</strong>
              </div>
              <div class="event-card__body">
                <div class="event-card__top">
                  <span class="event-type">{{ event.type }}</span>
                  <span class="event-status" :class="{ 'event-status--draft': event.status === 'Borrador' }">
                    {{ event.status }}
                  </span>
                </div>
                <h3>{{ event.name }}</h3>
                <p>{{ formatDate(event.date) }} · {{ event.location }}</p>
                <div class="event-card__footer">
                  <span class="avatar-stack" aria-hidden="true">
                    <i v-for="guest in event.guests.slice(0, 3)" :key="guest.id">{{ initials(guest.name) }}</i>
                  </span>
                  <span><strong>{{ event.guests.length }}</strong> invitados</span>
                  <span class="event-arrow">→</span>
                </div>
              </div>
            </button>

            <button class="new-event-card" type="button" @click="openEventModal">
              <span>+</span><strong>Crear otro evento</strong><small>Empieza desde cero</small>
            </button>
          </section>
        </div>
      </template>

      <template v-else-if="currentEvent">
        <header class="event-topbar">
          <button class="back-button" type="button" aria-label="Volver a eventos" @click="page = 'events'">←</button>
          <div class="event-title">
            <span class="event-title__mark" :style="{ background: currentEvent.color }">{{ currentEvent.type[0] }}</span>
            <div>
              <p>{{ currentEvent.type }} · {{ formatDate(currentEvent.date) }}</p>
              <h1>{{ currentEvent.name }}</h1>
            </div>
          </div>
          <div class="topbar-actions">
            <button class="button button--secondary button--code" type="button" @click="modal = 'share'">
              <span>⌁</span> {{ currentEvent.accessCode }}
            </button>
            <button class="button button--primary" type="button" @click="openGuestModal()">+ Agregar invitado</button>
          </div>
        </header>

        <div class="event-workspace">
          <section class="stats-grid" aria-label="Resumen del evento">
            <article><span class="stat-icon stat-icon--total">♟</span><div><strong>{{ stats.total }}</strong><small>Personas</small></div></article>
            <article><span class="stat-icon stat-icon--yes">✓</span><div><strong>{{ stats.confirmed }}</strong><small>Confirmados</small></div></article>
            <article><span class="stat-icon stat-icon--wait">◷</span><div><strong>{{ stats.pending }}</strong><small>Pendientes</small></div></article>
            <article><span class="stat-icon stat-icon--no">×</span><div><strong>{{ stats.declined }}</strong><small>No asisten</small></div></article>
          </section>

          <section class="guest-panel">
            <div class="guest-toolbar">
              <div class="view-tabs" role="tablist" aria-label="Vista de invitados">
                <button :class="{ active: viewMode === 'table' }" type="button" @click="viewMode = 'table'">☷ Lista</button>
                <button :class="{ active: viewMode === 'tree' }" type="button" @click="viewMode = 'tree'">⌘ Árbol</button>
              </div>
              <div class="guest-toolbar__actions">
                <label class="search-field">
                  <span>⌕</span><input v-model="search" aria-label="Buscar invitados" placeholder="Buscar invitado…" />
                </label>
                <select v-model="statusFilter" aria-label="Filtrar por confirmación">
                  <option value="all">Todos los estados</option>
                  <option value="confirmed">Confirmados</option>
                  <option value="pending">Pendientes</option>
                  <option value="declined">No asisten</option>
                </select>
                <button class="icon-button" type="button" aria-label="Exportar invitados a CSV" title="Exportar CSV" @click="exportCsv">⇩</button>
              </div>
            </div>

            <div v-if="!currentEvent.guests.length" class="empty-state">
              <span class="empty-state__art">✣</span>
              <h2>Tu árbol empieza aquí</h2>
              <p>Agrega a la primera persona y construye las relaciones de tu evento.</p>
              <button class="button button--primary" type="button" @click="openGuestModal()">+ Agregar primer invitado</button>
            </div>

            <div v-else-if="viewMode === 'table'" class="table-scroll">
              <table>
                <thead><tr><th>Invitado</th><th>Grupo</th><th>Relación</th><th>Confirmación</th><th>Acomp.</th><th></th></tr></thead>
                <tbody>
                  <tr v-for="guest in filteredGuests" :key="guest.id" @click="editGuest(guest)">
                    <td>
                      <span class="guest-person"><i class="avatar">{{ initials(guest.name) }}</i><span><strong>{{ guest.name }}</strong><small>{{ guest.email || guest.phone || 'Sin contacto' }}</small></span></span>
                    </td>
                    <td><span class="group-pill">{{ guest.group }}</span></td>
                    <td>{{ guest.relation }}</td>
                    <td><span class="rsvp-pill" :class="`rsvp-pill--${guest.rsvp}`"><i></i>{{ rsvpLabel(guest.rsvp) }}</span></td>
                    <td>{{ guest.companions }}</td>
                    <td><button class="row-action" type="button" :aria-label="`Editar a ${guest.name}`" @click.stop="editGuest(guest)">•••</button></td>
                  </tr>
                </tbody>
              </table>
              <div v-if="!filteredGuests.length" class="no-results">No hay invitados que coincidan con tu búsqueda.</div>
            </div>

            <div v-else class="tree-canvas">
              <div class="tree-legend">
                <span><i class="status-dot status-dot--confirmed"></i> Confirmado</span>
                <span><i class="status-dot status-dot--pending"></i> Pendiente</span>
                <span><i class="status-dot status-dot--declined"></i> No asiste</span>
                <small>Selecciona una tarjeta para editarla · usa + para crear una relación</small>
              </div>
              <div class="tree-stage">
                <ul class="guest-tree">
                  <GuestTreeNode
                    v-for="guest in rootGuests"
                    :key="guest.id"
                    :guest="guest"
                    :guests="currentEvent.guests"
                    @edit="editGuest"
                    @add-child="openGuestModal"
                  />
                </ul>
              </div>
            </div>
          </section>
        </div>
      </template>
    </section>

    <Transition name="toast">
      <div v-if="toast" class="toast" role="status"><span>✓</span>{{ toast }}</div>
    </Transition>

    <div v-if="modal" class="modal-backdrop" @mousedown.self="modal = null">
      <section v-if="modal === 'event'" class="modal-card modal-card--compact" role="dialog" aria-modal="true" aria-labelledby="event-modal-title">
        <button class="modal-close" type="button" aria-label="Cerrar" @click="modal = null">×</button>
        <span class="modal-kicker">Un nuevo comienzo</span>
        <h2 id="event-modal-title">Crea tu evento</h2>
        <p>Podrás invitar a tu equipo y organizar a todos después.</p>
        <form class="form-grid" @submit.prevent="createEvent">
          <label class="field field--full">Nombre del evento<input v-model="eventForm.name" required autofocus placeholder="Ej. Boda de Ana & Carlos" /></label>
          <label class="field">Tipo<select v-model="eventForm.type"><option>Boda</option><option>Cumpleaños</option><option>Cena</option><option>Corporativo</option><option>Otro</option></select></label>
          <label class="field">Fecha<input v-model="eventForm.date" required type="date" /></label>
          <label class="field field--full">Ubicación<input v-model="eventForm.location" placeholder="Lugar o ciudad" /></label>
          <div class="form-actions field--full"><button class="button button--ghost" type="button" @click="modal = null">Cancelar</button><button class="button button--primary" type="submit">Crear evento →</button></div>
        </form>
      </section>

      <section v-else-if="modal === 'guest'" class="modal-card modal-card--guest" role="dialog" aria-modal="true" aria-labelledby="guest-modal-title">
        <button class="modal-close" type="button" aria-label="Cerrar" @click="modal = null">×</button>
        <span class="modal-kicker">{{ editingGuestId ? 'Editar información' : guestForm.parentId ? 'Nueva relación' : 'Nueva persona' }}</span>
        <h2 id="guest-modal-title">{{ editingGuestId ? guestForm.name : 'Agregar invitado' }}</h2>
        <p>{{ editingGuestId ? 'Actualiza sus datos y su lugar en el árbol.' : 'Añade lo esencial; podrás completar los detalles después.' }}</p>
        <form class="form-grid" @submit.prevent="saveGuest">
          <label class="field field--full">Nombre completo<input v-model="guestForm.name" required autofocus placeholder="Nombre y apellidos" /></label>
          <label class="field">Correo electrónico<input v-model="guestForm.email" type="email" placeholder="correo@ejemplo.com" /></label>
          <label class="field">Teléfono<input v-model="guestForm.phone" type="tel" placeholder="+52 55 0000 0000" /></label>
          <label class="field">Grupo<input v-model="guestForm.group" placeholder="Familia, trabajo…" /></label>
          <label class="field">Relación<input v-model="guestForm.relation" placeholder="Pareja, amigo, colega…" /></label>
          <label class="field">Relacionado con
            <select v-model="guestForm.parentId"><option value="">Sin relación superior</option><option v-for="guest in currentEvent?.guests.filter((item) => item.id !== editingGuestId)" :key="guest.id" :value="guest.id">{{ guest.name }}</option></select>
          </label>
          <label class="field">Confirmación<select v-model="guestForm.rsvp"><option value="pending">Pendiente</option><option value="confirmed">Confirmado</option><option value="declined">No asiste</option></select></label>
          <label class="field">Acompañantes<input v-model.number="guestForm.companions" min="0" max="20" type="number" /></label>
          <label class="field">Restricciones alimentarias<input v-model="guestForm.dietary" placeholder="Alergias o preferencias" /></label>
          <label class="field field--full">Notas<textarea v-model="guestForm.notes" rows="3" placeholder="Información útil para el evento"></textarea></label>
          <div class="form-actions field--full form-actions--split">
            <button v-if="editingGuestId" class="button button--danger" type="button" @click="deleteGuest">Eliminar</button><span v-else></span>
            <span><button class="button button--ghost" type="button" @click="modal = null">Cancelar</button><button class="button button--primary" type="submit">Guardar invitado</button></span>
          </div>
        </form>
      </section>

      <section v-else-if="modal === 'share'" class="modal-card modal-card--compact" role="dialog" aria-modal="true" aria-labelledby="share-modal-title">
        <button class="modal-close" type="button" aria-label="Cerrar" @click="modal = null">×</button>
        <span class="modal-kicker">Compartir evento</span>
        <h2 id="share-modal-title">Invita a colaborar</h2>
        <p>El código da acceso inmediato. Una invitación por correo conserva el acceso.</p>
        <div class="share-code"><span><small>Código del evento</small><strong>{{ currentEvent?.accessCode }}</strong></span><button type="button" @click="copyAccessCode">Copiar</button></div>
        <div class="divider"><span>acceso permanente</span></div>
        <form class="invite-form" @submit.prevent="inviteMember">
          <label class="field">Correo electrónico<input v-model="inviteEmail" required type="email" placeholder="colaborador@correo.com" /></label>
          <label class="field">Permiso<select v-model="inviteRole"><option>Editor</option><option>Solo lectura</option></select></label>
          <button class="button button--primary" type="submit">Enviar invitación</button>
        </form>
        <div v-if="currentEvent?.members.length" class="member-list">
          <span v-for="member in currentEvent.members" :key="member.email"><i class="avatar">{{ initials(member.email) }}</i><span><strong>{{ member.email }}</strong><small>{{ member.role }} · {{ member.status }}</small></span></span>
        </div>
      </section>

      <section v-else class="modal-card modal-card--compact" role="dialog" aria-modal="true" aria-labelledby="join-modal-title">
        <button class="modal-close" type="button" aria-label="Cerrar" @click="modal = null">×</button>
        <span class="modal-kicker">Acceso rápido</span>
        <h2 id="join-modal-title">Entra con un código</h2>
        <p>Pega el código que te compartió la persona organizadora.</p>
        <form class="join-form" @submit.prevent="accessByCode">
          <input v-model="joinCode" required autofocus aria-label="Código del evento" placeholder="EJ. BODA-7K2" />
          <button class="button button--primary button--wide" type="submit">Acceder al evento →</button>
        </form>
      </section>
    </div>
  </div>
</template>
