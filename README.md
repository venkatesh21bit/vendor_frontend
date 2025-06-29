# 📦 Vendor -- ERP Supply Chain Management System — Frontend

Welcome to the **ERP UI Repository** for our intelligent supply chain management platform. This system streamlines stock tracking, order management, and delivery operations — tailored for Managers, Employees, and Retailers with a smart, role-based interface.

---

## 🌐 UI/UX Dashboards

Designed with usability, clarity, and efficiency in mind. Each user type gets a dedicated experience:

### 🧑‍💼 Manager Dashboard (Inventory Overview & Control)
- 📊 Real-time stock levels
- 🔔 Order alerts and auto-assignments
- 📈 Reports and analytics interface

### 👷 Employee Dashboard (Supply Operations)
- 📦 Assigned tasks and delivery schedules
- ✅ Status updates for order fulfillment
- 📡 Real-time instructions and reporting tools

### 🛒 Retailer Dashboard (Buyer Interaction Portal)
- 📝 Place orders from live stock
- 🚚 Track order fulfillment status
- ⚠️ Instant alerts on delays or confirmations

---

## 🛠️ Backend Overview (Handled Privately in Separate Repo)

> Built using Django and Django REST Framework — logic and automation powered from the backend.

### 🔄 Automatic Order Allocation
- Orders from retailers are auto-assigned to employees based on workload, shift, and proximity.

### 📦 Dynamic Stock Management
- Real-time supply task completion auto-updates stock levels.
- Reduces manual intervention & ensures live accuracy.

### 🔐 REST API Integration
- Secure, token-based endpoints.
- Fully modular and scalable for POS or ERP integration.

---

## 📦 IoT Edge-AI Package (IMX500)

> A smart hardware-vision interface that brings intelligence to package handling and verification.

### 🧠 Vision Capabilities
- **QR Code Detection**: For rapid box verification.
- **Defect Detection**: Identifies mismatched or damaged inventory.

### 🌐 Edge Communication
- AI runs on-device (Sony IMX500) with low latency.
- Uses MQTT/HTTP to send real-time insights to the backend.

---

## 💻 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** |  TypeScript, TailwindCSS, React |
| **Backend** | Django, Django REST Framework |
| **Database** | PostgreSQL |
| **IoT / AI** | IMX500, OpenCV, YOLOv5, MobileNet |
| **Deployment** | Docker, Gunicorn |

---

## 🚀 Getting Started

> Note: This repository is frontend only. 

```bash
# Clone repository
git clone https://github.com/Vendor-Innovate-Solutions/Vendor-frontend
cd Vendor-frontend

# Install dependencies (if React-based)
npm i

# Run in local server
npm run dev
