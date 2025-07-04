-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS house_rental_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE house_rental_db;

-- 用户表
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(80) NOT NULL UNIQUE COMMENT '用户名',
    email VARCHAR(120) NOT NULL UNIQUE COMMENT '邮箱',
    password_hash VARCHAR(128) NOT NULL COMMENT '密码哈希',
    full_name VARCHAR(100) COMMENT '姓名',
    phone VARCHAR(20) COMMENT '电话',
    role ENUM('admin', 'manager', 'user') DEFAULT 'user' COMMENT '角色',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否激活',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    last_login TIMESTAMP NULL COMMENT '最后登录时间'
);

-- 房屋户型表
CREATE TABLE house_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL UNIQUE COMMENT '户型名称',
    description TEXT COMMENT '户型描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
);

-- 房东信息表
CREATE TABLE landlords (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '房东姓名',
    phone VARCHAR(20) NOT NULL COMMENT '联系电话',
    email VARCHAR(100) COMMENT '邮箱',
    id_card VARCHAR(20) UNIQUE COMMENT '身份证号',
    address VARCHAR(200) COMMENT '地址',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
);

-- 房屋信息表
CREATE TABLE houses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    house_number VARCHAR(50) NOT NULL UNIQUE COMMENT '房号',
    address VARCHAR(200) NOT NULL COMMENT '房屋地址',
    area DECIMAL(8,2) COMMENT '面积(平方米)',
    rent_price DECIMAL(10,2) NOT NULL COMMENT '租金',
    deposit DECIMAL(10,2) COMMENT '押金',
    status ENUM('available', 'rented', 'maintenance') DEFAULT 'available' COMMENT '状态',
    description TEXT COMMENT '房屋描述',
    type_id INT NOT NULL COMMENT '户型ID',
    landlord_id INT NOT NULL COMMENT '房东ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (type_id) REFERENCES house_types(id) ON DELETE CASCADE,
    FOREIGN KEY (landlord_id) REFERENCES landlords(id) ON DELETE CASCADE
);

-- 租房客户信息表
CREATE TABLE tenants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '租客姓名',
    phone VARCHAR(20) NOT NULL COMMENT '联系电话',
    email VARCHAR(100) COMMENT '邮箱',
    id_card VARCHAR(20) UNIQUE COMMENT '身份证号',
    address VARCHAR(200) COMMENT '地址',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
);

-- 租房记录表
CREATE TABLE rentals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    start_date DATE NOT NULL COMMENT '开始日期',
    end_date DATE NOT NULL COMMENT '结束日期',
    monthly_rent DECIMAL(10,2) NOT NULL COMMENT '月租金',
    deposit_paid DECIMAL(10,2) NOT NULL COMMENT '已付押金',
    status ENUM('active', 'expired', 'terminated') DEFAULT 'active' COMMENT '状态',
    contract_number VARCHAR(100) UNIQUE COMMENT '合同编号',
    house_id INT NOT NULL COMMENT '房屋ID',
    tenant_id INT NOT NULL COMMENT '租客ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    returned_at TIMESTAMP NULL COMMENT '归还时间',
    FOREIGN KEY (house_id) REFERENCES houses(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- 收费记录表
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payment_date DATE NOT NULL COMMENT '缴费日期',
    amount DECIMAL(10,2) NOT NULL COMMENT '金额',
    payment_type ENUM('rent', 'deposit', 'utilities', 'penalty') NOT NULL COMMENT '缴费类型',
    payment_method ENUM('cash', 'transfer', 'alipay', 'wechat') DEFAULT 'cash' COMMENT '支付方式',
    payment_status ENUM('pending', 'paid', 'returned') DEFAULT 'pending' COMMENT '缴费状态',
    description TEXT COMMENT '备注',
    contract_number VARCHAR(100) COMMENT '合同编号',
    rental_id INT NOT NULL COMMENT '租房记录ID',
    paid_at TIMESTAMP NULL COMMENT '缴费时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (rental_id) REFERENCES rentals(id) ON DELETE CASCADE
);

-- 创建触发器：当房屋租出时自动修改房屋状态
DELIMITER //
CREATE TRIGGER update_house_status_on_rental
AFTER INSERT ON rentals
FOR EACH ROW
BEGIN
    UPDATE houses 
    SET status = 'rented' 
    WHERE id = NEW.house_id;
END //
DELIMITER ;

-- 创建触发器：当租房记录状态变为terminated时，将房屋状态改为available
DELIMITER //
CREATE TRIGGER update_house_status_on_return
AFTER UPDATE ON rentals
FOR EACH ROW
BEGIN
    IF NEW.status = 'terminated' AND OLD.status != 'terminated' THEN
        UPDATE houses 
        SET status = 'available' 
        WHERE id = NEW.house_id;
    END IF;
END //
DELIMITER ;

-- 创建索引优化查询性能
CREATE INDEX idx_houses_status ON houses(status);
CREATE INDEX idx_houses_landlord ON houses(landlord_id);
CREATE INDEX idx_houses_type ON houses(type_id);
CREATE INDEX idx_rentals_house ON rentals(house_id);
CREATE INDEX idx_rentals_tenant ON rentals(tenant_id);
CREATE INDEX idx_rentals_status ON rentals(status);
CREATE INDEX idx_payments_rental ON payments(rental_id);
CREATE INDEX idx_payments_date ON payments(payment_date); 