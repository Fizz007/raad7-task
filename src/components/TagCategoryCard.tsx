import React from "react";
import styles from "./TagCategoryCard.module.scss";
import type { ITagCategory } from "../interfaces";

export interface TagCategoryCardProps {
  category: ITagCategory;
  onEdit: (category: ITagCategory) => void;
  onDelete: (id: string) => void;
}

const TagCategoryCard: React.FC<TagCategoryCardProps> = ({ category, onEdit, onDelete }) => {
  return (
    <article className={styles.card} aria-label={`Tag category ${category.name}`}>
      <header className={styles.header}>
        <h3 className={styles.title}>{category.name}</h3>
        <div className={styles.badges}>
          <span className={`${styles.badge} ${styles.status} ${styles[category.status]}`}>{category.status}</span>
          <span className={`${styles.badge}`}>{category.precisionType}</span>
          <span className={`${styles.badge}`}>{category.group}</span>
        </div>
      </header>

      {category.description && (
        <p className={styles.description}>{category.description}</p>
      )}

      <section className={styles.meta}>
        <div>
          <span className={styles.metaLabel}>Case sensitive</span>
          <span className={styles.metaValue}>{category.metadataConfig.caseSensitive ? "Yes" : "No"}</span>
        </div>
        {category.metadataConfig.matchThreshold !== undefined && (
          <div>
            <span className={styles.metaLabel}>Threshold</span>
            <span className={styles.metaValue}>{category.metadataConfig.matchThreshold}</span>
          </div>
        )}
        <div>
          <span className={styles.metaLabel}>Rules</span>
          <span className={styles.metaValue}>{category.metadataConfig.rules?.length ?? 0}</span>
        </div>
        <div>
          <span className={styles.metaLabel}>Sub-categories</span>
          <span className={styles.metaValue}>{category.subCategories.length}</span>
        </div>
      </section>

      <footer className={styles.footer}>
        <button className={`${styles.btn} ${styles.edit}`} onClick={() => onEdit(category)} aria-label={`Edit ${category.name}`}>
          Edit
        </button>
        <button
          className={`${styles.btn} ${styles.delete}`}
          onClick={() => onDelete(category.id)}
          aria-label={`Delete ${category.name}`}
        >
          Delete
        </button>
      </footer>
    </article>
  );
};

export default TagCategoryCard;
