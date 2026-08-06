export type RsvpStatus = 'confirmed' | 'pending' | 'declined'

export interface UserProfile {
  id: string
  name: string
  email: string
}

export interface Guest {
  id: string
  parentId: string | null
  name: string
  email: string
  phone: string
  group: string
  relation: string
  rsvp: RsvpStatus
  companions: number
  dietary: string
  notes: string
}

export interface EventMember {
  email: string
  role: 'Editor' | 'Solo lectura'
  status: 'Pendiente' | 'Activo'
}

export interface EventItem {
  id: string
  name: string
  type: string
  date: string
  location: string
  accessCode: string
  status: 'Borrador' | 'Activo' | 'Finalizado'
  color: string
  members: EventMember[]
  guests: Guest[]
}
