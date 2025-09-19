import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const registerDog = mutation({
  args: {
    // Dog information
    name: v.string(),
    breed: v.string(),
    color: v.string(),
    age: v.number(),
    weight: v.number(),
    sex: v.union(v.literal("male"), v.literal("female")),
    spayedNeutered: v.boolean(),
    microchipNumber: v.optional(v.string()),
    // Owner information
    firstName: v.string(),
    lastName: v.string(),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    zipCode: v.string(),
    phone: v.string(),
    emergencyContact: v.optional(v.string()),
    emergencyPhone: v.optional(v.string()),
    // Vaccination information
    rabiesVaccinationDate: v.number(),
    rabiesVaccinationExpiration: v.number(),
    veterinarianName: v.string(),
    veterinarianPhone: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to register a dog");
    }

    // Create or update owner profile
    const existingOwner = await ctx.db
      .query("owners")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    let ownerId;
    if (existingOwner) {
      await ctx.db.patch(existingOwner._id, {
        firstName: args.firstName,
        lastName: args.lastName,
        address: args.address,
        city: args.city,
        state: args.state,
        zipCode: args.zipCode,
        phone: args.phone,
        emergencyContact: args.emergencyContact,
        emergencyPhone: args.emergencyPhone,
      });
      ownerId = existingOwner._id;
    } else {
      ownerId = await ctx.db.insert("owners", {
        userId,
        firstName: args.firstName,
        lastName: args.lastName,
        address: args.address,
        city: args.city,
        state: args.state,
        zipCode: args.zipCode,
        phone: args.phone,
        emergencyContact: args.emergencyContact,
        emergencyPhone: args.emergencyPhone,
      });
    }

    // Create dog record
    const dogId = await ctx.db.insert("dogs", {
      name: args.name,
      breed: args.breed,
      color: args.color,
      age: args.age,
      weight: args.weight,
      sex: args.sex,
      spayedNeutered: args.spayedNeutered,
      microchipNumber: args.microchipNumber,
      ownerId: userId,
    });

    // Generate license number
    const licenseNumber = `FC-${Date.now()}-${dogId.slice(-6)}`;
    
    // Calculate fee (example: $15 for spayed/neutered, $25 for intact)
    const fee = args.spayedNeutered ? 15 : 25;
    
    // Create license (expires 1 year from issue date)
    const issueDate = Date.now();
    const expirationDate = issueDate + (365 * 24 * 60 * 60 * 1000); // 1 year

    const licenseId = await ctx.db.insert("licenses", {
      licenseNumber,
      dogId,
      ownerId: userId,
      issueDate,
      expirationDate,
      fee,
      status: "active",
      rabiesVaccinationDate: args.rabiesVaccinationDate,
      rabiesVaccinationExpiration: args.rabiesVaccinationExpiration,
      veterinarianName: args.veterinarianName,
      veterinarianPhone: args.veterinarianPhone,
    });

    // Update dog with license ID
    await ctx.db.patch(dogId, { licenseId });

    return { dogId, licenseId, licenseNumber };
  },
});

export const getMyDogs = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const dogs = await ctx.db
      .query("dogs")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .collect();

    const dogsWithLicenses = await Promise.all(
      dogs.map(async (dog) => {
        const license = dog.licenseId 
          ? await ctx.db.get(dog.licenseId)
          : null;
        return { ...dog, license };
      })
    );

    return dogsWithLicenses;
  },
});

export const getOwnerProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const owner = await ctx.db
      .query("owners")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    return owner;
  },
});

export const renewLicense = mutation({
  args: {
    licenseId: v.id("licenses"),
    rabiesVaccinationDate: v.number(),
    rabiesVaccinationExpiration: v.number(),
    veterinarianName: v.string(),
    veterinarianPhone: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to renew license");
    }

    const license = await ctx.db.get(args.licenseId);
    if (!license || license.ownerId !== userId) {
      throw new Error("License not found or not owned by user");
    }

    const dog = await ctx.db.get(license.dogId);
    if (!dog) {
      throw new Error("Dog not found");
    }

    // Calculate new expiration date (1 year from renewal)
    const issueDate = Date.now();
    const expirationDate = issueDate + (365 * 24 * 60 * 60 * 1000);
    
    // Calculate fee
    const fee = dog.spayedNeutered ? 15 : 25;

    await ctx.db.patch(args.licenseId, {
      issueDate,
      expirationDate,
      fee,
      status: "active",
      rabiesVaccinationDate: args.rabiesVaccinationDate,
      rabiesVaccinationExpiration: args.rabiesVaccinationExpiration,
      veterinarianName: args.veterinarianName,
      veterinarianPhone: args.veterinarianPhone,
    });

    return { success: true };
  },
});
