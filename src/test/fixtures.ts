import type { GitHubRepository, GitHubSearchResponse } from "@/lib/schemas";

export const mockRepository: GitHubRepository = {
  id: 10270250,
  name: "react",
  full_name: "facebook/react",
  description: "A declarative, efficient, and flexible JavaScript library for building user interfaces.",
  html_url: "https://github.com/facebook/react",
  owner: {
    login: "facebook",
    avatar_url: "https://avatars.githubusercontent.com/u/69631?v=4",
    html_url: "https://github.com/facebook",
  },
  language: "JavaScript",
  stargazers_count: 220000,
  watchers_count: 220000,
  forks_count: 45000,
  open_issues_count: 1500,
  updated_at: "2024-01-15T10:30:00Z",
  topics: ["react", "javascript", "frontend", "ui", "declarative", "component"],
  visibility: "public",
  default_branch: "main",
};

export const mockSearchResponse: GitHubSearchResponse = {
  total_count: 1,
  incomplete_results: false,
  items: [mockRepository],
};
