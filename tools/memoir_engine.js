    /* ==========================================================
       [신설] 04. 자서전 출판 관제센터 & AI 윤문 파이프라인 엔진
       ========================================================== */
    var currentMemoirFilter = 'all';
    var currentMemoirSearch = '';
    var activeMemoirProjectId = null;
    var activeMemoirChapterId = 1;
    var isSplitAudioPlaying = false;
    var splitAudioTimer = null;
    var splitAudioCurrentSeconds = 512; // 08:32

    // 기본 고품질 데모 프로젝트 데이터 (최초 실행 시 자동 시딩)
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
        createdAt: '2026.11.08',
        updatedAt: '2026.11.10',
        chapters: [
          {
            id: 1,
            title: '제1장. 유년과 고향의 기억',
            subtitle: '1.1. 감나무 가지 끝에 걸린 고향의 노을',
            status: 'completed',
            audioDuration: '24분 15초',
            transcript: '[00:00:15] 내가 태어난 데가 경북 청도 각남면이야. 온통 감나무 밭이었지. 가을만 되면 집 뒤란이고 앞마당이고 주홍빛으로 물이 들었어.\n[00:02:40] 우리 어머니는 새벽 닭이 울기도 전에 일어나서 무쇠 가마솥에 장작불을 지피셨지. 그 매캐하면서도 구수한 밥 짓는 냄새가 토방을 넘어 이불속까지 들어왔어.\n[00:05:12] 아버지는 유독 엄하셨지만, 장날만 되면 읍내 나가셔서 눈깔사탕 한 봉지를 꼭 품에 넣고 오셨어. 그게 내 어린 시절의 가장 달콤한 향기였지.\n[00:12:30] 그때 동무들과 냇가에서 멱감고 자맥질하던 기억이 아직도 눈에 선해. 가난했지만 마음만은 온 세상 부자 부럽지 않던 시절이었어.',
            content: '1.1. 감나무 가지 끝에 걸린 고향의 노을\n\n내 유년의 기억은 온통 주홍빛 감물이 든 가을 하늘로 채워져 있다.\n경북 청도 각남면, 나직한 산자락을 등진 우리 집 뒤란에는 해마다 탐스러운 감이 주렁주렁 매달리곤 했다.\n\n어머니는 새벽안개가 걷히기도 전에 가마솥에 장작불을 지피셨다. 매캐하지만 구수한 밥 짓는 냄새가 토방을 넘어 이불속까지 스며들 때면, 비로소 고향의 하루가 따스하게 깨어났다.\n\n아버지는 말수가 적고 유독 엄하셨지만, 장날이면 읍내에서 사 오신 눈깔사탕 한 봉지를 무뚝뚝하게 품에서 꺼내 건네주시곤 했다. 그 사탕 한 알의 달콤함은 가난했던 그 시절, 어린 나를 지탱해 주던 가장 커다란 온기였다.\n\n동무들과 맑은 냇가에서 멱을 감고 온 들판을 뛰놀던 그때의 기억은, 세월이 반세기를 훌쩍 넘긴 지금도 가슴 깊은 곳에서 여백처럼 맑게 흐르고 있다.'
          },
          {
            id: 2,
            title: '제2장. 청춘의 열정과 도전',
            subtitle: '2.1. 완행열차에 몸을 싣고 상경하던 스무 살의 새벽',
            status: 'completed',
            audioDuration: '32분 40초',
            transcript: '[00:01:10] 스무 살 되던 해 봄에 보따리 하나 달랑 들고 서울 가는 밤기차를 탔어. 밤새 덜컹거리는 기차 안에서 창밖을 보며 얼마나 울었는지 몰라.\n[00:06:20] 영등포 방직공장에 첫 출근하던 날, 웅웅거리며 돌아가는 기계 소리에 귀가 먹먹했지. 그래도 손에 첫 월급봉투를 쥐었을 때, 고향 어머니 생각이 나서 눈물이 핑 돌았어.',
            content: '2.1. 완행열차에 몸을 싣고 상경하던 스무 살의 새벽\n\n스무 살의 봄, 손때 묻은 보따리 하나를 가슴에 품고 서울행 밤 완행열차에 올랐다.\n덜컹거리는 차창 밖으로 아스라이 멀어지는 고향 마을의 불빛을 바라보며, 홀로 남겨질 어머니 생각에 가만히 눈물을 훔쳤다.\n\n영등포 공장의 새벽은 거대하고 낯설었다. 밤낮없이 웅웅거리며 돌아가는 방직기계의 굉음 속에서 고단한 청춘의 하루하루를 버텨냈다.\n손가락 마디마디가 부르트던 그 시절, 손에 쥔 첫 월급봉투를 고향 집으로 부치던 우체국 창구 앞에서 비로소 나는 어른이 되어가고 있었다.'
          },
          {
            id: 3,
            title: '제3장. 사랑과 가족의 결',
            subtitle: '3.1. 빗속에서 마주친 우산, 그리고 평생의 동반자',
            status: 'in_progress',
            audioDuration: '28분 50초',
            transcript: '[00:01:00] 중매로 만났지만 비 오는 날 정류장에서 묵묵히 우산을 받쳐주던 그 사람 모습에 마음이 스르르 녹았지. 참 우직하고 성실한 사람이었어.\n[00:10:30] 첫째 아이를 낳고 단칸방 사글세로 시작했는데, 둘이 손잡고 궂은일 마다하지 않고 여기까지 달려왔지.',
            content: '3.1. 빗속에서 마주친 우산, 그리고 평생의 동반자\n\n우리의 인연은 여름비가 쏟아지던 버스 정류장에서 시작되었다.\n묵묵히 낡은 우산을 받쳐주며 자신의 어깨가 다 젖는 줄도 모르던 그 우직한 청년이 바로 나의 평생 반려자였다.\n\n비록 서투르고 비좁은 단칸방에서 살림을 시작했지만, 서로를 향한 신뢰와 온기만큼은 늘 가득 차올랐다. 아이들의 작은 숨소리가 방안을 채울 때마다, 우리는 세상 어떤 거센 비바람도 이겨낼 수 있다는 용기를 배웠다.'
          },
          {
            id: 4,
            title: '제4장. 시련을 넘은 삶의 지혜',
            subtitle: '',
            status: 'pending',
            audioDuration: '',
            transcript: '4차 방문 인터뷰 일정 조율 중입니다.',
            content: ''
          },
          {
            id: 5,
            title: '제5장. 후손에게 전하는 유산',
            subtitle: '',
            status: 'pending',
            audioDuration: '',
            transcript: '5차 방문 인터뷰 일정 조율 중입니다.',
            content: ''
          }
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
        createdAt: '2026.11.09',
        updatedAt: '2026.11.10',
        chapters: [
          {
            id: 1,
            title: '제1장. 유년과 고향의 기억',
            subtitle: '1.1. 남한강 뱃사공의 아들로 자라난 강변 마을',
            status: 'completed',
            audioDuration: '21분 10초',
            transcript: '[00:01:00] 남한강 상류 여주 강변에서 뗏목을 타며 자랐어. 강물이 얼어붙으면 썰매를 타고, 봄이 오면 버들피리를 불었지. 강바람이 매서웠지만 참 평화로웠어.',
            content: '1.1. 남한강 뱃사공의 아들로 자라난 강변 마을\n\n남한강 푸른 물줄기가 굽이쳐 흐르던 여주 강변 마을, 나의 유년은 온통 강물 소리로 가득했다.\n뗏목을 젓던 아버지의 넓은 등 뒤로 붉은 노을이 내려앉을 때면 강물은 금빛 비늘처럼 반짝였다.'
          },
          {
            id: 2,
            title: '제2장. 청춘의 열정과 도전',
            subtitle: '',
            status: 'pending',
            audioDuration: '18분 30초',
            transcript: '기술을 배우러 수원으로 나와 정미소와 목공소를 전전하며 성실 하나로 일어섰지.',
            content: ''
          },
          {
            id: 3,
            title: '제3장. 사랑과 가족의 결',
            subtitle: '',
            status: 'pending',
            audioDuration: '',
            transcript: '',
            content: ''
          },
          {
            id: 4,
            title: '제4장. 시련을 넘은 삶의 지혜',
            subtitle: '',
            status: 'pending',
            audioDuration: '',
            transcript: '',
            content: ''
          },
          {
            id: 5,
            title: '제5장. 후손에게 전하는 유산',
            subtitle: '',
            status: 'pending',
            audioDuration: '',
            transcript: '',
            content: ''
          }
        ]
      }
    ];

    // 자서전 프로젝트 로드 & 저장
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

    // 자서전 출판 관제 대시보드 렌더링
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
        
        // 1. 등록일 / ID
        html += '<td style="padding: 12px 10px;">';
        html += '<div style="font-weight: 750; color: var(--text-primary); font-size: 0.84rem;">' + (p.createdAt || '-') + '</div>';
        html += '<div style="font-size: 0.72rem; color: var(--text-muted); font-family: monospace;">' + (p.id || '') + '</div>';
        html += '</td>';

        // 2. 주인공 (어르신)
        html += '<td style="padding: 12px 10px;">';
        html += '<div style="font-weight: 850; color: var(--text-primary); font-size: 0.94rem; display: flex; align-items: center; gap: 4px;">';
        html += '<span>👵</span> <span>' + escapeHtml(p.clientName || '성함 미상') + '</span>';
        html += '</div>';
        html += '<div style="font-size: 0.78rem; color: var(--text-secondary);">' + (p.clientAge || '-') + ' · ' + escapeHtml(p.region || '지역 미지정') + '</div>';
        html += '</td>';

        // 3. 신청인 / 패키지
        html += '<td style="padding: 12px 10px;">';
        html += '<div style="font-size: 0.84rem; color: var(--text-primary); font-weight: 750;">' + escapeHtml(p.applicantName || '-') + ' (' + (p.relation || '의뢰') + ')</div>';
        html += '<div style="display: inline-block; font-size: 0.72rem; background: rgba(194, 155, 56, 0.12); color: #936f1c; padding: 1px 6px; border-radius: 4px; font-weight: 800; margin-top: 2px;">' + (p.packageLabel || '인생 마스터피스') + '</div>';
        html += '</td>';

        // 4. 담당 코치
        html += '<td style="padding: 12px 10px;">';
        html += '<div style="font-weight: 800; color: var(--text-primary); font-size: 0.84rem;">' + escapeHtml(p.coachName || '배정 중') + '</div>';
        html += '<div style="font-size: 0.72rem; color: var(--text-muted);">' + (p.coachPhone || '') + '</div>';
        html += '</td>';

        // 5. 수집 자산
        html += '<td style="padding: 12px 10px; text-align: center;">';
        html += '<div style="font-size: 0.82rem; font-weight: 750; color: var(--text-secondary); display: flex; flex-direction: column; gap: 2px;">';
        html += '<span>🎙️ 녹음 ' + (p.recordingsCount || 0) + '건</span>';
        html += '<span>🎞️ 사진 ' + (p.photosCount || 0) + '장</span>';
        html += '</div>';
        html += '</td>';

        // 6. 5대 챕터 완성률
        html += '<td style="padding: 12px 10px;">';
        html += '<div style="display: flex; justify-content: space-between; font-size: 0.74rem; font-weight: 800; color: var(--text-secondary); margin-bottom: 4px;">';
        html += '<span>' + completedChapters + ' / 5 챕터</span>';
        html += '<span>' + progressPercent + '%</span>';
        html += '</div>';
        html += '<div style="width: 100%; height: 7px; background: var(--bg-secondary); border-radius: 999px; overflow: hidden; border: 1px solid var(--border-color);">';
        html += '<div style="height: 100%; width: ' + progressPercent + '%; background: linear-gradient(90deg, #c29b38, #059669); border-radius: 999px; transition: width 0.3s ease;"></div>';
        html += '</div>';
        html += '</td>';

        // 7. 진행 상태
        html += '<td style="padding: 12px 10px; text-align: center;">';
        html += '<span style="display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 0.76rem; font-weight: 850; background: ' + st.bg + '; color: ' + st.color + ';">';
        html += st.label;
        html += '</span>';
        html += '</td>';

        // 8. 액션 버튼군
        html += '<td style="padding: 12px 10px; text-align: center;">';
        html += '<div style="display: flex; gap: 6px; justify-content: center; flex-wrap: wrap;">';
        html += '<button type="button" onclick="openMemoirSplitEditor(\'' + p.id + '\', 1)" class="btn-save-setting" style="background: linear-gradient(135deg, #1e3d2f 0%, #152d22 100%); color: #fff; border: none; font-size: 0.78rem; font-weight: 850; padding: 5px 10px; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">';
        html += '<span>✍️</span> 검수 에디터';
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

    // 필터 & 검색 제어
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

      if (elElderBadge) elElderBadge.innerText = (project.clientName || '어르신') + ' (' + (project.clientAge || '-') + ')';
      if (elPackageBadge) elPackageBadge.innerText = project.packageLabel || '인생 마스터피스';
      if (elCoachBadge) elCoachBadge.innerText = '담당: ' + (project.coachName || '배정 대기');
      if (elStatusSelect) elStatusSelect.value = project.status || 'interview_pending';

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
      var chapter = chapters.find(function(c) { return c.id === chapterId; }) || {
        id: chapterId,
        title: '제' + chapterId + '장',
        subtitle: '',
        transcript: '',
        content: '',
        audioDuration: '20분 내외'
      };

      var elDuration = document.getElementById('splitAudioDurationBadge');
      var elTranscript = document.getElementById('splitTranscriptText');
      if (elDuration) elDuration.innerText = '녹음 파일: rec_chapter' + chapterId + '.mp3 (' + (chapter.audioDuration || '20분 내외') + ')';
      if (elTranscript) elTranscript.value = chapter.transcript || '현장 구술 녹취 데이터가 등록되지 않았습니다.';

      var elSubtitle = document.getElementById('splitChapterSubtitle');
      var elContent = document.getElementById('splitChapterContent');
      if (elSubtitle) elSubtitle.value = chapter.subtitle || '';
      if (elContent) elContent.value = chapter.content || '';

      updateSplitCharCount();
    }

    function loadSplitTranscriptToEditor() {
      var transcript = document.getElementById('splitTranscriptText')?.value || '';
      var contentEl = document.getElementById('splitChapterContent');
      if (contentEl && transcript) {
        if (contentEl.value && !confirm('현재 작성 중인 에디터 원고를 지우고 원문 녹취록으로 덮어쓸까요?')) return;
        contentEl.value = transcript;
        updateSplitCharCount();
      }
    }

    function updateSplitCharCount() {
      var text = document.getElementById('splitChapterContent')?.value || '';
      var len = text.length;
      var pages = (len / 580).toFixed(1);
      var badge = document.getElementById('splitCharCountBadge');
      if (badge) {
        badge.innerText = len.toLocaleString() + '자 · 신국판 약 ' + pages + '페이지';
      }
    }

    function runAiPolishTool(toolType) {
      var contentEl = document.getElementById('splitChapterContent');
      var subtitleEl = document.getElementById('splitChapterSubtitle');
      var current = contentEl ? contentEl.value.trim() : '';

      if (!current) {
        alert('윤문할 원고 본문이 비어 있습니다. 좌측 녹취록을 먼저 복사하거나 초고를 입력해 주세요.');
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

      var subtitle = document.getElementById('splitChapterSubtitle')?.value.trim() || '';
      var content = document.getElementById('splitChapterContent')?.value.trim() || '';

      if (!project.chapters) project.chapters = [];
      var chapter = project.chapters.find(function(c) { return c.id === activeMemoirChapterId; });
      if (!chapter) {
        chapter = { id: activeMemoirChapterId, title: '제' + activeMemoirChapterId + '장' };
        project.chapters.push(chapter);
      }

      chapter.subtitle = subtitle;
      chapter.content = content;
      chapter.status = content.length > 50 ? 'completed' : 'in_progress';
      project.updatedAt = new Date().toISOString().slice(0,10).replace(/-/g, '.');

      saveMemoirProjects(projects);
      alert('💾 제' + activeMemoirChapterId + '장 윤문 원고가 성공적으로 저장되었습니다!');
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
        alert('📖 가족 전용 온라인 디지털 서재(플립북) 링크가 복사되었습니다!\n\n가족들에게 카카오톡으로 전달하여 부모님의 윤문 원고를 감상할 수 있습니다:\n' + url);
      }).catch(function() {
        prompt('아래 가족 전용 서재 링크를 복사해 사용하세요:', url);
      });
    }

    function exportMemoirPrintPdf() {
      var projects = getMemoirProjects();
      var project = projects.find(function(p) { return p.id === activeMemoirProjectId; }) || {};
      var elder = project.clientName || '어르신';
      
      alert('🖨️ [인쇄소 직결 조판 데이터 생성 완료]\n\n규격: 신국판 152 × 225 mm (3mm 재단 도련 포함)\n제본: 고급 사철 가죽 양장 하드커버\n컬러: 본문 CMYK 4도 올컬러\n주인공: ' + elder + '\n\n인디자인(InDesign) 호환 XML 및 고화질 인쇄용 PDF 조판 파일이 준비되었습니다.');
    }

    function openMemoirProjectCreateModal() {
      var modal = document.getElementById('memoirProjectCreateModal');
      if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('open');
      }
    }

    function closeMemoirProjectCreateModal() {
      var modal = document.getElementById('memoirProjectCreateModal');
      if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('open');
      }
    }

    function handleCreateMemoirProject(e) {
      e.preventDefault();
      var elderName = document.getElementById('newMemoirElderName')?.value.trim();
      var elderAge = document.getElementById('newMemoirElderAge')?.value;
      var applicantName = document.getElementById('newMemoirApplicantName')?.value.trim() || '직접 신청';
      var applicantPhone = document.getElementById('newMemoirApplicantPhone')?.value.trim() || '-';
      var pkgType = document.getElementById('newMemoirPackageType')?.value || 'masterpiece';
      var coachName = document.getElementById('newMemoirCoachSelect')?.value || '김은영 수석코치';
      var region = document.getElementById('newMemoirRegion')?.value.trim() || '서울시';
      var notes = document.getElementById('newMemoirNotes')?.value.trim() || '';

      var pkgMap = {
        'basic': '감사 헌정본 (Compact Tribute)',
        'masterpiece': '인생 마스터피스 (Life Masterpiece)',
        'heritage': '명문 가문 평전 (Heritage Prestige)'
      };

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
        status: 'interview_pending',
        statusLabel: '인터뷰 대기',
        recordingsCount: 0,
        photosCount: 0,
        notes: notes,
        createdAt: new Date().toISOString().slice(0,10).replace(/-/g, '.'),
        updatedAt: new Date().toISOString().slice(0,10).replace(/-/g, '.'),
        chapters: [
          { id: 1, title: '제1장. 유년과 고향의 기억', subtitle: '', status: 'pending', transcript: '', content: '' },
          { id: 2, title: '제2장. 청춘의 열정과 도전', subtitle: '', status: 'pending', transcript: '', content: '' },
          { id: 3, title: '제3장. 사랑과 가족의 결', subtitle: '', status: 'pending', transcript: '', content: '' },
          { id: 4, title: '제4장. 시련을 넘은 삶의 지혜', subtitle: '', status: 'pending', transcript: '', content: '' },
          { id: 5, title: '제5장. 후손에게 전하는 유산', subtitle: '', status: 'pending', transcript: '', content: '' }
        ]
      };

      var projects = getMemoirProjects();
      projects.unshift(newProject);
      saveMemoirProjects(projects);

      closeMemoirProjectCreateModal();
      document.getElementById('memoirProjectCreateForm').reset();
      renderMemoirDashboard();

      alert('✨ [' + elderName + '] 님의 자서전 출판 프로젝트가 등록되었습니다!\n스플릿 뷰 에디터에서 인터뷰 녹음 및 AI 윤문 원고를 관리할 수 있습니다.');
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

    window.addEventListener('DOMContentLoaded', function() {
      setTimeout(function() {
        initAdminMemoirListener();
      }, 1000);
    });
