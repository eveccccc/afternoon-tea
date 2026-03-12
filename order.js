/**
 * Afternoon Tea Ordering System - order.js (Member Portal)
 * - Session-based: Supports multiple dates and multiple vendors.
 * - Aggregate statistics in history.
 */

const memberApp = {
    vendors: [],
    sessions: [],
    orders: [],
    cart: [],
    selectedSession: null,
    selectedVendor: null,

    init() {
        this.loadData();
        this.renderSessions();
        this.renderMyOrders();
    },

    loadData() {
        this.vendors = JSON.parse(localStorage.getItem('teatime_vendors') || '[]');
        this.orders = JSON.parse(localStorage.getItem('teatime_orders') || '[]');
        this.sessions = JSON.parse(localStorage.getItem('teatime_sessions') || '[]');
    },

    renderSessions() {
        const container = document.getElementById('vendor-list');
        const openSessions = this.sessions.filter(s => s.status === 'open');

        if (openSessions.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1; padding: 3rem;">
                    <div style="font-size: 3rem;">😴</div>
                    <p>目前管理員尚未開放任何訂購活動。</p>
                </div>`;
            return;
        }

        container.innerHTML = openSessions.map(s => `
            <div class="vendor-card" style="border: 2px solid var(--accent-blue); padding: 1.5rem;">
                <div style="margin-bottom: 1rem;">
                    <h3 style="color: white; font-size: 1.3rem;">📅 ${s.date}</h3>
                    <p style="font-size: 0.8rem; color: var(--text-secondary);">包含 ${s.vendorIds.length} 個店家</p>
                </div>
                <div style="display: grid; gap: 0.5rem;">
                    ${s.vendorIds.map(vId => {
            const v = this.vendors.find(v => v.id === vId);
            if (!v) return '';
            return `
                            <button class="btn btn-primary" style="justify-content: space-between; width: 100%;" onclick="memberApp.startOrder(${s.id}, ${v.id})">
                                <span>${v.name} (${v.category})</span>
                                <span>→</span>
                            </button>
                        `;
        }).join('')}
                </div>
            </div>
        `).join('');
    },

    renderMyOrders() {
        const container = document.getElementById('my-orders-list');
        const myName = localStorage.getItem('teatime_last_member_name');
        if (!myName) return;

        const myHistory = this.orders.filter(o => o.member === myName).slice(0, 5);
        if (myHistory.length === 0) return;

        container.innerHTML = myHistory.map(o => `
            <div style="padding: 1rem; border-bottom: 1px solid var(--glass-border); display: flex; justify-content: space-between;">
                <div>
                    <strong>${o.vendorName}</strong>
                    <div style="font-size: 0.8rem; color: var(--text-secondary);">${o.items.map(i => i.name).join(', ')}</div>
                </div>
                <div style="font-size: 0.75rem; opacity: 0.6;">${o.date.split(' ')[0]}</div>
            </div>
        `).join('');
    },

    startOrder(sessionId, vendorId) {
        this.selectedSession = this.sessions.find(s => s.id === sessionId);
        this.selectedVendor = this.vendors.find(v => v.id === vendorId);

        document.getElementById('current-vendor-name').innerText = `${this.selectedSession.date} - ${this.selectedVendor.name}`;
        document.getElementById('step-select-vendor').classList.remove('active');
        document.getElementById('step-select-menu').classList.add('active');

        const lastName = localStorage.getItem('teatime_last_member_name');
        if (lastName) document.getElementById('member-name').value = lastName;

        this.renderMenu();
        this.updateCartUI();
        window.scrollTo(0, 0);
    },

    prevStep() {
        document.getElementById('step-select-vendor').classList.add('active');
        document.getElementById('step-select-menu').classList.remove('active');
        this.cart = [];
    },

    renderMenu() {
        const container = document.getElementById('menu-items-list');
        container.innerHTML = this.selectedVendor.menu.map((item, idx) => `
            <div class="menu-item">
                <div style="font-weight: 600;">${item.name}</div>
                <button class="btn btn-primary btn-sm" onclick="memberApp.addToCart(${idx})">選擇</button>
            </div>
        `).join('');
    },

    addToCart(idx) {
        this.cart.push(this.selectedVendor.menu[idx]);
        this.updateCartUI();
    },

    updateCartUI() {
        const container = document.getElementById('cart-items');
        container.innerHTML = this.cart.map((item, idx) => `
            <div class="cart-chip" style="background: var(--primary-color);">
                ${item.name} <span style="margin-left:8px; cursor:pointer;" onclick="memberApp.removeFromCart(${idx})">×</span>
            </div>
        `).join('');
    },

    removeFromCart(idx) {
        this.cart.splice(idx, 1);
        this.updateCartUI();
    },

    placeOrder() {
        const name = document.getElementById('member-name').value.trim();
        if (!name) { alert('請輸入姓名'); return; }
        if (this.cart.length === 0) return;

        localStorage.setItem('teatime_last_member_name', name);
        const storedOrders = JSON.parse(localStorage.getItem('teatime_orders') || '[]');

        const order = {
            id: `ORD-${Date.now()}`,
            sessionId: this.selectedSession.id,
            date: new Date().toLocaleString(),
            member: name,
            vendorName: this.selectedVendor.name,
            items: [...this.cart],
            total: this.cart.reduce((sum, item) => sum + (parseFloat(item.basePrice) || 0), 0)
        };

        storedOrders.unshift(order);
        localStorage.setItem('teatime_orders', JSON.stringify(storedOrders));
        document.getElementById('modal-container').style.display = 'flex';
    }
};

window.onload = () => memberApp.init();
