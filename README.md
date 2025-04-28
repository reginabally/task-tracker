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
- Docker and Docker Compose
- LM Studio (for local AI processing) or OpenAI API key (for cloud AI processing)

### Docker Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/reginabally/task-tracker.git
   cd task-tracker
   ```

2. **Configure environment variables**
   ```bash
   cp .env.sample .env
   ```
   Edit the `.env` file if needed to customize your setup.

3. **Build and start the Docker containers**
   ```bash
   docker-compose up -d
   ```
   This will build the Docker image and start the application in detached mode.

4. **Access the application**
   
   Open [http://localhost:3000](http://localhost:3000) in your browser. You will be automatically redirected to the /tasks page.

5. **Configure AI Integration**

   For **LM Studio** (local AI, default option):
   - Install LM Studio from [lmstudio.ai](https://lmstudio.ai)
   - Launch LM Studio and start the local server
   - Ensure LM Studio is accessible from the Docker container (adjust network settings if needed)
   - The default endpoint is set to `http://host.docker.internal:1234/v1/chat/completions` for Mac/Windows or `http://172.17.0.1:1234/v1/chat/completions` for Linux

   For **OpenAI** (cloud AI):
   - Launch the application and navigate to Settings → AI Config
   - Enter your OpenAI API key in the provided field and click Save
   - Your API key will be stored securely in the database

### Manual Setup (Alternative)

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

   Finally, run:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. **Import seed data**

   Review and edit the seed data for task types and tags in `/prisma/seed.ts` if needed.

   Then run:
   ```bash
   npx prisma db seed
   ```

   This will populate the database with task types, tags, and initialize the reporting period.

5. **Configure AI Integration**

   Follow the AI integration steps from the Docker setup above.

6. **Build and run the server**
   
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

7. **Access the application**
   
   Open [http://localhost:3000](http://localhost:3000) in your browser. You will be automatically redirected to the /tasks page.

## Docker Management

### Viewing Logs
```bash
docker-compose logs -f
```

### Stopping the Application
```bash
docker-compose down
```

### Restarting the Application
```bash
docker-compose restart
```

### Updating to a New Version
```bash
git pull
docker-compose down
docker-compose build
docker-compose up -d
```

### Database Persistence
The SQLite database is stored in a Docker volume to ensure data persistence across container restarts. To backup your data:

```bash
# Find the volume name
docker volume ls

# Create a backup
docker run --rm -v task-tracker_db-data:/data -v $(pwd):/backup alpine tar -czvf /backup/db-backup.tar.gz -C /data .
```

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

7. **Task Automation Rules:**
   - Set up patterns to automatically assign categories and tags when they appear in task descriptions or links
   - Create multiple rules with different triggers (description or link field)
   - Rules are applied in real-time as you type in the task form
   - Streamlines categorization for recurring task types
