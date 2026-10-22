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
  Check,
  X,
  Filter,
  FileDown,
  Hash,
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

/* ─────────────────────────────────────────────────────────────
   Field label map (English column names for the form/table)
───────────────────────────────────────────────────────────── */
const FIELD_LABELS = {
  publication_id:    'Publication ID',
  title:             'Title',
  publication_media: 'Media',
  coverage:          'Coverage',
  year:              'Year',
  source:            'Source',
  brin_author:       'BRIN Author(s)',
  research_center:   'Research Center / Satker',
  field:             'Field',
  province:          'Province',
  region:            'Region',
  data_notes:        'Data Notes',
  is_counted:        'Counted',
  is_active:         'Active',
}

/* ─────────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────────── */
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
  const [deleting, setDeleting] = useState(false)

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

  const handleDeleteRequest = (pub) => {
    setItemToDelete(pub)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return
    setDeleting(true)
    try {
      await onDelete(itemToDelete.id)
      setDeleteConfirmOpen(false)
      setItemToDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  /* ── Coverage badge colour ── */
  const coverageBadgeVariant = (coverage) => {
    if (!coverage) return 'secondary'
    const c = coverage.toLowerCase()
    if (c.includes('internasional') || c.includes('international')) return 'default'
    if (c.includes('nasional') || c.includes('national')) return 'outline'
    return 'secondary'
  }

  /* ─────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────── */
  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-500" />
            Publications
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} of {publications.length} records
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Add Publication
        </Button>
      </div>

      {/* ── Filters ── */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="pub-search"
              placeholder="Search title, author, field, region…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Coverage filter */}
          <div className="flex items-center gap-1">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              id="pub-filter-coverage"
              value={filterCoverage}
              onChange={e => setFilterCoverage(e.target.value)}
              className="text-sm border rounded-md px-3 py-2 bg-background"
            >
              <option value="ALL">All Coverage</option>
              {coverageOptions.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Source filter */}
          <select
            id="pub-filter-source"
            value={filterSource}
            onChange={e => setFilterSource(e.target.value)}
            className="text-sm border rounded-md px-3 py-2 bg-background"
          >
            <option value="ALL">All Sources</option>
            {sourceOptions.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Year filter */}
          <select
            id="pub-filter-year"
            value={filterYear}
            onChange={e => setFilterYear(e.target.value)}
            className="text-sm border rounded-md px-3 py-2 bg-background"
          >
            <option value="ALL">All Years</option>
            {yearOptions.map(y => (
              <option key={y} value={String(y)}>{y}</option>
            ))}
          </select>

          {/* Clear */}
          {(search || filterCoverage !== 'ALL' || filterSource !== 'ALL' || filterYear !== 'ALL') && (
            <Button
              id="pub-clear-filters"
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch('')
                setFilterCoverage('ALL')
                setFilterSource('ALL')
                setFilterYear('ALL')
              }}
              className="gap-1"
            >
              <X className="h-3 w-3" /> Clear
            </Button>
          )}
        </div>
      </Card>

      {/* ── Table ── */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <BookOpen className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-muted-foreground">No publications found.</p>
          <Button variant="outline" onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" /> Add Publication
          </Button>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-semibold text-muted-foreground whitespace-nowrap">#</th>
                  <th className="text-left p-3 font-semibold text-muted-foreground whitespace-nowrap">Pub ID</th>
                  <th className="text-left p-3 font-semibold text-muted-foreground min-w-[260px]">Title</th>
                  <th className="text-left p-3 font-semibold text-muted-foreground whitespace-nowrap">Media</th>
                  <th className="text-left p-3 font-semibold text-muted-foreground whitespace-nowrap">Coverage</th>
                  <th className="text-left p-3 font-semibold text-muted-foreground whitespace-nowrap">Year</th>
                  <th className="text-left p-3 font-semibold text-muted-foreground whitespace-nowrap">Source</th>
                  <th className="text-left p-3 font-semibold text-muted-foreground min-w-[160px]">BRIN Author(s)</th>
                  <th className="text-left p-3 font-semibold text-muted-foreground min-w-[160px]">Research Center</th>
                  <th className="text-left p-3 font-semibold text-muted-foreground whitespace-nowrap">Field</th>
                  <th className="text-left p-3 font-semibold text-muted-foreground whitespace-nowrap">Province</th>
                  <th className="text-left p-3 font-semibold text-muted-foreground whitespace-nowrap">Region</th>
                  <th className="text-center p-3 font-semibold text-muted-foreground whitespace-nowrap">Counted</th>
                  <th className="text-center p-3 font-semibold text-muted-foreground whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((pub, idx) => (
                  <tr
                    key={pub.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-3 text-muted-foreground text-center">{idx + 1}</td>
                    <td className="p-3 whitespace-nowrap">
                      {pub.publication_id ? (
                        <span className="font-mono text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">
                          {pub.publication_id}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="font-medium line-clamp-2 leading-snug">{pub.title}</span>
                    </td>
                    <td className="p-3 whitespace-nowrap text-muted-foreground text-xs">{pub.publication_media || '—'}</td>
                    <td className="p-3">
                      {pub.coverage ? (
                        <Badge variant={coverageBadgeVariant(pub.coverage)} className="text-xs whitespace-nowrap">
                          {pub.coverage}
                        </Badge>
                      ) : <span className="text-muted-foreground/50">—</span>}
                    </td>
                    <td className="p-3 text-center font-mono text-xs">{pub.year || '—'}</td>
                    <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">{pub.source || '—'}</td>
                    <td className="p-3 text-xs text-muted-foreground">
                      <span className="line-clamp-2">{pub.brin_author || '—'}</span>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      <span className="line-clamp-2">{pub.research_center || '—'}</span>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">{pub.field || '—'}</td>
                    <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">{pub.province || '—'}</td>
                    <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">{pub.region || '—'}</td>
                    <td className="p-3 text-center">
                      {pub.is_counted ? (
                        <Check className="h-4 w-4 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 justify-center">
                        <Button
                          id={`pub-view-${pub.id}`}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setDetailItem(pub)}
                          title="View detail"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          id={`pub-edit-${pub.id}`}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(pub)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          id={`pub-delete-${pub.id}`}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:text-destructive"
                          onClick={() => handleDeleteRequest(pub)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ─────────────────────────────────────────────────────
          DETAIL DIALOG
      ───────────────────────────────────────────────────── */}
      <Dialog open={!!detailItem} onOpenChange={() => setDetailItem(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              Publication Detail
            </DialogTitle>
          </DialogHeader>
          {detailItem && (
            <div className="space-y-4">
              {/* IDs */}
              <div className="flex flex-wrap gap-2">
                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                  id: {detailItem.id}
                </span>
                {detailItem.publication_id && (
                  <span className="font-mono text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">
                    publication_id: {detailItem.publication_id}
                  </span>
                )}
              </div>

              {/* Title */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Title</p>
                <p className="font-semibold leading-snug">{detailItem.title}</p>
              </div>

              {/* Grid of fields */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                {[
                  ['Media', detailItem.publication_media],
                  ['Coverage', detailItem.coverage],
                  ['Year', detailItem.year],
                  ['Source', detailItem.source],
                  ['Field', detailItem.field],
                  ['Province', detailItem.province],
                  ['Region', detailItem.region],
                  ['Counted', detailItem.is_counted ? 'Yes' : 'No'],
                  ['Active', detailItem.is_active ? 'Yes' : 'No'],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="font-medium">{val != null && val !== '' ? String(val) : '—'}</p>
                  </div>
                ))}
              </div>

              {/* BRIN Author */}
              {detailItem.brin_author && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">BRIN Author(s)</p>
                  <p className="text-sm">{detailItem.brin_author}</p>
                </div>
              )}

              {/* Research Center */}
              {detailItem.research_center && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Research Center / Satker</p>
                  <p className="text-sm">{detailItem.research_center}</p>
                </div>
              )}

              {/* Data Notes */}
              {detailItem.data_notes && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Data Notes</p>
                  <p className="text-sm text-muted-foreground">{detailItem.data_notes}</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button variant="outline" onClick={() => { setDetailItem(null); openEdit(detailItem) }}>
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button variant="outline" onClick={() => setDetailItem(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─────────────────────────────────────────────────────
          CREATE / EDIT DIALOG
      ───────────────────────────────────────────────────── */}
      <Dialog open={formOpen} onOpenChange={open => { if (!saving) setFormOpen(open) }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              {editingId ? 'Edit Publication' : 'Add Publication'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* IDs row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <Hash className="h-3 w-3" /> Publication ID
                </label>
                <Input
                  id="form-publication-id"
                  placeholder="e.g. P10212"
                  value={formData.publication_id}
                  onChange={e => handleFormChange('publication_id', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Year</label>
                <Input
                  id="form-year"
                  type="number"
                  placeholder="e.g. 2024"
                  value={formData.year}
                  onChange={e => handleFormChange('year', e.target.value)}
                />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Title <span className="text-destructive">*</span>
              </label>
              <Input
                id="form-title"
                placeholder="Publication title"
                value={formData.title}
                onChange={e => handleFormChange('title', e.target.value)}
              />
            </div>

            {/* Media & Coverage */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Media</label>
                <Input
                  id="form-publication-media"
                  placeholder="e.g. Jurnal, Prosiding"
                  value={formData.publication_media}
                  onChange={e => handleFormChange('publication_media', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Coverage</label>
                <Input
                  id="form-coverage"
                  placeholder="e.g. Internasional, Nasional"
                  value={formData.coverage}
                  onChange={e => handleFormChange('coverage', e.target.value)}
                />
              </div>
            </div>

            {/* Source & Field */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Source</label>
                <Input
                  id="form-source"
                  placeholder="e.g. Scopus, Sinta"
                  value={formData.source}
                  onChange={e => handleFormChange('source', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Field</label>
                <Input
                  id="form-field"
                  placeholder="Research field / area"
                  value={formData.field}
                  onChange={e => handleFormChange('field', e.target.value)}
                />
              </div>
            </div>

            {/* BRIN Author */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">BRIN Author(s)</label>
              <Input
                id="form-brin-author"
                placeholder="Authors affiliated with BRIN (semicolon-separated)"
                value={formData.brin_author}
                onChange={e => handleFormChange('brin_author', e.target.value)}
              />
            </div>

            {/* Research Center */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Research Center / Satker</label>
              <Input
                id="form-research-center"
                placeholder="Research center or work unit"
                value={formData.research_center}
                onChange={e => handleFormChange('research_center', e.target.value)}
              />
            </div>

            {/* Province & Region */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Province</label>
                <Input
                  id="form-province"
                  placeholder="Province"
                  value={formData.province}
                  onChange={e => handleFormChange('province', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Region</label>
                <Input
                  id="form-region"
                  placeholder="Region / Wilayah"
                  value={formData.region}
                  onChange={e => handleFormChange('region', e.target.value)}
                />
              </div>
            </div>

            {/* Data Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Data Notes</label>
              <textarea
                id="form-data-notes"
                placeholder="Additional notes about this data entry…"
                value={formData.data_notes}
                onChange={e => handleFormChange('data_notes', e.target.value)}
                rows={3}
                className="w-full text-sm border rounded-md px-3 py-2 bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Toggles */}
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
                <input
                  id="form-is-counted"
                  type="checkbox"
                  checked={formData.is_counted}
                  onChange={e => handleFormChange('is_counted', e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                Counted (Dihitung)
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
                <input
                  id="form-is-active"
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={e => handleFormChange('is_active', e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                Active
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                id="form-cancel"
                variant="outline"
                onClick={() => setFormOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                id="form-save"
                onClick={handleSubmit}
                disabled={saving || !formData.title.trim()}
                className="gap-2"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingId ? 'Save Changes' : 'Add Publication'}
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
            <AlertDialogTitle>Delete Publication?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong>"{itemToDelete?.title}"</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              id="confirm-delete-pub"
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
