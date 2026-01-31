# Massive Load Test Script for Vitality - City Scale Simulation
$BaseUrl = "http://localhost:9090/api/simulation"
$Hospitals = @("H1", "H2", "H3")
$TotalPatients = 100

Write-Host "1. Initializing City..." -ForegroundColor Cyan
Invoke-RestMethod -Method Post -Uri "$BaseUrl/init"

Write-Host "2. Flooding City with $TotalPatients Patients..." -ForegroundColor Yellow

$recentPatients = @()

for ($i = 1; $i -le $TotalPatients; $i++) {
    $hospitalId = $Hospitals | Get-Random
    $severity = Get-Random -Minimum 1 -Maximum 11 # 1-10
    
    # Asynchronous "Fire and Forget" style via simple invoke (PowerShell is inherently blocking but fast enough)
    $body = "{""hospitalId"": ""$hospitalId"", ""severity"": $severity}"
    $response = Invoke-RestMethod -Method Post -Uri "$BaseUrl/patient" -ContentType "application/json" -Body $body
    
    if ($response -match "Patient (.*?) admitted") {
        $recentPatients += @{ Id = $matches[1]; Hospital = $hospitalId }
    }
    
    if ($i % 10 -eq 0) {
        Write-Host "$i " -NoNewline -ForegroundColor Gray
    }
}
Write-Host "`n   Injections Complete." -ForegroundColor Green

Write-Host "3. System Settling (2s)..." -ForegroundColor Cyan
Start-Sleep -Seconds 2

Write-Host "4. Analyzing Redirection for Recent High-Severity Patients..." -ForegroundColor Magenta

# Check the last 5 patients to see if they should be moved
$count = 0
foreach ($p in $recentPatients[-5..-1]) {
    $patientId = $p.Id
    $hid = $p.Hospital
    
    try {
        $recommendation = Invoke-RestMethod -Method Post -Uri "$BaseUrl/redirect/evaluate" -ContentType "application/json" -Body "{""currentHospitalId"": ""$hid"", ""patientId"": ""$patientId""}"
        
        if ($recommendation -ne $hid) {
            Write-Host "   [REDIRECT ADVISED] Patient $patientId ($hid) -> $recommendation" -ForegroundColor Green
            $count++
        } else {
            Write-Host "   [STAY] Patient $patientId ($hid) is best placed." -ForegroundColor Gray
        }
    } catch {
        Write-Host "   [INFO] Patient $patientId likely already treated." -ForegroundColor DarkGray
    }
}

Write-Host "`n5. Final City Stats:" -ForegroundColor Cyan
Invoke-RestMethod -Method Get -Uri "$BaseUrl/stats"
