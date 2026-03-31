import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BookOpen, Plus, Minus, AlertCircle, Search } from "lucide-react";
import { WishlistButton } from "@/components/WishlistButton";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import {
  getCategoryWithProductsBySlug,
  getProductStock,
  type CategoryWithProducts,
  type CategoryProductListFilters,
} from "@/services/api";

type BookWithImages = CategoryWithProducts["products"][number];

type MetaRow = { id: string; name: string };
type GenreRow = MetaRow & { type?: string | null };

const filterSidebarControlClass =
  "w-full mb-2 px-3 py-2 rounded-md bg-[#0a1f52] border border-blue-800 text-white text-sm placeholder:text-blue-200/60 focus:outline-none focus:ring-2 focus:ring-blue-500/40";

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const { items, addItem, updateQuantity } = useCart();
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const [selectedPublisher, setSelectedPublisher] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [publishers, setPublishers] = useState<MetaRow[]>([]);
  const [genres, setGenres] = useState<GenreRow[]>([]);
  const [subjects, setSubjects] = useState<MetaRow[]>([]);
  const [classes, setClasses] = useState<MetaRow[]>([]);

  const filterMountRef = useRef(true);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchTerm(searchTerm.trim()), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    const fetchMeta = async () => {
      const [pub, gen, sub, cls] = await Promise.all([
        supabase.from("publishers").select("*"),
        supabase.from("genres").select("*"),
        supabase.from("subjects").select("*"),
        supabase.from("classes").select("*"),
      ]);
      if (pub.data) setPublishers(pub.data as MetaRow[]);
      if (gen.data) setGenres(gen.data as GenreRow[]);
      if (sub.data) setSubjects(sub.data as MetaRow[]);
      if (cls.data) setClasses(cls.data as MetaRow[]);
    };
    fetchMeta();
  }, []);

  useEffect(() => {
    setPage(1);
    setSelectedPublisher("");
    setSelectedGenre("");
    setSelectedSubject("");
    setSelectedClass("");
    setSelectedLanguage("");
    setSortOrder("");
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setShowFilters(false);
    filterMountRef.current = true;
  }, [slug]);

  useEffect(() => {
    if (filterMountRef.current) {
      filterMountRef.current = false;
      return;
    }
    setPage(1);
  }, [
    selectedPublisher,
    selectedGenre,
    selectedSubject,
    selectedClass,
    selectedLanguage,
    sortOrder,
    debouncedSearchTerm,
  ]);

  const listFilters: CategoryProductListFilters = useMemo(
    () => ({
      publisherId: selectedPublisher || undefined,
      genreId: selectedGenre || undefined,
      subjectId: selectedSubject || undefined,
      classId: selectedClass || undefined,
      language: selectedLanguage.trim() || undefined,
      sortOrder: sortOrder === "low" || sortOrder === "high" ? sortOrder : undefined,
      titleSearch: debouncedSearchTerm || undefined,
    }),
    [
      selectedPublisher,
      selectedGenre,
      selectedSubject,
      selectedClass,
      selectedLanguage,
      sortOrder,
      debouncedSearchTerm,
    ]
  );

  const hasActiveListFilters = Boolean(
    selectedPublisher ||
      selectedGenre ||
      selectedSubject ||
      selectedClass ||
      selectedLanguage.trim()
  );

  const hasNoProductsButQueried =
    Boolean(debouncedSearchTerm) || hasActiveListFilters;

  const clearAllFilters = () => {
    setSelectedPublisher("");
    setSelectedGenre("");
    setSelectedSubject("");
    setSelectedClass("");
    setSelectedLanguage("");
    setSortOrder("");
    setSearchTerm("");
    setShowFilters(false);
  };

  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery<CategoryWithProducts>({
    queryKey: ["category-products", slug, { page, limit: PAGE_SIZE, filters: listFilters }],
    queryFn: async () => {
      if (!slug) {
        return {
          category: null,
          products: [],
          pagination: { total: 0, page: 1, totalPages: 1, limit: PAGE_SIZE },
        };
      }

      const response = await getCategoryWithProductsBySlug(slug, page, PAGE_SIZE, listFilters);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to load products");
      }

      return response.data;
    },
    enabled: Boolean(slug),
    placeholderData: (prev) => prev,
  });

  const category = data?.category ?? null;
  const products = data?.products ?? [];
  const totalPages = data?.pagination.totalPages ?? 1;

  const categoryType = useMemo(() => {
    const name = (category?.name ?? "").toLowerCase();
    const fromSlug = (slug ?? "").toLowerCase().replace(/-/g, " ");
    const text = name || fromSlug;
    if (text.includes("novel")) return "novel";
    if (text.includes("islamic")) return "islamic";
    if (text.includes("study")) return "study";
    return "other";
  }, [category?.name, slug]);

  const selectedCategory = slug ?? "";
  const selectedCategoryName = category?.name ?? slug ?? "";

  const isBookCategory = useMemo(() => {
    const name = selectedCategoryName?.toLowerCase() || "";

    return (
      name.includes("book") ||
      name.includes("novel") ||
      name.includes("islamic") ||
      name.includes("study")
    );
  }, [selectedCategoryName]);

  useEffect(() => {
    setSortOrder("");
  }, [selectedCategory]);

  useEffect(() => {
    if (categoryType !== "study") {
      setSelectedSubject("");
      setSelectedClass("");
    }
    if (categoryType !== "novel" && categoryType !== "islamic") {
      setSelectedGenre("");
    }
  }, [categoryType]);

  const getProductQuantity = (productId: string): number => {
    const item = items.find((i) => i.id === productId);
    return item?.quantity || 0;
  };

  const handleAddToCart = async (book: BookWithImages) => {
    const currentQuantityInCart = getProductQuantity(book.id);

    const stockResponse = await getProductStock(book.id);
    if (!stockResponse.success) {
      toast({
        variant: "destructive",
        description: "This item is out of stock.",
      });
      return;
    }

    const latestStock = stockResponse.data.stock;

    if (latestStock <= 0) {
      toast({
        variant: "destructive",
        description: "This item is out of stock.",
      });
      return;
    }

    if (currentQuantityInCart >= latestStock) {
      toast({
        variant: "destructive",
        description: "Maximum available stock reached.",
      });
      return;
    }

    const displayName = book.title ?? "Product";
    const displayPrice = Number(book.price ?? 0);

    addItem({
      id: book.id,
      name: displayName,
      price: displayPrice,
      category: category?.name || slug || "Category",
      image: book.product_images?.[0]?.image_url ?? book.image_url ?? undefined,
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    const item = items.find((i) => i.id === productId);
    if (item) {
      updateQuantity(productId, item.quantity - 1);
    }
  };

  const displayName = category?.name || slug || "Category";
  const selectedPublisherLabel =
    publishers.find((publisher) => publisher.id === selectedPublisher)?.name ?? selectedPublisher;
  const selectedGenreLabel =
    genres.find((genre) => genre.id === selectedGenre)?.name ?? selectedGenre;
  const selectedSubjectLabel =
    subjects.find((subject) => subject.id === selectedSubject)?.name ?? selectedSubject;
  const selectedClassLabel =
    classes.find((itemClass) => itemClass.id === selectedClass)?.name ?? selectedClass;

  const renderFilterContent = () => (
    <>
      {isBookCategory ? (
        <>
          <select
            value={selectedPublisher}
            onChange={(e) => setSelectedPublisher(e.target.value)}
            className={filterSidebarControlClass}
            aria-label="Filter by publisher"
          >
            <option value="">All Publishers</option>
            {publishers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {(categoryType === "novel" || categoryType === "islamic") && (
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className={filterSidebarControlClass}
              aria-label="Filter by genre"
            >
              <option value="">All Genres</option>
              {genres
                .filter((g) => g.type === categoryType)
                .map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
            </select>
          )}

          {categoryType === "study" && (
            <>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className={filterSidebarControlClass}
                aria-label="Filter by subject"
              >
                <option value="">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className={filterSidebarControlClass}
                aria-label="Filter by class"
              >
                <option value="">All Classes</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </>
          )}

          <input
            type="text"
            placeholder="Language"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full mb-2 px-3 py-2 bg-[#071235] border border-blue-800 text-white rounded-md placeholder:text-blue-200/60 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </>
      ) : (
        <select
          className="bg-[#0b1a4a] border border-white/20 text-white px-3 py-2 rounded-md w-full"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="">Sort</option>
          <option value="low">Price: Low to High</option>
          <option value="high">Price: High to Low</option>
        </select>
      )}
    </>
  );

  return (
    <div className="py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{displayName}</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Browse our collection of {displayName.toLowerCase()}.
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search in this category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12"
            />
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-6 xl:items-start">
          <aside className="hidden xl:block w-full xl:w-1/4 shrink-0 bg-[#071235] p-4 rounded-lg border border-blue-800">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="text-white font-semibold">Filters</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 h-8 text-xs border-blue-700 text-white hover:bg-white/10 hover:text-white"
                onClick={clearAllFilters}
              >
                Clear Filters
              </Button>
            </div>
            {renderFilterContent()}
          </aside>

          <div className="flex-1 min-w-0 space-y-6">
            <button
              onClick={() => setShowFilters(true)}
              className="xl:hidden bg-yellow-400 text-black px-4 py-2 rounded-md font-semibold"
            >
              Filters ⚙️
            </button>

            <div className="flex flex-wrap gap-2 mb-4">
              {selectedPublisher && (
                <span className="bg-yellow-400 text-black px-2 py-1 rounded text-sm inline-flex items-center gap-2">
                  Publisher: {selectedPublisherLabel}
                  <button onClick={() => setSelectedPublisher("")}>✕</button>
                </span>
              )}
              {selectedGenre && (
                <span className="bg-yellow-400 text-black px-2 py-1 rounded text-sm inline-flex items-center gap-2">
                  Genre: {selectedGenreLabel}
                  <button onClick={() => setSelectedGenre("")}>✕</button>
                </span>
              )}
              {selectedSubject && (
                <span className="bg-yellow-400 text-black px-2 py-1 rounded text-sm inline-flex items-center gap-2">
                  Subject: {selectedSubjectLabel}
                  <button onClick={() => setSelectedSubject("")}>✕</button>
                </span>
              )}
              {selectedClass && (
                <span className="bg-yellow-400 text-black px-2 py-1 rounded text-sm inline-flex items-center gap-2">
                  Class: {selectedClassLabel}
                  <button onClick={() => setSelectedClass("")}>✕</button>
                </span>
              )}
              {selectedLanguage && (
                <span className="bg-yellow-400 text-black px-2 py-1 rounded text-sm inline-flex items-center gap-2">
                  Language: {selectedLanguage}
                  <button onClick={() => setSelectedLanguage("")}>✕</button>
                </span>
              )}
              {sortOrder && (
                <span className="bg-yellow-400 text-black px-2 py-1 rounded text-sm inline-flex items-center gap-2">
                  Sort: {sortOrder === "low" ? "Price Low to High" : "Price High to Low"}
                  <button onClick={() => setSortOrder("")}>✕</button>
                </span>
              )}
            </div>

            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} variant="elevated">
                    <CardContent className="p-4">
                      <Skeleton className="aspect-square w-full mb-4" />
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-5 w-full mb-2" />
                      <Skeleton className="h-6 w-24" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {isError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error loading products</AlertTitle>
                <AlertDescription>
                  {error instanceof Error
                    ? error.message
                    : "Failed to load products. Please try again later."}
                </AlertDescription>
              </Alert>
            )}

            {!isLoading && !isError && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map((product) => {
                    const imageUrl =
                      product.product_images?.[0]?.image_url ?? product.image_url ?? undefined;
                    const stock = typeof product.stock === "number" ? product.stock : undefined;
                    const outOfStock = stock !== undefined ? stock <= 0 : false;
                    const quantityInCart = getProductQuantity(product.id);
                    const showLowStock =
                      !outOfStock && typeof stock === "number" && stock > 0 && stock < 5;

                    return (
                      <Card key={product.id} variant="elevated" className="h-full flex flex-col">
                        <CardContent className="p-4 relative flex flex-col h-full">
                          <div className="absolute top-2 right-2 z-10">
                            <WishlistButton productId={product.id} />
                          </div>
                          <Link
                            to={`/product/${product.id}`}
                            state={{ from: location.pathname }}
                            className="mb-4 overflow-hidden rounded-lg"
                          >
                            <div className="h-48 w-full bg-secondary/50 flex items-center justify-center overflow-hidden">
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={product.title ?? "Product image"}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                              )}
                            </div>
                          </Link>
                          <div className="space-y-2 flex-1 flex flex-col">
                            <span className="text-xs text-muted-foreground">{displayName}</span>
                            <Link to={`/product/${product.id}`} state={{ from: location.pathname }}>
                              <h3 className="font-medium line-clamp-2 hover:underline">
                                {product.title ?? "Untitled Product"}
                              </h3>
                            </Link>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex flex-col items-start">
                                <span className="text-lg text-yellow-400 font-semibold">
                                  Rs. {product.price ?? 0}
                                </span>
                                {showLowStock && (
                                  <span className="text-xs font-medium text-red-600">
                                    Only {stock} left
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="mt-auto flex flex-col gap-2">
                              {quantityInCart > 0 ? (
                                <div className="flex items-center gap-2 flex-wrap">
                                  {outOfStock && (
                                    <span className="text-sm font-medium text-red-600">Out of Stock</span>
                                  )}
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-8 w-8"
                                    onClick={() => handleRemoveFromCart(product.id)}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="w-8 text-center font-medium">
                                    {getProductQuantity(product.id)}
                                  </span>
                                  <Button
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleAddToCart(product)}
                                    disabled={outOfStock}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : outOfStock ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-red-600">Out of Stock</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleAddToCart(product)}
                                    disabled={outOfStock}
                                  >
                                    Add to Cart
                                  </Button>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <WishlistButton productId={product.id} showLabel size="sm" />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {products.length > 0 && totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <Button
                      variant="outline"
                      disabled={page === 1 || isFetching}
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={page >= totalPages || isFetching || products.length === 0}
                      onClick={() => setPage((prev) => (prev < totalPages ? prev + 1 : prev))}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}

            {!isLoading && !isError && products.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No products found</h3>
                  {hasNoProductsButQueried ? (
                    <p className="text-muted-foreground mb-4">
                      No books found with selected filters in this category.
                    </p>
                  ) : (
                    <p className="text-muted-foreground mb-4">
                      We don&apos;t have any products in this category yet. Check back soon!
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {searchTerm ? (
                      <Button variant="outline" onClick={() => setSearchTerm("")}>
                        Clear Search
                      </Button>
                    ) : null}
                    {hasActiveListFilters ? (
                      <Button variant="outline" onClick={clearAllFilters}>
                        Clear filters
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="fixed inset-0 z-50 bg-black/50 xl:hidden">
            <div className="absolute left-0 top-0 h-full w-80 max-w-[90vw] bg-[#0b1a4a] p-4 overflow-y-auto border-r border-blue-800">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-white font-semibold">Filters</h2>
                <button className="text-white text-lg" onClick={() => setShowFilters(false)}>
                  ✕
                </button>
              </div>
              <div className="mb-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs border-blue-700 text-white hover:bg-white/10 hover:text-white"
                  onClick={clearAllFilters}
                >
                  Clear Filters
                </Button>
              </div>
              {renderFilterContent()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
