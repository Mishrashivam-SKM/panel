// // File: /js/pdp.js
// document.addEventListener('DOMContentLoaded', function() {
//     // ===================================================================
//     // --- 1. SETUP & CONFIGURATION ---
//     // ===================================================================
//     const urlParams = new URLSearchParams(window.location.search);
//     const productId = urlParams.get('id');
//     if (!productId) {
//         window.location.href = 'index.html';
//         return;
//     }

//     // ===================================================================
//     // --- 2. DOM ELEMENT SELECTORS ---
//     // ===================================================================
//     const mainPdpContainer = document.querySelector('.pdp-main');
//     const productNameEl = document.getElementById('product-name');
//     const productIdEl = document.getElementById('product-id');
//     const productDescEl = document.getElementById('product-description');
//     const mainImageEl = document.getElementById('main-product-image');
//     const thumbnailContainerEl = document.querySelector('.thumbnail-container');
    
//     // Price elements
//     const priceEl = document.getElementById('product-price');
//     const basePriceEl = document.getElementById('base-price');
//     const customizationCostEl = document.getElementById('customization-cost');

//     // Action buttons
//     const addToCartBtn = document.querySelector('.add-to-cart-btn');
//     const wishlistBtn = document.querySelector('.add-to-wishlist-btn');
    
//     // Customization elements
//     const metalSelect = document.getElementById('metal-type');
//     const puritySelect = document.getElementById('metal-purity');
//     const stoneSelect = document.getElementById('stone-type');

//     // ===================================================================
//     // --- 3. STATE VARIABLES ---
//     // ===================================================================
//     let productData = {};
//     let marketPrices = {};

//     // ===================================================================
//     // --- 4. DATA FETCHING & INITIALIZATION ---
//     // ===================================================================
//     async function loadProductDetails() {
//         try {
//             // Fetch both data files concurrently
//             const [productsResponse, pricesResponse] = await Promise.all([
//                 fetch('data/products.json'),
//                 fetch('data/market-prices.json')
//             ]);

//             if (!productsResponse.ok || !pricesResponse.ok) {
//                 throw new Error('Failed to fetch required data files.');
//             }

//             const allProducts = await productsResponse.json();
//             marketPrices = await pricesResponse.json();
            
//             productData = allProducts.find(p => p.id === productId);

//             if (!productData) {
//                 throw new Error(`Product with ID '${productId}' not found in products.json.`);
//             }

//             // Once data is loaded and validated, populate the page
//             populatePage(productData);
            
//             // Log this product as recently viewed (for the homepage)
//             logRecentlyViewed(productData.id);

//         } catch (error) {
//             console.error('Error loading product details:', error);
//             if (mainPdpContainer) {
//                 mainPdpContainer.innerHTML = `<h1>Error Loading Page</h1><p>${error.message}</p><a href="index.html">Go to Homepage</a>`;
//             }
//         }
//     }

//     function populatePage(product) {
//         document.title = `${product.name} - BlueStone Clone`;
//         productNameEl.textContent = product.name;
//         productIdEl.textContent = `SKU: ${product.id}`;
//         productDescEl.textContent = product.description;
//         mainImageEl.src = product.images[0];
        
//         // Create thumbnails
//         thumbnailContainerEl.innerHTML = product.images.map((img, i) => 
//             `<img src="${img}" class="${i === 0 ? 'active' : ''}" alt="Thumbnail ${i + 1}">`
//         ).join('');
        
//         // Set default values for customization dropdowns from product data
//         if(metalSelect) metalSelect.value = product.defaultSpecs.metal;
//         if(puritySelect) puritySelect.value = product.defaultSpecs.purity;
//         if(stoneSelect) stoneSelect.value = product.defaultSpecs.stone;

//         // Perform the first price calculation
//         calculateAndDisplayPrice();
//     }

//     // ===================================================================
//     // --- 5. CORE LOGIC FUNCTIONS ---
//     // ===================================================================

//     function calculateAndDisplayPrice() {
//         if (!productData.price || !Object.keys(marketPrices).length) return;

//         const basePrice = productData.price;
//         const customizations = {
//             metal: metalSelect.value,
//             purity: puritySelect.value,
//             stone: stoneSelect.value
//         };

//         const metalMultiplier = marketPrices.metals[customizations.metal] || 1;
//         const purityMultiplier = marketPrices.purity[customizations.purity] || 1;
//         const stoneMultiplier = marketPrices.stones[customizations.stone] || 1;

//         const finalPrice = Math.round(basePrice * metalMultiplier * purityMultiplier * stoneMultiplier);
//         const customizationCost = finalPrice - basePrice;

//         // Display all prices, formatted for Indian currency
//         priceEl.textContent = `₹${finalPrice.toLocaleString('en-IN')}`;
//         basePriceEl.textContent = `₹${basePrice.toLocaleString('en-IN')}`;
//         customizationCostEl.textContent = `₹${customizationCost.toLocaleString('en-IN')}`;
        
//         updateWishlistButtonState();
//     }

//     function logRecentlyViewed(pId) {
//         let viewedItems = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
//         // Remove the item if it already exists to move it to the front of the list
//         viewedItems = viewedItems.filter(id => id !== pId);
//         // Add the new item to the beginning of the array
//         viewedItems.unshift(pId);
//         // Keep the list to a maximum of 5 items
//         const recentlyViewed = viewedItems.slice(0, 5);
//         localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
//     }

//     function updateWishlistButtonState() {
//         if (!wishlistBtn) return;
        
//         const customizations = { metal: metalSelect.value, purity: puritySelect.value, stone: stoneSelect.value };
//         // Create the unique ID for the currently selected customization
//         const wishlistItemId = `${productId}-${customizations.metal}-${customizations.purity}-${customizations.stone}`;
        
//         // Use the function from cart.js to check if this specific item is in the wishlist
//         if (isItemInWishlist(wishlistItemId)) {
//             wishlistBtn.classList.add('active');
//             wishlistBtn.innerHTML = '<i class="fa-solid fa-heart"></i> In Wishlist';
//         } else {
//             wishlistBtn.classList.remove('active');
//             wishlistBtn.innerHTML = '<i class="fa-regular fa-heart"></i> Add to Wishlist';
//         }
//     }

//     // ===================================================================
//     // --- 6. EVENT LISTENERS ---
//     // ===================================================================

//     // Listen for changes on any customization dropdown
//     [metalSelect, puritySelect, stoneSelect].forEach(el => {
//         if (el) el.addEventListener('change', calculateAndDisplayPrice);
//     });
    
//     // Handle thumbnail clicks to change the main image
//     thumbnailContainerEl.addEventListener('click', e => {
//         if (e.target.tagName === 'IMG') {
//             mainImageEl.src = e.target.src;
//             // Update active state on thumbnails
//             document.querySelectorAll('.thumbnail-container img').forEach(thumb => thumb.classList.remove('active'));
//             e.target.classList.add('active');
//         }
//     });

//     // Handle "Add to Cart" button click
//     addToCartBtn.addEventListener('click', () => {
//         const customizations = { metal: metalSelect.value, purity: puritySelect.value, stone: stoneSelect.value };
//         const finalPrice = parseFloat(priceEl.textContent.replace(/[^0-9.]/g, ''));
//         const itemToAdd = {
//             id: productId,
//             quantity: 1,
//             customizations: customizations,
//             finalPrice: finalPrice
//         };
//         addToCart(itemToAdd); // This function comes from cart.js
//         addToCartBtn.textContent = 'Added!';
//         setTimeout(() => { addToCartBtn.textContent = 'Add to Cart'; }, 2000);
//     });
    
//     // Handle "Add to Wishlist" button click
//     wishlistBtn.addEventListener('click', () => {
//         const customizations = { metal: metalSelect.value, purity: puritySelect.value, stone: stoneSelect.value };
//         const finalPrice = parseFloat(priceEl.textContent.replace(/[^0-9.]/g, ''));
//         const itemToToggle = {
//             id: productId,
//             customizations: customizations,
//             finalPrice: finalPrice
//         };
//         toggleWishlistItem(itemToToggle); // This function comes from cart.js
//         updateWishlistButtonState(); // Immediately update the button's look
//     });

//     // ===================================================================
//     // --- 7. INITIAL PAGE LOAD ---
//     // ===================================================================
//     loadProductDetails();
// });

// WORKIGN 2
// // File: /js/pdp.js
// document.addEventListener('DOMContentLoaded', function() {
//     // ===================================================================
//     // --- 1. SETUP & CONFIGURATION ---
//     // ===================================================================
//     const urlParams = new URLSearchParams(window.location.search);
//     const productId = urlParams.get('id');
//     if (!productId) {
//         window.location.href = 'index.html';
//         return;
//     }

//     // ===================================================================
//     // --- 2. DOM ELEMENT SELECTORS ---
//     // ===================================================================
//     const mainPdpContainer = document.querySelector('.pdp-main');
//     const productNameEl = document.getElementById('product-name');
//     const productIdEl = document.getElementById('product-id');
//     const productDescEl = document.getElementById('product-description');
//     const mainImageEl = document.getElementById('main-product-image');
//     const thumbnailContainerEl = document.querySelector('.thumbnail-container');
    
//     // Price elements
//     const priceEl = document.getElementById('product-price');
//     const basePriceEl = document.getElementById('base-price');
//     const customizationCostEl = document.getElementById('customization-cost');

//     // Action buttons
//     const addToCartBtn = document.querySelector('.add-to-cart-btn');
//     const wishlistBtn = document.querySelector('.add-to-wishlist-btn');
    
//     // Customization & AI Panel Elements
//     const metalSelect = document.getElementById('metal-type');
//     const puritySelect = document.getElementById('metal-purity');
//     const stoneSelect = document.getElementById('stone-type');
//     const customiseBtn = document.getElementById('customise-btn');
//     const aiDesignBtn = document.getElementById('ai-design-btn');
//     const customisePanel = document.getElementById('customise-panel');
//     const aiDesignPanel = document.getElementById('ai-design-panel');
//     const aiPromptInput = document.getElementById('ai-prompt-input');
//     const generateAiBtn = document.querySelector('.generate-ai-btn');

//     // ===================================================================
//     // --- 3. STATE VARIABLES ---
//     // ===================================================================
//     let productData = {};

//     // ===================================================================
//     // --- 4. DATA FETCHING & INITIALIZATION ---
//     // ===================================================================
//     async function loadProductDetails() {
//         try {
//             const response = await fetch('data/products.json');
//             if (!response.ok) throw new Error('Failed to fetch product data.');
            
//             const allProducts = await response.json();
//             productData = allProducts.find(p => p.id === productId);

//             if (!productData) throw new Error(`Product with ID '${productId}' not found.`);

//             populatePage(productData);
//             logRecentlyViewed(productData.id);

//         } catch (error) {
//             console.error('Error loading product details:', error);
//             if (mainPdpContainer) {
//                 mainPdpContainer.innerHTML = `<h1>Error Loading Page</h1><p>${error.message}</p><a href="index.html">Go to Homepage</a>`;
//             }
//         }
//     }

//     // function populatePage(product) {
//     //     document.title = `${product.name} - BlueStone Clone`;
//     //     productNameEl.textContent = product.name;
//     //     productIdEl.textContent = `SKU: ${product.id}`;
//     //     productDescEl.textContent = product.description;
        
//     //     mainImageEl.src = product.images[0];
//     //     thumbnailContainerEl.innerHTML = product.images.map((img, i) => 
//     //         `<img src="${img}" class="${i === 0 ? 'active' : ''}" alt="Thumbnail ${i + 1}">`
//     //     ).join('');
        
//     //     if (metalSelect) metalSelect.value = product.defaultSpecs.metal;
//     //     if (puritySelect) puritySelect.value = product.defaultSpecs.purity; 
//     //     if (stoneSelect) {
//     //         // Find the base stone name e.g., "Diamond" from "Diamond (VVS FG)"
//     //         const baseStone = Object.keys(product.variants).find(v => v.includes(product.defaultSpecs.stone.split(' ')[0]));
//     //         if(baseStone) {
//     //              stoneSelect.value = product.defaultSpecs.stone;
//     //         } else {
//     //              // Fallback for stone dropdowns that might not have the quality part
//     //              stoneSelect.value = product.defaultSpecs.stone.split(' ')[0];
//     //         }
//     //     }

//     //     updateFromVariant();
//     // }
//     // --- START OF MODIFICATION ---
// function populatePage(product) {
//     document.title = `${product.name} - BlueStone Clone`;
//     productNameEl.textContent = product.name;
//     productIdEl.textContent = `SKU: ${product.id}`;
//     productDescEl.textContent = product.description;
//     mainImageEl.src = product.images[0];
    
//     thumbnailContainerEl.innerHTML = product.images.map((img, i) => 
//         `<img src="${img}" class="${i === 0 ? 'active' : ''}" alt="Thumbnail ${i + 1}">`
//     ).join('');
    
//     // *** ADD THIS BLOCK: Read customizations from URL to restore state ***
//     const urlMetal = urlParams.get('metal');
//     const urlStone = urlParams.get('stone');
//     const urlPurity = urlParams.get('purity');
    
//     if(metalSelect) metalSelect.value = urlMetal || product.defaultSpecs.metal;
//     if(stoneSelect) stoneSelect.value = urlStone || product.defaultSpecs.stone;
//     if(puritySelect) puritySelect.value = urlPurity || product.defaultSpecs.purity;
//     // *** END OF ADDED BLOCK ***
    
//     calculateAndDisplayPrice();
// }
// // --- END OF MODIFICATION ---

//     // ===================================================================
//     // --- 5. CORE LOGIC: ADVANCED VARIANT SYSTEM ---
//     // ===================================================================
    
//     // This function now returns the currently selected full variant object
//     function getCurrentVariant() {
//         if (!productData || !productData.variants) return null;

//         const selectedMetal = metalSelect.value;
//         const selectedStone = stoneSelect.value;
//         const variantKey = `${selectedMetal} with ${selectedStone.split(' ')[0]}`; // Use base stone name for key
        
//         return productData.variants[variantKey] ? { ...productData.variants[variantKey], key: variantKey } : null;
//     }

//     function updateFromVariant() {
//         const variant = getCurrentVariant();
//         const productDefaultPrice = productData.price;
//         let finalPrice = productDefaultPrice;

//         if (variant) {
//             mainImageEl.src = variant.image;
//             finalPrice = variant.price;
//         } else {
//             mainImageEl.src = productData.images[0];
//             finalPrice = productData.price;
//         }

//         const customizationCost = finalPrice - productDefaultPrice;
//         priceEl.textContent = `₹${finalPrice.toLocaleString('en-IN')}`;
//         basePriceEl.textContent = `₹${productDefaultPrice.toLocaleString('en-IN')}`;
//         customizationCostEl.textContent = `₹${customizationCost.toLocaleString('en-IN')}`;
        
//         updateWishlistButtonState();
//     }
    
//     function updateWishlistButtonState() {
//         if (!wishlistBtn) return;
        
//         const currentCustoms = {
//             metal: metalSelect.value,
//             purity: puritySelect.value,
//             stone: stoneSelect.value
//         };

//         const wishlistItemId = `${productId}-${currentCustoms.metal}-${currentCustoms.purity}-${currentCustoms.stone}`;
        
//         if (isItemInWishlist(wishlistItemId)) {
//             wishlistBtn.classList.add('active');
//             wishlistBtn.innerHTML = '<i class="fa-solid fa-heart"></i> In Wishlist';
//         } else {
//             wishlistBtn.classList.remove('active');
//             wishlistBtn.innerHTML = '<i class="fa-regular fa-heart"></i> Add to Wishlist';
//         }
//     }

//     function logRecentlyViewed(pId) {
//         let viewedItems = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
//         viewedItems = viewedItems.filter(id => id !== pId);
//         viewedItems.unshift(pId);
//         localStorage.setItem('recentlyViewed', JSON.stringify(viewedItems.slice(0, 5)));
//     }

//     // ===================================================================
//     // --- 6. EVENT LISTENERS ---
//     // ===================================================================

//     [metalSelect, puritySelect, stoneSelect].forEach(el => {
//         if (el) el.addEventListener('change', updateFromVariant);
//     });
    
//     thumbnailContainerEl.addEventListener('click', e => {
//         if (e.target.tagName === 'IMG') {
//             mainImageEl.src = e.target.src;
//             document.querySelectorAll('.thumbnail-container img').forEach(thumb => thumb.classList.remove('active'));
//             e.target.classList.add('active');
//         }
//     });

//     // --- CORRECTED Add to Cart / Wishlist actions ---
//     // addToCartBtn.addEventListener('click', () => {
//     //     const finalPrice = parseFloat(priceEl.textContent.replace(/[^0-9.]/g, ''));
//     //     const currentCustoms = {
//     //         metal: metalSelect.value,
//     //         purity: puritySelect.value,
//     //         stone: stoneSelect.value
//     //     };

//     //     const itemToAdd = {
//     //         id: productId,
//     //         quantity: 1,
//     //         customizations: currentCustoms,
//     //         finalPrice: finalPrice
//     //     };
        
//     //     addToCart(itemToAdd); // This function from cart.js now receives the correct data
//     //     addToCartBtn.textContent = 'Added!';
//     //     setTimeout(() => { addToCartBtn.textContent = 'Add to Cart'; }, 2000);
//     // });
    
//     // --- START OF MODIFICATION ---
// // Handle "Add to Cart" button click
// addToCartBtn.addEventListener('click', () => {
//     const customizations = { metal: metalSelect.value, purity: puritySelect.value, stone: stoneSelect.value };
//     const finalPrice = parseFloat(priceEl.textContent.replace(/[^0-9.]/g, ''));
//     const itemToAdd = {
//         id: productId,
//         quantity: 1,
//         customizations: customizations,
//         finalPrice: finalPrice,
//         image: mainImageEl.src // *** ADD THIS LINE: Saves the currently displayed image URL ***
//     };
//     addToCart(itemToAdd);
//     addToCartBtn.textContent = 'Added!';
//     setTimeout(() => { addToCartBtn.textContent = 'Add to Cart'; }, 2000);
// });
// // --- END OF MODIFICATION ---

//     // wishlistBtn.addEventListener('click', () => {
//     //     const finalPrice = parseFloat(priceEl.textContent.replace(/[^0-9.]/g, ''));
//     //     const currentCustoms = {
//     //         metal: metalSelect.value,
//     //         purity: puritySelect.value,
//     //         stone: stoneSelect.value
//     //     };
        
//     //     const itemToToggle = {
//     //         id: productId,
//     //         customizations: currentCustoms,
//     //         finalPrice: finalPrice
//     //     };
        
//     //     toggleWishlistItem(itemToToggle); // This function from cart.js now receives the correct data
//     //     updateWishlistButtonState(); // Immediately update the button's look
//     // });

// // --- START OF MODIFICATION ---
// // Handle "Add to Wishlist" button click
// wishlistBtn.addEventListener('click', () => {
//     const customizations = { metal: metalSelect.value, purity: puritySelect.value, stone: stoneSelect.value };
//     const finalPrice = parseFloat(priceEl.textContent.replace(/[^0-9.]/g, ''));
//     const itemToToggle = {
//         id: productId,
//         customizations: customizations,
//         finalPrice: finalPrice,
//         image: mainImageEl.src // *** ADD THIS LINE: Saves the currently displayed image URL ***
//     };
//     toggleWishlistItem(itemToToggle);
//     updateWishlistButtonState();
// });
// // --- END OF MODIFICATION ---

//     // --- AI Panel Toggle Listeners (Re-added) ---
//     if (customiseBtn && aiDesignBtn) {
//         customiseBtn.addEventListener('click', () => {
//             customiseBtn.classList.add('active');
//             aiDesignBtn.classList.remove('active');
//             customisePanel.style.display = 'block';
//             aiDesignPanel.style.display = 'none';
//         });
    
//         aiDesignBtn.addEventListener('click', () => {
//             aiDesignBtn.classList.add('active');
//             customiseBtn.classList.remove('active');
//             aiDesignPanel.style.display = 'block';
//             customisePanel.style.display = 'none';
//         });
//     }

//     // ===================================================================
//     // --- 7. INITIAL PAGE LOAD ---
//     // ===================================================================
//     loadProductDetails();
// });

// DETAILS
// // File: /js/pdp.js
// document.addEventListener('DOMContentLoaded', function() {
//     // ===================================================================
//     // --- 1. SETUP & CONFIGURATION ---
//     // ===================================================================
//     const API_KEY = "YOUR_GEMINI_API_KEY"; // Make sure to replace this
//     const PROJECT_ID = "YOUR_GOOGLE_CLOUD_PROJECT_ID"; // And this
//     const ACCESS_TOKEN = "PASTE_YOUR_ACCESS_TOKEN_HERE"; // And this
//     const LOCATION = "us-central1";

//     const urlParams = new URLSearchParams(window.location.search);
//     const productId = urlParams.get('id');
//     if (!productId) {
//         window.location.href = 'index.html';
//         return;
//     }

//     // ===================================================================
//     // --- 2. DOM ELEMENT SELECTORS ---
//     // ===================================================================
//     const mainPdpContainer = document.querySelector('.pdp-main');
//     const productNameEl = document.getElementById('product-name');
//     const productIdEl = document.getElementById('product-id');
//     const productDescEl = document.getElementById('product-description');
//     const mainImageEl = document.getElementById('main-product-image');
//     const thumbnailContainerEl = document.querySelector('.thumbnail-container');
//     const priceEl = document.getElementById('product-price');
//     const basePriceEl = document.getElementById('base-price');
//     const customizationCostEl = document.getElementById('customization-cost');
//     const addToCartBtn = document.querySelector('.add-to-cart-btn');
//     const wishlistBtn = document.querySelector('.add-to-wishlist-btn');
//     const metalSelect = document.getElementById('metal-type');
//     const puritySelect = document.getElementById('metal-purity');
//     const stoneSelect = document.getElementById('stone-type');
//     const customiseBtn = document.getElementById('customise-btn');
//     const aiDesignBtn = document.getElementById('ai-design-btn');
//     const customisePanel = document.getElementById('customise-panel');
//     const aiDesignPanel = document.getElementById('ai-design-panel');
//     const aiPromptInput = document.getElementById('ai-prompt-input');
//     const generateAiBtn = document.querySelector('.generate-ai-btn');

//     let productData = {};

//     // ===================================================================
//     // --- 4. CORE LOGIC FUNCTIONS ---
//     // ===================================================================

//     function updateFromVariant() {
//         if (!productData) return;

//         const selectedMetal = metalSelect.value;
//         const selectedStone = stoneSelect.value.split(' ')[0]; // Get base stone name e.g., "Diamond"
//         const variantKey = `${selectedMetal} with ${selectedStone}`;
        
//         const variant = productData.variants ? productData.variants[variantKey] : null;

//         let finalPrice = productData.price;
//         if (variant) {
//             mainImageEl.src = variant.image;
//             finalPrice = variant.price;
//         } else {
//             mainImageEl.src = productData.images[0];
//         }

//         const customizationCost = finalPrice - productData.price;
//         priceEl.textContent = `₹${finalPrice.toLocaleString('en-IN')}`;
//         basePriceEl.textContent = `₹${productData.price.toLocaleString('en-IN')}`;
//         customizationCostEl.textContent = `₹${customizationCost.toLocaleString('en-IN')}`;
//         updateWishlistButtonState();
//     }
    
//     function logRecentlyViewed(pId) {
//         let viewedItems = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
//         viewedItems = viewedItems.filter(id => id !== pId);
//         viewedItems.unshift(pId);
//         localStorage.setItem('recentlyViewed', JSON.stringify(viewedItems.slice(0, 5)));
//     }

//     function updateWishlistButtonState() {
//         if (!wishlistBtn) return;
//         const currentCustoms = { metal: metalSelect.value, purity: puritySelect.value, stone: stoneSelect.value };
//         const wishlistItemId = `${productId}-${currentCustoms.metal}-${currentCustoms.purity}-${currentCustoms.stone}`;
//         if (isItemInWishlist(wishlistItemId)) {
//             wishlistBtn.classList.add('active');
//             wishlistBtn.innerHTML = '<i class="fa-solid fa-heart"></i> In Wishlist';
//         } else {
//             wishlistBtn.classList.remove('active');
//             wishlistBtn.innerHTML = '<i class="fa-regular fa-heart"></i> Add to Wishlist';
//         }
//     }

//     async function generateRealAiDesign() {
//         const prompt = aiPromptInput.value;
//         if (!prompt) return;

//         const resultContainer = document.getElementById('ai-result-container');
//         resultContainer.innerHTML = `<div class="loading-indicator">Generating your design... This can take up to 30 seconds.</div>`;
//         generateAiBtn.disabled = true;

//         const endpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/imagegeneration@005:predict`;
//         const body = { instances: [{ prompt: `professional jewelry photography of ${prompt}, clean white background` }], parameters: { sampleCount: 1 } };

//         try {
//             const response = await fetch(endpoint, {
//                 method: 'POST',
//                 headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
//                 body: JSON.stringify(body)
//             });
//             if (!response.ok) {
//                 const error = await response.json();
//                 throw new Error(error.error.message || 'An unknown API error occurred.');
//             }
//             const data = await response.json();
//             const imageBase64 = data.predictions[0].bytesBase64Encoded;
//             const imageUrl = `data:image/png;base64,${imageBase64}`;
//             resultContainer.innerHTML = `
//                 <h4>Generated Design</h4>
//                 <img src="${imageUrl}" class="ai-result-image" alt="AI Generated: ${prompt}">
//                 <button class="btn btn-secondary send-for-approval-btn">Send for Approval</button>
//             `;
//         } catch (e) {
//             resultContainer.innerHTML = `<p class="feedback-error">Error: ${e.message}</p>`;
//         } finally {
//             generateAiBtn.disabled = false;
//         }
//     }

//     // ===================================================================
//     // --- 5. INITIALIZATION & DATA FETCHING ---
//     // ===================================================================

//     async function initializePage() {
//         try {
//             const response = await fetch('data/products.json');
//             if (!response.ok) throw new Error('Failed to fetch product data.');
            
//             const allProducts = await response.json();
//             productData = allProducts.find(p => p.id === productId);

//             if (!productData) throw new Error(`Product with ID '${productId}' not found.`);

//             document.title = `${productData.name} - BlueStone Clone`;
//             productNameEl.textContent = productData.name;
//             productIdEl.textContent = `SKU: ${productData.id}`;
//             productDescEl.textContent = productData.description;
            
//             thumbnailContainerEl.innerHTML = productData.images.map((img, i) => 
//                 `<img src="${img}" class="${i === 0 ? 'active' : ''}" alt="Thumbnail ${i + 1}">`
//             ).join('');
            
//             const urlMetal = urlParams.get('metal');
//             const urlStone = urlParams.get('stone');
//             const urlPurity = urlParams.get('purity');
            
//             if(metalSelect) metalSelect.value = urlMetal || productData.defaultSpecs.metal;
//             if(stoneSelect) stoneSelect.value = urlStone || productData.defaultSpecs.stone;
//             if(puritySelect) puritySelect.value = urlPurity || productData.defaultSpecs.purity;

//             updateFromVariant();
//             logRecentlyViewed(productData.id);

//         } catch (error) {
//             console.error('Error loading page:', error);
//             if (mainPdpContainer) {
//                 mainPdpContainer.innerHTML = `<h1>Error Loading Page</h1><p>${error.message}</p><a href="index.html">Go to Homepage</a>`;
//             }
//         }
//     }

//     // ===================================================================
//     // --- 6. EVENT LISTENERS ---
//     // ===================================================================

//     [metalSelect, puritySelect, stoneSelect].forEach(el => { if (el) el.addEventListener('change', updateFromVariant); });
    
//     thumbnailContainerEl.addEventListener('click', e => {
//         if (e.target.tagName === 'IMG') {
//             mainImageEl.src = e.target.src;
//             document.querySelectorAll('.thumbnail-container img').forEach(thumb => thumb.classList.remove('active'));
//             e.target.classList.add('active');
//         }
//     });

//     addToCartBtn.addEventListener('click', () => {
//         const itemToAdd = {
//             id: productId,
//             quantity: 1,
//             customizations: { metal: metalSelect.value, purity: puritySelect.value, stone: stoneSelect.value },
//             finalPrice: parseFloat(priceEl.textContent.replace(/[^0-9.]/g, '')),
//             image: mainImageEl.src
//         };
//         addToCart(itemToAdd);
//         addToCartBtn.textContent = 'Added!';
//         setTimeout(() => { addToCartBtn.textContent = 'Add to Cart'; }, 2000);
//     });
    
//     wishlistBtn.addEventListener('click', () => {
//         const itemToToggle = {
//             id: productId,
//             customizations: { metal: metalSelect.value, purity: puritySelect.value, stone: stoneSelect.value },
//             finalPrice: parseFloat(priceEl.textContent.replace(/[^0-9.]/g, '')),
//             image: mainImageEl.src
//         };
//         toggleWishlistItem(itemToToggle);
//         updateWishlistButtonState();
//     });

//     if (customiseBtn && aiDesignBtn) {
//         customiseBtn.addEventListener('click', () => {
//             customiseBtn.classList.add('active'); aiDesignBtn.classList.remove('active');
//             customisePanel.style.display = 'block'; aiDesignPanel.style.display = 'none';
//         });
//         aiDesignBtn.addEventListener('click', () => {
//             aiDesignBtn.classList.add('active'); customiseBtn.classList.remove('active');
//             aiDesignPanel.style.display = 'block'; customisePanel.style.display = 'none';
//         });
//     }

//     if (generateAiBtn) {
//         generateAiBtn.addEventListener('click', generateRealAiDesign);
//     }
    
//     aiDesignPanel.addEventListener('click', (e) => {
//         if (e.target.classList.contains('send-for-approval-btn')) {
//             const prompt = aiPromptInput.value;
//             const imageUrl = document.querySelector('.ai-result-image').src;
//             const submission = { id: `ai-${Date.now()}`, prompt: prompt, imageUrl: imageUrl, status: "Pending" };
//             const submissions = JSON.parse(localStorage.getItem('ai_submissions')) || [];
//             submissions.push(submission);
//             localStorage.setItem('ai_submissions', JSON.stringify(submissions));
//             document.getElementById('ai-result-container').innerHTML = `<p class="feedback-success">Submitted for approval!</p>`;
//         }
//     });

//     // --- INITIALIZE THE PAGE ---
//     initializePage();
// });


document.addEventListener('DOMContentLoaded', function() {
    // ===================================================================
    // --- 1. DOM ELEMENT SELECTORS (Define all upfront) ---
    // ===================================================================
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    const mainPdpContainer = document.querySelector('.pdp-main');
    const productNameEl = document.getElementById('product-name');
    const productIdEl = document.getElementById('product-id');
    const productDescEl = document.getElementById('product-description');
    const mainImageEl = document.getElementById('main-product-image');
    const thumbnailContainerEl = document.querySelector('.thumbnail-container');
    const priceEl = document.getElementById('product-price');
    const basePriceEl = document.getElementById('base-price');
    const customizationCostEl = document.getElementById('customization-cost');
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    const wishlistBtn = document.querySelector('.add-to-wishlist-btn');
    const metalSelect = document.getElementById('metal-type');
    const puritySelect = document.getElementById('metal-purity');
    const stoneSelect = document.getElementById('stone-type');

    let productData = {}; // State variable for the current product

    // ===================================================================
    // --- 2. CORE LOGIC & HELPER FUNCTIONS (Define all before use) ---
    // ===================================================================

    function updateWishlistButtonState() {
        if (!wishlistBtn) return;
        const currentCustoms = { metal: metalSelect.value, purity: puritySelect.value, stone: stoneSelect.value };
        const wishlistItemId = `${productId}-${currentCustoms.metal}-${currentCustoms.purity}-${currentCustoms.stone}`;
        if (isItemInWishlist(wishlistItemId)) {
            wishlistBtn.classList.add('active');
            wishlistBtn.innerHTML = '<i class="fa-solid fa-heart"></i> In Wishlist';
        } else {
            wishlistBtn.classList.remove('active');
            wishlistBtn.innerHTML = '<i class="fa-regular fa-heart"></i> Add to Wishlist';
        }
    }

    function renderSpecifications(product, currentMetal, currentPurity, currentStone) {
        const specsContainer = document.getElementById('pdp-details-accordion-container');
        if (!specsContainer || !product.specifications) {
            if (specsContainer) specsContainer.innerHTML = '';
            return;
        }

        const specs = product.specifications;
        let html = '';

        if (specs.productDetails) {
            html += `
                <div class="accordion-section">
                    <h4 class="accordion-title">PRODUCT DETAILS</h4>
                    <div class="accordion-content">
                        ${specs.productDetails.note ? `<p class="details-note">${specs.productDetails.note}</p>` : ''}
                        <div class="detail-row"><span>Product Code</span><span>${specs.productDetails.productCode}</span></div>
                        <div class="detail-row"><span>Height <i class="fa-solid fa-circle-info"></i></span><span>${specs.productDetails.height}</span></div>
                        <div class="detail-row"><span>Width <i class="fa-solid fa-circle-info"></i></span><span>${specs.productDetails.width}</span></div>
                        <div class="detail-row"><span>Product Weight <i class="fa-solid fa-circle-info"></i></span><span>${specs.productDetails.productWeight}</span></div>
                    </div>
                </div>
            `;
        }
        if (specs.diamondDetails) {
            html += `
                <div class="accordion-section">
                    <h4 class="accordion-title">DIAMOND DETAILS</h4>
                    <div class="accordion-content">
                        <div class="detail-row"><span>Stone Type</span><span>${currentStone}</span></div>
                        <div class="detail-row"><span>Total Weight <i class="fa-solid fa-circle-info"></i></span><span>${specs.diamondDetails.totalWeight}</span></div>
                        <div class="detail-row"><span>Total No. Of Diamonds</span><span>${specs.diamondDetails.totalNoOfDiamonds}</span></div>
                    </div>
                </div>
            `;
        }
        if (specs.metalDetails) {
             html += `
                <div class="accordion-section">
                    <h4 class="accordion-title">METAL DETAILS</h4>
                    <div class="accordion-content">
                        <div class="detail-row"><span>Type</span><span>${currentPurity} ${currentMetal}</span></div>
                        <div class="detail-row"><span>Weight <i class="fa-solid fa-circle-info"></i></span><span>${specs.metalDetails.weight}</span></div>
                    </div>
                </div>
            `;
        }
        if (specs.tags && specs.tags.length > 0) {
             html += `
                <div class="accordion-section">
                    <h4 class="accordion-title">TAGS</h4>
                    <div class="accordion-content tags-content">
                        ${specs.tags.map(tag => `<a href="product-listing.html?search=${encodeURIComponent(tag)}">${tag}</a>`).join('')}
                    </div>
                </div>
            `;
        }
        specsContainer.innerHTML = html;
    }

    function updateFromVariant() {
        if (!productData) return;
        const selectedMetal = metalSelect.value;
        const selectedPurity = puritySelect.value;
        const selectedStone = stoneSelect.value;
        const variantKey = `${selectedMetal} with ${selectedStone.split(' ')[0]}`;
        const variant = productData.variants ? productData.variants[variantKey] : null;

        let finalPrice = productData.price;
        if (variant) {
            mainImageEl.src = variant.image;
            finalPrice = variant.price;
        } else {
            mainImageEl.src = productData.images[0];
        }

        const customizationCost = finalPrice - productData.price;
        priceEl.textContent = `₹${finalPrice.toLocaleString('en-IN')}`;
        basePriceEl.textContent = `₹${productData.price.toLocaleString('en-IN')}`;
        customizationCostEl.textContent = `₹${customizationCost.toLocaleString('en-IN')}`;
        
        renderSpecifications(productData, selectedMetal, selectedPurity, selectedStone);
        updateWishlistButtonState();
    }

    function logRecentlyViewed(pId) {
        let viewedItems = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
        viewedItems = viewedItems.filter(id => id !== pId);
        viewedItems.unshift(pId);
        localStorage.setItem('recentlyViewed', JSON.stringify(viewedItems.slice(0, 5)));
    }

    // ===================================================================
    // --- 3. INITIALIZATION & DATA FETCHING (The starting point) ---
    // ===================================================================
    async function initializePage() {
        if (!productId) {
            mainPdpContainer.innerHTML = `<h1>Product Not Found</h1><p>Please select a product from our listing page.</p><a href="index.html">Go to Homepage</a>`;
            return;
        }

        try {
            const response = await fetch('data/products.json');
            if (!response.ok) throw new Error('Could not load product data.');
            const allProducts = await response.json();
            productData = allProducts.find(p => p.id === productId);

            if (!productData) throw new Error(`Product with ID '${productId}' could not be found.`);

            // --- Populate Static Content ---
            document.title = `${productData.name} - BlueStone Clone`;
            productNameEl.textContent = productData.name;
            productIdEl.textContent = `SKU: ${productData.id}`;
            productDescEl.textContent = productData.description;
            thumbnailContainerEl.innerHTML = productData.images.map((img, i) => 
                `<img src="${img}" class="${i === 0 ? 'active' : ''}" alt="Thumbnail ${i + 1}">`
            ).join('');
            
            // --- Set Dropdown Values (from URL or defaults) ---
            const urlMetal = urlParams.get('metal');
            const urlStone = urlParams.get('stone');
            const urlPurity = urlParams.get('purity');
            if(metalSelect) metalSelect.value = urlMetal || productData.defaultSpecs.metal;
            if(stoneSelect) stoneSelect.value = urlStone || productData.defaultSpecs.stone;
            if(puritySelect) puritySelect.value = urlPurity || productData.defaultSpecs.purity;

            // --- Initial Render & Logging ---
            updateFromVariant();
            logRecentlyViewed(productData.id);

        } catch (error) {
            console.error('Error during page initialization:', error);
            if (mainPdpContainer) mainPdpContainer.innerHTML = `<h1>Error Loading Page</h1><p>${error.message}</p><a href="index.html">Go to Homepage</a>`;
        }
    }

    // ===================================================================
    // --- 4. EVENT LISTENERS ---
    // ===================================================================
    [metalSelect, puritySelect, stoneSelect].forEach(el => { if (el) el.addEventListener('change', updateFromVariant); });
    
    thumbnailContainerEl.addEventListener('click', e => {
        if (e.target.tagName === 'IMG') {
            mainImageEl.src = e.target.src;
            document.querySelectorAll('.thumbnail-container img').forEach(thumb => thumb.classList.remove('active'));
            e.target.classList.add('active');
        }
    });

    addToCartBtn.addEventListener('click', () => {
        const itemToAdd = {
            id: productId,
            quantity: 1,
            customizations: { metal: metalSelect.value, purity: puritySelect.value, stone: stoneSelect.value },
            finalPrice: parseFloat(priceEl.textContent.replace(/[^0-9.]/g, '')),
            image: mainImageEl.src
        };
        addToCart(itemToAdd);
        addToCartBtn.textContent = 'Added!';
        setTimeout(() => { addToCartBtn.textContent = 'Add to Cart'; }, 2000);
    });
    
    wishlistBtn.addEventListener('click', () => {
        const itemToToggle = {
            id: productId,
            customizations: { metal: metalSelect.value, purity: puritySelect.value, stone: stoneSelect.value },
            finalPrice: parseFloat(priceEl.textContent.replace(/[^0-9.]/g, '')),
            image: mainImageEl.src
        };
        toggleWishlistItem(itemToToggle);
        updateWishlistButtonState();
    });

    // --- KICK OFF THE PAGE LOAD ---
    initializePage();
});