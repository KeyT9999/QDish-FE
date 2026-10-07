import type { OwnerConsoleLanguage } from '@/types/ownerConsoleLocale';

export const ownerConsoleMessages = {
  'Ngôn ngữ giao diện': { en: 'Interface language', 'zh-CN': '界面语言' },
  'Chọn ngôn ngữ dùng trong trang quản trị. Thay đổi này chỉ áp dụng cho tài khoản của bạn.': {
    en: 'Choose the language used in the management console. This preference applies only to your account.',
    'zh-CN': '选择管理控制台的显示语言。此设置仅应用于你的账户。'
  },
  'Tiếng Việt': { en: 'Tiếng Việt', 'zh-CN': 'Tiếng Việt' },
  English: { en: 'English', 'zh-CN': 'English' },
  '简体中文': { en: '简体中文', 'zh-CN': '简体中文' },
  'Đang lưu...': { en: 'Saving…', 'zh-CN': '正在保存…' },
  'Đã lưu ngôn ngữ giao diện.': { en: 'Interface language saved.', 'zh-CN': '界面语言已保存。' },
  'Không thể lưu thay đổi. Đã khôi phục lựa chọn trước đó.': {
    en: 'Could not save the change. Your previous language has been restored.',
    'zh-CN': '无法保存更改，已恢复为之前的语言。'
  },
  'Đang tải ngôn ngữ giao diện...': {
    en: 'Loading interface language…',
    'zh-CN': '正在加载界面语言…'
  },
  'Thiết lập': { en: 'Settings', 'zh-CN': '设置' },
  'Cài đặt tài khoản của bạn': { en: 'Your account settings', 'zh-CN': '账户设置' },
  'Trang chủ': { en: 'Home', 'zh-CN': '首页' },
  'Gói sử dụng': { en: 'Subscription', 'zh-CN': '订阅方案' },
  'Thông báo': { en: 'Notifications', 'zh-CN': '通知' },
  'Tổng quan': { en: 'Overview', 'zh-CN': '概览' },
  'Phân tích thực đơn': { en: 'Menu insights', 'zh-CN': '菜单分析' },
  'Khách hàng': { en: 'Customers', 'zh-CN': '顾客' },
  'Đơn hàng': { en: 'Orders', 'zh-CN': '订单' },
  'Hóa đơn': { en: 'Bills', 'zh-CN': '账单' },
  'Thực đơn': { en: 'Menu', 'zh-CN': '菜单' },
  'Danh mục': { en: 'Categories', 'zh-CN': '分类' },
  'Nguyên liệu': { en: 'Ingredients', 'zh-CN': '食材' },
  'Bàn & QR': { en: 'Tables & QR', 'zh-CN': '桌台与二维码' },
  'Nhân viên': { en: 'Staff', 'zh-CN': '员工' },
  'Chủ nhà hàng': { en: 'Restaurant owner', 'zh-CN': '餐厅店主' },
  'Chi nhánh': { en: 'Branches', 'zh-CN': '分店' },
  'Gói dịch vụ': { en: 'Plans', 'zh-CN': '套餐' },
  'Nguyên liệu hệ thống': { en: 'System ingredients', 'zh-CN': '系统食材' },
  'Đơn chế biến': { en: 'Kitchen orders', 'zh-CN': '厨房订单' },
  'Thống kê SaaS': { en: 'SaaS analytics', 'zh-CN': 'SaaS 数据' },
  'Quản lý SaaS': { en: 'SaaS management', 'zh-CN': 'SaaS 管理' },
  'Trang chủ Chủ nhà hàng': { en: 'Owner home', 'zh-CN': '店主首页' },
  'Chi tiết nhà hàng': { en: 'Restaurant details', 'zh-CN': '餐厅详情' },
  'Chủ nhà hàng (Owner)': { en: 'Restaurant owner', 'zh-CN': '餐厅店主' },
  'Nhân viên Bếp': { en: 'Kitchen staff', 'zh-CN': '厨房员工' },
  'Người dùng': { en: 'User', 'zh-CN': '用户' },
  'Nhà hàng QDish': { en: 'QDish Restaurant', 'zh-CN': 'QDish 餐厅' },
  'Nhà hàng': { en: 'Restaurant', 'zh-CN': '餐厅' },
  'Chọn chi nhánh...': { en: 'Select a branch…', 'zh-CN': '选择分店…' },
  'Đang quản trị': { en: 'Managing', 'zh-CN': '管理中' },
  'Chuyển chi nhánh': { en: 'Switch branch', 'zh-CN': '切换分店' },
  'Đã chuyển sang chi nhánh {name}': { en: 'Switched to {name}', 'zh-CN': '已切换到 {name}' },
  'Chi nhánh chính': { en: 'Primary branch', 'zh-CN': '主分店' },
  'Chi nhánh khác': { en: 'Other branches', 'zh-CN': '其他分店' },
  'Tính năng đa chi nhánh đang chạy thử nghiệm.': { en: 'The multi-branch feature is in preview.', 'zh-CN': '多分店功能正在试运行。' },
  'Chọn': { en: 'Select', 'zh-CN': '选择' },
  'Chức năng': { en: 'Navigation', 'zh-CN': '功能导航' },
  'Đăng xuất thành công': { en: 'Signed out successfully', 'zh-CN': '已成功退出登录' },
  'Đăng xuất': { en: 'Sign out', 'zh-CN': '退出登录' },
  'Hệ thống': { en: 'System', 'zh-CN': '系统' },
  'Quản lý': { en: 'Management', 'zh-CN': '管理' },
  'Xem Menu khách': { en: 'View customer menu', 'zh-CN': '查看顾客菜单' },
  'Thiết lập cấu hình nhà hàng': { en: 'Restaurant settings', 'zh-CN': '餐厅设置' },
  'Cấu hình thông tin địa chỉ hiển thị trên hóa đơn và thiết lập tài khoản ngân hàng thụ hưởng qua VietQR.': {
    en: 'Manage the address shown on bills and the receiving bank account used for VietQR.',
    'zh-CN': '管理账单上显示的地址，以及 VietQR 收款银行账户。'
  },
  'Thông tin nhà hàng': { en: 'Restaurant information', 'zh-CN': '餐厅信息' },
  'Các thông tin này được dùng trên hóa đơn và trang gọi món của khách.': {
    en: 'This information appears on bills and the customer ordering page.',
    'zh-CN': '这些信息会显示在账单和顾客点餐页面上。'
  },
  'Tên nhà hàng *': { en: 'Restaurant name *', 'zh-CN': '餐厅名称 *' },
  'Chủ sở hữu': { en: 'Owner', 'zh-CN': '所有者' },
  'Địa chỉ': { en: 'Address', 'zh-CN': '地址' },
  'Số điện thoại *': { en: 'Phone number *', 'zh-CN': '电话号码 *' },
  'Lưu cấu hình': { en: 'Save settings', 'zh-CN': '保存设置' },
  'Tài khoản Email & Bảo mật': { en: 'Email & security', 'zh-CN': '邮箱与安全' },
  'Thay đổi email cần xác minh OTP gửi về email hiện tại.': {
    en: 'Changing your email requires an OTP sent to your current address.',
    'zh-CN': '更改邮箱需要输入发送到当前邮箱的一次性验证码。'
  },
  'Email hiện tại': { en: 'Current email', 'zh-CN': '当前邮箱' },
  'Chưa có email': { en: 'No email added', 'zh-CN': '尚未添加邮箱' },
  'Yêu cầu đổi Email': { en: 'Request email change', 'zh-CN': '申请更改邮箱' },
  'Ngân hàng nhận thanh toán (VietQR)': { en: 'Receiving bank (VietQR)', 'zh-CN': '收款银行（VietQR）' },
  'Thông tin nhận tiền khi khách chọn chuyển khoản VietQR.': {
    en: 'Payment details shown when customers choose a VietQR bank transfer.',
    'zh-CN': '顾客选择 VietQR 银行转账时显示的收款信息。'
  },
  'Ngân hàng hiện tại': { en: 'Current bank', 'zh-CN': '当前银行' },
  'Chưa cấu hình': { en: 'Not configured', 'zh-CN': '尚未配置' },
  'Số tài khoản hiện tại': { en: 'Current account number', 'zh-CN': '当前银行账号' },
  'Chủ nhà hàng chỉnh thông tin ngân hàng và QR chuyển khoản ở mục bên dưới.': {
    en: 'Owners can update bank and transfer QR details in the section below.',
    'zh-CN': '店主可在下方更新银行和转账二维码信息。'
  },
  'Chỉ Chủ nhà hàng được thay đổi thông tin ngân hàng và QR chuyển khoản.': {
    en: 'Only the restaurant owner can change bank and transfer QR details.',
    'zh-CN': '只有餐厅店主可以更改银行和转账二维码信息。'
  },
  'Đang chuẩn bị không gian quản trị...': { en: 'Preparing your management workspace…', 'zh-CN': '正在准备管理工作区…' },
  'Trung tâm thông báo': { en: 'Notification center', 'zh-CN': '通知中心' },
  'Theo dõi tin tức hệ thống, biến động tài khoản thanh toán và các cập nhật tự động từ QDish SaaS.': {
    en: 'Follow system updates, payment account activity, and automatic updates from QDish SaaS.',
    'zh-CN': '查看系统消息、付款账户动态以及 QDish SaaS 自动更新。'
  },
  'Gói Dịch Vụ & Thanh Toán': { en: 'Plans & billing', 'zh-CN': '套餐与付款' },
  'Quản Lý Gói Dịch Vụ SaaS của Bạn': { en: 'Manage your SaaS plan', 'zh-CN': '管理你的 SaaS 套餐' },
  'Kiểm tra mức sử dụng tài nguyên, hạn mức tài nguyên và nâng cấp các tính năng cao cấp cho chuỗi nhà hàng của bạn qua cổng PayOS.': {
    en: 'Review resource usage and limits, and upgrade your restaurant group through PayOS.',
    'zh-CN': '查看资源用量与限额，并通过 PayOS 为餐厅连锁升级功能。'
  },
  'Không thể tải thông tin gói dịch vụ': { en: 'Could not load plan information', 'zh-CN': '无法加载套餐信息' },
  'Không thể tải thông tin gói dịch vụ của bạn.': { en: 'Could not load your plan information.', 'zh-CN': '无法加载你的套餐信息。' },
  'Hệ thống gặp sự cố trong quá trình đồng bộ hóa gói. Vui lòng bấm thử lại.': {
    en: 'There was a problem syncing your plan. Please try again.',
    'zh-CN': '同步套餐时出现问题，请重试。'
  },
  'Thử lại': { en: 'Try again', 'zh-CN': '重试' },
  'Không xác định được gói dịch vụ': { en: 'Could not identify the plan', 'zh-CN': '无法识别套餐' },
  'Bạn đang sử dụng gói này.': { en: 'You are already using this plan.', 'zh-CN': '你已在使用此套餐。' },
  'Đã kích hoạt gói miễn phí thành công.': { en: 'Free plan activated successfully.', 'zh-CN': '免费套餐已成功启用。' },
  'Đang chuyển sang cổng thanh toán PayOS...': { en: 'Redirecting to PayOS…', 'zh-CN': '正在跳转至 PayOS…' },
  'Không nhận được liên kết thanh toán từ hệ thống.': { en: 'The system did not return a payment link.', 'zh-CN': '系统未返回付款链接。' },
  'Không thể khởi tạo thanh toán.': { en: 'Could not start the payment.', 'zh-CN': '无法发起付款。' },
  'Gói {planName} của bạn sẽ hết hạn sau 7 ngày. Vui lòng gia hạn để tránh gián đoạn dịch vụ.': {
    en: 'Your {planName} plan expires in 7 days. Renew it to avoid service interruption.',
    'zh-CN': '你的 {planName} 套餐将在 7 天后到期，请及时续费以避免服务中断。'
  },
  'Gói {planName} của bạn sắp hết hạn (còn 3 ngày). Các tính năng cao cấp sẽ bị khóa sau khi hết hạn.': {
    en: 'Your {planName} plan expires in 3 days. Premium features will be locked after it expires.',
    'zh-CN': '你的 {planName} 套餐将在 3 天后到期，到期后高级功能将被锁定。'
  },
  'Gói {planName} của bạn sẽ bị hạ xuống FREE sau 24 giờ nữa. Hãy gia hạn ngay để giữ tất cả tính năng cao cấp.': {
    en: 'Your {planName} plan will be downgraded to FREE in 24 hours. Renew now to keep premium features.',
    'zh-CN': '你的 {planName} 套餐将在 24 小时后降级为免费版，请立即续费以保留高级功能。'
  },
  'Gói dịch vụ cao cấp đã hết hạn. Hệ thống đã tự động chuyển tài khoản về gói FREE. Các tính năng nâng cao đã bị tạm khóa.': {
    en: 'Your premium plan has expired. The account was moved to FREE and advanced features were temporarily locked.',
    'zh-CN': '高级套餐已到期，账户已自动转为免费版，高级功能已暂时锁定。'
  },
  'Cảnh báo: Gói dịch vụ đã hết hạn': { en: 'Alert: Plan expired', 'zh-CN': '提醒：套餐已到期' },
  'Thông báo: Gói dịch vụ sắp hết hạn': { en: 'Notice: Plan expiring soon', 'zh-CN': '通知：套餐即将到期' },
  'Gói hiện tại': { en: 'Current plan', 'zh-CN': '当前套餐' },
  'Thông tin chi tiết về gói dịch vụ của bạn': { en: 'Details about your plan', 'zh-CN': '你的套餐详情' },
  'Gói hoạt động': { en: 'Active plan', 'zh-CN': '当前生效套餐' },
  'GÓI HIỆN TẠI': { en: 'CURRENT PLAN', 'zh-CN': '当前套餐' },
  'Trạng thái:': { en: 'Status:', 'zh-CN': '状态：' },
  'Đang kích hoạt': { en: 'Active', 'zh-CN': '已启用' },
  'Chờ thanh toán': { en: 'Awaiting payment', 'zh-CN': '等待付款' },
  'Chi phí:': { en: 'Price:', 'zh-CN': '费用：' },
  'Miễn phí (0đ)': { en: 'Free (0 VND)', 'zh-CN': '免费（0 越南盾）' },
  'Ngày kích hoạt:': { en: 'Activated on:', 'zh-CN': '启用日期：' },
  'Hạn sử dụng:': { en: 'Expires on:', 'zh-CN': '到期日期：' },
  'Vô thời hạn': { en: 'No expiration', 'zh-CN': '长期有效' },
  'Thời gian còn lại:': { en: 'Time remaining:', 'zh-CN': '剩余时间：' },
  'Đã hết hạn': { en: 'Expired', 'zh-CN': '已到期' },
  'Nâng cấp gói dịch vụ': { en: 'Upgrade plan', 'zh-CN': '升级套餐' },
  'Giới hạn sử dụng tài nguyên': { en: 'Resource usage limits', 'zh-CN': '资源使用限额' },
  'Số lượng tài nguyên đã tạo so với giới hạn tối đa của gói hiện tại': {
    en: 'Resources created compared with the limits of your current plan',
    'zh-CN': '已创建资源数量与当前套餐上限的对比'
  },
  'Lượt quét QR (scans/tháng)': { en: 'QR scans (per month)', 'zh-CN': '二维码扫描次数（每月）' },
  'Chi nhánh / Nhà hàng': { en: 'Branches / restaurants', 'zh-CN': '分店 / 餐厅' },
  'Bàn ăn hoạt động': { en: 'Active tables', 'zh-CN': '营业桌台' },
  'Món ăn trong thực đơn': { en: 'Menu items', 'zh-CN': '菜单菜品' },
  'Nhân viên (Staff)': { en: 'Staff members', 'zh-CN': '员工' },
  'Không giới hạn': { en: 'Unlimited', 'zh-CN': '不限' },
  'Đã đạt giới hạn tối đa! Vui lòng nâng cấp gói để tiếp tục sử dụng thêm.': {
    en: 'You have reached the limit. Upgrade your plan to add more.',
    'zh-CN': '已达到上限，请升级套餐以继续添加。'
  },
  'Tính năng gói sở hữu': { en: 'Included plan features', 'zh-CN': '套餐包含的功能' },
  'Tính năng AI & phân tích dữ liệu': { en: 'AI & analytics features', 'zh-CN': 'AI 与数据分析功能' },
  'Cá nhân hóa Fit Score': { en: 'Personalized Fit Score', 'zh-CN': '个性化 Fit Score' },
  'Hồ sơ dinh dưỡng món ăn': { en: 'Menu nutrition profiles', 'zh-CN': '菜品营养信息' },
  'Gợi ý món ăn AI (AI Recommendation)': { en: 'AI dish recommendations', 'zh-CN': 'AI 菜品推荐' },
  'Cá nhân hóa thực đơn (Personalized Menu)': { en: 'Personalized menu', 'zh-CN': '个性化菜单' },
  'Báo cáo phân tích chuyên sâu': { en: 'Advanced analytics reports', 'zh-CN': '高级分析报告' },
  'Phân tích hành vi khách hàng': { en: 'Customer behavior insights', 'zh-CN': '顾客行为分析' },
  'CRM khách hàng & lịch sử gọi món': { en: 'Customer CRM & order history', 'zh-CN': '顾客 CRM 与点餐记录' },
  'Gói có thể nâng cấp': { en: 'Available plans', 'zh-CN': '可升级套餐' },
  'Danh sách gói đang được Super Admin kích hoạt': { en: 'Plans enabled by the super administrator', 'zh-CN': '超级管理员已启用的套餐' },
  'Tháng': { en: 'Monthly', 'zh-CN': '按月' },
  'Năm': { en: 'Yearly', 'zh-CN': '按年' },
  'Khuyên dùng': { en: 'Recommended', 'zh-CN': '推荐' },
  'Vô hạn': { en: 'Unlimited', 'zh-CN': '不限' },
  'Cơ bản': { en: 'Basic', 'zh-CN': '基础版' },
  'AI Fit Score & Cá nhân hóa': { en: 'AI Fit Score & personalization', 'zh-CN': 'AI Fit Score 与个性化' },
  'Full AI & Phân tích chuyên sâu': { en: 'Full AI & advanced analytics', 'zh-CN': '完整 AI 与高级分析' },
  'Đang xử lý': { en: 'Processing', 'zh-CN': '处理中' },
  'Chọn FREE': { en: 'Choose FREE', 'zh-CN': '选择免费版' },
  'Nâng cấp {code}': { en: 'Upgrade to {code}', 'zh-CN': '升级至 {code}' },
  'Tài khoản Chủ nhà hàng (Owner)': { en: 'Restaurant owner account', 'zh-CN': '餐厅店主账户' },
  'Xin chào, {username}!': { en: 'Hello, {username}!', 'zh-CN': '你好，{username}！' },
  'Quản lý các chuỗi cửa hàng, thiết lập thực đơn QR và theo dõi doanh thu của các chi nhánh tại QDish.': {
    en: 'Manage restaurant groups, configure QR menus, and track branch revenue in QDish.',
    'zh-CN': '在 QDish 管理餐厅连锁、设置二维码菜单并查看各分店营收。'
  },
  'Hiệu suất kinh doanh toàn chuỗi': { en: 'Business performance across your group', 'zh-CN': '连锁整体经营表现' },
  'Số liệu tổng hợp cộng dồn từ tất cả {count} chi nhánh nhà hàng thuộc sở hữu của bạn.': {
    en: 'Combined results from all {count} restaurants you own.',
    'zh-CN': '汇总你名下全部 {count} 家餐厅的数据。'
  },
  'Tất cả': { en: 'All', 'zh-CN': '全部' },
  'Hôm nay': { en: 'Today', 'zh-CN': '今天' },
  'Tuần này': { en: 'This week', 'zh-CN': '本周' },
  'Tháng này': { en: 'This month', 'zh-CN': '本月' },
  'Năm nay': { en: 'This year', 'zh-CN': '今年' },
  'Tổng doanh thu toàn chuỗi': { en: 'Total revenue across branches', 'zh-CN': '连锁总营收' },
  'Doanh thu gộp (All branches)': { en: 'Gross revenue (all branches)', 'zh-CN': '总营收（所有分店）' },
  'Tổng đơn hoàn thành': { en: 'Completed orders', 'zh-CN': '已完成订单' },
  '{count} đơn': { en: '{count} orders', 'zh-CN': '{count} 单' },
  'Số đơn phục vụ thành công': { en: 'Orders served successfully', 'zh-CN': '成功完成的订单' },
  'Quy mô chi nhánh': { en: 'Branch count', 'zh-CN': '分店数量' },
  '{count} nhà hàng': { en: '{count} restaurants', 'zh-CN': '{count} 家餐厅' },
  'Tổng chi nhánh đăng ký': { en: 'Total registered branches', 'zh-CN': '已注册分店总数' },
  'Bạn chưa đăng ký chi nhánh nào': { en: 'You have not registered any branches yet', 'zh-CN': '你还没有注册任何分店' },
  'Để bắt đầu sử dụng các tính năng quản lý thực đơn QR, gọi món, quản lý bàn ăn, nhân viên bếp của QDish, hãy tạo chi nhánh đầu tiên của bạn.': {
    en: 'Create your first branch to start using QDish QR menus, ordering, table management, and kitchen staff tools.',
    'zh-CN': '创建第一个分店，即可开始使用 QDish 二维码菜单、点餐、桌台管理和厨房员工功能。'
  },
  'Tạo chi nhánh đầu tiên': { en: 'Create your first branch', 'zh-CN': '创建第一个分店' },
  'Chi nhánh đã lưu trữ': { en: 'Archived branches', 'zh-CN': '已归档分店' },
  'Danh sách chi nhánh của bạn': { en: 'Your branches', 'zh-CN': '你的分店' },
  'Chi nhánh lưu trữ không nhận đơn mới; dữ liệu cũ vẫn được giữ và có thể khôi phục.': {
    en: 'Archived branches cannot receive new orders. Their data is retained and they can be restored.',
    'zh-CN': '已归档分店不会接收新订单；历史数据会保留，并可随时恢复。'
  },
  'Chọn chi nhánh để vào quản trị hoặc lưu trữ chi nhánh không còn hoạt động.': {
    en: 'Select a branch to manage it, or archive a branch that is no longer active.',
    'zh-CN': '选择一个分店进行管理，或归档不再营业的分店。'
  },
  'Thêm chi nhánh mới': { en: 'Add a branch', 'zh-CN': '添加分店' },
  'Lọc chi nhánh': { en: 'Filter branches', 'zh-CN': '筛选分店' },
  'Đang hoạt động': { en: 'Active', 'zh-CN': '营业中' },
  'Đã lưu trữ': { en: 'Archived', 'zh-CN': '已归档' },
  'Chưa có chi nhánh lưu trữ': { en: 'No archived branches', 'zh-CN': '没有已归档的分店' },
  'Các chi nhánh đã lưu trữ sẽ xuất hiện ở đây để bạn khôi phục khi cần.': {
    en: 'Archived branches will appear here so you can restore them when needed.',
    'zh-CN': '已归档的分店会显示在这里，方便你在需要时恢复。'
  },
  'Lưu trữ ngày {date}': { en: 'Archived on {date}', 'zh-CN': '归档日期：{date}' },
  'Không rõ': { en: 'Unknown', 'zh-CN': '未知' },
  'Khôi phục chi nhánh': { en: 'Restore branch', 'zh-CN': '恢复分店' },
  'Không có chi nhánh đang hoạt động': { en: 'No active branches', 'zh-CN': '没有营业中的分店' },
  'Khôi phục một chi nhánh đã lưu trữ hoặc tạo chi nhánh mới để tiếp tục.': {
    en: 'Restore an archived branch or create a new one to continue.',
    'zh-CN': '恢复已归档的分店，或创建新分店以继续。'
  },
  'Xem chi nhánh lưu trữ': { en: 'View archived branches', 'zh-CN': '查看已归档分店' },
  'Tạo chi nhánh': { en: 'Create branch', 'zh-CN': '创建分店' },
  'Đang chọn': { en: 'Selected', 'zh-CN': '已选择' },
  'Tạm khóa': { en: 'Suspended', 'zh-CN': '已暂停' },
  'Xem chi tiết': { en: 'View details', 'zh-CN': '查看详情' },
  'Vào quản trị': { en: 'Open management', 'zh-CN': '进入管理' },
  'Lưu trữ': { en: 'Archive', 'zh-CN': '归档' },
  'Đăng ký chi nhánh mới': { en: 'Register a new branch', 'zh-CN': '注册新分店' },
  'Điền các thông tin dưới đây để tạo chi nhánh và tài khoản đăng nhập cho quản lý chi nhánh.': {
    en: 'Enter the details below to create a branch and its manager login.',
    'zh-CN': '填写以下信息以创建分店及其管理员登录账户。'
  },
  'Tên chi nhánh nhà hàng *': { en: 'Branch name *', 'zh-CN': '分店名称 *' },
  'Ví dụ: QDish Buffet Hải Sản Cầu Giấy': { en: 'Example: QDish Seafood Buffet', 'zh-CN': '例如：QDish 海鲜自助餐' },
  'Email nhà hàng *': { en: 'Branch email *', 'zh-CN': '分店邮箱 *' },
  'Địa chỉ chi nhánh *': { en: 'Branch address *', 'zh-CN': '分店地址 *' },
  'Số nhà, tên đường, quận/huyện, thành phố': { en: 'Street address, district, city', 'zh-CN': '街道、区县、城市' },
  'Thiết lập tài khoản Admin đăng nhập chi nhánh': { en: 'Set up the branch admin account', 'zh-CN': '设置分店管理员账户' },
  'Ví dụ: buffet_caugiay_admin': { en: 'Example: buffet_branch_admin', 'zh-CN': '例如：buffet_branch_admin' },
  'Mật khẩu *': { en: 'Password *', 'zh-CN': '密码 *' },
  'Tối thiểu 6 ký tự': { en: 'At least 6 characters', 'zh-CN': '至少 6 个字符' },
  'Nhập lại mật khẩu *': { en: 'Confirm password *', 'zh-CN': '再次输入密码 *' },
  'Nhập lại mật khẩu': { en: 'Re-enter password', 'zh-CN': '再次输入密码' },
  'Hủy': { en: 'Cancel', 'zh-CN': '取消' },
  'Đang tạo...': { en: 'Creating…', 'zh-CN': '正在创建…' },
  'Tạo nhà hàng': { en: 'Create restaurant', 'zh-CN': '创建餐厅' },
  'Lưu trữ chi nhánh?': { en: 'Archive this branch?', 'zh-CN': '要归档此分店吗？' },
  '{name} đã được lưu trữ. Dữ liệu lịch sử vẫn được giữ nguyên.': { en: '{name} was archived. Historical data is retained.', 'zh-CN': '{name} 已归档，历史数据仍会保留。' },
  '{name} đã được khôi phục.': { en: '{name} was restored.', 'zh-CN': '{name} 已恢复。' },
  'Lưu trữ {name}': { en: 'Archive {name}', 'zh-CN': '归档 {name}' },
  'Còn {count} ngày': { en: '{count} days remaining', 'zh-CN': '还剩 {count} 天' },
  '{name} sẽ ngừng nhận đơn mới và không còn được tính vào giới hạn số chi nhánh. Đơn hàng, hóa đơn, bàn, thực đơn và lịch sử liên quan vẫn được giữ nguyên.': {
    en: '{name} will stop receiving new orders and will no longer count toward your branch limit. Orders, bills, tables, menus, and related history will be retained.',
    'zh-CN': '{name} 将停止接收新订单，且不再计入分店数量上限。订单、账单、桌台、菜单及相关记录都会保留。'
  },
  'Hãy đóng các phiên bàn và thanh toán hết hóa đơn trước. Bạn có thể khôi phục chi nhánh sau, nếu gói hiện tại còn hạn mức.': {
    en: 'Close table sessions and settle all bills first. You can restore this branch later if your plan has room.',
    'zh-CN': '请先关闭桌台会话并结清所有账单。若当前套餐仍有名额，你之后可以恢复此分店。'
  },
  'Đang lưu trữ...': { en: 'Archiving…', 'zh-CN': '正在归档…' },
  'Lưu trữ chi nhánh': { en: 'Archive branch', 'zh-CN': '归档分店' },
  'Không thể tải danh sách chi nhánh nhà hàng': { en: 'Could not load your branches', 'zh-CN': '无法加载分店列表' },
  'Không thể tải danh sách chi nhánh đã lưu trữ': { en: 'Could not load archived branches', 'zh-CN': '无法加载已归档分店' },
  'Vui lòng điền đầy đủ tất cả các trường.': { en: 'Please complete all fields.', 'zh-CN': '请填写所有字段。' },
  'Định dạng email không hợp lệ.': { en: 'Invalid email format.', 'zh-CN': '邮箱格式无效。' },
  'Mật khẩu admin cần tối thiểu 6 ký tự.': { en: 'The admin password must be at least 6 characters.', 'zh-CN': '管理员密码至少需要 6 个字符。' },
  'Xác nhận mật khẩu admin không trùng khớp.': { en: 'The admin passwords do not match.', 'zh-CN': '管理员密码不匹配。' },
  'Tạo chi nhánh nhà hàng mới thành công!': { en: 'Branch created successfully!', 'zh-CN': '分店创建成功！' },
  'Lỗi khi tạo nhà hàng mới.': { en: 'Could not create the branch.', 'zh-CN': '创建分店失败。' },
  'Đã chuyển đổi không gian làm việc chi nhánh!': { en: 'Branch workspace switched successfully.', 'zh-CN': '分店工作区已切换。' },
  'Chi nhánh đã lưu trữ, nhưng danh sách chưa tải mới được. Vui lòng tải lại trang.': { en: 'The branch was archived, but the list did not refresh. Please reload the page.', 'zh-CN': '分店已归档，但列表未能刷新，请重新加载页面。' },
  'Không thể lưu trữ chi nhánh.': { en: 'Could not archive the branch.', 'zh-CN': '无法归档分店。' },
  'Chi nhánh đã khôi phục, nhưng danh sách chưa tải mới được. Vui lòng tải lại trang.': { en: 'The branch was restored, but the list did not refresh. Please reload the page.', 'zh-CN': '分店已恢复，但列表未能刷新，请重新加载页面。' },
  'Không thể khôi phục chi nhánh.': { en: 'Could not restore the branch.', 'zh-CN': '无法恢复分店。' },
  'Không thể tải thông tin chi tiết nhà hàng': { en: 'Could not load restaurant details', 'zh-CN': '无法加载餐厅详情' },
  'Đang tải thông tin chi tiết...': { en: 'Loading details…', 'zh-CN': '正在加载详情…' },
  'Không tìm thấy nhà hàng': { en: 'Restaurant not found', 'zh-CN': '未找到餐厅' },
  'Yêu cầu không hợp lệ hoặc bạn không có quyền truy cập vào thông tin chi nhánh này.': { en: 'This request is invalid or you do not have access to this branch.', 'zh-CN': '请求无效，或你没有权限查看此分店信息。' },
  'Quay lại trang chủ': { en: 'Back to home', 'zh-CN': '返回首页' },
  'Quay lại danh sách': { en: 'Back to branches', 'zh-CN': '返回分店列表' },
  'Chi nhánh nhà hàng': { en: 'Restaurant branch', 'zh-CN': '餐厅分店' },
  'Ngày đăng ký:': { en: 'Registered:', 'zh-CN': '注册日期：' },
  'Thông tin chung chi nhánh': { en: 'Branch information', 'zh-CN': '分店信息' },
  'Thông tin liên lạc và người quản trị chính của chi nhánh': { en: 'Contact and primary administrator information for this branch', 'zh-CN': '此分店的联系方式和主要管理员信息' },
  'Tên chi nhánh': { en: 'Branch name', 'zh-CN': '分店名称' },
  'Tên chủ sở hữu': { en: 'Owner name', 'zh-CN': '店主姓名' },
  'Tên đăng nhập Admin chi nhánh': { en: 'Branch admin username', 'zh-CN': '分店管理员用户名' },
  'Số điện thoại liên lạc': { en: 'Contact phone', 'zh-CN': '联系电话' },
  'Hòm thư điện tử (Email)': { en: 'Email address', 'zh-CN': '电子邮箱' },
  'Địa chỉ chi nhánh': { en: 'Branch address', 'zh-CN': '分店地址' },
  'Tính năng AI & phân tích dữ liệu áp dụng': { en: 'Available AI & analytics features', 'zh-CN': '可用的 AI 与数据分析功能' },
  'Trạng thái kích hoạt của các tính năng dựa trên gói dịch vụ hiện có': { en: 'Feature availability based on the current plan', 'zh-CN': '根据当前套餐显示功能可用状态' },
  'Kích hoạt': { en: 'Enabled', 'zh-CN': '已启用' },
  'Chưa kích hoạt': { en: 'Not enabled', 'zh-CN': '未启用' },
  'Nhận tiền & Ngân hàng': { en: 'Payouts & bank', 'zh-CN': '收款与银行' },
  'Thông tin nhận tiền chuyển khoản của chi nhánh này': { en: 'Bank transfer payout details for this branch', 'zh-CN': '此分店的银行转账收款信息' },
  'Tên ngân hàng': { en: 'Bank name', 'zh-CN': '银行名称' },
  'Chưa thiết lập': { en: 'Not set up', 'zh-CN': '未设置' },
  'Số tài khoản': { en: 'Account number', 'zh-CN': '银行账号' },
  'Chủ tài khoản': { en: 'Account holder', 'zh-CN': '账户持有人' },
  'Mã QR ngân hàng chi nhánh': { en: 'Branch bank QR code', 'zh-CN': '分店银行二维码' },
  'Chưa thiết lập ảnh QR ngân hàng': { en: 'Bank QR image is not set up', 'zh-CN': '尚未设置银行二维码图片' },
  'Để thiết lập QR thanh toán, vui lòng chuyển qua không gian làm việc chi nhánh và thực hiện tại mục Thiết lập.': {
    en: 'To set up a payment QR code, switch to this branch workspace and open Settings.',
    'zh-CN': '如需设置付款二维码，请切换到此分店工作区并前往“设置”。'
  },
  'Thanh toán': { en: 'Payments', 'zh-CN': '付款' },
  'Thông tin': { en: 'Information', 'zh-CN': '信息' },
  'Thành công': { en: 'Success', 'zh-CN': '成功' },
  'Cảnh báo': { en: 'Warning', 'zh-CN': '警告' },
  'Lỗi': { en: 'Error', 'zh-CN': '错误' },
  'Đóng': { en: 'Close', 'zh-CN': '关闭' },
  'Khẩn cấp': { en: 'Urgent', 'zh-CN': '紧急' },
  'Quan trọng': { en: 'Important', 'zh-CN': '重要' },
  'Mức thấp': { en: 'Low priority', 'zh-CN': '低优先级' },
  'Thời gian:': { en: 'Time:', 'zh-CN': '时间：' },
  'Nguồn gửi': { en: 'Sent by', 'zh-CN': '发送来源' },
  'Chi tiết dữ liệu (Metadata)': { en: 'Data details (metadata)', 'zh-CN': '数据详情（元数据）' },
  'Đi tới ứng dụng': { en: 'Go to app', 'zh-CN': '前往应用' },
  'Vừa xong': { en: 'Just now', 'zh-CN': '刚刚' },
  '{count} phút trước': { en: '{count} min ago', 'zh-CN': '{count} 分钟前' },
  '{count} giờ trước': { en: '{count} hr ago', 'zh-CN': '{count} 小时前' },
  '{count} ngày trước': { en: '{count} days ago', 'zh-CN': '{count} 天前' },
  'Chưa đọc': { en: 'Unread', 'zh-CN': '未读' },
  '{total} thông báo • {unread} chưa đọc': { en: '{total} notifications • {unread} unread', 'zh-CN': '{total} 条通知 • {unread} 条未读' },
  'Đánh dấu tất cả đã đọc': { en: 'Mark all as read', 'zh-CN': '全部标为已读' },
  'Chưa có thông báo nào': { en: 'No notifications yet', 'zh-CN': '暂无通知' },
  'Thử bỏ bộ lọc để xem tất cả thông báo': { en: 'Try clearing the filter to see all notifications', 'zh-CN': '尝试清除筛选条件以查看所有通知' },
  'Thông báo mới sẽ xuất hiện ở đây': { en: 'New notifications will appear here', 'zh-CN': '新通知会显示在这里' },
  'Trang {page} / {pages}': { en: 'Page {page} of {pages}', 'zh-CN': '第 {page} 页，共 {pages} 页' },
  'mới': { en: 'new', 'zh-CN': '条新通知' },
  'Đọc tất cả': { en: 'Mark all as read', 'zh-CN': '全部标为已读' },
  'Xem tất cả thông báo': { en: 'View all notifications', 'zh-CN': '查看所有通知' },
  'Không thể tải thông tin nhà hàng': { en: 'Could not load restaurant information', 'zh-CN': '无法加载餐厅信息' },
  'Không thể tải thống kê doanh thu': { en: 'Could not load revenue statistics', 'zh-CN': '无法加载营收统计' },
  'Không thể tải thực đơn': { en: 'Could not load the menu', 'zh-CN': '无法加载菜单' },
  'Không thể tải danh mục': { en: 'Could not load categories', 'zh-CN': '无法加载分类' },
  'Không thể tải danh sách bill': { en: 'Could not load bills', 'zh-CN': '无法加载账单' },
  'Không thể tải danh sách nhân viên': { en: 'Could not load staff', 'zh-CN': '无法加载员工列表' },
  'Đã cập nhật món ăn thành công': { en: 'Menu item updated successfully', 'zh-CN': '菜品已成功更新' },
  'Đã thêm món ăn mới thành công': { en: 'Menu item added successfully', 'zh-CN': '菜品已成功添加' },
  'Lỗi khi lưu món ăn': { en: 'Could not save the menu item', 'zh-CN': '保存菜品失败' },
  'Bạn có chắc muốn xóa món ăn này vĩnh viễn?': { en: 'Are you sure you want to permanently delete this menu item?', 'zh-CN': '确定要永久删除此菜品吗？' },
  'Đã xóa món ăn thành công': { en: 'Menu item deleted successfully', 'zh-CN': '菜品已成功删除' },
  'Không thể xóa món ăn': { en: 'Could not delete the menu item', 'zh-CN': '无法删除菜品' },
  'Đã thay đổi trạng thái món ăn': { en: 'Menu item status updated', 'zh-CN': '菜品状态已更新' },
  'Lỗi khi cập nhật trạng thái món ăn': { en: 'Could not update the menu item status', 'zh-CN': '更新菜品状态失败' },
  'Đã lưu khai báo dị ứng kèm nguồn xác nhận': { en: 'Allergen declaration and verification source saved', 'zh-CN': '过敏原声明及确认来源已保存' },
  'Không thể lưu xác nhận dị ứng': { en: 'Could not save the allergen verification', 'zh-CN': '无法保存过敏原确认' },
  'Đã cập nhật danh mục thành công': { en: 'Category updated successfully', 'zh-CN': '分类已成功更新' },
  'Đã tạo danh mục mới thành công': { en: 'Category created successfully', 'zh-CN': '分类已成功创建' },
  'Lỗi khi lưu danh mục': { en: 'Could not save the category', 'zh-CN': '保存分类失败' },
  'Danh mục đang chứa {count} món ăn. Vui lòng di chuyển hoặc xóa các món ăn trước.': { en: 'This category contains {count} menu items. Move or delete them first.', 'zh-CN': '此分类中有 {count} 道菜品，请先移动或删除这些菜品。' },
  'Bạn có chắc muốn xóa danh mục này?': { en: 'Are you sure you want to delete this category?', 'zh-CN': '确定要删除此分类吗？' },
  'Đã xóa danh mục thành công': { en: 'Category deleted successfully', 'zh-CN': '分类已成功删除' },
  'Lỗi khi xóa danh mục': { en: 'Could not delete the category', 'zh-CN': '删除分类失败' },
  'Vui lòng nhập số lượng bàn hợp lệ': { en: 'Enter a valid number of tables', 'zh-CN': '请输入有效的桌台数量' },
  'Đã đồng bộ thành công {count} bàn ăn': { en: 'Successfully synced {count} tables', 'zh-CN': '已成功同步 {count} 张桌台' },
  'Lỗi khi đồng bộ bàn ăn': { en: 'Could not sync tables', 'zh-CN': '同步桌台失败' },
  'Đã cập nhật thông tin nhân viên': { en: 'Staff information updated', 'zh-CN': '员工信息已更新' },
  'Đã thêm nhân viên mới thành công': { en: 'Staff member added successfully', 'zh-CN': '员工已成功添加' },
  'Lỗi khi lưu nhân viên': { en: 'Could not save staff member', 'zh-CN': '保存员工信息失败' },
  'Đã cập nhật trạng thái hoạt động của nhân viên': { en: 'Staff status updated', 'zh-CN': '员工状态已更新' },
  'Lỗi khi toggle trạng thái hoạt động nhân viên': { en: 'Could not update staff status', 'zh-CN': '更新员工状态失败' },
  'Lỗi khi cập nhật trạng thái đơn hàng': { en: 'Could not update the order status', 'zh-CN': '更新订单状态失败' },
  'Không tìm thấy bill cần thanh toán': { en: 'The bill to pay was not found', 'zh-CN': '未找到待付款账单' },
  'Tên nhà hàng và số điện thoại không được để trống': { en: 'Restaurant name and phone number are required', 'zh-CN': '餐厅名称和电话号码不能为空' },
  'Đã lưu thông tin cấu hình nhà hàng': { en: 'Restaurant settings saved', 'zh-CN': '餐厅设置已保存' },
  'Lỗi khi lưu cấu hình': { en: 'Could not save settings', 'zh-CN': '保存设置失败' },
  'Đã thay đổi email thành công': { en: 'Email changed successfully', 'zh-CN': '邮箱已成功更改' },
  'OTP không hợp lệ hoặc hết hạn': { en: 'The OTP is invalid or has expired', 'zh-CN': '验证码无效或已过期' },
  'Đã cập nhật thông tin tài khoản nhận tiền': { en: 'Payout account information updated', 'zh-CN': '收款账户信息已更新' },
  'Đã bật âm báo đơn mới': { en: 'New order sound enabled', 'zh-CN': '新订单提示音已开启' },
  'Trình duyệt chưa cho phép bật âm báo': { en: 'The browser has not allowed order sounds yet', 'zh-CN': '浏览器尚未允许播放订单提示音' },
  'Đã xác nhận đơn mới': { en: 'New order confirmed', 'zh-CN': '新订单已确认' },
  'Không thể xác nhận đơn mới': { en: 'Could not confirm the new order', 'zh-CN': '无法确认新订单' },
  'Xác nhận đơn': { en: 'Confirm order', 'zh-CN': '确认订单' },
  'Bảng điều khiển': { en: 'Dashboard', 'zh-CN': '控制台' },
  'Chào mừng quay lại, quản lý': { en: 'Welcome back', 'zh-CN': '欢迎回来' },
  'Chúc {restaurant} ngày mới kinh doanh phát đạt.': { en: 'Wishing {restaurant} a great business day.', 'zh-CN': '祝 {restaurant} 今日生意兴隆。' },
  'Chuông đã bật': { en: 'Sound enabled', 'zh-CN': '提示音已开启' },
  'Bật chuông': { en: 'Enable sound', 'zh-CN': '开启提示音' },
  'Đơn mới vừa được đặt': { en: 'A new order was placed', 'zh-CN': '有新订单' },
  'Bàn {table} • {items} dòng món • {amount}': { en: 'Table {table} • {items} items • {amount}', 'zh-CN': '{table} 号桌 • {items} 个菜品 • {amount}' },
  'Cần chọn chi nhánh để quản lý nhà hàng.': { en: 'Select a branch to manage the restaurant.', 'zh-CN': '请选择分店以管理餐厅。' },
  'Cần điền thông tin': { en: 'Required information', 'zh-CN': '请填写必需信息' },
  'Đã gửi thông báo tới {count} người nhận': { en: 'Notification sent to {count} recipients', 'zh-CN': '通知已发送给 {count} 位收件人' },
  'Vui lòng nhập đầy đủ tiêu đề và nội dung': { en: 'Please enter both a title and message', 'zh-CN': '请填写标题和内容' },
  'Vui lòng chọn nhà hàng': { en: 'Please select a restaurant', 'zh-CN': '请选择餐厅' },
  'Không thể gửi thông báo': { en: 'Could not send the notification', 'zh-CN': '无法发送通知' },
  'Gửi thông báo': { en: 'Send notification', 'zh-CN': '发送通知' },
  'Gửi thông báo đến nhà hàng hoặc nhân viên của bạn': { en: 'Send a notification to your restaurants or staff', 'zh-CN': '向你的餐厅或员工发送通知' },
  'Tiêu đề': { en: 'Title', 'zh-CN': '标题' },
  'Nhập tiêu đề thông báo...': { en: 'Enter a notification title…', 'zh-CN': '输入通知标题…' },
  'Nội dung': { en: 'Message', 'zh-CN': '内容' },
  'Nhập nội dung thông báo...': { en: 'Enter a notification message…', 'zh-CN': '输入通知内容…' },
  'Loại thông báo': { en: 'Notification type', 'zh-CN': '通知类型' },
  'Mức ưu tiên': { en: 'Priority', 'zh-CN': '优先级' },
  'Gửi tới': { en: 'Send to', 'zh-CN': '发送给' },
  'Tất cả nhà hàng của tôi': { en: 'All my restaurants', 'zh-CN': '我的所有餐厅' },
  'Một nhà hàng cụ thể': { en: 'A specific restaurant', 'zh-CN': '指定餐厅' },
  'Tất cả nhân viên': { en: 'All staff', 'zh-CN': '所有员工' },
  'Nhân viên một nhà hàng': { en: 'Staff at one restaurant', 'zh-CN': '某家餐厅的员工' },
  'Chọn nhà hàng': { en: 'Select a restaurant', 'zh-CN': '选择餐厅' },
  '-- Chọn nhà hàng --': { en: '-- Select a restaurant --', 'zh-CN': '— 选择餐厅 —' },
  'Đang gửi...': { en: 'Sending…', 'zh-CN': '正在发送…' },
  'Thấp': { en: 'Low', 'zh-CN': '低' },
  'Bình thường': { en: 'Normal', 'zh-CN': '普通' },
  'Doanh thu': { en: 'Revenue', 'zh-CN': '营收' },
  'Số liệu kinh doanh': { en: 'Business metrics', 'zh-CN': '经营数据' },
  'Đang tải báo cáo...': { en: 'Loading report…', 'zh-CN': '正在加载报告…' },
  'Doanh thu tích lũy': { en: 'Total revenue', 'zh-CN': '累计营收' },
  'So với chu kỳ trước': { en: 'Compared with previous period', 'zh-CN': '与上一周期相比' },
  'Số lượng đơn hàng': { en: 'Order count', 'zh-CN': '订单数量' },
  'đơn': { en: 'orders', 'zh-CN': '单' },
  'Đơn hàng trung bình': { en: 'Average order value', 'zh-CN': '平均订单金额' },
  'Đơn hoàn thành / Doanh số': { en: 'Completed orders / revenue', 'zh-CN': '已完成订单 / 营收' },
  'Món bán chạy nhất': { en: 'Top-selling item', 'zh-CN': '最畅销菜品' },
  'Không có': { en: 'None', 'zh-CN': '无' },
  'Đã bán {count} suất': { en: '{count} sold', 'zh-CN': '已售出 {count} 份' },
  'CRM khách hàng dành cho PLUS và PRO': { en: 'Customer CRM is available on PLUS and PRO', 'zh-CN': 'PLUS 和 PRO 套餐提供顾客 CRM' },
  'Nâng cấp gói để xem số điện thoại, số lần ghé và lịch sử gọi món của khách đã cung cấp thông tin.': {
    en: 'Upgrade your plan to view phone numbers, visits, and order history shared by customers.',
    'zh-CN': '升级套餐以查看顾客提供的电话号码、到店次数和点餐记录。'
  },
  'Xem gói dịch vụ': { en: 'View plans', 'zh-CN': '查看套餐' },
  'Thông tin do khách tự nguyện cung cấp khi đặt món.': { en: 'Information customers chose to share when ordering.', 'zh-CN': '顾客点餐时主动提供的信息。' },
  'Tìm theo tên hoặc 4 số cuối': { en: 'Search by name or last 4 digits', 'zh-CN': '按姓名或手机号后四位搜索' },
  'Tìm khách hàng': { en: 'Search customers', 'zh-CN': '搜索顾客' },
  'Tìm kiếm': { en: 'Search', 'zh-CN': '搜索' },
  'Không thể tải danh sách khách hàng.': { en: 'Could not load the customer list.', 'zh-CN': '无法加载顾客列表。' },
  'Đang tải danh sách khách hàng': { en: 'Loading customers', 'zh-CN': '正在加载顾客' },
  'Chưa có dữ liệu khách hàng': { en: 'No customer data yet', 'zh-CN': '暂无顾客数据' },
  'Khách có nhập số điện thoại khi đặt món sẽ xuất hiện tại đây.': { en: 'Customers who provide a phone number when ordering will appear here.', 'zh-CN': '点餐时填写电话号码的顾客会显示在这里。' },
  'Lần ghé:': { en: 'Visits:', 'zh-CN': '到店次数：' },
  'Đơn hàng:': { en: 'Orders:', 'zh-CN': '订单：' },
  'Gần nhất:': { en: 'Last seen:', 'zh-CN': '最近到店：' },
  'Trước': { en: 'Previous', 'zh-CN': '上一页' },
  'Sau': { en: 'Next', 'zh-CN': '下一页' },
  'Trang {page}/{pages}': { en: 'Page {page}/{pages}', 'zh-CN': '第 {page}/{pages} 页' },
  'Theo dõi tin tức hệ thống và các cập nhật mới nhất cho nhà hàng của bạn.': { en: 'Follow system news and the latest updates for your restaurant.', 'zh-CN': '查看系统消息及餐厅最新动态。' },
  'Quản lý Nhân viên': { en: 'Staff management', 'zh-CN': '员工管理' },
  'Tạo tài khoản đăng nhập phục vụ hoặc nấu bếp, giúp tự động hóa quá trình nhận món và cập nhật trạng thái.': { en: 'Create service or kitchen staff accounts to manage orders and status updates.', 'zh-CN': '创建服务员或厨房员工账户，以便处理订单和更新状态。' },
  'Thêm nhân viên mới': { en: 'Add staff member', 'zh-CN': '添加员工' },
  'Đang tải danh sách nhân viên...': { en: 'Loading staff…', 'zh-CN': '正在加载员工列表…' },
  'Nhân viên Bếp / Phục vụ': { en: 'Kitchen / service staff', 'zh-CN': '厨房 / 服务员工' },
  'Sửa nhân viên': { en: 'Edit staff', 'zh-CN': '编辑员工' },
  'Khóa tài khoản': { en: 'Disable account', 'zh-CN': '停用账户' },
  'Mở khóa': { en: 'Enable', 'zh-CN': '启用' },
  'Đã khóa': { en: 'Disabled', 'zh-CN': '已停用' },
  'Tên đăng nhập': { en: 'Username', 'zh-CN': '用户名' },
  'Trạng thái': { en: 'Status', 'zh-CN': '状态' },
  '🟢 Đang hoạt động': { en: '🟢 Active', 'zh-CN': '🟢 使用中' },
  '🔴 Đã khóa': { en: '🔴 Disabled', 'zh-CN': '🔴 已停用' },
  'Khóa': { en: 'Disable', 'zh-CN': '停用' },
  'Mở khóa tài khoản': { en: 'Enable account', 'zh-CN': '启用账户' },
  'Chưa có nhân viên nào': { en: 'No staff members yet', 'zh-CN': '暂无员工' },
  'Bấm nút "Thêm nhân viên mới" để bắt đầu thiết lập nhân sự.': { en: 'Select “Add staff member” to set up your team.', 'zh-CN': '点击“添加员工”以开始设置团队。' },
  'Tên nhân viên': { en: 'Staff name', 'zh-CN': '员工姓名' },
  'Username đăng nhập': { en: 'Login username', 'zh-CN': '登录用户名' },
  'Trạng thái hoạt động': { en: 'Account status', 'zh-CN': '账户状态' },
  'Thao tác': { en: 'Actions', 'zh-CN': '操作' },
  'Bấm nút "Thêm nhân viên mới" để tạo tài khoản phục vụ.': { en: 'Select “Add staff member” to create a service account.', 'zh-CN': '点击“添加员工”以创建服务员账户。' },
  'Đang dùng': { en: 'In use', 'zh-CN': '使用中' },
  'Bàn trống': { en: 'Available', 'zh-CN': '空闲' },
  'Bàn {code} đang có khách hoặc chờ thanh toán, không thể xoá!': { en: 'Table {code} is occupied or awaiting payment and cannot be deleted.', 'zh-CN': '{code} 号桌有顾客或正在等待付款，无法删除。' },
  'Đã xoá Bàn {code} thành công': { en: 'Table {code} deleted successfully', 'zh-CN': '{code} 号桌已成功删除' },
  'Lỗi khi xoá bàn ăn': { en: 'Could not delete the table', 'zh-CN': '删除桌台失败' },
  'Đã sao chép link đặt món Bàn {code}': { en: 'Copied the ordering link for table {code}', 'zh-CN': '已复制 {code} 号桌的点餐链接' },
  'Đã tải thành công ảnh {fileName}': { en: 'Downloaded {fileName}', 'zh-CN': '已下载 {fileName}' },
  'Lỗi khi tải ảnh mã QR': { en: 'Could not download the QR image', 'zh-CN': '无法下载二维码图片' },
  'Chưa có bàn nào để tải mã QR': { en: 'There are no tables to download QR codes for', 'zh-CN': '没有可下载二维码的桌台' },
  'Đã tải thành công trọn bộ ZIP {count} mã QR bàn!': { en: 'Downloaded a ZIP containing {count} table QR codes!', 'zh-CN': '已下载包含 {count} 个桌台二维码的 ZIP 文件！' },
  'Lỗi khi nén và tải mã QR': { en: 'Could not package and download the QR codes', 'zh-CN': '无法打包并下载二维码' },
  'Đã tải xong {count} file ảnh mã QR!': { en: 'Downloaded {count} QR images!', 'zh-CN': '已下载 {count} 张二维码图片！' },
  'Lỗi khi tải mã QR': { en: 'Could not download QR codes', 'zh-CN': '无法下载二维码' },
  'Đang xử lý...': { en: 'Processing…', 'zh-CN': '处理中…' },
  'Tải tất cả mã QR': { en: 'Download all QR codes', 'zh-CN': '下载全部二维码' },
  'Tải file nén ZIP': { en: 'Download as ZIP', 'zh-CN': '下载 ZIP 压缩包' },
  'Gói toàn bộ {count} ảnh (ban1.jpg, ban2.jpg...) trong 1 tệp ZIP duy nhất.': { en: 'Package all {count} images (table1.jpg, table2.jpg, etc.) in one ZIP file.', 'zh-CN': '将全部 {count} 张图片（table1.jpg、table2.jpg 等）打包到一个 ZIP 文件中。' },
  'Tải từng file rời (.jpg)': { en: 'Download individual JPG files', 'zh-CN': '逐个下载 JPG 文件' },
  'Tự động lưu lần lượt từng ảnh ban1.jpg, ban2.jpg trực tiếp vào máy.': { en: 'Download each table image directly to your device.', 'zh-CN': '将每张桌台图片依次直接保存到设备。' },
  'Đồng bộ bàn ăn & Sinh mã QR': { en: 'Sync tables & generate QR codes', 'zh-CN': '同步桌台并生成二维码' },
  'Sinh mã QR code dán bàn. Khách quét QR để xem thực đơn & đặt món tại chỗ mà không cần gọi nhân viên.': { en: 'Generate table QR codes so guests can view the menu and order without calling staff.', 'zh-CN': '生成桌台二维码，顾客扫码即可查看菜单并点餐，无需呼叫员工。' },
  'Số lượng bàn hoạt động tại nhà hàng': { en: 'Number of active tables', 'zh-CN': '营业桌台数量' },
  'Nhập tổng số bàn (VD: 15)': { en: 'Enter total tables (e.g. 15)', 'zh-CN': '输入桌台总数（例如：15）' },
  'Đang đồng bộ...': { en: 'Syncing…', 'zh-CN': '正在同步…' },
  'Đồng bộ số bàn': { en: 'Sync table count', 'zh-CN': '同步桌台数量' },
  'Tổng quan trạng thái bàn': { en: 'Table status overview', 'zh-CN': '桌台状态概览' },
  'Danh sách bàn': { en: 'Table list', 'zh-CN': '桌台列表' },
  'Mã QR đặt món định danh từng bàn': { en: 'Unique ordering QR code for each table', 'zh-CN': '每张桌台对应的专属点餐二维码' },
  'Bàn {code}': { en: 'Table {code}', 'zh-CN': '{code} 号桌' },
  'Đường dẫn gọi món': { en: 'Ordering link', 'zh-CN': '点餐链接' },
  'Sao chép link': { en: 'Copy link', 'zh-CN': '复制链接' },
  'Hiển thị mã QR bàn {code}': { en: 'Show QR code for table {code}', 'zh-CN': '显示 {code} 号桌二维码' },
  'Xem QR': { en: 'View QR', 'zh-CN': '查看二维码' },
  'Tải ảnh {fileName}': { en: 'Download {fileName}', 'zh-CN': '下载 {fileName}' },
  'Tải ảnh': { en: 'Download image', 'zh-CN': '下载图片' },
  'Xoá bàn {code}': { en: 'Delete table {code}', 'zh-CN': '删除 {code} 号桌' },
  'Xoá bàn': { en: 'Delete table', 'zh-CN': '删除桌台' },
  'Chưa có bàn ăn nào được lưu': { en: 'No tables have been saved yet', 'zh-CN': '尚未保存任何桌台' },
  'Đồng bộ số lượng bàn hoạt động phía trên để tạo mã QR tự động.': { en: 'Sync the number of active tables above to generate QR codes.', 'zh-CN': '在上方同步营业桌台数量以自动生成二维码。' },
  'Danh sách bàn & mã QR dẫn bàn': { en: 'Tables & ordering QR codes', 'zh-CN': '桌台与点餐二维码' },
  '{count} bàn': { en: '{count} tables', 'zh-CN': '{count} 张桌台' },
  'Mỗi bàn có mã QR riêng biệt. Tải ảnh JPG độ phân giải cao sẵn sàng in ấn standee để bàn.': { en: 'Each table has a unique QR code. Download high-resolution JPG images ready for tabletop printing.', 'zh-CN': '每张桌台都有专属二维码，可下载高分辨率 JPG 图片用于桌牌打印。' },
  'Mã bàn': { en: 'Table code', 'zh-CN': '桌台编号' },
  'Đường dẫn đặt món tại bàn': { en: 'Dine-in ordering link', 'zh-CN': '桌台点餐链接' },
  'Xem mã QR lớn': { en: 'View large QR code', 'zh-CN': '查看大尺寸二维码' },
  'Xem': { en: 'View', 'zh-CN': '查看' },
  'Mở thao tác bàn {code}': { en: 'Open actions for table {code}', 'zh-CN': '打开 {code} 号桌的操作菜单' },
  'Thao tác khác': { en: 'More actions', 'zh-CN': '更多操作' },
  'Đang xuất mã QR bàn ăn': { en: 'Exporting table QR codes', 'zh-CN': '正在导出桌台二维码' },
  'Hệ thống đang kết xuất file ảnh JPG độ phân giải cao cho từng bàn...': { en: 'Creating high-resolution JPG images for each table…', 'zh-CN': '正在为每张桌台生成高分辨率 JPG 图片…' },
  'Đang tạo: {fileName}': { en: 'Creating: {fileName}', 'zh-CN': '正在创建：{fileName}' },
  'Đang xử lý tệp nén...': { en: 'Preparing archive…', 'zh-CN': '正在准备压缩包…' },
  'Vui lòng không đóng trang. File sẽ tự động tải xuống sau khi hoàn tất.': { en: 'Keep this page open. The file will download automatically when ready.', 'zh-CN': '请勿关闭此页面，完成后文件将自动下载。' },
  'Xác nhận xoá Bàn {code}': { en: 'Confirm deletion of table {code}', 'zh-CN': '确认删除 {code} 号桌' },
  'Bạn có chắc chắn muốn xoá bàn này không? Mã QR và thông tin bàn sẽ bị xoá khỏi hệ thống.': { en: 'Are you sure you want to delete this table? Its QR code and table information will be removed.', 'zh-CN': '确定要删除此桌台吗？其二维码和桌台信息将从系统中移除。' },
  'Bàn này đang có phiên khách hoạt động ({status}). Bạn cần đóng phiên trước khi có thể xoá bàn.': { en: 'This table has an active guest session ({status}). Close the session before deleting the table.', 'zh-CN': '此桌台有正在进行的顾客会话（{status}），请先关闭会话再删除桌台。' },
  'Huỷ': { en: 'Cancel', 'zh-CN': '取消' },
  'Đang xoá...': { en: 'Deleting…', 'zh-CN': '正在删除…' },
  'Xác nhận xoá': { en: 'Confirm deletion', 'zh-CN': '确认删除' },
  'Quản lý Món ăn (Menu)': { en: 'Menu management', 'zh-CN': '菜单管理' },
  'Quản lý danh sách món ăn, giá bán và thông tin dị ứng đã xác minh.': { en: 'Manage menu items, prices, and verified allergen information.', 'zh-CN': '管理菜品、价格和已核实的过敏原信息。' },
  'Dịch menu hàng loạt': { en: 'Translate menu in bulk', 'zh-CN': '批量翻译菜单' },
  'Cần xác nhận dị ứng ({count})': { en: 'Allergen review needed ({count})', 'zh-CN': '需要确认过敏原（{count}）' },
  'Sao chép thực đơn': { en: 'Copy menu', 'zh-CN': '复制菜单' },
  'Thêm món mới': { en: 'Add menu item', 'zh-CN': '添加菜品' },
  'Đang tải danh sách món ăn…': { en: 'Loading menu items…', 'zh-CN': '正在加载菜品列表…' },
  'Dịch Anh / Trung': { en: 'Translate to English / Chinese', 'zh-CN': '翻译成英文 / 中文' },
  'Sửa xác nhận dị ứng': { en: 'Edit allergen review', 'zh-CN': '编辑过敏原确认' },
  'Xác nhận dị ứng': { en: 'Review allergens', 'zh-CN': '确认过敏原' },
  'Chỉnh sửa': { en: 'Edit', 'zh-CN': '编辑' },
  'Xóa món ăn': { en: 'Delete item', 'zh-CN': '删除菜品' },
  'Có chứa:': { en: 'Contains:', 'zh-CN': '含有：' },
  'đã xác nhận không có allergen trong danh sách hỗ trợ': { en: 'verified to contain no allergens in the supported list', 'zh-CN': '已确认不含支持列表中的过敏原' },
  'Ứng viên allergen:': { en: 'Potential allergens:', 'zh-CN': '可能含有的过敏原：' },
  'chưa có dữ liệu': { en: 'no data yet', 'zh-CN': '暂无数据' },
  '· Đã xác nhận': { en: '· Reviewed', 'zh-CN': '· 已确认' },
  '· Chưa xác minh': { en: '· Not verified', 'zh-CN': '· 未核实' },
  '· {count} nguyên liệu chưa xác minh': { en: '· {count} ingredients not verified', 'zh-CN': '· {count} 种食材尚未核实' },
  'Bán': { en: 'Available', 'zh-CN': '在售' },
  'Ngưng': { en: 'Unavailable', 'zh-CN': '停售' },
  'Không còn món cần xác nhận': { en: 'No items need review', 'zh-CN': '没有待确认的菜品' },
  'Chưa có món ăn nào': { en: 'No menu items yet', 'zh-CN': '暂无菜品' },
  'Các món trong thực đơn đã được xác nhận allergen.': { en: 'All menu items have verified allergen information.', 'zh-CN': '菜单中的菜品均已确认过敏原信息。' },
  'Bấm nút "Thêm món mới" để bắt đầu thiết lập menu.': { en: 'Select “Add menu item” to start building your menu.', 'zh-CN': '点击“添加菜品”以开始设置菜单。' },
  'Món': { en: 'Item', 'zh-CN': '菜品' },
  'Tên món': { en: 'Item name', 'zh-CN': '菜品名称' },
  'Giá': { en: 'Price', 'zh-CN': '价格' },
  'Chỉ số QDish': { en: 'QDish score', 'zh-CN': 'QDish 指数' },
  'Quản lý Danh mục món ăn': { en: 'Menu categories', 'zh-CN': '菜品分类管理' },
  'Phân loại món ăn theo các nhóm chính để khách hàng dễ dàng tìm kiếm.': { en: 'Organize menu items into groups so customers can find them easily.', 'zh-CN': '将菜品整理到不同分类，方便顾客查找。' },
  'Thêm danh mục': { en: 'Add category', 'zh-CN': '添加分类' },
  'ID Danh mục': { en: 'Category ID', 'zh-CN': '分类 ID' },
  'Tên danh mục': { en: 'Category name', 'zh-CN': '分类名称' },
  'Số món': { en: 'Item count', 'zh-CN': '菜品数量' },
  'Xóa danh mục': { en: 'Delete category', 'zh-CN': '删除分类' },
  'Chưa có danh mục nào': { en: 'No categories yet', 'zh-CN': '暂无分类' },
  'Bấm nút "Thêm danh mục" để bắt đầu thiết lập menu.': { en: 'Select “Add category” to start organizing your menu.', 'zh-CN': '点击“添加分类”以开始整理菜单。' },
  'Đang tải danh mục…': { en: 'Loading categories…', 'zh-CN': '正在加载分类…' },
  'Chưa thanh toán': { en: 'Unpaid', 'zh-CN': '未付款' },
  'Đã thanh toán': { en: 'Paid', 'zh-CN': '已付款' },
  'Đã hủy': { en: 'Cancelled', 'zh-CN': '已取消' },
  'Hóa đơn / Bill': { en: 'Bills', 'zh-CN': '账单' },
  'Theo dõi bill gom nhiều lần đặt món trong cùng một phiên bàn.': { en: 'Track bills that group multiple orders from the same table session.', 'zh-CN': '查看同一桌台会话中合并的多笔点餐账单。' },
  'Làm mới': { en: 'Refresh', 'zh-CN': '刷新' },
  'Lọc theo bàn': { en: 'Filter by table', 'zh-CN': '按桌台筛选' },
  'Tất cả trạng thái': { en: 'All statuses', 'zh-CN': '所有状态' },
  'Không thể tải lịch sử hóa đơn': { en: 'Could not load bill history', 'zh-CN': '无法加载账单记录' },
  'Không thể tải chi tiết hóa đơn': { en: 'Could not load bill details', 'zh-CN': '无法加载账单详情' },
  'Bàn ăn': { en: 'Table', 'zh-CN': '桌台' },
  'Bàn {table}': { en: 'Table {table}', 'zh-CN': '{table} 号桌' },
  'Mã Hóa Đơn': { en: 'Bill code', 'zh-CN': '账单编号' },
  'Tổng số món': { en: 'Total items', 'zh-CN': '菜品总数' },
  'Tổng tiền': { en: 'Total amount', 'zh-CN': '总金额' },
  'Thanh toán:': { en: 'Paid:', 'zh-CN': '付款时间：' },
  '{count} món': { en: '{count} items', 'zh-CN': '{count} 道菜' },
  'Chưa có bill phù hợp': { en: 'No matching bills', 'zh-CN': '没有符合条件的账单' },
  'Bill sẽ xuất hiện sau khi khách bắt đầu đặt món.': { en: 'Bills will appear after customers start placing orders.', 'zh-CN': '顾客开始点餐后，账单会显示在这里。' },
  'Bill sẽ xuất hiện sau khi khách bắt đầu đặt món trong phiên bàn.': { en: 'Bills will appear after customers start ordering during a table session.', 'zh-CN': '顾客在桌台会话中开始点餐后，账单会显示在这里。' },
  'Mã bill': { en: 'Bill code', 'zh-CN': '账单编号' },
  'Bàn': { en: 'Table', 'zh-CN': '桌台' },
  'Tổng món': { en: 'Items', 'zh-CN': '菜品总数' },
  'Thanh toán lúc': { en: 'Paid at', 'zh-CN': '付款时间' },
  'Chi tiết': { en: 'Details', 'zh-CN': '详情' },
  'Chi tiết bill {billCode}': { en: 'Bill details: {billCode}', 'zh-CN': '账单详情：{billCode}' },
  'Đang tải...': { en: 'Loading…', 'zh-CN': '正在加载…' },
  'Món đã gom': { en: 'Items in this bill', 'zh-CN': '账单中的菜品' },
  'Các order trong bill': { en: 'Orders in this bill', 'zh-CN': '账单中的订单' },
  'Tổng thanh toán:': { en: 'Total due:', 'zh-CN': '应付总额：' },
  'Chờ duyệt': { en: 'Pending review', 'zh-CN': '待确认' },
  'Bếp nhận': { en: 'Accepted by kitchen', 'zh-CN': '厨房已接单' },
  'Đã ra món': { en: 'Served', 'zh-CN': '已上菜' },
  'Hoàn thành': { en: 'Completed', 'zh-CN': '已完成' },
  'Đã phục vụ': { en: 'Served', 'zh-CN': '已上菜' },
  'Đơn hàng theo bill': { en: 'Orders by bill', 'zh-CN': '按账单查看订单' },
  'Mỗi bill gom nhiều order trong cùng phiên bàn. Thanh toán chỉ thực hiện ở cấp bill.': { en: 'Each bill groups orders from one table session. Payment is handled at the bill level.', 'zh-CN': '每张账单合并同一桌台会话中的多笔订单。付款以账单为单位处理。' },
  'Tìm bill, bàn, mã đơn, món...': { en: 'Search bills, tables, order IDs, or items…', 'zh-CN': '搜索账单、桌台、订单编号或菜品…' },
  'Chưa có đơn hàng nào': { en: 'No orders yet', 'zh-CN': '暂无订单' },
  'Bill và order sẽ xuất hiện sau khi khách đặt món trong phiên bàn.': { en: 'Bills and orders will appear after a customer places an order during a table session.', 'zh-CN': '顾客在桌台会话中点餐后，账单和订单会显示在这里。' },
  'Chưa có đơn chờ duyệt': { en: 'No orders awaiting review', 'zh-CN': '没有待确认的订单' },
  'Các bill có order mới chờ xác nhận sẽ hiển thị tại đây.': { en: 'Bills with new orders awaiting confirmation will appear here.', 'zh-CN': '有待确认新订单的账单会显示在这里。' },
  'Chưa có đơn bếp đã nhận': { en: 'No kitchen-accepted orders', 'zh-CN': '没有厨房已接单的订单' },
  'Các bill có order đã được bếp nhận sẽ hiển thị tại đây.': { en: 'Bills with orders accepted by the kitchen will appear here.', 'zh-CN': '厨房已接单的账单会显示在这里。' },
  'Chưa có đơn đã phục vụ': { en: 'No served orders', 'zh-CN': '没有已上菜的订单' },
  'Các bill đã ra món nhưng chưa thanh toán sẽ hiển thị tại đây.': { en: 'Bills with served but unpaid orders will appear here.', 'zh-CN': '已上菜但尚未付款的账单会显示在这里。' },
  'Chưa có hóa đơn hoàn thành': { en: 'No completed bills', 'zh-CN': '没有已完成的账单' },
  'Bill đã thanh toán sẽ nằm trong lịch sử hoàn thành.': { en: 'Paid bills will appear in completed history.', 'zh-CN': '已付款的账单会显示在完成记录中。' },
  'Chưa có hóa đơn đã hủy': { en: 'No cancelled bills', 'zh-CN': '没有已取消的账单' },
  'Bill hoặc order đã hủy sẽ hiển thị tại đây khi có phát sinh.': { en: 'Cancelled bills or orders will appear here when available.', 'zh-CN': '有已取消的账单或订单时会显示在这里。' },
  'Tổng bill': { en: 'Bill total', 'zh-CN': '账单总额' },
  'Thanh toán bill': { en: 'Pay bill', 'zh-CN': '支付账单' },
  'Ghi chú:': { en: 'Note:', 'zh-CN': '备注：' },
  'Đang cập nhật…': { en: 'Updating…', 'zh-CN': '正在更新…' },
  'Xác nhận': { en: 'Confirm', 'zh-CN': '确认' },
  'Đang ra món…': { en: 'Marking as served…', 'zh-CN': '正在标记为已上菜…' },
  'Ra món': { en: 'Mark as served', 'zh-CN': '标记为已上菜' },
  'Chờ thanh toán bill': { en: 'Awaiting bill payment', 'zh-CN': '等待账单付款' },
  'Hủy đơn hàng': { en: 'Cancel order', 'zh-CN': '取消订单' },
  'Đã copy mã đơn hàng': { en: 'Order ID copied', 'zh-CN': '订单编号已复制' },
  'Sao chép mã đơn': { en: 'Copy order ID', 'zh-CN': '复制订单编号' },
  'Không thể tải ngôn ngữ giao diện': { en: 'Could not load interface language', 'zh-CN': '无法加载界面语言' }
  , 'Quản lý Nguyên liệu': { en: 'Ingredient management', 'zh-CN': '食材管理' }
  , 'Quản lý nguyên liệu tùy chỉnh của nhà hàng và xem các nguyên liệu mặc định từ hệ thống.': { en: 'Manage restaurant ingredients and review system defaults.', 'zh-CN': '管理餐厅自定义食材并查看系统默认食材。' }
  , 'Thêm nguyên liệu': { en: 'Add ingredient', 'zh-CN': '添加食材' }
  , 'Tìm theo tên nguyên liệu...': { en: 'Search ingredients by name…', 'zh-CN': '按食材名称搜索…' }
  , 'Tất cả loại': { en: 'All categories', 'zh-CN': '全部类别' }
  , 'Tất cả nguồn': { en: 'All sources', 'zh-CN': '全部来源' }
  , 'Loại:': { en: 'Category:', 'zh-CN': '类别：' }
  , 'Nguồn:': { en: 'Source:', 'zh-CN': '来源：' }
  , 'Loại': { en: 'Category', 'zh-CN': '类别' }
  , 'Dinh dưỡng': { en: 'Nutrition', 'zh-CN': '营养' }
  , 'Nguồn': { en: 'Source', 'zh-CN': '来源' }
  , 'Mặc định: {unit}': { en: 'Default: {unit}', 'zh-CN': '默认单位：{unit}' }
  , 'Đơn vị: {unit}': { en: 'Unit: {unit}', 'zh-CN': '单位：{unit}' }
  , 'Đã xác minh: {allergens}': { en: 'Verified: {allergens}', 'zh-CN': '已确认：{allergens}' }
  , 'Ứng viên chưa xác minh: {allergens}': { en: 'Unverified candidate: {allergens}', 'zh-CN': '待确认候选：{allergens}' }
  , 'không có allergen trong danh sách hỗ trợ': { en: 'no supported allergens listed', 'zh-CN': '没有支持的过敏原记录' }
  , 'Chủ quán': { en: 'Owner', 'zh-CN': '店主' }
  , 'Sửa': { en: 'Edit', 'zh-CN': '编辑' }
  , 'Xóa': { en: 'Delete', 'zh-CN': '删除' }
  , 'Xóa nguyên liệu': { en: 'Delete ingredient', 'zh-CN': '删除食材' }
  , 'Calo:': { en: 'Calories:', 'zh-CN': '热量：' }
  , 'Đạm:': { en: 'Protein:', 'zh-CN': '蛋白质：' }
  , 'Béo:': { en: 'Fat:', 'zh-CN': '脂肪：' }
  , 'Chưa có nguyên liệu nào': { en: 'No ingredients yet', 'zh-CN': '暂无食材' }
  , 'Tạo nguyên liệu đầu tiên để sử dụng Recipe Builder và xây dựng thực đơn tối ưu hóa sức khỏe cho nhà hàng của bạn.': { en: 'Add your first ingredient to use Recipe Builder and create a health-focused menu.', 'zh-CN': '添加第一种食材，以使用配方编辑器并打造更健康的餐厅菜单。' }
  , 'Thêm nguyên liệu đầu tiên': { en: 'Add your first ingredient', 'zh-CN': '添加第一种食材' }
  , 'Hiển thị bản ghi {from} - {to} trên tổng số {total}': { en: 'Showing {from}–{to} of {total} records', 'zh-CN': '显示第 {from}–{to} 条，共 {total} 条' }
  , 'Không thể tải danh sách nguyên liệu': { en: 'Could not load ingredients', 'zh-CN': '无法加载食材列表' }
  , 'Đã cập nhật nguyên liệu tùy chỉnh thành công': { en: 'Custom ingredient updated.', 'zh-CN': '自定义食材已更新。' }
  , 'Đã tạo nguyên liệu tùy chỉnh thành công': { en: 'Custom ingredient created.', 'zh-CN': '自定义食材已创建。' }
  , 'Bạn có chắc muốn xóa nguyên liệu tùy chỉnh này vĩnh viễn?': { en: 'Are you sure you want to permanently delete this custom ingredient?', 'zh-CN': '确定要永久删除此自定义食材吗？' }
  , 'Đã xóa nguyên liệu thành công': { en: 'Ingredient deleted.', 'zh-CN': '食材已删除。' }
  , 'Lỗi khi xóa nguyên liệu': { en: 'Could not delete ingredient', 'zh-CN': '删除食材失败' }
  , 'Loại nguyên liệu · Đạm': { en: '🥩 Protein', 'zh-CN': '🥩 蛋白质' }
  , 'Loại nguyên liệu · Tinh bột': { en: '🌾 Carbohydrates', 'zh-CN': '🌾 碳水化合物' }
  , 'Loại nguyên liệu · Chất béo': { en: '🫒 Fats', 'zh-CN': '🫒 脂肪' }
  , 'Loại nguyên liệu · Rau củ': { en: '🥦 Vegetables', 'zh-CN': '🥦 蔬菜' }
  , 'Loại nguyên liệu · Gia vị': { en: '🧂 Seasonings', 'zh-CN': '🧂 调味料' }
  , 'Loại nguyên liệu · Sữa & Dairy': { en: '🥛 Dairy', 'zh-CN': '🥛 乳制品' }
  , 'Nguồn nguyên liệu · Tất cả': { en: 'All sources', 'zh-CN': '全部来源' }
  , 'Nguồn nguyên liệu · Hệ thống': { en: '🌐 System', 'zh-CN': '🌐 系统' }
  , 'Nguồn nguyên liệu · Tùy chỉnh': { en: '🏪 Custom', 'zh-CN': '🏪 自定义' }
  , 'Lỗi khi lưu nguyên liệu': { en: 'Could not save ingredient', 'zh-CN': '保存食材失败' }
  , 'Vui lòng nhập tên nguyên liệu': { en: 'Enter an ingredient name', 'zh-CN': '请输入食材名称' }
  , 'Vui lòng nhập khối lượng quy đổi cho 1 cái': { en: 'Enter the gram weight for one piece', 'zh-CN': '请输入每件对应的克数' }
  , 'Khi xác nhận allergen, cần ghi nguồn và nội dung đã đối chiếu (tối đa 500 ký tự)': { en: 'When confirming allergens, provide the source and verification details (up to 500 characters).', 'zh-CN': '确认过敏原时，请填写来源和核对内容（最多 500 个字符）。' }
  , 'Chi tiết nguyên liệu': { en: 'Ingredient details', 'zh-CN': '食材详情' }
  , 'Sửa nguyên liệu hệ thống': { en: 'Edit system ingredient', 'zh-CN': '编辑系统食材' }
  , 'Sửa nguyên liệu tùy chỉnh': { en: 'Edit custom ingredient', 'zh-CN': '编辑自定义食材' }
  , 'Thêm nguyên liệu hệ thống': { en: 'Add system ingredient', 'zh-CN': '添加系统食材' }
  , 'Thêm nguyên liệu tùy chỉnh': { en: 'Add custom ingredient', 'zh-CN': '添加自定义食材' }
  , 'Xem chi tiết thông tin cơ bản, hàm lượng dinh dưỡng và chất gây dị ứng của nguyên liệu.': { en: 'Review the ingredient details, nutrition values, and allergens.', 'zh-CN': '查看食材的基本信息、营养含量和过敏原。' }
  , 'Dữ liệu này sẽ xuất hiện làm mặc định cho tất cả các nhà hàng để so khớp dinh dưỡng.': { en: 'This ingredient will be available as a system default for nutrition matching across restaurants.', 'zh-CN': '此食材将作为系统默认项，供所有餐厅进行营养匹配。' }
  , 'Dữ liệu nguyên liệu custom chỉ có hiệu lực và hiển thị riêng cho nhà hàng này.': { en: 'Custom ingredient data is visible only to this restaurant.', 'zh-CN': '自定义食材仅在此餐厅内生效并显示。' }
  , 'Thông tin cơ bản': { en: 'Basic information', 'zh-CN': '基本信息' }
  , 'Giá trị dinh dưỡng': { en: 'Nutrition values', 'zh-CN': '营养成分' }
  , 'Chất gây dị ứng': { en: 'Allergens', 'zh-CN': '过敏原' }
  , 'Tên nguyên liệu *': { en: 'Ingredient name *', 'zh-CN': '食材名称 *' }
  , 'Ví dụ: Ức gà áp chảo, Bơ lạt Anchor...': { en: 'Example: grilled chicken breast, Anchor unsalted butter…', 'zh-CN': '例如：香煎鸡胸肉、Anchor 无盐黄油…' }
  , 'Phân loại *': { en: 'Category *', 'zh-CN': '类别 *' }
  , 'Đơn vị mặc định *': { en: 'Default unit *', 'zh-CN': '默认单位 *' }
  , 'Khối lượng quy đổi (g / cái) *': { en: 'Weight per piece (g) *', 'zh-CN': '每件重量（克）*' }
  , 'Nhập hàm lượng giá trị dinh dưỡng dựa trên {amount} nguyên liệu.': { en: 'Enter nutrition values per {amount} of ingredient.', 'zh-CN': '请按每 {amount} 食材填写营养成分。' }
  , 'Đạm (g)': { en: 'Protein (g)', 'zh-CN': '蛋白质（克）' }
  , 'Béo (g)': { en: 'Fat (g)', 'zh-CN': '脂肪（克）' }
  , 'Chất xơ (g)': { en: 'Fiber (g)', 'zh-CN': '膳食纤维（克）' }
  , 'Đường (g)': { en: 'Sugar (g)', 'zh-CN': '糖（克）' }
  , 'Muối/Natri (mg)': { en: 'Salt/Sodium (mg)', 'zh-CN': '盐/钠（毫克）' }
  , 'Đã xác nhận: không có allergen trong danh sách hỗ trợ.': { en: 'Confirmed: no allergens from the supported list.', 'zh-CN': '已确认：不含支持列表中的过敏原。' }
  , 'Đã xác nhận allergen được chọn bên dưới.': { en: 'The allergens selected below are confirmed.', 'zh-CN': '已确认下方所选过敏原。' }
  , 'Các mã bên dưới mới là ứng viên, chưa được xác minh.': { en: 'The entries below are candidates and have not been verified.', 'zh-CN': '下方项目仅为候选项，尚未核实。' }
  , 'Chưa có dữ liệu allergen được xác minh.': { en: 'No verified allergen data yet.', 'zh-CN': '暂无已核实的过敏原数据。' }
  , 'không rõ': { en: 'unknown', 'zh-CN': '未知' }
  , 'Chọn các chất gây dị ứng có trong nguyên liệu này:': { en: 'Select the allergens present in this ingredient:', 'zh-CN': '请选择此食材中含有的过敏原：' }
  , 'Tôi đã kiểm tra và xác nhận danh sách trên. Nếu để trống, tôi xác nhận nguyên liệu không có allergen nào trong danh sách hỗ trợ.': { en: 'I checked and confirm the list above. If left empty, I confirm this ingredient contains none of the supported allergens.', 'zh-CN': '我已核对并确认上述列表。若留空，即确认此食材不含支持列表中的过敏原。' }
  , 'Nguồn xác nhận': { en: 'Verification source', 'zh-CN': '核对来源' }
  , 'Nhãn nhà cung cấp': { en: 'Supplier label', 'zh-CN': '供应商标签' }
  , 'Công thức nhà hàng': { en: 'Restaurant recipe', 'zh-CN': '餐厅配方' }
  , 'Nhân viên đối chiếu': { en: 'Staff verification', 'zh-CN': '员工核对' }
  , 'Mô tả thực đơn (cần nhân viên đối chiếu)': { en: 'Menu description (staff verification required)', 'zh-CN': '菜单描述（需员工核对）' }
  , 'Danh mục nguyên liệu tham khảo (chỉ ứng viên)': { en: 'Reference ingredient catalog (candidate only)', 'zh-CN': '参考食材目录（仅为候选）' }
  , 'Ghi chú nguồn / nội dung đã đối chiếu *': { en: 'Source / verification notes *', 'zh-CN': '来源/核对说明 *' }
  , 'Ví dụ: Theo nhãn nhà cung cấp, thành phần có đậu phộng.': { en: 'Example: Supplier label lists peanuts as an ingredient.', 'zh-CN': '例如：供应商标签注明配料含花生。' }
  , 'Gỡ xác nhận hiện tại và đưa nguyên liệu về trạng thái chưa xác minh.': { en: 'Remove the current confirmation and mark this ingredient as unverified.', 'zh-CN': '撤销当前确认，并将此食材设为未核实。' }
  , 'Lưu nguyên liệu': { en: 'Save ingredient', 'zh-CN': '保存食材' }
  , 'Calo (kcal)': { en: 'Calories (kcal)', 'zh-CN': '热量（千卡）' }
  , 'Carbs (g)': { en: 'Carbs (g)', 'zh-CN': '碳水化合物（克）' }
  , 'Phân loại nguyên liệu · Đạm': { en: '🥩 Protein', 'zh-CN': '🥩 蛋白质' }
  , 'Phân loại nguyên liệu · Tinh bột': { en: '🌾 Carbohydrates', 'zh-CN': '🌾 碳水化合物' }
  , 'Phân loại nguyên liệu · Chất béo': { en: '🫒 Fat', 'zh-CN': '🫒 脂肪' }
  , 'Phân loại nguyên liệu · Rau củ': { en: '🥦 Vegetables', 'zh-CN': '🥦 蔬菜' }
  , 'Phân loại nguyên liệu · Gia vị': { en: '🧂 Seasonings', 'zh-CN': '🧂 调味料' }
  , 'Phân loại nguyên liệu · Sữa': { en: '🥛 Dairy', 'zh-CN': '🥛 乳制品' }
  , 'Đơn vị · Cái': { en: 'Piece', 'zh-CN': '个' }
  , 'Dị ứng · Sữa': { en: 'Dairy', 'zh-CN': '乳制品' }
  , 'Dị ứng · Trứng': { en: 'Eggs', 'zh-CN': '鸡蛋' }
  , 'Dị ứng · Đậu nành': { en: 'Soy', 'zh-CN': '大豆' }
  , 'Dị ứng · Đậu phộng': { en: 'Peanuts', 'zh-CN': '花生' }
  , 'Dị ứng · Hạt cây': { en: 'Tree nuts', 'zh-CN': '树坚果' }
  , 'Dị ứng · Mè': { en: 'Sesame', 'zh-CN': '芝麻' }
  , 'Dị ứng · Cá': { en: 'Fish', 'zh-CN': '鱼类' }
  , 'Dị ứng · Hải sản có vỏ': { en: 'Shellfish', 'zh-CN': '甲壳类' }
  , 'Vui lòng nhập tên danh mục': { en: 'Enter a category name', 'zh-CN': '请输入分类名称' }
  , 'Sửa danh mục': { en: 'Edit category', 'zh-CN': '编辑分类' }
  , 'Thêm danh mục mới': { en: 'Add a new category', 'zh-CN': '添加新分类' }
  , 'Tạo tên danh mục duy nhất trong thực đơn.': { en: 'Choose a unique category name for this menu.', 'zh-CN': '为此菜单设置一个唯一的分类名称。' }
  , 'Tên danh mục *': { en: 'Category name *', 'zh-CN': '分类名称 *' }
  , 'VD: Khai vị, Healthy Bread': { en: 'Example: Starters, Healthy Bread', 'zh-CN': '例如：前菜、健康面包' }
  , 'Lưu danh mục': { en: 'Save category', 'zh-CN': '保存分类' }
  , 'Vui lòng điền đầy đủ các thông tin bắt buộc': { en: 'Complete all required fields', 'zh-CN': '请填写所有必填项' }
  , 'Sửa tài khoản nhân viên': { en: 'Edit staff account', 'zh-CN': '编辑员工账户' }
  , 'Tạo tài khoản đăng nhập cho nhân viên bếp hoặc chạy bàn.': { en: 'Create a login for kitchen or service staff.', 'zh-CN': '为厨房或服务员工创建登录账户。' }
  , 'Tên hiển thị *': { en: 'Display name *', 'zh-CN': '显示名称 *' }
  , 'Username đăng nhập *': { en: 'Login username *', 'zh-CN': '登录用户名 *' }
  , 'Mật khẩu': { en: 'Password', 'zh-CN': '密码' }
  , '(Để trống nếu không đổi)': { en: '(Leave blank to keep current password)', 'zh-CN': '（不修改请留空）' }
  , 'Lưu tài khoản': { en: 'Save account', 'zh-CN': '保存账户' }
  , 'Vui lòng chọn đúng file ảnh': { en: 'Choose a valid image file', 'zh-CN': '请选择有效的图片文件' }
  , 'Ảnh không được vượt quá 5MB': { en: 'Image must be 5 MB or smaller', 'zh-CN': '图片大小不能超过 5MB' }
  , 'Đã upload ảnh món ăn': { en: 'Menu image uploaded.', 'zh-CN': '菜品图片已上传。' }
  , 'Không thể upload ảnh': { en: 'Could not upload image', 'zh-CN': '无法上传图片' }
  , 'Tên món ăn là bắt buộc': { en: 'Dish name is required', 'zh-CN': '菜品名称为必填项' }
  , 'Giá món ăn phải lớn hơn 0': { en: 'Dish price must be greater than zero', 'zh-CN': '菜品价格必须大于 0' }
  , 'Danh mục món ăn là bắt buộc': { en: 'Dish category is required', 'zh-CN': '菜品分类为必填项' }
  , 'Vui lòng nhập danh sách nguyên liệu trong tab Recipe Builder để hoàn tất tạo món ăn.': { en: 'Add ingredients in Recipe Builder to finish creating this dish.', 'zh-CN': '请在配方编辑器中添加食材以完成菜品创建。' }
  , 'Cập nhật món ăn': { en: 'Edit dish', 'zh-CN': '编辑菜品' }
  , 'Thêm món ăn mới': { en: 'Add a dish', 'zh-CN': '添加菜品' }
  , 'Cung cấp thông tin món ăn. Dùng Recipe Builder để tính dinh dưỡng tự động.': { en: 'Enter dish details. Use Recipe Builder to calculate nutrition automatically.', 'zh-CN': '填写菜品信息，并使用配方编辑器自动计算营养成分。' }
  , 'Yêu cầu nhập nguyên liệu': { en: 'Ingredients are required', 'zh-CN': '需要填写食材' }
  , 'Hình ảnh': { en: 'Image', 'zh-CN': '图片' }
  , 'Dán URL...': { en: 'Paste URL…', 'zh-CN': '粘贴 URL…' }
  , 'Preview ảnh món': { en: 'Dish image preview', 'zh-CN': '菜品图片预览' }
  , 'Thay ảnh': { en: 'Change image', 'zh-CN': '更换图片' }
  , 'Nhấp để tải ảnh': { en: 'Click to upload an image', 'zh-CN': '点击上传图片' }
  , 'Tỷ lệ 3:4 · Tối đa 5MB': { en: '3:4 ratio · 5 MB maximum', 'zh-CN': '3:4 比例 · 最大 5MB' }
  , 'Tên món ăn *': { en: 'Dish name *', 'zh-CN': '菜品名称 *' }
  , 'VD: Cơm gà Hải Nam': { en: 'Example: Hainanese chicken rice', 'zh-CN': '例如：海南鸡饭' }
  , 'Giá món (VNĐ) *': { en: 'Price (VND) *', 'zh-CN': '价格（越南盾）*' }
  , 'Danh mục *': { en: 'Category *', 'zh-CN': '分类 *' }
  , 'Chọn danh mục có sẵn': { en: 'Choose an existing category', 'zh-CN': '选择现有分类' }
  , 'Chọn danh mục': { en: 'Select a category', 'zh-CN': '选择分类' }
  , 'Tạo danh mục mới...': { en: 'Create a new category…', 'zh-CN': '创建新分类…' }
  , 'Nhập tên danh mục mới (VD: Món khai vị)': { en: 'Enter a category name (e.g. Starters)', 'zh-CN': '输入分类名称（例如：前菜）' }
  , 'Mô tả món ăn': { en: 'Dish description', 'zh-CN': '菜品描述' }
  , 'Mô tả nguyên liệu, khẩu vị...': { en: 'Describe ingredients and flavor…', 'zh-CN': '描述食材和口味…' }
  , 'Trạng thái bán': { en: 'Availability', 'zh-CN': '售卖状态' }
  , 'Hiển thị trên menu khách hàng': { en: 'Visible on the customer menu', 'zh-CN': '在顾客菜单中显示' }
  , 'Đã có {count} nguyên liệu — dinh dưỡng tính tự động khi lưu.': { en: '{count} ingredients added — nutrition will be calculated when saved.', 'zh-CN': '已添加 {count} 种食材，保存时将自动计算营养成分。' }
  , 'Bạn chưa nhập nguyên liệu. Hãy hoàn thiện Recipe Builder để tính toán dinh dưỡng AI và cho phép lưu món.': { en: 'No ingredients added. Complete Recipe Builder to calculate nutrition and save this dish.', 'zh-CN': '尚未添加食材。请完成配方编辑器，以计算营养成分并保存菜品。' }
  , 'Nhập ngay': { en: 'Add now', 'zh-CN': '立即添加' }
  , 'Lưu thay đổi': { en: 'Save changes', 'zh-CN': '保存更改' }
  , 'Thêm món ăn': { en: 'Add dish', 'zh-CN': '添加菜品' }
  , 'Mở QR chuyển khoản cỡ lớn': { en: 'Open large transfer QR code', 'zh-CN': '打开大尺寸转账二维码' }
  , 'Chủ TK:': { en: 'Account holder:', 'zh-CN': '账户持有人：' }
  , 'QR chuyển khoản': { en: 'Bank transfer QR code', 'zh-CN': '银行转账二维码' }
  , 'Nhấn để phóng to': { en: 'Tap to enlarge', 'zh-CN': '点击放大' }
  , 'Phóng to QR': { en: 'Enlarge QR code', 'zh-CN': '放大二维码' }
  , 'Đưa màn hình này cho khách quét, kiểm tra đúng tổng tiền trước khi xác nhận.': { en: 'Show this screen to the customer to scan, then verify the total before confirming.', 'zh-CN': '请顾客扫描此二维码，并在确认前核对总金额。' }
  , 'Đóng QR phóng to': { en: 'Close enlarged QR code', 'zh-CN': '关闭放大的二维码' }
  , 'QR chuyển khoản phóng to': { en: 'Enlarged bank transfer QR code', 'zh-CN': '放大的银行转账二维码' }
  , 'Đã nhận tiền': { en: 'Payment received', 'zh-CN': '已收到款项' }
  , 'Ngân hàng': { en: 'Bank', 'zh-CN': '银行' }
  , 'Tổng bill cần chuyển': { en: 'Bill total to transfer', 'zh-CN': '账单转账总额' }
  , 'Không xác định được bill cần thanh toán': { en: 'Could not identify the bill to pay', 'zh-CN': '无法识别待付款账单' }
  , 'Tiền khách đưa phải lớn hơn hoặc bằng tổng bill': { en: 'Cash received must be at least the bill total', 'zh-CN': '收款金额必须大于或等于账单总额' }
  , 'Thanh toán bill thành công. Bàn đã được giải phóng.': { en: 'Bill paid successfully. The table is now available.', 'zh-CN': '账单付款成功，桌台已释放。' }
  , 'Không thể thanh toán bill': { en: 'Could not pay bill', 'zh-CN': '账单付款失败' }
  , 'Thanh toán bill - Bàn {table}': { en: 'Pay bill · Table {table}', 'zh-CN': '支付账单 · 桌台 {table}' }
  , 'Thanh toán một lần cho toàn bộ bill trong phiên bàn. Các order con sẽ được hoàn thành sau khi xác nhận.': { en: 'Pay the full bill for this table session in one transaction. Its orders will be completed after confirmation.', 'zh-CN': '一次性支付此桌台会话的全部账单。确认后，关联订单将完成。' }
  , 'Số order': { en: 'Orders', 'zh-CN': '订单数' }
  , 'Tiền mặt': { en: 'Cash', 'zh-CN': '现金' }
  , 'Chuyển khoản / QR': { en: 'Bank transfer / QR', 'zh-CN': '转账/二维码' }
  , 'Tiền khách đưa': { en: 'Cash received', 'zh-CN': '收到现金' }
  , 'VD: 100000': { en: 'Example: 100000', 'zh-CN': '例如：100000' }
  , 'Tiền trả lại': { en: 'Change due', 'zh-CN': '找零' }
  , 'Tiền khách đưa chưa đủ để thanh toán bill.': { en: 'Cash received is less than the bill total.', 'zh-CN': '收到的现金不足以支付账单。' }
  , 'Đang tải QR chuyển khoản...': { en: 'Loading transfer QR code…', 'zh-CN': '正在加载转账二维码…' }
  , 'Chủ nhà hàng chưa cấu hình QR chuyển khoản.': { en: 'The restaurant owner has not configured a transfer QR code.', 'zh-CN': '餐厅店主尚未配置转账二维码。' }
  , 'Restaurant Admin/Staff không thể upload tại đây. Vui lòng liên hệ Chủ nhà hàng.': { en: 'Restaurant admins and staff cannot upload here. Contact the restaurant owner.', 'zh-CN': '餐厅管理员和员工无法在此上传，请联系餐厅店主。' }
  , 'Xác nhận thanh toán': { en: 'Confirm payment', 'zh-CN': '确认付款' }
  , 'Xác nhận đã nhận tiền': { en: 'Confirm payment received', 'zh-CN': '确认已收款' }
  , 'Chưa dịch': { en: 'Not translated', 'zh-CN': '未翻译' }
  , 'Bản nháp': { en: 'Draft', 'zh-CN': '草稿' }
  , 'Cần dịch lại': { en: 'Needs retranslation', 'zh-CN': '需要重新翻译' }
  , 'Đã duyệt': { en: 'Approved', 'zh-CN': '已审核' }
  , 'Bản dịch món ăn': { en: 'Dish translation', 'zh-CN': '菜品翻译' }
  , 'Bản dịch danh mục': { en: 'Category translation', 'zh-CN': '分类翻译' }
  , 'Nội dung tiếng Việt là bản gốc. AI tạo bản nháp để nhà hàng kiểm tra và duyệt trước khi khách nhìn thấy.': { en: 'Vietnamese is the source text. AI creates a draft for the restaurant to review and approve before customers see it.', 'zh-CN': '越南语为原文。AI 将生成草稿，餐厅审核通过后顾客才能看到。' }
  , 'Đóng bản dịch': { en: 'Close translation editor', 'zh-CN': '关闭翻译编辑器' }
  , 'Nội dung tiếng Việt gốc': { en: 'Original Vietnamese content', 'zh-CN': '越南语原文' }
  , 'Bản gốc · Tiếng Việt': { en: 'Original · Vietnamese', 'zh-CN': '原文 · 越南语' }
  , 'Chọn ngôn ngữ bản dịch': { en: 'Choose translation language', 'zh-CN': '选择翻译语言' }
  , 'Tên · {language}': { en: 'Name · {language}', 'zh-CN': '名称 · {language}' }
  , 'Mô tả': { en: 'Description', 'zh-CN': '描述' }
  , 'Đã tạo bản nháp tiếng Anh và tiếng Trung. Hãy kiểm tra trước khi duyệt.': { en: 'English and Chinese drafts are ready. Review them before approval.', 'zh-CN': '英文和中文草稿已生成，请审核后再批准。' }
  , 'Không thể tạo bản dịch lúc này.': { en: 'Could not generate translations right now.', 'zh-CN': '目前无法生成翻译。' }
  , 'Đã duyệt bản dịch và hiển thị cho khách.': { en: 'Translation approved and published for customers.', 'zh-CN': '翻译已审核并向顾客显示。' }
  , 'Đã lưu bản nháp.': { en: 'Draft saved.', 'zh-CN': '草稿已保存。' }
  , 'Không thể lưu bản dịch lúc này.': { en: 'Could not save the translation right now.', 'zh-CN': '目前无法保存翻译。' }
  , 'Đang dịch…': { en: 'Translating…', 'zh-CN': '正在翻译…' }
  , 'Tạo bản nháp AI': { en: 'Generate AI draft', 'zh-CN': '生成 AI 草稿' }
  , 'Lưu nháp': { en: 'Save draft', 'zh-CN': '保存草稿' }
  , 'Duyệt': { en: 'Approve', 'zh-CN': '审核' }
  , 'Duyệt & hiển thị': { en: 'Approve & publish', 'zh-CN': '审核并发布' }
  , 'Chưa có tên bản dịch': { en: 'No translated name', 'zh-CN': '暂无译名' }
  , 'Chưa có mô tả': { en: 'No description', 'zh-CN': '暂无描述' }
  , 'Bản nháp đã lưu': { en: 'Draft saved', 'zh-CN': '草稿已保存' }
  , 'Đang chờ': { en: 'Waiting', 'zh-CN': '等待中' }
  , 'Đang dịch': { en: 'Translating', 'zh-CN': '翻译中' }
  , 'Đã tạo bản nháp': { en: 'Draft created', 'zh-CN': '草稿已生成' }
  , 'Dịch thất bại': { en: 'Translation failed', 'zh-CN': '翻译失败' }
  , 'Tạm dừng': { en: 'Paused', 'zh-CN': '已暂停' }
  , 'Đang dịch: {name}': { en: 'Translating: {name}', 'zh-CN': '正在翻译：{name}' }
  , 'Đang hoàn tất…': { en: 'Finishing…', 'zh-CN': '正在完成…' }
  , 'Đang xem {count} món có bản nháp đã lưu.': { en: 'Reviewing {count} items with saved drafts.', 'zh-CN': '正在查看 {count} 个已保存草稿的菜品。' }
  , 'Hoàn tất: {success} món dịch thành công · {skipped} món bỏ qua · {failed} món thất bại · {paused} món tạm dừng.': { en: 'Complete: {success} translated · {skipped} skipped · {failed} failed · {paused} paused.', 'zh-CN': '完成：成功翻译 {success} 个 · 跳过 {skipped} 个 · 失败 {failed} 个 · 暂停 {paused} 个。' }
  , 'Tiến độ dịch món ăn': { en: 'Dish translation progress', 'zh-CN': '菜品翻译进度' }
  , 'Số món cần tạo bản dịch': { en: 'Number of dishes to translate', 'zh-CN': '待翻译菜品数量' }
  , 'Sẵn sàng bắt đầu': { en: 'Ready to start', 'zh-CN': '准备开始' }
  , 'AI sẽ tạo bản nháp cho các món chưa dịch đủ.': { en: 'AI will create drafts for dishes that are not fully translated.', 'zh-CN': 'AI 将为翻译不完整的菜品生成草稿。' }
  , 'món cần gọi AI': { en: 'dishes to translate with AI', 'zh-CN': '个待 AI 翻译的菜品' }
  , 'Bản nháp hiện có': { en: 'Existing drafts', 'zh-CN': '现有草稿' }
  , 'Được giữ lại để bạn xem': { en: 'Kept for your review', 'zh-CN': '保留供你审核' }
  , 'Đã duyệt hai ngôn ngữ': { en: 'Approved in both languages', 'zh-CN': '两种语言均已审核' }
  , 'Được bỏ qua lần này': { en: 'Skipped this time', 'zh-CN': '本次跳过' }
  , 'Xem {count} bản nháp đã lưu': { en: 'Review {count} saved drafts', 'zh-CN': '查看 {count} 个已保存草稿' }
  , 'Mỗi lượt AI xử lý một món. Món đang ngưng bán vẫn được tính vào danh sách dịch.': { en: 'AI processes one dish at a time. Unavailable dishes are still included.', 'zh-CN': 'AI 每次处理一道菜。停售菜品仍会计入翻译列表。' }
  , 'Menu đã có đầy đủ bản dịch được duyệt. Không có món cần xử lý.': { en: 'All menu items already have approved translations. Nothing needs processing.', 'zh-CN': '菜单中的所有菜品都已有已审核翻译，无需处理。' }
  , 'Chưa có món ăn. Hãy thêm món vào menu để tạo bản dịch.': { en: 'There are no dishes yet. Add a dish to the menu to create translations.', 'zh-CN': '暂无菜品。请先添加菜品，再生成翻译。' }
  , 'Đang tải lại trạng thái đã lưu…': { en: 'Refreshing saved status…', 'zh-CN': '正在刷新已保存状态…' }
  , 'Cần tải lại trạng thái đã lưu trước khi duyệt tiếp.': { en: 'Refresh the saved status before continuing approval.', 'zh-CN': '请先刷新已保存状态，再继续审核。' }
  , 'Danh sách đã được tải lại theo trạng thái đã lưu. Các món đã duyệt không còn được chọn.': { en: 'The list reflects the latest saved status. Approved dishes are no longer selected.', 'zh-CN': '列表已按最新保存状态刷新，已审核菜品已取消选择。' }
  , 'Tải lại trạng thái': { en: 'Refresh status', 'zh-CN': '刷新状态' }
  , 'Các món còn lại đã tạm dừng để tránh gửi thêm yêu cầu liên tiếp.': { en: 'The remaining dishes were paused to avoid sending more requests in a row.', 'zh-CN': '为避免连续发送请求，其余菜品已暂停。' }
  , 'Đã duyệt và hiển thị {count} món cho khách.': { en: 'Approved and published {count} dishes for customers.', 'zh-CN': '已审核并向顾客显示 {count} 道菜。' }
  , 'Bản dịch {name}': { en: 'Translation: {name}', 'zh-CN': '翻译：{name}' }
  , 'Chọn duyệt {name}': { en: 'Select {name} for approval', 'zh-CN': '选择审核 {name}' }
  , 'Đã duyệt & hiển thị': { en: 'Approved & published', 'zh-CN': '已审核并发布' }
  , 'Đã hiển thị cho khách': { en: 'Visible to customers', 'zh-CN': '顾客可见' }
  , 'Sẵn sàng duyệt hai ngôn ngữ': { en: 'Ready to approve both languages', 'zh-CN': '两种语言均可审核' }
  , 'Thử lại hoặc chỉnh sửa bản nháp để hoàn tất': { en: 'Retry or edit the draft to finish', 'zh-CN': '重试或编辑草稿以完成翻译' }
  , 'Cần hoàn tất cả hai ngôn ngữ': { en: 'Both languages must be complete', 'zh-CN': '必须完成两种语言' }
  , 'Sửa nháp': { en: 'Edit draft', 'zh-CN': '编辑草稿' }
  , 'Không còn bản nháp đã lưu để xem.': { en: 'No saved drafts remain to review.', 'zh-CN': '没有可查看的已保存草稿。' }
  , 'Không có món cần kiểm tra bản dịch.': { en: 'No dishes need translation review.', 'zh-CN': '没有需要审核翻译的菜品。' }
  , 'Bạn có thể chỉnh sửa từng món trước khi duyệt.': { en: 'You can edit each dish before approval.', 'zh-CN': '审核前可逐个编辑菜品。' }
  , 'Bắt đầu dịch {count} món': { en: 'Translate {count} dishes', 'zh-CN': '开始翻译 {count} 道菜' }
  , 'Kiểm tra bản nháp đã lưu': { en: 'Review saved drafts', 'zh-CN': '审核已保存草稿' }
  , 'Đang lưu bản nháp từng món. Vui lòng chờ hết lượt dịch để kiểm tra kết quả.': { en: 'Drafts are being saved one by one. Wait for translation to finish before reviewing the results.', 'zh-CN': '正在逐个保存草稿。请等待翻译完成后再查看结果。' }
  , 'Đã chọn {selected}/{ready} món sẵn sàng duyệt.': { en: 'Selected {selected} of {ready} dishes ready for approval.', 'zh-CN': '已选择 {selected}/{ready} 个可审核菜品。' }
  , 'Chức năng duyệt hàng loạt chưa sẵn sàng.': { en: 'Bulk approval is not available yet.', 'zh-CN': '批量审核暂不可用。' }
  , 'Quay lại': { en: 'Back', 'zh-CN': '返回' }
  , 'Thử lại {count} món': { en: 'Retry {count} dishes', 'zh-CN': '重试 {count} 道菜' }
  , 'Thử lại {count} món lỗi': { en: 'Retry {count} failed dishes', 'zh-CN': '重试 {count} 道失败菜品' }
  , 'Đang duyệt…': { en: 'Approving…', 'zh-CN': '正在审核…' }
  , 'Duyệt & hiển thị {count} món': { en: 'Approve & publish {count} dishes', 'zh-CN': '审核并发布 {count} 道菜' }
  , 'Không thể dịch món này. Hãy thử lại.': { en: 'Could not translate this dish. Try again.', 'zh-CN': '无法翻译此菜品，请重试。' }
  , 'Chưa gửi yêu cầu dịch món này. Hãy thử lại khi dịch vụ AI hoạt động bình thường.': { en: 'No translation request was sent for this dish. Try again when the AI service is available.', 'zh-CN': '此菜品尚未发送翻译请求。AI 服务恢复后请重试。' }
  , 'Không thể tải lại trạng thái: {error}': { en: 'Could not refresh status: {error}', 'zh-CN': '无法刷新状态：{error}' }
  , 'Hãy thử tải lại.': { en: 'Try refreshing.', 'zh-CN': '请尝试刷新。' }
  , 'Đã duyệt và hiển thị {count} món.': { en: 'Approved and published {count} dishes.', 'zh-CN': '已审核并发布 {count} 道菜。' }
  , 'Không thể duyệt các bản dịch.': { en: 'Could not approve translations.', 'zh-CN': '无法审核这些翻译。' }
  , 'Tạo bản nháp tiếng Anh và tiếng Trung để kiểm tra trước khi hiển thị cho khách.': { en: 'Create English and Chinese drafts to review before publishing them to customers.', 'zh-CN': '生成英文和中文草稿，审核后再向顾客显示。' }
  , 'Đóng dịch menu hàng loạt': { en: 'Close bulk menu translation', 'zh-CN': '关闭菜单批量翻译' }
  , 'Bản dịch được lưu thành bản nháp, chưa hiển thị cho khách.': { en: 'Translations are saved as drafts and are not visible to customers yet.', 'zh-CN': '翻译已保存为草稿，顾客暂不可见。' }
  , 'Đã xử lý {completed}/{total} món · {percent}%. {activity}': { en: 'Processed {completed}/{total} dishes · {percent}%. {activity}', 'zh-CN': '已处理 {completed}/{total} 道菜 · {percent}%。{activity}' }
  , 'Đã lưu thông tin thanh toán chuyển khoản': { en: 'Bank transfer details saved.', 'zh-CN': '转账信息已保存。' }
  , 'Không thể lưu thông tin thanh toán': { en: 'Could not save payment details', 'zh-CN': '无法保存付款信息' }
  , 'Chỉ hỗ trợ ảnh QR định dạng jpg, png hoặc webp': { en: 'QR images must be JPG, PNG, or WebP', 'zh-CN': '二维码图片仅支持 JPG、PNG 或 WebP 格式' }
  , 'Ảnh QR không được vượt quá 3MB': { en: 'QR image must be 3 MB or smaller', 'zh-CN': '二维码图片不能超过 3MB' }
  , 'Đã upload QR chuyển khoản': { en: 'Transfer QR code uploaded.', 'zh-CN': '转账二维码已上传。' }
  , 'Không thể upload QR chuyển khoản': { en: 'Could not upload transfer QR code', 'zh-CN': '无法上传转账二维码' }
  , 'Đã xóa QR chuyển khoản': { en: 'Transfer QR code deleted.', 'zh-CN': '转账二维码已删除。' }
  , 'Không thể xóa QR chuyển khoản': { en: 'Could not delete transfer QR code', 'zh-CN': '无法删除转账二维码' }
  , 'Thông tin thanh toán / QR chuyển khoản': { en: 'Payment details / transfer QR code', 'zh-CN': '付款信息/转账二维码' }
  , 'QR này dùng khi nhân viên/chủ quán chọn chuyển khoản trong modal thanh toán bill.': { en: 'Staff and owners can use this QR when selecting bank transfer in the bill payment dialog.', 'zh-CN': '员工或店主在账单付款窗口选择转账时可使用此二维码。' }
  , 'Đang tải cấu hình thanh toán...': { en: 'Loading payment settings…', 'zh-CN': '正在加载付款设置…' }
  , 'Chưa có QR': { en: 'No QR code yet', 'zh-CN': '暂无二维码' }
  , 'Lưu thông tin': { en: 'Save details', 'zh-CN': '保存信息' }
  , 'Upload QR': { en: 'Upload QR code', 'zh-CN': '上传二维码' }
  , 'Xóa QR': { en: 'Delete QR code', 'zh-CN': '删除二维码' }
  , 'Chỉ Chủ nhà hàng được sửa thông tin ngân hàng và QR chuyển khoản. Admin/Staff chỉ dùng QR này khi thanh toán bill.': { en: 'Only the restaurant owner can edit bank details and the transfer QR code. Admins and staff can use it when paying a bill.', 'zh-CN': '仅餐厅店主可以编辑银行信息和转账二维码。管理员和员工可在支付账单时使用。' }
  , 'Vui lòng điền email mới': { en: 'Enter the new email address', 'zh-CN': '请输入新邮箱地址' }
  , 'Mã OTP đổi email đã được gửi. Vui lòng kiểm tra email của bạn.': { en: 'An email change code was sent. Check your email.', 'zh-CN': '邮箱更改验证码已发送，请检查邮箱。' }
  , 'Lỗi gửi OTP đổi email': { en: 'Could not send the email change code', 'zh-CN': '无法发送邮箱更改验证码' }
  , 'Vui lòng điền đầy đủ email mới và OTP': { en: 'Enter the new email address and verification code', 'zh-CN': '请填写新邮箱地址和验证码' }
  , 'Thay đổi Email nhà hàng': { en: 'Change restaurant email', 'zh-CN': '更改餐厅邮箱' }
  , 'Quy trình yêu cầu mã OTP gửi về email hiện tại của nhà hàng.': { en: 'A verification code will be sent to the restaurant’s current email address.', 'zh-CN': '验证码将发送到餐厅当前邮箱。' }
  , 'Email mới *': { en: 'New email *', 'zh-CN': '新邮箱 *' }
  , 'Nhập OTP': { en: 'Enter verification code', 'zh-CN': '输入验证码' }
  , 'Xác nhận đổi email': { en: 'Confirm email change', 'zh-CN': '确认更改邮箱' }
  , 'Vui lòng điền Số tài khoản và chọn Ngân hàng': { en: 'Enter the account number and select a bank', 'zh-CN': '请输入银行账号并选择银行' }
  , 'Mã OTP đổi ngân hàng đã được gửi đến email hiện tại của nhà hàng.': { en: 'A bank change code was sent to the restaurant’s current email address.', 'zh-CN': '银行信息更改验证码已发送到餐厅当前邮箱。' }
  , 'Lỗi gửi OTP đổi ngân hàng': { en: 'Could not send the bank change code', 'zh-CN': '无法发送银行信息更改验证码' }
  , 'Vui lòng điền đầy đủ thông tin tài khoản bank và OTP': { en: 'Enter all bank account details and the verification code', 'zh-CN': '请填写完整银行账户信息和验证码' }
  , 'Cấu hình ngân hàng VietQR': { en: 'Configure VietQR bank details', 'zh-CN': '配置 VietQR 银行信息' }
  , 'Mã OTP đổi ngân hàng sẽ được gửi về email hiện tại của nhà hàng.': { en: 'A bank change code will be sent to the restaurant’s current email address.', 'zh-CN': '银行信息更改验证码将发送到餐厅当前邮箱。' }
  , 'Ngân hàng thụ hưởng *': { en: 'Beneficiary bank *', 'zh-CN': '收款银行 *' }
  , 'Chọn ngân hàng': { en: 'Select a bank', 'zh-CN': '选择银行' }
  , 'Số tài khoản ngân hàng mới *': { en: 'New bank account number *', 'zh-CN': '新银行账号 *' }
  , 'Nhập số tài khoản': { en: 'Enter account number', 'zh-CN': '输入银行账号' }
  , 'Gửi OTP': { en: 'Send code', 'zh-CN': '发送验证码' }
  , 'Mã OTP (6 số) *': { en: 'Verification code (6 digits) *', 'zh-CN': '验证码（6 位）*' }
  , 'Nhập OTP đổi ngân hàng': { en: 'Enter bank change code', 'zh-CN': '输入银行更改验证码' }
  , 'Xác nhận đổi ngân hàng': { en: 'Confirm bank change', 'zh-CN': '确认更改银行信息' }
  , 'Bill hiện tại · Bàn {table}': { en: 'Current bill · Table {table}', 'zh-CN': '当前账单 · 桌台 {table}' }
  , 'Mã phiên': { en: 'Session code', 'zh-CN': '会话编号' }
  , 'Mã phiên {code}': { en: 'Session {code}', 'zh-CN': '会话 {code}' }
  , 'Mở phiên': { en: 'Session opened', 'zh-CN': '会话开始时间' }
  , 'Tổng quan bill': { en: 'Bill overview', 'zh-CN': '账单概览' }
  , 'Món trong bill': { en: 'Items on this bill', 'zh-CN': '账单菜品' }
  , 'Danh sách món đã được ghi nhận cho phiên này.': { en: 'Items recorded for this session.', 'zh-CN': '此会话记录的菜品列表。' }
  , 'Chưa có món nào trong bill.': { en: 'No items on this bill yet.', 'zh-CN': '此账单暂无菜品。' }
  , 'Các order trong phiên': { en: 'Orders in this session', 'zh-CN': '此会话中的订单' }
  , 'Theo dõi trạng thái từng order đã tạo tại bàn.': { en: 'Track each order placed at this table.', 'zh-CN': '查看在此桌台创建的订单状态。' }
  , 'Đơn {orderId}': { en: 'Order {orderId}', 'zh-CN': '订单 {orderId}' }
  , 'Chi tiết tiền': { en: 'Payment breakdown', 'zh-CN': '金额明细' }
  , 'Tạm tính': { en: 'Subtotal', 'zh-CN': '小计' }
  , 'Giảm giá': { en: 'Discount', 'zh-CN': '折扣' }
  , 'Phí dịch vụ': { en: 'Service fee', 'zh-CN': '服务费' }
  , 'Thuế': { en: 'Tax', 'zh-CN': '税费' }
  , 'Tổng cộng': { en: 'Total', 'zh-CN': '总计' }
  , 'Đóng bill': { en: 'Close bill details', 'zh-CN': '关闭账单详情' }
  , 'Bill': { en: 'Bill', 'zh-CN': '账单' }
  , 'Chờ xác nhận': { en: 'Awaiting confirmation', 'zh-CN': '待确认' }
  , 'Đã xác nhận': { en: 'Confirmed', 'zh-CN': '已确认' }
  , 'Đã hoàn tất': { en: 'Completed', 'zh-CN': '已完成' }
  , 'Không thể tải lịch sử khách hàng.': { en: 'Could not load customer history.', 'zh-CN': '无法加载顾客记录。' }
  , 'Chi tiết khách hàng': { en: 'Customer details', 'zh-CN': '顾客详情' }
  , 'Đang tải lịch sử': { en: 'Loading history', 'zh-CN': '正在加载记录' }
  , 'Số lần ghé': { en: 'Visits', 'zh-CN': '到访次数' }
  , 'Tổng đơn': { en: 'Total orders', 'zh-CN': '订单总数' }
  , 'Đã đồng ý nhận ưu đãi: {date}': { en: 'Opted in to offers: {date}', 'zh-CN': '已同意接收优惠：{date}' }
  , 'Chưa đồng ý nhận thông tin ưu đãi.': { en: 'Has not opted in to promotional messages.', 'zh-CN': '尚未同意接收优惠信息。' }
  , 'Lịch sử gọi món': { en: 'Order history', 'zh-CN': '点餐记录' }
  , 'Chưa có lịch sử gọi món.': { en: 'No order history yet.', 'zh-CN': '暂无点餐记录。' }
  , 'Chưa có dữ liệu': { en: 'Not available', 'zh-CN': '暂无数据' }
  , 'Đã làm mới báo cáo dữ liệu.': { en: 'Report data refreshed.', 'zh-CN': '报告数据已刷新。' }
  , 'Không thể làm mới báo cáo dữ liệu.': { en: 'Could not refresh report data.', 'zh-CN': '无法刷新报告数据。' }
  , 'Không thể tải báo cáo phân tích thực đơn.': { en: 'Could not load menu analytics.', 'zh-CN': '无法加载菜单分析。' }
  , 'Phân tích nhà hàng': { en: 'Restaurant analytics', 'zh-CN': '餐厅分析' }
  , 'Đang tổng hợp báo cáo dữ liệu thực đơn...': { en: 'Preparing menu analytics…', 'zh-CN': '正在汇总菜单分析数据…' }
  , 'Tham khảo dữ liệu hoạt động và xu hướng khảo sát khi tối ưu thực đơn.': { en: 'Use activity data and survey trends to improve your menu.', 'zh-CN': '参考运营数据和调查趋势优化菜单。' }
  , 'Tính năng Phân tích chuyên sâu bị khóa': { en: 'Advanced analytics is locked', 'zh-CN': '高级分析功能已锁定' }
  , 'Bạn đang sử dụng gói FREE. Tính năng phân tích thực đơn và thị hiếu dinh dưỡng của khách hàng chỉ khả dụng từ gói PLUS trở lên.': { en: 'You are on the FREE plan. Menu analytics and customer nutrition insights are available on PLUS and above.', 'zh-CN': '您当前使用 FREE 套餐。菜单分析和顾客营养偏好功能需升级至 PLUS 或更高套餐。' }
  , 'Đặc quyền gói PLUS & PRO:': { en: 'PLUS & PRO plan benefits:', 'zh-CN': 'PLUS 和 PRO 套餐权益：' }
  , 'Biểu đồ thị hiếu và xu hướng ăn uống của khách': { en: 'Customer preferences and dining trend charts', 'zh-CN': '顾客偏好和饮食趋势图表' }
  , 'Bản đồ thuộc tính dinh dưỡng của thực đơn': { en: 'Menu nutrition attribute map', 'zh-CN': '菜单营养属性分布图' }
  , 'Phân tích khoảng trống thuộc tính của món': { en: 'Dish attribute gap analysis', 'zh-CN': '菜品属性差距分析' }
  , 'Gợi ý tối ưu thực đơn dựa trên dữ liệu hiện có': { en: 'Data-based menu optimization suggestions', 'zh-CN': '基于现有数据的菜单优化建议' }
  , 'Nâng cấp gói dịch vụ ngay': { en: 'Upgrade your plan now', 'zh-CN': '立即升级套餐' }
  , 'Không thể tải dữ liệu phân tích': { en: 'Could not load analytics data', 'zh-CN': '无法加载分析数据' }
  , 'Đã xảy ra lỗi khi kết nối với máy chủ tính toán. Vui lòng làm mới lại trang.': { en: 'There was a problem connecting to the analytics server. Refresh the page and try again.', 'zh-CN': '连接分析服务器时出错，请刷新页面后重试。' }
  , 'Kỳ báo cáo': { en: 'Report period', 'zh-CN': '报告周期' }
  , 'Làm mới báo cáo': { en: 'Refresh report', 'zh-CN': '刷新报告' }
  , 'Chọn nội dung phân tích': { en: 'Choose an analytics section', 'zh-CN': '选择分析内容' }
  , 'Xu hướng khảo sát QR': { en: 'QR survey trends', 'zh-CN': '二维码问卷趋势' }
  , 'Khung giờ đặt món': { en: 'Ordering hours', 'zh-CN': '点餐时段' }
  , 'Thuộc tính thực đơn': { en: 'Menu attributes', 'zh-CN': '菜单属性' }
  , 'Hiệu suất món ăn Smart-Menu': { en: 'Smart Menu performance', 'zh-CN': '智能菜单表现' }
  , 'Khung giờ đặt món (Peak Hours)': { en: 'Peak ordering hours', 'zh-CN': '高峰点餐时段' }
  , 'Báo cáo khung giờ': { en: 'Hours report', 'zh-CN': '时段报告' }
  , '{count} đơn ({percentage}%)': { en: '{count} orders ({percentage}%)', 'zh-CN': '{count} 单（{percentage}%）' }
  , 'Khung giờ cao điểm:': { en: 'Peak hours:', 'zh-CN': '高峰时段：' }
  , 'Tính năng Phân tích giờ vàng bị khóa': { en: 'Peak hours analytics is locked', 'zh-CN': '高峰时段分析已锁定' }
  , 'Biểu đồ khung giờ đặt món và mật độ cao điểm chỉ dành cho khách hàng dùng gói PRO.': { en: 'Peak ordering hours and order density charts are available on the PRO plan.', 'zh-CN': '点餐时段和订单密度图表仅限 PRO 套餐使用。' }
  , 'Nâng cấp gói PRO ngay': { en: 'Upgrade to PRO now', 'zh-CN': '立即升级至 PRO' }
  , 'Doanh thu Smart-Menu': { en: 'Smart Menu revenue', 'zh-CN': '智能菜单收入' }
  , 'từ các món ăn có công thức dinh dưỡng': { en: 'from dishes with nutrition recipes', 'zh-CN': '来自已配置营养配方的菜品' }
  , 'Tổng giá trị đơn hàng được tạo bởi các món phổ biến có cấu hình dinh dưỡng.': { en: 'Total order value from popular dishes with nutrition details configured.', 'zh-CN': '已配置营养信息的热门菜品所产生的订单总额。' }
  , 'Doanh thu phản ánh đơn hàng trong kỳ đã chọn và không dự báo kết quả tương lai.': { en: 'Revenue reflects orders in the selected period and does not predict future results.', 'zh-CN': '收入反映所选周期的订单，不代表未来预测。' }
  , 'Số đơn đã phục vụ/hoàn tất chỉ khả dụng trên gói PRO.': { en: 'Served or completed order counts are available on the PRO plan.', 'zh-CN': '已上菜或已完成订单数仅限 PRO 套餐查看。' }
  , '{count} đơn đã phục vụ/hoàn tất': { en: '{count} orders served or completed', 'zh-CN': '{count} 单已上菜或完成' }
  , 'Số lượng món đã bán': { en: 'Dishes sold', 'zh-CN': '已售菜品数量' }
  , 'Doanh thu tạo ra': { en: 'Revenue generated', 'zh-CN': '产生的收入' }
  , 'Chưa có số lượng món bán cho các món có recipe.': { en: 'No items have been sold for dishes with recipes yet.', 'zh-CN': '暂无配置配方菜品的销售数据。' }
  , 'Nguồn dữ liệu khảo sát': { en: 'Survey data source', 'zh-CN': '问卷数据来源' }
  , 'Minh bạch dữ liệu khảo sát': { en: 'Survey data transparency', 'zh-CN': '问卷数据说明' }
  , 'Trong kỳ đã chọn, báo cáo gồm {count} lượt khảo sát: {real} phản hồi thực tế và {demo} phản hồi mẫu.': { en: 'For the selected period, the report includes {count} survey responses: {real} real and {demo} sample responses.', 'zh-CN': '所选周期的报告包含 {count} 份问卷：{real} 份真实反馈和 {demo} 份示例反馈。' }
  , 'Phản hồi mẫu chỉ dùng để minh họa, không phải dữ liệu khách hàng thật.': { en: 'Sample responses are for demonstration only and are not real customer data.', 'zh-CN': '示例反馈仅用于演示，并非真实顾客数据。' }
  , 'Kỳ đã chọn không có phản hồi khảo sát mẫu.': { en: 'There are no sample survey responses in the selected period.', 'zh-CN': '所选周期没有示例问卷反馈。' }
  , 'Xu hướng từ lượt khảo sát QR': { en: 'QR survey trends', 'zh-CN': '二维码问卷趋势' }
  , 'Xu hướng ăn uống': { en: 'Dining trends', 'zh-CN': '饮食趋势' }
  , '{count} lượt chọn': { en: '{count} selections', 'zh-CN': '{count} 次选择' }
  , 'Xu hướng khảo sát chuyên sâu bị khóa': { en: 'Advanced survey trends are locked', 'zh-CN': '深度问卷趋势分析已锁定' }
  , 'Phân tích chuyên sâu lựa chọn khảo sát QR chỉ có trên gói PRO. Nâng cấp để theo dõi xu hướng tại nhà hàng.': { en: 'Advanced analysis of QR survey choices is available on the PRO plan. Upgrade to follow dining trends at your restaurant.', 'zh-CN': '二维码问卷选项的深度分析仅限 PRO 套餐使用。升级后即可跟踪餐厅饮食趋势。' }
  , 'Đầy đủ ✨': { en: 'Complete ✨', 'zh-CN': '齐全 ✨' }
  , 'Giàu Đạm 🍗': { en: 'High protein 🍗', 'zh-CN': '高蛋白 🍗' }
  , 'Đồ Chay 🌱': { en: 'Vegetarian 🌱', 'zh-CN': '素食 🌱' }
  , 'Ăn Nhẹ ⏱️': { en: 'Light bites ⏱️', 'zh-CN': '轻食 ⏱️' }
  , 'Ít Đường 🍬': { en: 'Low sugar 🍬', 'zh-CN': '低糖 🍬' }
  , 'Thực Đơn 📋': { en: 'Menu 📋', 'zh-CN': '菜单 📋' }
  , 'BẢN DEMO': { en: 'DEMO', 'zh-CN': '演示版' }
  , 'Bản demo tóm tắt dữ liệu khảo sát và hoạt động đặt món.': { en: 'This demo summarizes survey data and ordering activity.', 'zh-CN': '此演示版汇总问卷数据和点餐活动。' }
  , 'Đang làm mới báo cáo': { en: 'Refreshing report', 'zh-CN': '正在刷新报告' }
  , 'Cần thêm dữ liệu hoạt động': { en: 'More activity data needed', 'zh-CN': '需要更多运营数据' }
  , 'Để mở phần phân tích, cần tối thiểu 20 lượt khảo sát QR và 10 đơn đã phục vụ hoặc hoàn tất.': { en: 'To unlock analytics, the restaurant needs at least 20 QR survey responses and 10 served or completed orders.', 'zh-CN': '要启用分析功能，餐厅至少需要 20 份二维码问卷和 10 个已上菜或已完成订单。' }
  , 'Lượt khảo sát: {count}/20': { en: 'Survey responses: {count}/20', 'zh-CN': '问卷反馈：{count}/20' }
  , 'Đơn đã phục vụ/hoàn tất: {count}/10': { en: 'Served/completed orders: {count}/10', 'zh-CN': '已上菜/完成订单：{count}/10' }
  , 'Đây là bản demo minh họa cách tổng hợp dữ liệu khảo sát và thực đơn.': { en: 'This demo illustrates how survey and menu data are summarized.', 'zh-CN': '此演示版展示问卷和菜单数据的汇总方式。' }
  , 'Tìm hiểu thêm': { en: 'Learn more', 'zh-CN': '了解更多' }
  , 'Chỉ số minh họa': { en: 'Illustrative metric', 'zh-CN': '示例指标' }
  , 'Không phải dự báo hay cam kết doanh thu': { en: 'Not a revenue forecast or guarantee', 'zh-CN': '非收入预测或保证' }
  , 'Thiếu danh mục': { en: 'Missing category', 'zh-CN': '缺少类别' }
  , 'Tình trạng thực đơn': { en: 'Menu status', 'zh-CN': '菜单状态' }
  , 'Cần xem xét': { en: 'Needs review', 'zh-CN': '需要检查' }
  , 'Đang cân bằng': { en: 'Balanced', 'zh-CN': '均衡' }
  , 'Nội dung minh họa': { en: 'Illustrative content', 'zh-CN': '示例内容' }
  , 'Báo cáo gồm {surveys} lượt khảo sát QR và {orders} đơn đã phục vụ/hoàn tất. Nhóm ăn uống lành mạnh có {healthy} lượt lựa chọn. Thực đơn có {gaps} điểm cần xem xét. Nội dung chỉ mang tính minh họa, không phải dự báo hay cam kết doanh thu.': { en: 'The report includes {surveys} QR survey responses and {orders} served/completed orders. Healthy eating was selected {healthy} times. The menu has {gaps} items to review. This is illustrative content, not a revenue forecast or guarantee.', 'zh-CN': '报告包含 {surveys} 份二维码问卷和 {orders} 个已上菜/已完成订单。健康饮食被选择了 {healthy} 次。菜单有 {gaps} 项需要检查。以上仅为示例内容，不构成收入预测或保证。' }
  , 'Đề xuất tối ưu thực đơn': { en: 'Menu optimization suggestions', 'zh-CN': '菜单优化建议' }
  , 'Khoảng trống: {category}': { en: 'Gap: {category}', 'zh-CN': '待补充：{category}' }
  , 'Thực đơn đang cân bằng': { en: 'The menu is balanced', 'zh-CN': '菜单目前均衡' }
  , 'Chưa có gợi ý khoảng trống từ dữ liệu thực đơn hiện tại.': { en: 'No menu gaps were identified from the current data.', 'zh-CN': '根据当前菜单数据，未发现待补充项。' }
  , 'Xem gợi ý món': { en: 'View dish suggestions', 'zh-CN': '查看菜品建议' }
  , 'Lựa chọn ăn uống lành mạnh': { en: 'Healthy eating preferences', 'zh-CN': '健康饮食偏好' }
  , 'Mục tiêu ăn uống lành mạnh được chọn {count} lượt trong khảo sát. Hãy tối ưu nhãn calo.': { en: 'Healthy eating was selected {count} times in surveys. Consider refining calorie labels.', 'zh-CN': '问卷中有 {count} 次选择了健康饮食。建议完善热量标签。' }
  , 'Xem dữ liệu': { en: 'View data', 'zh-CN': '查看数据' }
  , 'Món bán tốt nhất: {name}': { en: 'Top-selling dish: {name}', 'zh-CN': '最畅销菜品：{name}' }
  , 'Mang lại {revenue} doanh thu. Hãy ghim món này lên đầu thực đơn QR.': { en: 'Generated {revenue} in revenue. Consider pinning this dish to the top of the QR menu.', 'zh-CN': '带来 {revenue} 收入。建议将此菜品置顶到二维码菜单。' }
  , 'Báo cáo có thể gồm khảo sát mẫu đã gắn nhãn; số liệu đơn hàng và doanh thu lấy từ dữ liệu vận hành. Gợi ý chỉ mang tính tham khảo.': { en: 'Reports may include labeled sample surveys. Order and revenue figures come from operating data. Suggestions are for reference only.', 'zh-CN': '报告可能包含已标注的示例问卷。订单和收入数据来自运营记录。建议仅供参考。' }
  , 'Tính năng QDish Intelligence bị khóa': { en: 'QDish Intelligence is locked', 'zh-CN': 'QDish Intelligence 功能已锁定' }
  , 'Phân tích khoảng trống thực đơn và gợi ý món chỉ có trên gói PRO. Các kết quả tham khảo không bảo đảm tăng trưởng doanh thu.': { en: 'Menu gap analysis and dish suggestions are available on the PRO plan. Reference results do not guarantee revenue growth.', 'zh-CN': '菜单差距分析和菜品建议仅限 PRO 套餐使用。参考结果不保证收入增长。' }
  , 'Gợi ý tối ưu thực đơn': { en: 'Menu optimization suggestions', 'zh-CN': '菜单优化建议' }
  , 'Gợi ý dựa trên thuộc tính thực đơn đã khai báo. Trong Recipe Builder, bạn tự chọn món và nguyên liệu từ cơ sở dữ liệu QDish; hệ thống không tự tạo hoặc lưu món.': { en: 'Suggestions are based on declared menu attributes. In Recipe Builder, choose dishes and ingredients from the QDish database; the system will not create or save dishes for you.', 'zh-CN': '建议基于已声明的菜单属性。在 Recipe Builder 中，您可以从 QDish 数据库自行选择菜品和食材；系统不会自动创建或保存菜品。' }
  , 'Hiện không có khoảng trống thực đơn cần xử lý theo các thuộc tính đang theo dõi.': { en: 'There are no menu gaps to address based on the attributes being tracked.', 'zh-CN': '根据当前跟踪的属性，暂无需要处理的菜单缺口。' }
  , 'Danh sách gợi ý thực đơn': { en: 'Menu suggestions', 'zh-CN': '菜单建议' }
  , 'Không có khoảng trống thực đơn cần xử lý. Các nhóm thuộc tính đang theo dõi đã có món phù hợp.': { en: 'There are no menu gaps to address. The tracked attribute groups already have suitable dishes.', 'zh-CN': '暂无需要处理的菜单缺口。已跟踪的属性组均有合适菜品。' }
  , 'Mở Recipe Builder': { en: 'Open Recipe Builder', 'zh-CN': '打开配方编辑器' }
  , 'Xem thực đơn': { en: 'View menu', 'zh-CN': '查看菜单' }
  , '{label}: {count} món. {description}': { en: '{label}: {count} dishes. {description}', 'zh-CN': '{label}：{count} 道菜。{description}' }
  , '{count}/{max} món trong nhóm này': { en: '{count} of {max} dishes in this group', 'zh-CN': '此组共 {max} 道菜中的 {count} 道' }
  , '{count} nhãn': { en: '{count} tags', 'zh-CN': '{count} 个标签' }
  , 'Các thuộc tính nhóm {group}': { en: 'Attributes in the {group} group', 'zh-CN': '{group}组属性' }
  , 'Gợi ý đọc báo cáo thuộc tính': { en: 'How to read attribute insights', 'zh-CN': '如何查看属性分析' }
  , 'Gợi ý cho nhà hàng': { en: 'Suggestions for your restaurant', 'zh-CN': '餐厅建议' }
  , 'Nhãn nổi bật nhất hiện là “{label}” với {count} món.': { en: 'The leading label is “{label}” with {count} dishes.', 'zh-CN': '目前最突出的标签是“{label}”，共 {count} 道菜。' }
  , 'Chưa có nhãn nào để tạo nhận xét.': { en: 'There are no labels to summarize yet.', 'zh-CN': '暂无可用于生成摘要的标签。' }
  , 'Nhóm chế độ ăn đang có {count} loại nhãn; hãy kiểm tra thành phần món trước khi giới thiệu với khách.': { en: 'The diet group has {count} labels. Check dish ingredients before presenting them to customers.', 'zh-CN': '饮食类别目前有 {count} 个标签。向顾客介绍前，请先核对菜品食材。' }
  , 'Chưa có nhãn chế độ ăn; hãy bổ sung dữ liệu Recipe nếu muốn làm rõ món chay hoặc thành phần được loại trừ.': { en: 'There are no diet labels yet. Add Recipe data to clarify vegetarian dishes or excluded ingredients.', 'zh-CN': '暂无饮食标签。如需说明素食菜品或排除的食材，请补充配方信息。' }
  , 'Hãy so sánh các thanh trong cùng nhóm; các nhóm không cộng lại thành tổng số món.': { en: 'Compare bars within the same group; different groups do not add up to the total number of dishes.', 'zh-CN': '请比较同一组内的条形图；不同组的数量不能相加为菜品总数。' }
  , 'Phân bố thuộc tính món ăn': { en: 'Dish attribute distribution', 'zh-CN': '菜品属性分布' }
  , 'Xem nhãn dinh dưỡng, chế độ ăn và ngữ cảnh sử dụng của thực đơn. Một món có thể có nhiều thuộc tính, vì vậy số liệu không cộng lại thành tổng số món.': { en: 'Review nutrition, dietary, and usage labels on your menu. A dish can have multiple attributes, so counts do not add up to the total number of dishes.', 'zh-CN': '查看菜单中的营养、饮食和使用场景标签。一道菜可能有多个属性，因此数量相加不等于菜品总数。' }
  , 'Số món hiện có trong thực đơn': { en: 'Dishes currently on the menu', 'zh-CN': '当前菜单菜品数' }
  , 'Món có Recipe': { en: 'Dishes with a recipe', 'zh-CN': '已配置配方的菜品' }
  , 'Thực đơn có dữ liệu phân loại cho {percent}% số món.': { en: '{percent}% of the menu has data for classification', 'zh-CN': '{percent}% 的菜品具备分类数据。' }
  , 'Nhóm thuộc tính': { en: 'Attribute groups', 'zh-CN': '属性组' }
  , 'Đang có dữ liệu trong 3 nhóm chính': { en: 'Data is available in 3 main groups', 'zh-CN': '3 个主要类别中有数据' }
  , 'Đây là số món được gắn nhãn, không phải số lượt bán hay doanh thu. Di chuột vào biểu tượng trợ giúp để xem ý nghĩa của từng nhãn.': { en: 'These are counts of labeled dishes, not sales or revenue. Hover over the help icon to learn what each label means.', 'zh-CN': '此处统计的是已标记菜品数，并非销量或收入。将鼠标悬停在帮助图标上可查看标签说明。' }
  , 'Chưa có dữ liệu thuộc tính': { en: 'No attribute data yet', 'zh-CN': '暂无属性数据' }
  , 'Chưa có món ăn nào cấu hình Recipe để phân loại thuộc tính.': { en: 'No dishes have recipe details for attribute classification yet.', 'zh-CN': '暂无已配置配方信息、可用于属性分类的菜品。' }
  , 'Vui lòng chọn chi nhánh nguồn để sao chép thực đơn.': { en: 'Select a source branch to copy the menu.', 'zh-CN': '请选择要复制菜单的源分店。' }
  , 'Đang tiến hành nhân bản thực đơn, vui lòng đợi...': { en: 'Copying the menu. Please wait…', 'zh-CN': '正在复制菜单，请稍候…' }
  , 'Sao chép thực đơn thành công!': { en: 'Menu copied successfully!', 'zh-CN': '菜单复制成功！' }
  , 'Có lỗi xảy ra trong quá trình sao chép thực đơn.': { en: 'An error occurred while copying the menu.', 'zh-CN': '复制菜单时发生错误。' }
  , 'Sao chép thực đơn chi nhánh': { en: 'Copy a branch menu', 'zh-CN': '复制分店菜单' }
  , 'Sao chép toàn bộ danh mục và món ăn từ một chi nhánh cũ sang chi nhánh {name}.': { en: 'Copy all categories and dishes from another branch to {name}.', 'zh-CN': '将其他分店的所有类别和菜品复制到 {name}。' }
  , 'Không có chi nhánh nguồn khả dụng. Hãy tạo thêm chi nhánh có thực đơn trước.': { en: 'There is no available source branch. Create another branch with a menu first.', 'zh-CN': '没有可用的源分店。请先创建一个已有菜单的分店。' }
  , 'Chọn chi nhánh nguồn (Sao chép từ) *': { en: 'Source branch (copy from) *', 'zh-CN': '源分店（复制来源）*' }
  , 'Hệ thống sao chép danh mục, món ăn, định lượng nguyên liệu và hồ sơ dinh dưỡng. Danh mục trùng tên sẽ được gộp thay vì tạo bản trùng lặp.': { en: 'The system copies categories, dishes, ingredient quantities, and nutrition profiles. Categories with matching names are merged instead of duplicated.', 'zh-CN': '系统将复制类别、菜品、食材用量和营养资料。名称相同的类别会合并，不会重复创建。' }
  , 'Đang sao chép...': { en: 'Copying…', 'zh-CN': '正在复制…' }
  , 'Bắt đầu sao chép': { en: 'Start copying', 'zh-CN': '开始复制' }
  , 'Mã QR bàn {table}': { en: 'Table {table} QR code', 'zh-CN': '{table}号桌二维码' }
  , 'Khách quét mã để xem thực đơn và đặt món tại chỗ.': { en: 'Customers can scan this code to view the menu and order at the table.', 'zh-CN': '顾客扫码即可查看菜单并在桌边点餐。' }
  , 'Tên file xuất: {fileName}': { en: 'Export file: {fileName}', 'zh-CN': '导出文件：{fileName}' }
  , 'Đang tạo ảnh {fileName}...': { en: 'Creating image {fileName}…', 'zh-CN': '正在生成图片 {fileName}…' }
  , 'Tải ảnh ({fileName})': { en: 'Download image ({fileName})', 'zh-CN': '下载图片（{fileName}）' }
  , 'In trực tiếp mã QR': { en: 'Print QR code', 'zh-CN': '直接打印二维码' }
  , 'Công thức còn thiếu hoặc có nguyên liệu chưa được xác minh. Hãy khai báo thủ công hoặc hoàn thiện nguyên liệu trước.': { en: 'The recipe is incomplete or has unverified ingredients. Add a manual declaration or complete ingredient verification first.', 'zh-CN': '配方不完整或含有未核实的食材。请先手动声明或完成食材核实。' }
  , 'Nhập nguồn và nội dung đã đối chiếu (tối đa 500 ký tự).': { en: 'Enter the source and verification details (up to 500 characters).', 'zh-CN': '请填写来源和核对内容（最多 500 个字符）。' }
  , 'Không chọn cùng một allergen ở cả “Có chứa” và “Có thể chứa”.': { en: 'Do not select the same allergen under both “Contains” and “May contain”.', 'zh-CN': '请勿在“含有”和“可能含有”中同时选择同一种过敏原。' }
  , 'Không thể bỏ allergen đã xác minh từ nguyên liệu của công thức.': { en: 'Verified allergens from recipe ingredients cannot be removed.', 'zh-CN': '无法移除已由配方食材核实的过敏原。' }
  , 'Xác minh theo công thức cần chọn nguồn “Công thức nhà hàng”.': { en: 'Recipe-based verification requires “Restaurant recipe” as the source.', 'zh-CN': '按配方核实时，来源必须选择“餐厅配方”。' }
  , 'Khai báo allergen đã kiểm tra cho món này. Khách sẽ thấy danh sách và cảnh báo không chặn quyền gọi món.': { en: 'Declare the verified allergens for this dish. Customers will see the list, and the warning will not prevent them from ordering.', 'zh-CN': '填写此菜品已核实的过敏原。顾客会看到清单，但警告不会阻止下单。' }
  , 'Món đã có khai báo được xác nhận. Lưu biểu mẫu này sẽ thay thế khai báo cũ bằng nội dung vừa rà soát.': { en: 'This dish already has a verified declaration. Saving this form replaces the previous declaration with the reviewed details.', 'zh-CN': '此菜品已有已确认的声明。保存后将用本次核对内容替换旧声明。' }
  , 'Cách kiểm tra': { en: 'Verification method', 'zh-CN': '核实方式' }
  , 'Theo công thức món': { en: 'Use the dish recipe', 'zh-CN': '按菜品配方核实' }
  , 'Chỉ bật khi công thức đầy đủ và mọi nguyên liệu đã xác minh.': { en: 'Available only when the recipe is complete and every ingredient is verified.', 'zh-CN': '仅当配方完整且所有食材均已核实时可用。' }
  , 'Khai báo thủ công': { en: 'Manual declaration', 'zh-CN': '手动声明' }
  , 'Dùng khi nhà hàng chưa quản lý công thức trong QDish.': { en: 'Use this when the restaurant does not manage recipes in QDish.', 'zh-CN': '餐厅尚未在 QDish 管理配方时使用。' }
  , 'Chọn allergen có trong thành phần món ăn.': { en: 'Select allergens present in the dish ingredients.', 'zh-CN': '选择菜品食材中含有的过敏原。' }
  , 'Allergen đã xác minh trong công thức được giữ cố định.': { en: 'Verified recipe allergens are fixed.', 'zh-CN': '配方中已核实的过敏原不可更改。' }
  , 'Có thể chứa do lây nhiễm chéo': { en: 'May contain due to cross-contact', 'zh-CN': '可能因交叉接触而含有' }
  , 'Chọn nguy cơ có thể xảy ra khi dùng chung dụng cụ hoặc khu vực chế biến.': { en: 'Select potential risks from shared equipment or preparation areas.', 'zh-CN': '选择因共用器具或加工区域而产生的潜在风险。' }
  , 'Danh sách để trống là một xác nhận có chủ ý': { en: 'An empty list is an intentional confirmation', 'zh-CN': '留空表示已主动确认' }
  , 'Các lựa chọn được gợi ý từ dữ liệu hiện có để tránh bỏ sót. Hãy đối chiếu từng mục với nguồn thực tế; chỉ bỏ chọn khi nguồn xác nhận món không chứa allergen đó. Danh sách để trống chỉ lưu khi nhân viên chủ động xác nhận đã kiểm tra đầy đủ.': { en: 'Suggestions use existing data to reduce omissions. Verify each item against a real source; deselect it only when the source confirms the dish does not contain that allergen. An empty list can be saved only when staff intentionally confirm a complete review.', 'zh-CN': '系统根据现有数据提供建议以减少遗漏。请逐项核对实际来源；只有来源确认菜品不含该过敏原时才取消选择。仅当员工主动确认已完成全面核对时，才可保存空清单。' }
  , 'Ứng viên hiện có': { en: 'Current candidates', 'zh-CN': '当前候选项' }
  , 'Chưa có allergen ứng viên.': { en: 'No allergen candidates yet.', 'zh-CN': '暂无候选过敏原。' }
  , 'Độ bao phủ công thức: chưa đầy đủ': { en: 'Recipe coverage: incomplete', 'zh-CN': '配方覆盖：不完整' }
  , '{count} nguyên liệu chưa xác minh': { en: '{count} ingredients not verified', 'zh-CN': '{count} 种食材未核实' }
  , 'Ghi chú nguồn / nội dung đã kiểm tra *': { en: 'Source / verification notes *', 'zh-CN': '来源/核对说明 *' }
  , 'Ví dụ: Đối chiếu công thức và nhãn của nhà cung cấp.': { en: 'Example: Checked the recipe and supplier label.', 'zh-CN': '示例：已核对配方和供应商标签。' }
  , 'Thông tin chỉ có hiệu lực sau khi lưu xác nhận.': { en: 'This information takes effect after it is saved and confirmed.', 'zh-CN': '保存并确认后，此信息才会生效。' }
  , 'Lưu xác nhận': { en: 'Save verification', 'zh-CN': '保存核实结果' }
  , 'Gluten / lúa mì': { en: 'Gluten / wheat', 'zh-CN': '麸质/小麦' }
  , 'Đậu phộng': { en: 'Peanuts', 'zh-CN': '花生' }
  , 'Hạt cây (óc chó, hạnh nhân, hạt điều...)': { en: 'Tree nuts (walnut, almond, cashew...)', 'zh-CN': '树坚果（核桃、杏仁、腰果等）' }
  , 'Mè': { en: 'Sesame', 'zh-CN': '芝麻' }
  , 'Hải sản có vỏ': { en: 'Shellfish', 'zh-CN': '甲壳类海鲜' }
  , 'Đậu nành': { en: 'Soy', 'zh-CN': '大豆' }
  , 'Sữa': { en: 'Milk', 'zh-CN': '牛奶' }
  , 'Có chứa': { en: 'Contains', 'zh-CN': '含有' }
  , 'Trứng': { en: 'Eggs', 'zh-CN': '鸡蛋' }
  , 'Cá': { en: 'Fish', 'zh-CN': '鱼类' }
  , 'Không thể tìm kiếm nguyên liệu': { en: 'Could not search ingredients', 'zh-CN': '无法搜索食材' }
  , 'Đang tải nguyên liệu…': { en: 'Loading ingredients…', 'zh-CN': '正在加载食材…' }
  , 'Không tải được kho nguyên liệu': { en: 'Could not load the ingredient catalog', 'zh-CN': '无法加载食材库' }
  , 'Không tìm thấy trong kho nguyên liệu': { en: 'Not found in the ingredient catalog', 'zh-CN': '食材库中未找到' }
  , 'Xóa nguyên liệu {name}': { en: 'Remove ingredient {name}', 'zh-CN': '移除食材 {name}' }
  , 'Tìm nguyên liệu (VD: gà, cơm, dầu...)': { en: 'Search ingredients (e.g. tofu, rice, oil...)', 'zh-CN': '搜索食材（例如：豆腐、米饭、食用油…）' }
  , 'Không tìm thấy “{query}” — thử từ khác': { en: 'No results for “{query}” — try another search', 'zh-CN': '未找到“{query}”——请尝试其他关键词' }
  , 'Thêm ít nhất 1 nguyên liệu để xem dữ liệu dinh dưỡng': { en: 'Add at least one ingredient to preview nutrition', 'zh-CN': '请至少添加一种食材以查看营养数据' }
  , 'Không thể tính toán dinh dưỡng': { en: 'Could not calculate nutrition', 'zh-CN': '无法计算营养数据' }
  , 'Số khẩu phần': { en: 'Servings', 'zh-CN': '份数' }
  , 'Dinh dưỡng sẽ chia theo số khẩu phần này': { en: 'Nutrition values are divided by this number of servings', 'zh-CN': '营养数据将按此份数计算' }
  , 'Phương pháp chế biến': { en: 'Cooking method', 'zh-CN': '烹饪方式' }
  , 'Sống': { en: 'Raw', 'zh-CN': '生食' }
  , 'Luộc': { en: 'Boiled', 'zh-CN': '水煮' }
  , 'Hấp': { en: 'Steamed', 'zh-CN': '蒸' }
  , 'Xào': { en: 'Stir-fried', 'zh-CN': '炒' }
  , 'Chiên': { en: 'Fried', 'zh-CN': '炸' }
  , 'Nướng': { en: 'Grilled', 'zh-CN': '烤' }
  , 'Lò nướng': { en: 'Baked', 'zh-CN': '烘烤' }
  , 'Kho': { en: 'Braised', 'zh-CN': '焖/炖' }
  , 'Tìm kiếm từ cơ sở dữ liệu QDish': { en: 'Search the QDish database', 'zh-CN': '搜索 QDish 数据库' }
  , 'Đang tính toán...': { en: 'Calculating…', 'zh-CN': '正在计算…' }
  , 'Xem dinh dưỡng dự kiến': { en: 'Preview nutrition', 'zh-CN': '预览营养数据' }
  , 'Dinh dưỡng / khẩu phần': { en: 'Nutrition per serving', 'zh-CN': '每份营养' }
  , 'Độ tin cậy': { en: 'Confidence', 'zh-CN': '可信度' }
  , 'Chưa đầy đủ ({count} nguyên liệu thiếu)': { en: 'Incomplete ({count} ingredients missing)', 'zh-CN': '信息不完整（缺少 {count} 种食材）' }
  , 'Tỉ lệ calo theo macros': { en: 'Calories by macronutrient ratio', 'zh-CN': '宏量营养素热量比例' }
  , 'Chứa chất gây dị ứng': { en: 'Contains allergens', 'zh-CN': '含有过敏原' }
  , '* Tính tự động theo công thức QDish. Giá trị thực có thể dao động ±10%.': { en: '* Calculated automatically using QDish recipes. Actual values may vary by ±10%.', 'zh-CN': '* 根据 QDish 配方自动计算。实际数值可能有 ±10% 的差异。' }
  , '🥩 Đạm': { en: '🥩 Protein', 'zh-CN': '🥩 蛋白质' }
  , '🌾 Tinh bột': { en: '🌾 Carbohydrates', 'zh-CN': '🌾 碳水化合物' }
  , '🫒 Chất béo': { en: '🫒 Fat', 'zh-CN': '🫒 脂肪' }
  , '🥦 Rau củ': { en: '🥦 Vegetables', 'zh-CN': '🥦 蔬菜' }
  , '🧂 Gia vị': { en: '🧂 Seasonings', 'zh-CN': '🧂 调味料' }
  , '🥛 Sữa': { en: '🥛 Dairy', 'zh-CN': '🥛 乳制品' }
  , 'Đạm': { en: 'Protein', 'zh-CN': '蛋白质' }
  , 'Béo': { en: 'Fat', 'zh-CN': '脂肪' }
  , 'Carbs': { en: 'Carbs', 'zh-CN': '碳水化合物' }
  , 'Chất xơ': { en: 'Fiber', 'zh-CN': '膳食纤维' }
  , 'Đường': { en: 'Sugar', 'zh-CN': '糖' }
  , 'Sodium': { en: 'Sodium', 'zh-CN': '钠' }
  , 'Calo': { en: 'Calories', 'zh-CN': '卡路里' }
  , 'Doanh thu theo chu kỳ': { en: 'Revenue over time', 'zh-CN': '周期营收' }
  , 'Đồ thị vùng': { en: 'Area chart', 'zh-CN': '面积图' }
  , 'Phân bổ doanh thu theo danh mục': { en: 'Revenue by category', 'zh-CN': '按类别统计收入' }
  , 'Biểu đồ tròn': { en: 'Pie chart', 'zh-CN': '饼图' }
  , 'Doanh thu theo giờ cao điểm': { en: 'Revenue by peak hour', 'zh-CN': '高峰时段收入' }
  , 'Biểu đồ cột': { en: 'Bar chart', 'zh-CN': '柱状图' }
  , 'Top 10 món bán chạy nhất': { en: 'Top 10 best-selling dishes', 'zh-CN': '销量最高的 10 道菜' }
  , 'Xếp hạng': { en: 'Ranking', 'zh-CN': '排名' }
  , 'Món ăn': { en: 'Dish', 'zh-CN': '菜品' }
  , 'Số lượng': { en: 'Quantity', 'zh-CN': '数量' }
  , 'Không có dữ liệu': { en: 'No data', 'zh-CN': '暂无数据' }
  , 'Chế độ ăn': { en: 'Dietary needs', 'zh-CN': '饮食方式' }
  , 'Ngữ cảnh sử dụng': { en: 'Usage context', 'zh-CN': '使用场景' }
  , 'Khác': { en: 'Other', 'zh-CN': '其他' }
  , 'Chỉ số thành phần và năng lượng của món.': { en: 'Nutrient and energy values for dishes.', 'zh-CN': '菜品的营养成分和能量指标。' }
  , 'Món phù hợp với nhu cầu ăn kiêng hoặc loại trừ thành phần.': { en: 'Dishes that match dietary needs or ingredient exclusions.', 'zh-CN': '符合饮食需求或排除特定食材的菜品。' }
  , 'Món phù hợp với thời điểm, mục đích hoặc cách dùng.': { en: 'Dishes suited to a time, purpose, or way of serving.', 'zh-CN': '适合特定时间、目的或食用方式的菜品。' }
  , 'Thuộc tính mới chưa có trong danh mục hiển thị.': { en: 'A new attribute not yet listed in the catalog.', 'zh-CN': '尚未列入目录的新属性。' }
  , 'Giàu đạm': { en: 'High protein', 'zh-CN': '高蛋白' }
  , 'Rất giàu đạm': { en: 'Very high protein', 'zh-CN': '极高蛋白' }
  , 'Năng lượng cao': { en: 'Energy dense', 'zh-CN': '高能量' }
  , 'Món no': { en: 'Hearty meal', 'zh-CN': '饱腹餐' }
  , 'Ăn nhẹ': { en: 'Light meal', 'zh-CN': '轻食' }
  , 'Ít đường': { en: 'Low sugar', 'zh-CN': '低糖' }
  , 'Ít calo': { en: 'Low calorie', 'zh-CN': '低卡' }
  , 'Nhiều chất xơ': { en: 'High fiber', 'zh-CN': '高纤维' }
  , 'Ít béo': { en: 'Low fat', 'zh-CN': '低脂' }
  , 'Nhiều tinh bột': { en: 'High carbohydrate', 'zh-CN': '高碳水' }
  , 'Phù hợp Keto': { en: 'Keto friendly', 'zh-CN': '适合生酮饮食' }
  , 'Sau tập luyện': { en: 'Post-workout', 'zh-CN': '运动后' }
  , 'Món chay': { en: 'Vegetarian', 'zh-CN': '素食' }
  , 'Thuần chay': { en: 'Vegan', 'zh-CN': '纯素' }
  , 'Không gluten': { en: 'Gluten free', 'zh-CN': '无麸质' }
  , 'Không bơ sữa': { en: 'Dairy free', 'zh-CN': '无乳制品' }
  , 'Trưa văn phòng': { en: 'Office lunch', 'zh-CN': '办公午餐' }
  , 'Ăn nhanh': { en: 'Quick bite', 'zh-CN': '便捷餐' }
  , 'Dùng để chia sẻ': { en: 'For sharing', 'zh-CN': '适合分享' }
  , 'Bữa gia đình': { en: 'Family meal', 'zh-CN': '家庭餐' }
  , 'Ăn đêm cân bằng': { en: 'Balanced late-night meal', 'zh-CN': '均衡夜宵' }
  , 'Món ăn quen thuộc': { en: 'Comfort food', 'zh-CN': '经典家常菜' }
  , 'Thanh mát': { en: 'Refreshing', 'zh-CN': '清爽' }
  , 'Từ 25g protein trong một món.': { en: 'At least 25 g of protein per dish.', 'zh-CN': '每道菜含至少 25 克蛋白质。' }
  , 'Từ 40g protein trong một món.': { en: 'At least 40 g of protein per dish.', 'zh-CN': '每道菜含至少 40 克蛋白质。' }
  , 'Từ 600 kcal trong một món.': { en: 'At least 600 kcal per dish.', 'zh-CN': '每道菜至少 600 千卡。' }
  , 'Từ 700 kcal hoặc 25g chất béo trong một món.': { en: 'At least 700 kcal or 25 g of fat per dish.', 'zh-CN': '每道菜至少 700 千卡或 25 克脂肪。' }
  , 'Tối đa 400 kcal và 15g chất béo trong một món.': { en: 'Up to 400 kcal and 15 g of fat per dish.', 'zh-CN': '每道菜不超过 400 千卡和 15 克脂肪。' }
  , 'Tối đa 5g đường trong một món.': { en: 'Up to 5 g of sugar per dish.', 'zh-CN': '每道菜糖含量不超过 5 克。' }
  , 'Tối đa 400 kcal trong một món.': { en: 'Up to 400 kcal per dish.', 'zh-CN': '每道菜不超过 400 千卡。' }
  , 'Từ 6g chất xơ trong một món.': { en: 'At least 6 g of fiber per dish.', 'zh-CN': '每道菜含至少 6 克膳食纤维。' }
  , 'Tối đa 10g chất béo trong một món.': { en: 'Up to 10 g of fat per dish.', 'zh-CN': '每道菜脂肪含量不超过 10 克。' }
  , 'Từ 80g carb trong một món.': { en: 'At least 80 g of carbohydrates per dish.', 'zh-CN': '每道菜含至少 80 克碳水化合物。' }
  , 'Tối đa 20g carb và phần lớn năng lượng đến từ chất béo.': { en: 'Up to 20 g of carbohydrates, with most energy from fat.', 'zh-CN': '碳水化合物不超过 20 克，且大部分能量来自脂肪。' }
  , 'Từ 25g protein và 30–60g carb trong một món.': { en: 'At least 25 g of protein and 30–60 g of carbohydrates per dish.', 'zh-CN': '每道菜含至少 25 克蛋白质和 30–60 克碳水化合物。' }
  , 'Không có thịt, cá hoặc hải sản theo dữ liệu thành phần.': { en: 'Ingredient data lists no meat, fish, or seafood.', 'zh-CN': '根据食材数据，不含肉类、鱼类或海鲜。' }
  , 'Không có thành phần động vật theo dữ liệu thành phần.': { en: 'Ingredient data lists no animal-derived ingredients.', 'zh-CN': '根据食材数据，不含动物来源成分。' }
  , 'Không có thành phần chứa gluten theo dữ liệu thành phần.': { en: 'Ingredient data lists no gluten-containing ingredients.', 'zh-CN': '根据食材数据，不含含麸质的食材。' }
  , 'Không có sữa hoặc chế phẩm từ sữa theo dữ liệu thành phần.': { en: 'Ingredient data lists no milk or dairy products.', 'zh-CN': '根据食材数据，不含牛奶或乳制品。' }
  , 'Khoảng 400–700 kcal và không thuộc nhóm món no.': { en: 'Around 400–700 kcal and not classified as a hearty meal.', 'zh-CN': '约 400–700 千卡，且不属于饱腹餐。' }
  , 'Tối đa 350 kcal và phù hợp một khẩu phần.': { en: 'Up to 350 kcal and suitable for one serving.', 'zh-CN': '不超过 350 千卡，适合一人份。' }
  , 'Phù hợp từ 2 khẩu phần.': { en: 'Suitable for at least two servings.', 'zh-CN': '适合至少两人分享。' }
  , 'Phù hợp từ 4 khẩu phần.': { en: 'Suitable for at least four servings.', 'zh-CN': '适合至少四人分享。' }
  , '300–600 kcal với chất béo và carb ở mức vừa phải.': { en: '300–600 kcal with moderate fat and carbohydrate levels.', 'zh-CN': '300–600 千卡，脂肪和碳水化合物含量适中。' }
  , 'Có từ 20g chất béo và 50g carb trong một món.': { en: 'At least 20 g of fat and 50 g of carbohydrates per dish.', 'zh-CN': '每道菜含至少 20 克脂肪和 50 克碳水化合物。' }
  , 'Tối đa 300 kcal và có nguyên liệu rau củ.': { en: 'Up to 300 kcal and includes vegetables.', 'zh-CN': '不超过 300 千卡，并含有蔬菜食材。' }
} satisfies Record<string, { en: string; 'zh-CN': string }>;

export type OwnerConsoleTranslationKey = keyof typeof ownerConsoleMessages;

export const translateOwnerConsoleMessage = (
  language: OwnerConsoleLanguage,
  key: OwnerConsoleTranslationKey,
  values?: Record<string, string | number>
) => {
  const template = language === 'vi' ? key : ownerConsoleMessages[key][language];
  return Object.entries(values || {}).reduce(
    (result, [name, value]) => result.replaceAll(`{${name}}`, String(value)),
    template
  );
};
