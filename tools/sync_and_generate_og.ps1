# PowerShell script to sync Firestore articles, extract base64 images, and generate static OG pages in articles/
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$baseDir = Split-Path -Parent $PSScriptRoot
if (-not $baseDir) { $baseDir = Get-Location }

$articlesDir = Join-Path $baseDir "articles"
$imagesDir = Join-Path $baseDir "images"
$articlesJsonPath = Join-Path $baseDir "articles.json"

if (-not (Test-Path $articlesDir)) { New-Item -ItemType Directory -Path $articlesDir | Out-Null }
if (-not (Test-Path $imagesDir)) { New-Item -ItemType Directory -Path $imagesDir | Out-Null }

Write-Host "Fetching articles from Firestore..."
$apiUrl = "https://firestore.googleapis.com/v1/projects/yebaek-bfa2c/databases/(default)/documents/articles"
$res = Invoke-RestMethod -Uri $apiUrl -Method Get

$articles = @()

foreach ($doc in $res.documents) {
    $id = $doc.name.Split('/')[-1]
    $fields = $doc.fields

    $title = ""
    if ($fields.title) { $title = $fields.title.stringValue }

    $category = "웰라이프"
    if ($fields.category) { $category = $fields.category.stringValue }

    $image = ""
    if ($fields.image) { $image = $fields.image.stringValue }

    $excerpt = ""
    if ($fields.excerpt) { $excerpt = $fields.excerpt.stringValue }

    $content = ""
    if ($fields.content) { $content = $fields.content.stringValue }

    $readTime = "읽는 시간 5분"
    if ($fields.readTime) { $readTime = $fields.readTime.stringValue }

    $date = "2026.10.05"
    if ($fields.date) { $date = $fields.date.stringValue }

    $isFeatured = $false
    if ($fields.isFeatured) { $isFeatured = [bool]$fields.isFeatured.booleanValue }

    # If image is base64, save to images folder and convert to public URL
    if ($image -match '^data:image\/([a-zA-Z0-9]+);base64,(.+)$') {
        $ext = $Matches[1].ToLower()
        if ($ext -eq "jpeg") { $ext = "jpg" }
        $imgFileName = "article_${id}_thumb.${ext}"
        $diskPath = Join-Path $imagesDir $imgFileName
        $imgBytes = [Convert]::FromBase64String($Matches[2])
        [IO.File]::WriteAllBytes($diskPath, $imgBytes)
        $publicUrl = "https://netrium1-lab.github.io/images/$imgFileName"
        $image = $publicUrl

        # Also patch Firestore
        try {
            $patchUrl = "$apiUrl/$id`?updateMask.fieldPaths=image"
            $patchBody = @{
                fields = @{
                    image = @{ stringValue = $publicUrl }
                }
            } | ConvertTo-Json -Depth 5
            Invoke-RestMethod -Uri $patchUrl -Method Patch -Body $patchBody -ContentType 'application/json; charset=utf-8' | Out-Null
            Write-Host "Converted base64 image for $id -> $publicUrl"
        } catch {
            Write-Host "Warning: could not update Firestore image for $id"
        }
    }

    $artObj = [ordered]@{
        id = $id
        aliasIds = @()
        title = $title
        category = $category
        image = $image
        excerpt = $excerpt
        content = $content
        readTime = $readTime
        date = $date
        isFeatured = $isFeatured
    }
    $articles += [PSCustomObject]$artObj
}

# Desired display order
$priorityOrder = @('mag_1791210612447', 'mag_1791111944097', 'mag_couple_dialogue_best', 'mag_filial_memoir', 'mag_4', 'mag_3', 'mag_1')
$sorted = $articles | Sort-Object {
    $idx = $priorityOrder.IndexOf($_.id)
    if ($idx -ge 0) { $idx } else { 99 }
}

# Alias mapping for top article
$lead = $sorted | Where-Object { $_.id -eq 'mag_1791210612447' }
if ($lead) {
    $lead.aliasIds = @('mag_1791208879438', 'mag_1791200706701', 'mag_1791208784105', 'mag_care_beauty_reset')
    $lead.isFeatured = $true
}

# Save articles.json
$json = $sorted | ConvertTo-Json -Depth 10
[IO.File]::WriteAllText($articlesJsonPath, $json, [System.Text.Encoding]::UTF8)
Write-Host "Saved articles.json with $($sorted.Count) articles."

# Generate static OG HTML pages in articles/
foreach ($art in $sorted) {
    $artId = $art.id
    $artTitle = $art.title
    $artDesc = $art.excerpt
    if (-not $artDesc) { $artDesc = $artTitle }
    # Clean excerpt for html attribute
    $cleanDesc = $artDesc -replace '"', '&quot;' -replace '<[^>]+>', ''
    $cleanTitle = $artTitle -replace '"', '&quot;' -replace '<[^>]+>', ''
    
    $ogImg = $art.image
    if (-not $ogImg -or $ogImg.StartsWith("data:")) {
        $ogImg = "https://netrium1-lab.github.io/images/care-beauty-treatment-3panel.jpg"
    }

    $pageHtml = @"
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>$cleanTitle | 여백과 결 칼럼</title>
  <meta name="description" content="$cleanDesc">

  <!-- Open Graph (카카오톡, 페이스북, 네이버 블로그 미리보기 카드) -->
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="여백과 결, 리셋 아카이브">
  <meta property="og:title" content="$cleanTitle">
  <meta property="og:description" content="$cleanDesc">
  <meta property="og:image" content="$ogImg">
  <meta property="og:image:secure_url" content="$ogImg">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="https://netrium1-lab.github.io/articles/$artId.html">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="$cleanTitle">
  <meta name="twitter:description" content="$cleanDesc">
  <meta name="twitter:image" content="$ogImg">

  <!-- 본문 페이지로 즉시 자동 이동 -->
  <meta http-equiv="refresh" content="0; url=../index.html?article=$artId">
  <script>
    window.location.replace('../index.html?article=$artId');
  </script>
</head>
<body style="font-family: sans-serif; text-align: center; padding: 40px; color: #334155;">
  <h2>📖 칼럼 전문으로 이동 중입니다...</h2>
  <p><a href="../index.html?article=$artId" style="color: #2b6a38; font-weight: bold; font-size: 1.1rem;">화면이 바로 열리지 않으면 여기를 클릭하세요 ➔</a></p>
</body>
</html>
"@

    $targetHtmlPath = Join-Path $articlesDir "$artId.html"
    [IO.File]::WriteAllText($targetHtmlPath, $pageHtml, [System.Text.Encoding]::UTF8)
    Write-Host "Generated static OG page: articles/$artId.html"
}

Write-Host "All article pages generated successfully!"
