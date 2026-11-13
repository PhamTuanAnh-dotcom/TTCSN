
USE TTCSN;


INSERT INTO MonAn
(MaMon, TenMon, MaLoai, GiaBan, HinhAnh, TrangThai)
VALUES
('MA001', 'Ba chi bo nuong', 'M01', 159000, 'bachibo.jpg', 'Con'),
('MA002', 'Suon heo nuong', 'M01', 179000, 'suonheo.jpg', 'Con'),
('MA003', 'Dui ga nuong', 'M01', 99000, 'duiga.jpg', 'Con'),
('MA004', 'Tom nuong muoi ot', 'M01', 189000, 'tomnuong.jpg', 'Con'),
('MA005', 'Bo nuong sa te', 'M01', 169000, 'bonuong.jpg', 'Con'),

('MA006', 'Lau Thai', 'M02', 299000, 'lauthai.jpg', 'Con'),
('MA007', 'Lau nam', 'M02', 259000, 'launam.jpg', 'Con'),
('MA008', 'Lau hai san', 'M02', 329000, 'lauhaisan.jpg', 'Con'),
('MA009', 'Lau bo', 'M02', 289000, 'laubo.jpg', 'Con'),

('MA010', 'Khoai tay chien', 'M03', 45000, 'khoaitay.jpg', 'Con'),
('MA011', 'Salad rau cu', 'M03', 59000, 'salad.jpg', 'Con'),
('MA012', 'Nem ran', 'M03', 69000, 'nemran.jpg', 'Con'),
('MA013', 'Kim chi', 'M03', 35000, 'kimchi.jpg', 'Con'),

('MA014', 'Tra sua tran chau', 'M04', 39000, 'trasua.jpg', 'Con'),
('MA015', 'Che khuc bach', 'M04', 49000, 'che.jpg', 'Con');


INSERT INTO ChiTietMonAn
(MaMon, NguyenLieu, DinhLuong)
VALUES
('MA001', 'Ba chi bo', '200g'),
('MA001', 'Sot uop nuong', '30ml'),
('MA001', 'Rau an kem', '100g'),

('MA002', 'Suon heo', '300g'),
('MA002', 'Mat ong', '20ml'),

('MA003', 'Dui ga', '2 cai'),
('MA003', 'Sa', '20g'),

('MA004', 'Tom tuoi', '300g'),
('MA004', 'Muoi ot', '20g'),

('MA005', 'Thit bo', '200g'),
('MA005', 'Sa te', '30g'),

('MA006', 'Nuoc cot lau Thai', '500ml'),
('MA006', 'Tom', '100g'),
('MA006', 'Muc', '100g'),

('MA007', 'Nam cac loai', '300g'),
('MA007', 'Nuoc dung', '500ml'),

('MA008', 'Tom', '150g'),
('MA008', 'Muc', '150g'),
('MA008', 'Ngao', '200g'),

('MA009', 'Thit bo', '250g'),
('MA009', 'Nuoc dung', '500ml'),

('MA010', 'Khoai tay', '200g'),
('MA011', 'Rau xanh', '150g'),
('MA012', 'Thit heo', '100g'),
('MA013', 'Cai thao', '200g'),
('MA014', 'Tra sua', '500ml'),
('MA015', 'Sua tuoi', '200ml');


UPDATE BanAn
SET TrangThai = 'Dang phuc vu'
WHERE MaBan IN ('101', '201');

UPDATE BanAn
SET TrangThai = 'Dat truoc'
WHERE MaBan = '301';


INSERT INTO ThanhToan
(MaHD, NgayGio, TongTien, PhuongThuc, TrangThaiThanhToan, TaiKhoanID, BanAnID)
VALUES
('HD001', '2026-11-13 10:30:00', 457000, 'Tien mat', 'Da thanh toan', 'TK002', '101'),
('HD002', '2026-11-13 11:00:00', 488000, 'Vi dien tu', 'Chua thanh toan', 'TK003', '201');


INSERT INTO Oder
(MaOder, ThoiGian, TaiKhoanID, MaHD, MaBan, TrangThai)
VALUES
('OD001', '2026-11-13 10:00:00', 'TK002', 'HD001', '101', 'Da hoan thanh'),
('OD002', '2026-11-13 10:45:00', 'TK003', 'HD002', '201', 'Chua hoan thanh'),
('OD003', '2026-11-13 11:30:00', 'TK004', NULL, '301', 'Chua hoan thanh');



INSERT INTO Oder_Monan
(MaOder, MaMon, SoLuong, GiChu, TrangThai)
VALUES
-- Order 001
('OD001', 'MA001', 2, 'It cay', 'Binh thuong'),
('OD001', 'MA010', 1, 'Khong muoi', 'Binh thuong'),

-- Order 002
('OD002', 'MA006', 1, 'Khong cay', 'Binh thuong'),
('OD002', 'MA004', 1, 'Nuong vua', 'Binh thuong'),

-- Order 003
('OD003', 'MA002', 1, 'Khong hanh', 'Binh thuong'),
('OD003', 'MA014', 2, 'It duong', 'Binh thuong');

SELECT * FROM TaiKhoan;
SELECT * FROM PhanCong;
SELECT * FROM BanAn;
SELECT * FROM MonAn;
SELECT * FROM ChiTietMonAn;
SELECT * FROM ThanhToan;
SELECT * FROM Oder;
SELECT * FROM Oder_Monan;