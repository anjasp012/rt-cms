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
  X
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

// 11 Bidang Definisi Resmi BRIN
const BIDANG_DEFINITIONS = [
  { id: 'elektronika', name: 'Elektronika, Data & AI', keywords: ['elektronika', 'data', 'ai', 'kecerdasan buatan', 'informatika', 'komputer'], Icon: Cpu },
  { id: 'hayati', name: 'Hayati & Lingkungan', keywords: ['hayati', 'lingkungan', 'konservasi', 'biodiversitas', 'ekologi', 'biologi'], Icon: Leaf },
  { id: 'pangan', name: 'Pangan & Pertanian', keywords: ['pangan', 'pertanian', 'peternakan', 'hortikultura', 'tanaman pangan', 'perkebunan'], Icon: Sprout },
  { id: 'material', name: 'Material, Kimia & Manufaktur', keywords: ['material', 'kimia', 'manufaktur', 'metalurgi', 'polimer', 'proses'], Icon: FlaskConical },
  { id: 'kesehatan', name: 'Kesehatan & Obat', keywords: ['kesehatan', 'obat', 'farmasi', 'vaksin', 'biomedis', 'gizi'], Icon: Pill },
  { id: 'sosial', name: 'Sosial, Ekonomi & Pemerintahan', keywords: ['sosial', 'ekonomi', 'pemerintahan', 'kebijakan', 'kependudukan', 'masyarakat'], Icon: Landmark },
  { id: 'kebencanaan', name: 'Bumi, Laut & Kebencanaan', keywords: ['bumi', 'laut', 'kebencanaan', 'geologi', 'oseanografi', 'iklim', 'gempa'], Icon: Globe },
  { id: 'energi', name: 'Energi', keywords: ['energi', 'ebt', 'kelistrikan', 'bahan bakar', 'konversi energi'], Icon: Zap },
  { id: 'transportasi', name: 'Transportasi & Antariksa', keywords: ['transportasi', 'antariksa', 'penerbangan', 'satelit', 'roket'], Icon: Rocket },
  { id: 'nuklir', name: 'Nuklir', keywords: ['nuklir', 'reaktor', 'radiasi'], Icon: Atom },
  { id: 'budaya', name: 'Budaya, Bahasa & Sejarah', keywords: ['budaya', 'bahasa', 'sejarah', 'arkeologi', 'manuskrip', 'sastra'], Icon: Scroll },
]

function matchesBidang(pub, bidangDef) {
  const fields = toList(pub.field)
  if (fields.length === 0) return false
  return fields.some(f => {
    const lf = f.toLowerCase()
    const defName = bidangDef.name.toLowerCase()
    if (lf.includes(defName) || defName.includes(lf)) return true
    return bidangDef.keywords.some(kw => lf.includes(kw))
  })
}

export default function ResearchOverviewModal({ open, onClose, publications = [] }) {
  const [selectedBidangId, setSelectedBidangId] = useState('elektronika')
  const [selectedYearId, setSelectedYearId] = useState('ALL')
  const canvasRef = useRef(null)

  // Hover state untuk menampilkan detail titik publikasi
  const [hoveredPub, setHoveredPub] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

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
     2. AGGREGASI DATA DINAMIS DARI TABEL PUBLIKASI
  ───────────────────────────────────────────────────────── */
  const stats = useMemo(() => {
    const totalPubs = sortedPublications.length
    const authorSet = new Set()
    const centerSet = new Set()
    const yearCounts = {}

    // Inisialisasi statistik bidang
    const bidangStatsMap = BIDANG_DEFINITIONS.map(b => ({
      ...b,
      countAll: 0,
      countSince2022: 0,
      yearlyMap: {},
      centerMap: {},
    }))

    sortedPublications.forEach(pub => {
      // Penulis BRIN
      toList(pub.brin_author).forEach(a => authorSet.add(a))
      // Pusat Riset / Satker
      toList(pub.research_center).forEach(c => centerSet.add(c))

      // Tahun publikasi
      const y = pub.year != null ? String(pub.year) : null
      if (y) {
        yearCounts[y] = (yearCounts[y] || 0) + 1
      }

      // Hitung per bidang
      bidangStatsMap.forEach(b => {
        if (matchesBidang(pub, b)) {
          b.countAll++
          if (pub.year && pub.year >= 2022) {
            b.countSince2022++
          }
          if (y) {
            b.yearlyMap[y] = (b.yearlyMap[y] || 0) + 1
          }
          toList(pub.research_center).forEach(c => {
            b.centerMap[c] = (b.centerMap[c] || 0) + 1
          })
        }
      })
    })

    // Semua tahun terurut
    const sortedYearsAsc = Object.keys(yearCounts)
      .map(Number)
      .filter(n => !isNaN(n) && n > 1990 && n < 2035)
      .sort((a, b) => a - b)

    // Rentang tahun untuk grafik bar
    const chartYears = sortedYearsAsc.length > 0
      ? sortedYearsAsc.slice(-8)
      : [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025]

    // Proses top pusat riset dan array tahunan untuk tiap bidang
    bidangStatsMap.forEach(b => {
      b.topCenters = Object.entries(b.centerMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)

      b.yearly = chartYears.map(yr => ({
        year: String(yr),
        count: b.yearlyMap[String(yr)] || 0
      }))
    })

    // Year tiles untuk pemilih tahun
    const sortedYearsDesc = [...sortedYearsAsc].reverse()
    const yearTiles = [
      {
        id: 'ALL',
        label: 'Semua tahun',
        count: `${totalPubs.toLocaleString('id-ID')} publikasi`,
      },
      ...sortedYearsDesc.slice(0, 7).map(yr => {
        const count = yearCounts[String(yr)] || 0
        return {
          id: String(yr),
          label: String(yr),
          count: `${count.toLocaleString('id-ID')} publikasi`,
        }
      })
    ]

    return {
      totalPubs,
      totalAuthors: authorSet.size,
      totalCenters: centerSet.size,
      bidangStats: bidangStatsMap,
      yearTiles
    }
  }, [sortedPublications])

  // Bidang aktif yang dipilih
  const selectedBidang = useMemo(() => {
    return stats.bidangStats.find(b => b.id === selectedBidangId) || stats.bidangStats[0]
  }, [stats.bidangStats, selectedBidangId])

  // Hitung skala maksimum bar chart
  const maxYearlyCount = useMemo(() => {
    const counts = selectedBidang.yearly.map(y => y.count)
    return Math.max(...counts, 10)
  }, [selectedBidang])

  /* ─────────────────────────────────────────────────────────
     3. HITUNG STRUKTUR GRID TITIK (1 TITIK = 1 PUBLIKASI)
  ───────────────────────────────────────────────────────── */
  const gridInfo = useMemo(() => {
    const N = sortedPublications.length
    const width = 480
    const height = 260
    if (N === 0) {
      return { cols: 1, rows: 1, cellWidth: width, cellHeight: height, dotSize: 4, offsetX: 0, offsetY: 0, N: 0 }
    }

    const aspect = width / height // ~1.846
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
     4. RENDER TITIK-TITIK PUBLIKASI KE CANVAS
  ───────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!open) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const width = 480
    const height = 260
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

    for (let i = 0; i < N; i++) {
      const pub = sortedPublications[i]
      const col = i % cols
      const row = Math.floor(i / cols)
      const x = col * cellWidth + offsetX
      const y = row * cellHeight + offsetY

      const isBidang = matchesBidang(pub, selectedBidang)
      const isYear = selectedYearId === 'ALL' || (pub.year && String(pub.year) === selectedYearId)

      if (isBidang && isYear) {
        // Titik publikasi yang cocok dengan bidang & tahun aktif: Biru cerah
        ctx.fillStyle = '#2563eb'
      } else if (isBidang && !isYear) {
        // Cocok bidang tapi beda tahun: Biru muda
        ctx.fillStyle = '#93c5fd'
      } else if (!isBidang && isYear) {
        // Cocok tahun tapi beda bidang: Abu-abu kebiruan
        ctx.fillStyle = '#cbd5e1'
      } else {
        // Inactive: Abu-abu netral
        ctx.fillStyle = '#e4e4e7'
      }

      if (dotSize >= 5) {
        ctx.beginPath()
        ctx.arc(x + dotSize / 2, y + dotSize / 2, dotSize / 2, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.fillRect(x, y, dotSize, dotSize)
      }
    }
  }, [open, sortedPublications, gridInfo, selectedBidang, selectedYearId])

  /* ─────────────────────────────────────────────────────────
     5. HOVER HANDLER: LIHAT DETAIL SETIAP TITIK PUBLIKASI
  ───────────────────────────────────────────────────────── */
  const handleCanvasMouseMove = (e) => {
    const canvas = canvasRef.current
    if (!canvas || sortedPublications.length === 0) return
    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const scaleX = 480 / rect.width
    const scaleY = 260 / rect.height
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
      <DialogContent className="max-w-6xl w-[96vw] max-h-[92vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none] border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 sm:p-6 rounded-3xl shadow-2xl">
        <DialogTitle className="sr-only">Sekilas Riset BRIN</DialogTitle>

        {/* ── Top Header Section (Clean with direct Tutup button) ── */}
        <div className="flex items-start justify-between gap-4 pb-1">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 font-mono tracking-wide uppercase">
                Sekilas Riset BRIN
              </span>
              <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <span className="text-[11px] text-zinc-400 font-mono">
                Urut berdasarkan ID Publikasi
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Setiap titik, sebuah pengetahuan.
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {sortedPublications.length > 0
                ? `${sortedPublications.length.toLocaleString('id-ID')} titik publikasi diurutkan dari ID publikasi terkecil. Arahkan kursor ke titik untuk melihat detailnya.`
                : 'Belum ada data publikasi di tabel.'}
            </p>
          </div>

          {/* Tombol Tutup Tunggal yang Rapi di Header */}
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs shrink-0"
            title="Tutup popup (Esc)"
          >
            <span>Tutup</span>
            <X className="w-3.5 h-3.5 text-zinc-500" />
          </button>
        </div>

        {/* ── Top 3 Metric Cards (Dihitung dari data asli tabel) ── */}
        <div className="py-3 px-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200 dark:divide-zinc-800 shadow-xs">
          <div className="sm:pr-5 pb-2.5 sm:pb-0">
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-mono tracking-tight">
              {stats.totalPubs.toLocaleString('id-ID')}
            </div>
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              Publikasi ilmiah
            </div>
            <div className="text-[10px] text-zinc-400 dark:text-zinc-500">
              Total titik dalam kanvas matriks
            </div>
          </div>

          <div className="sm:px-5 py-2.5 sm:py-0">
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight">
              {stats.totalAuthors.toLocaleString('id-ID')}
            </div>
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              Periset terdaftar
            </div>
            <div className="text-[10px] text-zinc-400 dark:text-zinc-500">
              Penulis afiliasi BRIN unik
            </div>
          </div>

          <div className="sm:pl-5 pt-2.5 sm:pt-0">
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight">
              {stats.totalCenters.toLocaleString('id-ID')}
            </div>
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              Pusat riset / Satker
            </div>
            <div className="text-[10px] text-zinc-400 dark:text-zinc-500">
              Satuan kerja yang terpetakan
            </div>
          </div>
        </div>

        {/* ── Main Two-Panel Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start pt-1">

          {/* ── LEFT PANEL: Hamparan Seluruh Publikasi ── */}
          <div className="lg:col-span-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-5 bg-white dark:bg-zinc-900/30 flex flex-col justify-between space-y-4">
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
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span>
                  <span>Aktif</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700 inline-block"></span>
                  <span>Lainnya</span>
                </span>
              </div>
            </div>

            {/* Dot Matrix Canvas with Real-time Hover Tooltip */}
            <div
              className="relative w-full flex items-center justify-center bg-zinc-50/60 dark:bg-zinc-950/60 rounded-xl p-2.5 border border-zinc-100 dark:border-zinc-800/60 overflow-hidden"
              onMouseMove={handleCanvasMouseMove}
              onMouseLeave={handleCanvasMouseLeave}
            >
              <canvas
                ref={canvasRef}
                style={{ width: '100%', height: 'auto', maxWidth: 480, aspectRatio: '480/260' }}
                className="block cursor-crosshair"
              />

              {/* Tooltip detail titik publikasi */}
              {hoveredPub && (
                <div
                  style={{
                    left: Math.min(Math.max(tooltipPos.x + 10, 10), 220),
                    top: Math.min(Math.max(tooltipPos.y - 45, 10), 180)
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

            {/* Year Selector Tiles (Interactive) */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-zinc-500 font-mono">Pilih Tahun:</div>
              <div className="grid grid-cols-4 gap-1.5">
                {stats.yearTiles.map((tile) => {
                  const isActive = selectedYearId === tile.id
                  return (
                    <button
                      key={tile.id}
                      onClick={() => setSelectedYearId(tile.id)}
                      className={`py-1.5 px-2 rounded-lg border text-center transition-all ${
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

              {/* Footnote */}
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-relaxed pt-1.5 border-t border-zinc-100 dark:border-zinc-800/60">
                ⓘ Setiap 1 titik mewakili 1 publikasi yang diurutkan berurutan berdasarkan ID publikasi.
              </p>
            </div>
          </div>

          {/* ── RIGHT PANEL: Publikasi Menurut Bidang ── */}
          <div className="lg:col-span-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-5 bg-white dark:bg-zinc-900/30 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase font-mono">
                Publikasi Menurut Bidang
              </h3>
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-mono font-semibold">11 bidang riset</span>
            </div>

            {/* Selected Bidang Summary Card */}
            <div className="space-y-3">
              {/* Field title with icon */}
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <selectedBidang.Icon className="w-3.5 h-3.5" />
                </div>
                <div className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {selectedBidang.name}
                </div>
              </div>

              {/* Counts row */}
              <div className="flex items-baseline gap-6">
                <div>
                  <span className="text-xl sm:text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                    {selectedBidang.countSince2022.toLocaleString('id-ID')}
                  </span>
                  <span className="block text-[10px] text-zinc-400">
                    Publikasi sejak 2022
                  </span>
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
                    {selectedBidang.countAll.toLocaleString('id-ID')}
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
                  <span>{selectedBidang.yearly.length > 0 ? `${selectedBidang.yearly[0].year}–${selectedBidang.yearly[selectedBidang.yearly.length - 1].year}` : ''}</span>
                </div>

                <div className="h-20 flex items-end justify-between gap-1.5 pt-2 pb-1 border-b border-zinc-200 dark:border-zinc-800">
                  {selectedBidang.yearly.map((item) => {
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
                  {selectedBidang.yearly.map((item) => (
                    <span key={item.year} className="text-center flex-1">{item.year}</span>
                  ))}
                </div>
              </div>

              {/* Pusat Riset Paling Aktif List */}
              <div className="space-y-1 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="font-bold text-zinc-700 dark:text-zinc-300">Pusat riset teraktif di bidang ini:</span>
                  <span className="text-zinc-400">Database</span>
                </div>

                <div className="space-y-1 text-xs">
                  {selectedBidang.topCenters.length === 0 ? (
                    <div className="text-[11px] text-zinc-400 italic">Belum ada data satker yang terpetakan untuk bidang ini</div>
                  ) : (
                    selectedBidang.topCenters.map((center, i) => (
                      <div key={i} className="flex items-center justify-between py-0.5 border-b border-zinc-100/80 dark:border-zinc-800/50">
                        <span className="text-zinc-700 dark:text-zinc-300 text-[11px] truncate max-w-[280px]">
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

            {/* 11 Bidang Selection Grid (Rapi & Kompak) */}
            <div className="space-y-1.5 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {stats.bidangStats.map((bidang) => {
                  const isSelected = selectedBidangId === bidang.id
                  const IconComp = bidang.Icon
                  return (
                    <button
                      key={bidang.id}
                      onClick={() => setSelectedBidangId(bidang.id)}
                      className={`p-2 rounded-lg border text-left transition-all flex flex-col justify-between min-h-[58px] ${
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
                      <div className="font-semibold text-[11px] leading-tight line-clamp-1 mt-1">
                        {bidang.name}
                      </div>
                    </button>
                  )
                })}
              </div>

              <p className="text-[9px] text-zinc-400 dark:text-zinc-500 pt-0.5">
                ⓘ Data bidang dan statistik periset disinkronkan secara langsung dari tabel publikasi.
              </p>
            </div>

          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}
