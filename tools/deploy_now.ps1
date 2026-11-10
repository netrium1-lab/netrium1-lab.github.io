$ErrorActionPreference = "Continue"
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

Write-Host "=== 1. Running sync_and_generate_og.ps1 ==="
& powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "sync_and_generate_og.ps1")

Write-Host "=== 2. Checking tools directory and searching for git.exe ==="
Get-ChildItem -Path $PSScriptRoot | Select-Object Name
Get-ChildItem -Path $repoRoot -Filter "*.bat" | Select-Object Name

$gitCandidates = @(
    "C:\Program Files\Git\cmd\git.exe",
    "C:\Program Files\Git\bin\git.exe",
    "C:\Program Files (x86)\Git\cmd\git.exe",
    "$env:LOCALAPPDATA\Programs\Git\cmd\git.exe",
    "$env:USERPROFILE\scoop\shims\git.exe"
)
$foundGits = @()
foreach ($dir in @("$env:LOCALAPPDATA", "$env:APPDATA", "C:\Program Files", "G:\")) {
    if (Test-Path $dir) {
        $g = Get-ChildItem -Path $dir -Filter "git.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName
        if ($g) { $foundGits += $g }
    }
}
Write-Host "Found git executables:"
$foundGits | ForEach-Object { Write-Host " - $_" }

$gitExe = $foundGits | Select-Object -First 1
if ($gitExe) {
    Write-Host "Using Git: $gitExe"
    & $gitExe add -A
    & $gitExe commit -m "fix: AI article publishing sync, deep link Firestore priority, and mag_1794134205598 images"
    & $gitExe push origin main
}
