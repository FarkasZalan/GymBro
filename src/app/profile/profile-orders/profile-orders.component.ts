import { Component, OnInit } from '@angular/core';
import { Order } from '../../payment/order.model';
import { UserService } from '../user.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { User } from '../user.model';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { OrderStatus } from '../../payment/order-status';

@Component({
  selector: 'app-profile-orders',
  templateUrl: './profile-orders.component.html',
  styleUrls: ['./profile-orders.component.scss'],
  animations: [
    trigger('zoomIn', [
      transition(':enter', [
        style({ transform: 'scale(0.8)', opacity: 0 }),
        animate('250ms ease-out', style({ transform: 'scale(1)', opacity: 1 })),
      ]),
    ])
  ]
})
export class ProfileOrdersComponent implements OnInit {
  orders: Order[] = [];
  orderStatus = OrderStatus;

  currentUser: User | undefined;
  currentUserId: string | undefined;

  initialOrderCount: number = 2; // Number of orders to show initially
  showAllOrders: boolean = false; // Toggle for showing all orders

  constructor(
    private userService: UserService,
    private auth: AngularFireAuth,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    // check if user logged in
    this.auth.authState.subscribe((userAuth) => {
      if (userAuth) {
        this.authService.getCurrentUser(userAuth.uid).subscribe((currentUser: User) => {
          this.currentUser = currentUser;
          this.currentUserId = currentUser.id;
          if (this.currentUser === undefined) {
            this.authService.logOut();
          } else {
            this.loadOrders();
          }
        });
      } else {
        this.authService.logOut();
      }
    });
  }

  async loadOrders() {
    const ordersObservable = await this.userService.getAllOrders(this.currentUserId);
    ordersObservable.subscribe((orders: Order[]) => {
      this.orders = orders;
    });
  }

  async markOrderAsChecked(order: Order) {
    if (!order.isUserChecked) {
      await this.userService.markOrderAsChecked(order.id);
    }
  }

  viewReceipt(orderId: string) {
    this.router.navigate(['/receipt', orderId], { queryParams: { fromCheckout: 'false' } });
  }

  // Getter to control which orders are visible
  get visibleOrders(): Order[] {
    return this.showAllOrders
      ? this.orders
      : this.orders.slice(0, this.initialOrderCount);
  }

  // Ttoggle orders display
  toggleOrdersDisplay() {
    this.showAllOrders = !this.showAllOrders;
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
    if (this.showAllOrders) {
      return false;
    }

    // Check orders that are not visible (after initialOrderCount)
    const hiddenOrders = this.orders.slice(this.initialOrderCount);
    return hiddenOrders.some(order => !order.isUserChecked);
  }

  getUncheckedHiddenOrdersCount(): number {
    if (this.showAllOrders) {
      return 0;
    }

    // Count unchecked orders that are not visible (after initialOrderCount)
    const hiddenOrders = this.orders.slice(this.initialOrderCount);
    return hiddenOrders.filter(order => !order.isUserChecked).length;
  }
}
