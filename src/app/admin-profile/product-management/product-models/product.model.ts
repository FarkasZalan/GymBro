// this model is for the searching
// this contains basic information for each product 

import { ProductPrice } from "./product-price.model";

// what necessary for the serachbar
export interface Product {
    // if click on the item need to navigate to the product page
    id: string;

    // Food supliment, Organic Food, Clothes or Accessories
    category: string;

    // diplay in the searching result
    productName: string;
    productPrices: ProductPrice[];
    description: string;
}