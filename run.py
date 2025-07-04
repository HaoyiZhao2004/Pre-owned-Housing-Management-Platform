#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
二手房中介管理系统启动脚本
"""

import os
import sys
import webbrowser
import logging
from app import app, db
from models import User
from datetime import datetime
from sqlalchemy import text

# 设置日志级别 - 只显示错误
logging.getLogger('werkzeug').setLevel(logging.ERROR)
logging.getLogger('sqlalchemy').setLevel(logging.ERROR)
logging.getLogger('sqlalchemy.engine').setLevel(logging.ERROR)
logging.getLogger('sqlalchemy.dialects').setLevel(logging.ERROR)
logging.getLogger('sqlalchemy.pool').setLevel(logging.ERROR)
logging.getLogger('sqlalchemy.orm').setLevel(logging.ERROR)
logging.getLogger().setLevel(logging.ERROR)  # 设置根日志级别

def create_database():
    """创建数据库表"""
    try:
        with app.app_context():
            # 更新数据库结构
            try:
                # 尝试修改password_hash字段长度
                db.engine.execute(text("ALTER TABLE users MODIFY password_hash VARCHAR(255) NOT NULL"))
                print(" 数据库结构更新成功")
            except Exception as alter_error:
                # 如果修改失败，说明表不存在，创建新表
                pass
            
            # 创建所有表
            db.create_all()
            
            # 创建默认管理员账户
            create_default_admin()
            
            return True
    except Exception as e:
        print(f" 数据库表创建失败: {e}")
        return False

def create_default_admin():
    """创建默认管理员账户"""
    try:
        # 检查是否已存在管理员账户
        admin = User.query.filter_by(username='admin').first()
        if not admin:
            admin = User(
                username='admin',
                email='admin@example.com',
                full_name='系统管理员',
                role='admin'
            )
            admin.set_password('admin123')  # 默认密码
            db.session.add(admin)
            db.session.commit()
            print(" 默认管理员账户创建成功 (admin/admin123)")
    except Exception as e:
        print(f"创建管理员账户失败: {e}")
        db.session.rollback()

def check_dependencies():
    """检查依赖包"""
    required_packages = [
        'Flask',
        'Flask-SQLAlchemy', 
        'Flask-CORS',
        'PyMySQL',
        'marshmallow',
        'flask-marshmallow',
        'marshmallow-sqlalchemy'
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package.lower().replace('-', '_'))
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print("缺少依赖包，请运行: pip install -r requirements.txt")
        return False
    
    return True

def print_banner():
    """打印启动横幅"""
    banner = """
╔══════════════════════════════════════════════════════════════╗
║                    二手房中介管理系统                          ║
║                   House Rental Management System              ║
╠══════════════════════════════════════════════════════════════╣
║  技术栈: Flask + MySQL + Bootstrap + JavaScript              ║
║  功能: 房屋管理 | 租客管理 | 收费管理 | 统计分析               ║
╚══════════════════════════════════════════════════════════════╝
    """
    print(banner)

def print_instructions():
    """打印使用说明"""
    instructions = """
 系统启动成功！访问地址: http://localhost:5000

 提示: 按 Ctrl+C 停止服务器
    """
    print(instructions)

def main():
    """主函数"""
    print_banner()
    
    # 检查依赖
    if not check_dependencies():
        sys.exit(1)
    
    # 创建数据库表
    if not create_database():
        print("  数据库初始化失败，请检查MySQL服务和配置")
        sys.exit(1)
    
    print_instructions()
    
    # 自动打开浏览器
    import threading
    def open_browser():
        import time
        time.sleep(1.5)  # 等待服务器启动
        webbrowser.open('http://localhost:5000')
    
    thread = threading.Thread(target=open_browser)
    thread.daemon = True
    thread.start()
    
    # 启动Flask应用
    try:
        app.run(
            host='localhost',
            port=5000,
            debug=False,  # 关闭调试模式减少输出
            use_reloader=False  # 避免重复启动
        )
    except KeyboardInterrupt:
        print("\n\n👋 感谢使用二手房中介管理系统！")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ 服务器启动失败: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main() 