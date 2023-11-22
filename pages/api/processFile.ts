// pages/api/processFile.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable-serverless';
import fetch, { FormData } from 'node-fetch';
import fs from 'fs-extra';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err: any, fields: any, files: any) => {
        if (err) {
            console.error('Formidable Error:', err);
            res.status(500).json({ message: 'File upload error' });
            return;
        }

        try {
            const gooeyFormData = new FormData();

            // Read the uploaded image file into a buffer
            if (files.input_face) {
                const imageBuffer = await fs.readFile(files.input_face.filepath);
                const imageBlob = new Blob([imageBuffer], { type: 'image/png' }); // Adjust the type if necessary
                gooeyFormData.append('input_face', imageBlob, files.input_face.originalFilename);
            }

            // For the audio file
            if (files.input_audio) {
                const audioBuffer = await fs.readFile(files.input_audio.filepath);
                const audioBlob = new Blob([audioBuffer], { type: 'audio/mp3' }); // Adjust the type if necessary
                gooeyFormData.append('input_audio', audioBlob, files.input_audio.originalFilename);
            }

            // Add text and other parameters
            gooeyFormData.set('json', JSON.stringify({
                "face_padding_top": 3,
                "face_padding_bottom": 16,
                "face_padding_left": 12,
                "face_padding_right": 6,
                "text_prompt": fields.text,
                "tts_provider": "GOOGLE_TTS",
                "uberduck_voice_name": "the-rock",
                "uberduck_speaking_rate": 1,
                "google_voice_name": "en-IN-Wavenet-D",
                "google_speaking_rate": 1.2,
                "google_pitch": -1.75,
                "bark_history_prompt": null,
                "elevenlabs_voice_name": "Rachel",
                "elevenlabs_api_key": null,
                "elevenlabs_voice_id": null,
                "elevenlabs_model": "eleven_multilingual_v2",
                "elevenlabs_stability": 0.5,
                "elevenlabs_similarity_boost": 0.75
            }));

            const gooeyResponse = await fetch("https://api.gooey.ai/v2/LipsyncTTS/form/?run_id=bnpjcyjw&uid=IEl3787xELfW8eEly5r22ETLi7K2", {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + process.env.NEXT_PUBLIC_GOOEY_API_KEY,
                    "Content-Type": "application/json",
                },
                body: gooeyFormData,
            });

            if (!gooeyResponse.ok) {
                throw new Error(`Gooey API request failed: ${gooeyResponse.status}`);
            }

            const result = await gooeyResponse.json();
            console.log(result);
            res.status(200).json(result);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    });
}
