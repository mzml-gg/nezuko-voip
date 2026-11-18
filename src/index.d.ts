export type MediaSource = string | URL | { source: string; kind?: 'audio' | 'video' };
export type Resolution = '240p' | '360p' | '480p' | '720p' | '1080p' | { width: number; height: number; frameRate?: number };
export type VoipOptions = { maxConcurrentCalls?: number; voipLogLevel?: string; level?: string; ffprobePath?: string; tmpDir?: string };
export type CallOptions = { loop?: boolean; autoEndCall?: boolean; autoDowngrade?: boolean; safetyMs?: number; startVideoOnFirst?: boolean };
export type IncomingCall = { id: string; callId: string; from: string; jid: string; creator?: string; isVideo: boolean; isGroup: boolean; canAccept: boolean; info: unknown };

export declare function toJid(value: string | number): string;
export declare function normalizeTargets(targets: string | number | Array<string | number>): string[];
export declare const RESOLUTIONS: readonly ['240p', '360p', '480p', '720p', '1080p'];

export declare class NezukoVoip {
  constructor(sock: object, options?: VoipOptions);
  readonly sock: object;
  readonly options: VoipOptions;
  readonly raw: object;
  readonly calls: object[];
  readonly coordinator: object | null;
  listen(): Promise<this>;
  call(target: string | number, media?: MediaSource | MediaSource[], resolution?: Resolution, options?: CallOptions): Promise<object>;
  callMany(targets: Array<string | number>, media?: MediaSource | MediaSource[], resolution?: Resolution, options?: CallOptions): Promise<object[]>;
  groupCall(targets: Array<string | number>, media?: MediaSource | MediaSource[], resolution?: Resolution, options?: CallOptions): Promise<object>;
  incoming(): IncomingCall[];
  onIncoming(listener: (info: IncomingCall) => void): () => void;
  accept(callId: string, media?: MediaSource | MediaSource[], resolution?: Resolution, options?: CallOptions): Promise<object>;
  reject(callId: string, reason?: unknown): Promise<unknown>;
  hangup(callId: string): Promise<unknown>;
  createRoom(media?: MediaSource | MediaSource[], resolution?: Resolution, options?: CallOptions): Promise<object>;
  joinLink(link: string, media?: MediaSource | MediaSource[], resolution?: Resolution, options?: CallOptions): Promise<object>;
  previewLink(link: string, options?: { isVideo?: boolean }): Promise<object>;
  activeCalls(): object[];
  info(callId: string): object | null;
  mute(callId: string, value?: boolean): Promise<unknown>;
  silent(callId: string, value?: boolean): Promise<unknown>;
  react(callId: string, emoji: string): Promise<unknown>;
  hand(callId: string, value?: boolean): Promise<unknown>;
  add(callId: string, target: string | number): Promise<unknown>;
  link(callId: string): string | null;
  end(target?: string | boolean): Promise<unknown>;
  close(): void;
}

export declare function createVoip(sock: object, options?: VoipOptions): NezukoVoip;
export declare const createNezukoVoip: typeof createVoip;
export default NezukoVoip;
