import { Telegraf, Context, Scenes } from 'telegraf';
import LocalSession from 'telegraf-session-local';
import type { SceneSessionData } from 'telegraf/scenes';
import settings from '../settings.js';
import path from 'path';
import checkUser from './checkUser.js';
import logger from '../logger.js';
import { replyWithError } from './replyWithError.js';
import stage from './scenes/index.js';

interface SessionData extends Scenes.SceneSession<SceneSessionData> {
  gpt?: {
    gptSessions: Array<{
      title: string;
      message: string;
    }>;
    currentDialogue: number;
    waiting: boolean;
  };
  dialogsMessage?: number;
}

type BotContext = Context & Scenes.SceneContext;
export interface Bot extends BotContext {
  session: SessionData;
}

const localSession = new LocalSession({
  database: path.resolve('session.json'),
  format: {
    serialize: JSON.stringify,
    deserialize: JSON.parse
  },
  property: 'session'
});

const bot = new Telegraf<Bot>(settings.bot);
bot.use(localSession.middleware());
bot.use(stage.middleware());

bot.start(checkUser, async ctx => {
  try {
    await ctx.reply(
      `Управление ведется при помощи команд:\n\n<b>/new</b> - <i>начать новый диалог</i>\n<b>/switch</b> - <i>переключиться на другой диалог</i>\n/<b>drop [all]</b> - <i>сбросить текущий диалог, или если добавить <u>all</u> - <b>все</b> диалоги что есть</i>\n<b>/logs</b> - <i>загрузить файл с логами</i>`,
      {
        parse_mode: 'HTML'
      }
    );
  } catch (error) {
    const errorMessage = (error as Error).message;
    logger.error(error, errorMessage);
    replyWithError(ctx, errorMessage);
  }
});

bot.telegram.setMyCommands([
  {
    command: 'start',
    description: 'Начальное меню. Не работает во время диалога с GPT'
  },
  {
    command: 'new',
    description:
      'Начать новый диалог, если был открыт старый, то он сохранится, но бот переключится на новый'
  },
  { command: 'switch', description: 'Переключение на другой диалог с GPT' },
  {
    command: 'drop',
    description:
      '[all], удаляет текущий диалог, если приписать all - то все диалоги, всегда выводит бота из текущего диалога'
  }
]);

export default bot;
