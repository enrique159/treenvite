<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import BrandMark from '../components/BrandMark.vue'

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
        <RouterLink :to="auth.user ? '/events' : '/'" aria-label="Volver a Treenvite">
          <BrandMark />
        </RouterLink>
        <RouterLink :to="auth.user ? '/events' : '/'" class="btn btn-ghost btn-sm">
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
          <h2>1. Aceptación</h2>
          <p>
            Al crear una cuenta o utilizar Treenvite aceptas estos términos y el Aviso de privacidad. Si no estás de
            acuerdo con alguno de ellos, no debes utilizar el servicio.
          </p>
          <h2>2. El servicio</h2>
          <p>
            Treenvite, operado por Enrique Marín Hirales, permite crear eventos, organizar invitados en una tabla o
            árbol, colaborar con otras personas, acceder temporalmente mediante códigos y exportar información en
            formato CSV. Algunas funciones pueden depender de servicios de correo, autenticación de Google o de la
            disponibilidad de la infraestructura.
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
            versión vigente en esta página. Para preguntas sobre estos términos, escribe a
            <a class="link link-primary" href="mailto:enrique159624873@gmail.com">enrique159624873@gmail.com</a>. Estos
            términos se interpretarán conforme a las leyes aplicables de los Estados Unidos Mexicanos.
          </p>
        </div>
      </article>

      <article
        v-else
        class="card border border-base-300 bg-base-100 shadow-sm [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-normal [&_h2]:leading-tight [&_h2]:text-secondary [&_p]:leading-7 [&_p]:opacity-75"
      >
        <div class="card-body max-w-none text-sm sm:text-base">
          <h2>1. Identidad y domicilio del responsable</h2>
          <p>
            Enrique Marín Hirales, persona física, es responsable del tratamiento de los datos personales relacionados
            con las cuentas y la operación de Treenvite. Su domicilio para oír y recibir notificaciones es Iztaccíhuatl
            número 568, colonia Nueva Puesta del Sol, código postal 23095, La Paz, Baja California Sur, México. El
            correo de privacidad y atención de derechos ARCO es
            <a class="link link-primary" href="mailto:enrique159624873@gmail.com">enrique159624873@gmail.com</a>.
          </p>
          <h2>2. Alcance y datos de invitados</h2>
          <p>
            Este aviso aplica a las personas que crean una cuenta, colaboran en un evento o acceden mediante un código.
            Respecto de la información de invitados, la persona que crea u organiza el evento determina qué datos
            incorpora y con qué finalidad. Esa persona debe contar con una base legítima para tratarlos, informar a sus
            invitados y obtener el consentimiento que resulte necesario. Treenvite procesa esa información para prestar
            el servicio conforme a las instrucciones del organizador.
          </p>
          <h2>3. Datos personales tratados</h2>
          <p>
            Para cuentas y colaboradores podemos tratar nombre, correo electrónico, fotografía o avatar, estado de
            verificación del correo e identificador de la identidad utilizada para iniciar sesión. Para operar los
            eventos tratamos nombre, tipo, fecha, ubicación y estado del evento, así como la información que los
            usuarios incorporen sobre sus invitados: nombre, correo, teléfono, grupo, relación, estado de confirmación,
            número de acompañantes, restricciones alimentarias y notas.
          </p>
          <p>
            Las restricciones alimentarias y el contenido libre de las notas podrían revelar información de salud u
            otros datos personales sensibles. Deben registrarse únicamente cuando sean necesarios para la organización
            del evento y se cuente con el consentimiento expreso que corresponda. Treenvite no solicita datos
            financieros, patrimoniales ni documentos oficiales de identidad.
          </p>
          <p>
            Para proteger las sesiones también podemos tratar dirección IP, navegador o agente de usuario, fechas de
            acceso, identificadores de sesión y registros técnicos de seguridad. No incluimos datos personales de
            invitados en los logs de aplicación durante la operación normal.
          </p>
          <h2>4. Finalidades del tratamiento</h2>
          <p>
            Las finalidades necesarias son: crear, autenticar y administrar cuentas; verificar correos; recuperar el
            acceso; crear y administrar eventos; mostrar listas y árboles de invitados; buscar, ordenar y exportar
            datos; gestionar colaboradores, invitaciones y códigos temporales; enviar mensajes transaccionales y de
            seguridad; mantener sesiones; prevenir fraude, abuso y accesos no autorizados; atender solicitudes; resolver
            errores y cumplir obligaciones legales.
          </p>
          <p>
            No tratamos datos para mercadotecnia, publicidad, prospección comercial ni analítica de terceros. Tampoco
            vendemos datos personales. Si en el futuro se incorpora una finalidad secundaria, este aviso se actualizará
            y se solicitará el consentimiento cuando sea obligatorio.
          </p>
          <h2>5. Inicio de sesión con Google</h2>
          <p>
            El acceso con Google es opcional. Cuando lo eliges, Treenvite recibe de Google un identificador de cuenta,
            tu nombre, correo electrónico verificado y, si está disponible, tu fotografía de perfil. Utilizamos esos
            datos exclusivamente para crear o vincular tu cuenta, comprobar tu identidad e iniciar tu sesión. No
            solicitamos acceso a Google Drive, Google Calendar, Contactos, Gmail ni a otros contenidos de tu cuenta de
            Google.
          </p>
          <h2>6. Acceso, proveedores y transferencias</h2>
          <p>
            La información de un evento será visible para su propietario, los colaboradores invitados y las personas a
            quienes se conceda acceso mediante un código vigente, de acuerdo con los permisos definidos por el
            propietario. Al invitar o compartir un código, el propietario instruye ese acceso y es responsable de
            concederlo únicamente a personas autorizadas.
          </p>
          <p>
            Para operar Treenvite se utilizan proveedores de infraestructura y almacenamiento, correo transaccional y
            autenticación de Google. Esos proveedores sólo pueden tratar la información necesaria para prestar sus
            servicios y actúan conforme a sus obligaciones contractuales y de seguridad. No transferimos datos a
            terceros para finalidades propias que requieran consentimiento.
          </p>
          <h2>7. Cookies y tecnologías automáticas</h2>
          <p>
            Utilizamos cookies técnicas HttpOnly para mantener la sesión y mecanismos asociados para proteger las
            solicitudes. También podemos obtener automáticamente la dirección IP y datos del navegador necesarios para
            seguridad y diagnóstico. Estas tecnologías no se utilizan para publicidad, seguimiento comercial ni
            analítica de terceros.
          </p>
          <h2>8. Conservación y eliminación</h2>
          <p>
            Conservamos la información mientras exista la cuenta o sea necesaria para las finalidades descritas. Los
            códigos, invitaciones y sesiones cuentan con sus propios periodos de vigencia. Al borrar una cuenta desde la
            sección de cuenta se eliminan permanentemente sus sesiones, identidades, eventos propios, invitados,
            membresías, invitaciones y accesos asociados, salvo los datos que debamos bloquear o conservar durante el
            plazo exigido por una obligación legal o para atender responsabilidades derivadas del tratamiento.
          </p>
          <h2>9. Derechos ARCO, limitación y revocación</h2>
          <p>
            Puedes solicitar el acceso, rectificación, cancelación u oposición respecto de tus datos personales; limitar
            su uso o divulgación, o revocar tu consentimiento, escribiendo a
            <a class="link link-primary" href="mailto:enrique159624873@gmail.com">enrique159624873@gmail.com</a>. La
            solicitud debe indicar tu nombre, un medio para recibir respuesta, los datos involucrados, el derecho que
            deseas ejercer y una descripción clara de tu petición. Podremos solicitar la información estrictamente
            necesaria para comprobar tu identidad o representación.
          </p>
          <p>
            Comunicaremos la determinación dentro de los veinte días siguientes a la recepción de una solicitud
            completa. Si resulta procedente, la haremos efectiva dentro de los quince días siguientes. Estos plazos
            podrán ampliarse una sola vez por un periodo igual cuando las circunstancias lo justifiquen. El ejercicio de
            los derechos ARCO es gratuito, salvo los costos permitidos de reproducción o envío.
          </p>
          <h2>10. Seguridad e incidentes</h2>
          <p>
            Aplicamos medidas administrativas y técnicas razonables para proteger la información contra daño, pérdida,
            alteración, destrucción, acceso o tratamiento no autorizado. Ningún sistema conectado a internet es
            absolutamente invulnerable. Si ocurre una vulneración que afecte significativamente tus derechos
            patrimoniales o morales, te informaremos sin demora por los medios de contacto disponibles.
          </p>
          <h2>11. Menores de edad</h2>
          <p>
            Treenvite no está dirigido a menores que no puedan consentir por sí mismos el tratamiento de sus datos.
            Quien organice un evento y registre información de una persona menor debe contar con la autorización de
            quien ejerza su patria potestad o tutela cuando resulte exigible.
          </p>
          <h2>12. Cambios al aviso</h2>
          <p>
            Publicaremos cualquier modificación en esta misma página, indicando la fecha de actualización. Cuando un
            cambio sea material y contemos con un medio de contacto, también podremos comunicarlo por correo electrónico
            o mediante un aviso dentro de Treenvite. Si el cambio requiere un nuevo consentimiento, lo solicitaremos
            antes de aplicar el tratamiento correspondiente.
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
