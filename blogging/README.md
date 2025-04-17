# Blog Article Generator

This project automatically generates blog articles from a list of questions using OpenAI's o1 model for text generation and dall-e-3 model for image creation.

## Features

-   Automatically generates blog titles, descriptions, and content
-   Creates SEO-friendly meta descriptions
-   Generates social media posts to promote the blog
-   Creates custom images for each blog post
-   Saves all outputs in organized folders
-   Uses a consistent system prompt to maintain tone and quality
-   Tracks processed questions to avoid regenerating content
-   Processes 1 question at a time to manage API usage

## Setup

1. Clone this repository
2. Install dependencies:

```bash
yarn install
```

3. Create a `.env` file with your OpenAI API key:

```
OPENAI_API_KEY=your_openai_api_key_here
```

4. Edit the `questions.json` file to add your questions for blog generation.

## Usage

Run the application (processes 1 question per run):

```bash
yarn start
```

To force regeneration of all content (even for previously processed questions):

```bash
yarn start --force
# or
yarn start -f
# or use the shortcut script
yarn start:force
```

The system will:

1. Load questions from the `questions.json` file
2. Track which questions have already been processed
3. Process only one question per run
4. Generate a blog article for the processed question
5. Save all outputs to the `outputs` directory
6. Notify you when there are more questions to process

To change the number of questions processed per run, modify the `LIMIT` constant in `src/index.ts`.

## Project Structure

-   `src/` - TypeScript source code
    -   `index.ts` - Main entry point
    -   `blogGenerator.ts` - Blog generation service
    -   `prompts.ts` - AI prompts for each generation step
    -   `types.ts` - TypeScript type definitions
    -   `utils.ts` - Utility functions for file operations
-   `outputs/` - Generated blog articles and images
-   `questions.json` - Input questions for blog generation
-   `processed-questions.json` - Tracks which questions have been processed

## Output Format

For each question, the generator creates a folder in the `outputs` directory with:

-   `post.md` - The full blog post content with frontmatter
-   `social.md` - The social media post text
-   `image-prompt.txt` - The prompt used to generate the image
-   `featured-image.png` - The generated image
-   `metadata.json` - All metadata including title, descriptions, etc.

## Customization

You can customize the AI prompts by editing the `src/prompts.ts` file:

-   **System Prompt**: Modifies the overall behavior and tone of the AI for all generated content
-   **Individual Prompts**: Customizable templates for each part of the blog generation process (title, description, content, etc.)

Adjusting these prompts allows you to tailor the content style, tone, and format to your specific needs.
