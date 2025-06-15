// File: /js/account.js
document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('bluestoneUser'));
    if (!user) {
        window.location.href = 'login.html'; // Redirect if not logged in
        return;
    }

    // --- DOM Element Selectors ---
    const greetingNameEl = document.getElementById('greeting-name');
    const orderHistoryContainer = document.getElementById('order-history-container');
    const accountLogoutBtn = document.getElementById('account-logout-btn');
    const accountNavLinks = document.querySelectorAll('.account-nav-link[data-target]');
    const accountContentSections = document.querySelectorAll('.account-content-section');
    const editProfileForm = document.getElementById('edit-profile-form');
    const profileEmailInput = document.getElementById('profile-email');
    const profileNameInput = document.getElementById('profile-name');
    const editProfileFeedbackEl = document.getElementById('edit-profile-feedback');
    const savedAddressesContainer = document.getElementById('saved-addresses-container');

    // --- Initial Greeting ---
    function updateGreeting() {
        const currentUser = JSON.parse(localStorage.getItem('bluestoneUser'));
        if (greetingNameEl && currentUser) {
            greetingNameEl.textContent = `Hello, ${currentUser.name || 'User'}`;
        }
    }
    updateGreeting();

    // --- Sidebar Navigation Logic ---
    if (accountNavLinks && accountContentSections) {
        accountNavLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                if (this.id === 'account-logout-btn') return;
                e.preventDefault();
                const targetId = this.dataset.target;

                accountNavLinks.forEach(navLink => navLink.classList.remove('active'));
                this.classList.add('active');

                accountContentSections.forEach(section => {
                    const isActive = section.id === targetId;
                    section.style.display = isActive ? 'block' : 'none';
                    if (isActive) {
                        if (targetId === 'edit-profile-content') loadProfileDataForEdit();
                        else if (targetId === 'my-orders-content') renderOrderHistory();
                        else if (targetId === 'saved-addresses-content') renderSavedAddresses();
                    }
                });
            });
        });
    }

    // --- Edit Profile Logic ---
    function loadProfileDataForEdit() {
        const currentUser = JSON.parse(localStorage.getItem('bluestoneUser'));
        if (!currentUser) return;
        if (profileEmailInput) profileEmailInput.value = currentUser.email;
        if (profileNameInput) profileNameInput.value = currentUser.name;
        if (editProfileFeedbackEl) {
            editProfileFeedbackEl.textContent = '';
            editProfileFeedbackEl.className = 'feedback-message';
            editProfileFeedbackEl.style.display = 'none';
        }
    }

    if (editProfileForm) {
        editProfileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!profileNameInput) return;
            const newName = profileNameInput.value.trim();
            const currentUser = JSON.parse(localStorage.getItem('bluestoneUser'));

            if (!newName) {
                showEditProfileFeedback('Name cannot be empty.', 'error');
                return;
            }
            if (newName === currentUser.name) {
                showEditProfileFeedback('Name is already up to date.', 'success');
                return;
            }

            currentUser.name = newName;
            localStorage.setItem('bluestoneUser', JSON.stringify(currentUser));
            const usersDB = JSON.parse(localStorage.getItem('bluestoneUsersDB')) || {};
            if (usersDB[currentUser.email]) {
                usersDB[currentUser.email].name = newName;
                localStorage.setItem('bluestoneUsersDB', JSON.stringify(usersDB));
            }
            updateGreeting();
            window.dispatchEvent(new CustomEvent('userProfileUpdated', { detail: { name: newName } }));
            showEditProfileFeedback('Profile updated successfully!', 'success');
        });
    }

    function showEditProfileFeedback(message, type) {
        if (editProfileFeedbackEl) {
            editProfileFeedbackEl.textContent = message;
            editProfileFeedbackEl.className = `feedback-message ${type}`;
            editProfileFeedbackEl.style.display = 'block';
        }
    }

    // --- Order History Logic ---
    async function renderOrderHistory() {
        if (!orderHistoryContainer) return;
        let orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || [];
        if (orderHistory.length === 0) {
            orderHistoryContainer.innerHTML = '<p>You have not placed any orders yet.</p>';
            return;
        }

        try {
            const response = await fetch('data/products.json');
            if (!response.ok) throw new Error('Could not load product data for order history.');
            const allProducts = await response.json();
            orderHistory.sort((a, b) => new Date(b.orderDate.split('/').reverse().join('-')) - new Date(a.orderDate.split('/').reverse().join('-')));

            orderHistoryContainer.innerHTML = orderHistory.map(order => {
                const isCancellable = order.status && order.status.toLowerCase() === 'placed';
                const statusColor = order.status === 'Cancelled' ? '#d9232d' : 
                                    order.status === 'Delivered' ? '#28a745' : '#007bff';
                
                // ---- ADDED EXPECTED DELIVERY DISPLAY HERE ----
                const expectedDeliveryHTML = order.expectedDelivery ? 
                    `<span class="order-delivery" style="display:block; font-size:0.85em; rgb(107, 114, 128);">Expected Delivery: ${order.expectedDelivery}</span>` 
                    : '';

                return `
                <div class="order-card" id="order-${order.orderId}">
                    <div class="order-card-header">
                        <div>
                            <span class="order-id">Order ID: ${order.orderId}</span>
                            <span class="order-date" style="color:rgb(107, 114, 128);">Placed on: ${order.orderDate || 'N/A'}</span>
                            ${expectedDeliveryHTML} 
                            <span class="order-status" style="display:block; margin-top: 5px; font-weight:bold; color: ${statusColor};">
                                Status: ${order.status || 'Processing'}
                            </span>
                        </div>
                       <div class="order-total">
                            <span>Grand Total:</span><strong><sub>₹${(order.grandTotal || 0).toLocaleString('en-IN')}</sub></strong>
                            ${isCancellable ? 
                                `<br><button class="btn btn-danger btn-sm cancel-order-btn" data-order-id="${order.orderId}" style="margin-top:10px; padding: 5px 10px; font-size: 0.8em;">Cancel Order</button>` 
                                : ''
                            }
                        </div>
                    </div>
                    <div class="order-card-body">
                        ${order.items && order.items.length > 0 ? order.items.map(item => {
                            const product = allProducts.find(p => p.id === item.id);
                            const productName = product ? product.name : 'Product Details Unavailable';
                            const itemImage = item.image || (product ? product.images[0] : 'images/default-product.png');
                            const metal = item.customizations ? item.customizations.metal : '';
                            return `
                            <div class="order-item">
                                <img src="${itemImage}" alt="${productName}">
                                <div>${metal} ${productName} (x${item.quantity || 1})</div>
                            </div>`;
                        }).join('') : '<p style="font-style:italic; color:#777; font-size:0.9em;">No physical products in this order.</p>'}

                        ${order.selectedAddOns && order.selectedAddOns.length > 0 ? `
                            <div class="order-item addons" style="margin-top:10px; padding-top:10px; border-top: 1px dashed #eee;">
                                <i class="fa-solid fa-wand-magic-sparkles"></i>
                                <div><strong>Services:</strong> ${order.selectedAddOns.map(s => `${s.name} (₹${(s.price || 0).toLocaleString('en-IN')})`).join(', ')}</div>
                            </div>
                        ` : ''}
                    </div>
                </div>`;
            }).join('');
        } catch (error) {
            console.error("Error rendering order history:", error);
            orderHistoryContainer.innerHTML = `<p style="color:red;">Could not load order history details. ${error.message}</p>`;
        }
    }

    if (orderHistoryContainer) {
        orderHistoryContainer.addEventListener('click', function(event) {
            if (event.target.classList.contains('cancel-order-btn')) {
                const orderIdToCancel = event.target.dataset.orderId;
                if (confirm(`Are you sure you want to cancel order ${orderIdToCancel}? This action cannot be undone.`)) {
                    cancelOrderAndUpdate(orderIdToCancel);
                }
            }
        });
    }

    function cancelOrderAndUpdate(orderId) {
        let orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || [];
        const orderIndex = orderHistory.findIndex(order => order.orderId === orderId);
        if (orderIndex > -1 && orderHistory[orderIndex].status && orderHistory[orderIndex].status.toLowerCase() === 'placed') {
            orderHistory[orderIndex].status = 'Cancelled';
            localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
            showEditProfileFeedback(`Order ${orderId} has been cancelled.`, 'success');
            renderOrderHistory();
        } else {
            showEditProfileFeedback(`Order ${orderId} cannot be cancelled or was not found.`, 'error');
        }
    }

    // --- Saved Addresses Logic ---
    function renderSavedAddresses() {
        if (!savedAddressesContainer) return;
        const currentUser = JSON.parse(localStorage.getItem('bluestoneUser'));
        if (!currentUser || !currentUser.addresses || currentUser.addresses.length === 0) {
            savedAddressesContainer.innerHTML = '<p>You have no saved addresses yet.</p>';
            return;
        }
        savedAddressesContainer.innerHTML = `
            <div class="address-list">
                ${currentUser.addresses.map((addr, index) => `
                    <div class="address-card" style="border: 1px solid #eee; padding: 15px; margin-bottom: 15px; border-radius: 4px;">
                        <p style="margin-top:0; margin-bottom:5px;"><strong>Address ${index + 1}:</strong></p>
                        <p style="margin:2px 0;">${addr.name}</p>
                        <p style="margin:2px 0;">${addr.address}</p>
                        <p style="margin:2px 0;">${addr.city}, ${addr.pincode}</p>
                        <p style="margin:2px 0;">Mobile: ${addr.mobile}</p>
                    </div>
                `).join('')}
            </div>`;
    }

    // --- Logout Logic ---
    if (accountLogoutBtn) {
        accountLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('bluestoneUser');
            window.location.href = 'index.html';
        });
    }

    // --- Initial Page Setup ---
    renderOrderHistory();
});

