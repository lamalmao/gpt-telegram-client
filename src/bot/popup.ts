import type { Bot } from './index.js';
import { ignoreError } from './replyWithError.js';

const popup = (ctx: Bot, message: string, ttl = 1500, extra?: object) => {
  ctx
    .reply(message, extra)
    .then(message => {
      setTimeout(() => {
        ctx.telegram
          .deleteMessage(message.chat.id, message.message_id)
          .catch(ignoreError);
      }, ttl);
    })
    .catch(ignoreError);
};

export default popup;
