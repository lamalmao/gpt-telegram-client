import { Scenes, Markup } from 'telegraf';
import logger from '../../logger.js';
import { ignoreError, replyWithError } from '../replyWithError.js';
import type { Bot } from '../index.js';

const chooseDialogue = new Scenes.BaseScene<Bot>('choose-dialogue');

chooseDialogue.enterHandler = async ctx => {
  try {
    if (!ctx.session.gpt) {
      throw new Error('Нет данных о сессиях');
    }

    if (ctx.session.gpt.gptSessions.length === 0) {
      throw new Error('Активных диалогов нет');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const keyboard: Array<Array<any>> = [];
    ctx.session.gpt.gptSessions.forEach((session, index) => {
      keyboard.push([
        Markup.button.callback(session.title, `set-dialogue:${index}`)
      ]);
    });
    keyboard.push([Markup.button.callback('🗙 Отмена', 'cancel')]);

    const { message_id } = await ctx.reply('Активные диалоги', {
      reply_markup: Markup.inlineKeyboard(keyboard).reply_markup
    });

    ctx.session.dialogsMessage = message_id;
  } catch (error) {
    const errorMessage = (error as Error).message;
    logger.error(undefined, errorMessage);
    replyWithError(ctx, errorMessage);
    ctx.scene.leave();
  }
};

chooseDialogue.action('cancel', ctx => {
  ctx.reply('Если вы были в диалоге, то вы его покинули').catch(ignoreError);
  ctx.scene.leave();
});
chooseDialogue.action(/set-dialogue:\d+/, async ctx => {
  try {
    if (!ctx.session.gpt) {
      throw new Error('Нет данных о сессиях');
    }

    const data: string = ctx.callbackQuery['data'];
    const rawData = /(\d+)$/.exec(data);
    if (!rawData) {
      throw new Error('ID Диалога не указан');
    }

    const dialogueId = Number(rawData[0]);
    if (dialogueId >= ctx.session.gpt.gptSessions.length) {
      throw new Error('Данный диалог не найден');
    }

    ctx.session.gpt.currentDialogue = dialogueId;
    ctx.session.gpt.waiting = false;

    await ctx.reply(
      // prettier-ignore
      `Переключаюсь на <b>${ctx.session.gpt.gptSessions[ctx.session.gpt.currentDialogue].title}</b>`,
      {
        parse_mode: 'HTML'
      }
    );
    ctx.scene.enter('dialogue');
  } catch (error) {
    const errorMessage = (error as Error).message;
    logger.error(undefined, errorMessage);
    replyWithError(ctx, errorMessage);
    ctx.scene.leave();
  }
});

chooseDialogue.leaveHandler = (ctx, next) => {
  if (ctx.session.dialogsMessage) {
    ctx.deleteMessage(ctx.session.dialogsMessage).catch(ignoreError);
    ctx.session.dialogsMessage = undefined;
  }

  next();
};

export default chooseDialogue;
