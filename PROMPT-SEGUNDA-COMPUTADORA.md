# Montar el actualizador en la computadora de Marypier

Segunda máquina de respaldo, sobre el repo actual `mauricio-dev-ad/trustpilot-widget`.
Las dos computadoras publican las mismas reseñas a horas distintas, así el widget se
actualiza aunque una esté apagada.

Son dos envíos separados: **el token** por canal privado, y **el prompt** por donde sea
(no contiene secretos).

---

## Paso 1 — Darle acceso a Mary

El repositorio es **público**: Mary puede clonarlo sin invitación ni cuenta de GitHub.
Lo único que necesita es un token, y solo sirve para *publicar* el JSON.

**Lo recomendado — un token propio para ella, limitado a este repo:**

1. Entra a <https://github.com/settings/personal-access-tokens/new>
2. Token name: `Trustpilot Widget — Marypier`
3. Expiration: la máxima que ofrezca (anota la fecha, caduca)
4. Repository access → **Only select repositories** → `trustpilot-widget`
5. Repository permissions → **Contents** → **Read and write**
6. Generate token y cópialo

Así Mary solo puede escribir en este repositorio y en ningún otro. Si más adelante hay
que revocarle el acceso, se borra ese token y listo — sin tocar el tuyo.

> **No le pases el token que usa tu computadora.** Si es un token clásico (`ghp_...`),
> da acceso a *todos* tus repositorios, no solo a este.

**Opcional — añadirla como colaboradora:** solo si quieres que además vea y administre el
repo desde GitHub (Settings → Collaborators → Add people). No hace falta para que el
actualizador funcione, y requiere que ella tenga cuenta de GitHub.

---

## Paso 2 — Enviarle el token por canal privado

Mensaje directo o gestor de contraseñas. **Nunca por correo ni en un chat grupal:**

> Te paso el token para el actualizador del widget de Trustpilot.
> Guárdalo, lo vas a necesitar durante la instalación.
> `<AQUÍ EL TOKEN>`

---

## Paso 3 — El prompt para Mary

**No necesita tener nada instalado:** el propio prompt instala Git y Node.js. Lo único
que hace falta de antemano es Claude Code abierto en su computadora.

Lo que sí conviene confirmarle antes:

- [ ] Windows 10 u 11
- [ ] **Puede aceptar las ventanas de permiso de Windows** (el "¿Permites que esta
      aplicación haga cambios?"). Si su computadora la administra un área de sistemas y
      no la deja instalar programas, tendrán que instalarle Git y Node.js ellos primero
- [ ] Internet normal, de casa u oficina. **No sirve con VPN corporativa ni escritorio
      remoto en la nube**: Trustpilot bloquea las IPs de datacenter con error 403
- [ ] Un rato tranquilo la primera vez: la instalación descarga cerca de 300 MB
- [ ] Deja la computadora encendida a la hora en que corra la tarea (si está apagada,
      corre en cuanto la encienda)

Que abra Claude Code en cualquier carpeta y pegue esto tal cual:

```
Necesito que instales y configures en esta computadora el actualizador del widget de
reseñas de Trustpilot de Asuntos Digitales. No tengo nada instalado todavía, así que
empieza desde cero. Esta máquina va a ser el respaldo de la de Mauricio: las dos publican
las mismas reseñas a horas distintas, para que el widget de la web se actualice aunque
una esté apagada.

Contexto técnico: un script con Puppeteer lee las reseñas desde Trustpilot y las publica
como un JSON en GitHub Pages; las landings de Asuntos Digitales leen ese JSON. Solo
funciona desde una computadora con internet residencial — en servidores en la nube
Trustpilot responde 403.

Ve explicándome en lenguaje sencillo qué estás haciendo en cada paso, y detente en cuanto
algo falle contándome qué pasó. Hazlo en este orden:

1. Mira si ya están instalados Git y Node.js:  git --version  y  node --version

2. Si falta alguno, instálalo con winget (comprueba antes que exista, con winget --version):
   winget install --id Git.Git -e --accept-source-agreements --accept-package-agreements
   winget install --id OpenJS.NodeJS.LTS -e --accept-source-agreements --accept-package-agreements

   Avísame ANTES de lanzarlos: Windows me va a abrir una ventana preguntando si permito
   los cambios, y tengo que darle a "Sí" o la instalación se queda esperando.

   Si winget no existe en esta computadora, dime que los descargue a mano desde
   https://git-scm.com/download/win y https://nodejs.org (versión LTS), y espera a que
   termine.

3. IMPORTANTE: después de instalar, Claude Code todavía no "ve" los programas nuevos.
   Dime que cierre Claude Code por completo y lo vuelva a abrir, y que pegue otra vez
   este mismo mensaje. No pasa nada por repetirlo: los pasos ya hechos se saltan solos.

4. Con Git y Node ya funcionando, trae el proyecto a mi carpeta de usuario:
   - Si la carpeta "$env:USERPROFILE\trustpilot-widget" NO existe:
     git clone https://github.com/mauricio-dev-ad/trustpilot-widget.git "$env:USERPROFILE\trustpilot-widget"
   - Si ya existe, entra en ella y haz git pull

5. El token: NO me lo pidas por el chat ni lo escribas tú. Dime que abra el Bloc de notas,
   pegue el token que me pasaron y guarde el archivo como:
   C:\Users\<mi-usuario>\trustpilot-widget\github-token.txt
   (sin saltos de línea ni espacios de más, y eligiendo "Tipo: Todos los archivos" para que
   no quede guardado como .txt.txt). Después verifica solo que el archivo exista y no esté
   vacío: NO imprimas su contenido ni lo copies a ningún otro sitio.

6. Dentro de esa carpeta instala las dependencias:  npm install
   Avísame que esto descarga un navegador Chrome propio, unos 300 MB, y que puede tardar
   varios minutos sin dar señales de vida. Es normal, no está colgado.

7. Corre el actualizador:  node fetch-reviews-puppeteer.js
   Tiene que terminar con la línea "✓ GitHub Pages actualizado".
   Si sale un error en vez de eso, muéstramelo y detente.

8. Deja la actualización automática programada a la 1 de la tarde (la de Mauricio corre a
   las 7 de la mañana, así nos turnamos):
   powershell -ExecutionPolicy Bypass -File setup-scheduler.ps1 -Hora "13:00"

9. Repórtame al final: las 3 reseñas más recientes que se publicaron, y la próxima
   ejecución programada (NextRunTime) de la tarea "TrustpilotWidgetUpdater".

No modifiques ningún archivo del proyecto y no subas nada a GitHub por tu cuenta: el
script publica solo. El archivo github-token.txt está en .gitignore, déjalo así.
```

---

## Paso 4 — Comprobar que quedó funcionando

Al día siguiente, desde cualquier computadora:

```
curl https://mauricio-dev-ad.github.io/trustpilot-widget/reviews.json
```

El campo `business.fetchedAt` debe tener la fecha del día.

Y para ver si su tarea está sana, que corra en PowerShell:

```
Get-ScheduledTaskInfo -TaskName "TrustpilotWidgetUpdater" | Select LastRunTime, LastTaskResult
```

`LastTaskResult = 0` → bien. Cualquier otro número → problema con el token o con el repo.

---

## Si prefiere hacerlo a mano (sin Claude Code)

1. Instalar **Git** desde <https://git-scm.com/download/win> (siguiente, siguiente, sin
   cambiar nada) y **Node.js LTS** desde <https://nodejs.org>
2. Cerrar y volver a abrir PowerShell, para que reconozca los programas nuevos
3. Correr:

```
git clone https://github.com/mauricio-dev-ad/trustpilot-widget.git "$env:USERPROFILE\trustpilot-widget"
cd "$env:USERPROFILE\trustpilot-widget"
npm install
```

4. Crear `github-token.txt` dentro de esa carpeta, con el token como único contenido
5. Correr:

```
node fetch-reviews-puppeteer.js
powershell -ExecutionPolicy Bypass -File setup-scheduler.ps1 -Hora "13:00"
```

---

## Pendiente: cuando se migre el repo a David

La cuenta `mauricio-dev-ad` se va a eliminar y el repo se transferirá a `iolidavid`.
Ese día **la computadora de Mary también hay que actualizarla**, no solo la de Mauricio:

1. Token nuevo, emitido por el dueño del repo, en su `github-token.txt`
2. `git remote set-url origin https://github.com/iolidavid/trustpilot-widget.git`
3. Un `git pull` recoge el código ya apuntando a la URL nueva

Está detallado en `GUIA-ACTUALIZADOR.md`, sección *Migración pendiente*.
