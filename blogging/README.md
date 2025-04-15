# Blog Article Generator

This project automatically generates blog articles from a list of questions using OpenAI's o1 model for text generation and 4o model for image creation.

## Features

-   Automatically generates blog titles, descriptions, and content
-   Creates SEO-friendly meta descriptions
-   Generates social media posts to promote the blog
-   Creates custom images for each blog post
-   Saves all outputs in organized folders

## Setup

1. Clone this repository
2. CD into this directory
3. Install dependencies:

```bash
yarn install
```

4. Create a `.env` file with your OpenAI API key:

```
OPENAI_API_KEY=your_openai_api_key_here
```

5. Edit the `questions.json` file to add your questions for blog generation.

## Usage

Run the application:

```bash
yarn start
```

This will:

1. Load questions from the `questions.json` file
2. Generate a blog article for each question
3. Save all outputs to the `outputs` directory

## Project Structure

-   `src/` - TypeScript source code
    -   `index.ts` - Main entry point
    -   `blogGenerator.ts` - Blog generation service
    -   `prompts.ts` - AI prompts for each generation step
    -   `types.ts` - TypeScript type definitions
    -   `utils.ts` - Utility functions for file operations
-   `outputs/` - Generated blog articles and images
-   `questions.json` - Input questions for blog generation

## Output Format

For each question, the generator creates a folder in the `outputs` directory with:

-   `post.md` - The full blog post content with frontmatter
-   `social.md` - The social media post text
-   `image-prompt.txt` - The prompt used to generate the image
-   `featured-image.png` - The generated image
-   `metadata.json` - All metadata including title, descriptions, etc.

## Customization

You can customize the AI prompts by editing the `src/prompts.ts` file.
