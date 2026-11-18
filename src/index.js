import { EventEmitter } from 'node:events';
import { Voip as BaileysVoip } from '@hiroosy/baileys-lite/voip';

/**
 * Convert a phone number or WhatsApp JID into a bare WhatsApp user JID.
 * Existing JIDs are preserved, including group JIDs and LIDs.
 */
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

/**
 * High-level VoIP facade for a connected @hiroosy/baileys-lite socket.
 * The socket must be created and authenticated by the application.
 */
export class NezukoVoip extends EventEmitter {
  #voip;
  #incomingUnsubscribe = null;

  constructor(sock, options = {}) {
    super();
    if (!sock || typeof sock !== 'object') {
      throw new TypeError('NezukoVoip requires a connected Baileys socket.');
    }
    this.sock = sock;
    this.options = { ...options };
    this.#voip = new BaileysVoip(sock, options);
  }

  get raw() {
    return this.#voip;
  }

  get calls() {
    return this.#voip.calls;
  }

  get coordinator() {
    return this.#voip.coordinator;
  }

  async listen() {
    await this.#voip.listen();
    return this;
  }

  async call(target, media = 'silence', resolution, options = {}) {
    return this.#voip.call(toJid(target), media, resolution, options);
  }

  async callMany(targets, media = 'silence', resolution, options = {}) {
    return this.#voip.callMany(normalizeTargets(targets), media, resolution, options);
  }

  async groupCall(targets, media = 'silence', resolution, options = {}) {
    return this.#voip.groupCall(normalizeTargets(targets), media, resolution, options);
  }

  incoming() {
    return this.#voip.incoming();
  }

  onIncoming(listener) {
    if (typeof listener !== 'function') throw new TypeError('listener must be a function.');
    const unsubscribe = this.#voip.onIncoming((info) => listener(info));
    this.#incomingUnsubscribe = unsubscribe;
    return unsubscribe;
  }

  async accept(callId, media = 'silence', resolution, options = {}) {
    return this.#voip.accept(callId, media, resolution, options);
  }

  async reject(callId, reason) {
    return this.#voip.reject(callId, reason);
  }

  async hangup(callId) {
    return this.#voip.hangup(callId);
  }

  async createRoom(media = 'silence', resolution, options = {}) {
    return this.#voip.createRoom(media, resolution, options);
  }

  async joinLink(link, media = 'silence', resolution, options = {}) {
    return this.#voip.joinLink(link, media, resolution, options);
  }

  async previewLink(link, options = {}) {
    return this.#voip.previewLink(link, options);
  }

  activeCalls() {
    return this.#voip.activeCalls();
  }

  info(callId) {
    return this.#voip.info(callId);
  }

  mute(callId, value = true) {
    return this.#voip.mute(callId, value);
  }

  silent(callId, value) {
    return this.#voip.silent(callId, value);
  }

  react(callId, emoji) {
    return this.#voip.react(callId, emoji);
  }

  hand(callId, value = true) {
    return this.#voip.hand(callId, value);
  }

  add(callId, target) {
    return this.#voip.add(callId, toJid(target));
  }

  link(callId) {
    return this.#voip.link(callId);
  }

  async end(target = false) {
    return this.#voip.end(target);
  }

  close() {
    this.#incomingUnsubscribe?.();
    this.#incomingUnsubscribe = null;
  }
}

export function createVoip(sock, options = {}) {
  return new NezukoVoip(sock, options);
}

export const createNezukoVoip = createVoip;
export default NezukoVoip;
