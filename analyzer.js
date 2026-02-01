// BRUTAL Meta Ads Analyzer Engine
// Arizon.ai Technical Data Unit

let rawData = [];
let charts = {};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupDragDrop();
    setupFileInput();
});

function setupDragDrop() {
    const dropZone = document.getElementById('dropZone');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'));
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'));
    });

    dropZone.addEventListener('drop', handleDrop);
}

function setupFileInput() {
    document.getElementById('fileInput').addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            processFile(e.target.files[0]);
        }
    });
}

function handleDrop(e) {
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
        processFile(file);
    }
}

function processFile(file) {
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('uploadSection').classList.add('hidden');
    document.getElementById('loadingSection').classList.remove('hidden');

    Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
            rawData = results.data;
            setTimeout(() => {
                runBrutalAnalysis();
            }, 500);
        },
        error: (error) => {
            alert('Error al procesar CSV: ' + error.message);
        }
    });
}

function runBrutalAnalysis() {
    document.getElementById('loadingSection').classList.add('hidden');
    document.getElementById('resultsSection').classList.remove('hidden');

    // Clean data
    const data = rawData.filter(row => row['Nombre del anuncio'] && row['Importe gastado (USD)']);

    // Calculate KPIs
    calculateKPIs(data);

    // Demographics Analysis
    analyzeDemographics(data);

    // Result Type Analysis
    analyzeResultTypes(data);

    // Top/Worst Performers
    analyzePerformers(data);

    // Demographic Matrix
    buildDemographicMatrix(data);

    // Top Ads Table
    buildTopAdsTable(data);

    // Keyword Mining
    mineKeywords(data);
}

function calculateKPIs(data) {
    const totalRecords = data.length;
    const totalSpend = data.reduce((sum, row) => sum + (parseFloat(row['Importe gastado (USD)']) || 0), 0);
    const totalResults = data.reduce((sum, row) => sum + (parseFloat(row['Resultados']) || 0), 0);
    const avgCPR = totalResults > 0 ? totalSpend / totalResults : 0;

    document.getElementById('kpiRecords').textContent = totalRecords.toLocaleString();
    document.getElementById('kpiSpend').textContent = '$' + totalSpend.toFixed(2);
    document.getElementById('kpiResults').textContent = totalResults.toLocaleString();
    document.getElementById('kpiCPR').textContent = '$' + avgCPR.toFixed(4);
}

function analyzeDemographics(data) {
    const demographics = {};

    data.forEach(row => {
        const age = row['Edad'] || 'Unknown';
        const gender = row['Sexo'] === 'male' ? 'Hombres' : row['Sexo'] === 'female' ? 'Mujeres' : 'Otro';
        const key = `${gender} ${age}`;

        if (!demographics[key]) {
            demographics[key] = { spend: 0, results: 0 };
        }
        demographics[key].spend += parseFloat(row['Importe gastado (USD)']) || 0;
        demographics[key].results += parseFloat(row['Resultados']) || 0;
    });

    const sorted = Object.entries(demographics)
        .sort((a, b) => b[1].spend - a[1].spend)
        .slice(0, 10);

    const labels = sorted.map(([key]) => key);
    const spendData = sorted.map(([, val]) => val.spend.toFixed(2));

    if (charts.demographics) charts.demographics.destroy();

    charts.demographics = new Chart(document.getElementById('demographicsChart'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Gasto ($)',
                data: spendData,
                backgroundColor: '#3b82f6',
                borderColor: '#0f172a',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });
}

function analyzeResultTypes(data) {
    const resultTypes = {};

    data.forEach(row => {
        const type = row['Tipo de resultado'] || 'Otro';
        if (!resultTypes[type]) {
            resultTypes[type] = { spend: 0, clicks: 0, impressions: 0 };
        }
        resultTypes[type].spend += parseFloat(row['Importe gastado (USD)']) || 0;
        resultTypes[type].clicks += parseFloat(row['Clics (todos)']) || 0;
        resultTypes[type].impressions += parseFloat(row['Impresiones']) || 0;
    });

    const sorted = Object.entries(resultTypes)
        .map(([type, val]) => ({
            type: type.substring(0, 25),
            ctr: val.impressions > 0 ? (val.clicks / val.impressions * 100) : 0
        }))
        .sort((a, b) => b.ctr - a.ctr)
        .slice(0, 6);

    if (charts.resultType) charts.resultType.destroy();

    charts.resultType = new Chart(document.getElementById('resultTypeChart'), {
        type: 'doughnut',
        data: {
            labels: sorted.map(r => r.type),
            datasets: [{
                data: sorted.map(r => r.ctr.toFixed(2)),
                backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6', '#eab308', '#ef4444', '#6b7280']
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } } }
        }
    });
}

function analyzePerformers(data) {
    // Aggregate by ad name
    const ads = {};
    data.forEach(row => {
        const name = row['Nombre del anuncio'];
        if (!ads[name]) {
            ads[name] = { spend: 0, results: 0 };
        }
        ads[name].spend += parseFloat(row['Importe gastado (USD)']) || 0;
        ads[name].results += parseFloat(row['Resultados']) || 0;
    });

    // Filter ads with results and calculate CPR
    const adsWithCPR = Object.entries(ads)
        .filter(([, val]) => val.results > 0 && val.spend > 5)
        .map(([name, val]) => ({
            name,
            spend: val.spend,
            results: val.results,
            cpr: val.spend / val.results
        }));

    // Top performers (lowest CPR)
    const topPerformers = [...adsWithCPR].sort((a, b) => a.cpr - b.cpr).slice(0, 5);
    
    // Worst performers (highest CPR)
    const worstPerformers = [...adsWithCPR].sort((a, b) => b.cpr - a.cpr).slice(0, 5);

    const topContainer = document.getElementById('topPerformers');
    topContainer.innerHTML = topPerformers.map(ad => `
        <div class="flex justify-between items-center p-3 bg-green-50 rounded border border-green-200">
            <span class="font-bold text-sm truncate max-w-[60%]">${ad.name.substring(0, 40)}</span>
            <div class="text-right">
                <span class="block font-mono font-bold text-cyber-green">$${ad.cpr.toFixed(4)}</span>
                <span class="text-[9px] text-gray-500">${ad.results} resultados</span>
            </div>
        </div>
    `).join('');

    const worstContainer = document.getElementById('worstPerformers');
    worstContainer.innerHTML = worstPerformers.map(ad => `
        <div class="flex justify-between items-center p-3 bg-red-50 rounded border border-red-200">
            <span class="font-bold text-sm truncate max-w-[60%]">${ad.name.substring(0, 40)}</span>
            <div class="text-right">
                <span class="block font-mono font-bold text-cyber-red">$${ad.cpr.toFixed(4)}</span>
                <span class="text-[9px] text-gray-500">${ad.results} resultados</span>
            </div>
        </div>
    `).join('');
}

function buildDemographicMatrix(data) {
    const matrix = {};

    data.forEach(row => {
        const age = row['Edad'] || 'Unknown';
        const gender = row['Sexo'] === 'male' ? 'Hombres' : row['Sexo'] === 'female' ? 'Mujeres' : 'Otro';
        const key = `${gender} ${age}`;

        if (!matrix[key]) {
            matrix[key] = { spend: 0, results: 0, clicks: 0, impressions: 0, reach: 0 };
        }
        matrix[key].spend += parseFloat(row['Importe gastado (USD)']) || 0;
        matrix[key].results += parseFloat(row['Resultados']) || 0;
        matrix[key].clicks += parseFloat(row['Clics (todos)']) || 0;
        matrix[key].impressions += parseFloat(row['Impresiones']) || 0;
        matrix[key].reach += parseFloat(row['Alcance']) || 0;
    });

    const sorted = Object.entries(matrix)
        .map(([segment, val]) => ({
            segment,
            spend: val.spend,
            results: val.results,
            cpr: val.results > 0 ? val.spend / val.results : 0,
            ctr: val.impressions > 0 ? (val.clicks / val.impressions * 100) : 0,
            reach: val.reach
        }))
        .sort((a, b) => a.cpr - b.cpr);

    const avgCPR = sorted.reduce((sum, s) => sum + s.cpr, 0) / sorted.length;

    const tbody = document.getElementById('demographicTable');
    tbody.innerHTML = sorted.map(s => `
        <tr class="hover:bg-gray-50">
            <td class="p-3 font-bold">${s.segment}</td>
            <td class="p-3 text-right">$${s.spend.toFixed(2)}</td>
            <td class="p-3 text-right">${s.results.toLocaleString()}</td>
            <td class="p-3 text-right font-mono ${s.cpr < avgCPR ? 'text-cyber-green font-bold' : s.cpr > avgCPR * 1.5 ? 'text-cyber-red font-bold' : ''}">
                $${s.cpr.toFixed(4)}
            </td>
            <td class="p-3 text-right">${s.ctr.toFixed(2)}%</td>
            <td class="p-3 text-right">${s.reach.toLocaleString()}</td>
        </tr>
    `).join('');
}

function buildTopAdsTable(data) {
    const ads = {};
    data.forEach(row => {
        const name = row['Nombre del anuncio'];
        if (!ads[name]) {
            ads[name] = { spend: 0, results: 0, clicks: 0, impressions: 0 };
        }
        ads[name].spend += parseFloat(row['Importe gastado (USD)']) || 0;
        ads[name].results += parseFloat(row['Resultados']) || 0;
        ads[name].clicks += parseFloat(row['Clics (todos)']) || 0;
        ads[name].impressions += parseFloat(row['Impresiones']) || 0;
    });

    const sorted = Object.entries(ads)
        .map(([name, val]) => ({
            name,
            spend: val.spend,
            results: val.results,
            cpr: val.results > 0 ? val.spend / val.results : 0,
            ctr: val.impressions > 0 ? (val.clicks / val.impressions * 100) : 0
        }))
        .sort((a, b) => b.spend - a.spend)
        .slice(0, 10);

    const tbody = document.getElementById('topAdsTable');
    tbody.innerHTML = sorted.map(ad => `
        <tr class="hover:bg-green-50/50">
            <td class="p-4 font-bold border-r border-gray-100">${ad.name}</td>
            <td class="p-4 text-right border-r border-gray-100 font-bold">$${ad.spend.toFixed(2)}</td>
            <td class="p-4 text-right border-r border-gray-100">${ad.results.toLocaleString()}</td>
            <td class="p-4 text-right border-r border-gray-100 font-mono">$${ad.cpr.toFixed(4)}</td>
            <td class="p-4 text-right text-cyber-green font-black">${ad.ctr.toFixed(2)}%</td>
        </tr>
    `).join('');
}

function mineKeywords(data) {
    const keywords = {};
    const stopWords = ['de', 'la', 'el', 'en', 'y', 'a', 'para', 'por', 'con', 'campaña', 'interacción', 'publicación', 'instagram'];

    data.forEach(row => {
        const name = row['Nombre del anuncio'] || '';
        const words = name.toUpperCase()
            .replace(/[^A-ZÁÉÍÓÚÑ0-9\s]/gi, '')
            .split(/\s+/)
            .filter(w => w.length > 2 && !stopWords.includes(w.toLowerCase()));

        words.forEach(word => {
            if (!keywords[word]) {
                keywords[word] = { spend: 0, results: 0, clicks: 0, impressions: 0, count: 0 };
            }
            keywords[word].spend += parseFloat(row['Importe gastado (USD)']) || 0;
            keywords[word].results += parseFloat(row['Resultados']) || 0;
            keywords[word].clicks += parseFloat(row['Clics (todos)']) || 0;
            keywords[word].impressions += parseFloat(row['Impresiones']) || 0;
            keywords[word].count++;
        });
    });

    // Get top keywords by different metrics
    const bySpend = Object.entries(keywords)
        .filter(([, v]) => v.count > 3)
        .sort((a, b) => b[1].spend - a[1].spend)
        .slice(0, 1)[0];

    const byCTR = Object.entries(keywords)
        .filter(([, v]) => v.count > 3 && v.impressions > 1000)
        .map(([word, v]) => [word, { ...v, ctr: v.impressions > 0 ? v.clicks / v.impressions * 100 : 0 }])
        .sort((a, b) => b[1].ctr - a[1].ctr)
        .slice(0, 1)[0];

    const byCPR = Object.entries(keywords)
        .filter(([, v]) => v.count > 3 && v.results > 10)
        .map(([word, v]) => [word, { ...v, cpr: v.results > 0 ? v.spend / v.results : Infinity }])
        .sort((a, b) => a[1].cpr - b[1].cpr)
        .slice(0, 1)[0];

    const worstCPR = Object.entries(keywords)
        .filter(([, v]) => v.count > 3 && v.results > 5)
        .map(([word, v]) => [word, { ...v, cpr: v.results > 0 ? v.spend / v.results : 0 }])
        .sort((a, b) => b[1].cpr - a[1].cpr)
        .slice(0, 1)[0];

    const container = document.getElementById('keywordAnalysis');
    const cards = [];

    if (byCPR) {
        cards.push(`
            <div class="bg-white p-4 rounded-lg border-2 border-gray-200 text-center hover:border-cyber-green transition-colors">
                <p class="text-[9px] uppercase font-bold text-gray-400 mb-2">Mejor Costo</p>
                <p class="text-lg font-black text-cyber-black">"${byCPR[0]}"</p>
                <div class="mt-2 text-xs font-mono bg-gray-50 rounded p-1">
                    <span class="block text-cyber-green font-bold">$${byCPR[1].cpr.toFixed(4)} CPR</span>
                </div>
            </div>
        `);
    }

    if (byCTR) {
        cards.push(`
            <div class="bg-white p-4 rounded-lg border-2 border-gray-200 text-center hover:border-cyber-blue transition-colors">
                <p class="text-[9px] uppercase font-bold text-gray-400 mb-2">Mayor Atracción</p>
                <p class="text-lg font-black text-cyber-black">"${byCTR[0]}"</p>
                <div class="mt-2 text-xs font-mono bg-gray-50 rounded p-1">
                    <span class="block text-cyber-blue font-bold">${byCTR[1].ctr.toFixed(2)}% CTR</span>
                </div>
            </div>
        `);
    }

    if (bySpend) {
        cards.push(`
            <div class="bg-white p-4 rounded-lg border-2 border-gray-200 text-center hover:border-cyber-purple transition-colors">
                <p class="text-[9px] uppercase font-bold text-gray-400 mb-2">Mayor Inversión</p>
                <p class="text-lg font-black text-cyber-black">"${bySpend[0]}"</p>
                <div class="mt-2 text-xs font-mono bg-gray-50 rounded p-1">
                    <span class="block text-cyber-purple font-bold">$${bySpend[1].spend.toFixed(2)}</span>
                </div>
            </div>
        `);
    }

    if (worstCPR) {
        cards.push(`
            <div class="bg-white p-4 rounded-lg border-2 border-gray-200 text-center hover:border-cyber-red transition-colors">
                <p class="text-[9px] uppercase font-bold text-gray-400 mb-2">Alerta CPR Alto</p>
                <p class="text-lg font-black text-cyber-black">"${worstCPR[0]}"</p>
                <div class="mt-2 text-xs font-mono bg-gray-50 rounded p-1">
                    <span class="block text-cyber-red font-bold">$${worstCPR[1].cpr.toFixed(4)} CPR</span>
                </div>
            </div>
        `);
    }

    container.innerHTML = cards.join('');
}
