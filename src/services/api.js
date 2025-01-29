import { getConversationContext, saveConversationContext } from '../services/firebase';
import Anthropic from '@anthropic-ai/sdk';


const DALLE_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const CLAUDE_KEY = process.env.REACT_APP_CLAUDE_API_KEY;
const API_URL = 'https://api.openai.com/v1/images/generations';


const anthropic = new Anthropic({
 apiKey: CLAUDE_KEY,
 dangerouslyAllowBrowser: true
});




async function analyzePromptIntent(prompt, lastGenerated) {
 const message = await anthropic.messages.create({
   model: "claude-3-opus-20240229",
   max_tokens: 1024,
   messages: [{
     role: "user",
     content: `Previous generated image style: "${lastGenerated}".
               Create a specific, detailed DALL-E prompt for this request: "${prompt}".
               Focus on style, colors, and specific features.`
   }]
 });
  // Ensure we always return a valid prompt
 const enhancedPrompt = message.content[0].text.trim();
 return {
   isModification: true,
   enhancedPrompt: enhancedPrompt || prompt // Fallback to original prompt if empty
 };
}


async function analyzeImageAndPrompt(imageBase64, mediaType, prompt) {
 const message = await anthropic.messages.create({
   model: "claude-3-opus-20240229",
   max_tokens: 1024,
   messages: [{
     role: "user",
     content: [
       { type: "text", text: `Create a detailed DALL-E prompt that incorporates this image's visual elements with the following request: ${prompt}` },
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
 return message.content[0].text;
}


async function fetchWithRetry(url, options, maxRetries = 3) {
 for (let i = 0; i < maxRetries; i++) {
   try {
     const response = await fetch(url, options);
     if (!response.ok) {
       const errorData = await response.json();
       throw new Error(errorData.error?.message || `Error: ${response.status}`);
     }
     return response;
   } catch (error) {
     if (i === maxRetries - 1) throw error;
     await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
   }
 }
}
export const generateImage = async (prompt, loginId, uploadedImage = null) => {
 if (!DALLE_KEY || !CLAUDE_KEY) throw new Error('API keys not configured');
 if (!prompt) throw new Error('Prompt is required');
 try {
   let finalPrompt;
   const previousContext = await getConversationContext(loginId);
   const lastGenerated = previousContext[previousContext.length - 1]?.enhancedPrompt;
   if (uploadedImage) {
     const imageBase64 = await new Promise((resolve, reject) => {
       const reader = new FileReader();
       reader.onload = () => resolve(reader.result.split(',')[1]);
       reader.onerror = reject;
       reader.readAsDataURL(uploadedImage);
     });
     finalPrompt = await analyzeImageAndPrompt(imageBase64, uploadedImage.type || 'image/jpeg', prompt);
     await saveConversationContext(loginId, prompt, finalPrompt, null);
   } else if (lastGenerated) {
     const { enhancedPrompt } = await analyzePromptIntent(prompt, lastGenerated);
     finalPrompt = enhancedPrompt;
   } else {
     finalPrompt = prompt;
   }
   console.log('Final prompt to DALL-E:', finalPrompt);
   const response = await fetchWithRetry(API_URL, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${DALLE_KEY}`
     },
     body: JSON.stringify({
       model: "dall-e-3",
       prompt: finalPrompt,
       n: 1,
       size: "1024x1024",
       response_format: "url"
     })
   });
   const data = await response.json();
   await saveConversationContext(loginId, prompt, finalPrompt, data.data[0].url);
  
   return {
     url: data.data[0].url,
     enhancedPrompt: finalPrompt,
     originalPrompt: prompt
   };
 } catch (error) {
   console.error('Image generation failed:', error);
   throw error;
 }
};












// async function enhancePromptWithContext(currentPrompt, previousPrompts, imageAnalysis = null) {
//   try {
//     const messages = [{
//       role: "system",
//       content: imageAnalysis 
//         ? "Create a detailed DALL-E prompt based on the provided image analysis and user's request for modification." 
//         : "Enhance this image generation prompt based on conversation context."
//     }];

//     if (imageAnalysis) {
//       messages.push({
//         role: "user",
//         content: `Image Analysis:\n${imageAnalysis}\n\nUser Request: ${currentPrompt}\n\nCreate a detailed DALL-E prompt incorporating the image's visual elements while applying the requested modifications.`
//       });
//     } else {
//       messages.push(
//         ...previousPrompts.map(p => ({
//           role: "assistant",
//           content: p
//         })), 
//         {
//           role: "user",
//           content: currentPrompt
//         }
//       );
//     }

//     const response = await fetch('https://api.openai.com/v1/chat/completions', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${DALLE_KEY}`
//       },
//       body: JSON.stringify({
//         model: "gpt-4",
//         messages,
//         max_tokens: 150,
//         temperature: 0.7
//       })
//     });

//     const data = await response.json();
//     return data.choices[0].message.content;
//   } catch (error) {
//     console.error('Error enhancing prompt:', error);
//     throw error;
//   }
// }

