import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr) {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d)
  } catch (e) {
    return dateStr
  }
}


export function getImageUrl(url) {
  if (!url) return ''
  // Strip hardcoded localhost / 127.0.0.1 if old URL was stored in DB
  let clean = url.replace(/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?/, '')
  if (clean.startsWith('/')) {
    const backendUrl = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '')
    return backendUrl ? `${backendUrl}${clean}` : clean
  }
  return clean
}

export function stripHtml(html) {
  if (!html) return ''
  return html
    .replace(/<[^>]*>?/gm, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
}
