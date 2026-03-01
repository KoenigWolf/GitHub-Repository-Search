import { describe, it, expect } from "vitest";
import { formatNumber, formatDate } from "@/lib/utils";

describe("formatNumber", () => {
  it("0を正しくフォーマットする", () => {
    expect(formatNumber(0)).toBe("0");
  });

  it("999を正しくフォーマットする", () => {
    expect(formatNumber(999)).toBe("999");
  });

  it("1000を1.0kにフォーマットする", () => {
    expect(formatNumber(1000)).toBe("1.0k");
  });

  it("1500を1.5kにフォーマットする", () => {
    expect(formatNumber(1500)).toBe("1.5k");
  });

  it("1000000を1.0Mにフォーマットする", () => {
    expect(formatNumber(1000000)).toBe("1.0M");
  });

  it("2500000を2.5Mにフォーマットする", () => {
    expect(formatNumber(2500000)).toBe("2.5M");
  });
});

describe("formatDate", () => {
  it("ISO文字列を日本語形式に変換する", () => {
    const result = formatDate("2024-01-15T10:30:00Z");
    expect(result).toMatch(/2024/);
    expect(result).toMatch(/1/);
    expect(result).toMatch(/15/);
  });

  it("エラーをthrowしない", () => {
    expect(() => formatDate("2024-12-25T00:00:00Z")).not.toThrow();
    expect(() => formatDate("2023-06-01T12:00:00Z")).not.toThrow();
  });
});
