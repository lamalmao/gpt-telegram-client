import { Scenes } from 'telegraf';
import { message } from 'telegraf/filters';
import logger from '../../logger.js';
import { ignoreError, replyWithError } from '../replyWithError.js';
import type { Bot } from '../index.js';
import api from '../../gpt.js';
import popup from '../popup.js';

const dialogue = new Scenes.BaseScene<Bot>('dialogue');

dialogue.enterHandler = async ctx => {
  try {
    if (!ctx.session.gpt) {
      throw new Error('Нет данных о gpt сессии');
    }

    const { currentDialogue } = ctx.session.gpt;
    const dialogue = ctx.session.gpt.gptSessions[currentDialogue];

    if (!dialogue) {
      throw new Error(`Диалог не найден`);
    }
  } catch (error) {
    const errorMessage = (error as Error).message;
    logger.error(undefined, errorMessage);
    replyWithError(ctx, errorMessage);
    ctx.scene.leave();
  }
};

dialogue.on(
  message('text'),
  (ctx, next) => {
    if (ctx.message.text.startsWith('/')) {
      return;
    }

    if (!ctx.session.gpt) {
      ctx.scene.leave();
      return;
    }

    if (ctx.session.gpt.waiting) {
      ctx.deleteMessage().catch(ignoreError);
      popup(ctx, 'Ответ еще не готов');
      return;
    }

    next();
  },
  async ctx => {
    try {
      if (!ctx.session.gpt) {
        throw new Error('Данные о текущей сессии не найдены');
      }

      const dialogue =
        ctx.session.gpt.gptSessions[ctx.session.gpt.currentDialogue];
      if (!dialogue) {
        throw new Error('Диалог не найден');
      }

      ctx.session.gpt.waiting = true;
      const { text, id } = await api.sendMessage(ctx.message.text, {
        parentMessageId: dialogue.message
      });

      if (
        ctx.session.gpt.gptSessions[
          ctx.session.gpt.currentDialogue
        ].title.startsWith('Диалог №')
      ) {
        ctx.session.gpt.gptSessions[ctx.session.gpt.currentDialogue].title =
          text.split(' ').slice(0, 3).join(' ');
      }

      await ctx.reply(text);
      ctx.session.gpt.gptSessions[ctx.session.gpt.currentDialogue].message = id;
      ctx.session.gpt.waiting = false;
    } catch (error) {
      const errorMessage = (error as Error).message;
      logger.error(undefined, errorMessage);
      replyWithError(ctx, errorMessage);
    }
  }
);

dialogue.leaveHandler = (ctx, next) => {
  if (ctx.session.gpt) {
    ctx.session.gpt.waiting = false;
  }

  next();
};

export default dialogue;
