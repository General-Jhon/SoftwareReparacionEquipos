function PagosSection({
  pagosStats,
  pagoSearch,
  setPagoSearch,
  pagoMetodo,
  setPagoMetodo,
  pagoMetodos,
  pagoDesde,
  setPagoDesde,
  pagoHasta,
  setPagoHasta,
  exportPagosCsv,
  filteredPagos,
}) {
  return (
    <section className="panel">
      <h2>Pagos</h2>
      <div className="kpi-grid">
        <div className="kpi-card"><span>Total filtrado</span><strong>${pagosStats.total.toLocaleString('es-CO')}</strong></div>
        <div className="kpi-card"><span>Total hoy</span><strong>${pagosStats.totalHoy.toLocaleString('es-CO')}</strong></div>
        <div className="kpi-card"><span>Promedio ticket</span><strong>${pagosStats.promedio.toLocaleString('es-CO', { maximumFractionDigits: 0 })}</strong></div>
        <div className="kpi-card"><span>Cantidad</span><strong>{pagosStats.cantidad}</strong></div>
      </div>
      <div className="filters">
        <input placeholder="Buscar por orden, cliente o referencia" value={pagoSearch} onChange={(e) => setPagoSearch(e.target.value)} />
        <select value={pagoMetodo} onChange={(e) => setPagoMetodo(e.target.value)}>
          <option value="">Método</option>
          {pagoMetodos.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <input type="date" value={pagoDesde} onChange={(e) => setPagoDesde(e.target.value)} />
        <input type="date" value={pagoHasta} onChange={(e) => setPagoHasta(e.target.value)} />
        <button className="ghost-button" onClick={exportPagosCsv}>Exportar CSV</button>
      </div>
      <div className="table">
        <div className="row head pagos-row">
          <span>Orden</span><span>Cliente</span><span>Método</span><span>Valor</span><span>Referencia</span><span>Registrado por</span><span>Fecha</span>
        </div>
        {filteredPagos.map((p) => (
          <div className="row pagos-row" key={p.id}>
            <span>#{p.orden_id}</span>
            <span>{p.cliente_nombre} {p.cliente_apellido}</span>
            <span>{p.metodo}</span>
            <span>${Number(p.valor).toLocaleString('es-CO')}</span>
            <span>{p.referencia || '—'}</span>
            <span>{p.usuario_nombre ? `${p.usuario_nombre} ${p.usuario_apellido}` : 'Sistema'}</span>
            <span>{new Date(p.fecha).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default PagosSection
