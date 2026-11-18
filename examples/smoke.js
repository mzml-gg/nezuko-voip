import { createVoip, createNezukoVoip, normalizeTargets, toJid, RESOLUTIONS } from '../src/index.js';

console.log({
  toJid: toJid('201000000000'),
  targets: normalizeTargets(['201000000000', '201000000000']),
  resolutions: RESOLUTIONS,
  aliasesMatch: createVoip === createNezukoVoip,
  factoryType: typeof createVoip
});
