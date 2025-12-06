// Cart Management
class Cart {
    constructor() {
        this.items = this.load();
        this.updateCount();
    }

    // Get cart key based on logged-in user
    getCartKey() {
        if (auth.isLoggedIn() && auth.user) {
            return `cart_${auth.user._id}`;
        }
        return 'cart_guest'; // Guest cart
    }

    load() {
        const cartKey = this.getCartKey();
        const cart = localStorage.getItem(cartKey);
        return cart ? JSON.parse(cart) : [];
    }

    save() {
        const cartKey = this.getCartKey();
        localStorage.setItem(cartKey, JSON.stringify(this.items));
        this.updateCount();
        this.dispatchUpdate();
    }

    add(product, size, color, quantity = 1) {
        // Require login for cart
        if (!auth.isLoggedIn()) {
            if (typeof toast !== 'undefined') {
                toast.warning('Please login to add items to your cart', 'Login Required');
            }
            setTimeout(() => {
                window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname);
            }, 1500);
            return;
        }

        const existingItem = this.items.find(
            item => item.product._id === product._id && 
                    item.size === size && 
                    item.color === color
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                product,
                size,
                color,
                quantity
            });
        }

        this.save();
        this.showNotification('Product added to cart!');
    }

    remove(productId, size, color) {
        this.items = this.items.filter(
            item => !(item.product._id === productId && 
                     item.size === size && 
                     item.color === color)
        );
        this.save();
    }

    update(productId, size, color, quantity) {
        const item = this.items.find(
            item => item.product._id === productId && 
                    item.size === size && 
                    item.color === color
        );

        if (item) {
            item.quantity = quantity;
            if (item.quantity <= 0) {
                this.remove(productId, size, color);
            } else {
                this.save();
            }
        }
    }

    clear() {
        this.items = [];
        this.save();
    }

    getTotal() {
        return this.items.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0);
    }

    getItems() {
        return this.items;
    }

    getFormattedTotal() {
        return this.getTotal().toFixed(2);
    }

    getCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }

    updateCount() {
        const cartCount = document.querySelectorAll('.cart-count');
        const count = this.getCount();
        
        cartCount.forEach(el => {
            el.textContent = count;
            el.style.display = count > 0 ? 'flex' : 'none';
        });
    }

    dispatchUpdate() {
        window.dispatchEvent(new CustomEvent('cartUpdated'));
    }

    showNotification(message) {
        if (typeof toast !== 'undefined') {
            toast.success(message);
            return;
        }
        
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize cart
const cart = new Cart();

// Update cart count on page load and cart updates
function updateCartCount() {
    cart.updateCount();
}

// Listen for cart updates
window.addEventListener('cartUpdated', updateCartCount);

// Update count on page load
document.addEventListener('DOMContentLoaded', updateCartCount);

// Reload cart when auth state changes (login/logout)
window.addEventListener('authStateChanged', () => {
    // Reload cart items from storage based on new auth state
    cart.items = cart.load();
    cart.updateCount();
    
    // Trigger cart update event to refresh any displays
    cart.dispatchUpdate();
});

