// // File: /js/cart-page.js
// // This file controls ONLY the display and interactions on the cart.html page.

// document.addEventListener('DOMContentLoaded', async function() {
//     // --- 1. GET HTML ELEMENTS ---
//     const cartItemsContainer = document.getElementById('cart-items-container');
//     const subtotalEl = document.getElementById('cart-subtotal');
//     const totalEl = document.getElementById('cart-total');
//     const cartLayout = document.querySelector('.cart-layout');
//     const emptyCartMessageContainer = document.querySelector('.cart-page-main .container');

//     // --- 2. FETCH ALL PRODUCT DATA (once) ---
//     let allProducts = [];
//     try {
//         const response = await fetch('data/products.json');
//         if (!response.ok) throw new Error('Network response was not ok');
//         allProducts = await response.json();
//     } catch (error) {
//         console.error("Fatal Error: Could not load product data.", error);
//         cartItemsContainer.innerHTML = `<p style="color:red;">Error loading essential product data. Cart cannot be displayed.</p>`;
//         return;
//     }
// });
//     // --- 3. RENDER FUNCTION ---
//     // function renderCart() {
//     //     const cart = getCart(); // Get current cart from cart.js

//     //     // --- Handle Empty Cart ---
//     //     if (cart.length === 0) {
//     //         cartLayout.style.display = 'none'; // Hide the main layout
//     //         if (!document.getElementById('empty-cart-msg')) {
//     //             const emptyMsg = document.createElement('div');
//     //             emptyMsg.id = 'empty-cart-msg';
//     //             emptyMsg.style.textAlign = 'center';
//     //             emptyMsg.innerHTML = `
//     //                 <h2>Your Shopping Cart is Empty</h2>
//     //                 <p>Looks like you haven't added anything to your cart yet.</p>
//     //                 <a href="product-listing.html" class="btn" style="background-color: #00437a; color: white;">Continue Shopping</a>
//     //             `;
//     //             emptyCartMessageContainer.appendChild(emptyMsg);
//     //         }
//     //         subtotalEl.textContent = '₹0';
//     //         totalEl.textContent = '₹0';
//     //         return;
//     //     }

//     //     // --- Handle Non-Empty Cart ---
//     //     cartLayout.style.display = 'grid'; // Ensure layout is visible
//     //     const existingEmptyMsg = document.getElementById('empty-cart-msg');
//     //     if (existingEmptyMsg) {
//     //         existingEmptyMsg.remove();
//     //     }

//     //     cartItemsContainer.innerHTML = ''; // Clear previous items
//     //     let currentSubtotal = 0;

//     //     cart.forEach(cartItem => {
//     //         const product = allProducts.find(p => p.id === cartItem.id);
//     //         if (!product) {
//     //             console.warn(`Could not find product with ID: ${cartItem.id} in products.json. Skipping item.`);
//     //             return;
//     //         }

//     //         // Use the price stored IN THE CART ITEM, which includes customization costs.
//     //         const itemTotalPrice = cartItem.finalPrice * cartItem.quantity;
//     //         currentSubtotal += itemTotalPrice;

//     //         // Generate HTML for customization details
//     //         const customDetailsHtml = `
//     //             <ul class="cart-custom-details">
//     //                 <li>Metal: <span>${cartItem.customizations.metal}</span></li>
//     //                 <li>Purity: <span>${cartItem.customizations.purity}</span></li>
//     //                 <li>Stone: <span>${cartItem.customizations.stone}</span></li>
//     //             </ul>`;

//     //         const cartItemEl = document.createElement('div');
//     //         cartItemEl.classList.add('cart-item');
//     //         // Use the unique cartItemId in the data attributes for targeting
//     //         cartItemEl.innerHTML = `
//     //             <div class="cart-item-image">
//     //                 <a href="product-detail.html?id=${product.id}" class="cart-item-image-link">
//     //                     <img src="${product.images[0]}" alt="${product.name}">
//     //                 </a>
//     //             </div>
//     //             <div class="cart-item-details">
//     //                 <h3><a href="product-detail.html?id=${product.id}">${product.name}</a></h3>
//     //                 <p class="item-price">₹${cartItem.finalPrice.toLocaleString('en-IN')}</p>
//     //                 ${customDetailsHtml}
//     //             </div>
//     //             <div class="cart-item-actions">
//     //                 <div class="quantity-selector">
//     //                     <label for="qty-${cartItem.cartItemId}">Qty:</label>
//     //                     <input type="number" id="qty-${cartItem.cartItemId}" value="${cartItem.quantity}" min="1" data-cart-item-id="${cartItem.cartItemId}" class="quantity-input">
//     //                 </div>
//     //                 <button class="remove-item-btn" data-cart-item-id="${cartItem.cartItemId}">
//     //                     <i class="fa-regular fa-trash-can"></i> Remove
//     //                 </button>
//     //             </div>
//     //         `;
//     //         cartItemsContainer.appendChild(cartItemEl);
//     //     });

//     //     // Update totals
//     //     subtotalEl.textContent = `₹${currentSubtotal.toLocaleString('en-IN')}`;
//     //     totalEl.textContent = `₹${currentSubtotal.toLocaleString('en-IN')}`;
//     // }

//     // File: /js/cart-page.js
// document.addEventListener('DOMContentLoaded', async function() {
//     // --- 1. GET HTML ELEMENTS ---
//     const cartItemsContainer = document.getElementById('cart-items-container');
//     const subtotalEl = document.getElementById('cart-subtotal');
//     const totalEl = document.getElementById('cart-total');
//     const cartLayout = document.querySelector('.cart-layout');
//     const emptyCartMessageContainer = document.querySelector('.cart-page-main .container');

//     const discountRow = document.getElementById('discount-row');
//     const discountEl = document.getElementById('cart-discount');
//     const couponInput = document.getElementById('coupon-code');
//     const applyCouponBtn = document.getElementById('apply-coupon-btn');
//     const removeCouponBtn = document.getElementById('remove-coupon-btn');
//     const couponFeedback = document.getElementById('coupon-feedback');


//     // --- NEW: Add-on Elements ---
// const addOnsRow = document.getElementById('addons-row');
// const addOnsTotalEl = document.getElementById('cart-addons-total');
// const addOnCheckboxes = document.querySelectorAll('input[name="addon"]');

//     // --- 2. FETCH ALL DATA (once) ---
//     let allProducts = [];
//     let allOffers = {};
//     try {
//         const [productsRes, offersRes] = await Promise.all([
//             fetch('data/products.json'),
//             fetch('data/offers.json')
//         ]);
//         if (!productsRes.ok || !offersRes.ok) throw new Error('Network response was not ok for required data.');
//         allProducts = await productsRes.json();
//         allOffers = await offersRes.json();
//     } catch (error) {
//         console.error("Fatal Error: Could not load page data.", error);
//         if (cartItemsContainer) cartItemsContainer.innerHTML = `<p style="color:red;">Error loading essential page data.</p>`;
//         return;
//     }

//     // --- 3. STATE ---
//     let currentDiscount = { code: null, type: null, value: 0 };
//     let currentSubtotal = 0;

//     // --- 4. RENDER & CALCULATION FUNCTIONS ---

//     function calculateTotals() {
//         let discountAmount = 0;
//         if (currentDiscount.type === 'percentage') {
//             discountAmount = (currentSubtotal * currentDiscount.value) / 100;
//         } else if (currentDiscount.type === 'flat') {
//             discountAmount = Math.min(currentSubtotal, currentDiscount.value);
//         }

//         const grandTotal = currentSubtotal - discountAmount;

//         subtotalEl.textContent = `₹${currentSubtotal.toLocaleString('en-IN')}`;

//         if (discountAmount > 0) {
//             discountEl.textContent = `- ₹${discountAmount.toLocaleString('en-IN')}`;
//             discountRow.style.display = 'flex';
//         } else {
//             discountRow.style.display = 'none';
//         }

//         totalEl.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;
//     }

//     function renderCart() {
//         const cart = getCart();
//         if (cart.length === 0) {
//             cartLayout.style.display = 'none';
//             const existingEmptyMsg = document.getElementById('empty-cart-msg');
//             if (!existingEmptyMsg) {
//                 const emptyMsg = document.createElement('div');
//                 emptyMsg.id = 'empty-cart-msg';
//                 emptyMsg.style.textAlign = 'center';
//                 emptyMsg.innerHTML = `
//                     <h2>Your Shopping Cart is Empty</h2>
//                     <p>Looks like you haven't added anything to your cart yet.</p>
//                     <a href="product-listing.html" class="btn btn-primary">Continue Shopping</a>
//                 `;
//                 emptyCartMessageContainer.appendChild(emptyMsg);
//             }
//             subtotalEl.textContent = '₹0';
//             totalEl.textContent = '₹0';
//             document.querySelector('.coupon-section').style.display = 'none';
//             discountRow.style.display = 'none';
//             return;
//         }

//         document.querySelector('.coupon-section').style.display = 'block';
//         cartLayout.style.display = 'grid';
//         const existingEmptyMsg = document.getElementById('empty-cart-msg');
//         if (existingEmptyMsg) existingEmptyMsg.remove();

//         cartItemsContainer.innerHTML = '';
//         currentSubtotal = 0;

//         cart.forEach(cartItem => {
//             const product = allProducts.find(p => p.id === cartItem.id);
//             if (!product) return;

//             currentSubtotal += cartItem.finalPrice * cartItem.quantity;

//             const customizations = cartItem.customizations;
//             const deepLink = `product-detail.html?id=${product.id}&metal=${customizations.metal}&purity=${customizations.purity}&stone=${encodeURIComponent(customizations.stone)}`;
//             const imageSrc = cartItem.image || product.images[0];

//             const customDetailsHtml = `
//                 <ul class="cart-custom-details">
//                     <li>Metal: <span>${customizations.metal}</span></li>
//                     <li>Purity: <span>${customizations.purity}</span></li>
//                     <li>Stone: <span>${customizations.stone}</span></li>
//                 </ul>`;

//             const cartItemEl = document.createElement('div');
//             cartItemEl.classList.add('cart-item');
//             cartItemEl.innerHTML = `
//                 <div class="cart-item-image">
//                     <a href="${deepLink}" class="cart-item-image-link">
//                         <img src="${imageSrc}" alt="${product.name}">
//                     </a>
//                 </div>
//                 <div class="cart-item-details">
//                     <h3><a href="${deepLink}">${product.name}</a></h3>
//                     <p class="item-price">₹${cartItem.finalPrice.toLocaleString('en-IN')}</p>
//                     ${customDetailsHtml}
//                 </div>
//                 <div class="cart-item-actions">
//                     <div class="quantity-selector">
//                         <label for="qty-${cartItem.cartItemId}" class="sr-only">Quantity</label>
//                         <input type="number" id="qty-${cartItem.cartItemId}" value="${cartItem.quantity}" min="1" data-cart-item-id="${cartItem.cartItemId}" class="quantity-input">
//                     </div>
//                     <button class="remove-item-btn" data-cart-item-id="${cartItem.cartItemId}">
//                         <i class="fa-regular fa-trash-can"></i> Remove
//                     </button>
//                 </div>
//             `;
//             cartItemsContainer.appendChild(cartItemEl);
//         });

//         calculateTotals();
//     }

//     function applyCoupon() {
//         const code = couponInput.value.trim().toUpperCase();
//         if (!code) { /* ... */ return; }

//         const offer = allOffers[code];
//         if (offer) {
//             currentDiscount = { code, type: offer.type, value: offer.value };
//             couponFeedback.textContent = `Coupon "${code}" applied!`;
//             couponFeedback.style.color = 'green';
//             couponInput.disabled = true;
//             applyCouponBtn.style.display = 'none';
//             removeCouponBtn.style.display = 'inline-block';
//         } else {
//             couponFeedback.textContent = "Invalid coupon code.";
//             couponFeedback.style.color = 'red';
//         }
//         calculateTotals();
//     }

//     function removeCoupon() {
//         currentDiscount = { code: null, type: null, value: 0 };
//         couponFeedback.textContent = "Coupon removed.";
//         couponFeedback.style.color = '#555';
//         couponInput.disabled = false;
//         couponInput.value = '';
//         applyCouponBtn.style.display = 'inline-block';
//         removeCouponBtn.style.display = 'none';
//         calculateTotals();
//     }

//     // --- 5. EVENT LISTENERS ---
//     applyCouponBtn.addEventListener('click', applyCoupon);
//     removeCouponBtn.addEventListener('click', removeCoupon);

//     cartItemsContainer.addEventListener('click', (event) => {
//         // SYNTAX FIX: Find the closest button first
//         const removeButton = event.target.closest('.remove-item-btn');
//         if (removeButton) {
//             removeFromCart(removeButton.dataset.cartItemId);
//             renderCart();
//         }
//     });

//     cartItemsContainer.addEventListener('change', (event) => {
//         // SYNTAX FIX: Find the closest input first
//         const quantityInput = event.target.closest('.quantity-input');
//         if (quantityInput) {
//             updateCartQuantity(quantityInput.dataset.cartItemId, parseInt(quantityInput.value, 10));
//             renderCart();
//         }
//     });

//     const checkoutBtn = document.querySelector('.checkout-btn');
//     if(checkoutBtn) {
//         checkoutBtn.addEventListener('click', () => {
//             const user = JSON.parse(localStorage.getItem('bluestoneUser'));
//             if(user) {
//                 // If user is logged in, proceed to checkout (simulation)
//                 alert('Proceeding to checkout!');
//                 // In a real app, you would redirect:
//                 // window.location.href = 'checkout.html'; 
//             } else {
//                 // If user is not logged in, show an alert and redirect to login
//                 alert('Please login to proceed to checkout.');
//                 window.location.href = 'login.html';
//             }
//         });
//     }

//     // --- 6. INITIAL RENDER ---
//     renderCart();
// });


// File: /js/cart-page.js
document.addEventListener('DOMContentLoaded', async function () {
    // --- 1. GET ALL HTML ELEMENTS ---
    const cartItemsContainer = document.getElementById('cart-items-container');
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');
    const cartLayout = document.querySelector('.cart-layout');
    const emptyCartMessageContainer = document.querySelector('.cart-page-main .container');

    // Coupon elements
    const couponSection = document.querySelector('.coupon-section');
    const discountRow = document.getElementById('discount-row');
    const discountEl = document.getElementById('cart-discount');
    const couponInput = document.getElementById('coupon-code');
    const applyCouponBtn = document.getElementById('apply-coupon-btn');
    const removeCouponBtn = document.getElementById('remove-coupon-btn');
    const couponFeedback = document.getElementById('coupon-feedback');

    // Add-on Elements
    const addOnsSection = document.querySelector('.add-on-services');
    const addOnsRow = document.getElementById('addons-row');
    const addOnsTotalEl = document.getElementById('cart-addons-total');
    const addOnCheckboxes = document.querySelectorAll('input[name="addon"]');
    const premiumClubCheckbox = document.getElementById('premium-club');
    const eliteClubCheckbox = document.getElementById('elite-club');

    // Checkout Button
    const checkoutBtn = document.querySelector('.checkout-btn');

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

    // --- 4. CORE FUNCTIONS ---
    function checkExistingMemberships() {
        const orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || [];
        let hasPremium = false;
        let hasElite = false;

        for (const order of orderHistory) {
            if (order.selectedAddOns) {
                for (const addon of order.selectedAddOns) {
                    if (addon.name.includes('Premium Club')) hasPremium = true;
                    if (addon.name.includes('Elite Club')) hasElite = true;
                }
            }
        }
        
        if (hasElite) {
            premiumClubCheckbox.disabled = true;
            eliteClubCheckbox.disabled = true;
            premiumClubCheckbox.parentElement.querySelector('.service-name').textContent += " (Owned)";
            eliteClubCheckbox.parentElement.querySelector('.service-name').textContent += " (Owned)";
        } else if (hasPremium) {
            premiumClubCheckbox.disabled = true;
            premiumClubCheckbox.parentElement.querySelector('.service-name').textContent += " (Owned)";
        }
    }

    function calculateAndUpdateTotals() {
        const cart = getCart();
        const subtotal = cart.reduce((total, item) => total + (item.finalPrice * item.quantity), 0);

        let discountAmount = 0;
        if (currentDiscount.type === 'percentage') {
            discountAmount = (subtotal * currentDiscount.value) / 100;
        } else if (currentDiscount.type === 'flat') {
            discountAmount = Math.min(subtotal, currentDiscount.value);
        }

        let addOnsTotal = 0;
        addOnCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                addOnsTotal += parseFloat(checkbox.value);
            }
        });

        const grandTotal = subtotal - discountAmount + addOnsTotal;

        subtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
        totalEl.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;

        discountRow.style.display = discountAmount > 0 ? 'flex' : 'none';
        discountEl.textContent = `- ₹${discountAmount.toLocaleString('en-IN')}`;

        addOnsRow.style.display = addOnsTotal > 0 ? 'flex' : 'none';
        addOnsTotalEl.textContent = `+ ₹${addOnsTotal.toLocaleString('en-IN')}`;
    }

    function renderPage() {
        const cart = getCart();

        if (cart.length === 0) {
            cartLayout.style.display = 'none';
            const existingEmptyMsg = document.getElementById('empty-cart-msg');
            if (!existingEmptyMsg) {
                const emptyMsg = document.createElement('div');
                emptyMsg.id = 'empty-cart-msg';
                emptyMsg.style.textAlign = 'center';
                emptyMsg.innerHTML = `<h2>Your Shopping Cart is Empty</h2><p>Start shopping to see your items here.</p><a href="product-listing.html" class="btn btn-primary">Continue Shopping</a>`;
                emptyCartMessageContainer.insertBefore(emptyMsg, cartLayout);
            }
        } else {
            cartLayout.style.display = 'grid';
            const existingEmptyMsg = document.getElementById('empty-cart-msg');
            if (existingEmptyMsg) existingEmptyMsg.remove();

            // *** THE FIX IS HERE: Simple, direct rendering ***
            // 1. Clear the container.
            cartItemsContainer.innerHTML = '';

            // 2. Loop and append each cart item.
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
                // 3. Append directly to the container.
                cartItemsContainer.appendChild(cartItemEl);
            });
        }

        calculateAndUpdateTotals();
    }

    function applyCoupon() {
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
            applyCouponBtn.style.display = 'none';
            removeCouponBtn.style.display = 'inline-block';
        } else {
            currentDiscount = { code: null, type: null, value: 0 };
            couponFeedback.textContent = "Invalid coupon code.";
            couponFeedback.style.color = 'red';
        }
        calculateAndUpdateTotals();
    }

    function removeCoupon() {
        currentDiscount = { code: null, type: null, value: 0 };
        couponFeedback.textContent = "Coupon removed.";
        couponFeedback.style.color = '#555';
        couponInput.disabled = false;
        couponInput.value = '';
        applyCouponBtn.style.display = 'inline-block';
        removeCouponBtn.style.display = 'none';
        calculateAndUpdateTotals();
    }

    // --- 5. EVENT LISTENERS ---
    applyCouponBtn.addEventListener('click', applyCoupon);
    removeCouponBtn.addEventListener('click', removeCoupon);

    addOnCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            if (e.target === premiumClubCheckbox && premiumClubCheckbox.checked) {
                eliteClubCheckbox.checked = false;
            } else if (e.target === eliteClubCheckbox && eliteClubCheckbox.checked) {
                premiumClubCheckbox.checked = false;
            }
            calculateAndUpdateTotals();
        });
    });

    cartItemsContainer.addEventListener('click', (event) => {
        const removeButton = event.target.closest('.remove-item-btn');
        if (removeButton) {
            removeFromCart(removeButton.dataset.cartItemId);
            renderPage();
        }
    });

    cartItemsContainer.addEventListener('change', (event) => {
        const quantityInput = event.target.closest('.quantity-input');
        if (quantityInput) {
            updateCartQuantity(quantityInput.dataset.cartItemId, parseInt(quantityInput.value, 10));
            renderPage();
        }
    });

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const user = JSON.parse(localStorage.getItem('bluestoneUser'));
            if (user) {
                    // --- NEW: Save order details before redirecting ---
                    const cart = getCart();
                    const subtotal = cart.reduce((total, item) => total + (item.finalPrice * item.quantity), 0);

                    let discountAmount = 0;
                    if (currentDiscount.type === 'percentage') discountAmount = (subtotal * currentDiscount.value) / 100;
                    else if (currentDiscount.type === 'flat') discountAmount = Math.min(subtotal, currentDiscount.value);

                    let addOnsTotal = 0;
                    const selectedAddOns = [];
                    addOnCheckboxes.forEach(checkbox => {
                        if (checkbox.checked) {
                            const price = parseFloat(checkbox.value);
                            addOnsTotal += price;
                            selectedAddOns.push({ name: checkbox.dataset.name, price });
                        }
                    });

                    const grandTotal = subtotal - discountAmount + addOnsTotal;

                    const orderDetails = {
                        items: cart,
                        subtotal,
                        discountAmount,
                        addOnsTotal,
                        selectedAddOns,
                        grandTotal
                    };

                    localStorage.setItem('currentOrderDetails', JSON.stringify(orderDetails));
                    // --- End of New Logic ---
                    window.location.href = 'checkout.html';
                } else {
                    // If user is not logged in, show an alert and redirect to login
                    alert('Please login to proceed to checkout.');
                    window.location.href = 'login.html';
                }
            }
        );
    }


    // --- 6. INITIAL RENDER ---
    renderPage();
    checkExistingMemberships();
});