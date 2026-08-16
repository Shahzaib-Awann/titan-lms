import {
  getCoursesWithBatchesForEnrollments,
  getStudentEnrollments,
} from "@/lib/actions/enrollment.action";
import EnrollmentClientPage from "@/components/pages/admin/enrollments/enrollment-client-page";
import { Course } from "./create/page";

const EnrollmentsPage = async () => {
  const data = await getStudentEnrollments();
  const coursesData: Course[] = await getCoursesWithBatchesForEnrollments();

  return <EnrollmentClientPage data={data} courses={coursesData} />;
};

export default EnrollmentsPage;
