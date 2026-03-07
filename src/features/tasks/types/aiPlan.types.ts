/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * AI Plan Result Types
 */

export interface TaskItem {
    content: string;
    targetDate: string; // Format: "YYYY-MM-DD"
}

export interface WeekGoal {
    title: string;
    tasks: TaskItem[];
}

export interface PlanData {
    goal: {
        weekGoals: WeekGoal[];
    };
}
