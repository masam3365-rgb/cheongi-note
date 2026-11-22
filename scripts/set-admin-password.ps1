# 관리자 비밀번호 재설정 (값을 화면에 메아리치지 않음)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $root ".env"
$notePath = Join-Path $root "LOCAL-ADMIN.txt"

Write-Host ""
Write-Host "달빛 사주관 - 관리자 비밀번호 변경" -ForegroundColor Cyan
Write-Host "기존 비밀번호를 몰라도 .env 값을 새 비밀번호로 바꿀 수 있습니다." -ForegroundColor Gray
Write-Host ""

if (-not (Test-Path $envPath)) {
  Write-Host ".env 파일이 없습니다. .env.example 을 복사한 뒤 다시 실행하세요." -ForegroundColor Red
  Read-Host "엔터를 누르면 종료"
  exit 1
}

$secure1 = Read-Host "새 관리자 비밀번호" -AsSecureString
$secure2 = Read-Host "새 관리자 비밀번호 확인" -AsSecureString

$bstr1 = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure1)
$bstr2 = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure2)
try {
  $pass1 = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr1)
  $pass2 = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr2)
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr1)
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr2)
}

if ([string]::IsNullOrWhiteSpace($pass1)) {
  Write-Host "비밀번호가 비어 있습니다." -ForegroundColor Red
  Read-Host "엔터를 누르면 종료"
  exit 1
}
if ($pass1 -ne $pass2) {
  Write-Host "두 번 입력한 비밀번호가 다릅니다." -ForegroundColor Red
  Read-Host "엔터를 누르면 종료"
  exit 1
}
if ($pass1.Length -lt 8) {
  Write-Host "안전을 위해 8자 이상을 권장합니다. 계속할까요? (y/N)" -ForegroundColor Yellow
  $ans = Read-Host
  if ($ans -notin @("y", "Y")) { exit 1 }
}

$rotate = Read-Host "세션 비밀키(ADMIN_SESSION_SECRET)도 새로 만들까요? 권장: y (y/N)"
$lines = Get-Content $envPath -Encoding UTF8
$out = @()
$hasPass = $false
$hasSecret = $false
foreach ($line in $lines) {
  if ($line -match '^\s*ADMIN_PASSWORD\s*=') {
    $out += "ADMIN_PASSWORD=$pass1"
    $hasPass = $true
  } elseif ($line -match '^\s*ADMIN_SESSION_SECRET\s*=' -and ($rotate -in @("y", "Y"))) {
    $chars = [char[]]((48..57) + (65..90) + (97..122))
    $secret = -join (1..40 | ForEach-Object { $chars | Get-Random })
    $out += "ADMIN_SESSION_SECRET=$secret"
    $hasSecret = $true
  } else {
    if ($line -match '^\s*ADMIN_SESSION_SECRET\s*=') { $hasSecret = $true }
    $out += $line
  }
}
if (-not $hasPass) { $out += "ADMIN_PASSWORD=$pass1" }
if (-not $hasSecret) {
  $chars = [char[]]((48..57) + (65..90) + (97..122))
  $secret = -join (1..40 | ForEach-Object { $chars | Get-Random })
  $out += "ADMIN_SESSION_SECRET=$secret"
}

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllLines($envPath, $out, $utf8NoBom)

$note = @"
달빛 사주관 로컬 관리자 (Git에 올리지 마세요)

주소: http://localhost:5173/#admin-panel
실행: 바탕화면 「달빛사주관 관리자」 또는 scripts\start-dalbit-admin.cmd

비밀번호는 프로젝트 .env 의 ADMIN_PASSWORD 에만 보관합니다.
이 파일을 열어 비밀번호를 적어 두지 마세요. (.env 가 기준입니다)

변경 시각: $(Get-Date -Format "yyyy-MM-dd HH:mm")
변경 후 Vite 서버를 한 번 재시작해야 새 비밀번호가 적용됩니다.
"@
[System.IO.File]::WriteAllText($notePath, $note, $utf8NoBom)

# 메모리에서 평문 제거 시도
$pass1 = $null
$pass2 = $null
[GC]::Collect()

Write-Host ""
Write-Host "저장 완료: .env 의 ADMIN_PASSWORD 를 갱신했습니다." -ForegroundColor Green
Write-Host "다음: Cursor 터미널에서 실행 중인 npm run dev 를 중지(Ctrl+C)한 뒤 다시 시작하세요." -ForegroundColor Yellow
Write-Host "주소: http://localhost:5173/#admin-panel" -ForegroundColor Cyan
Write-Host ""
Read-Host "엔터를 누르면 종료"
