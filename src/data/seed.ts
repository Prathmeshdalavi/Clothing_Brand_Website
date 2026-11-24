import type {
  Category, Colour, Collection, Customer, DB, Kind, Look, Order, OrderStatus, PolicyPage, Product, Settings,
} from '../types'
import { ORDER_STATUSES } from '../types'

export const BRAND = {
  name: 'Blues Apparel 23',
  phone: '+91 9862227298',
  phoneRaw: '+919862227298',
  whatsapp: '+91 8794546813',
  whatsappUrl: 'https://wa.me/918794546813',
  instagram: 'https://www.instagram.com/blues.apparel_23/',
  handle: '@blues.apparel_23',
  hours: '9:00 AM – 8:00 PM',
  address: 'ITI Veng, Mualpui Road, near Ion Digital',
  devCompany: 'Rajsu Technologies',
  devPhone: '+91 9082332848',
}

const C: Record<string, Colour> = {
  ivory: { name: 'Ivory', hex: '#EFE9DD' },
  navy: { name: 'Navy', hex: '#243B53' },
  sky: { name: 'Sky Blue', hex: '#B8DCE8' },
  black: { name: 'Black', hex: '#2A2A2A' },
  sand: { name: 'Sand', hex: '#D6C2A3' },
  olive: { name: 'Olive', hex: '#6F7557' },
  rose: { name: 'Dusty Rose', hex: '#E2B9B4' },
  denim: { name: 'Mid Denim', hex: '#5F7FA0' },
  wash: { name: 'Washed Blue', hex: '#93B3CE' },
  white: { name: 'White', hex: '#F7F7F4' },
  tan: { name: 'Tan', hex: '#A98159' },
  grey: { name: 'Stone Grey', hex: '#A5ABB1' },
  sage: { name: 'Sage', hex: '#A9B8A0' },
  wine: { name: 'Wine', hex: '#6E2F3C' },
}

export const categories: Category[] = [
  { id: 'tops', name: 'Tops & Shirts', group: 'clothing', kind: 'shirt', blurb: 'Everyday tees, shirts and knits.', enabled: true },
  { id: 'dresses', name: 'Dresses', group: 'clothing', kind: 'dress', blurb: 'Easy silhouettes for every occasion.', enabled: true },
  { id: 'bottoms', name: 'Jeans & Trousers', group: 'clothing', kind: 'trousers', blurb: 'Denim and tailored staples.', enabled: true },
  { id: 'coords', name: 'Co-ord Sets', group: 'clothing', kind: 'coord', blurb: 'Matching sets, effortlessly styled.', enabled: true },
  { id: 'outerwear', name: 'Jackets & Outerwear', group: 'clothing', kind: 'jacket', blurb: 'Layers that finish the look.', enabled: true },
  { id: 'footwear', name: 'Sneakers & Footwear', group: 'footwear', kind: 'sneaker', blurb: 'Sneakers, slides and casual shoes.', enabled: true },
  { id: 'accessories', name: 'Bags & Accessories', group: 'accessories', kind: 'handbag', blurb: 'Bags and small details.', enabled: true },
]

const CLOTHING = ['XS', 'S', 'M', 'L', 'XL']
const WAIST = ['28', '30', '32', '34', '36']
const SHOES = ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10']
const ONE = ['One Size']

interface P {
  name: string; cat: string; kind: Kind; price: number; mrp?: number
  cols: string[]; sizes: string[]
  desc: string; fabric: string
  flags?: Partial<Pick<Product, 'isNew' | 'bestSeller' | 'trending' | 'featured' | 'soldOut'>>
  low?: boolean
}

const slugify = (s: string) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const CARE_GARMENT = ['Machine wash cold with similar colours', 'Do not bleach', 'Warm iron on reverse side if needed', 'Dry in shade']
const CARE_SHOE = ['Wipe clean with a soft damp cloth', 'Keep away from prolonged moisture', 'Store in a cool, dry place']
const CARE_BAG = ['Spot clean with a soft damp cloth', 'Avoid overloading', 'Store in a dust bag when not in use']

const list: P[] = [
  { name: 'Boxy Cotton Tee', cat: 'tops', kind: 'tee', price: 799, mrp: 999, cols: ['white', 'sky', 'black'], sizes: CLOTHING, desc: 'A relaxed boxy fit tee that pairs with everything in your wardrobe. Sample copy — edit to match the actual product.', fabric: 'Cotton jersey, mid-weight (sample specification)', flags: { isNew: true, bestSeller: true } },
  { name: 'Oxford Button-Down Shirt', cat: 'tops', kind: 'shirt', price: 1499, cols: ['sky', 'white', 'navy'], sizes: CLOTHING, desc: 'A classic button-down shirt with a clean, structured collar. Dress it up or wear it open over a tee.', fabric: 'Cotton oxford weave (sample specification)', flags: { isNew: true, trending: true } },
  { name: 'Ribbed Knit Polo', cat: 'tops', kind: 'tee', price: 1299, mrp: 1599, cols: ['ivory', 'navy', 'sage'], sizes: CLOTHING, desc: 'A soft ribbed polo with a slim, easy fit — a smart casual essential.', fabric: 'Cotton-blend rib knit (sample specification)', flags: { bestSeller: true } },
  { name: 'Linen Blend Camp Shirt', cat: 'tops', kind: 'shirt', price: 1699, cols: ['sand', 'sky', 'olive'], sizes: CLOTHING, desc: 'A breezy camp-collar shirt designed for warm days and weekend plans.', fabric: 'Linen-cotton blend (sample specification)', flags: { isNew: true } },
  { name: 'Cropped Baby Tee', cat: 'tops', kind: 'tee', price: 699, cols: ['rose', 'white', 'sky'], sizes: ['XS', 'S', 'M', 'L'], desc: 'A fitted cropped tee that layers beautifully under jackets and shirts.', fabric: 'Stretch cotton jersey (sample specification)', flags: { trending: true }, low: true },
  { name: 'Satin Slip Midi Dress', cat: 'dresses', kind: 'dress', price: 2499, mrp: 2999, cols: ['navy', 'sky', 'wine'], sizes: CLOTHING, desc: 'A fluid midi slip dress with a soft drape, made for evenings and special occasions.', fabric: 'Satin-finish polyester (sample specification)', flags: { isNew: true, bestSeller: true, featured: true } },
  { name: 'Floral Wrap Dress', cat: 'dresses', kind: 'dress', price: 2199, cols: ['sky', 'rose'], sizes: CLOTHING, desc: 'A wrap-style dress with an adjustable waist and a flattering fall.', fabric: 'Viscose crepe (sample specification)', flags: { trending: true } },
  { name: 'Poplin Shirt Dress', cat: 'dresses', kind: 'dress', price: 1999, cols: ['white', 'navy'], sizes: CLOTHING, desc: 'A crisp shirt dress with a belted waist — polished from day to night.', fabric: 'Cotton poplin (sample specification)', flags: { isNew: true } },
  { name: 'Ribbed Bodycon Mini', cat: 'dresses', kind: 'dress', price: 1399, mrp: 1799, cols: ['black', 'ivory', 'wine'], sizes: ['XS', 'S', 'M', 'L'], desc: 'A close-fit ribbed mini dress with stretch for all-day comfort.', fabric: 'Stretch rib knit (sample specification)', flags: { bestSeller: true } },
  { name: 'High-Rise Straight Jeans', cat: 'bottoms', kind: 'trousers', price: 1999, cols: ['denim', 'wash', 'black'], sizes: WAIST, desc: 'High-rise straight-leg jeans with a clean, versatile wash.', fabric: 'Cotton denim with a hint of stretch (sample specification)', flags: { bestSeller: true, featured: true } },
  { name: 'Wide-Leg Denim', cat: 'bottoms', kind: 'trousers', price: 2299, mrp: 2699, cols: ['wash', 'denim'], sizes: WAIST, desc: 'A relaxed wide-leg cut that gives a long, easy line.', fabric: 'Rigid cotton denim (sample specification)', flags: { isNew: true, trending: true } },
  { name: 'Pleated Tailored Trousers', cat: 'bottoms', kind: 'trousers', price: 1899, cols: ['black', 'sand', 'navy'], sizes: WAIST, desc: 'Sharp pleated trousers with a tapered leg and a comfortable rise.', fabric: 'Poly-viscose suiting (sample specification)', low: true },
  { name: 'Utility Cargo Joggers', cat: 'bottoms', kind: 'trousers', price: 1599, cols: ['olive', 'black', 'sand'], sizes: WAIST, desc: 'Utility pockets and a cuffed hem for a relaxed street look.', fabric: 'Cotton twill (sample specification)', flags: { trending: true } },
  { name: 'Linen Drawstring Pants', cat: 'bottoms', kind: 'trousers', price: 1399, cols: ['sand', 'white', 'sky'], sizes: WAIST, desc: 'Light, easy pants with an adjustable drawstring waist.', fabric: 'Linen blend (sample specification)', flags: { isNew: true } },
  { name: 'Knit Co-ord Set', cat: 'coords', kind: 'coord', price: 2799, cols: ['sky', 'ivory', 'navy'], sizes: CLOTHING, desc: 'A matching knit top and trouser set — comfortable enough for travel, polished enough for dinner.', fabric: 'Soft rib knit (sample specification)', flags: { isNew: true, bestSeller: true, featured: true } },
  { name: 'Linen Shirt & Short Set', cat: 'coords', kind: 'coord', price: 2399, mrp: 2899, cols: ['sand', 'sage'], sizes: CLOTHING, desc: 'A relaxed shirt and short set, designed to be worn together or mixed apart.', fabric: 'Linen blend (sample specification)', flags: { trending: true } },
  { name: 'Printed Lounge Co-ord', cat: 'coords', kind: 'coord', price: 1899, cols: ['rose', 'sky'], sizes: CLOTHING, desc: 'A soft printed set for weekends at home and easy outings.', fabric: 'Cotton-viscose blend (sample specification)' },
  { name: 'Tailored Blazer Co-ord', cat: 'coords', kind: 'coord', price: 3499, cols: ['navy', 'black', 'sand'], sizes: CLOTHING, desc: 'A structured blazer and trouser pairing for work and occasion dressing.', fabric: 'Poly-viscose suiting (sample specification)', flags: { isNew: true } },
  { name: 'Denim Trucker Jacket', cat: 'outerwear', kind: 'jacket', price: 2999, cols: ['denim', 'wash', 'black'], sizes: CLOTHING, desc: 'A timeless trucker jacket with a slightly cropped, boxy shape.', fabric: 'Cotton denim (sample specification)', flags: { bestSeller: true, featured: true } },
  { name: 'Classic Bomber Jacket', cat: 'outerwear', kind: 'jacket', price: 3299, mrp: 3799, cols: ['olive', 'navy', 'black'], sizes: CLOTHING, desc: 'A lightweight bomber with ribbed trims and a zip front.', fabric: 'Nylon-blend shell (sample specification)', flags: { trending: true } },
  { name: 'Quilted Puffer Jacket', cat: 'outerwear', kind: 'jacket', price: 3999, cols: ['black', 'sky'], sizes: CLOTHING, desc: 'A quilted puffer for cooler evenings. Currently shown as sold out to demonstrate stock handling.', fabric: 'Quilted polyester shell (sample specification)', flags: { soldOut: true } },
  { name: 'Oversized Blazer', cat: 'outerwear', kind: 'jacket', price: 3199, cols: ['sand', 'navy', 'grey'], sizes: CLOTHING, desc: 'An oversized single-breasted blazer that dresses up jeans or sits over a slip dress.', fabric: 'Poly-viscose suiting (sample specification)', flags: { isNew: true } },
  { name: 'Classic White Sneakers', cat: 'footwear', kind: 'sneaker', price: 2499, cols: ['white', 'ivory'], sizes: SHOES, desc: 'Clean low-top sneakers that go with absolutely everything.', fabric: 'Faux-leather upper, rubber sole (sample specification)', flags: { bestSeller: true, featured: true, isNew: true } },
  { name: 'Chunky Platform Sneakers', cat: 'footwear', kind: 'sneaker', price: 2999, mrp: 3499, cols: ['white', 'sky', 'black'], sizes: SHOES, desc: 'A bold platform sole adds height and a statement to everyday outfits.', fabric: 'Mixed synthetic upper, EVA sole (sample specification)', flags: { trending: true } },
  { name: 'Canvas Low-Top', cat: 'footwear', kind: 'sneaker', price: 1499, cols: ['navy', 'white', 'sand'], sizes: SHOES, desc: 'Lightweight canvas low-tops for relaxed everyday wear.', fabric: 'Cotton canvas, rubber sole (sample specification)', flags: { bestSeller: true } },
  { name: 'Leather-Look Slides', cat: 'footwear', kind: 'slide', price: 1299, cols: ['tan', 'black', 'white'], sizes: SHOES, desc: 'Easy slip-on slides with a cushioned footbed.', fabric: 'Synthetic leather, EVA footbed (sample specification)', flags: { isNew: true } },
  { name: 'Casual Slip-On Loafers', cat: 'footwear', kind: 'slide', price: 2199, cols: ['tan', 'black'], sizes: SHOES, desc: 'Slip-on loafers with a flexible sole for all-day comfort.', fabric: 'Synthetic upper (sample specification)' },
  { name: 'Canvas Tote Bag', cat: 'accessories', kind: 'tote', price: 899, cols: ['ivory', 'navy'], sizes: ONE, desc: 'A roomy everyday tote with reinforced handles.', fabric: 'Heavy cotton canvas (sample specification)', flags: { bestSeller: true } },
  { name: 'Crossbody Sling Bag', cat: 'accessories', kind: 'sling', price: 1599, mrp: 1899, cols: ['black', 'tan', 'sky'], sizes: ONE, desc: 'A compact sling with an adjustable strap and zip closure.', fabric: 'Synthetic leather (sample specification)', flags: { trending: true, isNew: true } },
  { name: 'Structured Handbag', cat: 'accessories', kind: 'handbag', price: 2299, cols: ['navy', 'sand', 'wine'], sizes: ONE, desc: 'A structured top-handle bag with a detachable shoulder strap.', fabric: 'Synthetic leather, fabric lining (sample specification)', flags: { featured: true } },
]

// deterministic pseudo random
function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

export function buildProducts(now = Date.now()): Product[] {
  return list.map((p, i) => {
    const colours = p.cols.map((c) => C[c])
    const stock: Record<string, number> = {}
    const r = rng(i * 97 + 13)
    p.sizes.forEach((s) => colours.forEach((c) => {
      let n = Math.floor(r() * 9)
      if (n < 2 && r() > 0.5) n = 0
      stock[`${s}|${c.name}`] = p.flags?.soldOut ? 0 : p.low ? Math.min(n, 1) : n + 1
    }))
    return {
      id: `p${String(i + 1).padStart(2, '0')}`,
      slug: slugify(p.name),
      name: p.name,
      category: p.cat,
      kind: p.kind,
      price: p.price,
      mrp: p.mrp,
      colours,
      sizes: p.sizes,
      stock,
      description: p.desc,
      fabric: p.fabric,
      care: p.kind === 'sneaker' || p.kind === 'slide' ? CARE_SHOE : ['tote', 'sling', 'handbag'].includes(p.kind) ? CARE_BAG : CARE_GARMENT,
      images: ['art:0', 'art:1', 'art:2'],
      isNew: !!p.flags?.isNew,
      bestSeller: !!p.flags?.bestSeller,
      trending: !!p.flags?.trending,
      featured: !!p.flags?.featured,
      soldOut: !!p.flags?.soldOut,
      createdAt: new Date(now - (list.length - i) * 2.2 * 86400000).toISOString(),
      active: true,
    }
  })
}

export const collections: Collection[] = [
  { id: 'everyday-essentials', name: 'Everyday Essentials', blurb: 'The pieces you reach for first — tees, denim and clean sneakers.', productIds: ['p01', 'p10', 'p23', 'p03', 'p26', 'p28'], active: true, tone: 0 },
  { id: 'weekend-edit', name: 'The Weekend Edit', blurb: 'Relaxed layers and easy sets for time off.', productIds: ['p04', 'p14', 'p15', 'p13', 'p19', 'p30'], active: true, tone: 1 },
  { id: 'street-layers', name: 'Street Layers', blurb: 'Jackets, cargos and platforms with attitude.', productIds: ['p20', 'p12', 'p24', 'p11', 'p02', 'p29'], active: true, tone: 2 },
  { id: 'occasion-edit', name: 'The Occasion Edit', blurb: 'Polished options for dinners, celebrations and more.', productIds: ['p06', 'p07', 'p18', 'p22', 'p27', 'p30'], active: true, tone: 3 },
]

export const looks: Look[] = [
  { id: 'look-1', name: 'Weekend Easy', blurb: 'Boxy tee, straight jeans and clean sneakers.', productIds: ['p01', 'p10', 'p23'] },
  { id: 'look-2', name: 'Evening Out', blurb: 'Slip dress with an oversized blazer and a structured bag.', productIds: ['p06', 'p22', 'p30'] },
  { id: 'look-3', name: 'City Layers', blurb: 'Oxford shirt, wide-leg denim and a trucker jacket.', productIds: ['p02', 'p11', 'p19'] },
]

const DISCLAIMER = 'Draft policy text for demonstration only. Subject to confirmation by Blues Apparel 23 and applicable consumer protection laws.'

export const policies: PolicyPage[] = [
  { slug: 'shipping-policy', title: 'Shipping & Delivery Policy', body: [DISCLAIMER, 'Delivery timelines, serviceable locations and delivery charges have not yet been confirmed by the business. These will be published here once finalised.', 'Customers will be able to track order progress from the Track Order page. In this demonstration all tracking is simulated.', 'Please share a complete address, PIN code and a reachable mobile number so that our team can contact you about your delivery.'] },
  { slug: 'return-policy', title: 'Return & Refund Policy', body: [DISCLAIMER, 'As currently stated on the Blues Apparel 23 Instagram profile, the store does not offer refunds or exchanges. This is the present stated business policy and remains subject to owner confirmation.', 'We encourage customers to check size, colour and availability with the store on WhatsApp before ordering. Use the size guide on every product page.', 'Nothing in this policy limits rights that customers may have under applicable consumer protection laws.'] },
  { slug: 'cancellation-policy', title: 'Cancellation Policy', body: [DISCLAIMER, 'As currently stated on the Blues Apparel 23 Instagram profile, orders cannot be cancelled once placed. This remains subject to owner confirmation.', 'If you have a question about an order, contact the store on WhatsApp or by phone as early as possible.'] },
  { slug: 'privacy-policy', title: 'Privacy Policy', body: [DISCLAIMER, 'This demonstration stores all data (cart, wishlist, account details and orders) only in your own browser using local storage. Nothing is sent to a server.', 'In a live version, personal information such as name, address and contact details would be used only to process and deliver orders and to respond to enquiries. The final privacy policy must be prepared with the business owner.'] },
  { slug: 'terms', title: 'Terms & Conditions', body: [DISCLAIMER, 'This website is a demonstration prepared by Rajsu Technologies for Blues Apparel 23. It is not an operational store; no real orders, payments or deliveries take place.', 'Product names, prices, stock levels, offers and reviews shown are sample data and do not represent actual inventory.', 'Final terms and conditions will be prepared with the business owner before launch.'] },
  { slug: 'payment-policy', title: 'Payment Policy', body: [DISCLAIMER, 'Online payments in this demonstration are simulated. No real card, UPI or banking details are collected and no money is transferred.', 'In a live version payments would be processed by a certified payment gateway. Cash on Delivery is disabled until the business confirms whether it will offer it.'] },
]

export const faqs = [
  { q: 'Is this a live store?', a: 'No. This is a demonstration website prepared for Blues Apparel 23. Products, prices, stock and payments are sample data, and no real orders are processed.' },
  { q: 'How can I check if a product is available in my size?', a: 'Use the Ask on WhatsApp button on any product page. It sends the product name, size and colour to the store in one tap.' },
  { q: 'Do you offer Cash on Delivery?', a: 'Cash on Delivery is switched off until the business confirms availability.' },
  { q: 'What is the return, exchange and cancellation policy?', a: 'The business has stated on Instagram that there are no refunds, exchanges or cancellations. This is subject to owner confirmation — please read the policy pages.' },
  { q: 'How long does delivery take, and what does it cost?', a: 'Delivery timelines and charges have not yet been confirmed by the business and will be published once finalised.' },
  { q: 'Can I visit the store?', a: 'Yes — Blues Apparel 23 is on ITI Veng, Mualpui Road, near Ion Digital. Store hours are 9:00 AM – 8:00 PM.' },
  { q: 'How do I track my order?', a: 'Open Track Order and enter your order ID. In this demo the status is updated from the admin panel.' },
]

export const defaultSettings: Settings = {
  storeName: 'Blues Apparel 23',
  hours: BRAND.hours,
  phone: BRAND.phone,
  whatsapp: BRAND.whatsapp,
  instagram: BRAND.instagram,
  address: BRAND.address,
  mapVerified: false,
  mapUrl: '',
  deliveryCharge: 0,
  lowStockThreshold: 10,
  codEnabled: false,
  services: [
    { id: 'whatsapp', title: 'WhatsApp Shopping Assistance', desc: 'Chat with the store to shop, confirm availability or get help placing an order.', enabled: true },
    { id: 'availability', title: 'Product Availability Enquiries', desc: 'Ask whether a style is available in your size and colour before you order.', enabled: true },
    { id: 'styling', title: 'Size & Styling Assistance', desc: 'Get help with sizing and outfit ideas from the team.', enabled: true },
    { id: 'store', title: 'Store Visit Information', desc: 'Opening hours, location and contact details for the physical store.', enabled: true },
    { id: 'delivery', title: 'Delivery Information', desc: 'Delivery coverage, timelines and charges once confirmed by the business.', enabled: true },
    { id: 'support', title: 'Order Support', desc: 'Help with an existing order, payment or tracking query.', enabled: true },
  ],
}

export const banners = [
  { id: 'b1', eyebrow: 'New season', headline: 'Your Everyday Style, Elevated.', sub: 'Discover fashion that brings confidence, comfort and elegance to every occasion.', cta: 'Shop New Arrivals', link: '/new-arrivals', active: true },
]

export const offers = [
  { id: 'o1', text: 'Discover Our Latest Collection', active: true },
  { id: 'o2', text: 'Shop Your Favourite Styles Online — Demo offer: use code DEMO10 for 10% off', active: true },
  { id: 'o3', text: 'Connect With Us on WhatsApp for sizes & availability', active: true },
]

export const coupons = [
  { code: 'DEMO10', type: 'percent' as const, value: 10, minOrder: 0, active: true, note: 'Demo: 10% off' },
  { code: 'WELCOME200', type: 'flat' as const, value: 200, minOrder: 1999, active: true, note: 'Demo: ₹200 off orders above ₹1,999' },
]

const FIRST = ['Aisha', 'Rohan', 'Meera', 'Kabir', 'Zoya', 'Arjun', 'Naina', 'Veer', 'Isha', 'Dev']
const CITIES = ['Aizawl', 'Aizawl', 'Lunglei', 'Champhai', 'Aizawl', 'Kolasib', 'Serchhip', 'Aizawl', 'Lunglei', 'Aizawl']

export function buildCustomers(now = Date.now()): Customer[] {
  return FIRST.map((n, i) => ({
    id: `c${i + 1}`,
    name: `${n} (Demo)`,
    email: `${n.toLowerCase()}.demo@example.com`,
    phone: `+91 90000 0000${i}`,
    city: CITIES[i],
    joinedAt: new Date(now - (60 - i * 5) * 86400000).toISOString(),
  }))
}

export function buildOrders(products: Product[], customers: Customer[], now = Date.now()): Order[] {
  const r = rng(2023)
  const out: Order[] = []
  for (let i = 0; i < 26; i++) {
    const daysAgo = Math.floor((26 - i) * 1.7 + r() * 1.2)
    const created = now - daysAgo * 86400000 - Math.floor(r() * 36000000)
    const cust = customers[Math.floor(r() * customers.length)]
    const nItems = 1 + Math.floor(r() * 3)
    const items = Array.from({ length: nItems }, () => {
      const p = products[Math.floor(r() * products.length)]
      const col = p.colours[Math.floor(r() * p.colours.length)]
      return { productId: p.id, name: p.name, slug: p.slug, size: p.sizes[Math.floor(r() * p.sizes.length)], colour: col.name, colourHex: col.hex, qty: 1 + (r() > 0.8 ? 1 : 0), price: p.price }
    })
    const subtotal = items.reduce((a, b) => a + b.price * b.qty, 0)
    const discount = r() > 0.75 ? Math.round(subtotal * 0.1) : 0
    const total = subtotal - discount
    // older orders further along
    const idx = daysAgo > 14 ? 5 : daysAgo > 9 ? 4 : daysAgo > 6 ? 3 : daysAgo > 3 ? 2 : daysAgo > 1 ? 1 : 0
    const statusIdx = Math.max(0, Math.min(5, idx - (r() > 0.8 ? 1 : 0)))
    const status = ORDER_STATUSES[statusIdx] as OrderStatus
    const timeline = ORDER_STATUSES.slice(0, statusIdx + 1).map((s, k) => ({ status: s, at: new Date(created + k * 8 * 3600000).toISOString() }))
    const method = (['UPI', 'Card', 'Net Banking', 'UPI'] as const)[Math.floor(r() * 4)]
    out.push({
      id: `BA23-DEMO-${String(10200 + i * 7)}`,
      createdAt: new Date(created).toISOString(),
      customer: { name: cust.name, email: cust.email, phone: cust.phone },
      address: { address: `${10 + i}, Sample Lane (demo address)`, city: cust.city, state: 'Mizoram', pin: '796001', landmark: 'Near demo landmark' },
      items, subtotal, discount, delivery: 0, total,
      coupon: discount ? 'DEMO10' : undefined,
      payment: { method, status: i > 22 && r() > 0.5 ? 'Pending' : 'Paid', ref: `SIM${100000 + i * 37}` },
      status, timeline,
      tracking: statusIdx >= 3 ? { courier: 'Demo Courier', number: `DC${700000 + i * 13}` } : undefined,
      demo: true,
    })
  }
  return out.reverse()
}

export const DB_VERSION = 1

export function buildDB(): DB {
  const now = Date.now()
  const products = buildProducts(now)
  const customers = buildCustomers(now)
  return {
    version: DB_VERSION,
    products, categories, customers,
    orders: buildOrders(products, customers, now),
    enquiries: [
      { id: 'e1', name: 'Naina (Demo)', email: 'naina.demo@example.com', phone: '+91 90000 00006', subject: 'Size enquiry', message: 'Is the Satin Slip Midi Dress available in M? (sample enquiry)', createdAt: new Date(now - 86400000 * 2).toISOString(), status: 'New' },
      { id: 'e2', name: 'Kabir (Demo)', email: 'kabir.demo@example.com', phone: '+91 90000 00003', subject: 'Store visit', message: 'Will the store be open on Sunday? (sample enquiry)', createdAt: new Date(now - 86400000 * 5).toISOString(), status: 'Replied' },
    ],
    coupons, banners, collections, offers, looks, policies,
    subscribers: [],
    settings: defaultSettings,
  }
}
