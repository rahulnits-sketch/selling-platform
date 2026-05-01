import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Upload, Plus } from "lucide-react";
import { toast } from "sonner";

import { appClient } from "@/api/localDataClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const initialFormState = {
  title: "",
  price: "",
  image: "",
  brand: "",
  year: "",
  mileage: "",
  fuel_type: "",
  transmission: "",
  location: "",
  phone: "",
  description: "",
  is_featured: false,
  status: "available",
  images: [],
};

export default function AdminCarForm({ onSuccess }) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingExtra, setUploadingExtra] = useState(false);
  const [form, setForm] = useState(initialFormState);

  const update = (key, value) => {
    setForm((currentForm) => ({ ...currentForm, [key]: value }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url: fileUrl } = await appClient.integrations.Core.UploadFile({ file });
      setForm((currentForm) => ({ ...currentForm, image: fileUrl }));
      toast.success("Main image uploaded");
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error("Failed to upload the main image.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleExtraImagesUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setUploadingExtra(true);
    try {
      const uploadedFiles = await Promise.all(
        files.map((file) => appClient.integrations.Core.UploadFile({ file }))
      );
      const urls = uploadedFiles.map((result) => result.file_url);

      setForm((currentForm) => ({
        ...currentForm,
        images: [...(currentForm.images || []), ...urls],
      }));
      toast.success("Additional photos uploaded");
    } catch (error) {
      console.error("Additional image upload failed:", error);
      toast.error("Failed to upload one or more additional photos.");
    } finally {
      setUploadingExtra(false);
      event.target.value = "";
    }
  };

  const removeExtraImage = (indexToRemove) => {
    setForm((currentForm) => ({
      ...currentForm,
      images: currentForm.images.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title || !form.price || !form.image) {
      toast.error("Title, price, and image are required.");
      return;
    }

    setSaving(true);
    try {
      await appClient.entities.Car.create({
        ...form,
        price: Number(form.price),
        year: form.year ? Number(form.year) : undefined,
      });

      await queryClient.invalidateQueries({ queryKey: ["cars"] });
      toast.success("Car added successfully!");
      setForm(initialFormState);
      onSuccess?.();
    } catch (error) {
      console.error("Saving car failed:", error);
      toast.error("Failed to add the car listing.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Title *</Label>
          <Input
            placeholder="e.g. 2023 Honda Civic"
            value={form.title}
            onChange={(event) => update("title", event.target.value)}
            className="rounded-lg"
          />
        </div>

        <div className="space-y-2">
          <Label>Price (INR) *</Label>
          <Input
            type="number"
            placeholder="e.g. 25000"
            value={form.price}
            onChange={(event) => update("price", event.target.value)}
            className="rounded-lg"
          />
        </div>

        <div className="space-y-2">
          <Label>Brand</Label>
          <Input
            placeholder="e.g. Honda"
            value={form.brand}
            onChange={(event) => update("brand", event.target.value)}
            className="rounded-lg"
          />
        </div>

        <div className="space-y-2">
          <Label>Year</Label>
          <Input
            type="number"
            placeholder="e.g. 2023"
            value={form.year}
            onChange={(event) => update("year", event.target.value)}
            className="rounded-lg"
          />
        </div>

        <div className="space-y-2">
          <Label>Mileage</Label>
          <Input
            placeholder="e.g. 45,000 km"
            value={form.mileage}
            onChange={(event) => update("mileage", event.target.value)}
            className="rounded-lg"
          />
        </div>

        <div className="space-y-2">
          <Label>Fuel Type</Label>
          <Select
            value={form.fuel_type || "none"}
            onValueChange={(value) => update("fuel_type", value === "none" ? "" : value)}
          >
            <SelectTrigger className="rounded-lg">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Select</SelectItem>
              <SelectItem value="Petrol">Petrol</SelectItem>
              <SelectItem value="Diesel">Diesel</SelectItem>
              <SelectItem value="Electric">Electric</SelectItem>
              <SelectItem value="Hybrid">Hybrid</SelectItem>
              <SelectItem value="CNG">CNG</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Transmission</Label>
          <Select
            value={form.transmission || "none"}
            onValueChange={(value) => update("transmission", value === "none" ? "" : value)}
          >
            <SelectTrigger className="rounded-lg">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Select</SelectItem>
              <SelectItem value="Automatic">Automatic</SelectItem>
              <SelectItem value="Manual">Manual</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Location</Label>
          <Input
            placeholder="e.g. New York, NY"
            value={form.location}
            onChange={(event) => update("location", event.target.value)}
            className="rounded-lg"
          />
        </div>

        <div className="space-y-2">
          <Label>Phone Number</Label>
          <Input
            placeholder="e.g. +1 512-555-0123"
            value={form.phone}
            onChange={(event) => update("phone", event.target.value)}
            className="rounded-lg"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Image *</Label>
        <div className="flex gap-3 items-center">
          <label className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg cursor-pointer hover:bg-secondary/80 transition-colors text-sm">
            <Upload className="w-4 h-4" />
            {uploading ? "Uploading..." : "Upload Image"}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
          {form.image && (
            <img
              src={form.image}
              alt="Preview"
              className="h-12 w-18 object-cover rounded-lg border"
            />
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Uploaded images are stored in the database so they stay available after Render redeploys.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Additional Photos (multiple angles)</Label>
        <div className="flex flex-wrap gap-2 items-center">
          {form.images?.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`angle ${index + 1}`}
                className="h-16 w-24 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={() => removeExtraImage(index)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                &times;
              </button>
            </div>
          ))}
          <label className="flex flex-col items-center justify-center h-16 w-24 bg-secondary rounded-lg cursor-pointer hover:bg-secondary/80 transition-colors text-xs text-muted-foreground border-2 border-dashed border-border gap-1">
            <Upload className="w-4 h-4" />
            {uploadingExtra ? "Uploading..." : "Add Photos"}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleExtraImagesUpload}
              className="hidden"
            />
          </label>
        </div>
        {form.images?.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {form.images.length} additional photo(s) added
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          placeholder="Describe the car's condition, features, etc."
          value={form.description}
          onChange={(event) => update("description", event.target.value)}
          rows={3}
          className="rounded-lg"
        />
      </div>

      <div className="flex items-center gap-3">
        <Switch
          checked={form.is_featured}
          onCheckedChange={(value) => update("is_featured", value)}
        />
        <Label>Mark as featured listing</Label>
      </div>

      <Button type="submit" disabled={saving} className="w-full rounded-xl h-11 gap-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        {saving ? "Adding Car..." : "Add Car"}
      </Button>
    </form>
  );
}
