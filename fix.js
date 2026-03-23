const fs = require('fs');
const files = ['js/app.js', 'www/js/app.js'];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let s = fs.readFileSync(f, 'utf8');

  // Fix 1
  s = s.replace(/parsePrice\(priceStr\) \{[\s\S]*?\},/, `parsePrice(priceStr) {
        if (!priceStr || priceStr === '金额见正文') return 0;
        try {
            const str = String(priceStr).replace(/,/g, '');
            const m = str.match(/(\\d+(\\.\\d+)?)/);
            if (!m) return 0;
            const num = parseFloat(m[1]);
            if (isNaN(num)) return 0;
            if (str.includes('亿')) return num * 100000000;
            if (str.includes('万')) return num * 10000;
            return num;
        } catch (e) {
            return 0;
        }
    },`);

  // Fix 2
  s = s.replace(/isUndisclosedPrice\(priceStr\) \{[\s\S]*?\},/, `isUndisclosedPrice(priceStr) {
        const raw = String(priceStr || '').trim();
        if (!raw || raw === '金额见正文' || raw === 'null' || raw === 'undefined') return true;
        const normalized = raw.replace(/\\s+/g, '').replace(/,/g, '');
        if (normalized === '--' || normalized === '-') return true;
        if (/^[¥￥]?0+(\\.0+)?(元|万元|万|亿)?$/.test(normalized)) return true;
        if (normalized.includes('未公示') || normalized.includes('未知')) return true;
        return false;
    },`);

  fs.writeFileSync(f, s);
  console.log('patched', f);
});
