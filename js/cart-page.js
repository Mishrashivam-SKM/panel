// File: /js/cart-page.js
document.addEventListener('DOMContentLoaded', async function () {
    // --- 1. GET ALL HTML ELEMENTS ---
    const cartItemsContainer = document.getElementById('cart-items-container');
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');
    const cartLayoutContainer = document.getElementById('cart-container'); // The main grid container
    
    // Main columns/sections to hide/show
    const cartMainColumn = document.querySelector('.cart-main-column');
    const cartOrderSummaryAside = document.getElementById('cart-order-summary-aside');
    const cartAddOnServicesSection = document.getElementById('cart-add-on-services-section');

    // Coupon elements
    const couponSection = document.querySelector('.coupon-section');
    const discountRow = document.getElementById('discount-row');
    const discountEl = document.getElementById('cart-discount');
    const couponInput = document.getElementById('coupon-code');
    const applyCouponBtn = document.getElementById('apply-coupon-btn');
    const removeCouponBtn = document.getElementById('remove-coupon-btn');
    const couponFeedback = document.getElementById('coupon-feedback');

    // Add-on Elements (from the standard add-on section)
    const addOnsRow = document.getElementById('addons-row'); // In summary
    const addOnsTotalEl = document.getElementById('cart-addons-total'); // In summary
    const addOnCheckboxes = document.querySelectorAll('#cart-add-on-services-section input[name="addon"]');
    const premiumClubCheckboxStandard = document.getElementById('premium-club'); // Standard checkbox
    const eliteClubCheckboxStandard = document.getElementById('elite-club');   // Standard checkbox

    // Checkout Button (the one in the summary aside)
    const cartPageCheckoutBtn = document.getElementById('cart-page-checkout-btn');

    // Template for empty cart / membership purchase
    const emptyCartMembershipTemplate = document.getElementById('empty-cart-membership-template');

    // --- 2. FETCH ALL DATA ---
    let allProducts = [], allOffers = {};
    try {
        const [productsRes, offersRes] = await Promise.all([
            fetch('data/products.json'),
            fetch('data/offers.json')
        ]);
        if (!productsRes.ok || !offersRes.ok) throw new Error('Could not load required data files.');
        allProducts = await productsRes.json();
        allOffers = await offersRes.json();
    } catch (error) {
        console.error("Fatal Error:", error);
        if (cartItemsContainer) cartItemsContainer.innerHTML = `<p style="color:red;">Error loading page data. Please try again later.</p>`;
        return;
    }

    // --- 3. STATE VARIABLE ---
    let currentDiscount = { code: null, type: null, value: 0 };
    let isPremiumOwned = false;
    let isEliteOwned = false;

    // --- 4. CORE FUNCTIONS ---

    function checkOwnedMemberships() {
        isPremiumOwned = false;
        isEliteOwned = false;
        const orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || [];
        
        for (const order of orderHistory) {
            // ---- MODIFICATION HERE ----
            // Only consider memberships from non-cancelled orders
            if (order.status && order.status.toLowerCase() === 'cancelled') {
                continue; // Skip this order if it's cancelled
            }
            // ---- END OF MODIFICATION ----

            if (order.selectedAddOns) {
                for (const addon of order.selectedAddOns) {
                    if (addon.name.includes('Premium Club Membership')) isPremiumOwned = true;
                    if (addon.name.includes('Elite Club Membership')) isEliteOwned = true;
                }
            }
        }

        // Update standard add-on checkboxes
        if (premiumClubCheckboxStandard) {
            const isEffectivelyOwnedPremium = isPremiumOwned || isEliteOwned;
            premiumClubCheckboxStandard.disabled = isEffectivelyOwnedPremium;
            const premiumLabelSpan = premiumClubCheckboxStandard.parentElement.querySelector('.service-name');
            if (premiumLabelSpan) {
                let premiumText = 'Premium Club (₹999)';
                if (isEliteOwned) premiumText += ' (Included in Elite)';
                else if (isPremiumOwned) premiumText += ' (Owned)';
                premiumLabelSpan.textContent = premiumText;
            }
        }
        if (eliteClubCheckboxStandard) {
            eliteClubCheckboxStandard.disabled = isEliteOwned;
            const eliteLabelSpan = eliteClubCheckboxStandard.parentElement.querySelector('.service-name');
            if (eliteLabelSpan) {
                 eliteLabelSpan.textContent = `Elite Club (₹2,999)${isEliteOwned ? ' (Owned)' : ''}`;
            }
        }
    }

    function calculateAndUpdateTotals() {
        const cart = getCart();
        const subtotal = cart.reduce((total, item) => total + (item.finalPrice * item.quantity), 0);

        // --- THIS IS THE CRITICAL PART FOR DISCOUNT CALCULATION ---
        let calculatedDiscountAmount = 0; // Use a temporary variable for calculation
        if (currentDiscount.code && currentDiscount.value > 0) { // Check if a discount is active
            if (currentDiscount.type === 'percentage') {
                calculatedDiscountAmount = (subtotal * currentDiscount.value) / 100;
            } else if (currentDiscount.type === 'flat') {
                // Ensure discount isn't more than subtotal, especially after other items might be removed
                calculatedDiscountAmount = Math.min(subtotal, currentDiscount.value); 
            }
        }
        // Store the actual calculated monetary discount amount back into the state
        currentDiscount.amount = calculatedDiscountAmount; 
        // --- END OF CRITICAL PART ---
        
        let addOnsTotal = 0;
        if (cart.length > 0) { // Only calculate add-ons from checkboxes if cart has items
            addOnCheckboxes.forEach(checkbox => {
                if (checkbox.checked && !checkbox.disabled) { // Only add if checked and not disabled (e.g. already owned)
                    addOnsTotal += parseFloat(checkbox.value);
                }
            });
        }

        // Use currentDiscount.amount (the calculated monetary value) here
        const grandTotal = Math.max(0, subtotal - currentDiscount.amount + addOnsTotal); 

        if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
        if (totalEl) totalEl.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;

        // Display logic for discount row, referencing currentDiscount.amount
        if (discountRow && discountEl) {
            if (currentDiscount.amount > 0) {
                discountEl.textContent = `- ₹${currentDiscount.amount.toLocaleString('en-IN')}`;
                discountRow.style.display = 'flex';
            } else {
                discountRow.style.display = 'none';
            }
        } else {
            // This console.warn is helpful if the HTML elements are missing
            // console.warn("Cart Page: Discount row elements ('discount-row' or 'cart-discount') not found in HTML.");
        }


        if (addOnsRow && addOnsTotalEl) {
            addOnsRow.style.display = addOnsTotal > 0 ? 'flex' : 'none';
            addOnsTotalEl.textContent = `+ ₹${addOnsTotal.toLocaleString('en-IN')}`;
        }
    }
    function renderCartPage() {
        checkOwnedMemberships(); // Check ownership status first
        const cart = getCart();

        if (cart.length === 0) {
            // Cart is empty - show membership purchase options
            if (cartMainColumn) cartMainColumn.style.display = 'none';
            if (cartOrderSummaryAside) cartOrderSummaryAside.style.display = 'none';
            
            // Clear any previous empty message and inject new template
            const existingEmptyMsgContainer = cartLayoutContainer.querySelector('.empty-cart-container');
            if (existingEmptyMsgContainer) existingEmptyMsgContainer.remove();

            const templateNode = emptyCartMembershipTemplate.content.cloneNode(true);
            const emptyContainer = templateNode.querySelector('.empty-cart-container');
            
            // Update buttons and notes in the cloned template based on ownership
            const premiumCard = templateNode.getElementById('empty-cart-premium-card');
            const eliteCard = templateNode.getElementById('empty-cart-elite-card');

            if (isEliteOwned) {
                premiumCard.querySelector('.purchase-membership-btn').disabled = true;
                premiumCard.querySelector('.purchase-membership-btn').textContent = "Elite Owned";
                premiumCard.querySelector('.membership-status-note').textContent = "Elite includes all Premium benefits.";
                eliteCard.querySelector('.purchase-membership-btn').disabled = true;
                eliteCard.querySelector('.purchase-membership-btn').textContent = "Owned";
            } else if (isPremiumOwned) {
                premiumCard.querySelector('.purchase-membership-btn').disabled = true;
                premiumCard.querySelector('.purchase-membership-btn').textContent = "Owned";
                eliteCard.querySelector('.purchase-membership-btn').textContent = "Upgrade to Elite"; // Option to upgrade
            }
            
            cartLayoutContainer.appendChild(templateNode); // Append the whole template content
            addMembershipPurchaseListeners(); // Attach listeners to newly added buttons

        } else {
            // Cart has items - show standard cart view
            if (cartMainColumn) cartMainColumn.style.display = 'flex'; // or 'block' depending on your layout
            if (cartOrderSummaryAside) cartOrderSummaryAside.style.display = 'block'; // or 'flex'
            if (cartAddOnServicesSection) cartAddOnServicesSection.style.display = 'block';

            const existingEmptyMsgContainer = cartLayoutContainer.querySelector('.empty-cart-container');
            if (existingEmptyMsgContainer) existingEmptyMsgContainer.remove();

            if (cartItemsContainer) {
                cartItemsContainer.innerHTML = ''; // Clear previous items
                cart.forEach(cartItem => {
                    const product = allProducts.find(p => p.id === cartItem.id);
                    if (!product) return;

                    const customizations = cartItem.customizations;
                    const deepLink = `product-detail.html?id=${product.id}&metal=${customizations.metal}&purity=${customizations.purity}&stone=${encodeURIComponent(customizations.stone)}`;
                    const imageSrc = cartItem.image || product.images[0];

                    const cartItemEl = document.createElement('div');
                    cartItemEl.classList.add('cart-item');
                    cartItemEl.innerHTML = `
                        <div class="cart-item-image"><a href="${deepLink}" class="cart-item-image-link"><img src="${imageSrc}" alt="${product.name}"></a></div>
                        <div class="cart-item-details">
                            <h3><a href="${deepLink}">${product.name}</a></h3>
                            <p class="item-price">₹${cartItem.finalPrice.toLocaleString('en-IN')}</p>
                            <ul class="cart-custom-details">
                                <li>Metal: <span>${customizations.metal}</span></li>
                                <li>Purity: <span>${customizations.purity}</span></li>
                                <li>Stone: <span>${customizations.stone}</span></li>
                            </ul>
                        </div>
                        <div class="cart-item-actions">
                            <div class="quantity-selector">
                                <label for="qty-${cartItem.cartItemId}" class="sr-only">Quantity</label>
                                <input type="number" id="qty-${cartItem.cartItemId}" value="${cartItem.quantity}" min="1" data-cart-item-id="${cartItem.cartItemId}" class="quantity-input">
                            </div>
                            <button class="remove-item-btn" data-cart-item-id="${cartItem.cartItemId}"><i class="fa-regular fa-trash-can"></i> Remove</button>
                        </div>`;
                    cartItemsContainer.appendChild(cartItemEl);
                });
            }
        }
        calculateAndUpdateTotals(); // Always calculate totals
    }
    
    function proceedToCheckoutWithMembership(membershipType, price, name) {
        const user = JSON.parse(localStorage.getItem('bluestoneUser'));
        if (!user) {
            alert('Please login to purchase a membership.');
            window.location.href = 'login.html';
            return;
        }

        // Create a "dummy" order for the membership
        const orderDetails = {
            items: [], // No physical products
            subtotal: 0,
            discountAmount: 0, // No product discounts apply here
            addOnsTotal: parseFloat(price),
            selectedAddOns: [{ name: name, price: parseFloat(price) }],
            grandTotal: parseFloat(price)
        };

        localStorage.setItem('currentOrderDetails', JSON.stringify(orderDetails));
        window.location.href = 'checkout.html';
    }

    function addMembershipPurchaseListeners() {
        const purchaseBtns = document.querySelectorAll('.purchase-membership-btn');
        purchaseBtns.forEach(btn => {
            // Remove old listener before adding new one to prevent duplicates if render is called multiple times
            btn.replaceWith(btn.cloneNode(true)); 
        });
        // Re-select buttons after cloning
        document.querySelectorAll('.purchase-membership-btn').forEach(btn => {
            if (!btn.disabled) { // Only add listener if not disabled
                btn.addEventListener('click', function() {
                    proceedToCheckoutWithMembership(this.dataset.membershipType, this.dataset.price, this.dataset.name);
                });
            }
        });
    }


    function applyCoupon() {
        // ... (keep existing applyCoupon logic)
        const code = couponInput.value.trim().toUpperCase();
        if (!code) {
            couponFeedback.textContent = "Please enter a code.";
            couponFeedback.style.color = 'red';
            return;
        }
        const offer = allOffers[code];
        if (offer) {
            currentDiscount = { code, type: offer.type, value: offer.value };
            couponFeedback.textContent = `Coupon "${code}" applied!`;
            couponFeedback.style.color = 'green';
            couponInput.disabled = true;
            if(applyCouponBtn) applyCouponBtn.style.display = 'none';
            if(removeCouponBtn) removeCouponBtn.style.display = 'inline-block';
        } else {
            currentDiscount = { code: null, type: null, value: 0 };
            couponFeedback.textContent = "Invalid coupon code.";
            couponFeedback.style.color = 'red';
        }
        calculateAndUpdateTotals();
    }

    function removeCoupon() {
        // ... (keep existing removeCoupon logic)
        currentDiscount = { code: null, type: null, value: 0 };
        couponFeedback.textContent = "Coupon removed.";
        couponFeedback.style.color = '#555';
        couponInput.disabled = false;
        couponInput.value = '';
        if(applyCouponBtn) applyCouponBtn.style.display = 'inline-block';
        if(removeCouponBtn) removeCouponBtn.style.display = 'none';
        calculateAndUpdateTotals();
    }

    // --- 5. EVENT LISTENERS ---
    if (applyCouponBtn) applyCouponBtn.addEventListener('click', applyCoupon);
    if (removeCouponBtn) removeCouponBtn.addEventListener('click', removeCoupon);

    if (addOnCheckboxes) {
        addOnCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                if (e.target === premiumClubCheckboxStandard && premiumClubCheckboxStandard.checked && !isEliteOwned) {
                    if(eliteClubCheckboxStandard) eliteClubCheckboxStandard.checked = false;
                } else if (e.target === eliteClubCheckboxStandard && eliteClubCheckboxStandard.checked) {
                    if(premiumClubCheckboxStandard) premiumClubCheckboxStandard.checked = false; 
                }
                calculateAndUpdateTotals();
            });
        });
    }

    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (event) => {
            const removeButton = event.target.closest('.remove-item-btn');
            if (removeButton) {
                removeFromCart(removeButton.dataset.cartItemId); // from cart.js
                renderCartPage(); // Re-render
            }
        });

        cartItemsContainer.addEventListener('change', (event) => {
            const quantityInput = event.target.closest('.quantity-input');
            if (quantityInput) {
                updateCartQuantity(quantityInput.dataset.cartItemId, parseInt(quantityInput.value, 10)); // from cart.js
                renderCartPage(); // Re-render
            }
        });
    }

    if (cartPageCheckoutBtn) {
        cartPageCheckoutBtn.addEventListener('click', () => {
            const user = JSON.parse(localStorage.getItem('bluestoneUser'));
            if (user) {
                const cart = getCart();
                if (cart.length === 0) {
                    alert("Your cart is empty. Add items or purchase a membership.");
                    return;
                }
                // Prepare order details for non-empty cart
                const subtotal = cart.reduce((total, item) => total + (item.finalPrice * item.quantity), 0);
                let discountAmount = 0;
                if (currentDiscount.type === 'percentage') discountAmount = (subtotal * currentDiscount.value) / 100;
                else if (currentDiscount.type === 'flat') discountAmount = Math.min(subtotal, currentDiscount.value);

                let addOnsTotal = 0;
                const selectedAddOns = [];
                addOnCheckboxes.forEach(checkbox => {
                    if (checkbox.checked && !checkbox.disabled) {
                        const price = parseFloat(checkbox.value);
                        addOnsTotal += price;
                        selectedAddOns.push({ name: checkbox.dataset.name, price });
                    }
                });
                const grandTotal = Math.max(0, subtotal - discountAmount + addOnsTotal);

                const orderDetails = {
                    items: cart,
                    subtotal,
                    discountAmount,
                    couponCode: currentDiscount.code, // Save applied coupon
                    addOnsTotal,
                    selectedAddOns,
                    grandTotal
                };
                localStorage.setItem('currentOrderDetails', JSON.stringify(orderDetails));
                window.location.href = 'checkout.html';
            } else {
                alert('Please login to proceed to checkout.');
                window.location.href = 'login.html';
            }
        });
    }

    // --- 6. INITIAL RENDER ---
    renderCartPage();
});