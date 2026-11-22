// =========================================================================
// 여백과결 - 03. 웰라이프 4대 방문 케어 통합 관제 & CRM 시스템 (beauty-crm.js)
// 통합 고객 접수·상담함에서 '상담 완료' 확정·이관된 고객만 전담 관리합니다.
// 3단계 실행 파이프라인: ① 코치 배정 ➔ ② 현장 케어/일지 ➔ ③ CRM 사후관리
// =========================================================================

let currentBusinessTab = 'beauty'; // 'beauty', 'wardrobe', 'legacy', 'party'
let currentPipelineStep = 'all';    // 'all', 'step2'(①코치배정), 'step3'(②현장케어), 'step4'(③CRM사후관리)
let currentSubFilter = 'all';       // 각 단계 내부 하위 필터

// 🌟 데이터 버전 관리 (기존 고객 데이터를 유실 없이 보존하며 버전만 기록)
const BEAUTY_CRM_DATA_VER = '20261122_v3';
try {
  if (localStorage.getItem('beautyCrmDataVer') !== BEAUTY_CRM_DATA_VER) {
    localStorage.setItem('beautyCrmDataVer', BEAUTY_CRM_DATA_VER);
  }
} catch(e) {}

// 1. 1호 시니어 뷰티 라이프케어 마스터 데이터 조회
function getStoredBeautyBookings() {
  try {
    const raw = localStorage.getItem('seniorBeautyBookings');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch(e) {
    console.error('예약 데이터 파싱 실패:', e);
  }

  // 기본 견본 데이터 (통합 상담함에서 상담 완료·이관된 확정 고객 1~3단계 시연용)
  const defaultList = [
    // ---------------- [1단계 : 전문 코치 배정 & 매칭 (상담완료 이관)] ----------------
    {
      id: 'BK-202611',
      programType: '시니어 뷰티 라이프케어',
      programTitle: '특별한 날, 화려한 외출 (180분 SOP)',
      role: '자녀 대리 신청 (3040 세대)',
      applicantName: '김민수',
      phone: '010-9613-5913',
      seniorName: '이영숙 어머니 (72세)',
      place: '자택 방문 1:1 케어',
      visitDate: '2026-11-16T10:00',
      address: '서울시 서초구 반포대로 12길 (301호)',
      options: ['목·승모근 림프 이완 테라피', '기미·주름 커버 투명 윤광 메이크업', '주거 공간 낙상 안전 동선 점검'],
      memo: '어머니께서 오랜만에 외출하시길 무척 기대하고 계십니다.',
      consultNote: '통합 상담 완료! 밝고 자연스러운 피부 표현과 편안한 안면 근육 이완 선호.',
      status: '코치배정',
      assignedCoach: '김서연 전문 라이프 코치 (40대 시니어 뷰티&라이프스타일 1급)',
      coachPhone: '010-9613-5913',
      createdAt: '2026-11-13T10:00:00.000Z'
    },
    {
      id: 'BK-202617',
      programType: '시니어 뷰티 라이프케어',
      programTitle: '특별한 날, 화려한 외출 (180분 SOP)',
      role: '자녀 대리 신청',
      applicantName: '정다은',
      phone: '010-7711-2233',
      seniorName: '황옥순 어르신 (81세)',
      place: '자택 방문 1:1 케어',
      visitDate: '2026-11-18T14:00',
      address: '서울시 마포구 독막로 15길 (마포자이 108동)',
      options: ['목·승모근 림프 이완 테라피', '인생 사진 촬영'],
      memo: '거동이 조금 불편하시어 침상 케어 및 부드러운 승모근 림프 케어 희망.',
      consultNote: '통합 상담 완료! 박지은 수석코치와 동선 및 시간 조율 진행 중.',
      status: '조율중',
      assignedCoach: '박지은 수석 코치 (시니어 뷰티&공간리셋 1급)',
      coachPhone: '010-3344-5566',
      createdAt: '2026-11-12T16:30:00.000Z'
    },

    // ---------------- [2단계 : 180분 현장 케어 & 안심 관제] ----------------
    {
      id: 'BK-202610',
      programType: '시니어 뷰티 라이프케어',
      programTitle: '특별한 날, 화려한 외출 (180분 SOP)',
      role: '본인 어르신 신청',
      applicantName: '최순자',
      phone: '010-3849-5912',
      seniorName: '최순자 어르신 (78세)',
      place: '자택 방문 1:1 케어',
      visitDate: '2026-11-14T13:30',
      address: '서울시 송파구 올림픽로 35길 (잠실 르엘 204동)',
      options: ['목·승모근 림프 이완 테라피', '헤어 볼륨 스타일링', '인생 사진 촬영'],
      memo: '동창 모임 가기 전 우아하고 자연스러운 스타일링 희망.',
      consultNote: '상담 완료 및 코치 배정 확정. 현장 180분 SOP 순조롭게 진행 중.',
      status: '진행중',
      assignedCoach: '박지은 수석 코치 (시니어 뷰티&공간리셋 1급)',
      coachPhone: '010-3344-5566',
      photoBase64: 'registered',
      createdAt: '2026-11-12T11:00:00.000Z',
      sopProgress: 'SOP 80% (3단계 윤광 메이크업 & 헤어 볼륨 진행 중)',
      diagnostic: {
        moistureBefore: 26,
        moistureAfter: 70,
        elasticityBefore: '보통 이하',
        elasticityAfter: '매우 우수 (윤광 회복)',
        wardrobe: '소장 에메랄드 실크 스카프 매칭',
        safetyChecked: true,
        endingNote: '현장에서 180분 집중 케어를 정성껏 마쳤으며 어르신 만족도가 매우 높았습니다.'
      }
    },

    // ---------------- [3단계 : CRM 사후관리 & 리텐션 루프] ----------------
    {
      id: 'BK-202609',
      programType: '시니어 뷰티 라이프케어',
      programTitle: '특별한 날, 화려한 외출 (180분 SOP)',
      role: '자녀 대리 신청',
      applicantName: '한지민',
      phone: '010-7788-9900',
      seniorName: '강명숙 어머니 (70세)',
      place: '자택 방문 1:1 케어',
      visitDate: '2026-08-10T10:00',
      address: '서울시 마포구 마포대로 28길 (래미안 105동)',
      options: ['목·승모근 림프 이완 테라피', '기미·주름 커버 투명 윤광 메이크업', '소장 의상 리스타일링'],
      memo: '따님 결혼식 혼주 메이크업 리허설 케어 완료 건',
      consultNote: '케어 완료 후 만족도 5.0 만점. 모친께서 재진료 희망하심.',
      status: '케어완료',
      assignedCoach: '이은영 전문 코치 (시니어 라이프스타일 1급)',
      coachPhone: '010-7788-9900',
      createdAt: '2026-08-08T09:00:00.000Z',
      completedAt: '2026-08-10T13:00:00.000Z',
      satisfaction: 5.0,
      photoBase64: 'registered',
      retentionSent3m: false,
      retentionSent6m: false,
      diagnostic: {
        moistureBefore: 24,
        moistureAfter: 72,
        elasticityBefore: '보통 이하',
        elasticityAfter: '최상 (탄력 복원)',
        wardrobe: '연분홍 실크 한복 매칭',
        safetyChecked: true,
        endingNote: '케어 3개월 차 무료 피부 재진단 및 AGAIN180 리텐션 루프 대상 고객입니다.'
      }
    },
    {
      id: 'BK-202608',
      programType: '시니어 뷰티 라이프케어',
      programTitle: '특별한 날, 화려한 외출 (180분 SOP)',
      role: '자녀 대리 신청',
      applicantName: '오승환',
      phone: '010-5522-6633',
      seniorName: '송정희 어르신 (75세)',
      place: '자택 방문 1:1 케어',
      visitDate: '2026-05-15T14:00',
      address: '서울시 양천구 목동동로 12길 (신시가지 7단지)',
      options: ['목·승모근 림프 이완 테라피', '인생 사진 촬영'],
      memo: '칠순 감사 잔치 전 특별 케어 완료.',
      consultNote: '6개월 차 AGAIN180 감사 할인 쿠폰 발송 대상.',
      status: '케어완료',
      assignedCoach: '김서연 전문 라이프 코치 (40대 시니어 뷰티&라이프스타일 1급)',
      coachPhone: '010-9613-5913',
      createdAt: '2026-05-12T10:00:00.000Z',
      completedAt: '2026-05-15T17:00:00.000Z',
      satisfaction: 5.0,
      photoBase64: 'registered',
      retentionSent3m: true,
      retentionSent6m: false,
      diagnostic: {
        moistureBefore: 22,
        moistureAfter: 68,
        elasticityBefore: '보통',
        elasticityAfter: '우수',
        wardrobe: '보라색 캐시미어 가디건 매칭',
        safetyChecked: true,
        endingNote: '6개월 주기 정기 케어 희망 고객.'
      }
    }
  ];

  try {
    localStorage.setItem('seniorBeautyBookings', JSON.stringify(defaultList));
  } catch(e){}
  return defaultList;
}

// 2. 2호~4호 웰라이프 비즈니스 확정 고객 데이터 조회 (상담 완료 후 이관된 건 관리)
function getStoredGeneralConsults() {
  try {
    const raw = localStorage.getItem('seniorConsultList');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch(e) {}

  // 기본 견본 데이터 (2호~4호 비즈니스별 상담완료 이관 1~3단계 시연용)
  const defaultConsults = [
    // 👗 2호 일상과 비움의 미학 (옷장/공간)
    {
      id: 'CS-105',
      category: '👗 일상과 비움의 미학 (옷장/공간)',
      role: '본인 어르신',
      name: '김영자 어르신',
      phone: '010-2233-4455',
      date: '2026-11-13 오후 14:00',
      message: '안방 붙박이장과 서랍장 옷장 수납 최적화 코칭을 요청합니다.',
      consultNote: '통합 상담 완료! 박지은 수석코치 전담 매칭 확정 대기.',
      status: '코치배정',
      assignedCoach: '박지은 수석 코치'
    },
    {
      id: 'CS-106',
      category: '👗 일상과 비움의 미학 (옷장/공간)',
      role: '자녀 대리',
      name: '박성훈',
      phone: '010-4455-6677',
      date: '2026-11-12 오전 11:30',
      message: '부모님 댁 주방 수납 및 침실 옷장 안전 동선 비움 현장 진행 중입니다.',
      consultNote: '현장 방문 완료. 동선 점검 및 옷장 비움 작업 진행 중.',
      status: '진행중',
      assignedCoach: '김서연 전문 코치'
    },
    {
      id: 'CS-107',
      category: '👗 일상과 비움의 미학 (옷장/공간)',
      role: '본인 어르신',
      name: '최명희 어르신',
      phone: '010-6677-8899',
      date: '2026-11-10 오후 16:00',
      message: '사계절 옷장 비움 및 아름다운 외출복 재정돈 컨설팅이 만족스럽게 완료되었습니다.',
      consultNote: '서비스 만족도 최상. 3개월 후 계절 옷장 점검 리텐션 등록.',
      status: '완료',
      completedAt: '2026-11-10T16:00:00.000Z',
      assignedCoach: '박지은 수석 코치'
    },

    // 📦 3호 기억의 계승 (유품/생전정리)
    {
      id: 'CS-102',
      category: '📦 기억의 계승 (유품/생전정리)',
      role: '본인 어르신',
      name: '최영철 어르신',
      phone: '010-7788-9900',
      date: '2026-11-13 오전 10:30',
      message: '서재에 오래 쌓인 책과 소장품을 후대에 전할 유품으로 우아하게 정돈하고 싶습니다.',
      consultNote: '통합 상담 완료! 이은영 전문 코치 배정 일정 조율.',
      status: '코치배정',
      assignedCoach: '이은영 전문 코치'
    },
    {
      id: 'CS-109',
      category: '📦 기억의 계승 (유품/생전정리)',
      role: '자녀 대리',
      name: '문태양',
      phone: '010-9900-2233',
      date: '2026-11-12 오후 15:00',
      message: '30년 세월 가재도구 선별 및 추억 앨범 디지털 유품 아카이빙 진행 중입니다.',
      consultNote: '현장 선별 작업 2일차 진행 중.',
      status: '진행중',
      assignedCoach: '박지은 수석 코치'
    },
    {
      id: 'CS-110',
      category: '📦 기억의 계승 (유품/생전정리)',
      role: '본인 어르신',
      name: '송순복 어르신',
      phone: '010-1122-3344',
      date: '2026-11-09 오전 10:00',
      message: '소장 고서화 및 생전 소장품 아카이빙 도록 제작이 완료되었습니다.',
      consultNote: '생전 유품 도록 양장본 출판 완료 및 전달.',
      status: '완료',
      completedAt: '2026-11-09T10:00:00.000Z',
      assignedCoach: '이은영 전문 코치'
    },

    // 💌 4호 아름다운 마침표 (생전 엔딩 파티)
    {
      id: 'CS-112',
      category: '💌 아름다운 마침표 (생전 엔딩 파티)',
      role: '자녀 대리',
      name: '강동훈',
      phone: '010-4455-8899',
      date: '2026-11-13 오후 15:40',
      message: '어머니 은퇴 및 생애 감사 엔딩 파티 전담 코치 배정 및 식순 협의 요청.',
      consultNote: '통합 상담 완료! 김서연 코치 배정.',
      status: '코치배정',
      assignedCoach: '김서연 전문 라이프 코치'
    },
    {
      id: 'CS-103',
      category: '💌 아름다운 마침표 (생전 엔딩 파티)',
      role: '자녀 대리',
      name: '정우진',
      phone: '010-5566-7788',
      date: '2026-11-12 오전 11:20',
      message: '부모님 결혼 50주년 기념 감사 회고 파티 기획 현장 진행 중입니다.',
      consultNote: '영상 제작 및 감사 편지 낭독 식순 리허설 진행 중.',
      status: '진행중',
      assignedCoach: '김서연 전문 라이프 코치'
    },
    {
      id: 'CS-113',
      category: '💌 아름다운 마침표 (생전 엔딩 파티)',
      role: '본인 어르신',
      name: '배정남 어르신',
      phone: '010-5566-9900',
      date: '2026-11-08 오후 17:00',
      message: '가족과 친지 30여 명이 함께한 생전 감사 회고 엔딩 파티가 감동 속에 성공적으로 완료되었습니다.',
      consultNote: '파티 사진집 및 영상 USB 제작 전달 완료. 가족 감사 편지 접수.',
      status: '완료',
      completedAt: '2026-11-08T17:00:00.000Z',
      assignedCoach: '김서연 전문 라이프 코치'
    }
  ];

  try {
    localStorage.setItem('seniorConsultList', JSON.stringify(defaultConsults));
  } catch(e){}
  return defaultConsults;
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

  if (currentBusinessTab === 'beauty') {
    const beautyList = getStoredBeautyBookings();
    renderBeautyPipeline(beautyList, meta);
  } else {
    const generalConsults = getStoredGeneralConsults();
    renderGeneralBusinessPipeline(currentBusinessTab, generalConsults, meta);
  }
}

// 7. 🌟 뷰티 라이프케어 3단계 실행 파이프라인 렌더링 (상담 완료·이관 건만 표시)
function renderBeautyPipeline(list, meta) {
  // 상담 미완료(step1) 건은 통합 고객 접수·상담함에서 관리하므로 제외
  const confirmedList = list.filter(i => resolveItemStep(i) !== 'step1');
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

  const beautyWrap = document.getElementById('beautyPipelineWrap');
  const generalWrap = document.getElementById('generalBusinessWrap');
  if (beautyWrap) beautyWrap.style.display = 'block';
  if (generalWrap) generalWrap.style.display = 'none';

  // 현재 파이프라인 단계에 따른 전용 화면 HTML 생성 및 주입
  if (beautyWrap) {
    beautyWrap.innerHTML = generateBeautyStepViewHtml(confirmedList, currentPipelineStep, meta, {
      all: total,
      step2: step2Count,
      step3: step3Count,
      step4: step4Count
    });
  }
}

// 7-1. 뷰티 단계별 전용 HTML 생성기 (상담 완료 이후 3단계 실행 파이프라인)
function generateBeautyStepViewHtml(list, step, meta, counts) {
  let html = '';

  // 1) 단계별 안내 배너 및 워크플로우 가이드
  html += `
    <div style="background: ${meta.bgLight}; border: 1.5px solid ${meta.borderColor}; border-radius: 14px; padding: 16px 20px; margin: 18px 0 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <h3 style="font-size: 1.06rem; font-weight: 850; color: ${meta.themeColor}; margin: 0;">
              ${getStepBannerTitle(step, meta)}
            </h3>
            <span class="badge" style="background: #ffffff; color: ${meta.themeColor}; border: 1px solid ${meta.themeColor}; font-size: 0.76rem; font-weight: 800; padding: 2px 8px; border-radius: 999px;">
              ${getStepBadgeText(step)}
            </span>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 6px 0 0; line-height: 1.45;">
            ${getStepBannerDesc(step, meta)}
          </p>
        </div>
        <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
          <span style="font-size: 0.78rem; background: #ffffff; padding: 5px 10px; border-radius: 8px; border: 1px solid var(--border-color); color: var(--text-secondary); font-weight: 700;">
            상담완료(접수함) ➔ ① 코치배정 ➔ ② 현장케어 ➔ ③ CRM 사후관리
          </span>
        </div>
      </div>
    </div>
  `;

  // 2) 단계별 본문 화면 분기 (step1 제거 — step2/step3/step4/all)
  if (step === 'step2' || step === 'step1') {
    html += generateStep2BeautyView(list, meta);
  } else if (step === 'step3') {
    html += generateStep3BeautyView(list, meta);
  } else if (step === 'step4') {
    html += generateStep4BeautyView(list, meta);
  } else {
    html += generateStepAllBeautyView(list, meta, counts);
  }

  return html;
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
                  <select class="setting-input" style="padding:4px 8px; font-size:0.84rem; font-weight:750;" onchange="assignBeautyCoach('${item.id}', this.value)">
                    <option value="미배정" ${coach.includes('미배정') ? 'selected' : ''}>-- 코치 선택 --</option>
                    <option value="김서연 전문 라이프 코치 (40대 시니어 뷰티&라이프스타일 1급)" ${coach.includes('김서연') ? 'selected' : ''}>김서연 코치 (1급)</option>
                    <option value="박지은 수석 코치 (시니어 뷰티&공간리셋 1급)" ${coach.includes('박지은') ? 'selected' : ''}>박지은 수석코치</option>
                    <option value="이은영 전문 코치 (시니어 라이프스타일 1급)" ${coach.includes('이은영') ? 'selected' : ''}>이은영 코치 (1급)</option>
                  </select>
                  <div style="font-size:0.72rem; color:var(--text-muted); margin-top:2px;">전담 매칭 만족도 98%</div>
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
                    <button type="button" class="btn-save-setting" onclick="transferStep2ToStep3('${item.id}', 'beauty')" style="padding: 5px 10px; font-size: 0.8rem; background: #059669; color: #fff; border: none; font-weight: 850; box-shadow: 0 2px 6px rgba(5,150,105,0.3); border-radius: 6px; width: 100%;" title="코치 배정 확정 후 ② 현장 케어 단계로 이관합니다">
                      <span>📸</span> 현장케어로 이관 ➔
                    </button>
                    <div style="display: flex; gap: 4px; width: 100%;">
                      <button type="button" class="btn-save-setting" onclick="openDispatchFromBeauty('${item.id}')" style="flex:1; padding:3px 6px; font-size:0.74rem; background:#fff7ed; color:#c2410c; border:1px solid #fdba74; font-weight:800;" title="공식 파견센터 등록 & 알림톡">
                        <span>🤝</span> 파견·카톡
                      </button>
                      <button type="button" onclick="returnToConsultInbox('${item.id}', 'beauty')" style="padding:3px 6px; font-size:0.74rem; background:#fff; color:var(--text-muted); border:1px solid #d1d5db; border-radius:4px; cursor:pointer;" title="추가 상담 필요 시 통합 고객 접수·상담함으로 돌려보냅니다">
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
                    <button type="button" class="btn-save-setting" onclick="transferStep3ToStep4('${item.id}', 'beauty')" style="padding: 5px 10px; font-size: 0.8rem; background: #7c3aed; color: #fff; border: none; font-weight: 850; box-shadow: 0 2px 6px rgba(124,58,237,0.3); border-radius: 6px; width: 100%;" title="케어 완료 승인 후 ③ CRM 사후 리텐션 화면으로 이관합니다">
                      <span>🎉</span> 케어완료 승인 ➔ CRM 이관
                    </button>
                    <div style="display: flex; gap: 4px; width: 100%;">
                      <button type="button" class="btn-save-setting" onclick="openBeautyCoachingModal('${item.id}')" style="flex:1; padding:3px 6px; font-size:0.74rem; background:#fee7ec; color:#b83354; border:1px solid #f8c8d2; font-weight:800;" title="180분 현장 코칭일지 작성/수정">
                        📝 일지
                      </button>
                      <button type="button" class="btn-save-setting" onclick="goToCoachControlForClient('${escapeHtml(item.seniorName)}')" style="flex:1; padding:3px 6px; font-size:0.74rem; background:#ecfdf5; color:#047857; border:1px solid #a7f3d0; font-weight:800;" title="현장관제&정산센터 이동">
                        📸 관제
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
    <!-- 상단 리텐션 통계 요약 카드 -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-bottom: 16px;">
      <div style="background:#fff; border:1px solid #e9d5ff; border-radius:10px; padding:12px 16px; border-left:4px solid #7c3aed;">
        <div style="font-size:0.78rem; color:var(--text-muted); font-weight:750;">누적 케어 완료 고객</div>
        <div style="font-size:1.4rem; font-weight:900; color:#7c3aed; margin-top:2px;">${cntTotal}명</div>
        <div style="font-size:0.74rem; color:var(--text-secondary);">평생 고객 안심 관리</div>
      </div>
      <div style="background:#fff; border:1px solid #bbf7d0; border-radius:10px; padding:12px 16px; border-left:4px solid #22c55e;">
        <div style="font-size:0.78rem; color:var(--text-muted); font-weight:750;">3개월 무료 재진단 알림톡</div>
        <div style="font-size:1.4rem; font-weight:900; color:#15803d; margin-top:2px;">${cnt3mDue}건 대기</div>
        <div style="font-size:0.74rem; color:var(--text-secondary);">=EDATE 3개월 자동 추적</div>
      </div>
      <div style="background:#fff; border:1px solid #fecdd3; border-radius:10px; padding:12px 16px; border-left:4px solid #e11d48;">
        <div style="font-size:0.78rem; color:var(--text-muted); font-weight:750;">6개월 AGAIN180 감사 할인 쿠폰</div>
        <div style="font-size:1.4rem; font-weight:900; color:#be123c; margin-top:2px;">${cnt6mDue}건 활성</div>
        <div style="font-size:0.74rem; color:var(--text-secondary);">재계약 및 선순환 리텐션</div>
      </div>
      <div style="background:#fff; border:1px solid #fed7aa; border-radius:10px; padding:12px 16px; border-left:4px solid #f97316;">
        <div style="font-size:0.78rem; color:var(--text-muted); font-weight:750;">고객 만족도 / 재이용률</div>
        <div style="font-size:1.4rem; font-weight:900; color:#c2410c; margin-top:2px;">98.4%</div>
        <div style="font-size:0.74rem; color:var(--text-secondary);">⭐ 5.0 만점 추천율</div>
      </div>
    </div>

    <!-- 4단계 전용 리텐션 테이블 -->
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

// 7-5. [전체보기: 종합 3단계 실행 파이프라인 보드] 생성기 (상담 완료·확정 고객 전용)
function generateStepAllBeautyView(list, meta, counts) {
  return `
    <!-- 3단계 실행 파이프라인 칸반 플로우 요약 카드 -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-bottom: 20px;">
      <div class="kpi-filter-card" onclick="switchPipelineStep('step2')" style="border-left: 4px solid #0284c7; cursor:pointer;" title="클릭 시 1단계 코치배정 화면으로 이동">
        <div style="font-size:0.76rem; color:var(--text-muted); font-weight:800;">1단계 · 상담완료 이관</div>
        <div style="font-size:1.02rem; font-weight:850; color:#0284c7; margin:2px 0;">🤝 공인 코치 배정</div>
        <div style="font-size:1.3rem; font-weight:900; color:#0284c7;">${counts.step2}건</div>
        <div style="font-size:0.72rem; color:var(--text-muted); margin-top:2px;">1:1 코치 매칭 &amp; 방문 일정</div>
      </div>
      <div class="kpi-filter-card" onclick="switchPipelineStep('step3')" style="border-left: 4px solid #059669; cursor:pointer;" title="클릭 시 2단계 현장케어 화면으로 이동">
        <div style="font-size:0.76rem; color:var(--text-muted); font-weight:800;">2단계 · 현장 수행</div>
        <div style="font-size:1.02rem; font-weight:850; color:#059669; margin:2px 0;">📸 현장 케어 / 일지</div>
        <div style="font-size:1.3rem; font-weight:900; color:#059669;">${counts.step3}건</div>
        <div style="font-size:0.72rem; color:var(--text-muted); margin-top:2px;">180분 SOP &amp; 사진 검수</div>
      </div>
      <div class="kpi-filter-card" onclick="switchPipelineStep('step4')" style="border-left: 4px solid #7c3aed; cursor:pointer;" title="클릭 시 3단계 CRM리텐션 화면으로 이동">
        <div style="font-size:0.76rem; color:var(--text-muted); font-weight:800;">3단계 · 사후 관리</div>
        <div style="font-size:1.02rem; font-weight:850; color:#7c3aed; margin:2px 0;">🔄 CRM 사후 리텐션</div>
        <div style="font-size:1.3rem; font-weight:900; color:#7c3aed;">${counts.step4}건</div>
        <div style="font-size:0.72rem; color:var(--text-muted); margin-top:2px;">3·6개월 루프 &amp; AGAIN180</div>
      </div>
    </div>

    <!-- 전체 마스터 테이블 -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin: 18px 0 10px;">
      <h3 style="font-size: 1.04rem; font-weight: 850; color: ${meta.themeColor}; margin: 0; display: flex; align-items: center; gap: 6px;">
        <span>📋</span> 상담 확정 고객 — 180분 케어 전체 실행 목록
      </h3>
    </div>
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th style="width: 105px;">예약 ID</th>
            <th style="width: 110px; text-align: center;">현재 파이프라인</th>
            <th style="width: 130px;">신청인 (관계)</th>
            <th style="width: 130px;">대상 어르신</th>
            <th style="width: 120px;">연락처</th>
            <th>확정 일시 &amp; 장소</th>
            <th style="width: 140px;">배정 코치</th>
            <th style="width: 105px; text-align: center;">처리 상태</th>
            <th style="width: 145px; text-align: center;">단계별 바로가기</th>
          </tr>
        </thead>
        <tbody>
          ${list.length === 0 ? `
            <tr><td colspan="9" style="text-align:center; padding:36px; color:var(--text-muted);">
              상담이 완료되어 이관된 뷰티 케어 고객이 아직 없습니다.
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
                  <button type="button" class="btn-save-setting" onclick="switchPipelineStep('${stepId}')" style="padding: 4px 8px; font-size: 0.78rem; background: #fff; border: 1.5px solid var(--border-color); color: var(--text-primary); font-weight: 800; border-radius: 6px;">
                    <span>👉</span> 해당 단계 보기
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

// 8. 🌟 기타 웰라이프 비즈니스(2호 옷장 / 3호 유품 / 4호 엔딩파티) 3단계 실행 파이프라인 렌더링
function renderGeneralBusinessPipeline(biz, consults, meta) {
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
  // 상담 완료 이후(step2~step4) 확정 고객만 표시 (상담 미완료 step1은 통합 상담함에서 전담)
  const list = consults.filter(c => {
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

  if (generalWrap) {
    generalWrap.innerHTML = generateGeneralStepViewHtml(list, currentPipelineStep, meta, biz, {
      all: total,
      step2: step2Count,
      step3: step3Count,
      step4: step4Count
    });
  }
}

// 8-1. 일반 비즈니스 3단계 실행 파이프라인 HTML 생성기
function generateGeneralStepViewHtml(list, step, meta, biz, counts) {
  let html = `
    <div style="background: ${meta.bgLight}; border: 1.5px solid ${meta.borderColor}; border-radius: 14px; padding: 16px 20px; margin: 18px 0 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <h3 style="font-size: 1.06rem; font-weight: 850; color: ${meta.themeColor}; margin: 0;">
              ${getStepBannerTitle(step, meta)}
            </h3>
            <span class="badge" style="background: #ffffff; color: ${meta.themeColor}; border: 1px solid ${meta.themeColor}; font-size: 0.76rem; font-weight: 800; padding: 2px 8px; border-radius: 999px;">
              ${getStepBadgeText(step)}
            </span>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 6px 0 0; line-height: 1.45;">
            ${getStepBannerDesc(step, meta)}
          </p>
        </div>
        <div style="display: flex; gap: 6px; align-items: center;">
          <span style="font-size: 0.78rem; background: #ffffff; padding: 5px 10px; border-radius: 8px; border: 1px solid var(--border-color); color: var(--text-secondary); font-weight: 700;">
            상담완료(접수함) ➔ ① 코치배정 ➔ ② 현장진행 ➔ ③ CRM 사후관리
          </span>
        </div>
      </div>
    </div>
  `;

  let filtered = list;
  if (step === 'step2' || step === 'step1') {
    filtered = list.filter(i => resolveItemStep(i) === 'step2');
  } else if (step === 'step3') {
    filtered = list.filter(i => resolveItemStep(i) === 'step3');
  } else if (step === 'step4') {
    filtered = list.filter(i => resolveItemStep(i) === 'step4');
  }

  html += `
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th style="width: 95px;">관리 ID</th>
            <th style="width: 110px; text-align: center;">진행 단계</th>
            <th style="width: 120px;">고객 성함 (구분)</th>
            <th style="width: 120px;">연락처</th>
            <th>상담 인수인계 내용 / 메모</th>
            <th style="width: 150px;">담당 배정 코치</th>
            <th style="width: 105px; text-align: center;">진행 상태</th>
            <th style="width: 165px; text-align: center;">단계별 액션 &amp; 이관</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.length === 0 ? `
            <tr><td colspan="8" style="text-align:center; padding:36px; color:var(--text-muted);">
              현재 [${getStepBadgeText(step)}] 단계에 해당하는 상담완료 건이 없습니다.<br>
              <span style="font-size:0.8rem;">[통합 고객 접수 · 상담]에서 상담 상태를 <strong>✓ 완료</strong>로 변경하면 이곳으로 자동 이관됩니다.</span>
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
                  <select class="setting-input" style="padding:4px 8px; font-size:0.84rem;" onchange="assignGeneralCoach('${item.id}', this.value)">
                    <option value="미배정" ${coach.includes('미배정') ? 'selected' : ''}>-- 코치 선택 --</option>
                    <option value="박지은 수석 코치" ${coach.includes('박지은') ? 'selected' : ''}>박지은 수석코치</option>
                    <option value="김서연 전문 코치" ${coach.includes('김서연') ? 'selected' : ''}>김서연 전문코치</option>
                    <option value="이은영 전문 코치" ${coach.includes('이은영') ? 'selected' : ''}>이은영 전문코치</option>
                  </select>
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

  return html;
}

// 8-2. 일반 비즈니스 단계별 액션 버튼 생성기 (3단계 실행 전용)
function getGeneralStepActionHtml(item, step, biz) {
  if (step === 'step2') {
    return `
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <button type="button" class="btn-save-setting" onclick="transferGeneralStep2ToStep3('${item.id}')" style="padding: 4px 8px; font-size: 0.78rem; background: #059669; color: #fff; border: none; font-weight: 850; border-radius: 6px;">
          📸 현장진행 이관 ➔
        </button>
        <div style="display: flex; gap: 4px;">
          <button type="button" class="btn-save-setting" onclick="openDispatchFromGeneral('${item.id}')" style="flex:1; padding: 3px 6px; font-size: 0.74rem; background: #fff7ed; color: #c2410c; border: 1px solid #fdba74; font-weight: 800;">
            🤝 파견·카톡
          </button>
          <button type="button" onclick="returnToConsultInbox('${item.id}', '${biz}')" style="padding: 3px 6px; font-size: 0.74rem; background: #fff; color: var(--text-muted); border: 1px solid #d1d5db; border-radius: 4px; cursor: pointer;" title="추가 상담 필요 시 통합 상담함으로 돌려보냅니다">
            ↩️ 재상담
          </button>
        </div>
      </div>
    `;
  } else if (step === 'step3') {
    return `
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <button type="button" class="btn-save-setting" onclick="transferGeneralStep3ToStep4('${item.id}')" style="padding: 4px 8px; font-size: 0.78rem; background: #7c3aed; color: #fff; border: none; font-weight: 850; border-radius: 6px;">
          🎉 완료 승인 ➔ CRM 이관
        </button>
        <button type="button" class="btn-save-setting" onclick="goToCoachControlForClient('${escapeHtml(item.name)}')" style="padding: 3px 6px; font-size: 0.74rem; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; font-weight: 800;">
          📸 현장관제
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
function handoffConsultToWellnessBusiness(consultItem, bizKey) {
  if (!consultItem) return { ok: false };
  const targetBiz = bizKey || 'beauty';
  const nowStr = new Date().toISOString();
  const displayDate = new Date().toLocaleDateString('ko-KR') + ' 상담완료 이관';
  const cleanNote = consultItem.counselMemo
    ? `[상담결과] ${consultItem.counselMemo}` + (consultItem.note ? ` / 요청: ${consultItem.note}` : '')
    : (consultItem.note || consultItem.memo || '통합 고객 접수·상담함에서 상담 완료 후 자동 이관됨');

  if (targetBiz === 'beauty') {
    const list = getStoredBeautyBookings();
    // 1) 이미 이관된 건 또는 원본 예약 ID가 있으면 중복 생성 대신 상태만 코치배정으로 승격
    let existing = list.find(x =>
      (x.sourceConsultId && x.sourceConsultId === consultItem.id) ||
      (consultItem.sourceBookingId && x.id === consultItem.sourceBookingId)
    );
    if (existing) {
      if (resolveItemStep(existing) === 'step1') {
        existing.status = '코치배정';
      }
      existing.consultNote = cleanNote;
      localStorage.setItem('seniorBeautyBookings', JSON.stringify(list));
      renderBusinessMasterDashboard();
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
    renderBusinessMasterDashboard();
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
    renderBusinessMasterDashboard();
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
  renderBusinessMasterDashboard();
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

// [실시간 웰라이프 확정/진행 건수 집계 (통합관제 홈 연동)]
function getWellnessActiveCounts() {
  const bList = getStoredBeautyBookings().filter(i => resolveItemStep(i) !== 'step1');
  const gList = getStoredGeneralConsults().filter(i => resolveItemStep(i) !== 'step1');
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
    item.assignedCoach = coachName;
    localStorage.setItem('seniorBeautyBookings', JSON.stringify(list));
    alert(`${id} 건에 [${coachName}] 배정이 완료되었습니다.`);
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
    item.assignedCoach = coachName;
    localStorage.setItem('seniorConsultList', JSON.stringify(list));
    alert(`${id} 건에 [${coachName}] 배정이 완료되었습니다.`);
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

// 13. 엑셀(CSV) 다운로드 (상담 완료 확정 고객 대상)
function exportBusinessCSV() {
  if (currentBusinessTab === 'beauty') {
    const list = getStoredBeautyBookings().filter(i => resolveItemStep(i) !== 'step1');
    let csv = '\uFEFF예약ID,현재단계,신청인,관계,어르신성함,연락처,방문일시,진행장소,주소,상담인수인계메모,배정코치,처리상태,수분전,수분후,탄력,엔딩노트\n';
    list.forEach(i => {
      const diag = i.diagnostic || {};
      const stepName = getStepBadgeText(resolveItemStep(i));
      csv += `"${i.id}","${stepName}","${i.applicantName}","${i.role}","${i.seniorName}","${i.phone}","${i.visitDate}","${i.place}","${i.address || ''}","${(i.consultNote || '').replace(/"/g, '""')}","${i.assignedCoach}","${i.status}","${diag.moistureBefore || ''}","${diag.moistureAfter || ''}","${diag.elasticityAfter || ''}","${(diag.endingNote || '').replace(/"/g, '""')}"\n`;
    });
    downloadCSVFile(csv, `senior_beauty_crm_${new Date().toISOString().slice(0,10)}.csv`);
  } else {
    const consults = getStoredGeneralConsults().filter(i => resolveItemStep(i) !== 'step1');
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

// 14. 공식 코치 배정 & 현장관제 연동
function openDispatchFromBeauty(id) {
  const list = getStoredBeautyBookings();
  const item = list.find(x => x.id === id);
  if (!item) return;
  if (typeof openDispatchModalForClient === 'function') {
    openDispatchModalForClient({
      name: item.seniorName || item.applicantName,
      phone: item.phone,
      service: '💄 화려한 외출 (시니어 메이크업)',
      date: item.visitDate || '',
      address: (item.place || '') + (item.address ? ' ' + item.address : ''),
      coach: item.assignedCoach || '',
      fee: 150000,
      notes: `[뷰티 180분 예약 연동] 신청인: ${item.applicantName}(${item.role}), 어르신: ${item.seniorName}, 예약ID: ${item.id}`
    });
  } else if (typeof switchTab === 'function') {
    switchTab('tabCoachControl');
    if (typeof openDispatchModal === 'function') openDispatchModal();
  }
}

function openDispatchFromGeneral(id) {
  const list = getStoredGeneralConsults();
  const item = list.find(x => x.id === id);
  if (!item) return;
  if (typeof openDispatchModalForClient === 'function') {
    openDispatchModalForClient({
      name: item.name,
      phone: item.phone,
      service: item.category || '👗 2호 일상과 비움의 미학 (옷장&서재 정리)',
      date: item.date || '',
      address: '고객 자택 (상담 후 확정)',
      coach: item.assignedCoach || '',
      fee: 150000,
      notes: `[웰라이프 상담완료 이관 연동] 관리ID: ${item.id} / 내용: ${item.message || ''}`
    });
  } else if (typeof switchTab === 'function') {
    switchTab('tabCoachControl');
    if (typeof openDispatchModal === 'function') openDispatchModal();
  }
}

function goToCoachControlForClient(name) {
  if (typeof switchTab === 'function') {
    switchTab('tabCoachControl');
  }
  const cleanKeyword = (name || '').replace(/\s*\([^)]*\)/g, '').replace(/어머니|어르신|님|모친/g, '').trim();
  const searchInput = document.getElementById('inputControlSearch');
  if (searchInput) {
    searchInput.value = cleanKeyword || name || '';
  }
  if (typeof filterControlFeed === 'function') {
    const allBtn = document.getElementById('btnFilterControl_all');
    filterControlFeed('all', allBtn);
  }
  if (typeof handleControlSearch === 'function') {
    handleControlSearch(cleanKeyword || name || '');
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
