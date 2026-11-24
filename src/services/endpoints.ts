/**
 * Planned REST contract for the production (Spring Boot + PostgreSQL) version.
 * Replace the bodies of the functions in services/index.ts with fetch() calls to these endpoints.
 *
 *  GET    /api/products?category=&q=&sort=&page=      catalogue
 *  GET    /api/products/{slug}                         product detail
 *  POST   /api/auth/register | /api/auth/login         Spring Security (JWT / session)
 *  GET    /api/me/orders, /api/orders/{id}/tracking    customer orders
 *  POST   /api/checkout                                create order + payment intent (payment gateway)
 *  POST   /api/payments/webhook                        gateway confirmation
 *  POST   /api/enquiries, /api/newsletter              forms
 *  Admin (ROLE_ADMIN):
 *  POST|PUT|DELETE /api/admin/products, POST /api/admin/uploads (cloud image storage)
 *  PATCH  /api/admin/orders/{id}/status | /payment | /tracking
 *  PUT    /api/admin/inventory/{productId}, /api/admin/settings, /api/admin/policies
 *  GET    /api/admin/reports/{daily|monthly|products|inventory}
 */
export const API_BASE = '/api'
