export const APP_NAME = "GitHub Repository Search";

/** @see https://github.com/ozh/github-colors */
export const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  Go: "#00ADD8",
  Rust: "#dea584",
  Ruby: "#701516",
  PHP: "#4F5D95",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Scala: "#c22d40",
  Elixir: "#6e4a7e",
  Clojure: "#db5855",
  Haskell: "#5e5086",
  Lua: "#000080",
  Perl: "#0298c3",
  R: "#198CE7",
  MATLAB: "#e16737",
  "Objective-C": "#438eff",
  "Jupyter Notebook": "#DA5B0B",
  Dockerfile: "#384d54",
  Makefile: "#427819",
  "Vim Script": "#199f4b",
  PowerShell: "#012456",
  Zig: "#ec915c",
  Nim: "#ffc200",
  Crystal: "#000100",
  OCaml: "#3be133",
  "F#": "#b845fc",
  Erlang: "#B83998",
  Julia: "#a270ba",
  Assembly: "#6E4C13",
  VHDL: "#adb2cb",
  Verilog: "#b2b7f8",
  Solidity: "#AA6746",
  Move: "#4a137a",
  Cairo: "#ff4a48",
} as const;

export const DEFAULT_LANGUAGE_COLOR = "#808080";

export const GITHUB_API = {
  BASE_URL: "https://api.github.com",
  SEARCH_REPOS_ENDPOINT: "/search/repositories",
  REPOS_ENDPOINT: "/repos",
  MAX_SEARCH_RESULTS: 1000,
  DEFAULT_PER_PAGE: 30,
  CACHE_SEARCH: 60,
  CACHE_REPO: 300,
} as const;

export const UI = {
  MAX_TOPICS_DISPLAY: 5,
  SKELETON_ITEM_COUNT: 5,
  SKELETON_STAT_CARD_COUNT: 4,
  PAGINATION_DELTA: 1,
} as const;

export const SORT_OPTIONS = [
  { value: "best-match", label: "ベストマッチ" },
  { value: "stars", label: "スター数" },
  { value: "forks", label: "フォーク数" },
  { value: "updated", label: "更新日" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export const SORT_VALUES = SORT_OPTIONS.map((opt) => opt.value) as [SortValue, ...SortValue[]];
