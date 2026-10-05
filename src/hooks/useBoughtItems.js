import { useState } from 'react';

const STORAGE_KEY = 'coffee-shop-supplies:bought';

function readBought() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function useBoughtItems() {
  const [bought, setBought] = useState(readBought);

  function toggleBought(id) {
    if (!id) return;
    setBought((current) => {
      const next = { ...current, [id]: !current[id] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  return { bought, toggleBought };
}
