interface Task {
  id: string;
  description: string | null;
  date: Date;
  link: string | null;
  typeId: string | null;
  createdAt: Date;
}

export interface TaskWithType extends Task {
  type: {
    name: string;
    label: string;
  } | null;
  tags: {
    tag: {
      name: string;
      label: string;
    };
  }[];
}

function groupTasksByType(tasks: TaskWithType[]) {
  return tasks.reduce((acc, task) => {
    // Skip tasks with no type
    if (!task.type) return acc;
    
    const typeName = task.type.name;
    if (!acc[typeName]) {
      acc[typeName] = {
        label: task.type.label,
        tasks: []
      };
    }
    acc[typeName].tasks.push(task);
    return acc;
  }, {} as Record<string, { label: string; tasks: TaskWithType[] }>);
}

export function generateReportHTML(tasks: TaskWithType[]): string {
  const groupedTasks = groupTasksByType(tasks);
  let html = '';

  // Don't sort types by name, preserve insertion order from database
  const taskTypeEntries = Object.entries(groupedTasks);

  // Add each task type section
  for (const [, { label, tasks: originalTasks }] of taskTypeEntries) {
    if (originalTasks.length > 0) {
      html += `<h3>${label}</h3>`;
      
      // Special handling for MANUAL_REVIEW_WORK type
      if (label === 'Manual Review Work') {
        // Filter Slack ping tasks
        const slackPingTasks = originalTasks.filter(task => 
          task.tags.some(tag => tag.tag.name === 'slack-ping')
        );
        
        // Filter out Slack ping tasks for the regular list
        const filteredTasks = originalTasks.filter(task => 
          !task.tags.some(tag => tag.tag.name === 'slack-ping')
        );
        
        // Sort tasks by date in ascending order
        const sortedTasks = filteredTasks.sort((a, b) => a.date.getTime() - b.date.getTime());
        
        // Create a bulleted list for tasks
        html += `<ul>`;
        
        // Add Slack ping summary as the first bullet point if there are any
        if (slackPingTasks.length > 0) {
          html += `<li>${slackPingTasks.length} Slack ${slackPingTasks.length === 1 ? 'ping' : 'pings'} answered</li>`;
        }
        
        // Add the rest of the tasks
        for (const task of sortedTasks) {
          const linkHtml = task.link ? ` <a href="${task.link}">#</a>` : '';
          const description = task.description || '(No description)';
          html += `<li>${description}${linkHtml}</li>`;
        }
        
        html += `</ul>`;
      } else {
        // For non-MANUAL_REVIEW_WORK types, just show all tasks
        // Sort tasks by date in ascending order
        const sortedTasks = originalTasks.sort((a, b) => a.date.getTime() - b.date.getTime());
        
        // Create a bulleted list for tasks
        html += `<ul>`;
        for (const task of sortedTasks) {
          const linkHtml = task.link ? ` <a href="${task.link}">#</a>` : '';
          const description = task.description || '(No description)';
          html += `<li>${description}${linkHtml}</li>`;
        }
        html += `</ul>`;
      }
    }
  }

  return html;
}

export function generateReportMarkdown(tasks: TaskWithType[]): string {
  const groupedTasks = groupTasksByType(tasks);
  let markdown = '';

  // Don't sort types by name, preserve insertion order from database
  const taskTypeEntries = Object.entries(groupedTasks);

  // Add each task type section
  for (const [, { label, tasks: originalTasks }] of taskTypeEntries) {
    if (originalTasks.length > 0) {
      markdown += `### ${label}\n\n`;
      
      // Special handling for MANUAL_REVIEW_WORK type
      if (label === 'Manual Review Work') {
        // Filter Slack ping tasks
        const slackPingTasks = originalTasks.filter(task => 
          task.tags.some(tag => tag.tag.name === 'slack-ping')
        );
        
        // Filter out Slack ping tasks for the regular list
        const filteredTasks = originalTasks.filter(task => 
          !task.tags.some(tag => tag.tag.name === 'slack-ping')
        );
        
        // Sort tasks by date in ascending order
        const sortedTasks = filteredTasks.sort((a, b) => a.date.getTime() - b.date.getTime());
        
        // Add Slack ping summary as the first bullet point if there are any
        if (slackPingTasks.length > 0) {
          markdown += `- ${slackPingTasks.length} Slack ${slackPingTasks.length === 1 ? 'ping' : 'pings'} answered\n`;
        }
        
        // Add the rest of the tasks
        for (const task of sortedTasks) {
          const link = task.link ? ` [#](${task.link})` : '';
          const description = task.description || '(No description)';
          markdown += `- ${description}${link}\n`;
        }
        
        markdown += '\n';
      } else {
        // For non-MANUAL_REVIEW_WORK types, just show all tasks
        // Sort tasks by date in ascending order
        const sortedTasks = originalTasks.sort((a, b) => a.date.getTime() - b.date.getTime());
        
        for (const task of sortedTasks) {
          const link = task.link ? ` [#](${task.link})` : '';
          const description = task.description || '(No description)';
          markdown += `- ${description}${link}\n`;
        }
        
        markdown += '\n';
      }
    }
  }

  return markdown;
} 