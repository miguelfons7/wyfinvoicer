import type { Buyer, Fob, LoadType, Order, SalesRep } from '../types'
import {
  SEED_BUYERS,
  SEED_FOBS,
  SEED_LOAD_TYPES,
  SEED_SALES_REPS,
} from '../data/seedData'

const KEY_BUYERS = 'wyf.buyers'
const KEY_FOBS = 'wyf.fobs'
const KEY_LOAD_TYPES = 'wyf.loadTypes'
const KEY_SALES_REPS = 'wyf.salesReps'
const KEY_ORDERS = 'wyf.orders'

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export const store = {
  getBuyers: (): Buyer[] => read<Buyer[]>(KEY_BUYERS, SEED_BUYERS),
  setBuyers: (rows: Buyer[]) => write(KEY_BUYERS, rows),

  getFobs: (): Fob[] => read<Fob[]>(KEY_FOBS, SEED_FOBS),
  setFobs: (rows: Fob[]) => write(KEY_FOBS, rows),

  getLoadTypes: (): LoadType[] => read<LoadType[]>(KEY_LOAD_TYPES, SEED_LOAD_TYPES),
  setLoadTypes: (rows: LoadType[]) => write(KEY_LOAD_TYPES, rows),

  getSalesReps: (): SalesRep[] => read<SalesRep[]>(KEY_SALES_REPS, SEED_SALES_REPS),
  setSalesReps: (rows: SalesRep[]) => write(KEY_SALES_REPS, rows),

  getOrders: (): Order[] => read<Order[]>(KEY_ORDERS, []),
  saveOrder: (order: Order): void => {
    const all = store.getOrders()
    const idx = all.findIndex((o) => o.id === order.id)
    if (idx >= 0) all[idx] = order
    else all.unshift(order)
    write(KEY_ORDERS, all)
  },
  getOrder: (id: string): Order | undefined => store.getOrders().find((o) => o.id === id),
  deleteOrder: (id: string) => write(KEY_ORDERS, store.getOrders().filter((o) => o.id !== id)),

  resetAll: () => {
    localStorage.removeItem(KEY_BUYERS)
    localStorage.removeItem(KEY_FOBS)
    localStorage.removeItem(KEY_LOAD_TYPES)
    localStorage.removeItem(KEY_SALES_REPS)
    localStorage.removeItem(KEY_ORDERS)
  },
}

export function newId(prefix = 'id'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
