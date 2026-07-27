export interface Lesson {
  id: string | null;
  title: string;
  description: string | null;
  orderIndex: number;
}

export interface ModuleWithLessons {
  id: string | null;
  title: string;
  description: string | null;
  orderIndex: number;
  lessons: Lesson[];
}