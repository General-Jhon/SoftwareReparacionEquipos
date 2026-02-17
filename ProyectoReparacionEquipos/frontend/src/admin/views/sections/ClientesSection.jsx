function ClientesSection({
  isAdmin,
  ClienteForm,
  onCreateCliente,
  clienteSearch,
  setClienteSearch,
  filteredClientes,
  setEditCliente,
  onDeleteCliente,
}) {
  return (
    <section className="panel">
      <h2>Clientes</h2>
      {isAdmin ? <ClienteForm onCreate={onCreateCliente} /> : null}
      <div className="filters">
        <input placeholder="Buscar cliente" value={clienteSearch} onChange={(e) => setClienteSearch(e.target.value)} />
      </div>
      <div className="table">
        <div className="row head clientes-row">
          <span>Nombre</span><span>Documento</span><span>Teléfono</span><span>Email</span><span>Ciudad</span><span>Acciones</span>
        </div>
        {filteredClientes.map((c) => (
          <div className="row clientes-row" key={c.id}>
            <span>{c.nombre} {c.apellido}</span>
            <span>{c.documento || '—'}</span>
            <span>{c.telefono || '—'}</span>
            <span>{c.email || '—'}</span>
            <span>{c.ciudad || '—'}</span>
            {isAdmin ? (
              <span className="row-actions">
                <button className="ghost-button" onClick={() => setEditCliente(c)}>Editar</button>
                <button className="danger-button" onClick={() => onDeleteCliente(c.id)}>Eliminar</button>
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

export default ClientesSection
