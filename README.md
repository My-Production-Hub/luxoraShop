# 💎 Luxora Shop - Luxury Perfume & Fragrance E-Commerce

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.x-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB" />
</p>

---

## 📖 Giới thiệu Dự án

**Luxora Shop** là nền tảng thương mại điện tử chuyên cung cấp nước hoa và sản phẩm mùi hương cao cấp (Nước hoa Nam, Nước hoa Nữ, Unisex, Body Mist, Gift Set, Sáp thơm). Dự án được thiết kế với giao diện Dark Mode sang trọng, trải nghiệm người dùng mượt mà và tích hợp **Hệ thống Affiliate Marketing (Tiếp thị liên kết)** chuyên nghiệp.

---

## ✨ Tính năng nổi bật

### 🛍️ 1. Mua sắm & Thương mại điện tử
- **Danh mục đa dạng:** Nước hoa nam, nữ, unisex, body mist, sáp thơm ô tô/phòng, bộ quà tặng cao cấp.
- **Bộ lọc thông minh:** Lọc theo danh mục, giới tính, mức giá, thương hiệu và dung tích.
- **Giỏ hàng & Đặt hàng:** Thêm/sửa/xóa sản phẩm trong giỏ, áp mã Voucher giảm giá, tính toán phí ship và đặt hàng nhanh chóng.
- **Quản lý đơn hàng:** Theo dõi trạng thái đơn hàng thời gian thực.

### 💼 2. Hệ thống Tiếp thị liên kết (Affiliate Program)
- **Đăng ký trở thành Publisher/Affiliate:** Tạo liên kết giới thiệu sản phẩm tự động.
- **Affiliate Dashboard:** Theo dõi số lượt click, đơn hàng thành công, doanh thu và hoa hồng nhận được.
- **Quản lý ví & Rút tiền:** Gửi yêu cầu rút hoa hồng về tài khoản ngân hàng.

### 🎨 3. Giao diện & Trải nghiệm (UI/UX)
- Thiết kế **Dark Luxe Aesthetic** chuẩn phong cách thương hiệu cao cấp.
- Hiệu ứng chuyển động mượt mà với **Framer Motion** & hiệu ứng chúc mừng **Canvas Confetti**.
- Tối ưu hóa hiển thị Responsive hoàn hảo trên Mobile, Tablet và Desktop.

---

## 🛠️ Công nghệ sử dụng

### **Frontend**
- **Framework:** [Next.js](https://nextjs.org/) (App Router), [React](https://react.dev/)
- **Ngôn ngữ:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/), PostCSS, Autoprefixer
- **Icons & Animation:** `lucide-react`, `framer-motion`, `canvas-confetti`

### **Backend**
- **Runtime & Framework:** [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/)
- **Cơ sở dữ liệu:** [MongoDB](https://www.mongodb.com/) & Mongoose ORM
- **Xác thực & Bảo mật:** JSON Web Token (JWT), `bcryptjs`, CORS
- **Email Service:** `nodemailer`

---

## 📁 Cấu trúc Thư mục

```text
Luxora Shop/
├── frontend/                # Mã nguồn Giao diện Next.js
│   ├── public/              # Tài nguyên tĩnh (ảnh, icons)
│   ├── src/
│   │   ├── app/             # App Router (Pages, Layouts, API Routes)
│   │   │   ├── affiliate/   # Trang đăng ký & Dashboard Affiliate
│   │   │   ├── cart/        # Trang giỏ hàng
│   │   │   ├── checkout/    # Trang thanh toán
│   │   │   ├── products/    # Trang danh sách & chi tiết sản phẩm
│   │   │   └── ...
│   │   ├── components/      # Các component tái sử dụng (Header, Footer, ProductCard,...)
│   │   └── lib/             # Utilities, constants & types
│   └── package.json
│
├── backend/                 # Mã nguồn Máy chủ API Node.js/Express
│   ├── config/              # Cấu hình kết nối DB & môi trường
│   ├── models/              # Mongoose Schemas (User, Product, Order, Affiliate,...)
│   ├── routes/              # API Endpoints (Auth, Products, Orders, Affiliate,...)
│   ├── scripts/             # Script khởi tạo dữ liệu mẫu (Seed data)
│   ├── server.js            # Entry point của Backend Server
│   └── package.json
│
└── README.md
```

---

## 🚀 Hướng dẫn Cài đặt & Chạy Local

### 1. Yêu cầu hệ thống
- **Node.js**: Phiên bản 18.x trở lên
- **MongoDB**: Đã cài đặt MongoDB Local hoặc có kết nối MongoDB Atlas

### 2. Cài đặt Backend
```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt thư viện
npm install

# (Tùy chọn) Chạy script tạo dữ liệu mẫu
npm run seed

# Khởi chạy Backend server
npm run dev
# -> Server chạy tại: http://localhost:5000
```

### 3. Cài đặt Frontend
```bash
# Mở terminal mới và di chuyển vào frontend
cd frontend

# Cài đặt thư viện
npm install

# Khởi chạy Next.js dev server
npm run dev
# -> Website chạy tại: http://localhost:3000
```

---

## ⚙️ Biến Môi trường (Environment Variables)

### **Backend (`backend/.env`)**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/luxora_shop
JWT_SECRET=your_jwt_secret_key_here
CLIENT_URL=http://localhost:3000
```

---

## 👤 Tác giả & Bản quyền

- **Tác giả:** Phạm Tấn Thông ([@ptthong05](https://github.com/ptthong05))
- **Organization:** [My-Production-Hub](https://github.com/My-Production-Hub)
- **Bản quyền:** © 2026 Luxora Perfume Shop. All rights reserved.
