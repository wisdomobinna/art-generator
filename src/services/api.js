import { getConversationContext } from '../services/firebase';

const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const API_URL = 'https://api.openai.com/v1/images/generations';
const GPT_URL = 'https://api.openai.com/v1/chat/completions';

// Function to use GPT to enhance prompts with context
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

// Main image generation function
export const generateImage = async (prompt, loginId) => {
  if (!API_KEY) throw new Error('API key is not configured');

  try {
    // Get previous conversation context
    const previousContext = await getConversationContext(loginId);
    const previousPrompts = previousContext.map(ctx => ctx.enhancedPrompt);

    // Enhance the prompt with context
    console.log('Enhancing prompt with context...');
    const enhancedPrompt = await enhancePromptWithContext(prompt, previousPrompts);
    console.log('Enhanced prompt:', enhancedPrompt);

    // Make the DALL-E API call
    console.log('Calling DALL-E API...');
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
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

    // Return both the URL and the prompts
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

// Helper function to handle API errors
function handleApiError(error) {
  if (error.response) {
    return `API Error: ${error.response.status} - ${error.response.data?.error?.message || 'Unknown error'}`;
  }
  return error.message || 'An unexpected error occurred';
}

// Function to check if prompt might violate content policy
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

// Export any utility functions that might be needed elsewhere
export const utils = {
  handleApiError,
  checkContentPolicy
};