import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { appClient } from "@/api/localDataClient";
import AdminCarForm from "../components/AdminCarForm";
import AdminCarTable from "../components/AdminCarTable";
import EmptyState from "../components/EmptyState";
import { useAuth } from "@/lib/AuthContext";
import { Input } from "@/components/ui/input";
import { Plus, LayoutDashboard, Car } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const [showForm, setShowForm] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const queryClient = useQueryClient();
  const [adminPhone, setAdminPhone] = useState("");

  const { data: cars = [], isLoading } = useQuery({
    queryKey: ["cars"],
    queryFn: () => appClient.entities.Car.list("-created_date", 200),
  });

  const { data: adminContact } = useQuery({
    queryKey: ["adminContact"],
    queryFn: () => appClient.admin.getContact(),
  });

  useEffect(() => {
    if (adminContact?.phone) {
      setAdminPhone(adminContact.phone);
    }
  }, [adminContact]);

  const saveAdminContact = useMutation({
    mutationFn: (phone) => appClient.admin.setContact({ phone }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["adminContact"] });
      setAdminPhone(data.phone || "");
    },
  });

  const clearAdminContact = useMutation({
    mutationFn: () => appClient.admin.clearContact(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminContact"] });
      setAdminPhone("");
    },
  });

  const stats = {
    total: cars.length,
    available: cars.filter((c) => c.status !== "sold").length,
    sold: cars.filter((c) => c.status === "sold").length,
    featured: cars.filter((c) => c.is_featured).length,
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold flex items-center gap-3">
              <LayoutDashboard className="w-6 h-6 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your car listings</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="destructive" size="sm" onClick={handleLogout}>
              Logout
            </Button>
            <Button onClick={() => setShowForm(!showForm)} className="gap-2 rounded-xl" size="sm">
              <Plus className="w-4 h-4" />
              {showForm ? "Cancel" : "Add Car"}
            </Button>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border/50">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Admin Contact</h2>
              <p className="text-sm text-muted-foreground">
                Set the phone number users can call or WhatsApp from the home page.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => saveAdminContact.mutate(adminPhone)}
                disabled={saveAdminContact.isLoading}
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => clearAdminContact.mutate()}
                disabled={clearAdminContact.isLoading}
              >
                Remove
              </Button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="admin-phone" className="text-sm font-medium text-slate-700 block">
                Phone Number
              </label>
              <Input
                id="admin-phone"
                placeholder="e.g. +1 512-555-0123"
                value={adminPhone}
                onChange={(event) => setAdminPhone(event.target.value)}
                className="rounded-lg"
              />
            </div>
          </div>

          {(saveAdminContact.isError || clearAdminContact.isError) && (
            <p className="mt-3 text-sm text-destructive">
              Failed to update admin contact. Please try again.
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Cars", value: stats.total, color: "bg-primary/10 text-primary" },
          { label: "Available", value: stats.available, color: "bg-green-100 text-green-700" },
          { label: "Sold", value: stats.sold, color: "bg-red-100 text-red-700" },
          { label: "Featured", value: stats.featured, color: "bg-amber-100 text-amber-700" },
        ].map((s) => (
          <div key={s.label} className="bg-card p-4 rounded-xl border border-border/50 text-center space-y-1">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Add Car Form */}
      {showForm && (
        <div className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm animate-fade-in-up">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Car className="w-5 h-5 text-primary" />
            Add New Listing
          </h2>
          <AdminCarForm onSuccess={() => setShowForm(false)} />
        </div>
      )}

      {/* Car List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : cars.length === 0 ? (
        <EmptyState
          title="No listings yet"
          description="Start by adding your first car listing."
        />
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">All Listings ({cars.length})</h2>
          <AdminCarTable cars={cars} />
        </div>
      )}
    </div>
  );
}
