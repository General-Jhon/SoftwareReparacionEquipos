HISTORIAS DE USUARIO

1) Registrar equipo y crear orden (Técnico)

Como Técnico
quiero registrar los datos del cliente y del equipo, y crear una orden de servicio
para iniciar el proceso de reparación con trazabilidad desde el ingreso.

Criterios de aceptación

El técnico puede crear/seleccionar un Cliente (nombre, teléfono, correo opcional).

El técnico puede registrar un Equipo asociado al cliente (tipo, marca, modelo, serial obligatorio).

El sistema valida que el serial no quede vacío y advierte si ya existe (según tu regla: global o por cliente).

Al crear la Orden de Servicio, el estado inicial queda en RECIBIDO y se guarda la descripción del problema.

Se crea automáticamente un registro en Historial de Estados con: estado RECIBIDO, fecha/hora y técnico responsable.

La orden queda disponible para que el usuario la pueda ver (si tiene cuenta asociada al cliente).

2) Consultar estado de la orden (Usuario/Cliente)

Como Usuario (Cliente)
quiero consultar el estado actual y el historial de mi orden de servicio
para saber en qué etapa está mi equipo sin tener que llamar o ir al local.

Criterios de aceptación

El usuario puede crear una cuenta e iniciar sesión.

El usuario solo puede ver sus propias órdenes (asociadas a su cliente/cuenta).

En cada orden, puede ver:

Estado actual (RECIBIDO, EN_DIAGNOSTICO, EN_REPARACION, LISTO, ENTREGADO)

Fechas/horas de cambios de estado (historial)

Notas públicas del seguimiento (si decides mostrarlas)

Si el usuario intenta acceder a una orden que no es suya, el sistema lo bloquea (403/“no autorizado”).

La información mostrada coincide con el último evento del historial (y con estadoActual).

3) Realizar pago del servicio (Usuario/Cliente)

Como Usuario (Cliente)
quiero pagar el servicio asociado a mi orden
para confirmar el pago y poder avanzar al proceso de entrega.

Criterios de aceptación

El usuario puede ver el valor total (o el saldo) de la orden cuando esté en un estado permitido (por ejemplo LISTO o cuando el técnico lo habilite).

El usuario puede escoger un método de pago (ej.: efectivo, transferencia, tarjeta, pasarela) según lo que implementes.

Al confirmar el pago:

Se registra un Pago con fecha/hora, valor, método y referencia (si aplica).

La orden queda marcada como pagada (campo pagado=true o saldo=0).

El usuario puede ver un comprobante/resumen del pago.

Si el pago falla o queda incompleto, el sistema no marca como pagado y muestra el motivo.

Nota: Si quieres, en esta historia podemos agregar la regla: “solo se puede pasar a ENTREGADO si está pagada”.

Sugerencia mínima de clases/entidades por estas historias

UsuarioSistema (con rol)

Cliente

Equipo

OrdenServicio (con estadoActual, total, pagado o saldo)

HistorialEstado

Pago (si vas a permitir pagos dentro del sistema)