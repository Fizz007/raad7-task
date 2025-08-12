import React, { useEffect, useMemo, useState } from "react";
import styles from "./TagCategoryForm.module.scss";
import type {
  ITagCategory,
  MetadataConfig,
  TagCategoryFormValues,
  Rule,
} from "../interfaces";

import { TagCategoryStatus, PrecisionType, TagGroup } from "../interfaces";

export interface TagCategoryFormProps {
  mode: "create" | "edit";
  initial?: ITagCategory | null;
  onCancel: () => void;
  onSubmit: (values: TagCategoryFormValues) => void;
}

const defaultMetadata: MetadataConfig = {
  caseSensitive: false,
  matchThreshold: 0.9,
  rules: [],
};

const TagCategoryForm: React.FC<TagCategoryFormProps> = ({ mode, initial, onCancel, onSubmit }) => {
  const [values, setValues] = useState<TagCategoryFormValues>(() => ({
    name: "",
    description: "",
    status: TagCategoryStatus.Active,
    precisionType: PrecisionType.Exact,
    group: TagGroup.System,
    metadataConfig: defaultMetadata,
    subCategories: [],
  }));

  useEffect(() => {
    if (mode === "edit" && initial) {
      const { id: _id, createdAt: _c, lastUpdatedAt: _u, deleted: _d, ...rest } = initial;
      setValues({
        ...rest,
        description: rest.description ?? "",
        metadataConfig: {
          caseSensitive: rest.metadataConfig.caseSensitive ?? false,
          matchThreshold: rest.metadataConfig.matchThreshold,
          rules: rest.metadataConfig.rules ?? [],
        },
        subCategories: rest.subCategories ?? [],
      });
    }
  }, [mode, initial]);

  const isEdit = mode === "edit";

  const isValid = useMemo(() => {
    return (
      values.name.trim().length > 0 &&
      values.status !== undefined &&
      values.precisionType !== undefined &&
      values.group !== undefined
    );
  }, [values]);

  const updateField = <K extends keyof TagCategoryFormValues>(key: K, val: TagCategoryFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const addSubCategory = (name: string) => {
    if (!name.trim()) return;
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `sc-${Date.now()}`;
    updateField("subCategories", [...values.subCategories, { id, name: name.trim() }]);
  };

  const removeSubCategory = (id: string) => {
    updateField("subCategories", values.subCategories.filter((s) => s.id !== id));
  };

  const addRule = (rule: Rule) => {
    updateField("metadataConfig", {
      ...values.metadataConfig,
      rules: [...(values.metadataConfig.rules ?? []), rule],
    });
  };

  const removeRule = (index: number) => {
    const next = [...(values.metadataConfig.rules ?? [])];
    next.splice(index, 1);
    updateField("metadataConfig", { ...values.metadataConfig, rules: next });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSubmit(values);
  };

  const [newSub, setNewSub] = useState<string>("");
  const [ruleType, setRuleType] = useState<"match" | "replace">("match");
  const [pattern, setPattern] = useState<string>("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  return (
    <form className={styles["form"]} onSubmit={handleSubmit} noValidate>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>{isEdit ? "Edit Tag Category" : "Create Tag Category"}</legend>

        <div className={styles.grid}>
          <label className={styles.label}>
            <span>Name *</span>
            <input
              className={styles.input}
              type="text"
              value={values.name}
              onChange={(e) => updateField("name", e.currentTarget.value)}
              required
            />
          </label>

          <label className={styles.label}>
            <span>Description</span>
            <input
              className={styles.input}
              type="text"
              value={values.description ?? ""}
              onChange={(e) => updateField("description", e.currentTarget.value)}
            />
          </label>

          <label className={styles.label}>
            <span>Status *</span>
            <select
              className={styles.select}
              value={values.status}
              onChange={(e) => updateField("status", e.currentTarget.value as TagCategoryStatus)}
              required
            >
              {Object.values(TagCategoryStatus).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>

          <label className={styles.label}>
            <span>Precision *</span>
            <select
              className={styles.select}
              value={values.precisionType}
              onChange={(e) => updateField("precisionType", e.currentTarget.value as PrecisionType)}
              required
            >
              {Object.values(PrecisionType).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </label>

          <label className={styles.label}>
            <span>Group *</span>
            <select
              className={styles.select}
              value={values.group}
              onChange={(e) => updateField("group", e.currentTarget.value as TagGroup)}
              required
            >
              {Object.values(TagGroup).map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </label>
        </div>

        <section className={styles.section} aria-label="Metadata Config">
          <h4 className={styles.sectionTitle}>Metadata</h4>
          <div className={styles.metaGrid}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={values.metadataConfig.caseSensitive}
                onChange={(e) => updateField("metadataConfig", { ...values.metadataConfig, caseSensitive: e.currentTarget.checked })}
              />
              <span>Case sensitive</span>
            </label>

            <label className={styles.label}>
              <span>Match threshold</span>
              <input
                className={styles.input}
                type="number"
                step="0.01"
                min={0}
                max={1}
                value={values.metadataConfig.matchThreshold ?? 0}
                onChange={(e) => updateField("metadataConfig", { ...values.metadataConfig, matchThreshold: Number(e.currentTarget.value) })}
              />
            </label>
          </div>

          <div className={styles.rules}>
            <div className={styles.ruleAdder}>
              <select className={styles.select} value={ruleType} onChange={(e) => setRuleType(e.currentTarget.value as any)}>
                <option value="match">match</option>
                <option value="replace">replace</option>
              </select>

              {ruleType === "match" ? (
                <input className={styles.input} placeholder="pattern" value={pattern} onChange={(e) => setPattern(e.currentTarget.value)} />
              ) : (
                <>
                  <input className={styles.input} placeholder="from" value={from} onChange={(e) => setFrom(e.currentTarget.value)} />
                  <input className={styles.input} placeholder="to" value={to} onChange={(e) => setTo(e.currentTarget.value)} />
                </>
              )}

              <button
                type="button"
                className={`${styles.btn} ${styles.add}`}
                onClick={() => {
                  if (ruleType === "match" && pattern.trim()) {
                    addRule({ kind: "match", pattern: pattern.trim() });
                    setPattern("");
                  }
                  if (ruleType === "replace" && from.trim() && to.trim()) {
                    addRule({ kind: "replace", from: from.trim(), to: to.trim() });
                    setFrom("");
                    setTo("");
                  }
                }}
              >
                Add rule
              </button>
            </div>

            <ul className={styles.ruleList}>
              {(values.metadataConfig.rules ?? []).map((r, idx) => (
                <li key={idx} className={styles.ruleItem}>
                  {r.kind === "match" ? (
                    <span>match: <code>{r.pattern}</code></span>
                  ) : (
                    <span>replace: <code>{r.from}</code> → <code>{r.to}</code></span>
                  )}
                  <button type="button" className={`${styles.btn} ${styles.remove}`} onClick={() => removeRule(idx)}>Remove</button>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={styles.section} aria-label="Sub-categories">
          <h4 className={styles.sectionTitle}>Sub-categories</h4>
          <div className={styles.subAdder}>
            <input className={styles.input} placeholder="Name" value={newSub} onChange={(e) => setNewSub(e.currentTarget.value)} />
            <button type="button" className={`${styles.btn} ${styles.add}`} onClick={() => { addSubCategory(newSub); setNewSub(""); }}>Add</button>
          </div>
          <ul className={styles.subList}>
            {values.subCategories.map((s) => (
              <li key={s.id} className={styles.subItem}>
                <span>{s.name}</span>
                <button type="button" className={`${styles.btn} ${styles.remove}`} onClick={() => removeSubCategory(s.id)}>Remove</button>
              </li>
            ))}
          </ul>
        </section>

        <div className={styles.actions}>
          <button type="button" className={`${styles.btn} ${styles.secondary}`} onClick={onCancel}>Cancel</button>
          <button type="submit" className={`${styles.btn} ${styles.primary}`} disabled={!isValid}>
            {isEdit ? "Save Changes" : "Create Category"}
          </button>
        </div>
      </fieldset>
    </form>
  );
};

export default TagCategoryForm;
