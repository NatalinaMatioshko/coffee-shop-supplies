import { useState } from 'react';

const DEFAULT_KEY = 'coffee-shop-supplies:bought';

function readBought(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function useBoughtItems(storageKey = DEFAULT_KEY) {
  const [bought, setBought] = useState(() => readBought(storageKey));

  function toggleBought(id) {
    if (!id) return;
    setBought((current) => {
      const next = { ...current, [id]: !current[id] };
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }

  return { bought, toggleBought };
}
