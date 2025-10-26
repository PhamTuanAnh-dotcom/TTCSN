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
select * from VaiTro
select * from LoaiMon
INSERT INTO LoaiMon (MaLoai, TenLoai) VALUES
('M01', 'Nướng'),
('M02', 'Lẩu'),
('M03', 'Khai Vị'),
('M04','Tráng Miệng');
drop table ThanhToan;





