import * as admin from "firebase-admin";
import Stripe from "stripe";
import { onCall } from 'firebase-functions/v2/https';

const stripe = new Stripe("sk_test_51QQwXLHpYegMmNQB4U9JSEQaMGbpW4LRDNcQMfcjmDTb5dL4kKLTOtBloNQGwF43cZSSKsk7e41CWPlsbstBIGxn00cQf0F4bB");

admin.initializeApp();

export const stripeCheckout = onCall(
  { region: 'europe-central2' },
  async (request) => {
    const { cartItems, shippingCost } = request.data;
    try {
      const lineItems = cartItems.map((item: any) => ({
        price_data: {
          currency: "HUF",
          product_data: {
            name: item.productName,
            images: [item.selectedPrice.productImage],
          },
          unit_amount: item.selectedPrice.discountedPrice > 0
            ? item.selectedPrice.discountedPrice * 100
            : item.selectedPrice.productPrice * 100,
        },
        quantity: item.quantity
      }));

      // Include shipping cost as an additional line item, if applicable
      if (shippingCost && shippingCost > 0) {
        lineItems.push({
          price_data: {
            currency: "HUF",
            product_data: {
              name: "Shipping Cost",
            },
            unit_amount: shippingCost * 100,
          },
          quantity: 1,
        });
      }

      const paymentIntent = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: "http://localhost:4200/checkout?action=success",
        cancel_url: "http://localhost:4200/checkout?action=cancel",
      });

      return { id: paymentIntent.id };
    } catch (error: any) {
      console.error("Error during payment:", error);
      return { success: false, error: error.message };
    }
  }
);
