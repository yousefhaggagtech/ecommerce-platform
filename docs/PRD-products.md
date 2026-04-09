# Products Feature

## 1) Problem the Feature Solves

- Customers need to browse, search, and filter clothing products to find what they want efficiently.
- The business needs a way to manage its product catalog — adding, updating, and removing products with full variant support (sizes, stock per size).
- Products must support multiple images, gender targeting (men / women / unisex), and category classification to match the reference store (SIGHT Cairo).

---

## 2) Scope — Project Boundaries for this Feature

**In Scope:**
- Product creation, update, soft-delete (Admin only)
- Fetch all products with filtering (category, gender, price range), search (by name), sorting, and pagination
- Fetch single product by ID
- Product variants — each product has multiple sizes, each size has its own stock quantity
- Multiple images per product (Cloudinary URLs)
- Category and gender classification

**Out of Scope:**
- Product reviews and ratings
- Wishlist / favorites
- Related products / recommendations
- Inventory alerts or low-stock notifications
- Bulk product import (CSV / Excel)
- Product discounts and coupon codes

---

## 3) Deliverables

**Backend:**

| Deliverable | Description |
|---|---|
| `GET /api/products` | Fetch all products — supports filter, search, sort, pagination |
| `GET /api/products/:id` | Fetch a single product by ID |
| `POST /api/products` | Create a new product (Admin only) |
| `PATCH /api/products/:id` | Update an existing product (Admin only) |
| `DELETE /api/products/:id` | Soft-delete a product (Admin only) |
| `Product` Mongoose Model | Schema with variants, images, category, gender, slug |
| `product.controller.ts` | Handler logic for all product endpoints |
| `product.routes.ts` | Express router wiring routes to controllers |

---

## 4) User Stories

- "As a customer, I want to browse all products so I can discover what the store offers."
- "As a customer, I want to filter products by category and gender so I can find relevant items quickly."
- "As a customer, I want to search products by name so I can find a specific item."
- "As a customer, I want to see a product's available sizes and their stock so I know what I can order."
- "As an admin, I want to add new products with images and size variants so I can keep the catalog up to date."
- "As an admin, I want to update a product's details so I can correct information or adjust stock."
- "As an admin, I want to soft-delete a product so it disappears from the storefront without losing its data."

---

## 5) Functional Requirements

### 5.1 Get All Products

**Description:** Returns a paginated list of active products with optional filtering and search.

**Preconditions:**
- No authentication required.

**Main Flow:**
1. Client sends `GET /api/products` with optional query params.
2. System builds a dynamic MongoDB query based on provided filters.
3. System returns paginated results with metadata.

**Query Parameters:**

| Param | Type | Example | Description |
|---|---|---|---|
| `category` | string | `denim` | Filter by category slug |
| `gender` | string | `women` | Filter by gender — men / women / unisex |
| `minPrice` | number | `500` | Minimum price filter |
| `maxPrice` | number | `2000` | Maximum price filter |
| `search` | string | `blue jeans` | Search by product name (case-insensitive) |
| `sort` | string | `price_asc` | Options: `price_asc`, `price_desc`, `newest` |
| `page` | number | `2` | Page number — default: 1 |
| `limit` | number | `12` | Results per page — default: 12, max: 50 |

**Response:**
```json
{
  "status": "success",
  "results": 12,
  "pagination": {
    "currentPage": 1,
    "totalPages": 4,
    "totalProducts": 45
  },
  "data": {
    "products": []
  }
}
```

**Business Rules:**
- BR-001: Only products with `isActive: true` are returned.
- BR-002: Search is case-insensitive using MongoDB `$regex`.
- BR-003: Default sort is newest first (`createdAt: -1`).
- BR-004: Results per page are capped at 50 to prevent large payloads.

---

### 5.2 Get Single Product

**Description:** Returns full details of one product including all variants and images.

**Preconditions:**
- No authentication required.

**Main Flow:**
1. Client sends `GET /api/products/:id`.
2. System finds the product by ID where `isActive: true`.
3. System returns the full product document.

**Alternative Flows:**
- A1: Invalid or non-existent ID → `404 Not Found` — `"Product not found"`

---

### 5.3 Create Product

**Description:** Allows an admin to add a new product to the catalog.

**Preconditions:**
- User must be authenticated as Admin.

**Main Flow:**
1. Admin submits product data including name, price, category, gender, images, and variants.
2. System validates all required fields.
3. System generates a unique `slug` from the product name.
4. System saves the product with `isActive: true`.
5. System returns the created product with `201 Created`.

**Alternative Flows:**
- A1: Missing required fields → `400 Bad Request`
- A2: Duplicate slug → System appends a unique suffix automatically

**Postconditions:**
- Product is stored in the database and immediately visible in the storefront.

**Business Rules:**
- BR-005: `slug` must be unique and URL-friendly (lowercase, hyphenated).
- BR-006: At least one size variant is required.
- BR-007: Price must be greater than 0.
- BR-008: At least one image URL is required.

**Data Requirements:**
```json
{
  "name": "Low Waist True Blue Women Jeans",
  "price": 1900,
  "compareAtPrice": 2200,
  "category": "denim",
  "gender": "women",
  "description": "Optional product description",
  "images": ["https://cloudinary.com/..."],
  "variants": [
    { "size": "S", "stock": 10 },
    { "size": "M", "stock": 5 },
    { "size": "L", "stock": 0 }
  ]
}
```

---

### 5.4 Update Product

**Description:** Allows an admin to update any field of an existing product.

**Preconditions:**
- User must be authenticated as Admin.
- Product must exist.

**Main Flow:**
1. Admin submits partial or full update payload.
2. System validates the provided fields.
3. System updates only the provided fields (partial update via `PATCH`).
4. System returns the updated product.

**Alternative Flows:**
- A1: Product not found → `404 Not Found`
- A2: Invalid data → `400 Bad Request`

**Business Rules:**
- BR-009: `PATCH` is used — only provided fields are updated, others remain unchanged.
- BR-010: If `name` is updated, `slug` is regenerated automatically.

---

### 5.5 Delete Product (Soft Delete)

**Description:** Hides a product from the storefront without removing it from the database.

**Preconditions:**
- User must be authenticated as Admin.
- Product must exist.

**Main Flow:**
1. Admin sends `DELETE /api/products/:id`.
2. System sets `isActive: false` on the product document.
3. System returns `204 No Content`.

**Alternative Flows:**
- A1: Product not found → `404 Not Found`

**Business Rules:**
- BR-011: Products are never hard-deleted — `isActive: false` acts as a soft delete.
- BR-012: Soft-deleted products are excluded from all customer-facing queries automatically.

---

## 6) Non-Functional Requirements

- All write operations (create, update, delete) require Admin role — enforced by `protect` + `restrictTo("admin")` middleware.
- `GET` endpoints are fully public — no authentication required.
- Product list query must respond in under **200ms** for up to 1,000 products.
- Pagination must always be applied — returning all products in a single response is not permitted.
- Slug generation must sanitize special characters, Arabic characters, and spaces into a URL-safe string.
- MongoDB indexes are applied on `category`, `gender`, `price`, and `isActive` for query performance.

---

## 7) Acceptance Criteria

```
✅ GET  /api/products                          → 200 + paginated list
✅ GET  /api/products?category=denim           → 200 + filtered by category
✅ GET  /api/products?gender=women             → 200 + filtered by gender
✅ GET  /api/products?minPrice=500&maxPrice=2000 → 200 + price range results
✅ GET  /api/products?search=blue              → 200 + matched results
✅ GET  /api/products?sort=price_asc           → 200 + sorted ascending
✅ GET  /api/products?page=2&limit=12          → 200 + correct page
✅ GET  /api/products/:id (valid id)           → 200 + full product data
✅ GET  /api/products/:id (invalid id)         → 404
✅ POST /api/products (admin token)            → 201 + created product with slug
✅ POST /api/products (no token)               → 401
✅ POST /api/products (customer token)         → 403
✅ POST /api/products (missing required field) → 400
✅ PATCH /api/products/:id (admin)             → 200 + updated product
✅ PATCH /api/products/:id (name updated)      → slug regenerated automatically
✅ DELETE /api/products/:id (admin)            → 204
✅ Soft-deleted product absent from GET list   → confirmed not returned
```

---

## 8) Priority

🔴 **Must-Have** — Products are the core of the e-commerce experience. Without them, Cart and Orders cannot be built.
