// ═══════════════════════════════════════════════════════════
//  BioChain — UI Application Layer (v2.0 Soberana)
//  Tecnocracia Biocêntrica · Método Brasiliano
// ═══════════════════════════════════════════════════════════

'use strict';

// ─── State ────────────────────────────────────────────────
let blockchain;
let selectedBlockIndex = null;

const nodes = [
  { name: 'Guardian-Amazônia-0x1A', stake: 5400, biome: 'Amazônia' },
  { name: 'Guardian-Cerrado-0x2B',  stake: 4100, biome: 'Cerrado' },
  { name: 'Guardian-Mata-Atlantica-0x3C', stake: 3800, biome: 'Mata Atlântica' },
  { name: 'Guardian-Pantanal-0x4D', stake: 4600, biome: 'Pantanal' },
  { name: 'Guardian-Caatinga-0x5E', stake: 3200, biome: 'Caatinga' },
  { name: 'Guardian-Pampa-0x6F', stake: 2900, biome: 'Pampa' },
  { name: 'Guardian-Costeiro-0x70', stake: 3500, biome: 'Zona Costeira e Marinha' }
];

const TYPE_ICONS = {
  floresta: '🌳', rio: '🌊', biodiversidade: '🦋',
  carbono: '💨', solo: '🌱', governanca: '🗳️', renda: '💚', queima: '🔥'
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
    id: 'p3', title: 'Oráculos de IA Soberana (INPE/MapBiomas)',
    desc: 'Hospedar modelos de visão computacional ambiental em infraestrutura pública do SERPRO/RNP.',
    yes: 94, no: 4
  }
];

const BIOMES_DATA = [
  {
    id: 'amz', name: 'Amazônia', icon: '🌳', stress: '1.20x',
    area: '4,1M km²', canopy: 86.4, moisture: 78, alert: '0.00%',
    oracle: 'INPE-DETER-AMZ-01', bayes: '99.4%'
  },
  {
    id: 'cer', name: 'Cerrado', icon: '🌱', stress: '1.25x',
    area: '2,0M km²', canopy: 51.2, moisture: 44, alert: '0.01%',
    oracle: 'INPE-DETER-CR-04', bayes: '98.8%'
  },
  {
    id: 'mat', name: 'Mata Atlântica', icon: '🌿', stress: '1.40x',
    area: '1,3M km²', canopy: 28.5, moisture: 62, alert: '0.00%',
    oracle: 'INPE-SIRENE-MA-02', bayes: '99.1%'
  },
  {
    id: 'pan', name: 'Pantanal', icon: '🐾', stress: '1.35x',
    area: '150k km²', canopy: 72.1, moisture: 82, alert: '0.00%',
    oracle: 'ANA-TELEMETRIA-PAN-09', bayes: '98.6%'
  },
  {
    id: 'caa', name: 'Caatinga', icon: '🌵', stress: '1.30x',
    area: '844k km²', canopy: 42.0, moisture: 28, alert: '0.00%',
    oracle: 'INPE-SEMIARIDO-03', bayes: '97.9%'
  },
  {
    id: 'pam', name: 'Pampa', icon: '🌾', stress: '1.15x',
    area: '176k km²', canopy: 74.0, moisture: 65, alert: '0.00%',
    oracle: 'EMBRAPA-PAMPA-01', bayes: '98.2%'
  },
  {
    id: 'cos', name: 'Zona Costeira e Marinha', icon: '🌊', stress: '1.25x',
    area: '8,5k km costa', canopy: 91.0, moisture: 95, alert: '0.00%',
    oracle: 'MARINHA-ORACULO-07', bayes: '99.5%'
  }
];

const DOCS_DATA = {
  '01': {
    title: '01. Diretriz Geral de Política Pública Decenal (2026–2030)',
    content: `
      <h2>Sumário da Proposta Mestra</h2>
      <p>A <b>BioChain</b> é posicionada como política pública de Estado para o Brasil do século XXI, respondendo simultaneamente à <b>Crise Climática</b>, à <b>Ascensão da Inteligência Artificial</b> e ao <b>Narcisídio Social</b> (a destruição das bases vitais da sociedade em troca de rentismo imediato).</p>
      <h3>Eixos Estruturantes:</h3>
      <ul>
        <li><b>O Método Brasiliano:</b> O Brasil não importa modelos — sintetiza soluções universais a partir de sua megabiodiversidade e sociodiversidade.</li>
        <li><b>Proof-of-Ecology (PoE):</b> O poder de validação decorre da preservação física de biomas, e não da queima de energia ou concentração de capital.</li>
        <li><b>Renda Básica Ecológica:</b> 60% da liquidação primária de ativos GAIA é destinada a famílias guardiãs (indígenas, quilombolas, ribeirinhos).</li>
        <li><b>Meta 2030:</b> 100M de hectares registrados, 500.000 famílias atendidas e redução de 80% no desmatamento líquido.</li>
      </ul>
      <p><a href="https://github.com/PSousa22/biochain/blob/main/politica-publica/01_politica_publica_diretriz.md" target="_blank" class="btn btn-primary btn-sm">Abrir Documento Integral no GitHub</a></p>
    `
  },
  '02': {
    title: '02. One-Pager / Policy Briefing Executivo',
    content: `
      <h2>Policy Briefing para Decisores de Estado</h2>
      <p>Síntese executiva desenhada para leitura em 3 minutos por ministros, presidentes de casas legislativas e bancos multilaterais.</p>
      <h3>Pontos-Chave:</h3>
      <ul>
        <li><b>O Problema:</b> Com a Amazônia e o Cerrado próximos do ponto de não-retorno, mecanismos punitivos tradicionais são insuficientes sem incentivos econômicos de custódia.</li>
        <li><b>Impacto Fiscal Neutro:</b> Financiado pela internalização do mercado de carbono e fundos climáticos multilaterais, sem expansão de dívida pública.</li>
        <li><b>Ação para os Próximos 60 Dias:</b> Decreto Presidencial criando o Grupo de Trabalho Interministerial (GTI BioChain) e autorização do piloto em 3 biomas.</li>
      </ul>
      <p><a href="https://github.com/PSousa22/biochain/blob/main/politica-publica/02_one_pager_executivo.md" target="_blank" class="btn btn-primary btn-sm">Abrir Documento Integral no GitHub</a></p>
    `
  },
  '03': {
    title: '03. Pitch Deck Institucional (13 Slides)',
    content: `
      <h2>Roteiro de Apresentação Executiva</h2>
      <p>Estrutura completa em 13 lâminas com notas para o orador para apresentações em plenário e reuniões ministeriais.</p>
      <h3>Lâminas de Destaque:</h3>
      <ol>
        <li>Capa & Tese de Impacto: A maior biodiversidade como motor de riqueza soberana.</li>
        <li>O Narcisídio Social: A floresta valorada a zero no PIB e os custos socializados.</li>
        <li>A Encruzilhada da IA: Anti-extrativismo de dados genéticos por Big Techs.</li>
        <li>O Método Brasiliano: Síntese de DLT, dados do INPE e saberes ancestrais.</li>
        <li>Proof-of-Ecology e o Ativo GAIA: Lastro de 1 tCO₂e com queima mandatória.</li>
        <li>Renda Básica Ecológica: Repasse direto via Drex sem intermediários.</li>
        <li>Roadmap 2026–2030: Do piloto federativo à liderança na OTCA.</li>
      </ol>
      <p><a href="https://github.com/PSousa22/biochain/blob/main/politica-publica/03_pitch_deck_institucional.md" target="_blank" class="btn btn-primary btn-sm">Abrir Documento Integral no GitHub</a></p>
    `
  },
  '04': {
    title: '04. Anteprojeto de Lei (Minuta Formal)',
    content: `
      <h2>Minuta Legislativa (LC nº 95/1998)</h2>
      <p><b>Ementa:</b> Institui a Infraestrutura Pública Digital de Razão Distribuída para Custódia e Governança Ambiental (BioChain), estabelece o mecanismo Proof-of-Ecology, cria o Ativo GAIA e a Renda Básica Ecológica (RBE), dispõe sobre a soberania de inteligência artificial ecológica, e altera a Lei nº 14.119/2021.</p>
      <h3>Artigos Fundamentais:</h3>
      <ul>
        <li><b>Art. 5º:</b> Criação dos Nós Guardiões Federados para os 7 biomas nacionais.</li>
        <li><b>Art. 6º:</b> Vedação ao Proof-of-Work predatório e ao Proof-of-Stake plutocrático.</li>
        <li><b>Art. 8º:</b> Soberania digital: oráculos em nuvem de Estado (SERPRO/RNP) com código auditável e vedação à apropriação patentária de dados comunitários.</li>
        <li><b>Art. 13:</b> Partilha legal: 60% da liquidação primária para o Fundo da RBE.</li>
        <li><b>Art. 14:</b> Pagamento direto aos guardiões integrado ao Drex sem taxas.</li>
      </ul>
      <p><a href="https://github.com/PSousa22/biochain/blob/main/politica-publica/04_anteprojeto_de_lei.md" target="_blank" class="btn btn-primary btn-sm">Abrir Documento Integral no GitHub</a></p>
    `
  },
  '05': {
    title: '05. White Paper Técnico-Econômico',
    content: `
      <h2>Especificação de Protocolo e Engenharia</h2>
      <p>Documento formal de arquitetura DLT, modelagem matemática do consenso e teoria dos jogos.</p>
      <h3>Tópicos Técnicos:</h3>
      <ul>
        <li><b>Matemática do Ecoscore:</b> Função de validação ponderada pelos multiplicadores de estresse dos biomas (Pantanal 1.35x, Mata Atlântica 1.40x).</li>
        <li><b>Oráculos Bayesianos Multimodais:</b> Reconciliação entre imagens SAR/ópticas orbitais e sensores IoT terrestres com meta P ≥ 97.5%.</li>
        <li><b>Teoria dos Jogos & Nash:</b> Demonstração de que o valor presente líquido da preservação (VPL_PoE) supera estritamente o retorno do desmatamento (VPL_ext).</li>
        <li><b>Smart Contract Solidity:</b> Código do contrato RendaBasicaEcologica integrado à ponte IDrexBridge.</li>
      </ul>
      <p><a href="https://github.com/PSousa22/biochain/blob/main/politica-publica/05_whitepaper_tecnico.md" target="_blank" class="btn btn-primary btn-sm">Abrir Documento Integral no GitHub</a></p>
    `
  }
};

// ─── Init ─────────────────────────────────────────────────
async function init() {
  blockchain = new BioBlockchain();
  if (blockchain.ready) await blockchain.ready;
  else await sleep(100);

  renderNodes();
  renderGovernance();
  renderBiomes();
  calculateRBE();

  log('BioChain v2.0 inicializada · Bloco Gênesis criado', 'success');
  log('Tecnocracia Biocêntrica · Federação de Biomas ativa', 'success');

  await seedDemoData();
  renderChain();
  updateStats();

  // Inicia telemetria periódica simulada dos oráculos
  setInterval(simulateOracleTelemetry, 5000);

  // Fechar modal de documentos ao clicar fora
  document.getElementById('doc-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'doc-modal') closeDocModal();
  });
}

// ─── Switch Tab Navigation ────────────────────────────────
function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

  const btn = document.getElementById(`btn-tab-${tabId}`);
  const content = document.getElementById(`tab-${tabId}`);
  if (btn) btn.classList.add('active');
  if (content) content.classList.add('active');

  log(`Navegação: Módulo "${tabId.toUpperCase()}" ativado`, 'info');
}

// ─── Seed Demo Data ───────────────────────────────────────
async function seedDemoData() {
  const txs = [
    new BioTransaction({ type: 'floresta', origin: 'Guardian-Amazônia-0x1A', destination: 'Comunidade-Caiapó-0x2B', amount: 2000, area: 500, co2: 320, metadata: { bioma: 'Amazônia', sensor: 'INPE-DETER-AMZ' } }),
    new BioTransaction({ type: 'carbono', origin: 'Guardian-Cerrado-0x2B', destination: 'Mercado-GAIA-Verde', amount: 800, area: 200, co2: 95, metadata: { bioma: 'Cerrado' } }),
    new BioTransaction({ type: 'renda', origin: 'Fundo-Nacional-RBE', destination: 'Comunidade-Xingu-0x5E', amount: 1200, area: 150, co2: 60, metadata: { bioma: 'Amazônia' } }),
    new BioTransaction({ type: 'queima', origin: 'Indústria-Descarbonizada-0x99', destination: '0x0000_BURN_ADDRESS', amount: 300, area: 0, co2: 300, metadata: { motivo: 'Compensação de Emissões 2026' } })
  ];
  txs.forEach(tx => blockchain.addTransaction(tx));

  // Minera bloco demonstrativo de forma instantânea sem bloquear a tela
  const oldDiff = blockchain.difficulty;
  blockchain.difficulty = 1;
  await blockchain.mineBlock('Guardian-Amazônia-0x1A', () => {});
  blockchain.difficulty = oldDiff;

  log(`Bloco #1 minerado · 4 transações de custódia e queima confirmadas`, 'success');
}

// ─── Render Chain ─────────────────────────────────────────
function renderChain() {
  const container = document.getElementById('chain-container');
  container.innerHTML = '';
  const blocks = [...blockchain.chain].reverse();

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

  if (!origin || !destination || isNaN(amount) || amount <= 0) {
    showToast('⚠️ Preencha todos os campos obrigatórios.', 'warn'); return;
  }

  let metadata = {};
  if (metaRaw) {
    try { metadata = JSON.parse(metaRaw); } catch { showToast('⚠️ JSON de metadados inválido.', 'warn'); return; }
  }

  const tx = new BioTransaction({ type, origin, destination, amount, area, co2, metadata });
  blockchain.addTransaction(tx);
  renderMempool();
  log(`Tx na Mempool: ${TYPE_ICONS[type]} ${type} · ${amount} GAIA (${origin.split('-').slice(0,2).join('-')})`, 'success');
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
        <div class="mempool-item-type">${tx.type.toUpperCase()}</div>
        <div class="mempool-item-route">${truncate(tx.origin, 22)} → ${truncate(tx.destination, 22)}</div>
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
    pct = Math.min(pct + Math.random() * 10, 90);
    progress.style.width = pct + '%';
  }, 120);

  try {
    const block = await blockchain.mineBlock(validator, (nonce, hash) => {
      hashEl.textContent = `Hash: 0x${hash.slice(0, 20)}...`;
      status.textContent = `Nonce: ${nonce.toLocaleString()} · PoE Ativo`;
    });

    clearInterval(progressInterval);
    progress.style.width = '100%';
    hashEl.textContent = `Hash: 0x${block.hash.slice(0, 20)}...`;

    await sleep(500);
    modal.classList.add('hidden');
    progress.style.width = '0%';

    renderChain();
    renderMempool();
    updateStats();
    selectBlock(block.index);

    log(`⛏️ Bloco #${block.index} minerado por ${validator} · Score PoE: ${block.ecologicalScore}`, 'success');
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
    showToast('✅ Cadeia íntegra! Todos os hashes e árvores de Merkle conferem.', 'success');
    log('Validação criptográfica: 100% íntegra', 'success');
  } else {
    statusEl.innerHTML = '<span class="dot red"></span> Chain Comprometida';
    showToast(`❌ Violação no bloco #${result.blockIndex}: ${result.reason}`, 'error');
    log(`⚠️ Violação detectada no bloco #${result.blockIndex}: ${result.reason}`, 'error');
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
  showToast(`⚠️ Ataque simulado no bloco #${targetIdx}. Clique em Validar Cadeia.`, 'warn');
  log(`🔴 Ataque simulado no bloco #${targetIdx}`, 'warn');
}

// ─── Export ───────────────────────────────────────────────
function exportChain() {
  const json = blockchain.toJSON();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'biochain_soberana_export.json';
  a.click(); URL.revokeObjectURL(url);
  log('Blockchain exportada com sucesso (JSON)', 'success');
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
  document.getElementById('m-queima').textContent = (m.queima || blockchain.getTotalBurned()).toLocaleString();

  const totalTokens = blockchain.getTotalTokens();
  const ise = totalTokens ? Math.min(100, Math.round((blockchain.getTotalCO2() / totalTokens) * 500 + blockchain.chain.length * 5)) : 0;
  document.getElementById('eco-bar').style.width = ise + '%';
  document.getElementById('eco-pct').textContent = ise + '%';
}

// ─── Biomas & Oráculos Module ─────────────────────────────
function renderBiomes() {
  const container = document.getElementById('biomes-grid');
  if (!container) return;

  container.innerHTML = BIOMES_DATA.map(b => `
    <div class="biome-card" id="card-biome-${b.id}">
      <div class="biome-card-top">
        <div class="biome-title-box">
          <span class="biome-icon">${b.icon}</span>
          <div>
            <div class="biome-name">${b.name}</div>
            <div style="font-size: 11px; color: var(--text3);">${b.area}</div>
          </div>
        </div>
        <span class="biome-stress-tag">Estresse: ${b.stress}</span>
      </div>

      <div class="biome-stats-grid">
        <div class="biome-stat-box">
          <div class="biome-stat-lbl">Cobertura Florestal</div>
          <div class="biome-stat-val" id="canopy-${b.id}">${b.canopy.toFixed(1)}%</div>
        </div>
        <div class="biome-stat-box">
          <div class="biome-stat-lbl">Umidade de Solo</div>
          <div class="biome-stat-val" id="moisture-${b.id}">${b.moisture}%</div>
        </div>
        <div class="biome-stat-box">
          <div class="biome-stat-lbl">Alerta de Desmate</div>
          <div class="biome-stat-val" style="color: var(--green);" id="alert-${b.id}">${b.alert}</div>
        </div>
        <div class="biome-stat-box">
          <div class="biome-stat-lbl">Confiança Bayesiana</div>
          <div class="biome-stat-val" style="color: var(--teal);" id="bayes-${b.id}">${b.bayes}</div>
        </div>
      </div>

      <div class="oracle-pulse-row">
        <span style="font-family: 'JetBrains Mono', monospace; font-size: 10px;">📡 ${b.oracle}</span>
        <span style="color: var(--green); font-size: 10px;">● AO VIVO (SERPRO/INPE)</span>
      </div>
    </div>
  `).join('');
}

function simulateOracleTelemetry() {
  BIOMES_DATA.forEach(b => {
    // Pequena flutuacao de telemetria realista
    b.moisture = Math.max(15, Math.min(95, Math.round(b.moisture + (Math.random() * 2 - 1))));
    const el = document.getElementById(`moisture-${b.id}`);
    if (el) el.textContent = b.moisture + '%';
  });
}

// ─── RBE Calculator Module ────────────────────────────────
function calculateRBE() {
  const biomaSelect = document.getElementById('rbe-bioma');
  const areaSlider = document.getElementById('rbe-area-slider');
  const familiesSlider = document.getElementById('rbe-families-slider');
  const iieSlider = document.getElementById('rbe-iie-slider');

  if (!biomaSelect || !areaSlider) return;

  const bioma = biomaSelect.value;
  const area = parseFloat(areaSlider.value);
  const families = parseInt(familiesSlider.value);
  const iie = parseFloat(iieSlider.value) / 100;

  document.getElementById('rbe-area-val').textContent = `${area.toLocaleString()} ha`;
  document.getElementById('rbe-families-val').textContent = `${families} família${families !== 1 ? 's' : ''}`;
  document.getElementById('rbe-iie-val').textContent = `${Math.round(iie * 100)}%`;

  const stressMultiplier = window.BIOME_STRESS_FACTORS ? (window.BIOME_STRESS_FACTORS[bioma] || 1.2) : 1.2;

  // Formula Institucional (Art. 14 Anteprojeto BioChain):
  // RBE Base R$ 600 + adicional por hectare custodiado ponderado pelo bioma e saude ecologica
  const adicionalTerritorial = (area * 28 * stressMultiplier * iie);
  const repasseTotalTerritorio = Math.round(600 * families + adicionalTerritorial);
  const valorPorFamilia = Math.round(repasseTotalTerritorio / families);
  const gaiaTokensEquiv = Math.round(valorPorFamilia / 6.0); // 1 GAIA ~ R$ 6,00 no modelo primario
  const co2Anual = Math.round(area * 3.2);

  document.getElementById('rbe-total-family').textContent = `R$ ${valorPorFamilia.toLocaleString('pt-BR')},00`;
  document.getElementById('rbe-gaia-equiv').textContent = `equiv. a ${gaiaTokensEquiv.toLocaleString('pt-BR')} GAIA Tokens / mês`;
  document.getElementById('rbe-territorio-total').textContent = `R$ ${repasseTotalTerritorio.toLocaleString('pt-BR')},00`;
  document.getElementById('rbe-co2-anual').textContent = `${co2Anual.toLocaleString('pt-BR')} tCO₂e`;
}

function simulateRBEDeposit() {
  const biomaSelect = document.getElementById('rbe-bioma');
  const areaSlider = document.getElementById('rbe-area-slider');
  const familiesSlider = document.getElementById('rbe-families-slider');

  const bioma = biomaSelect.value;
  const area = parseFloat(areaSlider.value);
  const families = parseInt(familiesSlider.value);

  const tx = new BioTransaction({
    type: 'renda',
    origin: 'Fundo-Nacional-RBE-STN',
    destination: `Comunidade-${bioma}-0x${Math.random().toString(16).slice(2,6).toUpperCase()}`,
    amount: families * 150,
    area: area,
    co2: Math.round(area * 0.4),
    metadata: { bioma, familias: families, canal: 'Drex-BACEN-AutoSettlement' }
  });

  blockchain.addTransaction(tx);
  renderMempool();
  switchTab('dlt');
  showToast(`✅ Lote RBE de R$ liquidado e enviado à mempool!`, 'success');
  log(`Lote RBE gerado: ${families} famílias do bioma ${bioma} · Contrato Drex executado`, 'success');
}

// ─── Public Policy Reader Modal ───────────────────────────
function openDocModal(docId) {
  const doc = DOCS_DATA[docId];
  if (!doc) return;

  document.getElementById('doc-modal-title').textContent = doc.title;
  document.getElementById('doc-modal-body').innerHTML = doc.content;
  document.getElementById('doc-modal').classList.remove('hidden');
}

function closeDocModal() {
  document.getElementById('doc-modal').classList.add('hidden');
}

// ─── Nodes & Governance ───────────────────────────────────
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
  const biomes = ['Caatinga', 'Pampa', 'Pantanal', 'Cerrado', 'Amazônia'];
  const biome = biomes[Math.floor(Math.random() * biomes.length)];
  const id = Math.random().toString(16).slice(2, 6).toUpperCase();
  const stake = Math.floor(Math.random() * 3000) + 1200;
  nodes.push({ name: `Guardian-${biome}-0x${id}`, stake, biome });
  renderNodes();
  log(`Novo nó federado: Guardian-${biome}-0x${id}`, 'success');
  showToast(`🌐 Nó Guardian-${biome} adicionado à federação!`, 'success');
}

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

  const tx = new BioTransaction({
    type: 'governanca', origin: nodes[0].name,
    destination: 'DAO-BioChain-Brasil', amount: 1, metadata: { proposal: id, vote: yes ? 'sim' : 'nao' }
  });
  blockchain.addTransaction(tx);
  renderMempool();
  log(`🗳️ Voto registrado: "${p.title.slice(0, 30)}..."`, 'success');
  showToast(`🗳️ Voto adicionado à mempool!`, 'success');
}

// ─── Log & Toast ──────────────────────────────────────────
function log(msg, type = 'info') {
  const logEl = document.getElementById('event-log');
  if (!logEl) return;
  const now = new Date().toLocaleTimeString('pt-BR');
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.innerHTML = `<span class="log-time">${now}</span><span class="log-msg ${type}">${msg}</span>`;
  logEl.prepend(entry);
  while (logEl.children.length > 30) logEl.removeChild(logEl.lastChild);
}

function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
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
