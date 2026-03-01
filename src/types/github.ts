export interface GitHubOwner {
  login: string;
  avatar_url: string;
  html_url: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  owner: GitHubOwner;
  language: string | null;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  updated_at: string;
  topics: string[];
  visibility: string;
  default_branch: string;
}

export interface GitHubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubRepository[];
}

export interface SearchParams {
  query: string;
  sort?: "stars" | "forks" | "updated" | "best-match";
  order?: "asc" | "desc";
  page?: number;
  per_page?: number;
}

export interface SearchResult {
  repositories: GitHubRepository[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}
