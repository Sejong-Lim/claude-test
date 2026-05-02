/* ── Candlestick Chart ── */
function makeCandleData(days, startPrice, drift) {
  const data = [];
  const now = new Date('2024-10-26');
  let price = startPrice;

  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    if (d.getDay() === 0 || d.getDay() === 6) continue;

    const change = (Math.random() - 0.5 + drift) * 4.5;
    const open   = price;
    const close  = Math.max(open + change, 1);
    const high   = Math.max(open, close) + Math.random() * 2.5;
    const low    = Math.min(open, close) - Math.random() * 2;

    data.push({
      time:  d.toISOString().slice(0, 10),
      open:  +open.toFixed(2),
      high:  +high.toFixed(2),
      low:   +low.toFixed(2),
      close: +close.toFixed(2),
    });
    price = close;
  }
  return data;
}

const container = document.getElementById('chartContainer');

const chart = LightweightCharts.createChart(container, {
  layout: {
    background: { color: '#0d1526' },
    textColor: '#4a5568',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
  },
  grid: {
    vertLines: { color: 'rgba(148, 163, 184, 0.05)' },
    horzLines: { color: 'rgba(148, 163, 184, 0.05)' },
  },
  crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
  rightPriceScale: {
    borderColor: 'rgba(148, 163, 184, 0.08)',
    scaleMargins: { top: 0.08, bottom: 0.08 },
  },
  timeScale: {
    borderColor: 'rgba(148, 163, 184, 0.08)',
    timeVisible: true,
    fixLeftEdge: true,
    fixRightEdge: true,
  },
  handleScroll: true,
  handleScale: true,
});

const candleSeries = chart.addCandlestickSeries({
  upColor:       '#10b981',
  downColor:     '#f43f5e',
  borderVisible: false,
  wickUpColor:   '#10b981',
  wickDownColor: '#f43f5e',
});

const maLine = chart.addLineSeries({
  color: 'rgba(99, 102, 241, 0.75)',
  lineWidth: 1.5,
  priceLineVisible: false,
  lastValueVisible: false,
  crosshairMarkerVisible: false,
});

// 20-day SMA helper
function computeSMA(data, window) {
  return data.map((d, i) => {
    if (i < window - 1) return null;
    const slice = data.slice(i - window + 1, i + 1);
    const avg = slice.reduce((s, c) => s + c.close, 0) / window;
    return { time: d.time, value: +avg.toFixed(2) };
  }).filter(Boolean);
}

let allData = makeCandleData(120, 168, 0.04);

function loadChart(days) {
  const slice = allData.slice(-days);
  candleSeries.setData(slice);
  maLine.setData(computeSMA(allData, 20).filter(d =>
    slice.some(s => s.time === d.time)
  ));
  chart.timeScale().fitContent();
}

const PERIOD_DAYS = { '1D': 1, '1M': 22, '3M': 66, '6M': 132, '1Y': 252 };
loadChart(22);

// Resize
const ro = new ResizeObserver(() => {
  chart.applyOptions({
    width: container.clientWidth,
    height: container.clientHeight,
  });
});
ro.observe(container);

// Period buttons
document.querySelectorAll('.period-btn[data-p]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.period-btn[data-p]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const days = PERIOD_DAYS[btn.dataset.p] || 22;
    if (days === 1) {
      // simulate intraday ticks
      const intraday = Array.from({ length: 78 }, (_, i) => {
        const h = Math.floor(i / 60 + 9);
        const m = (i % 60 + 30) % 60;
        const timeStr = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
        // lightweight-charts expects UNIX timestamps for intraday
        // for simplicity, just show last 22 days data
        return null;
      }).filter(Boolean);
      loadChart(22);
    } else {
      loadChart(days);
    }
  });
});

/* ── Nav link active state ── */
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  });
});

/* ── AI Chat ── */
const aiMessages = document.getElementById('aiMessages');
const aiInput    = document.getElementById('aiInput');
const sendBtn    = document.getElementById('sendBtn');

const BOT_REPLIES = [
  '해당 종목을 분석 중입니다... (실시간 API 연동 후 상세 데이터를 제공할 예정입니다)',
  '기술적 분석상 현재 RSI 62, MACD 상향 크로스 신호가 확인됩니다.',
  '시장 전반적으로 긍정적인 흐름이지만, 단기 변동성에 주의가 필요합니다.',
  '포트폴리오 리밸런싱을 고려하신다면 섹터 분산을 권장드립니다.',
  '해당 종목의 52주 고가 대비 현재 -8.3% 구간에 위치해 있습니다.',
];

function appendMsg(text, isUser) {
  const wrap = document.createElement('div');
  wrap.className = `ai-msg ${isUser ? 'user-msg' : 'bot-msg'}`;

  if (isUser) {
    wrap.innerHTML = `
      <div class="bubble user-bubble">${escHtml(text)}</div>
      <div class="avatar user-avatar">나</div>
    `;
  } else {
    wrap.innerHTML = `
      <div class="avatar bot-avatar">AI</div>
      <div class="bubble">${escHtml(text)}</div>
    `;
  }

  aiMessages.appendChild(wrap);
  aiMessages.scrollTop = aiMessages.scrollHeight;
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function sendMessage() {
  const text = aiInput.value.trim();
  if (!text) return;
  appendMsg(text, true);
  aiInput.value = '';
  aiInput.style.height = 'auto';

  // Typing indicator
  const typing = document.createElement('div');
  typing.className = 'ai-msg bot-msg';
  typing.id = 'typing';
  typing.innerHTML = `
    <div class="avatar bot-avatar">AI</div>
    <div class="bubble" style="color:var(--muted)">분석 중...</div>
  `;
  aiMessages.appendChild(typing);
  aiMessages.scrollTop = aiMessages.scrollHeight;

  setTimeout(() => {
    typing.remove();
    const reply = BOT_REPLIES[Math.floor(Math.random() * BOT_REPLIES.length)];
    appendMsg(reply, false);
  }, 900 + Math.random() * 600);
}

sendBtn.addEventListener('click', sendMessage);
aiInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Auto-grow textarea
aiInput.addEventListener('input', () => {
  aiInput.style.height = 'auto';
  aiInput.style.height = Math.min(aiInput.scrollHeight, 80) + 'px';
});

/* ── Watchlist click → update ticker ── */
const watchItems = document.querySelectorAll('.watch-item');
watchItems.forEach(item => {
  item.addEventListener('click', () => {
    watchItems.forEach(w => w.classList.remove('active-watch'));
    item.classList.add('active-watch');

    const ticker = item.querySelector('.watch-ticker').textContent;
    const price  = item.querySelector('.watch-price').textContent;
    const chg    = item.querySelector('.watch-chg').textContent;
    const isUp   = item.querySelector('.watch-chg').classList.contains('up');

    document.querySelector('.ticker-symbol').textContent = ticker;
    document.getElementById('tickerPrice').textContent = price;
    const changeEl = document.getElementById('tickerChange');
    changeEl.textContent = chg;
    changeEl.className = 'ticker-change ' + (isUp ? 'up' : 'down');

    // Reload chart with fresh mock data
    allData = makeCandleData(120, parseFloat(price.replace(/[$,]/g, '')) * 0.93, isUp ? 0.05 : -0.02);
    loadChart(22);
  });
});
