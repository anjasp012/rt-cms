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
  BookOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Loader2,
  CheckCircle2,
  Building2,
  MapPin,
  Globe,
  X,
} from 'lucide-react'

/* ─────────────────────────────────────────────────────────────
   Empty form state
───────────────────────────────────────────────────────────── */
const emptyForm = () => ({
  publication_id:    '',
  title:             '',
  publication_media: '',
  coverage:          '',
  year:              '',
  source:            '',
  brin_author:       '',
  research_center:   '',
  field:             '',
  province:          '',
  region:            '',
  data_notes:        '',
  is_counted:        true,
  is_active:         true,
})

export default function PublicationsView({
  publications = [],
  loading = false,
  onSave,
  onDelete,
}) {
  const [search, setSearch] = useState('')
  const [filterCoverage, setFilterCoverage] = useState('ALL')
  const [filterSource, setFilterSource] = useState('ALL')
  const [filterYear, setFilterYear] = useState('ALL')

  // Modals
  const [detailItem, setDetailItem] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [formData, setFormData] = useState(emptyForm())
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  /* ── Derived filter options ── */
  const coverageOptions = useMemo(() => {
    const vals = [...new Set(publications.map(p => p.coverage).filter(Boolean))]
    return vals.sort()
  }, [publications])

  const sourceOptions = useMemo(() => {
    const vals = [...new Set(publications.map(p => p.source).filter(Boolean))]
    return vals.sort()
  }, [publications])

  const yearOptions = useMemo(() => {
    const vals = [...new Set(publications.map(p => p.year).filter(Boolean))]
    return vals.sort((a, b) => b - a)
  }, [publications])

  /* ── Filtered list ── */
  const filtered = useMemo(() => {
    return publications.filter(pub => {
      if (filterCoverage !== 'ALL' && pub.coverage !== filterCoverage) return false
      if (filterSource !== 'ALL' && pub.source !== filterSource) return false
      if (filterYear !== 'ALL' && String(pub.year) !== filterYear) return false
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        pub.title?.toLowerCase().includes(q) ||
        pub.publication_id?.toLowerCase().includes(q) ||
        pub.brin_author?.toLowerCase().includes(q) ||
        pub.research_center?.toLowerCase().includes(q) ||
        pub.field?.toLowerCase().includes(q) ||
        pub.province?.toLowerCase().includes(q) ||
        pub.region?.toLowerCase().includes(q) ||
        pub.source?.toLowerCase().includes(q)
      )
    })
  }, [publications, search, filterCoverage, filterSource, filterYear])

  /* ── Form helpers ── */
  const openCreate = () => {
    setEditingId(null)
    setFormData(emptyForm())
    setFormOpen(true)
  }

  const openEdit = (pub) => {
    setEditingId(pub.id)
    setFormData({
      publication_id:    pub.publication_id  || '',
      title:             pub.title           || '',
      publication_media: pub.publication_media || '',
      coverage:          pub.coverage        || '',
      year:              pub.year != null    ? String(pub.year) : '',
      source:            pub.source          || '',
      brin_author:       pub.brin_author     || '',
      research_center:   pub.research_center || '',
      field:             pub.field           || '',
      province:          pub.province        || '',
      region:            pub.region          || '',
      data_notes:        pub.data_notes      || '',
      is_counted:        pub.is_counted      ?? true,
      is_active:         pub.is_active       ?? true,
    })
    setFormOpen(true)
  }

  const handleFormChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.title.trim()) return
    setSaving(true)
    try {
      const payload = {
        ...formData,
        year: formData.year ? parseInt(formData.year, 10) : null,
        publication_id: formData.publication_id.trim() || null,
      }
      await onSave(editingId, payload)
      setFormOpen(false)
    } finally {
      setSaving(false)
    }
  }

  const handleOpenDelete = (pub) => {
    setItemToDelete(pub)
    setDeleteConfirmOpen(true)
  }

  const handleExecuteDelete = async () => {
    if (itemToDelete) {
      await onDelete(itemToDelete.id)
    }
    setDeleteConfirmOpen(false)
    setItemToDelete(null)
  }

  /* ─────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────── */
  return (
    <div className="space-y-4 animate-fade-in">
      {/* ── Top Filter and Actions Bar ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">

          {/* Search */}
          <div className="relative min-w-[240px] flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input
              type="text"
              placeholder="Cari judul, ID publikasi, penulis, bidang, wilayah..."
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

          {/* Coverage filter */}
          <div className="relative">
            <select
              value={filterCoverage}
              onChange={(e) => setFilterCoverage(e.target.value)}
              className="h-9 pl-3 pr-7 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400 appearance-none font-medium"
            >
              <option value="ALL">Semua Cakupan ({coverageOptions.length})</option>
              {coverageOptions.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">▾</span>
          </div>

          {/* Source filter */}
          <div className="relative">
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="h-9 pl-3 pr-7 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400 appearance-none font-medium"
            >
              <option value="ALL">Semua Sumber ({sourceOptions.length})</option>
              {sourceOptions.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">▾</span>
          </div>

          {/* Year filter */}
          <div className="relative">
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="h-9 pl-3 pr-7 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400 appearance-none font-medium"
            >
              <option value="ALL">Semua Tahun</option>
              {yearOptions.map(y => (
                <option key={y} value={String(y)}>{y}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">▾</span>
          </div>

          {/* Reset filter */}
          {(filterCoverage !== 'ALL' || filterSource !== 'ALL' || filterYear !== 'ALL' || search) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch('')
                setFilterCoverage('ALL')
                setFilterSource('ALL')
                setFilterYear('ALL')
              }}
              className="h-9 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Reset Filter
            </Button>
          )}
        </div>

        <Button
          size="sm"
          onClick={openCreate}
          className="h-9 text-xs font-medium gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Tambah Publikasi
        </Button>
      </div>

      {/* ── Main Table Card ── */}
      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-mono">
              <tr>
                <th className="p-3 w-12 text-center">No</th>
                <th className="p-3 text-left">Judul / Title</th>
                <th className="p-3 w-32 text-left">Cakupan</th>
                <th className="p-3 w-28 text-left">Bidang</th>
                <th className="p-3 w-36 text-left">Wilayah</th>
                <th className="p-3 w-20 text-center">Dihitung</th>
                <th className="p-3 w-28 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-zinc-500 font-mono">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-zinc-400" />
                    <span>Memuat daftar publikasi BRIN...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-zinc-500 font-mono">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 text-zinc-400 opacity-50" />
                    <span>Tidak ada data publikasi yang cocok</span>
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors">

                    {/* No */}
                    <td className="p-3 text-center align-middle">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono font-bold text-xs">
                        {idx + 1}
                      </span>
                    </td>

                    {/* Judul / Title */}
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
                          {item.source && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 font-mono text-[9px]">
                              {item.source}
                            </span>
                          )}
                        </div>

                        <div
                          onClick={() => setDetailItem(item)}
                          className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                        >
                          {item.title}
                        </div>

                        {(item.brin_author || item.publication_media) && (
                          <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                            {item.brin_author && (
                              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                                ✍️ {item.brin_author}
                              </span>
                            )}
                            {item.brin_author && item.publication_media && <span>•</span>}
                            {item.publication_media && (
                              <span className="italic text-zinc-500">
                                📰 {item.publication_media}
                              </span>
                            )}
                          </div>
                        )}

                        {item.research_center && (
                          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 line-clamp-1">
                            🏢 {item.research_center}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Cakupan */}
                    <td className="p-3 align-middle">
                      {item.coverage ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 font-medium text-xs border border-zinc-200 dark:border-zinc-700">
                          <Globe className="w-3 h-3 text-blue-500" />
                          <span>{item.coverage}</span>
                        </div>
                      ) : (
                        <span className="text-zinc-400 italic text-[11px]">-</span>
                      )}
                    </td>

                    {/* Bidang */}
                    <td className="p-3 align-middle">
                      {item.field ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 font-medium text-xs border border-amber-200 dark:border-amber-800/40">
                          <span>{item.field}</span>
                        </div>
                      ) : (
                        <span className="text-zinc-400 italic text-[11px]">-</span>
                      )}
                    </td>

                    {/* Wilayah */}
                    <td className="p-3 align-middle">
                      {(item.province || item.region) ? (
                        <div className="space-y-0.5">
                          {item.province && (
                            <div className="flex items-center gap-1 text-[11px] text-zinc-700 dark:text-zinc-300">
                              <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                              <span>{item.province}</span>
                            </div>
                          )}
                          {item.region && (
                            <div className="text-[10px] text-zinc-400 dark:text-zinc-500 pl-4">
                              {item.region}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-zinc-400 italic text-[11px]">-</span>
                      )}
                    </td>

                    {/* Dihitung */}
                    <td className="p-3 text-center align-middle">
                      {item.is_counted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                      ) : (
                        <span className="text-zinc-300 dark:text-zinc-700 text-xs font-mono">—</span>
                      )}
                    </td>

                    {/* Aksi */}
                    <td className="p-3 text-center align-middle">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setDetailItem(item)}
                          className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                          title="Lihat Detail"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEdit(item)}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ─────────────────────────────────────────────────────
          DETAIL MODAL
      ───────────────────────────────────────────────────── */}
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
                      {detailItem.year && (
                        <span className="px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-xs">
                          {detailItem.year}
                        </span>
                      )}
                      {detailItem.source && (
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                          {detailItem.source}
                        </span>
                      )}
                      {detailItem.coverage && (
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                          {detailItem.coverage}
                        </span>
                      )}
                    </div>

                    <DialogTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100 leading-snug pt-1">
                      {detailItem.title}
                    </DialogTitle>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5 text-xs">

                {/* 1. Penulis & Media */}
                {(detailItem.brin_author || detailItem.publication_media) && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-semibold font-mono uppercase text-[11px]">
                      <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                      <span>Penulis BRIN & Media Publikasi</span>
                    </div>
                    <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 space-y-2">
                      {detailItem.brin_author && (
                        <div>
                          <span className="text-zinc-400 font-mono">Penulis BRIN:</span>{' '}
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200">{detailItem.brin_author}</span>
                        </div>
                      )}
                      {detailItem.publication_media && (
                        <div>
                          <span className="text-zinc-400 font-mono">Media Publikasi:</span>{' '}
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200">{detailItem.publication_media}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. Pusat Riset & Bidang */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-semibold font-mono uppercase text-[11px]">
                    <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Pusat Riset & Bidang</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800">
                    {detailItem.research_center && (
                      <div className="sm:col-span-2">
                        <span className="text-zinc-400 font-mono">Pusat Riset / Satker:</span>{' '}
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">{detailItem.research_center}</span>
                      </div>
                    )}
                    {detailItem.field && (
                      <div>
                        <span className="text-zinc-400 font-mono">Bidang:</span>{' '}
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">{detailItem.field}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-zinc-400 font-mono">Dihitung:</span>{' '}
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {detailItem.is_counted ? '✅ Ya' : '❌ Tidak'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Lokasi */}
                {(detailItem.province || detailItem.region) && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-semibold font-mono uppercase text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>Provinsi & Wilayah</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800">
                      {detailItem.province && (
                        <div>
                          <span className="text-zinc-400 font-mono">Provinsi:</span>{' '}
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200">{detailItem.province}</span>
                        </div>
                      )}
                      {detailItem.region && (
                        <div>
                          <span className="text-zinc-400 font-mono">Wilayah:</span>{' '}
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200">{detailItem.region}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. Catatan Data */}
                {detailItem.data_notes && (
                  <div className="p-3.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-2">
                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold font-mono uppercase text-[11px]">
                      <span>📋</span>
                      <span>Catatan Data</span>
                    </div>
                    <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed">
                      {detailItem.data_notes}
                    </p>
                  </div>
                )}
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
                    openEdit(item)
                  }}
                  className="h-8 text-xs font-medium gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit Publikasi Ini
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─────────────────────────────────────────────────────
          CREATE / EDIT DIALOG
      ───────────────────────────────────────────────────── */}
      <Dialog open={formOpen} onOpenChange={(open) => { if (!saving) setFormOpen(open) }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500" />
              {editingId ? 'Edit Publikasi' : 'Tambah Publikasi Baru'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-xs">
            {/* IDs row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-zinc-500 dark:text-zinc-400 font-mono uppercase text-[10px] font-semibold tracking-wide">
                  Publication ID
                </label>
                <Input
                  placeholder="e.g. P10212"
                  value={formData.publication_id}
                  onChange={e => handleFormChange('publication_id', e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-zinc-500 dark:text-zinc-400 font-mono uppercase text-[10px] font-semibold tracking-wide">
                  Tahun
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 2024"
                  value={formData.year}
                  onChange={e => handleFormChange('year', e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-zinc-500 dark:text-zinc-400 font-mono uppercase text-[10px] font-semibold tracking-wide">
                Judul / Title <span className="text-rose-400">*</span>
              </label>
              <Input
                placeholder="Judul publikasi"
                value={formData.title}
                onChange={e => handleFormChange('title', e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            {/* Media & Coverage */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-zinc-500 dark:text-zinc-400 font-mono uppercase text-[10px] font-semibold tracking-wide">
                  Media Publikasi
                </label>
                <Input
                  placeholder="e.g. Jurnal, Prosiding"
                  value={formData.publication_media}
                  onChange={e => handleFormChange('publication_media', e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-zinc-500 dark:text-zinc-400 font-mono uppercase text-[10px] font-semibold tracking-wide">
                  Cakupan
                </label>
                <Input
                  placeholder="e.g. Internasional, Nasional"
                  value={formData.coverage}
                  onChange={e => handleFormChange('coverage', e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            {/* Source & Field */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-zinc-500 dark:text-zinc-400 font-mono uppercase text-[10px] font-semibold tracking-wide">
                  Sumber
                </label>
                <Input
                  placeholder="e.g. Scopus, Sinta"
                  value={formData.source}
                  onChange={e => handleFormChange('source', e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-zinc-500 dark:text-zinc-400 font-mono uppercase text-[10px] font-semibold tracking-wide">
                  Bidang
                </label>
                <Input
                  placeholder="Bidang riset / area"
                  value={formData.field}
                  onChange={e => handleFormChange('field', e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            {/* BRIN Author */}
            <div className="space-y-1.5">
              <label className="text-zinc-500 dark:text-zinc-400 font-mono uppercase text-[10px] font-semibold tracking-wide">
                Penulis BRIN
              </label>
              <Input
                placeholder="Nama penulis afiliasi BRIN (pisah titik koma)"
                value={formData.brin_author}
                onChange={e => handleFormChange('brin_author', e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            {/* Research Center */}
            <div className="space-y-1.5">
              <label className="text-zinc-500 dark:text-zinc-400 font-mono uppercase text-[10px] font-semibold tracking-wide">
                Pusat Riset / Satker
              </label>
              <Input
                placeholder="Nama pusat riset atau satuan kerja"
                value={formData.research_center}
                onChange={e => handleFormChange('research_center', e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            {/* Province & Region */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-zinc-500 dark:text-zinc-400 font-mono uppercase text-[10px] font-semibold tracking-wide">
                  Provinsi
                </label>
                <Input
                  placeholder="Provinsi"
                  value={formData.province}
                  onChange={e => handleFormChange('province', e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-zinc-500 dark:text-zinc-400 font-mono uppercase text-[10px] font-semibold tracking-wide">
                  Wilayah
                </label>
                <Input
                  placeholder="Wilayah / Region"
                  value={formData.region}
                  onChange={e => handleFormChange('region', e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            {/* Data Notes */}
            <div className="space-y-1.5">
              <label className="text-zinc-500 dark:text-zinc-400 font-mono uppercase text-[10px] font-semibold tracking-wide">
                Catatan Data
              </label>
              <textarea
                placeholder="Catatan tambahan tentang data ini..."
                value={formData.data_notes}
                onChange={e => handleFormChange('data_notes', e.target.value)}
                rows={3}
                className="w-full text-xs border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-2 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 resize-none focus:outline-none focus:ring-1 focus:ring-zinc-400 placeholder:text-zinc-400"
              />
            </div>

            {/* Toggles */}
            <div className="flex gap-5 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={formData.is_counted}
                  onChange={e => handleFormChange('is_counted', e.target.checked)}
                  className="h-3.5 w-3.5 rounded"
                />
                Dihitung (Counted)
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={e => handleFormChange('is_active', e.target.checked)}
                  className="h-3.5 w-3.5 rounded"
                />
                Aktif
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFormOpen(false)}
                disabled={saving}
                className="h-8 text-xs"
              >
                Batal
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={saving || !formData.title.trim()}
                className="h-8 text-xs font-medium gap-1.5"
              >
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {editingId ? 'Simpan Perubahan' : 'Tambah Publikasi'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─────────────────────────────────────────────────────
          DELETE CONFIRM DIALOG
      ───────────────────────────────────────────────────── */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Data Publikasi</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus publikasi "{itemToDelete?.title}" ({itemToDelete?.publication_id || 'Tanpa ID'})? Tindakan ini tidak dapat dibatalkan.
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
