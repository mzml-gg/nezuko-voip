import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState
} from '@hiroosy/baileys-lite';
import { createVoip } from 'nezuko-voip';

const { state, saveCreds } = await useMultiFileAuthState('./session');
const sock = makeWASocket({
  auth: state,
  printQRInTerminal: true
});

sock.ev.on('creds.update', saveCreds);

const voip = createVoip(sock, {
  maxConcurrentCalls: 2,
  voipLogLevel: 'warn'
});

voip.onIncoming(async (call) => {
  console.log(`Incoming ${call.isVideo ? 'video' : 'audio'} call from ${call.from}`);

  // Example policy: reject calls automatically.
  await voip.reject(call.callId);
  // To answer instead:
  // await voip.accept(call.callId, 'silence');
});

sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
  if (connection === 'open') console.log('WhatsApp connected.');
  if (connection === 'close') {
    const code = lastDisconnect?.error?.output?.statusCode;
    if (code !== DisconnectReason.loggedOut) {
      console.log('Connection closed; restart the process to reconnect.');
    }
  }
});

await voip.listen();

// Outgoing example:
// const activeCall = await voip.call('201000000000', 'silence');
// activeCall.on('connected', () => console.log('Call connected'));
// activeCall.on('ended', (reason) => console.log('Call ended:', reason));
