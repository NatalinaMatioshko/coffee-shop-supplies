# Coffee Shop Supplies

A procurement calculator for a café opening order. It turns a drink menu into a two-week shopping list — cups, lids, coffee, milk, and small goods — with pack sizes and prices from real Ukrainian suppliers.

**[Live demo](https://natalinamatioshko.github.io/coffee-shop-supplies/)** · [GitHub](https://github.com/NatalinaMatioshko/coffee-shop-supplies)

## The problem

Opening a coffee shop means guessing how much to buy before the first sale. Cups come in four sizes, lids do not match 1:1, takeaway is not 100% of drinks, and suppliers sell in packs of 15, 30, or 50 — not “exactly what the recipe needs.”

This app is a working tool for that first order: change daily portions, and the purchase list updates with a safety reserve and a total in UAH.

## What it does

- **Menu → cups by size.** Drinks are grouped by cup (110 / 180 / 250 / 340 ml). Only takeaway drinks count toward disposable cups; dine-in is assumed to use ceramic.
- **Lids that actually fit.** 110 ml has no lid. 180 / 250 / 340 ml map to Petrovka models R-71, R-79, and R-80 — not a generic “one lid per cup.”
- **Supplier math.** Quantities round up to real pack sizes. Line totals and a grand total use listed prices from [Petrovka HoReCa](https://petrovka-horeca.com.ua/) (cups, lids, milk, napkins, stirrers, sleeves, carriers) and [3 Champs Roastery](https://3champsroastery.com.ua/) (coffee, matcha, tea, milk-system cleaner).
- **Milk mix.** Cow’s milk, lactose-free, oat, almond, coconut, and banana are split by configurable shares of the recipe milk volume.
- **Hot-only extras.** Sleeves apply to hot takeaway only (not 110 ml). Two-cup and four-cup carriers are estimated from takeaway volume.

Controls: period (default 14 days), waste reserve (10–20%), takeaway share, and a daily-drinks check against the menu sum.

## Design choices

| Decision | Why |
| --- | --- |
| Data catalogs, not a backend | Prices and recipes live in `src/data/` so the shop can edit them without a CMS |
| Recipe grams/ml per drink | Coffee and milk scale from the menu instead of a single “drinks × constant” |
| Pack rounding after reserve | Matches how you actually order: 15% extra, then buy whole packs |
| GitHub Pages | Static React app, no server; every push to `main` deploys |

Prices in the repo are a snapshot from supplier sites. They should be updated when the price list changes.

## Stack

React 19 · Vite 7 · GitHub Actions → GitHub Pages

Logic is separated from UI: `src/utils/calc.js` computes the order; `src/components/` only renders it.

## Run locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://127.0.0.1:5173/`).

```bash
npm run build
npm run preview
```

Edit drinks and cup/lid SKUs in `src/data/constants.js`. Edit milk shares, coffee kilograms, and other supply prices in `src/data/supplies.js`.
