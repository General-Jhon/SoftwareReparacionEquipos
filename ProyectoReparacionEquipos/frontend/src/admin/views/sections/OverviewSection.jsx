function OverviewSection({ counts }) {
  return (
    <section className="overview">
      <div className="kpi-grid">
        <div className="kpi-card"><span>Total órdenes</span><strong>{counts.totalOrdenes}</strong></div>
        <div className="kpi-card"><span>Clientes</span><strong>{counts.totalClientes}</strong></div>
        <div className="kpi-card"><span>Equipos</span><strong>{counts.totalEquipos}</strong></div>
        <div className="kpi-card"><span>Técnicos</span><strong>{counts.totalTecnicos}</strong></div>
        <div className="kpi-card"><span>Grupos</span><strong>{counts.totalGrupos}</strong></div>
        <div className="kpi-card"><span>Pagos</span><strong>{counts.totalPagos}</strong></div>
      </div>
      <div className="alerts-grid">
        <div className="alert-card"><span>Órdenes sin técnico</span><strong>{counts.sinTecnico}</strong></div>
        <div className="alert-card"><span>Órdenes sin grupo</span><strong>{counts.sinGrupo}</strong></div>
        <div className="alert-card"><span>Órdenes con saldo</span><strong>{counts.conSaldo}</strong></div>
      </div>
      <div className="status-grid">
        {Object.entries(counts.byEstado).map(([estado, total]) => (
          <div key={estado} className="status-card">
            <span>{estado}</span>
            <strong>{total}</strong>
          </div>
        ))}
      </div>
    </section>
  )
}

export default OverviewSection
