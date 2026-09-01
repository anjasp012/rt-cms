import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import InnovationFormModal from './InnovationFormModal'
import { 
  Lightbulb, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Award, 
  Sliders, 
  Loader2, 
  Check
} from 'lucide-react'

export default function InnovationsView({
  innovations,
  zones,
  personas,
  loading,
  onSaveInnovation,
  onDeleteInnovation,
  onUpdateRelevance,
  selectedZone,
  onSelectZone
}) {
  const [search, setSearch] = useState('')
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  const [relevanceModalOpen, setRelevanceModalOpen] = useState(false)
  const [selectedInnovationForRel, setSelectedInnovationForRel] = useState(null)
  const [relevanceWeights, setRelevanceWeights] = useState({})
  const [savingRelevance, setSavingRelevance] = useState(false)

  const filtered = useMemo(() => {
    return innovations.filter(item => {
      const matchSearch = 
        item.title?.toLowerCase().includes(search.toLowerCase()) ||
        item.category_tag?.toLowerCase().includes(search.toLowerCase()) ||
        item.short_description?.toLowerCase().includes(search.toLowerCase())
      const matchZone = selectedZone ? item.zone_id === parseInt(selectedZone) : true
      return matchSearch && matchZone
    })
  }, [innovations, search, selectedZone])

  const handleOpenAdd = () => {
    setEditingItem(null)
    setFormModalOpen(true)
  }

  const handleOpenEdit = (item) => {
    setEditingItem(item)
    setFormModalOpen(true)
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

  const handleOpenRelevance = (item) => {
    setSelectedInnovationForRel(item)
    const initWeights = {}
    personas.forEach(p => {
      initWeights[p.id] = 50
    })
    setRelevanceWeights(initWeights)
    setRelevanceModalOpen(true)
  }

  const handleSaveRelevance = async () => {
    if (!selectedInnovationForRel) return
    setSavingRelevance(true)
    try {
      const mappings = Object.entries(relevanceWeights).map(([pId, score]) => ({
        persona_id: parseInt(pId),
        relevance_score: parseInt(score),
      }))
      await onUpdateRelevance(selectedInnovationForRel.id, mappings)
      setRelevanceModalOpen(false)
    } finally {
      setSavingRelevance(false)
    }
  }

  return (
    <div className="space-y-3.5 animate-fade-in">
      {/* Top Filter and Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input
              type="text"
              placeholder="Cari inovasi, topik..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-xs"
            />
          </div>

          <select
            value={selectedZone || ''}
            onChange={(e) => onSelectZone(e.target.value ? parseInt(e.target.value) : null)}
            className="h-9 px-3 text-xs rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 text-zinc-900 dark:text-zinc-100 focus:outline-none"
          >
            <option value="">Semua 9 Zona Riset</option>
            {zones.map(z => (
              <option key={z.id} value={z.id}>
                Zona {z.zone_number}: {z.name}
              </option>
            ))}
          </select>
        </div>

        <Button
          size="sm"
          onClick={handleOpenAdd}
          className="h-9 text-xs font-medium gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Tambah Inovasi
        </Button>
      </div>

      {/* Main Table Card */}
      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-mono">
              <tr>
                <th className="p-3 w-10 text-center">#</th>
                <th className="p-3 text-left">Judul Inovasi & Kategori</th>
                <th className="p-3 w-36 text-left">Zona Riset</th>
                <th className="p-3 w-28 text-center">TRL Level</th>
                <th className="p-3 text-left">Dampak Terapan</th>
                <th className="p-3 w-24 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-zinc-500 font-mono">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-zinc-400" />
                    <span>Memuat katalog inovasi...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-zinc-500 font-mono">
                    <Lightbulb className="w-7 h-7 mx-auto mb-2 text-zinc-400 opacity-50" />
                    <span>Inovasi tidak ditemukan</span>
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="p-3 text-center font-mono text-zinc-400 text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                        {item.title}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-mono text-zinc-500">
                          [{item.category_tag}]
                        </span>
                        <span className="text-[11px] font-mono text-zinc-400">
                          /{item.slug}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="font-mono text-zinc-700 dark:text-zinc-300">
                        {item.zone?.name || `Zona ${item.zone_id}`}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant="approved">
                        TRL {item.trl}/9
                      </Badge>
                    </td>
                    <td className="p-3">
                      <p className="text-zinc-600 dark:text-zinc-300 line-clamp-2 text-xs">
                        {item.impact || item.short_description}
                      </p>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenRelevance(item)}
                          className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                          title="Bobot Persona"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(item)}
                          className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-zinc-400 hover:text-rose-500"
                          title="Hapus"
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

      {/* Innovation Form Modal */}
      <InnovationFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        innovation={editingItem}
        zones={zones}
        onSave={(data) => {
          if (editingItem) {
            return onSaveInnovation(editingItem.id, data)
          } else {
            return onSaveInnovation(null, data)
          }
        }}
      />

      {/* Persona Relevance Weight Modal */}
      {relevanceModalOpen && selectedInnovationForRel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                  Bobot Prioritas Persona
                </h3>
                <span className="text-xs text-zinc-400 font-mono truncate max-w-[260px] block">
                  {selectedInnovationForRel.title}
                </span>
              </div>
              <button 
                onClick={() => setRelevanceModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-200 text-sm font-semibold"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-zinc-500">
              Atur skor prioritas (1–100) per kelompok pengguna meja sentuh.
            </p>

            <div className="space-y-2 pt-1">
              {personas.map(p => (
                <div key={p.id} className="p-2.5 rounded-md bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-800 dark:text-zinc-200">{p.name}</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{relevanceWeights[p.id] || 50} pts</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={relevanceWeights[p.id] || 50}
                    onChange={(e) => setRelevanceWeights({
                      ...relevanceWeights,
                      [p.id]: parseInt(e.target.value)
                    })}
                    className="w-full accent-zinc-900 dark:accent-zinc-100 cursor-pointer h-1 bg-zinc-200 dark:bg-zinc-800 rounded"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRelevanceModalOpen(false)}
                disabled={savingRelevance}
                className="text-xs h-8"
              >
                Batal
              </Button>
              <Button
                size="sm"
                onClick={handleSaveRelevance}
                disabled={savingRelevance}
                className="text-xs h-8"
              >
                {savingRelevance ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Check className="w-3.5 h-3.5 mr-1" />}
                Simpan
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Inovasi</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus inovasi "{itemToDelete?.title}"?
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
