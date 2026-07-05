"use client";

import { useState } from "react";
import type { Interest, PathId } from "@/lib/types";
import { promoteInterest } from "@/lib/interests";
import { pathLabel } from "@/lib/paths";
import Modal from "./Modal";
import PathPicker from "./PathPicker";

export default function PromotePathModal({
  interest,
  open,
  onClose,
  onChanged,
}: {
  interest: Interest;
  open: boolean;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [pathId, setPathId] = useState<PathId>(interest.pathId);
  const [customHours, setCustomHours] = useState(
    interest.pathId === "custom" ? interest.targetHours : interest.targetHours + 50
  );

  const apply = () => {
    promoteInterest(interest.id, pathId, pathId === "custom" ? customHours : undefined);
    onChanged();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Change Path">
      <p className="text-sm text-muted mb-4">
        Currently on <strong>{pathLabel(interest)}</strong> ({interest.targetHours}h
        target). Aim higher — your logged hours carry over.
      </p>
      <PathPicker
        pathId={pathId}
        customHours={customHours}
        onChange={(p, h) => {
          setPathId(p);
          if (p === "custom") setCustomHours(h);
        }}
      />
      <div className="flex gap-2 mt-5">
        <button
          onClick={onClose}
          className="flex-1 rounded-lg border border-border py-2.5 text-sm text-muted min-h-[44px]"
        >
          Cancel
        </button>
        <button
          onClick={apply}
          className="flex-1 rounded-lg bg-accent py-2.5 text-sm font-medium text-white min-h-[44px]"
        >
          Set Path
        </button>
      </div>
    </Modal>
  );
}
