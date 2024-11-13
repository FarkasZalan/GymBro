import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FoodSupliment } from '../../../admin-profile/product-management/product-models/food-supliment.model';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentHandlerService } from '../../../document.handler.service';
import { ProductViewText } from '../../../admin-profile/product-management/product-view-texts';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Location } from '@angular/common';
import { Vitamin } from '../../../admin-profile/product-management/product-models/vitamin.model';
import { ProductService } from '../../product.service';
import { ProductReeviews } from '../../../admin-profile/product-management/product-models/product-reviews.model';
import { Timestamp } from 'firebase/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AuthService } from '../../../auth/auth.service';
import { User } from '../../../user/user.model';
import { MatDialog } from '@angular/material/dialog';
import { ReviewHandleComponent } from '../../review-handle/review-handle.component';

@Component({
  selector: 'app-food-supliment-page',
  templateUrl: './food-supliment-page.component.html',
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
    ]),
  ]
})
export class FoodSuplimentPageComponent implements OnInit {
  foodSupliment: FoodSupliment;
  selectedQuantityInProduct: number = 0;
  productViewText = ProductViewText;

  selectedPrice: number = 0;
  selectedImage: string = '';

  // Flavors, viatmins and Allergens
  availableFlavors: string[] = [];
  selectedFlavor: string = '';
  allergens: string[] = [];
  vitaminList: Vitamin[] = [];

  isCollapsedDescription: boolean = true;
  isCollapsedIngredients: boolean = true;
  isCollapsedActiveIngredients: boolean = true;
  isCollapsedNutritionTable: boolean = true;
  isFlavorDropdownOpen: boolean = false;

  relatedProducts: FoodSupliment[] = [];

  unitPrice: number = 0;
  cartQuantity: number = 1;
  loyaltyPoints: number = 0;

  productIsInStock: boolean = true;
  productStock: number = 0;

  errorMessageStock: boolean = false;

  // reviews
  averageRating: number = 0;
  reviews: ProductReeviews[] = [
    // Example data; replace with your actual reviews data
    { rating: 5, title: "Great product!", text: "Loved it!", date: Timestamp.now() },
    { rating: 4, title: "Good", text: "Works well.", date: Timestamp.now() },
    { rating: 1, title: "Okay", text: "Average quality.", date: Timestamp.now() },
    { rating: 4, title: "Good", text: "Works well.", date: Timestamp.now() },
    { rating: 2, title: "Okay", text: "Average quality.", date: Timestamp.now() },
  ];
  userLoggedIn: boolean = false;
  userReview: User;
  userLoggedOutError: boolean = false;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private documentHandler: DocumentHandlerService,
    private changeDetector: ChangeDetectorRef,
    private location: Location,
    private productService: ProductService,
    private auth: AngularFireAuth,
    private authService: AuthService,
    private dialog: MatDialog) { }

  ngOnInit(): void {
    this.foodSupliment = {
      id: "",
      productName: "",
      productCategory: "",
      smallDescription: "",
      ingredients: "",
      description: "",
      dosageUnit: "",
      dailyDosage: null,
      flavors: [],

      safeForConsumptionDuringBreastfeeding: true,
      safeForConsumptionDuringPregnancy: true,

      nutritionalTable: null,

      proteinType: "",
      allergens: [],

      vitaminList: [],
      genderList: [],

      prices: [],
      useUnifiedImage: false,

      productReviews: []
    }

    // check if user logged in for reviews
    this.auth.authState.subscribe((userAuth) => {
      if (userAuth) {
        this.userLoggedIn = true;
        this.authService.getCurrentUser(userAuth.uid).subscribe((currentUser: User) => {
          this.userReview = currentUser;
          if (this.userReview === undefined) {
            this.userLoggedIn = false; // User is logged out
          }
        });
      } else {
        this.userLoggedIn = false; // User is logged out
      }
    });

    this.route.params.subscribe(params => {
      // get the food supliment product by id
      this.documentHandler.getInnerDocumentByID("products", ProductViewText.FOOD_SUPLIMENTS, "allProduct", params['productId']).subscribe(async (foodSupliment: FoodSupliment) => {
        // make a copy from the object
        this.foodSupliment = { ...foodSupliment };
        this.allergens = foodSupliment.allergens;
        this.vitaminList = foodSupliment.vitaminList;

        this.selectedQuantityInProduct = this.getDefaultPrice(foodSupliment).quantityInProduct;
        this.selectedPrice = this.getDefaultPrice(foodSupliment).productPrice;
        this.loyaltyPoints = Math.round(this.selectedPrice / 100);
        this.selectedImage = this.getDefaultPrice(foodSupliment).productImage;
        this.getAvailableFlavors();

        if (this.getDefaultPrice(foodSupliment).productStock === 0) {
          this.productIsInStock = false;
        } else {
          this.productIsInStock = true;
        }
        this.getUnitPrice();

        this.calculateAverageRating();
        await this.loadRelatedProducts();
      });
    });
  }

  // Function to get unique quantities for display
  getUniqueQuantities() {
    return Array.from(new Set(this.foodSupliment.prices.map(price => price.quantityInProduct)));
  }

  // Method to get the default price for a the products
  getDefaultPrice(foodSupliment: FoodSupliment) {
    return foodSupliment.prices.find(price => price.setAsDefaultPrice);
  }

  // navigateto the product page
  goToProductPage(productId: string) {
    this.router.navigate(['product/' + ProductViewText.FOOD_SUPLIMENTS + '/' + productId])
  }

  getAvailableFlavors() {
    const filteredPrices = this.foodSupliment.prices.filter(price => price.quantityInProduct === this.selectedQuantityInProduct);
    this.availableFlavors = Array.from(new Set(filteredPrices.map(price => price.productFlavor)));
    this.selectedFlavor = this.availableFlavors[0];
    this.updateSelectedPriceAndStock();
  }

  selectQuantity(selectedQuantity: number) {
    this.selectedQuantityInProduct = selectedQuantity;
    this.selectedPrice = this.getPriceBasedOnQuantity(this.foodSupliment, selectedQuantity).productPrice;
    this.loyaltyPoints = Math.round(this.selectedPrice / 100);
    this.selectedImage = this.getPriceBasedOnQuantity(this.foodSupliment, selectedQuantity).productImage;

    this.getAvailableFlavors();

    if (this.getPriceBasedOnQuantity(this.foodSupliment, selectedQuantity).productStock === 0) {
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
    const selectedPriceObject = this.foodSupliment.prices.find(price =>
      price.quantityInProduct === this.selectedQuantityInProduct &&
      price.productFlavor === this.selectedFlavor
    );

    if (selectedPriceObject) {
      this.selectedPrice = selectedPriceObject.productPrice;
      this.productStock = selectedPriceObject.productStock;
      this.loyaltyPoints = Math.round(this.selectedPrice / 100);
      this.productIsInStock = selectedPriceObject.productStock > 0;
      this.selectedImage = selectedPriceObject.productImage;
    }
  }

  getPriceBasedOnQuantity(foodSupliment: FoodSupliment, selectedQuantity: number) {
    return foodSupliment.prices.find(priceObj => priceObj.quantityInProduct === selectedQuantity);
  }

  getUnitPrice() {
    let quantityInKg: number;
    if (this.foodSupliment.dosageUnit === this.productViewText.GRAM) {
      // Convert grams to kilograms (1000 grams = 1 kg)
      quantityInKg = this.selectedQuantityInProduct / 1000;
    } else if (this.foodSupliment.dosageUnit === this.productViewText.POUNDS) {
      // Convert pounds to kilograms (1 lb ≈ 0.4536 kg)
      quantityInKg = this.selectedQuantityInProduct * 0.4536;
    } else if (this.foodSupliment.dosageUnit === this.productViewText.PIECES || this.foodSupliment.dosageUnit === this.productViewText.CAPSULE) {
      quantityInKg = this.selectedPrice / this.selectedQuantityInProduct;
    } else {
      // 1000 ml = 1 liter
      quantityInKg = this.selectedQuantityInProduct / 1000;
    }

    this.unitPrice = this.selectedPrice / quantityInKg;
    this.unitPrice = Math.round(this.unitPrice);
    if (this.unitPrice < 1) {
      this.unitPrice = 1;
    }
  }

  toggleCollapsedDescription() {
    this.isCollapsedDescription = !this.isCollapsedDescription;

    if (!this.isCollapsedDescription) {
      this.isCollapsedIngredients = true;
      this.isCollapsedActiveIngredients = true;
      this.isCollapsedNutritionTable = true;
    }
  }

  toggleCollapsedIngredients() {
    this.isCollapsedIngredients = !this.isCollapsedIngredients;

    if (!this.isCollapsedIngredients) {
      this.isCollapsedDescription = true;
      this.isCollapsedActiveIngredients = true;
      this.isCollapsedNutritionTable = true;
    }
  }

  toggleCollapsedActiveIngredients() {
    this.isCollapsedActiveIngredients = !this.isCollapsedActiveIngredients;

    if (!this.isCollapsedActiveIngredients) {
      this.isCollapsedDescription = true;
      this.isCollapsedIngredients = true;
      this.isCollapsedNutritionTable = true;
    }
  }

  toggleCollapsedNutritionTable() {
    this.isCollapsedNutritionTable = !this.isCollapsedNutritionTable;

    if (!this.isCollapsedActiveIngredients) {
      this.isCollapsedDescription = true;
      this.isCollapsedIngredients = true;
      this.isCollapsedActiveIngredients = true;
    }
  }

  toggleFlavorDropdown() {
    this.isFlavorDropdownOpen = !this.isFlavorDropdownOpen;
  }

  // get related blog list
  loadRelatedProducts(): void {
    // Fetch related blogs based on tags and language
    this.productService.getRelatedProducts(this.foodSupliment.id, this.foodSupliment.productCategory, ProductViewText.FOOD_SUPLIMENTS).subscribe((relatedProducts: FoodSupliment[]) => {
      // Create a Set to track unique blog id
      const existingIds = new Set<string>();

      // Add IDs of the related products to the Set
      relatedProducts.forEach(product => existingIds.add(product.id!));

      // Handle related products based on their count
      if (relatedProducts.length > 0) {
        this.relatedProducts = relatedProducts; // Set the found related products

        // if there are not found 6 related products
        if (relatedProducts.length < 6) {
          existingIds.add(this.foodSupliment.id);

          const remainingCount = 6 - relatedProducts.length;

          this.productService.getRandomProducts(this.foodSupliment.id, remainingCount, ProductViewText.FOOD_SUPLIMENTS).subscribe((randomProducts: FoodSupliment[]) => {
            const uniqueRandomProducts = randomProducts.filter(product => !existingIds.has(product.id));

            // Add unique random products to the relatedProducts array and to existingIds
            uniqueRandomProducts.forEach(product => {
              relatedProducts.push(product);
              existingIds.add(product.id);
            });
          });
        }
      }
      else if (relatedProducts.length === 0) {
        // No related products found, fetch six random blogs
        this.productService.getRandomProducts(this.foodSupliment.id, 6, ProductViewText.FOOD_SUPLIMENTS).subscribe((randomBlogs: FoodSupliment[]) => {
          this.relatedProducts = randomBlogs; // Set the random products as related
        });
      }
    });
  }

  addToCart() {
    if (this.cartQuantity > 1) {
      if (this.getPriceBasedOnQuantity(this.foodSupliment, this.selectedQuantityInProduct).productStock < this.cartQuantity) {
        this.errorMessageStock = true;
        this.productStock = this.getPriceBasedOnQuantity(this.foodSupliment, this.selectedQuantityInProduct).productStock;
      } else {
        this.errorMessageStock = false;
      }
    }
  }

  openLoyalityProgram() {
    this.router.navigate(['product/loyaltyProgram']);
  }

  calculateAverageRating(): void {
    if (this.reviews.length > 0) {
      this.reviews.forEach(number => {
        this.averageRating += number.rating
      });
      this.averageRating = this.averageRating / this.reviews.length;
      this.averageRating = Math.round(this.averageRating * 100) / 100;
    } else {
      this.averageRating = 1;
    }
  }

  getRatingCount(star: number): number {
    return this.reviews.filter(review => review.rating === star).length;
  }

  getRatingPercentage(star: number): number {
    return (this.getRatingCount(star) / this.reviews.length) * 100;
  }

  gotoCreateNewRReview() {
    if (!this.userLoggedIn) {
      this.userLoggedOutError = true;
    } else {
      this.userLoggedOutError = false;
      this.dialog.open(ReviewHandleComponent, {
        data: {
          userId: this.userReview.id,
          productid: this.foodSupliment.id
        }
      });
    }
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }

  back() {
    this.location.back();
  }
}
