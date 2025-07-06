import { createDocument } from './firebase';

// Create admin and stall owner accounts in Firestore
export const createInitialAccounts = async () => {
  try {
    // Create admin account
    await createDocument('users', 'admin-account-001', {
      email: 'admin@foodhub.com',
      fullName: 'System Administrator',
      role: 'admin',
      loyaltyPoints: 0,
      studentId: null,
    });

    // Create stall owner account
    await createDocument('users', 'stall-owner-001', {
      email: 'canteen@foodhub.com',
      fullName: 'Food Stall Owner',
      role: 'stall_owner',
      loyaltyPoints: 0,
      studentId: null,
    });

    // Create a sample stall for the stall owner
    await createDocument('stalls', 'stall-owner-001', {
      name: 'Sulit Chicken - Batangas',
      description: 'Authentic Korean-style fried chicken with Filipino twist',
      category: 'Filipino',
      image: null,
      rating: 5.0,
      reviewCount: 2000,
      deliveryTime: '15-40 min',
      priceRange: '₱109-299',
      isActive: true,
      deliveryFee: '₱59.00',
      ownerId: 'stall-owner-001',
    });

    console.log('Initial accounts created successfully');
  } catch (error) {
    console.error('Error creating initial accounts:', error);
  }
};