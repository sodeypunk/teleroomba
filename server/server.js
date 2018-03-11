const express = require('express');
const cors = require('cors');
const util = require('../lib/util');
const Create2 = require('../lib/create2');

const app = express();
const port = process.env.PORT || 5000;

const teleroomba = new Create2();
teleroomba.init('/dev/tty.usbserial-DN026DMU');

teleroomba.on('ready', () => {
  console.log('Teleroomba is online and ready...');
});

app.use(cors());

app.get('/api/hello', (req, res) => {
  res.send({ express: 'Hello From Express2' });
});

app.post('/goforward', (req, res) => {
  console.log('goForward method called');

  teleroomba.moveForward(100, 32768)
    .then(() => {
      util.sleep(1000);
      teleroomba.moveForward(0, 32768);
      res.send({ express: 'Success' });
    });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
