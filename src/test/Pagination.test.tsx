import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pagination } from "@/components/Pagination";

const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams("q=react&sort=stars");

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}));

describe("Pagination", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("totalPages <= 1でnullを返す", () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("totalPages = 0でもnullを返す", () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={0} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("前後ボタンを表示する", () => {
    render(<Pagination currentPage={2} totalPages={5} />);
    expect(screen.getByLabelText("前のページ")).toBeInTheDocument();
    expect(screen.getByLabelText("次のページ")).toBeInTheDocument();
  });

  it("1ページ目で前ボタンがdisabled", () => {
    render(<Pagination currentPage={1} totalPages={5} />);
    expect(screen.getByLabelText("前のページ")).toBeDisabled();
  });

  it("最終ページで次ボタンがdisabled", () => {
    render(<Pagination currentPage={5} totalPages={5} />);
    expect(screen.getByLabelText("次のページ")).toBeDisabled();
  });

  it("次ボタンクリックでpage+1のURLに遷移", async () => {
    const user = userEvent.setup();
    render(<Pagination currentPage={2} totalPages={5} />);

    await user.click(screen.getByLabelText("次のページ"));

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("page=3")
    );
  });

  it("前ボタンクリックでpage-1のURLに遷移", async () => {
    const user = userEvent.setup();
    render(<Pagination currentPage={3} totalPages={5} />);

    await user.click(screen.getByLabelText("前のページ"));

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("page=2")
    );
  });

  it("現在ページにaria-current=pageが付与される", () => {
    render(<Pagination currentPage={3} totalPages={5} />);
    const currentPageButton = screen.getByLabelText("ページ 3");
    expect(currentPageButton).toHaveAttribute("aria-current", "page");
  });

  it("他のページにはaria-currentがない", () => {
    render(<Pagination currentPage={3} totalPages={5} />);
    const otherPageButton = screen.getByLabelText("ページ 1");
    expect(otherPageButton).not.toHaveAttribute("aria-current");
  });
});
