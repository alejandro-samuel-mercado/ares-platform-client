# 📕 GUÍA COMPLETA DE USUARIO — PLATAFORMA ARES v3

> **Versión:** 3.0 · **Última actualización:** Abril 2026  
> **Audiencia:** Administradores y Vendedores de la plataforma Ares

---

## 📑 ÍNDICE

1. [¿Qué es Ares?](#1-qué-es-ares)
2. [Roles y Permisos](#2-roles-y-permisos)
3. [Primeros Pasos](#3-primeros-pasos)
4. [Guía del Vendedor (App PWA)](#4-guía-del-vendedor)
   - [4.1 Inicio (Home)](#41-inicio-home)
   - [4.2 Catálogo](#42-catálogo)
   - [4.3 Mis Servicios](#43-mis-servicios)
   - [4.4 Pedidos](#44-pedidos)
   - [4.5 Imágenes / Banco Promocional](#45-imágenes--banco-promocional)
   - [4.6 Flyers](#46-flyers)
   - [4.7 Promociones](#47-promociones)
   - [4.8 Estrenos](#48-estrenos)
   - [4.9 Partidos / Cartelera TV](#49-partidos--cartelera-tv)
   - [4.10 Mensajes Rápidos (Scripts)](#410-mensajes-rápidos-scripts)
   - [4.11 Calculadora de Ganancias](#411-calculadora-de-ganancias)
   - [4.12 Historial de Activaciones](#412-historial-de-activaciones)
   - [4.13 Marketplace](#413-marketplace)
   - [4.14 Mi Plan / Suscripción](#414-mi-plan--suscripción)
   - [4.15 Perfil](#415-perfil)
   - [4.16 Enlace Público de Vendedor](#416-enlace-público-de-vendedor)
5. [Guía del Administrador (Panel Admin)](#5-guía-del-administrador)
   - [5.1 Dashboard](#51-dashboard)
   - [5.2 Vendedores](#52-vendedores)
   - [5.3 Servicios Base](#53-servicios-base)
   - [5.4 Credenciales](#54-credenciales)
   - [5.5 Pedidos](#55-pedidos)
   - [5.6 Pagos](#56-pagos)
   - [5.7 Planes](#57-planes)
   - [5.8 Imágenes (Banco)](#58-imágenes-banco)
   - [5.9 Estrenos](#59-estrenos)
   - [5.10 Partidos](#510-partidos)
   - [5.11 Mensajes Rápidos](#511-mensajes-rápidos)
   - [5.12 Marketplace](#512-marketplace)
   - [5.13 Ajustes de Plataforma](#513-ajustes-de-plataforma)
6. [Flujos de Trabajo Completos](#6-flujos-de-trabajo-completos)
7. [FAQ — Preguntas Frecuentes](#7-faq--preguntas-frecuentes)
8. [Recomendaciones y Buenas Prácticas](#8-recomendaciones-y-buenas-prácticas)

---

## 1. ¿Qué es Ares?

**Ares** es una plataforma diseñada para administrar redes de **revendedores de servicios de entretenimiento** (Netflix, Disney+, HBO, Cuentas, etc.). Permite que un **Administrador** gestione un catálogo de servicios, cuentas, y una base de vendedores que ofrecen estos servicios a sus propios clientes.

La plataforma consta de dos partes principales:
- **App del Vendedor:** Una aplicación que instalan los revendedores en sus celulares o PC para ver precios, descargar material publicitario, pedir cuentas, y gestionar su negocio.
- **Panel de Administración:** Un panel de control privado donde el administrador maneja todo su inventario: vendedores, servicios, cuentas, pagos, y contenido publicitario.

---

## 2. Roles y Permisos

| Rol | Descripción | Acceso |
|-----|-------------|--------|
| **SUPERADMIN** | El dueño de la plataforma. Control total del inventario. | Panel de Control e ingreso a la App |
| **VENDOR (Vendedor)** | Revendedor con suscripción activa. | App del Vendedor |
| **GUEST (Invitado)** | Usuario demo sin suscripción activa. Acceso limitado. | App del Vendedor (solo lectura, todo el material tiene marca de agua "DEMO") |

> [!IMPORTANT]
> Los vendedores con rol GUEST pueden explorar la plataforma pero **NO pueden** copiar mensajes con datos reales, descargar imágenes sin marca de agua, ni hacer pedidos. Para obtener acceso completo deben activar un plan.

---

## 3. Primeros Pasos

### 3.1 Registro
1. Abre la página principal de la plataforma en tu dispositivo.
2. Haz clic en **"REGISTRARSE GRATIS"**.
3. Completa los campos:
   - **Nombre completo**
   - **Alias** (nombre corto comercial, ej: "tiendamax" — aparecerá en tu catálogo público)
   - **Teléfono** (se usa para recibir WhatsApp de tus clientes)
   - **Contraseña secreta**
4. Al registrarte, se te asigna automáticamente un estado de **GUEST (Invitado)** de prueba para que conozcas el sistema.

### 3.2 Inicio de Sesión
1. Dirígete a la pantalla de Acceso / Login de la plataforma.
2. Ingresa tu **USUARIO DE ACCESO (ALIAS)** (ej: admin o el nombre corto que elegiste).
3. Ingresa tu **CLAVE MAESTRA** (tu contraseña).
4. Presiona el botón "INGRESAR AHORA".

### 3.3 Instalar como App en tu celular o PC
Al entrar por primera vez, verás el logotipo de "ARES PLATFORM" y un mensaje para instalar la aplicación en el menú de tu navegador. Si lo haces, la plataforma se instalará en tu pantalla de inicio como cualquier otra aplicación.

> [!TIP]
> Instalar la app mejora mucho la experiencia. Se abre más rápido, tiene pantalla completa, y puedes recibir notificaciones push.

---

## 4. Guía del Vendedor

### 4.1 Inicio (Home)

**Ruta:** `/home`

La pantalla de inicio es tu centro de operaciones diario. Muestra:

- **Saludo personalizado:** "BIENVENIDO".
- **Aviso Global:** Una noticia importante dejada por el administrador (ej: "Nuevos precios de Netflix", "Mantenimiento el domingo").
- **Cartelera Deportiva:** Si hay partidos de fútbol importantes en el día, verás los próximos 2 partidos con los escudos, la hora de tu país y el canal donde lo transmiten.
- **Accesos rápidos principales:** Cuadrícula de botones grandes para entrar directo a los menús que más usas.
- **Botón Soporte Directo:** Botón de WhatsApp para hablar directamente con el dueño de la red (administrador).

**Acciones disponibles:**
- Tocar cualquier icono para ir al módulo
- Refrescar datos con el botón ↻
- Chatear con soporte vía WhatsApp

---

### 4.2 Catálogo

**Ruta:** `/catalogo`

El catálogo muestra **todos los servicios base** disponibles en la plataforma (Netflix, Disney+, IPTV, etc.). Desde aquí puedes **activar o desactivar** los servicios que deseas revender.

**Cómo funciona:**
1. Verás una lista de todos los servicios con su logo, nombre, categoría y **estado de disponibilidad** (🟢 Verde = OK, 🟡 Amarillo = con demoras, 🔴 Rojo = sin stock).
2. Para **activar** un servicio, toca el botón "+".
3. Para **desactivar** un servicio, toca el botón "−".

**Información visible por servicio:**
- Nombre del servicio
- Logo
- Categoría (STREAMING, IPTV, OTRO)
- Precio al costo (lo que tú pagas al admin)
- Precio sugerido de venta (al público)
- Estado actual de stock

> [!NOTE]
> Tu plan puede tener un **límite de servicios activos**. Si alcanzas el límite, se te mostrará un aviso para mejorar tu plan.

> [!TIP]
> Activa solo los servicios que realmente vas a vender. Esto mantiene tu catálogo limpio y tu enlace público atractivo.

---

### 4.3 Mis Servicios

**Ruta:** `/imagenes` (sección "Mis Servicios")

Esta es tu **central operativa**. Por cada servicio que tengas activo, se muestra una tarjeta independiente con dos pestañas:

#### Pestaña 🔑 Cuentas
Aquí aparecen las **cuentas con su correo y contraseña** que tú has pedido y están activas. Hay dos casos:
- **ENTREGA INMEDIATA ⚡:** Cuentas que el administrador te entregó rápido al momento de hacer tu pedido. Solo tocas el botón "COPIAR" y se copia al portapapeles.
- **CUENTA ASIGNADA:** Cuentas oficiales registradas en el inventario. Te permite presionar el ojo para ver u ocultar la clave.

#### Pestaña 📋 Pedidos
Historial de tus solicitudes que has mandado al administrador sobre esta cuenta en específico. Muestra:
- Cantidad que pediste.
- Fecha que hiciste el pedido.
- Estado (PENDIENTE / EN_PROCESO / COMPLETADO / CANCELADO).

**Botón "PEDIR":**
Cada tarjeta individual tiene un botón rojo grande de "PEDIR" (Carrito). Al tocarlo, envías una solicitud al administrador diciendo cuántas pantallas necesitas de ese producto en particular.

> [!IMPORTANT]
> Las pestañas son **independientes por tarjeta**. Cambiar entre "Cuentas" y "Pedidos" en Netflix NO afecta la pestaña activa de Disney+ u otros servicios.

---

### 4.4 Pedidos

**Ruta:** `/pedidos`

Módulo dedicado para **solicitar credenciales** al administrador. Es el flujo principal de compra.

#### Cómo hacer un pedido:
1. Toca el botón **"+"** en la esquina superior derecha.
2. Selecciona el servicio (ej: Netflix, Disney+, etc.) — verás el precio por cuenta.
3. Indica la **cantidad** de cuentas que necesitas.
4. Escribe los **detalles** del pedido (ej: "Perfil de pantalla completa", "Para 3 dispositivos").
5. **Sube un comprobante de pago** (foto de tu transferencia/QR).
6. Verifica el **MONTO TOTAL** que se calcula automáticamente.
7. Toca **"ENVIAR"**.

#### Después de enviar:
- Tu pedido aparece con estado **PENDIENTE** (🟡).
- El admin lo revisa, puede pasarlo a **EN_PROCESO** (🔵).
- Cuando el admin lo aprueba y envía las credenciales, pasa a **COMPLETADO** (🟢).
- Las credenciales aparecen automáticamente en la pestaña "Cuentas" de Mis Servicios.
- Si hay algún problema, puede quedar **CANCELADO** (🔴).

> [!TIP]
> Siempre adjunta un comprobante de pago claro. Pedidos sin comprobante pueden tardar más en procesarse.

---

### 4.5 Imágenes / Banco Promocional

**Ruta:** `/imagenes`

Banco de imágenes proporcionadas por el admin para que uses en tu marketing. Incluye todo tipo de contenido visual organizado por servicio.

**Funciones:**
- Las imágenes se descargan con **marca de agua** personalizada (tu nombre/alias) para proteger el contenido.
- Puedes filtrar por servicio o etiqueta.
- Descarga individual o masiva.

---

### 4.6 Flyers

**Ruta:** `/flyers`

Material gráfico tipo **flyer** para compartir en WhatsApp, Facebook e Instagram. Son imágenes de alta calidad diseñadas para promocionar los servicios.

**Funciones:**
- Ver todos los flyers disponibles
- Descargar uno por uno
- **"DESCARGAR TODAS"** — descarga todas las imágenes en lote

---

### 4.7 Promociones

**Ruta:** `/promociones`

Similar a Flyers, pero específico para **ofertas y promociones temporales** del admin. Puede incluir descuentos, combos, o campañas especiales.

**Funciones:**
- Galería de imágenes de promoción
- Descarga individual o masiva
- Etiquetas para identificar el tipo de promoción

---

### 4.8 Estrenos

**Ruta:** `/estrenos`

Feed de **novedades de streaming**: nuevas series, películas, temporadas que se estrenarán o ya se estrenaron. El admin publica esta información para que los vendedores la usen como herramienta de venta.

**Funciones:**
- Filtro por plataforma (Netflix, Disney+, HBO, Amazon, Apple TV+, etc.)
- Barra de búsqueda por título
- Cada estreno muestra: título, descripción, plataforma, fecha y poster
- Descarga de poster individual o masiva

> [!TIP]
> Comparte los estrenos con tus clientes para generar interés y ventas. Un cliente que ve que Netflix tiene una serie nueva es más propenso a renovar.

---

### 4.9 Partidos / Cartelera TV

**Ruta:** `/partidos`

**Cartelera deportiva** con los partidos del día y próximos. Ideal para vendedores de IPTV.

**Información por partido:**
- Equipos (con logos)
- Liga / Campeonato
- Hora del partido
- Canal de transmisión
- Indicador de si requiere IPTV

**Funciones:**
- Copiar información del partido al portapapeles
- Descargar fixture como imagen (para compartir en redes)
- Descargar todos los fixtures del día

> [!NOTE]
> Los partidos que requieren IPTV se marcan especialmente. Es una oportunidad para promocionar tu servicio de IPTV.

---

### 4.10 Mensajes Rápidos (Scripts)

**Ruta:** `/mensajes`

Plantillas de **mensajes prediseñados** que puedes copiar y pegar directamente en WhatsApp para vender a tus clientes.

**Cómo funciona:**
- Cada mensaje es un "script" con texto listo para enviar.
- Los mensajes pueden contener **variables dinámicas** que se reemplazan automáticamente:
  - `[PRECIO]` → Precio del servicio
  - `[WHATSAPP]` → Tu número de WhatsApp
  - `[NOMBRE_VENDEDOR]` → Tu alias
  - `[SERVICIO]` → Nombre del servicio
- Si un script tiene variables de precio/servicio, se genera una versión por cada servicio activo.
- Solo toca la tarjeta del mensaje para **copiarlo al portapapeles** inmediatamente.

> [!TIP]
> Usa estos scripts para comunicarte de forma profesional con tus clientes. Son diseñados para maximizar conversiones.

---

### 4.11 Calculadora de Ganancias

**Ruta:** `/calculadora`

Herramienta para **proyectar tus ingresos mensuales**.

**Campos:**
1. **Costo por cuenta (Bs):** Lo que tú pagas por una cuenta.
2. **Precio de venta (Bs):** Lo que le cobras a tu cliente.
3. **Cartera de clientes:** Cuántos clientes tienes activos.

**Resultados:**
- **Utilidad por unidad:** Ganancia por cada venta.
- **Flujo mensual estimado:** Ganancia total al mes con tu cartera actual.

---

### 4.12 Historial de Activaciones

**Ruta:** `/historial`

Registro completo de **todos los servicios que has activado** en tu cuenta a lo largo del tiempo.

**Información:**
- Nombre y logo del servicio
- Fecha de activación
- Categoría (Streaming, IPTV, Otro)
- Estado actual (Activo / Inactivo)
- Precio de venta configurado

**Filtros:** TODOS | ACTIVOS | INACTIVOS

**Estadísticas:** Total de servicios, activos actual y inactivos.

---

### 4.13 Marketplace

**Ruta:** `/marketplace`

El **Mercado Global** permite descubrir servicios ofrecidos por **otros proveedores** dentro de la red Ares. Es un espacio para expandir tu catálogo con productos de terceros.

**Funciones:**
- Buscar servicios o proveedores
- Ver precio, descripción y proveedor de cada servicio
- **Contactar al proveedor** vía WhatsApp con un mensaje pre-armado
- **Proponer tu propio servicio** si eres proveedor (botón "PROPONER SERVICIO")

**Para proponer un servicio:**
1. Toca "+"
2. Completa: nombre, descripción, precio base, URL del logo
3. Envía a revisión del admin

> [!NOTE]
> No todos los planes permiten ser proveedor en el Marketplace. Consulta los detalles de tu plan.

---

### 4.14 Mi Plan / Suscripción

**Ruta:** `/plan`

Tu centro de **gestión de suscripción**.

**Vista principal:**
- Nombre de tu plan actual (ej: "PLAN PRO")
- **Medidor de energía:** Barra visual de días restantes
- Fecha exacta de vencimiento
- Alerta cuando quedan menos de 5 días

**Flujo de renovación:**
1. **PASO 1 — Pagar:** Escanea el código QR visible o transfiere al número Tigo Money indicado.
2. **PASO 2 — Subir comprobante:** Selecciona la foto de tu comprobante de pago.
3. Toca **"ENVIAR COMPROBANTE"**.
4. Tu pago queda en estado **"EN REVISIÓN"** (🟡).
5. El admin lo valida y extiende tu suscripción automáticamente.

> [!WARNING]
> Si tu suscripción vence sin renovar, tu acceso será bloqueado y serás redirigido a la pantalla de renovación.

---

### 4.15 Perfil

**Ruta:** `/perfil`

Configuración de tu cuenta personal.

**Campos editables:**
- **Nombre:** Tu nombre completo.
- **Alias:** Tu marca comercial (aparece en tu enlace público y marcas de agua).
- **WhatsApp:** Número de contacto (con código de país).
- **API de WhatsApp:** Si deseas automatizar mensajes vía API (avanzado).

**Funciones adicionales:**
- **Enlace público:** Copia y comparte tu URL personalizada `ares.com/u/tu-alias` con tus clientes.
- **Código QR:** Genera un QR con tu enlace público para imprimirlo o compartirlo.
- **Notificaciones push:** Activa/desactiva las notificaciones del sistema.
- **Cerrar sesión.**

> [!TIP]
> Configura tu alias de forma corta y memorable. Es lo que verán tus clientes en tu enlace público.

---

### 4.16 Enlace Público de Vendedor

**Ruta:** `/u/[tu-alias]` (ej: `tudominio.com/u/tiendamax`)

Esta es tu **página de tienda pública** visible para tus clientes finales (no necesitan cuenta Ares).

**Qué ven tus clientes:**
- Tu logo y nombre comercial
- Sello "TIENDA VERIFICADA POR ARES"
- Cantidad de servicios, garantía, y pertenencia a la red Ares
- **Catálogo completo** con cada servicio, precio y descripción
- Botón **"CONTRATAR"** que abre WhatsApp directamente contigo con un mensaje automático para que el cliente te escriba.

> [!TIP]
> Comparte este enlace en tus redes sociales y WhatsApp. Es tu vitrina profesional y genera confianza inmediata.

---

## 5. Guía del Administrador

### 5.1 Dashboard

**Ruta:** `/admin/dashboard`

Centro de mando con **métricas en tiempo real**.

**Métricas principales:**
| Métrica | Descripción |
|---------|-------------|
| **Ingresos MRR** | Valor total de suscripciones activas por mes |
| **Vendedores Activos** | Cantidad de vendors con suscripción vigente |
| **Vencimientos** | Suscripciones que vencen en los próximos 3 días |
| **Pagos Pendientes** | Comprobantes esperando validación |

**Gráficos:**
- **Servicios Activos:** Ranking de los servicios más populares entre vendedores
- **Crecimiento Semanal:** Gráfico de barras con nuevos registros por semana
- **Actividad Reciente:** Timeline de últimas acciones (registros, pagos, pedidos)
- **Intenciones de Compra:** Servicios más solicitados del Marketplace

---

### 5.2 Vendedores

**Ruta:** `/admin/vendedores`

Gestión completa de la base de vendedores.

**Funciones:**
- Lista de todos los vendedores con estado, plan, y fecha de vencimiento
- Buscar vendedores por nombre o alias
- Ver detalles de cada vendedor
- Cambiar plan de un vendedor
- Extender suscripción manualmente
- Suspender o reactivar cuentas

---

### 5.3 Servicios Base

**Ruta:** `/admin/servicios`

El **catálogo maestro** de servicios que ofreces a tus vendedores.

**Para crear un servicio:**
1. Toca "NUEVO SERVICIO"
2. Completa:
   - Nombre (ej: "Netflix 1 Pantalla")
   - Logo (URL de imagen)
   - Descripción
   - **Precio por Cuenta** (el costo real al que le vendes al proveedor)
   - Categoría (Streaming, IPTV, Otro)
   - Estado (Verde, Amarillo, Rojo)
3. Guarda el servicio

**Gestión:**
- Activar / Desactivar servicios
- Editar precios y descripciones
- Cambiar el estado de disponibilidad

> [!IMPORTANT]
> El **Precio por Cuenta** es lo que el vendedor paga al hacer un pedido. El vendedor establecerá su propio precio de venta al público en su panel.

---

### 5.4 Credenciales

**Ruta:** `/admin/credenciales`

Inventario de **cuentas de usuario/contraseña** por servicio.

**Para agregar una credencial:**
1. Toca "NUEVA CREDENCIAL"
2. Selecciona el **servicio** (ej: Netflix)
3. Ingresa **usuario** y **contraseña**
4. Opcionalmente: perfil, notas internas
5. Guarda

**Gestión:**
- Ver credenciales disponibles vs. asignadas
- Asignar manualmente a un vendedor
- Marcar como disponible/no disponible
- Filtrar por servicio

> [!NOTE]
> Las credenciales se pueden entregar de dos formas: (1) escribiendo los datos directamente en la respuesta de un pedido (entrega inmediata), o (2) creándolas aquí y asignándolas formalmente a un vendedor (para control de inventario a largo plazo).

---

### 5.5 Pedidos

**Ruta:** `/admin/pedidos`

Gestión de las **solicitudes de credenciales** hechas por los vendedores.

**Información por pedido:**
- Vendedor que lo solicitó
- Servicio y cantidad solicitada
- Comprobante de pago (botón "VER COMPROBANTE ORIGINAL")
- Notas del vendedor
- Estado actual
- Respuesta del admin

**Flujo de procesamiento:**
1. El vendedor envía un pedido → aparece como **PENDIENTE**
2. El admin verifica el comprobante de pago
3. Si el pago es correcto:
   - Cambia estado a **COMPLETADO**
   - Escribe las credenciales en el campo "Respuesta" (ej: "Usuario: maria@email.com / Pass: abc123")
   - El vendedor las verá inmediatamente en su pestaña "Cuentas"
4. Si hay problema:
   - Cambia estado a **CANCELADO**
   - Escribe la razón en "Respuesta"

---

### 5.6 Pagos

**Ruta:** `/admin/pagos`

Historial de **pagos de suscripción** de los vendedores.

**Funciones:**
- Ver todos los pagos con estado (Pendiente, Confirmado, Rechazado)
- Ver comprobante adjunto
- **Confirmar pago:** Extiende automáticamente la suscripción del vendedor según los días del plan
- **Rechazar pago:** Notifica al vendedor del rechazo

---

### 5.7 Planes

**Ruta:** `/admin/planes`

Configuración de los **planes de suscripción** disponibles.

**Campos por plan:**
- Nombre (ej: "PLAN PRO", "PLAN BÁSICO")
- Precio en Bs
- Duración en días
- Tipo (SOLO_APP / COMBO_IPTV)
- Límite de servicios activos (null = ilimitado)
- Texto descriptivo del límite
- Pedidos automáticos (sí/no)
- Enlace público (sí/no)
- Proveedor en Marketplace (sí/no)

---

### 5.8 Imágenes (Banco)

**Ruta:** `/admin/imagenes`

Gestión del **banco de imágenes** que ven los vendedores.

**Para subir imágenes:**
1. Toca "SUBIR IMAGEN"
2. Selecciona la imagen
3. Asigna un título
4. Selecciona la categoría: FLYER, PROMO, ESTRENO, PARTIDO
5. Agrega etiquetas (ej: "Netflix", "Descuento", "Verano")
6. Opcionalmente vincula a un servicio específico
7. Guarda

> [!NOTE]
> Las imágenes vinculadas a un servicio solo las verán los vendedores que tengan ese servicio activo. Las imágenes sin servicio son visibles para todos.

---

### 5.9 Estrenos

**Ruta:** `/admin/estrenos`

Gestión del **feed de estrenos** de streaming.

**Para publicar un estreno:**
1. Toca "NUEVO ESTRENO"
2. Completa: título, descripción, plataforma, fecha, imagen
3. Guarda

Los vendedores lo verán automáticamente en su sección de Estrenos.

---

### 5.10 Partidos

**Ruta:** `/admin/partidos`

Gestión de la **cartelera deportiva**.

**Para agregar un partido:**
1. Toca "NUEVO PARTIDO"
2. Completa: equipo local, equipo visitante, liga, fecha, hora, canal
3. Sube logos de los equipos (opcional)
4. Marca si requiere IPTV
5. Guarda

---

### 5.11 Mensajes Rápidos

**Ruta:** `/admin/mensajes`

Creación y gestión de **scripts de venta** que usan los vendedores.

**Variables disponibles:**
| Variable | Se reemplaza por |
|----------|-----------------|
| `[PRECIO]` | Precio del servicio del vendedor |
| `[WHATSAPP]` | WhatsApp del vendedor |
| `[NOMBRE_VENDEDOR]` | Alias del vendedor |
| `[SERVICIO]` | Nombre del servicio |
| `[PARTIDO_HOY]` | Referencia a la cartelera |

**Ejemplo de template:**
```
¡Hola! 👋 Soy [NOMBRE_VENDEDOR]. Tengo [SERVICIO] disponible por solo [PRECIO] Bs. 
Escríbeme al [WHATSAPP] para activar tu cuenta al instante. ⚡
```

---

### 5.12 Marketplace

**Ruta:** `/admin/marketplace`

Gestión del **mercado de proveedores externos**.

**Funciones:**
- Revisar propuestas de servicios enviadas por vendedores
- Aprobar o rechazar servicios externos
- Configurar comisiones
- Monitorear intenciones de compra (analytics)

---

### 5.13 Ajustes de Plataforma

**Ruta:** `/admin/ajustes`

Configuración **global** de la plataforma (es un registro único).

**Campos:**
- **QR de cobro:** Imagen del código QR para pagos
- **Número Tigo Money:** Teléfono para transferencias
- **Texto legal:** Términos y condiciones
- **Nombre de la plataforma**
- **Logo de la plataforma**
- **Noticia global:** Aviso que aparece en el Home de todos los vendedores
- **WhatsApp de soporte:** Número de atención al cliente

---

## 6. Flujos de Trabajo Completos

### 🔄 Flujo 1: Vendedor pide una cuenta de Netflix

```
Vendedor                         Admin                          
   │                                │                          
   ├─ Abre "Pedidos"                │                          
   ├─ Toca "+"                      │                          
   ├─ Selecciona "Netflix"          │                          
   ├─ Cantidad: 1                   │                          
   ├─ Sube comprobante de pago      │                          
   ├─ Escribe notas                 │                          
   ├─ Toca "ENVIAR"                 │                          
   │         ──────────────────────►│                          
   │                                ├─ Ve el pedido PENDIENTE  
   │                                ├─ Abre "VER COMPROBANTE"  
   │                                ├─ Verifica el pago        
   │                                ├─ Escribe credenciales    
   │                                │   en la respuesta        
   │                                ├─ Cambia a COMPLETADO     
   │         ◄──────────────────────│                          
   ├─ Las credenciales aparecen     │                          
   │   en "Mis Servicios" →         │                          
   │   pestaña "Cuentas" como       │                          
   │   "ENTREGA INMEDIATA ⚡"       │                          
   ├─ Toca "COPIAR"                 │                          
   ├─ Pega al cliente por WhatsApp  │                          
   └─ ✅ Venta completada           │                          
```

### 🔄 Flujo 2: Vendedor renueva su suscripción

```
Vendedor                         Admin
   │                                │
   ├─ Abre "Mi Plan"                │
   ├─ Ve barra de días restantes    │
   ├─ Escanea QR o transfiere       │
   ├─ Sube foto del comprobante     │
   ├─ Toca "ENVIAR COMPROBANTE"     │
   │         ──────────────────────►│
   │  Estado: "PAGO EN REVISIÓN"    ├─ Abre "Pagos"
   │                                ├─ Ve el comprobante
   │                                ├─ Confirma el pago
   │         ◄──────────────────────│
   ├─ Suscripción extendida         │
   ├─ Barra de energía se llena     │
   └─ ✅ Plan renovado              │
```

### 🔄 Flujo 3: Admin sube material de marketing

```
Admin
   │
   ├─ Abre "Imágenes" en el panel
   ├─ Toca "SUBIR IMAGEN"
   ├─ Selecciona imagen
   ├─ Categoría: FLYER
   ├─ Vincula a servicio (ej: Netflix)
   ├─ Agrega etiquetas
   ├─ Guarda
   │
   └─ Los vendedores con Netflix
      activo verán la imagen en
      su sección "Flyers"
```

---

## 7. FAQ — Preguntas Frecuentes

### Para Vendedores

**P: ¿Por qué veo precios en 0?**  
R: Asegúrate de que el admin haya configurado el `precio_admin` para cada servicio base. Si acabas de activar un servicio nuevo, refresca la página.

**P: ¿Dónde veo las credenciales que el admin me envió?**  
R: En **Mis Servicios** → selecciona la tarjeta del servicio → pestaña **"🔑 Cuentas"**. Las credenciales enviadas al aprobar un pedido aparecen como "ENTREGA INMEDIATA ⚡".

**P: ¿Puedo vender servicios que no están en el catálogo?**  
R: Sí, a través del **Marketplace** puedes proponer servicios nuevos o contactar a otros proveedores.

**P: ¿Qué pasa si mi suscripción vence?**  
R: Tu acceso será bloqueado y serás redirigido a la pantalla de renovación. No perderás tus datos ni configuración.

**P: ¿La app funciona sin internet?**  
R: La app se puede abrir como PWA instalada, pero requiere conexión a internet para todas las funciones.

**P: ¿Qué significa cada color de estado?**  
R: 🟡 **PENDIENTE** = En espera | 🔵 **EN PROCESO** = Siendo trabajado | 🟢 **COMPLETADO** = Listo | 🔴 **CANCELADO** = Rechazado o anulado

### Para Administradores

**P: ¿Cómo entrego credenciales al vendedor?**  
R: Al completar un pedido, escribe los datos de acceso en el campo "Respuesta". El vendedor los verá automáticamente en su pestaña "Cuentas". Opcionalmente, puedes crear la credencial en `/admin/credenciales` y asignarla formalmente para tener inventario registrado.

**P: ¿Cómo cambio el QR de cobro?**  
R: En **Ajustes** → sube la nueva imagen de QR.

**P: ¿Puedo tener diferentes precios para diferentes vendedores?**  
R: Actualmente, el `precio_admin` es global por servicio. Todos los vendedores pagan el mismo precio por servicio.

---

## 8. Recomendaciones y Buenas Prácticas

### Para Vendedores

1. **Instala la app** como PWA para acceder más rápido
2. **Activa las notificaciones** push para enterarte de estrenos y novedades al instante
3. **Usa los Scripts Rápidos** para comunicarte profesionalmente con tus clientes
4. **Comparte tu enlace público** (`/u/tu-alias`) en todas tus redes sociales
5. **Sube un logo** en tu perfil para que aparezca en tu enlace público
6. **Renueva tu plan con tiempo** — no esperes al último día
7. **Usa la Calculadora** para fijar precios rentables
8. **Descarga los flyers y estrenos** para compartirlos con tu cartera de clientes
9. **Siempre adjunta comprobante** de pago en tus pedidos para agilizar la entrega

### Para Administradores

1. **Revisa los pagos pendientes** diariamente para no dejar esperando a los vendedores
2. **Mantén el estado de los servicios actualizado** (Verde/Amarillo/Rojo) para que los vendedores sepan qué vender
3. **Sube contenido fresco** (flyers, estrenos) regularmente para mantener a los vendedores activos
4. **Configura la noticia global** para comunicar avisos importantes masivamente
5. **Responde los pedidos con datos claros** para que el vendedor pueda copiar y pegar
6. **Monitorea las Intenciones de Compra** del Marketplace para expandir el catálogo con servicios que demandan los vendedores
7. **Actualiza los partidos** diariamente para la cartelera deportiva, especialmente si vendes IPTV

---

> **Plataforma Ares v3** — Potenciando redes de distribución digital.
