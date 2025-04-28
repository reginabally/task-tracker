# Task Tracker

An open-source task tracking tool designed to help individuals and teams log daily work activities, organize tasks by type and tag, and generate structured bi-weekly reports. Ideal for professionals who need a lightweight and customizable way to document their work for performance reviews or team updates. The integrated AI summarization feature helps transform raw task lists into well-structured HR self-feedback drafts.

🛠 Built with Next.js App Router, Tailwind CSS, and Prisma.  
📅 Designed for fixed 2-week reporting cycles.  
📦 Docker containerized for easy deployment and setup.  
🤖 AI-powered self-feedback generation with LM Studio and OpenAI integration.

## Technologies

- **Frontend:** React 19, Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend:** Next.js Server Actions, Prisma ORM
- **Database:** SQLite (customizable via Prisma)
- **Date Handling:** date-fns, dayjs
- **UI Components:** react-datepicker
- **AI Integration:** LM Studio (local), OpenAI API (cloud)
- **Deployment:** Docker, Docker Compose

## Features

- **Task Management:** Add, edit, and delete tasks with descriptions, types, tags, dates, and external links
- **Smart Categorization:** Organize tasks by predefined types and tags
- **Custom Filtering:** Filter tasks by type, tag, date, or reporting period
- **Reporting:** Generate formatted reports grouped by task type
- **Fixed Reporting Periods:** Automatically track 2-week reporting cycles
- **Dynamic Tags:** Create new tags on-the-fly during task entry
- **Task Automation:** Automatically assign categories and tags based on patterns in task descriptions or links
- **Comprehensive Settings:** Configure categories, tags, reporting periods, and automation rules
- **AI Summarization:** Transform task lists into structured self-feedback drafts
  - Choose between local LM Studio or OpenAI (GPT-4o) models
  - Generate summaries organized by section (Summary, Growth, Achievements, Future Goals)
  - Upload previous HR self-feedback for context-aware summaries
  - Customize prompts for personalized summary generation
  - First-person voice summaries ready for performance reviews
  - Download summaries as Markdown files for easy sharing and storage

## Setup and Installation

### Prerequisites
- Docker and Docker Compose (or install Docker Desktop at https://www.docker.com/products/docker-desktop/)
- LM Studio (for local AI processing) or OpenAI API key (for cloud AI processing)

### Docker Setup

> ⚠️ **Important:** Docker Desktop must be running before you start the app.

1. **Download the release package**

   Download the latest release ZIP from [Task Tracker Releases](https://github.com/reginabally/task-tracker/releases) and extract it to your preferred location.

2. **Build and start the Docker containers**

   - Make sure the Docker Desktop app is running
   - Click the `Task Tracker.app` inside the extracted folder to launch the app
   > ℹ️ You do not need to run any Docker commands manually — everything is handled by the Task Tracker app launcher.
   - Wait for a few minutes for the build process to complete on first launch
   - The Docker container is started when you see the last line is something like `✓ Ready in 326ms`

3. **Access the application**
   
   Open [http://localhost:3000](http://localhost:3000) in your browser. You will be automatically redirected to the /tasks page.

4. **Configure AI Integration**

   For **LM Studio** (local AI, default option):
   - Install LM Studio from [lmstudio.ai](https://lmstudio.ai)
   - Download an AI model in LM Studio (e.g., `meta-llama-3.1-8b-instruct`)
   - Launch LM Studio and start the local server
   - Ensure LM Studio is accessible from the Docker container (adjust network settings if needed)
   - The default endpoint is set to `http://localhost:1234/v1/chat/completions` and is already stored in the database

   For **OpenAI** (cloud AI):
   - Launch the application and navigate to Settings → AI Config
   - Enter your OpenAI API key in the provided field and click Save
   - Your API key will be stored securely in the database

## Usage

1. **Adding Tasks:**
   - Fill in the task description, select type and tags, set date, and add optional link
   - Click "Add Task" to save

2. **Viewing Tasks:**
   - Today's tasks appear in the list below the entry form by default
   - Use filters to narrow down tasks by type, tag, or date range
   - Click the "Today" or "Current Reporting Period" buttons for quick filtering

3. **Editing/Deleting Tasks:**
   - Use the edit icon next to any task to modify its details
   - Use the delete icon to remove a task

4. **Generating Reports:**
   - Filter tasks by date range and/or other filters and click the "Filter" button. Click "Today" or "Current Reporting Period" for quick date range filtering
   - Click the "Generate Report" button
   - View and export the formatted report grouped by task type

5. **Using AI Summarization:**
   - On the Task Tracker page, filter tasks by date range and/or other filters and click the "Filter" button
   - Click the "AI Summary" button to navigate to the AI Task Summary page
   - Select your preferred AI model (LM Studio or OpenAI GPT-4o)
   - Review the auto-generated task summary
   - Optionally upload a previous HR self-feedback file (.md) for additional context
   - Send to AI to generate a structured self-feedback draft
   - The AI will organize your content into Summary, Growth, Achievements, and Future Goals sections
   - Use the "Download as Markdown" button to save the AI summary to your computer

6. **Configuring Settings:**
   - Access the Settings page via the navigation menu
   - **General Settings:** Configure basic application settings (reporting start date for now)
   - **Categories:** Manage task categories (add, edit, delete, and reorder)
   - **Tags:** Organize and manage tags for task categorization
   - **Automation:** Create and manage task automation rules
   - **AI Config:** Manage API keys and AI API endpoints.

7. **Task Automation Rules:**
   - Set up patterns to automatically assign categories and tags when they appear in task descriptions or links
   - Create multiple rules with different triggers (description or link field)
   - Rules are applied in real-time as you type in the task form
   - Streamlines categorization for recurring task types
