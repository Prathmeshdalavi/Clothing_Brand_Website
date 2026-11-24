import type { Order } from '../../types'

const dayKey = (d: Date) => d.toISOString().slice(0, 10)

export function daily(orders: Order[], days: number) {
  const out: { key: string; label: string; revenue: number; orders: number }[] = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now); d.setDate(now.getDate() - i)
    out.push({ key: dayKey(d), label: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), revenue: 0, orders: 0 })
  }
  orders.forEach((o) => {
    const row = out.find((r) => r.key === dayKey(new Date(o.createdAt)))
    if (row) { row.orders += 1; row.revenue += o.total }
  })
  return out
}

export function monthly(orders: Order[], months = 6) {
  const out: { key: string; label: string; revenue: number; orders: number }[] = []
  const now = new Date()
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    out.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }), revenue: 0, orders: 0 })
  }
  orders.forEach((o) => {
    const d = new Date(o.createdAt)
    const row = out.find((r) => r.key === `${d.getFullYear()}-${d.getMonth()}`)
    if (row) { row.orders += 1; row.revenue += o.total }
  })
  return out
}

export function productPerformance(orders: Order[]) {
  const m = new Map<string, { name: string; units: number; revenue: number }>()
  orders.forEach((o) => o.items.forEach((i) => {
    const r = m.get(i.productId) ?? { name: i.name, units: 0, revenue: 0 }
    r.units += i.qty; r.revenue += i.qty * i.price
    m.set(i.productId, r)
  }))
  return Array.from(m.values()).sort((a, b) => b.revenue - a.revenue)
}

export function downloadCsv(name: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  a.download = name
  a.click()
  URL.revokeObjectURL(a.href)
}
