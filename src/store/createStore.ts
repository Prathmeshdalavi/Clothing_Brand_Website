import { useRef, useSyncExternalStore } from 'react'

export interface Store<T> {
  get: () => T
  set: (fn: (s: T) => T) => void
  reset: () => void
  subscribe: (cb: () => void) => () => void
}

/** Tiny persisted store (localStorage). Swap for API-backed state when a backend exists. */
export function createStore<T>(key: string, init: () => T, isValid: (v: unknown) => boolean = () => true): Store<T> {
  const listeners = new Set<() => void>()
  const load = (): T => {
    try {
      const raw = localStorage.getItem(key)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (isValid(parsed)) return parsed as T
      }
    } catch { /* ignore corrupt data */ }
    const fresh = init()
    try { localStorage.setItem(key, JSON.stringify(fresh)) } catch { /* ignore */ }
    return fresh
  }
  let state = load()
  const emit = () => listeners.forEach((l) => l())
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key === key) { state = load(); emit() }
    })
  }
  return {
    get: () => state,
    set: (fn) => {
      state = fn(state)
      try { localStorage.setItem(key, JSON.stringify(state)) } catch (err) { console.warn('Storage full or unavailable', err) }
      emit()
    },
    reset: () => {
      state = init()
      try { localStorage.setItem(key, JSON.stringify(state)) } catch { /* ignore */ }
      emit()
    },
    subscribe: (cb) => { listeners.add(cb); return () => { listeners.delete(cb) } },
  }
}

function shallowEq(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => Object.is(x, b[i]))
  return false
}

/** Selector hook. Results are shallow-compared so selectors may return fresh arrays (filter/map). */
export function useStore<T, S>(store: Store<T>, selector: (s: T) => S): S {
  const last = useRef<{ v: S } | null>(null)
  const get = () => {
    const v = selector(store.get())
    if (last.current && shallowEq(last.current.v, v)) return last.current.v
    last.current = { v }
    return v
  }
  return useSyncExternalStore(store.subscribe, get)
}
