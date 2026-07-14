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
// Xử lý thêm món ăn
router.post("/them", (req, res) => {
  const { MaMon, TenMon, MaLoai, GiaBan, TrangThai } = req.body;

  const NguyenLieu = req.body.NguyenLieu;
  const DinhLuong = req.body.DinhLuong;

  // ================= VALIDATE =================

  // 1. Mã món không được để trống
  if (!MaMon || MaMon.trim() === "") {
    return res.status(400).send("Mã món không được để trống");
  }

  // 2. Tên món không được để trống
  if (!TenMon || TenMon.trim() === "") {
    return res.status(400).send("Tên món không được để trống");
  }

  // 3. Giá bán phải lớn hơn 0
  if (isNaN(GiaBan) || Number(GiaBan) <= 0) {
    return res.status(400).send("Giá bán phải lớn hơn 0");
  }

  // 4. Kiểm tra mã món đã tồn tại
  db.query(
    "SELECT * FROM MonAn WHERE MaMon = ?",
    [MaMon],
    (err, result) => {
      if (err) return res.status(500).send(err);

      if (result.length > 0) {
        return res.status(400).send("Trùng mã món");
      }

      // 5. Kiểm tra loại món tồn tại
      db.query(
        "SELECT * FROM LoaiMon WHERE MaLoai = ?",
        [MaLoai],
        (err2, loai) => {
          if (err2) return res.status(500).send(err2);

          if (loai.length === 0) {
            return res.status(400).send("Loại món không tồn tại");
          }

          // ================= THÊM MÓN =================

          const sqlMon = `
            INSERT INTO MonAn
            (MaMon, TenMon, MaLoai, GiaBan, TrangThai)
            VALUES (?, ?, ?, ?, ?)
          `;

          db.query(
            sqlMon,
            [MaMon, TenMon, MaLoai, GiaBan, TrangThai],
            (err3) => {
              if (err3) return res.status(500).send(err3);

              // Không có nguyên liệu
              if (!NguyenLieu || NguyenLieu.length === 0) {
                return res.redirect("/menu/dsmonan");
              }

              const data = [];

              for (let i = 0; i < NguyenLieu.length; i++) {
                if (!NguyenLieu[i]) continue;

                data.push([
                  MaMon,
                  NguyenLieu[i],
                  DinhLuong[i] || ""
                ]);
              }

              if (data.length === 0) {
                return res.redirect("/menu/dsmonan");
              }

              db.query(
                "INSERT INTO ChiTietMonAn (MaMon, NguyenLieu, DinhLuong) VALUES ?",
                [data],
                (err4) => {
                  if (err4) return res.status(500).send(err4);

                  res.redirect("/menu/dsmonan");
                }
              );
            }
          );
        }
      );
    }
  );
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
// Xử lý sửa món ăn
router.post("/sua/:MaMon", (req, res) => {
  const { MaMon } = req.params;
  const { TenMon, MaLoai, GiaBan, TrangThai } = req.body;

  // 1. Tên món không được để trống
  if (!TenMon || TenMon.trim() === "") {
    return res.status(400).send("Tên món không được để trống");
  }

  // 2. Giá bán phải lớn hơn 0
  if (isNaN(GiaBan) || Number(GiaBan) <= 0) {
    return res.status(400).send("Giá bán phải lớn hơn 0");
  }

  // 3. Kiểm tra món ăn có tồn tại
  db.query(
    "SELECT * FROM MonAn WHERE MaMon = ?",
    [MaMon],
    (err, mon) => {
      if (err) return res.status(500).send(err);

      if (mon.length === 0) {
        return res.status(404).send("Mã món không tồn tại");
      }

      // 4. Kiểm tra loại món tồn tại
      db.query(
        "SELECT * FROM LoaiMon WHERE MaLoai = ?",
        [MaLoai],
        (err2, loai) => {
          if (err2) return res.status(500).send(err2);

          if (loai.length === 0) {
            return res.status(400).send("Loại món không tồn tại");
          }

          // 5. Cập nhật
          const sql = `
            UPDATE MonAn
            SET TenMon=?, MaLoai=?, GiaBan=?, TrangThai=?
            WHERE MaMon=?
          `;

          db.query(
            sql,
            [TenMon, MaLoai, GiaBan, TrangThai, MaMon],
            (err3) => {
              if (err3) return res.status(500).send(err3);

              res.redirect("/menu/dsmonan");
            }
          );
        }
      );
    }
  );
});

// Xóa món ăn
// Xóa món ăn
router.get("/xoa/:MaMon", (req, res) => {
  const { MaMon } = req.params;

  // 1. Kiểm tra món có tồn tại
  db.query(
    "SELECT * FROM MonAn WHERE MaMon = ?",
    [MaMon],
    (err, mon) => {
      if (err) return res.status(500).send(err);

      if (mon.length === 0) {
        return res.status(404).send("Mã món không tồn tại");
      }

      // 2. Kiểm tra món có đang được sử dụng trong Order hay không
      db.query(
        "SELECT * FROM Oder_Monan WHERE MaMon = ?",
        [MaMon],
        (err2, order) => {
          if (err2) return res.status(500).send(err2);

          if (order.length > 0) {
            return res.status(400).send("Không thể xóa món đang sử dụng");
          }

          // 3. Xóa chi tiết món trước
          db.query(
            "DELETE FROM ChiTietMonAn WHERE MaMon = ?",
            [MaMon],
            (err3) => {
              if (err3) return res.status(500).send(err3);

              // 4. Xóa món ăn
              db.query(
                "DELETE FROM MonAn WHERE MaMon = ?",
                [MaMon],
                (err4) => {
                  if (err4) return res.status(500).send(err4);

                  res.redirect("/menu/dsmonan");
                }
              );
            }
          );
        }
      );
    }
  );
});

module.exports = router;
