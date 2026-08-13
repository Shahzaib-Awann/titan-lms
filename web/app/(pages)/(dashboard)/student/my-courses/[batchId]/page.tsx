import React from "react";

const BatchesSlugPage = async ({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) => {
  const { batchId } = await params;

  return <div>BatchesSlugPage {batchId}</div>;
};

export default BatchesSlugPage;
