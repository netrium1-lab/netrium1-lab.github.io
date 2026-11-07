// =========================================================================
// 여백과결 - 시니어 뷰티 라이프케어 CRM (senior_beauty_crm.js)
// 180분 SOP 예약 관리, 피부 진단 일지 등록, =EDATE 3·6개월 리텐션 자동화
// =========================================================================

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
  return [
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
      assignedCoach: '김서연 라이프 코치 (40대 시니어 뷰티&라이프스타일 1급)',
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
}

function switchBeautySubTab(tab) {
  const pBookings = document.getElementById('beautySubPanelBookings');
  const pFollowup = document.getElementById('beautySubPanelFollowup');
  const btnB = document.getElementById('btnSubTabBookings');
  const btnF = document.getElementById('btnSubTabFollowup');

  if (tab === 'bookings') {
    if (pBookings) pBookings.style.display = 'block';
    if (pFollowup) pFollowup.style.display = 'none';
    if (btnB) { btnB.style.background = '#d1516e'; btnB.style.color = '#ffffff'; }
    if (btnF) { btnF.style.background = 'var(--bg-secondary)'; btnF.style.color = 'var(--text-primary)'; }
  } else {
    if (pBookings) pBookings.style.display = 'none';
    if (pFollowup) pFollowup.style.display = 'block';
    if (btnB) { btnB.style.background = 'var(--bg-secondary)'; btnB.style.color = 'var(--text-primary)'; }
    if (btnF) { btnF.style.background = '#d1516e'; btnF.style.color = '#ffffff'; }
  }
}

function renderBeautyCrm() {
  const list = getStoredBeautyBookings();
  const bTable = document.getElementById('beautyBookingTableBody');
  const fTable = document.getElementById('beautyFollowupTableBody');
  const kpiTotal = document.getElementById('kpiBeautyTotal');
  const kpiCompleted = document.getElementById('kpiBeautyCompleted');
  const kpiReminders = document.getElementById('kpiBeautyReminders');

  if (kpiTotal) kpiTotal.textContent = `${list.length}건`;
  const completedCount = list.filter(item => item.status === '케어완료' || item.completedAt).length;
  if (kpiCompleted) kpiCompleted.textContent = `${completedCount}건`;
  if (kpiReminders) kpiReminders.textContent = `${completedCount}건`;

  // 1. 마스터 테이블 렌더링
  if (bTable) {
    bTable.innerHTML = list.map(item => {
      const hasPhoto = !!item.photoBase64;
      const coach = item.assignedCoach || '김서연 라이프 코치';
      return `
        <tr>
          <td><strong style="color: #b83354;">${escapeHtml(item.id)}</strong></td>
          <td>${escapeHtml(item.applicantName)}<br><span style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(item.role)}</span></td>
          <td><strong>${escapeHtml(item.seniorName)}</strong></td>
          <td><a href="tel:${escapeHtml(item.phone)}" style="color:var(--accent);">${escapeHtml(item.phone)}</a></td>
          <td>
            <span style="font-weight:750;">${escapeHtml((item.visitDate || '').replace('T', ' '))}</span><br>
            <span style="font-size:0.8rem; color:var(--text-muted);">${escapeHtml(item.place)} - ${escapeHtml(item.address || '')}</span>
          </td>
          <td style="text-align:center;">
            ${hasPhoto ? '<span style="color:#2b7a4b; font-weight:850;">📸 등록됨</span>' : '<span style="color:var(--text-muted);">현장지참</span>'}
          </td>
          <td>
            <select class="setting-input" style="padding:4px 8px; font-size:0.84rem;" onchange="assignBeautyCoach('${item.id}', this.value)">
              <option value="김서연 라이프 코치 (40대 시니어 뷰티&라이프스타일 1급)" ${coach.includes('김서연') ? 'selected' : ''}>김서연 코치 (1급)</option>
              <option value="박지은 수석 코치 (시니어 뷰티&공간리셋 1급)" ${coach.includes('박지은') ? 'selected' : ''}>박지은 수석코치</option>
              <option value="이은영 전문 코치 (시니어 라이프스타일 1급)" ${coach.includes('이은영') ? 'selected' : ''}>이은영 코치</option>
            </select>
          </td>
          <td style="text-align:center;">
            <select class="setting-input" style="padding:4px 8px; font-size:0.84rem; font-weight:800; color:${item.status === '케어완료' ? '#2e7d32' : '#b83354'};" onchange="changeBeautyStatus('${item.id}', this.value)">
              <option value="접수완료" ${item.status === '접수완료' ? 'selected' : ''}>접수완료</option>
              <option value="코치배정" ${item.status === '코치배정' ? 'selected' : ''}>코치배정</option>
              <option value="케어완료" ${item.status === '케어완료' ? 'selected' : ''}>케어완료</option>
            </select>
          </td>
          <td style="text-align:center;">
            <button type="button" class="btn-save-setting" onclick="openBeautyCoachingModal('${item.id}')" style="padding:5px 10px; font-size:0.82rem; background:#fee7ec; color:#b83354; border-color:#f8c8d2;">
              📝 일지/리포트
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // 2. 사후관리 & 리마인더 테이블 (=EDATE 3·6개월 자동 산출)
  if (fTable) {
    fTable.innerHTML = list.map(item => {
      const compDate = item.completedAt ? new Date(item.completedAt) : new Date();
      const d3 = new Date(compDate); d3.setMonth(d3.getMonth() + 3);
      const d6 = new Date(compDate); d6.setMonth(d6.getMonth() + 6);
      const fmt = (d) => `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;

      return `
        <tr>
          <td><strong>${escapeHtml(item.id)}</strong></td>
          <td><strong>${escapeHtml(item.seniorName)}</strong></td>
          <td>${fmt(compDate)}</td>
          <td><span style="color:#2e7d32; font-weight:800;">${fmt(d3)}</span></td>
          <td style="text-align:center;"><span class="badge" style="background:#e8f5e9; color:#2e7d32; padding:3px 8px; border-radius:999px; font-size:0.8rem;">무료재진단 대상</span></td>
          <td><span style="color:#b83354; font-weight:800;">${fmt(d6)}</span></td>
          <td style="text-align:center;"><span class="badge" style="background:#fee7ec; color:#b83354; padding:3px 8px; border-radius:999px; font-size:0.8rem;">AGAIN180 활성</span></td>
          <td style="text-align:center;">
            <button type="button" class="btn-save-setting" onclick="alert('[${item.seniorName} 어르신]께 3개월 차 무료 피부 재진단 및 안부 알림톡이 전송되었습니다!')" style="padding:4px 8px; font-size:0.8rem;">
              ✉️ 알림톡
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }
}

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
    renderBeautyCrm();
    alert(`${id} 건 상태가 [${newStatus}]으로 변경되었습니다.`);
  }
}

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
    safetyChecked: document.getElementById('logSafety').value === '완료',
    endingNote: document.getElementById('logEndingNote').value
  };
  item.status = '케어완료';
  if (!item.completedAt) item.completedAt = new Date().toISOString();

  localStorage.setItem('seniorBeautyBookings', JSON.stringify(list));
  closeBeautyCoachingModal();
  renderBeautyCrm();
  alert('180분 현장 코칭일지가 저장되었으며, 고객 서비스 대시보드(마이룸)에 실시간 반영되었습니다!');
}

function exportBeautyCrmCSV() {
  const list = getStoredBeautyBookings();
  let csv = '\uFEFF예약ID,신청인,관계,어르신성함,연락처,방문일시,진행장소,주소,배정코치,처리상태,수분전,수분후,탄력,엔딩노트\n';
  list.forEach(i => {
    const diag = i.diagnostic || {};
    csv += `"${i.id}","${i.applicantName}","${i.role}","${i.seniorName}","${i.phone}","${i.visitDate}","${i.place}","${i.address || ''}","${i.assignedCoach}","${i.status}","${diag.moistureBefore || ''}","${diag.moistureAfter || ''}","${diag.elasticityAfter || ''}","${(diag.endingNote || '').replace(/"/g, '""')}"\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `senior_beauty_crm_${new Date().toISOString().slice(0,10)}.csv`;
  link.click();
}

// 초기화 연동
window.addEventListener('DOMContentLoaded', () => {
  renderBeautyCrm();
  const tabQ = new URLSearchParams(window.location.search).get('tab');
  if (tabQ === 'tabBeautyCrm' || tabQ === 'beauty') {
    if (typeof switchTab === 'function') {
      const btn = document.getElementById('navBtnBeautyCrm');
      switchTab('tabBeautyCrm', btn);
    }
  }
});
