import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const formData = req.body;
            const response = await fetch("https://api.gooey.ai/v2/LipsyncTTS/form/?run_id=bnpjcyjw&uid=IEl3787xELfW8eEly5r22ETLi7K2", {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + process.env.NEXT_PUBLIC_GOOEY_API_KEY,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const result = await response.json();
            res.status(200).json(result);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
