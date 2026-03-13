/**
 * Afternoon Tea Ordering System - app.js
 * Logic for managing vendors, orders, and history using localStorage.
 */

const app = {
  // Data State
  vendors: [],
  orders: [],
  cart: [],
  selectedVendor: null,
  isEditing: null,

  // Initialization
  init() {
    this.updateCloudStatus();
    this.listenData();
    this.setupEventListeners();
    console.log("Afternoon Tea Cloud System Initialized");
  },

  copyPortalLink() {
    const url = window.location.href.replace('index.html', 'order.html');
    navigator.clipboard.writeText(url);

    let msg = '🔗 前台連結已複製！';
    if (url.startsWith('file:///')) {
      msg += '\n\n⚠️ 注意：您目前是在電腦上開啟檔案。\n請先上傳到 GitHub 後再將連結傳給同事，他們才能看到正確網址喔！';
    }
    alert(msg);
  },

  updateCloudStatus() {
    const badge = document.getElementById('cloud-status-badge');
    const isConfigured = typeof firebaseConfig !== 'undefined' && firebaseConfig.apiKey && !firebaseConfig.apiKey.includes('在此貼上');
    this.isCloudActive = isConfigured;

    if (!badge) return;

    if (isConfigured) {
      badge.innerHTML = '🟢 已連線雲端';
      badge.style.color = '#10b981';
    } else {
      badge.innerHTML = '⚠️ 區域模式 (未連網)';
      badge.style.color = '#f59e0b';
      badge.title = '請至 firebase-config.js 填寫金鑰以開啟全公司同步。';
    }
  },

  listenData() {
    if (!this.isCloudActive) {
      console.log("使用 LocalStorage 模式");
      this.loadLocalData();
      return;
    }
    // ...雲端監聽保持不變
    // 監聽 店家 資料
    db.ref('vendors').on('value', (snapshot) => {
      const data = snapshot.val();
      this.vendors = data ? Object.values(data) : this.getInitialVendors();
      this.renderVendors();
      this.updateDashboard();
      if (document.getElementById('active-sessions-list')) this.renderActiveSessions();
    });

    // 監聽 訂單 資料
    db.ref('orders').on('value', (snapshot) => {
      const data = snapshot.val();
      this.orders = data ? Object.values(data) : [];
      this.updateDashboard();
      if (document.getElementById('full-history-list')) this.renderHistory();
    });

    // 監聽 訂購活動 (Sessions)
    db.ref('sessions').on('value', (snapshot) => {
      const data = snapshot.val();
      this.sessions = data ? Object.values(data) : [];
      if (document.getElementById('active-sessions-list')) this.renderActiveSessions();
      if (document.getElementById('full-history-list')) this.renderHistory();
    });
  },

  loadLocalData() {
    this.vendors = JSON.parse(localStorage.getItem('teatime_vendors') || '[]');
    if (this.vendors.length === 0) this.vendors = this.getInitialVendors();
    this.orders = JSON.parse(localStorage.getItem('teatime_orders') || '[]');
    this.sessions = JSON.parse(localStorage.getItem('teatime_sessions') || '[]');

    this.renderVendors();
    this.updateDashboard();
    if (document.getElementById('active-sessions-list')) this.renderActiveSessions();
    if (document.getElementById('full-history-list')) this.renderHistory();
  },

  loadData() {
    // 雲端版由 listenData 或 loadLocalData 處理
  },

  saveData() {
    if (this.isCloudActive) {
      db.ref('vendors').set(this.vendors);
      db.ref('orders').set(this.orders);
      db.ref('sessions').set(this.sessions);
      this.updateDashboard(); // 雲端版通常透過監聽觸發，但點擊者需要即時反饋
    } else {
      localStorage.setItem('teatime_vendors', JSON.stringify(this.vendors));
      localStorage.setItem('teatime_orders', JSON.stringify(this.orders));
      localStorage.setItem('teatime_sessions', JSON.stringify(this.sessions));

      this.renderVendors();
      this.updateDashboard();
      if (document.getElementById('active-sessions-list')) this.renderActiveSessions();
      if (document.getElementById('full-history-list')) this.renderHistory();
    }
  },

  getInitialVendors() {
    return [
      {
        "id": 2000,
        "name": "胖老爹 大橋中華店",
        "phone": "06 302 3993",
        "category": "炸物",
        "notice": "",
        "method": "",
        "address": "台南市永康區中華路654號",
        "notes": "",
        "menu": []
      },
      {
        "id": 2001,
        "name": "大茗永康中華店",
        "phone": "0911 857 565",
        "category": "飲料",
        "notice": "",
        "method": "",
        "address": "台南市永康區中華路603號",
        "notes": "只能送到一樓",
        "menu": []
      },
      {
        "id": 2002,
        "name": "ʙᴏʜᴏ · 波吼· ʙʀᴜɴᴄʜ",
        "phone": "0985 035 443",
        "category": "點心",
        "notice": "前2天",
        "method": "可IG預定",
        "address": "台南市北區東豐路547號",
        "notes": "",
        "menu": []
      },
      {
        "id": 2003,
        "name": "岩涼手作 崇德店",
        "phone": "06 230 5320",
        "category": "飲料",
        "notice": "前1天",
        "method": "可IG預定",
        "address": "台南市東區崇德路663-1號",
        "notes": "",
        "menu": []
      },
      {
        "id": 2004,
        "name": "LYLA萊拉",
        "phone": "0976 844 696",
        "category": "水果",
        "notice": "前2天",
        "method": "官方賴",
        "address": "台南市中西區友愛街232號",
        "notes": "",
        "menu": []
      },
      {
        "id": 2005,
        "name": "五分田—大灣店",
        "phone": "06 207 1708",
        "category": "飲料",
        "notice": "前2天",
        "method": "",
        "address": "台南市永康區大灣路963號",
        "notes": "",
        "menu": []
      },
      {
        "id": 2006,
        "name": "阿亮香雞排",
        "phone": "0909 722 400",
        "category": "炸物",
        "notice": "前2天",
        "method": "",
        "address": "台南市南區金華路一段129-5號",
        "notes": "無收據",
        "menu": []
      },
      {
        "id": 2007,
        "name": "一沐日 永康大橋二店",
        "phone": "06 302 0033",
        "category": "飲料",
        "notice": "",
        "method": "",
        "address": "台南市永康區大橋二街131號",
        "notes": "",
        "menu": []
      },
      {
        "id": 2008,
        "name": "飛咖啡",
        "phone": "06 251 1277",
        "category": "點心",
        "notice": "前2天",
        "method": "可IG預定",
        "address": "台南市北區公園路880號",
        "notes": "上次沒開到統編，可用來請香港的費用",
        "menu": []
      },
      {
        "id": 2009,
        "name": "自然湉",
        "phone": "06 223 2886",
        "category": "飲料",
        "notice": "前1天",
        "method": "可IG預定",
        "address": "台南市中西區民族路二段76-1號",
        "notes": "有手寫發票",
        "menu": []
      },
      {
        "id": 2010,
        "name": "源和珍 手工烙餅 臺南應大總店",
        "phone": "0989 386 411",
        "category": "餅堡",
        "notice": "前2天",
        "method": "可IG預定",
        "address": "台南市永康區中正路547號",
        "notes": "滿1500外送，未滿收100外送費",
        "menu": []
      },
      {
        "id": 2011,
        "name": "拾汣茶屋 台南永康中正店",
        "phone": "06 243 0980",
        "category": "飲料",
        "notice": "前1天",
        "method": "可IG預定",
        "address": "台南市永康區中正路936號",
        "notes": "",
        "menu": []
      },
      {
        "id": 2012,
        "name": "炑嵐係獸仔(乳酪/巴斯克蛋糕)",
        "phone": "0916 811 841",
        "category": "甜點",
        "notice": "前1天",
        "method": "可IG.LINE預定\n https://line.me/ti/p/8lHvf6ZloW",
        "address": "安南區(個人工作室)",
        "notes": "1.無發票及收據\n 2.團體優惠總金額9折",
        "menu": []
      },
      {
        "id": 2013,
        "name": "新波波 復國門市",
        "phone": "06 3128262",
        "category": "飲料",
        "notice": "前1天",
        "method": "",
        "address": "台南市永康區復國一路203號",
        "notes": "",
        "menu": []
      },
      {
        "id": 2014,
        "name": "盛麗甘草芭樂中華店",
        "phone": "0908 050 475",
        "category": "水果",
        "notice": "前2天",
        "method": "",
        "address": "710台南市永康區中華路7巷20弄40號",
        "notes": "1. 有手寫收據\n2. 可依照預算調整份量\n3.可自行搭配水果",
        "menu": []
      },
      {
        "id": 2015,
        "name": "台南宵夜歐爺熱狗堡 OH YEAH HOTDOGS",
        "phone": "0976 162 319",
        "category": "餅堡",
        "notice": "前1天",
        "method": "可IG預定",
        "address": "台南市東區育樂街193-2號台南市東區育樂街193-2號",
        "notes": "1.可開收據統編\n2.前一天晚上可改數量、口味",
        "menu": []
      },
      {
        "id": 2016,
        "name": "紅茶老爹-台南新孝店",
        "phone": "06 265 0050",
        "category": "飲料",
        "notice": "前1天",
        "method": "可IG預定",
        "address": "台南市南區新孝路43號",
        "notes": "有手寫收據",
        "menu": []
      },
      {
        "id": 2017,
        "name": "八方緣-櫻桃烤鴨庄",
        "phone": "06 585 8385",
        "category": "滷味, 餅堡",
        "notice": "前1天",
        "method": "可賴預定",
        "address": "台南市善化區中山路312號",
        "notes": "1.滿4000外送\n2.鹹水鴨可依預算調整",
        "menu": []
      },
      {
        "id": 2018,
        "name": "迷客夏Milksha 臺南善化店",
        "phone": "06 585 0713",
        "category": "飲料",
        "notice": "",
        "method": "",
        "address": "台南市善化區中山路335號",
        "notes": "可跟八方緣一起外送",
        "menu": []
      },
      {
        "id": 2019,
        "name": "櫻桃菓子",
        "phone": "06 208 8448",
        "category": "飲料",
        "notice": "前1天",
        "method": "可IG預定",
        "address": "台南市東區東安路186號",
        "notes": "",
        "menu": []
      },
      {
        "id": 2020,
        "name": "Woopen木盆 東寧門市",
        "phone": "06 208 6501",
        "category": "點心",
        "notice": "前2天",
        "method": "官方賴",
        "address": "台南市",
        "notes": "",
        "menu": []
      },
      {
        "id": 2021,
        "name": "珍煮丹 永康中華店",
        "phone": "06 302 6682",
        "category": "飲料",
        "notice": "前1天",
        "method": "",
        "address": "台南市永康區中華路479號",
        "notes": "",
        "menu": []
      },
      {
        "id": 2022,
        "name": "3517手做甜點。輕食",
        "phone": "0909-976327",
        "category": "點心",
        "notice": "前3天",
        "method": "官方賴",
        "address": "台南市中正路106之1號",
        "notes": "可開收據、可外送",
        "menu": []
      },
      {
        "id": 2023,
        "name": "米之軒握飯糰",
        "phone": "",
        "category": "",
        "notice": "",
        "method": "",
        "address": "",
        "notes": "",
        "menu": []
      },
      {
        "id": 2024,
        "name": "新波波 東橋門市",
        "phone": "06 3023535",
        "category": "飲料",
        "notice": "前1天",
        "method": "",
        "address": "台南市永康區東橋十街3號",
        "notes": "",
        "menu": []
      },
      {
        "id": 2025,
        "name": "卡皮巴啦 脆皮雞蛋糕",
        "phone": "",
        "category": "點心",
        "notice": "前2天",
        "method": "官方賴",
        "address": "台南市永康區中山南路280號 尚青黃昏市場裡\n二街39號攤位",
        "notes": "週二公休\n有收據、但無統編跟大小章",
        "menu": []
      },
      {
        "id": 2026,
        "name": "一沐日 台南東寧店",
        "phone": "06 208 6086",
        "category": "飲料",
        "notice": "",
        "method": "電話",
        "address": "台南市東區東寧路215號",
        "notes": "",
        "menu": []
      },
      {
        "id": 2027,
        "name": "麻古茶坊-永康復國",
        "phone": "06 202 0623",
        "category": "飲料",
        "notice": "",
        "method": "電話",
        "address": "台南市永康區復國一路502號",
        "notes": "",
        "menu": []
      },
      {
        "id": 2028,
        "name": "波吉Bo Gi",
        "phone": "06 208 8573",
        "category": "點心",
        "notice": "",
        "method": "可IG預定",
        "address": "台南市東區林森路二段107號",
        "notes": "可開收據、需先匯款、只送到一樓",
        "menu": []
      },
      {
        "id": 2029,
        "name": "迷客夏Milksha 臺南中華店",
        "phone": "06 312 0000",
        "category": "飲料",
        "notice": "",
        "method": "電話",
        "address": "台南市永康區中華二路195號",
        "notes": "只送到一樓",
        "menu": []
      },
      {
        "id": 2030,
        "name": "貝殼小姐歸仁店",
        "phone": "0958 517301",
        "category": "點心",
        "notice": "前3天",
        "method": "可IG預定",
        "address": "台南市歸仁區大通路76-1號",
        "notes": "無收據",
        "menu": []
      },
      {
        "id": 2031,
        "name": "貴妃堂",
        "phone": "",
        "category": "點心",
        "notice": "前3天",
        "method": "官方賴",
        "address": "",
        "notes": "可開統編發票，送到22樓，下次點有優惠",
        "menu": []
      },
      {
        "id": 2032,
        "name": "91Brunch",
        "phone": "0974 232 148",
        "category": "點心",
        "notice": "前3天",
        "method": "賴",
        "address": "臺南市東區長榮路三段24巷24號",
        "notes": "",
        "menu": []
      },
      {
        "id": 2033,
        "name": "大苑子茶飲專賣店-永康中華店",
        "phone": "06 3129777",
        "category": "飲料",
        "notice": "當天",
        "method": "電話",
        "address": "臺南市永康區中華路195號",
        "notes": "當天可以再更改",
        "menu": []
      },
      {
        "id": 2034,
        "name": "三益寶水煎包（原後甲黃昏市場）",
        "phone": "09 33647553",
        "category": "點心",
        "notice": "前3天",
        "method": "電話",
        "address": "臺南市永康區忠義街81巷53號",
        "notes": "14.30到，老闆有點重聽\n有手開收據 的樣子",
        "menu": []
      },
      {
        "id": 2035,
        "name": "茶湯會(台南復國店)",
        "phone": "06 2018137",
        "category": "飲料",
        "notice": "前1天",
        "method": "電話",
        "address": "臺南市永康區復華里復國一路305號",
        "notes": "只送到一樓",
        "menu": []
      },
      {
        "id": 2036,
        "name": "小匠鍋盔 復國總店",
        "phone": "09 38880639",
        "category": "點心",
        "notice": "前3天",
        "method": "電話",
        "address": "臺南市永康區復國一路299號",
        "notes": "聽起來像中國人\n14.30到 不確定會不會送上來、無收據",
        "menu": []
      },
      {
        "id": 2037,
        "name": "萬波島嶼紅茶 Wanpo Tea Shop 台南新府前店",
        "phone": "06 223 9987",
        "category": "飲料",
        "notice": "前1天",
        "method": "電話、你訂",
        "address": "臺南市中西區府前路二段34號",
        "notes": "只送到一樓",
        "menu": []
      },
      {
        "id": 2038,
        "name": "永記煙燻滷味台南裕學店",
        "phone": "0952 816 816",
        "category": "滷味",
        "notice": "前3天",
        "method": "可IG預定",
        "address": "臺南市東區裕學路60號",
        "notes": "可依預算調整、有收據、40份可外送",
        "menu": []
      }
    ];
  },

  // UI Handlers
  switchTab(tabId) {
    // Update Nav
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById(`nav-${tabId}`).classList.add('active');

    // Update Content
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.getElementById(`tab-${tabId}`).classList.add('active');

    const titles = {
      'dashboard': '總覽 Dashboard',
      'vendors': '店家管理 Vendors',
      'order': '立即訂購 Order',
      'history': '歷史訂單 History'
    };
    document.getElementById('page-title').innerText = titles[tabId];

    if (tabId === 'history') this.renderHistory();
    if (tabId === 'order') {
      this.renderVendors();
      this.renderActiveSessions();
    }
    if (tabId === 'vendors') this.renderVendors();
  },

  setupEventListeners() {
    const vendorForm = document.getElementById('vendor-form');
    if (vendorForm) {
      vendorForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveVendor();
      });
    }
  },

  // Vendor Management
  renderVendors() {
    const container = document.getElementById('vendors-list');
    const multiVendorChecks = document.getElementById('session-vendor-checks');

    // Render normal vendor management cards
    container.innerHTML = this.vendors.map(v => `
      <div class="vendor-card">
        <div class="vendor-header">
          <span class="vendor-name">${v.name}</span>
          <span class="vendor-category">${v.category}</span>
        </div>
        <div class="vendor-info">
          <div class="info-section">
            <div class="info-item"><span class="label-icon">🕒</span> 提前告知：${v.notice || '未記錄'}</div>
            <div class="info-item"><span class="label-icon">📱</span> 訂購方式：${v.method || '未記錄'}</div>
            ${v.notes ? `<div class="info-item notes"><span class="label-icon">📝</span> ${v.notes}</div>` : ''}
          </div>
          <div class="info-section">
            <div class="info-item"><span class="label-icon">📞</span> ${v.phone || '無電話'}</div>
            ${v.address ? `<div class="info-item"><span class="label-icon">📍</span> ${v.address}</div>` : ''}
            <div class="info-item"><span class="label-icon">📋</span> ${v.menu.length} 個品項</div>
          </div>
        </div>
        <div class="vendor-actions">
          <button class="btn btn-primary" style="padding: 0.4rem 0.8rem; background: #64748b;" onclick="app.editVendor(${v.id})">編輯</button>
          <button class="btn btn-danger" style="padding: 0.4rem 0.8rem;" onclick="app.deleteVendor(${v.id})">刪除</button>
        </div>
      </div>
    `).join('');

    // Render checkbox list for session creation
    if (multiVendorChecks) {
      multiVendorChecks.innerHTML = this.vendors.map(v => `
        <label style="display: flex; align-items: center; gap: 8px; font-size: 0.9rem; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 6px;">
          <input type="checkbox" class="session-vendor-check" value="${v.id}"> ${v.name} (${v.category})
        </label>
      `).join('');
    }
  },

  showAddVendorModal() {
    this.isEditing = null;
    document.getElementById('modal-container').style.display = 'flex';
    document.body.classList.add('modal-open');
  },

  editVendor(id) {
    const v = this.vendors.find(v => v.id === id);
    if (!v) return;
    this.isEditing = id;
    document.getElementById('modal-title').innerText = '編輯店家';
    document.getElementById('v-name').value = v.name || '';
    document.getElementById('v-phone').value = v.phone || '';
    document.getElementById('v-category').value = v.category || '';
    document.getElementById('v-notice').value = v.notice || '';

    // Set checkboxes for order method
    const savedMethods = (v.method || '').split(',').map(m => m.trim());
    const predefined = ['電話', '官方LINE', 'IG預定', '你訂', '現場購買', '外送平台'];
    const custom = [];

    document.querySelectorAll('#order-method-checks input').forEach(checkbox => {
      if (savedMethods.includes(checkbox.value)) {
        checkbox.checked = true;
      } else {
        checkbox.checked = false;
      }
    });

    // Filter out what was custom
    savedMethods.forEach(m => {
      if (m && !predefined.includes(m)) custom.push(m);
    });
    document.getElementById('v-method-custom').value = custom.join(', ');

    document.getElementById('v-address').value = v.address || '';
    document.getElementById('v-notes').value = v.notes || '';
    document.getElementById('v-menu').value = (v.menu || []).map(m => `${m.name}, ${m.price}`).join('\n');
    document.getElementById('modal-container').style.display = 'flex';
    document.body.classList.add('modal-open');
  },

  createSession() {
    const dateInput = document.getElementById('session-date');
    const date = dateInput.value.trim();
    const selectedVendorIds = Array.from(document.querySelectorAll('.session-vendor-check:checked')).map(cb => parseInt(cb.value));
    const feedback = document.getElementById('session-feedback');

    if (!date || selectedVendorIds.length === 0) {
      alert('請填寫日期/名稱並至少勾選一家店家');
      return;
    }

    const newSession = {
      id: Date.now(),
      date: date,
      vendorIds: selectedVendorIds,
      status: 'open',
      createdAt: new Date().toLocaleString()
    };

    this.sessions.unshift(newSession);
    this.saveData();

    // Tactile Feedback (Blue and no alert)
    if (feedback) {
      feedback.innerText = '已成功啟動！';
      feedback.style.color = 'var(--accent-blue)';
      feedback.style.opacity = '1';
      setTimeout(() => feedback.style.opacity = '0', 3000);
    }

    // Clear Inputs
    dateInput.value = '';
    document.querySelectorAll('.session-vendor-check').forEach(cb => cb.checked = false);

    this.renderActiveSessions();
    this.renderHistory();
  },

  deleteActiveSession(id) {
    if (confirm('確定要刪除這個活動嗎？(這會移除該活動的所有紀錄)')) {
      this.sessions = this.sessions.filter(s => s.id !== id);
      this.orders = this.orders.filter(o => o.sessionId !== id);
      this.saveData();
      this.renderActiveSessions();
      this.renderHistory();
    }
  },

  editActiveSession(id) {
    const session = this.sessions.find(s => s.id === id);
    if (!session) return;

    const newDate = prompt('請輸入新的日期/名稱：', session.date);
    if (newDate !== null && newDate.trim() !== '') {
      session.date = newDate.trim();
      this.saveData();
      this.renderActiveSessions();
      this.renderHistory();
    }
  },

  renderActiveSessions() {
    const container = document.getElementById('active-sessions-list');
    const openSessions = this.sessions.filter(s => s.status === 'open');

    if (openSessions.length === 0) {
      container.innerHTML = '<p class="empty-state">目前沒有開放中的訂購活動。</p>';
      return;
    }

    container.innerHTML = openSessions.map(s => {
      const vendorNames = s.vendorIds.map(vId => {
        const v = this.vendors.find(v => v.id === vId);
        return v ? v.name : '未知店家';
      }).join(', ');

      return `
        <div class="vendor-card" style="border-left: 5px solid var(--accent-blue);">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.8rem;">
            <div>
              <h3 style="font-size: 1.2rem; color: white;">${s.date}</h3>
              <p style="font-size: 0.9rem; color: var(--text-secondary);">開放店家: ${vendorNames}</p>
            </div>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-primary" style="padding: 0.3rem 0.6rem; background: #475569;" onclick="app.editActiveSession(${s.id})">修改日期</button>
              <button class="btn btn-danger" style="padding: 0.3rem 0.6rem;" onclick="app.deleteActiveSession(${s.id})">刪除</button>
            </div>
          </div>
          
          <div style="margin: 1rem 0;">
            <button class="btn btn-primary" style="width: 100%; background: var(--accent-blue); padding: 0.75rem; display: flex; align-items: center; justify-content: center; gap: 8px;" 
              onclick="const url = window.location.href.replace('index.html', 'order.html'); navigator.clipboard.writeText(url); alert('🔗 前台連結已複製！\\n快傳到群組讓同事訂購吧！')">
              <span>🔗 複製前台網址給同事</span>
            </button>
          </div>

          <button class="btn btn-success" style="width: 100%; margin-top: 5px;" onclick="app.closeSession(${s.id})">完成並結束訂購</button>
        </div>
      `;
    }).join('');
  },

  closeSession(id) {
    const session = this.sessions.find(s => s.id === id);
    if (session) {
      session.status = 'closed';
      this.saveData();
      this.renderActiveSessions();
      this.renderHistory();
    }
  },

  reopenSession(id) {
    const session = this.sessions.find(s => s.id === id);
    if (session) {
      session.status = 'open';
      this.saveData();
      this.renderActiveSessions();
      this.renderHistory();
    }
  },

  deleteVendor(id) {
    if (confirm('確定要刪除這家店家嗎？')) {
      this.vendors = this.vendors.filter(v => v.id !== id);
      this.saveData();
      this.renderVendors();
    }
  },

  hideModal() {
    document.getElementById('modal-container').style.display = 'none';
    document.body.classList.remove('modal-open');
  },

  saveVendor() {
    const name = document.getElementById('v-name').value;
    const phone = document.getElementById('v-phone').value;
    const category = document.getElementById('v-category').value;
    const notice = document.getElementById('v-notice').value;

    // Multi-select methods
    const methodChecks = Array.from(document.querySelectorAll('#order-method-checks input:checked')).map(c => c.value);
    const customMethod = document.getElementById('v-method-custom').value.trim();
    if (customMethod) methodChecks.push(customMethod);
    const method = methodChecks.join(', ');

    const address = document.getElementById('v-address').value;
    const notes = document.getElementById('v-notes').value;
    const menuRaw = document.getElementById('v-menu').value;

    const menu = menuRaw.split('\n').filter(line => line.trim()).map(line => {
      const parts = line.split(',');
      const n = parts[0] ? parts[0].trim() : '未命名';
      const pStr = parts[1] ? parts[1].trim() : '0';

      // 計算基準價格 (admin 用)
      let numericPrice = 0;
      if (pStr.includes('/')) {
        const [amt, qty] = pStr.replace(/[^0-9/]/g, '').split('/');
        numericPrice = (parseFloat(amt) / (parseFloat(qty) || 1)) || 0;
      } else {
        numericPrice = parseFloat(pStr.replace(/[^0-9.]/g, '')) || 0;
      }

      return { name: n, price: pStr, basePrice: numericPrice };
    });

    if (this.isEditing) {
      const idx = this.vendors.findIndex(v => v.id === this.isEditing);
      this.vendors[idx] = { ...this.vendors[idx], name, phone, category, notice, method, address, notes, menu };
    } else {
      this.vendors.push({
        id: Date.now(),
        name, phone, category, notice, method, address, notes, menu
      });
    }

    this.saveData();
    this.renderVendors();
    this.hideModal();
  },

  // Ordering Workflow
  resetOrderWorkflow() {
    this.cart = [];
    this.selectedVendor = null;
    this.renderVendors(); // Refresh vendor list
    document.getElementById('step-select-vendor').classList.add('active');
    document.getElementById('step-select-menu').classList.remove('active');
  },

  startOrder(vendorId) {
    this.selectedVendor = this.vendors.find(v => v.id === vendorId);
    if (!this.selectedVendor) return;

    document.getElementById('ordering-vendor-name').innerText = `菜單 - ${this.selectedVendor.name}`;
    document.getElementById('step-select-vendor').classList.remove('active');
    document.getElementById('step-select-menu').classList.add('active');

    this.renderMenu();
    this.updateCartUI();
  },

  prevOrderStep() {
    document.getElementById('step-select-vendor').classList.add('active');
    document.getElementById('step-select-menu').classList.remove('active');
  },

  renderMenu() {
    const container = document.getElementById('menu-items-list');
    container.innerHTML = this.selectedVendor.menu.map((item, idx) => `
      <div class="menu-item">
        <div>
          <div class="item-name">${item.name}</div>
          <div class="item-price">$${item.price}</div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="app.addToCart(${idx})">加入</button>
      </div>
    `).join('');
  },

  addToCart(menuIndex) {
    const item = this.selectedVendor.menu[menuIndex];
    this.cart.push(item);
    this.updateCartUI();
  },

  updateCartUI() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total-price');

    container.innerHTML = this.cart.map((item, idx) => `
      <div class="cart-chip">${item.name} x1 <span style="cursor:pointer; padding-left:5px" onclick="app.removeFromCart(${idx})">×</span></div>
    `).join('');

    const total = this.cart.reduce((sum, item) => sum + item.price, 0);
    totalEl.innerText = total;
  },

  removeFromCart(idx) {
    this.cart.splice(idx, 1);
    this.updateCartUI();
  },

  placeOrder() {
    if (this.cart.length === 0) {
      alert('購物車是空的！');
      return;
    }

    const order = {
      id: `ORD-${Date.now()}`,
      date: new Date().toLocaleString(),
      vendorName: this.selectedVendor.name,
      items: [...this.cart],
      total: this.cart.reduce((sum, item) => sum + item.price, 0)
    };

    this.orders.unshift(order);
    this.saveData();
    alert('訂單已提交！');
    this.switchTab('dashboard');
  },

  reOrder(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;

    const vendor = this.vendors.find(v => v.name === order.vendorName);
    if (!vendor) {
      alert('該店家已不存在，無法重複訂購。');
      return;
    }

    this.selectedVendor = vendor;
    this.cart = [...order.items];

    // Switch to order tab and set steps
    this.switchTab('order');
    document.getElementById('ordering-vendor-name').innerText = `菜單 - ${this.selectedVendor.name}`;
    document.getElementById('step-select-vendor').classList.remove('active');
    document.getElementById('step-select-menu').classList.add('active');
    this.renderMenu();
    this.updateCartUI();
  },

  // Stats & History
  updateDashboard() {
    const todayEl = document.getElementById('today-order-status');
    const recentEl = document.getElementById('recent-orders-list');
    const topVendorEl = document.getElementById('top-vendor');

    const openSessions = this.sessions.filter(s => s.status === 'open');

    // 總覽狀態更新
    if (todayEl) {
      if (openSessions.length > 0) {
        const sessionLinks = openSessions.map(s => `<div style="margin-top:5px; padding:5px; background:rgba(255,255,255,0.05); border-radius:4px;">📅 ${s.date}</div>`).join('');
        todayEl.innerHTML = `
          <div style="color: var(--accent-green); font-weight: bold;">🟢 目前有 ${openSessions.length} 個活動開放中</div>
          ${sessionLinks}
          <button class="btn btn-primary" style="margin-top: 10px; width:100%; font-size: 0.8rem;" onclick="app.switchTab('order')">前往管理</button>
        `;
      } else {
        todayEl.innerHTML = `
          <div style="color: var(--text-muted); margin-bottom: 8px;">⚪ 目前無進行中的活動</div>
          <button class="btn btn-success" style="width:100%; font-size: 0.8rem;" onclick="app.switchTab('order')">+ 啟動新訂購</button>
        `;
      }
    }

    // 最常點的店家更新
    if (topVendorEl) {
      if (this.orders.length > 0) {
        const counts = {};
        this.orders.forEach(o => counts[o.vendorName] = (counts[o.vendorName] || 0) + 1);
        const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
        topVendorEl.innerHTML = `
          <div style="font-weight: bold; color: var(--accent-yellow); font-size: 1.1rem;">${top[0]}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-top:5px;">已訂購過 ${top[1]} 次</div>
        `;
      } else {
        topVendorEl.innerText = '尚無統計資料';
      }
    }

    // 近期單筆明細更新
    if (recentEl) {
      if (this.orders.length > 0) {
        // 顯示最新的 5 筆
        const displayOrders = [...this.orders].reverse().slice(0, 5);
        recentEl.innerHTML = displayOrders.map(o => `
          <div class="history-item" onclick="app.showOrderDetails('${o.id}')" style="cursor: pointer; padding: 12px;">
            <div class="date">${o.date.split(' ')[1] || o.date}</div>
            <div class="vendor" style="flex: 1.5;"><strong>${o.member || '訪客'}</strong>：${o.vendorName}</div>
            <div class="total" style="color: var(--accent-yellow);">$${o.total}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">❯</div>
          </div>
        `).join('');
      } else {
        recentEl.innerHTML = '<p class="empty-state">尚未有人下單，去發送連結給同事吧！</p>';
      }
    }
  },

  showOrderDetails(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;

    const itemsHtml = order.items.map(i => `
      <div style="display:flex; justify-content:space-between; padding: 10px; border-bottom: 1px solid var(--glass-border);">
        <span>${i.name}</span>
        <span>$${i.price || i.basePrice}</span>
      </div>
    `).join('');

    const detailOverlay = document.createElement('div');
    detailOverlay.className = 'modal-overlay';
    detailOverlay.style.cssText = 'display:flex; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); backdrop-filter:blur(10px); z-index:9999; align-items:center; justify-content:center;';
    detailOverlay.innerHTML = `
      <div class="modal" style="max-width: 400px; text-align: left; background: var(--card-bg); border: 1px solid var(--glass-border); padding: 2rem; border-radius: var(--radius-lg);">
        <h2 style="margin-bottom: 1rem;">🛒 訂單詳情</h2>
        <div style="margin-bottom: 1.5rem; line-height: 1.6;">
          <p><strong>🕒 下單時間：</strong>${order.date}</p>
          <p><strong>👤 訂購人：</strong>${order.member || '訪客'}</p>
          <p><strong>🏪 店家：</strong>${order.vendorName}</p>
        </div>
        <div style="background: rgba(0,0,0,0.3); border-radius: 8px; margin-bottom: 1.5rem; border: 1px solid var(--glass-border);">
          ${itemsHtml}
          <div style="padding: 12px; text-align: right; font-weight: bold; color: var(--accent-yellow); font-size: 1.1rem;">
            總計：$${order.total}
          </div>
        </div>
        <button class="btn btn-primary" style="width: 100%; padding: 1rem;" onclick="this.closest('.modal-overlay').remove()">關閉視窗</button>
      </div>
    `;
    document.body.appendChild(detailOverlay);
  },

  renderHistory() {
    const container = document.getElementById('full-history-list');
    if (this.sessions.length === 0) {
      container.innerHTML = '<p class="empty-state">尚無訂購活動紀錄</p>';
      return;
    }

    // 顯示最新的 Session 在最上面
    const displaySessions = [...this.sessions].reverse();
    container.innerHTML = displaySessions.map(session => {
      const sessionOrders = this.orders.filter(o => o.sessionId === session.id);

      // 計算活動總額
      const sessionTotal = sessionOrders.reduce((sum, o) => sum + o.total, 0);

      // Aggregate items across all orders in this session
      const aggregates = {};
      sessionOrders.forEach(o => {
        o.items.forEach(item => {
          aggregates[item.name] = (aggregates[item.name] || 0) + 1;
        });
      });

      const aggregatedList = Object.entries(aggregates).map(([name, count]) => `
        <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dotted rgba(255,255,255,0.1);">
          <span>${name}</span>
          <span style="color: var(--accent-yellow); font-weight: bold;">x ${count}</span>
        </div>
      `).join('');

      const detailList = sessionOrders.map(o => `
        <div onclick="app.showOrderDetails('${o.id}')" 
             style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 6px; padding: 10px; background: rgba(255,255,255,0.03); border-radius: 8px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: background 0.2s;">
          <span>👤 ${o.member || '訪客'}: ${o.items.map(i => i.name).join(', ')}</span>
          <span style="color: var(--accent-yellow);">$${o.total} ❯</span>
        </div>
      `).join('');

      return `
        <div class="stat-card" style="margin-bottom: 2.5rem; border: 1px solid var(--glass-border); padding: 2rem; background: var(--card-bg);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.2rem; border-bottom: 1px solid var(--primary-color); padding-bottom: 15px;">
            <div>
              <h3 style="color: white; font-size: 1.3rem;">📅 ${session.date}</h3>
              <div style="margin-top: 8px;">
                <span style="color: var(--accent-yellow); font-weight: bold; font-size: 1.2rem; background: rgba(255,215,0,0.1); padding: 4px 10px; border-radius: 6px;">活動總額：$${sessionTotal}</span>
                <span style="color: var(--text-muted); margin-left: 10px; font-size: 0.85rem;">(共 ${sessionOrders.length} 筆單)</span>
              </div>
            </div>
            <div style="display: flex; gap: 10px;">
              ${session.status === 'open' ?
          `<button class="btn btn-danger" style="padding: 0.4rem 0.8rem;" onclick="app.closeSession(${session.id})">結束訂購</button>` :
          `<button class="btn btn-success" style="padding: 0.4rem 0.8rem;" onclick="app.reopenSession(${session.id})">重新開啟</button>`}
              <button class="btn btn-danger" style="padding: 0.4rem 0.8rem; background: #991b1b;" onclick="app.deleteActiveSession(${session.id})">刪除活動</button>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 2rem;">
            <div>
              <h4 style="font-size: 1rem; margin-bottom: 12px; color: var(--accent-blue); display: flex; align-items: center; gap: 8px;">📦 總數統計 (點餐清單)</h4>
              <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px; border: 1px solid var(--glass-border);">
                ${aggregatedList || '<p class="empty-state" style="font-size: 0.8rem;">尚無訂單</p>'}
              </div>
            </div>
            <div>
              <h4 style="font-size: 1rem; margin-bottom: 12px; color: var(--accent-blue); display: flex; align-items: center; gap: 8px;">👥 訂購明細 (點擊查看詳情)</h4>
              <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 10px; max-height: 300px; border: 1px solid var(--glass-border); overflow-y: auto;">
                ${detailList || '<p class="empty-state" style="font-size: 0.8rem;">尚未有人下單</p>'}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
};

// Initialize after DOM loaded
document.addEventListener('DOMContentLoaded', () => app.init());
