function OrdenesSection({
  isAdmin,
  OrdenCreateForm,
  clientes,
  equipos,
  estados,
  tecnicos,
  grupos,
  onCreateOrden,
  ordenSearch,
  setOrdenSearch,
  ordenEstado,
  setOrdenEstado,
  ordenTecnico,
  setOrdenTecnico,
  ordenGrupo,
  setOrdenGrupo,
  ordenSoloPendientes,
  setOrdenSoloPendientes,
  filteredOrdenes,
  onUpdateOrdenEstado,
  onUpdateOrdenTecnico,
  setViewOrden,
  setEditOrden,
  onDeleteOrden,
}) {
  return (
    <section className="panel">
      <h2>Órdenes</h2>
      {isAdmin ? (
        <OrdenCreateForm
          clientes={clientes}
          equipos={equipos}
          estados={estados}
          tecnicos={tecnicos}
          grupos={grupos}
          onCreate={onCreateOrden}
        />
      ) : null}
      <div className="filters">
        <input placeholder="Buscar por código, cliente o equipo" value={ordenSearch} onChange={(e) => setOrdenSearch(e.target.value)} />
        <select value={ordenEstado} onChange={(e) => setOrdenEstado(e.target.value)}>
          <option value="">Estado</option>
          {estados.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
        </select>
        <select value={ordenTecnico} onChange={(e) => setOrdenTecnico(e.target.value)}>
          <option value="">Técnico</option>
          {tecnicos.map((t) => <option key={t.id} value={t.id}>{t.nombre} {t.apellido}</option>)}
        </select>
        <select value={ordenGrupo} onChange={(e) => setOrdenGrupo(e.target.value)}>
          <option value="">Grupo</option>
          {grupos.map((g) => <option key={g.id} value={g.id}>{g.nombre}</option>)}
        </select>
        <label className="inline-toggle">
          <input type="checkbox" checked={ordenSoloPendientes} onChange={(e) => setOrdenSoloPendientes(e.target.checked)} />
          <span>Ocultar entregadas</span>
        </label>
      </div>
      <div className="table">
        <div className="row head orders-row">
          <span>Código</span><span>Cliente</span><span>Equipo</span><span>Estado</span><span>Técnico</span><span>Acciones</span>
        </div>
        {filteredOrdenes.map((o) => (
          <div className="row orders-row" key={o.id}>
            <span>{o.codigo}</span>
            <span>{o.cliente_nombre} {o.cliente_apellido}</span>
            <span>{o.marca} {o.modelo}</span>
            <span>
              <select className="inline-select" value={o.estado_id} onChange={(e) => onUpdateOrdenEstado(o, Number(e.target.value))}>
                {estados.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
              </select>
            </span>
            <span>
              <select className="inline-select" value={o.tecnico_id || ''} onChange={(e) => onUpdateOrdenTecnico(o, e.target.value ? Number(e.target.value) : null)}>
                <option value="">Sin técnico</option>
                {tecnicos.map((t) => <option key={t.id} value={t.id}>{t.nombre} {t.apellido}</option>)}
              </select>
            </span>
            {isAdmin ? (
              <span className="row-actions">
                <button className="ghost-button" onClick={() => setViewOrden(o)}>Detalle</button>
                <button className="ghost-button" onClick={() => setEditOrden(o)}>Editar</button>
                <button className="danger-button" onClick={() => onDeleteOrden(o.id)}>Eliminar</button>
              </span>
            ) : (
              <span>—</span>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

export default OrdenesSection
