import { describe, it, expect } from "vitest";
import { calculatePageNumbers } from "@/lib/utils";

describe("calculatePageNumbers", () => {
  it("totalPages が 1 以下の場合は空配列を返す", () => {
    expect(calculatePageNumbers(1, 0)).toEqual([]);
    expect(calculatePageNumbers(1, 1)).toEqual([]);
  });

  it("2ページの場合は [1, 2] を返す", () => {
    expect(calculatePageNumbers(1, 2)).toEqual([1, 2]);
    expect(calculatePageNumbers(2, 2)).toEqual([1, 2]);
  });

  it("3ページの場合は [1, 2, 3] を返す", () => {
    expect(calculatePageNumbers(1, 3)).toEqual([1, 2, 3]);
    expect(calculatePageNumbers(2, 3)).toEqual([1, 2, 3]);
    expect(calculatePageNumbers(3, 3)).toEqual([1, 2, 3]);
  });

  it("多くのページがある場合は省略記号を含む", () => {
    expect(calculatePageNumbers(1, 10)).toEqual([1, 2, "ellipsis", 10]);

    expect(calculatePageNumbers(5, 10)).toEqual([
      1,
      "ellipsis",
      4,
      5,
      6,
      "ellipsis",
      10,
    ]);

    expect(calculatePageNumbers(10, 10)).toEqual([1, "ellipsis", 9, 10]);
  });

  it("2ページ目では最初の省略記号がない", () => {
    expect(calculatePageNumbers(2, 10)).toEqual([1, 2, 3, "ellipsis", 10]);
  });

  it("最後から2ページ目では最後の省略記号がない", () => {
    expect(calculatePageNumbers(9, 10)).toEqual([1, "ellipsis", 8, 9, 10]);
  });

  it("カスタム delta を指定できる", () => {
    expect(calculatePageNumbers(5, 10, 2)).toEqual([
      1,
      "ellipsis",
      3,
      4,
      5,
      6,
      7,
      "ellipsis",
      10,
    ]);
  });
});
