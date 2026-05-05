import { useState, useCallback } from 'react';
import Dropzone from './components/Dropzone';
import PasswordField from './components/PasswordField';
import FileInfo from './components/FileInfo';
import { useCrypto } from './hooks/useCrypto';
import { downloadBlob, generateOutputFilename } from './utils/helpers';

export default function App() {
  const [mode, setMode] = useState('encrypt');
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [outputFilename, setOutputFilename] = useState('');
  const { encrypt, decrypt, status, progress, error, resultBlob, reset } = useCrypto();

  const isProcessing = status === 'processing';
  const isSuccess = status === 'success';
  const isError = status === 'error';
  const canProcess = file && password.length >= 1 && !isProcessing;

  const handleFileSelect = useCallback((f) => {
    setFile(f);
    reset();
  }, [reset]);

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    setPassword('');
    reset();
  }, [reset]);

  const handleModeChange = useCallback((newMode) => {
    setMode(newMode);
    setFile(null);
    setPassword('');
    reset();
  }, [reset]);

  const handleProcess = useCallback(async () => {
    if (!canProcess) return;
    const blob = mode === 'encrypt'
      ? await encrypt(file, password)
      : await decrypt(file, password);
    if (blob) {
      const outName = generateOutputFilename(file.name, mode);
      setOutputFilename(outName);
      await downloadBlob(blob, outName);
    }
  }, [canProcess, mode, file, password, encrypt, decrypt]);

  const handleReset = useCallback(() => {
    setFile(null);
    setPassword('');
    reset();
  }, [reset]);

  return (
    <div className="min-h-screen relative">
      {/* Animated background */}
      <div className="bg-grid" />
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />
      <div className="bg-glow bg-glow-3" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 py-8 md:py-12">
        {/* Header */}
        <header className="text-center mb-8 md:mb-12 animate-fade-in-up" id="app-header">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-300 via-primary-200 to-accent-400 bg-clip-text text-transparent">
            SECURE-WEB-LOCK
          </h1>
          <p className="text-surface-200/50 text-sm md:text-base mt-2 max-w-md mx-auto">
            Enkripsi file dengan AES-GCM 256-bit langsung di browser Anda.
            <br />
            <span className="text-accent-400/70 font-medium">Zero Knowledge • 100% Client-Side</span>
          </p>
        </header>

        {/* Main Card */}
        <main className="w-full max-w-xl animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <div className="glass-card p-6 md:p-8 space-y-6" id="main-card">

            {/* Mode Toggle */}
            <div className="mode-toggle" id="mode-toggle">
              <button
                className={`mode-btn ${mode === 'encrypt' ? 'active' : ''}`}
                onClick={() => handleModeChange('encrypt')}
                id="btn-mode-encrypt"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                Enkripsi
              </button>
              <button
                className={`mode-btn ${mode === 'decrypt' ? 'active' : ''}`}
                onClick={() => handleModeChange('decrypt')}
                id="btn-mode-decrypt"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                Dekripsi
              </button>
            </div>

            {/* Dropzone or File Info */}
            {!file ? (
              <Dropzone onFileSelect={handleFileSelect} disabled={isProcessing} />
            ) : (
              <FileInfo file={file} onRemove={handleRemoveFile} disabled={isProcessing} />
            )}

            {/* Password Field */}
            {file && (
              <PasswordField
                password={password}
                onChange={setPassword}
                disabled={isProcessing}
                mode={mode}
              />
            )}

            {/* Progress Bar */}
            {isProcessing && (
              <div className="space-y-2 animate-fade-in" id="progress-section">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-surface-200/50">
                    {mode === 'encrypt' ? 'Mengenkripsi...' : 'Mendekripsi...'}
                  </span>
                  <span className="text-primary-400 font-mono font-medium">{Math.round(progress)}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            {/* Error Message */}
            {isError && error && (
              <div className="animate-shake" id="error-message">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-danger-500/8 border border-danger-500/15">
                  <svg className="w-5 h-5 text-danger-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <div>
                    <p className="text-danger-400 text-sm font-medium">Gagal!</p>
                    <p className="text-danger-400/70 text-xs mt-0.5">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {isSuccess && (
              <div className="animate-fade-in space-y-3" id="success-message">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-accent-500/8 border border-accent-500/15">
                  <svg className="w-5 h-5 text-accent-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-accent-400 text-sm font-medium">Berhasil!</p>
                    <p className="text-accent-400/70 text-xs mt-1">
                      {mode === 'encrypt'
                        ? 'File berhasil dienkripsi dan sedang didownload.'
                        : 'File berhasil didekripsi dan sedang didownload.'}
                    </p>
                    {outputFilename && (
                      <p className="text-surface-200/50 text-xs mt-2 font-mono bg-surface-800/50 rounded-lg px-3 py-1.5 truncate" title={outputFilename}>
                        📁 {outputFilename}
                      </p>
                    )}
                  </div>
                </div>

                {/* Instructions after encryption */}
                {mode === 'encrypt' && (
                  <div className="p-4 rounded-xl bg-primary-500/5 border border-primary-500/10">
                    <p className="text-primary-300 text-xs font-medium mb-2">📋 Cara mendekripsi file:</p>
                    <ol className="text-surface-200/50 text-xs space-y-1 list-decimal list-inside">
                      <li>Pindah ke mode <strong className="text-primary-300">Dekripsi</strong></li>
                      <li>Upload file <strong className="text-primary-300 font-mono">.enc</strong> yang baru didownload</li>
                      <li>Masukkan <strong className="text-primary-300">password yang sama</strong></li>
                      <li>Klik tombol <strong className="text-primary-300">Dekripsi File</strong></li>
                    </ol>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            {file && (
              <div className="flex flex-col gap-3 animate-fade-in" id="action-buttons">
                {!isSuccess ? (
                  <div className="flex gap-3">
                    <button
                      className="btn-primary flex-1"
                      onClick={handleProcess}
                      disabled={!canProcess}
                      id="btn-process"
                    >
                      {isProcessing ? (
                        <>
                          <svg className="w-4 h-4 animate-spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                          </svg>
                          Memproses...
                        </>
                      ) : (
                        <>
                          {mode === 'encrypt' ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                          )}
                          {mode === 'encrypt' ? 'Enkripsi File' : 'Dekripsi File'}
                        </>
                      )}
                    </button>
                    {!isProcessing && (
                      <button
                        className="btn-danger"
                        onClick={handleReset}
                        id="btn-reset"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-3">
                    {mode === 'encrypt' && (
                      <button
                        className="btn-primary flex-1"
                        onClick={() => handleModeChange('decrypt')}
                        id="btn-go-decrypt"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                        Dekripsi File .enc
                      </button>
                    )}
                    <button
                      className="btn-secondary flex-1"
                      onClick={handleReset}
                      id="btn-new-file"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Proses File Lain
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Security Banner */}
          <div className="security-banner mt-4 animate-fade-in" style={{ animationDelay: '0.3s' }} id="security-banner">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <span className="text-xs">
              Data Anda tidak pernah meninggalkan browser — <strong>100% client-side encryption</strong>
            </span>
          </div>

          {/* Tech Info */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 animate-fade-in" style={{ animationDelay: '0.4s' }} id="tech-badges">
            <span className="badge badge-info">🔐 AES-GCM 256-bit</span>
            <span className="badge badge-info">🔑 PBKDF2 100K iterations</span>
            <span className="badge badge-info">🛡️ SHA-256</span>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-auto pt-8 text-center text-surface-200/25 text-xs animate-fade-in" style={{ animationDelay: '0.5s' }} id="app-footer">
          <p>SECURE-WEB-LOCK &copy; 2026 — Powered by Web Crypto API</p>
          <p className="mt-1">Built with React + Vite • Zero Knowledge Architecture</p>
        </footer>
      </div>
    </div>
  );
}
