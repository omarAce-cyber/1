// Authentication Management
class Auth {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = this.getUser();
        this.initializeUI();
    }

    getUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    isLoggedIn() {
        return !!this.token && !!this.user;
    }

    isAdmin() {
        return this.isLoggedIn() && this.user.role === 'admin';
    }

    async login(email, password) {
        try {
            const data = await api.auth.login({ email, password });
            
            this.token = data.token;
            this.user = data.user;
            
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            this.initializeUI();
            
            // Dispatch event after login
            window.dispatchEvent(new CustomEvent('authStateChanged', { 
                detail: { isLoggedIn: true, user: data.user } 
            }));
            
            return { success: true, user: data.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async register(userData) {
        try {
            const data = await api.auth.register(userData);
            
            this.token = data.token;
            this.user = data.user;
            
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            this.initializeUI();
            return { success: true, user: data.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    logout() {
        this.token = null;
        this.user = null;
        
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Dispatch event before logout redirect
        window.dispatchEvent(new CustomEvent('authStateChanged', { 
            detail: { isLoggedIn: false, user: null } 
        }));
        
        window.location.href = '/';
    }

    initializeUI() {
        const userBtn = document.getElementById('userBtn');
        const userDropdown = document.getElementById('userDropdown');
        const userInfo = document.getElementById('userInfo');
        const dropdownLinks = document.getElementById('dropdownLinks');

        if (!userBtn || !userDropdown) return;

        // Toggle dropdown
        userBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!userDropdown.contains(e.target) && e.target !== userBtn) {
                userDropdown.classList.remove('show');
            }
        });

        // Update dropdown content
        if (this.isLoggedIn()) {
            userInfo.innerHTML = `
                <div class="user-name">${this.user.name}</div>
                <div class="user-email">${this.user.email}</div>
            `;

            const links = this.isAdmin() 
                ? `
                    <a href="/admin" class="dropdown-link">
                        <i class="fas fa-dashboard"></i> Admin Dashboard
                    </a>
                    <a href="/orders.html" class="dropdown-link">
                        <i class="fas fa-shopping-bag"></i> My Orders
                    </a>
                    <a href="/profile.html" class="dropdown-link">
                        <i class="fas fa-user"></i> Profile
                    </a>
                    <a href="#" id="logoutBtn" class="dropdown-link">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </a>
                `
                : `
                    <a href="/orders.html" class="dropdown-link">
                        <i class="fas fa-shopping-bag"></i> My Orders
                    </a>
                    <a href="/profile.html" class="dropdown-link">
                        <i class="fas fa-user"></i> Profile
                    </a>
                    <a href="#" id="logoutBtn" class="dropdown-link">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </a>
                `;

            dropdownLinks.innerHTML = links;

            // Logout button
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.logout();
                });
            }
        } else {
            userInfo.innerHTML = '<div class="user-name">Welcome, Guest</div>';
            dropdownLinks.innerHTML = `
                <a href="/login.html" class="dropdown-link">
                    <i class="fas fa-sign-in-alt"></i> Login
                </a>
                <a href="/register.html" class="dropdown-link">
                    <i class="fas fa-user-plus"></i> Register
                </a>
            `;
        }
        
        // Trigger auth state change event
        window.dispatchEvent(new CustomEvent('authStateChanged', { 
            detail: { isLoggedIn: this.isLoggedIn(), user: this.user } 
        }));
    }

    requireAuth(redirectToLogin = true) {
        if (!this.isLoggedIn()) {
            if (redirectToLogin) {
                window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname);
            }
            return false;
        }
        return true;
    }

    requireAdmin() {
        if (!this.isAdmin()) {
            window.location.href = '/';
            return false;
        }
        return true;
    }
}

// Initialize auth
const auth = new Auth();
window.auth = auth;