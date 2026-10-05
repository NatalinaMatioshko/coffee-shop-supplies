import { useMemo, useState } from 'react';
import { Controls } from './components/Controls.jsx';
import { FooterBar } from './components/FooterBar.jsx';
import { Hero } from './components/Hero.jsx';
import { MenuPanel } from './components/MenuPanel.jsx';
import { CoffeePanel, ExtraExpensesPanel, ResultsPanel, WishlistPanel } from './components/ResultsPanel.jsx';
import { ShoppingList } from './components/ShoppingList.jsx';
import { DEFAULT_CUPS_PER_DAY, MENU_ITEMS } from './data/constants.js';
import { useBoughtItems } from './hooks/useBoughtItems.js';
import { compute } from './utils/calc.js';
import { parseCupsPerDay, parseDays, parseNonNegative } from './utils/format.js';

export default function App() {
  const [days, setDays] = useState(14);
  const [reserve, setReserve] = useState(0.15);
  const [takeaway, setTakeaway] = useState(0.7);
  const [cupsPerDay, setCupsPerDay] = useState(DEFAULT_CUPS_PER_DAY);
  const [menu, setMenu] = useState(MENU_ITEMS);
  const { bought, toggleBought } = useBoughtItems();

  const rows = useMemo(
    () => menu.map((item) => ({ ...item, total: item.daily * days })),
    [menu, days],
  );

  const data = useMemo(
    () => compute(rows, { days, reserve, takeaway }),
    [rows, days, reserve, takeaway],
  );

  function handleDailyChange(id, value) {
    const daily = parseNonNegative(value);
    setMenu((current) => current.map((item) => (
      item.id === id ? { ...item, daily } : item
    )));
  }

  return (
    <main className="wrap">
      <Hero days={days} />
      <Controls
        days={days}
        reserve={reserve}
        takeaway={takeaway}
        cupsPerDay={cupsPerDay}
        onDaysChange={(value) => setDays(parseDays(value))}
        onReserveChange={(value) => setReserve(Number(value))}
        onTakeawayChange={(value) => setTakeaway(Number(value))}
        onCupsPerDayChange={(value) => setCupsPerDay(parseCupsPerDay(value))}
      />
      <MenuPanel
        rows={rows}
        cupsPerDay={cupsPerDay}
        data={data}
        onDailyChange={handleDailyChange}
      />
      <ResultsPanel data={data} bought={bought} onToggleBought={toggleBought} />
      <ExtraExpensesPanel data={data} bought={bought} onToggleBought={toggleBought} />
      <CoffeePanel data={data} bought={bought} onToggleBought={toggleBought} />
      <WishlistPanel data={data} bought={bought} onToggleBought={toggleBought} />
      <ShoppingList data={data} bought={bought} onToggleBought={toggleBought} />
      <FooterBar />
    </main>
  );
}
