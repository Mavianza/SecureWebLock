import { formatFileSize, getFileType, getFileIcon } from '../utils/helpers';

export default function FileInfo({ file, onRemove, disabled }) {
  if (!file) return null;

  const icon = getFileIcon(file.name);
  const type = getFileType(file.name);
  const size = formatFileSize(file.size);

  return (
    <div className="animate-slide-in-right" id="file-info">
      <div className="flex items-center gap-4 p-4 rounded-xl bg-primary-500/5 border border-primary-500/10">
        {/* File icon */}
        <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center text-2xl flex-shrink-0">
          {icon}
        </div>

        {/* File details */}
        <div className="flex-1 min-w-0">
          <p className="text-surface-100 font-medium truncate text-sm" title={file.name}>
            {file.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-surface-200/40 text-xs">{type}</span>
            <span className="text-surface-200/20">•</span>
            <span className="text-surface-200/40 text-xs font-mono">{size}</span>
          </div>
        </div>

        {/* Remove button */}
        {!disabled && (
          <button
            onClick={onRemove}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-200/30 hover:text-danger-400 hover:bg-danger-500/10 transition-all"
            id="remove-file-btn"
            aria-label="Hapus file"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
