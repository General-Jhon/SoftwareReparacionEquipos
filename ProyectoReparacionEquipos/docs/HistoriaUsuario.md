HISTORIAS DE USUARIO

## HU-01 Registrar cliente, equipo y orden (Recepción/Admin)

Como usuario de Recepción o Administrador  
quiero registrar clientes, equipos y órdenes de servicio  
para iniciar el flujo de reparación con trazabilidad desde la recepción.

Criterios de aceptación

- Se puede crear cliente con nombre y apellido obligatorios.
- Se puede crear equipo asociado a un cliente (marca y serie obligatorias).
- Se puede crear orden con código, cliente, equipo y falla reportada obligatorios.
- Al crear la orden, el estado inicial queda en `Recibido` (o el seleccionado si aplica).
- Se registra historial de estado automáticamente al crear la orden.
- La orden queda visible para Admin, Técnico, Recepción y Cliente asociado.

## HU-02 Gestionar ciclo técnico de la orden (Técnico)

Como Técnico  
quiero actualizar estado, diagnóstico y observaciones de mis órdenes asignadas  
para mantener el avance técnico actualizado.

Criterios de aceptación

- El técnico puede ver sus órdenes y filtrar por estado/búsqueda.
- El técnico puede actualizar estado, diagnóstico y observaciones.
- El técnico no gestiona costo final desde su modal operativo.
- Cada cambio de estado queda reflejado en historial.
- Si ocurre error de actualización, se muestra mensaje de error al técnico.

## HU-03 Gestionar grupos y reglas de asignación (Admin)

Como Administrador  
quiero crear grupos responsables, asignar técnicos y definir reglas por palabras clave  
para automatizar y ordenar la asignación técnica.

Criterios de aceptación

- Admin puede crear/editar/eliminar grupos.
- Admin puede asignar y remover técnicos de grupos.
- Admin puede crear/editar/eliminar reglas con prioridad.
- Las reglas permiten sugerir grupo/técnico desde texto de falla/diagnóstico.

## HU-04 Gestión de usuarios y seguridad (Admin)

Como Administrador  
quiero administrar usuarios, roles y credenciales  
para mantener control de acceso por perfil.

Criterios de aceptación

- Admin puede crear usuarios con rol (`Administrador`, `Tecnico`, `Recepcion`, `Cliente`).
- Admin puede editar rol, estado activo/inactivo y datos básicos de usuario.
- Admin puede resetear contraseña de cualquier usuario.
- Admin puede eliminar usuarios con restricciones de seguridad:
- no puede eliminar su propio usuario.
- no se permite eliminar el último administrador activo.
- Si se crea/edita un usuario con rol `Cliente`, se sincroniza con la tabla `clientes`.
- Si se crea/edita un usuario con rol `Tecnico`, se sincroniza con la tabla `tecnicos`.

## HU-05 Registro de pago en punto de atención (Recepción/Admin)

Como usuario de Recepción o Administrador  
quiero registrar pagos en mostrador (efectivo/tarjeta/transferencia)  
para cerrar saldo de órdenes listas para entrega.

Criterios de aceptación

- Solo se permite pago para órdenes en estado `Listo` o `Entregado`.
- No se permite registrar pagos si la orden ya está totalmente pagada.
- No se permite registrar un valor mayor al saldo pendiente.
- Al registrar pago, se actualizan `saldo` y `pagado` en la orden.
- Recepción puede consultar historial de pagos.

## HU-06 Portal cliente: consulta de orden y pago en línea (Cliente)

Como Cliente  
quiero ver el estado de mis órdenes, el técnico/grupo asignado y realizar el pago  
para hacer seguimiento sin depender de atención presencial.

Criterios de aceptación

- Cliente solo ve sus propias órdenes.
- En cada orden visualiza estado, historial, diagnóstico, técnico y grupo asignado.
- Si la orden está `Listo` o `Entregado` y tiene saldo, aparece botón `Pagar`.
- Se permite simulación de pago con tarjeta (validación básica de campos).
- Al pagar, se actualiza inmediatamente el saldo de la orden.

