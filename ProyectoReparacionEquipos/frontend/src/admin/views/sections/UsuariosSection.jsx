function UsuariosSection({
  UsuarioForm,
  onCreateUsuario,
  usuarios,
  roles,
  setEditUsuario,
  setResetPassUsuario,
  onDeleteUsuario,
}) {
  return (
    <section className="panel">
      <h2>Usuarios</h2>
      <UsuarioForm roles={roles} onCreate={onCreateUsuario} />
      <div className="table">
        <div className="row head usuarios-row">
          <span>Nombre</span>
          <span>Email</span>
          <span>Rol</span>
          <span>Teléfono</span>
          <span>Activo</span>
          <span>Acciones</span>
        </div>
        {usuarios.map((usuario) => (
          <div className="row usuarios-row" key={usuario.id}>
            <span>{usuario.nombre} {usuario.apellido}</span>
            <span>{usuario.email}</span>
            <span>{usuario.rol}</span>
            <span>{usuario.telefono || '—'}</span>
            <span>{usuario.activo ? 'Sí' : 'No'}</span>
            <span className="row-actions">
              <button className="ghost-button" onClick={() => setEditUsuario(usuario)}>Editar</button>
              <button className="ghost-button" onClick={() => setResetPassUsuario(usuario)}>Reset password</button>
              <button className="danger-button" onClick={() => onDeleteUsuario(usuario.id)}>Eliminar</button>
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default UsuariosSection
