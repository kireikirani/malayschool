"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

type Advertisement = {
  id: string;
  type: "adsense_code" | "html_script" | "banner_image" | "external_link";
  content: string;
};

type Placement = "homepage_top" | "homepage_sidebar" | "news_detail" | "footer";

export function AdSlot({
  placement,
  className,
  showSeparatorAfter = false,
}: {
  placement: Placement;
  className?: string;
  showSeparatorAfter?: boolean;
}) {
  const [ads, setAds] = useState<Advertisement[]>([]);

  useEffect(() => {
    fetch(`/api/advertisements?placement=${placement}&status=active`, { cache: "no-store" })
      .then((res) => res.json())
      .then((body) => setAds(body.data ?? []))
      .catch(() => setAds([]));
  }, [placement]);

  if (ads.length === 0) return null;

  return (
    <>
      <div className={className}>
        <div className="space-y-4">
      {ads.map((ad) => {
        if (ad.type === "banner_image") {
          return (
            <div key={ad.id} className="relative aspect-[3/1] w-full overflow-hidden border border-border/70 bg-muted shadow-[0_18px_40px_-34px_rgba(35,24,16,0.45)]">
              <Image src={ad.content} alt="Iklan" fill className="object-cover" />
            </div>
          );
        }

        if (ad.type === "external_link") {
          return (
            <a
              key={ad.id}
              href={ad.content}
              target="_blank"
              rel="noopener noreferrer"
              className="block border border-border/70 bg-card px-4 py-4 text-center text-sm font-medium text-primary shadow-[0_18px_40px_-34px_rgba(35,24,16,0.45)] hover:underline"
            >
              {ad.content}
            </a>
          );
        }

        // adsense_code / html_script: admin-authored trusted content, not arbitrary user input.
        return <div key={ad.id} dangerouslySetInnerHTML={{ __html: ad.content }} />;
      })}
        </div>
      </div>
      {showSeparatorAfter && <Separator className="bg-border" />}
    </>
  );
}
