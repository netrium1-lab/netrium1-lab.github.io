$content = [System.IO.File]::ReadAllText("admin.html", [System.Text.Encoding]::UTF8)

$checks = @(
    "memoirSplitEditorModal",
    "memoirProjectCreateModal",
    "memoirPrintPreviewModal",
    "newMemoirAudioFile",
    "newMemoirPhotoFiles",
    "runOneClickAiMemoirPipeline",
    "openMemoirPrintPreview",
    "downloadMemoirPdf",
    "beauty-crm.js`"></script>",
    "window.openMemoirProjectCreateModal = openMemoirProjectCreateModal;"
)

$allPassed = $true
foreach ($chk in $checks) {
    if ($content.Contains($chk)) {
        Write-Host "[PASS] Contains: $chk"
    } else {
        Write-Host "[FAIL] Missing: $chk"
        $allPassed = $false
    }
}

if ($allPassed) {
    Write-Host "ALL CHECKS PASSED!"
} else {
    Write-Host "SOME CHECKS FAILED!"
}
