import { Scenes } from 'telegraf';
import { message } from 'telegraf/filters';
import logger from '../../logger.js';
import { ignoreError, replyWithError } from '../replyWithError.js';
import type { Bot } from '../index.js';
import api from '../../gpt.js';
import popup from '../popup.js';

const newDialogue = new Scenes.BaseScene<Bot>('new-dialogue');

newDialogue.enterHandler = async ctx => {
  try {
    if (!ctx.session.gpt) {
      ctx.session.gpt = {
        currentDialogue: 0,
        gptSessions: [],
        waiting: false
      };
    } else {
      ctx.session.gpt.waiting = false;
      ctx.session.gpt.currentDialogue = ctx.session.gpt.gptSessions.length;
    }

    const { id, text, name } = await api.sendMessage('Начнём');

    ctx.session.gpt.gptSessions.push({
      title: name ? name : `Диалог №${ctx.session.gpt.gptSessions.length + 1}`,
      message: id
    });

    await ctx.reply(text);
    ctx.scene.enter('dialogue');
  } catch (error) {
    const errorMessage = (error as Error).message;
    logger.error(undefined, errorMessage);
    replyWithError(ctx, errorMessage);
    ctx.scene.leave();
  }
};

newDialogue.on(message('text'), ctx => {
  ctx.deleteMessage().catch(ignoreError);
  popup(ctx, 'Ответ еще не готов');
});

export default newDialogue;
