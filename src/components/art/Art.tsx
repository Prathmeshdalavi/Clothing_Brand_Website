import { useId, useState } from 'react'
import type { Kind, Product } from '../../types'
import { luminance } from '../../lib/utils'

/**
 * Generated placeholder artwork. Replace with official brand photography by
 * uploading images in Admin > Products (or pointing Product.images at CDN URLs).
 * Components fall back to this artwork whenever an image fails to load.
 */

const LIGHT_BG = ['#E9ECEF', '#D9EAF1', '#EFE9DD', '#DFE6EC', '#F1EEE7', '#CFE4EC']

interface GProps { kind: Kind; fill: string; ink: string }

export function Garment({ kind, fill, ink }: GProps) {
  const st = { stroke: ink, strokeWidth: 1.6, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }
  const sheen = 'url(#sheen)'
  const body = (d: string, extra?: React.ReactNode) => (
    <>
      <path d={d} fill={fill} {...st} />
      <path d={d} fill={sheen} stroke="none" />
      {extra}
    </>
  )
  switch (kind) {
    case 'tee':
      return body('M138 86 L172 70 Q200 96 228 70 L262 86 L338 134 L308 180 L274 156 L274 410 L126 410 L126 156 L92 180 L62 134 Z',
        <>
          <path d="M172 70 Q200 96 228 70" fill="none" {...st} />
          <path d="M126 394 H274" fill="none" {...st} opacity=".6" />
        </>)
    case 'shirt':
      return body('M138 86 L172 70 L200 84 L228 70 L262 86 L340 150 L318 212 L282 186 L274 192 L274 420 L126 420 L126 192 L118 186 L82 212 L60 150 Z',
        <>
          <path d="M172 70 L200 84 L186 112 L158 92 Z M228 70 L200 84 L214 112 L242 92 Z" fill={fill} {...st} />
          <path d="M200 84 V420" fill="none" {...st} />
          {[132, 182, 232, 282, 332, 382].map((y) => <circle key={y} cx="206" cy={y} r="2.6" fill={ink} />)}
        </>)
    case 'dress':
      return body('M168 66 L180 66 L184 92 Q200 114 216 92 L220 66 L232 66 L240 150 Q252 192 264 232 L316 442 Q200 466 84 442 L136 232 Q148 192 160 150 Z',
        <>
          <path d="M156 160 Q200 176 244 160" fill="none" {...st} opacity=".7" />
          <path d="M138 232 Q200 250 262 232" fill="none" {...st} opacity=".5" />
        </>)
    case 'trousers':
      return body('M130 60 L270 60 L286 442 L212 442 L200 204 L188 442 L114 442 Z',
        <>
          <path d="M130 60 H270 V86 H130 Z" fill={fill} {...st} />
          <path d="M200 86 V204" fill="none" {...st} />
          <path d="M146 100 Q158 120 150 140 M254 100 Q242 120 250 140" fill="none" {...st} opacity=".6" />
        </>)
    case 'coord':
      return (
        <>
          <g transform="translate(76 4) scale(.62)"><Garment kind="tee" fill={fill} ink={ink} /></g>
          <g transform="translate(90 266) scale(.55)"><Garment kind="trousers" fill={fill} ink={ink} /></g>
        </>
      )
    case 'jacket':
      return body('M136 84 L172 66 Q200 92 228 66 L264 84 L338 140 L332 412 L292 412 L284 204 L276 432 L124 432 L116 204 L108 412 L68 412 L62 140 Z',
        <>
          <path d="M172 66 L200 100 L228 66" fill="none" {...st} />
          <path d="M200 100 V432" fill="none" {...st} />
          <path d="M142 330 H176 M224 330 H258" fill="none" {...st} opacity=".7" />
        </>)
    case 'sneaker':
      return (
        <>
          <path d="M44 336 H362 Q366 374 336 376 H70 Q40 374 44 336 Z" fill="#F4F3EF" {...st} />
          {body('M50 336 Q50 284 92 270 L140 254 Q178 198 228 216 L272 246 Q354 264 358 322 L358 340 L50 340 Z',
            <>
              <path d="M172 232 L196 252 M192 222 L216 242 M212 218 L236 236" fill="none" {...st} />
              <path d="M96 300 Q150 280 200 300" fill="none" {...st} opacity=".6" />
            </>)}
        </>
      )
    case 'slide':
      return (
        <>
          <path d="M56 346 Q56 300 110 296 H304 Q364 300 352 354 Q340 384 280 382 H110 Q56 380 56 346 Z" fill={ink} opacity=".35" />
          <path d="M56 346 Q56 300 110 296 H304 Q364 300 352 354 Q340 384 280 382 H110 Q56 380 56 346 Z" fill="none" {...st} />
          {body('M124 304 Q200 214 300 304 Z')}
        </>
      )
    case 'tote':
      return (
        <>
          <path d="M150 194 Q150 96 200 96 Q250 96 250 194" fill="none" stroke={fill} strokeWidth="12" strokeLinecap="round" />
          {body('M108 190 H292 L310 436 H90 Z', <path d="M100 300 H300" stroke={ink} strokeWidth="1.4" opacity=".4" fill="none" />)}
        </>
      )
    case 'sling':
      return (
        <>
          <path d="M126 214 Q200 20 274 214" fill="none" stroke={fill} strokeWidth="10" strokeLinecap="round" />
          {body('M88 262 Q88 214 132 214 H268 Q312 214 312 262 V378 Q312 414 268 414 H132 Q88 414 88 378 Z',
            <>
              <path d="M88 270 H312" fill="none" {...st} />
              <circle cx="200" cy="270" r="9" fill="none" {...st} />
            </>)}
        </>
      )
    case 'handbag':
    default:
      return (
        <>
          <path d="M140 234 Q140 136 200 136 Q260 136 260 234" fill="none" stroke={fill} strokeWidth="13" strokeLinecap="round" />
          {body('M78 232 H322 L340 424 H60 Z',
            <>
              <path d="M70 296 H330" fill="none" {...st} opacity=".6" />
              <rect x="186" y="286" width="28" height="20" rx="3" fill="none" {...st} />
            </>)}
        </>
      )
  }
}

export interface ArtProps {
  kind: Kind
  colour?: string
  view?: number
  tone?: number
  className?: string
  label?: string
}

export function ArtImage({ kind, colour = '#B8DCE8', view = 0, tone = 0, className, label }: ArtProps) {
  const uid = useId().replace(/:/g, '')
  const lum = luminance(colour)
  const ink = lum > 0.55 ? 'rgba(36,59,83,.38)' : 'rgba(255,255,255,.3)'
  const darkGarment = lum < 0.28
  const baseBg = lum > 0.78 ? ['#BCDCE8', '#C9D6E0', '#D8CDB8'][Math.abs(tone) % 3] : LIGHT_BG[Math.abs(tone) % LIGHT_BG.length]
  const altBg = darkGarment ? '#CFE4EC' : lum > 0.8 ? '#243B53' : '#B8DCE8'
  const bg = view === 1 ? altBg : baseBg
  const zoom = view === 2
  return (
    <svg
      viewBox="0 0 400 500"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role="img"
      aria-label={label ?? 'Product placeholder artwork'}
    >
      <defs>
        <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".28" />
          <stop offset=".55" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".14" />
        </linearGradient>
        <pattern id={`weave${uid}`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <rect width="6" height="6" fill="none" />
          <path d="M0 3 H6" stroke={lum > 0.55 ? '#243B53' : '#fff'} strokeOpacity=".10" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="400" height="500" fill={bg} />
      {view === 0 && <circle cx="300" cy="120" r="130" fill="#fff" opacity=".45" />}
      {view === 1 && <path d="M70 500 V230 Q70 70 200 70 Q330 70 330 230 V500 Z" fill={darkGarment ? '#fff' : lum > 0.8 ? '#B8DCE8' : '#fff'} opacity=".32" />}
      {view === 2 && <rect width="400" height="500" fill={`url(#weave${uid})`} />}
      {view !== 2 && <ellipse cx="200" cy="462" rx="120" ry="12" fill="#243B53" opacity=".10" />}
      <g
        transform={zoom ? 'translate(-190 -110) scale(1.95)' : view === 1 ? 'translate(200 250) rotate(-3) scale(1.04) translate(-200 -250)' : undefined}
      >
        <Garment kind={kind} fill={colour} ink={ink} />
        {zoom && <rect x="60" y="60" width="280" height="380" fill={`url(#weave${uid})`} opacity=".9" />}
      </g>
    </svg>
  )
}

/* ------------- editorial scenes (hero, categories, about, store, instagram) ------------- */

interface Layer { kind: Kind; fill: string; x: number; y: number; s: number; r?: number }
interface SceneSpec { bg: string; arch?: string; ring?: string; word?: string; wordFill?: string; layers: Layer[] }

const SCENES: Record<string, SceneSpec> = {
  hero: { bg: '#D6EAF1', arch: '#B8DCE8', word: '23', wordFill: '#243B53', layers: [
    { kind: 'dress', fill: '#243B53', x: 20, y: 40, s: 0.95, r: -4 },
    { kind: 'jacket', fill: '#F4F0E6', x: 120, y: 80, s: 0.8, r: 5 },
  ] },
  store: { bg: '#E9ECEF', arch: '#B8DCE8', word: 'BA', wordFill: '#243B53', layers: [
    { kind: 'shirt', fill: '#243B53', x: 10, y: 60, s: 0.7, r: -6 },
    { kind: 'trousers', fill: '#5F7FA0', x: 130, y: 70, s: 0.7 },
    { kind: 'sneaker', fill: '#F7F7F4', x: 100, y: 330, s: 0.55 },
  ] },
  about1: { bg: '#EFE9DD', arch: '#B8DCE8', layers: [{ kind: 'coord', fill: '#93B3CE', x: 30, y: 20, s: 0.95 }] },
  about2: { bg: '#243B53', arch: '#2F4A68', layers: [{ kind: 'jacket', fill: '#D6C2A3', x: 30, y: 30, s: 0.95 }] },
  about3: { bg: '#D6EAF1', arch: '#fff', layers: [{ kind: 'handbag', fill: '#243B53', x: 40, y: 20, s: 0.95 }] },
  ig1: { bg: '#B8DCE8', layers: [{ kind: 'tee', fill: '#F7F7F4', x: 20, y: 30, s: 1 }] },
  ig2: { bg: '#EFE9DD', layers: [{ kind: 'sneaker', fill: '#F7F7F4', x: 10, y: 100, s: 1 }] },
  ig3: { bg: '#243B53', arch: '#2F4A68', layers: [{ kind: 'dress', fill: '#B8DCE8', x: 20, y: 20, s: 1 }] },
  ig4: { bg: '#E9ECEF', layers: [{ kind: 'trousers', fill: '#5F7FA0', x: 20, y: 20, s: 1 }] },
  ig5: { bg: '#D6EAF1', arch: '#fff', layers: [{ kind: 'sling', fill: '#2A2A2A', x: 20, y: 40, s: 1 }] },
  ig6: { bg: '#F1EEE7', layers: [{ kind: 'jacket', fill: '#6F7557', x: 20, y: 20, s: 1 }] },
}

export function Scene({ name, className, label }: { name: string; className?: string; label?: string }) {
  const spec = SCENES[name] ?? SCENES.hero
  const uid = useId().replace(/:/g, '')
  return (
    <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" className={className} role="img" aria-label={label ?? 'Placeholder editorial artwork'}>
      <defs>
        <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".28" />
          <stop offset=".55" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".14" />
        </linearGradient>
      </defs>
      <rect width="400" height="500" fill={spec.bg} />
      {spec.arch && <path d="M40 500 V220 Q40 40 200 40 Q360 40 360 220 V500 Z" fill={spec.arch} opacity=".85" />}
      {spec.word && (
        <text x="200" y="330" textAnchor="middle" fontFamily="'Playfair Display', serif" fontSize="210" fontWeight="500" fill="none" stroke={spec.wordFill} strokeWidth="1.2" opacity=".35">{spec.word}</text>
      )}
      {spec.layers.map((l, i) => {
        const lum = luminance(l.fill)
        const ink = lum > 0.55 ? 'rgba(36,59,83,.38)' : 'rgba(255,255,255,.3)'
        return (
          <g key={`${uid}${i}`} transform={`translate(${l.x} ${l.y}) rotate(${l.r ?? 0} 200 250) scale(${l.s})`}>
            <ellipse cx="200" cy="470" rx="110" ry="10" fill="#000" opacity=".10" />
            <Garment kind={l.kind} fill={l.fill} ink={ink} />
          </g>
        )
      })}
    </svg>
  )
}

/* ------------- product image with real-image support and fallback ------------- */

export function ProductImage({
  product, src, colour, className = '', alt, lazy = true,
}: { product: Product; src?: string; colour?: string; className?: string; alt?: string; lazy?: boolean }) {
  const img = src ?? product.images[0] ?? 'art:0'
  const [failed, setFailed] = useState(false)
  const hex = colour ?? product.colours[0]?.hex ?? '#B8DCE8'
  const idx = Math.max(0, product.id.charCodeAt(product.id.length - 1) + product.id.charCodeAt(product.id.length - 2))
  if (img.startsWith('art:') || failed) {
    const view = img.startsWith('art:') ? Number(img.slice(4)) || 0 : 0
    return <ArtImage kind={product.kind} colour={hex} view={view} tone={idx} className={className} label={alt ?? product.name} />
  }
  return <img src={img} alt={alt ?? product.name} loading={lazy ? 'lazy' : 'eager'} decoding="async" onError={() => setFailed(true)} className={`object-cover ${className}`} />
}
