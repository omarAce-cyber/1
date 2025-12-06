// Shop Page JavaScript

let currentFilters = {
    category: '',
    minPrice: '',
    maxPrice: '',
    sizes: [],
    sort: '',
    search: ''
};

let allProducts = [];
let filteredProducts = [];

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    initializeFilters();
    await loadProducts();
    updateCartCount();
});

// Initialize filters from URL
function initializeFilters() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Set category from URL
    const category = urlParams.get('category');
    if (category) {
        currentFilters.category = category;
        const categoryRadio = document.querySelector(`input[name="category"][value="${category}"]`);
        if (categoryRadio) categoryRadio.checked = true;
    }

    // Set featured from URL
    const featured = urlParams.get('featured');
    if (featured === 'true') {
        currentFilters.featured = true;
    }

    // Set search from URL
    const search = urlParams.get('search');
    if (search) {
        currentFilters.search = search;
    }

    // Event listeners
    document.querySelectorAll('input[name="category"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentFilters.category = e.target.value;
            applyFilters();
        });
    });

    document.getElementById('minPrice').addEventListener('input', (e) => {
        currentFilters.minPrice = e.target.value;
        applyFilters();
    });

    document.getElementById('maxPrice').addEventListener('input', (e) => {
        currentFilters.maxPrice = e.target.value;
        applyFilters();
    });

    document.querySelectorAll('input[name="size"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                currentFilters.sizes.push(e.target.value);
            } else {
                currentFilters.sizes = currentFilters.sizes.filter(s => s !== e.target.value);
            }
            applyFilters();
        });
    });

    document.getElementById('sortSelect').addEventListener('change', (e) => {
        currentFilters.sort = e.target.value;
        applyFilters();
    });

    document.getElementById('clearFilters').addEventListener('click', clearFilters);
    document.getElementById('filterToggle')?.addEventListener('click', toggleFilters);
}

// Load products
async function loadProducts() {
    try {
        const grid = document.getElementById('productsGrid');
        grid.innerHTML = '<div class="loading">Loading products...</div>';

        const params = {};

        if (currentFilters.category) params.category = currentFilters.category;
        if (currentFilters.featured) params.featured = 'true';
        if (currentFilters.search) params.search = currentFilters.search;

        const data = await api.products.getAll(params);
        allProducts = data.products || [];
        applyFilters();

    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('productsGrid').innerHTML = `
            <div class="no-products">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Error loading products</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// Apply filters
function applyFilters() {
    filteredProducts = allProducts.filter(product => {
        // Price filter
        if (currentFilters.minPrice && product.price < parseFloat(currentFilters.minPrice)) {
            return false;
        }
        if (currentFilters.maxPrice && product.price > parseFloat(currentFilters.maxPrice)) {
            return false;
        }

        // Size filter
        if (currentFilters.sizes.length > 0) {
            const productSizes = product.sizes.map(s => s.name);
            const hasSize = currentFilters.sizes.some(size => productSizes.includes(size));
            if (!hasSize) return false;
        }

        return true;
    });

    // Sort
    if (currentFilters.sort) {
        switch (currentFilters.sort) {
            case 'price-asc':
                filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'name-asc':
                filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'newest':
                filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
        }
    }

    displayProducts();
}

// Display products
function displayProducts() {
    const grid = document.getElementById('productsGrid');
    const resultsCount = document.getElementById('resultsCount');

    resultsCount.textContent = `${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''}`;

    if (filteredProducts.length === 0) {
        grid.innerHTML = `
            <div class="no-products">
                <i class="fas fa-shopping-bag"></i>
                <h3>No products found</h3>
                <p>Try adjusting your filters</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filteredProducts.map(product => {
        const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
        const hasDiscount = product.comparePrice && product.comparePrice > product.price;

        return `
            <div class="product-card" onclick="window.location.href='/product.html?id=${product._id}'">
                <div class="product-image">
                    <img src="${primaryImage?.url || '/img/placeholder.jpg'}" alt="${product.name}">
                    ${product.featured ? '<span class="product-badge">Featured</span>' : ''}
                </div>
                <div class="product-info">
                    <div class="product-category">${product.category}</div>
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-price">
                        <span class="price-current">$${product.price.toFixed(2)}</span>
                        ${hasDiscount ? `<span class="price-original">$${product.comparePrice.toFixed(2)}</span>` : ''}
                    </div>
                    <div class="product-actions">
                        <button class="btn-add-cart" onclick="event.stopPropagation(); quickAddToCart('${product._id}')">
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Quick add to cart
async function quickAddToCart(productId) {
    const product = allProducts.find(p => p._id === productId);
    if (!product) return;

    // Get first available size
    const availableSize = product.sizes.find(s => s.stock > 0);
    if (!availableSize) {
        alert('Product out of stock');
        return;
    }

    // Get first available color
    const color = product.colors[0]?.name || 'Default';

    cart.add(product, availableSize.name, color, 1);
    updateCartCount();
}

// Clear filters
function clearFilters() {
    currentFilters = {
        category: '',
        minPrice: '',
        maxPrice: '',
        sizes: [],
        sort: '',
        search: ''
    };

    document.querySelectorAll('input[name="category"]')[0].checked = true;
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    document.querySelectorAll('input[name="size"]').forEach(cb => cb.checked = false);
    document.getElementById('sortSelect').value = '';

    applyFilters();
}

// Toggle filters (mobile)
function toggleFilters() {
    document.getElementById('filtersSidebar').classList.toggle('active');
}

// Update cart count
function updateCartCount() {
    const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}
