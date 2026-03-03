import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BackButton } from "@/components/BackButton";

const mockBack = vi.fn();
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: mockBack, push: mockPush }),
}));

describe("BackButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(document, "referrer", {
      value: "",
      configurable: true,
    });
  });

  it("デフォルトテキストで表示される", () => {
    render(<BackButton />);
    expect(screen.getByText("検索に戻る")).toBeInTheDocument();
  });

  it("カスタムテキストで表示される", () => {
    render(<BackButton>戻る</BackButton>);
    expect(screen.getByText("戻る")).toBeInTheDocument();
  });

  it("aria-labelが設定されている", () => {
    render(<BackButton />);
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-label",
      "検索結果一覧に戻る"
    );
  });

  it("同じオリジンからの遷移時にrouter.back()を呼び出す", async () => {
    Object.defineProperty(document, "referrer", {
      value: window.location.origin + "/search?q=react",
      configurable: true,
    });

    const user = userEvent.setup();
    render(<BackButton />);

    await user.click(screen.getByRole("button"));

    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("referrerがない場合はfallbackHrefに遷移する", async () => {
    Object.defineProperty(document, "referrer", {
      value: "",
      configurable: true,
    });

    const user = userEvent.setup();
    render(<BackButton />);

    await user.click(screen.getByRole("button"));

    expect(mockPush).toHaveBeenCalledWith("/search");
    expect(mockBack).not.toHaveBeenCalled();
  });

  it("外部オリジンからの遷移時はfallbackHrefに遷移する", async () => {
    Object.defineProperty(document, "referrer", {
      value: "https://external-site.com/page",
      configurable: true,
    });

    const user = userEvent.setup();
    render(<BackButton />);

    await user.click(screen.getByRole("button"));

    expect(mockPush).toHaveBeenCalledWith("/search");
    expect(mockBack).not.toHaveBeenCalled();
  });

  it("カスタムfallbackHrefに遷移する", async () => {
    Object.defineProperty(document, "referrer", {
      value: "",
      configurable: true,
    });

    const user = userEvent.setup();
    render(<BackButton fallbackHref="/custom" />);

    await user.click(screen.getByRole("button"));

    expect(mockPush).toHaveBeenCalledWith("/custom");
  });
});
