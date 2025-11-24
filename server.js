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
  console.log("Kết nối MySQL thành công!");
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

// Import routes
const authRoutes = require("./routes/auth");
const staffRoutes = require("./routes/staff");
const orderRoutes = require("./routes/order");
const homeQLRoutes = require("./routes/home_ql"); 
const menuRoutes = require("./routes/menu"); 
const homeNVRoutes = require("./routes/home_nv");
const homeBEPRoutes = require("./routes/home_bep");
const thongkeRoutes = require("./routes/thongke");

app.use("/auth", authRoutes);
app.use("/order", orderRoutes);
app.use("/staff", staffRoutes);
app.use("/home_ql", homeQLRoutes);
app.use("/menu", menuRoutes);
app.use("/home_nv", homeNVRoutes);
app.use("/home_bep", homeBEPRoutes); 
app.use("/thongke", thongkeRoutes);

// Trang mặc định
app.get("/", (req, res) => {
  res.render("home", { error: null });
});

app.listen(3000, () => {
  console.log(" Server chạy tại http://localhost:3000");
});
