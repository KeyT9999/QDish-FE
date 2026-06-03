# Requirement - Pricing/Subscription Plan UI & Logic Update

## 1. Overview
The QDish platform needs to adapt its SaaS pricing plan presentation and limitations logic to center around:
1. Lượt scan (QR scans) / tháng
2. AI features (Recommendation, Personalized Menu, Fit Score, Food Attributes)
3. Số chi nhánh (Branches/Restaurants)
4. Mức độ phân tích dữ liệu (Basic stats vs Advanced analytics & Merchant dashboard & Customer Insights)

Pricing cards must no longer display tables, staff, or menu items limits on the main UI.

## 2. Plan Configurations

### FREE
- **Scan Limit**: 500 scans / tháng
- **Description**: Khởi động số hóa thực đơn & nâng cao tương tác ban đầu
- **Features**: 
  - 1 chi nhánh hoạt động
  - QR Menu số hóa chuẩn hóa
  - Hồ sơ dinh dưỡng thực đơn
- **Exclude**:
  - Fit Score & Cá nhân hóa menu
  - Dashboard quản trị sâu

### PLUS
- **Scan Limit**: 5.000 scans / tháng
- **Description**: Cá nhân hóa tối đa trải nghiệm thực khách & tối ưu thực đơn
- **Features**: 
  - Tối đa 3 chi nhánh hoạt động
  - QR Menu & Hồ sơ dinh dưỡng
  - Fit Score / Điểm tương thích món
  - Personalized Menu cá nhân
  - Food Attributes chuyên sâu
- **Exclude**:
  - Dashboard quản trị sâu (Advanced analytics, Customer Insights)

### PRO
- **Scan Limit**: Vô hạn (subtitle: 50.000+ scans/tháng)
- **Description**: Khai thác tối đa tài nguyên dữ liệu & thúc đẩy tăng trưởng doanh thu
- **Features**: 
  - Không giới hạn chi nhánh
  - Bao gồm mọi tính năng của PLUS
  - AI Recommendation Engine
  - Merchant Dashboard & Analytics
  - Customer Insights & Phân tích sâu

---

## 3. UI Requirements

### Pricing Cards Layout & Theme
- **FREE**: Green border (`border-emerald-500` / `border-green-500`), badge "FREE", large display number "500", text "scans / tháng".
- **PLUS**: Blue border (`border-blue-500` / `border-sky-500`), badge "PLUS", large display number "5.000", text "scans / tháng".
- **PRO**: Purple border (`border-purple-500` / `border-indigo-500`), badge "PRO", ribbon “KHUYÊN DÙNG”, large display text "Vô hạn", subtitle "50.000+ scans/tháng".

### Excluded Metrics
- Do not display table limit, staff limit, or menu item limits on the primary public pricing cards. (They remain as backend guards against abuse, but are hidden on the UI).

### Admin Capabilities
- Super Admin must still be able to manage these new limits and flags (Monthly scan limit, Branch limit, AI switches) from the admin panel.
