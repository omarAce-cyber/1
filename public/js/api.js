// API Base URL
const API_URL = window.location.origin + '/api';

// API Helper Functions
const api = {
    // Generic request handler
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                ...options,
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Auth endpoints
    auth: {
        async register(userData) {
            return await api.request('/auth/register', {
                method: 'POST',
                body: JSON.stringify(userData)
            });
        },

        async login(credentials) {
            return await api.request('/auth/login', {
                method: 'POST',
                body: JSON.stringify(credentials)
            });
        },

        async getMe() {
            return await api.request('/auth/me');
        },

        async updateProfile(userData) {
            return await api.request('/auth/profile', {
                method: 'PUT',
                body: JSON.stringify(userData)
            });
        },

        logout() {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
        }
    },

    // Products endpoints
    products: {
        async getAll(params = {}) {
            const query = new URLSearchParams(params).toString();
            return await api.request(`/products?${query}`);
        },

        async getById(id) {
            return await api.request(`/products/${id}`);
        },

        async getByCategory(category) {
            return await api.request(`/products/category/${category}`);
        }
    },

    // Orders endpoints
    orders: {
        async create(orderData) {
            return await api.request('/orders', {
                method: 'POST',
                body: JSON.stringify(orderData)
            });
        },

        async getAll() {
            return await api.request('/orders');
        },

        async getById(id) {
            return await api.request(`/orders/${id}`);
        },

        async generateWhatsApp(orderId) {
            return await api.request(`/orders/${orderId}/whatsapp`, {
                method: 'POST'
            });
        }
    },

    // Admin endpoints
    admin: {
        async getDashboard() {
            return await api.request('/admin/dashboard');
        },

        async getProducts() {
            return await api.request('/admin/products');
        },

        async createProduct(formData) {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/admin/products`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            return await response.json();
        },

        async updateProduct(id, formData) {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/admin/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            return await response.json();
        },

        async deleteProduct(id) {
            return await api.request(`/admin/products/${id}`, {
                method: 'DELETE'
            });
        },

        async getOrders(status) {
            const query = status ? `?status=${status}` : '';
            return await api.request(`/admin/orders${query}`);
        },

        async updateOrderStatus(id, status) {
            return await api.request(`/admin/orders/${id}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status })
            });
        },

        async getUsers() {
            return await api.request('/admin/users');
        }
    }
};

// Export for use in other files
window.api = api;
