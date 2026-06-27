import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Image from "next/image";

export function NewsContent({ markdown }: { markdown: string }) {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-primary/60 prose-blockquote:bg-muted/40 prose-blockquote:py-0.5 prose-blockquote:rounded-r-md prose-img:rounded-xl prose-img:shadow-md prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-muted prose-pre:rounded-xl">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          img: ({ src, alt }) => {
            if (!src || typeof src !== "string") return null;
            return (
              <span className="relative block w-full aspect-video overflow-hidden rounded-xl my-4">
                <Image
                  src={src}
                  alt={alt ?? ""}
                  fill
                  className="object-cover"
                />
              </span>
            );
          },
          a: ({ href, children, ...props }) => (
            <a
              href={href}
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
              {...props}
            >
              {children}
            </a>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
