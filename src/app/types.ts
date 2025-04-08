/**
 * Task interface representing a task in the system
 */
export interface Task {
  id: string;
  description: string;
  date: Date;
  link: string | null;
  type: {
    name: string;
    label: string;
  };
  tags: {
    tag: {
      name: string;
      label: string;
    };
  }[];
} 