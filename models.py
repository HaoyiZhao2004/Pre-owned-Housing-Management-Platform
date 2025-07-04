from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from marshmallow import fields
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

# 用户表
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    role = db.Column(db.Enum('admin', 'manager', 'user'), default='user')
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'full_name': self.full_name,
            'phone': self.phone,
            'role': self.role,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }

# 房屋户型表
class HouseType(db.Model):
    __tablename__ = 'house_types'
    
    id = db.Column(db.Integer, primary_key=True)
    type_name = db.Column(db.String(50), nullable=False, unique=True)  # 如：一室一厅、两室一厅等
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 关联房屋
    houses = db.relationship('House', backref='house_type', lazy=True)

# 房东信息表
class Landlord(db.Model):
    __tablename__ = 'landlords'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(100))
    id_card = db.Column(db.String(20), unique=True)
    address = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 关联房屋
    houses = db.relationship('House', backref='landlord', lazy=True)

# 房屋信息表
class House(db.Model):
    __tablename__ = 'houses'
    
    id = db.Column(db.Integer, primary_key=True)
    house_number = db.Column(db.String(50), nullable=False, unique=True)  # 房号
    address = db.Column(db.String(200), nullable=False)
    area = db.Column(db.Float)  # 面积
    rent_price = db.Column(db.Numeric(10, 2), nullable=False)  # 租金
    deposit = db.Column(db.Numeric(10, 2))  # 押金
    status = db.Column(db.Enum('available', 'rented'), default='available')  # 状态
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 外键
    type_id = db.Column(db.Integer, db.ForeignKey('house_types.id'), nullable=False)
    landlord_id = db.Column(db.Integer, db.ForeignKey('landlords.id'), nullable=False)
    
    # 关联租房记录
    rentals = db.relationship('Rental', backref='house', lazy=True)

# 租房客户信息表
class Tenant(db.Model):
    __tablename__ = 'tenants'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(100))
    id_card = db.Column(db.String(20), unique=True)
    address = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 关联租房记录
    rentals = db.relationship('Rental', backref='tenant', lazy=True)

# 租房记录表
class Rental(db.Model):
    __tablename__ = 'rentals'
    
    id = db.Column(db.Integer, primary_key=True)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    monthly_rent = db.Column(db.Numeric(10, 2), nullable=False)
    deposit_paid = db.Column(db.Numeric(10, 2), nullable=False)
    status = db.Column(db.Enum('active', 'expired', 'terminated'), default='active')
    contract_number = db.Column(db.String(100), unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    returned_at = db.Column(db.DateTime)  # 归还时间
    
    # 外键
    house_id = db.Column(db.Integer, db.ForeignKey('houses.id'), nullable=False)
    tenant_id = db.Column(db.Integer, db.ForeignKey('tenants.id'), nullable=False)
    
    # 关联收费记录
    payments = db.relationship('Payment', backref='rental', lazy=True)

# 收费记录表
class Payment(db.Model):
    __tablename__ = 'payments'
    
    id = db.Column(db.Integer, primary_key=True)
    payment_date = db.Column(db.Date, nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    payment_type = db.Column(db.Enum('rent', 'deposit', 'utilities', 'penalty'), nullable=False)
    payment_method = db.Column(db.Enum('cash', 'transfer', 'alipay', 'wechat'), default='cash')
    payment_status = db.Column(db.Enum('pending', 'paid', 'returned'), default='pending')  # 缴费状态
    description = db.Column(db.Text)
    contract_number = db.Column(db.String(100))  # 合同号
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    paid_at = db.Column(db.DateTime)  # 实际缴费时间
    
    # 外键
    rental_id = db.Column(db.Integer, db.ForeignKey('rentals.id'), nullable=False)

# Marshmallow序列化schemas
class UserSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = User
        load_instance = True
        exclude = ['password_hash']  # 不序列化密码哈希

class HouseTypeSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = HouseType
        load_instance = True

class LandlordSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Landlord
        load_instance = True

class HouseSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = House
        load_instance = True
    
    house_type = fields.Nested(HouseTypeSchema, dump_only=True)
    landlord = fields.Nested(LandlordSchema, dump_only=True)

class TenantSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Tenant
        load_instance = True

class RentalSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Rental
        load_instance = True
    
    house = fields.Nested(HouseSchema, dump_only=True)
    tenant = fields.Nested(TenantSchema, dump_only=True)

class PaymentSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Payment
        load_instance = True
    
    rental = fields.Nested(RentalSchema, dump_only=True) 