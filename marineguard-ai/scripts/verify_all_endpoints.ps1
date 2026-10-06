$allPassed = $true

function Test-Endpoint {
    param($Name, $Url, $Method="GET", $Body=$null)
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            TimeoutSec = 10
            UseBasicParsing = $true
        }
        if ($Body) {
            $params["Body"] = $Body
            $params["ContentType"] = "application/json"
        }
        $res = Invoke-RestMethod @params
        Write-Host " [PASS] $Name -> OK" -ForegroundColor Green
        return $res
    } catch {
        Write-Host " [FAIL] $Name -> $($_.Exception.Message)" -ForegroundColor Red
        $script:allPassed = $false
        return $null
    }
}

Write-Host "=== MARINEGUARD AI FULL INTEGRATION TEST SUITE ===" -ForegroundColor Cyan

# 1. Health
$h = Test-Endpoint "Node /api/health" "http://localhost:5000/api/health"
Write-Host "   DB Mode: $($h.database.mode) | Upstream ML: $($h.upstreamServices.fastapiML.status)" -ForegroundColor Gray

# 2. Debris List
$d = Test-Endpoint "GET /api/debris" "http://localhost:5000/api/debris"
Write-Host "   Count: $($d.count)" -ForegroundColor Gray

# 3. Debris Detect (ML + GIS)
$detBody = '{"latitude": 18.523, "longitude": 72.91}'
$det = Test-Endpoint "POST /api/debris/detect" "http://localhost:5000/api/debris/detect" "POST" $detBody
$gisDet = if ($det.detection.gisSpatialAnalysis) { $det.detection.gisSpatialAnalysis } else { $det.detection.gis_spatial_analysis }
Write-Host "   Detection: $($det.detection.detectionId) | Risk: $($det.detection.riskScore) | Nearest MPA: $($gisDet.nearest_mpa_name) | Coastline: $($gisDet.coastal_distance_km) km" -ForegroundColor Gray

# 4. Debris Predict (Physics + ML + GIS Trajectory)
$predBody = '{"latitude": 18.523, "longitude": 72.91, "time_horizons": [6, 12, 24, 48, 72]}'
$pred = Test-Endpoint "POST /api/debris/predict" "http://localhost:5000/api/debris/predict" "POST" $predBody
Write-Host "   MAE: $($pred.prediction_error_mae_km) km | Intersects MPA: $($pred.gis_spatial_analysis.intersects_mpa)" -ForegroundColor Gray

# 5. Debris Risk
$riskBody = '{"estimated_area_m2": 3200, "latitude": 18.523, "longitude": 72.91}'
$risk = Test-Endpoint "POST /api/debris/risk" "http://localhost:5000/api/debris/risk" "POST" $riskBody
Write-Host "   Risk Score: $($risk.risk_score) | Priority: $($risk.priority)" -ForegroundColor Gray

# 6. Vessels List
$v = Test-Endpoint "GET /api/vessels" "http://localhost:5000/api/vessels"
Write-Host "   Count: $($v.count)" -ForegroundColor Gray

# 7. Vessel Detect (CNN + GIS)
$vDetBody = '{"latitude": 18.55, "longitude": 72.85}'
$vDet = Test-Endpoint "POST /api/vessels/detect" "http://localhost:5000/api/vessels/detect" "POST" $vDetBody
Write-Host "   Vessel ID: $($vDet.vessel.vesselId) | Class: $($vDet.vessel.vesselType) | Inside MPA: $($vDet.vessel.insideProtectedZone)" -ForegroundColor Gray

# 8. Report Generate
$rptBody = '{"reportType": "Debris Intelligence", "title": "Verification Audit Report"}'
$rpt = Test-Endpoint "POST /api/reports/generate" "http://localhost:5000/api/reports/generate" "POST" $rptBody
Write-Host "   Report ID: $($rpt.report.reportId) | Title: $($rpt.report.title)" -ForegroundColor Gray

# 9. Dashboard Stats
$stats = Test-Endpoint "GET /api/dashboard/stats" "http://localhost:5000/api/dashboard/stats"
Write-Host "   Debris IoU: $($stats.mlModelPerformance.debrisUNet.iou) | Vessel Acc: $($stats.mlModelPerformance.vesselClassifier.accuracy) | Drift MAE: $($stats.mlModelPerformance.trajectoryPredictor.maeKm) km" -ForegroundColor Gray

# 10. Live Monitoring
$mon = Test-Endpoint "GET /api/monitoring/live" "http://localhost:5000/api/monitoring/live"
Write-Host "   MPA Polygons: $($mon.protectedAreas.features.Count)" -ForegroundColor Gray

# 11. FastAPI Direct Health
$fHealth = Test-Endpoint "FastAPI /health" "http://127.0.0.1:8000/health"
Write-Host "   FastAPI Status: $($fHealth.status)" -ForegroundColor Gray

Write-Host "=================================================" -ForegroundColor Cyan
if ($allPassed) {
    Write-Host "ALL 11 INTEGRATION TESTS PASSED SUCCESSFULLY!" -ForegroundColor Green
} else {
    Write-Host "SOME TESTS FAILED." -ForegroundColor Red
}
