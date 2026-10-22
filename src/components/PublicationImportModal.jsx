import { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Download,
  Upload,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertTriangle,
  X,
  FileUp,
  Loader2,
  Info,
  ArrowRight,
  Database,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'
import { downloadPublicationTemplate, importPublications } from '@/lib/api'

export default function PublicationImportModal({ open, onClose, onSuccess }) {
  const [file, setFile] = useState(null)
  const [mode, setMode] = useState('create_or_update')
  const [isImporting, setIsImporting] = useState(false)
  const [downloadingTemplate, setDownloadingTemplate] = useState(null) // 'xlsx' | 'csv' | null
  const [result, setResult] = useState(null)
  const fileInputRef = useRef(null)

  const handleDownloadTemplate = async (format = 'xlsx') => {
    try {
      setDownloadingTemplate(format)
      const blob = await downloadPublicationTemplate(format)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `template_import_publikasi.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success(`Template ${format.toUpperCase()} berhasil diunduh`)
    } catch (err) {
      toast.error(`Gagal mengunduh template: ${err.message}`)
    } finally {
      setDownloadingTemplate(null)
    }
  }

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0]
    if (!selected) return

    const ext = selected.name.toLowerCase()
    if (!ext.endsWith('.xlsx') && !ext.endsWith('.xls') && !ext.endsWith('.csv')) {
      toast.error('Format file tidak didukung. Harap pilih file .xlsx, .xls, atau .csv')
      return
    }

    setFile(selected)
    setResult(null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const dropped = e.dataTransfer.files?.[0]
    if (!dropped) return

    const ext = dropped.name.toLowerCase()
    if (!ext.endsWith('.xlsx') && !ext.endsWith('.xls') && !ext.endsWith('.csv')) {
      toast.error('Format file tidak didukung. Harap pilih file .xlsx, .xls, atau .csv')
      return
    }

    setFile(dropped)
    setResult(null)
  }

  const handleRemoveFile = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmitImport = async () => {
    if (!file) {
      toast.error('Pilih file terlebih dahulu.')
      return
    }

    try {
      setIsImporting(true)
      const res = await importPublications(file, mode)
      setResult(res)
      if (res.success) {
        toast.success(res.message || 'Import data publikasi berhasil!')
        if (onSuccess) onSuccess()
      } else {
        toast.error(res.message || 'Terjadi kesalahan saat import.')
      }
    } catch (err) {
      toast.error(err.message || 'Gagal memproses import data publikasi.')
    } finally {
      setIsImporting(false)
    }
  }

  const handleClose = () => {
    if (isImporting) return
    setFile(null)
    setResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-0 shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <FileUp className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Import Data Publikasi BRIN
              </DialogTitle>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Tambahkan atau perbarui data publikasi secara massal menggunakan file spreadsheet Excel (.xlsx) atau CSV (.csv).
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Step 1: Download Template */}
          <div className="p-4 rounded-lg bg-zinc-50/80 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-[10px]">
                  1
                </span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Unduh Format Template
                </span>
              </div>
              <span className="text-[11px] text-zinc-400 font-mono">13 Kolom Standar</span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-[11px] leading-relaxed">
              Gunakan format template yang sudah disesuaikan dengan struktur kolom: <strong>ID, Judul, Media Publikasi, Cakupan, Tahun, Sumber, Penulis BRIN, Pusat Riset / Satker, Bidang, Provinsi, Wilayah, Catatan data, Dihitung</strong>.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDownloadTemplate('xlsx')}
                disabled={downloadingTemplate !== null}
                className="h-8 text-xs font-medium gap-1.5 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
              >
                {downloadingTemplate === 'xlsx' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                ) : (
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                )}
                <span>Unduh Template (.xlsx)</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDownloadTemplate('csv')}
                disabled={downloadingTemplate !== null}
                className="h-8 text-xs font-medium gap-1.5 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
              >
                {downloadingTemplate === 'csv' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                )}
                <span>Unduh Template (.csv)</span>
              </Button>
            </div>
          </div>

          {/* Step 2: Upload File */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-[10px]">
                2
              </span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                Pilih atau Tarik File Spreadsheet
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
            />

            {!file ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-xl p-8 text-center cursor-pointer transition-colors bg-zinc-50/50 dark:bg-zinc-950/30 group"
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="font-medium text-zinc-800 dark:text-zinc-200 text-xs mb-1">
                  Klik untuk memilih file atau seret file ke sini
                </div>
                <div className="text-[11px] text-zinc-400 font-mono">
                  Mendukung format Microsoft Excel (.xlsx, .xls) atau CSV (.csv)
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0">
                    {file.name.endsWith('.csv') ? (
                      <FileText className="w-5 h-5" />
                    ) : (
                      <FileSpreadsheet className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs truncate">
                      {file.name}
                    </div>
                    <div className="text-[10px] text-zinc-400 font-mono">
                      {(file.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveFile}
                  className="h-7 w-7 text-zinc-400 hover:text-rose-500"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Step 3: Mode Options */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-[10px]">
                3
              </span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                Pilihan Penanganan Data Duplikat
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <label
                onClick={() => setMode('create_or_update')}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                  mode === 'create_or_update'
                    ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs'
                    : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="import_mode"
                    checked={mode === 'create_or_update'}
                    onChange={() => setMode('create_or_update')}
                    className="accent-blue-600"
                  />
                  <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                    Perbarui yang Ada (Upsert)
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 pl-5 leading-normal">
                  Jika ID publikasi atau judul sudah ada, perbarui data. Jika belum ada, buat baru.
                </p>
              </label>

              <label
                onClick={() => setMode('skip_existing')}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                  mode === 'skip_existing'
                    ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs'
                    : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="import_mode"
                    checked={mode === 'skip_existing'}
                    onChange={() => setMode('skip_existing')}
                    className="accent-blue-600"
                  />
                  <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                    Lewati yang Sudah Ada
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 pl-5 leading-normal">
                  Hanya menambahkan baris data publikasi baru. Data yang sudah terdaftar akan diabaikan.
                </p>
              </label>
            </div>
          </div>

          {/* Import Result Banner */}
          {result && (
            <div className={`p-4 rounded-lg border space-y-2.5 ${
              result.success
                ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
                : 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60'
            }`}>
              <div className="flex items-center gap-2 font-semibold">
                {result.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                )}
                <span className={result.success ? 'text-emerald-800 dark:text-emerald-300' : 'text-rose-800 dark:text-rose-300'}>
                  {result.message}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                <span className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
                  Total Baris: <strong>{result.total_rows}</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-semibold">
                  Baru: <strong>{result.imported}</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold">
                  Diperbarui: <strong>{result.updated}</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300">
                  Dilewati: <strong>{result.skipped}</strong>
                </span>
              </div>

              {result.errors && result.errors.length > 0 && (
                <div className="pt-2 border-t border-rose-200 dark:border-rose-900/40 text-[11px] text-rose-700 dark:text-rose-300 space-y-1">
                  <div className="font-semibold">Catatan Peringatan / Error:</div>
                  <ul className="list-disc list-inside space-y-0.5 max-h-24 overflow-y-auto font-mono text-[10px]">
                    {result.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2.5 bg-zinc-50/50 dark:bg-zinc-950/50">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isImporting}
            className="h-8 text-xs"
          >
            {result?.success ? 'Selesai' : 'Batal'}
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSubmitImport}
            disabled={isImporting || !file}
            className="h-8 text-xs font-medium gap-1.5"
          >
            {isImporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Memproses Data...</span>
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                <span>Mulai Import</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
