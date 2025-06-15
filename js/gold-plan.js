// File: /js/gold-plan.js
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Select all DOM elements upfront ---
    const amountSlider = document.getElementById('monthly-amount');
    const rangeValueDisplay = document.getElementById('range-value-display');
    const formMonthlyAmountInput = document.getElementById('form-monthly-amount');

    // Elements in the "Calculator Results" panel (right side)
    const totalPaymentEl = document.getElementById('total-payment');
    const discountAmountEl = document.getElementById('discount-amount');
    const totalWorthEl = document.getElementById('total-worth');
    const effectivePayEl = document.getElementById('effective-pay');
    const effectiveDiscountEl = document.getElementById('effective-discount-percent'); // For "You effectively get X% discount!"

    // Pie Chart related elements
    const pieChartEl = document.getElementById('calculator-pie-chart');
    const pieLabelDiscount = document.getElementById('pie-label-discount'); // The <div> for "100% Discount" label
    const pieLabelYouPay = document.getElementById('pie-label-you-pay');     // The <div> for "You Pay" label
    
    const redemptionOptionWrappers = document.querySelectorAll('.redemption-option-wrapper');
    const gmpStartForm = document.getElementById('gmp-start-form'); // Top banner form

    // --- Helper function for formatting currency ---
    const formatCurrency = (value) => `₹${value.toLocaleString('en-IN')}`;

    // --- 2. Main function to update all calculator displays ---
    function updateCalculatorDisplay(source = 'slider') {
        // Ensure essential elements are present before proceeding
        if (!amountSlider || !formMonthlyAmountInput) {
            console.warn("Essential calculator elements (slider or form input) not found. Aborting update.");
            return;
        }

        let monthlyAmount;

        // Determine monthlyAmount based on which element triggered the update
        if (source === 'input' && formMonthlyAmountInput.value.trim() !== "") {
            monthlyAmount = parseInt(formMonthlyAmountInput.value, 10);
            const minSlider = parseInt(amountSlider.min, 10);
            const maxSlider = parseInt(amountSlider.max, 10);
            const stepSlider = parseInt(amountSlider.step, 10) || 1000;

            // Validate and clamp the input value
            if (isNaN(monthlyAmount)) monthlyAmount = minSlider;
            monthlyAmount = Math.max(minSlider, Math.min(maxSlider, monthlyAmount));
            monthlyAmount = Math.round(monthlyAmount / stepSlider) * stepSlider;
            
            amountSlider.value = monthlyAmount; // Sync slider to validated input
            formMonthlyAmountInput.value = monthlyAmount; // Reflect validated amount in input
        } else {
            monthlyAmount = parseInt(amountSlider.value, 10);
            // Sync input to slider only if it's not the source or if input was initially empty/being prefilled
            if (formMonthlyAmountInput.value !== String(monthlyAmount) && (source === 'slider' || source === 'input_initial_empty' || source === 'prefill')) {
                 formMonthlyAmountInput.value = monthlyAmount;
            }
        }

        // Core calculations
        const totalPayment = monthlyAmount * 10;
        const discountAmount = monthlyAmount; // 11th installment is free
        const totalWorth = totalPayment + discountAmount;
        const effectiveDiscountPercent = totalWorth > 0 ? (discountAmount / totalWorth) * 100 : 0;

        // Update text in "Calculator Results" panel (right side)
        if (rangeValueDisplay) rangeValueDisplay.textContent = formatCurrency(monthlyAmount);
        if (totalPaymentEl) totalPaymentEl.textContent = formatCurrency(totalPayment);
        if (discountAmountEl) discountAmountEl.textContent = formatCurrency(discountAmount);
        if (totalWorthEl) totalWorthEl.textContent = formatCurrency(totalWorth);
        if (effectivePayEl) effectivePayEl.textContent = formatCurrency(totalPayment);
        
        // Update "You effectively get X% discount!"
        if (effectiveDiscountEl) {
            effectiveDiscountEl.textContent = `${effectiveDiscountPercent.toFixed(2)}% discount!`;
        }
        
        // Update text amounts INSIDE the pie chart labels
        if (pieLabelDiscount) {
            const amountSpan = pieLabelDiscount.querySelector('.pie-amount');
            if (amountSpan) amountSpan.textContent = formatCurrency(discountAmount);
        }
        if (pieLabelYouPay) {
            const amountSpan = pieLabelYouPay.querySelector('.pie-amount');
            if (amountSpan) amountSpan.textContent = formatCurrency(totalPayment);
        }

        // Update pie chart visual segments
        if (pieChartEl) {
            pieChartEl.style.setProperty('--p', `${effectiveDiscountPercent.toFixed(2)}%`);
        }
    }

    // --- 3. Function to update tooltip content ---
    function updateTooltipsContent() {
        if (!amountSlider) return;
        const monthlyAmount = parseInt(amountSlider.value, 10);
        
        const tooltip6 = document.getElementById('tooltip-6');
        if (tooltip6) {
            const paymentSpan = tooltip6.querySelector('p:nth-child(1) span');
            const discountSpan = tooltip6.querySelector('p:nth-child(2) span');
            const worthSpan = tooltip6.querySelector('.buy-worth span');

            if (paymentSpan) paymentSpan.textContent = formatCurrency(monthlyAmount * 5);
            if (discountSpan) discountSpan.textContent = formatCurrency(monthlyAmount * 0.25);
            if (worthSpan) worthSpan.textContent = formatCurrency(monthlyAmount * 5 + monthlyAmount * 0.25);
        }

        const tooltip8 = document.getElementById('tooltip-8');
        if (tooltip8) {
            const paymentSpan = tooltip8.querySelector('p:nth-child(1) span');
            const discountSpan = tooltip8.querySelector('p:nth-child(2) span');
            const worthSpan = tooltip8.querySelector('.buy-worth span');
            
            if (paymentSpan) paymentSpan.textContent = formatCurrency(monthlyAmount * 7);
            if (discountSpan) discountSpan.textContent = formatCurrency(monthlyAmount * 0.50);
            if (worthSpan) worthSpan.textContent = formatCurrency(monthlyAmount * 7 + monthlyAmount * 0.50);
        }
    }

    // --- 4. Function to handle pre-filling from URL parameter ---
    function handleUrlPrefill() {
        if (!amountSlider) return;

        const urlParams = new URLSearchParams(window.location.search);
        const prefillAmountStr = urlParams.get('prefillAmount');

        if (prefillAmountStr) {
            let prefillAmount = parseInt(prefillAmountStr, 10);
            const minSlider = parseInt(amountSlider.min, 10);
            const maxSlider = parseInt(amountSlider.max, 10);
            const stepSlider = parseInt(amountSlider.step, 10) || 1000;

            if (isNaN(prefillAmount)) prefillAmount = minSlider;
            prefillAmount = Math.max(minSlider, Math.min(maxSlider, prefillAmount));
            prefillAmount = Math.round(prefillAmount / stepSlider) * stepSlider; 

            amountSlider.value = prefillAmount;
            if (formMonthlyAmountInput) formMonthlyAmountInput.value = prefillAmount;
            return true; // Indicate that prefill happened
        }
        return false; // No prefill from URL
    }

    // --- 5. Attach Event Listeners ---
    if (amountSlider) {
        amountSlider.addEventListener('input', () => {
            updateCalculatorDisplay('slider');
            updateTooltipsContent();
        });
    }

    if (formMonthlyAmountInput) {
        formMonthlyAmountInput.addEventListener('change', () => { // Use 'change' for when user confirms input
            updateCalculatorDisplay('input');
            updateTooltipsContent();
        });
        formMonthlyAmountInput.addEventListener('blur', () => { // Also update on blur if value changed
            if(formMonthlyAmountInput.value.trim() === "") { // If empty on blur, reset to slider
                updateCalculatorDisplay('slider'); 
            } else {
                updateCalculatorDisplay('input'); // Validate and sync
            }
            updateTooltipsContent();
        });
    }
    
    if (redemptionOptionWrappers) {
        redemptionOptionWrappers.forEach(wrapper => {
            const option = wrapper.querySelector('.option');
            const tooltipId = option ? option.dataset.tooltipId : null;
            const tooltip = tooltipId ? document.getElementById(tooltipId) : null;
            
            if(option && tooltip){
                option.addEventListener('mouseover', () => tooltip.classList.add('visible'));
                option.addEventListener('mouseout', () => tooltip.classList.remove('visible'));
            }
        });
    }
    
    if (gmpStartForm) {
        gmpStartForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            if (emailInput && emailInput.value.trim() !== "") {
                const currentAmount = formMonthlyAmountInput ? formMonthlyAmountInput.value : (amountSlider ? amountSlider.value : 'N/A');
                alert(`Thank you for your interest! We'll contact ${emailInput.value} about the 10+1 Plan for ₹${parseInt(currentAmount).toLocaleString('en-IN')} per month.`);
                // Potentially clear form or give other feedback
            } else if (emailInput) {
                alert("Please enter your email address.");
                emailInput.focus();
            }
        });
    }

    // --- 6. Initial Page Load Setup ---
    if (amountSlider && formMonthlyAmountInput) {
        const prefilledFromUrl = handleUrlPrefill();    
        // If prefilled from URL, the input is already set, so treat it as 'input' source.
        // Otherwise, if input is empty, slider is source. If input has a value (not default 2000), input is source.
        let initialSource = 'slider';
        if (prefilledFromUrl) {
            initialSource = 'prefill';
        } else if (formMonthlyAmountInput.value.trim() !== "" && formMonthlyAmountInput.value !== amountSlider.defaultValue) {
            initialSource = 'input';
        }
        
        updateCalculatorDisplay(initialSource);
        updateTooltipsContent();   
    } else {
        console.error("Gold Plan Calculator essential elements (slider or formMonthlyAmountInput) not found on page load. Cannot initialize.");
    }
});