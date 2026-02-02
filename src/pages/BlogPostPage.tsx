import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Calendar, User, Share2 } from "lucide-react";
import { BlogContent } from "@/components/BlogContent";

const blogContent = {
  "choose-stationery": {
    title: "How to Choose the Right Stationery for Your Child",
    category: "Tips & Guides",
    author: "Admin",
    date: "December 5, 2025",
    readTime: "5 min read",
    content: `
      <p>Choosing the right stationery for your child is more important than you might think. The tools they use can significantly impact their learning experience, comfort, and even their enthusiasm for studying.</p>
      
      <h2>1. Consider Age-Appropriate Items</h2>
      <p>Young children need thicker pencils and crayons that are easier to grip. As they grow, you can transition to standard-sized writing instruments. For teenagers, consider specialized items like technical pencils or quality pens for neat note-taking.</p>
      
      <h2>2. Focus on Quality Over Quantity</h2>
      <p>It's better to invest in fewer, high-quality items that last longer rather than buying cheap supplies that break easily. Quality stationery also provides a better writing experience, making studying more enjoyable.</p>
      
      <h2>3. Essential Items Every Student Needs</h2>
      <ul>
        <li>Pencils (HB for general use, 2B for shading)</li>
        <li>Erasers (both white and kneaded types)</li>
        <li>Rulers (15cm and 30cm)</li>
        <li>Sharpeners (good quality with container)</li>
        <li>Notebooks appropriate for their grade</li>
        <li>Colored pencils or markers</li>
        <li>Geometry set for older students</li>
      </ul>
      
      <h2>4. Organization is Key</h2>
      <p>A good pencil case or stationery organizer helps children keep their supplies in order. This teaches them responsibility and ensures they always have what they need for class.</p>
      
      <h2>5. Consider Your Child's Interests</h2>
      <p>If your child shows interest in art, invest in quality drawing materials. For those who love writing, consider nice journals or pens. Matching stationery to interests can encourage creativity and learning.</p>
      
      <h2>Conclusion</h2>
      <p>The right stationery can make a real difference in your child's education journey. Visit Umar Kitab Ghar for a wide selection of quality stationery suitable for all ages and needs. Our team is always happy to help you find the perfect supplies for your child.</p>
    `
  }
};

const BlogPostPage = () => {
  const { slug } = useParams();
  const post = slug ? blogContent[slug as keyof typeof blogContent] : undefined;

  if (!post) {
    return (
      <div className="py-8 md:py-12">
        <div className="container max-w-4xl">
          <Button asChild variant="ghost" className="mb-6">
            <Link to="/blog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>
          </Button>

          <Card>
            <CardContent className="p-12 text-center">
              <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
              <p className="text-muted-foreground mb-6">
                The blog post you're looking for doesn't exist or has been removed.
              </p>
              <Button asChild>
                <Link to="/blog">Browse All Posts</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 md:py-12">
      <div className="container max-w-4xl">
        <Button asChild variant="ghost" className="mb-6">
          <Link to="/blog">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Link>
        </Button>

        <article>
          <header className="mb-8">
            <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
              {post.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {post.author}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {post.date}
              </span>
              <span>{post.readTime}</span>
            </div>
          </header>


          <BlogContent content={post.content} />

          {/* Share */}
          <div className="flex items-center gap-4 py-6 border-t">
            <span className="text-sm font-medium">Share this article:</span>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>

        </article>

        {/* Related Posts */}
        <section className="mt-12">
          <h3 className="text-2xl font-bold mb-6">Related Posts</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Link to="/blog/quality-books">
              <Card variant="interactive">
                <CardContent className="p-4">
                  <span className="text-xs text-primary font-medium">Education</span>
                  <h4 className="font-semibold mt-2">The Importance of Quality School Books</h4>
                </CardContent>
              </Card>
            </Link>
            <Link to="/blog/art-supplies-beginners">
              <Card variant="interactive">
                <CardContent className="p-4">
                  <span className="text-xs text-primary font-medium">Art Supplies</span>
                  <h4 className="font-semibold mt-2">Top 10 Art Supplies for Beginners</h4>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default BlogPostPage;
