$branches = git branch -r | % { $_.Trim() } | ? { $_ -notmatch "HEAD|main|staging" }
$output = "# Clean Jules/Bolt/Sentinel Branches (True Branch Diff)`r`n`r`n"
$output += "This lists branches with the number of files changed in the branch itself compared to its merge base with main.`r`n`r`n"
$output += "| Branch | Changed Files Count | Author | Commit Subject |`r`n"
$output += "| --- | --- | --- | --- |`r`n"

foreach ($b in $branches) {
  $log = git log -n 1 --pretty=format:"%an|%s" $b
  $author = $log.Split('|')[0]
  $subject = $log.Split('|')[1]
  
  # Three-dot diff finds files changed *by the branch* relative to main's merge-base
  $filesList = git diff --name-only main...$b
  $count = 0
  if ($filesList) {
    if ($filesList -is [array]) {
      $count = $filesList.Count
    } else {
      $count = 1
    }
  }
  
  $output += "| $b | $count | $author | $subject |`r`n"
}

$output | Out-File -FilePath "scratch/clean_branches_summary_correct.md" -Encoding utf8
Write-Host "Corrected summary generated in scratch/clean_branches_summary_correct.md"
