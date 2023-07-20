import { Scenes } from 'telegraf';
import type { Bot } from '../index.js';
import newDialogue from './new-dialogue.js';
import dialogue from './dialogue.js';
import commandsComposer from '../commands.js';
import checkUser from '../checkUser.js';
import chooseDialogue from './choose-dialogue.js';

const stage = new Scenes.Stage<Bot>();

stage.use(checkUser);
stage.use(commandsComposer.middleware());
stage.register(newDialogue, dialogue, chooseDialogue);

export default stage;
