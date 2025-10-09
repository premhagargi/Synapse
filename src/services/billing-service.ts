/**
 * @fileoverview Stripe billing and subscription management service
 */

import { logger } from '@/shared/lib/logger';
import { SubscriptionTier, SubscriptionStatus } from '@/shared/types';

export interface StripeCustomer {
  id: string;
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}

export interface StripeSubscription {
  id: string;
  customerId: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  items: {
    priceId: string;
    quantity: number;
  }[];
}

export interface StripePrice {
  id: string;
  productId: string;
  unitAmount: number;
  currency: string;
  recurring?: {
    interval: 'month' | 'year';
    intervalCount: number;
  };
}

export interface StripeProduct {
  id: string;
  name: string;
  description?: string;
  metadata?: Record<string, string>;
}

export class BillingService {
  private static instance: BillingService;
  private stripeSecretKey: string;
  private webhookSecret: string;

  constructor() {
    this.stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    if (!this.stripeSecretKey) {
      throw new Error('Stripe secret key is required');
    }
  }

  static getInstance(): BillingService {
    if (!BillingService.instance) {
      BillingService.instance = new BillingService();
    }
    return BillingService.instance;
  }

  /**
   * Create or retrieve a Stripe customer
   */
  async createOrGetCustomer(
    email: string,
    name?: string,
    metadata?: Record<string, string>
  ): Promise<StripeCustomer> {
    try {
      // In a real implementation, you would call Stripe API
      // For now, we'll simulate the response

      const customer = {
        id: `cus_${Date.now()}`,
        email,
        name,
        metadata,
      };

      await logger.info('Stripe customer created/retrieved', {
        customerId: customer.id,
        email,
        name,
      });

      return customer;
    } catch (error) {
      await logger.error('Failed to create/retrieve Stripe customer', error as Error, {
        email,
        name,
      });
      throw error;
    }
  }

  /**
   * Create a subscription
   */
  async createSubscription(
    customerId: string,
    priceId: string,
    quantity: number = 1,
    metadata?: Record<string, string>
  ): Promise<StripeSubscription> {
    try {
      // In a real implementation, you would call Stripe API
      const now = new Date();
      const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

      const subscription = {
        id: `sub_${Date.now()}`,
        customerId,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
        items: [{
          priceId,
          quantity,
        }],
      };

      await logger.info('Stripe subscription created', {
        subscriptionId: subscription.id,
        customerId,
        priceId,
        quantity,
      });

      return subscription;
    } catch (error) {
      await logger.error('Failed to create Stripe subscription', error as Error, {
        customerId,
        priceId,
        quantity,
      });
      throw error;
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true
  ): Promise<StripeSubscription> {
    try {
      // In a real implementation, you would call Stripe API

      const subscription = {
        id: subscriptionId,
        customerId: 'cus_example',
        status: cancelAtPeriodEnd ? SubscriptionStatus.ACTIVE : SubscriptionStatus.CANCELLED,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd,
        items: [],
      };

      await logger.info('Stripe subscription cancelled', {
        subscriptionId,
        cancelAtPeriodEnd,
      });

      return subscription;
    } catch (error) {
      await logger.error('Failed to cancel Stripe subscription', error as Error, {
        subscriptionId,
        cancelAtPeriodEnd,
      });
      throw error;
    }
  }

  /**
   * Update subscription quantity
   */
  async updateSubscriptionQuantity(
    subscriptionId: string,
    newQuantity: number
  ): Promise<StripeSubscription> {
    try {
      // In a real implementation, you would call Stripe API

      const subscription = {
        id: subscriptionId,
        customerId: 'cus_example',
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd: false,
        items: [{
          priceId: 'price_example',
          quantity: newQuantity,
        }],
      };

      await logger.info('Stripe subscription quantity updated', {
        subscriptionId,
        newQuantity,
      });

      return subscription;
    } catch (error) {
      await logger.error('Failed to update subscription quantity', error as Error, {
        subscriptionId,
        newQuantity,
      });
      throw error;
    }
  }

  /**
   * Get subscription details
   */
  async getSubscription(subscriptionId: string): Promise<StripeSubscription | null> {
    try {
      // In a real implementation, you would call Stripe API

      const subscription = {
        id: subscriptionId,
        customerId: 'cus_example',
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd: false,
        items: [{
          priceId: 'price_example',
          quantity: 1,
        }],
      };

      return subscription;
    } catch (error) {
      await logger.error('Failed to get Stripe subscription', error as Error, {
        subscriptionId,
      });
      return null;
    }
  }

  /**
   * Get customer subscriptions
   */
  async getCustomerSubscriptions(customerId: string): Promise<StripeSubscription[]> {
    try {
      // In a real implementation, you would call Stripe API

      const subscriptions = [
        {
          id: 'sub_example',
          customerId,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(),
          cancelAtPeriodEnd: false,
          items: [{
            priceId: 'price_example',
            quantity: 1,
          }],
        },
      ];

      return subscriptions;
    } catch (error) {
      await logger.error('Failed to get customer subscriptions', error as Error, {
        customerId,
      });
      return [];
    }
  }

  /**
   * Create a payment intent for one-time payments
   */
  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    customerId?: string,
    metadata?: Record<string, string>
  ): Promise<{ clientSecret: string; paymentIntentId: string }> {
    try {
      // In a real implementation, you would call Stripe API

      const paymentIntent = {
        clientSecret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
        paymentIntentId: `pi_${Date.now()}`,
      };

      await logger.info('Stripe payment intent created', {
        paymentIntentId: paymentIntent.paymentIntentId,
        amount,
        currency,
        customerId,
      });

      return paymentIntent;
    } catch (error) {
      await logger.error('Failed to create payment intent', error as Error, {
        amount,
        currency,
        customerId,
      });
      throw error;
    }
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhookEvent(
    signature: string,
    body: string
  ): Promise<{ received: boolean; eventType?: string }> {
    try {
      // In a real implementation, you would verify the webhook signature
      // and process the event

      await logger.info('Stripe webhook event received', {
        signature,
        bodyLength: body.length,
      });

      return {
        received: true,
        eventType: 'unknown', // Would be extracted from the event
      };
    } catch (error) {
      await logger.error('Failed to handle webhook event', error as Error, {
        signature,
      });
      throw error;
    }
  }

  /**
   * Get pricing information
   */
  getPricingInfo(): Record<SubscriptionTier, { price: number; interval: string }> {
    return {
      [SubscriptionTier.FREE]: {
        price: 0,
        interval: 'forever',
      },
      [SubscriptionTier.PRO]: {
        price: 49,
        interval: 'month',
      },
      [SubscriptionTier.ENTERPRISE]: {
        price: 199,
        interval: 'month',
      },
    };
  }

  /**
   * Calculate subscription cost
   */
  calculateSubscriptionCost(
    tier: SubscriptionTier,
    quantity: number = 1,
    discountCode?: string
  ): { amount: number; currency: string; discount?: number } {
    const basePrice = this.getPricingInfo()[tier].price;
    let amount = basePrice * quantity;

    // Apply discount if provided
    let discount = 0;
    if (discountCode) {
      // In a real implementation, you would validate the discount code
      discount = amount * 0.1; // 10% discount for example
      amount -= discount;
    }

    return {
      amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
      currency: 'usd',
      discount: discount > 0 ? Math.round(discount * 100) / 100 : undefined,
    };
  }

  /**
   * Check if subscription is active
   */
  isSubscriptionActive(subscription: StripeSubscription): boolean {
    return subscription.status === SubscriptionStatus.ACTIVE &&
           !subscription.cancelAtPeriodEnd;
  }

  /**
   * Get subscription tier from Stripe price ID
   */
  getTierFromPriceId(priceId: string): SubscriptionTier | null {
    // In a real implementation, you would map price IDs to tiers
    const priceTierMap: Record<string, SubscriptionTier> = {
      'price_pro_monthly': SubscriptionTier.PRO,
      'price_enterprise_monthly': SubscriptionTier.ENTERPRISE,
    };

    return priceTierMap[priceId] || null;
  }

  /**
   * Generate invoice for subscription
   */
  async generateInvoice(
    subscriptionId: string,
    customerId: string
  ): Promise<{ invoiceId: string; downloadUrl: string }> {
    try {
      // In a real implementation, you would call Stripe API

      const invoice = {
        invoiceId: `in_${Date.now()}`,
        downloadUrl: `https://example.com/invoices/${subscriptionId}`,
      };

      await logger.info('Invoice generated', {
        invoiceId: invoice.invoiceId,
        subscriptionId,
        customerId,
      });

      return invoice;
    } catch (error) {
      await logger.error('Failed to generate invoice', error as Error, {
        subscriptionId,
        customerId,
      });
      throw error;
    }
  }
}

// Export singleton instance
export const billingService = BillingService.getInstance();

// Convenience functions
export async function createStripeCustomer(
  email: string,
  name?: string,
  metadata?: Record<string, string>
): Promise<StripeCustomer> {
  return billingService.createOrGetCustomer(email, name, metadata);
}

export async function createSubscription(
  customerId: string,
  priceId: string,
  quantity?: number
): Promise<StripeSubscription> {
  return billingService.createSubscription(customerId, priceId, quantity);
}

export async function cancelSubscription(
  subscriptionId: string,
  cancelAtPeriodEnd?: boolean
): Promise<StripeSubscription> {
  return billingService.cancelSubscription(subscriptionId, cancelAtPeriodEnd);
}

export function getSubscriptionPricing(tier: SubscriptionTier) {
  return billingService.getPricingInfo()[tier];
}

export function calculateSubscriptionCost(
  tier: SubscriptionTier,
  quantity?: number,
  discountCode?: string
) {
  return billingService.calculateSubscriptionCost(tier, quantity, discountCode);
}