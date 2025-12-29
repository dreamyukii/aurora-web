#!/usr/bin/env node

/**
 * This script fetches GitHub user data for all contributors and caches it.
 * Run this before building to avoid API rate limits and speed up page loads.
 *
 * Usage:
 *   node scripts/cache-contributors.mjs          # Only update if cache is stale (>24h)
 *   node scripts/cache-contributors.mjs --force  # Force regeneration
 *
 * Environment:
 *   GITHUB_TOKEN - Optional GitHub token to avoid rate limits
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTRIBUTORS_FILE = path.join(__dirname, "../data/contributors.json");
const CACHE_FILE = path.join(__dirname, "../data/contributors-cache.json");

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const FORCE = process.argv.includes("--force");
const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

const headers = GITHUB_TOKEN
  ? { Authorization: `token ${GITHUB_TOKEN}` }
  : {};

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { headers });
      if (res.status === 403) {
        const rateLimitReset = res.headers.get("X-RateLimit-Reset");
        if (rateLimitReset) {
          const resetTime = new Date(parseInt(rateLimitReset) * 1000);
          console.warn(`Rate limited until ${resetTime.toISOString()}`);
        }
        throw new Error("Rate limited");
      }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return res.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      console.warn(`Retry ${i + 1}/${retries} for ${url}`);
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
}

async function fetchGitHubUser(username) {
  try {
    const data = await fetchWithRetry(
      `https://api.github.com/users/${username}`
    );
    return {
      login: data.login,
      id: data.id,
      avatar_url: data.avatar_url,
      html_url: data.html_url,
      name: data.name,
      bio: data.bio,
    };
  } catch (error) {
    console.warn(`Failed to fetch user ${username}:`, error.message);
    return null;
  }
}

async function fetchRepoContributors() {
  try {
    // Fetch all pages of contributors
    const allContributors = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const data = await fetchWithRetry(
        `https://api.github.com/repos/ublue-os/aurora/contributors?per_page=${perPage}&page=${page}`
      );
      if (!data || data.length === 0) break;
      allContributors.push(...data);
      if (data.length < perPage) break;
      page++;
    }

    return allContributors.map((c) => ({
      login: c.login,
      id: c.id,
      avatar_url: c.avatar_url,
      html_url: c.html_url,
      contributions: c.contributions,
    }));
  } catch (error) {
    console.warn("Failed to fetch repo contributors:", error.message);
    return [];
  }
}

async function loadExistingCache() {
  try {
    const data = await fs.readFile(CACHE_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function isCacheValid() {
  const cache = await loadExistingCache();
  if (!cache?.generatedAt) return false;

  const cacheAge = Date.now() - new Date(cache.generatedAt).getTime();
  const hasData =
    Object.keys(cache.githubUsers || {}).length > 0 ||
    (cache.repoContributors || []).length > 0;

  return hasData && cacheAge < CACHE_MAX_AGE_MS;
}

async function main() {
  // Check if we should skip regeneration
  if (!FORCE && (await isCacheValid())) {
    console.log("Cache is still valid (less than 24h old). Use --force to regenerate.");
    return;
  }

  console.log("Caching contributor data...");
  if (!GITHUB_TOKEN) {
    console.warn("Warning: GITHUB_TOKEN not set. You may hit rate limits.");
  }

  // Load existing cache for fallback
  const existingCache = await loadExistingCache();

  // Read contributors.json
  const contributorsData = JSON.parse(
    await fs.readFile(CONTRIBUTORS_FILE, "utf-8")
  );

  // Fetch GitHub user data for each featured contributor
  console.log(
    `Fetching data for ${contributorsData.contributors.length} featured contributors...`
  );
  const githubUsers = {};

  // Process in batches to avoid rate limiting
  const batchSize = 10;
  for (let i = 0; i < contributorsData.contributors.length; i += batchSize) {
    const batch = contributorsData.contributors.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map((c) => fetchGitHubUser(c.github))
    );

    batch.forEach((c, idx) => {
      if (results[idx]) {
        githubUsers[c.github] = results[idx];
      }
    });

    console.log(
      `  Processed ${Math.min(i + batchSize, contributorsData.contributors.length)}/${contributorsData.contributors.length}`
    );

    // Small delay between batches
    if (i + batchSize < contributorsData.contributors.length) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  // Fetch repo contributors
  console.log("Fetching repository contributors...");
  let repoContributors = await fetchRepoContributors();
  console.log(`  Found ${repoContributors.length} repo contributors`);

  // Use existing cache as fallback for missing data
  if (existingCache) {
    // Merge github users - keep existing if we couldn't fetch new ones
    const existingUsers = existingCache.githubUsers || {};
    for (const [username, data] of Object.entries(existingUsers)) {
      if (!githubUsers[username] && data) {
        githubUsers[username] = data;
      }
    }

    // Use existing repo contributors if we couldn't fetch new ones
    if (repoContributors.length === 0 && existingCache.repoContributors?.length > 0) {
      console.log("  Using cached repo contributors (API unavailable)");
      repoContributors = existingCache.repoContributors;
    }
  }

  // Build cache object
  const cache = {
    generatedAt: new Date().toISOString(),
    githubUsers,
    repoContributors,
  };

  // Write cache file
  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
  console.log(`Cache written to ${CACHE_FILE}`);
  console.log(
    `  - ${Object.keys(githubUsers).length} featured contributor profiles`
  );
  console.log(`  - ${repoContributors.length} repo contributors`);
}

main().catch((error) => {
  console.error("Failed to cache contributors:", error);
  process.exit(1);
});
