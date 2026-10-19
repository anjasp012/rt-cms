import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  Lightbulb, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Loader2, 
  ExternalLink,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  Building2,
  FileCheck2,
  Sparkles,
  Layers,
  Users,
  Compass,
  X
} from 'lucide-react'
import { getImageUrl, stripHtml } from '@/lib/utils'

export default function InnovationsView({
  innovations,
  zones,
  personas,
  loading,
  onSaveInnovation,
  onDeleteInnovation,
  onNavigateToForm
}) {
  const [search, setSearch] = useState('')
  const [selectedZoneFilter, setSelectedZoneFilter] = useState('ALL')
  const [selectedPersonaFilter, setSelectedPersonaFilter] = useState('ALL')

  // Modals
  const [detailItem, setDetailItem] = useState(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  const filtered = useMemo(() => {
    return innovations.filter(item => {
      // Zone filter (matches primary zone or relevant zones)
      if (selectedZoneFilter !== 'ALL') {
        const matchesPrimary = item.zone_id === selectedZoneFilter || item.zone?.name === selectedZoneFilter
        const matchesRelevant = item.relevant_zones?.some(z => z.id === selectedZoneFilter || z.name === selectedZoneFilter)
        if (!matchesPrimary && !matchesRelevant) return false
      }

      // Persona filter
      if (selectedPersonaFilter !== 'ALL') {
        const matchesPersona = item.personas?.some(p => p.id === selectedPersonaFilter || p.name === selectedPersonaFilter) ||
          item.persona_id === selectedPersonaFilter
        if (!matchesPersona) return false
      }

      // Search filter
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        item.title?.toLowerCase().includes(q) ||
        item.publication_id?.toLowerCase().includes(q) ||
        item.question?.toLowerCase().includes(q) ||
        item.aspect?.toLowerCase().includes(q) ||
        item.summary?.toLowerCase().includes(q) ||
        item.research_center?.toLowerCase().includes(q) ||
        item.journal_publication?.toLowerCase().includes(q) ||
        item.zone?.name?.toLowerCase().includes(q)
      )
    })
  }, [innovations, search, selectedZoneFilter, selectedPersonaFilter])

  const handleOpenAdd = () => {
    onNavigateToForm(null)
  }

  const handleOpenEdit = (item) => {
    onNavigateToForm(item)
  }

  const handleOpenDelete = (item) => {
    setItemToDelete(item)
    setDeleteConfirmOpen(true)
  }

  const handleExecuteDelete = async () => {
    if (itemToDelete) {
      await onDeleteInnovation(itemToDelete.id)
    }
    setDeleteConfirmOpen(false)
    setItemToDelete(null)
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Top Filter and Actions Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search Bar */}
          <div className="relative min-w-[240px] flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input
              type="text"
              placeholder="Cari judul, ID publikasi, aspek, pertanyaan, periset..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-xs"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Tantangan */}
          <div className="relative">
            <select
              value={selectedZoneFilter}
              onChange={(e) => setSelectedZoneFilter(e.target.value)}
              className="h-9 pl-3 pr-7 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400 appearance-none font-medium"
            >
              <option value="ALL">Semua Tantangan ({zones.length})</option>
              {zones.map(z => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">▾</span>
          </div>

          {/* Filter Kategori Peran */}
          <div className="relative">
            <select
              value={selectedPersonaFilter}
              onChange={(e) => setSelectedPersonaFilter(e.target.value)}
              className="h-9 pl-3 pr-7 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400 appearance-none font-medium"
            >
              <option value="ALL">Semua Peran ({personas.length})</option>
              {personas.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">▾</span>
          </div>

          {(selectedZoneFilter !== 'ALL' || selectedPersonaFilter !== 'ALL' || search) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch('')
                setSelectedZoneFilter('ALL')
                setSelectedPersonaFilter('ALL')
              }}
              className="h-9 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Reset Filter
            </Button>
          )}
        </div>

        <Button
          size="sm"
          onClick={handleOpenAdd}
          className="h-9 text-xs font-medium gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Tambah Solusi Baru
        </Button>
      </div>

      {/* Main Table Card */}
      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-mono">
              <tr>
                <th className="p-3 w-12 text-center">No</th>
                <th className="p-3 text-left">Nama / Judul Solusi</th>
                <th className="p-3 w-48 text-left">Aspek</th>
                <th className="p-3 w-52 text-left">Tantangan</th>
                <th className="p-3 w-28 text-center">TRL</th>
                <th className="p-3 w-28 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-zinc-500 font-mono">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-zinc-400" />
                    <span>Memuat daftar solusi BRIN...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-zinc-500 font-mono">
                    <Lightbulb className="w-8 h-8 mx-auto mb-2 text-zinc-400 opacity-50" />
                    <span>Tidak ada data solusi yang cocok</span>
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => {
                  const zoneColor = item.zone?.color || '#996A12'
                  return (
                    <tr key={item.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors">
                      {/* No */}
                      <td className="p-3 text-center align-middle">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono font-bold text-xs">
                          {idx + 1}
                        </span>
                      </td>

                      {/* Nama / Judul Riset */}
                      <td className="p-3 align-middle">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {item.publication_id && (
                              <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-700 dark:text-blue-300 font-mono font-bold text-[10px]">
                                {item.publication_id}
                              </span>
                            )}
                            {item.year && (
                              <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono text-[10px]">
                                {item.year}
                              </span>
                            )}
                            {item.access_type && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 font-mono text-[9px]">
                                {item.access_type}
                              </span>
                            )}
                          </div>

                          <div
                            onClick={() => setDetailItem(item)}
                            className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                          >
                            {item.title}
                          </div>

                          {(item.writer || item.publication_media) && (
                            <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                              {item.writer && (
                                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                                  ✍️ {item.writer}
                                </span>
                              )}
                              {item.writer && item.publication_media && <span>•</span>}
                              {item.publication_media && (
                                <span className="italic text-zinc-500">
                                  📰 {item.publication_media}
                                </span>
                              )}
                            </div>
                          )}

                          {(item.research_center || item.satker) && (
                            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 line-clamp-1">
                              🏢 {item.research_center || item.satker}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Aspek */}
                      <td className="p-3 align-middle">
                        {item.aspect ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 font-medium text-xs border border-zinc-200 dark:border-zinc-700">
                            {item.aspect_icon && (
                              <i className={`mdi mdi-${item.aspect_icon} text-sm text-blue-600`}></i>
                            )}
                            <span>{item.aspect}</span>
                          </div>
                        ) : (
                          <span className="text-zinc-400 italic text-[11px]">-</span>
                        )}
                      </td>

                      {/* Bidang */}
                      <td className="p-3 align-middle">
                        <div 
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide border shadow-xs"
                          style={{
                            backgroundColor: `${zoneColor}15`,
                            borderColor: `${zoneColor}40`,
                            color: zoneColor
                          }}
                        >
                          <span 
                            className="w-2 h-2 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: zoneColor }} 
                          />
                          <span>{item.zone?.name || item.zone_name || '-'}</span>
                        </div>
                      </td>

                      {/* TRL */}
                      <td className="p-3 text-center align-middle">
                        <Badge variant="approved" className="font-mono text-xs px-2.5 py-0.5">
                          TRL {item.trl ?? 7}/9
                        </Badge>
                      </td>

                      {/* Aksi */}
                      <td className="p-3 text-center align-middle">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setDetailItem(item)}
                            className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                            title="Lihat Detail Lengkap"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                            title="Edit Data"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(item)}
                            className="p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-zinc-400 hover:text-rose-500 transition-colors"
                            title="Hapus Data"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detail Modal */}
      <Dialog open={!!detailItem} onOpenChange={(open) => !open && setDetailItem(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-0 shadow-2xl">
          {detailItem && (
            <div>
              {/* Header */}
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {detailItem.publication_id && (
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
                          {detailItem.publication_id}
                        </span>
                      )}
                      <span
                        className="px-2 py-0.5 rounded text-xs font-semibold"
                        style={{
                          backgroundColor: `${detailItem.zone?.color || '#996A12'}20`,
                          color: detailItem.zone?.color || '#996A12'
                        }}
                      >
                        {detailItem.zone?.name || detailItem.zone_name}
                      </span>
                      <Badge variant="approved">TRL {detailItem.trl}/9</Badge>
                    </div>

                    <DialogTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100 leading-snug pt-1">
                      {detailItem.title}
                    </DialogTitle>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5 text-xs">
                {/* 1. Pertanyaan Meja Sentuh & Pengantar */}
                {(detailItem.question || detailItem.introduction) && (
                  <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-semibold font-mono uppercase text-[11px]">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                      <span>Pertanyaan Meja Sentuh & Pengantar</span>
                    </div>
                    {detailItem.question && (
                      <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        {detailItem.card_icon && (
                          <i className={`mdi mdi-${detailItem.card_icon} text-lg text-amber-500`}></i>
                        )}
                        <span>"{detailItem.question}"</span>
                      </div>
                    )}
                    {detailItem.introduction && (
                      <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {detailItem.introduction}
                      </p>
                    )}
                  </div>
                )}

                {/* 2. Aspek & Ringkasan Abstrak */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-semibold font-mono uppercase text-[11px]">
                    <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                    <span>Aspek & Ringkasan Abstrak</span>
                  </div>
                  {detailItem.aspect && (
                    <div className="flex items-center gap-2 font-mono text-zinc-700 dark:text-zinc-300">
                      <span className="text-zinc-400">Aspek:</span>
                      {detailItem.aspect_icon && (
                        <i className={`mdi mdi-${detailItem.aspect_icon} text-base text-blue-600`}></i>
                      )}
                      <span className="font-semibold">{detailItem.aspect}</span>
                      {detailItem.aspect_icon && <span className="text-zinc-400 text-xs">({detailItem.aspect_icon})</span>}
                    </div>
                  )}
                  <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 leading-relaxed text-zinc-700 dark:text-zinc-300">
                    {detailItem.summary || detailItem.short_description || 'Belum ada ringkasan'}
                  </div>
                </div>

                {/* 3. Metadata Publikasi & Bukti Periset */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-semibold font-mono uppercase text-[11px]">
                    <FileCheck2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Metadata Publikasi & Verifikasi Periset</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800">
                    <div>
                      <span className="text-zinc-400 font-mono">Tahun:</span>{' '}
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">{detailItem.year || '-'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 font-mono">Akses:</span>{' '}
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">{detailItem.access_type || '-'}</span>
                    </div>
                    {(detailItem.writer || detailItem.author) && (
                      <div className="sm:col-span-2">
                        <span className="text-zinc-400 font-mono">Penulis / Writer:</span>{' '}
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">{detailItem.writer || detailItem.author}</span>
                      </div>
                    )}
                    <div className="sm:col-span-2">
                      <span className="text-zinc-400 font-mono">Media Publikasi:</span>{' '}
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">{detailItem.publication_media || detailItem.journal_publication || '-'}</span>
                    </div>
                    {detailItem.doi && (
                      <div className="sm:col-span-2">
                        <span className="text-zinc-400 font-mono">DOI:</span>{' '}
                        <span className="font-mono text-zinc-800 dark:text-zinc-200">{detailItem.doi}</span>
                      </div>
                    )}
                    {detailItem.abstract_url && (
                      <div className="sm:col-span-2">
                        <span className="text-zinc-400 font-mono">Tautan Abstrak:</span>{' '}
                        <a
                          href={detailItem.abstract_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 dark:text-blue-400 underline inline-flex items-center gap-1 font-mono break-all"
                        >
                          {detailItem.abstract_url}
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </div>
                    )}
                    {(detailItem.research_center || detailItem.satker) && (
                      <div className="sm:col-span-2">
                        <span className="text-zinc-400 font-mono">Pusat Riset / Satker:</span>{' '}
                        <p className="font-medium text-zinc-800 dark:text-zinc-200 mt-0.5">{detailItem.research_center || detailItem.satker}</p>
                      </div>
                    )}
                    {detailItem.author_proof && (
                      <div className="sm:col-span-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                        <span className="text-zinc-400 font-mono">Bukti Karya Periset BRIN:</span>{' '}
                        <p className="text-zinc-700 dark:text-zinc-300 mt-0.5 leading-relaxed bg-white dark:bg-zinc-900 p-2 rounded border border-zinc-200 dark:border-zinc-800">
                          {detailItem.author_proof}
                        </p>
                      </div>
                    )}
                    {detailItem.verification_notes && (
                      <div className="sm:col-span-2">
                        <span className="text-zinc-400 font-mono">Catatan Verifikasi:</span>{' '}
                        <p className="text-zinc-700 dark:text-zinc-300 mt-0.5 leading-relaxed bg-white dark:bg-zinc-900 p-2 rounded border border-zinc-200 dark:border-zinc-800">
                          {detailItem.verification_notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Tahukah Kamu? (Fun Fact) */}
                {detailItem.fun_fact && (
                  <div className="p-3.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-2">
                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold font-mono uppercase text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Tahukah Kamu?</span>
                    </div>
                    <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">
                      "{detailItem.fun_fact}"
                    </p>
                    {(detailItem.fun_fact_source || detailItem.fun_fact_url) && (
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 pt-1 border-t border-amber-200/60 dark:border-amber-900/40 flex items-center gap-2">
                        <span>Sumber: <strong>{detailItem.fun_fact_source || 'Ref'}</strong></span>
                        {detailItem.fun_fact_url && (
                          <a
                            href={detailItem.fun_fact_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-amber-700 dark:text-amber-400 underline inline-flex items-center gap-0.5 font-mono"
                          >
                            Tautan
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 5. Relasi Klasifikasi */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-semibold font-mono uppercase text-[11px]">
                    <Layers className="w-3.5 h-3.5 text-purple-500" />
                    <span>Relasi Tantangan & Peran</span>
                  </div>
                  <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
                    <div>
                      <span className="text-zinc-400 font-mono text-[11px] block mb-1">Tantangan Utama:</span>
                      <Badge variant="secondary" className="font-medium text-xs">
                        {detailItem.challenge?.name || detailItem.zone?.name || detailItem.zone_name}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-zinc-400 font-mono text-[11px] block mb-1">Tantangan Relevan (M2M):</span>
                      <div className="flex flex-wrap gap-1.5">
                        {(detailItem.relevant_challenges || detailItem.relevant_zones) && (detailItem.relevant_challenges || detailItem.relevant_zones).length > 0 ? (
                          (detailItem.relevant_challenges || detailItem.relevant_zones).map(rz => (
                            <Badge key={rz.id} variant="secondary" className="text-xs">
                              {rz.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-zinc-400 italic text-xs">Tidak ada tantangan relevan tambahan</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-zinc-400 font-mono text-[11px] block mb-1">Kategori Peran (M2M):</span>
                      <div className="flex flex-wrap gap-1.5">
                        {detailItem.personas && detailItem.personas.length > 0 ? (
                          detailItem.personas.map(p => (
                            <span
                              key={p.id}
                              className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 font-medium text-xs"
                            >
                              {p.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-zinc-400 italic text-xs">Semua Kategori Peran</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2 bg-zinc-50/50 dark:bg-zinc-950/50">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDetailItem(null)}
                  className="h-8 text-xs"
                >
                  Tutup
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const item = detailItem
                    setDetailItem(null)
                    handleOpenEdit(item)
                  }}
                  className="h-8 text-xs font-medium gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit Solusi Ini
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Data Solusi</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus solusi "{itemToDelete?.title}" ({itemToDelete?.publication_id || 'Tanpa ID'})? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleExecuteDelete}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
