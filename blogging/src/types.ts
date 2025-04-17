export interface Question {
    id: string;
    question: string;
}

export interface QuestionsFile {
    questions: Question[];
}

export interface ProcessedQuestionsFile {
    processedIds: string[];
}

export interface BlogArticle {
    id: string;
    question: string;
    title: string;
    description: string;
    metaDescription: string;
    content: string;
    socialMediaPost: string;
    imagePrompt: string;
    imagePath?: string;
}

export interface GenerationOptions {
    question: Question;
    outputDir: string;
}
