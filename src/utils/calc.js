import {
  CUP_CATALOG,
  CUP_SOURCE,
  LID_CATALOG,
  LID_SOURCE,
  PACK,
} from '../data/constants.js';
import {
  CHAMPS,
  CHAMPS_URL,
  PETROVKA_URL,
  SUPPLIES,
  USAGE,
} from '../data/supplies.js';
import { formatMoney, formatNumber, formatOne } from './format.js';

export function roundUp(value, step = 1) {
  if (value <= 0) return 0;
  return Math.ceil(value / step) * step;
}

function bump(map, key, amount, extra) {
  if (!map[key]) map[key] = { key, total: 0, ...extra };
  map[key].total += amount;
}

function line(needed, pack) {
  const buy = roundUp(needed, pack);
  return { needed, buy, packs: pack ? buy / pack : 0 };
}

function priced(needed, catalog) {
  const qty = line(needed, catalog.pack);
  return {
    ...qty,
    pack: catalog.pack,
    packPrice: catalog.packPrice,
    unitPrice: catalog.unitPrice,
    sku: catalog.sku,
    title: catalog.title,
    url: catalog.url,
    cost: qty.packs * catalog.packPrice,
  };
}

function supplyCard(item, extraDetail = []) {
  if (!item || item.buy <= 0) return null;
  return {
    title: item.title,
    emoji: item.emoji || '📦',
    amount: item.amount,
    price: item.cost > 0 ? formatMoney(item.cost) : '',
    detail: extraDetail.filter(Boolean),
  };
}

export function compute(rows, { days, reserve, takeaway }) {
  const cups = {};
  const lids = {};
  let coffeeFromMenuG = 0;
  let milkMl = 0;
  let teaCups = 0;
  let napkins = 0;
  let stirrers = 0;
  let sugar = 0;
  let sleeves = 0;
  let takeawayDrinks = 0;
  let takeawayHot = 0;

  rows.forEach((row) => {
    const takeawayQty = row.total * takeaway;
    takeawayDrinks += takeawayQty;
    coffeeFromMenuG += (row.coffeeG || 0) * row.total;
    milkMl += (row.milkMl || 0) * row.total;
    teaCups += (row.teaBags || 0) * row.total;
    napkins += row.total * USAGE.napkinPerDrink;
    sugar += row.total * USAGE.sugarShare;

    if (row.daily > 0 && takeawayQty > 0) {
      bump(cups, row.cupSize, takeawayQty, { size: row.cupSize, names: [] });
      if (!cups[row.cupSize].names.includes(row.name)) {
        cups[row.cupSize].names.push(row.name);
      }
      if (row.lidId) {
        bump(lids, row.lidId, takeawayQty, { lidId: row.lidId, names: [] });
        if (!lids[row.lidId].names.includes(row.name)) {
          lids[row.lidId].names.push(row.name);
        }
      }
    }

    if (row.hot) {
      stirrers += takeawayQty;
      if (row.cupSize !== 110) sleeves += takeawayQty;
      takeawayHot += takeawayQty;
    }
  });

  const add = (value) => value * (1 + reserve);
  const totalDaily = rows.reduce((sum, row) => sum + row.daily, 0);
  const totalPeriod = rows.reduce((sum, row) => sum + row.total, 0);
  const scale14 = days / 14;

  const pricedCups = Object.values(cups)
    .sort((a, b) => a.size - b.size)
    .map((cup) => {
      const catalog = CUP_CATALOG[cup.size];
      const pack = catalog?.pack ?? PACK.cup;
      const qty = line(add(cup.total), pack);
      const cost = catalog ? qty.packs * catalog.packPrice : 0;
      return {
        ...cup,
        ...qty,
        pack,
        sku: catalog?.sku,
        unitPrice: catalog?.unitPrice ?? 0,
        packPrice: catalog?.packPrice ?? 0,
        lidId: catalog?.lidId ?? null,
        cost,
      };
    });

  const pricedLids = Object.values(lids)
    .map((lid) => {
      const catalog = LID_CATALOG[lid.lidId];
      const pack = catalog?.pack ?? PACK.lid;
      const qty = line(add(lid.total), pack);
      const cost = catalog ? qty.packs * catalog.packPrice : 0;
      return {
        ...lid,
        ...qty,
        pack,
        title: catalog?.title ?? lid.lidId,
        forCups: catalog?.forCups ?? '',
        diameter: catalog?.diameter,
        sku: catalog?.sku,
        unitPrice: catalog?.unitPrice ?? 0,
        packPrice: catalog?.packPrice ?? 0,
        url: catalog?.url,
        cost,
      };
    })
    .sort((a, b) => (a.diameter ?? 0) - (b.diameter ?? 0));

  const coffeeMenuKg = add(coffeeFromMenuG) / 1000;
  const coffeePlanKg = CHAMPS.coffeeKgPer14Days * scale14;
  const coffee = priced(Math.max(coffeeMenuKg, coffeePlanKg) * 1000, CHAMPS.coffee);

  const matcha = priced(CHAMPS.matchaGPer14Days * scale14, CHAMPS.matcha);
  const tea = priced(add(teaCups * USAGE.teaGPerCup), CHAMPS.tea);
  const milkCleaner = priced(Math.max(1, Math.ceil(scale14)), CHAMPS.milkCleaner);

  const milkNeeded = add(milkMl);
  const milks = [
    { key: 'regular', share: USAGE.milk.regular, catalog: SUPPLIES.milkRegular, emoji: '🥛' },
    { key: 'lactoseFree', share: USAGE.milk.lactoseFree, catalog: SUPPLIES.milkLactoseFree, emoji: '🥛' },
    { key: 'oat', share: USAGE.milk.oat, catalog: SUPPLIES.milkOat, emoji: '🌾' },
    { key: 'almond', share: USAGE.milk.almond, catalog: SUPPLIES.milkAlmond, emoji: '🌰' },
    { key: 'coconut', share: USAGE.milk.coconut, catalog: SUPPLIES.milkCoconut, emoji: '🥥' },
    { key: 'banana', share: USAGE.milk.banana, catalog: SUPPLIES.milkBanana, emoji: '🍌' },
  ].map((entry) => ({
    ...priced(milkNeeded * entry.share, entry.catalog),
    share: entry.share,
    emoji: entry.emoji,
  }));

  const napkin = priced(add(napkins), SUPPLIES.napkin);
  const stirrer = priced(add(stirrers), SUPPLIES.stirrer);
  const sugarItem = priced(add(sugar), SUPPLIES.sugar);
  const sleeve = priced(add(sleeves), SUPPLIES.sleeve);
  const carrier2 = priced(add(takeawayDrinks * USAGE.carrier2Share / 2), SUPPLIES.carrier2);
  const carrier4 = priced(add(takeawayDrinks * USAGE.carrier4Share / 4), SUPPLIES.carrier4);

  const cupsCost = pricedCups.reduce((sum, cup) => sum + cup.cost, 0);
  const lidsCost = pricedLids.reduce((sum, lid) => sum + lid.cost, 0);
  const champsCost = coffee.cost + matcha.cost + tea.cost + milkCleaner.cost;
  const milkCost = milks.reduce((sum, item) => sum + item.cost, 0);
  const smallCost = napkin.cost + stirrer.cost + sugarItem.cost + sleeve.cost + carrier2.cost + carrier4.cost;

  return {
    days,
    reserve,
    takeaway,
    totalDaily,
    totalPeriod,
    takeawayDrinks: add(takeawayDrinks),
    takeawayHot: add(takeawayHot),
    cups: pricedCups,
    cupsCost,
    lids: pricedLids,
    lidsCost,
    coffee,
    coffeeMenuKg,
    matcha,
    tea,
    milkCleaner,
    milks,
    napkin,
    stirrer,
    sugar: sugarItem,
    sleeve,
    carrier2,
    carrier4,
    champsCost,
    milkCost,
    smallCost,
    grandTotal: cupsCost + lidsCost + champsCost + milkCost + smallCost,
  };
}

export function buildResultGroups(data) {
  const reservePct = Math.round(data.reserve * 100);

  const cups = data.cups
    .filter((cup) => cup.buy > 0)
    .map((cup) => ({
      title: `Стакан ${cup.size} мл`,
      emoji: '🥤',
      amount: `${formatNumber(cup.buy)} шт.`,
      price: cup.cost > 0 ? formatMoney(cup.cost) : '',
      detail: [
        `Напої: ${cup.names.join(', ')}`,
        `Потрібно ${formatNumber(Math.round(cup.needed))} · запас ${reservePct}% · ${formatNumber(cup.packs)} уп. по ${cup.pack} шт.`,
        `${formatMoney(cup.unitPrice)}/шт · ${formatMoney(cup.packPrice)} за упаковку · арт. ${cup.sku}`,
        cup.lidId ? `Кришка: ${LID_CATALOG[cup.lidId]?.title}` : 'Кришки для 110 мл немає',
      ],
    }));

  const lids = data.lids
    .filter((lid) => lid.buy > 0)
    .map((lid) => ({
      title: `${lid.title} · ${lid.forCups}`,
      emoji: '🔘',
      amount: `${formatNumber(lid.buy)} шт.`,
      price: lid.cost > 0 ? formatMoney(lid.cost) : '',
      detail: [
        `Напої: ${lid.names.join(', ')}`,
        `Потрібно ${formatNumber(Math.round(lid.needed))} · запас ${reservePct}% · ${formatNumber(lid.packs)} уп. по ${lid.pack} шт.`,
        `${formatMoney(lid.unitPrice)}/шт · ${formatMoney(lid.packPrice)} за упаковку · арт. ${lid.sku}`,
      ],
    }));

  const champs = [
    supplyCard({
      ...data.coffee,
      emoji: '☕',
      amount: `${formatOne(data.coffee.buy / 1000)} кг`,
    }, [
      `Орієнтир закладу: ${CHAMPS.coffeeKgRange} / 14 днів`,
      `З меню ≈ ${formatOne(data.coffeeMenuKg)} кг · ${formatNumber(data.coffee.packs)} кг × ${formatMoney(data.coffee.packPrice)}`,
      CHAMPS.coffee.note,
    ]),
    supplyCard({
      ...data.matcha,
      emoji: '🍵',
      amount: `${formatNumber(data.matcha.buy)} г`,
    }, [
      `Орієнтир закладу: ${CHAMPS.matchaGRange} / 14 днів`,
      `${formatNumber(data.matcha.packs)} уп. по ${data.matcha.pack} г × ${formatMoney(data.matcha.packPrice)}`,
      CHAMPS.matcha.note,
    ]),
    supplyCard({
      ...data.tea,
      emoji: '🫖',
      amount: `${formatNumber(data.tea.buy)} г`,
    }, [
      `${USAGE.teaGPerCup} г на порцію чаю · потрібно ${formatNumber(Math.round(data.tea.needed))} г`,
      `${formatNumber(data.tea.packs)} уп. по ${data.tea.pack} г × ${formatMoney(data.tea.packPrice)}`,
    ]),
    supplyCard({
      ...data.milkCleaner,
      emoji: '🧴',
      amount: `${formatNumber(data.milkCleaner.buy)} шт.`,
    }, [
      '0,5 л на період · очищення стімера',
      `${formatMoney(data.milkCleaner.packPrice)} / пляшка`,
    ]),
  ].filter(Boolean);

  const milks = data.milks
    .filter((item) => item.buy > 0)
    .map((item) => supplyCard({
      ...item,
      amount: `${formatNumber(item.buy / 1000)} л`,
    }, [
      `${Math.round(item.share * 100)}% від молочних напоїв`,
      `Потрібно ${formatOne(item.needed / 1000)} л · ${formatNumber(item.packs)} л × ${formatMoney(item.packPrice)}`,
    ]));

  const small = [
    supplyCard({
      ...data.sleeve,
      emoji: '🧣',
      amount: `${formatNumber(data.sleeve.buy)} шт.`,
    }, [
      'Лише гарячі takeaway, без стаканів 110 мл',
      `Потрібно ${formatNumber(Math.round(data.sleeve.needed))} · ${formatNumber(data.sleeve.packs)} уп. по ${data.sleeve.pack}`,
    ]),
    supplyCard({
      ...data.napkin,
      emoji: '🤍',
      amount: `${formatNumber(data.napkin.buy)} шт.`,
    }, [
      `${USAGE.napkinPerDrink} на напій`,
      `Потрібно ${formatNumber(Math.round(data.napkin.needed))} · ${formatNumber(data.napkin.packs)} уп. по ${formatNumber(data.napkin.pack)}`,
    ]),
    supplyCard({
      ...data.stirrer,
      emoji: '🪵',
      amount: `${formatNumber(data.stirrer.buy)} шт.`,
    }, [
      'Гарячі takeaway',
      `Потрібно ${formatNumber(Math.round(data.stirrer.needed))} · ${formatNumber(data.stirrer.packs)} уп. по ${data.stirrer.pack}`,
    ]),
    supplyCard({
      ...data.sugar,
      emoji: '🍬',
      amount: `${formatNumber(data.sugar.buy)} шт.`,
    }, [
      `${Math.round(USAGE.sugarShare * 100)}% напоїв, стіки 5 г`,
      `Потрібно ${formatNumber(Math.round(data.sugar.needed))} · ${formatNumber(data.sugar.packs)} уп. по ${data.sugar.pack}`,
    ]),
    supplyCard({
      ...data.carrier2,
      emoji: '📦',
      amount: `${formatNumber(data.carrier2.buy)} шт.`,
    }, [
      `${Math.round(USAGE.carrier2Share * 100)}% takeaway як замовлення на 2`,
      `Потрібно ${formatNumber(Math.round(data.carrier2.needed))} · ${formatNumber(data.carrier2.packs)} уп. по ${data.carrier2.pack}`,
    ]),
    supplyCard({
      ...data.carrier4,
      emoji: '📦',
      amount: `${formatNumber(data.carrier4.buy)} шт.`,
    }, [
      `${Math.round(USAGE.carrier4Share * 100)}% takeaway як замовлення на 4`,
      `Потрібно ${formatNumber(Math.round(data.carrier4.needed))} · ${formatNumber(data.carrier4.packs)} уп. по ${data.carrier4.pack}`,
    ]),
  ].filter(Boolean);

  return [
    {
      title: 'Стакани (лише із собою)',
      items: cups,
      total: data.cupsCost > 0 ? {
        label: 'Сума за всі стакани',
        amount: formatMoney(data.cupsCost),
        hint: `${CUP_SOURCE.note}. Джерело: ${CUP_SOURCE.name}`,
        href: CUP_SOURCE.url,
        linkLabel: 'Прайс стаканів Petrovka',
      } : null,
    },
    {
      title: 'Кришки (без 110 мл)',
      items: lids,
      total: data.lidsCost > 0 ? {
        label: 'Сума за всі кришки',
        amount: formatMoney(data.lidsCost),
        hint: `${LID_SOURCE.note}. Джерело: ${LID_SOURCE.name}`,
        href: LID_SOURCE.url,
        linkLabel: 'Прайс кришок Petrovka',
      } : null,
    },
    {
      title: '3 Champs — кава, матча, чай, хімія',
      items: champs,
      total: data.champsCost > 0 ? {
        label: 'Сума 3 Champs',
        amount: formatMoney(data.champsCost),
        hint: 'Кава 33–35 кг, матча 180–280 г на 14 днів',
        href: CHAMPS_URL,
        linkLabel: 'Відкрити 3champsroastery.com.ua',
      } : null,
    },
    {
      title: 'Молоко',
      items: milks,
      total: data.milkCost > 0 ? {
        label: 'Сума за молоко',
        amount: formatMoney(data.milkCost),
        hint: 'Звичайне, безлактозне та рослинні Alpro',
        href: 'https://petrovka-horeca.com.ua/uk/moloko-slivki/',
        linkLabel: 'Прайс молока Petrovka',
      } : null,
    },
    {
      title: 'Дрібні розхідники',
      items: small,
      total: data.smallCost > 0 ? {
        label: 'Сума за дрібницю',
        amount: formatMoney(data.smallCost),
        hint: 'Серветки, мішалки, цукор, манжети, тримачі',
        href: PETROVKA_URL,
        linkLabel: 'Каталог Petrovka HoReCa',
      } : null,
    },
  ].filter((group) => group.items.length > 0);
}
