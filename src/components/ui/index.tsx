import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Check, ChevronRight, X, AlertCircle } from 'lucide-react'
import { useToasts } from '../../store/ui'
import { cx, inr, discountPct } from '../../lib/utils'
import type { Product } from '../../types'

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function SectionHeading({ eyebrow, title, sub, action, center }: { eyebrow?: string; title: string; sub?: string; action?: ReactNode; center?: boolean }) {
  return (
    <div className={cx('mb-8 md:mb-12 flex flex-wrap items-end justify-between gap-4', center && 'flex-col items-center text-center')}>
      <div className={cx('max-w-xl', center && 'mx-auto')}>
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h2 className="text-3xl md:text-[2.6rem] leading-[1.1]">{title}</h2>
        {sub && <p className="mt-3 text-charcoal/70 text-[15px] leading-relaxed">{sub}</p>}
      </div>
      {action}
    </div>
  )
}

export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-charcoal/60 flex items-center flex-wrap gap-1">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1">
          {it.to ? <Link to={it.to} className="hover:text-navy">{it.label}</Link> : <span className="text-navy" aria-current="page">{it.label}</span>}
          {i < items.length - 1 && <ChevronRight size={12} aria-hidden />}
        </span>
      ))}
    </nav>
  )
}

export function Price({ p, size = 'md' }: { p: Product; size?: 'md' | 'lg' }) {
  const off = discountPct(p)
  return (
    <div className="flex items-baseline gap-2 flex-wrap">
      <span className={cx('font-medium text-navy', size === 'lg' ? 'text-2xl' : 'text-[15px]')}>{inr(p.price)}</span>
      {p.mrp && p.mrp > p.price && (
        <>
          <span className={cx('line-through text-charcoal/45', size === 'lg' ? 'text-base' : 'text-[13px]')}>{inr(p.mrp)}</span>
          <span className="text-[12px] font-medium text-emerald-700">{off}% off</span>
        </>
      )}
    </div>
  )
}

export function ToastHost() {
  const toasts = useToasts()
  return (
    <div className="fixed z-[90] left-1/2 -translate-x-1/2 bottom-24 md:bottom-8 flex flex-col gap-2 w-[min(92vw,420px)] pointer-events-none" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            className={cx('pointer-events-auto flex items-center gap-3 px-4 py-3 text-sm shadow-lift rounded-sm', t.tone === 'ok' ? 'bg-navy text-ivory' : 'bg-red-700 text-white')}
          >
            {t.tone === 'ok' ? <Check size={16} /> : <AlertCircle size={16} />}
            <span className="flex-1">{t.text}</span>
            {t.action && <Link to={t.action.to} className="font-medium underline underline-offset-4 whitespace-nowrap">{t.action.label}</Link>}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

/** Modal / drawer with focus trap-lite, ESC to close and scroll lock. */
export function Overlay({
  open, onClose, children, side = 'center', title, wide, panel,
}: { open: boolean; onClose: () => void; children: ReactNode; side?: 'center' | 'left' | 'right'; title: string; wide?: boolean; panel?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    ref.current?.focus()
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey) }
  }, [open, onClose])
  const pos = side === 'center' ? 'items-end md:items-center justify-center' : side === 'left' ? 'justify-start' : 'justify-end'
  const anim = side === 'center' ? { y: 40, opacity: 0 } : { x: side === 'left' ? -40 : 40, opacity: 0 }
  return (
    <AnimatePresence>
      {open && (
        <motion.div className={cx('fixed inset-0 z-[80] flex', pos)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-navy/45 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
          <motion.div
            ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}
            initial={anim} animate={{ x: 0, y: 0, opacity: 1 }} exit={anim}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className={cx(
              'relative bg-ivory shadow-lift outline-none overflow-y-auto overscroll-contain',
              side === 'center' ? cx('w-full max-h-[92vh] md:rounded-sm', wide ? 'md:max-w-4xl' : 'md:max-w-lg') : cx('h-full', panel ?? 'w-[88vw] max-w-sm'),
            )}
          >
            <button onClick={onClose} aria-label="Close" className="absolute top-3 right-3 z-10 w-10 h-10 grid place-items-center rounded-full bg-white/90 hover:bg-mist">
              <X size={18} />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && <p role="alert" className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="text-center py-16 px-4">
      <div className="mx-auto w-14 h-14 rounded-full bg-pastel-100 grid place-items-center mb-5">
        <span className="font-display text-navy text-xl">B</span>
      </div>
      <h3 className="text-2xl mb-2">{title}</h3>
      <p className="text-charcoal/65 max-w-md mx-auto mb-6 text-[15px]">{text}</p>
      {action}
    </div>
  )
}
