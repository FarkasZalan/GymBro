import { trigger, state, style, transition, animate } from '@angular/animations';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { OrganicFood } from '../../../admin-profile/product-management/product-models/organic-food';
import { ProductViewText } from '../../../admin-profile/product-management/product-view-texts';
import { Router, ActivatedRoute } from '@angular/router';
import { DocumentHandlerService } from '../../../document.handler.service';
import { ProductService } from '../../product.service';
import { ProductPrice } from '../../../admin-profile/product-management/product-models/product-price.model';

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
    ]),
  ]
})
export class OrganicFoodPageComponent implements OnInit {
  organicFood: OrganicFood;
  selectedQuantityInProduct: number = 0;
  productViewText = ProductViewText;

  selectedPrice: number = 0;
  selectedImage: string = '';

  // Flavor and Allergens
  availableFlavors: string[] = [];
  selectedFlavor: string = '';
  allergens: string[] = [];

  isCollapsedDescription: boolean = true;
  isCollapsedIngredients: boolean = true;
  isCollapsedActiveIngredients: boolean = true;
  isCollapsedNutritionTable: boolean = true;
  isFlavorDropdownOpen: boolean = false;

  relatedProducts: OrganicFood[] = [];

  unitPrice: number = 0;
  cartQuantity: number = 1;
  loyaltyPoints: number = 0;

  productIsInStock: boolean = true;
  productStock: number = 0;

  errorMessageStock: boolean = false;

  constructor(private router: Router, private route: ActivatedRoute, private documentHandler: DocumentHandlerService, private changeDetector: ChangeDetectorRef, private location: Location, private productService: ProductService) { }

  ngOnInit(): void {
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

      prices: [],
      useUnifiedImage: false,

      productReviews: []
    }

    this.route.params.subscribe(params => {
      // get the food supliment product by id
      this.documentHandler.getInnerDocumentByID("products", ProductViewText.ORGANIC_FOOD, "allProduct", params['productId']).subscribe(async (organicFood: OrganicFood) => {
        // make a copy from the object
        this.organicFood = { ...organicFood };
        this.allergens = organicFood.allergens;
        this.availableFlavors = organicFood.flavors;
        this.selectedFlavor = this.availableFlavors[0];

        this.selectedQuantityInProduct = this.getDefaultPrice(organicFood).quantityInProduct;
        this.selectedPrice = this.getDefaultPrice(organicFood).productPrice;
        this.loyaltyPoints = Math.round(this.selectedPrice / 100);
        this.selectedImage = this.getDefaultPrice(organicFood).productImage;

        if (organicFood.productCategory === ProductViewText.DRINKS || organicFood.productCategory === ProductViewText.HEALTHY_SNACKS) {
          this.getAvailableFlavors();
        }

        if (this.getDefaultPrice(organicFood).productStock === 0) {
          this.productIsInStock = false;
        } else {
          this.productIsInStock = true;
        }
        this.getUnitPrice();

        await this.loadRelatedProducts();
      });
    });
  }

  // Function to get unique quantities for display
  getUniqueQuantities() {
    return Array.from(new Set(this.organicFood.prices.map(price => price.quantityInProduct)));
  }

  getAvailableFlavors() {
    const filteredPrices = this.organicFood.prices.filter(price => price.quantityInProduct === this.selectedQuantityInProduct);
    this.availableFlavors = Array.from(new Set(filteredPrices.map(price => price.productFlavor)));
    this.selectedFlavor = this.availableFlavors[0];
    this.updateSelectedPriceAndStock();
  }

  // Method to get the default price for a the products
  getDefaultPrice(organicFood: OrganicFood) {
    return organicFood.prices.find(price => price.setAsDefaultPrice);
  }

  // navigateto the product page
  goToProductPage(productId: string) {
    this.router.navigate(['product/' + ProductViewText.ORGANIC_FOOD + '/' + productId])
  }

  selectQuantity(selectedQuantity: number) {
    this.selectedQuantityInProduct = selectedQuantity;
    this.selectedPrice = this.getPriceBasedOnQuantity(this.organicFood, selectedQuantity).productPrice;
    this.loyaltyPoints = Math.round(this.selectedPrice / 100);
    this.selectedImage = this.getPriceBasedOnQuantity(this.organicFood, selectedQuantity).productImage;

    this.getAvailableFlavors();

    if (this.getPriceBasedOnQuantity(this.organicFood, selectedQuantity).productStock === 0) {
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
    let selectedPriceObject: ProductPrice;

    if (this.organicFood.productCategory === ProductViewText.DRINKS || this.organicFood.productCategory === ProductViewText.HEALTHY_SNACKS) {
      selectedPriceObject = this.organicFood.prices.find(price =>
        price.quantityInProduct === this.selectedQuantityInProduct &&
        price.productFlavor === this.selectedFlavor
      );
    } else {
      selectedPriceObject = this.organicFood.prices.find(price =>
        price.quantityInProduct === this.selectedQuantityInProduct
      );
    }

    if (selectedPriceObject) {
      this.selectedPrice = selectedPriceObject.productPrice;
      this.productStock = selectedPriceObject.productStock;
      this.loyaltyPoints = Math.round(this.selectedPrice / 100);
      this.productIsInStock = selectedPriceObject.productStock > 0;
      this.selectedImage = selectedPriceObject.productImage;
    }
  }

  getPriceBasedOnQuantity(organicFood: OrganicFood, selectedQuantity: number) {
    return organicFood.prices.find(priceObj => priceObj.quantityInProduct === selectedQuantity);
  }

  getUnitPrice() {
    let quantityInKg: number;
    if (this.organicFood.dosageUnit === this.productViewText.GRAM) {
      // Convert grams to kilograms (1000 grams = 1 kg)
      quantityInKg = this.selectedQuantityInProduct / 1000;
    } else if (this.organicFood.dosageUnit === this.productViewText.POUNDS) {
      // Convert pounds to kilograms (1 lb ≈ 0.4536 kg)
      quantityInKg = this.selectedQuantityInProduct * 0.4536;
    } else if (this.organicFood.dosageUnit === this.productViewText.PIECES || this.organicFood.dosageUnit === this.productViewText.CAPSULE) {
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
    this.productService.getRelatedProducts(this.organicFood.id, this.organicFood.productCategory, ProductViewText.ORGANIC_FOOD).subscribe((relatedProducts: OrganicFood[]) => {
      // Create a Set to track unique blog id
      const existingIds = new Set<string>();

      // Add IDs of the related products to the Set
      relatedProducts.forEach(product => existingIds.add(product.id!));

      // Handle related products based on their count
      if (relatedProducts.length > 0) {
        this.relatedProducts = relatedProducts; // Set the found related products

        // if there are not found 6 related products
        if (relatedProducts.length < 6) {
          existingIds.add(this.organicFood.id);

          const remainingCount = 6 - relatedProducts.length;

          this.productService.getRandomProducts(this.organicFood.id, remainingCount, ProductViewText.ORGANIC_FOOD).subscribe((randomProducts: OrganicFood[]) => {
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
        this.productService.getRandomProducts(this.organicFood.id, 6, ProductViewText.ORGANIC_FOOD).subscribe((randomBlogs: OrganicFood[]) => {
          this.relatedProducts = randomBlogs; // Set the random products as related
        });
      }
    });
  }

  addToCart() {
    if (this.cartQuantity > 1) {
      if (this.getPriceBasedOnQuantity(this.organicFood, this.selectedQuantityInProduct).productStock < this.cartQuantity) {
        this.errorMessageStock = true;
        this.productStock = this.getPriceBasedOnQuantity(this.organicFood, this.selectedQuantityInProduct).productStock;
      } else {
        this.errorMessageStock = false;
      }
    }
  }

  openLoyalityProgram() {
    this.router.navigate(['product/loyaltyProgram']);
  }

  back() {
    this.location.back();
  }
}
