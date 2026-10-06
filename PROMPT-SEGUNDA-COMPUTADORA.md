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

Antes de enviárselo, confirma que su computadora cumple:

- [ ] Windows con **Git** y **Node.js (LTS)** instalados
- [ ] Internet normal, de casa u oficina. **No sirve con VPN corporativa ni escritorio
      remoto en la nube**: Trustpilot bloquea las IPs de datacenter con error 403
- [ ] La deja encendida a la hora en que corra la tarea (si está apagada, corre al encenderla)

Que abra Claude Code en cualquier carpeta y pegue esto tal cual:

```
Necesito que configures en esta computadora el actualizador del widget de reseñas de
Trustpilot de Asuntos Digitales. Esta máquina va a ser el respaldo de la de Mauricio:
las dos publican las mismas reseñas a horas distintas, para que el widget de la web se
actualice aunque una esté apagada.

Contexto técnico: un script con Puppeteer lee las reseñas desde Trustpilot y las publica
como un JSON en GitHub Pages; las landings de Asuntos Digitales leen ese JSON. Solo
funciona desde una computadora con internet residencial — en servidores en la nube
Trustpilot responde 403.

Haz esto en orden y detente en cuanto algo falle, explicándome qué pasó:

1. Comprueba que estén instalados Git y Node.js (`git --version` y `node --version`).
   Si falta alguno, dime cuál y detente: hay que instalarlo desde https://git-scm.com
   y https://nodejs.org antes de seguir.

2. Clona el repositorio en mi carpeta de usuario:
   git clone https://github.com/mauricio-dev-ad/trustpilot-widget.git "$env:USERPROFILE\trustpilot-widget"

3. El token: NO me lo pidas por el chat ni lo escribas tú. Dime que abra el Bloc de notas,
   pegue el token que me pasaron y guarde el archivo como:
   C:\Users\<mi-usuario>\trustpilot-widget\github-token.txt
   (sin saltos de línea ni espacios de más, y eligiendo "Tipo: Todos los archivos" para que
   no quede como .txt.txt). Después verifica solo que el archivo exista y no esté vacío:
   NO imprimas su contenido ni lo copies a ningún otro sitio.

4. Dentro de esa carpeta instala las dependencias:  npm install

5. Corre el actualizador:  node fetch-reviews-puppeteer.js
   Tiene que terminar con la línea "✓ GitHub Pages actualizado".
   Si sale un error en vez de eso, muéstramelo y detente.

6. Deja la actualización automática programada a la 1 de la tarde (la de Mauricio corre a
   las 7 de la mañana, así nos turnamos):
   powershell -ExecutionPolicy Bypass -File setup-scheduler.ps1 -Hora "13:00"

7. Repórtame al final: las 3 reseñas más recientes que se publicaron, y la próxima
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

## Pendiente: cuando se migre el repo a David

La cuenta `mauricio-dev-ad` se va a eliminar y el repo se transferirá a `iolidavid`.
Ese día **la computadora de Mary también hay que actualizarla**, no solo la de Mauricio:

1. Token nuevo, emitido por el dueño del repo, en su `github-token.txt`
2. `git remote set-url origin https://github.com/iolidavid/trustpilot-widget.git`
3. Un `git pull` recoge el código ya apuntando a la URL nueva

Está detallado en `GUIA-ACTUALIZADOR.md`, sección *Migración pendiente*.
