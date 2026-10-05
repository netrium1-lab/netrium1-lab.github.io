@echo off
cd /d "%~dp0"
echo ===================================================
echo   [여백과 결] 클라우드 동기화 및 깃허브 배포 자동화
echo ===================================================
echo.

echo [1/2] Firestore 칼럼 동기화, 이미지 추출 및 카톡 OG 공유 페이지 자동 생성 중...
powershell -ExecutionPolicy Bypass -File "%~dp0tools\sync_and_generate_og.ps1"
echo.

echo [2/2] 깃허브(GitHub Pages) 실시간 배포 시작...
git add -A
git commit -m "update"
git push origin main
git push origin master
git push

echo.
echo ===================================================
echo   배포가 성공적으로 완료되었습니다! 창을 닫으셔도 됩니다.
echo ===================================================
echo.
pause
