import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { getPublishedBlogPostBySlug } from "@/services/api";

const BlogDetails = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, isError, error } = useQuery({
    queryKey: ["publishedBlogPost", slug],
    queryFn: async () => {
      if (!slug) return null;
      const res = await getPublishedBlogPostBySlug(slug);
      if (!res.success) throw new Error(res.message ?? "Failed to fetch post");
      return res.data;
    },
    enabled: !!slug,
  });

  if (!slug) {
    return (
      <div className="py-8 md:py-12 min-h-screen bg-background">
        <div className="container max-w-4xl">
          <Button asChild variant="ghost" className="mb-6 text-muted-foreground hover:text-foreground">
            <Link to="/blog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>
          </Button>
          <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Invalid URL</AlertTitle>
            <AlertDescription>Missing blog post slug.</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="py-8 md:py-12 min-h-screen bg-background">
        <div className="container max-w-4xl">
          <Skeleton className="h-10 w-32 mb-8" />
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="aspect-video w-full rounded-xl mb-8" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="py-8 md:py-12 min-h-screen bg-background">
        <div className="container max-w-4xl">
          <Button asChild variant="ghost" className="mb-6 text-muted-foreground hover:text-foreground">
            <Link to="/blog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>
          </Button>
          {isError ? (
            <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error loading post</AlertTitle>
              <AlertDescription>
                {error instanceof Error ? error.message : "Failed to load this post."}
              </AlertDescription>
            </Alert>
          ) : (
            <Card className="border-border bg-card">
              <CardContent className="p-12 text-center">
                <h1 className="text-3xl font-bold text-foreground mb-4">Post Not Found</h1>
                <p className="text-muted-foreground mb-6">
                  The blog post you're looking for doesn't exist or isn't published.
                </p>
                <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link to="/blog">Browse All Posts</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 md:py-12 min-h-screen bg-background">
      <div className="container max-w-4xl">
        <Button asChild variant="ghost" className="mb-6 text-muted-foreground hover:text-foreground">
          <Link to="/blog">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Link>
        </Button>

        <article>
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{post.title}</h1>
            <p className="text-sm text-muted-foreground">
              {new Date(post.created_at).toLocaleDateString(undefined, {
                dateStyle: "long",
              })}
            </p>
          </header>

          {post.image_url && (
            <div className="rounded-xl overflow-hidden border border-border mb-8">
              <img
                src={post.image_url}
                alt={post.title}
                className="w-full aspect-video object-cover"
              />
            </div>
          )}

          {post.content ? (
            <div
              className="prose prose-lg max-w-none
                prose-headings:text-foreground prose-headings:font-semibold
                prose-p:text-muted-foreground prose-p:leading-relaxed
                prose-ul:text-muted-foreground prose-li:text-muted-foreground
                prose-img:rounded-lg prose-img:border prose-img:border-border
                prose-a:text-accent prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          ) : (
            <p className="text-muted-foreground">No content for this post.</p>
          )}
        </article>
      </div>
    </div>
  );
};

export default BlogDetails;
