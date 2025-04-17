import fs from "fs-extra";
import path from "path";
import { BlogArticle, Question, QuestionsFile, ProcessedQuestionsFile } from "./types";

export async function ensureOutputDirectory(outputDir: string): Promise<void> {
    await fs.ensureDir(outputDir);
}

export async function saveJsonFile<T>(filePath: string, data: T): Promise<void> {
    await fs.writeJson(filePath, data, { spaces: 2 });
}

export async function loadQuestionsFile(filePath: string): Promise<QuestionsFile> {
    try {
        return (await fs.readJson(filePath)) as QuestionsFile;
    } catch (error) {
        console.error("Error loading questions file:", error);
        throw error;
    }
}

export async function saveBlogContent(outputDir: string, article: BlogArticle): Promise<void> {
    const sanitizedTitle = article.question
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const blogDir = path.join(outputDir, sanitizedTitle);
    await fs.ensureDir(blogDir);

    // Save the blog post content as markdown
    await fs.writeFile(
        path.join(blogDir, "post.md"),
        `---
title: "${article.title}"
description: "${article.description.replace(/"/g, '\\"')}"
metaDescription: "${article.metaDescription.replace(/"/g, '\\"')}"
---

${article.content}
`
    );

    // Save the social media post
    await fs.writeFile(path.join(blogDir, "social.md"), article.socialMediaPost);

    // Save the image prompt
    await fs.writeFile(path.join(blogDir, "image-prompt.txt"), article.imagePrompt);

    // Save metadata as JSON
    await saveJsonFile(path.join(blogDir, "metadata.json"), {
        id: article.id,
        question: article.question,
        title: article.title,
        description: article.description,
        metaDescription: article.metaDescription,
        socialMediaPost: article.socialMediaPost,
        imagePrompt: article.imagePrompt,
        imagePath: article.imagePath,
    });
}

export async function saveImage(outputDir: string, article: BlogArticle, imageData: Buffer): Promise<string> {
    const sanitizedTitle = article.question
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const blogDir = path.join(outputDir, sanitizedTitle);
    await fs.ensureDir(blogDir);

    const imagePath = path.join(blogDir, "featured-image.png");
    await fs.writeFile(imagePath, imageData);

    return imagePath;
}

const PROCESSED_QUESTIONS_FILE = path.join(process.cwd(), "outputs", "processed-questions.json");

export async function loadProcessedQuestions(): Promise<string[]> {
    try {
        if (await fs.pathExists(PROCESSED_QUESTIONS_FILE)) {
            const data = (await fs.readJson(PROCESSED_QUESTIONS_FILE)) as ProcessedQuestionsFile;
            return data.processedIds || [];
        }
        return [];
    } catch (error) {
        console.error("Error loading processed questions:", error);
        return [];
    }
}

export async function saveProcessedQuestion(questionId: string): Promise<void> {
    try {
        let processedIds: string[] = [];

        // Load existing processed questions if file exists
        if (await fs.pathExists(PROCESSED_QUESTIONS_FILE)) {
            const data = (await fs.readJson(PROCESSED_QUESTIONS_FILE)) as ProcessedQuestionsFile;
            processedIds = data.processedIds || [];
        }

        // Add the new question ID if it's not already in the list
        if (!processedIds.includes(questionId)) {
            processedIds.push(questionId);
        }

        // Save the updated list
        await fs.writeJson(PROCESSED_QUESTIONS_FILE, { processedIds }, { spaces: 2 });
    } catch (error) {
        console.error("Error saving processed question:", error);
    }
}

export function filterUnprocessedQuestions(questions: Question[], processedIds: string[]): Question[] {
    return questions.filter((question) => !processedIds.includes(question.id));
}
