import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Lightbulb, 
  Award, 
  Loader2, 
  Check, 
  FileText, 
  Compass, 
  Sparkles, 
  QrCode, 
  Download,
  Info
} from 'lucide-react'

export default function InnovationFormModal({ open, onOpenChange, innovation, zones, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category_tag: '',
    zone_id: 1,
    trl: 7,
    short_description: '',
    summary: '',
    impact: '',
    download_url: '',
    qr_code_data: '',
    order_priority: 90,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (innovation) {
      setFormData({
        title: innovation.title || '',
        slug: innovation.slug || '',
        category_tag: innovation.category_tag || '',
        zone_id: innovation.zone_id || (zones[0]?.id || 1),
        trl: innovation.trl || 7,
        short_description: innovation.short_description || '',
        summary: innovation.summary || '',
        impact: innovation.impact || '',
        download_url: innovation.download_url || '',
        qr_code_data: innovation.qr_code_data || '',
        order_priority: innovation.order_priority || 90,
      })
    } else {
      setFormData({
        title: '',
        slug: '',
        category_tag: '',
        zone_id: zones[0]?.id || 1,
        trl: 7,
        short_description: '',
        summary: '',
        impact: '',
        download_url: '',
        qr_code_data: '',
        order_priority: 90,
      })
    }
  }, [innovation, zones, open])

  const handleTitleChange = (val) => {
    const autoSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
    setFormData(prev => ({
      ...prev,
      title: val,
      slug: !innovation ? autoSlug : prev.slug
    }))
  }

  const getTrlDescription = (trlVal) => {
    if (trlVal <= 3) return 'Riset Dasar & Pembuktian Konsep Laboratorium (TRL 1-3)'
    if (trlVal <= 6) return 'Validasi Prototipe & Pengujian Lingkungan Relevan (TRL 4-6)'
    return 'Teknologi Teruji & Siap Implementasi / Hilirisasi Industri (TRL 7-9)'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.slug.trim() || !formData.category_tag.trim()) return
    setLoading(true)
    try {
      await onSave({
        ...formData,
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        category_tag: formData.category_tag.trim(),
        short_description: formData.short_description.trim(),
        summary: formData.summary.trim(),
        impact: formData.impact.trim(),
        download_url: formData.download_url.trim() || null,
        qr_code_data: formData.qr_code_data.trim() || null,
        zone_id: parseInt(formData.zone_id),
        trl: parseInt(formData.trl),
        order_priority: parseInt(formData.order_priority) || 0,
      })
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl p-0">
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-zinc-100 dark:text-zinc-900 shadow-sm">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {innovation ? 'Edit Data Penelitian BRIN' : 'Tambah Penelitian Baru'}
              </DialogTitle>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Katalog inovasi hasil riset yang akan ditampilkan pada layar meja interaktif.
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Section 1: Informasi Utama */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 font-semibold uppercase tracking-wider text-[11px] font-mono border-b border-zinc-100 dark:border-zinc-800/80 pb-1">
              <Sparkles className="w-3 h-3 text-zinc-400" />
              <span>Informasi Utama</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-mono text-zinc-500">Judul Penelitian / Inovasi *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Contoh: Sistem Irigasi Pintar IoT"
                  required
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-mono text-zinc-500">Slug Identifier *</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="sistem-irigasi-pintar-iot"
                  required
                  className="text-xs h-9 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1 sm:col-span-1">
                <Label className="text-xs font-mono text-zinc-500">Kategori / Tag *</Label>
                <Input
                  value={formData.category_tag}
                  onChange={(e) => setFormData({ ...formData, category_tag: e.target.value })}
                  placeholder="Pertanian Presisi"
                  required
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1 sm:col-span-1">
                <Label className="text-xs font-mono text-zinc-500">Zona Riset BRIN *</Label>
                <select
                  value={formData.zone_id}
                  onChange={(e) => setFormData({ ...formData, zone_id: e.target.value })}
                  className="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                >
                  {zones.map(z => (
                    <option key={z.id} value={z.id}>
                      Zona {z.zone_number}: {z.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 sm:col-span-1">
                <Label className="text-xs font-mono text-zinc-500">Prioritas Urutan</Label>
                <Input
                  type="number"
                  value={formData.order_priority}
                  onChange={(e) => setFormData({ ...formData, order_priority: e.target.value })}
                  placeholder="90"
                  className="text-xs h-9 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: TRL Meter Indicator */}
          <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between font-mono">
              <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 font-semibold">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>Tingkat Kesiapan Teknologi (TRL)</span>
              </div>
              <Badge variant="approved" className="font-mono text-xs px-2.5 py-0.5">
                TRL {formData.trl} / 9
              </Badge>
            </div>

            <input
              type="range"
              min="1"
              max="9"
              step="1"
              value={formData.trl}
              onChange={(e) => setFormData({ ...formData, trl: parseInt(e.target.value) })}
              className="w-full accent-zinc-900 dark:accent-zinc-100 cursor-pointer h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg"
            />

            <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
              <span>TRL 1 (Riset Awal)</span>
              <span className="text-zinc-600 dark:text-zinc-300 font-sans italic text-center">
                {getTrlDescription(formData.trl)}
              </span>
              <span>TRL 9 (Komersial)</span>
            </div>
          </div>

          {/* Section 3: Ringkasan & Dampak */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 font-semibold uppercase tracking-wider text-[11px] font-mono border-b border-zinc-100 dark:border-zinc-800/80 pb-1">
              <FileText className="w-3 h-3 text-zinc-400" />
              <span>Deskripsi & Dampak Terapan</span>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-mono text-zinc-500">Deskripsi Singkat (Layar Kartu) *</Label>
              <Input
                value={formData.short_description}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                placeholder="Monitoring dan kendali irigasi otomatis untuk efisiensi air lahan pertanian..."
                required
                className="text-xs h-9"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-mono text-zinc-500">Ringkasan Lengkap (Apa Inovasi Ini?) *</Label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Penjelasan mendalam mengenai mekanisme teknologi riset..."
                  rows={3}
                  required
                  className="w-full text-xs p-2.5 rounded-md bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-mono text-zinc-500">Dampak Terapan bagi Pengguna *</Label>
                <textarea
                  value={formData.impact}
                  onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                  placeholder="Dampak nyata: menghemat air 40%, meningkatkan produktivitas panen..."
                  rows={3}
                  required
                  className="w-full text-xs p-2.5 rounded-md bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Dokumen & QR Code (PDF Page 32 Specification) */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 font-semibold uppercase tracking-wider text-[11px] font-mono border-b border-zinc-100 dark:border-zinc-800/80 pb-1">
              <QrCode className="w-3 h-3 text-zinc-400" />
              <span>Tautan Unduh & QR Code (Opsional)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-mono text-zinc-500">URL Dokumen / Brosur PDF</Label>
                <Input
                  value={formData.download_url}
                  onChange={(e) => setFormData({ ...formData, download_url: e.target.value })}
                  placeholder="https://brin.go.id/riset/brosur.pdf"
                  className="text-xs h-9 font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-mono text-zinc-500">Data / URL QR Code</Label>
                <Input
                  value={formData.qr_code_data}
                  onChange={(e) => setFormData({ ...formData, qr_code_data: e.target.value })}
                  placeholder="https://brin.go.id/riset/detail-inovasi"
                  className="text-xs h-9 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="text-xs h-9 px-4"
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="text-xs h-9 px-5 font-medium gap-1.5"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              {innovation ? 'Simpan Perubahan' : 'Tambah Penelitian'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
