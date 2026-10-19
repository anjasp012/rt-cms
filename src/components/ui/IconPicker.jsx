import React, { useState, useMemo } from 'react';
import { Search, X, Sparkles, Grid } from 'lucide-react';
import { ALL_MDI_ICONS, BRIN_SUGGESTED_ICONS } from '../../lib/mdiIcons';

export default function IconPicker({
  value = '',
  onChange,
  label = 'Ikon MDI',
  placeholder = 'Pilih atau ketik nama ikon...',
  required = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('suggested'); // 'suggested' | 'all'
  const [displayLimit, setDisplayLimit] = useState(120);

  // Filtered icons
  const filteredIcons = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const sourceList = activeTab === 'suggested' && !term ? BRIN_SUGGESTED_ICONS : ALL_MDI_ICONS;

    if (!term) {
      return sourceList.slice(0, displayLimit);
    }

    const matches = sourceList.filter(icon => icon.toLowerCase().includes(term));
    return matches.slice(0, displayLimit);
  }, [searchTerm, activeTab, displayLimit]);

  const totalMatchesCount = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const sourceList = activeTab === 'suggested' && !term ? BRIN_SUGGESTED_ICONS : ALL_MDI_ICONS;
    if (!term) return sourceList.length;
    return sourceList.filter(icon => icon.toLowerCase().includes(term)).length;
  }, [searchTerm, activeTab]);

  const handleSelect = (iconName) => {
    if (onChange) onChange(iconName);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold text-zinc-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Input Group with Live Preview & Picker Button */}
      <div className="flex items-center gap-2">
        {/* Live Icon Box */}
        <div 
          onClick={() => setIsOpen(true)}
          className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg border border-zinc-300 bg-zinc-50 hover:bg-zinc-100 cursor-pointer shadow-sm transition-colors text-zinc-700"
          title="Klik untuk memilih ikon"
        >
          {value ? (
            <i className={`mdi mdi-${value} text-2xl text-blue-600`}></i>
          ) : (
            <i className="mdi mdi-image-outline text-xl text-zinc-300"></i>
          )}
        </div>

        {/* Text Input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange && onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 pr-8 text-sm font-mono border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-zinc-800 placeholder-zinc-400"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange && onChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-0.5"
              title="Hapus pilihan"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Modal Trigger Button */}
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setDisplayLimit(120);
          }}
          className="px-3.5 py-2 flex items-center gap-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex-shrink-0"
        >
          <Grid className="w-4 h-4" />
          <span>Pilih Ikon</span>
        </button>
      </div>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <i className="mdi mdi-vector-square text-lg"></i>
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900">Pilih Ikon Material Design (MDI)</h3>
                  <p className="text-xs text-zinc-500">Tersedia lebih dari 7.400 ikon resmi untuk modul dan kartu riset</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Controls: Search & Tabs */}
            <div className="p-4 border-b border-zinc-100 bg-white space-y-3">
              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  autoFocus
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setDisplayLimit(120);
                  }}
                  placeholder="Cari ikon... (contoh: cow, leaf, robot, atom, water, chip, rice)"
                  className="w-full pl-10 pr-9 py-2 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-zinc-50"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-0.5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Tabs */}
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('suggested');
                      setDisplayLimit(120);
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
                      activeTab === 'suggested' && !searchTerm
                        ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                        : 'text-zinc-600 hover:bg-zinc-100'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ikon Populer BRIN ({BRIN_SUGGESTED_ICONS.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('all');
                      setDisplayLimit(120);
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
                      activeTab === 'all' || searchTerm
                        ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                        : 'text-zinc-600 hover:bg-zinc-100'
                    }`}
                  >
                    <Grid className="w-3.5 h-3.5" />
                    <span>Semua Ikon ({ALL_MDI_ICONS.length.toLocaleString()})</span>
                  </button>
                </div>
                <span className="text-[11px] text-zinc-400">
                  {totalMatchesCount} hasil ditemukan
                </span>
              </div>
            </div>

            {/* Grid of Icons */}
            <div className="flex-1 overflow-y-auto p-4 bg-zinc-50/50">
              {filteredIcons.length === 0 ? (
                <div className="py-12 text-center">
                  <i className="mdi mdi-emoticon-sad-outline text-4xl text-zinc-300 mb-2"></i>
                  <p className="text-sm font-medium text-zinc-600">Tidak ada ikon yang cocok dengan "{searchTerm}"</p>
                  <p className="text-xs text-zinc-400 mt-1">Coba gunakan kata kunci bahasa Inggris lain seperti 'car', 'star', 'fire'</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5">
                  {filteredIcons.map((iconName) => {
                    const isSelected = value === iconName;
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => handleSelect(iconName)}
                        title={iconName}
                        className={`group p-2.5 rounded-xl flex flex-col items-center justify-center text-center transition-all bg-white border ${
                          isSelected
                            ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/50 text-blue-700 shadow-sm'
                            : 'border-zinc-200/80 hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-sm text-zinc-700'
                        }`}
                      >
                        <i className={`mdi mdi-${iconName} text-2xl transition-transform group-hover:scale-110 mb-1.5 ${
                          isSelected ? 'text-blue-600' : 'text-zinc-700 group-hover:text-blue-600'
                        }`}></i>
                        <span className="text-[10px] font-mono leading-tight text-zinc-500 group-hover:text-zinc-800 line-clamp-1 w-full truncate">
                          {iconName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Load More Button if results exceed display limit */}
              {totalMatchesCount > displayLimit && (
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => setDisplayLimit(prev => prev + 120)}
                    className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 shadow-sm transition-all"
                  >
                    Muat Lebih Banyak ({totalMatchesCount - displayLimit} lagi)
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 border-t border-zinc-100 bg-white flex items-center justify-between">
              <div className="text-xs text-zinc-500 flex items-center gap-1.5">
                <span>Terpilih:</span>
                {value ? (
                  <span className="inline-flex items-center gap-1 font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    <i className={`mdi mdi-${value}`}></i>
                    {value}
                  </span>
                ) : (
                  <span className="text-zinc-400 italic">Belum ada ikon dipilih</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors border border-zinc-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
