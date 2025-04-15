export const prompts = {
    system: `You are a professional blog content creator specialized in creating engaging, informative, and SEO-optimized content.
Your writing style is authoritative yet conversational, and you excel at explaining complex concepts in an accessible way.
You create content that is factually accurate, well-structured, and valuable to readers.
Your goal is to create content that both ranks well in search engines and provides genuine value to the reader.`,

    title: (question: string) => `
Create a catchy, SEO-friendly blog post title based on the following question: 
"${question}"
The title should be concise, engaging, and around 50-70 characters.
Return only the title without any additional explanation or text.
`,

    description: (title: string, question: string) => `
Create a compelling blog post description based on the title "${title}" which answers the question: "${question}".
The description should be approximately 150-200 words, engaging, and include the key points that will be covered in the blog post.
Return only the description without any additional explanation or text.
`,

    metaDescription: (title: string) => `
Create an SEO-friendly meta description for a blog post titled "${title}".
The meta description should be under 160 characters, compelling, and include relevant keywords.
Return only the meta description without any additional explanation or text.
`,

    blogPost: (title: string, description: string, question: string) => `
Write a comprehensive, well-structured blog post with the title "${title}" that addresses the question: "${question}".
The blog post should:
- Start with an engaging introduction that expands on this description: "${description}"
- Include multiple well-organized sections with clear headings (H2 and H3)
- Be approximately 1200-1500 words in length
- Include practical examples, tips, or actionable advice
- Conclude with a strong summary that reinforces the key points
- Use Markdown formatting for headings, lists, and emphasis

The tone should be professional yet conversational, authoritative, and helpful.
`,

    socialMediaPost: (title: string, description: string) => `
Create an engaging social media post promoting a new blog article titled "${title}".
The post should:
- Be under 250 characters
- Include a hook or interesting fact from the article
- Include a call to action to read the full article
- Include 2-3 relevant hashtags based on this description: "${description}"

Return only the social media post text without any additional explanation.
`,

    imagePrompt: (title: string, description: string, content: string) => `
Create a detailed prompt for an AI image generator (DALL-E) to create a featured (hero) landscapeimage for a blog post titled "${title}" with this description: "${description}".
The prompt should:
- Describe a visually appealing scene or concept related to the blog topic
- Include specific details about style, colors, composition, and mood
- Request a professional, high-quality image suitable for a blog header
- Be approximately 100-150 words in length
- Consider also the content of the blog post: "${content}"

Return only the image generation prompt without any additional explanation.
`,
};
