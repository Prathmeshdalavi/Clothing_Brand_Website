import type { Colour, Product } from '../types'

export const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN')

export const uid = (p = 'id') => `${p}_${Math.random().toString(36).slice(2, 9)}`

export const stockKey = (size: string, colour: string) => `${size}|${colour}`

export const variantStock = (p: Product, size: string, colour: string) =>
  p.soldOut ? 0 : p.stock[stockKey(size, colour)] ?? 0

export const totalStock = (p: Product) => (p.soldOut ? 0 : Object.values(p.stock).reduce((a, b) => a + b, 0))

export const discountPct = (p: Product) => (p.mrp && p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0)

export const fmtDate = (iso: string, withTime = false) =>
  new Date(iso).toLocaleString('en-IN', withTime
    ? { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    : { day: '2-digit', month: 'short', year: 'numeric' })

export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(' ')

export function luminance(hex: string) {
  const h = hex.replace('#', '')
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export const colourByName = (p: Product, name: string): Colour => p.colours.find((c) => c.name === name) ?? p.colours[0]

export const WHATSAPP = 'https://wa.me/918794546813'
export const waLink = (text: string) => `${WHATSAPP}?text=${encodeURIComponent(text)}`

export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
export const isMobile = (s: string) => /^(\+91[\s-]?)?[6-9]\d{9}$/.test(s.replace(/\s/g, '').replace(/^0/, ''))
export const isPin = (s: string) => /^\d{6}$/.test(s)

export function downscaleImage(file: File, max = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Not a valid image'))
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height))
        const c = document.createElement('canvas')
        c.width = Math.round(img.width * scale)
        c.height = Math.round(img.height * scale)
        c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
        resolve(c.toDataURL('image/jpeg', 0.8))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}
