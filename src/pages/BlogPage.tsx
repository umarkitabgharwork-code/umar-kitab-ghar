import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, Calendar, Tag, User } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  slug: string;
}

const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "How to Choose the Right Stationery for Your Child",
    excerpt: "Discover the best stationery items that help improve your child's learning experience and creativity. We explore essential supplies every student needs.",
    category: "Tips & Guides",
    author: "Admin",
    date: "Dec 5, 2025",
    readTime: "5 min read",
    slug: "choose-stationery"
  },
  {
    id: "2",
    title: "The Importance of Quality School Books",
    excerpt: "Learn why investing in quality textbooks can make a significant difference in your child's education and academic performance.",
    category: "Education",
    author: "Admin",
    date: "Dec 3, 2025",
    readTime: "4 min read",
    slug: "quality-books"
  },
  {
    id: "3",
    title: "Top 10 Art Supplies for Beginners",
    excerpt: "A comprehensive guide to essential art supplies every beginner student should have in their collection.",
    category: "Art Supplies",
    author: "Admin",
    date: "Dec 1, 2025",
    readTime: "6 min read",
    slug: "art-supplies-beginners"
  },
  {
    id: "4",
    title: "Preparing for the New School Year: A Complete Checklist",
    excerpt: "Get ready for the new academic year with our comprehensive checklist of books, stationery, and supplies.",
    category: "School Books",
    author: "Admin",
    date: "Nov 28, 2025",
    readTime: "7 min read",
    slug: "school-year-checklist"
  },
  {
    id: "5",
    title: "Understanding Different Paper Types for Students",
    excerpt: "From graph paper to lined notebooks, learn which paper types work best for different subjects and purposes.",
    category: "Tips & Guides",
    author: "Admin",
    date: "Nov 25, 2025",
    readTime: "4 min read",
    slug: "paper-types"
  },
  {
    id: "6",
    title: "Best Islamic Books for Children",
    excerpt: "Explore our curated list of Islamic books perfect for introducing children to religious education.",
    category: "Islamic Books",
    author: "Admin",
    date: "Nov 22, 2025",
    readTime: "5 min read",
    slug: "islamic-books-children"
  },
];

const categories = [
  "All",
  "Education",
  "Tips & Guides",
  "Art Supplies",
  "School Books",
  "Islamic Books",
  "Stationery"
];

const BlogPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All" || post.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="py-8 md:py-12">
      <div className="container">
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
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">

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

            {filteredPosts.length === 0 && (
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
