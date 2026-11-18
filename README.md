# nezuko-voip

`nezuko-voip` متوافقة الآن مع محرك المكالمات الحقيقي داخل [`nezuko-baileys`](https://github.com/mzml-gg/nezuko-baileys)، وليست adapter لـ Baileys الرسمي.

```bash
npm install github:mzml-gg/nezuko-baileys github:mzml-gg/nezuko-voip
```

للمكالمات الفعلية استخدم `makeVoipClient` من `nezuko-baileys/voip` أو `createVoip` من هذه الحزمة.

---

# nezuko-voip

مكتبة ESM صغيرة تعمل مع **`@whiskeysockets/baileys` الرسمي**. توفر adapter منظم لأحداث مكالمات WhatsApp الواردة، معرفة بيانات المكالمة، ورفضها من خلال `sock.rejectCall()`.

## مهم جداً

Baileys الرسمي لا يوفّر حالياً public VoIP media engine لإجراء مكالمات صوتية/فيديو صادرة أو للرد على المكالمات وإدارة الصوت والفيديو. لذلك لا تدّعي هذه المكتبة تنفيذ هذه الوظائف. الدوال غير المتاحة ترمي خطأ واضحاً بدلاً من إرسال طلبات غير صحيحة إلى WhatsApp.

إذا كنت تحتاج مكالمات صادرة أو تشغيل ملفات صوت/فيديو داخل المكالمة، فهذا يتطلب fork يضيف طبقة VoIP مثل `@hiroosy/baileys-lite`، وليس `@whiskeysockets/baileys` الرسمي.

## التثبيت

```bash
npm install nezuko-voip @whiskeysockets/baileys
```

يتطلب الإصدار الحالي من Baileys الرسمي Node.js `>=20`.

## استيراد ESM

```js
import NezukoVoip, {
  createVoip,
  createNezukoVoip,
  toJid
} from 'nezuko-voip';
```

## استقبال المكالمات ورفضها

```js
import makeWASocket, { useMultiFileAuthState } from '@whiskeysockets/baileys';
import { createVoip } from 'nezuko-voip';

const { state, saveCreds } = await useMultiFileAuthState('./session');
const sock = makeWASocket({ auth: state, printQRInTerminal: true });
sock.ev.on('creds.update', saveCreds);

const voip = createVoip(sock);
voip.onIncoming(async (call) => {
  console.log({ id: call.callId, from: call.from, video: call.isVideo });
  await voip.reject(call.callId, call.from);
});

await voip.listen();
```

يوجد مثال كامل في [`examples/basic.js`](./examples/basic.js).

## الدوال المتاحة

- `createVoip(sock)` و`createNezukoVoip(sock)` لإنشاء adapter.
- `listen()` للتوافق مع نمط التشغيل غير المتزامن، وتعيد نفس الكائن.
- `onIncoming(listener)` للاستماع لأحداث المكالمات الواردة وإلغاء الاستماع بالدالة المعادة.
- `incoming()` للحصول على المكالمات الواردة الموجودة في الذاكرة.
- `reject(callId, callFrom)` أو `rejectCall(callId, callFrom)` لرفض مكالمة باستخدام API الرسمي.
- `info(callId)` و`activeCalls()` للاستعلام عن المكالمات الموجودة.
- `close()` لإزالة مستمع الأحداث وتنظيف الذاكرة.

## التحقق

```bash
npm test
npm run smoke
```

## License

MIT — © 2026 mzml-gg
