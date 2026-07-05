import EditInterestClient from "@/components/EditInterestClient";

export default function EditInterestPage({
  params,
}: {
  params: { id: string };
}) {
  return <EditInterestClient id={params.id} />;
}
