/**
 * 여백과 결, 리셋 아카이브 (https://yebaekarchive.kr)
 * 공용 브랜드 도메인 · 클라우드 미디어 업로드 · 인쇄용 벡터(SVG) QR 생성 · VIP 가문 전시관 공용 모듈
 */
(function (global) {
  'use strict';

  const BRAND_ORIGIN = 'https://yebaekarchive.kr';

  /**
   * 인쇄용 QR 코드 및 외부 가족 공유에 항상 공식 브랜드 도메인을 반환합니다.
   * (로컬 테스트 환경에서도 책에 인쇄될 QR이 localhost로 생성되는 사고를 원천 방지)
   */
  function getPrintUrl(pathAndQuery) {
    const clean = String(pathAndQuery || '').replace(/^\/+/, '');
    if (/^https?:\/\//i.test(clean)) return clean;
    return clean ? `${BRAND_ORIGIN}/${clean}` : `${BRAND_ORIGIN}/`;
  }

  /**
   * 현재 브라우저 기준 공유 링크 (로컬 개발 시 테스트 편의 유지, 라이브는 공식 도메인 고정)
   */
  function getLiveShareUrl(pathAndQuery) {
    const clean = String(pathAndQuery || '').replace(/^\/+/, '');
    if (/^https?:\/\//i.test(clean)) return clean;
    const host = (global.location && global.location.hostname) || '';
    const isLocal = !host || host === 'localhost' || host === '127.0.0.1';
    const base = isLocal ? `${BRAND_ORIGIN}` : global.location.origin;
    return clean ? `${base}/${clean}` : `${base}/`;
  }

  /**
   * 인쇄용(300 DPI 이상 무손실) 순수 벡터 SVG QR 코드 문자열 생성
   * - qrcode-generator 라이브러리 사용 시 완전 오프라인 즉시 벡터 생성
   */
  function generateQrSvgString(url, options) {
    const opts = Object.assign({
      colorDark: '#000000',
      colorLight: '#ffffff',
      margin: 4,
      errorCorrection: 'M'
    }, options || {});

    if (typeof global.qrcode !== 'function') {
      return '';
    }

    try {
      const qr = global.qrcode(0, opts.errorCorrection);
      qr.addData(String(url || BRAND_ORIGIN));
      qr.make();
      const count = qr.getModuleCount();
      const margin = opts.margin;
      const total = count + margin * 2;
      let pathParts = [];

      for (let r = 0; r < count; r++) {
        for (let c = 0; c < count; c++) {
          if (qr.isDark(r, c)) {
            const x = c + margin;
            const y = r + margin;
            pathParts.push(`M${x},${y}h1v1h-1z`);
          }
        }
      }

      return [
        `<?xml version="1.0" encoding="UTF-8"?>`,
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" width="600" height="600" shape-rendering="crispEdges">`,
        `<rect width="100%" height="100%" fill="${opts.colorLight}"/>`,
        `<path d="${pathParts.join('')}" fill="${opts.colorDark}"/>`,
        `</svg>`
      ].join('');
    } catch (err) {
      console.warn('[YebaekMedia] SVG QR 생성 오류:', err);
      return '';
    }
  }

  /**
   * 컨테이너 DOM 요소 안에 선명한 벡터 QR 코드를 렌더링합니다.
   */
  function renderQrIntoContainer(containerEl, url, options) {
    if (!containerEl) return;
    const targetUrl = String(url || BRAND_ORIGIN);
    const svgStr = generateQrSvgString(targetUrl, options);
    if (svgStr) {
      containerEl.innerHTML = svgStr;
      const svgEl = containerEl.querySelector('svg');
      if (svgEl) {
        svgEl.style.width = '100%';
        svgEl.style.height = '100%';
        svgEl.style.display = 'block';
      }
      return true;
    }
    // CDN 미로드 시 외부 QR SVG/PNG 폴백
    const fallbackSrc = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=10&data=${encodeURIComponent(targetUrl)}`;
    containerEl.innerHTML = `<img src="${fallbackSrc}" alt="인쇄용 QR 코드" style="width:100%;height:100%;display:block;object-fit:contain;">`;
    return false;
  }

  /**
   * 300 DPI 양장본 책 인쇄용 순수 벡터(.svg) QR 파일 다운로드
   * - Adobe InDesign, Illustrator, Photoshop에 바로 배치 가능
   */
  async function downloadPrintQrSvg(url, fileBaseName) {
    const targetUrl = String(url || BRAND_ORIGIN);
    const safeName = String(fileBaseName || 'yebaek_print_qr')
      .replace(/[\\/:*?"<>|\s]+/g, '_')
      .slice(0, 60);
    let svgStr = generateQrSvgString(targetUrl, { colorDark: '#000000', colorLight: '#ffffff', margin: 4, errorCorrection: 'H' });

    if (!svgStr) {
      try {
        const res = await fetch(`https://api.qrserver.com/v1/create-qr-code/?format=svg&size=600x600&margin=12&ecc=H&data=${encodeURIComponent(targetUrl)}`);
        if (res.ok) svgStr = await res.text();
      } catch (e) {
        console.warn('[YebaekMedia] 원격 SVG 폴백 실패:', e);
      }
    }

    if (!svgStr) {
      window.open(`https://api.qrserver.com/v1/create-qr-code/?format=svg&size=600x600&margin=12&ecc=H&data=${encodeURIComponent(targetUrl)}`, '_blank');
      return false;
    }

    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const dlUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = dlUrl;
    a.download = `${safeName}_300DPI_벡터QR.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(dlUrl), 1500);
    return true;
  }

  /**
   * Firebase Storage 클라우드 미디어 업로드 (육성 오디오 MP3 · 복원 사진 · 유품 사진)
   * - 모든 가족의 스마트폰에서 QR 스캔 즉시 재생/열람 가능한 영구 HTTPS URL 반환
   * - Firebase Storage 미활성화/권한 오류 시 친절한 안내 코드와 함께 안전하게 폴백 처리
   */
  function uploadFileToFirebaseStorage(file, folderPath, onProgress) {
    return new Promise((resolve) => {
      if (!file) {
        resolve({ ok: false, code: 'no-file', error: '선택된 파일이 없습니다.' });
        return;
      }

      if (typeof global.firebase === 'undefined' || typeof global.firebase.storage !== 'function') {
        resolve({
          ok: false,
          code: 'sdk-missing',
          error: 'Firebase Storage SDK가 로드되지 않았습니다. 외부 클라우드 URL을 직접 입력하거나 페이지를 새로고침해 주세요.'
        });
        return;
      }

      try {
        const storage = global.firebase.storage();
        const cleanFolder = String(folderPath || 'memoir_media').replace(/^\/+|\/+$/g, '');
        const ext = (file.name && file.name.includes('.')) ? file.name.split('.').pop().toLowerCase() : 'bin';
        const base = (file.name || 'file').replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9가-힣_-]/g, '_').slice(0, 40);
        const fullPath = `${cleanFolder}/${Date.now()}_${base}.${ext}`;
        const storageRef = storage.ref().child(fullPath);

        const uploadTask = storageRef.put(file, {
          contentType: file.type || undefined,
          cacheControl: 'public, max-age=31536000'
        });

        let settled = false;
        // 25초 타임아웃 보호 (Storage 미활성 버킷에서 무한 대기 방지)
        const timer = setTimeout(() => {
          if (!settled) {
            settled = true;
            try { uploadTask.cancel(); } catch (e) {}
            resolve({
              ok: false,
              code: 'timeout',
              error: 'Firebase Storage 응답 시간이 초과되었습니다. 콘솔에서 Storage 활성화 및 보안 규칙을 확인하거나 외부 클라우드 URL을 입력해 주세요.'
            });
          }
        }, 25000);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            if (typeof onProgress === 'function' && snapshot.totalBytes > 0) {
              const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              onProgress(pct, snapshot.bytesTransferred, snapshot.totalBytes);
            }
          },
          (err) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            resolve({
              ok: false,
              code: (err && err.code) || 'storage-error',
              error: (err && err.message) || '클라우드 스토리지 업로드 권한이 없거나 버킷이 활성화되지 않았습니다.'
            });
          },
          async () => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            try {
              const downloadUrl = await uploadTask.snapshot.ref.getDownloadURL();
              resolve({
                ok: true,
                url: downloadUrl,
                path: fullPath,
                size: file.size,
                contentType: file.type || '',
                mode: 'firebase_storage'
              });
            } catch (urlErr) {
              resolve({
                ok: false,
                code: 'url-error',
                error: (urlErr && urlErr.message) || '업로드 URL 조회에 실패했습니다.'
              });
            }
          }
        );
      } catch (initErr) {
        resolve({
          ok: false,
          code: 'init-error',
          error: (initErr && initErr.message) || 'Firebase Storage 초기화 중 오류가 발생했습니다.'
        });
      }
    });
  }

  /**
   * Vimeo / YouTube / Cloudflare Stream / MP4 직접 링크를 광고 없는 VIP 임베드 형태로 자동 변환
   */
  function parseVideoEmbed(rawUrl) {
    const url = String(rawUrl || '').trim();
    if (!url) return { type: 'none', src: '' };

    // 1. Vimeo (추천: 광고·추천영상 없는 프리미엄 VIP 프레임)
    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/([a-zA-Z0-9]+))?/i);
    if (vimeoMatch) {
      const id = vimeoMatch[1];
      const hash = vimeoMatch[2] ? `&h=${vimeoMatch[2]}` : '';
      return {
        type: 'iframe',
        provider: 'Vimeo VIP',
        src: `https://player.vimeo.com/video/${id}?title=0&byline=0&portrait=0&dnt=1${hash}`
      };
    }

    // 2. YouTube (일부 공개 영상)
    const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
    if (ytMatch) {
      return {
        type: 'iframe',
        provider: 'YouTube',
        src: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`
      };
    }

    // 3. Cloudflare Stream
    if (/cloudflarestream\.com|videodelivery\.net/i.test(url)) {
      return { type: 'iframe', provider: 'Cloudflare Stream', src: url };
    }

    // 4. MP4 / WebM / MOV 직접 영상 파일
    if (/\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url) || url.startsWith('data:video/') || url.includes('firebasestorage.googleapis.com')) {
      return { type: 'video', provider: 'Direct HD Video', src: url };
    }

    // 기타 iframe URL
    if (/^https?:\/\//i.test(url)) {
      return { type: 'iframe', provider: 'External Player', src: url };
    }

    return { type: 'none', src: '' };
  }

  /**
   * VIP 가문 전용 프리미엄 온라인 전시관 기본 샘플 데이터 (체험 및 시연용)
   */
  const SAMPLE_HERITAGE_EXHIBITION = {
    id: 'heritage_demo_haesong',
    isDemo: true,
    familyName: '경주 김씨 해송(海松) 가문 평전',
    englishTitle: 'THE HAESONG HERITAGE ARCHIVE',
    protagonistName: '김정호 옹 · 이영자 여사',
    protagonistYears: '1938 — 현재 · 88년의 위대한 여정',
    motto: '뿌리 깊은 나무는 바람에 아니 묄세',
    mottoSub: '정직한 땀방울과 서로를 아끼는 화목함이 대를 이어 빛나는 가문의 뿌리가 된다.',
    heroImage: 'images/showcase-senior-memoir.jpg',
    heroQuote: '“세월은 흘러 얼굴에 주름이 깊어졌으나, 우리가 함께 걸어온 길과 자녀들에게 남길 마음만은 이 한 권의 기록과 전시관 속에 영원히 푸르게 남기를 바란다.”',
    accessPassword: '', // 샘플은 즉시 입장 가능 (실제 VIP 가문은 비밀번호 설정 가능)
    linkedMemoirId: '',
    bookTitle: '해송(海松), 세월을 품은 뿌리 — 경주 김씨 가문 평전',
    bookSpecs: '수제 가죽 양장본 10권 · 신국판 240페이지 하이엔드 조판 · 황동 각인 USB 원본 패키지 포함',
    usbSerialNo: 'YK-HP-2026-001 (64GB 황동 각인 원본 보관함 납품 완료)',
    publishedAt: '2026.11.22',
    curatorNote: '여백과 결 VIP 헤리티지 편찬위원회가 총 8회의 심층 구술 인터뷰, 60점의 옛 사진·훈장·유품 AI 정밀 복원, 구술 다큐멘터리 촬영과 전문 성우 오디오북 녹음을 거쳐 대를 이어 전해질 가문 전용 영구 전시관으로 헌정합니다.',
    // 4세대 인터랙티브 가계도
    familyTree: [
      {
        gen: 1,
        genLabel: '제1대 · 선조',
        name: '김병석 옹',
        relation: '선친 (1912 ~ 1994)',
        role: '가문의 기틀을 세운 한학자',
        photo: 'images/showcase-books-organizing.jpg',
        bio: '경북 경주에서 평생 서당과 농사를 일구며 “사람은 신의를 잃으면 모든 것을 잃는다”는 가르침을 몸소 실천하신 선친.',
        quote: '배움은 남을 이기려 함이 아니라, 스스로를 바로 세우기 위함이다.'
      },
      {
        gen: 1,
        genLabel: '제1대 · 선조',
        name: '박순례 여사',
        relation: '자친 (1916 ~ 2002)',
        role: '인자함으로 가정을 지킨 어머니',
        photo: 'images/care-beauty-mirror.jpg',
        bio: '전란의 시련 속에서도 육 남매를 반듯하게 키워내시며, 이웃과 밥 한 그릇 나누기를 아끼지 않으셨던 어진 어머니.',
        quote: '집안에 웃음소리가 마르지 않으면 어떤 풍파도 이겨낸다.'
      },
      {
        gen: 2,
        genLabel: '제2대 · 평전 주인공',
        name: '김정호 옹',
        relation: '가문 주인공 (1938 ~ )',
        role: '대한민국 산업화 1세대 토목 엔지니어 · 산업포장 수훈',
        photo: 'images/showcase-senior-memoir.jpg',
        bio: '1963년 첫 현장 기사로 출발해 40년간 전국의 교량과 고속도로 건설을 지휘했으며, 1996년 국가 산업 발전 공로로 산업포장을 수훈. 퇴임 후에도 자녀와 손주들에게 삶의 등대가 되어주고 계십니다.',
        quote: '내 손으로 놓은 다리 위를 수백만 사람이 건너듯, 우리 가문의 이름도 누군가에게 든든한 다리가 되거라.'
      },
      {
        gen: 2,
        genLabel: '제2대 · 평전 주인공',
        name: '이영자 여사',
        relation: '배우자 (1942 ~ )',
        role: '60년 해로의 동반자 · 가문의 따뜻한 버팀목',
        photo: 'images/showcase-senior-happy-book.jpg',
        bio: '남편의 해외 현장 파견 시절 홀로 삼 남매를 훌륭히 양육하고, 손수 담근 장맛과 정갈한 글씨로 가문의 품격을 지켜오신 어머니.',
        quote: '사랑은 거창한 말이 아니라 매일 아침 따뜻한 밥상을 함께 마주하는 정성이다.'
      },
      {
        gen: 3,
        genLabel: '제3대 · 자녀 세대',
        name: '김민수 · 최혜진',
        relation: '장남 내외 (1966 / 1969)',
        role: '건축 설계사 · 피아노 교육자',
        photo: 'images/living-funeral-family.jpg',
        bio: '아버지의 발자취를 이어 건축인의 길을 걸으며, 부모님의 칠순·팔순을 넘어 가문의 영원한 기록을 남기고자 본 평전 편찬을 발의했습니다.',
        quote: '아버지의 단단한 등과 어머니의 고운 손이 오늘의 우리를 만들었습니다.'
      },
      {
        gen: 3,
        genLabel: '제3대 · 자녀 세대',
        name: '김지영 · 정태우',
        relation: '장녀 내외 (1969 / 1968)',
        role: '한의사 · 대학 교수',
        photo: 'images/living-funeral-party-2.jpg',
        bio: '부모님의 정직한 생활 철학을 가슴에 새기고, 명절마다 온 가족의 추억을 사진과 글로 엮어온 가문의 기록자입니다.',
        quote: '엄마 아빠의 목소리가 책 속 QR로 영원히 남게 되어 눈물이 납니다.'
      },
      {
        gen: 3,
        genLabel: '제3대 · 자녀 세대',
        name: '김도현 · 윤서연',
        relation: '차남 내외 (1973 / 1975)',
        role: 'IT 기업 임원 · 큐레이터',
        photo: 'images/living-funeral-party-1.jpg',
        bio: '가문의 옛 사진과 훈장을 디지털 영구 아카이브로 보존하여 다음 세대까지 이어주는 다리 역할을 맡았습니다.',
        quote: '할아버지 할머니의 이야기가 손주 세대의 가장 멋진 교과서가 될 것입니다.'
      },
      {
        gen: 4,
        genLabel: '제4대 · 손주 세대',
        name: '김서준 · 김하윤 · 정유진 · 김지호',
        relation: '손주 4남매 (1998 ~ 2008)',
        role: '가문의 미래를 열어갈 다음 세대',
        photo: 'images/living-funeral-party-3.jpg',
        bio: '할아버지와 할머니의 젊은 시절 흑백 사진과 육성 이야기를 들으며 가문의 뿌리와 자긍심을 이어가고 있습니다.',
        quote: '할아버지, 할머니! 오래오래 건강하게 저희 곁에 계셔 주세요. 사랑합니다!'
      }
    ],
    // 옛 사진 & 훈장·유품 복원 도록 (복원 전↔후 비교 슬라이더 지원)
    gallery: [
      {
        id: 'item_1',
        category: 'photo',
        categoryLabel: '옛 사진 AI 복원',
        year: '1965년 봄',
        title: '신혼 첫 봄, 남산 아래에서 찍은 빛바랜 흑백 사진',
        beforeUrl: 'images/showcase-senior-memoir.jpg',
        afterUrl: 'images/showcase-senior-memoir.jpg',
        simulateAgedBefore: true,
        restoreNote: '구겨진 주름 14곳 제거 · 600 DPI 스캔 · AI 얼굴 디테일 복원 & 자연 색채 복원',
        story: '결혼식 다음 해 봄, 월급봉투를 아껴 처음 사진관 앞에서 남긴 부부의 기록입니다. 찢어지고 변색되었던 원본을 AI 정밀 복원과 수작업 리터칭으로 그날의 따스한 빛깔까지 되살렸습니다.'
      },
      {
        id: 'item_2',
        category: 'medal',
        categoryLabel: '훈장 · 상장',
        year: '1996년 10월',
        title: '대한민국 산업포장 수훈장 및 증서 원본',
        beforeUrl: 'images/showcase-books-organizing.jpg',
        afterUrl: 'images/showcase-books-organizing.jpg',
        simulateAgedBefore: true,
        restoreNote: '미니 LED 포토박스 무반사 촬영 · 황동 빛바램 색상 보정 · 아카이브 도록 등록',
        story: '40년 현장을 지키며 땀 흘린 세월을 국가로부터 인정받은 영예로운 산업포장입니다. 훈장의 미세한 각인과 붉은 리본의 결까지 초고해상도로 영구 기록했습니다.'
      },
      {
        id: 'item_3',
        category: 'photo',
        categoryLabel: '옛 사진 AI 복원',
        year: '1978년 여름',
        title: '해외 건설 현장 파견 시절, 가족에게 보낸 편지와 사진',
        beforeUrl: 'images/showcase-senior-writing.jpg',
        afterUrl: 'images/showcase-senior-writing.jpg',
        simulateAgedBefore: true,
        restoreNote: '빛바랜 인화지 얼룩 제거 · 4배 초고해상도 업스케일링 · 화보 전면 배치',
        story: '열사의 땅에서 가족을 그리워하며 밤마다 쓰던 항공우편 편지와 함께 동봉했던 사진입니다. 희미해진 배경과 인물의 눈빛을 원본 그대로의 인상으로 정밀 복원했습니다.'
      },
      {
        id: 'item_4',
        category: 'keepsake',
        categoryLabel: '가문 유품 · 애장품',
        year: '1971년 취득',
        title: '40년 세월이 묻어난 황동 제도기(製圖器)와 수첩',
        beforeUrl: 'images/showcase-senior-happy-book.jpg',
        afterUrl: 'images/showcase-senior-happy-book.jpg',
        simulateAgedBefore: true,
        restoreNote: '입체 유품 3면 촬영 · 배경 클리닝 · 큐레이터 소장 사연 아카이빙',
        story: '컴퓨터 설계 프로그램이 없던 시절, 밤을 새워 교량 도면을 그려내던 손때 묻은 제도기입니다. 장남에게 가보로 물려주기로 약속한 가문의 상징입니다.'
      },
      {
        id: 'item_5',
        category: 'photo',
        categoryLabel: '옛 사진 AI 복원',
        year: '1989년 가을',
        title: '삼 남매 대학 졸업식, 온 가족이 한자리에 모인 날',
        beforeUrl: 'images/living-funeral-family.jpg',
        afterUrl: 'images/living-funeral-family.jpg',
        simulateAgedBefore: true,
        restoreNote: '저조도 노이즈 제거 · 5인 가족 표정 선명화 · 신국판 양면 화보 수록',
        story: '고생 끝에 세 자녀가 모두 제 몫을 해내는 어른으로 성장한 감격의 순간. 흐릿하게 번져 있던 가족의 환한 미소를 선명하게 되살려냈습니다.'
      },
      {
        id: 'item_6',
        category: 'keepsake',
        categoryLabel: '가문 유품 · 애장품',
        year: '2026년 헌정',
        title: '어머니가 손수 쓰신 가훈(家訓) 붓글씨와 생전 헌정 파티',
        beforeUrl: 'images/living-funeral-party-4.jpg',
        afterUrl: 'images/living-funeral-party-4.jpg',
        simulateAgedBefore: true,
        restoreNote: '고해상도 스캔 · 한지 질감 보존 · 온라인 전시관 메인 족자 제작',
        story: '평전 출판기념회 자리에서 온 가족이 함께 낭독한 가훈과 축배의 순간을 영원한 디지털 도록으로 갈무리했습니다.'
      }
    ],
    // 구술 다큐멘터리 영상 클립
    documentary: {
      title: '해송(海松)의 88년 — 구술 미니 다큐멘터리 (하이라이트 6분 20초)',
      subtitle: 'VIP 심층 구술 8회 중 핵심 인터뷰 장면과 AI로 되살린 1960~80년대 옛 사진 모션 컷을 한 편의 영화처럼 엮었습니다.',
      videoUrl: '', // 실제 VIP 등록 시 Vimeo / YouTube / Cloudflare Stream / MP4 URL 입력
      posterImage: 'images/living-funeral-party-1.jpg',
      duration: '06:20',
      chapters: [
        { time: '00:00', label: '오프닝 · 경주 고향 들녘과 선친의 가르침' },
        { time: '01:35', label: '청춘의 현장 · 1963년 첫 다리를 놓던 날' },
        { time: '03:20', label: 'AI 모션 복원 · 1965년 신혼 사진이 미소 짓는 순간' },
        { time: '04:50', label: '에필로그 · 사랑하는 자녀와 손주들에게 남기는 육성 편지' }
      ]
    },
    // 전문 성우 & 어르신 육성 하이브리드 오디오북
    audiobookTracks: [
      {
        id: 'tr_1',
        badge: '🎙️ 어르신 실제 육성',
        badgeType: 'elder',
        title: '프롤로그 · 내 삶의 가장 눈부신 계절을 기억하며',
        narrator: '김정호 옹 직접 낭독 (Adobe Podcast 스튜디오 마스터링)',
        duration: '02:18',
        audioUrl: '',
        script: '사랑하는 내 아이들과 손주들아. 할아버지가 여든여덟 해를 살아오면서 깨달은 가장 귀한 진실은, 거창한 성공보다 오늘 곁에 있는 가족의 손을 따뜻하게 잡아주는 마음이란다. 이 목소리가 책 속의 작은 네모 그림을 통해 너희가 힘들 때마다 작은 위로가 되어주길 바란다.'
      },
      {
        id: 'tr_2',
        badge: '🎧 전문 성우 오디오북',
        badgeType: 'voiceactor',
        title: '제1장 · 1963년 봄, 도면 위에 새긴 청춘의 약속',
        narrator: '전속 전문 성우 낭독 (스튜디오 완독본)',
        duration: '14:40',
        audioUrl: '',
        script: '제1장, 도면 위에 새긴 청춘의 약속. 스물다섯 살 청년 김정호가 처음 손에 쥔 것은 낡은 황동 제도기와 빳빳한 켄트지 한 장이었다. 강바람이 매섭게 불던 그해 봄, 그는 다리 하나가 사람과 사람의 마음을 잇는다는 믿음으로 첫 선을 그어 내려갔다.'
      },
      {
        id: 'tr_3',
        badge: '🎧 전문 성우 오디오북',
        badgeType: 'voiceactor',
        title: '제4장 · 60년 해로의 등불, 아내 이영자에게 바치는 헌사',
        narrator: '전속 전문 성우 낭독 (스튜디오 완독본)',
        duration: '18:05',
        audioUrl: '',
        script: '제4장, 60년 해로의 등불. 먼 이국땅 현장에서 돌아오던 새벽마다 골목 끝에서 변함없이 불을 켜고 기다려주던 사람. 당신의 묵묵한 사랑이 없었더라면 해송 가문의 오늘은 결코 존재하지 않았을 것이다.'
      },
      {
        id: 'tr_4',
        badge: '🎙️ 어르신 실제 육성',
        badgeType: 'elder',
        title: '에필로그 · 우리 손주들에게 남기는 가훈과 축복',
        narrator: '김정호 옹 · 이영자 여사 함께 낭독',
        duration: '03:12',
        audioUrl: '',
        script: '서준아, 하윤아, 유진아, 지호야. 살아가다 가끔 길이 막막할 때면 할아버지 할머니가 걸어온 이 기록을 펼쳐 보렴. 뿌리 깊은 나무는 어떤 바람에도 쓰러지지 않는단다. 늘 정직하고 서로를 깊이 사랑하며 살아가거라.'
      }
    ],
    // 초기 후손 헌정 방명록
    guestbook: [
      {
        id: 'gb_1',
        author: '김민수',
        relation: '장남',
        date: '2026.11.20',
        message: '아버지, 어머니의 88년 세월이 이렇게 품격 있는 책과 온라인 전시관으로 완성되어 가슴이 벅찹니다. 복원된 1965년 신혼 사진을 보고 온 가족이 한참 동안 눈시울을 붉혔습니다. 사랑하고 존경합니다.'
      },
      {
        id: 'gb_2',
        author: '김지영',
        relation: '장녀',
        date: '2026.11.21',
        message: '양장본 책 속 QR 코드를 스마트폰으로 비추니 아버지 목소리가 바로 흘러나오는 순간 정말 큰 감동을 받았습니다. 대대손손 가문의 보물로 간직하겠습니다.'
      },
      {
        id: 'gb_3',
        author: '김하윤',
        relation: '손녀',
        date: '2026.11.22',
        message: '할아버지께서 젊은 시절 정말 멋지셨네요! 다큐멘터리 영상과 성우 오디오북까지 덕분에 할아버지 할머니 이야기를 친구들에게도 자랑하고 있어요. 오래오래 건강하세요!'
      }
    ]
  };

  /**
   * 관리자용 상품별 제작 원가 · 외주비 · 마진 시뮬레이터 기본값 (단위: 만 원)
   */
  const DEFAULT_COST_PRESETS = {
    masterpiece: {
      name: '인생 마스터피스 (LIFE MASTERPIECE)',
      badge: '160P 올컬러 양장본 5권 · 옛 사진 30장 AI 복원 · 육성 오디오북 QR · 플립북',
      sellPrice: 380,
      items: [
        { key: 'coach', label: '전담 코치 심층 구술 4회 (6시간 채록 + 교통비)', cost: 48, vendor: '내부 전담 코치' },
        { key: 'writer', label: '전문 작가 5단계 심층 윤문 · 교정교열 (160P)', cost: 55, vendor: '전속/프리랜서 작가' },
        { key: 'photo', label: '옛 사진 30장 스캔 · AI 정밀 복원 (Photoshop/Remini)', cost: 18, vendor: '내부 AI 툴 + 리터칭' },
        { key: 'design', label: '신국판 160P 화보급 편집 조판 (InDesign) & 표지 디자인', cost: 45, vendor: '크몽/제휴 북디자이너' },
        { key: 'print', label: '최고급 올컬러 양장본 5권 인쇄·제본 (소량 POD/옵셋)', cost: 28, vendor: '파주/충무로 제휴 인쇄소' },
        { key: 'audioQr', label: '육성 오디오 보정(Adobe Podcast) + 클라우드 호스팅 + SVG QR', cost: 4, vendor: '자체 사이트(yebaekarchive.kr)' },
        { key: 'usb', label: '영구 보존 각인 고급 USB (64GB) + 선물 패키지 배송', cost: 7, vendor: '판촉 각인 업체' }
      ]
    },
    heritage: {
      name: '명문 가문 평전 (HERITAGE PRESTIGE)',
      badge: '240P 수제 가죽양장 10권 · 60장 무제한 복원 · 다큐 영상 · 전문 성우 오디오북 · VIP 전시관',
      sellPrice: 1200,
      items: [
        { key: 'coach', label: 'VIP 심층 구술 8회 (가계도·가문사 집중 편찬)', cost: 110, vendor: '수석 코치 + 보조 기록자' },
        { key: 'writer', label: '수석 작가진 240P 가문 평전 집필·감수·자녀 서문', cost: 160, vendor: '전속 수석 작가' },
        { key: 'photo', label: '옛 사진 + 훈장·유품 60점 포토박스 촬영 & AI 무제한 복원', cost: 45, vendor: '내부 + 전문 리터처' },
        { key: 'design', label: '240P 하이엔드 조판 · 가계도 인포그래픽 · 가죽 금박 디자인', cost: 95, vendor: '하이엔드 북디자이너' },
        { key: 'print', label: '수제 가죽 양장본 10권 + 금박 케이스 제작', cost: 120, vendor: '수제 제본 공방 제휴' },
        { key: 'docu', label: '구술 다큐멘터리 영상 클립 촬영·편집 (5~7분 + AI 사진 모션)', cost: 120, vendor: '지역 1인 다큐 PD 외주' },
        { key: 'voice', label: '전문 성우 오디오북 스튜디오 녹음 (핵심 챕터 + 육성 믹싱)', cost: 85, vendor: '올보이스/크몽 전속 성우' },
        { key: 'exhibition', label: '가문 전용 영구 온라인 전시관(heritage.html) + Vimeo/Storage', cost: 10, vendor: '자체 플랫폼 (유지비 최소화)' },
        { key: 'partyUsb', label: '출판기념회 기획 지원 + 황동 각인 USB 10세트 오프라인 배포', cost: 55, vendor: '행사/패키지 협력사' }
      ]
    }
  };

  global.YebaekMedia = {
    BRAND_ORIGIN,
    getPrintUrl,
    getLiveShareUrl,
    generateQrSvgString,
    renderQrIntoContainer,
    downloadPrintQrSvg,
    uploadFileToFirebaseStorage,
    parseVideoEmbed,
    SAMPLE_HERITAGE_EXHIBITION,
    DEFAULT_COST_PRESETS
  };
})(window);
