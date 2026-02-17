function EquiposSection({
  isAdmin,
  EquipoForm,
  clientes,
  tipos,
  onCreateEquipo,
  equipoSearch,
  setEquipoSearch,
  filteredEquipos,
  setEditEquipo,
  onDeleteEquipo,
}) {
  return (
    <section className="panel">
      <h2>Equipos</h2>
      {isAdmin ? <EquipoForm clientes={clientes} tipos={tipos} onCreate={onCreateEquipo} /> : null}
      <div className="filters">
        <input placeholder="Buscar equipo por serie, marca o cliente" value={equipoSearch} onChange={(e) => setEquipoSearch(e.target.value)} />
      </div>
      <div className="table">
        <div className="row head equipos-row">
          <span>Serie</span><span>Marca</span><span>Modelo</span><span>Cliente</span><span>Tipo</span><span>Acciones</span>
        </div>
        {filteredEquipos.map((e) => (
          <div className="row equipos-row" key={e.id}>
            <span>{e.serie}</span>
            <span>{e.marca}</span>
            <span>{e.modelo || '—'}</span>
            <span>{e.cliente_nombre} {e.cliente_apellido}</span>
            <span>{e.tipo_nombre || '—'}</span>
            {isAdmin ? (
              <span className="row-actions">
                <button className="ghost-button" onClick={() => setEditEquipo(e)}>Editar</button>
                <button className="danger-button" onClick={() => onDeleteEquipo(e.id)}>Eliminar</button>
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

export default EquiposSection
