/**
 * Analizador Meta Ads - Versión Genérica Configurable
 * Arizon.ai Intelligence Unit
 */

// Configuration object - populated from UI
let CONFIG = {
    period1Name: 'Período 1',
    period2Name: 'Período 2',
    period1: {
        startDate: null,
        endDate: null,
        excludeKeywords: []
    },
    period2: {
        startDate: null,
        endDate: null,
        includeKeywords: []
    },
    benchmarks: {
        ctr: 1.4,
        cpm: 10.88,
        cpl: 15,
        frequency: 1.5
    },
    client: {
        name: '',
        objective: 'conversaciones',
        monthlyBudget: 2000,
        industry: 'ecommerce'
    }
};

// Toggle custom sector input visibility
function toggleCustomSector() {
    const select = document.getElementById('industrySector');
    const customInput = document.getElementById('customSector');
    if (select.value === 'custom') {
        customInput.classList.remove('hidden');
        customInput.focus();
    } else {
        customInput.classList.add('hidden');
    }
}

// Get current industry value (handles custom input)
function getIndustryValue() {
    const select = document.getElementById('industrySector');
    if (select.value === 'custom') {
        return document.getElementById('customSector').value || 'Personalizado';
    }
    return select.options[select.selectedIndex].text;
}

// Filter configuration
let FILTERS = {
    comparisonMode: 'dates',
    deliveryActive: true,
    deliveryNotDelivering: true,
    minSpend: 0,
    nameContains: '',
    nameExcludes: '',
    ages: ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'],
    genders: ['male', 'female'],
    thresholds: {
        ctrGood: 2,
        cpmGood: 8,
        cplGood: 10,
        freqGood: 1.5
    }
};

// Apply presets
function applyPreset(preset) {
    switch (preset) {
        case 'monthVsMonth':
            // Set to previous month vs current month
            const today = new Date();
            const firstDayThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

            document.getElementById('period1Start').valueAsDate = firstDayLastMonth;
            document.getElementById('period1End').valueAsDate = lastDayLastMonth;
            document.getElementById('period2Start').valueAsDate = firstDayThisMonth;
            document.getElementById('period2End').valueAsDate = today;
            document.getElementById('period1Name').value = 'Mes Anterior';
            document.getElementById('period2Name').value = 'Mes Actual';
            break;

        case 'weekVsWeek':
            const now = new Date();
            const lastWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
            const lastWeekEnd = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const thisWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

            document.getElementById('period1Start').valueAsDate = lastWeekStart;
            document.getElementById('period1End').valueAsDate = lastWeekEnd;
            document.getElementById('period2Start').valueAsDate = thisWeekStart;
            document.getElementById('period2End').valueAsDate = now;
            document.getElementById('period1Name').value = 'Semana Anterior';
            document.getElementById('period2Name').value = 'Esta Semana';
            break;

        case 'bestPerformers':
            document.getElementById('minSpend').value = 10;
            document.getElementById('thresholdCPLGood').value = 15;
            alert('Filtro aplicado: Solo ads con gasto >$10. Ajusta CPL threshold si es necesario.');
            break;

        case 'problemAds':
            document.getElementById('thresholdCTRGood').value = 1;
            document.getElementById('thresholdCPLGood').value = 20;
            alert('Buscando ads problemáticos: CTR <1% o CPL >$20');
            break;

        case 'resetFilters':
            document.getElementById('filterActive').checked = true;
            document.getElementById('filterNotDelivering').checked = true;
            document.getElementById('minSpend').value = 0;
            document.getElementById('filterNameContains').value = '';
            document.getElementById('filterNameExcludes').value = '';
            document.getElementById('filterMale').checked = true;
            document.getElementById('filterFemale').checked = true;
            document.querySelectorAll('.ageFilter').forEach(cb => cb.checked = true);
            break;
    }
}

// Load filter configuration from UI
function loadFilters() {
    FILTERS.comparisonMode = document.querySelector('input[name="comparisonMode"]:checked')?.value || 'dates';
    FILTERS.deliveryActive = document.getElementById('filterActive')?.checked ?? true;
    FILTERS.deliveryNotDelivering = document.getElementById('filterNotDelivering')?.checked ?? true;
    FILTERS.minSpend = parseFloat(document.getElementById('minSpend')?.value) || 0;
    FILTERS.nameContains = document.getElementById('filterNameContains')?.value?.toLowerCase() || '';
    FILTERS.nameExcludes = document.getElementById('filterNameExcludes')?.value?.toLowerCase() || '';
    FILTERS.genders = [];
    if (document.getElementById('filterMale')?.checked) FILTERS.genders.push('male');
    if (document.getElementById('filterFemale')?.checked) FILTERS.genders.push('female');
    FILTERS.ages = Array.from(document.querySelectorAll('.ageFilter:checked')).map(cb => cb.value);
    FILTERS.thresholds = {
        ctrGood: parseFloat(document.getElementById('thresholdCTRGood')?.value) || 2,
        cpmGood: parseFloat(document.getElementById('thresholdCPMGood')?.value) || 8,
        cplGood: parseFloat(document.getElementById('thresholdCPLGood')?.value) || 10,
        freqGood: parseFloat(document.getElementById('thresholdFreqGood')?.value) || 1.5
    };
}

// Apply filters to data
function filterData(data) {
    return data.filter(row => {
        // Delivery status filter
        const status = row['Estado de la entrega'] || '';
        if (status === 'active' && !FILTERS.deliveryActive) return false;
        if (status === 'not_delivering' && !FILTERS.deliveryNotDelivering) return false;

        // Minimum spend filter
        const spend = parseFloat(row['Importe gastado (USD)']) || 0;
        if (spend < FILTERS.minSpend) return false;

        // Name contains filter
        const name = (row['Nombre del anuncio'] || '').toLowerCase();
        if (FILTERS.nameContains && !name.includes(FILTERS.nameContains)) return false;

        // Name excludes filter
        if (FILTERS.nameExcludes && name.includes(FILTERS.nameExcludes)) return false;

        // Age filter
        const age = row['Edad'] || '';
        if (age && FILTERS.ages.length > 0 && !FILTERS.ages.includes(age)) return false;

        // Gender filter
        const gender = row['Sexo'] || '';
        if (gender && FILTERS.genders.length > 0 && !FILTERS.genders.includes(gender)) return false;

        return true;
    });
}

// Data storage
let rawData = [];
let filteredData = [];
let beforeData = [];
let afterData = [];
let demographicsChart = null;

// DOM Elements
const configPanel = document.getElementById('configPanel');
const analysisResults = document.getElementById('analysisResults');
const resetBtn = document.getElementById('resetBtn');
const startBtn = document.getElementById('startAnalysis');
const csvInput = document.getElementById('csvFile');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Set default dates (last 30 days for P1, last 15 for P2)
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const fifteenDaysAgo = new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000);

    // P1 defaults: 30 days ago to 15 days ago
    document.getElementById('period1Start').valueAsDate = thirtyDaysAgo;
    document.getElementById('period1End').valueAsDate = fifteenDaysAgo;

    // P2 defaults: 15 days ago to today
    document.getElementById('period2Start').valueAsDate = fifteenDaysAgo;
    document.getElementById('period2End').valueAsDate = today;

    // File input handler
    csvInput.addEventListener('change', handleFileUpload);

    // Start analysis button
    startBtn.addEventListener('click', startAnalysis);
});

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    document.getElementById('fileInfo').classList.remove('hidden');
    document.getElementById('fileName').textContent = file.name;

    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
            rawData = results.data;
            document.getElementById('fileRows').textContent = rawData.length;
            startBtn.disabled = false;

            // Auto-detect date range from CSV
            autoDetectDateRange();

            // Auto-detect objectives from CSV
            autoDetectObjectives();
        },
        error: (err) => {
            showError('Error al leer CSV: ' + err.message);
        }
    });
}

function autoDetectDateRange() {
    let minDate = null;
    let maxDate = null;
    const monthsData = {}; // Track data by month

    rawData.forEach(row => {
        // Try 'Inicio del informe' first (report date range), then 'Inicio' (ad start date)
        let startDateStr = row['Inicio del informe'] || row['Inicio'];
        let endDateStr = row['Fin del informe'] || row['Fin'];

        // Handle "En curso" (ongoing) - replace with today's date
        if (endDateStr === 'En curso' || !endDateStr) {
            endDateStr = new Date().toISOString().split('T')[0];
        }

        const startDate = parseDate(startDateStr);
        const endDate = parseDate(endDateStr);

        if (startDate) {
            if (!minDate || startDate < minDate) minDate = startDate;

            // Track spend by month
            const monthKey = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
            if (!monthsData[monthKey]) monthsData[monthKey] = { spend: 0, rows: 0 };
            monthsData[monthKey].spend += parseFloat(row['Importe gastado (USD)']) || 0;
            monthsData[monthKey].rows++;
        }
        if (endDate) {
            if (!maxDate || endDate > maxDate) maxDate = endDate;
        }
    });

    if (minDate && maxDate) {
        const months = Object.keys(monthsData).sort();
        console.log('Detected months:', months, monthsData);

        if (months.length >= 2) {
            // Use actual month boundaries for better splitting
            const p1Month = months[0];
            const p2Month = months[months.length - 1];

            const [p1Year, p1M] = p1Month.split('-').map(Number);
            const [p2Year, p2M] = p2Month.split('-').map(Number);

            // P1: First month start to end
            const p1Start = new Date(p1Year, p1M - 1, 1);
            const p1End = new Date(p1Year, p1M, 0); // Last day of p1 month

            // P2: Last month start to end  
            const p2Start = new Date(p2Year, p2M - 1, 1);
            const p2End = new Date(p2Year, p2M, 0); // Last day of p2 month

            document.getElementById('period1Start').valueAsDate = p1Start;
            document.getElementById('period1End').valueAsDate = p1End;
            document.getElementById('period2Start').valueAsDate = p2Start;
            document.getElementById('period2End').valueAsDate = p2End;

            // Update period names
            const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            document.getElementById('period1Name').value = `${monthNames[p1M - 1]} ${p1Year}`;
            document.getElementById('period2Name').value = `${monthNames[p2M - 1]} ${p2Year}`;

            console.log(`Auto-detected: P1=${p1Month} (${monthsData[p1Month]?.rows} rows), P2=${p2Month} (${monthsData[p2Month]?.rows} rows)`);
        } else {
            // Single month - split by midpoint
            const midPoint = new Date((minDate.getTime() + maxDate.getTime()) / 2);
            document.getElementById('period1Start').valueAsDate = minDate;
            document.getElementById('period1End').valueAsDate = midPoint;
            document.getElementById('period2Start').valueAsDate = midPoint;
            document.getElementById('period2End').valueAsDate = maxDate;
        }

        console.log(`Date range: ${minDate.toLocaleDateString()} - ${maxDate.toLocaleDateString()}`);
    }
}

function autoDetectObjectives() {
    const objectives = {};

    rawData.forEach(row => {
        const tipo = row['Tipo de resultado'];
        if (tipo) {
            if (!objectives[tipo]) objectives[tipo] = { count: 0, spend: 0, results: 0 };
            objectives[tipo].count++;
            objectives[tipo].spend += parseFloat(row['Importe gastado (USD)']) || 0;
            objectives[tipo].results += parseFloat(row['Resultados']) || 0;
        }
    });

    // Sort by spend and get top objectives
    const sorted = Object.entries(objectives)
        .sort((a, b) => b[1].spend - a[1].spend);

    // Store detected objectives in CONFIG
    CONFIG.detectedObjectives = objectives;

    // Update file info with detected objectives
    const fileInfoEl = document.getElementById('fileInfo');
    const objectivesHTML = sorted.slice(0, 5).map(([name, data]) =>
        `<span class="inline-block bg-black text-white text-xs px-2 py-1 mr-1 mb-1">${name.substring(0, 30)}${name.length > 30 ? '...' : ''} ($${data.spend.toFixed(0)})</span>`
    ).join('');

    const existingObjectivesInfo = document.getElementById('detectedObjectives');
    if (existingObjectivesInfo) {
        existingObjectivesInfo.innerHTML = objectivesHTML;
    } else {
        fileInfoEl.innerHTML += `
            <p class="text-sm mt-2"><strong>Objetivos detectados:</strong></p>
            <div id="detectedObjectives" class="mt-1">${objectivesHTML}</div>
        `;
    }

    console.log('Detected objectives:', sorted);
}

function showError(msg) {
    const errEl = document.getElementById('configError');
    errEl.textContent = msg;
    errEl.classList.remove('hidden');
}

function loadConfiguration() {
    CONFIG.period1Name = document.getElementById('period1Name').value || 'Período 1';
    CONFIG.period2Name = document.getElementById('period2Name').value || 'Período 2';

    // Period 1 dates
    const p1Start = document.getElementById('period1Start').value;
    const p1End = document.getElementById('period1End').value;
    if (!p1Start || !p1End) {
        showError('Por favor selecciona las fechas del Período 1');
        return false;
    }
    CONFIG.period1.startDate = new Date(p1Start + 'T00:00:00');
    CONFIG.period1.endDate = new Date(p1End + 'T23:59:59');

    // Period 2 dates
    const p2Start = document.getElementById('period2Start').value;
    const p2End = document.getElementById('period2End').value;
    if (!p2Start || !p2End) {
        showError('Por favor selecciona las fechas del Período 2');
        return false;
    }
    CONFIG.period2.startDate = new Date(p2Start + 'T00:00:00');
    CONFIG.period2.endDate = new Date(p2End + 'T23:59:59');

    // Keywords
    const p1ExcludeKeywords = document.getElementById('period1ExcludeKeywords').value;
    CONFIG.period1.excludeKeywords = p1ExcludeKeywords ? p1ExcludeKeywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k) : [];

    const p2IncludeKeywords = document.getElementById('period2IncludeKeywords').value;
    CONFIG.period2.includeKeywords = p2IncludeKeywords ? p2IncludeKeywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k) : [];

    // Benchmarks
    CONFIG.benchmarks = {
        ctr: parseFloat(document.getElementById('benchCTR').value) || 1.4,
        cpm: parseFloat(document.getElementById('benchCPM').value) || 10.88,
        cpl: parseFloat(document.getElementById('benchCPL').value) || 15,
        frequency: parseFloat(document.getElementById('benchFreq').value) || 1.5
    };

    // Client info
    CONFIG.client = {
        name: document.getElementById('clientName').value || 'Cliente',
        objective: Object.keys(CONFIG.detectedObjectives || {})[0] || 'Unknown',
        monthlyBudget: parseFloat(document.getElementById('monthlyBudget').value) || 2000,
        industry: getIndustryValue()
    };

    return true;
}

function parseDate(dateStr) {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
}

function splitDataByDate() {
    beforeData = [];
    afterData = [];

    // Create keyword patterns
    const p1ExcludePattern = CONFIG.period1.excludeKeywords.length > 0
        ? new RegExp(CONFIG.period1.excludeKeywords.join('|'), 'i')
        : null;

    const p2IncludePattern = CONFIG.period2.includeKeywords.length > 0
        ? new RegExp(CONFIG.period2.includeKeywords.join('|'), 'i')
        : null;

    let skipped = 0;
    let noDate = 0;

    // Use filtered data instead of raw data
    filteredData.forEach(row => {
        // Use 'Inicio' column for ad start date (when the ad ran)
        const startDate = parseDate(row['Inicio']);
        const adName = row['Nombre del anuncio'] || '';

        if (!startDate) {
            noDate++;
            return;
        }

        // Priority 1: P2 include keywords (always goes to P2 if matches)
        if (p2IncludePattern && p2IncludePattern.test(adName)) {
            afterData.push(row);
            return;
        }

        // Priority 2: P1 exclude keywords (skip this row entirely if in P1 date range)
        if (p1ExcludePattern && p1ExcludePattern.test(adName)) {
            // If within P2 range, add to P2, otherwise skip
            if (startDate >= CONFIG.period2.startDate && startDate <= CONFIG.period2.endDate) {
                afterData.push(row);
            } else {
                skipped++;
            }
            return;
        }

        // Check if date falls within either period
        const inPeriod1 = startDate >= CONFIG.period1.startDate && startDate <= CONFIG.period1.endDate;
        const inPeriod2 = startDate >= CONFIG.period2.startDate && startDate <= CONFIG.period2.endDate;

        if (inPeriod2) {
            afterData.push(row);
        } else if (inPeriod1) {
            beforeData.push(row);
        } else {
            skipped++;
        }
    });

    console.log(`Data split results:`);
    console.log(`  P1 (${CONFIG.period1.startDate?.toLocaleDateString()} - ${CONFIG.period1.endDate?.toLocaleDateString()}): ${beforeData.length} rows`);
    console.log(`  P2 (${CONFIG.period2.startDate?.toLocaleDateString()} - ${CONFIG.period2.endDate?.toLocaleDateString()}): ${afterData.length} rows`);
    console.log(`  Skipped (out of range): ${skipped}, No date: ${noDate}`);
}

function startAnalysis() {
    if (rawData.length === 0) {
        showError('Por favor sube un archivo CSV primero');
        return;
    }

    if (!loadConfiguration()) return;

    // Load and apply filters
    loadFilters();
    filteredData = filterData(rawData);

    console.log(`Filtered: ${filteredData.length}/${rawData.length} rows passed filters`);

    if (filteredData.length === 0) {
        showError('No hay datos después de aplicar los filtros. Revisa la configuración.');
        return;
    }

    splitDataByDate();

    if (beforeData.length === 0 && afterData.length === 0) {
        showError('No se encontraron datos para analizar. Verifica las fechas.');
        return;
    }

    // Hide config, show results
    configPanel.style.display = 'none';
    analysisResults.style.display = 'block';
    resetBtn.style.display = 'block';

    // Update header with date ranges
    document.getElementById('resultPeriod1').textContent = CONFIG.period1Name;
    document.getElementById('resultPeriod2').textContent = CONFIG.period2Name;

    const p1Range = `${CONFIG.period1.startDate.toLocaleDateString('es-ES')} - ${CONFIG.period1.endDate.toLocaleDateString('es-ES')}`;
    const p2Range = `${CONFIG.period2.startDate.toLocaleDateString('es-ES')} - ${CONFIG.period2.endDate.toLocaleDateString('es-ES')}`;
    document.getElementById('resultCutoff').innerHTML = `
        <span class="text-xs opacity-70">${CONFIG.period1Name}:</span> ${p1Range}<br>
        <span class="text-xs opacity-70">${CONFIG.period2Name}:</span> ${p2Range}
    `;

    // Run analysis
    runAnalysis();
}

function resetAnalyzer() {
    configPanel.style.display = 'block';
    analysisResults.style.display = 'none';
    resetBtn.style.display = 'none';
    rawData = [];
    beforeData = [];
    afterData = [];
    csvInput.value = '';
    document.getElementById('fileInfo').classList.add('hidden');
    startBtn.disabled = true;
    if (demographicsChart) {
        demographicsChart.destroy();
        demographicsChart = null;
    }
}

function calculateMetrics(data) {
    if (!data || data.length === 0) {
        return { spend: 0, results: 0, conversations: 0, reach: 0, impressions: 0, clicks: 0, ctr: 0, cpm: 0, cpc: 0, cpl: 0, frequency: 0, conversionRate: 0 };
    }

    let spend = 0, results = 0, conversations = 0, reach = 0, impressions = 0, clicks = 0;
    const demographics = {};

    data.forEach(row => {
        const s = parseFloat(row['Importe gastado (USD)']) || 0;
        const r = parseFloat(row['Resultados']) || 0;
        const re = parseFloat(row['Alcance']) || 0;
        const imp = parseFloat(row['Impresiones']) || 0;
        const cl = parseFloat(row['Clics (todos)']) || 0;

        spend += s;
        results += r;
        reach += re;
        impressions += imp;
        clicks += cl;

        if (row['Tipo de resultado'] === 'Conversaciones con mensajes iniciadas') {
            conversations += r;
        }

        // Demographics
        const age = row['Edad'] || 'Desconocido';
        const gender = row['Sexo'] || 'Desconocido';
        const key = `${gender === 'male' ? 'Hombres' : gender === 'female' ? 'Mujeres' : 'Otro'} ${age}`;
        if (!demographics[key]) demographics[key] = { spend: 0, conv: 0 };
        demographics[key].spend += s;
        if (row['Tipo de resultado'] === 'Conversaciones con mensajes iniciadas') {
            demographics[key].conv += r;
        }
    });

    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
    const cpc = clicks > 0 ? spend / clicks : 0;
    const cpl = conversations > 0 ? spend / conversations : 0;
    const frequency = reach > 0 ? impressions / reach : 0;
    const conversionRate = clicks > 0 ? (conversations / clicks) * 100 : 0;

    return { spend, results, conversations, reach, impressions, clicks, ctr, cpm, cpc, cpl, frequency, conversionRate, demographics };
}

function runAnalysis() {
    const before = calculateMetrics(beforeData);
    const after = calculateMetrics(afterData);

    renderExecutiveSummary(before, after);
    renderMetricsComparison(before, after);
    renderPeriodCards(before, after);
    renderDeepMetrics(before, after);
    renderStrengthsAnalysis(before, after);
    renderResultTypeBreakdown();
    renderAudienceInsights(after);
    renderTopAds();
    renderBenchmarkCompliance(before, after);
    renderStrategicConclusion(before, after);
    renderDemographicsChart(before, after);

    // Generate auto-diagnosis
    generateAutoDiagnosis(before, after);
}

// Helper function to get result types from a dataset
function getResultTypesForData(data) {
    const types = {};
    data.forEach(row => {
        const tipo = row['Tipo de resultado'];
        if (tipo) {
            if (!types[tipo]) types[tipo] = { count: 0, spend: 0, results: 0 };
            types[tipo].count++;
            types[tipo].spend += parseFloat(row['Importe gastado (USD)']) || 0;
            types[tipo].results += parseFloat(row['Resultados']) || 0;
        }
    });
    return types;
}

// Auto-diagnosis function
function generateAutoDiagnosis(before, after) {
    const diagnosis = [];
    const t = FILTERS.thresholds;

    // Check for zero conversations in P1 (common when comparing different campaign types)
    if (before.conversations === 0 && after.conversations > 0) {
        // Get dominant result types for each period
        const p1Types = getResultTypesForData(beforeData);
        const p2Types = getResultTypesForData(afterData);

        const p1Main = Object.entries(p1Types).sort((a, b) => b[1].spend - a[1].spend)[0];
        const p2Main = Object.entries(p2Types).sort((a, b) => b[1].spend - a[1].spend)[0];

        if (p1Main && p2Main && p1Main[0] !== p2Main[0]) {
            diagnosis.push({
                type: 'warning',
                icon: '⚠️',
                message: `Objetivos diferentes: ${CONFIG.period1Name} usaba "${p1Main[0]}" vs ${CONFIG.period2Name} usa "${p2Main[0]}". Las métricas de conversaciones no son comparables directamente.`
            });
        } else {
            diagnosis.push({
                type: 'info',
                icon: 'ℹ️',
                message: `${CONFIG.period1Name} tiene 0 conversaciones registradas. Esto puede indicar campañas de awareness o interacción.`
            });
        }
    }

    // Overall improvement check
    if (after.cpl < before.cpl && after.conversations > before.conversations) {
        const improvement = (((before.cpl - after.cpl) / before.cpl) * 100).toFixed(0);
        diagnosis.push({
            type: 'success',
            icon: '✅',
            message: `Eficiencia mejoró ${improvement}% vs período anterior (CPL: $${before.cpl.toFixed(2)} → $${after.cpl.toFixed(2)})`
        });
    }

    // High frequency warning
    if (after.frequency > 2.5) {
        diagnosis.push({
            type: 'warning',
            icon: '⚠️',
            message: `Frecuencia alta (${after.frequency.toFixed(2)}) - Considera nuevos creativos o ampliar audiencia`
        });
    }

    // Low CTR warning
    if (after.ctr < t.ctrGood) {
        diagnosis.push({
            type: 'danger',
            icon: '🚨',
            message: `CTR bajo (${after.ctr.toFixed(2)}%) - Revisa copies y creativos para mejorar engagement`
        });
    }

    // High CPM warning
    if (after.cpm > t.cpmGood * 1.5) {
        diagnosis.push({
            type: 'warning',
            icon: '💰',
            message: `CPM elevado ($${after.cpm.toFixed(2)}) - Competencia alta o audiencia saturada`
        });
    }

    // Best performing demographics
    if (after.demographics) {
        const sorted = Object.entries(after.demographics)
            .filter(([k, v]) => v.conv > 5)
            .sort((a, b) => (a[1].spend / a[1].conv) - (b[1].spend / b[1].conv));

        if (sorted.length > 0) {
            const best = sorted[0];
            const cpr = (best[1].spend / best[1].conv).toFixed(2);
            diagnosis.push({
                type: 'tip',
                icon: '💡',
                message: `Mejor audiencia: ${best[0]} (CPR $${cpr}) - Considera aumentar presupuesto aquí`
            });
        }

        if (sorted.length > 2) {
            const worst = sorted[sorted.length - 1];
            const cpr = (worst[1].spend / worst[1].conv).toFixed(2);
            diagnosis.push({
                type: 'info',
                icon: '📊',
                message: `Audiencia menos eficiente: ${worst[0]} (CPR $${cpr}) - Evaluar exclusión`
            });
        }
    }

    // Budget projection
    const projectedConversations = after.cpl > 0 ? Math.round(CONFIG.client.monthlyBudget / after.cpl) : 0;
    diagnosis.push({
        type: 'info',
        icon: '📈',
        message: `Con $${CONFIG.client.monthlyBudget.toLocaleString()}/mes proyectas ${projectedConversations.toLocaleString()} conversaciones`
    });

    // Render diagnosis
    const diagnosisEl = document.getElementById('autoDiagnosis');
    if (diagnosisEl) {
        diagnosisEl.innerHTML = `
            <h3 class="font-bold text-lg mb-4">🤖 Auto-Diagnóstico</h3>
            <div class="space-y-2">
                ${diagnosis.map(d => `
                    <div class="border-l-4 ${d.type === 'success' ? 'border-green-500 bg-green-50' :
                d.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                    d.type === 'danger' ? 'border-red-500 bg-red-50' :
                        d.type === 'tip' ? 'border-blue-500 bg-blue-50' : 'border-black bg-gray-50'} p-3">
                        <p class="text-sm">${d.icon} ${d.message}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

function renderExecutiveSummary(before, after) {
    const ctrBench = CONFIG.benchmarks.ctr;
    const ctr1VsBench = before.ctr > 0 ? ((before.ctr - ctrBench) / ctrBench * 100).toFixed(1) : 0;
    const ctr2VsBench = after.ctr > 0 ? ((after.ctr - ctrBench) / ctrBench * 100).toFixed(1) : 0;
    const cpm1VsBench = before.cpm > 0 ? ((before.cpm - CONFIG.benchmarks.cpm) / CONFIG.benchmarks.cpm * 100).toFixed(1) : 0;
    const cpm2VsBench = after.cpm > 0 ? ((after.cpm - CONFIG.benchmarks.cpm) / CONFIG.benchmarks.cpm * 100).toFixed(1) : 0;

    document.getElementById('executiveSummary').innerHTML = `
        <h3 class="font-bold text-lg mb-4">Resumen Ejecutivo</h3>
        <p class="text-sm text-muted-foreground mb-4">Análisis Comparativo Objetivo (PhD Marketing)</p>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="border border-black p-3 text-center">
                <p class="text-xs font-bold">CTR ${CONFIG.period1Name}</p>
                <p class="text-xl font-black">${before.ctr.toFixed(2)}%</p>
                <p class="text-xs">${ctr1VsBench >= 0 ? '+' : ''}${ctr1VsBench}% vs benchmark</p>
            </div>
            <div class="border border-black p-3 text-center">
                <p class="text-xs font-bold">CTR ${CONFIG.period2Name}</p>
                <p class="text-xl font-black">${after.ctr.toFixed(2)}%</p>
                <p class="text-xs">${ctr2VsBench >= 0 ? '+' : ''}${ctr2VsBench}% vs benchmark</p>
            </div>
            <div class="border border-black p-3 text-center">
                <p class="text-xs font-bold">CPM ${CONFIG.period1Name}</p>
                <p class="text-xl font-black">$${before.cpm.toFixed(2)}</p>
                <p class="text-xs">${cpm1VsBench}% vs benchmark</p>
            </div>
            <div class="border border-black p-3 text-center">
                <p class="text-xs font-bold">CPM ${CONFIG.period2Name}</p>
                <p class="text-xl font-black">$${after.cpm.toFixed(2)}</p>
                <p class="text-xs">${cpm2VsBench}% vs benchmark</p>
            </div>
        </div>
    `;
}

function renderMetricsComparison(before, after) {
    const metrics = [
        { name: 'Inversión Total', v1: `$${before.spend.toFixed(2)}`, v2: `$${after.spend.toFixed(2)}`, change: ((after.spend - before.spend) / before.spend * 100).toFixed(1), better: after.spend < before.spend ? CONFIG.period2Name : CONFIG.period1Name },
        { name: 'Conversaciones', v1: before.conversations.toFixed(0), v2: after.conversations.toFixed(0), change: before.conversations > 0 ? ((after.conversations - before.conversations) / before.conversations * 100).toFixed(1) : 'N/A', better: after.conversations > before.conversations ? CONFIG.period2Name : CONFIG.period1Name },
        { name: 'Costo/Conversación (CPL)', v1: `$${before.cpl.toFixed(2)}`, v2: `$${after.cpl.toFixed(2)}`, change: before.cpl > 0 ? ((after.cpl - before.cpl) / before.cpl * 100).toFixed(1) : 'N/A', better: after.cpl < before.cpl ? CONFIG.period2Name : CONFIG.period1Name },
        { name: 'CTR', v1: `${before.ctr.toFixed(2)}%`, v2: `${after.ctr.toFixed(2)}%`, change: ((after.ctr - before.ctr) / before.ctr * 100).toFixed(1), better: after.ctr > before.ctr ? CONFIG.period2Name : CONFIG.period1Name },
        { name: 'CPM', v1: `$${before.cpm.toFixed(2)}`, v2: `$${after.cpm.toFixed(2)}`, change: ((after.cpm - before.cpm) / before.cpm * 100).toFixed(1), better: after.cpm < before.cpm ? CONFIG.period2Name : CONFIG.period1Name },
        { name: 'Tasa Conversión', v1: `${before.conversionRate.toFixed(2)}%`, v2: `${after.conversionRate.toFixed(2)}%`, change: before.conversionRate > 0 ? ((after.conversionRate - before.conversionRate) / before.conversionRate * 100).toFixed(1) : 'N/A', better: after.conversionRate > before.conversionRate ? CONFIG.period2Name : CONFIG.period1Name },
        { name: 'Frecuencia', v1: before.frequency.toFixed(2), v2: after.frequency.toFixed(2), change: ((after.frequency - before.frequency) / before.frequency * 100).toFixed(1), better: after.frequency <= CONFIG.benchmarks.frequency ? CONFIG.period2Name : CONFIG.period1Name }
    ];

    document.getElementById('metricsComparison').innerHTML = `
        <h3 class="font-bold text-lg mb-4">Comparación de Métricas</h3>
        <div class="overflow-x-auto">
            <table class="w-full text-sm border-collapse">
                <thead class="bg-black text-white">
                    <tr>
                        <th class="p-2 text-left">Métrica</th>
                        <th class="p-2 text-center">${CONFIG.period1Name}</th>
                        <th class="p-2 text-center">${CONFIG.period2Name}</th>
                        <th class="p-2 text-center">Cambio</th>
                        <th class="p-2 text-center">Mejor</th>
                    </tr>
                </thead>
                <tbody>
                    ${metrics.map(m => `
                        <tr class="border-b border-black">
                            <td class="p-2 font-medium">${m.name}</td>
                            <td class="p-2 text-center">${m.v1}</td>
                            <td class="p-2 text-center">${m.v2}</td>
                            <td class="p-2 text-center">${m.change}%</td>
                            <td class="p-2 text-center"><span class="badge-dark px-2 py-1">${m.better}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function renderPeriodCards(before, after) {
    document.getElementById('period1Card').innerHTML = `
        <div class="flex items-center gap-2 mb-4">
            <div class="w-4 h-4 bg-black"></div>
            <h3 class="font-black text-lg">${CONFIG.period1Name}</h3>
        </div>
        <div class="grid grid-cols-2 gap-3 text-sm">
            <div><span class="text-muted-foreground">Inversión:</span> <strong>$${before.spend.toFixed(2)}</strong></div>
            <div><span class="text-muted-foreground">Resultados:</span> <strong>${before.results.toLocaleString()}</strong></div>
            <div><span class="text-muted-foreground">Conversaciones:</span> <strong>${before.conversations.toLocaleString()}</strong></div>
            <div><span class="text-muted-foreground">Costo/Conv:</span> <strong>$${before.cpl.toFixed(2)}</strong></div>
            <div><span class="text-muted-foreground">CTR:</span> <strong>${before.ctr.toFixed(2)}%</strong></div>
            <div><span class="text-muted-foreground">CPM:</span> <strong>$${before.cpm.toFixed(2)}</strong></div>
            <div><span class="text-muted-foreground">Alcance:</span> <strong>${before.reach.toLocaleString()}</strong></div>
            <div><span class="text-muted-foreground">Frecuencia:</span> <strong>${before.frequency.toFixed(2)}</strong></div>
        </div>
    `;

    document.getElementById('period2Card').innerHTML = `
        <div class="flex items-center gap-2 mb-4">
            <div class="w-4 h-4 bg-black"></div>
            <h3 class="font-black text-lg">${CONFIG.period2Name}</h3>
        </div>
        <div class="grid grid-cols-2 gap-3 text-sm">
            <div><span class="text-muted-foreground">Inversión:</span> <strong>$${after.spend.toFixed(2)}</strong></div>
            <div><span class="text-muted-foreground">Resultados:</span> <strong>${after.results.toLocaleString()}</strong></div>
            <div><span class="text-muted-foreground">Conversaciones:</span> <strong>${after.conversations.toLocaleString()}</strong></div>
            <div><span class="text-muted-foreground">Costo/Conv:</span> <strong>$${after.cpl.toFixed(2)}</strong></div>
            <div><span class="text-muted-foreground">CTR:</span> <strong>${after.ctr.toFixed(2)}%</strong></div>
            <div><span class="text-muted-foreground">CPM:</span> <strong>$${after.cpm.toFixed(2)}</strong></div>
            <div><span class="text-muted-foreground">Alcance:</span> <strong>${after.reach.toLocaleString()}</strong></div>
            <div><span class="text-muted-foreground">Frecuencia:</span> <strong>${after.frequency.toFixed(2)}</strong></div>
        </div>
    `;
}

function renderDeepMetrics(before, after) {
    const reachPer$ = { before: before.spend > 0 ? before.reach / before.spend : 0, after: after.spend > 0 ? after.reach / after.spend : 0 };
    const impPer$ = { before: before.spend > 0 ? before.impressions / before.spend : 0, after: after.spend > 0 ? after.impressions / after.spend : 0 };
    const clicksPer$ = { before: before.spend > 0 ? before.clicks / before.spend : 0, after: after.spend > 0 ? after.clicks / after.spend : 0 };
    const convPer100 = { before: before.spend > 0 ? (before.conversations / before.spend) * 100 : 0, after: after.spend > 0 ? (after.conversations / after.spend) * 100 : 0 };

    document.getElementById('deepMetrics').innerHTML = `
        <h3 class="font-bold text-lg mb-4">Análisis Profundo: Fortalezas Comparativas</h3>
        <p class="text-sm text-muted-foreground mb-4">Qué hacía mejor cada período basado en datos crudos del CSV</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="border border-black p-4">
                <h4 class="font-bold mb-3">${CONFIG.period1Name}</h4>
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between"><span>Alcance por $:</span><strong>${reachPer$.before.toFixed(0)} personas/$</strong></div>
                    <div class="flex justify-between"><span>Impresiones por $:</span><strong>${impPer$.before.toFixed(0)} imp/$</strong></div>
                    <div class="flex justify-between"><span>Clics por $:</span><strong>${clicksPer$.before.toFixed(1)} clics/$</strong></div>
                    <div class="flex justify-between"><span>Conv. por $100:</span><strong>${convPer100.before.toFixed(1)} conv</strong></div>
                </div>
            </div>
            <div class="border-2 border-black p-4 bg-black text-white">
                <h4 class="font-bold mb-3">${CONFIG.period2Name}</h4>
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between"><span>Alcance por $:</span><strong>${reachPer$.after.toFixed(0)} personas/$</strong></div>
                    <div class="flex justify-between"><span>Impresiones por $:</span><strong>${impPer$.after.toFixed(0)} imp/$</strong></div>
                    <div class="flex justify-between"><span>Clics por $:</span><strong>${clicksPer$.after.toFixed(1)} clics/$</strong></div>
                    <div class="flex justify-between"><span>Conv. por $100:</span><strong>${convPer100.after.toFixed(1)} conv</strong></div>
                </div>
            </div>
        </div>
    `;
}

function renderStrengthsAnalysis(before, after) {
    const effMultiplier = before.conversations > 0 && after.conversations > 0
        ? ((after.conversations / after.spend) / (before.conversations / before.spend)).toFixed(2)
        : 'N/A';
    const cplReduction = before.cpl > 0 && after.cpl > 0
        ? (((before.cpl - after.cpl) / before.cpl) * 100).toFixed(1)
        : 'N/A';

    document.getElementById('strengthsAnalysis').innerHTML = `
        <h3 class="font-bold text-lg mb-4">Multiplicadores de Eficiencia</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="border-2 border-black p-4 text-center">
                <p class="text-xs uppercase font-bold mb-1">Eficiencia Relativa</p>
                <p class="text-3xl font-black">${effMultiplier}x</p>
                <p class="text-xs text-muted-foreground">más conversiones por $ en ${CONFIG.period2Name}</p>
            </div>
            <div class="border-2 border-black p-4 text-center">
                <p class="text-xs uppercase font-bold mb-1">Reducción CPL</p>
                <p class="text-3xl font-black">${cplReduction}%</p>
                <p class="text-xs text-muted-foreground">$${before.cpl.toFixed(2)} → $${after.cpl.toFixed(2)}</p>
            </div>
            <div class="border-2 border-black p-4 text-center">
                <p class="text-xs uppercase font-bold mb-1">Proyección $${CONFIG.client.monthlyBudget.toLocaleString()}</p>
                <p class="text-3xl font-black">${after.cpl > 0 ? Math.round(CONFIG.client.monthlyBudget / after.cpl).toLocaleString() : 'N/A'}</p>
                <p class="text-xs text-muted-foreground">conversaciones proyectadas</p>
            </div>
        </div>
    `;
}

function renderResultTypeBreakdown() {
    const getResultTypes = (data) => {
        const types = {};
        data.forEach(row => {
            const type = row['Tipo de resultado'] || 'Otro';
            if (!types[type]) types[type] = { spend: 0, results: 0 };
            types[type].spend += parseFloat(row['Importe gastado (USD)']) || 0;
            types[type].results += parseFloat(row['Resultados']) || 0;
        });
        return types;
    };

    const beforeTypes = getResultTypes(beforeData);
    const afterTypes = getResultTypes(afterData);

    const allTypes = [...new Set([...Object.keys(beforeTypes), ...Object.keys(afterTypes)])];

    document.getElementById('resultTypeBreakdown').innerHTML = `
        <h3 class="font-bold text-lg mb-4">Tipo de Resultado</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <h4 class="font-bold mb-3">${CONFIG.period1Name}</h4>
                ${Object.entries(beforeTypes).sort((a, b) => b[1].spend - a[1].spend).slice(0, 5).map(([type, data]) => `
                    <div class="border border-black p-2 mb-2">
                        <p class="text-xs font-bold">${type.substring(0, 40)}${type.length > 40 ? '...' : ''}</p>
                        <p class="text-xs">Gasto: $${data.spend.toFixed(2)} | Res: ${data.results.toLocaleString()}</p>
                    </div>
                `).join('')}
            </div>
            <div>
                <h4 class="font-bold mb-3">${CONFIG.period2Name}</h4>
                ${Object.entries(afterTypes).sort((a, b) => b[1].spend - a[1].spend).slice(0, 5).map(([type, data]) => `
                    <div class="border border-black p-2 mb-2">
                        <p class="text-xs font-bold">${type.substring(0, 40)}${type.length > 40 ? '...' : ''}</p>
                        <p class="text-xs">Gasto: $${data.spend.toFixed(2)} | Res: ${data.results.toLocaleString()}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function renderAudienceInsights(after) {
    const demos = after.demographics || {};
    const sorted = Object.entries(demos)
        .filter(([k, v]) => v.conv > 0)
        .map(([name, data]) => ({ name, ...data, cpr: data.conv > 0 ? data.spend / data.conv : Infinity }))
        .sort((a, b) => a.cpr - b.cpr);

    const best = sorted.slice(0, 3);
    const worst = sorted.slice(-3).reverse();

    document.getElementById('audienceInsights').innerHTML = `
        <h3 class="font-bold text-lg mb-4">Insights de Audiencia (${CONFIG.period2Name})</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="border-2 border-black p-4">
                <h4 class="font-bold mb-3 bg-black text-white p-2 -m-4 mb-3">Top 3 Audiencias (Menor CPR)</h4>
                ${best.map((a, i) => `
                    <div class="flex justify-between items-center p-2 border-b">
                        <span class="font-medium">${i + 1}. ${a.name}</span>
                        <div class="text-right">
                            <span class="font-bold">$${a.cpr.toFixed(2)}</span>
                            <span class="text-xs block">${a.conv.toLocaleString()} conv.</span>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="border border-black p-4">
                <h4 class="font-bold mb-3">Audiencias a Optimizar</h4>
                ${worst.map(a => `
                    <div class="flex justify-between items-center p-2 border-b">
                        <span>${a.name}</span>
                        <div class="text-right">
                            <span>$${a.cpr.toFixed(2)}</span>
                            <span class="text-xs block">${a.conv.toLocaleString()} conv.</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function renderTopAds() {
    const getTopAds = (data) => {
        const adsMap = {};
        data.forEach(row => {
            const name = row['Nombre del anuncio'] || 'Sin nombre';
            if (!adsMap[name]) adsMap[name] = { spend: 0, results: 0, reach: 0, ctr: 0, ctrSum: 0, count: 0 };
            adsMap[name].spend += parseFloat(row['Importe gastado (USD)']) || 0;
            adsMap[name].results += parseFloat(row['Resultados']) || 0;
            adsMap[name].reach += parseFloat(row['Alcance']) || 0;
            adsMap[name].ctrSum += parseFloat(row['CTR (todos)']) || 0;
            adsMap[name].count++;
        });
        return Object.entries(adsMap)
            .map(([name, data]) => ({ name, ...data, ctr: data.ctrSum / data.count, cpr: data.results > 0 ? data.spend / data.results : 0 }))
            .sort((a, b) => b.spend - a.spend)
            .slice(0, 5);
    };

    const topBefore = getTopAds(beforeData);
    const topAfter = getTopAds(afterData);

    const renderAdCard = (ad) => `
        <div class="border border-black p-3 mb-2">
            <p class="font-bold text-sm truncate">${ad.name.substring(0, 50)}${ad.name.length > 50 ? '...' : ''}</p>
            <div class="grid grid-cols-3 gap-2 text-xs mt-2">
                <div>Gasto: <strong>$${ad.spend.toFixed(2)}</strong></div>
                <div>Res: <strong>${ad.results.toLocaleString()}</strong></div>
                <div>CTR: <strong>${ad.ctr.toFixed(2)}%</strong></div>
            </div>
        </div>
    `;

    document.getElementById('topAdsPeriod1').innerHTML = `
        <h3 class="font-bold text-lg mb-4">Top Anuncios (${CONFIG.period1Name})</h3>
        ${topBefore.map(renderAdCard).join('')}
    `;

    document.getElementById('topAdsPeriod2').innerHTML = `
        <h3 class="font-bold text-lg mb-4">Top Anuncios (${CONFIG.period2Name})</h3>
        ${topAfter.map(renderAdCard).join('')}
    `;
}

function renderBenchmarkCompliance(before, after) {
    const b = CONFIG.benchmarks;
    const checks = [
        { metric: 'CTR', v1: `${before.ctr.toFixed(2)}%`, v2: `${after.ctr.toFixed(2)}%`, bench: `≥${b.ctr}%`, p1: before.ctr >= b.ctr, p2: after.ctr >= b.ctr },
        { metric: 'CPM', v1: `$${before.cpm.toFixed(2)}`, v2: `$${after.cpm.toFixed(2)}`, bench: `≤$${b.cpm}`, p1: before.cpm <= b.cpm, p2: after.cpm <= b.cpm },
        { metric: 'CPL', v1: `$${before.cpl.toFixed(2)}`, v2: `$${after.cpl.toFixed(2)}`, bench: `≤$${b.cpl}`, p1: before.cpl <= b.cpl || before.cpl === 0, p2: after.cpl <= b.cpl || after.cpl === 0 },
        { metric: 'Frecuencia', v1: before.frequency.toFixed(2), v2: after.frequency.toFixed(2), bench: `≤${b.frequency}`, p1: before.frequency <= b.frequency, p2: after.frequency <= b.frequency }
    ];

    const score1 = checks.filter(c => c.p1).length;
    const score2 = checks.filter(c => c.p2).length;

    document.getElementById('benchmarkCompliance').innerHTML = `
        <h3 class="font-bold text-lg mb-4">Cumplimiento de Benchmarks</h3>
        <div class="overflow-x-auto">
            <table class="w-full text-sm border-collapse">
                <thead class="bg-black text-white">
                    <tr>
                        <th class="p-2 text-left">Métrica</th>
                        <th class="p-2 text-center">${CONFIG.period1Name}</th>
                        <th class="p-2 text-center">${CONFIG.period2Name}</th>
                        <th class="p-2 text-center">Benchmark</th>
                        <th class="p-2 text-center">${CONFIG.period1Name} Cumple</th>
                        <th class="p-2 text-center">${CONFIG.period2Name} Cumple</th>
                    </tr>
                </thead>
                <tbody>
                    ${checks.map(c => `
                        <tr class="border-b border-black">
                            <td class="p-2 font-medium">${c.metric}</td>
                            <td class="p-2 text-center">${c.v1}</td>
                            <td class="p-2 text-center">${c.v2}</td>
                            <td class="p-2 text-center">${c.bench}</td>
                            <td class="p-2 text-center">${c.p1 ? 'SI' : 'NO'}</td>
                            <td class="p-2 text-center">${c.p2 ? 'SI' : 'NO'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <div class="mt-4 flex gap-4">
            <p class="text-sm">Score ${CONFIG.period1Name}: <strong>${score1}/4</strong> métricas en benchmark</p>
            <p class="text-sm">Score ${CONFIG.period2Name}: <strong>${score2}/4</strong> métricas en benchmark</p>
        </div>
    `;
}

function renderStrategicConclusion(before, after) {
    const winner = after.cpl < before.cpl && after.conversations > before.conversations ? CONFIG.period2Name :
        before.cpl < after.cpl && before.conversations > after.conversations ? CONFIG.period1Name : 'Requiere análisis';

    const cplReduction = before.cpl > 0 ? (((before.cpl - after.cpl) / before.cpl) * 100).toFixed(1) : 0;
    const convMultiplier = before.conversations > 0 ? (after.conversations / before.conversations).toFixed(1) : 'N/A';

    document.getElementById('strategicConclusion').innerHTML = `
        <div class="bg-black text-white p-6">
            <h3 class="font-black text-xl mb-4">CONCLUSIÓN ESTRATÉGICA</h3>
            <p class="text-lg mb-4">Estrategia Ganadora: <strong class="text-2xl">${winner}</strong></p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div class="border border-white p-3">
                    <p class="text-xs opacity-70">Reducción CPL</p>
                    <p class="text-xl font-bold">${cplReduction}%</p>
                </div>
                <div class="border border-white p-3">
                    <p class="text-xs opacity-70">Multiplicador Conv.</p>
                    <p class="text-xl font-bold">${convMultiplier}x</p>
                </div>
                <div class="border border-white p-3">
                    <p class="text-xs opacity-70">Proyección $${CONFIG.client.monthlyBudget.toLocaleString()}</p>
                    <p class="text-xl font-bold">${after.cpl > 0 ? Math.round(CONFIG.client.monthlyBudget / after.cpl).toLocaleString() : 'N/A'} conv</p>
                </div>
            </div>
        </div>
    `;
}

function renderDemographicsChart(before, after) {
    const ctx = document.getElementById('demographicsChart').getContext('2d');

    const allKeys = [...new Set([...Object.keys(before.demographics || {}), ...Object.keys(after.demographics || {})])].sort();

    if (demographicsChart) demographicsChart.destroy();

    demographicsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: allKeys,
            datasets: [
                { label: `${CONFIG.period1Name} ($)`, data: allKeys.map(k => (before.demographics?.[k]?.spend || 0)), backgroundColor: '#000000', barThickness: 12 },
                { label: `${CONFIG.period2Name} ($)`, data: allKeys.map(k => (after.demographics?.[k]?.spend || 0)), backgroundColor: '#666666', barThickness: 12 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } },
            scales: { y: { beginAtZero: true } }
        }
    });
}
