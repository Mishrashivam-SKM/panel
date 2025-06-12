// File: /js/homepage.js
document.addEventListener('DOMContentLoaded', async () => {
    const recentlyViewedContainer = document.getElementById('recently-viewed-container');
    const recentlyViewedGrid = document.getElementById('recently-viewed-grid');

    // Exit if the required containers are not on the current page
    if (!recentlyViewedContainer || !recentlyViewedGrid) {
        return;
    }

    // 1. Get the list of viewed product IDs from localStorage
    const viewedIds = JSON.parse(localStorage.getItem('recentlyViewed')) || [];

    // If there are no viewed items, keep the section hidden and stop
    if (viewedIds.length === 0) {
        return;
    }

    try {
        // 2. Fetch the master list of all products
        const response = await fetch('data/products.json');
        if (!response.ok) {
            throw new Error('Failed to load product data.');
        }
        const allProducts = await response.json();

        // 3. Filter the master list to get only the products that have been viewed,
        // while preserving the "recently viewed" order.
        const viewedProducts = viewedIds.map(id => {
            return allProducts.find(p => p.id === id);
        }).filter(p => p); // This .filter(p => p) removes any 'undefined' items if a product ID from localStorage was not found in the JSON

        if (viewedProducts.length === 0) {
            return; // No valid products to show, so keep the section hidden
        }

        // 4. Generate the HTML for each product card and inject it into the grid
        recentlyViewedGrid.innerHTML = viewedProducts.map(product => {
            return `
                <div class="product-card">
                    <a href="product-detail.html?id=${product.id}" class="product-link-wrapper">
                        <div class="product-image-container">
                            <img src="${product.images[0]}" alt="${product.name}">
                        </div>
                        <div class="product-card-details">
                            <h3>${product.name}</h3>
                            <p class="price">₹${product.price.toLocaleString('en-IN')}</p>
                        </div>
                    </a>
                </div>
            `;
        }).join('');
        
        // 5. Finally, make the entire "Recently Viewed" section visible
        recentlyViewedContainer.style.display = 'block';

    } catch (error) {
        console.error("Error loading recently viewed products:", error);
        // On error, we simply do nothing, and the section remains hidden
    }
});