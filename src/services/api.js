import { getConversationContext } from '../services/firebase';

const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const API_URL = 'https://api.openai.com/v1/images/generations';
const EDIT_URL = 'https://api.openai.com/v1/images/edits';
const VARIATION_URL = 'https://api.openai.com/v1/images/variations';
const GPT_URL = 'https://api.openai.com/v1/chat/completions';

async function enhancePromptWithContext(currentPrompt, previousPrompts) {
  try {
    const messages = [
      {
        role: "system",
        content: "You are an AI that enhances image generation prompts based on conversation context. Maintain consistency with previous prompts while adding details that would improve the image generation. Keep the enhanced prompt concise but detailed."
      },
      ...previousPrompts.map(p => ({
        role: "assistant",
        content: p
      })),
      {
        role: "user",
        content: currentPrompt
      }
    ];

    const response = await fetch(GPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: messages,
        max_tokens: 150,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `GPT API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.warn('Failed to enhance prompt, using original:', error);
    return currentPrompt;
  }
}

export const generateImage = async (prompt, loginId) => {
  if (!API_KEY) throw new Error('API key is not configured');

  try {
    const previousContext = await getConversationContext(loginId);
    const previousPrompts = previousContext.map(ctx => ctx.enhancedPrompt);

    console.log('Enhancing prompt with context...');
    const enhancedPrompt = await enhancePromptWithContext(prompt, previousPrompts);
    console.log('Enhanced prompt:', enhancedPrompt);

    console.log('Calling DALL-E API...');
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "dall-e-2",
        prompt: enhancedPrompt,
        n: 1,
        size: "1024x1024",
        response_format: "url"
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `DALL-E API Error: ${response.status}`);
    }

    const data = await response.json();
    console.log('DALL-E API response:', data);

    const imageUrl = data.data?.[0]?.url;
    if (!imageUrl) {
      throw new Error('No image URL in DALL-E response');
    }

    return {
      url: imageUrl,
      enhancedPrompt,
      originalPrompt: prompt
    };
  } catch (error) {
    console.error('Image generation failed:', error);
    throw error;
  }
};

export const editImage = async (image, mask, prompt) => {
  if (!API_KEY) throw new Error('API key is not configured');
  checkContentPolicy(prompt);

  try {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('mask', mask);
    formData.append('prompt', prompt);
    formData.append('n', 1);
    formData.append('size', '1024x1024');
    formData.append('response_format', 'url');

    const response = await fetch(EDIT_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `Image edit error: ${response.status}`);
    }

    const data = await response.json();
    return {
      url: data.data[0].url,
      originalPrompt: prompt
    };
  } catch (error) {
    console.error('Image edit failed:', error);
    throw error;
  }
};

export const createVariation = async (image) => {
  if (!API_KEY) throw new Error('API key is not configured');

  try {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('n', 1);
    formData.append('size', '1024x1024');
    formData.append('response_format', 'url');

    const response = await fetch(VARIATION_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `Variation error: ${response.status}`);
    }

    const data = await response.json();
    return {
      url: data.data[0].url
    };
  } catch (error) {
    console.error('Variation generation failed:', error);
    throw error;
  }
};

function handleApiError(error) {
  if (error.response) {
    return `API Error: ${error.response.status} - ${error.response.data?.error?.message || 'Unknown error'}`;
  }
  return error.message || 'An unexpected error occurred';
}

function checkContentPolicy(prompt) {
  const forbiddenTerms = [
    'nude', 'naked', 'violence', 'gore', 'bloody',
    'explicit', 'graphical violence', 'nsfw'
  ];
  
  const lowercasePrompt = prompt.toLowerCase();
  const matchedTerms = forbiddenTerms.filter(term => 
    lowercasePrompt.includes(term.toLowerCase())
  );
  
  if (matchedTerms.length > 0) {
    throw new Error('Prompt may violate content policy. Please revise.');
  }
}

export const utils = {
  handleApiError,
  checkContentPolicy
};