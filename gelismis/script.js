document.addEventListener('DOMContentLoaded', () => {
    // === DOM ELEMENTLERİ ===
    const mainOddsInput = document.getElementById('main-odds');
    const mainStakeInput = document.getElementById('main-stake');
    const potentialPayoutDisplay = document.getElementById('potential-payout');
    
    const scenariosContainer = document.getElementById('scenarios-container');
    const addScenarioBtn = document.getElementById('add-scenario-btn');
    
    const targetScenarioSelector = document.getElementById('target-scenario-selector');
    const centralTargetProfitInput = document.getElementById('central-target-profit');
    const centralTargetBtn = document.getElementById('central-target-btn');
    const centralBreakevenBtn = document.getElementById('central-breakeven-btn');
    const centralArbitrageBtn = document.getElementById('central-arbitrage-btn');
    
    const totalBudgetInput = document.getElementById('total-budget');
    const distributeBudgetBtn = document.getElementById('distribute-budget-btn');

    const resultsSection = document.getElementById('results-section');
    const summaryInfo = document.getElementById('summary-info');
    const resultsGrid = document.getElementById('results-grid');
    const totalSpendDisplay = document.getElementById('total-spend');
    const resultsSummaryDetails = document.getElementById('results-summary-details');

    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const helpBtn = document.getElementById('help-btn');
    const modal = document.getElementById('help-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    let scenarioCounter = 0;

    // === TEMEL FONKSİYONLAR ===
    function createNewScenario() {
        scenarioCounter++;
        const scenarioId = scenarioCounter;

        const card = document.createElement('section');
        card.className = 'calculator-card reveal';
        card.setAttribute('data-scenario-id', scenarioId);
        card.innerHTML = `
            <div class="card-header">
                <h3><i class="fas fa-shield-alt card-icon"></i> Dengeleyici Senaryo #${scenarioId}</h3>
                <button class="remove-scenario-btn" title="Bu senaryoyu kaldır"><i class="fas fa-times"></i></button>
            </div>
            <div class="card-content">
                <div class="input-group">
                    <label for="hedge-odds-${scenarioId}">Dengeleme Oranı</label>
                    <input type="number" id="hedge-odds-${scenarioId}" class="hedge-odds" placeholder="Örn: 2.45" autocomplete="off">
                    <span class="error-message"></span>
                </div>
                <div class="input-group">
                    <label for="hedge-stake-${scenarioId}">Dengeleme Tutarı (₺)</label>
                    <input type="number" id="hedge-stake-${scenarioId}" class="hedge-stake" placeholder="Akıllı araçlarla hesaplanabilir" autocomplete="off">
                    <span class="error-message"></span>
                </div>
            </div>
        `;
        scenariosContainer.appendChild(card);
        
        const option = document.createElement('option');
        option.value = scenarioId;
        option.textContent = `Senaryo #${scenarioId}`;
        targetScenarioSelector.appendChild(option);
        
        setTimeout(() => card.classList.add('active'), 10);
        
        card.querySelector('.remove-scenario-btn').addEventListener('click', () => {
            card.remove();
            targetScenarioSelector.querySelector(`option[value="${scenarioId}"]`).remove();
            calculate();
        });
        card.querySelectorAll('input').forEach(input => input.addEventListener('input', calculate));
    }

    function handleSmartCalc(type) {
        const scenarioId = targetScenarioSelector.value;
        if (!scenarioId) {
            alert("Lütfen işlem yapılacak bir hedef senaryo seçin.");
            return;
        }

        const mainStake = parseFloat(mainStakeInput.value) || 0;
        const mainOdds = parseFloat(mainOddsInput.value) || 0;
        const hedgeOddsInput = document.getElementById(`hedge-odds-${scenarioId}`);
        const hedgeStakeInput = document.getElementById(`hedge-stake-${scenarioId}`);
        
        const hedgeOdds = parseFloat(hedgeOddsInput.value) || 0;
        
        if (mainStake <= 0 || (hedgeOdds <= 1 && type !== 'arbitrage') || (mainOdds <=1 && type === 'arbitrage')) {
            alert("Lütfen Ana Yatırım Tutarını ve seçili senaryonun oranını (1'den büyük) girin.");
            return;
        }

        let requiredStake = 0;
        
        switch(type) {
            case 'target':
                const targetProfit = parseFloat(centralTargetProfitInput.value) || 0;
                requiredStake = (mainStake + targetProfit) / (hedgeOdds - 1);
                break;
            case 'breakeven':
                requiredStake = mainStake / (hedgeOdds - 1);
                break;
            case 'arbitrage':
                requiredStake = (mainOdds * mainStake) / hedgeOdds;
                break;
        }

        if (requiredStake > 0) {
            hedgeStakeInput.value = requiredStake.toFixed(2);
            calculate();
        }
    }

    function validateInput(input, condition, message) {
        const errorSpan = input.nextElementSibling;
        if (condition) {
            input.classList.add('input-error');
            errorSpan.textContent = message;
            return false;
        } else {
            input.classList.remove('input-error');
            errorSpan.textContent = '';
            return true;
        }
    }

    function calculate() {
        let isValid = true;
        
        const mainOdds = parseFloat(mainOddsInput.value) || 0;
        isValid = validateInput(mainOddsInput, mainOdds > 0 && mainOdds <= 1, 'Oran 1\'den büyük olmalıdır.') && isValid;
        
        const mainStake = parseFloat(mainStakeInput.value) || 0;
        isValid = validateInput(mainStakeInput, mainStake < 0, 'Tutar negatif olamaz.') && isValid;

        const scenarios = Array.from(scenariosContainer.querySelectorAll('.calculator-card')).map(card => {
            const id = card.dataset.scenarioId;
            const oddsInput = document.getElementById(`hedge-odds-${id}`);
            const stakeInput = document.getElementById(`hedge-stake-${id}`);
            
            const odds = parseFloat(oddsInput.value) || 0;
            isValid = validateInput(oddsInput, odds > 0 && odds <= 1, 'Oran 1\'den büyük olmalıdır.') && isValid;

            const stake = parseFloat(stakeInput.value) || 0;
            isValid = validateInput(stakeInput, stake < 0, 'Tutar negatif olamaz.') && isValid;
            
            return { id, odds, stake };
        });

        const potentialPayout = mainOdds * mainStake;
        potentialPayoutDisplay.textContent = `${potentialPayout.toFixed(2)} ₺`;

        const hasInputs = mainStake > 0 || scenarios.some(s => s.stake > 0);

        if (!isValid || !hasInputs) {
            resultsSection.style.display = 'none';
            return;
        }

        resultsSection.style.display = 'block';

        const allStakes = [mainStake, ...scenarios.map(s => s.stake)];
        const totalSpend = allStakes.reduce((sum, stake) => sum + stake, 0);
        totalSpendDisplay.textContent = `${totalSpend.toFixed(2)} ₺`;

        const results = [];
        results.push({
            name: 'Ana Olasılık Gerçekleşirse',
            icon: 'fa-trophy',
            netProfit: potentialPayout - totalSpend,
            roi: totalSpend > 0 ? ((potentialPayout - totalSpend) / totalSpend) * 100 : 0
        });

        scenarios.forEach(scenario => {
            const hedgePayout = scenario.odds * scenario.stake;
            results.push({
                name: `Senaryo #${scenario.id} Gerçekleşirse`,
                icon: 'fa-handshake',
                netProfit: hedgePayout - totalSpend,
                roi: totalSpend > 0 ? ((hedgePayout - totalSpend) / totalSpend) * 100 : 0
            });
        });

        renderResults(results, { mainOdds, mainStake, scenarios });
    }

    function renderResults(results, inputs) {
        resultsGrid.innerHTML = '';
        const maxAbsProfit = Math.max(...results.map(r => Math.abs(r.netProfit)));

        results.forEach(result => {
            const card = document.createElement('div');
            card.className = 'scenario-card';

            const profitClass = result.netProfit > 0.001 ? 'profit' : (result.netProfit < -0.001 ? 'loss' : '');
            const profitSign = result.netProfit > 0.001 ? '+' : '';

            const barWidth = maxAbsProfit > 0 ? (Math.abs(result.netProfit) / maxAbsProfit) * 100 : 0;

            card.innerHTML = `
                <h4><i class="fas ${result.icon} scenario-icon"></i> ${result.name}</h4>
                <div class="result-item">
                    <span>Net Sonuç:</span>
                    <span class="value ${profitClass}">${profitSign}${result.netProfit.toFixed(2)} ₺</span>
                </div>
                <div class="result-item">
                    <span>Getiri Oranı (ROI):</span>
                    <span class="value ${profitClass}">${profitSign}${result.roi.toFixed(2)}%</span>
                </div>
                <div class="result-bar-container">
                    <div class="result-bar ${profitClass}" style="width: ${barWidth}%;"></div>
                </div>
            `;
            resultsGrid.appendChild(card);
        });
        
        const allProfitable = results.every(r => r.netProfit >= -0.01);
        summaryInfo.classList.remove('summary-profit', 'summary-risk');
        if (allProfitable && results.length > 1) {
            summaryInfo.className = 'summary-info summary-profit';
            summaryInfo.textContent = 'Harika! Bu dağılımla tüm senaryolarda pozitif getiri elde edilebilir (Arbitraj).';
        } else {
            summaryInfo.className = 'summary-info summary-risk';
            summaryInfo.textContent = 'Dikkat: Bazı senaryolarda negatif getiri riski mevcut. Değerleri ayarlayarak riski yönetebilirsiniz.';
        }
        
        let summaryHTML = '<h4>Hesaplama Detayları</h4>';
        
        // Ana Olasılık Detay Kartı
        const mainResult = results[0];
        const mainProfitClass = mainResult.netProfit > 0.001 ? 'profit' : (mainResult.netProfit < -0.001 ? 'loss' : '');
        summaryHTML += `
            <div class="summary-item-card">
                <div class="summary-item-header">Ana Olasılık</div>
                <div class="summary-detail"><span>Yatırım Tutarı:</span> <span>${inputs.mainStake.toFixed(2)} ₺</span></div>
                <div class="summary-detail"><span>Oran:</span> <span>${inputs.mainOdds}</span></div>
                <div class="summary-detail"><span>Olası Getiri:</span> <span>${(inputs.mainStake * inputs.mainOdds).toFixed(2)} ₺</span></div>
                <div class="summary-detail"><span>Net Kâr/Zarar:</span> <span class="${mainProfitClass}">${mainResult.netProfit.toFixed(2)} ₺</span></div>
            </div>
        `;

        // Dengeleyici Senaryo Detay Kartları
        inputs.scenarios.forEach((s, index) => {
            const scenarioResult = results[index + 1];
            const scenarioProfitClass = scenarioResult.netProfit > 0.001 ? 'profit' : (scenarioResult.netProfit < -0.001 ? 'loss' : '');
            summaryHTML += `
                <div class="summary-item-card">
                    <div class="summary-item-header">Senaryo #${s.id}</div>
                    <div class="summary-detail"><span>Yatırım Tutarı:</span> <span>${s.stake.toFixed(2)} ₺</span></div>
                    <div class="summary-detail"><span>Oran:</span> <span>${s.odds}</span></div>
                    <div class="summary-detail"><span>Olası Getiri:</span> <span>${(s.stake * s.odds).toFixed(2)} ₺</span></div>
                    <div class="summary-detail"><span>Net Kâr/Zarar:</span> <span class="${scenarioProfitClass}">${scenarioResult.netProfit.toFixed(2)} ₺</span></div>
                </div>
            `;
        });
        resultsSummaryDetails.innerHTML = summaryHTML;
    }

    function distributeBudget() {
        const totalBudget = parseFloat(totalBudgetInput.value) || 0;
        if (totalBudget <= 0) return;

        const allOddsInputs = [mainOddsInput, ...scenariosContainer.querySelectorAll('.hedge-odds')];
        const odds = allOddsInputs.map(input => parseFloat(input.value) || 0);

        if (odds.some(o => o <= 1)) {
            alert('Lütfen bütçeyi dağıtmadan önce tüm oranların 1\'den büyük olduğundan emin olun.');
            return;
        }
        
        const inverseOddsSum = odds.reduce((sum, o) => sum + (1 / o), 0);
        if (inverseOddsSum === 0) return;

        if (inverseOddsSum >= 1) {
            alert('Girdiğiniz oranlarla garantili kâr (arbitraj) mümkün değil. Oranların terslerinin toplamı 1\'den küçük olmalıdır.');
            return;
        }

        const targetPayout = totalBudget / inverseOddsSum;
        const stakes = odds.map(o => targetPayout / o);
        
        mainStakeInput.value = stakes[0].toFixed(2);
        const hedgeStakeInputs = scenariosContainer.querySelectorAll('.hedge-stake');
        hedgeStakeInputs.forEach((input, index) => {
            input.value = stakes[index + 1].toFixed(2);
        });

        calculate();
    }
    
    function loadFromURL() {
        const params = new URLSearchParams(window.location.search);
        if(!params.has('mo')) return;

        mainOddsInput.value = params.get('mo');
        mainStakeInput.value = params.get('ms');
        
        scenariosContainer.innerHTML = '';
        targetScenarioSelector.innerHTML = '';
        scenarioCounter = 0;
        
        let i = 1;
        while(params.has(`so${i}`)) {
            createNewScenario();
            const card = scenariosContainer.querySelector(`[data-scenario-id='${i}']`);
            if (card) {
                card.querySelector(`#hedge-odds-${i}`).value = params.get(`so${i}`);
                card.querySelector(`#hedge-stake-${i}`).value = params.get(`ss${i}`);
            }
            i++;
        }
        
        calculate();
    }
    
    // === EVENT LISTENERS ===
    [mainOddsInput, mainStakeInput].forEach(input => input.addEventListener('input', calculate));
    addScenarioBtn.addEventListener('click', createNewScenario);
    
    centralTargetBtn.addEventListener('click', () => handleSmartCalc('target'));
    centralBreakevenBtn.addEventListener('click', () => handleSmartCalc('breakeven'));
    centralArbitrageBtn.addEventListener('click', () => handleSmartCalc('arbitrage'));
    
    distributeBudgetBtn.addEventListener('click', distributeBudget);

    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        const icon = themeToggleBtn.querySelector('i');
        icon.className = document.body.classList.contains('light-mode') ? 'fas fa-moon' : 'fas fa-sun';
    });

    helpBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
    });
    modalCloseBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    });
    
    const revealElements = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });
    revealElements.forEach(el => observer.observe(el));

    // === İLK YÜKLEME ===
    loadFromURL(); 
    if (scenarioCounter === 0) {
        createNewScenario();
    }
});