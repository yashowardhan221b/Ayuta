"use client";

import Link from "next/link";
import { useHydrated } from "@/lib/hooks";
import { getInterest } from "@/lib/interests";
import AddEditInterestForm from "./AddEditInterestForm";

export default function EditInterestClient({ id }: { id: string }) {
  const hydrated = useHydrated();
  if (!hydrated) {
    return <div className="h-64 rounded-2xl bg-surface animate-pulse" />;
  }
  const interest = getInterest(id);
  if (!interest) {
    return (
      <div className="text-center py-16">
        <p className="text-muted mb-4">This interest doesn&apos;t exist.</p>
        <Link href="/" className="text-accent">
          ← Back home
        </Link>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <Link href={`/interests/${id}`} className="text-sm text-muted">
        ← Back
      </Link>
      <h1 className="text-xl font-semibold">Edit {interest.name}</h1>
      <AddEditInterestForm interest={interest} />
      <p className="text-xs text-dim">
        To change how far you&apos;re taking this, use “Change Path” on the
        interest page — that keeps your hours and history.
      </p>
    </div>
  );
}
