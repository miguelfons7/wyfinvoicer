import type {
  Customer,
  Destination,
  Fob,
  LoadType,
  Order,
  Program,
  SalesRep,
} from '../types'
import {
  SEED_CUSTOMERS,
  SEED_DESTINATIONS,
  SEED_FOBS,
  SEED_LOAD_TYPES,
  SEED_PROGRAMS,
  SEED_SALES_REPS,
} from '../data/seedData'

const KEY_PROGRAMS = 'wyf.programs'
const KEY_CUSTOMERS = 'wyf.customers'
const KEY_DESTINATIONS = 'wyf.destinations'
const KEY_FOBS = 'wyf.fobs'
const KEY_LOAD_TYPES = 'wyf.loadTypes'
const KEY_SALES_REPS = 'wyf.salesReps'
const KEY_ORDERS = 'wyf.orders'

// Legacy keys from V1; cleared on resetAll so old buyer data doesn't linger.
const KEY_LEGACY_BUYERS = 'wyf.buyers'

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
  getPrograms: (): Program[] => read<Program[]>(KEY_PROGRAMS, SEED_PROGRAMS),
  setPrograms: (rows: Program[]) => write(KEY_PROGRAMS, rows),

  getCustomers: (): Customer[] => read<Customer[]>(KEY_CUSTOMERS, SEED_CUSTOMERS),
  setCustomers: (rows: Customer[]) => write(KEY_CUSTOMERS, rows),

  getDestinations: (): Destination[] =>
    read<Destination[]>(KEY_DESTINATIONS, SEED_DESTINATIONS),
  setDestinations: (rows: Destination[]) => write(KEY_DESTINATIONS, rows),

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
  deleteOrder: (id: string) =>
    write(KEY_ORDERS, store.getOrders().filter((o) => o.id !== id)),

  resetAll: () => {
    localStorage.removeItem(KEY_PROGRAMS)
    localStorage.removeItem(KEY_CUSTOMERS)
    localStorage.removeItem(KEY_DESTINATIONS)
    localStorage.removeItem(KEY_FOBS)
    localStorage.removeItem(KEY_LOAD_TYPES)
    localStorage.removeItem(KEY_SALES_REPS)
    localStorage.removeItem(KEY_ORDERS)
    localStorage.removeItem(KEY_LEGACY_BUYERS)
  },
}

export function newId(prefix = 'id'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
