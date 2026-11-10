$ErrorActionPreference = "Continue"
Write-Host "Checking G:\ and UserProfile for git or credentials..."
Get-ChildItem -Path $env:USERPROFILE -Filter "*git*" -Force -ErrorAction SilentlyContinue | Select-Object FullName
if (Test-Path "G:\") {
    Get-ChildItem -Path "G:\" -Depth 2 -Force -ErrorAction SilentlyContinue | Select-Object FullName
}
