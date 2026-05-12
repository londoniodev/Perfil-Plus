# ==========================================
# GESCO ABOGADOS - AUTOMATION SCRIPT
# Processes HTML, Uploads to MinIO/S3, Syncs DB, Revalidates Cache
# ==========================================

$pages = @(
  @{ folder="home"; label="Inicio" },
  @{ folder="quienes-somos"; label="Quiénes Somos" },
  @{ folder="areas-de-practica"; label="Áreas de Práctica" },
  @{ folder="modalidades-del-servicio"; label="Modalidades del Servicio" },
  @{ folder="contacto"; label="Contacto" },
  @{ folder="nuestros-clientes"; label="Nuestros Clientes" }
)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🚀 STARTING GESCO DEPLOYMENT PIPELINE" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

foreach ($page in $pages) {
  $f = $page.folder
  $l = $page.label
  $inputPath = "inputs\gescoabogados\$f\raw.html"
  
  Write-Host "`n➤ PROCESSING: $f" -ForegroundColor Yellow
  npx tsx src/cli.ts $inputPath -t gesco -l $f
  
  if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed processing $f" -ForegroundColor Red
    continue
  }
  
  Write-Host "➤ UPLOADING, SYNCING & REVALIDATING: $f (Menu Label: $l)" -ForegroundColor Yellow
  npx tsx src/cli-upload.ts -t gesco -l $f -d gesco.perfil.plus -b "$l"
  
  if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed uploading $f" -ForegroundColor Red
  } else {
    Write-Host "✅ Successfully deployed $f" -ForegroundColor Green
  }
}

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "🎉 DEPLOYMENT COMPLETE!" -ForegroundColor Cyan
Write-Host "Visit https://gesco.perfil.plus to verify." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
