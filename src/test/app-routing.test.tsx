import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });
});

describe("App routing — Equało pages", () => {
  const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

  it.each([
    ["/", "/"],
    ["/explore", "explore"],
    ["/opportunity/some-id", "opportunity/$id"],
    ["/auth", "auth"],
    ["/dashboard", "dashboard"],
    ["/tracker", "tracker"],
    ["/org", "org"],
    ["/post", "post"],
  ] as const)("matches %s to its route, not not-found", (path, id) => {
    const matches = router.matchRoutes(path);
    expect(String(matches.at(-1)?.routeId)).toContain(id);
    if (path === "/") expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it("gates protected pages behind the _authenticated layout", () => {
    for (const path of ["/dashboard", "/tracker", "/org", "/onboarding"]) {
      const ids = router.matchRoutes(path).map((m) => m.routeId);
      expect(ids.some((r) => r.includes("_authenticated"))).toBe(true);
    }
  });
});
