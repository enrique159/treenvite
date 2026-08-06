import type { Guest } from './index'
export interface GuestTreeItem {
  guest: Guest
  children: GuestTreeItem[]
}
