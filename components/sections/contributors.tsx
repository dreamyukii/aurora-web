"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { ContributorBadge } from "@/components/ContributorCard";
import contributorsCache from "@/data/contributors-cache.json";

type GitHubContributor = {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  contributions: number;
};

// Use cached repo contributors from build time
const repoContributors = contributorsCache.repoContributors as GitHubContributor[];

// Filter out bots
const filteredContributors = repoContributors.filter(
  (c) => !c.login.includes("[bot]")
);

export default function Contributors() {
  const t = useTranslations("Contributors");

  return (
    <div>
      <div
        className={
          "flex max-w-screen-2xl flex-col items-center justify-center gap-5"
        }
      >
        <h1
          className={
            "bg-gradient-to-r from-aurora-blue to-aurora-lightorange bg-clip-text py-2 text-4xl font-bold text-transparent lg:text-7xl"
          }
        >
          {t("title")}
        </h1>
        <div className={"text-xl"}>
          {t("subtitle")}
        </div>
        <div
          className={
            "flex h-fit w-full max-w-screen-2xl flex-wrap justify-center gap-4"
          }
        >
          {filteredContributors.length > 0 ? (
            filteredContributors.slice(0, 12).map((contributor) => (
              <ContributorBadge
                key={contributor.id}
                img={contributor.avatar_url}
                profileUrl={contributor.html_url}
                name={contributor.login}
              />
            ))
          ) : (
            <p className="text-zinc-400">{t("error")}</p>
          )}
        </div>
        <Link
          href="/contributors"
          className="group mt-4 flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/50 px-6 py-3 text-sm font-medium text-zinc-300 transition-all hover:border-aurora-blue hover:bg-zinc-800 hover:text-white"
        >
          {t("view-all")}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
