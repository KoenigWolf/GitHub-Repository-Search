import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RepositoryTopics } from "@/components/repository";

describe("RepositoryTopics", () => {
  it("トピックが空の場合はnullを返す", () => {
    const { container } = render(<RepositoryTopics topics={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("トピックを表示する", () => {
    render(<RepositoryTopics topics={["react", "typescript", "nextjs"]} />);
    expect(screen.getByText("react")).toBeInTheDocument();
    expect(screen.getByText("typescript")).toBeInTheDocument();
    expect(screen.getByText("nextjs")).toBeInTheDocument();
  });

  it("maxDisplayを超えるトピックは+Nバッジで表示", () => {
    render(
      <RepositoryTopics
        topics={["react", "typescript", "nextjs", "tailwind", "vitest"]}
        maxDisplay={3}
      />
    );
    expect(screen.getByText("react")).toBeInTheDocument();
    expect(screen.getByText("typescript")).toBeInTheDocument();
    expect(screen.getByText("nextjs")).toBeInTheDocument();
    expect(screen.queryByText("tailwind")).not.toBeInTheDocument();
    expect(screen.queryByText("vitest")).not.toBeInTheDocument();
    expect(screen.getByText("+2")).toBeInTheDocument();
  });

  it("showTitleでタイトルを表示する", () => {
    render(<RepositoryTopics topics={["react"]} showTitle />);
    expect(screen.getByText("トピック")).toBeInTheDocument();
  });

  it("英語ロケールでタイトルを表示する", () => {
    render(<RepositoryTopics topics={["react"]} showTitle locale="en-US" />);
    expect(screen.getByText("Topics")).toBeInTheDocument();
  });

  it("showTitleがfalseの場合タイトルを表示しない", () => {
    render(<RepositoryTopics topics={["react"]} showTitle={false} />);
    expect(screen.queryByText("トピック")).not.toBeInTheDocument();
    expect(screen.queryByText("Topics")).not.toBeInTheDocument();
  });

  it("maxDisplayがInfinityの場合はすべてのトピックを表示", () => {
    const topics = ["a", "b", "c", "d", "e", "f", "g"];
    render(<RepositoryTopics topics={topics} maxDisplay={Infinity} />);
    topics.forEach((topic) => {
      expect(screen.getByText(topic)).toBeInTheDocument();
    });
    expect(screen.queryByText(/\+\d+/)).not.toBeInTheDocument();
  });

  it("トピック数がmaxDisplayと同じ場合は+Nバッジを表示しない", () => {
    render(
      <RepositoryTopics topics={["react", "typescript"]} maxDisplay={2} />
    );
    expect(screen.getByText("react")).toBeInTheDocument();
    expect(screen.getByText("typescript")).toBeInTheDocument();
    expect(screen.queryByText(/\+\d+/)).not.toBeInTheDocument();
  });
});
