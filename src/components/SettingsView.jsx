import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Sliders,
  Monitor,
  Database,
  Copy,
  Check,
  Loader2,
  Play,
  Shield,
  ExternalLink,
  Layers
} from 'lucide-react'

export default function SettingsView({
  settings,
  onSaveSettings,
  apiStatus,
  onVerifyHealth
}) {
  const [limit, setLimit] = useState(50)
  const [saving, setSaving] = useState(false)
  const [loadingSetting, setLoadingSetting] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [copiedKey, setCopiedKey] = useState(false)
  const [previewData, setPreviewData] = useState(null)
  const [testing, setTesting] = useState(false)

  const endpointUrl = 'http://https://rt-api.gagasan.tech/api/api/v1/table/explore'
  const accessKey = 'research_table_local_secret_2026'

  useEffect(() => {
    if (settings?.frontend_display_limit) {
      setLimit(settings.frontend_display_limit)
    }
  }, [settings])

  const copyText = (text, type) => {
    navigator.clipboard.writeText(text)
    if (type === 'url') {
      setCopiedUrl(true)
      setTimeout(() => setCopiedUrl(false), 2000)
    } else {
      setCopiedKey(true)
      setTimeout(() => setCopiedKey(false), 2000)
    }
    toast.success('Disalin ke clipboard')
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSaveSettings(parseInt(limit))
      toast.success('Batas kuota berhasil disimpan')
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan pengaturan')
    } finally {
      setSaving(false)
    }
  }

  const testApprovedEndpoint = async () => {
    setTesting(true)
    try {
      const res = await fetch(endpointUrl, {
        headers: {
          'X-Access-Token': accessKey,
        },
      })
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`)
      const data = await res.json()
      setPreviewData(data)
      toast.success(`Berhasil memuat ${data.length} data inovasi`)
    } catch (err) {
      toast.error(`Test request gagal: ${err.message}`)
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Pengaturan Sistem & Meja Interaktif
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Konfigurasi kuota tampilan data dan spesifikasi endpoint.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Frontend Display Limit Card (DREAMWALL style) */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
          <CardHeader className="p-5 pb-4">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              <CardTitle className="text-sm font-semibold">Limit Tampilan Frontend</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Maksimum kartu inovasi yang disajikan backend ke layar meja interaktif.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-4">
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="limit-input" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Maksimum Record
                </Label>
                <div className="max-w-xs">
                  <Input
                    id="limit-input"
                    type="number"
                    min="1"
                    placeholder="50"
                    disabled={loadingSetting}
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                    className="w-full font-mono text-sm h-9"
                  />
                </div>
                <p className="text-xs text-zinc-500 font-mono">
                  Tersimpan di tabel <code className="text-zinc-700 dark:text-zinc-300">app_settings</code>.
                </p>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={saving || loadingSetting}
                  className="text-sm h-9 px-4 font-medium"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-1.5" />
                      Simpan
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={testApprovedEndpoint}
                  disabled={testing}
                  className="text-sm h-9 px-4"
                >
                  <Play className={`w-3.5 h-3.5 mr-1.5 ${testing ? 'animate-spin' : ''}`} />
                  {testing ? 'Menguji...' : 'Test Request'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* API Endpoint & Integration Specs (DREAMWALL style) */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
          <CardHeader className="p-5 pb-4">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              <CardTitle className="text-sm font-semibold">Spesifikasi Endpoint</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Parameter request untuk konsumsi data layar pameran / client.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3.5 text-xs">
            <div className="space-y-1.5">
              <span className="text-zinc-500 dark:text-zinc-400 font-mono text-[11px] uppercase">GET Explore Endpoint URL</span>
              <div className="flex items-center gap-2 p-2 rounded-md bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-800 dark:text-zinc-300 break-all">
                <span className="flex-1 select-all">{endpointUrl}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyText(endpointUrl, 'url')}
                  className="h-7 w-7 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 flex-shrink-0"
                  title="Salin URL"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 font-mono text-[11px] uppercase">
                <Shield className="w-3.5 h-3.5 text-zinc-400" />
                <span>Required Header</span>
              </div>
              <div className="p-2 rounded-md bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 font-mono text-zinc-800 dark:text-zinc-300 text-xs flex items-center justify-between">
                <span>x-access-token: {accessKey}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyText(accessKey, 'key')}
                  className="h-6 w-6 text-zinc-400 hover:text-zinc-200"
                  title="Salin API Key"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Preview of Inovasi */}
      {previewData && (
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
          <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">
                Response Preview ({previewData.length} Record)
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Output JSON dari server saat ini.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs px-3"
              onClick={() => window.open(endpointUrl, '_blank')}
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
              Raw JSON
            </Button>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            {previewData.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500 font-mono">
                Belum ada data inovasi.
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {previewData.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex items-start justify-between gap-3 text-sm"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className="font-mono text-zinc-400 dark:text-zinc-500 text-xs mt-0.5">#{idx + 1}</span>
                      <div className="space-y-0.5">
                        <span className="text-zinc-900 dark:text-zinc-200 font-medium block">{item.title}</span>
                        <span className="text-xs text-zinc-400 font-mono">{item.zone_name} &bull; TRL {item.trl}/9</span>
                      </div>
                    </div>
                    <Badge variant="approved" className="flex-shrink-0">
                      TRL {item.trl}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
