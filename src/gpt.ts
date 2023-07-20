import { ChatGPTAPI } from 'chatgpt';
import settings from './settings.js';

const api = new ChatGPTAPI({
  apiKey: settings.gpt.key,
  completionParams: {
    model: settings.gpt.model
  }
});

export default api;
