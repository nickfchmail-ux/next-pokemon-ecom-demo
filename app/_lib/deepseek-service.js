'use server';
import OpenAI from 'openai';
import { auth } from '../_lib/auth';
import { getPokemons } from '../_lib/data-service';
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function deepSeekApiQuery(content) {
  const model = 'deepseek-chat';
  const session = await auth();

  try {
    const products = (await getPokemons())?.data;

    const systemMessage = {
      role: 'system',
      content: `you must provide response with just a plain json object with text (your text to the clients) and suggestion (suggested pokemon(s)). The suggestion must be an array of json object, with the id, name, and image of the suggested pokemon. You are a helpful ecommerce store assistant for Poke 芒.
  Your goal is to drive sales of the following products: ${JSON.stringify(products?.slice(0, 20) ?? [])}.
  If the user query is unrelated to sales, reply in 30 words or fewer.  The kind of response languge should be determinated by the language that your clients are using.
  If it is related to sales, keep the response to 100 words or shorter. `,
    };

    const userMessage = { role: 'user', content: content.trim() };

    const completion = await openai.chat.completions.create({
      model,
      messages: [systemMessage, userMessage],
    });

    let answerText =
      completion.choices[0]?.message?.content?.trim() ?? 'Sorry, no response generated.';

    //checking if the response is a plain json object, if not return an object to prevent breaking the app
    if (!answerText.startsWith('{')) {
      answerText = {
        text: answerText,
        suggestion: [],
      };
    }

    return {
      question: content.trim(),
      answer: answerText,

      id: completion.id, // optional
      created: completion.created, // timestamp, number – safe
    };
  } catch (err) {
    console.log(`Error: ${err}`);
    return {
      text: 'Sorry we are facing some issue, please try again later...',
      suggestion: [],
    };
  }
}
