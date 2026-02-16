import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  BookMarked, 
  BookOpen, 
  Palette, 
  FolderOpen, 
  Pencil, 
  Notebook,
  FileText,
  Boxes,
  AlertCircle
} from "lucide-react";
import { getCategories } from "@/services/api";
import { Category } from "@/types";

// Icon mapping for categories
const categoryIcons: Record<string, typeof BookMarked> = {
  "Islamic Books / Holy Quran": BookMarked,
  "Novels": BookOpen,
  "Colors & Markers": Palette,
  "Files & Folders": FolderOpen,
  "Art Supplies": Pencil,
  "Notebooks": Notebook,
  "Loose Sheets": FileText,
  "General Stationery": Boxes,
};

const StationeryPage = () => {
  // Fetch categories using React Query
  const { data: categoriesResponse, isLoading, isError, error } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await getCategories();
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch categories");
      }
      return response.data;
    },
  });

  const categories = categoriesResponse || [];

  return (
    <div className="py-8 md:py-12">
      <div className="container">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Stationery Categories</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Browse our extensive collection of stationery, books, and educational materials. 
            Find everything you need for school, office, or personal use.
          </p>
        </div>


        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} variant="interactive" className="h-full">
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="w-14 h-14 rounded-2xl" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error loading categories</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : "Failed to load categories. Please try again later."}
            </AlertDescription>
          </Alert>
        )}

        {/* Categories List */}
        {!isLoading && !isError && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category, index) => {
              const IconComponent = categoryIcons[category.name] || Boxes;
              return (
                <Link key={category.id} to={category.href}>
                  <Card 
                    variant="interactive" 
                    className="h-full"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardContent className="p-6 space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <IconComponent className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{category.description}</p>
                        <span className="text-xs text-primary font-medium">{category.count}+ items</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        {/* SEO Content */}
        <div className="mt-16 max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Quality Stationery for Every Need</h2>
          <p className="text-muted-foreground leading-relaxed">
            At Umar Kitab Ghar, we understand the importance of quality stationery in education and work. 
            Our carefully curated collection includes everything from basic school supplies to specialized 
            art materials. Whether you're a student preparing for exams, an artist working on your next 
            masterpiece, or a professional organizing your workspace, we have the right products for you. 
            All our items are sourced from trusted brands to ensure durability and value for money.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StationeryPage;
