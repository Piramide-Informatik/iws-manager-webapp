export interface ReminderLevel {
  id: number;
  createdAt: string;   // ISO format: "2025-06-17T06:21:35.281056"
  updatedAt: string;
  version: number;

  fee?: number;
  interestRate?: number;
  levelNo?: number;
  payPeriod?: number;
  reminderText?: string;
  reminderTitle?: string;
}