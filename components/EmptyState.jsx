import { Car } from "lucide-react";

export default function EmptyState({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-6">
        <Car className="w-10 h-10 text-muted-foreground/50" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title || "No cars available"}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        {description || "Check back later or try adjusting your search filters."}
      </p>
    </div>
  );
}