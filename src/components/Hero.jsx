import { plural } from '../utils/format.js';

export function Hero({ days }) {
  return (
    <section className="hero">
      <div>
        <h1>Розхідники на 2 тижні</h1>
        <p className="subtitle">
          Вкажіть порції на день — калькулятор збере стакани, кришки, каву, молоко й дрібницю в одне замовлення на період.
        </p>
      </div>
      <div className="badge">
        Період: {days} {plural(days, 'день', 'дні', 'днів')}
      </div>
    </section>
  );
}
