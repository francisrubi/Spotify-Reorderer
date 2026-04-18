import {
  ALBUM_FIELDS,
  DIR_CATEGORY,
  MAX_SORT_CRITERIA,
  SORT_FIELDS,
} from "../constants";
import { t, type MessageKey } from "../i18n";
import type { SortCriterion, SortField, SortOrder } from "../types";

interface SortCriteriaEditorProps {
  criteria: SortCriterion[];
  onChange: (criteria: SortCriterion[]) => void;
  onApply: () => void;
  loading: boolean;
}

const selectCls =
  "bg-spotify-hover text-white border-0 rounded px-3 py-2 text-sm cursor-pointer focus:outline-1 focus:outline-spotify-green";

function isAlbumField(f: SortField): boolean {
  return (ALBUM_FIELDS as SortField[]).includes(f);
}

function sanitize(criteria: SortCriterion[]): SortCriterion[] {
  return criteria.map((c, i) => {
    if (c.field !== "track_position") return c;
    if (i === 0 || !isAlbumField(criteria[i - 1].field)) {
      return { field: "name", order: c.order };
    }
    return c;
  });
}

function availableFields(index: number, criteria: SortCriterion[]) {
  const usedElsewhere = new Set(
    criteria.filter((_, i) => i !== index).map((c) => c.field)
  );
  return SORT_FIELDS.filter((f) => {
    if (usedElsewhere.has(f.value)) return false;
    if (f.value !== "track_position") return true;
    if (index === 0) return false;
    return isAlbumField(criteria[index - 1].field);
  });
}

function firstUnusedField(criteria: SortCriterion[]): SortField {
  const used = new Set(criteria.map((c) => c.field));
  for (const f of SORT_FIELDS) {
    if (f.value === "track_position") continue;
    if (!used.has(f.value)) return f.value;
  }
  return "name";
}

export function SortCriteriaEditor({
  criteria,
  onChange,
  onApply,
  loading,
}: SortCriteriaEditorProps) {
  const update = (index: number, patch: Partial<SortCriterion>) => {
    const next = criteria.map((c, i) => (i === index ? { ...c, ...patch } : c));
    onChange(sanitize(next));
  };

  const add = () => {
    if (criteria.length < MAX_SORT_CRITERIA) {
      onChange([
        ...criteria,
        { field: firstUnusedField(criteria), order: "asc" },
      ]);
    }
  };

  const remove = (index: number) => {
    if (criteria.length > 1) {
      onChange(sanitize(criteria.filter((_, i) => i !== index)));
    }
  };

  const clearFields = () => {
    onChange([{ field: "name", order: "asc" }]);
  };

  const canAdd = criteria.length < MAX_SORT_CRITERIA;

  return (
    <section className="bg-spotify-bg-elevated p-5 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base text-spotify-text-muted">{t("sort.title")}</h3>
        <button
          onClick={clearFields}
          className="text-xs text-spotify-text-muted hover:text-white uppercase tracking-wider transition-colors cursor-pointer"
        >
          {t("sort.clear")}
        </button>
      </div>

      <div className="flex flex-col gap-3 md:gap-2">
        {criteria.map((criterion, index) => {
          const fields = availableFields(index, criteria);
          const dirCat = DIR_CATEGORY[criterion.field];
          const ascLabel = t(`sort.dir.${dirCat}.asc` as MessageKey);
          const descLabel = t(`sort.dir.${dirCat}.desc` as MessageKey);
          return (
            <div
              key={index}
              className="flex items-start md:items-center gap-2"
            >
              <span className="text-spotify-text-muted w-5 flex-shrink-0 pt-2 md:pt-0">
                {index + 1}.
              </span>
              <div className="flex-1 min-w-0 flex flex-col gap-2 md:flex-row md:items-center">
                <select
                  value={criterion.field}
                  onChange={(e) =>
                    update(index, { field: e.target.value as SortField })
                  }
                  className={`${selectCls} w-full md:flex-1 md:min-w-[150px]`}
                >
                  {fields.map((f) => (
                    <option key={f.value} value={f.value}>
                      {t(f.labelKey)}
                    </option>
                  ))}
                </select>
                <select
                  value={criterion.order}
                  onChange={(e) =>
                    update(index, { order: e.target.value as SortOrder })
                  }
                  className={`${selectCls} w-full md:flex-1 md:min-w-[150px]`}
                >
                  <option value="asc">{ascLabel}</option>
                  <option value="desc">{descLabel}</option>
                </select>
              </div>
              {criteria.length > 1 && (
                <button
                  onClick={() => remove(index)}
                  className="text-spotify-text-muted hover:text-spotify-error text-2xl px-2 cursor-pointer flex-shrink-0 leading-none pt-1 md:pt-0"
                  aria-label={t("sort.remove")}
                  title={t("sort.remove")}
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3 mt-5">
        {canAdd && (
          <>
            <button
              onClick={add}
              aria-label={t("sort.add")}
              title={t("sort.add")}
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-full border border-spotify-green text-spotify-green hover:bg-spotify-green/10 transition-colors text-xl leading-none cursor-pointer flex-shrink-0"
            >
              +
            </button>
            <button
              onClick={add}
              className="hidden md:inline-flex items-center border border-spotify-green text-spotify-green hover:bg-spotify-green/10 rounded-pill px-4 py-2 text-sm font-medium transition-colors cursor-pointer"
            >
              {t("sort.addDesktop")}
            </button>
          </>
        )}
        <button
          onClick={onApply}
          disabled={loading}
          className="bg-spotify-green hover:bg-spotify-green-hover disabled:opacity-60 disabled:cursor-not-allowed rounded-pill px-5 py-2 text-sm font-medium md:px-4 md:py-2 md:text-sm md:font-medium transition-colors cursor-pointer"
        >
          {loading ? t("sort.applying") : t("sort.apply")}
        </button>
      </div>
    </section>
  );
}
