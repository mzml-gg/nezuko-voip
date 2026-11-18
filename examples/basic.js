import makeWASocket, {
  useMultiFileAuthState
} from 'nezuko-baileys';
import { createVoip } from 'nezuko-voip';

const { state, saveCreds } = await useMultiFileAuthState('./session');
const sock = makeWASocket({
  auth: state,
  printQRInTerminal: true
});

sock.ev.on('creds.update', saveCreds);

sock.ev.on('connection.update', async ({ connection }) => {
  if (connection !== 'open') return;

  const voip = createVoip(sock, { debug: false });
  const call = await voip.call('201000000000', 'silence', undefined, {
    durationMs: 120000
  });

  call.on('connected', () => console.log('Call connected.'));
  call.on('ended', (reason) => console.log('Call ended:', reason));
});
