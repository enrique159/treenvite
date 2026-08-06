<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'

const props = defineProps<{
  kind: 'terms' | 'privacy'
}>()

const auth = useAuthStore()
const isPrivacy = computed(() => props.kind === 'privacy')
const title = computed(() => (isPrivacy.value ? 'Aviso de privacidad' : 'Términos y condiciones'))
const intro = computed(() =>
  isPrivacy.value
    ? 'Este aviso explica qué información tratamos cuando utilizas Treenvite y las opciones que tienes sobre ella.'
    : 'Estas condiciones establecen las reglas para utilizar Treenvite y colaborar en la organización de eventos.',
)
</script>

<template>
  <div class="min-h-screen bg-base-200">
    <header class="border-b border-base-300 bg-base-100">
      <div class="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <RouterLink :to="auth.user ? '/events' : '/auth/login'" aria-label="Volver a Treenvite">
          <span class="font-display text-2xl text-secondary">treen<span class="text-primary">vite</span></span>
        </RouterLink>
        <RouterLink :to="auth.user ? '/events' : '/auth/login'" class="btn btn-ghost btn-sm">
          {{ auth.user ? 'Volver a la plataforma' : 'Volver al inicio' }}
        </RouterLink>
      </div>
    </header>

    <main class="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
      <div class="mb-8">
        <p class="text-xs font-bold uppercase tracking-[0.18em] text-primary">Información legal</p>
        <h1 class="mt-2 font-display text-4xl text-secondary sm:text-5xl">{{ title }}</h1>
        <p class="mt-4 max-w-2xl text-sm leading-6 opacity-65">{{ intro }}</p>
        <p class="mt-3 text-xs opacity-50">Última actualización: 6 de agosto de 2026 · Versión 1.0</p>
      </div>

      <article
        v-if="!isPrivacy"
        class="card border border-base-300 bg-base-100 shadow-sm [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-normal [&_h2]:leading-tight [&_h2]:text-secondary [&_p]:leading-7 [&_p]:opacity-75"
      >
        <div class="card-body max-w-none text-sm sm:text-base">
          <p class="!opacity-100 rounded-xl bg-primary/10 p-4 text-sm">
            Este documento es una base informativa para la operación de Treenvite. Antes de publicar el servicio,
            completa la identidad legal y los datos de contacto de la persona responsable y somételo a revisión legal
            según el país donde opere la plataforma.
          </p>
          <h2>1. Aceptación</h2>
          <p>
            Al crear una cuenta o utilizar Treenvite aceptas estos términos y el Aviso de privacidad. Si no estás de
            acuerdo con alguno de ellos, no debes utilizar el servicio.
          </p>
          <h2>2. El servicio</h2>
          <p>
            Treenvite permite crear eventos, organizar invitados en una tabla o árbol, colaborar con otras personas,
            acceder temporalmente mediante códigos y exportar información en formato CSV. Algunas funciones pueden
            depender de servicios de correo, autenticación de Google o de la disponibilidad de la infraestructura.
          </p>
          <h2>3. Tu cuenta</h2>
          <p>
            Debes proporcionar información verdadera y mantener la confidencialidad de tus credenciales y códigos de
            acceso. Eres responsable de la actividad realizada desde tu cuenta y de revisar a quién otorgas acceso a un
            evento.
          </p>
          <h2>4. Información de invitados y colaboradores</h2>
          <p>
            Sólo debes registrar o compartir datos de personas cuando tengas una base válida para hacerlo y hayas
            informado a las personas involucradas cuando corresponda. Quien crea un evento es responsable de la
            información que incorpora y de los permisos que concede a sus colaboradores.
          </p>
          <h2>5. Uso permitido</h2>
          <p>
            No puedes utilizar Treenvite para actividades ilegales, suplantar identidades, enviar comunicaciones no
            solicitadas, intentar acceder a cuentas ajenas, interferir con la seguridad del servicio o subir contenido
            que infrinja derechos de terceros.
          </p>
          <h2>6. Contenido y propiedad</h2>
          <p>
            Conservas los derechos sobre la información que agregas. Nos concedes únicamente los permisos necesarios
            para alojarla, procesarla y mostrarla como parte del servicio. La marca, interfaz y software de Treenvite
            pertenecen a sus respectivos titulares y no se transfieren por utilizar la plataforma.
          </p>
          <h2>7. Disponibilidad y responsabilidad</h2>
          <p>
            Procuramos mantener el servicio disponible y seguro, pero no garantizamos que sea ininterrumpido o libre de
            errores. Debes conservar copias de la información importante. En la medida permitida por la ley, el servicio
            se proporciona según su disponibilidad y no respondemos por decisiones tomadas exclusivamente con base en la
            información almacenada en la plataforma.
          </p>
          <h2>8. Suspensión y cancelación</h2>
          <p>
            Podemos limitar o suspender una cuenta cuando sea necesario para proteger el servicio, investigar un uso
            indebido o cumplir una obligación legal. Puedes borrar tu cuenta desde la sección de cuenta; esa acción es
            permanente y elimina tus datos de cuenta, eventos propios, invitados, accesos y sesiones, sujeto a las
            obligaciones de conservación que resulten aplicables.
          </p>
          <h2>9. Cambios y contacto</h2>
          <p>
            Podemos actualizar estos términos para reflejar cambios en el servicio o en la normativa. Publicaremos la
            versión vigente en esta página. Para preguntas sobre estos términos, utiliza el canal de contacto que se
            configure para Treenvite antes de la publicación del servicio.
          </p>
        </div>
      </article>

      <article
        v-else
        class="card border border-base-300 bg-base-100 shadow-sm [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-normal [&_h2]:leading-tight [&_h2]:text-secondary [&_p]:leading-7 [&_p]:opacity-75"
      >
        <div class="card-body max-w-none text-sm sm:text-base">
          <p class="!opacity-100 rounded-xl bg-primary/10 p-4 text-sm">
            Este aviso es una base informativa. Completa antes de publicar el nombre o razón social, domicilio,
            jurisdicción, correo de privacidad y demás datos exigidos por la normativa aplicable.
          </p>
          <h2>1. Responsable</h2>
          <p>
            El responsable del tratamiento será la persona o entidad que opere Treenvite. En la versión pública de este
            aviso se identificarán su nombre o razón social, domicilio y el correo destinado a solicitudes de
            privacidad.
          </p>
          <h2>2. Datos que podemos tratar</h2>
          <p>
            Podemos tratar tu nombre, correo electrónico, avatar, identidad de Google cuando eliges ese acceso y los
            datos necesarios para autenticar la cuenta. También tratamos la información que tú o tus colaboradores
            incorporan a un evento, como nombres de invitados, correos, teléfonos, grupos, relaciones, confirmaciones,
            acompañantes, restricciones alimentarias y notas.
          </p>
          <p>
            Para proteger las sesiones podemos procesar datos técnicos como dirección IP, navegador o agente de usuario,
            fechas de acceso y tokens de sesión almacenados de forma segura. No registramos datos personales de
            invitados en logs de aplicación como parte de la operación normal.
          </p>
          <h2>3. Finalidades</h2>
          <p>
            Usamos la información para crear y administrar cuentas y eventos, mostrar la lista y el árbol de invitados,
            permitir la colaboración, enviar invitaciones y correos de seguridad, generar exportaciones solicitadas,
            prevenir abusos, mantener la seguridad, atender solicitudes y cumplir obligaciones legales.
          </p>
          <h2>4. Compartición</h2>
          <p>
            La información de un evento puede ser visible para las personas a quienes su propietario conceda acceso o a
            quienes compartan un código vigente. Podemos apoyarnos en proveedores de infraestructura, correo y
            autenticación para operar Treenvite; sólo deben recibir la información necesaria para su función. No
            vendemos la información personal.
          </p>
          <h2>5. Cookies y tecnologías similares</h2>
          <p>
            Utilizamos cookies técnicas HttpOnly para mantener la sesión y medidas de seguridad asociadas. Son
            necesarias para iniciar sesión y proteger las solicitudes; no se utilizan para publicidad personalizada.
          </p>
          <h2>6. Conservación y eliminación</h2>
          <p>
            Conservamos la información mientras exista la cuenta o sea necesaria para las finalidades descritas. Desde
            la sección de cuenta puedes solicitar el borrado de tu cuenta y de la información relacionada. El borrado
            elimina permanentemente tus sesiones, identidades, eventos propios, invitados, membresías, invitaciones y
            accesos asociados, salvo la información que debamos conservar por una obligación legal.
          </p>
          <h2>7. Tus derechos</h2>
          <p>
            Puedes solicitar acceso, corrección, actualización, oposición, limitación o eliminación de tus datos, según
            resulte aplicable en tu jurisdicción. Para ejercerlos, utiliza el correo de privacidad que se publicará en
            la versión definitiva de este aviso. Podemos pedir información razonable para verificar tu identidad.
          </p>
          <h2>8. Seguridad y menores</h2>
          <p>
            Aplicamos controles técnicos y organizativos razonables, aunque ningún sistema conectado a internet es
            absolutamente invulnerable. Treenvite no está dirigido a menores que no puedan consentir el tratamiento de
            sus datos conforme a la normativa aplicable.
          </p>
          <h2>9. Cambios</h2>
          <p>
            Publicaremos en esta página la versión vigente y su fecha de actualización. Si un cambio es material,
            comunicaremos la actualización por los medios disponibles cuando corresponda.
          </p>
        </div>
      </article>

      <div class="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
        <RouterLink to="/terminos" class="link link-primary">Términos y condiciones</RouterLink>
        <RouterLink to="/privacidad" class="link link-primary">Aviso de privacidad</RouterLink>
      </div>
    </main>
  </div>
</template>
