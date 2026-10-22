import { useState, useEffect, useRef, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Cpu,
  Leaf,
  Sprout,
  FlaskConical,
  Pill,
  Landmark,
  Globe,
  Zap,
  Rocket,
  Atom,
  Scroll,
  Layers,
  Building2,
  Calendar,
  Sparkles
} from 'lucide-react'

// Helper: Safely convert JSON, array, or semicolon string into string list
const toList = (val) => {
  if (!val) return []
  if (Array.isArray(val)) return val.map(x => String(x).trim()).filter(Boolean)
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val)
      if (Array.isArray(parsed)) return parsed.map(x => String(x).trim()).filter(Boolean)
    } catch (_) {}
    return val.split(';').map(x => x.trim()).filter(Boolean)
  }
  return []
}

// Icon mapper for fields based on keywords
const getFieldIcon = (name = '') => {
  const n = name.toLowerCase()
  if (n.includes('elektro') || n.includes('ai') || n.includes('data') || n.includes('komputer') || n.includes('informatika')) return Cpu
  if (n.includes('hayati') || n.includes('lingkungan') || n.includes('ekologi') || n.includes('biologi')) return Leaf
  if (n.includes('pangan') || n.includes('tani') || n.includes('ternak') || n.includes('perkebunan')) return Sprout
  if (n.includes('material') || n.includes('kimia') || n.includes('manufaktur') || n.includes('polimer')) return FlaskConical
  if (n.includes('sehat') || n.includes('obat') || n.includes('medis') || n.includes('vaksin') || n.includes('farmasi')) return Pill
  if (n.includes('sosial') || n.includes('ekonomi') || n.includes('pemerintah') || n.includes('kebijakan') || n.includes('kependudukan')) return Landmark
  if (n.includes('bumi') || n.includes('laut') || n.includes('bencana') || n.includes('geologi') || n.includes('osean')) return Globe
  if (n.includes('energi') || n.includes('ebt') || n.includes('listrik')) return Zap
  if (n.includes('transport') || n.includes('antariksa') || n.includes('roket') || n.includes('penerbangan')) return Rocket
  if (n.includes('nuklir') || n.includes('atom') || n.includes('radiasi')) return Atom
  if (n.includes('budaya') || n.includes('bahasa') || n.includes('sejarah') || n.includes('arkeologi') || n.includes('sastra')) return Scroll
  return Layers
}

// Default standard 11 bidang fallback if database is empty
const BIDANG_FALLBACK = [
  { name: 'Elektronika, Data & AI', Icon: Cpu },
  { name: 'Hayati & Lingkungan', Icon: Leaf },
  { name: 'Pangan & Pertanian', Icon: Sprout },
  { name: 'Material, Kimia & Manufaktur', Icon: FlaskConical },
  { name: 'Kesehatan & Obat', Icon: Pill },
  { name: 'Sosial, Ekonomi & Pemerintahan', Icon: Landmark },
  { name: 'Bumi, Laut & Kebencanaan', Icon: Globe },
  { name: 'Energi', Icon: Zap },
  { name: 'Transportasi & Antariksa', Icon: Rocket },
  { name: 'Nuklir', Icon: Atom },
  { name: 'Budaya, Bahasa & Sejarah', Icon: Scroll },
]

export default function ResearchOverviewModal({ open, onClose, publications = [] }) {
  const [selectedFieldName, setSelectedFieldName] = useState('ALL')
  const [selectedYearId, setSelectedYearId] = useState('ALL')
  const canvasRef = useRef(null)

  // Hover state untuk kanvas titik publikasi
  const [hoveredPub, setHoveredPub] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  // Reset filter ke ALL setiap kali modal dibuka
  useEffect(() => {
    if (open) {
      setSelectedFieldName('ALL')
      setSelectedYearId('ALL')
      setHoveredPub(null)
    }
  }, [open])

  /* ─────────────────────────────────────────────────────────
     1. SORTING PUBLIKASI BERDASARKAN ID_PUBLIKASI
  ───────────────────────────────────────────────────────── */
  const sortedPublications = useMemo(() => {
    return [...publications].sort((a, b) => {
      const idA = a.publication_id || ''
      const idB = b.publication_id || ''
      if (!idA && !idB) return (a.title || '').localeCompare(b.title || '')
      if (!idA) return 1
      if (!idB) return -1
      return idA.localeCompare(idB, undefined, { numeric: true, sensitivity: 'base' })
    })
  }, [publications])

  /* ─────────────────────────────────────────────────────────
     2. EKSTRAK SEMUA BIDANG YANG UNIQUE DARI KOLOM 'FIELD'
  ───────────────────────────────────────────────────────── */
  const uniqueFieldsList = useMemo(() => {
    const fieldMap = new Map() // name -> count
    sortedPublications.forEach(pub => {
      const fields = toList(pub.field)
      fields.forEach(f => {
        const clean = f.trim()
        if (clean && clean !== '-' && clean.toLowerCase() !== 'null') {
          fieldMap.set(clean, (fieldMap.get(clean) || 0) + 1)
        }
      })
    })

    if (fieldMap.size === 0) {
      return BIDANG_FALLBACK.map(b => ({
        name: b.name,
        countAll: 0,
        Icon: b.Icon
      }))
    }

    return Array.from(fieldMap.entries())
      .map(([name, countAll]) => ({
        name,
        countAll,
        Icon: getFieldIcon(name)
      }))
      .sort((a, b) => b.countAll - a.countAll)
  }, [sortedPublications])

  /* ─────────────────────────────────────────────────────────
     2.5. TAHUN TERBAWAH DARI DATA & TAHUN PATOKAN AKTIF
  ───────────────────────────────────────────────────────── */
  const minYear = useMemo(() => {
    let min = null
    sortedPublications.forEach(pub => {
      const y = Number(pub.year)
      if (!isNaN(y) && y > 1900 && y < 2035) {
        if (min === null || y < min) min = y
      }
    })
    return min || 2022
  }, [sortedPublications])

  // Tahun patokan 'sejak': jika filter tahun dipilih, pakai tahun tersebut; jika ALL, pakai tahun terbawah dari data
  const activeSinceYear = useMemo(() => {
    if (selectedYearId && selectedYearId !== 'ALL') {
      const parsed = Number(selectedYearId)
      if (!isNaN(parsed)) return parsed
    }
    return minYear
  }, [selectedYearId, minYear])

  // Bidang yang aktif dipilih (default 'ALL' = tampilkan semua tanpa filter)
  const selectedField = useMemo(() => {
    if (!selectedFieldName || selectedFieldName === 'ALL') {
      return {
        name: 'Semua Bidang Riset',
        id: 'ALL',
        countAll: sortedPublications.length,
        Icon: Layers
      }
    }
    const found = uniqueFieldsList.find(f => f.name.toLowerCase() === selectedFieldName.toLowerCase())
    return found || {
      name: 'Semua Bidang Riset',
      id: 'ALL',
      countAll: sortedPublications.length,
      Icon: Layers
    }
  }, [uniqueFieldsList, selectedFieldName, sortedPublications.length])

  /* ─────────────────────────────────────────────────────────
     3. FILTER PUBLIKASI PADA BIDANG AKTIF
  ───────────────────────────────────────────────────────── */
  const fieldPubs = useMemo(() => {
    if (!selectedField || selectedField.id === 'ALL' || selectedFieldName === 'ALL') return sortedPublications
    const target = selectedField.name.toLowerCase()
    return sortedPublications.filter(pub => {
      const fields = toList(pub.field)
      return fields.some(f => f.trim().toLowerCase() === target)
    })
  }, [sortedPublications, selectedField, selectedFieldName])

  // Hitung jumlah publikasi pada bidang aktif sejak tahun patokan (activeSinceYear)
  const countSinceActiveYear = useMemo(() => {
    let count = 0
    fieldPubs.forEach(pub => {
      const y = Number(pub.year)
      if (!isNaN(y) && y >= activeSinceYear) {
        count++
      }
    })
    return count
  }, [fieldPubs, activeSinceYear])

  /* ─────────────────────────────────────────────────────────
     4. HITUNG PUSAT RISET TERBANYAK (TOP 3 TERATAS UNIQUE)
  ───────────────────────────────────────────────────────── */
  const top3Centers = useMemo(() => {
    const centerCounts = new Map() // name -> count

    // Hitung kemunculan pusat riset pada publikasi di bidang ini
    fieldPubs.forEach(pub => {
      const centers = toList(pub.research_center)
      centers.forEach(c => {
        const clean = c.trim()
        if (clean && clean !== '-' && clean.toLowerCase() !== 'null' && clean.toLowerCase() !== 'none') {
          centerCounts.set(clean, (centerCounts.get(clean) || 0) + 1)
        }
      })
    })

    // Jika di bidang ini belum ada satker terpetakan, hitung dari seluruh publikasi sebagai referensi
    const sourceMap = centerCounts.size > 0 ? centerCounts : (() => {
      const allCounts = new Map()
      sortedPublications.forEach(pub => {
        toList(pub.research_center).forEach(c => {
          const clean = c.trim()
          if (clean && clean !== '-' && clean.toLowerCase() !== 'null') {
            allCounts.set(clean, (allCounts.get(clean) || 0) + 1)
          }
        })
      })
      return allCounts
    })()

    return Array.from(sourceMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
  }, [fieldPubs, sortedPublications])

  /* ─────────────────────────────────────────────────────────
     5. STATISTIK UMUM & YEAR TILES
  ───────────────────────────────────────────────────────── */
  const globalStats = useMemo(() => {
    const authorSet = new Set()
    const centerSet = new Set()
    const yearCounts = {}

    sortedPublications.forEach(pub => {
      toList(pub.brin_author).forEach(a => authorSet.add(a))
      toList(pub.research_center).forEach(c => {
        const clean = c.trim()
        if (clean && clean !== '-') centerSet.add(clean)
      })
      if (pub.year) {
        const y = String(pub.year)
        yearCounts[y] = (yearCounts[y] || 0) + 1
      }
    })

    const sortedYearsAsc = Object.keys(yearCounts)
      .map(Number)
      .filter(n => !isNaN(n) && n > 1990 && n < 2035)
      .sort((a, b) => a - b)

    const sortedYearsDesc = [...sortedYearsAsc].reverse()

    const yearTiles = [
      {
        id: 'ALL',
        label: 'Semua tahun',
        count: `${sortedPublications.length.toLocaleString('id-ID')} publikasi`,
      },
      ...sortedYearsDesc.slice(0, 7).map(yr => ({
        id: String(yr),
        label: String(yr),
        count: `${(yearCounts[String(yr)] || 0).toLocaleString('id-ID')} publikasi`,
      }))
    ]

    return {
      totalPubs: sortedPublications.length,
      totalAuthors: authorSet.size,
      totalCenters: centerSet.size,
      yearTiles,
      yearCounts
    }
  }, [sortedPublications])

  /* ─────────────────────────────────────────────────────────
     6. JEJAK TAHUNAN UNTUK BAR CHART BIDANG AKTIF
  ───────────────────────────────────────────────────────── */
  const yearlyTrend = useMemo(() => {
    const counts = {}
    fieldPubs.forEach(pub => {
      if (pub.year) {
        const yr = String(pub.year)
        counts[yr] = (counts[yr] || 0) + 1
      }
    })

    const sortedYears = Object.keys(counts).map(Number).filter(Boolean).sort((a, b) => a - b)
    const chartYears = sortedYears.length > 0
      ? sortedYears.slice(-8)
      : [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025]

    return chartYears.map(yr => ({
      year: String(yr),
      count: counts[String(yr)] || 0
    }))
  }, [fieldPubs])

  const maxYearlyCount = useMemo(() => {
    const counts = yearlyTrend.map(y => y.count)
    return Math.max(...counts, 10)
  }, [yearlyTrend])

  /* ─────────────────────────────────────────────────────────
     7. STRUKTUR GRID KANVAS TITIK (1 TITIK = 1 PUBLIKASI)
  ───────────────────────────────────────────────────────── */
  const gridInfo = useMemo(() => {
    const N = sortedPublications.length
    const width = 600
    const height = 300
    if (N === 0) {
      return { cols: 1, rows: 1, cellWidth: width, cellHeight: height, dotSize: 4, offsetX: 0, offsetY: 0, N: 0 }
    }

    const aspect = width / height // 2.0
    let cols = Math.max(1, Math.ceil(Math.sqrt(N * aspect)))
    let rows = Math.ceil(N / cols)
    while (cols * rows < N) {
      cols++
    }

    const cellWidth = width / cols
    const cellHeight = height / rows
    const maxDim = Math.min(cellWidth, cellHeight)
    const dotSize = Math.max(1.2, Math.min(10, maxDim * 0.78))
    const offsetX = (cellWidth - dotSize) / 2
    const offsetY = (cellHeight - dotSize) / 2

    return { cols, rows, cellWidth, cellHeight, dotSize, offsetX, offsetY, N }
  }, [sortedPublications.length])

  /* ─────────────────────────────────────────────────────────
     8. RENDER TITIK PADA KANVAS
  ───────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!open) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const width = 600
    const height = 300
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, width, height)

    const N = sortedPublications.length
    if (N === 0) {
      ctx.fillStyle = '#a1a1aa'
      ctx.font = '12px Segoe UI, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Belum ada data publikasi di tabel.', width / 2, height / 2)
      return
    }

    const { cols, cellWidth, cellHeight, dotSize, offsetX, offsetY } = gridInfo
    const isAllField = !selectedField || selectedField.id === 'ALL' || selectedFieldName === 'ALL'
    const activeFieldName = selectedField.name ? selectedField.name.toLowerCase() : ''

    for (let i = 0; i < N; i++) {
      const pub = sortedPublications[i]
      const col = i % cols
      const row = Math.floor(i / cols)
      const x = col * cellWidth + offsetX
      const y = row * cellHeight + offsetY

      const pubFields = toList(pub.field).map(f => f.trim().toLowerCase())
      const isFieldMatch = isAllField || pubFields.includes(activeFieldName)
      const isYearMatch = selectedYearId === 'ALL' || (pub.year && String(pub.year) === selectedYearId)

      if (isFieldMatch && isYearMatch) {
        ctx.fillStyle = '#2563eb' // Biru pekat aktif
      } else if (isFieldMatch && !isYearMatch) {
        ctx.fillStyle = isAllField ? '#cbd5e1' : '#93c5fd' // Dimmed jika All, atau biru muda jika bidang tertentu
      } else if (!isFieldMatch && isYearMatch) {
        ctx.fillStyle = '#cbd5e1' // Abu-abu kebiruan
      } else {
        ctx.fillStyle = '#e4e4e7' // Abu-abu netral
      }

      // Render sebagai kotak pixel (bukan bulat)
      if (dotSize >= 6 && typeof ctx.roundRect === 'function') {
        ctx.beginPath()
        ctx.roundRect(x, y, dotSize, dotSize, 1.5)
        ctx.fill()
      } else {
        ctx.fillRect(x, y, dotSize, dotSize)
      }
    }
  }, [open, sortedPublications, gridInfo, selectedField, selectedFieldName, selectedYearId])

  /* ─────────────────────────────────────────────────────────
     9. HOVER MOUSE HANDLER
  ───────────────────────────────────────────────────────── */
  const handleCanvasMouseMove = (e) => {
    const canvas = canvasRef.current
    if (!canvas || sortedPublications.length === 0) return
    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const scaleX = 600 / rect.width
    const scaleY = 300 / rect.height
    const canvasX = mouseX * scaleX
    const canvasY = mouseY * scaleY

    const col = Math.floor(canvasX / gridInfo.cellWidth)
    const row = Math.floor(canvasY / gridInfo.cellHeight)
    const idx = row * gridInfo.cols + col

    if (idx >= 0 && idx < sortedPublications.length) {
      setHoveredPub(sortedPublications[idx])
      setTooltipPos({ x: mouseX, y: mouseY })
    } else {
      setHoveredPub(null)
    }
  }

  const handleCanvasMouseLeave = () => {
    setHoveredPub(null)
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className="max-w-6xl w-[96vw] max-h-[92vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [&>button.absolute]:hidden border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 rounded-2xl shadow-2xl space-y-4"
      >
        <DialogTitle className="sr-only">Sekilas Riset BRIN</DialogTitle>

        {/* ── 1. Top Header Section (No Tutup Button, No X Button) ── */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 font-mono tracking-wide uppercase">
              Sekilas Riset BRIN
            </span>
            <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <span className="text-[11px] text-zinc-400 font-mono">
              Sebaran Riil Database Publikasi
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Setiap titik, sebuah pengetahuan.
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {sortedPublications.length > 0
              ? `${sortedPublications.length.toLocaleString('id-ID')} titik publikasi diurutkan dari ID publikasi terkecil. Arahkan kursor ke titik untuk melihat detailnya.`
              : 'Belum ada data publikasi di database.'}
          </p>
        </div>

        {/* ── 2. Top 3 Metric Cards (Consistent p-4 & gap-4) ── */}
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200 dark:divide-zinc-800 gap-4 sm:gap-0 shadow-xs">
          <div className="sm:pr-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-mono tracking-tight">
              {globalStats.totalPubs.toLocaleString('id-ID')}
            </div>
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              Publikasi ilmiah
            </div>
            <div className="text-[10px] text-zinc-400 dark:text-zinc-500">
              Total titik dalam kanvas matriks
            </div>
          </div>

          <div className="sm:px-4 pt-3 sm:pt-0">
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight">
              {globalStats.totalAuthors.toLocaleString('id-ID')}
            </div>
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              Periset terdaftar
            </div>
            <div className="text-[10px] text-zinc-400 dark:text-zinc-500">
              Penulis afiliasi BRIN unik
            </div>
          </div>

          <div className="sm:pl-4 pt-3 sm:pt-0">
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight">
              {globalStats.totalCenters.toLocaleString('id-ID')}
            </div>
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              Pusat riset / Satker
            </div>
            <div className="text-[10px] text-zinc-400 dark:text-zinc-500">
              Satuan kerja yang terpetakan
            </div>
          </div>
        </div>

        {/* ── 3. Main Two-Panel Grid (Consistent gap-4) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

          {/* ── LEFT PANEL: Hamparan Seluruh Publikasi ── */}
          <div className="lg:col-span-6 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 bg-white dark:bg-zinc-900/30 space-y-4">
            {/* Header & Legend */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase font-mono">
                  Hamparan Sebaran Publikasi
                </h3>
                <div className="text-[10px] text-zinc-400 font-mono">
                  {sortedPublications.length.toLocaleString('id-ID')} Titik (Sort by ID Publikasi)
                </div>
              </div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono flex items-center gap-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-blue-600 inline-block"></span>
                  <span>Aktif</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-zinc-300 dark:bg-zinc-700 inline-block"></span>
                  <span>Lainnya</span>
                </span>
              </div>
            </div>

            {/* Dot Matrix Canvas with Tooltip */}
            <div
              className="relative w-full overflow-hidden"
              onMouseMove={handleCanvasMouseMove}
              onMouseLeave={handleCanvasMouseLeave}
            >
              <canvas
                ref={canvasRef}
                style={{ width: '100%', height: 'auto', aspectRatio: '2/1' }}
                className="w-full block cursor-crosshair"
              />

              {hoveredPub && (
                <div
                  style={{
                    left: tooltipPos.x > 260 ? Math.max(8, tooltipPos.x - 290) : tooltipPos.x + 12,
                    top: Math.max(8, Math.min(tooltipPos.y - 45, 170))
                  }}
                  className="absolute z-20 pointer-events-none p-2.5 rounded-lg bg-zinc-900/95 dark:bg-zinc-800/95 text-white shadow-xl border border-zinc-700 text-[10px] max-w-[280px] backdrop-blur-xs transition-opacity"
                >
                  <div className="flex items-center gap-1.5 font-mono text-blue-300 font-bold">
                    <span>{hoveredPub.publication_id || 'ID -'}</span>
                    {hoveredPub.year && <span>• Tahun {hoveredPub.year}</span>}
                  </div>
                  <div className="font-semibold line-clamp-2 text-zinc-100 mt-0.5 leading-snug">
                    {hoveredPub.title}
                  </div>
                  {toList(hoveredPub.brin_author).length > 0 && (
                    <div className="text-zinc-400 truncate mt-1">
                      ✍️ {toList(hoveredPub.brin_author).slice(0, 2).join('; ')}
                    </div>
                  )}
                  {toList(hoveredPub.research_center).length > 0 && (
                    <div className="text-zinc-400 truncate mt-0.5 text-[9px]">
                      🏢 {toList(hoveredPub.research_center)[0]}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Year Selector Tiles (Consistent gap-2) */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-zinc-500 font-mono">Pilih Tahun:</div>
              <div className="grid grid-cols-4 gap-2">
                {globalStats.yearTiles.map((tile) => {
                  const isActive = selectedYearId === tile.id
                  return (
                    <button
                      key={tile.id}
                      onClick={() => setSelectedYearId(tile.id)}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        isActive
                          ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/30'
                          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                      }`}
                    >
                      <div className="font-bold text-xs">{tile.label}</div>
                      <div className="text-[9px] text-zinc-400 font-mono truncate">{tile.count}</div>
                    </button>
                  )
                })}
              </div>

              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-relaxed pt-1 border-t border-zinc-100 dark:border-zinc-800/60">
                ⓘ Setiap titik mewakili 1 publikasi riil dari database yang diurutkan berurutan berdasarkan ID publikasi.
              </p>
            </div>
          </div>

          {/* ── RIGHT PANEL: Publikasi Menurut Bidang ── */}
          <div className="lg:col-span-6 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 bg-white dark:bg-zinc-900/30 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase font-mono">
                Publikasi Menurut Bidang
              </h3>
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-mono font-semibold">
                {uniqueFieldsList.length} bidang terpetakan
              </span>
            </div>

            {/* Selected Bidang Summary Card */}
            <div className="space-y-4">
              {/* Field title with icon */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <selectedField.Icon className="w-4 h-4" />
                </div>
                <div className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {selectedField.name}
                </div>
              </div>

              {/* Counts row */}
              <div className="flex items-baseline gap-6">
                <div>
                  <span className="text-xl sm:text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                    {countSinceActiveYear.toLocaleString('id-ID')}
                  </span>
                  <span className="block text-[10px] text-zinc-400">
                    Publikasi sejak {activeSinceYear}
                  </span>
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
                    {fieldPubs.length.toLocaleString('id-ID')}
                  </span>
                  <span className="block text-[10px] text-zinc-400">
                    Publikasi seluruh tahun
                  </span>
                </div>
              </div>

              {/* Yearly Bar Chart */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                  <span>Jejak publikasi per tahun</span>
                  <span>{yearlyTrend.length > 0 ? `${yearlyTrend[0].year}–${yearlyTrend[yearlyTrend.length - 1].year}` : ''}</span>
                </div>

                <div className="h-20 flex items-end justify-between gap-1.5 pt-2 pb-1 border-b border-zinc-200 dark:border-zinc-800">
                  {yearlyTrend.map((item) => {
                    const heightPercent = maxYearlyCount > 0 && item.count > 0
                      ? Math.max(14, Math.round((item.count / maxYearlyCount) * 100))
                      : 6
                    return (
                      <div key={item.year} className="flex-1 flex flex-col items-center justify-end h-full group">
                        <span className="text-[8px] font-mono text-zinc-500 dark:text-zinc-400 opacity-80 mb-0.5 group-hover:opacity-100 font-semibold">
                          {item.count}
                        </span>
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full max-w-[24px] rounded-t transition-all ${item.count > 0 ? 'bg-blue-600 hover:bg-blue-500' : 'bg-zinc-200 dark:bg-zinc-800'}`}
                          title={`${item.year}: ${item.count} publikasi`}
                        />
                      </div>
                    )
                  })}
                </div>

                {/* Years labels below bars */}
                <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 pt-0.5">
                  {yearlyTrend.map((item) => (
                    <span key={item.year} className="text-center flex-1">{item.year}</span>
                  ))}
                </div>
              </div>

              {/* Pusat Riset Teraktif (Top 3 Unique dari Database) */}
              <div className="space-y-1.5 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="font-bold text-zinc-700 dark:text-zinc-300">
                    {selectedFieldName === 'ALL' ? 'Pusat riset teraktif (seluruh bidang):' : 'Pusat riset teraktif di bidang ini:'}
                  </span>
                  <span className="text-zinc-400">Top 3 Terbanyak</span>
                </div>

                <div className="space-y-1 text-xs">
                  {top3Centers.length === 0 ? (
                    <div className="text-[11px] text-zinc-400 italic">Belum ada data satker yang terpetakan untuk bidang ini</div>
                  ) : (
                    top3Centers.map((center, i) => (
                      <div key={i} className="flex items-center justify-between py-1 border-b border-zinc-100/80 dark:border-zinc-800/50">
                        <span className="text-zinc-700 dark:text-zinc-300 text-[11px] truncate max-w-[280px]">
                          <span className="font-mono text-blue-600 dark:text-blue-400 font-bold mr-1">#{i + 1}</span>
                          🏢 {center.name}
                        </span>
                        <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 text-[11px]">
                          {center.count.toLocaleString('id-ID')}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Semua Bidang Unique dari Kolom 'field' (Consistent gap-2) */}
            <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {uniqueFieldsList.map((bidang) => {
                  const isSelected = selectedFieldName !== 'ALL' && selectedField.name.toLowerCase() === bidang.name.toLowerCase()
                  const IconComp = bidang.Icon
                  return (
                    <button
                      key={bidang.name}
                      onClick={() => setSelectedFieldName(isSelected ? 'ALL' : bidang.name)}
                      className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between min-h-[64px] ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-xs ring-1 ring-blue-500/20'
                          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400'}`} />
                        <span className="text-[9px] font-mono text-zinc-400 font-semibold">
                          {bidang.countAll.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="font-semibold text-[11px] leading-tight line-clamp-2 mt-1">
                        {bidang.name}
                      </div>
                    </button>
                  )
                })}
              </div>

              <p className="text-[9px] text-zinc-400 dark:text-zinc-500 pt-1">
                ⓘ Seluruh bidang di atas diekstrak secara dinamis dari kolom bidang database publikasi.
              </p>
            </div>

          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}
