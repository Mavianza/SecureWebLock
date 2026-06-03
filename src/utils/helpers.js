/**
 * helpers.js — Utility functions for file handling and data conversion.
 */

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileExtension(filename) {
  const parts = filename.split('.');
  if (parts.length < 2) return '';
  return parts.pop().toLowerCase();
}

export function getFileType(filename) {
  const ext = getFileExtension(filename);
  const map = {
    pdf: 'PDF Document', doc: 'Word Document', docx: 'Word Document',
    xls: 'Excel Spreadsheet', xlsx: 'Excel Spreadsheet',
    txt: 'Text File', csv: 'CSV File', json: 'JSON File',
    png: 'PNG Image', jpg: 'JPEG Image', jpeg: 'JPEG Image',
    gif: 'GIF Image', svg: 'SVG Image', webp: 'WebP Image',
    mp3: 'MP3 Audio', mp4: 'MP4 Video', zip: 'ZIP Archive',
    rar: 'RAR Archive', exe: 'Executable', enc: 'Encrypted File',
  };
  return map[ext] || (ext ? `${ext.toUpperCase()} File` : 'Unknown File');
}

export function getFileIcon(filename) {
  const ext = getFileExtension(filename);
  const map = {
    pdf: '📄', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊',
    txt: '📃', csv: '📊', json: '⚙️', png: '🖼️', jpg: '🖼️',
    jpeg: '🖼️', gif: '🖼️', svg: '🖼️', mp3: '🎵', mp4: '🎬',
    zip: '📦', rar: '📦', exe: '⚙️', enc: '🔒',
  };
  return map[ext] || '📄';
}

export function evaluatePasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (password.length >= 14) score += 1;
  if (/[a-z]/.test(password)) score += 0.5;
  if (/[A-Z]/.test(password)) score += 0.5;
  if (/[0-9]/.test(password)) score += 0.5;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  if (/^(.)\1+$/.test(password)) score = Math.max(score - 2, 0);
  const level = Math.min(Math.floor(score / 1.5), 3);
  const levels = [
    { score: 0, label: 'Lemah', color: 'weak' },
    { score: 1, label: 'Cukup', color: 'fair' },
    { score: 2, label: 'Bagus', color: 'good' },
    { score: 3, label: 'Kuat', color: 'strong' },
  ];
  return levels[level];
}

export async function downloadBlob(blob, filename) {
  return new Promise((resolve) => {
    // Memastikan tipe MIME yang digunakan adalah binary stream yang aman
    const downloadFile = new Blob([blob], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(downloadFile);
    
    // Pembuatan elemen Anchor secara dinamis
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    
    // Memasukkan ke dalam DOM sangat penting untuk Firefox
    document.body.appendChild(a);
    
    // Memberi jeda asinkron agar antrean Download Manager browser siap
    setTimeout(() => {
      a.click();
      
      // Jeda untuk pembersihan memori (RAM) agar browser tidak berat
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        resolve();
      }, 500); 
    }, 0);
  });
}

export function generateOutputFilename(originalName, mode) {
  if (mode === 'encrypt') return `${originalName}.enc`;
  if (originalName.endsWith('.enc')) return originalName.slice(0, -4);
  return `decrypted_${originalName}`;
}

export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
