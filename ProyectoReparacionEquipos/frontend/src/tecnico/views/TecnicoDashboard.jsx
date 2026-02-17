import { useMemo, useState } from 'react'

function TecnicoOrdenModal({ orden, estados, onClose, onSave }) {
  const [estadoId, setEstadoId] = useState(String(orden.estado_id || ''))
  const [diagnostico, setDiagnostico] = useState(orden.diagnostico || '')
  const [observaciones, setObservaciones] = useState(orden.observaciones || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      await onSave(orden, {
        estado_id: Number(estadoId),
        diagnostico,
        observaciones,
      })
      onClose()
    } catch (err) {
      setError(err?.message || 'No se pudo guardar la actualización.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h3>Orden {orden.codigo}</h3>
          <button className="ghost-button" onClick={onClose}>Cerrar</button>
        </div>
        <form className="modal-body" onSubmit={submit}>
          <div className="modal-grid">
            <label>
              Estado
              <select value={estadoId} onChange={(e) => setEstadoId(e.target.value)}>
                {estados.map((estado) => (
                  <option key={estado.id} value={estado.id}>{estado.nombre}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Diagnóstico
            <textarea value={diagnostico} onChange={(e) => setDiagnostico(e.target.value)} />
          </label>
          <label>
            Observaciones técnicas
            <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
          </label>
          {error ? <div className="form-alert form-alert-error">{error}</div> : null}
          <div className="modal-actions">
            <button type="button" className="ghost-button" onClick={onClose}>Cancelar</button>
            <button type="submit" className="primary-button" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function TecnicoDashboard({
  user,
  handleLogout,
  error,
  dataLoading,
  ordenes,
  estados,
  tecnicos,
  onQuickEstado,
  onSaveOrdenTrabajo,
}) {
  const [view, setView] = useState('mis-ordenes')
  const [search, setSearch] = useState('')
  const [estadoFilter, setEstadoFilter] = useState('')
  const [editOrden, setEditOrden] = useState(null)

  const tecnicoMatches = useMemo(() => {
    const email = String(user?.email || '').toLowerCase()
    const nombre = String(user?.nombre || '').toLowerCase()
    const apellido = String(user?.apellido || '').toLowerCase()

    return tecnicos.filter((tecnico) => {
      const byEmail = email && String(tecnico.email || '').toLowerCase() === email
      const byName =
        nombre &&
        apellido &&
        String(tecnico.nombre || '').toLowerCase() === nombre &&
        String(tecnico.apellido || '').toLowerCase() === apellido
      return byEmail || byName
    })
  }, [tecnicos, user])

  const misTecnicoIds = useMemo(() => tecnicoMatches.map((tecnico) => tecnico.id), [tecnicoMatches])

  const misOrdenes = useMemo(() => {
    if (misTecnicoIds.length > 0) {
      return ordenes.filter((orden) => misTecnicoIds.includes(orden.tecnico_id))
    }
    return ordenes.filter((orden) => {
      const nombre = String(orden.tecnico_nombre || '').toLowerCase()
      const apellido = String(orden.tecnico_apellido || '').toLowerCase()
      return (
        nombre === String(user?.nombre || '').toLowerCase() &&
        apellido === String(user?.apellido || '').toLowerCase()
      )
    })
  }, [ordenes, misTecnicoIds, user])

  const filteredOrdenes = useMemo(() => {
    const base = view === 'mis-ordenes' ? misOrdenes : ordenes
    const q = search.trim().toLowerCase()
    return base.filter((orden) => {
      if (estadoFilter && String(orden.estado_id) !== String(estadoFilter)) return false
      if (!q) return true
      const text = `${orden.codigo || ''} ${orden.cliente_nombre || ''} ${orden.cliente_apellido || ''} ${orden.marca || ''} ${orden.modelo || ''} ${orden.serie || ''}`
      return text.toLowerCase().includes(q)
    })
  }, [ordenes, misOrdenes, view, search, estadoFilter])

  const kpis = useMemo(() => {
    const pendientes = misOrdenes.filter((orden) => String(orden.estado_nombre || '').toLowerCase() !== 'entregado').length
    const enReparacion = misOrdenes.filter((orden) => String(orden.estado_nombre || '').toLowerCase().includes('reparacion')).length
    const diagnosticadas = misOrdenes.filter((orden) => String(orden.diagnostico || '').trim()).length
    return {
      total: misOrdenes.length,
      pendientes,
      enReparacion,
      diagnosticadas,
    }
  }, [misOrdenes])

  return (
    <div className="dashboard dashboard-tech">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">Tecn</span>
          <div className="brand-text">
            <span className="brand-title">Reparacion De Equipos</span>
            <span className="brand-subtitle">Tecnico Consola</span>
          </div>
        </div>

        <nav className="nav">
          <button className={`nav-item ${view === 'mis-ordenes' ? 'active' : ''}`} onClick={() => setView('mis-ordenes')}>
            Mis órdenes
          </button>
          <button className={`nav-item ${view === 'todas' ? 'active' : ''}`} onClick={() => setView('todas')}>
            Todas las órdenes
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <span>{user?.nombre} {user?.apellido}</span>
            <span className="user-role">{user?.rol}</span>
          </div>
          <button className="ghost-button" onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </aside>

      <main className="dash-main">
        <header className="dash-header">
          <div>
            <h1>Panel técnico</h1>
            <p>Seguimiento y actualización de órdenes asignadas.</p>
          </div>
          <div className="header-actions">
            <span className="env-pill">Local</span>
          </div>
        </header>

        {error ? <div className="form-alert form-alert-error">{error}</div> : null}
        {dataLoading ? <div className="loading">Cargando datos...</div> : null}

        <section className="overview">
          <div className="kpi-grid">
            <div className="kpi-card"><span>Total asignadas</span><strong>{kpis.total}</strong></div>
            <div className="kpi-card"><span>Pendientes</span><strong>{kpis.pendientes}</strong></div>
            <div className="kpi-card"><span>En reparación</span><strong>{kpis.enReparacion}</strong></div>
            <div className="kpi-card"><span>Con diagnóstico</span><strong>{kpis.diagnosticadas}</strong></div>
          </div>
        </section>

        <section className="panel">
          <h2>{view === 'mis-ordenes' ? 'Mis órdenes' : 'Órdenes del taller'}</h2>
          <div className="filters">
            <input
              placeholder="Buscar por código, cliente o equipo"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select value={estadoFilter} onChange={(e) => setEstadoFilter(e.target.value)}>
              <option value="">Todos los estados</option>
              {estados.map((estado) => (
                <option key={estado.id} value={estado.id}>{estado.nombre}</option>
              ))}
            </select>
          </div>

          <div className="table">
            <div className="row head orders-row">
              <span>Código</span>
              <span>Cliente</span>
              <span>Equipo</span>
              <span>Estado</span>
              <span>Técnico</span>
              <span>Acciones</span>
            </div>
            {filteredOrdenes.map((orden) => (
              <div className="row orders-row" key={orden.id}>
                <span>{orden.codigo}</span>
                <span>{orden.cliente_nombre} {orden.cliente_apellido}</span>
                <span>{orden.marca} {orden.modelo}</span>
                <span>
                  <select
                    className="inline-select"
                    value={orden.estado_id}
                    onChange={(e) => onQuickEstado(orden, Number(e.target.value))}
                  >
                    {estados.map((estado) => (
                      <option key={estado.id} value={estado.id}>{estado.nombre}</option>
                    ))}
                  </select>
                </span>
                <span>{orden.tecnico_nombre ? `${orden.tecnico_nombre} ${orden.tecnico_apellido}` : 'Sin asignar'}</span>
                <span className="row-actions">
                  <button className="ghost-button" onClick={() => setEditOrden(orden)}>Actualizar</button>
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {editOrden ? (
        <TecnicoOrdenModal
          orden={editOrden}
          estados={estados}
          onClose={() => setEditOrden(null)}
          onSave={onSaveOrdenTrabajo}
        />
      ) : null}
    </div>
  )
}

export default TecnicoDashboard
