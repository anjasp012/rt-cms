import { useState, useEffect, useRef, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
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
  Info
} from 'lucide-react'

// 11 Bidang Data matching BRIN Visualisation
const BIDANG_DATA = [
  {
    id: 'elektronika',
    name: 'Elektronika, Data & AI',
    Icon: Cpu,
    count2022: 3417,
    countAll: 6292,
    yearly: [
      { year: '2015', count: 148 },
      { year: '2016', count: 229 },
      { year: '2017', count: 347 },
      { year: '2018', count: 304 },
      { year: '2019', count: 498 },
      { year: '2020', count: 403 },
      { year: '2021', count: 452 },
      { year: '2022', count: 595 },
      { year: '2023', count: 716 },
      { year: '2024', count: 935 },
      { year: '2025*', count: 700 },
    ],
    topCenters: [
      { name: 'Elektronika', count: 1358 },
      { name: 'Mekatronika Cerdas', count: 983 },
      { name: 'Fisika Kuantum', count: 851 },
    ],
  },
  {
    id: 'hayati',
    name: 'Hayati & Lingkungan',
    Icon: Leaf,
    count2022: 7981,
    countAll: 12450,
    yearly: [
      { year: '2015', count: 420 },
      { year: '2016', count: 510 },
      { year: '2017', count: 680 },
      { year: '2018', count: 790 },
      { year: '2019', count: 920 },
      { year: '2020', count: 890 },
      { year: '2021', count: 1100 },
      { year: '2022', count: 1350 },
      { year: '2023', count: 1620 },
      { year: '2024', count: 1980 },
      { year: '2025*', count: 1420 },
    ],
    topCenters: [
      { name: 'Biosistemika & Evolusi', count: 2410 },
      { name: 'Ekologi & Etnobiologi', count: 1890 },
      { name: 'Konservasi Tumbuhan', count: 1650 },
    ],
  },
  {
    id: 'pangan',
    name: 'Pangan & Pertanian',
    Icon: Sprout,
    count2022: 7364,
    countAll: 11820,
    yearly: [
      { year: '2015', count: 380 },
      { year: '2016', count: 460 },
      { year: '2017', count: 610 },
      { year: '2018', count: 720 },
      { year: '2019', count: 860 },
      { year: '2020', count: 840 },
      { year: '2021', count: 1020 },
      { year: '2022', count: 1290 },
      { year: '2023', count: 1540 },
      { year: '2024', count: 1860 },
      { year: '2025*', count: 1310 },
    ],
    topCenters: [
      { name: 'Tanaman Pangan', count: 2150 },
      { name: 'Hortikultura & Perkebunan', count: 1780 },
      { name: 'Peternakan', count: 1420 },
    ],
  },
  {
    id: 'material',
    name: 'Material, Kimia & Manufaktur',
    Icon: FlaskConical,
    count2022: 4422,
    countAll: 7650,
    yearly: [
      { year: '2015', count: 210 },
      { year: '2016', count: 280 },
      { year: '2017', count: 390 },
      { year: '2018', count: 450 },
      { year: '2019', count: 580 },
      { year: '2020', count: 510 },
      { year: '2021', count: 620 },
      { year: '2022', count: 780 },
      { year: '2023', count: 910 },
      { year: '2024', count: 1120 },
      { year: '2025*', count: 820 },
    ],
    topCenters: [
      { name: 'Metalurgi & Material', count: 1640 },
      { name: 'Kimia Maju', count: 1280 },
      { name: 'Teknologi Polimer', count: 950 },
    ],
  },
  {
    id: 'kesehatan',
    name: 'Kesehatan & Obat',
    Icon: Pill,
    count2022: 3738,
    countAll: 6410,
    yearly: [
      { year: '2015', count: 180 },
      { year: '2016', count: 230 },
      { year: '2017', count: 320 },
      { year: '2018', count: 390 },
      { year: '2019', count: 480 },
      { year: '2020', count: 520 },
      { year: '2021', count: 590 },
      { year: '2022', count: 680 },
      { year: '2023', count: 820 },
      { year: '2024', count: 960 },
      { year: '2025*', count: 690 },
    ],
    topCenters: [
      { name: 'Biomedis & Vaksin', count: 1420 },
      { name: 'Bahan Alam Tradisional', count: 1150 },
      { name: 'Kedokteran Presisi', count: 790 },
    ],
  },
  {
    id: 'sosial',
    name: 'Sosial, Ekonomi & Pemerintahan',
    Icon: Landmark,
    count2022: 3122,
    countAll: 5890,
    yearly: [
      { year: '2015', count: 160 },
      { year: '2016', count: 210 },
      { year: '2017', count: 280 },
      { year: '2018', count: 340 },
      { year: '2019', count: 430 },
      { year: '2020', count: 390 },
      { year: '2021', count: 470 },
      { year: '2022', count: 540 },
      { year: '2023', count: 660 },
      { year: '2024', count: 780 },
      { year: '2025*', count: 580 },
    ],
    topCenters: [
      { name: 'Kependudukan & Kebijakan', count: 1220 },
      { name: 'Masyarakat & Budaya', count: 980 },
      { name: 'Politik & Demokrasi', count: 750 },
    ],
  },
  {
    id: 'kebencanaan',
    name: 'Bumi, Laut & Kebencanaan',
    Icon: Globe,
    count2022: 3108,
    countAll: 5740,
    yearly: [
      { year: '2015', count: 150 },
      { year: '2016', count: 190 },
      { year: '2017', count: 260 },
      { year: '2018', count: 320 },
      { year: '2019', count: 410 },
      { year: '2020', count: 380 },
      { year: '2021', count: 460 },
      { year: '2022', count: 530 },
      { year: '2023', count: 650 },
      { year: '2024', count: 770 },
      { year: '2025*', count: 570 },
    ],
    topCenters: [
      { name: 'Kebencanaan Geologi', count: 1180 },
      { name: 'Oseanografi & Laut', count: 990 },
      { name: 'Geoteknologi & Iklim', count: 760 },
    ],
  },
  {
    id: 'energi',
    name: 'Energi',
    Icon: Zap,
    count2022: 2227,
    countAll: 4120,
    yearly: [
      { year: '2015', count: 110 },
      { year: '2016', count: 140 },
      { year: '2017', count: 190 },
      { year: '2018', count: 240 },
      { year: '2019', count: 310 },
      { year: '2020', count: 280 },
      { year: '2021', count: 350 },
      { year: '2022', count: 420 },
      { year: '2023', count: 510 },
      { year: '2024', count: 610 },
      { year: '2025*', count: 450 },
    ],
    topCenters: [
      { name: 'Konversi Energi & EBT', count: 980 },
      { name: 'Teknologi Bahan Bakar', count: 720 },
      { name: 'Sistem Ketenagalistrikan', count: 520 },
    ],
  },
  {
    id: 'transportasi',
    name: 'Transportasi & Antariksa',
    Icon: Rocket,
    count2022: 1723,
    countAll: 3280,
    yearly: [
      { year: '2015', count: 85 },
      { year: '2016', count: 110 },
      { year: '2017', count: 150 },
      { year: '2018', count: 180 },
      { year: '2019', count: 240 },
      { year: '2020', count: 220 },
      { year: '2021', count: 270 },
      { year: '2022', count: 320 },
      { year: '2023', count: 390 },
      { year: '2024', count: 470 },
      { year: '2025*', count: 350 },
    ],
    topCenters: [
      { name: 'Teknologi Penerbangan', count: 780 },
      { name: 'Sains Antariksa', count: 590 },
      { name: 'Transportasi Cerdas', count: 350 },
    ],
  },
  {
    id: 'nuklir',
    name: 'Nuklir',
    Icon: Atom,
    count2022: 1533,
    countAll: 2980,
    yearly: [
      { year: '2015', count: 75 },
      { year: '2016', count: 95 },
      { year: '2017', count: 130 },
      { year: '2018', count: 160 },
      { year: '2019', count: 210 },
      { year: '2020', count: 195 },
      { year: '2021', count: 240 },
      { year: '2022', count: 280 },
      { year: '2023', count: 340 },
      { year: '2024', count: 410 },
      { year: '2025*', count: 310 },
    ],
    topCenters: [
      { name: 'Teknologi Reaktor Nuklir', count: 680 },
      { name: 'Keselamatan Radiasi', count: 510 },
      { name: 'Sains Nuklir Terapan', count: 340 },
    ],
  },
  {
    id: 'budaya',
    name: 'Budaya, Bahasa & Sejarah',
    Icon: Scroll,
    count2022: 1384,
    countAll: 2650,
    yearly: [
      { year: '2015', count: 65 },
      { year: '2016', count: 85 },
      { year: '2017', count: 120 },
      { year: '2018', count: 145 },
      { year: '2019', count: 190 },
      { year: '2020', count: 175 },
      { year: '2021', count: 215 },
      { year: '2022', count: 250 },
      { year: '2023', count: 310 },
      { year: '2024', count: 375 },
      { year: '2025*', count: 280 },
    ],
    topCenters: [
      { name: 'Preservasi Bahasa & Sastra', count: 620 },
      { name: 'Arkeologi & Sejarah', count: 460 },
      { name: 'Manuskrip & Tradisi Lisan', count: 300 },
    ],
  },
]

// Year tiles for bottom left filter
const YEAR_TILES = [
  { id: 'ALL', label: 'Semua tahun', count: '3.417 publikasi', ratio: 0.38 },
  { id: '2022', label: '2022', count: '595 publikasi', ratio: 0.16 },
  { id: '2023', label: '2023', count: '716 publikasi', ratio: 0.20 },
  { id: '2024', label: '2024', count: '935 publikasi', ratio: 0.26 },
  { id: '2025*', label: '2025*', count: '700 publikasi', ratio: 0.19 },
  { id: '2026*', label: '2026*', count: '469 publikasi', ratio: 0.13 },
  { id: '2027†', label: '2027†', count: '2 publikasi', ratio: 0.02 },
]

export default function ResearchOverviewModal({ open, onClose, publications = [] }) {
  const [selectedBidangId, setSelectedBidangId] = useState('elektronika')
  const [selectedYearId, setSelectedYearId] = useState('ALL')
  const canvasRef = useRef(null)

  const selectedBidang = useMemo(() => {
    return BIDANG_DATA.find(b => b.id === selectedBidangId) || BIDANG_DATA[0]
  }, [selectedBidangId])

  // Bar chart max calculation
  const maxYearlyCount = useMemo(() => {
    const counts = selectedBidang.yearly.map(y => y.count)
    return Math.max(...counts, 1000)
  }, [selectedBidang])

  // Pseudo-random seeded dot matrix renderer
  useEffect(() => {
    if (!open) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // DPR handling for sharp display
    const dpr = window.devicePixelRatio || 1
    const width = 480
    const height = 330
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    ctx.clearRect(0, 0, width, height)

    const cols = 50
    const rows = 35
    const dotSize = 4
    const gapX = (width - cols * dotSize) / (cols - 1)
    const gapY = (height - rows * dotSize) / (rows - 1)

    // Calculate active ratio based on chosen year & bidang
    const yearObj = YEAR_TILES.find(y => y.id === selectedYearId) || YEAR_TILES[0]
    const baseRatio = yearObj.ratio
    const bidangIndex = BIDANG_DATA.findIndex(b => b.id === selectedBidangId)
    // Seed variation based on selection
    const seed = (bidangIndex + 1) * 73 + (selectedYearId.charCodeAt(0) || 5)

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * (dotSize + gapX)
        const y = r * (dotSize + gapY)

        // Pseudo-random noise
        const hash = Math.sin(c * 12.9898 + r * 78.233 + seed) * 43758.5453
        const val = hash - Math.floor(hash)

        if (val < baseRatio) {
          // Active dot: royal blue
          ctx.fillStyle = '#2563eb'
        } else {
          // Inactive dot: soft gray
          ctx.fillStyle = '#e4e4e7'
        }

        ctx.fillRect(x, y, dotSize, dotSize)
      }
    }
  }, [open, selectedBidangId, selectedYearId])

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-6xl w-[96vw] max-h-[95vh] overflow-y-auto border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-3xl shadow-2xl">
        <DialogTitle className="sr-only">Sekilas Riset BRIN</DialogTitle>

        {/* ── Top Header Section ── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 font-mono tracking-wide uppercase">
              Sekilas Riset BRIN
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Setiap titik, sebuah pengetahuan.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Sentuh bidang atau tahun untuk melihat jejak publikasinya.
            </p>
          </div>

          <div className="text-right shrink-0">
            <div className="text-[11px] text-zinc-400 font-mono uppercase">Periode Visualisasi</div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">Sejak 2022</div>
          </div>
        </div>

        {/* ── Top 3 Metric Cards ── */}
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200 dark:divide-zinc-800 shadow-xs">
          <div className="sm:pr-6 pb-4 sm:pb-0">
            <div className="text-3xl sm:text-4xl font-extrabold text-blue-600 dark:text-blue-400 font-mono tracking-tight">
              34.464
            </div>
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1">
              Publikasi ilmiah
            </div>
            <div className="text-[11px] text-zinc-400 dark:text-zinc-500">
              Sejak 2022 dalam referensi
            </div>
          </div>

          <div className="sm:px-6 py-4 sm:py-0">
            <div className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight">
              7.818
            </div>
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1">
              Periset menjadi penulis
            </div>
            <div className="text-[11px] text-zinc-400 dark:text-zinc-500">
              Sejak 2022 dalam referensi
            </div>
          </div>

          <div className="sm:pl-6 pt-4 sm:pt-0">
            <div className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight">
              105
            </div>
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1">
              Pusat riset
            </div>
            <div className="text-[11px] text-zinc-400 dark:text-zinc-500">
              Dalam seluruh koleksi
            </div>
          </div>
        </div>

        {/* ── Main Two-Panel Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ── LEFT PANEL: Hamparan Seluruh Publikasi ── */}
          <div className="lg:col-span-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 bg-white dark:bg-zinc-900/30 flex flex-col justify-between space-y-5">
            {/* Header & Legend */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Hamparan seluruh publikasi
              </h3>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span>
                <span>Satu titik = satu publikasi</span>
              </div>
            </div>

            {/* Dot Matrix Canvas */}
            <div className="w-full flex items-center justify-center bg-zinc-50/50 dark:bg-zinc-950/40 rounded-xl p-3 border border-zinc-100 dark:border-zinc-800/60 overflow-hidden">
              <canvas
                ref={canvasRef}
                style={{ width: '100%', height: 'auto', maxWidth: 480, aspectRatio: '480/330' }}
                className="block"
              />
            </div>

            {/* Year Selector Tiles (Interactive) */}
            <div className="space-y-2">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {YEAR_TILES.map((tile) => {
                  const isActive = selectedYearId === tile.id
                  return (
                    <button
                      key={tile.id}
                      onClick={() => setSelectedYearId(tile.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        isActive
                          ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/30'
                          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                      }`}
                    >
                      <div className="font-bold text-xs">{tile.label}</div>
                      <div className="text-[10px] text-zinc-400 font-mono mt-0.5">{tile.count}</div>
                    </button>
                  )
                })}
              </div>

              {/* Footnote */}
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-relaxed pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                ⓘ * 2025-2026 belum lengkap. † Terdapat 44 entri bertahun 2027 dalam referensi, perlu verifikasi. Bidang dapat tumpang tindih.
              </p>
            </div>
          </div>

          {/* ── RIGHT PANEL: Publikasi Menurut Bidang ── */}
          <div className="lg:col-span-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 bg-white dark:bg-zinc-900/30 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Publikasi menurut bidang
              </h3>
              <span className="text-xs text-zinc-400 font-mono">11 bidang</span>
            </div>

            {/* Selected Bidang Summary Card */}
            <div className="space-y-4">
              {/* Field title with icon */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <selectedBidang.Icon className="w-4 h-4" />
                </div>
                <div className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {selectedBidang.name}
                </div>
              </div>

              {/* Counts row */}
              <div className="flex items-baseline gap-6">
                <div>
                  <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
                    {selectedBidang.count2022.toLocaleString('id-ID')}
                  </span>
                  <span className="block text-[11px] text-zinc-400 mt-0.5">
                    Publikasi sejak 2022
                  </span>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
                    {selectedBidang.countAll.toLocaleString('id-ID')}
                  </span>
                  <span className="block text-[11px] text-zinc-400 mt-0.5">
                    Publikasi seluruh tahun
                  </span>
                </div>
              </div>

              {/* Yearly Bar Chart */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                  <span>Jejak publikasi tahunan</span>
                  <span>2015–2025</span>
                </div>

                <div className="h-28 flex items-end justify-between gap-1.5 pt-4 pb-1 border-b border-zinc-200 dark:border-zinc-800">
                  {selectedBidang.yearly.map((item) => {
                    const heightPercent = Math.max(12, Math.round((item.count / maxYearlyCount) * 100))
                    return (
                      <div key={item.year} className="flex-1 flex flex-col items-center justify-end h-full group">
                        <span className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400 opacity-80 mb-1 group-hover:opacity-100 font-semibold">
                          {item.count}
                        </span>
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full max-w-[28px] bg-blue-600 hover:bg-blue-500 rounded-t transition-all"
                        />
                      </div>
                    )
                  })}
                </div>

                {/* Years labels below bars */}
                <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 pt-1">
                  {selectedBidang.yearly.map((item) => (
                    <span key={item.year} className="text-center flex-1">{item.year}</span>
                  ))}
                </div>

                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 italic pt-1">
                  ⓘ * Pengindeksan 2025 belum lengkap. Sentuh batang untuk melihat contoh judul.
                </p>
              </div>

              {/* Pusat Riset Paling Aktif List */}
              <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">Pusat riset paling aktif</span>
                  <span className="text-zinc-400">Seluruh tahun</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  {selectedBidang.topCenters.map((center, i) => (
                    <div key={i} className="flex items-center justify-between py-1 border-b border-zinc-100/80 dark:border-zinc-800/50">
                      <span className="text-zinc-700 dark:text-zinc-300 font-medium">{center.name}</span>
                      <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        {center.count.toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 11 Bidang Selection Grid (Interactive Cards) */}
            <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {BIDANG_DATA.map((bidang) => {
                  const isSelected = selectedBidangId === bidang.id
                  const IconComp = bidang.Icon
                  return (
                    <button
                      key={bidang.id}
                      onClick={() => setSelectedBidangId(bidang.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between min-h-[78px] ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-xs ring-1 ring-blue-500/20'
                          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <IconComp className={`w-4 h-4 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-500 dark:text-zinc-400'}`} />
                        <span className="text-[10px] font-mono text-zinc-400">
                          {bidang.count2022.toLocaleString('id-ID')} Publikasi
                        </span>
                      </div>
                      <div className="font-bold text-xs leading-tight mt-1">
                        {bidang.name}
                      </div>
                    </button>
                  )
                })}
              </div>

              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 pt-2">
                ⓘ Bidang dikelompokkan oleh tim RII. Satu publikasi dapat dihitung dalam lebih dari satu bidang.
              </p>
            </div>

          </div>

        </div>

        {/* ── Bottom Close Button (Pill button on right) ── */}
        <div className="pt-2 flex justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-full px-8 py-2 border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 font-medium text-xs sm:text-sm h-10 shadow-xs"
          >
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
