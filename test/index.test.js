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

test('constructor validates the socket', () => {
  assert.throws(() => createVoip(null), /Baileys socket with ev/);
});

test('incoming call events can be observed and rejected', async () => {
  const listeners = new Map();
  const rejected = [];
  const sock = {
    ev: {
      on(name, listener) { listeners.set(name, listener); },
      off(name) { listeners.delete(name); }
    },
    async rejectCall(id, from) { rejected.push({ id, from }); }
  };
  const voip = createVoip(sock);
  let received;
  voip.onIncoming((call) => { received = call; });
  listeners.get('call')([{ id: 'abc', from: '201000000000@s.whatsapp.net', status: 'offer', isVideo: false }]);
  assert.equal(received.callId, 'abc');
  await voip.reject('abc');
  assert.deepEqual(rejected, [{ id: 'abc', from: '201000000000@s.whatsapp.net' }]);
  voip.close();
});
