const express = require('express');
const router = express.Router();
const db = require('../db'); 

router.get('/thongke', (req, res) => {
    res.render('thongke');  
});

function monthRangeFromYYYYMM(ym) {
  const [y, m] = ym.split('-').map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0)); 
  const nextMonth = new Date(Date.UTC(y, m - 1 + 1, 1, 0, 0, 0));
  
  const fmt = d => d.toISOString().slice(0, 19).replace('T', ' ');
  return { startStr: fmt(start), endStr: fmt(nextMonth), y, m };
}

router.get('/api/thongke', async (req, res) => {
  try {
    const month = req.query.month; 
    if (!month) return res.status(400).json({ error: 'Thiếu param month, dạng YYYY-MM' });

    const { startStr, endStr, y, m } = monthRangeFromYYYYMM(month);

    // Sử dụng promise API của mysql2
    const conn = db.promise();

    // 1) Tổng doanh thu (các hóa đơn đã thanh toán trong tháng)
    const [rTotal] = await conn.query(
      `SELECT COALESCE(SUM(TongTien),0) AS total
       FROM ThanhToan
       WHERE TrangThaiThanhToan = 'Da thanh toan'
         AND NgayGio >= ? AND NgayGio < ?`,
      [startStr, endStr]
    );
    const tongDoanhThu = Number(rTotal[0].total || 0);

    // 2) Doanh thu theo ngày trong tháng (label: 'YYYY-MM-DD')
    const [rByDay] = await conn.query(
      `SELECT DATE(NgayGio) AS day, SUM(TongTien) AS revenue
       FROM ThanhToan
       WHERE TrangThaiThanhToan = 'Da thanh toan'
         AND NgayGio >= ? AND NgayGio < ?
       GROUP BY day
       ORDER BY day`,
      [startStr, endStr]
    );

    // Build arrays labels/values for every day of month (fill 0 nếu không có)
    const daysInMonth = new Date(y, m, 0).getDate(); // m is month number
    const labels = [];
    const values = [];
    // map rByDay by date string
    const mapByDay = {};
    rByDay.forEach(r => { mapByDay[String(r.day)] = Number(r.revenue); });

    for (let d = 1; d <= daysInMonth; d++) {
      const dd = `${y.toString().padStart(4,'0')}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      labels.push(dd);
      values.push(mapByDay[dd] || 0);
    }

    // 3) Món được order nhiều nhất / ít nhất trong các order đã thanh toán của tháng
    // Tổng SoLuong từ Oder_Monan (join qua Oder -> ThanhToan để chỉ lấy đơn đã thanh toán trong tháng)
    const [rDishes] = await conn.query(
      `SELECT om.MaMon, m.TenMon, SUM(om.SoLuong) AS totalQty
       FROM Oder_Monan om
       JOIN Oder o ON om.MaOder = o.MaOder
       JOIN ThanhToan t ON o.MaHD = t.MaHD
       LEFT JOIN MonAn m ON om.MaMon = m.MaMon
       WHERE t.TrangThaiThanhToan = 'Da thanh toan'
         AND t.NgayGio >= ? AND t.NgayGio < ?
       GROUP BY om.MaMon
       ORDER BY totalQty DESC`,
      [startStr, endStr]
    );

    let monNhieuNhat = null;
    let monItNhat = null;
    if (rDishes.length > 0) {
      monNhieuNhat = { MaMon: rDishes[0].MaMon, TenMon: rDishes[0].TenMon, SoLuong: Number(rDishes[0].totalQty) };
      // for least: find last non-zero. rDishes is ordered desc; last element is smallest.
      const last = rDishes[rDishes.length - 1];
      monItNhat = { MaMon: last.MaMon, TenMon: last.TenMon, SoLuong: Number(last.totalQty) };
    } else {
      monNhieuNhat = { MaMon: null, TenMon: null, SoLuong: 0 };
      monItNhat = { MaMon: null, TenMon: null, SoLuong: 0 };
    }

    // 4) Nhân viên order nhiều nhất (nhân viên phụ vụ tạo order) - tính theo số Order đã thanh toán
    const [rStaff] = await conn.query(
      `SELECT o.TaiKhoanID AS staffID, t2.HoTen AS staffName, COUNT(DISTINCT o.MaOder) AS numOrders
       FROM Oder o
       JOIN ThanhToan tt ON o.MaHD = tt.MaHD
       LEFT JOIN TaiKhoan t2 ON o.TaiKhoanID = t2.ID
       WHERE tt.TrangThaiThanhToan = 'Da thanh toan'
         AND tt.NgayGio >= ? AND tt.NgayGio < ?
       GROUP BY o.TaiKhoanID
       ORDER BY numOrders DESC
       LIMIT 1`,
      [startStr, endStr]
    );

    let nvNhieuNhat = { staffID: null, staffName: null, numOrders: 0 };
    if (rStaff.length > 0) {
      nvNhieuNhat = {
        staffID: rStaff[0].staffID,
        staffName: rStaff[0].staffName,
        numOrders: Number(rStaff[0].numOrders)
      };
    }

    // trả về JSON cho frontend
    return res.json({
      month,
      labels,
      values,
      tongDoanhThu,       // số thô, frontend có thể format VND
      monNhieuNhat,
      monItNhat,
      nvNhieuNhat
    });

  } catch (err) {
    console.error('Lỗi /api/thongke:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;
