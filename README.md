# Task Tracker

A comprehensive task management application designed to help track daily work activities, generate reports, and summarize accomplishments. Perfect for team members who need to document their work for reporting periods.

## Technologies

- **Frontend:** React 19, Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend:** Next.js Server Actions, Prisma ORM
- **Database:** SQLite (customizable via Prisma)
- **Date Handling:** date-fns, dayjs
- **UI Components:** react-datepicker

## Features

- **Task Management:** Add, edit, and delete tasks with descriptions, types, tags, dates, and external links
- **Smart Categorization:** Organize tasks by predefined types and tags
- **Custom Filtering:** Filter tasks by type, tag, date, or reporting period
- **Reporting:** Generate formatted reports grouped by task type
- **Fixed Reporting Periods:** Automatically track 2-week reporting cycles
- **Dynamic Tags:** Create new tags on-the-fly during task entry
- **Responsive Design:** Works on desktop and mobile devices

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

## License

MIT License

Copyright (c) 2023 Your Name or Organization

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
