import OpenAI from 'openai';
import { env } from '../config/env';

let client: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  if (!client) {
    client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }
  return client;
}

export function hasOpenAI(): boolean {
  return Boolean(env.OPENAI_API_KEY && env.OPENAI_API_KEY.startsWith('sk-'));
}
