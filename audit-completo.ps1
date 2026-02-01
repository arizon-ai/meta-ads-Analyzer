$csv = Import-Csv 'c:\Onedrive\AJ\ARIZON\Analizador META ADS\Data\Diciembre-vs-Enero (1).csv'

# Initialize counters
$stats = @{
    Total  = @{ Spend = 0; Results = 0; Conv = 0; Reach = 0; Impressions = 0; Clicks = 0 }
    Arizon = @{ Spend = 0; Results = 0; Conv = 0; Reach = 0; Impressions = 0; Clicks = 0; Ads = @() }
    Antes  = @{ Spend = 0; Results = 0; Conv = 0; Reach = 0; Impressions = 0; Clicks = 0; Ads = @() }
}

foreach ($row in $csv) {
    $spend = [double]$row.'Importe gastado (USD)'
    $results = [double]$row.'Resultados'
    $reach = [double]$row.'Alcance'
    $impressions = [double]$row.'Impresiones'
    $clicks = [double]$row.'Clics (todos)'
    $adName = $row.'Nombre del anuncio'
    $startDate = $row.'Inicio'
    $resultType = $row.'Tipo de resultado'
    
    # Total
    $stats.Total.Spend += $spend
    $stats.Total.Results += $results
    $stats.Total.Reach += $reach
    $stats.Total.Impressions += $impressions
    $stats.Total.Clicks += $clicks
    if ($resultType -eq 'Conversaciones con mensajes iniciadas') { 
        $stats.Total.Conv += $results 
    }
    
    # Classify as Arizon or Antes based on ad name OR start date >= 2026-01-15
    $isArizon = ($adName -match 'arizon|lista' -or $startDate -ge '2026-01-15')
    
    if ($isArizon) {
        $stats.Arizon.Spend += $spend
        $stats.Arizon.Results += $results
        $stats.Arizon.Reach += $reach
        $stats.Arizon.Impressions += $impressions
        $stats.Arizon.Clicks += $clicks
        if ($resultType -eq 'Conversaciones con mensajes iniciadas') { 
            $stats.Arizon.Conv += $results 
        }
        if ($adName -notin $stats.Arizon.Ads) { $stats.Arizon.Ads += $adName }
    }
    else {
        $stats.Antes.Spend += $spend
        $stats.Antes.Results += $results
        $stats.Antes.Reach += $reach
        $stats.Antes.Impressions += $impressions
        $stats.Antes.Clicks += $clicks
        if ($resultType -eq 'Conversaciones con mensajes iniciadas') { 
            $stats.Antes.Conv += $results 
        }
        if ($adName -notin $stats.Antes.Ads) { $stats.Antes.Ads += $adName }
    }
}

Write-Host "=============================================="
Write-Host "AUDITORIA COMPLETA CSV - DICIEMBRE VS ENERO"
Write-Host "=============================================="
Write-Host ""
Write-Host "TOTALES DEL CSV:"
Write-Host "  Total Filas: $($csv.Count)"
Write-Host "  Gasto Total: `$$([math]::Round($stats.Total.Spend, 2))"
Write-Host "  Resultados Total: $([math]::Round($stats.Total.Results, 0))"
Write-Host "  Conversaciones Total: $([math]::Round($stats.Total.Conv, 0))"
Write-Host "  Alcance Total: $([math]::Round($stats.Total.Reach, 0))"
Write-Host "  Impresiones Total: $([math]::Round($stats.Total.Impressions, 0))"
Write-Host "  Clics Total: $([math]::Round($stats.Total.Clicks, 0))"
Write-Host ""
Write-Host "=============================================="
Write-Host "PERIODO ARIZON (>=15 Ene o nombre arizon/lista)"
Write-Host "=============================================="
Write-Host "  Gasto: `$$([math]::Round($stats.Arizon.Spend, 2))"
Write-Host "  Resultados: $([math]::Round($stats.Arizon.Results, 0))"
Write-Host "  Conversaciones: $([math]::Round($stats.Arizon.Conv, 0))"
Write-Host "  Alcance: $([math]::Round($stats.Arizon.Reach, 0))"
Write-Host "  Impresiones: $([math]::Round($stats.Arizon.Impressions, 0))"
Write-Host "  Clics: $([math]::Round($stats.Arizon.Clicks, 0))"
Write-Host "  Anuncios Unicos: $($stats.Arizon.Ads.Count)"
Write-Host ""
Write-Host "  METRICAS CALCULADAS:"
if ($stats.Arizon.Conv -gt 0) {
    Write-Host "  CPL (Costo/Conv): `$$([math]::Round($stats.Arizon.Spend / $stats.Arizon.Conv, 2))"
}
if ($stats.Arizon.Impressions -gt 0) {
    Write-Host "  CTR: $([math]::Round(($stats.Arizon.Clicks / $stats.Arizon.Impressions) * 100, 2))%"
    Write-Host "  CPM: `$$([math]::Round(($stats.Arizon.Spend / $stats.Arizon.Impressions) * 1000, 2))"
}
if ($stats.Arizon.Clicks -gt 0) {
    Write-Host "  CPC: `$$([math]::Round($stats.Arizon.Spend / $stats.Arizon.Clicks, 4))"
}
if ($stats.Arizon.Reach -gt 0) {
    Write-Host "  Frecuencia: $([math]::Round($stats.Arizon.Impressions / $stats.Arizon.Reach, 2))"
}
Write-Host ""
Write-Host "=============================================="
Write-Host "PERIODO ANTES (<15 Ene sin arizon/lista)"
Write-Host "=============================================="
Write-Host "  Gasto: `$$([math]::Round($stats.Antes.Spend, 2))"
Write-Host "  Resultados: $([math]::Round($stats.Antes.Results, 0))"
Write-Host "  Conversaciones: $([math]::Round($stats.Antes.Conv, 0))"
Write-Host "  Alcance: $([math]::Round($stats.Antes.Reach, 0))"
Write-Host "  Impresiones: $([math]::Round($stats.Antes.Impressions, 0))"
Write-Host "  Clics: $([math]::Round($stats.Antes.Clicks, 0))"
Write-Host "  Anuncios Unicos: $($stats.Antes.Ads.Count)"
Write-Host ""
Write-Host "  METRICAS CALCULADAS:"
if ($stats.Antes.Conv -gt 0) {
    Write-Host "  CPL (Costo/Conv): `$$([math]::Round($stats.Antes.Spend / $stats.Antes.Conv, 2))"
}
if ($stats.Antes.Impressions -gt 0) {
    Write-Host "  CTR: $([math]::Round(($stats.Antes.Clicks / $stats.Antes.Impressions) * 100, 2))%"
    Write-Host "  CPM: `$$([math]::Round(($stats.Antes.Spend / $stats.Antes.Impressions) * 1000, 2))"
}
if ($stats.Antes.Clicks -gt 0) {
    Write-Host "  CPC: `$$([math]::Round($stats.Antes.Spend / $stats.Antes.Clicks, 4))"
}
if ($stats.Antes.Reach -gt 0) {
    Write-Host "  Frecuencia: $([math]::Round($stats.Antes.Impressions / $stats.Antes.Reach, 2))"
}
Write-Host ""
Write-Host "=============================================="
Write-Host "COMPARACION DIRECTA"
Write-Host "=============================================="
if ($stats.Arizon.Conv -gt 0 -and $stats.Antes.Conv -gt 0) {
    $arizonCPL = $stats.Arizon.Spend / $stats.Arizon.Conv
    $antesCPL = $stats.Antes.Spend / $stats.Antes.Conv
    $cplReduction = (($antesCPL - $arizonCPL) / $antesCPL) * 100
    $convMultiplier = $stats.Arizon.Conv / $stats.Antes.Conv
    $efficiencyMultiplier = ($stats.Arizon.Conv / $stats.Arizon.Spend) / ($stats.Antes.Conv / $stats.Antes.Spend)
    
    Write-Host "  CPL Arizon: `$$([math]::Round($arizonCPL, 2))"
    Write-Host "  CPL Antes: `$$([math]::Round($antesCPL, 2))"
    Write-Host "  Reduccion CPL: $([math]::Round($cplReduction, 1))%"
    Write-Host "  Multiplicador Conversiones: $([math]::Round($convMultiplier, 1))x"
    Write-Host "  Multiplicador Eficiencia: $([math]::Round($efficiencyMultiplier, 2))x"
}
Write-Host ""
Write-Host "=============================================="
Write-Host "VERIFICACION DE FECHAS ARIZON"
Write-Host "=============================================="
$arizonDates = $csv | Where-Object { $_.'Nombre del anuncio' -match 'arizon|lista' } | Select-Object -Property 'Nombre del anuncio', 'Inicio' -Unique | Sort-Object 'Inicio'
foreach ($ad in $arizonDates | Select-Object -First 20) {
    Write-Host "  $($ad.'Inicio'): $($ad.'Nombre del anuncio'.Substring(0, [Math]::Min(40, $ad.'Nombre del anuncio'.Length)))..."
}
