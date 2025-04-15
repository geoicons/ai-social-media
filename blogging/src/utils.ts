import fs from "fs-extra";
import path from "path";
import { BlogArticle, Question, QuestionsFile } from "./types";

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
    const sanitizedTitle = article.title
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
    const sanitizedTitle = article.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const blogDir = path.join(outputDir, sanitizedTitle);
    await fs.ensureDir(blogDir);

    const imagePath = path.join(blogDir, "featured-image.png");
    await fs.writeFile(imagePath, imageData);

    return imagePath;
}
