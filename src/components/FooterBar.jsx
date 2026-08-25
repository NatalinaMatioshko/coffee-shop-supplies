export function FooterBar() {
  return (
    <section className="footer-card card">
      <p>
        <strong>Порада:</strong> після першого тижня під реальні продажі скоригуйте порції.
        У залі керамічний посуд — тому стакани й кришки рахуються лише від частки «із собою».
      </p>
      <button type="button" onClick={() => window.print()}>
        Зберегти / Друк
      </button>
    </section>
  );
}
