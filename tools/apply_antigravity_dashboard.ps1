# PowerShell script to transform admin.html into Antigravity Modern Pro Dashboard
$adminPath = "c:\Users\User1\구글드라이브\antigravity\admin.html"
$content = [System.IO.File]::ReadAllText($adminPath, [System.Text.Encoding]::UTF8)

Write-Host "1. Updating CSS for Antigravity Modern Pro Theme..."

$targetCss = @"
    /* ================= 대시보드 레이아웃 (좌측 사이드바 + 우측 메인) ================= */
    .admin-wrapper {
      display: flex;
      min-height: 100vh;
      width: 100%;
    }

    /* 좌측 사이드바 */
    .admin-sidebar {
      width: 270px;
      background: var(--bg-sidebar);
      border-right: 1.5px solid var(--border-color);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow-y: auto;
      z-index: 100;
    }

    .sidebar-header {
      padding: 28px 24px 20px;
      border-bottom: 1px solid var(--border-color);
    }

    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: inherit;
    }

    .sidebar-brand-bar {
      width: 5px;
      height: 24px;
      background: var(--accent-gold);
      border-radius: 999px;
    }

    .sidebar-brand-text {
      font-family: 'Noto Serif KR', serif;
      font-size: 1.35rem;
      font-weight: 900;
      color: var(--accent-gold);
      letter-spacing: -0.5px;
    }

    .sidebar-sub {
      font-size: 0.78rem;
      color: var(--text-muted);
      margin-top: 4px;
      padding-left: 15px;
      font-weight: 600;
    }

    .sidebar-nav {
      padding: 20px 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
    }

    .nav-tab-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 12px 16px;
      border-radius: 14px;
      border: none;
      background: transparent;
      color: var(--text-sub);
      font-size: 0.94rem;
      font-weight: 700;
      text-align: left;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
    }
    .nav-tab-btn:hover {
      background: var(--bg-body);
      color: var(--text-main);
    }
    .nav-tab-btn.active {
      background: var(--accent-gold-light);
      color: #927014;
      font-weight: 850;
    }

    .nav-tab-icon {
      font-size: 1.25rem;
      line-height: 1;
      width: 24px;
      text-align: center;
    }

    .sidebar-footer {
      padding: 18px 16px;
      border-top: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      gap: 8px;
      background: #fafafa;
    }

    .sidebar-link-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      border-radius: 10px;
      text-decoration: none;
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--text-sub);
      transition: all 0.2s ease;
      border: 1px solid var(--border-color);
      background: #ffffff;
      cursor: pointer;
    }
    .sidebar-link-btn:hover {
      background: var(--bg-body);
      color: var(--accent);
      border-color: var(--accent);
    }
    .sidebar-link-btn.logout {
      color: var(--danger);
      border-color: #fecaca;
    }
    .sidebar-link-btn.logout:hover {
      background: var(--danger-light);
    }

    /* 우측 메인 컨텐츠 영역 */
    .admin-main {
      flex: 1;
      padding: 36px 40px;
      overflow-y: auto;
      max-width: 1300px;
    }

    .top-action-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }
"@

$replacementCss = @"
    /* ================= 대시보드 레이아웃 (안티그래비티 Pro 테크-럭셔리) ================= */
    .admin-wrapper {
      display: flex;
      height: 100vh;
      width: 100%;
      overflow: hidden;
      background: #f8fafc;
    }

    /* 좌측 사이드바 (안티그래비티 다크 프로페셔널) */
    .admin-sidebar {
      width: 280px;
      background: linear-gradient(180deg, #0b1329 0%, #0f172a 100%);
      border-right: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      height: 100vh;
      overflow-y: auto;
      z-index: 100;
      box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
    }
    .admin-sidebar::-webkit-scrollbar {
      width: 4px;
    }
    .admin-sidebar::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.12);
      border-radius: 999px;
    }

    .sidebar-header {
      padding: 24px 20px 18px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(11, 19, 41, 0.6);
      backdrop-filter: blur(8px);
    }

    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: inherit;
    }

    .sidebar-brand-bar {
      width: 4px;
      height: 22px;
      background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
      border-radius: 999px;
      box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
    }

    .sidebar-brand-text {
      font-family: 'Noto Serif KR', serif;
      font-size: 1.25rem;
      font-weight: 900;
      color: #f8fafc;
      letter-spacing: -0.3px;
    }

    .sidebar-sub {
      font-size: 0.72rem;
      color: #94a3b8;
      margin-top: 4px;
      padding-left: 14px;
      font-weight: 700;
      letter-spacing: 0.06em;
    }

    .sidebar-nav {
      padding: 16px 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }

    .nav-tab-btn {
      display: flex;
      align-items: center;
      gap: 11px;
      width: 100%;
      padding: 10px 14px;
      border-radius: 10px;
      border: 1px solid transparent;
      background: transparent;
      color: #94a3b8;
      font-size: 0.90rem;
      font-weight: 700;
      text-align: left;
      cursor: pointer;
      transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
      font-family: inherit;
      position: relative;
    }
    .nav-tab-btn:hover {
      background: rgba(255, 255, 255, 0.05);
      color: #ffffff;
      transform: translateX(2px);
    }
    .nav-tab-btn.active {
      background: rgba(30, 41, 59, 0.85);
      color: #ffffff;
      font-weight: 850;
      border-color: rgba(255, 255, 255, 0.12);
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
    }
    .nav-tab-btn.active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 8px;
      bottom: 8px;
      width: 3.5px;
      border-radius: 4px;
      background: linear-gradient(180deg, #f59e0b, #d97706);
    }

    .nav-tab-icon {
      font-size: 1.15rem;
      line-height: 1;
      width: 22px;
      text-align: center;
    }

    /* 사이드바 서브메뉴 트리 (좌측에서 원클릭 비즈니스 직속 전환) */
    .sidebar-subnav {
      display: flex;
      flex-direction: column;
      gap: 3px;
      margin: 4px 0 6px 20px;
      padding-left: 12px;
      border-left: 1.5px solid rgba(255, 255, 255, 0.12);
    }
    .subnav-link {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 7px 10px;
      border-radius: 8px;
      border: 1px solid transparent;
      background: transparent;
      color: #94a3b8;
      font-size: 0.82rem;
      font-weight: 700;
      text-align: left;
      cursor: pointer;
      transition: all 0.15s ease;
      font-family: inherit;
      width: 100%;
    }
    .subnav-link:hover {
      background: rgba(255, 255, 255, 0.06);
      color: #ffffff;
      transform: translateX(2px);
    }
    .subnav-link.active {
      background: rgba(217, 119, 6, 0.18);
      color: #fbbf24;
      font-weight: 850;
      border-color: rgba(245, 158, 11, 0.35);
    }
    .subnav-link.active .subnav-icon {
      transform: scale(1.15);
    }
    .subnav-icon {
      font-size: 0.95rem;
      line-height: 1;
      transition: transform 0.15s ease;
    }

    .sidebar-footer {
      padding: 14px 14px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      flex-direction: column;
      gap: 6px;
      background: #080e1e;
    }

    .sidebar-link-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 12px;
      border-radius: 8px;
      text-decoration: none;
      font-size: 0.83rem;
      font-weight: 700;
      color: #94a3b8;
      transition: all 0.15s ease;
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(255, 255, 255, 0.02);
      cursor: pointer;
    }
    .sidebar-link-btn:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
      border-color: rgba(255, 255, 255, 0.18);
    }
    .sidebar-link-btn.logout {
      color: #f87171;
      border-color: rgba(239, 68, 68, 0.2);
    }
    .sidebar-link-btn.logout:hover {
      background: rgba(239, 68, 68, 0.12);
      color: #fca5a5;
    }

    /* 우측 메인 컨텐츠 영역 (독립 세로 스크롤) */
    .admin-main {
      flex: 1;
      padding: 24px 36px 60px;
      overflow-y: auto;
      background: #f8fafc;
    }
    .admin-main::-webkit-scrollbar {
      width: 8px;
    }
    .admin-main::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 999px;
    }
    .admin-main::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }

    /* 안티그래비티 상단 브레드크럼 바 */
    .top-action-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      padding-bottom: 14px;
      border-bottom: 1px solid #e2e8f0;
      flex-wrap: wrap;
      gap: 12px;
    }

    /* 본문 상단 슬림 미니 스위처 버튼 */
    .biz-slim-pill {
      background: transparent;
      color: #64748b;
      border: none;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .biz-slim-pill:hover {
      background: rgba(255, 255, 255, 0.8);
      color: #0f172a;
    }
    .biz-slim-pill.active {
      background: #0f172a !important;
      color: #ffffff !important;
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.2);
    }
"@

if ($content.Contains($targetCss)) {
    $content = $content.Replace($targetCss, $replacementCss)
    Write-Host "[SUCCESS] CSS updated."
} else {
    Write-Error "[FAIL] Could not match targetCss."
    exit 1
}

Write-Host "2. Updating Left Sidebar HTML for Antigravity Pro & Sub-navigation..."

# Find the sidebar element
$sidebarStartIdx = $content.IndexOf('<aside class="admin-sidebar" id="adminSidebar">')
$sidebarEndIdx = $content.IndexOf('</aside>', $sidebarStartIdx) + '</aside>'.Length

if ($sidebarStartIdx -lt 0 -or $sidebarEndIdx -lt 0) {
    Write-Error "[FAIL] Could not find <aside class=`"admin-sidebar`" id=`"adminSidebar`">"
    exit 1
}

$oldSidebarHtml = $content.Substring($sidebarStartIdx, $sidebarEndIdx - $sidebarStartIdx)

$newSidebarHtml = @"
<aside class="admin-sidebar" id="adminSidebar">
      <div class="sidebar-header">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
          <a href="admin.html" class="sidebar-brand">
            <div class="sidebar-brand-bar"></div>
            <div class="sidebar-brand-text">여백과 결</div>
          </a>
          <span style="font-size: 0.65rem; font-weight: 900; background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.35); padding: 2px 7px; border-radius: 999px; letter-spacing: 0.05em; display: inline-flex; align-items: center; gap: 4px;">
            <span style="width: 5px; height: 5px; border-radius: 50%; background: #10b981; display: inline-block;"></span>
            PRO v2.5
          </span>
        </div>
        <div class="sidebar-sub">ANTIGRAVITY BUSINESS CONSOLE</div>
      </div>

      <nav class="sidebar-nav">
        <!-- AI 자동 글쓰기 스튜디오 전용 퀵 버튼 -->
        <div style="padding: 0 4px 8px;">
          <button type="button" onclick="openAiArticleGeneratorModal()" style="width: 100%; padding: 10px 14px; border-radius: 10px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; border: none; font-size: 0.86rem; font-weight: 850; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4); transition: transform 0.15s ease;">
            <span>🪄 AI 자동 글쓰기</span>
          </button>
        </div>

        <div style="font-size: 0.68rem; font-weight: 850; color: #64748b; padding: 6px 12px 3px; letter-spacing: 0.08em;">
          CORE OPERATIONS
        </div>

        <!-- 📊 01. 종합 관제 홈 (Today Cockpit) -->
        <button class="nav-tab-btn active" onclick="switchTab('tabCockpit', this)" id="navBtnCockpit">
          <span class="nav-tab-icon">📊</span>
          <span>01. 종합 관제 홈</span>
          <span id="cockpitTodayBadge" style="background: rgba(16, 185, 129, 0.2); color:#34d399; border: 1px solid rgba(16, 185, 129, 0.3); font-size:0.68rem; font-weight:900; padding:2px 6px; border-radius:999px; margin-left:auto;">오늘</span>
        </button>

        <!-- 📋 02. 고객 접수 & 상담 센터 (Leads & Consult) -->
        <button class="nav-tab-btn" onclick="switchTab('tabConsult', this)" id="navBtnConsult">
          <span class="nav-tab-icon">📋</span>
          <span>02. 고객 접수 &amp; 상담</span>
          <span id="consultPendingBadge" style="background: rgba(14, 165, 233, 0.2); color:#38bdf8; border: 1px solid rgba(14, 165, 233, 0.3); font-size:0.68rem; font-weight:900; padding:2px 6px; border-radius:999px; margin-left:auto;">신규</span>
        </button>

        <!-- 🌟 03. 4대 비즈니스 관제 (4 Core Offline Services) -->
        <button class="nav-tab-btn" onclick="switchTab('tabBusinessMaster', this)" id="navBtnBusinessMaster">
          <span class="nav-tab-icon">🌟</span>
          <span>03. 4대 비즈니스 관제</span>
          <span id="businessMasterBadge" style="background: rgba(244, 63, 94, 0.2); color:#fb7185; border: 1px solid rgba(244, 63, 94, 0.3); font-size:0.68rem; font-weight:900; padding:2px 6px; border-radius:999px; margin-left:auto;">1호~4호</span>
        </button>

        <!-- 🌟 4대 비즈니스 좌측 직속 서브메뉴 트리 (화면을 올릴 필요 없이 좌측에서 원클릭 전환!) -->
        <div class="sidebar-subnav" id="sidebarSubnavBusiness">
          <button type="button" class="subnav-link active" id="sideSub_beauty" onclick="selectBusinessFromSidebar('beauty')">
            <span class="subnav-icon">💄</span>
            <span>01 뷰티케어 (180분)</span>
          </button>
          <button type="button" class="subnav-link" id="sideSub_wardrobe" onclick="selectBusinessFromSidebar('wardrobe')">
            <span class="subnav-icon">👗</span>
            <span>02 옷장 &amp; 공간 비움</span>
          </button>
          <button type="button" class="subnav-link" id="sideSub_legacy" onclick="selectBusinessFromSidebar('legacy')">
            <span class="subnav-icon">📦</span>
            <span>03 유품 &amp; 짐 아카이빙</span>
          </button>
          <button type="button" class="subnav-link" id="sideSub_party" onclick="selectBusinessFromSidebar('party')">
            <span class="subnav-icon">💌</span>
            <span>04 생전 엔딩 파티</span>
          </button>
        </div>

        <!-- 📖 04. [독립 분리] 디지털 자서전 출판 관제 -->
        <button class="nav-tab-btn" onclick="switchTab('tabMemoirDashboard', this)" id="navBtnMemoirDashboard">
          <span class="nav-tab-icon">📖</span>
          <span>04. 자서전 출판 관제</span>
          <span id="memoirDashboardBadge" style="background: rgba(217, 119, 6, 0.2); color:#fbbf24; border: 1px solid rgba(217, 119, 6, 0.3); font-size:0.68rem; font-weight:900; padding:2px 6px; border-radius:999px; margin-left:auto;">스튜디오</span>
        </button>

        <!-- 📖 자서전 출판 좌측 직속 서브메뉴 트리 -->
        <div class="sidebar-subnav" id="sidebarSubnavMemoir">
          <button type="button" class="subnav-link active" id="sideSub_memoir_projects" onclick="selectMemoirFromSidebar('projects')">
            <span class="subnav-icon">✍️</span>
            <span>1. 집필·윤문 스튜디오</span>
          </button>
          <button type="button" class="subnav-link" id="sideSub_memoir_published" onclick="selectMemoirFromSidebar('published')">
            <span class="subnav-icon">📚</span>
            <span>2. 완간 도서 &amp; PDF</span>
          </button>
          <button type="button" class="subnav-link" id="sideSub_memoir_banner" onclick="selectMemoirFromSidebar('banner')">
            <span class="subnav-icon">🎨</span>
            <span>3. 메인 워크북 배너</span>
          </button>
        </div>

        <!-- 🤝 05. 코칭스태프 & 정산 센터 (Coach Ops & Settlement) -->
        <button class="nav-tab-btn" onclick="switchTab('tabCoachControl', this)" id="navBtnCoachControl">
          <span class="nav-tab-icon">🤝</span>
          <span>05. 코치 관제 &amp; 정산</span>
          <span id="sidebarPendingBadge" style="background: rgba(234, 88, 12, 0.2); color:#fb923c; border: 1px solid rgba(234, 88, 12, 0.3); font-size:0.68rem; font-weight:900; padding:2px 6px; border-radius:999px; margin-left:auto;">파견·정산</span>
        </button>

        <div style="height: 1px; background: rgba(255, 255, 255, 0.08); margin: 8px 10px 4px;"></div>
        <div style="font-size: 0.68rem; font-weight: 850; color: #64748b; padding: 4px 12px 3px; letter-spacing: 0.08em;">
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

      <div class="sidebar-footer">
        <a href="index.html" class="sidebar-link-btn" title="사용자 메인 웹사이트로 이동">
          <span>🏠</span>
          <span>메인 사이트 가기</span>
        </a>
        <button type="button" class="sidebar-link-btn logout" onclick="adminLogout()" title="관리자 로그아웃">
          <span>🔒</span>
          <span>관리자 로그아웃</span>
        </button>
      </div>
    </aside>
"@

$content = $content.Substring(0, $sidebarStartIdx) + $newSidebarHtml + $content.Substring($sidebarEndIdx)
Write-Host "[SUCCESS] Sidebar HTML replaced."

Write-Host "3. Updating Top Action Bar with Antigravity Breadcrumbs & Live Status..."

$oldTopBar = @"
      <div class="top-action-bar">
        <div class="top-badge-row">
          <span class="top-admin-badge">🌿 시스템 관리자 로그인 중</span>
          <span style="font-size: 0.86rem; color: var(--text-muted);" id="currentDateDisplay"></span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <button type="button" onclick="switchTab('tabSettings')" class="btn-save-setting" style="background: #059669; color: #ffffff; border: none; font-size: 0.88rem; padding: 8px 16px; font-weight: 800; display: inline-flex; align-items: center; gap: 6px; cursor: pointer; box-shadow: 0 2px 8px rgba(5,150,105,0.25);">
            <span>⚙️ 환경설정 (블로그 연동/SEO)</span>
          </button>
          <a href="index.html" class="btn-save-setting" style="text-decoration: none; font-size: 0.88rem; padding: 8px 16px; background: #ffffff; color: var(--text-main); border: 1.5px solid var(--border-color);">
            <span>새 창에서 메인 보기 ➔</span>
          </a>
        </div>
      </div>
"@

$newTopBar = @"
      <div class="top-action-bar">
        <div class="top-breadcrumb-wrap" style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <span style="font-size: 0.80rem; font-weight: 800; color: #64748b; display: inline-flex; align-items: center; gap: 4px;">
            <span>⚡</span> ANTIGRAVITY CONSOLE
          </span>
          <span style="color: #cbd5e1; font-size: 0.8rem;">/</span>
          <span id="headerCurrentTabBadge" style="font-size: 0.88rem; font-weight: 850; color: #0f172a; display: inline-flex; align-items: center; gap: 6px;">
            <span>📊</span> 01. 종합 관제 홈
          </span>
          <span id="headerLiveStatusPill" style="display: inline-flex; align-items: center; gap: 5px; font-size: 0.72rem; font-weight: 850; color: #059669; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 2px 8px; border-radius: 999px;">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: #10b981; display: inline-block;"></span>
            실시간 관제 중
          </span>
        </div>
        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
          <span style="font-size: 0.82rem; color: #64748b; font-weight: 600;" id="currentDateDisplay"></span>
          <button type="button" onclick="switchTab('tabSettings')" class="btn-save-setting" style="background: #1e293b; color: #ffffff; border: 1px solid #334155; font-size: 0.84rem; padding: 7px 14px; font-weight: 750; display: inline-flex; align-items: center; gap: 6px; cursor: pointer; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <span>⚙️ 환경설정</span>
          </button>
          <a href="index.html" class="btn-save-setting" style="text-decoration: none; font-size: 0.84rem; padding: 7px 14px; background: #ffffff; color: #334155; border: 1px solid #cbd5e1; border-radius: 8px; font-weight: 750; display: inline-flex; align-items: center; gap: 4px;">
            <span>메인 사이트 ➔</span>
          </a>
        </div>
      </div>
"@

if ($content.Contains($oldTopBar)) {
    $content = $content.Replace($oldTopBar, $newTopBar)
    Write-Host "[SUCCESS] Top action bar updated."
} else {
    Write-Error "[FAIL] Could not match oldTopBar."
    exit 1
}

Write-Host "4. Slimming down tabBusinessMaster top header..."

$targetBizSectionStart = '<section class="tab-panel" id="tabBusinessMaster">'
$targetBizSectionIdx = $content.IndexOf($targetBizSectionStart)

if ($targetBizSectionIdx -ge 0) {
    # Find the top card that contains bizProgramSelector and the cards
    $endOfCardsMarker = '<!-- 2. 상단 비즈니스 메타 헤더 & 4대 파이프라인 KPI 카드 -->'
    $endOfCardsIdx = $content.IndexOf($endOfCardsMarker, $targetBizSectionIdx)
    
    if ($endOfCardsIdx -gt $targetBizSectionIdx) {
        $oldBizHubHtml = $content.Substring($targetBizSectionIdx + $targetBizSectionStart.Length, $endOfCardsIdx - ($targetBizSectionIdx + $targetBizSectionStart.Length))
        
        $newBizHubHtml = @"

        <!-- 🌟 03. 4대 오프라인 라이프케어 비즈니스 관제 슬림 헤더 (안티그래비티 테크 콘솔) -->
        <div class="panel-card" style="margin-bottom: 16px; border-top: 3.5px solid #b83354; padding: 18px 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span class="panel-icon" style="font-size: 1.8rem; line-height: 1;">🌟</span>
              <div>
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                  <h2 class="panel-title" style="margin: 0; font-size: 1.25rem; color: #b83354;">03. 4대 오프라인 라이프케어 비즈니스 관제</h2>
                  <span class="badge" style="background: #fff0f3; color: #b83354; border: 1px solid #fecdd3; font-size: 0.72rem; font-weight: 850; padding: 2px 8px; border-radius: 999px;">좌측 메뉴에서 즉시 전환</span>
                </div>
                <p style="color: var(--text-muted); font-size: 0.84rem; margin: 3px 0 0;">
                  #01 뷰티케어(180분), #02 공간비움, #03 유품정리, #04 생전 엔딩파티 현장 방문 서비스 전용 관제
                </p>
              </div>
            </div>
            
            <!-- 상단 슬림 미니 스위처 (좌측 사이드바와 100% 실시간 양방향 연동) -->
            <div style="display: flex; align-items: center; gap: 4px; background: #f1f5f9; padding: 4px; border-radius: 10px; border: 1px solid #e2e8f0;">
              <button type="button" class="biz-slim-pill active" id="bizPill_beauty" onclick="switchBusinessMasterTab('beauty')">💄 뷰티 (180분)</button>
              <button type="button" class="biz-slim-pill" id="bizPill_wardrobe" onclick="switchBusinessMasterTab('wardrobe')">👗 공간비움</button>
              <button type="button" class="biz-slim-pill" id="bizPill_legacy" onclick="switchBusinessMasterTab('legacy')">📦 유품정리</button>
              <button type="button" class="biz-slim-pill" id="bizPill_party" onclick="switchBusinessMasterTab('party')">💌 엔딩파티</button>
            </div>
          </div>

          <!-- 하위 호환성을 완벽히 보장하기 위한 히든 앵커 및 엘리먼트 (기존 JS/스크립트 100% 호환) -->
          <div style="display: none;">
            <select id="bizProgramSelector" onchange="switchBusinessMasterTab(this.value)">
              <option value="beauty">뷰티</option>
              <option value="wardrobe">옷장</option>
              <option value="legacy">유품</option>
              <option value="party">파티</option>
            </select>
            <div id="bizCard_beauty" class="active"><span class="biz-card-status-text"></span></div>
            <div id="bizCard_wardrobe"><span class="biz-card-status-text"></span></div>
            <div id="bizCard_legacy"><span class="biz-card-status-text"></span></div>
            <div id="bizCard_party"><span class="biz-card-status-text"></span></div>
            <button id="bizTabBtn_beauty"></button>
            <button id="bizTabBtn_wardrobe"></button>
            <button id="bizTabBtn_legacy"></button>
            <button id="bizTabBtn_party"></button>
            <button id="bizTabBtn_memoir"></button>
          </div>
        </div>
        
"@
        $content = $content.Substring(0, $targetBizSectionIdx + $targetBizSectionStart.Length) + $newBizHubHtml + $content.Substring($endOfCardsIdx)
        Write-Host "[SUCCESS] tabBusinessMaster header slimmed down."
    } else {
        Write-Error "[FAIL] Could not find end of cards marker."
        exit 1
    }
} else {
    Write-Error "[FAIL] Could not find tabBusinessMaster section."
    exit 1
}

Write-Host "5. Updating JavaScript for Sidebar Subnav & Smooth Auto-Scrolling..."

$targetJs = @"
    // 🌟 03. 4대 비즈니스 카테고리 전환 함수
        function switchBusinessMasterTab(bizCategory) {
      if (bizCategory === 'memoir') {
        switchTab('tabMemoirDashboard');
        return;
      }
      currentBusinessTab = bizCategory || 'beauty';

      // 1. 드롭다운 동기화
      var sel = document.getElementById('bizProgramSelector');
      if (sel) sel.value = currentBusinessTab;

      // 2. 비즈니스 대시보드 허브 카드 활성화 상태 업데이트
      var cards = ['beauty', 'wardrobe', 'legacy', 'party'];
      cards.forEach(function(c) {
        var card = document.getElementById('bizCard_' + c);
        if (card) {
          if (c === currentBusinessTab) {
            card.classList.add('active');
            var theme = (c === 'beauty' ? '#b83354' : (c === 'wardrobe' ? '#2b7a4b' : (c === 'legacy' ? '#9a6528' : '#7a3594')));
            var bg = (c === 'beauty' ? '#fff0f3' : (c === 'wardrobe' ? '#edf7f1' : (c === 'legacy' ? '#fdf6ed' : '#f9f0fd')));
            card.style.border = '2.2px solid ' + theme;
            card.style.background = bg;
            var titleEl = card.querySelector('div[style*="font-size: 1.05rem"]');
            if (titleEl) titleEl.style.color = theme;
            var badgeText = card.querySelector('.biz-card-status-text');
            if (badgeText) {
              badgeText.innerText = '현재 관제 중 ✓';
              badgeText.style.color = theme;
            }
          } else {
            card.classList.remove('active');
            card.style.border = '1.5px solid var(--border-color)';
            card.style.background = 'var(--bg-card)';
            var titleEl = card.querySelector('div[style*="font-size: 1.05rem"]');
            if (titleEl) titleEl.style.color = 'var(--text-main)';
            var badgeText = card.querySelector('.biz-card-status-text');
            if (badgeText) {
              badgeText.innerText = '전환하기 ➔';
              badgeText.style.color = 'var(--text-muted)';
            }
          }
        }
        var btn = document.getElementById('bizTabBtn_' + c);
        if (btn) btn.classList.toggle('active', c === currentBusinessTab);
      });

      // 3. 뷰티 전용 파이프라인 vs 일반 비즈니스 공용 파이프라인 전환
      var beautyWrap = document.getElementById('beautyPipelineWrap');
      var generalWrap = document.getElementById('generalBusinessWrap');
      if (currentBusinessTab === 'beauty') {
        if (beautyWrap) beautyWrap.style.display = 'block';
        if (generalWrap) generalWrap.style.display = 'none';
      } else {
        if (beautyWrap) beautyWrap.style.display = 'none';
        if (generalWrap) generalWrap.style.display = 'block';
      }

      // 4. 대시보드 렌더링 호출
      if (typeof renderBusinessMasterDashboard === 'function') {
        renderBusinessMasterDashboard();
      }
    }
"@

$replacementJs = @"
    // 🌟 좌측 사이드바에서 4대 비즈니스 원클릭 선택 (화면을 올릴 필요 없이 즉시 전환)
    function selectBusinessFromSidebar(bizCategory) {
      switchTab('tabBusinessMaster');
      switchBusinessMasterTab(bizCategory);
      var mainEl = document.querySelector('.admin-main');
      if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 📖 좌측 사이드바에서 자서전 출판 서브탭 원클릭 선택
    function selectMemoirFromSidebar(subTab) {
      switchTab('tabMemoirDashboard');
      if (typeof switchMemoirSubTab === 'function') {
        switchMemoirSubTab(subTab);
      }
      var mainEl = document.querySelector('.admin-main');
      if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 🌟 03. 4대 비즈니스 카테고리 전환 함수
    function switchBusinessMasterTab(bizCategory) {
      if (bizCategory === 'memoir') {
        switchTab('tabMemoirDashboard');
        return;
      }
      currentBusinessTab = bizCategory || 'beauty';

      // 1. 드롭다운 동기화
      var sel = document.getElementById('bizProgramSelector');
      if (sel) sel.value = currentBusinessTab;

      // 2. 비즈니스 대시보드 허브 카드 & 좌측 사이드바 서브메뉴 & 슬림 필 동기화
      var cards = ['beauty', 'wardrobe', 'legacy', 'party'];
      cards.forEach(function(c) {
        var card = document.getElementById('bizCard_' + c);
        if (card) {
          if (c === currentBusinessTab) {
            card.classList.add('active');
            var theme = (c === 'beauty' ? '#b83354' : (c === 'wardrobe' ? '#2b7a4b' : (c === 'legacy' ? '#9a6528' : '#7a3594')));
            var bg = (c === 'beauty' ? '#fff0f3' : (c === 'wardrobe' ? '#edf7f1' : (c === 'legacy' ? '#fdf6ed' : '#f9f0fd')));
            card.style.border = '2.2px solid ' + theme;
            card.style.background = bg;
            var badgeText = card.querySelector('.biz-card-status-text');
            if (badgeText) {
              badgeText.innerText = '현재 관제 중 ✓';
              badgeText.style.color = theme;
            }
          } else {
            card.classList.remove('active');
            card.style.border = '1.5px solid var(--border-color)';
            card.style.background = 'var(--bg-card)';
            var badgeText = card.querySelector('.biz-card-status-text');
            if (badgeText) {
              badgeText.innerText = '전환하기 ➔';
              badgeText.style.color = 'var(--text-muted)';
            }
          }
        }
        var btn = document.getElementById('bizTabBtn_' + c);
        if (btn) btn.classList.toggle('active', c === currentBusinessTab);

        // 좌측 사이드바 직속 서브메뉴 활성화 동기화
        var subEl = document.getElementById('sideSub_' + c);
        if (subEl) subEl.classList.toggle('active', c === currentBusinessTab);

        // 상단 슬림 미니 스위처 버튼 동기화
        var pill = document.getElementById('bizPill_' + c);
        if (pill) pill.classList.toggle('active', c === currentBusinessTab);
      });

      // 3. 뷰티 전용 파이프라인 vs 일반 비즈니스 공용 파이프라인 전환
      var beautyWrap = document.getElementById('beautyPipelineWrap');
      var generalWrap = document.getElementById('generalBusinessWrap');
      if (currentBusinessTab === 'beauty') {
        if (beautyWrap) beautyWrap.style.display = 'block';
        if (generalWrap) generalWrap.style.display = 'none';
      } else {
        if (beautyWrap) beautyWrap.style.display = 'none';
        if (generalWrap) generalWrap.style.display = 'block';
      }

      // 4. 상단 브레드크럼 세부 업데이트
      var breadcrumbTabBadge = document.getElementById('headerCurrentTabBadge');
      if (breadcrumbTabBadge) {
        var bizNames = {
          beauty: '<span>💄</span> 03. 4대 비즈니스 > #01 뷰티케어 (180분)',
          wardrobe: '<span>👗</span> 03. 4대 비즈니스 > #02 공간비움',
          legacy: '<span>📦</span> 03. 4대 비즈니스 > #03 유품정리',
          party: '<span>💌</span> 03. 4대 비즈니스 > #04 엔딩파티'
        };
        if (bizNames[currentBusinessTab]) {
          breadcrumbTabBadge.innerHTML = bizNames[currentBusinessTab];
        }
      }

      // 5. 대시보드 렌더링 호출
      if (typeof renderBusinessMasterDashboard === 'function') {
        renderBusinessMasterDashboard();
      }
    }
"@

if ($content.Contains($targetJs)) {
    $content = $content.Replace($targetJs, $replacementJs)
    Write-Host "[SUCCESS] JavaScript functions updated."
} else {
    Write-Error "[FAIL] Could not match targetJs."
    exit 1
}

# Also update switchTab function to update headerCurrentTabBadge
$targetSwitchTab = "if (btn) btn.classList.add('active');"
$replacementSwitchTab = @"
if (btn) btn.classList.add('active');
      var tabBreadcrumbMap = {
        tabCockpit: '<span>📊</span> 01. 종합 관제 홈',
        tabConsult: '<span>📋</span> 02. 고객 접수 & 상담',
        tabBusinessMaster: '<span>🌟</span> 03. 4대 비즈니스 관제',
        tabMemoirDashboard: '<span>📖</span> 04. 자서전 출판 관제',
        tabCoachControl: '<span>🤝</span> 05. 코치 관제 & 정산',
        tabAcademy: '<span>🤝</span> 05. 코치 관제 & 정산',
        tabMagazine: '<span>📚</span> 06. 여백서재 & 아카이브',
        tabSettings: '<span>⚙️</span> 07. 환경설정 & 채널연동'
      };
      var headerTabBadge = document.getElementById('headerCurrentTabBadge');
      if (headerTabBadge && tabBreadcrumbMap[tabId]) {
        headerTabBadge.innerHTML = tabBreadcrumbMap[tabId];
      }
"@

if ($content.Contains($targetSwitchTab)) {
    $content = $content.Replace($targetSwitchTab, $replacementSwitchTab)
    Write-Host "[SUCCESS] switchTab breadcrumb hook updated."
}

[System.IO.File]::WriteAllText($adminPath, $content, [System.Text.Encoding]::UTF8)
Write-Host "All transformations applied to admin.html successfully!"
