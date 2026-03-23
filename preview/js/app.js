/**
 * Simple Vanilla JS Framework for BiddingRadar Preview
 */

const DEFAULT_API_BASE = 'https://zhaobiao.agecms.com';

const App = {
    state: {
        currentTab: 0,
        currentCity: '全国',
        searchKeyword: '',
        data: [], 
        loading: false,
        error: null,
        // Pagination state
        currentPage: 0,
        hasMore: true,
        loadingMore: false,
        maxDays: 15,
        startDate: new Date('2026-01-01'), // Start date as reference
        loadedDays: 0, // Track how many days of data we've covered
        
        // User State
        user: {
            isLogged: false,
            username: '',
            avatar: '',
            vipLevel: 'free', // free, city, province, country
            vipScopeValue: '', // City name or Province name
            vipExpire: null,
            balance: 0,
            viewUsage: 0, // Cumulative usage for limited actions
            viewHistory: [] // Store IDs of viewed items to prevent double counting if needed (optional, but good for "viewed" status)
        },
        
        // Carousel State
        bannerIndex: 0,
        bannerTimer: null,
        homeStatsText: '',
        homeStatsAt: 0,
        homeStatsLoading: false,
        subLastScopeType: 'city',
        subLastScopeValue: '',
        pendingSubDialogOpen: false,
        backendSyncActionAt: 0,
        backendSyncSuccessAt: 0,
        apiOnlineAt: 0,
        apiBaseResolved: '',
        apiBaseCheckedAt: 0,
        dataSource: 'local',
        homeStatsBarBg: 'linear-gradient(135deg, #4A90E2, #357ABD)',
        homeStatsBarColor: '#FFFFFF',
        homeStatsBarBorder: 'transparent',
        idleRefreshTimer: null,
        lastActivityAt: 0,
        dataRefreshTimer: null,
        fetchSeq: 0,
        activeFetchSeq: 0,
        appStartedAt: 0,
        startupRetryCount: 0,
        startupRetryTimer: null,
        locationAutoInFlight: false,
        locationAutoDone: false,
        locationAutoRetryCount: 0,
        subPushTimer: null,
        subPushInFlight: false,
        lastDataContextKey: '',
        yStatsCtxKey: '',
        yStatsComputedAt: 0,
        yStatsComputing: false,
        timeEnrichCtxKey: '',
        timeEnrichAt: 0,
        timeEnriching: false
    },

    provinces: {
        "直辖市": ["北京", "上海", "天津", "重庆"],
        "广东": ["广州", "深圳", "珠海", "汕头", "佛山", "韶关", "湛江", "肇庆", "江门", "茂名", "惠州", "梅州", "汕尾", "河源", "阳江", "清远", "东莞", "中山", "潮州", "揭阳", "云浮"],
        "浙江": ["杭州", "宁波", "温州", "嘉兴", "湖州", "绍兴", "金华", "衢州", "舟山", "台州", "丽水"],
        "江苏": ["南京", "无锡", "徐州", "常州", "苏州", "南通", "连云港", "淮安", "盐城", "扬州", "镇江", "泰州", "宿迁"],
        "山东": ["济南", "青岛", "淄博", "枣庄", "东营", "烟台", "潍坊", "济宁", "泰安", "威海", "日照", "临沂", "德州", "聊城", "滨州", "菏泽"],
        "四川": ["成都", "自贡", "攀枝花", "泸州", "德阳", "绵阳", "广元", "遂宁", "内江", "乐山", "南充", "眉山", "宜宾", "广安", "达州", "雅安", "巴中", "资阳", "阿坝", "甘孜", "凉山"],
        "湖北": ["武汉", "黄石", "十堰", "宜昌", "襄阳", "鄂州", "荆门", "孝感", "荆州", "黄冈", "咸宁", "随州", "恩施", "仙桃", "潜江", "天门", "神农架"],
        "湖南": ["长沙", "株洲", "湘潭", "衡阳", "邵阳", "岳阳", "常德", "张家界", "益阳", "郴州", "永州", "怀化", "娄底", "湘西"],
        "福建": ["福州", "厦门", "莆田", "三明", "泉州", "漳州", "南平", "龙岩", "宁德"],
        "安徽": ["合肥", "芜湖", "蚌埠", "淮南", "马鞍山", "淮北", "铜陵", "安庆", "黄山", "滁州", "阜阳", "宿州", "六安", "亳州", "池州", "宣城"],
        "河北": ["石家庄", "唐山", "秦皇岛", "邯郸", "邢台", "保定", "张家口", "承德", "沧州", "廊坊", "衡水"],
        "河南": ["郑州", "开封", "洛阳", "平顶山", "安阳", "鹤壁", "新乡", "焦作", "濮阳", "许昌", "漯河", "三门峡", "南阳", "商丘", "信阳", "周口", "驻马店", "济源"],
        "辽宁": ["沈阳", "大连", "鞍山", "抚顺", "本溪", "丹东", "锦州", "营口", "阜新", "辽阳", "盘锦", "铁岭", "朝阳", "葫芦岛"],
        "陕西": ["西安", "铜川", "宝鸡", "咸阳", "渭南", "延安", "汉中", "榆林", "安康", "商洛"],
        "江西": ["南昌", "景德镇", "萍乡", "九江", "新余", "鹰潭", "赣州", "吉安", "宜春", "抚州", "上饶"],
        "广西": ["南宁", "柳州", "桂林", "梧州", "北海", "防城港", "钦州", "贵港", "玉林", "百色", "贺州", "河池", "来宾", "崇左"],
        "云南": ["昆明", "曲靖", "玉溪", "保山", "昭通", "丽江", "普洱", "临沧", "楚雄", "红河", "文山", "西双版纳", "大理", "德宏", "怒江", "迪庆"],
        "黑龙江": ["哈尔滨", "齐齐哈尔", "鸡西", "鹤岗", "双鸭山", "大庆", "伊春", "佳木斯", "七台河", "牡丹江", "黑河", "绥化", "大兴安岭"],
        "吉林": ["长春", "吉林", "四平", "辽源", "通化", "白山", "松原", "白城", "延边"],
        "山西": ["太原", "大同", "阳泉", "长治", "晋城", "朔州", "晋中", "运城", "忻州", "临汾", "吕梁"],
        "贵州": ["贵阳", "六盘水", "遵义", "安顺", "毕节", "铜仁", "黔西南", "黔东南", "黔南"],
        "甘肃": ["兰州", "嘉峪关", "金昌", "白银", "天水", "武威", "张掖", "平凉", "酒泉", "庆阳", "定西", "陇南", "临夏", "甘南"],
        "海南": ["海口", "三亚", "三沙", "儋州"],
        "内蒙古": ["呼和浩特", "包头", "乌海", "赤峰", "通辽", "鄂尔多斯", "呼伦贝尔", "巴彦淖尔", "乌兰察布", "兴安", "锡林郭勒", "阿拉善"],
        "宁夏": ["银川", "石嘴山", "吴忠", "固原", "中卫"],
        "青海": ["西宁", "海东", "海北", "黄南", "海南", "果洛", "玉树", "海西"],
        "新疆": ["乌鲁木齐", "克拉玛依", "吐鲁番", "哈密", "昌吉", "博尔塔拉", "巴音郭楞", "阿克苏", "克孜勒苏", "喀什", "和田", "伊犁", "塔城", "阿勒泰"],
        "西藏": ["拉萨", "日喀则", "昌都", "林芝", "山南", "那曲", "阿里"]
    },

    getProvinceForCity(city) {
        if (!city || city === '全国') return null;
        for (const [prov, cities] of Object.entries(this.provinces)) {
            if (cities.includes(city)) {
                if (prov === '直辖市') {
                    return city; 
                }
                return prov;
            }
        }
        return city; 
    },

    // --- Native System UI ---
    useNativeSystemUI() {
        const mockSystemEls = document.querySelectorAll('.status-bar, .notch, .home-indicator');
        mockSystemEls.forEach(el => el.remove());
    },

    isNativeAppRuntime() {
        const protocol = (window.location && window.location.protocol) || '';
        return protocol === 'capacitor:' || protocol === 'file:' || !!window.Capacitor;
    },

    getMockPageData(page = 0) {
        const source = Array.isArray(window.mockData) ? window.mockData : [];
        const city = this.state.currentCity;
        const kw = (this.state.searchKeyword || '').trim();
        let rows = source.filter(item => {
            if (city && city !== '全国') {
                if (!item.city || !String(item.city).includes(city)) return false;
            }
            if (kw) {
                const t = `${item.title || ''} ${item.purchaser || ''} ${item.city || ''}`;
                if (!t.includes(kw)) return false;
            }
            return true;
        });
        rows.sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
        const pageSize = 20;
        const start = Math.max(0, page * pageSize);
        const end = start + pageSize;
        return {
            data: rows.slice(start, end),
            hasMore: end < rows.length
        };
    },

    init() {
        // Load User
        this.loadUser();
        this.state.appStartedAt = Date.now();
        const desiredApi = String(DEFAULT_API_BASE || '').trim().replace(/\/+$/, '');
        if (desiredApi) {
            const currentApi = (this.safeStorageGet('BIDDING_API_BASE') || '').trim().replace(/\/+$/, '');
            if (currentApi !== desiredApi) this.safeStorageSet('BIDDING_API_BASE', desiredApi);
        }
        try {
            if (window.SubManager && window.SubManager.setAuth) {
                window.SubManager.setAuth(this.getApiBase(), this.getAuthToken());
            }
        } catch (e) {}
        if (this.getAuthToken()) {
            this.syncMemberFromServer();
        }

        if (this.isNativeAppRuntime()) {
            document.body.classList.add('native-app');
        }
        
        // Remove mock status bar/notch/home-indicator and use native system UI
        this.useNativeSystemUI();
        
        // Initial Tab State (Home)
        this.state.currentTab = 0;

        // Initial Home Layout
        this.switchTab(0);

        // Initial Fetch
        this.initDefaultCityAndFetch();
        
        // Bind Global Events
        window.switchTab = this.switchTab.bind(this);
        window.toggleCitySelection = this.toggleCitySelection.bind(this);
        window.selectCity = this.selectCity.bind(this);
        window.filterList = this.filterList.bind(this);
        window.toggleSearch = this.toggleSearch.bind(this);
        window.showAddSubDialog = this.showAddSubDialog.bind(this);
        window.closeSubDialog = this.closeSubDialog.bind(this);
        window.saveSubscription = this.saveSubscription.bind(this);
        window.selectRegion = (el, type) => this.selectRegion(el, type);
        window.deleteSub = this.deleteSub.bind(this);
        window.toggleSubPush = this.toggleSubPush.bind(this);
        window.editSub = this.editSub.bind(this);
        window.showSubDetail = this.showSubDetail.bind(this);
        window.jumpToSearch = this.jumpToSearch.bind(this);
        window.showDetail = this.showDetail.bind(this);
        window.hideDetail = this.hideDetail.bind(this);
        window.filterCity = this.filterCity.bind(this);
        window.toggleProvince = this.toggleProvince.bind(this);
        window.login = this.login.bind(this);
        window.openLoginModal = this.openLoginModal.bind(this);
        window.closeLoginModal = this.closeLoginModal.bind(this);
        window.switchAuthMode = this.switchAuthMode.bind(this);
        window.handleAuth = this.handleAuth.bind(this);
        window.logout = this.logout.bind(this);
        window.activateMember = this.activateMember.bind(this);
        window.buyMember = this.buyMember.bind(this);
        window.switchBanner = this.switchBanner.bind(this);
        // Expose switchVipCard globally for tab switching
        window.switchVipCard = this.switchVipCard.bind(this);
        
        // Start Carousel
        this.startCarousel();
        this.switchBanner(0);
        
        // Infinite Scroll Listener
        const listContainer = document.getElementById('content-area');
        if (listContainer) {
            listContainer.addEventListener('scroll', this.handleScroll.bind(this));
        }

        this.setupIdleAutoRefresh();
        this.setupLiveRefresh();
        this.setupSubPushMonitor();
        this.promptNotifyOnFirstLaunch();
        
        console.log('App Initialized');
    },

    setupLiveRefresh() {
        if (this.state.dataRefreshTimer) clearInterval(this.state.dataRefreshTimer);
        const refreshIfNeeded = () => {
            if (document.hidden) return;
            if (this.state.loading || this.state.loadingMore) return;
            this.fetchData(0, false);
            this.renderHomeStatsStrip();
            this.checkSubPushAndNotify();
        };
        window.addEventListener('online', refreshIfNeeded);
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                refreshIfNeeded();
                if (this.isNativeAppRuntime() && this.state.currentCity === '全国') {
                    this.startAutoDetectCity();
                }
            }
        });
        setTimeout(() => {
            if (document.hidden) return;
            if (this.state.currentTab !== 0) return;
            if (this.state.loading || this.state.loadingMore) return;
            if (Array.isArray(this.state.data) && this.state.data.length > 0) return;
            refreshIfNeeded();
        }, 1200);
        this.state.dataRefreshTimer = setInterval(refreshIfNeeded, 60000);
    },

    hasLocalNotifyPlugin() {
        return !!(window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifyPlugin && window.Capacitor.Plugins.LocalNotifyPlugin.notify);
    },

    async waitForLocalNotifyReady(maxWaitMs = 2000) {
        const start = Date.now();
        while (Date.now() - start < maxWaitMs) {
            if (this.hasLocalNotifyPlugin()) return true;
            await new Promise(r => setTimeout(r, 80));
        }
        return this.hasLocalNotifyPlugin();
    },

    ensureNotifyGuide() {
        if (document.getElementById('br-notify-guide')) return;
        const wrap = document.createElement('div');
        wrap.id = 'br-notify-guide';
        wrap.style.cssText = 'position:fixed;inset:0;display:none;align-items:center;justify-content:center;z-index:99999;background:rgba(0,0,0,0.45);padding:24px;';
        wrap.innerHTML = `
            <div style="width:100%;max-width:320px;background:#fff;border-radius:16px;overflow:hidden;">
                <div style="padding:16px 16px 8px 16px;font-size:16px;font-weight:700;color:#111;">开启通知提醒</div>
                <div id="br-notify-guide-desc" style="padding:0 16px 16px 16px;font-size:14px;line-height:1.5;color:#333;">订阅有更新时，会通过系统通知提醒你。</div>
                <div style="display:flex;gap:10px;justify-content:flex-end;padding:0 16px 16px 16px;">
                    <button id="br-notify-guide-cancel" style="flex:1;height:40px;border-radius:10px;border:1px solid #ddd;background:#fff;color:#333;font-size:15px;">暂不</button>
                    <button id="br-notify-guide-ok" style="flex:1;height:40px;border-radius:10px;border:none;background:#007AFF;color:#fff;font-size:15px;font-weight:600;">去开启</button>
                </div>
            </div>
        `;
        document.body.appendChild(wrap);
        const cancelBtn = document.getElementById('br-notify-guide-cancel');
        const okBtn = document.getElementById('br-notify-guide-ok');
        cancelBtn.addEventListener('click', () => this.hideNotifyGuide(), { passive: true });
        okBtn.addEventListener('click', () => {
            this.requestLocalNotifyPermission().then(granted => {
                if (granted) {
                    this.safeStorageSet('br_notify_granted', '1');
                    this.showToast('通知已开启');
                    this.hideNotifyGuide();
                    this.checkSubPushAndNotify();
                } else {
                    alert('未开启通知。请到：设置 → 通知 → 招投标雷达 开启“允许通知”。');
                }
            });
        }, { passive: true });
    },

    showNotifyGuide(desc = '') {
        if (!this.isNativeAppRuntime()) return;
        this.ensureNotifyGuide();
        const el = document.getElementById('br-notify-guide');
        const d = document.getElementById('br-notify-guide-desc');
        if (d && desc) d.innerText = desc;
        if (el) el.style.display = 'flex';
    },

    hideNotifyGuide() {
        const el = document.getElementById('br-notify-guide');
        if (el) el.style.display = 'none';
    },

    async requestLocalNotifyPermission() {
        if (!this.hasLocalNotifyPlugin()) {
            await this.waitForLocalNotifyReady(2000);
        }
        if (!this.hasLocalNotifyPlugin()) return false;
        try {
            const ret = await window.Capacitor.Plugins.LocalNotifyPlugin.requestPermission();
            return !!(ret && ret.granted);
        } catch (e) {
            return false;
        }
    },

    async promptLocalNotifyPermission(message = '') {
        if (!this.hasLocalNotifyPlugin()) {
            await this.waitForLocalNotifyReady(2500);
        }
        if (!this.hasLocalNotifyPlugin()) return { granted: false, status: 'unavailable' };
        const p = window.Capacitor.Plugins.LocalNotifyPlugin;
        if (p && typeof p.prompt === 'function') {
            try {
                const ret = await p.prompt({
                    title: '开启通知提醒',
                    message: message || '订阅有更新时，会通过系统通知提醒你。'
                });
                const granted = !!(ret && ret.granted);
                if (granted) this.safeStorageSet('br_notify_granted', '1');
                return { granted, status: (ret && ret.status) || (granted ? 'authorized' : 'denied') };
            } catch (e) {
                return { granted: false, status: 'error' };
            }
        }
        this.showNotifyGuide(message || '订阅有更新时，会通过系统通知提醒你。');
        return { granted: false, status: 'guide' };
    },

    async sendLocalNotify(title, body, id) {
        if (!this.hasLocalNotifyPlugin()) return false;
        try {
            const ret = await window.Capacitor.Plugins.LocalNotifyPlugin.notify({
                title: String(title || '招投标雷达'),
                body: String(body || ''),
                id: String(id || '')
            });
            return !!(ret && ret.scheduled);
        } catch (e) {
            return false;
        }
    },

    promptNotifyOnFirstLaunch() {
        if (!this.isNativeAppRuntime()) return;
        const grantedFlag = (this.safeStorageGet('br_notify_granted') || '').trim();
        if (grantedFlag === '1') return;
        const tryShow = (attempt = 0) => {
            if (document.hidden) {
                if (attempt < 10) setTimeout(() => tryShow(attempt + 1), 800);
                return;
            }
            this.promptLocalNotifyPermission('订阅有更新时，会通过系统通知提醒你。').then(ret => {
                if (ret && ret.granted) this.showToast('通知已开启');
            });
        };
        setTimeout(() => {
            this.waitForLocalNotifyReady(2500).then(() => tryShow(0));
        }, 1500);
    },

    setupSubPushMonitor() {
        if (!this.isNativeAppRuntime()) return;
        if (this.state.subPushTimer) clearInterval(this.state.subPushTimer);
        this.state.subPushTimer = setInterval(() => {
            this.checkSubPushAndNotify();
        }, 120000);
    },

    async checkSubPushAndNotify() {
        if (!this.isNativeAppRuntime()) return;
        if (document.hidden) return;
        if (this.state.subPushInFlight) return;
        if (!window.SubManager || typeof window.SubManager.getSubs !== 'function') return;
        const subs = (window.SubManager.getSubs() || []).filter(s => s && s.pushEnabled);
        if (subs.length === 0) return;
        if (!this.hasLocalNotifyPlugin()) return;
        this.state.subPushInFlight = true;
        try {
            const now = Date.now();
            const ordered = subs
                .slice()
                .sort((a, b) => (Number(a.lastCheckTime || 0) - Number(b.lastCheckTime || 0)))
                .slice(0, 10);
            for (const sub of ordered) {
                const prev = Number(sub.unreadCount || 0);
                const lastNotifiedAt = Number(sub.lastNotifiedAt || 0);
                if (lastNotifiedAt && now - lastNotifiedAt < 10 * 60 * 1000) continue;
                let count = 0;
                try {
                    const items = await this.querySubItems(sub, 120, 2);
                    const lastReadAt = Number(sub.lastReadAt || 0);
                    if (!lastReadAt) count = items.length;
                    else {
                        count = items.filter(item => {
                            const dt = this.parseDate(item.datetime);
                            if (!dt || isNaN(dt.getTime())) return true;
                            return dt.getTime() > lastReadAt;
                        }).length;
                    }
                } catch (e) {
                    continue;
                }
                if (count > prev) {
                    const delta = count - prev;
                    const keywords = Array.isArray(sub.keywords) ? sub.keywords.join('、') : String(sub.keywords || '');
                    const scope = sub.scopeType === 'city' ? (sub.scopeValue || '') : (sub.scopeType === 'province' ? (sub.scopeValue || '') : '全国');
                    const title = '订阅更新';
                    const body = `${scope} · ${keywords} 新增 ${delta} 条`;
                    const id = `sub_${sub.id}_${now}`;
                    const ok = await this.sendLocalNotify(title, body, id);
                    if (ok) {
                        window.SubManager.updateSub(sub.id, { unreadCount: count, lastCheckTime: now, lastNotifiedAt: now }, true);
                    } else {
                        window.SubManager.updateSub(sub.id, { unreadCount: count, lastCheckTime: now }, true);
                    }
                } else {
                    window.SubManager.updateSub(sub.id, { unreadCount: count, lastCheckTime: now }, true);
                }
            }
            if (this.state.currentTab === 1) this.renderSubscriptionList();
        } finally {
            this.state.subPushInFlight = false;
        }
    },

    setupIdleAutoRefresh() {
        const events = ['click', 'touchstart', 'keydown', 'scroll', 'mousemove'];
        const reset = this.resetIdleAutoRefreshTimer.bind(this);
        events.forEach(evt => window.addEventListener(evt, reset, { passive: true }));
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) this.resetIdleAutoRefreshTimer();
        });
        this.resetIdleAutoRefreshTimer();
    },

    resetIdleAutoRefreshTimer() {
        this.state.lastActivityAt = Date.now();
        if (this.state.idleRefreshTimer) clearTimeout(this.state.idleRefreshTimer);
        this.state.idleRefreshTimer = setTimeout(() => {
            const idleMs = Date.now() - (this.state.lastActivityAt || 0);
            if (idleMs >= 5 * 60 * 1000) {
                window.location.reload();
            }
        }, 5 * 60 * 1000);
    },

    // --- Carousel Logic ---
    
    startCarousel() {
        if (this.state.bannerTimer) clearInterval(this.state.bannerTimer);
        this.state.bannerTimer = setInterval(() => {
            if (document.hidden) return;
            if (this.state.currentTab !== 0) return;
            const nextIndex = (this.state.bannerIndex + 1) % 2;
            this.switchBanner(nextIndex);
        }, 5000);
    },
    
    switchBanner(index) {
        this.state.bannerIndex = index;
        
        // Update Track Transform
        const track = document.getElementById('carousel-track');
        if (track) {
            track.style.transform = `translateX(-${index * 50}%)`;
        }
        
        // Update Indicators
        const indicators = document.querySelectorAll('.indicator');
        indicators.forEach((ind, i) => {
            if (i === index) ind.classList.add('active');
            else ind.classList.remove('active');
        });
        
        // Update Background Image
        const bg = document.querySelector('.custom-header-bg');
        if (bg) {
            if (index === 0) {
                bg.classList.remove('slide-2');
                bg.classList.add('slide-1');
            } else {
                bg.classList.remove('slide-1');
                bg.classList.add('slide-2');
            }
        }
        
        // Reset timer on manual switch
        if (this.state.bannerTimer) {
            clearInterval(this.state.bannerTimer);
        }
        this.state.bannerTimer = setInterval(() => {
            if (document.hidden) return;
            if (this.state.currentTab !== 0) return;
            const nextIndex = (this.state.bannerIndex + 1) % 2;
            this.switchBanner(nextIndex);
        }, 5000);
    },

    // --- API Logic ---
    safeStorageGet(key) {
        try {
            return localStorage.getItem(key) || '';
        } catch (e) {
            return '';
        }
    },

    safeStorageSet(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (e) {}
    },

    getAuthToken() {
        return (this.safeStorageGet('br_token') || '').trim();
    },

    setAuthToken(token) {
        const t = String(token || '').trim();
        if (!t) {
            try { localStorage.removeItem('br_token'); } catch (e) {}
            return;
        }
        this.safeStorageSet('br_token', t);
    },

    getApiBase() {
        const fromStorage = (this.safeStorageGet('BIDDING_API_BASE') || '').trim();
        if (fromStorage) return fromStorage.replace(/\/+$/, '');
        const fromGlobal = (window.BIDDING_API_BASE || '').trim();
        if (fromGlobal) return fromGlobal.replace(/\/+$/, '');
        if (this.state.apiBaseResolved) return String(this.state.apiBaseResolved || '').replace(/\/+$/, '');
        return DEFAULT_API_BASE;
    },

    getDailyReportBase() {
        const fromStorage = (this.safeStorageGet('BIDDING_DAILY_REPORT_BASE') || '').trim();
        if (fromStorage) return fromStorage.replace(/\/+$/, '');
        const fromGlobal = (window.BIDDING_DAILY_REPORT_BASE || '').trim();
        if (fromGlobal) return fromGlobal.replace(/\/+$/, '');
        return '';
    },

    getYesterdayDateKey() {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const y = new Date(startOfToday - 24 * 60 * 60 * 1000);
        const pad = (n) => String(n).padStart(2, '0');
        return `${y.getFullYear()}-${pad(y.getMonth() + 1)}-${pad(y.getDate())}`;
    },

    async tryLoadYesterdayReportFromStatic() {
        const kw = (this.state.searchKeyword || '').trim();
        if (kw) return null;
        const base = this.getDailyReportBase();
        if (!base) return null;
        const dateKey = this.getYesterdayDateKey();
        const url = `${base}/daily/${dateKey}.json`;
        try {
            const res = await this.requestJson(url);
            if (!res.ok || !res.json) return null;
            const report = res.json;
            if (!report || report.version !== 1 || report.date !== dateKey) return null;
            const city = (this.state.currentCity || '全国').trim();
            const stat = (city && city !== '全国' && report.cities && report.cities[city]) ? report.cities[city] : report.country;
            if (!stat) return null;
            return {
                date: report.date,
                count: Number(stat.count || 0),
                totalYi: String(stat.totalYi || '0.00')
            };
        } catch (e) {
            return null;
        }
    },

    normalizeCityName(name) {
        const raw = String(name || '').trim();
        if (!raw) return '';
        return raw
            .replace(/(特别行政区|自治州|地区)$/g, '')
            .replace(/(市)$/g, '')
            .trim();
    },

    hasLocationPlugin() {
        return !!(window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocationPlugin && window.Capacitor.Plugins.LocationPlugin.getCity);
    },

    isKnownCity(city) {
        if (!city) return false;
        if (city === '全国') return true;
        try {
            return !!this.getProvinceForCity(city);
        } catch (e) {
            return false;
        }
    },

    async getDeviceCity(timeoutMs = 12000) {
        if (!this.hasLocationPlugin()) return '';
        const ret = await window.Capacitor.Plugins.LocationPlugin.getCity({ timeoutMs });
        const city = this.normalizeCityName(ret && ret.city);
        if (this.isKnownCity(city)) return city;
        return '';
    },

    async startAutoDetectCity() {
        if (this.state.locationAutoInFlight) return;
        if (this.state.locationAutoDone) return;
        const kw = (this.state.searchKeyword || '').trim();
        if (kw) return;
        const saved = this.normalizeCityName(this.safeStorageGet('br_default_city'));
        if (saved && this.isKnownCity(saved)) {
            this.state.locationAutoDone = true;
            return;
        }
        if (this.state.currentCity && this.state.currentCity !== '全国') {
            this.state.locationAutoDone = true;
            return;
        }
        this.state.locationAutoInFlight = true;
        try {
            const city = await this.getDeviceCity(12000);
            const savedNow = this.normalizeCityName(this.safeStorageGet('br_default_city'));
            const kwNow = (this.state.searchKeyword || '').trim();
            if (city && !savedNow && !kwNow && this.state.currentCity === '全国') {
                this.state.currentCity = city;
                this.safeStorageSet('br_default_city', city);
                const el = document.getElementById('current-city');
                if (el) el.innerText = city;
                this.fetchData(0, false);
                this.state.locationAutoDone = true;
            } else if (!city) {
                this.state.locationAutoRetryCount = (this.state.locationAutoRetryCount || 0) + 1;
                if (this.state.locationAutoRetryCount >= 3) this.state.locationAutoDone = true;
                else setTimeout(() => this.startAutoDetectCity(), 2000);
            } else {
                this.state.locationAutoDone = true;
            }
        } catch (e) {
            const msg = String((e && e.message) || '');
            if (msg.includes('DENIED')) {
                this.state.locationAutoDone = true;
            } else {
                this.state.locationAutoRetryCount = (this.state.locationAutoRetryCount || 0) + 1;
                if (this.state.locationAutoRetryCount >= 3) this.state.locationAutoDone = true;
                else setTimeout(() => this.startAutoDetectCity(), 2000);
            }
        } finally {
            this.state.locationAutoInFlight = false;
        }
    },

    async initDefaultCityAndFetch() {
        const saved = this.normalizeCityName(this.safeStorageGet('br_default_city'));
        if (saved && this.isKnownCity(saved)) {
            this.state.currentCity = saved;
            const el = document.getElementById('current-city');
            if (el) el.innerText = saved;
            this.fetchData(0, false);
            return;
        }
        this.fetchData(0, false);
        if (this.isNativeAppRuntime()) {
            this.startAutoDetectCity();
        }
    },

    hasCapacitorHttp() {
        return !!(window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.CapacitorHttp && window.Capacitor.Plugins.CapacitorHttp.get);
    },

    hasNativeHttpPlugin() {
        return !!(window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.NativeHttpPlugin && window.Capacitor.Plugins.NativeHttpPlugin.get);
    },

    async waitForNativeHttpReady(maxWaitMs = 1500) {
        const start = Date.now();
        while (Date.now() - start < maxWaitMs) {
            if (this.hasCapacitorHttp() || this.hasNativeHttpPlugin()) return true;
            await new Promise(r => setTimeout(r, 80));
        }
        return this.hasCapacitorHttp() || this.hasNativeHttpPlugin();
    },

    async requestJson(url, options = {}) {
        const isAbs = /^https?:\/\//.test(url);
        const method = String(options.method || 'GET').toUpperCase();
        const bodyObj = options.body;
        const headers = {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
            'Referer': 'https://servicewechat.com/wx23456789/devtools/page-frame.html',
            'Origin': 'https://servicewechat.com',
            'Cache-Control': 'no-cache, no-store, max-age=0',
            'Pragma': 'no-cache'
        };
        try {
            const token = this.getAuthToken();
            const shouldAuth = token && /\/api\//.test(url);
            if (shouldAuth) headers['Authorization'] = `Bearer ${token}`;
        } catch (e) {}
        if (options.headers) {
            try { Object.assign(headers, options.headers); } catch (e) {}
        }
        let fetchBody = undefined;
        if (bodyObj != null) {
            if (!headers['Content-Type']) headers['Content-Type'] = 'application/json';
            fetchBody = typeof bodyObj === 'string' ? bodyObj : JSON.stringify(bodyObj);
        }
        const withTimeout = (p, ms) => new Promise((resolve, reject) => {
            const t = setTimeout(() => reject(new Error('NATIVE_HTTP_TIMEOUT')), ms);
            Promise.resolve(p).then(v => {
                clearTimeout(t);
                resolve(v);
            }, e => {
                clearTimeout(t);
                reject(e);
            });
        });
        const coldStart = this.state.appStartedAt && (Date.now() - this.state.appStartedAt < 30000);
        const nativeTimeoutMs = coldStart ? 18000 : 12000;
        if (isAbs && this.isNativeAppRuntime() && !this.hasCapacitorHttp() && !this.hasNativeHttpPlugin()) {
            await this.waitForNativeHttpReady(1500);
        }
        if (isAbs && this.hasCapacitorHttp() && method === 'GET') {
            const ret = await withTimeout(window.Capacitor.Plugins.CapacitorHttp.get({ url, headers }), nativeTimeoutMs);
            let json = ret && ret.data;
            if (typeof json === 'string') {
                try { json = JSON.parse(json); } catch (e) {}
            }
            return { ok: (ret && ret.status >= 200 && ret.status < 300), status: (ret && ret.status) || 0, json };
        }
        if (isAbs && this.hasNativeHttpPlugin() && method === 'GET') {
            const ret = await withTimeout(window.Capacitor.Plugins.NativeHttpPlugin.get({
                url,
                headers
            }), nativeTimeoutMs);
            const status = (ret && ret.status) || 0;
            let json = ret && ret.data;
            if (typeof json === 'string') {
                try { json = JSON.parse(json); } catch (e) {}
            }
            return { ok: status >= 200 && status < 300, status, json };
        }
        const resp = await this.fetchWithTimeout(url, { cache: 'no-store', headers, method, body: fetchBody }, 12000);
        let json = null;
        try { json = await resp.json(); } catch (e) {}
        return { ok: resp.ok, status: resp.status, json };
    },

    sortRowsByDatetimeDesc(rows = []) {
        return (rows || []).sort((a, b) => {
            const ad = this.parseDate(a && a.datetime);
            const bd = this.parseDate(b && b.datetime);
            const at = ad && !isNaN(ad.getTime()) ? ad.getTime() : 0;
            const bt = bd && !isNaN(bd.getTime()) ? bd.getTime() : 0;
            if (bt !== at) return bt - at;
            const ai = a && a.id != null ? Number(a.id) : 0;
            const bi = b && b.id != null ? Number(b.id) : 0;
            return bi - ai;
        });
    },

    filterRowsToRecentDays(rows = []) {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const cutoff = startOfToday - (this.state.maxDays * 24 * 60 * 60 * 1000);
        return (rows || []).filter(r => {
            const dt = this.parseDate(r && r.datetime);
            const ts = dt && !isNaN(dt.getTime()) ? dt.getTime() : 0;
            if (!ts) return true;
            return ts >= cutoff;
        });
    },

    buildListCandidates(page, options = {}) {
        const city = options.city ?? this.state.currentCity;
        const keyword = options.keyword ?? this.state.searchKeyword;
        const qs = new URLSearchParams({ page: String(page) });
        qs.append('_ts', String(Date.now()));
        if (city && city !== '全国') qs.append('city', city);
        if (keyword) qs.append('keyword', keyword);
        const list = [];
        const apiBase = this.getApiBase();
        if (apiBase) list.push(`${apiBase}/api/list?${qs.toString()}`);
        const proto = (window.location && window.location.protocol) || '';
        if (proto === 'http:' || proto === 'https:') {
            list.push(`/api/list?${qs.toString()}`);
        }
        const remoteParams = new URLSearchParams();
        remoteParams.set('uid', '1');
        remoteParams.set('page', String(page));
        if (city && city !== '全国') {
            const province = this.getProvinceForCity(city) || city;
            remoteParams.set('province', province);
            remoteParams.set('city', city);
        }
        remoteParams.set('timestamp', String(Math.floor(Date.now() / 1000)));
        remoteParams.set('_ts', String(Date.now()));
        const remoteUrl = `https://zhaobiao.agecms.com/api/list?${remoteParams.toString()}`;
        const forceRemote = !!options.forceRemote;
        if (forceRemote) {
            return Array.from(new Set([remoteUrl, ...list]));
        }
        if (!apiBase) list.push(remoteUrl);
        return Array.from(new Set(list));
    },

    normalizeListPayload(payload, options = {}) {
        if (!payload || payload.code !== 1 || !Array.isArray(payload.data)) return null;
        const city = options.city ?? this.state.currentCity;
        const keyword = options.keyword ?? this.state.searchKeyword;
        let data = payload.data;
        if (!payload.syncMeta) {
            if (city && city !== '全国') {
                data = data.filter(i => i && i.city && String(i.city).includes(city));
            }
            if (keyword) {
                data = data.filter(i => {
                    const t = `${i.title || ''} ${i.purchaser || ''} ${i.city || ''}`;
                    return t.includes(keyword);
                });
            }
        }
        return {
            code: 1,
            msg: payload.msg || 'success',
            data,
            total: payload.total || data.length,
            syncMeta: payload.syncMeta || (options.__source === 'remote'
                ? { actionAt: Date.now(), successAt: Date.now() }
                : { actionAt: 0, successAt: 0 }),
            statsMeta: payload.statsMeta || null
        };
    },

    async fetchListPage(page, options = {}) {
        const candidates = this.buildListCandidates(page, options);
        let lastError = null;
        const city = options.city ?? this.state.currentCity;
        const keyword = options.keyword ?? this.state.searchKeyword;
        let staleLocalFallback = null;
        for (const url of candidates) {
            try {
                const res = await this.requestJson(url);
                if (!res.ok || !res.json) continue;
                const isLocalList = /\/api\/list\?/.test(url) || /\/api\/list$/.test(url);
                const normalized = this.normalizeListPayload(res.json, { ...options, __source: isLocalList ? 'local' : 'remote' });
                if (!normalized) continue;
                normalized.__source = isLocalList ? 'local' : 'remote';
                if (page === 0 && isLocalList && normalized.syncMeta) {
                    const successAt = Number(normalized.syncMeta.successAt || 0);
                    const stale = !successAt || (Date.now() - successAt > 3 * 60 * 1000);
                    if (stale && candidates.length > 1) {
                        staleLocalFallback = normalized;
                        continue;
                    }
                }
                if (page === 0 && city && city !== '全国' && !String(keyword || '').trim() && Array.isArray(normalized.data) && normalized.data.length === 0) {
                    continue;
                }
                return normalized;
            } catch (e) {
                lastError = e;
            }
        }
        if (staleLocalFallback) return staleLocalFallback;
        throw lastError || new Error('数据接口不可用');
    },

    buildDetailCandidates(id) {
        const list = [];
        const apiBase = this.getApiBase();
        if (apiBase) list.push(`${apiBase}/api/detail?id=${encodeURIComponent(id)}`);
        const proto = (window.location && window.location.protocol) || '';
        if (proto === 'http:' || proto === 'https:') {
            list.push(`/api/detail?id=${encodeURIComponent(id)}`);
        }
        list.push(`https://zhaobiao.agecms.com/api/detail?id=${encodeURIComponent(id)}`);
        return Array.from(new Set(list));
    },

    async fetchDetailById(id) {
        const candidates = this.buildDetailCandidates(id);
        let lastError = null;
        for (const url of candidates) {
            try {
                const res = await this.requestJson(url);
                if (!res.ok || !res.json) continue;
                if (res.json.code === 1 && res.json.data) return res.json;
            } catch (e) {
                lastError = e;
            }
        }
        throw lastError || new Error('详情接口不可用');
    },

    getApiBaseCandidates() {
        const fromStorage = (this.safeStorageGet('BIDDING_API_BASE') || '').trim();
        const fromGlobal = (window.BIDDING_API_BASE || '').trim();
        const candidates = [];
        candidates.push(DEFAULT_API_BASE);
        if (fromStorage) candidates.push(fromStorage.replace(/\/+$/, ''));
        if (fromGlobal) candidates.push(fromGlobal.replace(/\/+$/, ''));
        if (this.state.apiBaseResolved) candidates.push(this.state.apiBaseResolved);
        const host = (window.location && window.location.hostname) || '';
        if (host === 'localhost' || host === '127.0.0.1') {
            candidates.push('http://127.0.0.1:3002');
            candidates.push('http://127.0.0.1:3001');
        }
        if (this.isNativeAppRuntime()) {
            candidates.push('http://192.168.155.201:3002');
            candidates.push('http://192.168.3.152:3002');
            candidates.push('http://127.0.0.1:3002');
            candidates.push('http://192.168.155.201:3001');
            candidates.push('http://192.168.3.152:3001');
            candidates.push('http://127.0.0.1:3001');
        }
        if (!candidates.length) candidates.push('');
        return [...new Set(candidates)];
    },

    async resolveApiBase() {
        const now = Date.now();
        if (this.state.apiBaseResolved && now - (this.state.apiBaseCheckedAt || 0) < 60000) {
            return this.state.apiBaseResolved;
        }
        const candidates = this.getApiBaseCandidates();
        for (const base of candidates) {
            if (!base) continue;
            try {
                const resp = await this.fetchWithTimeout(`${base}/api/list?page=0&_ping=${Date.now()}`, { cache: 'no-store' }, 1500);
                if (resp && resp.ok) {
                    this.state.apiBaseResolved = base;
                    this.state.apiBaseCheckedAt = now;
                    this.state.apiOnlineAt = now;
                    this.safeStorageSet('BIDDING_API_BASE', base);
                    return base;
                }
            } catch (e) {}
        }
        this.state.apiBaseCheckedAt = now;
        this.state.apiBaseResolved = '';
        return '';
    },

    fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
        if (typeof AbortController === 'undefined') {
            return fetch(url, options);
        }
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        return fetch(url, { ...options, signal: controller.signal })
            .finally(() => clearTimeout(timer));
    },

    apiUrl(pathWithQuery, overrideBase = '') {
        const base = overrideBase || this.state.apiBaseResolved || '';
        return base ? `${base}${pathWithQuery}` : pathWithQuery;
    },

    applyCurrentFilters(rows) {
        const city = this.state.currentCity;
        const kw = (this.state.searchKeyword || '').trim();
        return (rows || []).filter(item => {
            if (city && city !== '全国') {
                if (!item.city || !String(item.city).includes(city)) return false;
            }
            if (kw) {
                const t = `${item.title || ''} ${item.purchaser || ''} ${item.city || ''}`;
                if (!t.includes(kw)) return false;
            }
            return true;
        });
    },

    async fetchLocalList(page = 0) {
        const resolvedBase = await this.resolveApiBase();
        if (!resolvedBase) throw new Error('LOCAL_BASE_EMPTY');
        let url = this.apiUrl(`/api/list?page=${page}&_ts=${Date.now()}`, resolvedBase);
        if (this.state.currentCity !== '全国') {
            url += `&city=${encodeURIComponent(this.state.currentCity)}`;
        }
        if (this.state.searchKeyword) {
            url += `&keyword=${encodeURIComponent(this.state.searchKeyword)}`;
        }
        const resp = await this.fetchWithTimeout(url, {
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache, no-store, max-age=0',
                'Pragma': 'no-cache'
            }
        }, 9000);
        if (!resp.ok) throw new Error(`LOCAL_HTTP_${resp.status}`);
        const json = await resp.json();
        if (!(json && json.code === 1 && Array.isArray(json.data))) throw new Error(json && json.msg ? String(json.msg) : 'LOCAL_INVALID_DATA');
        if (json.syncMeta) {
            this.state.backendSyncActionAt = json.syncMeta.actionAt || this.state.backendSyncActionAt;
            this.state.backendSyncSuccessAt = json.syncMeta.successAt || this.state.backendSyncSuccessAt;
        }
        if (json.statsMeta && json.statsMeta.text) {
            this.state.homeStatsText = json.statsMeta.text;
            this.state.homeStatsAt = Date.now();
            if (this.state.currentTab === 0) this.renderHomeStatsHost();
        }
        return {
            data: json.data,
            hasMore: json.data.length > 0
        };
    },

    async fetchRemoteList(page = 0) {
        const params = new URLSearchParams();
        params.set('uid', '1');
        params.set('page', String(page));
        if (this.state.currentCity && this.state.currentCity !== '全国') {
            const city = this.state.currentCity;
            const province = this.getProvinceForCity(city) || city;
            params.set('province', province);
            params.set('city', city);
        }
        params.set('timestamp', String(Math.floor(Date.now() / 1000)));
        const remoteUrl = `https://zhaobiao.agecms.com/api/list?${params.toString()}`;
        let json;
        const commonHeaders = {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache, no-store, max-age=0',
            'Pragma': 'no-cache',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.2(0x18000236) NetType/WIFI Language/zh_CN'
        };
        if (this.isNativeAppRuntime()) {
            if (!(window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.NativeHttpPlugin && window.Capacitor.Plugins.NativeHttpPlugin.get)) {
                throw new Error('NATIVE_HTTP_UNAVAILABLE');
            }
            try {
                for (let attempt = 0; attempt < 3; attempt++) {
                    const r = await window.Capacitor.Plugins.NativeHttpPlugin.get({
                        url: remoteUrl,
                        headers: commonHeaders
                    });
                    const status = (r && r.status) || 0;
                    const text = (r && r.data) || '';
                    if (status >= 200 && status < 300) {
                        json = JSON.parse(text);
                        break;
                    }
                    if (status === 502 || status === 504) {
                        await new Promise(res => setTimeout(res, 300 + attempt * 400));
                        continue;
                    }
                    throw new Error(`REMOTE_HTTP_${status}`);
                }
                if (!json) throw new Error('REMOTE_HTTP_502');
            } catch (e) {
                const code = (e && (e.code || (e.error && e.error.code))) ? String(e.code || (e.error && e.error.code)) : '';
                throw new Error(code ? `NATIVE_HTTP_${code}` : (e && e.message ? e.message : 'NATIVE_HTTP_FAILED'));
            }
        } else {
            const resp = await this.fetchWithTimeout(remoteUrl, {
                cache: 'no-store',
                headers: {
                    ...commonHeaders
                }
            }, 9000);
            if (!resp.ok) throw new Error(`REMOTE_HTTP_${resp.status}`);
            json = await resp.json();
        }
        if (!(json && json.code === 1 && Array.isArray(json.data))) throw new Error('REMOTE_INVALID_DATA');
        return {
            data: this.applyCurrentFilters(json.data),
            hasMore: json.data.length > 0
        };
    },

    mergeUniqueById(listA = [], listB = []) {
        const map = new Map();
        [...listA, ...listB].forEach(item => {
            if (item && item.id != null) map.set(String(item.id), item);
        });
        return Array.from(map.values());
    },

    extractExactDatetimeFromText(text) {
        if (!text || typeof text !== 'string') return '';
        const m = text.match(/(\d{4}[年-]\d{1,2}[月-]\d{1,2}[日\s]*\s+\d{1,2}:\d{2})/);
        if (!m) return '';
        return m[1].replace(/年/g, '-').replace(/月/g, '-').replace(/日/g, '').trim();
    },

    async fetchRemoteArticle(id) {
        const url = `https://zhaobiao.agecms.com/api/detail?id=${encodeURIComponent(id)}`;
        const res = await this.requestJson(url);
        if (!res.ok || !res.json) throw new Error(`REMOTE_HTTP_${res.status || 0}`);
        return res.json;
    },

    async enrichItemsDatetime(items = []) {
        const ctxKey = `${this.state.currentCity || ''}||${(this.state.searchKeyword || '').trim()}`;
        const now = Date.now();
        if (this.state.timeEnriching) return;
        if (this.state.timeEnrichCtxKey === ctxKey && now - (this.state.timeEnrichAt || 0) < 2 * 60 * 1000) return;
        const queue = (items || []).filter(i => i && i.id != null && typeof i.datetime === 'string' && (i.datetime.includes('今天') || i.datetime.includes('昨天') || i.datetime.includes('前天')) && !/(\d{1,2}):(\d{2})/.test(i.datetime)).slice(0, 12);
        if (queue.length === 0) return;
        this.state.timeEnriching = true;
        try {
            const concurrency = 2;
            let idx = 0;
            const runOne = async () => {
                while (idx < queue.length) {
                    const item = queue[idx++];
                    const currentCtxKey = `${this.state.currentCity || ''}||${(this.state.searchKeyword || '').trim()}`;
                    if (currentCtxKey !== ctxKey) return;
                    try {
                        const json = await this.fetchRemoteArticle(item.id);
                        if (json && json.code === 1 && json.data && json.data.text) {
                            const exact = this.extractExactDatetimeFromText(json.data.text);
                            if (exact) item.datetime = exact;
                        }
                    } catch (e) {}
                }
            };
            await Promise.all(Array.from({ length: concurrency }, runOne));
            const currentCtxKey = `${this.state.currentCity || ''}||${(this.state.searchKeyword || '').trim()}`;
            if (currentCtxKey === ctxKey) {
                this.sortRowsByDatetimeDesc(this.state.data);
                this.state.data = this.filterRowsToRecentDays(this.state.data);
                if (this.state.currentTab === 0) this.renderList();
            }
            this.state.timeEnrichCtxKey = ctxKey;
            this.state.timeEnrichAt = Date.now();
        } finally {
            this.state.timeEnriching = false;
        }
    },

    async refreshYesterdayStatsFromRemote() {
        if (!this.isNativeAppRuntime()) return;
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
        const getFirstTs = async (p) => {
            for (let attempt = 0; attempt < 4; attempt++) {
                try {
                    const r = await this.fetchRemoteList(p);
                    const first = (r.data && r.data[0]) || null;
                    if (!first || !first.datetime) return null;
                    const dt = this.parseDate(first.datetime);
                    const ts = dt && !isNaN(dt.getTime()) ? dt.getTime() : 0;
                    if (ts) return ts;
                    return null;
                } catch (e) {
                    const msg = String((e && e.message) || '');
                    if (msg.includes('502') || msg.includes('504')) {
                        await new Promise(res => setTimeout(res, 250 + attempt * 350));
                        continue;
                    }
                    return null;
                }
            }
            return null;
        };
        let low = 0;
        let high = 1;
        try {
            let highTs = await getFirstTs(high);
            while (high < 2048 && highTs != null && highTs >= startOfToday) {
                low = high;
                high *= 2;
                highTs = await getFirstTs(high);
            }
            if (highTs == null) return;
            if (highTs >= startOfToday) return;
            let l = low + 1;
            let r = high;
            while (l < r) {
                const mid = Math.floor((l + r) / 2);
                const t = await getFirstTs(mid);
                if (t == null) {
                    r = mid;
                } else if (t < startOfToday) {
                    r = mid;
                } else {
                    l = mid + 1;
                }
            }
            const firstBeforeToday = l;
            let count = 0;
            let totalYuan = 0;
            for (let p = firstBeforeToday; p < firstBeforeToday + 120; p++) {
                let pageData;
                try {
                    pageData = await this.fetchRemoteList(p);
                } catch (e) {
                    const msg = String((e && e.message) || '');
                    if (msg.includes('502') || msg.includes('504')) continue;
                    break;
                }
                const rows = pageData.data || [];
                if (rows.length === 0) break;
                let shouldStop = false;
                for (const it of rows) {
                    const dt = this.parseDate(it.datetime);
                    const ts = dt && !isNaN(dt.getTime()) ? dt.getTime() : 0;
                    if (ts >= startOfYesterday && ts < startOfToday) {
                        count += 1;
                        totalYuan += this.parseAmountToYuan(it.bid_price || '');
                    } else if (ts && ts < startOfYesterday) {
                        shouldStop = true;
                        break;
                    }
                }
                if (shouldStop) break;
            }
            this.state.homeStatsText = `昨日新增 ${count} 条，商机 ${(totalYuan / 100000000).toFixed(2)} 亿+`;
            this.state.homeStatsAt = Date.now();
            if (this.state.currentTab === 0) this.renderHomeStatsHost();
        } catch (e) {}
    },

    calcYesterdayStatsFromRows(rows) {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
        let count = 0;
        let totalYuan = 0;
        for (const item of rows || []) {
            const dt = this.parseDate(item.datetime);
            const ts = dt && !isNaN(dt.getTime()) ? dt.getTime() : 0;
            if (ts >= startOfYesterday && ts < startOfToday) {
                count += 1;
                totalYuan += this.parseAmountToYuan(item.bid_price || '');
            }
        }
        return `昨日新增 ${count} 条，商机 ${(totalYuan / 100000000).toFixed(2)} 亿+`;
    },

    getYesterdayStatsFromRows(rows) {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
        let count = 0;
        let totalYuan = 0;
        let minTs = 0;
        for (const item of rows || []) {
            const dt = this.parseDate(item.datetime);
            const ts = dt && !isNaN(dt.getTime()) ? dt.getTime() : 0;
            if (ts) {
                if (!minTs || ts < minTs) minTs = ts;
                if (ts >= startOfYesterday && ts < startOfToday) {
                    count += 1;
                    totalYuan += this.parseAmountToYuan(item.bid_price || '');
                }
            }
        }
        return { count, totalYuan, startOfYesterday, startOfToday, minTs };
    },

    async computeYesterdayStatsByPaging() {
        const ctxKey = `${this.state.currentCity || ''}||${(this.state.searchKeyword || '').trim()}`;
        const now = Date.now();
        if (this.state.yStatsComputing) return;
        if (this.state.yStatsCtxKey === ctxKey && now - (this.state.yStatsComputedAt || 0) < 10 * 60 * 1000) return;

        const daily = await this.tryLoadYesterdayReportFromStatic();
        if (daily) {
            this.state.homeStatsText = `昨日新增 ${daily.count} 条，商机 ${daily.totalYi} 亿+`;
            this.state.homeStatsAt = Date.now();
            this.state.yStatsCtxKey = ctxKey;
            this.state.yStatsComputedAt = this.state.homeStatsAt;
            if (this.state.currentTab === 0) this.renderHomeStatsHost();
            return;
        }

        const base = this.getYesterdayStatsFromRows(this.state.data || []);
        if (base.count > 0 && now - (this.state.homeStatsAt || 0) < 60 * 1000) {
            this.state.yStatsCtxKey = ctxKey;
            this.state.yStatsComputedAt = now;
            return;
        }

        this.state.yStatsComputing = true;
        try {
            let count = 0;
            let totalYuan = 0;
            const startOfToday = base.startOfToday;
            const startOfYesterday = base.startOfYesterday;
            const maxPages = 30;
            for (let p = 0; p < maxPages; p++) {
                const currentCtxKey = `${this.state.currentCity || ''}||${(this.state.searchKeyword || '').trim()}`;
                if (currentCtxKey !== ctxKey) return;
                const json = await this.fetchListPage(p);
                const rows = (json && Array.isArray(json.data)) ? json.data : [];
                if (rows.length === 0) break;
                let pageMinTs = 0;
                for (const it of rows) {
                    const dt = this.parseDate(it.datetime);
                    const ts = dt && !isNaN(dt.getTime()) ? dt.getTime() : 0;
                    if (ts) {
                        if (!pageMinTs || ts < pageMinTs) pageMinTs = ts;
                        if (ts >= startOfYesterday && ts < startOfToday) {
                            count += 1;
                            totalYuan += this.parseAmountToYuan(it.bid_price || '');
                        }
                    }
                }
                if (pageMinTs && pageMinTs < startOfYesterday) break;
                if (rows.length < 15) break;
            }
            const currentCtxKey = `${this.state.currentCity || ''}||${(this.state.searchKeyword || '').trim()}`;
            if (currentCtxKey !== ctxKey) return;
            this.state.homeStatsText = `昨日新增 ${count} 条，商机 ${(totalYuan / 100000000).toFixed(2)} 亿+`;
            this.state.homeStatsAt = Date.now();
            this.state.yStatsCtxKey = ctxKey;
            this.state.yStatsComputedAt = this.state.homeStatsAt;
            if (this.state.currentTab === 0) this.renderHomeStatsHost();
        } catch (e) {} finally {
            this.state.yStatsComputing = false;
        }
    },

    async fetchData(page = 0, append = false) {
        if (this.state.loading || (append && this.state.loadingMore)) {
            const startedAt = Number(this.state.loadingStartedAt || 0);
            if (!append && page === 0 && startedAt && Date.now() - startedAt > 20000) {
                this.state.loading = false;
                this.state.loadingMore = false;
            } else {
                return;
            }
        }
        const previousData = append ? [...this.state.data] : [...(this.state.data || [])];
        const ctxKey = `${this.state.currentCity || ''}||${(this.state.searchKeyword || '').trim()}`;
        const isContextSwitch = (!append && page === 0 && ctxKey !== (this.state.lastDataContextKey || ''));
        const seq = (this.state.fetchSeq || 0) + 1;
        this.state.fetchSeq = seq;
        this.state.activeFetchSeq = seq;
        
        if (append) {
            this.state.loadingMore = true;
        } else {
            this.state.loading = true;
            this.state.loadingStartedAt = Date.now();
            this.state.currentPage = 0;
            this.state.hasMore = true;
            if (isContextSwitch) this.state.data = [];
            this.renderList(); // Show loading state
        }
        
        try {
            const forceRemote = false;
            const json = await this.fetchListPage(page, { forceRemote });
            if (this.state.activeFetchSeq !== seq) return;
            this.state.lastListSource = json && json.__source ? String(json.__source) : '';
            if (!append && page === 0) {
                if (this.state.startupRetryTimer) clearTimeout(this.state.startupRetryTimer);
                this.state.startupRetryTimer = null;
                this.state.startupRetryCount = 0;
            }
            this.state.error = null;
            this.state.apiOnlineAt = Date.now();
            if (!append && page === 0) this.state.lastDataContextKey = ctxKey;
            const newData = json.data || [];
            this.state.lastTopId = (Array.isArray(newData) && newData[0] && newData[0].id != null) ? String(newData[0].id) : '';
            const syncMeta = json.syncMeta || { actionAt: Date.now(), successAt: Date.now() };
            this.state.backendSyncActionAt = syncMeta.actionAt || Date.now();
            this.state.backendSyncSuccessAt = syncMeta.successAt || this.state.backendSyncActionAt;
            if (json.statsMeta && json.statsMeta.text) {
                this.state.homeStatsText = json.statsMeta.text;
                this.state.homeStatsAt = Date.now();
                if (this.state.currentTab === 0) this.renderHomeStatsHost();
            } else if (!append) {
                this.state.homeStatsAt = 0;
            }

            if (newData.length === 0) {
                this.state.hasMore = false;
            } else {
                if (append) this.state.data = [...this.state.data, ...newData];
                else this.state.data = newData;
                this.sortRowsByDatetimeDesc(this.state.data);
                this.state.data = this.filterRowsToRecentDays(this.state.data);
                this.state.currentPage = page;
                this.checkDateLimit();
                if (!append && page === 0) {
                    this.enrichItemsDatetime(this.state.data.slice(0, 25));
                }
            }
        } catch (e) {
            if (this.state.activeFetchSeq !== seq) return;
            console.error("API Fetch Failed:", e);
            this.state.error = e.message;
            this.state.data = isContextSwitch ? [] : previousData;
            this.state.hasMore = false;
            if (!append && page === 0) {
                const msg = String((e && e.message) || this.state.error || '');
                const shouldRetry = this.isNativeAppRuntime() && (
                    msg.includes('offline') ||
                    msg.includes('Failed to fetch') ||
                    msg.includes('NATIVE_HTTP_UNAVAILABLE') ||
                    msg.includes('NATIVE_HTTP_TIMEOUT') ||
                    msg.includes('Network') ||
                    msg.includes('network')
                );
                if (shouldRetry) this.scheduleStartupRetry();
            }
        } finally {
            if (this.state.activeFetchSeq !== seq) return;
            this.state.loading = false;
            this.state.loadingMore = false;
            this.renderList();
            if (this.state.currentTab === 0 && !append) {
                this.renderHomeStatsStrip();
            }
        }
    },

    scheduleStartupRetry() {
        if (this.state.startupRetryCount >= 3) return;
        if (this.state.startupRetryTimer) return;
        const delays = [800, 2000, 5000];
        const delay = delays[this.state.startupRetryCount] || 5000;
        this.state.startupRetryCount += 1;
        this.state.startupRetryTimer = setTimeout(() => {
            this.state.startupRetryTimer = null;
            if (document.hidden) return;
            if (this.state.currentTab !== 0) return;
            if (this.state.loading || this.state.loadingMore) return;
            this.fetchData(0, false);
        }, delay);
    },

    checkDateLimit() {
        if (this.state.data.length === 0) return;
        
        // Sort data by date desc just in case
        // Assuming API returns sorted data.
        
        const newestItem = this.state.data[0];
        const oldestItem = this.state.data[this.state.data.length - 1];
        
        if (!newestItem.datetime || !oldestItem.datetime) return;
        
        const newestDate = this.parseDate(newestItem.datetime);
        const oldestDate = this.parseDate(oldestItem.datetime);
        
        if (newestDate && oldestDate) {
            const diffTime = Math.abs(newestDate - oldestDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            
            if (diffDays >= this.state.maxDays) {
                this.state.hasMore = false; // Stop fetching
                console.log(`Reached ${diffDays} days limit (Max: ${this.state.maxDays})`);
            }
            const now = new Date();
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
            const cutoff = startOfToday - (this.state.maxDays * 24 * 60 * 60 * 1000);
            const oldestTs = oldestDate.getTime();
            if (oldestTs && oldestTs < cutoff) {
                this.state.hasMore = false;
            }
        }
    },
    
    parseDate(dateStr) {
        if (!dateStr) return null;
        try {
            if (typeof dateStr === 'number' || (typeof dateStr === 'string' && /^\d+$/.test(dateStr))) {
                let ts = parseInt(dateStr);
                if (ts < 10000000000) ts *= 1000;
                return new Date(ts);
            }
            const raw = String(dateStr).trim();
            if (raw.includes('今天') || raw.includes('昨天') || raw.includes('前天') || raw.includes('明天')) {
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                let base = new Date(today);
                if (raw.includes('昨天')) base.setDate(base.getDate() - 1);
                else if (raw.includes('前天')) base.setDate(base.getDate() - 2);
                else if (raw.includes('明天')) base.setDate(base.getDate() + 1);
                const m = raw.match(/(\d{1,2}):(\d{2})/);
                if (m) {
                    base.setHours(parseInt(m[1], 10), parseInt(m[2], 10), 0, 0);
                }
                return base;
            }
            const safeStr = raw
                .replace(/年/g, '/')
                .replace(/月/g, '/')
                .replace(/日/g, '')
                .replace(/-/g, '/');
            return new Date(safeStr);
        } catch (e) { return null; }
    },

    getHomeSyncInfoHtml() {
        const syncAt = this.state.backendSyncSuccessAt || this.state.backendSyncActionAt;
        const dt = syncAt ? new Date(syncAt) : null;
        const apiDt = this.state.apiOnlineAt ? new Date(this.state.apiOnlineAt) : null;
        const hasSyncTime = dt && !isNaN(dt.getTime());
        const hasApiTime = apiDt && !isNaN(apiDt.getTime());
        const displayDt = hasSyncTime ? dt : (hasApiTime ? apiDt : null);
        const timeText = displayDt
            ? `${displayDt.getFullYear()}-${String(displayDt.getMonth() + 1).padStart(2, '0')}-${String(displayDt.getDate()).padStart(2, '0')} ${String(displayDt.getHours()).padStart(2, '0')}:${String(displayDt.getMinutes()).padStart(2, '0')}:${String(displayDt.getSeconds()).padStart(2, '0')}`
            : '暂无';
        const lagMin = displayDt ? Math.floor((Date.now() - displayDt.getTime()) / 60000) : 9999;
        const fresh = hasSyncTime && lagMin <= 5;
        const hasVisibleData = Array.isArray(this.state.data) && this.state.data.length > 0;
        const isStarting = this.inStartupGrace() && !hasVisibleData && !(this.state.searchKeyword || '').trim();
        const unavailable = !isStarting && !hasSyncTime && !hasApiTime && !hasVisibleData;
        const bg = unavailable ? 'rgba(255,59,48,0.12)' : (fresh ? 'rgba(52,199,89,0.12)' : (isStarting ? 'rgba(74,144,226,0.12)' : 'rgba(255,149,0,0.14)'));
        const color = unavailable ? '#D74A41' : (fresh ? '#1E9D4A' : (isStarting ? '#2F6FB3' : '#D26D00'));
        const border = unavailable ? 'rgba(255,59,48,0.35)' : (fresh ? 'rgba(52,199,89,0.35)' : (isStarting ? 'rgba(74,144,226,0.35)' : 'rgba(255,149,0,0.38)'));
        const status = unavailable ? '未连接' : (fresh ? '实时' : (isStarting ? '连接中' : (hasSyncTime ? '延迟' : (hasVisibleData ? '本地预览' : '在线'))));
        const src = this.state.lastListSource === 'remote' ? '远端' : (this.state.lastListSource === 'local' ? '本地' : '');
        const top = (this.state.lastTopId || '').trim();
        const channel = src ? `API(${src}${top ? '·' + top : ''})` : 'API';
        return `<div style="margin: 6px 16px 8px 16px; display: flex; justify-content: center;">
            <span style="display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; background: ${bg}; color: ${color}; border: 1px solid ${border};">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 5px;"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10"></path><path d="M20.49 15a9 9 0 0 1-14.13 3.36L1 14"></path></svg>
                ${channel} ${timeText} · ${status}
            </span>
        </div>`;
    },

    getHomeStatsStripHtml() {
        const text = this.state.homeStatsText || '昨日新增 0 条，商机 0.00 亿+';
        return `<div class="home-stats-strip" style="background: ${this.state.homeStatsBarBg}; color: ${this.state.homeStatsBarColor}; border-color: ${this.state.homeStatsBarBorder};">${text}</div>`;
    },

    renderHomeStatsHost() {
        const host = document.getElementById('home-stats-host');
        if (!host) return;
        host.innerHTML = this.getHomeStatsStripHtml();
    },

    parseAmountToYuan(amountText) {
        if (!amountText || typeof amountText !== 'string') return 0;
        const text = amountText.replace(/,/g, '').trim();
        const m = text.match(/(\d+(\.\d+)?)/);
        if (!m) return 0;
        const value = parseFloat(m[1]);
        if (Number.isNaN(value)) return 0;
        if (text.includes('亿')) return value * 100000000;
        if (text.includes('万')) return value * 10000;
        return value;
    },

    async renderHomeStatsStrip() {
        const user = this.state.user || {};
        let barBg = 'linear-gradient(135deg, #4A90E2, #357ABD)';
        let barColor = '#FFFFFF';
        let barBorder = 'transparent';
        if (user.isLogged && user.vipLevel !== 'free') {
            if (user.vipLevel === 'city') {
                barBg = 'linear-gradient(135deg, rgba(44,95,45,0.85), rgba(30,63,31,0.85))';
                barColor = '#FFFFFF';
                barBorder = 'rgba(255, 255, 255, 0.28)';
            } else if (user.vipLevel === 'province') {
                barBg = 'linear-gradient(135deg, rgba(255,215,0,0.88), rgba(253,185,49,0.88))';
                barColor = '#5D4037';
                barBorder = 'rgba(93, 64, 55, 0.2)';
            } else if (user.vipLevel === 'country') {
                barBg = 'rgba(28, 28, 30, 0.9)';
                barColor = '#FFD700';
                barBorder = 'rgba(255, 215, 0, 0.35)';
            }
        }
        this.state.homeStatsBarBg = barBg;
        this.state.homeStatsBarColor = barColor;
        this.state.homeStatsBarBorder = barBorder;
        if (this.state.currentTab === 0) this.renderHomeStatsHost();
        if (this.state.homeStatsText && Date.now() - this.state.homeStatsAt < 60000) {
            return;
        }
        if (this.state.homeStatsLoading) return;
        this.state.homeStatsLoading = true;
        this.state.homeStatsText = this.calcYesterdayStatsFromRows(this.state.data);
        if (this.state.currentTab === 0) this.renderHomeStatsHost();
        try {
            if (!Array.isArray(this.state.data) || this.state.data.length === 0) {
                const json = await this.fetchListPage(0);
                this.state.data = json.data || [];
                this.state.hasMore = (json.data || []).length > 0;
                this.state.currentPage = 0;
                const syncMeta = json.syncMeta || { actionAt: Date.now(), successAt: Date.now() };
                this.state.backendSyncActionAt = syncMeta.actionAt || Date.now();
                this.state.backendSyncSuccessAt = syncMeta.successAt || this.state.backendSyncActionAt;
                if (json.statsMeta && json.statsMeta.text) {
                    this.state.homeStatsText = json.statsMeta.text;
                    this.state.homeStatsAt = Date.now();
                }
            }
            this.state.homeStatsText = this.calcYesterdayStatsFromRows(this.state.data);
            this.state.homeStatsAt = Date.now();
        } catch (e) {
            if (!this.state.homeStatsText) this.state.homeStatsText = '昨日新增 0 条，商机 0.00 亿+';
        } finally {
            this.state.homeStatsLoading = false;
            if (this.state.currentTab === 0) this.renderHomeStatsHost();
            this.computeYesterdayStatsByPaging();
        }
    },

    handleScroll() {
        if (this.state.currentTab !== 0) return; // Only for Home tab
        if (this.state.loading || this.state.loadingMore || !this.state.hasMore) return;
        
        const container = document.getElementById('content-area');
        // Threshold: 100px from bottom
        if (container.scrollTop + container.clientHeight >= container.scrollHeight - 100) {
            console.log('Scroll to bottom, loading next page...');
            this.fetchData(this.state.currentPage + 1, true);
        }
    },

    // --- Core Logic ---

    switchTab(index) {
        this.state.currentTab = index;
        
        // Update UI Tabs
        const tabs = document.querySelectorAll('.tab-item');
        tabs.forEach((tab, i) => {
            if (i === index) tab.classList.add('active');
            else tab.classList.remove('active');
        });

        // Update Content
        const contentArea = document.getElementById('content-area');
        const navBar = document.querySelector('.nav-bar');
        const bannerArea = document.querySelector('.banner-area');
        const functionArea = document.querySelector('.function-area');

        // Reset padding by default (will override for Member Center)
        contentArea.style.padding = '16px'; 
        contentArea.style.paddingBottom = '100px';
        contentArea.style.marginTop = '0';
        contentArea.style.background = '#F2F2F7'; // Reset background
        contentArea.style.width = '100%';
        contentArea.style.maxWidth = '100%';
        contentArea.style.marginLeft = '0';
        contentArea.style.marginRight = '0';
        contentArea.classList.remove('member-fullbleed');

        if (index === 0) {
            // Home Tab
            navBar.style.display = 'flex';
            bannerArea.style.display = 'block';
            if(functionArea) functionArea.style.display = 'none'; // Keep hidden
            contentArea.style.padding = '0 16px 100px 16px';
            contentArea.style.marginTop = '-43px';
            
            // Restore Home Nav Structure
            this.renderHomeNav(navBar);
            this.renderHomeStatsStrip();
            
            contentArea.innerHTML = `<div id="home-stats-host"></div><div id="list" class="list-wrapper"></div>`;
            this.renderHomeStatsHost();
            this.renderList();
            
        } else if (index === 1) {
            // Subscription Tab
            navBar.style.display = 'none';
            bannerArea.style.display = 'none';
            if(functionArea) functionArea.style.display = 'none';
            this.state.subCountsUpdated = false;
            this.state.subLoading = false;
            
            this.renderSubscriptionList(); // This handles its own navbar/padding logic
        } else if (index === 2) {
            // Member Center Tab
            navBar.style.display = 'none';
            bannerArea.style.display = 'none';
            if(functionArea) functionArea.style.display = 'none';
            
            // Full screen layout for Member Center
            contentArea.style.padding = '0';
            contentArea.style.paddingBottom = '85px'; // Adjust for TabBar height
            contentArea.style.marginTop = '0';
            contentArea.style.width = '100%';
            contentArea.style.maxWidth = '100%';
            contentArea.style.marginLeft = '0';
            contentArea.style.marginRight = '0';
            contentArea.classList.add('member-fullbleed');
            
            contentArea.innerHTML = this.getMemberCenterHTML();
        }
    },

    // --- List View Logic ---

    renderList(data = this.state.data) {
        if (this.state.currentTab !== 0) return; // Only render if on Home tab
        
        const container = document.getElementById('list');
        if (!container) return;
        const headerHtml = this.getHomeSyncInfoHtml();

        if (this.state.loading) {
            container.innerHTML = `${headerHtml}<div class="empty-state">加载中...</div>`;
            return;
        }

        // Removed explicit error display to prioritize data display (even if mock)
        // If data is empty and error exists, the generic empty state will show
        
        if (data.length === 0) {
            const hideStartupError = this.inStartupGrace() && !(this.state.searchKeyword || '').trim();
            const emptyText = hideStartupError ? '加载中...' : (this.state.error ? `无法连接服务器，请稍后重试（${this.state.error}）` : '未找到相关结果');
            container.innerHTML = `${headerHtml}<div class="empty-state">${emptyText}</div>`;
            return;
        }

        let html = headerHtml;
        if (this.state.error && data.length === 0) {
            html += `<div style="padding: 10px; background: #fff3e0; color: #ff9800; text-align: center; font-size: 12px; margin: 10px 16px; border-radius: 8px;">无法连接服务器，请稍后重试</div>`;
        }

        data.forEach((item, index) => {
            try {
                const tagClass = this.getTagClass(item.types || '其他');
                // Safe accessors
                const title = item.title || '无标题';
                const price = item.bid_price || item.bidPrice || '';
                const purchaser = item.purchaser || '';
                const city = item.city || '';
                const time = this.formatTime(item.datetime);
                const type = item.types || '公告';
                
                // Debug log for first few items to verify time formatting
                if (index < 3) {
                    console.log(`Render Item [${index}]: Raw=${item.datetime}, Formatted=${time}, Purchaser=${purchaser}`);
                }

                // Encode item data to pass to showDetail
                // Use a safer way to encode in case of special chars, and escape single quotes for HTML attribute
                const itemStr = encodeURIComponent(JSON.stringify(item)).replace(/'/g, "%27");
                const amountBadge = this.getAmountBadge(price);

                html += `
                <div class="card" onclick="showDetail('${itemStr}')">
                    <div style="margin-bottom: 6px; display: flex; align-items: center; min-height: 20px; justify-content: space-between;">
                        <div style="display: flex; align-items: center;">
                            ${amountBadge ? 
                            `<span class="tag-new" style="background: ${amountBadge.bg}; color: ${amountBadge.color}; font-weight: bold; margin-right: 6px; vertical-align: middle;">${amountBadge.text}</span>` : ''}
                            ${price && price !== '金额见正文' ? 
                            `<span style="color: #ff3b30; font-size: 13px; font-weight: 600;">${price}</span>` : ''}
                        </div>
                        <div style="font-size: 12px; color: var(--text-secondary); white-space: nowrap;">${time}</div>
                    </div>

                    <div style="margin-bottom: 8px; line-height: 1.5;">
                        <span class="card-title">${title}</span>
                        <span class="tag-new" style="background: ${tagClass.bg}; color: ${tagClass.text}; margin-left: 4px; vertical-align: 1px;">${type}</span>
                    </div>
                    
                    <div class="card-meta">
                        <div class="meta-item" style="width: 100%; display: flex; align-items: center;">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 2px; flex-shrink: 0;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            <span style="margin-right: 8px; white-space: nowrap; flex-shrink: 0;">${city}</span>
                            ${purchaser ? `<span class="tag-new" title="${purchaser}" style="background: var(--tag-blue-bg); color: var(--tag-blue-text); font-size: 12px; display: inline-block; vertical-align: middle; white-space: normal; line-height: 1.4; padding: 4px 6px; max-width: 70%;">${purchaser}</span>` : ''}
                        </div>
                    </div>
                </div>`;
            } catch (e) {
                console.error("Error rendering item:", e, item);
            }
        });

        // Add loading indicator or end message
        if (this.state.loadingMore) {
            html += `<div style="text-align: center; padding: 20px; color: #999; font-size: 13px;">正在加载更多...</div>`;
        } else if (!this.state.hasMore && data.length > 0) {
            html += `<div style="text-align: center; padding: 20px; color: #999; font-size: 13px;">已显示最近15天的数据</div>`;
        }

        container.innerHTML = html;
    },

    // --- Access Control Logic ---

    checkViewPermission(item) {
        const user = this.state.user;
        if (!user.isLogged) {
            if (user.viewUsage < 3) {
                return { allowed: true, type: 'limited', remaining: 3 - user.viewUsage, limit: 3, isGuest: true };
            }
            return { allowed: false, message: '您还不是会员，未登录最多可浏览3条详情，请先登录。', requireLogin: true };
        }
        const level = user.vipLevel || 'free';
        
        // National Member: Unlimited
        if (level === 'country') {
            return { allowed: true };
        }
        
        // Ensure we have location data for the item
        const itemCity = item.city || '';
        const itemProvince = this.getProvinceForCity(itemCity) || '';
        
        // Provincial Member
        if (level === 'province') {
            // In Scope (Same Province): Unlimited
            if (user.vipScopeValue && itemProvince === user.vipScopeValue) {
                return { allowed: true };
            }
            // Out of Scope: Limit 500
            if (user.viewUsage < 500) {
                return { allowed: true, type: 'limited', remaining: 500 - user.viewUsage, limit: 500 };
            } else {
                return { allowed: false, message: '跨省浏览额度已用完（500条），请升级全国会员。' };
            }
        }
        
        // City Member
        if (level === 'city') {
            // In Scope (Same City): Unlimited
            if (user.vipScopeValue && itemCity === user.vipScopeValue) {
                return { allowed: true };
            }
            // Out of Scope: Limit 100
            if (user.viewUsage < 100) {
                return { allowed: true, type: 'limited', remaining: 100 - user.viewUsage, limit: 100 };
            } else {
                return { allowed: false, message: '跨市浏览额度已用完（100条），请升级会员。' };
            }
        }
        
        // Free Member (Default)
        // Limit 10 (Lifetime)
        if (user.viewUsage < 10) {
            return { allowed: true, type: 'limited', remaining: 10 - user.viewUsage, limit: 10, isFree: true };
        } else {
            return { allowed: false, message: '免费额度已用完（终身10条），请升级会员以无限浏览。' };
        }
    },

    recordView(item) {
        const user = this.state.user;
        const level = user.vipLevel || 'free';
        
        // Check if already counted? 
        // User rule: "收费计数为会员期内累计" -> implies each *new* view counts.
        // If we want to avoid double counting re-opens:
        if (user.viewHistory && user.viewHistory.includes(item.id)) {
            return; // Already viewed, don't increment
        }
        
        let shouldIncrement = false;
        
        if (level === 'country') {
            shouldIncrement = false;
        } else if (level === 'province') {
            const itemCity = item.city || '';
            const itemProvince = this.getProvinceForCity(itemCity) || '';
            if (!user.vipScopeValue || itemProvince !== user.vipScopeValue) {
                shouldIncrement = true;
            }
        } else if (level === 'city') {
            const itemCity = item.city || '';
            if (!user.vipScopeValue || itemCity !== user.vipScopeValue) {
                shouldIncrement = true;
            }
        } else {
            // Free
            shouldIncrement = true;
        }
        
        if (shouldIncrement) {
            user.viewUsage = (user.viewUsage || 0) + 1;
        }
        
        // Add to history
        if (!user.viewHistory) user.viewHistory = [];
        user.viewHistory.push(item.id);
        
        this.saveUser();
        if (this.getAuthToken()) {
            try { clearTimeout(this.state.usageSyncTimer); } catch (e) {}
            this.state.usageSyncTimer = setTimeout(() => this.syncUsageToServer(), 800);
        }
    },

    // Helper for Member Center Header (reusing same logic)
    renderMemberHeader() {
         return ``;
    },

    // --- Detail View Logic ---
    async showDetail(itemStr) {
        try {
            const item = JSON.parse(decodeURIComponent(itemStr));
            
            // Check Permission First
            const permission = this.checkViewPermission(item);
            
            if (!permission.allowed) {
                if (permission.requireLogin) {
                    alert(permission.message);
                    this.login();
                    return;
                }
                if (confirm(permission.message)) {
                    this.switchTab(2); // Go to Member Center
                }
                return;
            }
            
            // Handle Limited View Warnings
            if (permission.type === 'limited') {
                // Free Member specific warning on first view (or always show toast)
                if (permission.isFree) {
                    // "用户在首次浏览任意详情页前，若未达上限，显示提示"
                    // We'll show a confirm dialog if it's the very first view, or just a toast otherwise
                    if (this.state.user.viewUsage === 0) {
                        alert(`您为免费会员，最多可浏览10条详情（当前 0/10）。`);
                    } else {
                        this.showToast(`免费会员：已浏览 ${this.state.user.viewUsage}/10`);
                    }
                } else if (permission.isGuest) {
                    if (this.state.user.viewUsage === 0) {
                        alert(`您还不是会员，未登录最多可浏览3条详情（当前 0/3）。`);
                    } else {
                        this.showToast(`未登录：已浏览 ${this.state.user.viewUsage}/3`);
                    }
                } else {
                    // For paid members accessing out-of-scope
                    // Maybe just a toast
                     this.showToast(`跨区域浏览：已用 ${this.state.user.viewUsage}/${permission.limit}`);
                }
            }
            
            // Record View (Increment counter if needed)
            this.recordView(item);
            
            const modal = document.getElementById('detail-modal');
            const content = document.getElementById('detail-content');
            
            // 1. Initial Render (Basic Info + Loading)
            const tagStyle = this.getTagClass(item.types || '公告');
            
            // VIP Bar Logic
            const user = this.state.user;
            let vipBarHtml = '';
            let detailBodyStyle = 'border-radius: 12px;';
            
            if (user.isLogged && user.vipLevel !== 'free') {
                let levelName = '会员';
                let icon = '💎';
                let badgeStyle = 'background: linear-gradient(90deg, #FFD700, #FDB931); color: #1C1C1E;';
                
                // Default: Dark background with gold text (fallback or for Country)
                let barBg = '#333';
                let barColor = '#FFD700';
                
                if (user.vipLevel === 'city') { 
                    levelName = '城市会员'; 
                    // Silver Crown SVG
                    icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="#C0C0C0" stroke="#808080" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-top: -4px;"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path></svg>'; 
                    badgeStyle = 'background: rgba(255,255,255,0.2); color: white;';
                    // Ink Green for City
                    barBg = 'linear-gradient(135deg, #2C5F2D, #1E3F1F)';
                    barColor = 'white';
                }
                if (user.vipLevel === 'province') { 
                    levelName = '省级会员'; 
                    // Gold Crown SVG
                    icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="#FFD700" stroke="#DAA520" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-top: -4px;"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path></svg>'; 
                    badgeStyle = 'background: rgba(255,255,255,0.4); color: #5D4037;';
                    // Gold for Province
                    barBg = 'linear-gradient(135deg, #FFD700, #FDB931)';
                    barColor = '#5D4037';
                }
                if (user.vipLevel === 'country') { 
                    levelName = '全国会员'; 
                    // Black Gold Crown SVG
                    icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="#333" stroke="#FFD700" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-top: -4px;"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path></svg>'; 
                    badgeStyle = 'color: #FFD700;';
                    // Black Gold for Country
                    barBg = '#333'; // or linear-gradient
                    barColor = '#FFD700';
                }
                
                vipBarHtml = `
                <div style="background: ${barBg}; color: ${barColor}; padding: 12px 16px; border-top-left-radius: 12px; border-top-right-radius: 12px; display: flex; justify-content: space-between; align-items: center; font-size: 13px; margin-bottom: 0;">
                    <div style="display: flex; align-items: center; font-weight: 600;">
                        <span style="margin-right: 6px; font-size: 16px;">${icon}</span>
                        尊敬的 ${levelName}
                    </div>
                    <div style="color: ${barColor}; opacity: 0.8;">已为您解锁详情</div>
                </div>`;
                
                detailBodyStyle = 'border-top-left-radius: 0; border-top-right-radius: 0; margin-top: 0;';
            } else {
                const barBg = 'linear-gradient(135deg, rgba(74,144,226,0.92), rgba(53,122,189,0.92))';
                const barColor = '#FFFFFF';
                vipBarHtml = `
                <div style="background: ${barBg}; color: ${barColor}; padding: 12px 16px; border-top-left-radius: 12px; border-top-right-radius: 12px; display: flex; justify-content: space-between; align-items: center; font-size: 13px; margin-bottom: 0;">
                    <div style="display: flex; align-items: center; font-weight: 600;">
                        免费会员
                    </div>
                    <div style="color: ${barColor}; opacity: 0.9;">登录/升级解锁更多</div>
                </div>`;
                detailBodyStyle = 'border-top-left-radius: 0; border-top-right-radius: 0; margin-top: 0;';
            }

            content.innerHTML = `
                <div style="padding: 16px; background: #F2F2F7; min-height: 100%;">
                    <!-- Top Info Card -->
                    <div class="card" style="margin-bottom: 16px; padding: 20px; border-radius: 12px; background: white;">
                        <h2 style="font-size: 19px; font-weight: bold; margin-bottom: 12px; line-height: 1.4; color: #000;">${item.title}</h2>
                        
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px; font-size: 12px; color: #999;">
                            <span>${item.datetime}</span>
                            <span>${item.city}</span>
                            <span style="background: ${tagStyle.bg}; color: ${tagStyle.text}; padding: 2px 6px; border-radius: 4px;">${item.types || '公告'}</span>
                        </div>
                        
                        <div style="border-top: 1px solid #F5F5F5; padding-top: 16px; display: flex; flex-direction: column; gap: 12px;">
                            <div style="display: flex; font-size: 14px;">
                                <span style="color: #999; width: 70px; flex-shrink: 0;">采购单位</span>
                                <span style="color: #333; font-weight: 500;">${item.purchaser || '-'}</span>
                            </div>
                            <div style="display: flex; font-size: 14px;">
                                <span style="color: #999; width: 70px; flex-shrink: 0;">中标金额</span>
                                <span style="color: #FF3B30; font-weight: 600;">${item.bid_price || item.bidPrice || '金额见正文'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Content Section -->
                    <div style="margin-bottom: 16px;">
                        ${vipBarHtml}
                        <div class="card" id="detail-body" style="line-height: 1.6; color: #333; font-size: 14px; min-height: 200px; width: 100%; overflow: hidden; ${detailBodyStyle}">
                            <div style="display: flex; justify-content: center; align-items: center; height: 100px; color: #999;">
                                <svg class="spinner" viewBox="0 0 50 50" style="width: 24px; height: 24px; animation: rotate 2s linear infinite; margin-right: 8px;">
                                    <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="5" style="stroke-dasharray: 60, 150;"></circle>
                                </svg>
                                正在加载详情...
                            </div>
                        </div>
                    </div>
                    
                    <div class="card" style="margin-top: 0; padding: 20px 16px;">
                        <div style="font-size: 15px; font-weight: 600; margin-bottom: 16px; display: flex; align-items: center; color: #333;">
                            <div style="width: 4px; height: 14px; background: #007AFF; margin-right: 8px; border-radius: 2px;"></div>
                            溯源权威官方
                        </div>
                        
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            <button id="btn-view-original" style="background-color: #007AFF; color: white; border: none; padding: 12px; border-radius: 10px; font-size: 15px; font-weight: 500; width: 100%;">
                                查看原文网页
                            </button>
                            
                            <button id="btn-copy-url" style="background-color: #F2F2F7; color: #007AFF; border: none; padding: 12px; border-radius: 10px; font-size: 15px; font-weight: 500; width: 100%;">
                                点击复制网址
                            </button>
                        </div>
                    </div>
                </div>
                <style>
                    @keyframes rotate { 100% { transform: rotate(360deg); } }
                    /* Universal Reset for Inner Content to Remove "Box-in-Box" Look */
                    #detail-body * {
                        border: none !important;
                        box-shadow: none !important;
                        background: transparent !important;
                        border-radius: 0 !important;
                        /* Reset padding/margin but keep vertical spacing for readability */
                        padding: 0 !important;
                        max-width: 100% !important;
                        box-sizing: border-box !important;
                    }

                    /* Restore vertical spacing for block elements */
                    #detail-body p, #detail-body div, #detail-body li, #detail-body tr {
                        margin-bottom: 10px !important;
                    }

                    /* Optimize Tables for Mobile Reading (Flatten to Cards/List) */
                    #detail-body table, #detail-body tbody, #detail-body thead, #detail-body tr, #detail-body td, #detail-body th {
                        display: block !important;
                        width: 100% !important;
                        height: auto !important;
                    }
                    
                    /* Treat each row as a small section */
                    #detail-body tr {
                        border-bottom: 1px dashed #E5E5EA !important;
                        padding-bottom: 8px !important;
                        margin-bottom: 12px !important;
                    }
                    
                    #detail-body tr:last-child {
                        border-bottom: none !important;
                    }
                    
                    /* Cells look like paragraphs */
                    #detail-body td, #detail-body th {
                        padding: 4px 0 !important;
                        text-align: left !important;
                        display: block !important;
                    }
                    
                    /* Add label style for table headers if they exist */
                    #detail-body th {
                        font-weight: bold !important;
                        color: #000 !important;
                        margin-bottom: 4px !important;
                    }

                    /* General Text Optimization */
                    #detail-body p, #detail-body div {
                        margin: 10px 0 !important;
                        line-height: 1.6 !important;
                        word-wrap: break-word !important;
                    }
                    
                    /* Hide empty elements */
                    #detail-body p:empty, #detail-body div:empty {
                        display: none;
                    }

                    /* Enforce font size to match Purchasing Unit */
                    #detail-body, #detail-body * { font-size: 14px !important; }
                </style>
            `;
            
            modal.style.display = 'flex';
            setTimeout(() => {
                modal.classList.add('visible');
            }, 10);

            const btnViewOriginal = document.getElementById('btn-view-original');
            if (btnViewOriginal) btnViewOriginal.onclick = () => this.openExternalUrl(item.url || '');
            const btnCopyUrl = document.getElementById('btn-copy-url');
            if (btnCopyUrl) btnCopyUrl.onclick = () => this.fallbackCopy(item.url || '');
            
            // 2. Fetch Full Content
            try {
                const json = await this.fetchDetailById(item.id);
                
                const detailBody = document.getElementById('detail-body');
                
                if (json.code === 1 && json.data) {
                    let htmlContent = '';
                    // Handle different data structures
                    if (typeof json.data === 'string') {
                        htmlContent = json.data;
                    } else if (typeof json.data.text === 'string') {
                        htmlContent = json.data.text;
                    } else if (typeof json.data.content === 'string') {
                        htmlContent = json.data.content;
                    } else {
                        htmlContent = '';
                    }
                    
                    // Update Original Links with real URL
                    const originalUrl = (json.data && (json.data.weburl || json.data.url)) || item.url || '#';
                    const linkButtons = document.querySelectorAll('#btn-view-original');
                    if (linkButtons.length > 0) linkButtons[0].onclick = () => this.openExternalUrl(originalUrl);
                    const copyButtons = document.querySelectorAll('#btn-copy-url');
                    if (copyButtons.length > 0) copyButtons[0].onclick = () => this.fallbackCopy(originalUrl);
                    
                    // Decode HTML entities if necessary (browsers do this automatically for innerHTML usually)
                    const safeHtml = String(htmlContent || '');
                    if (!safeHtml.trim()) {
                        detailBody.innerHTML = `<div style="color: #999; text-align: center; padding: 20px;">暂无详情内容</div>`;
                    } else {
                        detailBody.innerHTML = safeHtml;
                    }
                    
                    // 3. Post-process Links for "Click to Copy"
                    const links = detailBody.querySelectorAll('a');
                    links.forEach(link => {
                        link.onclick = (e) => {
                            e.preventDefault();
                            const href = link.href;
                            
                            // Copy to clipboard
                            if (navigator.clipboard && navigator.clipboard.writeText) {
                                navigator.clipboard.writeText(href).then(() => {
                                    this.showToast('链接已复制');
                                    // Optional: If user wants to jump to browser too
                                    // window.open(href, '_blank');
                                }).catch(() => {
                                    this.fallbackCopy(href);
                                });
                            } else {
                                this.fallbackCopy(href);
                            }
                        };
                        // Style links to look clickable
                        link.style.color = '#007AFF';
                        link.style.textDecoration = 'underline';
                        link.style.wordBreak = 'break-all';
                    });
                    
                } else {
                    detailBody.innerHTML = `<div style="color: red; text-align: center; padding: 20px;">获取详情失败: ${json.msg || '未知错误'}</div>`;
                }
            } catch (err) {
                console.error("Detail Fetch Error:", err);
                // Fallback for CORS or network errors in preview mode
                // In a real app, this might be handled by a proxy or native code
                const detailBody = document.getElementById('detail-body');
                if (detailBody) {
                    detailBody.innerHTML = `<div style="color: #999; text-align: center; padding: 20px;">
                        无法连接服务器获取详情<br>
                        <span style="font-size: 12px;">(可能是跨域限制或网络问题)</span>
                    </div>`;
                }
            }
            
        } catch (e) {
            console.error("Error showing detail:", e);
            alert("无法打开详情");
        }
    },

    fallbackCopy(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";  // Avoid scrolling to bottom
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            this.showToast('链接已复制');
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
            alert('复制失败，请手动复制');
        }
        document.body.removeChild(textArea);
    },

    openExternalUrl(url) {
        const u = String(url || '').trim();
        if (!u || u === '#') {
            this.showToast('暂无原文链接');
            return;
        }
        if (!/^https?:\/\//i.test(u)) {
            this.showToast('链接无效');
            return;
        }
        try {
            const browser = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Browser;
            if (browser && browser.open) {
                browser.open({ url: u });
                return;
            }
        } catch (e) {}
        const w = window.open(u, '_blank');
        if (!w) {
            try { window.location.href = u; } catch (e) {}
        }
    },

    showToast(message) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.position = 'fixed';
        toast.style.left = '50%';
        toast.style.top = '50%';
        toast.style.transform = 'translate(-50%, -50%)';
        toast.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        toast.style.color = 'white';
        toast.style.padding = '12px 24px';
        toast.style.borderRadius = '8px';
        toast.style.zIndex = '10000';
        toast.style.fontSize = '14px';
        toast.style.transition = 'opacity 0.3s';
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 1500);
    },

    inStartupGrace() {
        const startedAt = this.state.appStartedAt || 0;
        if (!startedAt) return false;
        return (Date.now() - startedAt) < 8000;
    },

    hideDetail() {
        const modal = document.getElementById('detail-modal');
        modal.classList.remove('visible');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    },

    filterList(keyword) {
        this.state.searchKeyword = keyword;
        
        // Debounce server-side search
        if (this.state.searchTimer) clearTimeout(this.state.searchTimer);
        
        this.state.searchTimer = setTimeout(() => {
            // Reset page to 0 and fetch new data with keyword
            this.fetchData(0, false);
        }, 500); // 500ms debounce
    },

    // --- Subscription Logic ---

    // New Helper: Check subscription limit
    checkSubLimit() {
        const user = this.state.user;
        const level = user.vipLevel || 'free';
        const currentCount = window.SubManager.getSubs().length;
        
        let limit = 1; // Default Free
        if (level === 'city') limit = 10;
        else if (level === 'province') limit = 50;
        else if (level === 'country') limit = 200;
        
        if (currentCount >= limit) {
            return { allowed: false, message: `已达关键词上限（${limit}个），请升级会员。` };
        }
        return { allowed: true };
    },

    getVipRank() {
        const user = this.state.user || {};
        const level = user.vipLevel || 'free';
        const levels = { 'free': 0, 'city': 1, 'province': 2, 'country': 3 };
        return levels[level] || 0;
    },

    getAllowedScopeTypes() {
        const user = this.state.user || {};
        const level = user.vipLevel || 'free';
        if (level === 'city') return ['city'];
        if (level === 'province') return ['province', 'city'];
        if (level === 'country') return ['country', 'province', 'city'];
        return [];
    },

    getAllowedScopeType() {
        const types = this.getAllowedScopeTypes();
        return types.length > 0 ? types[0] : null;
    },

    getScopePickerHint() {
        const user = this.state.user || {};
        const level = user.vipLevel || 'free';
        if (level === 'city') return '请选择一个城市';
        if (level === 'province') return '请选择一个省份或该省下属城市';
        if (level === 'country') return '您可以选择全国/省份/城市';
        return '请选择订阅范围';
    },

    isVipScopeLocked(level) {
        if (level !== 'city' && level !== 'province') return true;
        const subs = (window.SubManager && typeof window.SubManager.getSubs === 'function')
            ? (window.SubManager.getSubs() || [])
            : [];
        return subs.length > 0;
    },

    bindVipScopeFromSelection(scopeType, scopeValue) {
        const user = this.state.user || {};
        const level = user.vipLevel || 'free';
        if (level === 'city' && scopeType === 'city' && scopeValue) {
            user.vipScopeValue = scopeValue;
        } else if (level === 'province' && scopeValue) {
            if (scopeType === 'province') {
                user.vipScopeValue = scopeValue;
            } else if (scopeType === 'city') {
                const pv = this.getProvinceForCity(scopeValue);
                if (pv) user.vipScopeValue = pv;
            }
        } else if (level === 'country') {
            user.vipScopeValue = '全国';
        }
    },

    ensureScopePermission(scopeType, scopeValue = '') {
        const user = this.state.user || {};
        const level = user.vipLevel || 'free';
        const allowed = this.getAllowedScopeTypes();
        if (allowed.length === 0) return { allowed: false, message: '该功能仅限会员使用，是否前往升级？' };
        if (!allowed.includes(scopeType)) {
            if (level === 'city') return { allowed: false, message: '城市会员只能选择一个城市，请重新选择。' };
            if (level === 'province') return { allowed: false, message: '省份会员可选择一个省份及其下属城市，请重新选择。' };
            return { allowed: false, message: '全国会员可选择全国/省份/城市。' };
        }
        const vipScope = (user.vipScopeValue || '').trim();
        const scopeLocked = this.isVipScopeLocked(level);
        if (level === 'city' && scopeType === 'city' && scopeValue && vipScope && scopeValue !== vipScope) {
            if (scopeLocked) return { allowed: false, message: `城市会员仅可选择授权城市：${vipScope}` };
        }
        if (level === 'province' && vipScope) {
            if (scopeType === 'province' && scopeValue && scopeValue !== vipScope) {
                if (scopeLocked) return { allowed: false, message: `省份会员仅可选择授权省份：${vipScope}` };
            }
            if (scopeType === 'city' && scopeValue) {
                const pv = this.getProvinceForCity(scopeValue) || '';
                if (pv !== vipScope && scopeLocked) return { allowed: false, message: `省份会员仅可选择 ${vipScope} 下属城市` };
            }
        }
        return { allowed: true };
    },

    async querySubItems(sub, limit = 120, maxPages = 6) {
        const keywords = (Array.isArray(sub.keywords) ? sub.keywords : [sub.keywords]).map(k => (k || '').trim()).filter(Boolean);
        const itemMap = new Map();
        const inScope = (item) => {
            if (sub.scopeType === 'city' && sub.scopeValue) {
                return item.city && item.city.includes(sub.scopeValue);
            }
            if (sub.scopeType === 'province' && sub.scopeValue) {
                const pv = sub.scopeValue;
                return (item.city && item.city.includes(pv)) || (item.title && item.title.includes(pv)) || (item.purchaser && item.purchaser.includes(pv));
            }
            return true;
        };
        try {
            const cityOpt = (sub.scopeType === 'city' && sub.scopeValue) ? sub.scopeValue : '全国';
            for (const kw of keywords) {
                let page = 0;
                while (page < maxPages && itemMap.size < limit) {
                    const json = await this.fetchListPage(page, { keyword: kw, city: cityOpt });
                    const data = (json && json.code === 1 && Array.isArray(json.data)) ? json.data : [];
                    if (data.length === 0) break;
                    data.forEach(item => {
                        if (inScope(item)) itemMap.set(item.id, item);
                    });
                    if (data.length < 15) break;
                    page += 1;
                }
                if (itemMap.size >= limit) break;
            }
            let items = Array.from(itemMap.values());
            items.sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
            return items.slice(0, limit);
        } catch (e) {
            const fallback = (this.state.data || []).filter(item => {
                const matched = keywords.some(kw =>
                    (item.title && item.title.includes(kw)) ||
                    (item.purchaser && item.purchaser.includes(kw)) ||
                    (item.city && item.city.includes(kw))
                );
                if (!matched) return false;
                if (sub.scopeType === 'city' && sub.scopeValue) return item.city && item.city.includes(sub.scopeValue);
                if (sub.scopeType === 'province' && sub.scopeValue) {
                    return (item.city && item.city.includes(sub.scopeValue)) || (item.title && item.title.includes(sub.scopeValue));
                }
                return true;
            });
            fallback.sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
            return fallback.slice(0, limit);
        }
    },

    async fetchSubUnreadCount(sub) {
        const items = await this.querySubItems(sub, 300, 30);
        const lastReadAt = sub.lastReadAt || 0;
        if (!lastReadAt) return items.length;
        return items.filter(item => {
            const dt = this.parseDate(item.datetime);
            if (!dt || isNaN(dt.getTime())) return true;
            return dt.getTime() > lastReadAt;
        }).length;
    },

    async updateSubCounts() {
        const subs = window.SubManager.getSubs();
        let changed = false;
        
        for (const sub of subs) {
            const count = await this.fetchSubUnreadCount(sub);
            if (sub.unreadCount !== count) {
                sub.unreadCount = count;
                sub.lastCheckTime = Date.now();
                window.SubManager.updateSub(sub.id, { unreadCount: count, lastCheckTime: Date.now() }, true);
                changed = true;
            }
        }
        
        if (changed && this.state.currentTab === 1) {
            this.renderSubscriptionList();
        }
    },

    renderSubscriptionList() {
        if (this.state.currentTab !== 1) return; // Only render if on subscription tab
        const user = this.state.user || {};
        const isLogged = !!user.isLogged;
        const hasSubManager = !!(window.SubManager && typeof window.SubManager.getSubs === 'function');
        const canRefresh = hasSubManager && typeof window.SubManager.refreshFromServer === 'function' && !!this.getAuthToken();

        if (isLogged && canRefresh && !this.state.subLoadedOnce && !this.state.subLoading) {
            this.state.subLoading = true;
            window.SubManager.refreshFromServer().then(() => {
                this.state.subLoading = false;
                this.state.subLoadedOnce = true;
                if (this.state.currentTab === 1) this.renderSubscriptionList();
            }).catch(() => {
                this.state.subLoading = false;
                this.state.subLoadedOnce = true;
                if (this.state.currentTab === 1) this.renderSubscriptionList();
            });
        }
        
        // Trigger update counts if needed (lazy load)
        // Debounce or check flag to avoid loop
        if (isLogged && hasSubManager && !this.state.subLoading && !this.state.subCountsUpdated) {
            this.state.subCountsUpdated = true;
            this.updateSubCounts();
        }

        const subs = (isLogged && hasSubManager) ? (window.SubManager.getSubs() || []) : [];
        const contentArea = document.getElementById('content-area');
        const navBar = document.querySelector('.nav-bar');
        if (!contentArea) return;
        
        // Hide Default Nav Bar for Immersive Look
        if (navBar) navBar.style.display = 'none';

        // Full Screen Layout
        contentArea.style.padding = '0';
        contentArea.style.paddingBottom = '85px';
        contentArea.style.marginTop = '0';
        contentArea.style.background = 'white';
        
        // --- Date Logic for Calendar Header ---
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const date = now.getDate();
        const weekDay = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][now.getDay()];
        
        // Lunar Date (Mock - in real app use a library)
        const lunarDate = '二月初十'; // Placeholder
        const yi = '出行 交易 订盟';
        const ji = '安葬 动土 开市';
        
        const bgImages = [
            'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80', // Landscape
            'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80', // Nature
            'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&q=80', // Forest
            'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80', // Foggy
            'https://images.unsplash.com/photo-1501854140884-074cf2b2c3af?w=800&q=80', // Coast
            'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80', // Woods
            'https://images.unsplash.com/photo-1497436072909-60f360e1d4b0?w=800&q=80'  // Mountains
        ];
        const dailyIndex = (year + month + date) % bgImages.length;
        const dailyBg = bgImages[dailyIndex];

        // Determine VIP specific background style
        let bgStyle = `background: linear-gradient(135deg, #4A90E2, #007AFF); box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);`;
        let textStyle = 'color: white;';
        
        // If logged in, override with VIP specific colors/gradients to match Member Center
        if (user.isLogged) {
            if (user.vipLevel === 'city') {
                 // City - Ink Green
                 bgStyle = `background: linear-gradient(135deg, #2C5F2D, #1E3F1F); box-shadow: 0 4px 12px rgba(44, 95, 45, 0.3);`;
            } else if (user.vipLevel === 'province') {
                 // Province - Gold
                 bgStyle = `background: linear-gradient(135deg, #FFD700, #FDB931); box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);`;
                 textStyle = 'color: #5D4037;';
            } else if (user.vipLevel === 'country') {
                 // Country - Black Gold
                 bgStyle = `background: linear-gradient(135deg, #1C1C1E, #2C2C2E); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4); border-bottom: 1px solid #333;`;
                 textStyle = 'color: #FFD700;';
            } else if (user.vipLevel === 'free') {
                 // Free - Blue
                 bgStyle = `background: linear-gradient(135deg, #4A90E2, #007AFF); box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);`;
            }
        }

        // Custom Header + Content Construction
        let memberTitle = '普通用户';
        if (user.isLogged) {
            if (user.vipLevel === 'city') memberTitle = '城市会员';
            else if (user.vipLevel === 'province') memberTitle = '省级会员';
            else if (user.vipLevel === 'country') memberTitle = '全国会员';
        }
        const headerTitle = user.isLogged ? `${memberTitle}${user.username || '用户'}的订阅` : '我的订阅日历';
        const headerAction = user.isLogged ? 'showAddSubDialog()' : 'login()';

        let html = `
            <!-- Calendar Header Background (Matches Member Center Height) -->
            <div style="position: relative; height: 195px; overflow: hidden; ${textStyle}">
                <!-- Background Image/Gradient -->
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; ${bgStyle}"></div>
                
                <!-- Watermarks (Synced with Member Center) -->
                <div style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; z-index: 1; overflow: hidden; pointer-events: none;">
                    ${user.isLogged && user.vipLevel === 'country' ? '<div style="position: absolute; right: -20px; bottom: 40px; font-size: 150px; opacity: 0.1; transform: rotate(15deg);">👑</div>' : ''}
                    ${user.isLogged && user.vipLevel === 'province' ? '<div style="position: absolute; right: -20px; bottom: 40px; font-size: 150px; opacity: 0.1; transform: rotate(15deg);">💎</div>' : ''}
                    ${user.isLogged && user.vipLevel === 'city' ? '<div style="position: absolute; right: -20px; bottom: 40px; font-size: 150px; opacity: 0.1; transform: rotate(15deg);">🏙️</div>' : ''}
                    ${user.isLogged && user.vipLevel === 'free' ? '<div style="position: absolute; right: -20px; bottom: 40px; font-size: 150px; opacity: 0.05; transform: rotate(15deg);">👤</div>' : ''}
                </div>

                <!-- Content -->
                <div style="position: relative; z-index: 2; padding: calc(max(env(safe-area-inset-top), 44px) + 0px) 20px 20px 20px; display: flex; flex-direction: column; height: 100%;">
                    <!-- Top Bar -->
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="font-size: 20px; font-weight: 700;">${headerTitle}</div>
                        <div style="width: 32px; height: 32px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px); cursor: pointer;" onclick="${headerAction}">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </div>
                    </div>
                    
                    <!-- Calendar Info -->
                    <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                            <div style="display: flex; flex-direction: column; align-items: flex-start; margin-right: 16px;">
                                <div style="font-size: 20px; font-weight: 700; line-height: 1; margin-bottom: 6px;">${year}年${month}月${date}日</div>
                                <div style="font-size: 13px; opacity: 0.9;">${weekDay} · 农历${lunarDate}</div>
                            </div>
                            
                            <!-- Yi (Glass Effect) -->
                            <div style="background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(8px); padding: 0 12px; border-radius: 8px; font-size: 13px; display: flex; align-items: center; border: 1px solid rgba(255,255,255,0.2); height: 42px;">
                                <span style="font-weight: 800; margin-right: 8px; font-size: 15px; opacity: 1;">宜</span>
                                <span style="opacity: 0.95; white-space: nowrap;">${yi}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Overlap Container to pull content up -->
            <div style="position: relative; margin-top: -20px; border-top-left-radius: 20px; border-top-right-radius: 20px; background: white; z-index: 10; overflow: hidden;">
        `;
        
        if (this.state.subLoading) {
            html += `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 420px; text-align: center; padding: 60px 20px 140px 20px;">
                    <div style="font-size: 14px; color: #999;">加载中...</div>
                </div>
            `;
            html += `</div>`;
        } else if (subs.length === 0) {
            html += this.getEmptySubscriptionHTML();
            html += `</div>`; // Close wrapper
        } else {
            // Add Header Row (Sticky below Page Header)
            html += `
                <div style="display: flex; padding: 12px 16px; background-color: #F9F9F9; border-bottom: 1px solid #E5E5EA; font-size: 13px; color: #8E8E93; font-weight: 500; position: sticky; top: 0; z-index: 99;">
                    <div style="flex: 0 0 50%; min-width: 0; display: flex; align-items: center; justify-content: flex-start; padding-left: 12px;">关键词</div>
                    <div style="flex: 0 0 25%; min-width: 0; text-align: center; display: flex; align-items: center; justify-content: center;">APP推送</div>
                    <div style="flex: 0 0 25%; min-width: 0; text-align: center; display: flex; align-items: center; justify-content: center;">操作</div>
                </div>
                <div class="sub-list" style="min-height: 500px;">
            `;
            
            // Helper to format date exact
            const formatDateExact = (iso) => {
                if(!iso) return '';
                const d = new Date(iso);
                if(isNaN(d.getTime())) return '';
                const pad = n => n.toString().padStart(2, '0');
                return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
            };

            subs.forEach(sub => {
                // Determine display scope
                let scopeText = '';
                if (sub.scopeType === 'city') scopeText = sub.scopeValue + ' (城市)';
                else if (sub.scopeType === 'province') scopeText = sub.scopeValue + ' (全省)';
                else if (sub.scopeType === 'country') scopeText = '全国范围';
                else scopeText = '未知范围'; // Fallback

                // Keyword display
                const keywords = Array.isArray(sub.keywords) ? sub.keywords.join(', ') : sub.keywords;
                
                // Times
                const createTimeStr = sub.createTime ? formatDateExact(sub.createTime) : '-';
                const updateTimeStr = sub.updateTime ? formatDateExact(sub.updateTime) : '-';

                html += `
                    <div class="sub-item" onclick="showSubDetail(${sub.id})" style="display: flex; flex-direction: column; padding: 12px 0; border-bottom: 0.5px solid #E5E5EA;">
                        <div style="display: flex; align-items: center; width: 100%;">
                            <!-- Keywords (Flex 50%) - Center Vertical, Left Horizontal -->
                            <div style="flex: 0 0 50%; min-width: 0; display: flex; flex-direction: column; justify-content: center; align-items: flex-start; padding-left: 12px;">
                                <div style="font-size: 13px; font-weight: 600; color: #1C1C1E; margin-bottom: 6px; display: flex; align-items: center;">
                                    ${keywords}
                                    ${sub.unreadCount > 0 ? `<span style="margin-left: 4px; background: #FF3B30; color: white; font-size: 10px; padding: 0 4px; border-radius: 8px; min-width: 14px; height: 14px; display: flex; align-items: center; justify-content: center; line-height: 1;">${sub.unreadCount > 99 ? '99+' : sub.unreadCount}</span>` : ''}
                                </div>
                            </div>
                            
                            <!-- Toggle (Flex 25%) -->
                            <div style="flex: 0 0 25%; min-width: 0; display: flex; justify-content: center; align-items: center;" onclick="event.stopPropagation()">
                                <label class="switch" style="transform: scale(0.6);">
                                    <input type="checkbox" ${sub.pushEnabled ? 'checked' : ''} onchange="toggleSubPush(${sub.id}, this.checked)">
                                    <span class="slider round"></span>
                                </label>
                            </div>
                            
                            <!-- Actions (Flex 25%) - Right Aligned, Smaller Icons, Less Spacing -->
                            <div style="flex: 0 0 25%; min-width: 0; display: flex; justify-content: center; align-items: center; gap: 6px;">
                                <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="#007AFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" onclick="event.stopPropagation(); editSub(${sub.id})" style="width: 13px; height: 13px;">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                                <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" onclick="event.stopPropagation(); deleteSub(${sub.id})" style="width: 13px; height: 13px;">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </div>
                        </div>
                        
                        <!-- Time Info Row (New Layout) -->
                        <div style="display: flex; align-items: center; font-size: 10px; color: #8E8E93; padding-left: 12px; margin-top: 4px; width: 100%;">
                             <div style="margin-right: 16px; color: #8E8E93;">${scopeText}</div>
                             <div style="margin-right: 16px;">创建: <span style="font-variant-numeric: tabular-nums;">${createTimeStr}</span></div>
                             <div>最新编辑: <span style="font-variant-numeric: tabular-nums;">${updateTimeStr}</span></div>
                        </div>
                    </div>
                `;
            });
            html += `</div></div>`; // Close sub-list and wrapper
            html += `<div style="height: 100px;"></div>
                     <div class="floating-btn-container">
                        <div class="floating-btn" onclick="showAddSubDialog()">添加订阅</div>
                     </div>`;
        }
        
        contentArea.innerHTML = html;
    },

    // --- Subscription UI Logic ---
    
    toggleSubPush(id, checked) {
        // Pass true to skip updating the 'updateTime' timestamp
        if (checked) {
            window.SubManager.updateSub(id, { pushEnabled: true }, true);
            this.showToast('推送已开启');
            this.promptLocalNotifyPermission('开启后，订阅有更新会通过系统通知提醒你。').then(ret => {
                if (!(ret && ret.granted)) {
                    window.SubManager.updateSub(id, { pushEnabled: false }, true);
                    this.showToast('推送已关闭');
                    if (this.state.currentTab === 1) this.renderSubscriptionList();
                } else {
                    this.checkSubPushAndNotify();
                }
            });
            return;
        }
        window.SubManager.updateSub(id, { pushEnabled: false }, true);
        this.showToast('推送已关闭');
    },

    markAsRead(subId) {
        const sub = window.SubManager.getSub(subId);
        if (!sub) return;
        
        sub.unreadCount = 0;
        sub.lastCheckTime = Date.now();
        sub.lastReadAt = Date.now();
        window.SubManager.updateSub(sub.id, { unreadCount: 0, lastCheckTime: Date.now(), lastReadAt: sub.lastReadAt }, true);
        
        // Refresh List to remove badge
        if (this.state.currentTab === 1) {
            this.renderSubscriptionList();
        }
        
        // Also update modal if open? (Not needed as button disappears)
        const modal = document.getElementById('sub-detail-modal');
        if (modal) modal.style.display = 'none';
        
        this.showToast('已标记为已读');
    },

    showSubDetail(subId) {
        const sub = window.SubManager.getSub(subId);
        if (!sub) return;
        
        // Remove old modal elements if exist
        const oldModal = document.getElementById('sub-detail-modal');
        const oldMask = document.getElementById('sub-detail-mask');
        if (oldModal) oldModal.remove();
        if (oldMask) oldMask.remove();
        
        // Create modal using city-modal structure (Bottom Sheet)
        const modalHtml = `
            <div id="sub-detail-mask" class="city-modal-mask" onclick="App.closeSubDetail()" style="display: block; z-index: 9998;"></div>
            <div id="sub-detail-modal" class="city-modal" style="display: flex; z-index: 9999;">
                <div class="city-header" style="position: relative;">
                    <span style="width: 60px;"></span>
                    <span class="nav-title" style="position: absolute; left: 50%; transform: translateX(-50%);">订阅详情</span>
                    <div style="display: flex; gap: 12px; align-items: center; margin-left: auto; z-index: 1;">
                        ${sub.unreadCount > 0 ? `<div style="font-size: 14px; color: #007AFF; cursor: pointer; font-weight: normal;" onclick="App.markAsRead(${subId})">一键已读</div>` : ''}
                        <span class="nav-right" onclick="App.closeSubDetail()" style="position: static;">✕</span>
                    </div>
                </div>
                <div class="list-container" id="sub-detail-list" style="padding: 16px; padding-bottom: 40px;">
                    <div style="text-align: center; color: #999; margin-top: 40px;">加载中...</div>
                </div>
            </div>
        `;
        
        // Use document.querySelector('.iphone-frame') if exists, else body, to keep it inside the phone frame
        const container = document.querySelector('.iphone-frame') || document.body;
        container.insertAdjacentHTML('beforeend', modalHtml);
        
        const listContainer = document.getElementById('sub-detail-list');
        const keywordText = (Array.isArray(sub.keywords) ? sub.keywords : [sub.keywords]).map(k => (k || '').trim()).filter(Boolean).join('、');
        const safeKeywordText = keywordText.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
        
        setTimeout(async () => {
            const items = await this.querySubItems(sub, 300, 30);
            const lastReadAt = sub.lastReadAt || 0;
            const freshUnread = !lastReadAt
                ? items.length
                : items.filter(item => {
                    const dt = this.parseDate(item.datetime);
                    if (!dt || isNaN(dt.getTime())) return true;
                    return dt.getTime() > lastReadAt;
                }).length;
            if (sub.unreadCount !== freshUnread) {
                window.SubManager.updateSub(sub.id, { unreadCount: freshUnread, lastCheckTime: Date.now() }, true);
                sub.unreadCount = freshUnread;
                if (this.state.currentTab === 1) this.renderSubscriptionList();
            }
            const markBtn = document.querySelector('#sub-detail-modal div[onclick*="markAsRead"]');
            if (markBtn) markBtn.style.display = freshUnread > 0 ? '' : 'none';
            if (items.length === 0) {
                listContainer.innerHTML = `<div class="empty-state">暂无“${safeKeywordText || '该订阅'}”相关信息</div>`;
            } else {
                const extractPurchaser = (text) => {
                    if (!text) return '';
                    const m = text.match(/采购单位<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/);
                    if (!m || !m[1]) return '';
                    return m[1]
                        .replace(/<[^>]+>/g, '')
                        .replace(/&nbsp;/g, ' ')
                        .replace(/&amp;/g, '&')
                        .replace(/&lt;/g, '<')
                        .replace(/&gt;/g, '>')
                        .replace(/&quot;/g, '"')
                        .trim();
                };
                const normalizedItems = await Promise.all(items.map(async (item) => {
                    let purchaser = item.purchaser || '';
                    if (!purchaser.includes('...')) return { ...item, _purchaser: purchaser };
                    const fromLocalDetail = extractPurchaser(item.detail && item.detail.text ? item.detail.text : '');
                    if (fromLocalDetail) return { ...item, _purchaser: fromLocalDetail };
                    try {
                        const json = await this.fetchDetailById(item.id);
                        const fromRemoteDetail = extractPurchaser(json && json.code === 1 && json.data ? json.data.text : '');
                        if (fromRemoteDetail) return { ...item, _purchaser: fromRemoteDetail };
                    } catch (e) {}
                    return { ...item, _purchaser: purchaser };
                }));
                let html = '';
                normalizedItems.forEach(item => {
                    const time = this.formatTime(item.datetime);
                    const title = item.title || '无标题';
                    const purchaser = item._purchaser || item.purchaser || '';
                    const city = item.city || '';
                    const price = item.bid_price || item.bidPrice || '';
                    const amountBadge = this.getAmountBadge(price);
                    const type = item.types || '公告';
                    const tagClass = this.getTagClass(type);
                    const itemStr = encodeURIComponent(JSON.stringify(item)).replace(/'/g, "%27");
                    html += `
                        <div class="card" onclick="App.closeSubDetail(); showDetail('${itemStr}'); App.decreaseUnread(${subId})" style="margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                            <div style="margin-bottom: 6px; display: flex; align-items: center; min-height: 20px; justify-content: space-between;">
                                <div style="display: flex; align-items: center;">
                                    ${amountBadge ? `<span class="tag-new" style="background: ${amountBadge.bg}; color: ${amountBadge.color}; font-weight: bold; margin-right: 6px; vertical-align: middle;">${amountBadge.text}</span>` : ''}
                                    ${price && price !== '金额见正文' ? `<span style="color: #ff3b30; font-size: 13px; font-weight: 600;">${price}</span>` : ''}
                                </div>
                                <div style="font-size: 12px; color: var(--text-secondary); white-space: nowrap;">${time}</div>
                            </div>
                            <div style="margin-bottom: 8px; line-height: 1.5;">
                                <span class="card-title">${title}</span>
                                <span class="tag-new" style="background: ${tagClass.bg}; color: ${tagClass.text}; margin-left: 4px; vertical-align: 1px;">${type}</span>
                            </div>
                            <div class="card-meta">
                                <div class="meta-item" style="width: 100%; display: flex; align-items: center;">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 2px; flex-shrink: 0;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                    <span style="margin-right: 8px; white-space: nowrap; flex-shrink: 0;">${city}</span>
                                    ${purchaser ? `<span class="tag-new" title="${purchaser}" style="background: var(--tag-blue-bg); color: var(--tag-blue-text); font-size: 12px; display: inline-block; vertical-align: middle; white-space: normal; line-height: 1.4; padding: 4px 6px; max-width: 70%;">${purchaser}</span>` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                });
                listContainer.innerHTML = html;
            }
        }, 500);
    },
    
    closeSubDetail() {
        const modal = document.getElementById('sub-detail-modal');
        const mask = document.getElementById('sub-detail-mask');
        if (modal) modal.remove();
        if (mask) mask.remove();
    },
    
    decreaseUnread(subId) {
        const sub = window.SubManager.getSub(subId);
        if (!sub || !sub.unreadCount || sub.unreadCount <= 0) return;
        
        sub.unreadCount -= 1;
        const updates = { unreadCount: sub.unreadCount };
        if (sub.unreadCount === 0) {
            updates.lastReadAt = Date.now();
            sub.lastReadAt = updates.lastReadAt;
        }
        window.SubManager.updateSub(subId, updates, true);
        
        // If reduced to 0, refresh list to hide badge (will happen when modal closes or manual trigger)
        // We can update the "One Click Read" button visibility in real-time if we wanted
        if (sub.unreadCount === 0) {
             const btn = document.querySelector('#sub-detail-modal div[onclick*="markAsRead"]');
             if(btn) btn.style.display = 'none';
        }
        
        // Update main list in background
        if (this.state.currentTab === 1) {
            this.renderSubscriptionList();
        }
    },

    editSub(id) {
        const sub = window.SubManager.getSub(id);
        if (!sub) return;
        
        this.showAddSubDialog(true); // true = isEdit mode
        this.state.editingSubId = id;
        
        // Populate form
        const input = document.getElementById('sub-keywords');
        input.value = Array.isArray(sub.keywords) ? sub.keywords.join(', ') : sub.keywords;
        
        // Set region
        // We need to find the correct type element to simulate click or set state
        const regionType = sub.scopeType;
        const allowedTypes = this.getAllowedScopeTypes();
        const finalType = allowedTypes.includes(regionType) ? regionType : (allowedTypes[0] || regionType);
        let finalValue = finalType === regionType ? sub.scopeValue : '';
        if (!finalValue && finalType === 'country') finalValue = '全国';
        if (!finalValue && finalType !== 'country') finalValue = (this.state.user && this.state.user.vipScopeValue) || '';
        const regionEl = document.querySelector(`.region-option[onclick*="'${regionType}'"]`) || 
                         document.querySelectorAll('.region-option')[0]; // fallback
        
        const targetRegionEl = document.querySelector(`.region-option[onclick*="'${finalType}'"]`) || regionEl;
        this.selectRegion(targetRegionEl, finalType, { skipPicker: true, presetValue: finalValue });
        
        // Set toggle
        const toggle = document.querySelector('#sub-modal input[type="checkbox"]');
        if(toggle) toggle.checked = sub.pushEnabled;
        
        // Update title
        const title = document.querySelector('#sub-modal .modal-title');
        if(title) title.innerText = '编辑订阅';
    },

    openAddSubDialogWithScope(scopeType, scopeValue) {
        const modal = document.getElementById('sub-modal');
        const mask = document.getElementById('sub-modal-mask');
        modal.style.display = 'flex';
        mask.style.display = 'block';
        this.state.editingSubId = null;
        this.state.pendingSubDialogOpen = false;
        document.getElementById('sub-keywords').value = '';
        const regionEl = document.querySelector(`.region-option[onclick*="'${scopeType}'"]`) || document.querySelector('.region-option');
        this.selectRegion(regionEl, scopeType, { skipPicker: true, presetValue: scopeValue });
        const toggle = modal.querySelector('input[type="checkbox"]');
        if (toggle) toggle.checked = true;
        const title = document.querySelector('#sub-modal .modal-title');
        if (title) title.innerText = '添加订阅';
    },

    showAddSubDialog(isEdit = false) {
        const modal = document.getElementById('sub-modal');
        const mask = document.getElementById('sub-modal-mask');
        if (!isEdit) {
            const allowedType = this.getAllowedScopeType();
            if (!allowedType) {
                if (confirm('该功能仅限会员使用，是否前往升级？')) this.switchTab(2);
                return;
            }
            this.state.pendingSubDialogOpen = true;
            this.state.pickingForSub = 'scope';
            modal.style.display = 'none';
            mask.style.display = 'none';
            const cityModal = document.getElementById('city-modal');
            if (cityModal && cityModal.style.display !== 'flex') this.toggleCitySelection();
            this.showToast(this.getScopePickerHint());
            return;
        }
        modal.style.display = 'flex';
        mask.style.display = 'block';
    },
    
    closeSubDialog() {
        const modal = document.getElementById('sub-modal');
        const mask = document.getElementById('sub-modal-mask');
        modal.style.display = 'none';
        mask.style.display = 'none';
    },
    
    selectRegion(el, type, options = {}) {
        if (!el) return;
        // UI Toggle
        document.querySelectorAll('.region-option').forEach(opt => opt.classList.remove('selected'));
        el.classList.add('selected');
        
        this.state.tempRegion = type; // Store temp selection
        
        // Determine scope value based on type
        // In a real app, this might trigger a secondary selector.
        // Here we use current context or hardcode for demo.
        let scopeValue = '';
        const helper = document.getElementById('region-helper');
        const skipPicker = !!options.skipPicker;
        const presetValue = options.presetValue || '';
        
        if (type === 'city') {
             if (skipPicker) {
                scopeValue = presetValue || this.state.currentCity || '全国';
                if (helper) helper.innerText = `当前选择：${scopeValue}`;
                this.state.tempScopeValue = scopeValue;
                this.state.subLastScopeType = 'city';
                this.state.subLastScopeValue = scopeValue;
                return;
             }
             const permission = this.ensureScopePermission('city');
             if (!permission.allowed) {
                if (permission.message && permission.message.includes('是否前往升级')) {
                    if(confirm(permission.message)) {
                        this.closeSubDialog();
                        this.switchTab(2);
                    }
                } else {
                    this.showToast(permission.message || '当前会员无该订阅权限');
                }
                return;
             }
             
             this.state.pickingForSub = 'city';
             this.toggleCitySelection();
             this.showToast('请选择一个城市');
             return;
        } else if (type === 'province') {
             if (skipPicker) {
                scopeValue = presetValue || this.state.tempScopeValue || '';
                if (helper) helper.innerText = scopeValue ? `当前选择：${scopeValue}` : '当前选择：请选择省份';
                this.state.tempScopeValue = scopeValue;
                this.state.subLastScopeType = 'province';
                this.state.subLastScopeValue = scopeValue;
                return;
             }
             const permission = this.ensureScopePermission('province');
             if (!permission.allowed) {
                if (permission.message && permission.message.includes('是否前往升级')) {
                    if(confirm(permission.message)) {
                        this.closeSubDialog();
                        this.switchTab(2);
                    }
                } else {
                    this.showToast(permission.message || '当前会员无该订阅权限');
                }
                return;
             }

             this.state.pickingForSub = 'province';
             this.toggleCitySelection();
             this.showToast('请选择一个省份');
             return;
        } else if (type === 'country') {
           const permission = this.ensureScopePermission('country');
           if (!permission.allowed) {
                if (permission.message && permission.message.includes('是否前往升级')) {
                    if(confirm(permission.message)) {
                        this.closeSubDialog();
                        this.switchTab(2);
                    }
                } else {
                    this.showToast(permission.message || '当前会员无该订阅权限');
                }
                return;
           }
            scopeValue = '全国';
            helper.innerText = '当前选择：全国（全国会员权益）';
        }
        
        this.state.tempScopeValue = scopeValue;
        this.state.subLastScopeType = type;
        this.state.subLastScopeValue = scopeValue;
    },
    
    saveSubscription() {
        // Check Limit First
        const check = this.checkSubLimit();
        if (!check.allowed) {
            if (confirm(check.message)) {
                this.closeSubDialog();
                this.switchTab(2); // Go to Member Center
            }
            return;
        }

        const input = document.getElementById('sub-keywords');
        const rawKeywords = input.value.trim();
        
        if (!rawKeywords) {
            alert('请输入至少一个关键词');
            return;
        }
        
        // Split by comma (English or Chinese)
        const keywords = rawKeywords.split(/[,，]/).map(k => k.trim()).filter(k => k);
        
        if (keywords.length === 0) {
             alert('请输入有效的关键词');
             return;
        }

        // Check keyword length limit (max 9 chars)
        const longKeywords = keywords.filter(k => k.length > 9);
        if (longKeywords.length > 0) {
            alert(`关键词不能超过9个字：\n${longKeywords.join('\n')}`);
            return;
        }
        
        const scopeType = this.state.tempRegion || 'city';
        // Ensure scopeValue is set (might be empty if selectRegion wasn't clicked, so default)
        let scopeValue = this.state.tempScopeValue;
        if (!scopeValue) {
             // Default logic if user didn't click anything (defaults to 'city')
             scopeValue = this.state.currentCity;
        }
        const permission = this.ensureScopePermission(scopeType, scopeValue);
        if (!permission.allowed) {
            if (permission.message && permission.message.includes('是否前往升级')) {
                if (confirm(permission.message)) {
                    this.closeSubDialog();
                    this.switchTab(2);
                }
            } else {
                this.showToast(permission.message || '当前会员无该订阅权限');
            }
            return;
        }
        this.bindVipScopeFromSelection(scopeType, scopeValue);
        
        const pushEnabled = document.querySelector('#sub-modal input[type="checkbox"]').checked;
        
        // --- Fix for Update vs Add ---
        if (this.state.editingSubId) {
            // Update Existing
             const success = window.SubManager.updateSub(this.state.editingSubId, {
                keywords: keywords,
                scopeType: scopeType,
                scopeValue: scopeValue,
                pushEnabled: pushEnabled
            });
            
            if (success) {
                // Store scroll
                const contentArea = document.getElementById('content-area');
                const scrollTop = contentArea ? contentArea.scrollTop : 0;

                // Only re-render if we are on the subscription tab
                if (this.state.currentTab === 1) {
                    this.renderSubscriptionList();
                }
                this.closeSubDialog();
                this.showToast('订阅更新成功');
                
                // Restore scroll
                if (contentArea) contentArea.scrollTop = scrollTop;
            } else {
                alert('更新失败');
            }
        } else {
            // Add New
            const subData = {
                keywords: keywords,
                scopeType: scopeType,
                scopeValue: scopeValue,
                pushEnabled: pushEnabled
            };
            
            if (window.SubManager.addSub(subData)) {
                if (this.state.currentTab === 1) {
                    this.renderSubscriptionList();
                }
                this.closeSubDialog();
                this.showToast('订阅添加成功');
            } else {
                alert('该订阅规则已存在');
            }
        }
    },

    deleteSub(id) {
        if (confirm(`确定要删除该订阅吗？`)) {
            // Store current scroll position
            const contentArea = document.getElementById('content-area');
            const scrollTop = contentArea ? contentArea.scrollTop : 0;
            
            window.SubManager.removeSub(id);
            if (this.state.currentTab === 1) {
                this.renderSubscriptionList();
            }
            
            // Restore scroll position
            if (contentArea) contentArea.scrollTop = scrollTop;
        }
    },

    jumpToSearch(keyword) {
        this.switchTab(0);
        this.filterList(keyword);
        // Update Search Input UI
        setTimeout(() => {
            const input = document.querySelector('.search-input');
            if(input) input.value = keyword;
        }, 100);
    },

    // --- City Selection Logic ---

    toggleCitySelection() {
        const modal = document.getElementById('city-modal');
        const cityListContainer = document.getElementById('city-list-container');
        
        if (modal.style.display === 'flex') {
            modal.style.display = 'none';
        } else {
            modal.style.display = 'flex';
            // Render full city list if not already done
            if (!this.state.cityListRendered) {
                this.renderCityList();
                this.state.cityListRendered = true;
            }
        }
    },

    renderCityList() {
        const container = document.getElementById('city-list-container');
        if (!container) return;

        let html = '';
        const getFallbackImg = (name) => `https://picsum.photos/seed/province-${encodeURIComponent(name)}/200/150`;
        const getBgStyle = (name, primaryImg) =>
            `background-image: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('${primaryImg}'), url('${getFallbackImg(name)}');`;

        // --- 1. Hot Cities Section ---
        html += `<div class="city-section">热门城市</div><div class="hot-cities">`;
        const hotCities = [
            { name: "全国", img: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=200&h=150&fit=crop" },
            { name: "北京", img: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=200&h=150&fit=crop" },
            { name: "上海", img: "https://images.unsplash.com/photo-1548919973-5cef591cdbc9?w=200&h=150&fit=crop" },
            { name: "广州", img: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=200&h=150&fit=crop" },
            { name: "深圳", img: "https://images.unsplash.com/photo-1533135096723-4c95b2327b68?w=200&h=150&fit=crop" },
            { name: "重庆", img: "https://images.unsplash.com/photo-1571401835393-8c5f35328320?w=200&h=150&fit=crop" },
            { name: "杭州", img: "https://images.unsplash.com/photo-1627387498357-6b4554b32168?w=200&h=150&fit=crop" },
            { name: "珠海", img: "https://images.unsplash.com/photo-1552880414-2792613d961a?w=200&h=150&fit=crop" }
        ];

        hotCities.forEach(city => {
            html += `
                <div class="province-item" onclick="selectCity('${city.name}', true)" style="${getBgStyle(city.name, city.img)}">
                    <div class="province-name">${city.name}</div>
                </div>`;
        });
        html += `</div>`;

        // --- 2. Province Grid Section ---
        html += `<div class="city-section">省份及直辖市</div><div class="province-grid">`;
        
        // Define landmarks/icons and background images for each province
        const provinceInfo = {
            "直辖市": { icon: "🏛️", img: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=200&h=150&fit=crop" },
            "广东": { icon: "🗼", img: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=200&h=150&fit=crop" },
            "浙江": { icon: "🌉", img: "https://images.unsplash.com/photo-1627387498357-6b4554b32168?w=200&h=150&fit=crop" },
            "江苏": { icon: "🏯", img: "https://images.unsplash.com/photo-1582650742968-3e4b5258832a?w=200&h=150&fit=crop" },
            "山东": { icon: "⛰️", img: "https://images.unsplash.com/photo-1596567182325-c3d07b65adff?w=200&h=150&fit=crop" },
            "四川": { icon: "🐼", img: "https://images.unsplash.com/photo-1529927066849-79b791a69825?w=200&h=150&fit=crop" },
            "湖北": { icon: "🏯", img: "https://images.unsplash.com/photo-1569670671676-47b2e3e7a60b?w=200&h=150&fit=crop" },
            "湖南": { icon: "🌶️", img: "https://images.unsplash.com/photo-1528657685650-719c8f029587?w=200&h=150&fit=crop" }, // Changed
            "福建": { icon: "🍵", img: "https://images.unsplash.com/photo-1569396116180-210c182bedb8?w=200&h=150&fit=crop" },
            "安徽": { icon: "🏔️", img: "https://images.unsplash.com/photo-1523978591478-c753949ff840?w=200&h=150&fit=crop" },
            "河北": { icon: "🧱", img: "https://images.unsplash.com/photo-1547984609-44d97d7c600b?w=200&h=150&fit=crop" },
            "河南": { icon: "🥋", img: "https://images.unsplash.com/photo-1584617154226-c22f0c7667a2?w=200&h=150&fit=crop" },
            "辽宁": { icon: "🏭", img: "https://images.unsplash.com/photo-1541447271487-09612b3f49f7?w=200&h=150&fit=crop" },
            "陕西": { icon: "🗿", img: "https://images.unsplash.com/photo-1596567182325-c3d07b65adff?w=200&h=150&fit=crop" },
            "江西": { icon: "🏺", img: "https://images.unsplash.com/photo-1625848520286-620436858277?w=200&h=150&fit=crop" },
            "广西": { icon: "⛰️", img: "https://images.unsplash.com/photo-1535068484677-4b684305844e?w=200&h=150&fit=crop" },
            "云南": { icon: "🐘", img: "https://images.unsplash.com/photo-1517462740924-c9447c29367d?w=200&h=150&fit=crop" },
            "黑龙江": { icon: "❄️", img: "https://images.unsplash.com/photo-1580213076129-28c049863c0f?w=200&h=150&fit=crop" },
            "吉林": { icon: "🏔️", img: "https://images.unsplash.com/photo-1610967347775-6b583f7f0223?w=200&h=150&fit=crop" },
            "山西": { icon: "🍜", img: "https://images.unsplash.com/photo-1635338662973-1383748259b3?w=200&h=150&fit=crop" },
            "贵州": { icon: "🍶", img: "https://images.unsplash.com/photo-1557165738-4f811565780a?w=200&h=150&fit=crop" },
            "甘肃": { icon: "🐪", img: "https://images.unsplash.com/photo-1528657685650-719c8f029587?w=200&h=150&fit=crop" },
            "海南": { icon: "🥥", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&h=150&fit=crop" },
            "内蒙古": { icon: "🐎", img: "https://images.unsplash.com/photo-1559160586-2e88a3854800?w=200&h=150&fit=crop" },
            "宁夏": { icon: "🏜️", img: "https://images.unsplash.com/photo-1628581640161-090c292723c6?w=200&h=150&fit=crop" },
            "青海": { icon: "🌊", img: "https://images.unsplash.com/photo-1602148740552-320d3df24328?w=200&h=150&fit=crop" },
            "新疆": { icon: "🍇", img: "https://images.unsplash.com/photo-1536526136208-410c95cc547b?w=200&h=150&fit=crop" },
            "西藏": { icon: "🏔️", img: "https://images.unsplash.com/photo-1558981285-6f0c94958bb6?w=200&h=150&fit=crop" }
        };

        Object.keys(this.provinces).forEach(prov => {
            const info = provinceInfo[prov] || { icon: "📍", img: "" };
            html += `
                <div class="province-item" onclick="toggleProvince('${prov}')" style="${getBgStyle(prov, info.img)}">
                    <div class="province-name">${prov}</div>
                </div>`;
        });
        html += `</div>`;

        // Render Hidden City Lists for each Province
        for (const [province, cities] of Object.entries(this.provinces)) {
            // Note: The container CSS class 'province-cities-container' now handles grid layout
            html += `<div id="prov-${province}" class="province-cities-container" style="display: none;">
                        <div class="city-section sticky-header" onclick="toggleProvince('${province}')">
                            <span style="color: var(--primary-blue); font-weight: bold;">${province}</span>
                            <span style="font-size: 12px; color: #999; float: right;">收起</span>
                        </div>`;
            cities.forEach(city => {
                // Simplified city item without full width
                html += `<div class="city-item" onclick="selectCity('${city}', false)">${city}</div>`;
            });
            html += `</div>`;
        }
        
        container.innerHTML = html;
        this.state.allCitiesHtml = html; // Cache full list
        
        // Removed dynamic style injection since it's now in style.css
    },

    toggleProvince(provinceName) {
        // --- Picking Mode Check ---
        if (this.state.pickingForSub === 'scope') {
             const allowedTypes = this.getAllowedScopeTypes();
             if (!allowedTypes.includes('province') && allowedTypes.includes('city')) {
                 const allContainers = document.querySelectorAll('.province-cities-container');
                 const targetId = `prov-${provinceName}`;
                 const target = document.getElementById(targetId);
                 if (!target) return;
                 if (target.style.display === 'none') {
                     allContainers.forEach(el => el.style.display = 'none');
                     target.style.display = 'grid';
                     setTimeout(() => {
                         target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                     }, 100);
                 } else {
                     target.style.display = 'none';
                 }
                 this.showToast('请选择该省下属城市');
                 return;
             }
             const permission = this.ensureScopePermission('province', provinceName);
             if (!permission.allowed) {
                 this.showToast(permission.message || '当前会员无省份订阅权限，请重新选择');
                 return;
             }
             this.state.tempRegion = 'province';
             this.state.tempScopeValue = provinceName;
             this.state.subLastScopeType = 'province';
             this.state.subLastScopeValue = provinceName;
             this.state.pickingForSub = null;
             this.toggleCitySelection();
             if (this.state.pendingSubDialogOpen) this.openAddSubDialogWithScope('province', provinceName);
             return;
        }
        if (this.state.pickingForSub === 'province') {
             const permission = this.ensureScopePermission('province', provinceName);
             if (!permission.allowed) {
                 this.showToast(permission.message || '当前会员无省份订阅权限，请重新选择');
                 return;
             }
             // Select this province
             const helper = document.getElementById('region-helper');
             this.state.tempScopeValue = provinceName;
             if (helper) helper.innerText = `当前选择：${provinceName}`;
            this.state.tempRegion = 'province';
            this.state.subLastScopeType = 'province';
            this.state.subLastScopeValue = provinceName;
             
             this.toggleCitySelection(); // Close modal
             this.state.pickingForSub = null; // Reset
             return;
        }

        // Hide all other open provinces first (optional, accordion style)
        const allContainers = document.querySelectorAll('.province-cities-container');
        const targetId = `prov-${provinceName}`;
        const target = document.getElementById(targetId);
        
        // Toggle current
        if (target.style.display === 'none') {
            // Close others
            allContainers.forEach(el => el.style.display = 'none');
            // Show this one
            target.style.display = 'grid';
            // Scroll to it
            setTimeout(() => {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        } else {
            target.style.display = 'none';
        }
    },

    filterCity(keyword) {
        const container = document.getElementById('city-list-container');
        if (!keyword) {
            container.innerHTML = this.state.allCitiesHtml;
            return;
        }

        const items = container.querySelectorAll('.city-item');
        const sections = container.querySelectorAll('.city-section');
        
        // Simple client-side filter
        // Hide all first
        items.forEach(el => el.style.display = 'none');
        sections.forEach(el => el.style.display = 'none');

        let found = false;
        items.forEach(el => {
            if (el.innerText.includes(keyword)) {
                el.style.display = 'flex'; // Restore display
                // Try to show previous sibling if it is a section header (simplified approach)
                let prev = el.previousElementSibling;
                while(prev && !prev.classList.contains('city-section')) {
                    prev = prev.previousElementSibling;
                }
                if (prev) prev.style.display = 'block';
                found = true;
            }
        });
        
        if (!found) {
            container.innerHTML = `<div style="padding: 20px; text-align: center; color: #999;">未找到相关城市</div>`;
        } else {
             // Re-attach events if innerHTML was wiped (not the case here as we just toggled display, 
             // BUT if we used innerHTML for 'not found' we need to restore structure when keyword is cleared.
             // So actually, better to just toggle display.
             // If not found, we can append a message or just leave blank.
        }
        
        // If keyword is cleared, we need to restore from cache because we might have overwritten with "Not found"
        if (!keyword) {
             container.innerHTML = this.state.allCitiesHtml;
        }
    },

    selectCity(city, fromHot = false) {
        // --- Picking Mode Check ---
        if (this.state.pickingForSub === 'scope') {
             if (city === '全国') {
                const permission = this.ensureScopePermission('country', '全国');
                if (!permission.allowed) {
                    this.showToast(permission.message || '当前会员无全国订阅权限，请重新选择');
                    return;
                }
                this.state.tempRegion = 'country';
                this.state.tempScopeValue = '全国';
                this.state.subLastScopeType = 'country';
                this.state.subLastScopeValue = '全国';
                this.state.pickingForSub = null;
                this.toggleCitySelection();
                if (this.state.pendingSubDialogOpen) this.openAddSubDialogWithScope('country', '全国');
                return;
             }
             const permission = this.ensureScopePermission('city', city);
             if (!permission.allowed) {
                this.showToast(permission.message || '当前会员无城市订阅权限，请重新选择');
                return;
             }
             this.state.tempRegion = 'city';
             this.state.tempScopeValue = city;
             this.state.subLastScopeType = 'city';
             this.state.subLastScopeValue = city;
             this.state.pickingForSub = null;
             this.toggleCitySelection();
             if (this.state.pendingSubDialogOpen) this.openAddSubDialogWithScope('city', city);
             return;
        }
        if (this.state.pickingForSub === 'city') {
             const helper = document.getElementById('region-helper');
             if (city === '全国') {
                const permission = this.ensureScopePermission('country', '全国');
                if (!permission.allowed) return this.showToast(permission.message || '请先选择具体城市');
                this.state.tempRegion = 'country';
                this.state.tempScopeValue = '全国';
                this.state.subLastScopeType = 'country';
                this.state.subLastScopeValue = '全国';
                if (helper) helper.innerText = '当前选择：全国（全国会员权益）';
                document.querySelectorAll('.region-option').forEach(opt => opt.classList.remove('selected'));
                const countryEl = document.querySelector(`.region-option[onclick*="'country'"]`);
                if (countryEl) countryEl.classList.add('selected');
             } else {
                const permission = this.ensureScopePermission('city', city);
                if (!permission.allowed) return this.showToast(permission.message || '当前会员无城市订阅权限，请重新选择');
                this.state.tempRegion = 'city';
                this.state.tempScopeValue = city;
                this.state.subLastScopeType = 'city';
                this.state.subLastScopeValue = city;
                if (helper) helper.innerText = `当前选择：${city}`;
                document.querySelectorAll('.region-option').forEach(opt => opt.classList.remove('selected'));
                const cityEl = document.querySelector(`.region-option[onclick*="'city'"]`);
                if (cityEl) cityEl.classList.add('selected');
             }
             
             this.toggleCitySelection(); // Close modal
             this.state.pickingForSub = null; // Reset
             return;
        }

        this.state.currentCity = city;
        this.safeStorageSet('br_default_city', city);
        document.getElementById('current-city').innerText = city;
        this.toggleCitySelection();
        // Refresh data from server for the new city
        this.fetchData(0, false);
    },

    // --- Helpers ---
    
    formatTime(dateStr) {
        if (!dateStr) return '';
        try {
            const rawText = typeof dateStr === 'string' ? dateStr.trim() : '';
            const hasTimePart = /(\d{1,2}):(\d{2})/.test(rawText);
            if (rawText && !hasTimePart) {
                if (rawText.includes('今天')) return '今天';
                if (rawText.includes('昨天')) return '昨天';
                if (rawText.includes('前天')) return '前天';
                if (rawText.includes('明天')) return '明天';
            }

            let date;
            // Handle Timestamp (number or numeric string)
            // If it's a number or a string containing only digits
            if (typeof dateStr === 'number' || (typeof dateStr === 'string' && /^\d+$/.test(dateStr))) {
                let ts = parseInt(dateStr);
                // Heuristic: If timestamp is in seconds (10 digits, e.g. 17xxxxxxxx), multiply by 1000
                // 10 digits ends around year 2286, so it's safe for now. 
                // 13 digits (ms) starts around 1970.
                if (ts < 10000000000) ts *= 1000;
                date = new Date(ts);
            } else {
                // Handle String Date (e.g. "2026-03-04 12:00:00" or "2026年03月04日 12:00")
                // Clean up Chinese chars and standard separators
                const safeStr = String(dateStr)
                    .replace(/年/g, '/')
                    .replace(/月/g, '/')
                    .replace(/日/g, '')
                    .replace(/-/g, '/');
                date = new Date(safeStr);
            }

            if (isNaN(date.getTime())) return dateStr; // Return original if parsing fails

            const now = new Date();
            // Reset time part for accurate date comparison
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const beforeYesterday = new Date(today);
            beforeYesterday.setDate(beforeYesterday.getDate() - 2);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            
            // Format HH:MM
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            const timeStr = `${hours}:${minutes}`;

            // Helper to format MM-DD
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');

            if (itemDate.getTime() === today.getTime()) {
                return `今天 ${timeStr}`;
            } else if (itemDate.getTime() === tomorrow.getTime()) {
                return `明天 ${timeStr}`;
            } else if (itemDate.getTime() === yesterday.getTime()) {
                return `昨天 ${timeStr}`;
            } else if (itemDate.getTime() === beforeYesterday.getTime()) {
                return `前天 ${timeStr}`;
            } else {
                // Older dates: YYYY-MM-DD HH:MM
                const year = date.getFullYear();
                
                // If not current year, show year
                if (year !== now.getFullYear()) {
                    return `${year}-${month}-${day} ${timeStr}`;
                }
                return `${month}-${day} ${timeStr}`;
            }
        } catch (e) {
            console.error("Format Time Error:", e);
            return dateStr;
        }
    },

    // Parse price string to number for badge logic
    parsePrice(priceStr) {
        if (!priceStr || priceStr === '金额见正文') return 0;
        try {
            // Ensure string
            const str = String(priceStr);
            // Extract number from string like "¥320.7384万元" or "¥5万元"
            const num = parseFloat(str.replace(/[^\d.]/g, ''));
            if (isNaN(num)) return 0;
            
            if (str.includes('万')) {
                return num * 10000;
            } else if (str.includes('亿')) {
                return num * 100000000;
            }
            return num; // Assuming raw number is Yuan
        } catch (e) {
            console.warn("Price parse error:", e);
            return 0;
        }
    },

    getAmountBadge(priceStr) {
        if (!priceStr || priceStr === '金额见正文' || priceStr === 'null' || priceStr === 'undefined') {
            return { text: '未公示金额', bg: '#FFF3E0', color: '#FF9500' }; // Orange for undisclosed
        }
        
        // Clean string first
        const amount = this.parsePrice(priceStr);
        
        // If amount is 0 but priceStr wasn't explicitly empty, it might be parsing failure or truly 0
        if (amount === 0) {
             return { text: '未公示金额', bg: '#FFF3E0', color: '#FF9500' }; // Orange for undisclosed
        } else if (amount >= 100000000) { // 1亿
            return { text: '亿级项目', bg: '#FF3B30', color: 'white' }; // Red
        } else if (amount >= 10000000) { // 1000万
            return { text: '千万级项目', bg: '#FF9500', color: 'white' }; // Orange
        } else if (amount >= 1000000) { // 100万
            return { text: '百万级项目', bg: '#5856D6', color: 'white' }; // Purple
        } else {
            return { text: '百万以下项目', bg: '#34C759', color: 'white' }; // Green
        }
    },

    getTagClass(type) {
        if (type.includes('中标')) return { bg: 'var(--tag-blue-bg)', text: 'var(--tag-blue-text)' };
        if (type.includes('招标') || type.includes('公告')) return { bg: 'var(--tag-blue-bg)', text: 'var(--tag-blue-text)' };
        if (type.includes('变更')) return { bg: 'var(--tag-red-bg)', text: 'var(--tag-red-text)' };
        return { bg: 'var(--tag-gray-bg)', text: 'var(--tag-gray-text)' };
    },
    
    toggleSearch() {
        // ... (Optional if we want to hide/show search)
    },

    // --- User Logic ---
    
    loadUser() {
        try {
            const saved = localStorage.getItem('br_user');
            if (saved) {
                this.state.user = JSON.parse(saved);
            }
        } catch (e) {
            console.error("Failed to load user", e);
        }
    },
    
    saveUser() {
        try { localStorage.setItem('br_user', JSON.stringify(this.state.user)); } catch (e) {}
    },

    applyServerUser(serverUser) {
        const u = serverUser || {};
        let viewHistory = [];
        try {
            const raw = u.viewHistoryJson || u.view_history_json || '[]';
            const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
            if (Array.isArray(arr)) viewHistory = arr;
        } catch (e) {}
        const vipExpire = u.vipExpire || (u.vip_expire_at ? String(u.vip_expire_at).slice(0, 10) : '');
        this.state.user = {
            isLogged: true,
            username: u.username || this.state.user.username || '',
            avatar: u.avatar || this.state.user.avatar || '',
            vipLevel: u.vipLevel || u.vip_level || 'free',
            vipScopeValue: u.vipScopeValue || u.vip_scope_value || '',
            vipExpire: vipExpire || '',
            balance: Number(u.balance || u.balance_yuan || 0),
            viewUsage: Number(u.viewUsage || u.view_usage || 0),
            viewHistory
        };
        this.saveUser();
        this.state.vipCardTab = this.state.user.vipLevel;
    },

    async syncMemberFromServer() {
        const apiBase = this.getApiBase();
        if (!apiBase) return;
        if (!this.getAuthToken()) return;
        try {
            const res = await this.requestJson(`${apiBase}/api/member/me`);
            if (res.ok && res.json && res.json.code === 1 && res.json.data && res.json.data.user) {
                this.applyServerUser(res.json.data.user);
                try {
                    if (window.SubManager && window.SubManager.setAuth) {
                        window.SubManager.setAuth(apiBase, this.getAuthToken());
                    }
                    if (window.SubManager && window.SubManager.refreshFromServer) {
                        window.SubManager.refreshFromServer();
                    }
                } catch (e) {}
                this.switchTab(this.state.currentTab || 0);
            }
        } catch (e) {}
    },

    async syncUsageToServer() {
        const apiBase = this.getApiBase();
        if (!apiBase) return;
        if (!this.getAuthToken()) return;
        if (!this.state.user.isLogged) return;
        try {
            await this.requestJson(`${apiBase}/api/member/usage`, {
                method: 'PUT',
                body: { viewUsage: this.state.user.viewUsage || 0, viewHistory: this.state.user.viewHistory || [] }
            });
        } catch (e) {}
    },
    
    // --- Auth Logic ---
    
    openLoginModal() {
        const modal = document.getElementById('login-modal');
        modal.style.display = 'flex';
        // Reset to login mode
        this.switchAuthMode('login');
    },

    closeLoginModal() {
        const modal = document.getElementById('login-modal');
        modal.style.display = 'none';
    },

    switchAuthMode(mode) {
        this.state.authMode = mode; // 'login' or 'register'
        
        // Update Tabs
        const loginTab = document.getElementById('tab-login');
        const regTab = document.getElementById('tab-register');
        const confirmGroup = document.getElementById('confirm-password-group');
        const btn = document.getElementById('auth-btn');
        const helper = document.getElementById('auth-helper');
        const title = document.querySelector('.login-modal .detail-nav div:nth-child(2)'); // "用户登录"

        if (mode === 'login') {
            loginTab.classList.add('active');
            regTab.classList.remove('active');
            confirmGroup.style.display = 'none';
            btn.textContent = '登录';
            helper.textContent = '未注册手机号验证后将自动创建账号';
            if(title) title.textContent = '用户登录';
        } else {
            regTab.classList.add('active');
            loginTab.classList.remove('active');
            confirmGroup.style.display = 'block';
            btn.textContent = '注册';
            helper.textContent = '注册即代表同意《用户协议》和《隐私政策》';
            if(title) title.textContent = '用户注册';
        }
    },

    async handleAuth() {
        const usernameInput = document.getElementById('auth-username');
        const passwordInput = document.getElementById('auth-password');
        const confirmInput = document.getElementById('auth-confirm-password');
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        
        if (!username || !password) {
            this.showToast('请输入用户名和密码');
            return;
        }

        const mode = this.state.authMode || 'login';
        const apiBase = this.getApiBase();
        if (!apiBase) {
            this.showToast('未配置API地址');
            return;
        }

        if (mode === 'register') {
            const confirmPass = confirmInput.value.trim();
            if (password !== confirmPass) {
                this.showToast('两次输入的密码不一致');
                return;
            }
            try {
                const res = await this.requestJson(`${apiBase}/api/auth/register`, {
                    method: 'POST',
                    body: { username, password, nickname: username }
                });
                if (res.ok && res.json && res.json.success) {
                    this.showToast('注册成功，请登录');
                    this.switchAuthMode('login');
                    return;
                }
                this.showToast((res.json && (res.json.message || res.json.msg)) || '注册失败');
            } catch (e) {
                this.showToast('注册失败');
            }
            
        } else {
            try {
                const res = await this.requestJson(`${apiBase}/api/auth/login`, {
                    method: 'POST',
                    body: { username, password }
                });
                if (res.ok && res.json && res.json.success && res.json.token) {
                    this.setAuthToken(res.json.token);
                    this.applyServerUser(res.json.user || { username });
                    try {
                        if (window.SubManager && window.SubManager.setAuth) {
                            window.SubManager.setAuth(apiBase, this.getAuthToken());
                        }
                    } catch (e) {}
                    await this.syncMemberFromServer();
                    this.closeLoginModal();
                    this.switchTab(2);
                    this.showToast('登录成功');
                    return;
                }
                this.showToast((res.json && (res.json.message || res.json.msg)) || '登录失败');
            } catch (e) {
                this.showToast('登录失败');
            }
        }
    },
    
    login() {
        this.openLoginModal();
    },
    
    logout() {
        if(confirm('确定要退出登录吗？')) {
            this.state.user = {
                isLogged: false,
                username: '',
                avatar: '',
                vipLevel: 'free',
                vipScopeValue: '',
                vipExpire: null,
                balance: 0,
                viewUsage: 0,
                viewHistory: []
            };
            this.saveUser();
            this.setAuthToken('');
            try {
                if (window.SubManager && window.SubManager.setAuth) window.SubManager.setAuth(this.getApiBase(), '');
            } catch (e) {}
            // Reset tab to free
            this.state.vipCardTab = 'free';
            this.switchTab(2);
            this.showToast('已退出登录');
        }
    },
    
    async activateMember() {
        if (!this.state.user.isLogged) {
            alert('请先登录');
            this.login();
            return;
        }
        
        const input = document.getElementById('activation-code');
        const code = input.value.trim().toUpperCase();
        if (!code) {
            this.showToast('请输入激活码');
            return;
        }
        const apiBase = this.getApiBase();
        const province = this.getProvinceForCity(this.state.currentCity) || '';
        const city = this.state.currentCity !== '全国' ? this.state.currentCity : '';
        try {
            const res = await this.requestJson(`${apiBase}/api/member/activate`, {
                method: 'POST',
                body: { code, city, province }
            });
            if (res.ok && res.json && res.json.code === 1 && res.json.data) {
                const d = res.json.data;
                this.state.user.vipLevel = d.vipLevel || this.state.user.vipLevel;
                this.state.user.vipScopeValue = d.vipScopeValue || this.state.user.vipScopeValue;
                this.state.user.vipExpire = d.vipExpire || this.state.user.vipExpire;
                if (typeof d.balance === 'number') this.state.user.balance = d.balance;
                this.saveUser();
                this.switchTab(2);
                this.showToast('激活成功');
                return;
            }
            this.showToast((res.json && (res.json.msg || res.json.message)) || '激活失败');
        } catch (e) {
            this.showToast('激活失败');
        }
    },
    
    async buyMember(level, price) {
        if (!this.state.user.isLogged) {
            alert('请先登录');
            this.login();
            return;
        }
        
        if (confirm(`确认支付 ¥${price} 开通${level === 'city' ? '城市' : level === 'province' ? '省级' : '全国'}会员吗？(模拟支付)`)) {
            const apiBase = this.getApiBase();
            const province = this.getProvinceForCity(this.state.currentCity) || '';
            const city = this.state.currentCity !== '全国' ? this.state.currentCity : '';
            const scopeValue = level === 'city' ? city : level === 'province' ? province : '全国';
            try {
                const res = await this.requestJson(`${apiBase}/api/member/purchase`, {
                    method: 'POST',
                    body: { planCode: level, scopeValue }
                });
                if (res.ok && res.json && res.json.code === 1 && res.json.data) {
                    const d = res.json.data;
                    this.state.user.vipLevel = d.vipLevel || this.state.user.vipLevel;
                    this.state.user.vipScopeValue = d.vipScopeValue || this.state.user.vipScopeValue;
                    this.state.user.vipExpire = d.vipExpire || this.state.user.vipExpire;
                    if (typeof d.balance === 'number') this.state.user.balance = d.balance;
                    this.saveUser();
                    this.switchTab(2);
                    this.showToast('开通成功');
                    return;
                }
                this.showToast((res.json && (res.json.msg || res.json.message)) || '开通失败');
            } catch (e) {
                this.showToast('开通失败');
            }
        }
    },

    // --- HTML Templates ---
    
    renderHomeNav(navBar) {
         if (!navBar) return;
         navBar.innerHTML = `
            <div style="padding: 0 16px; display: flex; width: 100%; justify-content: space-between; align-items: center;">
                <div class="location-selector" onclick="toggleCitySelection()">
                    <span id="current-city">${this.state.currentCity}</span> 
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 4px; margin-top: 2px;"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
                
                <div class="search-bar-wrapper">
                    <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input type="text" class="search-input" placeholder="输入你想关注的项目" oninput="filterList(this.value)" value="${this.state.searchKeyword}">
                </div>
                
                <div style="margin-left: 12px; display: flex; align-items: center; color: #FFD700; cursor: pointer;" onclick="switchTab(2)">
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path>
                     </svg>
                     <span style="font-size: 12px; font-weight: 900; margin-left: 2px; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">VIP</span>
                </div>
            </div>
        `;
    },

    getEmptySubscriptionHTML() {
        const isLogged = !!(this.state.user && this.state.user.isLogged);
        const emptyTitle = isLogged ? '暂无订阅' : '请先登录';
        const emptyDesc = isLogged ? '添加关键词，不错过任何商机' : '登录后查看并同步您的订阅内容';
        const actionText = isLogged ? '添加订阅' : '立即登录';
        const actionHandler = isLogged ? 'showAddSubDialog()' : 'login()';
        return `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 420px; color: var(--text-secondary); text-align: center; padding: 60px 20px 140px 20px;">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 20px; color: #E5E5EA;">
                     <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                     <polyline points="17 8 12 3 7 8"></polyline>
                     <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <h3 style="margin: 0; color: #333; font-weight: 600;">${emptyTitle}</h3>
                <p style="margin-top: 8px; font-size: 14px; color: #999;">${emptyDesc}</p>
            </div>
            <div class="floating-btn-container">
                <div class="floating-btn" onclick="${actionHandler}">${actionText}</div>
            </div>
        `;
    },

    // --- Member Center Logic ---
    
    switchVipCard(level) {
        if (this.state.currentTab !== 2) return; // Guard: Only allow in Member Center

        this.state.vipCardTab = level;
        // Re-render Member Center
        const contentArea = document.getElementById('content-area');
        if (contentArea) {
            contentArea.innerHTML = this.getMemberCenterHTML();
        }
    },

    getMemberCenterHTML() {
        const user = this.state.user || {};
        // Ensure user properties exist to prevent crashes
        user.vipLevel = user.vipLevel || 'free';
        user.balance = user.balance || 0;
        user.avatar = user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop';
        user.username = user.username || '用户';

        // If logged in, default to their actual level unless manually switched (state.vipCardTab)
        // If not logged in, default to 'free'
        let currentTab = this.state.vipCardTab;
        
        if (!currentTab) {
            if (user.isLogged && user.vipLevel !== 'none') {
                currentTab = user.vipLevel;
            } else {
                currentTab = 'free';
            }
            // Sync state so tabs highlight correctly
            this.state.vipCardTab = currentTab;
        }
        
        let userCardHtml = '';
        let memberContentMarginTop = '-28px';
        
        // Define Icons
        const cityIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="#C0C0C0" stroke="#808080" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-top: -2px;"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path></svg>';
        const provIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="#FFD700" stroke="#DAA520" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-top: -2px;"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path></svg>';
        const countryIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="#333" stroke="#FFD700" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-top: -2px;"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path></svg>';
        
        if (user.isLogged) {
            let vipBadge = '';
            let vipClass = 'gray';
            let vipIcon = '';
            // Free Member: Blue
            let cardStyle = 'background: radial-gradient(circle at 18% 10%, rgba(255,255,255,0.24) 0, rgba(255,255,255,0) 36%), radial-gradient(circle at 84% 82%, rgba(0,229,255,0.2) 0, rgba(0,229,255,0) 44%), linear-gradient(135deg, #0F5FE9 0%, #007AFF 52%, #00B4FF 100%); color: white; box-shadow: 0 8px 24px rgba(16, 96, 233, 0.28);'; 
            let avatarBorder = 'border: 2px solid rgba(255,255,255,0.8);';
            let badgeStyle = 'background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(4px);';
            let logoutBtnStyle = 'background: rgba(255,255,255,0.2); color: white;';
            
            if (user.vipLevel === 'city') { 
                vipBadge = '城市会员'; 
                vipClass = 'green';
                vipIcon = cityIcon;
                // City Member: Dark Green (Ink Green)
                cardStyle = 'background: linear-gradient(135deg, #2C5F2D, #1E3F1F); color: white; box-shadow: 0 4px 12px rgba(44, 95, 45, 0.3);';
                avatarBorder = 'border: 2px solid rgba(255,255,255,0.6);';
                badgeStyle = 'background: rgba(255,255,255,0.15); color: white; backdrop-filter: blur(4px);';
            }
            else if (user.vipLevel === 'province') { 
                vipBadge = '省级会员'; 
                vipClass = 'gold';
                vipIcon = provIcon;
                // Provincial Member: Gold
                cardStyle = 'background: linear-gradient(135deg, #FFD700, #FDB931); color: #5D4037; box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);';
                avatarBorder = 'border: 2px solid rgba(255,255,255,0.8);';
                badgeStyle = 'background: rgba(255,255,255,0.4); color: #5D4037; backdrop-filter: blur(4px); font-weight: 600;';
                logoutBtnStyle = 'background: rgba(255,255,255,0.4); color: #5D4037;';
            }
            else if (user.vipLevel === 'country') { 
                vipBadge = '全国会员'; 
                vipClass = 'black-gold';
                vipIcon = countryIcon;
                // National Member: Black Gold
                cardStyle = 'background: linear-gradient(135deg, #1C1C1E, #2C2C2E); color: #FFD700; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4); border: 1px solid #333;';
                avatarBorder = 'border: 2px solid #FFD700;';
                badgeStyle = 'background: linear-gradient(90deg, #FFD700, #FDB931); color: #1C1C1E; font-weight: 800; box-shadow: 0 2px 4px rgba(0,0,0,0.3);';
                logoutBtnStyle = 'background: rgba(255, 255, 255, 0.1); color: #FFD700; border: 1px solid #FFD700;';
            }
            
            const badgeHtml = user.vipLevel !== 'free' ? 
                `<span class="tag-new" style="${badgeStyle} margin-left: 8px; padding: 2px 8px; border-radius: 12px; font-size: 11px; display: flex; align-items: center;">
                    <span style="margin-right: 4px;">${vipIcon}</span>${vipBadge}
                 </span>` : 
                `<span class="tag-new" style="${badgeStyle} margin-left: 8px; padding: 2px 8px; border-radius: 12px; font-size: 11px;">普通用户</span>`;
                
            const expireHtml = user.vipExpire ? `<div style="font-size: 12px; opacity: 0.8; margin-top: 4px;">有效期至: ${user.vipExpire}</div>` : '';


            userCardHtml = `
                <div style="${cardStyle} padding: 20px; padding-top: calc(max(env(safe-area-inset-top), 44px) + 12px); display: flex; flex-direction: column; align-items: center; justify-content: flex-start; z-index: 0; position: absolute; top: 0; left: 0; width: 100%; height: 246px;">
                    <img src="${user.avatar}" style="width: 72px; height: 72px; border-radius: 50%; margin-bottom: 12px; object-fit: cover; ${avatarBorder} box-shadow: 0 4px 8px rgba(0,0,0,0.15);">
                    <div style="z-index: 2; display: flex; flex-direction: column; align-items: center;">
                        <div style="font-size: 20px; font-weight: 700; display: flex; align-items: center; margin-bottom: 6px; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                            ${user.username}
                            ${badgeHtml}
                        </div>
                        ${expireHtml}
                    </div>
                    <button style="${logoutBtnStyle} position: absolute; top: calc(max(env(safe-area-inset-top), 44px) + 24px); right: 20px; border: none; padding: 6px 14px; border-radius: 14px; font-size: 12px; font-weight: 500; backdrop-filter: blur(4px); z-index: 2;" onclick="logout()">退出</button>
                    
                    ${user.vipLevel === 'country' ? '<div style="position: absolute; right: -20px; bottom: 40px; font-size: 150px; opacity: 0.1; transform: rotate(15deg);">👑</div>' : ''}
                    ${user.vipLevel === 'province' ? '<div style="position: absolute; right: -20px; bottom: 40px; font-size: 150px; opacity: 0.1; transform: rotate(15deg);">💎</div>' : ''}
                    ${user.vipLevel === 'city' ? '<div style="position: absolute; right: -20px; bottom: 40px; font-size: 150px; opacity: 0.1; transform: rotate(15deg);">🏙️</div>' : ''}
                    ${user.vipLevel === 'free' ? '<div style="position: absolute; right: -20px; bottom: 40px; font-size: 150px; opacity: 0.05; transform: rotate(15deg);">👤</div>' : ''}
                </div>
                <div style="height: 246px;"></div>
            `;
        } else {
            userCardHtml = `
                <div style="background: radial-gradient(circle at 16% 10%, rgba(255,255,255,0.28) 0, rgba(255,255,255,0) 36%), radial-gradient(circle at 85% 82%, rgba(0,229,255,0.22) 0, rgba(0,229,255,0) 44%), linear-gradient(135deg, #0F5FE9 0%, #007AFF 52%, #00B4FF 100%); color: white; padding: 20px; padding-top: calc(max(env(safe-area-inset-top), 44px) + 10px); display: flex; flex-direction: column; align-items: center; justify-content: flex-start; z-index: 0; position: absolute; top: 0; left: 0; width: 100%; height: 246px; overflow: hidden;">
                    <div style="position: absolute; inset: 0; background: linear-gradient(120deg, rgba(255,255,255,0.12), rgba(255,255,255,0) 35%);"></div>
                    <div style="position: absolute; width: 220px; height: 220px; right: -90px; bottom: -120px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.2);"></div>
                    <div style="position: absolute; width: 170px; height: 170px; right: -45px; bottom: -80px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.2);"></div>
                    <div style="width: 72px; height: 72px; background-color: rgba(255,255,255,0.86); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; box-shadow: 0 6px 14px rgba(0,0,0,0.1); z-index: 2; cursor: pointer;" onclick="login()">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                    <div style="text-align: center; margin-bottom: 10px; z-index: 2;">
                        <div style="font-size: 18px; font-weight: 600; color: white;">未登录</div>
                        <div style="font-size: 13px; color: rgba(255,255,255,0.9); margin-top: 4px; line-height: 1.45;">点击圆形头像图标进入登录页面</div>
                    </div>
                </div>
                <div style="height: 246px;"></div>
            `;
            memberContentMarginTop = '-24px';
        }

        // --- VIP Card Tabs ---
        const tabs = [
            { id: 'free', name: '免费会员' },
            { id: 'city', name: '城市会员' },
            { id: 'province', name: '省级会员' },
            { id: 'country', name: '全国会员' }
        ];
        
        let tabsHtml = `<div style="display: flex; background: white; padding: 4px; border-radius: 10px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">`;
        tabs.forEach(t => {
            const isActive = t.id === currentTab;
            const activeStyle = isActive ? 'background: var(--primary-blue); color: white; font-weight: 600; box-shadow: 0 2px 4px rgba(0,0,0,0.1);' : 'color: #666;';
            tabsHtml += `<div onclick="switchVipCard('${t.id}')" style="flex: 1; text-align: center; padding: 8px 0; border-radius: 8px; font-size: 13px; transition: all 0.2s; cursor: pointer; ${activeStyle}">${t.name}</div>`;
        });
        tabsHtml += `</div>`;

        // --- VIP Card Content ---
        let cardContent = '';
        if (currentTab === 'free') {
            cardContent = `
                <div style="background: radial-gradient(circle at 18% 12%, rgba(255,255,255,0.2) 0, rgba(255,255,255,0) 34%), radial-gradient(circle at 84% 82%, rgba(0,229,255,0.2) 0, rgba(0,229,255,0) 44%), linear-gradient(135deg, #0F5FE9 0%, #007AFF 52%, #00B4FF 100%); color: white; padding: 24px; border-radius: 16px; position: relative; overflow: hidden; height: 180px; box-shadow: 0 10px 24px rgba(16,96,233,0.24);">
                    <div style="position: relative; z-index: 2; height: 100%; display: flex; flex-direction: column;">
                        <div style="font-size: 24px; font-weight: 800; margin-bottom: 8px;">免费会员</div>
                        <div style="font-size: 14px; opacity: 0.9; margin-bottom: 12px;">基础浏览权益</div>
                        
                        <div style="font-size: 13px; display: flex; flex-direction: column; gap: 4px; flex: 1; justify-content: center;">
                            <div style="display: flex; align-items: center;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="margin-right: 8px;"><polyline points="20 6 9 17 4 12"></polyline></svg>免费体验浏览10条任意招标信息</div>
                            <div style="display: flex; align-items: center;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="margin-right: 8px;"><polyline points="20 6 9 17 4 12"></polyline></svg>免费体验1个关键词订阅</div>
                        </div>
                    </div>
                    <div style="position: absolute; right: -20px; bottom: -30px; opacity: 0.1;">
                        <svg width="150" height="150" viewBox="0 0 24 24" fill="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                </div>
            `;
        } else if (currentTab === 'city') {
            cardContent = `
                <div style="background: linear-gradient(135deg, #2C5F2D, #1E3F1F); color: white; padding: 24px; border-radius: 16px; position: relative; overflow: hidden; height: 180px;">
                    <div style="position: relative; z-index: 2; height: 100%; display: flex; flex-direction: column;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div>
                                <div style="font-size: 24px; font-weight: 800; margin-bottom: 8px; display: flex; align-items: center;">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#C0C0C0" stroke="#808080" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path></svg>
                                    城市会员
                                </div>
                                <div style="font-size: 14px; opacity: 0.9; margin-bottom: 12px;">解锁单城商机</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 20px; font-weight: 700;">¥399</div>
                                <div style="font-size: 12px; opacity: 0.8;">/年</div>
                            </div>
                        </div>
                        
                        <div style="flex: 1; display: flex; align-items: center; justify-content: space-between;">
                            <div style="font-size: 13px; display: flex; flex-direction: column; gap: 4px;">
                                <div style="display: flex; align-items: center;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="margin-right: 8px;"><polyline points="20 6 9 17 4 12"></polyline></svg>本市无限浏览</div>
                                <div style="display: flex; align-items: center;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="margin-right: 8px;"><polyline points="20 6 9 17 4 12"></polyline></svg>跨市浏览 100 条</div>
                                <div style="display: flex; align-items: center;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="margin-right: 8px;"><polyline points="20 6 9 17 4 12"></polyline></svg>订阅 10 个关键词</div>
                            </div>
                            
                            <div style="display: flex; align-items: center;">
                                <div style="width: 2px; height: 40px; background: rgba(255,255,255,0.3); margin-right: 16px;"></div>
                                <button style="background: white; color: #2C5F2D; border: none; padding: 8px 20px; border-radius: 20px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 10px rgba(0,0,0,0.2);" onclick="buyMember('city', 399)">
                                    ${user.vipLevel === 'city' ? '立即续费' : '立即开通'}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div style="position: absolute; right: -20px; bottom: -30px; opacity: 0.15;">
                        <svg width="150" height="150" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21h18v-8H3v8zm6-11h12v-9H9v9zm12-10a1 1 0 0 1 1 1v19H2V11a1 1 0 0 1 1-1h5V2a1 1 0 0 1 1-1h13a1 1 0 0 1 1 1z"/></svg>
                    </div>
                </div>
            `;
        } else if (currentTab === 'province') {
            cardContent = `
                <div style="background: linear-gradient(135deg, #FFD700, #FDB931); color: #5D4037; padding: 24px; border-radius: 16px; position: relative; overflow: hidden; height: 180px;">
                    <div style="position: relative; z-index: 2; height: 100%; display: flex; flex-direction: column;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div>
                                <div style="font-size: 24px; font-weight: 800; margin-bottom: 8px; display: flex; align-items: center;">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFD700" stroke="#DAA520" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path></svg>
                                    省级会员
                                </div>
                                <div style="font-size: 14px; opacity: 0.9; margin-bottom: 12px;">统揽全省项目</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 20px; font-weight: 700;">¥999</div>
                                <div style="font-size: 12px; opacity: 0.8;">/年</div>
                            </div>
                        </div>
                        
                        <div style="flex: 1; display: flex; align-items: center; justify-content: space-between;">
                            <div style="font-size: 13px; display: flex; flex-direction: column; gap: 4px;">
                                <div style="display: flex; align-items: center;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="margin-right: 8px;"><polyline points="20 6 9 17 4 12"></polyline></svg>本省无限浏览</div>
                                <div style="display: flex; align-items: center;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="margin-right: 8px;"><polyline points="20 6 9 17 4 12"></polyline></svg>跨省浏览 500 条</div>
                                <div style="display: flex; align-items: center;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="margin-right: 8px;"><polyline points="20 6 9 17 4 12"></polyline></svg>订阅 50 个关键词</div>
                            </div>
                            
                            <div style="display: flex; align-items: center;">
                                <div style="width: 2px; height: 40px; background: rgba(93, 64, 55, 0.2); margin-right: 16px;"></div>
                                <button style="background: white; color: #5D4037; border: none; padding: 8px 20px; border-radius: 20px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);" onclick="buyMember('province', 999)">
                                    ${user.vipLevel === 'province' ? '立即续费' : '立即开通'}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div style="position: absolute; right: -20px; bottom: -30px; opacity: 0.2;">
                        <svg width="150" height="150" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>
                    </div>
                </div>
            `;
        } else if (currentTab === 'country') {
            cardContent = `
                <div style="background: linear-gradient(135deg, #1C1C1E, #2C2C2E); color: #FFD700; padding: 24px; border-radius: 16px; position: relative; overflow: hidden; height: 180px; border: 1px solid #333;">
                    <div style="position: relative; z-index: 2; height: 100%; display: flex; flex-direction: column;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div>
                                <div style="font-size: 24px; font-weight: 800; margin-bottom: 8px; display: flex; align-items: center;">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#333" stroke="#FFD700" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path></svg>
                                    全国会员
                                </div>
                                <div style="font-size: 14px; opacity: 0.9; margin-bottom: 12px;">全国商机尽在掌握</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 20px; font-weight: 700;">¥2999</div>
                                <div style="font-size: 12px; opacity: 0.8;">/年</div>
                            </div>
                        </div>
                        
                        <div style="flex: 1; display: flex; align-items: center; justify-content: space-between;">
                            <div style="font-size: 13px; display: flex; flex-direction: column; gap: 4px;">
                                <div style="display: flex; align-items: center;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="margin-right: 8px;"><polyline points="20 6 9 17 4 12"></polyline></svg>全国无限浏览</div>
                                <div style="display: flex; align-items: center;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="margin-right: 8px;"><polyline points="20 6 9 17 4 12"></polyline></svg>订阅 200 个关键词</div>
                                <div style="display: flex; align-items: center;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="margin-right: 8px;"><polyline points="20 6 9 17 4 12"></polyline></svg>专属客服服务</div>
                            </div>
                            
                            <div style="display: flex; align-items: center;">
                                <div style="width: 2px; height: 40px; background: rgba(255, 215, 0, 0.3); margin-right: 16px;"></div>
                                <button style="background: linear-gradient(90deg, #FFD700, #FDB931); color: #1C1C1E; border: none; padding: 8px 20px; border-radius: 20px; font-weight: 800; font-size: 14px; box-shadow: 0 4px 10px rgba(255, 215, 0, 0.3);" onclick="buyMember('country', 2999)">
                                    ${user.vipLevel === 'country' ? '立即续费' : '立即开通'}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div style="position: absolute; right: -20px; bottom: -30px; opacity: 0.1;">
                        <svg width="150" height="150" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"></circle><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                    </div>
                </div>
            `;
        }

        return `
            <div class="member-root" style="padding: 0; width: 100%; position: relative;">
                ${this.renderMemberHeader()}
                ${userCardHtml}
                
                <div style="padding: 16px; margin-top: ${memberContentMarginTop}; position: relative; z-index: 10; background: #F2F2F7; border-top-left-radius: 20px; border-top-right-radius: 20px; min-height: 500px;">
                    <!-- 会员套餐 Tabs -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding: 8px 4px 0 4px;">
                         <div style="font-size: 18px; font-weight: 700; color: #333; display: flex; align-items: center;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; color: #FF9500;"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                            会员权益
                         </div>
                    </div>
                    ${tabsHtml}
                    
                    <!-- 卡片内容 -->
                    <div style="margin-bottom: 24px;">
                        ${cardContent}
                    </div>
                    
                    <!-- 激活码区域 -->
                    <div style="background-color: white; padding: 16px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                        <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px; display: flex; align-items: center;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; color: #34C759;"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>
                            会员激活
                        </div>
                        <div class="activation-box">
                            <input type="text" class="activation-input" placeholder="请输入激活码 (如 VIPALL)" id="activation-code">
                            <button class="activation-btn" style="background:var(--primary-blue); color:white; border:none; padding:8px 16px; border-radius:8px; margin-left:8px;" onclick="activateMember()">激活</button>
                        </div>
                    </div>
                    
                    <!-- 推广赚钱 -->
                    <div style="background-color: white; padding: 16px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <div style="font-size: 16px; font-weight: 600; display: flex; align-items: center;">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; color: #FF3B30;"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                                推广赚钱
                            </div>
                            <div style="font-size: 13px; color: var(--tag-orange-text);">已赚 ¥${user.balance.toFixed(2)}</div>
                        </div>
                        <div style="display: flex; justify-content: space-around;">
                            <div style="display: flex; flex-direction: column; align-items: center; gap: 6px;" onclick="alert('邀请链接已复制')">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#007AFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                <span style="font-size: 12px;">邀请好友</span>
                            </div>
                            <div style="display: flex; flex-direction: column; align-items: center; gap: 6px;" onclick="alert('提现功能开发中')">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34C759" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                                <span style="font-size: 12px;">申请提现</span>
                            </div>
                            <div style="display: flex; flex-direction: column; align-items: center; gap: 6px;" onclick="alert('暂无记录')">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#AF52DE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                <span style="font-size: 12px;">提现记录</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => App.init());
