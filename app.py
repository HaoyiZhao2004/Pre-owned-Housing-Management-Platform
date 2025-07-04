from flask import Flask, request, jsonify, send_from_directory, session, redirect, url_for
from flask_cors import CORS
from config import Config
from sqlalchemy import text
from models import (
    db, User, HouseType, Landlord, House, Tenant, Rental, Payment,
    UserSchema, HouseTypeSchema, LandlordSchema, HouseSchema, TenantSchema, 
    RentalSchema, PaymentSchema
)
from datetime import datetime, date
import os
import json
from decimal import Decimal
from functools import wraps

app = Flask(__name__)
app.config.from_object(Config)

# 彻底关闭详细日志，只显示错误
import logging
logging.getLogger('sqlalchemy').setLevel(logging.ERROR)
logging.getLogger('sqlalchemy.engine').setLevel(logging.ERROR)
logging.getLogger('sqlalchemy.dialects').setLevel(logging.ERROR)
logging.getLogger('sqlalchemy.pool').setLevel(logging.ERROR)
logging.getLogger('sqlalchemy.orm').setLevel(logging.ERROR)
logging.getLogger('werkzeug').setLevel(logging.ERROR)
logging.getLogger().setLevel(logging.ERROR)  # 设置根日志级别为ERROR

# 禁用SQLAlchemy的info级别日志
logging.getLogger('sqlalchemy.engine.base.Engine').setLevel(logging.ERROR)
logging.getLogger('sqlalchemy.engine.base').setLevel(logging.ERROR)

# 初始化扩展
db.init_app(app)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)  # 允许所有来源的API请求，支持凭证

# 初始化序列化器
user_schema = UserSchema()
users_schema = UserSchema(many=True)
house_type_schema = HouseTypeSchema()
house_types_schema = HouseTypeSchema(many=True)
landlord_schema = LandlordSchema()
landlords_schema = LandlordSchema(many=True)
house_schema = HouseSchema()
houses_schema = HouseSchema(many=True)
tenant_schema = TenantSchema()
tenants_schema = TenantSchema(many=True)
rental_schema = RentalSchema()
rentals_schema = RentalSchema(many=True)
payment_schema = PaymentSchema()
payments_schema = PaymentSchema(many=True)

# 认证装饰器
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': '需要登录才能访问此资源'}), 401
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': '需要登录才能访问此资源'}), 401
        
        user = User.query.get(session['user_id'])
        if not user or user.role != 'admin':
            return jsonify({'error': '需要管理员权限才能访问此资源'}), 403
        return f(*args, **kwargs)
    return decorated_function

# 自定义JSON编码器
def custom_json_serializer(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    raise TypeError(f'Object of type {type(obj)} is not JSON serializable')

# 配置Flask JSON序列化
app.json.default = custom_json_serializer

# 错误处理
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': '资源未找到'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': '服务器内部错误'}), 500

# 前端静态文件服务
@app.route('/')
def index():
    # 检查用户是否已登录
    if 'user_id' not in session:
        return redirect('/login')
    return send_from_directory('static', 'index.html')

@app.route('/login')
def login_page():
    return send_from_directory('static', 'login.html')

@app.route('/register')
def register_page():
    return send_from_directory('static', 'register.html')

@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)

# 用户认证API
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # 验证必填字段
    if not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'error': '用户名、邮箱和密码不能为空'}), 400
    
    # 检查用户名是否已存在
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': '用户名已存在'}), 400
    
    # 检查邮箱是否已存在
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': '邮箱已存在'}), 400
    
    # 创建新用户（新注册用户只能是普通用户角色）
    user = User(
        username=data['username'],
        email=data['email'],
        full_name=data.get('full_name', ''),
        phone=data.get('phone', ''),
        role='user'  # 强制设置为普通用户
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': '注册成功', 'user': user.to_dict()}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data.get('username') or not data.get('password'):
        return jsonify({'error': '用户名和密码不能为空'}), 400
    
    # 查找用户（支持用户名或邮箱登录）
    user = User.query.filter(
        (User.username == data['username']) | (User.email == data['username'])
    ).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': '用户名或密码错误'}), 401
    
    if not user.is_active:
        return jsonify({'error': '账户已被禁用'}), 401
    
    # 设置会话
    session['user_id'] = user.id
    session['username'] = user.username
    session['role'] = user.role
    
    # 更新最后登录时间
    user.last_login = datetime.utcnow()
    db.session.commit()
    
    return jsonify({'message': '登录成功', 'user': user.to_dict()})

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': '已成功退出登录'})

@app.route('/api/current_user', methods=['GET'])
def current_user():
    if 'user_id' not in session:
        return jsonify({'error': '未登录'}), 401
    
    user = User.query.get(session['user_id'])
    if not user:
        session.clear()
        return jsonify({'error': '用户不存在'}), 404
    
    return jsonify({'user': user.to_dict()})

@app.route('/api/users', methods=['GET'])
@admin_required
def get_users():
    users = User.query.all()
    return jsonify({'data': users_schema.dump(users)})

@app.route('/api/users/<int:id>', methods=['PUT'])
@login_required
def update_user(id):
    user = User.query.get_or_404(id)
    data = request.get_json()
    current_user_obj = User.query.get(session['user_id'])
    
    # 检查权限：只能修改自己的信息，或者管理员可以修改任何人的信息
    if current_user_obj.id != id and current_user_obj.role != 'admin':
        return jsonify({'error': '无权限修改其他用户信息'}), 403
    
    # 更新基本信息
    user.full_name = data.get('full_name', user.full_name)
    user.phone = data.get('phone', user.phone)
    
    # 只有管理员可以修改角色和激活状态
    if current_user_obj.role == 'admin':
        user.role = data.get('role', user.role)
        user.is_active = data.get('is_active', user.is_active)
    
    # 密码修改
    if data.get('password'):
        user.set_password(data['password'])
    
    db.session.commit()
    return jsonify({'message': '用户信息更新成功', 'user': user.to_dict()})

@app.route('/api/users/<int:id>', methods=['DELETE'])
@admin_required
def delete_user(id):
    user = User.query.get_or_404(id)
    current_user_obj = User.query.get(session['user_id'])
    
    # 防止管理员删除自己
    if user.id == current_user_obj.id:
        return jsonify({'error': '不能删除自己的账号'}), 400
    
    # 防止删除其他管理员账号（可选，根据需求调整）
    if user.role == 'admin':
        return jsonify({'error': '不能删除管理员账号'}), 400
    
    # 记录删除操作
    print(f"管理员 {current_user_obj.username} 删除了用户 {user.username}")
    
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': f'用户 {user.username} 删除成功'})

# 房屋户型管理API
@app.route('/api/house_types', methods=['GET'])
@login_required
def get_house_types():
    try:
        house_types = HouseType.query.all()
        return jsonify({'data': house_types_schema.dump(house_types)})
    except Exception as e:
        return jsonify({'error': f'获取户型数据失败: {str(e)}'}), 500

@app.route('/api/house_types', methods=['POST'])
@login_required
def create_house_type():
    try:
        data = request.get_json()
        
        # 数据验证
        if not data.get('type_name'):
            return jsonify({'error': '户型名称不能为空'}), 400
            
        # 检查户型名称是否已存在
        if HouseType.query.filter_by(type_name=data['type_name']).first():
            return jsonify({'error': '户型名称已存在'}), 400
        
        house_type = HouseType(
            type_name=data['type_name'],
            description=data.get('description', '')
        )
        db.session.add(house_type)
        db.session.commit()
        return jsonify({'message': '户型创建成功', 'data': house_type_schema.dump(house_type)}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'创建户型失败: {str(e)}'}), 500

@app.route('/api/house_types/<int:id>', methods=['PUT'])
@login_required
def update_house_type(id):
    try:
        house_type = HouseType.query.get_or_404(id)
        data = request.get_json()
        
        # 数据验证
        if not data.get('type_name'):
            return jsonify({'error': '户型名称不能为空'}), 400
            
        # 检查户型名称是否已存在（排除当前记录）
        existing = HouseType.query.filter(
            HouseType.type_name == data['type_name'],
            HouseType.id != id
        ).first()
        if existing:
            return jsonify({'error': '户型名称已存在'}), 400
        
        house_type.type_name = data['type_name']
        house_type.description = data.get('description', house_type.description)
        db.session.commit()
        return jsonify({'message': '户型更新成功', 'data': house_type_schema.dump(house_type)})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'更新户型失败: {str(e)}'}), 500

@app.route('/api/house_types/<int:id>', methods=['DELETE'])
@login_required
def delete_house_type(id):
    try:
        house_type = HouseType.query.get_or_404(id)
        
        # 检查是否有房屋使用此户型
        if House.query.filter_by(type_id=id).first():
            return jsonify({'error': '此户型下还有房屋，无法删除'}), 400
        
        db.session.delete(house_type)
        db.session.commit()
        return jsonify({'message': '户型删除成功'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'删除户型失败: {str(e)}'}), 500

# 房东信息管理API
@app.route('/api/landlords', methods=['GET'])
@login_required
def get_landlords():
    try:
        landlords = Landlord.query.all()
        return jsonify({'data': landlords_schema.dump(landlords)})
    except Exception as e:
        return jsonify({'error': f'获取房东数据失败: {str(e)}'}), 500

@app.route('/api/landlords', methods=['POST'])
@login_required
def create_landlord():
    try:
        data = request.get_json()
        
        # 数据验证
        if not data.get('name') or not data.get('phone'):
            return jsonify({'error': '房东姓名和电话不能为空'}), 400
            
        # 检查身份证号是否已存在
        if data.get('id_card') and Landlord.query.filter_by(id_card=data['id_card']).first():
            return jsonify({'error': '身份证号已存在'}), 400
        
        landlord = Landlord(
            name=data['name'],
            phone=data['phone'],
            email=data.get('email'),
            id_card=data.get('id_card'),
            address=data.get('address')
        )
        db.session.add(landlord)
        db.session.commit()
        return jsonify({'message': '房东信息创建成功', 'data': landlord_schema.dump(landlord)}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'创建房东信息失败: {str(e)}'}), 500

@app.route('/api/landlords/<int:id>', methods=['PUT'])
@login_required
def update_landlord(id):
    try:
        landlord = Landlord.query.get_or_404(id)
        data = request.get_json()
        
        # 数据验证
        if not data.get('name') or not data.get('phone'):
            return jsonify({'error': '房东姓名和电话不能为空'}), 400
            
        # 检查身份证号是否已存在（排除当前记录）
        if data.get('id_card'):
            existing = Landlord.query.filter(
                Landlord.id_card == data['id_card'],
                Landlord.id != id
            ).first()
            if existing:
                return jsonify({'error': '身份证号已存在'}), 400
        
        landlord.name = data['name']
        landlord.phone = data['phone']
        landlord.email = data.get('email', landlord.email)
        landlord.id_card = data.get('id_card', landlord.id_card)
        landlord.address = data.get('address', landlord.address)
        db.session.commit()
        return jsonify({'message': '房东信息更新成功', 'data': landlord_schema.dump(landlord)})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'更新房东信息失败: {str(e)}'}), 500

@app.route('/api/landlords/<int:id>', methods=['DELETE'])
@login_required
def delete_landlord(id):
    try:
        landlord = Landlord.query.get_or_404(id)
        
        # 检查是否有房屋属于此房东
        if House.query.filter_by(landlord_id=id).first():
            return jsonify({'error': '此房东下还有房屋，无法删除'}), 400
        
        db.session.delete(landlord)
        db.session.commit()
        return jsonify({'message': '房东信息删除成功'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'删除房东信息失败: {str(e)}'}), 500

# 房屋管理API
@app.route('/api/houses', methods=['GET'])
@login_required
def get_houses():
    try:
        houses = House.query.all()
        
        # 包含户型和房东信息的数据结构
        houses_data = []
        for house in houses:
            # 获取户型信息
            house_type = None
            if house.type_id:
                ht = HouseType.query.get(house.type_id)
                if ht:
                    house_type = {
                        'id': ht.id,
                        'type_name': ht.type_name,
                        'description': ht.description
                    }
            
            # 获取房东信息
            landlord = None
            if house.landlord_id:
                ld = Landlord.query.get(house.landlord_id)
                if ld:
                    landlord = {
                        'id': ld.id,
                        'name': ld.name,
                        'phone': ld.phone
                    }
            
            houses_data.append({
                'id': house.id,
                'house_number': house.house_number,
                'address': house.address,
                'area': float(house.area) if house.area else None,
                'rent_price': float(house.rent_price) if house.rent_price else None,
                'deposit': float(house.deposit) if house.deposit else None,
                'status': house.status,
                'description': house.description,
                'type_id': house.type_id,
                'landlord_id': house.landlord_id,
                'house_type': house_type,
                'landlord': landlord,
                'created_at': house.created_at.isoformat() if house.created_at else None
            })
        
        return jsonify({'data': houses_data})
    except Exception as e:
        print(f"❌ API错误: {str(e)}")
        return jsonify({'error': str(e), 'data': []}), 500

@app.route('/api/houses', methods=['POST'])
@login_required
def create_house():
    data = request.get_json()
    house = House(
        house_number=data['house_number'],
        address=data['address'],
        area=data.get('area'),
        rent_price=data['rent_price'],
        deposit=data.get('deposit'),
        description=data.get('description'),
        type_id=data['type_id'],
        landlord_id=data['landlord_id']
    )
    db.session.add(house)
    db.session.commit()
    return jsonify({'message': '房屋信息创建成功', 'data': house_schema.dump(house)}), 201

@app.route('/api/houses/<int:id>', methods=['PUT'])
@login_required
def update_house(id):
    house = House.query.get_or_404(id)
    data = request.get_json()
    house.house_number = data.get('house_number', house.house_number)
    house.address = data.get('address', house.address)
    house.area = data.get('area', house.area)
    house.rent_price = data.get('rent_price', house.rent_price)
    house.deposit = data.get('deposit', house.deposit)
    house.status = data.get('status', house.status)
    house.description = data.get('description', house.description)
    house.type_id = data.get('type_id', house.type_id)
    house.landlord_id = data.get('landlord_id', house.landlord_id)
    db.session.commit()
    return jsonify({'message': '房屋信息更新成功', 'data': house_schema.dump(house)})

@app.route('/api/houses/<int:id>', methods=['DELETE'])
@login_required
def delete_house(id):
    house = House.query.get_or_404(id)
    db.session.delete(house)
    db.session.commit()
    return jsonify({'message': '房屋信息删除成功'})

# 租房客户管理API
@app.route('/api/tenants', methods=['GET'])
@login_required
def get_tenants():
    try:
        # 获取查询参数
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '')
        
        query = Tenant.query
        
        # 搜索功能
        if search:
            query = query.filter(
                (Tenant.name.contains(search)) |
                (Tenant.phone.contains(search)) |
                (Tenant.email.contains(search))
            )
        
        # 分页
        if page > 1 or per_page < 100:
            tenants = query.paginate(
                page=page, per_page=per_page, error_out=False
            )
            return jsonify({
                'data': tenants_schema.dump(tenants.items),
                'total': tenants.total,
                'pages': tenants.pages,
                'current_page': page
            })
        else:
            tenants = query.all()
            return jsonify({'data': tenants_schema.dump(tenants)})
            
    except Exception as e:
        return jsonify({'error': f'获取租客数据失败: {str(e)}'}), 500

@app.route('/api/tenants', methods=['POST'])
@login_required
def create_tenant():
    try:
        data = request.get_json()
        
        # 数据验证
        if not data.get('name') or not data.get('phone'):
            return jsonify({'error': '租客姓名和电话不能为空'}), 400
            
        # 检查身份证号是否已存在
        if data.get('id_card') and Tenant.query.filter_by(id_card=data['id_card']).first():
            return jsonify({'error': '身份证号已存在'}), 400
        
        tenant = Tenant(
            name=data['name'],
            phone=data['phone'],
            email=data.get('email'),
            id_card=data.get('id_card'),
            address=data.get('address')
        )
        db.session.add(tenant)
        db.session.commit()
        return jsonify({'message': '租客信息创建成功', 'data': tenant_schema.dump(tenant)}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'创建租客信息失败: {str(e)}'}), 500

@app.route('/api/tenants/<int:id>', methods=['PUT'])
@login_required
def update_tenant(id):
    try:
        tenant = Tenant.query.get_or_404(id)
        data = request.get_json()
        
        # 数据验证
        if not data.get('name') or not data.get('phone'):
            return jsonify({'error': '租客姓名和电话不能为空'}), 400
            
        # 检查身份证号是否已存在（排除当前记录）
        if data.get('id_card'):
            existing = Tenant.query.filter(
                Tenant.id_card == data['id_card'],
                Tenant.id != id
            ).first()
            if existing:
                return jsonify({'error': '身份证号已存在'}), 400
        
        tenant.name = data['name']
        tenant.phone = data['phone']
        tenant.email = data.get('email', tenant.email)
        tenant.id_card = data.get('id_card', tenant.id_card)
        tenant.address = data.get('address', tenant.address)
        db.session.commit()
        return jsonify({'message': '租客信息更新成功', 'data': tenant_schema.dump(tenant)})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'更新租客信息失败: {str(e)}'}), 500

@app.route('/api/tenants/<int:id>', methods=['DELETE'])
@login_required
def delete_tenant(id):
    try:
        tenant = Tenant.query.get_or_404(id)
        
        # 检查是否有活跃的租房记录
        active_rental = Rental.query.filter_by(tenant_id=id, status='active').first()
        if active_rental:
            return jsonify({'error': '此租客还有活跃的租房记录，无法删除'}), 400
        
        db.session.delete(tenant)
        db.session.commit()
        return jsonify({'message': '租客信息删除成功'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'删除租客信息失败: {str(e)}'}), 500

# 租房记录管理API
@app.route('/api/rentals', methods=['GET'])
@login_required
def get_rentals():
    rentals = Rental.query.all()
    return jsonify({'data': rentals_schema.dump(rentals)})

@app.route('/api/rentals', methods=['POST'])
@login_required
def create_rental():
    try:
        data = request.get_json()
        print(f"创建租房记录，接收数据: {data}")
        
        rental = Rental(
            start_date=datetime.strptime(data['start_date'], '%Y-%m-%d').date(),
            end_date=datetime.strptime(data['end_date'], '%Y-%m-%d').date(),
            monthly_rent=data['monthly_rent'],
            deposit_paid=data['deposit_paid'],
            contract_number=data.get('contract_number'),
            house_id=data['house_id'],
            tenant_id=data['tenant_id']
        )
        db.session.add(rental)
        db.session.flush()  # 获取ID但不提交事务
        
        # 更新对应房屋状态为已出租
        house = House.query.get(data['house_id'])
        if house:
            house.status = 'rented'
            print(f"房屋 {house.house_number} 状态已更新为已出租")
        
        db.session.commit()
        
        # 返回包含ID的数据
        rental_data = rental_schema.dump(rental)
        print(f"租房记录创建成功，ID: {rental.id}")
        
        return jsonify({
            'message': '租房记录创建成功', 
            'data': {
                'id': rental.id,
                **rental_data
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"创建租房记录失败: {str(e)}")
        return jsonify({'error': f'创建租房记录失败: {str(e)}'}), 500

@app.route('/api/rentals/<int:id>/return', methods=['POST'])
@login_required
def return_rental(id):
    data = request.get_json() or {}
    rental = Rental.query.get_or_404(id)
    
    # 更新租房记录状态
    rental.status = 'terminated'
    rental.returned_at = datetime.utcnow()
    
    # 处理押金
    deposit_action = data.get('deposit_action', 'return')  # 默认归还押金
    deposit_reason = data.get('deposit_reason', '')
    
    # 查找已缴费的押金记录
    deposit_payment = Payment.query.filter_by(
        rental_id=id,
        payment_type='deposit',
        payment_status='paid'
    ).first()
    
    if deposit_payment:
        if deposit_action == 'return':
            # 归还押金 - 更新押金记录状态为已退还
            deposit_payment.payment_status = 'returned'
            deposit_payment.description = '押金退还'
            print(f"押金已退还: ¥{deposit_payment.amount}")
        else:
            # 扣留押金 - 更新押金记录的描述
            deposit_payment.description = f"押金扣留 - {deposit_reason}"
            print(f"押金已扣留: ¥{deposit_payment.amount}, 原因: {deposit_reason}")
    
    # 更新对应房屋状态为可出租
    house = House.query.get(rental.house_id)
    if house:
        house.status = 'available'
        print(f"房屋 {house.house_number} 状态已更新为可出租")
    
    db.session.commit()
    
    # 根据押金处理方式返回不同的消息
    if deposit_payment:
        if deposit_action == 'return':
            message = f'房屋归还成功，押金 ¥{deposit_payment.amount} 已退还给租客'
        else:
            message = f'房屋归还成功，押金 ¥{deposit_payment.amount} 已扣留'
    else:
        message = '房屋归还成功'
    
    return jsonify({
        'message': message, 
        'data': rental_schema.dump(rental),
        'deposit_action': deposit_action,
        'deposit_amount': float(deposit_payment.amount) if deposit_payment else 0
    })

@app.route('/api/rentals/<int:id>', methods=['DELETE'])
@admin_required
def delete_rental(id):
    rental = Rental.query.get_or_404(id)
    
    # 获取相关房屋信息
    house = House.query.get(rental.house_id)
    
    # 删除相关的收费记录
    Payment.query.filter_by(rental_id=id).delete()
    
    # 删除租房记录
    db.session.delete(rental)
    
    # 更新房屋状态为可出租
    if house:
        house.status = 'available'
        print(f"房屋 {house.house_number} 状态已更新为可出租")
    
    db.session.commit()
    return jsonify({'message': '租房记录删除成功'})

# 收费记录管理API
@app.route('/api/payments', methods=['GET'])
@login_required
def get_payments():
    # 预加载关联数据以避免N+1查询问题
    payments = Payment.query.options(
        db.joinedload(Payment.rental)
        .joinedload(Rental.house)
        .joinedload(House.landlord)
    ).options(
        db.joinedload(Payment.rental)
        .joinedload(Rental.tenant)
    ).all()
    return jsonify({'data': payments_schema.dump(payments)})

@app.route('/api/payments', methods=['POST'])
@login_required
def create_payment():
    data = request.get_json()
    payment = Payment(
        payment_date=datetime.strptime(data['payment_date'], '%Y-%m-%d').date(),
        amount=data['amount'],
        payment_type=data['payment_type'],
        payment_method=data.get('payment_method', 'cash'),
        payment_status=data.get('payment_status', 'pending'),
        description=data.get('description'),
        contract_number=data.get('contract_number'),
        rental_id=data['rental_id']
    )
    db.session.add(payment)
    db.session.commit()
    return jsonify({'message': '收费记录创建成功', 'data': payment_schema.dump(payment)}), 201

@app.route('/api/payments/<int:id>/pay', methods=['POST'])
@login_required
def pay_payment(id):
    try:
        payment = Payment.query.get_or_404(id)
        
        # 更新缴费状态
        payment.payment_status = 'paid'
        payment.paid_at = datetime.utcnow()
        
        db.session.commit()
        
        print(f"收费记录 {id} 已标记为已缴费")
        return jsonify({
            'message': '缴费成功',
            'data': payment_schema.dump(payment)
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"缴费失败: {str(e)}")
        return jsonify({'error': f'缴费失败: {str(e)}'}), 500

@app.route('/api/payments/<int:id>', methods=['DELETE'])
@admin_required
def delete_payment(id):
    payment = Payment.query.get_or_404(id)
    db.session.delete(payment)
    db.session.commit()
    return jsonify({'message': '收费记录删除成功'})

# 统计功能API
@app.route('/api/statistics/house_types', methods=['GET'])
@login_required
def get_house_type_statistics():
    # 直接使用ORM查询统计信息，避免依赖存储过程
    try:
        house_types = HouseType.query.all()
        stats = []
        for house_type in house_types:
            houses = House.query.filter_by(type_id=house_type.id).all()
            total_houses = len(houses)
            rented_houses = len([h for h in houses if h.status == 'rented'])
            available_houses = len([h for h in houses if h.status == 'available'])
            
            stats.append({
                'type_name': house_type.type_name,
                'total_houses': total_houses,
                'rented_houses': rented_houses,
                'available_houses': available_houses
            })
        return jsonify({'data': stats})
    except Exception as e:
        return jsonify({'error': f'统计查询失败：{str(e)}'}), 500

# 房屋信息视图查询API
@app.route('/api/houses/view', methods=['GET'])
@login_required
def get_houses_view():
    # 直接使用ORM查询，避免依赖视图
    try:
        houses_data = db.session.query(
            House.house_number,
            Landlord.name.label('landlord_name'),
            House.status,
            HouseType.type_name,
            House.address,
            House.rent_price
        ).join(Landlord, House.landlord_id == Landlord.id)\
         .join(HouseType, House.type_id == HouseType.id)\
         .all()
        
        houses = []
        for row in houses_data:
            houses.append({
                '房号': row.house_number,
                '房东姓名': row.landlord_name,
                '状态': row.status,
                '户型': row.type_name,
                '地址': row.address,
                '租金': float(row.rent_price) if row.rent_price else None
            })
        return jsonify({'data': houses})
    except Exception as e:
        return jsonify({'error': f'查询失败：{str(e)}'}), 500

# 数据备份API
@app.route('/api/backup', methods=['POST'])
@admin_required
def backup_data():
    import subprocess
    import os
    
    try:
        # 生成时间戳
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_file = f"backup_{timestamp}.sql"
        
        # MySQL数据库连接信息
        host = 'localhost'
        user = 'root'
        password = '******'
        database = 'house_rental_db'
        
        # 构建mysqldump命令
        mysqldump_cmd = [
            'mysqldump',
            f'--host={host}',
            f'--user={user}',
            f'--password={password}',
            '--routines',
            '--triggers',
            '--single-transaction',
            '--lock-tables=false',
            '--add-drop-table',
            '--complete-insert',
            '--default-character-set=utf8mb4',
            database
        ]
        
        # 执行mysqldump命令
        print(f"正在创建SQL备份文件: {backup_file}")
        
        with open(backup_file, 'w', encoding='utf-8') as f:
            # 添加备份文件头部信息
            f.write(f"-- MySQL数据库备份文件\n")
            f.write(f"-- 数据库: {database}\n")
            f.write(f"-- 备份时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"-- 生成工具: 房屋租赁管理系统\n")
            f.write(f"-- ------------------------------------------------------\n\n")
            
            # 执行mysqldump并写入文件
            result = subprocess.run(
                mysqldump_cmd,
                stdout=f,
                stderr=subprocess.PIPE,
                text=True,
                encoding='utf-8'
            )
            
        if result.returncode == 0:
            # 获取文件大小
            file_size = os.path.getsize(backup_file)
            file_size_mb = round(file_size / 1024 / 1024, 2)
            
            print(f"✅ SQL备份创建成功: {backup_file} ({file_size_mb} MB)")
            return jsonify({
                'message': f'SQL数据备份成功！',
                'backup_file': backup_file,
                'file_size': f'{file_size_mb} MB',
                'timestamp': timestamp
            })
        else:
            error_msg = result.stderr.decode('utf-8') if result.stderr else '未知错误'
            print(f"❌ mysqldump执行失败: {error_msg}")
            
            # 删除可能创建的空文件
            if os.path.exists(backup_file):
                os.remove(backup_file)
                
            return jsonify({'error': f'备份失败: {error_msg}'}), 500
            
    except FileNotFoundError:
        return jsonify({'error': 'mysqldump工具未找到，请确保MySQL客户端已安装并添加到PATH环境变量'}), 500
    except Exception as e:
        print(f"❌ 备份过程出错: {str(e)}")
        
        # 清理可能创建的文件
        if 'backup_file' in locals() and os.path.exists(backup_file):
            os.remove(backup_file)
            
        return jsonify({'error': f'备份失败：{str(e)}'}), 500

# 数据恢复API
@app.route('/api/restore', methods=['POST'])
@admin_required
def restore_data():
    import subprocess
    import os
    import tempfile
    
    try:
        # 检查是否有上传的文件
        if 'backup_file' not in request.files:
            return jsonify({'error': '请上传SQL备份文件'}), 400
        
        file = request.files['backup_file']
        
        if file.filename == '':
            return jsonify({'error': '请选择文件'}), 400
        
        # 检查文件扩展名
        if not file.filename.endswith('.sql'):
            return jsonify({'error': '只支持.sql格式的备份文件'}), 400
        
        # 创建临时文件保存上传的SQL文件
        with tempfile.NamedTemporaryFile(mode='w', suffix='.sql', delete=False, encoding='utf-8') as temp_file:
            # 读取上传的文件内容并写入临时文件
            file_content = file.read().decode('utf-8')
            temp_file.write(file_content)
            temp_file_path = temp_file.name
        
        print(f"正在从上传的SQL文件恢复数据: {file.filename}")
        
        # MySQL数据库连接信息
        host = 'localhost'
        user = 'root'
        password = '******'
        database = 'house_rental_db'
        
        # 构建mysql命令来执行SQL文件
        mysql_cmd = [
            'mysql',
            f'--host={host}',
            f'--user={user}',
            f'--password={password}',
            '--default-character-set=utf8mb4',
            database
        ]
        
        # 读取临时SQL文件并执行
        with open(temp_file_path, 'r', encoding='utf-8') as f:
            result = subprocess.run(
                mysql_cmd,
                stdin=f,
                stderr=subprocess.PIPE,
                stdout=subprocess.PIPE,
                text=True,
                encoding='utf-8'
            )
        
        # 清理临时文件
        os.unlink(temp_file_path)
        
        if result.returncode == 0:
            print(f"✅ 数据恢复成功: {file.filename}")
            return jsonify({
                'message': f'SQL数据恢复成功！文件: {file.filename}',
                'backup_file': file.filename
            })
        else:
            error_msg = result.stderr if result.stderr else '未知错误'
            print(f"❌ 数据恢复失败: {error_msg}")
            return jsonify({'error': f'恢复失败: {error_msg}'}), 500
            
    except FileNotFoundError:
        return jsonify({'error': 'mysql工具未找到，请确保MySQL客户端已安装并添加到PATH环境变量'}), 500
    except Exception as e:
        print(f"❌ 恢复过程出错: {str(e)}")
        return jsonify({'error': f'恢复失败：{str(e)}'}), 500
    finally:
        # 确保临时文件被清理
        if 'temp_file_path' in locals() and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
            except:
                pass

# 获取租房记录详情API
@app.route('/api/rentals/<int:id>', methods=['GET'])
@login_required
def get_rental_detail(id):
    try:
        rental = Rental.query.get_or_404(id)
        
        # 获取相关的收费记录
        payments = Payment.query.filter_by(rental_id=id).all()
        
        rental_data = rental_schema.dump(rental)
        rental_data['payments'] = payments_schema.dump(payments)
        
        return jsonify({'data': rental_data})
    except Exception as e:
        return jsonify({'error': f'获取租房记录详情失败: {str(e)}'}), 500

# 数据库初始化已移至 run.py 中处理

if __name__ == '__main__':
    app.run(debug=True, port=5000) 
