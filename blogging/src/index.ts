import dotenv from "dotenv";
import path from "path";
import fs from "fs-extra";
import { BlogGenerator } from "./blogGenerator";
import {
    loadQuestionsFile,
    ensureOutputDirectory,
    loadProcessedQuestions,
    saveProcessedQuestion,
    filterUnprocessedQuestions,
} from "./utils";
import { Question } from "./types";

// Load environment variables
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const INPUTS_QUESTIONS_FILE = path.join(__dirname, "../inputs/questions.json");
const OUTPUT_DIR = path.join(__dirname, "../outputs");

// Check for command line arguments
const forceRegenerate = process.argv.includes("--force") || process.argv.includes("-f");

// Limit the number of questions to process
const LIMIT = 1;

async function main() {
    try {
        if (!OPENAI_API_KEY) {
            throw new Error("OPENAI_API_KEY is required in .env file");
        }

        console.log(`Starting blog generator${forceRegenerate ? " (force regenerate mode)" : ""}`);
        console.log(`Processing limit: ${LIMIT} question(s) per run`);

        // Ensure the output directory exists
        await ensureOutputDirectory(OUTPUT_DIR);

        // Determine which questions file to use
        let questionsFilePath = INPUTS_QUESTIONS_FILE;

        // Load questions from JSON file
        const questionsFile = await loadQuestionsFile(questionsFilePath);
        const { questions } = questionsFile;

        if (!questions || questions.length === 0) {
            console.log("No questions found in the questions file. Exiting...");
            return;
        }

        let questionsToProcess = questions;

        // Only filter processed questions if not in force regenerate mode
        if (!forceRegenerate) {
            // Load previously processed questions
            const processedIds = await loadProcessedQuestions();
            console.log(`Found ${processedIds.length} previously processed questions.`);

            // Filter out already processed questions
            questionsToProcess = filterUnprocessedQuestions(questions, processedIds);

            if (questionsToProcess.length === 0) {
                console.log("All questions have already been processed. Use --force to regenerate. Exiting...");
                return;
            }
        }

        // Apply the limit to number of questions processed
        questionsToProcess = questionsToProcess.slice(0, LIMIT);

        console.log(`Processing ${questionsToProcess.length} question(s) out of ${questions.length} total.`);

        // Initialize the blog generator
        const blogGenerator = new BlogGenerator(OPENAI_API_KEY);

        // Process each question and generate blog articles
        for (const question of questionsToProcess) {
            try {
                console.log(`\nProcessing question: "${question.question}"`);

                const article = await blogGenerator.generateBlogArticle({
                    question,
                    outputDir: OUTPUT_DIR,
                });

                // Mark the question as processed
                await saveProcessedQuestion(question.id);

                console.log(`Successfully generated blog article: "${article.title}"`);
            } catch (error) {
                console.error(`Error processing question "${question.question}":`, error);
            }
        }

        // Check if there are more unprocessed questions remaining
        const remainingCount = !forceRegenerate
            ? filterUnprocessedQuestions(questions, await loadProcessedQuestions()).length
            : questions.length - questionsToProcess.length;

        if (remainingCount > 0) {
            console.log(`\nThere are ${remainingCount} more questions remaining. Run again to process the next batch.`);
        } else {
            console.log("\nAll questions have been processed successfully!");
        }
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
