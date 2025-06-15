document.addEventListener('DOMContentLoaded', function() {
    // ===================================================================
    // --- 1. API & PAGE CONFIGURATION ---
    // ===================================================================
    
    // !!! IMPORTANT: REPLACE WITH YOUR ACTUAL CREDENTIALS AND DETAILS !!!
    // These should ideally be managed securely, not hardcoded for production.
    // For this exercise, we're using placeholders based on your requirements.txt
    // The ACCESS_TOKEN is likely an OAuth token and WILL EXPIRE.
    
    // Placeholder for values from requirements.txt
    // const GEMINI_API_KEY = "AIzaSyC-2E5sNzXNJZ3Ex2SfrWTpJqnd5zjTWws"; // Or other relevant API key
    const PROJECT_ID = "bluestone-99"; // From requirements.txt (using the first one)
    const ACCESS_TOKEN = "ya29.a0AW4XtxiXgxspDDPl-4Bg62c3S--cgDtF3Bb1Q9-bjpG-ivqlUUXzlte26I8otecMQfuinIK5OOBiz8ShdzO-I11QANE4yXOCQyfcoj_HM1C-uKtXiFDjIcJLqP_liLTGVw4H2rcOZJfcMJpiQxz0pt0GYM8w_E33GiQqZWAoo0wDKwaCgYKAW8SARASFQHGX2MidpJaa6H-NWpP_BGoQaTuoQ0181"; // THIS NEEDS TO BE A VALID, RECENTLY GENERATED ACCESS TOKEN
    const LOCATION = "us-central1"; // Common location, adjust if different

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    // ===================================================================
    // --- 2. DOM ELEMENT SELECTORS ---
    // ===================================================================


    // NEW: 10+1 Plan Elements
    const viewGmpBtn = document.getElementById('view-gmp-for-product-btn');
    const gmpMonthlyEstimateEl = document.getElementById('gmp-monthly-estimate');
    const gmpTeaserSection = document.getElementById('pdp-gold-plan-teaser-section');

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

    // AI Panel Elements
    const customiseBtn = document.getElementById('customise-btn');
    const aiDesignBtn = document.getElementById('ai-design-btn');
    const customisePanel = document.getElementById('customise-panel');
    const aiDesignPanel = document.getElementById('ai-design-panel');
    const aiPromptInput = document.getElementById('ai-prompt-input');
    const generateAiBtn = document.querySelector('.generate-ai-btn');
    const aiResultContainer = document.getElementById('ai-result-container');
    
    let productData = {}; // State variable for the current product
    let marketPrices = {}; // To store market prices for calculation
    let aiImagesData = []; // To store AI simulation images


    
    // ===================================================================
    // --- 3. DATA FETCHING & INITIALIZATION ---
    // ===================================================================
    async function initializePage() {
        if (!productId) {
            if(mainPdpContainer) mainPdpContainer.innerHTML = `<h1>Product Not Found</h1><p>Please select a product from our listing page.</p><a href="index.html">Go to Homepage</a>`;
            return;
        }

        try {
            const [productsResponse, marketPricesResponse, aiImagesResponse] = await Promise.all([
                fetch('data/products.json'),
                fetch('data/market-prices.json'),
                fetch('data/ai-images.json') // Fetch AI simulation images
            ]);

            if (!productsResponse.ok) throw new Error('Could not load product data.');
            if (!marketPricesResponse.ok) throw new Error('Could not load market prices.');
            if (!aiImagesResponse.ok) throw new Error('Could not load AI images data.');

            const allProducts = await productsResponse.json();
            marketPrices = await marketPricesResponse.json();
            aiImagesData = await aiImagesResponse.json(); // Store AI simulation images

            productData = allProducts.find(p => p.id === productId);

            if (!productData) throw new Error(`Product with ID '${productId}' could not be found.`);

            populateStaticContent();
            setDropdownValues();
            updateDynamicContent(); // This will call updateFromVariant which calls renderSpecs
            logRecentlyViewed(productData.id);

        } catch (error) {
            console.error('Error during page initialization:', error);
            if (mainPdpContainer) mainPdpContainer.innerHTML = `<h1>Error Loading Page</h1><p>${error.message}</p><a href="index.html">Go to Homepage</a>`;
        }
    }

    function populateStaticContent() {
        document.title = `${productData.name} - BlueStone Clone`;
        if (productNameEl) productNameEl.textContent = productData.name;
        if (productIdEl) productIdEl.textContent = `SKU: ${productData.id}`;
        if (productDescEl) productDescEl.textContent = productData.description;
        
        if (thumbnailContainerEl) {
            thumbnailContainerEl.innerHTML = productData.images.map((img, i) => 
                `<img src="${img}" class="${i === 0 ? 'active' : ''}" alt="Thumbnail ${i + 1}">`
            ).join('');
        }
        if (mainImageEl && productData.images.length > 0) {
            mainImageEl.src = productData.images[0];
        }
    }

    function setDropdownValues() {
        const urlMetal = urlParams.get('metal');
        const urlStone = urlParams.get('stone');
        const urlPurity = urlParams.get('purity');
        
        if (metalSelect) metalSelect.value = urlMetal || productData.defaultSpecs.metal;
        if (stoneSelect) stoneSelect.value = urlStone || productData.defaultSpecs.stone;
        if (puritySelect) puritySelect.value = urlPurity || productData.defaultSpecs.purity;
    }

    // ===================================================================
    // --- 4. CORE LOGIC & HELPER FUNCTIONS ---
    // ===================================================================

    function updateWishlistButtonState() {
        if (!wishlistBtn || !metalSelect || !puritySelect || !stoneSelect) return;
        const currentCustoms = { metal: metalSelect.value, purity: puritySelect.value, stone: stoneSelect.value };
        const wishlistItemId = `${productId}-${currentCustoms.metal}-${currentCustoms.purity}-${currentCustoms.stone}`;
        
        if (isItemInWishlist(wishlistItemId)) { // isItemInWishlist is from cart.js
            wishlistBtn.classList.add('active');
            wishlistBtn.innerHTML = '<i class="fa-solid fa-heart"></i> In Wishlist';
        } else {
            wishlistBtn.classList.remove('active');
            wishlistBtn.innerHTML = '<i class="fa-regular fa-heart"></i> Add to Wishlist';
        }
    }

    function renderSpecifications(currentMetal, currentPurity, currentStone) {
        const specsContainer = document.getElementById('pdp-details-accordion-container');
        if (!specsContainer || !productData.specifications) {
            if (specsContainer) specsContainer.innerHTML = '';
            return;
        }

        const specs = productData.specifications;
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
                        <div class="detail-row"><span>Product Weight <i class="fa-solid fa-circle-info"></i></span><span>${specs.productDetails.productWeight || productData.defaultSpecs.weight}</span></div>
                    </div>
                </div>`;
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
                </div>`;
        }
        if (specs.metalDetails) {
             html += `
                <div class="accordion-section">
                    <h4 class="accordion-title">METAL DETAILS</h4>
                    <div class="accordion-content">
                        <div class="detail-row"><span>Type</span><span>${currentPurity} ${currentMetal}</span></div>
                        <div class="detail-row"><span>Weight <i class="fa-solid fa-circle-info"></i></span><span>${specs.metalDetails.weight || productData.defaultSpecs.weight}</span></div>
                    </div>
                </div>`;
        }
        if (specs.tags && specs.tags.length > 0) {
             html += `
                <div class="accordion-section">
                    <h4 class="accordion-title">TAGS</h4>
                    <div class="accordion-content tags-content">
                        ${specs.tags.map(tag => `<a href="product-listing.html?search=${encodeURIComponent(tag)}">${tag}</a>`).join('')}
                    </div>
                </div>`;
        }
        specsContainer.innerHTML = html;
    }

    function calculatePrice() {
        if (!productData.price || !Object.keys(marketPrices).length || !metalSelect || !puritySelect || !stoneSelect) {
             if(priceEl) priceEl.textContent = `₹${productData.price.toLocaleString('en-IN')}`;
             if(basePriceEl) basePriceEl.textContent = `₹${productData.price.toLocaleString('en-IN')}`;
             if(customizationCostEl) customizationCostEl.textContent = `₹0`;
            return productData.price;
        }

        const basePrice = productData.price;
        const customizations = {
            metal: metalSelect.value,
            purity: puritySelect.value,
            stone: stoneSelect.value
        };

        const metalMultiplier = marketPrices.metals[customizations.metal] || 1;
        const purityMultiplier = marketPrices.purity[customizations.purity] || 1;
        const stoneMultiplier = marketPrices.stones[customizations.stone] || 1;

        const finalPrice = Math.round(basePrice * metalMultiplier * purityMultiplier * stoneMultiplier);
        const customizationCost = finalPrice - basePrice;

        if (priceEl) priceEl.textContent = `₹${finalPrice.toLocaleString('en-IN')}`;
        if (basePriceEl) basePriceEl.textContent = `₹${basePrice.toLocaleString('en-IN')}`;
        if (customizationCostEl) customizationCostEl.textContent = `₹${customizationCost.toLocaleString('en-IN')}`;
        
        return finalPrice;
    }
    
    function updateDynamicContent() { // Renamed from updateFromVariant for clarity
        if (!productData) return;

        const selectedMetal = metalSelect ? metalSelect.value : productData.defaultSpecs.metal;
        const selectedPurity = puritySelect ? puritySelect.value : productData.defaultSpecs.purity;
        const selectedStoneDisplay = stoneSelect ? stoneSelect.value : productData.defaultSpecs.stone; // This is the display name, e.g. "Diamond (SI IJ)"
        const selectedStoneKey = selectedStoneDisplay.split(' ')[0]; // Base stone name, e.g., "Diamond" for variant lookup
        
        const variantKey = `${selectedMetal} with ${selectedStoneKey}`;
        const variant = productData.variants ? productData.variants[variantKey] : null;

        if (mainImageEl) {
            if (variant && variant.image) {
                mainImageEl.src = variant.image;
            } else if (productData.images && productData.images.length > 0) {
                mainImageEl.src = productData.images[0];
            }
        }
        
        calculatePrice(); // This will update price elements
        renderSpecifications(selectedMetal, selectedPurity, selectedStoneDisplay);
        updateWishlistButtonState();
    }

    function logRecentlyViewed(pId) {
        let viewedItems = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
        viewedItems = viewedItems.filter(id => id !== pId);
        viewedItems.unshift(pId);
        localStorage.setItem('recentlyViewed', JSON.stringify(viewedItems.slice(0, 5)));
    }

    // --- AI Design Generation ---
    async function handleAiDesignGeneration() {
        const prompt = aiPromptInput.value.trim();
        if (!prompt) {
            aiResultContainer.innerHTML = `<p class="feedback-error">Please enter a design prompt.</p>`;
            return;
        }

        aiResultContainer.innerHTML = `<div class="loading-indicator">Generating your design... This may take a moment.</div>`;
        if(generateAiBtn) generateAiBtn.disabled = true;

        // Attempt real API call
        try {
            if (!ACCESS_TOKEN || ACCESS_TOKEN === "PASTE_YOUR_FRESH_ACCESS_TOKEN_HERE") {
                 console.error("Access token is missing or not configured. Using simulated image.");
            }
            const endpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/imagegeneration@005:predict`;
            const body = { 
                instances: [{ prompt: `High-quality jewellery photography of: ${prompt}, on a clean white background, studio lighting` }], 
                parameters: { sampleCount: 1 } 
            };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${ACCESS_TOKEN}`, 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("API Error Data:", errorData);
                console.error(errorData.error?.message || `API request failed with status ${response.status}. Using simulated image.`);
            }

            const data = await response.json();
            if (data.predictions && data.predictions[0] && data.predictions[0].bytesBase64Encoded) {
                const imageBase64 = data.predictions[0].bytesBase64Encoded;
                const imageUrl = `data:image/png;base64,${imageBase64}`;
                displayAiResult(imageUrl, prompt);
            } else {
                throw new Error("No image data received from API. Using simulated image.");
            }
        } catch (e) {
            console.warn("Real AI API call failed:", e.message);
            // aiResultContainer.innerHTML = `<p class="feedback-error">Live AI generation failed: ${e.message}. Displaying a simulated image based on your prompt.</p>`;
            // Add a small delay before showing simulated image to make the error message visible
            setTimeout(() => generateSimulatedAiDesign(prompt), 1500);
        } finally {
             if(generateAiBtn) generateAiBtn.disabled = false;
        }
    }

    function generateSimulatedAiDesign(prompt) {
        const promptKeywords = prompt.toLowerCase().split(/\s+/).filter(k => k.length > 2);
        let bestMatch = null;
        let maxMatchCount = 0;

        aiImagesData.forEach(img => {
            let currentMatchCount = 0;
            promptKeywords.forEach(keyword => {
                if (img.tags.some(tag => tag.toLowerCase().includes(keyword))) {
                    currentMatchCount++;
                }
            });
            if (currentMatchCount > maxMatchCount) {
                maxMatchCount = currentMatchCount;
                bestMatch = img;
            }
        });
        
        const imageUrl = bestMatch ? bestMatch.src : aiImagesData.find(img => img.tags.includes("default"))?.src || 'images/ai/default-pendant.jpg';
        displayAiResult(imageUrl, prompt, true);
    }

    function displayAiResult(imageUrl, prompt, isSimulated = false) {
        aiResultContainer.innerHTML = `
            <h4>${isSimulated ? "Simulated" : "Generated"} Design</h4>
            ${isSimulated ? '<p style="font-size:0.9em; color: #555;">(This is a stock image based on your prompt keywords as live AI failed)</p>' : ''}
            <img src="${imageUrl}" class="ai-result-image" alt="AI Generated: ${prompt}">
            <button class="btn bPtn-secondary send-for-approval-btn">Send for Approval</button>
        `;
    }

    // ===================================================================
    // --- 5. EVENT LISTENERS ---
    // ===================================================================
    if (metalSelect) metalSelect.addEventListener('change', updateDynamicContent);
    if (puritySelect) puritySelect.addEventListener('change', updateDynamicContent);
    if (stoneSelect) stoneSelect.addEventListener('change', updateDynamicContent);
    
    if (thumbnailContainerEl) {
        thumbnailContainerEl.addEventListener('click', e => {
            if (e.target.tagName === 'IMG' && mainImageEl) {
                mainImageEl.src = e.target.src;
                document.querySelectorAll('.thumbnail-container img').forEach(thumb => thumb.classList.remove('active'));
                e.target.classList.add('active');
            }
        });
    }

    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            const currentPrice = calculatePrice(); // Ensure price is up-to-date
            const itemToAdd = {
                id: productId,
                quantity: 1,
                customizations: { 
                    metal: metalSelect.value, 
                    purity: puritySelect.value, 
                    stone: stoneSelect.value 
                },
                finalPrice: currentPrice,
                image: mainImageEl.src 
            };
            addToCart(itemToAdd); // from cart.js
            addToCartBtn.textContent = 'Added!';
            setTimeout(() => { addToCartBtn.textContent = 'Add to Cart'; }, 2000);
        });
    }
    
    if (wishlistBtn) {
        wishlistBtn.addEventListener('click', () => {
            const currentPrice = calculatePrice(); // Ensure price is up-to-date
            const itemToToggle = {
                id: productId,
                customizations: { 
                    metal: metalSelect.value, 
                    purity: puritySelect.value, 
                    stone: stoneSelect.value 
                },
                finalPrice: currentPrice,
                image: mainImageEl.src
            };
            toggleWishlistItem(itemToToggle); // from cart.js
            updateWishlistButtonState();
        });
    }

    // AI Panel Toggle Listeners
    if (customiseBtn && aiDesignBtn && customisePanel && aiDesignPanel) {
        customiseBtn.addEventListener('click', () => {
            customiseBtn.classList.add('active'); 
            aiDesignBtn.classList.remove('active');
            customisePanel.style.display = 'block'; 
            aiDesignPanel.style.display = 'none';
        });
        aiDesignBtn.addEventListener('click', () => {
            aiDesignBtn.classList.add('active'); 
            customiseBtn.classList.remove('active');
            aiDesignPanel.style.display = 'block'; 
            customisePanel.style.display = 'none';
        });
    }

    if (generateAiBtn) {
        generateAiBtn.addEventListener('click', handleAiDesignGeneration);
    }
    
    if (aiDesignPanel) {
        aiDesignPanel.addEventListener('click', (e) => {
            if (e.target.classList.contains('send-for-approval-btn')) {
                const promptText = aiPromptInput.value;
                const aiImageElement = aiResultContainer.querySelector('.ai-result-image');
                if (!aiImageElement) {
                    alert("No AI image generated to submit.");
                    return;
                }
                const imageUrl = aiImageElement.src;
                
                const submission = { 
                    id: `ai-${Date.now()}`, 
                    prompt: promptText, 
                    imageUrl: imageUrl, 
                    status: "Pending",
                    productId: productId, // Optionally link to the base product
                    originalProductName: productData.name 
                };
                const submissions = JSON.parse(localStorage.getItem('ai_submissions')) || [];
                submissions.push(submission);
                localStorage.setItem('ai_submissions', JSON.stringify(submissions));
                
                aiResultContainer.innerHTML = `<p class="feedback-success">Design submitted for approval! You can check its status in "My Designs".</p>`;
            }
        });
    }

    function updateGmpTeaser(currentProductPrice) {
        if (!gmpMonthlyEstimateEl || !viewGmpBtn || !gmpTeaserSection) return;

        if (currentProductPrice > 0) {
            // The 10+1 plan means the total value is paid over 10 installments by user, 1 by BlueStone.
            // So, if product costs X, each of the 11 installments is roughly X / 11.
            // The user pays 10 of these.
            const monthlyInstallment = Math.round(currentProductPrice / 11);
            
            // We'll pre-fill the Gold Mine Plan calculator with this *single* installment amount.
            // The calculator itself then shows "You pay 10x, get 1x free".
            gmpMonthlyEstimateEl.textContent = `Approx. ₹${monthlyInstallment.toLocaleString('en-IN')} /month for 11 months.`;
            viewGmpBtn.dataset.monthlyInstallment = monthlyInstallment; // Store for redirect
            gmpTeaserSection.style.display = 'block';
        } else {
            gmpTeaserSection.style.display = 'none';
        }
    }

    // Modify calculatePrice() to return the finalPrice and call updateGmpTeaser
    function calculatePrice() {
        if (!productData.price || !Object.keys(marketPrices).length || !metalSelect || !puritySelect || !stoneSelect) {
            const defaultPrice = productData.price || 0;
            if(priceEl) priceEl.textContent = `₹${defaultPrice.toLocaleString('en-IN')}`;
            if(basePriceEl) basePriceEl.textContent = `₹${defaultPrice.toLocaleString('en-IN')}`;
            if(customizationCostEl) customizationCostEl.textContent = `₹0`;
            updateGmpTeaser(defaultPrice); // Update teaser with default price
            return defaultPrice;
        }

        const basePrice = productData.price;
        const customizations = {
            metal: metalSelect.value,
            purity: puritySelect.value,
            stone: stoneSelect.value
        };

        const metalMultiplier = marketPrices.metals[customizations.metal] || 1;
        const purityMultiplier = marketPrices.purity[customizations.purity] || 1;
        const stoneMultiplier = marketPrices.stones[customizations.stone] || 1;

        const finalPrice = Math.round(basePrice * metalMultiplier * purityMultiplier * stoneMultiplier);
        const customizationCost = finalPrice - basePrice;

        if (priceEl) priceEl.textContent = `₹${finalPrice.toLocaleString('en-IN')}`;
        if (basePriceEl) basePriceEl.textContent = `₹${basePrice.toLocaleString('en-IN')}`;
        if (customizationCostEl) customizationCostEl.textContent = `₹${customizationCost.toLocaleString('en-IN')}`;
        
        updateGmpTeaser(finalPrice); // <<<< CALL ADDED HERE
        return finalPrice;
    }

    // The updateDynamicContent function already calls calculatePrice(), so no change needed there.
    // ... (rest of existing updateDynamicContent, logRecentlyViewed, AI functions, etc.)


    // --- Add to EVENT LISTENERS section ---

    // ... (keep existing listeners for metalSelect, puritySelect, stoneSelect, thumbnail, cart, wishlist, AI panel toggle) ...

    // NEW: Event listener for the 10+1 Plan button
    if (viewGmpBtn) {
        viewGmpBtn.addEventListener('click', () => {
            const monthlyInstallment = viewGmpBtn.dataset.monthlyInstallment;
            if (monthlyInstallment) {
                // Ensure it's a reasonable amount (e.g., Gold plan might have a min like 2000)
                const actualInstallmentToSend = Math.max(2000, parseInt(monthlyInstallment)); 
                window.location.href = `gold-plan.html?prefillAmount=${actualInstallmentToSend}`;
            } else {
                // Fallback if data attribute isn't set, go to generic plan page
                window.location.href = 'gold-plan.html';
            }
        });
    }

    // --- KICK OFF THE PAGE LOAD ---
    initializePage();
});