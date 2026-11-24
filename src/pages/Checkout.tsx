import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, CreditCard, Landmark, Lock, Smartphone, Wallet } from 'lucide-react'
import { useDB, useShop } from '../store'
import { usePageMeta } from '../hooks/usePageMeta'
import { Breadcrumbs, EmptyState, Field } from '../components/ui'
import { Summary } from './CartPages'
import { cartLines, orders } from '../services'
import { cx, isEmail, isMobile, isPin } from '../lib/utils'
import { toast } from '../store/ui'
import type { Order } from '../types'

type Method = 'UPI' | 'Card' | 'Net Banking'
const STEPS = ['Details', 'Payment', 'Review']
const BANKS = ['Demo Bank A', 'Demo Bank B', 'Demo Bank C', 'Demo Bank D']

export default function Checkout() {
  usePageMeta('Checkout', 'Secure demo checkout for Blues Apparel 23.')
  const nav = useNavigate()
  const items = useShop((s) => s.cart)
  const user = useShop((s) => s.user)
  const saved = useShop((s) => s.addresses)
  const products = useDB((d) => d.products)
  const settings = useDB((d) => d.settings)
  const lines = cartLines(items, products)

  const [step, setStep] = useState(0)
  const [f, setF] = useState({ name: user?.name ?? '', email: user?.email ?? '', phone: user?.phone ?? '', address: '', city: '', state: '', pin: '', landmark: '' })
  const [errs, setErrs] = useState<Record<string, string>>({})
  const [method, setMethod] = useState<Method>('UPI')
  const [bank, setBank] = useState('')
  const [busy, setBusy] = useState(false)
  const [agree, setAgree] = useState(false)

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [step])

  if (!lines.length && !busy) {
    return <div className="container-x py-20"><EmptyState title="Your bag is empty" text="Add something to your bag before checking out." action={<Link to="/shop" className="btn btn-primary">Continue shopping</Link>} /></div>
  }

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value })

  const validateDetails = () => {
    const e: Record<string, string> = {}
    if (f.name.trim().length < 2) e.name = 'Please enter your full name'
    if (!isEmail(f.email)) e.email = 'Enter a valid email address'
    if (!isMobile(f.phone)) e.phone = 'Enter a valid 10-digit mobile number'
    if (f.address.trim().length < 6) e.address = 'Please enter your complete address'
    if (f.city.trim().length < 2) e.city = 'Enter your city'
    if (f.state.trim().length < 2) e.state = 'Enter your state'
    if (!isPin(f.pin)) e.pin = 'Enter a 6-digit PIN code'
    setErrs(e)
    return Object.keys(e).length === 0
  }
  const next = () => {
    if (step === 0 && !validateDetails()) { toast('Please fix the highlighted fields', { tone: 'err' }); return }
    if (step === 1 && method === 'Net Banking' && !bank) { setErrs({ bank: 'Choose a demo bank to continue' }); return }
    setErrs({}); setStep(step + 1)
  }

  const pay = async () => {
    if (!agree) { toast('Please accept the demo terms to continue', { tone: 'err' }); return }
    setBusy(true)
    await new Promise((r) => setTimeout(r, 2200)) // simulated gateway round-trip
    const res = await orders.place({
      customer: { name: f.name.trim(), email: f.email.trim(), phone: f.phone.trim() },
      address: { address: f.address.trim(), city: f.city.trim(), state: f.state.trim(), pin: f.pin.trim(), landmark: f.landmark.trim() },
      method,
    } as { customer: Order['customer']; address: Order['address']; method: Method })
    if (res.ok) nav('/order-confirmation')
    else { setBusy(false); toast(res.error, { tone: 'err' }); nav('/cart') }
  }

  const input = (k: keyof typeof f, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <Field label={label} error={errs[k]}>
      <input value={f[k]} onChange={set(k)} aria-invalid={!!errs[k]} className={cx('field', errs[k] && 'field-err')} {...props} />
    </Field>
  )

  const methods: { id: Method; label: string; desc: string; icon: typeof Wallet }[] = [
    { id: 'UPI', label: 'UPI', desc: 'Simulated payment via any UPI app', icon: Smartphone },
    { id: 'Card', label: 'Debit / Credit Card', desc: 'Simulated — no card details collected', icon: CreditCard },
    { id: 'Net Banking', label: 'Net Banking', desc: 'Simulated bank redirect', icon: Landmark },
  ]

  return (
    <div className="container-x py-8 md:py-12">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Bag', to: '/cart' }, { label: 'Checkout' }]} />
      <h1 className="text-4xl mt-5 mb-6">Checkout</h1>
      <ol className="flex items-center gap-2 sm:gap-4 mb-8 text-sm" aria-label="Checkout progress">
        {STEPS.map((s, i) => (
          <li key={s} className="flex items-center gap-2 sm:gap-3 flex-1 last:flex-none">
            <span className={cx('w-8 h-8 grid place-items-center rounded-full text-xs font-medium shrink-0 transition', i < step ? 'bg-navy text-ivory' : i === step ? 'bg-pastel text-navy ring-2 ring-navy' : 'bg-mist text-charcoal/50')}>{i < step ? <Check size={15} /> : i + 1}</span>
            <span className={cx('hidden sm:inline', i === step ? 'text-navy font-medium' : 'text-charcoal/55')}>{s}</span>
            {i < STEPS.length - 1 && <span className={cx('flex-1 h-px', i < step ? 'bg-navy' : 'bg-mist')} />}
          </li>
        ))}
      </ol>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-12 items-start">
        <div className="bg-white shadow-soft p-5 sm:p-8">
          {step === 0 && (
            <form onSubmit={(e) => { e.preventDefault(); next() }} noValidate className="space-y-8">
              <section>
                <h2 className="text-2xl mb-5">Customer information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">{input('name', 'Full name', { autoComplete: 'name' })}</div>
                  {input('email', 'Email address', { type: 'email', autoComplete: 'email' })}
                  {input('phone', 'Mobile number', { type: 'tel', inputMode: 'tel', autoComplete: 'tel', placeholder: '10-digit number' })}
                </div>
              </section>
              <section>
                <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
                  <h2 className="text-2xl">Delivery address</h2>
                  {saved.length > 0 && (
                    <select aria-label="Use a saved address" className="h-10 border border-mist px-3 text-sm bg-ivory" defaultValue="" onChange={(e) => { const a = saved.find((x) => x.id === e.target.value); if (a) setF({ ...f, address: a.address, city: a.city, state: a.state, pin: a.pin, landmark: a.landmark }) }}>
                      <option value="" disabled>Use saved address</option>
                      {saved.map((a) => <option key={a.id} value={a.id}>{a.label} — {a.city}</option>)}
                    </select>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">{input('address', 'Complete address', { autoComplete: 'street-address' })}</div>
                  {input('city', 'City', { autoComplete: 'address-level2' })}
                  {input('state', 'State', { autoComplete: 'address-level1' })}
                  {input('pin', 'PIN code', { inputMode: 'numeric', maxLength: 6, autoComplete: 'postal-code' })}
                  {input('landmark', 'Landmark (optional)')}
                </div>
              </section>
              <div className="flex justify-between gap-3 pt-2"><Link to="/cart" className="btn btn-ghost">Back to bag</Link><button className="btn btn-primary">Continue to payment</button></div>
            </form>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl mb-1">Payment method</h2>
                <p className="text-sm text-charcoal/60">All payment methods are simulated. No real transaction is made.</p>
              </div>
              <div className="space-y-3" role="radiogroup" aria-label="Payment method">
                {methods.map((m) => (
                  <button key={m.id} type="button" role="radio" aria-checked={method === m.id} onClick={() => setMethod(m.id)}
                    className={cx('w-full flex items-center gap-4 p-4 border text-left transition', method === m.id ? 'border-navy bg-pastel-100' : 'border-mist hover:border-navy/50 bg-white')}>
                    <m.icon size={22} className="text-navy shrink-0" />
                    <span className="flex-1"><span className="block font-medium text-sm text-navy">{m.label}</span><span className="block text-xs text-charcoal/60">{m.desc}</span></span>
                    <span className={cx('w-5 h-5 rounded-full border-2 grid place-items-center', method === m.id ? 'border-navy' : 'border-charcoal/30')}>{method === m.id && <span className="w-2.5 h-2.5 rounded-full bg-navy" />}</span>
                  </button>
                ))}
                <div aria-disabled className="w-full flex items-center gap-4 p-4 border border-mist bg-mist/50 opacity-70">
                  <Wallet size={22} className="text-charcoal/50 shrink-0" />
                  <span className="flex-1"><span className="block font-medium text-sm text-charcoal/70">Cash on Delivery</span><span className="block text-xs text-charcoal/55">Unavailable — awaiting confirmation from the business</span></span>
                  <span className="text-[10px] uppercase tracking-widest bg-white px-2 py-1 text-charcoal/60">Disabled</span>
                </div>
              </div>
              {method === 'UPI' && <p className="text-sm bg-ivory border border-mist p-4 text-charcoal/75">On the next step you’ll “approve” a simulated UPI request. No UPI ID is collected.</p>}
              {method === 'Card' && <p className="text-sm bg-ivory border border-mist p-4 text-charcoal/75 flex gap-2"><Lock size={16} className="shrink-0 mt-0.5 text-navy" /> For safety this demo never asks for real card numbers. Payment will be marked successful automatically.</p>}
              {method === 'Net Banking' && (
                <Field label="Choose a demo bank" error={errs.bank}>
                  <select value={bank} onChange={(e) => setBank(e.target.value)} className={cx('field', errs.bank && 'field-err')}>
                    <option value="">Select bank</option>{BANKS.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </Field>
              )}
              <div className="flex justify-between gap-3 pt-2"><button className="btn btn-ghost" onClick={() => setStep(0)}>Back</button><button className="btn btn-primary" onClick={next}>Review order</button></div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl">Review &amp; pay</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="border border-mist p-4"><p className="eyebrow mb-2">Customer</p><p className="font-medium">{f.name}</p><p className="text-charcoal/65">{f.email}</p><p className="text-charcoal/65">{f.phone}</p><button className="text-xs link-u text-navy mt-2" onClick={() => setStep(0)}>Edit</button></div>
                <div className="border border-mist p-4"><p className="eyebrow mb-2">Deliver to</p><p className="text-charcoal/75">{f.address}{f.landmark ? `, ${f.landmark}` : ''}</p><p className="text-charcoal/65">{f.city}, {f.state} {f.pin}</p><button className="text-xs link-u text-navy mt-2" onClick={() => setStep(0)}>Edit</button></div>
                <div className="border border-mist p-4 sm:col-span-2"><p className="eyebrow mb-2">Payment</p><p className="font-medium">{method}{method === 'Net Banking' ? ` — ${bank}` : ''} <span className="text-xs font-normal text-charcoal/55">(simulated)</span></p><button className="text-xs link-u text-navy mt-2" onClick={() => setStep(1)}>Change</button></div>
              </div>
              <ul className="divide-y divide-mist border-y border-mist text-sm">
                {lines.map((l) => <li key={l.item.key} className="py-3 flex justify-between gap-3"><span>{l.product.name} <span className="text-charcoal/55">· {l.item.colour} · {l.item.size} × {l.item.qty}</span></span><span>₹{(l.unit * l.item.qty).toLocaleString('en-IN')}</span></li>)}
              </ul>
              <label className="flex items-start gap-3 text-sm cursor-pointer">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="w-4 h-4 mt-0.5 accent-[#243B53]" />
                <span>I understand this is a demonstration. No real payment will be taken and no goods will be shipped. I’ve read the <Link to="/terms" className="link-u text-navy" target="_blank">terms</Link> and <Link to="/return-policy" className="link-u text-navy" target="_blank">return policy</Link> (no refund / exchange / cancellation, subject to owner confirmation).</span>
              </label>
              <div className="flex justify-between gap-3 pt-2"><button className="btn btn-ghost" onClick={() => setStep(1)}>Back</button><button className="btn btn-primary" onClick={pay}><Lock size={16} /> Pay securely (demo)</button></div>
            </div>
          )}
        </div>
        <div className="lg:sticky lg:top-28"><Summary showCoupon={step < 2} /><p className="text-xs text-charcoal/50 mt-3">Cash on Delivery: {settings.codEnabled ? 'enabled' : 'disabled until confirmed by the business'}.</p></div>
      </div>

      {busy && (
        <div className="fixed inset-0 z-[95] bg-navy/70 backdrop-blur-sm grid place-items-center p-6" role="alert" aria-live="assertive">
          <div className="bg-ivory p-8 max-w-sm w-full text-center shadow-lift">
            <div className="mx-auto w-12 h-12 rounded-full border-4 border-pastel border-t-navy animate-spin mb-5" />
            <h2 className="text-2xl mb-2">{method === 'UPI' ? 'Waiting for UPI approval' : method === 'Net Banking' ? 'Contacting demo bank' : 'Processing payment'}</h2>
            <p className="text-sm text-charcoal/65">Simulated payment in progress. Please don’t close this page.</p>
          </div>
        </div>
      )}
    </div>
  )
}
