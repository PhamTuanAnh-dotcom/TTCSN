
# Restaurant Management System

A web-based restaurant management system developed using
Node.js, Express.js, MySQL and EJS.

## 1. Introduction

This project is designed to support restaurant operations
by providing tools for managing employees, tables, menus,
orders, payments and kitchen activities.

The system provides different access permissions based
on user roles.

## 2. Technologies Used

- JavaScript
- Node.js
- Express.js
- MySQL
- EJS
- HTML / CSS / Bootstrap
- express-session
- Postman
- Git & GitHub

## 3. Main Features

### Authentication
- User login and logout.
- Session-based authentication.
- Role-based access control.

### Administrator
- Manage employee accounts.
- Manage restaurant menu.
- Manage tables.
- View statistical reports.
- Manage ingredient recipes.

### Staff
- View available tables.
- Create and manage customer orders.
- Add dishes to orders.
- Process payments.

### Kitchen
- View incoming orders.
- Update dish preparation status.
- Manage order completion.

## 4. User Roles

| Role | Permissions |
|------|-------------|
| Admin | Manage employees, menu, tables and reports |
| Staff | Manage orders and payments |
| Kitchen | View and process food orders |

## 5. Project Structure

```text
Restaurant-Management/
│
├── routes/
│   ├── auth.js
│   ├── staff.js
│   ├── order.js
│   ├── menu.js
│   ├── home_ql.js
│   ├── home_nv.js
│   ├── home_bep.js
│   ├── thongke.js
│   └── dinhluong.js
│
├── views/
│   ├── all_order_history.ejs
│   ├── bill.ejs
│   ├── dinhluong.ejs
│   ├── ds_monan.ejs
│   ├── ds_nhanvien.ejs
│   ├── final-pay.ejs
│   ├── home_bep.ejs
│   ├── home_nv.ejs
│   ├── home_ql.ejs
│   ├── home.ejs
│   ├── order_history.ejs
│   ├── order_review.ejs
│   ├── order.ejs
│   ├── quanli_nhanvien.ejs
│   ├── resgiter.ejs
│   ├── sua_monan.ejs
│   ├── them_monan.ejs
│   └── thongke.ejs
├── db.js
├── server.js
├── .env
├── .gitignore
├── data.sql
├── data_sample.sql
├── package-log.json
├── package.json
└── README.md



## 6. Installation & Setup

### Step 1: Clone repository

```bash
git clone <https://github.com/PhamTuanAnh-dotcom/TTCSN>
cd Restaurant-Management
```

### Step 2: Install dependencies

```bash
npm install
npm install dotenv
npm install-scripts approve bcrypt
npm rebuild bcrypt
```

### Step 3: Configure environment variables

Create a `.env` file in the root directory.

```env
DB_HOST=....
DB_USER=....
DB_PASSWORD=....
DB_NAME=....
DB_PORT=....

SESSION_SECRET=your_secret_key
```

### Step 4: Configure MySQL

- Start MySQL Server.
- Create the database named `....`.
- Import the SQL database structure and sample data.

### Step 5: Run the application

```bash
node server.js
```

Open your browser:

http://localhost:3000

## 7. API Testing

API endpoints and application workflows were tested
using Postman.

## 8. Author

- Name: Pham Tuan Anh
- GitHub: <https://github.com/PhamTuanAnh-dotcom/TTCSN>
