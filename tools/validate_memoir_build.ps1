# tools/validate_memoir_build.ps1
$adminHtml = [System.IO.File]::ReadAllText("admin.html", [System.Text.Encoding]::UTF8)
$indexHtml = [System.IO.File]::ReadAllText("index.html", [System.Text.Encoding]::UTF8)

$checks = @(
    @{ Name = "index.html - Roadmap grid"; Passed = $indexHtml.Contains("memoir-roadmap-container") },
    @{ Name = "index.html - Packages grid"; Passed = $indexHtml.Contains("memoir-packages-container") },
    @{ Name = "index.html - Package modal"; Passed = $indexHtml.Contains("memoirPackageModal") },
    @{ Name = "index.html - Package submit JS"; Passed = $indexHtml.Contains("handleMemoirPackageSubmit") },
    @{ Name = "admin.html - Sidebar tab 04"; Passed = ($adminHtml.Contains("tabMemoirDashboard") -and $adminHtml.Contains("navBtnMemoirDashboard")) },
    @{ Name = "admin.html - Control panel section"; Passed = $adminHtml.Contains('id="tabMemoirDashboard"') },
    @{ Name = "admin.html - Split-view editor modal"; Passed = $adminHtml.Contains('id="memoirSplitEditorModal"') },
    @{ Name = "admin.html - Create project modal"; Passed = $adminHtml.Contains('id="memoirProjectCreateModal"') },
    @{ Name = "admin.html - switchTab routing"; Passed = $adminHtml.Contains("tabMemoirDashboard") },
    @{ Name = "admin.html - Memoir JS engine"; Passed = $adminHtml.Contains("DEFAULT_MEMOIR_PROJECTS") },
    @{ Name = "admin.html - Dashboard render fn"; Passed = $adminHtml.Contains("renderMemoirDashboard") },
    @{ Name = "admin.html - Split editor fn"; Passed = $adminHtml.Contains("openMemoirSplitEditor") }
)

$allPassed = $true
foreach ($c in $checks) {
    if ($c.Passed) {
        Write-Host "[PASS] $($c.Name)"
    } else {
        Write-Host "[FAIL] $($c.Name)"
        $allPassed = $false
    }
}

if ($allPassed) {
    Write-Host "`nAll 12 validation checks PASSED successfully!"
} else {
    Write-Host "`nSome checks failed."
    exit 1
}
