param (
  [Parameter(Mandatory=$true)][string]$Tenant,
  [Parameter(Mandatory=$true)][string]$Domain,
  [switch]$SkipUpload
)

# ==========================================
# UNIVERSAL LANDING PAGE DEPLOYER
# ==========================================

$basePath = "inputs\$Tenant"

if (-not (Test-Path $basePath)) {
  Write-Host "[ERROR] Tenant input folder '$basePath' does not exist." -ForegroundColor Red
  exit 1
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "STARTING DEPLOYMENT PIPELINE" -ForegroundColor Cyan
Write-Host "Tenant: $Tenant" -ForegroundColor Cyan
Write-Host "Domain: $Domain" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Determine pages to process
$pages = @()
$configPath = "$basePath\pages.json"

if (Test-Path $configPath) {
  Write-Host "Found pages.json, reading config..." -ForegroundColor Gray
  $pages = Get-Content $configPath | ConvertFrom-Json
} else {
  Write-Host "Auto-discovering pages in $basePath..." -ForegroundColor Gray
  $folders = Get-ChildItem -Path $basePath -Directory
  foreach ($f in $folders) {
    # Auto-generate a readable label (e.g., "quienes-somos" -> "Quienes Somos")
    $textInfo = (Get-Culture).TextInfo
    $label = $textInfo.ToTitleCase($f.Name.Replace('-', ' '))
    $pages += [PSCustomObject]@{ folder = $f.Name; label = $label }
  }
}

if ($pages.Count -eq 0) {
  Write-Host "No pages found to deploy." -ForegroundColor Yellow
  exit 0
}

foreach ($page in $pages) {
  $f = $page.folder
  $l = $page.label
  $inputPath = "$basePath\$f\raw.html"
  
  if (-not (Test-Path $inputPath)) {
    Write-Host "Skipping ${f}: raw.html not found." -ForegroundColor Yellow
    continue
  }
  
  Write-Host ""
  Write-Host "PROCESSING: ${f}" -ForegroundColor Yellow
  pnpm exec tsx src/cli.ts $inputPath -t $Tenant -l $f
  
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed processing ${f}" -ForegroundColor Red
    continue
  }
  
  if (-not $SkipUpload) {
    Write-Host "UPLOADING, SYNCING AND REVALIDATING: ${f} (Menu Label: ${l})" -ForegroundColor Yellow
    pnpm exec tsx src/cli-upload.ts -t $Tenant -l $f -d $Domain -b "${l}"
    
    if ($LASTEXITCODE -ne 0) {
      Write-Host "Failed uploading ${f}" -ForegroundColor Red
    } else {
      Write-Host "Successfully deployed ${f}" -ForegroundColor Green
    }
  }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "DEPLOYMENT COMPLETE FOR $Tenant!" -ForegroundColor Cyan
Write-Host "Visit https://$Domain to verify." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
