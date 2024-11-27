import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Order } from '../payment/order.model';
import { DocumentHandlerService } from '../document.handler.service';
import { ProductViewText } from '../admin-profile/product-management/product-view-texts';
import { style, transition, trigger } from '@angular/animations';
import { animate } from '@angular/animations';

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
        console.log(this.order);
        if (this.order.couponUsed) {
          this.originalTotal = this.order.subtotal + this.order.shippingCost + this.order.cashOnDeliveryAmount;
        }
      });
    });
  }

  navigateToProduct(product: any) {
    this.router.navigate(['/product', product.category, product.productId]);
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
