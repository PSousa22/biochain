// ═══════════════════════════════════════════════════════════
//  BioChain — UI Application Layer
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

let voiceBudget = 100;
let currentProfile = 'guardian';
let selectedBiomeId = 'amz';

// ─── XSS Escape Helper ────────────────────────────────────
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const WALLET_PROFILES = {
  guardian: {
    id: 'guardian',
    name: 'Guardião Territorial',
    shortName: 'Guardião Xingu',
    role: 'Comunidade Xingu · Recebimento RBE',
    address: '0x71C3...4E9A_BR',
    gaia: 2400,
    drex: 'R$ 14.400,00',
    icon: '🌿',
    origin: 'Guardian-Amazônia-0x1A'
  },
  enterprise: {
    id: 'enterprise',
    name: 'Empresa Compensadora',
    shortName: 'Indústria S.A.',
    role: 'Indústria Sustentável S.A. · Queima de Créditos',
    address: '0x99A4...2B10_BR',
    gaia: 12500,
    drex: 'R$ 75.000,00',
    icon: '🏢',
    origin: 'Indústria-Descarbonizada-0x99'
  },
  auditor: {
    id: 'auditor',
    name: 'Auditor de Estado',
    shortName: 'Auditor TCU',
    role: 'INPE / TCU · Conformidade de Oráculos',
    address: '0x3F88...E019_BR',
    gaia: 500,
    drex: 'R$ 3.000,00',
    icon: '🏛️',
    origin: 'Tribunal-Contas-Uniao-0x01'
  }
};

const BIOME_MAP_INFO = {
  amz: {
    name: 'Bioma Amazônia',
    icon: '🌳',
    desc: 'Maior floresta tropical contínua da Terra, abrangendo 4,1 milhões de km² em território brasileiro. Regulador primordial do ciclo de rios voadores e sequestro ativo de carbono.',
    stress: '1.20x',
    canopy: '86.4%',
    canopyType: 'Cobertura Florestal Nativa',
    oracle: 'INPE-DETER-AMZ-01',
    water: 'Excelente (78%)',
    biomaSelectVal: 'Amazônia'
  },
  cer: {
    name: 'Bioma Cerrado',
    icon: '🌱',
    desc: 'Berço das águas brasileiras e savana mais biodiversa do mundo (2,0M km²). Alimenta 8 das 12 principais bacias hidrográficas nacionais com alta taxa de estresse antrópico.',
    stress: '1.25x',
    canopy: '51.2%',
    canopyType: 'Vegetação Nativa (Savana/Campo)',
    oracle: 'INPE-DETER-CR-04',
    water: 'Crítico (44%)',
    biomaSelectVal: 'Cerrado'
  },
  caa: {
    name: 'Bioma Caatinga',
    icon: '🌵',
    desc: 'Único bioma exclusivamente brasileiro (844k km²). Alta resiliência climática, endemismo biológico e fronteira prioritária contra a desertificação no Semiárido.',
    stress: '1.30x',
    canopy: '42.0%',
    canopyType: 'Vegetação Xerófila Nativa',
    oracle: 'INPE-SEMIARIDO-03',
    water: 'Seco (28%)',
    biomaSelectVal: 'Caatinga'
  },
  mat: {
    name: 'Bioma Mata Atlântica',
    icon: '🌿',
    desc: 'Bioma mais ameaçado e densamente habitado (1,3M km² original). Abriga 70% da população e gera 80% do PIB, com altíssimo valor de conservação (12,4% primária SOS Mata Atlântica; 28,5% total MapBiomas).',
    stress: '1.40x',
    canopy: '28.5%',
    canopyType: 'Remanescente Nativo (Prim.+Sec.)',
    oracle: 'INPE-SIRENE-MA-02',
    water: 'Moderado (62%)',
    biomaSelectVal: 'Mata Atlântica'
  },
  pan: {
    name: 'Bioma Pantanal',
    icon: '🐾',
    desc: 'Maior planície alagável contínua do planeta (150k km²). Patrimônio Natural da Humanidade com ciclos hidrológicos extremos e altíssima vulnerabilidade a incêndios.',
    stress: '1.35x',
    canopy: '72.1%',
    canopyType: 'Cobertura Nativa e Áreas Alagáveis',
    oracle: 'ANA-TELEMETRIA-PAN-09',
    water: 'Alagado (82%)',
    biomaSelectVal: 'Pantanal'
  },
  pam: {
    name: 'Bioma Pampa',
    icon: '🌾',
    desc: 'Campos sulinos com rica biodiversidade vegetal e solos de alto teor de matéria orgânica (176k km²). Tradição pastoril sustentável e conservação de pastagens naturais campestres.',
    stress: '1.15x',
    canopy: '74.0%',
    canopyType: 'Integridade dos Campos Nacionais',
    oracle: 'EMBRAPA-PAMPA-01',
    water: 'Estável (65%)',
    biomaSelectVal: 'Pampa'
  },
  cos: {
    name: 'Zona Costeira e Marinha',
    icon: '🌊',
    desc: 'Mais de 8.500 km de costa (Amazônia Azul). Manguezais com sequestro de carbono azul até 5x superior a florestas terrestres e proteção de recifes de corais.',
    stress: '1.25x',
    canopy: '91.0%',
    canopyType: 'Manguezais e Recifes Protegidos',
    oracle: 'MARINHA-ORACULO-07',
    water: 'Marinho (95%)',
    biomaSelectVal: 'Zona Costeira e Marinha'
  }
};

const PROPOSALS = [
  {
    id: 'p1', title: 'PSA Universal — Pagamento por Serviços Ambientais',
    desc: 'Tokenizar 50M ha de vegetação nativa e distribuir GAIA tokens para guardiões locais.',
    yes: 72, no: 18, userVotesYes: 0, userVotesNo: 0
  },
  {
    id: 'p2', title: 'RBE — Renda Básica Ecológica',
    desc: 'Financiar renda básica com receita de créditos de carbono tokenizados na BioChain.',
    yes: 85, no: 10, userVotesYes: 0, userVotesNo: 0
  },
  {
    id: 'p3', title: 'Oráculos de IA  (INPE/MapBiomas)',
    desc: 'Hospedar modelos de visão computacional ambiental em infraestrutura pública do SERPRO/RNP.',
    yes: 94, no: 4, userVotesYes: 0, userVotesNo: 0
  }
];

const BIOMES_DATA = [
  {
    id: 'amz', name: 'Amazônia', icon: '🌳', stress: '1.20x',
    area: '4,1M km²', canopy: 86.4, canopyLbl: 'Cobertura Florestal', moisture: 78, alert: '0.00%',
    oracle: 'INPE-DETER-AMZ-01', bayes: '99.4%'
  },
  {
    id: 'cer', name: 'Cerrado', icon: '🌱', stress: '1.25x',
    area: '2,0M km²', canopy: 51.2, canopyLbl: 'Vegetação Savânica', moisture: 44, alert: '0.01%',
    oracle: 'INPE-DETER-CR-04', bayes: '98.8%'
  },
  {
    id: 'mat', name: 'Mata Atlântica', icon: '🌿', stress: '1.40x',
    area: '1,3M km²', canopy: 28.5, canopyLbl: 'Remanescente Nativo', moisture: 62, alert: '0.00%',
    oracle: 'INPE-SIRENE-MA-02', bayes: '99.1%'
  },
  {
    id: 'pan', name: 'Pantanal', icon: '🐾', stress: '1.35x',
    area: '150k km²', canopy: 72.1, canopyLbl: 'Áreas Alagadas/Campos', moisture: 82, alert: '0.00%',
    oracle: 'ANA-TELEMETRIA-PAN-09', bayes: '98.6%'
  },
  {
    id: 'caa', name: 'Caatinga', icon: '🌵', stress: '1.30x',
    area: '844k km²', canopy: 42.0, canopyLbl: 'Vegetação Caatinga', moisture: 28, alert: '0.00%',
    oracle: 'INPE-SEMIARIDO-03', bayes: '97.9%'
  },
  {
    id: 'pam', name: 'Pampa', icon: '🌾', stress: '1.15x',
    area: '176k km²', canopy: 74.0, canopyLbl: 'Campos Nacionais', moisture: 65, alert: '0.00%',
    oracle: 'EMBRAPA-PAMPA-01', bayes: '98.2%'
  },
  {
    id: 'cos', name: 'Zona Costeira e Marinha', icon: '🌊', stress: '1.25x',
    area: '8,5k km costa', canopy: 91.0, canopyLbl: 'Manguezais/Recifes', moisture: 95, alert: '0.00%',
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
        <li><b>O Método Brasiliano:</b> Síntese institucional soberana ancorada na megabiodiversidade e sociodiversidade nacional.</li>
        <li><b>Proof-of-Ecology (PoE):</b> O poder de validação decorre da custódia física de biomas, e não da queima de energia ou concentração plutocrática.</li>
        <li><b>Renda Básica Ecológica:</b> 60% da liquidação primária de ativos GAIA é destinada a famílias guardiãs (indígenas, quilombolas, ribeirinhos).</li>
        <li><b>Roadmap Escalonado:</b> Piloto inicial com 1.000 famílias em 3 biomas prioritários, expandindo para 10.000–15.000 famílias em 2027 e meta decenal de 500.000 famílias em 100M ha até 2030.</li>
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
        <li><b>O Problema:</b> Com biomas próximos do ponto de não-retorno, mecanismos punitivos tradicionais são insuficientes sem incentivos econômicos de custódia territorial.</li>
        <li><b>Financiamento Sustentável:</b> 60% da receita primária de ativos GAIA combinada a fundos climáticos multilaterais e garantia soberana de última instância (Fundo Clima / Tesouro).</li>
        <li><b>Ação para os Próximos 60 Dias:</b> Decreto Presidencial criando o Grupo de Trabalho Interministerial (GTI BioChain) e autorização do piloto em 3 biomas prioritários.</li>
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
        <li>Capa & Tese de Impacto: A maior biodiversidade como motor de riqueza nacional.</li>
        <li>O Narcisídio Social: A floresta valorada a zero no PIB e os custos socializados.</li>
        <li>A Encruzilhada da IA: Soberania contra o extrativismo de dados genéticos.</li>
        <li>O Método Brasiliano: Síntese de DLT pública, dados do INPE e saberes tradicionais.</li>
        <li>Proof-of-Ecology e o Ativo GAIA: Lastro biofísico de 1 tCO₂e com queima/aposentadoria auditável.</li>
        <li>Renda Básica Ecológica: Repasse direto via Pix/Caixa (Fase 1) e integração com moeda digital soberana (Fase 2).</li>
        <li>Roadmap 2026–2030: Do piloto federativo à cooperação pan-amazônica na OTCA.</li>
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
        <li><b>Art. 6º:</b> Vedação ao Proof-of-Work predatório e mitigação da plutocracia do Proof-of-Stake via seleção sublinear VRF.</li>
        <li><b>Art. 8º:</b> Soberania digital: oráculos em nuvem de Estado (SERPRO/RNP) com código auditável e salvaguarda do patrimônio genético comunitário.</li>
        <li><b>Art. 13:</b> Partilha legal: 60% da liquidação primária para o Fundo da RBE.</li>
        <li><b>Art. 14:</b> Pagamento direto aos guardiões integrado ao sistema financeiro público (Pix/Caixa na Fase 1, e Drex conforme diretrizes do Bacen).</li>
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
        <li><b>Consenso Proof-of-Ecology & VRF:</b> Função de validação sublinear (P_i ∝ S_i^0.85) com salvaguardas contra manipulação autodeclarada (Lei de Goodhart).</li>
        <li><b>Oráculos Bayesianos Multimodais:</b> Reconciliação entre imagens orbitais e sensores terrestres com meta P ≥ 97.5% balanceando custos de erro falso-positivo.</li>
        <li><b>Teoria dos Jogos & Hipóteses Falseáveis (H1–H5):</b> Análise paramétrica do VPL da conservação frente ao custo de oportunidade da terra e grilagem.</li>
        <li><b>Smart Contract Solidity:</b> Arquitetura do contrato de custódia e máquina de estados de ativos (Issued, Active, Transferred, Suspended, Retired).</li>
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
  selectBiomeFromMap('amz');
  setWalletProfile('guardian');

  log('BioChain inicializada · Bloco Gênesis criado', 'success');
  log('Tecnocracia Biocêntrica · Federação de Biomas ativa', 'success');

  renderChain();
  updateStats();

  // Inicia telemetria periódica simulada dos oráculos
  setInterval(simulateOracleTelemetry, 5000);

  // Fechar modal de documentos ao clicar fora
  document.getElementById('doc-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'doc-modal') closeDocModal();
  });

  // Fechar modal de certificado ao clicar fora
  document.getElementById('cert-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'cert-modal') closeCertModal();
  });

  // Fechar modal de glossário ao clicar fora
  document.getElementById('glossary-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'glossary-modal') closeGlossaryModal();
  });

  // Atalho Teclado ESC para fechar gavetas e modais
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDocModal();
      closeCertModal();
      closeGlossaryModal();
      const drawer = document.getElementById('wallet-drawer');
      if (drawer?.classList.contains('open')) toggleWalletDrawer();
    }
  });
}

// ─── Switch Tab Navigation ────────────────────────────────
function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-selected', 'false');
  });
  document.querySelectorAll('.tab-content').forEach(c => {
    c.classList.remove('active');
    c.setAttribute('aria-hidden', 'true');
  });

  const btn = document.getElementById(`btn-tab-${tabId}`);
  const content = document.getElementById(`tab-${tabId}`);
  if (btn) {
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
  }
  if (content) {
    content.classList.add('active');
    content.setAttribute('aria-hidden', 'false');
  }

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
        <div class="inspector-tx-type">${TYPE_ICONS[tx.type] || '📦'} ${esc(tx.type).toUpperCase()} · ${tx.amount} GAIA</div>
        <div class="inspector-tx-detail">
          <b>De:</b> ${esc(tx.origin)}<br/>
          <b>Para:</b> ${esc(tx.destination)}<br/>
          <b>Área:</b> ${tx.area} ha &nbsp;|&nbsp; <b>CO₂:</b> ${tx.co2} tC<br/>
          <b>ID:</b> <span style="font-family:'JetBrains Mono',monospace;font-size:10px">${esc(tx.id)}</span>
        </div>
      </div>`).join('');
  } else {
    txHTML = '<p class="empty-msg">Sem transações neste bloco.</p>';
  }

  const hasQueima = block.transactions.some(tx => tx.type === 'queima');
  const certBtn = hasQueima ? `
    <div style="margin-top: 14px;">
      <button class="btn btn-secondary btn-sm" style="width: 100%;" onclick="openCertModalForBlock(${index})">
        <span>📜</span> Visualizar Certificado de Descarbonização
      </button>
    </div>` : '';

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
    ${certBtn}
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
        <div class="mempool-item-type">${esc(tx.type).toUpperCase()}</div>
        <div class="mempool-item-route">${esc(truncate(tx.origin, 22))} → ${esc(truncate(tx.destination, 22))}</div>
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
  // Sorteio de validador via VRF sublinear (ϕ = 0.85) ancorado no hash anterior
  const lastBlock = blockchain.latestBlock;
  const vrfResult = blockchain.selectValidatorVRF(nodes, lastBlock.hash);
  const validator = vrfResult.validator;
  const vrfProof = vrfResult.vrfProof || 'VRF_0x00000000';
  const vrfDraw = parseFloat(vrfResult.draw) || 0;
  status.textContent = `Validador sorteado (VRF): ${validator}`;

  const progressInterval = setInterval(() => {
    pct = Math.min(pct + Math.random() * 10, 90);
    progress.style.width = pct + '%';
  }, 120);

  try {
    const block = await blockchain.mineBlock(validator, (nonce, hash) => {
      hashEl.textContent = `Hash: 0x${hash.slice(0, 16)}... | VRF: ${vrfProof.slice(-16)}`;
      status.textContent = `Nonce: ${nonce.toLocaleString('pt-BR')} · PoE Ativo (VRF draw=${vrfDraw.toFixed(4)}, φ=0.85)`;
    });

    clearInterval(progressInterval);
    progress.style.width = '100%';
    hashEl.textContent = `Hash: 0x${block.hash.slice(0, 16)}... | VRF: ${vrfProof.slice(-16)}`;

    await sleep(500);
    modal.classList.add('hidden');
    progress.style.width = '0%';

    renderChain();
    renderMempool();
    updateStats();
    selectBlock(block.index);

    if (block.transactions.some(t => t.type === 'queima')) {
      setTimeout(() => openCertModalForBlock(block.index), 500);
    }

    log(`⛏️ Bloco #${block.index} minerado por ${validator} · VRF: ${vrfProof.slice(-16)} (draw=${vrfDraw.toFixed(4)}, ϕ=0.85) · Score PoE: ${block.ecologicalScore}`, 'success');
    showToast(`⛏️ Bloco #${block.index} minerado com sucesso!`, 'success');
  } catch (e) {
    clearInterval(progressInterval);
    modal.classList.add('hidden');
    showToast('❌ Erro ao validar bloco: ' + e.message, 'error');
  }
}

// ─── Validate Chain ───────────────────────────────────────
async function validateChain() {
  const result = await blockchain.validateChain();
  const statusEl = document.getElementById('chain-status');
  if (result.valid) {
    statusEl.innerHTML = '<span class="dot green"></span> Chain Válida';
    showToast('✅ Cadeia íntegra! Todos os hashes e árvores de Merkle conferem.', 'success');
    log('Validação criptográfica: 100% íntegra', 'success');
    document.querySelectorAll('.block-card').forEach(c => c.classList.remove('tampered'));
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
  let tamperedDesc = '';

  if (block.transactions.length) {
    const tx = block.transactions[0];
    const fields = ['amount', 'destination', 'co2', 'origin'];
    const chosenField = fields[Math.floor(Math.random() * fields.length)];
    if (chosenField === 'amount') {
      tx.amount = 999999999;
      tamperedDesc = 'Adulteração em amount (999.999.999 GAIA)';
    } else if (chosenField === 'destination') {
      tx.destination = 'Hacker-Account-0xEVIL';
      tamperedDesc = 'Adulteração de destino (Hacker-Account-0xEVIL)';
    } else if (chosenField === 'co2') {
      tx.co2 = 88888;
      tamperedDesc = 'Adulteração de carbono (88.888 tCO₂)';
    } else {
      tx.origin = 'Fake-Reserve-0xFRAUD';
      tamperedDesc = 'Adulteração de origem (Fake-Reserve-0xFRAUD)';
    }
    // O atacante tenta recalcular a raiz de Merkle do bloco para simular sofisticação
    block.merkleRoot = block._computeMerkleRoot();
  } else {
    block.validator = 'Invasor-0xDEAD';
    tamperedDesc = 'Adulteração de validador (Invasor-0xDEAD)';
  }

  // A validação criptográfica (recomputação de SHA-256 e verificação de assinatura) detectará a fraude genuinamente.
  renderChain();
  const statusEl = document.getElementById('chain-status');
  statusEl.innerHTML = '<span class="dot red"></span> Bloco Modificado (Aguardando Validação)';
  document.getElementById(`block-${targetIdx}`)?.classList.add('tampered');
  showToast(`⚠️ ${tamperedDesc} no bloco #${targetIdx}. Clique em "Validar Cadeia" para acionar a detecção criptográfica.`, 'warn');
  log(`🔴 Adulteração não autorizada inserida no bloco #${targetIdx}: ${tamperedDesc}`, 'warn');
}

// ─── Reset Chain ──────────────────────────────────────────
async function resetChain() {
  blockchain = new BioBlockchain();
  if (blockchain.ready) await blockchain.ready;
  await seedDemoData();
  renderChain();
  renderMempool();
  updateStats();
  document.querySelectorAll('.block-card').forEach(c => c.classList.remove('tampered'));
  const statusEl = document.getElementById('chain-status');
  if (statusEl) statusEl.innerHTML = '<span class="dot green"></span> Chain Válida';
  showToast('🔄 Cadeia restaurada para o estado demonstrativo original!', 'info');
  log('Blockchain reiniciada para estado demonstrativo original', 'info');
}

// ─── Export ───────────────────────────────────────────────
function exportChain() {
  const json = blockchain.toJSON();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'biochain__export.json';
  a.click(); URL.revokeObjectURL(url);
  log('Blockchain exportada com sucesso (JSON)', 'success');
  showToast('📥 Blockchain exportada!', 'success');
}

// ─── Stats & Metrics ──────────────────────────────────────
// ─── Stats & Metrics ──────────────────────────────────────
function updateStats() {
  document.getElementById('val-blocks').textContent = blockchain.chain.length;
  document.getElementById('val-tokens').textContent = blockchain.getTotalTokens().toLocaleString('pt-BR');
  document.getElementById('val-co2').textContent = blockchain.getTotalCO2().toFixed(1) + ' tCO₂e';

  // Contador de Famílias Beneficiadas na cadeia (Seção 4)
  const totalFamilias = blockchain.chain.reduce((sum, b) =>
    sum + b.transactions.filter(t => t.type === 'renda').reduce((st, t) => st + (t.metadata?.familias || 0), 0), 0);
  const elFam = document.getElementById('val-rbe-familias');
  if (elFam) elFam.textContent = Math.max(12, totalFamilias).toLocaleString('pt-BR');

  const m = blockchain.getMetricsByType();
  document.getElementById('m-floresta').textContent = m.floresta.toLocaleString('pt-BR');
  document.getElementById('m-rio').textContent = m.rio.toLocaleString('pt-BR');
  document.getElementById('m-bio').textContent = m.biodiversidade.toLocaleString('pt-BR');
  document.getElementById('m-co2').textContent = m.carbono.toLocaleString('pt-BR');
  document.getElementById('m-rbe').textContent = m.renda.toLocaleString('pt-BR');
  document.getElementById('m-queima').textContent = (m.queima || blockchain.getTotalBurned()).toLocaleString('pt-BR');

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
          <div class="biome-stat-lbl">${b.canopyLbl || 'Cobertura Nativa'}</div>
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
        <span style="color: var(--green); font-size: 10px;">● SIMULADO (SERPRO/INPE)</span>
      </div>
    </div>
  `).join('');
}

function simulateOracleTelemetry() {
  BIOMES_DATA.forEach(b => {
    // Pequena flutuação de telemetria realista simulada
    b.moisture = Math.max(15, Math.min(95, Math.round(b.moisture + (Math.random() * 2 - 1))));
    const el = document.getElementById(`moisture-${b.id}`);
    if (el) el.textContent = b.moisture + '%';
  });
}

// ─── RBE Shared Calculation ───────────────────────────────
const BASE_RBE = 810.50; // Piso legal: 50% do salário mínimo 2026 (R$ 1.621,00)

function computeRBE(bioma, area, families, iie) {
  const stressMultiplier = (window.BIOME_STRESS_FACTORS && window.BIOME_STRESS_FACTORS[bioma]) || 1.0;

  // Valoração de Serviços Ecossistêmicos: R$ 12,50/ha·mês (~3.2 tCO2e/ha/ano a R$ 47/t + água/biodiversidade)
  const taxaMensalPSA = 12.50;
  const psaTerritorialTotal = area * taxaMensalPSA * stressMultiplier * iie;

  // A parcela territorial de PSA é distribuída entre as famílias guardiãs homologadas (Art. 14)
  const parcelaVariavelPorFamilia = families > 0 ? (psaTerritorialTotal / families) : 0;
  const valorPorFamilia = BASE_RBE + parcelaVariavelPorFamilia;
  const repasseTotalTerritorio = valorPorFamilia * families;
  const gaiaTokensEquiv = Math.round(valorPorFamilia / 6.0); // 1 GAIA ~ R$ 6,00 no modelo primário
  const co2Anual = Math.round(area * 3.2);

  // Adicionalidade Contrafactual (Seção 1.3): Y0 (1.8% a.a. regional histórico) vs Y1 (desmate residual sob custódia)
  const y0 = 0.018;
  const y1 = Math.max(0, (1.0 - iie) * y0);
  const haEvitadosAnual = +((y0 - y1) * area).toFixed(1);
  const additionalityPct = (((y0 - y1) / y0) * 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });

  return {
    BASE_RBE,
    stressMultiplier,
    psaTerritorialTotal,
    parcelaVariavelPorFamilia,
    valorPorFamilia,
    repasseTotalTerritorio,
    gaiaTokensEquiv,
    co2Anual,
    haEvitadosAnual,
    additionalityPct
  };
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

  document.getElementById('rbe-area-val').textContent = `${area.toLocaleString('pt-BR')} ha`;
  document.getElementById('rbe-families-val').textContent = `${families.toLocaleString('pt-BR')} família${families !== 1 ? 's' : ''}`;
  document.getElementById('rbe-iie-val').textContent = `${Math.round(iie * 100)}%`;

  const rbe = computeRBE(bioma, area, families, iie);

  document.getElementById('rbe-total-family').textContent = `R$ ${rbe.valorPorFamilia.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  document.getElementById('rbe-gaia-equiv').textContent = `equiv. a ${rbe.gaiaTokensEquiv.toLocaleString('pt-BR')} GAIA Tokens / mês (R$ ${BASE_RBE.toFixed(2)} piso + R$ ${rbe.parcelaVariavelPorFamilia.toFixed(2)} PSA)`;
  document.getElementById('rbe-territorio-total').textContent = `R$ ${rbe.repasseTotalTerritorio.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  document.getElementById('rbe-co2-anual').textContent = `${rbe.co2Anual.toLocaleString('pt-BR')} tCO₂e`;

  const additionalityEl = document.getElementById('rbe-additionality-val');
  if (additionalityEl) additionalityEl.textContent = `+${rbe.additionalityPct}% de retenção contrafactual (${rbe.haEvitadosAnual} ha/ano evitados vs. Y₀ = 1,8% a.a.)`;
}

function simulateRBEDeposit() {
  const biomaSelect = document.getElementById('rbe-bioma');
  const areaSlider = document.getElementById('rbe-area-slider');
  const familiesSlider = document.getElementById('rbe-families-slider');
  const iieSlider = document.getElementById('rbe-iie-slider');

  const bioma = biomaSelect.value;
  const area = parseFloat(areaSlider.value);
  const families = parseInt(familiesSlider.value);
  const iie = iieSlider ? (parseFloat(iieSlider.value) / 100) : 0.94;

  const rbe = computeRBE(bioma, area, families, iie);

  const tx = new BioTransaction({
    type: 'renda',
    origin: 'Fundo-Nacional-RBE-STN',
    destination: `Comunidade-${bioma}-0x${Math.random().toString(16).slice(2,6).toUpperCase()}`,
    amount: rbe.gaiaTokensEquiv * families,
    area: area,
    co2: rbe.co2Anual,
    metadata: {
      bioma,
      familias: families,
      canal: 'Pix-ContaSocial-Fase1',
      pisoLegalBRL: `R$ ${BASE_RBE.toFixed(2)}`,
      psaTerritorialBRL: `R$ ${rbe.psaTerritorialTotal.toFixed(2)}`,
      repasseTotalBRL: `R$ ${rbe.repasseTotalTerritorio.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
    }
  });

  blockchain.addTransaction(tx);
  renderMempool();
  updateStats();
  switchTab('dlt');
  showToast(`✅ Lote RBE simulado para ${families} famílias enviado à Mempool! Clique em "Minerar Bloco" para registrar on-chain.`, 'success');
  log(`Lote RBE gerado: ${families.toLocaleString('pt-BR')} famílias do bioma ${bioma} (R$ ${rbe.repasseTotalTerritorio.toLocaleString('pt-BR', {minimumFractionDigits: 2})} total) · Enviado para mempool`, 'success');
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
      <div class="node-stake">${n.stake.toLocaleString('pt-BR')} GAIA</div>
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
  const budgetEl = document.getElementById('user-voice-budget');
  if (budgetEl) budgetEl.textContent = `${voiceBudget} Créditos`;

  if (!container) return;

  container.innerHTML = PROPOSALS.map(p => {
    const total = p.yes + p.no;
    const yesPct = total ? Math.round((p.yes / total) * 100) : 50;
    const noPct = 100 - yesPct;
    const uYes = p.userVotesYes || 0;
    const uNo = p.userVotesNo || 0;
    const nextCostYes = 2 * uYes + 1;
    const nextCostNo = 2 * uNo + 1;
    const creditsSpent = (uYes * uYes) + (uNo * uNo);

    return `
    <div class="gov-proposal" id="prop-${p.id}">
      <div class="gov-proposal-title">${p.title}</div>
      <div class="gov-proposal-desc">${p.desc}</div>
      <div class="gov-votes">
        <div class="gov-vote-bar"><div class="gov-vote-fill yes" style="width:${yesPct}%"></div></div>
        <div class="gov-vote-bar"><div class="gov-vote-fill no" style="width:${noPct}%"></div></div>
      </div>
      <div class="gov-vote-labels">
        <span>✅ Sim: ${yesPct}% (${p.yes})</span>
        <span>❌ Não: ${noPct}% (${p.no})</span>
      </div>

      <!-- Controle de Votação Quadrática Bidirecional (v²) -->
      <div class="quad-vote-control" style="flex-direction: column; gap: 8px; align-items: stretch;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; color: var(--text2);">Seus Votos:</span>
          <span class="quad-cost-badge">${uYes} Sim | ${uNo} Não (${creditsSpent} cr gastos)</span>
        </div>
        <div style="display: flex; justify-content: space-between; gap: 8px;">
          <!-- Voto SIM -->
          <div style="display: flex; gap: 4px; align-items: center;">
            <button class="quad-btn" onclick="voteQuadratic('${p.id}', 'yes', -1)" ${uYes <= 0 ? 'disabled style="opacity:0.35;cursor:not-allowed;"' : ''} title="Remover 1 voto Sim" aria-label="Remover voto Sim">-</button>
            <button class="btn btn-secondary btn-sm" onclick="voteQuadratic('${p.id}', 'yes', 1)" title="Adicionar 1 voto Sim (custo: ${nextCostYes} cr)" aria-label="Adicionar voto Sim">
              +1 Sim (${nextCostYes} cr)
            </button>
          </div>
          <!-- Voto NÃO -->
          <div style="display: flex; gap: 4px; align-items: center;">
            <button class="quad-btn" onclick="voteQuadratic('${p.id}', 'no', -1)" ${uNo <= 0 ? 'disabled style="opacity:0.35;cursor:not-allowed;"' : ''} title="Remover 1 voto Não" aria-label="Remover voto Não">-</button>
            <button class="btn btn-ghost btn-sm" style="border: 1px solid rgba(239,68,68,0.4); color: #fca5a5;" onclick="voteQuadratic('${p.id}', 'no', 1)" title="Adicionar 1 voto Não (custo: ${nextCostNo} cr)" aria-label="Adicionar voto Não">
              +1 Não (${nextCostNo} cr)
            </button>
          </div>
        </div>
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

// ─── Mapa Vetorial dos Biomas ─────────────────────────────
function selectBiomeFromMap(biomeId) {
  const info = BIOME_MAP_INFO[biomeId];
  if (!info) return;
  selectedBiomeId = biomeId;

  document.querySelectorAll('.biome-path').forEach(p => p.classList.remove('selected'));
  const activePath = document.getElementById(`biome-svg-${biomeId}`);
  if (activePath) activePath.classList.add('selected');

  const iconEl = document.getElementById('map-info-icon');
  const nameEl = document.getElementById('map-info-name');
  const descEl = document.getElementById('map-info-desc');
  const stressEl = document.getElementById('map-info-stress');
  const canopyEl = document.getElementById('map-info-canopy');
  const oracleEl = document.getElementById('map-info-oracle');
  const waterEl = document.getElementById('map-info-water');

  if (iconEl) iconEl.textContent = info.icon;
  if (nameEl) nameEl.textContent = info.name;
  if (descEl) descEl.textContent = info.desc;
  if (stressEl) stressEl.textContent = info.stress;
  if (canopyEl) canopyEl.textContent = info.canopy;
  if (oracleEl) oracleEl.textContent = info.oracle;
  if (waterEl) waterEl.textContent = info.water;

  document.querySelectorAll('.biome-card').forEach(c => c.style.borderColor = 'var(--border)');
  const card = document.getElementById(`card-biome-${biomeId}`);
  if (card) {
    card.style.borderColor = 'var(--green)';
  }

  log(`Mapa Vetorial: ${info.name} selecionado · Oráculo ${info.oracle}`, 'info');
}

function syncMapWithCalculator() {
  const info = BIOME_MAP_INFO[selectedBiomeId];
  if (!info) return;

  switchTab('rbe');
  const biomaSelect = document.getElementById('rbe-bioma');
  if (biomaSelect) {
    biomaSelect.value = info.biomaSelectVal;
    calculateRBE();
  }
  showToast(`💚 Calculadora RBE sincronizada com o ${info.name}!`, 'success');
  log(`Calculadora RBE: Parâmetros ajustados para ${info.name}`, 'info');
}

// ─── BioWallet Drex ───────────────────────────────────────
function toggleWalletDrawer() {
  const drawer = document.getElementById('wallet-drawer');
  const pill = document.getElementById('wallet-pill');
  if (drawer) {
    drawer.classList.toggle('open');
    const isOpen = drawer.classList.contains('open');
    if (pill) pill.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }
}

function setWalletProfile(profileKey) {
  const prof = WALLET_PROFILES[profileKey];
  if (!prof) return;
  currentProfile = profileKey;

  document.querySelectorAll('.profile-card-option').forEach(el => el.classList.remove('active'));
  const activeEl = document.getElementById(`prof-${profileKey}`);
  if (activeEl) activeEl.classList.add('active');

  const drawerGaia = document.getElementById('drawer-gaia-balance');
  const drawerDrex = document.getElementById('drawer-drex-balance');
  const drawerAddr = document.getElementById('drawer-wallet-address');
  if (drawerGaia) drawerGaia.textContent = `${prof.gaia.toLocaleString('pt-BR')} GAIA`;
  if (drawerDrex) drawerDrex.textContent = `≈ ${prof.drex} Drex`;
  if (drawerAddr) drawerAddr.textContent = prof.address;

  const pillIcon = document.getElementById('wallet-icon');
  const pillName = document.getElementById('wallet-name');
  const pillBalance = document.getElementById('wallet-balance');
  if (pillIcon) pillIcon.textContent = prof.icon;
  if (pillName) pillName.textContent = prof.shortName;
  if (pillBalance) pillBalance.textContent = `${prof.gaia.toLocaleString('pt-BR')} GAIA | ${prof.drex} Drex`;

  const txOrigin = document.getElementById('tx-origin');
  if (txOrigin) txOrigin.value = prof.origin;

  log(`BioWallet Drex: Perfil alterado para "${prof.name}"`, 'info');
  showToast(`👛 Perfil ativo: ${prof.name}`, 'info');
}

function simulateDrexWithdrawal() {
  const prof = WALLET_PROFILES[currentProfile];
  if (!prof) return;

  const withdrawAmount = Math.min(prof.gaia, 400);
  if (withdrawAmount <= 0) {
    showToast('Saldo insuficiente para saque!', 'warn');
    return;
  }

  prof.gaia -= withdrawAmount;
  const drexValor = withdrawAmount * 6;
  prof.drex = `R$ ${(prof.gaia * 6).toLocaleString('pt-BR')},00`;

  setWalletProfile(currentProfile);

  const tx = new BioTransaction({
    type: 'renda',
    origin: prof.origin,
    destination: 'Banco-Central-Drex-Gateway-0xBACEN',
    amount: withdrawAmount,
    area: 0,
    co2: 0,
    metadata: {
      motivo: 'Liquidação RBE Drex',
      favorecido: prof.name,
      liquidado_brl: `R$ ${drexValor.toLocaleString('pt-BR')},00`,
      chave_pix: prof.address
    }
  });
  blockchain.addTransaction(tx);
  renderMempool();

  showToast(`💸 Saque RBE de R$ ${drexValor.toLocaleString('pt-BR')},00 simulado (Fase 1: Pix / Conta Social)!`, 'success');
  log(`Liquidação RBE: R$ ${drexValor.toLocaleString('pt-BR')},00 simulados via Pix/Conta Social (Migração Drex na Fase 2)`, 'success');
}

// ─── Certificado de Descarbonização ────────────────────────
function openCertModal(tx, block) {
  const modal = document.getElementById('cert-modal');
  if (!modal) return;

  const holderName = document.getElementById('cert-holder-name');
  const co2Val = document.getElementById('cert-co2-val');
  const tokensVal = document.getElementById('cert-tokens-val');
  const biomeVal = document.getElementById('cert-biome-val');
  const dateVal = document.getElementById('cert-date-val');
  const hashVal = document.getElementById('cert-hash-val');

  const origin = tx?.origin || 'Indústria Sustentável S.A.';
  const co2 = tx?.co2 ? tx.co2.toFixed(1) : (tx?.amount ? tx.amount.toFixed(1) : '300.0');
  const tokens = tx?.amount ? `${tx.amount.toLocaleString('pt-BR')} GAIA` : '300 GAIA';
  const bioma = tx?.metadata?.bioma || 'Amazônia (Fator 1.20x)';
  const date = block ? new Date(block.timestamp).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR');
  const hash = tx?.id || block?.hash || ('0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join(''));

  if (holderName) holderName.textContent = origin;
  if (co2Val) co2Val.textContent = `${co2} tCO₂e`;
  if (tokensVal) tokensVal.textContent = tokens;
  if (biomeVal) biomeVal.textContent = bioma;
  if (dateVal) dateVal.textContent = date;
  if (hashVal) hashVal.textContent = hash;

  modal.classList.remove('hidden');
  log(`Certificado Verde emitido on-chain para ${origin}`, 'success');
}

function openCertModalForBlock(index) {
  const block = blockchain.chain[index];
  if (!block) return;
  const queimaTx = block.transactions.find(t => t.type === 'queima') || block.transactions[0];
  openCertModal(queimaTx, block);
}

function closeCertModal() {
  const modal = document.getElementById('cert-modal');
  if (modal) modal.classList.add('hidden');
}

// ─── Governança Quadrática ────────────────────────────────
function voteQuadratic(proposalId, side, delta) {
  const p = PROPOSALS.find(item => item.id === proposalId);
  if (!p) return;
  p.userVotesYes = p.userVotesYes || 0;
  p.userVotesNo = p.userVotesNo || 0;

  if (side === 'yes') {
    if (delta > 0) {
      const cost = 2 * p.userVotesYes + 1;
      if (voiceBudget < cost) {
        showToast(`⚠️ Créditos de voz insuficientes! Custo: ${cost}, você tem: ${voiceBudget}`, 'warn');
        return;
      }
      voiceBudget -= cost;
      p.userVotesYes += 1;
      p.yes += 1;

      const tx = new BioTransaction({
        type: 'governanca',
        origin: WALLET_PROFILES[currentProfile]?.origin || nodes[0].name,
        destination: 'DAO-BioChain-Brasil',
        amount: 1,
        metadata: {
          proposta: p.id,
          tipo: 'voto_quadratico_favoravel',
          votos_acumulados: p.userVotesYes,
          creditos_gastos: cost
        }
      });
      blockchain.addTransaction(tx);
      renderMempool();
      showToast(`🗳️ +1 Voto Sim em "${p.title.slice(0, 25)}..."! Custo: ${cost} cr`, 'success');
      log(`DAO Votação Quadrática: +1 Voto SIM em ${p.id} (Custo: ${cost} cr, total Sim: ${p.userVotesYes})`, 'success');
    } else if (delta < 0) {
      if (p.userVotesYes <= 0) return;
      const refund = 2 * p.userVotesYes - 1;
      voiceBudget += refund;
      p.userVotesYes -= 1;
      p.yes = Math.max(0, p.yes - 1);

      showToast(`↩️ Voto Sim retirado. ${refund} créditos devolvidos.`, 'info');
      log(`DAO Votação Quadrática: -1 Voto SIM em ${p.id} (Reembolso: ${refund} cr)`, 'info');
    }
  } else if (side === 'no') {
    if (delta > 0) {
      const cost = 2 * p.userVotesNo + 1;
      if (voiceBudget < cost) {
        showToast(`⚠️ Créditos de voz insuficientes! Custo: ${cost}, você tem: ${voiceBudget}`, 'warn');
        return;
      }
      voiceBudget -= cost;
      p.userVotesNo += 1;
      p.no += 1;

      const tx = new BioTransaction({
        type: 'governanca',
        origin: WALLET_PROFILES[currentProfile]?.origin || nodes[0].name,
        destination: 'DAO-BioChain-Brasil',
        amount: 1,
        metadata: {
          proposta: p.id,
          tipo: 'voto_quadratico_contrario',
          votos_acumulados: p.userVotesNo,
          creditos_gastos: cost
        }
      });
      blockchain.addTransaction(tx);
      renderMempool();
      showToast(`🗳️ +1 Voto Não em "${p.title.slice(0, 25)}..."! Custo: ${cost} cr`, 'success');
      log(`DAO Votação Quadrática: +1 Voto NÃO em ${p.id} (Custo: ${cost} cr, total Não: ${p.userVotesNo})`, 'success');
    } else if (delta < 0) {
      if (p.userVotesNo <= 0) return;
      const refund = 2 * p.userVotesNo - 1;
      voiceBudget += refund;
      p.userVotesNo -= 1;
      p.no = Math.max(0, p.no - 1);

      showToast(`↩️ Voto Não retirado. ${refund} créditos devolvidos.`, 'info');
      log(`DAO Votação Quadrática: -1 Voto NÃO em ${p.id} (Reembolso: ${refund} cr)`, 'info');
    }
  }

  renderGovernance();
}

// ─── Adversarial Red Team Stress Test ──────────────
function runStressTest(scenarioKey) {
  const resultBox = document.getElementById('redteam-result-box');

  if (scenarioKey === 'price_crash') {
    const crashPrice = 1.20; // -80%
    const tokensFamilia = 135;
    const valorMercado = tokensFamilia * crashPrice;
    const pisoLegal = 810.50;
    const gapFiscal = pisoLegal - valorMercado;

    if (resultBox) {
      resultBox.className = 'redteam-result-box active';
      resultBox.innerHTML = `
        <div class="redteam-result-title" style="color: var(--gold);">
          <span>🛡️</span> Cenário A: Queda de 80% na Cotação do GAIA — Backstop Ativado
        </div>
        <div class="redteam-result-body">
          O preço de mercado secundário do GAIA caiu para <b>R$ 1,20</b>. A liquidação privada geraria apenas <b>R$ ${valorMercado.toLocaleString('pt-BR', {minimumFractionDigits:2})}/mês</b> por família.
          O protocolo acionou automaticamente o <b>Fundo Nacional sobre Mudança do Clima (FNMC) / STN</b> como backstop soberano, cobrindo o gap fiscal de <b>R$ ${gapFiscal.toLocaleString('pt-BR', {minimumFractionDigits:2})}</b> por família guardiã e garantindo o piso legal de <b>R$ 810,50</b>.
        </div>
        <div class="redteam-result-metrics">
          <div class="redteam-metric-item">Preço do GAIA: <div class="redteam-metric-val" style="color:var(--red);">R$ 1,20 (-80%)</div></div>
          <div class="redteam-metric-item">Repasse Família: <div class="redteam-metric-val" style="color:var(--green);">R$ 810,50 (Piso Preservado)</div></div>
          <div class="redteam-metric-item">Subsídio Backstop FNMC: <div class="redteam-metric-val" style="color:var(--gold);">R$ ${gapFiscal.toLocaleString('pt-BR', {minimumFractionDigits:2})}/fam</div></div>
          <div class="redteam-metric-item">Taxa de Desmate: <div class="redteam-metric-val" style="color:var(--teal);">Inalterada (0,00%)</div></div>
        </div>
      `;
    }
    showToast(`🛡️ Teste A: Preço do GAIA caiu 80%. Piso legal R$ 810,50 assegurado via Backstop FNMC/STN!`, 'warn');
    log(`RED TEAM TEST A: Colapso de -80% mitigado. Gap fiscal de R$ ${gapFiscal.toFixed(2)}/família coberto pelo Tesouro/Fundo Clima.`, 'warn');
  } 
  else if (scenarioKey === 'oracle_spoof') {
    const pPosterior = 84.1; // Reconciliação P(E|D)
    const thetaStar = 97.5; // Limiar de perda assimétrica
    // Aplica slashing de 20% no nó suspeito
    const rogueNode = nodes.find(n => n.name.includes('Cerrado')) || nodes[1] || nodes[0];
    const prevStake = rogueNode.stake || 2000;
    rogueNode.stake = Math.round(prevStake * 0.80);
    renderNodes();

    if (resultBox) {
      resultBox.className = 'redteam-result-box active';
      resultBox.innerHTML = `
        <div class="redteam-result-title" style="color: var(--red);">
          <span>🚨</span> Cenário B: Tentativa de Fraude Oracular — Reconciliação Bayesiana & Slashing
        </div>
        <div class="redteam-result-body">
          Um sensor IoT terrestre comprometido enviou telemetria de biomassa inflada em 300%. A reconciliação bayesiana multimodal com satélite CBERS-4A e laudo comunitário resultou em <b>P(E|D) = ${pPosterior}%</b>, abaixo do limiar ótimo de decisão <b>θ* ≥ ${thetaStar}%</b>.
          A transação foi rejeitada em consenso e o nó <b>${rogueNode.name}</b> sofreu <b>Slashing contratual de 20%</b> do seu stake.
        </div>
        <div class="redteam-result-metrics">
          <div class="redteam-metric-item">P(E|D) Reconciliado: <div class="redteam-metric-val" style="color:var(--red);">${pPosterior}% < ${thetaStar}%</div></div>
          <div class="redteam-metric-item">Veredito do Consenso: <div class="redteam-metric-val" style="color:var(--red);">REJEITADO</div></div>
          <div class="redteam-metric-item">Nó Penalizado: <div class="redteam-metric-val" style="color:var(--gold);">${rogueNode.name}</div></div>
          <div class="redteam-metric-item">Slashing de Stake: <div class="redteam-metric-val" style="color:var(--red);">-20% (${prevStake} → ${rogueNode.stake})</div></div>
        </div>
      `;
    }
    showToast(`🚨 Teste B: Laudo fraudulento detectado! P(E|D)=${pPosterior}% < ${thetaStar}%. Slashing de 20% aplicado a ${rogueNode.name}!`, 'error');
    log(`RED TEAM TEST B: Rejeição bayesiana (θ* ≥ 97,5%). Slashing de 20% aplicado ao nó ${rogueNode.name} (${prevStake} → ${rogueNode.stake}).`, 'error');
  } 
  else if (scenarioKey === 'collusion_30') {
    const nominalPower = 30.0;
    const effectivePower = 24.3; // Com dispersão institucional de nós federados e peso geográfico
    const bftQuorum = 66.7;

    if (resultBox) {
      resultBox.className = 'redteam-result-box active';
      resultBox.innerHTML = `
        <div class="redteam-result-title" style="color: var(--teal);">
          <span>🛡️</span> Cenário C: Tentativa de Colusão de 30% — VRF Sublinear e Quórum BFT
        </div>
        <div class="redteam-result-body">
          Um consórcio malicioso coordenou 30% dos nós validadores para tentar censurar queimas de tokens. Devido à <b>VRF sublinear (ϕ = 0,85)</b> combinada com o credenciamento geográfico descentralizado, a probabilidade efetiva de proposição caiu para <b>${effectivePower}%</b>.
          Como a finalização BFT exige estritamente <b>2/3 dos votos válidos (≥ ${bftQuorum}%)</b>, nenhum bloco censurado atingiu quórum de commit. O ataque foi neutralizado sem necessidade de hard fork.
        </div>
        <div class="redteam-result-metrics">
          <div class="redteam-metric-item">Poder Nominal do Cartel: <div class="redteam-metric-val" style="color:var(--red);">${nominalPower}%</div></div>
          <div class="redteam-metric-item">Poder Efetivo VRF (ϕ=0.85): <div class="redteam-metric-val" style="color:var(--gold);">${effectivePower}%</div></div>
          <div class="redteam-metric-item">Quórum BFT Exigido: <div class="redteam-metric-val" style="color:var(--green);">${bftQuorum}% (2/3)</div></div>
          <div class="redteam-metric-item">Integridade da Rede: <div class="redteam-metric-val" style="color:var(--teal);">100% Preservada</div></div>
        </div>
      `;
    }
    showToast(`🛡️ Teste C: Cartel de 30% neutralizado! VRF sublinear e quórum BFT (66,7%) impediram blocos ilegítimos.`, 'success');
    log(`RED TEAM TEST C: 30% de nós coludidos contidos pela VRF sublinear (ϕ = 0,85) e quórum BFT de 2/3.`, 'success');
  } 
  else if (scenarioKey === 'wildfire') {
    if (resultBox) {
      resultBox.className = 'redteam-result-box active';
      resultBox.innerHTML = `
        <div class="redteam-result-title" style="color: var(--gold);">
          <span>🔥</span> Cenário D: Incêndio Florestal Catastrófico — Protocolo Eco-Emergencial
        </div>
        <div class="redteam-result-body">
          O sistema de sensoriamento orbital (INPE BDQueimadas) detectou anomalia térmica crítica em 4.200 hectares sob custódia.
          A máquina de estados dos tokens GAIA vinculados ao polígono transitou instantaneamente de <b>Active</b> para <b>Suspended</b>.
          As famílias guardiãs <b>não sofreram penalização financeira</b> pelo choque fortuito: o <b>Fundo Emergencial Climático</b> foi disparado com repasse de auxílio-calamidade (+20%), e equipes brigadistas foram acionadas.
        </div>
        <div class="redteam-result-metrics">
          <div class="redteam-metric-item">Área Afetada: <div class="redteam-metric-val" style="color:var(--red);">4.200 ha</div></div>
          <div class="redteam-metric-item">Status dos Tokens: <div class="redteam-metric-val" style="color:var(--gold);">Suspended</div></div>
          <div class="redteam-metric-item">Proteção às Famílias: <div class="redteam-metric-val" style="color:var(--green);">Garantida (Sem Corte RBE)</div></div>
          <div class="redteam-metric-item">Fundo Emergencial: <div class="redteam-metric-val" style="color:var(--teal);">Acionado (+20% Ajuda)</div></div>
        </div>
      `;
    }
    showToast(`🔥 Teste D: Incêndio detectado! Ativos congelados como Suspended e Fundo Emergencial ativado sem corte de renda.`, 'warn');
    log(`RED TEAM TEST D: Evento fortuito no bioma. Tokens em quarentena (Suspended) e auxílio-calamidade despachado.`, 'warn');
  }
}

// ─── Glossário de Conceitos ───────────────────────────────
function openGlossaryModal() {
  const modal = document.getElementById('glossary-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeGlossaryModal() {
  const modal = document.getElementById('glossary-modal');
  if (modal) modal.classList.add('hidden');
}

// ─── Log & Toast ──────────────────────────────────────────
function log(msg, type = 'info') {
  const logEl = document.getElementById('event-log');
  if (!logEl) return;
  const now = new Date().toLocaleTimeString('pt-BR');
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.innerHTML = `<span class="log-time">${esc(now)}</span><span class="log-msg ${esc(type)}">${esc(msg)}</span>`;
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
