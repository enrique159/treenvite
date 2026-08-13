<script setup lang="ts">
import { ArrowRight, CheckCircle2, Download, Network, ShieldCheck, Table2, UsersRound } from '@lucide/vue'
import BrandMark from '../components/BrandMark.vue'
import LegalLinks from '../components/LegalLinks.vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()

const features = [
  {
    icon: Table2,
    title: 'Todo en una lista clara',
    text: 'Administra datos de contacto, grupos, confirmaciones, acompañantes, restricciones y notas.',
  },
  {
    icon: Network,
    title: 'Relaciones que sí se entienden',
    text: 'Visualiza anfitriones, parejas, familiares, acompañantes y referidos en un árbol flexible.',
  },
  {
    icon: UsersRound,
    title: 'Organización compartida',
    text: 'Invita colaboradores por correo o comparte acceso temporal mediante un código con caducidad.',
  },
  {
    icon: Download,
    title: 'Tus datos, listos para salir',
    text: 'Exporta la lista de invitados en CSV para abrirla en tu hoja de cálculo preferida.',
  },
]
</script>

<template>
  <div class="min-h-screen overflow-hidden bg-base-100">
    <header class="relative z-20 border-b border-base-300/80 bg-base-100/95 backdrop-blur">
      <nav class="mx-auto flex h-18 max-w-7xl items-center justify-between gap-5 px-5 sm:px-8" aria-label="Principal">
        <RouterLink to="/" aria-label="Treenvite, inicio">
          <BrandMark />
        </RouterLink>
        <div class="hidden items-center gap-7 text-sm font-medium md:flex">
          <a href="#funciones" class="link link-hover">Funciones</a>
          <a href="#datos-de-google" class="link link-hover">Datos de Google</a>
          <RouterLink to="/privacidad" class="link link-hover">Privacidad</RouterLink>
        </div>
        <RouterLink :to="auth.user ? '/events' : '/auth/login'" class="btn btn-primary btn-sm sm:btn-md">
          {{ auth.user ? 'Ir a mis eventos' : 'Iniciar sesión' }}
          <ArrowRight class="size-4" aria-hidden="true" />
        </RouterLink>
      </nav>
    </header>

    <main>
      <section class="relative isolate">
        <div
          class="pointer-events-none absolute -right-48 -top-48 -z-10 size-136 rounded-full bg-primary/10 blur-3xl"
          aria-hidden="true"
        ></div>
        <div class="mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-2 lg:py-28">
          <div class="max-w-2xl">
            <h1 class="text-2xl font-bold text-secondary">Treenvite</h1>
            <p class="mt-4 font-display text-5xl leading-[0.98] text-secondary sm:text-6xl lg:text-7xl">
              Organiza a las personas detrás de cada evento.
            </p>
            <p class="mt-7 max-w-xl text-base leading-7 opacity-70 sm:text-lg sm:leading-8">
              Treenvite es una plataforma para crear eventos, gestionar invitados y entender cómo se relacionan entre
              sí. Trabaja en una tabla práctica o descubre la historia completa en una vista de árbol.
            </p>
            <div class="mt-9 flex flex-col gap-3 sm:flex-row">
              <RouterLink :to="auth.user ? '/events' : '/auth/register'" class="btn btn-primary btn-lg">
                {{ auth.user ? 'Ver mis eventos' : 'Crear una cuenta' }}
                <ArrowRight class="size-5" aria-hidden="true" />
              </RouterLink>
              <RouterLink v-if="!auth.user" to="/auth/login" class="btn btn-ghost btn-lg">Ya tengo cuenta</RouterLink>
            </div>
            <p class="mt-5 flex items-center gap-2 text-sm opacity-60">
              <ShieldCheck class="size-4 text-success" aria-hidden="true" />
              Inicia sesión con correo y contraseña o con tu cuenta de Google.
            </p>
          </div>

          <div class="relative mx-auto w-full max-w-xl" aria-label="Ejemplo de organización de invitados">
            <div class="absolute -inset-5 -z-10 rotate-2 rounded-4xl bg-secondary/8"></div>
            <div class="card overflow-hidden border border-base-300 bg-base-100 shadow-2xl shadow-secondary/10">
              <div class="flex items-center justify-between border-b border-base-300 bg-base-200/70 px-5 py-4">
                <div>
                  <p class="text-xs font-bold uppercase tracking-wider text-primary">Boda de Ana y Luis</p>
                  <p class="mt-1 font-display text-xl text-secondary">Árbol de invitados</p>
                </div>
                <span class="badge badge-success badge-soft">84 confirmados</span>
              </div>
              <div class="p-5 sm:p-7">
                <div class="mx-auto w-48 rounded-box border border-primary/25 bg-primary/8 p-4 text-center shadow-sm">
                  <p class="font-semibold">Ana y Luis</p>
                  <p class="mt-1 text-xs opacity-55">Anfitriones</p>
                </div>
                <div class="mx-auto h-6 w-px bg-base-300"></div>
                <div class="mx-auto h-px w-1/2 bg-base-300"></div>
                <div class="grid grid-cols-2 gap-5">
                  <div
                    class="pt-6 before:absolute before:-top-px before:left-1/2 before:h-6 before:w-px before:bg-base-300 relative"
                  >
                    <div class="rounded-box border border-base-300 bg-base-100 p-3 text-center shadow-sm">
                      <p class="text-sm font-semibold">Familia Torres</p>
                      <p class="mt-1 text-xs opacity-50">12 invitados</p>
                    </div>
                  </div>
                  <div
                    class="pt-6 before:absolute before:-top-px before:left-1/2 before:h-6 before:w-px before:bg-base-300 relative"
                  >
                    <div class="rounded-box border border-base-300 bg-base-100 p-3 text-center shadow-sm">
                      <p class="text-sm font-semibold">Amigos</p>
                      <p class="mt-1 text-xs opacity-50">26 invitados</p>
                    </div>
                  </div>
                </div>
                <div class="mt-7 grid grid-cols-3 gap-2 border-t border-base-300 pt-5 text-center">
                  <div>
                    <strong class="block text-lg text-secondary">120</strong
                    ><span class="text-xs opacity-50">Total</span>
                  </div>
                  <div>
                    <strong class="block text-lg text-success">84</strong
                    ><span class="text-xs opacity-50">Confirmados</span>
                  </div>
                  <div>
                    <strong class="block text-lg text-warning">31</strong
                    ><span class="text-xs opacity-50">Pendientes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="funciones" class="scroll-mt-20 bg-base-200 py-16 sm:py-24">
        <div class="mx-auto max-w-7xl px-5 sm:px-8">
          <div class="max-w-2xl">
            <p class="text-xs font-bold uppercase tracking-[0.2em] text-primary">Una sola fuente de verdad</p>
            <h2 class="mt-3 font-display text-4xl text-secondary sm:text-5xl">
              De la primera lista al último confirmado.
            </h2>
            <p class="mt-5 leading-7 opacity-65">
              Centraliza la operación del evento sin perder el contexto humano de cada invitación.
            </p>
          </div>
          <div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <article
              v-for="feature in features"
              :key="feature.title"
              class="card border border-base-300 bg-base-100 shadow-sm"
            >
              <div class="card-body gap-3 p-6">
                <span class="flex size-11 items-center justify-center rounded-box bg-primary/10 text-primary">
                  <component :is="feature.icon" class="size-5" aria-hidden="true" />
                </span>
                <h3 class="font-display text-2xl leading-tight text-secondary">{{ feature.title }}</h3>
                <p class="text-sm leading-6 opacity-65">{{ feature.text }}</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="datos-de-google" class="scroll-mt-20 py-16 sm:py-24">
        <div class="mx-auto grid max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.2em] text-primary">Acceso con Google</p>
            <h2 class="mt-3 font-display text-4xl text-secondary sm:text-5xl">Tú eliges cómo entrar.</h2>
            <p class="mt-5 leading-7 opacity-65">
              El acceso con Google es opcional. También puedes registrarte con correo electrónico y contraseña.
            </p>
          </div>
          <div class="card border border-base-300 bg-base-100 shadow-sm">
            <div class="card-body gap-5 p-6 sm:p-8">
              <div class="flex gap-4">
                <ShieldCheck class="mt-1 size-7 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <h3 class="font-display text-2xl text-secondary">Uso transparente de tus datos</h3>
                  <p class="mt-2 text-sm leading-6 opacity-70">
                    Si eliges continuar con Google, Treenvite recibe tu identificador de cuenta, nombre, correo
                    electrónico verificado y foto de perfil para crear o identificar tu cuenta e iniciar tu sesión.
                  </p>
                </div>
              </div>
              <ul class="grid gap-3 border-t border-base-300 pt-5 text-sm leading-6">
                <li class="flex gap-3">
                  <CheckCircle2 class="mt-1 size-4 shrink-0 text-success" aria-hidden="true" />No solicitamos acceso a
                  Google Drive, Calendar, Contactos ni a tus correos.
                </li>
                <li class="flex gap-3">
                  <CheckCircle2 class="mt-1 size-4 shrink-0 text-success" aria-hidden="true" />No vendemos tus datos ni
                  los usamos para publicidad personalizada.
                </li>
                <li class="flex gap-3">
                  <CheckCircle2 class="mt-1 size-4 shrink-0 text-success" aria-hidden="true" />Puedes consultar cómo
                  protegemos, conservamos y eliminamos la información.
                </li>
              </ul>
              <div>
                <RouterLink to="/privacidad" class="link link-primary font-semibold"
                  >Leer el aviso de privacidad</RouterLink
                >
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="px-5 pb-16 sm:px-8 sm:pb-24">
        <div
          class="mx-auto max-w-6xl overflow-hidden rounded-4xl bg-secondary px-6 py-12 text-center text-secondary-content sm:px-12"
        >
          <p class="text-xs font-bold uppercase tracking-[0.2em] text-primary">Tu evento, más claro</p>
          <h2 class="mx-auto mt-3 max-w-2xl font-display text-4xl sm:text-5xl">Empieza a organizar a tus invitados.</h2>
          <RouterLink :to="auth.user ? '/events' : '/auth/register'" class="btn btn-primary btn-lg mt-7">
            {{ auth.user ? 'Ir a mis eventos' : 'Crear una cuenta' }}
            <ArrowRight class="size-5" aria-hidden="true" />
          </RouterLink>
        </div>
      </section>
    </main>

    <footer class="border-t border-base-300 bg-base-200">
      <div class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-5 py-8 sm:flex-row sm:px-8">
        <BrandMark />
        <LegalLinks />
        <p class="text-xs opacity-55">© 2026 Treenvite</p>
      </div>
    </footer>
  </div>
</template>
