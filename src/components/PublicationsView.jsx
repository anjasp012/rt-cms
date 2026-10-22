import { useState, useMemo, useEffect } from 'react'
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
  FileSpreadsheet,
  Upload,
  FileText,
  Layers,
  Sparkles,
  Info
} from 'lucide-react'
import { exportPublicationsToExcel } from '@/lib/excelExport'
import PublicationImportModal from './PublicationImportModal'
import ResearchOverviewModal from './ResearchOverviewModal'
import { toast } from 'sonner'

/* ─────────────────────────────────────────────────────────────
   Helper: safely convert value (Array, JSON string, or semicolon string) to Array
───────────────────────────────────────────────────────────── */
export const toList = (val) => {
  if (!val) return []
  if (Array.isArray(val)) return val.map(x => String(x).trim()).filter(Boolean)
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val)
      if (Array.isArray(parsed)) return parsed.map(x => String(x).trim()).filter(Boolean)
    } catch (e) {}
    return val.split(';').map(x => x.trim()).filter(Boolean)
  }
  return []
}

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
  onReload,
}) {
  const [search, setSearch] = useState('')
  const [filterCoverage, setFilterCoverage] = useState('ALL')
  const [filterSource, setFilterSource] = useState('ALL')
  const [filterYear, setFilterYear] = useState('ALL')
  const [filterField, setFilterField] = useState('ALL')

  // Pagination
  const PAGE_SIZE = 100
  const [currentPage, setCurrentPage] = useState(1)

  // Modals
  const [detailItem, setDetailItem] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [formData, setFormData] = useState(emptyForm())
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  const [importModalOpen, setImportModalOpen] = useState(false)
  const [overviewOpen, setOverviewOpen] = useState(false)
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

  const fieldOptions = useMemo(() => {
    const set = new Set()
    publications.forEach(p => {
      toList(p.field).forEach(f => {
        if (f) set.add(f)
      })
    })
    return Array.from(set).sort()
  }, [publications])

  /* ── Filtered list ── */
  const filtered = useMemo(() => {
    return publications.filter(pub => {
      if (filterCoverage !== 'ALL' && pub.coverage !== filterCoverage) return false
      if (filterSource !== 'ALL' && pub.source !== filterSource) return false
      if (filterYear !== 'ALL' && String(pub.year) !== filterYear) return false
      if (filterField !== 'ALL') {
        const fields = toList(pub.field)
        if (!fields.includes(filterField)) return false
      }
      if (!search.trim()) return true
      const q = search.toLowerCase()
      const authorsStr = toList(pub.brin_author).join(' ').toLowerCase()
      const centersStr = toList(pub.research_center).join(' ').toLowerCase()
      const fieldsStr = toList(pub.field).join(' ').toLowerCase()
      return (
        pub.title?.toLowerCase().includes(q) ||
        pub.publication_id?.toLowerCase().includes(q) ||
        authorsStr.includes(q) ||
        centersStr.includes(q) ||
        fieldsStr.includes(q) ||
        pub.province?.toLowerCase().includes(q) ||
        pub.region?.toLowerCase().includes(q) ||
        pub.source?.toLowerCase().includes(q) ||
        pub.publication_media?.toLowerCase().includes(q)
      )
    })
  }, [publications, search, filterCoverage, filterSource, filterYear, filterField])

  // Reset to page 1 when filters/search change
  useEffect(() => {
    setCurrentPage(1)
  }, [filtered])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginatedFiltered = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, currentPage])

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
      brin_author:       toList(pub.brin_author).join('; '),
      research_center:   toList(pub.research_center).join('; '),
      field:             toList(pub.field).join('; '),
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
    if (!formData.title.trim()) {
      toast.error('Judul publikasi wajib diisi')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...formData,
        year: formData.year ? parseInt(formData.year, 10) : null,
        publication_id: formData.publication_id.trim() || null,
        brin_author: toList(formData.brin_author),
        research_center: toList(formData.research_center),
        field: toList(formData.field),
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

  const handleExport = () => {
    const dataToExport = filtered.length > 0 ? filtered : publications
    if (dataToExport.length === 0) {
      toast.error('Tidak ada data publikasi untuk diexport')
      return
    }
    exportPublicationsToExcel(dataToExport)
    toast.success(`${dataToExport.length} data publikasi berhasil diexport ke Excel`)
  }

  /* ─────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────── */
  return (
    <div className="space-y-4 animate-fade-in">
      {/* ── Top Filter and Actions Bar (Consistent with InnovationsView) ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">

          {/* Search Bar */}
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

          {/* Cakupan filter */}
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

          {/* Sumber filter */}
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

          {/* Tahun filter */}
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

          {/* Bidang filter */}
          {fieldOptions.length > 0 && (
            <div className="relative">
              <select
                value={filterField}
                onChange={(e) => setFilterField(e.target.value)}
                className="h-9 pl-3 pr-7 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400 appearance-none font-medium max-w-[160px] truncate"
              >
                <option value="ALL">Semua Bidang ({fieldOptions.length})</option>
                {fieldOptions.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">▾</span>
            </div>
          )}

          {/* Reset filter */}
          {(filterCoverage !== 'ALL' || filterSource !== 'ALL' || filterYear !== 'ALL' || filterField !== 'ALL' || search) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch('')
                setFilterCoverage('ALL')
                setFilterSource('ALL')
                setFilterYear('ALL')
                setFilterField('ALL')
              }}
              className="h-9 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Reset Filter
            </Button>
          )}
        </div>

        {/* Action Buttons: Export, Import, Create */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="h-9 text-xs font-medium gap-1.5 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
            title="Export data publikasi ke Microsoft Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Export Excel</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setImportModalOpen(true)}
            className="h-9 text-xs font-medium gap-1.5 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
            title="Import data publikasi dari file Excel atau CSV"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Import Excel/CSV</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setOverviewOpen(true)}
            className="h-9 text-xs font-medium gap-1.5 border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60"
            title="Lihat infografis visualisasi data riset BRIN"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Sekilas Riset BRIN</span>
          </Button>

          <Button
            size="sm"
            onClick={openCreate}
            className="h-9 text-xs font-medium gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Publikasi</span>
          </Button>
        </div>
      </div>

      {/* ── Main Table Card (Exact format & styling as InnovationsView) ── */}
      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-mono">
              <tr>
                <th className="p-3 w-12 text-center">No</th>
                <th className="p-3 text-left">Nama / Judul Publikasi</th>
                <th className="p-3 w-48 text-left">Bidang Riset</th>
                <th className="p-3 w-44 text-left">Provinsi & Wilayah</th>
                <th className="p-3 w-24 text-center">Dihitung</th>
                <th className="p-3 w-28 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-zinc-500 font-mono">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-zinc-400" />
                    <span>Memuat daftar publikasi BRIN...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-zinc-500 font-mono">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 text-zinc-400 opacity-50" />
                    <span>Tidak ada data publikasi yang cocok</span>
                  </td>
                </tr>
              ) : (
                paginatedFiltered.map((item, idx) => {
                  const absoluteIdx = (currentPage - 1) * PAGE_SIZE + idx
                  return (
                  <tr key={item.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors">

                    {/* No */}
                    <td className="p-3 text-center align-middle">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono font-bold text-xs">
                        {absoluteIdx + 1}
                      </span>
                    </td>

                    {/* Judul / Title & Badges */}
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
                          {item.publication_media && (
                            <span className="px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 font-mono text-[9px]">
                              {item.publication_media}
                            </span>
                          )}
                        </div>

                        <div
                          onClick={() => setDetailItem(item)}
                          className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors leading-snug"
                        >
                          {item.title}
                        </div>

                        {/* Authors chips */}
                        {toList(item.brin_author).length > 0 && (
                          <div className="flex flex-wrap items-center gap-1 pt-0.5">
                            {toList(item.brin_author).map((author, aIdx) => (
                              <span
                                key={aIdx}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px] font-medium"
                              >
                                <span>✍️</span>
                                <span className="truncate max-w-[200px]">{author}</span>
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Research Center chips */}
                        {toList(item.research_center).length > 0 && (
                          <div className="flex flex-wrap items-center gap-1 pt-0.5">
                            {toList(item.research_center).map((center, cIdx) => (
                              <span
                                key={cIdx}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60 text-zinc-600 dark:text-zinc-400 text-[10px]"
                              >
                                <span>🏢</span>
                                <span className="truncate max-w-[220px]">{center}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Bidang */}
                    <td className="p-3 align-middle">
                      {toList(item.field).length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {toList(item.field).map((f, fIdx) => (
                            <div
                              key={fIdx}
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 font-medium text-[11px] border border-amber-200 dark:border-amber-800/40 w-fit"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                              <span className="leading-tight">{f}</span>
                            </div>
                          ))}
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
                            <div className="flex items-center gap-1 text-[11px] text-zinc-700 dark:text-zinc-300 font-medium">
                              <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                              <span>{item.province}</span>
                            </div>
                          )}
                          {item.region && (
                            <div className="text-[10px] text-zinc-400 dark:text-zinc-500 pl-4 font-mono">
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
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                          <CheckCircle2 className="w-3 h-3" />
                          Ya
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                          Tidak
                        </span>
                      )}
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
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Card Footer with Pagination */}
        <div className="px-4 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
          <div>
            Menampilkan <strong>{Math.min((currentPage - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(currentPage * PAGE_SIZE, filtered.length)}</strong> dari <strong>{filtered.length.toLocaleString('id-ID')}</strong> hasil filter (<strong>{publications.length.toLocaleString('id-ID')}</strong> total)
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >«</button>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >‹</button>
              <span className="px-3 py-1 rounded bg-zinc-100 dark:bg-zinc-800">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >›</button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >»</button>
            </div>
          )}
          <div className="text-[11px] text-zinc-400">
            {publications.filter(p => p.is_counted).length.toLocaleString('id-ID')} dihitung
          </div>
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
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${detailItem.is_counted ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600'}`}>
                        {detailItem.is_counted ? '✅ Dihitung' : '❌ Tidak Dihitung'}
                      </span>
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
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-semibold font-mono uppercase text-[11px]">
                    <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                    <span>Penulis BRIN & Media Publikasi</span>
                  </div>
                  <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
                    {toList(detailItem.brin_author).length > 0 && (
                      <div className="space-y-1">
                        <span className="text-zinc-400 font-mono text-[11px]">Penulis BRIN:</span>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {toList(detailItem.brin_author).map((author, aIdx) => (
                            <span
                              key={aIdx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 font-medium text-xs"
                            >
                              <span>✍️</span> {author}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {detailItem.publication_media && (
                      <div>
                        <span className="text-zinc-400 font-mono text-[11px]">Media Publikasi:</span>{' '}
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">{detailItem.publication_media}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Pusat Riset & Bidang */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-semibold font-mono uppercase text-[11px]">
                    <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Pusat Riset & Bidang</span>
                  </div>
                  <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
                    {toList(detailItem.research_center).length > 0 && (
                      <div className="space-y-1">
                        <span className="text-zinc-400 font-mono text-[11px]">Pusat Riset / Satker:</span>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {toList(detailItem.research_center).map((center, cIdx) => (
                            <span
                              key={cIdx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-medium text-xs"
                            >
                              <span>🏢</span> {center}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {toList(detailItem.field).length > 0 && (
                      <div className="space-y-1">
                        <span className="text-zinc-400 font-mono text-[11px]">Bidang Riset:</span>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {toList(detailItem.field).map((field, fIdx) => (
                            <span
                              key={fIdx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-medium text-xs"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> {field}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {detailItem.source && (
                      <div>
                        <span className="text-zinc-400 font-mono text-[11px]">Sumber Indeks:</span>{' '}
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">{detailItem.source}</span>
                      </div>
                    )}
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
                  <div className="p-3.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-1.5">
                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold font-mono uppercase text-[11px]">
                      <Info className="w-3.5 h-3.5" />
                      <span>Catatan Data</span>
                    </div>
                    <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed font-mono text-[11px]">
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
          CREATE / EDIT DIALOG (REVAMPED & WELL-STRUCTURED)
      ───────────────────────────────────────────────────── */}
      <Dialog open={formOpen} onOpenChange={(open) => { if (!saving) setFormOpen(open) }}>
        <DialogContent className="max-w-2xl max-h-[88vh] overflow-hidden flex flex-col border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-0 shadow-2xl">
          {/* Header Banner */}
          <div className="p-5 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/80 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="space-y-1 flex-1">
              <DialogTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {editingId ? 'Edit Data Publikasi' : 'Tambah Publikasi Baru'}
              </DialogTitle>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {editingId
                  ? 'Perbarui rincian metadata publikasi ilmiah dan karya periset BRIN.'
                  : 'Lengkapi formulir di bawah ini untuk menambahkan publikasi baru ke dalam database.'}
              </p>
            </div>
          </div>

          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs">

            {/* SECTION 1: Metadata Publikasi */}
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30 space-y-4">
              <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-semibold font-mono uppercase text-[11px]">
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                <span>Metadata Utama Publikasi</span>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-zinc-600 dark:text-zinc-400 font-medium text-xs flex items-center gap-1">
                  Judul Publikasi <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Masukkan judul publikasi secara lengkap..."
                  value={formData.title}
                  onChange={e => handleFormChange('title', e.target.value)}
                  className="w-full text-xs border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-2 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-zinc-400 leading-relaxed font-sans"
                />
              </div>

              {/* ID, Tahun, Sumber */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-zinc-600 dark:text-zinc-400 font-medium text-xs">
                    ID Publikasi
                  </label>
                  <Input
                    placeholder="e.g. P00001"
                    value={formData.publication_id}
                    onChange={e => handleFormChange('publication_id', e.target.value)}
                    className="h-9 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-zinc-600 dark:text-zinc-400 font-medium text-xs">
                    Tahun Terbit
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 2024"
                    value={formData.year}
                    onChange={e => handleFormChange('year', e.target.value)}
                    className="h-9 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-zinc-600 dark:text-zinc-400 font-medium text-xs">
                    Sumber Indeks
                  </label>
                  <Input
                    placeholder="e.g. Scopus, Sinta"
                    value={formData.source}
                    onChange={e => handleFormChange('source', e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              {/* Media & Cakupan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-zinc-600 dark:text-zinc-400 font-medium text-xs">
                    Media Publikasi
                  </label>
                  <Input
                    placeholder="e.g. Jurnal, Prosiding, Buku"
                    value={formData.publication_media}
                    onChange={e => handleFormChange('publication_media', e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-zinc-600 dark:text-zinc-400 font-medium text-xs">
                    Cakupan Publikasi
                  </label>
                  <Input
                    placeholder="e.g. Global, Internasional, Nasional"
                    value={formData.coverage}
                    onChange={e => handleFormChange('coverage', e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: Penulis & Afiliasi */}
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30 space-y-3.5">
              <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-semibold font-mono uppercase text-[11px]">
                <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Afiliasi & Penulis BRIN</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-zinc-600 dark:text-zinc-400 font-medium text-xs">
                    Penulis BRIN
                  </label>
                  <span className="text-[10px] text-zinc-400 font-mono">Pisahkan dengan titik koma (;)</span>
                </div>
                <Input
                  placeholder="e.g. Arifan Jaya Syahbana; Dwi Sarah; Eko Soebowo"
                  value={formData.brin_author}
                  onChange={e => handleFormChange('brin_author', e.target.value)}
                  className="h-9 text-xs"
                />
                {toList(formData.brin_author).length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {toList(formData.brin_author).map((a, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-[10px]">
                        ✍️ {a}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-zinc-600 dark:text-zinc-400 font-medium text-xs">
                      Pusat Riset / Satker
                    </label>
                    <span className="text-[10px] text-zinc-400 font-mono">(;)</span>
                  </div>
                  <Input
                    placeholder="e.g. Pusat Riset Teknologi Hidrodinamika; Pusat Riset Kebencanaan Geologi"
                    value={formData.research_center}
                    onChange={e => handleFormChange('research_center', e.target.value)}
                    className="h-9 text-xs"
                  />
                  {toList(formData.research_center).length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {toList(formData.research_center).map((c, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-[10px]">
                          🏢 {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-zinc-600 dark:text-zinc-400 font-medium text-xs">
                      Bidang Riset
                    </label>
                    <span className="text-[10px] text-zinc-400 font-mono">(;)</span>
                  </div>
                  <Input
                    placeholder="e.g. Bumi, Laut & Kebencanaan; Transportasi & Antariksa"
                    value={formData.field}
                    onChange={e => handleFormChange('field', e.target.value)}
                    className="h-9 text-xs"
                  />
                  {toList(formData.field).length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {toList(formData.field).map((f, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[10px]">
                          <span className="w-1 h-1 rounded-full bg-amber-500"></span> {f}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 3: Lokasi & Wilayah */}
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30 space-y-3.5">
              <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-semibold font-mono uppercase text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>Cakupan Wilayah / Lokasi</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-zinc-600 dark:text-zinc-400 font-medium text-xs">
                    Provinsi
                  </label>
                  <Input
                    placeholder="e.g. Jawa Tengah, DKI Jakarta"
                    value={formData.province}
                    onChange={e => handleFormChange('province', e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-zinc-600 dark:text-zinc-400 font-medium text-xs">
                    Wilayah / Region
                  </label>
                  <Input
                    placeholder="e.g. Jawa, Sumatera, Nasional"
                    value={formData.region}
                    onChange={e => handleFormChange('region', e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: Catatan & Status */}
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30 space-y-3.5">
              <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-semibold font-mono uppercase text-[11px]">
                <Info className="w-3.5 h-3.5 text-amber-500" />
                <span>Catatan & Status Data</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-600 dark:text-zinc-400 font-medium text-xs">
                  Catatan Data
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan tambahan mengenai pemetaan data atau verifikasi..."
                  value={formData.data_notes}
                  onChange={e => handleFormChange('data_notes', e.target.value)}
                  className="w-full text-xs border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-2 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-zinc-400 font-sans"
                />
              </div>

              {/* Status Toggle Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <label
                  onClick={() => handleFormChange('is_counted', !formData.is_counted)}
                  className={`p-3 rounded-lg border flex items-start gap-3 cursor-pointer select-none transition-all ${
                    formData.is_counted
                      ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20'
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.is_counted}
                    onChange={e => handleFormChange('is_counted', e.target.checked)}
                    className="h-4 w-4 rounded accent-emerald-600 mt-0.5"
                  />
                  <div>
                    <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                      Dihitung (Counted)
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-normal">
                      Data diikutsertakan dalam statistik publikasi riset BRIN.
                    </div>
                  </div>
                </label>

                <label
                  onClick={() => handleFormChange('is_active', !formData.is_active)}
                  className={`p-3 rounded-lg border flex items-start gap-3 cursor-pointer select-none transition-all ${
                    formData.is_active
                      ? 'border-blue-300 dark:border-blue-800 bg-blue-50/40 dark:bg-blue-950/20'
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={e => handleFormChange('is_active', e.target.checked)}
                    className="h-4 w-4 rounded accent-blue-600 mt-0.5"
                  />
                  <div>
                    <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                      Status Publikasi Aktif
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-normal">
                      Publikasi dapat dicari dan ditampilkan pada tabel sistem.
                    </div>
                  </div>
                </label>
              </div>
            </div>

          </div>

          {/* Fixed Footer */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/60 flex items-center justify-end gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFormOpen(false)}
              disabled={saving}
              className="h-9 text-xs"
            >
              Batal
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={saving || !formData.title.trim()}
              className="h-9 text-xs font-medium gap-1.5"
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : editingId ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Simpan Perubahan</span>
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  <span>Tambah Publikasi</span>
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─────────────────────────────────────────────────────
          IMPORT EXCEL / CSV MODAL
      ───────────────────────────────────────────────────── */}
      <PublicationImportModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={() => {
          setImportModalOpen(false)
          if (onReload) {
            onReload()
          } else {
            window.location.reload()
          }
        }}
      />

      {/* ─────────────────────────────────────────────────────
          SEKILAS RISET BRIN OVERVIEW MODAL
      ───────────────────────────────────────────────────── */}
      <ResearchOverviewModal
        open={overviewOpen}
        onClose={() => setOverviewOpen(false)}
        publications={publications}
      />

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
