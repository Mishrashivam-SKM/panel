// // File: /js/plp.js
// document.addEventListener('DOMContentLoaded', function () {
//     // DOM Elements
//     const productGrid = document.querySelector('.product-grid');
//     const pageTitle = document.querySelector('.plp-header h2');
//     const filterCheckboxes = document.querySelectorAll('.plp-filters input[type="checkbox"]');
//     const sortBySelect = document.querySelector('#sort-by');

//     // State Variable
//     let allProducts = []; // This will store the master list of all products
    
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

//         if (pageTitle) {
//             pageTitle.textContent = `Jewellery (${productsToDisplay.length} Designs)`;
//         }

//         if (productsToDisplay.length === 0) {
//             productGrid.innerHTML = '<p>No products match your criteria.</p>';
//             return;
//         }

//         productsToDisplay.forEach(product => {
//             // **THE FIX, PART 1: Check the wishlist using the item's default specs.**
//             // Create the unique ID for the default version of the product.
//             const defaultWishlistItemId = `${product.id}-${product.defaultSpecs.metal}-${product.defaultSpecs.purity}-${product.defaultSpecs.stone}`;
            
//             // Check if this default version is in the wishlist.
//             const isActive = isItemInWishlist(defaultWishlistItemId);

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
//                 <!-- The icon is now outside the link to prevent navigation on click -->
//                 <div class="wishlist-icon ${isActive ? 'active' : ''}" data-product-id="${product.id}">
//                     <i class="fa-${isActive ? 'solid' : 'regular'} fa-heart"></i>
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

//         // Filtering logic (remains the same)
//         const activeFilters = { price: [], metal: [] };
//         filterCheckboxes.forEach(cb => {
//             if (cb.checked) activeFilters[cb.name].push(cb.value);
//         });
//         if (activeFilters.price.length > 0) {
//             filteredProducts = filteredProducts.filter(p => activeFilters.price.some(range => {
//                 const [min, max] = range.split('-').map(Number);
//                 return p.price >= min && p.price <= (max || Infinity);
//             }));
//         }
//         if (activeFilters.metal.length > 0) {
//             filteredProducts = filteredProducts.filter(p => activeFilters.metal.includes(p.defaultSpecs.metal));
//         }

//         // Sorting logic (remains the same)
//         const sortBy = sortBySelect.value;
//         if (sortBy === 'price-asc') filteredProducts.sort((a, b) => a.price - b.price);
//         else if (sortBy === 'price-desc') filteredProducts.sort((a, b) => b.price - a.price);

//         displayProducts(filteredProducts);
//     }

//     // --- 4. EVENT LISTENERS ---
//     filterCheckboxes.forEach(cb => cb.addEventListener('change', applyFiltersAndSort));
//     sortBySelect.addEventListener('change', applyFiltersAndSort);

//     // Event Delegation for wishlist icons
//     // productGrid.addEventListener('click', (event) => {
//     //     const wishlistBtn = event.target.closest('.wishlist-icon');
//     //     if (wishlistBtn) {
//     //         event.preventDefault(); // Stop any other default action
            
//     //         // **THE FIX, PART 2: Send the full object with default specs.**
//     //         const productId = wishlistBtn.dataset.productId;
//     //         const product = allProducts.find(p => p.id === productId);

//     //         if (!product) {
//     //             console.error("Could not find product data for ID:", productId);
//     //             return;
//     //         }

//     //         // Create the object that our new wishlist function needs
//     //         const itemToToggle = {
//     //             id: product.id,
//     //             customizations: product.defaultSpecs, // Use the product's default specs
//     //             finalPrice: product.price // Use the product's base price
//     //         };
            
//     //         // Call the correct, updated function from cart.js
//     //         toggleWishlistItem(itemToToggle);

//     //         // Toggle visual state of the icon immediately
//     //         wishlistBtn.classList.toggle('active');
//     //         const icon = wishlistBtn.querySelector('i');
//     //         if (wishlistBtn.classList.contains('active')) {
//     //             icon.classList.replace('fa-regular', 'fa-solid');
//     //         } else {
//     //             icon.classList.replace('fa-solid', 'fa-regular');
//     //         }
//     //     }
//     // });

//     productGrid.addEventListener('click', (event) => {
//         // Check if the clicked element or its parent is the wishlist icon
//         const wishlistBtn = event.target.closest('.wishlist-icon');
//         if (wishlistBtn) {
//             // --- THIS IS THE FIX ---
//             // Prevent the main link of the card from firing
//             event.preventDefault(); 
//             event.stopPropagation();
            
//             const productId = wishlistBtn.dataset.productId;
            
//             // Instead of adding to wishlist, GO to the product page.
//             // This forces the user to select a variant before wishlisting.
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
    const pageTitle = document.querySelector('.plp-header h2');
    const filterCheckboxes = document.querySelectorAll('.plp-filters input[type="checkbox"]');
    const sortBySelect = document.querySelector('#sort-by');

    // State Variable
    let allProducts = [];
    
    const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;

    // --- 1. FETCHING LOGIC ---
    async function fetchProducts() {
        try {
            const response = await fetch('data/products.json');
            if (!response.ok) throw new Error('Network response was not ok');
            allProducts = await response.json();
            applyFiltersAndSort(); // Initial display
        } catch (error) {
            console.error('Fetch error:', error);
            productGrid.innerHTML = '<p>Could not load products.</p>';
        }
    }

    // --- 2. DISPLAY LOGIC ---
    function displayProducts(productsToDisplay) {
        productGrid.innerHTML = ''; // Clear the grid

        // Get search term from URL to update the title
        const urlParams = new URLSearchParams(window.location.search);
        const searchTerm = urlParams.get('search');

        if (pageTitle) {
            if (searchTerm) {
                 pageTitle.textContent = `Search Results for "${searchTerm}" (${productsToDisplay.length} Designs)`;
            } else {
                 pageTitle.textContent = `Jewellery (${productsToDisplay.length} Designs)`;
            }
        }

        if (productsToDisplay.length === 0) {
            productGrid.innerHTML = '<p>No products match your criteria.</p>';
            return;
        }

        productsToDisplay.forEach(product => {
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
                <div class="wishlist-icon" data-product-id="${product.id}">
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
        let filteredProducts = [...allProducts]; 

        // --- NEW: Search Logic ---
        const urlParams = new URLSearchParams(window.location.search);
        const searchTerm = urlParams.get('search');
        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            filteredProducts = filteredProducts.filter(p => 
                p.name.toLowerCase().includes(lowerCaseSearchTerm) || 
                p.description.toLowerCase().includes(lowerCaseSearchTerm) ||
                p.category.toLowerCase().includes(lowerCaseSearchTerm)
            );
        }
        // --- End of Search Logic ---

        // Existing filtering logic
        const activeFilters = { price: [], metal: [] };
        filterCheckboxes.forEach(cb => {
            if (cb.checked) activeFilters[cb.name].push(cb.value);
        });
        if (activeFilters.price.length > 0) {
            // This part of filtering will not work with your new LUX... JSON as it lacks defaultSpecs.
            // It is left here for completeness but would need adjustment for the new data structure.
        }
        if (activeFilters.metal.length > 0) {
            // This also depends on defaultSpecs.
        }

        // Existing sorting logic
        const sortBy = sortBySelect.value;
        if (sortBy === 'price-asc') filteredProducts.sort((a, b) => a.price - b.price);
        else if (sortBy === 'price-desc') filteredProducts.sort((a, b) => b.price - a.price);

        displayProducts(filteredProducts);
    }

    // --- 4. EVENT LISTENERS ---
    filterCheckboxes.forEach(cb => cb.addEventListener('change', applyFiltersAndSort));
    sortBySelect.addEventListener('change', applyFiltersAndSort);

    // Event Delegation for wishlist icons
    productGrid.addEventListener('click', (event) => {
        const wishlistBtn = event.target.closest('.wishlist-icon');
        if (wishlistBtn) {
            event.preventDefault(); 
            event.stopPropagation();
            const productId = wishlistBtn.dataset.productId;
            if (productId) {
                window.location.href = `product-detail.html?id=${productId}`;
            }
        }
    });

    // --- 5. INITIAL CALL ---
    fetchProducts();
});