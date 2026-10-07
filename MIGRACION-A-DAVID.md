# Migración del widget a la cuenta de David — runbook

Para el día de la transferencia (previsto: jueves 8 de octubre de 2026).

**Reserva un bloque de 1 a 2 horas con David disponible.** El reloj empieza a correr
cuando él acepta la transferencia: desde ese momento `mauricio-dev-ad.github.io` deja de
servir el JSON y las 18 landings muestran las 9 reseñas de respaldo que tienen escritas
dentro, hasta que se actualicen. No se rompe nada, pero es contenido congelado — conviene
que el hueco dure minutos, no días.

> ⚠️ **No elimines tu cuenta de GitHub hasta terminar la fase 4.** Si la borras antes,
> el repositorio se va con ella.

---

## Estado al 2026-10-07 — migración ejecutada

| Fase | Estado |
|---|---|
| 1. Transferencia y Pages | ✅ Hecha. Repo en `iolidavid`, Pages activo, URL nueva responde con CORS correcto |
| 2. Computadora de Mauricio | ✅ Hecha. Código, remote y scraper apuntan a `iolidavid`; el bootstrap publica OK |
| 3. Landings de Kajabi | ✅ 17 de 17 editadas y verificadas byte a byte. **Falta `certificacion-claude`** (test A/B) |
| 4. Computadora de Marypier | ⏳ Pendiente (no estaba configurada aún) |
| 5. Cierre | ⏳ Pendiente: token de David, comprobar las dos tareas diarias, y solo entonces eliminar la cuenta |

**Atención con el token:** hoy el scraper publica con el token de `mauricio-dev-ad`, que sigue
teniendo permiso de escritura en el repo nuevo. **Dejará de servir al eliminar la cuenta**, así que
David tiene que emitir el suyo antes de ese día (ver la guía).

**Nota sobre la caché de Kajabi:** tras editar, algunas páginas pueden seguir sirviendo la versión
anterior durante un rato a quien entra por la URL exacta; con cualquier parámetro (`?x=1`) ya salen
actualizadas. Se refresca sola.

---

## Estado al 2026-10-06 (antes del dia D)

Ya se actualizo el **respaldo** del widget en 17 de las 18 landings (las 9 resenas quemadas
pasaron a ser copia de lo publicado hoy, y el contador de 366 a 415). Eso significa que el
jueves, cuando muera la URL vieja, las landings mostraran resenas de octubre de 2026 en vez
de las de diciembre de 2025 — el hueco se vuelve practicamente invisible.

Consecuencia practica: **el jueves solo hay que cambiar la URL** en esas 17 paginas, sobre un
mecanismo ya probado y verificado byte a byte.

> ⚠️ **`certificacion-claude` quedo fuera a proposito:** tiene un test A/B activo, con dos
> variantes de tema (2167559522 y 2167559523). Mauricio la actualiza por su cuenta, y el jueves
> hay que acordarse de cambiar la URL en **las dos variantes**, no solo en una.

---

## Fase 1 — GitHub (Mauricio y David) · ~20 min

- [ ] **1.1 Mauricio transfiere el repo.** En `github.com/mauricio-dev-ad/trustpilot-widget`
      → **Settings** → abajo del todo, *Danger Zone* → **Transfer** → escribir `iolidavid`
      y confirmar con el nombre del repo.

- [ ] **1.2 David acepta.** Le llega un correo y tiene **24 horas**. Si se pasa el plazo,
      la transferencia se cancela y hay que repetirla.

- [ ] **1.3 David activa GitHub Pages.** En el repo ya transferido: **Settings → Pages** →
      Source: *Deploy from a branch* → rama `main`, carpeta `/ (root)` → **Save**.
      Tarda uno o dos minutos en publicar.

- [ ] **1.4 Comprobar que la URL nueva responde.** En el navegador:
      `https://iolidavid.github.io/trustpilot-widget/reviews.json`
      Debe mostrar el JSON con las reseñas. **No sigas hasta que esto funcione.**

- [ ] **1.5 David emite los tokens.** Dos, uno por computadora, para poder revocar cada
      uno por separado. En <https://github.com/settings/personal-access-tokens/new>:
      - Nombres: `Trustpilot Widget — PC Mauricio` y `Trustpilot Widget — PC Marypier`
      - Expiration: la máxima que ofrezca → **anotar la fecha**
      - Repository access → *Only select repositories* → `trustpilot-widget`
      - Repository permissions → **Contents: Read and write**

      Se los pasa por canal privado. Los tokens actuales (los emitidos desde la cuenta de
      Mauricio) dejan de servir en cuanto el repo cambia de dueño.

---

## Fase 2 — Computadora de Mauricio (lo hace Claude) · ~15 min

- [ ] **2.1** Poner el token nuevo en `C:\Users\pc\trustpilot-widget\github-token.txt`
- [ ] **2.2** Apuntar el remote al repo nuevo:
      `git remote set-url origin https://github.com/iolidavid/trustpilot-widget.git`
- [ ] **2.3** Cambiar las tres referencias a `iolidavid` y subirlas:
      - `fetch-reviews-puppeteer.js` → `GITHUB_USER`
      - `bootstrap.ps1` → `$RepoUrl`
      - `trustpilot-widget.html` → `CONFIG.liveUrl`
- [ ] **2.4** Correr el actualizador completo y confirmar que termina con
      `✓ GitHub Pages actualizado → https://iolidavid.github.io/...`
- [ ] **2.5** Verificar que el JSON de la URL nueva tiene el `fetchedAt` de hoy

**Si 2.4 o 2.5 fallan, parar aquí.** No se toca Kajabi hasta que la URL nueva publique bien.

---

## Fase 3 — Las 18 landings de Kajabi (lo hace Claude) · ~20 min

Cada landing tiene el widget en una sección llamada **"Reseñas Trustpilot"**. Se reemplaza
únicamente la URL; el resto del código queda intacto. Los cambios en Kajabi son inmediatos,
no hay borrador.

- [ ] **3.1** Editar las 18 páginas por API
- [ ] **3.2** Volver a barrer el sitio y confirmar que ninguna sigue apuntando a
      `mauricio-dev-ad.github.io`, y que las 18 apuntan a la URL nueva
- [ ] **3.3** Abrir dos o tres landings en el navegador y ver que las reseñas cargan
      (si se ven las de respaldo, es que el fetch falla)

Las 18, con su ruta exacta (todas cuelgan de `https://www.asuntosdigitales.com/`):

```
In-Company
certificacion-agentes-autonomos-inteligencia-artificial
certificacion-claude
certificacion-internacional-estrategia-comunicacion-politica-potenciada-ia
diplomado-de-direccion-de-marketing-para-restaurantes
diplomado-de-direccion-de-negocios-de-arquitectura-reformas-interiores
diplomado-de-direccion-de-negocios-de-salud-y-bienestar
diplomado-de-marketing-para-hosteleria
diplomado-direccion-agencias-marketing-inteligencia-artificial
diplomado-en-direccion-comercial-y-ventas-con-ia
diplomado-gestion-financiera-de-negocios-con-ia
diplomado-gestion-marketing-comercializacion-artes-plasticas
diplomado-inteligencia-artificial-aplicada-a-negocios
diplomado-inteligencia-artificial-aplicada-ejercicio-juridico
diplomado-inteligencia-artificial-aplicada-recursos-humanos
diplomado-inteligencia-artificial-aplicada-sector-inmobiliario
diplomado-practico-en-inteligencia-artificial-aplicado-al-marketing
diplomado-tiendas-comerciales-retail
```

> Esta lista es del barrido del 2026-10-05. Si entre medias se publicó alguna landing
> nueva con el widget, el barrido del paso 3.2 la detectará.

---

## Fase 4 — Computadora de Marypier · ~10 min

Puede hacerse en cuanto termine la fase 2. Si su tarea de la 1 de la tarde corre antes de
actualizarla, fallará (token viejo) sin consecuencias: solo no publica ese día.

Que pegue esto en Claude Code:

```
El repositorio del widget de Trustpilot cambió de dueño. Hay que actualizar esta
computadora para que siga publicando. Haz esto en la carpeta
"$env:USERPROFILE\trustpilot-widget":

1. Apunta el repositorio a su nueva dirección:
   git remote set-url origin https://github.com/iolidavid/trustpilot-widget.git
2. Trae el código actualizado:  git pull
3. Dime que reemplace el contenido de github-token.txt por el token nuevo que me pasaron
   (que lo haga yo en el Bloc de notas; no me lo pidas por el chat ni lo imprimas).
4. Corre  node fetch-reviews-puppeteer.js  y confírmame que termina con
   "✓ GitHub Pages actualizado" y que la URL que aparece es la de iolidavid.
5. Comprueba que la tarea programada siga existiendo:
   Get-ScheduledTaskInfo -TaskName "TrustpilotWidgetUpdater" | Select NextRunTime
```

- [ ] **4.1** Mary actualiza su máquina y publica correctamente

---

## Fase 5 — Cierre

- [ ] **5.1** Esperar al día siguiente y comprobar que la tarea de las 7:00 (Mauricio) y la
      de las 13:00 (Mary) terminaron con `LastTaskResult = 0`
- [ ] **5.2** Anotar la fecha de caducidad de los tokens en `GUIA-ACTUALIZADOR.md`
- [ ] **5.3** **Recién ahora**, eliminar la cuenta `mauricio-dev-ad`
- [ ] **5.4** Un día después, volver a abrir una landing y confirmar que las reseñas siguen
      cargando desde la URL nueva

---

## Si algo sale mal

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| La URL nueva da 404 | Pages no está activo en el repo transferido | David: Settings → Pages → rama `main`, carpeta `/ (root)` |
| El scraper dice `GitHub error 404` | El token no tiene acceso al repo | Revisar que el token sea de David y apunte a `trustpilot-widget` con Contents: Read and write |
| El scraper dice `GitHub error 401` | Token mal copiado o caducado | Volver a pegarlo, sin espacios ni saltos de línea |
| Las landings muestran reseñas viejas de dic-2025 | Están cayendo al respaldo: el fetch falla | Comprobar que la URL del widget en Kajabi coincide exactamente con la que publica el scraper |
| `LastTaskResult` distinto de 0 | La publicación falló | Correr el bootstrap a mano y leer el error |

**Lo peor que puede pasar** es que las landings se queden mostrando las 9 reseñas de
respaldo escritas dentro del widget. Es feo pero no rompe nada, y da tiempo de arreglarlo
con calma.
