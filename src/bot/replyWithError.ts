import type { Bot } from './index.js';

export const ignoreError = () => null;

export const replyWithError = (ctx: Bot, message: string) => {
  ctx
    .reply(`Что-то пошло не так: \n\n<pre>${message}</pre>`, {
      parse_mode: 'HTML'
    })
    .catch(ignoreError);
};
