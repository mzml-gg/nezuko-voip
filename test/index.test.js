import test from 'node:test';
import assert from 'node:assert/strict';
import { createVoip, createNezukoVoip, normalizeTargets, toJid } from '../src/index.js';

test('toJid normalizes phone numbers and preserves JIDs', () => {
  assert.equal(toJid('+20 100 000 0000'), '201000000000@s.whatsapp.net');
  assert.equal(toJid('12345@s.whatsapp.net'), '12345@s.whatsapp.net');
});

test('normalizeTargets removes duplicates', () => {
  assert.deepEqual(normalizeTargets(['201000000000', '201000000000@s.whatsapp.net']), ['201000000000@s.whatsapp.net']);
});

test('factory aliases are exported', () => {
  assert.equal(createVoip, createNezukoVoip);
});

test('constructor validates the socket', async () => {
  assert.throws(() => createVoip(null), /connected Baileys socket/);
});
