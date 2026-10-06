# Prompt para configurar el actualizador en una segunda computadora

Este archivo tiene **lo que hay que enviarle a Marypier**. Son dos cosas separadas:
el token (por un canal privado) y el prompt de abajo (puede ir por cualquier medio,
no contiene secretos).

---

## Antes de enviárselo, verifica que se cumpla esto

- [ ] El repo ya está transferido a `iolidavid` y David lo aceptó
- [ ] David activó GitHub Pages y `https://iolidavid.github.io/trustpilot-widget/reviews.json` responde
- [ ] Tienes el token *fine-grained* que emitió David
- [ ] Marypier tiene **Git** y **Node.js (LTS)** instalados en su Windows
- [ ] Su internet es normal (casa/oficina). **No sirve con VPN corporativa ni escritorio
      remoto en la nube**: Trustpilot bloquea las IPs de datacenter con error 403

El repositorio es **público**, así que Marypier no necesita invitación para clonarlo.
Lo único que necesita es el token, y solo para *publicar*. (Si prefieren que tenga su
propio acceso en vez de compartir el token, David puede añadirla como colaboradora del
repo y ella genera el suyo.)

---

## 1. El token — envíaselo por un canal privado

Por mensaje directo o gestor de contraseñas, **nunca por correo ni en un chat grupal**:

> Te paso el token para el actualizador del widget de Trustpilot.
> Guárdalo, lo vas a necesitar en el paso de la instalación.
> `<AQUÍ EL TOKEN>`

---

## 2. El prompt — para que lo pegue en Claude Code

> Dile que abra Claude Code en cualquier carpeta y pegue esto tal cual.

```
Necesito que configures en esta computadora el actualizador del widget de reseñas de
Trustpilot de Asuntos Digitales. Esta máquina va a ser el respaldo de la de Mauricio:
las dos publican las mismas reseñas, a horas distintas, para que el widget se actualice
aunque una esté apagada.

Contexto técnico: un script con Puppeteer lee las reseñas de Trustpilot y las publica
como un JSON en GitHub Pages; la web de Asuntos Digitales lee ese JSON. Solo funciona
desde una computadora con internet residencial — en servidores en la nube Trustpilot
responde 403.

Haz esto en orden y detente en cuanto algo falle, explicándome qué pasó:

1. Comprueba que estén instalados Git y Node.js (`git --version` y `node --version`).
   Si falta alguno, dime cuál y detente: hay que instalarlo desde https://nodejs.org
   y https://git-scm.com antes de seguir.

2. Clona el repositorio en mi carpeta de usuario:
   git clone https://github.com/iolidavid/trustpilot-widget.git "$env:USERPROFILE\trustpilot-widget"

3. El token: NO me lo pidas por el chat. Dime que abra el Bloc de notas, pegue el token
   que me pasaron, y guarde el archivo como:
   C:\Users\<mi-usuario>\trustpilot-widget\github-token.txt
   (sin saltos de línea ni espacios extra, y con "Tipo: Todos los archivos" para que no
   quede como .txt.txt). Luego verifica que el archivo exista y tenga contenido, pero
   NO imprimas el token en pantalla ni lo copies a ningún otro archivo.

4. Dentro de esa carpeta, instala las dependencias:  npm install

5. Corre el actualizador:  node fetch-reviews-puppeteer.js
   Tiene que terminar con la línea "✓ GitHub Pages actualizado".
   Si en vez de eso sale un error, muéstramelo y detente.

6. Deja la actualización automática programada a la 1 de la tarde (la de Mauricio corre
   a las 7 de la mañana, así nos turnamos):
   powershell -ExecutionPolicy Bypass -File setup-scheduler.ps1 -Hora "13:00"

7. Repórtame al final: las 3 reseñas más recientes que se publicaron, y la próxima
   ejecución programada (NextRunTime) de la tarea "TrustpilotWidgetUpdater".

No modifiques ningún archivo del proyecto y no subas nada a GitHub por tu cuenta: el
script ya publica solo. El archivo github-token.txt está en .gitignore, déjalo así.
```

---

## 3. Para comprobar que quedó funcionando

Al día siguiente, desde cualquier máquina:

```
curl https://iolidavid.github.io/trustpilot-widget/reviews.json
```

El campo `business.fetchedAt` debe tener la fecha del día. Si Marypier apaga su
computadora a la 1 de la tarde, la tarea corre igual en cuanto la encienda
(está configurada con `StartWhenAvailable`).

Para ver si su tarea está sana, que corra en PowerShell:

```
Get-ScheduledTaskInfo -TaskName "TrustpilotWidgetUpdater" | Select LastRunTime, LastTaskResult
```

`LastTaskResult = 0` → bien. Cualquier otro número → el token o el repo tienen problema.

---

## Si no usa Claude Code

Los mismos pasos, a mano en PowerShell:

```
git clone https://github.com/iolidavid/trustpilot-widget.git "$env:USERPROFILE\trustpilot-widget"
cd "$env:USERPROFILE\trustpilot-widget"
npm install
```

Luego crear `github-token.txt` con el token dentro, y:

```
node fetch-reviews-puppeteer.js
powershell -ExecutionPolicy Bypass -File setup-scheduler.ps1 -Hora "13:00"
```
