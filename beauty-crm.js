// =========================================================================
// 여백과결 - 03. 웰라이프 4대 방문 케어 통합 관제 & CRM 시스템 (beauty-crm.js)
// 통합 고객 접수·상담함에서 '상담 완료' 확정·이관된 고객만 전담 관리합니다.
// 3단계 실행 파이프라인: ① 코치 배정 ➔ ② 현장 케어/일지 ➔ ③ CRM 사후관리
// =========================================================================

let currentBusinessTab = 'beauty'; // 'beauty', 'wardrobe', 'legacy', 'party'
let currentPipelineStep = 'all';    // 'all', 'step2'(①코치배정), 'step3'(②현장케어), 'step4'(③CRM사후관리)
let currentSubFilter = 'all';       // 각 단계 내부 하위 필터

// 🌟 데이터 버전 관리 (가짜 샘플 제거 & 통합 고객 접수·상담함 완료 건만 엄격 동기화)
const BEAUTY_CRM_DATA_VER = '20261122_v5_strict_consult';
const LEGACY_DUMMY_BEAUTY_IDS = new Set([
  'BK-202608', 'BK-202609', 'BK-202610', 'BK-202611',
  'BK-202612', 'BK-202615', 'BK-202616', 'BK-202617'
]);
const LEGACY_DUMMY_GENERAL_IDS = new Set([
  'CS-101', 'CS-102', 'CS-103', 'CS-104', 'CS-105', 'CS-106',
  'CS-107', 'CS-108', 'CS-109', 'CS-110', 'CS-111', 'CS-112', 'CS-113'
]);

try {
  if (localStorage.getItem('beautyCrmDataVer') !== BEAUTY_CRM_DATA_VER) {
    // 기존 하드코딩 샘플만 정리하고, 통합 상담함에서 실제 이관된 고객 데이터(sourceConsultId 보유)는 100% 보존
    const rawB = localStorage.getItem('seniorBeautyBookings');
    if (rawB) {
      const parsedB = JSON.parse(rawB);
      if (Array.isArray(parsedB)) {
        const cleanedB = parsedB.filter(i => i && !LEGACY_DUMMY_BEAUTY_IDS.has(i.id) && i.sourceConsultId);
        localStorage.setItem('seniorBeautyBookings', JSON.stringify(cleanedB));
      }
    }
    const rawG = localStorage.getItem('seniorConsultList');
    if (rawG) {
      const parsedG = JSON.parse(rawG);
      if (Array.isArray(parsedG)) {
        const cleanedG = parsedG.filter(i => i && !LEGACY_DUMMY_GENERAL_IDS.has(i.id) && i.sourceConsultId);
        localStorage.setItem('seniorConsultList', JSON.stringify(cleanedG));
      }
    }
    localStorage.setItem('beautyCrmDataVer', BEAUTY_CRM_DATA_VER);
  }
} catch(e) {}

// 🌟 통합 고객 접수·상담함(reset_consult_list)에서 '완료' 확정된 건만 조회하는 단일 진실 공급원
function getCompletedConsultMap() {
  const map = new Map();
  try {
    let list = [];
    if (typeof getDiagReservations === 'function') {
      list = getDiagReservations();
    } else {
      const raw = localStorage.getItem('reset_consult_list');
      if (raw) list = JSON.parse(raw);
    }
    if (Array.isArray(list)) {
      list.forEach(c => {
        if (c && c.id && c.status === '완료') {
          map.set(c.id, c);
        }
      });
    }
  } catch (e) {}
  return map;
}

function classifyWellnessConsultKey(item) {
  if (!item) return null;
  if (item.handedOffBiz && ['beauty', 'wardrobe', 'legacy', 'party'].includes(item.handedOffBiz)) {
    return item.handedOffBiz;
  }
  const text = ((item.category || '') + ' ' + (item.note || item.memo || ''));
  if (text.includes('자서전') || text.includes('회고록') || text.includes('생애') || text.includes('워크북')) return null;
  if (text.includes('서재') || text.includes('아카이브') || text.includes('전시관')) return null;
  if (text.includes('아카데미') || text.includes('코치 지원') || text.includes('입학')) return null;
  if (text.includes('뷰티') || text.includes('메이크업') || text.includes('웰니스')) return 'beauty';
  if (text.includes('유품') || text.includes('오래된 짐') || text.includes('기억의 계승') || text.includes('생전정리')) return 'legacy';
  if (text.includes('엔딩') || text.includes('파티') || text.includes('마침표')) return 'party';
  if (text.includes('옷장') || text.includes('공간') || text.includes('수납') || text.includes('비움의 미학')) return 'wardrobe';
  return null;
}

// 통합 상담함에서 '완료'된 웰라이프 상담 건을 각 비즈니스 저장소에 자동 동기화 (누락 방지 · 중복 방지)
function syncCompletedConsultsIntoWellness() {
  const completedMap = getCompletedConsultMap();
  completedMap.forEach((consultItem) => {
    const bizKey = classifyWellnessConsultKey(consultItem);
    if (!bizKey) return;
    if (bizKey === 'beauty') {
      const bList = getStoredBeautyBookings();
      const exists = bList.some(x =>
        (x.sourceConsultId && x.sourceConsultId === consultItem.id) ||
        (consultItem.sourceBookingId && x.id === consultItem.sourceBookingId)
      );
      if (!exists) {
        handoffConsultToWellnessBusiness(consultItem, 'beauty', true);
      }
    } else {
      const gList = getStoredGeneralConsults();
      const exists = gList.some(x => x.sourceConsultId && x.sourceConsultId === consultItem.id);
      if (!exists) {
        handoffConsultToWellnessBusiness(consultItem, bizKey, true);
      }
    }
  });
  return completedMap;
}

// 1. 1호 시니어 뷰티 라이프케어 데이터 조회 (가짜 샘플 없이 실제 이관 건만 유지)
function getStoredBeautyBookings() {
  try {
    const raw = localStorage.getItem('seniorBeautyBookings');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(i => i && !LEGACY_DUMMY_BEAUTY_IDS.has(i.id));
      }
    }
  } catch(e) {
    console.error('예약 데이터 파싱 실패:', e);
  }
  return [];
}

// 2. 2호~4호 웰라이프 비즈니스 데이터 조회 (가짜 샘플 없이 실제 이관 건만 유지)
function getStoredGeneralConsults() {
  try {
    const raw = localStorage.getItem('seniorConsultList');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(i => i && !LEGACY_DUMMY_GENERAL_IDS.has(i.id));
      }
    }
  } catch(e) {}
  return [];
}

// 3. 4대 비즈니스 탭 전환 (사이드바·브레드크럼·테마 색상 일괄 동기화)
function switchBusinessMasterTab(biz) {
  if (biz === 'memoir') {
    if (typeof switchTab === 'function') switchTab('tabMemoirDashboard');
    return;
  }
  currentBusinessTab = biz || 'beauty';
  currentSubFilter = 'all';

  const sel = document.getElementById('bizProgramSelector');
  if (sel) sel.value = currentBusinessTab;

  const tabs = ['beauty', 'wardrobe', 'legacy', 'party'];
  tabs.forEach(t => {
    const btn = document.getElementById(`bizTabBtn_${t}`);
    if (btn) btn.classList.toggle('active', t === currentBusinessTab);
    const card = document.getElementById(`bizCard_${t}`);
    if (card) card.classList.toggle('active', t === currentBusinessTab);
    const subEl = document.getElementById(`sideSub_${t}`);
    if (subEl) subEl.classList.toggle('active', t === currentBusinessTab);
    const pill = document.getElementById(`bizPill_${t}`);
    if (pill) pill.classList.toggle('active', t === currentBusinessTab);
  });

  // 비즈니스 설정 카드 표시 제어
  const diagLinkCard = document.getElementById('bizDiagLinksCard');
  if (diagLinkCard) {
    diagLinkCard.style.display = 'block';
  }

  // 상단 브레드크럼 동기화 (03. 웰라이프 탭이 활성화된 경우)
  const bizPanel = document.getElementById('tabBusinessMaster');
  const breadcrumbTabBadge = document.getElementById('headerCurrentTabBadge');
  if (bizPanel && bizPanel.classList.contains('active') && breadcrumbTabBadge) {
    const bizNames = {
      beauty: '<span>💄</span> 03. 웰라이프 > 3-1. 뷰티케어 (180분)',
      wardrobe: '<span>👗</span> 03. 웰라이프 > 3-2. 옷장 &amp; 공간 비움',
      legacy: '<span>📦</span> 03. 웰라이프 > 3-3. 유품 &amp; 짐 아카이빙',
      party: '<span>💌</span> 03. 웰라이프 > 3-4. 생전 엔딩 파티'
    };
    if (bizNames[currentBusinessTab]) {
      breadcrumbTabBadge.innerHTML = bizNames[currentBusinessTab];
    }
  }

  renderBusinessMasterDashboard();
}

// 4. 파이프라인 단계 전환 (전체, ①코치배정(step2), ②현장케어(step3), ③CRM리텐션(step4))
function switchPipelineStep(step) {
  currentPipelineStep = (step === 'step1') ? 'step2' : (step || 'all');
  currentSubFilter = 'all';

  const steps = ['all', 'step2', 'step3', 'step4'];
  steps.forEach(s => {
    const btn = document.getElementById(`pipelineStepBtn_${s}`);
    if (btn) btn.classList.toggle('active', s === currentPipelineStep);
  });

  // 상단 3대 KPI 카드 하이라이트 동기화
  const cardSteps = ['step2', 'step3', 'step4'];
  cardSteps.forEach(s => {
    const card = document.getElementById(`bizKpiCard_${s}`);
    if (card) card.classList.toggle('active', currentPipelineStep === s);
  });

  renderBusinessMasterDashboard();
}

// 4-1. 단계 내부 세부 필터 전환
function switchSubFilter(filterVal) {
  currentSubFilter = filterVal;
  renderBusinessMasterDashboard();
}

// 4-2. 파이프라인 버튼 텍스트 및 실시간 건수 뱃지 갱신 (3단계 실행 파이프라인)
function updatePipelineStepButtons(counts, bizType) {
  const btnAll = document.getElementById('pipelineStepBtn_all');
  const btnStep2 = document.getElementById('pipelineStepBtn_step2');
  const btnStep3 = document.getElementById('pipelineStepBtn_step3');
  const btnStep4 = document.getElementById('pipelineStepBtn_step4');

  if (btnAll) btnAll.innerHTML = `전체보기 <span class="pipeline-step-badge">${counts.all}</span>`;
  if (btnStep2) btnStep2.innerHTML = `① 코치 배정 <span class="pipeline-step-badge">${counts.step2}</span>`;
  if (btnStep3) {
    btnStep3.innerHTML = (bizType === 'beauty')
      ? `② 현장케어/일지 <span class="pipeline-step-badge">${counts.step3}</span>`
      : `② 현장진행 <span class="pipeline-step-badge">${counts.step3}</span>`;
  }
  if (btnStep4) {
    btnStep4.innerHTML = (bizType === 'beauty')
      ? `③ CRM 사후 리텐션 <span class="pipeline-step-badge">${counts.step4}</span>`
      : `③ CRM 사후관리 <span class="pipeline-step-badge">${counts.step4}</span>`;
  }

  // 상단 KPI 카드 클래스 동기화
  const cardSteps = ['step2', 'step3', 'step4'];
  cardSteps.forEach(s => {
    const card = document.getElementById(`bizKpiCard_${s}`);
    if (card) card.classList.toggle('active', currentPipelineStep === s);
  });
}

// 4-3. 단계 판별 헬퍼 (step1은 통합 상담함 전용 미확정 리드, step2~step4가 웰라이프 실행 단계)
function resolveItemStep(item) {
  if (!item) return 'step1';
  if (item.completedAt || item.status === '케어완료' || item.status === '완료') {
    return 'step4';
  }
  if (item.status === '진행중' || item.status === '현장진행' || item.status === '출동대기' || item.status === '검수대기') {
    return 'step3';
  }
  if (item.status === '코치배정' || item.status === '배정대기' || item.status === '조율중' || item.status === '배정보류' || item.status === '배정완료' || item.status === '상담완료') {
    return 'step2';
  }
  return 'step1';
}

// 5. 비즈니스 메타 정의 (상담 완료 이후 3단계 실행 파이프라인)
const BIZ_META = {
  beauty: {
    icon: '💄',
    name: '1호 시니어 뷰티 라이프케어',
    desc: '‘특별한 날, 화려한 외출’ 상담 확정 고객 대상 180분 표준 프로토콜(SOP) 코치 배정·현장 케어·사후 리텐션 관리',
    badge: '180분 SOP 시그니처',
    themeColor: '#b83354',
    bgLight: '#fff0f3',
    borderColor: '#f8c8d2',
    step2Title: '🤝 1단계: 공인 라이프 코치 배정 & 일정 매칭 (상담완료 이관)',
    step2Desc: '통합 상담함에서 상담이 완료·확정된 고객에게 1:1 전담 라이프 코치를 지정하고 방문 일정을 확정합니다. 배정 완료 시 [② 현장 케어] 단계로 이관됩니다.',
    step3Title: '📸 2단계: 180분 현장 케어 실행 & 실시간 안심 관제',
    step3Desc: '배정된 코치가 현장에서 180분 표준 프로토콜(SOP)을 실행 중입니다. 현장 사진 3종 및 코칭 진단 일지를 검수하고 승인합니다.',
    step4Title: '🔄 3단계: CRM 사후관리 & 선순환 리텐션 루프',
    step4Desc: '케어가 완료된 고객을 위한 전용 관리 공간입니다. 3개월 무료 재진단 알림톡 및 6개월 AGAIN180 감사 할인 쿠폰을 발송하고, 재이용 희망 시 통합 상담함으로 재상담을 등록합니다.'
  },
  wardrobe: {
    icon: '👗',
    name: '2호 일상과 비움의 미학',
    desc: '상담 확정 고객의 옷장·주거 공간 정돈 및 인체공학적 동선 수납 코칭 실행 관제',
    badge: '공간 리셋 & 수납',
    themeColor: '#2b7a4b',
    bgLight: '#edf7f1',
    borderColor: '#c6e7d2',
    step2Title: '🤝 1단계: 공간 정리 수석 코치 배정 (상담완료 이관)',
    step2Desc: '상담이 완료된 고객에게 공간 정리 및 비움 전문 코치를 매칭하고 방문 일정을 확정합니다.',
    step3Title: '📸 2단계: 현장 공간 리셋 & 수납 동선 비움 진행',
    step3Desc: '현장 방문 수납 컨설팅 및 공간 비움 작업을 진행하고 전후 사진을 검수합니다.',
    step4Title: '🔄 3단계: 정기 공간 유지 점검 & 사후관리',
    step4Desc: '계절별 옷장 점검 및 정기 공간 유지보수 케어를 제공합니다.'
  },
  legacy: {
    icon: '📦',
    name: '3호 기억의 계승',
    desc: '상담 확정 고객의 오래된 짐과 소장품을 의미 있는 유품으로 정돈·아카이빙하는 안심 동행',
    badge: '유품 아카이빙',
    themeColor: '#9a6528',
    bgLight: '#fdf6ed',
    borderColor: '#ebd2b2',
    step2Title: '🤝 1단계: 유품 아카이빙 전문 코치 배정 (상담완료 이관)',
    step2Desc: '상담이 완료된 고객의 소장품 선별과 기록을 전담할 전문 코치를 배정하고 방문 일정을 조율합니다.',
    step3Title: '📸 2단계: 현장 소장품 선별 & 디지털 아카이빙',
    step3Desc: '현장에서 소장품을 선별하고 유품 도록 제작용 사진 촬영 및 기록을 진행합니다.',
    step4Title: '🔄 3단계: 유품 도록 보관 & 가족 감사 사후관리',
    step4Desc: '제작된 유품 도록 양장본 전달 및 후대 계승 아카이빙을 영구 관리합니다.'
  },
  party: {
    icon: '💌',
    name: '4호 아름다운 마침표와 감사',
    desc: '상담 확정 고객의 생전 엔딩 파티 기획·연출·기념 기록 실행 관제',
    badge: '생전 엔딩 파티',
    themeColor: '#7a3594',
    bgLight: '#f9f0fd',
    borderColor: '#e7c7f7',
    step2Title: '🤝 1단계: 파티 디렉터 및 라이프 코치 배정 (상담완료 이관)',
    step2Desc: '상담이 완료된 고객의 파티 식순과 공간 연출을 총괄할 전담 디렉터를 배정합니다.',
    step3Title: '📸 2단계: 엔딩 파티 현장 실행 & 감사 회고 진행',
    step3Desc: '감사 영상 상영, 회고 편지 낭독, 축하 연회를 현장에서 감동적으로 연출합니다.',
    step4Title: '🔄 3단계: 파티 기념 앨범 전달 & 가족 안심 사후관리',
    step4Desc: '파티 기념 포토북 전달 및 가족들과의 감동적인 사후 서사를 영구 보관합니다.'
  }
};

// 6. 비즈니스 마스터 대시보드 메인 렌더링 함수
function renderBusinessMasterDashboard() {
  const meta = BIZ_META[currentBusinessTab] || BIZ_META.beauty;

  // 헤더 정보 & 테마 컬러 업데이트 (중복 아이콘 제거)
  const iconEl = document.getElementById('currentBizIcon');
  const titleEl = document.getElementById('currentBizTitle');
  const descEl = document.getElementById('currentBizDesc');
  const badgeEl = document.getElementById('currentBizBadge');
  const mainCard = document.getElementById('bizMainPanelCard');
  if (iconEl) iconEl.textContent = meta.icon;
  if (titleEl) titleEl.textContent = meta.name;
  if (descEl) descEl.textContent = meta.desc;
  if (mainCard) mainCard.style.borderTopColor = meta.themeColor;
  if (badgeEl) {
    badgeEl.textContent = meta.badge;
    badgeEl.style.color = meta.themeColor;
    badgeEl.style.background = meta.bgLight;
    badgeEl.style.borderColor = meta.themeColor;
  }

  // 통합 고객 접수·상담함에서 '완료' 확정된 건만 최신 동기화 후 렌더링
  const completedMap = syncCompletedConsultsIntoWellness();

  if (currentBusinessTab === 'beauty') {
    const beautyList = getStoredBeautyBookings();
    renderBeautyPipeline(beautyList, meta, completedMap);
  } else {
    const generalConsults = getStoredGeneralConsults();
    renderGeneralBusinessPipeline(currentBusinessTab, generalConsults, meta, completedMap);
  }
}

// 7. 🌟 뷰티 라이프케어 3단계 실행 파이프라인 렌더링 (통합 상담함 '완료' 건만 엄격 표시)
function renderBeautyPipeline(list, meta, completedMap) {
  const validMap = completedMap || getCompletedConsultMap();
  // 오직 통합 고객 접수·상담함에서 '완료' 확정되어 이관된 고객만 표시
  const confirmedList = list.filter(i =>
    i && i.sourceConsultId && validMap.has(i.sourceConsultId) && resolveItemStep(i) !== 'step1'
  );
  const total = confirmedList.length;
  const step2List = confirmedList.filter(i => resolveItemStep(i) === 'step2');
  const step3List = confirmedList.filter(i => resolveItemStep(i) === 'step3');
  const step4List = confirmedList.filter(i => resolveItemStep(i) === 'step4');

  const step2Count = step2List.length;
  const step3Count = step3List.length;
  const step4Count = step4List.length;

  // 상단 3대 KPI 카드 숫자 업데이트
  const kpi2 = document.getElementById('bizKpi_assigned');
  const kpi3 = document.getElementById('bizKpi_done');
  const kpi4 = document.getElementById('bizKpi_retention');
  if (kpi2) kpi2.textContent = `${step2Count}건`;
  if (kpi3) kpi3.textContent = `${step3Count}건`;
  if (kpi4) kpi4.textContent = `${step4Count}건`;

  updatePipelineStepButtons({
    all: total,
    step2: step2Count,
    step3: step3Count,
    step4: step4Count
  }, 'beauty');

  const viewLabel = document.getElementById('bizCurrentViewLabel');
  if (viewLabel) {
    viewLabel.innerHTML = currentPipelineStep === 'all'
      ? `통합 고객 접수·상담함에서 <strong>[✓ 상담 완료]</strong> 확정된 건만 표시됩니다. (위 카드 클릭 시 단계별 필터)`
      : `현재 필터: <strong style="color:${meta.themeColor};">${getStepBadgeText(currentPipelineStep)}</strong> (전체보기 클릭 시 해제)`;
  }

  const beautyWrap = document.getElementById('beautyPipelineWrap');
  const generalWrap = document.getElementById('generalBusinessWrap');
  if (beautyWrap) beautyWrap.style.display = 'block';
  if (generalWrap) generalWrap.style.display = 'none';

  // 현재 파이프라인 단계에 따른 전용 화면 HTML 생성 및 주입 (중복 배너·이중 카드 제거)
  if (beautyWrap) {
    beautyWrap.innerHTML = generateBeautyStepViewHtml(confirmedList, currentPipelineStep, meta, {
      all: total,
      step2: step2Count,
      step3: step3Count,
      step4: step4Count
    });
  }
}

// 7-1. 뷰티 단계별 전용 HTML 생성기 (중복 배너 제거 → 바로 본문 테이블 표시)
function generateBeautyStepViewHtml(list, step, meta, counts) {
  if (step === 'step2' || step === 'step1') {
    return generateStep2BeautyView(list, meta);
  } else if (step === 'step3') {
    return generateStep3BeautyView(list, meta);
  } else if (step === 'step4') {
    return generateStep4BeautyView(list, meta);
  }
  return generateStepAllBeautyView(list, meta, counts);
}

// 06. 코치 아카데미 > 6-2 공인 코칭스태프 명단에 등재된 활동 코치만 엄격 조회
function getCertifiedAssignableCoaches() {
  if (typeof window.getAssignableCoaches === 'function') {
    return window.getAssignableCoaches();
  }
  try {
    const saved = localStorage.getItem('yebaek_certified_coaches_v1');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter(c => c && c.name && c.status !== '휴식중');
      }
    }
  } catch (e) {}
  return [];
}

function buildCertifiedCoachSelectHtml(currentCoach, onChangeExpr) {
  const coaches = getCertifiedAssignableCoaches();
  const cleanCur = String(currentCoach || '').replace(/\s+|코치$/g, '');
  if (coaches.length === 0) {
    return `
      <select class="setting-input" style="padding:4px 8px; font-size:0.8rem; font-weight:750; color:#b91c1c; background:#fef2f2; border-color:#fecaca;" onchange="${onChangeExpr}">
        <option value="미배정" selected>-- 등재된 공인 코치 없음 --</option>
      </select>
      <div style="margin-top:3px;">
        <button type="button" onclick="if(typeof selectCoachSubFromSidebar==='function') selectCoachSubFromSidebar('academy');" style="background:none; border:none; padding:0; font-size:0.72rem; color:#245b8e; font-weight:800; cursor:pointer; text-decoration:underline;">
          🎓 06. 아카데미 수료·코치등재 필요 ➔
        </button>
      </div>
    `;
  }
  const optionsHtml = coaches.map(c => {
    const labelName = c.name.endsWith('코치') ? c.name : `${c.name} 코치`;
    const cleanSpec = String(c.specialty || '').replace(/^[^\s]+\s+/, '');
    const isSel = cleanCur && (c.name.replace(/\s+|코치$/g, '') === cleanCur || String(currentCoach || '').includes(c.name));
    return `<option value="${escapeHtml(labelName)}" ${isSel ? 'selected' : ''}>${escapeHtml(labelName)}${cleanSpec ? ' (' + escapeHtml(cleanSpec) + ')' : ''}</option>`;
  }).join('');
  return `
    <select class="setting-input" style="padding:4px 8px; font-size:0.84rem; font-weight:750;" onchange="${onChangeExpr}">
      <option value="미배정" ${!cleanCur || cleanCur === '미배정' ? 'selected' : ''}>-- 공인 코치 선택 --</option>
      ${optionsHtml}
    </select>
    <div style="font-size:0.71rem; color:var(--text-muted); margin-top:2px;">🏅 아카데미 공인 등재 코치 ${coaches.length}명</div>
  `;
}

// 7-2. [1단계: 코치 배정 & 매칭 화면 (상담완료 이관 건)] 생성기
function generateStep2BeautyView(list, meta) {
  let stepItems = list.filter(i => resolveItemStep(i) === 'step2');

  if (currentSubFilter !== 'all') {
    stepItems = stepItems.filter(i => i.status === currentSubFilter);
  }

  const cntAll = list.filter(i => resolveItemStep(i) === 'step2').length;
  const cntWait = list.filter(i => resolveItemStep(i) === 'step2' && (i.status === '코치배정' || i.status === '배정대기' || i.status === '상담완료')).length;
  const cntTune = list.filter(i => resolveItemStep(i) === 'step2' && i.status === '조율중').length;
  const cntDone = list.filter(i => resolveItemStep(i) === 'step2' && i.status === '배정완료').length;

  return `
    <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 12px; flex-wrap: wrap;">
      <span style="font-size: 0.82rem; font-weight: 800; color: var(--text-muted);">배정 상태 필터:</span>
      <button type="button" class="pipeline-step-btn ${currentSubFilter === 'all' ? 'active' : ''}" onclick="switchSubFilter('all')" style="padding: 4px 12px; font-size: 0.8rem;">
        전체 (${cntAll})
      </button>
      <button type="button" class="pipeline-step-btn ${currentSubFilter === '코치배정' || currentSubFilter === '배정대기' ? 'active' : ''}" onclick="switchSubFilter('코치배정')" style="padding: 4px 12px; font-size: 0.8rem;">
        ⏳ 배정대기 (${cntWait})
      </button>
      <button type="button" class="pipeline-step-btn ${currentSubFilter === '조율중' ? 'active' : ''}" onclick="switchSubFilter('조율중')" style="padding: 4px 12px; font-size: 0.8rem;">
        🔄 일정조율중 (${cntTune})
      </button>
      <button type="button" class="pipeline-step-btn ${currentSubFilter === '배정완료' ? 'active' : ''}" onclick="switchSubFilter('배정완료')" style="padding: 4px 12px; font-size: 0.8rem;">
        ✅ 배정완료 (${cntDone})
      </button>
    </div>

    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th style="width: 105px;">예약 ID</th>
            <th style="width: 130px;">고객 / 어르신</th>
            <th style="width: 120px;">연락처</th>
            <th>확정 일시 &amp; 장소</th>
            <th style="width: 185px;">통합상담함 인수인계 메모</th>
            <th style="width: 160px;">담당 전담 코치 지정</th>
            <th style="width: 110px; text-align: center;">배정 상태</th>
            <th style="width: 170px; text-align: center;">코치 배정 및 현장 이관</th>
          </tr>
        </thead>
        <tbody>
          ${stepItems.length === 0 ? `
            <tr><td colspan="8" style="text-align:center; padding:36px; color:var(--text-muted);">
              현재 코치 배정 대기 중인 상담완료 건이 없습니다.<br>
              <span style="font-size:0.8rem;">[통합 고객 접수 · 상담]에서 상담을 <strong>완료</strong> 처리하면 이곳으로 자동 이관됩니다.</span>
            </td></tr>
          ` : stepItems.map(item => {
            const coach = item.assignedCoach || '미배정';
            return `
              <tr>
                <td><strong style="color: #0284c7;">${escapeHtml(item.id)}</strong></td>
                <td>
                  <strong>${escapeHtml(item.seniorName)}</strong>
                  <div style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(item.applicantName)} (${escapeHtml(item.role || '신청인')})</div>
                </td>
                <td>
                  <a href="tel:${escapeHtml(item.phone)}" style="color:var(--accent); font-weight:750;">${escapeHtml(item.phone)}</a>
                </td>
                <td>
                  <span style="font-weight:750; color:#0284c7;">${escapeHtml((item.visitDate || '일정 협의').replace('T', ' '))}</span>
                  <div style="font-size:0.78rem; color:var(--text-muted);">${escapeHtml(item.address || item.place || '')}</div>
                </td>
                <td>
                  <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:6px; padding:6px; font-size:0.78rem; color:#0369a1;">
                    ${escapeHtml(item.consultNote || item.memo || '상담 완료 후 이관됨')}
                  </div>
                </td>
                <td>
                  ${buildCertifiedCoachSelectHtml(coach, `assignBeautyCoach('${item.id}', this.value)`)}
                </td>
                <td style="text-align: center;">
                  <select class="setting-input" style="padding:4px 6px; font-size:0.82rem; font-weight:800; color:#0284c7;" onchange="updateStep2Status('${item.id}', this.value, 'beauty')">
                    <option value="코치배정" ${item.status === '코치배정' || item.status === '배정대기' || item.status === '상담완료' ? 'selected' : ''}>⏳ 배정대기</option>
                    <option value="조율중" ${item.status === '조율중' ? 'selected' : ''}>🔄 일정조율</option>
                    <option value="배정완료" ${item.status === '배정완료' ? 'selected' : ''}>✅ 배정완료</option>
                  </select>
                </td>
                <td style="text-align: center; white-space: nowrap;">
                  <div style="display: flex; flex-direction: column; gap: 4px; align-items: center;">
                    <button type="button" class="btn-save-setting" onclick="dispatchAndNotifyBeauty('${item.id}')" style="padding: 5px 10px; font-size: 0.78rem; background: #1e4d35; color: #fff; border: none; font-weight: 850; box-shadow: 0 2px 6px rgba(30,77,53,0.28); border-radius: 6px; width: 100%;" title="선택한 코치로 공식 배정 등록 + 코치앱 카카오톡 알림 발송 후 ② 현장케어 단계로 자동 이관합니다">
                      <span>💬</span> 배정확정 · 카톡알림 ➔
                    </button>
                    <div style="display: flex; gap: 4px; width: 100%;">
                      <button type="button" class="btn-save-setting" onclick="openDispatchFromBeauty('${item.id}')" style="flex:1; padding:3px 6px; font-size:0.73rem; background:#fff7ed; color:#c2410c; border:1px solid #fdba74; font-weight:800;" title="방문일시·주소·활동비 세부 입력 후 배정합니다">
                        <span>⚙️</span> 상세배정
                      </button>
                      <button type="button" onclick="returnToConsultInbox('${item.id}', 'beauty')" style="padding:3px 6px; font-size:0.73rem; background:#fff; color:var(--text-muted); border:1px solid #d1d5db; border-radius:4px; cursor:pointer;" title="추가 상담 필요 시 통합 고객 접수·상담함으로 돌려보냅니다">
                        ↩️ 재상담
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// 7-4. [3단계: 현장 케어 / 일지 화면] 생성기
function generateStep3BeautyView(list, meta) {
  let stepItems = list.filter(i => resolveItemStep(i) === 'step3');

  if (currentSubFilter !== 'all') {
    stepItems = stepItems.filter(i => i.status === currentSubFilter);
  }

  const cntAll = list.filter(i => resolveItemStep(i) === 'step3').length;
  const cntIng = list.filter(i => resolveItemStep(i) === 'step3' && (i.status === '진행중' || i.status === '현장진행')).length;
  const cntWaitLog = list.filter(i => resolveItemStep(i) === 'step3' && i.status === '검수대기').length;

  return `
    <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 12px; flex-wrap: wrap;">
      <span style="font-size: 0.82rem; font-weight: 800; color: var(--text-muted);">현장 상태 필터:</span>
      <button type="button" class="pipeline-step-btn ${currentSubFilter === 'all' ? 'active' : ''}" onclick="switchSubFilter('all')" style="padding: 4px 12px; font-size: 0.8rem;">
        전체 (${cntAll})
      </button>
      <button type="button" class="pipeline-step-btn ${currentSubFilter === '진행중' || currentSubFilter === '현장진행' ? 'active' : ''}" onclick="switchSubFilter('진행중')" style="padding: 4px 12px; font-size: 0.8rem;">
        🏃 현장 케어 진행중 (${cntIng})
      </button>
      <button type="button" class="pipeline-step-btn ${currentSubFilter === '검수대기' ? 'active' : ''}" onclick="switchSubFilter('검수대기')" style="padding: 4px 12px; font-size: 0.8rem;">
        📋 일지/사진 검수대기 (${cntWaitLog})
      </button>
    </div>

    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th style="width: 105px;">케어 ID</th>
            <th style="width: 130px;">대상 어르신 &amp; 보호자</th>
            <th style="width: 130px;">담당 코치</th>
            <th>방문 일시 &amp; 장소</th>
            <th style="width: 150px; text-align: center;">180분 SOP 진행률</th>
            <th style="width: 100px; text-align: center;">현장 사진 검수</th>
            <th style="width: 180px;">180분 진단 일지 요약</th>
            <th style="width: 165px; text-align: center;">현장 검수 &amp; CRM 이관</th>
          </tr>
        </thead>
        <tbody>
          ${stepItems.length === 0 ? `
            <tr><td colspan="8" style="text-align:center; padding:36px; color:var(--text-muted);">
              해당 상태의 현장 케어 진행 건이 없습니다.
            </td></tr>
          ` : stepItems.map(item => {
            const hasPhoto = !!item.photoBase64;
            const diag = item.diagnostic || {};
            return `
              <tr>
                <td><strong style="color: #2b7a4b;">${escapeHtml(item.id)}</strong></td>
                <td>
                  <strong>${escapeHtml(item.seniorName)}</strong>
                  <div style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(item.applicantName)}</div>
                </td>
                <td>
                  <strong style="color:#0284c7;">${escapeHtml(item.assignedCoach || '담당코치')}</strong>
                  <div style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(item.coachPhone || item.phone)}</div>
                </td>
                <td>
                  <span style="font-weight:750;">${escapeHtml((item.visitDate || '').replace('T', ' '))}</span>
                  <div style="font-size:0.78rem; color:var(--text-muted);">${escapeHtml(item.address || item.place || '')}</div>
                </td>
                <td style="text-align: center;">
                  <div style="font-size:0.78rem; font-weight:800; color:#2b7a4b; margin-bottom:4px;">
                    ${escapeHtml(item.sopProgress || '180분 SOP 표준 진행')}
                  </div>
                  <div style="width: 100%; background: #e5e7eb; border-radius: 999px; height: 6px; overflow: hidden;">
                    <div style="width: 85%; background: #2b7a4b; height: 100%;"></div>
                  </div>
                </td>
                <td style="text-align: center;">
                  ${hasPhoto ? `
                    <span class="badge" style="background:#ecfdf5; color:#047857; border:1px solid #a7f3d0; font-size:0.76rem; font-weight:850; padding:2px 6px;">
                      📸 3종 검수완료
                    </span>
                  ` : `
                    <span class="badge" style="background:#fff7ed; color:#c2410c; border:1px solid #fdba74; font-size:0.76rem; padding:2px 6px;">
                      현장 등록 대기
                    </span>
                  `}
                </td>
                <td>
                  ${diag.moistureBefore ? `
                    <div style="font-size:0.76rem; color:#374151; line-height:1.45;">
                      <div>💧 수분: <strong>${diag.moistureBefore}% ➔ ${diag.moistureAfter}%</strong></div>
                      <div>✨ 탄력: ${diag.elasticityAfter || '우수'}</div>
                      <div style="color:var(--text-muted); font-size:0.72rem; margin-top:2px;">👗 ${escapeHtml(diag.wardrobe || '')}</div>
                    </div>
                  ` : `
                    <span style="font-size:0.78rem; color:var(--text-muted);">현장 일지 작성 대기</span>
                  `}
                </td>
                <td style="text-align: center; white-space: nowrap;">
                  <div style="display: flex; flex-direction: column; gap: 4px; align-items: center;">
                    <button type="button" class="btn-save-setting" onclick="openLinkedReportOrCockpit('${escapeHtml(item.linkedDispatchId || '')}', '${escapeHtml(item.seniorName)}')" style="padding: 5px 10px; font-size: 0.78rem; background: ${item.status === '검수대기' ? '#b83354' : '#245b8e'}; color: #fff; border: none; font-weight: 850; box-shadow: 0 2px 6px rgba(36,91,142,0.25); border-radius: 6px; width: 100%;" title="현장 업무카드 확인 및 통합관제 송금·비즈니스완료 처리를 진행합니다">
                      <span>${item.status === '검수대기' ? '⚡' : '🏁'}</span> ${item.status === '검수대기' ? '통합관제 송금·마감 ➔' : '업무카드 · 송금마감'}
                    </button>
                    <div style="display: flex; gap: 4px; width: 100%;">
                      <button type="button" class="btn-save-setting" onclick="openBeautyCoachingModal('${item.id}')" style="flex:1; padding:3px 6px; font-size:0.73rem; background:#fee7ec; color:#b83354; border:1px solid #f8c8d2; font-weight:800;" title="180분 현장 코칭일지 작성/수정">
                        📝 일지
                      </button>
                      <button type="button" class="btn-save-setting" onclick="transferStep3ToStep4('${item.id}', 'beauty')" style="flex:1; padding:3px 6px; font-size:0.73rem; background:#faf5ff; color:#7c3aed; border:1px solid #e9d5ff; font-weight:800;" title="수동으로 케어완료(CRM 이관) 처리합니다">
                        🎉 CRM완료
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// 7-5. [4단계: CRM 사후관리 & 선순환 리텐션 루프 화면] 생성기
function generateStep4BeautyView(list, meta) {
  let stepItems = list.filter(i => resolveItemStep(i) === 'step4');

  const cntTotal = stepItems.length;
  const cnt3mDue = stepItems.filter(i => !i.retentionSent3m).length;
  const cnt6mDue = stepItems.filter(i => !i.retentionSent6m).length;

  return `
    <!-- 슬림 리텐션 요약 스트립 (중복 KPI 카드 제거) -->
    <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-bottom: 12px; font-size: 0.8rem; font-weight: 800;">
      <span style="background:#f0fdf4; color:#15803d; border:1px solid #bbf7d0; padding:4px 10px; border-radius:999px;">✉️ 3개월 무료 재진단 대기 ${cnt3mDue}건</span>
      <span style="background:#fff1f2; color:#be123c; border:1px solid #fecdd3; padding:4px 10px; border-radius:999px;">🎁 6개월 AGAIN180 쿠폰 대기 ${cnt6mDue}건</span>
    </div>

    <!-- 3단계 전용 리텐션 테이블 -->
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th style="width: 105px;">예약 ID</th>
            <th style="width: 130px;">어르신 성함 &amp; 신청인</th>
            <th style="width: 110px;">케어 완료일</th>
            <th style="width: 120px;">담당 코치 &amp; 평점</th>
            <th style="width: 140px;">3개월 무료 재진단</th>
            <th style="width: 140px;">6개월 AGAIN180 쿠폰</th>
            <th>사후관리 &amp; 리텐션 메모</th>
            <th style="width: 175px; text-align: center;">선순환 액션 (알림 &amp; 재상담)</th>
          </tr>
        </thead>
        <tbody>
          ${stepItems.length === 0 ? `
            <tr><td colspan="8" style="text-align:center; padding:36px; color:var(--text-muted);">
              케어 완료 후 리텐션 대상 고객 건이 없습니다.
            </td></tr>
          ` : stepItems.map(item => {
            const compDate = item.completedAt ? new Date(item.completedAt) : new Date();
            const d3 = new Date(compDate); d3.setMonth(d3.getMonth() + 3);
            const d6 = new Date(compDate); d6.setMonth(d6.getMonth() + 6);
            const fmt = (d) => `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
            const diag = item.diagnostic || {};

            return `
              <tr>
                <td><strong style="color: #7c3aed;">${escapeHtml(item.id)}</strong></td>
                <td>
                  <strong>${escapeHtml(item.seniorName)}</strong>
                  <div style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(item.applicantName)}</div>
                </td>
                <td>
                  <span style="font-weight:750;">${fmt(compDate)}</span>
                  <div style="font-size:0.72rem; color:var(--text-muted);">정상 완료</div>
                </td>
                <td>
                  <div style="font-size:0.8rem; font-weight:750;">${escapeHtml(item.assignedCoach || '담당코치')}</div>
                  <div style="color:#eab308; font-size:0.78rem;">★★★★★ 5.0</div>
                </td>
                <td>
                  <div style="font-weight:750; color:#15803d;">${fmt(d3)}</div>
                  <div style="margin-top:2px;">
                    ${item.retentionSent3m ? `
                      <span class="badge" style="background:#dcfce7; color:#15803d; font-size:0.72rem; padding:1px 6px;">알림톡 발송완료 ✓</span>
                    ` : `
                      <span class="badge" style="background:#fee2e2; color:#b91c1c; font-size:0.72rem; padding:1px 6px;">발송 대상</span>
                    `}
                  </div>
                </td>
                <td>
                  <div style="font-weight:750; color:#be123c;">${fmt(d6)}</div>
                  <div style="margin-top:2px;">
                    ${item.retentionSent6m ? `
                      <span class="badge" style="background:#dcfce7; color:#15803d; font-size:0.72rem; padding:1px 6px;">쿠폰발급 완료 ✓</span>
                    ` : `
                      <span class="badge" style="background:#fef3c7; color:#b45309; font-size:0.72rem; padding:1px 6px;">AGAIN180 활성</span>
                    `}
                  </div>
                </td>
                <td>
                  <div style="font-size:0.78rem; color:#374151; line-height:1.45;">
                    ${escapeHtml(diag.endingNote || item.retentionNote || '정기 케어 대상')}
                  </div>
                </td>
                <td style="text-align: center; white-space: nowrap;">
                  <div style="display: flex; flex-direction: column; gap: 4px; align-items: center;">
                    <button type="button" class="btn-save-setting" onclick="reOrderFromRetention('${item.id}', 'beauty')" style="padding: 5px 10px; font-size: 0.8rem; background: #b83354; color: #fff; border: none; font-weight: 850; box-shadow: 0 2px 6px rgba(184,51,84,0.3); border-radius: 6px; width: 100%;" title="이 고객을 위한 180분 정기 케어 신규 재상담을 통합 고객 접수·상담함에 등록합니다">
                      <span>🔄</span> 통합상담함 재상담 접수
                    </button>
                    <div style="display: flex; gap: 4px; width: 100%;">
                      <button type="button" onclick="sendRetentionAlert('${item.id}', '3m', 'beauty')" style="flex:1; padding:3px 6px; font-size:0.74rem; background:#ecfdf5; color:#047857; border:1px solid #a7f3d0; border-radius:4px; font-weight:800; cursor:pointer;" title="3개월 차 무료 재진단 알림톡 발송">
                        ✉️ 재진단톡
                      </button>
                      <button type="button" onclick="sendRetentionAlert('${item.id}', '6m', 'beauty')" style="flex:1; padding:3px 6px; font-size:0.74rem; background:#fff1f2; color:#be123c; border:1px solid #fecdd3; border-radius:4px; font-weight:800; cursor:pointer;" title="6개월 차 AGAIN180 감사 할인 쿠폰 발송">
                        🎁 AGAIN쿠폰
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// 7-5. [전체보기: 상담완료 이관 고객 테이블] 생성기 (중복 요약 카드·이중 제목 완전 제거)
function generateStepAllBeautyView(list, meta, counts) {
  return `
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th style="width: 105px;">예약 ID</th>
            <th style="width: 105px; text-align: center;">현재 단계</th>
            <th style="width: 130px;">신청인 (관계)</th>
            <th style="width: 130px;">대상 어르신</th>
            <th style="width: 120px;">연락처</th>
            <th>확정 일시 &amp; 장소</th>
            <th style="width: 140px;">배정 코치</th>
            <th style="width: 100px; text-align: center;">처리 상태</th>
            <th style="width: 135px; text-align: center;">단계 관리</th>
          </tr>
        </thead>
        <tbody>
          ${list.length === 0 ? `
            <tr><td colspan="9" style="text-align:center; padding:42px 20px; color:var(--text-muted);">
              <div style="font-weight:800; color:var(--text-main); margin-bottom:6px;">통합 고객 접수·상담함에서 [✓ 상담 완료] 확정된 뷰티 고객이 아직 없습니다.</div>
              <div style="font-size:0.82rem; margin-bottom:12px;">통합 상담함에서 뷰티 상담 건의 상태를 <strong>[✓ 상담 완료]</strong>로 변경하면 이곳으로 자동 이관됩니다.</div>
              <button type="button" onclick="switchTab('tabConsult')" class="btn-save-setting" style="background:var(--accent); color:#fff; border:none; padding:7px 14px; font-size:0.82rem; font-weight:800; border-radius:8px; cursor:pointer;">
                📋 통합 고객 접수·상담함으로 이동 ➔
              </button>
            </td></tr>
          ` : list.map(item => {
            const stepId = resolveItemStep(item);
            const stepBadge = getStepBadgeHtml(stepId);
            return `
              <tr>
                <td><strong style="color: ${meta.themeColor};">${escapeHtml(item.id)}</strong></td>
                <td style="text-align: center;">${stepBadge}</td>
                <td>
                  <strong>${escapeHtml(item.applicantName)}</strong>
                  <div style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(item.role)}</div>
                </td>
                <td><strong>${escapeHtml(item.seniorName)}</strong></td>
                <td>
                  <a href="tel:${escapeHtml(item.phone)}" style="color:var(--accent); font-weight:750;">${escapeHtml(item.phone)}</a>
                </td>
                <td>
                  <span style="font-weight:750;">${escapeHtml((item.visitDate || '일정 협의').replace('T', ' '))}</span>
                  <div style="font-size:0.78rem; color:var(--text-muted);">${escapeHtml(item.place)} - ${escapeHtml(item.address || '')}</div>
                </td>
                <td>
                  <strong style="color: #0284c7; font-size:0.84rem;">${escapeHtml(item.assignedCoach || '미배정')}</strong>
                </td>
                <td style="text-align: center;">
                  <span class="badge" style="background:#f3f4f6; color:#1f2937; font-weight:800; font-size:0.78rem; padding:3px 8px;">
                    ${escapeHtml(item.status)}
                  </span>
                </td>
                <td style="text-align: center; white-space: nowrap;">
                  <button type="button" class="btn-save-setting" onclick="switchPipelineStep('${stepId}')" style="padding: 4px 10px; font-size: 0.78rem; background: #fff; border: 1.5px solid var(--border-color); color: var(--text-primary); font-weight: 800; border-radius: 6px; cursor:pointer;">
                    단계 처리 ➔
                  </button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// 8. 🌟 기타 웰라이프 비즈니스(2호 옷장 / 3호 유품 / 4호 엔딩파티) 3단계 실행 파이프라인 렌더링 (통합 상담함 '완료' 건만 엄격 표시)
function renderGeneralBusinessPipeline(biz, consults, meta, completedMap) {
  const validMap = completedMap || getCompletedConsultMap();
  const beautyWrap = document.getElementById('beautyPipelineWrap');
  const generalWrap = document.getElementById('generalBusinessWrap');
  if (beautyWrap) beautyWrap.style.display = 'none';
  if (generalWrap) generalWrap.style.display = 'block';

  const BIZ_KEYS = {
    wardrobe: ['옷장', '수납', '공간', 'wardrobe'],
    legacy: ['유품', '오래된', '짐', 'legacy', '생전정리'],
    party: ['엔딩', '파티', 'party', '마침표']
  };

  const keys = BIZ_KEYS[biz] || [];
  // 오직 통합 고객 접수·상담함에서 '완료' 확정되어 이관된 고객만 표시
  const list = consults.filter(c => {
    if (!c || !c.sourceConsultId || !validMap.has(c.sourceConsultId)) return false;
    if (resolveItemStep(c) === 'step1') return false;
    if (c.bizType && c.bizType === biz) return true;
    const text = (c.category || '') + ' ' + (c.message || '');
    return keys.some(k => text.includes(k));
  });

  const total = list.length;
  const step2List = list.filter(i => resolveItemStep(i) === 'step2');
  const step3List = list.filter(i => resolveItemStep(i) === 'step3');
  const step4List = list.filter(i => resolveItemStep(i) === 'step4');

  const step2Count = step2List.length;
  const step3Count = step3List.length;
  const step4Count = step4List.length;

  const kpi2 = document.getElementById('bizKpi_assigned');
  const kpi3 = document.getElementById('bizKpi_done');
  const kpi4 = document.getElementById('bizKpi_retention');
  if (kpi2) kpi2.textContent = `${step2Count}건`;
  if (kpi3) kpi3.textContent = `${step3Count}건`;
  if (kpi4) kpi4.textContent = `${step4Count}건`;

  updatePipelineStepButtons({
    all: total,
    step2: step2Count,
    step3: step3Count,
    step4: step4Count
  }, biz);

  const viewLabel = document.getElementById('bizCurrentViewLabel');
  if (viewLabel) {
    viewLabel.innerHTML = currentPipelineStep === 'all'
      ? `통합 고객 접수·상담함에서 <strong>[✓ 상담 완료]</strong> 확정된 건만 표시됩니다. (위 카드 클릭 시 단계별 필터)`
      : `현재 필터: <strong style="color:${meta.themeColor};">${getStepBadgeText(currentPipelineStep)}</strong> (전체보기 클릭 시 해제)`;
  }

  if (generalWrap) {
    generalWrap.innerHTML = generateGeneralStepViewHtml(list, currentPipelineStep, meta, biz, {
      all: total,
      step2: step2Count,
      step3: step3Count,
      step4: step4Count
    });
  }
}

// 8-1. 일반 비즈니스 3단계 실행 파이프라인 HTML 생성기 (중복 배너 제거 → 바로 본문 테이블 표시)
function generateGeneralStepViewHtml(list, step, meta, biz, counts) {
  let filtered = list;
  if (step === 'step2' || step === 'step1') {
    filtered = list.filter(i => resolveItemStep(i) === 'step2');
  } else if (step === 'step3') {
    filtered = list.filter(i => resolveItemStep(i) === 'step3');
  } else if (step === 'step4') {
    filtered = list.filter(i => resolveItemStep(i) === 'step4');
  }

  return `
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th style="width: 95px;">관리 ID</th>
            <th style="width: 105px; text-align: center;">진행 단계</th>
            <th style="width: 120px;">고객 성함 (구분)</th>
            <th style="width: 120px;">연락처</th>
            <th>상담 인수인계 내용 / 메모</th>
            <th style="width: 150px;">담당 배정 코치</th>
            <th style="width: 100px; text-align: center;">진행 상태</th>
            <th style="width: 165px; text-align: center;">단계별 액션 &amp; 이관</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.length === 0 ? `
            <tr><td colspan="8" style="text-align:center; padding:42px 20px; color:var(--text-muted);">
              <div style="font-weight:800; color:var(--text-main); margin-bottom:6px;">통합 고객 접수·상담함에서 [✓ 상담 완료] 확정된 건이 아직 없습니다.</div>
              <div style="font-size:0.82rem; margin-bottom:12px;">통합 상담함에서 상담 상태를 <strong>[✓ 상담 완료]</strong>로 변경하면 이곳으로 자동 이관됩니다.</div>
              <button type="button" onclick="switchTab('tabConsult')" class="btn-save-setting" style="background:var(--accent); color:#fff; border:none; padding:7px 14px; font-size:0.82rem; font-weight:800; border-radius:8px; cursor:pointer;">
                📋 통합 고객 접수·상담함으로 이동 ➔
              </button>
            </td></tr>
          ` : filtered.map(item => {
            const itemStep = resolveItemStep(item);
            const coach = item.assignedCoach || '미배정';
            return `
              <tr>
                <td><strong style="color: ${meta.themeColor};">${escapeHtml(item.id)}</strong></td>
                <td style="text-align: center;">${getStepBadgeHtml(itemStep)}</td>
                <td>
                  <strong>${escapeHtml(item.name)}</strong>
                  <div style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(item.role || '신청자')}</div>
                </td>
                <td>
                  <a href="tel:${escapeHtml(item.phone)}" style="color:var(--accent); font-weight:750;">${escapeHtml(item.phone)}</a>
                </td>
                <td>
                  <div style="font-size:0.86rem; color:var(--text-primary); line-height:1.45;">${escapeHtml(item.message)}</div>
                  <div style="font-size:0.75rem; color:var(--text-muted); margin-top:3px;">이관일: ${escapeHtml(item.date)}</div>
                  ${item.consultNote ? `
                    <div style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:4px; padding:4px 6px; font-size:0.76rem; color:#4b5563; margin-top:4px;">
                      📝 ${escapeHtml(item.consultNote)}
                    </div>
                  ` : ''}
                </td>
                <td>
                  ${buildCertifiedCoachSelectHtml(coach, `assignGeneralCoach('${item.id}', this.value)`)}
                </td>
                <td style="text-align: center;">
                  <span class="badge" style="background:#f3f4f6; color:#111827; font-weight:800; font-size:0.78rem; padding:3px 8px;">
                    ${escapeHtml(item.status)}
                  </span>
                </td>
                <td style="text-align: center; white-space: nowrap;">
                  ${getGeneralStepActionHtml(item, itemStep, biz)}
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// 8-2. 일반 비즈니스 단계별 액션 버튼 생성기 (3단계 실행 전용)
function getGeneralStepActionHtml(item, step, biz) {
  if (step === 'step2') {
    return `
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <button type="button" class="btn-save-setting" onclick="dispatchAndNotifyGeneral('${item.id}', '${biz}')" style="padding: 4px 8px; font-size: 0.77rem; background: #1e4d35; color: #fff; border: none; font-weight: 850; border-radius: 6px;" title="코치 배정 등록 + 코치앱 카톡 알림 발송 후 ② 현장진행으로 자동 이관합니다">
          💬 배정확정 · 카톡알림 ➔
        </button>
        <div style="display: flex; gap: 4px;">
          <button type="button" class="btn-save-setting" onclick="openDispatchFromGeneral('${item.id}', '${biz}')" style="flex:1; padding: 3px 6px; font-size: 0.73rem; background: #fff7ed; color: #c2410c; border: 1px solid #fdba74; font-weight: 800;">
            ⚙️ 상세배정
          </button>
          <button type="button" onclick="returnToConsultInbox('${item.id}', '${biz}')" style="padding: 3px 6px; font-size: 0.73rem; background: #fff; color: var(--text-muted); border: 1px solid #d1d5db; border-radius: 4px; cursor: pointer;" title="추가 상담 필요 시 통합 상담함으로 돌려보냅니다">
            ↩️ 재상담
          </button>
        </div>
      </div>
    `;
  } else if (step === 'step3') {
    return `
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <button type="button" class="btn-save-setting" onclick="openLinkedReportOrCockpit('${escapeHtml(item.linkedDispatchId || '')}', '${escapeHtml(item.name)}')" style="padding: 4px 8px; font-size: 0.77rem; background: ${item.status === '검수대기' ? '#b83354' : '#245b8e'}; color: #fff; border: none; font-weight: 850; border-radius: 6px;" title="현장 업무카드 확인 및 통합관제 송금·비즈니스완료 처리를 진행합니다">
          ${item.status === '검수대기' ? '⚡ 통합관제 송금·마감 ➔' : '🏁 업무카드 · 송금마감'}
        </button>
        <button type="button" class="btn-save-setting" onclick="transferGeneralStep3ToStep4('${item.id}')" style="padding: 3px 6px; font-size: 0.73rem; background: #faf5ff; color: #7c3aed; border: 1px solid #e9d5ff; font-weight: 800;">
          🎉 수동 CRM완료
        </button>
      </div>
    `;
  } else {
    return `
      <button type="button" class="btn-save-setting" onclick="reOrderFromGeneralRetention('${item.id}')" style="padding: 4px 8px; font-size: 0.78rem; background: var(--accent); color: #fff; border: none; font-weight: 850; border-radius: 6px; width: 100%;" title="통합 고객 접수·상담함에 신규 재상담 건을 등록합니다">
        🔄 통합상담함 재상담 접수
      </button>
    `;
  }
}

// 9. 🌟 단계 간 자동 이관(Transition) 및 통합상담함 양방향 연동 함수들

// [통합 고객 접수·상담함 ➔ 03. 웰라이프 자동 이관 API]
function handoffConsultToWellnessBusiness(consultItem, bizKey, skipRender) {
  if (!consultItem) return { ok: false };
  const targetBiz = bizKey || 'beauty';
  const nowStr = new Date().toISOString();
  const displayDate = new Date().toLocaleDateString('ko-KR') + ' 상담완료 이관';
  const cleanNote = consultItem.counselMemo
    ? `[상담결과] ${consultItem.counselMemo}` + (consultItem.note ? ` / 요청: ${consultItem.note}` : '')
    : (consultItem.note || consultItem.memo || '통합 고객 접수·상담함에서 상담 완료 후 자동 이관됨');

  if (targetBiz === 'beauty') {
    const list = getStoredBeautyBookings();
    let existing = list.find(x =>
      (x.sourceConsultId && x.sourceConsultId === consultItem.id) ||
      (consultItem.sourceBookingId && x.id === consultItem.sourceBookingId)
    );
    if (existing) {
      if (resolveItemStep(existing) === 'step1') {
        existing.status = '코치배정';
      }
      existing.sourceConsultId = consultItem.id;
      existing.consultNote = cleanNote;
      localStorage.setItem('seniorBeautyBookings', JSON.stringify(list));
      if (!skipRender) renderBusinessMasterDashboard();
      return { ok: true, recordId: existing.id, alreadyExisted: true };
    }

    const newId = 'BK-' + String(Date.now()).slice(-6);
    const roleText = consultItem.role || '고객 신청';
    const nameMatch = roleText.split('(')[0].trim();
    const newRecord = {
      id: newId,
      sourceConsultId: consultItem.id,
      programType: '시니어 뷰티 라이프케어',
      programTitle: '특별한 날, 화려한 외출 (180분 SOP)',
      role: roleText,
      applicantName: consultItem.name || nameMatch || '고객',
      phone: consultItem.phone || '-',
      seniorName: consultItem.seniorName || nameMatch || '어르신',
      place: '자택 방문 1:1 케어',
      visitDate: consultItem.preferredDate || '방문 일정 협의',
      address: consultItem.address || '상담 시 확인 주소',
      options: ['180분 시니어 뷰티 맞춤 케어'],
      memo: consultItem.note || consultItem.memo || '',
      consultNote: cleanNote,
      status: '코치배정',
      assignedCoach: '미배정',
      coachPhone: '',
      createdAt: nowStr
    };
    list.unshift(newRecord);
    localStorage.setItem('seniorBeautyBookings', JSON.stringify(list));
    if (!skipRender) renderBusinessMasterDashboard();
    return { ok: true, recordId: newId, alreadyExisted: false };
  }

  // 2호(옷장) / 3호(유품) / 4호(엔딩파티)
  const catMap = {
    wardrobe: '👗 일상과 비움의 미학 (옷장/공간)',
    legacy: '📦 기억의 계승 (유품/생전정리)',
    party: '💌 아름다운 마침표 (생전 엔딩 파티)'
  };
  const list = getStoredGeneralConsults();
  let existing = list.find(x => x.sourceConsultId && x.sourceConsultId === consultItem.id);
  if (existing) {
    if (resolveItemStep(existing) === 'step1') {
      existing.status = '코치배정';
    }
    existing.consultNote = cleanNote;
    existing.bizType = targetBiz;
    localStorage.setItem('seniorConsultList', JSON.stringify(list));
    if (!skipRender) renderBusinessMasterDashboard();
    return { ok: true, recordId: existing.id, alreadyExisted: true };
  }

  const newId = 'WL-' + String(Date.now()).slice(-5);
  const roleText = consultItem.role || '고객 신청';
  const newRecord = {
    id: newId,
    sourceConsultId: consultItem.id,
    bizType: targetBiz,
    category: catMap[targetBiz] || consultItem.category || '👗 일상과 비움의 미학 (옷장/공간)',
    role: roleText,
    name: consultItem.name || roleText.split('(')[0].trim() || '고객',
    phone: consultItem.phone || '-',
    date: displayDate,
    message: consultItem.note || consultItem.memo || '통합 상담함에서 상담 완료 후 이관된 고객입니다.',
    consultNote: cleanNote,
    status: '코치배정',
    assignedCoach: '미배정'
  };
  list.unshift(newRecord);
  localStorage.setItem('seniorConsultList', JSON.stringify(list));
  if (!skipRender) renderBusinessMasterDashboard();
  return { ok: true, recordId: newId, alreadyExisted: false };
}
window.handoffConsultToWellnessBusiness = handoffConsultToWellnessBusiness;

// [03. 웰라이프 ➔ 통합 고객 접수·상담함 재상담 반려]
function returnToConsultInbox(id, bizType) {
  if (!confirm('추가 상담이 필요하여 이 건을 [통합 고객 접수 · 상담]함으로 되돌려 보내시겠습니까?\n(현재 비즈니스 코치 배정 대기 목록에서는 제외됩니다.)')) {
    return;
  }
  let targetItem = null;
  if (bizType === 'beauty') {
    const list = getStoredBeautyBookings();
    const item = list.find(x => x.id === id);
    if (!item) return;
    item.status = '상담중';
    targetItem = {
      sourceId: item.sourceConsultId || ('re_' + item.id),
      category: '💄 웰니스 & 뷰티 케어',
      role: item.seniorName || item.applicantName || item.role || '고객',
      phone: item.phone || '-',
      note: '[재상담 요청] ' + (item.consultNote || item.memo || '코치 배정 전 추가 상담 필요')
    };
    localStorage.setItem('seniorBeautyBookings', JSON.stringify(list));
  } else {
    const list = getStoredGeneralConsults();
    const item = list.find(x => x.id === id);
    if (!item) return;
    item.status = '상담중';
    targetItem = {
      sourceId: item.sourceConsultId || ('re_' + item.id),
      category: item.category || '👗 일상과 비움의 미학',
      role: item.name || item.role || '고객',
      phone: item.phone || '-',
      note: '[재상담 요청] ' + (item.consultNote || item.message || '코치 배정 전 추가 상담 필요')
    };
    localStorage.setItem('seniorConsultList', JSON.stringify(list));
  }

  // 통합 고객 접수·상담함(reset_consult_list)에 재오픈 반영
  try {
    const raw = localStorage.getItem('reset_consult_list');
    let inbox = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(inbox)) inbox = [];
    const found = inbox.find(c => c.id === targetItem.sourceId);
    if (found) {
      found.status = '진행';
      found.handedOffBiz = '';
      found.handedOffLabel = '';
    } else {
      const now = new Date();
      const stamp = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
      inbox.unshift({
        id: targetItem.sourceId,
        category: targetItem.category,
        role: targetItem.role,
        phone: targetItem.phone,
        note: targetItem.note,
        status: '진행',
        createdAt: stamp
      });
    }
    localStorage.setItem('reset_consult_list', JSON.stringify(inbox));
  } catch (e) {}

  renderBusinessMasterDashboard();
  if (typeof renderDiagReservationTable === 'function') renderDiagReservationTable();
  if (typeof refreshCockpitStats === 'function') refreshCockpitStats();

  if (confirm('↩️ [통합 고객 접수 · 상담]함으로 재상담 이관되었습니다.\n지금 통합 상담함으로 이동하시겠습니까?')) {
    if (typeof switchTab === 'function') switchTab('tabConsult');
  }
}
window.returnToConsultInbox = returnToConsultInbox;

// [실시간 웰라이프 확정/진행 건수 집계 (통합 상담함 '완료' 건 기준 엄격 집계)]
function getWellnessActiveCounts() {
  const validMap = syncCompletedConsultsIntoWellness();
  const bList = getStoredBeautyBookings().filter(i => i && i.sourceConsultId && validMap.has(i.sourceConsultId) && resolveItemStep(i) !== 'step1');
  const gList = getStoredGeneralConsults().filter(i => i && i.sourceConsultId && validMap.has(i.sourceConsultId) && resolveItemStep(i) !== 'step1');
  const waitingCoach = bList.filter(i => resolveItemStep(i) === 'step2').length +
                       gList.filter(i => resolveItemStep(i) === 'step2').length;
  return {
    total: bList.length + gList.length,
    beauty: bList.length,
    general: gList.length,
    waitingCoach: waitingCoach
  };
}
window.getWellnessActiveCounts = getWellnessActiveCounts;

// [1단계 코치배정 ➔ 2단계 현장케어 이관]
function transferStep2ToStep3(id, bizType) {
  if (bizType === 'beauty') {
    const list = getStoredBeautyBookings();
    const item = list.find(x => x.id === id);
    if (!item) return;

    item.status = '진행중';
    item.sopProgress = '180분 SOP 현장 진행 시작';
    localStorage.setItem('seniorBeautyBookings', JSON.stringify(list));
    renderBusinessMasterDashboard();

    const doMove = confirm(`🤝 [코치 배정 완료]\n\n[${item.seniorName}] 건의 담당 코치(${item.assignedCoach}) 배정이 확정되어\n[② 현장케어/일지] 단계로 성공적으로 이관되었습니다!\n\n지금 [② 현장케어/일지] 관제 화면으로 이동하시겠습니까?`);
    if (doMove) {
      switchPipelineStep('step3');
    }
  }
}

// [2단계 현장케어 ➔ 3단계 CRM 사후관리 이관]
function transferStep3ToStep4(id, bizType) {
  if (bizType === 'beauty') {
    const list = getStoredBeautyBookings();
    const item = list.find(x => x.id === id);
    if (!item) return;

    item.status = '케어완료';
    if (!item.completedAt) item.completedAt = new Date().toISOString();
    localStorage.setItem('seniorBeautyBookings', JSON.stringify(list));
    renderBusinessMasterDashboard();

    const doMove = confirm(`🎉 [180분 케어 완료 승인]\n\n[${item.seniorName}] 어르신의 180분 현장 케어가 감동 속에 성공적으로 완료되어\n[③ CRM 사후 리텐션] 루프로 이관되었습니다!\n\n지금 [③ CRM 사후 리텐션] 화면으로 이동하시겠습니까?`);
    if (doMove) {
      switchPipelineStep('step4');
    }
  }
}

// [3단계 CRM 리텐션 ➔ 통합 고객 접수·상담함 신규 재상담 접수 (선순환)]
function reOrderFromRetention(id, bizType) {
  if (bizType === 'beauty') {
    const list = getStoredBeautyBookings();
    const item = list.find(x => x.id === id);
    if (!item) return;

    const newConsultId = 'cs_re_' + Date.now();
    const now = new Date();
    const stamp = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    try {
      const raw = localStorage.getItem('reset_consult_list');
      const inbox = raw ? JSON.parse(raw) : [];
      inbox.unshift({
        id: newConsultId,
        category: '💄 웰니스 & 뷰티 케어 (AGAIN180 재상담)',
        role: `${item.seniorName || item.applicantName} (기존 고객 재이용)`,
        name: item.applicantName || item.seniorName,
        seniorName: item.seniorName || '',
        phone: item.phone || '-',
        note: `[AGAIN 선순환 재상담] 이전 케어 완료(${item.completedAt ? item.completedAt.slice(0, 10) : '최근'}) 고객 정기 리케어 상담 요청.`,
        status: '대기',
        createdAt: stamp
      });
      localStorage.setItem('reset_consult_list', JSON.stringify(inbox));
    } catch (e) {}

    if (typeof renderDiagReservationTable === 'function') renderDiagReservationTable();
    if (typeof refreshCockpitStats === 'function') refreshCockpitStats();

    const doMove = confirm(`🔄 [선순환 재상담 접수 완료]\n\n[${item.seniorName}] 어르신의 정기 180분 리케어 재상담 건이\n[통합 고객 접수 · 상담]함에 신규 등록되었습니다!\n\n지금 [통합 고객 접수 · 상담] 화면으로 이동하시겠습니까?`);
    if (doMove && typeof switchTab === 'function') {
      switchTab('tabConsult');
    }
  }
}

// 9-1. 일반 비즈니스 이관 함수들
function transferGeneralStep2ToStep3(id) {
  const list = getStoredGeneralConsults();
  const item = list.find(x => x.id === id);
  if (!item) return;

  item.status = '진행중';
  localStorage.setItem('seniorConsultList', JSON.stringify(list));
  renderBusinessMasterDashboard();

  const doMove = confirm(`🤝 [코치 배정 완료]\n\n[${item.name}] 고객 건이 [② 현장진행] 단계로 이관되었습니다!\n\n지금 현장진행 화면으로 이동하시겠습니까?`);
  if (doMove) switchPipelineStep('step3');
}

function transferGeneralStep3ToStep4(id) {
  const list = getStoredGeneralConsults();
  const item = list.find(x => x.id === id);
  if (!item) return;

  item.status = '완료';
  if (!item.completedAt) item.completedAt = new Date().toISOString();
  localStorage.setItem('seniorConsultList', JSON.stringify(list));
  renderBusinessMasterDashboard();

  const doMove = confirm(`🎉 [완료 승인]\n\n[${item.name}] 고객 건이 [③ CRM 사후관리] 단계로 이관되었습니다!\n\n지금 사후관리 화면으로 이동하시겠습니까?`);
  if (doMove) switchPipelineStep('step4');
}

function reOrderFromGeneralRetention(id) {
  const list = getStoredGeneralConsults();
  const item = list.find(x => x.id === id);
  if (!item) return;

  const newConsultId = 'cs_re_' + Date.now();
  const now = new Date();
  const stamp = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  try {
    const raw = localStorage.getItem('reset_consult_list');
    const inbox = raw ? JSON.parse(raw) : [];
    inbox.unshift({
      id: newConsultId,
      category: item.category || '👗 일상과 비움의 미학',
      role: `${item.name} (기존 고객 재이용)`,
      name: item.name,
      phone: item.phone || '-',
      note: `[선순환 재상담] 기존 서비스 완료 후 정기 점검·추가 케어 재상담 요청.`,
      status: '대기',
      createdAt: stamp
    });
    localStorage.setItem('reset_consult_list', JSON.stringify(inbox));
  } catch (e) {}

  if (typeof renderDiagReservationTable === 'function') renderDiagReservationTable();
  if (typeof refreshCockpitStats === 'function') refreshCockpitStats();

  const doMove = confirm(`🔄 [선순환 재상담 접수 완료]\n\n[${item.name}] 고객님의 신규 재상담 건이\n[통합 고객 접수 · 상담]함에 등록되었습니다!\n\n지금 [통합 고객 접수 · 상담] 화면으로 이동하시겠습니까?`);
  if (doMove && typeof switchTab === 'function') {
    switchTab('tabConsult');
  }
}

// 10. 상태 업데이트 및 보조 함수들
function updateStep2Status(id, newStatus, bizType) {
  if (bizType === 'beauty') {
    const list = getStoredBeautyBookings();
    const item = list.find(x => x.id === id);
    if (!item) return;

    item.status = newStatus;
    localStorage.setItem('seniorBeautyBookings', JSON.stringify(list));
    renderBusinessMasterDashboard();

    if (newStatus === '배정완료') {
      transferStep2ToStep3(id, 'beauty');
    }
  }
}

function editConsultNotePrompt(id, bizType) {
  if (bizType === 'beauty') {
    const list = getStoredBeautyBookings();
    const item = list.find(x => x.id === id);
    if (!item) return;

    const cur = item.consultNote || '';
    const note = prompt(`[${item.applicantName}] 고객 인수인계 메모 수정:`, cur);
    if (note !== null) {
      item.consultNote = note;
      localStorage.setItem('seniorBeautyBookings', JSON.stringify(list));
      renderBusinessMasterDashboard();
    }
  }
}

function sendRetentionAlert(id, type, bizType) {
  if (bizType === 'beauty') {
    const list = getStoredBeautyBookings();
    const item = list.find(x => x.id === id);
    if (!item) return;

    if (type === '3m') {
      item.retentionSent3m = true;
      localStorage.setItem('seniorBeautyBookings', JSON.stringify(list));
      renderBusinessMasterDashboard();
      alert(`[${item.seniorName} 어르신]께 3개월 차 [무료 피부 재진단 및 안부 알림톡]이 성공적으로 전송되었습니다!`);
    } else if (type === '6m') {
      item.retentionSent6m = true;
      localStorage.setItem('seniorBeautyBookings', JSON.stringify(list));
      renderBusinessMasterDashboard();
      alert(`[${item.seniorName} 어르신]께 6개월 차 [AGAIN180 감사 할인 30% 쿠폰] 알림톡이 성공적으로 발송되었습니다!`);
    }
  }
}

// 11. 코치 배정 및 기존 호환 함수들
function assignBeautyCoach(id, coachName) {
  const list = getStoredBeautyBookings();
  const item = list.find(x => x.id === id);
  if (item) {
    const cleanSel = String(coachName || '').replace(/\s+|코치$/g, '');
    const matched = getCertifiedAssignableCoaches().find(c => c.name.replace(/\s+|코치$/g, '') === cleanSel);
    item.assignedCoach = coachName;
    item.coachPhone = matched ? (matched.phone || '') : '';
    item.coachId = matched ? matched.id : '';
    localStorage.setItem('seniorBeautyBookings', JSON.stringify(list));
    if (coachName && !coachName.includes('미배정')) {
      alert(`${id} 건에 공인 코치 [${coachName}] 지정이 완료되었습니다.\n[💬 배정확정 · 카톡알림 ➔] 버튼을 눌러 현장으로 발송하세요.`);
    }
  }
}

function changeBeautyStatus(id, newStatus) {
  const list = getStoredBeautyBookings();
  const item = list.find(x => x.id === id);
  if (item) {
    item.status = newStatus;
    if (newStatus === '케어완료' && !item.completedAt) {
      item.completedAt = new Date().toISOString();
    }
    localStorage.setItem('seniorBeautyBookings', JSON.stringify(list));
    renderBusinessMasterDashboard();
    alert(`${id} 건 상태가 [${newStatus}]으로 변경되었습니다.`);
  }
}

function assignGeneralCoach(id, coachName) {
  const list = getStoredGeneralConsults();
  const item = list.find(x => x.id === id);
  if (item) {
    const cleanSel = String(coachName || '').replace(/\s+|코치$/g, '');
    const matched = getCertifiedAssignableCoaches().find(c => c.name.replace(/\s+|코치$/g, '') === cleanSel);
    item.assignedCoach = coachName;
    item.coachPhone = matched ? (matched.phone || '') : '';
    item.coachId = matched ? matched.id : '';
    localStorage.setItem('seniorConsultList', JSON.stringify(list));
    if (coachName && !coachName.includes('미배정')) {
      alert(`${id} 건에 공인 코치 [${coachName}] 지정이 완료되었습니다.\n[💬 배정확정 · 카톡알림 ➔] 버튼을 눌러 현장으로 발송하세요.`);
    }
  }
}

function changeGeneralStatus(id, newStatus) {
  const list = getStoredGeneralConsults();
  const item = list.find(x => x.id === id);
  if (item) {
    item.status = newStatus;
    localStorage.setItem('seniorConsultList', JSON.stringify(list));
    renderBusinessMasterDashboard();
    alert(`${id} 건 상태가 [${newStatus}]으로 변경되었습니다.`);
  }
}

// 12. 180분 현장 코칭일지 모달 제어
function openBeautyCoachingModal(id) {
  const list = getStoredBeautyBookings();
  const item = list.find(x => x.id === id);
  if (!item) return;

  const modal = document.getElementById('beautyCoachingLogModal');
  const idInput = document.getElementById('logBookingId');
  if (idInput) idInput.value = item.id;

  if (item.diagnostic) {
    const bMoist = document.getElementById('logMoistureBefore');
    const aMoist = document.getElementById('logMoistureAfter');
    const elast = document.getElementById('logElasticity');
    const ward = document.getElementById('logWardrobe');
    const note = document.getElementById('logEndingNote');

    if (bMoist) bMoist.value = item.diagnostic.moistureBefore || 24;
    if (aMoist) aMoist.value = item.diagnostic.moistureAfter || 68;
    if (elast) elast.value = item.diagnostic.elasticityAfter || '매우 우수 (윤광 회복)';
    if (ward) ward.value = item.diagnostic.wardrobe || '소장 의상 TPO 코디 완료';
    if (note) note.value = item.diagnostic.endingNote || '';
  }
  if (modal) modal.style.display = 'flex';
}

function closeBeautyCoachingModal() {
  const modal = document.getElementById('beautyCoachingLogModal');
  if (modal) modal.style.display = 'none';
}

function saveBeautyCoachingLog(e) {
  if (e && e.preventDefault) e.preventDefault();
  const idInput = document.getElementById('logBookingId');
  const id = idInput ? idInput.value : '';
  const list = getStoredBeautyBookings();
  const item = list.find(x => x.id === id);
  if (!item) return;

  const bMoist = document.getElementById('logMoistureBefore');
  const aMoist = document.getElementById('logMoistureAfter');
  const elast = document.getElementById('logElasticity');
  const ward = document.getElementById('logWardrobe');
  const safety = document.getElementById('logSafety');
  const note = document.getElementById('logEndingNote');

  item.diagnostic = {
    moistureBefore: Number(bMoist ? bMoist.value : 24),
    moistureAfter: Number(aMoist ? aMoist.value : 70),
    elasticityAfter: elast ? elast.value : '매우 우수',
    wardrobe: ward ? ward.value : '소장 의상 매칭 완료',
    safetyChecked: safety ? safety.value === '완료' : true,
    endingNote: note ? note.value : ''
  };
  item.status = '케어완료';
  if (!item.completedAt) item.completedAt = new Date().toISOString();

  localStorage.setItem('seniorBeautyBookings', JSON.stringify(list));
  closeBeautyCoachingModal();
  renderBusinessMasterDashboard();
  alert('180분 현장 코칭일지가 저장되었으며, ③ CRM 사후 리텐션으로 즉시 이관되었습니다!');
}

// 13. 엑셀(CSV) 다운로드 (통합 상담함 완료 확정 고객 대상)
function exportBusinessCSV() {
  const validMap = getCompletedConsultMap();
  if (currentBusinessTab === 'beauty') {
    const list = getStoredBeautyBookings().filter(i => i && i.sourceConsultId && validMap.has(i.sourceConsultId) && resolveItemStep(i) !== 'step1');
    let csv = '\uFEFF예약ID,현재단계,신청인,관계,어르신성함,연락처,방문일시,진행장소,주소,상담인수인계메모,배정코치,처리상태,수분전,수분후,탄력,엔딩노트\n';
    list.forEach(i => {
      const diag = i.diagnostic || {};
      const stepName = getStepBadgeText(resolveItemStep(i));
      csv += `"${i.id}","${stepName}","${i.applicantName}","${i.role}","${i.seniorName}","${i.phone}","${i.visitDate}","${i.place}","${i.address || ''}","${(i.consultNote || '').replace(/"/g, '""')}","${i.assignedCoach}","${i.status}","${diag.moistureBefore || ''}","${diag.moistureAfter || ''}","${diag.elasticityAfter || ''}","${(diag.endingNote || '').replace(/"/g, '""')}"\n`;
    });
    downloadCSVFile(csv, `senior_beauty_crm_${new Date().toISOString().slice(0,10)}.csv`);
  } else {
    const consults = getStoredGeneralConsults().filter(i => i && i.sourceConsultId && validMap.has(i.sourceConsultId) && resolveItemStep(i) !== 'step1');
    let csv = '\uFEFF관리ID,신청분야,현재단계,신청자,연락처,이관일시,요청내용,인수인계메모,배정코치,처리상태\n';
    consults.forEach(i => {
      const stepName = getStepBadgeText(resolveItemStep(i));
      csv += `"${i.id}","${i.category}","${stepName}","${i.name}","${i.phone}","${i.date}","${(i.message || '').replace(/"/g, '""')}","${(i.consultNote || '').replace(/"/g, '""')}","${i.assignedCoach || ''}","${i.status}"\n`;
    });
    downloadCSVFile(csv, `senior_business_${currentBusinessTab}_${new Date().toISOString().slice(0,10)}.csv`);
  }
}

function downloadCSVFile(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

// 14. 공식 코치 배정 · 카톡 알림 · 통합관제 마감 원스톱 연동
function dispatchAndNotifyBeauty(id) {
  const list = getStoredBeautyBookings();
  const item = list.find(x => x.id === id);
  if (!item) return;

  const coaches = getCertifiedAssignableCoaches();
  if (coaches.length === 0) {
    alert('⚠️ [06. 코치 아카데미 > 6-2 공인 코칭스태프 명단]에 등재된 활동 코치가 없습니다.\n먼저 아카데미 수료 확정 및 코치 등재를 완료해 주세요.');
    return;
  }

  if (!item.assignedCoach || item.assignedCoach.includes('미배정')) {
    alert('먼저 좌측 [담당 전담 코치 지정] 드롭다운에서 공인 코치를 선택해 주세요.');
    return;
  }

  const cleanSel = String(item.assignedCoach).replace(/\s+|코치$/g, '');
  const matchedCoach = coaches.find(c => c.name.replace(/\s+|코치$/g, '') === cleanSel || String(item.assignedCoach).includes(c.name));
  if (!matchedCoach) {
    alert('⚠️ [06. 코치 아카데미 > 6-2 공인 코칭스태프 명단]에 등재된 활동 코치만 배정할 수 있습니다.\n드롭다운에서 등재된 코치를 다시 선택해 주세요.');
    return;
  }

  let linked = null;
  if (typeof window.dispatchAndNotifyFromBusiness === 'function') {
    linked = window.dispatchAndNotifyFromBusiness({
      sourceBizType: 'beauty',
      sourceBizId: item.id,
      name: item.seniorName || item.applicantName,
      phone: item.phone,
      service: '💄 화려한 외출 (시니어 메이크업)',
      date: (item.visitDate || '방문 일정 협의').replace('T', ' '),
      address: (item.address || item.place || '고객 자택'),
      coach: matchedCoach.name + ' 코치',
      coachPhone: matchedCoach.phone || item.coachPhone || '',
      fee: 150000,
      notes: item.consultNote || item.memo || `[뷰티 180분] ${item.applicantName}(${item.role})`
    });
  }

  item.assignedCoach = matchedCoach.name + ' 코치';
  item.coachPhone = matchedCoach.phone || '';
  item.coachId = matchedCoach.id;
  item.status = '진행중';
  item.sopProgress = '코치 배정·카톡 알림 완료 (코치 현장 수행 대기)';
  if (linked && linked.id) item.linkedDispatchId = linked.id;
  localStorage.setItem('seniorBeautyBookings', JSON.stringify(list));
  renderBusinessMasterDashboard();
}
window.dispatchAndNotifyBeauty = dispatchAndNotifyBeauty;

function dispatchAndNotifyGeneral(id, biz) {
  const list = getStoredGeneralConsults();
  const item = list.find(x => x.id === id);
  if (!item) return;

  const coaches = getCertifiedAssignableCoaches();
  if (coaches.length === 0) {
    alert('⚠️ [06. 코치 아카데미 > 6-2 공인 코칭스태프 명단]에 등재된 활동 코치가 없습니다.\n먼저 아카데미 수료 확정 및 코치 등재를 완료해 주세요.');
    return;
  }

  if (!item.assignedCoach || item.assignedCoach.includes('미배정')) {
    alert('먼저 [담당 배정 코치] 드롭다운에서 공인 코치를 선택해 주세요.');
    return;
  }

  const cleanSel = String(item.assignedCoach).replace(/\s+|코치$/g, '');
  const matchedCoach = coaches.find(c => c.name.replace(/\s+|코치$/g, '') === cleanSel || String(item.assignedCoach).includes(c.name));
  if (!matchedCoach) {
    alert('⚠️ [06. 코치 아카데미 > 6-2 공인 코칭스태프 명단]에 등재된 활동 코치만 배정할 수 있습니다.\n드롭다운에서 등재된 코치를 다시 선택해 주세요.');
    return;
  }

  const bizKey = biz || item.bizType || currentBusinessTab || 'wardrobe';
  let linked = null;
  if (typeof window.dispatchAndNotifyFromBusiness === 'function') {
    linked = window.dispatchAndNotifyFromBusiness({
      sourceBizType: bizKey,
      sourceBizId: item.id,
      name: item.name,
      phone: item.phone,
      service: item.category || (BIZ_META[bizKey] ? `${BIZ_META[bizKey].icon} ${BIZ_META[bizKey].name}` : '웰라이프 방문 케어'),
      date: item.date || '방문 일정 협의',
      address: item.address || '고객 자택 (상담 확정)',
      coach: matchedCoach.name + ' 코치',
      coachPhone: matchedCoach.phone || item.coachPhone || '',
      fee: 150000,
      notes: item.consultNote || item.message || ''
    });
  }

  item.assignedCoach = matchedCoach.name + ' 코치';
  item.coachPhone = matchedCoach.phone || '';
  item.coachId = matchedCoach.id;
  item.status = '진행중';
  if (linked && linked.id) item.linkedDispatchId = linked.id;
  localStorage.setItem('seniorConsultList', JSON.stringify(list));
  renderBusinessMasterDashboard();
}
window.dispatchAndNotifyGeneral = dispatchAndNotifyGeneral;

function openDispatchFromBeauty(id) {
  const list = getStoredBeautyBookings();
  const item = list.find(x => x.id === id);
  if (!item) return;
  if (typeof openDispatchModalForClient === 'function') {
    openDispatchModalForClient({
      sourceBizType: 'beauty',
      sourceBizId: item.id,
      name: item.seniorName || item.applicantName,
      phone: item.phone,
      service: '💄 화려한 외출 (시니어 메이크업)',
      date: item.visitDate || '',
      address: (item.address || item.place || ''),
      coach: item.assignedCoach || '',
      fee: 150000,
      notes: item.consultNote || item.memo || `[뷰티 180분 예약 연동] 신청인: ${item.applicantName}(${item.role}), 어르신: ${item.seniorName}, 예약ID: ${item.id}`
    });
  } else if (typeof switchTab === 'function') {
    switchTab('tabCoachControl');
    if (typeof openDispatchModal === 'function') openDispatchModal();
  }
}

function openDispatchFromGeneral(id, biz) {
  const list = getStoredGeneralConsults();
  const item = list.find(x => x.id === id);
  if (!item) return;
  const bizKey = biz || item.bizType || currentBusinessTab || 'wardrobe';
  if (typeof openDispatchModalForClient === 'function') {
    openDispatchModalForClient({
      sourceBizType: bizKey,
      sourceBizId: item.id,
      name: item.name,
      phone: item.phone,
      service: item.category || '👗 2호 일상과 비움의 미학 (옷장&서재 정리)',
      date: item.date || '',
      address: item.address || '고객 자택 (상담 후 확정)',
      coach: item.assignedCoach || '',
      fee: 150000,
      notes: item.consultNote || `[웰라이프 상담완료 이관 연동] 관리ID: ${item.id} / 내용: ${item.message || ''}`
    });
  } else if (typeof switchTab === 'function') {
    switchTab('tabCoachControl');
    if (typeof openDispatchModal === 'function') openDispatchModal();
  }
}

// 현장 업무카드 모달 바로 열기 (없으면 통합관제 마감 보드로 이동)
function openLinkedReportOrCockpit(linkedDispId, clientName) {
  if (typeof getDispatches === 'function' && typeof openDispatchReportModal === 'function') {
    const dispatches = getDispatches();
    let found = linkedDispId ? dispatches.find(d => d.id === linkedDispId) : null;
    if (!found && clientName) {
      const kw = String(clientName).replace(/\s*\([^)]*\)/g, '').replace(/어머니|어르신|님|모친/g, '').trim();
      if (kw) found = dispatches.find(d => d.customerName && d.customerName.includes(kw));
    }
    if (found) {
      openDispatchReportModal(found.id);
      return;
    }
  }
  if (typeof switchTab === 'function') {
    switchTab('tabCockpit');
    if (typeof focusCockpitSettlementQueue === 'function') {
      focusCockpitSettlementQueue('pending');
    }
  }
}
window.openLinkedReportOrCockpit = openLinkedReportOrCockpit;

function goToCoachControlForClient(name) {
  if (typeof switchTab === 'function') {
    switchTab('tabCockpit');
  }
  if (typeof focusCockpitSettlementQueue === 'function') {
    focusCockpitSettlementQueue('all');
  }
}

// 15. 유틸리티 & 라벨 헬퍼 (3단계 실행 파이프라인 기준)
function getStepBannerTitle(step, meta) {
  if (step === 'step2' || step === 'step1') return meta.step2Title;
  if (step === 'step3') return meta.step3Title;
  if (step === 'step4') return meta.step4Title;
  return `${meta.icon || '🌿'} ${meta.name} — 상담완료 확정 고객 실행 파이프라인`;
}

function getStepBannerDesc(step, meta) {
  if (step === 'step2' || step === 'step1') return meta.step2Desc;
  if (step === 'step3') return meta.step3Desc;
  if (step === 'step4') return meta.step4Desc;
  return '통합 고객 접수·상담함에서 상담 완료·확정된 고객만 이관되어 ① 코치 배정 → ② 현장 케어 → ③ CRM 사후관리까지 전담 운영합니다.';
}

function getStepBadgeText(step) {
  if (step === 'step2' || step === 'step1') return '1단계: 코치배정';
  if (step === 'step3') return '2단계: 현장케어';
  if (step === 'step4') return '3단계: CRM리텐션';
  return '3단계 통합 관제';
}

function getStepBadgeHtml(step) {
  if (step === 'step2' || step === 'step1') {
    return `<span class="badge" style="background:#f0f9ff; color:#0284c7; border:1px solid #bae6fd; font-size:0.75rem; font-weight:800; padding:2px 6px;">① 코치배정</span>`;
  } else if (step === 'step3') {
    return `<span class="badge" style="background:#f0fdf4; color:#15803d; border:1px solid #bbf7d0; font-size:0.75rem; font-weight:800; padding:2px 6px;">② 현장케어</span>`;
  } else if (step === 'step4') {
    return `<span class="badge" style="background:#faf5ff; color:#7c3aed; border:1px solid #e9d5ff; font-size:0.75rem; font-weight:800; padding:2px 6px;">③ CRM사후</span>`;
  }
  return `<span class="badge" style="background:#f3f4f6; color:#4b5563; font-size:0.75rem;">전체</span>`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// 16. 초기 실행 이벤트
window.addEventListener('DOMContentLoaded', () => {
  renderBusinessMasterDashboard();
  const tabQ = new URLSearchParams(window.location.search).get('tab');
  if (tabQ === 'tabBeautyCrm' || tabQ === 'beauty') {
    switchBusinessMasterTab('beauty');
  } else if (tabQ === 'wardrobe') {
    switchBusinessMasterTab('wardrobe');
  } else if (tabQ === 'legacy') {
    switchBusinessMasterTab('legacy');
  } else if (tabQ === 'party') {
    switchBusinessMasterTab('party');
  } else if (tabQ === 'memoir') {
    switchBusinessMasterTab('memoir');
  }
});
