# GymBro Webshop & Blog (2024)

## Overview

GymBro is an advanced Angular-based application designed for fitness enthusiasts, featuring a comprehensive webshop and blog. Users can explore fitness-related products, engage with insightful blog posts, and enjoy a seamless shopping experience enhanced by loyalty rewards and interactive features. The application is fully responsive, ensuring optimal usability on any device.

### Key Features

#### General

- Responsive Design: Accessible and visually appealing on all devices.

- Paginated Navigation: Simplifies browsing for products, blogs, and orders.

- Deployed App: Accessible at https://gymbro-3b91b.web.app/.

#### - Webshop Features

- Product Display: Each product page includes:

- Reviews and likes from logged-in users.

- Related products based on category.

- Real-time stock sensitivity (users cannot purchase beyond available stock).

#### Purchase Options:

- Cash on delivery.

- Stripe integration for test mode payments via card or digital wallets (e.g., Apple Pay, Google Pay). Use Stripe test cards for transactions.

- Loyalty Program: Earn points on purchases; points can be redeemed for coupons.

- Receipts: After a successful purchase, users can view and print receipts.

#### Blog Features

Blog Interaction:

Users can browse and read fitness-related blogs.

Related blogs suggested based on tags.

Search and Filter: Advanced filtering options for blogs and products.

Content Curation: If fewer than six related items are found, random selections are displayed to fill the list.

User Functionality

Authentication:

Email verification required during registration (valid for 5 minutes, single-use tokens via SMTP).

Forgot password flow via Firebase Admin SDK for secure reset without logging in.

Address Management:

Shipping addresses for all users.

Billing addresses for company accounts.

Cart Management:

Add, modify, or delete products in the cart.

Checkout with pre-saved or custom addresses.

Restriction to one store’s products per order.

Profile Management:

Edit personal information.

View and manage loyalty points, order history, and addresses.

Admin Features

Account Access: Default admin account credentials:

Email: admin@gymbro.com

Password: admin123

Content Management:

Manage products (quantity, size, flavor/color-specific stock, pricing, and images).

Handle blogs (content, tags, and related settings).

Update and oversee orders with notifications for new reviews or orders.

Order Updates: Modify order statuses with one-click updates and notify customers via email about status changes.

Technical Details

Backend and Hosting

Firebase Authentication: Handles secure login and email verification.

Cloud Functions: Automates processes for:

Email handling (SMTP integration for verification and notifications).

Forgot password flow.

Stripe payment processing (including mock transactions).

Admin SDK: Provides secure management of user accounts for password resets and other operations.

Firebase Hosting: Efficiently deploys the application for public access.

Product Features for Admin

Assign unique pricing, stock levels, and images for each product variation (size, flavor, or color).

Default product images are used if no specific variation image is uploaded.

Application Highlights

Search and Filter

Intelligent search functionality for both products and blogs.

Dynamic filters to refine results based on user preferences.

Main Page

Display:

Discounted products.

Recently added products and blogs.

All content sorted by creation date for user relevance.

Customer Interaction

Engage with reviews by liking or posting feedback directly on product pages.

Loyal customers enjoy benefits through points and exclusive coupons.

Notifications and Emails

For Admins:

Receive notifications for unchecked reviews and orders.

Streamlined communication with users regarding order status updates.

For Users:

Automatic notifications for order placements and updates.

Receipts and loyalty point status directly accessible within the user profile.

Installation and Deployment

Clone the repository.

Install dependencies with npm install.

Configure Firebase and Stripe keys in the environment files.

Deploy the application with firebase deploy.

Developer Notes

Use only Stripe’s test card numbers for transactions in the demo environment.

Regular updates to enhance application performance and introduce new features are ongoing.

Thank you for exploring GymBro! If you have any questions or need support, feel free to reach out via the contact information provided in the deployed application.
