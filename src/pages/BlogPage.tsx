import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Search, ArrowRight, Calendar, Tag, User, AlertCircle } from "lucide-react";
import { getBlogPosts } from "@/services/api";
import { BlogPost } from "@/types";

const BlogPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Fetch blog posts using React Query
  const { data: blogPostsResponse, isLoading, isError, error } = useQuery({
    queryKey: ["blogPosts"],
    queryFn: async () => {
      const response = await getBlogPosts();
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch blog posts");
      }
      return response.data;
    },
  });

  const blogPosts = blogPostsResponse || [];

  // Extract unique categories from blog posts
  const categories = useMemo(() => {
    const uniqueCategories = new Set(blogPosts.map((post) => post.category));
    return ["All", ...Array.from(uniqueCategories).sort()];
  }, [blogPosts]);

  // Filter posts based on search term and category
  const filteredPosts = useMemo(() => {
    if (!blogPosts.length) return [];
    return blogPosts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === "All" || post.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [blogPosts, searchTerm, activeCategory]);

  return (
    <div className="py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Our Blog</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Educational tips, guides, and insights about school supplies, stationery, and learning materials.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Search */}
            <Card>
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        activeCategory === category
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-secondary"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>


            {/* Recent Posts */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Recent Posts</h3>
                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-4 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {blogPosts.slice(0, 3).map((post) => (
                      <Link
                        key={post.id}
                        to={`/blog/${post.slug}`}
                        className="block text-sm hover:text-primary transition-colors"
                      >
                        {post.title}
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {/* Loading State */}
            {isLoading && (
              <div className="grid gap-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} variant="interactive">
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-32 mb-3" />
                      <Skeleton className="h-6 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4 mb-4" />
                      <Skeleton className="h-4 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Error State */}
            {isError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error loading blog posts</AlertTitle>
                <AlertDescription>
                  {error instanceof Error ? error.message : "Failed to load blog posts. Please try again later."}
                </AlertDescription>
              </Alert>
            )}

            {/* Blog Posts List */}
            {!isLoading && !isError && (
              <div className="grid gap-6">
                {filteredPosts.map((post, index) => (
                <Link key={post.id} to={`/blog/${post.slug}`}>
                  <Card 
                    variant="interactive"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-wrap items-center gap-4 mb-3 text-sm">
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                          {post.category}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {post.date}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <User className="h-4 w-4" />
                          {post.author}
                        </span>
                        <span className="text-muted-foreground">{post.readTime}</span>
                      </div>
                      <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                      <span className="inline-flex items-center text-primary font-medium text-sm">
                        Read More <ArrowRight className="h-4 w-4 ml-1" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !isError && filteredPosts.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">No posts found</h3>
                <p className="text-muted-foreground">
                  Try a different search term or category.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
