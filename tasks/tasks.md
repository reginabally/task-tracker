## Introduction
This file defines the processing rules and instructions for AI Summarization Workflow for HR self-feedback.

## Section 1: Core Cursor Rules
- **Command Processing:** All commands must adhere to the instructions defined in this file. The system processes each command in context with strict adherence to these rules.
- **Integration with Codebase:** Ensure that all processes interact seamlessly with the latest implementations in the system, including task tracking, report generation, and feedback summarization.
- **User Communication:** Instructions and outputs should be written in a clear, simple, and direct manner. The tone must be encouraging, forward-thinking, and easy to understand.
- **File Operations:** File uploads, downloads, and text processing must comply with these guidelines to support robustness and efficiency in command execution.

## Section 2: AI Summarization Workflow for HR Self-Feedback
This section outlines the AI workflow designed to generate HR self-feedback drafts by summarizing recent tasks and comparing them with previous feedback.

### Phase 1: Define Output Goals
- **Output Structure:** The HR self-feedback draft should include:
  - A **Summary Paragraph** written in first-person.
  - A **Growth/Improvements** section comparing past and current performance.
  - An **Achievements / Pride** section highlighting key accomplishments.
  - A **Future Goals** section for planning upcoming actions.

### Phase 2: AI Pipeline Breakdown
#### Step A: Task Data Preprocessing
- **Task Structuring:** Use existing methods (e.g., `generateReportHTML`, `groupByTypeAndTag`) to organize task data.
- **Data Cleaning:** Include a helper function `extractPlainTextFromReport(html)` to convert the report into a prompt-friendly list without HTML noise.

#### Step B: Accept Previous HR Feedback Input
- **Feedback Upload:** Allow users to upload a `.md` or `.txt` file containing their last HR feedback.
- **Temporary Storage:** Store the uploaded feedback for the duration of the session.
- **Parsing:** Use a dedicated parser (`parseFeedbackSections(text)`) to extract specific sections (such as growth, achievements, and goals) to enrich the summarization prompts.

### Phase 3: Prompting Strategy
Break the summarization process into modular components, which can be independently triggered in the UI:

1. **High-Level Summary Prompt**
   - *Prompt:* “You are a helpful assistant summarizing a work report for an HR feedback draft. Here are the activities: [list of tasks]. Generate a short summary paragraph in first-person voice.”

2. **Growth Section Prompt**
   - *Prompt:* “Here is the previous feedback:
---PREVIOUS FEEDBACK---
[Insert previous ‘Growth’ section]
---END---
Here are the current activities: [list of tasks].
Write a new 'Growth' section comparing with the previous period, highlighting improvements, challenges, and skill development in first-person voice.”

3. **Achievements Section Prompt**
   - *Prompt:* “Based on the following tasks, what accomplishments should this person be proud of? [list of tasks].
Use first-person voice. Highlight the impact, long-term goals achieved, kudos received, or difficult work completed.”

4. **Future Goals Prompt**
   - *Prompt:* “Based on this person’s recent work and past feedback, suggest thoughtful goals for the next 6 months.
Here is the previous 'Goals' section: [Insert previous Goals].
Here are the current tasks: [list of tasks].”

### Phase 4: Integration in the Application
#### Backend Adjustments
- **File:** `/app/tasks/summary.ts`
  - **New Functions:**  
    - `generateHRSection(type, tasks, previousFeedback?)` – Generates a specific section (Summary, Growth, Achievements, or Goals) based on task data and optional previous feedback.
    - `parseFeedbackSections(text)` – Extracts defined parts from the uploaded HR feedback.

#### Frontend Enhancements
- **File:** `SummaryGenerator.tsx`
  - **User Options:**  
    - Upload previous feedback (`.md` or `.txt`).
    - Integrate with LM Studio via a local HTTP server at `http://localhost:1234/v1/chat/completions` to generate local AI summaries.
    - Choose which section to generate (Summary, Growth, Achievements, Goals).
    - View and copy the generated section for final feedback preparation.

### Phase 5: Optional Enhancements
- **Feedback Caching:** Cache uploaded feedback for reuse across sessions.
- **Auto-Suggestions:** Implement auto-suggestions for refining phrasing or tone (e.g., “Make more concise”).
- **Markdown Export:** Add a feature to combine generated sections and export them as a consolidated `.md` file.
- **Support Various AI Models:** Add a feature to allow choosing other local or cloud-based AI models.
