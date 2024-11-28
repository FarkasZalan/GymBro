import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { AdminService } from '../../admin.service';
import { OrderStatus } from '../../../payment/order-status';
import { Order } from '../../../payment/order.model';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmationText } from '../../../delete-confirmation-dialog/delete-text';
import { DeleteConfirmationDialogComponent } from '../../../delete-confirmation-dialog/delete-confirmation-dialog.component';

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

  constructor(
    private adminService: AdminService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  async ngOnInit() {
    this.loadOrders();
  }

  async loadOrders() {
    (await this.adminService.getAllOrders()).subscribe((orders: Order[]) => {
      this.orders = orders;
    });
  }

  async markOrderAsChecked(order: Order) {
    if (!order.isAdminChecked) {
      await this.adminService.markOrderAsChecked(order.id);
    }
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
  }

  async cancelOrder(order: Order) {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      data: {
        text: DeleteConfirmationText.ORDER_CANCEL
      }
    });

    const result = await dialogRef.afterClosed().toPromise();
    if (result) {
      await this.updateOrderStatus(order, OrderStatus.CANCELLED);
    }
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
