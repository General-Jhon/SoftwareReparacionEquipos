# RepairEquipment.

[![Status](https://img.shields.io/badge/status-active-success)](#)
[![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite-61dafb)](#tech-stack)
[![Backend](https://img.shields.io/badge/backend-Node.js%20%2B%20Express-339933)](#tech-stack)
[![Database](https://img.shields.io/badge/database-MySQL-4479A1)](#database-setup)
[![License](https://img.shields.io/badge/license-ISC-blue)](#license)

End-to-end management platform for a real-world electronics repair shop.  
It centralizes reception, technical diagnostics, repair tracking, payments, and invoice generation under role-based access.

## Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [Role-Based Modules](#role-based-modules)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation and Run](#installation-and-run)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [API Reference](#api-reference)
- [Business Flow](#business-flow)
- [Documentation](#documentation)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

## Overview

RepairEquipment is designed for workshops that need operational traceability and clean separation of responsibilities:

- Reception manages intake and customer-facing operations.
- Technicians manage diagnosis and technical progress.
- Administrators control users, assignment rules, groups, and global operations.
- Clients can track their own orders, pay when applicable, and download invoices.

The platform supports realistic scenarios: one client with multiple devices, automatic assignment suggestions by keywords, role-based dashboards, and payment records from both customer portal and reception desk.

## Core Features

- Secure authentication with JWT.
- Full CRUD for customers, devices, service orders, technicians, groups, and users.
- Role-based access control: `Administrador`, `Tecnico`, `Recepcion`, `Cliente`.
- Service order lifecycle tracking with history.
- Admin-managed assignment groups and keyword-based smart suggestions.
- Technician workflow for diagnosis and status updates.
- Reception and client payment workflows.
- Invoice PDF generation and download.
- Client profile self-update (`telefono`, `direccion`, etc.).

## Role-Based Modules

### Administrator

- Full control over all entities.
- Manage users, reset passwords, change roles, and delete users.
- Create/edit/delete technicians and assign/remove them from groups.
- Configure assignment rules by keywords.
- Create, update, and delete service orders.
- Register and audit payments.

### Technician

- View assigned orders.
- Update diagnosis, observations, and order status.
- Track pending/in-progress/completed workload.

### Reception

- Register customers and devices at intake.
- Create service orders.
- Register on-site payments (e.g., cash/card at desk).
- Review transaction history and download invoices.

### Client

- Self-register account.
- View own orders with current status, assigned technician and group.
- Pay pending balance when the order is ready.
- Download invoice PDF.
- Update personal profile data.

## Architecture

The project uses a separated architecture:

- `frontend`: React + Vite single-page application with views by role.
- `backend`: Express REST API with modular routes/controllers.
- `database`: MySQL schema + incremental migrations.
- `docs`: technical and functional documentation.

## Tech Stack

- Frontend: React 19, Vite
- Backend: Node.js, Express 5
- Database: MySQL 8 (XAMPP compatible)
- Auth: JSON Web Token (JWT)
- Password hashing: bcryptjs

## Project Structure

```text
ProyectoReparacionEquipos/
├── backend/
│   ├── scripts/                 # seed scripts
│   └── src/
│       ├── controllers/         # business logic by module
│       ├── middleware/          # auth and role guards
│       ├── routes/              # REST endpoints by domain
│       ├── utils/
│       ├── app.js
│       ├── db.js
│       └── server.js
├── frontend/
│   └── src/
│       ├── admin/views/
│       ├── auth/views/
│       ├── cliente/views/
│       ├── recepcion/views/
│       └── tecnico/views/
└── docs/
    ├── Database.md
    ├── DiagramaClases.puml
    ├── HistoriaUsuario.md
    ├── schema.sql
    └── migrations/
```

## Installation and Run

### 1) Clone and install dependencies

```bash
cd ProyectoReparacionEquipos/backend
npm install

cd ../frontend
npm install
```

### 2) Start backend

```bash
cd ProyectoReparacionEquipos/backend
npm run dev
```

### 3) Start frontend

```bash
cd ProyectoReparacionEquipos/frontend
npm run dev
```

Default URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001`

## Environment Variables

Create `ProyectoReparacionEquipos/backend/.env`:

```env
PORT=3001
DB_HOST=127.0.0.1
DB_USER=root
DB_PASS=
DB_NAME=TallerBD
DB_PORT=3306
JWT_SECRET=change_me_please

ADMIN_EMAIL=admin@taller.local
ADMIN_PASSWORD=Admin1234
ADMIN_NOMBRE=Admin
ADMIN_APELLIDO=Principal
```

## Database Setup

1. Create database: `TallerBD`.
2. Import base schema:

```bash
mysql -u root -p TallerBD < ProyectoReparacionEquipos/docs/schema.sql
```

3. Apply migrations in order:

- `ProyectoReparacionEquipos/docs/migrations/2026-02-07_add_client_pagos.sql`
- `ProyectoReparacionEquipos/docs/migrations/2026-02-07_add_grupos.sql`
- `ProyectoReparacionEquipos/docs/migrations/2026-02-07_add_reglas_asignacion.sql`
- `ProyectoReparacionEquipos/docs/migrations/2026-02-07_update_reglas_asignacion_palabras.sql`

4. Seed default users/data:

```bash
cd ProyectoReparacionEquipos/backend
npm run seed:admin
npm run seed:demo
```

Demo client:

- Email: `carlos@mail.com`
- Password: `Cliente1234`

## API Reference

Base URL: `http://localhost:3001/api`

### Auth

- `POST /auth/login`
- `POST /auth/register-cliente`

### Catalog

- `GET /estados`
- `GET /tipos-equipo`

### Customers

- `GET /clientes/me` (`Cliente`)
- `PUT /clientes/me` (`Cliente`)
- `GET /clientes`
- `GET /clientes/:id`
- `POST /clientes`
- `PUT /clientes/:id`
- `DELETE /clientes/:id` (`Administrador`)

### Devices

- `GET /equipos`
- `GET /equipos/:id`
- `POST /equipos`
- `PUT /equipos/:id`
- `DELETE /equipos/:id` (`Administrador`)

### Service Orders

- `GET /ordenes`
- `GET /ordenes/:id`
- `POST /ordenes`
- `PUT /ordenes/:id`
- `PATCH /ordenes/:id/estado`
- `DELETE /ordenes/:id` (`Administrador`)
- `POST /ordenes/:id/asignar` (`Administrador`)
- `GET /ordenes/:id/sugerencias` (`Administrador`)
- `POST /ordenes/:id/asignar-sugerido` (`Administrador`)

### Client Portal

- `GET /mis-ordenes` (`Cliente`)
- `GET /mis-ordenes/:id` (`Cliente`)
- `GET /mis-ordenes/:id/factura` (`Cliente`)

### Payments and Invoices

- `POST /ordenes/:id/pagos`
- `GET /ordenes/:id/pagos`
- `GET /pagos` (`Administrador`, `Recepcion`)
- `GET /ordenes/:id/factura` (`Administrador`, `Recepcion`)

### Groups and Assignment Rules

- `GET /grupos`
- `POST /grupos` (`Administrador`)
- `PUT /grupos/:id` (`Administrador`)
- `DELETE /grupos/:id` (`Administrador`)
- `POST /tecnicos/:id/grupos` (`Administrador`)
- `DELETE /tecnicos/:id/grupos/:grupoId` (`Administrador`)
- `GET /grupos/:id/tecnicos`
- `GET /reglas-asignacion` (`Administrador`)
- `POST /reglas-asignacion` (`Administrador`)
- `PUT /reglas-asignacion/:id` (`Administrador`)
- `DELETE /reglas-asignacion/:id` (`Administrador`)

### User Administration

- `GET /usuarios` (`Administrador`)
- `GET /usuarios/roles` (`Administrador`)
- `POST /usuarios` (`Administrador`)
- `PUT /usuarios/:id` (`Administrador`)
- `PUT /usuarios/:id/password` (`Administrador`)
- `DELETE /usuarios/:id` (`Administrador`)

## Business Flow

1. Reception registers client and device.
2. Reception/Admin creates service order.
3. Admin assigns technician/group manually or by keyword suggestion.
4. Technician updates technical status and diagnosis.
5. When order reaches `Listo`, payment is enabled.
6. Payment can be recorded by client portal or reception desk.
7. Invoice PDF is generated and downloadable.

## Documentation

- Database model and relationships: `ProyectoReparacionEquipos/docs/Database.md`
- ER diagram source (PlantUML): `ProyectoReparacionEquipos/docs/Database.puml`
- Class diagram source (PlantUML): `ProyectoReparacionEquipos/docs/DiagramaClases.puml`
- User stories: `ProyectoReparacionEquipos/docs/HistoriaUsuario.md`
- Functional structure notes: `ProyectoReparacionEquipos/docs/Estructura.md`

## Roadmap

- Email notifications for status changes and payment confirmations.
- File attachments for intake evidence.
- KPI dashboard (repair time, workload, payment performance).
- Automated tests for critical API flows.
- CI pipeline for lint/build/test checks.

## Contributing

Internal academic project. If you collaborate:

1. Create a feature branch.
2. Keep backend routes/controllers modular.
3. Document DB changes in `docs/migrations`.
4. Update relevant docs (`Database.md`, `HistoriaUsuario.md`, `README.md`).

## License

ISC
