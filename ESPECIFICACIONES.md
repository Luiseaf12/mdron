# Especificaciones funcionales y técnicas — AeroCampo

> Documento maestro del proyecto. Debe actualizarse junto con cada modificación funcional, técnica o de reglas de negocio.

**Proyecto:** MaquilaDrones / AeroCampo  
**Versión del documento:** 1.2  
**Última actualización:** 25 de julio de 2026  
**Estado:** Implementado y funcionando en ambiente local

---

## 1. Objetivo

AeroCampo es una aplicación web para administrar la operación de una empresa de fumigación agrícola con drones.

El sistema permite registrar clientes, productos agrícolas y aplicaciones realizadas o programadas. Su objetivo es conservar la trazabilidad de cada servicio, calcular sus importes y facilitar el control de hectáreas atendidas, productos aplicados e ingresos.

## 2. Alcance actual

La versión actual incluye:

- Panel general de indicadores.
- Administración de clientes.
- Administración de productos.
- Administración de familias de productos.
- Registro y edición de aplicaciones agrícolas.
- Registro de múltiples productos por aplicación.
- Control de dosis predeterminadas y dosis aplicadas.
- Activación, baja lógica y eliminación controlada de catálogos.
- Configuración del tamaño del texto.
- Persistencia local con Supabase y PostgreSQL.
- Interfaz adaptable para computadoras y dispositivos móviles.

## 3. Tecnología

### Frontend

- Next.js 15.
- React 19.
- TypeScript.
- CSS personalizado.
- Lucide React para iconos.
- Cliente oficial de Supabase.

### Backend y base de datos

- Supabase local.
- PostgreSQL 15.
- PostgREST para acceso a datos.
- Migraciones SQL versionadas.
- Row Level Security habilitado.
- Docker Desktop para ejecutar los servicios locales.

### Administración local

- Supabase Studio.
- Datos iniciales mediante `supabase/seed.sql`.
- Variables de conexión en `.env.local`.

## 4. Módulos funcionales

### 4.1 Panel general

El panel presenta:

- Total de hectáreas atendidas.
- Total de ingresos registrados.
- Cantidad de servicios completados.
- Ticket promedio por aplicación.
- Distribución de hectáreas por cultivo.
- Últimas aplicaciones registradas.
- Accesos rápidos a aplicaciones, clientes y productos.

Los indicadores se calculan con la información almacenada en Supabase.

### 4.2 Aplicaciones agrícolas

Una aplicación representa un servicio de fumigación o aplicación agrícola realizado con drones.

Cada aplicación contiene:

- Cliente.
- Fecha del servicio.
- Estado.
- Cultivo.
- Lote o predio.
- Cantidad de hectáreas.
- Precio por hectárea.
- Importe total.
- Uno o varios productos aplicados.
- Dosis aplicada de cada producto.
- Notas.

#### Estados permitidos

- Programado.
- En proceso.
- Completado.
- Cancelado.

#### Cálculo del importe

El importe se calcula en PostgreSQL:

```text
importe total = hectáreas × precio por hectárea
```

El usuario no captura directamente el importe total.

#### Productos por aplicación

- Una aplicación puede contener varios productos.
- El mismo producto no puede repetirse dentro de una aplicación.
- El usuario puede agregar o quitar renglones de productos.
- Al seleccionar un producto, el sistema carga su dosis predeterminada.
- La dosis puede modificarse para la aplicación actual.
- Modificar la dosis aplicada no modifica la dosis predeterminada del catálogo.
- Cada renglón muestra la unidad de dosis correspondiente al producto.

#### Edición

Las aplicaciones existentes pueden editarse.

Se pueden modificar:

- Cliente.
- Fecha.
- Estado.
- Cultivo.
- Lote o predio.
- Hectáreas.
- Precio por hectárea.
- Productos.
- Dosis de cada producto.
- Notas.

Cuando cambian las hectáreas o el precio, PostgreSQL recalcula automáticamente el importe.

#### Uso de catálogos inactivos

- Los clientes y productos inactivos no pueden seleccionarse en aplicaciones nuevas.
- Una aplicación histórica que ya utiliza un elemento inactivo puede conservarlo.
- Al editar un registro histórico, el elemento inactivo actual se muestra con la leyenda correspondiente.
- Un elemento inactivo no puede agregarse como una nueva relación.

### 4.3 Clientes

Cada cliente contiene:

- Nombre de empresa o cliente.
- Nombre de contacto.
- Teléfono.
- Correo electrónico.
- Rancho o predio.
- Estado activo o inactivo.
- Fecha de creación.

Funciones disponibles:

- Crear.
- Consultar.
- Editar.
- Activar.
- Desactivar.
- Eliminar si no tiene aplicaciones relacionadas.

Un cliente inactivo:

- Continúa visible para consulta histórica.
- No aparece como opción en aplicaciones nuevas.
- No puede vincularse mediante la API a una aplicación nueva.

### 4.4 Productos

Cada producto contiene:

- Nombre comercial.
- Familia.
- Marca.
- Ingrediente activo.
- Unidad de dosis.
- Dosis predeterminada.
- Estado activo o inactivo.
- Fecha de creación.

Ejemplos de unidades:

- `L/ha`
- `Kg/ha`
- `g/ha`
- `ml/ha`

Funciones disponibles:

- Crear.
- Consultar.
- Editar.
- Activar.
- Desactivar.
- Eliminar si no ha sido utilizado en aplicaciones.

Un producto inactivo:

- Continúa visible para consulta histórica.
- No aparece como opción en aplicaciones nuevas.
- No puede agregarse mediante la API a una aplicación nueva.

### 4.5 Familias de productos

Familias iniciales:

- Insecticida.
- Fungicida.
- Herbicida.
- Bactericida.
- Fertilizante foliar.

Cada familia contiene:

- Nombre.
- Estado activo o inactivo.
- Fecha de creación.

Funciones disponibles:

- Crear.
- Consultar.
- Editar.
- Activar.
- Desactivar.
- Eliminar si no tiene productos relacionados.

Una familia inactiva:

- Continúa visible en el catálogo.
- No puede seleccionarse para productos nuevos.
- Se conserva en productos históricos que ya la utilizan.

### 4.6 Configuración

La pantalla de configuración permite seleccionar el tamaño del texto:

- Compacto.
- Normal.
- Grande.

La selección:

- Se aplica a toda la interfaz.
- Se almacena en el navegador mediante `localStorage`.
- Se conserva al cerrar y volver a abrir la aplicación en el mismo navegador.
- No se sincroniza actualmente entre dispositivos o usuarios.

La pantalla también contiene el mantenimiento del catálogo de familias.

## 5. Reglas generales de catálogos

Los catálogos administrables actuales son:

- Clientes.
- Productos.
- Familias de productos.

Todos deben cumplir las siguientes reglas:

1. Sus elementos pueden editarse.
2. Sus elementos pueden darse de baja mediante el estado inactivo.
3. Un elemento inactivo conserva toda su información e historial.
4. Un elemento inactivo no puede utilizarse en documentos nuevos.
5. Un elemento puede reactivarse.
6. Un elemento sólo puede eliminarse físicamente cuando no ha sido utilizado.
7. Si existen relaciones históricas, PostgreSQL bloquea la eliminación.
8. Cuando una eliminación es bloqueada, la interfaz recomienda dar de baja el elemento.

La baja lógica es el procedimiento recomendado. La eliminación física debe reservarse para registros capturados por error y nunca utilizados.

## 6. Modelo de datos

### 6.1 `clients`

| Campo | Tipo | Requerido | Descripción |
|---|---|---:|---|
| `id` | UUID | Sí | Identificador |
| `name` | Texto | Sí | Empresa o cliente |
| `contact_name` | Texto | No | Persona de contacto |
| `phone` | Texto | No | Teléfono |
| `email` | Texto | No | Correo |
| `ranch` | Texto | No | Rancho o predio |
| `active` | Booleano | Sí | Disponibilidad en registros nuevos |
| `created_at` | Fecha y hora | Sí | Fecha de creación |

### 6.2 `product_families`

| Campo | Tipo | Requerido | Descripción |
|---|---|---:|---|
| `id` | UUID | Sí | Identificador |
| `name` | Texto | Sí | Nombre único |
| `active` | Booleano | Sí | Disponibilidad para productos nuevos |
| `created_at` | Fecha y hora | Sí | Fecha de creación |

### 6.3 `products`

| Campo | Tipo | Requerido | Descripción |
|---|---|---:|---|
| `id` | UUID | Sí | Identificador |
| `name` | Texto | Sí | Nombre comercial |
| `family_id` | UUID | No | Familia relacionada |
| `brand` | Texto | No | Marca |
| `active_ingredient` | Texto | No | Ingrediente activo |
| `unit` | Texto | Sí | Unidad de dosis |
| `default_dose` | Decimal | Sí | Dosis sugerida |
| `active` | Booleano | Sí | Disponibilidad en aplicaciones nuevas |
| `created_at` | Fecha y hora | Sí | Fecha de creación |

### 6.4 `applications`

| Campo | Tipo | Requerido | Descripción |
|---|---|---:|---|
| `id` | UUID | Sí | Identificador |
| `client_id` | UUID | Sí | Cliente |
| `service_date` | Fecha | Sí | Fecha del servicio |
| `hectares` | Decimal | Sí | Superficie; debe ser mayor que cero |
| `price_per_hectare` | Decimal | Sí | Precio; no puede ser negativo |
| `total` | Decimal | Calculado | Hectáreas por precio |
| `crop` | Texto | Sí | Cultivo |
| `field_name` | Texto | No | Lote o predio |
| `status` | Enum | Sí | Estado del servicio |
| `notes` | Texto | No | Observaciones |
| `created_at` | Fecha y hora | Sí | Fecha de creación |

### 6.5 `application_products`

| Campo | Tipo | Requerido | Descripción |
|---|---|---:|---|
| `application_id` | UUID | Sí | Aplicación |
| `product_id` | UUID | Sí | Producto |
| `dose` | Decimal | Sí | Dosis utilizada en esa aplicación |

La llave primaria combina `application_id` y `product_id`. Esto impide repetir el mismo producto en una aplicación.

## 7. Relaciones y eliminación

```text
Clientes 1 ─── N Aplicaciones

Aplicaciones N ─── N Productos
             mediante application_products

Familias 1 ─── N Productos
```

Reglas:

- Un cliente con aplicaciones no puede eliminarse.
- Un producto utilizado en una aplicación no puede eliminarse.
- Una familia utilizada por productos no puede eliminarse.
- Al eliminar una aplicación, sus relaciones de productos se eliminan en cascada a nivel de base de datos.
- El borrado de catálogos relacionados utiliza restricciones `ON DELETE RESTRICT`.

## 8. Seguridad y validaciones

### Estado actual

- Todas las tablas tienen Row Level Security habilitado.
- En el ambiente local existen políticas abiertas para los roles `anon` y `authenticated`.
- Las políticas abiertas se utilizan únicamente para desarrollo local.
- Antes de publicar debe implementarse autenticación y políticas por usuario o empresa.

### Validaciones en PostgreSQL

La base de datos:

- Rechaza hectáreas menores o iguales a cero.
- Rechaza precios negativos.
- Rechaza dosis negativas.
- Rechaza dosis predeterminadas negativas.
- Rechaza clientes inactivos en aplicaciones nuevas.
- Rechaza productos inactivos en relaciones nuevas.
- Rechaza familias inactivas en productos nuevos.
- Calcula el importe total.
- Impide relaciones duplicadas entre una aplicación y un producto.
- Impide eliminar catálogos utilizados.

## 9. Experiencia de usuario

- Navegación lateral.
- Panel superior con acción de nuevo registro.
- Formularios en ventanas modales.
- Indicadores de estado.
- Identificación visual de catálogos activos e inactivos.
- Confirmación antes de eliminar elementos.
- Mensajes cuando una eliminación está bloqueada.
- Diseño adaptable para pantallas pequeñas.
- Formato monetario en pesos mexicanos.
- Formato de fechas en español de México.

## 10. Operación local

### Requisitos

- Node.js 20 o superior.
- Docker Desktop iniciado.
- Corepack.

### Iniciar Supabase

```bash
corepack pnpm supabase:start
```

### Aplicar migraciones pendientes

```bash
corepack pnpm exec supabase migration up
```

### Reiniciar la base y cargar datos iniciales

> Este comando elimina los datos locales actuales.

```bash
corepack pnpm supabase:reset
```

### Iniciar Next.js en desarrollo

```bash
corepack pnpm dev
```

### Compilar

```bash
corepack pnpm build
```

### Direcciones locales

- Aplicación: `http://localhost:3000`
- API de Supabase: `http://127.0.0.1:54321`
- Supabase Studio: `http://127.0.0.1:54323`
- PostgreSQL: `127.0.0.1:54322`

## 11. Archivos principales

- `app/page.tsx`: interfaz y lógica funcional.
- `app/globals.css`: diseño visual y adaptación móvil.
- `lib/types.ts`: tipos de datos.
- `lib/supabase/client.ts`: conexión con Supabase.
- `lib/format.ts`: formatos de moneda, números y fechas.
- `supabase/migrations/`: estructura y reglas de la base.
- `supabase/seed.sql`: datos iniciales.
- `.env.example`: ejemplo de configuración.
- `README.md`: instrucciones resumidas.
- `ESPECIFICACIONES.md`: documento maestro de alcance y requisitos.

## 12. Criterios de aceptación actuales

- [x] El usuario puede crear clientes.
- [x] El usuario puede editar clientes.
- [x] El usuario puede activar y desactivar clientes.
- [x] Un cliente inactivo no puede usarse en aplicaciones nuevas.
- [x] Un cliente utilizado no puede eliminarse.
- [x] El usuario puede crear productos.
- [x] El usuario puede editar productos.
- [x] El producto tiene familia, unidad y dosis predeterminada.
- [x] El usuario puede activar y desactivar productos.
- [x] Un producto inactivo no puede agregarse a aplicaciones nuevas.
- [x] Un producto utilizado no puede eliminarse.
- [x] El usuario puede mantener familias de productos.
- [x] Una familia inactiva no puede utilizarse en productos nuevos.
- [x] Una familia utilizada no puede eliminarse.
- [x] El usuario puede crear aplicaciones.
- [x] El usuario puede editar aplicaciones.
- [x] Una aplicación puede tener varios productos.
- [x] La dosis del catálogo se carga automáticamente.
- [x] La dosis puede modificarse por aplicación.
- [x] El importe se calcula automáticamente.
- [x] El usuario puede configurar el tamaño del texto.
- [x] La aplicación funciona con Supabase local.
- [x] La aplicación compila para producción.

## 13. Decisiones pendientes

Estas funciones no forman parte del alcance implementado todavía y deben definirse antes de desarrollarse:

- Autenticación de usuarios.
- Roles y permisos.
- Separación de información por empresa.
- Catálogo administrable de cultivos.
- Catálogo administrable de unidades de dosis.
- Administración de drones y pilotos.
- Agenda o calendario operativo.
- Ubicación geográfica de los lotes.
- Evidencia fotográfica y archivos adjuntos.
- Facturación, pagos y saldos.
- Reportes exportables.
- Eliminación o cancelación controlada de aplicaciones.
- Bitácora de auditoría.
- Despliegue en producción.

## 14. Procedimiento para solicitar cambios

Para proponer una modificación:

1. Editar este archivo o describir el cambio solicitado.
2. Indicar si se trata de una regla obligatoria, una preferencia o una idea pendiente.
3. Especificar qué usuarios utilizarán la función.
4. Incluir ejemplos cuando exista una regla especial.
5. Revisar los criterios de aceptación antes de aprobar la implementación.

Cada cambio implementado debe actualizar:

- La sección funcional correspondiente.
- El modelo de datos, si aplica.
- Las reglas de negocio.
- Los criterios de aceptación.
- El historial de cambios.

## 15. Historial de cambios

### 25 de julio de 2026 — Versión 1.0

- Creación del documento maestro.
- Documentación del panel general.
- Documentación de clientes, productos y familias.
- Documentación de altas, edición, bajas lógicas y eliminación controlada.
- Documentación de aplicaciones editables.
- Documentación de múltiples productos por aplicación.
- Documentación de dosis predeterminada y dosis aplicada.
- Documentación de configuración de tamaño de texto.
- Documentación de Supabase local, modelo de datos y validaciones.

### 25 de julio de 2026 — Versión 1.1

- Los cultivos se convirtieron en un catálogo administrable con altas, edición, activación, baja lógica y eliminación condicionada a no tener aplicaciones relacionadas.
- Los ingredientes activos se convirtieron en un catálogo administrable con las mismas reglas. Los productos seleccionan el ingrediente desde este catálogo.
- Se agregó el catálogo de usuarios con nombre, correo, teléfono, estado y perfiles de dronero y vendedor.
- Un usuario debe tener al menos un perfil y puede tener ambos.
- Cada aplicación requiere un dronero y un vendedor activos con el perfil correspondiente.
- Las aplicaciones históricas conservan sus responsables aunque posteriormente se den de baja.
- Se agregó configuración global del porcentaje de comisión para droneros y vendedores.
- Los porcentajes vigentes se copian a cada aplicación nueva; cambios posteriores no alteran cálculos históricos.
- La comisión de cada responsable se calcula sobre el importe total de la aplicación.
- Se agregó un reporte por usuario con ventas atribuidas, operaciones realizadas, ingresos generados y comisiones acumuladas.

#### Nuevas reglas funcionales vigentes

```text
comisión del dronero = importe total × porcentaje del dronero / 100
comisión del vendedor = importe total × porcentaje del vendedor / 100
```

- Un cultivo inactivo no puede utilizarse en aplicaciones nuevas.
- Un ingrediente activo inactivo no puede utilizarse en productos nuevos.
- Un usuario inactivo no puede asignarse a aplicaciones nuevas.
- Un usuario sin perfil de dronero no puede asignarse como dronero.
- Un usuario sin perfil de vendedor no puede asignarse como vendedor.
- Cultivos, ingredientes y usuarios sólo pueden eliminarse si nunca fueron utilizados.

#### Nuevas tablas

- `crops`: catálogo de cultivos.
- `active_ingredients`: catálogo de ingredientes activos.
- `users`: catálogo de usuarios operativos y comerciales.
- `app_settings`: porcentajes vigentes de comisión.

#### Nuevos campos de aplicaciones

| Campo | Descripción |
|---|---|
| `crop_id` | Cultivo seleccionado |
| `drone_operator_id` | Usuario responsable de operar el dron |
| `salesperson_id` | Usuario responsable de la venta |
| `drone_commission_rate` | Porcentaje histórico del dronero |
| `salesperson_commission_rate` | Porcentaje histórico del vendedor |
| `drone_commission` | Comisión calculada del dronero |
| `salesperson_commission` | Comisión calculada del vendedor |

#### Criterios de aceptación incorporados

- [x] Los cultivos se administran mediante catálogo.
- [x] Los ingredientes activos se administran mediante catálogo.
- [x] Los usuarios pueden crearse, editarse, activarse y desactivarse.
- [x] Los usuarios pueden ser droneros, vendedores o ambos.
- [x] Cada aplicación requiere dronero y vendedor.
- [x] La configuración permite establecer ambos porcentajes de comisión.
- [x] Cada aplicación conserva los porcentajes vigentes al momento de su creación.
- [x] El reporte muestra ingresos y comisiones por usuario.

### 25 de julio de 2026 — Versión 1.2

- Los catálogos de familias de productos, cultivos e ingredientes activos se retiraron de la pantalla Configuración.
- Se creó la opción independiente `Catálogos` en el menú lateral.
- La pantalla Catálogos concentra el mantenimiento de familias, cultivos e ingredientes activos.
- Se agregó el precio predeterminado por hectárea a la configuración general.
- El precio predeterminado se carga al crear una aplicación.
- El usuario puede modificar el precio sugerido durante la captura sin cambiar la configuración general.
- Las aplicaciones existentes conservan el precio registrado originalmente.
