/**
 * 여백과 결, 리셋 아카이브 (https://yebaekarchive.kr)
 * 관리자 콘솔 확장 모듈:
 * 1) VIP 가문 전용 프리미엄 온라인 전시관(heritage.html) 구축 · 발행 · Firestore 연동
 * 2) 모바일 웹북 육성 오디오 Firebase Storage 클라우드 업로드 & 300 DPI 인쇄용 벡터(SVG) QR 다운로드
 * 3) 상품별 제작 원가 · 외주비 · 마진 시뮬레이터 & 실무 워크플로우 체크리스트
 */
(function (global) {
  'use strict';

  const HERITAGE_STORAGE_KEY = 'yebaek_heritage_exhibitions';
  const COST_STORAGE_KEY = 'yebaek_cost_simulator_v1';

  let currentEditingHeritage = null;
  let currentCostState = null;

  function esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getDb() {
    if (global.window && global.window.db) return global.window.db;
    if (typeof global.firebase !== 'undefined' && global.firebase.apps && global.firebase.apps.length) {
      try { return global.firebase.firestore(); } catch (e) {}
    }
    return null;
  }

  // =========================================================================
  // 1. 📱 개인 모바일 웹북: 클라우드 육성 오디오 업로드 & 300 DPI 벡터 QR 다운로드
  // =========================================================================
  async function handleWbAudioFileChange(e) {
    const file = e && e.target && e.target.files && e.target.files[0];
    if (!file) return;

    const statusEl = document.getElementById('wbAudioUploadStatus');
    const urlInput = document.getElementById('wbAudioCloudUrl');
    const titleInput = document.getElementById('wbAudioTitle');

    if (titleInput && !titleInput.value.trim()) {
      const owner = (document.getElementById('wbOwnerName') && document.getElementById('wbOwnerName').value.trim()) || '어르신';
      titleInput.value = `🎙️ ${owner} 어르신 육성 오디오북`;
    }

    if (statusEl) {
      statusEl.style.display = 'block';
      statusEl.style.color = '#8c6610';
      statusEl.textContent = `☁️ [${file.name}] Firebase Storage로 영구 업로드 중... (0%)`;
    }

    if (global.YebaekMedia && typeof global.YebaekMedia.uploadFileToFirebaseStorage === 'function') {
      const res = await global.YebaekMedia.uploadFileToFirebaseStorage(
        file,
        'memoir_audio',
        (pct) => {
          if (statusEl) statusEl.textContent = `☁️ [${file.name}] Firebase Storage로 영구 업로드 중... (${pct}%)`;
        }
      );

      if (res.ok && res.url) {
        if (urlInput) urlInput.value = res.url;
        if (statusEl) {
          statusEl.style.color = '#15803d';
          statusEl.textContent = `✅ 클라우드 영구 저장 완료! 모든 가족 스마트폰에서 책 속 QR 스캔 시 즉시 재생됩니다.`;
        }
        return;
      }

      if (statusEl) {
        statusEl.style.color = '#b45309';
        statusEl.textContent = `⚠️ 클라우드 자동 업로드 실패 (${res.code || '권한 확인 필요'}): Firebase Console에서 Storage 규칙을 확인하거나, Cloudflare R2 / Firebase Storage MP3 주소를 아래 입력란에 직접 붙여넣어 주세요.`;
      }
    }
  }

  function downloadPersonalWebbookQrSvg(docId, ownerName) {
    const url = global.YebaekMedia
      ? global.YebaekMedia.getPrintUrl(`my-room.html?memoir=${encodeURIComponent(docId)}`)
      : `https://yebaekarchive.kr/my-room.html?memoir=${encodeURIComponent(docId)}`;
    const fileName = `${ownerName || '어르신'}_자서전웹북_${docId}`;
    if (global.YebaekMedia && typeof global.YebaekMedia.downloadPrintQrSvg === 'function') {
      global.YebaekMedia.downloadPrintQrSvg(url, fileName);
    }
  }

  // =========================================================================
  // 2. 🏛️ VIP 가문 전용 프리미엄 온라인 전시관 관리 (Firestore + 로컬)
  // =========================================================================
  function getLocalHeritageList() {
    try {
      const raw = localStorage.getItem(HERITAGE_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function saveLocalHeritageList(list) {
    try {
      localStorage.setItem(HERITAGE_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('[Heritage Local Save Warning]', e);
    }
  }

  async function syncHeritageExhibitionsFromCloud(showAlert) {
    const db = getDb();
    if (!db) {
      renderHeritageExhibitionsTable();
      return;
    }
    try {
      const snap = await db.collection('heritage_exhibitions').get();
      const cloudList = [];
      snap.forEach((doc) => {
        const d = doc.data();
        if (d) cloudList.push(Object.assign({ id: doc.id }, d));
      });
      if (cloudList.length) {
        cloudList.sort((a, b) => (b.updatedAtMs || 0) - (a.updatedAtMs || 0));
        saveLocalHeritageList(cloudList);
      }
      renderHeritageExhibitionsTable();
      if (showAlert) {
        alert(`☁️ 클라우드에서 VIP 가문 전시관 ${cloudList.length}건을 동기화했습니다.`);
      }
    } catch (err) {
      console.warn('[Heritage Cloud Sync]', err);
      renderHeritageExhibitionsTable();
    }
  }

  function getHeritagePublicUrl(id) {
    const path = id && id !== 'heritage_demo_haesong'
      ? `heritage.html?id=${encodeURIComponent(id)}`
      : 'heritage.html?demo=1';
    return global.YebaekMedia ? global.YebaekMedia.getPrintUrl(path) : `https://yebaekarchive.kr/${path}`;
  }

  function renderHeritageExhibitionsTable() {
    const tbody = document.getElementById('heritageExhibitionsTableBody');
    if (!tbody) return;

    const list = getLocalHeritageList();
    const demoItem = global.YebaekMedia && global.YebaekMedia.SAMPLE_HERITAGE_EXHIBITION;
    const rows = [];

    // 1. 실제 등록된 VIP 가문 전시관들
    list.forEach((item) => {
      const liveUrl = getHeritagePublicUrl(item.id);
      const openHref = `heritage.html?id=${encodeURIComponent(item.id)}`;
      const galleryCnt = (item.gallery || []).length;
      const trackCnt = (item.audiobookTracks || []).length;
      const treeCnt = (item.familyTree || []).length;
      const hasDocu = !!(item.documentary && item.documentary.videoUrl);
      const lockBadge = item.accessPassword
        ? '<span style="background:#fef2f2;color:#b91c1c;padding:2px 8px;border-radius:999px;font-size:0.72rem;font-weight:800;">🔒 가족 비밀번호</span>'
        : '<span style="background:#ecfdf5;color:#047857;padding:2px 8px;border-radius:999px;font-size:0.72rem;font-weight:800;">🌐 링크 전용 공개</span>';

      rows.push(`
        <tr>
          <td>
            <div style="font-weight:850; color:#14281f; font-size:0.93rem;">🏛️ ${esc(item.familyName || 'VIP 가문 전시관')}</div>
            <div style="font-size:0.78rem; color:#64748b; margin-top:2px;">${esc(item.protagonistName || '')}</div>
            <div style="font-size:0.71rem; color:#94a3b8; font-family:monospace; margin-top:2px;">ID: ${esc(item.id)}</div>
          </td>
          <td>
            <div style="font-family:'Noto Serif KR',serif; font-weight:700; color:#1e4d35; font-size:0.88rem;">“${esc(item.motto || '')}”</div>
            <div style="font-size:0.76rem; color:#64748b; margin-top:4px;">
              🌳 가계도 ${treeCnt}명 · 🎞️ 도록 ${galleryCnt}점 · 🎧 오디오 ${trackCnt}트랙 · ${hasDocu ? '🎬 다큐 연결됨' : '🎬 다큐 미등록'}
            </div>
          </td>
          <td style="text-align:center;">${lockBadge}</td>
          <td style="font-size:0.8rem; color:#64748b;">${esc(item.publishedAt || '-')}</td>
          <td style="text-align:center;">
            <div style="display:inline-flex; gap:5px; flex-wrap:wrap; justify-content:center;">
              <a href="${openHref}" target="_blank" class="btn-action-sm" style="background:#14281f; color:#f6e7c1; text-decoration:none; font-weight:800;">🏛️ 열기</a>
              <button type="button" class="btn-action-sm" onclick="copyHeritageExhibitionLink('${esc(item.id)}')" style="background:#fef7e6; color:#8c6610; border:1px solid #e6cf8b; font-weight:800;">🔗 URL</button>
              <button type="button" class="btn-action-sm" onclick="downloadHeritageQrSvg('${esc(item.id)}', '${esc(item.familyName)}')" style="background:#eef7f1; color:#1e4d35; border:1px solid #b8d8c2; font-weight:800;" title="300 DPI 책 인쇄용 벡터(.svg) QR 다운로드">📷 SVG QR</button>
              <button type="button" class="btn-action-sm" onclick="openHeritageExhibitionModal('${esc(item.id)}')" style="background:var(--accent-light); color:var(--accent); font-weight:800;">✏️ 편집</button>
              <button type="button" class="btn-action-sm del" onclick="deleteHeritageExhibition('${esc(item.id)}')">🗑️</button>
            </div>
          </td>
        </tr>
      `);
    });

    // 2. 공식 샘플 체험 전시관 안내 행
    if (demoItem) {
      rows.push(`
        <tr style="background: rgba(194, 155, 56, 0.06);">
          <td>
            <span style="display:inline-block; background:#c29b38; color:#fff; font-size:0.68rem; font-weight:850; padding:2px 7px; border-radius:999px; margin-bottom:4px;">공식 샘플</span>
            <div style="font-weight:850; color:#14281f; font-size:0.9rem;">🏛️ ${esc(demoItem.familyName)}</div>
            <div style="font-size:0.76rem; color:#64748b;">${esc(demoItem.protagonistName)}</div>
          </td>
          <td>
            <div style="font-family:'Noto Serif KR',serif; font-weight:700; color:#1e4d35; font-size:0.86rem;">“${esc(demoItem.motto)}”</div>
            <div style="font-size:0.75rem; color:#64748b; margin-top:3px;">고객 상담 시 VIP 온라인 전시관 시연용으로 바로 활용하세요.</div>
          </td>
          <td style="text-align:center;"><span style="background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:999px;font-size:0.72rem;font-weight:800;">✨ 체험 샘플</span></td>
          <td style="font-size:0.8rem; color:#64748b;">기본 탑재</td>
          <td style="text-align:center;">
            <div style="display:inline-flex; gap:5px; flex-wrap:wrap; justify-content:center;">
              <a href="heritage.html?demo=1" target="_blank" class="btn-action-sm" style="background:#14281f; color:#f6e7c1; text-decoration:none; font-weight:800;">🏛️ 체험 열기</a>
              <button type="button" class="btn-action-sm" onclick="copyHeritageExhibitionLink('heritage_demo_haesong')" style="background:#fef7e6; color:#8c6610; border:1px solid #e6cf8b; font-weight:800;">🔗 URL</button>
              <button type="button" class="btn-action-sm" onclick="downloadHeritageQrSvg('heritage_demo_haesong', '해송가문_샘플')" style="background:#eef7f1; color:#1e4d35; border:1px solid #b8d8c2; font-weight:800;">📷 SVG QR</button>
            </div>
          </td>
        </tr>
      `);
    }

    tbody.innerHTML = rows.join('');
  }

  function copyHeritageExhibitionLink(id) {
    const url = getHeritagePublicUrl(id);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => alert(`🔗 VIP 가문 전용 온라인 전시관 주소가 복사되었습니다!\n\n${url}`))
        .catch(() => prompt('아래 전시관 주소를 복사해 주세요:', url));
    } else {
      prompt('아래 전시관 주소를 복사해 주세요:', url);
    }
  }

  function downloadHeritageQrSvg(id, familyName) {
    const url = getHeritagePublicUrl(id);
    if (global.YebaekMedia && typeof global.YebaekMedia.downloadPrintQrSvg === 'function') {
      global.YebaekMedia.downloadPrintQrSvg(url, `${familyName || 'VIP가문전시관'}_${id}`);
    }
  }

  // 모달 열기 (신규 또는 수정)
  function openHeritageExhibitionModal(editId) {
    const modal = document.getElementById('heritageExhibitionModal');
    if (!modal) return;

    const list = getLocalHeritageList();
    const existing = editId ? list.find(x => x.id === editId) : null;

    if (existing) {
      currentEditingHeritage = JSON.parse(JSON.stringify(existing));
      document.getElementById('heritageModalTitle').textContent = `🏛️ [${existing.familyName}] VIP 가문 전시관 편집`;
    } else {
      const sample = global.YebaekMedia.SAMPLE_HERITAGE_EXHIBITION;
      currentEditingHeritage = {
        id: 'vip_' + Date.now(),
        familyName: '',
        englishTitle: 'HERITAGE PRESTIGE ARCHIVE',
        protagonistName: '',
        protagonistYears: '',
        motto: '뿌리 깊은 나무는 바람에 아니 묄세',
        mottoSub: '',
        heroImage: 'images/showcase-senior-memoir.jpg',
        heroQuote: '',
        accessPassword: '',
        linkedMemoirId: '',
        bookTitle: '',
        bookSpecs: '수제 가죽 양장본 10권 · 신국판 240페이지 하이엔드 조판 · 황동 각인 USB 원본 패키지 포함',
        usbSerialNo: `YK-HP-${new Date().getFullYear()}-${String(list.length + 1).padStart(3, '0')}`,
        curatorNote: sample.curatorNote,
        familyTree: [
          { gen: 1, genLabel: '제1대 · 선조', name: '', relation: '선친', role: '', photo: 'images/showcase-books-organizing.jpg', bio: '', quote: '' },
          { gen: 2, genLabel: '제2대 · 평전 주인공', name: '', relation: '가문 주인공', role: '', photo: 'images/showcase-senior-memoir.jpg', bio: '', quote: '' },
          { gen: 3, genLabel: '제3대 · 자녀 세대', name: '', relation: '장남 내외', role: '', photo: 'images/living-funeral-family.jpg', bio: '', quote: '' }
        ],
        gallery: [
          { id: 'item_1', category: 'photo', categoryLabel: '옛 사진 AI 복원', year: '1970년대', title: '', beforeUrl: '', afterUrl: 'images/showcase-senior-memoir.jpg', simulateAgedBefore: true, restoreNote: '600 DPI 스캔 · AI 정밀 복원', story: '' }
        ],
        documentary: {
          title: 'VIP 구술 미니 다큐멘터리 (하이라이트)',
          subtitle: '어르신의 심층 구술 인터뷰와 AI 복원 옛 사진 모션 컷을 엮은 헌정 영상입니다.',
          videoUrl: '',
          posterImage: 'images/living-funeral-party-1.jpg',
          duration: '05:30',
          chapters: [
            { time: '00:00', label: '오프닝 · 고향과 어린 시절' },
            { time: '02:00', label: '인생의 전환점과 가족 이야기' },
            { time: '04:00', label: '에필로그 · 후손들에게 남기는 말씀' }
          ]
        },
        audiobookTracks: [
          { id: 'tr_1', badge: '🎙️ 어르신 실제 육성', badgeType: 'elder', title: '프롤로그 · 어르신 직접 낭독', narrator: '어르신 육성 (Adobe Podcast 마스터링)', duration: '02:00', audioUrl: '', script: '' },
          { id: 'tr_2', badge: '🎧 전문 성우 오디오북', badgeType: 'voiceactor', title: '제1장 · 전문 성우 낭독본', narrator: '전속 전문 성우 낭독', duration: '15:00', audioUrl: '', script: '' }
        ],
        guestbook: []
      };
      document.getElementById('heritageModalTitle').textContent = '🏛️ 새 VIP 가문 전용 온라인 전시관 구축 · 발행';
    }

    // 폼 값 채우기
    document.getElementById('hmId').value = currentEditingHeritage.id;
    document.getElementById('hmFamilyName').value = currentEditingHeritage.familyName || '';
    document.getElementById('hmEnglishTitle').value = currentEditingHeritage.englishTitle || '';
    document.getElementById('hmProtagonistName').value = currentEditingHeritage.protagonistName || '';
    document.getElementById('hmProtagonistYears').value = currentEditingHeritage.protagonistYears || '';
    document.getElementById('hmMotto').value = currentEditingHeritage.motto || '';
    document.getElementById('hmMottoSub').value = currentEditingHeritage.mottoSub || '';
    document.getElementById('hmHeroQuote').value = currentEditingHeritage.heroQuote || '';
    document.getElementById('hmHeroImage').value = currentEditingHeritage.heroImage || '';
    document.getElementById('hmAccessPassword').value = currentEditingHeritage.accessPassword || '';
    document.getElementById('hmLinkedMemoirId').value = currentEditingHeritage.linkedMemoirId || '';
    document.getElementById('hmBookTitle').value = currentEditingHeritage.bookTitle || '';
    document.getElementById('hmUsbSerial').value = currentEditingHeritage.usbSerialNo || '';

    const docu = currentEditingHeritage.documentary || {};
    document.getElementById('hmDocuTitle').value = docu.title || '';
    document.getElementById('hmDocuUrl').value = docu.videoUrl || '';
    document.getElementById('hmDocuDuration').value = docu.duration || '05:30';

    renderHmTracksEditor();
    renderHmGalleryEditor();
    renderHmTreeEditor();

    modal.style.display = 'flex';
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeHeritageExhibitionModal() {
    const modal = document.getElementById('heritageExhibitionModal');
    if (modal) {
      modal.style.display = 'none';
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  // 모달 내 오디오북 트랙 에디터
  function renderHmTracksEditor() {
    const wrap = document.getElementById('hmTracksEditor');
    if (!wrap || !currentEditingHeritage) return;
    const tracks = currentEditingHeritage.audiobookTracks || [];
    wrap.innerHTML = tracks.map((t, idx) => `
      <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:10px; padding:12px; margin-bottom:8px;">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:8px;">
          <strong style="font-size:0.82rem; color:#1e4d35;">🎧 트랙 #${idx + 1}</strong>
          <button type="button" onclick="removeHmTrack(${idx})" style="border:1px solid #ef4444; background:#fff; color:#ef4444; border-radius:6px; padding:2px 8px; font-size:0.74rem; cursor:pointer;">삭제</button>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1.6fr 0.7fr; gap:8px; margin-bottom:8px;">
          <select class="setting-input" onchange="updateHmTrack(${idx}, 'badgeType', this.value)" style="font-size:0.8rem;">
            <option value="elder" ${t.badgeType === 'elder' ? 'selected' : ''}>🎙️ 어르신 육성</option>
            <option value="voiceactor" ${t.badgeType !== 'elder' ? 'selected' : ''}>🎧 전문 성우</option>
          </select>
          <input type="text" class="setting-input" value="${esc(t.title)}" oninput="updateHmTrack(${idx}, 'title', this.value)" placeholder="트랙 제목 (예: 프롤로그 · 어르신 육성)" style="font-size:0.8rem;" />
          <input type="text" class="setting-input" value="${esc(t.duration)}" oninput="updateHmTrack(${idx}, 'duration', this.value)" placeholder="02:30" style="font-size:0.8rem;" />
        </div>
        <div style="display:grid; grid-template-columns:1fr auto; gap:8px; align-items:center; margin-bottom:6px;">
          <input type="url" id="hmTrackUrl_${idx}" class="setting-input" value="${esc(t.audioUrl)}" oninput="updateHmTrack(${idx}, 'audioUrl', this.value)" placeholder="☁️ 클라우드 MP3 URL (오른쪽 버튼으로 업로드 또는 직접 붙여넣기)" style="font-size:0.78rem;" />
          <label style="background:#1e4d35; color:#f6e7c1; padding:7px 11px; border-radius:8px; font-size:0.75rem; font-weight:800; cursor:pointer; white-space:nowrap;">
            📤 MP3 업로드
            <input type="file" accept="audio/*" style="display:none;" onchange="uploadHmTrackAudio(event, ${idx})" />
          </label>
        </div>
        <input type="text" class="setting-input" value="${esc(t.script)}" oninput="updateHmTrack(${idx}, 'script', this.value)" placeholder="자막 / 대표 낭독 구절 (선택)" style="font-size:0.78rem;" />
      </div>
    `).join('');
  }

  function addHmTrack() {
    if (!currentEditingHeritage) return;
    currentEditingHeritage.audiobookTracks.push({
      id: 'tr_' + Date.now(),
      badge: '🎧 전문 성우 오디오북',
      badgeType: 'voiceactor',
      title: '',
      narrator: '전문 성우 낭독',
      duration: '05:00',
      audioUrl: '',
      script: ''
    });
    renderHmTracksEditor();
  }

  function removeHmTrack(idx) {
    currentEditingHeritage.audiobookTracks.splice(idx, 1);
    renderHmTracksEditor();
  }

  function updateHmTrack(idx, key, val) {
    const t = currentEditingHeritage.audiobookTracks[idx];
    if (!t) return;
    t[key] = val;
    if (key === 'badgeType') {
      t.badge = val === 'elder' ? '🎙️ 어르신 실제 육성' : '🎧 전문 성우 오디오북';
      t.narrator = val === 'elder' ? '어르신 직접 낭독 (Adobe Podcast 마스터링)' : '전속 전문 성우 낭독';
    }
  }

  async function uploadHmTrackAudio(e, idx) {
    const file = e.target.files[0];
    if (!file) return;
    const inputEl = document.getElementById(`hmTrackUrl_${idx}`);
    if (inputEl) inputEl.value = '☁️ 클라우드 업로드 중...';
    const res = await global.YebaekMedia.uploadFileToFirebaseStorage(file, 'heritage_audio');
    if (res.ok && res.url) {
      updateHmTrack(idx, 'audioUrl', res.url);
      if (inputEl) inputEl.value = res.url;
      alert(`✅ [${file.name}] 오디오북 트랙이 Firebase Storage에 영구 저장되었습니다!`);
    } else {
      if (inputEl) inputEl.value = '';
      alert(`⚠️ 클라우드 업로드 실패: ${res.error}\n외부 클라우드(Cloudflare R2 등) MP3 링크를 직접 붙여넣어 주세요.`);
    }
  }

  // 모달 내 복원 사진·훈장·유품 도록 에디터
  function renderHmGalleryEditor() {
    const wrap = document.getElementById('hmGalleryEditor');
    if (!wrap || !currentEditingHeritage) return;
    const items = currentEditingHeritage.gallery || [];
    wrap.innerHTML = items.map((g, idx) => `
      <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:10px; padding:12px; margin-bottom:8px;">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:8px;">
          <strong style="font-size:0.82rem; color:#1e4d35;">🎞️ 소장품/복원사진 #${idx + 1}</strong>
          <button type="button" onclick="removeHmGallery(${idx})" style="border:1px solid #ef4444; background:#fff; color:#ef4444; border-radius:6px; padding:2px 8px; font-size:0.74rem; cursor:pointer;">삭제</button>
        </div>
        <div style="display:grid; grid-template-columns:1fr 0.8fr 1.6fr; gap:8px; margin-bottom:8px;">
          <select class="setting-input" onchange="updateHmGallery(${idx}, 'category', this.value)" style="font-size:0.8rem;">
            <option value="photo" ${g.category === 'photo' ? 'selected' : ''}>🎞️ 옛 사진 복원</option>
            <option value="medal" ${g.category === 'medal' ? 'selected' : ''}>🎖️ 훈장 · 상장</option>
            <option value="keepsake" ${g.category === 'keepsake' ? 'selected' : ''}>🏺 유품 · 애장품</option>
          </select>
          <input type="text" class="setting-input" value="${esc(g.year)}" oninput="updateHmGallery(${idx}, 'year', this.value)" placeholder="예: 1968년 봄" style="font-size:0.8rem;" />
          <input type="text" class="setting-input" value="${esc(g.title)}" oninput="updateHmGallery(${idx}, 'title', this.value)" placeholder="작품/사진 제목" style="font-size:0.8rem;" />
        </div>
        <div style="display:grid; grid-template-columns:1fr auto; gap:8px; align-items:center; margin-bottom:6px;">
          <input type="text" id="hmGalAfter_${idx}" class="setting-input" value="${esc(g.afterUrl)}" oninput="updateHmGallery(${idx}, 'afterUrl', this.value)" placeholder="✨ AI 복원 후 사진 URL (또는 업로드)" style="font-size:0.78rem;" />
          <label style="background:#1e4d35; color:#f6e7c1; padding:6px 10px; border-radius:8px; font-size:0.74rem; font-weight:800; cursor:pointer; white-space:nowrap;">
            📤 복원본
            <input type="file" accept="image/*" style="display:none;" onchange="uploadHmGalleryImg(event, ${idx}, 'afterUrl')" />
          </label>
        </div>
        <div style="display:grid; grid-template-columns:1fr auto; gap:8px; align-items:center; margin-bottom:6px;">
          <input type="text" id="hmGalBefore_${idx}" class="setting-input" value="${esc(g.beforeUrl)}" oninput="updateHmGallery(${idx}, 'beforeUrl', this.value)" placeholder="복원 전 원본 사진 URL (비워두면 자동 세피아 복원전 비교)" style="font-size:0.78rem;" />
          <label style="background:#475569; color:#fff; padding:6px 10px; border-radius:8px; font-size:0.74rem; font-weight:700; cursor:pointer; white-space:nowrap;">
            📤 원본
            <input type="file" accept="image/*" style="display:none;" onchange="uploadHmGalleryImg(event, ${idx}, 'beforeUrl')" />
          </label>
        </div>
        <input type="text" class="setting-input" value="${esc(g.story)}" oninput="updateHmGallery(${idx}, 'story', this.value)" placeholder="큐레이터 해설 / 가족의 사연" style="font-size:0.78rem;" />
      </div>
    `).join('');
  }

  function addHmGallery() {
    currentEditingHeritage.gallery.push({
      id: 'item_' + Date.now(),
      category: 'photo',
      categoryLabel: '옛 사진 AI 복원',
      year: '',
      title: '',
      beforeUrl: '',
      afterUrl: '',
      simulateAgedBefore: true,
      restoreNote: '600 DPI 스캔 · AI 정밀 복원 완료',
      story: ''
    });
    renderHmGalleryEditor();
  }

  function removeHmGallery(idx) {
    currentEditingHeritage.gallery.splice(idx, 1);
    renderHmGalleryEditor();
  }

  function updateHmGallery(idx, key, val) {
    const g = currentEditingHeritage.gallery[idx];
    if (!g) return;
    g[key] = val;
    if (key === 'category') {
      const map = { photo: '옛 사진 AI 복원', medal: '훈장 · 상장', keepsake: '가문 유품 · 애장품' };
      g.categoryLabel = map[val] || 'AI 정밀 복원';
    }
    if (key === 'beforeUrl') {
      g.simulateAgedBefore = !val;
    }
  }

  async function uploadHmGalleryImg(e, idx, field) {
    const file = e.target.files[0];
    if (!file) return;
    const inputId = field === 'afterUrl' ? `hmGalAfter_${idx}` : `hmGalBefore_${idx}`;
    const inputEl = document.getElementById(inputId);
    if (inputEl) inputEl.value = '☁️ 이미지 업로드 중...';
    const res = await global.YebaekMedia.uploadFileToFirebaseStorage(file, 'heritage_gallery');
    if (res.ok && res.url) {
      updateHmGallery(idx, field, res.url);
      if (inputEl) inputEl.value = res.url;
    } else {
      if (inputEl) inputEl.value = '';
      alert(`⚠️ 클라우드 업로드 실패: ${res.error}\n이미지 URL을 직접 입력하거나 Firebase Storage 권한을 확인해 주세요.`);
    }
  }

  // 모달 내 가계도 에디터
  function renderHmTreeEditor() {
    const wrap = document.getElementById('hmTreeEditor');
    if (!wrap || !currentEditingHeritage) return;
    const tree = currentEditingHeritage.familyTree || [];
    wrap.innerHTML = tree.map((m, idx) => `
      <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:10px; padding:10px 12px; margin-bottom:8px;">
        <div style="display:grid; grid-template-columns:0.75fr 1fr 1fr 1.4fr auto; gap:6px; align-items:center; margin-bottom:6px;">
          <select class="setting-input" onchange="updateHmTree(${idx}, 'gen', Number(this.value))" style="font-size:0.78rem;">
            <option value="1" ${m.gen == 1 ? 'selected' : ''}>1대 선조</option>
            <option value="2" ${m.gen == 2 ? 'selected' : ''}>2대 주인공</option>
            <option value="3" ${m.gen == 3 ? 'selected' : ''}>3대 자녀</option>
            <option value="4" ${m.gen == 4 ? 'selected' : ''}>4대 손주</option>
          </select>
          <input type="text" class="setting-input" value="${esc(m.name)}" oninput="updateHmTree(${idx}, 'name', this.value)" placeholder="성함" style="font-size:0.78rem;" />
          <input type="text" class="setting-input" value="${esc(m.relation)}" oninput="updateHmTree(${idx}, 'relation', this.value)" placeholder="관계 (예: 장남 내외)" style="font-size:0.78rem;" />
          <input type="text" class="setting-input" value="${esc(m.role)}" oninput="updateHmTree(${idx}, 'role', this.value)" placeholder="직업/대표 소개" style="font-size:0.78rem;" />
          <button type="button" onclick="removeHmTree(${idx})" style="border:1px solid #ef4444; background:#fff; color:#ef4444; border-radius:6px; padding:4px 8px; font-size:0.74rem; cursor:pointer;">삭제</button>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
          <input type="text" class="setting-input" value="${esc(m.bio)}" oninput="updateHmTree(${idx}, 'bio', this.value)" placeholder="약력/이야기" style="font-size:0.76rem;" />
          <input type="text" class="setting-input" value="${esc(m.quote)}" oninput="updateHmTree(${idx}, 'quote', this.value)" placeholder="남긴 말씀 (한 줄)" style="font-size:0.76rem;" />
        </div>
      </div>
    `).join('');
  }

  function addHmTreeMember() {
    currentEditingHeritage.familyTree.push({
      gen: 3,
      genLabel: '제3대 · 자녀 세대',
      name: '',
      relation: '',
      role: '',
      photo: 'images/living-funeral-family.jpg',
      bio: '',
      quote: ''
    });
    renderHmTreeEditor();
  }

  function removeHmTree(idx) {
    currentEditingHeritage.familyTree.splice(idx, 1);
    renderHmTreeEditor();
  }

  function updateHmTree(idx, key, val) {
    const m = currentEditingHeritage.familyTree[idx];
    if (!m) return;
    m[key] = val;
    if (key === 'gen') {
      const labels = { 1: '제1대 · 선조', 2: '제2대 · 평전 주인공', 3: '제3대 · 자녀 세대', 4: '제4대 · 손주 세대' };
      m.genLabel = labels[val] || `제${val}대`;
    }
  }

  async function uploadHmHeroImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    const input = document.getElementById('hmHeroImage');
    if (input) input.value = '☁️ 업로드 중...';
    const res = await global.YebaekMedia.uploadFileToFirebaseStorage(file, 'heritage_hero');
    if (res.ok && res.url) {
      if (input) input.value = res.url;
    } else {
      if (input) input.value = 'images/showcase-senior-memoir.jpg';
      alert(`⚠️ 업로드 실패: ${res.error}`);
    }
  }

  async function handleHeritageExhibitionSubmit(e) {
    e.preventDefault();
    if (!currentEditingHeritage) return;

    const familyName = document.getElementById('hmFamilyName').value.trim();
    const protagonistName = document.getElementById('hmProtagonistName').value.trim();
    if (!familyName || !protagonistName) {
      alert('가문명과 주인공 어르신 성함을 입력해 주세요.');
      return;
    }

    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '.');
    const payload = Object.assign({}, currentEditingHeritage, {
      id: document.getElementById('hmId').value.trim() || ('vip_' + Date.now()),
      isDemo: false,
      familyName,
      englishTitle: document.getElementById('hmEnglishTitle').value.trim() || 'HERITAGE PRESTIGE ARCHIVE',
      protagonistName,
      protagonistYears: document.getElementById('hmProtagonistYears').value.trim(),
      motto: document.getElementById('hmMotto').value.trim() || '뿌리 깊은 나무는 바람에 아니 묄세',
      mottoSub: document.getElementById('hmMottoSub').value.trim(),
      heroQuote: document.getElementById('hmHeroQuote').value.trim(),
      heroImage: document.getElementById('hmHeroImage').value.trim() || 'images/showcase-senior-memoir.jpg',
      accessPassword: document.getElementById('hmAccessPassword').value.trim(),
      linkedMemoirId: document.getElementById('hmLinkedMemoirId').value.trim(),
      bookTitle: document.getElementById('hmBookTitle').value.trim() || familyName,
      usbSerialNo: document.getElementById('hmUsbSerial').value.trim(),
      documentary: Object.assign({}, currentEditingHeritage.documentary || {}, {
        title: document.getElementById('hmDocuTitle').value.trim() || 'VIP 구술 다큐멘터리',
        videoUrl: document.getElementById('hmDocuUrl').value.trim(),
        duration: document.getElementById('hmDocuDuration').value.trim() || '05:30'
      }),
      publishedAt: currentEditingHeritage.publishedAt || today,
      updatedAtMs: Date.now()
    });

    // 빈 행 필터링
    payload.familyTree = (payload.familyTree || []).filter(m => m.name && m.name.trim());
    payload.gallery = (payload.gallery || []).filter(g => (g.title && g.title.trim()) || g.afterUrl);
    payload.audiobookTracks = (payload.audiobookTracks || []).filter(t => (t.title && t.title.trim()) || t.audioUrl);

    // 1. 로컬 저장
    const list = getLocalHeritageList();
    const idx = list.findIndex(x => x.id === payload.id);
    if (idx >= 0) list[idx] = payload;
    else list.unshift(payload);
    saveLocalHeritageList(list);

    // 2. Firestore 영구 저장
    let cloudSaved = false;
    const db = getDb();
    if (db) {
      try {
        await db.collection('heritage_exhibitions').doc(payload.id).set(payload, { merge: true });
        cloudSaved = true;
      } catch (err) {
        console.warn('[Heritage Firestore Save Error]', err);
      }
    }

    renderHeritageExhibitionsTable();
    closeHeritageExhibitionModal();

    const liveUrl = getHeritagePublicUrl(payload.id);
    alert(
      `🏛️ [${payload.familyName}] VIP 온라인 전시관이 발행되었습니다!\n\n` +
      `• 클라우드 저장: ${cloudSaved ? '✅ Firestore 실시간 반영 완료' : '⚠️ 로컬 저장 (네트워크 확인)'}\n` +
      `• 가문 전용 주소: ${liveUrl}\n\n` +
      `표의 [📷 SVG QR] 버튼으로 300 DPI 책 인쇄용 벡터 QR 파일을 바로 받으실 수 있습니다.`
    );
  }

  async function deleteHeritageExhibition(id) {
    if (!confirm('선택한 VIP 가문 온라인 전시관을 영구 삭제하시겠습니까?')) return;
    const next = getLocalHeritageList().filter(x => x.id !== id);
    saveLocalHeritageList(next);
    const db = getDb();
    if (db) {
      try { await db.collection('heritage_exhibitions').doc(id).delete(); } catch (e) {}
    }
    renderHeritageExhibitionsTable();
  }

  // =========================================================================
  // 3. 📊 상품별 제작 원가 · 외주비 · 적정 판매가 수익 시뮬레이터
  // =========================================================================
  function loadCostSimulatorState() {
    try {
      const saved = localStorage.getItem(COST_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return JSON.parse(JSON.stringify(global.YebaekMedia.DEFAULT_COST_PRESETS));
  }

  function saveCostSimulatorState() {
    try {
      localStorage.setItem(COST_STORAGE_KEY, JSON.stringify(currentCostState));
    } catch (e) {}
  }

  function renderMemoirCostSimulator() {
    const container = document.getElementById('memoirCostSimulatorGrid');
    if (!container || !global.YebaekMedia) return;
    if (!currentCostState) currentCostState = loadCostSimulatorState();

    const pkgKeys = ['masterpiece', 'heritage'];
    container.innerHTML = pkgKeys.map((pkgKey) => {
      const pkg = currentCostState[pkgKey];
      const totalCost = (pkg.items || []).reduce((sum, it) => sum + (Number(it.cost) || 0), 0);
      const sell = Number(pkg.sellPrice) || 0;
      const margin = sell - totalCost;
      const marginPct = sell > 0 ? Math.round((margin / sell) * 100) : 0;
      const accentColor = pkgKey === 'heritage' ? '#14281f' : '#8c6610';
      const borderCol = pkgKey === 'heritage' ? '#1e4d35' : '#c9a24b';

      return `
        <div style="background:#ffffff; border:1.6px solid ${borderCol}; border-radius:18px; padding:20px; display:flex; flex-direction:column; gap:14px;">
          <div style="border-bottom:1px solid #e2e8f0; padding-bottom:12px;">
            <div style="font-size:0.74rem; font-weight:850; color:${accentColor}; margin-bottom:4px;">${pkgKey === 'heritage' ? '🏛️ VIP 가문 헌정' : '👑 시그니처 대표작'}</div>
            <h3 style="font-family:'Noto Serif KR',serif; font-size:1.12rem; font-weight:900; color:#0f172a; margin:0 0 4px;">${esc(pkg.name)}</h3>
            <div style="font-size:0.76rem; color:#64748b;">${esc(pkg.badge)}</div>
          </div>

          <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; background:#fef9e7; border:1px solid #ead496; border-radius:12px; padding:11px 14px;">
            <strong style="font-size:0.86rem; color:#7a5912;">💰 책정 판매가 (만 원)</strong>
            <div style="display:flex; align-items:center; gap:6px;">
              <input type="number" min="0" step="10" value="${sell}" oninput="updateCostSellPrice('${pkgKey}', this.value)" style="width:96px; padding:6px 10px; border:1.5px solid #c9a24b; border-radius:8px; font-weight:900; font-size:1rem; text-align:right; color:#0f172a;" />
              <span style="font-weight:800; font-size:0.86rem;">만 원</span>
            </div>
          </div>

          <div style="display:flex; flex-direction:column; gap:8px;">
            ${(pkg.items || []).map((it, i) => `
              <div style="display:grid; grid-template-columns:1fr auto; gap:10px; align-items:center; padding:7px 10px; background:#f8fafc; border-radius:9px; border:1px solid #e2e8f0;">
                <div>
                  <div style="font-size:0.82rem; font-weight:750; color:#1e293b;">${esc(it.label)}</div>
                  <div style="font-size:0.72rem; color:#64748b;">진행처: ${esc(it.vendor)}</div>
                </div>
                <div style="display:flex; align-items:center; gap:4px;">
                  <input type="number" min="0" step="1" value="${Number(it.cost) || 0}" oninput="updateCostLineItem('${pkgKey}', ${i}, this.value)" style="width:70px; padding:5px 8px; border:1px solid #cbd5e1; border-radius:7px; text-align:right; font-weight:800; font-size:0.85rem;" />
                  <span style="font-size:0.76rem; color:#475569; font-weight:700;">만</span>
                </div>
              </div>
            `).join('')}
          </div>

          <div style="margin-top:auto; background:${pkgKey === 'heritage' ? '#14281f' : '#1e4d35'}; color:#f6ecd4; border-radius:14px; padding:15px 16px; display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; text-align:center;">
            <div>
              <div style="font-size:0.72rem; color:#bfd1c6;">총 제작 원가</div>
              <div style="font-size:1.08rem; font-weight:900; color:#ffffff;">${totalCost.toLocaleString()}만</div>
            </div>
            <div>
              <div style="font-size:0.72rem; color:#bfd1c6;">예상 순수익</div>
              <div style="font-size:1.08rem; font-weight:900; color:${margin >= 0 ? '#fde68a' : '#fca5a5'};">${margin.toLocaleString()}만</div>
            </div>
            <div>
              <div style="font-size:0.72rem; color:#bfd1c6;">순수익률(마진)</div>
              <div style="font-size:1.08rem; font-weight:900; color:${marginPct >= 35 ? '#86efac' : '#fde68a'};">${marginPct}%</div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function updateCostSellPrice(pkgKey, val) {
    if (!currentCostState || !currentCostState[pkgKey]) return;
    currentCostState[pkgKey].sellPrice = Number(val) || 0;
    saveCostSimulatorState();
    renderMemoirCostSimulator();
  }

  function updateCostLineItem(pkgKey, idx, val) {
    if (!currentCostState || !currentCostState[pkgKey]) return;
    currentCostState[pkgKey].items[idx].cost = Number(val) || 0;
    saveCostSimulatorState();
    renderMemoirCostSimulator();
  }

  function resetMemoirCostSimulator() {
    if (!confirm('원가·판매가 시뮬레이터를 표준 권장값으로 초기화하시겠습니까?')) return;
    localStorage.removeItem(COST_STORAGE_KEY);
    currentCostState = JSON.parse(JSON.stringify(global.YebaekMedia.DEFAULT_COST_PRESETS));
    renderMemoirCostSimulator();
  }

  // 전역 노출
  global.handleWbAudioFileChange = handleWbAudioFileChange;
  global.downloadPersonalWebbookQrSvg = downloadPersonalWebbookQrSvg;
  global.syncHeritageExhibitionsFromCloud = syncHeritageExhibitionsFromCloud;
  global.renderHeritageExhibitionsTable = renderHeritageExhibitionsTable;
  global.copyHeritageExhibitionLink = copyHeritageExhibitionLink;
  global.downloadHeritageQrSvg = downloadHeritageQrSvg;
  global.openHeritageExhibitionModal = openHeritageExhibitionModal;
  global.closeHeritageExhibitionModal = closeHeritageExhibitionModal;
  global.addHmTrack = addHmTrack;
  global.removeHmTrack = removeHmTrack;
  global.updateHmTrack = updateHmTrack;
  global.uploadHmTrackAudio = uploadHmTrackAudio;
  global.addHmGallery = addHmGallery;
  global.removeHmGallery = removeHmGallery;
  global.updateHmGallery = updateHmGallery;
  global.uploadHmGalleryImg = uploadHmGalleryImg;
  global.addHmTreeMember = addHmTreeMember;
  global.removeHmTree = removeHmTree;
  global.updateHmTree = updateHmTree;
  global.uploadHmHeroImage = uploadHmHeroImage;
  global.handleHeritageExhibitionSubmit = handleHeritageExhibitionSubmit;
  global.deleteHeritageExhibition = deleteHeritageExhibition;
  global.renderMemoirCostSimulator = renderMemoirCostSimulator;
  global.updateCostSellPrice = updateCostSellPrice;
  global.updateCostLineItem = updateCostLineItem;
  global.resetMemoirCostSimulator = resetMemoirCostSimulator;

  function bootAdminHeritageModule() {
    renderHeritageExhibitionsTable();
    renderMemoirCostSimulator();
    setTimeout(() => syncHeritageExhibitionsFromCloud(false), 600);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootAdminHeritageModule);
  } else {
    bootAdminHeritageModule();
  }
})(window);
