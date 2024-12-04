import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { AdminService } from '../../admin.service';
import { OrderStatus } from '../../../payment/order-status';
import { Order } from '../../../payment/order.model';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmationText } from '../../../delete-confirmation-dialog/delete-text';
import { DeleteConfirmationDialogComponent } from '../../../delete-confirmation-dialog/delete-confirmation-dialog.component';
import { LoadingService } from '../../../loading-spinner/loading.service';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { TranslateService } from '@ngx-translate/core';
import { ProductViewText } from '../../product-management/product-view-texts';
import { DefaultImageUrl } from '../../default-image-url';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['../../../../styles/order-list.scss'],
  animations: [
    trigger('zoomIn', [
      transition(':enter', [
        style({ transform: 'scale(0.8)', opacity: 0 }),
        animate('250ms ease-out', style({ transform: 'scale(1)', opacity: 1 })),
      ]),
    ])
  ]
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  orderStatus = OrderStatus;
  initialOrderCount: number = 5;
  showAllOrders: boolean = false;

  // Get translations using translate.instant
  statusChangedText = this.translate.instant('receipt.orderStatusChanged');
  orderDeletedText = this.translate.instant('receipt.orderDeleted');
  orderIdText = this.translate.instant('receipt.orderId');
  dateText = this.translate.instant('receipt.date');
  customerDetailsText = this.translate.instant('receipt.customerDetails');
  nameText = this.translate.instant('receipt.name');
  quantity = this.translate.instant('products.quantity');
  emailText = this.translate.instant('receipt.email');
  phoneText = this.translate.instant('receipt.phone');
  shippingAddressText = this.translate.instant('receipt.shippingAddress');
  orderItemsText = this.translate.instant('receipt.orderItems');
  paymentSummaryText = this.translate.instant('receipt.paymentSummary');
  subtotalText = this.translate.instant('receipt.subtotal');
  shippingText = this.translate.instant('receipt.shipping');
  discountText = this.translate.instant('checkout.discount');
  cashOnDeliveryText = this.translate.instant('checkout.orderSummary.paymentFee');
  totalText = this.translate.instant('receipt.total');
  priceUnit = this.translate.instant('products.huf');
  orderStatusTitle = this.translate.instant('orders.orderStatus');
  companyNameText = this.translate.instant('profileMenu.shippingAddressForm.companyName');
  taxNumber = this.translate.instant('profileMenu.shippingAddressForm.taxNumber');
  billingAddressText = this.translate.instant('profileMenu.shippingAddressForm.billingAddress');
  orderStatusText = "";

  constructor(
    private adminService: AdminService,
    private router: Router,
    private dialog: MatDialog,
    public loadingService: LoadingService,
    private functions: AngularFireFunctions,
    private translate: TranslateService
  ) { }

  async ngOnInit() {
    this.loadOrders();
  }

  async loadOrders() {
    await this.loadingService.withLoading(async () => {
      (await this.adminService.getAllOrders()).subscribe((orders: Order[]) => {
        this.orders = orders;
      });
    });
  }

  async markOrderAsChecked(order: Order) {
    await this.loadingService.withLoading(async () => {
      if (!order.isAdminChecked) {
        await this.adminService.markOrderAsChecked(order.id);
      }
    });
  }

  viewReceipt(orderId: string) {
    this.router.navigate(['/receipt', orderId], { queryParams: { fromCheckout: 'false' } });
  }

  get visibleOrders(): Order[] {
    return this.showAllOrders ? this.orders : this.orders.slice(0, this.initialOrderCount);
  }

  toggleOrdersDisplay() {
    this.showAllOrders = !this.showAllOrders;
  }

  async updateOrderStatus(order: Order, newStatus: OrderStatus) {
    await this.adminService.updateOrderStatus(order.id, newStatus);

    if (newStatus !== order.orderStatus) {
      this.orderStatusText = this.translate.instant(newStatus);
      // send the confirmation email to order status changed
      return await this.sendEmail({
        userEmail: order.email,
        subject: this.statusChangedText,
        template: this.emailTemplate(order, true)
      });
    }
  }

  async cancelOrder(order: Order) {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      data: {
        text: DeleteConfirmationText.ORDER_CANCEL
      }
    });

    const result = await dialogRef.afterClosed().toPromise();
    if (result) {
      await this.loadingService.withLoading(async () => {
        await this.adminService.updateOrderStatus(order.id, OrderStatus.CANCELLED);

        this.orderStatusText = this.translate.instant(OrderStatus.CANCELLED);
        // send the confirmation email to order status changed
        return await this.sendEmail({
          userEmail: order.email,
          subject: this.orderDeletedText,
          template: this.emailTemplate(order, false)
        });
      });
    }
  }

  // Function to call the sendEmail cloud function
  async sendEmail(
    emailData: {
      userEmail: string;
      subject: string;
      template: string;
    }
  ) {
    const sendEmailFunction = this.functions.httpsCallable('sendEmail');
    await sendEmailFunction(emailData).toPromise();
  }

  // html template of the email
  emailTemplate(order: Order, modifiedStatus: boolean) {
    return `
        <table style="width: 100%; max-width: 800px; margin: auto; border-collapse: collapse; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 10px;">
        <tr>
            <td style="padding: 20px; text-align: center;">
                <h2 style="color: #0b8e92;">${modifiedStatus ? this.statusChangedText : this.orderDeletedText}</h2>
                <h3 style="color: #000000;">${this.orderIdText}: #${order.id}</h3>
                <p style="color: #000000;"><strong>${this.dateText}:</strong> ${order.orderDate.toDate().toLocaleDateString()}</p>
                ${modifiedStatus ? `<p style="color: #0b8e92; font-size: 1.3em;"><strong>${this.orderStatusTitle}</strong> ${this.orderStatusText}</p>` : ""}
            </td>
        </tr>
        <tr>
            <td style="padding: 10px;">
                <h3 style="color: #0b8e92;">${this.customerDetailsText}</h3>
                <p style="color: #000000;"><strong>${this.nameText}:</strong> ${order.firstName} ${order.lastName}</p>
                <p style="color: #000000;"><strong>${this.emailText}:</strong> ${order.email}</p>
                <p style="color: #000000;"><strong>${this.phoneText}:</strong> ${order.phone}</p>
            </td>
        </tr>
              ${order.shippingAddress.companyName !== '' ? `
        <tr>
          <td style="padding: 10px;">
            <h3 style="color: #0b8e92;">${this.billingAddressText}</h3>
               ${order.shippingAddress.isBillingDifferentFromShipping ? `
              <p style="color: #000000;">${order.shippingAddress.billingAddress.street} ${order.shippingAddress.billingAddress.streetType}, ${order.shippingAddress.billingAddress.houseNumber}</p>
              <p style="color: #000000;">${order.shippingAddress.billingAddress.city}, ${order.shippingAddress.billingAddress.postalCode}</p>
              <p style="color: #000000;">${order.shippingAddress.billingAddress.country}</p>
              <p style="color: #000000;"><strong>${this.companyNameText}:</strong> ${order.shippingAddress.companyName}</p>
              <p style="color: #000000;"><strong>${this.taxNumber}:</strong> ${order.shippingAddress.taxNumber}</p>
          ` : `
              <p style="color: #000000;">${order.shippingAddress.street} ${order.shippingAddress.streetType}, ${order.shippingAddress.houseNumber}</p>
              <p style="color: #000000;">${order.shippingAddress.city}, ${order.shippingAddress.postalCode}</p>
              <p style="color: #000000;">${order.shippingAddress.country}</p>
              <p style="color: #000000;"><strong>${this.companyNameText}:</strong> ${order.shippingAddress.companyName}</p>
              <p style="color: #000000;"><strong>${this.taxNumber}:</strong> ${order.shippingAddress.taxNumber}</p>
            `}
           </td>
        </tr>
      ` : ''}

      ${order.shippingAddress.companyName === '' && order.shippingMethod === ProductViewText.CHECKOUT_SHIPPING_STORE_PICKUP_TITLE ? `
      <tr>
          <td style="padding: 10px;">
            <h3 style="color: #0b8e92;">${this.billingAddressText}</h3>
              <p style="color: #000000;">${order.shippingAddress.street} ${order.shippingAddress.streetType}, ${order.shippingAddress.houseNumber}</p>
              <p style="color: #000000;">${order.shippingAddress.city}, ${order.shippingAddress.postalCode}</p>
              <p style="color: #000000;">${order.shippingAddress.country}</p>
           </td>
        </tr>
      ` : ''}

      ${(order.shippingMethod !== ProductViewText.CHECKOUT_SHIPPING_STORE_PICKUP_TITLE) ? `
      <tr>
          <td style="padding: 10px;">
            <h3 style="color: #0b8e92;">${this.shippingAddressText}</h3>
              <p style="color: #000000;">${order.shippingAddress.street} ${order.shippingAddress.streetType}, ${order.shippingAddress.houseNumber}</p>
              <p style="color: #000000;">${order.shippingAddress.city}, ${order.shippingAddress.postalCode}</p>
              <p style="color: #000000;">${order.shippingAddress.country}</p>
           </td>
        </tr>
      ` : ``}
        <tr>
            <td style="padding: 20px;">
                <h3 style="color: #0b8e92;">${this.orderItemsText}</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tbody>
                        ${order.productList.map(item => `
                            <tr style="border-bottom: 1px solid #ddd;">
                                <td style="padding: 10px; width: 80px;">
                                    <img src="${item.selectedPrice.productImage}" 
                                         alt="${item.productName}" 
                                         style="width: 80px; height: 80px; object-fit: cover; border-radius: 10px;">
                                </td>
                                <td style="padding: 10px; color: #000000;">
                                    <strong>${item.productName}</strong>
                                    <br><span>${this.quantity}: ${item.quantity}</span>
                                </td>
                                <td style="padding: 10px; text-align: right; color: #000000;">
                                    ${item.selectedPrice.discountedPrice > 0 ? item.selectedPrice.discountedPrice : item.selectedPrice.productPrice} ${this.priceUnit}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </td>
        </tr>
        <tr>
            <td style="padding: 20px;">
                <h3 style="color: #0b8e92;">${this.paymentSummaryText}</h3>
                <p  style="color: #000000;"><strong>${this.subtotalText}:</strong> ${order.subtotal} ${this.priceUnit}</p>
                 ${order.shippingCost > 0 ? `<p  style="color: #000000;"><strong>${this.shippingText}:</strong> ${order.shippingCost} ${this.priceUnit}</p>` : ''}
                 ${order.cashOnDeliveryAmount > 0 ? `<p  style="color: #000000;"><strong>${this.cashOnDeliveryText}:</strong> ${order.cashOnDeliveryAmount} ${this.priceUnit}</p>` : ''}
                 ${order.discountAmount > 0 ? `<p style="color: #000000;"><strong>${this.discountText}:</strong> -${Math.floor(order.discountAmount)} ${this.priceUnit}</p>` : ''}
                <p style="color: #000000;"><strong>${this.totalText}:</strong> ${order.totalPrice} ${this.priceUnit}</p>
            </td>
        </tr>
                <tr style="align-items: center; display: grid; justify-content: center; text-align: center;">
            <td>
                <img src="${DefaultImageUrl.logo}"
                style="width: 150px; height: 150px; object-fit: cover; border-radius: 10px;">
            </td>
        </tr>
    </table>
  `
  }

  getProgressClass(order: Order): string {
    switch (order.orderStatus) {
      case OrderStatus.PROCESSING:
        return 'progress-processing';
      case OrderStatus.PACKED:
        return 'progress-packed';
      case OrderStatus.SHIPPED:
        return 'progress-shipped';
      case OrderStatus.DELIVERED:
        return 'progress-delivered';
      case OrderStatus.CANCELLED:
        return 'progress-cancelled';
      default:
        return '';
    }
  }

  isStatusActive(order: Order, status: string): boolean {
    const statusOrder = [
      OrderStatus.PROCESSING,
      OrderStatus.PACKED,
      OrderStatus.SHIPPED,
      OrderStatus.DELIVERED
    ];

    const orderStatusIndex = statusOrder.indexOf(order.orderStatus as OrderStatus);
    const currentStatusIndex = statusOrder.indexOf(status as OrderStatus);

    return currentStatusIndex <= orderStatusIndex && order.orderStatus !== OrderStatus.CANCELLED;
  }

  hasUncheckedHiddenOrders(): boolean {
    if (this.showAllOrders) return false;
    const hiddenOrders = this.orders.slice(this.initialOrderCount);
    return hiddenOrders.some(order => !order.isAdminChecked);
  }

  getUncheckedHiddenOrdersCount(): number {
    if (this.showAllOrders) return 0;
    const hiddenOrders = this.orders.slice(this.initialOrderCount);
    return hiddenOrders.filter(order => !order.isAdminChecked).length;
  }
}
