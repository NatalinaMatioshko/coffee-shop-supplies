import { buildShoppingList } from '../utils/calc.js';
import { formatMoney } from '../utils/format.js';

export function ShoppingList({ data, bought = {}, onToggleBought }) {
  const groups = buildShoppingList(data);
  const items = groups.flatMap((group) => group.items);
  const toBuy = items.reduce((sum, item) => (
    sum + (bought[item.id] ? 0 : item.cost || 0)
  ), 0);
  const alreadyBought = items.reduce((sum, item) => (
    sum + (bought[item.id] ? item.cost || 0 : 0)
  ), 0);

  if (!items.length) return null;

  return (
    <article className="card extra-card shopping-list">
      <h2>Список покупок</h2>
      <p className="intro">
        Усі позиції одним списком. Галочка тут і на картках вище — та сама, зберігається в браузері.
      </p>
      {groups.map((group) => (
        <section className="shop-group" key={group.title}>
          <h3>{group.title}</h3>
          <ul className="shop-rows">
            {group.items.map((item) => {
              const isBought = Boolean(bought[item.id]);
              const checkId = `shop-${item.id}`;
              return (
                <li key={item.id} className={isBought ? 'is-bought' : ''}>
                  <label htmlFor={checkId}>
                    <input
                      id={checkId}
                      type="checkbox"
                      checked={isBought}
                      onChange={() => onToggleBought?.(item.id)}
                    />
                    <span className="shop-name">
                      {item.title}
                      {item.amount ? <small>{item.amount}</small> : null}
                    </span>
                    <span className="shop-price">{item.price || formatMoney(item.cost || 0)}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      <div className="shop-totals">
        <div className="shop-total to-buy">
          <span>Треба купити</span>
          <strong>{formatMoney(toBuy)}</strong>
        </div>
        <div className="shop-total bought-sum">
          <span>Уже придбано</span>
          <strong>{formatMoney(alreadyBought)}</strong>
        </div>
      </div>
    </article>
  );
}
