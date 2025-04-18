import { OpenAI } from "openai";
import { v4 as uuidv4 } from "uuid";
import { BlogArticle, GenerationOptions, Question } from "./types";
import { prompts } from "./prompts";
import { saveImage, saveBlogContent } from "./utils";

export class BlogGenerator {
    private openai: OpenAI;
    private currentQuestion: string | null;

    constructor(apiKey: string) {
        this.openai = new OpenAI({
            apiKey,
        });
        this.currentQuestion = null;
    }

    async generateBlogArticle(options: GenerationOptions): Promise<BlogArticle> {
        const { question, outputDir } = options;

        console.log(`Generating blog article for question: "${question.question}"`);

        // Store the current question for image generation
        this.currentQuestion = question.question;

        try {
            // Step 1: Generate title
            const title = await this.generateTitle(question.question);

            // Step 2: Generate description
            const description = await this.generateDescription(title, question.question);

            // Step 3: Generate meta description
            const metaDescription = await this.generateMetaDescription(title);

            // Step 4: Generate blog post content
            const content = await this.generateBlogPost(title, description, question.question);

            // Step 5: Generate social media post
            const socialMediaPost = await this.generateSocialMediaPost(title, description);

            // Step 6: Generate image prompt
            const imagePrompt = await this.generateImagePrompt(title, description, content);

            // Step 7: Generate image
            let imagePath = "";
            try {
                if (imagePrompt && imagePrompt.trim().length > 0) {
                    imagePath = await this.generateImage(imagePrompt, title, outputDir);
                    console.log(`Image generated and saved to: ${imagePath}`);
                } else {
                    console.log("Skipping image generation due to empty prompt");
                }
            } catch (error) {
                console.error("Error generating image:", error);
            }

            // Create the blog article object
            const article: BlogArticle = {
                id: uuidv4(),
                question: question.question,
                title,
                description,
                metaDescription,
                content,
                socialMediaPost,
                imagePrompt,
                imagePath,
            };

            // Save the blog article content
            await saveBlogContent(outputDir, article);
            console.log(`Blog article saved to output directory: ${outputDir}`);

            return article;
        } catch (error) {
            console.error("Error generating blog article:", error);
            throw error;
        } finally {
            // Reset the current question regardless of success or failure
            this.currentQuestion = null;
        }
    }

    private async generateTitle(question: string): Promise<string> {
        try {
            const response = await this.openai.chat.completions.create({
                model: "gpt-4o", // Fallback to a standard model for basic tasks
                messages: [
                    { role: "system", content: prompts.system },
                    { role: "user", content: prompts.title(question) },
                ],
            });
            console.log("Title response: ", JSON.stringify(response.choices[0].message, null, 2));
            let message = response.choices[0].message.content?.trim() || question;
            console.log("Title generated: ", message);
            return message;
        } catch (error) {
            console.error("Error generating title:", error);
            return `Blog Post About ${question.substring(0, 30)}...`;
        }
    }

    private async generateDescription(title: string, question: string): Promise<string> {
        try {
            const response = await this.openai.chat.completions.create({
                model: "gpt-4o", // Using a standard model for description
                messages: [
                    { role: "system", content: prompts.system },
                    { role: "user", content: prompts.description(title, question) },
                ],
            });
            let message = response.choices[0].message.content?.trim() || "";
            console.log("Description generated: ", message);
            return message;
        } catch (error) {
            console.error("Error generating description:", error);
            return `A blog post exploring ${question}`;
        }
    }

    private async generateMetaDescription(title: string): Promise<string> {
        try {
            const response = await this.openai.chat.completions.create({
                model: "gpt-4o", // Using a standard model for meta description
                messages: [
                    { role: "system", content: prompts.system },
                    { role: "user", content: prompts.metaDescription(title) },
                ],
            });
            let message = response.choices[0].message.content?.trim() || "";
            console.log("Meta description generated: ", message);
            return message;
        } catch (error) {
            console.error("Error generating meta description:", error);
            return `Learn more about ${title}`;
        }
    }

    private async generateBlogPost(title: string, description: string, question: string): Promise<string> {
        try {
            // Use o1 model for the main content with appropriate parameters
            const response = await this.openai.chat.completions.create({
                model: "o1",
                messages: [
                    { role: "system", content: prompts.system },
                    { role: "user", content: prompts.blogPost(title, description, question) },
                ],
            });
            let message = response.choices[0].message.content?.trim() || "";
            console.log("Blog post generated: ", message);
            return message;
        } catch (error) {
            console.error("Error generating blog post:", error);
            const fallbackResponse = await this.openai.chat.completions.create({
                model: "o1-16k", // Fallback to a standard model with high context
                messages: [
                    { role: "system", content: prompts.system },
                    { role: "user", content: prompts.blogPost(title, description, question) },
                ],
            });
            let message = fallbackResponse.choices[0].message.content?.trim() || "";
            console.log("Blog post generated: ", message);
            return message;
        }
    }

    private async generateSocialMediaPost(title: string, description: string): Promise<string> {
        try {
            const response = await this.openai.chat.completions.create({
                model: "gpt-4o", // Using a standard model for social media post
                messages: [
                    { role: "system", content: prompts.system },
                    { role: "user", content: prompts.socialMediaPost(title, description) },
                ],
            });
            let message = response.choices[0].message.content?.trim() || "";
            console.log("Social media post generated: ", message);
            return message;
        } catch (error) {
            console.error("Error generating social media post:", error);
            return `New blog post: ${title}. Check it out!`;
        }
    }

    private async generateImagePrompt(title: string, description: string, content: string): Promise<string> {
        try {
            const response = await this.openai.chat.completions.create({
                model: "gpt-4o", // Using a standard model for image prompt
                messages: [
                    { role: "system", content: prompts.system },
                    { role: "user", content: prompts.imagePrompt(title, description, content) },
                ],
            });

            let prompt = response.choices[0].message.content?.trim() || "";
            console.log("Image prompt generated: ", prompt);
            if (!prompt) {
                prompt = `A professional image representing "${title}"`;
            }
            return prompt;
        } catch (error) {
            console.error("Error generating image prompt:", error);
            return `A professional image representing "${title}"`;
        }
    }

    private async generateImage(prompt: string, title: string, outputDir: string): Promise<string> {
        try {
            if (!prompt || prompt.trim().length === 0) {
                throw new Error("Image prompt is empty");
            }

            const response = await this.openai.images.generate({
                model: "dall-e-3", // Using DALL-E 3 instead of gpt-4o which might not be available
                prompt,
                n: 1,
                size: "1024x1024",
                response_format: "b64_json",
            });

            if (!response.data[0].b64_json) {
                throw new Error("No image data returned");
            }

            const imageData = Buffer.from(response.data[0].b64_json, "base64");

            // Create a dummy article object just for saving the image
            const dummyArticle: BlogArticle = {
                id: "",
                question: this.currentQuestion || title, // Use the current question or title as fallback
                title,
                description: "",
                metaDescription: "",
                content: "",
                socialMediaPost: "",
                imagePrompt: prompt,
            };

            return await saveImage(outputDir, dummyArticle, imageData);
        } catch (error) {
            console.error("Error in image generation:", error);
            throw error;
        }
    }
}
