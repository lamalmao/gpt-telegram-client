import { Composer } from 'telegraf';
import type { Bot } from './index.js';
import logger from '../logger.js';
import { replyWithError } from './replyWithError.js';
import path from 'path';

const commandsComposer = new Composer<Bot>();

commandsComposer.command('logs', async ctx => {
  try {
    await ctx.sendDocument(
      {
        source: path.resolve('./logs.json')
      },
      {
        caption: 'Логи'
      }
    );
  } catch (error) {
    const errorMessage = (error as Error).message;
    logger.error(undefined, errorMessage);
    replyWithError(ctx, errorMessage);
  }
});

commandsComposer.command('new', async ctx => ctx.scene.enter('new-dialogue'));
commandsComposer.command('drop', async ctx => {
  try {
    const params = ctx.message.text.split(/\s+/);
    if (params[1] === 'all') {
      ctx.session.gpt = {
        currentDialogue: 0,
        waiting: false,
        gptSessions: []
      };
    } else {
      if (!ctx.session.gpt) {
        return;
      }

      ctx.session.gpt.gptSessions = ctx.session.gpt.gptSessions.filter(
        (session, index) => index !== ctx.session.gpt?.currentDialogue
      );
      ctx.session.gpt.currentDialogue = -1;
      ctx.session.gpt.waiting = false;
    }

    await ctx.reply('Вышел');
  } catch (error) {
    const errorMessage = (error as Error).message;
    logger.error(undefined, errorMessage);
    replyWithError(ctx, errorMessage);
  } finally {
    ctx.scene.leave();
  }
});

commandsComposer.command('switch', ctx => ctx.scene.enter('choose-dialogue'));
export default commandsComposer;
