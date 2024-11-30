import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Order } from '../payment/order.model';
import { DocumentHandlerService } from '../document.handler.service';
import { ProductViewText } from '../admin-profile/product-management/product-view-texts';
import { style, transition, trigger } from '@angular/animations';
import { animate } from '@angular/animations';
import { Product } from '../admin-profile/product-management/product-models/product.model';
import { CartItem } from '../cart/cart.model';

@Component({
  selector: 'app-receipt',
  templateUrl: './receipt.component.html',
  styleUrls: ['./receipt.component.scss'],
  animations: [
    trigger('zoomIn', [
      transition(':enter', [
        style({ transform: 'scale(0.95)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'scale(1)', opacity: 1 })),
      ]),
    ]),
  ]
})
export class ReceiptComponent implements OnInit {
  order: Order;
  isFromCheckout: boolean = false;
  productViewText = ProductViewText;

  subtotal: number = 0;
  cashAmount: number = 0;
  discountAmount: number = 0;
  originalTotal: number = 0;
  freeShippingByCoupon: boolean = false;
  STANDARD_SHIPPING_COST: number = 2500;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private documentHandler: DocumentHandlerService,
    private location: Location
  ) { }

  ngOnInit(): void {
    // Check if we came from checkout
    this.isFromCheckout = this.route.snapshot.queryParams['fromCheckout'] === 'true';

    this.route.params.subscribe(params => {
      this.documentHandler.getDocumentByID("orders", params['id']).subscribe((order: Order) => {
        this.order = order;
        if (this.order.couponUsed) {
          this.originalTotal = this.order.subtotal + this.order.shippingCost + this.order.cashOnDeliveryAmount;
          if (order.shippingMethod === ProductViewText.CHECKOUT_SHIPPING_DHL_TITLE && this.order.shippingCost === 0) {
            this.freeShippingByCoupon = true;
            this.originalTotal = this.order.subtotal + this.STANDARD_SHIPPING_COST + this.order.cashOnDeliveryAmount;
          }
        }
      });
    });
  }

  navigateToProduct(product: CartItem) {
    this.router.navigate(['/product/' + product.category + '/' + product.productId], {
      queryParams: {
        selectedPrice: JSON.stringify(product.selectedPrice)
      }
    });
  }

  goBack() {
    this.location.back();
  }

  goToProducts() {
    this.router.navigate(['/']);
  }

  printReceipt(): void {
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        /* Hide non-printable elements */
        nb-layout-header,
        nb-sidebar,
        nb-layout-footer,
        .button-container {
          display: none !important;
        }
    `;

    // Add the style to the document
    document.head.appendChild(style);

    // Print
    window.print();

    // Remove the style after printing
    setTimeout(() => {
      document.head.removeChild(style);
    }, 100);
  }
}
