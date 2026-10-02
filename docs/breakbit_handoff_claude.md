# Breakbit — Handoff para implementación

## Qué usar como fuente de verdad
1. `breakbit_mvp_master_v1.md` — especificación funcional y decisiones UX.
2. `breakbit_backlog_tecnico_mvp_v1.md` — backlog técnico por pantallas/áreas.
3. `breakbit_mvp_v1.md` — requisitos resumidos del MVP.
4. `references/` — mocks y referencias visuales; son guía, no pixel-perfect.
5. `assets/icons/` — librería inicial de iconos; puede refinarse posteriormente.

## Regla sobre assets pendientes
No bloquear implementación por arte.

Mientras falten:
- evoluciones finales del avatar;
- poses de ánimo/celebración;
- assets de habitación;
- imágenes/frames/GIF de ejercicios;

usar placeholders con interfaces de assets estables para que después sea trivial sustituirlos.

## Prioridades
- mobile-first;
- PWA;
- estado local en MVP;
- componentes reutilizables;
- lógica y datos desacoplados de la UI;
- tests para reglas de planificación, ventanas de micropausas, día bueno, semana buena y XP;
- evitar sobrearquitectura.

## Dirección visual
- UI moderna y limpia.
- Pixel art solo para identidad, avatar, iconos y gamificación.
- Modo claro: arena/crema, no blanco puro.
- Verde como acento principal.
- Modo oscuro equivalente.
- Navegación inferior con tres tabs centrados: `Hoy`, `Progreso`, `Ajustes`.
- `Tengo un hueco` es un botón flotante horizontal, centrado, ligeramente por encima e integrado visualmente con la bottom nav.

## Orden recomendado de implementación
1. shell + routing + tokens + componentes;
2. modelo/persistencia;
3. onboarding;
4. inicio de jornada + generador de plan;
5. Home;
6. notificaciones/ventanas/aplazamientos;
7. flujo de ejercicio;
8. `Tengo un hueco`;
9. cierre de jornada;
10. progreso/gamificación;
11. ajustes;
12. PWA hardening y dogfooding.
