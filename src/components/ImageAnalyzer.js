import React, { useState, useRef } from 'react';
import Anthropic from '@anthropic-ai/sdk';

const ImageAnalyzer = () => {
  const [userPrompt, setUserPrompt] = useState('');
  const [followUpPrompt, setFollowUpPrompt] = useState('');
  const [combinedPrompt, setCombinedPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState('');
  const [loading, setLoading] = useState(false);
  const previousPromptRef = useRef('');

  const anthropic = new Anthropic({
    apiKey: process.env.REACT_APP_CLAUDE_API_KEY,
    dangerouslyAllowBrowser: true
  });

  const generateDalleImage = async (prompt) => {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
        response_format: "url"
      })
    });
    return (await response.json()).data[0].url;
  };

  const analyzePromptIntent = async (prompt) => {
    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: `Previous prompt: "${previousPromptRef.current}". Is this new prompt requesting a modification of the previous result or a completely new image: "${prompt}"? Just respond with either "modification" or "new".`
      }]
    });
    return response.content[0].text.toLowerCase().includes('modification');
  };

  const analyzeAndGenerate = async (imageBase64, mediaType, prompt) => {
    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: [
          { type: "text", text: `Create a detailed DALL-E prompt that incorporates this image's style and visual elements with the following request: ${prompt}` },
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: imageBase64
            }
          }
        ]
      }]
    });
    return response.content[0].text;
  };

  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    const file = e.target.image.files[0];
    if (!userPrompt || !file) return;

    setLoading(true);
    try {
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(file);
      });

      const newPrompt = await analyzeAndGenerate(base64, file.type || 'image/jpeg', userPrompt);
      setCombinedPrompt(newPrompt);
      previousPromptRef.current = newPrompt;

      const imageUrl = await generateDalleImage(newPrompt);
      setGeneratedImage(imageUrl);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUpSubmit = async (e) => {
    e.preventDefault();
    if (!followUpPrompt) return;

    setLoading(true);
    try {
      const file = e.target.image?.files[0];
      let newPrompt;

      if (file) {
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.readAsDataURL(file);
        });
        newPrompt = await analyzeAndGenerate(base64, file.type || 'image/jpeg', followUpPrompt);
      } else {
        const isModification = await analyzePromptIntent(followUpPrompt);
        newPrompt = isModification ? 
          `${previousPromptRef.current} Additionally: ${followUpPrompt}` : 
          followUpPrompt;
      }

      setCombinedPrompt(newPrompt);
      previousPromptRef.current = newPrompt;

      const imageUrl = await generateDalleImage(newPrompt);
      setGeneratedImage(imageUrl);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Image Modifier</h1>
      
      <form onSubmit={handleInitialSubmit} className="mb-8">
        <div className="mb-4">
          <input type="file" name="image" accept="image/*" className="mb-4 block w-full" />
          <input
            type="text"
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder="Initial prompt"
            className="w-full p-2 border rounded mb-2"
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded" disabled={loading}>
            Generate
          </button>
        </div>
      </form>

      <form onSubmit={handleFollowUpSubmit} className="mb-4">
        <div className="mb-4">
          <input type="file" name="image" accept="image/*" className="mb-4 block w-full" />
          <input
            type="text"
            value={followUpPrompt}
            onChange={(e) => setFollowUpPrompt(e.target.value)}
            placeholder="Follow-up prompt or new request"
            className="w-full p-2 border rounded mb-2"
          />
          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded" disabled={loading}>
            Generate Next
          </button>
        </div>
      </form>

      {loading && <div className="text-gray-600">Processing...</div>}
      
      {combinedPrompt && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="font-semibold mb-2">Generated Prompt:</h2>
          <p className="whitespace-pre-wrap">{combinedPrompt}</p>
        </div>
      )}

      {generatedImage && (
        <div className="mt-4">
          <h2 className="font-semibold mb-2">Generated Image:</h2>
          <img src={generatedImage} alt="Generated" className="w-full rounded shadow-lg" />
        </div>
      )}
    </div>
  );
};

export default ImageAnalyzer;