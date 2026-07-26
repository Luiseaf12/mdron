# AeroCampo — control de fumigación agrícola con drones

Las especificaciones funcionales y técnicas completas se mantienen en
[`ESPECIFICACIONES.md`](./ESPECIFICACIONES.md).

Aplicación web en Next.js para registrar clientes, productos y servicios de fumigación. Cada aplicación guarda hectáreas, precio por hectárea, cultivo, lote, productos/dosis, fecha y estado. El importe se calcula en PostgreSQL.

## Requisitos

- Node.js 20 o superior
- Docker Desktop
- Supabase CLI

## Desarrollo local

```bash
corepack pnpm install
corepack pnpm supabase:start
```

Copia `.env.example` a `.env.local` y reemplaza la llave con el valor `anon key` que muestra `supabase start`.

```bash
corepack pnpm supabase:reset
corepack pnpm dev
```

Abre `http://localhost:3000`. Supabase Studio estará en `http://127.0.0.1:54323`.

Sin variables de entorno o sin Supabase activo, la interfaz abre automáticamente en modo demostración con datos de ejemplo. En este modo no se guardan cambios.

## Modelo

- `clients`: empresa, contacto, teléfono, correo y rancho.
- `products`: producto, marca, ingrediente activo y unidad de dosis.
- `applications`: cliente, fecha, hectáreas, precio, cultivo, lote, estado y notas.
- `application_products`: relación de productos y dosis por aplicación.

Las políticas RLS incluidas son abiertas para desarrollo local. Antes de desplegar se deben reemplazar por políticas ligadas a usuarios autenticados.
