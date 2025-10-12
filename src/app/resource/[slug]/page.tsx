import { Metadata } from "next";
import ResourceDetailClient from "./ResourceDetailClient";

type Props = { params: any };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Fetch resource data for metadata
  const slug = params?.slug;

  return {
    title: `Resource: ${slug}`,
    description: `Detailed information about ${slug} Korean learning resource`,
  };
}

export default function ResourceDetailPage({ params }: Props) {
  return <ResourceDetailClient slug={params?.slug} />;
}

