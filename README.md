# QR Food Order - Frontend

Dự án Frontend cho hệ thống đặt đồ ăn qua mã QR (QR Food Order), được xây dựng với các công nghệ web hiện đại nhất nhằm đảm bảo hiệu năng cao, trải nghiệm người dùng (UX) mượt mà và khả năng bảo trì tốt.

## 🚀 Tech Stack (Công nghệ sử dụng)

- **[React 18](https://react.dev/)**: Thư viện UI cốt lõi.
- **[Vite](https://vitejs.dev/)**: Công cụ build siêu tốc, thay thế cho Create React App.
- **[TypeScript](https://www.typescriptlang.org/)**: Giúp bắt lỗi chặt chẽ, an toàn kiểu dữ liệu (Type-safe) khi code.
- **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first CSS framework để style giao diện cực nhanh và linh hoạt.
- **[shadcn/ui](https://ui.shadcn.com/)**: Bộ UI components cao cấp, được thiết kế sẵn cực đẹp và có thể tuỳ chỉnh dễ dàng, hỗ trợ sẵn Light/Dark mode.
- **[Framer Motion](https://www.framer.com/motion/)**: Thư viện tạo hiệu ứng chuyển động (animation) mượt mà, giúp ứng dụng trông như một native app.
- **Icon**: Sử dụng thư viện `lucide-react` cực kỳ gọn nhẹ và đồng bộ với shadcn.

## 📦 Cấu trúc thư mục

- `src/`
  - `components/`: Chứa các React component dùng chung (hoặc UI component từ shadcn).
  - `pages/`: Các trang giao diện chính (như Trang khách hàng gọi món, Dashboard quản lý).
  - `services/`: Các logic gọi API đến Backend.
  - `lib/`: Các tiện ích (utils) dùng chung, ví dụ như hàm merge class của tailwind (`cn`).
  - `App.tsx`: File root của ứng dụng.

## ⚙️ Hướng dẫn cài đặt và chạy dự án

1. **Cài đặt các gói phụ thuộc (Dependencies)**:
   ```bash
   npm install
   ```

2. **Cấu hình biến môi trường**:
   Tạo file `.env` ở thư mục gốc (ngang hàng với `package.json`) dựa trên `.env.example` hoặc tạo mới với nội dung:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   ```

3. **Chạy Server phát triển (Development)**:
   ```bash
   npm run dev
   ```
   Ứng dụng sẽ chạy tại `http://localhost:5173` (hoặc một port khác do Vite tự động cấp).

4. **Build lên môi trường Production**:
   ```bash
   npm run build
   ```

## 🎨 Thêm UI Component với shadcn
Để thêm một component bất kỳ (ví dụ Button, Dialog), bạn sử dụng câu lệnh CLI của shadcn:
```bash
npx shadcn@latest add [tên-component]
```
Ví dụ: `npx shadcn@latest add button`

---
*Dự án được khởi tạo và thiết lập nhằm mang lại trải nghiệm tương tác tốt nhất cho người dùng đặt món qua mã QR.*
