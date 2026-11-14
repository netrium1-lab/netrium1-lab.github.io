# PowerShell script to transform 4-Business tab bar into a scalable Dashboard Hub and remove Memoir completely from Business Master
$ErrorActionPreference = "Stop"

$filePath = "admin.html"
$encoding = [System.Text.Encoding]::UTF8
$lines = [System.IO.File]::ReadAllLines($filePath, $encoding)

Write-Host "Read admin.html: $($lines.Length) lines."

# 1. Locate start of tabBusinessMaster
$startBiz = -1
$endTabs = -1
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match '<section class="tab-panel" id="tabBusinessMaster">') { $startBiz = $i }
    if ($startBiz -ge 0 -and $lines[$i] -match '<!-- 2. 상단 비즈니스 메타 헤더') { $endTabs = $i - 1; break }
}

if ($startBiz -lt 0 -or $endTabs -lt 0) {
    throw "Could not find tabBusinessMaster tabs area."
}
Write-Host "Replacing lines $($startBiz + 2) to $($endTabs + 1) with Dashboard Hub"

# 2. Locate the memoir separation banner in tabBusinessMaster
$startBanner = -1
$endBanner = -1
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match '<!-- 📖 디지털 자서전 출판 관제 분리 안내 카드 -->') { $startBanner = $i }
    if ($startBanner -ge 0 -and $lines[$i] -match '<!-- 맞춤 진단 고객 접수 안내 배너 -->') { $endBanner = $i - 1; break }
}

Write-Host "Memoir banner in tabBusinessMaster: lines $($startBanner + 1) to $($endBanner + 1)"

# New Dashboard Hub HTML for 4 Core Businesses
$newBusinessHub = @'
        <!-- 🌟 03. 4대 오프라인 라이프케어 비즈니스 관제 허브 -->
        <div class="panel-card" style="margin-bottom: 20px; border-top: 4px solid #b83354;">
          <div class="panel-header" style="flex-wrap: wrap; gap: 12px;">
            <div class="panel-title-wrap">
              <span class="panel-icon" style="font-size: 1.8rem;">🌟</span>
              <div>
                <h2 class="panel-title" style="margin: 0; font-size: 1.25rem; color: #b83354;">03. 4대 오프라인 라이프케어 비즈니스 관제</h2>
                <p style="color: var(--text-muted); font-size: 0.86rem; margin: 4px 0 0;">
                  #01 뷰티케어(180분), #02 공간비움, #03 유품정리, #04 생전 엔딩파티 현장 방문 서비스 전용 관제 허브입니다.
                </p>
              </div>
            </div>
            <!-- 유연한 빠른 선택 드롭다운 (프로그램 추가·수정 시 무한 확장 지원) -->
            <div style="display: flex; align-items: center; gap: 8px;">
              <label for="bizProgramSelector" style="font-size: 0.85rem; font-weight: 850; color: var(--text-main);">비즈니스 선택:</label>
              <select id="bizProgramSelector" onchange="switchBusinessMasterTab(this.value)" class="setting-input" style="padding: 7px 14px; font-weight: 850; width: auto; font-size: 0.88rem; border: 1.5px solid #b83354; border-radius: 10px; cursor: pointer;">
                <option value="beauty">💄 #01 뷰티 라이프케어 (180분 SOP)</option>
                <option value="wardrobe">👗 #02 옷장 &amp; 공간 비움</option>
                <option value="legacy">📦 #03 유품 &amp; 짐 아카이빙</option>
                <option value="party">💌 #04 생전 엔딩 파티</option>
              </select>
            </div>
          </div>

          <!-- 4대 비즈니스 대시보드 카드 그리드 (반응형 4열, 비즈니스 추가 시 자동 줄바꿈) -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin-top: 16px;">
            <!-- 카드 1: 뷰티 라이프케어 -->
            <div class="biz-hub-card active" id="bizCard_beauty" onclick="switchBusinessMasterTab('beauty')" style="cursor: pointer; padding: 18px; border-radius: 14px; border: 2.2px solid #b83354; background: #fff0f3; transition: all 0.2s ease;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 1.6rem;">💄</span>
                <span class="badge" style="background: #b83354; color: #fff; font-size: 0.72rem; font-weight: 850; padding: 2px 8px; border-radius: 999px;">180분 SOP</span>
              </div>
              <div style="font-size: 1.05rem; font-weight: 850; color: #b83354; margin-top: 10px;">#01 뷰티 라이프케어</div>
              <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 4px; line-height: 1.4;">수분·탄력 회복 &amp; 특별한 날 외출 케어</div>
              <div style="margin-top: 14px; padding-top: 10px; border-top: 1px dashed rgba(184,51,84,0.3); display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.76rem; color: var(--text-muted);">관제 상태</span>
                <span class="biz-card-status-text" style="font-size: 0.84rem; font-weight: 850; color: #b83354;">현재 관제 중 ✓</span>
              </div>
            </div>

            <!-- 카드 2: 옷장 & 공간 비움 -->
            <div class="biz-hub-card" id="bizCard_wardrobe" onclick="switchBusinessMasterTab('wardrobe')" style="cursor: pointer; padding: 18px; border-radius: 14px; border: 1.5px solid var(--border-color); background: var(--bg-card); transition: all 0.2s ease;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 1.6rem;">👗</span>
                <span class="badge" style="background: #2b7a4b; color: #fff; font-size: 0.72rem; font-weight: 850; padding: 2px 8px; border-radius: 999px;">공간 리셋</span>
              </div>
              <div style="font-size: 1.05rem; font-weight: 850; color: var(--text-main); margin-top: 10px;">#02 옷장 &amp; 공간 비움</div>
              <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 4px; line-height: 1.4;">일상복과 외출복 구분 &amp; 동선 수납 컨설팅</div>
              <div style="margin-top: 14px; padding-top: 10px; border-top: 1px dashed var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.76rem; color: var(--text-muted);">관제 상태</span>
                <span class="biz-card-status-text" style="font-size: 0.84rem; font-weight: 850; color: #2b7a4b;">전환하기 ➔</span>
              </div>
            </div>

            <!-- 카드 3: 유품 & 짐 아카이빙 -->
            <div class="biz-hub-card" id="bizCard_legacy" onclick="switchBusinessMasterTab('legacy')" style="cursor: pointer; padding: 18px; border-radius: 14px; border: 1.5px solid var(--border-color); background: var(--bg-card); transition: all 0.2s ease;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 1.6rem;">📦</span>
                <span class="badge" style="background: #9a6528; color: #fff; font-size: 0.72rem; font-weight: 850; padding: 2px 8px; border-radius: 999px;">유품 아카이빙</span>
              </div>
              <div style="font-size: 1.05rem; font-weight: 850; color: var(--text-main); margin-top: 10px;">#03 유품 &amp; 짐 아카이빙</div>
              <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 4px; line-height: 1.4;">기억의 계승 &amp; 오래된 짐 비움·유품 정돈</div>
              <div style="margin-top: 14px; padding-top: 10px; border-top: 1px dashed var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.76rem; color: var(--text-muted);">관제 상태</span>
                <span class="biz-card-status-text" style="font-size: 0.84rem; font-weight: 850; color: #9a6528;">전환하기 ➔</span>
              </div>
            </div>

            <!-- 카드 4: 생전 엔딩 파티 -->
            <div class="biz-hub-card" id="bizCard_party" onclick="switchBusinessMasterTab('party')" style="cursor: pointer; padding: 18px; border-radius: 14px; border: 1.5px solid var(--border-color); background: var(--bg-card); transition: all 0.2s ease;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 1.6rem;">💌</span>
                <span class="badge" style="background: #7a3594; color: #fff; font-size: 0.72rem; font-weight: 850; padding: 2px 8px; border-radius: 999px;">생전 장례</span>
              </div>
              <div style="font-size: 1.05rem; font-weight: 850; color: var(--text-main); margin-top: 10px;">#04 생전 엔딩 파티</div>
              <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 4px; line-height: 1.4;">고마운 분들을 초대하는 아름다운 인생 감사 축제</div>
              <div style="margin-top: 14px; padding-top: 10px; border-top: 1px dashed var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.76rem; color: var(--text-muted);">관제 상태</span>
                <span class="biz-card-status-text" style="font-size: 0.84rem; font-weight: 850; color: #7a3594;">전환하기 ➔</span>
              </div>
            </div>
          </div>

          <!-- 하위 호환성을 위한 히든 버튼 앵커 -->
          <div style="display: none;">
            <button id="bizTabBtn_beauty"></button>
            <button id="bizTabBtn_wardrobe"></button>
            <button id="bizTabBtn_legacy"></button>
            <button id="bizTabBtn_party"></button>
            <button id="bizTabBtn_memoir"></button>
          </div>
        </div>
'@

# Assemble lines
$newLines = [System.Collections.Generic.List[string]]::new()
for ($i = 0; $i -lt $lines.Length; $i++) {
    # Replace top area of tabBusinessMaster
    if ($i -eq $startBiz + 1) {
        $newLines.Add($newBusinessHub)
        $i = $endTabs
        continue
    }

    # Remove memoir banner in tabBusinessMaster if present
    if ($startBanner -ge 0 -and $i -ge $startBanner -and $i -le $endBanner) {
        continue
    }

    $newLines.Add($lines[$i])
}

$fullHtml = [string]::Join("`n", $newLines)

# Replace switchBusinessMasterTab in admin.html with updated version
$oldSwitchBizPattern = '(?s)function switchBusinessMasterTab\(bizCategory\) \{.*?\n    \}'
$newSwitchBiz = @'
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
'@

if ($fullHtml -match $oldSwitchBizPattern) {
    $fullHtml = [regex]::Replace($fullHtml, $oldSwitchBizPattern, $newSwitchBiz)
    Write-Host "Updated switchBusinessMasterTab function in admin.html!"
} else {
    Write-Warning "Could not match oldSwitchBizPattern"
}

[System.IO.File]::WriteAllText($filePath, $fullHtml, $encoding)
Write-Host "Successfully saved admin.html with Business Hub Dashboard!"
