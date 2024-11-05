## Pickup WebApp

GitHub Repository: [Pickup](https://github.com/hardiktemp/pickup)

**Hosted on Render**

### Overview

This internal application streamlines the process of packing and dispatching orders. It enables packing staff to handle orders efficiently by managing order statuses through a defined workflow.

### Workflow

1. **Adding Orders**
   - Orders are initially added to the MongoDB database via an "Update Orders" button.
   - All new orders start with a status of `pending`.

2. **Order Fetching and Assignment**
   - When a packing staff member is ready to pack, they can fetch an order.
   - The system retrieves an order with `status = pending` and `assignedTo = null` and sends it to the client interface.

3. **Packing Confirmation or Skipping**
   - The packing staff (client) verifies that all products are packed correctly and sends a confirmation back to the server, along with a unique `bagId` for tracking.
   - If the order cannot be packed, the client provides a reason, and the order status is updated to `skipped`.

4. **Order Status Management**
   - Orders can have the following statuses:
     - **Pending**: Default status when an order is added, awaiting packing.
     - **Skipped**: The order could not be packed, with a reason provided.
     - **Completed**: Order successfully packed and assigned a `bagId`.
     - **ManualComplete**: Order marked complete manually, outside the regular workflow.

### Running the Application Locally

To run the application locally, follow these steps:

1. **Environment Setup**
   - In the root directory, create a `.env` file and include the following keys:
     ```plaintext
     JWT_SECRET=<your_jwt_secret>
     SHOPIFY_API_KEY=<your_shopify_api_key>
     PRIVATE_KEY=<your_private_key>
     CLIENT_EMAIL=<your_client_email>
     MONGODB_URI=<your_mongodb_uri>
     ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   tsc -b
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Start the Application**
   - In the root directory, start the backend server:
     ```bash
     nodemon backend/dist/index.js
     ```
