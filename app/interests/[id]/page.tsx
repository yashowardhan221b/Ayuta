import InterestDetailClient from "@/components/InterestDetailClient";

export default function InterestPage({ params }: { params: { id: string } }) {
  return <InterestDetailClient id={params.id} />;
}
