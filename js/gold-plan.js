// File: /js/gold-plan.js (FINAL VERSION with Tooltips)
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Select all elements ---
    const amountSlider = document.getElementById('monthly-amount');
    const rangeValueDisplay = document.getElementById('range-value-display');
    const formMonthlyAmount = document.getElementById('form-monthly-amount');
    const totalPaymentEl = document.getElementById('total-payment');
    const discountAmountEl = document.getElementById('discount-amount');
    const totalWorthEl = document.getElementById('total-worth');
    const effectivePayEl = document.getElementById('effective-pay');
    const effectiveDiscountEl = document.getElementById('effective-discount-percent');
    const pieChartEl = document.getElementById('calculator-pie-chart');
    const pieYouPayEl = document.getElementById('pie-you-pay');
    const pieDiscountEl = document.getElementById('pie-discount');
    const redemptionOptions = document.querySelectorAll('.redemption-options .option');

    const formatCurrency = (value) => `₹${value.toLocaleString('en-IN')}`;

    // --- 2. Main calculator update function ---
    function updateCalculator() {
        if (!amountSlider) return; // Exit if elements are not on the page

        const monthlyAmount = parseInt(amountSlider.value, 10);
        const totalPayment = monthlyAmount * 10;
        const discountAmount = monthlyAmount;
        const totalWorth = totalPayment + discountAmount;
        const effectiveDiscountPercent = (discountAmount / totalWorth) * 100;

        // Update all text elements
        if (rangeValueDisplay) rangeValueDisplay.textContent = formatCurrency(monthlyAmount);
        if (formMonthlyAmount) formMonthlyAmount.value = formatCurrency(monthlyAmount);
        if (totalPaymentEl) totalPaymentEl.textContent = formatCurrency(totalPayment);
        if (discountAmountEl) discountAmountEl.textContent = formatCurrency(discountAmount);
        if (totalWorthEl) totalWorthEl.textContent = formatCurrency(totalWorth);
        if (effectivePayEl) effectivePayEl.textContent = formatCurrency(totalPayment);
        if (effectiveDiscountEl) effectiveDiscountEl.textContent = `${effectiveDiscountPercent.toFixed(2)}%`;
        if (pieYouPayEl) pieYouPayEl.querySelector('span').textContent = formatCurrency(totalPayment);
        if (pieDiscountEl) pieDiscountEl.querySelector('span').textContent = formatCurrency(discountAmount);
        if (pieChartEl) pieChartEl.style.setProperty('--p', `${(discountAmount / totalWorth) * 100}%`);
    }

    // --- 3. Tooltip and Early Redemption Logic ---
    function updateTooltips() {
         if (!amountSlider) return;
        const monthlyAmount = parseInt(amountSlider.value, 10);
        
        // Tooltip for 6th month
        const tooltip6 = document.getElementById('tooltip-6');
        if (tooltip6) {
            tooltip6.querySelector('p:nth-child(1) span').textContent = formatCurrency(monthlyAmount * 5);
            tooltip6.querySelector('p:nth-child(2) span').textContent = formatCurrency(monthlyAmount * 0.25);
            tooltip6.querySelector('.buy-worth span').textContent = formatCurrency(monthlyAmount * 5.25);
        }

        // Tooltip for 8th month
        const tooltip8 = document.getElementById('tooltip-8');
        if (tooltip8) {
            tooltip8.querySelector('p:nth-child(1) span').textContent = formatCurrency(monthlyAmount * 7);
            tooltip8.querySelector('p:nth-child(2) span').textContent = formatCurrency(monthlyAmount * 0.50);
            tooltip8.querySelector('.buy-worth span').textContent = formatCurrency(monthlyAmount * 7.50);
        }
    }

    // --- 4. Attach Event Listeners ---
    if (amountSlider) {
        amountSlider.addEventListener('input', () => {
            updateCalculator();
            updateTooltips();
        });
        
        // Initial setup on page load
        updateCalculator();
        updateTooltips();
    }

    redemptionOptions.forEach(option => {
        const tooltipId = option.dataset.tooltipId;
        const tooltip = document.getElementById(tooltipId);
        if(tooltip){
            option.addEventListener('mouseover', () => {
                tooltip.classList.add('visible');
            });
            option.addEventListener('mouseout', () => {
                tooltip.classList.remove('visible');
            });
        }
    });
});