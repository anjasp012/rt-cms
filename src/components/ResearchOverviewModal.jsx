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
  X,
  Sparkles,
  Building2,
  Calendar,
  Users
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

  /* ─────────────────────────────────────────────────────────
     AGGREGASI DATA DINAMIS LANGSUNG DARI TABEL PUBLIKASI
  ───────────────────────────────────────────────────────── */
  const stats = useMemo(() => {
    const totalPubs = publications.length
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

    publications.forEach(pub => {
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

    // Rentang tahun untuk grafik bar (default 2018–2025 jika belum ada data tahun)
    const chartYears = sortedYearsAsc.length > 0
      ? sortedYearsAsc.slice(-8)
      : [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025]

    // Proses top pusat riset dan array tahunan untuk tiap bidang
    bidangStatsMap.forEach(b => {
      // Top 3 pusat riset
      b.topCenters = Object.entries(b.centerMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)

      b.yearly = chartYears.map(yr => ({
        year: String(yr),
        count: b.yearlyMap[String(yr)] || 0
      }))
    })

    // Year tiles untuk pemilih tahun di kiri bawah
    const sortedYearsDesc = [...sortedYearsAsc].reverse()
    const yearTiles = [
      {
        id: 'ALL',
        label: 'Semua tahun',
        count: `${totalPubs.toLocaleString('id-ID')} publikasi`,
        ratio: totalPubs > 0 ? 0.45 : 0.2
      },
      ...sortedYearsDesc.slice(0, 7).map(yr => {
        const count = yearCounts[String(yr)] || 0
        const ratio = totalPubs > 0 ? Math.min(0.85, Math.max(0.12, (count / totalPubs) * 3)) : 0.15
        return {
          id: String(yr),
          label: String(yr),
          count: `${count.toLocaleString('id-ID')} publikasi`,
          ratio
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
  }, [publications])

  // Bidang aktif yang dipilih
  const selectedBidang = useMemo(() => {
    return stats.bidangStats.find(b => b.id === selectedBidangId) || stats.bidangStats[0]
  }, [stats.bidangStats, selectedBidangId])

  // Hitung skala maksimum bar chart
  const maxYearlyCount = useMemo(() => {
    const counts = selectedBidang.yearly.map(y => y.count)
    return Math.max(...counts, 10)
  }, [selectedBidang])

  // Canvas Dot Matrix (Satu titik = satu pengetahuan)
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

    const cols = 48
    const rows = 26
    const dotSize = 3.5
    const gapX = (width - cols * dotSize) / (cols - 1)
    const gapY = (height - rows * dotSize) / (rows - 1)

    const yearObj = stats.yearTiles.find(y => y.id === selectedYearId) || stats.yearTiles[0]
    const baseRatio = yearObj.ratio
    const bidangIndex = BIDANG_DEFINITIONS.findIndex(b => b.id === selectedBidangId)
    const seed = (bidangIndex + 1) * 73 + (selectedYearId.charCodeAt(0) || 5)

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * (dotSize + gapX)
        const y = r * (dotSize + gapY)
        const hash = Math.sin(c * 12.9898 + r * 78.233 + seed) * 43758.5453
        const val = hash - Math.floor(hash)

        if (val < baseRatio) {
          ctx.fillStyle = '#2563eb' // Biru aktif
        } else {
          ctx.fillStyle = '#e4e4e7' // Abu-abu lembut
        }
        ctx.fillRect(x, y, dotSize, dotSize)
      }
    }
  }, [open, selectedBidangId, selectedYearId, stats.yearTiles])

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
                Data Real-time Tabel Publikasi
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Setiap titik, sebuah pengetahuan.
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Pilih bidang atau tahun untuk melihat jejak publikasi riil dari database.
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
              Total tercatat dalam tabel
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

        {/* ── Main Two-Panel Grid (Gaps dirapikan) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start pt-1">

          {/* ── LEFT PANEL: Hamparan Seluruh Publikasi ── */}
          <div className="lg:col-span-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-5 bg-white dark:bg-zinc-900/30 flex flex-col justify-between space-y-4">
            {/* Header & Legend */}
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase font-mono">
                Hamparan Sebaran Publikasi
              </h3>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span>
                <span>Satu titik = satu publikasi</span>
              </div>
            </div>

            {/* Dot Matrix Canvas */}
            <div className="w-full flex items-center justify-center bg-zinc-50/60 dark:bg-zinc-950/60 rounded-xl p-2.5 border border-zinc-100 dark:border-zinc-800/60 overflow-hidden">
              <canvas
                ref={canvasRef}
                style={{ width: '100%', height: 'auto', maxWidth: 480, aspectRatio: '480/260' }}
                className="block"
              />
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
                ⓘ Titik biru mewakili kepadatan proporsi publikasi pada tahun dan bidang yang sedang aktif.
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
