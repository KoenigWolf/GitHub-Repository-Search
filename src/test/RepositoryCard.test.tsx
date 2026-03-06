import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RepositoryCard } from "@/components/repository";
import { mockRepository } from "./fixtures";
import type { GitHubRepository } from "@/lib/schemas";

describe("RepositoryCard", () => {
  it("リポジトリ名を表示する", () => {
    render(<RepositoryCard repository={mockRepository} />);
    expect(screen.getByText("facebook/react")).toBeInTheDocument();
  });

  it("説明を表示する", () => {
    render(<RepositoryCard repository={mockRepository} />);
    expect(
      screen.getByText(/A declarative, efficient, and flexible JavaScript library/)
    ).toBeInTheDocument();
  });

  it("言語を表示する", () => {
    render(<RepositoryCard repository={mockRepository} />);
    expect(screen.getByText("JavaScript")).toBeInTheDocument();
  });

  it("スター数をformatNumber適用済みで表示する", () => {
    render(<RepositoryCard repository={mockRepository} />);
    expect(screen.getByText("220.0k")).toBeInTheDocument();
  });

  it("トピックを表示する", () => {
    render(<RepositoryCard repository={mockRepository} />);
    expect(screen.getByText("react")).toBeInTheDocument();
    expect(screen.getByText("javascript")).toBeInTheDocument();
  });

  it("詳細ページへの正しいhrefを持つ", () => {
    render(<RepositoryCard repository={mockRepository} />);
    const link = screen.getByRole("link", { name: "facebook/react" });
    expect(link).toHaveAttribute("href", "/repositories/facebook/react");
  });

  it("descriptionがnullでもクラッシュしない", () => {
    const repoWithoutDescription: GitHubRepository = {
      ...mockRepository,
      description: null,
    };
    expect(() =>
      render(<RepositoryCard repository={repoWithoutDescription} />)
    ).not.toThrow();
  });

  it("languageがnullなら言語表示なし", () => {
    const repoWithoutLanguage: GitHubRepository = {
      ...mockRepository,
      language: null,
    };
    render(<RepositoryCard repository={repoWithoutLanguage} />);
    expect(screen.queryByText("JavaScript")).not.toBeInTheDocument();
  });

  it("トピック5件超で+Nバッジを表示する", () => {
    render(<RepositoryCard repository={mockRepository} />);
    expect(screen.getByText("+1")).toBeInTheDocument();
  });

  it("英語ロケールで詳細リンクにlang=enが付与される", () => {
    render(<RepositoryCard repository={mockRepository} locale="en-US" />);
    const link = screen.getByRole("link", { name: "facebook/react" });
    expect(link).toHaveAttribute("href", "/repositories/facebook/react?lang=en");
  });
});
