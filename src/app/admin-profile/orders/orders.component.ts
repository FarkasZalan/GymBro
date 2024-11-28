import { trigger, transition, style, animate } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderStatus } from '../../payment/order-status';
import { AdminService } from '../admin.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
  animations: [
    trigger('zoomIn', [
      transition(':enter', [
        style({ transform: 'scale(0.8)', opacity: 0 }),
        animate('250ms ease-out', style({ transform: 'scale(1)', opacity: 1 })),
      ]),
    ])
  ]
})
export class OrdersComponent implements OnInit {
  newOrdersCount: number = 0;
  processingOrdersCount: number = 0;
  shippedOrdersCount: number = 0;

  constructor(
    private adminService: AdminService,
    private router: Router
  ) { }

  async ngOnInit() {
    // Get orders count by status
    (await this.adminService.getAllNewOrders()).subscribe(orders => {
      this.newOrdersCount = orders.length;
    });

    (await this.adminService.getOrdersByStatus(OrderStatus.PROCESSING)).subscribe(orders => {
      this.processingOrdersCount = orders.length;
    });

    (await this.adminService.getOrdersByStatus(OrderStatus.SHIPPED)).subscribe(orders => {
      this.shippedOrdersCount = orders.length;
    });
  }

  navigateToOrderManagement() {
    this.router.navigate(['/admin-profile/orders/order-list']);
  }

}
