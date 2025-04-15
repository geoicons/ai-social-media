import dotenv from "dotenv";
import path from "path";
import { BlogGenerator } from "./blogGenerator";
import { loadQuestionsFile, ensureOutputDirectory } from "./utils";
import { Question } from "./types";

// Load environment variables
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const QUESTIONS_FILE = path.join(__dirname, "../inputs/questions.json");
const OUTPUT_DIR = path.join(__dirname, "../outputs");

async function main() {
    try {
        if (!OPENAI_API_KEY) {
            throw new Error("OPENAI_API_KEY is required in .env file");
        }

        // Ensure the output directory exists
        await ensureOutputDirectory(OUTPUT_DIR);

        // Load questions from JSON file
        const questionsFile = await loadQuestionsFile(QUESTIONS_FILE);
        const { questions } = questionsFile;

        if (!questions || questions.length === 0) {
            console.log("No questions found in the questions file. Exiting...");
            return;
        }

        console.log(`Found ${questions.length} questions to process.`);

        // Initialize the blog generator
        const blogGenerator = new BlogGenerator(OPENAI_API_KEY);

        // Process each question and generate blog articles
        for (const question of questions) {
            try {
                console.log(`\nProcessing question: "${question.question}"`);

                const article = await blogGenerator.generateBlogArticle({
                    question,
                    outputDir: OUTPUT_DIR,
                });

                console.log(`Successfully generated blog article: "${article.title}"`);
            } catch (error) {
                console.error(`Error processing question "${question.question}":`, error);
            }
        }

        console.log("\nAll questions processed successfully!");
    } catch (error) {
        console.error("Error in main process:", error);
        process.exit(1);
    }
}

// Run the main function
main().catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
});
