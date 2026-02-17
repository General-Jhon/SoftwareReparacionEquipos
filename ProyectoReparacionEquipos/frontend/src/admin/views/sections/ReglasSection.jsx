function ReglasSection({
  ReglaForm,
  grupos,
  tecnicos,
  onCreateRegla,
  reglas,
  setEditRegla,
  onDeleteRegla,
}) {
  return (
    <section className="panel">
      <h2>Reglas de asignación</h2>
      <ReglaForm grupos={grupos} tecnicos={tecnicos} onCreate={onCreateRegla} />
      <div className="table">
        <div className="row head reglas-row">
          <span>Palabras clave</span><span>Grupo</span><span>Técnico</span><span>Prioridad</span><span>Acciones</span>
        </div>
        {reglas.map((r) => (
          <div className="row reglas-row" key={r.id}>
            <span>{r.palabras_clave}</span>
            <span>{r.grupo_nombre}</span>
            <span>{r.tecnico_nombre ? `${r.tecnico_nombre} ${r.tecnico_apellido}` : '—'}</span>
            <span>{r.prioridad}</span>
            <span className="row-actions">
              <button className="ghost-button" onClick={() => setEditRegla(r)}>Editar</button>
              <button className="danger-button" onClick={() => onDeleteRegla(r.id)}>Eliminar</button>
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default ReglasSection
