# Load Test Script for Vitality - Force Redirection
$BaseUrl = "http://localhost:9090/api/simulation"

Write-Host "1. Initializing City..." -ForegroundColor Cyan
Invoke-RestMethod -Method Post -Uri "$BaseUrl/init" -ContentType "application/json" -Body '{"count": "3"}' | Out-Null

Write-Host "2. Overloading Hospital H1 with 20 Patients..." -ForegroundColor Yellow
$lastPatientId = ""

for ($i = 1; $i -le 20; $i++) {
    $severity = Get-Random -Minimum 4 -Maximum 8 # General Ward Severity
    $response = Invoke-RestMethod -Method Post -Uri "$BaseUrl/patient" -ContentType "application/json" -Body "{""hospitalId"": ""H1"", ""severity"": $severity}"
    $lastPatientId = $response.patientId
    Write-Host "." -NoNewline -ForegroundColor Gray
}
Write-Host ""
Write-Host "   Overload Complete. Last Patient ID: $lastPatientId" -ForegroundColor Green

Write-Host "3. Waiting 2 seconds for Orchestrator to update stats..." -ForegroundColor Cyan
Start-Sleep -Seconds 2

Write-Host "4. Evaluating Redirection for Patient $lastPatientId..." -ForegroundColor Magenta
$redirectTarget = Invoke-RestMethod -Method Post -Uri "$BaseUrl/redirect/evaluate" -ContentType "application/json" -Body "{""currentHospitalId"": ""H1"", ""patientId"": ""$lastPatientId""}"

Write-Host "`nRecommendation from Orchestrator:" -ForegroundColor White
if ($redirectTarget -ne "H1") {
    Write-Host "SUCCESS: REDIRECT TO $redirectTarget" -ForegroundColor Green -BackgroundColor Black
    Write-Host "(Because H1 is overloaded and $redirectTarget has capacity)" -ForegroundColor Gray
} else {
    Write-Host "NO REDIRECTION ADVISED (H1 is still best option?)" -ForegroundColor Red
}

Write-Host "`n5. Current City Stats:" -ForegroundColor Cyan
Invoke-RestMethod -Method Get -Uri "$BaseUrl/stats"
