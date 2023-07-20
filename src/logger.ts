import path from 'path';
import { pino, transport } from 'pino';

const fileTransport = transport({
  target: 'pino/file',
  options: {
    destination: path.resolve('logs.json')
  }
});

const logger = pino(
  {
    level: 'info'
  },
  fileTransport
);

export default logger;
