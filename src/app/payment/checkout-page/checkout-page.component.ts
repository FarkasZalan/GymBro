import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { CartService } from '../../cart/cart.service';
import { ShippingAddress } from '../../profile/profile-shipping-address/shipping-address.model';
import { User } from '../../profile/user.model';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { Location } from '@angular/common';
import { CartItem } from '../../cart/cart.model';
import { MatDialog } from '@angular/material/dialog';
import { ShippingAddressSelectionDialogComponent } from '../shipping-address-selection-dialog/shipping-address-selection-dialog.component';
import { ProductViewText } from '../../admin-profile/product-management/product-view-texts';
import { FormGroup, NgForm } from '@angular/forms';
import { RewardText } from '../../loyalty-program/reward-text';
import { Reward } from '../../loyalty-program/reward.model';
import { Order } from '../order.model';
import { OrderStatus } from '../order-status.modelts';
import { Timestamp } from 'firebase/firestore';
import { SuccessfullDialogComponent } from '../../successfull-dialog/successfull-dialog.component';
import { SuccessFullDialogText } from '../../successfull-dialog/sucessfull-dialog-text';

@Component({
  selector: 'app-checkout-page',
  templateUrl: './checkout-page.component.html',
  styleUrl: './checkout-page.component.scss',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('500ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ]),
    trigger('zoomIn', [
      transition(':enter', [
        style({ transform: 'scale(0.95)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'scale(1)', opacity: 1 })),
      ]),
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
    trigger('slideUp', [
      transition(':enter', [
        style({ transform: 'translateY(100%)' }),
        animate('300ms ease-out', style({ transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateY(100%)' }))
      ])
    ]),
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('collapseFields', [
      state('void', style({
        height: '0px', // Initially collapsed
        overflow: 'hidden'
      })),
      state('*', style({
        height: '*', // Expands to the full height of the content
        overflow: 'hidden'
      })),
      transition('void => *', [
        animate('250ms ease-out') // Expands smoothly
      ]),
      transition('* => void', [
        animate('250ms ease-in') // Collapses smoothly
      ])
    ])
  ],
})
export class CheckoutPageComponent implements OnInit {
  @ViewChild('form') guestForm: NgForm;  // Access the form for validation
  cartItems: any[] = [];
  subtotal: number = 0;
  shipping: number = 0; // Fix shipping cost will be 2500 Huf
  total: number = 0;

  userLoggedIn: boolean = false;
  shippingAddress: ShippingAddress;
  currentUserId: string = '';
  currentUser: User;

  // guest form
  displayGuestForm: boolean = false;
  isEditGuestForm: boolean = false;
  guestFirstName: string = '';
  guestLastName: string = '';
  guestEmail: string = '';
  guestPhone: string = '';

  selectedPaymentMethod: string = '';
  paymentMethods = [
    {
      id: 'card',
      name: ProductViewText.CHECKOUT_PAY_WITH_STRIPE,
      description: ProductViewText.CHECKOUT_PAY_WITH_STRIPE_DESCRIPTION,
      icon: 'credit-card-outline',
      additionalFee: 0
    },
    {
      id: 'cash',
      name: ProductViewText.CHECKOUT_PAY_WITH_CASH,
      description: ProductViewText.CHECKOUT_PAY_WITH_CASH_DESCRIPTION,
      icon: 'shopping-bag-outline',
      additionalFee: 1000
    }
  ];

  shippingMethods = [
    {
      id: 'store',
      name: ProductViewText.CHECKOUT_SHIPPING_STORE_PICKUP_TITLE,
      description: ProductViewText.CHECKOUT_SHIPPING_STORE_PICKUP_DESCRIPTION,
      price: 0,
      icon: 'home-outline',
      estimatedDays: '1-2'
    },
    {
      id: 'dhl',
      name: ProductViewText.CHECKOUT_SHIPPING_DHL_TITLE,
      description: ProductViewText.CHECKOUT_SHIPPING_DHL_DESCRIPTION,
      price: 2500,
      icon: 'car-outline',
      estimatedDays: '3-5'
    }
  ];

  selectedShippingMethod: string = '';

  // loyalty program
  currentLoyaltyPoints: number = 0;
  nextRewardThreshold: number = 0;
  couponUsed: boolean = false;

  showAddressForm = false;
  isSubmitting = false;

  // Rewards
  availableRewards: Reward[] = [
    {
      id: RewardText.Discount10Id,
      name: RewardText.Discount10Title,
      description: RewardText.Discount10Description,
      pointsRequired: 300,
      icon: 'percent-outline'
    },
    {
      id: RewardText.Discount20Id,
      name: RewardText.Discount20Title,
      description: RewardText.Discount20Description,
      pointsRequired: 600,
      icon: 'percent-outline'
    },
    {
      id: RewardText.Discount30Id,
      name: RewardText.Discount30Title,
      description: RewardText.Discount30Description,
      pointsRequired: 700,
      icon: 'percent-outline'
    },
    {
      id: RewardText.FreeShippingId,
      name: RewardText.FreeShippingTitle,
      description: RewardText.FreeShippingDescription,
      pointsRequired: 850,
      icon: 'car-outline'
    },
    {
      id: RewardText.FiveThousandHufDiscountId,
      name: RewardText.FiveThousandHufDiscountTitle,
      description: RewardText.FiveThousandHufDiscountDescription,
      pointsRequired: 1500,
      icon: 'gift-outline'
    }
  ];
  displayAvailableRewardsBasedOnPoints: Reward[] = [];
  activeReward: Reward | null = null;
  discountAmount: number = 0;
  STANDARD_SHIPPING_COST: number = 2500;

  // order
  order: Order;
  errorMessage: boolean = false;

  constructor(
    private cartService: CartService,
    private auth: AngularFireAuth,
    private authService: AuthService,
    private router: Router,
    private db: AngularFirestore,
    private location: Location,
    private dialog: MatDialog,
    private changeDetector: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.shippingAddress = {
      id: '',
      addressName: '',
      addressType: '',
      country: '',
      postalCode: '',
      city: '',
      street: '',
      streetType: '',
      houseNumber: '',
      isSetAsDefaultAddress: false,
      deleted: false
    }
    this.loadCartItems();
    this.checkAuthStatus();
  }

  loadCartItems() {
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      if (this.cartItems.length === 0) {
        this.router.navigate(['/']);
      }
      this.calculateTotals();
    });
  }

  checkAuthStatus() {
    // check if user logged in for reviews
    this.auth.authState.subscribe((userAuth) => {
      if (userAuth) {
        this.userLoggedIn = true;
        this.authService.getCurrentUser(userAuth.uid).subscribe((currentUser: User) => {
          this.currentUser = currentUser;
          this.currentUserId = currentUser.id;
          this.currentLoyaltyPoints = currentUser.loyaltyPoints || 0;
          this.loadAvailableRewards();
          if (this.currentLoyaltyPoints <= 300) {
            this.nextRewardThreshold = 300;
          } else if (this.currentLoyaltyPoints <= 600) {
            this.nextRewardThreshold = 600;
          } else if (this.currentLoyaltyPoints <= 700) {
            this.nextRewardThreshold = 700;
          } else if (this.currentLoyaltyPoints <= 850) {
            this.nextRewardThreshold = 850;
          } else if (this.currentLoyaltyPoints > 850) {
            this.nextRewardThreshold = 1500;
          }
          this.getDefaultAddress(currentUser).then((address) => {
            this.shippingAddress = address;
          });
          if (this.currentUser === undefined) {
            this.userLoggedIn = false; // User is logged out
            this.displayGuestForm = true;
          }
        });
      } else {
        this.userLoggedIn = false; // User is logged out
        this.displayGuestForm = true;
      }
    });
  }

  async getDefaultAddress(user: User): Promise<ShippingAddress | null> {
    // Find the address where isSetAsDefaultAddress is true
    const addressesRef = this.db.collection("users").doc(user.id).collection("shippingAddresses").ref;
    const defaultAddressSnapshot = await addressesRef.where("isSetAsDefaultAddress", "==", true).limit(1).get();

    if (defaultAddressSnapshot.empty) {
      return null;
    }

    const defaultAddressDoc = defaultAddressSnapshot.docs[0];
    return {
      id: defaultAddressDoc.id,
      ...defaultAddressDoc.data()
    } as ShippingAddress;
  }

  openLoyalityProgram() {
    this.router.navigate(['product/loyaltyProgram']);
  }

  isFreeShippingActive(): boolean {
    return this.activeReward?.id === RewardText.FreeShippingId;
  }

  getOriginalShippingCost(): number {
    // Return standard shipping cost if not store pickup
    return this.selectedShippingMethod === 'store' ? 0 : this.STANDARD_SHIPPING_COST;
  }

  calculateTotals() {
    this.subtotal = this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const paymentFee = this.paymentMethods.find(m => m.id === this.selectedPaymentMethod)?.additionalFee || 0;
    this.shipping = this.selectedShippingMethod === 'dhl' ? 2500 : 0;

    // Calculate discount if reward is active
    this.discountAmount = 0;
    if (this.activeReward) {
      if (this.activeReward.id === RewardText.Discount10Id) {
        this.discountAmount = this.subtotal * (10 / 100);
      } else if (this.activeReward.id === RewardText.Discount20Id) {
        this.discountAmount = this.subtotal * (20 / 100);
      } else if (this.activeReward.id === RewardText.Discount30Id) {
        this.discountAmount = this.subtotal * (30 / 100);
      } else if (this.activeReward.id === RewardText.FreeShippingId) {
        this.shipping = 0;
      } else if (this.activeReward.id === RewardText.FiveThousandHufDiscountId) {
        this.discountAmount = 5000;
      }
    }

    // Calculate final total
    this.total = (this.subtotal - this.discountAmount) + this.shipping + paymentFee;
    if (this.total < 0) {
      this.total = 0;
    }
  }

  goToProduct(product: CartItem) {
    this.router.navigate(['/product', product.category, product.productId]);
  }

  // Go to Edit Address
  editAddress() {
    const dialogRef = this.dialog.open(ShippingAddressSelectionDialogComponent, {
      data: {
        userId: this.currentUserId
      }
    });

    dialogRef.afterClosed().subscribe((result: ShippingAddress) => {
      if (result) {
        this.shippingAddress = result;
        this.changeDetector.detectChanges();
      }
    });
  }

  addNewGuestAddress() {
    this.guestFirstName = this.guestForm.value.firstName;
    this.guestLastName = this.guestForm.value.lastName;
    this.guestEmail = this.guestForm.value.email;
    this.guestPhone = this.guestForm.value.phone;

    this.shippingAddress = {
      id: 'Guest',
      addressName: ProductViewText.CHECKOUT_GUEST_ADDRESS_NAME,
      addressType: '',
      country: this.guestForm.value.country,
      postalCode: this.guestForm.value.postalCode,
      city: this.guestForm.value.city,
      street: this.guestForm.value.streetName,
      streetType: this.guestForm.value.streetType,
      houseNumber: this.guestForm.value.houseNumber,
      floor: this.guestForm.value.floor || '',
      door: this.guestForm.value.door || '',
      companyName: this.guestForm.value.companyName || '',
      taxNumber: this.guestForm.value.taxNumber || '',
      isSetAsDefaultAddress: false,
      deleted: false
    }

    this.displayGuestForm = false;
    this.isEditGuestForm = true;
  }

  editGuestForm() {
    this.displayGuestForm = true;
  }

  openAddressSelection() {
    const dialogRef = this.dialog.open(ShippingAddressSelectionDialogComponent, {
      data: {
        userId: this.currentUserId
      }
    });

    dialogRef.afterClosed().subscribe((result: ShippingAddress) => {
      if (result) {
        this.shippingAddress = result;
        this.changeDetector.detectChanges();
      }
    });
  }

  selectShippingMethod(methodId: string) {
    this.selectedShippingMethod = methodId;

    if (methodId === 'store') {
      this.shipping = 0;
    } else {
      this.shipping = 2500;
    }
    this.calculateTotals();
  }

  selectPaymentMethod(methodId: string) {
    this.selectedPaymentMethod = methodId;
    this.calculateTotals();
  }

  get paymentFee(): number {
    const paymentMethod = this.paymentMethods.find(m => m.id === this.selectedPaymentMethod);
    return paymentMethod?.additionalFee || 0;
  }

  calculateLoyaltyPoints(): number {
    return Math.floor((this.subtotal - this.discountAmount) / 100);
  }

  getLoyaltyProgress(): number {
    const totalPoints = this.currentLoyaltyPoints + this.calculateLoyaltyPoints();
    return (totalPoints / this.nextRewardThreshold) * 100;
  }

  getPointsToNextReward(): number {
    const totalPoints = this.currentLoyaltyPoints + this.calculateLoyaltyPoints();
    return this.nextRewardThreshold - totalPoints;
  }

  navigateToLogin() {
    this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: '/checkout' }
    });
  }

  navigateToRegister() {
    this.router.navigate(['/auth/register'], {
      queryParams: { returnUrl: '/checkout' }
    });
  }

  async proceedToPayment() {
    let loyaltyPoints = this.userLoggedIn ? this.calculateLoyaltyPoints() : 0;
    this.order = {
      productList: this.cartItems,
      totalPrice: this.total,
      userId: this.currentUserId || 'Guest',
      firstName: this.guestFirstName || this.currentUser?.firstName || '',
      lastName: this.guestLastName || this.currentUser?.lastName || '',
      email: this.guestEmail || this.currentUser?.email || '',
      phone: this.guestPhone || this.currentUser?.phone || '',
      shippingMethod: this.selectedShippingMethod,
      paymentMethod: this.selectedPaymentMethod,
      shippingAddress: this.shippingAddress,
      totalLoyaltyPoints: loyaltyPoints,
      orderDate: Timestamp.now(),
      orderStatus: OrderStatus.PENDING,
      isAdminChecked: false,
      couponUsed: this.couponUsed
    };

    if (this.activeReward) {
      if (this.activeReward.id === RewardText.Discount10Id) {
        loyaltyPoints = loyaltyPoints - 300;
      } else if (this.activeReward.id === RewardText.Discount20Id) {
        loyaltyPoints = loyaltyPoints - 600;
      } else if (this.activeReward.id === RewardText.Discount30Id) {
        loyaltyPoints = loyaltyPoints - 700;
      } else if (this.activeReward.id === RewardText.FreeShippingId) {
        loyaltyPoints = loyaltyPoints - 850;
      } else if (this.activeReward.id === RewardText.FiveThousandHufDiscountId) {
        loyaltyPoints = loyaltyPoints - 1500;
      }
    }

    // Add the new order
    try {
      const documentumRef = await this.db.collection("orders").add(this.order);
      // id the document created then save the document id in the field
      await documentumRef.update({ id: documentumRef.id });

      await this.db.collection("users").doc(this.currentUserId).update({ loyaltyPoints: this.currentUser.loyaltyPoints + loyaltyPoints });
      // if everything was succes then open successfull dialog
      const dialogRef = this.dialog.open(SuccessfullDialogComponent, {
        data: {
          text: SuccessFullDialogText.SUCCESSFULL_PAYMENT,
          needToGoPrevoiusPage: false
        }
      });

      dialogRef.afterClosed().subscribe(() => {
        this.cartService.clearCart();
        this.back();
      });
    } catch (error) {
      this.errorMessage = true;
    }
  }

  back() {
    this.location.back();
  }

  loadAvailableRewards() {
    if (this.currentUser) {
      this.displayAvailableRewardsBasedOnPoints = this.availableRewards.filter(reward => this.currentUser.loyaltyPoints >= reward.pointsRequired);
    }
  }

  activateCoupon(reward: any) {
    this.activeReward = reward;
    this.couponUsed = true;
    this.calculateTotals();
  }

  removeCoupon() {
    this.activeReward = null;
    this.couponUsed = false;
    this.calculateTotals();
  }

}
