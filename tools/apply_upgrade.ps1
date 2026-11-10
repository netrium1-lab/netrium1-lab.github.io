$encoding = New-Object System.Text.UTF8Encoding($false)

$lines = [System.IO.File]::ReadAllLines("admin.html", [System.Text.Encoding]::UTF8)

Write-Host "Original Total Lines: $($lines.Length)"
Write-Host "Line 3407: $($lines[3407])"
Write-Host "Line 3408: $($lines[3408])"
Write-Host "Line 3684: $($lines[3684])"
Write-Host "Line 3685: $($lines[3685])"
Write-Host "Line 15213: $($lines[15213])"
Write-Host "Line 15899: $($lines[15899])"

if (!$lines[3408].Contains("memoirSplitEditorModal") -or !$lines[3685].Contains("tistoryEditorModal")) {
    Write-Error "Modal anchor lines mismatch!"
    exit 1
}

if (!$lines[15213].Contains("beauty-crm.js") -or $lines[15899].Trim() -ne "</script>") {
    Write-Error "Script anchor lines mismatch!"
    exit 1
}

$part1 = $lines[0..3406]
$upgradedModals = [System.IO.File]::ReadAllLines("tools/upgraded_modals.html", [System.Text.Encoding]::UTF8)
$part2 = $lines[3684..15212]
$memoirEngine = [System.IO.File]::ReadAllLines("tools/memoir_engine.js", [System.Text.Encoding]::UTF8)

$scriptHeader = @(
  '  <script src="beauty-crm.js"></script>',
  '',
  '  <!-- ==========================================================',
  '       [NEW] 04. Memoir Publication Control Center & AI Engine',
  '       ========================================================== -->',
  '  <script>'
)
$scriptFooter = @(
  '  </script>'
)

$part3 = $lines[15900..15901]

$newLines = @()
$newLines += $part1
$newLines += $upgradedModals
$newLines += @('')
$newLines += $part2
$newLines += $scriptHeader
$newLines += $memoirEngine
$newLines += $scriptFooter
$newLines += $part3

[System.IO.File]::WriteAllLines("admin.html", $newLines, $encoding)
Write-Host "Successfully assembled admin.html! Total new lines: $($newLines.Length)"
