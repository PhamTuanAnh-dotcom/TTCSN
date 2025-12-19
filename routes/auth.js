const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../db");

// ------------------- TRANG ĐĂNG NHẬP -------------------
router.post("/login", (req, res) => {
  const { TaiKhoan, MatKhau } = req.body;

  db.query("SELECT * FROM TaiKhoan WHERE TaiKhoan = ?", [TaiKhoan], (err, results) => {
    if (err) {
      console.error(" Lỗi MySQL:", err);
      return res.send(" Lỗi khi đăng nhập!");
    }

    // Kiểm tra tài khoản tồn tại
    if (results.length === 0) {
      // Trả về câu thông báo: "tài khoản ko tồn tại"
      return res.render("home", { error: "tài khoản ko tồn tại" });
    }

    const user = results[0];

    bcrypt.compare(MatKhau, user.MatKhau, (err, isMatch) => {
      if (err) {
        console.error(" Lỗi bcrypt:", err);
        return res.send(" Lỗi khi đăng nhập!");
      }

      if (isMatch) {
        req.session.user = {
          ID: user.ID,
          HoTen: user.HoTen,
          IDVaiTro: user.IDVaiTro
        };
        switch (user.IDVaiTro) {
          case "QL": return res.redirect("/home_ql");
          case "NV": return res.redirect("/home_nv");
          case "BEP": return res.redirect("/home_bep");
          default: return res.send(" Vai trò không hợp lệ!");
        }
      } else {
        // Trả về câu thông báo: "mật khẩu sai"
        return res.render("home", { error: "mật khẩu sai" });
      }
    });
  });
});

// ------------------- TRANG ĐĂNG KÝ -------------------
router.get("/register", (req, res) => {
  db.query("SELECT * FROM VaiTro", (err, roles) => {
    if (err) {
      console.error("❌ Lỗi MySQL:", err);
      return res.send("❌ Lỗi khi tải trang đăng ký!");
    }
    res.render("register", { roles });
  });
});

// ------------------- XỬ LÝ FORM ĐĂNG NHẬP -------------------
router.post("/login", (req, res) => {
  const { TaiKhoan, MatKhau } = req.body;

  db.query("SELECT * FROM TaiKhoan WHERE TaiKhoan = ?", [TaiKhoan], (err, results) => {
    if (err) {
      console.error(" Lỗi MySQL:", err);
      return res.send(" Lỗi khi đăng nhập!");
    }

    if (results.length === 0) {
      return res.render("home", { error: " Tài khoản không tồn tại!" });
    }
    const user = results[0];

    bcrypt.compare(MatKhau, user.MatKhau, (err, isMatch) => {
      if (err) {
        console.error(" Lỗi bcrypt:", err);
        return res.send(" Lỗi khi đăng nhập!");
      }

      if (isMatch) {
        req.session.user = {
          ID: user.ID,
          HoTen: user.HoTen,
          IDVaiTro: user.IDVaiTro
        };
        switch (user.IDVaiTro) {
          case "QL": return res.redirect("/home_ql");
          case "NV": return res.redirect("/home_nv");
          case "BEP": return res.redirect("/home_bep");
          default: return res.send(" Vai trò không hợp lệ!");
        }
      } else {
        return res.render("home", { error: " Sai mật khẩu!" });
      }
    });
  });
});

// ------------------- XỬ LÝ FORM ĐĂNG KÝ -------------------
router.post("/register", async (req, res) => {
  try {
    const { HoTen, SDT, Gmail, CCCD, TaiKhoan, MatKhau, IDVaiTro } = req.body;
    const hashedPassword = await bcrypt.hash(MatKhau, 10);
    const ID = "NV_" + Date.now();

    const sql = `INSERT INTO TaiKhoan 
      (ID, HoTen, SDT, Gmail, CCCD, TaiKhoan, MatKhau, IDVaiTro) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [ID, HoTen, SDT, Gmail, CCCD, TaiKhoan, hashedPassword, IDVaiTro], (err) => {
      if (err) {
        console.error(" Lỗi MySQL:", err);
        return res.send(" Lỗi khi đăng ký!");
      }
      return res.render("home_ql", { error: "đăng kí thành công" });
    });
  } catch (error) {
    console.error("Lỗi hệ thống:", error);
    res.send(" Có lỗi xảy ra khi đăng ký!");
  }
});

// ------------------- ĐĂNG XUẤT -------------------
router.get("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(" Lỗi khi đăng xuất:", err);
      return res.send(" Lỗi khi đăng xuất!");
    }
    req.session = null;
    res.redirect("/");
  });
});

module.exports = router;
