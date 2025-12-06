# Card Checker System - نظام فحص البطاقات المتقدم

نظام متكامل لفحص البطاقات مع لوحة تحكم احترافية.

## المميزات

- ✅ لوحة تحكم احترافية بتصميم عصري
- ✅ إدارة المستخدمين (إضافة/تعديل/حذف)
- ✅ عرض نتائج الفحص مع فلاتر
- ✅ سجل النشاط
- ✅ تصدير البيانات إلى CSV
- ✅ API للسكريبت الخارجي
- ✅ نظام مصادقة مستقل (بدون Manus OAuth)

## المتطلبات

- Node.js 18+
- MySQL Database
- Railway أو أي خدمة استضافة

## التثبيت المحلي

```bash
# تثبيت الحزم
npm install

# إنشاء ملف .env
cp .env.example .env
# قم بتعديل DATABASE_URL و JWT_SECRET

# تشغيل التطوير
npm run dev
```

## متغيرات البيئة

```env
DATABASE_URL=mysql://user:password@host:port/database?ssl={"rejectUnauthorized":true}
JWT_SECRET=your-secret-key-here
NODE_ENV=production
PORT=3000
```

## النشر على Railway

1. أنشئ مشروع جديد على Railway
2. أضف خدمة MySQL
3. اربط المستودع من GitHub
4. أضف متغيرات البيئة:
   - `DATABASE_URL` (يتم إنشاؤه تلقائياً من MySQL)
   - `JWT_SECRET` (أي نص عشوائي طويل)
5. Railway سيقوم بالبناء والنشر تلقائياً

## إعداد قاعدة البيانات

قم بتشغيل SQL التالي لإنشاء الجداول:

```sql
-- جدول مستخدمي السكريبت
CREATE TABLE IF NOT EXISTS script_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(64) NOT NULL UNIQUE,
  password_hash VARCHAR(256) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  max_daily_checks INT NOT NULL DEFAULT 1000,
  today_checks INT NOT NULL DEFAULT 0,
  total_checks INT NOT NULL DEFAULT 0,
  successful_checks INT NOT NULL DEFAULT 0,
  last_check_date DATE,
  expires_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- جدول نتائج الفحص
CREATE TABLE IF NOT EXISTS check_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  script_user_id INT NOT NULL,
  card_number VARCHAR(20) NOT NULL,
  expiry_month VARCHAR(2) NOT NULL,
  expiry_year VARCHAR(4) NOT NULL,
  cvv VARCHAR(4),
  status ENUM('ACTIVE', 'DECLINED', 'ERROR') NOT NULL,
  response_message TEXT,
  bank VARCHAR(100),
  card_type VARCHAR(50),
  country VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- جدول سجل النشاط
CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  script_user_id INT,
  action VARCHAR(100) NOT NULL,
  details TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- جدول مدراء لوحة التحكم
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(64) NOT NULL UNIQUE,
  password_hash VARCHAR(256) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء مستخدم admin (كلمة المرور: Mohammed@123)
INSERT INTO admin_users (username, password_hash) 
VALUES ('admin', 'b317a95b704fdfcbaeb953a71de4d908b1bf1a61373504d678caaad862f28dcf');
```

## Script API

### التحقق من حالة السيرفر
```
GET /api/script/status
```

### تسجيل دخول السكريبت
```
POST /api/script/login
Content-Type: application/json

{
  "username": "test",
  "password": "password123"
}
```

### فحص بطاقة
```
POST /api/script/check
Content-Type: application/json

{
  "token": "jwt-token-from-login",
  "card": "4111111111111111",
  "month": "12",
  "year": "2025",
  "cvv": "123"
}
```

## بيانات الدخول الافتراضية

**لوحة التحكم:**
- اسم المستخدم: `admin`
- كلمة المرور: `Mohammed@123`

## هيكل المشروع

```
card_checker_clean/
├── client/                 # الواجهة الأمامية (React + Vite)
│   ├── src/
│   │   ├── pages/         # صفحات التطبيق
│   │   ├── lib/           # مكتبات مساعدة
│   │   ├── App.tsx        # التطبيق الرئيسي
│   │   └── main.tsx       # نقطة الدخول
│   └── index.html
├── server/                 # الخادم (Express + tRPC)
│   ├── index.ts           # نقطة الدخول
│   ├── routers.ts         # API endpoints
│   ├── db.ts              # وظائف قاعدة البيانات
│   ├── crypto.ts          # التشفير
│   └── scriptApi.ts       # API للسكريبت
├── drizzle/               # مخطط قاعدة البيانات
│   └── schema.ts
├── package.json
├── vite.config.ts
├── tsconfig.json
└── railway.json
```

## الترخيص

MIT License
