import { test, expect } from "@playwright/test";

test.describe("Search Page", () => {
  test("should display the search form", async ({ page }) => {
    await page.goto("/search");

    await expect(page.getByRole("search")).toBeVisible();
    await expect(page.getByPlaceholder(/リポジトリを検索/)).toBeVisible();
    await expect(page.getByRole("button", { name: "検索" })).toBeVisible();
  });

  test("should show empty state when no query", async ({ page }) => {
    await page.goto("/search");

    await expect(page.getByText("GitHubリポジトリを検索")).toBeVisible();
    await expect(
      page.getByText("キーワードを入力して、リポジトリを検索してみましょう")
    ).toBeVisible();
  });

  test("should perform search and display results", async ({ page }) => {
    await page.goto("/search");

    const searchInput = page.getByPlaceholder(/リポジトリを検索/);
    await searchInput.fill("react");
    await page.getByRole("button", { name: "検索" }).click();

    await expect(page).toHaveURL(/\/search\?q=react/);

    await page.waitForSelector('[aria-busy="true"]', {
      state: "detached",
      timeout: 10000,
    });

    const results = page.locator("article");
    await expect(results.first()).toBeVisible({ timeout: 10000 });
  });

  test("should change sort option", async ({ page }) => {
    await page.goto("/search?q=react");

    const sortSelect = page.getByLabel("並び替え");
    await sortSelect.selectOption("stars");
    await page.getByRole("button", { name: "検索" }).click();

    await expect(page).toHaveURL(/sort=stars/);
  });

  test("should clear search input", async ({ page }) => {
    await page.goto("/search");

    const searchInput = page.getByPlaceholder(/リポジトリを検索/);
    await searchInput.fill("react");

    const clearButton = page.getByLabel("検索をクリア");
    await clearButton.click();

    await expect(searchInput).toHaveValue("");
  });

  test("should navigate to repository detail page", async ({ page }) => {
    await page.goto("/search?q=facebook/react");

    await page.waitForSelector('[aria-busy="true"]', {
      state: "detached",
      timeout: 10000,
    });

    const repoLink = page.getByRole("link", { name: /facebook\/react/ }).first();
    await repoLink.click();

    await expect(page).toHaveURL(/\/repositories\/facebook\/react/);
  });
});

test.describe("Repository Detail Page", () => {
  test("should display repository information", async ({ page }) => {
    await page.goto("/repositories/facebook/react");

    await page.waitForSelector('[aria-busy="true"]', {
      state: "detached",
      timeout: 10000,
    });

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
      timeout: 10000,
    });
  });

  test("should show error for non-existent repository", async ({ page }) => {
    await page.goto("/repositories/nonexistent-owner-12345/nonexistent-repo-67890");

    await page.waitForSelector('[aria-busy="true"]', {
      state: "detached",
      timeout: 10000,
    });

    await expect(page.getByRole("alert")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Accessibility", () => {
  test("should have proper ARIA labels on search form", async ({ page }) => {
    await page.goto("/search");

    await expect(page.getByRole("search")).toHaveAttribute(
      "aria-label",
      "リポジトリ検索"
    );
    await expect(page.getByLabel("並び替え")).toBeVisible();
  });

  test("should be keyboard navigable", async ({ page }) => {
    await page.goto("/search");

    await page.keyboard.press("Tab");
    await expect(page.getByPlaceholder(/リポジトリを検索/)).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.getByLabel("並び替え")).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "検索" })).toBeFocused();
  });
});
