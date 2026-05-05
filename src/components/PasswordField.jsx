import { useState, useMemo } from 'react';
import { evaluatePasswordStrength } from '../utils/helpers';

export default function PasswordField({ password, onChange, disabled, mode }) {
  const [showPassword, setShowPassword] = useState(false);
  const strength = useMemo(() => evaluatePasswordStrength(password), [password]);

  return (
    <div className="space-y-3 animate-fade-in" id="password-section">
      <label className="block text-sm font-medium text-surface-200/70" htmlFor="password-input">
        {mode === 'encrypt' ? '🔑 Password Enkripsi' : '🔑 Password Dekripsi'}
      </label>

      <div className="relative">
        <input
          id="password-input"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => onChange(e.target.value)}
          placeholder={mode === 'encrypt' ? 'Masukkan password untuk enkripsi...' : 'Masukkan password yang sama saat enkripsi...'}
          className="input-field pr-12 font-mono"
          disabled={disabled}
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-200/40 hover:text-surface-200/80 transition-colors p-1"
          tabIndex={-1}
          id="toggle-password-visibility"
          aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
        >
          {showPassword ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>
      </div>

      {/* Password strength meter — only show on encrypt mode */}
      {mode === 'encrypt' && password && (
        <div className="space-y-1.5 animate-fade-in">
          <div className="strength-meter">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`strength-bar ${i <= strength.score ? `active-${strength.color}` : ''}`}
              />
            ))}
          </div>
          <p className={`text-xs font-medium ${
            strength.color === 'weak' ? 'text-danger-400' :
            strength.color === 'fair' ? 'text-warning-400' :
            strength.color === 'good' ? 'text-primary-400' :
            'text-accent-400'
          }`}>
            Kekuatan: {strength.label}
          </p>
        </div>
      )}
    </div>
  );
}
