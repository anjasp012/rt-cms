import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import InnovationsView from './InnovationsView'
import ModuleManagementView from './ModuleManagementView'
import ModuleUsageView from './ModuleUsageView'
import SuggestionsTable from './SuggestionsTable'
import SettingsView from './SettingsView'
import {
  fetchInnovations,
  createInnovation,
  updateInnovation,
  deleteInnovation,
  updateInnovationRelevance,
  fetchModuleUsage,
  fetchSuggestions,
  deleteSuggestion,
  bulkDeleteSuggestions,
  fetchPersonas,
  createPersona,
  updatePersona,
  deletePersona,
  fetchZones,
  createZone,
  updateZone,
  deleteZone,
  fetchSettings,
  saveSettings,
  checkApiHealth
} from '@/lib/api'
import { useTheme } from '@/lib/theme'
import { Toaster, toast } from 'sonner'
import {
  Lightbulb,
  MessageSquare,
  Compass,
  BarChart3,
  Sliders,
  LogOut,
  Sun,
  Moon,
  BookOpen,
  ExternalLink,
  ChevronRight,
  Menu,
  X
} from 'lucide-react'

export default function Dashboard({ username, onLogout }) {
  // Navigation: 'innovations' | 'modules' | 'usage' | 'suggestions' | 'settings'
  const [currentView, setCurrentView] = useState('innovations')

  const [innovations, setInnovations] = useState([])
  const [selectedZone, setSelectedZone] = useState(null)
  const [moduleUsage, setModuleUsage] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [personas, setPersonas] = useState([])
  const [zones, setZones] = useState([])
  const [settings, setSettingsData] = useState(null)

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true)
  const [apiStatus, setApiStatus] = useState('checking')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { isDark, toggleTheme } = useTheme()
  const isFetchingRef = useRef(false)

  const viewTitles = {
    innovations: 'Daftar Penelitian & Hasil Riset BRIN',
    modules: 'Kelola Modul Meja Interaktif',
    usage: 'Histori Pemakaian Modul',
    suggestions: 'Usulan Riset Pengunjung',
    settings: 'Pengaturan Sistem',
  }

  const verifyHealth = useCallback(async () => {
    const isHealthy = await checkApiHealth()
    setApiStatus(isHealthy ? 'online' : 'offline')
  }, [])

  const loadData = useCallback(async (isManualRefresh = false) => {
    if (isFetchingRef.current) return
    isFetchingRef.current = true

    if (isManualRefresh) setRefreshing(true)
    verifyHealth()

    try {
      const [
        innoRes,
        usageRes,
        suggestionsRes,
        personasRes,
        zonesRes,
        settingsRes
      ] = await Promise.all([
        fetchInnovations(selectedZone).catch(() => []),
        fetchModuleUsage().catch(() => null),
        fetchSuggestions().catch(() => []),
        fetchPersonas().catch(() => []),
        fetchZones().catch(() => []),
        fetchSettings().catch(() => null)
      ])

      if (Array.isArray(innoRes)) setInnovations(innoRes)
      if (usageRes) setModuleUsage(usageRes)
      if (Array.isArray(suggestionsRes)) setSuggestions(suggestionsRes)
      if (Array.isArray(personasRes)) setPersonas(personasRes)
      if (Array.isArray(zonesRes)) setZones(zonesRes)
      if (settingsRes) setSettingsData(settingsRes)

      if (isManualRefresh) {
        toast.success('Data berhasil diperbarui')
      }
    } catch (err) {
      if (isManualRefresh) {
        toast.error(err.message || 'Gagal memuat data')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
      isFetchingRef.current = false
    }
  }, [selectedZone, verifyHealth])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Polling auto-sync every 10s
  useEffect(() => {
    if (!autoSyncEnabled) return
    const interval = setInterval(() => {
      loadData(false)
    }, 10000)
    return () => clearInterval(interval)
  }, [autoSyncEnabled, loadData])

  // --- INNOVATION HANDLERS ---
  const handleSaveInnovation = async (id, data) => {
    try {
      if (id) {
        await updateInnovation(id, data)
        toast.success('Penelitian berhasil disimpan')
      } else {
        await createInnovation(data)
        toast.success('Penelitian baru berhasil ditambahkan')
      }
      loadData(false)
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan data penelitian')
      throw err
    }
  }

  const handleDeleteInnovation = async (id) => {
    try {
      await deleteInnovation(id)
      toast.success('Penelitian berhasil dihapus')
      loadData(false)
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus penelitian')
    }
  }

  const handleUpdateRelevance = async (id, mappings) => {
    try {
      await updateInnovationRelevance(id, mappings)
      toast.success('Bobot relevansi persona berhasil diperbarui')
      loadData(false)
    } catch (err) {
      toast.error(err.message || 'Gagal mengatur bobot relevansi')
    }
  }

  // --- PERSONA CRUD HANDLERS ---
  const handleCreatePersona = async (payload) => {
    try {
      await createPersona(payload)
      toast.success('Modul Pengguna berhasil ditambahkan')
      loadData(false)
    } catch (err) {
      toast.error(err.message || 'Gagal menambah modul')
      throw err
    }
  }

  const handleUpdatePersona = async (id, payload) => {
    try {
      await updatePersona(id, payload)
      toast.success('Modul Pengguna berhasil disimpan')
      loadData(false)
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan modul')
      throw err
    }
  }

  const handleDeletePersona = async (id) => {
    try {
      await deletePersona(id)
      toast.success('Modul Pengguna berhasil dihapus')
      loadData(false)
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus modul')
    }
  }

  // --- ZONE CRUD HANDLERS ---
  const handleCreateZone = async (payload) => {
    try {
      await createZone(payload)
      toast.success('Token Tantangan berhasil ditambahkan')
      loadData(false)
    } catch (err) {
      toast.error(err.message || 'Gagal menambah zona')
      throw err
    }
  }

  const handleUpdateZone = async (id, payload) => {
    try {
      await updateZone(id, payload)
      toast.success('Token Tantangan berhasil disimpan')
      loadData(false)
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan zona')
      throw err
    }
  }

  const handleDeleteZone = async (id) => {
    try {
      await deleteZone(id)
      toast.success('Token Tantangan berhasil dihapus')
      loadData(false)
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus zona')
    }
  }

  // --- SUGGESTION HANDLERS ---
  const handleDeleteSuggestion = async (id) => {
    try {
      await deleteSuggestion(id)
      toast.success('Usulan berhasil dihapus')
      loadData(false)
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus data')
    }
  }

  const handleBulkDeleteSuggestions = async (ids) => {
    try {
      await bulkDeleteSuggestions(ids)
      toast.success(`${ids.length} data usulan dihapus`)
      loadData(false)
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus data')
    }
  }

  // --- SETTINGS HANDLER ---
  const handleSaveSettings = async (displayLimit) => {
    await saveSettings(displayLimit)
    loadData(false)
  }

  const navItems = [
    {
      id: 'innovations',
      label: 'Daftar Penelitian',
      icon: Lightbulb,
      count: innovations.length,
    },
    {
      id: 'modules',
      label: 'Kelola Modul',
      icon: Compass,
      count: personas.length + zones.length,
    },
    {
      id: 'usage',
      label: 'Histori Pemakaian Modul',
      icon: BarChart3,
    },
    {
      id: 'suggestions',
      label: 'Usulan Riset Pengunjung',
      icon: MessageSquare,
      count: suggestions.length,
    },
    {
      id: 'settings',
      label: 'Pengaturan Sistem',
      icon: Sliders,
    },
  ]

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      <Toaster position="top-right" richColors theme={isDark ? 'dark' : 'light'} />

      {/* Backdrop overlay for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
        />
      )}

      {/* Left Sidebar Dashboard (DREAMWALL Exact Format) */}
      <aside
        className={`w-64 fixed inset-y-0 left-0 z-40 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col justify-between transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
      >
        <div>
          {/* Logo & Brand Header (Aligned to exact h-14 height with right navbar) */}
          <div className="h-14 px-5 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center font-bold text-xs text-zinc-100 dark:text-zinc-900 shadow-sm flex-shrink-0">
                RT
              </div>
              <div>
                <div className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100 leading-none">
                  RESEARCH TABLE
                </div>
                <div className="text-[10px] text-zinc-400 font-mono mt-0.5 leading-none">ADMIN CONSOLE</div>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 p-3">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = currentView === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id)
                    setSidebarOpen(false)
                  }}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-all ${active
                    ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-semibold shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${active ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span className="text-[11px] text-zinc-400 font-mono">
                      {item.count}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Bottom Widgets */}
        <div>
          {/* System & Connection Status Widget */}
          <div className="p-3 mx-3 mb-3 rounded-md bg-zinc-100/70 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">API BACKEND</span>
              {apiStatus === 'online' && (
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  ONLINE
                </span>
              )}
              {apiStatus === 'offline' && (
                <span className="inline-flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-mono font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  OFFLINE
                </span>
              )}
              {apiStatus === 'checking' && (
                <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-mono font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                  CHECKING
                </span>
              )}
            </div>
            <div className="text-xs text-zinc-500 font-mono truncate">
              http://https://rt-api.gagasan.tech/api
            </div>
          </div>

          {/* User Profile & Logout Section */}
          <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-700 dark:text-zinc-300 flex-shrink-0">
                {username ? username.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{username}</div>
                <div className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono leading-none">ADMINISTRATOR</div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              title="Keluar (Logout)"
              className="h-8 w-8 text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="h-14 px-5 sm:px-8 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-zinc-400 dark:text-zinc-500 font-mono text-xs">RESEARCH TABLE</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-700" />
              <span className="font-medium text-zinc-800 dark:text-zinc-200 text-sm">{viewTitles[currentView]}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Auto-Sync Status Badge */}
            <button
              type="button"
              onClick={() => {
                const nextState = !autoSyncEnabled
                setAutoSyncEnabled(nextState)
                toast.info(nextState ? 'Sinkron otomatis diaktifkan' : 'Sinkron otomatis dijeda')
              }}
              title={autoSyncEnabled ? 'Sinkron Otomatis Aktif (Klik untuk menjeda)' : 'Sinkron Otomatis Dijeda (Klik untuk mengaktifkan)'}
              className={`hidden sm:inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-mono border transition-colors ${autoSyncEnabled
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/60'
                : 'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-500 dark:border-zinc-800'
                }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${autoSyncEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`} />
              <span>{autoSyncEnabled ? 'SINKRON OTOMATIS' : 'SINKRON DIJEDA'}</span>
            </button>

            {/* Direct Swagger API Docs Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://rt-api.gagasan.tech/docs', '_blank')}
              className="h-9 text-xs font-medium border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
            >
              <BookOpen className="w-3.5 h-3.5 mr-1.5 text-zinc-500 dark:text-zinc-400" />
              API Docs
              <ExternalLink className="w-3.5 h-3.5 ml-1.5 text-zinc-400 dark:text-zinc-500" />
            </Button>

            {/* Theme Toggle Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              title={isDark ? 'Ganti ke Tema Terang' : 'Ganti ke Tema Gelap'}
              className="h-9 w-9 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-700" />}
            </Button>
          </div>
        </header>

        {/* Dashboard Content Area */}
        <div className="p-5 sm:p-8 space-y-6 flex-1">
          {currentView === 'innovations' && (
            <InnovationsView
              innovations={innovations}
              zones={zones}
              personas={personas}
              loading={loading}
              onSaveInnovation={handleSaveInnovation}
              onDeleteInnovation={handleDeleteInnovation}
              onUpdateRelevance={handleUpdateRelevance}
              selectedZone={selectedZone}
              onSelectZone={setSelectedZone}
            />
          )}

          {currentView === 'modules' && (
            <ModuleManagementView
              personas={personas}
              zones={zones}
              onCreatePersona={handleCreatePersona}
              onUpdatePersona={handleUpdatePersona}
              onDeletePersona={handleDeletePersona}
              onCreateZone={handleCreateZone}
              onUpdateZone={handleUpdateZone}
              onDeleteZone={handleDeleteZone}
              loading={loading}
            />
          )}

          {currentView === 'usage' && (
            <ModuleUsageView
              moduleUsage={moduleUsage}
              loading={loading}
            />
          )}

          {currentView === 'suggestions' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Usulan Riset dari Pengunjung
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Daftar topik riset dan ide inovasi yang diusulkan oleh pengunjung meja sentuh.
                </p>
              </div>

              <SuggestionsTable
                suggestions={suggestions}
                loading={loading}
                onDelete={handleDeleteSuggestion}
                onBulkDelete={handleBulkDeleteSuggestions}
              />
            </div>
          )}

          {currentView === 'settings' && (
            <SettingsView
              settings={settings}
              onSaveSettings={handleSaveSettings}
              apiStatus={apiStatus}
              onVerifyHealth={verifyHealth}
            />
          )}
        </div>

        {/* Global Footer */}
        <footer className="px-8 py-4 border-t border-zinc-200 dark:border-zinc-800/60 text-xs text-zinc-400 dark:text-zinc-600 flex items-center justify-between font-mono">
          <div>RESEARCH TABLE · PANEL ADMIN BRIN</div>
          <div>SWAGGER: /docs</div>
        </footer>
      </main>
    </div>
  )
}
