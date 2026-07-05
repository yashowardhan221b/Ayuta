import Link from "next/link";
import AddEditInterestForm from "@/components/AddEditInterestForm";

export default function NewInterestPage() {
  return (
    <div className="space-y-4">
      <Link href="/" className="text-sm text-muted">
        ← Back
      </Link>
      <h1 className="text-xl font-semibold">Add an interest</h1>
      <AddEditInterestForm />
    </div>
  );
}
