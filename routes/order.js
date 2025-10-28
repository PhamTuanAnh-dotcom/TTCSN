const express = require("express");
const router = express.Router();
const db = require("../db");

// Hiển thị danh sách món của bàn
router.get("/:MaBan", (req, res) => {
  const { MaBan } = req.params;
  const sql = "SELECT MaMon, TenMon, GiaBan, HinhAnh FROM MonAn WHERE TrangThai='Con'";

  db.query(sql, (err, dsMon) => {
    if (err) throw err;

    // Lấy vai trò từ session đăng nhập
    const VaiTro = req.session.user ? req.session.user.VaiTro : "NV";

    res.render("order", { MaBan, dsMon, VaiTro });
  });
});


// Nhận danh sách món chọn để hiển thị hóa đơn
router.post("/review", (req, res) => {
  const { MaBan, monChon } = req.body;

  // Nếu người dùng không chọn món nào
  if (!monChon) {
    return res.send("Bạn chưa chọn món nào!");
  }

  // monChon có thể là chuỗi hoặc mảng
  const dsMon = Array.isArray(monChon)
    ? monChon.map(item => JSON.parse(item))
    : [JSON.parse(monChon)];

  res.render("order_review", { MaBan, monChon: dsMon });
});


// Lưu order vào database
router.post("/save", (req, res) => {
  const { MaBan, monAn } = req.body; // monAn = [{MaMon, SoLuong}]
  const MaOder = "OD" + Date.now();
  const MaHD = "HD" + Date.now();
  const TaiKhoanID = req.session.user ? req.session.user.ID : null; // lấy ID người đang đăng nhập

  // Nếu chưa đăng nhập thì không cho order
  if (!TaiKhoanID) {
    return res.status(401).send("Bạn cần đăng nhập để order món!");
  }

  // 1️⃣ Thêm vào bảng Oder (có MaHD và TaiKhoanID)
  const sqlOder = `
    INSERT INTO Oder (MaOder, ThoiGian, MaBan, MaHD, TaiKhoanID)
    VALUES (?, NOW(), ?, ?, ?)
  `;

  db.query(sqlOder, [MaOder, MaBan, MaHD, TaiKhoanID], err => {
    if (err) throw err;

    // 2️⃣ Thêm chi tiết món ăn
    const sqlChiTiet = `
      INSERT INTO Oder_Monan (MaOder, MaMon, SoLuong)
      VALUES ?
    `;
    const values = monAn.map(m => [MaOder, m.MaMon, m.SoLuong]);

    db.query(sqlChiTiet, [values], err2 => {
      if (err2) throw err2;

      // ✅ Sau khi lưu xong, quay lại trang order của bàn
      res.redirect(`/order/${MaBan}`);
    });
  });
});

// Hiển thị hóa đơn của bàn
router.get("/bill/:MaBan", (req, res) => {
  const { MaBan } = req.params;

  const sql = `
    SELECT o.MaOder, m.TenMon, m.GiaBan, om.SoLuong, (m.GiaBan * om.SoLuong) AS ThanhTien
    FROM Oder o
    JOIN Oder_Monan om ON o.MaOder = om.MaOder
    JOIN MonAn m ON om.MaMon = m.MaMon
    WHERE o.MaBan = ?
    ORDER BY o.ThoiGian DESC
    LIMIT 1;
  `;

  db.query(sql, [MaBan], (err, result) => {
    if (err) throw err;
    if (result.length === 0) {
      return res.send("❌ Bàn này chưa có hóa đơn nào!");
    }

    const MaOder = result[0].MaOder;
    const tongTien = result.reduce((sum, item) => sum + parseFloat(item.ThanhTien), 0);

    res.render("bill", { MaBan, MaOder, dsMon: result, tongTien });
  });
});

// Xác nhận thanh toán
router.post("/pay", (req, res) => {
  const { MaBan, MaOder, PhuongThuc } = req.body;
  const MaHD = "HD" + Date.now();

  const sqlHD = `
    INSERT INTO ThanhToan (MaHD, NgayGio, TongTien, PhuongThuc, TrangThaiThanhToan, BanAnID)
    VALUES (?, NOW(),
      (SELECT IFNULL(SUM(m.GiaBan * om.SoLuong), 0)
       FROM Oder_Monan om JOIN MonAn m ON om.MaMon = m.MaMon
       WHERE om.MaOder = ?),
      ?, 'Da thanh toan', ?)
  `;

  db.query(sqlHD, [MaHD, MaOder, PhuongThuc, MaBan], err => {
    if (err) {
      console.error(err);
      return res.status(500).send("Thanh toán thất bại");
    }

    // Cập nhật trạng thái bàn
    db.query("UPDATE BanAn SET TrangThai = 'Trong' WHERE MaBan = ?", [MaBan], err2 => {
      if (err2) {
        console.error(err2);
        return res.status(500).send("Cập nhật bàn thất bại");
      }
      res.redirect("/home_nv");
    });
  });
});


module.exports = router;
