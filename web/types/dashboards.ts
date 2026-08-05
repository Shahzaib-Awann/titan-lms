export interface BatchSchedule {
  id: string;
  weekday: string;
  startTime: string;
  endTime: string;
  room: string | null;
}

export interface TrainerBatch {
  batchId: string;
  courseName: string;
  batchName: string;
  duration: number;
  startDate: Date;
  endDate: Date | null;
  status: "scheduled" | "live";
  schedule: BatchSchedule[];
}

export interface TrainerBatchesResponse {
  success: boolean;
  message?: string;
  data: TrainerBatch[];
}