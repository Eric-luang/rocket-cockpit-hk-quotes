/**
 * rocket-cockpit-hk-quotes v0.1.0
 * Real-time HK stock quotes (Tencent qt.gtimg.cn) + A-shares (Tencent) + Eastmoney
 * Handles GBK encoding for Chinese stock names. No CORS proxy needed for Tencent.
 *
 * Usage:
 *   const quotes = new HKQuotesClient();
 *   const data = await quotes.fetch(['00853', '01810']);  // 港股
 *   console.log(data['00853'].name);  // "微创医疗"
 *   console.log(data['00853'].price);  // 6.95
 */

class HKQuotesClient {
  constructor(options = {}) {
    this.timeoutMs = options.timeoutMs || 8000;
    this.userAgent = options.userAgent || 'Mozilla/5.0 (compatible; RocketCockpit/0.1)';
  }

  /**
   * Fetch quotes for multiple codes (mixed HK/A-share)
   * @param {Array<string>} codes - 5-digit HK codes or 6-digit A-share codes
   * @returns {Promise<Object>} - { code: { name, price, change_pct, open, high, low, ... } }
   */
  async fetch(codes) {
    if (!codes || codes.length === 0) return {};
    const tags = codes.map(c => this._codeToTag(c)).filter(t => t);
    if (tags.length === 0) return {};
    const url = `https://qt.gtimg.cn/q=${tags.join(',')}`;
    try {
      const res = await this._fetchWithTimeout(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = await res.arrayBuffer();
      // GBK decode for Chinese stock names
      const txt = new TextDecoder('gbk', { fatal: false }).decode(new Uint8Array(buf));
      return this._parseResponse(txt, codes);
    } catch (e) {
      console.warn('HKQuotesClient.fetch error:', e.message);
      return {};
    }
  }

  _codeToTag(code) {
    if (typeof code !== 'string') code = String(code);
    code = code.trim();
    if (code.length === 5) return 'hk' + code;
    if (code.length === 6) {
      if (code.startsWith('6')) return 'sh' + code;
      if (code.startsWith('0') || code.startsWith('3')) return 'sz' + code;
      if (code.startsWith('5') || code.startsWith('1')) return 'sh' + code;  // ETF/基金
      return 'sz' + code;
    }
    return null;
  }

  _parseResponse(text, codes) {
    const result = {};
    // Format: v_hk00853="100~微创医疗~00853~6.950~...";v_hk01810="...";
    const lines = text.split(';');
    for (const line of lines) {
      const m = line.match(/="([^"]+)"/);
      if (!m) continue;
      const parts = m[1].split('~');
      if (parts.length < 10) continue;
      // Find code in tags
      const code = this._extractCode(line);
      if (!code) continue;
      result[code] = {
        code,
        name: parts[1],
        price: parseFloat(parts[3]) || 0,
        prev_close: parseFloat(parts[4]) || 0,
        open: parseFloat(parts[5]) || 0,
        volume: parseFloat(parts[6]) || 0,
        amount: parseFloat(parts[37]) || 0,  // 成交额
        change: parseFloat(parts[34]) || 0,        // 涨跌额
        change_pct: parseFloat(parts[35]) || 0,    // 涨跌幅 %
        high: parseFloat(parts[36]) || 0,          // 最高
        low: parseFloat(parts[37]) || 0,           // 最低
        timestamp: parts[30] || new Date().toISOString(),
        market: this._marketFromCode(code),
        currency: code.length === 5 ? 'HKD' : 'CNY',
      };
    }
    return result;
  }

  _extractCode(line) {
    const m = line.match(/v_(hk|sh|sz|us)(\w+)="/);
    if (!m) return null;
    const code = m[2];
    if (m[1] === 'us') return code;
    return code;
  }

  _marketFromCode(code) {
    if (code.length === 5) return 'HK';
    if (code.startsWith('6') || code.startsWith('5') || code.startsWith('1')) return 'SH';
    if (code.startsWith('0') || code.startsWith('3')) return 'SZ';
    return 'CN';
  }

  async _fetchWithTimeout(url, opts = {}) {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      return await fetch(url, {
        ...opts,
        headers: { 'User-Agent': this.userAgent, ...(opts.headers || {}) },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(tid);
    }
  }
}

module.exports = { HKQuotesClient };
