
const page = async ({ params }: { params: Promise<{ slug: string; subPage: string }> }) => {
  const { slug , subPage } = await params;

  return <div>admin/{slug}/{subPage}</div>;
};

export default page;