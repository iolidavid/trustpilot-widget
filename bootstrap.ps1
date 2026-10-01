# ============================================================
#  Bootstrap del Actualizador del Widget de Trustpilot
#  - Clona el repo si la carpeta no existe
#  - Instala dependencias si faltan
#  - Ejecuta el scraper (publica reseñas en GitHub Pages)
#
#  Uso:  powershell -ExecutionPolicy Bypass -File bootstrap.ps1
#  Carpeta personalizada:
#        powershell -ExecutionPolicy Bypass -File bootstrap.ps1 -Folder "D:\ruta"
# ============================================================

param(
    [string]$Folder = (Join-Path $env:USERPROFILE "trustpilot-widget")
)

$RepoUrl = "https://github.com/mauricio-dev-ad/trustpilot-widget.git"

# 1. Clonar si la carpeta no existe
if (-not (Test-Path $Folder)) {
    Write-Host "Carpeta no encontrada. Clonando repositorio..." -ForegroundColor Cyan
    git clone $RepoUrl $Folder
    if ($LASTEXITCODE -ne 0) { Write-Host "ERROR: no se pudo clonar el repo. Verifica que Git este instalado." -ForegroundColor Red; exit 1 }
} else {
    Write-Host "Carpeta encontrada. Actualizando repositorio..." -ForegroundColor Cyan
    git -C $Folder fetch --quiet origin
    # El scraper reescribe reviews.json localmente; descartamos ese cambio para que
    # el update nunca choque y siempre quede la ultima version del codigo.
    git -C $Folder reset --hard "@{u}" --quiet
}

Set-Location $Folder

# 2. Instalar dependencias si faltan
if (-not (Test-Path (Join-Path $Folder "node_modules"))) {
    Write-Host "Instalando dependencias (npm install)..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) { Write-Host "ERROR: fallo npm install. Verifica que Node.js este instalado." -ForegroundColor Red; exit 1 }
}

# 3. Verificar el token
$tokenFile = Join-Path $Folder "github-token.txt"
if (-not $env:GITHUB_TOKEN -and -not (Test-Path $tokenFile)) {
    Write-Host ""
    Write-Host "FALTA EL TOKEN DE GITHUB." -ForegroundColor Yellow
    Write-Host "Haz una de estas dos opciones (una sola vez):" -ForegroundColor Yellow
    Write-Host "  A) Crear el archivo 'github-token.txt' en esta carpeta con el token dentro, o" -ForegroundColor Yellow
    Write-Host "  B) Definir la variable de entorno:  setx GITHUB_TOKEN `"ghp_tu_token`"" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# 4. Ejecutar el scraper
Write-Host "Ejecutando el actualizador..." -ForegroundColor Cyan
node fetch-reviews-puppeteer.js
