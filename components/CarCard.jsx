import { Link } from "react-router-dom";
import { MapPin, Fuel, Calendar, Gauge } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function CarCard({ car, index = 0 }) {
  const formatPrice = (price) => {
    if (!price) return "Contact for price";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Link
      to={`/car/${car.id}`}
      className="group block animate-fade-in-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-[3/2] overflow-hidden bg-muted">
          <img
            src={car.image}
            alt={car.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {car.is_featured && (
            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground border-0 shadow-lg">
              Featured
            </Badge>
          )}
          {car.status === "sold" && (
            <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center">
              <span className="text-white font-bold text-xl tracking-wider uppercase">Sold</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-base leading-tight line-clamp-1 group-hover:text-primary transition-colors">
              {car.title}
            </h3>
          </div>

          <p className="text-xl font-bold text-primary">
            {formatPrice(car.price)}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {car.year && (
              <span className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md">
                <Calendar className="w-3 h-3" />
                {car.year}
              </span>
            )}
            {car.fuel_type && (
              <span className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md">
                <Fuel className="w-3 h-3" />
                {car.fuel_type}
              </span>
            )}
            {car.mileage && (
              <span className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md">
                <Gauge className="w-3 h-3" />
                {car.mileage}
              </span>
            )}
          </div>

          {car.location && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1 border-t border-border/50">
              <MapPin className="w-3 h-3" />
              {car.location}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}