// =========================================================================
// 여백과결 - 4대 비즈니스 통합 관제 센터 & CRM 시스템 (beauty-crm.js)
// 1호 시니어 뷰티 라이프케어 180분 원스톱 파이프라인 (상담 ➔ 배정 ➔ 현장 ➔ CRM)
// 2호 옷장 정리 / 3호 유품 정리 / 4호 엔딩 파티 / 5호 디지털 자서전 통합 관제
// 단계별 특화 화면 & 라이프사이클 순환 이관 시스템 (상담 ➔ 배정 ➔ 현장 ➔ CRM ➔ 재상담)
// =========================================================================

let currentBusinessTab = 'beauty'; // 'beauty', 'wardrobe', 'legacy', 'party', 'memoir'
let currentPipelineStep = 'all';    // 'all', 'step1', 'step2', 'step3', 'step4'
let currentSubFilter = 'all';       // 각 단계 내부 하위 필터

// 🌟 데이터 버전 관리 (단계별 특화 화면용 신규 데이터 동기화 보장)
const BEAUTY_CRM_DATA_VER = '20261115_v2';
try {
  if (localStorage.getItem('beautyCrmDataVer') !== BEAUTY_CRM_DATA_VER) {
    localStorage.setItem('beautyCrmDataVer', BEAUTY_CRM_DATA_VER);
    localStorage.removeItem('seniorBeautyBookings');
    localStorage.removeItem('seniorConsultList');
  }
} catch(e) {}

// 1. 1호 시니어 뷰티 라이프케어 마스터 데이터 조회
function getStoredBeautyBookings() {
  try {
    const raw = localStorage.getItem('seniorBeautyBookings');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= 6) return parsed;
    }
  } catch(e) {
    console.error('예약 데이터 파싱 실패:', e);
  }

  // 기본 견본 데이터 (1단계~4단계 전 단계 및 세부 상태 완벽 시연용)
  const defaultList = [
    // ---------------- [1단계 : 고객 상담 접수 & 심사] ----------------
    {
      id: 'BK-202612',
      programType: '시니어 뷰티 라이프케어',
      programTitle: '특별한 날, 화려한 외출 (180분 SOP)',
      role: '자녀 대리 신청 (40대)',
      applicantName: '박지영',
      phone: '010-8273-1920',
      seniorName: '정순임 어르신 (76세)',
      place: '자택 방문 1:1 케어',
      visitDate: '2026-11-15T14:00',
      address: '서울시 강남구 압구정로 18길 35 (현대아파트 102동)',
      options: ['기미·주름 커버 투명 윤광 메이크업', '목·승모근 림프 이완 테라피'],
      memo: '친정어머니 팔순 잔치를 앞두고 화사하고 자연스러운 시니어 메이크업을 받고 싶습니다.',
      consultNote: '유선 상담 대기 중. 따님께서 오후 2시 이후 통화 희망.',
      status: '상담대기', // '상담대기', '상담중', '보류', '상담완료'
      assignedCoach: '미배정 (배정 대기중)',
      coachPhone: '',
      createdAt: '2026-11-14T09:30:00.000Z'
    },
    {
      id: 'BK-202615',
      programType: '시니어 뷰티 라이프케어',
      programTitle: '특별한 날, 화려한 외출 (180분 SOP)',
      role: '자녀 대리 신청 (30대)',
      applicantName: '최민호',
      phone: '010-4455-8822',
      seniorName: '최갑수 어르신 (79세)',
      place: '자택 방문 1:1 케어',
      visitDate: '2026-11-17T11:00',
      address: '서울시 서초구 서초중앙로 45 (래미안 103동)',
      options: ['목·승모근 림프 이완 테라피', '헤어 볼륨 스타일링'],
      memo: '부모님 결혼 50주년 기념 가족 사진 촬영 전 단정한 헤어·피부 정돈 희망.',
      consultNote: '1차 유선 상담 진행 중. 피부가 얇고 건조하시어 순한 천연 앰플 위주 사용 요청.',
      status: '상담중',
      assignedCoach: '미배정',
      coachPhone: '',
      createdAt: '2026-11-14T11:20:00.000Z'
    },
    {
      id: 'BK-202616',
      programType: '시니어 뷰티 라이프케어',
      programTitle: '특별한 날, 화려한 외출 (180분 SOP)',
      role: '본인 어르신 신청',
      applicantName: '이지은',
      phone: '010-3322-9911',
      seniorName: '윤명자 어머니 (74세)',
      place: '자택 방문 1:1 케어',
      visitDate: '2026-11-20T15:00',
      address: '서울시 송파구 송파대로 22길 (잠실 엘스 305동)',
      options: ['기미·주름 커버 투명 윤광 메이크업', '소장 의상 리스타일링'],
      memo: '동창 모임 외출용. 일정 조율 중.',
      consultNote: '고객 측 가족 행사 일정 미확정으로 11월 18일 재연락 요청 (보류 상태).',
      status: '보류',
      assignedCoach: '미배정',
      coachPhone: '',
      createdAt: '2026-11-13T14:10:00.000Z'
    },

    // ---------------- [2단계 : 전문 코치 배정 & 매칭] ----------------
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
      consultNote: '상담 완료! 밝고 자연스러운 피부 표현과 편안한 안면 근육 이완 선호.',
      status: '코치배정', // 코치 매칭 대기
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
      consultNote: '상담 완료! 박지은 수석코치와 동선 및 시간 조율 진행 중.',
      status: '조율중',
      assignedCoach: '박지은 수석 코치 (시니어 뷰티&공간리셋 1급)',
      coachPhone: '010-3344-5566',
      createdAt: '2026-11-12T16:30:00.000Z'
    },

    // ---------------- [3단계 : 180분 현장 케어 & 안심 관제] ----------------
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
      status: '진행중', // 현장 진행
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

    // ---------------- [4단계 : CRM 사후관리 & 리텐션 루프] ----------------
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
      retentionSent3m: false, // 3개월 차 알림 발송 대기
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
      retentionSent3m: true, // 3개월 완료
      retentionSent6m: false, // 6개월 쿠폰 발송 대기
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

// 2. 통합 일반 상담 신청 내역 조회 (자가진단 및 원터치 상담)
function getStoredGeneralConsults() {
  try {
    const raw = localStorage.getItem('seniorConsultList');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= 10) return parsed;
    }
  } catch(e) {}

  // 기본 견본 데이터 (2호~4호 비즈니스별 1단계~4단계 완벽 시연용)
  const defaultConsults = [
    // 👗 2호 일상과 비움의 미학 (옷장/공간)
    {
      id: 'CS-101',
      category: '👗 일상과 비움의 미학 (옷장/공간)',
      role: '자녀 대리',
      name: '이지현',
      phone: '010-3344-5566',
      date: '2026-11-14 오전 10:15',
      message: '어머니 댁 옷장 정리 및 겨울 외출복 동선 수납 컨설팅을 희망합니다.',
      consultNote: '유선 상담 대기. 어머니 안방 옷장과 계절 수납 선별 요청.',
      status: '상담대기',
      assignedCoach: '미배정'
    },
    {
      id: 'CS-104',
      category: '👗 일상과 비움의 미학 (옷장/공간)',
      role: '자녀 대리',
      name: '정수진',
      phone: '010-4499-1122',
      date: '2026-11-14 오후 13:40',
      message: '부모님 댁 주방과 서재 수납 정리 일정 조율 중입니다.',
      consultNote: '유선 상담 진행 중. 견적 및 코치 방문 일정 조율.',
      status: '상담중',
      assignedCoach: '미배정'
    },
    {
      id: 'CS-105',
      category: '👗 일상과 비움의 미학 (옷장/공간)',
      role: '본인 어르신',
      name: '김영자 어르신',
      phone: '010-2233-4455',
      date: '2026-11-13 오후 14:00',
      message: '안방 붙박이장과 서랍장 옷장 수납 최적화 코칭을 요청합니다.',
      consultNote: '상담 완료! 박지은 수석코치 전담 매칭 확정 대기.',
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
      id: 'CS-108',
      category: '📦 기억의 계승 (유품/생전정리)',
      role: '자녀 대리',
      name: '윤서진',
      phone: '010-8899-1122',
      date: '2026-11-14 오후 13:20',
      message: '부모님 댁 오래된 서책과 옛 가재도구 정돈 및 유품 보관 상담을 신청합니다.',
      consultNote: '상담 신청 접수. 오래된 서책 아카이빙 견적 문의.',
      status: '상담대기',
      assignedCoach: '미배정'
    },
    {
      id: 'CS-102',
      category: '📦 기억의 계승 (유품/생전정리)',
      role: '본인 어르신',
      name: '최영철 어르신',
      phone: '010-7788-9900',
      date: '2026-11-13 오전 10:30',
      message: '서재에 오래 쌓인 책과 소장품을 후대에 전할 유품으로 우아하게 정돈하고 싶습니다.',
      consultNote: '상담 완료! 이은영 전문 코치 배정 일정 조율.',
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
      id: 'CS-111',
      category: '💌 아름다운 마침표 (생전 엔딩 파티)',
      role: '본인 어르신',
      name: '조경호 어르신',
      phone: '010-3344-7788',
      date: '2026-11-14 오전 11:00',
      message: '팔순을 맞아 평생 고마웠던 옛 친구들과 은사님을 모시는 감사 파티 기획을 상담받고 싶습니다.',
      consultNote: '유선 상담 접수. 감사 파티 장소 및 초대 인원(20명) 상담 희망.',
      status: '상담대기',
      assignedCoach: '미배정'
    },
    {
      id: 'CS-112',
      category: '💌 아름다운 마침표 (생전 엔딩 파티)',
      role: '자녀 대리',
      name: '강동훈',
      phone: '010-4455-8899',
      date: '2026-11-13 오후 15:40',
      message: '어머니 은퇴 및 생애 감사 엔딩 파티 전담 코치 배정 및 식순 협의 요청.',
      consultNote: '상담 완료! 김서연 코치 배정.',
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

// 3. 4대 비즈니스 탭 전환
function switchBusinessMasterTab(biz) {
  currentBusinessTab = biz;
  currentSubFilter = 'all';
  
  // 버튼 스타일 업데이트
  const tabs = ['beauty', 'wardrobe', 'legacy', 'party', 'memoir'];
  tabs.forEach(t => {
    const btn = document.getElementById(`bizTabBtn_${t}`);
    if (btn) btn.classList.toggle('active', t === biz);
    const card = document.getElementById(`bizCard_${t}`);
    if (card) card.classList.toggle('active', t === biz);
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

// 4. 파이프라인 단계 전환 (전체, ①상담, ②코치배정, ③현장케어, ④CRM리텐션)
function switchPipelineStep(step) {
  currentPipelineStep = step;
  currentSubFilter = 'all';

  const steps = ['all', 'step1', 'step2', 'step3', 'step4'];
  steps.forEach(s => {
    const btn = document.getElementById(`pipelineStepBtn_${s}`);
    if (btn) btn.classList.toggle('active', s === step);
  });

  // 상단 4대 KPI 카드 하이라이트 동기화
  const cardSteps = ['step1', 'step2', 'step3', 'step4'];
  cardSteps.forEach(s => {
    const card = document.getElementById(`bizKpiCard_${s}`);
    if (card) card.classList.toggle('active', currentPipelineStep === s);
  });

  renderBusinessMasterDashboard();
}

// 4-1. 단계 내부 세부 필터 (상담대기, 상담중, 보류 등) 전환
function switchSubFilter(filterVal) {
  currentSubFilter = filterVal;
  renderBusinessMasterDashboard();
}

// 4-2. 파이프라인 버튼 텍스트 및 실시간 건수 뱃지 갱신
function updatePipelineStepButtons(counts, bizType) {
  const btnAll = document.getElementById('pipelineStepBtn_all');
  const btnStep1 = document.getElementById('pipelineStepBtn_step1');
  const btnStep2 = document.getElementById('pipelineStepBtn_step2');
  const btnStep3 = document.getElementById('pipelineStepBtn_step3');
  const btnStep4 = document.getElementById('pipelineStepBtn_step4');

  if (btnAll) btnAll.innerHTML = `전체보기 <span class="pipeline-step-badge">${counts.all}</span>`;
  if (btnStep1) btnStep1.innerHTML = `① 상담신청 접수 <span class="pipeline-step-badge">${counts.step1}</span>`;
  if (btnStep2) btnStep2.innerHTML = `② 코치 배정 <span class="pipeline-step-badge">${counts.step2}</span>`;
  if (btnStep3) {
    btnStep3.innerHTML = (bizType === 'beauty')
      ? `③ 현장케어/일지 <span class="pipeline-step-badge">${counts.step3}</span>`
      : `③ 현장진행 <span class="pipeline-step-badge">${counts.step3}</span>`;
  }
  if (btnStep4) {
    btnStep4.innerHTML = (bizType === 'beauty')
      ? `④ CRM 사후 리텐션 <span class="pipeline-step-badge">${counts.step4}</span>`
      : `④ CRM 사후관리 <span class="pipeline-step-badge">${counts.step4}</span>`;
  }

  // 상단 KPI 카드 클래스 동기화
  const cardSteps = ['step1', 'step2', 'step3', 'step4'];
  cardSteps.forEach(s => {
    const card = document.getElementById(`bizKpiCard_${s}`);
    if (card) card.classList.toggle('active', currentPipelineStep === s);
  });
}

// 4-3. 단계 판별 헬퍼
function resolveItemStep(item) {
  if (item.completedAt || item.status === '케어완료' || item.status === '완료') {
    return 'step4';
  }
  if (item.status === '진행중' || item.status === '현장진행' || item.status === '출동대기' || item.status === '검수대기') {
    return 'step3';
  }
  if (item.status === '코치배정' || item.status === '배정대기' || item.status === '조율중' || item.status === '배정보류' || item.status === '배정완료') {
    return 'step2';
  }
  // 기본은 1단계
  return 'step1';
}

// 5. 비즈니스 메타 정의
const BIZ_META = {
  beauty: {
    name: '💄 1호 시니어 뷰티 라이프케어',
    desc: '‘특별한 날, 화려한 외출’ 180분 표준 프로토콜(SOP) 맞춤 케어 및 사후 리텐션 관리',
    badge: '180분 SOP 시그니처',
    themeColor: '#b83354',
    bgLight: '#fff0f3',
    borderColor: '#f8c8d2',
    step1Title: '📞 1단계: 고객 상담 접수 & 예약 심사 관제',
    step1Desc: '신규 신청 고객과의 유선 상담을 진행하고 상담 결과를 등록합니다. 상담이 완료되면 [코치 배정] 단계로 자동 이관됩니다.',
    step2Title: '🤝 2단계: 공인 라이프 코치 배정 & 일정 매칭',
    step2Desc: '상담 완료된 고객에게 1:1 맞춤 전담 라이프 코치를 지정하고 일정을 확정합니다. 배정 완료 시 [현장 케어] 단계로 이관됩니다.',
    step3Title: '📸 3단계: 180분 현장 케어 실행 & 실시간 안심 관제',
    step3Desc: '코치가 현장에 방문하여 180분 표준 프로토콜(SOP)을 실행 중입니다. 현장 사진 3종 및 코칭 진단 일지를 검수하고 승인합니다.',
    step4Title: '🔄 4단계: CRM 사후관리 & 선순환 리텐션 루프',
    step4Desc: '케어가 완료된 고객을 위한 전용 관리 공간입니다. 3개월 무료 재진단 알림톡 및 6개월 AGAIN180 감사 할인 쿠폰을 자동 발송합니다.'
  },
  wardrobe: {
    name: '👗 2호 일상과 비움의 미학',
    desc: '삶의 흔적을 정돈하고 일상복과 외출복의 아름다운 구분, 인체공학적 동선 수납 컨설팅',
    badge: '공간 리셋 & 수납',
    themeColor: '#2b7a4b',
    bgLight: '#edf7f1',
    borderColor: '#c6e7d2',
    step1Title: '📞 1단계: 옷장·공간 정리 상담 접수 및 진단',
    step1Desc: '고객의 주거 공간 및 옷장 정리 상담을 진행합니다. 상담 완료 시 전담 공간 코치 배정으로 자동 이관됩니다.',
    step2Title: '🤝 2단계: 공간 정리 수석 코치 배정',
    step2Desc: '공간 정리 및 비움 전문 코치를 매칭하고 방문 일정을 확정합니다.',
    step3Title: '📸 3단계: 현장 공간 리셋 & 수납 동선 비움 진행',
    step3Desc: '현장 방문 수납 컨설팅 및 공간 비움 작업을 진행하고 전후 사진을 검수합니다.',
    step4Title: '🔄 4단계: 정기 공간 유지 점검 & 사후관리',
    step4Desc: '계절별 옷장 점검 및 정기 공간 유지보수 케어를 제공합니다.'
  },
  legacy: {
    name: '📦 3호 기억의 계승',
    desc: '오래된 짐과 세월의 흔적을 비우고, 의미 있는 유품으로 정돈하여 후대에 전하는 안심 동행',
    badge: '유품 아카이빙',
    themeColor: '#9a6528',
    bgLight: '#fdf6ed',
    borderColor: '#ebd2b2',
    step1Title: '📞 1단계: 유품·소장품 정리 상담 접수',
    step1Desc: '소장품의 가치 보존과 유품 정돈을 위한 심층 상담을 진행합니다.',
    step2Title: '🤝 2단계: 유품 아카이빙 전문 코치 배정',
    step2Desc: '기록과 선별을 전담할 전문 코치를 배정하고 방문 일정을 조율합니다.',
    step3Title: '📸 3단계: 현장 소장품 선별 & 디지털 아카이빙',
    step3Desc: '현장에서 소장품을 선별하고 유품 도록 제작용 사진 촬영 및 기록을 진행합니다.',
    step4Title: '🔄 4단계: 유품 도록 보관 & 가족 감사 사후관리',
    step4Desc: '제작된 유품 도록 양장본 전달 및 후대 계승 아카이빙을 영구 관리합니다.'
  },
  party: {
    name: '💌 4호 아름다운 마침표와 감사',
    desc: '고마운 사람들을 초대해 감사를 전하는 생전 엔딩 파티 및 따뜻한 인생 감사 서사 기획',
    badge: '생전 엔딩 파티',
    themeColor: '#7a3594',
    bgLight: '#f9f0fd',
    borderColor: '#e7c7f7',
    step1Title: '📞 1단계: 생전 엔딩 파티 기획 상담 접수',
    step1Desc: '인생의 소중한 인연들과 함께할 감사 회고 파티 콘셉트와 규모를 상담합니다.',
    step2Title: '🤝 2단계: 파티 디렉터 및 라이프 코치 배정',
    step2Desc: '파티 식순과 공간 연출을 총괄할 전담 디렉터를 배정합니다.',
    step3Title: '📸 3단계: 엔딩 파티 현장 실행 & 감사 회고 진행',
    step3Desc: '감사 영상 상영, 회고 편지 낭독, 축하 연회를 현장에서 감동적으로 연출합니다.',
    step4Title: '🔄 4단계: 파티 기념 앨범 전달 & 가족 안심 사후관리',
    step4Desc: '파티 기념 포토북 전달 및 가족들과의 감동적인 사후 서사를 영구 보관합니다.'
  },
  memoir: {
    name: '✍️ 5호 내 인생의 서사, 디지털 자서전',
    desc: '찾아가는 1:1 구술 채록과 옛 사진 복원으로 삶의 궤적을 명작 회고록과 양장본으로 기록',
    badge: '생애사 출판',
    themeColor: '#1d4ed8',
    bgLight: '#eff6ff',
    borderColor: '#bfdbfe',
    step1Title: '📞 1단계: 구술 자서전 출판 상담 접수',
    step1Desc: '자서전 출판 분량 및 구술 인터뷰 일정을 상담합니다.',
    step2Title: '🤝 2단계: 전문 구술 작가 및 코치 배정',
    step2Desc: '삶의 이야기를 아름답게 채록할 전문 작가를 매칭합니다.',
    step3Title: '📸 3단계: 1:1 구술 채록 및 옛 사진 디지털 복원',
    step3Desc: '찾아가는 인터뷰와 흑백 사진 복원 작업을 진행합니다.',
    step4Title: '🔄 4단계: 양장본 출판 기념 & 헌정 사후관리',
    step4Desc: '양장본 회고록 인쇄 및 가족 헌정식을 관리합니다.'
  }
};

// 6. 비즈니스 마스터 대시보드 메인 렌더링 함수
function renderBusinessMasterDashboard() {
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

  if (currentBusinessTab === 'beauty') {
    const beautyList = getStoredBeautyBookings();
    renderBeautyPipeline(beautyList, meta);
  } else {
    const generalConsults = getStoredGeneralConsults();
    renderGeneralBusinessPipeline(currentBusinessTab, generalConsults, meta);
  }
}

// 7. 🌟 뷰티 라이프케어 4단계 파이프라인 렌더링 (단계별 특화 화면 시스템)
function renderBeautyPipeline(list, meta) {
  // 실시간 건수 계산
  const total = list.length;
  const step1List = list.filter(i => resolveItemStep(i) === 'step1');
  const step2List = list.filter(i => resolveItemStep(i) === 'step2');
  const step3List = list.filter(i => resolveItemStep(i) === 'step3');
  const step4List = list.filter(i => resolveItemStep(i) === 'step4');

  const step1Count = step1List.length;
  const step2Count = step2List.length;
  const step3Count = step3List.length;
  const step4Count = step4List.length;

  // 상단 KPI 카드 숫자 업데이트
  const kpi1 = document.getElementById('bizKpi_lead');
  const kpi2 = document.getElementById('bizKpi_assigned');
  const kpi3 = document.getElementById('bizKpi_done');
  const kpi4 = document.getElementById('bizKpi_retention');
  if (kpi1) kpi1.textContent = `${step1Count}건`;
  if (kpi2) kpi2.textContent = `${step2Count}건`;
  if (kpi3) kpi3.textContent = `${step3Count}건`;
  if (kpi4) kpi4.textContent = `${step4Count}건`;

  updatePipelineStepButtons({
    all: total,
    step1: step1Count,
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
    beautyWrap.innerHTML = generateBeautyStepViewHtml(list, currentPipelineStep, meta, {
      all: total,
      step1: step1Count,
      step2: step2Count,
      step3: step3Count,
      step4: step4Count
    });
  }
}

// 7-1. 뷰티 단계별 전용 HTML 생성기
function generateBeautyStepViewHtml(list, step, meta, counts) {
  let html = '';

  // 1) 단계별 안내 배너 및 워크플로우 가이드
  html += `
    <div style="background: ${meta.bgLight}; border: 1.5px solid ${meta.borderColor}; border-radius: 14px; padding: 16px 20px; margin: 18px 0 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <h3 style="font-size: 1.08rem; font-weight: 850; color: ${meta.themeColor}; margin: 0;">
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
          <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 750;">선순환 흐름:</span>
          <span style="font-size: 0.78rem; background: #ffffff; padding: 4px 8px; border-radius: 6px; border: 1px solid var(--border-color); color: var(--text-secondary);">
            ① 상담접수 ➔ ② 코치배정 ➔ ③ 현장케어 ➔ ④ CRM 사후관리 ➔ 🔄 재상담
          </span>
        </div>
      </div>
    </div>
  `;

  // 2) 단계별 본문 화면 분기
  if (step === 'step1') {
    // 📞 [1단계: 상담 신청 & 심사 화면]
    html += generateStep1BeautyView(list, meta);
  } else if (step === 'step2') {
    // 🤝 [2단계: 코치 배정 화면]
    html += generateStep2BeautyView(list, meta);
  } else if (step === 'step3') {
    // 📸 [3단계: 현장 케어 / 일지 화면]
    html += generateStep3BeautyView(list, meta);
  } else if (step === 'step4') {
    // 🔄 [4단계: CRM 사후 리텐션 화면]
    html += generateStep4BeautyView(list, meta);
  } else {
    // 🌐 [전체보기: 종합 마스터 파이프라인 보드]
    html += generateStepAllBeautyView(list, meta, counts);
  }

  return html;
}

// 7-2. [1단계: 상담 신청 & 심사 화면] 생성기
function generateStep1BeautyView(list, meta) {
  // 1단계에 해당하는 건 추출
  let stepItems = list.filter(i => resolveItemStep(i) === 'step1');

  // 내부 서브 필터 적용
  if (currentSubFilter !== 'all') {
    stepItems = stepItems.filter(i => i.status === currentSubFilter);
  }

  const cntAll = list.filter(i => resolveItemStep(i) === 'step1').length;
  const cntWait = list.filter(i => resolveItemStep(i) === 'step1' && (i.status === '상담대기' || i.status === '접수완료')).length;
  const cntIng = list.filter(i => resolveItemStep(i) === 'step1' && i.status === '상담중').length;
  const cntHold = list.filter(i => resolveItemStep(i) === 'step1' && i.status === '보류').length;

  return `
    <!-- 서브 상태 필터 칩 -->
    <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 12px; flex-wrap: wrap;">
      <span style="font-size: 0.82rem; font-weight: 800; color: var(--text-muted);">상담 상태 필터:</span>
      <button type="button" class="pipeline-step-btn ${currentSubFilter === 'all' ? 'active' : ''}" onclick="switchSubFilter('all')" style="padding: 4px 12px; font-size: 0.8rem;">
        전체 (${cntAll})
      </button>
      <button type="button" class="pipeline-step-btn ${currentSubFilter === '상담대기' || currentSubFilter === '접수완료' ? 'active' : ''}" onclick="switchSubFilter('상담대기')" style="padding: 4px 12px; font-size: 0.8rem;">
        ⏳ 상담대기 (${cntWait})
      </button>
      <button type="button" class="pipeline-step-btn ${currentSubFilter === '상담중' ? 'active' : ''}" onclick="switchSubFilter('상담중')" style="padding: 4px 12px; font-size: 0.8rem;">
        📞 상담진행중 (${cntIng})
      </button>
      <button type="button" class="pipeline-step-btn ${currentSubFilter === '보류' ? 'active' : ''}" onclick="switchSubFilter('보류')" style="padding: 4px 12px; font-size: 0.8rem;">
        ⏸️ 상담보류 (${cntHold})
      </button>
    </div>

    <!-- 1단계 전용 테이블 -->
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th style="width: 105px;">접수 ID</th>
            <th style="width: 130px;">신청인 (관계)</th>
            <th style="width: 130px;">대상 어르신</th>
            <th style="width: 120px;">연락처</th>
            <th>희망일시 &amp; 거주지역</th>
            <th style="width: 170px;">신청 내용 &amp; 선택옵션</th>
            <th style="width: 170px;">상담 일지 &amp; 메모</th>
            <th style="width: 110px; text-align: center;">상담 처리 상태</th>
            <th style="width: 160px; text-align: center;">상담 액션 및 이관</th>
          </tr>
        </thead>
        <tbody>
          ${stepItems.length === 0 ? `
            <tr><td colspan="9" style="text-align:center; padding:36px; color:var(--text-muted);">
              해당 상태의 상담 신청 건이 없습니다.
            </td></tr>
          ` : stepItems.map(item => `
            <tr>
              <td><strong style="color: ${meta.themeColor};">${escapeHtml(item.id)}</strong></td>
              <td>
                <strong>${escapeHtml(item.applicantName)}</strong>
                <div style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(item.role || '신청인')}</div>
              </td>
              <td><strong>${escapeHtml(item.seniorName)}</strong></td>
              <td>
                <a href="tel:${escapeHtml(item.phone)}" style="color:var(--accent); font-weight:750;">${escapeHtml(item.phone)}</a>
                <div style="margin-top:2px;">
                  <button type="button" onclick="quickCall('${escapeHtml(item.phone)}', '${escapeHtml(item.applicantName)}')" style="padding:1px 6px; font-size:0.72rem; border-radius:4px; border:1px solid #d1d5db; background:#fff; cursor:pointer;">📞 전화</button>
                </div>
              </td>
              <td>
                <span style="font-weight:750;">${escapeHtml((item.visitDate || '').replace('T', ' '))}</span>
                <div style="font-size:0.78rem; color:var(--text-muted);">${escapeHtml(item.place)} - ${escapeHtml(item.address || '')}</div>
              </td>
              <td>
                <div style="font-size:0.82rem; color:var(--text-primary); line-height:1.4;">
                  ${item.options && item.options.length ? item.options.map(o => `<span class="badge" style="background:#f3f4f6; color:#374151; font-size:0.72rem; padding:1px 5px; margin:1px 0; display:inline-block;">${escapeHtml(o)}</span>`).join(' ') : '기본 케어'}
                </div>
                <div style="font-size:0.76rem; color:var(--text-secondary); margin-top:3px;">${escapeHtml(item.memo || '')}</div>
              </td>
              <td>
                <div style="background: #fafafa; border: 1px solid #e5e7eb; border-radius: 6px; padding: 6px; font-size: 0.78rem; color: #374151; min-height: 44px;">
                  ${escapeHtml(item.consultNote || '상담 기록 없음')}
                </div>
                <button type="button" onclick="editConsultNotePrompt('${item.id}', 'beauty')" style="margin-top:4px; padding:2px 6px; font-size:0.74rem; background:#fff; border:1px solid #d1d5db; border-radius:4px; cursor:pointer; font-weight:750;">
                  ✏️ 상담 메모 작성
                </button>
              </td>
              <td style="text-align: center;">
                <select class="setting-input" style="padding:4px 6px; font-size:0.82rem; font-weight:800; color: ${item.status === '상담완료' ? '#2e7d32' : (item.status === '보류' ? '#c2410c' : meta.themeColor)};" onchange="updateStep1Status('${item.id}', this.value, 'beauty')">
                  <option value="상담대기" ${item.status === '상담대기' || item.status === '접수완료' ? 'selected' : ''}>⏳ 상담대기</option>
                  <option value="상담중" ${item.status === '상담중' ? 'selected' : ''}>📞 상담진행</option>
                  <option value="보류" ${item.status === '보류' ? 'selected' : ''}>⏸️ 상담보류</option>
                  <option value="상담완료" ${item.status === '상담완료' ? 'selected' : ''}>✅ 상담완료</option>
                </select>
              </td>
              <td style="text-align: center; white-space: nowrap;">
                <div style="display: flex; flex-direction: column; gap: 4px; align-items: center;">
                  <button type="button" class="btn-save-setting" onclick="transferStep1ToStep2('${item.id}', 'beauty')" style="padding: 5px 10px; font-size: 0.8rem; background: #0284c7; color: #fff; border: none; font-weight: 850; box-shadow: 0 2px 6px rgba(2,132,199,0.3); border-radius: 6px; width: 100%;" title="상담 완료 처리 후 2단계 코치 배정 화면으로 이관합니다">
                    <span>✅</span> 코치배정으로 이관 ➔
                  </button>
                  <div style="display: flex; gap: 4px; width: 100%;">
                    <button type="button" onclick="updateStep1Status('${item.id}', '상담중', 'beauty')" style="flex:1; padding:3px; font-size:0.74rem; background:#f0f9ff; color:#0284c7; border:1px solid #bae6fd; border-radius:4px; cursor:pointer;">통화중</button>
                    <button type="button" onclick="updateStep1Status('${item.id}', '보류', 'beauty')" style="flex:1; padding:3px; font-size:0.74rem; background:#fff7ed; color:#c2410c; border:1px solid #fdba74; border-radius:4px; cursor:pointer;">보류</button>
                  </div>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// 7-3. [2단계: 코치 배정 & 매칭 화면] 생성기
function generateStep2BeautyView(list, meta) {
  let stepItems = list.filter(i => resolveItemStep(i) === 'step2');

  if (currentSubFilter !== 'all') {
    stepItems = stepItems.filter(i => i.status === currentSubFilter);
  }

  const cntAll = list.filter(i => resolveItemStep(i) === 'step2').length;
  const cntWait = list.filter(i => resolveItemStep(i) === 'step2' && (i.status === '코치배정' || i.status === '배정대기')).length;
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
            <th style="width: 180px;">1단계 상담 인수인계 사항</th>
            <th style="width: 160px;">담당 전담 코치 지정</th>
            <th style="width: 110px; text-align: center;">배정 상태</th>
            <th style="width: 170px; text-align: center;">코치 배정 및 현장 이관</th>
          </tr>
        </thead>
        <tbody>
          ${stepItems.length === 0 ? `
            <tr><td colspan="8" style="text-align:center; padding:36px; color:var(--text-muted);">
              해당 상태의 코치 배정 건이 없습니다.
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
                  <span style="font-weight:750; color:#0284c7;">${escapeHtml((item.visitDate || '').replace('T', ' '))}</span>
                  <div style="font-size:0.78rem; color:var(--text-muted);">${escapeHtml(item.address || item.place || '')}</div>
                </td>
                <td>
                  <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:6px; padding:6px; font-size:0.78rem; color:#0369a1;">
                    ${escapeHtml(item.consultNote || '상담 시 특이사항 없음')}
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
                    <option value="코치배정" ${item.status === '코치배정' || item.status === '배정대기' ? 'selected' : ''}>⏳ 배정대기</option>
                    <option value="조율중" ${item.status === '조율중' ? 'selected' : ''}>🔄 일정조율</option>
                    <option value="배정완료" ${item.status === '배정완료' ? 'selected' : ''}>✅ 배정완료</option>
                  </select>
                </td>
                <td style="text-align: center; white-space: nowrap;">
                  <div style="display: flex; flex-direction: column; gap: 4px; align-items: center;">
                    <button type="button" class="btn-save-setting" onclick="transferStep2ToStep3('${item.id}', 'beauty')" style="padding: 5px 10px; font-size: 0.8rem; background: #059669; color: #fff; border: none; font-weight: 850; box-shadow: 0 2px 6px rgba(5,150,105,0.3); border-radius: 6px; width: 100%;" title="배정 완료 후 3단계 180분 현장 케어 관제 화면으로 이관합니다">
                      <span>📸</span> 현장케어로 이관 ➔
                    </button>
                    <div style="display: flex; gap: 4px; width: 100%;">
                      <button type="button" class="btn-save-setting" onclick="openDispatchFromBeauty('${item.id}')" style="flex:1; padding:3px 6px; font-size:0.74rem; background:#fff7ed; color:#c2410c; border:1px solid #fdba74; font-weight:800;" title="공식 파견센터 등록 & 알림톡">
                        <span>🤝</span> 카톡 발송
                      </button>
                      <button type="button" onclick="revertStep('${item.id}', 'step1', 'beauty')" style="padding:3px 6px; font-size:0.74rem; background:#fff; color:var(--text-muted); border:1px solid #d1d5db; border-radius:4px; cursor:pointer;" title="재상담 필요 시 1단계로 되돌립니다">
                        ↩️ 반려
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
                    <button type="button" class="btn-save-setting" onclick="transferStep3ToStep4('${item.id}', 'beauty')" style="padding: 5px 10px; font-size: 0.8rem; background: #7c3aed; color: #fff; border: none; font-weight: 850; box-shadow: 0 2px 6px rgba(124,58,237,0.3); border-radius: 6px; width: 100%;" title="케어 완료 승인 후 4단계 CRM 사후 리텐션 화면으로 이관합니다">
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
                    <button type="button" class="btn-save-setting" onclick="reOrderFromRetention('${item.id}', 'beauty')" style="padding: 5px 10px; font-size: 0.8rem; background: #b83354; color: #fff; border: none; font-weight: 850; box-shadow: 0 2px 6px rgba(184,51,84,0.3); border-radius: 6px; width: 100%;" title="이 고객을 위한 180분 정기 케어 신규 상담을 1단계에 등록하여 선순환시킵니다">
                      <span>🔄</span> 신규 재상담 접수 (선순환)
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

// 7-6. [전체보기: 종합 마스터 파이프라인 보드] 생성기
function generateStepAllBeautyView(list, meta, counts) {
  return `
    <!-- 4단계 파이프라인 칸반 플로우 요약 카드 -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 20px;">
      <div class="kpi-filter-card" onclick="switchPipelineStep('step1')" style="border-left: 4px solid #b83354; cursor:pointer;" title="클릭 시 1단계 상담신청 화면으로 이동">
        <div style="font-size:0.76rem; color:var(--text-muted); font-weight:800;">1단계</div>
        <div style="font-size:1.02rem; font-weight:850; color:#b83354; margin:2px 0;">📞 고객 상담 접수</div>
        <div style="font-size:1.3rem; font-weight:900; color:#b83354;">${counts.step1}건</div>
        <div style="font-size:0.72rem; color:var(--text-muted); margin-top:2px;">상담 ➔ 보류 ➔ 완료</div>
      </div>
      <div class="kpi-filter-card" onclick="switchPipelineStep('step2')" style="border-left: 4px solid #0284c7; cursor:pointer;" title="클릭 시 2단계 코치배정 화면으로 이동">
        <div style="font-size:0.76rem; color:var(--text-muted); font-weight:800;">2단계</div>
        <div style="font-size:1.02rem; font-weight:850; color:#0284c7; margin:2px 0;">🤝 공인 코치 배정</div>
        <div style="font-size:1.3rem; font-weight:900; color:#0284c7;">${counts.step2}건</div>
        <div style="font-size:0.72rem; color:var(--text-muted); margin-top:2px;">1:1 코치 매칭 & 일정</div>
      </div>
      <div class="kpi-filter-card" onclick="switchPipelineStep('step3')" style="border-left: 4px solid #059669; cursor:pointer;" title="클릭 시 3단계 현장케어 화면으로 이동">
        <div style="font-size:0.76rem; color:var(--text-muted); font-weight:800;">3단계</div>
        <div style="font-size:1.02rem; font-weight:850; color:#059669; margin:2px 0;">📸 현장 케어 / 일지</div>
        <div style="font-size:1.3rem; font-weight:900; color:#059669;">${counts.step3}건</div>
        <div style="font-size:0.72rem; color:var(--text-muted); margin-top:2px;">180분 SOP & 사진 검수</div>
      </div>
      <div class="kpi-filter-card" onclick="switchPipelineStep('step4')" style="border-left: 4px solid #7c3aed; cursor:pointer;" title="클릭 시 4단계 CRM리텐션 화면으로 이동">
        <div style="font-size:0.76rem; color:var(--text-muted); font-weight:800;">4단계</div>
        <div style="font-size:1.02rem; font-weight:850; color:#7c3aed; margin:2px 0;">🔄 CRM 사후 리텐션</div>
        <div style="font-size:1.3rem; font-weight:900; color:#7c3aed;">${counts.step4}건</div>
        <div style="font-size:0.72rem; color:var(--text-muted); margin-top:2px;">3·6개월 루프 & AGAIN180</div>
      </div>
    </div>

    <!-- 전체 마스터 테이블 -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin: 18px 0 10px;">
      <h3 style="font-size: 1.05rem; font-weight: 850; color: ${meta.themeColor}; margin: 0; display: flex; align-items: center; gap: 6px;">
        <span>📋</span> 180분 마스터 케어 엔드투엔드 전체 파이프라인 목록
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
            <th>희망 일시 &amp; 장소</th>
            <th style="width: 140px;">배정 코치</th>
            <th style="width: 105px; text-align: center;">처리 상태</th>
            <th style="width: 145px; text-align: center;">단계별 바로가기</th>
          </tr>
        </thead>
        <tbody>
          ${list.map(item => {
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
                  <span style="font-weight:750;">${escapeHtml((item.visitDate || '').replace('T', ' '))}</span>
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

// 8. 🌟 기타 비즈니스(2호 옷장 / 3호 유품 / 4호 엔딩파티) 4단계 파이프라인 렌더링
function renderGeneralBusinessPipeline(biz, consults, meta) {
  const beautyWrap = document.getElementById('beautyPipelineWrap');
  const generalWrap = document.getElementById('generalBusinessWrap');
  if (beautyWrap) beautyWrap.style.display = 'none';
  if (generalWrap) generalWrap.style.display = 'block';

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

  const total = list.length;
  const step1List = list.filter(i => resolveItemStep(i) === 'step1');
  const step2List = list.filter(i => resolveItemStep(i) === 'step2');
  const step3List = list.filter(i => resolveItemStep(i) === 'step3');
  const step4List = list.filter(i => resolveItemStep(i) === 'step4');

  const step1Count = step1List.length;
  const step2Count = step2List.length;
  const step3Count = step3List.length;
  const step4Count = step4List.length;

  const kpi1 = document.getElementById('bizKpi_lead');
  const kpi2 = document.getElementById('bizKpi_assigned');
  const kpi3 = document.getElementById('bizKpi_done');
  const kpi4 = document.getElementById('bizKpi_retention');
  if (kpi1) kpi1.textContent = `${step1Count}건`;
  if (kpi2) kpi2.textContent = `${step2Count}건`;
  if (kpi3) kpi3.textContent = `${step3Count}건`;
  if (kpi4) kpi4.textContent = `${step4Count}건`;

  updatePipelineStepButtons({
    all: total,
    step1: step1Count,
    step2: step2Count,
    step3: step3Count,
    step4: step4Count
  }, biz);

  if (generalWrap) {
    generalWrap.innerHTML = generateGeneralStepViewHtml(list, currentPipelineStep, meta, biz, {
      all: total,
      step1: step1Count,
      step2: step2Count,
      step3: step3Count,
      step4: step4Count
    });
  }
}

// 8-1. 일반 비즈니스 단계별 HTML 생성기
function generateGeneralStepViewHtml(list, step, meta, biz, counts) {
  let html = `
    <div style="background: ${meta.bgLight}; border: 1.5px solid ${meta.borderColor}; border-radius: 14px; padding: 16px 20px; margin: 18px 0 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <h3 style="font-size: 1.08rem; font-weight: 850; color: ${meta.themeColor}; margin: 0;">
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
          <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 750;">순환 관리:</span>
          <span style="font-size: 0.78rem; background: #ffffff; padding: 4px 8px; border-radius: 6px; border: 1px solid var(--border-color); color: var(--text-secondary);">
            ① 상담접수 ➔ ② 코치배정 ➔ ③ 현장진행 ➔ ④ CRM 사후관리
          </span>
        </div>
      </div>
    </div>
  `;

  let filtered = list;
  if (step === 'step1') {
    filtered = list.filter(i => resolveItemStep(i) === 'step1');
  } else if (step === 'step2') {
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
            <th style="width: 95px;">접수 ID</th>
            <th style="width: 110px; text-align: center;">진행 단계</th>
            <th style="width: 120px;">고객 성함 (구분)</th>
            <th style="width: 120px;">연락처</th>
            <th>상담 내용 / 특이사항 메모</th>
            <th style="width: 150px;">담당 배정 코치</th>
            <th style="width: 110px; text-align: center;">진행 상태</th>
            <th style="width: 165px; text-align: center;">단계별 액션 &amp; 이관</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.length === 0 ? `
            <tr><td colspan="8" style="text-align:center; padding:36px; color:var(--text-muted);">
              현재 [${getStepBadgeText(step)}] 단계에 해당하는 건이 없습니다.
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
                  <div style="font-size:0.75rem; color:var(--text-muted); margin-top:3px;">접수일: ${escapeHtml(item.date)}</div>
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

// 8-2. 일반 비즈니스 단계별 액션 버튼 생성기
function getGeneralStepActionHtml(item, step, biz) {
  if (step === 'step1') {
    return `
      <button type="button" class="btn-save-setting" onclick="transferGeneralStep1ToStep2('${item.id}')" style="padding: 4px 8px; font-size: 0.78rem; background: #0284c7; color: #fff; border: none; font-weight: 850; border-radius: 6px; width: 100%;">
        ✅ 코치배정 이관 ➔
      </button>
    `;
  } else if (step === 'step2') {
    return `
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <button type="button" class="btn-save-setting" onclick="transferGeneralStep2ToStep3('${item.id}')" style="padding: 4px 8px; font-size: 0.78rem; background: #059669; color: #fff; border: none; font-weight: 850; border-radius: 6px;">
          📸 현장진행 이관 ➔
        </button>
        <button type="button" class="btn-save-setting" onclick="openDispatchFromGeneral('${item.id}')" style="padding: 3px 6px; font-size: 0.74rem; background: #fff7ed; color: #c2410c; border: 1px solid #fdba74; font-weight: 800;">
          🤝 카톡 발송
        </button>
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
      <button type="button" class="btn-save-setting" onclick="reOrderFromGeneralRetention('${item.id}')" style="padding: 4px 8px; font-size: 0.78rem; background: var(--accent); color: #fff; border: none; font-weight: 850; border-radius: 6px; width: 100%;">
        🔄 신규 재상담 접수
      </button>
    `;
  }
}

// 9. 🌟 단계 간 자동 이관(Transition) 인터랙션 함수들

// [1단계 ➔ 2단계 이관]
function transferStep1ToStep2(id, bizType) {
  if (bizType === 'beauty') {
    const list = getStoredBeautyBookings();
    const item = list.find(x => x.id === id);
    if (!item) return;

    item.status = '코치배정';
    if (!item.assignedCoach || item.assignedCoach.includes('미배정')) {
      item.assignedCoach = '김서연 전문 라이프 코치 (40대 시니어 뷰티&라이프스타일 1급)';
      item.coachPhone = '010-9613-5913';
    }
    localStorage.setItem('seniorBeautyBookings', JSON.stringify(list));
    renderBusinessMasterDashboard();

    const doMove = confirm(`✅ [상담 완료]\n\n[${item.applicantName}] 고객님의 상담이 완료되어\n[② 코치 배정] 단계로 성공적으로 이관되었습니다!\n\n지금 [② 코치 배정] 화면으로 이동하시겠습니까?`);
    if (doMove) {
      switchPipelineStep('step2');
    }
  }
}

// [2단계 ➔ 3단계 이관]
function transferStep2ToStep3(id, bizType) {
  if (bizType === 'beauty') {
    const list = getStoredBeautyBookings();
    const item = list.find(x => x.id === id);
    if (!item) return;

    item.status = '진행중';
    item.sopProgress = '180분 SOP 현장 진행 시작';
    localStorage.setItem('seniorBeautyBookings', JSON.stringify(list));
    renderBusinessMasterDashboard();

    const doMove = confirm(`🤝 [코치 배정 완료]\n\n[${item.seniorName}] 건의 담당 코치(${item.assignedCoach}) 배정이 확정되어\n[③ 현장케어/일지] 단계로 성공적으로 이관되었습니다!\n\n지금 [③ 현장케어/일지] 관제 화면으로 이동하시겠습니까?`);
    if (doMove) {
      switchPipelineStep('step3');
    }
  }
}

// [3단계 ➔ 4단계 이관]
function transferStep3ToStep4(id, bizType) {
  if (bizType === 'beauty') {
    const list = getStoredBeautyBookings();
    const item = list.find(x => x.id === id);
    if (!item) return;

    item.status = '케어완료';
    if (!item.completedAt) item.completedAt = new Date().toISOString();
    localStorage.setItem('seniorBeautyBookings', JSON.stringify(list));
    renderBusinessMasterDashboard();

    const doMove = confirm(`🎉 [180분 케어 완료 승인]\n\n[${item.seniorName}] 어르신의 180분 현장 케어가 감동 속에 성공적으로 완료되어\n[④ CRM 사후 리텐션] 루프로 이관되었습니다!\n\n지금 [④ CRM 사후 리텐션] 화면으로 이동하시겠습니까?`);
    if (doMove) {
      switchPipelineStep('step4');
    }
  }
}

// [4단계 ➔ 1단계 선순환 재상담 접수 등록]
function reOrderFromRetention(id, bizType) {
  if (bizType === 'beauty') {
    const list = getStoredBeautyBookings();
    const item = list.find(x => x.id === id);
    if (!item) return;

    const newId = 'BK-' + Math.floor(202618 + Math.random() * 100);
    const newLead = {
      ...item,
      id: newId,
      status: '상담대기',
      consultNote: `[AGAIN 선순환 재신청] 기존 케어(완료일: ${item.completedAt ? item.completedAt.slice(0,10) : ''}) 이후 정기 리케어 상담 접수.`,
      assignedCoach: '미배정 (배정 대기중)',
      sopProgress: '',
      photoBase64: '',
      completedAt: null,
      createdAt: new Date().toISOString()
    };

    list.unshift(newLead);
    localStorage.setItem('seniorBeautyBookings', JSON.stringify(list));
    renderBusinessMasterDashboard();

    const doMove = confirm(`🔄 [선순환 재상담 등록 완료]\n\n[${item.seniorName}] 어르신의 정기 180분 리케어 상담(예약ID: ${newId})이\n[① 상담신청 접수] 단계에 신규 등록되었습니다!\n\n지금 [① 상담신청 접수] 화면으로 이동하시겠습니까?`);
    if (doMove) {
      switchPipelineStep('step1');
    }
  }
}

// [이전 단계로 반려/복귀]
function revertStep(id, targetStep, bizType) {
  if (bizType === 'beauty') {
    const list = getStoredBeautyBookings();
    const item = list.find(x => x.id === id);
    if (!item) return;

    if (targetStep === 'step1') {
      item.status = '상담대기';
      alert(`[${item.id}] 건이 [① 상담신청 접수] 단계로 반려되었습니다.`);
      localStorage.setItem('seniorBeautyBookings', JSON.stringify(list));
      renderBusinessMasterDashboard();
      switchPipelineStep('step1');
    } else if (targetStep === 'step2') {
      item.status = '코치배정';
      alert(`[${item.id}] 건이 [② 코치 배정] 단계로 되돌려졌습니다.`);
      localStorage.setItem('seniorBeautyBookings', JSON.stringify(list));
      renderBusinessMasterDashboard();
      switchPipelineStep('step2');
    }
  }
}

// 9-1. 일반 비즈니스 이관 함수들
function transferGeneralStep1ToStep2(id) {
  const list = getStoredGeneralConsults();
  const item = list.find(x => x.id === id);
  if (!item) return;

  item.status = '코치배정';
  if (!item.assignedCoach || item.assignedCoach.includes('미배정')) {
    item.assignedCoach = '박지은 수석 코치';
  }
  localStorage.setItem('seniorConsultList', JSON.stringify(list));
  renderBusinessMasterDashboard();

  const doMove = confirm(`✅ [상담 완료]\n\n[${item.name}] 고객님의 상담이 완료되어\n[② 코치 배정] 단계로 이관되었습니다!\n\n지금 [② 코치 배정] 화면으로 이동하시겠습니까?`);
  if (doMove) switchPipelineStep('step2');
}

function transferGeneralStep2ToStep3(id) {
  const list = getStoredGeneralConsults();
  const item = list.find(x => x.id === id);
  if (!item) return;

  item.status = '진행중';
  localStorage.setItem('seniorConsultList', JSON.stringify(list));
  renderBusinessMasterDashboard();

  const doMove = confirm(`🤝 [코치 배정 완료]\n\n[${item.name}] 고객 건이 [③ 현장진행] 단계로 이관되었습니다!\n\n지금 현장진행 화면으로 이동하시겠습니까?`);
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

  const doMove = confirm(`🎉 [완료 승인]\n\n[${item.name}] 고객 건이 [④ CRM 사후관리] 단계로 이관되었습니다!\n\n지금 사후관리 화면으로 이동하시겠습니까?`);
  if (doMove) switchPipelineStep('step4');
}

function reOrderFromGeneralRetention(id) {
  const list = getStoredGeneralConsults();
  const item = list.find(x => x.id === id);
  if (!item) return;

  const newId = 'CS-' + Math.floor(200 + Math.random() * 100);
  const newLead = {
    ...item,
    id: newId,
    status: '상담대기',
    consultNote: `[선순환 재신청] 기존 서비스 완료 후 신규 케어 신청 접수.`,
    assignedCoach: '미배정',
    completedAt: null,
    date: new Date().toLocaleDateString('ko-KR') + ' 오전 10:00'
  };

  list.unshift(newLead);
  localStorage.setItem('seniorConsultList', JSON.stringify(list));
  renderBusinessMasterDashboard();

  const doMove = confirm(`🔄 [선순환 재상담 접수 완료]\n\n[${item.name}] 고객님의 신규 상담 건(ID: ${newId})이\n[① 상담신청 접수] 단계에 등록되었습니다!\n\n지금 상담 접수 화면으로 이동하시겠습니까?`);
  if (doMove) switchPipelineStep('step1');
}

// 10. 상태 업데이트 및 보조 함수들
function updateStep1Status(id, newStatus, bizType) {
  if (bizType === 'beauty') {
    const list = getStoredBeautyBookings();
    const item = list.find(x => x.id === id);
    if (!item) return;

    item.status = newStatus;
    localStorage.setItem('seniorBeautyBookings', JSON.stringify(list));
    renderBusinessMasterDashboard();

    if (newStatus === '상담완료') {
      transferStep1ToStep2(id, 'beauty');
    }
  }
}

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
    const note = prompt(`[${item.applicantName}] 고객 상담 일지 / 메모 입력:`, cur);
    if (note !== null) {
      item.consultNote = note;
      localStorage.setItem('seniorBeautyBookings', JSON.stringify(list));
      renderBusinessMasterDashboard();
    }
  }
}

function quickCall(phone, name) {
  alert(`[${name}] 고객님 (${phone})으로 유선 연결을 진행합니다.\n(상담 완료 후 상담 상태를 [상담완료]로 변경하시면 코치 배정 단계로 자동 이관됩니다.)`);
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
  alert('180분 현장 코칭일지가 저장되었으며, 4단계 CRM 사후 리텐션으로 즉시 이관되었습니다!');
}

// 13. 엑셀(CSV) 다운로드
function exportBusinessCSV() {
  if (currentBusinessTab === 'beauty') {
    const list = getStoredBeautyBookings();
    let csv = '\uFEFF예약ID,현재단계,신청인,관계,어르신성함,연락처,방문일시,진행장소,주소,상담메모,배정코치,처리상태,수분전,수분후,탄력,엔딩노트\n';
    list.forEach(i => {
      const diag = i.diagnostic || {};
      const stepName = getStepBadgeText(resolveItemStep(i));
      csv += `"${i.id}","${stepName}","${i.applicantName}","${i.role}","${i.seniorName}","${i.phone}","${i.visitDate}","${i.place}","${i.address || ''}","${(i.consultNote || '').replace(/"/g, '""')}","${i.assignedCoach}","${i.status}","${diag.moistureBefore || ''}","${diag.moistureAfter || ''}","${diag.elasticityAfter || ''}","${(diag.endingNote || '').replace(/"/g, '""')}"\n`;
    });
    downloadCSVFile(csv, `senior_beauty_crm_${new Date().toISOString().slice(0,10)}.csv`);
  } else {
    const consults = getStoredGeneralConsults();
    let csv = '\uFEFF상담ID,신청분야,현재단계,신청자,연락처,접수일시,상담요청,상담메모,배정코치,처리상태\n';
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

// 15. 유틸리티 & 라벨 헬퍼
function getStepBannerTitle(step, meta) {
  if (step === 'step1') return meta.step1Title;
  if (step === 'step2') return meta.step2Title;
  if (step === 'step3') return meta.step3Title;
  if (step === 'step4') return meta.step4Title;
  return `📋 ${meta.name} - 통합 4대 마스터 파이프라인 관제`;
}

function getStepBannerDesc(step, meta) {
  if (step === 'step1') return meta.step1Desc;
  if (step === 'step2') return meta.step2Desc;
  if (step === 'step3') return meta.step3Desc;
  if (step === 'step4') return meta.step4Desc;
  return '상담 접수부터 코치 배정, 현장 케어 실행, CRM 사후 리텐션까지 전 단계를 한눈에 관제합니다.';
}

function getStepBadgeText(step) {
  if (step === 'step1') return '1단계: 상담접수';
  if (step === 'step2') return '2단계: 코치배정';
  if (step === 'step3') return '3단계: 현장케어';
  if (step === 'step4') return '4단계: CRM리텐션';
  return '통합 마스터';
}

function getStepBadgeHtml(step) {
  if (step === 'step1') {
    return `<span class="badge" style="background:#fff0f3; color:#b83354; border:1px solid #f8c8d2; font-size:0.75rem; font-weight:800; padding:2px 6px;">① 상담접수</span>`;
  } else if (step === 'step2') {
    return `<span class="badge" style="background:#f0f9ff; color:#0284c7; border:1px solid #bae6fd; font-size:0.75rem; font-weight:800; padding:2px 6px;">② 코치배정</span>`;
  } else if (step === 'step3') {
    return `<span class="badge" style="background:#f0fdf4; color:#15803d; border:1px solid #bbf7d0; font-size:0.75rem; font-weight:800; padding:2px 6px;">③ 현장케어</span>`;
  } else if (step === 'step4') {
    return `<span class="badge" style="background:#faf5ff; color:#7c3aed; border:1px solid #e9d5ff; font-size:0.75rem; font-weight:800; padding:2px 6px;">④ CRM사후</span>`;
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
