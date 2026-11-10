@echo off
@chcp 65001 >nul
cd /d "%~dp0"
title [여백과 결] 데스크탑 / 노트북 실시간 연동 및 GitHub Pages 원클릭 배포
cls
echo =========================================================================
echo   🌿 [여백과 결] 데스크탑 / 노트북 실시간 연동 및 GitHub Pages 자동 배포
echo =========================================================================
echo.

:: 1. Git 실행 파일 경로 자동 탐지 (노트북/데스크탑 환경 무관)
where git >nul 2>nul
if %errorlevel% neq 0 (
    if exist "C:\Program Files\Git\cmd\git.exe" set "PATH=%PATH%;C:\Program Files\Git\cmd"
    if exist "C:\Program Files\Git\bin\git.exe" set "PATH=%PATH%;C:\Program Files\Git\bin"
    if exist "C:\Program Files (x86)\Git\cmd\git.exe" set "PATH=%PATH%;C:\Program Files (x86)\Git\cmd"
    if exist "%LOCALAPPDATA%\Programs\Git\cmd\git.exe" set "PATH=%PATH%;%LOCALAPPDATA%\Programs\Git\cmd"
    if exist "%USERPROFILE%\AppData\Local\Programs\Git\cmd\git.exe" set "PATH=%PATH%;%USERPROFILE%\AppData\Local\Programs\Git\cmd"
    if exist "%USERPROFILE%\scoop\shims\git.exe" set "PATH=%PATH%;%USERPROFILE%\scoop\shims"
)

where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [경고] Git 실행 파일(git.exe)을 찾을 수 없습니다.
    echo Git이 설치되어 있는지 확인해 주세요: https://git-scm.com/
    pause
    exit /b 1
)

echo [1/4] 🔄 다른 기기(노트북/컴퓨터)에서 작업한 최신 변경 사항 확인 및 동기화 중...
git pull --rebase origin main
echo.

echo [2/4] ☁️ Firestore 클라우드 칼럼 동기화 & 카톡 OG 공유 페이지 자동 생성 중...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\sync_and_generate_og.ps1"
echo.

echo [3/4] 📦 변경 사항 정리 및 로컬 커밋 생성 중...
git add -A
git diff-index --quiet HEAD --
if %errorlevel% neq 0 (
    git commit -m "sync: 데스크탑/노트북 연동 자동 동기화 배포 (%date% %time%)"
) else (
    echo 최신 변경 사항이 이미 커밋되어 있습니다.
)
echo.

echo [4/4] 🚀 GitHub Pages (https://netrium1-lab.github.io/) 실시간 배포 중...
git push origin main
if %errorlevel% neq 0 (
    echo [재시도] 기본 브랜치로 푸시 재시도 중...
    git push origin master
    git push
)

echo.
echo =========================================================================
echo   🎉 축하합니다! 데스크탑과 노트북의 모든 작업 내용이 성공적으로 동기화되고
echo   인터넷 라이브 사이트(GitHub Pages)에 배포 완료되었습니다!
echo   (이 창을 닫으셔도 좋습니다.)
echo =========================================================================
echo.
pause
