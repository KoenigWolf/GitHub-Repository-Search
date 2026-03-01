import { describe, it, expect } from "vitest";
import {
  normalizeQuery,
  normalizePageNumber,
  normalizeSortParam,
} from "@/lib/validators";

describe("normalizeQuery", () => {
  it("前後の空白を削除する", () => {
    expect(normalizeQuery("  react  ")).toBe("react");
  });

  it("連続する空白を1つにする", () => {
    expect(normalizeQuery("react   native")).toBe("react native");
  });

  it("空文字列はそのまま返す", () => {
    expect(normalizeQuery("")).toBe("");
  });

  it("空白のみの場合は空文字列を返す", () => {
    expect(normalizeQuery("   ")).toBe("");
  });

  it("複合ケース", () => {
    expect(normalizeQuery("  hello   world  ")).toBe("hello world");
  });
});

describe("normalizePageNumber", () => {
  it("有効な数字文字列を数値に変換する", () => {
    expect(normalizePageNumber("1")).toBe(1);
    expect(normalizePageNumber("5")).toBe(5);
    expect(normalizePageNumber("100")).toBe(100);
  });

  it("無効な値は1を返す", () => {
    expect(normalizePageNumber("")).toBe(1);
    expect(normalizePageNumber("abc")).toBe(1);
    expect(normalizePageNumber("0")).toBe(1);
    expect(normalizePageNumber("-1")).toBe(1);
  });

  it("小数は整数部分を使用", () => {
    expect(normalizePageNumber("3.7")).toBe(3);
  });
});

describe("normalizeSortParam", () => {
  it("有効なソート値を返す", () => {
    expect(normalizeSortParam("stars")).toBe("stars");
    expect(normalizeSortParam("forks")).toBe("forks");
    expect(normalizeSortParam("updated")).toBe("updated");
    expect(normalizeSortParam("best-match")).toBe("best-match");
  });

  it("無効な値は best-match を返す", () => {
    expect(normalizeSortParam("invalid")).toBe("best-match");
    expect(normalizeSortParam("")).toBe("best-match");
    expect(normalizeSortParam(undefined)).toBe("best-match");
  });
});
