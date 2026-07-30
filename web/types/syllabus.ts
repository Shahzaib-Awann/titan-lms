
// Syllabus Builder Types
export interface SyllabusLesson {
  id: string | null;
  title: string;
  description: string | null;
  orderIndex: number;
}

export interface SyllabusModule {
  id: string | null;
  title: string;
  description: string | null;
  orderIndex: number;
  lessons: SyllabusLesson[];
}


// Syllabus Overview Page Types
export interface SyllabusBatchProgress {
  id: string;
  name: string;
  trainer: string;
  startDate: Date;
  studentCount: number;
  progressPercentage: number;
}

export interface CourseSyllabusSummary {
  id: string;
  title: string;
  description: string | null;
  durationWeeks: number | null;
  moduleCount: number;
  lessonCount: number;
  hasSyllabus: boolean;
  batches: SyllabusBatchProgress[];
}