export type EventRole = 'viewer' | 'editor' | 'owner'
export type EventStatus = 'draft' | 'active' | 'finished'
export type RsvpStatus = 'pending' | 'confirmed' | 'declined'

export interface User {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  emailVerifiedAt: string | null
}

export interface EventItem {
  id: string
  ownerId: string
  name: string
  type: string
  startsAt: string
  location: string
  status: EventStatus
  color: string
  role?: EventRole
  version: number
  createdAt: string
  updatedAt: string
}

export interface Guest {
  id: string
  eventId: string
  parentId: string | null
  name: string
  email: string | null
  phone: string | null
  groupName: string
  relationLabel: string
  rsvp: RsvpStatus
  companions: number
  dietary: string | null
  notes: string | null
  version: number
}

export interface Paginated<T> {
  items: T[]
  page: number
  limit: number
  total: number
}

export interface ApiErrorBody {
  statusCode: number
  code: string
  message: string | string[]
  details?: unknown
}

export interface EventMember {
  id: string
  role: EventRole
  user: User
}

export interface EventInvitation {
  id: string
  email: string
  role: EventRole
  status: 'pending' | 'accepted' | 'revoked'
  expiresAt: string
}

export interface EventAccessCode {
  id: string
  role: EventRole
  maskedCode?: string
  code?: string
  expiresAt: string
  revokedAt: string | null
}
