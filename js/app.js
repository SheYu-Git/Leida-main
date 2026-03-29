/**
 * Simple Vanilla JS Framework for BiddingRadar Preview
 */

const DEFAULT_API_BASE = 'https://zhaobiao.agecms.com';
const NATIVE_FALLBACK_API_BASE = 'https://zhaobiao.agecms.com';

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
            userId: 0,
            username: '',
            role: 'user',
            avatar: '',
            vipLevel: 'free', // free, city, province, country
            vipScopeValue: '', // City name or Province name
            vipExpire: null,
            vipExpireRaw: '',
            balance: 0,
            viewUsage: 0, // Cumulative usage for limited actions
            viewHistory: [], // Store IDs of viewed items to prevent double counting if needed (optional, but good for "viewed" status)
            companyName: '',
            realName: '',
            positionTitle: '',
            phone: '',
            email: '',
            wechatId: '',
            profileCompletion: null,
            profileRewardConfig: null,
            profileRewardGrantedAt: '',
            inviteCode: '',
            invitedCount: 0,
            inviteRewardTotal: 0,
            referralRecords: [],
            iapReferenceUuid: '',
            trialUsage: { city: false, province: false, country: false }
        },
        memberPlans: [],
        memberPayDraft: null,
        memberPurchasePlan: 'city',
        memberPurchaseMethod: 'wechat',
        appleIapPriceMap: {},
        runtimeConfig: {},
        adminDrawerOpen: false,
        adminPanelOpen: false,
        adminPanelType: '',
        adminAuditRows: [],
        adminMemberRows: [],
        adminMemberPage: 1,
        adminMemberTotal: 0,
        adminMemberPageSize: 20,
        adminMemberFilterKeyword: '',
        adminOrderRows: [],
        adminOrderPage: 1,
        adminOrderTotal: 0,
        adminOrderPageSize: 20,
        adminOrderFilterKeyword: '',
        adminOrderFilterStatus: '',
        adminOrderFilterUserId: '',
        adminOrderFilterStartDate: '',
        adminOrderFilterEndDate: '',
        adminOrderSelectedIds: [],
        adminCodeRows: [],
        adminCodePage: 1,
        adminCodeTotal: 0,
        adminCodePageSize: 30,
        adminCodeFilterKeyword: '',
        adminCodeFilterPlan: '',
        adminCodeFilterActive: '',
        adminCodeSelected: [],
        adminRewardRows: [],
        adminRewardPage: 1,
        adminRewardTotal: 0,
        adminRewardPageSize: 30,
        adminRewardFilterStatus: '',
        adminRewardSummary: null,
        adminAuthRows: [],
        adminInfoRows: [],
        adminInfoPage: 1,
        adminInfoTotal: 0,
        adminInfoPageSize: 20,
        adminInfoYesterday: null,
        adminInfoTotalSummary: null,
        adminDbHealth: {
            status: 'unknown',
            text: '未检测',
            hint: '',
            checkedAt: 0
        },
        adminSyncAlert: {
            active: false,
            text: '',
            meta: '',
            checkedAt: 0
        },
        adminPublishMode: 'online',
        adminPublishHint: '',
        vipExpireRecovering: false,
        
        // Carousel State
        bannerIndex: 0,
        bannerSlidesCount: 2,
        bannerTimer: null,
        runtimeNoticeVisible: false,
        homeStatsText: '',
        homeStatsAt: 0,
        homeStatsLoading: false,
        subLastScopeType: 'city',
        subLastScopeValue: '',
        pendingSubDialogOpen: false,
        backendSyncActionAt: 0,
        backendSyncSuccessAt: 0,
        backendLatestDataAt: 0,
        backendSyncAlertActive: false,
        backendSyncAlertReason: '',
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
        homeCacheApplied: false,
        startupRetryCount: 0,
        startupRetryTimer: null,
        locationAutoInFlight: false,
        locationAutoDone: false,
        locationPrompting: false,
        locationAutoRetryCount: 0,
        subPushTimer: null,
        subPushInFlight: false,
        subDetailLatestReadAtById: {},
        lastDataContextKey: '',
        yStatsCtxKey: '',
        yStatsComputedAt: 0,
        yStatsComputing: false,
        timeEnrichCtxKey: '',
        timeEnrichAt: 0,
        timeEnriching: false,
        detailCurrentItem: null
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

    normalizeVipExpireText(raw) {
        if (raw == null || raw === '') return '';
        const minMs = Date.UTC(2000, 0, 1, 0, 0, 0, 0);
        const maxMs = Date.UTC(2100, 0, 1, 0, 0, 0, 0);
        if (typeof raw === 'string') {
            const s = raw.trim();
            if (!s) return '';
            if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
                const t = Date.parse(`${s}T00:00:00.000Z`);
                if (!Number.isFinite(t) || t < minMs || t > maxMs) return '';
                return s;
            }
        }
        let n = NaN;
        if (raw instanceof Date) n = raw.getTime();
        else if (typeof raw === 'number') n = raw;
        else {
            const s = String(raw || '').trim();
            if (/^\d+$/.test(s)) n = Number(s);
            else n = Date.parse(s);
        }
        if (!Number.isFinite(n) || n <= 0) return '';
        if (n < 1e12) n *= 1000;
        n = Math.floor(n);
        if (n < minMs || n > maxMs) return '';
        return new Date(n).toISOString().slice(0, 10);
    },

    getUserStorageKey(userLike = null) {
        const u = userLike || this.state.user || {};
        const id = Number(u.userId || u.id || 0);
        if (id > 0) return `uid:${id}`;
        const name = String(u.username || '').trim().toLowerCase();
        if (name) return `uname:${name}`;
        return 'guest';
    },

    getSubStorageUserKey() {
        return this.getUserStorageKey(this.state.user || {});
    },

    // --- Native System UI ---
    useNativeSystemUI() {
        const mockSystemEls = document.querySelectorAll('.status-bar, .notch, .home-indicator');
        mockSystemEls.forEach(el => el.remove());
    },

    applyCjkFontFallback() {
        const stack = '"PingFang SC","PingFang TC","Heiti SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans CJK SC",-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif';
        const id = 'br-force-cjk-font';
        const prev = document.getElementById(id);
        if (prev) prev.remove();
        const style = document.createElement('style');
        style.id = id;
        style.textContent = `html,body,*{font-family:${stack} !important;} input,textarea,button,select{font-family:${stack} !important;}`;
        document.head.appendChild(style);
        try {
            document.documentElement.style.fontFamily = stack;
            document.body.style.fontFamily = stack;
        } catch (e) {}
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
        this.migrateLocalCaches();
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
                window.SubManager.setAuth(this.getApiBase(), this.getAuthToken(), this.getSubStorageUserKey());
            }
        } catch (e) {}
        this.loadRuntimeConfig();
        if (this.getAuthToken()) {
            this.syncMemberFromServer();
        }

        if (this.isNativeAppRuntime()) {
            document.body.classList.add('native-app');
        }
        this.applyCjkFontFallback();
        
        // Remove mock status bar/notch/home-indicator and use native system UI
        this.useNativeSystemUI();
        
        // Initial Tab State (Home)
        this.state.currentTab = 0;

        // Initial Home Layout
        this.switchTab(0);

        const cachedRows = this.loadCachedHomeList();
        if (Array.isArray(cachedRows) && cachedRows.length > 0 && this.isHomeCacheToday(cachedRows)) {
            this.state.data = this.filterRowsToRecentDays(cachedRows);
            this.state.homeCacheApplied = true;
            this.renderList();
        }

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
        window.toggleDetailFavorite = this.toggleDetailFavorite.bind(this);
        window.filterCity = this.filterCity.bind(this);
        window.toggleProvince = this.toggleProvince.bind(this);
        window.login = this.login.bind(this);
        window.openLoginModal = this.openLoginModal.bind(this);
        window.closeLoginModal = this.closeLoginModal.bind(this);
        window.switchAuthMode = this.switchAuthMode.bind(this);
        window.handleAuth = this.handleAuth.bind(this);
        window.handleFaceLogin = this.handleFaceLogin.bind(this);
        window.logout = this.logout.bind(this);
        window.activateMember = this.activateMember.bind(this);
        window.buyMember = this.buyMember.bind(this);
        window.openMemberPayDialog = this.openMemberPayDialog.bind(this);
        window.selectMemberPurchasePlan = this.selectMemberPurchasePlan.bind(this);
        window.selectMemberPurchaseMethod = this.selectMemberPurchaseMethod.bind(this);
        window.submitMemberPurchase = this.submitMemberPurchase.bind(this);
        window.closeMemberPayDialog = this.closeMemberPayDialog.bind(this);
        window.selectMemberPayMethod = this.selectMemberPayMethod.bind(this);
        window.submitMemberTransferPaid = this.submitMemberTransferPaid.bind(this);
        window.copyMemberTransferInfo = this.copyMemberTransferInfo.bind(this);
        window.shareInviteLink = this.shareInviteLink.bind(this);
        window.openReferralRecords = this.openReferralRecords.bind(this);
        window.openAdminDrawer = this.openAdminDrawer.bind(this);
        window.closeAdminDrawer = this.closeAdminDrawer.bind(this);
        window.handleAdminMenu = this.handleAdminMenu.bind(this);
        window.closeAdminPanel = this.closeAdminPanel.bind(this);
        window.saveAdminPanel = this.saveAdminPanel.bind(this);
        window.refreshAdminAudit = this.refreshAdminAudit.bind(this);
        window.refreshAdminDbHealth = this.refreshAdminDbHealth.bind(this);
        window.refreshAdminMembers = this.refreshAdminMembers.bind(this);
        window.refreshAdminOrders = this.refreshAdminOrders.bind(this);
        window.refreshAdminRewards = this.refreshAdminRewards.bind(this);
        window.refreshAdminInfo = this.refreshAdminInfo.bind(this);
        window.loadMoreAdminInfo = this.loadMoreAdminInfo.bind(this);
        window.refreshAdminActivationCodes = this.refreshAdminActivationCodes.bind(this);
        window.nextAdminMembersPage = this.nextAdminMembersPage.bind(this);
        window.prevAdminMembersPage = this.prevAdminMembersPage.bind(this);
        window.nextAdminOrdersPage = this.nextAdminOrdersPage.bind(this);
        window.prevAdminOrdersPage = this.prevAdminOrdersPage.bind(this);
        window.nextAdminCodesPage = this.nextAdminCodesPage.bind(this);
        window.prevAdminCodesPage = this.prevAdminCodesPage.bind(this);
        window.nextAdminRewardsPage = this.nextAdminRewardsPage.bind(this);
        window.prevAdminRewardsPage = this.prevAdminRewardsPage.bind(this);
        window.exportAdminOrdersCsv = this.exportAdminOrdersCsv.bind(this);
        window.exportAdminCodesCsv = this.exportAdminCodesCsv.bind(this);
        window.exportAdminRewardsCsv = this.exportAdminRewardsCsv.bind(this);
        window.batchUpdateAdminOrders = this.batchUpdateAdminOrders.bind(this);
        window.batchToggleAdminCodes = this.batchToggleAdminCodes.bind(this);
        window.toggleAdminOrderSelect = this.toggleAdminOrderSelect.bind(this);
        window.toggleAdminCodeSelect = this.toggleAdminCodeSelect.bind(this);
        window.updateAdminOrderStatus = this.updateAdminOrderStatus.bind(this);
        window.toggleAdminActivationCode = this.toggleAdminActivationCode.bind(this);
        window.batchCreateActivationCodes = this.batchCreateActivationCodes.bind(this);
        window.grantMemberVip = this.grantMemberVip.bind(this);
        window.resetAdminMemberPassword = this.resetAdminMemberPassword.bind(this);
        window.deleteAdminMember = this.deleteAdminMember.bind(this);
        window.grantAdminRole = this.grantAdminRole.bind(this);
        window.closeRuntimeNotice = this.closeRuntimeNotice.bind(this);
        window.switchBanner = this.switchBanner.bind(this);
        window.openMemberSettings = this.openMemberSettings.bind(this);
        window.closeMemberSettings = this.closeMemberSettings.bind(this);
        window.openChangePasswordModal = this.openChangePasswordModal.bind(this);
        window.closeChangePasswordModal = this.closeChangePasswordModal.bind(this);
        window.submitChangePassword = this.submitChangePassword.bind(this);
        window.openProfileRewardModal = this.openProfileRewardModal.bind(this);
        window.closeProfileRewardModal = this.closeProfileRewardModal.bind(this);
        window.submitProfileReward = this.submitProfileReward.bind(this);
        window.openMyFavorites = this.openMyFavorites.bind(this);
        window.closeMyFavorites = this.closeMyFavorites.bind(this);
        window.openMyOrders = this.openMyOrders.bind(this);
        window.closeMyOrders = this.closeMyOrders.bind(this);
        window.handleMemberSettingsLogout = this.handleMemberSettingsLogout.bind(this);
        window.toggleFaceLoginSetting = this.toggleFaceLoginSetting.bind(this);
        window.forceEnableNotify = this.forceEnableNotify.bind(this);
        window.openNotifyQuietSettings = this.openNotifyQuietSettings.bind(this);
        window.closeNotifyQuietSettings = this.closeNotifyQuietSettings.bind(this);
        window.saveNotifyQuietSettings = this.saveNotifyQuietSettings.bind(this);
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
        this.promptLocationOnFirstLaunch();
        
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
        const p = window.Capacitor && window.Capacitor.Plugins ? window.Capacitor.Plugins : {};
        const custom = p.LocalNotifyPlugin;
        const official = p.LocalNotifications;
        return !!((custom && typeof custom.notify === 'function') || (official && typeof official.schedule === 'function'));
    },

    getLocalNotifyAdapter() {
        const p = window.Capacitor && window.Capacitor.Plugins ? window.Capacitor.Plugins : {};
        const custom = p.LocalNotifyPlugin;
        if (custom && typeof custom.notify === 'function') return { kind: 'custom', plugin: custom };
        const official = p.LocalNotifications;
        if (official && typeof official.schedule === 'function') return { kind: 'official', plugin: official };
        return { kind: 'none', plugin: null };
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
                    this.openSystemNotifySettings();
                    alert('未开启通知。请到：设置 → 通知 → 商机雷达 开启“允许通知”。');
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
        const { kind, plugin } = this.getLocalNotifyAdapter();
        try {
            if (kind === 'custom' && plugin && typeof plugin.requestPermission === 'function') {
                const ret = await plugin.requestPermission();
                return !!(ret && ret.granted);
            }
            if (kind === 'official' && plugin && typeof plugin.requestPermissions === 'function') {
                const ret = await plugin.requestPermissions();
                return String((ret && ret.display) || '').toLowerCase() === 'granted';
            }
            return false;
        } catch (e) {
            return false;
        }
    },

    async promptLocalNotifyPermission(message = '') {
        if (!this.hasLocalNotifyPlugin()) {
            await this.waitForLocalNotifyReady(2500);
        }
        if (!this.hasLocalNotifyPlugin()) return { granted: false, status: 'unavailable' };
        const { kind, plugin } = this.getLocalNotifyAdapter();
        if (kind === 'custom' && plugin && typeof plugin.prompt === 'function') {
            try {
                const ret = await plugin.prompt({
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
        if (kind === 'custom' && plugin && typeof plugin.requestPermission === 'function') {
            try {
                const ret = await plugin.requestPermission();
                const granted = !!(ret && ret.granted);
                if (granted) this.safeStorageSet('br_notify_granted', '1');
                return { granted, status: (ret && ret.status) || (granted ? 'authorized' : 'denied') };
            } catch (e) {
                return { granted: false, status: 'error' };
            }
        }
        if (kind === 'official' && plugin && typeof plugin.requestPermissions === 'function') {
            try {
                const ret = await plugin.requestPermissions();
                const granted = String((ret && ret.display) || '').toLowerCase() === 'granted';
                if (granted) this.safeStorageSet('br_notify_granted', '1');
                return { granted, status: granted ? 'authorized' : 'denied' };
            } catch (e) {
                return { granted: false, status: 'error' };
            }
        }
        return { granted: false, status: 'unavailable' };
    },

    getNotifyQuietConfig() {
        const fallback = { enabled: true, start: '21:00', end: '08:00' };
        try {
            const raw = this.safeStorageGet('br_notify_quiet_cfg');
            if (!raw) return fallback;
            const parsed = JSON.parse(String(raw || '{}'));
            const start = typeof parsed.start === 'string' && /^\d{2}:\d{2}$/.test(parsed.start) ? parsed.start : fallback.start;
            const end = typeof parsed.end === 'string' && /^\d{2}:\d{2}$/.test(parsed.end) ? parsed.end : fallback.end;
            const enabled = parsed.enabled !== false;
            return { enabled, start, end };
        } catch (e) {
            return fallback;
        }
    },

    setNotifyQuietConfig(cfg = {}) {
        const cur = this.getNotifyQuietConfig();
        const next = {
            enabled: cfg.enabled !== false,
            start: typeof cfg.start === 'string' && /^\d{2}:\d{2}$/.test(cfg.start) ? cfg.start : cur.start,
            end: typeof cfg.end === 'string' && /^\d{2}:\d{2}$/.test(cfg.end) ? cfg.end : cur.end
        };
        this.safeStorageSet('br_notify_quiet_cfg', JSON.stringify(next));
        return next;
    },

    clockToMinute(text = '') {
        const m = String(text || '').match(/^(\d{2}):(\d{2})$/);
        if (!m) return -1;
        const hh = Number(m[1]);
        const mm = Number(m[2]);
        if (!Number.isFinite(hh) || !Number.isFinite(mm) || hh < 0 || hh > 23 || mm < 0 || mm > 59) return -1;
        return hh * 60 + mm;
    },

    isNotifyQuietNow(nowMs = Date.now()) {
        const cfg = this.getNotifyQuietConfig();
        if (!cfg.enabled) return false;
        const start = this.clockToMinute(cfg.start);
        const end = this.clockToMinute(cfg.end);
        if (start < 0 || end < 0) return false;
        const now = new Date(nowMs);
        const cur = now.getHours() * 60 + now.getMinutes();
        if (start === end) return true;
        if (start < end) return cur >= start && cur < end;
        return cur >= start || cur < end;
    },

    openNotifyQuietSettings() {
        const oldModal = document.getElementById('notify-quiet-modal');
        const oldMask = document.getElementById('notify-quiet-mask');
        if (oldModal) oldModal.remove();
        if (oldMask) oldMask.remove();
        const cfg = this.getNotifyQuietConfig();
        const html = `
            <div id="notify-quiet-mask" class="city-modal-mask" onclick="closeNotifyQuietSettings()" style="display:block;z-index:9998;"></div>
            <div id="notify-quiet-modal" class="city-modal" style="display:flex;z-index:9999;">
                <div class="city-header" style="position:relative;">
                    <span class="nav-title" style="position:absolute;left:50%;transform:translateX(-50%);">免打扰设置</span>
                    <span class="nav-right" onclick="closeNotifyQuietSettings()" style="position:static;margin-left:auto;">✕</span>
                </div>
                <div class="list-container" style="padding:16px 16px 28px 16px;">
                    <label style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
                        <span style="font-size:14px;color:#1C1C1E;">启用免打扰</span>
                        <input id="notify-quiet-enabled" type="checkbox" ${cfg.enabled ? 'checked' : ''} />
                    </label>
                    <div style="display:flex;gap:10px;align-items:center;margin-bottom:18px;">
                        <div style="flex:1;">
                            <div style="font-size:12px;color:#8E8E93;margin-bottom:6px;">开始时间</div>
                            <input id="notify-quiet-start" type="time" value="${cfg.start}" style="width:100%;height:40px;border:1px solid #E5E5EA;border-radius:8px;padding:0 10px;" />
                        </div>
                        <div style="flex:1;">
                            <div style="font-size:12px;color:#8E8E93;margin-bottom:6px;">结束时间</div>
                            <input id="notify-quiet-end" type="time" value="${cfg.end}" style="width:100%;height:40px;border:1px solid #E5E5EA;border-radius:8px;padding:0 10px;" />
                        </div>
                    </div>
                    <div style="font-size:12px;color:#8E8E93;line-height:1.5;margin-bottom:18px;">默认推荐 21:00 - 08:00。处于该时段将不发送订阅通知。</div>
                    <button onclick="saveNotifyQuietSettings()" style="width:100%;height:42px;border:none;border-radius:10px;background:#007AFF;color:#fff;font-size:15px;font-weight:600;">保存设置</button>
                </div>
            </div>
        `;
        const container = document.querySelector('.iphone-frame') || document.body;
        container.insertAdjacentHTML('beforeend', html);
    },

    closeNotifyQuietSettings() {
        const modal = document.getElementById('notify-quiet-modal');
        const mask = document.getElementById('notify-quiet-mask');
        if (modal) modal.remove();
        if (mask) mask.remove();
        if (this.state.currentTab === 1) this.renderSubscriptionList();
    },

    saveNotifyQuietSettings() {
        const enabledEl = document.getElementById('notify-quiet-enabled');
        const startEl = document.getElementById('notify-quiet-start');
        const endEl = document.getElementById('notify-quiet-end');
        const enabled = !!(enabledEl && enabledEl.checked);
        const start = String((startEl && startEl.value) || '').trim();
        const end = String((endEl && endEl.value) || '').trim();
        if (!/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(end)) {
            this.showToast('时间格式不正确');
            return;
        }
        this.setNotifyQuietConfig({ enabled, start, end });
        this.showToast('免打扰设置已保存');
        this.closeNotifyQuietSettings();
    },

    async openSystemNotifySettings() {
        try {
            const p = window.Capacitor && window.Capacitor.Plugins ? window.Capacitor.Plugins.LocalNotifyPlugin : null;
            if (p && typeof p.openSettings === 'function') {
                const ret = await p.openSettings();
                if (ret && ret.opened) return true;
            }
        } catch (e) {}
        try {
            const app = window.Capacitor && window.Capacitor.Plugins ? window.Capacitor.Plugins.App : null;
            if (app && typeof app.openSettings === 'function') {
                await app.openSettings();
                return true;
            }
        } catch (e) {}
        try {
            window.open('app-settings:');
            return true;
        } catch (e) {}
        return false;
    },

    async forceEnableNotify() {
        if (!this.isNativeAppRuntime()) {
            this.showToast('仅App内可用');
            return;
        }
        const ret = await this.promptLocalNotifyPermission('请开启系统通知，开启后可收到订阅更新提醒。');
        if (ret && ret.granted) {
            this.safeStorageSet('br_notify_granted', '1');
            this.showToast('通知已开启');
            const testId = `notify_force_${Date.now()}`;
            await this.sendLocalNotify('通知已开启', '你将收到订阅更新提醒', testId, { ignoreQuietHours: true });
            return;
        }
        await this.openSystemNotifySettings();
        this.showToast('请在系统设置中开启通知');
    },
    async sendLocalNotify(title, body, id, options = {}) {
        if (!options.ignoreQuietHours && this.isNotifyQuietNow()) return false;
        if (!this.hasLocalNotifyPlugin()) return false;
        const { kind, plugin } = this.getLocalNotifyAdapter();
        try {
            if (kind === 'custom' && plugin && typeof plugin.notify === 'function') {
                const ret = await plugin.notify({
                    title: String(title || '商机雷达'),
                    body: String(body || ''),
                    id: String(id || '')
                });
                return !!(ret && ret.scheduled);
            }
            if (kind === 'official' && plugin && typeof plugin.schedule === 'function') {
                const numId = Math.abs(Number(String(id || Date.now()).replace(/\D/g, '').slice(-9))) || (Date.now() % 1000000000);
                await plugin.schedule({
                    notifications: [{
                        id: numId,
                        title: String(title || '商机雷达'),
                        body: String(body || ''),
                        schedule: { at: new Date(Date.now() + 1000) }
                    }]
                });
                return true;
            }
            return false;
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

    promptLocationOnFirstLaunch() {
        if (!this.isNativeAppRuntime()) return;
        if (this.state.locationPrompting) return;
        const flagged = (this.safeStorageGet('br_location_prompted') || '').trim();
        if (flagged === '1') return;
        const saved = this.normalizeCityName(this.safeStorageGet('br_default_city'));
        if (saved && this.isKnownCity(saved)) {
            this.safeStorageSet('br_location_prompted', '1');
            return;
        }
        this.state.locationPrompting = true;
        const tryShow = (attempt = 0) => {
            if (document.hidden) {
                if (attempt < 10) setTimeout(() => tryShow(attempt + 1), 800);
                else this.state.locationPrompting = false;
                return;
            }
            if (this.state.currentTab !== 0) {
                if (attempt < 6) setTimeout(() => tryShow(attempt + 1), 800);
                else this.state.locationPrompting = false;
                return;
            }
            if (this.state.currentCity && this.state.currentCity !== '全国') {
                this.safeStorageSet('br_location_prompted', '1');
                this.state.locationPrompting = false;
                return;
            }
            this.startAutoDetectCity({ markPrompted: true });
            this.state.locationPrompting = false;
        };
        setTimeout(() => tryShow(0), 1800);
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
        const grantedFlag = (this.safeStorageGet('br_notify_granted') || '').trim();
        if (grantedFlag !== '1') {
            const granted = await this.requestLocalNotifyPermission();
            if (!granted) return;
            this.safeStorageSet('br_notify_granted', '1');
        }
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
                    count = items.filter(item => this.isSubItemUnread(sub, item)).length;
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
    getBannerSlides() {
        const cfg = (this.state.runtimeConfig && this.state.runtimeConfig['copy.banner']) || {};
        const slides = Array.isArray(cfg.slides) ? cfg.slides : [];
        const cleaned = slides
            .map((x) => ({
                title: String((x && x.title) || '').trim(),
                subtitle: String((x && x.subtitle) || '').trim(),
            }))
            .map((x) => ({
                title: x.title === '商机雷达' ? '商机雷达' : x.title,
                subtitle: x.subtitle,
            }))
            .filter((x) => x.title || x.subtitle);
        if (cleaned.length) return cleaned;
        return [
            { title: '商机雷达', subtitle: 'AI数字员工24小时为您寻找商机！' },
            { title: '精准商机订阅', subtitle: '关键词+地区，实时推送不漏标' },
        ];
    },

    renderRuntimeBanner() {
        const slides = this.getBannerSlides();
        this.state.bannerSlidesCount = slides.length || 1;
        if (this.state.bannerIndex >= this.state.bannerSlidesCount) this.state.bannerIndex = 0;
        const track = document.getElementById('carousel-track');
        if (track) {
            track.style.width = `${this.state.bannerSlidesCount * 100}%`;
            track.innerHTML = slides.map((s) => `
                <div class="carousel-slide">
                    <div class="banner-title">${s.title || ''}</div>
                    <div class="banner-subtitle">${s.subtitle || ''}</div>
                </div>
            `).join('');
        }
        const indicatorsHost = document.querySelector('.carousel-indicators');
        if (indicatorsHost) {
            indicatorsHost.innerHTML = slides.map((_, idx) => `<div class="indicator ${idx === this.state.bannerIndex ? 'active' : ''}" onclick="switchBanner(${idx})"></div>`).join('');
        }
        this.switchBanner(this.state.bannerIndex);
    },
    
    startCarousel() {
        if (this.state.bannerTimer) clearInterval(this.state.bannerTimer);
        if ((this.state.bannerSlidesCount || 0) <= 1) return;
        this.state.bannerTimer = setInterval(() => {
            if (document.hidden) return;
            if (this.state.currentTab !== 0) return;
            const nextIndex = (this.state.bannerIndex + 1) % Math.max(1, Number(this.state.bannerSlidesCount || 1));
            this.switchBanner(nextIndex);
        }, 5000);
    },
    
    switchBanner(index) {
        const count = Math.max(1, Number(this.state.bannerSlidesCount || 1));
        this.state.bannerIndex = Math.max(0, Math.min(Number(index || 0), count - 1));
        
        // Update Track Transform
        const track = document.getElementById('carousel-track');
        if (track) {
            track.style.transform = `translateX(-${this.state.bannerIndex * (100 / count)}%)`;
        }
        
        // Update Indicators
        const indicators = document.querySelectorAll('.indicator');
        indicators.forEach((ind, i) => {
            if (i === this.state.bannerIndex) ind.classList.add('active');
            else ind.classList.remove('active');
        });
        
        // Update Background Image
        const bg = document.querySelector('.custom-header-bg');
        if (bg) {
            if (this.state.bannerIndex % 2 === 0) {
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
        if (count <= 1) return;
        this.state.bannerTimer = setInterval(() => {
            if (document.hidden) return;
            if (this.state.currentTab !== 0) return;
            const nextIndex = (this.state.bannerIndex + 1) % count;
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

    getHomeListCacheKey() {
        return 'br_home_list_cache_v1';
    },

    loadCachedHomeList() {
        try {
            const raw = localStorage.getItem(this.getHomeListCacheKey());
            if (!raw) return [];
            const obj = JSON.parse(raw);
            const rows = Array.isArray(obj && obj.rows) ? obj.rows : [];
            if (!rows.length) return [];
            const ts = Number((obj && obj.cachedAt) || 0);
            if (!ts || Date.now() - ts > 10 * 60 * 1000) return [];
            return rows.slice(0, 80);
        } catch (e) {
            return [];
        }
    },

    getCstDayKey(ms = Date.now()) {
        const d = new Date(Number(ms || 0) + 8 * 60 * 60 * 1000);
        const y = d.getUTCFullYear();
        const m = String(d.getUTCMonth() + 1).padStart(2, '0');
        const day = String(d.getUTCDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    },

    isHomeCacheToday(rows = []) {
        if (!Array.isArray(rows) || !rows.length) return false;
        let latest = 0;
        for (const item of rows) {
            const ts = this.getItemTimeMs(item);
            if (ts > latest) latest = ts;
        }
        if (!latest) return false;
        return this.getCstDayKey(latest) === this.getCstDayKey(Date.now());
    },

    saveCachedHomeList(rows = []) {
        try {
            const list = Array.isArray(rows) ? rows.slice(0, 120) : [];
            if (!list.length) return;
            localStorage.setItem(this.getHomeListCacheKey(), JSON.stringify({ cachedAt: Date.now(), rows: list }));
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

    getDetailCacheKey(id) {
        return `br_detail_cache_v1_${String(id || '').trim()}`;
    },

    getDetailCacheIndexKey() {
        return 'br_detail_cache_index_v1';
    },

    migrateLocalCaches() {
        try {
            const schemaKey = 'br_cache_schema_v2';
            const current = Number(localStorage.getItem(schemaKey) || '0');
            if (current >= 2) return;
            const removeKeys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i) || '';
                if (k.startsWith('br_detail_cache_v1_') || k === this.getDetailCacheIndexKey()) removeKeys.push(k);
            }
            removeKeys.forEach(k => {
                try { localStorage.removeItem(k); } catch (e) {}
            });
            localStorage.setItem(schemaKey, '2');
        } catch (e) {}
    },

    getCachedDetail(id) {
        const key = this.getDetailCacheKey(id);
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return null;
            const obj = JSON.parse(raw);
            if (!obj || typeof obj.html !== 'string') return null;
            return obj;
        } catch (e) {
            return null;
        }
    },

    setCachedDetail(id, html, originalUrl) {
        const itemId = String(id || '').trim();
        if (!itemId) return;
        const safeHtml = String(html || '');
        if (!safeHtml.trim()) return;
        if (safeHtml.length > 220000) return;
        const key = this.getDetailCacheKey(itemId);
        const indexKey = this.getDetailCacheIndexKey();
        try {
            localStorage.setItem(key, JSON.stringify({ id: itemId, cachedAt: Date.now(), html: safeHtml, originalUrl: String(originalUrl || '') }));
        } catch (e) {
            return;
        }
        try {
            let ids = [];
            try { ids = JSON.parse(localStorage.getItem(indexKey) || '[]'); } catch (e) { ids = []; }
            if (!Array.isArray(ids)) ids = [];
            ids = ids.filter(x => String(x) !== itemId);
            ids.unshift(itemId);
            const max = 60;
            const overflow = ids.slice(max);
            ids = ids.slice(0, max);
            localStorage.setItem(indexKey, JSON.stringify(ids));
            overflow.forEach(x => {
                try { localStorage.removeItem(this.getDetailCacheKey(x)); } catch (e) {}
            });
        } catch (e) {}
    },

    getPurchaserCacheKey(id) {
        return `br_purchaser_cache_v1_${String(id || '').trim()}`;
    },

    getPurchaserCacheIndexKey() {
        return 'br_purchaser_cache_index_v1';
    },

    getCachedPurchaser(id) {
        const key = this.getPurchaserCacheKey(id);
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return '';
            const obj = JSON.parse(raw);
            if (!obj || typeof obj.name !== 'string') return '';
            return String(obj.name || '').trim();
        } catch (e) {
            return '';
        }
    },

    setCachedPurchaser(id, name) {
        const itemId = String(id || '').trim();
        const nm = String(name || '').trim();
        if (!itemId || !nm) return;
        const key = this.getPurchaserCacheKey(itemId);
        const indexKey = this.getPurchaserCacheIndexKey();
        try {
            localStorage.setItem(key, JSON.stringify({ id: itemId, cachedAt: Date.now(), name: nm }));
        } catch (e) {
            return;
        }
        try {
            let ids = [];
            try { ids = JSON.parse(localStorage.getItem(indexKey) || '[]'); } catch (e) { ids = []; }
            if (!Array.isArray(ids)) ids = [];
            ids = ids.filter(x => String(x) !== itemId);
            ids.unshift(itemId);
            const max = 200;
            const overflow = ids.slice(max);
            ids = ids.slice(0, max);
            localStorage.setItem(indexKey, JSON.stringify(ids));
            overflow.forEach(x => {
                try { localStorage.removeItem(this.getPurchaserCacheKey(x)); } catch (e) {}
            });
        } catch (e) {}
    },

    extractPurchaserFromDetailText(text) {
        if (!text) return '';
        try {
            const raw = String(text);
            const m =
                raw.match(/采购单位<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/) ||
                raw.match(/采购人<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/) ||
                raw.match(/采购单位[:：]\s*<\/?(?:span|div|p)[^>]*>([\s\S]*?)<\/(?:span|div|p)>/);
            if (!m || !m[1]) return '';
            return String(m[1])
                .replace(/<[^>]+>/g, '')
                .replace(/&nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/\s+/g, ' ')
                .trim();
        } catch (e) {
            return '';
        }
    },

    async prefetchPurchasersForList(maxCount = 20) {
        if (this.state.listPurchaserPrefetchInFlight) return;
        if (this.state.currentTab !== 0) return;
        const seq = this.state.activeFetchSeq || 0;
        const ctxKey = `${this.state.currentCity || ''}||${(this.state.searchKeyword || '').trim()}`;
        const rows = Array.isArray(this.state.data) ? this.state.data.slice(0, Math.max(1, Number(maxCount || 20))) : [];
        const need = rows.filter(it => {
            const p = String((it && it.purchaser) || '').trim();
            if (!p) return true;
            if (p.includes('...') || p.includes('…')) return true;
            return false;
        });
        if (need.length === 0) return;
        this.state.listPurchaserPrefetchInFlight = true;
        try {
            let changed = false;
            for (const item of need) {
                if (!item || item.id == null) continue;
                if (this.state.activeFetchSeq !== seq) return;
                const nowCtxKey = `${this.state.currentCity || ''}||${(this.state.searchKeyword || '').trim()}`;
                if (nowCtxKey !== ctxKey) return;
                const id = item.id;
                const cachedName = this.getCachedPurchaser(id);
                if (cachedName) {
                    const cur = String(item.purchaser || '').trim();
                    if (!cur || cur.includes('...') || cur.includes('…') || cachedName.length > cur.length) {
                        item.purchaser = cachedName;
                        changed = true;
                    }
                    continue;
                }
                let extracted = '';
                const cachedDetail = this.getCachedDetail(id);
                if (cachedDetail && cachedDetail.html) {
                    extracted = this.extractPurchaserFromDetailText(cachedDetail.html);
                }
                if (!extracted) {
                    try {
                        const json = await this.fetchDetailById(id);
                        let html = '';
                        if (json && json.code === 1 && json.data) {
                            if (typeof json.data === 'string') html = json.data;
                            else if (typeof json.data.text === 'string') html = json.data.text;
                            else if (typeof json.data.content === 'string') html = json.data.content;
                        }
                        extracted = this.extractPurchaserFromDetailText(html);
                    } catch (e) {}
                }
                if (extracted) {
                    this.setCachedPurchaser(id, extracted);
                    const cur = String(item.purchaser || '').trim();
                    if (!cur || cur.includes('...') || cur.includes('…') || extracted.length > cur.length) {
                        item.purchaser = extracted;
                        changed = true;
                    }
                }
                await new Promise(r => setTimeout(r, 120));
            }
            if (changed && this.state.currentTab === 0 && this.state.activeFetchSeq === seq) {
                this.renderList();
            }
        } finally {
            this.state.listPurchaserPrefetchInFlight = false;
        }
    },

    getApiBase() {
        const fromStorage = (this.safeStorageGet('BIDDING_API_BASE') || '').trim();
        if (fromStorage) {
            const v = fromStorage.replace(/\/+$/, '');
            if (!(this.isNativeAppRuntime() && /^http:\/\//i.test(v))) return v;
        }
        const fromGlobal = (window.BIDDING_API_BASE || '').trim();
        if (fromGlobal) {
            const v = fromGlobal.replace(/\/+$/, '');
            if (!(this.isNativeAppRuntime() && /^http:\/\//i.test(v))) return v;
        }
        if (this.state.apiBaseResolved) {
            const v = String(this.state.apiBaseResolved || '').replace(/\/+$/, '');
            if (!(this.isNativeAppRuntime() && /^http:\/\//i.test(v))) return v;
        }
        return DEFAULT_API_BASE;
    },

    getDailyReportBase() {
        const fromStorage = (this.safeStorageGet('BIDDING_DAILY_REPORT_BASE') || '').trim();
        if (fromStorage) return fromStorage.replace(/\/+$/, '');
        const fromGlobal = (window.BIDDING_DAILY_REPORT_BASE || '').trim();
        if (fromGlobal) return fromGlobal.replace(/\/+$/, '');
        const apiBase = this.getApiBase();
        if (apiBase) return `${apiBase}/cache`;
        return '/cache';
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

    async startAutoDetectCity(options = {}) {
        if (this.state.locationAutoInFlight) return;
        if (this.state.locationAutoDone) return;
        const markPrompted = !!options.markPrompted;
        const kw = (this.state.searchKeyword || '').trim();
        if (kw) return;
        if (!this.hasLocationPlugin()) return;
        const saved = this.normalizeCityName(this.safeStorageGet('br_default_city'));
        if (saved && this.isKnownCity(saved)) {
            this.state.locationAutoDone = true;
            if (markPrompted) this.safeStorageSet('br_location_prompted', '1');
            return;
        }
        if (this.state.currentCity && this.state.currentCity !== '全国') {
            this.state.locationAutoDone = true;
            if (markPrompted) this.safeStorageSet('br_location_prompted', '1');
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
                if (markPrompted) this.safeStorageSet('br_location_prompted', '1');
                const el = document.getElementById('current-city');
                if (el) el.innerText = city;
                this.fetchData(0, false);
                this.state.locationAutoDone = true;
            } else if (!city) {
                this.state.locationAutoRetryCount = (this.state.locationAutoRetryCount || 0) + 1;
                if (this.state.locationAutoRetryCount >= 3) this.state.locationAutoDone = true;
                else setTimeout(() => this.startAutoDetectCity(), 2000);
            } else {
                if (markPrompted) this.safeStorageSet('br_location_prompted', '1');
                this.state.locationAutoDone = true;
            }
        } catch (e) {
            const msg = String((e && e.message) || '');
            if (msg.includes('DENIED')) {
                if (markPrompted) this.safeStorageSet('br_location_prompted', '1');
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

    hasReplacementChar(value, depth = 0) {
        if (value == null) return false;
        if (typeof value === 'string') return value.includes('\uFFFD');
        if (depth > 4) return false;
        if (Array.isArray(value)) return value.some((item) => this.hasReplacementChar(item, depth + 1));
        if (typeof value === 'object') {
            for (const k in value) {
                if (Object.prototype.hasOwnProperty.call(value, k) && this.hasReplacementChar(value[k], depth + 1)) return true;
            }
        }
        return false;
    },

    async requestJson(url, options = {}) {
        const isAbs = /^https?:\/\//.test(url);
        const method = String(options.method || 'GET').toUpperCase();
        const skipNativeHttp = !!options.__skipNativeHttp || (this.isNativeAppRuntime() && method === 'GET');
        const timeoutMs = Number(options.timeoutMs || 0);
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
        const coldStart = this.state.appStartedAt && (Date.now() - this.state.appStartedAt < 45000);
        const nativeTimeoutMs = timeoutMs > 0 ? timeoutMs : (coldStart ? 12000 : 8000);
        if (isAbs && this.isNativeAppRuntime() && !this.hasCapacitorHttp() && !this.hasNativeHttpPlugin()) {
            await this.waitForNativeHttpReady(3000);
        }
        if (isAbs && !skipNativeHttp && this.hasCapacitorHttp() && method === 'GET') {
            try {
                const ret = await withTimeout(window.Capacitor.Plugins.CapacitorHttp.get({ url, headers }), nativeTimeoutMs);
                let json = ret && ret.data;
                if (typeof json === 'string') {
                    try { json = JSON.parse(json); } catch (e) {}
                }
                if (this.hasReplacementChar(json)) {
                    return await this.requestJson(url, Object.assign({}, options, { __skipNativeHttp: true }));
                }
                return { ok: (ret && ret.status >= 200 && ret.status < 300), status: (ret && ret.status) || 0, json };
            } catch (e) {
                const msg = String((e && e.message) || e || '');
                if (!msg.includes('NATIVE_HTTP_TIMEOUT')) throw e;
            }
        }
        if (isAbs && !skipNativeHttp && this.hasNativeHttpPlugin() && method === 'GET') {
            try {
                const ret = await withTimeout(window.Capacitor.Plugins.NativeHttpPlugin.get({
                    url,
                    headers
                }), nativeTimeoutMs);
                const status = (ret && ret.status) || 0;
                let json = ret && ret.data;
                if (typeof json === 'string') {
                    try { json = JSON.parse(json); } catch (e) {}
                }
                if (this.hasReplacementChar(json)) {
                    return await this.requestJson(url, Object.assign({}, options, { __skipNativeHttp: true }));
                }
                return { ok: status >= 200 && status < 300, status, json };
            } catch (e) {
                const msg = String((e && e.message) || e || '');
                if (!msg.includes('NATIVE_HTTP_TIMEOUT')) throw e;
            }
        }
        let resp;
        try {
            const fetchTimeoutMs = timeoutMs > 0 ? timeoutMs : 9000;
            resp = await this.fetchWithTimeout(url, { cache: 'no-store', headers, method, body: fetchBody }, fetchTimeoutMs);
        } catch (e) {
            const msg = String((e && e.message) || e || '');
            if (msg.includes('aborted') || msg.includes('AbortError')) {
                throw new Error('NETWORK_TIMEOUT');
            }
            throw e;
        }
        const contentType = String(resp.headers && resp.headers.get ? (resp.headers.get('content-type') || '') : '').toLowerCase();
        let json = null;
        let text = '';
        if (contentType.includes('application/json')) {
            try { json = await resp.json(); } catch (e) {}
        } else {
            try { text = await resp.text(); } catch (e) {}
            json = text;
        }
        const result = { ok: resp.ok, status: resp.status, json, text, contentType };
        const pinMsg = String((json && (json.msg || json.message)) || '');
        const hasPinHeader = !!(headers['x-admin-pin-token'] || headers['X-Admin-Pin-Token']);
        const isPinVerifyApi = /\/api\/admin\/pin\/verify(?:\?|$)/.test(String(url || ''));
        const pinExpired = Number(resp.status || 0) === 401 && /PIN验证已失效|需要PIN二次验证|pin/i.test(pinMsg);
        if (pinExpired && hasPinHeader && !isPinVerifyApi && !options.__adminPinRetried) {
            const repin = prompt('PIN已过期，请重新输入PIN码');
            if (repin) {
                const ret = await this.verifyAdminPin(String(repin).trim());
                if (ret.ok) {
                    const retryHeaders = Object.assign({}, options.headers || {}, this.getAdminAuthHeaders());
                    return await this.requestJson(url, Object.assign({}, options, { headers: retryHeaders, __adminPinRetried: true }));
                }
                this.showToast(ret.msg || 'PIN验证失败');
            }
        }
        return result;
    },

    sortRowsByDatetimeDesc(rows = []) {
        return (rows || []).sort((a, b) => {
            const atRaw = a && a.datetime_ts != null ? Number(a.datetime_ts) : 0;
            const btRaw = b && b.datetime_ts != null ? Number(b.datetime_ts) : 0;
            const at = !Number.isNaN(atRaw) && atRaw > 0 ? atRaw : (() => {
                const ad = this.parseDate(a && a.datetime);
                return ad && !isNaN(ad.getTime()) ? ad.getTime() : 0;
            })();
            const bt = !Number.isNaN(btRaw) && btRaw > 0 ? btRaw : (() => {
                const bd = this.parseDate(b && b.datetime);
                return bd && !isNaN(bd.getTime()) ? bd.getTime() : 0;
            })();
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
        const pageSize = page === 0 ? 10 : 20;
        const qs = new URLSearchParams({ page: String(page) });
        qs.append('pageSize', String(pageSize));
        qs.append('_ts', String(Date.now()));
        if (city && city !== '全国') qs.append('city', city);
        if (keyword) qs.append('keyword', keyword);
        const list = [];
        const kw = String(keyword || '').trim();
        const apiBase = this.getApiBase();
        if (apiBase) list.push(`${apiBase}/api/list?${qs.toString()}`);
        const proto = (window.location && window.location.protocol) || '';
        if (proto === 'http:' || proto === 'https:') {
            list.push(`/api/list?${qs.toString()}`);
        }
        if (this.isNativeAppRuntime()) {
            list.push(`${NATIVE_FALLBACK_API_BASE}/api/list?${qs.toString()}`);
        }
        if (!kw && page > 0) {
            const base = this.getApiBase();
            if (base) {
                if (city && city !== '全国') {
                    list.push(`${base}/cache/list/city/${encodeURIComponent(city)}/page-${page}.json`);
                } else {
                    list.push(`${base}/cache/list/country/page-${page}.json`);
                }
            }
            if (this.isNativeAppRuntime()) {
                if (city && city !== '全国') {
                    list.push(`${NATIVE_FALLBACK_API_BASE}/cache/list/city/${encodeURIComponent(city)}/page-${page}.json`);
                } else {
                    list.push(`${NATIVE_FALLBACK_API_BASE}/cache/list/country/page-${page}.json`);
                }
            }
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
        if (!apiBase || page === 0) list.push(remoteUrl);
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
        const fastFirstScreen = !!options.fastFirstScreen && page === 0;
        let lastError = null;
        const city = options.city ?? this.state.currentCity;
        const keyword = options.keyword ?? this.state.searchKeyword;
        let staleLocalFallback = null;
        if (page === 0 && candidates.length > 1) {
            const raceCandidates = candidates.slice(0, Math.min(3, candidates.length));
            const raceResult = await new Promise((resolve) => {
                let done = false;
                let pending = raceCandidates.length;
                raceCandidates.forEach((url) => {
                    (async () => {
                        try {
                            const isStaticList = /\/cache\/list\//.test(url);
                            const isLocalList = /\/api\/list\?/.test(url) || /\/api\/list$/.test(url);
                            const source = isStaticList ? 'static' : (isLocalList ? 'local' : 'remote');
                            const res = await this.requestJson(url, { timeoutMs: isStaticList ? 2200 : 3200 });
                            if (!res.ok || !res.json) return null;
                            const normalized = this.normalizeListPayload(res.json, { ...options, __source: source });
                            if (!normalized) return null;
                            if (city && city !== '全国' && !String(keyword || '').trim() && Array.isArray(normalized.data) && normalized.data.length === 0) return null;
                            normalized.__source = source;
                            return normalized;
                        } catch (e) {
                            return null;
                        }
                    })().then((ret) => {
                        pending -= 1;
                        if (!done && ret) {
                            done = true;
                            resolve(ret);
                            return;
                        }
                        if (!done && pending <= 0) resolve(null);
                    });
                });
            });
            if (raceResult) return raceResult;
            if (fastFirstScreen) throw new Error('FIRST_SCREEN_TIMEOUT');
        }
        for (const url of candidates) {
            try {
                const isStaticList = /\/cache\/list\//.test(url);
                const reqTimeoutMs = isStaticList ? 3500 : 6000;
                const res = await this.requestJson(url, { timeoutMs: reqTimeoutMs });
                if (!res.ok || !res.json) continue;
                const isLocalList = /\/api\/list\?/.test(url) || /\/api\/list$/.test(url);
                const source = isStaticList ? 'static' : (isLocalList ? 'local' : 'remote');
                const normalized = this.normalizeListPayload(res.json, { ...options, __source: source });
                if (!normalized) continue;
                normalized.__source = source;
                if (page === 0 && isLocalList && normalized.syncMeta) {
                    const successAt = Number(normalized.syncMeta.successAt || 0);
                    const stale = !successAt || (Date.now() - successAt > 3 * 60 * 1000);
                    if (stale && candidates.length > 1) {
                        staleLocalFallback = normalized;
                        continue;
                    }
                }
                if (page === 0 && isStaticList && normalized.syncMeta) {
                    const successAt = Number(normalized.syncMeta.successAt || 0);
                    const stale = !successAt || (Date.now() - successAt > 5 * 60 * 1000);
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
        list.push(`https://server.bookinge.com/cggg/wxapp/article?id=${encodeURIComponent(id)}`);
        return Array.from(new Set(list));
    },

    buildDetailViewCandidates(id) {
        const list = [];
        const apiBase = this.getApiBase();
        if (apiBase) list.push(`${apiBase}/api/detail-view?id=${encodeURIComponent(id)}`);
        const proto = (window.location && window.location.protocol) || '';
        if (proto === 'http:' || proto === 'https:') {
            list.push(`/api/detail-view?id=${encodeURIComponent(id)}`);
        }
        list.push(`https://zhaobiao.agecms.com/api/detail?id=${encodeURIComponent(id)}`);
        list.push(`https://server.bookinge.com/cggg/wxapp/article?id=${encodeURIComponent(id)}`);
        return Array.from(new Set(list));
    },

    async fetchDetailById(id) {
        const candidates = this.buildDetailCandidates(id);
        let lastError = null;
        let fallbackJson = null;
        for (const url of candidates) {
            try {
                const res = await this.requestJson(url);
                if (!res.ok || !res.json) continue;
                if (res.json.code === 1 && res.json.data) {
                    const data = res.json.data || {};
                    const weburl = String(data.weburl || '').trim();
                    const pageUrl = String(data.url || '').trim();
                    if (weburl || pageUrl) return res.json;
                    if (!fallbackJson) fallbackJson = res.json;
                }
            } catch (e) {
                lastError = e;
            }
        }
        if (fallbackJson) return fallbackJson;
        throw lastError || new Error('详情接口不可用');
    },

    getApiBaseCandidates() {
        const fromStorage = (this.safeStorageGet('BIDDING_API_BASE') || '').trim();
        const fromGlobal = (window.BIDDING_API_BASE || '').trim();
        const candidates = [];
        candidates.push(DEFAULT_API_BASE);
        if (fromStorage) {
            const v = fromStorage.replace(/\/+$/, '');
            if (!(this.isNativeAppRuntime() && /^http:\/\//i.test(v))) candidates.push(v);
        }
        if (fromGlobal) {
            const v = fromGlobal.replace(/\/+$/, '');
            if (!(this.isNativeAppRuntime() && /^http:\/\//i.test(v))) candidates.push(v);
        }
        if (this.state.apiBaseResolved) candidates.push(this.state.apiBaseResolved);
        const host = (window.location && window.location.hostname) || '';
        if (!this.isNativeAppRuntime() && (host === 'localhost' || host === '127.0.0.1')) {
            candidates.push('http://127.0.0.1:3002');
            candidates.push('http://127.0.0.1:3001');
        }
        if (this.isNativeAppRuntime()) {
            candidates.push(NATIVE_FALLBACK_API_BASE);
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
                const resp = await this.fetchWithTimeout(`${base}/api/list?page=0&_ping=${Date.now()}`, { cache: 'no-store' }, 3000);
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
        const pageSize = page === 0 ? 10 : 20;
        let url = this.apiUrl(`/api/list?page=${page}&pageSize=${pageSize}&_ts=${Date.now()}`, resolvedBase);
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
            this.state.backendLatestDataAt = Number(json.syncMeta.latestDataAt || this.state.backendLatestDataAt || 0);
            this.state.backendSyncAlertActive = !!json.syncMeta.alertActive;
            this.state.backendSyncAlertReason = String(json.syncMeta.alertReason || '');
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
                        const json = await this.fetchDetailById(item.id);
                        let text = '';
                        if (json && json.code === 1 && json.data) {
                            if (typeof json.data === 'string') text = json.data;
                            else if (typeof json.data.text === 'string') text = json.data.text;
                            else if (typeof json.data.content === 'string') text = json.data.content;
                        }
                        const exact = this.extractExactDatetimeFromText(text || '');
                        if (exact) item.datetime = exact;
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
            const keepCached = this.state.homeCacheApplied && !this.state.searchKeyword && this.state.currentCity === '全国' && page === 0;
            if (isContextSwitch && !keepCached) this.state.data = [];
            this.renderList(); // Show loading state
        }
        
        try {
            const forceRemote = false;
            const json = await this.fetchListPage(page, { forceRemote, fastFirstScreen: !append && page === 0 });
            if (this.state.activeFetchSeq !== seq) return;
            this.state.lastListSource = json && json.__source ? String(json.__source) : '';
            if (!append && page === 0) {
                if (this.state.startupRetryTimer) clearTimeout(this.state.startupRetryTimer);
                this.state.startupRetryTimer = null;
                this.state.startupRetryCount = 0;
            }
            this.state.error = null;
            if (this.state.lastListSource === 'remote') this.state.apiOnlineAt = Date.now();
            if (!append && page === 0) this.state.lastDataContextKey = ctxKey;
            const newData = json.data || [];
            this.state.lastTopId = (Array.isArray(newData) && newData[0] && newData[0].id != null) ? String(newData[0].id) : '';
            const syncMeta = json.syncMeta || { actionAt: Date.now(), successAt: Date.now() };
            this.state.backendSyncActionAt = syncMeta.actionAt || Date.now();
            this.state.backendSyncSuccessAt = syncMeta.successAt || this.state.backendSyncActionAt;
            const staleHoursRaw = Number(syncMeta.staleAlertHours || this.state.dataStaleAlertHours || 24);
            const staleHours = Number.isFinite(staleHoursRaw) && staleHoursRaw > 0 ? staleHoursRaw : 24;
            this.state.dataStaleAlertHours = staleHours;
            const latestDataAt = Number(syncMeta.latestDataAt || this.state.backendLatestDataAt || 0);
            this.state.backendLatestDataAt = latestDataAt;
            const latestDataLagMin = Number(syncMeta.latestDataLagMin || (latestDataAt ? Math.max(0, Math.floor((Date.now() - latestDataAt) / 60000)) : -1));
            const dataStale = syncMeta.dataStale != null ? !!syncMeta.dataStale : (!latestDataAt || latestDataLagMin >= staleHours * 60);
            const backendAlertActive = !!syncMeta.alertActive;
            const backendAlertReason = String(syncMeta.alertReason || '');
            this.state.backendSyncAlertActive = backendAlertActive || dataStale;
            this.state.backendSyncAlertReason = backendAlertReason || (dataStale ? `数据未更新超过${staleHours}小时` : '');
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
                    this.saveCachedHomeList(this.state.data);
                    this.state.homeCacheApplied = false;
                }
            }
        } catch (e) {
            if (this.state.activeFetchSeq !== seq) return;
            console.error("API Fetch Failed:", e);
            const rawMsg = String((e && e.message) || '');
            this.state.error = rawMsg.includes('FIRST_SCREEN_TIMEOUT')
                ? null
                : ((rawMsg.includes('NETWORK_TIMEOUT') || rawMsg.includes('aborted'))
                ? '网络超时，请稍后重试'
                : rawMsg);
            this.state.data = previousData;
            this.state.hasMore = false;
            if (!append && page === 0) {
                const msg = String((e && e.message) || this.state.error || '');
                const shouldRetry = this.isNativeAppRuntime() && (
                    msg.includes('FIRST_SCREEN_TIMEOUT') ||
                    msg.includes('offline') ||
                    msg.includes('Failed to fetch') ||
                    msg.includes('NATIVE_HTTP_UNAVAILABLE') ||
                    msg.includes('NATIVE_HTTP_TIMEOUT') ||
                    msg.includes('Network') ||
                    msg.includes('NETWORK_TIMEOUT') ||
                    msg.includes('aborted') ||
                    msg.includes('network')
                );
                if (shouldRetry) this.scheduleStartupRetry();
            }
        } finally {
            if (this.state.activeFetchSeq !== seq) return;
            this.state.loading = false;
            this.state.loadingMore = false;
            this.renderList();
            if (!append && page === 0 && this.state.currentTab === 0) {
                this.prefetchPurchasersForList(20);
            }
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
        const srcKey = String(this.state.lastListSource || '');
        const isOfflineSource = srcKey === 'static';
        const displayDt = hasSyncTime ? dt : (hasApiTime ? apiDt : null);
        const timeText = displayDt
            ? `${displayDt.getFullYear()}-${String(displayDt.getMonth() + 1).padStart(2, '0')}-${String(displayDt.getDate()).padStart(2, '0')} ${String(displayDt.getHours()).padStart(2, '0')}:${String(displayDt.getMinutes()).padStart(2, '0')}:${String(displayDt.getSeconds()).padStart(2, '0')}`
            : '暂无';
        const synced = !isOfflineSource && hasSyncTime;
        const hasVisibleData = Array.isArray(this.state.data) && this.state.data.length > 0;
        const isStarting = this.inStartupGrace() && !hasVisibleData && !(this.state.searchKeyword || '').trim();
        const unavailable = !isStarting && !hasSyncTime && !hasApiTime && !hasVisibleData;
        const alertActive = !!this.state.backendSyncAlertActive;
        const alertReason = String(this.state.backendSyncAlertReason || '');
        const showAlert = this.isAdminUser();
        const visibleAlertActive = showAlert && alertActive;
        const visibleAlertReason = showAlert ? alertReason : '';
        const bg = unavailable
            ? 'rgba(255,59,48,0.12)'
            : (visibleAlertActive
                ? 'rgba(255,59,48,0.12)'
                : (synced
                    ? 'rgba(52,199,89,0.12)'
                    : (isStarting ? 'rgba(74,144,226,0.12)' : (isOfflineSource ? 'rgba(108,117,125,0.14)' : 'rgba(255,149,0,0.14)'))));
        const color = unavailable
            ? '#D74A41'
            : (visibleAlertActive
                ? '#D74A41'
                : (synced
                    ? '#1E9D4A'
                    : (isStarting ? '#2F6FB3' : (isOfflineSource ? '#5C6067' : '#D26D00'))));
        const border = unavailable
            ? 'rgba(255,59,48,0.35)'
            : (visibleAlertActive
                ? 'rgba(255,59,48,0.35)'
                : (synced
                    ? 'rgba(52,199,89,0.35)'
                    : (isStarting ? 'rgba(74,144,226,0.35)' : (isOfflineSource ? 'rgba(108,117,125,0.36)' : 'rgba(255,149,0,0.38)'))));
        const status = unavailable
            ? '未连接'
            : (visibleAlertActive ? '告警' : (isStarting ? '连接中' : (isOfflineSource ? '缓存模式' : '在线')));
        const src = srcKey === 'remote'
            ? '远端'
            : (srcKey === 'local' ? '云端' : (srcKey === 'static' ? '静态' : ''));
        const top = (this.state.lastTopId || '').trim();
        const channel = src ? `API(${src}${top ? '·' + top : ''})` : 'API';
        const alertSuffix = visibleAlertActive && visibleAlertReason ? ` · ${visibleAlertReason}` : '';
        return `<div style="margin: 6px 16px 8px 16px; display: flex; justify-content: center;">
            <span style="display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; background: ${bg}; color: ${color}; border: 1px solid ${border};">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 5px;"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10"></path><path d="M20.49 15a9 9 0 0 1-14.13 3.36L1 14"></path></svg>
                ${channel} ${timeText} 同步 · ${status}${alertSuffix}
            </span>
        </div>`;
    },

    getHomeStatsStripHtml() {
        const text = this.state.homeStatsText || '昨日统计生成中';
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
        const daily = await this.tryLoadYesterdayReportFromStatic();
        if (daily) {
            this.state.homeStatsText = `昨日新增 ${daily.count} 条，商机 ${daily.totalYi} 亿+`;
            this.state.homeStatsAt = Date.now();
        } else {
            this.state.homeStatsText = '昨日统计生成中';
        }
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
                const staleHoursRaw = Number(syncMeta.staleAlertHours || this.state.dataStaleAlertHours || 24);
                const staleHours = Number.isFinite(staleHoursRaw) && staleHoursRaw > 0 ? staleHoursRaw : 24;
                this.state.dataStaleAlertHours = staleHours;
                const latestDataAt = Number(syncMeta.latestDataAt || this.state.backendLatestDataAt || 0);
                this.state.backendLatestDataAt = latestDataAt;
                const latestDataLagMin = Number(syncMeta.latestDataLagMin || (latestDataAt ? Math.max(0, Math.floor((Date.now() - latestDataAt) / 60000)) : -1));
                const dataStale = syncMeta.dataStale != null ? !!syncMeta.dataStale : (!latestDataAt || latestDataLagMin >= staleHours * 60);
                const backendAlertActive = !!syncMeta.alertActive;
                const backendAlertReason = String(syncMeta.alertReason || '');
                this.state.backendSyncAlertActive = backendAlertActive || dataStale;
                this.state.backendSyncAlertReason = backendAlertReason || (dataStale ? `数据未更新超过${staleHours}小时` : '');
                if (json.statsMeta && json.statsMeta.text) {
                    this.state.homeStatsText = json.statsMeta.text;
                    this.state.homeStatsAt = Date.now();
                }
            }
        } catch (e) {
            if (!this.state.homeStatsText) this.state.homeStatsText = '昨日统计生成中';
        } finally {
            this.state.homeStatsLoading = false;
            if (this.state.currentTab === 0) this.renderHomeStatsHost();
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
        if (index !== 2) {
            this.state.adminDrawerOpen = false;
            this.state.adminPanelOpen = false;
        }
        
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
            this.renderRuntimeBanner();
            this.maybeShowRuntimeNotice();
            
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
            
            try {
                contentArea.innerHTML = this.getMemberCenterHTML();
            } catch (e) {
                const errText = String((e && e.message) || e || '未知错误');
                contentArea.innerHTML = `<div style="padding:16px;"><div style="background:#fff;border-radius:12px;padding:16px;color:#333;">会员中心加载失败：${errText}</div></div>`;
                console.error('member center render error', e);
            }
            if (this.state.user && this.state.user.isLogged) {
                this.syncReferralFromServer().then(() => {
                    if (this.state.currentTab === 2) {
                        const c = document.getElementById('content-area');
                        if (c) {
                            try {
                                c.innerHTML = this.getMemberCenterHTML();
                            } catch (e) {
                                const errText = String((e && e.message) || e || '未知错误');
                                c.innerHTML = `<div style="padding:16px;"><div style="background:#fff;border-radius:12px;padding:16px;color:#333;">会员中心加载失败：${errText}</div></div>`;
                                console.error('member center rerender error', e);
                            }
                        }
                    }
                });
            }
        }
    },

    // --- List View Logic ---

    renderList(data = this.state.data) {
        if (this.state.currentTab !== 0) return; // Only render if on Home tab
        
        const container = document.getElementById('list');
        if (!container) return;
        const headerHtml = this.getHomeSyncInfoHtml();

        if (this.state.loading) {
            container.innerHTML = `${headerHtml}<div class="empty-state">雷达扫描中...</div>`;
            return;
        }

        // Removed explicit error display to prioritize data display (even if mock)
        // If data is empty and error exists, the generic empty state will show
        
        if (data.length === 0) {
            const hideStartupError = this.inStartupGrace() && !(this.state.searchKeyword || '').trim();
            const emptyText = hideStartupError ? '雷达扫描中...' : (this.state.error ? `无法连接服务器，请稍后重试（${this.state.error}）` : '未找到相关结果');
            container.innerHTML = `${headerHtml}<div class="empty-state">${emptyText}</div>`;
            return;
        }

        let html = headerHtml;

        data.forEach((item, index) => {
            try {
                const tagClass = this.getTagClass(item.types || '其他');
                // Safe accessors
                const title = item.title || '无标题';
                const price = this.normalizeBidPriceText(item.bid_price || item.bidPrice || '');
                const purchaser = item.purchaser || '';
                const city = item.city || '';
                const time = this.formatTime(item.datetime, item.datetime_ts);
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
                            ${price ? 
                            `<span style="color: #ff3b30; font-size: 13px; font-weight: 600;">${price}</span>` : ''}
                        </div>
                        <div style="font-size: 12px; color: var(--text-secondary); white-space: nowrap;">${time}</div>
                    </div>

                    <div style="margin-bottom: 8px; line-height: 1.5;">
                        <span class="card-title">${title}</span>
                        <span class="tag-new" style="background: ${tagClass.bg}; color: ${tagClass.text}; margin-left: 4px; vertical-align: 1px;">${type}</span>
                    </div>
                    
                    <div class="card-meta">
                        <div class="meta-item card-meta-inline">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 2px; flex-shrink: 0;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            <span class="meta-city">${city}</span>
                            ${purchaser ? `<span class="purchaser-pill purchaser-pill--truncate">${purchaser}</span>` : ''}
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

    getMemberPermissionMatrix() {
        const cfg = (this.state.runtimeConfig && this.state.runtimeConfig['member.permission.matrix']) || {};
        const normNum = (v, d) => {
            const n = Number(v);
            return Number.isFinite(n) ? n : d;
        };
        const norm = (obj, fallback) => ({
            scope: String((obj && obj.scope) || fallback.scope),
            viewLimit: normNum(obj && obj.viewLimit, fallback.viewLimit),
            keywordLimit: Math.max(0, normNum(obj && obj.keywordLimit, fallback.keywordLimit)),
            deviceLimit: Math.max(1, normNum(obj && obj.deviceLimit, fallback.deviceLimit)),
            serviceCount: Math.max(0, normNum(obj && obj.serviceCount, fallback.serviceCount)),
        });
        return {
            free: norm(cfg.free, { scope: '体验', viewLimit: 10, keywordLimit: 1, deviceLimit: 1, serviceCount: 0 }),
            city: norm(cfg.city, { scope: '城市', viewLimit: 100, keywordLimit: 10, deviceLimit: 2, serviceCount: 1 }),
            province: norm(cfg.province, { scope: '全省', viewLimit: 500, keywordLimit: 50, deviceLimit: 5, serviceCount: 3 }),
            country: norm(cfg.country, { scope: '全国', viewLimit: -1, keywordLimit: 200, deviceLimit: 10, serviceCount: 5 }),
        };
    },

    checkViewPermission(item) {
        const user = this.state.user;
        const matrix = this.getMemberPermissionMatrix();
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
            const limit = Number(matrix.province.viewLimit || 500);
            if (limit < 0 || user.viewUsage < limit) {
                return { allowed: true, type: 'limited', remaining: limit < 0 ? -1 : (limit - user.viewUsage), limit };
            } else {
                return { allowed: false, message: `跨省浏览额度已用完（${limit}条），请升级全国会员。` };
            }
        }
        
        // City Member
        if (level === 'city') {
            // In Scope (Same City): Unlimited
            if (user.vipScopeValue && itemCity === user.vipScopeValue) {
                return { allowed: true };
            }
            // Out of Scope: Limit 100
            const limit = Number(matrix.city.viewLimit || 100);
            if (limit < 0 || user.viewUsage < limit) {
                return { allowed: true, type: 'limited', remaining: limit < 0 ? -1 : (limit - user.viewUsage), limit };
            } else {
                return { allowed: false, message: `跨市浏览额度已用完（${limit}条），请升级会员。` };
            }
        }
        
        // Free Member (Default)
        // Limit 10 (Lifetime)
        const freeLimit = Math.max(0, Number(matrix.free.viewLimit || 10));
        if (user.viewUsage < freeLimit) {
            return { allowed: true, type: 'limited', remaining: freeLimit - user.viewUsage, limit: freeLimit, isFree: true };
        } else {
            return { allowed: false, message: `免费额度已用完（终身${freeLimit}条），请升级会员以无限浏览。` };
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
        if (!this.state.user || !this.state.user.isLogged || !this.isSuperAdmin()) return ``;
        return `
            <div style="position:absolute; top: calc(max(env(safe-area-inset-top), 44px) + 10px); left: 14px; z-index: 30;">
                <button onclick="openAdminDrawer()" style="width:30px; height:30px; border:none; border-radius:0; background: transparent; color:#fff; display:flex; align-items:center; justify-content:center; box-shadow:none; padding:0;">
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round">
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
            </div>
        `;
    },

    // --- Detail View Logic ---
    async showDetail(itemStr) {
        try {
            const item = JSON.parse(decodeURIComponent(itemStr));
            this.state.detailCurrentItem = item;
            
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
                            <span>${this.formatTime(item.datetime, item.datetime_ts)}</span>
                            <span>${item.city}</span>
                            <span style="background: ${tagStyle.bg}; color: ${tagStyle.text}; padding: 2px 6px; border-radius: 4px;">${item.types || '公告'}</span>
                        </div>
                        
                        <div style="border-top: 1px solid #F5F5F5; padding-top: 16px; display: flex; flex-direction: column; gap: 12px;">
                            <div style="display: flex; font-size: 14px;">
                                <span style="color: #999; width: 70px; flex-shrink: 0;">采购单位</span>
                                <span style="color: #333; font-weight: 500; white-space: normal; word-break: break-word;">${item.purchaser || '-'}</span>
                            </div>
                            <div style="display: flex; font-size: 14px;">
                                <span style="color: #999; width: 70px; flex-shrink: 0;">中标金额</span>
                                <span style="color: #FF3B30; font-weight: 600;">${this.normalizeBidPriceText(item.bid_price || item.bidPrice || '') || '未公示金额'}</span>
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

                    #detail-body .card,
                    #detail-body .card:hover,
                    #detail-body .card:active {
                        box-shadow: none !important;
                        transform: none !important;
                        transition: none !important;
                        -webkit-tap-highlight-color: transparent !important;
                    }

                    /* Enforce font size to match Purchasing Unit */
                    #detail-body, #detail-body * { font-size: 14px !important; }
                </style>
            `;
            
            modal.style.display = 'flex';
            setTimeout(() => {
                modal.classList.add('visible');
            }, 10);
            this.updateDetailFavoriteButton(item);

            const defaultOriginalUrl = this.resolveSourceOriginalUrl(item.url || '', '');
            const btnViewOriginal = document.getElementById('btn-view-original');
            if (btnViewOriginal) btnViewOriginal.onclick = () => this.openSourceOriginalUrl(defaultOriginalUrl);
            const btnCopyUrl = document.getElementById('btn-copy-url');
            if (btnCopyUrl) btnCopyUrl.onclick = () => this.copySourceOriginalUrl(defaultOriginalUrl);
            
            const extractDetailHtml = (json) => {
                if (!(json && json.code === 1 && json.data)) return { html: '', originalUrl: '' };
                let htmlContent = '';
                if (typeof json.data === 'string') htmlContent = json.data;
                else if (typeof json.data.text === 'string') htmlContent = json.data.text;
                else if (typeof json.data.content === 'string') htmlContent = json.data.content;
                const officialWeburl = this.normalizeExternalUrl((json.data && json.data.weburl) || '');
                const originalUrl = officialWeburl || this.resolveSourceOriginalUrl((json.data && (json.data.weburl || json.data.url)) || item.url || '', htmlContent);
                return { html: String(htmlContent || ''), originalUrl: String(originalUrl || '') };
            };

            const detailBody = document.getElementById('detail-body');
            const cached = this.getCachedDetail(item.id);
            if (detailBody && cached && typeof cached.html === 'string' && cached.html.trim()) {
                detailBody.innerHTML = this.normalizeDetailAmountText(cached.html);
                const cachedUrl = this.resolveSourceOriginalUrl(cached.originalUrl || item.url || '', cached.html || '');
                const linkButtons = document.querySelectorAll('#btn-view-original');
                if (linkButtons.length > 0) linkButtons[0].onclick = () => this.openSourceOriginalUrl(cachedUrl);
                const copyButtons = document.querySelectorAll('#btn-copy-url');
                if (copyButtons.length > 0) copyButtons[0].onclick = () => this.copySourceOriginalUrl(cachedUrl);
            }

            // 2. Fetch Full Content
            try {
                const json = await this.fetchDetailById(item.id);
                
                if (json.code === 1 && json.data) {
                    const extracted = extractDetailHtml(json);
                    const safeHtml = this.normalizeDetailAmountText(extracted.html);
                    const originalUrl = extracted.originalUrl;
                    const linkButtons = document.querySelectorAll('#btn-view-original');
                    if (linkButtons.length > 0) linkButtons[0].onclick = () => this.openSourceOriginalUrl(originalUrl);
                    const copyButtons = document.querySelectorAll('#btn-copy-url');
                    if (copyButtons.length > 0) copyButtons[0].onclick = () => this.copySourceOriginalUrl(originalUrl);
                    
                    if (detailBody) {
                        if (!safeHtml.trim()) detailBody.innerHTML = `<div style="color: #999; text-align: center; padding: 20px;">暂无详情内容</div>`;
                        else detailBody.innerHTML = safeHtml;
                    }
                    this.setCachedDetail(item.id, safeHtml, originalUrl);
                    
                    // 3. Post-process Links for "Click to Copy"
                    const links = detailBody ? detailBody.querySelectorAll('a') : [];
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
                    if (detailBody) detailBody.innerHTML = `<div style="color: red; text-align: center; padding: 20px;">获取详情失败: ${json.msg || '未知错误'}</div>`;
                }
            } catch (err) {
                console.error("Detail Fetch Error:", err);
                // Fallback for CORS or network errors in preview mode
                // In a real app, this might be handled by a proxy or native code
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

    normalizeExternalUrl(url) {
        let u = String(url || '').trim();
        if (!u) return '';
        u = u
            .replace(/&amp;/gi, '&')
            .replace(/&lt;/gi, '<')
            .replace(/&gt;/gi, '>')
            .replace(/&quot;/gi, '"')
            .replace(/&#39;/gi, "'");
        if (u.startsWith('//')) u = `https:${u}`;
        if (/^www\./i.test(u)) u = `https://${u}`;
        if (!/^[a-z][a-z0-9+\-.]*:\/\//i.test(u) && /^[\w.-]+\.[a-z]{2,}/i.test(u)) u = `https://${u}`;
        return u;
    },

    extractFirstExternalUrlFromHtml(html) {
        const raw = String(html || '');
        if (!raw) return '';
        const m = raw.match(/href\s*=\s*["']([^"']+)["']/i) || raw.match(/https?:\/\/[^\s"'<>]+/i);
        if (!m || !m[1]) return '';
        return this.normalizeExternalUrl(m[1]);
    },

    isProjectOwnedUrl(url) {
        const u = this.normalizeExternalUrl(url);
        if (!/^https?:\/\//i.test(u)) return false;
        try {
            const host = String(new URL(u).hostname || '').toLowerCase();
            if (!host) return false;
            if (host.includes('agecms.com')) return true;
            if (host.includes('heartguide.app')) return true;
            if (host === 'localhost' || host === '127.0.0.1') return true;
            return false;
        } catch (e) {
            return false;
        }
    },

    isGovSourceUrl(url) {
        const u = this.normalizeExternalUrl(url);
        if (!/^https?:\/\//i.test(u)) return false;
        try {
            const host = String(new URL(u).hostname || '').toLowerCase();
            return host.includes('gov.cn') || host.includes('gov.com.cn');
        } catch (e) {
            return false;
        }
    },

    extractSourceUrlsFromHtml(html) {
        const raw = String(html || '');
        if (!raw) return [];
        const text = raw
            .replace(/\\\//g, '/')
            .replace(/&amp;/gi, '&')
            .replace(/&quot;/gi, '"')
            .replace(/&#39;/gi, "'");
        const reg = /(https?:\/\/[^\s"'<>\\]+|www\.[^\s"'<>\\]+|(?:[a-zA-Z0-9-]+\.)+gov(?:\.com)?\.cn[^\s"'<>\\]*)/gi;
        const found = [];
        let m;
        while ((m = reg.exec(text)) !== null) {
            const normalized = this.normalizeExternalUrl(m[1] || m[0] || '');
            if (!/^https?:\/\//i.test(normalized)) continue;
            found.push(normalized);
        }
        return Array.from(new Set(found));
    },

    pickBestSourceUrl(candidates = []) {
        const cleaned = Array.from(new Set((candidates || []).map((x) => this.normalizeExternalUrl(x)).filter((x) => /^https?:\/\//i.test(x))));
        if (!cleaned.length) return '';
        const gov = cleaned.find((u) => this.isGovSourceUrl(u));
        if (gov) return gov;
        const nonProject = cleaned.find((u) => !this.isProjectOwnedUrl(u));
        if (nonProject) return nonProject;
        return '';
    },

    resolveSourceOriginalUrl(preferred = '', html = '') {
        const htmlUrls = this.extractSourceUrlsFromHtml(html || '');
        return this.pickBestSourceUrl([preferred, ...htmlUrls]);
    },

    openSourceOriginalUrl(url) {
        const u = this.resolveSourceOriginalUrl(url || '', '');
        if (!u) {
            this.showToast('未提取到源头官方网址');
            return;
        }
        return this.openExternalUrl(u);
    },

    copySourceOriginalUrl(url) {
        const u = this.resolveSourceOriginalUrl(url || '', '');
        if (!u) {
            this.showToast('未提取到源头官方网址');
            return;
        }
        this.fallbackCopy(u);
    },

    getDetailFallbackExternalUrl(id, preferred = '') {
        const p = this.normalizeExternalUrl(preferred);
        if (/^https?:\/\//i.test(p)) return p;
        const cands = this.buildDetailViewCandidates(id);
        const firstHttps = cands.find(u => /^https:\/\//i.test(String(u || '')));
        const firstHttp = cands.find(u => /^http:\/\//i.test(String(u || '')));
        return String(firstHttps || firstHttp || '');
    },

    async openExternalUrl(url) {
        let u = this.normalizeExternalUrl(url);
        if (!u || u === '#') {
            const cur = (this.state && this.state.detailCurrentItem) ? this.state.detailCurrentItem : {};
            u = this.getDetailFallbackExternalUrl(cur.id, cur.url || '');
        }
        if (!u || u === '#') {
            const last = this.normalizeExternalUrl(this.safeStorageGet('br_last_opened_external_url') || '');
            if (/^https?:\/\//i.test(last)) u = last;
        }
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
                await browser.open({ url: u });
                this.safeStorageSet('br_last_opened_external_url', u);
                return true;
            }
        } catch (e) {}
        const w = window.open(u, '_blank');
        if (!w) {
            try {
                window.location.href = u;
                this.safeStorageSet('br_last_opened_external_url', u);
                return true;
            } catch (e) {}
            this.fallbackCopy(u);
            this.showToast('已复制原文链接，请粘贴到浏览器打开');
            return false;
        }
        this.safeStorageSet('br_last_opened_external_url', u);
        return true;
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

    getFavoriteItems() {
        try {
            const raw = this.safeStorageGet('br_favorites_v1');
            const arr = JSON.parse(String(raw || '[]'));
            if (!Array.isArray(arr)) return [];
            return arr.filter(x => x && x.id != null);
        } catch (e) {
            return [];
        }
    },

    saveFavoriteItems(items = []) {
        this.safeStorageSet('br_favorites_v1', JSON.stringify(Array.isArray(items) ? items : []));
    },

    normalizeFavoriteItem(item = {}) {
        return {
            id: Number(item.id || 0) || String(item.id || ''),
            title: String(item.title || ''),
            datetime: String(item.datetime || ''),
            datetime_ts: Number(item.datetime_ts || 0),
            bid_price: String(item.bid_price || item.bidPrice || ''),
            city: String(item.city || ''),
            purchaser: String(item.purchaser || ''),
            types: String(item.types || ''),
            url: String(item.url || ''),
            savedAt: Date.now()
        };
    },

    isFavoriteItem(item = {}) {
        const id = String(item.id || '');
        if (!id) return false;
        return this.getFavoriteItems().some(x => String(x.id || '') === id);
    },

    updateDetailFavoriteButton(item = null) {
        const btn = document.getElementById('detail-fav-btn');
        if (!btn) return;
        const active = !!(item && this.isFavoriteItem(item));
        const color = active ? '#FF9500' : '#007AFF';
        btn.innerHTML = active
            ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="${color}" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17.27L18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 13.97 5.82 21z"></path></svg>`
            : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17.27L18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 13.97 5.82 21z"></path></svg>`;
    },

    toggleDetailFavorite() {
        const item = this.state.detailCurrentItem;
        if (!item || !item.id) {
            this.showToast('暂无可收藏内容');
            return;
        }
        const list = this.getFavoriteItems();
        const id = String(item.id);
        const idx = list.findIndex(x => String(x.id || '') === id);
        if (idx >= 0) {
            list.splice(idx, 1);
            this.saveFavoriteItems(list);
            this.updateDetailFavoriteButton(item);
            this.showToast('已取消收藏');
            return;
        }
        list.unshift(this.normalizeFavoriteItem(item));
        this.saveFavoriteItems(list.slice(0, 500));
        this.updateDetailFavoriteButton(item);
        this.showToast('已加入收藏');
    },

    getFaceLoginEnabled() {
        return (this.safeStorageGet('br_face_login_enabled') || '').trim() === '1';
    },

    setFaceLoginEnabled(enabled) {
        this.safeStorageSet('br_face_login_enabled', enabled ? '1' : '0');
    },

    encodeFaceCredential(payload = {}) {
        try {
            return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
        } catch (e) {
            return '';
        }
    },

    decodeFaceCredential(encoded = '') {
        try {
            if (!encoded) return null;
            const raw = decodeURIComponent(escape(atob(String(encoded))));
            const obj = JSON.parse(raw);
            return obj && typeof obj === 'object' ? obj : null;
        } catch (e) {
            return null;
        }
    },

    cacheFaceLoginCredential(username = '', password = '') {
        const u = String(username || '').trim();
        const p = String(password || '');
        if (!u || !p) return;
        const packed = this.encodeFaceCredential({ username: u, password: p, at: Date.now() });
        if (!packed) return;
        this.safeStorageSet('br_face_login_cred_v1', packed);
    },

    getCachedFaceLoginCredential(username = '') {
        const packed = this.safeStorageGet('br_face_login_cred_v1');
        const obj = this.decodeFaceCredential(packed);
        if (!obj) return null;
        const u = String(obj.username || '').trim();
        const p = String(obj.password || '');
        if (!u || !p) return null;
        if (username && String(username).trim() !== u) return null;
        return { username: u, password: p };
    },

    hasFaceAuthPlugin() {
        const p = window.Capacitor && window.Capacitor.Plugins ? window.Capacitor.Plugins.FaceAuthPlugin : null;
        return !!(p && typeof p.isAvailable === 'function' && typeof p.authenticate === 'function');
    },

    async getFaceAuthAvailability() {
        if (!this.hasFaceAuthPlugin()) return { available: false, reason: 'plugin-missing' };
        try {
            const p = window.Capacitor.Plugins.FaceAuthPlugin;
            const ret = await p.isAvailable();
            return { available: !!(ret && ret.available), type: String((ret && ret.biometryType) || '') };
        } catch (e) {
            return { available: false, reason: 'plugin-error' };
        }
    },

    async faceAuthAuthenticate(reason = '请进行面容认证') {
        if (!this.hasFaceAuthPlugin()) return false;
        try {
            const p = window.Capacitor.Plugins.FaceAuthPlugin;
            const ret = await p.authenticate({ reason });
            return !!(ret && ret.success);
        } catch (e) {
            return false;
        }
    },

    getFaceApiCandidates(kind = 'login') {
        const isBind = kind === 'bind';
        const cfg = this.state.runtimeConfig || {};
        const flags = cfg['feature.flags'] || {};
        const copyAuth = cfg['copy.auth'] || {};
        const fromConfig = [];
        const addConfig = (v) => {
            if (!v) return;
            if (Array.isArray(v)) {
                v.forEach(x => addConfig(x));
                return;
            }
            const s = String(v || '').trim();
            if (s) fromConfig.push(s);
        };
        const scanRuntime = (obj, depth = 0) => {
            if (!obj || typeof obj !== 'object' || depth > 4) return;
            for (const [k, v] of Object.entries(obj)) {
                if (v == null) continue;
                const key = String(k || '').toLowerCase();
                if (typeof v === 'string') {
                    const val = String(v || '').trim();
                    const low = val.toLowerCase();
                    const keyHit = key.includes('face') || key.includes('biometric') || key.includes('bio');
                    const kindHit = isBind ? (key.includes('bind') || low.includes('bind')) : (key.includes('login') || key.includes('signin') || low.includes('login') || low.includes('signin'));
                    const valHit = low.includes('/face') || low.includes('/biometric') || low.includes('/bio');
                    if (val && (keyHit || valHit) && kindHit) addConfig(val);
                } else if (Array.isArray(v)) {
                    v.forEach(x => addConfig(x));
                } else if (typeof v === 'object') {
                    scanRuntime(v, depth + 1);
                }
            }
        };
        const normalizePath = (p) => {
            const s = String(p || '').trim();
            if (!s) return '';
            if (/^https?:\/\//i.test(s)) return s;
            return s.startsWith('/') ? s : `/${s}`;
        };
        addConfig(isBind ? flags.faceBindPath : flags.faceLoginPath);
        addConfig(isBind ? flags.faceBindPaths : flags.faceLoginPaths);
        addConfig(isBind ? copyAuth.faceBindPath : copyAuth.faceLoginPath);
        addConfig(isBind ? copyAuth.faceBindPaths : copyAuth.faceLoginPaths);
        scanRuntime(cfg);
        const defaults = isBind
            ? ['/api/auth/face/bind', '/api/auth/biometric/bind', '/api/auth/faceBind', '/api/auth/biometricBind', '/api/member/face/bind', '/api/member/biometric/bind', '/api/member/faceBind', '/api/member/biometricBind', '/api/auth/face-bind', '/api/auth/biometric-bind']
            : ['/api/auth/face/login', '/api/auth/biometric/login', '/api/auth/faceLogin', '/api/auth/biometricLogin', '/api/member/face/login', '/api/member/biometric/login', '/api/member/faceLogin', '/api/member/biometricLogin', '/api/auth/face-signin', '/api/auth/biometric-signin'];
        return Array.from(new Set([...fromConfig, ...defaults].map(normalizePath).filter(Boolean)));
    },

    buildApiUrl(apiBase, path) {
        const p = String(path || '').trim();
        if (!p) return '';
        if (/^https?:\/\//i.test(p)) return p;
        return `${apiBase}${p.startsWith('/') ? p : `/${p}`}`;
    },

    extractAuthPayload(json = null) {
        const raw = json || {};
        const token = raw.token || (raw.data && raw.data.token) || (raw.result && raw.result.token) || '';
        const user = raw.user || (raw.data && raw.data.user) || (raw.result && raw.result.user) || null;
        return { token: String(token || ''), user };
    },

    async bindFaceLoginIfPossible(username = '') {
        const apiBase = this.getApiBase();
        if (!apiBase || !this.getAuthToken()) return;
        const candidates = this.getFaceApiCandidates('bind');
        for (const path of candidates) {
            try {
                const body = { username, account: username, userName: username };
                const url = this.buildApiUrl(apiBase, path);
                const res = await this.requestJson(url, { method: 'POST', body });
                if (res && res.ok) return;
                if (res && res.status && res.status !== 404) return;
            } catch (e) {}
        }
    },

    async toggleFaceLoginSetting(checked) {
        const enabled = !!checked;
        const checkbox = document.querySelector('#member-settings-modal input[type="checkbox"]');
        if (!enabled) {
            this.setFaceLoginEnabled(false);
            this.showToast('面容认证登录已关闭');
            if ((this.state.authMode || 'login') === 'login') this.switchAuthMode('login');
            return;
        }
        if (!this.isNativeAppRuntime()) {
            this.setFaceLoginEnabled(false);
            if (checkbox) checkbox.checked = false;
            this.showToast('仅App内支持面容认证');
            return;
        }
        const cap = await this.getFaceAuthAvailability();
        if (!cap.available) {
            this.setFaceLoginEnabled(false);
            if (checkbox) checkbox.checked = false;
            this.showToast('当前设备不可用面容认证');
            return;
        }
        const ok = await this.faceAuthAuthenticate('开启面容认证登录');
        if (!ok) {
            this.setFaceLoginEnabled(false);
            if (checkbox) checkbox.checked = false;
            this.showToast('面容认证未通过');
            return;
        }
        this.setFaceLoginEnabled(true);
        const remembered = String((this.state.user && this.state.user.username) || '').trim();
        if (remembered) this.safeStorageSet('br_face_login_username', remembered);
        await this.bindFaceLoginIfPossible(remembered);
        this.showToast('面容认证登录已开启');
        if ((this.state.authMode || 'login') === 'login') this.switchAuthMode('login');
    },

    openMemberSettings() {
        const oldModal = document.getElementById('member-settings-modal');
        const oldMask = document.getElementById('member-settings-mask');
        if (oldModal) oldModal.remove();
        if (oldMask) oldMask.remove();
        const faceEnabled = this.getFaceLoginEnabled();
        const arrow = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#B1B1B1" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';
        const icon = {
            favorite: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#141414" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17.27L18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 13.97 5.82 21z"></path></svg>',
            orders: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#141414" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="17" rx="2"></rect><path d="M8 9h8"></path><path d="M8 13h8"></path><path d="M8 17h5"></path></svg>',
            face: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#141414" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3H5a2 2 0 0 0-2 2v2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path><path d="M17 21h2a2 2 0 0 0 2-2v-2"></path><path d="M9 10h.01"></path><path d="M15 10h.01"></path><path d="M9.5 15a3.5 3.5 0 0 0 5 0"></path></svg>',
            password: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#141414" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><path d="M7 11V8a5 5 0 0 1 10 0v3"></path><circle cx="12" cy="16" r="1"></circle></svg>',
            profile: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#141414" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21a8 8 0 1 0-16 0"></path><circle cx="12" cy="7" r="4"></circle></svg>',
            logout: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>'
        };
        const user = this.state.user || {};
        const completion = user.profileCompletion || {};
        const completedCount = Number(completion.completedCount || 0);
        const totalRequired = Number(completion.totalRequired || 6) || 6;
        const rewardGranted = !!completion.rewardGranted;
        const freeDays = Number((user.profileRewardConfig && user.profileRewardConfig.freeToCityDays) || 15);
        const paidDays = Number((user.profileRewardConfig && user.profileRewardConfig.paidExtendDays) || 30);
        const level = String(user.vipLevel || 'free');
        const levelName = level === 'city' ? '城市会员' : (level === 'province' ? '省级会员' : (level === 'country' ? '全国会员' : '免费会员'));
        const rewardTip = rewardGranted
            ? '资料奖励已领取'
            : (level === 'free' ? `补全资料可得：${freeDays}天城市会员权益` : `补全资料可得：${levelName}权益延长${paidDays}天`);
        const html = `
            <div id="member-settings-mask" onclick="closeMemberSettings()" style="position:absolute; inset:0; background:rgba(8,10,18,0.56); z-index:310; opacity:0; transition:opacity .22s;"></div>
            <div id="member-settings-modal" style="position:absolute; top:0; right:0; width:78%; max-width:372px; height:100%; background:#f5f6f8; z-index:320; border-top-left-radius:22px; border-bottom-left-radius:22px; overflow-y:auto; -webkit-overflow-scrolling:touch; transform:translateX(100%); transition:transform .24s;">
                <div style="height: calc(max(env(safe-area-inset-top), 20px) + 18px);"></div>
                <div style="margin:0 12px 12px; background:#fff; border-radius:16px; padding:14px 14px 12px; box-shadow:0 4px 14px rgba(0,0,0,0.035);">
                    <div style="height:42px; border-radius:21px; background:#0A0A0A; display:flex; align-items:center; justify-content:center; gap:8px; color:#E8FFE9;">
                        <span style="width:14px;height:14px;border:2px solid #34C759;border-radius:50%; display:inline-block;"></span>
                        <span style="font-size:14px; font-weight:600;">Member Settings</span>
                    </div>
                    <div style="display:flex; align-items:center; justify-content:space-between; margin-top:10px;">
                        <div style="font-size:14px; color:#222; font-weight:600;">${user.username || '会员用户'}</div>
                        <button onclick="closeMemberSettings()" style="border:none; background:#f2f3f5; color:#666; width:30px; height:30px; border-radius:50%;">×</button>
                    </div>
                </div>
                <div style="margin:0 12px 12px; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 14px rgba(0,0,0,0.035);">
                    <div style="padding:10px 14px 2px; font-size:11px; color:#9c9c9c;">账户功能</div>
                    <div onclick="openMyFavorites()" style="display:flex; align-items:center; justify-content:space-between; padding:11px 12px;">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <div style="width:24px; height:24px; display:flex; align-items:center; justify-content:center;">${icon.favorite}</div>
                            <span style="font-size:15px; line-height:1.25; color:#111; font-weight:500;">我的收藏</span>
                        </div>
                        ${arrow}
                    </div>
                    <div style="height:1px;background:#f0f0f0;margin:0 12px;"></div>
                    <div onclick="openMyOrders()" style="display:flex; align-items:center; justify-content:space-between; padding:11px 12px;">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <div style="width:24px; height:24px; display:flex; align-items:center; justify-content:center;">${icon.orders}</div>
                            <span style="font-size:15px; line-height:1.25; color:#111; font-weight:500;">我的订单</span>
                        </div>
                        ${arrow}
                    </div>
                </div>
                <div style="margin:0 12px 12px; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 14px rgba(0,0,0,0.035);">
                    <div style="padding:10px 14px 2px; font-size:11px; color:#9c9c9c;">资料奖励</div>
                    <div onclick="openProfileRewardModal()" style="display:flex; align-items:center; justify-content:space-between; padding:11px 12px;">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <div style="width:24px; height:24px; display:flex; align-items:center; justify-content:center;">${icon.profile}</div>
                            <div style="display:flex; flex-direction:column; gap:2px;">
                                <span style="font-size:15px; line-height:1.25; color:#111; font-weight:500;">完善资料领取奖励</span>
                                <span style="font-size:12px; color:#8E8E93;">已完成 ${completedCount}/${totalRequired} 项 · ${rewardTip}</span>
                            </div>
                        </div>
                        ${arrow}
                    </div>
                </div>
                <div style="margin:0 12px 12px; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 14px rgba(0,0,0,0.035);">
                    <div style="padding:10px 14px 2px; font-size:11px; color:#9c9c9c;">登录安全</div>
                    <div style="display:flex; align-items:center; justify-content:space-between; padding:11px 12px;">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <div style="width:24px; height:24px; display:flex; align-items:center; justify-content:center;">${icon.face}</div>
                            <span style="font-size:15px; line-height:1.25; color:#111; font-weight:500;">面容认证登录</span>
                        </div>
                        <label class="switch" style="transform: scale(0.75); transform-origin: right center;">
                            <input type="checkbox" ${faceEnabled ? 'checked' : ''} onchange="toggleFaceLoginSetting(this.checked)">
                            <span class="slider round"></span>
                        </label>
                    </div>
                    <div style="height:1px;background:#f0f0f0;margin:0 12px;"></div>
                    <div onclick="openChangePasswordModal()" style="display:flex; align-items:center; justify-content:space-between; padding:11px 12px;">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <div style="width:24px; height:24px; display:flex; align-items:center; justify-content:center;">${icon.password}</div>
                            <span style="font-size:15px; line-height:1.25; color:#111; font-weight:500;">修改登录密码</span>
                        </div>
                        ${arrow}
                    </div>
                </div>
                <div style="margin:0 12px 16px; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 14px rgba(0,0,0,0.035);">
                    <div onclick="handleMemberSettingsLogout()" style="display:flex; align-items:center; justify-content:space-between; padding:11px 12px;">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <div style="width:24px; height:24px; display:flex; align-items:center; justify-content:center;">${icon.logout}</div>
                            <span style="font-size:15px; line-height:1.25; color:#FF3B30; font-weight:500;">退出登录</span>
                        </div>
                        ${arrow}
                    </div>
                </div>
            </div>
        `;
        const container = document.querySelector('.iphone-frame') || document.body;
        container.insertAdjacentHTML('beforeend', html);
        const panel = document.getElementById('member-settings-modal');
        const mask = document.getElementById('member-settings-mask');
        requestAnimationFrame(() => {
            if (panel) panel.style.transform = 'translateX(0)';
            if (mask) mask.style.opacity = '1';
        });
    },

    closeMemberSettings() {
        const modal = document.getElementById('member-settings-modal');
        const mask = document.getElementById('member-settings-mask');
        if (modal) modal.style.transform = 'translateX(100%)';
        if (mask) mask.style.opacity = '0';
        setTimeout(() => {
            if (modal) modal.remove();
            if (mask) mask.remove();
        }, 240);
    },

    openChangePasswordModal() {
        this.closeMemberSettings();
        const oldModal = document.getElementById('change-password-modal');
        const oldMask = document.getElementById('change-password-mask');
        if (oldModal) oldModal.remove();
        if (oldMask) oldMask.remove();
        const html = `
            <div id="change-password-mask" class="city-modal-mask" onclick="closeChangePasswordModal()" style="display:block;z-index:9998;"></div>
            <div id="change-password-modal" class="city-modal" style="display:flex;z-index:9999;">
                <div class="city-header" style="position:relative;">
                    <span class="nav-title" style="position:absolute;left:50%;transform:translateX(-50%);">修改登录密码</span>
                    <span class="nav-right" onclick="closeChangePasswordModal()" style="position:static;margin-left:auto;">✕</span>
                </div>
                <div class="list-container" style="padding:16px;background:#F2F2F7;">
                    <div style="margin:0 0 12px; background:#fff; border-radius:12px; padding:14px;">
                        <div style="font-size:13px; color:#8E8E93; margin-bottom:10px;">请输入旧密码与新密码</div>
                        <input id="pwd-old" type="password" placeholder="旧密码" style="width:100%; box-sizing:border-box; border:1px solid #E5E5EA; border-radius:10px; padding:12px; font-size:15px; margin-bottom:10px;">
                        <input id="pwd-new" type="password" placeholder="新密码（6-64位）" style="width:100%; box-sizing:border-box; border:1px solid #E5E5EA; border-radius:10px; padding:12px; font-size:15px; margin-bottom:10px;">
                        <input id="pwd-new2" type="password" placeholder="确认新密码" style="width:100%; box-sizing:border-box; border:1px solid #E5E5EA; border-radius:10px; padding:12px; font-size:15px;">
                    </div>
                    <button id="btn-submit-password" onclick="submitChangePassword()" style="width:100%; border:none; border-radius:12px; padding:13px 12px; background:#007AFF; color:#fff; font-size:16px; font-weight:600;">确认修改</button>
                </div>
            </div>
        `;
        const container = document.querySelector('.iphone-frame') || document.body;
        container.insertAdjacentHTML('beforeend', html);
    },

    closeChangePasswordModal() {
        const modal = document.getElementById('change-password-modal');
        const mask = document.getElementById('change-password-mask');
        if (modal) modal.remove();
        if (mask) mask.remove();
    },

    openProfileRewardModal() {
        this.closeMemberSettings();
        const oldModal = document.getElementById('profile-reward-modal');
        const oldMask = document.getElementById('profile-reward-mask');
        if (oldModal) oldModal.remove();
        if (oldMask) oldMask.remove();
        const u = this.state.user || {};
        const draft = this.loadLocalProfileDraft(u);
        const completion = u.profileCompletion || {};
        const completedCount = Number(completion.completedCount || 0);
        const totalRequired = Number(completion.totalRequired || 6) || 6;
        const rewardGranted = !!completion.rewardGranted;
        const freeDays = Number((u.profileRewardConfig && u.profileRewardConfig.freeToCityDays) || 15);
        const paidDays = Number((u.profileRewardConfig && u.profileRewardConfig.paidExtendDays) || 30);
        const level = String(u.vipLevel || 'free');
        const levelName = level === 'city' ? '城市会员' : (level === 'province' ? '省级会员' : (level === 'country' ? '全国会员' : '免费会员'));
        const rewardText = level === 'free'
            ? `当前账号为免费会员，补全后可得${freeDays}天城市会员权益`
            : `当前账号为${levelName}，补全后可得同级权益延长${paidDays}天`;
        const html = `
            <div id="profile-reward-mask" class="city-modal-mask" onclick="closeProfileRewardModal()" style="display:block;z-index:9998;"></div>
            <div id="profile-reward-modal" class="city-modal" style="display:flex;z-index:9999;">
                <div class="city-header" style="position:relative;">
                    <span class="nav-title" style="position:absolute;left:50%;transform:translateX(-50%);">完善资料领奖励</span>
                    <span class="nav-right" onclick="closeProfileRewardModal()" style="position:static;margin-left:auto;">✕</span>
                </div>
                <div class="list-container" style="padding:16px;background:#F2F2F7;">
                    <div style="background:#fff8ef;border:1px solid #ffe2be;color:#8a5200;border-radius:12px;padding:10px 12px;font-size:12px;line-height:1.5;margin-bottom:12px;">${rewardText}</div>
                    <div style="background:#fff;border-radius:12px;padding:12px;margin-bottom:12px;">
                        <div style="font-size:13px;color:#8E8E93;margin-bottom:8px;">资料进度：${completedCount}/${totalRequired}${rewardGranted ? '（已领奖）' : ''}</div>
                        <input id="pr-company" type="text" placeholder="企业全名" value="${String(u.companyName || draft.companyName || '').replace(/"/g, '&quot;')}" style="width:100%; box-sizing:border-box; border:1px solid #E5E5EA; border-radius:10px; padding:12px; font-size:15px; margin-bottom:10px;">
                        <input id="pr-realname" type="text" placeholder="姓名" value="${String(u.realName || draft.realName || '').replace(/"/g, '&quot;')}" style="width:100%; box-sizing:border-box; border:1px solid #E5E5EA; border-radius:10px; padding:12px; font-size:15px; margin-bottom:10px;">
                        <input id="pr-position" type="text" placeholder="职位" value="${String(u.positionTitle || draft.positionTitle || '').replace(/"/g, '&quot;')}" style="width:100%; box-sizing:border-box; border:1px solid #E5E5EA; border-radius:10px; padding:12px; font-size:15px; margin-bottom:10px;">
                        <input id="pr-phone" type="tel" placeholder="手机" value="${String(u.phone || draft.phone || '').replace(/"/g, '&quot;')}" style="width:100%; box-sizing:border-box; border:1px solid #E5E5EA; border-radius:10px; padding:12px; font-size:15px; margin-bottom:10px;">
                        <input id="pr-email" type="email" placeholder="邮箱" value="${String(u.email || draft.email || '').replace(/"/g, '&quot;')}" style="width:100%; box-sizing:border-box; border:1px solid #E5E5EA; border-radius:10px; padding:12px; font-size:15px; margin-bottom:10px;">
                        <input id="pr-wechat" type="text" placeholder="微信号" value="${String(u.wechatId || draft.wechatId || '').replace(/"/g, '&quot;')}" style="width:100%; box-sizing:border-box; border:1px solid #E5E5EA; border-radius:10px; padding:12px; font-size:15px;">
                    </div>
                    <button id="btn-submit-profile-reward" onclick="submitProfileReward()" style="width:100%; border:none; border-radius:12px; padding:13px 12px; background:#007AFF; color:#fff; font-size:16px; font-weight:600;">保存并领取奖励</button>
                </div>
            </div>
        `;
        const container = document.querySelector('.iphone-frame') || document.body;
        container.insertAdjacentHTML('beforeend', html);
    },

    closeProfileRewardModal() {
        const modal = document.getElementById('profile-reward-modal');
        const mask = document.getElementById('profile-reward-mask');
        if (modal) modal.remove();
        if (mask) mask.remove();
    },

    async submitProfileReward() {
        const companyName = String((document.getElementById('pr-company') || {}).value || '').trim();
        const realName = String((document.getElementById('pr-realname') || {}).value || '').trim();
        const positionTitle = String((document.getElementById('pr-position') || {}).value || '').trim();
        const phone = String((document.getElementById('pr-phone') || {}).value || '').trim();
        const email = String((document.getElementById('pr-email') || {}).value || '').trim();
        const wechatId = String((document.getElementById('pr-wechat') || {}).value || '').trim();
        const localDraft = { companyName, realName, positionTitle, phone, email, wechatId };
        const btn = document.getElementById('btn-submit-profile-reward');
        if (!companyName || !realName || !positionTitle || !phone || !email || !wechatId) {
            this.showToast('请补全六项资料');
            return;
        }
        if (!/^1\d{10}$/.test(phone)) {
            this.showToast('手机号格式不正确');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            this.showToast('邮箱格式不正确');
            return;
        }
        const apiBase = this.getApiBase();
        if (!apiBase || !this.getAuthToken()) {
            this.showToast('请先登录');
            return;
        }
        if (btn) {
            btn.disabled = true;
            btn.style.opacity = '0.68';
            btn.textContent = '提交中...';
        }
        try {
            Object.assign(this.state.user || {}, localDraft);
            this.saveUser();
            this.saveLocalProfileDraft(localDraft, this.state.user);
            const candidates = [
                { method: 'PUT', url: `${apiBase}/api/member/profile`, body: { companyName, realName, positionTitle, phone, email, wechatId } },
                { method: 'POST', url: `${apiBase}/api/member/profile`, body: { companyName, realName, positionTitle, phone, email, wechatId } },
                { method: 'PUT', url: `${apiBase}/api/member/profile`, body: { company_name: companyName, real_name: realName, position_title: positionTitle, phone, email, wechat_id: wechatId } },
                { method: 'POST', url: `${apiBase}/api/member/profile`, body: { company_name: companyName, real_name: realName, position_title: positionTitle, phone, email, wechat_id: wechatId } },
            ];
            let res = null;
            let finalJson = null;
            let ok = false;
            let failMsg = '';
            for (const req of candidates) {
                const cur = await this.requestJson(req.url, { method: req.method, body: req.body });
                if (!cur || !cur.json) continue;
                res = cur;
                finalJson = cur.json;
                const curMsg = String((cur.json && (cur.json.msg || cur.json.message || cur.json.error)) || '').trim();
                if (curMsg) failMsg = curMsg;
                if (cur.ok && (cur.json.code === 1 || cur.json.success === true)) {
                    ok = true;
                    break;
                }
                if (cur.status === 400 || cur.status === 401 || cur.status === 403 || cur.status === 422) {
                    break;
                }
            }
            if (!ok) {
                this.applyServerUser(localDraft);
                this.showToast(failMsg || '服务器暂未完成资料接口升级，已本地保存');
                return;
            }
            const d = Object.assign({}, (finalJson && finalJson.data) || {}, localDraft);
            if (!d.profileCompletion) {
                d.profileCompletion = {
                    completedCount: 6,
                    totalRequired: 6,
                    isCompleted: true,
                    rewardGranted: false,
                    rewardGrantedAt: ''
                };
            }
            this.applyServerUser(d);
            await this.syncMemberFromServer();
            const completionNow = ((this.state.user || {}).profileCompletion) || {};
            const needsRewardClaim = !!(completionNow.isCompleted && !completionNow.rewardGranted);
            if (needsRewardClaim) {
                const claimRes = await this.requestJson(`${apiBase}/api/member/profile/reward`, { method: 'POST', body: {} });
                if (claimRes && claimRes.ok && claimRes.json && (claimRes.json.code === 1 || claimRes.json.success === true)) {
                    this.applyServerUser((claimRes.json && claimRes.json.data) || {});
                    await this.syncMemberFromServer();
                }
            }
            this.switchTab(2);
            this.showToast(String((finalJson && (finalJson.msg || finalJson.message)) || '资料已保存'));
            this.closeProfileRewardModal();
        } catch (e) {
            this.applyServerUser(localDraft);
            this.showToast('网络异常，已先本地保存');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.textContent = '保存并领取奖励';
            }
        }
    },

    async submitChangePassword() {
        const oldInput = document.getElementById('pwd-old');
        const newInput = document.getElementById('pwd-new');
        const new2Input = document.getElementById('pwd-new2');
        const btn = document.getElementById('btn-submit-password');
        const oldPassword = String((oldInput && oldInput.value) || '').trim();
        const newPassword = String((newInput && newInput.value) || '').trim();
        const newPassword2 = String((new2Input && new2Input.value) || '').trim();
        if (!oldPassword || !newPassword || !newPassword2) {
            this.showToast('请填写完整信息');
            return;
        }
        if (newPassword.length < 6 || newPassword.length > 64) {
            this.showToast('新密码长度需为6-64位');
            return;
        }
        if (newPassword !== newPassword2) {
            this.showToast('两次输入的新密码不一致');
            return;
        }
        if (oldPassword === newPassword) {
            this.showToast('新密码不能与旧密码相同');
            return;
        }
        const apiBase = this.getApiBase();
        if (!apiBase || !this.getAuthToken()) {
            this.showToast('请先登录');
            return;
        }
        if (btn) {
            btn.disabled = true;
            btn.style.opacity = '0.68';
            btn.textContent = '提交中...';
        }
        try {
            const candidates = [
                `${apiBase}/api/member/change-password`,
                `${apiBase}/api/auth/change-password`,
            ];
            let lastJson = null;
            let ok = false;
            for (const url of candidates) {
                const res = await this.requestJson(url, {
                    method: 'POST',
                    body: JSON.stringify({ oldPassword, newPassword }),
                });
                if (!res || !res.ok || !res.json) continue;
                lastJson = res.json;
                if (res.json.code === 1 || res.json.success === true) {
                    ok = true;
                    break;
                }
            }
            if (!ok) {
                const msg = (lastJson && (lastJson.msg || lastJson.message)) ? String(lastJson.msg || lastJson.message) : '暂不支持在线改密，请联系管理员';
                this.showToast(msg);
                return;
            }
            const username = String((this.state.user && this.state.user.username) || '').trim();
            if (username) this.cacheFaceLoginCredential(username, newPassword);
            this.showToast('密码修改成功');
            this.closeChangePasswordModal();
        } catch (e) {
            this.showToast('修改失败，请稍后重试');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.textContent = '确认修改';
            }
        }
    },

    handleMemberSettingsLogout() {
        this.closeMemberSettings();
        this.logout();
    },

    openMyFavorites() {
        this.closeMemberSettings();
        const oldModal = document.getElementById('favorite-modal');
        const oldMask = document.getElementById('favorite-mask');
        if (oldModal) oldModal.remove();
        if (oldMask) oldMask.remove();
        const rows = this.getFavoriteItems();
        const cards = rows.length ? rows.map((item) => {
            const time = this.formatTime(item.datetime, item.datetime_ts);
            const price = this.normalizeBidPriceText(item.bid_price || item.bidPrice || '') || '未公示金额';
            const tagClass = this.getTagClass(item.types || '公告');
            const itemStr = encodeURIComponent(JSON.stringify(item)).replace(/'/g, "%27");
            return `
                <div class="card" style="margin:12px 12px 0 12px;" onclick="closeMyFavorites(); showDetail('${itemStr}')">
                    <div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:8px;">
                        <div style="font-size:13px;color:#FF3B30;font-weight:600;">${price}</div>
                        <div style="font-size:12px;color:#8E8E93;white-space:nowrap;">${time}</div>
                    </div>
                    <div style="line-height:1.45;color:#1C1C1E;font-size:14px;">
                        ${item.title || '无标题'}
                        <span class="tag-new" style="background:${tagClass.bg};color:${tagClass.text};margin-left:4px;vertical-align:1px;">${item.types || '公告'}</span>
                    </div>
                    <div style="margin-top:8px;font-size:12px;color:#8E8E93;">${item.city || ''}${item.purchaser ? ` · ${item.purchaser}` : ''}</div>
                </div>
            `;
        }).join('') : `<div style="padding:48px 16px;text-align:center;color:#8E8E93;font-size:14px;">暂无收藏内容</div>`;
        const html = `
            <div id="favorite-mask" class="city-modal-mask" onclick="closeMyFavorites()" style="display:block;z-index:9998;"></div>
            <div id="favorite-modal" class="city-modal" style="display:flex;z-index:9999;">
                <div class="city-header" style="position:relative;">
                    <span class="nav-title" style="position:absolute;left:50%;transform:translateX(-50%);">我的收藏</span>
                    <span class="nav-right" onclick="closeMyFavorites()" style="position:static;margin-left:auto;">✕</span>
                </div>
                <div class="list-container" style="padding-bottom:26px;background:#F2F2F7;">${cards}</div>
            </div>
        `;
        const container = document.querySelector('.iphone-frame') || document.body;
        container.insertAdjacentHTML('beforeend', html);
    },

    closeMyFavorites() {
        const modal = document.getElementById('favorite-modal');
        const mask = document.getElementById('favorite-mask');
        if (modal) modal.remove();
        if (mask) mask.remove();
    },

    async openMyOrders() {
        this.closeMemberSettings();
        const oldModal = document.getElementById('order-modal');
        const oldMask = document.getElementById('order-mask');
        if (oldModal) oldModal.remove();
        if (oldMask) oldMask.remove();
        const container = document.querySelector('.iphone-frame') || document.body;
        const html = `
            <div id="order-mask" class="city-modal-mask" onclick="closeMyOrders()" style="display:block;z-index:9998;"></div>
            <div id="order-modal" class="city-modal" style="display:flex;z-index:9999;">
                <div class="city-header" style="position:relative;">
                    <span class="nav-title" style="position:absolute;left:50%;transform:translateX(-50%);">我的订单</span>
                    <span class="nav-right" onclick="closeMyOrders()" style="position:static;margin-left:auto;">✕</span>
                </div>
                <div class="list-container" id="order-list" style="padding:16px 0 24px;background:#F2F2F7;">
                    <div style="padding:40px 16px;text-align:center;color:#8E8E93;font-size:14px;">雷达扫描中...</div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
        const host = document.getElementById('order-list');
        const apiBase = this.getApiBase();
        if (!apiBase || !this.getAuthToken()) {
            if (host) host.innerHTML = `<div style="padding:40px 16px;text-align:center;color:#8E8E93;font-size:14px;">请先登录后查看订单</div>`;
            return;
        }
        try {
            const res = await this.requestJson(`${apiBase}/api/member/orders?page=1&pageSize=50`);
            const rows = (res && res.ok && res.json && res.json.code === 1 && res.json.data && Array.isArray(res.json.data.rows)) ? res.json.data.rows : [];
            if (!rows.length) {
                if (host) host.innerHTML = `<div style="padding:40px 16px;text-align:center;color:#8E8E93;font-size:14px;">暂无订单记录</div>`;
                return;
            }
            const planText = (code) => code === 'country' ? '全国会员' : (code === 'province' ? '省级会员' : (code === 'city' ? '城市会员' : '会员'));
            const statusText = (s) => s === 'fulfilled' ? '已生效' : (s === 'paid' ? '已支付' : (s === 'pending' ? '处理中' : s || '未知'));
            const cards = rows.map((r) => {
                const dt = r.createdAt ? new Date(r.createdAt) : null;
                const time = dt && !isNaN(dt.getTime()) ? `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')} ${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}` : '-';
                return `
                    <div class="card" style="margin:0 12px 12px 12px;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                            <div style="font-size:14px;color:#1C1C1E;font-weight:600;">${planText(String(r.planCode || ''))}</div>
                            <div style="font-size:12px;color:${String(r.status || '') === 'fulfilled' ? '#34C759' : '#FF9500'};">${statusText(String(r.status || ''))}</div>
                        </div>
                        <div style="font-size:12px;color:#8E8E93;line-height:1.6;">
                            <div>订单号：${String(r.orderNo || '-')}</div>
                            <div>金额：¥${Number(r.amountYuan || 0).toFixed(2)}</div>
                            <div>范围：${String(r.scopeValue || '全国')}</div>
                            <div>时间：${time}</div>
                        </div>
                    </div>
                `;
            }).join('');
            if (host) host.innerHTML = cards;
        } catch (e) {
            if (host) host.innerHTML = `<div style="padding:40px 16px;text-align:center;color:#8E8E93;font-size:14px;">订单加载失败，请稍后重试</div>`;
        }
    },

    closeMyOrders() {
        const modal = document.getElementById('order-modal');
        const mask = document.getElementById('order-mask');
        if (modal) modal.remove();
        if (mask) mask.remove();
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
        this.state.detailCurrentItem = null;
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
        const matrix = this.getMemberPermissionMatrix();
        
        let limit = Math.max(0, Number(matrix.free.keywordLimit || 1));
        if (level === 'city') limit = Math.max(0, Number(matrix.city.keywordLimit || 10));
        else if (level === 'province') limit = Math.max(0, Number(matrix.province.keywordLimit || 50));
        else if (level === 'country') limit = Math.max(0, Number(matrix.country.keywordLimit || 200));
        
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
        const getMatchedKeywords = (item) => {
            const title = String((item && item.title) || '').toLowerCase();
            if (!title) return [];
            return keywords.filter(kw => title.includes(String(kw || '').toLowerCase()));
        };
        const titleMatched = (item) => {
            return getMatchedKeywords(item).length > 0;
        };
        const inScope = (item) => {
            if (sub.scopeType === 'city' && sub.scopeValue) {
                return item.city && item.city.includes(sub.scopeValue);
            }
            if (sub.scopeType === 'province' && sub.scopeValue) {
                const pv = this.getProvinceForCity(item && item.city) || '';
                return pv === sub.scopeValue;
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
                        if (titleMatched(item) && inScope(item)) {
                            const matchedKeywords = getMatchedKeywords(item);
                            itemMap.set(item.id, { ...item, _matchedKeywords: matchedKeywords });
                        }
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
                const matched = titleMatched(item);
                if (!matched) return false;
                if (sub.scopeType === 'city' && sub.scopeValue) return item.city && item.city.includes(sub.scopeValue);
                if (sub.scopeType === 'province' && sub.scopeValue) {
                    const pv = this.getProvinceForCity(item && item.city) || '';
                    return pv === sub.scopeValue;
                }
                return true;
            }).map(item => ({ ...item, _matchedKeywords: getMatchedKeywords(item) }));
            fallback.sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
            return fallback.slice(0, limit);
        }
    },

    escapeRegexLiteral(text) {
        return String(text || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    highlightTitleKeywords(title, keywords = []) {
        let html = String(title || '');
        const list = Array.from(new Set((keywords || []).map(k => String(k || '').trim()).filter(Boolean)))
            .sort((a, b) => b.length - a.length);
        for (const kw of list) {
            const reg = new RegExp(this.escapeRegexLiteral(kw), 'ig');
            html = html.replace(reg, (m) => `<span style="background:#FFF3A3;color:#1f2328;border-radius:3px;padding:0 2px;">${m}</span>`);
        }
        return html;
    },

    getItemTimeMs(item) {
        const rawTs = Number(item && item.datetime_ts);
        if (Number.isFinite(rawTs) && rawTs > 0) {
            return rawTs < 10000000000 ? rawTs * 1000 : rawTs;
        }
        const dt = this.parseDate(item && item.datetime);
        if (!dt || isNaN(dt.getTime())) return 0;
        return dt.getTime();
    },

    getSubReadIdSet(sub) {
        const arr = Array.isArray(sub && sub.readItemIds) ? sub.readItemIds : [];
        return new Set(arr.map(x => String(x)).filter(Boolean));
    },

    isSubItemUnread(sub, item) {
        const itemId = String((item && item.id) || '').trim();
        const readSet = this.getSubReadIdSet(sub);
        if (itemId && readSet.has(itemId)) return false;
        const lastReadAt = Number((sub && sub.lastReadAt) || 0);
        if (!lastReadAt) return true;
        const ts = this.getItemTimeMs(item);
        if (!ts) return true;
        return ts > lastReadAt;
    },

    async fetchSubUnreadCount(sub) {
        const items = await this.querySubItems(sub, 300, 30);
        return items.filter(item => this.isSubItemUnread(sub, item)).length;
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
        const headerTitle = user.isLogged ? `${memberTitle}${user.username || '用户'}的商机` : '我的商机日历';
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
                    <div style="font-size: 14px; color: #999;">雷达扫描中...</div>
                </div>
            `;
            html += `</div>`;
        } else if (subs.length === 0) {
            html += this.getEmptySubscriptionHTML();
            html += `</div>`; // Close wrapper
        } else {
            if (this.isNativeAppRuntime()) {
                const quietCfg = this.getNotifyQuietConfig();
                const quietText = `${quietCfg.enabled ? '开启' : '关闭'} · ${quietCfg.start}-${quietCfg.end}`;
                html += `
                    <div style="display:flex;gap:8px;padding:10px 12px;background:#fff;border-bottom:1px solid #ececf0;">
                        <button onclick="forceEnableNotify()" style="flex:1;height:34px;border:none;border-radius:8px;background:#007aff;color:#fff;font-size:13px;">开启系统通知</button>
                        <button onclick="openNotifyQuietSettings()" style="height:34px;border:1px solid #007aff;border-radius:8px;background:#fff;color:#007aff;padding:0 10px;font-size:12px;">免打扰 ${quietText}</button>
                    </div>
                `;
            }
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
            this.promptLocalNotifyPermission('开启后，订阅有更新会通过系统通知提醒你。').then(ret => {
                if (!(ret && ret.granted)) {
                    window.SubManager.updateSub(id, { pushEnabled: false }, true);
                    this.showToast('推送已关闭');
                    this.openSystemNotifySettings();
                    if (this.state.currentTab === 1) this.renderSubscriptionList();
                } else {
                    window.SubManager.updateSub(id, { pushEnabled: true }, true);
                    this.showToast('推送已开启');
                    const testId = `notify_enabled_${id}_${Date.now()}`;
                    this.sendLocalNotify('推送已开启', '后续有订阅更新将通知提醒', testId);
                    this.checkSubPushAndNotify();
                }
            });
            return;
        }
        window.SubManager.updateSub(id, { pushEnabled: false }, true);
        this.showToast('推送已关闭');
    },

    async markAsRead(subId) {
        const sub = window.SubManager.getSub(subId);
        if (!sub) return;
        const now = Date.now();
        const latestReadAt = Number((this.state.subDetailLatestReadAtById && this.state.subDetailLatestReadAtById[subId]) || 0);
        const finalReadAt = Math.max(Number(sub.lastReadAt || 0), latestReadAt || now);
        sub.unreadCount = 0;
        sub.lastCheckTime = now;
        sub.lastReadAt = finalReadAt;
        sub.readItemIds = [];
        if (window.SubManager && typeof window.SubManager.updateSubCritical === 'function') {
            await window.SubManager.updateSubCritical(sub.id, { unreadCount: 0, lastCheckTime: now, lastReadAt: finalReadAt, readItemIds: [] }, true);
        } else {
            window.SubManager.updateSub(sub.id, { unreadCount: 0, lastCheckTime: now, lastReadAt: finalReadAt, readItemIds: [] }, true);
        }
        
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
                    <div style="text-align: center; color: #999; margin-top: 40px;">雷达扫描中...</div>
                </div>
            </div>
        `;
        
        // Use document.querySelector('.iphone-frame') if exists, else body, to keep it inside the phone frame
        const container = document.querySelector('.iphone-frame') || document.body;
        container.insertAdjacentHTML('beforeend', modalHtml);
        
        const listContainer = document.getElementById('sub-detail-list');
        const keywordText = (Array.isArray(sub.keywords) ? sub.keywords : [sub.keywords]).map(k => (k || '').trim()).filter(Boolean).join('、');
        const safeKeywordText = keywordText.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
        
        (async () => {
            const items = await this.querySubItems(sub, 20, 3);
            const latestItemTs = items.reduce((m, item) => Math.max(m, this.getItemTimeMs(item)), 0);
            if (!this.state.subDetailLatestReadAtById || typeof this.state.subDetailLatestReadAtById !== 'object') this.state.subDetailLatestReadAtById = {};
            this.state.subDetailLatestReadAtById[subId] = latestItemTs;
            const lastReadAt = sub.lastReadAt || 0;
            const freshUnread = items.filter(item => this.isSubItemUnread(sub, item)).length;
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
                let html = '';
                items.forEach(item => {
                    const itemTs = this.getItemTimeMs(item);
                    const unread = this.isSubItemUnread(sub, item);
                    const readTagText = unread ? '未读' : '已读';
                    const readTagBg = unread ? '#FFECEC' : '#F3F4F6';
                    const readTagColor = unread ? '#FF3B30' : '#8E8E93';
                    const time = this.formatTime(item.datetime, item.datetime_ts);
                    const title = item.title || '无标题';
                    const purchaser = item.purchaser || '';
                    const city = item.city || '';
                    const price = this.normalizeBidPriceText(item.bid_price || item.bidPrice || '');
                    const amountBadge = this.getAmountBadge(price);
                    const matched = Array.isArray(item._matchedKeywords) ? item._matchedKeywords.filter(Boolean) : [];
                    const titleHtml = this.highlightTitleKeywords(title, matched);
                    const type = item.types || '公告';
                    const tagClass = this.getTagClass(type);
                    const itemStr = encodeURIComponent(JSON.stringify(item)).replace(/'/g, "%27");
                    html += `
                        <div class="card" onclick="App.closeSubDetail(); showDetail('${itemStr}'); App.decreaseUnread(${subId}, '${String((item && item.id) || '').replace(/'/g, '\\\'')}', ${Number(itemTs || 0)}, ${latestItemTs})" style="margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                            <div style="margin-bottom: 6px; display: flex; align-items: center; min-height: 20px; justify-content: space-between;">
                                <div style="display: flex; align-items: center;">
                                    ${amountBadge ? `<span class="tag-new" style="background: ${amountBadge.bg}; color: ${amountBadge.color}; font-weight: bold; margin-right: 6px; vertical-align: middle;">${amountBadge.text}</span>` : ''}
                                    ${price ? `<span style="color: #ff3b30; font-size: 13px; font-weight: 600;">${price}</span>` : ''}
                                </div>
                                <div style="font-size: 12px; color: var(--text-secondary); white-space: nowrap;">${time}</div>
                            </div>
                            <div style="margin-bottom: 8px; line-height: 1.5;">
                                <span class="card-title">${titleHtml}</span>
                                <span class="tag-new" style="background: ${tagClass.bg}; color: ${tagClass.text}; margin-left: 4px; vertical-align: 1px;">${type}</span>
                                <span class="tag-new" style="background: ${readTagBg}; color: ${readTagColor}; margin-left: 4px; vertical-align: 1px;">${readTagText}</span>
                            </div>
                            <div class="card-meta">
                                <div class="meta-item" style="width: 100%; display: flex; flex-direction: column; align-items: flex-start; gap: 6px;">
                                    <div style="display: flex; align-items: center; width: 100%;">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 2px; flex-shrink: 0;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                        <span style="white-space: nowrap; flex-shrink: 0;">${city}</span>
                                    </div>
                                    ${purchaser ? `<div style="width: 100%; line-height: 1.4; white-space: normal; word-break: break-word;"><span class="purchaser-pill">${purchaser}</span></div>` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                });
                listContainer.innerHTML = html;
            }
        })();
    },
    
    closeSubDetail() {
        const modal = document.getElementById('sub-detail-modal');
        const mask = document.getElementById('sub-detail-mask');
        if (modal) modal.remove();
        if (mask) mask.remove();
    },
    
    async decreaseUnread(subId, itemId = '', itemTs = 0, latestReadAt = 0) {
        const sub = window.SubManager.getSub(subId);
        if (!sub || !sub.unreadCount || sub.unreadCount <= 0) return;
        if (!Array.isArray(sub.readItemIds)) sub.readItemIds = [];
        const readSet = new Set(sub.readItemIds.map(x => String(x)).filter(Boolean));
        const itemIdText = String(itemId || '').trim();
        if (itemIdText && readSet.has(itemIdText)) return;
        const curReadAt = Number(sub.lastReadAt || 0);
        if (itemTs && curReadAt && itemTs <= curReadAt) return;
        
        sub.unreadCount -= 1;
        if (itemIdText) {
            readSet.add(itemIdText);
            sub.readItemIds = Array.from(readSet).slice(-1000);
        }
        const updates = { unreadCount: sub.unreadCount, readItemIds: sub.readItemIds };
        if (sub.unreadCount === 0) {
            const finalReadAt = Math.max(Number(sub.lastReadAt || 0), Number(latestReadAt || 0), Date.now());
            updates.lastReadAt = finalReadAt;
            sub.lastReadAt = updates.lastReadAt;
            updates.readItemIds = [];
            sub.readItemIds = [];
        }
        if (window.SubManager && typeof window.SubManager.updateSubCritical === 'function') {
            await window.SubManager.updateSubCritical(subId, updates, true);
        } else {
            window.SubManager.updateSub(subId, updates, true);
        }
        
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
    
    async saveSubscription() {
        const check = this.checkSubLimit();
        if (!check.allowed) {
            if (confirm(check.message)) {
                this.closeSubDialog();
                this.switchTab(2);
            }
            return;
        }

        const input = document.getElementById('sub-keywords');
        const rawKeywords = input.value.trim();
        
        if (!rawKeywords) {
            alert('请输入至少一个关键词');
            return;
        }
        
        const keywords = rawKeywords.split(/[,，]/).map(k => k.trim()).filter(k => k);
        
        if (keywords.length === 0) {
             alert('请输入有效的关键词');
             return;
        }

        const longKeywords = keywords.filter(k => k.length > 9);
        if (longKeywords.length > 0) {
            alert(`关键词不能超过9个字：\n${longKeywords.join('\n')}`);
            return;
        }
        
        const scopeType = this.state.tempRegion || 'city';
        let scopeValue = this.state.tempScopeValue;
        if (!scopeValue) {
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
        
        let pushEnabled = !!(document.querySelector('#sub-modal input[type="checkbox"]') && document.querySelector('#sub-modal input[type="checkbox"]').checked);
        if (pushEnabled && this.isNativeAppRuntime()) {
            const ret = await this.promptLocalNotifyPermission('订阅关键词新增后，将通过系统原生通知即时提醒你。');
            if (!(ret && ret.granted)) {
                pushEnabled = false;
                const toggle = document.querySelector('#sub-modal input[type="checkbox"]');
                if (toggle) toggle.checked = false;
                await this.openSystemNotifySettings();
                this.showToast('通知未开启，已保存但不推送');
            } else {
                this.safeStorageSet('br_notify_granted', '1');
            }
        }

        if (this.state.editingSubId) {
             const success = window.SubManager.updateSub(this.state.editingSubId, {
                keywords: keywords,
                scopeType: scopeType,
                scopeValue: scopeValue,
                pushEnabled: pushEnabled
            });
            
            if (success) {
                const contentArea = document.getElementById('content-area');
                const scrollTop = contentArea ? contentArea.scrollTop : 0;

                if (this.state.currentTab === 1) {
                    this.renderSubscriptionList();
                }
                this.closeSubDialog();
                this.showToast('订阅更新成功');
                
                if (contentArea) contentArea.scrollTop = scrollTop;
            } else {
                alert('更新失败');
            }
        } else {
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
    
    formatTime(dateStr, dateTs) {
        if (!dateStr && !dateTs) return '';
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
            const tsNum = dateTs != null ? Number(dateTs) : 0;
            if (rawText && hasTimePart) {
                const safeStr = rawText
                    .replace(/年/g, '/')
                    .replace(/月/g, '/')
                    .replace(/日/g, '')
                    .replace(/-/g, '/');
                date = new Date(safeStr);
                if (isNaN(date.getTime()) && !Number.isNaN(tsNum) && tsNum > 0) {
                    date = new Date(tsNum);
                }
            } else if (!Number.isNaN(tsNum) && tsNum > 0) {
                date = new Date(tsNum);
            } else if (typeof dateStr === 'number' || (typeof dateStr === 'string' && /^\d+$/.test(dateStr))) {
                let ts = parseInt(dateStr);
                if (ts < 10000000000) ts *= 1000;
                date = new Date(ts);
            } else {
                const safeStr = String(dateStr || '')
                    .replace(/年/g, '/')
                    .replace(/月/g, '/')
                    .replace(/日/g, '')
                    .replace(/-/g, '/');
                date = new Date(safeStr);
            }

            if (rawText && !hasTimePart && (!date || isNaN(date.getTime()))) {
                if (rawText.includes('今天')) return '今天';
                if (rawText.includes('昨天')) return '昨天';
                if (rawText.includes('前天')) return '前天';
                if (rawText.includes('明天')) return '明天';
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
    parsePrice(priceStr) { if (!priceStr || priceStr === "金额见正文") return 0; try { const str = String(priceStr).replace(/,/g, ""); const m = str.match(/(\d+(\.\d+)?)/); if (!m) return 0; const num = parseFloat(m[1]); if (isNaN(num)) return 0; if (str.includes("亿")) return num * 100000000; if (str.includes("万")) return num * 10000; return num; } catch (e) { return 0; } },

    isUndisclosedPrice(priceStr) { const raw = String(priceStr || "").trim(); if (!raw || raw === "金额见正文" || raw === "null" || raw === "undefined") return true; const normalized = raw.replace(/\s+/g, "").replace(/,/g, ""); if (normalized === "--" || normalized === "-") return true; if (/^[¥￥]?0+(\.0+)?(元|万元|万|亿)?$/.test(normalized)) return true; if (normalized.includes("未公示") || normalized.includes("未知")) return true; return false; },

    normalizeBidPriceText(priceStr) {
        if (this.isUndisclosedPrice(priceStr)) return '';
        const raw = String(priceStr).trim();
        return raw.replace(/(\d+\.\d+)/g, (m) => m.replace(/0+$/, '').replace(/\.$/, ''));
    },

    normalizeDetailAmountText(html) {
        const raw = String(html || '');
        if (!raw) return '';
        return raw.replace(/(\d+\.\d+)(?=\s*(亿|万元|万|元|人民币|（人民币）|\(人民币\)))/g, (m) => {
            return m.replace(/0+$/, '').replace(/\.$/, '');
        });
    },

    getAmountBadge(priceStr) { if (this.isUndisclosedPrice(priceStr)) { return { text: "未公示金额", bg: "#FFF3E0", color: "#FF9500" }; } const amount = this.parsePrice(priceStr); if (amount === 0) { return { text: "未公示金额", bg: "#FFF3E0", color: "#FF9500" }; } else if (amount >= 100000000) { return { text: "亿级项目", bg: "#FF3B30", color: "white" }; } else if (amount >= 10000000) { return { text: "千万级项目", bg: "#FF9500", color: "white" }; } else if (amount >= 1000000) { return { text: "百万级项目", bg: "#5856D6", color: "white" }; } else { return { text: "百万以下项目", bg: "#34C759", color: "white" }; } },

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

    getEmptyUserState() {
        return {
            isLogged: false,
            userId: 0,
            username: '',
            role: 'user',
            avatar: '',
            vipLevel: 'free',
            vipScopeValue: '',
            vipExpire: null,
            vipExpireRaw: '',
            balance: 0,
            viewUsage: 0,
            viewHistory: [],
            companyName: '',
            realName: '',
            positionTitle: '',
            phone: '',
            email: '',
            wechatId: '',
            profileCompletion: null,
            profileRewardConfig: null,
            profileRewardGrantedAt: '',
            inviteCode: '',
            invitedCount: 0,
            inviteRewardTotal: 0,
            referralRecords: [],
            iapReferenceUuid: '',
            trialUsage: { city: false, province: false, country: false }
        };
    },
    
    loadUser() {
        try {
            try { localStorage.removeItem('br_profile_reward_draft'); } catch (e) {}
            if (!this.getAuthToken()) {
                try { localStorage.removeItem('br_user'); } catch (e) {}
                this.state.user = this.getEmptyUserState();
                return;
            }
            const saved = localStorage.getItem('br_user');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && typeof parsed === 'object') {
                    this.state.user = Object.assign({}, this.getEmptyUserState(), parsed);
                }
            }
        } catch (e) {
            console.error("Failed to load user", e);
        }
    },
    
    saveUser() {
        try { localStorage.setItem('br_user', JSON.stringify(this.state.user)); } catch (e) {}
    },

    getProfileDraftStorageKey(userLike = null) {
        return `br_profile_reward_draft_v2_${this.getUserStorageKey(userLike || this.state.user || {})}`;
    },

    loadLocalProfileDraft(userLike = null) {
        try {
            const raw = localStorage.getItem(this.getProfileDraftStorageKey(userLike || this.state.user || {}));
            if (!raw) return {};
            const d = JSON.parse(raw);
            if (!d || typeof d !== 'object') return {};
            return {
                companyName: String(d.companyName || '').trim(),
                realName: String(d.realName || '').trim(),
                positionTitle: String(d.positionTitle || '').trim(),
                phone: String(d.phone || '').trim(),
                email: String(d.email || '').trim(),
                wechatId: String(d.wechatId || '').trim(),
            };
        } catch (e) {
            return {};
        }
    },

    saveLocalProfileDraft(draft = {}, userLike = null) {
        try { localStorage.setItem(this.getProfileDraftStorageKey(userLike || this.state.user || {}), JSON.stringify(draft || {})); } catch (e) {}
    },

    saveRuntimeConfig() {
        try { localStorage.setItem('br_runtime_config', JSON.stringify(this.state.runtimeConfig || {})); } catch (e) {}
    },

    loadRuntimeConfigFromCache() {
        try {
            const saved = localStorage.getItem('br_runtime_config');
            if (!saved) return;
            const cfg = JSON.parse(saved);
            if (cfg && typeof cfg === 'object') this.state.runtimeConfig = cfg;
        } catch (e) {}
    },

    async loadRuntimeConfig() {
        this.loadRuntimeConfigFromCache();
        this.applyRuntimeCopyToAuthModal();
        this.renderRuntimeBanner();
        this.maybeShowRuntimeNotice();
        const apiBase = this.getApiBase();
        if (!apiBase) return;
        try {
            const res = await this.requestJson(`${apiBase}/api/config/bootstrap`);
            if (res.ok && res.json && res.json.code === 1 && res.json.data) {
                this.state.runtimeConfig = res.json.data || {};
                this.saveRuntimeConfig();
                this.applyRuntimeCopyToAuthModal();
                this.renderRuntimeBanner();
                this.maybeShowRuntimeNotice(true);
                if (this.state.currentTab === 2) this.refreshMemberCenterView();
            }
        } catch (e) {}
    },

    applyRuntimeCopyToAuthModal() {
        const copy = (this.state.runtimeConfig && this.state.runtimeConfig['copy.auth']) || {};
        const title = String(copy.title || '').trim();
        const subtitle = String(copy.subtitle || '').trim();
        const titleEl = document.querySelector('.auth-hero-title');
        const subtitleEl = document.querySelector('.auth-hero-subtitle');
        if (titleEl && title) titleEl.textContent = title;
        if (subtitleEl && subtitle) subtitleEl.textContent = subtitle;
    },

    closeRuntimeNotice() {
        const mask = document.getElementById('runtime-notice-mask');
        const panel = document.getElementById('runtime-notice-panel');
        if (mask) mask.remove();
        if (panel) panel.remove();
        this.state.runtimeNoticeVisible = false;
    },

    maybeShowRuntimeNotice(force = false) {
        const cfg = (this.state.runtimeConfig && this.state.runtimeConfig['notice.popup']) || {};
        const enabled = !!cfg.enabled;
        if (!enabled) return;
        const version = String(cfg.version || 'v1');
        const seenKey = `br_notice_popup_seen_${version}`;
        if (!force && this.safeStorageGet(seenKey) === '1') return;
        if (this.state.runtimeNoticeVisible) return;
        const title = String(cfg.title || '运营公告').trim();
        const content = String(cfg.content || '').trim();
        const buttonText = String(cfg.buttonText || '我知道了').trim();
        if (!content) return;
        this.closeRuntimeNotice();
        const mask = document.createElement('div');
        mask.id = 'runtime-notice-mask';
        mask.style.cssText = 'position:fixed;inset:0;background:rgba(5,8,15,0.48);z-index:860;';
        mask.onclick = () => {
            this.safeStorageSet(seenKey, '1');
            this.closeRuntimeNotice();
        };
        const panel = document.createElement('div');
        panel.id = 'runtime-notice-panel';
        panel.style.cssText = 'position:fixed;left:18px;right:18px;top:50%;transform:translateY(-50%);background:#fff;border-radius:16px;z-index:861;padding:16px 14px 14px;box-shadow:0 14px 34px rgba(0,0,0,0.24);';
        panel.innerHTML = `
            <div style="font-size:17px;font-weight:700;color:#111;margin-bottom:8px;">${title}</div>
            <div style="font-size:14px;line-height:1.65;color:#444;white-space:pre-wrap;">${content}</div>
            <button onclick="closeRuntimeNotice()" style="margin-top:14px;width:100%;height:44px;border:none;border-radius:12px;background:#111;color:#fff;font-size:15px;font-weight:600;">${buttonText}</button>
        `;
        document.body.appendChild(mask);
        document.body.appendChild(panel);
        this.state.runtimeNoticeVisible = true;
        this.safeStorageSet(seenKey, '1');
    },

    applyServerUser(serverUser) {
        const u = serverUser || {};
        const prev = this.state.user || {};
        const incomingId = Number(u.id || u.userId || 0);
        const incomingName = String(u.username || '').trim().toLowerCase();
        const prevId = Number(prev.userId || prev.id || 0);
        const prevName = String(prev.username || '').trim().toLowerCase();
        const sameUser = incomingId > 0 && prevId > 0 ? incomingId === prevId : (!!incomingName && !!prevName && incomingName === prevName);
        const base = sameUser ? prev : this.getEmptyUserState();
        const userId = incomingId || Number(base.userId || 0);
        const finalUsername = String(u.username || base.username || '').trim();
        const draftIdentity = { userId, username: finalUsername };
        const draft = this.loadLocalProfileDraft(draftIdentity);
        let viewHistory = [];
        try {
            const raw = u.viewHistoryJson || u.view_history_json || '[]';
            const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
            if (Array.isArray(arr)) viewHistory = arr;
        } catch (e) {}
        const vipExpireRaw = String(u.vipExpire || u.vip_expire_at || u.vipExpireAt || u.vip_expireAt || base.vipExpireRaw || base.vipExpire || '').trim();
        const vipExpire = this.normalizeVipExpireText(vipExpireRaw || base.vipExpire || '');
        const vipLevel = u.vipLevel || u.vip_level || base.vipLevel || 'free';
        const vipScopeValue = u.vipScopeValue || u.vip_scope_value || base.vipScopeValue || '';
        const profileCompletion = u.profileCompletion || u.profile_completion || base.profileCompletion || null;
        const profileRewardConfig = u.profileRewardConfig || u.profile_reward_config || base.profileRewardConfig || null;
        const trialUsageRaw = u.trialUsage || u.trial_usage || base.trialUsage || {};
        const trialUsage = {
            city: !!trialUsageRaw.city,
            province: !!trialUsageRaw.province,
            country: !!trialUsageRaw.country
        };
        this.state.user = {
            isLogged: true,
            userId,
            username: finalUsername,
            role: u.role || base.role || 'user',
            avatar: u.avatar || base.avatar || '',
            vipLevel,
            vipScopeValue,
            vipExpire: vipExpire || base.vipExpire || '',
            vipExpireRaw,
            balance: Number(u.balance || u.balance_yuan || base.balance || 0),
            viewUsage: Number(u.viewUsage || u.view_usage || base.viewUsage || 0),
            viewHistory,
            inviteCode: String(u.inviteCode || u.invite_code || base.inviteCode || ''),
            invitedCount: Number(u.invitedCount || u.invited_count || base.invitedCount || 0),
            inviteRewardTotal: Number(u.inviteRewardTotal || u.invite_reward_total_yuan || base.inviteRewardTotal || 0),
            companyName: String(u.companyName || u.company_name || draft.companyName || base.companyName || ''),
            realName: String(u.realName || u.real_name || draft.realName || base.realName || ''),
            positionTitle: String(u.positionTitle || u.position_title || draft.positionTitle || base.positionTitle || ''),
            phone: String(u.phone || draft.phone || base.phone || ''),
            email: String(u.email || draft.email || base.email || ''),
            wechatId: String(u.wechatId || u.wechat_id || draft.wechatId || base.wechatId || ''),
            profileCompletion,
            profileRewardConfig,
            profileRewardGrantedAt: String(u.profileRewardGrantedAt || u.profile_reward_granted_at || base.profileRewardGrantedAt || ''),
            referralRecords: Array.isArray(base.referralRecords) ? base.referralRecords : [],
            iapReferenceUuid: String(u.iapReferenceUuid || u.iap_reference_uuid || base.iapReferenceUuid || ''),
            trialUsage
        };
        this.saveLocalProfileDraft({ companyName: this.state.user.companyName, realName: this.state.user.realName, positionTitle: this.state.user.positionTitle, phone: this.state.user.phone, email: this.state.user.email, wechatId: this.state.user.wechatId }, this.state.user);
        this.saveUser();
        this.state.vipCardTab = this.state.user.vipLevel;
    },

    async syncMemberFromServer() {
        const apiBase = this.getApiBase();
        if (!apiBase) return;
        if (!this.getAuthToken()) return;
        try {
            const res = await this.requestJson(`${apiBase}/api/member/me`);
            const json = res && res.json ? res.json : null;
            const okByCode = !!(json && (json.code === 1 || json.success === true));
            const data = (json && json.data && typeof json.data === 'object') ? json.data : {};
            const user = (data && data.user) || (json && json.user) || (okByCode && data && data.username ? data : null);
            if (user && data) {
                if (!user.vipExpire && (data.vipExpire || data.vip_expire_at || data.vipExpireAt)) user.vipExpire = data.vipExpire || data.vip_expire_at || data.vipExpireAt;
                if (!user.vipLevel && (data.vipLevel || data.vip_level)) user.vipLevel = data.vipLevel || data.vip_level;
                if (!user.vipScopeValue && (data.vipScopeValue || data.vip_scope_value)) user.vipScopeValue = data.vipScopeValue || data.vip_scope_value;
            }
            if (user && data && data.profileCompletion) user.profileCompletion = data.profileCompletion;
            if (user && data && data.profileRewardConfig) user.profileRewardConfig = data.profileRewardConfig;
            if (user && data && data.trialUsage) user.trialUsage = data.trialUsage;
            const plans = (data && data.plans) || (json && json.plans) || [];
            if (res.ok && user) {
                this.applyServerUser(user);
                this.state.memberPlans = Array.isArray(plans) ? plans : [];
                await this.syncReferralFromServer();
                await this.loadRuntimeConfig();
                try {
                    if (window.SubManager && window.SubManager.setAuth) {
                        window.SubManager.setAuth(apiBase, this.getAuthToken(), this.getSubStorageUserKey());
                    }
                    if (window.SubManager && window.SubManager.refreshFromServer) {
                        window.SubManager.refreshFromServer();
                    }
                } catch (e) {}
                this.switchTab(this.state.currentTab || 0);
                return true;
            }
        } catch (e) {}
        return false;
    },

    async recoverVipExpireFromOrders() {
        const apiBase = this.getApiBase();
        if (!apiBase || !this.getAuthToken()) return '';
        const level = String((this.state.user && this.state.user.vipLevel) || 'free');
        if (level === 'free') return '';
        try {
            const planRes = await this.requestJson(`${apiBase}/api/member/plans`);
            const planRows = planRes && planRes.ok && planRes.json && Array.isArray(planRes.json.data) ? planRes.json.data : [];
            const dayMap = new Map();
            for (const p of planRows) {
                const code = String((p && (p.code || p.planCode)) || '').trim();
                const days = Math.max(1, Number((p && (p.durationDays || p.duration_days)) || 365));
                if (code) dayMap.set(code, days);
            }
            const orderRes = await this.requestJson(`${apiBase}/api/member/orders?page=1&pageSize=200`);
            const rows = orderRes && orderRes.ok && orderRes.json && orderRes.json.data && Array.isArray(orderRes.json.data.rows)
                ? orderRes.json.data.rows
                : [];
            let expireMs = 0;
            const sorted = rows.slice().sort((a, b) => {
                const ta = Date.parse(String((a && (a.createdAt || a.paidAt || a.fulfilledAt)) || '')) || 0;
                const tb = Date.parse(String((b && (b.createdAt || b.paidAt || b.fulfilledAt)) || '')) || 0;
                return ta - tb;
            });
            for (const r of sorted) {
                const st = String((r && r.status) || '').trim();
                const code = String((r && (r.planCode || r.plan_code)) || '').trim();
                if (!(st === 'fulfilled' || st === 'paid')) continue;
                if (code !== level) continue;
                const ts = Date.parse(String((r && (r.fulfilledAt || r.paidAt || r.createdAt)) || '')) || Date.now();
                const base = Math.max(expireMs, ts);
                let days = dayMap.get(code) || 365;
                const ext = (r && r.extJson && typeof r.extJson === 'object') ? r.extJson : {};
                const addDays = Number(ext.addDays || 0);
                if (Number.isFinite(addDays) && addDays > 0 && addDays <= 60) days = addDays;
                expireMs = base + days * 24 * 60 * 60 * 1000;
            }
            const text = this.normalizeVipExpireText(expireMs);
            if (text) {
                this.state.user.vipExpire = text;
                this.state.user.vipExpireRaw = text;
                this.saveUser();
            }
            return text;
        } catch (e) {
            return '';
        }
    },

    async syncReferralFromServer() {
        const apiBase = this.getApiBase();
        if (!apiBase || !this.getAuthToken() || !this.state.user.isLogged) return;
        try {
            const summaryRes = await this.requestJson(`${apiBase}/api/member/referral/me`);
            if (summaryRes.ok && summaryRes.json && summaryRes.json.code === 1 && summaryRes.json.data) {
                const d = summaryRes.json.data || {};
                this.state.user.inviteCode = String(d.inviteCode || this.state.user.inviteCode || '');
                this.state.user.invitedCount = Number(d.invitedCount || 0);
                this.state.user.inviteRewardTotal = Number(d.rewardTotal || 0);
            }
            const recordRes = await this.requestJson(`${apiBase}/api/member/referral/records?page=1&pageSize=20`);
            if (recordRes.ok && recordRes.json && recordRes.json.code === 1 && recordRes.json.data) {
                const list = Array.isArray(recordRes.json.data.list) ? recordRes.json.data.list : [];
                this.state.user.referralRecords = list;
            }
            this.saveUser();
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
        try { document.body.style.overflow = 'hidden'; } catch (e) {}
        const cachedUser = (this.safeStorageGet('br_face_login_username') || '').trim();
        const input = document.getElementById('auth-username');
        if (input && cachedUser) input.value = cachedUser;
        // Reset to login mode
        this.switchAuthMode('login');
    },

    closeLoginModal() {
        const modal = document.getElementById('login-modal');
        modal.style.display = 'none';
        try { document.body.style.overflow = ''; } catch (e) {}
    },

    switchAuthMode(mode) {
        this.state.authMode = mode; // 'login' or 'register'
        
        // Update Tabs
        const loginTab = document.getElementById('tab-login');
        const regTab = document.getElementById('tab-register');
        const confirmGroup = document.getElementById('confirm-password-group');
        const btn = document.getElementById('auth-btn');
        const helper = document.getElementById('auth-helper');
        const title = document.getElementById('auth-title');
        const terms = document.getElementById('auth-terms');
        const inviteGroup = document.getElementById('invite-code-group');
        const faceBtn = document.getElementById('auth-face-btn');
        const faceEnabled = this.getFaceLoginEnabled();

        if (mode === 'login') {
            loginTab.classList.add('active');
            regTab.classList.remove('active');
            confirmGroup.style.display = 'none';
            btn.textContent = '登录';
            helper.textContent = '未注册手机号验证后将自动创建账号';
            if(title) title.textContent = '用户登录';
            if(terms) terms.style.display = 'none';
            if(inviteGroup) inviteGroup.style.display = 'none';
            if (faceBtn) faceBtn.style.display = this.isNativeAppRuntime() ? '' : 'none';
        } else {
            regTab.classList.add('active');
            loginTab.classList.remove('active');
            confirmGroup.style.display = 'block';
            btn.textContent = '注册';
            helper.textContent = '注册即代表同意《用户协议》和《隐私政策》';
            if(title) title.textContent = '用户注册';
            if(terms) terms.style.display = '';
            if(inviteGroup) inviteGroup.style.display = 'block';
            if (faceBtn) faceBtn.style.display = 'none';
        }
    },

    async applyLoginSuccess(loginJson, fallbackUsername = '', plainPassword = '') {
        if (!(loginJson && loginJson.token)) return false;
        const apiBase = this.getApiBase();
        this.setAuthToken(loginJson.token);
        this.applyServerUser(loginJson.user || { username: fallbackUsername });
        const userName = String((loginJson.user && loginJson.user.username) || fallbackUsername || '').trim();
        if (userName) this.safeStorageSet('br_face_login_username', userName);
        if (userName && plainPassword && this.isNativeAppRuntime()) this.cacheFaceLoginCredential(userName, plainPassword);
        try {
            if (window.SubManager && window.SubManager.setAuth) {
                window.SubManager.setAuth(apiBase, this.getAuthToken(), this.getSubStorageUserKey());
            }
        } catch (e) {}
        let synced = await this.syncMemberFromServer();
        if (!synced) synced = await this.syncMemberFromServer();
        const needVipExpire = this.state.user && this.state.user.vipLevel !== 'free' && !this.normalizeVipExpireText(this.state.user.vipExpire || '');
        if (needVipExpire) {
            await this.syncMemberFromServer();
            await this.recoverVipExpireFromOrders();
        }
        this.closeLoginModal();
        this.switchTab(2);
        this.showToast('登录成功');
        if (this.getFaceLoginEnabled()) await this.bindFaceLoginIfPossible(userName);
        return true;
    },

    async handleFaceLogin() {
        if (!this.isNativeAppRuntime()) {
            this.showToast('仅App内支持面容认证登录');
            return;
        }
        if (!this.getFaceLoginEnabled()) {
            this.showToast('请先在设置中开启面容认证登录');
            return;
        }
        const cap = await this.getFaceAuthAvailability();
        if (!cap.available) {
            this.showToast('当前设备不可用面容认证');
            return;
        }
        const verified = await this.faceAuthAuthenticate('请使用面容认证登录');
        if (!verified) {
            this.showToast('面容认证失败');
            return;
        }
        const apiBase = this.getApiBase();
        if (!apiBase) {
            this.showToast('未配置API地址');
            return;
        }
        const usernameInput = document.getElementById('auth-username');
        const username = String((usernameInput && usernameInput.value) || this.safeStorageGet('br_face_login_username') || '').trim();
        if (!username) {
            this.showToast('请先输入手机号/用户名');
            return;
        }
        const candidates = this.getFaceApiCandidates('login');
        let lastMsg = '';
        for (const path of candidates) {
            try {
                const body = { username, account: username, userName: username };
                const url = this.buildApiUrl(apiBase, path);
                const res = await this.requestJson(url, { method: 'POST', body });
                const payload = this.extractAuthPayload(res && res.json);
                if (res.ok && payload.token) {
                    await this.applyLoginSuccess({ ...(res.json || {}), token: payload.token, user: payload.user || (res.json && res.json.user) }, username);
                    return;
                }
                if (res.status && res.status !== 404) {
                    this.showToast((res.json && (res.json.message || res.json.msg || res.json.error)) || '面容登录失败');
                    return;
                }
                lastMsg = `${path} -> ${res.status || 'network'}`;
            } catch (e) {}
        }
        const cached = this.getCachedFaceLoginCredential(username);
        if (cached && cached.password) {
            try {
                const res = await this.requestJson(`${apiBase}/api/auth/login`, {
                    method: 'POST',
                    body: { username: cached.username, password: cached.password }
                });
                if (res.ok && res.json && res.json.token) {
                    await this.applyLoginSuccess(res.json, cached.username, cached.password);
                    return;
                }
            } catch (e) {}
        }
        if (lastMsg) {
            try { console.warn('[face-login-miss]', lastMsg); } catch (e) {}
        }
        this.showToast('面容登录暂不可用，请先账号登录一次');
    },

    async handleAuth() {
        const usernameInput = document.getElementById('auth-username');
        const passwordInput = document.getElementById('auth-password');
        const confirmInput = document.getElementById('auth-confirm-password');
        const inviteInput = document.getElementById('auth-invite-code');
        
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
                const inviteCode = inviteInput ? String(inviteInput.value || '').trim().toUpperCase() : '';
                const res = await this.requestJson(`${apiBase}/api/auth/register`, {
                    method: 'POST',
                    body: { username, password, nickname: username, inviteCode }
                });
                if (res.ok && res.json && (res.json.success || res.json.user)) {
                    if (inviteInput) inviteInput.value = '';
                    const loginRes = await this.requestJson(`${apiBase}/api/auth/login`, {
                        method: 'POST',
                        body: { username, password }
                    });
                    if (loginRes.ok && loginRes.json && loginRes.json.token) {
                        await this.applyLoginSuccess(loginRes.json, username, password);
                        this.showToast('注册并登录成功');
                        return;
                    }
                    this.showToast('注册成功，请登录');
                    this.switchAuthMode('login');
                    return;
                }
                const rawMsg = (res.json && (res.json.message || res.json.msg)) || '注册失败';
                const isExists = /already exists/i.test(String(rawMsg));
                const msg = isExists ? '该账号已注册，请直接登录' : rawMsg;
                this.showToast(msg);
                if (isExists) this.switchAuthMode('login');
            } catch (e) {
                this.showToast('注册失败');
            }
            
        } else {
            try {
                const tryLogins = [username];
                const lower = username.toLowerCase();
                if (lower && lower !== username) tryLogins.push(lower);
                let lastMsg = '登录失败';
                for (const loginName of tryLogins) {
                    const res = await this.requestJson(`${apiBase}/api/auth/login`, {
                        method: 'POST',
                        body: { username: loginName, password }
                    });
                    if (res.ok && res.json && res.json.token) return await this.applyLoginSuccess(res.json, loginName, password);
                    lastMsg = (res.json && (res.json.message || res.json.msg)) || lastMsg;
                }
                const mayInvalid = /invalid credentials|用户名或密码|账号或密码|密码错误/i.test(String(lastMsg || ''));
                if (mayInvalid) {
                    const reg = await this.requestJson(`${apiBase}/api/auth/register`, {
                        method: 'POST',
                        body: { username, password, nickname: username }
                    });
                    if (reg.ok && reg.json && (reg.json.success || reg.json.user)) {
                        const retry = await this.requestJson(`${apiBase}/api/auth/login`, {
                            method: 'POST',
                            body: { username, password }
                        });
                        if (retry.ok && retry.json && retry.json.token) {
                            await this.applyLoginSuccess(retry.json, username, password);
                            this.showToast('账号已自动创建并登录');
                            return;
                        }
                    }
                }
                this.showToast(lastMsg);
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
            this.state.user = this.getEmptyUserState();
            this.state.adminDrawerOpen = false;
            this.state.adminPanelOpen = false;
            this.saveUser();
            this.setAuthToken('');
            try { localStorage.removeItem('br_profile_reward_draft'); } catch (e) {}
            try {
                if (window.SubManager && window.SubManager.setAuth) window.SubManager.setAuth(this.getApiBase(), '', 'guest');
            } catch (e) {}
            // Reset tab to free
            this.state.vipCardTab = 'free';
            this.switchTab(2);
            this.showToast('已退出登录');
        }
    },
    
    async activateMember() {
        if (!this.state.user.isLogged) {
            this.showToast('请先登录');
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
                this.state.user.vipExpire = this.normalizeVipExpireText(d.vipExpire || d.vip_expire_at || this.state.user.vipExpire || '');
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
    
    getMemberPlanByCode(level) {
        const rows = Array.isArray(this.state.memberPlans) ? this.state.memberPlans : [];
        return rows.find((p) => String((p && (p.code || p.planCode)) || '').trim() === String(level || '').trim()) || null;
    },

    getIapPlugin() {
        return window.Capacitor && window.Capacitor.Plugins ? window.Capacitor.Plugins.CapacitorInAppPurchase : null;
    },

    canUseAppleIap(plan) {
        if (!this.isNativeAppRuntime()) return false;
        const plugin = this.getIapPlugin();
        if (!plugin) return false;
        const productId = String((plan && (plan.appleProductId || plan.apple_product_id)) || '').trim();
        return !!productId;
    },

    getPaymentRuntimeConfig() {
        const cfg = (this.state.runtimeConfig && this.state.runtimeConfig['payment.channels']) || {};
        return {
            wechatEnabled: cfg.wechatEnabled !== false,
            alipayEnabled: cfg.alipayEnabled !== false,
            transferEnabled: cfg.transferEnabled !== false,
            wechatLabel: String(cfg.wechatLabel || '微信支付'),
            alipayLabel: String(cfg.alipayLabel || '支付宝支付'),
            transferLabel: String(cfg.transferLabel || '对公转账'),
            wechatAppId: String(cfg.wechatAppId || ''),
            wechatMchId: String(cfg.wechatMchId || ''),
            wechatApiKey: String(cfg.wechatApiKey || ''),
            alipayAppId: String(cfg.alipayAppId || ''),
            alipaySellerId: String(cfg.alipaySellerId || ''),
            alipayPublicKey: String(cfg.alipayPublicKey || ''),
            transferCompanyName: String(cfg.transferCompanyName || '舍予基业（珠海）控股集团有限公司'),
            transferTaxNo: String(cfg.transferTaxNo || '91440400MABMPMTK15'),
            transferAddress: String(cfg.transferAddress || '珠海市香洲区宝成路7号6栋2718房'),
            transferPhone: String(cfg.transferPhone || '18607560510'),
            transferBank: String(cfg.transferBank || '中国建设银行股份有限公司珠海横琴金融街支行'),
            transferAccount: String(cfg.transferAccount || '44050164005209668888'),
        };
    },

    getCorporateTransferInfo() {
        const p = this.getPaymentRuntimeConfig();
        return {
            companyName: p.transferCompanyName,
            taxNo: p.transferTaxNo,
            address: p.transferAddress,
            phone: p.transferPhone,
            bank: p.transferBank,
            account: p.transferAccount,
        };
    },

    closeMemberPayDialog() {
        const root = document.getElementById('member-pay-root');
        if (root) {
            root.remove();
            return;
        }
        const mask = document.getElementById('member-pay-mask');
        const panel = document.getElementById('member-pay-panel');
        if (mask) mask.remove();
        if (panel) panel.remove();
    },

    openMemberPayDialog(level, price, scopeValue) {
        this.closeMemberPayDialog();
        this.state.memberPayDraft = {
            level: String(level || ''),
            price: Number(price || 0),
            scopeValue: String(scopeValue || ''),
        };
        const transfer = this.getCorporateTransferInfo();
        const payCfg = this.getPaymentRuntimeConfig();
        const options = [];
        if (payCfg.wechatEnabled) options.push(`<button onclick="selectMemberPayMethod('wechat')" style="border:none;background:#07C160;color:white;padding:8px 14px;border-radius:10px;font-weight:600;">${payCfg.wechatLabel}</button>`);
        if (payCfg.alipayEnabled) options.push(`<button onclick="selectMemberPayMethod('alipay')" style="border:none;background:#1677FF;color:white;padding:8px 14px;border-radius:10px;font-weight:600;">${payCfg.alipayLabel}</button>`);
        if (payCfg.transferEnabled) options.push(`<button onclick="selectMemberPayMethod('bank_transfer')" style="border:none;background:#FF9500;color:white;padding:8px 14px;border-radius:10px;font-weight:600;">${payCfg.transferLabel}</button>`);
        if (options.length === 0) {
            this.showToast('未启用支付方式，请联系管理员');
            return;
        }
        const root = document.createElement('div');
        root.id = 'member-pay-root';
        root.style.cssText = 'position:fixed;inset:0;z-index:9999;display:block;';
        root.innerHTML = `
            <div id="member-pay-mask" onclick="closeMemberPayDialog()" style="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9998;"></div>
            <div id="member-pay-panel" style="position:fixed;left:0;right:0;bottom:0;z-index:9999;width:100%;max-width:680px;margin:0 auto;background:#fff;border-top-left-radius:16px;border-top-right-radius:16px;overflow:hidden;box-shadow:0 -10px 30px rgba(0,0,0,0.2);padding-bottom:calc(max(env(safe-area-inset-bottom), 0px));">
                <div class="city-selection-header" style="display:flex;align-items:center;padding:14px 16px 10px;border-bottom:1px solid #F0F1F3;">
                    <span style="font-size:18px;font-weight:700;">选择支付方式</span>
                    <span class="nav-right" onclick="closeMemberPayDialog()" style="position:static;margin-left:auto;">✕</span>
                </div>
                <div style="padding:14px 16px 18px 16px;max-height:58vh;overflow:auto;">
                    <div style="font-size:13px;color:#666;margin-bottom:10px;">请选择你要使用的支付方式：</div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;">
                        ${options.join('')}
                    </div>
                    <div id="member-pay-transfer-box" style="display:none;background:#F7F8FA;border-radius:10px;padding:10px 12px;font-size:12px;line-height:1.6;color:#333;">
                        <div>公司名：${transfer.companyName}</div>
                        <div>纳税人识别号：${transfer.taxNo}</div>
                        <div>地址：${transfer.address}</div>
                        <div>电话：${transfer.phone}</div>
                        <div>开户行：${transfer.bank}</div>
                        <div>账号：${transfer.account}</div>
                        <div style="display:flex;gap:8px;margin-top:10px;">
                            <button onclick="copyMemberTransferInfo()" style="border:none;background:#4B5563;color:white;padding:6px 10px;border-radius:8px;">复制收款信息</button>
                            <button onclick="submitMemberTransferPaid()" style="border:none;background:#FF9500;color:white;padding:6px 10px;border-radius:8px;">我已转账，提交开通</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        const body = document.body || document.getElementById('content-area');
        if (body && body.appendChild) body.appendChild(root);
    },

    async submitMemberPurchaseByMethod(payMethod) {
        const draft = this.state.memberPayDraft || {};
        const level = String(draft.level || '');
        const scopeValue = String(draft.scopeValue || '');
        if (!level) {
            this.showToast('订单参数缺失');
            return;
        }
        const apiBase = this.getApiBase();
        if (!apiBase) {
            this.showToast('未配置API地址');
            return;
        }
        try {
            if (payMethod === 'alipay') {
                const res = await this.requestJson(`${apiBase}/api/member/alipay/create`, {
                    method: 'POST',
                    body: { planCode: level, scopeValue }
                });
                const payUrl = String((res.json && res.json.data && res.json.data.payUrl) || '').trim();
                if (res.ok && res.json && res.json.code === 1 && payUrl) {
                    this.closeMemberPayDialog();
                    const opened = await this.openExternalUrl(payUrl);
                    if (opened) this.showToast('已打开支付宝，请完成支付后返回');
                    return;
                }
                const msg = (res.json && (res.json.msg || res.json.message)) || '支付宝下单失败';
                this.showToast(msg);
                return;
            }
            const res = await this.requestJson(`${apiBase}/api/member/purchase`, {
                method: 'POST',
                body: { planCode: level, scopeValue, payMethod }
            });
            if (res.ok && res.json && res.json.code === 1 && res.json.data) {
                const d = res.json.data;
                this.state.user.vipLevel = d.vipLevel || this.state.user.vipLevel;
                this.state.user.vipScopeValue = d.vipScopeValue || this.state.user.vipScopeValue;
                this.state.user.vipExpire = this.normalizeVipExpireText(d.vipExpire || d.vip_expire_at || this.state.user.vipExpire || '');
                if (typeof d.balance === 'number') this.state.user.balance = d.balance;
                this.saveUser();
                this.switchTab(2);
                this.closeMemberPayDialog();
                this.showToast('开通成功');
                return;
            }
            const msg = (res.json && (res.json.msg || res.json.message)) || '开通失败';
            this.showToast(msg);
        } catch (e) {
            this.showToast('开通失败');
        }
    },

    async selectMemberPayMethod(method) {
        const payMethod = String(method || '').trim().toLowerCase();
        if (payMethod === 'bank_transfer') {
            const box = document.getElementById('member-pay-transfer-box');
            if (box) box.style.display = 'block';
            return;
        }
        await this.submitMemberPurchaseByMethod(payMethod);
    },

    async submitMemberTransferPaid() {
        await this.submitMemberPurchaseByMethod('bank_transfer');
    },

    copyMemberTransferInfo() {
        const t = this.getCorporateTransferInfo();
        const text = `公司名：${t.companyName}\n纳税人识别号：${t.taxNo}\n地址：${t.address}\n电话：${t.phone}\n开户行：${t.bank}\n账号：${t.account}`;
        try {
            if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(() => this.showToast('收款信息已复制')).catch(() => this.showToast('复制失败，请手动复制'));
                return;
            }
        } catch (e) {}
        this.showToast('复制失败，请手动复制');
    },

    async buyMember(level, price) {
        try {
            if (!this.state.user.isLogged) {
                this.showToast('请先登录');
                this.login();
                return;
            }
            const planCode = String(level || 'city').trim();
            if (!['city', 'province', 'country'].includes(planCode)) {
                this.showToast('会员档位无效');
                return;
            }
            const trialUsage = (this.state.user && this.state.user.trialUsage) || {};
            if (trialUsage[planCode]) {
                this.showToast('该档位已试用过');
                return;
            }
            this.state.memberPurchasePlan = planCode;
            const province = this.getProvinceForCity(this.state.currentCity) || '';
            const city = this.state.currentCity !== '全国' ? this.state.currentCity : '';
            const scopeValue = planCode === 'city' ? city : (planCode === 'province' ? province : '全国');
            if (planCode !== 'country' && !scopeValue) {
                this.showToast('请先选择城市后再试用');
                return;
            }
            const apiBase = this.getApiBase();
            if (!apiBase) {
                this.showToast('未配置API地址');
                return;
            }
            const res = await this.requestJson(`${apiBase}/api/member/trial/start`, {
                method: 'POST',
                body: { planCode, scopeValue }
            });
            if (res.ok && res.json && res.json.code === 1 && res.json.data) {
                const d = res.json.data || {};
                if (!this.state.user.trialUsage) this.state.user.trialUsage = { city: false, province: false, country: false };
                this.state.user.trialUsage[planCode] = true;
                this.state.user.vipLevel = d.vipLevel || this.state.user.vipLevel;
                this.state.user.vipScopeValue = d.vipScopeValue || this.state.user.vipScopeValue;
                this.state.user.vipExpire = this.normalizeVipExpireText(d.vipExpire || d.vip_expire_at || this.state.user.vipExpire || '');
                if (typeof d.balance === 'number') this.state.user.balance = d.balance;
                this.saveUser();
                this.switchTab(2);
                this.showToast('试用开通成功');
                return;
            }
            const msg = (res.json && (res.json.msg || res.json.message)) || '试用开通失败';
            this.showToast(msg);
        } catch (e) {
            this.showToast('试用开通失败');
        }
    },

    selectMemberPurchasePlan(level) {
        const plan = String(level || '').trim();
        if (!['city', 'province', 'country'].includes(plan)) return;
        this.state.memberPurchasePlan = plan;
        this.refreshMemberCenterView();
    },

    selectMemberPurchaseMethod(method) {
        const m = String(method || '').trim().toLowerCase();
        if (!['wechat', 'alipay', 'bank_transfer'].includes(m)) return;
        this.state.memberPurchaseMethod = m;
        this.refreshMemberCenterView();
    },

    async submitMemberPurchase() {
        if (!this.state.user.isLogged) {
            this.showToast('请先登录');
            this.login();
            return;
        }
        const level = String(this.state.memberPurchasePlan || 'city');
        await this.buyMember(level, this.getPlanPrice(level, 0));
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

    isSuperAdmin() {
        const role = String((this.state.user && this.state.user.role) || '').toLowerCase();
        return role === 'superadmin';
    },

    isAdminUser() {
        const role = String((this.state.user && this.state.user.role) || '').toLowerCase();
        if (['superadmin', 'admin', 'ops_admin', 'order_admin', 'finance_admin', 'support_admin', 'auditor'].includes(role)) return true;
        return this.isSuperAdmin();
    },

    getAdminPinToken() {
        return this.safeStorageGet('ADMIN_PIN_TOKEN') || '';
    },

    setAdminPinToken(token) {
        this.safeStorageSet('ADMIN_PIN_TOKEN', String(token || ''));
    },

    getPlanByCode(code) {
        const rows = Array.isArray(this.state.memberPlans) ? this.state.memberPlans : [];
        return rows.find((x) => String(x.code || '') === String(code || '')) || null;
    },

    getPlanPrice(code, fallback) {
        const row = this.getPlanByCode(code);
        if (row && row.priceYuan != null) return Number(row.priceYuan || 0);
        const localPlanMap = (this.state.runtimeConfig && this.state.runtimeConfig['member.plan.prices']) || {};
        if (Object.prototype.hasOwnProperty.call(localPlanMap, code)) return Number(localPlanMap[code] || 0);
        return Number(fallback || 0);
    },

    getPlanDisplayPrice(code, fallbackPrice) {
        const price = Number(fallbackPrice || this.getPlanPrice(code, 0) || 0);
        if (!Number.isFinite(price)) return '¥0';
        return `¥${price}`;
    },

    async refreshAppleIapPrices() {
        if (!this.isNativeAppRuntime()) return;
        const plugin = this.getIapPlugin ? this.getIapPlugin() : null;
        if (!plugin || !plugin.getProducts) {
            this.state.appleIapPriceMap = {};
            return;
        }
        const plans = Array.isArray(this.state.memberPlans) ? this.state.memberPlans : [];
        const pairs = plans.map((p) => ({
            code: String((p && (p.code || p.planCode)) || '').trim(),
            productId: String((p && (p.appleProductId || p.apple_product_id)) || '').trim(),
        })).filter((x) => x.code && x.productId);
        if (pairs.length === 0) {
            this.state.appleIapPriceMap = {};
            return;
        }
        const productIds = [...new Set(pairs.map((x) => x.productId))];
        try {
            const ret = await plugin.getProducts({ productIds });
            const products = ret && Array.isArray(ret.products) ? ret.products : [];
            const productPriceMap = {};
            for (const p of products) {
                const pid = String((p && p.id) || '').trim();
                const displayPrice = String((p && p.displayPrice) || '').trim();
                if (pid && displayPrice) productPriceMap[pid] = displayPrice;
            }
            const byPlan = {};
            for (const row of pairs) {
                if (productPriceMap[row.productId]) byPlan[row.code] = productPriceMap[row.productId];
            }
            this.state.appleIapPriceMap = byPlan;
            if (this.state.currentTab === 2) this.refreshMemberCenterView();
        } catch (e) {
            this.state.appleIapPriceMap = {};
        }
    },

    getFeatureFlag(flag, fallback = true) {
        const map = (this.state.runtimeConfig && this.state.runtimeConfig['feature.flags']) || {};
        if (Object.prototype.hasOwnProperty.call(map, flag)) return !!map[flag];
        return !!fallback;
    },

    isAdminAccessDeniedMsg(msg) {
        const text = String(msg || '').toLowerCase();
        return text.includes('access denied') || text.includes('admin only') || text.includes('仅超级管理员') || text.includes('权限');
    },

    isAuthInvalidMsg(msg) {
        const text = String(msg || '').toLowerCase();
        return text.includes('invalid token') || text.includes('unauthorized') || text.includes('token expired') || text.includes('jwt');
    },

    applyLocalAdminConfig(key, value) {
        const cfg = this.state.runtimeConfig || {};
        cfg[key] = value;
        this.state.runtimeConfig = cfg;
        this.saveRuntimeConfig();
        if (key === 'copy.auth') this.applyRuntimeCopyToAuthModal();
        if (key === 'copy.banner') this.renderRuntimeBanner();
        if (key === 'notice.popup') this.maybeShowRuntimeNotice(true);
        if (key === 'copy.member' && this.state.currentTab === 2) this.refreshMemberCenterView();
    },

    setAdminPublishStatus(mode, hint = '') {
        this.state.adminPublishMode = mode === 'local' ? 'local' : 'online';
        this.state.adminPublishHint = String(hint || '').trim();
    },

    getAdminPublishStatusText() {
        return this.state.adminPublishMode === 'local' ? '本地预览发布' : '线上发布';
    },

    async verifyAdminPin(pin) {
        const apiBase = this.getApiBase();
        if (!apiBase) return { ok: false, msg: 'API地址不可用' };
        const res = await this.requestJson(`${apiBase}/api/admin/pin/verify`, {
            method: 'POST',
            body: { pin }
        });
        if (res.ok && res.json && res.json.code === 1 && res.json.data && res.json.data.pinToken) {
            this.setAdminPinToken(String(res.json.data.pinToken));
            return { ok: true };
        }
        const msg = (res.json && (res.json.msg || res.json.message)) || 'PIN验证失败';
        return { ok: false, msg };
    },

    getAdminAuthHeaders() {
        const token = this.getAdminPinToken();
        if (!token) return {};
        return { 'x-admin-pin-token': token };
    },

    async openAdminDrawer() {
        if (!this.state.user.isLogged || !this.isAdminUser()) return;
        if (!this.getFeatureFlag('adminDrawerEnabled', true)) {
            this.showToast('管理后台已关闭');
            return;
        }
        const token = this.getAdminPinToken();
        if (!token) {
            const pin = prompt('请输入超级管理员PIN码');
            if (!pin) return;
            const ret = await this.verifyAdminPin(String(pin).trim());
            if (!ret.ok) {
                this.showToast(ret.msg || 'PIN验证失败');
                return;
            }
        }
        this.state.adminDrawerOpen = true;
        this.refreshMemberCenterView();
        this.refreshAdminDbHealth();
    },

    closeAdminDrawer() {
        this.state.adminDrawerOpen = false;
        this.refreshMemberCenterView();
    },

    refreshMemberCenterView() {
        if (this.state.currentTab !== 2) return;
        const area = document.getElementById('content-area');
        if (area) {
            try {
                area.innerHTML = this.getMemberCenterHTML();
            } catch (e) {
                const errText = String((e && e.message) || e || '未知错误');
                area.innerHTML = `<div style="padding:16px;"><div style="background:#fff;border-radius:12px;padding:16px;color:#333;">会员中心加载失败：${errText}</div></div>`;
                console.error('member center refresh error', e);
            }
        }
        const user = this.state.user || {};
        const needRecover = !!(user.isLogged && user.vipLevel !== 'free' && !this.normalizeVipExpireText(user.vipExpire || user.vipExpireRaw || ''));
        if (needRecover && !this.state.vipExpireRecovering) {
            this.state.vipExpireRecovering = true;
            this.recoverVipExpireFromOrders().then((txt) => {
                this.state.vipExpireRecovering = false;
                if (txt && this.state.currentTab === 2) {
                    const box = document.getElementById('content-area');
                    if (box) {
                        try {
                            box.innerHTML = this.getMemberCenterHTML();
                        } catch (e) {
                            const errText = String((e && e.message) || e || '未知错误');
                            box.innerHTML = `<div style="padding:16px;"><div style="background:#fff;border-radius:12px;padding:16px;color:#333;">会员中心加载失败：${errText}</div></div>`;
                            console.error('member center recover render error', e);
                        }
                    }
                }
            }).catch(() => {
                this.state.vipExpireRecovering = false;
            });
        }
    },

    async openAdminPanel(action) {
        if (!this.isAdminUser()) return;
        this.state.adminDrawerOpen = false;
        this.state.adminPanelType = String(action || '');
        this.state.adminPanelOpen = true;
        this.refreshAdminDbHealth();
        if (action === 'audit') {
            await this.refreshAdminAudit();
        }
        if (action === 'plans') {
            await this.refreshAdminMemberPlans();
        }
        if (action === 'members') {
            await this.refreshAdminMembers();
        }
        if (action === 'orders') {
            this.state.adminOrderSelectedIds = [];
            await this.refreshAdminOrders();
        }
        if (action === 'codes') {
            this.state.adminCodeSelected = [];
            await this.refreshAdminActivationCodes();
        }
        if (action === 'rewards') {
            await this.refreshAdminRewards();
        }
        if (action === 'auth') {
            await this.refreshAdminAuth();
        }
        if (action === 'info') {
            await this.refreshAdminInfo(1, false);
        }
        this.refreshMemberCenterView();
    },

    async refreshAdminDbHealth() {
        const apiBase = this.getApiBase();
        if (!apiBase) return;
        this.state.adminDbHealth = {
            status: 'checking',
            text: '检测中',
            hint: '',
            checkedAt: Date.now()
        };
        this.state.adminSyncAlert = {
            active: false,
            text: '同步状态检测中',
            meta: '',
            checkedAt: Date.now()
        };
        this.refreshMemberCenterView();
        try {
            const res = await this.requestJson(`${apiBase}/api/health/db`);
            const payload = (res && res.json && res.json.data) ? res.json.data : null;
            if (res.ok && res.json && res.json.success && payload) {
                const dialect = String(payload.dialect || '').toLowerCase();
                const requireMySQL = !!payload.requireMySQL;
                const tableCount = Number(payload.tableCount || 0);
                const host = String(payload.host || '');
                const ok = dialect === 'mysql' && requireMySQL;
                this.state.adminDbHealth = {
                    status: ok ? 'ok' : 'warn',
                    text: ok ? '云端正常' : '未强制云端',
                    hint: `${dialect || 'unknown'} · ${tableCount}表${host ? ` · ${host}` : ''}`,
                    checkedAt: Date.now()
                };
            } else if (res.ok && res.json && res.json.success) {
                const msg = String((res.json && (res.json.message || res.json.msg)) || '').trim();
                this.state.adminDbHealth = {
                    status: 'warn',
                    text: '接口未升级',
                    hint: msg || '服务可用，但未返回数据库详情',
                    checkedAt: Date.now()
                };
            } else {
                this.state.adminDbHealth = {
                    status: 'down',
                    text: '连接异常',
                    hint: String((res.json && (res.json.error || res.json.message)) || `HTTP ${Number(res.status || 0)}`),
                    checkedAt: Date.now()
                };
            }
        } catch (e) {
            this.state.adminDbHealth = {
                status: 'down',
                text: '连接异常',
                hint: '网络错误',
                checkedAt: Date.now()
            };
        }
        try {
            const syncRes = await this.requestJson(`${apiBase}/api/scheduler/status`);
            const sync = syncRes && syncRes.ok && syncRes.json && syncRes.json.code === 1 && syncRes.json.data ? (syncRes.json.data.sync || {}) : null;
            if (sync) {
                const lagMin = Number(sync.lagMin || -1);
                const lagAlertMin = Number(sync.lagAlertMin || 15);
                const alertActive = !!sync.alertActive;
                const reason = String(sync.alertReason || '');
                const successAtCst = String(sync.successAtCst || '');
                const baseText = alertActive
                    ? `同步告警：${reason || (lagMin >= 0 ? `延迟${lagMin}分钟` : '同步异常')}`
                    : `同步正常：延迟${lagMin >= 0 ? lagMin : '--'}分钟`;
                const meta = `${successAtCst ? `最近成功 ${successAtCst}` : '暂无成功同步'} · 阈值${lagAlertMin}分钟`;
                this.state.adminSyncAlert = {
                    active: alertActive,
                    text: baseText,
                    meta,
                    checkedAt: Date.now()
                };
            } else {
                this.state.adminSyncAlert = {
                    active: true,
                    text: '同步告警：状态接口不可用',
                    meta: '请检查调度服务',
                    checkedAt: Date.now()
                };
            }
        } catch (e) {
            this.state.adminSyncAlert = {
                active: true,
                text: '同步告警：状态接口请求失败',
                meta: '请检查网络或服务',
                checkedAt: Date.now()
            };
        }
        this.refreshMemberCenterView();
    },

    closeAdminPanel() {
        this.state.adminPanelOpen = false;
        this.state.adminPanelType = '';
        this.refreshMemberCenterView();
    },

    async refreshAdminAudit() {
        const apiBase = this.getApiBase();
        if (!apiBase) {
            this.state.adminAuditRows = [];
            this.refreshMemberCenterView();
            return;
        }
        const headers = this.getAdminAuthHeaders();
        const logRes = await this.requestJson(`${apiBase}/api/admin/audit-logs`, { headers });
        if (!(logRes.ok && logRes.json && logRes.json.code === 1)) {
            const msg = (logRes.json && (logRes.json.msg || logRes.json.message)) || '读取日志失败';
            if (this.isAdminAccessDeniedMsg(msg)) {
                this.state.adminAuditRows = [];
                this.refreshMemberCenterView();
                this.showToast('线上未授予超管日志权限');
                return;
            }
            this.showToast(msg);
            return;
        }
        this.state.adminAuditRows = Array.isArray(logRes.json.data) ? logRes.json.data : [];
        this.refreshMemberCenterView();
    },

    async refreshAdminMemberPlans() {
        const apiBase = this.getApiBase();
        if (!apiBase) return;
        const headers = this.getAdminAuthHeaders();
        const rowsRes = await this.requestJson(`${apiBase}/api/admin/member-plans`, { headers });
        if (rowsRes.ok && rowsRes.json && rowsRes.json.code === 1 && Array.isArray(rowsRes.json.data)) {
            this.state.memberPlans = rowsRes.json.data;
            return;
        }
        const msg = (rowsRes.json && (rowsRes.json.msg || rowsRes.json.message)) || '';
        if (this.isAdminAccessDeniedMsg(msg)) {
            const localMap = (this.state.runtimeConfig && this.state.runtimeConfig['member.plan.prices']) || {};
            this.state.memberPlans = [
                { code: 'city', priceYuan: Number(localMap.city || 399) },
                { code: 'province', priceYuan: Number(localMap.province || 999) },
                { code: 'country', priceYuan: Number(localMap.country || 2999) },
            ];
        }
    },

    async refreshAdminMembers(page = 1) {
        const apiBase = this.getApiBase();
        if (!apiBase) return;
        const headers = this.getAdminAuthHeaders();
        const keyword = this.getAdminInputValue('adm-member-keyword', this.state.adminMemberFilterKeyword || '').trim();
        this.state.adminMemberFilterKeyword = keyword;
        const p = Math.max(1, Number(page || 1));
        const pageSize = this.state.adminMemberPageSize || 20;
        const query = `page=${p}&pageSize=${pageSize}&keyword=${encodeURIComponent(keyword)}`;
        const res = await this.requestJson(`${apiBase}/api/admin/members?${query}`, { headers });
        if (res.ok && res.json && res.json.code === 1 && res.json.data) {
            this.state.adminMemberRows = Array.isArray(res.json.data.rows) ? res.json.data.rows : [];
            this.state.adminMemberTotal = Number(res.json.data.total || 0);
            this.state.adminMemberPage = Number(res.json.data.page || p);
            this.refreshMemberCenterView();
        }
    },

    async refreshAdminInfo(page = 1, append = false) {
        const apiBase = this.getApiBase();
        if (!apiBase) {
            this.showToast('接口地址不可用');
            return;
        }
        const headers = this.getAdminAuthHeaders();
        const p = Math.max(1, Number(page || 1));
        const pageSize = this.state.adminInfoPageSize || 20;
        const listRes = await this.requestJson(`${apiBase}/api/admin/info/latest?page=${p}&pageSize=${pageSize}`, { headers });
        const listMsg = (listRes.json && (listRes.json.msg || listRes.json.message)) || '';
        if (listRes.ok && listRes.json && listRes.json.code === 1 && listRes.json.data) {
            const rows = Array.isArray(listRes.json.data.rows) ? listRes.json.data.rows : [];
            this.state.adminInfoRows = append ? [...(this.state.adminInfoRows || []), ...rows] : rows;
            this.state.adminInfoTotal = Number(listRes.json.data.total || 0);
            this.state.adminInfoPage = Number(listRes.json.data.page || p);
        } else if (this.isAuthInvalidMsg(listMsg)) {
            this.setAuthToken('');
            this.state.user = this.getEmptyUserState();
            this.saveUser();
            this.state.adminPanelOpen = false;
            this.showToast('登录已失效，请重新登录');
            this.openLoginModal();
            this.refreshMemberCenterView();
            return;
        } else if (this.isAdminAccessDeniedMsg(listMsg)) {
            this.showToast('线上未授予超管信息查看权限');
        } else if (!append) {
            this.showToast(listMsg || '信息管理读取失败');
        }
        const sumRes = await this.requestJson(`${apiBase}/api/admin/info/overview`, { headers });
        const sumMsg = (sumRes.json && (sumRes.json.msg || sumRes.json.message)) || '';
        if (sumRes.ok && sumRes.json && sumRes.json.code === 1 && sumRes.json.data) {
            this.state.adminInfoYesterday = sumRes.json.data.yesterday || null;
            this.state.adminInfoTotalSummary = sumRes.json.data.totalUntilYesterday || null;
        } else if (!append && !this.isAdminAccessDeniedMsg(listMsg)) {
            this.showToast(sumMsg || '信息统计读取失败');
        }
        this.refreshMemberCenterView();
    },

    async loadMoreAdminInfo() {
        const total = Number(this.state.adminInfoTotal || 0);
        const loaded = Array.isArray(this.state.adminInfoRows) ? this.state.adminInfoRows.length : 0;
        if (loaded >= total) return;
        const next = Number(this.state.adminInfoPage || 1) + 1;
        await this.refreshAdminInfo(next, true);
    },

    getAdminInputValue(id, fallback = '') {
        const el = document.getElementById(id);
        if (!el) return fallback;
        return String(el.value == null ? fallback : el.value);
    },

    buildAdminCsv(rows) {
        const esc = (v) => {
            const s = String(v == null ? '' : v);
            if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
            return s;
        };
        return rows.map((row) => row.map((x) => esc(x)).join(',')).join('\n');
    },

    downloadTextFile(filename, text, mimeType = 'text/plain;charset=utf-8') {
        try {
            const blob = new Blob([text], { type: mimeType });
            const link = document.createElement('a');
            const href = URL.createObjectURL(blob);
            link.href = href;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(href), 500);
            return true;
        } catch (e) {
            return false;
        }
    },

    async fetchAdminCsv(url) {
        const res = await this.requestJson(url, { headers: this.getAdminAuthHeaders() });
        if (!(res && res.ok)) return '';
        if (typeof res.json === 'string') return res.json;
        return '';
    },

    async exportAdminOrdersCsv() {
        const apiBase = this.getApiBase();
        if (!apiBase) return;
        const query = `export=1&keyword=${encodeURIComponent(this.state.adminOrderFilterKeyword || '')}&status=${encodeURIComponent(this.state.adminOrderFilterStatus || '')}&userId=${encodeURIComponent(this.state.adminOrderFilterUserId || '')}&startDate=${encodeURIComponent(this.state.adminOrderFilterStartDate || '')}&endDate=${encodeURIComponent(this.state.adminOrderFilterEndDate || '')}`;
        const csv = await this.fetchAdminCsv(`${apiBase}/api/admin/orders?${query}`);
        if (!csv) {
            this.showToast('导出失败');
            return;
        }
        const ok = this.downloadTextFile(`orders-${Date.now()}.csv`, csv, 'text/csv;charset=utf-8');
        if (!ok) {
            const copied = await this.copyToClipboard(csv);
            this.showToast(copied ? '下载失败，已复制CSV' : '导出失败');
            return;
        }
        this.showToast('订单CSV已下载');
    },

    async exportAdminCodesCsv() {
        const apiBase = this.getApiBase();
        if (!apiBase) return;
        const query = `export=1&keyword=${encodeURIComponent(this.state.adminCodeFilterKeyword || '')}&planCode=${encodeURIComponent(this.state.adminCodeFilterPlan || '')}&isActive=${encodeURIComponent(this.state.adminCodeFilterActive || '')}`;
        const csv = await this.fetchAdminCsv(`${apiBase}/api/admin/activation-codes?${query}`);
        if (!csv) {
            this.showToast('导出失败');
            return;
        }
        const ok = this.downloadTextFile(`activation-codes-${Date.now()}.csv`, csv, 'text/csv;charset=utf-8');
        if (!ok) {
            const copied = await this.copyToClipboard(csv);
            this.showToast(copied ? '下载失败，已复制CSV' : '导出失败');
            return;
        }
        this.showToast('激活码CSV已下载');
    },

    async exportAdminRewardsCsv() {
        const apiBase = this.getApiBase();
        if (!apiBase) return;
        const query = `export=1&status=${encodeURIComponent(this.state.adminRewardFilterStatus || '')}`;
        const csv = await this.fetchAdminCsv(`${apiBase}/api/admin/rewards/records?${query}`);
        if (!csv) {
            this.showToast('导出失败');
            return;
        }
        const ok = this.downloadTextFile(`rewards-${Date.now()}.csv`, csv, 'text/csv;charset=utf-8');
        if (!ok) {
            const copied = await this.copyToClipboard(csv);
            this.showToast(copied ? '下载失败，已复制CSV' : '导出失败');
            return;
        }
        this.showToast('奖励CSV已下载');
    },

    toggleAdminOrderSelect(id) {
        const sid = Number(id || 0);
        const set = new Set(this.state.adminOrderSelectedIds || []);
        if (set.has(sid)) set.delete(sid);
        else set.add(sid);
        this.state.adminOrderSelectedIds = Array.from(set);
    },

    toggleAdminCodeSelect(code) {
        const key = String(code || '');
        const set = new Set(this.state.adminCodeSelected || []);
        if (set.has(key)) set.delete(key);
        else set.add(key);
        this.state.adminCodeSelected = Array.from(set);
    },

    async batchUpdateAdminOrders(status) {
        const ids = Array.isArray(this.state.adminOrderSelectedIds) ? this.state.adminOrderSelectedIds : [];
        if (!ids.length) {
            this.showToast('请先勾选订单');
            return;
        }
        const apiBase = this.getApiBase();
        if (!apiBase) return;
        const headers = this.getAdminAuthHeaders();
        const res = await this.requestJson(`${apiBase}/api/admin/orders/batch-status`, { method: 'POST', headers, body: { ids, status } });
        if (res.ok && res.json && res.json.code === 1) {
            this.state.adminOrderSelectedIds = [];
            this.showToast('批量更新成功');
            await this.refreshAdminOrders(this.state.adminOrderPage || 1);
        } else {
            this.showToast((res.json && (res.json.msg || res.json.message)) || '批量更新失败');
        }
    },

    async batchToggleAdminCodes(isActive) {
        const codes = Array.isArray(this.state.adminCodeSelected) ? this.state.adminCodeSelected : [];
        if (!codes.length) {
            this.showToast('请先勾选激活码');
            return;
        }
        const apiBase = this.getApiBase();
        if (!apiBase) return;
        const headers = this.getAdminAuthHeaders();
        const res = await this.requestJson(`${apiBase}/api/admin/activation-codes/batch-toggle`, { method: 'POST', headers, body: { codes, isActive: !!isActive } });
        if (res.ok && res.json && res.json.code === 1) {
            this.state.adminCodeSelected = [];
            this.showToast('批量更新成功');
            await this.refreshAdminActivationCodes(this.state.adminCodePage || 1);
        } else {
            this.showToast((res.json && (res.json.msg || res.json.message)) || '批量更新失败');
        }
    },

    async refreshAdminOrders(page = 1) {
        const apiBase = this.getApiBase();
        if (!apiBase) return;
        const headers = this.getAdminAuthHeaders();
        const keyword = this.getAdminInputValue('adm-order-keyword', this.state.adminOrderFilterKeyword || '').trim();
        const status = this.getAdminInputValue('adm-order-status', this.state.adminOrderFilterStatus || '').trim();
        const userId = this.getAdminInputValue('adm-order-user-id', this.state.adminOrderFilterUserId || '').trim();
        const startDate = this.getAdminInputValue('adm-order-start-date', this.state.adminOrderFilterStartDate || '').trim();
        const endDate = this.getAdminInputValue('adm-order-end-date', this.state.adminOrderFilterEndDate || '').trim();
        this.state.adminOrderFilterKeyword = keyword;
        this.state.adminOrderFilterStatus = status;
        this.state.adminOrderFilterUserId = userId;
        this.state.adminOrderFilterStartDate = startDate;
        this.state.adminOrderFilterEndDate = endDate;
        const p = Math.max(1, Number(page || 1));
        const pageSize = this.state.adminOrderPageSize || 20;
        const query = `page=${p}&pageSize=${pageSize}&keyword=${encodeURIComponent(keyword)}&status=${encodeURIComponent(status)}&userId=${encodeURIComponent(userId)}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
        const res = await this.requestJson(`${apiBase}/api/admin/orders?${query}`, { headers });
        if (res.ok && res.json && res.json.code === 1 && res.json.data) {
            this.state.adminOrderRows = Array.isArray(res.json.data.rows) ? res.json.data.rows : [];
            this.state.adminOrderTotal = Number(res.json.data.total || 0);
            this.state.adminOrderPage = Number(res.json.data.page || p);
            this.refreshMemberCenterView();
        }
    },

    async refreshAdminActivationCodes(page = 1) {
        const apiBase = this.getApiBase();
        if (!apiBase) return;
        const headers = this.getAdminAuthHeaders();
        const keyword = this.getAdminInputValue('adm-code-keyword', this.state.adminCodeFilterKeyword || '').trim();
        const planCode = this.getAdminInputValue('adm-code-filter-plan', this.state.adminCodeFilterPlan || '').trim();
        const isActive = this.getAdminInputValue('adm-code-filter-active', this.state.adminCodeFilterActive || '').trim();
        this.state.adminCodeFilterKeyword = keyword;
        this.state.adminCodeFilterPlan = planCode;
        this.state.adminCodeFilterActive = isActive;
        const p = Math.max(1, Number(page || 1));
        const pageSize = this.state.adminCodePageSize || 30;
        const query = `page=${p}&pageSize=${pageSize}&keyword=${encodeURIComponent(keyword)}&planCode=${encodeURIComponent(planCode)}&isActive=${encodeURIComponent(isActive)}`;
        const res = await this.requestJson(`${apiBase}/api/admin/activation-codes?${query}`, { headers });
        if (res.ok && res.json && res.json.code === 1 && res.json.data) {
            this.state.adminCodeRows = Array.isArray(res.json.data.rows) ? res.json.data.rows : [];
            this.state.adminCodeTotal = Number(res.json.data.total || 0);
            this.state.adminCodePage = Number(res.json.data.page || p);
            this.refreshMemberCenterView();
        }
    },

    async refreshAdminRewards(page = 1) {
        const apiBase = this.getApiBase();
        if (!apiBase) return;
        const headers = this.getAdminAuthHeaders();
        const sumRes = await this.requestJson(`${apiBase}/api/admin/rewards/summary`, { headers });
        if (sumRes.ok && sumRes.json && sumRes.json.code === 1) {
            this.state.adminRewardSummary = sumRes.json.data || null;
        }
        const status = this.getAdminInputValue('adm-reward-status', this.state.adminRewardFilterStatus || '').trim();
        this.state.adminRewardFilterStatus = status;
        const p = Math.max(1, Number(page || 1));
        const pageSize = this.state.adminRewardPageSize || 30;
        const listRes = await this.requestJson(`${apiBase}/api/admin/rewards/records?page=${p}&pageSize=${pageSize}&status=${encodeURIComponent(status)}`, { headers });
        if (listRes.ok && listRes.json && listRes.json.code === 1 && listRes.json.data) {
            const data = listRes.json.data;
            this.state.adminRewardRows = Array.isArray(data.rows) ? data.rows : [];
            this.state.adminRewardTotal = Number(data.count || 0);
            this.state.adminRewardPage = p;
        }
        this.refreshMemberCenterView();
    },

    nextAdminOrdersPage() {
        const totalPages = Math.max(1, Math.ceil(Number(this.state.adminOrderTotal || 0) / Number(this.state.adminOrderPageSize || 20)));
        const next = Math.min(totalPages, Number(this.state.adminOrderPage || 1) + 1);
        this.refreshAdminOrders(next);
    },

    prevAdminOrdersPage() {
        const prev = Math.max(1, Number(this.state.adminOrderPage || 1) - 1);
        this.refreshAdminOrders(prev);
    },

    nextAdminCodesPage() {
        const totalPages = Math.max(1, Math.ceil(Number(this.state.adminCodeTotal || 0) / Number(this.state.adminCodePageSize || 30)));
        const next = Math.min(totalPages, Number(this.state.adminCodePage || 1) + 1);
        this.refreshAdminActivationCodes(next);
    },

    prevAdminCodesPage() {
        const prev = Math.max(1, Number(this.state.adminCodePage || 1) - 1);
        this.refreshAdminActivationCodes(prev);
    },

    nextAdminRewardsPage() {
        const totalPages = Math.max(1, Math.ceil(Number(this.state.adminRewardTotal || 0) / Number(this.state.adminRewardPageSize || 30)));
        const next = Math.min(totalPages, Number(this.state.adminRewardPage || 1) + 1);
        this.refreshAdminRewards(next);
    },

    prevAdminRewardsPage() {
        const prev = Math.max(1, Number(this.state.adminRewardPage || 1) - 1);
        this.refreshAdminRewards(prev);
    },

    nextAdminMembersPage() {
        const totalPages = Math.max(1, Math.ceil(Number(this.state.adminMemberTotal || 0) / Number(this.state.adminMemberPageSize || 20)));
        const next = Math.min(totalPages, Number(this.state.adminMemberPage || 1) + 1);
        this.refreshAdminMembers(next);
    },

    prevAdminMembersPage() {
        const prev = Math.max(1, Number(this.state.adminMemberPage || 1) - 1);
        this.refreshAdminMembers(prev);
    },

    async refreshAdminAuth() {
        const apiBase = this.getApiBase();
        if (!apiBase) return;
        const headers = this.getAdminAuthHeaders();
        const res = await this.requestJson(`${apiBase}/api/admin/auth/permissions`, { headers });
        if (res.ok && res.json && res.json.code === 1) {
            this.state.adminAuthRows = Array.isArray(res.json.data) ? res.json.data : [];
            this.refreshMemberCenterView();
        }
    },

    async updateAdminOrderStatus(id, status) {
        const apiBase = this.getApiBase();
        if (!apiBase) return;
        const headers = this.getAdminAuthHeaders();
        const res = await this.requestJson(`${apiBase}/api/admin/orders/${Number(id || 0)}/status`, { method: 'POST', headers, body: { status } });
        if (res.ok && res.json && res.json.code === 1) {
            this.showToast('订单状态已更新');
            await this.refreshAdminOrders();
        } else {
            this.showToast((res.json && (res.json.msg || res.json.message)) || '更新失败');
        }
    },

    async toggleAdminActivationCode(code, nextActive) {
        const apiBase = this.getApiBase();
        if (!apiBase) return;
        const headers = this.getAdminAuthHeaders();
        const res = await this.requestJson(`${apiBase}/api/admin/activation-codes/${encodeURIComponent(String(code || ''))}/toggle`, {
            method: 'POST',
            headers,
            body: { isActive: !!nextActive }
        });
        if (res.ok && res.json && res.json.code === 1) {
            this.showToast(nextActive ? '激活码已启用' : '激活码已停用');
            await this.refreshAdminActivationCodes();
        } else {
            this.showToast((res.json && (res.json.msg || res.json.message)) || '操作失败');
        }
    },

    async batchCreateActivationCodes() {
        const apiBase = this.getApiBase();
        if (!apiBase) return;
        const headers = this.getAdminAuthHeaders();
        const count = Number((document.getElementById('adm-code-count') || {}).value || 0);
        const planCode = String((document.getElementById('adm-code-plan') || {}).value || 'country');
        const durationDays = Number((document.getElementById('adm-code-days') || {}).value || 365);
        const maxUses = Number((document.getElementById('adm-code-uses') || {}).value || 1);
        const scopeMode = String((document.getElementById('adm-code-scope-mode') || {}).value || 'fixed');
        const scopeValue = String((document.getElementById('adm-code-scope-value') || {}).value || '').trim();
        const res = await this.requestJson(`${apiBase}/api/admin/activation-codes/batch-generate`, {
            method: 'POST',
            headers,
            body: { count, planCode, durationDays, maxUses, scopeMode, scopeValue }
        });
        if (res.ok && res.json && res.json.code === 1) {
            const codes = (((res.json || {}).data || {}).codes || []).slice(0, 6).join('、');
            this.showToast(codes ? `已生成：${codes}` : '已生成激活码');
            await this.refreshAdminActivationCodes();
        } else {
            this.showToast((res.json && (res.json.msg || res.json.message)) || '生成失败');
        }
    },

    async grantMemberVip() {
        const apiBase = this.getApiBase();
        if (!apiBase) return;
        const headers = this.getAdminAuthHeaders();
        const userId = Number((document.getElementById('adm-member-user-id') || {}).value || 0);
        const planCode = String((document.getElementById('adm-member-plan') || {}).value || 'country');
        const durationDays = Number((document.getElementById('adm-member-days') || {}).value || 365);
        const scopeValue = String((document.getElementById('adm-member-scope') || {}).value || '').trim();
        const res = await this.requestJson(`${apiBase}/api/admin/members/${userId}/vip/grant`, {
            method: 'POST',
            headers,
            body: { planCode, durationDays, scopeValue }
        });
        if (res.ok && res.json && res.json.code === 1) {
            this.showToast('会员权益已发放');
            await this.refreshAdminMembers();
        } else {
            this.showToast((res.json && (res.json.msg || res.json.message)) || '发放失败');
        }
    },

    async resetAdminMemberPassword(userId, retried = false) {
        const apiBase = this.getApiBase();
        if (!apiBase) return;
        const uid = Number(userId || 0);
        if (!uid) {
            this.showToast('用户ID无效');
            return;
        }
        const newPassword = String(prompt('请输入新密码（至少6位）') || '').trim();
        if (!newPassword || newPassword.length < 6) {
            this.showToast('新密码至少6位');
            return;
        }
        const headers = this.getAdminAuthHeaders();
        const candidates = [
            { url: `${apiBase}/api/admin/members/${uid}/reset-password`, method: 'POST', body: { newPassword } },
            { url: `${apiBase}/api/admin/users/${uid}/reset-password`, method: 'POST', body: { newPassword } },
            { url: `${apiBase}/api/admin/users/${uid}/password`, method: 'PUT', body: { newPassword } },
            { url: `${apiBase}/api/admin/users/${uid}/password/reset`, method: 'POST', body: { newPassword } },
            { url: `${apiBase}/api/admin/users/${uid}`, method: 'PATCH', body: { password: newPassword } },
        ];
        let res = { ok: false, status: 0, json: null };
        let lastMsg = '';
        for (const c of candidates) {
            res = await this.requestJson(c.url, {
                method: c.method,
                headers,
                body: c.body
            });
            const m = String((res.json && (res.json.msg || res.json.message)) || '');
            if (res.ok && (m || res.json)) {
                lastMsg = m;
            }
            const quickOk = !!(res.ok && (
                (res.json && typeof res.json === 'object' && (res.json.code === 1 || res.json.success === true)) ||
                (typeof res.json === 'string' && /success|成功|reset|updated/i.test(res.json)) ||
                /success|成功|reset|updated/i.test(m)
            ));
            if (quickOk) break;
            const status = Number(res.status || 0);
            if (status !== 404) {
                lastMsg = m;
            }
            if (![404, 405].includes(status)) break;
        }
        const resetMsg = String((res.json && (res.json.msg || res.json.message)) || '');
        const resetOk = !!(res.ok && (
            (res.json && typeof res.json === 'object' && (res.json.code === 1 || res.json.success === true)) ||
            (!res.json) ||
            (typeof res.json === 'string' && /success|成功|reset|updated/i.test(res.json)) ||
            /success|成功|reset|updated/i.test(resetMsg)
        ));
        if (resetOk) {
            this.showToast('密码已重置');
        } else {
            const msg = resetMsg || lastMsg;
            const needPin = Number(res.status || 0) === 401 || /PIN二次验证|PIN验证已失效/.test(msg);
            if (needPin && !retried) {
                const pin = prompt('PIN已失效，请重新输入PIN码');
                if (pin) {
                    const v = await this.verifyAdminPin(String(pin).trim());
                    if (v.ok) return await this.resetAdminMemberPassword(uid, true);
                    this.showToast(v.msg || 'PIN验证失败');
                    return;
                }
            }
            const fallback = res && res.status ? `重置失败(${res.status})` : '重置失败';
            this.showToast(msg || fallback);
        }
    },

    async deleteAdminMember(userId, username = '', retried = false) {
        const apiBase = this.getApiBase();
        if (!apiBase) return;
        const uid = Number(userId || 0);
        if (!uid) {
            this.showToast('用户ID无效');
            return;
        }
        const name = String(username || '').trim() || `#${uid}`;
        if (!confirm(`确认删除用户 ${name} 吗？`)) return;
        const headers = this.getAdminAuthHeaders();
        let res = await this.requestJson(`${apiBase}/api/admin/members/${uid}`, {
            method: 'DELETE',
            headers
        });
        if (!(res.ok && res.json && res.json.code === 1) && Number(res.status || 0) === 404) {
            res = await this.requestJson(`${apiBase}/api/admin/users/${uid}`, {
                method: 'DELETE',
                headers
            });
        }
        const delMsg = String((res.json && (res.json.msg || res.json.message)) || '');
        const delOk = !!(res.ok && (
            (res.json && typeof res.json === 'object' && (res.json.code === 1 || res.json.success === true)) ||
            (!res.json) ||
            (typeof res.json === 'string' && /success|deleted|成功/i.test(res.json)) ||
            /success|deleted|成功/i.test(delMsg)
        ));
        if (delOk) {
            this.showToast('用户已删除');
            await this.refreshAdminMembers(this.state.adminMemberPage || 1);
        } else {
            const msg = delMsg;
            const needPin = Number(res.status || 0) === 401 || /PIN二次验证|PIN验证已失效/.test(msg);
            if (needPin && !retried) {
                const pin = prompt('PIN已失效，请重新输入PIN码');
                if (pin) {
                    const v = await this.verifyAdminPin(String(pin).trim());
                    if (v.ok) return await this.deleteAdminMember(uid, username, true);
                    this.showToast(v.msg || 'PIN验证失败');
                    return;
                }
            }
            const fallback = res && res.status ? `删除失败(${res.status})` : '删除失败';
            this.showToast(msg || fallback);
        }
    },

    async grantAdminRole() {
        const apiBase = this.getApiBase();
        if (!apiBase) return;
        const headers = this.getAdminAuthHeaders();
        const userId = Number((document.getElementById('adm-auth-user-id') || {}).value || 0);
        const role = String((document.getElementById('adm-auth-role') || {}).value || '').trim();
        const permsRaw = String((document.getElementById('adm-auth-perms') || {}).value || '').trim();
        const permissions = permsRaw ? permsRaw.split(',').map((x) => x.trim()).filter(Boolean) : [];
        const res = await this.requestJson(`${apiBase}/api/admin/auth/grant`, {
            method: 'POST',
            headers,
            body: { userId, role, permissions }
        });
        if (res.ok && res.json && res.json.code === 1) {
            this.showToast('管理员授权成功');
            await this.refreshAdminAuth();
        } else {
            this.showToast((res.json && (res.json.msg || res.json.message)) || '授权失败');
        }
    },

    async saveAdminPanel() {
        const action = String(this.state.adminPanelType || '');
        try {
            if (action === 'referral') {
                const city = Number((document.getElementById('adm-ref-city') || {}).value || 0);
                const province = Number((document.getElementById('adm-ref-province') || {}).value || 0);
                const country = Number((document.getElementById('adm-ref-country') || {}).value || 0);
                const ret = await this.adminUpdateConfig('referral.reward', { city, province, country });
                if (ret.ok) this.setAdminPublishStatus(ret.local ? 'local' : 'online', ret.msg || '');
                this.showToast(ret.ok ? '推荐奖励已发布' : (ret.msg || '保存失败'));
                return;
            }
            if (action === 'profileReward') {
                const freeToCityDays = Number((document.getElementById('adm-profile-reward-free-days') || {}).value || 15);
                const paidExtendDays = Number((document.getElementById('adm-profile-reward-paid-days') || {}).value || 30);
                const ret = await this.adminUpdateConfig('profile.reward', {
                    freeToCityDays: Math.max(1, Math.min(60, freeToCityDays)),
                    paidExtendDays: Math.max(1, Math.min(60, paidExtendDays))
                });
                if (ret.ok) {
                    this.setAdminPublishStatus(ret.local ? 'local' : 'online', ret.msg || '');
                    this.state.user.profileRewardConfig = {
                        freeToCityDays: Math.max(1, Math.min(60, freeToCityDays)),
                        paidExtendDays: Math.max(1, Math.min(60, paidExtendDays))
                    };
                    this.refreshMemberCenterView();
                }
                this.showToast(ret.ok ? '资料奖励策略已发布' : (ret.msg || '保存失败'));
                return;
            }
            if (action === 'features') {
                const inviteEnabled = !!((document.getElementById('adm-flag-invite') || {}).checked);
                const withdrawEnabled = !!((document.getElementById('adm-flag-withdraw') || {}).checked);
                const ret = await this.adminUpdateConfig('feature.flags', {
                    ...((this.state.runtimeConfig && this.state.runtimeConfig['feature.flags']) || {}),
                    inviteEnabled,
                    withdrawEnabled,
                    adminDrawerEnabled: true
                });
                if (ret.ok) this.setAdminPublishStatus(ret.local ? 'local' : 'online', ret.msg || '');
                this.showToast(ret.ok ? '功能开关已发布' : (ret.msg || '保存失败'));
                return;
            }
            if (action === 'payment') {
                const payload = {
                    wechatEnabled: !!((document.getElementById('adm-pay-wechat-enabled') || {}).checked),
                    alipayEnabled: !!((document.getElementById('adm-pay-alipay-enabled') || {}).checked),
                    transferEnabled: !!((document.getElementById('adm-pay-transfer-enabled') || {}).checked),
                    wechatLabel: String((document.getElementById('adm-pay-wechat-label') || {}).value || '').trim() || '微信支付',
                    alipayLabel: String((document.getElementById('adm-pay-alipay-label') || {}).value || '').trim() || '支付宝支付',
                    transferLabel: String((document.getElementById('adm-pay-transfer-label') || {}).value || '').trim() || '对公转账',
                    wechatAppId: String((document.getElementById('adm-pay-wechat-appid') || {}).value || '').trim(),
                    wechatMchId: String((document.getElementById('adm-pay-wechat-mchid') || {}).value || '').trim(),
                    wechatApiKey: String((document.getElementById('adm-pay-wechat-key') || {}).value || '').trim(),
                    alipayAppId: String((document.getElementById('adm-pay-alipay-appid') || {}).value || '').trim(),
                    alipaySellerId: String((document.getElementById('adm-pay-alipay-seller') || {}).value || '').trim(),
                    alipayPublicKey: String((document.getElementById('adm-pay-alipay-pubkey') || {}).value || '').trim(),
                    transferCompanyName: String((document.getElementById('adm-pay-transfer-company') || {}).value || '').trim(),
                    transferTaxNo: String((document.getElementById('adm-pay-transfer-taxno') || {}).value || '').trim(),
                    transferAddress: String((document.getElementById('adm-pay-transfer-address') || {}).value || '').trim(),
                    transferPhone: String((document.getElementById('adm-pay-transfer-phone') || {}).value || '').trim(),
                    transferBank: String((document.getElementById('adm-pay-transfer-bank') || {}).value || '').trim(),
                    transferAccount: String((document.getElementById('adm-pay-transfer-account') || {}).value || '').trim(),
                };
                const ret = await this.adminUpdateConfig('payment.channels', payload);
                if (ret.ok) this.setAdminPublishStatus(ret.local ? 'local' : 'online', ret.msg || '');
                this.showToast(ret.ok ? '支付方式配置已发布' : (ret.msg || '保存失败'));
                return;
            }
            if (action === 'copy') {
                const title = String((document.getElementById('adm-copy-title') || {}).value || '').trim();
                const subtitle = String((document.getElementById('adm-copy-subtitle') || {}).value || '').trim();
                if (!title || !subtitle) {
                    this.showToast('请填写完整文案');
                    return;
                }
                const ret = await this.adminUpdateConfig('copy.auth', { title, subtitle });
                if (ret.ok) this.setAdminPublishStatus(ret.local ? 'local' : 'online', ret.msg || '');
                this.showToast(ret.ok ? '文案已发布' : (ret.msg || '保存失败'));
                return;
            }
            if (action === 'banner') {
                const title1 = String((document.getElementById('adm-banner-title-1') || {}).value || '').trim();
                const subtitle1 = String((document.getElementById('adm-banner-subtitle-1') || {}).value || '').trim();
                const title2 = String((document.getElementById('adm-banner-title-2') || {}).value || '').trim();
                const subtitle2 = String((document.getElementById('adm-banner-subtitle-2') || {}).value || '').trim();
                const slides = [
                    { title: title1, subtitle: subtitle1 },
                    { title: title2, subtitle: subtitle2 },
                ].filter((x) => x.title || x.subtitle);
                if (!slides.length) {
                    this.showToast('请至少填写一条Banner');
                    return;
                }
                const ret = await this.adminUpdateConfig('copy.banner', { slides });
                this.renderRuntimeBanner();
                if (ret.ok) this.setAdminPublishStatus(ret.local ? 'local' : 'online', ret.msg || '');
                this.showToast(ret.ok ? 'Banner已发布' : (ret.msg || '保存失败'));
                return;
            }
            if (action === 'popup') {
                const enabled = !!((document.getElementById('adm-popup-enabled') || {}).checked);
                const title = String((document.getElementById('adm-popup-title') || {}).value || '').trim();
                const content = String((document.getElementById('adm-popup-content') || {}).value || '').trim();
                const buttonText = String((document.getElementById('adm-popup-button') || {}).value || '').trim();
                const version = String((document.getElementById('adm-popup-version') || {}).value || '').trim() || `v${Date.now()}`;
                const ret = await this.adminUpdateConfig('notice.popup', { enabled, title, content, buttonText, version });
                if (ret.ok) this.maybeShowRuntimeNotice(true);
                if (ret.ok) this.setAdminPublishStatus(ret.local ? 'local' : 'online', ret.msg || '');
                this.showToast(ret.ok ? '公告弹窗已发布' : (ret.msg || '保存失败'));
                return;
            }
            if (action === 'benefits') {
                const readLines = (id) => String((document.getElementById(id) || {}).value || '').split('\n').map((x) => x.trim()).filter(Boolean);
                const payload = {
                    free: {
                        title: String((document.getElementById('adm-ben-free-title') || {}).value || '').trim() || '免费会员',
                        subtitle: String((document.getElementById('adm-ben-free-subtitle') || {}).value || '').trim() || '基础浏览权益',
                        benefits: readLines('adm-ben-free-items'),
                    },
                    city: {
                        title: String((document.getElementById('adm-ben-city-title') || {}).value || '').trim() || '城市会员',
                        subtitle: String((document.getElementById('adm-ben-city-subtitle') || {}).value || '').trim() || '解锁单城商机',
                        benefits: readLines('adm-ben-city-items'),
                    },
                    province: {
                        title: String((document.getElementById('adm-ben-province-title') || {}).value || '').trim() || '省级会员',
                        subtitle: String((document.getElementById('adm-ben-province-subtitle') || {}).value || '').trim() || '统揽全省项目',
                        benefits: readLines('adm-ben-province-items'),
                    },
                    country: {
                        title: String((document.getElementById('adm-ben-country-title') || {}).value || '').trim() || '全国会员',
                        subtitle: String((document.getElementById('adm-ben-country-subtitle') || {}).value || '').trim() || '全国商机尽在掌握',
                        benefits: readLines('adm-ben-country-items'),
                    },
                };
                const ret = await this.adminUpdateConfig('copy.member', payload);
                if (ret.ok && this.state.currentTab === 2) this.refreshMemberCenterView();
                if (ret.ok) this.setAdminPublishStatus(ret.local ? 'local' : 'online', ret.msg || '');
                this.showToast(ret.ok ? '会员权益文案已发布' : (ret.msg || '保存失败'));
                return;
            }
            if (action === 'benefitsMatrix') {
                const n = (id, d) => {
                    const v = Number((document.getElementById(id) || {}).value);
                    return Number.isFinite(v) ? v : d;
                };
                const s = (id, d) => String((document.getElementById(id) || {}).value || '').trim() || d;
                const payload = {
                    free: { scope: s('adm-mx-free-scope', '体验'), viewLimit: n('adm-mx-free-view', 10), keywordLimit: n('adm-mx-free-keyword', 1), deviceLimit: n('adm-mx-free-device', 1), serviceCount: n('adm-mx-free-service', 0) },
                    city: { scope: s('adm-mx-city-scope', '城市'), viewLimit: n('adm-mx-city-view', 100), keywordLimit: n('adm-mx-city-keyword', 10), deviceLimit: n('adm-mx-city-device', 2), serviceCount: n('adm-mx-city-service', 1) },
                    province: { scope: s('adm-mx-province-scope', '全省'), viewLimit: n('adm-mx-province-view', 500), keywordLimit: n('adm-mx-province-keyword', 50), deviceLimit: n('adm-mx-province-device', 5), serviceCount: n('adm-mx-province-service', 3) },
                    country: { scope: s('adm-mx-country-scope', '全国'), viewLimit: n('adm-mx-country-view', -1), keywordLimit: n('adm-mx-country-keyword', 200), deviceLimit: n('adm-mx-country-device', 10), serviceCount: n('adm-mx-country-service', 5) },
                };
                const ret = await this.adminUpdateConfig('member.permission.matrix', payload);
                if (ret.ok && this.state.currentTab === 2) this.refreshMemberCenterView();
                if (ret.ok) this.setAdminPublishStatus(ret.local ? 'local' : 'online', ret.msg || '');
                this.showToast(ret.ok ? '权益对比配置已发布' : (ret.msg || '保存失败'));
                return;
            }
            if (action === 'plans') {
                const apiBase = this.getApiBase();
                const city = Number((document.getElementById('adm-plan-city') || {}).value || 0);
                const province = Number((document.getElementById('adm-plan-province') || {}).value || 0);
                const country = Number((document.getElementById('adm-plan-country') || {}).value || 0);
                const localPlanPayload = { city, province, country };
                if (!apiBase) {
                    this.applyLocalAdminConfig('member.plan.prices', localPlanPayload);
                    this.setAdminPublishStatus('local', '当前为本地预览发布');
                } else {
                    const headers = this.getAdminAuthHeaders();
                    const r1 = await this.requestJson(`${apiBase}/api/admin/member-plans/city`, { method: 'PUT', headers, body: { priceYuan: city } });
                    const r2 = await this.requestJson(`${apiBase}/api/admin/member-plans/province`, { method: 'PUT', headers, body: { priceYuan: province } });
                    const r3 = await this.requestJson(`${apiBase}/api/admin/member-plans/country`, { method: 'PUT', headers, body: { priceYuan: country } });
                    const msg = (r1.json && (r1.json.msg || r1.json.message)) || (r2.json && (r2.json.msg || r2.json.message)) || (r3.json && (r3.json.msg || r3.json.message)) || '';
                    if (this.isAdminAccessDeniedMsg(msg)) {
                        this.applyLocalAdminConfig('member.plan.prices', localPlanPayload);
                        this.setAdminPublishStatus('local', '当前账号在正式环境无超管价格权限');
                        this.showToast('线上未授予超管价格权限，已切换本地预览发布');
                    } else {
                        this.setAdminPublishStatus('online');
                        await this.syncMemberFromServer();
                        await this.refreshAdminMemberPlans();
                    }
                }
                this.refreshMemberCenterView();
                this.showToast('会员价格已更新');
                return;
            }
            if (action === 'pin') {
                const apiBase = this.getApiBase();
                if (!apiBase) {
                    this.showToast('当前环境不支持修改线上PIN');
                    return;
                }
                const oldPin = String((document.getElementById('adm-pin-old') || {}).value || '');
                const newPin = String((document.getElementById('adm-pin-new') || {}).value || '');
                const doChange = async () => {
                    const headers = this.getAdminAuthHeaders();
                    const res = await this.requestJson(`${apiBase}/api/admin/pin/change`, {
                        method: 'POST',
                        headers,
                        body: { oldPin, newPin, old_pin: oldPin, new_pin: newPin }
                    });
                    const msg = String((res.json && (res.json.msg || res.json.message)) || '');
                    const ok = !!(res.ok && (
                        (res.json && typeof res.json === 'object' && (res.json.code === 1 || res.json.success === true)) ||
                        (!res.json) ||
                        (typeof res.json === 'string' && /success|成功|updated/i.test(res.json)) ||
                        /success|成功|updated/i.test(msg)
                    ));
                    return { ok, msg, res };
                };
                let result = await doChange();
                const needPin = (!result.ok) && (Number(result.res && result.res.status || 0) === 401 || /PIN验证已失效|需要PIN二次验证|pin/i.test(result.msg));
                if (needPin) {
                    const v = await this.verifyAdminPin(oldPin);
                    if (v.ok) result = await doChange();
                }
                if (result.ok) {
                    this.setAdminPublishStatus('online');
                    this.showToast('PIN码修改成功');
                    this.closeAdminPanel();
                } else {
                    const msg = result.msg;
                    const denied = this.isAdminAccessDeniedMsg(msg);
                    if (denied) this.setAdminPublishStatus('local', '当前账号缺少线上PIN修改权限');
                    this.showToast(denied ? '线上未授予超管PIN权限' : (msg || 'PIN修改失败'));
                }
                return;
            }
            if (action === 'members') {
                await this.grantMemberVip();
                return;
            }
            if (action === 'codes') {
                await this.batchCreateActivationCodes();
                return;
            }
            if (action === 'auth') {
                await this.grantAdminRole();
                return;
            }
        } catch (e) {
            this.showToast('保存失败，请稍后重试');
        }
    },

    async adminUpdateConfig(key, value) {
        const apiBase = this.getApiBase();
        if (!apiBase) {
            this.applyLocalAdminConfig(key, value);
            return { ok: true, local: true };
        }
        const headers = this.getAdminAuthHeaders();
        const draftRes = await this.requestJson(`${apiBase}/api/admin/configs/${encodeURIComponent(key)}/draft`, {
            method: 'PUT',
            headers,
            body: { value }
        });
        if (!(draftRes.ok && draftRes.json && draftRes.json.code === 1)) {
            const msg = (draftRes.json && (draftRes.json.msg || draftRes.json.message)) || '草稿保存失败';
            if (this.isAdminAccessDeniedMsg(msg)) {
                this.applyLocalAdminConfig(key, value);
                return { ok: true, local: true, msg: '当前账号在正式环境无超管写入权限，已切换本地预览发布' };
            }
            return { ok: false, msg };
        }
        const pubRes = await this.requestJson(`${apiBase}/api/admin/configs/${encodeURIComponent(key)}/publish`, {
            method: 'POST',
            headers,
            body: {}
        });
        if (!(pubRes.ok && pubRes.json && pubRes.json.code === 1)) {
            const msg = (pubRes.json && (pubRes.json.msg || pubRes.json.message)) || '发布失败';
            if (this.isAdminAccessDeniedMsg(msg)) {
                this.applyLocalAdminConfig(key, value);
                return { ok: true, local: true, msg: '当前账号在正式环境无超管发布权限，已切换本地预览发布' };
            }
            return { ok: false, msg };
        }
        await this.loadRuntimeConfig();
        return { ok: true };
    },

    async handleAdminMenu(action) {
        await this.openAdminPanel(action);
    },
    
    switchVipCard(level) {
        if (this.state.currentTab !== 2) return; // Guard: Only allow in Member Center

        this.state.vipCardTab = level;
        // Re-render Member Center
        const contentArea = document.getElementById('content-area');
        if (contentArea) {
            contentArea.innerHTML = this.getMemberCenterHTML();
        }
    },

    getInviteLink() {
        const code = String((this.state.user && this.state.user.inviteCode) || '').trim();
        if (!code) return '';
        const host = (window.location && window.location.origin) || 'https://zhaobiao.agecms.com';
        return `${host}/?inviteCode=${encodeURIComponent(code)}`;
    },

    async shareInviteLink() {
        if (!this.state.user.isLogged) {
            this.login();
            return;
        }
        await this.syncReferralFromServer();
        const inviteCode = String(this.state.user.inviteCode || '').trim();
        if (!inviteCode) {
            this.showToast('邀请码生成中，请稍后再试');
            return;
        }
        const link = this.getInviteLink();
        const text = `我在用商机雷达，邀请码：${inviteCode}，下载链接：${link}`;
        const ok = await this.copyToClipboard(text);
        if (ok) this.showToast('邀请信息已复制');
    },

    openReferralRecords() {
        if (!this.state.user.isLogged) {
            this.login();
            return;
        }
        const list = Array.isArray(this.state.user.referralRecords) ? this.state.user.referralRecords : [];
        if (!list.length) {
            this.showToast('暂无邀请记录');
            return;
        }
        const text = list.slice(0, 12).map((item) => {
            const t = item.createTime ? String(item.createTime).replace('T', ' ').slice(0, 16) : '';
            if (item.eventType === 'first_purchase_reward') return `${t} ${item.inviteeName} 首购奖励 +¥${Number(item.rewardYuan || 0).toFixed(2)}`;
            return `${t} ${item.inviteeName} 已绑定邀请码`;
        }).join('\n');
        alert(text);
    },

    getAdminMenuIcon(name) {
        const map = {
            referral: '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#141414" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
            plans: '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#141414" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>',
            copy: '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#141414" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4z"></path><path d="M8 9h8"></path><path d="M8 13h8"></path></svg>',
            banner: '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#141414" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="14" rx="2"></rect><path d="M7 12l3-3 2 2 3-3 2 4"></path><circle cx="8" cy="8" r="1"></circle></svg>',
            popup: '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#141414" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
            benefits: '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#141414" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12v10H4V12"></path><path d="M2 7h20v5H2z"></path><path d="M12 22V7"></path><path d="M12 7h5a2.5 2.5 0 0 0 0-5c-3 0-5 5-5 5z"></path><path d="M12 7H7a2.5 2.5 0 0 1 0-5c3 0 5 5 5 5z"></path></svg>',
            benefitsMatrix: '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#141414" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M3 10h18"></path><path d="M9 4v16"></path><path d="M15 10v10"></path></svg>',
            members: '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#141414" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
            orders: '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#141414" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"></rect><path d="M8 9h8"></path><path d="M8 13h8"></path><path d="M8 17h5"></path></svg>',
            codes: '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#141414" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="12" rx="2"></rect><path d="M7 12h2"></path><path d="M15 12h2"></path><path d="M12 6v12"></path></svg>',
            rewards: '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#141414" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1v22"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14.5a3.5 3.5 0 0 1 0 7H6"></path></svg>',
            info: '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#141414" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h18v14H3z"></path><path d="M7 8h10"></path><path d="M7 12h6"></path><path d="M7 16h10"></path></svg>',
            auth: '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#141414" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z"></path><path d="M9 12l2 2 4-4"></path></svg>',
            features: '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#141414" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83l-0.09.09a2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2h-.12a2 2 0 0 1-2-2v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0l-.09-.09a2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2v-.12a2 2 0 0 1 2-2h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83l.09-.09a2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2h.12a2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0l.09.09a2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .66.39 1.26 1 1.51.16.07.33.1.51.1H21a2 2 0 0 1 2 2v.12a2 2 0 0 1-2 2h-.09c-.66 0-1.26.39-1.51 1z"></path></svg>',
            audit: '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#141414" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>',
            pin: '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#141414" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>',
        };
        return map[name] || map.copy;
    },

    getAdminDrawerHtml() {
        const user = this.state.user || {};
        if (!(this.state.adminDrawerOpen && user.isLogged && this.isAdminUser())) return '';
        const db = this.state.adminDbHealth || {};
        const dbStatus = String(db.status || 'unknown');
        const dbText = String(db.text || '未检测');
        const dbHint = String(db.hint || '');
        const dbColor = dbStatus === 'ok' ? '#1CD760' : dbStatus === 'warn' ? '#F6A623' : dbStatus === 'down' ? '#FF4D4F' : '#B0B3B8';
        const dbBg = dbStatus === 'ok' ? '#E9FFEE' : dbStatus === 'warn' ? '#FFF4E5' : dbStatus === 'down' ? '#FFECEE' : '#F3F4F6';
        const syncAlert = this.state.adminSyncAlert || {};
        const syncAlertActive = !!syncAlert.active;
        const syncAlertText = String(syncAlert.text || '');
        const syncAlertMeta = String(syncAlert.meta || '');
        const syncAlertHtml = syncAlertActive ? `
            <div style="margin:0 12px 12px; position:sticky; top:calc(max(env(safe-area-inset-top), 20px) + 6px); z-index:321; background:#FFECEE; border:1px solid #FFB3B8; color:#B42318; border-radius:12px; padding:9px 10px;">
                <div style="font-size:12px; font-weight:700; line-height:1.35;">${syncAlertText}</div>
                ${syncAlertMeta ? `<div style="margin-top:4px; font-size:11px; color:#C44A43; line-height:1.3;">${syncAlertMeta}</div>` : ''}
            </div>
        ` : '';
        const sections = [
            {
                title: '运营配置',
                items: [
                    { key: 'banner', label: '首页Banner配置' },
                    { key: 'popup', label: '公告弹窗配置' },
                    { key: 'referral', label: '推荐奖励配置' },
                    { key: 'profileReward', label: '资料奖励配置' },
                    { key: 'plans', label: '会员价格配置' },
                    { key: 'payment', label: '支付方式配置' },
                    { key: 'copy', label: '登录文案配置' },
                    { key: 'benefits', label: '会员权益文案' },
                    { key: 'benefitsMatrix', label: '权益对比设置' },
                    { key: 'features', label: '功能开关配置' }
                ]
            },
            {
                title: '业务管理',
                items: [
                    { key: 'info', label: '信息管理' },
                    { key: 'members', label: '会员管理' },
                    { key: 'orders', label: '订单管理' },
                    { key: 'codes', label: '激活码管理' },
                    { key: 'rewards', label: '邀请奖励记录' }
                ]
            },
            {
                title: '系统管理',
                items: [
                    { key: 'auth', label: '管理员授权' },
                    { key: 'audit', label: '操作审计日志' },
                    { key: 'pin', label: '修改PIN码' }
                ]
            }
        ];
        const arrow = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#B1B1B1" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';
        const sectionHtml = sections.map((section) => {
            const rows = section.items.map((it) => `
                <div onclick="handleAdminMenu('${it.key}')" style="display:flex; align-items:center; justify-content:space-between; padding:11px 12px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div style="width:24px; height:24px; display:flex; align-items:center; justify-content:center;">${this.getAdminMenuIcon(it.key)}</div>
                        <span style="font-size:15px; line-height:1.25; color:#111; font-weight:500; letter-spacing:0;">${it.label}</span>
                    </div>
                    ${arrow}
                </div>
            `).join('<div style="height:1px;background:#f0f0f0;margin:0 12px;"></div>');
            return `
                <div style="margin:0 12px 12px; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 14px rgba(0,0,0,0.035);">
                    <div style="padding:10px 14px 2px; font-size:11px; color:#9c9c9c;">${section.title}</div>
                    ${rows}
                </div>
            `;
        }).join('');
        return `
            <div onclick="closeAdminDrawer()" style="position: fixed; inset: 0; background: rgba(8,10,18,0.56); z-index: 310;"></div>
            <div style="position: fixed; top: 0; left: 0; width: 78%; max-width: 372px; height: 100vh; background: #f5f6f8; z-index: 320; border-top-right-radius: 22px; border-bottom-right-radius: 22px; overflow-y: auto; -webkit-overflow-scrolling: touch; padding-bottom: calc(max(env(safe-area-inset-bottom), 14px) + 10px);">
                <div style="height: calc(max(env(safe-area-inset-top), 20px) + 18px);"></div>
                <div style="margin:0 12px 12px; background:#fff; border-radius:16px; padding:14px 14px 12px; box-shadow:0 4px 14px rgba(0,0,0,0.035);">
                    <div style="height:42px; border-radius:21px; background:#0A0A0A; display:flex; align-items:center; justify-content:center; gap:8px; color:#E8FFE9;">
                        <span style="width:14px;height:14px;border:2px solid ${dbColor};border-radius:50%; display:inline-block;"></span>
                        <span style="font-size:14px; font-weight:600;">Admin Console</span>
                    </div>
                    <div style="margin-top:10px; border-radius:10px; background:${dbBg}; padding:8px 10px;">
                        <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
                            <div style="display:flex; align-items:center; gap:6px; min-width:0;">
                                <span style="width:8px;height:8px;border-radius:50%;background:${dbColor};display:inline-block;"></span>
                                <span style="font-size:12px;color:#333;font-weight:600;">数据库：${dbText}</span>
                            </div>
                            <button onclick="refreshAdminDbHealth()" style="border:none;background:#fff;color:#666;height:24px;padding:0 8px;border-radius:8px;font-size:11px;">刷新</button>
                        </div>
                        ${dbHint ? `<div style="margin-top:4px;font-size:11px;color:#666;line-height:1.3;">${dbHint}</div>` : ''}
                    </div>
                    <div style="display:flex; align-items:center; justify-content:space-between; margin-top:10px;">
                        <div style="font-size:14px; color:#222; font-weight:600;">${user.username || '管理员'}</div>
                        <button onclick="closeAdminDrawer()" style="border:none; background:#f2f3f5; color:#666; width:30px; height:30px; border-radius:50%;">×</button>
                    </div>
                </div>
                ${syncAlertHtml}
                ${sectionHtml}
                <div style="margin:6px 12px calc(max(env(safe-area-inset-bottom), 12px) + 12px); background:#fff; border-radius:16px; padding:12px 8px; display:flex; justify-content:space-around; box-shadow:0 4px 14px rgba(0,0,0,0.035);">
                    <div onclick="refreshAdminAudit()" style="display:flex; flex-direction:column; align-items:center; gap:5px; color:#888; font-size:11px;">
                        <div style="width:38px;height:38px;border-radius:50%;background:#f3f4f6;display:flex;align-items:center;justify-content:center;">⟳</div><span>刷新</span>
                    </div>
                    <div onclick="handleAdminMenu('audit')" style="display:flex; flex-direction:column; align-items:center; gap:5px; color:#888; font-size:11px;">
                        <div style="width:38px;height:38px;border-radius:50%;background:#f3f4f6;display:flex;align-items:center;justify-content:center;">◌</div><span>日志</span>
                    </div>
                    <div onclick="handleAdminMenu('pin')" style="display:flex; flex-direction:column; align-items:center; gap:5px; color:#888; font-size:11px;">
                        <div style="width:38px;height:38px;border-radius:50%;background:#f3f4f6;display:flex;align-items:center;justify-content:center;">⚙</div><span>设置</span>
                    </div>
                </div>
            </div>
        `;
    },

    getAdminPanelHtml() {
        if (!(this.state.adminPanelOpen && this.isAdminUser())) return '';
        const type = String(this.state.adminPanelType || '');
        const rewardCfg = (this.state.runtimeConfig && this.state.runtimeConfig['referral.reward']) || {};
        const copyCfg = (this.state.runtimeConfig && this.state.runtimeConfig['copy.auth']) || {};
        const bannerCfg = (this.state.runtimeConfig && this.state.runtimeConfig['copy.banner']) || {};
        const popupCfg = (this.state.runtimeConfig && this.state.runtimeConfig['notice.popup']) || {};
        const profileRewardCfg = (this.state.runtimeConfig && this.state.runtimeConfig['profile.reward']) || {};
        const memberCopyCfg = (this.state.runtimeConfig && this.state.runtimeConfig['copy.member']) || {};
        const permissionMatrix = this.getMemberPermissionMatrix();
        const viewText = (n) => Number(n) < 0 ? '无限制' : `${Math.max(0, Number(n || 0))}次`;
        const keywordText = (n) => `${Math.max(0, Number(n || 0))}个`;
        const flagCfg = (this.state.runtimeConfig && this.state.runtimeConfig['feature.flags']) || {};
        const paymentCfg = this.getPaymentRuntimeConfig();
        const cityPrice = this.getPlanPrice('city', 399);
        const provincePrice = this.getPlanPrice('province', 999);
        const countryPrice = this.getPlanPrice('country', 2999);
        const cityPriceText = this.getPlanDisplayPrice('city', cityPrice);
        const provincePriceText = this.getPlanDisplayPrice('province', provincePrice);
        const countryPriceText = this.getPlanDisplayPrice('country', countryPrice);
        const titleMap = {
            referral: '推荐奖励配置',
            profileReward: '资料奖励配置',
            plans: '会员价格配置',
            payment: '支付方式配置',
            copy: '登录文案配置',
            banner: '首页Banner配置',
            popup: '公告弹窗配置',
            benefits: '会员权益文案',
            benefitsMatrix: '权益对比设置',
            members: '会员管理',
            orders: '订单管理',
            codes: '激活码管理',
            rewards: '邀请奖励记录',
            info: '信息管理',
            auth: '管理员授权',
            features: '功能开关配置',
            audit: '操作审计日志',
            pin: '修改PIN码',
        };
        const title = titleMap[type] || '配置管理';
        const publishStatusText = this.getAdminPublishStatusText();
        const publishStatusHint = String(this.state.adminPublishHint || '');
        const db = this.state.adminDbHealth || {};
        const dbStatus = String(db.status || 'unknown');
        const dbText = String(db.text || '未检测');
        const dbColor = dbStatus === 'ok' ? '#2F7A3B' : dbStatus === 'warn' ? '#C06B00' : dbStatus === 'down' ? '#B42318' : '#6B7280';
        const dbBg = dbStatus === 'ok' ? '#EAF8EC' : dbStatus === 'warn' ? '#FFF3E2' : dbStatus === 'down' ? '#FEEFF0' : '#F3F4F6';
        let content = '';
        if (type === 'referral') {
            content = `
                <div style="display:grid; grid-template-columns: 1fr; gap:12px;">
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">城市会员奖励（元）</div><input id="adm-ref-city" type="number" value="${Number(rewardCfg.city ?? 30)}" style="width:100%;height:44px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:16px;"></div>
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">省级会员奖励（元）</div><input id="adm-ref-province" type="number" value="${Number(rewardCfg.province ?? 80)}" style="width:100%;height:44px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:16px;"></div>
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">全国会员奖励（元）</div><input id="adm-ref-country" type="number" value="${Number(rewardCfg.country ?? 200)}" style="width:100%;height:44px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:16px;"></div>
                </div>
            `;
        } else if (type === 'profileReward') {
            content = `
                <div style="display:grid; grid-template-columns: 1fr; gap:12px;">
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">免费会员补全后赠送天数</div><input id="adm-profile-reward-free-days" type="number" value="${Number(profileRewardCfg.freeToCityDays ?? 15)}" style="width:100%;height:44px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:16px;"></div>
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">付费会员补全后延长天数</div><input id="adm-profile-reward-paid-days" type="number" value="${Number(profileRewardCfg.paidExtendDays ?? 30)}" style="width:100%;height:44px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:16px;"></div>
                </div>
            `;
        } else if (type === 'plans') {
            content = `
                <div style="display:grid; grid-template-columns: 1fr; gap:12px;">
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">城市会员价格（元）</div><input id="adm-plan-city" type="number" value="${Number(cityPrice)}" style="width:100%;height:44px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:16px;"></div>
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">省级会员价格（元）</div><input id="adm-plan-province" type="number" value="${Number(provincePrice)}" style="width:100%;height:44px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:16px;"></div>
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">全国会员价格（元）</div><input id="adm-plan-country" type="number" value="${Number(countryPrice)}" style="width:100%;height:44px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:16px;"></div>
                </div>
            `;
        } else if (type === 'payment') {
            content = `
                <div style="display:grid; grid-template-columns:1fr; gap:12px;">
                    <label style="display:flex; align-items:center; justify-content:space-between; padding:14px 12px; border:1px solid #e5e5ea; border-radius:10px;">
                        <span>启用微信支付</span>
                        <input id="adm-pay-wechat-enabled" type="checkbox" ${paymentCfg.wechatEnabled ? 'checked' : ''} style="width:22px;height:22px;">
                    </label>
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">微信支付按钮名称</div><input id="adm-pay-wechat-label" type="text" value="${String(paymentCfg.wechatLabel).replace(/"/g, '&quot;')}" style="width:100%;height:44px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:14px;"></div>
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">微信商户号</div><input id="adm-pay-wechat-mchid" type="text" value="${String(paymentCfg.wechatMchId).replace(/"/g, '&quot;')}" style="width:100%;height:44px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:14px;"></div>
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">微信AppID</div><input id="adm-pay-wechat-appid" type="text" value="${String(paymentCfg.wechatAppId).replace(/"/g, '&quot;')}" style="width:100%;height:44px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:14px;"></div>
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">微信API密钥（建议填加密后的配置标识）</div><input id="adm-pay-wechat-key" type="text" value="${String(paymentCfg.wechatApiKey).replace(/"/g, '&quot;')}" style="width:100%;height:44px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:13px;"></div>
                    <label style="display:flex; align-items:center; justify-content:space-between; padding:14px 12px; border:1px solid #e5e5ea; border-radius:10px;">
                        <span>启用支付宝支付</span>
                        <input id="adm-pay-alipay-enabled" type="checkbox" ${paymentCfg.alipayEnabled ? 'checked' : ''} style="width:22px;height:22px;">
                    </label>
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">支付宝按钮名称</div><input id="adm-pay-alipay-label" type="text" value="${String(paymentCfg.alipayLabel).replace(/"/g, '&quot;')}" style="width:100%;height:44px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:14px;"></div>
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">支付宝应用ID</div><input id="adm-pay-alipay-appid" type="text" value="${String(paymentCfg.alipayAppId).replace(/"/g, '&quot;')}" style="width:100%;height:44px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:14px;"></div>
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">支付宝商户标识</div><input id="adm-pay-alipay-seller" type="text" value="${String(paymentCfg.alipaySellerId).replace(/"/g, '&quot;')}" style="width:100%;height:44px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:14px;"></div>
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">支付宝公钥（可公开）</div><textarea id="adm-pay-alipay-pubkey" style="width:100%;height:78px;border:1px solid #e5e5ea;border-radius:10px;padding:10px 12px;font-size:12px;line-height:1.4;">${String(paymentCfg.alipayPublicKey || '').replace(/</g, '&lt;')}</textarea></div>
                    <label style="display:flex; align-items:center; justify-content:space-between; padding:14px 12px; border:1px solid #e5e5ea; border-radius:10px;">
                        <span>启用对公转账</span>
                        <input id="adm-pay-transfer-enabled" type="checkbox" ${paymentCfg.transferEnabled ? 'checked' : ''} style="width:22px;height:22px;">
                    </label>
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">对公转账按钮名称</div><input id="adm-pay-transfer-label" type="text" value="${String(paymentCfg.transferLabel).replace(/"/g, '&quot;')}" style="width:100%;height:44px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:14px;"></div>
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">公司名</div><input id="adm-pay-transfer-company" type="text" value="${String(paymentCfg.transferCompanyName).replace(/"/g, '&quot;')}" style="width:100%;height:44px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:14px;"></div>
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">纳税人识别号</div><input id="adm-pay-transfer-taxno" type="text" value="${String(paymentCfg.transferTaxNo).replace(/"/g, '&quot;')}" style="width:100%;height:44px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:14px;"></div>
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">地址</div><input id="adm-pay-transfer-address" type="text" value="${String(paymentCfg.transferAddress).replace(/"/g, '&quot;')}" style="width:100%;height:44px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:13px;"></div>
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">电话</div><input id="adm-pay-transfer-phone" type="text" value="${String(paymentCfg.transferPhone).replace(/"/g, '&quot;')}" style="width:100%;height:44px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:14px;"></div>
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">开户行</div><input id="adm-pay-transfer-bank" type="text" value="${String(paymentCfg.transferBank).replace(/"/g, '&quot;')}" style="width:100%;height:44px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:13px;"></div>
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">账号</div><input id="adm-pay-transfer-account" type="text" value="${String(paymentCfg.transferAccount).replace(/"/g, '&quot;')}" style="width:100%;height:44px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:14px;"></div>
                </div>
            `;
        } else if (type === 'banner') {
            const slides = Array.isArray(bannerCfg.slides) ? bannerCfg.slides : [];
            const b1 = slides[0] || {};
            const b2 = slides[1] || {};
            content = `
                <div style="display:grid; grid-template-columns: 1fr; gap:12px;">
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">Banner1 标题</div><input id="adm-banner-title-1" type="text" value="${String(b1.title || '商机雷达').replace(/"/g, '&quot;')}" style="width:100%;height:44px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:16px;"></div>
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">Banner1 副标题</div><input id="adm-banner-subtitle-1" type="text" value="${String(b1.subtitle || 'AI数字员工24小时为您寻找商机！').replace(/"/g, '&quot;')}" style="width:100%;height:44px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:15px;"></div>
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">Banner2 标题</div><input id="adm-banner-title-2" type="text" value="${String(b2.title || '精准商机订阅').replace(/"/g, '&quot;')}" style="width:100%;height:44px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:16px;"></div>
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">Banner2 副标题</div><input id="adm-banner-subtitle-2" type="text" value="${String(b2.subtitle || '关键词+地区，实时推送不漏标').replace(/"/g, '&quot;')}" style="width:100%;height:44px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:15px;"></div>
                </div>
            `;
        } else if (type === 'popup') {
            content = `
                <div style="display:grid; grid-template-columns: 1fr; gap:12px;">
                    <label style="display:flex; align-items:center; justify-content:space-between; padding:14px 12px; border:1px solid #e5e5ea; border-radius:10px;">
                        <span>启用公告弹窗</span>
                        <input id="adm-popup-enabled" type="checkbox" ${popupCfg.enabled ? 'checked' : ''} style="width:22px;height:22px;">
                    </label>
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">弹窗标题</div><input id="adm-popup-title" type="text" value="${String(popupCfg.title || '运营公告').replace(/"/g, '&quot;')}" style="width:100%;height:44px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:16px;"></div>
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">弹窗内容</div><textarea id="adm-popup-content" style="width:100%;height:108px;border:1px solid #e5e5ea;border-radius:10px;padding:10px 12px;font-size:15px;line-height:1.5;">${String(popupCfg.content || '欢迎使用商机雷达，最新活动已上线。')}</textarea></div>
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">按钮文案</div><input id="adm-popup-button" type="text" value="${String(popupCfg.buttonText || '我知道了').replace(/"/g, '&quot;')}" style="width:100%;height:44px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:16px;"></div>
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">弹窗版本号（更新后会再次弹出）</div><input id="adm-popup-version" type="text" value="${String(popupCfg.version || 'v1').replace(/"/g, '&quot;')}" style="width:100%;height:44px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:14px;"></div>
                </div>
            `;
        } else if (type === 'copy') {
            content = `
                <div style="display:grid; grid-template-columns: 1fr; gap:12px;">
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">登录页标题</div><input id="adm-copy-title" type="text" value="${String(copyCfg.title || '商机雷达').replace(/"/g, '&quot;')}" style="width:100%;height:44px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:16px;"></div>
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">登录页副标题</div><textarea id="adm-copy-subtitle" style="width:100%;height:88px;border:1px solid #e5e5ea;border-radius:10px;padding:10px 12px;font-size:15px;line-height:1.5;">${String(copyCfg.subtitle || 'AI数字人24 小时为您寻找商机')}</textarea></div>
                </div>
            `;
        } else if (type === 'features') {
            content = `
                <div style="display:grid; grid-template-columns: 1fr; gap:10px;">
                    <label style="display:flex; align-items:center; justify-content:space-between; padding:14px 12px; border:1px solid #e5e5ea; border-radius:10px;">
                        <span>邀请功能开关</span>
                        <input id="adm-flag-invite" type="checkbox" ${flagCfg.inviteEnabled !== false ? 'checked' : ''} style="width:22px;height:22px;">
                    </label>
                    <label style="display:flex; align-items:center; justify-content:space-between; padding:14px 12px; border:1px solid #e5e5ea; border-radius:10px;">
                        <span>提现入口开关</span>
                        <input id="adm-flag-withdraw" type="checkbox" ${flagCfg.withdrawEnabled ? 'checked' : ''} style="width:22px;height:22px;">
                    </label>
                </div>
            `;
        } else if (type === 'benefits') {
            const norm = (obj, t, s, b) => ({
                title: String((obj && obj.title) || t),
                subtitle: String((obj && obj.subtitle) || s),
                benefits: Array.isArray(obj && obj.benefits) ? obj.benefits : b,
            });
            const free = norm(memberCopyCfg.free, '免费会员', '基础浏览权益', ['免费体验浏览10条任意招标信息', '免费体验1个关键词订阅']);
            const city = norm(memberCopyCfg.city, '城市会员', '解锁单城商机', ['本市无限浏览', '跨市浏览 100 条', '订阅 10 个关键词']);
            const province = norm(memberCopyCfg.province, '省级会员', '统揽全省项目', ['本省无限浏览', '跨省浏览 500 条', '订阅 50 个关键词']);
            const country = norm(memberCopyCfg.country, '全国会员', '全国商机尽在掌握', ['全国无限浏览', '订阅 200 个关键词', '专属客服服务']);
            content = `
                <div style="display:grid; grid-template-columns: 1fr; gap:12px;">
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">免费会员标题</div><input id="adm-ben-free-title" type="text" value="${free.title.replace(/"/g, '&quot;')}" style="width:100%;height:40px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:14px;"></div>
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">免费会员副标题</div><input id="adm-ben-free-subtitle" type="text" value="${free.subtitle.replace(/"/g, '&quot;')}" style="width:100%;height:40px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:14px;"></div>
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">免费会员权益（每行一条）</div><textarea id="adm-ben-free-items" style="width:100%;height:72px;border:1px solid #e5e5ea;border-radius:10px;padding:8px 12px;font-size:13px;line-height:1.5;">${free.benefits.join('\n')}</textarea></div>
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">城市会员标题</div><input id="adm-ben-city-title" type="text" value="${city.title.replace(/"/g, '&quot;')}" style="width:100%;height:40px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:14px;"></div>
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">城市会员副标题</div><input id="adm-ben-city-subtitle" type="text" value="${city.subtitle.replace(/"/g, '&quot;')}" style="width:100%;height:40px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:14px;"></div>
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">城市会员权益（每行一条）</div><textarea id="adm-ben-city-items" style="width:100%;height:72px;border:1px solid #e5e5ea;border-radius:10px;padding:8px 12px;font-size:13px;line-height:1.5;">${city.benefits.join('\n')}</textarea></div>
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">省级会员标题</div><input id="adm-ben-province-title" type="text" value="${province.title.replace(/"/g, '&quot;')}" style="width:100%;height:40px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:14px;"></div>
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">省级会员副标题</div><input id="adm-ben-province-subtitle" type="text" value="${province.subtitle.replace(/"/g, '&quot;')}" style="width:100%;height:40px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:14px;"></div>
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">省级会员权益（每行一条）</div><textarea id="adm-ben-province-items" style="width:100%;height:72px;border:1px solid #e5e5ea;border-radius:10px;padding:8px 12px;font-size:13px;line-height:1.5;">${province.benefits.join('\n')}</textarea></div>
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">全国会员标题</div><input id="adm-ben-country-title" type="text" value="${country.title.replace(/"/g, '&quot;')}" style="width:100%;height:40px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:14px;"></div>
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">全国会员副标题</div><input id="adm-ben-country-subtitle" type="text" value="${country.subtitle.replace(/"/g, '&quot;')}" style="width:100%;height:40px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:14px;"></div>
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">全国会员权益（每行一条）</div><textarea id="adm-ben-country-items" style="width:100%;height:72px;border:1px solid #e5e5ea;border-radius:10px;padding:8px 12px;font-size:13px;line-height:1.5;">${country.benefits.join('\n')}</textarea></div>
                </div>
            `;
        } else if (type === 'benefitsMatrix') {
            const row = (key, title) => {
                const m = permissionMatrix[key] || {};
                return `
                    <div style="border:1px solid #ececf0;border-radius:10px;padding:10px;">
                        <div style="font-size:13px;color:#111;font-weight:600;margin-bottom:8px;">${title}</div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                            <div><div style="font-size:12px;color:#666;margin-bottom:4px;">查阅范围</div><input id="adm-mx-${key}-scope" type="text" value="${String(m.scope || '').replace(/"/g, '&quot;')}" style="width:100%;height:38px;border:1px solid #e5e5ea;border-radius:8px;padding:0 10px;font-size:13px;"></div>
                            <div><div style="font-size:12px;color:#666;margin-bottom:4px;">项目查看上限</div><input id="adm-mx-${key}-view" type="number" value="${Number(m.viewLimit)}" style="width:100%;height:38px;border:1px solid #e5e5ea;border-radius:8px;padding:0 10px;font-size:13px;"></div>
                            <div><div style="font-size:12px;color:#666;margin-bottom:4px;">关键词上限</div><input id="adm-mx-${key}-keyword" type="number" value="${Number(m.keywordLimit)}" style="width:100%;height:38px;border:1px solid #e5e5ea;border-radius:8px;padding:0 10px;font-size:13px;"></div>
                            <div><div style="font-size:12px;color:#666;margin-bottom:4px;">设备登录数</div><input id="adm-mx-${key}-device" type="number" value="${Number(m.deviceLimit)}" style="width:100%;height:38px;border:1px solid #e5e5ea;border-radius:8px;padding:0 10px;font-size:13px;"></div>
                            <div><div style="font-size:12px;color:#666;margin-bottom:4px;">人工服务</div><input id="adm-mx-${key}-service" type="number" value="${Number(m.serviceCount)}" style="width:100%;height:38px;border:1px solid #e5e5ea;border-radius:8px;padding:0 10px;font-size:13px;"></div>
                        </div>
                    </div>
                `;
            };
            content = `
                <div style="display:grid; grid-template-columns:1fr; gap:10px;">
                    ${row('free', '免费会员')}
                    ${row('city', '城市会员')}
                    ${row('province', '省级会员')}
                    ${row('country', '全国会员')}
                    <div style="font-size:12px;color:#8a8a8a;line-height:1.5;">提示：项目查看上限填 -1 表示无限制。</div>
                </div>
            `;
        } else if (type === 'info') {
            const rows = Array.isArray(this.state.adminInfoRows) ? this.state.adminInfoRows : [];
            const yesterday = this.state.adminInfoYesterday || {};
            const totalSummary = this.state.adminInfoTotalSummary || {};
            const loaded = rows.length;
            const total = Number(this.state.adminInfoTotal || 0);
            const hasMore = loaded < total;
            content = `
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:10px;">
                    <div style="border:1px solid #ececf0;border-radius:10px;padding:10px;">
                        <div style="font-size:12px;color:#999;">昨日报告（${yesterday.date || '-'})</div>
                        <div style="font-size:12px;color:#222;margin-top:6px;">新增条数：<b>${Number(yesterday.count || 0)}</b></div>
                        <div style="font-size:12px;color:#222;margin-top:4px;">商机金额：<b>${String(yesterday.totalYi || '0.00')} 亿</b></div>
                    </div>
                    <div style="border:1px solid #ececf0;border-radius:10px;padding:10px;">
                        <div style="font-size:12px;color:#999;">截至昨日数据总数</div>
                        <div style="font-size:12px;color:#222;margin-top:6px;">总条数：<b>${Number(totalSummary.count || 0)}</b></div>
                        <div style="font-size:12px;color:#222;margin-top:4px;">总金额：<b>${String(totalSummary.totalYi || '0.00')} 亿</b></div>
                    </div>
                </div>
                <div style="display:flex; align-items:center; justify-content:space-between; margin:8px 0; font-size:12px; color:#777;">
                    <span>最新信息列表（每页20条，累计翻页）</span>
                    <span>已加载 ${loaded}/${total}</span>
                </div>
                ${rows.length ? rows.map((x) => `<div style="padding:10px 12px;border:1px solid #ececf0;border-radius:10px;margin-bottom:8px;"><div style="font-size:13px;color:#111;font-weight:600;line-height:1.4;">${x.title || '-'}</div><div style="font-size:12px;color:#666;margin-top:6px;">#${Number(x.id || 0)} · ${x.city || '全国'} · ${x.types || '-'} · 写入 ${x.writeAtMinute || '-'}</div><div style="font-size:12px;color:#8b8b8b;margin-top:4px;">公告时间 ${x.datetime || '-'} · ${x.bidPrice || '-'}</div></div>`).join('') : '<div style="padding:12px;color:#999;">暂无数据</div>'}
                <div style="display:flex; align-items:center; justify-content:center; margin-top:8px;">
                    <button onclick="loadMoreAdminInfo()" ${hasMore ? '' : 'disabled'} style="height:36px;border:1px solid #ddd;border-radius:8px;background:${hasMore ? '#fff' : '#f5f5f5'};color:${hasMore ? '#333' : '#aaa'};padding:0 14px;font-size:12px;">${hasMore ? '加载更多' : '已全部加载'}</button>
                </div>
            `;
        } else if (type === 'members') {
            const rows = Array.isArray(this.state.adminMemberRows) ? this.state.adminMemberRows.slice(0, 50) : [];
            const totalPages = Math.max(1, Math.ceil(Number(this.state.adminMemberTotal || 0) / Number(this.state.adminMemberPageSize || 20)));
            content = `
                <div style="display:grid; grid-template-columns:1fr; gap:10px; margin-bottom:12px;">
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">用户ID</div><input id="adm-member-user-id" type="number" placeholder="例如 12" style="width:100%;height:42px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:14px;"></div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                        <div><div style="font-size:12px;color:#666;margin-bottom:6px;">会员等级</div><select id="adm-member-plan" style="width:100%;height:42px;border:1px solid #e5e5ea;border-radius:10px;padding:0 10px;font-size:14px;"><option value="city">城市会员</option><option value="province">省级会员</option><option value="country" selected>全国会员</option><option value="free">免费会员</option></select></div>
                        <div><div style="font-size:12px;color:#666;margin-bottom:6px;">时长（天）</div><input id="adm-member-days" type="number" value="365" style="width:100%;height:42px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:14px;"></div>
                    </div>
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">范围值（城市/省份）</div><input id="adm-member-scope" type="text" placeholder="例如 北京 / 广东省" style="width:100%;height:42px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:14px;"></div>
                </div>
                <div style="display:flex; gap:8px; margin-bottom:8px;">
                    <input id="adm-member-keyword" type="text" value="${String(this.state.adminMemberFilterKeyword || '').replace(/"/g, '&quot;')}" placeholder="搜索用户名/昵称/邀请码" style="flex:1;height:36px;border:1px solid #e5e5ea;border-radius:8px;padding:0 10px;font-size:12px;">
                    <button onclick="refreshAdminMembers(1)" style="height:36px;border:none;border-radius:8px;background:#111;color:#fff;padding:0 12px;font-size:12px;">筛选</button>
                </div>
                <div style="font-size:12px;color:#999;margin:6px 0 8px;">最近会员列表</div>
                ${rows.length ? rows.map((x) => `<div style="padding:10px 12px;border:1px solid #ececf0;border-radius:10px;margin-bottom:8px;"><div style="font-size:13px;color:#111;font-weight:600;">#${Number(x.id||0)} 会员名称 ${x.nickname || x.username || '-'} · ${x.vipLevel || 'free'}</div><div style="font-size:12px;color:#666;margin-top:4px;">账号 ${x.username || '-'} · 到期 ${x.vipExpireAt ? String(x.vipExpireAt).slice(0,10) : '-'}${x.inviteCode ? ` · 邀请码 ${x.inviteCode}` : ''}</div><div style="display:flex;gap:8px;margin-top:8px;"><button onclick="resetAdminMemberPassword(${Number(x.id||0)})" style="height:30px;border:none;border-radius:8px;background:#3A66FF;color:#fff;padding:0 10px;font-size:12px;">重置密码</button><button onclick="deleteAdminMember(${Number(x.id||0)}, '${String(x.username || '').replace(/'/g, '\\\'')}')" style="height:30px;border:none;border-radius:8px;background:#F04438;color:#fff;padding:0 10px;font-size:12px;">删除用户</button></div></div>`).join('') : '<div style="padding:12px;color:#999;">暂无数据</div>'}
                <div style="display:flex; align-items:center; justify-content:space-between; margin-top:8px; font-size:12px; color:#666;">
                    <button onclick="prevAdminMembersPage()" style="height:30px;border:1px solid #ddd;border-radius:8px;background:#fff;padding:0 10px;">上一页</button>
                    <span>第 ${Number(this.state.adminMemberPage || 1)} / ${totalPages} 页 · 共 ${Number(this.state.adminMemberTotal || 0)} 条</span>
                    <button onclick="nextAdminMembersPage()" style="height:30px;border:1px solid #ddd;border-radius:8px;background:#fff;padding:0 10px;">下一页</button>
                </div>
            `;
        } else if (type === 'orders') {
            const rows = Array.isArray(this.state.adminOrderRows) ? this.state.adminOrderRows.slice(0, 40) : [];
            const totalPages = Math.max(1, Math.ceil(Number(this.state.adminOrderTotal || 0) / Number(this.state.adminOrderPageSize || 20)));
            content = `
                <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-bottom:8px;">
                    <input id="adm-order-keyword" type="text" value="${String(this.state.adminOrderFilterKeyword || '').replace(/"/g, '&quot;')}" placeholder="订单号/套餐" style="height:40px;border:1px solid #e5e5ea;border-radius:10px;padding:0 10px;font-size:13px;">
                    <input id="adm-order-user-id" type="number" value="${String(this.state.adminOrderFilterUserId || '').replace(/"/g, '&quot;')}" placeholder="用户ID" style="height:40px;border:1px solid #e5e5ea;border-radius:10px;padding:0 10px;font-size:13px;">
                    <select id="adm-order-status" style="height:40px;border:1px solid #e5e5ea;border-radius:10px;padding:0 10px;font-size:13px;"><option value="" ${!this.state.adminOrderFilterStatus ? 'selected' : ''}>全部状态</option><option value="pending" ${this.state.adminOrderFilterStatus === 'pending' ? 'selected' : ''}>pending</option><option value="paid" ${this.state.adminOrderFilterStatus === 'paid' ? 'selected' : ''}>paid</option><option value="fulfilled" ${this.state.adminOrderFilterStatus === 'fulfilled' ? 'selected' : ''}>fulfilled</option><option value="cancelled" ${this.state.adminOrderFilterStatus === 'cancelled' ? 'selected' : ''}>cancelled</option><option value="refunded" ${this.state.adminOrderFilterStatus === 'refunded' ? 'selected' : ''}>refunded</option></select>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:12px;">
                    <input id="adm-order-start-date" type="date" value="${String(this.state.adminOrderFilterStartDate || '').replace(/"/g, '&quot;')}" style="height:40px;border:1px solid #e5e5ea;border-radius:10px;padding:0 10px;font-size:13px;">
                    <input id="adm-order-end-date" type="date" value="${String(this.state.adminOrderFilterEndDate || '').replace(/"/g, '&quot;')}" style="height:40px;border:1px solid #e5e5ea;border-radius:10px;padding:0 10px;font-size:13px;">
                </div>
                <div style="display:flex; gap:8px; margin-bottom:10px;">
                    <button onclick="refreshAdminOrders(1)" style="height:34px;border:none;border-radius:8px;background:#111;color:#fff;padding:0 10px;font-size:12px;">筛选</button>
                    <button onclick="exportAdminOrdersCsv()" style="height:34px;border:1px solid #ddd;border-radius:8px;background:#fff;color:#333;padding:0 10px;font-size:12px;">导出CSV</button>
                    <button onclick="batchUpdateAdminOrders('fulfilled')" style="height:34px;border:1px solid #ddd;border-radius:8px;background:#fff;color:#333;padding:0 10px;font-size:12px;">批量履约</button>
                    <button onclick="batchUpdateAdminOrders('refunded')" style="height:34px;border:1px solid #ddd;border-radius:8px;background:#fff;color:#333;padding:0 10px;font-size:12px;">批量退款</button>
                </div>
                ${rows.length ? rows.map((x) => {
                    const sid = Number(x.id || 0);
                    const st = String(x.status || '');
                    const next = st === 'fulfilled' ? 'refunded' : 'fulfilled';
                    const label = next === 'refunded' ? '标记退款' : '标记履约';
                    const checked = Array.isArray(this.state.adminOrderSelectedIds) && this.state.adminOrderSelectedIds.includes(sid) ? 'checked' : '';
                    return `<div style="padding:10px 12px;border:1px solid #ececf0;border-radius:10px;margin-bottom:8px;"><div style="display:flex;align-items:center;gap:8px;"><input type="checkbox" ${checked} onclick="toggleAdminOrderSelect(${sid})"><div style="font-size:13px;color:#111;font-weight:600;">${x.order_no || x.orderNo || '-'} · ${x.plan_code || x.planCode || '-'}</div></div><div style="font-size:12px;color:#666;margin-top:4px;">用户#${Number(x.user_id || x.userId || 0)} · ¥${Number(x.amount_yuan || x.amountYuan || 0).toFixed(2)} · ${st}</div><div style="margin-top:8px;"><button onclick="updateAdminOrderStatus(${sid}, '${next}')" style="height:34px;border:none;border-radius:8px;background:#111;color:#fff;padding:0 10px;font-size:12px;">${label}</button></div></div>`;
                }).join('') : '<div style="padding:12px;color:#999;">暂无订单</div>'}
                <div style="display:flex; align-items:center; justify-content:space-between; margin-top:8px; font-size:12px; color:#666;">
                    <button onclick="prevAdminOrdersPage()" style="height:30px;border:1px solid #ddd;border-radius:8px;background:#fff;padding:0 10px;">上一页</button>
                    <span>第 ${Number(this.state.adminOrderPage || 1)} / ${totalPages} 页 · 共 ${Number(this.state.adminOrderTotal || 0)} 条</span>
                    <button onclick="nextAdminOrdersPage()" style="height:30px;border:1px solid #ddd;border-radius:8px;background:#fff;padding:0 10px;">下一页</button>
                </div>
            `;
        } else if (type === 'codes') {
            const rows = Array.isArray(this.state.adminCodeRows) ? this.state.adminCodeRows.slice(0, 50) : [];
            const totalPages = Math.max(1, Math.ceil(Number(this.state.adminCodeTotal || 0) / Number(this.state.adminCodePageSize || 30)));
            content = `
                <div style="display:grid; grid-template-columns:1fr; gap:10px; margin-bottom:12px;">
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                        <div><div style="font-size:12px;color:#666;margin-bottom:6px;">数量</div><input id="adm-code-count" type="number" value="10" style="width:100%;height:42px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:14px;"></div>
                        <div><div style="font-size:12px;color:#666;margin-bottom:6px;">等级</div><select id="adm-code-plan" style="width:100%;height:42px;border:1px solid #e5e5ea;border-radius:10px;padding:0 10px;font-size:14px;"><option value="city">城市</option><option value="province">省级</option><option value="country" selected>全国</option></select></div>
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
                        <div><div style="font-size:12px;color:#666;margin-bottom:6px;">时长天数</div><input id="adm-code-days" type="number" value="365" style="width:100%;height:42px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:14px;"></div>
                        <div><div style="font-size:12px;color:#666;margin-bottom:6px;">最多次数</div><input id="adm-code-uses" type="number" value="1" style="width:100%;height:42px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:14px;"></div>
                        <div><div style="font-size:12px;color:#666;margin-bottom:6px;">范围模式</div><select id="adm-code-scope-mode" style="width:100%;height:42px;border:1px solid #e5e5ea;border-radius:10px;padding:0 10px;font-size:14px;"><option value="fixed" selected>固定</option><option value="city">城市</option><option value="province">省份</option><option value="country">全国</option></select></div>
                    </div>
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">固定范围值</div><input id="adm-code-scope-value" type="text" placeholder="例如 北京 / 广东省 / 全国" style="width:100%;height:42px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:14px;"></div>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-bottom:10px;">
                    <input id="adm-code-keyword" type="text" value="${String(this.state.adminCodeFilterKeyword || '').replace(/"/g, '&quot;')}" placeholder="激活码关键字" style="height:36px;border:1px solid #e5e5ea;border-radius:8px;padding:0 10px;font-size:12px;">
                    <select id="adm-code-filter-plan" style="height:36px;border:1px solid #e5e5ea;border-radius:8px;padding:0 10px;font-size:12px;"><option value="" ${!this.state.adminCodeFilterPlan ? 'selected' : ''}>全部等级</option><option value="city" ${this.state.adminCodeFilterPlan === 'city' ? 'selected' : ''}>城市</option><option value="province" ${this.state.adminCodeFilterPlan === 'province' ? 'selected' : ''}>省级</option><option value="country" ${this.state.adminCodeFilterPlan === 'country' ? 'selected' : ''}>全国</option></select>
                    <select id="adm-code-filter-active" style="height:36px;border:1px solid #e5e5ea;border-radius:8px;padding:0 10px;font-size:12px;"><option value="" ${!this.state.adminCodeFilterActive ? 'selected' : ''}>全部状态</option><option value="1" ${this.state.adminCodeFilterActive === '1' ? 'selected' : ''}>启用</option><option value="0" ${this.state.adminCodeFilterActive === '0' ? 'selected' : ''}>停用</option></select>
                </div>
                <div style="display:flex; gap:8px; margin-bottom:8px;">
                    <button onclick="refreshAdminActivationCodes(1)" style="height:32px;border:none;border-radius:8px;background:#111;color:#fff;padding:0 10px;font-size:12px;">筛选</button>
                    <button onclick="exportAdminCodesCsv()" style="height:32px;border:1px solid #ddd;border-radius:8px;background:#fff;padding:0 10px;font-size:12px;">导出CSV</button>
                    <button onclick="batchToggleAdminCodes(true)" style="height:32px;border:1px solid #ddd;border-radius:8px;background:#fff;padding:0 10px;font-size:12px;">批量启用</button>
                    <button onclick="batchToggleAdminCodes(false)" style="height:32px;border:1px solid #ddd;border-radius:8px;background:#fff;padding:0 10px;font-size:12px;">批量停用</button>
                </div>
                <div style="font-size:12px;color:#999;margin:6px 0 8px;">最近激活码</div>
                ${rows.length ? rows.map((x) => {
                    const code = String(x.code || '');
                    const checked = Array.isArray(this.state.adminCodeSelected) && this.state.adminCodeSelected.includes(code) ? 'checked' : '';
                    return `<div style="padding:10px 12px;border:1px solid #ececf0;border-radius:10px;margin-bottom:8px;"><div style="display:flex;align-items:center;gap:8px;"><input type="checkbox" ${checked} onclick="toggleAdminCodeSelect('${code}')"><div style="font-size:13px;color:#111;font-weight:600;">${code || '-'} · ${x.plan_code || x.planCode || '-'}</div></div><div style="font-size:12px;color:#666;margin-top:4px;">已用 ${Number(x.used_count || x.usedCount || 0)}/${Number(x.max_uses || x.maxUses || 0)} · ${x.is_active || x.isActive ? '启用中' : '已停用'}</div><div style="margin-top:8px;"><button onclick="toggleAdminActivationCode('${code}', ${!(x.is_active || x.isActive)})" style="height:34px;border:none;border-radius:8px;background:#111;color:#fff;padding:0 10px;font-size:12px;">${x.is_active || x.isActive ? '停用' : '启用'}</button></div></div>`;
                }).join('') : '<div style="padding:12px;color:#999;">暂无激活码</div>'}
                <div style="display:flex; align-items:center; justify-content:space-between; margin-top:8px; font-size:12px; color:#666;">
                    <button onclick="prevAdminCodesPage()" style="height:30px;border:1px solid #ddd;border-radius:8px;background:#fff;padding:0 10px;">上一页</button>
                    <span>第 ${Number(this.state.adminCodePage || 1)} / ${totalPages} 页 · 共 ${Number(this.state.adminCodeTotal || 0)} 条</span>
                    <button onclick="nextAdminCodesPage()" style="height:30px;border:1px solid #ddd;border-radius:8px;background:#fff;padding:0 10px;">下一页</button>
                </div>
            `;
        } else if (type === 'rewards') {
            const sum = this.state.adminRewardSummary || {};
            const rows = Array.isArray(this.state.adminRewardRows) ? this.state.adminRewardRows.slice(0, 50) : [];
            const totalPages = Math.max(1, Math.ceil(Number(this.state.adminRewardTotal || 0) / Number(this.state.adminRewardPageSize || 30)));
            content = `
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px;">
                    <div style="border:1px solid #ececf0;border-radius:10px;padding:10px;"><div style="font-size:12px;color:#999;">已发放笔数</div><div style="font-size:20px;font-weight:700;color:#111;">${Number(sum.grantedCount || 0)}</div><div style="font-size:12px;color:#666;">¥${Number(sum.grantedAmount || 0).toFixed(2)}</div></div>
                    <div style="border:1px solid #ececf0;border-radius:10px;padding:10px;"><div style="font-size:12px;color:#999;">已驳回笔数</div><div style="font-size:20px;font-weight:700;color:#111;">${Number(sum.rejectedCount || 0)}</div><div style="font-size:12px;color:#666;">¥${Number(sum.rejectedAmount || 0).toFixed(2)}</div></div>
                </div>
                <div style="display:flex; gap:8px; margin-bottom:10px;">
                    <select id="adm-reward-status" style="height:34px;border:1px solid #e5e5ea;border-radius:8px;padding:0 10px;font-size:12px;"><option value="" ${!this.state.adminRewardFilterStatus ? 'selected' : ''}>全部状态</option><option value="granted" ${this.state.adminRewardFilterStatus === 'granted' ? 'selected' : ''}>granted</option><option value="rejected" ${this.state.adminRewardFilterStatus === 'rejected' ? 'selected' : ''}>rejected</option><option value="pending" ${this.state.adminRewardFilterStatus === 'pending' ? 'selected' : ''}>pending</option></select>
                    <button onclick="refreshAdminRewards(1)" style="height:34px;border:none;border-radius:8px;background:#111;color:#fff;padding:0 10px;font-size:12px;">筛选</button>
                    <button onclick="exportAdminRewardsCsv()" style="height:34px;border:1px solid #ddd;border-radius:8px;background:#fff;padding:0 10px;font-size:12px;">导出CSV</button>
                </div>
                ${rows.length ? rows.map((x) => `<div style="padding:10px 12px;border:1px solid #ececf0;border-radius:10px;margin-bottom:8px;"><div style="font-size:13px;color:#111;font-weight:600;">邀请人#${Number(x.inviter_user_id || x.inviterUserId || 0)} -> 被邀请人#${Number(x.invitee_user_id || x.inviteeUserId || 0)}</div><div style="font-size:12px;color:#666;margin-top:4px;">${x.event_type || x.eventType || '-'} · ${x.status || '-'} · ¥${Number(x.reward_yuan || x.rewardYuan || 0).toFixed(2)}</div></div>`).join('') : '<div style="padding:12px;color:#999;">暂无奖励记录</div>'}
                <div style="display:flex; align-items:center; justify-content:space-between; margin-top:8px; font-size:12px; color:#666;">
                    <button onclick="prevAdminRewardsPage()" style="height:30px;border:1px solid #ddd;border-radius:8px;background:#fff;padding:0 10px;">上一页</button>
                    <span>第 ${Number(this.state.adminRewardPage || 1)} / ${totalPages} 页 · 共 ${Number(this.state.adminRewardTotal || 0)} 条</span>
                    <button onclick="nextAdminRewardsPage()" style="height:30px;border:1px solid #ddd;border-radius:8px;background:#fff;padding:0 10px;">下一页</button>
                </div>
            `;
        } else if (type === 'auth') {
            const rows = Array.isArray(this.state.adminAuthRows) ? this.state.adminAuthRows.slice(0, 40) : [];
            content = `
                <div style="display:grid; grid-template-columns:1fr; gap:10px; margin-bottom:12px;">
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">授权用户ID</div><input id="adm-auth-user-id" type="number" placeholder="例如 12" style="width:100%;height:42px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:14px;"></div>
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">授权角色</div><select id="adm-auth-role" style="width:100%;height:42px;border:1px solid #e5e5ea;border-radius:10px;padding:0 10px;font-size:14px;"><option value="ops_admin">运营管理员</option><option value="order_admin">订单管理员</option><option value="finance_admin">财务管理员</option><option value="support_admin">客服管理员</option><option value="auditor">审计员</option><option value="admin">管理员</option></select></div>
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">额外权限（逗号分隔）</div><input id="adm-auth-perms" type="text" placeholder="order.write,reward.write" style="width:100%;height:42px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:13px;"></div>
                </div>
                <div style="font-size:12px;color:#999;margin:6px 0 8px;">当前管理员</div>
                ${rows.length ? rows.map((x) => `<div style="padding:10px 12px;border:1px solid #ececf0;border-radius:10px;margin-bottom:8px;"><div style="font-size:13px;color:#111;font-weight:600;">#${Number(x.id || 0)} ${x.username || '-'} · ${x.role || '-'}</div><div style="font-size:12px;color:#666;margin-top:4px;">权限：${Array.isArray(x.effectivePermissions) ? x.effectivePermissions.join(', ') : '-'}</div></div>`).join('') : '<div style="padding:12px;color:#999;">暂无管理员数据</div>'}
            `;
        } else if (type === 'audit') {
            const rows = Array.isArray(this.state.adminAuditRows) ? this.state.adminAuditRows.slice(0, 30) : [];
            content = rows.length ? rows.map((x) => `
                <div style="padding:10px 12px; border:1px solid #ececf0; border-radius:10px; margin-bottom:8px;">
                    <div style="font-size:13px; color:#111; font-weight:600;">${x.module || '-'} / ${x.action || '-'}</div>
                    <div style="font-size:12px; color:#666; margin-top:4px;">${(x.createdAt || '').replace('T', ' ').slice(0, 19)} · ${x.targetKey || '-'}</div>
                </div>
            `).join('') : '<div style="padding:12px; color:#999;">暂无日志</div>';
        } else if (type === 'pin') {
            content = `
                <div style="display:grid; grid-template-columns: 1fr; gap:12px;">
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">当前PIN码</div><input id="adm-pin-old" type="password" inputmode="numeric" placeholder="请输入当前PIN码" style="width:100%;height:44px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:16px;"></div>
                    <div><div style="font-size:12px;color:#666;margin-bottom:6px;">新PIN码（6位数字）</div><input id="adm-pin-new" type="password" inputmode="numeric" placeholder="请输入新PIN码" style="width:100%;height:44px;border:1px solid #e5e5ea;border-radius:10px;padding:0 12px;font-size:16px;"></div>
                </div>
            `;
        }
        const footer = type === 'audit'
            ? `<button onclick="refreshAdminAudit()" style="width:100%;height:48px;border:none;border-radius:14px;background:#111;color:#fff;font-size:16px;font-weight:700;">刷新日志</button>`
            : type === 'info'
                ? `<button onclick="refreshAdminInfo(1, false)" style="width:100%;height:48px;border:none;border-radius:14px;background:#111;color:#fff;font-size:16px;font-weight:700;">刷新信息管理</button>`
            : type === 'orders'
                ? `<button onclick="refreshAdminOrders()" style="width:100%;height:48px;border:none;border-radius:14px;background:#111;color:#fff;font-size:16px;font-weight:700;">刷新订单</button>`
                : type === 'rewards'
                    ? `<button onclick="refreshAdminRewards()" style="width:100%;height:48px;border:none;border-radius:14px;background:#111;color:#fff;font-size:16px;font-weight:700;">刷新奖励</button>`
                    : type === 'codes'
                        ? `<button onclick="batchCreateActivationCodes()" style="width:100%;height:48px;border:none;border-radius:14px;background:#111;color:#fff;font-size:16px;font-weight:700;">生成激活码</button>`
                        : type === 'members'
                            ? `<button onclick="grantMemberVip()" style="width:100%;height:48px;border:none;border-radius:14px;background:#111;color:#fff;font-size:16px;font-weight:700;">发放会员</button>`
                            : type === 'auth'
                                ? `<button onclick="grantAdminRole()" style="width:100%;height:48px;border:none;border-radius:14px;background:#111;color:#fff;font-size:16px;font-weight:700;">保存授权</button>`
                                : `<button onclick="saveAdminPanel()" style="width:100%;height:48px;border:none;border-radius:14px;background:#111;color:#fff;font-size:16px;font-weight:700;">保存并发布</button>`;
        return `
            <div style="position: fixed; inset: 0; z-index: 9999; background: #f5f6f8;">
                <div style="height: calc(max(env(safe-area-inset-top), 20px) + 56px); padding: calc(max(env(safe-area-inset-top), 20px) + 8px) 14px 10px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #ececec; background:#fff;">
                    <button onclick="closeAdminPanel()" style="border:none;background:#f2f3f5;color:#333;padding:8px 12px;border-radius:10px;font-size:14px;">返回</button>
                    <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
                        <div style="font-size:17px;font-weight:700;">${title}</div>
                        <div style="display:flex; align-items:center; gap:6px;">
                            <div style="font-size:11px; color:${this.state.adminPublishMode === 'local' ? '#C06B00' : '#2F7A3B'}; background:${this.state.adminPublishMode === 'local' ? '#FFF3E2' : '#EAF8EC'}; border-radius:10px; padding:2px 8px;">${publishStatusText}</div>
                            <div style="font-size:11px; color:${dbColor}; background:${dbBg}; border-radius:10px; padding:2px 8px;">${dbText}</div>
                        </div>
                    </div>
                    <div style="width:72px; text-align:right; font-size:10px; color:#9A9A9A; line-height:1.3;">${publishStatusHint ? '已提示' : ''}</div>
                </div>
                <div style="height: calc(100% - max(env(safe-area-inset-top), 20px) - 56px); overflow-y:auto; padding:14px 14px calc(max(env(safe-area-inset-bottom), 20px) + 78px);">
                    <div style="background:#fff;border-radius:18px;padding:14px;box-shadow:0 1px 0 rgba(0,0,0,0.04);">
                        ${content}
                    </div>
                    <div style="padding:12px 0 calc(max(env(safe-area-inset-bottom), 20px) + 12px);">
                        ${footer}
                    </div>
                </div>
            </div>
        `;
    },

    getMemberCenterHTML() {
        const user = this.state.user || {};
        user.vipLevel = user.vipLevel || 'free';
        user.balance = Number(user.balance || 0);
        user.avatar = user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop';
        user.username = user.username || '用户';
        user.inviteCode = user.inviteCode || '';
        user.invitedCount = Number(user.invitedCount || 0);
        user.inviteRewardTotal = Number(user.inviteRewardTotal || 0);
        user.role = user.role || 'user';

        const cityPrice = this.getPlanPrice('city', 399);
        const provincePrice = this.getPlanPrice('province', 999);
        const countryPrice = this.getPlanPrice('country', 2999);
        const memberCopyCfg = (this.state.runtimeConfig && this.state.runtimeConfig['copy.member']) || {};
        const permissionMatrix = this.getMemberPermissionMatrix();
        const viewText = (n) => Number(n) < 0 ? '无限制' : `${Math.max(0, Number(n || 0))}次`;
        const keywordText = (n) => `${Math.max(0, Number(n || 0))}个`;
        const normalizeMemberCopy = (obj, t, s, b) => ({
            title: String((obj && obj.title) || t),
            subtitle: String((obj && obj.subtitle) || s),
            benefits: (Array.isArray(obj && obj.benefits) ? obj.benefits : b).map((x) => String(x || '').trim()).filter(Boolean),
        });
        const freeCopy = normalizeMemberCopy(memberCopyCfg.free, '免费会员', '基础浏览权益', ['免费体验浏览10条任意招标信息', '免费体验1个关键词订阅']);
        const cityCopy = normalizeMemberCopy(memberCopyCfg.city, '城市会员', '解锁单城商机', ['本市无限浏览', '跨市浏览 100 条', '订阅 10 个关键词']);
        const provinceCopy = normalizeMemberCopy(memberCopyCfg.province, '省级会员', '统揽全省项目', ['本省无限浏览', '跨省浏览 500 条', '订阅 50 个关键词']);
        const countryCopy = normalizeMemberCopy(memberCopyCfg.country, '全国会员', '全国商机尽在掌握', ['全国无限浏览', '订阅 200 个关键词', '专属客服服务']);

        const planDefs = [
            { code: 'city', title: cityCopy.title, subtitle: cityCopy.subtitle, price: cityPrice, displayPrice: this.getPlanDisplayPrice('city', cityPrice), benefits: cityCopy.benefits, views: viewText(permissionMatrix.city.viewLimit), keywords: keywordText(permissionMatrix.city.keywordLimit), scope: permissionMatrix.city.scope, devices: String(permissionMatrix.city.deviceLimit), service: String(permissionMatrix.city.serviceCount) },
            { code: 'province', title: provinceCopy.title, subtitle: provinceCopy.subtitle, price: provincePrice, displayPrice: this.getPlanDisplayPrice('province', provincePrice), benefits: provinceCopy.benefits, views: viewText(permissionMatrix.province.viewLimit), keywords: keywordText(permissionMatrix.province.keywordLimit), scope: permissionMatrix.province.scope, devices: String(permissionMatrix.province.deviceLimit), service: String(permissionMatrix.province.serviceCount) },
            { code: 'country', title: countryCopy.title, subtitle: countryCopy.subtitle, price: countryPrice, displayPrice: this.getPlanDisplayPrice('country', countryPrice), benefits: countryCopy.benefits, views: viewText(permissionMatrix.country.viewLimit), keywords: keywordText(permissionMatrix.country.keywordLimit), scope: permissionMatrix.country.scope, devices: String(permissionMatrix.country.deviceLimit), service: String(permissionMatrix.country.serviceCount) },
        ];

        let selectedPlan = String(this.state.memberPurchasePlan || '').trim();
        if (!['city', 'province', 'country'].includes(selectedPlan)) selectedPlan = user.vipLevel === 'province' || user.vipLevel === 'country' ? user.vipLevel : 'city';
        this.state.memberPurchasePlan = selectedPlan;
        const selectedPlanDef = planDefs.find((x) => x.code === selectedPlan) || planDefs[0];

        const payCfg = this.getPaymentRuntimeConfig();
        const payMethods = [];
        if (payCfg.wechatEnabled) payMethods.push({ code: 'wechat', label: payCfg.wechatLabel || '微信支付', color: '#07C160', icon: '微' });
        if (payCfg.alipayEnabled) payMethods.push({ code: 'alipay', label: payCfg.alipayLabel || '支付宝支付', color: '#1677FF', icon: '支' });
        if (payCfg.transferEnabled) payMethods.push({ code: 'bank_transfer', label: payCfg.transferLabel || '对公转账', color: '#FF9500', icon: '公' });
        let selectedMethod = String(this.state.memberPurchaseMethod || '').trim().toLowerCase();
        if (!payMethods.find((x) => x.code === selectedMethod)) selectedMethod = payMethods.length ? payMethods[0].code : '';
        this.state.memberPurchaseMethod = selectedMethod;

        const transfer = this.getCorporateTransferInfo();
        const inviteEnabled = this.getFeatureFlag('inviteEnabled', true);
        const withdrawEnabled = this.getFeatureFlag('withdrawEnabled', false);
        const showAdminDrawer = !!(this.state.adminDrawerOpen && user.isLogged && this.isAdminUser());
        const adminPanelHtml = this.getAdminPanelHtml();
        const adminDrawerHtml = showAdminDrawer ? this.getAdminDrawerHtml() : '';
        const expireText = this.normalizeVipExpireText(user.vipExpire || user.vipExpireRaw || '');
        const levelTextMap = { free: '免费会员', city: '城市会员', province: '省级会员', country: '全国会员' };
        const currentLevelText = levelTextMap[user.vipLevel] || '免费会员';
        const canSubmit = !!user.isLogged;
        const trialUsage = {
            city: !!(user.trialUsage && user.trialUsage.city),
            province: !!(user.trialUsage && user.trialUsage.province),
            country: !!(user.trialUsage && user.trialUsage.country),
        };

        let currentTab = this.state.vipCardTab;
        if (!currentTab) {
            currentTab = user.isLogged ? (user.vipLevel || 'free') : 'free';
            this.state.vipCardTab = currentTab;
        }
        if (['city', 'province', 'country'].includes(currentTab)) {
            selectedPlan = currentTab;
            this.state.memberPurchasePlan = currentTab;
        }
        const selectedPlanFromTab = planDefs.find((x) => x.code === selectedPlan) || selectedPlanDef;
        const selectedPlanDisplay = selectedPlanFromTab || selectedPlanDef;

        let userCardHtml = '';
        let memberContentMarginTop = '-28px';
        const cityBadgeIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="#C0C0C0" stroke="#808080" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-top: -2px;"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path></svg>';
        const provBadgeIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="#FFD700" stroke="#DAA520" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-top: -2px;"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path></svg>';
        const countryBadgeIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="#333" stroke="#FFD700" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-top: -2px;"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path></svg>';
        const cityTitleIcon = '<svg width="22" height="22" viewBox="0 0 24 24" fill="#C0C0C0" stroke="#808080" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="display:block; margin-right:8px; flex-shrink:0;"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path></svg>';
        const provTitleIcon = '<svg width="22" height="22" viewBox="0 0 24 24" fill="#FFD700" stroke="#DAA520" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="display:block; margin-right:8px; flex-shrink:0;"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path></svg>';
        const countryTitleIcon = '<svg width="22" height="22" viewBox="0 0 24 24" fill="#333" stroke="#FFD700" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:block; margin-right:8px; flex-shrink:0;"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path></svg>';

        if (user.isLogged) {
            let vipBadge = '';
            let vipIcon = '';
            let cardStyle = 'background: radial-gradient(circle at 18% 10%, rgba(255,255,255,0.24) 0, rgba(255,255,255,0) 36%), radial-gradient(circle at 84% 82%, rgba(0,229,255,0.2) 0, rgba(0,229,255,0) 44%), linear-gradient(135deg, #0F5FE9 0%, #007AFF 52%, #00B4FF 100%); color: white; box-shadow: 0 8px 24px rgba(16, 96, 233, 0.28);';
            let avatarBorder = 'border: 2px solid rgba(255,255,255,0.8);';
            let badgeStyle = 'background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(4px);';
            let actionBtnStyle = 'background: rgba(255,255,255,0.2); color: white;';
            if (user.vipLevel === 'city') {
                vipBadge = '城市会员';
                vipIcon = cityBadgeIcon;
                cardStyle = 'background: linear-gradient(135deg, #2C5F2D, #1E3F1F); color: white; box-shadow: 0 4px 12px rgba(44, 95, 45, 0.3);';
                avatarBorder = 'border: 2px solid rgba(255,255,255,0.6);';
                badgeStyle = 'background: rgba(255,255,255,0.15); color: white; backdrop-filter: blur(4px);';
            } else if (user.vipLevel === 'province') {
                vipBadge = '省级会员';
                vipIcon = provBadgeIcon;
                cardStyle = 'background: linear-gradient(135deg, #FFD700, #FDB931); color: #5D4037; box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);';
                avatarBorder = 'border: 2px solid rgba(255,255,255,0.8);';
                badgeStyle = 'background: rgba(255,255,255,0.4); color: #5D4037; backdrop-filter: blur(4px); font-weight: 600;';
                actionBtnStyle = 'background: rgba(255,255,255,0.4); color: #5D4037;';
            } else if (user.vipLevel === 'country') {
                vipBadge = '全国会员';
                vipIcon = countryBadgeIcon;
                cardStyle = 'background: linear-gradient(135deg, #1C1C1E, #2C2C2E); color: #FFD700; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4); border: 1px solid #333;';
                avatarBorder = 'border: 2px solid #FFD700;';
                badgeStyle = 'background: linear-gradient(90deg, #FFD700, #FDB931); color: #1C1C1E; font-weight: 800; box-shadow: 0 2px 4px rgba(0,0,0,0.3);';
                actionBtnStyle = 'background: rgba(255, 255, 255, 0.1); color: #FFD700; border: 1px solid #FFD700;';
            }
            const badgeHtml = user.vipLevel !== 'free'
                ? `<span class="tag-new" style="${badgeStyle} margin-left: 8px; padding: 2px 8px; border-radius: 12px; font-size: 11px; display: flex; align-items: center;"><span style="margin-right: 4px;">${vipIcon}</span>${vipBadge}</span>`
                : `<span class="tag-new" style="${badgeStyle} margin-left: 8px; padding: 2px 8px; border-radius: 12px; font-size: 11px;">普通用户</span>`;
            const expireHtml = user.vipLevel !== 'free'
                ? `<div style="font-size: 12px; opacity: 0.8; margin-top: 4px;">有效期至: ${expireText || '待同步'}</div>`
                : '';
            userCardHtml = `
                <div style="${cardStyle} padding: 20px; padding-top: calc(max(env(safe-area-inset-top), 44px) + 12px); display: flex; flex-direction: column; align-items: center; justify-content: flex-start; z-index: 0; position: absolute; top: 0; left: 0; width: 100%; height: 246px;">
                    <img src="${user.avatar}" style="width: 72px; height: 72px; border-radius: 50%; margin-bottom: 12px; object-fit: cover; ${avatarBorder} box-shadow: 0 4px 8px rgba(0,0,0,0.15);">
                    <div style="z-index: 2; display: flex; flex-direction: column; align-items: center;">
                        <div style="font-size: 20px; font-weight: 700; display: flex; align-items: center; margin-bottom: 6px; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">${user.username}${badgeHtml}</div>
                        ${expireHtml}
                    </div>
                    <button style="${actionBtnStyle} position: absolute; top: calc(max(env(safe-area-inset-top), 44px) + 10px); right: 14px; border: none; width: 28px; height: 28px; border-radius: 14px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); z-index: 30; cursor: pointer; -webkit-tap-highlight-color: transparent;" onclick="openMemberSettings()"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></button>
                    ${user.vipLevel === 'country' ? '<div style="position: absolute; right: -20px; bottom: 40px; font-size: 150px; opacity: 0.1; transform: rotate(15deg);">👑</div>' : ''}
                    ${user.vipLevel === 'province' ? '<div style="position: absolute; right: -20px; bottom: 40px; font-size: 150px; opacity: 0.1; transform: rotate(15deg);">💎</div>' : ''}
                    ${user.vipLevel === 'city' ? '<div style="position: absolute; right: -20px; bottom: 40px; font-size: 150px; opacity: 0.1; transform: rotate(15deg);">🏙️</div>' : ''}
                    ${user.vipLevel === 'free' ? '<div style="position: absolute; right: -20px; bottom: 40px; font-size: 150px; opacity: 0.05; transform: rotate(15deg);">👤</div>' : ''}
                </div>
                <div style="height: 246px;"></div>
            `;
        } else {
            memberContentMarginTop = '-24px';
            userCardHtml = `
                <div style="background: radial-gradient(circle at 16% 10%, rgba(255,255,255,0.28) 0, rgba(255,255,255,0) 36%), radial-gradient(circle at 85% 82%, rgba(0,229,255,0.22) 0, rgba(0,229,255,0) 44%), linear-gradient(135deg, #0F5FE9 0%, #007AFF 52%, #00B4FF 100%); color: white; padding: 20px; padding-top: calc(max(env(safe-area-inset-top), 44px) + 10px); display: flex; flex-direction: column; align-items: center; justify-content: flex-start; z-index: 0; position: absolute; top: 0; left: 0; width: 100%; height: 246px; overflow: hidden;">
                    <div style="position: absolute; inset: 0; background: linear-gradient(120deg, rgba(255,255,255,0.12), rgba(255,255,255,0) 35%);"></div>
                    <div style="width: 72px; height: 72px; background-color: rgba(255,255,255,0.86); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; box-shadow: 0 6px 14px rgba(0,0,0,0.1); z-index: 2; cursor: pointer;" onclick="login()"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>
                    <div style="text-align: center; margin-bottom: 10px; z-index: 2;"><div style="font-size: 18px; font-weight: 600; color: white;">未登录</div><div style="font-size: 13px; color: rgba(255,255,255,0.9); margin-top: 4px; line-height: 1.45;">点击圆形头像图标进入登录页面</div></div>
                </div>
                <div style="height: 246px;"></div>
            `;
        }

        const tabs = [
            { id: 'free', name: '免费会员' },
            { id: 'city', name: '城市会员' },
            { id: 'province', name: '省级会员' },
            { id: 'country', name: '全国会员' }
        ];
        let tabsHtml = `<div style="display: flex; background: white; padding: 4px; border-radius: 10px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">`;
        tabs.forEach((t) => {
            const isActive = t.id === currentTab;
            const activeStyle = isActive ? 'background: var(--primary-blue); color: white; font-weight: 600; box-shadow: 0 2px 4px rgba(0,0,0,0.1);' : 'color: #666;';
            tabsHtml += `<div onclick="switchVipCard('${t.id}'); selectMemberPurchasePlan('${t.id}')" style="flex: 1; text-align: center; padding: 8px 0; border-radius: 8px; font-size: 13px; transition: all 0.2s; cursor: pointer; ${activeStyle}">${t.name}</div>`;
        });
        tabsHtml += `</div>`;

        const renderBenefitsHtml = (items) => items.map((txt) => `<div style="display: flex; align-items: center;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="margin-right: 8px;"><polyline points="20 6 9 17 4 12"></polyline></svg>${txt}</div>`).join('');
        const renderTrialBtn = (planCode, textColor, bg) => {
            const tried = !!trialUsage[planCode];
            const expireDate = this.parseDate(user.vipExpireRaw || user.vipExpire || '');
            const isActive = !!(expireDate && !isNaN(expireDate.getTime()) && expireDate.getTime() > Date.now());
            const trialing = tried && user.vipLevel === planCode && isActive;
            const disabled = tried || trialing || !canSubmit;
            const text = trialing ? '试用中' : (tried ? '已试用' : '试用1个月');
            const btnBg = disabled ? 'rgba(255,255,255,0.45)' : bg;
            const btnColor = disabled ? 'rgba(0,0,0,0.45)' : textColor;
            const onclick = disabled ? '' : ` onclick="buyMember('${planCode}', 0)"`;
            return `<button${onclick} style="background:${btnBg};color:${btnColor};border:none;padding:8px 20px;border-radius:20px;font-weight:600;font-size:14px;${disabled ? 'cursor:not-allowed;' : ''}">${text}</button>`;
        };
        let cardContent = '';
        if (currentTab === 'free') {
            cardContent = `<div style="background: radial-gradient(circle at 18% 12%, rgba(255,255,255,0.2) 0, rgba(255,255,255,0) 34%), radial-gradient(circle at 84% 82%, rgba(0,229,255,0.2) 0, rgba(0,229,255,0) 44%), linear-gradient(135deg, #0F5FE9 0%, #007AFF 52%, #00B4FF 100%); color: white; padding: 24px; border-radius: 16px; position: relative; overflow: hidden; height: 180px; box-shadow: 0 10px 24px rgba(16,96,233,0.24);"><div style="position: relative; z-index: 2; height: 100%; display: flex; flex-direction: column;"><div style="font-size: 24px; font-weight: 800; margin-bottom: 8px;">${freeCopy.title}</div><div style="font-size: 14px; opacity: 0.9; margin-bottom: 12px;">${freeCopy.subtitle}</div><div style="font-size: 13px; display: flex; flex-direction: column; gap: 4px; flex: 1; justify-content: center;">${renderBenefitsHtml(freeCopy.benefits)}</div></div></div>`;
        } else if (currentTab === 'city') {
            cardContent = `<div style="background: linear-gradient(135deg, #2C5F2D, #1E3F1F); color: white; padding: 24px; border-radius: 16px; position: relative; overflow: hidden; height: 180px;"><div style="position: relative; z-index: 2; height: 100%; display: flex; flex-direction: column;"><div style="display: flex; justify-content: space-between; align-items: flex-start;"><div><div style="font-size: 24px; font-weight: 800; margin-bottom: 8px; display: flex; align-items: center;">${cityTitleIcon}${cityCopy.title}</div><div style="font-size: 14px; opacity: 0.9; margin-bottom: 12px;">${cityCopy.subtitle}</div></div><div style="text-align: right;"><div style="font-size: 20px; font-weight: 700;">${this.getPlanDisplayPrice('city', cityPrice)}</div><div style="font-size: 12px; opacity: 0.8;">/年</div></div></div><div style="flex: 1; display: flex; align-items: center; justify-content: space-between;"><div style="font-size: 13px; display: flex; flex-direction: column; gap: 4px;">${renderBenefitsHtml(cityCopy.benefits)}</div>${renderTrialBtn('city', '#2C5F2D', 'white')}</div></div></div>`;
        } else if (currentTab === 'province') {
            cardContent = `<div style="background: linear-gradient(135deg, #FFD700, #FDB931); color: #5D4037; padding: 24px; border-radius: 16px; position: relative; overflow: hidden; height: 180px;"><div style="position: relative; z-index: 2; height: 100%; display: flex; flex-direction: column;"><div style="display: flex; justify-content: space-between; align-items: flex-start;"><div><div style="font-size: 24px; font-weight: 800; margin-bottom: 8px; display: flex; align-items: center;">${provTitleIcon}${provinceCopy.title}</div><div style="font-size: 14px; opacity: 0.9; margin-bottom: 12px;">${provinceCopy.subtitle}</div></div><div style="text-align: right;"><div style="font-size: 20px; font-weight: 700;">${this.getPlanDisplayPrice('province', provincePrice)}</div><div style="font-size: 12px; opacity: 0.8;">/年</div></div></div><div style="flex: 1; display: flex; align-items: center; justify-content: space-between;"><div style="font-size: 13px; display: flex; flex-direction: column; gap: 4px;">${renderBenefitsHtml(provinceCopy.benefits)}</div>${renderTrialBtn('province', '#5D4037', 'white')}</div></div></div>`;
        } else if (currentTab === 'country') {
            cardContent = `<div style="background: linear-gradient(135deg, #1C1C1E, #2C2C2E); color: #FFD700; padding: 24px; border-radius: 16px; position: relative; overflow: hidden; height: 180px; border: 1px solid #333;"><div style="position: relative; z-index: 2; height: 100%; display: flex; flex-direction: column;"><div style="display: flex; justify-content: space-between; align-items: flex-start;"><div><div style="font-size: 24px; font-weight: 800; margin-bottom: 8px; display: flex; align-items: center;">${countryTitleIcon}${countryCopy.title}</div><div style="font-size: 14px; opacity: 0.9; margin-bottom: 12px;">${countryCopy.subtitle}</div></div><div style="text-align: right;"><div style="font-size: 20px; font-weight: 700;">${this.getPlanDisplayPrice('country', countryPrice)}</div><div style="font-size: 12px; opacity: 0.8;">/年</div></div></div><div style="flex: 1; display: flex; align-items: center; justify-content: space-between;"><div style="font-size: 13px; display: flex; flex-direction: column; gap: 4px;">${renderBenefitsHtml(countryCopy.benefits)}</div>${renderTrialBtn('country', '#1C1C1E', 'linear-gradient(90deg, #FFD700, #FDB931)')}</div></div></div>`;
        }

        const payMethodsHtml = payMethods.map((m) => {
            const active = m.code === selectedMethod;
            return `
                <div onclick="selectMemberPurchaseMethod('${m.code}')" style="display:flex;align-items:center;justify-content:space-between;border:1px solid ${active ? '#0A84FF' : '#ECEDEF'};border-radius:12px;padding:12px;background:${active ? '#F4F9FF' : '#fff'};">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <div style="width:24px;height:24px;border-radius:12px;background:${m.color};color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;">${m.icon}</div>
                        <div style="font-size:15px;color:#111;">${m.label}</div>
                    </div>
                    <div style="width:20px;height:20px;border-radius:10px;border:1px solid ${active ? '#0A84FF' : '#C8CBD2'};display:flex;align-items:center;justify-content:center;">
                        ${active ? '<div style="width:10px;height:10px;border-radius:5px;background:#0A84FF;"></div>' : ''}
                    </div>
                </div>
            `;
        }).join('');

        const transferHtml = selectedMethod === 'bank_transfer' ? `
            <div style="margin-top:10px;background:#F7F8FA;border-radius:10px;padding:10px 12px;font-size:12px;line-height:1.6;color:#333;">
                <div>公司名：${transfer.companyName}</div>
                <div>纳税人识别号：${transfer.taxNo}</div>
                <div>地址：${transfer.address}</div>
                <div>电话：${transfer.phone}</div>
                <div>开户行：${transfer.bank}</div>
                <div>账号：${transfer.account}</div>
                <div style="display:flex;gap:8px;margin-top:10px;">
                    <button onclick="copyMemberTransferInfo()" style="border:none;background:#4B5563;color:#fff;padding:6px 10px;border-radius:8px;">复制收款信息</button>
                </div>
            </div>
        ` : '';

        const compareTableHtml = `
            <table style="width:100%;border-collapse:collapse;font-size:12px;">
                <thead><tr style="background:#F8F9FB;"><th style="padding:10px 8px;text-align:left;">对比项</th><th style="padding:10px 8px;">免费</th><th style="padding:10px 8px;">城市</th><th style="padding:10px 8px;">省级</th><th style="padding:10px 8px;">全国</th></tr></thead>
                <tbody>
                    <tr><td style="padding:10px 8px;border-top:1px solid #F0F1F3;">查阅范围</td><td style="text-align:center;border-top:1px solid #F0F1F3;">${permissionMatrix.free.scope}</td><td style="text-align:center;border-top:1px solid #F0F1F3;">${planDefs[0].scope}</td><td style="text-align:center;border-top:1px solid #F0F1F3;">${planDefs[1].scope}</td><td style="text-align:center;border-top:1px solid #F0F1F3;">${planDefs[2].scope}</td></tr>
                    <tr><td style="padding:10px 8px;border-top:1px solid #F0F1F3;">项目查看</td><td style="text-align:center;border-top:1px solid #F0F1F3;">${viewText(permissionMatrix.free.viewLimit)}</td><td style="text-align:center;border-top:1px solid #F0F1F3;">${planDefs[0].views}</td><td style="text-align:center;border-top:1px solid #F0F1F3;">${planDefs[1].views}</td><td style="text-align:center;border-top:1px solid #F0F1F3;">${planDefs[2].views}</td></tr>
                    <tr><td style="padding:10px 8px;border-top:1px solid #F0F1F3;">关键词订阅</td><td style="text-align:center;border-top:1px solid #F0F1F3;">${keywordText(permissionMatrix.free.keywordLimit)}</td><td style="text-align:center;border-top:1px solid #F0F1F3;">${planDefs[0].keywords}</td><td style="text-align:center;border-top:1px solid #F0F1F3;">${planDefs[1].keywords}</td><td style="text-align:center;border-top:1px solid #F0F1F3;">${planDefs[2].keywords}</td></tr>
                    <tr><td style="padding:10px 8px;border-top:1px solid #F0F1F3;">设备登录数</td><td style="text-align:center;border-top:1px solid #F0F1F3;">${Math.max(1, Number(permissionMatrix.free.deviceLimit || 1))}</td><td style="text-align:center;border-top:1px solid #F0F1F3;">${planDefs[0].devices}</td><td style="text-align:center;border-top:1px solid #F0F1F3;">${planDefs[1].devices}</td><td style="text-align:center;border-top:1px solid #F0F1F3;">${planDefs[2].devices}</td></tr>
                    <tr><td style="padding:10px 8px;border-top:1px solid #F0F1F3;">人工服务</td><td style="text-align:center;border-top:1px solid #F0F1F3;">${Math.max(0, Number(permissionMatrix.free.serviceCount || 0))}</td><td style="text-align:center;border-top:1px solid #F0F1F3;">${planDefs[0].service}</td><td style="text-align:center;border-top:1px solid #F0F1F3;">${planDefs[1].service}</td><td style="text-align:center;border-top:1px solid #F0F1F3;">${planDefs[2].service}</td></tr>
                </tbody>
            </table>
        `;

        return `
            <div class="member-root" style="padding:0;width:100%;position:relative;background:#F2F2F7;">
                ${this.renderMemberHeader()}
                ${userCardHtml}
                <div class="member-content-wrap" style="padding: 16px; margin-top: ${memberContentMarginTop}; position: relative; z-index: 10; background: #F2F2F7; border-top-left-radius: 20px; border-top-right-radius: 20px; min-height: 500px; padding-bottom:100px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding: 8px 4px 0 4px;">
                        <div style="font-size: 18px; font-weight: 700; color: #333; display: flex; align-items: center;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; color: #FF9500;"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                            会员权益
                        </div>
                    </div>
                    ${tabsHtml}
                    <div style="margin-bottom: 16px;">${cardContent}</div>

                    <div style="background:#fff;border-radius:14px;padding:14px;box-shadow:0 4px 12px rgba(0,0,0,0.04);margin-bottom:12px;">
                        <div style="font-size:16px;font-weight:700;color:#111;margin-bottom:10px;">权益对比</div>
                        <div style="overflow:auto;">${compareTableHtml}</div>
                    </div>

                    <div style="background:#fff;padding:14px;border-radius:14px;box-shadow:0 4px 12px rgba(0,0,0,0.04);margin-bottom:12px;">
                        <div style="font-size:15px;font-weight:700;color:#111;margin-bottom:8px;">会员激活</div>
                        <div style="display:flex;gap:8px;">
                            <input type="text" class="activation-input" placeholder="请输入激活码 (如 VIPALL)" id="activation-code" style="flex:1;height:40px;border:1px solid #E5E7EB;border-radius:10px;padding:0 12px;">
                            <button style="background:#0A84FF;color:#fff;border:none;padding:0 16px;border-radius:10px;" onclick="activateMember()">激活</button>
                        </div>
                    </div>

                    <div style="background:#fff;padding:14px;border-radius:14px;box-shadow:0 4px 12px rgba(0,0,0,0.04);margin-bottom:14px;">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <div style="font-size:15px;font-weight:700;color:#111;">推广收益</div>
                            <div style="font-size:12px;color:#FF5A2A;">已赚 ¥${user.inviteRewardTotal.toFixed(2)}</div>
                        </div>
                        <div style="font-size:12px;color:#666;margin-top:6px;">邀请码：${user.inviteCode || '生成中'} · 邀请人数：${user.invitedCount}</div>
                        <div style="display:flex;gap:10px;margin-top:10px;">
                            <button onclick="${inviteEnabled ? 'shareInviteLink()' : `alert('邀请功能暂未开启')`}" style="flex:1;height:36px;border:none;border-radius:9px;background:${inviteEnabled ? '#E9F2FF' : '#F2F3F5'};color:#0A84FF;">邀请好友</button>
                            <button onclick="${withdrawEnabled ? `alert('请联系财务审核提现')` : `alert('提现功能暂未开启')`}" style="flex:1;height:36px;border:none;border-radius:9px;background:${withdrawEnabled ? '#EAF8EC' : '#F2F3F5'};color:#2F7A3B;">申请提现</button>
                            <button onclick="openReferralRecords()" style="flex:1;height:36px;border:none;border-radius:9px;background:#F5EEFF;color:#8B5CF6;">邀请记录</button>
                        </div>
                    </div>
                </div>

                <div class="member-purchase-bar" style="position:fixed;left:0;right:0;bottom:calc(max(env(safe-area-inset-bottom), 0px));background:#fff;border-top:1px solid #ECECEC;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;z-index:200;">
                    <div>
                        <div style="font-size:12px;color:#999;">当前套餐</div>
                        <div style="font-size:22px;font-weight:800;color:#FF5A2A;line-height:1.1;">试用1个月</div>
                    </div>
                    <button onclick="buyMember('${selectedPlanDisplay ? selectedPlanDisplay.code : 'city'}', 0)" style="height:44px;min-width:138px;border:none;border-radius:12px;background:${canSubmit ? '#0A84FF' : '#C7CBD3'};color:#fff;font-size:16px;font-weight:700;">${(() => { const code = selectedPlanDisplay ? selectedPlanDisplay.code : 'city'; const tried = !!trialUsage[code]; const d = this.parseDate(user.vipExpireRaw || user.vipExpire || ''); const active = !!(d && !isNaN(d.getTime()) && d.getTime() > Date.now()); return tried && user.vipLevel === code && active ? '试用中' : (tried ? '已试用' : '试用1个月'); })()}</button>
                </div>
            </div>
            ${adminDrawerHtml}
            ${adminPanelHtml}
        `;
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => App.init());
