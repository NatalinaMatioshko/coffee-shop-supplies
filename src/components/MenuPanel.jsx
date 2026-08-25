import { formatNumber, recipeLine } from '../utils/format.js';

function MenuItem({ item, onDailyChange }) {
  return (
    <div className="menu-item">
      <h3>{item.emoji} {item.name}</h3>
      <p className="recipe">{recipeLine(item)}</p>
      <div className="menu-row">
        <div>
          <label htmlFor={`daily_${item.id}`}>Порцій на день</label>
          <input
            id={`daily_${item.id}`}
            type="number"
            min="0"
            value={item.daily}
            onChange={(event) => onDailyChange(item.id, event.target.value)}
          />
        </div>
        <div>
          <label htmlFor={`total_${item.id}`}>За період</label>
          <input
            id={`total_${item.id}`}
            type="text"
            readOnly
            value={formatNumber(item.total)}
          />
        </div>
      </div>
    </div>
  );
}

export function MenuPanel({ rows, cupsPerDay, data, onDailyChange }) {
  const delta = data.totalDaily - cupsPerDay;
  const groups = [];

  rows.forEach((item) => {
    const last = groups[groups.length - 1];
    if (!last || last.size !== item.cupSize) {
      groups.push({ size: item.cupSize, items: [item] });
    } else {
      last.items.push(item);
    }
  });

  return (
    <article className="card">
      <h2>Меню напоїв</h2>
      <p className="intro">
        Порції на день множаться на період. Напої згруповані за розміром стакана.
      </p>
      {groups.map((group) => (
        <section className="group" key={group.size}>
          <h3>Стакан {group.size} мл</h3>
          <div className="menu-grid">
            {group.items.map((item) => (
              <MenuItem key={item.id} item={item} onDailyChange={onDailyChange} />
            ))}
          </div>
        </section>
      ))}
      <div className={`summary${delta !== 0 ? ' mismatch' : ''}`}>
        <strong>Сума порцій на день:</strong> {formatNumber(data.totalDaily)}
        {' '}(орієнтир «Напоїв на день»: {formatNumber(cupsPerDay)}
        {delta === 0 ? ', збігається' : `, різниця ${delta > 0 ? '+' : ''}${formatNumber(delta)}`})
        <br />
        <strong>За період:</strong> {formatNumber(data.totalPeriod)} напоїв,
        {' '}із них takeaway ≈ {formatNumber(Math.round(data.totalPeriod * data.takeaway))}.
      </div>
    </article>
  );
}
