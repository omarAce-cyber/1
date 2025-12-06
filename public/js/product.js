// Product Detail Page JavaScript

let currentProduct = null;
let selectedSize = null;
let selectedColor = null;
let quantity = 1;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        window.location.href = '/shop.html';
        return;
    }

    await loadProduct(productId);
    updateCartCount();
});

// Add to Cart
addToCartBtn.addEventListener('click', () => {
    // Require login
    if (!auth.isLoggedIn()) {
        toast.warning('Please login to add items to your cart', 'Login Required');
        setTimeout(() => {
            window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.href);
        }, 1500);
        return;
    }

    if (!selectedSize) {
        toast.warning('Please select a size', 'Size Required');
        return;
    }

    if (!selectedColor) {
        toast.warning('Please select a color', 'Color Required');
        return;
    }

    cart.add(currentProduct, selectedSize, selectedColor, quantity);
    toast.success(`${currentProduct.name} added to your cart!`, 'Added to Cart');
});

// Load product
async function loadProduct(productId) {
    try {
        const data = await api.products.getById(productId);
        currentProduct = data.product;
        
        displayProduct();
        loadRelatedProducts();
        
    } catch (error) {
        console.error('Error loading product:', error);
        document.getElementById('productDetail').innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Product not found</h3>
                <p>${error.message}</p>
                <a href="/shop.html" class="btn btn-primary">Back to Shop</a>
            </div>
        `;
    }
}

// Display product
function displayProduct() {
    const breadcrumb = document.getElementById('breadcrumbProduct');
    breadcrumb.textContent = currentProduct.name;

    const hasDiscount = currentProduct.comparePrice && currentProduct.comparePrice > currentProduct.price;
    const discount = hasDiscount ? Math.round(((currentProduct.comparePrice - currentProduct.price) / currentProduct.comparePrice) * 100) : 0;

    // Get total stock
    const totalStock = currentProduct.sizes.reduce((sum, size) => sum + size.stock, 0);
    const stockStatus = totalStock === 0 ? 'out-of-stock' : totalStock <= 5 ? 'low-stock' : 'in-stock';
    const stockText = totalStock === 0 ? 'Out of Stock' : totalStock <= 5 ? `Only ${totalStock} left in stock` : 'In Stock';

    const detailHTML = `
        <div class="product-gallery">
            <div class="main-image" id="mainImage">
                <img src="${currentProduct.images[0]?.url}" alt="${currentProduct.name}">
            </div>
            <div class="thumbnail-images">
                ${currentProduct.images.map((img, index) => `
                    <div class="thumbnail ${index === 0 ? 'active' : ''}" onclick="changeImage(${index})">
                        <img src="${img.url}" alt="${currentProduct.name}">
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="product-info">
            ${currentProduct.featured ? '<span class="product-badge">Featured</span>' : ''}
            
            <h1 class="product-title">${currentProduct.name}</h1>
            <div class="product-category">${currentProduct.category}</div>

            <div class="product-price">
                <span class="price-current">$${currentProduct.price.toFixed(2)}</span>
                ${hasDiscount ? `
                    <span class="price-original">$${currentProduct.comparePrice.toFixed(2)}</span>
                    <span class="discount-badge">-${discount}%</span>
                ` : ''}
            </div>

            <div class="stock-status ${stockStatus}">
                <i class="fas ${stockStatus === 'in-stock' ? 'fa-check-circle' : stockStatus === 'low-stock' ? 'fa-exclamation-triangle' : 'fa-times-circle'}"></i>
                <span>${stockText}</span>
            </div>

            <div class="product-description">
                <p>${currentProduct.description}</p>
            </div>

            <div class="product-options">
                <!-- Size Selection -->
                <div class="option-group">
                    <label class="option-label">Select Size:</label>
                    <div class="size-options">
                        ${currentProduct.sizes.map(size => `
                            <div class="size-option ${size.stock === 0 ? 'out-of-stock' : ''}" 
                                 onclick="selectSize('${size.name}', ${size.stock})"
                                 id="size-${size.name}">
                                ${size.name}
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Color Selection -->
                ${currentProduct.colors && currentProduct.colors.length > 0 ? `
                    <div class="option-group">
                        <label class="option-label">Select Color:</label>
                        <div class="color-options">
                            ${currentProduct.colors.map(color => `
                                <div class="color-option" 
                                     style="background-color: ${color.hexCode}"
                                     onclick="selectColor('${color.name}')"
                                     id="color-${color.name.replace(/\s+/g, '-')}"
                                     title="${color.name}">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- Quantity -->
                <div class="option-group quantity-group">
                    <label class="option-label">Quantity:</label>
                    <div class="quantity-selector">
                        <button class="quantity-btn" onclick="decreaseQuantity()">
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" class="quantity-input" id="quantityInput" value="1" min="1" readonly>
                        <button class="quantity-btn" onclick="increaseQuantity()">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div class="product-actions">
                <button class="btn-add-cart" onclick="addToCart()" ${totalStock === 0 ? 'disabled' : ''}>
                    <i class="fas fa-shopping-cart"></i>
                    Add to Cart
                </button>
                <button class="btn-buy-now" onclick="buyNow()" ${totalStock === 0 ? 'disabled' : ''}>
                    <i class="fas fa-bolt"></i>
                    Buy Now
                </button>
            </div>

            <div class="product-details">
                <div class="detail-item">
                    <span class="detail-label">SKU:</span>
                    <span class="detail-value">${currentProduct._id}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Category:</span>
                    <span class="detail-value">${currentProduct.category}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Availability:</span>
                    <span class="detail-value">${stockText}</span>
                </div>
                ${currentProduct.tags && currentProduct.tags.length > 0 ? `
                    <div class="detail-item">
                        <span class="detail-label">Tags:</span>
                        <span class="detail-value">${currentProduct.tags.join(', ')}</span>
                    </div>
                ` : ''}
            </div>
        </div>
    `;

    document.getElementById('productDetail').innerHTML = detailHTML;

    // Auto-select first available size and color
    const firstAvailableSize = currentProduct.sizes.find(s => s.stock > 0);
    if (firstAvailableSize) {
        selectSize(firstAvailableSize.name, firstAvailableSize.stock);
    }

    if (currentProduct.colors && currentProduct.colors.length > 0) {
        selectColor(currentProduct.colors[0].name);
    }
}

// Change main image
function changeImage(index) {
    const mainImage = document.querySelector('#mainImage img');
    mainImage.src = currentProduct.images[index].url;

    // Update active thumbnail
    document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
}

// Select size
function selectSize(size, stock) {
    if (stock === 0) return;

    selectedSize = size;
    
    document.querySelectorAll('.size-option').forEach(el => {
        el.classList.remove('active');
    });
    document.getElementById(`size-${size}`).classList.add('active');
}

// Select color
function selectColor(color) {
    selectedColor = color;
    
    document.querySelectorAll('.color-option').forEach(el => {
        el.classList.remove('active');
    });
    document.getElementById(`color-${color.replace(/\s+/g, '-')}`).classList.add('active');
}

// Quantity controls
function increaseQuantity() {
    const input = document.getElementById('quantityInput');
    quantity = parseInt(input.value) + 1;
    input.value = quantity;
}

function decreaseQuantity() {
    const input = document.getElementById('quantityInput');
    if (quantity > 1) {
        quantity = parseInt(input.value) - 1;
        input.value = quantity;
    }
}

// Add to cart
function addToCart() {
    if (!selectedSize) {
        alert('Please select a size');
        return;
    }

    if (currentProduct.colors && currentProduct.colors.length > 0 && !selectedColor) {
        alert('Please select a color');
        return;
    }

    cart.add(currentProduct, selectedSize, selectedColor || 'Default', quantity);
    updateCartCount();
    
    // Show success message
    alert('Product added to cart!');
}

// Buy now
function buyNow() {
    if (!selectedSize) {
        alert('Please select a size');
        return;
    }

    if (currentProduct.colors && currentProduct.colors.length > 0 && !selectedColor) {
        alert('Please select a color');
        return;
    }

    cart.add(currentProduct, selectedSize, selectedColor || 'Default', quantity);
    window.location.href = '/checkout.html';
}

// Load related products
async function loadRelatedProducts() {
    try {
        const data = await api.products.getAll(`?category=${currentProduct.category}&limit=4`);
        const relatedProducts = data.products.filter(p => p._id !== currentProduct._id).slice(0, 4);

        if (relatedProducts.length === 0) return;

        const html = relatedProducts.map(product => {
            const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
            const hasDiscount = product.comparePrice && product.comparePrice > product.price;

            return `
                <div class="product-card" onclick="window.location.href='/product.html?id=${product._id}'">
                    <div class="product-image">
                        <img src="${primaryImage?.url}" alt="${product.name}">
                    </div>
                    <div class="product-info">
                        <div class="product-category">${product.category}</div>
                        <h3 class="product-name">${product.name}</h3>
                        <div class="product-price">
                            <span class="price-current">$${product.price.toFixed(2)}</span>
                            ${hasDiscount ? `<span class="price-original">$${product.comparePrice.toFixed(2)}</span>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        document.getElementById('relatedProducts').innerHTML = html;

    } catch (error) {
        console.error('Error loading related products:', error);
    }
}

// Update cart count
function updateCartCount() {
    const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}
