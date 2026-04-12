# Orders Feature

## 1) Problem the Feature Solves

- Customers need a way to place orders for products they have selected, with a complete record of what was purchased, at what price, and to which address.
- The business needs full order visibility — tracking status from placement through delivery.
- Stock must be decremented automatically when an order is placed to prevent overselling.
- Order items must store a price snapshot at the time of purchase — so future product price changes never affect historical orders.

---

## 2) Scope — Project Boundaries for this Feature

**In Scope:**
- Place a new order (authenticated customers only)
- Automatic stock decrement per size variant on order placement
- Fetch current user's orders
- Fetch single order details (owner or admin)
- Admin: fetch all orders
- Admin: update order status
- Price snapshot stored on each order item at time of purchase

**Out of Scope:**
- Payment processing (Stripe — separate feature)
- Order cancellation by customer
- Refunds and returns
- Order confirmation emails
- Real-time order tracking
- Discount codes and coupons

---

## 3) Deliverables

**Backend:**

| Deliverable | Description |
|---|---|
| `POST /api/orders` | Place a new order — decrements stock |
| `GET /api/orders/my-orders` | Get all orders for the current user |
| `GET /api/orders/:id` | Get a single order (owner or admin) |
| `GET /api/orders` | Get all orders — Admin only |
| `PUT /api/orders/:id/status` | Update order status — Admin only |
| `Order` Mongoose Model | Schema with items, snapshot prices, status, address |
| `order.controller.ts` | Handler logic for all order endpoints |
| `order.routes.ts` | Express router wiring routes to controllers |

---

## 4) User Stories

- "As a customer, I want to place an order so I can purchase the items in my cart."
- "As a customer, I want to view my order history so I can track what I have purchased."
- "As a customer, I want to view a single order's details so I can see exactly what I ordered."
- "As an admin, I want to view all orders so I can manage fulfillment."
- "As an admin, I want to update an order's status so customers know when their order is shipped or delivered."

---

## 5) Functional Requirements

### 5.1 Place Order

**Description:** Creates a new order from the customer's selected cart items.

**Preconditions:**
- User must be authenticated as a customer.
- All products in the order must exist and be active.
- Each requested size must have sufficient stock.

**Main Flow:**
1. Customer submits order items and a shipping address.
2. System validates each product exists and is active.
3. System validates stock is sufficient for each requested size variant.
4. System captures a **price snapshot** from the current product price.
5. System calculates `totalPrice` from snapshots.
6. System decrements stock for each size variant atomically.
7. System creates the order with `status: "pending"`.
8. System returns the created order with `201 Created`.

**Alternative Flows:**
- A1: Product not found or inactive → `404 Not Found` — `"Product not found"`
- A2: Insufficient stock for a size → `400 Bad Request` — `"Insufficient stock for size M"`
- A3: Empty items array → `400 Bad Request` — `"Order must contain at least one item"`

**Postconditions:**
- Order is saved in the database.
- Stock is decremented for each ordered size variant.
- Order status is `"pending"` awaiting payment.

**Business Rules:**
- BR-001: `unitPrice` on each order item is snapshotted from `product.price` at order time — never recalculated later.
- BR-002: Stock decrement must happen atomically — use MongoDB `$inc` to prevent race conditions.
- BR-003: `totalPrice` is the sum of `(unitPrice - discount) * quantity` across all items.
- BR-004: Orders can only be placed by authenticated customers — not guests.

**Data Requirements:**
```json
{
  "items": [
    {
      "productId": "64f1a2b3c4d5e6f7a8b9c0d1",
      "size": "M",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "firstName": "Yousef",
    "lastName": "Haggag",
    "phone": "01012345678",
    "street": "23 Kasr El Nile",
    "city": "Cairo",
    "governorate": "Cairo"
  }
}
```

---

### 5.2 Get My Orders

**Description:** Returns all orders placed by the currently authenticated user.

**Preconditions:**
- User must be authenticated.

**Main Flow:**
1. System queries orders where `user === req.user._id`.
2. System returns orders sorted by `createdAt` descending (newest first).
3. Each order includes basic product info (name, image) via populate.

**Alternative Flows:**
- A1: No orders found → `200 OK` with empty array (not a 404)

**Business Rules:**
- BR-005: A customer can only see their own orders — never another user's.

---

### 5.3 Get Single Order

**Description:** Returns full details of one order.

**Preconditions:**
- User must be authenticated.
- User must be the order owner OR an admin.

**Main Flow:**
1. System finds the order by ID.
2. System checks the requester is the owner or an admin.
3. System returns the full order with populated product details.

**Alternative Flows:**
- A1: Order not found → `404 Not Found`
- A2: Requester is not the owner and not admin → `403 Forbidden`

---

### 5.4 Get All Orders (Admin)

**Description:** Returns all orders in the system for admin management.

**Preconditions:**
- User must be authenticated as Admin.

**Main Flow:**
1. System queries all orders sorted by `createdAt` descending.
2. System returns paginated results with user and product details populated.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `status` | string | Filter by: `pending`, `paid`, `shipped`, `delivered`, `cancelled` |
| `page` | number | Page number — default: 1 |
| `limit` | number | Results per page — default: 20 |

---

### 5.5 Update Order Status (Admin)

**Description:** Allows an admin to progress an order through its lifecycle.

**Preconditions:**
- User must be authenticated as Admin.
- Order must exist.

**Main Flow:**
1. Admin submits the new status.
2. System validates the status value is allowed.
3. System updates the order status.
4. System returns the updated order.

**Alternative Flows:**
- A1: Invalid status value → `400 Bad Request`
- A2: Order not found → `404 Not Found`

**Business Rules:**
- BR-006: Allowed status values are `pending`, `paid`, `shipped`, `delivered`, `cancelled`.
- BR-007: Status update is Admin only — customers cannot change their order status.

**Order Status Lifecycle:**
```
pending → paid → shipped → delivered
                          ↘ cancelled
```

---

## 6) Non-Functional Requirements

- Stock decrement must use MongoDB `$inc` operator to handle concurrent orders safely.
- Price snapshot must be captured at order creation time and never mutated afterward.
- `GET /api/orders/my-orders` must only return the authenticated user's own orders — enforced at the query level.
- All order endpoints require authentication — there are no public order routes.
- Admin routes are additionally protected by `restrictTo("admin")`.

---

## 7) Acceptance Criteria

```
✅ POST /api/orders (valid payload)              → 201 + order with snapshots
✅ POST /api/orders (out of stock size)          → 400 "Insufficient stock"
✅ POST /api/orders (invalid productId)          → 404 "Product not found"
✅ POST /api/orders (empty items)                → 400
✅ POST /api/orders (no token)                   → 401
✅ GET  /api/orders/my-orders                    → 200 + user's orders only
✅ GET  /api/orders/my-orders (no orders yet)    → 200 + empty array
✅ GET  /api/orders/:id (owner)                  → 200 + full order details
✅ GET  /api/orders/:id (different user)         → 403
✅ GET  /api/orders/:id (invalid id)             → 404
✅ GET  /api/orders (admin token)                → 200 + all orders paginated
✅ GET  /api/orders (customer token)             → 403
✅ PUT  /api/orders/:id/status (admin)           → 200 + updated status
✅ PUT  /api/orders/:id/status (invalid status)  → 400
✅ Stock is decremented after order placement    → confirmed in DB
✅ unitPrice in order matches product price      → snapshot confirmed
```

---

## 8) Priority

🔴 **Must-Have** — Orders are the core transaction of the platform. Without them the business cannot operate.