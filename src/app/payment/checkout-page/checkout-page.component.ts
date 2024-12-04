import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { CartService } from '../../cart/cart.service';
import { ShippingAddress } from '../../profile/shipping-address/shipping-address.model';
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
import { OrderStatus } from '../order-status';
import { or, Timestamp } from 'firebase/firestore';
import { SuccessfullDialogComponent } from '../../successfull-dialog/successfull-dialog.component';
import { SuccessFullDialogText } from '../../successfull-dialog/sucessfull-dialog-text';
import { LoadingService } from '../../loading-spinner/loading.service';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { environment } from '../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { DefaultImageUrl } from '../../admin-profile/default-image-url';

// Declare the Stripe global variable, which is part of the Stripe.js library,
// ensuring TypeScript recognizes it as an external object and avoids errors
// when referencing it in the code.
declare var Stripe;

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
  @ViewChild('cartItems') cartItemsElement: ElementRef; // Access the cart section element

  // Cart items
  cartItems: CartItem[] = [];
  initialCartItemCount: number = 5;
  showAllCartItems: boolean = false;

  // price
  subtotal: number = 0;
  cashOnDeliveryAmount: number = 0;
  shipping: number = 0; // Fix shipping cost will be 2500 Huf
  total: number = 0;

  userLoggedIn: boolean = false;
  shippingAddress: ShippingAddress;
  currentUserId: string = '';
  currentUser: User;

  productViewText = ProductViewText;

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
      id: ProductViewText.CHECKOUT_PAY_WITH_STRIPE,
      name: ProductViewText.CHECKOUT_PAY_WITH_STRIPE,
      description: ProductViewText.CHECKOUT_PAY_WITH_STRIPE_DESCRIPTION,
      icon: 'credit-card-outline',
      additionalFee: 0
    },
    {
      id: ProductViewText.CHECKOUT_PAY_WITH_CASH,
      name: ProductViewText.CHECKOUT_PAY_WITH_CASH,
      description: ProductViewText.CHECKOUT_PAY_WITH_CASH_DESCRIPTION,
      icon: 'shopping-bag-outline',
      additionalFee: 1000
    }
  ];

  shippingMethods = [
    {
      id: ProductViewText.CHECKOUT_SHIPPING_STORE_PICKUP_TITLE,
      name: ProductViewText.CHECKOUT_SHIPPING_STORE_PICKUP_TITLE,
      description: ProductViewText.CHECKOUT_SHIPPING_STORE_PICKUP_DESCRIPTION,
      price: 0,
      icon: 'home-outline',
      estimatedDays: '1-2'
    },
    {
      id: ProductViewText.CHECKOUT_SHIPPING_DHL_TITLE,
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
  paymentSuccess: boolean = false;

  // stripe
  stripeStatus: string;

  // errors
  errorMessage: boolean = false;
  minimum200HufError: boolean = false;

  constructor(
    private cartService: CartService,
    private auth: AngularFireAuth,
    private authService: AuthService,
    private router: Router,
    private db: AngularFirestore,
    private location: Location,
    private dialog: MatDialog,
    private changeDetector: ChangeDetectorRef,
    public loadingService: LoadingService,
    private functions: AngularFireFunctions,
    private route: ActivatedRoute,
    private translate: TranslateService
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
      isBillingDifferentFromShipping: false,
      billingAddress: {
        addressName: '',
        country: '',
        postalCode: '',
        city: '',
        street: '',
        streetType: '',
        houseNumber: ''
      }
    }
    this.loadCartItems();
    this.checkAuthStatus();
    this.stripeStatus = this.getStripeStatus();
    const savedOrder = localStorage.getItem('savedOrder');
    this.order = savedOrder ? JSON.parse(savedOrder) : null;
    this.selectedPaymentMethod = this.order ? this.order.paymentMethod : '';
    this.selectedShippingMethod = this.order ? this.order.shippingMethod : '';
    if (this.selectedShippingMethod === ProductViewText.CHECKOUT_SHIPPING_STORE_PICKUP_TITLE) {
      this.shipping = 0;
    } else {
      this.shipping = this.STANDARD_SHIPPING_COST;
    }
    this.shippingAddress = this.order ? this.order.shippingAddress : this.shippingAddress;
    // Clear localStorage after retrieving the data
    localStorage.removeItem('savedOrder');
    if (this.stripeStatus === 'success') {
      this.paymentSuccess = true;
      this.addOrderToFirebase();
    } else {
      this.paymentSuccess = false;
    }
  }

  getStripeStatus() {
    let action = this.route.snapshot.queryParamMap.get('action');
    return action || '';
  }

  async loadCartItems() {
    await this.loadingService.withLoading(async () => {
      this.cartService.cartItems$.subscribe(items => {
        this.cartItems = items;
        if (this.cartItems.length === 0) {
          this.router.navigate(['/']);
        }
        this.calculateTotals();
      });
    });
  }

  // Getter to control which cart items are visible
  get visibleCartItems(): CartItem[] {
    return this.showAllCartItems
      ? this.cartItems
      : this.cartItems.slice(0, this.initialCartItemCount);
  }

  // Toggle cart items display
  toggleCartItemsDisplay() {
    this.showAllCartItems = !this.showAllCartItems;

    if (!this.showAllCartItems) {
      this.goTopOfTheCartItemSection();
    }
  }

  // Scroll to the top of the cart items section element
  goTopOfTheCartItemSection() {
    this.cartItemsElement.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  editCart() {
    this.location.back();
    this.router.navigate(['/cart']);
  }

  async checkAuthStatus() {
    await this.loadingService.withLoading(async () => {
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
    return this.selectedShippingMethod === ProductViewText.CHECKOUT_SHIPPING_STORE_PICKUP_TITLE ? 0 : this.STANDARD_SHIPPING_COST;
  }

  calculateTotals() {
    this.subtotal = this.cartItems.reduce((sum, item) => sum + (item.selectedPrice.discountedPrice > 0
      ? (item.selectedPrice.discountedPrice * item.quantity)
      : (item.selectedPrice.productPrice * item.quantity)), 0);
    this.cashOnDeliveryAmount = this.paymentMethods.find(m => m.id === this.selectedPaymentMethod)?.additionalFee || 0;
    this.shipping = this.selectedShippingMethod === ProductViewText.CHECKOUT_SHIPPING_STORE_PICKUP_TITLE ? 0 : this.STANDARD_SHIPPING_COST;

    if (this.selectedShippingMethod === '') {
      this.shipping = 0;
    }

    // Calculate discount if coupon is active
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
    this.total = (this.subtotal - this.discountAmount) + this.shipping + this.cashOnDeliveryAmount;
    if (this.total < 0) {
      this.total = 0;
    }
  }

  goToProduct(product: CartItem) {
    this.router.navigate(['/product', product.category, product.productId], {
      queryParams: {
        selectedPrice: JSON.stringify(product.selectedPrice)
      }
    });
  }

  // Go to Edit Address
  async editAddress() {
    await this.loadingService.withLoading(async () => {
      const dialogRef = this.dialog.open(ShippingAddressSelectionDialogComponent, {
        data: {
          userId: this.currentUserId
        }
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result === false) {
          this.shippingAddress = undefined;
        }
        if (result) {
          this.shippingAddress = result;
          this.changeDetector.detectChanges();
        }
      });
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
      isBillingDifferentFromShipping: this.shippingAddress.isBillingDifferentFromShipping,
      billingAddress: this.shippingAddress.billingAddress
    }

    console.log(this.shippingAddress)

    this.displayGuestForm = false;
    this.isEditGuestForm = true;
  }

  editGuestForm() {
    this.displayGuestForm = true;
  }

  async openAddressSelection() {
    await this.loadingService.withLoading(async () => {
      const dialogRef = this.dialog.open(ShippingAddressSelectionDialogComponent, {
        data: {
          userId: this.currentUserId
        }
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result === false) {
          this.shippingAddress = undefined;
        }
        if (result) {
          this.shippingAddress = result;


          this.changeDetector.detectChanges();
        }
      });
    });
  }

  selectShippingMethod(methodId: string) {
    this.selectedShippingMethod = methodId;

    if (methodId === ProductViewText.CHECKOUT_SHIPPING_STORE_PICKUP_TITLE) {
      this.shipping = 0;
    } else {
      this.shipping = this.STANDARD_SHIPPING_COST;
    }
    this.calculateTotals();
  }

  selectPaymentMethod(methodId: string) {
    this.selectedPaymentMethod = methodId;
    this.calculateTotals();
  }

  calculateLoyaltyPoints(): number {
    return Math.floor((this.subtotal - this.discountAmount) / 100);
  }

  calculateOriginalTotal(): number {
    if (this.selectedShippingMethod === ProductViewText.CHECKOUT_SHIPPING_DHL_TITLE) {
      return this.subtotal + this.STANDARD_SHIPPING_COST + this.cashOnDeliveryAmount;
    } else {
      return this.subtotal + this.shipping + this.cashOnDeliveryAmount;
    }
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
    // Check if the total is at least 2000
    if (this.total < 2000) {
      this.minimum200HufError = true;
      return;
    } else {
      this.minimum200HufError = false;

      // Start loading
      await this.loadingService.withLoading(async () => {
        // Prepare order data
        this.order = {
          productList: this.cartItems,
          totalPrice: this.total,
          subtotal: this.subtotal,
          discountAmount: this.discountAmount,
          cashOnDeliveryAmount: this.cashOnDeliveryAmount,
          userId: this.currentUserId || 'Guest',
          firstName: this.guestFirstName || this.currentUser?.firstName || '',
          lastName: this.guestLastName || this.currentUser?.lastName || '',
          email: this.guestEmail || this.currentUser?.email || '',
          phone: this.guestPhone || this.currentUser?.phone || '',
          shippingMethod: this.selectedShippingMethod,
          shippingCost: this.shipping,
          paymentMethod: this.selectedPaymentMethod,
          shippingAddress: this.shippingAddress,
          totalLoyaltyPoints: this.userLoggedIn ? this.calculateLoyaltyPoints() : 0,
          orderDate: Timestamp.now(),
          orderStatus: OrderStatus.PROCESSING,
          isAdminChecked: false,
          isUserChecked: false,
          couponUsed: this.couponUsed,
          isModified: false
        };

        // Save the order ovject to localStorage to be able to retrieve it later if cancelled the stripe payment
        localStorage.setItem('savedOrder', JSON.stringify(this.order));

        // Check the payment method
        if (this.selectedPaymentMethod === ProductViewText.CHECKOUT_PAY_WITH_STRIPE) {
          const stripe = Stripe(environment.stripe.publishableKey);

          /*
          * Start loading and wait for the Stripe checkout process
          * pass the cartItems, shippingCost and activeReward to the Stripe checkout function to display the Stripe checkout page
          */
          const result = await this.functions.httpsCallable('stripeCheckout')({
            cartItems: this.cartItems,
            shippingCost: this.shipping,
            activeReward: this.activeReward
          }).toPromise();

          if (result.error) {
            this.errorMessage = true;
            console.error("Stripe error:", result.error.message);
          } else {
            // if there was no error then redirect to Stripe checkout page
            await stripe.redirectToCheckout({
              sessionId: result.id
            }).then((redirectResult) => {
              if (redirectResult.error) {
                this.errorMessage = true;
                console.error("Stripe redirection error:", redirectResult.error.message);
              }
            });
          }
        } else {
          // Handle non-Stripe payment methods
          this.paymentSuccess = true;
          await this.addOrderToFirebase(); // Ensure this is awaited
        }
      });
    }
  }

  async addOrderToFirebase() {
    if (this.paymentSuccess) {
      await this.loadingService.withLoading(async () => {
        this.order.orderDate = Timestamp.now();
        // Calculate loyalty points
        let loyaltyPoints = this.userLoggedIn ? this.calculateLoyaltyPoints() : 0;

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
          this.order.id = documentumRef.id;

          if (this.userLoggedIn) {
            await this.db.collection("users").doc(this.currentUserId).update({ loyaltyPoints: this.currentUser.loyaltyPoints + loyaltyPoints });
          }

          // Send confirmation email with loading spinner
          await this.loadingService.withLoading(async () => {

            // Get translations using translate.instant
            const orderConfirmation = this.translate.instant('receipt.title');
            const orderIdText = this.translate.instant('receipt.orderId');
            const dateText = this.translate.instant('receipt.date');
            const customerDetailsText = this.translate.instant('receipt.customerDetails');
            const nameText = this.translate.instant('receipt.name');
            const quantity = this.translate.instant('products.quantity');
            const emailText = this.translate.instant('receipt.email');
            const phoneText = this.translate.instant('receipt.phone');
            const shippingAddressText = this.translate.instant('receipt.shippingAddress');
            const companyNameText = this.translate.instant('profileMenu.shippingAddressForm.companyName');
            const taxNumber = this.translate.instant('profileMenu.shippingAddressForm.taxNumber');
            const billingAddressText = this.translate.instant('profileMenu.shippingAddressForm.billingAddress');
            const orderItemsText = this.translate.instant('receipt.orderItems');
            const paymentSummaryText = this.translate.instant('receipt.paymentSummary');
            const subtotalText = this.translate.instant('receipt.subtotal');
            const shippingText = this.translate.instant('receipt.shipping');
            const discountText = this.translate.instant('checkout.discount');
            const cashOnDeliveryText = this.translate.instant('checkout.orderSummary.paymentFee');
            const totalText = this.translate.instant('receipt.total');
            const thankYouText = this.translate.instant('receipt.thankYou');
            const priceUnit = this.translate.instant('products.huf');
            const orderStatusTitle = this.translate.instant('orders.orderStatus');
            const orderStatusText = this.translate.instant(`${this.order.orderStatus}`);

            // send the confirmation email
            return await this.sendEmail({
              userEmail: this.order.email,
              subject: orderConfirmation,
              template: `
        <table style="width: 100%; max-width: 800px; margin: auto; border-collapse: collapse; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 10px;">
        <tr>
            <td style="padding: 20px; text-align: center;">
                <h2 style="color: #0b8e92;">${orderConfirmation}</h2>
                <h3 style="color: #000000;">${orderIdText}: #${this.order.id}</h3>
                <p style="color: #000000;"><strong>${dateText}:</strong> ${this.order.orderDate.toDate().toLocaleDateString()}</p>
                <p style="color: #0b8e92; font-size: 1.3em;"><strong>${orderStatusTitle}</strong> ${orderStatusText}</p>
                <p style="text-align: center; margin-top: 30px; font-size: 1.5em; color: #000000;">${thankYouText}</p>
            </td>
        </tr>
        <tr>
            <td style="padding: 10px;">
                <h3 style="color: #0b8e92;">${customerDetailsText}</h3>
                <p style="color: #000000;"><strong>${nameText}:</strong> ${this.order.firstName} ${this.order.lastName}</p>
                <p style="color: #000000;"><strong>${emailText}:</strong> ${this.order.email}</p>
                <p style="color: #000000;"><strong>${phoneText}:</strong> ${this.order.phone}</p>
            </td>
        </tr>

      ${this.order.shippingAddress.companyName !== '' ? `
        <tr>
          <td style="padding: 10px;">
            <h3 style="color: #0b8e92;">${billingAddressText}</h3>
               ${this.order.shippingAddress.isBillingDifferentFromShipping ? `
              <p style="color: #000000;">${this.order.shippingAddress.billingAddress.street} ${this.order.shippingAddress.billingAddress.streetType}, ${this.order.shippingAddress.billingAddress.houseNumber}</p>
              <p style="color: #000000;">${this.order.shippingAddress.billingAddress.city}, ${this.order.shippingAddress.billingAddress.postalCode}</p>
              <p style="color: #000000;">${this.order.shippingAddress.billingAddress.country}</p>
              <p style="color: #000000;"><strong>${companyNameText}:</strong> ${this.order.shippingAddress.companyName}</p>
              <p style="color: #000000;"><strong>${taxNumber}:</strong> ${this.order.shippingAddress.taxNumber}</p>
          ` : `
              <p style="color: #000000;">${this.order.shippingAddress.street} ${this.order.shippingAddress.streetType}, ${this.order.shippingAddress.houseNumber}</p>
              <p style="color: #000000;">${this.order.shippingAddress.city}, ${this.order.shippingAddress.postalCode}</p>
              <p style="color: #000000;">${this.order.shippingAddress.country}</p>
              <p style="color: #000000;"><strong>${companyNameText}:</strong> ${this.order.shippingAddress.companyName}</p>
              <p style="color: #000000;"><strong>${taxNumber}:</strong> ${this.order.shippingAddress.taxNumber}</p>
            `}
           </td>
        </tr>
      ` : ''}

      ${this.order.shippingAddress.companyName === '' && this.order.shippingMethod === ProductViewText.CHECKOUT_SHIPPING_STORE_PICKUP_TITLE ? `
      <tr>
          <td style="padding: 10px;">
            <h3 style="color: #0b8e92;">${billingAddressText}</h3>
              <p style="color: #000000;">${this.order.shippingAddress.street} ${this.order.shippingAddress.streetType}, ${this.order.shippingAddress.houseNumber}</p>
              <p style="color: #000000;">${this.order.shippingAddress.city}, ${this.order.shippingAddress.postalCode}</p>
              <p style="color: #000000;">${this.order.shippingAddress.country}</p>
           </td>
        </tr>
      ` : ''}

      ${(this.order.shippingMethod !== ProductViewText.CHECKOUT_SHIPPING_STORE_PICKUP_TITLE) ? `
      <tr>
          <td style="padding: 10px;">
            <h3 style="color: #0b8e92;">${shippingAddressText}</h3>
              <p style="color: #000000;">${this.order.shippingAddress.street} ${this.order.shippingAddress.streetType}, ${this.order.shippingAddress.houseNumber}</p>
              <p style="color: #000000;">${this.order.shippingAddress.city}, ${this.order.shippingAddress.postalCode}</p>
              <p style="color: #000000;">${this.order.shippingAddress.country}</p>
           </td>
        </tr>
      ` : ``}

        <tr>
            <td style="padding: 20px;">
                <h3 style="color: #0b8e92;">${orderItemsText}</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tbody>
                        ${this.order.productList.map(item => `
                            <tr style="border-bottom: 1px solid #ddd;">
                                <td style="padding: 10px; width: 80px;">
                                    <img src="${item.selectedPrice.productImage}" 
                                         alt="${item.productName}" 
                                         style="width: 80px; height: 80px; object-fit: cover; border-radius: 10px;">
                                </td>
                                <td style="padding: 10px; color: #000000;">
                                    <strong>${item.productName}</strong>
                                    <br><span>${quantity}: ${item.quantity}</span>
                                </td>
                                <td style="padding: 10px; text-align: right; color: #000000;">
                                    ${item.selectedPrice.discountedPrice > 0 ? item.selectedPrice.discountedPrice : item.selectedPrice.productPrice} ${priceUnit}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </td>
        </tr>
        <tr>
            <td style="padding: 20px;">
                <h3 style="color: #0b8e92;">${paymentSummaryText}</h3>
                <p style="color: #000000;"><strong>${subtotalText}:</strong> ${this.order.subtotal} ${priceUnit}</p>
                 ${this.order.shippingCost > 0 ? `<p style="color: #000000;"><strong>${shippingText}:</strong> ${this.order.shippingCost} ${priceUnit}</p>` : ''}
                 ${this.order.cashOnDeliveryAmount > 0 ? `<p style="color: #000000;"><strong>${cashOnDeliveryText}:</strong> ${this.order.cashOnDeliveryAmount} ${priceUnit}</p>` : ''}
                 ${this.order.discountAmount > 0 ? `<p style="color: #000000;"><strong>${discountText}:</strong> -${Math.floor(this.order.discountAmount)} ${priceUnit}</p>` : ''}
                <p style="color: #000000;"><strong>${totalText}:</strong> ${this.order.totalPrice} ${priceUnit}</p>
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
            });
          });

          // if everything was successful then open successful dialog
          localStorage.removeItem('savedOrder');

          const dialogRef = this.dialog.open(SuccessfullDialogComponent, {
            data: {
              text: SuccessFullDialogText.SUCCESSFULL_PAYMENT,
              needToGoPrevoiusPage: false
            }
          });

          dialogRef.afterClosed().subscribe(() => {
            this.cartService.clearCart();
            this.router.navigate(['/receipt', documentumRef.id], { queryParams: { fromCheckout: 'true' } });
          });
        } catch (error) {
          this.errorMessage = true;
        }
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
