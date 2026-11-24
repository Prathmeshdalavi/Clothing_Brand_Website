import { useEffect } from 'react'

export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = title.includes('Blues Apparel') ? title : `${title} | Blues Apparel 23`
    const desc = description ?? 'Blues Apparel 23 — contemporary fashion, footwear and accessories. Demonstration online store by Rajsu Technologies.'
    let m = document.querySelector('meta[name="description"]')
    if (!m) { m = document.createElement('meta'); m.setAttribute('name', 'description'); document.head.appendChild(m) }
    m.setAttribute('content', desc)
  }, [title, description])
}
