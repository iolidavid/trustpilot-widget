# ============================================================
#  Programa la actualizacion DIARIA del widget de Trustpilot
#  en el Programador de tareas de Windows.
#
#  La tarea ejecuta bootstrap.ps1 (git pull + npm install si falta + scrape),
#  de modo que siempre corre con la ultima version del codigo.
#
#  Ejecutar una sola vez:
#    powershell -ExecutionPolicy Bypass -File setup-scheduler.ps1
#
#  Otra hora (util si hay una segunda computadora de respaldo):
#    powershell -ExecutionPolicy Bypass -File setup-scheduler.ps1 -Hora "13:00"
# ============================================================

param(
    [string]$Hora = "07:00"
)

$scriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$bootstrap  = Join-Path $scriptDir "bootstrap.ps1"

if (-not (Test-Path $bootstrap)) {
    Write-Host "ERROR: no se encontro bootstrap.ps1 en esta carpeta." -ForegroundColor Red
    exit 1
}

# Accion: ejecutar bootstrap.ps1 con PowerShell
$action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$bootstrap`"" `
    -WorkingDirectory $scriptDir

# Trigger: todos los dias a las 7:00 AM
$trigger = New-ScheduledTaskTrigger -Daily -At $Hora

# Correr aunque la hora se haya perdido; reintentar si falla
$settings = New-ScheduledTaskSettingsSet `
    -ExecutionTimeLimit (New-TimeSpan -Hours 1) `
    -RestartCount 2 `
    -RestartInterval (New-TimeSpan -Minutes 15) `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable

$taskName = "TrustpilotWidgetUpdater"

Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue

# Tarea de usuario normal (no requiere permisos de administrador)
Register-ScheduledTask `
    -TaskName $taskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Description "Actualiza resenas Trustpilot de asuntosdigitales.com (bootstrap) todos los dias" | Out-Null

$info = Get-ScheduledTaskInfo -TaskName $taskName
Write-Host ""
Write-Host "OK Tarea programada creada correctamente." -ForegroundColor Green
Write-Host ""
Write-Host "  Nombre:     $taskName"
Write-Host "  Frecuencia: Todos los dias a las $Hora"
Write-Host "  Ejecuta:    bootstrap.ps1 (git pull + scrape)"
Write-Host "  Proxima:    $($info.NextRunTime)"
Write-Host ""
Write-Host "NOTA: el token debe estar disponible (variable GITHUB_TOKEN o github-token.txt)."
Write-Host "Probar ahora:  Start-ScheduledTask -TaskName '$taskName'"
Write-Host ""
