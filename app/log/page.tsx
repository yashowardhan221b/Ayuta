import Link from "next/link";
import ManualLogForm from "@/components/ManualLogForm";

export default function LogPage({
  searchParams,
}: {
  searchParams: { interest?: string };
}) {
  return (
    <div className="space-y-4">
      <Link href="/" className="text-sm text-muted">
        ← Back
      </Link>
      <div>
        <h1 className="text-xl font-semibold">Log time</h1>
        <p className="text-sm text-muted">
          Record a session you&apos;ve already done — even from earlier today or a
          past day.
        </p>
      </div>
      <ManualLogForm initialInterestId={searchParams.interest} />
    </div>
  );
}
