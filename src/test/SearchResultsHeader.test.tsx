import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchResultsHeader } from "@/components/SearchResultsHeader";

const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}));

describe("SearchResultsHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("結果数を表示する", () => {
    render(<SearchResultsHeader totalCount={500} sort="best-match" />);
    expect(screen.getByText(/500/)).toBeInTheDocument();
    expect(screen.getByText(/件のリポジトリ/)).toBeInTheDocument();
  });

  it("1000以上の数値をk形式でフォーマットする", () => {
    render(<SearchResultsHeader totalCount={1500} sort="best-match" />);
    expect(screen.getByText(/1\.5k/)).toBeInTheDocument();
  });

  it("ソートドロップダウンが現在の値を選択している", () => {
    render(<SearchResultsHeader totalCount={100} sort="stars-desc" />);
    const select = screen.getByRole("combobox", { name: /並び替え/ });
    expect(select).toHaveValue("stars-desc");
  });

  it("ソート変更でナビゲーションが発生する", async () => {
    const user = userEvent.setup();
    render(<SearchResultsHeader totalCount={100} sort="best-match" />);

    const select = screen.getByRole("combobox", { name: /並び替え/ });
    await user.selectOptions(select, "forks-desc");

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("sort=forks-desc")
    );
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("page=1")
    );
  });

  it("全てのソートオプションが表示される", () => {
    render(<SearchResultsHeader totalCount={100} sort="best-match" />);
    const select = screen.getByRole("combobox", { name: /並び替え/ });
    const options = select.querySelectorAll("option");
    expect(options).toHaveLength(7);
  });

  it("英語ロケールで正しく表示される", () => {
    render(
      <SearchResultsHeader totalCount={500} sort="best-match" locale="en-US" />
    );
    expect(screen.getByText(/repository results/)).toBeInTheDocument();
    expect(screen.getByText(/Sort:/)).toBeInTheDocument();
  });
});
