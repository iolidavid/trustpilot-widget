# Guía: Actualizador del Widget de Trustpilot — Asuntos Digitales

Este script obtiene las últimas reseñas de Trustpilot y las publica en GitHub Pages,
de donde el widget de la landing (Kajabi) las lee.

> ⚠️ **Importante:** el scraping SOLO funciona desde una computadora normal con internet
> residencial. NO funciona en servidores en la nube (Vercel, Railway, GitHub Actions, etc.)
> porque Trustpilot bloquea las IPs de datacenter con error 403.

El código vive en el repo público: https://github.com/iolidavid/trustpilot-widget
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
git clone https://github.com/iolidavid/trustpilot-widget.git
cd trustpilot-widget
npm install
```
Luego poner el token (ver sección anterior) y probar:
```
node fetch-reviews-puppeteer.js
```
Debe terminar con:
```
✓ GitHub Pages actualizado → https://iolidavid.github.io/trustpilot-widget/reviews.json
```

### Programar cada 2 días (opcional)
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
