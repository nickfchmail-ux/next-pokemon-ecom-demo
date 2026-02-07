'use server';
import OpenAI from 'openai';
import { getPokemons } from '../_lib/data-service';
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function deepSeekApiQuery(content) {
  const model = 'deepseek-chat';
  const products = (await getPokemons())?.data;

  const systemMessage = {
    role: 'system',
    content: `You are a helpful ecommerce store assistant for Poke 芒.
Your goal is to drive sales of the following products: ${JSON.stringify(products?.slice(0, 20) ?? [])}.
If the user query is unrelated to sales, reply in 30 words or fewer.
If it is related to sales, keep the response to 100 words or shorter.`,
  };

  const userMessage = { role: 'user', content: content.trim() };

  const completion = await openai.chat.completions.create({
    model,
    messages: [systemMessage, userMessage],
  });

  // Extract only serializable, plain data – this fixes the RSC error
  const answerText =
    completion.choices[0]?.message?.content?.trim() ?? 'Sorry, no response generated.';

  // Optionally include lightweight metadata if you need it in the UI/cache
  const usage = completion.usage
    ? {
        prompt_tokens: completion.usage.prompt_tokens,
        completion_tokens: completion.usage.completion_tokens,
        total_tokens: completion.usage.total_tokens,
      }
    : null;

  return {
    question: content.trim(),
    answer: answerText,
    usage, // optional – plain object, fully serializable
    id: completion.id, // optional
    created: completion.created, // timestamp, number – safe
  };
}
