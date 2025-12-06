// Admin Dashboard JavaScript

// تأكد من وجود auth و api قبل الاستخدام
if (typeof auth === 'undefined' || typeof api === 'undefined') {
    console.error('Auth or API objects are not defined.');
    alert('خطأ في تهيئة النظام. حاول إعادة تحميل الصفحة.');
} else {
    // Check authentication immediately
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
        window.location.href = '/admin.html';  // صفحة تسجيل الدخول
    } else {
        const user = JSON.parse(userStr);
        if (user.role !== 'admin') {
            alert('Access denied. Admin privileges required.');
            window.location.href = '/';
        }
    }
}

let currentProducts = [];
let currentOrders = [];
let currentUsers = [];
let editingProductId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (!auth.requireAuth()) return;
    if (!auth.requireAdmin()) return;

    // Display admin name
    const adminNameElem = document.getElementById('adminName');
    if (adminNameElem) {
        adminNameElem.textContent = auth.user.name;
    }

    // Initialize navigation
    initNavigation();

    // Load dashboard data
    loadDashboard();

    // Setup event listeners
    setupEventListeners();

    // Logout button handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            auth.logout();
        });
    }
});

// Navigation
function initNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    const sections = document.querySelectorAll('.admin-section');

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            const sectionName = item.dataset.section;
            
            // Update active menu item
            menuItems.forEach(mi => mi.classList.remove('active'));
            item.classList.add('active');
            
            // Show corresponding section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === `${sectionName}-section`) {
                    section.classList.add('active');
                }
            });

            // Load section data
            switch(sectionName) {
                case 'dashboard':
                    loadDashboard();
                    break;
                case 'products':
                    loadProducts();
                    break;
                case 'orders':
                    loadOrders();
                    break;
                case 'users':
                    loadUsers();
                    break;
            }
        });
    });

    // View all links in dashboard
    document.querySelectorAll('.view-all').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionName = link.dataset.section;
            const menuItem = document.querySelector(`[data-section="${sectionName}"]`);
            if (menuItem) menuItem.click();
        });
    });
}

// Setup Event Listeners
function setupEventListeners() {
    // Product form
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmit);
    }

    // Product images
    const productImages = document.getElementById('productImages');
    if (productImages) {
        productImages.addEventListener('change', handleImagePreview);
    }

    // Size checkboxes
    document.querySelectorAll('.size-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const size = this.value;
            const stockInput = document.querySelector(`.stock-input[data-size="${size}"]`);
            if(stockInput){
                stockInput.disabled = !this.checked;
                if (!this.checked) stockInput.value = 0;
            }
        });
    });

    // Order status filter
    const orderStatusFilter = document.getElementById('orderStatusFilter');
    if (orderStatusFilter) {
        orderStatusFilter.addEventListener('change', (e) => {
            loadOrders(e.target.value);
        });
    }
}

// Load Dashboard
async function loadDashboard() {
    try {
        const data = await api.request('/admin/dashboard');
        
        if(!data.stats) throw new Error('Invalid dashboard data');

        // Update stats
        document.getElementById('totalProducts').textContent = data.stats.totalProducts || 0;
        document.getElementById('totalOrders').textContent = data.stats.totalOrders || 0;
        document.getElementById('totalUsers').textContent = data.stats.totalUsers || 0;
        document.getElementById('pendingOrders').textContent = data.stats.pendingOrders || 0;
        document.getElementById('processingOrders').textContent = data.stats.processingOrders || 0;
        document.getElementById('totalRevenue').textContent = `$${(data.stats.totalRevenue || 0).toFixed(2)}`;

        // Display recent orders
        displayRecentOrders(data.recentOrders || []);

        // Display low stock products
        displayLowStockProducts(data.lowStockProducts || []);

    } catch (error) {
        console.error('Error loading dashboard:', error);
        showToast('Error loading dashboard data', 'error');
    }
}

// Display Recent Orders
function displayRecentOrders(orders) {
    const container = document.getElementById('recentOrders');
    
    if (!orders || orders.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No recent orders</p></div>';
        return;
    }

    container.innerHTML = orders.map(order => `
        <div class="order-item">
            <div class="order-info">
                <div class="order-number">#${order.orderNumber}</div>
                <div class="order-customer">${order.user?.name || 'Guest'}</div>
            </div>
            <div>
                <span class="status-badge status-${order.status}">${order.status}</span>
            </div>
            <div class="order-amount">$${order.totalAmount.toFixed(2)}</div>
        </div>
    `).join('');
}

// Display Low Stock Products
function displayLowStockProducts(products) {
    const container = document.getElementById('lowStockProducts');
    
    if (!products || products.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>All products are well stocked!</p></div>';
        return;
    }

    container.innerHTML = products.map(product => `
        <div class="stock-item">
            <div class="stock-info">
                <div class="product-name">${product.name}</div>
                <div class="stock-level">Stock: ${product.totalStock} units</div>
            </div>
            <button onclick="editProduct('${product._id}')" class="btn-icon" title="Edit product">
                <i class="fas fa-edit"></i>
            </button>
        </div>
    `).join('');
}

// Load Products
async function loadProducts() {
    try {
        const data = await api.admin.getProducts();
        currentProducts = data.products || [];
        displayProducts(currentProducts);
    } catch (error) {
        console.error('Failed to load products:', error);
        showToast('Failed to load products', 'error');
    }
}

// Display Products
function displayProducts(products) {
    const tbody = document.getElementById('productsTableBody');
    
    if (!products || products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-state">No products found</td></tr>';
        return;
    }

    tbody.innerHTML = products.map(product => {
        const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0] || {};
        const totalStock = product.sizes?.reduce((sum, size) => sum + (size.stock || 0), 0) || 0;
        
        return `
            <tr>
                <td>
                    <img src="${primaryImage.url || '/images/placeholder.jpg'}" 
                         alt="${product.name}" 
                         class="product-image">
                </td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>$${product.price?.toFixed(2) || 0}</td>
                <td>${totalStock}</td>
                <td>
                    <span class="status-badge status-${product.isActive ? 'active' : 'inactive'}">
                        ${product.isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                    ${product.featured ? '<span class="featured-badge"><i class="fas fa-star"></i> Featured</span>' : '-'}
                </td>
                <td>
                    <div class="action-buttons">
                        <button onclick="editProduct('${product._id}')" class="btn-icon" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteProduct('${product._id}')" class="btn-icon-danger" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Show Add Product Modal
function showAddProductModal() {
    editingProductId = null;
    document.getElementById('productModalTitle').textContent = 'Add New Product';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('imagePreviewContainer').innerHTML = '';
    document.getElementById('existingImagesContainer').innerHTML = '';
    
    // Reset colors
    document.getElementById('colorsContainer').innerHTML = `
        <div class="color-input-row">
            <input type="text" class="form-control color-name" placeholder="Color Name (e.g., Black)">
            <input type="color" class="form-control color-picker" value="#000000">
            <button type="button" onclick="removeColorRow(this)" class="btn-icon-danger">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    // Uncheck all sizes and disable stock inputs
    document.querySelectorAll('.size-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    document.querySelectorAll('.stock-input').forEach(input => {
        input.disabled = true;
        input.value = 0;
    });
    
    document.getElementById('productModal').classList.add('show');
}

// Edit Product
async function editProduct(productId) {
    try {
        const product = currentProducts.find(p => p._id === productId);
        if (!product) {
            showToast('Product not found', 'error');
            return;
        }

        editingProductId = productId;
        document.getElementById('productModalTitle').textContent = 'Edit Product';
        document.getElementById('productId').value = productId;
        
        // Fill form fields
        document.getElementById('productName').value = product.name || '';
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productPrice').value = product.price || 0;
        document.getElementById('productComparePrice').value = product.comparePrice || '';
        document.getElementById('productCategory').value = product.category || '';
        document.getElementById('productFeatured').checked = product.featured || false;
        document.getElementById('productTags').value = (product.tags || []).join(', ');

        // Sizes
        document.querySelectorAll('.size-checkbox').forEach(checkbox => {
            const sizeObj = product.sizes?.find(s => s.name === checkbox.value);
            checkbox.checked = !!sizeObj;
            const stockInput = document.querySelector(`.stock-input[data-size="${checkbox.value}"]`);
            if(stockInput){
                stockInput.disabled = !sizeObj;
                stockInput.value = sizeObj?.stock || 0;
            }
        });

        // Colors
        const colorsContainer = document.getElementById('colorsContainer');
        colorsContainer.innerHTML = (product.colors || []).map(color => `
            <div class="color-input-row">
                <input type="text" class="form-control color-name" value="${color.name}">
                <input type="color" class="form-control color-picker" value="${color.hexCode}">
                <button type="button" onclick="removeColorRow(this)" class="btn-icon-danger">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        // Existing images
        const existingContainer = document.getElementById('existingImagesContainer');
        existingContainer.innerHTML = (product.images || []).map(img => `
            <div class="image-preview-item" data-url="${img.url}">
                <img src="${img.url}" alt="Product Image">
                <button type="button" onclick="removeExistingImage('${img.url}')" class="remove-image-btn" title="Remove Image">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        // Clear new image previews
        document.getElementById('imagePreviewContainer').innerHTML = '';
        document.getElementById('productModal').classList.add('show');

    } catch (error) {
        console.error('Error loading product:', error);
        showToast('Error loading product', 'error');
    }
}

// Handle Product Submit
async function handleProductSubmit(e) {
    e.preventDefault();

    try {
        const formData = new FormData();

        // Basic fields
        formData.append('name', document.getElementById('productName').value.trim());
        formData.append('description', document.getElementById('productDescription').value.trim());
        formData.append('price', document.getElementById('productPrice').value.trim());
        formData.append('comparePrice', document.getElementById('productComparePrice').value.trim() || '');
        formData.append('category', document.getElementById('productCategory').value.trim());
        formData.append('featured', document.getElementById('productFeatured').checked);

        // Tags
        const tags = document.getElementById('productTags').value
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag);
        formData.append('tags', JSON.stringify(tags));

        // Sizes
        const sizes = [];
        document.querySelectorAll('.size-checkbox:checked').forEach(checkbox => {
            const size = checkbox.value;
            const stock = parseInt(document.querySelector(`.stock-input[data-size="${size}"]`).value) || 0;
            sizes.push({ name: size, stock });
        });
        formData.append('sizes', JSON.stringify(sizes));

        // Colors
        const colors = [];
        document.querySelectorAll('.color-input-row').forEach(row => {
            const name = row.querySelector('.color-name').value.trim();
            const hexCode = row.querySelector('.color-picker').value;
            if (name) colors.push({ name, hexCode });
        });
        formData.append('colors', JSON.stringify(colors));

        // New images
        const imageFiles = document.getElementById('productImages').files;
        for (let i = 0; i < imageFiles.length; i++) {
            formData.append('images', imageFiles[i]);
        }

        // Existing images (edit mode)
        if (editingProductId) {
            const existingImages = [];
            document.querySelectorAll('#existingImagesContainer .image-preview-item').forEach(item => {
                existingImages.push({
                    url: item.dataset.url,
                    isPrimary: false
                });
            });
            if (existingImages.length > 0) {
                existingImages[0].isPrimary = true;
            }
            formData.append('existingImages', JSON.stringify(existingImages));
        }

        // Submit
        let url = `${window.location.origin}/api/admin/products`;
        let method = 'POST';

        if (editingProductId) {
            url += `/${editingProductId}`;
            method = 'PUT';
        }

        const response = await fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${auth.token}`
            },
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            showToast(data.message || 'Operation successful', 'success');
            closeProductModal();
            loadProducts();
        } else {
            showToast(data.message || 'Error saving product', 'error');
        }

    } catch (error) {
        console.error('Error submitting product:', error);
        showToast('Error saving product', 'error');
    }
}

// Delete Product
async function deleteProduct(productId) {
    if (!confirm('Delete this product?')) return;

    try {
        await api.admin.deleteProduct(productId);
        showToast('Product deleted successfully', 'success');
        await loadProducts();
    } catch (error) {
        console.error('Delete product error:', error);
        showToast(error.message || 'Delete failed', 'error');
    }
}

// Close Product Modal
function closeProductModal() {
    document.getElementById('productModal').classList.remove('show');
}

// Add Color Row
function addColorRow() {
    const container = document.getElementById('colorsContainer');
    const row = document.createElement('div');
    row.className = 'color-input-row';
    row.innerHTML = `
        <input type="text" class="form-control color-name" placeholder="Color Name">
        <input type="color" class="form-control color-picker" value="#000000">
        <button type="button" onclick="removeColorRow(this)" class="btn-icon-danger" title="Remove Color">
            <i class="fas fa-trash"></i>
        </button>
    `;
    container.appendChild(row);
}

// Remove Color Row
function removeColorRow(button) {
    button.closest('.color-input-row').remove();
}

// Remove Existing Image
function removeExistingImage(url) {
    const item = document.querySelector(`[data-url="${url}"]`);
    if (item) item.remove();
}

// Handle Image Preview
function handleImagePreview(e) {
    const container = document.getElementById('imagePreviewContainer');
    container.innerHTML = '';

    Array.from(e.target.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const div = document.createElement('div');
            div.className = 'image-preview-item';
            div.innerHTML = `<img src="${event.target.result}" alt="Preview Image">`;
            container.appendChild(div);
        };
        reader.readAsDataURL(file);
    });
}
// Load Orders
async function loadOrders(status = '') {
    try {
        let endpoint = '/admin/orders';
        if (status) {
            endpoint += `?status=${encodeURIComponent(status)}`;
        }

        const data = await api.request(endpoint);
        currentOrders = data.orders || [];
        displayOrders(currentOrders);

    } catch (error) {
        console.error('Failed to load orders:', error);
        showToast('Failed to load orders', 'error');
    }
}

// Display Orders
function displayOrders(orders) {
    const tbody = document.getElementById('ordersTableBody');

    if (!orders || orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No orders found</td></tr>';
        return;
    }

    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>#${order.orderNumber}</td>
            <td>${order.user?.name || 'Guest'}</td>
            <td>${new Date(order.createdAt).toLocaleString()}</td>
            <td>${order.paymentMethod || '-'}</td>
            <td><span class="status-badge status-${order.status}">${order.status}</span></td>
            <td>$${order.totalAmount.toFixed(2)}</td>
            <td>
                <button class="btn-icon" onclick="viewOrderDetails('${order._id}')" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// View Order Details (example implementation)
async function viewOrderDetails(orderId) {
    try {
        const data = await api.request(`/admin/orders/${orderId}`);
        if (!data.order) throw new Error('Order not found');

        // Show order details modal or section
        const modal = document.getElementById('orderDetailsModal');
        if (!modal) return;

        // Populate modal fields
        modal.querySelector('.order-number').textContent = `Order #${data.order.orderNumber}`;
        modal.querySelector('.customer-name').textContent = data.order.user?.name || 'Guest';
        modal.querySelector('.order-status').textContent = data.order.status;
        modal.querySelector('.order-date').textContent = new Date(data.order.createdAt).toLocaleString();
        modal.querySelector('.order-total').textContent = `$${data.order.totalAmount.toFixed(2)}`;

        // List products
        const productsList = modal.querySelector('.order-products-list');
        productsList.innerHTML = data.order.products.map(p => `
            <li>
                ${p.name} - Qty: ${p.quantity} - $${(p.price * p.quantity).toFixed(2)}
            </li>
        `).join('');

        modal.classList.add('show');

    } catch (error) {
        console.error('Error fetching order details:', error);
        showToast('Failed to load order details', 'error');
    }
}

// Close Order Details Modal
function closeOrderDetailsModal() {
    const modal = document.getElementById('orderDetailsModal');
    if (modal) modal.classList.remove('show');
}

// Load Users
async function loadUsers() {
    try {
        const data = await api.request('/admin/users');
        currentUsers = data.users || [];
        displayUsers(currentUsers);
    } catch (error) {
        console.error('Failed to load users:', error);
        showToast('Failed to load users', 'error');
    }
}

// Display Users
function displayUsers(users) {
    const tbody = document.getElementById('usersTableBody');

    if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No users found</td></tr>';
        return;
    }

    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            <td>
                <button onclick="editUser('${user._id}')" class="btn-icon" title="Edit User">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteUser('${user._id}')" class="btn-icon-danger" title="Delete User">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Edit User (example stub)
function editUser(userId) {
    // You can implement this based on your app's UI/modal structure
    alert(`Edit user ${userId} - implement modal or form`);
}

// Delete User
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
        await api.request(`/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        });
        showToast('User deleted successfully', 'success');
        loadUsers();
    } catch (error) {
        console.error('Delete user error:', error);
        showToast('Failed to delete user', 'error');
    }
}

// Toast notification helper
function showToast(message, type = 'info') {
    // Implement your toast logic here, example:
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
