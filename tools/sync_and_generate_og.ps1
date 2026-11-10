$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$repoRoot = Split-Path -Parent $PSScriptRoot
$imagesDir = Join-Path $repoRoot "images"
$articlesDir = Join-Path $repoRoot "articles"
$articlesJsonPath = Join-Path $repoRoot "articles.json"

if (-not (Test-Path $articlesDir)) {
    New-Item -ItemType Directory -Path $articlesDir | Out-Null
}

Write-Host "Fetching articles from Firestore yebaek-bfa2c..."
$apiUrl = "https://firestore.googleapis.com/v1/projects/yebaek-bfa2c/databases/(default)/documents/articles"
$resp = Invoke-RestMethod -Uri "$apiUrl`?pageSize=100" -Method Get

$articles = @()

foreach ($doc in $resp.documents) {
    $fields = $doc.fields
    if (-not $fields) { continue }

    $id = ($doc.name -split '/')[-1]
    if ($fields.id -and $fields.id.stringValue) { $id = $fields.id.stringValue }

    $title = ""
    if ($fields.title) { $title = $fields.title.stringValue }

    $category = ""
    if ($fields.category) { $category = $fields.category.stringValue }

    $image = ""
    if ($fields.image) { $image = $fields.image.stringValue }

    $excerpt = ""
    if ($fields.excerpt) { $excerpt = $fields.excerpt.stringValue }

    $content = ""
    if ($fields.content) { $content = $fields.content.stringValue }

    # Clean contenteditable and extract any inline base64 images to static files for articles.json
    if ($content) {
        $cleanedForFirestore = $content -replace '\s*contenteditable="true"', ''
        if ($cleanedForFirestore -ne $content) {
            try {
                $patchUrl = "$apiUrl/$id`?updateMask.fieldPaths=content"
                $patchBody = @{
                    fields = @{
                        content = @{ stringValue = $cleanedForFirestore }
                    }
                } | ConvertTo-Json -Depth 5
                $utf8Bytes = [System.Text.Encoding]::UTF8.GetBytes($patchBody)
                Invoke-RestMethod -Uri $patchUrl -Method Patch -Body $utf8Bytes -ContentType 'application/json; charset=utf-8' | Out-Null
                Write-Host "Cleaned contenteditable in Firestore for $id"
            } catch {
                Write-Host "Warning: could not update Firestore content for $id"
            }
        }
        $content = $cleanedForFirestore

        $script:bodyImgIdx = 0
        $base64Pattern = [regex]'data:image\/([a-zA-Z0-9]+);base64,([A-Za-z0-9+\/=]+)'
        $content = $base64Pattern.Replace($content, {
            param($m)
            $script:bodyImgIdx++
            $bExt = $m.Groups[1].Value.ToLower()
            if ($bExt -eq "jpeg") { $bExt = "jpg" }
            $bFileName = "article_${id}_body_$($script:bodyImgIdx).${bExt}"
            $bDiskPath = Join-Path $imagesDir $bFileName
            $bBytes = [Convert]::FromBase64String($m.Groups[2].Value)
            [IO.File]::WriteAllBytes($bDiskPath, $bBytes)
            Write-Host "Saved inline image for $id -> images/$bFileName"
            return "https://netrium1-lab.github.io/images/$bFileName"
        })

        if ($content -ne $cleanedForFirestore) {
            try {
                $patchUrl = "$apiUrl/$id`?updateMask.fieldPaths=content"
                $patchBody = @{
                    fields = @{
                        content = @{ stringValue = $content }
                    }
                } | ConvertTo-Json -Depth 5
                $utf8Bytes = [System.Text.Encoding]::UTF8.GetBytes($patchBody)
                Invoke-RestMethod -Uri $patchUrl -Method Patch -Body $utf8Bytes -ContentType 'application/json; charset=utf-8' | Out-Null
                Write-Host "Cleaned and converted inline images in Firestore for $id"
            } catch {
                Write-Host "Warning: could not update Firestore content for $id"
            }
        }
    }

    # Specific 5-paragraph rebuild and deduplication for mag_1794134205598
    if ($id -eq "mag_1794134205598") {
        $cleanText = $content -replace '<figure[^>]*>[\s\S]*?<\/figure>', ''
        $cleanText = $cleanText -replace '<img[^>]*>', ''
        $cleanText = $cleanText -replace '\s*contenteditable="true"', ''
        $h3s = $cleanText -split '(?=<h3\b)'
        if ($h3s.Count -ge 5) {
            $img1 = "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80"
            $cap1 = "📷 1단락 · 현실의 성찰: 수십 년 세월의 무게로 가득 찬 공간, 과거의 미련과 미래의 불안이 남긴 물건의 미로"
            $img2 = "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80"
            $cap2 = "📷 2단락 · 심리의 성찰: 30년 묵은 물건 뒤에 숨겨진 결핍의 상처를 마주하고 위로하는 시간"
            $img3 = "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1200&q=80"
            $cap3 = "📷 3단락 · 공감의 실천: 자녀에게 짐이 아닌 홀가분한 사랑과 단정한 품격을 남기는 되스텟닝의 지혜"
            $img4 = "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1200&q=80"
            $cap4 = "📷 4단락 · 실천 로드맵: 하루 한 구역, 3박스 분류 시스템으로 완성하는 단정한 정리와 나눔"
            $img5 = "https://images.unsplash.com/photo-1540518614846-7ede433c4ef7?auto=format&fit=crop&w=1200&q=80"
            $cap5 = "📷 5단락 · 여백의 갈무리: 소유의 집착을 덜어낸 자리에 비로소 차오르는 따뜻한 햇살과 영혼의 평온"

            $c0 = "<figure class=""article-section-image-card"" data-domain=""organizing"" style=""margin: 32px auto; text-align: center; max-width: 760px; clear: both; user-select: none;""><img src=""$img1"" alt=""$cap1"" style=""width: 100%; max-height: 520px; object-fit: cover; border-radius: 12px; display: block; margin: 0 auto; box-shadow: 0 6px 22px rgba(0,0,0,0.15);"" loading=""lazy""><figcaption style=""margin-top: 10px; font-size: 0.88rem; color: #94a3b8; font-weight: 700; line-height: 1.5; padding: 0 8px;"">$cap1</figcaption></figure>"
            $c1 = "<figure class=""article-section-image-card"" data-domain=""organizing"" style=""margin: 32px auto; text-align: center; max-width: 760px; clear: both; user-select: none;""><img src=""$img2"" alt=""$cap2"" style=""width: 100%; max-height: 520px; object-fit: cover; border-radius: 12px; display: block; margin: 0 auto; box-shadow: 0 6px 22px rgba(0,0,0,0.15);"" loading=""lazy""><figcaption style=""margin-top: 10px; font-size: 0.88rem; color: #94a3b8; font-weight: 700; line-height: 1.5; padding: 0 8px;"">$cap2</figcaption></figure>"
            $c2 = "<figure class=""article-section-image-card"" data-domain=""organizing"" style=""margin: 32px auto; text-align: center; max-width: 760px; clear: both; user-select: none;""><img src=""$img3"" alt=""$cap3"" style=""width: 100%; max-height: 520px; object-fit: cover; border-radius: 12px; display: block; margin: 0 auto; box-shadow: 0 6px 22px rgba(0,0,0,0.15);"" loading=""lazy""><figcaption style=""margin-top: 10px; font-size: 0.88rem; color: #94a3b8; font-weight: 700; line-height: 1.5; padding: 0 8px;"">$cap3</figcaption></figure>"
            $c3 = "<figure class=""article-section-image-card"" data-domain=""organizing"" style=""margin: 32px auto; text-align: center; max-width: 760px; clear: both; user-select: none;""><img src=""$img4"" alt=""$cap4"" style=""width: 100%; max-height: 520px; object-fit: cover; border-radius: 12px; display: block; margin: 0 auto; box-shadow: 0 6px 22px rgba(0,0,0,0.15);"" loading=""lazy""><figcaption style=""margin-top: 10px; font-size: 0.88rem; color: #94a3b8; font-weight: 700; line-height: 1.5; padding: 0 8px;"">$cap4</figcaption></figure>"
            $c4 = "<figure class=""article-section-image-card"" data-domain=""organizing"" style=""margin: 32px auto; text-align: center; max-width: 760px; clear: both; user-select: none;""><img src=""$img5"" alt=""$cap5"" style=""width: 100%; max-height: 520px; object-fit: cover; border-radius: 12px; display: block; margin: 0 auto; box-shadow: 0 6px 22px rgba(0,0,0,0.15);"" loading=""lazy""><figcaption style=""margin-top: 10px; font-size: 0.88rem; color: #94a3b8; font-weight: 700; line-height: 1.5; padding: 0 8px;"">$cap5</figcaption></figure>"

            $p0 = $h3s[0]
            if ($p0.Contains("</blockquote>")) {
                $p0 = $p0.Replace("</blockquote>", "</blockquote>" + $c0)
            } else {
                $idx = $p0.IndexOf("</p>")
                if ($idx -ne -1) { $p0 = $p0.Substring(0, $idx + 4) + $c0 + $p0.Substring($idx + 4) } else { $p0 += $c0 }
            }
            $p1 = $h3s[1]; $idx = $p1.IndexOf("</p>"); if ($idx -ne -1) { $p1 = $p1.Substring(0, $idx + 4) + $c1 + $p1.Substring($idx + 4) } else { $p1 += $c1 }
            $p2 = $h3s[2]; $idx = $p2.IndexOf("</p>"); if ($idx -ne -1) { $p2 = $p2.Substring(0, $idx + 4) + $c2 + $p2.Substring($idx + 4) } else { $p2 += $c2 }
            $p3 = $h3s[3]; $idx = $p3.IndexOf("</p>"); if ($idx -ne -1) { $p3 = $p3.Substring(0, $idx + 4) + $c3 + $p3.Substring($idx + 4) } else { $p3 += $c3 }
            $p4 = $h3s[4]; $idx = $p4.IndexOf("</p>"); if ($idx -ne -1) { $p4 = $p4.Substring(0, $idx + 4) + $c4 + $p4.Substring($idx + 4) } else { $p4 += $c4 }

            $content = $p0 + $p1 + $p2 + $p3 + $p4
            $image = "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=85"

            try {
                $patchUrl = "$apiUrl/$id`?updateMask.fieldPaths=image&updateMask.fieldPaths=content"
                $patchBody = @{
                    fields = @{
                        image = @{ stringValue = $image }
                        content = @{ stringValue = $content }
                    }
                } | ConvertTo-Json -Depth 5
                $utf8Bytes = [System.Text.Encoding]::UTF8.GetBytes($patchBody)
                Invoke-RestMethod -Uri $patchUrl -Method Patch -Body $utf8Bytes -ContentType 'application/json; charset=utf-8' | Out-Null
                Write-Host "Rebuilt and synchronized mag_1794134205598 with 5 distinct images and hero cover in Firestore!"
            } catch {
                Write-Host "Warning: could not patch mag_1794134205598 in Firestore"
            }
        }
    }

    $readTime = "5 min"
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
            $utf8Bytes = [System.Text.Encoding]::UTF8.GetBytes($patchBody)
            Invoke-RestMethod -Uri $patchUrl -Method Patch -Body $utf8Bytes -ContentType 'application/json; charset=utf-8' | Out-Null
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
  <title>$cleanTitle</title>
  <meta name="description" content="$cleanDesc">
  <meta property="og:type" content="article">
  <meta property="og:title" content="$cleanTitle">
  <meta property="og:description" content="$cleanDesc">
  <meta property="og:image" content="$ogImg">
  <meta property="og:image:secure_url" content="$ogImg">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="https://netrium1-lab.github.io/articles/$artId.html">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="$cleanTitle">
  <meta name="twitter:description" content="$cleanDesc">
  <meta name="twitter:image" content="$ogImg">
  <meta http-equiv="refresh" content="0; url=../index.html?article=$artId">
  <script>
    window.location.replace('../index.html?article=$artId');
  </script>
</head>
<body style="font-family: sans-serif; text-align: center; padding: 40px; color: #334155;">
  <p><a href="../index.html?article=$artId" style="color: #2b6a38; font-weight: bold; font-size: 1.1rem;">Open Article &rarr;</a></p>
</body>
</html>
"@

    $targetHtmlPath = Join-Path $articlesDir "$artId.html"
    [IO.File]::WriteAllText($targetHtmlPath, $pageHtml, [System.Text.Encoding]::UTF8)
    Write-Host "Generated static OG page: articles/$artId.html"
}

Write-Host "All article pages generated successfully!"
