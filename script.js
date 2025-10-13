document.addEventListener('DOMContentLoaded', () => {
    // Girdi Alanları
    const mainOddsInput = document.getElementById('main-odds');
    const mainStakeInput = document.getElementById('main-stake');
    const hedgeOddsInput = document.getElementById('hedge-odds');
    const hedgeStakeInput = document.getElementById('hedge-stake');
    const hedgeStakeSlider = document.getElementById('hedge-stake-slider');
    const targetProfitInput = document.getElementById('target-profit');
    // DÜZELTME: Butonun ID'si güncellendi
    const goToTargetBtn = document.getElementById('go-to-target-btn');

    // Görüntüleme Alanları
    const potentialPayoutDisplay = document.getElementById('potential-payout');
    const resultsSection = document.getElementById('results-section');
    const summaryInfo = document.getElementById('summary-info');
    const totalSpendDisplay = document.getElementById('total-spend');
    const profitMainWinsDisplay = document.getElementById('profit-main-wins');
    const roiMainWinsDisplay = document.getElementById('roi-main-wins');
    const profitHedgeWinsDisplay = document.getElementById('profit-hedge-wins');
    const roiHedgeWinsDisplay = document.getElementById('roi-hedge-wins');

    const allInputs = [mainOddsInput, mainStakeInput, hedgeOddsInput, hedgeStakeInput, targetProfitInput];

    allInputs.forEach(input => {
        input.addEventListener('input', calculate);
    });

    // Kaydırma çubuğu, metin kutusunu günceller
    hedgeStakeSlider.addEventListener('input', () => {
        hedgeStakeInput.value = hedgeStakeSlider.value;
        calculate();
    });

    // Metin kutusu, kaydırma çubuğunu günceller
    hedgeStakeInput.addEventListener('input', () => {
        const stakeValue = parseFloat(hedgeStakeInput.value) || 0;
        if (stakeValue > hedgeStakeSlider.max) {
            hedgeStakeSlider.max = stakeValue * 1.5;
        }
        hedgeStakeSlider.value = stakeValue;
    });

    // "Hedefe Git" butonu
    goToTargetBtn.addEventListener('click', () => {
        const mainStake = parseFloat(mainStakeInput.value) || 0;
        const hedgeOdds = parseFloat(hedgeOddsInput.value) || 0;
        const targetProfit = parseFloat(targetProfitInput.value) || 0;

        if (mainStake > 0 && hedgeOdds > 1) {
            const requiredStake = (mainStake + targetProfit) / (hedgeOdds - 1);
            hedgeStakeInput.value = requiredStake.toFixed(2);
            hedgeStakeInput.dispatchEvent(new Event('input')); 
            calculate();
        }
    });

    function calculate() {
        const mainOdds = parseFloat(mainOddsInput.value) || 0;
        const mainStake = parseFloat(mainStakeInput.value) || 0;
        const hedgeOdds = parseFloat(hedgeOddsInput.value) || 0;
        const hedgeStake = parseFloat(hedgeStakeInput.value) || 0;
        const potentialPayout = mainOdds * mainStake;
        potentialPayoutDisplay.textContent = `${potentialPayout.toFixed(2)} ₺`;

        if ((mainOdds > 1 && mainStake > 0 && hedgeOdds > 1 && hedgeStake >= 0) && resultsSection.style.display === 'none') {
            resultsSection.style.display = 'block';
            resultsSection.classList.add('active');
        } else if (!(mainOdds > 1 && mainStake > 0 && hedgeOdds > 1 && hedgeStake >= 0)) {
            resultsSection.style.display = 'none';
            resultsSection.classList.remove('active');
            return;
        }

        const totalSpend = mainStake + hedgeStake;
        totalSpendDisplay.textContent = `${totalSpend.toFixed(2)} ₺`;

        const netProfitMainWins = potentialPayout - totalSpend;
        const roiMainWins = totalSpend > 0 ? (netProfitMainWins / totalSpend) * 100 : 0;
        updateResultUI(profitMainWinsDisplay, netProfitMainWins, '₺');
        updateResultUI(roiMainWinsDisplay, roiMainWins, '%');

        const hedgePayout = hedgeOdds * hedgeStake;
        const netProfitHedgeWins = hedgePayout - totalSpend;
        const roiHedgeWins = totalSpend > 0 ? (netProfitHedgeWins / totalSpend) * 100 : 0;
        updateResultUI(profitHedgeWinsDisplay, netProfitHedgeWins, '₺');
        updateResultUI(roiHedgeWinsDisplay, roiHedgeWins, '%');
        
        summaryInfo.classList.remove('summary-profit', 'summary-risk');
        if (netProfitMainWins >= 0 && netProfitHedgeWins >= 0) {
            summaryInfo.className = 'summary-info summary-profit';
            summaryInfo.textContent = 'Harika! Bu dağılımla her iki senaryoda da pozitif getiri elde edilebilir.';
        } else {
            summaryInfo.className = 'summary-info summary-risk';
            summaryInfo.textContent = 'Dikkat: Bir senaryoda negatif getiri riski mevcut. Değerleri ayarlayarak riski yönetebilirsiniz.';
        }
    }

    function updateResultUI(element, value, unit) {
        element.textContent = `${value.toFixed(2)}${unit}`;
        element.classList.remove('profit', 'loss');
        if (value > 0) {
            element.classList.add('profit');
            element.textContent = `+${value.toFixed(2)}${unit}`;
        } else if (value < 0) {
            element.classList.add('loss');
        }
    }
    
    const revealElements = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
    revealElements.forEach(el => observer.observe(el));

    const backgroundGlow = document.querySelector('.background-glow');
    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 100;
        const y = (e.clientY / window.innerHeight - 0.5) * 100;
        backgroundGlow.style.transform = `translate(-50%, -50%) translateX(${x * 0.5}px) translateY(${y * 0.5}px)`;
        backgroundGlow.style.opacity = 0.6 + (Math.abs(x) + Math.abs(y)) / 200 * 0.2;
    });
});