import { buildResultGroups } from '../utils/calc.js';
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
    <article className="card">
      <h2>Що закупити</h2>
      <p className="intro">Кількості з запасом і округлені до фасовки. Ціни — Petrovka HoReCa та 3 Champs.</p>
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
              <p>Стакани, кришки, 3 Champs, молоко та дрібниця на період</p>
            </div>
            <p className="amount">{formatMoney(data.grandTotal)}</p>
          </div>
        ) : null}
      </div>
    </article>
  );
}
