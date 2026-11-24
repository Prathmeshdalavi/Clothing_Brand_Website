/**
 * Service layer. Every function here is the seam where a Spring Boot REST call
 * would go (see services/endpoints.ts). The demo implementation reads and writes
 * the browser's localStorage so no backend or credentials are required.
 */
import { dbStore, shopStore } from '../store'
import { ORDER_STATUSES } from '../types'
import type { Address, CartItem, DB, Order, OrderStatus, Product, User } from '../types'
import { colourByName, totalStock, uid, variantStock } from '../lib/utils'

const db = () => dbStore.get()
const shop = () => shopStore.get()

/* ---------- catalogue ---------- */
export const catalog = {
  bySlug: (slug: string) => db().products.find((p) => p.slug === slug && p.active),
  byId: (id: string) => db().products.find((p) => p.id === id),
  visible: () => db().products.filter((p) => p.active),
}

/* ---------- wishlist / recent ---------- */
export const wishlist = {
  toggle(id: string) {
    shopStore.set((s) => ({ ...s, wishlist: s.wishlist.includes(id) ? s.wishlist.filter((x) => x !== id) : [...s.wishlist, id] }))
  },
}
export const recent = {
  push(id: string) {
    if (shop().recent[0] === id) return
    shopStore.set((s) => ({ ...s, recent: [id, ...s.recent.filter((x) => x !== id)].slice(0, 12) }))
  },
}

/* ---------- cart ---------- */
export type CartResult = { ok: true } | { ok: false; error: string }

export const cart = {
  add(productId: string, size: string, colour: string, qty = 1): CartResult {
    const p = catalog.byId(productId)
    if (!p) return { ok: false, error: 'Product not found' }
    const avail = variantStock(p, size, colour)
    const key = `${productId}|${size}|${colour}`
    const existing = shop().cart.find((c) => c.key === key)
    const next = (existing?.qty ?? 0) + qty
    if (avail <= 0) return { ok: false, error: 'This size and colour is currently out of stock' }
    if (next > avail) return { ok: false, error: `Only ${avail} available in this size and colour` }
    shopStore.set((s) => ({
      ...s,
      cart: existing ? s.cart.map((c) => (c.key === key ? { ...c, qty: next } : c)) : [...s.cart, { key, productId, size, colour, qty }],
    }))
    return { ok: true }
  },
  setQty(key: string, qty: number): CartResult {
    const item = shop().cart.find((c) => c.key === key)
    if (!item) return { ok: false, error: 'Item not found' }
    const p = catalog.byId(item.productId)
    const avail = p ? variantStock(p, item.size, item.colour) : 0
    if (qty < 1) return { ok: false, error: 'Minimum quantity is 1' }
    if (qty > avail) return { ok: false, error: `Only ${avail} available` }
    shopStore.set((s) => ({ ...s, cart: s.cart.map((c) => (c.key === key ? { ...c, qty } : c)) }))
    return { ok: true }
  },
  remove(key: string) { shopStore.set((s) => ({ ...s, cart: s.cart.filter((c) => c.key !== key) })) },
  moveToWishlist(key: string) {
    const item = shop().cart.find((c) => c.key === key)
    if (!item) return
    shopStore.set((s) => ({
      ...s,
      cart: s.cart.filter((c) => c.key !== key),
      wishlist: s.wishlist.includes(item.productId) ? s.wishlist : [...s.wishlist, item.productId],
    }))
  },
  clear() { shopStore.set((s) => ({ ...s, cart: [], coupon: null })) },
  /** Replace the cart with a single item (Buy Now). */
  buyNow(productId: string, size: string, colour: string, qty: number): CartResult {
    const p = catalog.byId(productId)
    if (!p) return { ok: false, error: 'Product not found' }
    const avail = variantStock(p, size, colour)
    if (avail < qty) return { ok: false, error: avail ? `Only ${avail} available` : 'Out of stock' }
    shopStore.set((s) => ({ ...s, cart: [{ key: `${productId}|${size}|${colour}`, productId, size, colour, qty }] }))
    return { ok: true }
  },
}

export const coupons = {
  apply(code: string): { ok: boolean; message: string } {
    const c = db().coupons.find((x) => x.code.toLowerCase() === code.trim().toLowerCase() && x.active)
    if (!c) return { ok: false, message: 'This coupon code is not valid' }
    const t = pricing(shop().cart, null)
    if (t.subtotal < c.minOrder) return { ok: false, message: `This coupon needs a minimum order of ₹${c.minOrder.toLocaleString('en-IN')}` }
    shopStore.set((s) => ({ ...s, coupon: c.code }))
    return { ok: true, message: `${c.code} applied` }
  },
  remove() { shopStore.set((s) => ({ ...s, coupon: null })) },
}

export interface Line { item: CartItem; product: Product; colourHex: string; unit: number; max: number }

export function cartLines(items: CartItem[], products: Product[]): Line[] {
  return items.flatMap((item) => {
    const product = products.find((p) => p.id === item.productId)
    if (!product) return []
    return [{ item, product, colourHex: colourByName(product, item.colour).hex, unit: product.price, max: variantStock(product, item.size, item.colour) }]
  })
}

export function pricing(items: CartItem[], couponCode: string | null) {
  const products = db().products
  const subtotal = items.reduce((a, i) => a + (products.find((p) => p.id === i.productId)?.price ?? 0) * i.qty, 0)
  const c = couponCode ? db().coupons.find((x) => x.code === couponCode && x.active) : undefined
  let discount = 0
  if (c && subtotal >= c.minOrder) discount = c.type === 'percent' ? Math.round((subtotal * c.value) / 100) : Math.min(c.value, subtotal)
  const delivery = items.length ? db().settings.deliveryCharge : 0
  return { subtotal, discount, delivery, total: Math.max(0, subtotal - discount + delivery) }
}

/* ---------- auth (demo only: no passwords are stored or verified) ---------- */
export const auth = {
  login(email: string, name?: string, phone?: string): User {
    const existing = db().customers.find((c) => c.email.toLowerCase() === email.toLowerCase())
    const user: User = { name: name || existing?.name || email.split('@')[0], email, phone: phone || existing?.phone || '' }
    shopStore.set((s) => ({ ...s, user }))
    return user
  },
  logout() { shopStore.set((s) => ({ ...s, user: null })) },
  update(user: User) { shopStore.set((s) => ({ ...s, user })) },
  addAddress(a: Omit<Address, 'id'>) { shopStore.set((s) => ({ ...s, addresses: [...s.addresses, { ...a, id: uid('addr') }] })) },
  removeAddress(id: string) { shopStore.set((s) => ({ ...s, addresses: s.addresses.filter((a) => a.id !== id) })) },
}

/* ---------- orders ---------- */
export interface CheckoutInput {
  customer: { name: string; email: string; phone: string }
  address: Order['address']
  method: Order['payment']['method']
}

export const orders = {
  async place(input: CheckoutInput): Promise<{ ok: true; order: Order } | { ok: false; error: string }> {
    const s = shop()
    const lines = cartLines(s.cart, db().products)
    if (!lines.length) return { ok: false, error: 'Your bag is empty' }
    for (const l of lines) {
      if (l.max < l.item.qty) return { ok: false, error: `${l.product.name} (${l.item.size}, ${l.item.colour}) is no longer available in the requested quantity` }
    }
    const price = pricing(s.cart, s.coupon)
    const now = new Date().toISOString()
    const id = `BA23-DEMO-${String(Math.floor(10000 + Math.random() * 89999))}`
    const order: Order = {
      id, createdAt: now, customer: input.customer, address: input.address,
      items: lines.map((l) => ({ productId: l.product.id, name: l.product.name, slug: l.product.slug, size: l.item.size, colour: l.item.colour, colourHex: l.colourHex, qty: l.item.qty, price: l.unit })),
      ...price, coupon: s.coupon ?? undefined,
      payment: { method: input.method, status: 'Paid', ref: `SIM${Math.floor(100000 + Math.random() * 899999)}` },
      status: 'Order Placed', timeline: [{ status: 'Order Placed', at: now }], demo: true,
    }
    dbStore.set((d) => {
      // automatic stock deduction
      const products = d.products.map((p) => {
        const mine = order.items.filter((i) => i.productId === p.id)
        if (!mine.length) return p
        const stock = { ...p.stock }
        mine.forEach((i) => { const k = `${i.size}|${i.colour}`; stock[k] = Math.max(0, (stock[k] ?? 0) - i.qty) })
        return { ...p, stock }
      })
      const known = d.customers.find((c) => c.email.toLowerCase() === input.customer.email.toLowerCase())
      const customers = known ? d.customers : [...d.customers, { id: uid('c'), name: input.customer.name, email: input.customer.email, phone: input.customer.phone, city: input.address.city, joinedAt: now }]
      return { ...d, products, customers, orders: [order, ...d.orders] }
    })
    shopStore.set((st) => ({ ...st, cart: [], coupon: null, lastOrderId: id }))
    return { ok: true, order }
  },
  find: (id: string) => db().orders.find((o) => o.id.toLowerCase() === id.trim().toLowerCase()),
}

/* ---------- admin ---------- */
const patchOrder = (id: string, fn: (o: Order) => Order) => dbStore.set((d) => ({ ...d, orders: d.orders.map((o) => (o.id === id ? fn(o) : o)) }))

export const admin = {
  setStatus(id: string, status: OrderStatus) {
    patchOrder(id, (o) => {
      const idx = ORDER_STATUSES.indexOf(status)
      const have = new Set(o.timeline.map((t) => t.status))
      const add = ORDER_STATUSES.slice(0, idx + 1).filter((s) => !have.has(s)).map((s) => ({ status: s, at: new Date().toISOString() }))
      const timeline = [...o.timeline.filter((t) => ORDER_STATUSES.indexOf(t.status) <= idx), ...add]
      return { ...o, status, timeline }
    })
  },
  confirmPayment: (id: string) => patchOrder(id, (o) => ({ ...o, payment: { ...o.payment, status: 'Paid' } })),
  setTracking: (id: string, courier: string, number: string) => patchOrder(id, (o) => ({ ...o, tracking: { courier, number } })),
  setDeliveryNote: (id: string, note: string) => patchOrder(id, (o) => ({ ...o, deliveryNote: note })),
  saveProduct(p: Product) {
    dbStore.set((d) => ({ ...d, products: d.products.some((x) => x.id === p.id) ? d.products.map((x) => (x.id === p.id ? p : x)) : [p, ...d.products] }))
  },
  deleteProduct: (id: string) => dbStore.set((d) => ({ ...d, products: d.products.filter((p) => p.id !== id) })),
  patchProduct: (id: string, patch: Partial<Product>) => dbStore.set((d) => ({ ...d, products: d.products.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
  setStock: (id: string, key: string, qty: number) => dbStore.set((d) => ({ ...d, products: d.products.map((p) => (p.id === id ? { ...p, stock: { ...p.stock, [key]: Math.max(0, qty) } } : p)) })),
  update: (fn: (d: DB) => DB) => dbStore.set(fn),
  resetDemo() { dbStore.reset(); shopStore.reset() },
}

/* ---------- enquiries & newsletter ---------- */
export const enquiries = {
  async submit(e: { name: string; email: string; phone: string; subject: string; message: string }) {
    dbStore.set((d) => ({ ...d, enquiries: [{ ...e, id: uid('e'), createdAt: new Date().toISOString(), status: 'New' as const }, ...d.enquiries] }))
  },
}
export const newsletter = {
  async subscribe(email: string) {
    dbStore.set((d) => ({ ...d, subscribers: d.subscribers.includes(email) ? d.subscribers : [...d.subscribers, email] }))
  },
}

export { totalStock }
