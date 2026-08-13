import React from "react";

const page = async ({
  params,
}: {
  params: Promise<{ batchId: string; slug: string }>;
}) => {
  const { batchId, slug } = await params;
  return (
    <div>
      batchId - {batchId} and slug - {slug}
    </div>
  );
};

export default page;
