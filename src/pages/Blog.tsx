import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowRight, AlertCircle } from "lucide-react";
import { getPublishedBlogPosts } from "@/services/api";

const PREVIEW_LENGTH = 160;

function stripHtml(html: string): string {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent?.trim() ?? "";
}

function contentPreview(content: string | null): string {
  if (!content) return "";
  const text = stripHtml(content);
  if (text.length <= PREVIEW_LENGTH) return text;
  return text.slice(0, PREVIEW_LENGTH).trim() + "…";
}

const Blog = () => {
  const { data: response, isLoading, isError, error } = useQuery({
    queryKey: ["publishedBlogPosts"],
    queryFn: async () => {
      const res = await getPublishedBlogPosts();
      if (!res.success) throw new Error(res.message ?? "Failed to fetch blog posts");
      return res.data;
    },
  });

  const posts = response ?? [];

  return (
    <div className="py-8 md:py-12 min-h-screen bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Our Blog</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tips, guides, and educational content.
          </p>
        </div>

        {isLoading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden border-border bg-card">
                <Skeleton className="aspect-video w-full rounded-none" />
                <CardContent className="p-5">
                  <Skeleton className="h-6 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-9 w-28" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {isError && (
          <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error loading blog posts</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : "Failed to load blog posts. Please try again later."}
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && !isError && posts.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Card
                key={post.id}
                variant="interactive"
                className="overflow-hidden border-border bg-card text-card-foreground flex flex-col h-full"
              >
                {post.image_url ? (
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full aspect-video object-cover"
                  />
                ) : (
                  <div className="w-full aspect-video bg-muted flex items-center justify-center text-muted-foreground">
                    No image
                  </div>
                )}
                <CardContent className="p-5 flex flex-col flex-1">
                  <h2 className="text-xl font-semibold text-foreground mb-2 line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-muted-foreground text-sm flex-1 line-clamp-3 mb-4">
                    {contentPreview(post.content)}
                  </p>
                  <Button asChild variant="outline" size="sm" className="border-accent/50 text-accent hover:bg-accent/10 w-fit">
                    <Link to={`/blog/${post.slug}`}>
                      Read More
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && !isError && posts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No blog posts yet. Check back soon.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
