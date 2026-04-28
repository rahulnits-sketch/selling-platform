import { useQueryClient } from "@tanstack/react-query";
import { Trash2, Star, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { appClient } from "@/api/localDataClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminCarTable({ cars }) {
  const queryClient = useQueryClient();

  const refreshCars = async () => {
    await queryClient.invalidateQueries({ queryKey: ["cars"] });
  };

  const handleDelete = async (car) => {
    if (!window.confirm(`Delete "${car.title}"?`)) return;

    try {
      await appClient.entities.Car.delete(car.id);
      await refreshCars();
      toast.success("Car removed");
    } catch (error) {
      console.error("Deleting car failed:", error);
      toast.error("Failed to delete the car listing.");
    }
  };

  const toggleFeatured = async (car) => {
    try {
      await appClient.entities.Car.update(car.id, { is_featured: !car.is_featured });
      await refreshCars();
      toast.success(car.is_featured ? "Removed from featured" : "Marked as featured");
    } catch (error) {
      console.error("Updating featured status failed:", error);
      toast.error("Failed to update the featured status.");
    }
  };

  const toggleStatus = async (car) => {
    const newStatus = car.status === "sold" ? "available" : "sold";

    try {
      await appClient.entities.Car.update(car.id, { status: newStatus });
      await refreshCars();
      toast.success(`Marked as ${newStatus}`);
    } catch (error) {
      console.error("Updating listing status failed:", error);
      toast.error("Failed to update the listing status.");
    }
  };

  const formatPrice = (price) =>
    price
      ? new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        }).format(price)
      : "\u2014";

  return (
    <div className="space-y-3">
      {cars.map((car) => (
        <div
          key={car.id}
          className="flex items-center gap-4 p-3 bg-card rounded-xl border border-border/50 hover:border-border transition-colors"
        >
          <img
            src={car.image}
            alt={car.title}
            className="w-16 h-12 sm:w-20 sm:h-14 object-cover rounded-lg flex-shrink-0"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-semibold truncate">{car.title}</h4>
              {car.is_featured && (
                <Badge variant="secondary" className="text-xs">
                  Featured
                </Badge>
              )}
              {car.status === "sold" && (
                <Badge variant="destructive" className="text-xs">
                  Sold
                </Badge>
              )}
            </div>
            <p className="text-sm font-bold text-primary">{formatPrice(car.price)}</p>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <Link to={`/car/${car.id}`}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Eye className="w-4 h-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => toggleFeatured(car)}
              title={car.is_featured ? "Remove from featured" : "Mark as featured"}
            >
              <Star className={`w-4 h-4 ${car.is_featured ? "fill-primary text-primary" : ""}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={() => toggleStatus(car)}
            >
              {car.status === "sold" ? "Relist" : "Mark Sold"}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => handleDelete(car)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
