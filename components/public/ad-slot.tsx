"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Advertisement = {
  id: string;
  type: "adsense_code" | "html_script" | "banner_image" | "external_link";
  content: string;
};

type Placement = "homepage_top" | "homepage_sidebar" | "news_detail" | "footer";

export function AdSlot({ placement }: { placement: Placement }) {
  const [ads, setAds] = useState<Advertisement[]>([]);

  useEffect(() => {
    fetch(`/api/advertisements?placement=${placement}&status=active`)
      .then((res) => res.json())
      .then((body) => setAds(body.data ?? []))
      .catch(() => setAds([]));
  }, [placement]);

  if (ads.length === 0) return null;

  return (
    <div className="space-y-4">
      {ads.map((ad) => {
        if (ad.type === "banner_image") {
          return (
            <div key={ad.id} className="relative aspect-[3/1] w-full overflow-hidden rounded-md bg-muted">
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
              className="block rounded-md border p-4 text-center text-sm font-medium text-primary hover:underline"
            >
              {ad.content}
            </a>
          );
        }

        // adsense_code / html_script: admin-authored trusted content, not arbitrary user input.
        return <div key={ad.id} dangerouslySetInnerHTML={{ __html: ad.content }} />;
      })}
    </div>
  );
}
