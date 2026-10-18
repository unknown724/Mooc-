import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  FolderOpen
} from 'lucide-react';
import { WeekAssignment } from '../types/quiz';

interface QueuedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  detectedWeek: number;
  status: 'idle' | 'converting' | 'gemini_analyzing' | 'success' | 'error';
  errorMessage?: string;
  extractedCount?: number;
  weekTitle?: string;
}

interface UploadPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWeeksUpdated: (newWeeks: Record<number, WeekAssignment>) => void;
  currentWeeks: Record<number, WeekAssignment>;
  onQuickLoadAll: () => void;
}

export const UploadPdfModal: React.FC<UploadPdfModalProps> = ({
  isOpen,
  onClose,
  onWeeksUpdated,
  currentWeeks,
  onQuickLoadAll,
}) => {
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const detectWeekFromFilename = (filename: string): number => {
    const match = filename.match(/week[_\s-]?([0-9]{1,2})/i);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (num >= 1 && num <= 12) return num;
    }
    const numMatch = filename.match(/([0-9]{1,2})/);
    if (numMatch && numMatch[1]) {
      const num = parseInt(numMatch[1], 10);
      if (num >= 1 && num <= 12) return num;
    }
    return 1;
  };

  const handleFilesAdded = (files: FileList | null) => {
    if (!files) return;
    const newItems: QueuedFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        newItems.push({
          id: `${file.name}-${Date.now()}-${i}`,
          file,
          name: file.name,
          size: file.size,
          detectedWeek: detectWeekFromFilename(file.name),
          status: 'idle',
        });
      }
    }

    if (newItems.length > 0) {
      setQueuedFiles((prev) => [...prev, ...newItems]);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1] || result;
        resolve(base64);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const parseFileWithGemini = async (item: QueuedFile) => {
    setQueuedFiles((prev) =>
      prev.map((f) => (f.id === item.id ? { ...f, status: 'converting', errorMessage: undefined } : f))
    );

    try {
      const base64 = await convertFileToBase64(item.file);

      setQueuedFiles((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, status: 'gemini_analyzing' } : f))
      );

      const res = await fetch('/api/parse-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base64,
          filename: item.name,
          weekHint: item.detectedWeek,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();
      const weekNum = data.weekNumber || item.detectedWeek;

      // Update application state
      onWeeksUpdated({
        ...currentWeeks,
        [weekNum]: {
          weekNumber: weekNum,
          title: data.weekTitle || `Week ${weekNum} Assignment`,
          summary: `Extracted via Gemini multimodal parsing from ${item.name}`,
          questions: data.questions,
          isLoaded: true,
          uploadedAt: new Date().toISOString(),
        },
      });

      setQueuedFiles((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? {
                ...f,
                status: 'success',
                detectedWeek: weekNum,
                extractedCount: data.questions.length,
                weekTitle: data.weekTitle,
              }
            : f
        )
      );
    } catch (err: any) {
      console.error('Gemini parsing error:', err);
      setQueuedFiles((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? {
                ...f,
                status: 'error',
                errorMessage: err.message || 'Failed to analyze PDF with Gemini',
              }
            : f
        )
      );
    }
  };

  const handleProcessAll = async () => {
    setIsProcessingAll(true);
    for (const item of queuedFiles) {
      if (item.status === 'idle' || item.status === 'error') {
        await parseFileWithGemini(item);
      }
    }
    setIsProcessingAll(false);
  };

  const handleWeekChange = (fileId: string, weekNum: number) => {
    setQueuedFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, detectedWeek: weekNum } : f))
    );
  };

  const handleRemoveQueued = (fileId: string) => {
    setQueuedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)',
        }}
      >
        
        {/* Header */}
        <div 
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-xs"
              style={{ backgroundColor: 'var(--accent-color)' }}
            >
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Upload Assignment PDFs
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Powered by Gemini multimodal analysis for visual formatting and answer verification
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg border transition-colors cursor-pointer"
            style={{
              backgroundColor: 'var(--app-bg)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-muted)',
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Quick sync banner */}
          <div 
            className="p-4 rounded-2xl border flex items-center justify-between gap-4"
            style={{
              backgroundColor: 'var(--accent-soft-bg)',
              borderColor: 'var(--accent-color)',
            }}
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 shrink-0" style={{ color: 'var(--accent-color)' }} />
              <div>
                <p className="text-xs font-bold" style={{ color: 'var(--accent-color)' }}>
                  Need All 120 Questions Immediately?
                </p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  All 12 weekly assignment solutions are pre-verified and built right in.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                onQuickLoadAll();
                onClose();
              }}
              className="px-3.5 py-1.5 rounded-xl text-white text-xs font-semibold shrink-0 cursor-pointer shadow-xs active:scale-95"
              style={{ backgroundColor: 'var(--accent-color)' }}
            >
              Sync All
            </button>
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              handleFilesAdded(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className="border border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all"
            style={{
              backgroundColor: isDragOver ? 'var(--accent-soft-bg)' : 'var(--app-bg)',
              borderColor: isDragOver ? 'var(--accent-color)' : 'var(--border-color)',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              multiple
              className="hidden"
              onChange={(e) => handleFilesAdded(e.target.files)}
            />
            <div className="flex flex-col items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-xs"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--accent-color)',
                }}
              >
                <FolderOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Drop assignment PDFs here, or click to browse
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Upload multiple PDFs at once (Weeks 1 to 12)
                </p>
              </div>
            </div>
          </div>

          {/* Queued Files */}
          {queuedFiles.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                <span>Files in Queue ({queuedFiles.length})</span>
                <button
                  onClick={() => setQueuedFiles([])}
                  className="hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {queuedFiles.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl border text-xs"
                    style={{
                      backgroundColor: 'var(--app-bg)',
                      borderColor: 'var(--border-color)',
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="w-4 h-4 shrink-0" style={{ color: 'var(--accent-color)' }} />
                      <div className="truncate">
                        <p className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                          {(item.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={item.detectedWeek}
                        onChange={(e) => handleWeekChange(item.id, Number(e.target.value))}
                        disabled={item.status !== 'idle' && item.status !== 'error'}
                        className="border rounded-lg px-2 py-1 text-xs font-semibold cursor-pointer"
                        style={{
                          backgroundColor: 'var(--card-bg)',
                          borderColor: 'var(--border-color)',
                          color: 'var(--accent-color)',
                        }}
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((w) => (
                          <option key={w} value={w}>
                            Week {w}
                          </option>
                        ))}
                      </select>

                      {item.status === 'idle' && (
                        <button
                          onClick={() => parseFileWithGemini(item)}
                          className="px-2.5 py-1 rounded-lg text-white text-xs font-semibold cursor-pointer shadow-xs"
                          style={{ backgroundColor: 'var(--accent-color)' }}
                        >
                          Parse
                        </button>
                      )}
                      {item.status === 'converting' && (
                        <span className="flex items-center gap-1 font-mono text-[11px]" style={{ color: 'var(--bookmark-color)' }}>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Reading...
                        </span>
                      )}
                      {item.status === 'gemini_analyzing' && (
                        <span className="flex items-center gap-1 font-mono text-[11px]" style={{ color: 'var(--accent-color)' }}>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Gemini AI...
                        </span>
                      )}
                      {item.status === 'success' && (
                        <span className="flex items-center gap-1 font-semibold" style={{ color: 'var(--correct-text)' }}>
                          <CheckCircle2 className="w-4 h-4" /> Loaded
                        </span>
                      )}
                      {item.status === 'error' && (
                        <span className="flex items-center gap-1 font-semibold" style={{ color: 'var(--incorrect-text)' }}>
                          <AlertCircle className="w-4 h-4" /> Error
                        </span>
                      )}

                      <button
                        onClick={() => handleRemoveQueued(item.id)}
                        className="p-1 cursor-pointer hover:opacity-80"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div 
          className="flex items-center justify-between px-6 py-4 border-t"
          style={{
            borderColor: 'var(--border-color)',
            backgroundColor: 'var(--card-bg)',
          }}
        >
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {queuedFiles.length} file(s) selected
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border text-xs font-semibold cursor-pointer hover:opacity-80"
              style={{
                backgroundColor: 'var(--app-bg)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-secondary)',
              }}
            >
              Done
            </button>

            {queuedFiles.length > 0 && (
              <button
                onClick={handleProcessAll}
                disabled={isProcessingAll}
                className="px-4 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-40"
                style={{ backgroundColor: 'var(--accent-color)' }}
              >
                {isProcessingAll && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Parse All with Gemini</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
