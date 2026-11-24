import { useState } from 'react'
import { useDB } from '../../store'
import { Overlay } from '../../components/ui'
import { Badge, PageHead, Panel, td, th } from './AdminLayout'
import { admin } from '../../services'
import { toast } from '../../store/ui'
import { cx, fmtDate, inr } from '../../lib/utils'
import { statusTone } from './Dashboard'

export default function Customers() {
  const customers = useDB((d) => d.customers)
  const orders = useDB((d) => d.orders)
  const enquiries = useDB((d) => d.enquiries)
  const [tab, setTab] = useState<'customers' | 'enquiries'>('customers')
  const [sel, setSel] = useState<string | null>(null)
  const rows = customers.map((c) => {
    const mine = orders.filter((o) => o.customer.email.toLowerCase() === c.email.toLowerCase())
    return { c, mine, spent: mine.reduce((a, o) => a + o.total, 0) }
  })
  const current = rows.find((r) => r.c.id === sel)
  return (
    <>
      <PageHead title="Customers" sub="Customer details shown here are dummy data." />
      <div className="flex gap-2 mb-5" role="tablist">
        {(['customers', 'enquiries'] as const).map((t) => <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cx('h-10 px-5 text-sm border capitalize transition', tab === t ? 'bg-navy text-ivory border-navy' : 'bg-white border-mist hover:border-navy')}>{t}{t === 'enquiries' && ` (${enquiries.filter((e) => e.status === 'New').length} new)`}</button>)}
      </div>
      {tab === 'customers' ? (
        <Panel>
          <div className="overflow-x-auto -mx-5">
            <table className="w-full min-w-[680px]">
              <thead><tr><th className={th}>Customer</th><th className={th}>Contact</th><th className={th}>City</th><th className={th}>Orders</th><th className={th}>Total spent</th><th className={th}>Joined</th></tr></thead>
              <tbody>
                {rows.map(({ c, mine, spent }) => (
                  <tr key={c.id} className="border-t border-mist hover:bg-ivory/60 cursor-pointer" onClick={() => setSel(c.id)}>
                    <td className={cx(td, 'font-medium text-navy')}><button className="link-u text-left" onClick={(e) => { e.stopPropagation(); setSel(c.id) }}>{c.name}</button></td>
                    <td className={td}>{c.email}<span className="block text-xs text-charcoal/55">{c.phone}</span></td>
                    <td className={td}>{c.city}</td><td className={td}>{mine.length}</td><td className={td}>{inr(spent)}</td><td className={td}>{fmtDate(c.joinedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      ) : (
        <Panel>
          {enquiries.length === 0 ? <p className="text-sm text-charcoal/55">No enquiries yet. Submit the form on the Contact page to see one appear here.</p> : (
            <ul className="divide-y divide-mist -mx-5">
              {enquiries.map((e) => (
                <li key={e.id} className="px-5 py-4 flex flex-wrap gap-4 justify-between">
                  <div className="min-w-0 max-w-2xl"><p className="font-medium text-sm">{e.subject} <span className="text-charcoal/50 font-normal">· {e.name}</span></p><p className="text-sm text-charcoal/70 mt-1">{e.message}</p><p className="text-xs text-charcoal/50 mt-2">{e.email} · {e.phone} · {fmtDate(e.createdAt, true)}</p></div>
                  <div className="flex items-start gap-2"><Badge tone={e.status === 'New' ? 'warn' : 'ok'}>{e.status}</Badge>
                    {e.status === 'New' && <button className="btn btn-outline btn-sm" onClick={() => { admin.update((d) => ({ ...d, enquiries: d.enquiries.map((x) => (x.id === e.id ? { ...x, status: 'Replied' as const } : x)) })); toast('Marked as replied') }}>Mark replied</button>}</div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}
      <Overlay open={!!current} onClose={() => setSel(null)} title="Customer details" side="right" panel="w-full max-w-lg">
        {current && (
          <div className="p-7 pt-14">
            <h2 className="text-2xl">{current.c.name}</h2>
            <p className="text-sm text-charcoal/65 mt-1">{current.c.email} · {current.c.phone} · {current.c.city}</p>
            <p className="eyebrow mt-8 mb-3">Order history ({current.mine.length})</p>
            {current.mine.length === 0 ? <p className="text-sm text-charcoal/55">No orders yet.</p> : (
              <ul className="divide-y divide-mist text-sm">{current.mine.map((o) => <li key={o.id} className="py-3 flex justify-between gap-3"><span><span className="font-medium text-navy">{o.id}</span><span className="block text-xs text-charcoal/55">{fmtDate(o.createdAt)}</span></span><span className="text-right">{inr(o.total)}<span className="block"><Badge tone={statusTone(o.status)}>{o.status}</Badge></span></span></li>)}</ul>
            )}
          </div>
        )}
      </Overlay>
    </>
  )
}
