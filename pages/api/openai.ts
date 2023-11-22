// pages/api/openai.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

interface OpenAIResponse {
    choices: Array<{
        message: {
            content: string;
        };
    }>;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { text } = req.body;

    console.log(text);

    const system = { role: 'system', content: text };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            messages: [system],
            max_tokens: 100,
            model: "gpt-3.5-turbo"
        }),
    });

    // console.log(response);

    if (!response.ok) {
        return res.status(500).json({ message: 'Failed to fetch from OpenAI' });
    }

    const data = await response.json() as OpenAIResponse;

    console.log(data.choices[0].message);

    res.status(200).json({ textPrompt: data.choices[0].message.content });
}
