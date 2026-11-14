# PowerShell Script to Restructure Admin Home Categories and Layout
$ErrorActionPreference = "Stop"

$filePath = "admin.html"
$encoding = [System.Text.Encoding]::UTF8
$lines = [System.IO.File]::ReadAllLines($filePath, $encoding)

Write-Host "Read admin.html: $($lines.Length) lines."

# 1. Locate Sidebar Nav (lines 2007 to 2061)
$startSidebar = -1
$endSidebar = -1
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match '<nav class="sidebar-nav">') { $startSidebar = $i }
    if ($startSidebar -ge 0 -and $lines[$i] -match '</nav>') { $endSidebar = $i; break }
}

if ($startSidebar -lt 0 -or $endSidebar -lt 0) {
    throw "Could not locate sidebar nav boundaries."
}
Write-Host "Sidebar nav: lines $($startSidebar + 1) to $($endSidebar + 1)"

# 2. Locate Top Workflow Bar (lines 2092 to 2123)
$startTopBar = -1
$endTopBar = -1
for ($i = 2070; $i -lt 2150; $i++) {
    if ($lines[$i] -match '원스톱.*?파이프라인 퀵 관제 바') { $startTopBar = $i }
    if ($startTopBar -ge 0 -and $lines[$i] -match '<!-- ================= 탭 7:') { $endTopBar = $i - 1; break }
}

if ($startTopBar -lt 0 -or $endTopBar -lt 0) {
    throw "Could not locate top workflow bar boundaries."
}
Write-Host "Top workflow bar: lines $($startTopBar + 1) to $($endTopBar + 1)"

# 3. Locate Diag Table inside tabBusinessMaster (around lines 2825 to 2862)
$startDiag = -1
$endDiag = -1
for ($i = 2800; $i -lt 2870; $i++) {
    if ($lines[$i] -match '맞춤 리셋 진단 1:1 방문 상담 예약자 현황') {
        # Go backwards to find the opening <div class="panel-card"
        for ($k = $i; $k -ge 2810; $k--) {
            if ($lines[$k] -match '<div class="panel-card"') {
                $startDiag = $k - 1 # include the comment above
                break
            }
        }
    }
    if ($startDiag -ge 0 -and $lines[$i] -match '</section>') { $endDiag = $i - 1; break }
}

if ($startDiag -lt 0 -or $endDiag -lt 0) {
    throw "Could not locate diag table boundaries."
}
Write-Host "Diag table in tabBusinessMaster: lines $($startDiag + 1) to $($endDiag + 1)"

# New Sidebar Content
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

        <!-- 🌟 03. 5대 비즈니스 운영 스튜디오 (Business Studio) -->
        <button class="nav-tab-btn" onclick="switchTab('tabBusinessMaster', this)" id="navBtnBusinessMaster" style="color: #b83354; font-weight: 850;">
          <span class="nav-tab-icon">🌟</span>
          <span>03. 5대 비즈니스 관제</span>
          <span id="businessMasterBadge" style="background:#b83354; color:#fff; font-size:0.7rem; font-weight:900; padding:2px 6px; border-radius:999px; margin-left:auto;">1호~5호</span>
        </button>

        <!-- 🤝 04. 코칭스태프 & 정산 센터 (Coach Ops & Settlement) -->
        <button class="nav-tab-btn" onclick="switchTab('tabCoachControl', this)" id="navBtnCoachControl" style="font-weight: 850;">
          <span class="nav-tab-icon">🤝</span>
          <span>04. 코치 관제 &amp; 정산</span>
          <span id="sidebarPendingBadge" style="background:#d97706; color:#fff; font-size:0.7rem; font-weight:900; padding:2px 6px; border-radius:999px; margin-left:auto;">파견·정산</span>
        </button>

        <div style="height: 1px; background: var(--border-color); margin: 10px 12px 6px;"></div>
        <div style="font-size: 0.72rem; font-weight: 850; color: var(--text-muted); padding: 4px 14px 4px; letter-spacing: 0.05em;">
          CONTENT &amp; SYSTEM
        </div>

        <!-- 📚 05. 여백서재 & 아카이브 (Content & Archive) -->
        <button class="nav-tab-btn" onclick="switchTab('tabMagazine', this)" id="navBtnMagazine">
          <span class="nav-tab-icon">📚</span>
          <span>05. 여백서재 &amp; 아카이브</span>
        </button>

        <!-- ⚙️ 06. 환경설정 & 채널연동 (Settings & Marketing) -->
        <button class="nav-tab-btn" onclick="switchTab('tabSettings', this)" id="navBtnSettings">
          <span class="nav-tab-icon">⚙️</span>
          <span>06. 환경설정 &amp; 채널연동</span>
        </button>

        <!-- Hidden anchor buttons for 100% backward compatibility with external scripts/tests -->
        <button id="navBtnMemoirDashboard" onclick="switchTab('tabMemoirDashboard', this)" style="display:none;"></button>
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
            <span>📋 1단계: 고객접수·상담</span>
          </button>
          <span style="color: #cbd5e1; font-weight: 900;">➔</span>
          <button type="button" onclick="switchTab('tabBusinessMaster')" class="btn-save-setting" style="background: #fff0f3; color: #b83354; border: 1.5px solid #f8c8d2; font-size: 0.82rem; font-weight: 850; padding: 6px 11px; cursor: pointer;">
            <span>🌟 2단계: 5대 비즈니스 확정</span>
          </button>
          <span style="color: #cbd5e1; font-weight: 900;">➔</span>
          <button type="button" onclick="switchTab('tabAcademy')" class="btn-save-setting" style="background: #fffbeb; color: #b45309; border: 1.5px solid #fde68a; font-size: 0.82rem; font-weight: 850; padding: 6px 11px; cursor: pointer;">
            <span>🤝 3단계: 코치 배정&amp;카톡</span>
          </button>
          <span style="color: #cbd5e1; font-weight: 900;">➔</span>
          <a href="coach.html" target="_blank" class="btn-save-setting" style="background: linear-gradient(135deg, #1e3d2f 0%, #2d5a45 100%); color: #ffffff; text-decoration: none; font-size: 0.82rem; font-weight: 850; padding: 6px 11px; box-shadow: 0 2px 6px rgba(30,61,47,0.25); display: inline-flex; align-items: center; gap: 4px;">
            <span>📱 4단계: 코치 현장앱 ➔</span>
          </a>
          <span style="color: #cbd5e1; font-weight: 900;">➔</span>
          <button type="button" onclick="switchTab('tabCoachControl')" class="btn-save-setting" style="background: #ecfdf5; color: #047857; border: 1.5px solid #a7f3d0; font-size: 0.82rem; font-weight: 850; padding: 6px 11px; cursor: pointer;">
            <span>📸 5단계: 현장검수&amp;송금정산</span>
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

# New Sections: tabCockpit and tabConsult
$newCockpitAndConsult = @'
      <!-- ================= 01. 📊 종합 관제 홈 (Today Cockpit) ================= -->
      <section class="tab-panel active" id="tabCockpit">
        <!-- 상단 환영 & 운영 모토 배너 -->
        <div class="panel-card" style="background: linear-gradient(135deg, #1e3d2f 0%, #2b5a42 100%); color: #ffffff; padding: 22px 26px; border-radius: 18px; margin-bottom: 22px; box-shadow: 0 6px 20px rgba(30,61,47,0.25);">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
            <div>
              <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; background: rgba(255,255,255,0.15); font-size: 0.78rem; font-weight: 800; letter-spacing: 0.05em; margin-bottom: 8px;">
                <span>🌿</span> YEBAEK &amp; GEOL HEADQUARTERS
              </div>
              <h2 style="font-size: 1.45rem; font-weight: 900; margin: 0; color: #ffffff;">여백과 결 종합 비즈니스 관제 센터</h2>
              <p style="margin: 6px 0 0; color: rgba(255,255,255,0.85); font-size: 0.9rem;">
                고객 상담 접수부터 5대 비즈니스 수행, 공인 코치 파견 및 현장 검수·정산까지 한눈에 관제합니다.
              </p>
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button type="button" onclick="refreshCockpitStats()" class="btn-save-setting" style="background: rgba(255,255,255,0.2); color: #ffffff; border: 1px solid rgba(255,255,255,0.35); font-weight: 800; padding: 8px 14px; cursor: pointer;">
                <span>🔄</span> 관제 새로고침
              </button>
              <button type="button" onclick="openDispatchModal()" class="btn-save-setting" style="background: #c59b27; color: #ffffff; border: none; font-weight: 850; padding: 8px 16px; cursor: pointer; box-shadow: 0 4px 12px rgba(197,155,39,0.35);">
                <span>➕</span> 코치 즉시 배정
              </button>
            </div>
          </div>
        </div>

        <!-- 🚨 오늘의 긴급 조치 파이프라인 (Action Items) -->
        <div style="margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="font-size: 1.05rem; font-weight: 850; color: var(--text-main); margin: 0; display: flex; align-items: center; gap: 8px;">
              <span>🚨</span> 오늘의 우선 처리 업무 (Action Items)
            </h3>
            <span style="font-size: 0.82rem; color: var(--text-muted);">미처리 항목을 클릭하면 해당 업무 탭으로 즉시 이동합니다</span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 14px;">
            <!-- 1. 신규 상담/예약 접수 대기 -->
            <div onclick="switchTab('tabConsult')" style="background: var(--bg-card); border: 1.5px solid var(--border-color); border-left: 4px solid #0284c7; border-radius: 14px; padding: 18px; cursor: pointer; transition: transform 0.15s ease, box-shadow 0.15s ease;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='var(--shadow-md)';" onmouseout="this.style.transform='none'; this.style.boxShadow='none';">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.82rem; font-weight: 800; color: #0284c7;">01. 고객 접수 &amp; 상담</span>
                <span style="font-size: 1.3rem;">📋</span>
              </div>
              <div style="font-size: 1.8rem; font-weight: 900; color: var(--text-main); margin: 8px 0 4px;" id="cockpitInquiryCount">0건</div>
              <div style="font-size: 0.78rem; color: var(--text-muted); display: flex; align-items: center; justify-content: space-between;">
                <span>맞춤 진단 &amp; 1:1 방문 상담</span>
                <span style="font-weight: 800; color: #0284c7;">상담 확인 ➔</span>
              </div>
            </div>

            <!-- 2. 코치 배정 대기 -->
            <div onclick="switchTab('tabAcademy')" style="background: var(--bg-card); border: 1.5px solid var(--border-color); border-left: 4px solid #d97706; border-radius: 14px; padding: 18px; cursor: pointer; transition: transform 0.15s ease, box-shadow 0.15s ease;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='var(--shadow-md)';" onmouseout="this.style.transform='none'; this.style.boxShadow='none';">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.82rem; font-weight: 800; color: #d97706;">02. 코치 배정 대기</span>
                <span style="font-size: 1.3rem;">⏳</span>
              </div>
              <div style="font-size: 1.8rem; font-weight: 900; color: #d97706; margin: 8px 0 4px;" id="cockpitPendingDispatch">0건</div>
              <div style="font-size: 0.78rem; color: var(--text-muted); display: flex; align-items: center; justify-content: space-between;">
                <span>미배정 서비스 일정 매칭</span>
                <span style="font-weight: 800; color: #d97706;">즉시 배정 ➔</span>
              </div>
            </div>

            <!-- 3. 현장사진 검수 및 정산 대기 -->
            <div onclick="switchTab('tabCoachControl')" style="background: var(--bg-card); border: 1.5px solid var(--border-color); border-left: 4px solid #b83354; border-radius: 14px; padding: 18px; cursor: pointer; transition: transform 0.15s ease, box-shadow 0.15s ease;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='var(--shadow-md)';" onmouseout="this.style.transform='none'; this.style.boxShadow='none';">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.82rem; font-weight: 800; color: #b83354;">03. 현장 검수 &amp; 송금 대기</span>
                <span style="font-size: 1.3rem;">📸</span>
              </div>
              <div style="font-size: 1.8rem; font-weight: 900; color: #b83354; margin: 8px 0 4px;" id="cockpitPendingSettlement">0건</div>
              <div style="font-size: 0.78rem; color: var(--text-muted); display: flex; align-items: center; justify-content: space-between;">
                <span>사진 3종 승인 및 활동비 지급</span>
                <span style="font-weight: 800; color: #b83354;">검수·정산 ➔</span>
              </div>
            </div>

            <!-- 4. 자서전 출판 프로젝트 진행 -->
            <div onclick="switchTab('tabMemoirDashboard')" style="background: var(--bg-card); border: 1.5px solid var(--border-color); border-left: 4px solid #c29b38; border-radius: 14px; padding: 18px; cursor: pointer; transition: transform 0.15s ease, box-shadow 0.15s ease;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='var(--shadow-md)';" onmouseout="this.style.transform='none'; this.style.boxShadow='none';">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.82rem; font-weight: 800; color: #936f1c;">04. 자서전 출판 프로젝트</span>
                <span style="font-size: 1.3rem;">📖</span>
              </div>
              <div style="font-size: 1.8rem; font-weight: 900; color: #936f1c; margin: 8px 0 4px;" id="cockpitActiveMemoirCount">0건</div>
              <div style="font-size: 0.78rem; color: var(--text-muted); display: flex; align-items: center; justify-content: space-between;">
                <span>구술 채록 · AI 5단계 윤문</span>
                <span style="font-weight: 800; color: #936f1c;">출판 스튜디오 ➔</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 🌟 5대 핵심 비즈니스 실시간 현황 보드 -->
        <div class="panel-card" style="margin-bottom: 24px;">
          <div class="panel-header">
            <div class="panel-title-wrap">
              <span class="panel-icon">🌟</span>
              <div>
                <h3 class="panel-title">5대 핵심 비즈니스 실시간 운영 현황</h3>
                <p style="color: var(--text-muted); font-size: 0.86rem; margin: 4px 0 0;">
                  여백과 결의 5개 시그니처 서비스별 진행 건수와 상태를 한눈에 파악합니다.
                </p>
              </div>
            </div>
            <button type="button" class="btn-save-setting" onclick="switchTab('tabBusinessMaster')" style="background: #ffffff; color: var(--text-main); border: 1.5px solid var(--border-color); font-weight: 800;">
              <span>5대 비즈니스 전체 관제 ➔</span>
            </button>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-top: 14px;">
            <!-- 1호 뷰티케어 -->
            <div onclick="switchTab('tabBusinessMaster'); switchBusinessMasterTab('beauty');" style="background: #fff8f9; border: 1.5px solid #f8c8d2; border-radius: 14px; padding: 16px; cursor: pointer; transition: transform 0.15s ease;" onmouseover="this.style.transform='translateY(-2px)';" onmouseout="this.style.transform='none';">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 1.4rem;">💄</span>
                <span class="badge" style="background: #b83354; color: #fff; font-size: 0.7rem; padding: 2px 6px; border-radius: 999px;">180분</span>
              </div>
              <div style="font-size: 0.95rem; font-weight: 850; color: #b83354; margin-top: 8px;">#01 뷰티 라이프케어</div>
              <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">수분·탄력·메이크업 SOP</div>
              <div style="margin-top: 10px; font-size: 1.05rem; font-weight: 900; color: var(--text-main);" id="cockpitBizCount_beauty">진행 관제 ➔</div>
            </div>

            <!-- 2호 옷장 공간 비움 -->
            <div onclick="switchTab('tabBusinessMaster'); switchBusinessMasterTab('wardrobe');" style="background: #f8fafc; border: 1.5px solid var(--border-color); border-radius: 14px; padding: 16px; cursor: pointer; transition: transform 0.15s ease;" onmouseover="this.style.transform='translateY(-2px)';" onmouseout="this.style.transform='none';">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 1.4rem;">👗</span>
                <span class="badge" style="background: #475569; color: #fff; font-size: 0.7rem; padding: 2px 6px; border-radius: 999px;">방문비움</span>
              </div>
              <div style="font-size: 0.95rem; font-weight: 850; color: var(--text-main); margin-top: 8px;">#02 옷장 &amp; 공간 비움</div>
              <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">미니멀 정돈·기부 분류</div>
              <div style="margin-top: 10px; font-size: 1.05rem; font-weight: 900; color: var(--text-main);" id="cockpitBizCount_wardrobe">진행 관제 ➔</div>
            </div>

            <!-- 3호 유품 짐 아카이빙 -->
            <div onclick="switchTab('tabBusinessMaster'); switchBusinessMasterTab('legacy');" style="background: #f8fafc; border: 1.5px solid var(--border-color); border-radius: 14px; padding: 16px; cursor: pointer; transition: transform 0.15s ease;" onmouseover="this.style.transform='translateY(-2px)';" onmouseout="this.style.transform='none';">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 1.4rem;">📦</span>
                <span class="badge" style="background: #475569; color: #fff; font-size: 0.7rem; padding: 2px 6px; border-radius: 999px;">아카이빙</span>
              </div>
              <div style="font-size: 0.95rem; font-weight: 850; color: var(--text-main); margin-top: 8px;">#03 유품 &amp; 짐 아카이빙</div>
              <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">디지털 유품·추억 보존</div>
              <div style="margin-top: 10px; font-size: 1.05rem; font-weight: 900; color: var(--text-main);" id="cockpitBizCount_legacy">진행 관제 ➔</div>
            </div>

            <!-- 4호 생전 엔딩 파티 -->
            <div onclick="switchTab('tabBusinessMaster'); switchBusinessMasterTab('party');" style="background: #f8fafc; border: 1.5px solid var(--border-color); border-radius: 14px; padding: 16px; cursor: pointer; transition: transform 0.15s ease;" onmouseover="this.style.transform='translateY(-2px)';" onmouseout="this.style.transform='none';">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 1.4rem;">💌</span>
                <span class="badge" style="background: #475569; color: #fff; font-size: 0.7rem; padding: 2px 6px; border-radius: 999px;">축제형</span>
              </div>
              <div style="font-size: 0.95rem; font-weight: 850; color: var(--text-main); margin-top: 8px;">#04 생전 엔딩 파티</div>
              <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">감사 인사·생전 장례</div>
              <div style="margin-top: 10px; font-size: 1.05rem; font-weight: 900; color: var(--text-main);" id="cockpitBizCount_party">진행 관제 ➔</div>
            </div>

            <!-- 5호 디지털 자서전 출판 -->
            <div onclick="switchTab('tabMemoirDashboard')" style="background: #fdfbf7; border: 1.5px solid #e7d8b5; border-radius: 14px; padding: 16px; cursor: pointer; transition: transform 0.15s ease;" onmouseover="this.style.transform='translateY(-2px)';" onmouseout="this.style.transform='none';">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 1.4rem;">📖</span>
                <span class="badge" style="background: #c29b38; color: #fff; font-size: 0.7rem; padding: 2px 6px; border-radius: 999px;">AI양장본</span>
              </div>
              <div style="font-size: 0.95rem; font-weight: 850; color: #936f1c; margin-top: 8px;">#05 디지털 자서전 출판</div>
              <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">채록·AI윤문·조판완료</div>
              <div style="margin-top: 10px; font-size: 1.05rem; font-weight: 900; color: #936f1c;" id="cockpitBizCount_memoir">전용관제 ➔</div>
            </div>
          </div>
        </div>

        <!-- 🏃 최근 현장 파견 및 활동 피드 미리보기 -->
        <div class="panel-card">
          <div class="panel-header" style="flex-wrap: wrap; gap: 10px;">
            <div class="panel-title-wrap">
              <span class="panel-icon">🏃</span>
              <div>
                <h3 class="panel-title">실시간 코치 현장수행 &amp; 파견 현황</h3>
                <p style="color: var(--text-muted); font-size: 0.86rem; margin: 4px 0 0;">
                  가장 최근에 배정되거나 현장에서 수행 중인 코치 일정 요약입니다.
                </p>
              </div>
            </div>
            <div style="display: flex; gap: 8px;">
              <button type="button" class="btn-save-setting" onclick="switchTab('tabCoachControl')" style="background: #ecfdf5; color: #047857; border: 1.5px solid #a7f3d0; font-weight: 850;">
                <span>📸</span> 현장관제&amp;정산센터 전체보기 ➔
              </button>
            </div>
          </div>

          <div class="admin-table-wrap" style="margin-top: 12px;">
            <table class="admin-table">
              <thead>
                <tr>
                  <th style="width: 100px;">고객 성함</th>
                  <th style="width: 140px;">신청 서비스</th>
                  <th style="width: 140px;">담당 배정 코치</th>
                  <th style="width: 100px; text-align: center;">진행 상태</th>
                  <th style="width: 130px; text-align: center;">도착/완료</th>
                  <th>현장 소감 / 관리 메모</th>
                  <th style="width: 90px; text-align: center;">바로가기</th>
                </tr>
              </thead>
              <tbody id="cockpitRecentDispatchTableBody">
                <!-- JS 동적 렌더링 -->
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- ================= 02. 📋 고객 접수 & 상담 파이프라인 ================= -->
      <section class="tab-panel" id="tabConsult">
        <div class="panel-card">
          <div class="panel-header" style="flex-wrap: wrap; gap: 10px;">
            <div class="panel-title-wrap">
              <span class="panel-icon">📋</span>
              <div>
                <h2 class="panel-title">02. 고객 접수 &amp; 맞춤 상담 파이프라인</h2>
                <p style="color: var(--text-muted); font-size: 0.86rem; margin: 4px 0 0;">
                  [1분 맞춤 리셋 진단] 및 온라인을 통해 접수된 고객의 <strong>1:1 방문 맞춤 상담 및 사전 문의</strong>를 통합 관리합니다. 상담 완료 후 5대 비즈니스 서비스로 즉시 전환하거나 전담 코치를 배정할 수 있습니다.
                </p>
              </div>
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button class="btn-save-setting" onclick="openDispatchModal()" style="background: var(--accent); color: #ffffff;">
                <span>🤝</span> 상담 완료 건 코치 배정하기
              </button>
              <button class="btn-save-setting" onclick="exportDiagReservationsCSV()" style="background: #ffffff; color: var(--text-main); border: 1.5px solid var(--border-color);">
                <span>📥</span> 상담 내역(CSV) 다운로드
              </button>
            </div>
          </div>

          <!-- 상태 필터 바 -->
          <div style="display: flex; gap: 6px; flex-wrap: wrap; margin: 16px 0;">
            <button class="btn-action-sm active" id="filterConsult_all" onclick="filterConsultList('all', this)" style="padding: 6px 14px; font-weight: 800; border-radius: 20px;">전체 보기 (<span id="consultCountAll">0</span>)</button>
            <button class="btn-action-sm" id="filterConsult_pending" onclick="filterConsultList('대기', this)" style="padding: 6px 14px; font-weight: 800; border-radius: 20px; background:#fffbeb; color:#b45309; border:1.5px solid #fde68a;">⏳ 상담 대기</button>
            <button class="btn-action-sm" id="filterConsult_progress" onclick="filterConsultList('진행', this)" style="padding: 6px 14px; font-weight: 800; border-radius: 20px;">📞 상담 진행중</button>
            <button class="btn-action-sm" id="filterConsult_done" onclick="filterConsultList('완료', this)" style="padding: 6px 14px; font-weight: 800; border-radius: 20px;">✓ 상담 완료/확정</button>
          </div>

          <!-- 1:1 방문 상담 예약자 현황 테이블 -->
          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead>
                <tr>
                  <th style="width: 130px;">진단 주제 / 분야</th>
                  <th style="width: 90px;">구분</th>
                  <th style="width: 120px;">연락처</th>
                  <th>상담 요청 메모</th>
                  <th style="width: 110px;">접수 일시</th>
                  <th style="width: 100px; text-align: center;">처리 상태</th>
                  <th style="width: 120px; text-align: center;">관리 / 연계</th>
                </tr>
              </thead>
              <tbody id="diagReservationTableBody">
                <!-- JS 동적 렌더링 -->
              </tbody>
            </table>
          </div>
        </div>
      </section>
'@

# Replacement in tabBusinessMaster for the redundant Diag table
$newBusinessMasterConsultBanner = @'
        <!-- 맞춤 진단 고객 접수 안내 배너 -->
        <div class="panel-card" style="margin-top: 24px; background: #f0fdf4; border: 1.5px solid #bbf7d0;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 1.8rem;">📋</span>
              <div>
                <div style="font-weight: 850; font-size: 0.98rem; color: #166534;">신규 고객 접수 및 1:1 방문 맞춤 상담 관리</div>
                <div style="color: #15803d; font-size: 0.86rem; margin-top: 2px;">
                  [맞춤 리셋 진단]을 통해 접수된 고객 명단과 전화/방문 상담 예약은 <strong>[02. 고객 접수 &amp; 상담 파이프라인]</strong> 탭에서 체계적으로 관리됩니다.
                </div>
              </div>
            </div>
            <button type="button" class="btn-save-setting" onclick="switchTab('tabConsult')" style="background: #15803d; color: #ffffff; border: none; font-weight: 850;">
              <span>고객 접수 &amp; 상담 센터 바로가기 ➔</span>
            </button>
          </div>
        </div>
'@

# Sub-nav for tabCoachControl
$subnavCoachControl = @'
        <!-- 코칭스태프 관제 & 정산 서브 내비게이션 -->
        <div style="display: flex; gap: 8px; margin-bottom: 18px; border-bottom: 2px solid var(--border-color); padding-bottom: 12px; flex-wrap: wrap;">
          <button type="button" class="btn-save-setting" onclick="switchTab('tabCoachControl')" style="background: #059669; color: #ffffff; border: none; font-weight: 850;">
            <span>📸 1. 현장관제 &amp; 활동비 송금·정산</span>
          </button>
          <button type="button" class="btn-save-setting" onclick="switchTab('tabAcademy')" style="background: #ffffff; color: var(--text-main); border: 1.5px solid var(--border-color); font-weight: 800;">
            <span>🤝 2. 서비스별 코치 배정 &amp; 카톡 파견센터</span>
          </button>
          <button type="button" class="btn-save-setting" onclick="switchTab('tabAcademy'); setTimeout(function(){ var el = document.getElementById('coachTableBody'); if (el) el.scrollIntoView({behavior:'smooth'}); }, 100);" style="background: #ffffff; color: var(--text-main); border: 1.5px solid var(--border-color); font-weight: 800;">
            <span>🏅 3. 공인 코치 풀 &amp; 아카데미 지원자</span>
          </button>
        </div>
'@

# Sub-nav for tabAcademy
$subnavAcademy = @'
        <!-- 코칭스태프 관제 & 정산 서브 내비게이션 -->
        <div style="display: flex; gap: 8px; margin-bottom: 18px; border-bottom: 2px solid var(--border-color); padding-bottom: 12px; flex-wrap: wrap;">
          <button type="button" class="btn-save-setting" onclick="switchTab('tabCoachControl')" style="background: #ffffff; color: var(--text-main); border: 1.5px solid var(--border-color); font-weight: 800;">
            <span>📸 1. 현장관제 &amp; 활동비 송금·정산</span>
          </button>
          <button type="button" class="btn-save-setting" onclick="switchTab('tabAcademy')" style="background: #d97706; color: #ffffff; border: none; font-weight: 850;">
            <span>🤝 2. 서비스별 코치 배정 &amp; 카톡 파견센터</span>
          </button>
          <button type="button" class="btn-save-setting" onclick="var el = document.getElementById('coachTableBody'); if (el) el.scrollIntoView({behavior:'smooth'});" style="background: #ffffff; color: var(--text-main); border: 1.5px solid var(--border-color); font-weight: 800;">
            <span>🏅 3. 공인 코치 풀 &amp; 아카데미 지원자</span>
          </button>
        </div>
'@

# Sub-nav for tabMagazine, tabLounge, tabArchive
$subnavContent = @'
        <!-- 여백서재 & 아카이브 서브 내비게이션 -->
        <div style="display: flex; gap: 8px; margin-bottom: 18px; border-bottom: 2px solid var(--border-color); padding-bottom: 12px; flex-wrap: wrap;">
          <button type="button" class="btn-save-setting" onclick="switchTab('tabMagazine')" style="background: #2b5a42; color: #ffffff; border: none; font-weight: 850;">
            <span>📝 1. 여백의 서재 칼럼 관리</span>
          </button>
          <button type="button" class="btn-save-setting" onclick="switchTab('tabLounge')" style="background: #ffffff; color: var(--text-main); border: 1.5px solid var(--border-color); font-weight: 800;">
            <span>💬 2. 오늘의 비움 한 줄 라운지</span>
          </button>
          <button type="button" class="btn-save-setting" onclick="switchTab('tabArchive')" style="background: #ffffff; color: var(--text-main); border: 1.5px solid var(--border-color); font-weight: 800;">
            <span>🏛️ 3. 보물 서재 &amp; 완간 도서 관리</span>
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

    # 3. Insert tabCockpit and tabConsult right before tabSettings
    if ($lines[$i] -match '<!-- ================= 탭 7: ⚙️ 사이트 정보 및 배너 ================= -->') {
        $newLines.Add($newCockpitAndConsult)
        $newLines.Add($lines[$i])
        continue
    }

    # 4. In tabBusinessMaster, replace the redundant diag reservation table
    if ($i -eq $startDiag) {
        $newLines.Add($newBusinessMasterConsultBanner)
        $i = $endDiag
        continue
    }

    # 5. In tabAcademy, remove 'active' from class
    if ($lines[$i] -match '<section class="tab-panel active" id="tabAcademy">') {
        $newLines.Add('      <section class="tab-panel" id="tabAcademy">')
        $newLines.Add($subnavAcademy)
        continue
    }

    # 6. In tabCoachControl, add subnav
    if ($lines[$i] -match '<section class="tab-panel" id="tabCoachControl">') {
        $newLines.Add($lines[$i])
        $newLines.Add($subnavCoachControl)
        continue
    }

    # 7. In tabMagazine, add subnav
    if ($lines[$i] -match '<section class="tab-panel" id="tabMagazine">') {
        $newLines.Add($lines[$i])
        $newLines.Add($subnavContent)
        continue
    }

    # Normal line
    $newLines.Add($lines[$i])
}

Write-Host "Constructed intermediate HTML with $($newLines.Count) lines."

# Now update the JavaScript: switchTab, refreshCockpitStats, filterConsultList, loadAllData
$fullHtml = [string]::Join("`n", $newLines)

# Find and replace switchTab definition
$oldSwitchTabPattern = '(?s)function switchTab\(tabId, btn\) \{.*?/\* 紐⑤컮\?쇱씤 寃쎌슦 \?ъ씠\?쒕컮 \?リ린 \*/\s*var sidebar = document\.getElementById\(''adminSidebar''\);\s*if \(sidebar && window\.innerWidth <= 900\) \{\s*sidebar\.classList\.remove\(''open''\);\s*\}\s*\}'

$newJsFunctions = @'
    /* ================= 탭 전환 및 신규 비즈니스 라이프사이클 라우팅 ================= */
    function switchTab(tabId, btn) {
      if (tabId === 'tabMemoir') {
        tabId = 'tabMemoirDashboard';
      } else if (['tabBusinessMaster', 'tabBeautyCrm', 'tabTest'].indexOf(tabId) !== -1) {
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
        if (tabId === 'tabCockpit') btn = document.getElementById('navBtnCockpit');
        else if (tabId === 'tabConsult') btn = document.getElementById('navBtnConsult');
        else if (tabId === 'tabAcademy') btn = document.getElementById('navBtnCoachControl') || document.getElementById('navBtnAcademy');
        else if (tabId === 'tabCoachControl') btn = document.getElementById('navBtnCoachControl');
        else if (tabId === 'tabBusinessMaster') btn = document.getElementById('navBtnBusinessMaster');
        else if (tabId === 'tabMemoirDashboard') btn = document.getElementById('navBtnBusinessMaster') || document.getElementById('navBtnMemoirDashboard');
        else if (tabId === 'tabMagazine' || tabId === 'tabLounge' || tabId === 'tabArchive') btn = document.getElementById('navBtnMagazine');
        else if (tabId === 'tabSettings') btn = document.getElementById('navBtnSettings');
      }

      /* 04. 자서전 출판 관제센터 진입 시 실시간 렌더링 */
      if (tabId === 'tabMemoirDashboard' && typeof renderMemoirDashboard === 'function') {
        renderMemoirDashboard();
      }

      var panels = document.querySelectorAll('.tab-panel');
      for (var i = 0; i < panels.length; i++) {
        panels[i].classList.remove('active');
      }

      var target = document.getElementById(tabId);
      if (target) target.classList.add('active');

      var btns = document.querySelectorAll('.nav-tab-btn');
      for (var j = 0; j < btns.length; j++) {
        btns[j].classList.remove('active');
      }
      if (btn) btn.classList.add('active');

      /* 탭별 실시간 새로고침 훅 */
      if (tabId === 'tabCockpit') {
        if (typeof refreshCockpitStats === 'function') refreshCockpitStats();
      } else if (tabId === 'tabConsult') {
        if (typeof renderDiagReservationTable === 'function') renderDiagReservationTable();
      } else if (tabId === 'tabAcademy') {
        if (typeof renderDispatchesTable === 'function') renderDispatchesTable();
        if (typeof renderCoachesTable === 'function') renderCoachesTable();
        if (typeof updateAcademyStats === 'function') updateAcademyStats();
      } else if (tabId === 'tabBusinessMaster') {
        if (typeof renderBusinessMasterDashboard === 'function') renderBusinessMasterDashboard();
      } else if (tabId === 'tabCoachControl') {
        if (typeof renderCoachControlCenter === 'function') renderCoachControlCenter();
      }

      /* 모바일인 경우 사이드바 닫기 */
      var sidebar = document.getElementById('adminSidebar');
      if (sidebar && window.innerWidth <= 900) {
        sidebar.classList.remove('open');
      }
    }

    /* 📊 01. 종합 관제 홈 실시간 데이터 집계 및 렌더링 함수 */
    function refreshCockpitStats() {
      try {
        // 1. 고객 상담 접수 대기 건수
        var diagList = (typeof getDiagReservations === 'function') ? getDiagReservations() : [];
        var pendingDiag = diagList.filter(function(item) {
          return !item.status || item.status === '대기' || item.status === '진행';
        }).length;
        var inqCount = pendingDiag || diagList.length || 0;
        var inqElem = document.getElementById('cockpitInquiryCount');
        if (inqElem) inqElem.innerText = inqCount + '건';

        var consultBadge = document.getElementById('consultPendingBadge');
        if (consultBadge) consultBadge.innerText = inqCount > 0 ? (inqCount + '건') : '신규';

        var consultAllElem = document.getElementById('consultCountAll');
        if (consultAllElem) consultAllElem.innerText = diagList.length;

        // 2. 코치 배정 대기 및 현장 검수·송금 대기 건수
        var dispList = (typeof getDispatches === 'function') ? getDispatches() : [];
        var pendingDisp = dispList.filter(function(d) {
          return !d.coachName || d.status === '배정대기' || d.status === '대기';
        }).length;
        var pendingSettle = dispList.filter(function(d) {
          return d.status === '서비스완료' || d.isCompleted;
        }).length;

        var dispElem = document.getElementById('cockpitPendingDispatch');
        if (dispElem) dispElem.innerText = pendingDisp + '건';

        var settleElem = document.getElementById('cockpitPendingSettlement');
        if (settleElem) settleElem.innerText = pendingSettle + '건';

        // 3. 자서전 출판 프로젝트 수
        var memoirList = (typeof getMemoirProjects === 'function') ? getMemoirProjects() : [];
        var memoirElem = document.getElementById('cockpitActiveMemoirCount');
        if (memoirElem) memoirElem.innerText = (memoirList.length || 0) + '건';

        // 4. 최근 현장 파견/활동 요약 5건 렌더링
        var recentTbody = document.getElementById('cockpitRecentDispatchTableBody');
        if (recentTbody) {
          if (dispList.length === 0) {
            recentTbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px; color:#94a3b8;">최근 현장 배정 내역이 없습니다.</td></tr>';
          } else {
            var top5 = dispList.slice(0, 5);
            recentTbody.innerHTML = top5.map(function(d) {
              var sBadge = d.status === '정산완료' ? '<span class="status-badge" style="background:#dcfce7; color:#15803d;">정산완료</span>' :
                (d.status === '서비스완료' ? '<span class="status-badge" style="background:#fef3c7; color:#b45309;">검수대기</span>' :
                (d.status === '진행중' ? '<span class="status-badge" style="background:#e0f2fe; color:#0369a1;">진행중</span>' :
                '<span class="status-badge" style="background:#f1f5f9; color:#475569;">배정완료</span>'));

              return '<tr>' +
                '<td style="font-weight:800;">' + escapeHtml(d.customerName || '고객') + '</td>' +
                '<td><span style="font-weight:700; color:var(--accent);">' + escapeHtml(d.serviceName || d.serviceCategory || '라이프케어') + '</span></td>' +
                '<td><span style="font-weight:800; color:#0284c7;">' + escapeHtml(d.coachName || '미배정') + '</span></td>' +
                '<td style="text-align:center;">' + sBadge + '</td>' +
                '<td style="text-align:center; font-size:0.82rem; color:var(--text-muted);">' + escapeHtml(d.scheduledDate || d.visitDate || '-') + '</td>' +
                '<td style="font-size:0.84rem; color:var(--text-sub); max-width:220px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + escapeHtml(d.notes || d.specialNotes || '특이사항 없음') + '</td>' +
                '<td style="text-align:center;"><button type="button" class="btn-action-sm" onclick="switchTab(\'tabCoachControl\')" style="padding:4px 8px; font-size:0.78rem;">상세보기</button></td>' +
              '</tr>';
            }).join('');
          }
        }
      } catch (err) {
        console.warn('[refreshCockpitStats]', err);
      }
    }

    /* 📋 02. 고객 상담 필터 함수 */
    function filterConsultList(status, btn) {
      var btns = document.querySelectorAll('[id^="filterConsult_"]');
      btns.forEach(function(b) { b.classList.remove('active'); });
      if (btn) btn.classList.add('active');

      var tbody = document.getElementById('diagReservationTableBody');
      if (!tbody || typeof getDiagReservations !== 'function') return;

      var list = getDiagReservations();
      if (status !== 'all') {
        list = list.filter(function(item) {
          if (status === '대기') return !item.status || item.status === '대기';
          return item.status === status;
        });
      }

      if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 24px; color:#94a3b8;">선택한 상태의 상담 내역이 없습니다.</td></tr>';
        return;
      }

      tbody.innerHTML = list.map(function(item) {
        var cat = item.category || '진단 일반';
        var role = item.role || item.name || '본인';
        var phone = item.phone || '-';
        var note = item.note || item.memo || '-';
        var date = item.createdAt || item.date || '-';
        var itemStatus = item.status || '대기';

        var statusStyle = itemStatus === '완료' ? 'background:#dcfce7; color:#15803d; border:1px solid #86efac;' :
          (itemStatus === '진행' ? 'background:#e0f2fe; color:#0369a1; border:1px solid #7dd3fc;' : 'background:#fef3c7; color:#b45309; border:1px solid #fde68a;');

        return '<tr>' +
          '<td><span style="display:inline-block; padding:3px 8px; border-radius:6px; background:rgba(43,90,66,0.08); color:var(--accent); font-size:0.8rem; font-weight:800;">' + escapeHtml(cat) + '</span></td>' +
          '<td style="font-weight:700;">' + escapeHtml(role) + '</td>' +
          '<td><a href="tel:' + escapeHtml(phone) + '" style="color:var(--accent); font-weight:700;">' + escapeHtml(phone) + '</a></td>' +
          '<td style="max-width:280px; font-size:0.85rem; color:var(--text-sub);">' + escapeHtml(note) + '</td>' +
          '<td style="font-size:0.82rem; color:var(--text-muted);">' + escapeHtml(date) + '</td>' +
          '<td style="text-align:center;"><span style="display:inline-block; padding:3px 8px; border-radius:999px; font-size:0.75rem; font-weight:850; ' + statusStyle + '">' + escapeHtml(itemStatus) + '</span></td>' +
          '<td style="text-align:center;">' +
            '<button type="button" class="btn-action-sm" onclick="openDispatchModal();" style="padding:4px 8px; font-size:0.76rem; background:#fffbeb; color:#b45309; border:1px solid #fde68a;">🤝 코치배정</button>' +
          '</td>' +
        '</tr>';
      }).join('');
    }
'@

# Perform Regex Replacement for switchTab
if ($fullHtml -match $oldSwitchTabPattern) {
    $fullHtml = [regex]::Replace($fullHtml, $oldSwitchTabPattern, $newJsFunctions)
    Write-Host "Successfully replaced switchTab and added refreshCockpitStats / filterConsultList!"
} else {
    Write-Warning "Could not match old switchTab with strict regex. Trying flexible search..."
    $idx1 = $fullHtml.IndexOf("function switchTab(tabId, btn)")
    $idx2 = $fullHtml.IndexOf("const SETTINGS_KEY = 'yebaek_site_settings_v1';", $idx1)
    if ($idx1 -ge 0 -and $idx2 -gt $idx1) {
        $fullHtml = $fullHtml.Substring(0, $idx1) + $newJsFunctions + "`n`n    // ================= 1. 사이트 설정 로드 및 저장 =================`n    " + $fullHtml.Substring($idx2)
        Write-Host "Replaced switchTab via substring replacement!"
    } else {
        throw "Could not locate switchTab for JS replacement."
    }
}

# Update loadAllData() to call refreshCockpitStats and default to tabCockpit
$oldLoadEnd = 'try {
        var urlParams = new URLSearchParams(window.location.search);
        var reqTab = urlParams.get(''tab'') || window.location.hash.replace(''#'', '''');
        if (reqTab === ''memoir'' || reqTab === ''tabMemoirDashboard'' || reqTab === ''memoirDashboard'') {
          switchTab(''tabMemoirDashboard'');
        } else if (reqTab && document.getElementById(reqTab)) {
          switchTab(reqTab);
        }
      } catch(e) {}'

$newLoadEnd = @'
      // 🌟 종합 관제 홈 실시간 집계 로드
      if (typeof refreshCockpitStats === 'function') {
        refreshCockpitStats();
      }

      // URL 파라미터(?tab=...) 또는 해시 감지 시 해당 탭 자동 활성화 (기본값: 01. 종합 관제 홈)
      try {
        var urlParams = new URLSearchParams(window.location.search);
        var reqTab = urlParams.get('tab') || window.location.hash.replace('#', '');
        if (reqTab === 'memoir' || reqTab === 'tabMemoirDashboard' || reqTab === 'memoirDashboard') {
          switchTab('tabMemoirDashboard');
        } else if (reqTab && document.getElementById(reqTab)) {
          switchTab(reqTab);
        } else {
          switchTab('tabCockpit');
        }
      } catch(e) {
        switchTab('tabCockpit');
      }
'@

if ($fullHtml.Contains($oldLoadEnd)) {
    $fullHtml = $fullHtml.Replace($oldLoadEnd, $newLoadEnd)
    Write-Host "Successfully updated loadAllData() to activate tabCockpit!"
} else {
    Write-Warning "Could not find exact loadAllData end string. Searching with regex..."
    $patternLoad = '(?s)var urlParams = new URLSearchParams\(window\.location\.search\);.*?switchTab\(reqTab\);\s*\}\s*\}\s*catch\(e\)\s*\{\}'
    $fullHtml = [regex]::Replace($fullHtml, $patternLoad, $newLoadEnd.Trim())
    Write-Host "Updated loadAllData via regex!"
}

# Save restructured admin.html
[System.IO.File]::WriteAllText($filePath, $fullHtml, $encoding)
Write-Host "Saved restructured admin.html successfully! UTF-8 validated."
