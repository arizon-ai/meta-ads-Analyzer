$csv = Import-Csv 'c:\Onedrive\AJ\ARIZON\Analizador META ADS\Data\Diciembre-vs-Enero (1).csv'
$totalSpend = 0
$totalResults = 0
$totalConv = 0
$arizonSpend = 0
$arizonResults = 0
$arizonConv = 0
$antesSpend = 0
$antesResults = 0
$antesConv = 0
$totalReach = 0
$arizonReach = 0
$antesReach = 0
$totalImpressions = 0
$arizonImpressions = 0
$antesImpressions = 0
$totalClicks = 0
$arizonClicks = 0
$antesClicks = 0

foreach ($row in $csv) {
    $spend = [double]$row.'Importe gastado (USD)'
    $results = [double]$row.'Resultados'
    $reach = [double]$row.'Alcance'
    $impressions = [double]$row.'Impresiones'
    $clicks = [double]$row.'Clics (todos)'
    
    $totalSpend += $spend
    $totalResults += $results
    $totalReach += $reach
    $totalImpressions += $impressions
    $totalClicks += $clicks
    
    $isConv = $row.'Tipo de resultado' -eq 'Conversaciones con mensajes iniciadas'
    if ($isConv) { $totalConv += $results }
    
    $isArizon = $row.'Nombre del anuncio' -match 'arizon|lista' -or $row.'Inicio' -ge '2026-01-15'
    if ($isArizon) {
        $arizonSpend += $spend
        $arizonResults += $results
        $arizonReach += $reach
        $arizonImpressions += $impressions
        $arizonClicks += $clicks
        if ($isConv) { $arizonConv += $results }
    } else {
        $antesSpend += $spend
        $antesResults += $results
        $antesReach += $reach
        $antesImpressions += $impressions
        $antesClicks += $clicks
        if ($isConv) { $antesConv += $results }
    }
}

Write-Host "========================================="
Write-Host "VERIFICACION CSV - DATOS REALES"
Write-Host "========================================="
Write-Host ""
Write-Host "TOTALES CSV:"
Write-Host "  Gasto Total: $([math]::Round($totalSpend, 2))"
Write-Host "  Resultados Total: $([math]::Round($totalResults, 0))"
Write-Host "  Conversaciones Total: $([math]::Round($totalConv, 0))"
Write-Host ""
Write-Host "========================================="
Write-Host "ARIZON (>=15 Ene o nombre arizon/lista):"
Write-Host "========================================="
Write-Host "  Gasto: $([math]::Round($arizonSpend, 2))"
Write-Host "  Resultados: $([math]::Round($arizonResults, 0))"
Write-Host "  Conversaciones: $([math]::Round($arizonConv, 0))"
Write-Host "  Alcance: $([math]::Round($arizonReach, 0))"
Write-Host "  Impresiones: $([math]::Round($arizonImpressions, 0))"
Write-Host "  Clics: $([math]::Round($arizonClicks, 0))"
Write-Host "  CPL: $([math]::Round($arizonSpend / $arizonConv, 2))"
Write-Host "  CTR: $([math]::Round(($arizonClicks / $arizonImpressions) * 100, 2))%"
Write-Host "  CPM: $([math]::Round(($arizonSpend / $arizonImpressions) * 1000, 2))"
Write-Host ""
Write-Host "========================================="
Write-Host "ANTES (<15 Ene sin arizon/lista):"
Write-Host "========================================="
Write-Host "  Gasto: $([math]::Round($antesSpend, 2))"
Write-Host "  Resultados: $([math]::Round($antesResults, 0))"
Write-Host "  Conversaciones: $([math]::Round($antesConv, 0))"
Write-Host "  Alcance: $([math]::Round($antesReach, 0))"
Write-Host "  Impresiones: $([math]::Round($antesImpressions, 0))"
Write-Host "  Clics: $([math]::Round($antesClicks, 0))"
Write-Host "  CPL: $([math]::Round($antesSpend / $antesConv, 2))"
Write-Host "  CTR: $([math]::Round(($antesClicks / $antesImpressions) * 100, 2))%"
Write-Host "  CPM: $([math]::Round(($antesSpend / $antesImpressions) * 1000, 2))"
