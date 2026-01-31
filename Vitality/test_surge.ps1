# Test Surge Detection Logic
$BaseUrl = "http://localhost:9090/api/simulation"

Write-Host "1. Initializing City & Resetting State..." -ForegroundColor Cyan
Invoke-RestMethod -Method Post -Uri "$BaseUrl/init"

Write-Host "2. Verifying Initial State (Normal Mode)..." -ForegroundColor Cyan
$stats = Invoke-RestMethod -Method Get -Uri "$BaseUrl/stats"
if ($stats.surgeActive -eq $false) {
    Write-Host "   [OK] System is in NORMAL MODE." -ForegroundColor Green
} else {
    Write-Host "   [FAIL] Expected Normal Mode." -ForegroundColor Red
}

Write-Host "3. Triggering SURGE (Injecting 15 patients rapidly)..." -ForegroundColor Yellow
for ($i = 1; $i -le 15; $i++) {
    $body = "{""hospitalId"": ""H1"", ""severity"": 5}"
    Invoke-RestMethod -Method Post -Uri "$BaseUrl/patient" -ContentType "application/json" -Body $body | Out-Null
    Write-Host "." -NoNewline -ForegroundColor Gray
}
Write-Host ""

Write-Host "4. Verifying SURGE Activation..." -ForegroundColor Magenta
$stats = Invoke-RestMethod -Method Get -Uri "$BaseUrl/stats"
if ($stats.surgeActive -eq $true) {
    Write-Host "   [SUCCESS] >>> 🚨 SURGE DETECTED! System is in SURVIVAL MODE." -ForegroundColor Green -BackgroundColor DarkRed
    Write-Host "   (Time Weight has been doubled for all new priority calculations)" -ForegroundColor Gray
} else {
    Write-Host "   [FAIL] Surge NOT detected. Check thresholds." -ForegroundColor Red
}

Write-Host "`nTo verify Surge End, wait 60 seconds and run stats again." -ForegroundColor Gray
