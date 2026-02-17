import { useEffect, useMemo, useState } from 'react'

function EstadoBadge({ estado }) {
  const lower = String(estado || '').toLowerCase()
  let tone = 'status-muted'
  if (lower.includes('listo')) tone = 'status-ready'
  if (lower.includes('entregado')) tone = 'status-done'
  if (lower.includes('reparacion')) tone = 'status-progress'
  return <span className={`status-badge ${tone}`}>{estado || 'Sin estado'}</span>
}

function PagoModal({ orden, onClose, onPay, loading }) {
  const [metodo, setMetodo] = useState('Tarjeta')
  const [valor, setValor] = useState(String(Math.max(Number(orden.saldo || 0), 0)))
  const [referencia, setReferencia] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardHolder, setCardHolder] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [error, setError] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    const valueNum = Number(valor)
    if (!metodo || !valueNum || valueNum <= 0) {
      setError('Método y valor válido son requeridos.')
      return
    }
    if (Number(orden.saldo || 0) > 0 && valueNum > Number(orden.saldo || 0)) {
      setError('El valor no puede ser mayor al saldo.')
      return
    }
    if (metodo === 'Tarjeta') {
      const digits = cardNumber.replace(/\s+/g, '')
      if (digits.length < 12 || digits.length > 19) {
        setError('Número de tarjeta inválido.')
        return
      }
      if (!String(cardHolder).trim()) {
        setError('Titular de tarjeta requerido.')
        return
      }
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        setError('Vencimiento inválido. Usa MM/AA.')
        return
      }
      if (!/^\d{3,4}$/.test(cardCvv)) {
        setError('CVV inválido.')
        return
      }
    }
    const refFinal =
      metodo === 'Tarjeta'
        ? `TARJ-${cardNumber.replace(/\s+/g, '').slice(-4)}-${String(cardHolder).trim()}`
        : referencia
    await onPay({ metodo, valor: valueNum, referencia: refFinal })
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h3>Pagar orden {orden.codigo}</h3>
          <button className="ghost-button" onClick={onClose}>Cerrar</button>
        </div>
        <form className="modal-body" onSubmit={submit}>
          <div className="modal-grid">
            <label>
              Método
              <select value={metodo} onChange={(e) => setMetodo(e.target.value)}>
                <option value="Transferencia">Transferencia</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Efectivo">Efectivo</option>
                <option value="PSE">PSE</option>
              </select>
            </label>
            <label>
              Valor
              <input value={valor} onChange={(e) => setValor(e.target.value)} />
            </label>
            <label>
              Referencia
              <input value={referencia} onChange={(e) => setReferencia(e.target.value)} placeholder="No. transacción" />
            </label>
            {metodo === 'Tarjeta' ? (
              <>
                <label>
                  No. tarjeta
                  <input
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4111 1111 1111 1111"
                  />
                </label>
                <label>
                  Titular
                  <input
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="Nombre Apellido"
                  />
                </label>
                <label>
                  Vencimiento
                  <input
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM/AA"
                  />
                </label>
                <label>
                  CVV
                  <input
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    placeholder="123"
                  />
                </label>
              </>
            ) : null}
          </div>
          {metodo === 'Tarjeta' ? (
            <div className="hint">Simulación de pago: no se procesa tarjeta real.</div>
          ) : null}
          {error ? <div className="form-alert form-alert-error">{error}</div> : null}
          <div className="modal-actions">
            <button className="ghost-button" type="button" onClick={onClose}>Cancelar</button>
            <button className="primary-button" type="submit" disabled={loading}>{loading ? 'Procesando...' : 'Confirmar pago'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ClienteDetalleModal({ detalle, onClose, onOpenPago, onDownloadFactura }) {
  const orden = detalle?.orden
  const historial = detalle?.historial || []
  const pagos = detalle?.pagos || []
  if (!orden) return null
  const canPay = String(orden.estado_nombre || '').toLowerCase().includes('listo') && !orden.pagado
  const canDownloadFactura = !!orden.pagado

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h3>Orden {orden.codigo}</h3>
          <button className="ghost-button" onClick={onClose}>Cerrar</button>
        </div>
        <div className="modal-body">
          <div className="kpi-grid">
            <div className="kpi-card"><span>Estado</span><strong>{orden.estado_nombre}</strong></div>
            <div className="kpi-card"><span>Técnico</span><strong>{orden.tecnico_nombre ? `${orden.tecnico_nombre} ${orden.tecnico_apellido}` : 'Pendiente'}</strong></div>
            <div className="kpi-card"><span>Grupo</span><strong>{orden.grupo_nombre || 'Pendiente'}</strong></div>
            <div className="kpi-card"><span>Saldo</span><strong>${Number(orden.saldo || 0).toLocaleString('es-CO')}</strong></div>
          </div>

          <div className="panel">
            <h4>Equipo</h4>
            <div>{orden.marca} {orden.modelo || ''} · Serie {orden.serie}</div>
          </div>

          <div className="panel">
            <h4>Diagnóstico</h4>
            <div>{orden.diagnostico || 'Aún sin diagnóstico técnico.'}</div>
          </div>

          <div className="panel">
            <h4>Historial</h4>
            <div className="table">
              <div className="row head">
                <span>Estado</span>
                <span>Comentario</span>
                <span>Fecha</span>
                <span>—</span>
                <span>—</span>
              </div>
              {historial.map((item) => (
                <div className="row" key={item.id}>
                  <span>{item.estado_nombre}</span>
                  <span>{item.comentario || '—'}</span>
                  <span>{new Date(item.fecha).toLocaleString()}</span>
                  <span>—</span>
                  <span>—</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <h4>Pagos</h4>
            <div className="table">
              <div className="row head">
                <span>Método</span>
                <span>Valor</span>
                <span>Referencia</span>
                <span>Fecha</span>
                <span>—</span>
              </div>
              {pagos.map((pago) => (
                <div className="row" key={pago.id}>
                  <span>{pago.metodo}</span>
                  <span>${Number(pago.valor).toLocaleString('es-CO')}</span>
                  <span>{pago.referencia || '—'}</span>
                  <span>{new Date(pago.fecha).toLocaleString()}</span>
                  <span>—</span>
                </div>
              ))}
            </div>
          </div>

          <div className="row-actions">
            {canPay ? <button className="primary-button" onClick={onOpenPago}>Pagar orden</button> : null}
            {canDownloadFactura ? <button className="ghost-button" onClick={onDownloadFactura}>Descargar factura</button> : null}
          </div>
        </div>
      </div>
    </div>
  )
}

function ClienteDashboard({ user, token, handleLogout }) {
  const [ordenes, setOrdenes] = useState([])
  const [perfil, setPerfil] = useState(null)
  const [perfilForm, setPerfilForm] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    direccion: '',
    ciudad: '',
  })
  const [perfilSaving, setPerfilSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [estadoFilter, setEstadoFilter] = useState('')
  const [detalle, setDetalle] = useState(null)
  const [paying, setPaying] = useState(false)
  const [openPayModal, setOpenPayModal] = useState(false)

  const apiGet = async (path) => {
    const res = await fetch(`http://localhost:3001${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error || 'Error al cargar')
    return data
  }

  const apiPost = async (path, payload) => {
    const res = await fetch(`http://localhost:3001${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error || 'Error al guardar')
    return data
  }

  const apiPut = async (path, payload) => {
    const res = await fetch(`http://localhost:3001${path}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error || 'Error al actualizar')
    return data
  }

  const loadOrdenes = async () => {
    setLoading(true)
    setError('')
    try {
      const rows = await apiGet('/api/mis-ordenes')
      setOrdenes(rows)
    } catch (err) {
      setError(err.message || 'No se pudieron cargar tus órdenes.')
    } finally {
      setLoading(false)
    }
  }

  const loadPerfil = async () => {
    try {
      const data = await apiGet('/api/clientes/me')
      setPerfil(data)
      setPerfilForm({
        nombre: data.nombre || '',
        apellido: data.apellido || '',
        telefono: data.telefono || '',
        direccion: data.direccion || '',
        ciudad: data.ciudad || '',
      })
    } catch (err) {
      setError(err.message || 'No se pudo cargar tu perfil.')
    }
  }

  useEffect(() => {
    loadOrdenes()
    loadPerfil()
  }, [])

  const estados = useMemo(() => {
    return Array.from(new Set(ordenes.map((o) => o.estado_nombre).filter(Boolean)))
  }, [ordenes])

  const filteredOrdenes = useMemo(() => {
    const q = search.trim().toLowerCase()
    return ordenes.filter((orden) => {
      if (estadoFilter && orden.estado_nombre !== estadoFilter) return false
      if (!q) return true
      const text = `${orden.codigo || ''} ${orden.marca || ''} ${orden.modelo || ''} ${orden.serie || ''}`
      return text.toLowerCase().includes(q)
    })
  }, [ordenes, search, estadoFilter])

  const stats = useMemo(() => {
    const pendientes = ordenes.filter((o) => !String(o.estado_nombre || '').toLowerCase().includes('entregado')).length
    const listas = ordenes.filter((o) => String(o.estado_nombre || '').toLowerCase().includes('listo')).length
    const saldo = ordenes.reduce((acc, o) => acc + Number(o.saldo || 0), 0)
    return { total: ordenes.length, pendientes, listas, saldo }
  }, [ordenes])

  const openDetalle = async (ordenId) => {
    try {
      const data = await apiGet(`/api/mis-ordenes/${ordenId}`)
      setDetalle(data)
      return true
    } catch (err) {
      setError(err.message || 'No se pudo cargar detalle de la orden.')
      return false
    }
  }

  const openPagoDirecto = async (ordenId) => {
    const ok = await openDetalle(ordenId)
    if (ok) setOpenPayModal(true)
  }

  const handlePago = async (payload) => {
    if (!detalle?.orden?.id) return
    try {
      setPaying(true)
      await apiPost(`/api/ordenes/${detalle.orden.id}/pagos`, payload)
      const data = await apiGet(`/api/mis-ordenes/${detalle.orden.id}`)
      setDetalle(data)
      await loadOrdenes()
      setOpenPayModal(false)
    } catch (err) {
      setError(err.message || 'No se pudo registrar el pago.')
    } finally {
      setPaying(false)
    }
  }

  const downloadFactura = async () => {
    if (!detalle?.orden?.id) return
    try {
      const res = await fetch(`http://localhost:3001/api/mis-ordenes/${detalle.orden.id}/factura`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data?.error || 'No se pudo descargar la factura')
      }
      const blob = await res.blob()
      const contentDisposition = res.headers.get('content-disposition') || ''
      const fileNameMatch = contentDisposition.match(/filename="?([^\"]+)"?/)
      const fileName = fileNameMatch?.[1] || `factura_${detalle.orden.codigo}.html`
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err.message || 'No se pudo descargar la factura')
    }
  }

  const savePerfil = async (event) => {
    event.preventDefault()
    if (!perfilForm.nombre || !perfilForm.apellido) {
      setError('Nombre y apellido son obligatorios.')
      return
    }
    try {
      setPerfilSaving(true)
      setError('')
      await apiPut('/api/clientes/me', perfilForm)
      await loadPerfil()
    } catch (err) {
      setError(err.message || 'No se pudo actualizar tu perfil.')
    } finally {
      setPerfilSaving(false)
    }
  }

  return (
    <div className="dashboard dashboard-client">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">CLI</span>
          <div className="brand-text">
            <span className="brand-title">Reparacion De Equipos</span>
            <span className="brand-subtitle">Portal Cliente</span>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="user-chip">
            <span>{user?.nombre} {user?.apellido}</span>
            <span className="user-role">Cliente</span>
          </div>
          <button className="ghost-button" onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </aside>

      <main className="dash-main">
        <header className="dash-header">
          <div>
            <h1>Mis órdenes de servicio</h1>
            <p>Seguimiento en tiempo real, pagos y factura electrónica del servicio.</p>
          </div>
          <div className="header-actions">
            <span className="env-pill">Portal cliente</span>
          </div>
        </header>

        {error ? <div className="form-alert form-alert-error">{error}</div> : null}
        {loading ? <div className="loading">Cargando tus órdenes...</div> : null}

        <section className="overview">
          <div className="kpi-grid">
            <div className="kpi-card"><span>Total órdenes</span><strong>{stats.total}</strong></div>
            <div className="kpi-card"><span>Pendientes</span><strong>{stats.pendientes}</strong></div>
            <div className="kpi-card"><span>Listas para entrega</span><strong>{stats.listas}</strong></div>
            <div className="kpi-card"><span>Saldo total</span><strong>${stats.saldo.toLocaleString('es-CO')}</strong></div>
          </div>
        </section>

        <section className="panel">
          <h2>Mi perfil</h2>
          <form className="inline-form" onSubmit={savePerfil}>
            <div className="inline-field">
              <input
                placeholder="Nombre"
                value={perfilForm.nombre}
                onChange={(e) => setPerfilForm((prev) => ({ ...prev, nombre: e.target.value }))}
              />
            </div>
            <div className="inline-field">
              <input
                placeholder="Apellido"
                value={perfilForm.apellido}
                onChange={(e) => setPerfilForm((prev) => ({ ...prev, apellido: e.target.value }))}
              />
            </div>
            <div className="inline-field">
              <input
                placeholder="Teléfono"
                value={perfilForm.telefono}
                onChange={(e) => setPerfilForm((prev) => ({ ...prev, telefono: e.target.value }))}
              />
            </div>
            <div className="inline-field">
              <input
                placeholder="Ciudad"
                value={perfilForm.ciudad}
                onChange={(e) => setPerfilForm((prev) => ({ ...prev, ciudad: e.target.value }))}
              />
            </div>
            <div className="inline-field">
              <input
                placeholder="Dirección"
                value={perfilForm.direccion}
                onChange={(e) => setPerfilForm((prev) => ({ ...prev, direccion: e.target.value }))}
              />
            </div>
            <button className="small-button" type="submit" disabled={perfilSaving}>
              {perfilSaving ? 'Guardando...' : 'Actualizar perfil'}
            </button>
          </form>
          <div className="hint">Correo asociado: {perfil?.email || user?.email}</div>
        </section>

        <section className="panel">
          <h2>Órdenes</h2>
          <div className="filters">
            <input placeholder="Buscar por código o equipo" value={search} onChange={(e) => setSearch(e.target.value)} />
            <select value={estadoFilter} onChange={(e) => setEstadoFilter(e.target.value)}>
              <option value="">Todos los estados</option>
              {estados.map((estado) => (
                <option key={estado} value={estado}>{estado}</option>
              ))}
            </select>
          </div>

          <div className="table">
            <div className="row head client-orders-row">
              <span>Código</span>
              <span>Equipo</span>
              <span>Estado</span>
              <span>Técnico</span>
              <span>Grupo</span>
              <span>Saldo</span>
              <span>Acciones</span>
            </div>
            {filteredOrdenes.map((orden) => (
              <div className="row client-orders-row" key={orden.id}>
                <span>{orden.codigo}</span>
                <span>{orden.marca} {orden.modelo || ''} · {orden.serie}</span>
                <span><EstadoBadge estado={orden.estado_nombre} /></span>
                <span>{orden.tecnico_nombre ? `${orden.tecnico_nombre} ${orden.tecnico_apellido}` : 'Pendiente'}</span>
                <span>{orden.grupo_nombre || 'Pendiente'}</span>
                <span>${Number(orden.saldo || 0).toLocaleString('es-CO')}</span>
                <span className="row-actions">
                  <button className="ghost-button" onClick={() => openDetalle(orden.id)}>Ver detalle</button>
                  {['listo', 'entregado'].includes(String(orden.estado_nombre || '').toLowerCase()) && !orden.pagado ? (
                    <button className="primary-button" onClick={() => openPagoDirecto(orden.id)}>Pagar</button>
                  ) : null}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {detalle ? (
        <ClienteDetalleModal
          detalle={detalle}
          onClose={() => {
            setDetalle(null)
            setOpenPayModal(false)
          }}
          onOpenPago={() => setOpenPayModal(true)}
          onDownloadFactura={downloadFactura}
        />
      ) : null}

      {detalle && openPayModal ? (
        <PagoModal
          orden={detalle.orden}
          onClose={() => setOpenPayModal(false)}
          onPay={handlePago}
          loading={paying}
        />
      ) : null}
    </div>
  )
}

export default ClienteDashboard
