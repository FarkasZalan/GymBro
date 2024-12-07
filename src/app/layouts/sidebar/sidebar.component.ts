import { Component } from '@angular/core';
import { ProductViewText } from '../../admin-profile/product-management/product-view-texts';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  pageLinks = [
    {
      name: 'menu.foodSuplimentsMenu.foodSupliments',
      icon: 'flash-outline',
      route: '/product/' + ProductViewText.FOOD_SUPLIMENTS,
      image: '../../../assets/images/food-supliments-image.jpg'
    },
    {
      name: 'menu.organicFoodMenu.organicFood',
      icon: 'heart-outline',
      route: '/product/' + ProductViewText.ORGANIC_FOOD,
      image: '../../../assets/images/healthy-food-image.jpg'
    },
    {
      name: 'menu.clothingMenu.clothing',
      icon: 'pricetags-outline',
      route: '/product/' + ProductViewText.CLOTHES,
      image: '../../../assets/images/clothing-image.jpg'
    },
    {
      name: 'menu.accessoriesMenu.accessories',
      icon: 'shield-outline',
      route: '/product/' + ProductViewText.ACCESSORIES,
      image: '../../../assets/images/gym-accessories-image.jpg'
    }
  ];
  sidebarOpen: boolean = false;

  // Toggle Sidebar visibility
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;

    // Slight delay to ensure the sidebar closes before navigation
    setTimeout(() => {
    }, 300); // Time to close the sidebar
  }

  // Method to close the sidebar when a link is clicked
  closeSidebar() {
    this.sidebarOpen = false;

    // Slight delay to ensure the sidebar closes before navigation
    setTimeout(() => {
    }, 300); // Time to close the sidebar
  }
}
