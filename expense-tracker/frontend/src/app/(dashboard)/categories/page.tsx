"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tags } from "lucide-react";
import { z } from "zod";
import { EmptyState } from "@/components/feedback/EmptyState";
import { SkeletonRows } from "@/components/feedback/Skeleton";
import { Field } from "@/components/forms/Field";
import { FadeIn } from "@/components/motion/FadeIn";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  useArchiveCategory,
  useCategories,
  useCreateCategory,
} from "@/features/categories/hooks";
import type { CategoryNode } from "@/types/api";
import { cn } from "@/lib/utils";

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
            className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/25 px-3.5 py-3 transition-colors hover:bg-muted/50"
            style={{ marginLeft: depth * 12 }}
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                className="h-3.5 w-3.5 shrink-0 rounded-full ring-2 ring-white"
                style={{ backgroundColor: node.color || "#94a3b8" }}
              />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{node.name}</div>
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
    <PageContainer>
      <PageHeader
        title="Categories"
        description="Organize spending and income with a clear hierarchy."
        actions={
          <Button className="w-full sm:w-auto" onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Cancel" : "Add category"}
          </Button>
        }
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {([undefined, "EXPENSE", "INCOME"] as const).map((value) => (
          <Button
            key={String(value)}
            size="sm"
            variant={typeFilter === value ? "default" : "outline"}
            className={cn("shrink-0")}
            onClick={() => setTypeFilter(value)}
          >
            {value ?? "All"}
          </Button>
        ))}
      </div>

      {showForm && (
        <FadeIn variant="scale">
          <Card>
            <CardHeader>
              <CardTitle>New category</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
                <Field id="name" label="Name" error={form.formState.errors.name?.message}>
                  <Input id="name" placeholder="Groceries" {...form.register("name")} />
                </Field>
                <Field id="type" label="Type">
                  <Select id="type" {...form.register("type")}>
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
                  </Select>
                </Field>
                <div className="sm:col-span-2">
                  <Button type="submit" disabled={createCategory.isPending} className="w-full sm:w-auto">
                    {createCategory.isPending ? "Creating…" : "Create category"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      <FadeIn stagger={2}>
        <Card>
          <CardHeader>
            <CardTitle>Category tree</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && <SkeletonRows count={5} />}
            {!isLoading && categories.length === 0 && (
              <EmptyState
                icon={Tags}
                title="No categories found"
                description="Create a category or clear filters to see your list."
              />
            )}
            {!isLoading && categories.length > 0 && (
              <CategoryTree nodes={categories} onArchive={(id) => archiveCategory.mutate(id)} />
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </PageContainer>
  );
}
