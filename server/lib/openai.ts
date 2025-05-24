import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "your-openai-api-key"
});

export async function generateStory(
  character: string, 
  storyType: string, 
  userPrompt?: string
): Promise<{ title: string; content: string; imageUrl: string }> {
  try {
    const systemPrompt = `You are a magical storyteller who creates wonderful, age-appropriate stories for children aged 3-12. Your stories should be:
- Safe, positive, and educational
- 200-400 words long
- Easy to understand with simple vocabulary
- Include moral lessons about kindness, friendship, courage, or helping others
- Have happy endings
- Be engaging and imaginative
- Free from scary, violent, or inappropriate content

Always respond with a JSON object containing "title" and "content" fields.`;

    const characterDescriptions: Record<string, string> = {
      princess: "a brave and kind princess with a beautiful dress and crown",
      knight: "a courageous knight in shining armor who helps others",
      dragon: "a friendly, colorful dragon who loves making friends",
      wizard: "a wise wizard with a long beard and magical powers",
      fairy: "a tiny magical fairy with sparkly wings and a wand",
      pirate: "a fun-loving pirate captain searching for friendship and adventure"
    };

    const storyTypeDescriptions: Record<string, string> = {
      "fairy-tale": "a magical fairy tale with castles, magic, and a happy ending",
      adventure: "an exciting adventure with exploration and discovery",
      mystery: "a fun mystery to solve with clues and surprises",
      friendship: "a heartwarming story about making friends and helping others",
      space: "a wonderful space adventure visiting planets and meeting friendly aliens",
      animals: "a delightful story featuring talking animals and nature"
    };

    const characterDesc = characterDescriptions[character] || "a brave hero";
    const storyTypeDesc = storyTypeDescriptions[storyType] || "an exciting adventure";
    
    let prompt = `Create ${storyTypeDesc} starring ${characterDesc}.`;
    
    if (userPrompt && userPrompt.trim()) {
      prompt += ` The child wants: ${userPrompt}`;
    }
    
    prompt += ` Make it magical, fun, and perfect for young children!`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    if (!result.title || !result.content) {
      throw new Error("Invalid response format from OpenAI");
    }

    // Generate a simple illustration URL using a free service
    const imagePrompt = `${characterDesc} in ${storyTypeDesc}, children's book illustration style, colorful, friendly, safe for kids`;
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=512&height=512&seed=${Math.floor(Math.random() * 1000)}`;

    return {
      title: result.title,
      content: result.content,
      imageUrl: imageUrl
    };
  } catch (error) {
    console.error("Error generating story with OpenAI:", error);
    
    // Fallback story in case of API failure
    const fallbackStories: Record<string, { title: string; content: string; imageUrl: string }> = {
      princess: {
        title: "The Kind Princess and the Magic Garden",
        content: "Once upon a time, there was a kind princess who discovered a magical garden behind her castle. In this garden, flowers could talk and sing beautiful songs. The princess learned that the garden was sad because it hadn't rained in many days. Using her kind heart and determination, the princess found a way to bring rain clouds to water the garden. All the flowers bloomed brighter than ever, and they sang a special thank-you song for the princess. From that day on, the princess visited the garden every day, and together they made the kingdom more beautiful. The princess learned that helping others always brings the greatest joy.",
        imageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent("princess in magical garden, children's book illustration style, colorful, friendly, safe for kids")}?width=512&height=512&seed=123`
      },
      default: {
        title: "A Magical Adventure",
        content: "Once upon a time, in a land filled with wonder and magic, there lived a brave hero who went on an amazing adventure. Along the way, they met new friends, learned important lessons about kindness and courage, and discovered that the greatest magic of all comes from helping others. Together with their friends, they solved problems, shared laughter, and created memories that would last forever. And they all lived happily ever after, knowing that friendship and kindness make the world a more magical place.",
        imageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent("magical adventure, children's book illustration style, colorful, friendly, safe for kids")}?width=512&height=512&seed=456`
      }
    };

    return fallbackStories[character] || fallbackStories.default;
  }
}
