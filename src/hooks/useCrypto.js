/**
 * useCrypto.js — Core cryptographic logic using Web Crypto API.
 * Implements AES-GCM 256-bit encryption with PBKDF2 key derivation.
 *
 * File format: [Salt (16 bytes)] + [IV (12 bytes)] + [Ciphertext + GCM Auth Tag]
 */
import { useState, useCallback, useRef } from 'react';

const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const PBKDF2_ITERATIONS = 100000;

/**
 * Derive an AES-GCM 256-bit key from a password and salt using PBKDF2.
 */
async function deriveKey(password, salt, usage) {
  const passwordBuffer = new TextEncoder().encode(password);
  const baseKey = await window.crypto.subtle.importKey(
    'raw', passwordBuffer, 'PBKDF2', false, ['deriveKey']
  );
  return window.crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    [usage]
  );
}

/**
 * Custom hook providing encrypt/decrypt functionality with progress tracking.
 */
export function useCrypto() {
  const [status, setStatus] = useState('idle'); // idle | processing | success | error
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [resultBlob, setResultBlob] = useState(null);
  const abortRef = useRef(false);

  const reset = useCallback(() => {
    setStatus('idle');
    setProgress(0);
    setError(null);
    if (resultBlob) {
      setResultBlob(null);
    }
    abortRef.current = false;
  }, [resultBlob]);

  const abort = useCallback(() => {
    abortRef.current = true;
  }, []);

  /**
   * Encrypt a file with the given password.
   * @param {File} file
   * @param {string} password
   * @returns {Promise<Blob|null>}
   */
  const encrypt = useCallback(async (file, password) => {
    try {
      abortRef.current = false;
      setStatus('processing');
      setError(null);
      setProgress(5);

      // Step 1: Generate random Salt and IV
      const salt = window.crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
      const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
      setProgress(10);

      // Step 2: Derive key from password
      const key = await deriveKey(password, salt, 'encrypt');
      setProgress(25);

      if (abortRef.current) { reset(); return null; }

      // Step 3: Read the file
      const fileBuffer = await file.arrayBuffer();
      setProgress(50);

      if (abortRef.current) { reset(); return null; }

      // Step 4: Encrypt with AES-GCM (Auth Tag auto-appended)
      const ciphertext = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        fileBuffer
      );
      setProgress(85);

      // Step 5: Combine Salt + IV + Ciphertext into final blob
      const blob = new Blob([salt, iv, ciphertext]);
      setProgress(100);
      setResultBlob(blob);
      setStatus('success');

      // Auto-wipe sensitive data from memory
      wipeBuffer(fileBuffer);

      return blob;
    } catch (err) {
      console.error('Encryption error:', err);
      setError('Gagal mengenkripsi file. Silakan coba lagi.');
      setStatus('error');
      return null;
    }
  }, [reset]);

  /**
   * Decrypt an encrypted file with the given password.
   * @param {File} file
   * @param {string} password
   * @returns {Promise<Blob|null>}
   */
  const decrypt = useCallback(async (file, password) => {
    try {
      abortRef.current = false;
      setStatus('processing');
      setError(null);
      setProgress(5);

      // Step 1: Read the encrypted file
      const fileBuffer = await file.arrayBuffer();
      setProgress(15);

      // Step 2: Extract Salt, IV, and Ciphertext
      const salt = new Uint8Array(fileBuffer.slice(0, SALT_LENGTH));
      const iv = new Uint8Array(fileBuffer.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH));
      const ciphertext = fileBuffer.slice(SALT_LENGTH + IV_LENGTH);
      setProgress(25);

      if (abortRef.current) { reset(); return null; }

      // Step 3: Derive key from password
      const key = await deriveKey(password, salt, 'decrypt');
      setProgress(50);

      if (abortRef.current) { reset(); return null; }

      // Step 4: Decrypt with AES-GCM (integrity check included)
      const plaintext = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        ciphertext
      );
      setProgress(90);

      // Step 5: Create result blob
      const blob = new Blob([plaintext]);
      setProgress(100);
      setResultBlob(blob);
      setStatus('success');

      // Auto-wipe
      wipeBuffer(fileBuffer);

      return blob;
    } catch (err) {
      console.error('Decryption error:', err);
      const isIntegrityError = err.name === 'OperationError';
      setError(
        isIntegrityError
          ? 'Dekripsi gagal! Password salah atau file telah dimodifikasi (integrity check gagal).'
          : 'Gagal mendekripsi file. Pastikan file ini terenkripsi dan password benar.'
      );
      setStatus('error');
      return null;
    }
  }, [reset]);

  return { encrypt, decrypt, status, progress, error, resultBlob, reset, abort };
}

/**
 * Attempt to wipe an ArrayBuffer from memory.
 */
function wipeBuffer(buffer) {
  try {
    const view = new Uint8Array(buffer);
    window.crypto.getRandomValues(view); // overwrite with random data
  } catch {
    // Buffer may already be detached (transferred), which is fine
  }
}
