const page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;

  return <div>trainer/{slug}</div>;
};

export default page;
