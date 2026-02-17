import { useMemo, useState } from 'react'

import {
  OrdenCreateForm,
  ClienteForm,
  EquipoForm,
  OrdenModal,
  ClienteModal,
  EquipoModal,
} from '../../admin/components/AdminFormsAndModals'

function RecepcionPagoModal({ orden, onClose, onSave, loading }) {
  const [metodo, setMetodo] = useState('Efectivo')
  const [valor, setValor] = useState(String(Math.max(Number(orden.saldo || 0), 0)))
  const [referencia, setReferencia] = useState('')
  const [error, setError] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    const valueNum = Number(valor)
    if (!valueNum || valueNum <= 0) {
      setError('Valor inválido.')
      return
    }
    if (valueNum > Number(orden.saldo || 0)) {
      setError('El valor no puede superar el saldo.')
      return
    }
    await onSave({ metodo, valor: valueNum, referencia })
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h3>Registrar pago - {orden.codigo}</h3>
          <button className="ghost-button" onClick={onClose}>Cerrar</button>
        </div>
        <form className="modal-body" onSubmit={submit}>
          <div className="modal-grid">
            <label>
              Método
              <select value={metodo} onChange={(e) => setMetodo(e.target.value)}>
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Transferencia">Transferencia</option>
              </select>
            </label>
            <label>
              Valor
              <input value={valor} onChange={(e) => setValor(e.target.value)} />
            </label>
            <label>
              Referencia
              <input value={referencia} onChange={(e) => setReferencia(e.target.value)} placeholder="Opcional" />
            </label>
          </div>
          {error ? <div className="form-alert form-alert-error">{error}</div> : null}
          <div className="modal-actions">
            <button className="ghost-button" type="button" onClick={onClose}>Cancelar</button>
            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Registrar pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function RecepcionDashboard({
  user,
  handleLogout,
  error,
  dataLoading,
  ordenes,
  clientes,
  equipos,
  estados,
  tecnicos,
  grupos,
  tipos,
  onCreateOrden,
  onCreateCliente,
  onCreateEquipo,
  onUpdateOrdenEstado,
  onUpdateOrdenTecnico,
  onSaveOrden,
  onSaveCliente,
  onSaveEquipo,
  onRegisterPago,
  pagos,
  onDownloadFactura,
}) {
  const [view, setView] = useState('overview')
  const [ordenSearch, setOrdenSearch] = useState('')
  const [ordenEstado, setOrdenEstado] = useState('')
  const [ordenTecnico, setOrdenTecnico] = useState('')
  const [clienteSearch, setClienteSearch] = useState('')
  const [equipoSearch, setEquipoSearch] = useState('')
  const [pagoSearch, setPagoSearch] = useState('')

  const [editOrden, setEditOrden] = useState(null)
  const [editCliente, setEditCliente] = useState(null)
  const [editEquipo, setEditEquipo] = useState(null)
  const [pagoOrden, setPagoOrden] = useState(null)
  const [savingPago, setSavingPago] = useState(false)

  const counts = useMemo(() => {
    const byEstado = ordenes.reduce((acc, orden) => {
      const key = orden.estado_nombre || 'Sin estado'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})
    return {
      totalOrdenes: ordenes.length,
      totalClientes: clientes.length,
      totalEquipos: equipos.length,
      byEstado,
    }
  }, [ordenes, clientes, equipos])

  const filteredOrdenes = useMemo(() => {
    const q = ordenSearch.trim().toLowerCase()
    return ordenes.filter((orden) => {
      if (ordenEstado && String(orden.estado_id) !== String(ordenEstado)) return false
      if (ordenTecnico && String(orden.tecnico_id || '') !== String(ordenTecnico)) return false
      if (!q) return true
      const text = `${orden.codigo || ''} ${orden.cliente_nombre || ''} ${orden.cliente_apellido || ''} ${orden.marca || ''} ${orden.modelo || ''} ${orden.serie || ''}`
      return text.toLowerCase().includes(q)
    })
  }, [ordenes, ordenSearch, ordenEstado, ordenTecnico])

  const filteredClientes = useMemo(() => {
    const q = clienteSearch.trim().toLowerCase()
    if (!q) return clientes
    return clientes.filter((cliente) => {
      const text = `${cliente.nombre || ''} ${cliente.apellido || ''} ${cliente.documento || ''} ${cliente.email || ''}`
      return text.toLowerCase().includes(q)
    })
  }, [clientes, clienteSearch])

  const filteredEquipos = useMemo(() => {
    const q = equipoSearch.trim().toLowerCase()
    if (!q) return equipos
    return equipos.filter((equipo) => {
      const text = `${equipo.serie || ''} ${equipo.marca || ''} ${equipo.modelo || ''} ${equipo.cliente_nombre || ''} ${equipo.cliente_apellido || ''}`
      return text.toLowerCase().includes(q)
    })
  }, [equipos, equipoSearch])

  const filteredPagos = useMemo(() => {
    const q = pagoSearch.trim().toLowerCase()
    if (!q) return pagos
    return pagos.filter((pago) => {
      const text = `${pago.orden_id || ''} ${pago.cliente_nombre || ''} ${pago.cliente_apellido || ''} ${pago.metodo || ''} ${pago.referencia || ''}`
      return text.toLowerCase().includes(q)
    })
  }, [pagos, pagoSearch])

  return (
    <div className="dashboard dashboard-reception">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">RECEP</span>
          <div className="brand-text">
            <span className="brand-title">Reparacion De Equipos</span>
            <span className="brand-subtitle">Consola De Recepcion</span>
          </div>
        </div>

        <nav className="nav">
          <button className={`nav-item ${view === 'overview' ? 'active' : ''}`} onClick={() => setView('overview')}>Overview</button>
          <button className={`nav-item ${view === 'ordenes' ? 'active' : ''}`} onClick={() => setView('ordenes')}>Órdenes</button>
          <button className={`nav-item ${view === 'clientes' ? 'active' : ''}`} onClick={() => setView('clientes')}>Clientes</button>
          <button className={`nav-item ${view === 'equipos' ? 'active' : ''}`} onClick={() => setView('equipos')}>Equipos</button>
          <button className={`nav-item ${view === 'pagos' ? 'active' : ''}`} onClick={() => setView('pagos')}>Pagos</button>
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
            <h1>Panel de recepción</h1>
            <p>Registro de clientes, equipos y órdenes de servicio.</p>
          </div>
          <div className="header-actions">
            <span className="env-pill">Local</span>
          </div>
        </header>

        {error ? <div className="form-alert form-alert-error">{error}</div> : null}
        {dataLoading ? <div className="loading">Cargando datos...</div> : null}

        {view === 'overview' ? (
          <section className="overview">
            <div className="kpi-grid">
              <div className="kpi-card"><span>Órdenes</span><strong>{counts.totalOrdenes}</strong></div>
              <div className="kpi-card"><span>Clientes</span><strong>{counts.totalClientes}</strong></div>
              <div className="kpi-card"><span>Equipos</span><strong>{counts.totalEquipos}</strong></div>
            </div>
            <div className="status-grid">
              {Object.entries(counts.byEstado).map(([estado, total]) => (
                <div key={estado} className="status-card"><span>{estado}</span><strong>{total}</strong></div>
              ))}
            </div>
          </section>
        ) : null}

        {view === 'ordenes' ? (
          <section className="panel">
            <h2>Órdenes</h2>
            <OrdenCreateForm
              clientes={clientes}
              equipos={equipos}
              estados={estados}
              tecnicos={tecnicos}
              grupos={grupos}
              onCreate={onCreateOrden}
            />
            <div className="filters">
              <input placeholder="Buscar por código, cliente o equipo" value={ordenSearch} onChange={(e) => setOrdenSearch(e.target.value)} />
              <select value={ordenEstado} onChange={(e) => setOrdenEstado(e.target.value)}>
                <option value="">Estado</option>
                {estados.map((estado) => (
                  <option key={estado.id} value={estado.id}>{estado.nombre}</option>
                ))}
              </select>
              <select value={ordenTecnico} onChange={(e) => setOrdenTecnico(e.target.value)}>
                <option value="">Técnico</option>
                {tecnicos.map((tecnico) => (
                  <option key={tecnico.id} value={tecnico.id}>{tecnico.nombre} {tecnico.apellido}</option>
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
                    <select className="inline-select" value={orden.estado_id} onChange={(e) => onUpdateOrdenEstado(orden, Number(e.target.value))}>
                      {estados.map((estado) => (
                        <option key={estado.id} value={estado.id}>{estado.nombre}</option>
                      ))}
                    </select>
                  </span>
                  <span>
                    <select className="inline-select" value={orden.tecnico_id || ''} onChange={(e) => onUpdateOrdenTecnico(orden, e.target.value ? Number(e.target.value) : null)}>
                      <option value="">Sin técnico</option>
                      {tecnicos.map((tecnico) => (
                        <option key={tecnico.id} value={tecnico.id}>{tecnico.nombre} {tecnico.apellido}</option>
                      ))}
                    </select>
                  </span>
                  <span className="row-actions">
                    <button className="ghost-button" onClick={() => setEditOrden(orden)}>Editar</button>
                    {['listo', 'entregado'].includes(String(orden.estado_nombre || '').toLowerCase()) && Number(orden.saldo || 0) > 0 ? (
                      <button className="primary-button" onClick={() => setPagoOrden(orden)}>Cobrar</button>
                    ) : null}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {view === 'clientes' ? (
          <section className="panel">
            <h2>Clientes</h2>
            <ClienteForm onCreate={onCreateCliente} />
            <div className="filters">
              <input placeholder="Buscar cliente" value={clienteSearch} onChange={(e) => setClienteSearch(e.target.value)} />
            </div>
            <div className="table">
              <div className="row head clientes-row">
                <span>Nombre</span>
                <span>Documento</span>
                <span>Teléfono</span>
                <span>Email</span>
                <span>Ciudad</span>
                <span>Acciones</span>
              </div>
              {filteredClientes.map((cliente) => (
                <div className="row clientes-row" key={cliente.id}>
                  <span>{cliente.nombre} {cliente.apellido}</span>
                  <span>{cliente.documento || '—'}</span>
                  <span>{cliente.telefono || '—'}</span>
                  <span>{cliente.email || '—'}</span>
                  <span>{cliente.ciudad || '—'}</span>
                  <span className="row-actions">
                    <button className="ghost-button" onClick={() => setEditCliente(cliente)}>Editar</button>
                  </span>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {view === 'equipos' ? (
          <section className="panel">
            <h2>Equipos</h2>
            <EquipoForm clientes={clientes} tipos={tipos} onCreate={onCreateEquipo} />
            <div className="filters">
              <input placeholder="Buscar equipo por serie, marca o cliente" value={equipoSearch} onChange={(e) => setEquipoSearch(e.target.value)} />
            </div>
            <div className="table">
              <div className="row head equipos-row">
                <span>Serie</span>
                <span>Marca</span>
                <span>Modelo</span>
                <span>Cliente</span>
                <span>Tipo</span>
                <span>Acciones</span>
              </div>
              {filteredEquipos.map((equipo) => (
                <div className="row equipos-row" key={equipo.id}>
                  <span>{equipo.serie}</span>
                  <span>{equipo.marca}</span>
                  <span>{equipo.modelo || '—'}</span>
                  <span>{equipo.cliente_nombre} {equipo.cliente_apellido}</span>
                  <span>{equipo.tipo_nombre || '—'}</span>
                  <span className="row-actions">
                    <button className="ghost-button" onClick={() => setEditEquipo(equipo)}>Editar</button>
                  </span>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {view === 'pagos' ? (
          <section className="panel">
            <h2>Historial de pagos</h2>
            <div className="filters">
              <input
                placeholder="Buscar por orden, cliente, método o referencia"
                value={pagoSearch}
                onChange={(e) => setPagoSearch(e.target.value)}
              />
            </div>
            <div className="table">
              <div className="row head pagos-row">
                <span>Orden</span>
                <span>Cliente</span>
                <span>Método</span>
                <span>Valor</span>
                <span>Referencia</span>
                <span>Fecha</span>
                <span>Acciones</span>
              </div>
              {filteredPagos.map((pago) => (
                <div className="row pagos-row" key={pago.id}>
                  <span>#{pago.orden_id}</span>
                  <span>{pago.cliente_nombre} {pago.cliente_apellido}</span>
                  <span>{pago.metodo}</span>
                  <span>${Number(pago.valor || 0).toLocaleString('es-CO')}</span>
                  <span>{pago.referencia || '—'}</span>
                  <span>{new Date(pago.fecha).toLocaleString()}</span>
                  <span className="row-actions">
                    <button
                      className="ghost-button"
                      onClick={async () => {
                        try {
                          await onDownloadFactura(pago.orden_id)
                        } catch (err) {
                          alert(err?.message || 'No se pudo descargar la factura.')
                        }
                      }}
                    >
                      Descargar factura
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </main>

      {editOrden ? (
        <OrdenModal
          orden={editOrden}
          estados={estados}
          tecnicos={tecnicos}
          grupos={grupos}
          onClose={() => setEditOrden(null)}
          onSave={async (payload) => {
            await onSaveOrden(editOrden.id, payload)
            setEditOrden(null)
          }}
        />
      ) : null}

      {editCliente ? (
        <ClienteModal
          cliente={editCliente}
          onClose={() => setEditCliente(null)}
          onSave={async (payload) => {
            await onSaveCliente(editCliente.id, payload)
            setEditCliente(null)
          }}
        />
      ) : null}

      {editEquipo ? (
        <EquipoModal
          equipo={editEquipo}
          clientes={clientes}
          tipos={tipos}
          onClose={() => setEditEquipo(null)}
          onSave={async (payload) => {
            await onSaveEquipo(editEquipo.id, payload)
            setEditEquipo(null)
          }}
        />
      ) : null}

      {pagoOrden ? (
        <RecepcionPagoModal
          orden={pagoOrden}
          onClose={() => setPagoOrden(null)}
          loading={savingPago}
          onSave={async (payload) => {
            try {
              setSavingPago(true)
              await onRegisterPago(pagoOrden.id, payload)
              setPagoOrden(null)
            } finally {
              setSavingPago(false)
            }
          }}
        />
      ) : null}
    </div>
  )
}

export default RecepcionDashboard
