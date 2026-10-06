# Guía: Actualizador del Widget de Trustpilot — Asuntos Digitales

Este script obtiene las últimas reseñas de Trustpilot y las publica en GitHub Pages,
de donde el widget de la landing (Kajabi) las lee.

> ⚠️ **Importante:** el scraping SOLO funciona desde una computadora normal con internet
> residencial. NO funciona en servidores en la nube (Vercel, Railway, GitHub Actions, etc.)
> porque Trustpilot bloquea las IPs de datacenter con error 403.

El código vive en el repo público: https://github.com/mauricio-dev-ad/trustpilot-widget
El **token de GitHub NO está en el repo** (sería un riesgo de seguridad). Cada computadora
pone su token por fuera, como se explica abajo.

---

## Opción rápida: arranque automático (bootstrap)

En una computadora con **Git** y **Node.js** instalados, abre PowerShell y corre:

```
powershell -ExecutionPolicy Bypass -File bootstrap.ps1
```

El script:
1. Clona el repo si la carpeta no existe (en `C:\Users\<tu-usuario>\trustpilot-widget`).
2. Instala dependencias (`npm install`) si faltan.
3. Verifica que exista el token.
4. Ejecuta el actualizador.

La primera vez pedirá el token (ver sección siguiente).

---

## Dónde va el token

El token se toma de **una de estas dos fuentes** (en este orden):

1. **Variable de entorno** `GITHUB_TOKEN` (recomendado). Una sola vez en PowerShell:
   ```
   setx GITHUB_TOKEN "ghp_tu_token_aqui"
   ```
   (cerrar y reabrir la terminal para que tome efecto)

2. **Archivo `github-token.txt`** dentro de la carpeta del proyecto, con el token como
   único contenido. Este archivo está en `.gitignore`, así que nunca se sube al repo.

Si no hay ninguno de los dos, el script avisa y no publica.

🔒 **El token es privado.** Compartirlo solo por un medio seguro y nunca subirlo a un repo.

---

## Instalación manual (si no usas bootstrap)

### Requisitos
- Windows 10/11, Git y Node.js (LTS) — https://nodejs.org

### Pasos
```
git clone https://github.com/mauricio-dev-ad/trustpilot-widget.git
cd trustpilot-widget
npm install
```
Luego poner el token (ver sección anterior) y probar:
```
node fetch-reviews-puppeteer.js
```
Debe terminar con:
```
✓ GitHub Pages actualizado → https://mauricio-dev-ad.github.io/trustpilot-widget/reviews.json
```

### Programar la actualización diaria (opcional)
```
powershell -ExecutionPolicy Bypass -File setup-scheduler.ps1
```
Crea la tarea `TrustpilotWidgetUpdater` en el Programador de tareas de Windows.

---

## Ejecutar desde Claude Code (otra cuenta)

Abre Claude Code en la carpeta del proyecto y dale esta instrucción:

```
Corre el actualizador del widget de Trustpilot: ejecuta en consola
`node fetch-reviews-puppeteer.js` dentro de esta carpeta (si falta node_modules,
primero `npm install`). Confírmame que salió "✓ GitHub Pages actualizado" y
muéstrame las 3 primeras reseñas. No modifiques archivos, solo ejecuta.
```

El token debe estar ya configurado en esa máquina (variable de entorno o `github-token.txt`).

---

## Notas

- Pueden tener la tarea programada en 2 computadoras a la vez; no hay conflicto (cada
  ejecución reemplaza `reviews.json` con los mismos datos).
- Para que la tarea corra sola, la computadora debe estar encendida a la hora programada
  (si está apagada, corre al encenderse — `StartWhenAvailable`).
- El diseño del widget vive en el código pegado en Kajabi; este script solo actualiza los DATOS.

---

## Migración pendiente: la cuenta `mauricio-dev-ad` se va a eliminar

La cuenta personal de Mauricio se eliminará. Como el subdominio de GitHub Pages lleva el
usuario adentro (`<usuario>.github.io`), **desaparece junto con la cuenta y no hay
redirección posible**. El plan acordado es transferir este repo a `iolidavid` (David Ioli),
con lo que la URL pasará a ser `https://iolidavid.github.io/trustpilot-widget/reviews.json`.

**Todavía NO se hizo.** Hoy todo sigue apuntando a `mauricio-dev-ad`, que es lo correcto
hasta que la transferencia ocurra.

### Qué habrá que cambiar el día de la transferencia

La URL está escrita en tres sitios y **los tres deben cambiar a la vez**:

1. `fetch-reviews-puppeteer.js` → constante `GITHUB_USER` (dónde publica el scraper)
2. `bootstrap.ps1` → `$RepoUrl`, y el remote de cada clon (`git remote set-url origin ...`)
3. `trustpilot-widget.html` → `CONFIG.liveUrl`, y sobre todo **las 18 landings de Kajabi**
   que tienen el widget pegado en una sección llamada "Reseñas Trustpilot" — esas son las
   que ve el público

Además hay que rehacer el token: el actual muere con la cuenta de Mauricio. El nuevo lo
emite el dueño del repo, como *fine-grained token* limitado a `trustpilot-widget` con
permiso **Contents: Read and write**, y hay que ponerlo en **todas** las computadoras que
corran el actualizador.

⚠️ **No cambies el remote de un clon antes de que el repo destino exista.** Si el `git fetch`
falla, el bootstrap avisa y sigue con el código local — pero antes de ese arreglo revertía la
carpeta en silencio a una versión vieja (pasó el 2026-10-06).

⚠️ **Los fine-grained tokens caducan (máximo 1 año).** Cuando caduque, el scraper deja de
publicar. Anota la fecha al crearlo:

```
Token creado el: ____________   Vence el: ____________
```

### Si la actualización falla

El scraper **termina con error (código 1)** si no logra publicar, en vez de terminar en
silencio. Para revisar si la tarea diaria está sana:

```
Get-ScheduledTaskInfo -TaskName "TrustpilotWidgetUpdater" | Select LastRunTime, LastTaskResult
```

`LastTaskResult = 0` → todo bien. Cualquier otro valor → revisar el token y que el repo siga
existiendo. Mientras tanto el widget **no se rompe**: muestra las 9 reseñas de respaldo que
están escritas dentro del propio código del widget.

### Segunda computadora (respaldo)

Se puede tener la tarea en dos computadoras a la vez: no hay conflicto, cada ejecucion
reemplaza `reviews.json` con los mismos datos. Conviene programarlas a horas distintas
para que si una esta apagada, la otra publique igual:

```
powershell -ExecutionPolicy Bypass -File setup-scheduler.ps1 -Hora "13:00"
```

Ambas maquinas pueden usar el mismo token (esta limitado a este repo).
