# Test Staff Shortage Logic
$BaseUrl = "http://localhost:9090/api/simulation"

Write-Host "1. Initializing City with 3 Hospitals..." -ForegroundColor Cyan
$initBody = @{ count = "3" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "$BaseUrl/init" -ContentType "application/json" -Body $initBody

Write-Host "2. Injecting Load (20 patients)..." -ForegroundColor Yellow
$surgeBody = @{ count = "20" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "$BaseUrl/surge" -ContentType "application/json" -Body $surgeBody | Out-Null
Start-Sleep -Seconds 2

Write-Host "3. Current Staffing (Baseline)..." -ForegroundColor Cyan
$stats = Invoke-RestMethod -Method Get -Uri "$BaseUrl/stats"
Write-Host "   Active Doctors: $($stats.totalDoctorsActive)" -ForegroundColor Gray

Write-Host "4. TRIGGERING STAFF SHORTAGE (60% Capacity)..." -ForegroundColor Magenta
Invoke-RestMethod -Method Post -Uri "$BaseUrl/staffing/shortage" -ContentType "application/json" | Out-Null
Start-Sleep -Seconds 5

Write-Host "5. Verifying Reduced Capacity..." -ForegroundColor Cyan
$newStats = Invoke-RestMethod -Method Get -Uri "$BaseUrl/stats"
Write-Host "   Active Doctors (Should be lower): $($newStats.totalDoctorsActive)" -ForegroundColor Green

if ($newStats.totalDoctorsActive -lt $stats.totalDoctorsActive) {
    Write-Host "   [SUCCESS] Staff count reduced successfully." -ForegroundColor Green
} else {
    Write-Host "   [WARNING] Staff count might not have dropped yet (threads waiting to finish)." -ForegroundColor Yellow
}

Write-Host "6. Monitoring Queue Buildup..." -ForegroundColor Cyan
Write-Host "   Patients Waiting: $($newStats.totalPatientsWaiting)" -ForegroundColor Yellow
