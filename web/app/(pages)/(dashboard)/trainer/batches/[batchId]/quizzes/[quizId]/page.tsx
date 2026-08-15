import React from "react";
import { notFound } from "next/navigation";

import QuizzesClientPage from "./_components/quizzes-client-page";
import { getManualQuizForEdit } from "@/lib/actions/quizzes.action";

const ManageQuizPage = async ({
  params,
}: {
  params: Promise<{ batchId: string; quizId: string }>;
}) => {
  const { batchId, quizId } = await params;

  const editMode = quizId !== "create";

  let initialData;

  if (editMode) {
    const result = await getManualQuizForEdit(quizId, batchId);

    if (!result.success || !result.data) {
      notFound();
    }

    initialData = result.data;
  }

  return (
    <QuizzesClientPage
      batchId={batchId}
      mode={editMode ? "edit" : "create"}
      initialData={initialData}
    />
  );
};

export default ManageQuizPage;
