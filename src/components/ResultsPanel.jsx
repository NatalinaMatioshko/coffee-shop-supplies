import { KYIV_FORECAST } from '../data/constants.js';
import { CHAMPS_URL, PETROVKA_URL } from '../data/supplies.js';
import { buildCoffeeItems, buildExtraItems, buildResultGroups, buildWishlistItems } from '../utils/calc.js';
import { formatMoney, formatNumber, plural } from '../utils/format.js';
import { Icon } from './Icon.jsx';

function ResultItem({ item, bought, onToggleBought }) {
  const isBought = Boolean(bought?.[item.id]);
  const checkId = `bought-${item.id}`;

  return (
    <article className={`item${isBought ? ' is-bought' : ''}`}>
      <div className="item-top">
        <div className="item-heading">
          <h4>{item.title}</h4>
          <label className="bought-toggle" htmlFor={checkId}>
            <input
              id={checkId}
              type="checkbox"
              checked={isBought}
              onChange={() => onToggleBought?.(item.id)}
            />
            {isBought ? 'Придбано' : 'Не придбано'}
          </label>
        </div>
        <Icon name={item.icon} className="icon item-icon" />
      </div>
      <p className="amount">{item.amount}</p>
      {item.price ? <p className="item-price">{item.price}</p> : null}
      <p className="detail">
        {item.detail.map((line, index) => (
          <span key={line}>
            {index > 0 ? <br /> : null}
            {line}
          </span>
        ))}
      </p>
      {item.url ? (
        <a className="item-link" href={item.url} target="_blank" rel="noreferrer">
          Відкрити товар
        </a>
      ) : null}
    </article>
  );
}

export function ResultsPanel({ data, bought, onToggleBought }) {
  const groups = buildResultGroups(data);

  return (
    <article className="card results-card">
      <h2>Що закупити</h2>
      <p className="intro">Закупівля округлена вгору до фасовки, як продають Petrovka і 3 Champs. Кава під еспресо і під фільтр — окремо в кінці. Галочка «придбано» зберігається в цьому браузері.</p>
      <div>
        {groups.map((group) => (
          <section className="group" key={group.title}>
            <h3>{group.title}</h3>
            <div className="items">
              {group.items.map((item) => (
                <ResultItem
                  key={item.id || item.title}
                  item={item}
                  bought={bought}
                  onToggleBought={onToggleBought}
                />
              ))}
            </div>
            {group.total ? (
              <div className="price-total">
                <div>
                  <strong>{group.total.label}</strong>
                  <p>{group.total.hint}</p>
                  <a href={group.total.href} target="_blank" rel="noreferrer">
                    {group.total.linkLabel}
                  </a>
                </div>
                <p className="amount">{group.total.amount}</p>
              </div>
            ) : null}
          </section>
        ))}
        {data.grandTotal > 0 ? (
          <div className="price-total">
            <div>
              <strong>Разом за всі розхідники</strong>
              <p>Стакани, кришки, матча, чай, молоко та дрібниця. Без кави в зернах</p>
            </div>
            <p className="amount">{formatMoney(data.grandTotal)}</p>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function ExtraExpensesPanel({ data, bought, onToggleBought }) {
  const items = buildExtraItems(data);

  if (!items.length) return null;

  return (
    <article className="card extra-card">
      <h2>Додаткові розходи</h2>
      <p className="intro">
        Гігієна, клінінг і пакування їжі. Округлення до фасовки Petrovka, окремо від напоїв вище.
      </p>
      <section className="group">
        <div className="items">
          {items.map((item) => (
            <ResultItem
              key={item.id || item.title}
              item={item}
              bought={bought}
              onToggleBought={onToggleBought}
            />
          ))}
        </div>
        {data.extraCost > 0 ? (
          <div className="price-total extra-total">
            <div>
              <strong>Сума додаткових розходів</strong>
              <p>Ганчірки, рукавички, хімія, вологі серветки, паперові рушники, пакування, мило і папір</p>
              <a href={PETROVKA_URL} target="_blank" rel="noreferrer">
                Каталог Petrovka HoReCa
              </a>
            </div>
            <p className="amount">{formatMoney(data.extraCost)}</p>
          </div>
        ) : null}
      </section>
    </article>
  );
}

export function CoffeePanel({ data, bought, onToggleBought }) {
  const items = buildCoffeeItems(data);
  const coffeeKg = (data.coffeeEspresso.buy + data.coffeeFilter.buy) / 1000;

  return (
    <article className="card extra-card coffee-card">
      <h2>Кава в зернах</h2>
      <p className="intro">
        Окремо під еспресо і під фільтр. Кількість з меню, плюс запас, плюс округлення до 1 кг
        (мінімум 2 кг на тип). Прогноз чашок — для спешалті-кав’ярні в Києві.
      </p>
      <div className="forecast-grid">
        {KYIV_FORECAST.map((item) => (
          <div className="forecast-item" key={item.id}>
            <strong>{item.label}: {item.cups}</strong>
            <span>{item.note}</span>
          </div>
        ))}
      </div>
      <p className="forecast-note">
        Це меню: <strong>{formatNumber(data.totalDaily)} {plural(data.totalDaily, 'чашка', 'чашки', 'чашок')}/день</strong>
        {' '}({formatNumber(data.espressoDaily)} {plural(data.espressoDaily, 'еспресо-напій', 'еспресо-напої', 'еспресо-напоїв')}, {formatNumber(data.filterDaily)} фільтр, {formatNumber(data.otherDaily)} без кави)
        — у середньому діапазоні 50–70. З запасом 20% зручний орієнтир замовлення: 10 кг еспресо + 5 кг фільтр.
      </p>
      {items.length ? (
        <section className="group">
          <div className="items coffee-items">
            {items.map((item) => (
              <ResultItem
                key={item.id || item.title}
                item={item}
                bought={bought}
                onToggleBought={onToggleBought}
              />
            ))}
          </div>
          {data.coffeeCost > 0 ? (
            <div className="price-total coffee-total">
              <div>
                <strong>Сума за каву в зернах</strong>
                <p>
                  Замовити {formatNumber(coffeeKg)} кг: {formatNumber(data.coffeeEspresso.packs)} кг еспресо
                  {' '}і {formatNumber(data.coffeeFilter.packs)} кг фільтр
                </p>
                <a href={CHAMPS_URL} target="_blank" rel="noreferrer">
                  Відкрити 3champsroastery.com.ua
                </a>
              </div>
              <p className="amount">{formatMoney(data.coffeeCost)}</p>
            </div>
          ) : null}
          {data.combinedTotal > 0 ? (
            <div className="price-total combined-total">
              <div>
                <strong>Разом усе</strong>
                <p>Розхідники, додаткові розходи і кава в зернах на період</p>
              </div>
              <p className="amount">{formatMoney(data.combinedTotal)}</p>
            </div>
          ) : null}
        </section>
      ) : null}
    </article>
  );
}

export function WishlistPanel({ data, bought = {}, onToggleBought }) {
  const items = buildWishlistItems(data);
  const remainingCost = items.reduce((sum, item) => (
    sum + (bought[item.id] ? 0 : item.cost || 0)
  ), 0);
  const boughtCount = items.filter((item) => bought[item.id]).length;

  if (!items.length) return null;

  return (
    <article className="card extra-card wishlist-card">
      <h2>Wish list</h2>
      <p className="intro">
        На майбутнє, не входить у суми вище. Позначте, що вже купили — відмітки залишаться в цьому браузері.
      </p>
      <section className="group">
        <div className="items">
          {items.map((item) => (
            <ResultItem
              key={item.id || item.title}
              item={item}
              bought={bought}
              onToggleBought={onToggleBought}
            />
          ))}
        </div>
        {data.wishlistCost > 0 ? (
          <div className="price-total wishlist-total">
            <div>
              <strong>Орієнтир wish list — не в сумі</strong>
              <p>
                Пакети для сміття, набір і сито для матчі, заварник, холдер і додаткові чаї 3 Champs.
                {' '}Придбано {formatNumber(boughtCount)} з {formatNumber(items.length)},
                залишилось {formatMoney(remainingCost)}.
              </p>
              <a href={PETROVKA_URL} target="_blank" rel="noreferrer">
                Каталог Petrovka HoReCa
              </a>
            </div>
            <p className="amount">{formatMoney(data.wishlistCost)}</p>
          </div>
        ) : null}
      </section>
    </article>
  );
}
