import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import styles from "./TagCategoryManager.module.scss";
import TagCategoryCard from "../components/TagCategoryCard";
import TagCategoryForm from "../components/TagCategoryForm";
import sample from "../data/sampleData.json";
import type {
  ITagCategory,
  TagCategoryFormValues,
} from "../interfaces";

const nowIso = () => new Date().toISOString();
const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `tc-${Date.now()}`;

const Index: React.FC = () => {
  const [categories, setCategories] = useState<ITagCategory[]>([]);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editItem, setEditItem] = useState<ITagCategory | null>(null);

  useEffect(() => {
    const data = (sample as unknown as ITagCategory[]).filter(
      (c) => !c.deleted
    );
    setCategories(data);
  }, []);

  const handleCreate = (values: TagCategoryFormValues) => {
    const created: ITagCategory = {
      ...values,
      id: newId(),
      createdAt: nowIso(),
      lastUpdatedAt: nowIso(),
      deleted: false,
      description: values.description?.trim() || "",
      metadataConfig: {
        caseSensitive: values.metadataConfig.caseSensitive ?? false,
        matchThreshold: values.metadataConfig.matchThreshold,
        rules: values.metadataConfig.rules ?? [],
      },
      subCategories: values.subCategories?.map((s) => ({ ...s })) ?? [],
    };
    setCategories((prev) => [created, ...prev]);
    setShowForm(false);
  };

  const handleEdit = (values: TagCategoryFormValues) => {
    if (!editItem) return;
    setCategories((prev) =>
      prev.map((c) =>
        c.id === editItem.id
          ? {
              ...c,
              ...values,
              description: values.description?.trim() || "",
              lastUpdatedAt: nowIso(),
            }
          : c
      )
    );
    setEditItem(null);
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    const item = categories.find((c) => c.id === id);
    if (!item) return;
    if (
      window.confirm(
        `Delete "${item.name}"? This is a soft delete and can be undone by editing data.`
      )
    ) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, deleted: true, lastUpdatedAt: nowIso() } : c
        )
      );
    }
  };

  const visible = useMemo(
    () => categories.filter((c) => !c.deleted),
    [categories]
  );

  return (
    <main className={styles.container}>
      <Helmet>
        <title>Tag Category Management | Admin</title>
        <meta
          name="description"
          content="Manage tag categories: create, edit, and soft delete with nested metadata and sub-categories."
        />
        {typeof window !== "undefined" && (
          <link rel="canonical" href={window.location.href} />
        )}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Tag Category Management",
            description:
              "CRUD for tag categories with metadata and sub-categories",
          })}
        </script>
      </Helmet>

      <header className={styles.header}>
        <h1 className={styles.h1}>Tag Category Management</h1>
        <div className={styles.actions}>
          <button
            className={`${styles.btn} ${styles.primary}`}
            onClick={() => {
              setEditItem(null);
              setShowForm((s) => !s);
            }}
          >
            {showForm && !editItem ? "Close" : "Add Category"}
          </button>
        </div>
      </header>

      {showForm && (
        <section className={styles.formWrap}>
          <TagCategoryForm
            mode={editItem ? "edit" : "create"}
            initial={editItem}
            onCancel={() => {
              setShowForm(false);
              setEditItem(null);
            }}
            onSubmit={(vals) =>
              editItem ? handleEdit(vals) : handleCreate(vals)
            }
          />
        </section>
      )}

      <section className={styles.grid} aria-live="polite">
        {visible.map((cat) => (
          <TagCategoryCard
            key={cat.id}
            category={cat}
            onEdit={(c) => {
              setEditItem(c);
              setShowForm(true);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onDelete={handleDelete}
          />
        ))}
        {visible.length === 0 && (
          <div className={styles.empty}>
            No categories yet. Click “Add Category” to create your first one.
          </div>
        )}
      </section>

      <aside className={styles.legend}>
        <p>
          Status, precision, and group control how tags behave in your system.
          Use metadata rules for matching or replacing patterns.
        </p>
      </aside>
    </main>
  );
};

export default Index;
