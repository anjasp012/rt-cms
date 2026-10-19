import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Loader2,
  Check,
  ArrowLeft,
  Image as ImageIcon,
  Upload,
  X,
  Sparkles,
  HelpCircle,
  BookOpen,
  FileCheck2,
  Layers,
  Users,
  Compass,
  CheckSquare,
  Square
} from 'lucide-react'
import { uploadFile } from '@/lib/api'
import { getImageUrl } from '@/lib/utils'
import { toast } from 'sonner'
import IconPicker from '@/components/ui/IconPicker'

export default function InnovationFormView({ innovation, zones, personas, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    zone_id: '',
    relevant_zone_ids: [],
    persona_ids: [],
    question: '',
    card_icon: '',
    introduction: '',
    aspect: '',
    aspect_icon: '',
    summary: '',
    publication_id: '',
    title: '',
    slug: '',
    year: new Date().getFullYear(),
    writer: '',
    publication_media: '',
    research_center: '',
    journal_publication: '',
    doi: '',
    abstract_url: '',
    access_type: 'Open access (CC BY-SA 4.0)',
    author_proof: '',
    verification_notes: '',
    fun_fact: '',
    fun_fact_source: '',
    fun_fact_url: '',
    thumbnail_url: '',
    is_active: true
  })

  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    if (innovation) {
      setFormData({
        zone_id: innovation.zone_id || (zones[0]?.id || ''),
        relevant_zone_ids: innovation.relevant_zones?.map(z => z.id) || innovation.relevant_zone_ids || [],
        persona_ids: innovation.personas?.map(p => p.id) || innovation.persona_ids || (innovation.persona_id ? [innovation.persona_id] : []),
        question: innovation.question || '',
        card_icon: innovation.card_icon || '',
        introduction: innovation.introduction || '',
        aspect: innovation.aspect || '',
        aspect_icon: innovation.aspect_icon || '',
        summary: innovation.summary || '',
        publication_id: innovation.publication_id || '',
        title: innovation.title || '',
        slug: innovation.slug || '',
        year: innovation.year || 2025,
        writer: innovation.writer || innovation.author || '',
        publication_media: innovation.publication_media || innovation.journal_publication || '',
        research_center: innovation.research_center || innovation.satker || '',
        journal_publication: innovation.journal_publication || innovation.publication_media || '',
        doi: innovation.doi || '',
        abstract_url: innovation.abstract_url || '',
        access_type: innovation.access_type || 'Open access (CC BY-SA 4.0)',
        author_proof: innovation.author_proof || '',
        verification_notes: innovation.verification_notes || '',
        fun_fact: innovation.fun_fact || '',
        fun_fact_source: innovation.fun_fact_source || '',
        fun_fact_url: innovation.fun_fact_url || '',
        thumbnail_url: innovation.thumbnail_url || '',
        is_active: innovation.is_active ?? true
      })
    } else {
      setFormData({
        card_no: 1,
        zone_id: zones[0]?.id || '',
        relevant_zone_ids: zones[0]?.id ? [zones[0].id] : [],
        persona_ids: personas?.slice(0, 3).map(p => p.id) || [],
        question: '',
        card_icon: '',
        introduction: '',
        aspect: '',
        aspect_icon: '',
        summary: '',
        publication_id: '',
        title: '',
        slug: '',
        year: 2025,
        research_center: '',
        journal_publication: '',
        doi: '',
        abstract_url: '',
        access_type: 'Open access (CC BY-SA 4.0)',
        author_proof: '',
        verification_notes: '',
        fun_fact: '',
        fun_fact_source: '',
        fun_fact_url: '',
        thumbnail_url: '',
        is_active: true
      })
    }
  }, [innovation, zones, personas])

  const handleTitleChange = (val) => {
    const autoSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 100)
    setFormData(prev => ({
      ...prev,
      title: val,
      slug: !innovation ? autoSlug : prev.slug
    }))
  }

  const toggleRelevantZone = (zoneId) => {
    setFormData(prev => {
      const exists = prev.relevant_zone_ids.includes(zoneId)
      return {
        ...prev,
        relevant_zone_ids: exists
          ? prev.relevant_zone_ids.filter(id => id !== zoneId)
          : [...prev.relevant_zone_ids, zoneId]
      }
    })
  }

  const togglePersona = (personaId) => {
    setFormData(prev => {
      const exists = prev.persona_ids.includes(personaId)
      return {
        ...prev,
        persona_ids: exists
          ? prev.persona_ids.filter(id => id !== personaId)
          : [...prev.persona_ids, personaId]
      }
    })
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const res = await uploadFile(file)
      setFormData(prev => ({ ...prev, thumbnail_url: res.relative_url || res.url }))
      toast.success('Gambar berhasil diunggah')
    } catch (err) {
      toast.error(err.message || 'Gagal mengunggah gambar')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.slug.trim()) {
      toast.error('Judul asli dan slug wajib diisi')
      return
    }
    if (!formData.zone_id) {
      toast.error('Bidang utama wajib dipilih')
      return
    }

    setLoading(true)
    try {
      await onSave({
        ...formData,
        card_no: innovation?.card_no || null,
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        year: formData.year ? parseInt(formData.year) : null,
        publication_id: formData.publication_id.trim() || null,
        question: formData.question.trim() || null,
        card_icon: formData.card_icon.trim() || null,
        introduction: formData.introduction.trim() || null,
        aspect: formData.aspect.trim() || null,
        aspect_icon: formData.aspect_icon.trim() || null,
        summary: formData.summary.trim() || null,
        writer: formData.writer ? formData.writer.trim() : null,
        publication_media: formData.publication_media ? formData.publication_media.trim() : null,
        research_center: formData.research_center ? formData.research_center.trim() : null,
        journal_publication: formData.journal_publication ? formData.journal_publication.trim() : (formData.publication_media ? formData.publication_media.trim() : null),
        doi: formData.doi.trim() || null,
        abstract_url: formData.abstract_url.trim() || null,
        access_type: formData.access_type.trim() || null,
        author_proof: formData.author_proof.trim() || null,
        verification_notes: formData.verification_notes.trim() || null,
        fun_fact: formData.fun_fact.trim() || null,
        fun_fact_source: formData.fun_fact_source.trim() || null,
        fun_fact_url: formData.fun_fact_url.trim() || null,
        thumbnail_url: formData.thumbnail_url.trim() || null,
        short_description: formData.summary.trim() || formData.aspect.trim() || null,
        impact: formData.summary.trim() || null
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={onCancel} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              {innovation ? `Edit Solusi (${innovation.publication_id || 'Tanpa ID'})` : 'Tambah Solusi Riset Baru'}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Formulir lengkap katalog meja interaktif BRIN dengan relasi Tantangan dan Peran.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* BAGIAN 1: Topik & Pertanyaan Meja Interaktif */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-semibold uppercase tracking-wider text-xs font-mono border-b border-zinc-100 dark:border-zinc-800/80 pb-2">
            <HelpCircle className="w-4 h-4 text-amber-500" />
            <span>1. Topik & Pertanyaan Meja Interaktif</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-mono text-zinc-500">Pertanyaan Meja Interaktif</Label>
              <Input
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="Contoh: Bagaimana membuat sapi lokal lebih produktif?"
                className="h-10"
              />
            </div>

            <div className="sm:col-span-1">
              <IconPicker
                label="Ikon Kartu / Topik"
                value={formData.card_icon}
                onChange={(val) => setFormData({ ...formData, card_icon: val })}
                placeholder="Pilih ikon (cow, fish...)"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-mono text-zinc-500">Pengantar Topik</Label>
            <textarea
              value={formData.introduction}
              onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
              placeholder="Contoh: Beberapa contoh riset BRIN tentang sapi potong lokal, antara lain cara menilai kondisi dan bobot tubuhnya dengan teknologi."
              rows={2}
              className="w-full text-xs p-2.5 rounded-md bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 resize-none leading-relaxed"
            />
          </div>
        </Card>

        {/* BAGIAN 2: Aspek Penelitian & Ringkasan Abstrak */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-semibold uppercase tracking-wider text-xs font-mono border-b border-zinc-100 dark:border-zinc-800/80 pb-2">
            <BookOpen className="w-4 h-4 text-blue-500" />
            <span>2. Aspek Penelitian & Ringkasan Abstrak</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-mono text-zinc-500">Nama Aspek</Label>
              <Input
                value={formData.aspect}
                onChange={(e) => setFormData({ ...formData, aspect: e.target.value })}
                placeholder="Contoh: Kecerdasan buatan / Bobot badan / Limbah tambak"
                className="h-10"
              />
            </div>

            <div>
              <IconPicker
                label="Ikon Aspek Riset"
                value={formData.aspect_icon}
                onChange={(val) => setFormData({ ...formData, aspect_icon: val })}
                placeholder="Pilih ikon (robot-outline, scale-balance...)"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-mono text-zinc-500">Ringkasan (disusun dari abstrak) *</Label>
            <textarea
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              placeholder="Contoh: Menguji model AI YOLOv10 untuk menilai skor kondisi tubuh sapi potong dari foto secara otomatis, menggantikan penilaian manual yang subjektif..."
              rows={4}
              required
              className="w-full text-xs p-3 rounded-md bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 resize-none leading-relaxed"
            />
          </div>
        </Card>

        {/* BAGIAN 3: Relasi Klasifikasi: Tantangan & Peran (RELASI DATABASE) */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-semibold uppercase tracking-wider text-xs font-mono border-b border-zinc-100 dark:border-zinc-800/80 pb-2">
            <Layers className="w-4 h-4 text-purple-500" />
            <span>3. Relasi Klasifikasi: Tantangan & Peran</span>
          </div>

          {/* 3a. Tantangan Utama */}
          <div className="space-y-1.5">
            <Label className="text-xs font-mono text-zinc-500">Tantangan Utama *</Label>
            <div className="relative w-full max-w-xl">
              <select
                value={formData.zone_id}
                onChange={(e) => setFormData({ ...formData, zone_id: e.target.value })}
                required
                className="w-full h-9 pl-3 pr-8 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 appearance-none font-medium"
              >
                <option value="" disabled>Pilih Tantangan Utama...</option>
                {zones.map(z => (
                  <option key={z.id} value={z.id}>
                    {z.name} {z.color ? `(${z.color})` : ''}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">▾</span>
            </div>
          </div>

          {/* 3b. Tantangan Relevan (M2M) */}
          <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-mono text-zinc-500 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-zinc-400" />
                <span>Tantangan Relevan (Relasi Multi-Tantangan)</span>
              </Label>
              <span className="text-[11px] text-zinc-400 font-mono">
                {formData.relevant_zone_ids.length} terpilih
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Pilih satu atau lebih tantangan riset yang relevan dengan topik solusi ini:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {zones.map(z => {
                const isSelected = formData.relevant_zone_ids.includes(z.id)
                return (
                  <button
                    key={z.id}
                    type="button"
                    onClick={() => toggleRelevantZone(z.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                      isSelected
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-xs'
                        : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-zinc-400" />
                    )}
                    <span>{z.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 3c. Kategori Peran (M2M) */}
          <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-mono text-zinc-500 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-zinc-400" />
                <span>Kategori Peran (Relasi Multi-Peran)</span>
              </Label>
              <span className="text-[11px] text-zinc-400 font-mono">
                {formData.persona_ids.length} terpilih
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Pilih kelompok peran sasaran solusi ini (e.g. Petani, Pelaku Industri, Peneliti/Akademisi):
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {personas.map(p => {
                const isSelected = formData.persona_ids.includes(p.id)
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePersona(p.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                      isSelected
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-zinc-400" />
                    )}
                    <span>{p.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </Card>

        {/* BAGIAN 4: Metadata Karya Ilmiah & Verifikasi BRIN */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-semibold uppercase tracking-wider text-xs font-mono border-b border-zinc-100 dark:border-zinc-800/80 pb-2">
            <FileCheck2 className="w-4 h-4 text-emerald-500" />
            <span>4. Metadata Karya Ilmiah & Bukti Periset BRIN</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-1.5 sm:col-span-1">
              <Label className="text-xs font-mono text-zinc-500">ID Publikasi</Label>
              <Input
                value={formData.publication_id}
                onChange={(e) => setFormData({ ...formData, publication_id: e.target.value })}
                placeholder="P10212"
                className="h-9 font-mono"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-1">
              <Label className="text-xs font-mono text-zinc-500">Tahun Publikasi</Label>
              <Input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                placeholder="2025"
                className="h-9 font-mono"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-mono text-zinc-500">Akses Terbitan</Label>
              <Input
                value={formData.access_type}
                onChange={(e) => setFormData({ ...formData, access_type: e.target.value })}
                placeholder="Open access (CC BY-SA 4.0)"
                className="h-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-mono text-zinc-500">Judul Asli Karya Ilmiah *</Label>
              <textarea
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Comparative Performance Analysis of YOLOv10-Based Models..."
                required
                rows={2}
                className="w-full text-xs p-2.5 rounded-md bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 resize-none font-medium leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-mono text-zinc-500">Slug Identifier *</Label>
              <textarea
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="comparative-performance-analysis-yolov10"
                required
                rows={2}
                className="w-full text-xs p-2.5 rounded-md bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 resize-none font-mono leading-relaxed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-mono text-zinc-500">Penulis / Writer</Label>
              <Input
                value={formData.writer}
                onChange={(e) => setFormData({ ...formData, writer: e.target.value })}
                placeholder="Contoh: Bayu Andri Atmoko, Dr. Budi Santoso..."
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-mono text-zinc-500">Media Publikasi / Publication Media</Label>
              <Input
                value={formData.publication_media}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  publication_media: e.target.value,
                  journal_publication: e.target.value 
                })}
                placeholder="Contoh: Tropical Animal Science Journal"
                className="h-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-mono text-zinc-500">Pusat Riset / Satker (Research Center)</Label>
              <Input
                value={formData.research_center}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  research_center: e.target.value 
                })}
                placeholder="Contoh: Pusat Riset Peternakan..."
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-mono text-zinc-500">DOI</Label>
              <Input
                value={formData.doi}
                onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
                placeholder="10.5398/tasj.2025.48.5.402"
                className="h-9 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-mono text-zinc-500">Halaman Abstrak yang Dibaca (Tautan URL)</Label>
            <Input
              value={formData.abstract_url}
              onChange={(e) => setFormData({ ...formData, abstract_url: e.target.value })}
              placeholder="https://journal.ipb.ac.id/tasj/article/view/63469 atau https://karya.brin.go.id/..."
              className="h-9 font-mono text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-mono text-zinc-500">Bukti Karya Periset BRIN</Label>
              <textarea
                value={formData.author_proof}
                onChange={(e) => setFormData({ ...formData, author_proof: e.target.value })}
                placeholder="Contoh: Nama periset BRIN ada di daftar penulis: Bayu Andri Atmoko (afiliasi BRIN tercantum)"
                rows={3}
                className="w-full text-xs p-2.5 rounded-md bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 resize-none leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-mono text-zinc-500">Catatan Verifikasi</Label>
              <textarea
                value={formData.verification_notes}
                onChange={(e) => setFormData({ ...formData, verification_notes: e.target.value })}
                placeholder="Catatan tim verifikator publikasi..."
                rows={3}
                className="w-full text-xs p-2.5 rounded-md bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 resize-none leading-relaxed"
              />
            </div>
          </div>
        </Card>

        {/* BAGIAN 5: Tahukah Kamu? (Fun Fact Populer) */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-semibold uppercase tracking-wider text-xs font-mono border-b border-zinc-100 dark:border-zinc-800/80 pb-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>5. Tahukah Kamu? (Fakta Menarik Edukatif)</span>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-mono text-zinc-500">Fakta "Tahukah Kamu?"</Label>
            <textarea
              value={formData.fun_fact}
              onChange={(e) => setFormData({ ...formData, fun_fact: e.target.value })}
              placeholder="Contoh: Metana dari sapi terbentuk saat mikroba di rumen memfermentasi pakan, lalu dikeluarkan lewat sendawa..."
              rows={2}
              className="w-full text-xs p-2.5 rounded-md bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 resize-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-mono text-zinc-500">Sumber "Tahukah Kamu?"</Label>
              <Input
                value={formData.fun_fact_source}
                onChange={(e) => setFormData({ ...formData, fun_fact_source: e.target.value })}
                placeholder="Contoh: FAO, Livestock and enteric methane"
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-mono text-zinc-500">Tautan Sumber Fakta (URL)</Label>
              <Input
                value={formData.fun_fact_url}
                onChange={(e) => setFormData({ ...formData, fun_fact_url: e.target.value })}
                placeholder="https://www.fao.org/in-action/enteric-methane/en"
                className="h-9 font-mono text-xs"
              />
            </div>
          </div>
        </Card>

        {/* BAGIAN 6: Visual & Status */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-semibold uppercase tracking-wider text-xs font-mono border-b border-zinc-100 dark:border-zinc-800/80 pb-2">
            <ImageIcon className="w-4 h-4 text-zinc-400" />
            <span>6. Thumbnail Visual & Status</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            <div className="space-y-2">
              <Label className="text-xs font-mono text-zinc-500">Thumbnail Gambar (Opsional)</Label>
              {formData.thumbnail_url ? (
                <div className="relative group w-full max-w-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-2 shadow-sm">
                  <div className="relative aspect-video w-full rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                    <img
                      src={getImageUrl(formData.thumbnail_url)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, thumbnail_url: '' }))}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-zinc-900/80 hover:bg-rose-600 text-white shadow transition-colors"
                      title="Hapus gambar"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-sm rounded-lg border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 p-4 text-center flex flex-col items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-zinc-400 mb-1" />
                  <p className="text-xs text-zinc-400 font-medium">Belum ada thumbnail</p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Input
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  placeholder="URL gambar atau upload..."
                  className="h-9 font-mono text-xs flex-1"
                />
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploadingImage}
                  />
                  <Button type="button" variant="secondary" className="h-9 text-xs gap-1.5" disabled={uploadingImage}>
                    {uploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    Upload
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800">
                <div>
                  <span className="text-xs text-zinc-800 dark:text-zinc-200 font-semibold block">Status Aktif di Meja</span>
                  <span className="text-[11px] text-zinc-400">Tampilkan solusi ini pada layar meja interaktif</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded accent-zinc-900 dark:accent-zinc-100 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-end gap-3 sticky bottom-4 z-20 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-lg">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="h-10 px-5 text-xs"
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="h-10 px-6 font-medium gap-2 text-xs"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {innovation ? 'Simpan Perubahan Solusi' : 'Tambah Solusi ke Katalog'}
          </Button>
        </div>
      </form>
    </div>
  )
}
