// // // File: /js/plp.js
// // document.addEventListener('DOMContentLoaded', function () {
// //     // DOM Elements
// //     const productGrid = document.querySelector('.product-grid');
// //     const pageTitle = document.querySelector('.plp-header h2');
// //     const filterCheckboxes = document.querySelectorAll('.plp-filters input[type="checkbox"]');
// //     const sortBySelect = document.querySelector('#sort-by');

// //     // State Variable
// //     let allProducts = []; // This will store the master list of all products
    
// //     const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;

// //     // --- 1. FETCHING LOGIC ---
// //     async function fetchProducts() {
// //         try {
// //             const response = await fetch('data/products.json');
// //             if (!response.ok) throw new Error('Network response was not ok');
// //             allProducts = await response.json();
// //             applyFiltersAndSort(); // Initial display
// //         } catch (error) {
// //             console.error('Fetch error:', error);
// //             productGrid.innerHTML = '<p>Could not load products.</p>';
// //         }
// //     }

// //     // --- 2. DISPLAY LOGIC ---
// //     function displayProducts(productsToDisplay) {
// //         productGrid.innerHTML = ''; // Clear the grid

// //         if (pageTitle) {
// //             pageTitle.textContent = `Jewellery (${productsToDisplay.length} Designs)`;
// //         }

// //         if (productsToDisplay.length === 0) {
// //             productGrid.innerHTML = '<p>No products match your criteria.</p>';
// //             return;
// //         }

// //         productsToDisplay.forEach(product => {
// //             // **THE FIX, PART 1: Check the wishlist using the item's default specs.**
// //             // Create the unique ID for the default version of the product.
// //             const defaultWishlistItemId = `${product.id}-${product.defaultSpecs.metal}-${product.defaultSpecs.purity}-${product.defaultSpecs.stone}`;
            
// //             // Check if this default version is in the wishlist.
// //             const isActive = isItemInWishlist(defaultWishlistItemId);

// //             const productCardHTML = `
// //                 <a href="product-detail.html?id=${product.id}" class="product-link-wrapper">
// //                     <div class="product-image-container">
// //                         <img src="${product.images[0]}" alt="${product.name}">
// //                     </div>
// //                     <div class="product-card-details">
// //                         <h3>${product.name}</h3>
// //                         <p class="price">${formatCurrency(product.price)}</p>
// //                     </div>
// //                 </a>
// //                 <!-- The icon is now outside the link to prevent navigation on click -->
// //                 <div class="wishlist-icon ${isActive ? 'active' : ''}" data-product-id="${product.id}">
// //                     <i class="fa-${isActive ? 'solid' : 'regular'} fa-heart"></i>
// //                 </div>
// //             `;
            
// //             const productCard = document.createElement('div');
// //             productCard.classList.add('product-card');
// //             productCard.innerHTML = productCardHTML;
// //             productGrid.appendChild(productCard);
// //         });
// //     }

// //     // --- 3. FILTERING AND SORTING LOGIC ---
// //     function applyFiltersAndSort() {
// //         let filteredProducts = [...allProducts]; 

// //         // Filtering logic (remains the same)
// //         const activeFilters = { price: [], metal: [] };
// //         filterCheckboxes.forEach(cb => {
// //             if (cb.checked) activeFilters[cb.name].push(cb.value);
// //         });
// //         if (activeFilters.price.length > 0) {
// //             filteredProducts = filteredProducts.filter(p => activeFilters.price.some(range => {
// //                 const [min, max] = range.split('-').map(Number);
// //                 return p.price >= min && p.price <= (max || Infinity);
// //             }));
// //         }
// //         if (activeFilters.metal.length > 0) {
// //             filteredProducts = filteredProducts.filter(p => activeFilters.metal.includes(p.defaultSpecs.metal));
// //         }

// //         // Sorting logic (remains the same)
// //         const sortBy = sortBySelect.value;
// //         if (sortBy === 'price-asc') filteredProducts.sort((a, b) => a.price - b.price);
// //         else if (sortBy === 'price-desc') filteredProducts.sort((a, b) => b.price - a.price);

// //         displayProducts(filteredProducts);
// //     }

// //     // --- 4. EVENT LISTENERS ---
// //     filterCheckboxes.forEach(cb => cb.addEventListener('change', applyFiltersAndSort));
// //     sortBySelect.addEventListener('change', applyFiltersAndSort);

// //     // Event Delegation for wishlist icons
// //     // productGrid.addEventListener('click', (event) => {
// //     //     const wishlistBtn = event.target.closest('.wishlist-icon');
// //     //     if (wishlistBtn) {
// //     //         event.preventDefault(); // Stop any other default action
            
// //     //         // **THE FIX, PART 2: Send the full object with default specs.**
// //     //         const productId = wishlistBtn.dataset.productId;
// //     //         const product = allProducts.find(p => p.id === productId);

// //     //         if (!product) {
// //     //             console.error("Could not find product data for ID:", productId);
// //     //             return;
// //     //         }

// //     //         // Create the object that our new wishlist function needs
// //     //         const itemToToggle = {
// //     //             id: product.id,
// //     //             customizations: product.defaultSpecs, // Use the product's default specs
// //     //             finalPrice: product.price // Use the product's base price
// //     //         };
            
// //     //         // Call the correct, updated function from cart.js
// //     //         toggleWishlistItem(itemToToggle);

// //     //         // Toggle visual state of the icon immediately
// //     //         wishlistBtn.classList.toggle('active');
// //     //         const icon = wishlistBtn.querySelector('i');
// //     //         if (wishlistBtn.classList.contains('active')) {
// //     //             icon.classList.replace('fa-regular', 'fa-solid');
// //     //         } else {
// //     //             icon.classList.replace('fa-solid', 'fa-regular');
// //     //         }
// //     //     }
// //     // });

// //     productGrid.addEventListener('click', (event) => {
// //         // Check if the clicked element or its parent is the wishlist icon
// //         const wishlistBtn = event.target.closest('.wishlist-icon');
// //         if (wishlistBtn) {
// //             // --- THIS IS THE FIX ---
// //             // Prevent the main link of the card from firing
// //             event.preventDefault(); 
// //             event.stopPropagation();
            
// //             const productId = wishlistBtn.dataset.productId;
            
// //             // Instead of adding to wishlist, GO to the product page.
// //             // This forces the user to select a variant before wishlisting.
// //             if (productId) {
// //                 window.location.href = `product-detail.html?id=${productId}`;
// //             }
// //         }
// //     });

// //     // --- 5. INITIAL CALL ---
// //     fetchProducts();
// // });



// // File: /js/plp.js
// document.addEventListener('DOMContentLoaded', function () {
//     // DOM Elements
//     const productGrid = document.querySelector('.product-grid');
//     const pageTitle = document.querySelector('.plp-header h2');
//     const filterCheckboxes = document.querySelectorAll('.plp-filters input[type="checkbox"]');
//     const sortBySelect = document.querySelector('#sort-by');

//     // State Variable
//     let allProducts = [];
    
//     const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;

//     // --- 1. FETCHING LOGIC ---
//     async function fetchProducts() {
//         try {
//             const response = await fetch('data/products.json');
//             if (!response.ok) throw new Error('Network response was not ok');
//             allProducts = await response.json();
//             applyFiltersAndSort(); // Initial display
//         } catch (error) {
//             console.error('Fetch error:', error);
//             productGrid.innerHTML = '<p>Could not load products.</p>';
//         }
//     }

//     // --- 2. DISPLAY LOGIC ---
//     function displayProducts(productsToDisplay) {
//         productGrid.innerHTML = ''; // Clear the grid

//         // Get search term from URL to update the title
//         const urlParams = new URLSearchParams(window.location.search);
//         const searchTerm = urlParams.get('search');

//         if (pageTitle) {
//             if (searchTerm) {
//                  pageTitle.textContent = `Search Results for "${searchTerm}" (${productsToDisplay.length} Designs)`;
//             } else {
//                  pageTitle.textContent = `Jewellery (${productsToDisplay.length} Designs)`;
//             }
//         }

//         if (productsToDisplay.length === 0) {
//             productGrid.innerHTML = '<p>No products match your criteria.</p>';
//             return;
//         }

//         productsToDisplay.forEach(product => {
//             const productCardHTML = `
//                 <a href="product-detail.html?id=${product.id}" class="product-link-wrapper">
//                     <div class="product-image-container">
//                         <img src="${product.images[0]}" alt="${product.name}">
//                     </div>
//                     <div class="product-card-details">
//                         <h3>${product.name}</h3>
//                         <p class="price">${formatCurrency(product.price)}</p>
//                     </div>
//                 </a>
//                 <div class="wishlist-icon" data-product-id="${product.id}">
//                     <i class="fa-regular fa-heart"></i>
//                 </div>
//             `;
            
//             const productCard = document.createElement('div');
//             productCard.classList.add('product-card');
//             productCard.innerHTML = productCardHTML;
//             productGrid.appendChild(productCard);
//         });
//     }

//     // --- 3. FILTERING AND SORTING LOGIC ---
//     function applyFiltersAndSort() {
//         let filteredProducts = [...allProducts]; 

//         // --- NEW: Search Logic ---
//         const urlParams = new URLSearchParams(window.location.search);
//         const searchTerm = urlParams.get('search');
//         if (searchTerm) {
//             const lowerCaseSearchTerm = searchTerm.toLowerCase();
//             filteredProducts = filteredProducts.filter(p => 
//                 p.name.toLowerCase().includes(lowerCaseSearchTerm) || 
//                 p.description.toLowerCase().includes(lowerCaseSearchTerm) ||
//                 p.category.toLowerCase().includes(lowerCaseSearchTerm)
//             );
//         }
//         // --- End of Search Logic ---

//         // Existing filtering logic
//         const activeFilters = { price: [], metal: [] };
//         filterCheckboxes.forEach(cb => {
//             if (cb.checked) activeFilters[cb.name].push(cb.value);
//         });
//         if (activeFilters.price.length > 0) {
//             filteredProducts = filteredProducts.filter(p => activeFilters.price.some(range => {
//                 const [min, max] = range.split('-').map(Number);
//                 // For price, p.price should work directly with the LUX items
//                 return p.price >= min && p.price <= (max || Infinity); 
//             }));
//             // This part of filtering will not work with your new LUX... JSON as it lacks defaultSpecs.
//             // It is left here for completeness but would need adjustment for the new data structure.
//         }
//         if (activeFilters.metal.length > 0) {
//             // This also depends on defaultSpecs.
//             filteredProducts = filteredProducts.filter(p => 
//                 // This is where the issue might be if not accessing defaultSpecs correctly
//                 activeFilters.metal.includes(p.defaultSpecs.metal) 
//             );
//         }

//         // Existing sorting logic
//         const sortBy = sortBySelect.value;
//         if (sortBy === 'price-asc') filteredProducts.sort((a, b) => a.price - b.price);
//         else if (sortBy === 'price-desc') filteredProducts.sort((a, b) => b.price - a.price);

//         displayProducts(filteredProducts);
//     }

//     // --- 4. EVENT LISTENERS ---
//     filterCheckboxes.forEach(cb => cb.addEventListener('change', applyFiltersAndSort));
//     sortBySelect.addEventListener('change', applyFiltersAndSort);

//     // Event Delegation for wishlist icons
//     productGrid.addEventListener('click', (event) => {
//         const wishlistBtn = event.target.closest('.wishlist-icon');
//         if (wishlistBtn) {
//             event.preventDefault(); 
//             event.stopPropagation();
//             const productId = wishlistBtn.dataset.productId;
//             if (productId) {
//                 window.location.href = `product-detail.html?id=${productId}`;
//             }
//         }
//     });

//     // --- 5. INITIAL CALL ---
//     fetchProducts();
// });


// File: /js/plp.js
document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const productGrid = document.querySelector('.product-grid');
    const pageTitle = document.querySelector('.plp-header h2'); // For updating product count
    const filterCheckboxes = document.querySelectorAll('.plp-filters input[type="checkbox"]');
    const sortBySelect = document.getElementById('sort-by'); // Corrected ID selector

    // State Variable
    let allProducts = []; 
    
    const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;

    // --- 1. FETCHING LOGIC ---
    async function fetchProducts() {
        try {
            const response = await fetch('data/products.json');
            if (!response.ok) throw new Error('Network response was not ok fetching products.json');
            allProducts = await response.json();
            console.log("All products fetched:", allProducts); // Debug: Check fetched products
            applyFiltersAndSort(); // Initial display
        } catch (error) {
            console.error('Fetch error:', error);
            if (productGrid) productGrid.innerHTML = '<p>Could not load products. Please try again later.</p>';
        }
    }

    // --- 2. DISPLAY LOGIC ---
    function displayProducts(productsToDisplay) {
        if (!productGrid) return;
        productGrid.innerHTML = ''; 

        const urlParams = new URLSearchParams(window.location.search);
        const searchTerm = urlParams.get('search');

        if (pageTitle) {
            if (searchTerm) {
                 pageTitle.textContent = `Search Results for "${searchTerm}" (${productsToDisplay.length} Designs)`;
            } else {
                 // Dynamically determine category if possible, or use a generic title
                 const categoryParam = urlParams.get('category');
                 let titleText = "Jewellery";
                 if (categoryParam) {
                     titleText = categoryParam.replace('-', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                 }
                 pageTitle.textContent = `${titleText} (${productsToDisplay.length} Designs)`;
            }
        }

        if (productsToDisplay.length === 0) {
            productGrid.innerHTML = '<p>No products match your current filters or search.</p>';
            return;
        }

        productsToDisplay.forEach(product => {
            // For PLP, wishlist icon should link to PDP as customization is needed before wishlisting.
            // Actual "add to wishlist" from PLP is often disabled or simplified (adds default variant).
            // We will keep the current behavior: clicking icon on PLP goes to PDP.

            const productCardHTML = `
                <a href="product-detail.html?id=${product.id}" class="product-link-wrapper">
                    <div class="product-image-container">
                        <img src="${product.images[0]}" alt="${product.name}">
                    </div>
                    <div class="product-card-details">
                        <h3>${product.name}</h3>
                        <p class="price">${formatCurrency(product.price)}</p>
                    </div>
                </a>
                <!-- Wishlist icon on PLP: Clicking it will navigate to PDP due to the event listener -->
                <div class="wishlist-icon" data-product-id="${product.id}" title="View product to add to wishlist">
                    <i class="fa-regular fa-heart"></i>
                </div>
            `;
            
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.innerHTML = productCardHTML;
            productGrid.appendChild(productCard);
        });
    }

    // --- 3. FILTERING AND SORTING LOGIC ---
    function applyFiltersAndSort() {
        if (allProducts.length === 0) return; // Don't run if products haven't loaded

        let filteredProducts = [...allProducts]; 
        console.log("Initial products for filtering:", filteredProducts.length);


        const urlParams = new URLSearchParams(window.location.search);
        const searchTerm = urlParams.get('search');
        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            filteredProducts = filteredProducts.filter(p => 
                (p.name && p.name.toLowerCase().includes(lowerCaseSearchTerm)) || 
                (p.description && p.description.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (p.category && p.category.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (p.id && p.id.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (p.specifications && p.specifications.tags && p.specifications.tags.some(tag => tag.toLowerCase().includes(lowerCaseSearchTerm)))
            );
            console.log(`After search term "${searchTerm}":`, filteredProducts.length);
        }
        
        // Category filter from URL (e.g., ?category=rings)
        const categoryParam = urlParams.get('category');
        if (categoryParam) {
            filteredProducts = filteredProducts.filter(p => 
                p.category && p.category.toLowerCase() === categoryParam.toLowerCase()
            );
            console.log(`After category param "${categoryParam}":`, filteredProducts.length);
        }

        // Type filter from URL (e.g., ?type=engagement-rings)
        const typeParam = urlParams.get('type');
        if (typeParam) {
            // This assumes types might be in tags or inferred from name/description
            // For more precise type filtering, products.json would need a dedicated "type" field or more structured tags.
            const lowerCaseTypeParam = typeParam.toLowerCase().replace('-', ' ');
            filteredProducts = filteredProducts.filter(p =>
                (p.name && p.name.toLowerCase().includes(lowerCaseTypeParam)) ||
                (p.specifications && p.specifications.tags && p.specifications.tags.some(tag => tag.toLowerCase().includes(lowerCaseTypeParam)))
            );
            console.log(`After type param "${typeParam}":`, filteredProducts.length);
        }


        // Sidebar Filters
        const activeFilters = { price: [], metal: [] };
        if (filterCheckboxes) {
            filterCheckboxes.forEach(cb => {
                if (cb.checked) {
                    if (!activeFilters[cb.name]) activeFilters[cb.name] = [];
                    activeFilters[cb.name].push(cb.value);
                }
            });
        }
        console.log("Active sidebar filters:", activeFilters);

        if (activeFilters.price.length > 0) {
            filteredProducts = filteredProducts.filter(p => {
                return activeFilters.price.some(range => {
                    const [minStr, maxStr] = range.split('-');
                    const min = parseInt(minStr, 10);
                    const max = maxStr ? parseInt(maxStr, 10) : Infinity; // Handle ranges like "50000-" (50000 and above)
                    
                    if (isNaN(min)) return false; // Invalid range format

                    // Ensure product has a price property
                    if (typeof p.price !== 'number') return false; 
                    
                    return p.price >= min && p.price <= max;
                });
            });
            console.log("After price filter:", filteredProducts.length);
        }

        if (activeFilters.metal.length > 0) {
            filteredProducts = filteredProducts.filter(p => {
                // Ensure product has defaultSpecs and defaultSpecs.metal
                if (p.defaultSpecs && p.defaultSpecs.metal) {
                    return activeFilters.metal.includes(p.defaultSpecs.metal);
                }
                return false;
            });
            console.log("After metal filter:", filteredProducts.length);
        }

        // Sorting logic
        if (sortBySelect) {
            const sortBy = sortBySelect.value;
            if (sortBy === 'price-asc') {
                filteredProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
            } else if (sortBy === 'price-desc') {
                filteredProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
            }
            // Add more sorting options if needed (e.g., popular, new)
            // For "popular", you might need an extra field in products.json or a more complex metric.
        }
        console.log("After sorting:", filteredProducts.length);

        displayProducts(filteredProducts);
    }

    // --- 4. EVENT LISTENERS ---
    if (filterCheckboxes) {
        filterCheckboxes.forEach(cb => cb.addEventListener('change', applyFiltersAndSort));
    }
    if (sortBySelect) {
        sortBySelect.addEventListener('change', applyFiltersAndSort);
    }

    // Event Delegation for wishlist icons on PLP
    if (productGrid) {
        productGrid.addEventListener('click', (event) => {
            const wishlistBtn = event.target.closest('.wishlist-icon');
            if (wishlistBtn) {
                event.preventDefault(); 
                event.stopPropagation(); // Stop event from bubbling to the <a> tag
                const productId = wishlistBtn.dataset.productId;
                if (productId) {
                    // On PLP, clicking wishlist icon should take user to PDP
                    // where they can choose customizations before wishlisting.
                    window.location.href = `product-detail.html?id=${productId}`;
                }
            }
        });
    }

    // --- 5. INITIAL CALL ---
    fetchProducts();

    // Listen for cartUpdated to potentially refresh if needed (though not directly affecting PLP filters)
    // window.addEventListener('cartUpdated', applyFiltersAndSort); 
    // window.addEventListener('wishlistUpdated', applyFiltersAndSort); // Could be used to update wishlist icon states if displayed directly
});