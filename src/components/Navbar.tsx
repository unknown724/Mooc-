import React, { useState } from 'react';
import { AppView, AppTheme, FontSizeSetting } from '../types/quiz';
import { 
  BookOpen, 
  LayoutDashboard, 
  GraduationCap, 
  AlertTriangle, 
  UploadCloud, 
  Download, 
  Upload, 
  Sparkles,
  Layers,
  Sun,
  Moon,
  Coffee,
  Type
} from 'lucide-react';

interface NavbarProps {
  currentView: AppView;
  onSelectView: (view: AppView) => void;
  totalQuestionsLoaded: number;
  totalAvailableQuestions: number;
  masteryPercentage: number;
  mistakesCount: number;
  bookmarksCount: number;
  theme: AppTheme;
  onSelectTheme: (theme: AppTheme) => void;
  fontSize: FontSizeSetting;
  onSelectFontSize: (size: FontSizeSetting) => void;
  onOpenUploadModal: () => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onQuickLoadAll: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  totalQuestionsLoaded,
  totalAvailableQuestions,
  masteryPercentage,
  mistakesCount,
  theme,
  onSelectTheme,
  fontSize,
  onSelectFontSize,
  onOpenUploadModal,
  onExportData,
  onImportData,
  onQuickLoadAll,
}) => {
  const [showDataMenu, setShowDataMenu] = useState(false);

  const navItems: { id: AppView; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'reader', label: 'Study Reader', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'quiz', label: 'Exam Quiz (120 Qs)', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'flashcards', label: 'Flashcards', icon: <Layers className="w-4 h-4" /> },
    { 
      id: 'mistakes', 
      label: 'Mistake Bank', 
      icon: <AlertTriangle className="w-4 h-4" />, 
      badge: mistakesCount > 0 ? mistakesCount : undefined 
    },
  ];

  return (
    <>
      <header 
        className="sticky top-0 z-40 backdrop-blur-xl border-b transition-colors duration-200"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16 gap-3">
            
            {/* Zone 1: GeoMastery Brand Wordmark */}
            <div 
              className="flex items-center gap-2.5 cursor-pointer select-none shrink-0 group" 
              onClick={() => onSelectView('dashboard')}
            >
              <div 
                className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white transition-transform group-hover:scale-105 shadow-sm"
                style={{ backgroundColor: 'var(--accent-color)' }}
              >
                <GraduationCap className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm sm:text-base tracking-tight leading-tight flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                  GeoMastery
                  <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded-md font-mono" style={{ backgroundColor: 'var(--accent-soft-bg)', color: 'var(--accent-color)' }}>
                    NPTEL
                  </span>
                </span>
                <span className="hidden sm:inline text-[11px] font-normal leading-tight" style={{ color: 'var(--text-muted)' }}>
                  Conservation Geography (120 MCQs)
                </span>
              </div>
            </div>

            {/* Zone 2: Segmented Nav Control (Desktop) */}
            <nav 
              className="hidden md:flex items-center p-1 rounded-xl border text-xs font-medium"
              style={{
                backgroundColor: 'var(--app-bg)',
                borderColor: 'var(--border-color)',
              }}
            >
              {navItems.map((item) => {
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectView(item.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all relative cursor-pointer ${
                      isActive ? 'font-semibold shadow-xs' : 'hover:opacity-80'
                    }`}
                    style={{
                      backgroundColor: isActive ? 'var(--card-bg)' : 'transparent',
                      color: isActive ? 'var(--accent-color)' : 'var(--text-secondary)',
                      border: isActive ? '1px solid var(--border-color)' : '1px solid transparent',
                    }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {item.badge !== undefined && (
                      <span 
                        className="text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold"
                        style={{
                          backgroundColor: 'var(--incorrect-badge-bg)',
                          color: 'var(--incorrect-text)',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Zone 3: Eye-Comfort Theme Switcher, Font Controller & Actions */}
            <div className="flex items-center gap-2 shrink-0">
              
              {/* Font Size Controller (Small, Medium, Large) */}
              <div 
                className="hidden sm:flex items-center p-0.5 rounded-lg border text-xs"
                style={{
                  backgroundColor: 'var(--app-bg)',
                  borderColor: 'var(--border-color)',
                }}
                title="Adjust Eye-Comfort Font Size"
              >
                <button
                  type="button"
                  onClick={() => onSelectFontSize('small')}
                  className={`px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                    fontSize === 'small' ? 'shadow-xs' : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: fontSize === 'small' ? 'var(--card-bg)' : 'transparent',
                    color: fontSize === 'small' ? 'var(--accent-color)' : 'var(--text-secondary)',
                  }}
                  title="Small text"
                >
                  A-
                </button>
                <button
                  type="button"
                  onClick={() => onSelectFontSize('medium')}
                  className={`px-2 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                    fontSize === 'medium' ? 'shadow-xs' : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: fontSize === 'medium' ? 'var(--card-bg)' : 'transparent',
                    color: fontSize === 'medium' ? 'var(--accent-color)' : 'var(--text-secondary)',
                  }}
                  title="Medium text (Default)"
                >
                  A
                </button>
                <button
                  type="button"
                  onClick={() => onSelectFontSize('large')}
                  className={`px-2 py-1 rounded text-[13px] font-semibold transition-all cursor-pointer ${
                    fontSize === 'large' ? 'shadow-xs' : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: fontSize === 'large' ? 'var(--card-bg)' : 'transparent',
                    color: fontSize === 'large' ? 'var(--accent-color)' : 'var(--text-secondary)',
                  }}
                  title="Large text"
                >
                  A+
                </button>
              </div>

              {/* 3-Mode Eye-Comfort Theme Switcher (Warm Paper, Daylight Slate, Midnight Dark) */}
              <div 
                className="flex items-center p-0.5 rounded-lg border"
                style={{
                  backgroundColor: 'var(--app-bg)',
                  borderColor: 'var(--border-color)',
                }}
                title="Eye-Comfort Reading Themes"
              >
                <button
                  type="button"
                  onClick={() => onSelectTheme('warm')}
                  className={`p-1.5 rounded flex items-center gap-1 text-xs transition-all cursor-pointer ${
                    theme === 'warm' ? 'shadow-xs font-semibold' : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: theme === 'warm' ? 'var(--card-bg)' : 'transparent',
                    color: theme === 'warm' ? 'var(--accent-color)' : 'var(--text-secondary)',
                  }}
                  title="Warm Paper (Kindle/Notion E-Ink Aesthetic - Default)"
                >
                  <Coffee className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline text-[11px]">Warm</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectTheme('daylight')}
                  className={`p-1.5 rounded flex items-center gap-1 text-xs transition-all cursor-pointer ${
                    theme === 'daylight' ? 'shadow-xs font-semibold' : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: theme === 'daylight' ? 'var(--card-bg)' : 'transparent',
                    color: theme === 'daylight' ? 'var(--accent-color)' : 'var(--text-secondary)',
                  }}
                  title="Daylight Slate (High-Focus Testing Aesthetic)"
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline text-[11px]">Slate</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectTheme('midnight')}
                  className={`p-1.5 rounded flex items-center gap-1 text-xs transition-all cursor-pointer ${
                    theme === 'midnight' ? 'shadow-xs font-semibold' : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: theme === 'midnight' ? 'var(--card-bg)' : 'transparent',
                    color: theme === 'midnight' ? 'var(--accent-color)' : 'var(--text-secondary)',
                  }}
                  title="Midnight Dark (Low-Glare Night Study)"
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline text-[11px]">Night</span>
                </button>
              </div>

              {/* Bank & Mastery Metric */}
              <div 
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs"
                style={{
                  backgroundColor: 'var(--app-bg)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <span style={{ color: 'var(--text-muted)' }}>Bank:</span>
                <span className="font-mono font-medium" style={{ color: 'var(--text-primary)' }}>
                  {totalQuestionsLoaded}/{totalAvailableQuestions}
                </span>
                <span style={{ color: 'var(--border-color)' }}>|</span>
                <span style={{ color: 'var(--text-muted)' }}>Mastery:</span>
                <span className="font-mono font-bold" style={{ color: 'var(--accent-color)' }}>
                  {masteryPercentage}%
                </span>
              </div>

              {/* Upload PDFs Button */}
              <button
                onClick={onOpenUploadModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
                style={{ backgroundColor: 'var(--accent-color)' }}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Upload PDFs</span>
              </button>

              {/* Data & Backup Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowDataMenu(!showDataMenu)}
                  className="p-1.5 rounded-lg border transition-colors cursor-pointer"
                  style={{
                    backgroundColor: 'var(--app-bg)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-secondary)',
                  }}
                  title="Data Backup & Sync"
                >
                  <Download className="w-4 h-4" />
                </button>

                {showDataMenu && (
                  <div 
                    className="absolute right-0 mt-2 w-56 rounded-xl border shadow-xl py-2 z-50 text-xs animate-fade-in"
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <div 
                      className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider border-b"
                      style={{
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      Storage & Assignments
                    </div>

                    <button
                      onClick={() => {
                        onQuickLoadAll();
                        setShowDataMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 flex items-center gap-2 transition-colors font-medium hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                      style={{ color: 'var(--accent-color)' }}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Sync All 120 Questions</span>
                    </button>

                    <button
                      onClick={() => {
                        onExportData();
                        setShowDataMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 flex items-center gap-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      <Download className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                      <span>Export Backup (.json)</span>
                    </button>

                    <label 
                      className="w-full text-left px-3 py-2 flex items-center gap-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      <Upload className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                      <span>Import Backup (.json)</span>
                      <input 
                        type="file" 
                        accept=".json" 
                        className="hidden" 
                        onChange={(e) => {
                          onImportData(e);
                          setShowDataMenu(false);
                        }} 
                      />
                    </label>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t grid grid-cols-5 items-center h-16 px-1 safe-bottom backdrop-blur-xl"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-color)',
        }}
      >
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] gap-1 transition-colors relative cursor-pointer ${
                isActive ? 'font-bold' : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                color: isActive ? 'var(--accent-color)' : 'var(--text-secondary)',
              }}
            >
              <div className="relative">
                {item.icon}
                {item.badge !== undefined && (
                  <span 
                    className="absolute -top-1 -right-2 w-2 h-2 rounded-full"
                    style={{ backgroundColor: 'var(--incorrect-border)' }}
                  />
                )}
              </div>
              <span className="text-[10px] tracking-tight whitespace-nowrap">
                {item.id === 'quiz' ? 'Quiz' : item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
