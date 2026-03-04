import { z } from "zod";
import { GITHUB_API, SORT_VALUES } from "@/lib/constants";

const GitHubOwnerSchema = z.object({
  login: z.string(),
  avatar_url: z.string().url(),
  html_url: z.string().url(),
});

export const GitHubRepositorySchema = z.object({
  id: z.number(),
  name: z.string(),
  full_name: z.string(),
  description: z.string().nullable(),
  html_url: z.string().url(),
  owner: GitHubOwnerSchema,
  language: z.string().nullable(),
  stargazers_count: z.number(),
  watchers_count: z.number(),
  forks_count: z.number(),
  open_issues_count: z.number(),
  updated_at: z.string().datetime({ offset: true }),
  topics: z.array(z.string()).default([]),
  visibility: z.string().default("public"),
  default_branch: z.string().default("main"),
});

export const GitHubSearchResponseSchema = z.object({
  total_count: z.number(),
  incomplete_results: z.boolean(),
  items: z.array(GitHubRepositorySchema),
});

export type GitHubRepository = z.infer<typeof GitHubRepositorySchema>;
export type GitHubSearchResponse = z.infer<typeof GitHubSearchResponseSchema>;

export const SearchParamsSchema = z.object({
  query: z
    .string()
    .min(1, "Query is required")
    .max(GITHUB_API.MAX_QUERY_LENGTH, "Query is too long"),
  sort: z.enum(SORT_VALUES).default("best-match"),
  order: z.enum(["asc", "desc"]).default("desc"),
  page: z.number().int().positive().default(1),
  per_page: z.number().int().min(1).max(100).default(30),
});

export type SearchParamsInput = z.input<typeof SearchParamsSchema>;

export interface SearchResult {
  repositories: GitHubRepository[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}
