import { describe, it, expect } from "vitest";
import {
  normalizeQuery,
  normalizePageNumber,
  normalizeSortParam,
  parseSortValue,
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
    expect(normalizeSortParam("best-match")).toBe("best-match");
    expect(normalizeSortParam("stars-desc")).toBe("stars-desc");
    expect(normalizeSortParam("stars-asc")).toBe("stars-asc");
    expect(normalizeSortParam("forks-desc")).toBe("forks-desc");
    expect(normalizeSortParam("forks-asc")).toBe("forks-asc");
    expect(normalizeSortParam("updated-desc")).toBe("updated-desc");
    expect(normalizeSortParam("updated-asc")).toBe("updated-asc");
  });

  it("旧ソート値を新形式にマッピングする（後方互換性）", () => {
    expect(normalizeSortParam("stars")).toBe("stars-desc");
    expect(normalizeSortParam("forks")).toBe("forks-desc");
    expect(normalizeSortParam("updated")).toBe("updated-desc");
  });

  it("無効な値は best-match を返す", () => {
    expect(normalizeSortParam("invalid")).toBe("best-match");
    expect(normalizeSortParam("")).toBe("best-match");
    expect(normalizeSortParam(null)).toBe("best-match");
    expect(normalizeSortParam(undefined)).toBe("best-match");
  });
});

describe("parseSortValue", () => {
  it("best-match の場合は field が null を返す", () => {
    const result = parseSortValue("best-match");
    expect(result.field).toBeNull();
    expect(result.order).toBe("desc");
  });

  it("stars-desc を正しくパースする", () => {
    const result = parseSortValue("stars-desc");
    expect(result.field).toBe("stars");
    expect(result.order).toBe("desc");
  });

  it("stars-asc を正しくパースする", () => {
    const result = parseSortValue("stars-asc");
    expect(result.field).toBe("stars");
    expect(result.order).toBe("asc");
  });

  it("forks-desc を正しくパースする", () => {
    const result = parseSortValue("forks-desc");
    expect(result.field).toBe("forks");
    expect(result.order).toBe("desc");
  });

  it("forks-asc を正しくパースする", () => {
    const result = parseSortValue("forks-asc");
    expect(result.field).toBe("forks");
    expect(result.order).toBe("asc");
  });

  it("updated-desc を正しくパースする", () => {
    const result = parseSortValue("updated-desc");
    expect(result.field).toBe("updated");
    expect(result.order).toBe("desc");
  });

  it("updated-asc を正しくパースする", () => {
    const result = parseSortValue("updated-asc");
    expect(result.field).toBe("updated");
    expect(result.order).toBe("asc");
  });
});
