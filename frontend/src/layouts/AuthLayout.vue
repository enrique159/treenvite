<script setup lang="ts">
import BrandMark from '../components/BrandMark.vue'
</script>

<template>
  <main class="grid min-h-screen lg:grid-cols-[1.05fr_.95fr]">
    <section class="relative hidden overflow-hidden bg-secondary p-12 text-secondary-content lg:flex lg:flex-col lg:justify-between">
      <BrandMark class="[&_span:last-child]:text-white" />
      <div class="relative z-10 mx-auto max-w-xl">
        <p class="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-primary">Invitaciones con sentido</p>
        <h1 class="font-display text-6xl leading-[1.02]">Cada invitado tiene una historia. <em class="text-primary">Hazla visible.</em></h1>
        <p class="mt-6 max-w-lg text-base leading-7 text-white/70">Organiza tu evento desde las relaciones que lo hacen especial. Una lista clara, un árbol vivo y todo tu equipo en sintonía.</p>
        <div class="mt-12 flex items-center gap-5" aria-hidden="true">
          <span class="avatar placeholder"><span class="w-14 rounded-full bg-primary text-white">ML</span></span>
          <span class="h-px w-16 bg-white/25"></span>
          <span class="avatar placeholder"><span class="w-12 rounded-full bg-accent text-accent-content">AT</span></span>
          <span class="avatar placeholder"><span class="w-12 rounded-full bg-warning/40">CG</span></span>
          <span class="avatar placeholder"><span class="w-12 rounded-full bg-info/30">SR</span></span>
        </div>
      </div>
      <p class="font-display italic text-white/60">“Por fin dejamos de perdernos entre hojas de cálculo.”</p>
      <div class="absolute -bottom-52 -left-52 size-[34rem] rounded-full border border-white/10"></div>
    </section>
    <section class="grid place-items-center bg-base-100 px-6 py-12">
      <div class="w-full max-w-md">
        <BrandMark class="mb-12 lg:hidden" />
        <RouterView />
      </div>
    </section>
  </main>
</template>
