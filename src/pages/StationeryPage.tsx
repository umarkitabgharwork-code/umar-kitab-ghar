import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { 
  BookMarked, 
  BookOpen, 
  Palette, 
  FolderOpen, 
  Pencil, 
  Notebook,
  FileText,
  Boxes
} from "lucide-react";

const categories = [
  { 
    icon: BookMarked, 
    name: "Islamic Books / Holy Quran", 
    description: "Quran, Islamic literature, and religious texts",
    href: "/stationery/islamic-books",
    count: 150
  },
  { 
    icon: BookOpen, 
    name: "Novels", 
    description: "Fiction, non-fiction, and story books",
    href: "/stationery/novels",
    count: 200
  },
  { 
    icon: Palette, 
    name: "Colors & Markers", 
    description: "Crayons, markers, color pencils, and paints",
    href: "/stationery/colors-markers",
    count: 85
  },
  { 
    icon: FolderOpen, 
    name: "Files & Folders", 
    description: "Document organizers, binders, and folders",
    href: "/stationery/files-folders",
    count: 60
  },
  { 
    icon: Pencil, 
    name: "Art Supplies", 
    description: "Drawing materials, canvas, and craft supplies",
    href: "/stationery/art-supplies",
    count: 120
  },
  { 
    icon: Notebook, 
    name: "Notebooks", 
    description: "Exercise books, registers, and journals",
    href: "/stationery/notebooks",
    count: 95
  },
  { 
    icon: FileText, 
    name: "Loose Sheets", 
    description: "Graph paper, lined sheets, and blank paper",
    href: "/stationery/loose-sheets",
    count: 40
  },
  { 
    icon: Boxes, 
    name: "General Stationery", 
    description: "Pens, pencils, erasers, rulers, and more",
    href: "/stationery/general",
    count: 180
  },
];

const StationeryPage = () => {
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


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Link key={category.href} to={category.href}>
              <Card 
                variant="interactive" 
                className="h-full"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <category.icon className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{category.description}</p>
                    <span className="text-xs text-primary font-medium">{category.count}+ items</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

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
