import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState
} from '@whiskeysockets/baileys';
import { createVoip } from 'nezuko-voip';

const { state, saveCreds } = await useMultiFileAuthState('./session');
const sock = makeWASocket({
  auth: state,
  printQRInTerminal: true
});

sock.ev.on('creds.update', saveCreds);

const voip = createVoip(sock);
voip.onIncoming(async (call) => {
  console.log(`Incoming ${call.isVideo ? 'video' : 'audio'} call from ${call.from}`);
  await voip.reject(call.callId, call.from);
});

sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
  if (connection === 'open') console.log('WhatsApp connected.');
  if (connection === 'close') {
    const code = lastDisconnect?.error?.output?.statusCode;
    if (code !== DisconnectReason.loggedOut) console.log('Connection closed.');
  }
});

await voip.listen();
