function GruposSection({
  isAdmin,
  GrupoForm,
  onCreateGrupo,
  grupos,
  setEditGrupo,
  onDeleteGrupo,
  onViewGrupo,
  GrupoAssignForm,
  tecnicos,
  onAssignGrupoTecnico,
  onRemoveGrupoTecnico,
}) {
  return (
    <section className="panel">
      <h2>Grupos</h2>
      {isAdmin ? <GrupoForm onCreate={onCreateGrupo} /> : null}
      <div className="table">
        <div className="row head">
          <span>Nombre</span><span>Descripción</span><span>Activo</span>
        </div>
        {grupos.map((g) => (
          <div className="row" key={g.id}>
            <span>{g.nombre}</span>
            <span>{g.descripcion || '—'}</span>
            <span>{g.activo ? 'Sí' : 'No'}</span>
            {isAdmin ? (
              <span className="row-actions">
                <button className="ghost-button" onClick={() => setEditGrupo(g)}>Editar</button>
                <button className="danger-button" onClick={() => onDeleteGrupo(g.id)}>Eliminar</button>
              </span>
            ) : null}
            <span className="row-actions">
              <button className="ghost-button" onClick={() => onViewGrupo(g.id, g)}>Ver técnicos</button>
            </span>
          </div>
        ))}
      </div>
      {isAdmin ? (
        <GrupoAssignForm
          grupos={grupos}
          tecnicos={tecnicos}
          onAssign={onAssignGrupoTecnico}
          onRemove={onRemoveGrupoTecnico}
        />
      ) : null}
    </section>
  )
}

export default GruposSection
