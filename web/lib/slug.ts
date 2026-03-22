import { randomUUID } from "crypto";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildWeddingSlug(title: string): string {
  const base = slugify(title) || "happy-wedding";
  return `${base}-${randomUUID().slice(0, 8)}`;
}