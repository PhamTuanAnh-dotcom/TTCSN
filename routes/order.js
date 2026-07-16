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
      AND (om.TrangThai IS NULL OR om.TrangThai <> 'Da huy')
    GROUP BY m.MaMon, m.TenMon, m.GiaBan
    ORDER BY m.TenMon;
  `;

  db.query(sql, [MaBan], (err, result) => {
    if (err) throw err;

    const TenNhanVien = req.session.user?.HoTen || "Chưa xác định";

    if (result.length === 0) {
      return res.render("bill", {
        MaBan,
        dsMonAn: [],
        tongTien: 0,
        TenNhanVien
      });
    }

    const tongTien = result.reduce(
      (sum, item) => sum + Number(item.ThanhTien),
      0
    );

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


// Lưu order và cập nhật trạng thái bàn
router.post("/save", (req, res) => {
  const { MaBan, monAn } = req.body;
  const MaOder = "OD" + Date.now();
  const TaiKhoanID = req.session.user?.ID;

  // 1. Kiểm tra đăng nhập
  if (!TaiKhoanID) {
    return res.status(401).send("Bạn cần đăng nhập để order món!");
  }

  // 2. Kiểm tra dữ liệu đầu vào
  if (!MaBan || !monAn || !monAn.MaMon || !monAn.SoLuong) {
    return res.status(400).send("Dữ liệu món ăn không hợp lệ!");
  }

  if (monAn.MaMon.length !== monAn.SoLuong.length) {
    return res.status(400).send("Dữ liệu món ăn không hợp lệ!");
  }

  // 3. Kiểm tra số lượng
  for (let i = 0; i < monAn.SoLuong.length; i++) {
    const soLuong = Number(monAn.SoLuong[i]);

    if (!Number.isInteger(soLuong) || soLuong <= 0) {
      return res.status(400).send("Số lượng không hợp lệ!");
    }
  }

  // 4. Kiểm tra bàn tồn tại
  db.query(
    "SELECT * FROM BanAn WHERE MaBan = ?",
    [MaBan],
    (err, ban) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Lỗi server!");
      }

      if (ban.length === 0) {
        return res.status(404).send("Bàn không tồn tại!");
      }

      // 5. Kiểm tra tất cả món tồn tại và còn bán
      const dsMaMon = monAn.MaMon;

      db.query(
        "SELECT MaMon, TrangThai FROM MonAn WHERE MaMon IN (?)",
        [dsMaMon],
        (err2, dsMon) => {
          if (err2) {
            console.error(err2);
            return res.status(500).send("Lỗi server!");
          }

          // Thiếu món
          if (dsMon.length !== dsMaMon.length) {
            return res.status(404).send("Món ăn không tồn tại!");
          }

          // Món hết
          const monHet = dsMon.find(m => m.TrangThai !== "Con");

          if (monHet) {
            return res.status(409).send("Món ăn đã hết!");
          }

          // 6. Chuyển dữ liệu
          const dsMonAn = dsMaMon.map((maMon, index) => ({
            MaMon: maMon,
            SoLuong: Number(monAn.SoLuong[index]),
            GiChu: monAn.GiChu ? monAn.GiChu[index] : null
          }));

          // 7. Thêm Order
          const sqlOder = `
            INSERT INTO Oder
            (MaOder, ThoiGian, MaBan, TaiKhoanID)
            VALUES (?, NOW(), ?, ?)
          `;

          db.query(
            sqlOder,
            [MaOder, MaBan, TaiKhoanID],
            (err3) => {
              if (err3) {
                console.error(err3);
                return res.status(500).send("Lỗi khi thêm Order!");
              }

              const values = dsMonAn.map(m => [
                MaOder,
                m.MaMon,
                m.SoLuong,
                m.GiChu
              ]);

              db.query(
                `
                INSERT INTO Oder_Monan
                (MaOder, MaMon, SoLuong, GiChu)
                VALUES ?
                `,
                [values],
                (err4) => {
                  if (err4) {
                    console.error(err4);
                    return res.status(500).send("Lỗi khi thêm chi tiết Order!");
                  }

                  db.query(
                    "UPDATE BanAn SET TrangThai='Dang phuc vu' WHERE MaBan=?",
                    [MaBan],
                    (err5) => {
                      if (err5) {
                        console.error(err5);
                        return res.status(500).send("Lỗi cập nhật trạng thái bàn!");
                      }

                      return res.redirect(`/order/${MaBan}`);
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
});




// ✅ ROUTE MỚI: Lấy TẤT CẢ Order (Đã thanh toán và Chưa thanh toán)
router.get("/all-history", (req, res) => {
  const sql = `
    SELECT
        o.MaOder,
        o.ThoiGian,
        o.MaBan,
        o.MaHD,
        o.TrangThai,
        t.HoTen AS NhanVien,
        m.TenMon,
        om.SoLuong,
        m.GiaBan,
        (m.GiaBan * om.SoLuong) AS ThanhTien
    FROM Oder o
    JOIN Oder_Monan om ON o.MaOder = om.MaOder
    JOIN MonAn m ON om.MaMon = m.MaMon
    LEFT JOIN TaiKhoan t ON o.TaiKhoanID = t.ID
    WHERE DATE(o.ThoiGian) = CURDATE()
    ORDER BY o.ThoiGian DESC
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


// Xác nhận thanh toán (Phiên bản Callback thuần - Không lỗi)
router.post("/pay", (req, res) => {
  const { MaBan, PhuongThuc, TongTien } = req.body;

  const MaHD = "HD" + Date.now();
  const TaiKhoanID = req.session.user?.ID;
  const IDVaiTro = req.session.user?.IDVaiTro;
  const tongTienFloat = Number(TongTien);

  // ===== Validate =====
  if (
    !MaBan ||
    !PhuongThuc ||
    Number.isNaN(tongTienFloat) ||
    tongTienFloat < 0
  ) {
    return res.status(400).send("Thiếu thông tin thanh toán cần thiết.");
  }

  // Hàm tiện ích để redirect theo vai trò
  const redirectByUserRole = () => {
    if (IDVaiTro === "QL") {
      return res.redirect("/home_ql");
    }
    if (IDVaiTro === "NV") {
      return res.redirect("/home_nv");
    }
    return res.redirect("/");
  };

  // ===================================================
  // Trường hợp 1: Không còn món nào cần thanh toán (0 đồng)
  // Chỉ trả bàn về trạng thái Trống
  // ===================================================
  if (tongTienFloat === 0) {
    // KHÔNG dùng "return db.query(...)" trực tiếp ở đây
    db.query(
      "UPDATE BanAn SET TrangThai = 'Trong' WHERE MaBan = ?",
      [MaBan],
      (err) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Lỗi cập nhật bàn!");
        }
        return redirectByUserRole();
      }
    );
    return; // Dừng hàm post tại đây sau khi đã gọi db.query
  }

  // ===================================================
  // Trường hợp 2: Có thanh toán (Lớn hơn 0 đồng)
  // ===================================================
  const sqlHD = `
    INSERT INTO ThanhToan
    (MaHD, NgayGio, TongTien, PhuongThuc, TrangThaiThanhToan, TaiKhoanID, BanAnID)
    VALUES (?, NOW(), ?, ?, 'Da thanh toan', ?, ?)
  `;

  db.query(
    sqlHD,
    [MaHD, tongTienFloat, PhuongThuc, TaiKhoanID, MaBan],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(400).send("Phương thức thanh toán không hợp lệ!");
      }

      const sqlUpdate = `
        UPDATE Oder
        SET MaHD = ?
        WHERE MaBan = ?
          AND MaHD IS NULL
          AND TrangThai = 'Da hoan thanh'
      `;

      db.query(sqlUpdate, [MaHD, MaBan], (err2) => {
        if (err2) {
          console.error(err2);
          return res.status(500).send("Lỗi cập nhật Order!");
        }

        db.query(
          "UPDATE BanAn SET TrangThai = 'Trong' WHERE MaBan = ?",
          [MaBan],
          (err3) => {
            if (err3) {
              console.error(err3);
              return res.status(500).send("Lỗi cập nhật bàn!");
            }
            return redirectByUserRole();
          }
        );
      });
    }
  );
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