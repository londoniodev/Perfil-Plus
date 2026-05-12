$pages = @(
  @{ folder="home"; label="Inicio" },
  @{ folder="quienes-somos"; label="Quiénes Somos" },
  @{ folder="areas-de-practica"; label="Áreas de Práctica" },
  @{ folder="modalidades-del-servicio"; label="Modalidades del Servicio" },
  @{ folder="contacto"; label="Contacto" },
  @{ folder="clientes"; label="Nuestros Clientes" }
)

foreach ($page in $pages) {
  $f = $page.folder
  $l = $page.label
  $inputPath = "inputs\gescoabogados\$f\raw.html"
  
  Write-Host "Processing $f..."
  npx tsx src/cli.ts $inputPath -t gesco -l $f
  
  Write-Host "Uploading $f..."
  npx tsx src/cli-upload.ts -t gesco -l $f -d perfil.plus -b "$l"
}
Write-Host "All done!"
