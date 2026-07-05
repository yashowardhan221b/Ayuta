import Link from "next/link";
import AddEditInterestForm from "@/components/AddEditInterestForm";

export default function NewInterestPage({
  searchParams,
}: {
  searchParams: { name?: string; icon?: string; color?: string };
}) {
  return (
    <div className="space-y-4">
      <Link href="/" className="text-sm text-muted">
        ← Back
      </Link>
      <h1 className="text-xl font-semibold">Add an interest</h1>
      <AddEditInterestForm
        initial={{
          name: searchParams.name,
          icon: searchParams.icon,
          color: searchParams.color,
        }}
      />
    </div>
  );
}
