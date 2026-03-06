import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchForm } from "@/components/search";

const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}));

describe("SearchForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.delete("q");
    mockSearchParams.delete("sort");
  });

  it("フォームがrole=searchでレンダリングされる", () => {
    render(<SearchForm />);
    expect(screen.getByRole("search")).toBeInTheDocument();
  });

  it("空入力でボタンがdisabled", () => {
    render(<SearchForm />);
    const button = screen.getByRole("button", { name: /検索/ });
    expect(button).toBeDisabled();
  });

  it("入力後ボタンが有効化される", async () => {
    const user = userEvent.setup();
    render(<SearchForm />);

    const input = screen.getByPlaceholderText(/リポジトリを検索/);
    await user.type(input, "react");

    const button = screen.getByRole("button", { name: /^検索$/ });
    expect(button).not.toBeDisabled();
  });

  it("送信でqとpage=1を含むURLに遷移する", async () => {
    const user = userEvent.setup();
    render(<SearchForm />);

    const input = screen.getByPlaceholderText(/リポジトリを検索/);
    await user.type(input, "react");

    const button = screen.getByRole("button", { name: /^検索$/ });
    await user.click(button);

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("q=react")
    );
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("page=1")
    );
  });

  it("空白のみ入力では遷移しない", async () => {
    const user = userEvent.setup();
    render(<SearchForm />);

    const input = screen.getByPlaceholderText(/リポジトリを検索/);
    await user.type(input, "   ");

    await user.click(screen.getByRole("button", { name: /^検索$/ }));

    expect(mockPush).not.toHaveBeenCalled();
  });

});
