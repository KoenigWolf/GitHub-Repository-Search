import type { ReactElement } from "react";
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

async function assertNoA11yViolations(element: ReactElement) {
  const { container } = render(element);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
}

describe("Accessibility Tests", () => {
  it("SearchForm should have no accessibility violations", async () => {
    await assertNoA11yViolations(<SearchForm />);
  });

  it("RepositoryCard should have no accessibility violations", async () => {
    await assertNoA11yViolations(<RepositoryCard repository={mockRepository} />);
  });

  it("ErrorPanel should have no accessibility violations", async () => {
    await assertNoA11yViolations(
      <ErrorPanel message="Test error message" title="Error" variant="inline" />
    );
  });

  it("EmptyState should have no accessibility violations", async () => {
    await assertNoA11yViolations(
      <EmptyState
        icon={Github}
        title="No results"
        description="Try a different search"
      />
    );
  });

  it("Pagination should have no accessibility violations", async () => {
    await assertNoA11yViolations(<Pagination currentPage={1} totalPages={10} />);
  });
});
