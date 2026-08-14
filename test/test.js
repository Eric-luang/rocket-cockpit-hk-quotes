// rocket-cockpit-hk-quotes tests
const { HKQuotesClient } = require('../src/index.js');

async function test(name, fn) {
  try { await fn(); console.log(`✅ ${name}`); }
  catch (e) { console.error(`❌ ${name}: ${e.message}`); process.exit(1); }
}

async function run() {
  await test('code to tag conversion (HK)', async () => {
    const c = new HKQuotesClient();
    if (c._codeToTag('00853') !== 'hk00853') throw new Error('HK tag wrong');
    if (c._codeToTag('01810') !== 'hk01810') throw new Error('HK tag wrong');
  });

  await test('code to tag conversion (A-share)', async () => {
    const c = new HKQuotesClient();
    if (c._codeToTag('600519') !== 'sh600519') throw new Error('SH tag wrong');
    if (c._codeToTag('000001') !== 'sz000001') throw new Error('SZ tag wrong');
    if (c._codeToTag('300750') !== 'sz300750') throw new Error('SZ tag wrong');
  });

  await test('parse Tencent response (GBK)', async () => {
    const c = new HKQuotesClient();
    // Real Tencent response format. parts[32]=change, parts[33]=change_pct, parts[34]=high, parts[35]=low
    const mock = 'v_hk00853="100~微创医疗~00853~6.950~7.210~7.110~17818515.0~0~0~6.950~0~0~0~0~0~0~0~0~0~6.950~0~0~0~0~0~0~0~0~0~0~0~0~2026/08/14~0~-0.260~-3.60~7.250~6.940~6.950~0~0~0~0~0~1234567.89~0~0~0~0~0~0";';
    const result = c._parseResponse(mock, ['00853']);
    if (!result['00853']) throw new Error('parse failed');
    if (result['00853'].name !== '微创医疗') throw new Error('name decode failed');
    if (Math.abs(result['00853'].price - 6.95) > 0.001) throw new Error('price wrong');
    if (Math.abs(result['00853'].change_pct - (-3.60)) > 0.01) throw new Error('pct wrong, got ' + result['00853'].change_pct);
    if (result['00853'].currency !== 'HKD') throw new Error('currency wrong');
  });

  await test('parse A-share response', async () => {
    const c = new HKQuotesClient();
    const mock = 'v_sh600519="1~贵州茅台~600519~1700.50~1690.00~1700.00~50000~50000~0~1700.50~0~0~0~0~0~0~0~0~0~1700.50~0~0~0~0~0~0~0~0~0~0~0~0~2026/08/14~10.50~0.62~1710.00~1695.00~1700.50~50000~50000~0~0~0~123.45~0~0~0~0~0~0";';
    const result = c._parseResponse(mock, ['600519']);
    if (!result['600519']) throw new Error('parse failed');
    if (result['600519'].name !== '贵州茅台') throw new Error('name decode failed');
    if (result['600519'].currency !== 'CNY') throw new Error('should be CNY');
  });

  await test('mixed HK + A-share', async () => {
    const c = new HKQuotesClient();
    const mock = 'v_hk00853="100~微创医疗~00853~6.950~7.210~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~2026/08/14~-0.26~-3.6~7.25~6.94~6.95~0~0~0~0~0~1234.56";v_sh600519="1~贵州茅台~600519~1700.50~1690.00~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~0~2026/08/14~10.50~0.62~0~0~0~0~0~0~0~0~0";';
    const result = c._parseResponse(mock, ['00853', '600519']);
    if (Object.keys(result).length !== 2) throw new Error('should have 2 results');
    if (result['00853'].currency !== 'HKD') throw new Error('00853 should be HKD');
    if (result['600519'].currency !== 'CNY') throw new Error('600519 should be CNY');
  });

  await test('fetch with empty codes', async () => {
    const c = new HKQuotesClient();
    const r = await c.fetch([]);
    if (Object.keys(r).length !== 0) throw new Error('empty should return {}');
  });

  console.log('\n🎉 All tests passed!');
}

run().catch(e => { console.error(e); process.exit(1); });
