# tools/inject_memoir_admin.ps1
$filePath = "admin.html"
$content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

# 1. switchTab 교체
$targetStart = "function switchTab(tabId, btn) {"
$targetEnd = "var panels = document.querySelectorAll('.tab-panel');"

$idxStart = $content.IndexOf($targetStart)
$idxEnd = $content.IndexOf($targetEnd)

if ($idxStart -ne -1 -and $idxEnd -ne -1 -and $idxEnd -gt $idxStart) {
    $newSwitchTab = @"
function switchTab(tabId, btn) {
      if (tabId === 'tabMemoir') {
        tabId = 'tabMemoirDashboard';
      } else if (['tabBusinessMaster', 'tabBeautyCrm', 'tabTest', 'tabConsult'].indexOf(tabId) !== -1) {
        var mappedBiz = tabId === 'tabBeautyCrm' ? 'beauty' : (tabId === 'tabTest' ? 'wardrobe' : (typeof currentBusinessTab !== 'undefined' ? currentBusinessTab : 'beauty'));
        tabId = 'tabBusinessMaster';
        btn = document.getElementById('navBtnBusinessMaster') || btn;
        if (typeof switchBusinessMasterTab === 'function') {
          switchBusinessMasterTab(mappedBiz);
        } else if (typeof renderBusinessMasterDashboard === 'function') {
          renderBusinessMasterDashboard();
        }
      }

      if (!btn) {
        if (tabId === 'tabAcademy') btn = document.getElementById('navBtnAcademy');
        else if (tabId === 'tabCoachControl') btn = document.getElementById('navBtnCoachControl');
        else if (tabId === 'tabBusinessMaster') btn = document.getElementById('navBtnBusinessMaster');
        else if (tabId === 'tabMemoirDashboard') btn = document.getElementById('navBtnMemoirDashboard');
      }

      
"@
    $content = $content.Substring(0, $idxStart) + $newSwitchTab + $content.Substring($idxEnd)
    Write-Host "[1/3] switchTab head successfully updated."
} else {
    Write-Host "[!] Could not locate switchTab block."
}

# 2. tabMemoirDashboard 렌더링 호출 확인
$memoirTriggerCheck = "tabMemoirDashboard' && typeof renderMemoirDashboard"
if (-not $content.Contains($memoirTriggerCheck)) {
    $targetHook = "if (tabId === 'tabAcademy')"
    $hookIdx = $content.IndexOf($targetHook)
    if ($hookIdx -ne -1) {
        $triggerCode = @"
/* 04. 자서전 출판 관제센터 진입 시 실시간 렌더링 */
      if (tabId === 'tabMemoirDashboard' && typeof renderMemoirDashboard === 'function') {
        renderMemoirDashboard();
      }

      
"@
        $content = $content.Substring(0, $hookIdx) + $triggerCode + $content.Substring($hookIdx)
        Write-Host "[2/3] switchTab trigger added."
    }
} else {
    Write-Host "[2/3] switchTab trigger already exists."
}

# 3. 자서전 관제 JS 엔진 주입 확인
if (-not $content.Contains("04. 자서전 출판 관제센터 & AI 윤문 파이프라인 엔진")) {
    $engineFile = "tools/memoir_engine.js"
    if (Test-Path $engineFile) {
        $jsEngine = [System.IO.File]::ReadAllText($engineFile, [System.Text.Encoding]::UTF8)
        $targetScriptEnd = "</script>"
        $lastIdx = $content.LastIndexOf($targetScriptEnd)
        if ($lastIdx -ne -1) {
            $content = $content.Substring(0, $lastIdx) + "`n" + $jsEngine + "`n" + $content.Substring($lastIdx)
            Write-Host "[3/3] Memoir JS engine injected from file."
        }
    }
} else {
    Write-Host "[3/3] Memoir JS engine already present."
}

$utf8Encoding = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($filePath, $content, $utf8Encoding)
Write-Host "admin.html saved successfully with UTF-8."
