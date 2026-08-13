<script setup lang="ts">
import BrandMark from '../components/BrandMark.vue'
import InitialsAvatar from '../components/InitialsAvatar.vue'
import LegalLinks from '../components/LegalLinks.vue'
</script>

<template>
  <main class="grid min-h-screen lg:grid-cols-[1.05fr_.95fr]">
    <section
      class="relative hidden overflow-hidden bg-secondary p-10 text-secondary-content lg:flex lg:flex-col lg:justify-between xl:p-12"
    >
      <RouterLink to="/" aria-label="Volver a Treenvite">
        <BrandMark class="[&_span:last-child]:text-white" />
      </RouterLink>
      <div class="relative z-10 mx-auto max-w-xl">
        <p class="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-primary">Invitaciones con sentido</p>
        <h1 class="font-display text-5xl leading-[1.02] xl:text-6xl">
          Cada invitado tiene una historia. <em class="text-primary">Hazla visible.</em>
        </h1>
        <p class="mt-6 max-w-lg text-base leading-7 text-white/70">
          Organiza tu evento desde las relaciones que lo hacen especial. Una lista clara, un árbol vivo y todo tu equipo
          en sintonía.
        </p>
        <div class="mt-8 flex items-center gap-5 xl:mt-12" aria-hidden="true">
          <InitialsAvatar name="María López" size="xl" tone="primary" />
          <span class="h-px w-16 bg-white/25"></span>
          <InitialsAvatar name="Ana Torres" size="lg" />
          <InitialsAvatar name="Carlos Gómez" size="lg" tone="warning" />
          <InitialsAvatar name="Sofía Ruiz" size="lg" tone="info" />
        </div>
      </div>
      <p class="font-display italic text-white/60">“Por fin dejamos de perdernos entre hojas de cálculo.”</p>
      <div class="absolute -bottom-52 -left-52 size-136 rounded-full border border-white/10"></div>
    </section>
    <section class="flex min-h-screen flex-col bg-base-100 px-5 py-10 sm:px-8 lg:px-10">
      <div class="m-auto w-full max-w-md">
        <BrandMark class="mb-12 lg:hidden" />
        <RouterView />
      </div>
      <LegalLinks class="mx-auto mt-10 w-full max-w-md" />
    </section>
  </main>
</template>
