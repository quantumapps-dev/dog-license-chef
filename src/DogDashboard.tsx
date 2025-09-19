import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { Id } from "../convex/_generated/dataModel";

export function DogDashboard() {
  const dogs = useQuery(api.dogs.getMyDogs);
  const renewLicense = useMutation(api.dogs.renewLicense);
  const [renewingLicense, setRenewingLicense] = useState<Id<"licenses"> | null>(null);
  const [renewalData, setRenewalData] = useState({
    rabiesVaccinationDate: "",
    rabiesVaccinationExpiration: "",
    veterinarianName: "",
    veterinarianPhone: "",
  });

  if (dogs === undefined) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleRenewLicense = async (licenseId: Id<"licenses">) => {
    try {
      await renewLicense({
        licenseId,
        rabiesVaccinationDate: new Date(renewalData.rabiesVaccinationDate).getTime(),
        rabiesVaccinationExpiration: new Date(renewalData.rabiesVaccinationExpiration).getTime(),
        veterinarianName: renewalData.veterinarianName,
        veterinarianPhone: renewalData.veterinarianPhone,
      });
      
      toast.success("License renewed successfully!");
      setRenewingLicense(null);
      setRenewalData({
        rabiesVaccinationDate: "",
        rabiesVaccinationExpiration: "",
        veterinarianName: "",
        veterinarianPhone: "",
      });
    } catch (error) {
      toast.error("Failed to renew license. Please try again.");
      console.error(error);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const isExpired = (expirationDate: number) => {
    return Date.now() > expirationDate;
  };

  const isExpiringSoon = (expirationDate: number) => {
    const thirtyDaysFromNow = Date.now() + (30 * 24 * 60 * 60 * 1000);
    return Date.now() < expirationDate && expirationDate < thirtyDaysFromNow;
  };

  if (dogs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🐕</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No dogs registered</h3>
        <p className="text-gray-600">Register your first dog to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">My Registered Dogs</h2>
      
      <div className="grid gap-6">
        {dogs.map((dog) => (
          <div key={dog._id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{dog.name}</h3>
                <p className="text-gray-600">{dog.breed} • {dog.color} • {dog.sex}</p>
              </div>
              {dog.license && (
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    License #{dog.license.licenseNumber}
                  </div>
                  <div className={`text-sm px-2 py-1 rounded-full inline-block mt-1 ${
                    isExpired(dog.license.expirationDate)
                      ? "bg-red-100 text-red-800"
                      : isExpiringSoon(dog.license.expirationDate)
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}>
                    {isExpired(dog.license.expirationDate)
                      ? "Expired"
                      : isExpiringSoon(dog.license.expirationDate)
                      ? "Expires Soon"
                      : "Active"
                    }
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Dog Details</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Age: {dog.age} years</div>
                  <div>Weight: {dog.weight} lbs</div>
                  <div>Spayed/Neutered: {dog.spayedNeutered ? "Yes" : "No"}</div>
                  {dog.microchipNumber && (
                    <div>Microchip: {dog.microchipNumber}</div>
                  )}
                </div>
              </div>

              {dog.license && (
                <>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">License Info</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Issue Date: {formatDate(dog.license.issueDate)}</div>
                      <div>Expires: {formatDate(dog.license.expirationDate)}</div>
                      <div>Fee: ${dog.license.fee}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Vaccination</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Rabies Date: {formatDate(dog.license.rabiesVaccinationDate)}</div>
                      <div>Expires: {formatDate(dog.license.rabiesVaccinationExpiration)}</div>
                      <div>Vet: {dog.license.veterinarianName}</div>
                      <div>Phone: {dog.license.veterinarianPhone}</div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {dog.license && (isExpired(dog.license.expirationDate) || isExpiringSoon(dog.license.expirationDate)) && (
              <div className="border-t pt-4">
                {renewingLicense === dog.license._id ? (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Renew License</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Rabies Vaccination Date *
                        </label>
                        <input
                          type="date"
                          value={renewalData.rabiesVaccinationDate}
                          onChange={(e) => setRenewalData(prev => ({
                            ...prev,
                            rabiesVaccinationDate: e.target.value
                          }))}
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
                          value={renewalData.rabiesVaccinationExpiration}
                          onChange={(e) => setRenewalData(prev => ({
                            ...prev,
                            rabiesVaccinationExpiration: e.target.value
                          }))}
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
                          value={renewalData.veterinarianName}
                          onChange={(e) => setRenewalData(prev => ({
                            ...prev,
                            veterinarianName: e.target.value
                          }))}
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
                          value={renewalData.veterinarianPhone}
                          onChange={(e) => setRenewalData(prev => ({
                            ...prev,
                            veterinarianPhone: e.target.value
                          }))}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRenewLicense(dog.license!._id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Complete Renewal
                      </button>
                      <button
                        onClick={() => setRenewingLicense(null)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setRenewingLicense(dog.license!._id)}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                  >
                    Renew License
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
