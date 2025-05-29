import { useState, useEffect } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
     if (typeof window === 'undefined') return;
    try {
      const item = window.localStorage.getItem(key);
      const valueToSet = item ? JSON.parse(item) : initialValue;
       if (storedValue !== valueToSet) { // only update if different to avoid loops with initialValue
           setStoredValue(valueToSet);
       }
    } catch (error) {
      console.warn(`Error initializing localStorage key "${key}":`, error);
      // setStoredValue(initialValue); // Redundant due to useState initializer
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]); // Only re-run if key changes, which it shouldn't for this hook's typical use.

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

export default useLocalStorage;