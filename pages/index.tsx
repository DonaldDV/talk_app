// pages/index.tsx
import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/TalkingPhotoApp.module.css';

const TalkingPhotoApp: React.FC = () => {
    const [textPrompt, setTextPrompt] = useState('');
    // const [selectedFile, setSelectedFile] = useState<File | null>(null);
    // const [selectedAudio, setSelectedAudio] = useState<File | null>(null);
    const [selectedFile, setSelectedFile] = useState(null);
    // const [selectedAudio, setSelectedAudio] = useState(null);
    const [response, setResponse] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleImageChange = (e: any) => {
        setSelectedFile(e.target.files[0]);
    };

    // const handleAudioChange = (e: any) => {
    //     setSelectedAudio(e.target.files[0]);
    // };

    const handleOpenAIRequest = async (inputText: string) => {
        try {
            const response = await fetch('/api/openai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: inputText }),
            });

            if (!response.ok) {
                throw new Error(`OpenAI request failed: ${response.status}`);
            }

            const result = await response.json();
            return result.textPrompt;
        } catch (error) {
            console.error('Error:', error);
            return '';
        }
    };


    const handleButtonClick = async () => {

        setLoading(true);

        const openAITextPrompt = await handleOpenAIRequest(textPrompt);
        console.log(openAITextPrompt);
        if (!openAITextPrompt) {
            setLoading(false);
            return;
        }

        const formData = new FormData();

        if (selectedFile) {
            formData.append('input_face', selectedFile);
        }
        // if (selectedAudio) {
        //     formData.append('input_audio', selectedAudio);
        // }

        formData.append('json', JSON.stringify({
            "face_padding_top": 3,
            "face_padding_bottom": 16,
            "face_padding_left": 12,
            "face_padding_right": 6,
            "text_prompt": openAITextPrompt,
            "tts_provider": "GOOGLE_TTS",
            "google_voice_name": "en-IN-Wavenet-D",
            // ...additional parameters...
        }));

        try {
            const response = await fetch('/api/gooey', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const result = await response.json();
            setResponse(result);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (response && response.output && response.output.output_video && videoRef.current) {
            videoRef.current.load();
            videoRef.current.play().catch(error => console.error('Error playing the video:', error));
        }
    }, [response]);

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Talking Photo App</h1>

            <div className={styles.mediaContainer}>
                {response && response.output && response.output.output_video ? (
                    <video
                        ref={videoRef}
                        src={response.output.output_video}
                        // muted // Mute the video to aid in autoplay
                        autoPlay // You can add this attribute for autoplay
                        onLoadedMetadata={() => {
                            if (videoRef.current) {
                                videoRef.current.play().catch(error => {
                                    console.error('Error playing the video:', error);
                                    // Additional error handling or user notification
                                });
                            }
                        }}
                        style={{ width: '100%' }} // Adjust the size as needed
                    />
                ) : (
                    // <p>Loading video...</p> // Placeholder text or loader
                    null
                )}
            </div>
            <div style={{ marginBottom: "50px" }}>
                <h3>Please input your avatar</h3>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                />
            </div>
            {/* <input
                type="file"
                accept="audio/*"
                onChange={handleAudioChange}
            /> */}
            <textarea
                className={styles.textarea}
                placeholder="Enter text prompt here"
                value={textPrompt}
                onChange={(e) => setTextPrompt(e.target.value)}
            />
            <button
                className={styles.button}
                onClick={handleButtonClick}
                disabled={loading || !textPrompt || !selectedFile}
            >
                {loading ? 'Loading...' : 'Generate'}
            </button>

            {/* <div className={styles.mediaContainer}>
                {response && response.output && response.output.output_video ? (
                    <video ref={videoRef} src={response.output.output_video} controls />
                ) : null}
            </div> */}
        </div>
    );
};

export default TalkingPhotoApp;
