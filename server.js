const express = require("express");
const mysql = require("mysql2");
const session = require("express-session");

const app = express();
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
// Kết nối MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "abc123",
  database: "TTCSN",
});

db.connect(err => {
  if (err) throw err;
  console.log("✅ Kết nối MySQL thành công!");
});
// ✅ Chỉ cần cái này, bỏ body-parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ Thiết lập session
app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

// ✅ Import routes
const authRoutes = require("./routes/auth");
app.use("/", authRoutes);


// Trang chủ
app.get("/", (req, res) => {
  res.render("home", { error: null });
});


// Trang chủ sau đăng nhập
app.get("/home_ql", (req, res) => {
  res.render("home_ql", { user: req.session.user });
});

app.get("/home_nv", (req, res) => {
  res.render("home_nv", { user: req.session.user });
});

app.get("/home_bep", (req, res) => {
  res.render("home_bep", { user: req.session.user });
});

app.listen(3000, () => {
  console.log("Server chạy tại http://localhost:3000");
});
