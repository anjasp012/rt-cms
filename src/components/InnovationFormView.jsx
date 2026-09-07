import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Award, 
  Loader2, 
  Check, 
  FileText, 
  Sparkles,
  ArrowLeft,
  Image as ImageIcon
} from 'lucide-react'

export default function InnovationFormView({ innovation, zones, personas, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category_tag: '',
    zone_id: 1,
    persona_id: 1,
    trl: 7,
    short_description: '',
    summary: '',
    impact: '',
    thumbnail_url: '',
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
        persona_id: innovation.persona_id || (personas && personas[0]?.id) || '',
        trl: innovation.trl || 7,
        short_description: innovation.short_description || '',
        summary: innovation.summary || '',
        impact: innovation.impact || '',
        thumbnail_url: innovation.thumbnail_url || '',
        order_priority: innovation.order_priority || 90,
      })
    } else {
      setFormData({
        title: '',
        slug: '',
        category_tag: '',
        zone_id: zones[0]?.id || 1,
        persona_id: (personas && personas[0]?.id) || '',
        trl: 7,
        short_description: '',
        summary: '',
        impact: '',
        thumbnail_url: '',
        order_priority: 90,
      })
    }
  }, [innovation, zones])

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
        thumbnail_url: formData.thumbnail_url.trim() || null,
        download_url: null,
        qr_code_data: null,
        zone_id: parseInt(formData.zone_id),
        persona_id: formData.persona_id ? parseInt(formData.persona_id) : null,
        trl: parseInt(formData.trl),
        order_priority: parseInt(formData.order_priority) || 0,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={onCancel} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              {innovation ? 'Edit Data Penelitian BRIN' : 'Tambah Penelitian Baru'}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Katalog inovasi hasil riset yang akan ditampilkan pada layar meja interaktif.
            </p>
          </div>
        </div>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Section 1: Informasi Utama */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-semibold uppercase tracking-wider text-xs font-mono border-b border-zinc-100 dark:border-zinc-800/80 pb-2">
              <Sparkles className="w-4 h-4 text-zinc-400" />
              <span>Informasi Utama</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-mono text-zinc-500">Judul Penelitian / Inovasi *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Contoh: Sistem Irigasi Pintar IoT"
                  required
                  className="h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-mono text-zinc-500">Slug Identifier *</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="sistem-irigasi-pintar-iot"
                  required
                  className="h-10 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5 sm:col-span-1">
                <Label className="text-sm font-mono text-zinc-500">Kategori / Tag *</Label>
                <Input
                  value={formData.category_tag}
                  onChange={(e) => setFormData({ ...formData, category_tag: e.target.value })}
                  placeholder="Pertanian Presisi"
                  required
                  className="h-10"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-1">
                <Label className="text-sm font-mono text-zinc-500">Zona Riset BRIN *</Label>
                <select
                  value={formData.zone_id}
                  onChange={(e) => setFormData({ ...formData, zone_id: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                >
                  {zones.map(z => (
                    <option key={z.id} value={z.id}>
                      Zona {z.zone_number}: {z.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 sm:col-span-1">
                <Label className="text-sm font-mono text-zinc-500">Modul Pengguna (Persona) *</Label>
                <select
                  value={formData.persona_id}
                  onChange={(e) => setFormData({ ...formData, persona_id: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  required
                >
                  <option value="" disabled>Pilih Modul Pengguna...</option>
                  {personas?.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 sm:col-span-1">
                <Label className="text-sm font-mono text-zinc-500">Prioritas Urutan</Label>
                <Input
                  type="number"
                  value={formData.order_priority}
                  onChange={(e) => setFormData({ ...formData, order_priority: e.target.value })}
                  placeholder="90"
                  className="h-10 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: TRL Meter Indicator */}
          <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between font-mono">
              <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-semibold">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Tingkat Kesiapan Teknologi (TRL)</span>
              </div>
              <Badge variant="approved" className="font-mono px-3 py-1">
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

            <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
              <span>TRL 1 (Riset Awal)</span>
              <span className="text-zinc-600 dark:text-zinc-300 font-sans italic text-center">
                {getTrlDescription(formData.trl)}
              </span>
              <span>TRL 9 (Komersial)</span>
            </div>
          </div>

          {/* Section 3: Gambar */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-semibold uppercase tracking-wider text-xs font-mono border-b border-zinc-100 dark:border-zinc-800/80 pb-2">
              <ImageIcon className="w-4 h-4 text-zinc-400" />
              <span>Gambar Visual Penelitian</span>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-mono text-zinc-500">URL Gambar / Thumbnail (Opsional)</Label>
              <Input
                value={formData.thumbnail_url}
                onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="h-10 font-mono"
              />
              <p className="text-xs text-zinc-500 mt-1">Masukkan URL gambar yang mewakili penelitian ini. Akan digunakan di layar interaktif.</p>
            </div>
          </div>

          {/* Section 4: Ringkasan & Dampak */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-semibold uppercase tracking-wider text-xs font-mono border-b border-zinc-100 dark:border-zinc-800/80 pb-2">
              <FileText className="w-4 h-4 text-zinc-400" />
              <span>Deskripsi & Dampak Terapan</span>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-mono text-zinc-500">Deskripsi Singkat (Layar Kartu) *</Label>
              <Input
                value={formData.short_description}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                placeholder="Monitoring dan kendali irigasi otomatis untuk efisiensi air lahan pertanian..."
                required
                className="h-10"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-mono text-zinc-500">Ringkasan Lengkap (Apa Inovasi Ini?) *</Label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Penjelasan mendalam mengenai mekanisme teknologi riset..."
                  rows={4}
                  required
                  className="w-full text-sm p-3 rounded-md bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-mono text-zinc-500">Dampak Terapan bagi Pengguna *</Label>
                <textarea
                  value={formData.impact}
                  onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                  placeholder="Dampak nyata: menghemat air 40%, meningkatkan produktivitas panen..."
                  rows={4}
                  required
                  className="w-full text-sm p-3 rounded-md bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="h-10 px-4"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="h-10 px-6 font-medium gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {innovation ? 'Simpan Perubahan' : 'Tambah Penelitian'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
