CREATE DATABASE TTCSN CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE TTCSN;

-- BẢNG VAI TRÒ
CREATE TABLE VaiTro (
    IDVaiTro VARCHAR(50) PRIMARY KEY,
    TenVaiTro VARCHAR(50) NOT NULL
);
-- BẢNG TÀI KHOẢN
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

-- BẢNG TẦNG
CREATE TABLE Tang (
    IDTang VARCHAR(50) PRIMARY KEY,
    SoTang INT NOT NULL
);
-- PHÂN CÔNG NHÂN VIÊN
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
-- BÀN ĂN
CREATE TABLE BanAn (
    MaBan VARCHAR(50) PRIMARY KEY,
    ViTri VARCHAR(100),
    TrangThai ENUM('Trong','Dang phuc vu','Dat truoc') DEFAULT 'Trong',
    TangID VARCHAR(50),
    FOREIGN KEY (TangID) REFERENCES Tang(IDTang)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- LOẠI MÓN
CREATE TABLE LoaiMon (
    MaLoai VARCHAR(50) PRIMARY KEY,
    TenLoai VARCHAR(50) NOT NULL
);

-- MÓN ĂN
CREATE TABLE MonAn (
    MaMon VARCHAR(50) PRIMARY KEY,
    TenMon VARCHAR(100) NOT NULL,
    MaLoai VARCHAR(50),
    GiaBan DECIMAL(12,2) NOT NULL,
    HinhAnh VARCHAR(255),
    TrangThai ENUM('Con','Het') DEFAULT 'Con',
    FOREIGN KEY (MaLoai) REFERENCES LoaiMon(MaLoai)
        ON DELETE SET NULL ON UPDATE CASCADE
);
-- CHI TIẾT MÓN ĂN
CREATE TABLE ChiTietMonAn (
    MaCT INT AUTO_INCREMENT PRIMARY KEY,
    MaMon VARCHAR(50) NOT NULL,
    NguyenLieu VARCHAR(255) NOT NULL,
    DinhLuong VARCHAR(100) NOT NULL,
    FOREIGN KEY (MaMon) REFERENCES MonAn(MaMon)
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);
-- HÓA ĐƠN THANH TOÁN
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
-- ORDER (ĐẶT MÓN)
CREATE TABLE Oder (
    MaOder VARCHAR(50) PRIMARY KEY,
    ThoiGian DATETIME NOT NULL,
    TaiKhoanID VARCHAR(50),
    MaHD VARCHAR(50),
    MaBan VARCHAR(50),
    TrangThai ENUM('Chua hoan thanh','Da hoan thanh') DEFAULT 'Chua hoan thanh',
    FOREIGN KEY (TaiKhoanID) REFERENCES TaiKhoan(ID)
        ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (MaHD) REFERENCES ThanhToan(MaHD)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (MaBan) REFERENCES BanAn(MaBan)
        ON DELETE CASCADE ON UPDATE CASCADE
);
-- CHI TIẾT ORDER - MÓN ĂN
CREATE TABLE Oder_Monan (
    MaOder VARCHAR(50),
    MaMon VARCHAR(50),
    SoLuong INT NOT NULL,
    GiChu VARCHAR(255),
    PRIMARY KEY (MaOder, MaMon),
    FOREIGN KEY (MaOder) REFERENCES Oder(MaOder)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (MaMon) REFERENCES MonAn(MaMon)
        ON DELETE CASCADE ON UPDATE CASCADE
);
-- DỮ LIỆU MẪU
INSERT INTO VaiTro (IDVaiTro, TenVaiTro) VALUES
('QL', 'Quản lý'),
('NV', 'Nhân viên phục vụ'),
('BEP', 'Nhân viên bếp');

INSERT INTO LoaiMon (MaLoai, TenLoai) VALUES
('M01', 'Nướng'),
('M02', 'Lẩu'),
('M03', 'Khai Vị'),
('M04', 'Tráng Miệng');

INSERT INTO Tang(IDTang, SoTang) VALUES
('1', 1),
('2', 2),
('3', 3);

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

ALTER TABLE Oder 
MODIFY TrangThai 
ENUM('Chua hoan thanh','Da hoan thanh','Da huy')
DEFAULT 'Chua hoan thanh';

ALTER TABLE Oder_Monan
ADD TrangThai ENUM('Binh thuong','Da huy') DEFAULT 'Binh thuong';


