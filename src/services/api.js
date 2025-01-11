const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const API_URL = 'https://api.openai.com/v1/images/generations';

// api.js
export const generateImage = async (prompt) => {
  if (!API_KEY) throw new Error('API key is not configured');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        response_format: "url"
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI API response:', data);

    const imageUrl = data.data?.[0]?.url;
    if (!imageUrl) {
      throw new Error('No image URL in OpenAI response');
    }

    return imageUrl;
  } catch (error) {
    console.error('Image generation failed:', error);
    throw error;
  }
};