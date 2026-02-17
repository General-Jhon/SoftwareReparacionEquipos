import { useState } from 'react'

function LoginView({
  email,
  password,
  loading,
  error,
  success,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onRegisterCliente,
}) {
  const [showRegister, setShowRegister] = useState(false)
  const [regForm, setRegForm] = useState({
    nombre: '',
    apellido: '',
    documento: '',
    telefono: '',
    email: '',
    direccion: '',
    ciudad: '',
    password: '',
    confirm: '',
  })
  const [regLoading, setRegLoading] = useState(false)
  const [regError, setRegError] = useState('')
  const [regSuccess, setRegSuccess] = useState('')

  const handleRegChange = (key, value) => {
    setRegForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleRegisterSubmit = async (event) => {
    event.preventDefault()
    setRegError('')
    setRegSuccess('')
    if (!regForm.nombre || !regForm.apellido || !regForm.email || !regForm.password) {
      setRegError('Nombre, apellido, email y contraseña son requeridos.')
      return
    }
    if (regForm.password.length < 8) {
      setRegError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (regForm.password !== regForm.confirm) {
      setRegError('La confirmación de contraseña no coincide.')
      return
    }
    try {
      setRegLoading(true)
      await onRegisterCliente({
        nombre: regForm.nombre,
        apellido: regForm.apellido,
        documento: regForm.documento,
        telefono: regForm.telefono,
        email: regForm.email,
        direccion: regForm.direccion,
        ciudad: regForm.ciudad,
        password: regForm.password,
      })
      setRegSuccess('Cuenta creada. Ahora puedes iniciar sesión.')
      setRegForm({
        nombre: '',
        apellido: '',
        documento: '',
        telefono: '',
        email: '',
        direccion: '',
        ciudad: '',
        password: '',
        confirm: '',
      })
      setShowRegister(false)
    } catch (err) {
      setRegError(err?.message || 'No se pudo crear la cuenta.')
    } finally {
      setRegLoading(false)
    }
  }

  return (
    <div className="app">
      <div className="bg-grid" aria-hidden="true" />
      <div className="bg-orb bg-orb-a" aria-hidden="true" />
      <div className="bg-orb bg-orb-b" aria-hidden="true" />

      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">RE</span>
          <div className="brand-text">
            <span className="brand-title">Reparacion De Equipos</span>
            <span className="brand-subtitle">Consola De OPeraciones</span>
          </div>
        </div>
        <div className="topbar-right">
          <span className="env-pill">Local</span>
        </div>
      </header>

      <main className="content">
        <section className="hero">
          <p className="eyebrow">Administrador · Técnico · Recepción · Cliente</p>
          <h1>Acceso seguro al flujo de trabajo de reparación</h1>
          <p className="lede">
            Plataforma central para seguimiento de órdenes, gestión operativa y atención al cliente
            con trazabilidad completa.
          </p>
          <div className="feature-row">
            <div className="feature">
              <span className="feature-label">Estado En Tiempo Real</span>
              <span className="feature-value">Ordenes, Historial, Pagos</span>
            </div>
            <div className="feature">
              <span className="feature-label">Asignación</span>
              <span className="feature-value">Roles, Grupos y Técnicos</span>
            </div>
            <div className="feature">
              <span className="feature-label">Portal</span>
              <span className="feature-value">Acceso Basado en Roles</span>
            </div>
          </div>
        </section>

        <section className="login-card" aria-labelledby="login-title">
          <div className="card-header">
            <h2 id="login-title">Iniciar sesión</h2>
            <p>Use sus credenciales para ingresar al módulo correspondiente.</p>
          </div>
          <form className="login-form" onSubmit={onSubmit}>
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                name="email"
                placeholder="admin@taller.local"
                autoComplete="username"
                value={email}
                onChange={onEmailChange}
              />
            </label>
            <label className="field">
              <span>Password</span>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={onPasswordChange}
              />
            </label>
            <div className="form-row">
              <label className="checkbox">
                <input type="checkbox" />
                <span>Recordar En Este Dispositivo</span>
              </label>
              <button type="button" className="link-button">¿Olvidaste Tu Contraseña?</button>
            </div>
            {error ? <div className="form-alert form-alert-error">{error}</div> : null}
            {success ? <div className="form-alert form-alert-success">{success}</div> : null}
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? 'Connecting...' : 'Access Console'}
            </button>
            <div className="hint">
              Perfiles disponibles: Administrador, Técnico, Recepción y Cliente.
            </div>
            <button type="button" className="link-button" onClick={() => setShowRegister((v) => !v)}>
              {showRegister ? 'Ocultar registro cliente' : '¿Eres cliente nuevo? Crea tu cuenta'}
            </button>
          </form>

          {showRegister ? (
            <form className="login-form register-form" onSubmit={handleRegisterSubmit}>
              <h3>Registro de cliente</h3>
              <div className="filters">
                <input placeholder="Nombre" value={regForm.nombre} onChange={(e) => handleRegChange('nombre', e.target.value)} />
                <input placeholder="Apellido" value={regForm.apellido} onChange={(e) => handleRegChange('apellido', e.target.value)} />
                <input placeholder="Documento" value={regForm.documento} onChange={(e) => handleRegChange('documento', e.target.value)} />
                <input placeholder="Teléfono" value={regForm.telefono} onChange={(e) => handleRegChange('telefono', e.target.value)} />
                <input placeholder="Email" type="email" value={regForm.email} onChange={(e) => handleRegChange('email', e.target.value)} />
                <input placeholder="Ciudad" value={regForm.ciudad} onChange={(e) => handleRegChange('ciudad', e.target.value)} />
                <input placeholder="Dirección" value={regForm.direccion} onChange={(e) => handleRegChange('direccion', e.target.value)} />
                <input placeholder="Contraseña" type="password" value={regForm.password} onChange={(e) => handleRegChange('password', e.target.value)} />
                <input placeholder="Confirmar contraseña" type="password" value={regForm.confirm} onChange={(e) => handleRegChange('confirm', e.target.value)} />
              </div>
              {regError ? <div className="form-alert form-alert-error">{regError}</div> : null}
              {regSuccess ? <div className="form-alert form-alert-success">{regSuccess}</div> : null}
              <button type="submit" className="primary-button" disabled={regLoading}>
                {regLoading ? 'Creando cuenta...' : 'Crear cuenta cliente'}
              </button>
            </form>
          ) : null}
        </section>
      </main>

      <section className="landing-sections">
        <article className="landing-block">
          <header className="landing-head">
            <p className="eyebrow">Sobre Nosotros</p>
            <h2>Servicio técnico con trazabilidad completa</h2>
          </header>
          <p>
            Somos un taller especializado en diagnóstico, mantenimiento y reparación de equipos
            informáticos para personas y empresas. Nuestro enfoque combina operación técnica,
            seguimiento del cliente y control administrativo en una sola plataforma.
          </p>
        </article>

        <article className="landing-block">
          <header className="landing-head">
            <p className="eyebrow">Servicios</p>
            <h2>Qué ofrecemos</h2>
          </header>
          <div className="landing-grid">
            <div className="landing-card">
              <h3>Diagnóstico y reparación</h3>
              <p>Portátiles, PCs, impresoras y equipos de oficina con reporte técnico.</p>
            </div>
            <div className="landing-card">
              <h3>Mantenimiento preventivo</h3>
              <p>Limpieza, optimización y control de vida útil para reducir fallas.</p>
            </div>
            <div className="landing-card">
              <h3>Atención al cliente</h3>
              <p>Portal para estado de orden, pagos y descarga de factura.</p>
            </div>
          </div>
        </article>

        <article className="landing-block">
          <header className="landing-head">
            <p className="eyebrow">Proceso</p>
            <h2>Cómo trabajamos</h2>
          </header>
          <div className="landing-steps">
            <div className="step-item"><span>1</span>Recepción y registro del equipo</div>
            <div className="step-item"><span>2</span>Diagnóstico técnico y asignación responsable</div>
            <div className="step-item"><span>3</span>Reparación, pruebas y control de calidad</div>
            <div className="step-item"><span>4</span>Entrega, pago y factura del servicio</div>
          </div>
        </article>

        <article className="landing-block">
          <header className="landing-head">
            <p className="eyebrow">Empresa</p>
            <h2>Por qué elegirnos</h2>
          </header>
          <div className="landing-metrics">
            <div className="metric"><strong>+500</strong><span>Órdenes gestionadas</span></div>
            <div className="metric"><strong>4 roles</strong><span>Flujo colaborativo por perfil</span></div>
            <div className="metric"><strong>24/7</strong><span>Seguimiento en línea para clientes</span></div>
            <div className="metric"><strong>100%</strong><span>Trazabilidad de estados y pagos</span></div>
          </div>
        </article>

        <article className="landing-block">
          <header className="landing-head">
            <p className="eyebrow">Contacto</p>
            <h2>Hablemos de tu equipo</h2>
          </header>
          <div className="contact-grid">
            <div className="contact-item">
              <span className="contact-label">Horario</span>
              <strong>Lun - Vie 8:00 a.m. - 6:00 p.m.</strong>
              <span>Sábados 8:00 a.m. - 1:00 p.m.</span>
            </div>
            <div className="contact-item">
              <span className="contact-label">Teléfono</span>
              <strong>+57 320 208 3462</strong>
              <span>Atención y recepción de equipos</span>
            </div>
            <div className="contact-item">
              <span className="contact-label">Correo</span>
              <strong>servicio@reparacionequipos.local</strong>
              <span>Soporte y seguimiento de orden</span>
            </div>
            <div className="contact-item">
              <span className="contact-label">Dirección</span>
              <strong>Cra 23 # 23 -26, Manizales</strong>
              <span>Centro de servicio técnico</span>
            </div>
          </div>
          <div className="contact-actions">
            <a
              className="primary-button cta-button"
              href="https://wa.me/5730202083462?text=Hola,%20quiero%20informaci%C3%B3n%20sobre%20reparaci%C3%B3n%20de%20equipos"
              target="_blank"
              rel="noreferrer"
            >
              Solicitar atención por WhatsApp
            </a>
          </div>
        </article>
      </section>

      <footer className="footer">
        <span>ReparacionEquipos · v0.1</span>
        <span>Interfaz de operaciones seguras</span>
      </footer>
    </div>
  )
}

export default LoginView
