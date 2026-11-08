// =========================================================================
// 여백과결 - 4대 비즈니스 통합 관제 센터 & CRM 시스템 (beauty-crm.js)
// 1호 시니어 뷰티 라이프케어 180분 원스톱 파이프라인 (상담 ➔ 배정 ➔ 현장 ➔ CRM)
// 2호 옷장 정리 / 3호 유품 정리 / 4호 엔딩 파티 / 5호 디지털 자서전 통합 관제
// =========================================================================

let currentBusinessTab = 'beauty'; // 'beauty', 'wardrobe', 'legacy', 'party', 'memoir'
let currentPipelineStep = 'all';    // 'all', 'step1', 'step2', 'step3', 'step4'

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

  // 기본 견본 데이터 (사업계획서 예시)
  const defaultList = [
    {
      id: 'BK-202611',
      programType: '시니어 뷰티 라이프케어',
      programTitle: '특별한 날, 화려한 외출 (180분 SOP)',
      role: '자녀 대리 신청 (3040 세대)',
      applicantName: '김민수',
      phone: '010-9613-5913',
      seniorName: '이영숙 어머니 (72세)',
      place: '자택 방문 1:1 케어',
      visitDate: '2026-11-10T10:00',
      address: '서울시 서초구 반포대로 12길 (301호)',
      options: ['목·승모근 림프 이완 테라피', '기미·주름 커버 투명 윤광 메이크업', '주거 공간 낙상 안전 동선 점검'],
      memo: '어머니께서 오랜만에 외출하시길 무척 기대하고 계십니다.',
      status: '코치배정',
      assignedCoach: '김서연 전문 라이프 코치 (40대 시니어 뷰티&라이프스타일 1급)',
      coachPhone: '010-9613-5913',
      createdAt: '2026-11-08T09:00:00.000Z',
      completedAt: '2026-11-08T12:00:00.000Z',
      diagnostic: {
        moistureBefore: 24,
        moistureAfter: 68,
        elasticityBefore: '보통 이하',
        elasticityAfter: '매우 우수 (윤광 회복)',
        wardrobe: '소장 실크 플라워 스카프 + 베이지 투피스 매칭',
        safetyChecked: true,
        endingNote: '오늘 거울을 마주하며 지난 40년 세월 중 가장 환하게 웃어보았습니다. 젊은 시절 내가 얼마나 눈부셨는지 다시 깨닫게 해준 소중한 3시간이었습니다. 사랑하는 가족에게 고마움을 전합니다.'
      }
    }
  ];

  try {
    localStorage.setItem('seniorBeautyBookings', JSON.stringify(defaultList));
  } catch(e){}
  return defaultList;
}

// 2. 통합 일반 상담 신청 내역 조회 (자가진단 및 원터치 상담)
function getStoredGeneralConsults() {
  try {
    const raw = localStorage.getItem('seniorConsultList');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch(e) {}

  // 기본 견본 데이터
  const defaultConsults = [
    {
      id: 'CS-101',
      category: '👗 일상과 비움의 미학 (옷장/공간)',
      role: '자녀 대리',
      name: '이지현',
      phone: '010-3344-5566',
      date: '2026-11-08 오전 10:15',
      message: '어머니 댁 옷장 정리 및 겨울 외출복 동선 수납 컨설팅을 희망합니다.',
      status: '상담대기',
      assignedCoach: '박지은 수석 코치'
    },
    {
      id: 'CS-102',
      category: '📦 기억의 계승 (유품/생전정리)',
      role: '본인 어르신',
      name: '최영철 어르신',
      phone: '010-7788-9900',
      date: '2026-11-07 오후 14:30',
      message: '서재에 오래 쌓인 책과 소장품을 후대에 전할 유품으로 우아하게 정돈하고 싶습니다.',
      status: '코치배정',
      assignedCoach: '이은영 전문 코치'
    },
    {
      id: 'CS-103',
      category: '💌 아름다운 마침표 (생전 엔딩 파티)',
      role: '자녀 대리',
      name: '정우진',
      phone: '010-5566-7788',
      date: '2026-11-06 오전 11:20',
      message: '부모님 결혼 50주년 기념 감사 회고 파티 기획을 상담받고 싶습니다.',
      status: '진행중',
      assignedCoach: '김서연 전문 라이프 코치'
    },
    {
      id: 'CS-104',
      category: '✍️ 디지털 자서전 (생애사 인터뷰)',
      role: '본인 어르신',
      name: '한상훈 어르신',
      phone: '010-8899-0011',
      date: '2026-11-05 오후 16:00',
      message: '청춘 시절 교직 생활의 발자취를 양장본 회고록으로 남기고자 합니다.',
      status: '상담대기',
      assignedCoach: '미배정'
    }
  ];

  try {
    localStorage.setItem('seniorConsultList', JSON.stringify(defaultConsults));
  } catch(e){}
  return defaultConsults;
}

// 3. 4대 비즈니스 탭 전환
function switchBusinessMasterTab(biz) {
  currentBusinessTab = biz;
  
  // 버튼 스타일 업데이트
  const tabs = ['beauty', 'wardrobe', 'legacy', 'party', 'memoir'];
  tabs.forEach(t => {
    const btn = document.getElementById(`bizTabBtn_${t}`);
    if (btn) {
      if (t === biz) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
  });

  // 비즈니스 설정 카드 표시 제어
  const diagLinkCard = document.getElementById('bizDiagLinksCard');
  const memoirBannerCard = document.getElementById('bizMemoirBannerCard');
  if (diagLinkCard) {
    diagLinkCard.style.display = (biz === 'beauty' || biz === 'wardrobe' || biz === 'legacy' || biz === 'party') ? 'block' : 'none';
  }
  if (memoirBannerCard) {
    memoirBannerCard.style.display = (biz === 'memoir') ? 'block' : 'none';
  }

  renderBusinessMasterDashboard();
}

// 4. 파이프라인 단계 필터링 (전체, 상담, 코치배정, 현장실행, CRM)
function switchPipelineStep(step) {
  currentPipelineStep = step;
  const steps = ['all', 'step1', 'step2', 'step3', 'step4'];
  steps.forEach(s => {
    const btn = document.getElementById(`pipelineStepBtn_${s}`);
    if (btn) {
      if (s === step) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
  });
  renderBusinessMasterDashboard();
}

// 5. 비즈니스 마스터 대시보드 메인 렌더링 함수
function renderBusinessMasterDashboard() {
  const beautyList = getStoredBeautyBookings();
  const generalConsults = getStoredGeneralConsults();

  // 비즈니스 메타 정보 설정
  const BIZ_META = {
    beauty: {
      name: '💄 1호 시니어 뷰티 라이프케어',
      desc: '‘특별한 날, 화려한 외출’ 180분 표준 프로토콜(SOP) 맞춤 케어 및 사후 리텐션 관리',
      badge: '180분 SOP 시그니처',
      themeColor: '#b83354',
      bgLight: '#fff0f3'
    },
    wardrobe: {
      name: '👗 2호 일상과 비움의 미학',
      desc: '삶의 흔적을 정돈하고 일상복과 외출복의 아름다운 구분, 인체공학적 동선 수납 컨설팅',
      badge: '공간 리셋 & 수납',
      themeColor: '#2b7a4b',
      bgLight: '#edf7f1'
    },
    legacy: {
      name: '📦 3호 기억의 계승',
      desc: '오래된 짐과 세월의 흔적을 비우고, 의미 있는 유품으로 정돈하여 후대에 전하는 안심 동행',
      badge: '유품 아카이빙',
      themeColor: '#9a6528',
      bgLight: '#fdf6ed'
    },
    party: {
      name: '💌 4호 아름다운 마침표와 감사',
      desc: '고마운 사람들을 초대해 감사를 전하는 생전 엔딩 파티 및 따뜻한 인생 감사 서사 기획',
      badge: '생전 엔딩 파티',
      themeColor: '#7a3594',
      bgLight: '#f9f0fd'
    },
    memoir: {
      name: '✍️ 5호 내 인생의 서사, 디지털 자서전',
      desc: '찾아가는 1:1 구술 채록과 옛 사진 복원으로 삶의 궤적을 명작 회고록과 양장본으로 기록',
      badge: '생애사 출판',
      themeColor: '#1d4ed8',
      bgLight: '#eff6ff'
    }
  };

  const meta = BIZ_META[currentBusinessTab] || BIZ_META.beauty;

  // 헤더 정보 업데이트
  const titleEl = document.getElementById('currentBizTitle');
  const descEl = document.getElementById('currentBizDesc');
  const badgeEl = document.getElementById('currentBizBadge');
  if (titleEl) titleEl.textContent = meta.name;
  if (descEl) descEl.textContent = meta.desc;
  if (badgeEl) {
    badgeEl.textContent = meta.badge;
    badgeEl.style.color = meta.themeColor;
    badgeEl.style.background = meta.bgLight;
    badgeEl.style.borderColor = meta.themeColor;
  }

  // 1) 뷰티 라이프케어 렌더링
  if (currentBusinessTab === 'beauty') {
    renderBeautyPipeline(beautyList);
  } else {
    // 2) 기타 비즈니스(옷장, 유품, 엔딩파티, 자서전) 렌더링
    renderGeneralBusinessPipeline(currentBusinessTab, generalConsults);
  }
}

// 6. 뷰티 라이프케어 4단계 파이프라인 렌더링
function renderBeautyPipeline(list) {
  // KPI 계산
  const total = list.length;
  const assigned = list.filter(i => i.status === '코치배정' || i.assignedCoach).length;
  const completed = list.filter(i => i.status === '케어완료' || i.completedAt).length;
  const reminders = completed;

  const kpi1 = document.getElementById('bizKpi_lead');
  const kpi2 = document.getElementById('bizKpi_assigned');
  const kpi3 = document.getElementById('bizKpi_done');
  const kpi4 = document.getElementById('bizKpi_retention');

  if (kpi1) kpi1.textContent = `${total}건`;
  if (kpi2) kpi2.textContent = `${assigned}건`;
  if (kpi3) kpi3.textContent = `${completed}건`;
  if (kpi4) kpi4.textContent = `${reminders}건`;

  // 뷰티 전용 테이블 컨테이너 표시
  const beautyWrap = document.getElementById('beautyPipelineWrap');
  const generalWrap = document.getElementById('generalBusinessWrap');
  if (beautyWrap) beautyWrap.style.display = 'block';
  if (generalWrap) generalWrap.style.display = 'none';

  // 파이프라인 단계별 필터링
  let filtered = list;
  if (currentPipelineStep === 'step1') {
    filtered = list.filter(i => i.status === '접수완료' || i.status === '상담대기' || i.status === '상담중');
  } else if (currentPipelineStep === 'step2') {
    filtered = list.filter(i => i.status === '코치배정' || i.status === '배정대기');
  } else if (currentPipelineStep === 'step3') {
    filtered = list.filter(i => i.status === '진행중' || i.status === '케어완료');
  } else if (currentPipelineStep === 'step4') {
    filtered = list.filter(i => i.completedAt || i.status === '케어완료');
  }

  // 1. 마스터 파이프라인 테이블
  const bTable = document.getElementById('beautyBookingTableBody');
  if (bTable) {
    if (filtered.length === 0) {
      bTable.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:32px; color:var(--text-muted);">해당 단계에 진행 중인 건이 없습니다.</td></tr>`;
    } else {
      bTable.innerHTML = filtered.map(item => {
        const hasPhoto = !!item.photoBase64;
        const coach = item.assignedCoach || '김서연 전문 라이프 코치';
        return `
          <tr>
            <td><strong style="color: #b83354;">${escapeHtml(item.id)}</strong></td>
            <td>
              <strong>${escapeHtml(item.applicantName)}</strong>
              <div style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(item.role)}</div>
            </td>
            <td>
              <strong>${escapeHtml(item.seniorName)}</strong>
            </td>
            <td>
              <a href="tel:${escapeHtml(item.phone)}" style="color:var(--accent); font-weight:750;">${escapeHtml(item.phone)}</a>
            </td>
            <td>
              <span style="font-weight:750;">${escapeHtml((item.visitDate || '').replace('T', ' '))}</span>
              <div style="font-size:0.78rem; color:var(--text-muted);">${escapeHtml(item.place)} - ${escapeHtml(item.address || '')}</div>
            </td>
            <td style="text-align:center;">
              ${hasPhoto ? '<span style="color:#2b7a4b; font-weight:850;">📸 등록됨</span>' : '<span style="color:var(--text-muted);">현장지참</span>'}
            </td>
            <td>
              <select class="setting-input" style="padding:4px 8px; font-size:0.84rem;" onchange="assignBeautyCoach('${item.id}', this.value)">
                <option value="김서연 전문 라이프 코치 (40대 시니어 뷰티&라이프스타일 1급)" ${coach.includes('김서연') ? 'selected' : ''}>김서연 코치 (1급)</option>
                <option value="박지은 수석 코치 (시니어 뷰티&공간리셋 1급)" ${coach.includes('박지은') ? 'selected' : ''}>박지은 수석코치</option>
                <option value="이은영 전문 코치 (시니어 라이프스타일 1급)" ${coach.includes('이은영') ? 'selected' : ''}>이은영 코치</option>
              </select>
            </td>
            <td style="text-align:center;">
              <select class="setting-input" style="padding:4px 8px; font-size:0.84rem; font-weight:800; color:${item.status === '케어완료' ? '#2e7d32' : '#b83354'};" onchange="changeBeautyStatus('${item.id}', this.value)">
                <option value="접수완료" ${item.status === '접수완료' ? 'selected' : ''}>① 접수/상담</option>
                <option value="코치배정" ${item.status === '코치배정' ? 'selected' : ''}>② 코치배정</option>
                <option value="케어완료" ${item.status === '케어완료' ? 'selected' : ''}>③ 케어완료</option>
              </select>
            </td>
            <td style="text-align:center; white-space:nowrap;">
              <div style="display:inline-flex; gap:4px; flex-wrap:wrap; justify-content:center;">
                <button type="button" class="btn-save-setting" onclick="openDispatchFromBeauty('${item.id}')" style="padding:4px 8px; font-size:0.78rem; background:#fff7ed; color:#c2410c; border:1px solid #fdba74; font-weight:850; display:inline-flex; align-items:center; gap:3px;" title="공식 파견센터에 등록하고 코치에게 카톡 일정을 바로 전송합니다">
                  <span>🤝</span> 코치 배정&amp;카톡
                </button>
                <button type="button" class="btn-save-setting" onclick="goToCoachControlForClient('${escapeHtml(item.seniorName)}')" style="padding:4px 8px; font-size:0.78rem; background:#ecfdf5; color:#047857; border:1px solid #a7f3d0; font-weight:850; display:inline-flex; align-items:center; gap:3px;" title="현장관제&정산센터로 이동하여 사진 3종 검수 및 송금을 진행합니다">
                  <span>📸</span> 현장관제&amp;송금
                </button>
                <button type="button" class="btn-save-setting" onclick="openBeautyCoachingModal('${item.id}')" style="padding:4px 8px; font-size:0.78rem; background:#fee7ec; color:#b83354; border:1px solid #f8c8d2; font-weight:800;">
                  📝 180분 일지
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  // 2. 4단계 사후관리 & 리텐션 테이블
  const fTable = document.getElementById('beautyFollowupTableBody');
  if (fTable) {
    fTable.innerHTML = list.map(item => {
      const compDate = item.completedAt ? new Date(item.completedAt) : new Date();
      const d3 = new Date(compDate); d3.setMonth(d3.getMonth() + 3);
      const d6 = new Date(compDate); d6.setMonth(d6.getMonth() + 6);
      const fmt = (d) => `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;

      return `
        <tr>
          <td><strong style="color: #b83354;">${escapeHtml(item.id)}</strong></td>
          <td><strong>${escapeHtml(item.seniorName)}</strong></td>
          <td>${fmt(compDate)}</td>
          <td><span style="color:#2e7d32; font-weight:800;">${fmt(d3)}</span></td>
          <td style="text-align:center;"><span class="badge" style="background:#e8f5e9; color:#2e7d32; padding:3px 8px; border-radius:999px; font-size:0.8rem;">무료재진단 대상</span></td>
          <td><span style="color:#b83354; font-weight:800;">${fmt(d6)}</span></td>
          <td style="text-align:center;"><span class="badge" style="background:#fee7ec; color:#b83354; padding:3px 8px; border-radius:999px; font-size:0.8rem;">AGAIN180 활성</span></td>
          <td style="text-align:center;">
            <button type="button" class="btn-save-setting" onclick="alert('[${item.seniorName} 어르신]께 3개월 차 무료 피부 재진단 및 안부 알림톡이 전송되었습니다!')" style="padding:4px 8px; font-size:0.8rem; background:#2b7a4b; color:#fff; border:none;">
              ✉️ 알림톡
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }
}

// 7. 기타 비즈니스(옷장, 유품, 엔딩파티, 자서전) 4단계 파이프라인 렌더링
function renderGeneralBusinessPipeline(biz, consults) {
  const beautyWrap = document.getElementById('beautyPipelineWrap');
  const generalWrap = document.getElementById('generalBusinessWrap');
  if (beautyWrap) beautyWrap.style.display = 'none';
  if (generalWrap) generalWrap.style.display = 'block';

  // 비즈니스별 키워드 매칭
  const BIZ_KEYS = {
    wardrobe: ['옷장', '수납', '공간', 'wardrobe'],
    legacy: ['유품', '오래된', '짐', 'legacy', '생전'],
    party: ['엔딩', '파티', 'party', '마침표'],
    memoir: ['자서전', '회고록', '생애사', 'memoir']
  };

  const keys = BIZ_KEYS[biz] || [];
  const list = consults.filter(c => {
    const text = (c.category || '') + ' ' + (c.message || '');
    return keys.some(k => text.includes(k));
  });

  // KPI 계산
  const total = list.length;
  const assigned = list.filter(i => i.status === '코치배정' || (i.assignedCoach && i.assignedCoach !== '미배정')).length;
  const completed = list.filter(i => i.status === '완료').length;
  const active = total - completed;

  const kpi1 = document.getElementById('bizKpi_lead');
  const kpi2 = document.getElementById('bizKpi_assigned');
  const kpi3 = document.getElementById('bizKpi_done');
  const kpi4 = document.getElementById('bizKpi_retention');

  if (kpi1) kpi1.textContent = `${total}건`;
  if (kpi2) kpi2.textContent = `${assigned}건`;
  if (kpi3) kpi3.textContent = `${completed}건`;
  if (kpi4) kpi4.textContent = `${active}건`;

  // 테이블 렌더링
  const gTable = document.getElementById('generalBusinessTableBody');
  if (gTable) {
    if (list.length === 0) {
      gTable.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--text-muted);">현재 접수된 상담 내역이 없습니다.</td></tr>`;
    } else {
      gTable.innerHTML = list.map(item => {
        const coach = item.assignedCoach || '박지은 수석 코치';
        return `
          <tr>
            <td><strong style="color:var(--accent);">${escapeHtml(item.id)}</strong></td>
            <td>
              <strong>${escapeHtml(item.name)}</strong>
              <div style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(item.role || '신청자')}</div>
            </td>
            <td>
              <a href="tel:${escapeHtml(item.phone)}" style="color:var(--accent); font-weight:750;">${escapeHtml(item.phone)}</a>
            </td>
            <td>
              <div style="font-size:0.86rem; color:var(--text-primary); line-height:1.45;">${escapeHtml(item.message)}</div>
              <div style="font-size:0.75rem; color:var(--text-muted); margin-top:3px;">접수일: ${escapeHtml(item.date)}</div>
            </td>
            <td>
              <select class="setting-input" style="padding:4px 8px; font-size:0.84rem;" onchange="assignGeneralCoach('${item.id}', this.value)">
                <option value="박지은 수석 코치" ${coach.includes('박지은') ? 'selected' : ''}>박지은 수석코치</option>
                <option value="김서연 전문 코치" ${coach.includes('김서연') ? 'selected' : ''}>김서연 전문코치</option>
                <option value="이은영 전문 코치" ${coach.includes('이은영') ? 'selected' : ''}>이은영 전문코치</option>
              </select>
            </td>
            <td style="text-align:center;">
              <select class="setting-input" style="padding:4px 8px; font-size:0.84rem; font-weight:800; color:${item.status === '완료' ? '#2e7d32' : 'var(--accent)'};" onchange="changeGeneralStatus('${item.id}', this.value)">
                <option value="상담대기" ${item.status === '상담대기' ? 'selected' : ''}>① 상담대기</option>
                <option value="코치배정" ${item.status === '코치배정' ? 'selected' : ''}>② 코치배정</option>
                <option value="진행중" ${item.status === '진행중' ? 'selected' : ''}>③ 현장진행</option>
                <option value="완료" ${item.status === '완료' ? 'selected' : ''}>④ 완료</option>
              </select>
            </td>
            <td style="text-align:center; white-space:nowrap;">
              <div style="display:inline-flex; gap:4px; flex-wrap:wrap; justify-content:center;">
                <button type="button" class="btn-save-setting" onclick="openDispatchFromGeneral('${item.id}')" style="padding:4px 8px; font-size:0.78rem; background:#fff7ed; color:#c2410c; border:1px solid #fdba74; font-weight:850; display:inline-flex; align-items:center; gap:3px;" title="공식 파견센터에 등록하고 코치에게 카톡 일정을 바로 전송합니다">
                  <span>🤝</span> 코치 배정&amp;카톡
                </button>
                <button type="button" class="btn-save-setting" onclick="goToCoachControlForClient('${escapeHtml(item.name)}')" style="padding:4px 8px; font-size:0.78rem; background:#ecfdf5; color:#047857; border:1px solid #a7f3d0; font-weight:850; display:inline-flex; align-items:center; gap:3px;" title="현장관제&정산센터로 이동하여 사진 3종 검수 및 송금을 진행합니다">
                  <span>📸</span> 현장관제&amp;송금
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }
  }
}

// 8. 코치 배정 및 상태 변경
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

// 9. 180분 현장 코칭일지 모달 제어
function openBeautyCoachingModal(id) {
  const list = getStoredBeautyBookings();
  const item = list.find(x => x.id === id);
  if (!item) return;

  const modal = document.getElementById('beautyCoachingLogModal');
  document.getElementById('logBookingId').value = item.id;
  if (item.diagnostic) {
    document.getElementById('logMoistureBefore').value = item.diagnostic.moistureBefore || 24;
    document.getElementById('logMoistureAfter').value = item.diagnostic.moistureAfter || 68;
    document.getElementById('logElasticity').value = item.diagnostic.elasticityAfter || '매우 우수 (윤광 회복)';
    document.getElementById('logWardrobe').value = item.diagnostic.wardrobe || '소장 의상 TPO 코디 완료';
    document.getElementById('logEndingNote').value = item.diagnostic.endingNote || '';
  }
  if (modal) modal.style.display = 'flex';
}

function closeBeautyCoachingModal() {
  const modal = document.getElementById('beautyCoachingLogModal');
  if (modal) modal.style.display = 'none';
}

function saveBeautyCoachingLog(e) {
  e.preventDefault();
  const id = document.getElementById('logBookingId').value;
  const list = getStoredBeautyBookings();
  const item = list.find(x => x.id === id);
  if (!item) return;

  item.diagnostic = {
    moistureBefore: Number(document.getElementById('logMoistureBefore').value),
    moistureAfter: Number(document.getElementById('logMoistureAfter').value),
    elasticityAfter: document.getElementById('logElasticity').value,
    wardrobe: document.getElementById('logWardrobe').value,
    safetyChecked: document.getElementById('logSafety') ? document.getElementById('logSafety').value === '완료' : true,
    endingNote: document.getElementById('logEndingNote').value
  };
  item.status = '케어완료';
  if (!item.completedAt) item.completedAt = new Date().toISOString();

  localStorage.setItem('seniorBeautyBookings', JSON.stringify(list));
  closeBeautyCoachingModal();
  renderBusinessMasterDashboard();
  alert('180분 현장 코칭일지가 저장되었으며, 고객 서비스 대시보드(마이룸)에 실시간 반영되었습니다!');
}

// 10. 엑셀(CSV) 다운로드
function exportBusinessCSV() {
  if (currentBusinessTab === 'beauty') {
    const list = getStoredBeautyBookings();
    let csv = '\uFEFF예약ID,신청인,관계,어르신성함,연락처,방문일시,진행장소,주소,배정코치,처리상태,수분전,수분후,탄력,엔딩노트\n';
    list.forEach(i => {
      const diag = i.diagnostic || {};
      csv += `"${i.id}","${i.applicantName}","${i.role}","${i.seniorName}","${i.phone}","${i.visitDate}","${i.place}","${i.address || ''}","${i.assignedCoach}","${i.status}","${diag.moistureBefore || ''}","${diag.moistureAfter || ''}","${diag.elasticityAfter || ''}","${(diag.endingNote || '').replace(/"/g, '""')}"\n`;
    });
    downloadCSVFile(csv, `senior_beauty_crm_${new Date().toISOString().slice(0,10)}.csv`);
  } else {
    const consults = getStoredGeneralConsults();
    let csv = '\uFEFF상담ID,신청분야,신청자,연락처,접수일시,배정코치,처리상태,상담메모\n';
    consults.forEach(i => {
      csv += `"${i.id}","${i.category}","${i.name}","${i.phone}","${i.date}","${i.assignedCoach || ''}","${i.status}","${(i.message || '').replace(/"/g, '""')}"\n`;
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

// 12. 🌟 공식 코치 배정 & 현장관제 연동 함수들
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
    switchTab('tabAcademy');
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
      notes: `[4대 비즈니스 상담 연동] 접수ID: ${item.id} / 내용: ${item.message || ''}`
    });
  } else if (typeof switchTab === 'function') {
    switchTab('tabAcademy');
    if (typeof openDispatchModal === 'function') openDispatchModal();
  }
}

function goToCoachControlForClient(name) {
  if (typeof switchTab === 'function') {
    switchTab('tabCoachControl');
  }
  const searchInput = document.getElementById('inputControlSearch');
  if (searchInput) {
    searchInput.value = name || '';
    if (typeof handleControlSearch === 'function') {
      handleControlSearch(name || '');
    }
  }
}

// 11. 초기 로드
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
