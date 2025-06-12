// File: /js/account.js
document.addEventListener('DOMContentLoaded', () => { // REMOVED async from here
    const user = JSON.parse(localStorage.getItem('bluestoneUser'));
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    const greetingNameEl = document.getElementById('greeting-name');
    if (greetingNameEl) greetingNameEl.textContent = `Hello, ${user.name}`;

    const accountDetailsBox = document.getElementById('account-details');
    if (accountDetailsBox) {
        accountDetailsBox.innerHTML = `<p><strong>Name:</strong> ${user.name}</p><p><strong>Email:</strong> ${user.email}</p>`;
    }

    const orderHistoryContainer = document.getElementById('order-history-container');
    const orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || [];

    if (orderHistory.length === 0) {
        orderHistoryContainer.innerHTML = '<p>You have not placed any orders yet.</p>';
    } else {
        // Fetch product data to get names before rendering history
        fetch('data/products.json')
            .then(response => {
                if (!response.ok) throw new Error('Could not load product data.');
                return response.json();
            })
            .then(allProducts => {
                orderHistoryContainer.innerHTML = orderHistory.map(order => {
                    return `
                    <div class="order-card">
                        <div class="order-card-header">
                            <div>
                                <span class="order-id">Order ID: ${order.orderId}</span>
                                <span class="order-date">Placed on: ${order.orderDate}</span>
                            </div>
                            <div class="order-total">
                                <span>Grand Total:</span>
                                <strong>₹${order.grandTotal.toLocaleString('en-IN')}</strong>
                            </div>
                        </div>
                        <div class="order-card-body">
                            ${order.items.map(item => {
                                const product = allProducts.find(p => p.id === item.id);
                                const productName = product ? product.name : 'Product';
                                return `
                                <div class="order-item">
                                    <img src="${item.image}" alt="${productName}">
                                    <div>${item.customizations.metal} ${productName} (x${item.quantity})</div>
                                </div>
                            `}).join('')}
                            ${order.selectedAddOns && order.selectedAddOns.length > 0 ? `
                                <div class="order-item addons">
                                    <i class="fa-solid fa-wand-magic-sparkles"></i>
                                    <div><strong>Services:</strong> ${order.selectedAddOns.map(s => s.name).join(', ')}</div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `}).join('');
            })
            .catch(error => {
                console.error("Error rendering order history:", error);
                orderHistoryContainer.innerHTML = '<p style="color:red;">Could not load order history details.</p>';
            });
    }

    const accountLogoutBtn = document.getElementById('account-logout-btn');
    if (accountLogoutBtn) {
        accountLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('bluestoneUser');
            window.location.href = 'index.html';
        });
    }
});