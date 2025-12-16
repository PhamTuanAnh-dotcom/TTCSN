const express = require("express");
const router = express.Router();
const db = require("../db");
// Thêm thư viện bcrypt
const bcrypt = require("bcrypt"); 
const saltRounds = 10;

// Trang quản lý chính
router.get("/", (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }

    const userId = req.session.user.ID;
    // Lấy thông báo từ query params
    const changePassMessage = req.query.changePassMessage;
    const changePassStatus = req.query.changePassStatus;
    
    // Lấy thông tin Quản lý
    const sqlManager = `
        SELECT ID, HoTen, SDT, Gmail, CCCD, TaiKhoan
        FROM TaiKhoan
        WHERE ID = ? AND IDVaiTro = 'QL'
    `;
    // Lấy thông tin TẤT CẢ bàn ăn
    const sqlBanAn = `SELECT MaBan, TrangThai FROM BanAn ORDER BY MaBan ASC`;

    db.query(sqlManager, [userId], (err, managerResults) => {
        if (err) {
            console.error("Lỗi truy vấn Quản lý:", err);
            return res.status(500).send("Lỗi máy chủ!");
        }

        if (managerResults.length === 0) {
            return res.redirect("/login");
        }

        const manager = managerResults[0];

        // Lấy thông tin bàn ăn
        db.query(sqlBanAn, (err, banAnResults) => {
            if (err) {
                console.error("Lỗi truy vấn Bàn Ăn:", err);
                return res.status(500).send("Lỗi máy chủ khi lấy bàn!");
            }

            // Tạo Map để dễ dàng tra cứu trạng thái bàn theo MaBan
            const banAnMap = {};
            banAnResults.forEach(ban => {
                banAnMap[ban.MaBan] = ban.TrangThai;
            });
            res.render("home_ql", { 
                manager, 
                banAnMap,
                changePassMessage, 
                changePassStatus 
            });
        });
    });
});

// Cập nhật thông tin quản lý
router.post("/update", (req, res) => {
    if (!req.session.user) return res.redirect("/");

    const userId = req.session.user.ID;
    const { HoTen, SDT, Gmail, CCCD } = req.body;

    const sql = `
        UPDATE TaiKhoan 
        SET HoTen = ?, SDT = ?, Gmail = ?, CCCD = ?
        WHERE ID = ? AND IDVaiTro = 'QL'
    `;
    db.query(sql, [HoTen, SDT, Gmail, CCCD, userId], (err) => {
        if (err) throw err;
        res.redirect("/home_ql");
    });
});

// Route Đổi mật khẩu
router.post("/change-password", async (req, res) => {
    if (!req.session.user) return res.redirect("/");

    const userId = req.session.user.ID;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // 1. Kiểm tra mật khẩu mới và xác nhận mật khẩu
    if (newPassword !== confirmPassword) {
        return res.redirect("/home_ql?changePassMessage=Mật khẩu mới và xác nhận không khớp.&changePassStatus=danger");
    }

    // 2. Lấy mật khẩu băm cũ từ DB
    const sqlGetHash = `SELECT MatKhau FROM TaiKhoan WHERE ID = ? AND IDVaiTro = 'QL'`;
    db.query(sqlGetHash, [userId], async (err, result) => {
        if (err) {
            console.error("Lỗi truy vấn mật khẩu:", err);
            return res.redirect("/home_ql?changePassMessage=Lỗi server khi truy vấn mật khẩu.&changePassStatus=danger");
        }

        if (result.length === 0) {
            return res.redirect("/home_ql"); // Người dùng không tồn tại hoặc không phải QL
        }

        const currentHash = result[0].MatKhau;

        try {
            // 3. So sánh mật khẩu cũ nhập vào với hash trong DB
            const isMatch = await bcrypt.compare(oldPassword, currentHash);
            
            if (!isMatch) {
                return res.redirect("/home_ql?changePassMessage=Mật khẩu cũ không chính xác.&changePassStatus=danger");
            }
            
            // 4. Hash mật khẩu mới
            const newHash = await bcrypt.hash(newPassword, saltRounds);

            // 5. Cập nhật mật khẩu mới vào DB
            const sqlUpdatePass = `UPDATE TaiKhoan SET MatKhau = ? WHERE ID = ?`;
            db.query(sqlUpdatePass, [newHash, userId], (err2) => {
                if (err2) {
                    console.error("Lỗi cập nhật mật khẩu:", err2);
                    return res.redirect("/home_ql?changePassMessage=Lỗi khi lưu mật khẩu mới vào cơ sở dữ liệu.&changePassStatus=danger");
                }
                
                // Thành công
                res.redirect("/home_ql?changePassMessage=Đổi mật khẩu thành công!&changePassStatus=success");
            });

        } catch (hashError) {
            console.error("Lỗi BCRYPT:", hashError);
            res.redirect("/home_ql?changePassMessage=Đã xảy ra lỗi hệ thống.&changePassStatus=danger");
        }
    });
});

module.exports = router;