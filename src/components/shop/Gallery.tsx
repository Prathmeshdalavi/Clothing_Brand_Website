import { useRef, useState } from 'react'
import { ZoomIn } from 'lucide-react'
import type { Product } from '../../types'
import { ProductImage } from '../art/Art'
import { cx } from '../../lib/utils'

export function Gallery({ p, colour }: { p: Product; colour: string }) {
  const [i, setI] = useState(0)
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const imgs = p.images.length ? p.images : ['art:0']

  const onScroll = () => {
    const el = scroller.current
    if (!el) return
    setI(Math.round(el.scrollLeft / el.clientWidth))
  }
  const go = (n: number) => {
    setI(n)
    const el = scroller.current
    if (el) el.scrollTo({ left: n * el.clientWidth, behavior: 'smooth' })
  }

  return (
    <div className="md:grid md:grid-cols-[84px_1fr] md:gap-4">
      {/* desktop thumbnails */}
      <div className="hidden md:flex flex-col gap-3">
        {imgs.map((im, n) => (
          <button key={n} onClick={() => setI(n)} aria-label={`View image ${n + 1}`} aria-current={i === n}
            className={cx('aspect-[4/5] overflow-hidden bg-mist border transition', i === n ? 'border-navy' : 'border-transparent opacity-70 hover:opacity-100')}>
            <ProductImage product={p} src={im} colour={colour} className="w-full h-full" />
          </button>
        ))}
      </div>

      {/* desktop main with hover zoom */}
      <div
        className="hidden md:block relative overflow-hidden bg-mist aspect-[4/5] cursor-zoom-in"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
        }}
        onMouseLeave={() => setZoom(null)}
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          setZoom((z) => (z ? null : { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }))
        }}
      >
        <div className="w-full h-full transition-transform duration-200 ease-out" style={zoom ? { transform: 'scale(2.1)', transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}>
          <ProductImage product={p} src={imgs[i]} colour={colour} className="w-full h-full" lazy={false} />
        </div>
        <span className="absolute bottom-3 right-3 bg-white/90 text-navy text-[11px] px-2.5 py-1.5 flex items-center gap-1.5 pointer-events-none"><ZoomIn size={13} /> Hover to zoom</span>
      </div>

      {/* mobile swipe gallery */}
      <div className="md:hidden relative -mx-4">
        <div ref={scroller} onScroll={onScroll} className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar" aria-label="Product images, swipe to browse">
          {imgs.map((im, n) => (
            <div key={n} className="snap-center shrink-0 w-full aspect-[4/5] bg-mist">
              <ProductImage product={p} src={im} colour={colour} className="w-full h-full" lazy={n > 0} />
            </div>
          ))}
        </div>
        <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
          {imgs.map((_, n) => (
            <button key={n} aria-label={`Go to image ${n + 1}`} onClick={() => go(n)} className={cx('h-1.5 rounded-full transition-all', i === n ? 'w-5 bg-navy' : 'w-1.5 bg-navy/35')} />
          ))}
        </div>
      </div>
    </div>
  )
}
