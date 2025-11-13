import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { mockApartments } from "@/data/apartments";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Bed, Bath, Maximize, MapPin, Calendar, ArrowLeft, Check, Edit, Save, X, Upload, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { cn } from "@/lib/utils";

const apartmentSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  address: z.string().trim().min(1, "Address is required").max(200, "Address must be less than 200 characters"),
  price: z.number().min(1, "Price must be at least $1").max(1000000, "Price must be less than $1,000,000"),
  bedrooms: z.number().min(0, "Bedrooms must be at least 0").max(20, "Bedrooms must be less than 20"),
  bathrooms: z.number().min(0, "Bathrooms must be at least 0").max(20, "Bathrooms must be less than 20"),
  area: z.number().min(1, "Area must be at least 1 sqft").max(100000, "Area must be less than 100,000 sqft"),
  description: z.string().trim().min(1, "Description is required").max(2000, "Description must be less than 2000 characters"),
  amenities: z.string().max(500, "Amenities must be less than 500 characters"),
});

const ApartmentDetail = () => {
  const { id } = useParams();
  const apartment = mockApartments.find(apt => apt.id === id);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState({
    title: "",
    address: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    description: "",
    amenities: "",
    availableFrom: undefined as Date | undefined,
    images: [] as string[],
  });

  if (!apartment) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-xl">Apartment not found</p>
        </div>
      </div>
    );
  }

  const handleContact = () => {
    toast.success("Contact request sent! We'll get back to you soon.");
  };

  const handleEdit = () => {
    setEditData({
      title: apartment.title,
      address: apartment.address,
      price: apartment.price.toString(),
      bedrooms: apartment.bedrooms.toString(),
      bathrooms: apartment.bathrooms.toString(),
      area: apartment.area.toString(),
      description: apartment.description,
      amenities: apartment.amenities.join(", "),
      availableFrom: apartment.availableFrom,
      images: [...apartment.images],
    });
    setIsEditMode(true);
  };

  const handleCancel = () => {
    setIsEditMode(false);
  };

  const handleSave = () => {
    try {
      // Validate images
      if (editData.images.length === 0) {
        toast.error("Please add at least one image");
        return;
      }

      // Validate the input
      const validatedData = apartmentSchema.parse({
        title: editData.title,
        address: editData.address,
        price: parseFloat(editData.price),
        bedrooms: parseInt(editData.bedrooms),
        bathrooms: parseFloat(editData.bathrooms),
        area: parseInt(editData.area),
        description: editData.description,
        amenities: editData.amenities,
      });

      // In a real app, you would save to backend here
      // including the editData.images array
      toast.success("Apartment updated successfully!");
      setIsEditMode(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        toast.error(firstError.message);
      } else {
        toast.error("Failed to update apartment. Please check your inputs.");
      }
    }
  };

  const handleEditChange = (field: string, value: string | Date | undefined) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Create a preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageUrl = reader.result as string;
      setEditData(prev => ({
        ...prev,
        images: [...prev.images, imageUrl]
      }));
      toast.success('Image added successfully');
    };
    reader.readAsDataURL(file);
  };

  const handleImageDelete = (index: number) => {
    setEditData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    // Reset selected image if it was deleted
    if (selectedImage === index) {
      setSelectedImage(0);
    } else if (selectedImage > index) {
      setSelectedImage(selectedImage - 1);
    }
    toast.success('Image removed');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to listings
            </Button>
          </Link>
          
          {!isEditMode ? (
            <Button onClick={handleEdit} className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" />
                Save
              </Button>
              <Button onClick={handleCancel} variant="outline" className="gap-2">
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Main Image */}
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img 
                src={isEditMode ? editData.images[selectedImage] : apartment.images[selectedImage]} 
                alt={apartment.title}
                className="w-full h-96 object-cover"
              />
            </div>

            {/* Image Gallery */}
            {!isEditMode ? (
              <div className="grid grid-cols-4 gap-3">
                {apartment.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "rounded-lg overflow-hidden border-2 transition-all",
                      selectedImage === index ? "border-primary shadow-md" : "border-transparent hover:border-muted"
                    )}
                  >
                    <img 
                      src={image} 
                      alt={`View ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-lg font-semibold">Images</Label>
                  <label htmlFor="image-upload">
                    <Button type="button" variant="outline" size="sm" className="gap-2" asChild>
                      <span>
                        <Upload className="h-4 w-4" />
                        Add Image
                      </span>
                    </Button>
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {editData.images.map((image, index) => (
                    <div
                      key={index}
                      className={cn(
                        "relative rounded-lg overflow-hidden border-2 transition-all group",
                        selectedImage === index ? "border-primary shadow-md" : "border-transparent hover:border-muted"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedImage(index)}
                        className="w-full"
                      >
                        <img 
                          src={image} 
                          alt={`View ${index + 1}`}
                          className="w-full h-20 object-cover"
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleImageDelete(index)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {editData.images.length === 0 && (
                    <div className="col-span-4 text-center py-8 border-2 border-dashed rounded-lg">
                      <p className="text-muted-foreground text-sm">No images yet. Add some to get started.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">About this property</h2>
                {!isEditMode ? (
                  <p className="text-muted-foreground leading-relaxed">{apartment.description}</p>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={editData.description}
                      onChange={(e) => handleEditChange("description", e.target.value)}
                      className="min-h-32"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">Amenities</h2>
                {!isEditMode ? (
                  <div className="grid grid-cols-2 gap-3">
                    {apartment.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-primary" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="amenities">Amenities (comma separated)</Label>
                    <Input
                      id="amenities"
                      value={editData.amenities}
                      onChange={(e) => handleEditChange("amenities", e.target.value)}
                      placeholder="e.g., Parking, Gym, Pool"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent className="p-6 space-y-4">
                <div>
                  {!isEditMode ? (
                    <>
                      <h1 className="text-3xl font-bold mb-2">{apartment.title}</h1>
                      <div className="flex items-center gap-1 text-muted-foreground mb-4">
                        <MapPin className="h-4 w-4" />
                        <span>{apartment.address}</span>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={editData.title}
                          onChange={(e) => handleEditChange("title", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          value={editData.address}
                          onChange={(e) => handleEditChange("address", e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="py-4 border-t border-b">
                  {!isEditMode ? (
                    <div className="text-3xl font-bold text-primary mb-1">
                      ${apartment.price}<span className="text-lg font-normal text-muted-foreground">/month</span>
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="price">Monthly Rent ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={editData.price}
                        onChange={(e) => handleEditChange("price", e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {!isEditMode ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Bedrooms</span>
                        <div className="flex items-center gap-1 font-semibold">
                          <Bed className="h-4 w-4" />
                          {apartment.bedrooms}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Bathrooms</span>
                        <div className="flex items-center gap-1 font-semibold">
                          <Bath className="h-4 w-4" />
                          {apartment.bathrooms}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Area</span>
                        <div className="flex items-center gap-1 font-semibold">
                          <Maximize className="h-4 w-4" />
                          {apartment.area} sqft
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Available</span>
                        <div className="flex items-center gap-1 font-semibold">
                          <Calendar className="h-4 w-4" />
                          {format(apartment.availableFrom, "MMM dd, yyyy")}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="bedrooms">Bedrooms</Label>
                        <Input
                          id="bedrooms"
                          type="number"
                          value={editData.bedrooms}
                          onChange={(e) => handleEditChange("bedrooms", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="bathrooms">Bathrooms</Label>
                        <Input
                          id="bathrooms"
                          type="number"
                          step="0.5"
                          value={editData.bathrooms}
                          onChange={(e) => handleEditChange("bathrooms", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="area">Area (sqft)</Label>
                        <Input
                          id="area"
                          type="number"
                          value={editData.area}
                          onChange={(e) => handleEditChange("area", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Available From</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !editData.availableFrom && "text-muted-foreground"
                              )}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {editData.availableFrom ? format(editData.availableFrom, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={editData.availableFrom}
                              onSelect={(date) => handleEditChange("availableFrom", date)}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  )}
                </div>

                {!isEditMode && (
                  <Button onClick={handleContact} className="w-full mt-6" size="lg">
                    Contact Owner
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApartmentDetail;
