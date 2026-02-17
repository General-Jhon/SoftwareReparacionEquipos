import { useEffect, useMemo, useState } from 'react'
import '../../App.css'
import LoginView from '../../auth/views/LoginView'
import OverviewSection from './sections/OverviewSection'
import OrdenesSection from './sections/OrdenesSection'
import ClientesSection from './sections/ClientesSection'
import EquiposSection from './sections/EquiposSection'
import TecnicosSection from './sections/TecnicosSection'
import GruposSection from './sections/GruposSection'
import ReglasSection from './sections/ReglasSection'
import PagosSection from './sections/PagosSection'
import UsuariosSection from './sections/UsuariosSection'
import TecnicoDashboard from '../../tecnico/views/TecnicoDashboard'
import RecepcionDashboard from '../../recepcion/views/RecepcionDashboard'
import ClienteDashboard from '../../cliente/views/ClienteDashboard'
import {
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
} from '../components/AdminFormsAndModals'

function AdminDashboard() {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '')
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  })

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [view, setView] = useState('overview')

  const [ordenes, setOrdenes] = useState([])
  const [clientes, setClientes] = useState([])
  const [equipos, setEquipos] = useState([])
  const [tecnicos, setTecnicos] = useState([])
  const [grupos, setGrupos] = useState([])
  const [reglas, setReglas] = useState([])
  const [pagos, setPagos] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [roles, setRoles] = useState([])
  const [estados, setEstados] = useState([])
  const [tipos, setTipos] = useState([])
  const [dataLoading, setDataLoading] = useState(false)
  const [editOrden, setEditOrden] = useState(null)
  const [editCliente, setEditCliente] = useState(null)
  const [editEquipo, setEditEquipo] = useState(null)
  const [editTecnico, setEditTecnico] = useState(null)
  const [editRegla, setEditRegla] = useState(null)
  const [editGrupo, setEditGrupo] = useState(null)
  const [editUsuario, setEditUsuario] = useState(null)
  const [resetPassUsuario, setResetPassUsuario] = useState(null)
  const [viewGrupo, setViewGrupo] = useState(null)
  const [viewOrden, setViewOrden] = useState(null)

  const [ordenSearch, setOrdenSearch] = useState('')
  const [ordenEstado, setOrdenEstado] = useState('')
  const [ordenTecnico, setOrdenTecnico] = useState('')
  const [ordenGrupo, setOrdenGrupo] = useState('')
  const [ordenSoloPendientes, setOrdenSoloPendientes] = useState(false)

  const [clienteSearch, setClienteSearch] = useState('')
  const [equipoSearch, setEquipoSearch] = useState('')
  const [pagoSearch, setPagoSearch] = useState('')
  const [pagoMetodo, setPagoMetodo] = useState('')
  const [pagoDesde, setPagoDesde] = useState('')
  const [pagoHasta, setPagoHasta] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (!email || !password) {
      setError('Email y password son requeridos.')
      return
    }
    try {
      setLoading(true)
      const res = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Error al iniciar sesión.')
        return
      }
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setToken(data.token)
      setUser(data.user)
      setSuccess(`Bienvenido ${data.user?.nombre || ''} (${data.user?.rol || 'Usuario'})`)
      setPassword('')
    } catch (err) {
      setError('No se pudo conectar con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken('')
    setUser(null)
  }

  const handleRegisterCliente = async (payload) => {
    const res = await fetch('http://localhost:3001/api/auth/register-cliente', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error || 'No se pudo crear la cuenta.')
    setEmail(payload.email || '')
    setSuccess('Cuenta cliente creada. Inicia sesión con tu email y contraseña.')
  }

  const apiGet = async (path) => {
    const res = await fetch(`http://localhost:3001${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error('Error al cargar datos')
    return res.json()
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

  const apiDelete = async (path) => {
    const res = await fetch(`http://localhost:3001${path}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error || 'Error al eliminar')
    return data
  }

  useEffect(() => {
    if (!token) return
    const load = async () => {
      try {
        setDataLoading(true)
        const isAdmin = user?.rol === 'Administrador'
        const isRecepcion = user?.rol === 'Recepcion' || user?.rol === 'Recepción'
        const basePromises = [
          apiGet('/api/ordenes'),
          apiGet('/api/clientes'),
          apiGet('/api/equipos'),
          apiGet('/api/tecnicos'),
          apiGet('/api/grupos'),
          apiGet('/api/estados'),
          apiGet('/api/tipos-equipo'),
        ]
        const extraPromises = isAdmin
          ? [apiGet('/api/reglas-asignacion'), apiGet('/api/pagos'), apiGet('/api/usuarios'), apiGet('/api/usuarios/roles')]
          : isRecepcion
            ? [Promise.resolve([]), apiGet('/api/pagos'), Promise.resolve([]), Promise.resolve([])]
            : [Promise.resolve([]), Promise.resolve([]), Promise.resolve([]), Promise.resolve([])]
        const [
          ordenesData,
          clientesData,
          equiposData,
          tecnicosData,
          gruposData,
          estadosData,
          tiposData,
          reglasData,
          pagosData,
          usuariosData,
          rolesData,
        ] = await Promise.all([...basePromises, ...extraPromises])
        setOrdenes(ordenesData)
        setClientes(clientesData)
        setEquipos(equiposData)
        setTecnicos(tecnicosData)
        setGrupos(gruposData)
        setEstados(estadosData)
        setTipos(tiposData)
        setReglas(reglasData)
        setPagos(pagosData)
        setUsuarios(usuariosData)
        setRoles(rolesData)
      } catch (err) {
        setError('No se pudieron cargar los datos del dashboard.')
      } finally {
        setDataLoading(false)
      }
    }
    load()
  }, [token, user?.rol])

  const counts = useMemo(() => {
    const byEstado = ordenes.reduce((acc, o) => {
      const key = o.estado_nombre || 'Sin estado'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})
    const sinTecnico = ordenes.filter((o) => !o.tecnico_id).length
    const sinGrupo = ordenes.filter((o) => !o.grupo_id).length
    const conSaldo = ordenes.filter((o) => Number(o.saldo || 0) > 0).length
    return {
      totalOrdenes: ordenes.length,
      totalClientes: clientes.length,
      totalEquipos: equipos.length,
      totalTecnicos: tecnicos.length,
      totalGrupos: grupos.length,
      totalPagos: pagos.length,
      byEstado,
      sinTecnico,
      sinGrupo,
      conSaldo,
    }
  }, [ordenes, clientes, equipos, tecnicos, grupos, pagos])

  const filteredOrdenes = useMemo(() => {
    const q = ordenSearch.trim().toLowerCase()
    return ordenes.filter((o) => {
      if (ordenEstado && String(o.estado_id) !== String(ordenEstado)) return false
      if (ordenTecnico && String(o.tecnico_id || '') !== String(ordenTecnico)) return false
      if (ordenGrupo && String(o.grupo_id || '') !== String(ordenGrupo)) return false
      if (ordenSoloPendientes && (o.estado_nombre || '').toLowerCase() === 'entregado') return false
      if (!q) return true
      return (
        String(o.codigo || '').toLowerCase().includes(q) ||
        String(o.cliente_nombre || '').toLowerCase().includes(q) ||
        String(o.cliente_apellido || '').toLowerCase().includes(q) ||
        String(o.marca || '').toLowerCase().includes(q) ||
        String(o.modelo || '').toLowerCase().includes(q) ||
        String(o.serie || '').toLowerCase().includes(q)
      )
    })
  }, [ordenes, ordenSearch, ordenEstado, ordenTecnico, ordenGrupo, ordenSoloPendientes])

  const filteredClientes = useMemo(() => {
    const q = clienteSearch.trim().toLowerCase()
    if (!q) return clientes
    return clientes.filter((c) =>
      `${c.nombre} ${c.apellido} ${c.documento || ''} ${c.email || ''}`.toLowerCase().includes(q)
    )
  }, [clientes, clienteSearch])

  const filteredEquipos = useMemo(() => {
    const q = equipoSearch.trim().toLowerCase()
    if (!q) return equipos
    return equipos.filter((e) =>
      `${e.serie} ${e.marca} ${e.modelo || ''} ${e.cliente_nombre || ''}`.toLowerCase().includes(q)
    )
  }, [equipos, equipoSearch])

  const pagoMetodos = useMemo(() => {
    const methods = new Set(pagos.map((p) => p.metodo).filter(Boolean))
    return Array.from(methods)
  }, [pagos])

  const filteredPagos = useMemo(() => {
    const q = pagoSearch.trim().toLowerCase()
    return pagos.filter((p) => {
      if (pagoMetodo && p.metodo !== pagoMetodo) return false
      if (pagoDesde && new Date(p.fecha) < new Date(`${pagoDesde}T00:00:00`)) return false
      if (pagoHasta && new Date(p.fecha) > new Date(`${pagoHasta}T23:59:59`)) return false
      if (!q) return true
      const text = `${p.orden_id} ${p.cliente_nombre || ''} ${p.cliente_apellido || ''} ${p.referencia || ''} ${p.metodo || ''}`
      return text.toLowerCase().includes(q)
    })
  }, [pagos, pagoSearch, pagoMetodo, pagoDesde, pagoHasta])

  const pagosStats = useMemo(() => {
    const total = filteredPagos.reduce((acc, p) => acc + Number(p.valor || 0), 0)
    const today = new Date().toISOString().slice(0, 10)
    const totalHoy = filteredPagos
      .filter((p) => String(p.fecha || '').slice(0, 10) === today)
      .reduce((acc, p) => acc + Number(p.valor || 0), 0)
    const promedio = filteredPagos.length ? total / filteredPagos.length : 0
    return {
      total,
      totalHoy,
      promedio,
      cantidad: filteredPagos.length,
    }
  }, [filteredPagos])

  const exportPagosCsv = () => {
    const header = ['id', 'orden_id', 'cliente', 'metodo', 'valor', 'referencia', 'fecha', 'usuario']
    const lines = filteredPagos.map((p) => [
      p.id,
      p.orden_id,
      `${p.cliente_nombre || ''} ${p.cliente_apellido || ''}`.trim(),
      p.metodo || '',
      p.valor || 0,
      p.referencia || '',
      p.fecha || '',
      `${p.usuario_nombre || ''} ${p.usuario_apellido || ''}`.trim(),
    ])
    const csv = [header, ...lines]
      .map((row) => row.map((col) => `"${String(col).replaceAll('"', '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `pagos_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const refreshOrdenes = async () => setOrdenes(await apiGet('/api/ordenes'))
  const refreshClientes = async () => setClientes(await apiGet('/api/clientes'))
  const refreshEquipos = async () => setEquipos(await apiGet('/api/equipos'))
  const refreshTecnicos = async () => setTecnicos(await apiGet('/api/tecnicos'))
  const refreshGrupos = async () => setGrupos(await apiGet('/api/grupos'))
  const refreshReglas = async () => setReglas(await apiGet('/api/reglas-asignacion'))
  const refreshPagos = async () => setPagos(await apiGet('/api/pagos'))
  const refreshUsuarios = async () => setUsuarios(await apiGet('/api/usuarios'))
  const refreshRoles = async () => setRoles(await apiGet('/api/usuarios/roles'))

  const createOrden = async (payload) => {
    await apiPost('/api/ordenes', payload)
    await refreshOrdenes()
  }

  const updateOrdenEstado = async (orden, estadoId) => {
    await apiPut(`/api/ordenes/${orden.id}`, {
      codigo: orden.codigo,
      cliente_id: orden.cliente_id,
      equipo_id: orden.equipo_id,
      estado_id: estadoId,
      tecnico_id: orden.tecnico_id,
      grupo_id: orden.grupo_id,
      falla_reportada: orden.falla_reportada,
      diagnostico: orden.diagnostico,
      observaciones: orden.observaciones,
      costo_estimado: orden.costo_estimado,
      costo_final: orden.costo_final,
    })
    await refreshOrdenes()
  }

  const updateOrdenTecnico = async (orden, tecnicoId) => {
    await apiPut(`/api/ordenes/${orden.id}`, {
      codigo: orden.codigo,
      cliente_id: orden.cliente_id,
      equipo_id: orden.equipo_id,
      estado_id: orden.estado_id,
      tecnico_id: tecnicoId,
      grupo_id: orden.grupo_id,
      falla_reportada: orden.falla_reportada,
      diagnostico: orden.diagnostico,
      observaciones: orden.observaciones,
      costo_estimado: orden.costo_estimado,
      costo_final: orden.costo_final,
    })
    await refreshOrdenes()
  }

  const deleteOrden = async (ordenId) => {
    if (!confirm('¿Eliminar orden? (No se puede si tiene pagos)')) return
    try {
      await apiDelete(`/api/ordenes/${ordenId}`)
      await refreshOrdenes()
    } catch (err) {
      setError(err.message || 'No se pudo eliminar la orden.')
    }
  }

  const createCliente = async (payload) => {
    await apiPost('/api/clientes', payload)
    await refreshClientes()
  }

  const deleteCliente = async (clienteId) => {
    if (!confirm('¿Eliminar cliente?')) return
    await apiDelete(`/api/clientes/${clienteId}`)
    await refreshClientes()
  }

  const createEquipo = async (payload) => {
    await apiPost('/api/equipos', payload)
    await refreshEquipos()
  }

  const deleteEquipo = async (equipoId) => {
    if (!confirm('¿Eliminar equipo?')) return
    await apiDelete(`/api/equipos/${equipoId}`)
    await refreshEquipos()
  }

  const createTecnico = async (payload) => {
    await apiPost('/api/tecnicos', payload)
    await refreshTecnicos()
  }

  const updateTecnicoActivo = async (tecnico, activo) => {
    await apiPut(`/api/tecnicos/${tecnico.id}`, {
      nombre: tecnico.nombre,
      apellido: tecnico.apellido,
      especialidad: tecnico.especialidad,
      telefono: tecnico.telefono,
      email: tecnico.email,
      activo,
    })
    await refreshTecnicos()
  }

  const deleteTecnico = async (tecnicoId) => {
    if (!confirm('¿Eliminar técnico?')) return
    await apiDelete(`/api/tecnicos/${tecnicoId}`)
    await refreshTecnicos()
  }

  const createGrupo = async (payload) => {
    await apiPost('/api/grupos', payload)
    await refreshGrupos()
  }

  const deleteGrupo = async (grupoId) => {
    if (!confirm('¿Eliminar grupo?')) return
    await apiDelete(`/api/grupos/${grupoId}`)
    await refreshGrupos()
  }

  const viewGrupoTecnicos = async (grupoId, grupo) => {
    const data = await apiGet(`/api/grupos/${grupoId}/tecnicos`)
    setViewGrupo({ grupo, tecnicos: data })
  }

  const assignGrupoTecnico = async (grupoId, tecnicoId) => {
    await apiPost(`/api/tecnicos/${tecnicoId}/grupos`, { grupo_id: grupoId })
    alert('Técnico asignado al grupo.')
  }

  const removeGrupoTecnico = async (grupoId, tecnicoId) => {
    await apiDelete(`/api/tecnicos/${tecnicoId}/grupos/${grupoId}`)
    alert('Técnico eliminado del grupo.')
  }

  const createRegla = async (payload) => {
    await apiPost('/api/reglas-asignacion', payload)
    await refreshReglas()
  }

  const deleteRegla = async (reglaId) => {
    if (!confirm('¿Eliminar regla?')) return
    await apiDelete(`/api/reglas-asignacion/${reglaId}`)
    await refreshReglas()
  }

  const createUsuario = async (payload) => {
    await apiPost('/api/usuarios', payload)
    await Promise.all([refreshUsuarios(), refreshTecnicos(), refreshRoles()])
  }

  const updateUsuario = async (usuarioId, payload) => {
    await apiPut(`/api/usuarios/${usuarioId}`, payload)
    await Promise.all([refreshUsuarios(), refreshTecnicos()])
  }

  const resetUsuarioPassword = async (usuarioId, newPassword) => {
    await apiPut(`/api/usuarios/${usuarioId}/password`, { new_password: newPassword })
    await refreshUsuarios()
  }

  const deleteUsuario = async (usuarioId) => {
    if (!confirm('¿Eliminar usuario? Esta acción no se puede deshacer.')) return
    await apiDelete(`/api/usuarios/${usuarioId}`)
    await refreshUsuarios()
  }

  const saveOrdenTrabajo = async (orden, changes) => {
    try {
      await apiPut(`/api/ordenes/${orden.id}`, {
        codigo: orden.codigo,
        cliente_id: orden.cliente_id,
        equipo_id: orden.equipo_id,
        tecnico_id: orden.tecnico_id || null,
        grupo_id: orden.grupo_id || null,
        estado_id: changes.estado_id ?? orden.estado_id,
        falla_reportada: orden.falla_reportada,
        diagnostico: changes.diagnostico ?? orden.diagnostico,
        observaciones: changes.observaciones ?? orden.observaciones,
        costo_estimado: orden.costo_estimado,
        costo_final: changes.costo_final ?? orden.costo_final,
        fecha_recepcion: orden.fecha_recepcion,
        fecha_entrega_estimada: orden.fecha_entrega_estimada,
        fecha_entrega_real: orden.fecha_entrega_real,
        saldo: orden.saldo,
        pagado: orden.pagado,
        garantia_dias: orden.garantia_dias,
      })
      await refreshOrdenes()
    } catch (err) {
      setError(err?.message || 'No se pudo actualizar la orden.')
      throw err
    }
  }

  if (token && user) {
    const isAdmin = user.rol === 'Administrador'
    const isTecnico = user.rol === 'Tecnico' || user.rol === 'Técnico'
    const isRecepcion = user.rol === 'Recepcion' || user.rol === 'Recepción'
    const isCliente = user.rol === 'Cliente'

    if (isTecnico) {
      return (
        <TecnicoDashboard
          user={user}
          handleLogout={handleLogout}
          error={error}
          dataLoading={dataLoading}
          ordenes={ordenes}
          estados={estados}
          tecnicos={tecnicos}
          onQuickEstado={updateOrdenEstado}
          onSaveOrdenTrabajo={saveOrdenTrabajo}
        />
      )
    }

    if (isRecepcion) {
      return (
        <RecepcionDashboard
          user={user}
          handleLogout={handleLogout}
          error={error}
          dataLoading={dataLoading}
          ordenes={ordenes}
          clientes={clientes}
          equipos={equipos}
          estados={estados}
          tecnicos={tecnicos}
          grupos={grupos}
          tipos={tipos}
          onCreateOrden={createOrden}
          onCreateCliente={createCliente}
          onCreateEquipo={createEquipo}
          onUpdateOrdenEstado={updateOrdenEstado}
          onUpdateOrdenTecnico={updateOrdenTecnico}
          onSaveOrden={async (ordenId, payload) => {
            await apiPut(`/api/ordenes/${ordenId}`, payload)
            await refreshOrdenes()
          }}
          onSaveCliente={async (clienteId, payload) => {
            await apiPut(`/api/clientes/${clienteId}`, payload)
            await refreshClientes()
          }}
          onSaveEquipo={async (equipoId, payload) => {
            await apiPut(`/api/equipos/${equipoId}`, payload)
            await refreshEquipos()
          }}
          onRegisterPago={async (ordenId, payload) => {
            await apiPost(`/api/ordenes/${ordenId}/pagos`, payload)
            await Promise.all([refreshOrdenes(), refreshPagos()])
          }}
          pagos={pagos}
          onDownloadFactura={async (ordenId) => {
            const res = await fetch(`http://localhost:3001/api/ordenes/${ordenId}/factura`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            if (!res.ok) {
              const data = await res.json()
              throw new Error(data?.error || 'No se pudo descargar la factura')
            }
            const blob = await res.blob()
            const contentDisposition = res.headers.get('content-disposition') || ''
            const fileNameMatch = contentDisposition.match(/filename=\"?([^\\\"]+)\"?/)
            const fileName = fileNameMatch?.[1] || `factura_orden_${ordenId}.pdf`
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = fileName
            document.body.appendChild(link)
            link.click()
            link.remove()
            URL.revokeObjectURL(url)
          }}
        />
      )
    }

    if (isCliente) {
      return (
        <ClienteDashboard
          user={user}
          token={token}
          handleLogout={handleLogout}
        />
      )
    }

    const navItems = [
      ['overview', 'Overview'],
      ['ordenes', 'Órdenes'],
      ['clientes', 'Clientes'],
      ['equipos', 'Equipos'],
      ['tecnicos', 'Técnicos'],
      ['grupos', 'Grupos'],
    ]
    if (isAdmin) {
      navItems.push(['reglas', 'Reglas'])
      navItems.push(['pagos', 'Pagos'])
      navItems.push(['usuarios', 'Usuarios'])
    }
    return (
      <div className="dashboard">
        <aside className="sidebar">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">Admin</span>
            <div className="brand-text">
              <span className="brand-title">Reparacion De Equipos</span>
              <span className="brand-subtitle">Consola Administrador</span>
            </div>
          </div>
          <nav className="nav">
            {navItems.map(([key, label]) => (
              <button
                key={key}
                className={`nav-item ${view === key ? 'active' : ''}`}
                onClick={() => setView(key)}
              >
                {label}
              </button>
            ))}
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
              <h1>Panel de administración</h1>
              <p>Control general del taller y operaciones.</p>
            </div>
            <div className="header-actions">
              <span className="env-pill">Local</span>
            </div>
          </header>

          {error ? <div className="form-alert form-alert-error">{error}</div> : null}
          {dataLoading ? <div className="loading">Cargando datos...</div> : null}

          {view === 'overview' ? <OverviewSection counts={counts} /> : null}
          {view === 'ordenes' ? (
            <OrdenesSection
              isAdmin={isAdmin}
              OrdenCreateForm={OrdenCreateForm}
              clientes={clientes}
              equipos={equipos}
              estados={estados}
              tecnicos={tecnicos}
              grupos={grupos}
              onCreateOrden={createOrden}
              ordenSearch={ordenSearch}
              setOrdenSearch={setOrdenSearch}
              ordenEstado={ordenEstado}
              setOrdenEstado={setOrdenEstado}
              ordenTecnico={ordenTecnico}
              setOrdenTecnico={setOrdenTecnico}
              ordenGrupo={ordenGrupo}
              setOrdenGrupo={setOrdenGrupo}
              ordenSoloPendientes={ordenSoloPendientes}
              setOrdenSoloPendientes={setOrdenSoloPendientes}
              filteredOrdenes={filteredOrdenes}
              onUpdateOrdenEstado={updateOrdenEstado}
              onUpdateOrdenTecnico={updateOrdenTecnico}
              setViewOrden={setViewOrden}
              setEditOrden={setEditOrden}
              onDeleteOrden={deleteOrden}
            />
          ) : null}
          {view === 'clientes' ? (
            <ClientesSection
              isAdmin={isAdmin}
              ClienteForm={ClienteForm}
              onCreateCliente={createCliente}
              clienteSearch={clienteSearch}
              setClienteSearch={setClienteSearch}
              filteredClientes={filteredClientes}
              setEditCliente={setEditCliente}
              onDeleteCliente={deleteCliente}
            />
          ) : null}
          {view === 'equipos' ? (
            <EquiposSection
              isAdmin={isAdmin}
              EquipoForm={EquipoForm}
              clientes={clientes}
              tipos={tipos}
              onCreateEquipo={createEquipo}
              equipoSearch={equipoSearch}
              setEquipoSearch={setEquipoSearch}
              filteredEquipos={filteredEquipos}
              setEditEquipo={setEditEquipo}
              onDeleteEquipo={deleteEquipo}
            />
          ) : null}
          {view === 'tecnicos' ? (
            <TecnicosSection
              isAdmin={isAdmin}
              TecnicoForm={TecnicoForm}
              onCreateTecnico={createTecnico}
              tecnicos={tecnicos}
              onToggleTecnicoActivo={updateTecnicoActivo}
              setEditTecnico={setEditTecnico}
              onDeleteTecnico={deleteTecnico}
            />
          ) : null}
          {view === 'grupos' ? (
            <GruposSection
              isAdmin={isAdmin}
              GrupoForm={GrupoForm}
              onCreateGrupo={createGrupo}
              grupos={grupos}
              setEditGrupo={setEditGrupo}
              onDeleteGrupo={deleteGrupo}
              onViewGrupo={viewGrupoTecnicos}
              GrupoAssignForm={GrupoAssignForm}
              tecnicos={tecnicos}
              onAssignGrupoTecnico={assignGrupoTecnico}
              onRemoveGrupoTecnico={removeGrupoTecnico}
            />
          ) : null}
          {isAdmin && view === 'reglas' ? (
            <ReglasSection
              ReglaForm={ReglaForm}
              grupos={grupos}
              tecnicos={tecnicos}
              onCreateRegla={createRegla}
              reglas={reglas}
              setEditRegla={setEditRegla}
              onDeleteRegla={deleteRegla}
            />
          ) : null}
          {isAdmin && view === 'pagos' ? (
            <PagosSection
              pagosStats={pagosStats}
              pagoSearch={pagoSearch}
              setPagoSearch={setPagoSearch}
              pagoMetodo={pagoMetodo}
              setPagoMetodo={setPagoMetodo}
              pagoMetodos={pagoMetodos}
              pagoDesde={pagoDesde}
              setPagoDesde={setPagoDesde}
              pagoHasta={pagoHasta}
              setPagoHasta={setPagoHasta}
              exportPagosCsv={exportPagosCsv}
              filteredPagos={filteredPagos}
            />
          ) : null}
          {isAdmin && view === 'usuarios' ? (
            <UsuariosSection
              UsuarioForm={UsuarioForm}
              onCreateUsuario={createUsuario}
              usuarios={usuarios}
              roles={roles}
              setEditUsuario={setEditUsuario}
              setResetPassUsuario={setResetPassUsuario}
              onDeleteUsuario={deleteUsuario}
            />
          ) : null}
        </main>
        {isAdmin && editOrden ? (
          <OrdenModal
            orden={editOrden}
            estados={estados}
            tecnicos={tecnicos}
            grupos={grupos}
            onClose={() => setEditOrden(null)}
            onSave={async (payload) => {
              await apiPut(`/api/ordenes/${editOrden.id}`, payload)
              const data = await apiGet('/api/ordenes')
              setOrdenes(data)
              setEditOrden(null)
            }}
          />
        ) : null}
        {isAdmin && viewOrden ? (
          <OrdenDetalleModal
            orden={viewOrden}
            onClose={() => setViewOrden(null)}
            token={token}
          />
        ) : null}
        {isAdmin && editCliente ? (
          <ClienteModal
            cliente={editCliente}
            onClose={() => setEditCliente(null)}
            onSave={async (payload) => {
              await apiPut(`/api/clientes/${editCliente.id}`, payload)
              const data = await apiGet('/api/clientes')
              setClientes(data)
              setEditCliente(null)
            }}
          />
        ) : null}
        {isAdmin && editEquipo ? (
          <EquipoModal
            equipo={editEquipo}
            clientes={clientes}
            tipos={tipos}
            onClose={() => setEditEquipo(null)}
            onSave={async (payload) => {
              await apiPut(`/api/equipos/${editEquipo.id}`, payload)
              const data = await apiGet('/api/equipos')
              setEquipos(data)
              setEditEquipo(null)
            }}
          />
        ) : null}
        {isAdmin && editTecnico ? (
          <TecnicoModal
            tecnico={editTecnico}
            onClose={() => setEditTecnico(null)}
            onSave={async (payload) => {
              await apiPut(`/api/tecnicos/${editTecnico.id}`, payload)
              const data = await apiGet('/api/tecnicos')
              setTecnicos(data)
              setEditTecnico(null)
            }}
          />
        ) : null}
        {isAdmin && editGrupo ? (
          <GrupoModal
            grupo={editGrupo}
            onClose={() => setEditGrupo(null)}
            onSave={async (payload) => {
              await apiPut(`/api/grupos/${editGrupo.id}`, payload)
              const data = await apiGet('/api/grupos')
              setGrupos(data)
              setEditGrupo(null)
            }}
          />
        ) : null}
        {viewGrupo ? (
          <GrupoTecnicosModal
            data={viewGrupo}
            onClose={() => setViewGrupo(null)}
          />
        ) : null}
        {isAdmin && editRegla ? (
          <ReglaModal
            regla={editRegla}
            grupos={grupos}
            tecnicos={tecnicos}
            onClose={() => setEditRegla(null)}
            onSave={async (payload) => {
              await apiPut(`/api/reglas-asignacion/${editRegla.id}`, payload)
              const data = await apiGet('/api/reglas-asignacion')
              setReglas(data)
              setEditRegla(null)
            }}
          />
        ) : null}
        {isAdmin && editUsuario ? (
          <UsuarioModal
            usuario={editUsuario}
            roles={roles}
            onClose={() => setEditUsuario(null)}
            onSave={async (payload) => {
              await updateUsuario(editUsuario.id, payload)
              setEditUsuario(null)
            }}
          />
        ) : null}
        {isAdmin && resetPassUsuario ? (
          <UsuarioPasswordModal
            usuario={resetPassUsuario}
            onClose={() => setResetPassUsuario(null)}
            onSave={async (newPassword) => {
              await resetUsuarioPassword(resetPassUsuario.id, newPassword)
              setResetPassUsuario(null)
            }}
          />
        ) : null}
      </div>
    )
  }

  return (
    <LoginView
      email={email}
      password={password}
      loading={loading}
      error={error}
      success={success}
      onEmailChange={(e) => setEmail(e.target.value)}
      onPasswordChange={(e) => setPassword(e.target.value)}
      onSubmit={handleSubmit}
      onRegisterCliente={handleRegisterCliente}
    />
  )
}


export default AdminDashboard
