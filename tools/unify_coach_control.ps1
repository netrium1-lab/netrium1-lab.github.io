# PowerShell script to unify Coach Dispatch and Settlement into ONE single category
$adminPath = "c:\Users\User1\구글드라이브\antigravity\admin.html"
$content = [System.IO.File]::ReadAllText($adminPath, [System.Text.Encoding]::UTF8)

Write-Host "1. Unifying tabCoachControl and tabAcademy into ONE single control center..."

# 1. Update the table header in tabCoachControl
$oldTableHeader = @"
              <thead>
                <tr>
                  <th style="width: 50px; text-align: center;">No</th>
                  <th style="width: 125px; text-align: center;">진행 상태</th>
                  <th style="width: 135px;">신청 고객</th>
                  <th style="width: 155px;">서비스 분야</th>
                  <th style="width: 105px;">담당 코치</th>
                  <th style="min-width: 220px;">방문 일시 &amp; 장소</th>
                  <th style="width: 140px; text-align: center;">현장 스탬프</th>
                  <th style="width: 110px; text-align: right;">💰 활동비</th>
                  <th style="width: 130px; text-align: center;">작업진행 카드</th>
                </tr>
              </thead>
"@

$newTableHeader = @"
              <thead>
                <tr>
                  <th style="width: 45px; text-align: center;">No</th>
                  <th style="width: 120px; text-align: center;">진행 상태</th>
                  <th style="width: 130px;">신청 고객</th>
                  <th style="width: 145px;">서비스 분야</th>
                  <th style="min-width: 190px;">방문 일시 &amp; 장소</th>
                  <th style="width: 160px;">담당 코치 배정</th>
                  <th style="width: 130px; text-align: center;">현장 스탬프</th>
                  <th style="width: 100px; text-align: right;">💰 활동비</th>
                  <th style="width: 125px; text-align: center;">현장 검수</th>
                  <th style="width: 145px; text-align: center;">관리 &amp; 카톡</th>
                </tr>
              </thead>
"@

if ($content.Contains($oldTableHeader)) {
    $content = $content.Replace($oldTableHeader, $newTableHeader)
    Write-Host "[SUCCESS] Table header unified."
} else {
    Write-Error "[FAIL] Could not match oldTableHeader."
    exit 1
}

# 2. Remove the sub-navigation pills in tabCoachControl that caused the confusion
$oldCoachSubnav = @"
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
"@

$newCoachUnifiedHeader = @"
        <!-- 🌟 코칭스태프 파견 배정·현장관제 & 정산 통합 센터 (단일 카테고리) -->
"@

if ($content.Contains($oldCoachSubnav)) {
    $content = $content.Replace($oldCoachSubnav, $newCoachUnifiedHeader)
    Write-Host "[SUCCESS] Confusing subnav pills removed from tabCoachControl."
} else {
    Write-Error "[FAIL] Could not match oldCoachSubnav."
    exit 1
}

# 3. Update the header card in tabCoachControl to clearly reflect the unified workflow and add "+ 신규 서비스 배정 등록" button
$oldCoachHeaderCard = @"
        <!-- 상단 헤더 & 원클릭 바로가기 -->
        <div class="panel-card" style="margin-bottom: 20px;">
          <div class="panel-header" style="flex-wrap: wrap; gap: 12px;">
            <div class="panel-title-wrap">
              <span class="panel-icon" style="background:#eef7f2; color:#059669; font-size:1.6rem; padding:8px; border-radius:12px;">📸</span>
              <div>
                <h2 class="panel-title" style="font-size:1.35rem; font-weight:900;">02. 코치 현장수행 관제 &amp; 활동비 송금·정산 센터</h2>
                <p style="color: var(--text-muted); font-size: 0.88rem; margin: 4px 0 0;">
                  현장 코치들이 등록한 <strong>도착 스탬프, 현장 사진 3종(Before/Process/After), 완료 보고</strong>를 실시간 검수하고, 활동비 송금 확인 후 <strong>원클릭 입금완료 승인 및 카톡 안내</strong>를 처리합니다.
                </p>
              </div>
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <a href="coach.html" target="_blank" class="btn-save-setting" style="background: linear-gradient(135deg, #1e3d2f 0%, #2d5a45 100%); color: #ffffff; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(30,61,47,0.3); font-weight: 850;">
                <span>📱</span> 코치 현장앱 열기 ➔
              </a>
              <button type="button" class="btn-save-setting" onclick="renderCoachControlCenter()" style="background: #ffffff; color: var(--text-main); border: 1.5px solid var(--border-color);">
                <span>🔄</span> 현장 실시간 새로고침
              </button>
              <button type="button" class="btn-save-setting" onclick="exportDispatchesCSV()" style="background: #ffffff; color: var(--text-main); border: 1.5px solid var(--border-color);">
                <span>📥</span> 정산 내역(CSV) 다운로드
              </button>
            </div>
          </div>
        </div>
"@

$newCoachHeaderCard = @"
        <!-- 🌟 코칭스태프 배정·현장관제·정산 통합 대시보드 헤더 -->
        <div class="panel-card" style="margin-bottom: 20px; border-top: 4px solid #059669;">
          <div class="panel-header" style="flex-wrap: wrap; gap: 12px;">
            <div class="panel-title-wrap">
              <span class="panel-icon" style="background:#eef7f2; color:#059669; font-size:1.6rem; padding:8px; border-radius:12px;">🤝</span>
              <div>
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                  <h2 class="panel-title" style="font-size:1.35rem; font-weight:900; color: #0f172a; margin: 0;">05. 코칭스태프 배정·현장관제 &amp; 정산 통합 센터</h2>
                  <span class="badge" style="background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; font-size: 0.74rem; font-weight: 850; padding: 2px 8px; border-radius: 999px;">배정부터 정산까지 원스톱</span>
                </div>
                <p style="color: var(--text-muted); font-size: 0.88rem; margin: 4px 0 0;">
                  고객 신청 접수에 <strong>공인 코치 직접 배정 및 카카오톡 알림 발송</strong>부터, 현장 도착·완료 스탬프 확인, <strong>작업카드 검수 및 활동비 송금 승인</strong>까지 단일 화면에서 원스톱으로 관리합니다.
                </p>
              </div>
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button type="button" class="btn-save-setting" onclick="openDispatchModal()" style="background: #059669; color: #ffffff; border: none; font-weight: 850; box-shadow: 0 4px 12px rgba(5,150,105,0.3); display: inline-flex; align-items: center; gap: 6px; cursor: pointer; padding: 8px 16px;">
                <span>➕</span> 신규 서비스 배정 등록
              </button>
              <a href="coach.html" target="_blank" class="btn-save-setting" style="background: #1e293b; color: #ffffff; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; font-weight: 800; border-radius: 8px;">
                <span>📱</span> 코치 현장앱 열기 ➔
              </a>
              <button type="button" class="btn-save-setting" onclick="renderCoachControlCenter()" style="background: #ffffff; color: var(--text-main); border: 1.5px solid var(--border-color); font-weight: 750;">
                <span>🔄</span> 새로고침
              </button>
              <button type="button" class="btn-save-setting" onclick="exportDispatchesCSV()" style="background: #ffffff; color: var(--text-main); border: 1.5px solid var(--border-color); font-weight: 750;">
                <span>📥</span> CSV 다운로드
              </button>
              <button type="button" class="btn-save-setting" onclick="var el = document.getElementById('coachPoolSection'); if (el) el.scrollIntoView({behavior:'smooth'});" style="background: #f8fafc; color: #334155; border: 1.5px solid #cbd5e1; font-weight: 800;">
                <span>🏅</span> 코치 풀 명부 바로보기
              </button>
            </div>
          </div>
        </div>
"@

if ($content.Contains($oldCoachHeaderCard)) {
    $content = $content.Replace($oldCoachHeaderCard, $newCoachHeaderCard)
    Write-Host "[SUCCESS] Unified header card updated."
} else {
    Write-Error "[FAIL] Could not match oldCoachHeaderCard."
    exit 1
}

# 4. Integrate Coach Pool and Academy tables directly into tabCoachControl (at the bottom)
$oldCoachSectionEnd = @"
          <div class="admin-table-wrap" style="border: none; border-radius: 0;">
            <table class="admin-table" id="coachControlTable">
              <thead>
                <tr>
                  <th style="width: 45px; text-align: center;">No</th>
                  <th style="width: 120px; text-align: center;">진행 상태</th>
                  <th style="width: 130px;">신청 고객</th>
                  <th style="width: 145px;">서비스 분야</th>
                  <th style="min-width: 190px;">방문 일시 &amp; 장소</th>
                  <th style="width: 160px;">담당 코치 배정</th>
                  <th style="width: 130px; text-align: center;">현장 스탬프</th>
                  <th style="width: 100px; text-align: right;">💰 활동비</th>
                  <th style="width: 125px; text-align: center;">현장 검수</th>
                  <th style="width: 145px; text-align: center;">관리 &amp; 카톡</th>
                </tr>
              </thead>
              <tbody id="controlTableBody">
                <!-- JS 동적 렌더링 -->
              </tbody>
            </table>
          </div>
        </div>

      </section>
"@

$newCoachSectionEnd = @"
          <div class="admin-table-wrap" style="border: none; border-radius: 0;">
            <table class="admin-table" id="coachControlTable">
              <thead>
                <tr>
                  <th style="width: 45px; text-align: center;">No</th>
                  <th style="width: 120px; text-align: center;">진행 상태</th>
                  <th style="width: 130px;">신청 고객</th>
                  <th style="width: 145px;">서비스 분야</th>
                  <th style="min-width: 190px;">방문 일시 &amp; 장소</th>
                  <th style="width: 160px;">담당 코치 배정</th>
                  <th style="width: 130px; text-align: center;">현장 스탬프</th>
                  <th style="width: 100px; text-align: right;">💰 활동비</th>
                  <th style="width: 125px; text-align: center;">현장 검수</th>
                  <th style="width: 145px; text-align: center;">관리 &amp; 카톡</th>
                </tr>
              </thead>
              <tbody id="controlTableBody">
                <!-- JS 동적 렌더링 -->
              </tbody>
            </table>
          </div>
        </div>

        <!-- 🏅 05-2. 교육 이수 공인 코칭스태프(Coach) 명단 및 프로필 관리 (통합 배치) -->
        <div class="panel-card" id="coachPoolSection" style="margin-top: 24px;">
          <div class="panel-header" style="flex-wrap: wrap; gap: 10px;">
            <div class="panel-title-wrap">
              <span class="panel-icon">🏅</span>
              <div>
                <h2 class="panel-title" style="font-size: 1.25rem;">05-2. 교육 이수 공인 코칭스태프(Coach) 명단 및 프로필 관리</h2>
                <p style="color: var(--text-muted); font-size: 0.86rem; margin: 4px 0 0;">
                  여백과 결 아카데미 전문 과정을 이수하고 공인 자격을 획득한 정예 코치 명단입니다. (서비스 배정 툴의 코치 풀로 자동 연동됩니다)
                </p>
              </div>
            </div>
            <div style="display: flex; gap: 8px;">
              <button class="btn-save-setting" onclick="openCoachModal()" style="background: var(--accent); color: #ffffff; font-weight: 850;">
                <span>➕</span> 신규 수료 코치 등록
              </button>
              <button class="btn-save-setting" onclick="exportCoachesCSV()" style="background: #ffffff; color: var(--text-main); border: 1.5px solid var(--border-color); font-weight: 750;">
                <span>📥</span> 코치 명단(CSV) 다운로드
              </button>
            </div>
          </div>

          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead>
                <tr>
                  <th style="width: 90px;">코치 성함</th>
                  <th style="width: 110px;">수료 기수</th>
                  <th style="width: 140px;">전문 코칭 분야</th>
                  <th style="width: 120px;">연락처</th>
                  <th style="width: 140px;">활동 가능 지역</th>
                  <th style="width: 85px; text-align: center;">만족도</th>
                  <th style="width: 85px; text-align: center;">배정 건수</th>
                  <th style="width: 110px; text-align: center;">활동 상태</th>
                  <th style="width: 100px; text-align: center;">관리</th>
                </tr>
              </thead>
              <tbody id="coachTableBody">
                <!-- JS 동적 렌더링 -->
              </tbody>
            </table>
          </div>
        </div>

        <!-- 🎓 05-3. 코칭스태프 양성 아카데미 지원 신청자 명단 (통합 배치) -->
        <div class="panel-card" style="margin-top: 24px;">
          <div class="panel-header">
            <div class="panel-title-wrap">
              <span class="panel-icon">🎓</span>
              <div>
                <h2 class="panel-title" style="font-size: 1.25rem;">05-3. 코칭스태프 양성 아카데미 지원 신청자 명단</h2>
                <p style="color: var(--text-muted); font-size: 0.86rem; margin: 4px 0 0;">
                  2026년 [여백과 결] 공식 코칭스태프 입학 상담 및 교육과정 지원자 명단입니다.
                </p>
              </div>
            </div>
            <button class="btn-save-setting" onclick="exportAcademyCSV()" style="font-weight: 750;">
              <span>📥</span> 지원자 엑셀(CSV) 다운로드
            </button>
          </div>

          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead>
                <tr>
                  <th style="width: 90px;">지원자 성함</th>
                  <th style="width: 120px;">연락처</th>
                  <th style="width: 130px;">관심 코칭 트랙</th>
                  <th>지원 동기 / 문의 내용</th>
                  <th style="width: 100px; text-align: center;">상태</th>
                  <th style="width: 80px; text-align: center;">관리</th>
                </tr>
              </thead>
              <tbody id="academyTableBody">
                <!-- JS 동적 렌더링 -->
              </tbody>
            </table>
          </div>
        </div>

      </section>
"@

if ($content.Contains($oldCoachSectionEnd)) {
    $content = $content.Replace($oldCoachSectionEnd, $newCoachSectionEnd)
    Write-Host "[SUCCESS] Coach pool and academy tables integrated into tabCoachControl."
} else {
    Write-Error "[FAIL] Could not match oldCoachSectionEnd."
    exit 1
}

# 5. Hide tabAcademy (for backward compatibility) and auto-route to tabCoachControl
$targetTabAcademyStart = '<section class="tab-panel" id="tabAcademy">'
$targetTabAcademyIdx = $content.IndexOf($targetTabAcademyStart)
$targetTabCoachControlStart = '<section class="tab-panel" id="tabCoachControl">'
$targetTabCoachControlIdx = $content.IndexOf($targetTabCoachControlStart)

if ($targetTabAcademyIdx -ge 0 -and $targetTabCoachControlIdx -gt $targetTabAcademyIdx) {
    # Replace tabAcademy with a slim hidden compatibility container
    $academyOldHtml = $content.Substring($targetTabAcademyIdx, $targetTabCoachControlIdx - $targetTabAcademyIdx)
    $academyNewHtml = @"
<!-- ================= 탭 1: 🎓 05. 코칭스태프 & 정산 센터 통합 완료 (하위 호환 앵커) ================= -->
      <section class="tab-panel" id="tabAcademy" style="display:none !important;">
        <!-- 하위 호환성을 위한 히든 바디 -->
        <div style="display:none;">
          <table><tbody id="dispatchTableBody"></tbody></table>
          <span id="statCoachTotal"></span>
          <span id="statCoachActive"></span>
          <span id="statDispatchCount"></span>
          <span id="statDispatchPending"></span>
          <span id="countDispAll"></span>
        </div>
      </section>

      
"@
    $content = $content.Substring(0, $targetTabAcademyIdx) + $academyNewHtml + $content.Substring($targetTabCoachControlIdx)
    Write-Host "[SUCCESS] tabAcademy replaced with backward-compatible stub; all integrated into tabCoachControl."
} else {
    Write-Error "[FAIL] Could not locate tabAcademy section range."
    exit 1
}

# 6. Update renderCoachControlCenter to include Coach selection dropdown and Dispatch management actions (Kakao, Edit, Delete)
$oldRenderMap = @"
          <tr class="control-row `${isPending ? 'pending-row' : ''}" onclick="openDispatchReportModal('`${d.id}')" title="클릭하여 [`${escapeHtml(d.customerName)}] 현장 작업진행 카드(사진 3종 &amp; 소감 &amp; 송금 승인)를 확인합니다.">
            <td style="text-align: center; color: var(--text-muted); font-size: 0.82rem; font-weight: 750;">
              `${index + 1}
            </td>
            <td style="text-align: center;">
              `${statusBadge}
            </td>
            <td>
              <div style="font-weight: 850; color: var(--text-main); font-size: 0.92rem;">`${escapeHtml(d.customerName)}</div>
              <div style="margin-top: 2px;">
                <a href="tel:`${escapeHtml(d.phone)}" onclick="event.stopPropagation()" style="font-size: 0.78rem; color: var(--accent); font-weight: 750; text-decoration: none;">
                  `${escapeHtml(d.phone)}
                </a>
              </div>
            </td>
            <td>
              <span class="control-svc-badge" style="font-size: 0.76rem; padding: 3px 8px; white-space: nowrap;">
                `${escapeHtml(d.serviceType)}
              </span>
            </td>
            <td>
              <strong style="color: var(--text-main); font-size: 0.88rem;">`${escapeHtml(d.coach || '미배정')}</strong>
            </td>
            <td>
              <div style="font-weight: 800; font-size: 0.84rem; color: #1e293b;">`${escapeHtml(d.preferredDate)}</div>
              <div style="font-size: 0.78rem; color: #64748b; max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 2px;" title="`${escapeHtml(d.address)}">
                📍 `${escapeHtml(d.address)}
              </div>
            </td>
            <td style="text-align: center; font-size: 0.78rem; line-height: 1.45;">
              <span style="color: `${d.arrivalStamp ? '#0284c7' : '#94a3b8'}; font-weight: 750;">도착: `${escapeHtml(d.arrivalStamp || '대기')}</span><br>
              <span style="color: `${d.completionDate ? '#059669' : '#94a3b8'}; font-weight: 750;">완료: `${escapeHtml(d.completionDate || '대기')}</span>
            </td>
            <td style="text-align: right;">
              <strong style="color: #d97706; font-size: 0.94rem;">`${fee.toLocaleString()}원</strong>
            </td>
            <td style="text-align: center;">
              <button type="button" class="btn-action-sm edit" onclick="openDispatchReportModal('`${d.id}'); event.stopPropagation();" style="font-weight: 850; padding: 6px 12px; background: var(--accent); color: #ffffff; border: none; border-radius: 8px; box-shadow: 0 2px 6px rgba(30,61,47,0.2); white-space: nowrap; display: inline-flex; align-items: center; gap: 5px;" title="작업진행 카드 모달 열기 (등록 사진 `${photoCount}장 &amp; 코치 소감 &amp; 송금 승인)">
                <span>🔍 작업카드</span>
                `${photoBadge}
              </button>
            </td>
          </tr>
"@

$newRenderMap = @"
          // 코치 선택 옵션 리스트
          const coachOptions = coaches.map(c => {
            const isSelected = (d.coach && d.coach.includes(c.name)) || d.coachId === c.id;
            return `<option value="`${c.name} 코치" `${isSelected ? 'selected' : ''}>`${escapeHtml(c.name)} 코치 [`${c.status}]</option>`;
          }).join('');

          return `
          <tr class="control-row `${isPending ? 'pending-row' : ''}" onclick="openDispatchReportModal('`${d.id}')" title="클릭하여 [`${escapeHtml(d.customerName)}] 현장 작업진행 카드(사진 3종 &amp; 소감 &amp; 송금 승인)를 확인합니다.">
            <td style="text-align: center; color: var(--text-muted); font-size: 0.82rem; font-weight: 750;">
              `${index + 1}
            </td>
            <td style="text-align: center;">
              `${statusBadge}
            </td>
            <td>
              <div style="font-weight: 850; color: var(--text-main); font-size: 0.92rem;">`${escapeHtml(d.customerName)}</div>
              <div style="margin-top: 2px;">
                <a href="tel:`${escapeHtml(d.phone)}" onclick="event.stopPropagation()" style="font-size: 0.78rem; color: var(--accent); font-weight: 750; text-decoration: none;">
                  `${escapeHtml(d.phone)}
                </a>
              </div>
            </td>
            <td>
              <span class="control-svc-badge" style="font-size: 0.76rem; padding: 3px 8px; white-space: nowrap;">
                `${escapeHtml(d.serviceType)}
              </span>
            </td>
            <td>
              <div style="font-weight: 800; font-size: 0.84rem; color: #1e293b;">`${escapeHtml(d.preferredDate)}</div>
              <div style="font-size: 0.78rem; color: #64748b; max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 2px;" title="`${escapeHtml(d.address)}">
                📍 `${escapeHtml(d.address)}
              </div>
            </td>
            <td onclick="event.stopPropagation()">
              <select class="coach-select-sm" onchange="assignCoachToDispatchName('`${d.id}', this.value)" style="width: 100%; font-weight: 800; font-size: 0.80rem; padding: 4px 6px; border-radius: 6px; border: 1.5px solid var(--border-color); background: #ffffff;">
                <option value="">⚠️ 미배정 (코치 선택)</option>
                `${coachOptions}
              </select>
            </td>
            <td style="text-align: center; font-size: 0.78rem; line-height: 1.45;">
              <span style="color: `${d.arrivalStamp ? '#0284c7' : '#94a3b8'}; font-weight: 750;">도착: `${escapeHtml(d.arrivalStamp || '대기')}</span><br>
              <span style="color: `${d.completionDate ? '#059669' : '#94a3b8'}; font-weight: 750;">완료: `${escapeHtml(d.completionDate || '대기')}</span>
            </td>
            <td style="text-align: right;">
              <strong style="color: #d97706; font-size: 0.94rem;">`${fee.toLocaleString()}원</strong>
            </td>
            <td style="text-align: center;">
              <button type="button" class="btn-action-sm edit" onclick="openDispatchReportModal('`${d.id}'); event.stopPropagation();" style="font-weight: 850; padding: 6px 10px; background: var(--accent); color: #ffffff; border: none; border-radius: 8px; box-shadow: 0 2px 6px rgba(30,61,47,0.2); white-space: nowrap; display: inline-flex; align-items: center; gap: 4px;" title="작업진행 카드 모달 열기 (등록 사진 `${photoCount}장 &amp; 코치 소감 &amp; 송금 승인)">
                <span>🔍 작업카드</span>
                `${photoBadge}
              </button>
            </td>
            <td style="text-align: center;" onclick="event.stopPropagation()">
              <div style="display: flex; align-items: center; justify-content: center; gap: 4px; flex-wrap: wrap;">
                <button type="button" class="btn-action-sm" onclick="sendCoachKakaoDirect('`${d.id}')" style="background:#fef01b; color:#181600; border-color:#e5d800; font-size:0.74rem; font-weight:850; padding:3px 7px; border-radius:6px; box-shadow:0 1px 3px rgba(0,0,0,0.08); white-space:nowrap; display:inline-flex; align-items:center; gap:3px;" title="카카오톡으로 코치님께 배정 알림 바로 전송 (클립보드도 자동 복사)">
                  <span>💬</span> 카톡
                </button>
                <button type="button" class="btn-action-sm edit" onclick="openDispatchModal('`${d.id}')" title="배정 정보 수정" style="font-size:0.72rem; padding:3px 6px;">수정</button>
                <button type="button" class="btn-action-sm del" onclick="deleteDispatch('`${d.id}')" title="삭제" style="font-size:0.72rem; padding:3px 6px;">삭제</button>
              </div>
            </td>
          </tr>
"@

if ($content.Contains($oldRenderMap)) {
    $content = $content.Replace($oldRenderMap, $newRenderMap)
    Write-Host "[SUCCESS] renderCoachControlCenter row rendering enriched with Coach selection & Kakao management."
} else {
    Write-Error "[FAIL] Could not match oldRenderMap."
    exit 1
}

# 7. Update switchTab routing to automatically redirect tabAcademy to tabCoachControl
$oldSwitchTabAcademy = "else if (tabId === 'tabAcademy') btn = document.getElementById('navBtnCoachControl') || document.getElementById('navBtnAcademy');"
$newSwitchTabAcademy = @"
else if (tabId === 'tabAcademy') {
        tabId = 'tabCoachControl';
        btn = document.getElementById('navBtnCoachControl');
      }
"@

if ($content.Contains($oldSwitchTabAcademy)) {
    $content = $content.Replace($oldSwitchTabAcademy, $newSwitchTabAcademy)
    Write-Host "[SUCCESS] switchTab router updated to automatically redirect tabAcademy to unified tabCoachControl."
}

# 8. Update switchTab hooks to ensure both renderCoachControlCenter and renderCoachesTable are called
$oldCoachHook = @"
      } else if (tabId === 'tabCoachControl') {
        if (typeof renderCoachControlCenter === 'function') renderCoachControlCenter();
      }
"@

$newCoachHook = @"
      } else if (tabId === 'tabCoachControl') {
        if (typeof renderCoachControlCenter === 'function') renderCoachControlCenter();
        if (typeof renderCoachesTable === 'function') renderCoachesTable();
        if (typeof renderAcademyApplicantsTable === 'function') renderAcademyApplicantsTable();
      }
"@

if ($content.Contains($oldCoachHook)) {
    $content = $content.Replace($oldCoachHook, $newCoachHook)
    Write-Host "[SUCCESS] switchTab hook updated for unified rendering."
}

[System.IO.File]::WriteAllText($adminPath, $content, [System.Text.Encoding]::UTF8)
Write-Host "Unification completed successfully!"
