"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Interest, PathId } from "@/lib/types";
import { INTEREST_ICONS } from "@/lib/icons";
import { INTEREST_COLORS } from "@/lib/colors";
import { createInterest, updateInterest } from "@/lib/interests";
import PathPicker from "./PathPicker";

export default function AddEditInterestForm({
  interest,
}: {
  interest?: Interest;
}) {
  const router = useRouter();
  const isEdit = !!interest;

  const [name, setName] = useState(interest?.name ?? "");
  const [icon, setIcon] = useState(interest?.icon ?? INTEREST_ICONS[0]);
  const [color, setColor] = useState(interest?.color ?? INTEREST_COLORS[0]);
  const [category, setCategory] = useState(interest?.category ?? "");
  const [pathId, setPathId] = useState<PathId>("dabble");
  const [customHours, setCustomHours] = useState(50);
  const [error, setError] = useState("");

  const submit = () => {
    if (!name.trim()) {
      setError("Give your interest a name.");
      return;
    }
    if (isEdit && interest) {
      updateInterest(interest.id, { name, icon, color, category });
      router.push(`/interests/${interest.id}`);
    } else {
      const preset = { dabble: 20, hobbyist: 100, serious: 1000, mastery: 10000 };
      const hours =
        pathId === "custom"
          ? customHours
          : preset[pathId as keyof typeof preset] ?? 20;
      const created = createInterest({
        name,
        icon,
        color,
        pathId,
        targetHours: hours,
        category: category || undefined,
      });
      router.push(`/interests/${created.id}`);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm text-muted mb-1">Name</label>
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          placeholder="e.g. Guitar, Spanish, Chess…"
          className="w-full rounded-lg bg-raised border border-border px-3 py-2 text-text min-h-[44px]"
          autoFocus
        />
        {error && <p className="text-xs text-wrong mt-1">{error}</p>}
      </div>

      <div>
        <label className="block text-sm text-muted mb-1">Icon</label>
        <div className="flex items-center gap-2 mb-2">
          <div
            className="h-11 w-11 rounded-lg flex items-center justify-center text-2xl border border-border"
            style={{ background: `${color}22` }}
          >
            {icon}
          </div>
          <input
            value={icon}
            onChange={(e) => setIcon(e.target.value.slice(0, 4) || "🎯")}
            className="w-20 rounded-lg bg-raised border border-border px-3 py-2 text-text text-center min-h-[44px]"
            aria-label="Custom emoji"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {INTEREST_ICONS.slice(0, 24).map((ic) => (
            <button
              key={ic}
              type="button"
              onClick={() => setIcon(ic)}
              className={`h-9 w-9 rounded-lg text-lg flex items-center justify-center border ${
                icon === ic ? "border-accent" : "border-border"
              }`}
            >
              {ic}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm text-muted mb-1">Color</label>
        <div className="flex flex-wrap gap-2">
          {INTEREST_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`h-8 w-8 rounded-full border-2 ${
                color === c ? "border-white" : "border-transparent"
              }`}
              style={{ background: c }}
              aria-label={c}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm text-muted mb-1">
          Category <span className="text-dim">(optional)</span>
        </label>
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g. Music, Languages, Sport…"
          className="w-full rounded-lg bg-raised border border-border px-3 py-2 text-text min-h-[44px]"
        />
      </div>

      {!isEdit && (
        <div>
          <label className="block text-sm text-muted mb-2">
            Choose a Path — how far do you want to take this?
          </label>
          <PathPicker
            pathId={pathId}
            customHours={customHours}
            onChange={(p, h) => {
              setPathId(p);
              if (p === "custom") setCustomHours(h);
            }}
          />
          <p className="text-xs text-dim mt-2">
            You can promote to a bigger Path later — your hours carry over.
          </p>
        </div>
      )}

      <button
        onClick={submit}
        className="w-full rounded-lg bg-accent py-3 font-medium text-white min-h-[48px]"
      >
        {isEdit ? "Save changes" : "Create interest"}
      </button>
    </div>
  );
}
