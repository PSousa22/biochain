// ═══════════════════════════════════════════════════════════
//  BioChain — Core Blockchain Engine
//  Tecnocracia Biocêntrica · Proof-of-Ecology Consensus
//  Federação de Biomas Nacionais do Brasil
// ═══════════════════════════════════════════════════════════

'use strict';

// ─── Cryptographic SHA-256 (Synchronous + WebCrypto fallback) ──
function sha256Sync(str) {
  function rightRotate(value, amount) { return (value >>> amount) | (value << (32 - amount)); }
  const mathPow = Math.pow, maxWord = mathPow(2, 32);
  let i, j, result = '';
  let words = [];
  const utf8 = unescape(encodeURIComponent(str));
  const asciiBitLength = utf8.length * 8;
  let hash = [], k = [], primeCounter = 0;
  const isComposite = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) isComposite[i] = candidate;
      hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1/3) * maxWord) | 0;
    }
  }
  let ascii = utf8 + '\x80';
  while (ascii.length % 64 - 56) ascii += '\x00';
  for (i = 0; i < ascii.length; i++) {
    j = ascii.charCodeAt(i);
    words[i >> 2] |= j << ((3 - i) % 4) * 8;
  }
  words[words.length] = ((asciiBitLength / maxWord) | 0);
  words[words.length] = (asciiBitLength) | 0;
  for (j = 0; j < words.length;) {
    const w = words.slice(j, j += 16);
    const oldHash = hash.slice(0);
    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15], w2 = w[i - 2];
      const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
      const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
      if (i >= 16) w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const S1 = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
      const S0 = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
      const t1 = (hash[7] + S1 + ch + k[i] + w[i]) | 0;
      const t2 = (S0 + maj) | 0;
      hash = [(t1 + t2) | 0, hash[0], hash[1], hash[2], (hash[3] + t1) | 0, hash[4], hash[5], hash[6]];
    }
    for (i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
  }
  for (i = 0; i < 8; i++) {
    for (let b = 3; b >= 0; b--) {
      const byte = (hash[i] >> (8 * b)) & 255;
      result += (byte < 16 ? '0' : '') + byte.toString(16);
    }
  }
  return result;
}

// ─── Simple SHA-256 via SubtleCrypto (async) ──────────────
async function sha256(message) {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      return sha256Sync(message);
    }
  }
  return sha256Sync(message);
}

// ─── Fatores de Estresse Ecológico por Bioma ──────────────
const BIOME_STRESS_FACTORS = {
  'Amazônia': 1.20,
  'Cerrado': 1.25,
  'Mata Atlântica': 1.40,
  'Pantanal': 1.35,
  'Caatinga': 1.30,
  'Pampa': 1.15,
  'Zona Costeira e Marinha': 1.25
};

// ─── Transaction ──────────────────────────────────────────
class BioTransaction {
  constructor({ id, timestamp, type, origin, destination, amount, area = 0, co2 = 0, metadata = {}, signature }) {
    this.id = id || crypto.randomUUID();
    this.timestamp = timestamp || Date.now();
    this.type = type;
    this.origin = origin;
    this.destination = destination;
    this.amount = Number(amount);
    this.area = Number(area);
    this.co2 = Number(co2);
    this.metadata = metadata || {};
    this.signature = signature || this._sign();
  }

  // Serialização canônica determinística cobrindo TODOS os campos (Seção 2.1)
  canonicalString() {
    return JSON.stringify({
      id: this.id,
      timestamp: this.timestamp,
      type: this.type,
      origin: this.origin,
      destination: this.destination,
      amount: Number(this.amount),
      area: Number(this.area),
      co2: Number(this.co2),
      metadata: this.metadata || {}
    }, Object.keys({ id: 1, timestamp: 1, type: 1, origin: 1, destination: 1, amount: 1, area: 1, co2: 1, metadata: 1 }).sort());
  }

  hash() {
    return sha256Sync(this.canonicalString());
  }

  _sign() {
    // Assinatura criptográfica determinística SHA-256 sobre payload canônico
    const digest = this.hash();
    return `SIG_BIOCHAIN_${digest.slice(0, 32)}`;
  }

  isValid() {
    // Validação estrita da assinatura e consistência de campos
    if (this.amount < 0 || isNaN(this.amount)) return false;
    const expected = `SIG_BIOCHAIN_${this.hash().slice(0, 32)}`;
    return this.signature === expected;
  }

  // Score de impacto ecológico com salvaguarda contra Goodhart (Seção 2.3)
  ecologicalWeight() {
    const weights = {
      floresta: 10, rio: 8, biodiversidade: 9,
      carbono: 7, solo: 6, governanca: 4, renda: 5, queima: 8
    };
    const base = weights[this.type] || 3;
    const biome = this.metadata?.bioma || 'Amazônia';
    const multiplier = BIOME_STRESS_FACTORS[biome] || 1.0;

    // Mitigação da Lei de Goodhart: valores autodeclarados são delimitados por oráculos
    const isAttested = Boolean(this.metadata?.sensor || this.metadata?.oraculo || this.metadata?.canal);
    const safeCo2 = Math.min(Math.max(0, this.co2), 500);
    const safeArea = Math.min(Math.max(0, this.area), 1000);
    const trustFactor = isAttested ? 1.0 : 0.5;

    return +(Math.min(100, (base + (safeCo2 * 0.04) + (safeArea * 0.02)) * multiplier * trustFactor)).toFixed(2);
  }

  toObject() {
    return {
      id: this.id, timestamp: this.timestamp, type: this.type,
      origin: this.origin, destination: this.destination,
      amount: this.amount, area: this.area, co2: this.co2,
      metadata: this.metadata, signature: this.signature,
      hash: this.hash()
    };
  }
}

// ─── Block ───────────────────────────────────────────────
class BioBlock {
  constructor({ index, transactions, previousHash, validator, difficulty = 3 }) {
    this.index = index;
    this.timestamp = Date.now();
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.validator = validator;
    this.difficulty = difficulty;
    this.nonce = 0;
    this.ecologicalScore = this._computeEcoScore();
    this.merkleRoot = this._computeMerkleRoot();
    this.hash = '';
  }

  _computeEcoScore() {
    if (!this.transactions.length) return 0;
    const total = this.transactions.reduce((s, tx) => s + tx.ecologicalWeight(), 0);
    return +(total / this.transactions.length).toFixed(2);
  }

  _computeMerkleRoot() {
    if (!this.transactions.length) return '0'.repeat(64);
    // Árvore Merkle criptográfica SHA-256 sobre todas as folhas canônicas (Seção 2.1)
    let level = this.transactions.map(tx =>
      typeof tx.hash === 'function' ? tx.hash() : sha256Sync(JSON.stringify(tx))
    );
    while (level.length > 1) {
      const next = [];
      for (let i = 0; i < level.length; i += 2) {
        const left = level[i];
        const right = level[i + 1] || left;
        next.push(sha256Sync(left + right));
      }
      level = next;
    }
    return level[0];
  }

  dataString() {
    return JSON.stringify({
      index: this.index,
      timestamp: this.timestamp,
      previousHash: this.previousHash,
      merkleRoot: this.merkleRoot,
      nonce: this.nonce,
      ecologicalScore: this.ecologicalScore,
      validator: this.validator
    });
  }

  // Proof-of-Ecology: higher eco score → limited difficulty reduction (max 1 level to avoid Goodhart)
  effectiveDifficulty() {
    const reduction = Math.min(1, Math.floor(this.ecologicalScore / 50));
    return Math.max(1, this.difficulty - reduction);
  }

  async mine(onProgress) {
    const target = '0'.repeat(this.effectiveDifficulty());
    this.nonce = 0;
    let hash = '';
    while (!hash.startsWith(target)) {
      this.nonce++;
      hash = await sha256(this.dataString());
      if (this.nonce % 200 === 0 && onProgress) {
        onProgress(this.nonce, hash);
        await new Promise(r => setTimeout(r, 0));
      }
    }
    this.hash = hash;
    return hash;
  }

  isValid() {
    if (this.index === 0) return true;
    // 1. Verifica integridade e assinatura de cada transação individual
    for (const tx of this.transactions) {
      if (typeof tx.isValid === 'function' && !tx.isValid()) {
        return false;
      }
    }
    // 2. Recomputação estrita da raiz da Árvore de Merkle SHA-256
    const recomputed = this._computeMerkleRoot();
    if (recomputed !== this.merkleRoot) return false;
    // 3. Verificação do Proof-of-Ecology
    return this.hash.startsWith('0'.repeat(this.effectiveDifficulty()));
  }

  toObject() {
    return {
      index: this.index,
      timestamp: this.timestamp,
      hash: this.hash,
      previousHash: this.previousHash,
      merkleRoot: this.merkleRoot,
      nonce: this.nonce,
      difficulty: this.difficulty,
      effectiveDifficulty: this.effectiveDifficulty(),
      ecologicalScore: this.ecologicalScore,
      validator: this.validator,
      transactions: this.transactions.map(t => typeof t.toObject === 'function' ? t.toObject() : t)
    };
  }
}

// ─── Blockchain ───────────────────────────────────────────
class BioBlockchain {
  constructor() {
    this.chain = [];
    this.pendingTransactions = [];
    this.difficulty = 2;
    this.nodes = new Set();
    this.burnedTokens = 0;
    this.ready = this._initGenesis();
  }

  async _initGenesis() {
    const genesis = new BioBlock({
      index: 0,
      transactions: [],
      previousHash: '0'.repeat(64),
      validator: 'Genesis-BioChain-Brasil',
      difficulty: 1
    });
    genesis.hash = await sha256('GENESIS_BIOCENTRIC_TECHNOCRACY_BRASIL_2026');
    this.chain.push(genesis);
  }

  get latestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addTransaction(tx) {
    this.pendingTransactions.push(tx);
    return tx;
  }

  // VRF Sublinear Ponderada pelo Ecoscore: Pi = (Si * Fator)^phi / sum((Sk * Fator)^phi), com phi = 0.85 (Seção 2.3)
  selectValidatorVRF(candidateNodes, previousHash = null) {
    const prev = previousHash || (this.latestBlock ? this.latestBlock.hash : 'GENESIS');
    const phi = 0.85;
    const weights = candidateNodes.map(n => {
      const stress = BIOME_STRESS_FACTORS[n.biome] || 1.0;
      const effectiveStake = Math.max(1, n.stake);
      return {
        ...n,
        stress,
        weight: Math.pow(effectiveStake * stress, phi)
      };
    });
    const totalWeight = weights.reduce((s, n) => s + n.weight, 0);

    // Semente determinística e verificável da VRF baseada em hash da rodada
    const vrfSeed = sha256Sync(`${prev}|VRF_EPOCH_${this.chain.length}`);
    const draw = (parseInt(vrfSeed.slice(0, 8), 16) % 100000) / 100000;
    const target = draw * totalWeight;

    let cumulative = 0;
    let winner = weights[0];
    for (const item of weights) {
      cumulative += item.weight;
      if (target <= cumulative) {
        winner = item;
        break;
      }
    }
    return {
      validator: winner.name,
      node: winner,
      vrfProof: `VRF_0x${vrfSeed.slice(0, 16)}`,
      phi,
      draw: draw.toFixed(4)
    };
  }

  async mineBlock(validatorNode, onProgress) {
    if (this._mining) throw new Error('Mineração já em progresso');
    this._mining = true;

    const txIds = new Set(this.pendingTransactions.map(t => t.id));
    const txs = [...this.pendingTransactions];
    const block = new BioBlock({
      index: this.chain.length,
      transactions: txs,
      previousHash: this.latestBlock.hash,
      validator: validatorNode,
      difficulty: this.difficulty
    });

    await block.mine(onProgress);
    this.chain.push(block);

    // Contabiliza queima de tokens caso haja txs de compensação/aposentadoria
    txs.forEach(tx => {
      if (tx.type === 'queima') this.burnedTokens += tx.amount;
    });

    // Remove apenas as transações que foram incluídas (evita perda de txs adicionadas durante a mineração)
    this.pendingTransactions = this.pendingTransactions.filter(t => !txIds.has(t.id));
    this._mining = false;
    return block;
  }

  async validateChain() {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];

      // 1. Integridade da cadeia (linkagem hash anterior)
      if (current.previousHash !== previous.hash)
        return { valid: false, blockIndex: i, reason: 'Hash chain quebrada (previousHash não confere)' };

      // 2. Recomputação estrita do hash SHA-256 do cabeçalho
      const recomputedHash = await sha256(current.dataString());
      if (recomputedHash !== current.hash)
        return { valid: false, blockIndex: i, reason: 'Hash do bloco adulterado (dados internos divergentes)' };

      // 3. Validação das assinaturas e árvore Merkle
      if (!current.isValid())
        return { valid: false, blockIndex: i, reason: 'Merkle inválido ou assinatura de transação violada' };
    }
    return { valid: true };
  }

  // Contabilidade estrita de conservação de tokens (Seção 2.2)
  getLedgerState() {
    const balances = {};
    let totalIssued = 0;
    const retiredAssets = new Set();

    for (const block of this.chain) {
      for (const tx of block.transactions) {
        const amount = Number(tx.amount) || 0;
        if (amount <= 0) continue;

        if (tx.type === 'queima') {
          // Aposentadoria de ativos GAIA: debita da origem e registra aposentadoria definitiva
          balances[tx.origin] = (balances[tx.origin] || 0) - amount;
          retiredAssets.add(tx.id);
        } else if (
          tx.origin === '0x0000_MINT_GENESIS' ||
          tx.origin.startsWith('Fundo-Nacional') ||
          tx.origin.startsWith('Genesis-') ||
          tx.type === 'floresta'
        ) {
          // Emissão primária com lastro biofísico: gera novos tokens em circulação
          balances[tx.destination] = (balances[tx.destination] || 0) + amount;
          totalIssued += amount;
        } else {
          // Transferência / Liquidação peer-to-peer: CONSERVA SUPPLY
          balances[tx.origin] = (balances[tx.origin] || 0) - amount;
          balances[tx.destination] = (balances[tx.destination] || 0) + amount;
        }
      }
    }

    const circulatingSupply = Math.max(0, totalIssued - this.burnedTokens);
    return { balances, totalIssued, totalBurned: this.burnedTokens, circulatingSupply, retiredAssets };
  }

  getTotalTokens() {
    return this.getLedgerState().circulatingSupply;
  }

  getTotalBurned() {
    return this.burnedTokens;
  }

  getTotalCO2() {
    return this.chain.reduce((sum, b) =>
      sum + b.transactions.reduce((s, tx) => s + tx.co2, 0), 0);
  }

  getTotalArea() {
    return this.chain.reduce((sum, b) =>
      sum + b.transactions.reduce((s, tx) => s + tx.area, 0), 0);
  }

  getMetricsByType() {
    const acc = { floresta: 0, rio: 0, biodiversidade: 0, carbono: 0, solo: 0, governanca: 0, renda: 0, queima: 0 };
    this.chain.forEach(b => b.transactions.forEach(tx => {
      if (acc[tx.type] !== undefined) acc[tx.type] += tx.amount;
    }));
    return acc;
  }

  toJSON() {
    return JSON.stringify({ 
      chain: this.chain.map(b => b.toObject()), 
      burnedTokens: this.burnedTokens,
      ledger: this.getLedgerState(),
      timestamp: new Date().toISOString() 
    }, null, 2);
  }
}

// Export globals
window.BioTransaction = BioTransaction;
window.BioBlock = BioBlock;
window.BioBlockchain = BioBlockchain;
window.BIOME_STRESS_FACTORS = BIOME_STRESS_FACTORS;
