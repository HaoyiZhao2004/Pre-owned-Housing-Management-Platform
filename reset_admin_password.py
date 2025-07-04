#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
管理员密码重置工具
"""

import sys
import os
from werkzeug.security import generate_password_hash
import mysql.connector
from getpass import getpass

def reset_admin_password():
    """重置管理员密码"""
    print("=== 房屋租赁管理系统 - 管理员密码重置工具 ===\n")
    
    # 数据库连接配置
    db_config = {
        'host': 'localhost',
        'user': 'root',
        'password': '671603',
        'database': 'house_rental_db',
        'charset': 'utf8mb4'
    }
    
    try:
        # 连接数据库
        print("正在连接数据库...")
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        # 查看当前管理员账户
        cursor.execute("SELECT id, username, email, role FROM users WHERE role = 'admin'")
        admins = cursor.fetchall()
        
        if not admins:
            print("❌ 未找到管理员账户！")
            return
        
        print("找到以下管理员账户：")
        for admin in admins:
            print(f"  ID: {admin[0]}, 用户名: {admin[1]}, 邮箱: {admin[2]}")
        
        # 选择要重置的管理员
        if len(admins) == 1:
            admin_id = admins[0][0]
            admin_username = admins[0][1]
            print(f"\n将重置管理员账户: {admin_username}")
        else:
            print("\n请选择要重置密码的管理员账户:")
            for i, admin in enumerate(admins, 1):
                print(f"  {i}. {admin[1]} ({admin[2]})")
            
            while True:
                try:
                    choice = int(input("请输入选择 (1-{}): ".format(len(admins))))
                    if 1 <= choice <= len(admins):
                        admin_id = admins[choice-1][0]
                        admin_username = admins[choice-1][1]
                        break
                    else:
                        print("请输入有效的选择！")
                except ValueError:
                    print("请输入数字！")
        
        # 输入新密码
        print(f"\n为管理员 '{admin_username}' 设置新密码:")
        while True:
            new_password = getpass("请输入新密码: ")
            if len(new_password) < 6:
                print("密码长度至少6位，请重新输入！")
                continue
            
            confirm_password = getpass("请确认新密码: ")
            if new_password != confirm_password:
                print("两次输入的密码不一致，请重新输入！")
                continue
            
            break
        
        # 生成密码哈希
        password_hash = generate_password_hash(new_password)
        
        # 更新密码
        cursor.execute(
            "UPDATE users SET password_hash = %s WHERE id = %s",
            (password_hash, admin_id)
        )
        conn.commit()
        
        print(f"\n✅ 管理员 '{admin_username}' 的密码已成功重置！")
        print(f"新的登录信息：")
        print(f"  用户名: {admin_username}")
        print(f"  密码: {new_password}")
        print(f"  邮箱: {admins[0][2] if len(admins) == 1 else [a[2] for a in admins if a[0] == admin_id][0]}")
        
    except mysql.connector.Error as e:
        print(f"❌ 数据库错误: {e}")
    except Exception as e:
        print(f"❌ 操作失败: {e}")
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

def quick_reset():
    """快速重置为默认密码"""
    print("=== 快速重置管理员密码为默认值 ===\n")
    
    # 数据库连接配置
    db_config = {
        'host': 'localhost',
        'user': 'root',
        'password': '671603',
        'database': 'house_rental_db',
        'charset': 'utf8mb4'
    }
    
    try:
        # 连接数据库
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        # 默认密码
        default_password = "admin123"
        password_hash = generate_password_hash(default_password)
        
        # 更新所有管理员账户的密码
        cursor.execute(
            "UPDATE users SET password_hash = %s WHERE role = 'admin'",
            (password_hash,)
        )
        affected_rows = cursor.rowcount
        conn.commit()
        
        if affected_rows > 0:
            print(f"✅ 成功重置了 {affected_rows} 个管理员账户的密码！")
            print("默认登录信息：")
            print("  用户名: admin")
            print("  密码: admin123")
            print("  邮箱: admin@example.com")
        else:
            print("❌ 未找到管理员账户！")
        
    except mysql.connector.Error as e:
        print(f"❌ 数据库错误: {e}")
    except Exception as e:
        print(f"❌ 操作失败: {e}")
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    print("请选择重置方式：")
    print("1. 自定义密码重置")
    print("2. 快速重置为默认密码 (admin123)")
    print("3. 退出")
    
    while True:
        try:
            choice = input("\n请输入选择 (1-3): ").strip()
            if choice == "1":
                reset_admin_password()
                break
            elif choice == "2":
                quick_reset()
                break
            elif choice == "3":
                print("已退出。")
                break
            else:
                print("请输入有效的选择 (1-3)！")
        except KeyboardInterrupt:
            print("\n\n操作已取消。")
            break
        except Exception as e:
            print(f"输入错误: {e}") 