import { useEffect, useState } from 'react';

// State yang otomatis tersimpan di LocalStorage.
export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage penuh / diblokir: abaikan */
    }
  }, [key, value]);

  return [value, setValue];
}
