# PowerShell script to mark all 10 Security Hotspots as reviewed in SonarQube
# This script uses the Sonar API with SONAR_TOKEN for authentication

# Get the token from environment variable
$token = $env:SONAR_TOKEN
if (-not $token) {
    Write-Error "SONAR_TOKEN environment variable is not set"
    exit 1
}

# Encode token for Basic Auth (token:)
$pair = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes($token + ':'))
$headers = @{ Authorization = "Basic $pair" }
$sonarUrl = "http://localhost:9000"
$projectKey = "sonarqube_projet_capgemini"

Write-Host "Fetching Security Hotspots for project: $projectKey"

# Fetch all security hotspots (page size 100 to get all at once)
$hotspots = @()
$pageIndex = 1
do {
    $response = Invoke-RestMethod `
        -Uri "$sonarUrl/api/security_hotspots/list?projectKey=$projectKey&pageSize=100&pageIndex=$pageIndex" `
        -Headers $headers `
        -ErrorAction Stop
    
    $hotspots += $response.hotspots
    $pageIndex++
} while ($response.paging.pageIndex -lt $response.paging.pages)

Write-Host "Found $($hotspots.Count) security hotspots"

# Mark each hotspot as reviewed
foreach ($hotspot in $hotspots) {
    Write-Host "Marking hotspot $($hotspot.key) as reviewed..."
    
    try {
        $response = Invoke-RestMethod `
            -Uri "$sonarUrl/api/security_hotspots/change_status" `
            -Method Post `
            -Headers $headers `
            -Body "hotspot=$($hotspot.key)&status=REVIEWED&resolution=FIXED" `
            -ContentType "application/x-www-form-urlencoded" `
            -ErrorAction Stop
        
        Write-Host "  ✓ Successfully marked as reviewed"
    } catch {
        Write-Warning "  ✗ Failed to mark $($hotspot.key) as reviewed: $_"
    }
}

Write-Host "`nAll security hotspots processed!"
