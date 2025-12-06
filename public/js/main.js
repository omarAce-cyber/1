// Main JavaScript for NFR Store

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });
    }

    // Hero Slider
    initHeroSlider();

    // Load Featured Products
    loadFeaturedProducts();

    // Newsletter Form
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = e.target.querySelector('input').value;
            alert(`Thank you for subscribing with ${email}!`);
            e.target.reset();
        });
    }
});

// Hero Slider
function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    const prevBtn = document.querySelector('.hero-prev');
    const nextBtn = document.querySelector('.hero-next');
    
    if (slides.length === 0) return;

    let currentSlide = 0;
    const slideCount = slides.length;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        slides[index].classList.add('active');
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slideCount;
        showSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + slideCount) % slideCount;
        showSlide(currentSlide);
    }

    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);

    // Auto slide every 5 seconds
    setInterval(nextSlide, 5000);
}

// Load Featured Products
async function loadFeaturedProducts() {
    const container = document.getElementById('featuredProducts');
    if (!container) return;

    try {
        const data = await api.products.getAll({ featured: 'true' });
        
        if (data.products && data.products.length > 0) {
            container.innerHTML = data.products.map(product => createProductCard(product)).join('');
        } else {
            container.innerHTML = '<p class="loading">No featured products available</p>';
        }
    } catch (error) {
        console.error('Error loading featured products:', error);
        container.innerHTML = '<p class="loading">Error loading products</p>';
    }
}

// Create Product Card HTML
function createProductCard(product) {
    const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
    const imageUrl = primaryImage ? primaryImage.url : '/img/placeholder.jpg';
    const discount = product.comparePrice ? 
        Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) : 0;

    return `
        <div class="product-card" onclick="window.location.href='/product.html?id=${product._id}'">
            <div class="product-image">
                <img src="${imageUrl}" alt="${product.name}" loading="lazy">
                ${discount > 0 ? `<span class="product-badge">-${discount}%</span>` : ''}
                ${product.totalStock <= 5 ? '<span class="product-badge" style="background:#ffc107">Low Stock</span>' : ''}
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">
                    <span>$${product.price.toFixed(2)}</span>
                    ${product.comparePrice ? `<span class="product-price-old">$${product.comparePrice.toFixed(2)}</span>` : ''}
                </div>
            </div>
        </div>
    `;
}

// Format Price
function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(price);
}

// Format Date
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Show Alert
function showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    // Add styles if not already added
    if (!document.getElementById('alert-styles')) {
        const style = document.createElement('style');
        style.id = 'alert-styles';
        style.textContent = `
            .alert {
                position: fixed;
                top: 90px;
                right: 20px;
                padding: 16px 24px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                z-index: 10000;
                animation: slideIn 0.3s ease;
                max-width: 400px;
            }
            .alert-success { background: #28a745; color: white; }
            .alert-error { background: #dc3545; color: white; }
            .alert-warning { background: #ffc107; color: #333; }
            .alert-info { background: #17a2b8; color: white; }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(alert);

    setTimeout(() => {
        alert.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => alert.remove(), 300);
    }, 3000);
}

// Export utilities
window.utils = {
    formatPrice,
    formatDate,
    showAlert,
    createProductCard
};
