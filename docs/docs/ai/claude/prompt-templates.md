---
sidebar_position: 2
---

# Claude Prompt Templates

Magic Button Cloud provides a set of pre-built prompt templates optimized for common use cases when working with Claude AI.

## What are Prompt Templates?

Prompt templates are structured text formats designed to elicit specific types of responses from Claude. They include carefully crafted instructions, context management, and formatting to help Claude understand exactly what you need.

## Available Templates

### Content Creation

```typescript
import { contentCreationPrompt } from '@magicbutton/claude';

const prompt = contentCreationPrompt({
  topic: 'Sustainable energy solutions',
  format: 'blog post',
  audience: 'technical professionals',
  tone: 'informative yet engaging',
  length: 'approximately 1000 words',
  additionalInstructions: 'Include recent innovations in solar technology'
});

// Use prompt with Claude API
```

### Data Analysis

```typescript
import { dataAnalysisPrompt } from '@magicbutton/claude';

const prompt = dataAnalysisPrompt({
  data: csvData, // Your data in CSV or JSON format
  analysisType: 'correlation',
  variables: ['price', 'square_footage', 'location'],
  additionalInstructions: 'Identify outliers and explain their significance'
});

// Use prompt with Claude API
```

### Code Generation

```typescript
import { codeGenerationPrompt } from '@magicbutton/claude';

const prompt = codeGenerationPrompt({
  language: 'TypeScript',
  task: 'Create a React component that displays a paginated list of items',
  requirements: [
    'Must handle loading states',
    'Should include error handling',
    'Should be accessible'
  ],
  existingCode: existingComponentCode, // Optional
  additionalInstructions: 'Use functional components and hooks'
});

// Use prompt with Claude API
```

## Custom Templates

You can also create custom templates tailored to your specific needs:

```typescript
import { createPromptTemplate } from '@magicbutton/claude';

const customTemplate = createPromptTemplate(`
# {{task}}

## Context
{{context}}

## Instructions
{{instructions}}

## Output Format
{{outputFormat}}
`);

const prompt = customTemplate({
  task: 'Summarize the following research paper',
  context: paperText,
  instructions: 'Focus on methodology and key findings. Highlight limitations.',
  outputFormat: 'Provide a structured summary with sections for Introduction, Methods, Results, and Discussion.'
});

// Use prompt with Claude API
```

## Best Practices

- **Be Specific**: Provide clear, specific instructions
- **Include Examples**: When possible, include examples of the desired output
- **Manage Context**: Be mindful of context length to avoid token limits
- **Iterative Refinement**: Test and refine prompts to improve results