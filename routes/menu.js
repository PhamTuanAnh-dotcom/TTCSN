const express = require("express");
const router = express.Router();
const db = require("../db");

// Xem danh sách món ăn
router.get("/dsmonan", (req, res) => {
  const sql = `
    SELECT m.MaMon, m.TenMon, l.TenLoai, m.GiaBan, m.TrangThai
    FROM MonAn m
    LEFT JOIN LoaiMon l ON m.MaLoai = l.MaLoai
  `;
  db.query(sql, (err, data) => {
    if (err) throw err;
    res.render("ds_monan", { dsMonAn: data });
  });
});

// Form thêm món ăn
router.get("/them", (req, res) => {
  db.query("SELECT * FROM LoaiMon", (err, loai) => {
    if (err) throw err;
    res.render("them_monan", { loai });
  });
});

// Xử lý thêm món ăn
router.post("/them", (req, res) => {
  const { MaMon, TenMon, MaLoai, GiaBan, TrangThai } = req.body;

  // MẢNG nguyên liệu – định lượng
  const NguyenLieu = req.body.NguyenLieu;      // array
  const DinhLuong = req.body.DinhLuong;        // array
  const GhiChu = req.body.GhiChu || [];        // optional

  // 1) Thêm Món Ăn
  const sqlMon =
    `INSERT INTO MonAn (MaMon, TenMon, MaLoai, GiaBan, TrangThai) VALUES (?, ?, ?, ?, ?)`;

  db.query(sqlMon, [MaMon, TenMon, MaLoai || null, GiaBan, TrangThai], err => {
    if (err) throw err;
    // 2) Kiểm tra nguyên liệu
    if (!NguyenLieu || NguyenLieu.length === 0) {
      return res.redirect("/menu/dsmonan");
    }

    // 3) Thêm nguyên liệu vào ChiTietMonAn
    const sqlCT =
      "INSERT INTO ChiTietMonAn (MaMon, NguyenLieu, DinhLuong) VALUES ?";

    let data = [];

    for (let i = 0; i < NguyenLieu.length; i++) {
      if (!NguyenLieu[i]) continue;

      data.push([
        MaMon,
        NguyenLieu[i],
        DinhLuong[i] || ""
      ]);
    }

    if (data.length === 0) return res.redirect("/menu/dsmonan");

    db.query(sqlCT, [data], err2 => {
      if (err2) throw err2;

      res.redirect("/menu/dsmonan");
    });
  });
});


// Form sửa món ăn
router.get("/sua/:MaMon", (req, res) => {
  const { MaMon } = req.params;
  const sqlMon = "SELECT * FROM MonAn WHERE MaMon = ?";
  const sqlLoai = "SELECT * FROM LoaiMon";

  db.query(sqlMon, [MaMon], (err, mon) => {
    if (err) throw err;
    db.query(sqlLoai, (err2, loai) => {
      if (err2) throw err2;
      res.render("sua_monan", { mon: mon[0], loai });
    });
  });
});

// Xử lý sửa món ăn
router.post("/sua/:MaMon", (req, res) => {
  const { MaMon } = req.params;
  const { TenMon, MaLoai, GiaBan, TrangThai } = req.body;
  const sql = `UPDATE MonAn SET TenMon=?, MaLoai=?, GiaBan=?, TrangThai=? WHERE MaMon=?`;
  db.query(sql, [TenMon, MaLoai || null, GiaBan, TrangThai, MaMon], err => {
    if (err) throw err;
    res.redirect("/menu/dsmonan");
  });
});

// Xóa món ăn
router.get("/xoa/:MaMon", (req, res) => {
  const { MaMon } = req.params;
  db.query("DELETE FROM MonAn WHERE MaMon = ?", [MaMon], err => {
    if (err) throw err;
    res.redirect("/menu/dsmonan");
  });
});

module.exports = router;
