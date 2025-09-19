import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";

interface DogRegistrationProps {
  onSuccess: () => void;
}

export function DogRegistration({ onSuccess }: DogRegistrationProps) {
  const registerDog = useMutation(api.dogs.registerDog);
  const ownerProfile = useQuery(api.dogs.getOwnerProfile);
  
  const [formData, setFormData] = useState({
    // Dog information
    name: "",
    breed: "",
    color: "",
    age: "",
    weight: "",
    sex: "male" as "male" | "female",
    spayedNeutered: false,
    microchipNumber: "",
    // Owner information
    firstName: ownerProfile?.firstName || "",
    lastName: ownerProfile?.lastName || "",
    address: ownerProfile?.address || "",
    city: ownerProfile?.city || "Chambersburg",
    state: ownerProfile?.state || "PA",
    zipCode: ownerProfile?.zipCode || "",
    phone: ownerProfile?.phone || "",
    emergencyContact: ownerProfile?.emergencyContact || "",
    emergencyPhone: ownerProfile?.emergencyPhone || "",
    // Vaccination information
    rabiesVaccinationDate: "",
    rabiesVaccinationExpiration: "",
    veterinarianName: "",
    veterinarianPhone: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form when owner profile loads
  if (ownerProfile && !formData.firstName) {
    setFormData(prev => ({
      ...prev,
      firstName: ownerProfile.firstName,
      lastName: ownerProfile.lastName,
      address: ownerProfile.address,
      city: ownerProfile.city,
      state: ownerProfile.state,
      zipCode: ownerProfile.zipCode,
      phone: ownerProfile.phone,
      emergencyContact: ownerProfile.emergencyContact || "",
      emergencyPhone: ownerProfile.emergencyPhone || "",
    }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await registerDog({
        name: formData.name,
        breed: formData.breed,
        color: formData.color,
        age: parseInt(formData.age),
        weight: parseFloat(formData.weight),
        sex: formData.sex,
        spayedNeutered: formData.spayedNeutered,
        microchipNumber: formData.microchipNumber || undefined,
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        phone: formData.phone,
        emergencyContact: formData.emergencyContact || undefined,
        emergencyPhone: formData.emergencyPhone || undefined,
        rabiesVaccinationDate: new Date(formData.rabiesVaccinationDate).getTime(),
        rabiesVaccinationExpiration: new Date(formData.rabiesVaccinationExpiration).getTime(),
        veterinarianName: formData.veterinarianName,
        veterinarianPhone: formData.veterinarianPhone,
      });

      toast.success(`Dog registered successfully! License #${result.licenseNumber}`);
      onSuccess();
    } catch (error) {
      toast.error("Failed to register dog. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Register New Dog</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dog Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dog Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dog Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Breed *
              </label>
              <input
                type="text"
                name="breed"
                value={formData.breed}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color *
              </label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age (years) *
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                min="0"
                max="30"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight (lbs) *
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                required
                min="1"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sex *
              </label>
              <select
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="spayedNeutered"
                  checked={formData.spayedNeutered}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">
                  Spayed/Neutered (Reduced fee: $15 vs $25)
                </span>
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Microchip Number (optional)
              </label>
              <input
                type="text"
                name="microchipNumber"
                value={formData.microchipNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Owner Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Owner Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State *
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                maxLength={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code *
              </label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                required
                pattern="[0-9]{5}(-[0-9]{4})?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Emergency Contact
              </label>
              <input
                type="text"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Emergency Phone
              </label>
              <input
                type="tel"
                name="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Vaccination Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rabies Vaccination Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vaccination Date *
              </label>
              <input
                type="date"
                name="rabiesVaccinationDate"
                value={formData.rabiesVaccinationDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vaccination Expiration *
              </label>
              <input
                type="date"
                name="rabiesVaccinationExpiration"
                value={formData.rabiesVaccinationExpiration}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Veterinarian Name *
              </label>
              <input
                type="text"
                name="veterinarianName"
                value={formData.veterinarianName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Veterinarian Phone *
              </label>
              <input
                type="tel"
                name="veterinarianPhone"
                value={formData.veterinarianPhone}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Registering..." : "Register Dog"}
          </button>
        </div>
      </form>
    </div>
  );
}
