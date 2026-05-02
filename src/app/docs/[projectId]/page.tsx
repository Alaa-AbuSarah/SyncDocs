import { DocsLayout } from "@/components/docs/DocsLayout";

interface Props {
  params: Promise<{ projectId: string }>;
}

export default async function DocsPage({ params }: Props) {
  const { projectId } = await params;
  return <DocsLayout projectId={projectId} />;
}
