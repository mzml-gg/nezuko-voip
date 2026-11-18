# nezuko-voip

مكتبة ESM جاهزة لإضافة مكالمات WhatsApp الصوتية والمرئية إلى بوتات Node.js، مبنية فوق `@hiroosy/baileys-lite` وتقدم API بسيطة ونظيفة.

> استخدمها فقط مع حسابك وبطريقة تحترم شروط WhatsApp. لا تستخدمها للإزعاج أو المكالمات الجماعية غير المرغوبة.

## المتطلبات

- Node.js `>=18.17.0`
- جلسة WhatsApp متصلة من `@hiroosy/baileys-lite`
- `ffmpeg` و`ffprobe` عند تشغيل ملفات الصوت/الفيديو (الصوت الصامت `silence` لا يحتاج ملفاً)

## التثبيت

```bash
npm install nezuko-voip @hiroosy/baileys-lite
```

## استيراد ESM

```js
import NezukoVoip, {
  createVoip,
  createNezukoVoip,
  toJid,
  normalizeTargets
} from 'nezuko-voip';
```

## تشغيل سريع

```js
import makeWASocket, { useMultiFileAuthState } from '@hiroosy/baileys-lite';
import { createVoip } from 'nezuko-voip';

const { state, saveCreds } = await useMultiFileAuthState('./session');
const sock = makeWASocket({ auth: state, printQRInTerminal: true });
sock.ev.on('creds.update', saveCreds);

const voip = createVoip(sock, { maxConcurrentCalls: 2 });
await voip.listen();

const call = await voip.call('201000000000', 'silence');
call.on('connected', () => console.log('تم الاتصال'));
call.on('ended', (reason) => console.log('انتهت المكالمة:', reason));
```

يوجد مثال كامل في [`examples/basic.js`](./examples/basic.js).

## الدوال الأساسية

- `call(target, media, resolution, options)` لإجراء مكالمة مباشرة. `media` يمكن أن يكون `silence` أو مسار ملف صوت/فيديو أو رابطاً.
- `callMany(targets, media, resolution, options)` للاتصال بعدة أرقام، ويعيد نتيجة مستقلة لكل هدف.
- `groupCall(targets, media, resolution, options)` لمكالمة جماعية.
- `onIncoming(listener)` للاستماع للمكالمات الواردة، مع `accept(callId, ...)` أو `reject(callId)`.
- `hangup(callId)` و`end()` لإنهاء المكالمات.
- `mute(callId)`, `silent(callId)`, `react(callId, emoji)`, `hand(callId)` للتحكم أثناء المكالمة.
- `createRoom()` و`joinLink()` لغرف مكالمات WhatsApp التي تعتمد على رابط.
- `activeCalls()`, `incoming()`, `info(callId)`, `link(callId)` للاستعلام.

## تشغيل المثال

```bash
cp examples/basic.js my-bot.js
node my-bot.js
```

أو استخدم ملفات المشروع مباشرة:

```bash
npm test
npm run smoke
```

## ملاحظات مهمة

المكتبة لا تنشئ جلسة WhatsApp من نفسها؛ مرّر لها socket متصل من Baileys. يجب حفظ `creds.update` حتى لا تفقد الجلسة. جودة الفيديو تقبل `240p` و`360p` و`480p` و`720p` و`1080p`، أو كائن `{ width, height, frameRate }`.

هذه الحزمة غلاف خفيف فوق واجهة VoIP المنشورة في `@hiroosy/baileys-lite`، وليست نسخاً لملفات داخلية من مشروع آخر. لذلك يمكن تحديث Baileys بشكل مستقل مع الحفاظ على API الخاصة بـ `nezuko-voip`.

## License

MIT — © 2026 mzml-gg
