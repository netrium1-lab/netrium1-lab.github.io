/**
 * 🎓 여백과 결 코칭 아카데미 — 5대 비즈니스 4주 정규과정 · 수강료 · 예상수익 단일 원천 데이터 엔진
 * - admin.html (06. 코치 아카데미 > 6-3 과정 수강료 · 예상수익 설정)에서 수정 시
 *   localStorage + Firebase Firestore(academy_config/courses_v1)에 동시 저장되어
 *   academy.html(PC · 모바일 방문자 전체)에 실시간 반영됩니다.
 */
(function (global) {
  'use strict';

  const STORAGE_KEY = 'yebaek_academy_courses_v1';
  const FIRESTORE_COLLECTION = 'academy_config';
  const FIRESTORE_DOC = 'courses_v1';

  const DEFAULT_ACADEMY_CONFIG = {
    version: '20261122_v1',
    cohortLabel: '2026년 1기 창립 파운더스',
    capacityNote: '과정별 소수정예 선착순 15명 마감',
    scheduleSummary: '각 과정 4주 단일 정규과정 · 주 1회 4시간 (총 16시간 이론+현장실습)',
    showRevenuePublic: false,
    revenueDisclaimer: '※ 교육 일정 및 정원은 기수별 운영 사정에 따라 조정될 수 있습니다.',
    nextOpeningDate: '매월 첫째 주 개강 (평일반 / 주말 집중반 선택)',
    updatedAt: '',
    courses: [
      {
        id: 'track_beauty',
        code: '01',
        categoryTag: 'WELL-LIFE 01',
        icon: '💄',
        shortName: '시니어 뷰티 케어',
        title: '시니어 뷰티 라이프케어 코치',
        subtitle: '180분 표준 방문 SOP · 시니어 맞춤 메이크업 & 생기 테라피',
        badge: '4주 단일 정규과정 · 재방문율 1위',
        accentColor: '#b83354',
        softBg: '#fff1f4',
        image: 'images/care-beauty-hero.jpg',
        duration: '4주 정규과정 (총 16시간)',
        sessionTime: '현장 180분 (1회 방문)',
        regularPrice: 500000,
        salePrice: 350000,
        coachFeePerCase: 150000,
        coachFeeUnit: '회당',
        coachFeeNote: '180분 방문 1회 기준 · 3·6개월 정기 리케어(AGAIN180) 반복 매칭',
        recommendedMonthlyCount: 4,
        status: '모집중',
        toolBadge: '📱 코치 현장앱 (coach.html) 연동',
        summary: '거동이 불편하거나 특별한 외출을 앞둔 어르신 댁에 직접 방문하여, 저자극 보습 테라피·내추럴 메이크업·외출 스타일링과 기념 스냅까지 180분 표준 프로토콜로 수행합니다.',
        deliverable: '본사 3-1 시니어 뷰티 고객 1:1 배정 · 현장 사진 3종 제출 시 즉시 활동비 정산',
        weeks: [
          { week: '1주차', title: '시니어 피부학 & 저자극 릴랙싱 터치', desc: '건조·민감 노년기 피부 진단, 손·두피 순환 마사지 및 위생 프로토콜 실습' },
          { week: '2주차', title: '품격 내추럴 메이크업 & 눈썹 복원', desc: '주름 부각 없는 화사한 베이스, 자연스러운 혈색 립·눈썹 드로잉 집중 훈련' },
          { week: '3주차', title: '시니어 퍼스널 컬러 & 외출 코디네이션', desc: '얼굴빛을 살리는 스카프·의상 매칭 및 어르신 자존감을 높이는 칭찬 대화법' },
          { week: '4주차', title: '180분 방문 SOP 실전 시뮬레이션 & 수료 심사', desc: '코치 현장앱(coach.html) 리포트 작성·사진 촬영 실습 및 공인 코치 최종 인증' }
        ]
      },
      {
        id: 'track_wardrobe',
        code: '02',
        categoryTag: 'WELL-LIFE 02',
        icon: '👗',
        shortName: '옷장 · 공간 비움',
        title: '옷장 & 공간 비움 코디네이터',
        subtitle: '애착 존중 선별 · 계절 옷장 큐레이션 & 낙상 예방 안전 동선',
        badge: '4주 단일 정규과정 · 계절 정기수요',
        accentColor: '#235a3f',
        softBg: '#eef6f1',
        image: 'images/showcase-books-organizing.jpg',
        duration: '4주 정규과정 (총 16시간)',
        sessionTime: '현장 4시간 (1회 방문)',
        regularPrice: 500000,
        salePrice: 350000,
        coachFeePerCase: 180000,
        coachFeeUnit: '회당',
        coachFeeNote: '4시간 공간 코칭 1회 기준 · 2인 1조 안심 방문 및 계절별 재매칭',
        recommendedMonthlyCount: 4,
        status: '모집중',
        toolBadge: '📱 코치 현장앱 (coach.html) 연동',
        summary: '수십 년 쌓인 옷장과 생활 공간을 무리하게 버리지 않고, 어르신의 추억을 존중하며 안전하고 품격 있는 일상 공간(골든존)으로 재설계하는 방문 공간 코칭 전문가입니다.',
        deliverable: '본사 3-2 옷장·공간 비움 고객 배정 · 비포/에프터 리포트 검수 후 활동비 정산',
        weeks: [
          { week: '1주차', title: '비움의 심리학 & 애착 물건 공감 대화법', desc: '상실감을 최소화하며 "남길 소중한 것"을 합의하는 시니어 전용 상담 기법' },
          { week: '2주차', title: '시니어 옷장 큐레이션 & 한눈에 수납법', desc: '계절별 외출복 선별, 시인성 높은 투명 수납함·라벨링 표준 시스템 구축' },
          { week: '3주차', title: '낙상 예방 안전 동선 & 골든존 배치 설계', desc: '허리 높이(골든존) 자주 쓰는 물품 배치, 보행 안전 동선 확보 체크리스트' },
          { week: '4주차', title: '2인 1조 방문 현장 실무 & 사후 유지 코칭', desc: '4시간 현장 타임테이블 운영, 코치앱 완료 보고 및 공인 코치 최종 인증' }
        ]
      },
      {
        id: 'track_legacy',
        code: '03',
        categoryTag: 'WELL-LIFE 03',
        icon: '📦',
        shortName: '유품 · 짐 아카이빙',
        title: '유품 & 오래된 짐 아카이빙 플래너',
        subtitle: '존엄한 생전 정리 · 추억 사진·유품 분류 및 디지털 유산 갈무리',
        badge: '4주 단일 정규과정 · 고단가 전문분야',
        accentColor: '#9a5d29',
        softBg: '#fdf5eb',
        image: 'images/showcase-senior-happy-book.jpg',
        duration: '4주 정규과정 (총 16시간)',
        sessionTime: '현장 4~6시간 (1~2회)',
        regularPrice: 550000,
        salePrice: 390000,
        coachFeePerCase: 250000,
        coachFeeUnit: '건당',
        coachFeeNote: '생전·유품 아카이빙 1건 기준 · 가족 단위 추천 및 서재 구축 연계',
        recommendedMonthlyCount: 3,
        status: '모집중',
        toolBadge: '🏛️ 나의 서재 (my-room.html) 연계',
        summary: '오래된 앨범, 편지, 훈장, 귀중품을 단순 폐기가 아닌 "기록과 계승"의 관점으로 선별·디지털 아카이빙하여 어르신과 가족의 마음을 어루만지는 웰다잉 정리 전문가입니다.',
        deliverable: '본사 3-3 유품·짐 아카이빙 고객 배정 · 가족 신뢰 기반 고단가 수행 정산',
        weeks: [
          { week: '1주차', title: '생전정리 철학 & 여백노트 엔딩 가이드', desc: '존엄한 삶의 갈무리 이해, 가족과 함께하는 사전 정리 커뮤니케이션 매뉴얼' },
          { week: '2주차', title: '추억 물건 분류 & 600DPI 디지털 아카이빙', desc: '옛 사진·상장·편지 손상 방지 스캔 및 온라인 서재(my-room) 보관 체계 실습' },
          { week: '3주차', title: '유품 정리 프로토콜 & 기부·법적 기초 소양', desc: '귀중품 선별, 기부·공양 연계, 유가족 분쟁 예방 및 안심 처리 체크리스트' },
          { week: '4주차', title: '가족 동행 실전 시나리오 & 최종 수료 심사', desc: '현장 애도 케어 대화 실습, 완료 보고서 작성 및 공인 코치 최종 인증' }
        ]
      },
      {
        id: 'track_party',
        code: '04',
        categoryTag: 'WELL-LIFE 04',
        icon: '💌',
        shortName: '생전 엔딩 파티',
        title: '생전 엔딩 파티 디렉터',
        subtitle: '살아생전 가장 따뜻한 감사 축제 · 가족 헌정식 기획 & 현장 진행',
        badge: '4주 단일 정규과정 · 프리미엄 행사',
        accentColor: '#7a3594',
        softBg: '#faf2fd',
        image: 'images/living-funeral-party-card.jpg',
        duration: '4주 정규과정 (총 16시간)',
        sessionTime: '기획 + 행사 당일 디렉팅',
        regularPrice: 550000,
        salePrice: 390000,
        coachFeePerCase: 300000,
        coachFeeUnit: '건당',
        coachFeeNote: '생전 감사 파티 1건 디렉팅 기준 · 뷰티·자서전 패키지 동시 확장',
        recommendedMonthlyCount: 2,
        status: '모집중',
        toolBadge: '📱 코치 현장앱 & 헌정 영상 연계',
        summary: '칠순·팔순 또는 건강하실 때 가족과 지인을 초대해 고마움을 전하는 "살아있는 감사 축제(생전 엔딩 파티)"의 스토리 기획, 헌정 편지, 현장 연출을 총괄합니다.',
        deliverable: '본사 3-4 생전 엔딩 파티 고객 배정 · 행사 디렉팅 완료 후 활동비 정산',
        weeks: [
          { week: '1주차', title: '생전 감사 파티 문화 & 스토리보드 기획', desc: '무겁지 않고 감동적인 생전 파티 콘셉트 설계 및 주인공 생애 하이라이트 도출' },
          { week: '2주차', title: '가족 감사 편지·헌정 영상 큐시트 제작', desc: '가족 인터뷰 수집, 추억 사진 슬라이드·육성 메시지 구성 및 식순 디자인' },
          { week: '3주차', title: '소규모 프리미엄 공간 연출 & 진행 화법', desc: '호텔 룸·자택·소규모 라운지 세팅 체크리스트, 감동을 이끄는 품격 진행 스피치' },
          { week: '4주차', title: '모의 엔딩 파티 리허설 & 최종 수료 심사', desc: '식순 실전 리허설, 뷰티·자서전 연계 패키지 제안 실습 및 공인 코치 인증' }
        ]
      },
      {
        id: 'track_memoir',
        code: '05',
        categoryTag: 'SIGNATURE 05',
        icon: '✍️',
        shortName: '디지털 자서전 · 평전',
        title: '디지털 자서전 · VIP 평전 코치',
        subtitle: '20문항 구술 인터뷰 채록 · AI 5단계 감성 윤문 · 모바일 웹북 & 양장본 출판',
        badge: '4주 단일 정규과정 · 시그니처 과정',
        accentColor: '#a84432',
        softBg: '#fdf3f0',
        image: 'images/showcase-senior-memoir.jpg',
        duration: '4주 정규과정 (총 16시간)',
        sessionTime: '구술 2~3회 + AI 초안 검수',
        regularPrice: 600000,
        salePrice: 450000,
        coachFeePerCase: 450000,
        coachFeeUnit: '프로젝트당',
        coachFeeNote: '구술 방문 및 5챕터 검수·완간 프로젝트 기준',
        recommendedMonthlyCount: 2,
        status: '모집중',
        toolBadge: '✍️ AI 자서전 코치앱 (coach-memoir.html) 무상 제공',
        summary: '글쓰기 경험이 없어도 전용 AI 집필 앱으로 어르신의 구술 음성을 5대 챕터 명품 에세이로 완성하고, 300DPI QR 오디오북·모바일 웹북·신국판 양장본 출판까지 이끄는 시그니처 과정입니다.',
        deliverable: '본사 04 디지털 자서전 프로젝트 전담 배정 · 구술 완료 및 완간 단계별 검수',
        weeks: [
          { week: '1주차', title: '생애 구술 인터뷰 20문항 & 공감 경청법', desc: '어르신의 기억을 자연스럽게 열어주는 시대별 질문 설계 및 고음질 핀마이크 녹음 실습' },
          { week: '2주차', title: 'AI 5단계 감성 윤문 코치앱 실전 활용', desc: 'coach-memoir.html 음성 텍스트 변환 → AI 문체 다듬기 → 원문 대조 검수 훈련' },
          { week: '3주차', title: '옛 사진 복원 큐레이션 & 오디오 QR 연동', desc: '챕터별 추억 사진 배치, 어르신 육성 프롤로그 녹음 및 모바일 웹북·플립북 검수' },
          { week: '4주차', title: '샘플 자서전 1권 완성 & 공인 작가 코치 인증', desc: '신국판 양장본 조판 확인, VIP 가문 전시관(heritage.html) 안내 실습 및 수료 심사' }
        ]
      }
    ]
  };

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function mergeConfig(saved) {
    const base = deepClone(DEFAULT_ACADEMY_CONFIG);
    if (!saved || typeof saved !== 'object') return base;

    const merged = Object.assign({}, base, {
      cohortLabel: saved.cohortLabel || base.cohortLabel,
      capacityNote: saved.capacityNote || base.capacityNote,
      scheduleSummary: saved.scheduleSummary || base.scheduleSummary,
      showRevenuePublic: saved.showRevenuePublic !== false,
      revenueDisclaimer: saved.revenueDisclaimer || base.revenueDisclaimer,
      nextOpeningDate: saved.nextOpeningDate || base.nextOpeningDate,
      updatedAt: saved.updatedAt || ''
    });

    if (Array.isArray(saved.courses) && saved.courses.length > 0) {
      merged.courses = base.courses.map(function (defCourse) {
        const found = saved.courses.find(function (c) { return c && c.id === defCourse.id; });
        if (!found) return defCourse;
        const mergedCourse = Object.assign({}, defCourse, found, {
          regularPrice: Math.max(0, Number(found.regularPrice != null ? found.regularPrice : defCourse.regularPrice) || 0),
          salePrice: Math.max(0, Number(found.salePrice != null ? found.salePrice : defCourse.salePrice) || 0),
          coachFeePerCase: Math.max(0, Number(found.coachFeePerCase != null ? found.coachFeePerCase : defCourse.coachFeePerCase) || 0),
          recommendedMonthlyCount: Math.max(1, Number(found.recommendedMonthlyCount != null ? found.recommendedMonthlyCount : defCourse.recommendedMonthlyCount) || 1),
          weeks: (Array.isArray(found.weeks) && found.weeks.length > 0) ? found.weeks : defCourse.weeks
        });
        if (!mergedCourse.image || mergedCourse.image === 'images/living-funeral-party-1.jpg') {
          mergedCourse.image = defCourse.image;
        }
        return mergedCourse;
      });
    }
    return merged;
  }

  function getConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return mergeConfig(JSON.parse(raw));
      }
    } catch (e) {
      console.warn('[YebaekAcademyConfig] local parse warn:', e);
    }
    return deepClone(DEFAULT_ACADEMY_CONFIG);
  }

  async function saveConfig(nextConfig, fbDb) {
    const normalized = mergeConfig(nextConfig);
    normalized.updatedAt = new Date().toISOString().slice(0, 16).replace('T', ' ');
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    } catch (e) {
      console.warn('[YebaekAcademyConfig] localStorage save warn:', e);
    }

    let cloudSaved = false;
    const db = fbDb || (typeof global.db !== 'undefined' ? global.db : null);
    if (db) {
      try {
        await db.collection(FIRESTORE_COLLECTION).doc(FIRESTORE_DOC).set(normalized, { merge: true });
        cloudSaved = true;
      } catch (err) {
        console.warn('[YebaekAcademyConfig] Firestore save warn:', err);
      }
    }
    return { config: normalized, cloudSaved: cloudSaved };
  }

  function loadFromCloud(fbDb, onUpdate) {
    const db = fbDb || (typeof global.db !== 'undefined' ? global.db : null);
    if (!db) return null;
    try {
      return db.collection(FIRESTORE_COLLECTION).doc(FIRESTORE_DOC).onSnapshot(
        function (doc) {
          if (doc && doc.exists) {
            const remote = mergeConfig(doc.data());
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
            } catch (e) {}
            if (typeof onUpdate === 'function') onUpdate(remote);
          }
        },
        function (err) {
          console.warn('[YebaekAcademyConfig] Cloud sync warn:', err);
        }
      );
    } catch (e) {
      console.warn('[YebaekAcademyConfig] Cloud listener warn:', e);
      return null;
    }
  }

  async function resetDefault(fbDb) {
    return saveConfig(deepClone(DEFAULT_ACADEMY_CONFIG), fbDb);
  }

  function calcDiscountPercent(regularPrice, salePrice) {
    const reg = Number(regularPrice) || 0;
    const sale = Number(salePrice) || 0;
    if (reg <= 0 || sale >= reg) return 0;
    return Math.round(((reg - sale) / reg) * 100);
  }

  function calcPaybackCount(salePrice, coachFeePerCase) {
    const sale = Number(salePrice) || 0;
    const fee = Number(coachFeePerCase) || 0;
    if (sale <= 0 || fee <= 0) return 0;
    return Math.ceil(sale / fee);
  }

  global.YebaekAcademyConfig = {
    STORAGE_KEY: STORAGE_KEY,
    DEFAULT_CONFIG: DEFAULT_ACADEMY_CONFIG,
    getConfig: getConfig,
    saveConfig: saveConfig,
    loadFromCloud: loadFromCloud,
    resetDefault: resetDefault,
    calcDiscountPercent: calcDiscountPercent,
    calcPaybackCount: calcPaybackCount
  };

  // ================= 📸 아카데미 현장 진행사례 · 사진 갤러리 단일 원천 데이터 엔진 =================
  const CASES_STORAGE_KEY = 'yebaek_academy_cases_v1';
  const CASES_COLLECTION = 'academy_cases';
  let _memoryCasesRaw = null;

  const DEFAULT_ACADEMY_CASES = [
    {
      id: 'case_sample_beauty',
      courseId: 'track_beauty',
      title: '서울 강남구 70대 어르신 180분 뷰티 리셋 & 외출 스냅',
      location: '서울 강남구',
      coachName: '여백과 결 공인 코치팀',
      date: '2026.11',
      summary: '오랜만에 손녀 결혼식에 참석하시는 어르신 댁에 방문해 저자극 보습 마사지, 자연스러운 혈색 메이크업, 스카프 스타일링과 기념 인물 사진까지 180분 표준 SOP로 정성껏 진행했습니다.',
      photos: ['images/care-beauty-hero.jpg'],
      published: true,
      isSample: true,
      createdAt: 1795000005000,
      updatedAt: '2026-11-22'
    },
    {
      id: 'case_sample_wardrobe',
      courseId: 'track_wardrobe',
      title: '경기 분당 30년 쌓인 계절 옷장 비움 & 안전 동선 재설계',
      location: '경기 성남시 분당구',
      coachName: '여백과 결 공인 코치팀',
      date: '2026.11',
      summary: '어르신의 애착 옷을 억지로 버리지 않고 공감 대화로 선별한 뒤, 자주 입으시는 계절 외출복을 허리 높이 골든존에 한눈에 보이도록 재배치해 낙상 위험 없는 쾌적한 일상을 완성했습니다.',
      photos: ['images/showcase-books-organizing.jpg'],
      published: true,
      isSample: true,
      createdAt: 1795000004000,
      updatedAt: '2026-11-22'
    },
    {
      id: 'case_sample_legacy',
      courseId: 'track_legacy',
      title: '평생 모은 가족 앨범 · 훈장 · 손편지 600DPI 디지털 아카이빙',
      location: '서울 서초구',
      coachName: '여백과 결 공인 코치팀',
      date: '2026.10',
      summary: '바래가는 흑백 사진과 표창장, 가족 손편지를 손상 없이 분류·스캔하여 자녀 세대도 스마트폰으로 언제든 열어볼 수 있는 온라인 보물 서재로 정갈하게 갈무리했습니다.',
      photos: ['images/showcase-senior-happy-book.jpg'],
      published: true,
      isSample: true,
      createdAt: 1795000003000,
      updatedAt: '2026-11-22'
    },
    {
      id: 'case_sample_party',
      courseId: 'track_party',
      title: '팔순 기념 살아있는 감사 축제 · 가족 헌정 생전 엔딩 파티',
      location: '서울 송파구',
      coachName: '여백과 결 공인 코치팀',
      date: '2026.10',
      summary: '직계 가족 14명이 모인 소규모 프라이빗 라운지에서 어르신의 인생 하이라이트 영상 상영, 자녀 감사 편지 낭독, 축하 꽃다발 헌정식을 따뜻하고 품격 있게 디렉팅했습니다.',
      photos: ['images/living-funeral-party-card.jpg'],
      published: true,
      isSample: true,
      createdAt: 1795000002000,
      updatedAt: '2026-11-22'
    },
    {
      id: 'case_sample_memoir',
      courseId: 'track_memoir',
      title: '3회 구술 인터뷰로 완성한 5챕터 디지털 자서전 & 양장본 출판',
      location: '인천 연수구',
      coachName: '여백과 결 공인 코치팀',
      date: '2026.10',
      summary: '전용 AI 자서전 코치앱으로 어르신의 생애 이야기를 20문항 구술 채록해 5대 챕터 에세이로 엮어내고, 어르신 육성 프롤로그 QR이 담긴 신국판 양장본과 가족 공유 모바일 웹북을 헌정했습니다.',
      photos: ['images/showcase-senior-memoir.jpg'],
      published: true,
      isSample: true,
      createdAt: 1795000001000,
      updatedAt: '2026-11-22'
    }
  ];

  const DEFAULT_CASE_IDS = DEFAULT_ACADEMY_CASES.map(function (c) { return c.id; });

  function readRawCaseOverrides() {
    if (Array.isArray(_memoryCasesRaw)) return deepClone(_memoryCasesRaw);
    try {
      const raw = localStorage.getItem(CASES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          _memoryCasesRaw = parsed;
          return deepClone(parsed);
        }
      }
    } catch (e) {
      console.warn('[YebaekAcademyCases] local parse warn:', e);
    }
    return [];
  }

  function writeRawCaseOverrides(list) {
    _memoryCasesRaw = deepClone(list);
    try {
      localStorage.setItem(CASES_STORAGE_KEY, JSON.stringify(_memoryCasesRaw));
    } catch (e) {
      console.warn('[YebaekAcademyCases] localStorage quota warn (keeping in memory + Firestore):', e);
    }
  }

  function mergeCasesFromOverrides(overrides) {
    const map = {};
    DEFAULT_ACADEMY_CASES.forEach(function (d) {
      map[d.id] = deepClone(d);
    });
    (overrides || []).forEach(function (item) {
      if (!item || !item.id) return;
      if (item.deleted) {
        delete map[item.id];
      } else {
        const prev = map[item.id] || {};
        const photos = (Array.isArray(item.photos)
          ? item.photos.filter(Boolean)
          : (item.photo ? [item.photo] : (prev.photos || [])))
          .map(function (p) { return p === 'images/living-funeral-party-1.jpg' ? 'images/living-funeral-party-card.jpg' : p; });
        map[item.id] = Object.assign({}, prev, item, {
          photos: photos,
          published: item.published !== false,
          createdAt: Number(item.createdAt) || Number(prev.createdAt) || Date.now()
        });
      }
    });
    return Object.keys(map)
      .map(function (k) { return map[k]; })
      .sort(function (a, b) { return (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0); });
  }

  function getCases(includeUnpublished) {
    const merged = mergeCasesFromOverrides(readRawCaseOverrides());
    if (includeUnpublished) return merged;
    return merged.filter(function (c) { return c.published !== false; });
  }

  async function saveCase(caseInput, fbDb) {
    const now = Date.now();
    const id = (caseInput && caseInput.id) ? String(caseInput.id) : ('case_' + now);
    const photos = Array.isArray(caseInput.photos) ? caseInput.photos.filter(Boolean).slice(0, 3) : [];
    const payload = {
      id: id,
      courseId: caseInput.courseId || 'track_beauty',
      title: String(caseInput.title || '').trim(),
      location: String(caseInput.location || '').trim(),
      coachName: String(caseInput.coachName || '').trim(),
      date: String(caseInput.date || '').trim() || new Date().toISOString().slice(0, 7).replace('-', '.'),
      summary: String(caseInput.summary || '').trim(),
      photos: photos,
      published: caseInput.published !== false,
      deleted: false,
      createdAt: Number(caseInput.createdAt) || now,
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };

    const overrides = readRawCaseOverrides().filter(function (x) { return x && x.id !== id; });
    overrides.unshift(payload);
    writeRawCaseOverrides(overrides);

    let cloudSaved = false;
    const db = fbDb || (typeof global.db !== 'undefined' ? global.db : null);
    if (db) {
      try {
        await db.collection(CASES_COLLECTION).doc(id).set(payload, { merge: true });
        cloudSaved = true;
      } catch (err) {
        console.warn('[YebaekAcademyCases] Firestore save warn:', err);
      }
    }
    return { item: payload, cloudSaved: cloudSaved };
  }

  async function deleteCase(caseId, fbDb) {
    if (!caseId) return { cloudSaved: false };
    const isDefault = DEFAULT_CASE_IDS.indexOf(caseId) !== -1;
    let overrides = readRawCaseOverrides().filter(function (x) { return x && x.id !== caseId; });
    if (isDefault) {
      overrides.push({
        id: caseId,
        deleted: true,
        updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
      });
    }
    writeRawCaseOverrides(overrides);

    let cloudSaved = false;
    const db = fbDb || (typeof global.db !== 'undefined' ? global.db : null);
    if (db) {
      try {
        if (isDefault) {
          await db.collection(CASES_COLLECTION).doc(caseId).set({
            id: caseId,
            deleted: true,
            updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
          });
        } else {
          await db.collection(CASES_COLLECTION).doc(caseId).delete();
        }
        cloudSaved = true;
      } catch (err) {
        console.warn('[YebaekAcademyCases] Firestore delete warn:', err);
      }
    }
    return { cloudSaved: cloudSaved };
  }

  async function toggleCasePublish(caseId, nextPublished, fbDb) {
    const all = getCases(true);
    const target = all.find(function (c) { return c.id === caseId; });
    if (!target) return { cloudSaved: false };
    target.published = !!nextPublished;
    return saveCase(target, fbDb);
  }

  async function resetDefaultCases(fbDb) {
    // 삭제했던 기본 샘플 사례만 복원하고, 관리자가 새로 올린 사례는 보존
    const overrides = readRawCaseOverrides().filter(function (x) {
      return x && DEFAULT_CASE_IDS.indexOf(x.id) === -1;
    });
    writeRawCaseOverrides(overrides);

    const db = fbDb || (typeof global.db !== 'undefined' ? global.db : null);
    if (db) {
      for (let i = 0; i < DEFAULT_CASE_IDS.length; i++) {
        try {
          await db.collection(CASES_COLLECTION).doc(DEFAULT_CASE_IDS[i]).delete();
        } catch (e) {}
      }
    }
    return getCases(true);
  }

  function loadFromCloud(fbDb, onUpdate) {
    const db = fbDb || (typeof global.db !== 'undefined' ? global.db : null);
    if (!db) return null;
    try {
      return db.collection(CASES_COLLECTION).onSnapshot(
        function (snapshot) {
          if (!snapshot) return;
          const cloudOverrides = [];
          snapshot.forEach(function (doc) {
            const d = doc.data();
            if (d) {
              cloudOverrides.push(Object.assign({ id: doc.id }, d));
            }
          });
          // 클라우드가 비어 있어도 로컬 기본값 유지, 클라우드에 문서가 있으면 클라우드 기준 반영
          if (cloudOverrides.length > 0 || !snapshot.metadata || !snapshot.metadata.fromCache) {
            writeRawCaseOverrides(cloudOverrides);
          }
          if (typeof onUpdate === 'function') {
            onUpdate(getCases(false), getCases(true));
          }
        },
        function (err) {
          console.warn('[YebaekAcademyCases] Cloud sync warn:', err);
        }
      );
    } catch (e) {
      console.warn('[YebaekAcademyCases] Cloud listener warn:', e);
      return null;
    }
  }

  function compressImage(file, maxWidth, quality) {
    const maxW = maxWidth || 1080;
    const q = quality || 0.78;
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onload = function (ev) {
        const img = new Image();
        img.onload = function () {
          let w = img.width;
          let h = img.height;
          if (w > maxW) {
            h = Math.round((h * maxW) / w);
            w = maxW;
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);

          let outQuality = q;
          let dataUrl = canvas.toDataURL('image/jpeg', outQuality);
          // 1장당 220KB 이하가 되도록 자동 품질 미세 조정 (Firestore 3장 합산 1MB 제한 안전 보장)
          while (dataUrl.length > 290000 && outQuality > 0.45) {
            outQuality -= 0.1;
            dataUrl = canvas.toDataURL('image/jpeg', outQuality);
          }
          const kb = Math.round((dataUrl.length * 3) / 4 / 1024);
          resolve({ dataUrl: dataUrl, width: w, height: h, kb: kb });
        };
        img.onerror = function () { reject(new Error('이미지를 불러올 수 없습니다.')); };
        img.src = ev.target.result;
      };
      reader.onerror = function () { reject(new Error('파일을 읽을 수 없습니다.')); };
      reader.readAsDataURL(file);
    });
  }

  global.YebaekAcademyCases = {
    STORAGE_KEY: CASES_STORAGE_KEY,
    COLLECTION: CASES_COLLECTION,
    DEFAULT_CASES: DEFAULT_ACADEMY_CASES,
    getCases: getCases,
    saveCase: saveCase,
    deleteCase: deleteCase,
    toggleCasePublish: toggleCasePublish,
    resetDefaultCases: resetDefaultCases,
    loadFromCloud: loadFromCloud,
    compressImage: compressImage
  };
})(window);
