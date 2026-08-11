// ═══════════════════════════════════════════════════════════
//  BioChain — UI Application Layer
//  Tecnocracia Biocêntrica
// ═══════════════════════════════════════════════════════════

'use strict';

// ─── State ────────────────────────────────────────────────
let blockchain;
let selectedBlockIndex = null;
const nodes = [
  { name: 'Guardian-Amazônia-0x1A', stake: 4200, biome: 'Amazônia' },
  { name: 'Guardian-Cerrado-0x2B',  stake: 3100, biome: 'Cerrado' },
  { name: 'Guardian-Mata-Atlantica-0x3C', stake: 2800, biome: 'Mata Atlântica' },
  { name: 'Guardian-Pantanal-0x4D', stake: 3600, biome: 'Pantanal' }
];

const TYPE_ICONS = {
  floresta: '🌳', rio: '🌊', biodiversidade: '🦋',
  carbono: '💨', solo: '🌱', governanca: '🗳️', renda: '💚'
};

const PROPOSALS = [
  {
    id: 'p1', title: 'PSA Universal — Pagamento por Serviços Ambientais',
    desc: 'Tokenizar 50M ha de floresta nativa e distribuir GAIA tokens para guardiões locais.',
    yes: 72, no: 18
  },
  {
    id: 'p2', title: 'RBE — Renda Básica Ecológica',
    desc: 'Financiar renda básica com receita de créditos de carbono tokenizados na BioChain.',
    yes: 85, no: 10
  },
  {
    id: 'p3', title: 'IoT Monitoring Network',
    desc: 'Registrar dados de 10.000 sensores IoT ambientais como transações imutáveis na cadeia.',
    yes: 60, no: 30
  }
];

// ─── Init ─────────────────────────────────────────────────
async function init() {
  blockchain = new BioBlockchain();
  await sleep(100); // wait for genesis
  renderNodes();
  renderGovernance();
  log('BioChain inicializada · Bloco Gênesis criado', 'success');
  log('Tecnocracia Biocêntrica · Prova-de-Ecologia ativa', 'success');
  // Seed some demo transactions
  await seedDemoData();
  renderChain();
  updateStats();
}

async function seedDemoData() {
  // Add demo block
  const txs = [
    new BioTransaction({ type: 'floresta', origin: 'Guardian-Amazônia-0x1A', destination: 'Comunidade-Caiapó-0x2B', amount: 2000, area: 500, co2: 320, metadata: { bioma: 'Amazônia', sensor: 'IoT-042' } }),
    new BioTransaction({ type: 'carbono', origin: 'Guardian-Cerrado-0x2B', destination: 'Mercado-GAIA', amount: 800, area: 200, co2: 95, metadata: { bioma: 'Cerrado' } }),
    new BioTransaction({ type: 'renda', origin: 'Fundo-BioBasico', destination: 'Comunidade-Xingu-0x5E', amount: 1200, area: 0, co2: 0, metadata: {} })
  ];
  txs.forEach(tx => blockchain.addTransaction(tx));

  const modal = document.getElementById('mining-modal');
  modal.classList.remove('hidden');
  await blockchain.mineBlock('Guardian-Amazônia-0x1A', () => {});
  modal.classList.add('hidden');
  log(`Bloco #1 minerado · 3 transações confirmadas`, 'success');
}

// ─── Render Chain ─────────────────────────────────────────
function renderChain() {
  const container = document.getElementById('chain-container');
  container.innerHTML = '';
  const blocks = [...blockchain.chain].reverse(); // newest first

  blocks.forEach((block, i) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'block-wrapper';

    const card = document.createElement('div');
    const isGenesis = block.index === 0;
    card.className = `block-card${isGenesis ? ' genesis' : ''}${block.index === selectedBlockIndex ? ' selected' : ''}`;
    card.id = `block-${block.index}`;
    card.onclick = () => selectBlock(block.index);

    const txChips = block.transactions.map(tx =>
      `<span class="tx-chip">${TYPE_ICONS[tx.type] || '📦'} ${tx.type}</span>`
    ).join('');

    const shortHash = h => h ? `${h.slice(0,8)}...${h.slice(-8)}` : '—';
    const timeStr = new Date(block.timestamp).toLocaleString('pt-BR');

    card.innerHTML = `
      <div class="block-top">
        <div class="block-index ${isGenesis ? 'block-genesis-label' : ''}">
          ${isGenesis ? '🌿' : '#' + block.index}
        </div>
        <div class="block-meta">
          <div class="block-title">${isGenesis ? 'Bloco Gênesis' : `Bloco #${block.index}`}</div>
          <div class="block-time">${timeStr} · Validador: ${block.validator || '—'}</div>
        </div>
        <div class="block-txcount">${block.transactions.length} tx${block.transactions.length !== 1 ? 's' : ''}</div>
      </div>
      <div class="block-hashes">
        <div class="hash-row"><span class="hash-label">Hash</span><span class="hash-val">${shortHash(block.hash)}</span></div>
        <div class="hash-row"><span class="hash-label">Anterior</span><span class="hash-val prev">${shortHash(block.previousHash)}</span></div>
        ${!isGenesis ? `<div class="hash-row"><span class="hash-label">Merkle</span><span class="hash-val">${shortHash(block.merkleRoot)}</span></div>` : ''}
      </div>
      ${txChips ? `<div class="block-txs">${txChips}</div>` : ''}
    `;

    wrapper.appendChild(card);

    // Connector (not after last = genesis)
    if (i < blocks.length - 1) {
      const conn = document.createElement('div');
      conn.className = 'chain-connector';
      wrapper.appendChild(conn);
    }

    container.appendChild(wrapper);
  });
}

// ─── Select & Inspect Block ───────────────────────────────
function selectBlock(index) {
  selectedBlockIndex = index;
  renderChain();
  const block = blockchain.chain[index];
  const content = document.getElementById('inspector-content');
  const isGenesis = index === 0;

  let txHTML = '';
  if (block.transactions.length) {
    txHTML = block.transactions.map(tx => `
      <div class="inspector-tx">
        <div class="inspector-tx-type">${TYPE_ICONS[tx.type] || '📦'} ${tx.type.toUpperCase()} · ${tx.amount} GAIA</div>
        <div class="inspector-tx-detail">
          <b>De:</b> ${tx.origin}<br/>
          <b>Para:</b> ${tx.destination}<br/>
          <b>Área:</b> ${tx.area} ha &nbsp;|&nbsp; <b>CO₂:</b> ${tx.co2} tC<br/>
          <b>ID:</b> <span style="font-family:'JetBrains Mono',monospace;font-size:10px">${tx.id}</span>
        </div>
      </div>`).join('');
  } else {
    txHTML = '<p class="empty-msg">Sem transações neste bloco.</p>';
  }

  content.innerHTML = `
    <div class="inspector-field"><div class="inspector-key">Índice</div><div class="inspector-val">${block.index}</div></div>
    <div class="inspector-field"><div class="inspector-key">Hash</div><div class="inspector-val">${block.hash}</div></div>
    <div class="inspector-field"><div class="inspector-key">Hash Anterior</div><div class="inspector-val">${block.previousHash}</div></div>
    ${!isGenesis ? `<div class="inspector-field"><div class="inspector-key">Merkle Root</div><div class="inspector-val">${block.merkleRoot}</div></div>
    <div class="inspector-field"><div class="inspector-key">Nonce / Dificuldade PoE</div><div class="inspector-val">${block.nonce} / ${block.effectiveDifficulty ? block.effectiveDifficulty() : block.difficulty}</div></div>
    <div class="inspector-field"><div class="inspector-key">Score Ecológico</div><div class="inspector-val">${block.ecologicalScore}</div></div>
    <div class="inspector-field"><div class="inspector-key">Validador</div><div class="inspector-val">${block.validator}</div></div>` : ''}
    <div class="inspector-field"><div class="inspector-key">Transações</div></div>
    ${txHTML}
  `;
}

// ─── Add Transaction ──────────────────────────────────────
function addPendingTransaction() {
  const type = document.getElementById('tx-type').value;
  const origin = document.getElementById('tx-origin').value.trim();
  const destination = document.getElementById('tx-dest').value.trim();
  const amount = parseFloat(document.getElementById('tx-amount').value);
  const area = parseFloat(document.getElementById('tx-area').value) || 0;
  const co2 = parseFloat(document.getElementById('tx-co2').value) || 0;
  const metaRaw = document.getElementById('tx-data').value.trim();

  if (!origin || !destination || !amount) {
    showToast('⚠️ Preencha todos os campos obrigatórios.', 'warn'); return;
  }

  let metadata = {};
  if (metaRaw) {
    try { metadata = JSON.parse(metaRaw); } catch { showToast('⚠️ JSON de metadados inválido.', 'warn'); return; }
  }

  const tx = new BioTransaction({ type, origin, destination, amount, area, co2, metadata });
  blockchain.addTransaction(tx);
  renderMempool();
  log(`Tx adicionada: ${TYPE_ICONS[type]} ${type} · ${amount} GAIA de ${origin.split('-').slice(0,2).join('-')}`, 'success');
  showToast(`✅ Transação adicionada à mempool!`, 'success');
}

function renderMempool() {
  const list = document.getElementById('mempool-list');
  const badge = document.getElementById('mempool-badge');
  const mineBtn = document.getElementById('btn-mine');
  const txs = blockchain.pendingTransactions;
  badge.textContent = txs.length;
  mineBtn.disabled = txs.length === 0;

  if (!txs.length) {
    list.innerHTML = '<p class="empty-msg">Nenhuma transação pendente.</p>';
    return;
  }

  list.innerHTML = txs.map(tx => `
    <div class="mempool-item">
      <div class="mempool-item-icon">${TYPE_ICONS[tx.type] || '📦'}</div>
      <div class="mempool-item-body">
        <div class="mempool-item-type">${tx.type}</div>
        <div class="mempool-item-route">${truncate(tx.origin, 20)} → ${truncate(tx.destination, 20)}</div>
        <div class="mempool-item-amount">${tx.amount} GAIA · ${tx.co2} tCO₂</div>
      </div>
    </div>
  `).join('');
}

// ─── Mine Block ───────────────────────────────────────────
async function mineBlock() {
  if (!blockchain.pendingTransactions.length) return;

  const modal = document.getElementById('mining-modal');
  const status = document.getElementById('mining-status');
  const progress = document.getElementById('mining-progress');
  const hashEl = document.getElementById('mining-hash');
  modal.classList.remove('hidden');

  let pct = 0;
  const validator = nodes[Math.floor(Math.random() * nodes.length)].name;
  status.textContent = `Validador: ${validator}`;

  const progressInterval = setInterval(() => {
    pct = Math.min(pct + Math.random() * 8, 90);
    progress.style.width = pct + '%';
  }, 150);

  try {
    const block = await blockchain.mineBlock(validator, (nonce, hash) => {
      hashEl.textContent = `Hash: 0x${hash.slice(0, 20)}...`;
      status.textContent = `Nonce: ${nonce.toLocaleString()} · PoE ativo`;
    });

    clearInterval(progressInterval);
    progress.style.width = '100%';
    hashEl.textContent = `Hash: 0x${block.hash.slice(0, 20)}...`;

    await sleep(600);
    modal.classList.add('hidden');
    progress.style.width = '0%';

    renderChain();
    renderMempool();
    updateStats();
    selectBlock(block.index);

    log(`⛏️ Bloco #${block.index} minerado por ${validator.split('-').slice(0, 2).join('-')} · Nonce: ${block.nonce}`, 'success');
    showToast(`⛏️ Bloco #${block.index} minerado com sucesso!`, 'success');
  } catch (e) {
    clearInterval(progressInterval);
    modal.classList.add('hidden');
    showToast('❌ Erro ao minerar bloco: ' + e.message, 'error');
  }
}

// ─── Validate Chain ───────────────────────────────────────
function validateChain() {
  const result = blockchain.validateChain();
  const statusEl = document.getElementById('chain-status');
  if (result.valid) {
    statusEl.innerHTML = '<span class="dot green"></span> Chain Válida';
    showToast('✅ Cadeia válida! Todos os blocos íntegros.', 'success');
    log('Validação: cadeia íntegra · Todos os hashes conferem', 'success');
  } else {
    statusEl.innerHTML = '<span class="dot red"></span> Chain Comprometida';
    showToast(`❌ Cadeia inválida no bloco #${result.blockIndex}: ${result.reason}`, 'error');
    log(`⚠️ Cadeia comprometida no bloco #${result.blockIndex}: ${result.reason}`, 'error');
    document.getElementById(`block-${result.blockIndex}`)?.classList.add('tampered');
  }
}

// ─── Simulate Tamper ──────────────────────────────────────
function simulateTamper() {
  if (blockchain.chain.length < 2) {
    showToast('⚠️ Adicione mais blocos antes de simular um ataque.', 'warn'); return;
  }
  const targetIdx = Math.floor(Math.random() * (blockchain.chain.length - 1)) + 1;
  const block = blockchain.chain[targetIdx];
  if (block.transactions.length) {
    block.transactions[0].amount = 999999999;
  }
  block.hash = 'TAMPERED_' + block.hash.slice(9);
  renderChain();
  const statusEl = document.getElementById('chain-status');
  statusEl.innerHTML = '<span class="dot red"></span> Chain Comprometida';
  document.getElementById(`block-${targetIdx}`)?.classList.add('tampered');
  showToast(`⚠️ Ataque simulado no bloco #${targetIdx} — Execute Validar Cadeia para detectar.`, 'warn');
  log(`🔴 Ataque simulado no bloco #${targetIdx} — hash adulterado`, 'warn');
}

// ─── Export ───────────────────────────────────────────────
function exportChain() {
  const json = blockchain.toJSON();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'biochain_export.json';
  a.click(); URL.revokeObjectURL(url);
  log('Blockchain exportada como JSON', 'success');
  showToast('📥 Blockchain exportada!', 'success');
}

// ─── Stats & Metrics ──────────────────────────────────────
function updateStats() {
  document.getElementById('val-blocks').textContent = blockchain.chain.length;
  document.getElementById('val-tokens').textContent = blockchain.getTotalTokens().toLocaleString('pt-BR');
  document.getElementById('val-co2').textContent = blockchain.getTotalCO2().toFixed(1) + ' tC';

  const m = blockchain.getMetricsByType();
  document.getElementById('m-floresta').textContent = m.floresta.toLocaleString();
  document.getElementById('m-rio').textContent = m.rio.toLocaleString();
  document.getElementById('m-bio').textContent = m.biodiversidade.toLocaleString();
  document.getElementById('m-co2').textContent = m.carbono.toLocaleString();
  document.getElementById('m-rbe').textContent = m.renda.toLocaleString();
  document.getElementById('m-gov').textContent = m.governanca.toLocaleString();

  const totalTokens = blockchain.getTotalTokens();
  const ise = totalTokens ? Math.min(100, Math.round((blockchain.getTotalCO2() / totalTokens) * 500 + blockchain.chain.length * 5)) : 0;
  document.getElementById('eco-bar').style.width = ise + '%';
  document.getElementById('eco-pct').textContent = ise + '%';
}

// ─── Nodes ────────────────────────────────────────────────
function renderNodes() {
  const list = document.getElementById('nodes-list');
  list.innerHTML = nodes.map(n => `
    <div class="node-item">
      <div class="node-status"></div>
      <div class="node-name">${n.name}</div>
      <div class="node-stake">${n.stake.toLocaleString()} GAIA</div>
    </div>`).join('');
}

function addRandomNode() {
  const biomes = ['Caatinga', 'Pampa', 'Restinga', 'Manguezal'];
  const biome = biomes[Math.floor(Math.random() * biomes.length)];
  const id = Math.random().toString(16).slice(2, 6).toUpperCase();
  const stake = Math.floor(Math.random() * 3000) + 500;
  nodes.push({ name: `Guardian-${biome}-0x${id}`, stake, biome });
  renderNodes();
  log(`Novo nó adicionado: Guardian-${biome}-0x${id}`, 'success');
  showToast(`🌐 Nó Guardian-${biome} conectado!`, 'success');
}

// ─── Governance ───────────────────────────────────────────
function renderGovernance() {
  const container = document.getElementById('gov-proposals');
  container.innerHTML = PROPOSALS.map(p => {
    const total = p.yes + p.no;
    const yesPct = Math.round((p.yes / total) * 100);
    const noPct = 100 - yesPct;
    return `
    <div class="gov-proposal" id="prop-${p.id}">
      <div class="gov-proposal-title">${p.title}</div>
      <div class="gov-proposal-desc">${p.desc}</div>
      <div class="gov-votes">
        <div class="gov-vote-bar"><div class="gov-vote-fill yes" style="width:${yesPct}%"></div></div>
        <div class="gov-vote-bar"><div class="gov-vote-fill no" style="width:${noPct}%"></div></div>
      </div>
      <div class="gov-vote-labels"><span>✅ ${yesPct}% (${p.yes})</span><span>❌ ${noPct}% (${p.no})</span></div>
      <div class="gov-vote-btns">
        <button class="gov-vote-btn yes" onclick="vote('${p.id}', true)">Sim</button>
        <button class="gov-vote-btn no" onclick="vote('${p.id}', false)">Não</button>
      </div>
    </div>`;
  }).join('');
}

function vote(id, yes) {
  const p = PROPOSALS.find(p => p.id === id);
  if (!p) return;
  if (yes) p.yes++; else p.no++;
  renderGovernance();

  // Create governance tx
  const tx = new BioTransaction({
    type: 'governanca', origin: nodes[0].name,
    destination: 'DAO-BioChain', amount: 1, metadata: { proposal: id, vote: yes ? 'sim' : 'nao' }
  });
  blockchain.addTransaction(tx);
  renderMempool();
  log(`🗳️ Voto registrado na proposta "${p.title.slice(0, 30)}..."`, 'success');
  showToast(`🗳️ Voto adicionado à mempool!`, 'success');
}

// ─── Log & Toast ──────────────────────────────────────────
function log(msg, type = 'info') {
  const logEl = document.getElementById('event-log');
  const now = new Date().toLocaleTimeString('pt-BR');
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.innerHTML = `<span class="log-time">${now}</span><span class="log-msg ${type}">${msg}</span>`;
  logEl.prepend(entry);
  // Keep max 30 entries
  while (logEl.children.length > 30) logEl.removeChild(logEl.lastChild);
}

function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ─── Helpers ──────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function truncate(str, n) { return str.length > n ? str.slice(0, n) + '…' : str; }

// ─── Bootstrap ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
