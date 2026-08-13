import BatchesPageContent from "@/components/pages/batches/batches-page-content";

const BatchesPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    sort?: "asc" | "desc";
  }>;
}) => {
  const { search, sort } = await searchParams;

  return <BatchesPageContent role="trainer" search={search} sort={sort} />;
};

export default BatchesPage;
