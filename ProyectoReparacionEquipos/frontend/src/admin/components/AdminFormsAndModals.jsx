import { useEffect, useState } from 'react'

function GrupoForm({ onCreate }) {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (!nombre) {
      setError('El nombre es obligatorio.')
      return
    }
    try {
      setLoading(true)
      await onCreate({ nombre, descripcion })
      setNombre('')
      setDescripcion('')
    } catch (err) {
      setError('No se pudo crear el grupo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="inline-form" onSubmit={submit}>
      <div className="inline-field">
        <input
          placeholder="Nombre del grupo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
      </div>
      <div className="inline-field">
        <input
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
      </div>
      {error ? <span className="inline-error">{error}</span> : null}
      <button className="small-button" type="submit" disabled={loading}>
        {loading ? 'Guardando...' : 'Crear'}
      </button>
    </form>
  )
}

function TecnicoForm({ onCreate }) {
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [especialidad, setEspecialidad] = useState('')
  const [activo, setActivo] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (!nombre || !apellido) {
      setError('Nombre y apellido son obligatorios.')
      return
    }
    try {
      setLoading(true)
      await onCreate({ nombre, apellido, email, telefono, especialidad, activo })
      setNombre('')
      setApellido('')
      setEmail('')
      setTelefono('')
      setEspecialidad('')
      setActivo(true)
    } catch (err) {
      setError('No se pudo crear el técnico.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="inline-form" onSubmit={submit}>
      <div className="inline-field">
        <input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
      </div>
      <div className="inline-field">
        <input placeholder="Apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} />
      </div>
      <div className="inline-field">
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="inline-field">
        <input placeholder="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
      </div>
      <div className="inline-field">
        <input
          placeholder="Especialidad"
          value={especialidad}
          onChange={(e) => setEspecialidad(e.target.value)}
        />
      </div>
      <label className="inline-toggle">
        <input
          type="checkbox"
          checked={activo}
          onChange={(e) => setActivo(e.target.checked)}
        />
        <span>Activo</span>
      </label>
      {error ? <span className="inline-error">{error}</span> : null}
      <button className="small-button" type="submit" disabled={loading}>
        {loading ? 'Guardando...' : 'Crear'}
      </button>
    </form>
  )
}

function ClienteForm({ onCreate }) {
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [documento, setDocumento] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [direccion, setDireccion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (!nombre || !apellido) {
      setError('Nombre y apellido son obligatorios.')
      return
    }
    try {
      setLoading(true)
      await onCreate({ nombre, apellido, documento, telefono, email, ciudad, direccion })
      setNombre('')
      setApellido('')
      setDocumento('')
      setTelefono('')
      setEmail('')
      setCiudad('')
      setDireccion('')
    } catch (err) {
      setError('No se pudo crear el cliente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="inline-form" onSubmit={submit}>
      <div className="inline-field">
        <input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
      </div>
      <div className="inline-field">
        <input placeholder="Apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} />
      </div>
      <div className="inline-field">
        <input placeholder="Documento" value={documento} onChange={(e) => setDocumento(e.target.value)} />
      </div>
      <div className="inline-field">
        <input placeholder="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
      </div>
      <div className="inline-field">
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="inline-field">
        <input placeholder="Ciudad" value={ciudad} onChange={(e) => setCiudad(e.target.value)} />
      </div>
      <div className="inline-field">
        <input placeholder="Dirección" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
      </div>
      {error ? <span className="inline-error">{error}</span> : null}
      <button className="small-button" type="submit" disabled={loading}>
        {loading ? 'Creando...' : 'Crear cliente'}
      </button>
    </form>
  )
}

function EquipoForm({ clientes, tipos, onCreate }) {
  const [clienteId, setClienteId] = useState('')
  const [tipoId, setTipoId] = useState('')
  const [marca, setMarca] = useState('')
  const [modelo, setModelo] = useState('')
  const [serie, setSerie] = useState('')
  const [color, setColor] = useState('')
  const [accesorios, setAccesorios] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (!clienteId || !marca || !serie) {
      setError('Cliente, marca y serie son obligatorios.')
      return
    }
    try {
      setLoading(true)
      await onCreate({
        cliente_id: Number(clienteId),
        tipo_id: tipoId ? Number(tipoId) : null,
        marca,
        modelo,
        serie,
        color,
        accesorios,
        descripcion,
      })
      setClienteId('')
      setTipoId('')
      setMarca('')
      setModelo('')
      setSerie('')
      setColor('')
      setAccesorios('')
      setDescripcion('')
    } catch (err) {
      setError('No se pudo crear el equipo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="inline-form" onSubmit={submit}>
      <div className="inline-field">
        <select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
          <option value="">Cliente</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>
          ))}
        </select>
      </div>
      <div className="inline-field">
        <select value={tipoId} onChange={(e) => setTipoId(e.target.value)}>
          <option value="">Tipo</option>
          {tipos.map((t) => (
            <option key={t.id} value={t.id}>{t.nombre}</option>
          ))}
        </select>
      </div>
      <div className="inline-field">
        <input placeholder="Marca" value={marca} onChange={(e) => setMarca(e.target.value)} />
      </div>
      <div className="inline-field">
        <input placeholder="Modelo" value={modelo} onChange={(e) => setModelo(e.target.value)} />
      </div>
      <div className="inline-field">
        <input placeholder="Serie" value={serie} onChange={(e) => setSerie(e.target.value)} />
      </div>
      <div className="inline-field">
        <input placeholder="Color" value={color} onChange={(e) => setColor(e.target.value)} />
      </div>
      <div className="inline-field">
        <input placeholder="Accesorios" value={accesorios} onChange={(e) => setAccesorios(e.target.value)} />
      </div>
      <div className="inline-field">
        <input placeholder="Descripción" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
      </div>
      {error ? <span className="inline-error">{error}</span> : null}
      <button className="small-button" type="submit" disabled={loading}>
        {loading ? 'Creando...' : 'Crear equipo'}
      </button>
    </form>
  )
}

function GrupoAssignForm({ grupos, tecnicos, onAssign, onRemove }) {
  const [grupoId, setGrupoId] = useState('')
  const [tecnicoId, setTecnicoId] = useState('')
  return (
    <div className="inline-form">
      <div className="inline-field">
        <select value={grupoId} onChange={(e) => setGrupoId(e.target.value)}>
          <option value="">Selecciona grupo</option>
          {grupos.map((g) => (
            <option key={g.id} value={g.id}>{g.nombre}</option>
          ))}
        </select>
      </div>
      <div className="inline-field">
        <select value={tecnicoId} onChange={(e) => setTecnicoId(e.target.value)}>
          <option value="">Selecciona técnico</option>
          {tecnicos.map((t) => (
            <option key={t.id} value={t.id}>{t.nombre} {t.apellido}</option>
          ))}
        </select>
      </div>
      <button
        className="small-button"
        onClick={() => {
          if (!grupoId || !tecnicoId) return
          onAssign(Number(grupoId), Number(tecnicoId))
        }}
      >
        Asignar
      </button>
      <button
        className="danger-button"
        onClick={() => {
          if (!grupoId || !tecnicoId) return
          onRemove(Number(grupoId), Number(tecnicoId))
        }}
      >
        Quitar
      </button>
    </div>
  )
}

function OrdenModal({ orden, estados, tecnicos, grupos, onClose, onSave }) {
  const [estadoId, setEstadoId] = useState(orden.estado_id || '')
  const [tecnicoId, setTecnicoId] = useState(orden.tecnico_id || '')
  const [grupoId, setGrupoId] = useState(orden.grupo_id || '')
  const [costoFinal, setCostoFinal] = useState(orden.costo_final || '')
  const [diagnostico, setDiagnostico] = useState(orden.diagnostico || '')
  const [observaciones, setObservaciones] = useState(orden.observaciones || '')
  const [fallaReportada, setFallaReportada] = useState(orden.falla_reportada || '')
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave({
        codigo: orden.codigo,
        cliente_id: orden.cliente_id,
        equipo_id: orden.equipo_id,
        estado_id: Number(estadoId),
        tecnico_id: tecnicoId ? Number(tecnicoId) : null,
        grupo_id: grupoId ? Number(grupoId) : null,
        falla_reportada: fallaReportada,
        diagnostico,
        observaciones,
        costo_estimado: orden.costo_estimado,
        costo_final: costoFinal ? Number(costoFinal) : null,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h3>Editar orden {orden.codigo}</h3>
          <button className="ghost-button" onClick={onClose}>Cerrar</button>
        </div>
        <form className="modal-body" onSubmit={submit}>
          <div className="modal-grid">
            <label>
              Estado
              <select value={estadoId} onChange={(e) => setEstadoId(e.target.value)}>
                {estados.map((e) => (
                  <option key={e.id} value={e.id}>{e.nombre}</option>
                ))}
              </select>
            </label>
            <label>
              Técnico
              <select value={tecnicoId} onChange={(e) => setTecnicoId(e.target.value)}>
                <option value="">Sin técnico</option>
                {tecnicos.map((t) => (
                  <option key={t.id} value={t.id}>{t.nombre} {t.apellido}</option>
                ))}
              </select>
            </label>
            <label>
              Grupo
              <select value={grupoId} onChange={(e) => setGrupoId(e.target.value)}>
                <option value="">Sin grupo</option>
                {grupos.map((g) => (
                  <option key={g.id} value={g.id}>{g.nombre}</option>
                ))}
              </select>
            </label>
            <label>
              Costo final
              <input value={costoFinal} onChange={(e) => setCostoFinal(e.target.value)} />
            </label>
          </div>
          <label>
            Falla reportada
            <textarea value={fallaReportada} onChange={(e) => setFallaReportada(e.target.value)} />
          </label>
          <label>
            Diagnóstico
            <textarea value={diagnostico} onChange={(e) => setDiagnostico(e.target.value)} />
          </label>
          <label>
            Observaciones
            <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
          </label>
          <div className="modal-actions">
            <button className="ghost-button" type="button" onClick={onClose}>Cancelar</button>
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function OrdenCreateForm({ clientes, equipos, estados, tecnicos, grupos, onCreate }) {
  const [codigo, setCodigo] = useState('')
  const [clienteId, setClienteId] = useState('')
  const [equipoId, setEquipoId] = useState('')
  const [estadoId, setEstadoId] = useState(estados[0]?.id || '')
  const [tecnicoId, setTecnicoId] = useState('')
  const [grupoId, setGrupoId] = useState('')
  const [fallaReportada, setFallaReportada] = useState('')
  const [costoEstimado, setCostoEstimado] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const equiposFiltrados = equipos.filter((e) => String(e.cliente_id) === String(clienteId))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!codigo || !clienteId || !equipoId || !fallaReportada) {
      setError('Código, cliente, equipo y falla son obligatorios.')
      return
    }
    try {
      setLoading(true)
      await onCreate({
        codigo,
        cliente_id: Number(clienteId),
        equipo_id: Number(equipoId),
        estado_id: estadoId ? Number(estadoId) : null,
        tecnico_id: tecnicoId ? Number(tecnicoId) : null,
        grupo_id: grupoId ? Number(grupoId) : null,
        falla_reportada: fallaReportada,
        costo_estimado: costoEstimado ? Number(costoEstimado) : null,
      })
      setCodigo('')
      setClienteId('')
      setEquipoId('')
      setTecnicoId('')
      setGrupoId('')
      setFallaReportada('')
      setCostoEstimado('')
    } catch (err) {
      setError('No se pudo crear la orden.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="inline-form" onSubmit={submit}>
      <div className="inline-field">
        <input placeholder="Código (OS-0001)" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
      </div>
      <div className="inline-field">
        <select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
          <option value="">Cliente</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>
          ))}
        </select>
      </div>
      <div className="inline-field">
        <select value={equipoId} onChange={(e) => setEquipoId(e.target.value)}>
          <option value="">Equipo</option>
          {equiposFiltrados.map((e) => (
            <option key={e.id} value={e.id}>{e.marca} {e.modelo} · {e.serie}</option>
          ))}
        </select>
      </div>
      <div className="inline-field">
        <select value={estadoId} onChange={(e) => setEstadoId(e.target.value)}>
          {estados.map((e) => (
            <option key={e.id} value={e.id}>{e.nombre}</option>
          ))}
        </select>
      </div>
      <div className="inline-field">
        <select value={grupoId} onChange={(e) => setGrupoId(e.target.value)}>
          <option value="">Grupo</option>
          {grupos.map((g) => (
            <option key={g.id} value={g.id}>{g.nombre}</option>
          ))}
        </select>
      </div>
      <div className="inline-field">
        <select value={tecnicoId} onChange={(e) => setTecnicoId(e.target.value)}>
          <option value="">Técnico</option>
          {tecnicos.map((t) => (
            <option key={t.id} value={t.id}>{t.nombre} {t.apellido}</option>
          ))}
        </select>
      </div>
      <div className="inline-field">
        <input placeholder="Falla reportada" value={fallaReportada} onChange={(e) => setFallaReportada(e.target.value)} />
      </div>
      <div className="inline-field">
        <input placeholder="Costo estimado" value={costoEstimado} onChange={(e) => setCostoEstimado(e.target.value)} />
      </div>
      {error ? <span className="inline-error">{error}</span> : null}
      <button className="small-button" type="submit" disabled={loading}>
        {loading ? 'Creando...' : 'Crear orden'}
      </button>
    </form>
  )
}

function ClienteModal({ cliente, onClose, onSave }) {
  const [nombre, setNombre] = useState(cliente.nombre || '')
  const [apellido, setApellido] = useState(cliente.apellido || '')
  const [documento, setDocumento] = useState(cliente.documento || '')
  const [telefono, setTelefono] = useState(cliente.telefono || '')
  const [email, setEmail] = useState(cliente.email || '')
  const [ciudad, setCiudad] = useState(cliente.ciudad || '')
  const [direccion, setDireccion] = useState(cliente.direccion || '')
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave({ nombre, apellido, documento, telefono, email, ciudad, direccion, notas: cliente.notas || null })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h3>Editar cliente</h3>
          <button className="ghost-button" onClick={onClose}>Cerrar</button>
        </div>
        <form className="modal-body" onSubmit={submit}>
          <div className="modal-grid">
            <label>Nombre<input value={nombre} onChange={(e) => setNombre(e.target.value)} /></label>
            <label>Apellido<input value={apellido} onChange={(e) => setApellido(e.target.value)} /></label>
            <label>Documento<input value={documento} onChange={(e) => setDocumento(e.target.value)} /></label>
            <label>Teléfono<input value={telefono} onChange={(e) => setTelefono(e.target.value)} /></label>
            <label>Email<input value={email} onChange={(e) => setEmail(e.target.value)} /></label>
            <label>Ciudad<input value={ciudad} onChange={(e) => setCiudad(e.target.value)} /></label>
            <label>Dirección<input value={direccion} onChange={(e) => setDireccion(e.target.value)} /></label>
          </div>
          <div className="modal-actions">
            <button className="ghost-button" type="button" onClick={onClose}>Cancelar</button>
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EquipoModal({ equipo, clientes, tipos, onClose, onSave }) {
  const [clienteId, setClienteId] = useState(String(equipo.cliente_id || ''))
  const [tipoId, setTipoId] = useState(String(equipo.tipo_id || ''))
  const [marca, setMarca] = useState(equipo.marca || '')
  const [modelo, setModelo] = useState(equipo.modelo || '')
  const [serie, setSerie] = useState(equipo.serie || '')
  const [color, setColor] = useState(equipo.color || '')
  const [accesorios, setAccesorios] = useState(equipo.accesorios || '')
  const [descripcion, setDescripcion] = useState(equipo.descripcion || '')
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave({
        cliente_id: Number(clienteId),
        tipo_id: tipoId ? Number(tipoId) : null,
        marca,
        modelo,
        serie,
        color,
        accesorios,
        descripcion,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h3>Editar equipo</h3>
          <button className="ghost-button" onClick={onClose}>Cerrar</button>
        </div>
        <form className="modal-body" onSubmit={submit}>
          <div className="modal-grid">
            <label>
              Cliente
              <select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>
                ))}
              </select>
            </label>
            <label>
              Tipo
              <select value={tipoId} onChange={(e) => setTipoId(e.target.value)}>
                <option value="">Sin tipo</option>
                {tipos.map((t) => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>
            </label>
            <label>Marca<input value={marca} onChange={(e) => setMarca(e.target.value)} /></label>
            <label>Modelo<input value={modelo} onChange={(e) => setModelo(e.target.value)} /></label>
            <label>Serie<input value={serie} onChange={(e) => setSerie(e.target.value)} /></label>
            <label>Color<input value={color} onChange={(e) => setColor(e.target.value)} /></label>
            <label>Accesorios<input value={accesorios} onChange={(e) => setAccesorios(e.target.value)} /></label>
          </div>
          <label>Descripción<textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} /></label>
          <div className="modal-actions">
            <button className="ghost-button" type="button" onClick={onClose}>Cancelar</button>
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function TecnicoModal({ tecnico, onClose, onSave }) {
  const [nombre, setNombre] = useState(tecnico.nombre || '')
  const [apellido, setApellido] = useState(tecnico.apellido || '')
  const [email, setEmail] = useState(tecnico.email || '')
  const [telefono, setTelefono] = useState(tecnico.telefono || '')
  const [especialidad, setEspecialidad] = useState(tecnico.especialidad || '')
  const [activo, setActivo] = useState(!!tecnico.activo)
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave({ nombre, apellido, email, telefono, especialidad, activo })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h3>Editar técnico</h3>
          <button className="ghost-button" onClick={onClose}>Cerrar</button>
        </div>
        <form className="modal-body" onSubmit={submit}>
          <div className="modal-grid">
            <label>Nombre<input value={nombre} onChange={(e) => setNombre(e.target.value)} /></label>
            <label>Apellido<input value={apellido} onChange={(e) => setApellido(e.target.value)} /></label>
            <label>Email<input value={email} onChange={(e) => setEmail(e.target.value)} /></label>
            <label>Teléfono<input value={telefono} onChange={(e) => setTelefono(e.target.value)} /></label>
            <label>Especialidad<input value={especialidad} onChange={(e) => setEspecialidad(e.target.value)} /></label>
            <label className="inline-toggle">
              <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
              <span>Activo</span>
            </label>
          </div>
          <div className="modal-actions">
            <button className="ghost-button" type="button" onClick={onClose}>Cancelar</button>
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function OrdenDetalleModal({ orden, onClose, token }) {
  const [historial, setHistorial] = useState([])
  const [pagos, setPagos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/ordenes/${orden.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        setHistorial(data.historial || [])
        const pagosRes = await fetch(`http://localhost:3001/api/ordenes/${orden.id}/pagos`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const pagosData = await pagosRes.json()
        setPagos(pagosData || [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [orden.id, token])

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h3>Detalle orden {orden.codigo}</h3>
          <button className="ghost-button" onClick={onClose}>Cerrar</button>
        </div>
        {loading ? (
          <div className="loading">Cargando detalle...</div>
        ) : (
          <div className="modal-body">
            <div className="panel">
              <h4>Historial</h4>
              <div className="table">
                <div className="row head">
                  <span>Estado</span>
                  <span>Comentario</span>
                  <span>Fecha</span>
                  <span>Usuario</span>
                </div>
                {historial.map((h) => (
                  <div className="row" key={h.id}>
                    <span>{h.estado_nombre}</span>
                    <span>{h.comentario || '—'}</span>
                    <span>{new Date(h.fecha).toLocaleString()}</span>
                    <span>{h.usuario_id || '—'}</span>
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
                </div>
                {pagos.map((p) => (
                  <div className="row" key={p.id}>
                    <span>{p.metodo}</span>
                    <span>${Number(p.valor).toLocaleString('es-CO')}</span>
                    <span>{p.referencia || '—'}</span>
                    <span>{new Date(p.fecha).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function GrupoModal({ grupo, onClose, onSave }) {
  const [nombre, setNombre] = useState(grupo.nombre || '')
  const [descripcion, setDescripcion] = useState(grupo.descripcion || '')
  const [activo, setActivo] = useState(!!grupo.activo)
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave({ nombre, descripcion, activo })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h3>Editar grupo</h3>
          <button className="ghost-button" onClick={onClose}>Cerrar</button>
        </div>
        <form className="modal-body" onSubmit={submit}>
          <div className="modal-grid">
            <label>Nombre<input value={nombre} onChange={(e) => setNombre(e.target.value)} /></label>
            <label>Descripción<input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} /></label>
            <label className="inline-toggle">
              <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
              <span>Activo</span>
            </label>
          </div>
          <div className="modal-actions">
            <button className="ghost-button" type="button" onClick={onClose}>Cancelar</button>
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function GrupoTecnicosModal({ data, onClose }) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h3>Técnicos en {data.grupo.nombre}</h3>
          <button className="ghost-button" onClick={onClose}>Cerrar</button>
        </div>
        <div className="modal-body">
          {data.tecnicos.length === 0 ? (
            <div className="empty-state">Sin técnicos asignados.</div>
          ) : (
            <div className="table">
              <div className="row head">
                <span>Nombre</span>
                <span>Email</span>
                <span>Especialidad</span>
                <span>Activo</span>
              </div>
              {data.tecnicos.map((t) => (
                <div key={t.id} className="row">
                  <span>{t.nombre} {t.apellido}</span>
                  <span>{t.email || '—'}</span>
                  <span>{t.especialidad || '—'}</span>
                  <span>{t.activo ? 'Sí' : 'No'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ReglaForm({ grupos, tecnicos, onCreate }) {
  const [palabras, setPalabras] = useState('')
  const [grupoId, setGrupoId] = useState('')
  const [tecnicoId, setTecnicoId] = useState('')
  const [prioridad, setPrioridad] = useState('1')
  const [activo, setActivo] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!palabras || !grupoId) {
      setError('Palabras clave y grupo son obligatorios.')
      return
    }
    try {
      setLoading(true)
      await onCreate({
        palabras_clave: palabras,
        grupo_id: Number(grupoId),
        tecnico_id: tecnicoId ? Number(tecnicoId) : null,
        prioridad: Number(prioridad || 1),
        activo,
      })
      setPalabras('')
      setGrupoId('')
      setTecnicoId('')
      setPrioridad('1')
      setActivo(true)
    } catch (err) {
      setError('No se pudo crear la regla.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="inline-form" onSubmit={submit}>
      <div className="inline-field">
        <input
          placeholder="Palabras clave (separadas por coma)"
          value={palabras}
          onChange={(e) => setPalabras(e.target.value)}
        />
      </div>
      <div className="inline-field">
        <select value={grupoId} onChange={(e) => setGrupoId(e.target.value)}>
          <option value="">Grupo</option>
          {grupos.map((g) => (
            <option key={g.id} value={g.id}>{g.nombre}</option>
          ))}
        </select>
      </div>
      <div className="inline-field">
        <select value={tecnicoId} onChange={(e) => setTecnicoId(e.target.value)}>
          <option value="">Técnico (opcional)</option>
          {tecnicos.map((t) => (
            <option key={t.id} value={t.id}>{t.nombre} {t.apellido}</option>
          ))}
        </select>
      </div>
      <div className="inline-field">
        <input
          placeholder="Prioridad"
          value={prioridad}
          onChange={(e) => setPrioridad(e.target.value)}
        />
      </div>
      <label className="inline-toggle">
        <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
        <span>Activo</span>
      </label>
      {error ? <span className="inline-error">{error}</span> : null}
      <button className="small-button" type="submit" disabled={loading}>
        {loading ? 'Guardando...' : 'Crear regla'}
      </button>
    </form>
  )
}

function ReglaModal({ regla, grupos, tecnicos, onClose, onSave }) {
  const [palabras, setPalabras] = useState(regla.palabras_clave || '')
  const [grupoId, setGrupoId] = useState(String(regla.grupo_id || ''))
  const [tecnicoId, setTecnicoId] = useState(String(regla.tecnico_id || ''))
  const [prioridad, setPrioridad] = useState(String(regla.prioridad || '1'))
  const [activo, setActivo] = useState(!!regla.activo)
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave({
        palabras_clave: palabras,
        grupo_id: Number(grupoId),
        tecnico_id: tecnicoId ? Number(tecnicoId) : null,
        prioridad: Number(prioridad || 1),
        activo,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h3>Editar regla</h3>
          <button className="ghost-button" onClick={onClose}>Cerrar</button>
        </div>
        <form className="modal-body" onSubmit={submit}>
          <div className="modal-grid">
            <label>
              Palabras clave
              <input value={palabras} onChange={(e) => setPalabras(e.target.value)} />
            </label>
            <label>
              Grupo
              <select value={grupoId} onChange={(e) => setGrupoId(e.target.value)}>
                {grupos.map((g) => (
                  <option key={g.id} value={g.id}>{g.nombre}</option>
                ))}
              </select>
            </label>
            <label>
              Técnico
              <select value={tecnicoId} onChange={(e) => setTecnicoId(e.target.value)}>
                <option value="">Sin técnico</option>
                {tecnicos.map((t) => (
                  <option key={t.id} value={t.id}>{t.nombre} {t.apellido}</option>
                ))}
              </select>
            </label>
            <label>
              Prioridad
              <input value={prioridad} onChange={(e) => setPrioridad(e.target.value)} />
            </label>
            <label className="inline-toggle">
              <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
              <span>Activo</span>
            </label>
          </div>
          <div className="modal-actions">
            <button className="ghost-button" type="button" onClick={onClose}>Cancelar</button>
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function UsuarioForm({ roles, onCreate }) {
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [rolId, setRolId] = useState('')
  const [password, setPassword] = useState('')
  const [activo, setActivo] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (!nombre || !apellido || !email || !rolId || !password) {
      setError('nombre, apellido, email, rol y password son obligatorios.')
      return
    }
    if (String(password).length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    try {
      setLoading(true)
      await onCreate({
        nombre,
        apellido,
        email,
        telefono,
        rol_id: Number(rolId),
        password,
        activo,
      })
      setNombre('')
      setApellido('')
      setEmail('')
      setTelefono('')
      setRolId('')
      setPassword('')
      setActivo(true)
    } catch (err) {
      setError(err?.message || 'No se pudo crear el usuario.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="inline-form" onSubmit={submit}>
      <div className="inline-field">
        <input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
      </div>
      <div className="inline-field">
        <input placeholder="Apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} />
      </div>
      <div className="inline-field">
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="inline-field">
        <input placeholder="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
      </div>
      <div className="inline-field">
        <select value={rolId} onChange={(e) => setRolId(e.target.value)}>
          <option value="">Rol</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>{role.nombre}</option>
          ))}
        </select>
      </div>
      <div className="inline-field">
        <input
          type="password"
          placeholder="Contraseña inicial"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <label className="inline-toggle">
        <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
        <span>Activo</span>
      </label>
      {error ? <span className="inline-error">{error}</span> : null}
      <button className="small-button" type="submit" disabled={loading}>
        {loading ? 'Creando...' : 'Crear usuario'}
      </button>
    </form>
  )
}

function UsuarioModal({ usuario, roles, onClose, onSave }) {
  const [nombre, setNombre] = useState(usuario.nombre || '')
  const [apellido, setApellido] = useState(usuario.apellido || '')
  const [email, setEmail] = useState(usuario.email || '')
  const [telefono, setTelefono] = useState(usuario.telefono || '')
  const [rolId, setRolId] = useState(String(usuario.rol_id || ''))
  const [activo, setActivo] = useState(!!usuario.activo)
  const [saving, setSaving] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      await onSave({
        nombre,
        apellido,
        email,
        telefono,
        rol_id: Number(rolId),
        activo,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h3>Editar usuario</h3>
          <button className="ghost-button" onClick={onClose}>Cerrar</button>
        </div>
        <form className="modal-body" onSubmit={submit}>
          <div className="modal-grid">
            <label>Nombre<input value={nombre} onChange={(e) => setNombre(e.target.value)} /></label>
            <label>Apellido<input value={apellido} onChange={(e) => setApellido(e.target.value)} /></label>
            <label>Email<input value={email} onChange={(e) => setEmail(e.target.value)} /></label>
            <label>Teléfono<input value={telefono} onChange={(e) => setTelefono(e.target.value)} /></label>
            <label>
              Rol
              <select value={rolId} onChange={(e) => setRolId(e.target.value)}>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>{role.nombre}</option>
                ))}
              </select>
            </label>
            <label className="inline-toggle">
              <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
              <span>Activo</span>
            </label>
          </div>
          <div className="modal-actions">
            <button className="ghost-button" type="button" onClick={onClose}>Cancelar</button>
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function UsuarioPasswordModal({ usuario, onClose, onSave }) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (!newPassword) {
      setError('La nueva contraseña es obligatoria.')
      return
    }
    if (newPassword.length < 8) {
      setError('Debe tener al menos 8 caracteres.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('La confirmación no coincide.')
      return
    }
    setSaving(true)
    try {
      await onSave(newPassword)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h3>Reset password: {usuario.email}</h3>
          <button className="ghost-button" onClick={onClose}>Cerrar</button>
        </div>
        <form className="modal-body" onSubmit={submit}>
          <div className="modal-grid">
            <label>
              Nueva contraseña
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </label>
            <label>
              Confirmar contraseña
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </label>
          </div>
          {error ? <div className="form-alert form-alert-error">{error}</div> : null}
          <div className="modal-actions">
            <button className="ghost-button" type="button" onClick={onClose}>Cancelar</button>
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Restablecer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export {
  GrupoForm,
  TecnicoForm,
  ClienteForm,
  EquipoForm,
  GrupoAssignForm,
  OrdenModal,
  OrdenCreateForm,
  ClienteModal,
  EquipoModal,
  TecnicoModal,
  OrdenDetalleModal,
  GrupoModal,
  GrupoTecnicosModal,
  ReglaForm,
  ReglaModal,
  UsuarioForm,
  UsuarioModal,
  UsuarioPasswordModal,
}
