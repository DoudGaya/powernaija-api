import OpenAI from 'openai';
import { logger } from '@/utils/logger';

if (!process.env.OPENAI_API_KEY) {
  logger.warn('OPENAI_API_KEY not found in environment variables');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export const CHATBOT_SYSTEM_PROMPT = `You are a helpful energy management assistant for a Nigerian electricity token platform called PowerNaija.

You can help users with:
- Token purchases and balance inquiries
- Usage tracking and tips for energy conservation
- Carbon credit information and monetization
- Billing questions and transaction history
- Technical support and troubleshooting

Key Nigerian Companies supported:
- Ikeja Electric, Eko Electricity (EKEDC), Abuja Electric (AEDC)
- Kano Electric (KEDCO), Port Harcourt Electric (PHED)
- Enugu Electric (EEDC), Jos Electric (JED), Kaduna Electric
- Benin Electric (BEDC), Ibadan Electric (IBEDC)
- Lumos Nigeria and Arnergy Solar (renewable providers)

Be friendly, concise, and culturally aware of Nigerian context.
Support English, Hausa, Igbo, Yoruba, and Nigerian Pidgin languages.
Keep responses under 200 words unless detailed explanation is needed.`;

export async function getChatResponse(
  message: string,
  history: Array<{ role: string; content: string }> = [],
  language: string = 'en'
): Promise<string> {
  try {
    const messages = [
      { role: 'system', content: CHATBOT_SYSTEM_PROMPT },
      ...history,
      { role: 'user', content: message },
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0].message.content || 'Sorry, I could not process your request.';
  } catch (error) {
    logger.error('OpenAI API error:', error);
    throw new Error('Failed to get chat response');
  }
}

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  try {
    const languageMap: Record<string, string> = {
      en: 'English',
      ha: 'Hausa',
      ig: 'Igbo',
      yo: 'Yoruba',
      pidgin: 'Nigerian Pidgin',
    };

    const targetLang = languageMap[targetLanguage] || 'English';
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a translation assistant. Translate the following text to ${targetLang}. Provide only the translation, no explanations.`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.3,
      max_tokens: 300,
    });

    return response.choices[0].message.content || text;
  } catch (error) {
    logger.error('Translation error:', error);
    return text; // Return original text if translation fails
  }
}
