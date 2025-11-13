import { useState, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { ApartmentCard } from "@/components/ApartmentCard";
import { FilterSection, FilterState } from "@/components/FilterSection";
import { mockApartments } from "@/data/apartments";

const Index = () => {
  const [filters, setFilters] = useState<FilterState>({
    bedrooms: "all",
    address: "",
    date: undefined,
    maxPrice: ""
  });

  const filteredApartments = useMemo(() => {
    return mockApartments.filter(apartment => {
      // Filter by bedrooms
      if (filters.bedrooms !== "all") {
        const bedroomCount = parseInt(filters.bedrooms);
        if (bedroomCount === 3 && apartment.bedrooms < 3) return false;
        if (bedroomCount !== 3 && apartment.bedrooms !== bedroomCount) return false;
      }

      // Filter by address
      if (filters.address && !apartment.address.toLowerCase().includes(filters.address.toLowerCase())) {
        return false;
      }

      // Filter by max price
      if (filters.maxPrice && apartment.price > parseInt(filters.maxPrice)) {
        return false;
      }

      // Filter by date
      if (filters.date && apartment.availableFrom > filters.date) {
        return false;
      }

      return true;
    });
  }, [filters]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Find Your Perfect Home</h1>
          <p className="text-muted-foreground text-lg">
            Browse through {mockApartments.length} available apartments
          </p>
        </div>
        
        <div className="grid lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <FilterSection onFilterChange={setFilters} />
          </aside>
          
          <main className="lg:col-span-3">
            {filteredApartments.length > 0 ? (
              <>
                <p className="text-muted-foreground mb-4">
                  Showing {filteredApartments.length} {filteredApartments.length === 1 ? 'apartment' : 'apartments'}
                </p>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredApartments.map(apartment => (
                    <ApartmentCard key={apartment.id} apartment={apartment} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">No apartments match your filters</p>
                <p className="text-sm text-muted-foreground mt-2">Try adjusting your search criteria</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Index;
