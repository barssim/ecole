# Payment Management API Documentation

## Overview
The Payment Management system provides REST endpoints for managing school invoices, payment notices, and payment history. This system is part of the ECOLE platform's finance module.

## Base URL
- Development: `http://localhost:8085/api`
- Production: `{API_GATEWAY_URL}/api`

## Endpoints

### Payment Notice Management

#### Get Current Payment Notice
**Endpoint:** `GET /paymentNotice`

**Query Parameters:**
- `studentName` (optional): Filter by student name

**Response:**
```json
{
  "id": 1,
  "invoiceNumber": "INV-2025-07-001",
  "invoiceDate": "2025-07-06",
  "dueDate": "2025-07-15",
  "studentName": "Yasmine El Idrissi",
  "className": "5ème année",
  "totalAmount": 1500,
  "currency": "MAD",
  "status": "pending",
  "paidDate": null
}
```

**Status Codes:**
- `200 OK`: Success
- `404 Not Found`: No pending invoice found

---

#### Get All Payment Notices
**Endpoint:** `GET /paymentNotices`

**Query Parameters:**
- `studentName` (optional): Filter by student name

**Response:**
```json
[
  {
    "id": 1,
    "invoiceNumber": "INV-2025-07-001",
    "invoiceDate": "2025-07-06",
    "dueDate": "2025-07-15",
    "studentName": "Yasmine El Idrissi",
    "className": "5ème année",
    "totalAmount": 1500,
    "currency": "MAD",
    "status": "pending",
    "paidDate": null
  }
]
```

---

#### Create Payment Notice
**Endpoint:** `POST /paymentNotices`

**Request Body:**
```json
{
  "studentName": "Yasmine El Idrissi",
  "className": "5ème année",
  "totalAmount": 1500,
  "currency": "MAD",
  "invoiceDate": "2025-07-06",
  "dueDate": "2025-07-15",
  "description": "Monthly tuition and materials"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "invoiceNumber": "INV-202507-001",
  "invoiceDate": "2025-07-06",
  "dueDate": "2025-07-15",
  "studentName": "Yasmine El Idrissi",
  "className": "5ème année",
  "totalAmount": 1500,
  "currency": "MAD",
  "status": "pending",
  "paidDate": null
}
```

**Status Codes:**
- `201 Created`: Success
- `400 Bad Request`: Invalid data
- `409 Conflict`: Duplicate entry

---

#### Update Payment Notice Status
**Endpoint:** `PATCH /paymentNotices/{id}/status`

**Request Body:**
```json
{
  "status": "paid"
}
```

**Valid Statuses:**
- `pending` - Invoice awaiting payment
- `paid` - Invoice has been paid
- `unpaid` - Invoice is unpaid
- `overdue` - Invoice is past due date

**Response:** `200 OK`
```json
{
  "id": 1,
  "invoiceNumber": "INV-2025-07-001",
  "invoiceDate": "2025-07-06",
  "dueDate": "2025-07-15",
  "studentName": "Yasmine El Idrissi",
  "className": "5ème année",
  "totalAmount": 1500,
  "currency": "MAD",
  "status": "paid",
  "paidDate": "2025-07-13"
}
```

---

### Payment History Management

#### Get All Payments
**Endpoint:** `GET /payments`

**Query Parameters:**
- `studentName` (optional): Filter by student name
- `className` (optional): Filter by class name

**Response:**
```json
[
  {
    "id": 1,
    "paymentDate": "2025-07-01",
    "studentName": "Yasmine El Idrissi",
    "className": "5ème année",
    "amount": 1500,
    "currency": "MAD",
    "method": "Cash",
    "reference": "PAY-2025-07-001",
    "notes": null
  },
  {
    "id": 2,
    "paymentDate": "2025-06-15",
    "studentName": "Yasmine El Idrissi",
    "className": "5ème année",
    "amount": 1200,
    "currency": "MAD",
    "method": "Card",
    "reference": "PAY-2025-06-001",
    "notes": null
  }
]
```

---

#### Record New Payment
**Endpoint:** `POST /payments`

**Request Body:**
```json
{
  "studentName": "Yasmine El Idrissi",
  "className": "5ème année",
  "amount": 1500,
  "currency": "MAD",
  "method": "Cash",
  "paymentDate": "2025-07-01",
  "reference": "PAY-2025-07-001",
  "notes": "Monthly payment for July"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "paymentDate": "2025-07-01",
  "studentName": "Yasmine El Idrissi",
  "className": "5ème année",
  "amount": 1500,
  "currency": "MAD",
  "method": "Cash",
  "reference": "PAY-2025-07-001",
  "notes": "Monthly payment for July"
}
```

**Status Codes:**
- `201 Created`: Success
- `400 Bad Request`: Invalid data (missing required fields, invalid amount)
- `409 Conflict`: Duplicate entry

---

### Invoice PDF Generation

#### Generate Invoice PDF
**Endpoint:** `POST /facture/generate`

**Request Body:**
```json
{
  "studentName": "Yasmine El Idrissi",
  "className": "5ème année",
  "items": [
    {
      "description": "Tuition Fee",
      "amount": 1000
    },
    {
      "description": "Materials",
      "amount": 300
    },
    {
      "description": "Transport",
      "amount": 200
    }
  ]
}
```

**Response:** `200 OK`
- Content-Type: `application/pdf`
- Body: PDF file binary

**Example cURL:**
```bash
curl -X POST "http://localhost:8085/api/facture/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "studentName": "Yasmine El Idrissi",
    "className": "5ème année",
    "items": [
      {"description": "Tuition", "amount": 1000},
      {"description": "Materials", "amount": 300}
    ]
  }' \
  --output facture.pdf
```

---

## Error Responses

### 400 Bad Request
```json
{
  "timestamp": "2025-07-06T10:15:30.000Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Student name is required",
  "path": "/api/payments"
}
```

### 404 Not Found
```json
{
  "timestamp": "2025-07-06T10:15:30.000Z",
  "status": 404,
  "error": "Not Found",
  "message": "Invoice not found",
  "path": "/api/paymentNotices/999"
}
```

### 409 Conflict
```json
{
  "timestamp": "2025-07-06T10:15:30.000Z",
  "status": 409,
  "error": "Conflict",
  "message": "This invoice already exists",
  "path": "/api/paymentNotices"
}
```

---

## Data Models

### PaymentNoticeDTO
```
{
  id: Integer
  invoiceNumber: String (auto-generated, format: INV-YYYYMM-XXXX)
  invoiceDate: LocalDate
  dueDate: LocalDate
  studentName: String (required)
  className: String
  totalAmount: Double (required, must be > 0)
  currency: String (default: "MAD")
  status: String (pending|paid|unpaid|overdue)
  paidDate: LocalDate (optional, auto-set when status = "paid")
  description: String (optional)
}
```

### PaymentDTO
```
{
  id: Integer
  studentName: String (required)
  className: String
  amount: Double (required, must be > 0)
  currency: String (default: "MAD")
  method: String (default: "unknown")
  paymentDate: LocalDate (default: today)
  reference: String (optional)
  notes: String (optional)
}
```

### InvoiceItemDTO
```
{
  label: String
  amount: Double
}
```

---

## Frontend Integration

### Using PaymentsPage Component

```jsx
import PaymentsPage from './pages/PaymentsPage';

// In your App.js or Router configuration:
<Route path="/finance/invoices" element={<PaymentsPage language={language} />} />
```

### Features
- Display current pending invoice
- Download invoice as PDF
- View payment history in a table
- Localized content (French, English, Arabic)
- Responsive design for mobile and desktop

---

## Configuration

### Environment Variables

**Frontend (.env)**
```
REACT_APP_API_GATEWAY_URL=http://localhost:8085
```

**Backend (application.yml)**
```yaml
spring:
  datasource:
    url: jdbc:mysql://mysql-fin:3306/finDB
    username: root
    password: ${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: update
```

---

## Database Schema

### tb_payment_notices
```sql
CREATE TABLE tb_payment_notices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  student_name VARCHAR(255) NOT NULL,
  class_name VARCHAR(255),
  total_amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'MAD',
  status VARCHAR(20) DEFAULT 'pending',
  description TEXT,
  paid_date DATE
);
```

### tb_payments
```sql
CREATE TABLE tb_payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_name VARCHAR(255) NOT NULL,
  class_name VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'MAD',
  method VARCHAR(50),
  payment_date DATE NOT NULL,
  reference VARCHAR(100),
  notes TEXT
);
```

---

## Testing

### Unit Tests
Test files are located in:
- `src/test/java/ma/solide/finance_manager/service/PaymentServiceTest.java`
- `src/test/java/ma/solide/finance_manager/service/PaymentNoticeServiceTest.java`

### Run Tests
```bash
cd finance-manager
mvn test
```

### Example Test Cases
- `testGetPaymentsByStudent()` - Verify payment retrieval by student
- `testRecordPaymentSuccess()` - Test recording new payments
- `testCreateNoticeSuccess()` - Test invoice creation
- `testUpdateNoticeStatusToPaid()` - Test status updates

---

## Example Usage

### cURL Examples

**Get current payment notice:**
```bash
curl -X GET "http://localhost:8085/api/paymentNotice?studentName=Yasmine%20El%20Idrissi" \
  -H "Authorization: Bearer {token}"
```

**Get payment history:**
```bash
curl -X GET "http://localhost:8085/api/payments?studentName=Yasmine%20El%20Idrissi" \
  -H "Authorization: Bearer {token}"
```

**Record a payment:**
```bash
curl -X POST "http://localhost:8085/api/payments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "studentName": "Yasmine El Idrissi",
    "className": "5ème année",
    "amount": 1500,
    "currency": "MAD",
    "method": "Cash",
    "paymentDate": "2025-07-01",
    "reference": "PAY-2025-07-001"
  }'
```

**Update invoice status:**
```bash
curl -X PATCH "http://localhost:8085/api/paymentNotices/1/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "status": "paid"
  }'
```

---

## Support & Troubleshooting

### Common Issues

**Issue: Database connection error**
- Ensure `mysql-fin` container is running
- Check `SPRING_DATASOURCE_URL` environment variable
- Verify database credentials in `application.yml`

**Issue: API endpoints returning 404**
- Verify the API Gateway is routing requests correctly
- Check that the finance-manager service is registered with Eureka
- Ensure the endpoint path is correct (should start with `/api`)

**Issue: PDF generation fails**
- Verify iTextPDF library is included in pom.xml
- Check that the request body contains valid invoice items
- Ensure student name and class name are provided

---

## Version History

### v1.0.0 (2025-07-06)
- Initial release
- Payment notice CRUD operations
- Payment history management
- PDF invoice generation
- Multilingual support (FR, EN, AR)
- Full test coverage

