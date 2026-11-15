'use client';

import React, { useRef, useEffect } from 'react';

/**
 * OtpInput - Professional 6-digit numeric OTP input component
 * Supports:
 * - Single-digit typing with auto-focus to next box
 * - Backspace with auto-focus to previous box
 * - Full 6-digit clipboard pasting
 * - Arrow navigation
 * - Accessibility attributes
 */
export default function OtpInput({
  value = '',
  onChange,
  length = 6,
  disabled = false,
  error = null,
}) {
  const inputsRef = useRef([]);

  // Ensure digits array matches length
  const digits = Array.from({ length }, (_, i) => value[i] || '');

  // Auto focus first input on mount if empty
  useEffect(() => {
    if (!disabled && inputsRef.current[0] && !value) {
      inputsRef.current[0].focus();
    }
  }, [disabled, value]);

  const handleChange = (index, e) => {
    const rawVal = e.target.value;
    // Extract only digits
    const cleanDigit = rawVal.replace(/\D/g, '').slice(-1);

    const newDigits = [...digits];
    newDigits[index] = cleanDigit;
    const combined = newDigits.join('');

    if (onChange) {
      onChange(combined);
    }

    // Auto-advance focus if digit was typed
    if (cleanDigit && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Current is empty, backspace moves focus to previous input and clears it
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        if (onChange) onChange(newDigits.join(''));
        inputsRef.current[index - 1]?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        if (onChange) onChange(newDigits.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasteData) return;

    if (onChange) {
      onChange(pasteData);
    }

    // Move focus to next unfilled box or last box
    const nextFocusIndex = Math.min(pasteData.length, length - 1);
    inputsRef.current[nextFocusIndex]?.focus();
  };

  return (
    <div className="w-full">
      <div className="flex justify-center items-center gap-2 sm:gap-3" onPaste={handlePaste}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputsRef.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            disabled={disabled}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            aria-label={`Digit ${index + 1} of verification code`}
            className={`w-11 h-14 sm:w-12 sm:h-16 text-center text-2xl font-bold font-mono rounded-xl border-2 transition-all duration-200 outline-none select-none
              ${
                error
                  ? 'border-red-400 bg-red-50 text-red-900 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                  : digit
                  ? 'border-primary bg-primary/5 text-primary-dark font-black'
                  : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/15'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}
            `}
          />
        ))}
      </div>
      {error && (
        <p className="mt-2 text-center text-xs font-medium text-red-600 animate-fadeIn">
          {error}
        </p>
      )}
    </div>
  );
}
