import { useCallback, useState, useRef } from 'react';

export default function Dropzone({ onFileSelect, disabled }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;
    const files = e.dataTransfer.files;
    if (files.length > 0) onFileSelect(files[0]);
  }, [disabled, onFileSelect]);

  const handleClick = () => {
    if (!disabled && inputRef.current) inputRef.current.click();
  };

  const handleChange = (e) => {
    if (e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
      e.target.value = '';
    }
  };

  return (
    <div
      id="dropzone"
      className={`dropzone p-8 md:p-12 text-center ${isDragging ? 'active' : ''} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label="Area drag and drop file"
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
        id="file-input"
      />

      <div className="relative z-10 flex flex-col items-center gap-4">
        {/* Upload icon */}
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${isDragging ? 'bg-primary-500/20 scale-110' : 'bg-primary-500/10'}`}>
          <svg className={`w-8 h-8 transition-colors duration-300 ${isDragging ? 'text-primary-300' : 'text-primary-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>

        <div>
          <p className="text-surface-100 font-medium text-lg mb-1">
            {isDragging ? 'Lepaskan file di sini...' : 'Drag & drop file di sini'}
          </p>
          <p className="text-surface-200/50 text-sm">
            atau <span className="text-primary-400 underline underline-offset-2">klik untuk memilih file</span>
          </p>
        </div>

        <p className="text-surface-200/30 text-xs">
          Mendukung semua jenis file • Tanpa batas ukuran
        </p>
      </div>
    </div>
  );
}
