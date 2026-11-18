import { EventEmitter } from 'node:events';

export function toJid(value) {
  const raw = String(value ?? '').trim();
  if (!raw) throw new TypeError('A phone number or WhatsApp JID is required.');
  if (raw.includes('@')) return raw;
  const digits = raw.replace(/\D/g, '');
  if (!digits) throw new TypeError(`Invalid WhatsApp target: ${value}`);
  return `${digits}@s.whatsapp.net`;
}

export function normalizeTargets(targets) {
  const list = Array.isArray(targets) ? targets : [targets];
  return [...new Set(list.map(toJid))];
}

export const RESOLUTIONS = Object.freeze(['240p', '360p', '480p', '720p', '1080p']);

const UNSUPPORTED = 'The official @whiskeysockets/baileys package exposes call events and rejectCall(), but does not expose a public VoIP media engine for outgoing calls or answering calls.';

function unsupported(method) {
  throw new Error(`${method} is not available with @whiskeysockets/baileys. ${UNSUPPORTED}`);
}

function normalizeIncoming(call) {
  return {
    ...call,
    id: String(call.id),
    callId: String(call.id),
    jid: call.from,
    from: call.callerPn || call.from,
    canAccept: false,
    isVideo: Boolean(call.isVideo),
    isGroup: Boolean(call.isGroup)
  };
}

/**
 * Official-Baileys call adapter.
 *
 * It intentionally implements only APIs exposed by @whiskeysockets/baileys:
 * listening to `call` events and rejecting an incoming call.
 */
export class NezukoVoip extends EventEmitter {
  #offers = new Map();
  #listeners = new Set();
  #boundCall;

  constructor(sock) {
    super();
    if (!sock || typeof sock !== 'object' || !sock.ev?.on) {
      throw new TypeError('NezukoVoip requires a Baileys socket with ev.on().');
    }
    if (typeof sock.rejectCall !== 'function') {
      throw new TypeError('The provided socket does not expose rejectCall(). Use @whiskeysockets/baileys.');
    }
    this.sock = sock;
    this.#boundCall = (updates) => {
      for (const call of Array.isArray(updates) ? updates : [updates]) {
        if (!call?.id) continue;
        if (['reject', 'accept', 'timeout', 'terminate'].includes(call.status)) {
          this.#offers.delete(String(call.id));
        } else if (call.status === 'offer') {
          this.#offers.set(String(call.id), call);
        }
        const info = normalizeIncoming(call);
        this.emit('call', info);
        for (const listener of this.#listeners) listener(info);
      }
    };
    sock.ev.on('call', this.#boundCall);
  }

  get raw() {
    return this.sock;
  }

  get calls() {
    return this.activeCalls();
  }

  get coordinator() {
    return null;
  }

  async listen() {
    return this;
  }

  incoming() {
    return [...this.#offers.values()].map(normalizeIncoming).filter((call) => call.status === 'offer');
  }

  onIncoming(listener) {
    if (typeof listener !== 'function') throw new TypeError('listener must be a function.');
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  async reject(callId, callFrom) {
    const id = String(callId);
    const cached = this.#offers.get(id);
    const from = callFrom || cached?.from || cached?.callerPn;
    if (!from) {
      throw new TypeError('callFrom is required when the call is not present in the incoming-call cache.');
    }
    await this.sock.rejectCall(id, from);
    this.#offers.delete(id);
  }

  async rejectCall(callId, callFrom) {
    return this.reject(callId, callFrom);
  }

  async call() { return unsupported('call()'); }
  async callMany() { return unsupported('callMany()'); }
  async groupCall() { return unsupported('groupCall()'); }
  async accept() { return unsupported('accept()'); }
  async hangup() { return unsupported('hangup()'); }
  async createRoom() { return unsupported('createRoom()'); }
  async joinLink() { return unsupported('joinLink()'); }
  async previewLink() { return unsupported('previewLink()'); }
  mute() { return unsupported('mute()'); }
  silent() { return unsupported('silent()'); }
  react() { return unsupported('react()'); }
  hand() { return unsupported('hand()'); }
  add() { return unsupported('add()'); }
  link() { return unsupported('link()'); }

  activeCalls() {
    return this.incoming().map((call) => ({
      id: call.callId,
      kind: call.isGroup ? 'group' : 'direct',
      connected: false,
      ended: false,
      from: call.from,
      isVideo: call.isVideo
    }));
  }

  info(callId) {
    const call = this.#offers.get(String(callId));
    return call ? normalizeIncoming(call) : null;
  }

  async end() {
    return unsupported('end()');
  }

  close() {
    this.sock.ev.off?.('call', this.#boundCall);
    this.#listeners.clear();
    this.#offers.clear();
  }
}

export function createVoip(sock) {
  return new NezukoVoip(sock);
}

export const createNezukoVoip = createVoip;
export default NezukoVoip;
