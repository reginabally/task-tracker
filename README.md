# Task Tracker

An open-source task tracking tool designed to help individuals and teams log daily work activities, organize tasks by type and tag, and generate structured bi-weekly reports. Ideal for professionals who need a lightweight and customizable way to document their work for performance reviews or team updates. The integrated AI summarization feature helps transform raw task lists into well-structured HR self-feedback drafts.

🛠 Built with Next.js App Router, Tailwind CSS, and Prisma.  
📅 Designed for fixed 2-week reporting cycles.  
📦 Local setup with SQLite and zero external services.  
🤖 AI-powered self-feedback generation with LM Studio integration.

## Technologies

- **Frontend:** React 19, Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend:** Next.js Server Actions, Prisma ORM
- **Database:** SQLite (customizable via Prisma)
- **Date Handling:** date-fns, dayjs
- **UI Components:** react-datepicker
- **AI Integration:** LM Studio

## Features

- **Task Management:** Add, edit, and delete tasks with descriptions, types, tags, dates, and external links
- **Smart Categorization:** Organize tasks by predefined types and tags
- **Custom Filtering:** Filter tasks by type, tag, date, or reporting period
- **Reporting:** Generate formatted reports grouped by task type
- **Fixed Reporting Periods:** Automatically track 2-week reporting cycles
- **Dynamic Tags:** Create new tags on-the-fly during task entry
- **AI Summarization:** Transform task lists into structured self-feedback drafts using LM Studio
  - Generate summaries organized by section (Summary, Growth, Achievements, Future Goals)
  - Upload previous HR self-feedback for context-aware summaries
  - Customize prompts for personalized summary generation
  - First-person voice summaries ready for performance reviews

## Setup and Installation

### Prerequisites
- Node.js (v18 or newer)
- npm or yarn

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/reginabally/task-tracker.git
   cd task-tracker
   ```

2. **Install required packages**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Setup the database**
   
   First, rename the `.env.sample` file to `.env`.

   Then run:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. **Import seed data**

   Review and edit the seed data for task types and tags in `/prisma/seed.ts` if needed. Change the reporting period in `.env`.

   Then run:
   ```bash
   npx prisma db seed
   ```

   This will populate the database with task types, tags, and initialize the reporting period.

5. **Build and run the server**
   
   For development:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   For production:
   ```bash
   npm run build
   npm start
   # or
   yarn build
   yarn start
   ```

6. **Access the application**
   
   Open [http://localhost:3000](http://localhost:3000) in your browser. You will be automatically redirected to the /tasks page.

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
   - Review the auto-generated task summary
   - Optionally upload a previous HR self-feedback file (.md) for additional context
   - Send to AI to generate a structured self-feedback draft
   - The AI will organize your content into Summary, Growth, Achievements, and Future Goals sections
