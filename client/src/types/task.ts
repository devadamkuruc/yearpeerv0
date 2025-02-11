// types/task.ts

export interface Task {
    id: string;
    userId: string;
    goalId?: string;
    title: string;
    description?: string;
    date: Date;
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// DTO for creating/updating tasks
export interface TaskDTO {
    title: string;
    description?: string;
    date: Date;
    goalId?: string;
    completed: boolean;
}

// For grouping tasks by date
export interface DayTasks {
    [date: string]: Task[];  // key is date in 'yyyy-MM-dd' format
}
