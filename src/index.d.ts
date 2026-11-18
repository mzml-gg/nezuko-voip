export type OfficialCall = {
  id: string;
  callId: string;
  from: string;
  jid: string;
  callerPn?: string;
  isVideo: boolean;
  isGroup: boolean;
  status: string;
  canAccept: false;
  [key: string]: unknown;
};

export declare function toJid(value: string | number): string;
export declare function normalizeTargets(targets: string | number | Array<string | number>): string[];
export declare const RESOLUTIONS: readonly ['240p', '360p', '480p', '720p', '1080p'];

export declare class NezukoVoip {
  constructor(sock: { ev: { on(event: string, listener: Function): unknown; off?: Function }; rejectCall(callId: string, callFrom: string): Promise<void> });
  readonly sock: object;
  readonly raw: object;
  readonly calls: object[];
  readonly coordinator: null;
  readonly activeCalls: object[];
  listen(): Promise<this>;
  incoming(): OfficialCall[];
  onIncoming(listener: (info: OfficialCall) => void): () => void;
  reject(callId: string, callFrom?: string): Promise<void>;
  rejectCall(callId: string, callFrom?: string): Promise<void>;
  info(callId: string): OfficialCall | null;
  close(): void;
  call(...args: unknown[]): Promise<never>;
  callMany(...args: unknown[]): Promise<never>;
  groupCall(...args: unknown[]): Promise<never>;
  accept(...args: unknown[]): Promise<never>;
  hangup(...args: unknown[]): Promise<never>;
}

export declare function createVoip(sock: ConstructorParameters<typeof NezukoVoip>[0]): NezukoVoip;
export declare const createNezukoVoip: typeof createVoip;
export default NezukoVoip;
