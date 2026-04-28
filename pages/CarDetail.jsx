import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { appClient } from "@/api/localDataClient";
import { ArrowLeft, MapPin, Fuel, Calendar, Gauge, Settings2, Phone, MessageCircle } from "lucide-react";
import ImageGallery from "../components/ImageGallery";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CarDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: cars = [], isLoading } = useQuery({
    queryKey: ["cars"],
    queryFn: () => appClient.entities.Car.list("-created_date", 100),
  });

  const car = cars.find((c) => c.id === id);

  const contactPhone = car?.phone || "+15125550123";
  const contactWhatsAppNumber = contactPhone.replace(/\D/g, "");

  const handleCall = () => {
    window.location.href = `tel:${contactPhone}`;
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${contactWhatsAppNumber}`, "_blank");
  };

  const formatPrice = (price) => {
    if (!price) return "Contact for price";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-32" />
        <div className="aspect-video bg-muted rounded-2xl" />
        <div className="h-8 bg-muted rounded w-3/4" />
        <div className="h-12 bg-muted rounded w-1/3" />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-semibold">Car not found</h2>
        <p className="text-muted-foreground text-sm">This listing may have been removed.</p>
        <Button variant="outline" onClick={() => navigate("/")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to listings
        </Button>
      </div>
    );
  }

  const details = [
    { icon: Calendar, label: "Year", value: car.year },
    { icon: Fuel, label: "Fuel", value: car.fuel_type },
    { icon: Settings2, label: "Transmission", value: car.transmission },
    { icon: Gauge, label: "Mileage", value: car.mileage },
    { icon: MapPin, label: "Location", value: car.location },
  ].filter((d) => d.value);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to listings
      </Link>

      {/* Image Gallery */}
      <div className="relative">
        <ImageGallery
          images={[car.image, ...(car.images || [])].filter(Boolean)}
          alt={car.title}
        />
        {car.status === "sold" && (
          <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center rounded-2xl">
            <span className="text-white font-bold text-3xl tracking-widest uppercase">Sold</span>
          </div>
        )}
      </div>

      {/* Title & Price */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-display font-bold">{car.title}</h1>
        <p className="text-3xl font-bold text-primary">{formatPrice(car.price)}</p>
        {car.brand && (
          <Badge variant="secondary" className="mt-1">{car.brand}</Badge>
        )}
      </div>

      {/* Specs Grid */}
      {details.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {details.map((d) => (
            <div
              key={d.label}
              className="flex flex-col items-center gap-2 p-4 bg-card border border-border/50 rounded-xl text-center"
            >
              <d.icon className="w-5 h-5 text-primary" />
              <span className="text-xs text-muted-foreground">{d.label}</span>
              <span className="text-sm font-semibold">{d.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Description */}
      {car.description && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Description</h2>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {car.description}
          </p>
        </div>
      )}

      {/* Contact CTA */}
      {car.status !== "sold" && (
        <div className="flex flex-col sm:flex-row gap-3 p-6 bg-accent rounded-2xl border border-primary/10">
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Interested in this car?</h3>
            <p className="text-sm text-muted-foreground">Get in touch with the seller for more details.</p>
          </div>
          <div className="flex gap-2">
            <Button type="button" onClick={handleCall} className="gap-2 rounded-xl">
              <Phone className="w-4 h-4" />
              Call Now
            </Button>
            <Button type="button" variant="outline" onClick={handleWhatsApp} className="gap-2 rounded-xl">
              <MessageCircle className="w-4 h-4" />
              WhatsApp Now
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
