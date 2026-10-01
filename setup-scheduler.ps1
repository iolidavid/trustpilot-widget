# ============================================================
#  Configura la tarea interdiaria en Windows Task Scheduler
#  Ejecutar UNA SOLA VEZ como Administrador:
#    Clic derecho en setup-scheduler.ps1 → "Ejecutar con PowerShell"
# ============================================================

$scriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$scriptPath = Join-Path $scriptDir "fetch-reviews-puppeteer.js"
$logPath    = Join-Path $scriptDir "scraper.log"
$nodeCmd    = Get-Command node -ErrorAction SilentlyContinue
$nodePath   = if ($nodeCmd) { $nodeCmd.Source } else { $null }

if (-not $nodePath) {
    Write-Host "ERROR: Node.js no encontrado. Instálalo desde https://nodejs.org" -ForegroundColor Red
    pause; exit 1
}

# Acción: correr node fetch-reviews-puppeteer.js y guardar log
$action = New-ScheduledTaskAction `
    -Execute $nodePath `
    -Argument "`"$scriptPath`"" `
    -WorkingDirectory $scriptDir

# Trigger: cada 2 días (interdiario) a las 7:00 AM
$trigger = New-ScheduledTaskTrigger `
    -Daily `
    -DaysInterval 2 `
    -At "07:00"

# Configuración: correr aunque no haya usuario logueado, reintentar si falla
$settings = New-ScheduledTaskSettingsSet `
    -ExecutionTimeLimit (New-TimeSpan -Hours 1) `
    -RestartCount 2 `
    -RestartInterval (New-TimeSpan -Minutes 15) `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable

$taskName = "TrustpilotWidgetUpdater"

# Eliminar si ya existe
Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue

# Tarea de usuario normal (no requiere permisos de administrador)
Register-ScheduledTask `
    -TaskName $taskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Description "Actualiza reseñas Trustpilot de asuntosdigitales.com cada 2 días" | Out-Null

Write-Host ""
Write-Host "✓ Tarea programada creada correctamente." -ForegroundColor Green
Write-Host ""
Write-Host "  Nombre:    $taskName"
Write-Host "  Frecuencia: Cada 2 días (interdiario) a las 7:00 AM"
Write-Host "  Script:    $scriptPath"
Write-Host ""
Write-Host "Para probar ahora mismo (sin esperar al lunes):" -ForegroundColor Yellow
Write-Host "  Start-ScheduledTask -TaskName '$taskName'"
Write-Host ""
Write-Host "Para ver el log después de correr:"
Write-Host "  Get-Content '$logPath'"
Write-Host ""
pause
