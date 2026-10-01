---
description: Actualiza el widget de Trustpilot y deja programada la actualizacion diaria
---

Actualiza las reseñas del widget de Trustpilot de Asuntos Digitales y deja la
actualización automatizada todos los días. Haz exactamente esto, en orden:

1. **Verifica el token.** Debe existir la variable de entorno `GITHUB_TOKEN` o el
   archivo `github-token.txt` en la carpeta del proyecto. Si no hay ninguno, avísame
   con instrucciones para configurarlo y DETENTE (no sigas).

2. **Ejecuta el actualizador** en la carpeta del proyecto:
   - Si no existe `node_modules`, corre primero `npm install`.
   - Luego corre `node fetch-reviews-puppeteer.js`.
   - Confirma que apareció la línea "✓ GitHub Pages actualizado". Si no aparece,
     repórtame el error y DETENTE.

3. **Deja programada la actualización DIARIA** en el Programador de tareas de Windows:
   `powershell -ExecutionPolicy Bypass -File setup-scheduler.ps1`
   (crea/actualiza la tarea "TrustpilotWidgetUpdater" para que corra sola todos los
   días a las 7:00 AM).

4. **Repórtame:** las 3 reseñas más recientes publicadas y la próxima ejecución
   programada (NextRunTime).

No modifiques ningún otro archivo del proyecto. Recuerda: esto debe correr en una
computadora con IP residencial (en la nube Trustpilot devuelve 403).
