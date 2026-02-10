'use server';
import OpenAI from 'openai';
import { auth } from '../_lib/auth';
import { getPokemons } from '../_lib/data-service';
import { supabase } from './supabase';

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function deepSeekApiQuery(content) {
  const model = 'deepseek-chat';
  const session = await auth();
  let reply;
  let pastChatRecord = [];
  try {
    const products = (await getPokemons())?.data || [];

    if (session?.user?.id) {
      const { data: pastChatRecords, error: loadingPastChatRecord } = await supabase
        .from('ai_chat_records')
        .select('*')
        .eq('userId', session.user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      let serializedPastRecords = pastChatRecords.map((record) => {
        let temp = { ...record };
        temp.message.answer = JSON.stringify(temp.message.answer);

        return temp;
      });

      pastChatRecord = serializedPastRecords;
    }

    const simplifiedProducts = products.slice(0, 20).map((p) => ({
      id: p.id,
      name: p.name,
      species: p.species,
      description: p.descriptions, // fix field name if needed
      hp: p.hp,
      attack: p.attack,
      defense: p.defense,
      special_attack: p.special_attack,
      special_defense: p.special_defense,
      speed: p.speed,
      image: p.image,
    }));

    const systemMessage = {
      role: 'system',
      content: `You must respond with ONLY a valid JSON object (starting with '{' and ending with '}', no prefix or extra ending) containing two fields: "text" (your message to the customer) and "suggestion" (array of suggested Pokémon objects with id, name, image).

You are a helpful sales assistant for Poke 芒. Drive sales of these products when relevant: ${JSON.stringify(simplifiedProducts)}.

If the query is unrelated to shopping, reply in 30 words or fewer.
Match the language used by the customer. you may or may not provided with past chat records that you interacted with the client, if past chat records are provided, please use the past chat records to customize your response in order to reach your final goal.  for every response please consider whether it is related to the latest past chat record. if yes, please continue chating within the context, but never make illusion, make sure that your response is based on fact. The pass records: ${JSON.stringify(pastChatRecord)}. You may or may not know the client's name. The client's name: ${session?.user?.name?.split(' ').at(0)}. if the name is provided, please use it to make your response friendly.`,
    };

    const userMessage = { role: 'user', content: content.trim() };

    const completion = await openai.chat.completions.create({
      model,
      messages: [systemMessage, userMessage],
      temperature: 0.7,
    });

    let rawAnswer = completion.choices[0]?.message?.content?.trim() || '';

    let parsedAnswer;
    try {
      parsedAnswer = JSON.parse(rawAnswer);
      const { text } = parsedAnswer;
      reply = text;
    } catch (e) {
      parsedAnswer = { text: rawAnswer || 'Sorry, no response generated.', suggestion: [] };
    }

    if (session?.user?.id) {
      const { data, error } = await supabase
        .from('ai_chat_records')
        .insert([
          {
            userId: session.user.id,
            message: {
              question: content.trim(),
              answer: reply,
            },
          },
        ])
        .select();
    }

    return {
      question: content.trim(),
      answer: parsedAnswer,
      id: completion.id,
      created: completion.created,
    };
  } catch (err) {
    console.error('DeepSeek API error:', err);
    return {
      question: content.trim(),
      answer: {
        text: 'Sorry, we are experiencing technical difficulties. Please try again later.',
        suggestion: [],
      },
      id: null,
      created: Date.now(),
    };
  }
}
