import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  dogs: defineTable({
    name: v.string(),
    breed: v.string(),
    color: v.string(),
    age: v.number(),
    weight: v.number(),
    sex: v.union(v.literal("male"), v.literal("female")),
    spayedNeutered: v.boolean(),
    microchipNumber: v.optional(v.string()),
    ownerId: v.id("users"),
    licenseId: v.optional(v.id("licenses")),
  })
    .index("by_owner", ["ownerId"])
    .index("by_license", ["licenseId"]),

  licenses: defineTable({
    licenseNumber: v.string(),
    dogId: v.id("dogs"),
    ownerId: v.id("users"),
    issueDate: v.number(),
    expirationDate: v.number(),
    fee: v.number(),
    status: v.union(v.literal("active"), v.literal("expired"), v.literal("pending")),
    rabiesVaccinationDate: v.number(),
    rabiesVaccinationExpiration: v.number(),
    veterinarianName: v.string(),
    veterinarianPhone: v.string(),
  })
    .index("by_dog", ["dogId"])
    .index("by_owner", ["ownerId"])
    .index("by_license_number", ["licenseNumber"])
    .index("by_status", ["status"]),

  owners: defineTable({
    userId: v.id("users"),
    firstName: v.string(),
    lastName: v.string(),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    zipCode: v.string(),
    phone: v.string(),
    emergencyContact: v.optional(v.string()),
    emergencyPhone: v.optional(v.string()),
  }).index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
