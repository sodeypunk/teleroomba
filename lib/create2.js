const SerialPort = require('serialport');
const Events = require('events');
const util = require('util');

const myUtil = require('./util');

const Command = {
  START: 0x80,
  SAFE: 0x83,
  DRIVE: 0x89,
  LED: 0x8B,
  SONG: 0x8C,
  PLAY: 0x8D,
  STREAM: 0x94,
  SENSORS: 0x8E,
  CLEAN: 0x87,
  SEEK_DOCK: 0x8F,
  STOP: 0xAD,
};

const STRAIGHT = 32768;
// const CLOCKWISE = -1;
// const COUNTER_CLOCKWISE = 1;

const Robot = function Robot() {
  Events.call(this);
  util.inherits(Robot, Events);

  this.port = null;

  Robot.prototype.init = function init(device) {
    this.port = new SerialPort(device, {
      baudRate: 115200,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
    });

    this.serialWrite = function serialWrite(command, data) {
      const buffer = [command].concat(data || []);
      return new Promise((resolve, reject) => {
        this.port.write(buffer, (err, result) => {
          if (err) {
            console.log(`serialWrite error: ${err}`);
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
    };

    this.port.on('error', (err) => {
      console.log(`Error event: ${err.message}`);
    });

    this.port.on('open', () => {
      console.log('Port opened event!');
      myUtil.sleep(100);

      console.log('Sending start command...');
      this.serialWrite(Command.START)
        .then(() => {
          myUtil.sleep(100);
          console.log('Sending safe command...');
          return this.serialWrite(Command.SAFE);
        })
        .then(() => {
          myUtil.sleep(100);
          console.log('Robot is ready...');
          this.emit('ready');
        });
    });

    this.port.on('data', (data) => {
      console.log(`Data event: ${data}`);
    });

    this.port.on('readable', () => {
      console.log(`Data readable event: ${this.port.read()}`);
    });

    this.port.on('close', (err) => {
      if (err) {
        console.log(`Port closed event error: ${err.message}`);
      } else {
        console.log('Port closed event.');
      }
    });
  };

  Robot.prototype.moveForward = function moveForward(velocity, radius = STRAIGHT) {
    if (velocity < -500 || velocity > 500) {
      throw new Error('Must use velocity between -500 and 500 mm/s');
    }
    if (radius !== STRAIGHT && (radius < -2000 || radius > 2000)) {
      throw new Error('Must use radius between -2000 and 2000 mm');
    }
    console.log(`moving forward with velocity ${velocity} and radius ${radius}`);

    const velocityBuffer = Buffer.alloc(2);
    velocityBuffer.writeInt16BE(velocity);

    const radiusBuffer = Buffer.alloc(2);

    if (radius === STRAIGHT) {
      radiusBuffer.writeUInt16BE(radius);
    } else {
      radiusBuffer.writeInt16BE(radius);
    }
    return this.serialWrite(Command.DRIVE, [...velocityBuffer, ...radiusBuffer]);
  };

  Robot.prototype.close = function close() {
    console.log('Sending Stop command...');
    this.serialWrite(Command.STOP)
      .then(() => {
        myUtil.sleep(100);
        console.log('Closing port...');
        this.port.close((err) => {
          if (err) {
            console.log(`Close error: ${err.message}`);
          }
        });
      });
  };
};

module.exports = Robot;
