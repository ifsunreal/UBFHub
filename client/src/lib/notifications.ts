import { addDocument, updateDocument } from "./firebase";

export interface NotificationData {
  userId: string;
  type: "order" | "system" | "promotion" | "review";
  title: string;
  message: string;
  orderId?: string;
  restaurantId?: string;
  metadata?: Record<string, any>;
}

// Notification service
export class NotificationService {
  private static instance: NotificationService;
  private isSupported: boolean = false;
  private permission: NotificationPermission = "default";

  constructor() {
    this.checkSupport();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private checkSupport() {
    this.isSupported = "Notification" in window && "serviceWorker" in navigator;
    if (this.isSupported) {
      this.permission = Notification.permission;
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn("Notifications not supported in this browser");
      return false;
    }

    if (this.permission === "granted") {
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }

  async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!this.isSupported || this.permission !== "granted") {
      return;
    }

    try {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, {
          badge: "/logo.png",
          icon: "/logo.png",
          vibrate: [200, 100, 200],
          tag: "ub-foodhub",
          renotify: true,
          ...options,
        });
      } else {
        new Notification(title, {
          icon: "/logo.png",
          ...options,
        });
      }
    } catch (error) {
      console.error("Error showing notification:", error);
    }
  }

  isPermissionGranted(): boolean {
    return this.permission === "granted";
  }

  isNotificationSupported(): boolean {
    return this.isSupported;
  }

  getPermissionStatus(): NotificationPermission {
    return this.permission;
  }
}

// Create and send notification to database
export async function createNotification(notificationData: NotificationData): Promise<string | null> {
  try {
    const notification = {
      ...notificationData,
      isRead: false,
      createdAt: new Date(),
    };

    const docId = await addDocument("notifications", notification);
    
    // Show browser notification if permission granted
    const notificationService = NotificationService.getInstance();
    if (notificationService.isPermissionGranted()) {
      await notificationService.showNotification(notification.title, {
        body: notification.message,
        data: {
          notificationId: docId,
          type: notification.type,
          orderId: notification.orderId,
          restaurantId: notification.restaurantId,
        },
      });
    }

    return docId;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    await updateDocument("notifications", notificationId, { isRead: true });
    return true;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }
}

// Notification templates for common use cases
export const NotificationTemplates = {
  orderConfirmed: (orderNumber: string, restaurantName: string): Omit<NotificationData, "userId"> => ({
    type: "order",
    title: "Order Confirmed",
    message: `Your order #${orderNumber} from ${restaurantName} has been confirmed and is being prepared.`,
  }),

  orderReady: (orderNumber: string, restaurantName: string): Omit<NotificationData, "userId"> => ({
    type: "order",
    title: "Order Ready for Pickup",
    message: `Your order #${orderNumber} from ${restaurantName} is ready! Please show your QR code for pickup.`,
  }),

  orderCompleted: (orderNumber: string, restaurantName: string): Omit<NotificationData, "userId"> => ({
    type: "order",
    title: "Order Completed",
    message: `Thank you! Your order #${orderNumber} from ${restaurantName} has been completed. Enjoy your meal!`,
  }),

  orderCancelled: (orderNumber: string, restaurantName: string): Omit<NotificationData, "userId"> => ({
    type: "order",
    title: "Order Cancelled",
    message: `Your order #${orderNumber} from ${restaurantName} has been cancelled. If you have any questions, please contact support.`,
  }),

  welcomeMessage: (): Omit<NotificationData, "userId"> => ({
    type: "system",
    title: "Welcome to UB FoodHub!",
    message: "Start exploring delicious food options from our campus stalls. Order now and pickup with your QR code!",
  }),

  newStallAvailable: (stallName: string): Omit<NotificationData, "userId"> => ({
    type: "promotion",
    title: "New Stall Available!",
    message: `Check out ${stallName}, now available on UB FoodHub. Discover new flavors today!`,
  }),

  specialPromotion: (promoDetails: string): Omit<NotificationData, "userId"> => ({
    type: "promotion",
    title: "Special Promotion!",
    message: promoDetails,
  }),

  reviewReminder: (restaurantName: string, orderId: string): Omit<NotificationData, "userId"> => ({
    type: "review",
    title: "How was your meal?",
    message: `Please rate your experience with ${restaurantName}. Your feedback helps improve our service!`,
    orderId,
  }),
};

// Send notification to specific user
export async function sendNotificationToUser(
  userId: string,
  template: Omit<NotificationData, "userId">,
  additionalData?: Partial<NotificationData>
): Promise<string | null> {
  const notificationData: NotificationData = {
    userId,
    ...template,
    ...additionalData,
  };

  return await createNotification(notificationData);
}

// Send notification to multiple users
export async function sendNotificationToUsers(
  userIds: string[],
  template: Omit<NotificationData, "userId">,
  additionalData?: Partial<NotificationData>
): Promise<(string | null)[]> {
  const promises = userIds.map(userId =>
    sendNotificationToUser(userId, template, additionalData)
  );

  return await Promise.all(promises);
}