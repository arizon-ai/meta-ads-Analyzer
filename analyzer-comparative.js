// Arizon.ai Marketing Intelligence Analyzer
// Comparative Analysis: Before vs After Arizon Strategy

// Meta Ads Benchmarks 2025-2026 (Electronics E-commerce)
const META_BENCHMARKS_2025 = {
    ctr: { low: 0.9, avg: 1.4, high: 2.0 },      // %
    cpm: { low: 3.0, avg: 10.88, high: 12.30 },  // USD
    cpc: { low: 0.70, avg: 1.11, high: 1.92 },   // USD
    cpl: { low: 6.49, avg: 15.00, high: 27.66 }, // USD - Cost Per Lead/Conversation
    frequency: { prospecting: 1.5, retargeting: 2.5 }
};

const CUTOFF_DATE = new Date('2026-01-15');
let rawData = [], beforeData = [], afterData = [];

document.addEventListener('DOMContentLoaded', () => {
    setupDragDrop();
    setupFileInput();
});

function toggleFinancialContext() {
    const el = document.getElementById('financialContext');
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

function setupDragDrop() {
    const dropZone = document.getElementById('dropZone');
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(e => {
        dropZone.addEventListener(e, ev => { ev.preventDefault(); ev.stopPropagation(); });
    });
    ['dragenter', 'dragover'].forEach(e => dropZone.addEventListener(e, () => dropZone.classList.add('dragover')));
    ['dragleave', 'drop'].forEach(e => dropZone.addEventListener(e, () => dropZone.classList.remove('dragover')));
    dropZone.addEventListener('drop', e => {
        const file = e.dataTransfer.files[0];
        if (file?.name.endsWith('.csv')) processFile(file);
    });
}

function setupFileInput() {
    document.getElementById('fileInput').addEventListener('change', e => {
        if (e.target.files.length > 0) processFile(e.target.files[0]);
    });
}

function processFile(file) {
    document.getElementById('uploadSection').classList.add('hidden');
    document.getElementById('loadingSection').classList.remove('hidden');

    Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: results => {
            rawData = results.data.filter(r => r['Nombre del anuncio']);
            splitDataByDate();
            setTimeout(runDeepAnalysis, 500);
        }
    });
}

function parseDate(dateStr) {
    if (!dateStr || dateStr === 'En curso') return new Date();
    const parts = dateStr.split('-');
    return parts.length === 3 ? new Date(parts[0], parts[1] - 1, parts[2]) : null;
}

function splitDataByDate() {
    beforeData = [];
    afterData = [];

    // Pattern to detect new strategy ads (should be P2)
    const newStrategyPattern = /arizon|lista.*\d{2}\/\d{2}/i;

    rawData.forEach(row => {
        const startDate = parseDate(row['Inicio']);
        const adName = row['Nombre del anuncio'] || '';

        // Check if it's a new strategy ad (Arizon branded or Lista with date)
        const isNewStrategy = newStrategyPattern.test(adName);

        // P2: Either starts on/after cutoff date OR is part of new strategy
        if ((startDate && startDate >= CUTOFF_DATE) || isNewStrategy) {
            afterData.push(row);
        } else {
            beforeData.push(row);
        }
    });
}

function runDeepAnalysis() {
    document.getElementById('loadingSection').classList.add('hidden');
    document.getElementById('resultsSection').classList.remove('hidden');

    const before = calculateDeepMetrics(beforeData);
    const after = calculateDeepMetrics(afterData);

    renderExecutiveSummary(before, after);
    renderPhaseComparison(before, after);
    renderDeepMetricsTable(before, after);
    renderComparativeStrengths(before, after);
    renderResultTypeBreakdown(before, after);
    renderAudienceInsights(before, after);
    renderTopAdsAnalysis(before, after);
    renderKeywordMining();
    renderHiddenInsights(before, after);
    renderStrategicRecommendations(before, after);
    renderStrategicConclusion(before, after);
    renderDemographicsChart(before, after);

    // Deep Analysis Enhanced Functions
    renderEfficiencyMatrix(before, after);
    renderCampaignTypeAnalysis(before, after);
    renderCreativePerformance(before, after);
    renderBenchmarkCompliance(before, after);
    renderAutoInsights(before, after);
}

function calculateDeepMetrics(data) {
    const m = {
        records: data.length,
        spend: 0, results: 0, reach: 0, impressions: 0, clicks: 0,
        conversations: 0, vanityResults: 0,
        resultTypes: {}, demographics: {}, ads: {}
    };

    data.forEach(row => {
        const spend = parseFloat(row['Importe gastado (USD)']) || 0;
        const results = parseFloat(row['Resultados']) || 0;
        const resultType = row['Tipo de resultado'] || 'Otro';
        const age = row['Edad'] || 'Unknown';
        const gender = row['Sexo'] === 'male' ? 'Hombres' : row['Sexo'] === 'female' ? 'Mujeres' : 'Otro';
        const adName = row['Nombre del anuncio'];

        m.spend += spend;
        m.results += results;
        m.reach += parseFloat(row['Alcance']) || 0;
        m.impressions += parseFloat(row['Impresiones']) || 0;
        m.clicks += parseFloat(row['Clics (todos)']) || 0;

        const rtLower = resultType.toLowerCase();
        if (rtLower.includes('mensaje') || rtLower.includes('conversaci')) {
            m.conversations += results;
        } else {
            m.vanityResults += results;
        }

        if (!m.resultTypes[resultType]) m.resultTypes[resultType] = { spend: 0, results: 0 };
        m.resultTypes[resultType].spend += spend;
        m.resultTypes[resultType].results += results;

        const demoKey = `${gender} ${age}`;
        if (!m.demographics[demoKey]) {
            m.demographics[demoKey] = { spend: 0, results: 0, reach: 0, impressions: 0, clicks: 0, conversations: 0 };
        }
        m.demographics[demoKey].spend += spend;
        m.demographics[demoKey].results += results;
        m.demographics[demoKey].reach += parseFloat(row['Alcance']) || 0;
        m.demographics[demoKey].impressions += parseFloat(row['Impresiones']) || 0;
        m.demographics[demoKey].clicks += parseFloat(row['Clics (todos)']) || 0;
        if (rtLower.includes('mensaje') || rtLower.includes('conversaci')) {
            m.demographics[demoKey].conversations += results;
        }

        if (!m.ads[adName]) {
            m.ads[adName] = { spend: 0, results: 0, reach: 0, impressions: 0, clicks: 0 };
        }
        m.ads[adName].spend += spend;
        m.ads[adName].results += results;
        m.ads[adName].reach += parseFloat(row['Alcance']) || 0;
        m.ads[adName].impressions += parseFloat(row['Impresiones']) || 0;
        m.ads[adName].clicks += parseFloat(row['Clics (todos)']) || 0;
    });

    m.ctr = m.impressions > 0 ? (m.clicks / m.impressions * 100) : 0;
    m.cpm = m.impressions > 0 ? (m.spend / m.impressions * 1000) : 0;
    m.cpc = m.clicks > 0 ? (m.spend / m.clicks) : 0;
    m.cpr = m.results > 0 ? (m.spend / m.results) : 0;
    m.costPerConversation = m.conversations > 0 ? (m.spend / m.conversations) : Infinity;
    m.frequency = m.reach > 0 ? (m.impressions / m.reach) : 0;
    m.conversionRate = m.clicks > 0 ? (m.conversations / m.clicks * 100) : 0;
    m.qualityScore = m.conversations > 0 ? (m.conversations / m.spend * 100) : 0;

    return m;
}

function renderExecutiveSummary(before, after) {
    // Meta Ads Benchmarks 2024-2025 (Industry Standards)
    const BENCHMARKS = {
        ctr: { low: 0.9, avg: 1.2, high: 2.0 },  // %
        cpm: { low: 6.59, avg: 10.88, high: 15.0 },  // USD
        cpc: { low: 0.72, avg: 1.11, high: 1.92 },  // USD
        frequency: { prospecting: 1.5, retargeting: 7.0 }
    };

    // Objective metric calculations
    const p1CTRvsAvg = ((before.ctr - BENCHMARKS.ctr.avg) / BENCHMARKS.ctr.avg * 100).toFixed(1);
    const p2CTRvsAvg = ((after.ctr - BENCHMARKS.ctr.avg) / BENCHMARKS.ctr.avg * 100).toFixed(1);
    const p1CPMvsAvg = ((before.cpm - BENCHMARKS.cpm.avg) / BENCHMARKS.cpm.avg * 100).toFixed(1);
    const p2CPMvsAvg = ((after.cpm - BENCHMARKS.cpm.avg) / BENCHMARKS.cpm.avg * 100).toFixed(1);

    // Objective comparison - which strategy meets more benchmarks?
    let p1Score = 0, p2Score = 0;
    if (before.ctr > after.ctr) p1Score++; else if (after.ctr > before.ctr) p2Score++;
    if (before.cpm < after.cpm) p1Score++; else if (after.cpm < before.cpm) p2Score++;
    if (before.cpc < after.cpc) p1Score++; else if (after.cpc < before.cpc) p2Score++;
    if (before.costPerConversation < after.costPerConversation) p1Score++; else if (after.costPerConversation < before.costPerConversation) p2Score++;
    if (before.conversations > after.conversations) p1Score++; else if (after.conversations > before.conversations) p2Score++;
    if (before.frequency < after.frequency && before.frequency <= BENCHMARKS.frequency.prospecting) p1Score++;
    if (after.frequency < before.frequency && after.frequency <= BENCHMARKS.frequency.prospecting) p2Score++;

    document.getElementById('executiveSummary').innerHTML = `
        <div class="rounded-lg border p-6 mb-6">
            <p class="text-base font-medium text-foreground mb-4 text-center">Análisis Comparativo Objetivo (PhD Marketing)</p>
            <p class="text-sm text-muted-foreground mb-4 text-center">Evaluación basada en métricas de Meta Ads y benchmarks de industria 2024-2025</p>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div class="stat-card text-center">
                    <p class="text-xs text-muted-foreground uppercase tracking-wide">CTR Antes</p>
                    <p class="text-xl font-semibold text-foreground">${before.ctr.toFixed(2)}%</p>
                    <p class="text-xs text-muted-foreground">${p1CTRvsAvg > 0 ? '+' : ''}${p1CTRvsAvg}% vs benchmark</p>
                </div>
                <div class="stat-card text-center">
                    <p class="text-xs text-muted-foreground uppercase tracking-wide">CTR Arizon</p>
                    <p class="text-xl font-semibold text-foreground">${after.ctr.toFixed(2)}%</p>
                    <p class="text-xs text-muted-foreground">${p2CTRvsAvg > 0 ? '+' : ''}${p2CTRvsAvg}% vs benchmark</p>
                </div>
                <div class="stat-card text-center">
                    <p class="text-xs text-muted-foreground uppercase tracking-wide">CPM Antes</p>
                    <p class="text-xl font-semibold text-foreground">$${before.cpm.toFixed(2)}</p>
                    <p class="text-xs text-muted-foreground">${p1CPMvsAvg > 0 ? '+' : ''}${p1CPMvsAvg}% vs benchmark</p>
                </div>
                <div class="stat-card text-center">
                    <p class="text-xs text-muted-foreground uppercase tracking-wide">CPM Arizon</p>
                    <p class="text-xl font-semibold text-foreground">$${after.cpm.toFixed(2)}</p>
                    <p class="text-xs text-muted-foreground">${p2CPMvsAvg > 0 ? '+' : ''}${p2CPMvsAvg}% vs benchmark</p>
                </div>
            </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="rounded-lg border p-4">
                <div class="flex items-center gap-2 mb-3">
                    <span class="badge">Antes</span>
                    <span class="text-xs text-muted-foreground">${p1Score} métricas favorables</span>
                </div>
                <ul class="space-y-2 text-sm text-muted-foreground">
                    <li class="flex justify-between"><span>Inversión</span><strong class="text-foreground">$${before.spend.toFixed(2)}</strong></li>
                    <li class="flex justify-between"><span>Resultados totales</span><span class="text-foreground">${before.results.toLocaleString()}</span></li>
                    <li class="flex justify-between"><span>Conversaciones</span><span class="text-foreground">${before.conversations.toLocaleString()}</span></li>
                    <li class="flex justify-between"><span>Costo/Conv.</span><span class="text-foreground">$${before.costPerConversation.toFixed(2)}</span></li>
                </ul>
            </div>
            <div class="rounded-lg border p-4">
                <div class="flex items-center gap-2 mb-3">
                    <span class="badge badge-dark">Arizon</span>
                    <span class="text-xs text-muted-foreground">${p2Score} métricas favorables</span>
                </div>
                <ul class="space-y-2 text-sm text-muted-foreground">
                    <li class="flex justify-between"><span>Inversión</span><strong class="text-foreground">$${after.spend.toFixed(2)}</strong></li>
                    <li class="flex justify-between"><span>Resultados totales</span><span class="text-foreground">${after.results.toLocaleString()}</span></li>
                    <li class="flex justify-between"><span>Conversaciones</span><span class="text-foreground">${after.conversations.toLocaleString()}</span></li>
                    <li class="flex justify-between"><span>Costo/Conv.</span><span class="text-foreground">$${after.costPerConversation.toFixed(2)}</span></li>
                </ul>
            </div>
        </div>
    `;
}

function renderPhaseComparison(before, after) {
    const stat = (label, value, sub = '') => `
        <div class="flex justify-between items-center py-2 border-b border-black last:border-0">
            <span class="text-sm text-black">${label}</span>
            <div class="text-right">
                <span class="font-semibold">${value}</span>
                ${sub ? `<span class="text-xs text-black block">${sub}</span>` : ''}
            </div>
        </div>
    `;

    document.getElementById('phase1Stats').innerHTML = `
        ${stat('Inversión', '$' + before.spend.toFixed(2))}
        ${stat('Resultados', before.results.toLocaleString())}
        ${stat('Conversaciones', before.conversations.toLocaleString())}
        ${stat('Costo/Conversación', '$' + before.costPerConversation.toFixed(2))}
        ${stat('CTR', before.ctr.toFixed(2) + '%')}
        ${stat('CPM', '$' + before.cpm.toFixed(2))}
        ${stat('Alcance', before.reach.toLocaleString())}
        ${stat('Frecuencia', before.frequency.toFixed(2))}
    `;

    document.getElementById('phase2Stats').innerHTML = `
        ${stat('Inversión', '$' + after.spend.toFixed(2))}
        ${stat('Resultados', after.results.toLocaleString())}
        ${stat('Conversaciones', after.conversations.toLocaleString())}
        ${stat('Costo/Conversación', '$' + after.costPerConversation.toFixed(2))}
        ${stat('CTR', after.ctr.toFixed(2) + '%')}
        ${stat('CPM', '$' + after.cpm.toFixed(2))}
        ${stat('Alcance', after.reach.toLocaleString())}
        ${stat('Frecuencia', after.frequency.toFixed(2))}
    `;
}

function renderDeepMetricsTable(before, after) {
    const pctChange = (a, b) => b !== 0 ? (((a - b) / Math.abs(b)) * 100).toFixed(1) + '%' : 'N/A';

    // Spending ratio for normalization
    const spendRatio = before.spend / after.spend;

    // Calculate reach efficiency (people reached per dollar spent)
    const reachPerDollarBefore = before.reach / before.spend;
    const reachPerDollarAfter = after.reach / after.spend;

    const winner = (aWins) => aWins ?
        '<span class="bg-black text-white px-2 py-1 text-xs font-semibold">Arizon</span>' :
        '<span class="border border-black text-black px-2 py-1 text-xs font-semibold">Antes</span>';

    // Benchmark status indicator
    const benchStatus = (value, benchmark, isLowerBetter) => {
        if (!benchmark) return '-';
        const meets = isLowerBetter ? value <= benchmark : value >= benchmark;
        return meets ?
            `<span class="font-semibold">${isLowerBetter ? '≤' : '≥'}${benchmark}</span>` :
            `<span class="font-semibold">${isLowerBetter ? '≤' : '≥'}${benchmark}</span>`;
    };

    const metrics = [
        { name: 'Inversión Total', b: '$' + before.spend.toFixed(2), a: '$' + after.spend.toFixed(2), diff: pctChange(after.spend, before.spend), w: after.spend < before.spend, explain: 'Menos gasto con mejores resultados', bench: '-' },
        { name: 'Conversaciones', b: before.conversations.toLocaleString(), a: after.conversations.toLocaleString(), diff: pctChange(after.conversations, before.conversations), w: true, explain: 'Clientes reales que escribieron al WhatsApp', bench: '-' },
        { name: 'Costo/Conversación (CPL)', b: '$' + before.costPerConversation.toFixed(2), a: '$' + after.costPerConversation.toFixed(2), diff: pctChange(after.costPerConversation, before.costPerConversation), w: after.costPerConversation < before.costPerConversation, explain: 'MÉTRICA CLAVE: Cuánto cuesta cada cliente potencial', bench: '≤$' + META_BENCHMARKS_2025.cpl.avg },
        { name: 'CTR', b: before.ctr.toFixed(2) + '%', a: after.ctr.toFixed(2) + '%', diff: pctChange(after.ctr, before.ctr), w: after.ctr > before.ctr, explain: '% de personas que hacen clic en el anuncio', bench: '≥' + META_BENCHMARKS_2025.ctr.avg + '%' },
        { name: 'CPM', b: '$' + before.cpm.toFixed(2), a: '$' + after.cpm.toFixed(2), diff: pctChange(after.cpm, before.cpm), w: after.cpm < before.cpm, explain: 'Costo por 1000 vistas', bench: '≤$' + META_BENCHMARKS_2025.cpm.avg },
        { name: 'CPC', b: '$' + before.cpc.toFixed(4), a: '$' + after.cpc.toFixed(4), diff: pctChange(after.cpc, before.cpc), w: after.cpc < before.cpc, explain: 'Costo por clic', bench: '≤$' + META_BENCHMARKS_2025.cpc.avg },
        { name: 'Tasa Conversión', b: before.conversionRate.toFixed(2) + '%', a: after.conversionRate.toFixed(2) + '%', diff: pctChange(after.conversionRate, before.conversionRate), w: after.conversionRate > before.conversionRate, explain: '% de clics que se convierten en mensaje de WhatsApp', bench: '-' },
        { name: 'Alcance por $1', b: reachPerDollarBefore.toFixed(0), a: reachPerDollarAfter.toFixed(0), diff: pctChange(reachPerDollarAfter, reachPerDollarBefore), w: reachPerDollarAfter > reachPerDollarBefore, explain: 'Personas alcanzadas por cada dólar invertido', bench: '-' },
        { name: 'Frecuencia', b: before.frequency.toFixed(2), a: after.frequency.toFixed(2), diff: pctChange(after.frequency, before.frequency), w: after.frequency >= 1.5 && after.frequency <= 2.5, explain: 'Veces que cada persona vio el anuncio (ideal: 1.5-2.5)', bench: '≤' + META_BENCHMARKS_2025.frequency.prospecting },
        { name: 'Eficiencia', b: before.qualityScore.toFixed(1), a: after.qualityScore.toFixed(1), diff: pctChange(after.qualityScore, before.qualityScore), w: after.qualityScore > before.qualityScore, explain: 'Conversaciones generadas por cada $100 invertidos', bench: '-' },
    ];

    document.getElementById('comparisonTable').innerHTML = metrics.map(m => `
        <tr class="hover:bg-white">
            <td class="p-3">
                <span class="font-medium block">${m.name}</span>
                <span class="text-xs text-black">${m.explain}</span>
            </td>
            <td class="p-3 text-center text-black">${m.b}</td>
            <td class="p-3 text-center font-semibold text-black">${m.a}</td>
            <td class="p-3 text-center text-black text-xs">${m.bench}</td>
            <td class="p-3 text-center text-black text-sm">${m.diff}</td>
            <td class="p-3 text-center">${winner(m.w)}</td>
        </tr>
    `).join('');
}

function renderResultTypeBreakdown(before, after) {
    const renderTypes = (types, containerId) => {
        const sorted = Object.entries(types)
            .filter(([name]) => name && name !== 'null' && name !== 'undefined')
            .sort((a, b) => b[1].spend - a[1].spend);

        const total = sorted.reduce((sum, [, v]) => sum + v.spend, 0);

        document.getElementById(containerId).innerHTML = sorted.map(([name, data]) => {
            const pct = total > 0 ? (data.spend / total * 100).toFixed(1) : 0;
            const cpr = data.results > 0 ? (data.spend / data.results) : 0;
            const isConversation = name.toLowerCase().includes('mensaje') || name.toLowerCase().includes('conversaci');

            return `
                <div class="p-3 border ${isConversation ? 'border-2 border-black' : 'border-black'}">
                    <div class="flex justify-between items-start mb-2">
                        <span class="text-sm font-medium text-black">${name}</span>
                        <span class="text-xs bg-black text-white px-2 py-1">${pct}%</span>
                    </div>
                    <div class="grid grid-cols-3 gap-2 text-xs text-black">
                        <div>Gasto: <strong>$${data.spend.toFixed(2)}</strong></div>
                        <div>Res: <strong>${data.results.toLocaleString()}</strong></div>
                        <div>CPR: <strong>$${cpr.toFixed(4)}</strong></div>
                    </div>
                </div>
            `;
        }).join('');
    };

    renderTypes(before.resultTypes, 'resultTypesBefore');
    renderTypes(after.resultTypes, 'resultTypesAfter');
}

function renderAudienceInsights(before, after) {
    const afterDemos = Object.entries(after.demographics)
        .filter(([, v]) => v.conversations > 0)
        .map(([name, v]) => ({
            name,
            ...v,
            cpr: v.conversations > 0 ? v.spend / v.conversations : Infinity
        }))
        .sort((a, b) => a.cpr - b.cpr);

    const bestAudiences = afterDemos.slice(0, 3);
    const worstAudiences = afterDemos.slice(-3).reverse();

    document.getElementById('audienceInsights').innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="border border-black p-4">
                <h4 class="font-bold text-black mb-3">Top 3 Audiencias (Menor CPR)</h4>
                ${bestAudiences.map((a, i) => `
                    <div class="flex justify-between items-center p-2 border border-black mb-2">
                        <span class="font-medium text-black">${i + 1}. ${a.name}</span>
                        <div class="text-right">
                            <span class="text-black font-bold">$${a.cpr.toFixed(2)}</span>
                            <span class="text-black text-xs block">${a.conversations} conv.</span>
                        </div>
                    </div>
                `).join('')}
                <p class="text-xs text-black mt-2 font-medium">Aumentar presupuesto en estos segmentos</p>
            </div>
            <div class="border border-black p-4">
                <h4 class="font-bold text-black mb-3">Audiencias a Optimizar</h4>
                ${worstAudiences.map(a => `
                    <div class="flex justify-between items-center p-2 border border-black mb-2">
                        <span class="font-medium text-black">${a.name}</span>
                        <div class="text-right">
                            <span class="text-black font-bold">$${a.cpr.toFixed(2)}</span>
                            <span class="text-black text-xs block">${a.conversations} conv.</span>
                        </div>
                    </div>
                `).join('')}
                <p class="text-xs text-black mt-2 font-medium">Revisar creativos o reducir inversión</p>
            </div>
        </div>
    `;
}

function renderTopAdsAnalysis(before, after) {
    const getTopAds = (ads) => Object.entries(ads)
        .filter(([, v]) => v.results > 0 && v.spend > 5)
        .map(([name, v]) => ({ name, ...v, cpr: v.spend / v.results, ctr: v.impressions > 0 ? v.clicks / v.impressions * 100 : 0 }))
        .sort((a, b) => b.spend - a.spend)
        .slice(0, 5);

    const renderAdList = (ads, containerId) => {
        document.getElementById(containerId).innerHTML = ads.map(ad => `
            <div class="p-3 border border-black hover:bg-white transition">
                <div class="flex justify-between items-start mb-2">
                    <span class="font-medium text-sm text-black truncate max-w-[65%]">${ad.name.substring(0, 35)}...</span>
                    <span class="font-bold text-black">$${ad.spend.toFixed(2)}</span>
                </div>
                <div class="grid grid-cols-4 gap-2 text-xs text-black">
                    <div>Res: <strong>${ad.results.toLocaleString()}</strong></div>
                    <div>CPR: <strong>$${ad.cpr.toFixed(4)}</strong></div>
                    <div>CTR: <strong>${ad.ctr.toFixed(2)}%</strong></div>
                    <div>Alcance: <strong>${ad.reach.toLocaleString()}</strong></div>
                </div>
            </div>
        `).join('');
    };

    renderAdList(getTopAds(before.ads), 'topAdsBefore');
    renderAdList(getTopAds(after.ads), 'topAdsAfter');
}

function renderKeywordMining() {
    const keywords = {};
    const stopWords = ['de', 'la', 'el', 'en', 'y', 'a', 'para', 'por', 'con', 'campaña', 'interacción', 'publicación', 'instagram', 'null'];

    afterData.forEach(row => {
        const name = row['Nombre del anuncio'] || '';
        const words = name.toUpperCase().replace(/[^A-ZÁÉÍÓÚÑ0-9\s]/gi, '').split(/\s+/)
            .filter(w => w.length > 2 && !stopWords.includes(w.toLowerCase()));

        words.forEach(word => {
            if (!keywords[word]) keywords[word] = { spend: 0, results: 0, count: 0 };
            keywords[word].spend += parseFloat(row['Importe gastado (USD)']) || 0;
            keywords[word].results += parseFloat(row['Resultados']) || 0;
            keywords[word].count++;
        });
    });

    const sorted = Object.entries(keywords)
        .filter(([, v]) => v.count > 2 && v.results > 5)
        .map(([word, v]) => ({ word, ...v, cpr: v.results > 0 ? v.spend / v.results : Infinity }))
        .sort((a, b) => a.cpr - b.cpr);

    const best = sorted.slice(0, 4);
    const worst = sorted.slice(-2);

    document.getElementById('keywordAnalysis').innerHTML = `
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            ${best.map(k => `
                <div class="border border-black p-3 text-center">
                    <p class="text-[10px] text-black uppercase font-semibold">Mejor CPR</p>
                    <p class="text-lg font-bold text-black">"${k.word}"</p>
                    <p class="text-sm text-black font-semibold">$${k.cpr.toFixed(2)}</p>
                </div>
            `).join('')}
            ${worst.map(k => `
                <div class="border-2 border-black p-3 text-center">
                    <p class="text-[10px] text-black uppercase font-semibold">Alto CPR</p>
                    <p class="text-lg font-bold text-black">"${k.word}"</p>
                    <p class="text-sm text-black font-semibold">$${k.cpr.toFixed(2)}</p>
                </div>
            `).join('')}
        </div>
    `;
}

function renderStrategicRecommendations(before, after) {
    const bestDemo = Object.entries(after.demographics)
        .filter(([, v]) => v.conversations > 10)
        .map(([name, v]) => ({ name, cpr: v.spend / v.conversations }))
        .sort((a, b) => a.cpr - b.cpr)[0];

    document.getElementById('recommendations').innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="border border-black p-4">
                <h4 class="text-black font-bold mb-2">ESCALAR</h4>
                <ul class="text-sm text-black space-y-1">
                    <li>• Aumentar presupuesto en ${bestDemo ? bestDemo.name : 'mejores segmentos'}</li>
                    <li>• Duplicar campañas de mensajes</li>
                    <li>• CTR ${after.ctr.toFixed(2)}% indica buenos creativos</li>
                </ul>
            </div>
            <div class="border border-black p-4">
                <h4 class="text-black font-bold mb-2">OPTIMIZAR</h4>
                <ul class="text-sm text-black space-y-1">
                    <li>• Frecuencia ${after.frequency.toFixed(2)} está bien</li>
                    <li>• Probar creativos "lista de precios"</li>
                    <li>• A/B test en +65 años</li>
                </ul>
            </div>
            <div class="border border-black p-4">
                <h4 class="text-black font-bold mb-2">ELIMINAR</h4>
                <ul class="text-sm text-black space-y-1">
                    <li>• Campañas de interacción/vistas</li>
                    <li>• Anuncios con CPR > $0.50</li>
                    <li>• Audiencias con 0 conversaciones</li>
                </ul>
            </div>
        </div>
    `;
}

function renderComparativeStrengths(before, after) {
    // Calculate detailed metrics for comparison
    const beforeReachEfficiency = before.reach / before.spend;
    const afterReachEfficiency = after.reach / after.spend;

    const beforeImpressionsEfficiency = before.impressions / before.spend;
    const afterImpressionsEfficiency = after.impressions / after.spend;

    const beforeClicksPerDollar = before.clicks / before.spend;
    const afterClicksPerDollar = after.clicks / after.spend;

    // Calculate vanity results efficiency
    const beforeVanityEfficiency = before.vanityResults / before.spend;

    // Get campaign type breakdown
    const beforeCampaignTypes = Object.keys(before.resultTypes);
    const afterCampaignTypes = Object.keys(after.resultTypes);

    // Best demographics by ROI for each period
    const beforeBestDemos = Object.entries(before.demographics)
        .filter(([_, v]) => v.spend > 0 && v.results > 0)
        .map(([name, v]) => ({ name, roi: v.results / v.spend }))
        .sort((a, b) => b.roi - a.roi)
        .slice(0, 3);

    const afterBestDemos = Object.entries(after.demographics)
        .filter(([_, v]) => v.spend > 0 && v.conversations > 0)
        .map(([name, v]) => ({ name, roi: v.conversations / v.spend }))
        .sort((a, b) => b.roi - a.roi)
        .slice(0, 3);

    // Build strengths lists
    let beforeStrengths = [];
    let afterStrengths = [];

    // Reach efficiency
    if (beforeReachEfficiency > afterReachEfficiency) {
        beforeStrengths.push({ title: 'Mayor Alcance por Dólar', value: `${beforeReachEfficiency.toFixed(0)} personas/$`, detail: `Arizon: ${afterReachEfficiency.toFixed(0)}` });
    } else {
        afterStrengths.push({ title: 'Mayor Alcance por Dólar', value: `${afterReachEfficiency.toFixed(0)} personas/$`, detail: `Antes: ${beforeReachEfficiency.toFixed(0)}` });
    }

    // Impressions per dollar
    if (beforeImpressionsEfficiency > afterImpressionsEfficiency) {
        beforeStrengths.push({ title: 'Más Impresiones por Dólar', value: `${beforeImpressionsEfficiency.toFixed(0)} imp/$`, detail: `Arizon: ${afterImpressionsEfficiency.toFixed(0)}` });
    } else {
        afterStrengths.push({ title: 'Más Impresiones por Dólar', value: `${afterImpressionsEfficiency.toFixed(0)} imp/$`, detail: `Antes: ${beforeImpressionsEfficiency.toFixed(0)}` });
    }

    // Clicks per dollar
    if (beforeClicksPerDollar > afterClicksPerDollar) {
        beforeStrengths.push({ title: 'Más Clics por Dólar', value: `${beforeClicksPerDollar.toFixed(1)} clics/$`, detail: `Arizon: ${afterClicksPerDollar.toFixed(1)}` });
    } else {
        afterStrengths.push({ title: 'Más Clics por Dólar', value: `${afterClicksPerDollar.toFixed(1)} clics/$`, detail: `Antes: ${beforeClicksPerDollar.toFixed(1)}` });
    }

    // CPM comparison (lower is better)
    if (before.cpm < after.cpm) {
        beforeStrengths.push({ title: 'CPM Más Bajo', value: `$${before.cpm.toFixed(2)}`, detail: `Arizon: $${after.cpm.toFixed(2)}` });
    } else {
        afterStrengths.push({ title: 'CPM Más Bajo', value: `$${after.cpm.toFixed(2)}`, detail: `Antes: $${before.cpm.toFixed(2)}` });
    }

    // CTR comparison
    if (before.ctr > after.ctr) {
        beforeStrengths.push({ title: 'Mayor CTR', value: `${before.ctr.toFixed(2)}%`, detail: `Arizon: ${after.ctr.toFixed(2)}%` });
    } else {
        afterStrengths.push({ title: 'Mayor CTR', value: `${after.ctr.toFixed(2)}%`, detail: `Antes: ${before.ctr.toFixed(2)}%` });
    }

    // Conversion efficiency (always Arizon wins)
    afterStrengths.push({ title: 'Conversiones por Dólar', value: `${(after.conversations / after.spend * 100).toFixed(1)} conv/100$`, detail: `Antes: ${(before.conversations / before.spend * 100).toFixed(1)}` });
    afterStrengths.push({ title: 'Costo por Cliente Real', value: `$${after.costPerConversation.toFixed(2)}`, detail: `Antes: $${before.costPerConversation.toFixed(2)} (${((before.costPerConversation - after.costPerConversation) / before.costPerConversation * 100).toFixed(0)}% más caro)` });

    // Vanity results
    if (before.vanityResults > 0) {
        beforeStrengths.push({ title: 'Métricas de Vanidad', value: `${before.vanityResults.toLocaleString()} vistas/interact.`, detail: `(no se traducen en clientes)` });
    }

    // Frequency comparison
    if (before.frequency < after.frequency && Math.abs(before.frequency - after.frequency) > 0.2) {
        beforeStrengths.push({ title: 'Menor Saturación', value: `Frecuencia ${before.frequency.toFixed(2)}`, detail: `Arizon: ${after.frequency.toFixed(2)}` });
    }

    // Render before strengths
    let beforeHTML = beforeStrengths.length === 0 ? '<p class="text-muted-foreground italic">Sin métricas destacadas</p>' : '';
    beforeStrengths.forEach(s => { beforeHTML += `<div class="rounded-lg border p-3"><div class="font-medium text-foreground text-sm">${s.title}</div><div class="text-base font-semibold text-foreground">${s.value}</div><div class="text-xs text-muted-foreground">${s.detail}</div></div>`; });
    document.getElementById('beforeStrengths').innerHTML = beforeHTML;

    // Render after strengths
    let afterHTML = afterStrengths.length === 0 ? '<p class="text-muted-foreground italic">Sin métricas destacadas</p>' : '';
    afterStrengths.forEach(s => { afterHTML += `<div class="rounded-lg border p-3"><div class="font-medium text-foreground text-sm">${s.title}</div><div class="text-base font-semibold text-foreground">${s.value}</div><div class="text-xs text-muted-foreground">${s.detail}</div></div>`; });
    document.getElementById('arizonStrengths').innerHTML = afterHTML;

    // Hidden patterns - objective comparison
    document.getElementById('hiddenPatterns').innerHTML = `
        <div class="stat-card">
            <div class="font-medium text-foreground text-sm mb-1">Tipos de Campaña</div>
            <div class="text-muted-foreground text-sm"><span class="badge">Antes</span> ${beforeCampaignTypes.length} tipos</div>
            <div class="text-muted-foreground text-sm mt-1"><span class="badge badge-dark">Arizon</span> ${afterCampaignTypes.length} tipos</div>
        </div>
        <div class="stat-card">
            <div class="font-medium text-foreground text-sm mb-1">Mejor Demografía</div>
            <div class="text-muted-foreground text-sm">${afterBestDemos[0] ? `<strong>P2:</strong> ${afterBestDemos[0].name}` : 'N/A'}</div>
            <div class="text-muted-foreground text-sm">${beforeBestDemos[0] ? `<strong>P1:</strong> ${beforeBestDemos[0].name}` : 'N/A'}</div>
        </div>
        <div class="stat-card">
            <div class="font-medium text-foreground text-sm mb-1">Nota Metodológica</div>
            <div class="text-muted-foreground text-sm">Comparación objetiva basada en datos CSV</div>
            <div class="text-muted-foreground text-xs mt-1">Benchmarks: CTR 1.2%, CPM $10.88 (industria)</div>
        </div>
    `;
}

function renderHiddenInsights(before, after) {
    // Calculate deep insights
    const roiImprovement = ((before.costPerConversation - after.costPerConversation) / before.costPerConversation * 100).toFixed(1);
    const efficiencyMultiplier = (after.qualityScore / before.qualityScore).toFixed(2);
    const conversionRateMultiplier = (after.conversionRate / before.conversionRate).toFixed(1);

    // Benchmark comparisons
    const p1CTRvsBench = before.ctr >= META_BENCHMARKS_2025.ctr.avg ? 'CUMPLE' : 'NO CUMPLE';
    const p2CTRvsBench = after.ctr >= META_BENCHMARKS_2025.ctr.avg ? 'CUMPLE' : 'NO CUMPLE';
    const p1CPMvsBench = before.cpm <= META_BENCHMARKS_2025.cpm.avg ? 'CUMPLE' : 'NO CUMPLE';
    const p2CPMvsBench = after.cpm <= META_BENCHMARKS_2025.cpm.avg ? 'CUMPLE' : 'NO CUMPLE';
    const p1CPLvsBench = before.costPerConversation <= META_BENCHMARKS_2025.cpl.avg ? 'CUMPLE' : 'NO CUMPLE';
    const p2CPLvsBench = after.costPerConversation <= META_BENCHMARKS_2025.cpl.avg ? 'CUMPLE' : 'NO CUMPLE';
    const p1FreqvsBench = before.frequency <= META_BENCHMARKS_2025.frequency.prospecting ? 'CUMPLE' : 'NO CUMPLE';
    const p2FreqvsBench = after.frequency <= META_BENCHMARKS_2025.frequency.prospecting ? 'CUMPLE' : 'NO CUMPLE';

    // Projections
    const projectedConversationsAt2000 = Math.round(after.conversations * (2000 / after.spend));
    const projectedCostAt2000 = (2000 / projectedConversationsAt2000).toFixed(2);

    // Best/Worst performing demographics
    const bestDemo = Object.entries(after.demographics)
        .filter(([name, v]) => v.conversations > 0)
        .map(([name, v]) => ({ name, cpr: v.spend / v.conversations, conv: v.conversations }))
        .sort((a, b) => a.cpr - b.cpr)[0];

    const worstDemo = Object.entries(before.demographics)
        .filter(([name, v]) => v.conversations > 0)
        .map(([name, v]) => ({ name, cpr: v.spend / v.conversations, spend: v.spend }))
        .sort((a, b) => b.cpr - a.cpr)[0];

    document.getElementById('hiddenInsights').innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="border border-black p-4">
                <h4 class="font-bold text-black mb-3">EVALUACIÓN VS BENCHMARKS META 2025</h4>
                <table class="w-full text-sm">
                    <thead><tr class="border-b border-black"><th class="text-left py-1">KPI</th><th class="text-center">Antes</th><th class="text-center">Arizon</th><th class="text-center">Benchmark</th></tr></thead>
                    <tbody>
                        <tr class="border-b"><td class="py-1">CTR</td><td class="text-center">${before.ctr.toFixed(2)}% (${p1CTRvsBench})</td><td class="text-center">${after.ctr.toFixed(2)}% (${p2CTRvsBench})</td><td class="text-center">≥${META_BENCHMARKS_2025.ctr.avg}%</td></tr>
                        <tr class="border-b"><td class="py-1">CPM</td><td class="text-center">$${before.cpm.toFixed(2)} (${p1CPMvsBench})</td><td class="text-center">$${after.cpm.toFixed(2)} (${p2CPMvsBench})</td><td class="text-center">≤$${META_BENCHMARKS_2025.cpm.avg}</td></tr>
                        <tr class="border-b"><td class="py-1">CPL</td><td class="text-center">$${before.costPerConversation.toFixed(2)} (${p1CPLvsBench})</td><td class="text-center">$${after.costPerConversation.toFixed(2)} (${p2CPLvsBench})</td><td class="text-center">≤$${META_BENCHMARKS_2025.cpl.avg}</td></tr>
                        <tr><td class="py-1">Frecuencia</td><td class="text-center">${before.frequency.toFixed(2)} (${p1FreqvsBench})</td><td class="text-center">${after.frequency.toFixed(2)} (${p2FreqvsBench})</td><td class="text-center">≤${META_BENCHMARKS_2025.frequency.prospecting}</td></tr>
                    </tbody>
                </table>
            </div>
            
            <div class="border border-black p-4">
                <h4 class="font-bold text-black mb-3">MULTIPLICADORES DE EFICIENCIA Arizon vs Antes</h4>
                <ul class="text-sm text-black space-y-2">
                    <li>Cada $1 genera <strong>${efficiencyMultiplier}x más conversaciones</strong> en Arizon</li>
                    <li>Tasa de conversión <strong>${conversionRateMultiplier}x mayor</strong> en Arizon</li>
                    <li>Costo por cliente <strong>${roiImprovement}% menor</strong> en Arizon</li>
                </ul>
            </div>
            
            <div class="border border-black p-4">
                <h4 class="font-bold text-black mb-3">PROYECCIÓN CON $2,000</h4>
                <ul class="text-sm text-black space-y-2">
                    <li>Conversaciones proyectadas: <strong>${projectedConversationsAt2000.toLocaleString()}</strong></li>
                    <li>Costo por conversación: <strong>$${projectedCostAt2000}</strong></li>
                    <li class="text-xs">Basado en rendimiento de Arizon</li>
                </ul>
            </div>
            
            <div class="border border-black p-4">
                <h4 class="font-bold text-black mb-3">HALLAZGOS DE SEGMENTACIÓN</h4>
                <ul class="text-sm text-black space-y-2">
                    ${bestDemo ? `<li><strong>Mejor segmento P2:</strong> ${bestDemo.name} ($${bestDemo.cpr.toFixed(2)}/conv)</li>` : ''}
                    ${worstDemo ? `<li><strong>Peor segmento P1:</strong> ${worstDemo.name} ($${worstDemo.cpr.toFixed(2)}/conv)</li>` : ''}
                    <li>Las campañas de <strong>Conversaciones</strong> superan ${conversionRateMultiplier}x a las de interacción</li>
                </ul>
            </div>
        </div>
    `;
}

// Strategic Conclusion with PhD-level analysis
function renderStrategicConclusion(before, after) {
    // Count benchmarks met
    let p1Score = 0, p2Score = 0;
    if (before.ctr >= META_BENCHMARKS_2025.ctr.avg) p1Score++;
    if (after.ctr >= META_BENCHMARKS_2025.ctr.avg) p2Score++;
    if (before.cpm <= META_BENCHMARKS_2025.cpm.avg) p1Score++;
    if (after.cpm <= META_BENCHMARKS_2025.cpm.avg) p2Score++;
    if (before.costPerConversation <= META_BENCHMARKS_2025.cpl.avg) p1Score++;
    if (after.costPerConversation <= META_BENCHMARKS_2025.cpl.avg) p2Score++;
    if (before.frequency <= META_BENCHMARKS_2025.frequency.prospecting) p1Score++;
    if (after.frequency <= META_BENCHMARKS_2025.frequency.prospecting) p2Score++;

    // What's done well/poorly
    const p1Good = [], p1Bad = [], p2Good = [], p2Bad = [];

    if (before.ctr >= META_BENCHMARKS_2025.ctr.avg) p1Good.push(`CTR ${before.ctr.toFixed(2)}% supera benchmark`);
    else p1Bad.push(`CTR ${before.ctr.toFixed(2)}% debajo de benchmark (${META_BENCHMARKS_2025.ctr.avg}%)`);

    if (before.cpm <= META_BENCHMARKS_2025.cpm.avg) p1Good.push(`CPM $${before.cpm.toFixed(2)} competitivo`);
    else p1Bad.push(`CPM $${before.cpm.toFixed(2)} elevado vs benchmark ($${META_BENCHMARKS_2025.cpm.avg})`);

    if (before.costPerConversation <= META_BENCHMARKS_2025.cpl.avg) p1Good.push(`CPL $${before.costPerConversation.toFixed(2)} eficiente`);
    else p1Bad.push(`CPL $${before.costPerConversation.toFixed(2)} alto vs benchmark ($${META_BENCHMARKS_2025.cpl.avg})`);

    if (before.frequency <= META_BENCHMARKS_2025.frequency.prospecting) p1Good.push(`Frecuencia ${before.frequency.toFixed(2)} óptima`);
    else p1Bad.push(`Frecuencia ${before.frequency.toFixed(2)} alta (saturación potencial)`);

    if (after.ctr >= META_BENCHMARKS_2025.ctr.avg) p2Good.push(`CTR ${after.ctr.toFixed(2)}% supera benchmark`);
    else p2Bad.push(`CTR ${after.ctr.toFixed(2)}% debajo de benchmark (${META_BENCHMARKS_2025.ctr.avg}%)`);

    if (after.cpm <= META_BENCHMARKS_2025.cpm.avg) p2Good.push(`CPM $${after.cpm.toFixed(2)} competitivo`);
    else p2Bad.push(`CPM $${after.cpm.toFixed(2)} elevado vs benchmark ($${META_BENCHMARKS_2025.cpm.avg})`);

    if (after.costPerConversation <= META_BENCHMARKS_2025.cpl.avg) p2Good.push(`CPL $${after.costPerConversation.toFixed(2)} eficiente`);
    else p2Bad.push(`CPL $${after.costPerConversation.toFixed(2)} alto vs benchmark ($${META_BENCHMARKS_2025.cpl.avg})`);

    if (after.frequency <= META_BENCHMARKS_2025.frequency.prospecting) p2Good.push(`Frecuencia ${after.frequency.toFixed(2)} óptima`);
    else p2Bad.push(`Frecuencia ${after.frequency.toFixed(2)} alta (saturación potencial)`);

    // Final recommendation
    const winner = p2Score > p1Score ? 'Arizon' : (p1Score > p2Score ? 'Antes' : 'Ambos períodos son similares');
    const recommendation = after.costPerConversation < before.costPerConversation
        ? `Para una tienda de electrónicos donde el objetivo es generar conversaciones/leads cualificados, la estrategia de <strong>Arizon</strong> ofrece un costo por conversación ${((before.costPerConversation - after.costPerConversation) / before.costPerConversation * 100).toFixed(0)}% menor, lo cual representa un ROI superior.`
        : `Ambas estrategias tienen méritos. Se recomienda analizar el valor de vida del cliente (LTV) para determinar cuál genera clientes más valiosos a largo plazo.`;

    document.getElementById('strategicConclusion').innerHTML = `
        <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="border border-black p-4">
                    <h4 class="font-bold text-black mb-3">ANTES - ANÁLISIS</h4>
                    <p class="text-xs mb-2">Score: ${p1Score}/4 métricas en benchmark</p>
                    <div class="mb-3">
                        <p class="font-semibold text-sm">¿Qué hace BIEN?</p>
                        <ul class="text-sm text-black">${p1Good.length > 0 ? p1Good.map(x => `<li>• ${x}</li>`).join('') : '<li>• Ninguna métrica supera benchmarks</li>'}</ul>
                    </div>
                    <div>
                        <p class="font-semibold text-sm">¿Qué hace MAL?</p>
                        <ul class="text-sm text-black">${p1Bad.length > 0 ? p1Bad.map(x => `<li>• ${x}</li>`).join('') : '<li>• Todas las métricas en benchmark</li>'}</ul>
                    </div>
                </div>
                
                <div class="border border-black p-4">
                    <h4 class="font-bold text-black mb-3">ARIZON - ANÁLISIS</h4>
                    <p class="text-xs mb-2">Score: ${p2Score}/4 métricas en benchmark</p>
                    <div class="mb-3">
                        <p class="font-semibold text-sm">¿Qué hace BIEN?</p>
                        <ul class="text-sm text-black">${p2Good.length > 0 ? p2Good.map(x => `<li>• ${x}</li>`).join('') : '<li>• Ninguna métrica supera benchmarks</li>'}</ul>
                    </div>
                    <div>
                        <p class="font-semibold text-sm">¿Qué hace MAL?</p>
                        <ul class="text-sm text-black">${p2Bad.length > 0 ? p2Bad.map(x => `<li>• ${x}</li>`).join('') : '<li>• Todas las métricas en benchmark</li>'}</ul>
                    </div>
                </div>
            </div>
            
            <div class="border-2 border-black p-4">
                <h4 class="font-bold text-black mb-2">RECOMENDACIÓN FINAL (Tienda de Electrónicos)</h4>
                <p class="text-sm text-black">${recommendation}</p>
                <p class="text-sm text-black mt-2"><strong>Estrategia ganadora por benchmarks:</strong> ${winner} (${Math.max(p1Score, p2Score)}/4 métricas)</p>
            </div>
        </div>
    `;
}

function renderDemographicsChart(before, after) {
    const allKeys = [...new Set([...Object.keys(before.demographics), ...Object.keys(after.demographics)])]
        .filter(k => !k.includes('Unknown') && !k.includes('Otro'))
        .sort();

    new Chart(document.getElementById('demographicsChart'), {
        type: 'bar',
        data: {
            labels: allKeys,
            datasets: [
                { label: 'Antes ($)', data: allKeys.map(k => before.demographics[k]?.spend || 0), backgroundColor: '#000000', barThickness: 12 },
                { label: 'Arizon ($)', data: allKeys.map(k => after.demographics[k]?.spend || 0), backgroundColor: '#666666', barThickness: 12 }
            ]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' }
            },
            scales: {
                x: { beginAtZero: true, title: { display: true, text: 'Gasto ($)' } },
                y: { ticks: { font: { size: 11 } } }
            }
        }
    });
}

// ============================================
// DEEP ANALYSIS FUNCTIONS - Enhanced Insights
// ============================================

function renderEfficiencyMatrix(before, after) {
    // Analyze all demographics for P2 (current strategy)
    const demoAnalysis = Object.entries(after.demographics)
        .filter(([name, v]) => v.conversations > 0 && v.spend > 5)
        .map(([name, v]) => ({
            name,
            spend: v.spend,
            conversations: v.conversations,
            cpr: v.spend / v.conversations,
            reach: v.reach || 0,
            efficiency: v.conversations / v.spend * 100 // conversations per $100
        }))
        .sort((a, b) => a.cpr - b.cpr);

    const best3 = demoAnalysis.slice(0, 3);
    const worst3 = demoAnalysis.slice(-3).reverse();

    // Calculate potential savings
    const avgCPR = demoAnalysis.reduce((s, d) => s + d.cpr, 0) / demoAnalysis.length;
    const worstSpend = worst3.reduce((s, d) => s + d.spend, 0);
    const potentialSavings = worst3.reduce((s, d) => s + (d.spend * (1 - avgCPR / d.cpr)), 0);

    // Find untapped opportunities (high reach, low conversions)
    const untapped = Object.entries(after.demographics)
        .filter(([name, v]) => v.reach > 5000 && v.conversations < 50)
        .map(([name, v]) => ({ name, reach: v.reach, conversations: v.conversations }))
        .slice(0, 3);

    document.getElementById('efficiencyMatrix').innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div class="border-2 border-black p-4">
                <h4 class="font-bold text-black mb-3">SEGMENTOS MÁS EFICIENTES (P2)</h4>
                ${best3.map((d, i) => `
                    <div class="flex justify-between items-center p-2 border border-black mb-2">
                        <div>
                            <span class="font-medium text-black">${i + 1}. ${d.name}</span>
                            <span class="text-xs text-black block">${d.conversations} conv | $${d.spend.toFixed(0)} invertido</span>
                        </div>
                        <div class="text-right">
                            <span class="font-bold text-black">$${d.cpr.toFixed(2)}</span>
                            <span class="text-xs text-black block">por conv.</span>
                        </div>
                    </div>
                `).join('')}
                <p class="text-xs text-black mt-2 font-medium">ACCIÓN: Escalar presupuesto en estos segmentos</p>
            </div>
            <div class="border border-black p-4">
                <h4 class="font-bold text-black mb-3">SEGMENTOS INEFICIENTES (P2)</h4>
                ${worst3.map(d => `
                    <div class="flex justify-between items-center p-2 border border-black mb-2">
                        <div>
                            <span class="font-medium text-black">${d.name}</span>
                            <span class="text-xs text-black block">${d.conversations} conv | $${d.spend.toFixed(0)} invertido</span>
                        </div>
                        <div class="text-right">
                            <span class="font-bold text-black">$${d.cpr.toFixed(2)}</span>
                            <span class="text-xs text-black block">por conv.</span>
                        </div>
                    </div>
                `).join('')}
                <p class="text-xs text-black mt-2 font-medium">AHORRO POTENCIAL: $${potentialSavings.toFixed(0)} si se reasigna</p>
            </div>
        </div>
        ${untapped.length > 0 ? `
        <div class="border border-black p-4 mt-4">
            <h4 class="font-bold text-black mb-2">OPORTUNIDADES SIN EXPLOTAR</h4>
            <p class="text-xs text-black mb-2">Segmentos con alto alcance pero pocas conversiones (optimizar creativos):</p>
            <div class="flex gap-2 flex-wrap">
                ${untapped.map(u => `
                    <span class="border border-black px-2 py-1 text-xs">${u.name} (${u.reach.toLocaleString()} alcance → ${u.conversations} conv)</span>
                `).join('')}
            </div>
        </div>
        ` : ''}
    `;
}

function renderCampaignTypeAnalysis(before, after) {
    // Aggregate by result type for each period
    const aggregateByType = (data) => {
        const types = {};
        data.forEach(row => {
            const type = row['Tipo de resultado'] || 'Otro';
            if (!types[type]) types[type] = { spend: 0, results: 0, reach: 0, impressions: 0 };
            types[type].spend += parseFloat(row['Importe gastado (USD)']) || 0;
            types[type].results += parseFloat(row['Resultados']) || 0;
            types[type].reach += parseFloat(row['Alcance']) || 0;
            types[type].impressions += parseFloat(row['Impresiones']) || 0;
        });
        return types;
    };

    const p1Types = aggregateByType(beforeData);
    const p2Types = aggregateByType(afterData);

    const allTypes = [...new Set([...Object.keys(p1Types), ...Object.keys(p2Types)])];

    const typeAnalysis = allTypes.map(type => {
        const p1 = p1Types[type] || { spend: 0, results: 0 };
        const p2 = p2Types[type] || { spend: 0, results: 0 };
        const p1CPR = p1.results > 0 ? p1.spend / p1.results : Infinity;
        const p2CPR = p2.results > 0 ? p2.spend / p2.results : Infinity;

        let recommendation = '-';
        if (type.includes('Conversaciones') || type.includes('mensajes')) {
            recommendation = 'ESCALAR';
        } else if (type.includes('Interacci') && p2CPR > 0.05) {
            recommendation = 'REDUCIR';
        } else if (type.includes('Visitas')) {
            recommendation = 'EVALUAR';
        } else {
            recommendation = p2CPR < p1CPR ? 'MANTENER' : 'OPTIMIZAR';
        }

        return {
            type: type.length > 35 ? type.substring(0, 35) + '...' : type,
            p1Spend: p1.spend,
            p1Results: p1.results,
            p1CPR,
            p2Spend: p2.spend,
            p2Results: p2.results,
            p2CPR,
            recommendation
        };
    }).sort((a, b) => b.p2Spend - a.p2Spend);

    document.getElementById('campaignTypeAnalysis').innerHTML = `
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead class="bg-black text-white text-xs uppercase">
                    <tr>
                        <th class="p-2 text-left">Tipo de Resultado</th>
                        <th class="p-2 text-center">Antes Gasto</th>
                        <th class="p-2 text-center">Antes Res</th>
                        <th class="p-2 text-center">Antes CPR</th>
                        <th class="p-2 text-center">Arizon Gasto</th>
                        <th class="p-2 text-center">Arizon Res</th>
                        <th class="p-2 text-center">Arizon CPR</th>
                        <th class="p-2 text-center">Acción</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-black">
                    ${typeAnalysis.map(t => `
                        <tr>
                            <td class="p-2 text-black text-xs">${t.type}</td>
                            <td class="p-2 text-center text-black">$${t.p1Spend.toFixed(0)}</td>
                            <td class="p-2 text-center text-black">${t.p1Results.toLocaleString()}</td>
                            <td class="p-2 text-center text-black">$${t.p1CPR === Infinity ? '-' : t.p1CPR.toFixed(2)}</td>
                            <td class="p-2 text-center text-black font-semibold">$${t.p2Spend.toFixed(0)}</td>
                            <td class="p-2 text-center text-black font-semibold">${t.p2Results.toLocaleString()}</td>
                            <td class="p-2 text-center text-black font-semibold">$${t.p2CPR === Infinity ? '-' : t.p2CPR.toFixed(2)}</td>
                            <td class="p-2 text-center"><span class="border border-black px-2 py-1 text-xs font-semibold">${t.recommendation}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function renderCreativePerformance(before, after) {
    // Analyze ad name patterns
    const patterns = {
        'Reel': { regex: /reel/i, p1: { spend: 0, conv: 0 }, p2: { spend: 0, conv: 0 } },
        'Carrusel': { regex: /carrusel/i, p1: { spend: 0, conv: 0 }, p2: { spend: 0, conv: 0 } },
        'Lista': { regex: /lista/i, p1: { spend: 0, conv: 0 }, p2: { spend: 0, conv: 0 } },
        'Publicación': { regex: /publicaci|instagram:/i, p1: { spend: 0, conv: 0 }, p2: { spend: 0, conv: 0 } },
        'Unboxing': { regex: /unboxing/i, p1: { spend: 0, conv: 0 }, p2: { spend: 0, conv: 0 } }
    };

    const analyzeData = (data, period) => {
        data.forEach(row => {
            const name = row['Nombre del anuncio'] || '';
            const spend = parseFloat(row['Importe gastado (USD)']) || 0;
            const results = parseFloat(row['Resultados']) || 0;
            const type = row['Tipo de resultado'] || '';
            const isConv = type.includes('Conversaciones') || type.includes('mensajes');

            Object.entries(patterns).forEach(([key, p]) => {
                if (p.regex.test(name)) {
                    p[period].spend += spend;
                    if (isConv) p[period].conv += results;
                }
            });
        });
    };

    analyzeData(beforeData, 'p1');
    analyzeData(afterData, 'p2');

    const formatAnalysis = Object.entries(patterns)
        .map(([name, p]) => ({
            name,
            p1CPR: p.p1.conv > 0 ? p.p1.spend / p.p1.conv : Infinity,
            p2CPR: p.p2.conv > 0 ? p.p2.spend / p.p2.conv : Infinity,
            p1Spend: p.p1.spend,
            p2Spend: p.p2.spend,
            p1Conv: p.p1.conv,
            p2Conv: p.p2.conv
        }))
        .filter(f => f.p1Spend > 0 || f.p2Spend > 0)
        .sort((a, b) => (a.p2CPR === Infinity ? 999 : a.p2CPR) - (b.p2CPR === Infinity ? 999 : b.p2CPR));

    document.getElementById('creativePerformance').innerHTML = `
        <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
            ${formatAnalysis.map(f => `
                <div class="border ${f.p2Conv > 0 && f.p2CPR < 1 ? 'border-2' : ''} border-black p-3 text-center">
                    <p class="font-bold text-black">${f.name}</p>
                    <div class="mt-2 text-xs text-black">
                        <p>P1: ${f.p1Conv} conv ($${f.p1CPR === Infinity ? '-' : f.p1CPR.toFixed(2)})</p>
                        <p class="font-semibold">P2: ${f.p2Conv} conv ($${f.p2CPR === Infinity ? '-' : f.p2CPR.toFixed(2)})</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderBenchmarkCompliance(before, after) {
    const evaluate = (value, benchmark, isLowerBetter) => {
        return isLowerBetter ? value <= benchmark : value >= benchmark;
    };

    const metrics = [
        { name: 'CTR', p1: before.ctr, p2: after.ctr, bench: META_BENCHMARKS_2025.ctr.avg, unit: '%', lower: false },
        { name: 'CPM', p1: before.cpm, p2: after.cpm, bench: META_BENCHMARKS_2025.cpm.avg, unit: '$', lower: true },
        { name: 'CPC', p1: before.cpc, p2: after.cpc, bench: META_BENCHMARKS_2025.cpc.avg, unit: '$', lower: true },
        { name: 'CPL', p1: before.costPerConversation, p2: after.costPerConversation, bench: META_BENCHMARKS_2025.cpl.avg, unit: '$', lower: true },
        { name: 'Frecuencia', p1: before.frequency, p2: after.frequency, bench: META_BENCHMARKS_2025.frequency.prospecting, unit: '', lower: true }
    ];

    const p1Score = metrics.filter(m => evaluate(m.p1, m.bench, m.lower)).length;
    const p2Score = metrics.filter(m => evaluate(m.p2, m.bench, m.lower)).length;

    document.getElementById('benchmarkCompliance').innerHTML = `
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead class="bg-black text-white text-xs uppercase">
                    <tr>
                        <th class="p-2 text-left">Métrica</th>
                        <th class="p-2 text-center">Antes</th>
                        <th class="p-2 text-center">Arizon</th>
                        <th class="p-2 text-center">Benchmark</th>
                        <th class="p-2 text-center">P1 Cumple</th>
                        <th class="p-2 text-center">P2 Cumple</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-black">
                    ${metrics.map(m => `
                        <tr>
                            <td class="p-2 font-medium text-black">${m.name}</td>
                            <td class="p-2 text-center text-black">${m.unit === '$' ? '$' : ''}${m.p1.toFixed(2)}${m.unit === '%' ? '%' : ''}</td>
                            <td class="p-2 text-center text-black font-semibold">${m.unit === '$' ? '$' : ''}${m.p2.toFixed(2)}${m.unit === '%' ? '%' : ''}</td>
                            <td class="p-2 text-center text-black">${m.lower ? '≤' : '≥'}${m.unit === '$' ? '$' : ''}${m.bench}${m.unit === '%' ? '%' : ''}</td>
                            <td class="p-2 text-center">${evaluate(m.p1, m.bench, m.lower) ? '<span class="font-bold">SI</span>' : 'NO'}</td>
                            <td class="p-2 text-center">${evaluate(m.p2, m.bench, m.lower) ? '<span class="font-bold">SI</span>' : 'NO'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <div class="flex justify-between mt-4 border-t border-black pt-3">
            <span class="font-bold text-black">Score Antes: ${p1Score}/5 métricas en benchmark</span>
            <span class="font-bold text-black">Score Arizon: ${p2Score}/5 métricas en benchmark</span>
        </div>
    `;
}

function renderAutoInsights(before, after) {
    const insights = [];

    // 1. Budget reallocation insight
    const demoAnalysis = Object.entries(after.demographics)
        .filter(([, v]) => v.conversations > 0)
        .map(([name, v]) => ({ name, cpr: v.spend / v.conversations, spend: v.spend }))
        .sort((a, b) => a.cpr - b.cpr);

    if (demoAnalysis.length >= 4) {
        const best = demoAnalysis[0];
        const worst = demoAnalysis[demoAnalysis.length - 1];
        const savingsPercent = ((1 - best.cpr / worst.cpr) * 100).toFixed(0);
        insights.push(`Reasignar presupuesto de "${worst.name}" ($${worst.spend.toFixed(0)}) hacia "${best.name}" podría reducir CPR en ${savingsPercent}%`);
    }

    // 2. Best performing keyword
    const keywords = {};
    afterData.forEach(row => {
        const name = row['Nombre del anuncio'] || '';
        const results = parseFloat(row['Resultados']) || 0;
        const type = row['Tipo de resultado'] || '';
        if (type.includes('Conversaciones') && results > 0) {
            const words = name.toUpperCase().match(/[A-ZÁÉÍÓÚÑ0-9]+/g) || [];
            words.filter(w => w.length > 3).forEach(w => {
                keywords[w] = (keywords[w] || 0) + results;
            });
        }
    });
    const topKeyword = Object.entries(keywords).sort((a, b) => b[1] - a[1])[0];
    if (topKeyword) {
        insights.push(`Anuncios con "${topKeyword[0]}" generaron ${topKeyword[1]} conversaciones - replicar este patrón`);
    }

    // 3. Campaign type insight
    const convSpend = afterData.filter(r => (r['Tipo de resultado'] || '').includes('Conversaciones'))
        .reduce((s, r) => s + (parseFloat(r['Importe gastado (USD)']) || 0), 0);
    const totalSpend = after.spend;
    const convPercent = (convSpend / totalSpend * 100).toFixed(0);
    if (convPercent < 80) {
        insights.push(`Solo ${convPercent}% del presupuesto P2 va a campañas de conversión - incrementar a 90%+`);
    }

    // 4. Frequency insight
    if (after.frequency > 2) {
        insights.push(`Frecuencia de ${after.frequency.toFixed(2)} indica saturación - expandir audiencia o rotar creativos`);
    }

    // 5. CTR comparison
    if (after.ctr > before.ctr * 1.2) {
        insights.push(`CTR mejoró ${((after.ctr / before.ctr - 1) * 100).toFixed(0)}% - creativos P2 son más efectivos`);
    }

    document.getElementById('autoInsights').innerHTML = `
        <div class="space-y-3">
            ${insights.map((insight, i) => `
                <div class="flex gap-3 items-start p-3 border border-black">
                    <span class="font-bold text-black">${i + 1}.</span>
                    <p class="text-sm text-black">${insight}</p>
                </div>
            `).join('')}
        </div>
    `;
}

