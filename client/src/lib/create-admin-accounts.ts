import { createDocument, getDocument } from "./firebase";

export async function createInitialAccounts() {
  try {
    // Check if admin account already exists
    const adminDoc = await getDocument("users", "admin");
    if (!adminDoc.exists()) {
      // Create default admin account
      await createDocument("users", "admin", {
        email: "admin@ub.edu.ph",
        fullName: "System Administrator",
        role: "admin",
        createdAt: new Date().toISOString(),
      });
      console.log("Admin account created");
    }

    // Check if sample stall owner exists
    const stallOwnerDoc = await getDocument("users", "stall_owner_1");
    if (!stallOwnerDoc.exists()) {
      // Create sample stall owner account
      await createDocument("users", "stall_owner_1", {
        email: "stall@ub.edu.ph",
        fullName: "Canteen Owner",
        role: "stall_owner",
        createdAt: new Date().toISOString(),
      });
      console.log("Stall owner account created");
    }
  } catch (error) {
    console.error("Error creating initial accounts:", error);
  }
}