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
import { fetchPublicPublicationsOverview } from '@/lib/api'

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
  const [overviewData, setOverviewData] = useState(null)
  const [dataLoading, setDataLoading] = useState(false)
  const canvasRef = useRef(null)
  const [canvasNode, setCanvasNode] = useState(null)
  const [renderTick, setRenderTick] = useState(0)

  // Hover state untuk kanvas titik publikasi
  const [hoveredPub, setHoveredPub] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  // Reset filter ke ALL setiap kali modal dibuka & trigger render tick
  useEffect(() => {
    if (open) {
      setSelectedFieldName('ALL')
      setSelectedYearId('ALL')
      setHoveredPub(null)

      const raf = requestAnimationFrame(() => setRenderTick(t => t + 1))
      const t1 = setTimeout(() => setRenderTick(t => t + 1), 60)
      const t2 = setTimeout(() => setRenderTick(t => t + 1), 180)
      const t3 = setTimeout(() => setRenderTick(t => t + 1), 350)

      return () => {
        cancelAnimationFrame(raf)
        clearTimeout(t1)
        clearTimeout(t2)
        clearTimeout(t3)
      }
    }
  }, [open])

  // Fetch lightweight overview & boolean hamparan dari backend
  useEffect(() => {
    if (!open) return
    let mounted = true
    setDataLoading(true)

    fetchPublicPublicationsOverview({
      year: selectedYearId,
      field: selectedFieldName
    })
      .then(res => {
        if (mounted && res) {
          setOverviewData(res)
        }
      })
      .catch(err => {
        console.error('Failed to load publications overview:', err)
      })
      .finally(() => {
        if (mounted) setDataLoading(false)
      })

    return () => { mounted = false }
  }, [open, selectedYearId, selectedFieldName])

  /* ── 1. Hamparan titik dari server (bitstring '1'/'0') ── */
  const hamparan = useMemo(() => {
    return overviewData?.hamparan || ''
  }, [overviewData?.hamparan])

  const totalPubs = overviewData?.total_publications ?? publications.length

  /* ── 2. Ekstrak daftar bidang ── */
  const uniqueFieldsList = useMemo(() => {
    if (overviewData?.fields && overviewData.fields.length > 0) {
      return overviewData.fields.map(f => ({
        name: f.name,
        countAll: f.count,
        Icon: getFieldIcon(f.name)
      }))
    }
    return BIDANG_FALLBACK.map(b => ({
      name: b.name,
      countAll: 0,
      Icon: b.Icon
    }))
  }, [overviewData?.fields])

  /* ── 3. Bidang aktif terpilih ── */
  const selectedField = useMemo(() => {
    if (!selectedFieldName || selectedFieldName === 'ALL') {
      return {
        name: 'Semua Bidang Riset',
        id: 'ALL',
        countAll: totalPubs,
        Icon: Layers
      }
    }
    const found = uniqueFieldsList.find(f => f.name.toLowerCase() === selectedFieldName.toLowerCase())
    return found || {
      name: selectedFieldName,
      id: selectedFieldName,
      countAll: overviewData?.count_all_years ?? 0,
      Icon: getFieldIcon(selectedFieldName)
    }
  }, [uniqueFieldsList, selectedFieldName, totalPubs, overviewData?.count_all_years])

  /* ── 4. Tahun patokan aktif & jumlah publikasi ── */
  const minYear = overviewData?.min_year ?? 2022
  const activeSinceYear = overviewData?.since_year ?? (selectedYearId !== 'ALL' ? Number(selectedYearId) : minYear)
  const countSinceActiveYear = overviewData?.count_since_year ?? 0
  const countAllYears = overviewData?.count_all_years ?? totalPubs

  /* ── 5. Top 3 Satker ── */
  const top3Centers = useMemo(() => {
    return overviewData?.top_satker || []
  }, [overviewData?.top_satker])

  /* ── 6. Statistik Global & Year Tiles ── */
  const globalStats = useMemo(() => {
    const totalAuthors = overviewData?.total_researchers ?? 0
    const totalCenters = overviewData?.total_research_centers ?? 0
    const trends = overviewData?.yearly_trend || []
    const sortedDesc = [...trends].reverse()

    const yearTiles = [
      {
        id: 'ALL',
        label: 'Semua tahun',
        count: `${totalPubs.toLocaleString('id-ID')} publikasi`,
      },
      ...sortedDesc.slice(0, 7).map(item => ({
        id: String(item.year),
        label: String(item.year),
        count: `${item.count.toLocaleString('id-ID')} publikasi`,
      }))
    ]

    return {
      totalPubs,
      totalAuthors,
      totalCenters,
      yearTiles
    }
  }, [overviewData, totalPubs])

  /* ── 7. Jejak Tahunan untuk Bar Chart ── */
  const yearlyTrend = useMemo(() => {
    return overviewData?.yearly_trend || []
  }, [overviewData?.yearly_trend])

  const maxYearlyCount = useMemo(() => {
    const counts = yearlyTrend.map(y => y.count)
    return Math.max(...counts, 10)
  }, [yearlyTrend])

  /* ── 8. Struktur Grid Kanvas Titik ── */
  const gridInfo = useMemo(() => {
    const N = hamparan.length || totalPubs
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
  }, [hamparan.length, totalPubs])

  /* ── 9. Render Titik pada Kanvas (Super Cepat 60 FPS) ── */
  useEffect(() => {
    if (!open) return
    const canvas = canvasRef.current || canvasNode
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

    const N = hamparan.length
    if (N === 0) {
      ctx.fillStyle = '#a1a1aa'
      ctx.font = '12px Segoe UI, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(dataLoading ? 'Memuat hamparan sebaran riset BRIN...' : 'Belum ada data publikasi di database.', width / 2, height / 2)
      return
    }

    const { cols, cellWidth, cellHeight, dotSize, offsetX, offsetY } = gridInfo

    for (let i = 0; i < N; i++) {
      const isActive = typeof hamparan === 'string'
        ? hamparan[i] === '1'
        : Boolean(hamparan[i]?.is_active)
      const col = i % cols
      const row = Math.floor(i / cols)
      const x = col * cellWidth + offsetX
      const y = row * cellHeight + offsetY

      ctx.fillStyle = isActive ? '#2563eb' : '#e4e4e7'
      ctx.fillRect(x, y, dotSize, dotSize)
    }
  }, [open, canvasNode, renderTick, hamparan, gridInfo, dataLoading])

  /* ── 10. Hover Mouse Handler ── */
  const handleCanvasMouseMove = (e) => {
    const canvas = canvasRef.current
    const N = hamparan.length
    if (!canvas || N === 0) return
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

    if (idx >= 0 && idx < N) {
      const isActive = typeof hamparan === 'string'
        ? hamparan[idx] === '1'
        : Boolean(hamparan[idx]?.is_active)
      const pubId = Array.isArray(hamparan) && hamparan[idx]?.id_publication
        ? hamparan[idx].id_publication
        : `#${idx + 1}`

      setHoveredPub({
        id_publication: pubId,
        index: idx + 1,
        is_active: isActive
      })
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
            {totalPubs > 0
              ? `${totalPubs.toLocaleString('id-ID')} titik publikasi diurutkan dari ID publikasi terkecil. Arahkan kursor ke titik untuk melihat detailnya.`
              : (dataLoading ? 'Memuat data publikasi...' : 'Belum ada data publikasi di database.')}
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
                  {totalPubs.toLocaleString('id-ID')} Titik (Sort by ID Publikasi)
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
              className="relative w-full overflow-hidden min-h-[200px] bg-zinc-50/50 dark:bg-zinc-950/50 flex items-center justify-center"
              onMouseMove={handleCanvasMouseMove}
              onMouseLeave={handleCanvasMouseLeave}
            >
              <canvas
                ref={(el) => {
                  canvasRef.current = el
                  if (el && el !== canvasNode) setCanvasNode(el)
                }}
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
                    <span>
                      {hoveredPub.id_publication?.startsWith('#')
                        ? `Titik ${hoveredPub.id_publication}`
                        : (hoveredPub.id_publication || `Titik #${hoveredPub.index}`)}
                    </span>
                    {hoveredPub.is_active !== undefined && (
                      <span className={hoveredPub.is_active ? 'text-emerald-400 font-semibold' : 'text-zinc-400'}>
                        {hoveredPub.is_active ? '• Aktif Terpilih' : '• Di Luar Filter'}
                      </span>
                    )}
                  </div>
                  {hoveredPub.title && (
                    <div className="font-semibold line-clamp-2 text-zinc-100 mt-0.5 leading-snug">
                      {hoveredPub.title}
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
                    {countAllYears.toLocaleString('id-ID')}
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
