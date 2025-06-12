// File: /js/checkout.js
document.addEventListener('DOMContentLoaded', () => { // REMOVED async from here

    const orderDetails = JSON.parse(localStorage.getItem('currentOrderDetails'));
    const user = JSON.parse(localStorage.getItem('bluestoneUser'));
    
    if (!orderDetails || !user) {
        alert("Session expired or invalid access. Returning to cart.");
        window.location.href = 'cart.html';
        return;
    }

    // This section was the source of the "undefined" bug. We must fetch product data.
    let allProducts = [];
    fetch('data/products.json')
        .then(response => {
            if (!response.ok) throw new Error('Could not load product data.');
            return response.json();
        })
        .then(data => {
            allProducts = data;
            // Now that we have the product data, we can render the page correctly.
            renderCheckoutPage();
        })
        .catch(error => {
            console.error("Fatal Error:", error);
            document.querySelector('.checkout-summary-column').innerHTML = `<p style="color:red;">Error loading order details.</p>`;
        });

    // --- DOM ELEMENT SELECTORS ---
    const itemsSummaryContainer = document.getElementById('checkout-items-summary');
    const subtotalEl = document.getElementById('summary-subtotal');
    const discountRow = document.getElementById('summary-discount-row'), discountEl = document.getElementById('summary-discount');
    const addonsRow = document.getElementById('summary-addons-row'), addonsEl = document.getElementById('summary-addons');
    const makingChargesRow = document.getElementById('summary-making-charges-row'), makingChargesEl = document.getElementById('summary-making-charges');
    const gstRow = document.getElementById('summary-gst-row'), gstEl = document.getElementById('summary-gst');
    const grandTotalEl = document.getElementById('summary-grand-total');
    const placeOrderBtn = document.getElementById('place-order-btn');
    const shippingNameInput = document.getElementById('shipping-name');

    function renderCheckoutPage() {
        // --- RENDER THE PAGE ---
        shippingNameInput.value = user.name;

        itemsSummaryContainer.innerHTML = orderDetails.items.map(item => {
            const product = allProducts.find(p => p.id === item.id);
            const productName = product ? product.name : "Product";
            return `
            <div class="summary-item">
                <img src="${item.image}" alt="${productName}" class="summary-item-image">
                <div class="summary-item-details">
                    <span class="summary-item-name">${item.customizations.metal} ${productName} (x${item.quantity})</span>
                    <span class="summary-item-price">₹${(item.finalPrice * item.quantity).toLocaleString('en-IN')}</span>
                </div>
            </div>
        `}).join('');

        const subtotal = orderDetails.subtotal, discountAmount = orderDetails.discountAmount, addOnsTotal = orderDetails.addOnsTotal;
        const makingCharges = subtotal * 0.05, gst = (subtotal + makingCharges - discountAmount) * 0.03, totalCharges = makingCharges + gst;
        const grandTotal = subtotal - discountAmount + addOnsTotal + totalCharges;

        subtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
        grandTotalEl.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;

        if (discountAmount > 0) { discountEl.textContent = `- ₹${discountAmount.toLocaleString('en-IN')}`; discountRow.style.display = 'flex'; }
        if (addOnsTotal > 0) { addonsEl.textContent = `+ ₹${addOnsTotal.toLocaleString('en-IN')}`; addonsRow.style.display = 'flex'; }
        if (makingCharges > 0) { makingChargesEl.textContent = `+ ₹${makingCharges.toLocaleString('en-IN')}`; makingChargesRow.style.display = 'flex'; }
        if (gst > 0) { gstEl.textContent = `+ ₹${gst.toLocaleString('en-IN')}`; gstRow.style.display = 'flex'; }
    }

    // --- EVENT LISTENERS ---
    placeOrderBtn.addEventListener('click', () => {
    const requiredInputs = document.querySelectorAll('#shipping-form input[required]');
    let allValid = true;
    requiredInputs.forEach(input => {
        if (!input.value.trim()) { allValid = false; input.style.borderColor = 'red'; }
        else { input.style.borderColor = '#d1d5db'; }
    });

    if (allValid) {
        // --- NEW: Calculate delivery date ---
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 7); // Simulate 7-day delivery
        const grandTotal = parseFloat(grandTotalEl.textContent.replace(/[^0-9.]/g, ''));

        const orderToSave = {
            ...orderDetails,
            orderId: `BS-${Date.now()}`,
            orderDate: new Date().toLocaleDateString(),
            grandTotal: grandTotal,
            expectedDelivery: deliveryDate.toLocaleDateString(), // Save the new date
            status: 'Placed' // Add an initial status
        };
        
        const orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || [];
        orderHistory.unshift(orderToSave);
        localStorage.setItem('orderHistory', JSON.stringify(orderHistory));

        localStorage.removeItem('cart');
        localStorage.removeItem('currentOrderDetails');
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        window.location.href = 'confirmation.html';
    } else {
        alert('Please fill in all required shipping details.');
    }
});
});