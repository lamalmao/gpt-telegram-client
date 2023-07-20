import type { Bot } from './index.js';
import settings from '../settings.js';
import logger from '../logger.js';

const checkUser = (ctx: Bot, next?: CallableFunction) => {
  if (!ctx.from) {
    return;
  }

  if (!settings.allowedUsers.includes(ctx.from.id)) {
    logger.info(
      ctx.from,
      // prettier-ignore
      `${ctx.from.id}:${ctx.from.username ? ctx.from.username : 'unknown'} tried to use bot at ${new Date().toLocaleString('ru-RU')}`
    );
    return;
  }

  if (next) {
    next();
  }
};

export default checkUser;
