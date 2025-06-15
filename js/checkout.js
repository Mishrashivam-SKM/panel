// File: /js/checkout.js
document.addEventListener('DOMContentLoaded', () => {

    const orderDetails = JSON.parse(localStorage.getItem('currentOrderDetails'));
    const user = JSON.parse(localStorage.getItem('bluestoneUser')); // This is the current session user
    
    if (!orderDetails || !user) {
        alert("Session expired or invalid access. Returning to cart.");
        window.location.href = 'cart.html';
        return;
    }

    // --- DOM ELEMENT SELECTORS ---
    const itemsSummaryContainer = document.getElementById('checkout-items-summary');
    const subtotalEl = document.getElementById('summary-subtotal');
    const discountRow = document.getElementById('summary-discount-row');
    const discountEl = document.getElementById('summary-discount');
    const addonsRow = document.getElementById('summary-addons-row');
    const addonsEl = document.getElementById('summary-addons');
    const makingChargesRow = document.getElementById('summary-making-charges-row');
    const makingChargesEl = document.getElementById('summary-making-charges');
    const gstRow = document.getElementById('summary-gst-row');
    const gstEl = document.getElementById('summary-gst');
    const grandTotalEl = document.getElementById('summary-grand-total');
    const placeOrderBtn = document.getElementById('place-order-btn');
    const shippingNameInput = document.getElementById('shipping-name');
    // For shipping form query
    const shippingForm = document.getElementById('shipping-form');


    let allProducts = []; 

    async function fetchProductDataAndRender() {
        try {
            const response = await fetch('data/products.json');
            if (!response.ok) {
                throw new Error('Could not load product data. Please try again.');
            }
            allProducts = await response.json();
            renderCheckoutPage();
        } catch (error) {
            console.error("Fatal Error fetching product data:", error);
            const summaryColumn = document.querySelector('.checkout-summary-column .order-summary');
            if (summaryColumn) {
                summaryColumn.innerHTML = `<p style="color:red;">Error loading order details: ${error.message}</p><a href="cart.html">Return to Cart</a>`;
            }
        }
    }

    function renderCheckoutPage() {
        if (!user || !orderDetails) return;

        if (shippingNameInput && user.name) {
            shippingNameInput.value = user.name;
        }

        if (itemsSummaryContainer) {
            if (orderDetails.items && orderDetails.items.length > 0) {
                itemsSummaryContainer.innerHTML = orderDetails.items.map(item => {
                    const product = allProducts.find(p => p.id === item.id);
                    const productName = product ? product.name : "Product";
                    const itemImage = item.image || (product ? product.images[0] : 'images/default-product.png');
                    return `
                    <div class="summary-item">
                        <img src="${itemImage}" alt="${productName}" class="summary-item-image">
                        <div class="summary-item-details">
                            <span class="summary-item-name">${item.customizations ? item.customizations.metal : ''} ${productName} (x${item.quantity})</span>
                            <span class="summary-item-price">₹${(item.finalPrice * item.quantity).toLocaleString('en-IN')}</span>
                        </div>
                    </div>`;
                }).join('');
            } else if (orderDetails.selectedAddOns && orderDetails.selectedAddOns.length > 0) {
                itemsSummaryContainer.innerHTML = orderDetails.selectedAddOns.map(addon => `
                    <div class="summary-item">
                        <img src="${orderDetails.selectedAddOns[0].name==="Premium Club Membership"? "images/premium.png":"images/elite.png"}" alt="${addon.name}" class="summary-item-image" style="object-fit:contain; padding: 5px; ">
                        <div class="summary-item-details">
                             <span class="summary-item-name">${addon.name}</span>
                             <span class="summary-item-price">₹${addon.price.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                `).join('');
            } else {
                itemsSummaryContainer.innerHTML = '<p>No items in this order.</p>';
            }
        }

        const subtotal = orderDetails.subtotal || 0;
        const discountAmount = orderDetails.discountAmount || 0;
        const addOnsTotal = orderDetails.addOnsTotal || 0;
        const makingCharges = subtotal > 0 ? subtotal * 0.05 : 0; 
        const taxableAmountForGoods = Math.max(0, subtotal + makingCharges - discountAmount);
        const gst = (taxableAmountForGoods + addOnsTotal) * 0.03;
        const grandTotal = Math.max(0, subtotal - discountAmount + addOnsTotal + makingCharges + gst);

        if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
        if (grandTotalEl) grandTotalEl.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;

        if (discountRow && discountEl) {
            discountRow.style.display = discountAmount > 0 ? 'flex' : 'none';
            if (discountAmount > 0) discountEl.textContent = `- ₹${discountAmount.toLocaleString('en-IN')}`;
        }
        if (addonsRow && addonsEl) {
            addonsRow.style.display = addOnsTotal > 0 ? 'flex' : 'none';
            if (addOnsTotal > 0) addonsEl.textContent = `+ ₹${addOnsTotal.toLocaleString('en-IN')}`;
        }
        if (makingChargesRow && makingChargesEl) {
            makingChargesRow.style.display = makingCharges > 0 ? 'flex' : 'none';
            if (makingCharges > 0) makingChargesEl.textContent = `+ ₹${makingCharges.toLocaleString('en-IN')}`;
        }
        if (gstRow && gstEl) {
            gstRow.style.display = gst > 0 ? 'flex' : 'none';
            if (gst > 0) gstEl.textContent = `+ ₹${gst.toLocaleString('en-IN')}`;
        }
    }

    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', () => {
            if (!shippingForm) {
                alert("Shipping form not found. Cannot place order.");
                return;
            }
            const requiredInputs = shippingForm.querySelectorAll('input[required]');
            let allValid = true;
            
            requiredInputs.forEach(input => {
                if (!input.value.trim()) {
                    allValid = false;
                    input.style.borderColor = 'red';
                } else {
                    input.style.borderColor = '#d1d5db';
                }
            });

            if (allValid) {
                const deliveryDaysMin = 5;
                const deliveryDaysMax = 10;
                const randomDeliveryDays = Math.floor(Math.random() * (deliveryDaysMax - deliveryDaysMin + 1)) + deliveryDaysMin;
                const deliveryDate = new Date();
                deliveryDate.setDate(deliveryDate.getDate() + randomDeliveryDays); 
                
                const finalGrandTotalText = grandTotalEl ? grandTotalEl.textContent : '₹0';
                const finalGrandTotal = parseFloat(finalGrandTotalText.replace(/[^0-9.]/g, '')) || 0;

                const shippingDetails = {
                    name: shippingForm.querySelector('input[placeholder="Full Name"]').value,
                    address: shippingForm.querySelector('input[placeholder="Address"]').value,
                    city: shippingForm.querySelector('input[placeholder="City"]').value,
                    pincode: shippingForm.querySelector('input[placeholder="Pincode"]').value,
                    mobile: shippingForm.querySelector('input[placeholder="Mobile Number"]').value,
                };

                // --- Logic to SAVE ADDRESS to user profile ---
                const currentUserForAddressSave = JSON.parse(localStorage.getItem('bluestoneUser'));
                if (currentUserForAddressSave) {
                    if (!currentUserForAddressSave.addresses) {
                        currentUserForAddressSave.addresses = [];
                    }
                    const newAddressString = JSON.stringify(shippingDetails);
                    const isDuplicate = currentUserForAddressSave.addresses.some(addr => JSON.stringify(addr) === newAddressString);
                    
                    if (!isDuplicate) {
                        currentUserForAddressSave.addresses.push(shippingDetails);
                        localStorage.setItem('bluestoneUser', JSON.stringify(currentUserForAddressSave));

                        const usersDB = JSON.parse(localStorage.getItem('bluestoneUsersDB')) || {};
                        if (usersDB[currentUserForAddressSave.email]) {
                            if (!usersDB[currentUserForAddressSave.email].addresses) {
                                usersDB[currentUserForAddressSave.email].addresses = [];
                            }
                            const isDbDuplicate = usersDB[currentUserForAddressSave.email].addresses.some(addr => JSON.stringify(addr) === newAddressString);
                            if(!isDbDuplicate){
                                usersDB[currentUserForAddressSave.email].addresses.push(shippingDetails);
                                localStorage.setItem('bluestoneUsersDB', JSON.stringify(usersDB));
                            }
                        }
                    }
                }
                // --- End of SAVE ADDRESS logic ---

                const orderToSave = {
                    items: orderDetails.items || [],
                    subtotal: orderDetails.subtotal || 0,
                    discountAmount: orderDetails.discountAmount || 0,
                    couponCode: orderDetails.couponCode || null,
                    addOnsTotal: orderDetails.addOnsTotal || 0,
                    selectedAddOns: orderDetails.selectedAddOns || [],
                    orderId: `BS-${Date.now()}`,
                    orderDate: new Date().toLocaleDateString('en-GB'),
                    grandTotal: finalGrandTotal,
                    shippingAddress: shippingDetails, // This specific order's shipping address
                    paymentMethod: shippingForm.querySelector('input[name="payment"]:checked') ? 
                                   shippingForm.querySelector('input[name="payment"]:checked').parentElement.textContent.trim() : 
                                   "Credit/Debit Card",
                    expectedDelivery: deliveryDate.toLocaleDateString('en-GB'),
                    status: 'Placed'
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
    }

    fetchProductDataAndRender();
});