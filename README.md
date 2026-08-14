# 📈 rocket-cockpit-hk-quotes

**Real-time HK stock quotes wrapper (Tencent qt.gtimg.cn). GBK encoding handled. Zero CORS proxy needed.**

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D16-green.svg)](https://nodejs.org)

## ✨ Features

- 🇭🇰 **HK stocks (5-digit codes)** — `00853`, `01810`, `00981`, `00100`, `09880` etc.
- 🇨🇳 **A-shares (6-digit codes)** — `600519` (沪), `000001` (深), `300750` (创业板)
- 🌐 **GBK decoding** for Chinese stock names (Tencent uses GBK)
- ⚡ **Single batch call** — fetch 10 stocks in 1 request
- 🔌 **No CORS proxy needed** — Tencent endpoint supports CORS
- 🪶 **Zero dependencies**

## 📦 Installation

```bash
npm install rocket-cockpit-hk-quotes
```

## 🚀 Quick Start

```js
const { HKQuotesClient } = require('rocket-cockpit-hk-quotes');

const client = new HKQuotesClient();

// Fetch HK stocks
const hk = await client.fetch(['00853', '01810', '00981']);
console.log(hk['00853']);
// {
//   code: '00853',
//   name: '微创医疗',
//   price: 6.95,
//   change: -0.26,
//   change_pct: -3.60,
//   high: 7.25,
//   low: 6.94,
//   volume: 17818515,
//   amount: 123456789.0,
//   timestamp: '2026/08/14 16:08:39',
//   market: 'HK',
//   currency: 'HKD'
// }

// Fetch A-shares
const ashares = await client.fetch(['600519', '000001']);
console.log(ashares['600519'].name);  // '贵州茅台'
console.log(ashares['600519'].currency);  // 'CNY'

// Mixed
const mixed = await client.fetch(['00853', '600519', '000001']);
```

## 📊 Data Fields

| Field | Type | Example | Description |
|-------|------|---------|-------------|
| `code` | string | `'00853'` | Stock code |
| `name` | string | `'微创医疗'` | Chinese name (GBK decoded) |
| `price` | float | `6.95` | Current price |
| `prev_close` | float | `7.21` | Previous close |
| `open` | float | `7.11` | Today's open |
| `high` | float | `7.25` | Today's high |
| `low` | float | `6.94` | Today's low |
| `change` | float | `-0.26` | Change amount |
| `change_pct` | float | `-3.60` | Change percent |
| `volume` | float | `17818515` | Volume (shares) |
| `amount` | float | `123456789` | Turnover (currency) |
| `timestamp` | string | `'2026/08/14 16:08:39'` | Quote timestamp |
| `market` | string | `'HK'` / `'SH'` / `'SZ'` | Market code |
| `currency` | string | `'HKD'` / `'CNY'` | Currency |

## 🧪 Testing

```bash
npm test
```

## 🌐 Endpoint

- **Production**: `https://qt.gtimg.cn/q={codes}` (Tencent Finance, CORS-enabled)
- **Backup**: `https://web.ifzq.gtimg.cn/...` (iOS Safari compatible)

## 🤝 Credits

- Inspired by [RocketCockpit](https://github.com/rocket-cockpit/stock-assistant)
- Data source: [Tencent Finance](https://gu.qq.com/) (public real-time quotes)

## 📄 License

Apache 2.0
