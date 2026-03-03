import { z } from "zod";

const envSchema = z.object({
  GITHUB_TOKEN: z.string().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

function getEnvValue<K extends keyof z.infer<typeof envSchema>>(
  key: K
): z.infer<typeof envSchema>[K] {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }

  return parsed.data[key];
}

export const env = {
  get GITHUB_TOKEN() {
    return getEnvValue("GITHUB_TOKEN");
  },
  get NODE_ENV() {
    return getEnvValue("NODE_ENV");
  },
};

export function hasGitHubToken(): boolean {
  return Boolean(env.GITHUB_TOKEN);
}

export function isProduction(): boolean {
  return env.NODE_ENV === "production";
}

export function isDevelopment(): boolean {
  return env.NODE_ENV === "development";
}

export function isTest(): boolean {
  return env.NODE_ENV === "test";
}
