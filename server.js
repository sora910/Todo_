const express = require('express');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// VAPID鍵（上で生成したものに置き換えてください）
const publicVapidKey = 'BBRhgYSInMmB65rT63gL-87R26Ta-Zp0a5WgFeOp1Qz3hYu-3NUVcj06W9cgSpMfDrwh7fwPC4hh4Ha1V9Mi07A';
const privateVapidKey = 'QScxNqAxCeHWWvq05eCU3UDbRBWy3G_AU5G2WMn-gM4';

webpush.setVapidDetails(
  'mailto:you@example.com',
  publicVapidKey,
  privateVapidKey
);

// POST /subscribe → 通知を送信
app.post('/subscribe', (req, res) => {
  const subscription = req.body;

  const payload = JSON.stringify({
    title: 'リマインダー通知',
    body: '近くでやることがあります！'
  });

  webpush.sendNotification(subscription, payload).catch(err => {
    console.error(err);
  });

  res.status(201).json({});
});

app.listen(3000, () => console.log('サーバー起動：http://localhost:3000'));
