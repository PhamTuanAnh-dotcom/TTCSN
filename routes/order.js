const express = require("express");
const router = express.Router();
const db = require("../db");


// Hiển thị hóa đơn của bàn
router.get("/bill/:MaBan", (req, res) => {
  const { MaBan } = req.params;

  const sql = `
    SELECT
      m.MaMon,
      m.TenMon,
      m.GiaBan,
      SUM(om.SoLuong) AS SoLuong,
      SUM(m.GiaBan * om.SoLuong) AS ThanhTien
    FROM Oder o
    JOIN Oder_Monan om ON o.MaOder = om.MaOder
    JOIN MonAn m ON om.MaMon = m.MaMon
    WHERE o.MaBan = ? 
      AND o.MaHD IS NULL
      AND o.TrangThai = 'Da hoan thanh'
    GROUP BY m.MaMon, m.TenMon, m.GiaBan
    ORDER BY m.TenMon;
  `;

  db.query(sql, [MaBan], (err, result) => {
    if (err) throw err;

    if (result.length === 0) {
      return res.send("❌ Bàn này chưa có order nào cần thanh toán!");
    }

    const tongTien = result.reduce(
      (sum, item) => sum + Number(item.ThanhTien),
      0
    );

    const TenNhanVien = req.session.user?.HoTen || "Chưa xác định";

    res.render("bill", {
      MaBan,
      dsMonAn: result,
      tongTien,
      TenNhanVien
    });
  });
});

// Route: Hiển thị trang xác nhận thanh toán cuối cùng (đã sửa tên file render)
router.get("/final-pay", (req, res) => {
    const { MaBan, TongTien, MaOderList, TenNhanVien } = req.query;
    const MaOderArray = MaOderList ? MaOderList.split(',') : [];

    if (!MaBan || !TongTien) {
        return res.status(400).send("Thiếu thông tin bàn hoặc tổng tiền!");
    }

    res.render("final-pay", { 
        MaBan, 
        TongTien: parseFloat(TongTien), 
        MaOderList: MaOderArray, 
        TenNhanVien 
    });
});

// Nhận danh sách món chọn để hiển thị hóa đơn (Giữ nguyên)
router.post("/review", (req, res) => {
  const { MaBan, monChon } = req.body;

  if (!monChon) {
    return res.send("Bạn chưa chọn món nào!");
  }

  const dsMon = Array.isArray(monChon)
    ? monChon.map(item => JSON.parse(item))
    : [JSON.parse(monChon)];

  res.render("order_review", { MaBan, monChon: dsMon });
});


// Lưu order và Cập nhật trạng thái bàn (Giữ nguyên logic sửa lỗi)
router.post("/save", (req, res) => {
  const { MaBan, monAn } = req.body;
  const MaOder = "OD" + Date.now();
  const TaiKhoanID = req.session.user?.ID;

  if (!TaiKhoanID) {
    return res.status(401).send("Bạn cần đăng nhập để order món!");
  }

  if (!monAn || !monAn.MaMon || !monAn.SoLuong) {
    return res.status(400).send("Dữ liệu món ăn không hợp lệ!");
  }

  // ✅ CHUYỂN FORM → DANH SÁCH MÓN CHUẨN
  const dsMonAn = monAn.MaMon.map((maMon, index) => ({
    MaMon: maMon,
    SoLuong: Number(monAn.SoLuong[index]),
    GiChu: monAn.GiChu ? monAn.GiChu[index] : null
  }));

  // 1️⃣ Thêm Oder
  const sqlOder = `
    INSERT INTO Oder (MaOder, ThoiGian, MaBan, TaiKhoanID)
    VALUES (?, NOW(), ?, ?)
  `;

  db.query(sqlOder, [MaOder, MaBan, TaiKhoanID], err => {
    if (err) return res.status(500).send("Lỗi khi thêm Oder!");

    // 2️⃣ Thêm chi tiết món
    const sqlChiTiet = `
      INSERT INTO Oder_Monan (MaOder, MaMon, SoLuong, GiChu)
      VALUES ?
    `;

    const values = dsMonAn.map(m => [
      MaOder,
      m.MaMon,
      m.SoLuong,
      m.GiChu
    ]);

    db.query(sqlChiTiet, [values], err2 => {
      if (err2) {
        console.error(err2);
        return res.status(500).send("Lỗi chi tiết món!");
      }

      // 3️⃣ Cập nhật trạng thái bàn
      db.query(
        "UPDATE BanAn SET TrangThai = 'Dang phuc vu' WHERE MaBan = ?",
        [MaBan],
        err3 => {
          if (err3) return res.status(500).send("Lỗi cập nhật bàn!");
          res.redirect(`/order/${MaBan}`);
        }
      );
    });
  });
});




// ✅ ROUTE MỚI: Lấy TẤT CẢ Order (Đã thanh toán và Chưa thanh toán)
router.get("/all-history", (req, res) => {
    const sql = `
        SELECT 
            o.MaOder, o.ThoiGian, o.MaBan, o.MaHD, o.TrangThai,
            t.HoTen AS NhanVien, m.TenMon, om.SoLuong, m.GiaBan,
            (m.GiaBan * om.SoLuong) AS ThanhTien
        FROM Oder o
        JOIN Oder_Monan om ON o.MaOder = om.MaOder
        JOIN MonAn m ON om.MaMon = m.MaMon
        LEFT JOIN TaiKhoan t ON o.TaiKhoanID = t.ID
        ORDER BY o.ThoiGian DESC;
    `;
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Lỗi truy vấn:", err);
            return res.status(500).send("Lỗi server");
        }

        // Nhóm các món ăn theo Mã Order
        const ordersGrouped = results.reduce((acc, item) => {
            if (!acc[item.MaOder]) {
                acc[item.MaOder] = {
                    MaOder: item.MaOder,
                    ThoiGian: item.ThoiGian,
                    MaBan: item.MaBan,
                    NhanVien: item.NhanVien,
                    MaHD: item.MaHD, // Lấy mã hóa đơn để xác định trạng thái
                    TrangThai: item.MaHD ? 'Đã thanh toán' : 'Chưa thanh toán',
                    TrangThaiOrder: item.TrangThai,
                    dsMon: [],
                    TongTien: 0
                };
            }
            acc[item.MaOder].dsMon.push({
                TenMon: item.TenMon,
                SoLuong: item.SoLuong,
                GiaBan: item.GiaBan
            });
            acc[item.MaOder].TongTien += parseFloat(item.ThanhTien);
            return acc;
        }, {});

        res.render("all_order_history", { orders: Object.values(ordersGrouped) });
    });
});


// ✅ ROUTE ĐỔI TÊN: Lấy Order CHƯA THANH TOÁN (Chỉ lấy order đang chờ xử lý)
router.get("/pending-orders", (req, res) => {
    const sql = `
        SELECT 
            o.MaOder, o.ThoiGian, o.MaBan, 
            t.HoTen AS NhanVien, m.TenMon, om.SoLuong, m.GiaBan,
            (m.GiaBan * om.SoLuong) AS ThanhTien
        FROM Oder o
        JOIN Oder_Monan om ON o.MaOder = om.MaOder
        JOIN MonAn m ON om.MaMon = m.MaMon
        LEFT JOIN TaiKhoan t ON o.TaiKhoanID = t.ID
        WHERE o.MaHD IS NULL AND o.TrangThai = 'Chua hoan thanh'
        ORDER BY o.MaBan ASC, o.ThoiGian DESC
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Lỗi truy vấn:", err);
            return res.status(500).send("Lỗi server");
        }

        const ordersGrouped = results.reduce((acc, item) => {
            if (!acc[item.MaOder]) {
                acc[item.MaOder] = {
                    MaOder: item.MaOder,
                    ThoiGian: item.ThoiGian,
                    MaBan: item.MaBan,
                    NhanVien: item.NhanVien,
                    dsMon: [],
                    TongTien: 0
                };
            }
            acc[item.MaOder].dsMon.push({
                TenMon: item.TenMon,
                SoLuong: item.SoLuong,
                GiaBan: item.GiaBan
            });
            acc[item.MaOder].TongTien += parseFloat(item.ThanhTien);
            return acc;
        }, {});

        // Sử dụng lại template order_history.ejs cho Order CHƯA thanh toán
        res.render("order_history", { orders: Object.values(ordersGrouped) }); 
    });
});


// Xác nhận thanh toán (Giữ nguyên logic sửa lỗi)
router.post("/pay", (req, res) => {
  const { MaBan, PhuongThuc, TongTien } = req.body;
  const MaHD = "HD" + Date.now();
  const TaiKhoanID = req.session.user?.ID;
  const tongTienFloat = parseFloat(TongTien); 
  const IDVaiTro = req.session.user?.IDVaiTro;

  if (!MaBan || !PhuongThuc || !tongTienFloat || tongTienFloat <= 0) {
      return res.status(400).send("Thiếu thông tin thanh toán cần thiết.");
  }
  
  // 1. Thêm vào bảng ThanhToan
  const sqlHD = `
      INSERT INTO ThanhToan (MaHD, NgayGio, TongTien, PhuongThuc, TrangThaiThanhToan, TaiKhoanID, BanAnID)
      VALUES (?, NOW(), ?, ?, 'Da thanh toan', ?, ?)
  `;
  db.query(sqlHD, [MaHD, tongTienFloat, PhuongThuc, TaiKhoanID, MaBan], err2 => {
      if (err2) throw err2;

      // 2. Gắn MaHD cho các Oder chưa thanh toán của bàn đó
      const sqlUpdate = `UPDATE Oder SET MaHD = ? WHERE MaBan = ? AND MaHD IS NULL AND TrangThai = 'Da hoan thanh'`;
      db.query(sqlUpdate, [MaHD, MaBan], err3 => {
          if (err3) throw err3;

          // 3. Cập nhật trạng thái Bàn Ăn về 'Trong'
          db.query("UPDATE BanAn SET TrangThai = 'Trong' WHERE MaBan = ?", [MaBan], err4 => {
              if (err4) throw err4;
              
              if (IDVaiTro === "QL") {
                  res.redirect("/home_ql");
              } else if (IDVaiTro === "NV") {
                  res.redirect("/home_nv");
              } else {
                  res.redirect("/");
              }
          });
      });
  });
});
// Hiển thị danh sách món của bàn
router.get("/:MaBan", (req, res) => {
  const { MaBan } = req.params;
  const sql = "SELECT MaMon, TenMon, GiaBan, HinhAnh FROM MonAn WHERE TrangThai='Con'";

  db.query(sql, (err, dsMon) => {
    if (err) throw err;

    const IDVaiTro = req.session.user?.IDVaiTro;

    if (!IDVaiTro) {
      return res.redirect("/auth/login");
    }

    res.render("order", { MaBan, dsMon, IDVaiTro });
  });
});

module.exports = router;