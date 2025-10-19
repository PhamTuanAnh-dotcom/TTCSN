const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  console.log("➡️ Vào route /staff");
  // if (!req.session.user) return res.redirect("/");
  
  db.query("SELECT * FROM TaiKhoan", (err, results) => {
    if (err) throw err;
    console.log("✅ Có", results.length, "nhân viên");
    res.render("quanli_nhanvien", { nhanviens: results });
  });
});

module.exports = router;
