import { createStore, useStore } from './createStore'
import { buildDB, DB_VERSION } from '../data/seed'
import type { DB, Shop } from '../types'

export const dbStore = createStore<DB>('ba23.db.v1', buildDB, (v) => (v as DB)?.version === DB_VERSION)

export const shopStore = createStore<Shop>('ba23.shop.v1', () => ({
  cart: [], wishlist: [], recent: [], user: null, addresses: [], coupon: null, lastOrderId: null,
}))

export const useDB = <S,>(selector: (s: DB) => S) => useStore(dbStore, selector)
export const useShop = <S,>(selector: (s: Shop) => S) => useStore(shopStore, selector)
