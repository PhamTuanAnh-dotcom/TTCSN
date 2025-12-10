const express = require("express");
const router = express.Router();
const db = require("../db");


// Hiển thị hóa đơn của bàn
router.get("/bill/:MaBan", (req, res) => {
  const { MaBan } = req.params;

  const sql = `
    SELECT o.MaOder, m.TenMon, m.GiaBan, om.SoLuong, (m.GiaBan * om.SoLuong) AS ThanhTien
    FROM Oder o
    JOIN Oder_Monan om ON o.MaOder = om.MaOder
    JOIN MonAn m ON om.MaMon = m.MaMon
    WHERE o.MaBan = ? AND o.MaHD IS NULL
    ORDER BY o.ThoiGian;
  `;

  db.query(sql, [MaBan], (err, result) => {
    if (err) throw err;
    if (result.length === 0) {
      return res.send("❌ Bàn này chưa có order nào cần thanh toán!");
    }

    const tongTien = result.reduce((sum, item) => sum + parseFloat(item.ThanhTien), 0);
    const MaOderList = [...new Set(result.map(r => r.MaOder))];
    const TenNhanVien = req.session.user?.HoTen || "Chưa xác định";

    res.render("bill", { MaBan, dsMonAn: result, tongTien, TenNhanVien, MaOderList });
  });
});
// Hiển thị danh sách món của bàn
router.get("/:MaBan", (req, res) => {
  const { MaBan } = req.params;
  const sql = "SELECT MaMon, TenMon, GiaBan, HinhAnh FROM MonAn WHERE TrangThai='Con'";

  db.query(sql, (err, dsMon) => {
    if (err) throw err;

    // Lấy vai trò từ session đăng nhập
    const IDVaiTro = req.session.user ? req.session.user.IDVaiTro : "NV";

    res.render("order", { MaBan, dsMon, IDVaiTro });
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
  const { MaBan } = req.body;
  const TaiKhoanID = req.session.user ? req.session.user.ID : null;

  if (!TaiKhoanID) {
    return res.status(401).send("Bạn cần đăng nhập để order món!");
  }

  const MaOder = "OD" + Date.now();

  // 🔥 CHỖ NÀY — FIX monAn thành array đúng
  const monAn = [];
  req.body.monAn.MaMon.forEach((maMon, i) => {
    monAn.push({
      MaMon: maMon,
      SoLuong: req.body.monAn.SoLuong[i],
      GiChu: req.body.monAn.GiChu[i] || ''
    });
  });

  console.log("MONAN ARRAY =", monAn);  // Debug để bạn thấy GiChu đã vào

  // INSERT Oder
  const sqlOder = `
    INSERT INTO Oder (MaOder, ThoiGian, MaBan, TaiKhoanID)
    VALUES (?, NOW(), ?, ?)
  `;

  db.query(sqlOder, [MaOder, MaBan, TaiKhoanID], err => {
    if (err) throw err;

    // INSERT chi tiết món ăn
    const sqlChiTiet = `
      INSERT INTO Oder_Monan (MaOder, MaMon, SoLuong, GiChu)
      VALUES ?
    `;

    const values = monAn.map(m => [
      MaOder, m.MaMon, m.SoLuong, m.GiChu
    ]);

    db.query(sqlChiTiet, [values], err2 => {
      if (err2) throw err2;

      res.redirect(`/order/${MaBan}`);
    });
  });
});
// Hiển thị lịch sử order trong ngày
router.get("/history", (req, res) => {
    // Tính ngày hôm nay từ 00:00:00 -> 23:59:59
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const sql = `
        SELECT o.MaOder, o.ThoiGian, o.MaBan, o.TaiKhoanID,
               t.HoTen AS NhanVien
        FROM Oder o
        LEFT JOIN TaiKhoan t ON o.TaiKhoanID = t.ID
        WHERE o.ThoiGian BETWEEN ? AND ?
        ORDER BY o.ThoiGian DESC
    `;

    db.query(sql, [startOfDay, endOfDay], (err, results) => {
        if (err) {
            console.error("Lỗi truy vấn:", err);
            return res.status(500).send("Lỗi server");
        }

        res.render("order_history", { orders: results });
    });
});
// Xác nhận thanh toán
router.post("/pay", (req, res) => {
  const { MaBan, PhuongThuc } = req.body;
  const MaHD = "HD" + Date.now();
  const TaiKhoanID = req.session.user?.ID;

  // Tính tổng tiền từ các order chưa có MaHD
  const sqlTong = `
    SELECT SUM(m.GiaBan * om.SoLuong) AS Tong
    FROM Oder o
    JOIN Oder_Monan om ON o.MaOder = om.MaOder
    JOIN MonAn m ON om.MaMon = m.MaMon
    WHERE o.MaBan = ? AND o.MaHD IS NULL
  `;

  db.query(sqlTong, [MaBan], (err, result) => {
    if (err) throw err;
    const tongTien = result[0].Tong || 0;

    // Thêm vào bảng ThanhToan
    const sqlHD = `
      INSERT INTO ThanhToan (MaHD, NgayGio, TongTien, PhuongThuc, TrangThaiThanhToan, TaiKhoanID, BanAnID)
      VALUES (?, NOW(), ?, ?, 'Da thanh toan', ?, ?)
    `;
    db.query(sqlHD, [MaHD, tongTien, PhuongThuc, TaiKhoanID, MaBan], err2 => {
      if (err2) throw err2;

      // Gắn MaHD cho các Oder chưa thanh toán của bàn đó
      const sqlUpdate = `UPDATE Oder SET MaHD = ? WHERE MaBan = ? AND MaHD IS NULL`;
      db.query(sqlUpdate, [MaHD, MaBan], err3 => {
        if (err3) throw err3;

        db.query("UPDATE BanAn SET TrangThai = 'Trong' WHERE MaBan = ?", [MaBan], err4 => {
          if (err4) throw err4;
           if (IDVaiTro === "QL") {
            res.redirect("/home_ql");
          } 
          else if (IDVaiTro === "NV") {
            res.redirect("/home_nv");
          } 
          else {
            res.redirect("/");
          }
        });
      });
    });
  });
});
module.exports = router;
