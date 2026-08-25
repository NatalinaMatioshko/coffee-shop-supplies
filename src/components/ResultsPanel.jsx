import { CHAMPS_URL, PETROVKA_URL } from '../data/supplies.js';
import { buildCoffeeItem, buildExtraItems, buildResultGroups } from '../utils/calc.js';
import { formatMoney } from '../utils/format.js';

function ResultItem({ item }) {
  return (
    <article className="item">
      <div className="item-top">
        <h4>{item.title}</h4>
        <span className="emoji">{item.emoji}</span>
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
    </article>
  );
}

export function ResultsPanel({ data }) {
  const groups = buildResultGroups(data);

  return (
    <article className="card results-card">
      <h2>Що закупити</h2>
      <p className="intro">Кількості з запасом і округлені до фасовки. Кава в зернах — окремо в кінці сторінки.</p>
      <div>
        {groups.map((group) => (
          <section className="group" key={group.title}>
            <h3>{group.title}</h3>
            <div className="items">
              {group.items.map((item) => (
                <ResultItem key={item.title} item={item} />
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

export function ExtraExpensesPanel({ data }) {
  const items = buildExtraItems(data);

  if (!items.length) return null;

  return (
    <article className="card extra-card">
      <h2>Додаткові розходи</h2>
      <p className="intro">
        Гігієна, клінінг і пакування їжі. Орієнтир на тиждень, окремо від напоїв вище. Ціни — Petrovka HoReCa.
      </p>
      <section className="group">
        <div className="items">
          {items.map((item) => (
            <ResultItem key={item.title} item={item} />
          ))}
        </div>
        {data.extraCost > 0 ? (
          <div className="price-total extra-total">
            <div>
              <strong>Сума додаткових розходів</strong>
              <p>Ганчірки, рукавички, хімія, пакування, мило і папір</p>
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

export function CoffeePanel({ data }) {
  const item = buildCoffeeItem(data);

  if (!item) return null;

  return (
    <article className="card extra-card coffee-card">
      <h2>Кава в зернах</h2>
      <p className="intro">
        Окремо від розхідників. Закупівля 3 Champs: не менше орієнтира закладу на період.
      </p>
      <section className="group">
        <div className="items coffee-items">
          <ResultItem item={item} />
        </div>
        {data.coffeeCost > 0 ? (
          <div className="price-total">
            <div>
              <strong>Сума за каву в зернах</strong>
              <p>{item.detail[0]}</p>
              <a href={CHAMPS_URL} target="_blank" rel="noreferrer">
                Відкрити 3champsroastery.com.ua
              </a>
            </div>
            <p className="amount">{formatMoney(data.coffeeCost)}</p>
          </div>
        ) : null}
        {data.combinedTotal > 0 ? (
          <div className="price-total">
            <div>
              <strong>Разом усе</strong>
              <p>Розхідники, додаткові розходи і кава в зернах на період</p>
            </div>
            <p className="amount">{formatMoney(data.combinedTotal)}</p>
          </div>
        ) : null}
      </section>
    </article>
  );
}
