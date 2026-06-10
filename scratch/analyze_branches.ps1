$branches = git branch -r | % { $_.Trim() } | ? { $_ -notmatch "HEAD|main|staging" }
$output = "# Analysis of Jules/Bolt/Sentinel Branches`r`n`r`n"
$output += "This document lists the branches created by the AI assistant (Jules/Bolt/Sentinel) and classifies them.`r`n`r`n"

foreach ($b in $branches) {
  $log = git log -n 1 --pretty=format:"%an|%s" $b
  $author = $log.Split('|')[0]
  $subject = $log.Split('|')[1]
  
  # Get modified files compared to main
  $filesList = git diff --name-only main $b
  $filesStr = ""
  if ($filesList) {
    $filesStr = ($filesList | % { $_.Trim() }) -join ", "
  } else {
    $filesStr = "No changes (already merged or identical to main)"
  }
  
  $output += "## Branch: $b`r`n"
  $output += "- **Author:** $author`r`n"
  $output += "- **Subject:** $subject`r`n"
  $output += "- **Modified Files:** $filesStr`r`n`r`n"
}

if (-not (Test-Path "scratch")) {
  New-Item -Path "scratch" -ItemType Directory -Force | Out-Null
}

$output | Out-File -FilePath "scratch/branch_analysis.md" -Encoding utf8
Write-Host "Analysis complete! Saved to scratch/branch_analysis.md"
