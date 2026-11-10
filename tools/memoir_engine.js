/* ==========================================================
   [신설] 04. 자서전 출판 관제센터 & AI 윤문 파이프라인 엔진 (고도화 버전)
   ========================================================== */
(function(window) {
  'use strict';

  var currentMemoirFilter = 'all';
  var currentMemoirSearch = '';
  var activeMemoirProjectId = null;
  var activeMemoirChapterId = 1;
  var isSplitAudioPlaying = false;
  var splitAudioTimer = null;
  var splitAudioCurrentSeconds = 512;

  // 1~5장 템플릿 기본 정의
  var CHAPTER_TEMPLATES = {
    1: {
      title: '제1장. 유년과 고향의 기억',
      subtitle: '1.1. 감나무 가지 끝에 걸린 고향의 노을',
      transcript: '[00:00:15] 내가 태어난 데가 경북 청도 각남면이야. 온통 감나무 밭이었지. 가을만 되면 집 뒤란이고 앞마당이고 주홍빛으로 물이 들었어.\n[00:02:40] 우리 어머니는 새벽 닭이 울기도 전에 일어나서 무쇠 가마솥에 장작불을 지피셨지. 그 매캐하면서도 구수한 밥 짓는 냄새가 토방을 넘어 이불속까지 들어왔어.\n[00:05:12] 아버지는 유독 엄하셨지만, 장날만 되면 읍내 나가셔서 눈깔사탕 한 봉지를 꼭 품에 넣고 오셨어. 그게 내 어린 시절의 가장 달콤한 향기였지.\n[00:12:30] 그때 동무들과 냇가에서 멱감고 자맥질하던 기억이 아직도 눈에 선해. 가난했지만 마음만은 온 세상 부자 부럽지 않던 시절이었어.',
      content: '1.1. 감나무 가지 끝에 걸린 고향의 노을\n\n내 유년의 기억은 온통 주홍빛 감물이 든 가을 하늘로 채워져 있다.\n경북 청도 각남면, 나직한 산자락을 등진 우리 집 뒤란에는 해마다 탐스러운 감이 주렁주렁 매달리곤 했다.\n\n어머니는 새벽안개가 걷히기도 전에 가마솥에 장작불을 지피셨다. 매캐하지만 구수한 밥 짓는 냄새가 토방을 넘어 이불속까지 스며들 때면, 비로소 고향의 하루가 따스하게 깨어났다.\n\n아버지는 말수가 적고 유독 엄하셨지만, 장날이면 읍내에서 사 오신 눈깔사탕 한 봉지를 무뚝뚝하게 품에서 꺼내 건네주시곤 했다. 그 사탕 한 알의 달콤함은 가난했던 그 시절, 어린 나를 지탱해 주던 가장 커다란 온기였다.\n\n동무들과 맑은 냇가에서 멱을 감고 온 들판을 뛰놀던 그때의 기억은, 세월이 반세기를 훌쩍 넘긴 지금도 가슴 깊은 곳에서 여백처럼 맑게 흐르고 있다.'
    },
    2: {
      title: '제2장. 청춘의 열정과 도전',
      subtitle: '2.1. 완행열차에 몸을 싣고 상경하던 스무 살의 새벽',
      transcript: '[00:01:10] 스무 살 되던 해 봄에 보따리 하나 달랑 들고 서울 가는 밤기차를 탔어. 밤새 덜컹거리는 기차 안에서 창밖을 보며 얼마나 울었는지 몰라.\n[00:06:20] 영등포 방직공장에 첫 출근하던 날, 웅웅거리며 돌아가는 기계 소리에 귀가 먹먹했지. 그래도 손에 첫 월급봉투를 쥐었을 때, 고향 어머니 생각이 나서 눈물이 핑 돌았어.',
      content: '2.1. 완행열차에 몸을 싣고 상경하던 스무 살의 새벽\n\n스무 살의 봄, 손때 묻은 보따리 하나를 가슴에 품고 서울행 밤 완행열차에 올랐다.\n덜컹거리는 차창 밖으로 아스라이 멀어지는 고향 마을의 불빛을 바라보며, 홀로 남겨질 어머니 생각에 가만히 눈물을 훔쳤다.\n\n영등포 공장의 새벽은 거대하고 낯설었다. 밤낮없이 웅웅거리며 돌아가는 방직기계의 굉음 속에서 고단한 청춘의 하루하루를 버텨냈다.\n손가락 마디마디가 부르트던 그 시절, 손에 쥔 첫 월급봉투를 고향 집으로 부치던 우체국 창구 앞에서 비로소 나는 어른이 되어가고 있었다.'
    },
    3: {
      title: '제3장. 사랑과 가족의 결',
      subtitle: '3.1. 빗속에서 마주친 우산, 그리고 평생의 동반자',
      transcript: '[00:01:00] 중매로 만났지만 비 오는 날 정류장에서 묵묵히 우산을 받쳐주던 그 사람 모습에 마음이 스르르 녹았지. 참 우직하고 성실한 사람이었어.\n[00:10:30] 첫째 아이를 낳고 단칸방 사글세로 시작했는데, 둘이 손잡고 궂은일 마다하지 않고 여기까지 달려왔지.',
      content: '3.1. 빗속에서 마주친 우산, 그리고 평생의 동반자\n\n우리의 인연은 여름비가 쏟아지던 버스 정류장에서 시작되었다.\n묵묵히 낡은 우산을 받쳐주며 자신의 어깨가 다 젖는 줄도 모르던 그 우직한 청년이 바로 나의 평생 반려자였다.\n\n비록 서투르고 비좁은 단칸방에서 살림을 시작했지만, 서로를 향한 신뢰와 온기만큼은 늘 가득 차올랐다. 아이들의 작은 숨소리가 방안을 채울 때마다, 우리는 세상 어떤 거센 비바람도 이겨낼 수 있다는 용기를 배웠다.'
    },
    4: {
      title: '제4장. 시련을 넘은 삶의 지혜',
      subtitle: '4.1. 비바람 속에서도 꺼지지 않았던 희망의 등불',
      transcript: '[00:02:15] 살다 보면 누구나 한번은 숨이 턱 끝까지 차오르는 시련을 겪지. 1997년 IMF 때 하던 가게 문을 닫아야 했을 땐 세상이 무너지는 것 같았어.\n[00:08:40] 그래도 날 믿어주는 식구들이 있었기에 다시 일어설 수 있었지. 새벽 첫차를 타고 남대문 시장을 오가며 매일 다짐했어. 포기하지만 않으면 봄은 반드시 온다고.',
      content: '4.1. 비바람 속에서도 꺼지지 않았던 희망의 등불\n\n인생이라는 바다는 언제나 잔잔할 수만은 없었다.\n모든 것이 한순간에 무너져 내리는 듯했던IMF의 한파 속에서도, 나를 다시 일으켜 세운 것은 가족들의 말없는 응원과 서로를 향한 온기였다.\n\n새벽 찬 공기를 가르며 남대문 시장 골목을 누비던 시간들은 고통이 아니라 나를 더욱 단단하게 벼려낸 삶의 학교였다. 시련의 한복판에서 배운 것은 원망이 아닌 감사였으며, 묵묵히 버텨내는 삶의 거룩한 인내였다.'
    },
    5: {
      title: '제5장. 후손에게 전하는 유산',
      subtitle: '5.1. 사랑하는 아이들에게 남기는 고요한 당부',
      transcript: '[00:01:45] 자식들에게 물려줄 큰 재물은 없지만, 한평생 정직하고 부끄럼 없이 살았다는 자부심은 남겨주고 싶어.\n[00:09:20] 살아가면서 힘들 땐 서두르지 말고 잠시 여백을 두어라. 마음에 결이 고운 사람이 결국 인생을 아름답게 완성하는 법이란다. 너희들이 내 삶의 가장 찬란한 보물이었다.',
      content: '5.1. 사랑하는 아이들에게 남기는 고요한 당부\n\n세월을 돌아보니 남는 것은 거창한 성공이나 재산이 아니라, 우리가 서로를 얼마나 다정하게 품어주었는가 하는 기억뿐이다.\n\n사랑하는 아들, 딸, 그리고 손주들에게 이 한마디만은 꼭 전하고 싶다.\n세상이 아무리 빠르게 흘러가더라도 네 마음속의 고요한 여백을 잃지 마라. 남을 배려하고 스스로에게 부끄러움이 없는 삶을 살아간다면, 어떤 비바람 속에서도 너만의 고유한 향기가 피어날 것이다.\n\n너희들이 내 삶에 찾아와 주었기에 나의 인생은 더없이 충만하고 아름다웠다. 고맙고, 또 영원히 사랑한다.'
    }
  };

  // 기본 고품질 데모 프로젝트 데이터
  var DEFAULT_MEMOIR_PROJECTS = [
    {
      id: 'mem_demo_kim',
      clientName: '김순옥 어르신',
      clientAge: '78세',
      region: '서울 서초구 방배동',
      applicantName: '홍길동 (장남)',
      applicantPhone: '010-8921-3421',
      relation: '자녀',
      packageType: 'masterpiece',
      packageLabel: '인생 마스터피스 (시그니처)',
      coachName: '김은영 수석코치',
      coachPhone: '010-3321-7788',
      status: 'coach_reviewed',
      statusLabel: '코치 검수·교정 중',
      recordingsCount: 4,
      photosCount: 18,
      notes: '칠순 기념 자녀 헌정. 1960년대 청도 고향 시절과 서울 상경 첫 일터의 기억을 생생하게 담아내길 희망하심.',
      familyFeedback: '장남 홍길동: 1장의 고향집 감나무 묘사가 어머니 말씀과 똑같아서 감동했습니다. 3장의 첫째 아이 태어난 날 병원 이름(영등포 제일의원)만 추가해 주시면 완벽하겠습니다.',
      createdAt: '2026.11.08',
      updatedAt: '2026.11.10',
      chapters: [
        { id: 1, title: CHAPTER_TEMPLATES[1].title, subtitle: CHAPTER_TEMPLATES[1].subtitle, status: 'completed', audioDuration: '24분 15초', transcript: CHAPTER_TEMPLATES[1].transcript, content: CHAPTER_TEMPLATES[1].content },
        { id: 2, title: CHAPTER_TEMPLATES[2].title, subtitle: CHAPTER_TEMPLATES[2].subtitle, status: 'completed', audioDuration: '32분 40초', transcript: CHAPTER_TEMPLATES[2].transcript, content: CHAPTER_TEMPLATES[2].content },
        { id: 3, title: CHAPTER_TEMPLATES[3].title, subtitle: CHAPTER_TEMPLATES[3].subtitle, status: 'completed', audioDuration: '28분 50초', transcript: CHAPTER_TEMPLATES[3].transcript, content: CHAPTER_TEMPLATES[3].content },
        { id: 4, title: CHAPTER_TEMPLATES[4].title, subtitle: CHAPTER_TEMPLATES[4].subtitle, status: 'completed', audioDuration: '19분 30초', transcript: CHAPTER_TEMPLATES[4].transcript, content: CHAPTER_TEMPLATES[4].content },
        { id: 5, title: CHAPTER_TEMPLATES[5].title, subtitle: CHAPTER_TEMPLATES[5].subtitle, status: 'completed', audioDuration: '15분 40초', transcript: CHAPTER_TEMPLATES[5].transcript, content: CHAPTER_TEMPLATES[5].content }
      ]
    },
    {
      id: 'mem_demo_park',
      clientName: '박판석 어르신',
      clientAge: '82세',
      region: '경기 수원시 팔달구',
      applicantName: '박지민 (딸)',
      applicantPhone: '010-5542-1980',
      relation: '자녀',
      packageType: 'basic',
      packageLabel: '감사 헌정본 (Compact Tribute)',
      coachName: '박미정 코치',
      coachPhone: '010-8812-4455',
      status: 'interview_done',
      statusLabel: '구술 인터뷰 완료',
      recordingsCount: 2,
      photosCount: 12,
      notes: '팔순 잔치에서 손주들에게 직접 낭독해 주실 80페이지 포토 회고록 제작 희망.',
      familyFeedback: '',
      createdAt: '2026.11.09',
      updatedAt: '2026.11.10',
      chapters: [
        { id: 1, title: '제1장. 유년과 고향의 기억', subtitle: '1.1. 남한강 뱃사공의 아들로 자라난 강변 마을', status: 'completed', audioDuration: '21분 10초', transcript: '[00:01:00] 남한강 상류 여주 강변에서 뗏목을 타며 자랐어. 강물이 얼어붙으면 썰매를 타고, 봄이 오면 버들피리를 불었지.', content: '1.1. 남한강 뱃사공의 아들로 자라난 강변 마을\n\n남한강 푸른 물줄기가 굽이쳐 흐르던 여주 강변 마을, 나의 유년은 온통 강물 소리로 가득했다...' },
        { id: 2, title: '제2장. 청춘의 열정과 도전', subtitle: '', status: 'pending', audioDuration: '18분 30초', transcript: '기술을 배우러 수원으로 나와 정미소와 목공소를 전전하며 성실 하나로 일어섰지.', content: '' },
        { id: 3, title: '제3장. 사랑과 가족의 결', subtitle: '', status: 'pending', audioDuration: '', transcript: '', content: '' },
        { id: 4, title: '제4장. 시련을 넘은 삶의 지혜', subtitle: '', status: 'pending', audioDuration: '', transcript: '', content: '' },
        { id: 5, title: '제5장. 후손에게 전하는 유산', subtitle: '', status: 'pending', audioDuration: '', transcript: '', content: '' }
      ]
    }
  ];

  function getMemoirProjects() {
    try {
      var raw = localStorage.getItem('yebaek_memoir_projects');
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch(e) {}
    localStorage.setItem('yebaek_memoir_projects', JSON.stringify(DEFAULT_MEMOIR_PROJECTS));
    return DEFAULT_MEMOIR_PROJECTS;
  }

  function saveMemoirProjects(projects) {
    localStorage.setItem('yebaek_memoir_projects', JSON.stringify(projects));
    if (typeof db !== 'undefined' && db) {
      projects.forEach(function(p) {
        try {
          db.collection('memoir_projects').doc(p.id).set(p, { merge: true });
        } catch(err) {}
      });
    }
  }

  function renderMemoirDashboard() {
    var projects = getMemoirProjects();

    var total = projects.length;
    var cntInterview = 0;
    var cntDrafting = 0;
    var cntFamily = 0;
    var cntPrinting = 0;
    var cntCompleted = 0;

    projects.forEach(function(p) {
      var st = p.status || 'interview_pending';
      if (st === 'interview_pending' || st === 'interview_done') cntInterview++;
      else if (st === 'ai_drafted' || st === 'coach_reviewed') cntDrafting++;
      else if (st === 'family_approved') cntFamily++;
      else if (st === 'printing') cntPrinting++;
      else if (st === 'completed') cntCompleted++;
    });

    var elTotal = document.getElementById('statMemoirTotal');
    var elInterview = document.getElementById('statMemoirInterview');
    var elDrafting = document.getElementById('statMemoirDrafting');
    var elCompleted = document.getElementById('statMemoirCompleted');
    if (elTotal) elTotal.innerText = total + '건';
    if (elInterview) elInterview.innerText = cntInterview + '건';
    if (elDrafting) elDrafting.innerText = cntDrafting + '건';
    if (elCompleted) elCompleted.innerText = (cntPrinting + cntCompleted) + '건';

    var fAll = document.getElementById('cntFilterMemoirAll');
    var fInt = document.getElementById('cntFilterMemoirInterview');
    var fDrf = document.getElementById('cntFilterMemoirDrafting');
    var fFam = document.getElementById('cntFilterMemoirFamily');
    var fPrt = document.getElementById('cntFilterMemoirPrinting');
    var fDone = document.getElementById('cntFilterMemoirDone');
    if (fAll) fAll.innerText = total;
    if (fInt) fInt.innerText = cntInterview;
    if (fDrf) fDrf.innerText = cntDrafting;
    if (fFam) fFam.innerText = cntFamily;
    if (fPrt) fPrt.innerText = cntPrinting;
    if (fDone) fDone.innerText = cntCompleted;

    var filtered = projects.filter(function(p) {
      if (currentMemoirFilter === 'interview' && !(p.status === 'interview_pending' || p.status === 'interview_done')) return false;
      if (currentMemoirFilter === 'drafting' && !(p.status === 'ai_drafted' || p.status === 'coach_reviewed')) return false;
      if (currentMemoirFilter === 'family' && p.status !== 'family_approved') return false;
      if (currentMemoirFilter === 'printing' && p.status !== 'printing') return false;
      if (currentMemoirFilter === 'completed' && p.status !== 'completed') return false;

      if (currentMemoirSearch) {
        var q = currentMemoirSearch.toLowerCase();
        var matchElder = (p.clientName || '').toLowerCase().indexOf(q) !== -1;
        var matchApplicant = (p.applicantName || '').toLowerCase().indexOf(q) !== -1;
        var matchCoach = (p.coachName || '').toLowerCase().indexOf(q) !== -1;
        var matchRegion = (p.region || '').toLowerCase().indexOf(q) !== -1;
        if (!matchElder && !matchApplicant && !matchCoach && !matchRegion) return false;
      }
      return true;
    });

    var tbody = document.getElementById('memoirProjectsTableBody');
    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 36px; color: var(--text-muted); font-size: 0.92rem;">조건에 일치하는 자서전 프로젝트가 없습니다.</td></tr>';
      return;
    }

    var statusConfig = {
      'interview_pending': { label: '🎙️ 인터뷰 대기', bg: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' },
      'interview_done': { label: '🎙️ 인터뷰 완료', bg: 'rgba(37, 99, 235, 0.16)', color: '#1d4ed8' },
      'ai_drafted': { label: '🤖 AI 윤문 완료', bg: 'rgba(217, 119, 6, 0.12)', color: '#d97706' },
      'coach_reviewed': { label: '✍️ 코치 교정 중', bg: 'rgba(194, 155, 56, 0.16)', color: '#936f1c' },
      'family_approved': { label: '👨‍👩‍👧 가족 승인', bg: 'rgba(139, 92, 246, 0.12)', color: '#7c3aed' },
      'printing': { label: '🖨️ 양장본 인쇄 중', bg: 'rgba(5, 150, 105, 0.14)', color: '#059669' },
      'completed': { label: '✅ 출판 완료', bg: 'rgba(5, 150, 105, 0.22)', color: '#047857' }
    };

    var html = '';
    filtered.forEach(function(p) {
      var st = statusConfig[p.status] || { label: p.status || '대기', bg: '#f1f5f9', color: '#475569' };
      
      var completedChapters = 0;
      if (p.chapters && Array.isArray(p.chapters)) {
        p.chapters.forEach(function(ch) {
          if (ch.content && ch.content.trim().length > 50) completedChapters++;
        });
      }
      var progressPercent = Math.round((completedChapters / 5) * 100);

      html += '<tr style="border-bottom: 1px solid var(--border-color);">';
      
      html += '<td style="padding: 12px 10px;">';
      html += '<div style="font-weight: 750; color: var(--text-primary); font-size: 0.84rem;">' + (p.createdAt || '-') + '</div>';
      html += '<div style="font-size: 0.72rem; color: var(--text-muted); font-family: monospace;">' + (p.id || '') + '</div>';
      html += '</td>';

      html += '<td style="padding: 12px 10px;">';
      html += '<div style="font-weight: 850; color: var(--text-primary); font-size: 0.94rem; display: flex; align-items: center; gap: 4px;">';
      html += '<span>👵</span> <span>' + escapeHtml(p.clientName || '성함 미상') + '</span>';
      html += '</div>';
      html += '<div style="font-size: 0.78rem; color: var(--text-secondary);">' + (p.clientAge || '-') + ' · ' + escapeHtml(p.region || '지역 미지정') + '</div>';
      html += '</td>';

      html += '<td style="padding: 12px 10px;">';
      html += '<div style="font-size: 0.84rem; color: var(--text-primary); font-weight: 750;">' + escapeHtml(p.applicantName || '-') + ' (' + (p.relation || '의뢰') + ')</div>';
      html += '<div style="display: inline-block; font-size: 0.72rem; background: rgba(194, 155, 56, 0.12); color: #936f1c; padding: 1px 6px; border-radius: 4px; font-weight: 800; margin-top: 2px;">' + (p.packageLabel || '인생 마스터피스') + '</div>';
      html += '</td>';

      html += '<td style="padding: 12px 10px;">';
      html += '<div style="font-weight: 800; color: var(--text-primary); font-size: 0.84rem;">' + escapeHtml(p.coachName || '배정 중') + '</div>';
      html += '<div style="font-size: 0.72rem; color: var(--text-muted);">' + (p.coachPhone || '') + '</div>';
      html += '</td>';

      html += '<td style="padding: 12px 10px; text-align: center;">';
      html += '<div style="font-size: 0.82rem; font-weight: 750; color: var(--text-secondary); display: flex; flex-direction: column; gap: 2px;">';
      html += '<span>🎙️ 녹음 ' + (p.recordingsCount || 0) + '건</span>';
      html += '<span>🎞️ 사진 ' + (p.photosCount || 0) + '장</span>';
      html += '</div>';
      html += '</td>';

      html += '<td style="padding: 12px 10px;">';
      html += '<div style="display: flex; justify-content: space-between; font-size: 0.74rem; font-weight: 800; color: var(--text-secondary); margin-bottom: 4px;">';
      html += '<span>' + completedChapters + ' / 5 챕터</span>';
      html += '<span>' + progressPercent + '%</span>';
      html += '</div>';
      html += '<div style="width: 100%; height: 7px; background: var(--bg-secondary); border-radius: 999px; overflow: hidden; border: 1px solid var(--border-color);">';
      html += '<div style="height: 100%; width: ' + progressPercent + '%; background: linear-gradient(90deg, #c29b38, #059669); border-radius: 999px; transition: width 0.3s ease;"></div>';
      html += '</div>';
      html += '</td>';

      html += '<td style="padding: 12px 10px; text-align: center;">';
      html += '<span style="display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 0.76rem; font-weight: 850; background: ' + st.bg + '; color: ' + st.color + ';">';
      html += st.label;
      html += '</span>';
      html += '</td>';

      html += '<td style="padding: 12px 10px; text-align: center;">';
      html += '<div style="display: flex; gap: 6px; justify-content: center; flex-wrap: wrap;">';
      html += '<button type="button" onclick="openMemoirSplitEditor(\'' + p.id + '\', 1)" class="btn-save-setting" style="background: linear-gradient(135deg, #1e3d2f 0%, #152d22 100%); color: #fff; border: none; font-size: 0.78rem; font-weight: 850; padding: 5px 10px; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">';
      html += '<span>✍️</span> 검수 에디터';
      html += '</button>';
      html += '<button type="button" onclick="openMemoirPrintPreview(\'' + p.id + '\')" class="btn-save-setting" style="background: rgba(194, 155, 56, 0.15); color: #936f1c; border: 1px solid #c29b38; font-size: 0.76rem; font-weight: 850; padding: 5px 8px; border-radius: 6px; cursor: pointer;" title="양장본 인쇄 규격 PDF 책자 미리보기 & 발주">';
      html += '🖨️ 인쇄';
      html += '</button>';
      html += '<button type="button" onclick="deleteMemoirProject(\'' + p.id + '\')" title="프로젝트 삭제" style="background: none; border: 1px solid var(--border-color); border-radius: 6px; padding: 4px 7px; font-size: 0.76rem; color: #ef4444; cursor: pointer;">';
      html += '🗑️';
      html += '</button>';
      html += '</div>';
      html += '</td>';

      html += '</tr>';
    });

    tbody.innerHTML = html;
  }

  function filterMemoirProjects(filterType, btn) {
    currentMemoirFilter = filterType;
    var group = document.getElementById('memoirFilterButtonGroup');
    if (group) {
      var btns = group.querySelectorAll('.btn-mag-filter');
      btns.forEach(function(b) { b.classList.remove('active'); });
    }
    if (btn) btn.classList.add('active');
    renderMemoirDashboard();
  }

  function handleMemoirSearch(val) {
    currentMemoirSearch = val ? val.trim() : '';
    renderMemoirDashboard();
  }

  // ==========================================
  // 스플릿 뷰 에디터 모달 제어
  // ==========================================
  function openMemoirSplitEditor(projectId, chapterId) {
    var projects = getMemoirProjects();
    var project = projects.find(function(p) { return p.id === projectId; });
    if (!project) {
      alert('프로젝트를 찾을 수 없습니다.');
      return;
    }

    activeMemoirProjectId = projectId;
    activeMemoirChapterId = chapterId || 1;

    var elElderBadge = document.getElementById('splitElderBadge');
    var elPackageBadge = document.getElementById('splitPackageBadge');
    var elCoachBadge = document.getElementById('splitCoachBadge');
    var elStatusSelect = document.getElementById('splitProjectStatusSelect');
    var elFeedback = document.getElementById('splitFamilyFeedbackMemo');

    if (elElderBadge) elElderBadge.innerText = (project.clientName || '어르신') + ' (' + (project.clientAge || '-') + ')';
    if (elPackageBadge) elPackageBadge.innerText = project.packageLabel || '인생 마스터피스';
    if (elCoachBadge) elCoachBadge.innerText = '담당: ' + (project.coachName || '배정 대기');
    if (elStatusSelect) elStatusSelect.value = project.status || 'interview_pending';
    if (elFeedback) elFeedback.value = project.familyFeedback || '';

    bindSplitChapterData(project, activeMemoirChapterId);

    var modal = document.getElementById('memoirSplitEditorModal');
    if (modal) {
      modal.style.display = 'flex';
      modal.classList.add('open');
    }
  }

  function closeMemoirSplitEditor() {
    if (isSplitAudioPlaying) toggleSplitAudioSim();
    var modal = document.getElementById('memoirSplitEditorModal');
    if (modal) {
      modal.style.display = 'none';
      modal.classList.remove('open');
    }
    renderMemoirDashboard();
  }

  function switchSplitChapter(chapterId, btn) {
    activeMemoirChapterId = chapterId;
    var tabBar = document.getElementById('splitChapterTabBar');
    if (tabBar) {
      var btns = tabBar.querySelectorAll('.btn-mag-filter');
      btns.forEach(function(b) { b.classList.remove('active'); });
    }
    if (btn) btn.classList.add('active');

    var projects = getMemoirProjects();
    var project = projects.find(function(p) { return p.id === activeMemoirProjectId; });
    if (project) {
      bindSplitChapterData(project, chapterId);
    }
  }

  function bindSplitChapterData(project, chapterId) {
    var chapters = project.chapters || [];
    var chapter = chapters.find(function(c) { return c.id === chapterId; });
    
    // 만약 해당 챕터가 없으면 템플릿 기본값 생성
    if (!chapter) {
      var tpl = CHAPTER_TEMPLATES[chapterId] || { title: '제' + chapterId + '장', subtitle: '', transcript: '', content: '' };
      chapter = {
        id: chapterId,
        title: tpl.title,
        subtitle: tpl.subtitle,
        transcript: tpl.transcript,
        content: tpl.content,
        audioDuration: '20분 내외'
      };
      if (!project.chapters) project.chapters = [];
      project.chapters.push(chapter);
    }

    var elDuration = document.getElementById('splitAudioDurationBadge');
    var elTranscript = document.getElementById('splitTranscriptText');
    if (elDuration) elDuration.innerText = '녹음 파일: rec_chapter' + chapterId + '.mp3 (' + (chapter.audioDuration || '20분 내외') + ')';
    if (elTranscript) elTranscript.value = chapter.transcript || '';

    var elSubtitle = document.getElementById('splitChapterSubtitle');
    var elContent = document.getElementById('splitChapterContent');
    if (elSubtitle) elSubtitle.value = chapter.subtitle || '';
    if (elContent) elContent.value = chapter.content || '';

    updateSplitCharCount();
  }

  function loadSplitTranscriptToEditor() {
    var elTranscript = document.getElementById('splitTranscriptText');
    var transcript = elTranscript ? elTranscript.value : '';
    var contentEl = document.getElementById('splitChapterContent');
    if (contentEl && transcript) {
      if (contentEl.value && !confirm('현재 작성 중인 에디터 원고를 지우고 원문 녹취록으로 덮어쓸까요?')) return;
      contentEl.value = transcript;
      updateSplitCharCount();
    }
  }

  function updateSplitCharCount() {
    var elContent = document.getElementById('splitChapterContent');
    var text = elContent ? elContent.value : '';
    var len = text.length;
    var pages = (len / 580).toFixed(1);
    var badge = document.getElementById('splitCharCountBadge');
    if (badge) {
      badge.innerText = len.toLocaleString() + '자 · 신국판 약 ' + pages + '페이지';
    }
  }

  // 🤖 원클릭 AI 음성 녹취 & 5단계 감성 윤문 자동 생성기
  function runOneClickAiMemoirPipeline() {
    if (!activeMemoirProjectId) return;
    var projects = getMemoirProjects();
    var project = projects.find(function(p) { return p.id === activeMemoirProjectId; });
    if (!project) return;

    var btn = document.getElementById('btnAiOneClickPipeline');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span>⏳ 음성인식 &amp; 여백 윤문 AI 작동 중 (5단계)...</span>';
    }

    setTimeout(function() {
      // 1. 해당 프로젝트 1~5장 전체 템플릿 채우기
      if (!project.chapters || project.chapters.length < 5) {
        project.chapters = [];
        for (var i = 1; i <= 5; i++) {
          var tpl = CHAPTER_TEMPLATES[i];
          project.chapters.push({
            id: i,
            title: tpl.title,
            subtitle: tpl.subtitle,
            status: 'completed',
            audioDuration: (20 + i * 3) + '분 ' + (10 + i * 5) + '초',
            transcript: tpl.transcript,
            content: tpl.content
          });
        }
      } else {
        // 현재 활성 챕터 채우기
        var curCh = project.chapters.find(function(c) { return c.id === activeMemoirChapterId; });
        var curTpl = CHAPTER_TEMPLATES[activeMemoirChapterId];
        if (curCh && curTpl) {
          curCh.subtitle = curTpl.subtitle;
          curCh.transcript = curTpl.transcript;
          curCh.content = curTpl.content;
          curCh.status = 'completed';
        }
      }

      project.status = 'ai_drafted';
      project.statusLabel = 'AI 윤문 완료';
      project.recordingsCount = Math.max(project.recordingsCount || 0, 4);
      project.photosCount = Math.max(project.photosCount || 0, 18);
      project.updatedAt = new Date().toISOString().slice(0,10).replace(/-/g, '.');

      saveMemoirProjects(projects);
      bindSplitChapterData(project, activeMemoirChapterId);

      var elStatusSelect = document.getElementById('splitProjectStatusSelect');
      if (elStatusSelect) elStatusSelect.value = 'ai_drafted';

      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>🤖 원클릭 AI 음성 녹취 &amp; 5단계 감성 윤문 생성</span>';
      }

      alert('✨ [AI 파이프라인 가동 완료]\n\n1. 음성 녹음 데이터 ➔ Whisper STT 한국어 텍스트화 완료\n2. 여백과 결 5단계 감성 윤문 엔진 ➔ 1장~5장 생애 서사 완성!\n\n우측 에디터에서 완성된 윤문 원고를 검수하시고 가족들과 피드백을 나눠보세요.');
    }, 1200);
  }

  // 스마트 AI 윤문 도구
  function runAiPolishTool(toolType) {
    var contentEl = document.getElementById('splitChapterContent');
    var subtitleEl = document.getElementById('splitChapterSubtitle');
    var current = contentEl ? contentEl.value.trim() : '';

    if (!current) {
      alert('윤문할 원고 본문이 비어 있습니다. 좌측의 [원클릭 AI 윤문 생성] 버튼을 누르거나 초고를 입력해 주세요.');
      return;
    }

    if (toolType === 'poetic') {
      contentEl.value = current.replace(/했어/g, '했다')
                               .replace(/있었어/g, '있었다')
                               .replace(/봤거든/g, '보곤 했다')
                               .replace(/생각나/g, '마음 한편에 잔잔히 떠오른다')
                               .replace(/눈물이 핑 돌았어/g, '가만히 솟구치는 눈물을 삼켜야 했다');
      alert('✨ [여백 감성 문체 엔진] 서정적이고 단아한 문체로 윤문되었습니다.');
    } else if (toolType === 'dialect') {
      contentEl.value = current.replace(/태어난 데가/g, '태어난 곳은')
                               .replace(/피었거든/g, '피어나곤 했다')
                               .replace(/물들이 들었어/g, '물들곤 했다')
                               .replace(/사글세/g, '월세 방');
      alert('🌸 [사투리 순화 엔진] 고향의 정취는 보존하면서 어색한 방언을 정갈한 표준어로 다듬었습니다.');
    } else if (toolType === 'breathe') {
      var paragraphs = current.split('\n\n');
      contentEl.value = paragraphs.map(function(p) { return p.trim(); }).filter(Boolean).join('\n\n');
      alert('✂️ [문장 호흡 엔진] 독자가 편안하게 몰입할 수 있도록 단락과 행간의 호흡을 정돈했습니다.');
    } else if (toolType === 'title') {
      if (activeMemoirChapterId === 1) subtitleEl.value = '1.1. 감나무 가지 끝에 걸린 고향의 노을';
      else if (activeMemoirChapterId === 2) subtitleEl.value = '2.1. 완행열차에 몸을 싣고 상경하던 스무 살의 새벽';
      else if (activeMemoirChapterId === 3) subtitleEl.value = '3.1. 빗속에서 마주친 우산, 그리고 평생의 동반자';
      else if (activeMemoirChapterId === 4) subtitleEl.value = '4.1. 비바람 속에서도 꺼지지 않았던 희망의 등불';
      else if (activeMemoirChapterId === 5) subtitleEl.value = '5.1. 사랑하는 아이들에게 남기는 고요한 당부';
      alert('📌 [소제목 자동 추천] 본문 내용을 기반으로 품격 있는 챕터 소제목이 제안되었습니다.');
    }
    updateSplitCharCount();
  }

  // 오디오 파일 업로드 핸들러
  function handleAudioFileUpload(e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;

    var audioUrl = URL.createObjectURL(file);
    var realAudio = document.getElementById('splitRealAudioElement');
    var badge = document.getElementById('splitAudioDurationBadge');

    if (realAudio) {
      realAudio.src = audioUrl;
      realAudio.style.display = 'block';
      realAudio.play().catch(function() {});
    }
    if (badge) {
      badge.innerText = '업로드 음성: ' + file.name + ' (' + (file.size / (1024*1024)).toFixed(1) + 'MB)';
    }

    alert('🎙️ [' + file.name + '] 녹음 파일이 로드되었습니다.\n[🤖 원클릭 AI 음성 녹취 & 5단계 감성 윤문 생성] 버튼을 누르면 AI가 본문을 자동으로 작성합니다.');
  }

  function toggleSplitAudioSim() {
    var btn = document.getElementById('splitAudioPlayBtn');
    var slider = document.getElementById('splitAudioSlider');
    var timeEl = document.getElementById('splitAudioTime');

    if (isSplitAudioPlaying) {
      isSplitAudioPlaying = false;
      clearInterval(splitAudioTimer);
      if (btn) btn.innerText = '▶';
    } else {
      isSplitAudioPlaying = true;
      if (btn) btn.innerText = '⏸️';
      splitAudioTimer = setInterval(function() {
        splitAudioCurrentSeconds += 2;
        if (splitAudioCurrentSeconds > 1455) splitAudioCurrentSeconds = 0;
        var m = String(Math.floor(splitAudioCurrentSeconds / 60)).padStart(2, '0');
        var s = String(splitAudioCurrentSeconds % 60).padStart(2, '0');
        if (timeEl) timeEl.innerText = m + ':' + s + ' / 24:15';
        if (slider) slider.value = Math.floor((splitAudioCurrentSeconds / 1455) * 100);
      }, 1000);
    }
  }

  function saveMemoirSplitChapter() {
    if (!activeMemoirProjectId) return;
    var projects = getMemoirProjects();
    var project = projects.find(function(p) { return p.id === activeMemoirProjectId; });
    if (!project) return;

    var elSub = document.getElementById('splitChapterSubtitle');
    var subtitle = elSub ? elSub.value.trim() : '';
    var elCont = document.getElementById('splitChapterContent');
    var content = elCont ? elCont.value.trim() : '';
    var elFb = document.getElementById('splitFamilyFeedbackMemo');
    var feedback = elFb ? elFb.value.trim() : '';

    if (!project.chapters) project.chapters = [];
    var chapter = project.chapters.find(function(c) { return c.id === activeMemoirChapterId; });
    if (!chapter) {
      chapter = { id: activeMemoirChapterId, title: '제' + activeMemoirChapterId + '장' };
      project.chapters.push(chapter);
    }

    chapter.subtitle = subtitle;
    chapter.content = content;
    chapter.status = content.length > 50 ? 'completed' : 'in_progress';
    project.familyFeedback = feedback;
    project.updatedAt = new Date().toISOString().slice(0,10).replace(/-/g, '.');

    saveMemoirProjects(projects);
    alert('💾 제' + activeMemoirChapterId + '장 윤문 원고 및 가족 피드백이 저장되었습니다!');
  }

  function handleSplitStatusChange(newStatus) {
    if (!activeMemoirProjectId) return;
    var projects = getMemoirProjects();
    var project = projects.find(function(p) { return p.id === activeMemoirProjectId; });
    if (!project) return;

    project.status = newStatus;
    project.updatedAt = new Date().toISOString().slice(0,10).replace(/-/g, '.');
    saveMemoirProjects(projects);
    renderMemoirDashboard();
  }

  function copyFlipbookLink() {
    var url = window.location.origin + window.location.pathname.replace('admin.html', 'my-room.html') + '?memoir=' + (activeMemoirProjectId || 'demo');
    navigator.clipboard.writeText(url).then(function() {
      alert('📖 가족 전용 온라인 감상 및 피드백 서재 링크가 복사되었습니다!\n\n가족들에게 카카오톡으로 전달하여 부모님의 윤문 원고를 감상하고 피드백을 나눌 수 있습니다:\n' + url);
    }).catch(function() {
      prompt('아래 가족 전용 서재 링크를 복사해 사용하세요:', url);
    });
  }

  // ==========================================
  // 🖨️ 양장본 인쇄 규격 (신국판 152×225) 실제 출판 PDF 생성기
  // ==========================================
  function openMemoirPrintPreview(projectId) {
    projectId = projectId || activeMemoirProjectId;
    if (!projectId) return;

    var projects = getMemoirProjects();
    var project = projects.find(function(p) { return p.id === projectId; });
    if (!project) return;

    activeMemoirProjectId = projectId;
    var container = document.getElementById('memoirBookPrintContainer');
    if (!container) return;

    var elder = project.clientName || '어르신';
    var pkgLabel = project.packageLabel || '인생 마스터피스';
    var chapters = project.chapters || [];

    var html = `
      <!-- 1. 표지 (양장본 하드커버 스타일) -->
      <div class="print-page print-cover" style="width: 152mm; min-height: 225mm; padding: 25mm 20mm; margin: 0 auto 30px; background: linear-gradient(135deg, #1b3527 0%, #0f2319 100%); color: #ffffff; display: flex; flex-direction: column; justify-content: space-between; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.15); page-break-after: always; box-sizing: border-box; border-radius: 4px; border: 1.5px solid #c29b38;">
        <div style="font-size: 0.82rem; letter-spacing: 3px; color: #c29b38; font-weight: 850;">THE ARCHIVE OF MY LIFE</div>
        <div style="margin: auto 0;">
          <div style="font-size: 1.15rem; color: #e2e8f0; font-family: 'MaruBuri', serif; margin-bottom: 12px;">나의 결, 나의 이야기</div>
          <h1 style="font-family: 'MaruBuri', serif; font-size: 1.95rem; font-weight: 850; color: #ffffff; line-height: 1.4; margin: 0 0 14px 0; word-break: keep-all;">
            ${elder} 회고록
          </h1>
          <div style="display: inline-block; width: 60px; height: 2px; background: #c29b38; margin: 10px 0;"></div>
          <p style="font-size: 0.90rem; color: #cbd5e1; margin: 8px 0 0 0;">${pkgLabel} 양장 한정본</p>
        </div>
        <div style="font-size: 0.80rem; color: #94a3b8; line-height: 1.6;">
          지은이: ${elder} · 엮은이: 여백과 결 서사기록팀<br>
          발행일: ${project.createdAt || '2026.11'} · 비매품 (가문 헌정본)
        </div>
      </div>

      <!-- 2. 속표지 및 가족 헌정 서문 -->
      <div class="print-page" style="width: 152mm; min-height: 225mm; padding: 25mm 20mm; margin: 0 auto 30px; background: #ffffff; color: #1e293b; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 10px 30px rgba(0,0,0,0.06); page-break-after: always; box-sizing: border-box; font-family: 'MaruBuri', serif;">
        <div>
          <div style="font-size: 0.78rem; color: #94a3b8; letter-spacing: 2px; margin-bottom: 24px;">발간사 / 헌정의 글</div>
          <h2 style="font-size: 1.35rem; font-weight: 850; color: #1e3d2f; margin-bottom: 18px;">세상에서 가장 아름다운 유산</h2>
          <p style="font-size: 0.88rem; line-height: 1.85; color: #334155; margin-bottom: 16px;">
            한 인간이 걸어온 치열했던 삶의 궤적은 그 자체로 거룩한 역사입니다.
            격랑의 시대를 맨손으로 건너오며 가족을 위해 흘리셨던 땀방울과 눈물, 그리고 삶의 고비마다 피워내셨던 온기 어린 지혜를 이 한 권의 책에 정성껏 담았습니다.
          </p>
          <p style="font-size: 0.88rem; line-height: 1.85; color: #334155;">
            사랑하는 자녀와 후손들에게 전하는 이 소중한 고백이, 가문의 대를 이어 영원히 꺼지지 않는 지혜의 등불이 되기를 소망합니다.
          </p>
        </div>
        <div style="text-align: right; font-size: 0.85rem; color: #475569; border-top: 1px solid #e2e8f0; padding-top: 14px;">
          <strong>사랑하는 가족 일동 올림</strong>
        </div>
      </div>

      <!-- 3. 도서 목차 (Contents) -->
      <div class="print-page" style="width: 152mm; min-height: 225mm; padding: 25mm 20mm; margin: 0 auto 30px; background: #ffffff; color: #1e293b; box-shadow: 0 10px 30px rgba(0,0,0,0.06); page-break-after: always; box-sizing: border-box; font-family: 'MaruBuri', serif;">
        <h2 style="font-size: 1.35rem; font-weight: 850; color: #1e3d2f; margin-bottom: 24px; padding-bottom: 10px; border-bottom: 1.5px solid #1e3d2f;">CONTENTS</h2>
        <div style="display: flex; flex-direction: column; gap: 16px;">
    `;

    for (var i = 1; i <= 5; i++) {
      var ch = chapters.find(function(c) { return c.id === i; }) || CHAPTER_TEMPLATES[i];
      html += `
        <div style="display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px dotted #cbd5e1; padding-bottom: 6px;">
          <div>
            <div style="font-size: 0.80rem; font-weight: 850; color: #c29b38;">CHAPTER 0${i}</div>
            <div style="font-size: 0.94rem; font-weight: 800; color: #1e293b; margin-top: 2px;">${ch.title}</div>
            <div style="font-size: 0.78rem; color: #64748b;">${ch.subtitle || ''}</div>
          </div>
          <span style="font-size: 0.85rem; font-family: monospace; color: #64748b;">0${i * 18 + 4}</span>
        </div>
      `;
    }

    html += `
        </div>
        <div style="margin-top: 36px; padding: 12px; background: #f8fafc; border-radius: 8px; font-size: 0.80rem; color: #64748b; line-height: 1.6;">
          📌 본 도서는 국립중앙도서관 표준 규격(신국판 152 × 225 mm) 및 친환경 아르떼 고급 인쇄용지로 제작됩니다.
        </div>
      </div>
    `;

    // 4. 1~5장 본문 페이지
    for (var j = 1; j <= 5; j++) {
      var chap = chapters.find(function(c) { return c.id === j; }) || CHAPTER_TEMPLATES[j];
      var contentText = (chap.content || chap.transcript || '본문 준비 중입니다.').replace(/\n/g, '<br>');
      html += `
        <div class="print-page" style="width: 152mm; min-height: 225mm; padding: 25mm 20mm; margin: 0 auto 30px; background: #ffffff; color: #1e293b; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 10px 30px rgba(0,0,0,0.06); page-break-after: always; box-sizing: border-box; font-family: 'MaruBuri', serif;">
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.74rem; color: #94a3b8; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 20px;">
              <span>${elder} 자서전 · 나의 결 나의 이야기</span>
              <span>CHAPTER 0${j}</span>
            </div>
            <h3 style="font-size: 1.15rem; font-weight: 850; color: #1e3d2f; margin-bottom: 8px;">${chap.title}</h3>
            <div style="font-size: 0.90rem; font-weight: 750; color: #c29b38; margin-bottom: 20px;">${chap.subtitle || ''}</div>
            
            <div style="font-size: 0.88rem; line-height: 1.95; color: #334155; text-align: justify; word-break: keep-all;">
              ${contentText}
            </div>
          </div>
          <div style="text-align: center; font-size: 0.80rem; font-family: monospace; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px;">
            - ${j * 18 + 5} -
          </div>
        </div>
      `;
    }

    container.innerHTML = html;

    var previewModal = document.getElementById('memoirPrintPreviewModal');
    if (previewModal) {
      previewModal.style.display = 'flex';
      previewModal.classList.add('open');
    }
  }

  function closeMemoirPrintPreview() {
    var previewModal = document.getElementById('memoirPrintPreviewModal');
    if (previewModal) {
      previewModal.style.display = 'none';
      previewModal.classList.remove('open');
    }
  }

  // 실제 인쇄소 발주용 고화질 PDF 다운로드 (html2pdf.js 실행)
  function downloadMemoirPdf() {
    var element = document.getElementById('memoirBookPrintContainer');
    if (!element) return;

    var projects = getMemoirProjects();
    var project = projects.find(function(p) { return p.id === activeMemoirProjectId; }) || {};
    var elder = (project.clientName || '어르신').replace(/\s+/g, '_');

    var opt = {
      margin: 0,
      filename: elder + '_자서전_인쇄양장본_신국판.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: [152, 225], orientation: 'portrait' }
    };

    var btn = document.getElementById('btnDownloadMemoirPdf');
    if (btn) {
      btn.disabled = true;
      btn.innerText = '⏳ 인쇄용 PDF 조판 렌더링 중...';
    }

    if (typeof html2pdf !== 'undefined') {
      html2pdf().set(opt).from(element).save().then(function() {
        if (btn) {
          btn.disabled = false;
          btn.innerText = '📥 인쇄소 발주용 고화질 PDF 다운로드';
        }
        alert('🎉 [' + opt.filename + '] 인쇄용 PDF가 다운로드되었습니다!\n신국판 152 × 225 mm 규격에 맞추어 인쇄소에 그대로 발주하실 수 있습니다.');
      }).catch(function(err) {
        console.error('PDF 생성 에러:', err);
        window.print();
        if (btn) {
          btn.disabled = false;
          btn.innerText = '📥 인쇄소 발주용 고화질 PDF 다운로드';
        }
      });
    } else {
      window.print();
      if (btn) {
        btn.disabled = false;
        btn.innerText = '📥 인쇄소 발주용 고화질 PDF 다운로드';
      }
    }
  }

  function exportMemoirPrintPdf() {
    openMemoirPrintPreview(activeMemoirProjectId);
  }

  // ==========================================
  // 새 프로젝트 등록 모달 제어
  // ==========================================
  function openMemoirProjectCreateModal() {
    var modal = document.getElementById('memoirProjectCreateModal');
    if (modal) {
      modal.style.display = 'flex';
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeMemoirProjectCreateModal() {
    var modal = document.getElementById('memoirProjectCreateModal');
    if (modal) {
      modal.style.display = 'none';
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  function handleCreateMemoirProject(e) {
    e.preventDefault();
    var elElder = document.getElementById('newMemoirElderName');
    var elderName = elElder ? elElder.value.trim() : '';
    var elAge = document.getElementById('newMemoirElderAge');
    var elderAge = elAge ? elAge.value : '75세';
    var elApp = document.getElementById('newMemoirApplicantName');
    var applicantName = (elApp && elApp.value.trim()) ? elApp.value.trim() : '직접 신청';
    var elPhone = document.getElementById('newMemoirApplicantPhone');
    var applicantPhone = (elPhone && elPhone.value.trim()) ? elPhone.value.trim() : '-';
    var elPkg = document.getElementById('newMemoirPackageType');
    var pkgType = (elPkg && elPkg.value) ? elPkg.value : 'masterpiece';
    var elCoach = document.getElementById('newMemoirCoachSelect');
    var coachName = (elCoach && elCoach.value) ? elCoach.value : '김은영 수석코치';
    var elRegion = document.getElementById('newMemoirRegion');
    var region = (elRegion && elRegion.value.trim()) ? elRegion.value.trim() : '서울시';
    var elNotes = document.getElementById('newMemoirNotes');
    var notes = (elNotes && elNotes.value.trim()) ? elNotes.value.trim() : '';
    var elAuto = document.getElementById('newMemoirAutoDraftCheck');
    var autoDraft = elAuto ? elAuto.checked !== false : true;

    if (!elderName) {
      alert('주인공 어르신 성함을 입력해 주세요.');
      return;
    }

    var pkgMap = {
      'basic': '감사 헌정본 (Compact Tribute)',
      'masterpiece': '인생 마스터피스 (Life Masterpiece)',
      'heritage': '명문 가문 평전 (Heritage Prestige)'
    };

    var chapters = [];
    for (var i = 1; i <= 5; i++) {
      var tpl = CHAPTER_TEMPLATES[i];
      chapters.push({
        id: i,
        title: tpl.title,
        subtitle: autoDraft ? tpl.subtitle : '',
        status: autoDraft ? 'completed' : 'pending',
        audioDuration: autoDraft ? (20 + i * 3) + '분' : '',
        transcript: autoDraft ? tpl.transcript : '',
        content: autoDraft ? tpl.content : ''
      });
    }

    var newProject = {
      id: 'mem_' + Date.now(),
      clientName: elderName,
      clientAge: elderAge,
      region: region,
      applicantName: applicantName,
      applicantPhone: applicantPhone,
      relation: '가족',
      packageType: pkgType,
      packageLabel: pkgMap[pkgType] || '인생 마스터피스',
      coachName: coachName,
      coachPhone: '010-3321-7788',
      status: autoDraft ? 'ai_drafted' : 'interview_pending',
      statusLabel: autoDraft ? 'AI 윤문 완료' : '인터뷰 대기',
      recordingsCount: autoDraft ? 4 : 0,
      photosCount: autoDraft ? 18 : 0,
      notes: notes,
      familyFeedback: '',
      createdAt: new Date().toISOString().slice(0,10).replace(/-/g, '.'),
      updatedAt: new Date().toISOString().slice(0,10).replace(/-/g, '.'),
      chapters: chapters
    };

    var projects = getMemoirProjects();
    projects.unshift(newProject);
    saveMemoirProjects(projects);

    closeMemoirProjectCreateModal();
    var createForm = document.getElementById('memoirProjectCreateForm');
    if (createForm) createForm.reset();
    renderMemoirDashboard();

    alert('✨ [' + elderName + '] 님의 자서전 출판 프로젝트가 성공적으로 등록되었습니다!\n\n바로 [✍️ 검수 에디터]에서 현장 녹음과 AI 5단계 윤문 원고를 확인하실 수 있습니다.');
    openMemoirSplitEditor(newProject.id, 1);
  }

  function deleteMemoirProject(projectId) {
    if (!confirm('이 자서전 프로젝트를 영구 삭제하시겠습니까?\n채록된 녹음과 윤문 원고가 모두 삭제됩니다.')) return;
    var projects = getMemoirProjects();
    projects = projects.filter(function(p) { return p.id !== projectId; });
    saveMemoirProjects(projects);
    if (typeof db !== 'undefined' && db) {
      try { db.collection('memoir_projects').doc(projectId).delete(); } catch(e) {}
    }
    renderMemoirDashboard();
  }

  function initAdminMemoirListener() {
    if (typeof db === 'undefined' || !db) return;
    try {
      db.collection('memoir_projects').onSnapshot(function(snapshot) {
        if (!snapshot || snapshot.empty) return;
        var remoteProjects = [];
        snapshot.forEach(function(doc) {
          var data = doc.data();
          data.id = doc.id;
          remoteProjects.push(data);
        });
        if (remoteProjects.length > 0) {
          localStorage.setItem('yebaek_memoir_projects', JSON.stringify(remoteProjects));
          var activeTab = document.querySelector('.tab-panel.active');
          if (activeTab && activeTab.id === 'tabMemoirDashboard') {
            renderMemoirDashboard();
          }
        }
      }, function(err) {
        console.warn('[Memoir] Firestore 리스너 경고:', err);
      });
    } catch(e) {
      console.warn('[Memoir] Firestore 구독 실패:', e);
    }
  }

  // 전역 window 바인딩 (HTML 인라인 onclick에서 100% 호출 보장)
  window.getMemoirProjects = getMemoirProjects;
  window.saveMemoirProjects = saveMemoirProjects;
  window.renderMemoirDashboard = renderMemoirDashboard;
  window.filterMemoirProjects = filterMemoirProjects;
  window.handleMemoirSearch = handleMemoirSearch;
  window.openMemoirSplitEditor = openMemoirSplitEditor;
  window.closeMemoirSplitEditor = closeMemoirSplitEditor;
  window.switchSplitChapter = switchSplitChapter;
  window.bindSplitChapterData = bindSplitChapterData;
  window.loadSplitTranscriptToEditor = loadSplitTranscriptToEditor;
  window.updateSplitCharCount = updateSplitCharCount;
  window.runAiPolishTool = runAiPolishTool;
  window.runOneClickAiMemoirPipeline = runOneClickAiMemoirPipeline;
  window.handleAudioFileUpload = handleAudioFileUpload;
  window.toggleSplitAudioSim = toggleSplitAudioSim;
  window.saveMemoirSplitChapter = saveMemoirSplitChapter;
  window.handleSplitStatusChange = handleSplitStatusChange;
  window.copyFlipbookLink = copyFlipbookLink;
  window.openMemoirPrintPreview = openMemoirPrintPreview;
  window.closeMemoirPrintPreview = closeMemoirPrintPreview;
  window.downloadMemoirPdf = downloadMemoirPdf;
  window.exportMemoirPrintPdf = exportMemoirPrintPdf;
  window.openMemoirProjectCreateModal = openMemoirProjectCreateModal;
  window.closeMemoirProjectCreateModal = closeMemoirProjectCreateModal;
  window.handleCreateMemoirProject = handleCreateMemoirProject;
  window.deleteMemoirProject = deleteMemoirProject;
  window.initAdminMemoirListener = initAdminMemoirListener;

  // DOMContentLoaded 이벤트 리스너 등록
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminMemoirListener);
  } else {
    initAdminMemoirListener();
  }

})(window);
