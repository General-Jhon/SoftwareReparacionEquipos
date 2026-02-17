function TecnicosSection({
  isAdmin,
  TecnicoForm,
  onCreateTecnico,
  tecnicos,
  onToggleTecnicoActivo,
  setEditTecnico,
  onDeleteTecnico,
}) {
  return (
    <section className="panel">
      <h2>Técnicos</h2>
      {isAdmin ? <TecnicoForm onCreate={onCreateTecnico} /> : null}
      <div className="table">
        <div className="row head">
          <span>Nombre</span><span>Especialidad</span><span>Teléfono</span><span>Email</span><span>Activo</span>
        </div>
        {tecnicos.map((t) => (
          <div className="row" key={t.id}>
            <span>{t.nombre} {t.apellido}</span>
            <span>{t.especialidad || '—'}</span>
            <span>{t.telefono || '—'}</span>
            <span>{t.email || '—'}</span>
            <span className="row-inline">
              <span>{t.activo ? 'Sí' : 'No'}</span>
              {isAdmin ? (
                <label className="row-toggle">
                  <input type="checkbox" checked={!!t.activo} onChange={(e) => onToggleTecnicoActivo(t, e.target.checked)} />
                  <span>{t.activo ? 'Activo' : 'Inactivo'}</span>
                </label>
              ) : null}
            </span>
            {isAdmin ? (
              <span className="row-actions">
                <button className="ghost-button" onClick={() => setEditTecnico(t)}>Editar</button>
                <button className="danger-button" onClick={() => onDeleteTecnico(t.id)}>Eliminar</button>
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  )
}

export default TecnicosSection
