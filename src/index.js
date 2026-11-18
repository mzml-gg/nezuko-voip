import { EventEmitter } from 'node:events';
import { makeVoipClient, VoipClient, ActiveCall } from '@whiskeysockets/baileys/voip';

export { VoipClient, ActiveCall, makeVoipClient } from '@whiskeysockets/baileys/voip';

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

const VIDEO_EXTENSIONS = /\.(mp4|mov|webm|mkv|avi|m4v|3gp)(?:\?|#|$)/i;

function mediaOptions(media, options = {}) {
  if (media && typeof media === 'object' && !Array.isArray(media)) {
    return { ...media, ...options };
  }
  const items = Array.isArray(media) ? media.filter(Boolean) : [media ?? 'silence'];
  const first = items[0] ?? 'silence';
  const result = { ...options };
  if (items.length > 1) result.playlist = items;
  else if (VIDEO_EXTENSIONS.test(String(first))) {
    result.video = true;
    result.videoSource = first;
  } else {
    result.audioSource = first;
  }
  return result;
}

/**
 * High-level compatibility facade backed by the Nezuko VoIP fork installed
 * under the canonical @whiskeysockets/baileys package path.
 */
export class NezukoVoip extends EventEmitter {
  #client = null;
  #connecting = null;

  constructor(sock, options = {}) {
    super();
    if (!sock || typeof sock !== 'object') {
      throw new TypeError('NezukoVoip requires a connected @whiskeysockets/baileys socket.');
    }
    this.sock = sock;
    this.options = { ...options };
  }

  get raw() { return this.#client; }
  get calls() { return this.#client?._activeCall ? [this.#client._activeCall] : []; }
  get coordinator() { return this.#client; }

  async listen() {
    if (!this.#client) {
      if (!this.#connecting) {
        this.#connecting = makeVoipClient(this.sock, this.options).then((client) => {
          this.#client = client;
          return client;
        }).finally(() => { this.#connecting = null; });
      }
      await this.#connecting;
    }
    return this;
  }

  async #ready() {
    await this.listen();
    return this.#client;
  }

  async call(target, media = 'silence', resolution, options = {}) {
    const client = await this.#ready();
    const call = await client.call(String(target).replace(/\D/g, ''), mediaOptions(media, options));
    this.emit('call', call);
    return call;
  }

  async callMany(targets, media = 'silence', resolution, options = {}) {
    const list = normalizeTargets(targets);
    const settled = await Promise.allSettled(list.map((jid) => this.call(jid, media, resolution, options)));
    return settled.map((result, index) => result.status === 'fulfilled'
      ? { jid: list[index], call: result.value }
      : { jid: list[index], error: result.reason });
  }

  async groupCall(groupJid, media = 'silence', resolution, options = {}) {
    const client = await this.#ready();
    const jid = String(groupJid).includes('@') ? String(groupJid) : `${groupJid}@g.us`;
    return client.callGroup(jid, mediaOptions(media, options));
  }

  async accept(isMicEnabled = true) {
    const client = await this.#ready();
    return client.acceptCall(isMicEnabled);
  }

  async acceptCall(isMicEnabled = true) { return this.accept(isMicEnabled); }
  async hangup() { const client = await this.#ready(); return client._activeCall?.end(); }
  async end() { return this.hangup(); }

  activeCalls() {
    const call = this.#client?._activeCall;
    return call ? [{ id: call.callId, state: call.state, ended: false }] : [];
  }

  info() {
    const call = this.#client?._activeCall;
    return call ? { id: call.callId, state: call.state, isVideo: call.isVideo?.() ?? false } : null;
  }

  mute(value = true) { return this.#client?._activeCall?.mute(value); }
  play(source) { return this.#client?._activeCall?.play(source) ?? false; }
  enqueue(source) { return this.#client?._activeCall?.enqueue(source) ?? 0; }
  skip() { return this.#client?._activeCall?.skip() ?? false; }
  playVideo(source) { return this.#client?._activeCall?.playVideo(source) ?? false; }
  enqueueVideo(source) { return this.#client?._activeCall?.enqueueVideo(source) ?? 0; }
  skipVideo() { return this.#client?._activeCall?.skipVideo() ?? false; }
  disconnect() { this.#client?.disconnect(); this.#client = null; }
  close() { this.disconnect(); }
}

export function createVoip(sock, options = {}) { return new NezukoVoip(sock, options); }
export const createNezukoVoip = createVoip;
export default NezukoVoip;
