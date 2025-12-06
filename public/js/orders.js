// Orders Page JavaScript

document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is logged in
    if (!auth.requireAuth()) {
        return;
    }

    // Check for success message
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
        const orderNumber = urlParams.get('orderId');
        document.getElementById('successMessage').innerHTML = `
            <div class="success-message">
                <i class="fas fa-check-circle"></i>
                <div>
                    <strong>Order placed successfully!</strong>
                    <p style="margin: 4px 0 0;">Order Number: ${orderNumber}</p>
                </div>
            </div>
        `;
    }

    await loadOrders();
    updateCartCount();
});

async function loadOrders() {
    try {
        const data = await api.orders.getMyOrders();
        displayOrders(data.orders || []);
    } catch (error) {
        console.error('Error loading orders:', error);
        document.getElementById('ordersContainer').innerHTML = `
            <div class="empty-orders">
                <i class="fas fa-exclamation-circle"></i>
                <h2>Error loading orders</h2>
                <p>${error.message}</p>
            </div>
        `;
    }
}

function displayOrders(orders) {
    const container = document.getElementById('ordersContainer');

    if (orders.length === 0) {
        container.innerHTML = `
            <div class="empty-orders">
                <i class="fas fa-shopping-bag"></i>
                <h2>No orders yet</h2>
                <p>Start shopping to see your orders here</p>
                <a href="/shop.html" class="btn btn-primary" style="margin-top: 24px;">Start Shopping</a>
            </div>
        `;
        return;
    }

    container.innerHTML = orders.map(order => {
        const statusClass = `status-${order.status}`;
        const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        return `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <div class="order-number">Order #${order.orderNumber}</div>
                        <small style="color: var(--text-light);">${orderDate}</small>
                    </div>
                    <span class="order-status ${statusClass}">
                        ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                </div>

                <div class="order-items">
                    ${order.items.map(item => `
                        <div class="order-item">
                            <div class="order-item-image">
                                <img src="${item.image}" alt="${item.name}">
                            </div>
                            <div class="order-item-details">
                                <h4>${item.name}</h4>
                                <p>Size: ${item.size} | Color: ${item.color}</p>
                                <p>Quantity: ${item.quantity} × $${item.price.toFixed(2)}</p>
                            </div>
                            <div style="font-weight: 600;">
                                $${(item.quantity * item.price).toFixed(2)}
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="order-footer">
                    <div>
                        <strong>Shipping Address:</strong>
                        <p style="font-size: 14px; color: var(--text-light); margin-top: 4px;">
                            ${order.shippingAddress.street}, ${order.shippingAddress.city}<br>
                            ${order.shippingAddress.state} ${order.shippingAddress.zipCode}
                        </p>
                    </div>
                    <div class="order-total">
                        Total: $${order.totalAmount.toFixed(2)}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function updateCartCount() {
    const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}
