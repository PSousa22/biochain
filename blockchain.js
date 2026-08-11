// ═══════════════════════════════════════════════════════════
//  BioChain — Core Blockchain Engine
//  Tecnocracia Biocêntrica · Proof-of-Ecology Consensus
// ═══════════════════════════════════════════════════════════

'use strict';

// ─── Simple SHA-256 via SubtleCrypto (async) ──────────────
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ─── Transaction ──────────────────────────────────────────
class BioTransaction {
  constructor({ type, origin, destination, amount, area = 0, co2 = 0, metadata = {} }) {
    this.id = crypto.randomUUID();
    this.timestamp = Date.now();
    this.type = type;
    this.origin = origin;
    this.destination = destination;
    this.amount = Number(amount);
    this.area = Number(area);
    this.co2 = Number(co2);
    this.metadata = metadata;
    this.signature = this._sign();
  }

  _sign() {
    // Simplified deterministic "signature" for demo
    const payload = `${this.id}|${this.origin}|${this.destination}|${this.amount}`;
    return btoa(payload).slice(0, 32);
  }

  // Ecological impact score (0-100) — used in Proof-of-Ecology
  ecologicalWeight() {
    const weights = {
      floresta: 10, rio: 8, biodiversidade: 9,
      carbono: 7, solo: 6, governanca: 4, renda: 5
    };
    const base = weights[this.type] || 3;
    return base + (this.co2 * 0.05) + (this.area * 0.02);
  }

  toObject() {
    return {
      id: this.id, timestamp: this.timestamp, type: this.type,
      origin: this.origin, destination: this.destination,
      amount: this.amount, area: this.area, co2: this.co2,
      metadata: this.metadata, signature: this.signature
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
    // Simple concatenation-based merkle approximation
    const leaves = this.transactions.map(tx =>
      `${tx.id}|${tx.amount}|${tx.type}`
    );
    let level = leaves;
    while (level.length > 1) {
      const next = [];
      for (let i = 0; i < level.length; i += 2) {
        const left = level[i];
        const right = level[i + 1] || left;
        next.push(`${left}+${right}`);
      }
      level = next;
    }
    // Return a fixed-length hex-like string
    const raw = level[0];
    let h = 0;
    for (let i = 0; i < raw.length; i++) {
      h = ((h << 5) - h + raw.charCodeAt(i)) | 0;
    }
    return Math.abs(h).toString(16).padStart(8, '0').repeat(8);
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

  // Proof-of-Ecology: higher eco score → lower effective difficulty
  effectiveDifficulty() {
    const reduction = Math.min(2, Math.floor(this.ecologicalScore / 15));
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
        // Yield to UI
        await new Promise(r => setTimeout(r, 0));
      }
    }
    this.hash = hash;
    return hash;
  }

  isValid() {
    if (this.index === 0) return true;
    // Recompute merkle root
    const recomputed = this._computeMerkleRoot();
    return recomputed === this.merkleRoot && this.hash.startsWith('0'.repeat(this.effectiveDifficulty()));
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
      transactions: this.transactions.map(t => t.toObject())
    };
  }
}

// ─── Blockchain ───────────────────────────────────────────
class BioBlockchain {
  constructor() {
    this.chain = [];
    this.pendingTransactions = [];
    this.difficulty = 3;
    this.nodes = new Set();
    this._initGenesis();
  }

  async _initGenesis() {
    const genesis = new BioBlock({
      index: 0,
      transactions: [],
      previousHash: '0'.repeat(64),
      validator: 'Genesis-BioChain',
      difficulty: 1
    });
    genesis.hash = await sha256('GENESIS_BIOCENTRIC_TECHNOCRACY_2026');
    this.chain.push(genesis);
  }

  get latestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addTransaction(tx) {
    this.pendingTransactions.push(tx);
    return tx;
  }

  async mineBlock(validatorNode, onProgress) {
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
    this.pendingTransactions = [];
    return block;
  }

  validateChain() {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];
      if (current.previousHash !== previous.hash) return { valid: false, blockIndex: i, reason: 'Hash chain quebrada' };
      if (!current.isValid()) return { valid: false, blockIndex: i, reason: 'Bloco inválido' };
    }
    return { valid: true };
  }

  getTotalTokens() {
    return this.chain.reduce((sum, b) =>
      sum + b.transactions.reduce((s, tx) => s + tx.amount, 0), 0);
  }

  getTotalCO2() {
    return this.chain.reduce((sum, b) =>
      sum + b.transactions.reduce((s, tx) => s + tx.co2, 0), 0);
  }

  getMetricsByType() {
    const acc = { floresta: 0, rio: 0, biodiversidade: 0, carbono: 0, solo: 0, governanca: 0, renda: 0 };
    this.chain.forEach(b => b.transactions.forEach(tx => {
      if (acc[tx.type] !== undefined) acc[tx.type] += tx.amount;
    }));
    return acc;
  }

  toJSON() {
    return JSON.stringify({ chain: this.chain.map(b => b.toObject()), timestamp: new Date().toISOString() }, null, 2);
  }
}

// Export globals
window.BioTransaction = BioTransaction;
window.BioBlock = BioBlock;
window.BioBlockchain = BioBlockchain;
