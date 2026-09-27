"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useArchiveCategory,
  useCategories,
  useCreateCategory,
} from "@/features/categories/hooks";
import type { CategoryNode } from "@/types/api";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.enum(["EXPENSE", "INCOME"]),
});

type FormValues = z.infer<typeof schema>;

function CategoryTree({
  nodes,
  onArchive,
  depth = 0,
}: {
  nodes: CategoryNode[];
  onArchive: (id: string) => void;
  depth?: number;
}) {
  return (
    <ul className="space-y-2">
      {nodes.map((node) => (
        <li key={node.id}>
          <div
            className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2"
            style={{ marginLeft: depth * 16 }}
          >
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: node.color || "#94a3b8" }}
              />
              <div>
                <div className="text-sm font-medium">{node.name}</div>
                <div className="text-xs text-muted-foreground">{node.type}</div>
              </div>
            </div>
            {!node.isSystem && !node.archivedAt && (
              <Button variant="outline" size="sm" onClick={() => onArchive(node.id)}>
                Archive
              </Button>
            )}
          </div>
          {node.children?.length > 0 && (
            <CategoryTree nodes={node.children} onArchive={onArchive} depth={depth + 1} />
          )}
        </li>
      ))}
    </ul>
  );
}

export default function CategoriesPage() {
  const [typeFilter, setTypeFilter] = useState<"EXPENSE" | "INCOME" | undefined>(undefined);
  const { data: categories = [], isLoading } = useCategories(typeFilter);
  const createCategory = useCreateCategory();
  const archiveCategory = useArchiveCategory();
  const [showForm, setShowForm] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", type: "EXPENSE" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await createCategory.mutateAsync(values);
    form.reset({ name: "", type: "EXPENSE" });
    setShowForm(false);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
          <p className="text-sm text-muted-foreground">Organize expense and income categories.</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "Add category"}
        </Button>
      </div>

      <div className="flex gap-2">
        {([undefined, "EXPENSE", "INCOME"] as const).map((value) => (
          <Button
            key={String(value)}
            size="sm"
            variant={typeFilter === value ? "default" : "outline"}
            onClick={() => setTypeFilter(value)}
          >
            {value ?? "All"}
          </Button>
        ))}
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New category</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...form.register("name")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  className="flex h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
                  {...form.register("type")}
                >
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <Button type="submit" disabled={createCategory.isPending}>
                  {createCategory.isPending ? "Creating…" : "Create category"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Category tree</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!isLoading && categories.length === 0 && (
            <p className="text-sm text-muted-foreground">No categories found.</p>
          )}
          {!isLoading && categories.length > 0 && (
            <CategoryTree
              nodes={categories}
              onArchive={(id) => archiveCategory.mutate(id)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
