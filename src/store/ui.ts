import { useSyncExternalStore } from 'react'

interface UI { quickView: string | null; search: boolean; menu: boolean; sizeGuide: string | null }
let state: UI = { quickView: null, search: false, menu: false, sizeGuide: null }
const subs = new Set<() => void>()
export const ui = {
  get: () => state,
  set(patch: Partial<UI>) { state = { ...state, ...patch }; subs.forEach((s) => s()) },
}
export function useUI<S>(sel: (u: UI) => S): S {
  return useSyncExternalStore((cb) => { subs.add(cb); return () => { subs.delete(cb) } }, () => sel(state))
}

export interface ToastMsg { id: number; text: string; tone: 'ok' | 'err'; action?: { label: string; to: string } }
let toasts: ToastMsg[] = []
const tsubs = new Set<() => void>()
let n = 0
export function toast(text: string, opts: { tone?: 'ok' | 'err'; action?: { label: string; to: string } } = {}) {
  const t: ToastMsg = { id: ++n, text, tone: opts.tone ?? 'ok', action: opts.action }
  toasts = [...toasts, t]
  tsubs.forEach((s) => s())
  setTimeout(() => { toasts = toasts.filter((x) => x.id !== t.id); tsubs.forEach((s) => s()) }, 3800)
}
export function useToasts() {
  return useSyncExternalStore((cb) => { tsubs.add(cb); return () => { tsubs.delete(cb) } }, () => toasts)
}
