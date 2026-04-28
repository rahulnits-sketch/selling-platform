import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp } from "lucide-react";

import { appClient } from "@/api/localDataClient";
import CarCard from "../components/CarCard";
import SearchFilter from "../components/SearchFilter";
import EmptyState from "../components/EmptyState";
import LoadingGrid from "../components/LoadingGrid";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [filters, setFilters] = useState({
    search: "",
    fuel_type: "",
    transmission: "",
    sort: "newest",
  });

  const { data: cars = [], isLoading } = useQuery({
    queryKey: ["cars"],
    queryFn: () => appClient.entities.Car.list("-created_date", 100),
  });

  const filteredCars = useMemo(() => {
    let result = cars.filter((car) => car.status !== "sold");

    if (filters.search) {
      const query = filters.search.toLowerCase();
      result = result.filter(
        (car) =>
          car.title?.toLowerCase().includes(query) ||
          car.brand?.toLowerCase().includes(query) ||
          car.location?.toLowerCase().includes(query)
      );
    }

    if (filters.fuel_type) {
      result = result.filter((car) => car.fuel_type === filters.fuel_type);
    }

    if (filters.transmission) {
      result = result.filter((car) => car.transmission === filters.transmission);
    }

    if (filters.sort === "price_low") {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (filters.sort === "price_high") {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    return result;
  }, [cars, filters]);

  const featuredCars = filteredCars.filter((car) => car.is_featured);
  const regularCars = filteredCars.filter((car) => !car.is_featured);

  const { data: adminContact } = useQuery({
    queryKey: ["adminContact"],
    queryFn: () => appClient.admin.getContact(),
  });

  const adminPhone = adminContact?.phone;
  const adminWhatsApp = adminPhone?.replace(/\D/g, "");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <section className="text-center space-y-4 py-8">
        <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-1.5 rounded-full text-xs font-medium">
          <TrendingUp className="w-3.5 h-3.5" />
          {cars.length} cars listed
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold tracking-tight">
          Find Your Perfect <span className="text-primary">Ride</span>
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base">
          Browse through our curated collection of quality pre-owned vehicles at the best prices.
        </p>

        {adminPhone ? (
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
            <Button
              type="button"
              onClick={() => (window.location.href = `tel:${adminPhone}`)}
              className="rounded-xl"
            >
              Call Now
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => window.open(`https://wa.me/${adminWhatsApp}`, "_blank")}
              className="rounded-xl"
            >
              WhatsApp Now
            </Button>
          </div>
        ) : (
          <p className="mt-6 text-sm text-muted-foreground">
            Admin contact is not available yet. Please check back after it has been set.
          </p>
        )}
      </section>

      <SearchFilter filters={filters} onFiltersChange={setFilters} />

      {isLoading && <LoadingGrid />}

      {!isLoading && filteredCars.length === 0 && (
        <EmptyState
          title="No cars found"
          description={
            filters.search || filters.fuel_type || filters.transmission
              ? "Try adjusting your search or filters."
              : "No cars are currently listed. Check back soon!"
          }
        />
      )}

      {!isLoading && featuredCars.length > 0 && (
        <section className="space-y-5">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="w-1 h-5 bg-primary rounded-full" />
            Featured Cars
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCars.map((car, index) => (
              <CarCard key={car.id} car={car} index={index} />
            ))}
          </div>
        </section>
      )}

      {!isLoading && regularCars.length > 0 && (
        <section className="space-y-5">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="w-1 h-5 bg-primary rounded-full" />
            {featuredCars.length > 0 ? "All Cars" : "Available Cars"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularCars.map((car, index) => (
              <CarCard key={car.id} car={car} index={index} />
            ))}
          </div>
        </section>
      )}

      <footer className="text-center py-10 border-t border-border/50 text-xs text-muted-foreground space-y-2">
        <p>&copy; {new Date().getFullYear()} AutoBazaar. All rights reserved.</p>
        <p>Created by Rahul</p>
      </footer>
    </div>
  );
}
