import type { ActiveCall, VoipCallOptions, VoipClient, VoipClientOptions, VoipGroupCallOptions } from 'nezuko-baileys/voip';

export { ActiveCall, VoipClient, VoipCallOptions, VoipClientOptions, VoipGroupCallOptions };
export declare const makeVoipClient: (socket: object, config?: VoipClientOptions) => Promise<VoipClient>;

export declare function toJid(value: string | number): string;
export declare function normalizeTargets(targets: string | number | Array<string | number>): string[];
export declare const RESOLUTIONS: readonly ['240p', '360p', '480p', '720p', '1080p'];

export declare class NezukoVoip {
  constructor(sock: object, options?: VoipClientOptions);
  readonly sock: object;
  readonly options: VoipClientOptions;
  readonly raw: VoipClient | null;
  readonly calls: ActiveCall[];
  readonly coordinator: VoipClient | null;
  listen(): Promise<this>;
  call(target: string | number, media?: string | string[] | object, resolution?: unknown, options?: VoipCallOptions): Promise<ActiveCall>;
  callMany(targets: Array<string | number>, media?: string | string[] | object, resolution?: unknown, options?: VoipCallOptions): Promise<Array<{ jid: string; call?: ActiveCall; error?: unknown }>>;
  groupCall(groupJid: string, media?: string | string[] | object, resolution?: unknown, options?: VoipGroupCallOptions): Promise<ActiveCall>;
  accept(isMicEnabled?: boolean): Promise<unknown>;
  acceptCall(isMicEnabled?: boolean): Promise<unknown>;
  hangup(): Promise<unknown>;
  end(): Promise<unknown>;
  activeCalls(): Array<{ id: string; state: number; ended: boolean }>;
  info(): { id: string; state: number; isVideo: boolean } | null;
  mute(value?: boolean): unknown;
  play(source: string): boolean;
  enqueue(source: string | string[]): number;
  skip(): boolean;
  playVideo(source: string): boolean;
  enqueueVideo(source: string | string[]): number;
  skipVideo(): boolean;
  disconnect(): void;
  close(): void;
}

export declare function createVoip(sock: object, options?: VoipClientOptions): NezukoVoip;
export declare const createNezukoVoip: typeof createVoip;
export default NezukoVoip;
