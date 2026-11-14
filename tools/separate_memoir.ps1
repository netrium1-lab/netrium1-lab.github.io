# PowerShell script to separate Memoir Management into its own dedicated category in admin.html
$ErrorActionPreference = "Stop"

$filePath = "admin.html"
$encoding = [System.Text.Encoding]::UTF8
$lines = [System.IO.File]::ReadAllLines($filePath, $encoding)

Write-Host "Read admin.html: $($lines.Length) lines."

# 1. Locate Sidebar Nav
$startSidebar = -1
$endSidebar = -1
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match '<nav class="sidebar-nav">') { $startSidebar = $i }
    if ($startSidebar -ge 0 -and $lines[$i] -match '</nav>') { $endSidebar = $i; break }
}
Write-Host "Sidebar nav: lines $($startSidebar + 1) to $($endSidebar + 1)"

# 2. Locate Top Workflow Bar
$startTopBar = -1
$endTopBar = -1
for ($i = 2070; $i -lt 2150; $i++) {
    if ($lines[$i] -match '비즈니스 라이프사이클.*?원스톱 워크플로우 퀵 바') { $startTopBar = $i }
    if ($startTopBar -ge 0 -and $lines[$i] -match '<!-- ================= 01.') { $endTopBar = $i - 1; break }
}
Write-Host "Top workflow bar: lines $($startTopBar + 1) to $($endTopBar + 1)"

# 3. Locate Memoir Block in tabBusinessMaster
$startMemoirBlock = -1
$endMemoirBlock = -1
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match 'id="bizMemoirBannerCard"') { $startMemoirBlock = $i }
    if ($startMemoirBlock -ge 0 -and $lines[$i] -match '<!-- 맞춤 진단 고객 접수 안내 배너 -->') { $endMemoirBlock = $i - 1; break }
}
Write-Host "Memoir block in tabBusinessMaster: lines $($startMemoirBlock + 1) to $($endMemoirBlock + 1)"

# 4. Locate End of tabMemoirDashboard
$endMemoirDash = -1
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match '<section class="tab-panel" id="tabMemoirDashboard">') {
        for ($j = $i; $j -lt $lines.Length; $j++) {
            if ($lines[$j] -match '</section>') {
                $endMemoirDash = $j
                break
            }
        }
        break
    }
}
Write-Host "tabMemoirDashboard ends at line $($endMemoirDash + 1)"

# Extract memoir block content
$memoirBlockLines = $lines[$startMemoirBlock..$endMemoirBlock]
$memoirBlockContent = [string]::Join("`n", $memoirBlockLines)
# Ensure bizMemoirBannerCard is displayed as block in tabMemoirDashboard
$memoirBlockContent = $memoirBlockContent.Replace('id="bizMemoirBannerCard" style="display: none; margin-top: 24px;"', 'id="bizMemoirBannerCard" style="display: block; margin-top: 24px;"')

# New Sidebar with dedicated Memoir Tab
$newSidebar = @'
      <nav class="sidebar-nav">
        <!-- AI 자동 글쓰기 스튜디오 전용 퀵 버튼 -->
        <div style="padding: 0 10px 10px;">
          <button type="button" onclick="openAiArticleGeneratorModal()" style="width: 100%; padding: 11px 14px; border-radius: 12px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; border: none; font-size: 0.88rem; font-weight: 850; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4); transition: transform 0.15s ease;">
            <span>🪄 AI 자동 글쓰기</span>
          </button>
        </div>

        <div style="font-size: 0.72rem; font-weight: 850; color: var(--text-muted); padding: 6px 14px 4px; letter-spacing: 0.05em;">
          CORE OPERATIONS
        </div>

        <!-- 📊 01. 종합 관제 홈 (Today Cockpit) -->
        <button class="nav-tab-btn active" onclick="switchTab('tabCockpit', this)" id="navBtnCockpit" style="font-weight: 850;">
          <span class="nav-tab-icon">📊</span>
          <span>01. 종합 관제 홈</span>
          <span id="cockpitTodayBadge" style="background: #2b5a42; color:#fff; font-size:0.7rem; font-weight:900; padding:2px 7px; border-radius:999px; margin-left:auto;">오늘</span>
        </button>

        <!-- 📋 02. 고객 접수 & 상담 센터 (Leads & Consult) -->
        <button class="nav-tab-btn" onclick="switchTab('tabConsult', this)" id="navBtnConsult" style="font-weight: 850;">
          <span class="nav-tab-icon">📋</span>
          <span>02. 고객 접수 &amp; 상담</span>
          <span id="consultPendingBadge" style="background:#0284c7; color:#fff; font-size:0.7rem; font-weight:900; padding:2px 6px; border-radius:999px; margin-left:auto;">신규</span>
        </button>

        <!-- 🌟 03. 4대 비즈니스 관제 (4 Core Offline Services) -->
        <button class="nav-tab-btn" onclick="switchTab('tabBusinessMaster', this)" id="navBtnBusinessMaster" style="color: #b83354; font-weight: 850;">
          <span class="nav-tab-icon">🌟</span>
          <span>03. 4대 비즈니스 관제</span>
          <span id="businessMasterBadge" style="background:#b83354; color:#fff; font-size:0.7rem; font-weight:900; padding:2px 6px; border-radius:999px; margin-left:auto;">1호~4호</span>
        </button>

        <!-- 📖 04. [독립 분리] 디지털 자서전 출판 관제 -->
        <button class="nav-tab-btn" onclick="switchTab('tabMemoirDashboard', this)" id="navBtnMemoirDashboard" style="color: #936f1c; font-weight: 850; background: rgba(194, 155, 56, 0.08); border-left: 3px solid #c29b38;">
          <span class="nav-tab-icon">📖</span>
          <span>04. 자서전 출판 관제</span>
          <span id="memoirDashboardBadge" style="background: linear-gradient(135deg, #c29b38, #9a7820); color:#fff; font-size:0.7rem; font-weight:900; padding:2px 7px; border-radius:999px; margin-left:auto;">AI윤문·조판</span>
        </button>

        <!-- 🤝 05. 코칭스태프 & 정산 센터 (Coach Ops & Settlement) -->
        <button class="nav-tab-btn" onclick="switchTab('tabCoachControl', this)" id="navBtnCoachControl" style="font-weight: 850;">
          <span class="nav-tab-icon">🤝</span>
          <span>05. 코치 관제 &amp; 정산</span>
          <span id="sidebarPendingBadge" style="background:#d97706; color:#fff; font-size:0.7rem; font-weight:900; padding:2px 6px; border-radius:999px; margin-left:auto;">파견·정산</span>
        </button>

        <div style="height: 1px; background: var(--border-color); margin: 10px 12px 6px;"></div>
        <div style="font-size: 0.72rem; font-weight: 850; color: var(--text-muted); padding: 4px 14px 4px; letter-spacing: 0.05em;">
          CONTENT &amp; SYSTEM
        </div>

        <!-- 📚 06. 여백서재 & 아카이브 (Content & Archive) -->
        <button class="nav-tab-btn" onclick="switchTab('tabMagazine', this)" id="navBtnMagazine">
          <span class="nav-tab-icon">📚</span>
          <span>06. 여백서재 &amp; 아카이브</span>
        </button>

        <!-- ⚙️ 07. 환경설정 & 채널연동 (Settings & Marketing) -->
        <button class="nav-tab-btn" onclick="switchTab('tabSettings', this)" id="navBtnSettings">
          <span class="nav-tab-icon">⚙️</span>
          <span>07. 환경설정 &amp; 채널연동</span>
        </button>

        <!-- Hidden anchor button for 100% backward compatibility with legacy scripts expecting navBtnAcademy -->
        <button id="navBtnAcademy" onclick="switchTab('tabAcademy', this)" style="display:none;"></button>
      </nav>
'@

# New Top Bar Content
$newTopBar = @'
      <!-- 🌟 비즈니스 라이프사이클 5단계 원스톱 워크플로우 퀵 바 -->
      <div style="margin: 0 0 22px; padding: 14px 18px; border-radius: 14px; background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border: 1.5px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.03);">
        <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
          <span style="font-size: 0.88rem; font-weight: 900; color: var(--text-main); display: inline-flex; align-items: center; gap: 6px; margin-right: 4px;">
            <span style="font-size: 1.15rem;">⚡</span> <strong style="color: #2b5a42;">비즈니스 라이프사이클:</strong>
          </span>
          <button type="button" onclick="switchTab('tabConsult')" class="btn-save-setting" style="background: #e0f2fe; color: #0369a1; border: 1.5px solid #bae6fd; font-size: 0.82rem; font-weight: 850; padding: 6px 11px; cursor: pointer;">
            <span>📋 1단계: 고객상담</span>
          </button>
          <span style="color: #cbd5e1; font-weight: 900;">➔</span>
          <button type="button" onclick="switchTab('tabBusinessMaster')" class="btn-save-setting" style="background: #fff0f3; color: #b83354; border: 1.5px solid #f8c8d2; font-size: 0.82rem; font-weight: 850; padding: 6px 11px; cursor: pointer;">
            <span>🌟 2단계: 4대 비즈니스</span>
          </button>
          <span style="color: #cbd5e1; font-weight: 900;">➔</span>
          <button type="button" onclick="switchTab('tabMemoirDashboard')" class="btn-save-setting" style="background: rgba(194, 155, 56, 0.15); color: #936f1c; border: 1.5px solid #c29b38; font-size: 0.82rem; font-weight: 850; padding: 6px 11px; cursor: pointer;">
            <span>📖 3단계: 자서전 출판</span>
          </button>
          <span style="color: #cbd5e1; font-weight: 900;">➔</span>
          <button type="button" onclick="switchTab('tabAcademy')" class="btn-save-setting" style="background: #fffbeb; color: #b45309; border: 1.5px solid #fde68a; font-size: 0.82rem; font-weight: 850; padding: 6px 11px; cursor: pointer;">
            <span>🤝 4단계: 코치 파견</span>
          </button>
          <span style="color: #cbd5e1; font-weight: 900;">➔</span>
          <button type="button" onclick="switchTab('tabCoachControl')" class="btn-save-setting" style="background: #ecfdf5; color: #047857; border: 1.5px solid #a7f3d0; font-size: 0.82rem; font-weight: 850; padding: 6px 11px; cursor: pointer;">
            <span>📸 5단계: 검수&amp;정산</span>
          </button>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button type="button" onclick="switchTab('tabCockpit')" class="btn-save-setting" style="background: #2b5a42; color: #ffffff; border: none; font-size: 0.82rem; font-weight: 850; padding: 6px 12px; cursor: pointer; box-shadow: 0 2px 6px rgba(43,90,66,0.3);">
            <span>📊 관제 홈</span>
          </button>
          <button type="button" onclick="switchTab('tabMemoirDashboard')" class="btn-save-setting" style="background: #c29b38; color: #ffffff; border: 1.5px solid #aa7c11; font-size: 0.82rem; font-weight: 850; padding: 6px 12px; cursor: pointer; box-shadow: 0 2px 6px rgba(194,155,56,0.3);">
            <span>📖 자서전 스튜디오</span>
          </button>
        </div>
      </div>
'@

# Replacement in tabBusinessMaster for the removed memoir block
$memoirSeparationBannerInBiz = @'
        <!-- 📖 디지털 자서전 출판 관제 분리 안내 카드 -->
        <div class="panel-card" style="margin-top: 24px; background: #fdfbf7; border: 1.5px solid #e7d8b5;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 1.8rem;">📖</span>
              <div>
                <div style="font-weight: 850; font-size: 0.98rem; color: #936f1c;">디지털 자서전 출판 &amp; AI 윤문 스튜디오 독립 관제</div>
                <div style="color: #785714; font-size: 0.86rem; margin-top: 2px;">
                  생애 구술 채록 인터뷰 녹취, AI 5단계 감성 윤문, 양장본 조판 및 완간 도서 PDF 관리는 <strong>[04. 자서전 출판 관제]</strong> 전용 스튜디오에서 독립적으로 관리됩니다.
                </div>
              </div>
            </div>
            <button type="button" class="btn-save-setting" onclick="switchTab('tabMemoirDashboard')" style="background: #c29b38; color: #ffffff; border: none; font-weight: 850; box-shadow: 0 2px 6px rgba(194,155,56,0.3); padding: 8px 16px; cursor: pointer;">
              <span>자서전 출판 전용 스튜디오 열기 ➔</span>
            </button>
          </div>
        </div>
'@

# Sub-nav for tabMemoirDashboard
$subnavMemoirDash = @'
        <!-- 자서전 출판 관제 전용 서브 내비게이션 -->
        <div style="display: flex; gap: 8px; margin-bottom: 18px; border-bottom: 2px solid rgba(194, 155, 56, 0.3); padding-bottom: 12px; flex-wrap: wrap;">
          <button type="button" class="btn-save-setting" onclick="document.getElementById('memoirProjectsCard').scrollIntoView({behavior:'smooth'});" style="background: #c29b38; color: #ffffff; border: none; font-weight: 850;">
            <span>📖 1. 출판 프로젝트 &amp; AI 감성윤문 파이프라인</span>
          </button>
          <button type="button" class="btn-save-setting" onclick="var p = document.getElementById('publishedMemoirsSection'); if(p) p.scrollIntoView({behavior:'smooth'});" style="background: #ffffff; color: var(--text-main); border: 1.5px solid var(--border-color); font-weight: 800;">
            <span>📚 2. 완간 자서전 도서 &amp; PDF 관리 (서재 연동)</span>
          </button>
          <button type="button" class="btn-save-setting" onclick="var b = document.getElementById('bizMemoirBannerCard'); if(b) { b.style.display='block'; b.scrollIntoView({behavior:'smooth'}); }" style="background: #ffffff; color: var(--text-main); border: 1.5px solid var(--border-color); font-weight: 800;">
            <span>📢 3. 메인 CTA 배너 (30일 워크북 증정) 설정</span>
          </button>
        </div>
'@

# Assemble new lines
$newLines = [System.Collections.Generic.List[string]]::new()

for ($i = 0; $i -lt $lines.Length; $i++) {
    # 1. Replace Sidebar
    if ($i -eq $startSidebar) {
        $newLines.Add($newSidebar)
        $i = $endSidebar
        continue
    }

    # 2. Replace Top Workflow Bar
    if ($i -eq $startTopBar) {
        $newLines.Add($newTopBar)
        $i = $endTopBar
        continue
    }

    # 3. In tabBusinessMaster, replace the memoir block with the clean banner
    if ($i -eq $startMemoirBlock) {
        $newLines.Add($memoirSeparationBannerInBiz)
        $i = $endMemoirBlock
        continue
    }

    # 4. In tabMemoirDashboard, add subnav right after opening tag
    if ($lines[$i] -match '<section class="tab-panel" id="tabMemoirDashboard">') {
        $newLines.Add($lines[$i])
        $newLines.Add($subnavMemoirDash)
        continue
    }

    # 5. In tabMemoirDashboard, attach the memoir block right before </section>
    if ($i -eq $endMemoirDash) {
        $newLines.Add("<div id=`"publishedMemoirsSection`">")
        $newLines.Add($memoirBlockContent)
        $newLines.Add("</div>")
        $newLines.Add($lines[$i])
        continue
    }

    $newLines.Add($lines[$i])
}

Write-Host "Constructed intermediate HTML with $($newLines.Count) lines."
$fullHtml = [string]::Join("`n", $newLines)

# Update switchTab to map tabMemoirDashboard to navBtnMemoirDashboard directly
$oldMemoirTabMap = "else if (tabId === 'tabMemoirDashboard') btn = document.getElementById('navBtnBusinessMaster') || document.getElementById('navBtnMemoirDashboard');"
$newMemoirTabMap = "else if (tabId === 'tabMemoirDashboard') btn = document.getElementById('navBtnMemoirDashboard');"
if ($fullHtml.Contains($oldMemoirTabMap)) {
    $fullHtml = $fullHtml.Replace($oldMemoirTabMap, $newMemoirTabMap)
    Write-Host "Updated switchTab memoir button mapping!"
}

# Update renderPublishedMemoirsTable call inside switchTab
$oldMemoirHook = "if (tabId === 'tabMemoirDashboard' && typeof renderMemoirDashboard === 'function') {
        renderMemoirDashboard();
      }"
$newMemoirHook = "if (tabId === 'tabMemoirDashboard') {
        if (typeof renderMemoirDashboard === 'function') renderMemoirDashboard();
        if (typeof renderPublishedMemoirsTable === 'function') renderPublishedMemoirsTable();
      }"
if ($fullHtml.Contains($oldMemoirHook)) {
    $fullHtml = $fullHtml.Replace($oldMemoirHook, $newMemoirHook)
    Write-Host "Updated switchTab memoir render hook!"
}

# Add id="memoirProjectsCard" if not present so sub-nav anchor can jump smoothly
if (!$fullHtml.Contains('id="memoirProjectsCard"')) {
    $fullHtml = $fullHtml.Replace('<!-- 3. 프로젝트 파이프라인 관리 테이블 -->', '<div id="memoirProjectsCard"></div>' + "`n" + '          <!-- 3. 프로젝트 파이프라인 관리 테이블 -->')
}

# Save updated admin.html
[System.IO.File]::WriteAllText($filePath, $fullHtml, $encoding)
Write-Host "Saved admin.html with separated Memoir Category successfully!"
