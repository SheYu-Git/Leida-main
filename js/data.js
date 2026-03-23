// 模拟数据源 (与 Swift 模型一致)
const mockData = [
    {
        "id": 3530605,
        "title": "北京大学医院激光低频交变磁场治疗机、等速肌力评估康复训练仪、磁振热治疗仪、超声波治疗仪采购项目中标公告",
        "datetime": "2026-03-04 14:30:00",
        "bid_price": "¥5万元",
        "city": "北京",
        "purchaser": "北京大学医学部附属第一医院设备采购处及后勤保障部联合办公室",
        "types": "中标公告",
        "class": "tag-blue"
    },
    {
        "id": 3530181,
        "title": "榆垡镇2026年外围防线管控工作两支队伍建设项目公开招标公告",
        "datetime": "2026-03-04 09:15:00",
        "bid_price": "¥320.7384万元",
        "city": "北京",
        "purchaser": "北京市大兴区榆垡镇人民政府",
        "types": "公开招标公告",
        "class": "tag-orange"
    },
    {
        "id": 3530173,
        "title": "2026年经济责任、自然资源审计项目协审服务（第2包）竞争性磋商公告",
        "datetime": "2026-03-05 10:00:00",
        "bid_price": "金额见正文",
        "city": "北京",
        "purchaser": "北京市大兴区审计局",
        "types": "竞争性磋商公告",
        "class": "tag-grey"
    },
    {
        "id": 3530142,
        "title": "2026年至2027年采育镇人民政府及下属单位保洁服务采购项目公开招标公告",
        "datetime": "2026-03-03 16:45:00",
        "bid_price": "¥417.904万元",
        "city": "北京",
        "purchaser": "北京市大兴区采育镇人民政府",
        "types": "公开招标公告",
        "class": "tag-orange"
    },
    {
        "id": 3530139,
        "title": "大兴分局低空安全管控项目中标公告",
        "datetime": "2026-03-02 11:20:00",
        "bid_price": "金额见正文",
        "city": "北京",
        "purchaser": "北京市公安局大兴分局",
        "types": "中标公告",
        "class": "tag-blue"
    },
    {
        "id": 3530140,
        "title": "早期项目演示数据",
        "datetime": "2026-02-28 08:00:00",
        "bid_price": "¥100万元",
        "city": "北京",
        "purchaser": "演示单位",
        "types": "中标公告",
        "class": "tag-blue"
    }
];

// 扩展数据以演示无限滚动 (生成跨越20天的数据)
const originalMockData = [...mockData];
const baseDate = new Date('2026-03-05T10:00:00');

for(let i = 0; i < 20; i++) {
    // Each batch is 1 day earlier
    const currentBatchDate = new Date(baseDate);
    currentBatchDate.setDate(baseDate.getDate() - i);
    const dateStr = currentBatchDate.toISOString().split('T')[0];
    
    originalMockData.forEach((item, index) => {
        // Create a new date based on the batch day but keeping original time roughly
        // To vary it a bit, we add some random minutes
        const itemDate = new Date(currentBatchDate);
        itemDate.setHours(9 + (index % 8), (index * 15) % 60); // 9:00 to 17:00
        
        // Format: YYYY-MM-DD HH:mm:ss
        const pad = n => n.toString().padStart(2, '0');
        const formattedDate = `${itemDate.getFullYear()}-${pad(itemDate.getMonth()+1)}-${pad(itemDate.getDate())} ${pad(itemDate.getHours())}:${pad(itemDate.getMinutes())}:00`;

        mockData.push({
            ...item,
            id: item.id + (i + 1) * 10000 + index,
            title: item.title, // Or add suffix for debug: + ` (${dateStr})`
            datetime: formattedDate
        });
    });
}
// Sort by date desc
mockData.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));


// 订阅管理
const SubManager = {
    key: 'UserSubscriptions',
    apiBase: '',
    token: '',
    userKey: 'guest',
    subsCache: null,
    normalizeUserKey: function(v) {
        const s = String(v || '').trim();
        return s || 'guest';
    },
    getStorageKey: function() {
        return `${this.key}:${this.userKey || 'guest'}`;
    },
    setAuth: function(apiBase, token, userKey) {
        this.apiBase = String(apiBase || '');
        this.token = String(token || '');
        const nextUserKey = this.normalizeUserKey(userKey);
        if (this.userKey !== nextUserKey) this.subsCache = null;
        this.userKey = nextUserKey;
    },
    getSubs: function() {
        if (this.subsCache) return this.subsCache;
        let subs = [];
        try {
            const saved = localStorage.getItem(this.getStorageKey());
            if (saved && saved !== 'undefined' && saved !== 'null') {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) subs = parsed;
            }
        } catch (e) {
            subs = [];
        }
        
        // Data Migration: Ensure timestamps exist for legacy data
        let changed = false;
        subs = subs.map(s => {
            if (!s.createTime || !s.updateTime) {
                const now = new Date().toISOString();
                if (!s.createTime) s.createTime = s.createdAt || now; // Fallback to createdAt if exists
                if (!s.updateTime) s.updateTime = now;
                changed = true;
            }
            if (!Array.isArray(s.readItemIds)) {
                s.readItemIds = [];
                changed = true;
            }
            return s;
        });
        
        if (changed) {
            try { localStorage.setItem(this.getStorageKey(), JSON.stringify(subs)); } catch (e) {}
        }
        this.subsCache = subs;
        return this.subsCache;
    },
    saveSubs: function(subs) {
        this.subsCache = subs || [];
        try { localStorage.setItem(this.getStorageKey(), JSON.stringify(this.subsCache)); } catch (e) {}
    },
    refreshFromServer: async function() {
        if (!this.apiBase || !this.token) return this.getSubs();
        try {
            const localSubs = this.getSubs().slice();
            const url = `${this.apiBase}/api/member/subscriptions`;
            const resp = await fetch(url, { headers: { 'Authorization': `Bearer ${this.token}` } });
            const json = await resp.json().catch(() => null);
            if (resp.ok && json && json.code === 1 && Array.isArray(json.data)) {
                const makeKey = (s) => `${String(s.scopeType || 'country')}|${String(s.scopeValue || '')}|${JSON.stringify((Array.isArray(s.keywords) ? s.keywords : [s.keywords]).map(x => String(x || '').trim()).filter(Boolean).sort())}`;
                const localById = new Map(localSubs.map(s => [String(s.id), s]));
                const localByKey = new Map(localSubs.map(s => [makeKey(s), s]));
                const merged = (json.data || []).map((serverSub) => {
                    const localSub = localById.get(String(serverSub.id)) || localByKey.get(makeKey(serverSub));
                    if (!localSub) return serverSub;
                    const serverCheck = Number(serverSub.lastCheckTime || 0);
                    const localCheck = Number(localSub.lastCheckTime || 0);
                    const serverRead = Number(serverSub.lastReadAt || 0);
                    const localRead = Number(localSub.lastReadAt || 0);
                    const mergedRead = Math.max(serverRead, localRead);
                    const serverReadIds = Array.isArray(serverSub.readItemIds) ? serverSub.readItemIds.map(x => String(x)).filter(Boolean) : [];
                    const localReadIds = Array.isArray(localSub.readItemIds) ? localSub.readItemIds.map(x => String(x)).filter(Boolean) : [];
                    const mergedReadIds = Array.from(new Set([...(serverReadIds || []), ...(localReadIds || [])])).slice(0, 1000);
                    const preferLocalCount = localCheck >= serverCheck;
                    let unreadCount = Number(preferLocalCount ? (localSub.unreadCount || 0) : (serverSub.unreadCount || 0));
                    if (mergedRead && Math.max(serverCheck, localCheck) <= mergedRead) unreadCount = 0;
                    return {
                        ...serverSub,
                        unreadCount,
                        lastCheckTime: Math.max(serverCheck, localCheck),
                        lastReadAt: mergedRead,
                        readItemIds: mergedReadIds,
                        lastNotifiedAt: Number(localSub.lastNotifiedAt || 0)
                    };
                });
                const mergedKeySet = new Set(merged.map(makeKey));
                localSubs.forEach((s) => {
                    const key = makeKey(s);
                    if (!mergedKeySet.has(key)) merged.push(s);
                });
                this.saveSubs(merged);
            }
        } catch (e) {}
        return this.getSubs();
    },
    addSub: function(subData) {
        // subData format: { keywords: ['a', 'b'], scopeType: 'city', scopeValue: 'Beijing', pushEnabled: true }
        const subs = this.getSubs().slice();
        
        // Simple duplicate check (not perfect but enough for demo)
        const exists = subs.some(s => 
            JSON.stringify(s.keywords.sort()) === JSON.stringify(subData.keywords.sort()) && 
            s.scopeType === subData.scopeType && 
            s.scopeValue === subData.scopeValue
        );
        
        if (!exists) {
            const now = new Date().toISOString();
            const localId = Date.now();
            const sub = {
                ...subData,
                id: localId,
                createTime: now,
                updateTime: now
            };
            subs.push(sub);
            this.saveSubs(subs);
            if (this.apiBase && this.token) {
                (async () => {
                    try {
                        const url = `${this.apiBase}/api/member/subscriptions`;
                        const resp = await fetch(url, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` },
                            body: JSON.stringify({ keywords: sub.keywords || [], scopeType: sub.scopeType || 'country', scopeValue: sub.scopeValue || '', pushEnabled: sub.pushEnabled !== false })
                        });
                        const json = await resp.json().catch(() => null);
                        if (resp.ok && json && json.code === 1 && json.data) {
                            const cur = this.getSubs().slice();
                            const idx = cur.findIndex(x => x.id === localId);
                            if (idx >= 0) cur[idx] = json.data;
                            this.saveSubs(cur);
                        }
                    } catch (e) {}
                })();
            }
            return true;
        }
        return false;
    },
    removeSub: function(id) {
        let subs = this.getSubs().filter(s => s.id !== id);
        this.saveSubs(subs);
        if (this.apiBase && this.token) {
            (async () => {
                try {
                    const url = `${this.apiBase}/api/member/subscriptions/${encodeURIComponent(String(id))}`;
                    await fetch(url, { method: 'DELETE', headers: { 'Authorization': `Bearer ${this.token}` } });
                } catch (e) {}
            })();
        }
    },
    updateSub: function(id, updates, skipTimeUpdate = false) {
        let subs = this.getSubs().slice();
        const index = subs.findIndex(s => s.id === id);
        if (index !== -1) {
            subs[index] = { 
                ...subs[index], 
                ...updates,
                updateTime: skipTimeUpdate ? subs[index].updateTime : new Date().toISOString()
            };
            this.saveSubs(subs);
            if (this.apiBase && this.token) {
                this.syncSubPatch(id, updates);
            }
            return true;
        }
        return false;
    },
    syncSubPatch: async function(id, updates, retry = 1) {
        if (!this.apiBase || !this.token) return false;
        try {
            const url = `${this.apiBase}/api/member/subscriptions/${encodeURIComponent(String(id))}`;
            const payload = {};
            if (updates.keywords !== undefined) payload.keywords = updates.keywords;
            if (updates.scopeType !== undefined) payload.scopeType = updates.scopeType;
            if (updates.scopeValue !== undefined) payload.scopeValue = updates.scopeValue;
            if (updates.pushEnabled !== undefined) payload.pushEnabled = updates.pushEnabled;
            if (updates.unreadCount !== undefined) payload.unreadCount = updates.unreadCount;
            if (updates.lastCheckTime !== undefined) payload.lastCheckTime = updates.lastCheckTime;
            if (updates.lastReadAt !== undefined) payload.lastReadAt = updates.lastReadAt;
            if (updates.readItemIds !== undefined) payload.readItemIds = updates.readItemIds;
            const resp = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` },
                body: JSON.stringify(payload)
            });
            if (resp.ok) return true;
        } catch (e) {}
        if (retry > 0) {
            await new Promise(r => setTimeout(r, 250));
            return this.syncSubPatch(id, updates, retry - 1);
        }
        return false;
    },
    updateSubCritical: async function(id, updates, skipTimeUpdate = false) {
        const ok = this.updateSub(id, updates, skipTimeUpdate);
        if (!ok) return false;
        await this.syncSubPatch(id, updates, 2);
        return true;
    },
    getSub: function(id) {
        const subs = this.getSubs();
        return subs.find(s => s.id === id);
    }
};

// 导出
window.mockData = mockData;
window.SubManager = SubManager;
