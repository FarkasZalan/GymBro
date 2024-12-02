import * as admin from "firebase-admin";
import Stripe from "stripe";
import { onCall } from 'firebase-functions/v2/https';
import { environment } from "./envinronment";
import { publicEnvironment } from "./envinronment-public";

const stripe = new Stripe(environment.stripe.secretKey);

admin.initializeApp();

export const stripeCheckout = onCall(
  { region: 'europe-central2' },
  async (request) => {
    const { cartItems, shippingCost, activeReward } = request.data;

    try {

      // Determine discount type and amount
      let discountCoupon = null;
      let adjustedShippingCost =
        activeReward && activeReward.id === "freeShipping" ? 0 : shippingCost;

      if (activeReward) {
        if (activeReward.id === "discount10") {
          // 10% Discount
          const coupon = await stripe.coupons.create({
            percent_off: 10,
            duration: "once",
          });
          discountCoupon = coupon.id;
        } else if (activeReward.id === "discount20") {
          // 20% Discount
          const coupon = await stripe.coupons.create({
            percent_off: 20,
            duration: "once",
          });
          discountCoupon = coupon.id;
        } else if (activeReward.id === "discount30") {
          // 30% Discount
          const coupon = await stripe.coupons.create({
            percent_off: 30,
            duration: "once",
          });
          discountCoupon = coupon.id;
        } else if (activeReward.id === "5000HufDiscount") {
          // Fixed 5000 HUF Discount
          const coupon = await stripe.coupons.create({
            amount_off: 5000 * 100, // Fixed discount in smallest currency unit (cents)
            currency: "HUF",
            duration: "once",
          });
          discountCoupon = coupon.id;
        }
      }

      const paymentIntent = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: cartItems.map((item: any) => ({
          price_data: {
            currency: "HUF",
            product_data: {
              name: item.productName,
              images: [item.selectedPrice.productImage],
            },
            unit_amount:
              item.selectedPrice.discountedPrice > 0
                ? item.selectedPrice.discountedPrice * 100
                : item.selectedPrice.productPrice * 100,
          },
          quantity: item.quantity,
        })),
        mode: "payment",
        shipping_options: [
          {
            shipping_rate_data: {
              display_name: "Standard Shipping",
              fixed_amount: {
                amount: adjustedShippingCost * 100, // Adjusted shipping cost
                currency: "HUF",
              },
              type: "fixed_amount",
            },
          },
        ],
        discounts: discountCoupon ? [{ coupon: discountCoupon }] : [], // Apply the coupon
        success_url: publicEnvironment.stripe.successUrl,
        cancel_url: publicEnvironment.stripe.cancelUrl,
      });

      return { id: paymentIntent.id };
    } catch (error: any) {
      console.error("Error during payment:", error);
      return { success: false, error: error.message };
    }
  }
);

