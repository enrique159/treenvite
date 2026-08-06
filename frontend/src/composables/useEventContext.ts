import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useEventsStore } from '../stores/events'

export function useEventContext() {
  const route = useRoute()
  const events = useEventsStore()
  const eventId = computed(() => String(route.params.eventId))
  onMounted(() => events.fetchOne(eventId.value))
  return { events, eventId, event: computed(() => events.current) }
}
