# Vitality Live Patient Admission & Redirection Simulation
param (
    [int]$N = 15
)

$ErrorActionPreference = "Stop"
$SimUrl = "http://localhost:9090/api/simulation"

# Print Header
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "         VITALITY LIVE ADMISSION & REDIRECTION STREAM (N = $N)" -ForegroundColor White -BackgroundColor Blue
Write-Host "========================================================================" -ForegroundColor Cyan

# 1. Reset and Initialize Environment
Write-Host "[SYSTEM] Initializing triage environment with 3 hospitals..." -ForegroundColor Gray
try {
    $initResponse = Invoke-RestMethod -Method Post -Uri "$SimUrl/init" -ContentType "application/json" -Body '{"count": "3"}'
    Write-Host "[SYSTEM] $initResponse" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Could not reach backend server at http://localhost:9090. Make sure the Java app is running." -ForegroundColor Red
    exit 1
}

# 2. Start loop
for ($i = 1; $i -le $N; $i++) {
    # Generate random severity (1 to 10)
    $severity = Get-Random -Minimum 1 -Maximum 11
    
    # Map severity to department
    $dept = "NURSE"
    $staffName = "nurses"
    if ($severity -ge 4 -and $severity -le 7) {
        $dept = "GENERAL"
        $staffName = "general doctors"
    } elseif ($severity -ge 8) {
        $dept = "ICU"
        $staffName = "ICU specialists"
    }

    # Admit all patients to H1 to simulate queue congestion
    $admitBody = @{ hospitalId = "H1"; severity = $severity } | ConvertTo-Json
    $admitResponse = Invoke-RestMethod -Method Post -Uri "$SimUrl/patient" -ContentType "application/json" -Body $admitBody
    $patientId = $admitResponse.patientId

    # Fetch updated hospitals details to inspect resource occupancy
    $hospitals = Invoke-RestMethod -Method Get -Uri "$SimUrl/hospitals"
    $h1 = $hospitals | Where-Object { $_.id -eq "H1" }

    # Retrieve staff occupancy for target department
    $busyStaff = $h1.activeStaffCounts.$dept
    $totalStaff = $h1.staffCounts.$dept
    $queueSize = $h1.waitingRooms.$dept.Count

    # Evaluate redirection
    $evalBody = @{ currentHospitalId = "H1"; patientId = $patientId } | ConvertTo-Json
    $redirectTarget = Invoke-RestMethod -Method Post -Uri "$SimUrl/redirect/evaluate" -ContentType "application/json" -Body $evalBody

    # Print Patient Info Block
    Write-Host "`n------------------------------------------------------------------------" -ForegroundColor Gray
    Write-Host "[Patient $i/$N] ID: $patientId | Severity: $severity | Department: $dept" -ForegroundColor White -FontWeight Bold

    if ($redirectTarget -ne "H1") {
        # Redirect happened! Find target info
        $targetHosp = $hospitals | Where-Object { $_.id -eq $redirectTarget }
        $targetQueue = $targetHosp.waitingRooms.$dept.Count

        # Compute distance
        $dist = [Math]::Round([Math]::Sqrt([Math]::Pow($h1.x - $targetHosp.x, 2) + [Math]::Pow($h1.y - $targetHosp.y, 2)), 1)

        Write-Host "  Admitted To: H1 (Hospital #1)" -ForegroundColor Gray
        Write-Host "  H1 $dept staff occupancy: $busyStaff/$totalStaff ($([Math]::Round(($busyStaff/$totalStaff)*100))% busy) | Queue: $queueSize" -ForegroundColor Yellow
        Write-Host "  Orchestrator Decision: " -NoNewline -ForegroundColor Gray
        Write-Host "REDIRECT TO $redirectTarget ($($targetHosp.name))" -ForegroundColor Green -BackgroundColor Black
        
        # Explain why
        Write-Host "  Reason: Redirected because of the lack of $staffName at H1 (staff: $busyStaff/$totalStaff occupied, queue: $queueSize). " -NoNewline -ForegroundColor White
        Write-Host "Target $redirectTarget has shorter queues (queue: $targetQueue) offset by distance of $dist units." -ForegroundColor Gray
    } else {
        # Treated locally
        Write-Host "  Admitted To: H1 (Hospital #1)" -ForegroundColor Gray
        Write-Host "  H1 $dept staff occupancy: $busyStaff/$totalStaff ($([Math]::Round(($busyStaff/$totalStaff)*100))% busy) | Queue: $queueSize" -ForegroundColor Gray
        Write-Host "  Orchestrator Decision: " -NoNewline -ForegroundColor Gray
        Write-Host "STAY (Treat locally)" -ForegroundColor Cyan
        Write-Host "  Reason: Patient remains at H1. Local $dept capacity is sufficient to prioritize admission." -ForegroundColor Gray
    }

    # Delay to simulate progression and allow treatments to run
    Start-Sleep -Milliseconds 400
}

Write-Host "`n========================================================================" -ForegroundColor Cyan
Write-Host "         SIMULATION COMPLETE. ALL PATIENTS ADMITTED." -ForegroundColor Green
Write-Host "========================================================================" -ForegroundColor Cyan
