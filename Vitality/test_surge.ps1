# 1. Clear State (Using the newly restored reset logic)
Invoke-RestMethod -Method Post -Uri "http://localhost:9090/api/simulation/init" -Body '{"count": "10"}' -ContentType "application/json"

# 2. Flood H1 with 50 patients (Using correct /patient endpoint)
echo "Flooding H1..."
for ($i=1; $i -le 1000; $i++) {
    $body = @{
        severity = 1
        hospitalId = "H1"
    } | ConvertTo-Json
    Invoke-RestMethod -Method Post -Uri "http://localhost:9090/api/simulation/patient" -Body $body -ContentType "application/json"
}

for($i =1;$i -le 1000;$i++) {
    $body = @{
        severity = 1
        hospitalId = "H3"
    } | ConvertTo-Json
    Invoke-RestMethod -Method Post -Uri "http://localhost:9090/api/simulation/patient" -Body $body -ContentType "application/json"
}
# 3. Check Stats
Invoke-RestMethod -Method Get -Uri "http://localhost:9090/api/simulation/stats"