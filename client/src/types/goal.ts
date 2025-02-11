// types/goal.ts
export interface Goal {
    id: string;
    userId: string;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    color: string;
    impact: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface GoalDTO {
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    color: string;
    impact: number;
}

export interface DateRange {
    start: Date | null;
    end: Date | null;
}