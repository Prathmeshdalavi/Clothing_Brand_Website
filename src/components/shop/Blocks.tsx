import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Instagram, MapPin, MessageCircle, Navigation, Phone } from 'lucide-react'
import { Scene } from '../art/Art'
import { Reveal, SectionHeading } from '../ui'
import { useDB } from '../../store'
import { BRAND } from '../../data/seed'
import { isEmail } from '../../lib/utils'
import { newsletter } from '../../services'

export function InstagramSection() {
  return (
    <section className="container-x py-16 md:py-24" aria-labelledby="ig-h">
      <Reveal>
        <SectionHeading eyebrow="Instagram" title="Follow the style, @blues.apparel_23" sub="A local gallery of sample imagery. Official photographs can be added once supplied by the brand." center />
      </Reveal>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5 md:gap-3">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <a key={n} href={BRAND.instagram} target="_blank" rel="noreferrer" aria-label={`Open Instagram, image ${n}`} className="group relative aspect-square overflow-hidden bg-mist block">
            <Scene name={`ig${n}`} className="w-full h-full transition duration-700 group-hover:scale-110" />
            <span className="absolute inset-0 bg-navy/0 group-hover:bg-navy/40 transition grid place-items-center"><Instagram className="text-white opacity-0 group-hover:opacity-100 transition" size={26} /></span>
          </a>
        ))}
      </div>
      <div className="text-center mt-8">
        <a className="btn btn-outline" href={BRAND.instagram} target="_blank" rel="noreferrer"><Instagram size={17} /> Follow {BRAND.handle}</a>
      </div>
      <h2 id="ig-h" className="sr-only">Instagram gallery</h2>
    </section>
  )
}

export function StoreVisit() {
  const s = useDB((d) => d.settings)
  return (
    <section className="container-x py-12 md:py-20" aria-labelledby="store-h">
      <div className="grid grid-cols-1 md:grid-cols-2 bg-white shadow-soft overflow-hidden">
        <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[460px] bg-mist">
          <Scene name="store" className="absolute inset-0 w-full h-full" label="Store image placeholder" />
          <span className="absolute bottom-3 left-3 bg-white/90 text-[11px] px-2.5 py-1 text-navy">Store photo placeholder</span>
        </div>
        <div className="p-8 md:p-14 flex flex-col justify-center">
          <p className="eyebrow mb-3">Visit the store</p>
          <h2 id="store-h" className="text-3xl md:text-4xl mb-6">Come say hello.</h2>
          <ul className="space-y-4 text-[15px] text-charcoal/80">
            <li className="flex gap-3"><MapPin size={18} className="text-navy mt-0.5 shrink-0" /> {s.address}</li>
            <li className="flex gap-3"><Clock size={18} className="text-navy mt-0.5 shrink-0" /> Open daily, {s.hours} <span className="text-charcoal/50 text-xs self-center">(as provided; confirm days)</span></li>
            <li className="flex gap-3"><Phone size={18} className="text-navy mt-0.5 shrink-0" /> {s.phone}</li>
            <li className="flex gap-3"><MessageCircle size={18} className="text-navy mt-0.5 shrink-0" /> {s.whatsapp} (WhatsApp)</li>
          </ul>
          <div className="flex flex-wrap gap-3 mt-8">
            {s.mapVerified && s.mapUrl
              ? <a className="btn btn-primary" href={s.mapUrl} target="_blank" rel="noreferrer"><Navigation size={16} /> Get Directions</a>
              : <button className="btn btn-primary" disabled title="Directions will be enabled once the exact map location is verified"><Navigation size={16} /> Get Directions</button>}
            <a className="btn btn-outline" href={`tel:${BRAND.phoneRaw}`}><Phone size={16} /> Call Store</a>
            <a className="btn btn-light" href={BRAND.whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={16} /> Chat on WhatsApp</a>
          </div>
          {!(s.mapVerified && s.mapUrl) && <p className="text-xs text-charcoal/55 mt-4">Directions will be enabled after the exact map location is verified with the owner.</p>}
        </div>
      </div>
    </section>
  )
}

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle')
  const [err, setErr] = useState('')
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isEmail(email)) { setErr('Please enter a valid email address'); return }
    setErr(''); setState('busy')
    await new Promise((r) => setTimeout(r, 600))
    await newsletter.subscribe(email)
    setState('done')
  }
  return (
    <section className="bg-pastel">
      <div className="container-x py-16 md:py-20 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <p className="eyebrow !text-navy mb-3">Newsletter</p>
          <h2 className="text-3xl md:text-4xl">First to know about new collections and offers.</h2>
          <p className="mt-3 text-navy/75 text-[15px]">Occasional updates — no spam. (Demo: sign-ups are stored only in this browser.)</p>
        </div>
        {state === 'done' ? (
          <p className="text-navy font-display text-2xl" role="status">Thank you — you’re on the list.</p>
        ) : (
          <form onSubmit={submit} noValidate className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label htmlFor="nl" className="sr-only">Email address</label>
              <input id="nl" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email address" className={`field ${err ? 'field-err' : ''}`} />
              {err && <p role="alert" className="text-xs text-red-700 mt-1">{err}</p>}
            </div>
            <button className="btn btn-primary" disabled={state === 'busy'}>{state === 'busy' ? 'Subscribing…' : 'Subscribe'}</button>
          </form>
        )}
      </div>
    </section>
  )
}

export function BackLink({ to, children }: { to: string; children: React.ReactNode }) {
  return <Link to={to} className="text-sm text-navy link-u">{children}</Link>
}
