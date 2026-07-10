La interfaz se implementa bajo un patrón Dashboard Layout con una distribución basada en un contenedor principal compuesto por un panel de navegación lateral (Sidebar) y un panel de contenido (Content Area). El objetivo del diseño es priorizar la visualización de la planificación semanal, manteniendo accesibles los controles de navegación temporal y el contexto del calendario mensual.

1. Arquitectura de Layout

La interfaz se organiza mediante un layout de dos columnas.

AppLayout
│
├── Sidebar (ancho fijo)
│
└── MainContent (ancho flexible)
Sidebar
Posición: izquierda.
Anchura fija (≈260–300 px).
Altura: 100% del viewport.
Comportamiento:
Sticky o Fixed.
Independiente del scroll del contenido principal.
MainContent
Posición: derecha.
Anchura adaptable.
Display: flex-column.
Ocupa el espacio restante del viewport.
2. Estructura jerárquica de componentes
CalendarPage

├── Sidebar
│   ├── ApplicationHeader
│   ├── NavigationMenu
│   ├── Divider
│   └── MiniMonthCalendar
│
└── MainContent
    ├── PageHeader
    ├── CalendarToolbar
    └── WeekCalendar

Cada componente posee responsabilidades claramente definidas siguiendo el principio Single Responsibility.

3. Sidebar

El Sidebar concentra la navegación global de la aplicación y elementos auxiliares.

3.1 ApplicationHeader

Responsabilidad:

Mostrar identidad de la aplicación.
Permitir retorno al Dashboard.

Componentes:

Logo
Nombre del sistema
3.2 NavigationMenu

Lista vertical de acciones principales.

NavigationMenu

Calendar

Tasks

Projects

Reminders

Settings

Cada elemento corresponde a un componente:

NavigationItem

icon

label

route

active

disabled

Características:

Estado activo.
Soporte para permisos.
Navegación mediante Router.
3.3 MiniMonthCalendar

Responsabilidad:

Mostrar el contexto temporal sin abandonar la vista semanal.

Debe permitir:

visualizar el mes actual;
identificar la semana visible;
seleccionar otra semana;
cambiar de mes.

Componentes internos:

MiniCalendar

Header
Body
Footer

Header:

<

Julio 2026

>

Body:

Matriz de 7×6 días.

Footer:

Indicador de semana seleccionada.

4. MainContent

El contenido principal se estructura verticalmente.

MainContent

PageHeader

Toolbar

CalendarGrid
5. PageHeader

Responsabilidad:

Contextualizar la vista actual.

Contiene:

Título

Subtítulo

Ejemplo:

Semana actual

Vista semanal

No incorpora acciones.

6. CalendarToolbar

Representa la barra principal de interacción temporal.

Se divide en cuatro grupos funcionales.

Toolbar

NavigationGroup

RangeSelector

ViewSelector

PrimaryAction
6.1 NavigationGroup

Controles de navegación relativa.

<

Hoy

>

Acciones:

PreviousWeek()
GoToCurrentWeek()
NextWeek()

Debe actualizar:

rango visible;
mini calendario;
eventos.
6.2 RangeSelector

Componente desplegable.

21–27 Julio 2026 ▼

Permite:

seleccionar cualquier semana;
abrir Date Picker;
navegar por meses.

Evento principal:

onWeekSelected()
6.3 ViewSelector

Control para cambiar el modo de representación.

Semana ▼

Opciones:

Día
Semana
Mes
Agenda

Debe modificar únicamente el componente de visualización.

6.4 PrimaryAction

Botón de acción principal.

Nueva actividad

Evento:

CreateEvent()

Debe permanecer visible independientemente del desplazamiento vertical.

7. WeekCalendar

Es el componente principal del sistema.

Representa una cuadrícula temporal.

Su estructura interna es:

WeekCalendar

Header

TimeAxis

DaysGrid

EventsLayer
7.1 Header

Representa los días visibles.

Lun

Mar

Mié

Jue

Vie

Sáb

Dom

Cada columna contiene:

DayHeader

weekday

dayNumber

todayIndicator
7.2 TimeAxis

Columna fija.

Contiene intervalos horarios.

08:00

09:00

10:00

...

18:00

Resolución configurable:

15 minutos
30 minutos
60 minutos
7.3 DaysGrid

Matriz de planificación.

Dimensiones:

7 columnas

N filas

Donde:

column = día

row = intervalo horario

Cada celda representa un intervalo temporal.

7.4 EventsLayer

Capa flotante encargada de renderizar eventos.

Cada actividad es un componente independiente.

CalendarEvent

id

title

start

end

status

assignee

priority

color

metadata

El posicionamiento se calcula mediante:

top = startTime

height = duration

left = dayColumn

No depende del DOM estático.

Puede renderizarse mediante posicionamiento absoluto.

8. Sincronización entre componentes

La navegación modifica un único estado global.

CalendarState

selectedDate

selectedWeek

selectedMonth

viewMode

events

Cuando cambia la semana:

PreviousWeek()

↓

selectedWeek

↓

Toolbar

↓

MiniCalendar

↓

WeekCalendar

↓

API Request

↓

Render

Todos los componentes consumen el mismo estado para mantener consistencia visual.

9. Flujo funcional
Usuario

↓

Selecciona semana

↓

Toolbar

↓

CalendarController

↓

CalendarService

↓

API

↓

Response

↓

Store

↓

Render WeekCalendar

↓

Actualizar MiniCalendar
10. Requisitos de interacción

La interfaz debe cumplir los siguientes comportamientos funcionales:

La vista inicial siempre corresponde a la semana actual.
La navegación semanal debe realizarse mediante controles relativos (Semana anterior y Semana siguiente) sin recargar la página.
El botón Hoy debe restablecer la visualización a la semana actual desde cualquier contexto temporal.
El calendario mensual en miniatura debe sincronizarse automáticamente con la semana seleccionada y resaltar el rango correspondiente.
La selección de una fecha en el mini calendario debe actualizar inmediatamente la vista semanal.
El selector de vista debe permitir alternar entre Día, Semana, Mes y Agenda, reutilizando el mismo estado de calendario.
El componente WeekCalendar debe soportar renderizado dinámico de eventos, actualización incremental y carga asíncrona de actividades para optimizar el rendimiento.

Desde una perspectiva de ingeniería de software, esta arquitectura favorece una alta cohesión y bajo acoplamiento, permitiendo que componentes como MiniMonthCalendar, CalendarToolbar y WeekCalendar sean reutilizables e independientes. Asimismo, facilita la integración con arquitecturas SPA basadas en React, Vue, Angular, OWL (Odoo) o cualquier framework orientado a componentes, mediante un estado centralizado y un flujo unidireccional de datos.