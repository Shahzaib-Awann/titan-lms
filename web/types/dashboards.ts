import { BatchStatus } from "./common";

export interface DashboardBatchSchedule {
  id: string;
  weekday: string;
  startTime: string;
  endTime: string;
  room: string | null;
}

export interface DashboardBatch {
  batchId: string;
  courseName: string;
  batchName: string;
  duration: number;
  startDate: Date;
  endDate: Date | null;
  schedule: DashboardBatchSchedule[];
}

export interface DashboardBatchesResponse {
  success: boolean;
  message?: string;
  data: DashboardBatch[];
}