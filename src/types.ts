export type Kind =
  | 'tee' | 'shirt' | 'dress' | 'trousers' | 'coord' | 'jacket'
  | 'sneaker' | 'slide' | 'tote' | 'sling' | 'handbag'

export interface Colour { name: string; hex: string }

export interface Category {
  id: string
  name: string
  group: 'clothing' | 'footwear' | 'accessories'
  kind: Kind
  blurb: string
  enabled: boolean
}

export interface Product {
  id: string
  slug: string
  name: string
  category: string
  kind: Kind
  price: number
  mrp?: number
  colours: Colour[]
  sizes: string[]
  /** stock keyed by `${size}|${colourName}` */
  stock: Record<string, number>
  description: string
  fabric: string
  care: string[]
  /** `art:N` = generated placeholder view N, otherwise an image URL / data URL */
  images: string[]
  isNew: boolean
  bestSeller: boolean
  trending: boolean
  featured: boolean
  soldOut: boolean
  createdAt: string
  active: boolean
}

export interface CartItem {
  key: string
  productId: string
  size: string
  colour: string
  qty: number
}

export type OrderStatus =
  | 'Order Placed' | 'Confirmed' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Delivered'

export const ORDER_STATUSES: OrderStatus[] = [
  'Order Placed', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered',
]

export interface OrderItem {
  productId: string
  name: string
  slug: string
  size: string
  colour: string
  colourHex: string
  qty: number
  price: number
}

export interface Address {
  id: string
  label: string
  address: string
  city: string
  state: string
  pin: string
  landmark: string
}

export interface Order {
  id: string
  createdAt: string
  customer: { name: string; email: string; phone: string }
  address: Omit<Address, 'id' | 'label'>
  items: OrderItem[]
  subtotal: number
  discount: number
  delivery: number
  total: number
  coupon?: string
  payment: { method: 'UPI' | 'Card' | 'Net Banking' | 'COD'; status: 'Pending' | 'Paid' | 'Failed'; ref?: string }
  status: OrderStatus
  timeline: { status: OrderStatus; at: string }[]
  tracking?: { courier: string; number: string }
  deliveryNote?: string
  demo: true
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  city: string
  joinedAt: string
}

export interface Enquiry {
  id: string
  name: string
  email: string
  phone: string
  subject: string
  message: string
  createdAt: string
  status: 'New' | 'Replied'
}

export interface Coupon { code: string; type: 'percent' | 'flat'; value: number; minOrder: number; active: boolean; note: string }

export interface Banner { id: string; eyebrow: string; headline: string; sub: string; cta: string; link: string; active: boolean }

export interface Collection { id: string; name: string; blurb: string; productIds: string[]; active: boolean; tone: number }

export interface Offer { id: string; text: string; active: boolean }

export interface Look { id: string; name: string; blurb: string; productIds: string[] }

export interface PolicyPage { slug: string; title: string; body: string[] }

export interface ServiceToggle { id: string; title: string; desc: string; enabled: boolean }

export interface Settings {
  storeName: string
  hours: string
  phone: string
  whatsapp: string
  instagram: string
  address: string
  mapVerified: boolean
  mapUrl: string
  deliveryCharge: number
  lowStockThreshold: number
  codEnabled: boolean
  services: ServiceToggle[]
}

export interface DB {
  version: number
  products: Product[]
  categories: Category[]
  orders: Order[]
  customers: Customer[]
  enquiries: Enquiry[]
  coupons: Coupon[]
  banners: Banner[]
  collections: Collection[]
  offers: Offer[]
  looks: Look[]
  policies: PolicyPage[]
  subscribers: string[]
  settings: Settings
}

export interface User { name: string; email: string; phone: string }

export interface Shop {
  cart: CartItem[]
  wishlist: string[]
  recent: string[]
  user: User | null
  addresses: Address[]
  coupon: string | null
  lastOrderId: string | null
}
