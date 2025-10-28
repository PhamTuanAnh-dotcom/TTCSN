CREATE DATABASE TTCSN CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE TTCSN;

CREATE TABLE VaiTro (
    IDVaiTro VARCHAR(50) PRIMARY KEY,
    TenVaiTro VARCHAR(50) NOT NULL
);

CREATE TABLE TaiKhoan (
    ID VARCHAR(50) PRIMARY KEY,
    HoTen VARCHAR(100) NOT NULL,
    SDT VARCHAR(15),
    Gmail VARCHAR(100),
    CCCD VARCHAR(20),
    TaiKhoan VARCHAR(50) UNIQUE NOT NULL,
    MatKhau VARCHAR(255) NOT NULL,
    IDVaiTro VARCHAR(50),
    FOREIGN KEY (IDVaiTro) REFERENCES VaiTro(IDVaiTro)
        ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE Tang (
    IDTang VARCHAR(50) PRIMARY KEY,
    SoTang INT NOT NULL
);

CREATE TABLE PhanCong (
    IDPhanCong INT AUTO_INCREMENT PRIMARY KEY,
    TaiKhoanID VARCHAR(50),
    TangID VARCHAR(50),
    ThoiGianBatDau DATETIME,
    ThoiGianKetThuc DATETIME,
    FOREIGN KEY (TaiKhoanID) REFERENCES TaiKhoan(ID)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (TangID) REFERENCES Tang(IDTang)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE BanAn (
    MaBan VARCHAR(50) PRIMARY KEY,
    ViTri VARCHAR(100),
    TrangThai ENUM('Trong','Dang phuc vu','Dat truoc') DEFAULT 'Trong',
    TangID VARCHAR(50),
    FOREIGN KEY (TangID) REFERENCES Tang(IDTang)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE LoaiMon (
    MaLoai VARCHAR(50) PRIMARY KEY,
    TenLoai VARCHAR(50) NOT NULL
);

CREATE TABLE MonAn (
    MaMon VARCHAR(50) PRIMARY KEY,
    TenMon VARCHAR(100) NOT NULL,
    MaLoai VARCHAR(50),
    GiaBan DECIMAL(12,2) NOT NULL,
    TrangThai ENUM('Con','Het') DEFAULT 'Con',
    FOREIGN KEY (MaLoai) REFERENCES LoaiMon(MaLoai)
        ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE ThanhToan (
    MaHD VARCHAR(50) PRIMARY KEY,
    NgayGio DATETIME NOT NULL,
    TongTien DECIMAL(12,2) NOT NULL,
    PhuongThuc ENUM('Tien mat','The','Vi dien tu') NOT NULL,
    TrangThaiThanhToan ENUM('Da thanh toan','Chua thanh toan') DEFAULT 'Chua thanh toan',
    TaiKhoanID VARCHAR(50),
    BanAnID VARCHAR(50),
    FOREIGN KEY (TaiKhoanID) REFERENCES TaiKhoan(ID)
        ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (BanAnID) REFERENCES BanAn(MaBan)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Bảng Order (đặt món)
CREATE TABLE Oder (
    MaOder VARCHAR(50) PRIMARY KEY,
    ThoiGian DATETIME NOT NULL,
    TaiKhoanID VARCHAR(50),       -- Nhân viên phục vụ
    MaHD VARCHAR(50),             -- Hóa đơn liên kết
    MaBan VARCHAR(50),            -- Vị trí bàn đặt
    FOREIGN KEY (TaiKhoanID) REFERENCES TaiKhoan(ID)
        ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (MaHD) REFERENCES ThanhToan(MaHD)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (MaBan) REFERENCES BanAn(MaBan)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Bảng chi tiết Order - Món ăn
CREATE TABLE Oder_Monan (
    MaOder VARCHAR(50),
    MaMon VARCHAR(50),
    SoLuong INT NOT NULL,
    PRIMARY KEY (MaOder, MaMon),
    FOREIGN KEY (MaOder) REFERENCES Oder(MaOder)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (MaMon) REFERENCES MonAn(MaMon)
        ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO VaiTro (IDVaiTro, TenVaiTro) VALUES
('QL', 'Quản lý'),
('NV', 'Nhân viên phục vụ'),
('BEP', 'Nhân viên bếp');
INSERT INTO LoaiMon (MaLoai, TenLoai) VALUES
('M01', 'Nướng'),
('M02', 'Lẩu'),
('M03', 'Khai Vị'),
('M04','Tráng Miệng');
select * from TaiKhoan;
ALTER TABLE MonAn ADD COLUMN HinhAnh VARCHAR(255);
INSERT INTO BanAn (MaBan, ViTri, TrangThai) VALUES
('101', 'Bàn 101', 'Trong'),
('102', 'Bàn 102', 'Trong'),
('103', 'Bàn 103', 'Trong'),
('104', 'Bàn 104', 'Trong'),
('105', 'Bàn 105', 'Trong'),
('106', 'Bàn 106', 'Trong'),
('107', 'Bàn 107', 'Trong'),
('108', 'Bàn 108', 'Trong'),
('109', 'Bàn 109', 'Trong'),

('201', 'Bàn 201', 'Trong'),
('202', 'Bàn 202', 'Trong'),
('203', 'Bàn 203', 'Trong'),
('204', 'Bàn 204', 'Trong'),
('205', 'Bàn 205', 'Trong'),
('206', 'Bàn 206', 'Trong'),
('207', 'Bàn 207', 'Trong'),
('208', 'Bàn 208', 'Trong'),
('209', 'Bàn 209', 'Trong'),

('301', 'Bàn 301', 'Trong'),
('302', 'Bàn 302', 'Trong'),
('303', 'Bàn 303', 'Trong'),
('304', 'Bàn 304', 'Trong'),
('305', 'Bàn 305', 'Trong'),
('306', 'Bàn 306', 'Trong'),
('307', 'Bàn 307', 'Trong'),
('308', 'Bàn 308', 'Trong'),
('309', 'Bàn 309', 'Trong');
 insert into Tang(IDTang, SoTang) values
 ('1', ' 1'),
 ('2', ' 2'),
('3', ' 3');







