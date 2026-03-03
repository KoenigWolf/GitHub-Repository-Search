import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "vitest-axe";
import { SearchForm } from "@/components/SearchForm";
import { RepositoryCard } from "@/components/RepositoryCard";
import { ErrorPanel } from "@/components/ErrorPanel";
import { EmptyState } from "@/components/EmptyState";
import { Pagination } from "@/components/Pagination";
import { mockRepository } from "./fixtures";
import { Github } from "lucide-react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("Accessibility Tests", () => {
  describe("SearchForm", () => {
    it("should have no accessibility violations", async () => {
      const { container } = render(<SearchForm />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("RepositoryCard", () => {
    it("should have no accessibility violations", async () => {
      const { container } = render(<RepositoryCard repository={mockRepository} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("ErrorPanel", () => {
    it("should have no accessibility violations", async () => {
      const { container } = render(
        <ErrorPanel message="Test error message" title="Error" variant="inline" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("EmptyState", () => {
    it("should have no accessibility violations", async () => {
      const { container } = render(
        <EmptyState
          icon={Github}
          title="No results"
          description="Try a different search"
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Pagination", () => {
    it("should have no accessibility violations", async () => {
      const { container } = render(
        <Pagination
          currentPage={1}
          totalPages={10}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
