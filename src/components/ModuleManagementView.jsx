import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  Users, 
  Compass, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  Loader2, 
  Layers,
  Palette,
  Sparkles
} from 'lucide-react'

export default function ModuleManagementView({
  personas,
  zones,
  onCreatePersona,
  onUpdatePersona,
  onDeletePersona,
  onCreateZone,
  onUpdateZone,
  onDeleteZone,
  loading
}) {
  const [activeTab, setActiveTab] = useState('personas') // 'personas' | 'zones'
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [saving, setSaving] = useState(false)

  // Form states
  const [personaForm, setPersonaForm] = useState({
    name: '',
    slug: '',
    tagline: '',
    order_index: 1,
    is_active: true
  })

  const [zoneForm, setZoneForm] = useState({
    name: '',
    slug: '',
    zone_number: 1,
    description: '',
    color_theme: '#3b82f6',
    is_active: true
  })

  const handleOpenAdd = () => {
    setEditingItem(null)
    if (activeTab === 'personas') {
      setPersonaForm({
        name: '',
        slug: '',
        tagline: '',
        order_index: personas.length + 1,
        is_active: true
      })
    } else {
      setZoneForm({
        name: '',
        slug: '',
        zone_number: zones.length + 1,
        description: '',
        color_theme: '#3b82f6',
        is_active: true
      })
    }
    setModalOpen(true)
  }

  const handleOpenEdit = (item) => {
    setEditingItem(item)
    if (activeTab === 'personas') {
      setPersonaForm({
        name: item.name || '',
        slug: item.slug || '',
        tagline: item.tagline || '',
        order_index: item.order_index || 1,
        is_active: item.is_active ?? true
      })
    } else {
      setZoneForm({
        name: item.name || '',
        slug: item.slug || '',
        zone_number: item.zone_number || 1,
        description: item.description || '',
        color_theme: item.color_theme || '#3b82f6',
        is_active: item.is_active ?? true
      })
    }
    setModalOpen(true)
  }

  const handleOpenDelete = (item) => {
    setItemToDelete(item)
    setDeleteConfirmOpen(true)
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (activeTab === 'personas') {
        if (editingItem) {
          await onUpdatePersona(editingItem.id, personaForm)
        } else {
          await onCreatePersona(personaForm)
        }
      } else {
        if (editingItem) {
          await onUpdateZone(editingItem.id, zoneForm)
        } else {
          await onCreateZone(zoneForm)
        }
      }
      setModalOpen(false)
    } finally {
      setSaving(false)
    }
  }

  const handleExecuteDelete = async () => {
    if (!itemToDelete) return
    if (activeTab === 'personas') {
      await onDeletePersona(itemToDelete.id)
    } else {
      await onDeleteZone(itemToDelete.id)
    }
    setDeleteConfirmOpen(false)
    setItemToDelete(null)
  }

  const autoSlug = (val) => {
    return val.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Kelola Modul Meja Interaktif
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Tambah, ubah nama, deskripsi, urutan, atau hapus Modul Pengguna dan Token Tantangan.
          </p>
        </div>

        <Button
          size="sm"
          onClick={handleOpenAdd}
          className="h-9 text-xs font-medium gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          {activeTab === 'personas' ? 'Tambah Modul Pengguna' : 'Tambah Token Tantangan'}
        </Button>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <Button
          size="sm"
          variant={activeTab === 'personas' ? 'default' : 'outline'}
          onClick={() => setActiveTab('personas')}
          className="text-xs h-8"
        >
          <Users className="w-3.5 h-3.5 mr-1.5" />
          Modul Pengguna &bull; {personas.length} Modul
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'zones' ? 'default' : 'outline'}
          onClick={() => setActiveTab('zones')}
          className="text-xs h-8"
        >
          <Compass className="w-3.5 h-3.5 mr-1.5" />
          Token Tantangan &bull; {zones.length} Zona
        </Button>
      </div>

      {/* Tab 1: Modul Pengguna (Persona) */}
      {activeTab === 'personas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {personas.map((p) => (
            <Card
              key={p.id}
              className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm"
            >
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-mono text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      #{p.order_index}
                    </span>
                    <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                      {p.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                      title="Edit Modul"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenDelete(p)}
                      className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-zinc-400 hover:text-rose-500"
                      title="Hapus Modul"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed min-h-[48px]">
                  {p.tagline || 'Tidak ada deskripsi modul'}
                </p>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <span>/{p.slug}</span>
                  <Badge variant={p.is_active ? 'approved' : 'rejected'}>
                    {p.is_active ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tab 2: Token Tantangan (Zona) */}
      {activeTab === 'zones' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {zones.map((z) => (
            <Card
              key={z.id}
              className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm"
            >
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-6 h-6 rounded flex items-center justify-center font-mono text-xs font-bold text-white shadow-sm"
                      style={{ backgroundColor: z.color_theme || '#3b82f6' }}
                    >
                      {z.zone_number}
                    </span>
                    <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                      Zona {z.zone_number}: {z.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(z)}
                      className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                      title="Edit Zona"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenDelete(z)}
                      className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-zinc-400 hover:text-rose-500"
                      title="Hapus Zona"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed min-h-[48px]">
                  {z.description || 'Tidak ada deskripsi zona'}
                </p>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: z.color_theme || '#3b82f6' }} />
                    <span>/{z.slug}</span>
                  </div>
                  <Badge variant={z.is_active ? 'approved' : 'rejected'}>
                    {z.is_active ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Form Tambah / Edit */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl p-0">
          {/* Header */}
          <div className="p-6 pb-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-zinc-100 dark:text-zinc-900 shadow-sm">
                {activeTab === 'personas' ? <Users className="w-4 h-4" /> : <Compass className="w-4 h-4" />}
              </div>
              <div>
                <DialogTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {editingItem
                    ? `Edit ${activeTab === 'personas' ? 'Modul Pengguna' : 'Token Tantangan'}`
                    : `Tambah ${activeTab === 'personas' ? 'Modul Pengguna Baru' : 'Token Tantangan Baru'}`}
                </DialogTitle>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {activeTab === 'personas' 
                    ? 'Profil kelompok pengguna pengunjung meja interaktif.'
                    : 'Zona fokus riset BRIN yang dapat dieksplorasi.'}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
            {activeTab === 'personas' ? (
              <>
                <div className="space-y-1">
                  <Label className="text-xs font-mono text-zinc-500">Nama Modul Pengguna (Persona) *</Label>
                  <Input
                    value={personaForm.name}
                    onChange={(e) => setPersonaForm({
                      ...personaForm,
                      name: e.target.value,
                      slug: !editingItem ? autoSlug(e.target.value) : personaForm.slug
                    })}
                    placeholder="Contoh: Petani / Nelayan / Siswa"
                    required
                    className="h-9 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-mono text-zinc-500">Slug Identifier *</Label>
                    <Input
                      value={personaForm.slug}
                      onChange={(e) => setPersonaForm({ ...personaForm, slug: e.target.value })}
                      placeholder="petani"
                      required
                      className="h-9 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-mono text-zinc-500">Nomor Urut</Label>
                    <Input
                      type="number"
                      min="1"
                      value={personaForm.order_index}
                      onChange={(e) => setPersonaForm({ ...personaForm, order_index: parseInt(e.target.value) || 1 })}
                      className="h-9 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-mono text-zinc-500">Tagline / Deskripsi Profil</Label>
                  <textarea
                    value={personaForm.tagline}
                    onChange={(e) => setPersonaForm({ ...personaForm, tagline: e.target.value })}
                    placeholder="Deskripsi singkat persona dan kebutuhan riset mereka..."
                    rows={3}
                    className="w-full text-xs p-2.5 rounded-md bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 resize-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-md bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">Status Modul Aktif</span>
                  <input
                    type="checkbox"
                    checked={personaForm.is_active}
                    onChange={(e) => setPersonaForm({ ...personaForm, is_active: e.target.checked })}
                    className="w-4 h-4 rounded accent-zinc-900 dark:accent-zinc-100 cursor-pointer"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1">
                  <Label className="text-xs font-mono text-zinc-500">Nama Zona Riset *</Label>
                  <Input
                    value={zoneForm.name}
                    onChange={(e) => setZoneForm({
                      ...zoneForm,
                      name: e.target.value,
                      slug: !editingItem ? autoSlug(e.target.value) : zoneForm.slug
                    })}
                    placeholder="Contoh: Energi / Pangan / Digital"
                    required
                    className="h-9 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-mono text-zinc-500">Slug Identifier *</Label>
                    <Input
                      value={zoneForm.slug}
                      onChange={(e) => setZoneForm({ ...zoneForm, slug: e.target.value })}
                      placeholder="energi"
                      required
                      className="h-9 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-mono text-zinc-500">Nomor Zona (1-9)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="9"
                      value={zoneForm.zone_number}
                      onChange={(e) => setZoneForm({ ...zoneForm, zone_number: parseInt(e.target.value) || 1 })}
                      className="h-9 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-mono text-zinc-500">Deskripsi Tantangan Riset</Label>
                  <textarea
                    value={zoneForm.description}
                    onChange={(e) => setZoneForm({ ...zoneForm, description: e.target.value })}
                    placeholder="Penjelasan fokus dan target riset BRIN pada bidang ini..."
                    rows={3}
                    className="w-full text-xs p-2.5 rounded-md bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 resize-none leading-relaxed"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-mono text-zinc-500">Warna Aksen Visual (Hex)</Label>
                  <div className="flex items-center gap-2.5">
                    <input
                      type="color"
                      value={zoneForm.color_theme}
                      onChange={(e) => setZoneForm({ ...zoneForm, color_theme: e.target.value })}
                      className="w-9 h-9 rounded border border-zinc-200 dark:border-zinc-800 cursor-pointer bg-transparent"
                    />
                    <Input
                      value={zoneForm.color_theme}
                      onChange={(e) => setZoneForm({ ...zoneForm, color_theme: e.target.value })}
                      placeholder="#3b82f6"
                      className="h-9 text-xs font-mono flex-1"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-md bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">Status Zona Aktif</span>
                  <input
                    type="checkbox"
                    checked={zoneForm.is_active}
                    onChange={(e) => setZoneForm({ ...zoneForm, is_active: e.target.checked })}
                    className="w-4 h-4 rounded accent-zinc-900 dark:accent-zinc-100 cursor-pointer"
                  />
                </div>
              </>
            )}

            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModalOpen(false)}
                disabled={saving}
                className="text-xs h-9 px-4"
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={saving}
                className="text-xs h-9 px-5 font-medium gap-1.5"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                {editingItem ? 'Simpan Perubahan' : 'Tambah Modul'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Modul</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus modul "{itemToDelete?.name}"?
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
