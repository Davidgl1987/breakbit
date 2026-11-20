# Publicaciones del lanzamiento (fase 1)

Textos listos para copiar. Lo que va entre corchetes es para adaptarlo a tu voz; el resto se puede
pegar tal cual. Cada enlace lleva su `?ref=`, que GoatCounter muestra junto a la primera visita,
así sabrás de dónde llega cada persona.

Las capturas, el gif y el vídeo se generan con `pnpm screenshots` en `docs/lanzamiento/capturas/`
(no van al repo).

| Dónde | Enlace |
| --- | --- |
| LinkedIn | `https://breakbit.app/?ref=linkedin` |
| Reddit | `https://breakbit.app/?ref=reddit` |
| Indie Hackers | `https://breakbit.app/?ref=indiehackers` |
| Amigos y WhatsApp | `https://breakbit.app/?ref=amigos` |

---

## LinkedIn (español)

**Cuándo:** martes, miércoles o jueves, entre las 8:00 y las 9:30.
**Qué adjuntar:** el vídeo `es-pausa.mp4`. Si prefieres imágenes, sube un carrusel con
`es-1-portada`, `es-2-hoy`, `es-4-pausa-hecha` y `es-6-evoluciona`.
**Enlace:** en el primer comentario, no en el texto (LinkedIn enseña menos las publicaciones con
enlaces externos).

> [Llevo años trabajando delante de una pantalla] y siempre me pasaba lo mismo: sabía que tenía que
> levantarme de vez en cuando, pero llegaba la hora de comer sin haberme movido de la silla.
>
> Así que he hecho Breakbit, una app pequeña para eso.
>
> 👉 Le cuentas tu horario, si tienes alguna molestia (cuello, lumbares, muñecas…) y qué material
> tienes a mano. Sin material también vale.
> 👉 Durante la jornada te propone pausas de 1 a 3 minutos para hacer junto a la mesa. ¿Estás en una
> reunión? La pospones.
> 👉 Cada día, una actividad algo más larga: un paseo, estiramientos o una rutina corta.
> 👉 Y un avatar pixelado que pasa de encorvado a «optimizado» según lo constante que seas 🙃
>
> Tenía claras unas cuantas cosas:
> · Gratis y sin cuenta. Tus datos no salen de tu dispositivo.
> · Funciona en el navegador del ordenador y se puede instalar en el móvil.
> · Nada de rutinas de 30 minutos: pausas que de verdad caben en un día de trabajo.
>
> Ahora busco gente que la pruebe un par de semanas y me diga con sinceridad qué sobra, qué falta y
> qué no funciona. Dentro de la app hay un botón de «Opiniones»: son 2 minutos.
>
> El enlace, en el primer comentario. Y si conoces a alguien que se pase el día sentado, pásaselo;
> me ayuda muchísimo 🙏
>
> #teletrabajo #salud #ergonomía #productividad #sideproject

**Primer comentario:**

> Aquí la tienes: https://breakbit.app/?ref=linkedin
>
> Un consejo: déjala abierta en una pestaña o instálala (botón «Instalar» del navegador). Así te
> avisa de cada pausa.

---

## Reddit, r/SideProject (inglés)

**Cuándo:** martes a jueves, entre las 15:00 y las 17:00 (hora de España; por la mañana en EE. UU.).
**Tipo:** publicación de imágenes con texto. Galería con `en-3-pausa`, `en-2-hoy`,
`en-4-pausa-hecha` y `en-6-evoluciona`, o solo `en-pausa.gif`.
**Después:** contesta a todos los comentarios durante las 2 primeras horas; es lo que más la mueve.

**Título:**

> I built a free web app that plans 1–3 minute movement breaks into your workday (no account,
> pixel-art avatar that evolves)

**Texto:**

> Hi r/SideProject! I spend most of my day at a desk and kept reaching lunch without having stood
> up once. The apps I tried were either a bare timer or 30-minute workout plans, so I built Breakbit.
>
> **How it works**
>
> - You tell it your working hours, any discomfort (neck, lower back, wrists…) and what equipment
>   you have. None is fine.
> - It plans your day: short 1–3 minute breaks with exercises you can do next to your desk, plus one
>   longer activity (a walk, stretches or a short routine).
> - In a meeting? Postpone it. A few spare minutes? Tap "I have a gap" and get something that fits.
> - A pixel-art avatar goes from slouched to "optimized" as you string together good weeks.
>
> **Some choices I made**
>
> - Free, no account, no sign-up. Everything stays on your device; the only analytics are
>   anonymous, cookieless page counts (GoatCounter) that you can switch off.
> - It's a PWA: it runs in the browser, installs on desktop and phone and works offline.
> - React + Vite, no backend.
>
> It's available in English and Spanish. I'd love honest feedback, especially:
>
> 1. Would you actually keep it open during your workday?
> 2. Are the exercises useful, or too basic (or too awkward for an office)?
> 3. Was anything confusing in the first minute?
>
> https://breakbit.app/?ref=reddit
>
> (Not medical advice: if something hurts, see a professional.)

**Otros sitios para el mismo texto, con su propio `?ref=`:**

- **r/webdev:** solo los sábados, en el hilo «Showoff Saturday». Cuenta más la parte técnica: PWA,
  sin backend, avisos locales, datos en IndexedDB.
- **Indie Hackers:** en la sección de productos, con el texto de Reddit algo más corto y
  `?ref=indiehackers`.

---

## Amigos, familia y WhatsApp (español)

> ¡Hola! He hecho una app para no pasarme el día entero sentado: te propone pausas de 1 a 3 minutos
> durante la jornada, con ejercicios para hacer junto a la mesa. Es gratis y no hace falta cuenta.
>
> ¿Me haces el favor de probarla un par de semanas? Lo que más me ayuda es que me digas qué no te
> gusta 😅 Dentro hay un botón de «Opiniones».
>
> https://breakbit.app/?ref=amigos

---

## Antes de publicar

- [x] El formulario de opiniones está también en inglés (`FEEDBACK_URL_EN`): quien use la app en
      inglés lo verá en inglés.
- [ ] Abre https://breakbit.app en el móvil y en el ordenador y haz el alta completa una vez.
- [ ] Ten a mano la [nota para testers](nota-testers.md) para quien pregunte o se apunte.
