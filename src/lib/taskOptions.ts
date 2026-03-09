// カテゴリ名の定数
export const CATEGORY_GENBA = "現場" as const;
export const CATEGORY_JIMUSHO = "事務所" as const;
export const CATEGORY_KAIGI = "会議" as const;

export const FIXED_CATEGORIES = [CATEGORY_GENBA, CATEGORY_JIMUSHO, CATEGORY_KAIGI] as const;

// カテゴリ別の作業内容
export const TASK_OPTIONS_BY_CATEGORY: Record<string, readonly string[]> = {
  [CATEGORY_GENBA]: [
    "進捗確認",
    "部品対応",
    "完成外注対応",
    "移動票配布",
    "書類配布",
    "人探し",
    "その他",
  ],
  [CATEGORY_JIMUSHO]: [
    "平準化",
    "日程作成",
    "完成外注対応",
    "資料作成",
    "納期関係",
    "特注品ポスタ発行",
    "バーコード発行",
    "メール対応",
    "検票手配",
    "電話対応",
    "仕様書整理・確認",
    "納品書発行",
    "圧縮機伝票発行",
    "教育",
    "その他",
  ],
  [CATEGORY_KAIGI]: [
    "HMS活動",
    "生産会議",
    "創造改善",
    "DR",
    "その他",
  ],
};

// 全作業内容（カテゴリ未選択時やフォールバック用）
export const ALL_TASK_OPTIONS = [
  ...new Set(
    Object.values(TASK_OPTIONS_BY_CATEGORY).flat()
  ),
] as const;
