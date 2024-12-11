import { trigger, state, style, transition, animate } from '@angular/animations';
import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { CurrencyPipe, Location } from '@angular/common';
import { OrganicFood } from '../../../admin-profile/product-management/product-models/organic-food.model';
import { ProductViewText } from '../../../admin-profile/product-management/product-view-texts';
import { Router, ActivatedRoute } from '@angular/router';
import { DocumentHandlerService } from '../../../document.handler.service';
import { ProductService } from '../../product.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatDialog } from '@angular/material/dialog';
import { ProductReeviews } from '../../../admin-profile/product-management/product-models/product-reviews.model';
import { Vitamin } from '../../../admin-profile/product-management/product-models/vitamin.model';
import { AuthService } from '../../../auth/auth.service';
import { CartService } from '../../../cart/cart.service';
import { User } from '../../../profile/user.model';
import { ReviewHandleComponent } from '../../review-handle/review-handle.component';
import { ProductPrice } from '../../../admin-profile/product-management/product-models/product-price.model';
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-organic-food-page',
  templateUrl: './organic-food-page.component.html',
  styleUrl: '../../../../styles/product-page-view.scss',
  animations: [
    // name of tha animation what can call in html
    trigger('collapseComponent', [
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
    ]),

    trigger('zoomIn', [
      transition(':enter', [
        style({ transform: 'scale(0.8)', opacity: 0 }),
        animate('250ms ease-out', style({ transform: 'scale(1)', opacity: 1 })),
      ]),
    ])
  ]
})
export class OrganicFoodPageComponent implements OnInit {
  @ViewChild('userLoggedOutLikeErrorMessage') errorMessage: ElementRef;
  @ViewChild('toScrollAfterNavigate') toScrollAfterNavigate: ElementRef;
  @ViewChild('reviewsSection') reviewsSection: ElementRef;

  // Collapsible sections
  @ViewChild('description') description: ElementRef;
  @ViewChild('ingredients') ingredients: ElementRef;
  @ViewChild('nutritionalTable') nutritionalTable: ElementRef;

  organicFood: OrganicFood;
  selectedQuantityInProduct: number = 0;
  productViewText = ProductViewText;

  selectedPrice: number = 0;
  productPriceObject: ProductPrice;
  selectedImage: string = '';

  // Flavors, viatmins and Allergens
  availableFlavors: string[] = [];
  selectedFlavor: string = '';
  allergens: string[] = [];
  vitaminList: Vitamin[] = [];

  isCollapsedDescription: boolean = true;
  isCollapsedIngredients: boolean = true;
  isCollapsedNutritionTable: boolean = true;
  isFlavorDropdownOpen: boolean = false;

  relatedProducts: OrganicFood[] = [];

  // cart, unit price and loyality program
  unitPrice: number = 0;
  discountedUnitPrice: number = 0;
  unitPriceUnit: string = '';
  cartQuantity: number = 1;
  loyaltyPoints: number = 0;

  productIsInStock: boolean = true;
  productStock: number = 0;

  errorMessageStock: boolean = false;

  // reviews
  // Need two arrays for the reviews, one for the display the reviews and one for handling the reviews likes
  displayedReviews: ProductReeviews[] = []; // Display data - gets sorted
  originalReviews: ProductReeviews[] = []; // Original data - never sorted

  // pagination
  paginatedReviews: ProductReeviews[] = [];
  itemsPerPage = 3;
  currentPage = 1;

  averageRating: number = 0;

  userLoggedIn: boolean = false;
  userReview: User;
  currentUserId: string = '';
  userLoggedOutError: boolean = false;
  userLoggedOutLikeError: boolean = false;
  productId: string = '';
  isProductInCart: boolean = false;

  // show all reviews
  showAllReviews: boolean = false;
  readonly initialReviewCount: number = 3;

  //filter reviews
  availableReviewFilters: string[] = [
    ProductViewText.ORDER_BY_OLDEST,
    ProductViewText.ORDER_BY_LATEST,
    ProductViewText.ORDER_BY_WORST_RATING,
    ProductViewText.ORDER_BY_BEST_RATING
  ];
  currentSortOrder: string = ProductViewText.ORDER_BY_LATEST;

  // responsibility
  isLargeScreen: boolean = false;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private documentHandler: DocumentHandlerService,
    private changeDetector: ChangeDetectorRef,
    private location: Location,
    private productService: ProductService,
    private auth: AngularFireAuth,
    private db: AngularFirestore,
    private authService: AuthService,
    private dialog: MatDialog,
    private cartService: CartService,
    private currencyPipe: CurrencyPipe) { }

  ngOnInit(): void {
    this.checkScreenSize();
    this.organicFood = {
      id: "",
      productName: "",
      productCategory: "",
      smallDescription: "",
      ingredients: "",
      description: "",
      dosageUnit: "",
      flavors: [],

      safeForConsumptionDuringBreastfeeding: true,
      safeForConsumptionDuringPregnancy: true,

      nutritionalTable: null,

      allergens: [],

      // date added
      dateAdded: Timestamp.now(),

      prices: [],
      useUnifiedImage: false,
    }

    // check if user logged in for reviews
    this.auth.authState.subscribe((userAuth) => {
      if (userAuth) {
        this.userLoggedIn = true;
        this.authService.getCurrentUser(userAuth.uid).subscribe((currentUser: User) => {
          this.userReview = currentUser;
          this.currentUserId = currentUser.id;
          if (this.userReview === undefined) {
            this.userLoggedIn = false; // User is logged out
          }
        });
      } else {
        this.userLoggedIn = false; // User is logged out
      }
    });

    this.route.params.subscribe(params => {
      this.documentHandler.getInnerDocumentByID("products", ProductViewText.ORGANIC_FOOD, "allProduct", params['productId']).subscribe(async (organicFood: OrganicFood) => {
        this.organicFood = { ...organicFood };
        this.allergens = organicFood.allergens;
        this.productId = organicFood.id;

        // Read and parse the selectedPrice from query parameters
        this.route.queryParams.subscribe(queryParams => {
          if (queryParams['selectedPrice']) {
            try {
              const parsedPrice: ProductPrice = JSON.parse(queryParams['selectedPrice']);

              this.productPriceObject = parsedPrice;
            } catch (e) {
              this.productPriceObject = this.getDefaultPrice(organicFood);
            }
          } else {
            this.productPriceObject = this.getDefaultPrice(organicFood);
          }
        });

        // Set other properties based on the selected price
        this.selectedQuantityInProduct = this.productPriceObject.quantityInProduct;
        this.selectedPrice = this.productPriceObject.productPrice;
        this.selectedFlavor = this.productPriceObject.productFlavor;
        this.loyaltyPoints = Math.round(this.selectedPrice / 100);
        this.selectedImage = this.productPriceObject.productImage;
        this.getReviews();

        // get the available flavors for default price
        this.getAvailableFlavors(true);

        if (this.getDefaultPrice(organicFood).productStock === 0) {
          this.productIsInStock = false;
        } else {
          this.productIsInStock = true;
        }
        this.getUnitPrice();

        this.loadRelatedProducts();
      });
    });
  }

  @HostListener('window:resize', [])
  onResize(): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    this.isLargeScreen = window.innerWidth > 1400;
  }

  // Function to get unique quantities for display
  getUniqueQuantities() {
    return Array.from(new Set(this.organicFood.prices.map(price => price.quantityInProduct)));
  }

  // Method to get the default price for a the products
  getDefaultPrice(organicFood: OrganicFood) {
    return organicFood.prices.find(price => price.setAsDefaultPrice);
  }

  // navigateto the product page
  goToProductPage(productId: string) {
    this.router.navigate(['product/' + ProductViewText.ORGANIC_FOOD + '/' + productId])
  }

  // get the available flavors for the selected quantity
  // if defaultPriceSelect is false, the first flavor will be selected (this is necessary for the default price)
  getAvailableFlavors(defaultPriceSelect: boolean) {
    const filteredPrices = this.organicFood.prices.filter(price => price.quantityInProduct === this.selectedQuantityInProduct);

    // get the unique flavors
    this.availableFlavors = Array.from(new Set(filteredPrices.map(price => price.productFlavor)));
    if (!defaultPriceSelect) {
      this.selectedFlavor = this.availableFlavors[0];
    }
    this.updateSelectedPriceAndStock();
  }

  selectQuantity(selectedQuantity: number) {
    this.selectedQuantityInProduct = selectedQuantity;
    this.productPriceObject = this.getPriceBasedOnQuantity(this.organicFood, selectedQuantity);
    this.selectedPrice = this.productPriceObject.productPrice;
    this.loyaltyPoints = Math.round(this.selectedPrice / 100);
    this.selectedImage = this.productPriceObject.productImage;

    this.getAvailableFlavors(false);

    if (this.productPriceObject.productStock === 0) {
      this.productIsInStock = false;
    } else {
      this.productIsInStock = true;
    }
    this.getUnitPrice();
    this.updateSelectedPriceAndStock();

    // Trigger animation by re-rendering
    this.changeDetector.detectChanges();
  }

  selectFlavor(flavor: string) {
    this.selectedFlavor = flavor;
    this.updateSelectedPriceAndStock();
  }

  updateSelectedPriceAndStock() {
    this.productPriceObject = this.organicFood.prices.find(price =>
      price.quantityInProduct === this.selectedQuantityInProduct &&
      price.productFlavor === this.selectedFlavor
    );

    if (this.productPriceObject) {
      this.selectedPrice = this.productPriceObject.productPrice;
      this.productStock = this.productPriceObject.productStock;
      this.loyaltyPoints = Math.round(this.selectedPrice / 100);
      this.productIsInStock = this.productPriceObject.productStock > 0;
      this.selectedImage = this.productPriceObject.productImage;
      this.getUnitPrice();
    }
  }

  getPriceBasedOnQuantity(organicFood: OrganicFood, selectedQuantity: number) {
    return organicFood.prices.find(priceObj => priceObj.quantityInProduct === selectedQuantity);
  }

  getUnitPrice() {
    // Reset discounted unit price
    this.discountedUnitPrice = 0;

    // Calculate base unit based on dosage unit type
    let baseUnit: number;

    switch (this.organicFood.dosageUnit) {
      case this.productViewText.GRAM:
        // Convert grams to kg (1kg = 1000g)
        baseUnit = this.selectedQuantityInProduct / 1000;
        this.unitPriceUnit = this.productViewText.KG;
        break;

      case this.productViewText.POUNDS:
        // For pounds, unit price is price per pound
        this.unitPrice = this.selectedPrice / this.selectedQuantityInProduct;
        if (this.productPriceObject.discountedPrice > 0) {
          this.discountedUnitPrice = this.productPriceObject.discountedPrice / this.selectedQuantityInProduct;
        }
        this.unitPriceUnit = this.productViewText.POUNDS;
        return; // Exit early since calculation is done

      case this.productViewText.PIECES:
      case this.productViewText.CAPSULE:
        // For pieces/capsules, calculate price per unit
        this.unitPrice = this.selectedPrice / this.selectedQuantityInProduct;
        if (this.productPriceObject.discountedPrice > 0) {
          this.discountedUnitPrice = this.productPriceObject.discountedPrice / this.selectedQuantityInProduct;
        }
        this.unitPriceUnit = this.organicFood.dosageUnit === this.productViewText.PIECES ?
          this.productViewText.PCS : this.productViewText.CAPSULE;
        return; // Exit early since calculation is done

      default: // For liquids
        // Convert ml to liters (1L = 1000ml)
        baseUnit = this.selectedQuantityInProduct / 1000;
        this.unitPriceUnit = this.productViewText.LITER;
    }

    // Calculate regular unit price
    this.unitPrice = this.selectedPrice / baseUnit;

    // Calculate discounted unit price if discount exists
    if (this.productPriceObject.discountedPrice > 0) {
      this.discountedUnitPrice = this.productPriceObject.discountedPrice / baseUnit;
    }

    // Round prices and ensure minimum of 1
    this.unitPrice = Math.max(1, Math.round(this.unitPrice));
    if (this.discountedUnitPrice > 0) {
      this.discountedUnitPrice = Math.max(1, Math.round(this.discountedUnitPrice));
    }

    this.checkStock();
  }

  toggleCollapsedDescription() {
    this.isCollapsedDescription = !this.isCollapsedDescription;

    this.description.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

    if (!this.isCollapsedDescription) {
      this.isCollapsedIngredients = true;
      this.isCollapsedNutritionTable = true;
    }
  }

  toggleCollapsedIngredients() {
    this.isCollapsedIngredients = !this.isCollapsedIngredients;

    this.description.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

    if (!this.isCollapsedIngredients) {
      this.isCollapsedDescription = true;
      this.isCollapsedNutritionTable = true;
    }
  }

  toggleCollapsedNutritionTable() {
    this.isCollapsedNutritionTable = !this.isCollapsedNutritionTable;

    this.ingredients.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

    if (!this.isCollapsedNutritionTable) {
      this.isCollapsedDescription = true;
      this.isCollapsedIngredients = true;
    }
  }

  toggleFlavorDropdown() {
    this.isFlavorDropdownOpen = !this.isFlavorDropdownOpen;
  }

  // get related products list
  loadRelatedProducts(): void {
    // Fetch related products based on tags and language
    this.productService.getRelatedProducts(this.organicFood.id, this.organicFood.productCategory, ProductViewText.ORGANIC_FOOD).subscribe((relatedProducts: OrganicFood[]) => {
      // Create a Set to track unique product id
      const existingIds = new Set<string>();

      // Add IDs of the related products to the Set
      relatedProducts.forEach(product => existingIds.add(product.id!));

      // Handle related products based on their count
      if (relatedProducts.length > 0) {
        this.relatedProducts = relatedProducts; // Set the found related products
      }
      else if (relatedProducts.length === 0) {
        // No related products found, fetch three random blogs
        this.productService.getRandomProducts(this.organicFood.id, 3, ProductViewText.ORGANIC_FOOD).subscribe((randomBlogs: OrganicFood[]) => {
          this.relatedProducts = randomBlogs; // Set the random products as related
        });
      }
    });
  }

  checkStock() {
    if (this.productIsInStock && this.productStock < this.cartQuantity) {
      this.errorMessageStock = true;
      return;
    } else {
      this.errorMessageStock = false;
    }
  }

  addToCart() {
    if (this.cartQuantity > 0) {
      this.productPriceObject = this.organicFood.prices.find(price =>
        price.quantityInProduct === this.selectedQuantityInProduct &&
        price.productFlavor === this.selectedFlavor
      );

      // add the product to the cart
      this.cartService.addToCart({
        productId: this.organicFood.id,
        productName: this.organicFood.productName,
        quantity: this.cartQuantity,
        selectedPrice: this.productPriceObject,
        category: ProductViewText.ORGANIC_FOOD,
        size: this.selectedQuantityInProduct.toString(),
        productUnit: this.organicFood.dosageUnit,
        maxStockError: false,
        maxStock: this.productPriceObject.productStock
      });

      this.errorMessageStock = false;
    }
  }

  openLoyalityProgram() {
    this.router.navigate(['product/loyaltyProgram']);
  }

  filterRating(filter: string = ProductViewText.ORDER_BY_LATEST) {
    // store the current sort order
    this.currentSortOrder = filter;

    // make a copy of the original reviews
    let sortedReviews = [...this.originalReviews];

    // sort the reviews based on the current sort order
    switch (filter) {
      case ProductViewText.ORDER_BY_BEST_RATING:
        sortedReviews.sort((a, b) => b.rating - a.rating);
        break;
      case ProductViewText.ORDER_BY_WORST_RATING:
        sortedReviews.sort((a, b) => a.rating - b.rating);
        break;
      case ProductViewText.ORDER_BY_LATEST:
        sortedReviews.sort((a, b) => b.date.toMillis() - a.date.toMillis());
        break;
      case ProductViewText.ORDER_BY_OLDEST:
        sortedReviews.sort((a, b) => a.date.toMillis() - b.date.toMillis());
        break;
    }

    // set the sorted reviews to the display array
    this.displayedReviews = sortedReviews;
    this.currentPage = 1;
    this.updatePaginatedList();
  }

  getReviews() {
    this.productService.getReviewsForProduct(this.productId, ProductViewText.ORGANIC_FOOD).subscribe(reviews => {
      // set the original reviews
      this.originalReviews = reviews;
      // set the display reviews
      this.displayedReviews = [...reviews];

      this.updatePaginatedList();
      // calculate the average rating
      this.calculateAverageRating();
      // sort the reviews based on the current sort order
      this.filterRating(this.currentSortOrder); // Apply initial sort
    })
  }

  // navigation for the pagination
  updatePaginatedList(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedReviews = this.displayedReviews.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.toScrollAfterNavigate.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    this.updatePaginatedList();
  }

  getTotalPages(): number {
    return Math.ceil(this.displayedReviews.length / this.itemsPerPage);
  }

  calculateAverageRating(): void {
    this.averageRating = 0;
    if (this.displayedReviews.length > 0) {
      this.displayedReviews.forEach(number => {
        this.averageRating += number.rating
      });
      this.averageRating = this.averageRating / this.displayedReviews.length;
      this.averageRating = Math.round(this.averageRating * 100) / 100;
    } else {
      this.averageRating = 1;
    }
  }

  getRatingCount(star: number): number {
    return this.displayedReviews.filter(review => review.rating === star).length;
  }

  getRatingPercentage(star: number): number {
    return (this.getRatingCount(star) / this.displayedReviews.length) * 100;
  }

  async likeReview(review: ProductReeviews) {
    // check if user is logged in
    if (this.userLoggedIn) {
      // make a copy of the review we are going to update
      const updatedReview = { ...review };

      // check if the user already liked the review
      if (!updatedReview.likes.includes(this.currentUserId)) {
        updatedReview.likes.push(this.currentUserId);
      } else {
        // remove the like if the user already liked the review
        updatedReview.likes = updatedReview.likes.filter(id => id !== this.currentUserId);
      }

      // update the review in the database
      await this.db.collection('reviews')
        .doc(ProductViewText.ORGANIC_FOOD)
        .collection('allReview')
        .doc(review.id)
        .update({ likes: updatedReview.likes });

      // update the display array
      const index = this.displayedReviews.findIndex(r => r.id === review.id);
      // update the original array
      const allIndex = this.originalReviews.findIndex(r => r.id === review.id);

      if (index !== -1) this.displayedReviews[index] = updatedReview;
      if (allIndex !== -1) this.originalReviews[allIndex] = updatedReview;

      // sort the reviews based on the current sort order
      this.filterRating(this.currentSortOrder);
    } else {
      this.userLoggedOutLikeError = true;
      this.scrollToErrorMessage();
      this.userLoggedOutError = false;
    }
  }

  async likeResponse(review: ProductReeviews) {
    if (this.userLoggedIn) {
      // check if the user already liked the response
      if (!review.responseLikes.includes(this.currentUserId)) {
        review.responseLikes.push(this.currentUserId);
      } else {
        // remove the like if the user already liked the response
        review.responseLikes = review.responseLikes.filter(id => id !== this.currentUserId);
      }
      await this.db.collection('reviews').doc(ProductViewText.ORGANIC_FOOD).collection('allReview').doc(review.id).update({ responseLikes: review.responseLikes });
    } else {
      this.userLoggedOutLikeError = true;
      this.scrollToErrorMessage();
      this.userLoggedOutError = false;
    }
  }

  scrollToErrorMessage(): void {
    // Scroll to the error message element
    this.errorMessage.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  goToReviews() {
    // Scroll to the reviews section element
    this.reviewsSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  gotoCreateNewRReview() {
    if (!this.userLoggedIn) {
      this.userLoggedOutError = true;
      this.userLoggedOutLikeError = false;
    } else {
      this.userLoggedOutError = false;
      this.dialog.open(ReviewHandleComponent, {
        data: {
          userId: this.userReview.id,
          edit: false,
          productId: this.organicFood.id,
          userFirstName: this.userReview.firstName,
          userLastName: this.userReview.lastName,
          pageFrom: ProductViewText.ORGANIC_FOOD,
          category: ProductViewText.ORGANIC_FOOD
        }
      });
    }
  }

  editReview(review: ProductReeviews) {
    this.dialog.open(ReviewHandleComponent, {
      data: {
        userId: this.userReview.id,
        edit: true,
        review: review,
        productId: this.organicFood.id,
        userFirstName: this.userReview.firstName,
        userLastName: this.userReview.lastName,
        pageFrom: ProductViewText.ORGANIC_FOOD,
        category: ProductViewText.ORGANIC_FOOD
      }
    });
  }

  get visibleReviews(): ProductReeviews[] {
    return this.showAllReviews
      ? this.displayedReviews
      : this.displayedReviews.slice(0, this.initialReviewCount);
  }

  toggleReviewsDisplay() {
    this.showAllReviews = !this.showAllReviews;
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }

  back() {
    this.location.back();
  }
}
