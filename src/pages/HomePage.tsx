import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BookOpen, 
  GraduationCap, 
  ShoppingBag, 
  FileText, 
  Search,
  BookMarked,
  Palette,
  FolderOpen,
  Notebook,
  Pencil,
  Star,
  Clock,
  Truck,
  ArrowRight
} from "lucide-react";
import heroImage from "@/assets/hero-books.jpg";
import { ROUTES } from "@/lib/constants";
import { getBlogPosts } from "@/services/api";

const mainActions = [
  {
    icon: GraduationCap,
    title: "Buy Full School Course",
    description: "Complete book sets for any class from Nursery to 10th",
    href: ROUTES.BUY_COURSE,
    color: "bg-primary",
  },
  {
    icon: BookOpen,
    title: "Buy Single Book",
    description: "Find and order individual books or items",
    href: ROUTES.BUY_BOOK,
    color: "bg-accent",
  },
  {
    icon: ShoppingBag,
    title: "Browse Stationery",
    description: "Explore notebooks, art supplies, and more",
    href: ROUTES.STATIONERY,
    color: "bg-primary",
  },
  {
    icon: FileText,
    title: "Read Our Blog",
    description: "Tips, guides, and educational content",
    href: ROUTES.BLOG,
    color: "bg-accent",
  },
];

const categories = [
  { icon: BookMarked, name: "Islamic Books", href: "/stationery/islamic-books" },
  { icon: BookOpen, name: "Novels", href: "/stationery/novels" },
  { icon: Palette, name: "Colors & Markers", href: "/stationery/colors-markers" },
  { icon: FolderOpen, name: "Files & Folders", href: "/stationery/files-folders" },
  { icon: Pencil, name: "Art Supplies", href: "/stationery/art-supplies" },
  { icon: Notebook, name: "Notebooks", href: "/stationery/notebooks" },
];

const features = [
  { icon: Star, title: "Quality Products", description: "Original books and premium stationery" },
  { icon: Clock, title: "Quick Processing", description: "Fast order preparation and dispatch" },
  { icon: Truck, title: "Easy Delivery", description: "Pickup or home delivery options" },
];

const HomePage = () => {
  // Fetch blog posts using React Query (only latest 3 for homepage)
  const { data: blogPostsResponse, isLoading: isLoadingBlog } = useQuery({
    queryKey: ["blogPosts"],
    queryFn: async () => {
      const response = await getBlogPosts();
      if (!response.success) {
        return [];
      }
      return response.data.slice(0, 3); // Only show latest 3 on homepage
    },
  });

  const blogPosts = blogPostsResponse || [];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 hero-gradient opacity-90" />
        </div>
        <div className="container relative py-20 md:py-32">
          <div className="max-w-2xl space-y-6 animate-slide-up">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight">
              Your Trusted Partner for <span className="text-accent">School Books</span> & Stationery
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90">
              Find complete school courses, individual books, and quality stationery all in one place. 
              From Nursery to Class 10, we have everything your child needs for academic success.
            </p>
            
            {/* Search Bar - Disabled (no backend) */}
            <div className="flex gap-2 max-w-lg opacity-50 pointer-events-none">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Search for books, stationery..." 
                  className="pl-12 bg-card/95 border-0 h-14 text-foreground"
                  disabled
                />
              </div>
              <Button size="xl" variant="accent" disabled>
                Search
              </Button>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <Button asChild size="xl" variant="hero-outline">
                <Link to={ROUTES.BUY_COURSE}>Shop Now</Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10">
                <Link to={ROUTES.BLOG}>Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>


      {/* Main Action Cards */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Would You Like to Do?</h2>
            <p className="text-muted-foreground">
              Choose from our range of services to find exactly what you need for your educational journey.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mainActions.map((action, index) => (
              <Link key={action.href} to={action.href}>
                <Card 
                  variant="interactive" 
                  className="h-full"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6 flex gap-4">
                    <div className={`flex-shrink-0 w-14 h-14 rounded-xl ${action.color} flex items-center justify-center`}>
                      <action.icon className="h-7 w-7 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{action.title}</h3>
                      <p className="text-muted-foreground">{action.description}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground self-center" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Browse Categories</h2>
            <p className="text-muted-foreground">
              Explore our wide range of stationery and educational materials.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <Link key={category.href} to={category.href}>
                <Card 
                  variant="interactive" 
                  className="text-center py-6 h-full"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                      <category.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-medium text-sm">{category.name}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* Features */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={feature.title} 
                className="text-center space-y-4"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Welcome to Umar Kitab Ghar - Your Premier Educational Store
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Umar Kitab Ghar is Pakistan's trusted destination for school books, stationery, and educational 
              supplies. We offer complete course packages from Nursery to Class 10 for all major schools, 
              ensuring your child has the right materials for academic success. Our extensive collection 
              includes textbooks, notebooks, art supplies, Islamic literature, novels, and all essential 
              stationery items. With options for both store pickup and home delivery, shopping for 
              educational materials has never been easier. Quality products, competitive prices, and 
              excellent customer service - that's the Umar Kitab Ghar promise.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">From Our Blog</h2>
              <p className="text-muted-foreground">Tips, guides, and educational insights</p>
            </div>
            <Button asChild variant="outline" className="hidden md:flex">
              <Link to={ROUTES.BLOG}>View All Posts</Link>
            </Button>
          </div>

          {/* Loading State */}
          {isLoadingBlog && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} variant="interactive" className="h-full">
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Blog Posts List */}
          {!isLoadingBlog && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {blogPosts.map((post, index) => (
                <Link key={post.id} to={`/blog/${post.slug}`}>
                  <Card 
                    variant="interactive" 
                    className="h-full"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
                          {post.category}
                        </span>
                        <span className="text-xs text-muted-foreground">{post.date}</span>
                      </div>
                      <h3 className="text-lg font-semibold line-clamp-2">{post.title}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-3">{post.excerpt}</p>
                      <div className="flex items-center text-primary text-sm font-medium">
                        Read More <ArrowRight className="h-4 w-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Button asChild variant="outline">
              <Link to={ROUTES.BLOG}>View All Posts</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
