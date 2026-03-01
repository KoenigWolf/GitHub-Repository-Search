import type { GitHubOwner, GitHubRepository, GitHubSearchResponse } from "@/types/github";

export const mockOwner: GitHubOwner = {
  login: "facebook",
  avatar_url: "https://avatars.githubusercontent.com/u/69631?v=4",
  html_url: "https://github.com/facebook",
};

export const mockRepository: GitHubRepository = {
  id: 10270250,
  name: "react",
  full_name: "facebook/react",
  description: "A declarative, efficient, and flexible JavaScript library for building user interfaces.",
  html_url: "https://github.com/facebook/react",
  owner: mockOwner,
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

export const mockRepository2: GitHubRepository = {
  id: 70107786,
  name: "next.js",
  full_name: "vercel/next.js",
  description: "The React Framework for the Web",
  html_url: "https://github.com/vercel/next.js",
  owner: {
    login: "vercel",
    avatar_url: "https://avatars.githubusercontent.com/u/14985020?v=4",
    html_url: "https://github.com/vercel",
  },
  language: "TypeScript",
  stargazers_count: 120000,
  watchers_count: 120000,
  forks_count: 25000,
  open_issues_count: 2500,
  updated_at: "2024-01-14T08:00:00Z",
  topics: ["nextjs", "react", "typescript", "framework"],
  visibility: "public",
  default_branch: "canary",
};

export const mockSearchResponse: GitHubSearchResponse = {
  total_count: 2,
  incomplete_results: false,
  items: [mockRepository, mockRepository2],
};
