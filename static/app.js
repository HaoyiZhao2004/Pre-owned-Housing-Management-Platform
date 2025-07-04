// 过滤第三方扩展错误
const originalConsoleError = console.error;
console.error = function(...args) {
    // 过滤 Grammarly 相关错误
    const message = args.join(' ');
    if (message.includes('grm ERROR') || 
        message.includes('Grammarly') || 
        message.includes('[iterable]') ||
        message.includes('Not supported: in app messages')) {
        return; // 忽略这些错误
    }
    originalConsoleError.apply(console, args);
};

// API基础URL
const API_BASE_URL = '/api';

// 全局变量
let currentModule = 'dashboard';
let houseTypes = [];
let landlords = [];
let houses = [];
let tenants = [];
let rentals = [];
let payments = [];
let currentUser = null;
let isAuthenticated = false;
let houseTypeChart = null;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== 页面DOM加载完成 ===');
    
    // 详细检查DOM结构
    console.log('=== DOM结构检查 ===');
    const userInfoPanel = document.getElementById('userInfoPanel');
    const userMenu = document.getElementById('userMenu');
    const userManagementMenuItem = document.getElementById('userManagementMenuItem');
    
    console.log('用户信息面板:', userInfoPanel);
    console.log('用户菜单:', userMenu);
    console.log('用户管理菜单项:', userManagementMenuItem);
    
    if (userManagementMenuItem) {
        console.log('用户管理菜单项HTML:', userManagementMenuItem.outerHTML);
        console.log('初始样式:', userManagementMenuItem.style.cssText);
        console.log('初始计算样式 display:', window.getComputedStyle(userManagementMenuItem).display);
        console.log('初始计算样式 visibility:', window.getComputedStyle(userManagementMenuItem).visibility);
    } else {
        console.error('DOM加载完成时未找到用户管理菜单项！');
        // 查找所有菜单项
        const allMenuItems = document.querySelectorAll('.menu-item');
        console.log('所有菜单项:', allMenuItems);
        allMenuItems.forEach((item, index) => {
            console.log(`菜单项 ${index}:`, item.outerHTML);
        });
    }
    
    // 检查用户认证状态
    checkAuth();
    
    // 初始化页面内跳转功能
    initializePageNavigation();
    
    // 等待DOM完全渲染后测试快速导航功能
    setTimeout(() => {
        testQuickNav();
        
        // 再次检查用户管理菜单项
        console.log('=== 延迟检查用户管理菜单项 ===');
        const delayedCheck = document.getElementById('userManagementMenuItem');
        if (delayedCheck) {
            console.log('延迟检查 - 用户管理菜单项存在');
            console.log('延迟检查 - 样式:', delayedCheck.style.cssText);
            console.log('延迟检查 - 计算样式 display:', window.getComputedStyle(delayedCheck).display);
        } else {
            console.error('延迟检查 - 仍然未找到用户管理菜单项！');
        }
    }, 1000);
    
    console.log('系统初始化完成');
});

// 初始化页面内跳转功能
function initializePageNavigation() {
    // 创建快速导航遮罩
    const overlay = document.createElement('div');
    overlay.className = 'quick-nav-overlay';
    overlay.onclick = toggleQuickNav;
    document.body.appendChild(overlay);
    
    // 监听滚动事件显示/隐藏回到顶部按钮
    window.addEventListener('scroll', function() {
        const backToTopBtn = document.getElementById('back-to-top');
        if (window.scrollY > 300) {
            backToTopBtn.style.display = 'flex';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });
    
    // 更新面包屑导航
    updateBreadcrumb('dashboard');
}

// 切换快速导航面板
function toggleQuickNav() {
    console.log('切换快速导航面板');
    const panel = document.getElementById('quick-nav');
    const overlay = document.querySelector('.quick-nav-overlay');
    
    if (!panel) {
        console.error('未找到快速导航面板元素');
        return;
    }
    
    if (!overlay) {
        console.error('未找到快速导航遮罩元素');
        return;
    }
    
    if (panel.classList.contains('active')) {
        console.log('关闭快速导航面板');
        panel.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    } else {
        console.log('打开快速导航面板');
        panel.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// 回到顶部
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// 刷新当前模块
function refreshCurrentModule() {
    const currentModule = document.querySelector('.module.active');
    if (currentModule) {
        const moduleId = currentModule.id;
        showModule(moduleId);
        showAlert('数据已刷新', 'success');
    }
}

// 跳转到页面内指定部分
function jumpToSection(sectionId) {
    console.log('跳转到页面部分:', sectionId);
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        
        // 添加高亮效果
        section.style.outline = '2px solid var(--primary-color)';
        section.style.outlineOffset = '4px';
        setTimeout(() => {
            section.style.outline = '';
            section.style.outlineOffset = '';
        }, 2000);
    } else {
        console.error('未找到页面部分:', sectionId);
    }
}

// 测试函数：检查快速导航功能
function testQuickNav() {
    console.log('=== 快速导航功能测试 ===');
    
    // 测试面板元素
    const panel = document.getElementById('quick-nav');
    console.log('快速导航面板:', panel ? '✅ 存在' : '❌ 不存在');
    
    // 测试遮罩元素
    const overlay = document.querySelector('.quick-nav-overlay');
    console.log('快速导航遮罩:', overlay ? '✅ 存在' : '❌ 不存在');
    
    // 测试浮动按钮
    const fabItems = document.querySelectorAll('.fab-item');
    console.log('浮动按钮数量:', fabItems.length);
    
    // 测试nav-item元素
    const navItems = document.querySelectorAll('.nav-grid .nav-item');
    console.log('导航项数量:', navItems.length);
    
    // 测试点击事件
    navItems.forEach((item, index) => {
        const onclick = item.getAttribute('onclick');
        console.log(`导航项 ${index + 1} 点击事件:`, onclick);
    });
    
    console.log('=== 测试完成 ===');
}

// 将测试函数绑定到全局作用域
window.testQuickNav = testQuickNav;
window.toggleQuickNav = toggleQuickNav;
window.showModule = showModule;
window.jumpToSection = jumpToSection;

// 更新面包屑导航
function updateBreadcrumb(moduleId) {
    const breadcrumb = document.getElementById('current-module');
    const moduleNames = {
        'dashboard': '仪表盘',
        'house-types': '户型管理',
        'landlords': '房东管理',
        'houses': '房屋管理',
        'tenants': '租客管理',
        'rentals': '租房管理',
        'payments': '收费管理',
        'statistics': '统计分析',
        'backup': '数据备份',
        'user-management': '用户管理'
    };
    
    if (breadcrumb && moduleNames[moduleId]) {
        breadcrumb.textContent = moduleNames[moduleId];
    }
}

// 检查用户认证状态
async function checkAuth() {
    try {
        const response = await fetch('/api/current_user', {
            method: 'GET',
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('=== 用户认证成功 ===');
            console.log('API返回的用户数据:', data);
            console.log('用户信息:', data.user);
            console.log('用户角色:', data.user ? data.user.role : '未定义');
            
            currentUser = data.user;
            isAuthenticated = true;
            
            console.log('调用 updateUserInfo 前的全局currentUser:', currentUser);
            updateUserInfo(data.user);
            
            showModule('dashboard');
            loadInitialData();
            return true;
        } else {
            // 用户未登录，跳转到登录页面
            isAuthenticated = false;
            window.location.href = '/login';
            return false;
        }
    } catch (error) {
        console.error('检查认证状态失败:', error);
        isAuthenticated = false;
        window.location.href = '/login';
        return false;
    }
}

// 更新用户信息显示
function updateUserInfo(user) {
    console.log('updateUserInfo 被调用，用户数据:', user);
    
    const usernameElement = document.getElementById('current-username');
    const roleElement = document.getElementById('current-role');
    
    if (usernameElement) {
        usernameElement.textContent = user.full_name || user.username;
    }
    
    if (roleElement) {
        roleElement.textContent = getRoleText(user.role);
    }
    
    // 根据用户角色显示/隐藏管理员功能（已移除顶部导航栏中的用户管理选项）
    
    // 控制用户菜单中的管理员专用选项
    console.log('=== 开始处理管理员菜单项 ===');
    const userManagementMenuItem = document.getElementById('userManagementMenuItem');
    const backupMenuItem = document.getElementById('backupMenuItem');
    console.log('用户管理菜单项元素:', userManagementMenuItem);
    console.log('数据备份菜单项元素:', backupMenuItem);
    console.log('用户角色:', user.role);
    console.log('是否为管理员:', user.role === 'admin');
    
    // 处理用户管理菜单项
    if (userManagementMenuItem) {
        if (user.role === 'admin') {
            console.log('用户是管理员，显示用户管理菜单项');
            userManagementMenuItem.style.display = 'block';
            userManagementMenuItem.style.visibility = 'visible';
            userManagementMenuItem.style.opacity = '1';
            userManagementMenuItem.classList.remove('d-none', 'hidden');
        } else {
            console.log('用户不是管理员，隐藏用户管理菜单项');
            userManagementMenuItem.style.display = 'none';
            userManagementMenuItem.style.visibility = 'hidden';
        }
    } else {
        console.error('未找到用户管理菜单项元素！');
    }
    
    // 处理数据备份菜单项
    if (backupMenuItem) {
        if (user.role === 'admin') {
            console.log('用户是管理员，显示数据备份菜单项');
            backupMenuItem.style.display = 'block';
            backupMenuItem.style.visibility = 'visible';
            backupMenuItem.style.opacity = '1';
            backupMenuItem.classList.remove('d-none', 'hidden');
        } else {
            console.log('用户不是管理员，隐藏数据备份菜单项');
            backupMenuItem.style.display = 'none';
            backupMenuItem.style.visibility = 'hidden';
        }
    } else {
        console.error('未找到数据备份菜单项元素！');
    }
    
    console.log('用户信息更新完成:', user.full_name || user.username);
    
    // 保存用户信息到全局变量
    window.currentUser = user;
}

// 测试函数 - 手动显示用户管理菜单项
function testShowUserManagement() {
    console.log('测试显示用户管理菜单项');
    const userManagementMenuItem = document.getElementById('userManagementMenuItem');
    if (userManagementMenuItem) {
        userManagementMenuItem.style.display = 'block';
        userManagementMenuItem.style.visibility = 'visible';
        console.log('用户管理菜单项已强制显示');
        console.log('菜单项当前样式:', userManagementMenuItem.style.cssText);
    } else {
        console.error('未找到用户管理菜单项！');
    }
}

// 强制刷新用户管理菜单项显示
function forceShowUserManagement() {
    console.log('=== forceShowUserManagement 被调用 ===');
    const userManagementMenuItem = document.getElementById('userManagementMenuItem');
    console.log('菜单项元素:', userManagementMenuItem);
    console.log('当前用户:', currentUser);
    console.log('用户角色:', currentUser ? currentUser.role : '未定义');
    
    if (userManagementMenuItem) {
        console.log('强制显示用户管理菜单项，无论用户角色');
        userManagementMenuItem.style.display = 'block';
        userManagementMenuItem.style.visibility = 'visible';
        userManagementMenuItem.style.opacity = '1';
        userManagementMenuItem.removeAttribute('style');
        userManagementMenuItem.style.display = 'block';
        userManagementMenuItem.style.visibility = 'visible';
        console.log('强制显示完成，当前样式:', userManagementMenuItem.style.cssText);
        console.log('计算样式 display:', window.getComputedStyle(userManagementMenuItem).display);
    } else {
        console.error('未找到用户管理菜单项元素');
    }
}

// 简单的显示函数，绕过所有条件检查
function simpleShowUserManagement() {
    const item = document.getElementById('userManagementMenuItem');
    if (item) {
        item.removeAttribute('style');
        item.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important;';
        console.log('简单显示完成');
    }
}

// 用户菜单控制函数
function toggleUserMenu() {
    console.log('=== toggleUserMenu 被调用 ===');
    const userMenu = document.getElementById('userMenu');
    console.log('用户菜单元素:', userMenu);
    
    if (userMenu) {
        userMenu.classList.toggle('show');
        console.log('菜单显示状态:', userMenu.classList.contains('show'));
        
        // 详细检查用户管理菜单项
        const userManagementMenuItem = document.getElementById('userManagementMenuItem');
        console.log('=== 用户管理菜单项详细信息 ===');
        console.log('元素:', userManagementMenuItem);
        if (userManagementMenuItem) {
            console.log('display:', userManagementMenuItem.style.display);
            console.log('visibility:', userManagementMenuItem.style.visibility);
            console.log('opacity:', userManagementMenuItem.style.opacity);
            console.log('完整样式:', userManagementMenuItem.style.cssText);
            console.log('计算样式 display:', window.getComputedStyle(userManagementMenuItem).display);
            console.log('计算样式 visibility:', window.getComputedStyle(userManagementMenuItem).visibility);
            console.log('元素HTML:', userManagementMenuItem.outerHTML);
            console.log('父元素:', userManagementMenuItem.parentElement);
        } else {
            console.error('未找到用户管理菜单项元素！');
            // 查找所有菜单项
            const allMenuItems = document.querySelectorAll('.menu-item');
            console.log('所有菜单项:', allMenuItems);
            allMenuItems.forEach((item, index) => {
                console.log(`菜单项 ${index}:`, item.outerHTML);
            });
        }
        
        // 检查当前用户信息
        console.log('当前用户:', currentUser);
        console.log('用户角色:', currentUser ? currentUser.role : '未登录');
        
    } else {
        console.error('未找到用户菜单元素！');
    }
}

function closeUserMenu() {
    const userMenu = document.getElementById('userMenu');
    if (userMenu) {
        userMenu.classList.remove('show');
    }
}

// 点击其他地方关闭用户菜单
document.addEventListener('click', function(event) {
    const userInfoPanel = document.getElementById('userInfoPanel');
    const userMenu = document.getElementById('userMenu');
    
    if (userInfoPanel && userMenu && !userInfoPanel.contains(event.target)) {
        userMenu.classList.remove('show');
    }
});

// 退出登录
async function logout() {
    if (!confirm('确定要退出登录吗？')) {
    return;
    }
    
    try {
        const response = await fetch('/api/logout', {
            method: 'POST',
            credentials: 'include'
        });
        
        // 清除本地状态
        currentUser = null;
        isAuthenticated = false;
            window.currentUser = null;
            
        showAlert('已成功退出登录', 'success');
        
        // 延迟跳转到登录页面
        setTimeout(() => {
            window.location.href = '/login';
        }, 1000);
    } catch (error) {
        console.error('退出登录失败:', error);
        showAlert('退出登录失败', 'error');
    }
}

// 显示模块
function showModule(module) {
    console.log('正在切换到模块:', module);
    
    // 权限检查 - 管理员专用功能
    if ((module === 'user-management' || module === 'backup') && 
        (!currentUser || currentUser.role !== 'admin')) {
        console.warn('权限不足，无法访问模块:', module);
        showAlert('权限不足，只有管理员可以访问此功能', 'warning');
        return;
    }
    
    // 隐藏所有模块
    document.querySelectorAll('.module').forEach(m => m.classList.remove('active'));
    
    // 显示指定模块
    const targetModule = document.getElementById(module);
    if (!targetModule) {
        console.error('未找到模块:', module);
        return;
    }
    
    targetModule.classList.add('active', 'page-enter');
    
    // 移除动画类，以便下次使用
    setTimeout(() => {
        targetModule.classList.remove('page-enter');
    }, 500);
    
    // 更新导航栏激活状态
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    
    // 更精确地找到对应的导航链接并激活
    const navbarLinks = document.querySelectorAll('.navbar .nav-link');
    navbarLinks.forEach(link => {
        if (link.onclick && link.onclick.toString().includes(`showModule('${module}')`)) {
            link.classList.add('active');
        }
    });
    
    currentModule = module;
    
    // 关闭快速导航面板
    const panel = document.getElementById('quick-nav');
    const overlay = document.querySelector('.quick-nav-overlay');
    if (panel && panel.classList.contains('active')) {
        panel.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // 更新面包屑导航
    updateBreadcrumb(module);
    
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // 加载对应模块数据
    switch(module) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'house-types':
            loadHouseTypes();
            break;
        case 'landlords':
            loadLandlords();
            break;
        case 'houses':
            // 确保租房数据已加载，然后再加载房屋数据
            loadRentals().then(() => loadHouses());
            break;
        case 'tenants':
            loadTenants();
            break;
        case 'rentals':
            loadRentals();
            break;
        case 'payments':
            loadPayments();
            break;
        case 'statistics':
            loadStatistics();
            break;
        case 'backup':
            // 备份模块不需要加载数据
            break;
        case 'user-management':
            loadUsers();
            break;
        default:
            console.warn('未知模块:', module);
    }
}

// 加载初始数据
async function loadInitialData() {
    try {
        // 先加载基础数据
        await Promise.all([
            loadHouseTypes(),
            loadLandlords(),
            loadTenants()
        ]);
        
        // 然后加载租房记录
        await loadRentals();
        
        // 最后加载房屋和收费数据（这样房屋表格能正确显示租客信息）
        await Promise.all([
            loadHouses(),
            loadPayments()
        ]);
    } catch (error) {
        console.error('加载初始数据失败:', error);
    }
}

// API请求函数
async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            credentials: 'include',
            ...options
        });

        if (response.status === 401) {
            // 未认证，跳转到登录页面
            isAuthenticated = false;
            currentUser = null;
            showAlert('登录已过期，请重新登录', 'warning');
            setTimeout(() => {
            window.location.href = '/login';
            }, 1500);
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API请求失败:', error);
        showAlert('网络请求失败，请检查后端服务是否运行', 'error');
        throw error;
    }
}

// 显示提示消息
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alert-container');
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    alertContainer.appendChild(alertDiv);

    // 2.5 秒后开始淡出
    setTimeout(() => {
        alertDiv.classList.remove('show');
        alertDiv.classList.add('fade-out');
    }, 2500);

    // 3 秒后移除元素
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 3000);
}

// 仪表盘数据加载
async function loadDashboardData() {
    try {
        console.log('开始加载仪表盘数据...');
        
        const [housesData, tenantsData, houseViewData] = await Promise.all([
            apiRequest('/houses'),
            apiRequest('/tenants'),
            apiRequest('/houses/view')
        ]);

        console.log('API返回数据:', { housesData, tenantsData, houseViewData });

        // 确保数据存在且有正确的结构
        const houses = housesData?.data || [];
        const tenants = tenantsData?.data || [];
        const houseView = houseViewData?.data || [];

        const totalHouses = houses.length;
        const rentedHouses = houses.filter(h => h.status === 'rented').length;
        const availableHouses = houses.filter(h => h.status === 'available').length;
        const totalTenants = tenants.length;

        console.log('统计数据:', { totalHouses, rentedHouses, availableHouses, totalTenants });

        // 更新页面显示
        document.getElementById('total-houses').textContent = totalHouses;
        document.getElementById('rented-houses').textContent = rentedHouses;
        document.getElementById('available-houses').textContent = availableHouses;
        document.getElementById('total-tenants').textContent = totalTenants;

        // 更新表格和图表
        updateHouseOverviewTable(houseView);
        updateHouseTypeChart(houses);
        
        // 调整左右卡片高度
        adjustDashboardCardHeights();
        
        console.log('仪表盘数据加载完成');
    } catch (error) {
        console.error('加载仪表盘数据失败:', error);
        showAlert('数据加载失败: ' + error.message, 'error');
        
        // 设置默认值
        document.getElementById('total-houses').textContent = '0';
        document.getElementById('rented-houses').textContent = '0';
        document.getElementById('available-houses').textContent = '0';
        document.getElementById('total-tenants').textContent = '0';
    }
}

// 更新房屋概览表
function updateHouseOverviewTable(houses) {
    const tbody = document.getElementById('house-overview-table');
    tbody.innerHTML = '';
    
    houses.slice(0, 10).forEach(house => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${house.房号}</td>
            <td>${house.房东姓名}</td>
            <td><span class="status-badge status-${house.状态}">${getStatusText(house.状态)}</span></td>
            <td>¥${house.租金 || 0}</td>
        `;
        tbody.appendChild(row);
    });
}

// 更新户型分布图表
function updateHouseTypeChart(houses) {
    // 检查Chart.js是否可用
    if (typeof Chart === 'undefined' || !Chart.prototype) {
        console.warn('Chart.js 未加载，跳过图表渲染');
        const chartContainer = document.getElementById('houseTypeChart');
        if (chartContainer) {
            chartContainer.innerHTML = '<p class="text-center">图表功能暂时不可用</p>';
        }
        return;
    }
    
    const ctx = document.getElementById('houseTypeChart').getContext('2d');
    
    // 如果图表已存在，先销毁它
    if (houseTypeChart) {
        houseTypeChart.destroy();
        houseTypeChart = null;
    }
    
    const typeCount = {};
    houses.forEach(house => {
        const typeName = house.house_type ? house.house_type.type_name : '未知';
        typeCount[typeName] = (typeCount[typeName] || 0) + 1;
    });
    
    try {
        houseTypeChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(typeCount),
                datasets: [{
                    data: Object.values(typeCount),
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    } catch (error) {
        console.error('图表创建失败:', error);
        const chartContainer = document.getElementById('houseTypeChart');
        if (chartContainer) {
            chartContainer.innerHTML = '<p class="text-center">图表创建失败</p>';
        }
    }
}

// 获取状态文本
function getStatusText(status) {
    const statusMap = {
        'available': '可出租',
        'rented': '已出租',
        'active': '租赁中',
        'expired': '已到期',
        'terminated': '已终止',
        'history': '历史订单'
    };
    return statusMap[status] || status;
}

// 户型管理相关函数
async function loadHouseTypes() {
    try {
        const data = await apiRequest('/house_types');
        houseTypes = data.data;
        updateHouseTypesTable();
    } catch (error) {
        console.error('加载户型数据失败:', error);
    }
}

function updateHouseTypesTable() {
    const tbody = document.getElementById('house-types-table');
    tbody.innerHTML = '';
    
    houseTypes.forEach(type => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${type.id}</td>
            <td>${type.type_name}</td>
            <td>${type.description || ''}</td>
            <td>${formatDateTime(type.created_at)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="editHouseType(${type.id})">
                        <i class="fas fa-edit"></i> 编辑
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteHouseType(${type.id})">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function showAddHouseTypeModal() {
    showModal('添加户型', `
        <form id="houseTypeForm">
            <div class="mb-3">
                <label class="form-label">户型名称</label>
                <input type="text" class="form-control" id="typeName" required>
            </div>
            <div class="mb-3">
                <label class="form-label">描述</label>
                <textarea class="form-control" id="typeDescription" rows="3"></textarea>
            </div>
        </form>
    `, 'saveHouseType()');
}

async function saveHouseType() {
    // 获取表单数据
    const typeName = document.getElementById('typeName').value.trim();
    const description = document.getElementById('typeDescription').value.trim();
    
    // 表单验证
    if (!typeName) {
        showAlert('请输入户型名称', 'error');
        document.getElementById('typeName').focus();
        return;
    }
    
    if (typeName.length > 50) {
        showAlert('户型名称不能超过50个字符', 'error');
        document.getElementById('typeName').focus();
        return;
    }
    
    // 检查户型名称是否已存在
    const existingType = houseTypes.find(t => t.type_name === typeName);
    if (existingType) {
        showAlert('该户型名称已存在，请使用其他名称', 'error');
        document.getElementById('typeName').focus();
        return;
    }
    
    try {
        await apiRequest('/house_types', {
            method: 'POST',
            body: JSON.stringify({
                type_name: typeName,
                description: description || null
            })
        });
        
        showAlert('户型创建成功', 'success');
        closeModal();
        loadHouseTypes();
    } catch (error) {
        showAlert('创建失败: ' + error.message, 'error');
    }
}

async function deleteHouseType(id) {
    if (confirm('确定要删除这个户型吗？')) {
        try {
            await apiRequest(`/house_types/${id}`, {
                method: 'DELETE'
            });
            
            showAlert('户型删除成功', 'success');
            loadHouseTypes();
        } catch (error) {
            showAlert('删除失败', 'error');
        }
    }
}

// 房东管理相关函数
async function loadLandlords() {
    try {
        const data = await apiRequest('/landlords');
        landlords = data.data;
        updateLandlordsTable();
    } catch (error) {
        console.error('加载房东数据失败:', error);
    }
}

function updateLandlordsTable() {
    const tbody = document.getElementById('landlords-table');
    tbody.innerHTML = '';
    
    landlords.forEach(landlord => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${landlord.id}</td>
            <td>${landlord.name}</td>
            <td>${landlord.phone}</td>
            <td>${landlord.email || ''}</td>
            <td>${landlord.id_card || ''}</td>
            <td>${landlord.address || ''}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="editLandlord(${landlord.id})">
                        <i class="fas fa-edit"></i> 编辑
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteLandlord(${landlord.id})">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function showAddLandlordModal() {
    showModal('添加房东', `
        <form id="landlordForm">
            <div class="mb-3">
                <label class="form-label">姓名</label>
                <input type="text" class="form-control" id="landlordName" required>
            </div>
            <div class="mb-3">
                <label class="form-label">电话</label>
                <input type="text" class="form-control" id="landlordPhone" required>
            </div>
            <div class="mb-3">
                <label class="form-label">邮箱</label>
                <input type="email" class="form-control" id="landlordEmail">
            </div>
            <div class="mb-3">
                <label class="form-label">身份证号</label>
                <input type="text" class="form-control" id="landlordIdCard">
            </div>
            <div class="mb-3">
                <label class="form-label">地址</label>
                <input type="text" class="form-control" id="landlordAddress">
            </div>
        </form>
    `, 'saveLandlord()');
}

async function saveLandlord() {
    // 获取表单数据
    const name = document.getElementById('landlordName').value.trim();
    const phone = document.getElementById('landlordPhone').value.trim();
    const email = document.getElementById('landlordEmail').value.trim();
    const idCard = document.getElementById('landlordIdCard').value.trim();
    const address = document.getElementById('landlordAddress').value.trim();
    
    // 表单验证
    if (!name) {
        showAlert('请输入房东姓名', 'error');
        document.getElementById('landlordName').focus();
        return;
    }
    
    if (!phone) {
        showAlert('请输入手机号码', 'error');
        document.getElementById('landlordPhone').focus();
        return;
    }
    
    // 手机号格式验证
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
        showAlert('请输入正确的手机号码格式', 'error');
        document.getElementById('landlordPhone').focus();
        return;
    }
    
    // 邮箱格式验证（如果填写了）
    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showAlert('请输入正确的邮箱格式', 'error');
            document.getElementById('landlordEmail').focus();
            return;
        }
    }
    
    // 身份证格式验证（如果填写了）
    if (idCard) {
        const idCardRegex = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
        if (!idCardRegex.test(idCard)) {
            showAlert('请输入正确的身份证号码格式', 'error');
            document.getElementById('landlordIdCard').focus();
            return;
        }
    }
    
    // 检查手机号是否已存在
    const existingLandlord = landlords.find(l => l.phone === phone);
    if (existingLandlord) {
        showAlert('该手机号已存在，请使用其他手机号', 'error');
        document.getElementById('landlordPhone').focus();
        return;
    }
    
    // 检查身份证是否已存在（如果填写了）
    if (idCard) {
        const existingIdCard = landlords.find(l => l.id_card === idCard);
        if (existingIdCard) {
            showAlert('该身份证号已存在，请检查输入', 'error');
            document.getElementById('landlordIdCard').focus();
            return;
        }
    }
    
    const formData = {
        name: name,
        phone: phone,
        email: email || null,
        id_card: idCard || null,
        address: address || null
    };
    
    try {
        await apiRequest('/landlords', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        showAlert('房东信息创建成功', 'success');
        closeModal();
        loadLandlords();
    } catch (error) {
        showAlert('创建失败: ' + error.message, 'error');
    }
}

// 房屋管理相关函数
async function loadHouses() {
    try {
        const data = await apiRequest('/houses');
        houses = data.data;
        updateHousesTable();
    } catch (error) {
        console.error('加载房屋数据失败:', error);
    }
}

function updateHousesTable() {
    const tbody = document.getElementById('houses-table');
    tbody.innerHTML = '';
    

    
    houses.forEach(house => {
        // 查找当前租客信息 - 使用嵌套的house.id而不是house_id
        const currentRental = rentals.find(r => r.house && r.house.id === house.id && r.status === 'active');
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${house.house_number}</td>
            <td>${house.address}</td>
            <td>${house.area || ''}</td>
            <td>¥${house.rent_price || 0}</td>
            <td>¥${house.deposit || 0}</td>
            <td><span class="status-badge status-${house.status}">${getStatusText(house.status)}</span></td>
            <td>${house.house_type ? house.house_type.type_name : ''}</td>
            <td>${house.landlord ? house.landlord.id : ''}</td>
            <td>${house.landlord ? house.landlord.name : ''}</td>
            <td>${currentRental && currentRental.tenant ? currentRental.tenant.id : '<i class="fas fa-minus-circle" style="color: #ccc;"></i>'}</td>
            <td>${currentRental && currentRental.tenant ? currentRental.tenant.name : '<i class="fas fa-minus-circle" style="color: #ccc;"></i>'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="editHouse(${house.id})">
                        <i class="fas fa-edit"></i> 编辑
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteHouse(${house.id})">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function showAddHouseModal() {
    const houseTypeOptions = houseTypes.map(type => 
        `<option value="${type.id}">${type.type_name}</option>`
    ).join('');
    
    const landlordOptions = landlords.map(landlord => 
        `<option value="${landlord.id}">${landlord.name}</option>`
    ).join('');
    
    showModal('添加房屋', `
        <form id="houseForm">
            <div class="mb-3">
                <label class="form-label">房号</label>
                <input type="text" class="form-control" id="houseNumber" required>
            </div>
            <div class="mb-3">
                <label class="form-label">地址</label>
                <input type="text" class="form-control" id="houseAddress" required>
            </div>
            <div class="mb-3">
                <label class="form-label">面积(平方米)</label>
                <input type="number" class="form-control" id="houseArea" step="0.01">
            </div>
            <div class="mb-3">
                <label class="form-label">租金</label>
                <input type="number" class="form-control" id="houseRent" required step="0.01">
            </div>
            <div class="mb-3">
                <label class="form-label">押金</label>
                <input type="number" class="form-control" id="houseDeposit" step="0.01">
            </div>
            <div class="mb-3">
                <label class="form-label">户型</label>
                <select class="form-control" id="houseType" required>
                    <option value="">选择户型</option>
                    ${houseTypeOptions}
                </select>
            </div>
            <div class="mb-3">
                <label class="form-label">房东</label>
                <select class="form-control" id="houseLandlord" required>
                    <option value="">选择房东</option>
                    ${landlordOptions}
                </select>
            </div>
            <div class="mb-3">
                <label class="form-label">描述</label>
                <textarea class="form-control" id="houseDescription" rows="3"></textarea>
            </div>
        </form>
    `, 'saveHouse()');
}

async function saveHouse() {
    // 获取表单数据
    const houseNumber = document.getElementById('houseNumber').value.trim();
    const address = document.getElementById('houseAddress').value.trim();
    const area = document.getElementById('houseArea').value;
    const rentPrice = document.getElementById('houseRent').value;
    const deposit = document.getElementById('houseDeposit').value;
    const typeId = document.getElementById('houseType').value;
    const landlordId = document.getElementById('houseLandlord').value;
    const description = document.getElementById('houseDescription').value.trim();
    
    // 表单验证
    if (!houseNumber) {
        showAlert('请输入房号', 'error');
        document.getElementById('houseNumber').focus();
        return;
    }
    
    if (!address) {
        showAlert('请输入房屋地址', 'error');
        document.getElementById('houseAddress').focus();
        return;
    }
    
    if (!rentPrice || parseFloat(rentPrice) <= 0) {
        showAlert('请输入有效的租金价格（必须大于0）', 'error');
        document.getElementById('houseRent').focus();
        return;
    }
    
    if (!typeId || typeId === '') {
        showAlert('请选择房屋类型', 'error');
        document.getElementById('houseType').focus();
        return;
    }
    
    if (!landlordId || landlordId === '') {
        showAlert('请选择房东', 'error');
        document.getElementById('houseLandlord').focus();
        return;
    }
    
    // 面积验证（如果填写了）
    if (area && parseFloat(area) <= 0) {
        showAlert('房屋面积必须大于0', 'error');
        document.getElementById('houseArea').focus();
        return;
    }
    
    // 押金验证（如果填写了）
    if (deposit && parseFloat(deposit) < 0) {
        showAlert('押金不能为负数', 'error');
        document.getElementById('houseDeposit').focus();
        return;
    }
    
    // 检查房号是否已存在
    const existingHouse = houses.find(h => h.house_number === houseNumber);
    if (existingHouse) {
        showAlert('房号已存在，请使用其他房号', 'error');
        document.getElementById('houseNumber').focus();
        return;
    }
    
    // 检查房屋类型是否存在
    const selectedType = houseTypes.find(t => t.id == typeId);
    if (!selectedType) {
        showAlert('所选房屋类型不存在，请重新选择', 'error');
        document.getElementById('houseType').focus();
        return;
    }
    
    // 检查房东是否存在
    const selectedLandlord = landlords.find(l => l.id == landlordId);
    if (!selectedLandlord) {
        showAlert('所选房东不存在，请重新选择', 'error');
        document.getElementById('houseLandlord').focus();
        return;
    }
    
    const formData = {
        house_number: houseNumber,
        address: address,
        area: area ? parseFloat(area) : null,
        rent_price: parseFloat(rentPrice),
        deposit: deposit ? parseFloat(deposit) : null,
        type_id: parseInt(typeId),
        landlord_id: parseInt(landlordId),
        description: description
    };
    
    try {
        await apiRequest('/houses', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        showAlert('房屋信息创建成功', 'success');
        closeModal();
        loadHouses();
    } catch (error) {
        showAlert('创建失败: ' + error.message, 'error');
    }
}

// 租客管理相关函数
async function loadTenants() {
    try {
        const data = await apiRequest('/tenants');
        tenants = data.data;
        updateTenantsTable();
    } catch (error) {
        console.error('加载租客数据失败:', error);
    }
}

function updateTenantsTable() {
    const tbody = document.getElementById('tenants-table');
    tbody.innerHTML = '';
    
    tenants.forEach(tenant => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${tenant.id}</td>
            <td>${tenant.name}</td>
            <td>${tenant.phone}</td>
            <td>${tenant.email || ''}</td>
            <td>${tenant.id_card || ''}</td>
            <td>${tenant.address || ''}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="editTenant(${tenant.id})">
                        <i class="fas fa-edit"></i> 编辑
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteTenant(${tenant.id})">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function showAddTenantModal() {
    showModal('添加租客', `
        <form id="tenantForm">
            <div class="mb-3">
                <label class="form-label">姓名</label>
                <input type="text" class="form-control" id="tenantName" required>
            </div>
            <div class="mb-3">
                <label class="form-label">电话</label>
                <input type="text" class="form-control" id="tenantPhone" required>
            </div>
            <div class="mb-3">
                <label class="form-label">邮箱</label>
                <input type="email" class="form-control" id="tenantEmail">
            </div>
            <div class="mb-3">
                <label class="form-label">身份证号</label>
                <input type="text" class="form-control" id="tenantIdCard">
            </div>
            <div class="mb-3">
                <label class="form-label">地址</label>
                <input type="text" class="form-control" id="tenantAddress">
            </div>
        </form>
    `, 'saveTenant()');
}

async function saveTenant() {
    // 获取表单数据
    const name = document.getElementById('tenantName').value.trim();
    const phone = document.getElementById('tenantPhone').value.trim();
    const email = document.getElementById('tenantEmail').value.trim();
    const idCard = document.getElementById('tenantIdCard').value.trim();
    const address = document.getElementById('tenantAddress').value.trim();
    
    // 表单验证
    if (!name) {
        showAlert('请输入租客姓名', 'error');
        document.getElementById('tenantName').focus();
        return;
    }
    
    if (!phone) {
        showAlert('请输入手机号码', 'error');
        document.getElementById('tenantPhone').focus();
        return;
    }
    
    // 手机号格式验证
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
        showAlert('请输入正确的手机号码格式', 'error');
        document.getElementById('tenantPhone').focus();
        return;
    }
    
    // 邮箱格式验证（如果填写了）
    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showAlert('请输入正确的邮箱格式', 'error');
            document.getElementById('tenantEmail').focus();
            return;
        }
    }
    
    // 身份证格式验证（如果填写了）
    if (idCard) {
        const idCardRegex = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
        if (!idCardRegex.test(idCard)) {
            showAlert('请输入正确的身份证号码格式', 'error');
            document.getElementById('tenantIdCard').focus();
            return;
        }
    }
    
    // 检查手机号是否已存在
    const existingTenant = tenants.find(t => t.phone === phone);
    if (existingTenant) {
        showAlert('该手机号已存在，请使用其他手机号', 'error');
        document.getElementById('tenantPhone').focus();
        return;
    }
    
    // 检查身份证是否已存在（如果填写了）
    if (idCard) {
        const existingIdCard = tenants.find(t => t.id_card === idCard);
        if (existingIdCard) {
            showAlert('该身份证号已存在，请检查输入', 'error');
            document.getElementById('tenantIdCard').focus();
            return;
        }
    }
    
    const formData = {
        name: name,
        phone: phone,
        email: email || null,
        id_card: idCard || null,
        address: address || null
    };
    
    try {
        await apiRequest('/tenants', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        showAlert('租客信息创建成功', 'success');
        closeModal();
        loadTenants();
    } catch (error) {
        showAlert('创建失败: ' + error.message, 'error');
    }
}

// 租房记录相关函数
async function loadRentals() {
    try {
        const data = await apiRequest('/rentals');
        rentals = data.data;
        updateRentalsTable();
    } catch (error) {
        console.error('加载租房记录失败:', error);
    }
}

// 计算租房记录的缴费状态
function calculatePaymentStatus(rental) {
    if (!rental || !rental.id) return '未知';
    
    // 查找该租房记录的所有收费记录
    const rentalPayments = payments.filter(p => p.rental && p.rental.id === rental.id);
    
    if (rentalPayments.length === 0) {
        return '未缴费';
    }
    
    // 检查是否需要押金和租金两个订单
    const needsDeposit = rental.deposit_paid > 0;
    const hasDepositPayment = rentalPayments.some(p => p.payment_type === 'deposit' && p.payment_status === 'paid');
    const hasRentPayment = rentalPayments.some(p => p.payment_type === 'rent' && p.payment_status === 'paid');
    
    if (needsDeposit) {
        // 需要押金+租金两个订单
        if (hasDepositPayment && hasRentPayment) {
            return '已缴费';
        } else if (hasDepositPayment || hasRentPayment) {
            return '部分缴费';
        } else {
            return '未缴费';
        }
    } else {
        // 只需要租金订单
        if (hasRentPayment) {
            return '已缴费';
        } else {
            return '未缴费';
        }
    }
}

function updateRentalsTable() {
    const tbody = document.getElementById('rentals-table');
    tbody.innerHTML = '';
    
    // 根据当前时间自动更新显示状态（仅前端显示，不更新后端）
    const currentDate = new Date();
    
    rentals.forEach(rental => {
        // 检查租期是否过期
        const endDate = new Date(rental.end_date);
        let displayStatus = rental.status;
        
        // 仅在前端显示层面判断状态，不调用后端API
        if (displayStatus === 'active' && endDate < currentDate) {
            displayStatus = 'history';
            // 自动归还过期的房屋
            autoReturnExpiredRental(rental.id);
        }
        
        // 计算缴费状态
        const paymentStatus = calculatePaymentStatus(rental);
        const paymentStatusClass = paymentStatus === '已缴费' ? 'status-paid' : 
                                   paymentStatus === '部分缴费' ? 'status-partial' : 'status-unpaid';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${rental.contract_number || ''}</td>
            <td>${rental.house ? rental.house.house_number : ''}</td>
            <td>${rental.house ? rental.house.address : ''}</td>
            <td>${rental.house && rental.house.landlord ? rental.house.landlord.id : ''}</td>
            <td>${rental.house && rental.house.landlord ? rental.house.landlord.name : ''}</td>
            <td>${rental.tenant ? rental.tenant.id : ''}</td>
            <td>${rental.tenant ? rental.tenant.name : ''}</td>
            <td>${rental.start_date}</td>
            <td>${rental.end_date}</td>
            <td>¥${rental.monthly_rent}</td>
            <td>¥${rental.house ? rental.house.deposit || 0 : 0}</td>
            <td><span class="status-badge status-${displayStatus}">${getStatusText(displayStatus)}</span></td>
            <td><span class="status-badge ${paymentStatusClass}">${paymentStatus}</span></td>
            <td>
                <div class="action-buttons">
                    ${displayStatus === 'active' ? 
                        `<button class="btn btn-sm btn-warning" onclick="returnRental(${rental.id})">
                            <i class="fas fa-undo"></i> 归还
                        </button>` : ''
                    }
                    ${currentUser && currentUser.role === 'admin' ? 
                        `<button class="btn btn-sm btn-danger" onclick="deleteRental(${rental.id})">
                        <i class="fas fa-trash"></i> 删除
                        </button>` : ''
                    }
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function showAddRentalModal() {
    const houseOptions = houses.filter(h => h.status === 'available').map(house => 
        `<option value="${house.id}" data-rent="${house.rent_price}" data-deposit="${house.deposit}">${house.house_number} - ${house.address}</option>`
    ).join('');
    
    const tenantOptions = tenants.map(tenant => 
        `<option value="${tenant.id}">${tenant.id}-${tenant.name}</option>`
    ).join('');
    
    // 生成唯一合同编号
    const contractNumber = generateContractNumber();
    
    showModal('添加租房记录', `
        <form id="rentalForm">
            <div class="mb-3">
                <label class="form-label">合同编号</label>
                <input type="text" class="form-control" id="contractNumber" readonly style="background-color: #f8f9fa;" value="${contractNumber}">
                <div class="form-text">系统自动生成，格式：HT+年月日时分秒</div>
            </div>
            <div class="mb-3">
                <label class="form-label">房屋</label>
                <select class="form-control" id="rentalHouse" required onchange="updateRentalInfo()">
                    <option value="">选择房屋</option>
                    ${houseOptions}
                </select>
            </div>
            <div class="mb-3">
                <label class="form-label">租客</label>
                <select class="form-control" id="rentalTenant" required>
                    <option value="">选择租客</option>
                    ${tenantOptions}
                </select>
            </div>
            <div class="mb-3">
                <label class="form-label">开始日期</label>
                <input type="date" class="form-control" id="startDate" required onchange="calculateEndDate()">
            </div>
            <div class="mb-3">
                <label class="form-label">租赁时间（月）</label>
                <input type="number" class="form-control" id="rentalDuration" required onchange="calculateEndDate()" oninput="calculateEndDate()" min="1" max="120" placeholder="请输入租赁月数（1-120个月）">
                <div class="form-text rental-duration-tip">建议：短租1-6个月，长租12-36个月（按30天/月计算）</div>
            </div>
            <div class="mb-3">
                <label class="form-label">结束日期</label>
                <input type="date" class="form-control" id="endDate" readonly style="background-color: #f8f9fa;">
            </div>
            <div class="mb-3">
                <label class="form-label">月租金</label>
                <input type="number" class="form-control" id="monthlyRent" readonly step="0.01" style="background-color: #f8f9fa;">
                <div class="form-text">根据选择的房屋自动获取</div>
            </div>
            <div class="mb-3">
                <label class="form-label">押金</label>
                <input type="number" class="form-control" id="depositPaid" readonly step="0.01" style="background-color: #f8f9fa;">
                <div class="form-text">根据选择的房屋自动获取</div>
            </div>
        </form>
    `, 'saveRental()');
}

// 生成唯一合同编号
function generateContractNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    // 生成基础合同编号：HT + 年月日 + 时分秒
    let baseNumber = `HT${year}${month}${day}${hours}${minutes}${seconds}`;
    
    // 检查是否与现有合同编号重复（如果rentals数组已加载）
    if (rentals && rentals.length > 0) {
        let counter = 1;
        let contractNumber = baseNumber;
        
        while (rentals.some(rental => rental.contract_number === contractNumber)) {
            contractNumber = `${baseNumber}_${counter}`;
            counter++;
        }
        
        return contractNumber;
    }
    
    return baseNumber;
}

// 更新租房信息（根据选择的房屋自动填充租金和押金）
function updateRentalInfo() {
    const houseSelect = document.getElementById('rentalHouse');
    const selectedOption = houseSelect.options[houseSelect.selectedIndex];
    
    if (selectedOption.value) {
        const monthlyRent = selectedOption.getAttribute('data-rent');
        const deposit = selectedOption.getAttribute('data-deposit');
        
        document.getElementById('monthlyRent').value = monthlyRent;
        document.getElementById('depositPaid').value = deposit;
    } else {
        document.getElementById('monthlyRent').value = '';
        document.getElementById('depositPaid').value = '';
    }
}

// 计算结束日期（按30天/月计算）
function calculateEndDate() {
    const startDate = document.getElementById('startDate').value;
    const duration = parseInt(document.getElementById('rentalDuration').value);
    
    if (startDate && duration && duration > 0) {
        const start = new Date(startDate);
        const end = new Date(start);
        
        // 按30天/月计算，避免月份天数差异
        const totalDays = duration * 30;
        end.setDate(end.getDate() + totalDays);
        
        // 格式化日期为 YYYY-MM-DD
        const endDateStr = end.toISOString().split('T')[0];
        document.getElementById('endDate').value = endDateStr;
        
        // 更新提示信息
        const tipElement = document.querySelector('.rental-duration-tip');
        if (tipElement) {
            tipElement.textContent = `建议: 短租1-6个月，长租12-36个月（按30天/月计算）`;
        }
    } else {
        document.getElementById('endDate').value = '';
    }
}

async function saveRental() {
    // 获取表单数据
    const contractNumber = document.getElementById('contractNumber').value.trim();
    const houseId = document.getElementById('rentalHouse').value;
    const tenantId = document.getElementById('rentalTenant').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const monthlyRent = document.getElementById('monthlyRent').value;
    const depositPaid = document.getElementById('depositPaid').value;
    
    // 表单验证
    if (!contractNumber) {
        showAlert('请输入合同号', 'error');
        document.getElementById('contractNumber').focus();
        return;
    }
    
    if (!houseId || houseId === '') {
        showAlert('请选择房屋', 'error');
        document.getElementById('rentalHouse').focus();
        return;
    }
    
    if (!tenantId || tenantId === '') {
        showAlert('请选择租客', 'error');
        document.getElementById('rentalTenant').focus();
        return;
    }
    
    if (!startDate) {
        showAlert('请选择开始日期', 'error');
        document.getElementById('startDate').focus();
        return;
    }
    
    if (!endDate) {
        showAlert('请选择结束日期', 'error');
        document.getElementById('endDate').focus();
        return;
    }
    
    if (!monthlyRent || parseFloat(monthlyRent) <= 0) {
        showAlert('请输入有效的月租金（必须大于0）', 'error');
        document.getElementById('monthlyRent').focus();
        return;
    }
    
    if (!depositPaid || parseFloat(depositPaid) < 0) {
        showAlert('请输入有效的押金（不能为负数）', 'error');
        document.getElementById('depositPaid').focus();
        return;
    }
    
    // 日期验证
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (start >= end) {
        showAlert('结束日期必须晚于开始日期', 'error');
        document.getElementById('endDate').focus();
        return;
    }
    
    if (start < today) {
        showAlert('开始日期不能早于今天', 'error');
        document.getElementById('startDate').focus();
        return;
    }
    
    // 检查房屋是否可用
    const selectedHouse = houses.find(h => h.id == houseId);
    if (selectedHouse && selectedHouse.status !== 'available') {
        showAlert('所选房屋当前不可出租，请选择其他房屋', 'error');
        document.getElementById('rentalHouse').focus();
        return;
    }
    
    // 检查租客是否存在
    const selectedTenant = tenants.find(t => t.id == tenantId);
    if (!selectedTenant) {
        showAlert('所选租客不存在，请重新选择', 'error');
        document.getElementById('rentalTenant').focus();
        return;
    }
    
    const formData = {
        contract_number: contractNumber,
        house_id: parseInt(houseId),
        tenant_id: parseInt(tenantId),
        start_date: startDate,
        end_date: endDate,
        monthly_rent: parseFloat(monthlyRent),
        deposit_paid: parseFloat(depositPaid)
    };
    
    try {
        // 创建租房记录
        const rentalResponse = await apiRequest('/rentals', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        const rentalId = rentalResponse.data.id;
        
        // 自动生成收费订单
        await createInitialPaymentOrders(rentalId, formData);
        
        showAlert('租房记录创建成功，已自动生成收费订单', 'success');
        closeModal();
        loadRentals();
        loadHouses();
        loadPayments(); // 刷新收费记录
    } catch (error) {
        showAlert('创建失败: ' + error.message, 'error');
    }
}

// 创建初始收费订单
async function createInitialPaymentOrders(rentalId, rentalData) {
    const today = new Date().toISOString().split('T')[0];
    
    try {
        // 如果押金大于0，创建押金订单
        if (rentalData.deposit_paid > 0) {
            await apiRequest('/payments', {
                method: 'POST',
                body: JSON.stringify({
                    payment_date: today,
                    amount: rentalData.deposit_paid,
                    payment_type: 'deposit',
                    payment_method: 'transfer',
                    payment_status: 'pending',
                    description: '押金',
                    contract_number: rentalData.contract_number,
                    rental_id: rentalId
                })
            });
        }
        
        // 计算整个租期的租金
        const startDate = new Date(rentalData.start_date);
        const endDate = new Date(rentalData.end_date);
        const timeDiff = endDate.getTime() - startDate.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        const months = Math.round(daysDiff / 30); // 按30天/月计算
        const totalRent = rentalData.monthly_rent * months;
        
        // 创建整个租期的租金订单
        await apiRequest('/payments', {
            method: 'POST',
            body: JSON.stringify({
                payment_date: today,
                amount: totalRent,
                payment_type: 'rent',
                payment_method: 'transfer',
                payment_status: 'pending',
                description: `租金(租期${months}个月)`,
                contract_number: rentalData.contract_number,
                rental_id: rentalId
            })
        });
        
        console.log('收费订单创建成功');
    } catch (error) {
        console.error('创建收费订单失败:', error);
        throw new Error('收费订单创建失败');
    }
}

async function updateRentalStatus(id, status) {
    try {
        // 检查后端是否支持状态更新API
        const response = await fetch(`${API_BASE_URL}/rentals/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: status })
        });
        
        if (response.status === 405) {
            // 后端不支持此API，静默忽略
            console.log('后端暂不支持租房状态更新API，跳过自动状态更新');
            return;
        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // 如果状态变为历史订单，自动归还房屋
        if (status === 'history' || status === 'expired') {
            await apiRequest(`/rentals/${id}/return`, {
                method: 'POST',
                body: JSON.stringify({})
            });
        }
    } catch (error) {
        // 静默处理错误，避免在控制台显示
        if (error.message.includes('405')) {
            console.log('后端暂不支持租房状态更新API');
        } else {
            console.error('更新租房状态失败:', error);
        }
    }
}

// 用于跟踪已处理的过期租房记录
let processedExpiredRentals = new Set();

// 自动归还过期租房的房屋（不更新租房状态，只归还房屋）
async function autoReturnExpiredRental(rentalId) {
    try {
        // 检查是否已经处理过这个租房记录
        if (processedExpiredRentals.has(rentalId)) {
            return; // 已经处理过，避免重复调用
        }
        
        console.log(`检测到过期租房，自动归还房屋 - 租房ID: ${rentalId}`);
        
        await apiRequest(`/rentals/${rentalId}/return`, {
            method: 'POST',
            body: JSON.stringify({})
        });
        
        // 标记为已处理
        processedExpiredRentals.add(rentalId);
        
        console.log(`租房 ID ${rentalId} 的房屋已自动归还`);
        showAlert('检测到过期租房，房屋已自动归还', 'info');
        
        // 重新加载相关数据以反映变化
        setTimeout(() => {
            loadHouses();
            loadRentals();
        }, 1000);
        
    } catch (error) {
        console.error('自动归还房屋失败:', error);
        showAlert('自动归还房屋失败', 'error');
    }
}

async function returnRental(id) {
    // 查找该租房记录
    const rental = rentals.find(r => r.id === id);
    if (!rental) {
        showAlert('找不到租房记录', 'error');
        return;
    }
    
    // 重新加载支付数据以确保数据是最新的
    try {
        const data = await apiRequest('/payments');
        payments = data.data;
    } catch (error) {
        console.error('加载支付数据失败:', error);
    }
    
    // 检查是否有已缴费的押金
    const depositPayment = payments.find(p => 
        p.rental_id === id && 
        p.payment_type === 'deposit' && 
        p.payment_status === 'paid'
    );
    
    if (depositPayment) {
        // 有已缴费的押金，显示归还确认卡片
        showDepositReturnModal(id, rental, depositPayment);
    } else {
        // 没有押金或押金未缴费，直接确认归还
    if (confirm('确定要归还这个房屋吗？')) {
        try {
            await apiRequest(`/rentals/${id}/return`, {
                    method: 'POST',
                    body: JSON.stringify({})
            });
            
            showAlert('房屋归还成功', 'success');
            loadRentals();
            loadHouses();
        } catch (error) {
            showAlert('归还失败', 'error');
            }
        }
    }
}

// 收费记录相关函数
async function loadPayments() {
    try {
        const data = await apiRequest('/payments');
        payments = data.data;
        updatePaymentsTable();
    } catch (error) {
        console.error('加载收费记录失败:', error);
    }
}

function updatePaymentsTable() {
    const tbody = document.getElementById('payments-table');
    tbody.innerHTML = '';
    
    payments.forEach(payment => {
        // 获取缴费状态
        const paymentStatus = payment.payment_status || 'pending';
        let statusClass, statusText;
        
        if (paymentStatus === 'paid') {
            statusClass = 'status-paid';
            statusText = '已缴费';
        } else if (paymentStatus === 'returned') {
            statusClass = 'status-returned';
            statusText = '已退还';
        } else {
            statusClass = 'status-unpaid';
            statusText = '待缴费';
        }
        
        // 计算说明信息，如果是租金类型则显示租赁时长
        let descriptionText = payment.description || '';
        if (payment.payment_type === 'rent' && payment.rental) {
            // 直接使用数据库中的monthly_rent作为单月租金
            const monthlyRent = payment.rental.monthly_rent || 0;
            
            if (monthlyRent > 0) {
                // 计算支付的月份数
                const monthsPaid = Math.round(payment.amount / monthlyRent);
            descriptionText = descriptionText ? 
                    `${descriptionText} (租期${monthsPaid}个月)` : 
                    `租期${monthsPaid}个月`;
            }
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${payment.id}</td>
            <td>${payment.payment_date}</td>
            <td>¥${payment.amount}</td>
            <td>${getPaymentTypeText(payment.payment_type)}</td>
            <td>${getPaymentMethodText(payment.payment_method)}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>${descriptionText}</td>
            <td>${payment.rental ? payment.rental.contract_number || `租房记录${payment.rental.id}` : ''}</td>
            <td>${payment.rental && payment.rental.tenant ? payment.rental.tenant.id : ''}</td>
            <td>${payment.rental && payment.rental.tenant ? payment.rental.tenant.name : ''}</td>
            <td>${payment.rental && payment.rental.house && payment.rental.house.landlord ? payment.rental.house.landlord.id : ''}</td>
            <td>${payment.rental && payment.rental.house && payment.rental.house.landlord ? payment.rental.house.landlord.name : ''}</td>
            <td>
                <div class="action-buttons">
                    ${paymentStatus === 'pending' ? 
                        `<button class="btn btn-sm btn-success" onclick="showPaymentConfirmModal(${payment.id})">
                            <i class="fas fa-credit-card"></i> 缴费
                        </button>` : ''
                    }
                    ${currentUser && currentUser.role === 'admin' ? 
                        `<button class="btn btn-sm btn-danger" onclick="deletePayment(${payment.id})">
                        <i class="fas fa-trash"></i> 删除
                        </button>` : ''
                    }
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// 计算租赁时长（月数）
function calculateRentalDuration(rental) {
    if (!rental || !rental.start_date || !rental.end_date) {
        return 0;
    }
    
    const startDate = new Date(rental.start_date);
    const endDate = new Date(rental.end_date);
    
    // 计算天数差异
    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    // 按30天/月计算
    const months = Math.round(daysDiff / 30);
    
    return months > 0 ? months : 1; // 至少显示1个月
}

function showAddPaymentModal() {
    const rentalOptions = rentals.filter(r => r.status === 'active').map(rental => 
        `<option value="${rental.id}">${rental.contract_number || `租房记录${rental.id}`}</option>`
    ).join('');
    
    showModal('添加收费记录', `
        <form id="paymentForm">
            <div class="mb-3">
                <label class="form-label">租房记录</label>
                <select class="form-control" id="paymentRental" required>
                    <option value="">选择租房记录</option>
                    ${rentalOptions}
                </select>
            </div>
            <div class="mb-3">
                <label class="form-label">缴费日期</label>
                <input type="date" class="form-control" id="paymentDate" required>
            </div>
            <div class="mb-3">
                <label class="form-label">金额</label>
                <input type="number" class="form-control" id="paymentAmount" required step="0.01">
            </div>
            <div class="mb-3">
                <label class="form-label">缴费类型</label>
                <select class="form-control" id="paymentType" required>
                    <option value="">选择类型</option>
                    <option value="rent">租金</option>
                    <option value="deposit">押金</option>
                    <option value="utilities">水电费</option>
                    <option value="penalty">违约金</option>
                </select>
            </div>
            <div class="mb-3">
                <label class="form-label">支付方式</label>
                <select class="form-control" id="paymentMethod" required>
                    <option value="cash">现金</option>
                    <option value="transfer">转账</option>
                    <option value="alipay">支付宝</option>
                    <option value="wechat">微信</option>
                </select>
            </div>
            <div class="mb-3">
                <label class="form-label">备注</label>
                <textarea class="form-control" id="paymentDescription" rows="3"></textarea>
            </div>
        </form>
    `, 'savePayment()');
}

async function savePayment() {
    // 获取表单数据
    const rentalId = document.getElementById('paymentRental').value;
    const paymentDate = document.getElementById('paymentDate').value;
    const amount = document.getElementById('paymentAmount').value;
    const paymentType = document.getElementById('paymentType').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const description = document.getElementById('paymentDescription').value;
    
    // 表单验证
    if (!rentalId || rentalId === '') {
        showAlert('请选择租房记录', 'error');
        document.getElementById('paymentRental').focus();
        return;
    }
    
    if (!paymentDate) {
        showAlert('请选择缴费日期', 'error');
        document.getElementById('paymentDate').focus();
        return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
        showAlert('请输入有效的金额（必须大于0）', 'error');
        document.getElementById('paymentAmount').focus();
        return;
    }
    
    if (!paymentType || paymentType === '') {
        showAlert('请选择缴费类型', 'error');
        document.getElementById('paymentType').focus();
        return;
    }
    
    if (!paymentMethod || paymentMethod === '') {
        showAlert('请选择支付方式', 'error');
        document.getElementById('paymentMethod').focus();
        return;
    }
    
    // 日期验证
    const selectedDate = new Date(paymentDate);
    const today = new Date();
    const maxDate = new Date();
    maxDate.setFullYear(today.getFullYear() + 1); // 允许未来一年内的日期
    
    if (selectedDate > maxDate) {
        showAlert('缴费日期不能超过一年后', 'error');
        document.getElementById('paymentDate').focus();
        return;
    }
    
    // 检查租房记录是否存在
    const selectedRental = rentals.find(r => r.id == rentalId);
    if (!selectedRental) {
        showAlert('所选租房记录不存在，请重新选择', 'error');
        document.getElementById('paymentRental').focus();
        return;
    }
    
    const formData = {
        rental_id: parseInt(rentalId),
        payment_date: paymentDate,
        amount: parseFloat(amount),
        payment_type: paymentType,
        payment_method: paymentMethod,
        description: description.trim()
    };
    
    try {
        await apiRequest('/payments', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        showAlert('收费记录创建成功', 'success');
        closeModal();
        loadPayments();
    } catch (error) {
        showAlert('创建失败: ' + error.message, 'error');
    }
}

// 显示缴费确认模态框
function showPaymentConfirmModal(paymentId) {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) {
        showAlert('找不到收费记录', 'error');
        return;
    }
    
    const tenantName = payment.rental?.tenant?.name || '未知租客';
    const contractNumber = payment.contract_number || payment.rental?.contract_number || `租房记录${payment.rental?.id}`;
    const paymentType = getPaymentTypeText(payment.payment_type);
    
    // 计算金额显示信息
    let amountDisplay = `¥${payment.amount}`;
    let amountDetails = '';
    
    // 如果是租金类型，则始终根据本次实际缴费金额计算对应月份数进行展示
    if (payment.payment_type === 'rent' && payment.rental) {
        // 直接使用数据库中的monthly_rent作为单月租金
        const monthlyRent = payment.rental.monthly_rent || 0;
        
        if (monthlyRent > 0) {
            // 计算支付的月份数
            const monthsPaid = Math.round(payment.amount / monthlyRent);
            amountDetails = `<div class="text-muted small">月租金 ¥${monthlyRent} × ${monthsPaid}个月 = ¥${payment.amount}</div>`;
        }
    }
    
    showModal('确认缴费', `
        <div class="payment-confirm-card">
            <div class="payment-info">
                <h6 class="mb-3"><i class="fas fa-info-circle text-primary"></i> 缴费信息</h6>
                <div class="row mb-2">
                    <div class="col-4"><strong>租客：</strong></div>
                    <div class="col-8">${tenantName}</div>
                </div>
                <div class="row mb-2">
                    <div class="col-4"><strong>合同号：</strong></div>
                    <div class="col-8">${contractNumber}</div>
                </div>
                <div class="row mb-2">
                    <div class="col-4"><strong>缴费类型：</strong></div>
                    <div class="col-8">${paymentType}</div>
                </div>
                <div class="row mb-2">
                    <div class="col-4"><strong>金额：</strong></div>
                    <div class="col-8">
                        <strong>${amountDisplay}</strong>
                        ${amountDetails}
                    </div>
                </div>
                <div class="row mb-3">
                    <div class="col-4"><strong>说明：</strong></div>
                    <div class="col-8">${payment.description || '无'}</div>
                </div>
            </div>
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle"></i> 
                确认后将标记此费用为已缴费，此操作不可撤销！
            </div>
        </div>
    `, `confirmPayment(${paymentId})`);
}

// 确认缴费
async function confirmPayment(paymentId) {
    try {
        await apiRequest(`/payments/${paymentId}/pay`, {
            method: 'POST',
            body: JSON.stringify({})
        });
        
        showAlert('缴费成功！', 'success');
        closeModal();
        loadPayments();
        loadRentals(); // 刷新租房记录以更新缴费状态
    } catch (error) {
        showAlert('缴费失败: ' + error.message, 'error');
    }
}

// 统计分析相关函数
async function loadStatistics() {
    try {
        const data = await apiRequest('/statistics/house_types');
        updateHouseTypeStatistics(data.data);
    } catch (error) {
        console.error('加载统计数据失败:', error);
    }
}

function updateHouseTypeStatistics(stats) {
    const tbody = document.getElementById('statistics-table');
    tbody.innerHTML = '';
    
    stats.forEach(stat => {
        const rentRate = stat.total_houses > 0 ? 
            ((stat.rented_houses / stat.total_houses) * 100).toFixed(1) : 0;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${stat.type_name}</td>
            <td>${stat.total_houses}</td>
            <td>${stat.rented_houses}</td>
            <td>${stat.available_houses}</td>
            <td>${rentRate}%</td>
        `;
        tbody.appendChild(row);
    });
}

// 数据备份和恢复
async function backupData() {
    try {
        showAlert('正在创建SQL备份文件，请稍候...', 'info');
        
        const response = await apiRequest('/backup', {
            method: 'POST',
            body: JSON.stringify({})
        });
        
        const message = `${response.message}\n文件名: ${response.backup_file}\n文件大小: ${response.file_size}`;
        showAlert(message, 'success');
        
        console.log('备份详情:', response);
    } catch (error) {
        showAlert('SQL备份失败，请检查MySQL工具是否可用', 'error');
        console.error('备份错误:', error);
    }
}

// 更新文件名并启用/禁用恢复按钮
function updateFileName() {
    const fileInput = document.getElementById('backupFile');
    const restoreBtn = document.getElementById('restoreBtn');
    
    if (fileInput.files.length > 0) {
        const fileName = fileInput.files[0].name;
        console.log('选择的文件:', fileName);
        
        // 检查文件扩展名
        if (fileName.endsWith('.sql')) {
            restoreBtn.disabled = false;
            restoreBtn.innerHTML = '<i class="fas fa-upload me-1"></i>恢复数据';
        } else {
            restoreBtn.disabled = true;
            restoreBtn.innerHTML = '<i class="fas fa-exclamation-triangle me-1"></i>请选择.sql文件';
            showAlert('请选择.sql格式的备份文件', 'error');
        }
    } else {
        restoreBtn.disabled = true;
        restoreBtn.innerHTML = '<i class="fas fa-upload me-1"></i>恢复数据';
    }
}

async function restoreData() {
    const fileInput = document.getElementById('backupFile');
    
    if (!fileInput.files.length) {
        showAlert('请先选择SQL备份文件', 'error');
        return;
    }
    
    const file = fileInput.files[0];
    const fileName = file.name;
    
    if (!fileName.endsWith('.sql')) {
        showAlert('请选择.sql格式的备份文件', 'error');
        return;
    }
    
    if (!confirm(`确定要从文件 "${fileName}" 恢复数据吗？\n\n此操作将覆盖现有数据，建议先备份当前数据！`)) {
        return;
    }
    
    try {
        showAlert('正在上传并恢复SQL文件，请稍候...', 'info');
        
        // 创建FormData对象上传文件
        const formData = new FormData();
        formData.append('backup_file', file);
        
        const response = await fetch('/api/restore', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        showAlert(result.message, 'success');
        
        // 重新加载所有数据
        setTimeout(() => {
        loadInitialData();
            window.location.reload(); // 刷新页面以确保数据完全更新
        }, 1000);
        
    } catch (error) {
        showAlert('SQL数据恢复失败，请检查文件格式是否正确', 'error');
        console.error('恢复错误:', error);
    }
}

// 工具函数
function getPaymentTypeText(type) {
    const typeMap = {
        'rent': '租金',
        'deposit': '押金',
        'utilities': '水电费',
        'penalty': '违约金'
    };
    return typeMap[type] || type;
}

function getPaymentMethodText(method) {
    const methodMap = {
        'cash': '现金',
        'transfer': '转账',
        'alipay': '支付宝',
        'wechat': '微信'
    };
    return methodMap[method] || method;
}

function formatDateTime(dateTime) {
    return new Date(dateTime).toLocaleString('zh-CN');
}

// 模态框相关函数
function showModal(title, content, onSave) {
    // 更新现有模态框的内容
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = content;
    
    // 更新保存按钮的onclick事件
    const saveBtn = document.getElementById('modalSaveBtn');
    saveBtn.onclick = new Function(onSave);
    
    // 显示模态框
    const modalElement = document.getElementById('dynamicModal');
    const modal = new bootstrap.Modal(modalElement);
    
    // 监听模态框显示事件，优化可访问性
    modalElement.addEventListener('shown.bs.modal', function () {
        // 移除可能导致可访问性问题的 aria-hidden 属性
        modalElement.removeAttribute('aria-hidden');
        
        // 将焦点设置到第一个输入框
        const firstInput = modalElement.querySelector('input, textarea, select');
        if (firstInput) {
            firstInput.focus();
        }
    }, { once: true });
    
    modal.show();
}

function closeModal() {
    const modalElement = document.getElementById('dynamicModal');
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) {
        modal.hide();
    }
    
    // 清理模态框内容，避免内存泄漏
    setTimeout(() => {
        document.getElementById('modalBody').innerHTML = '';
    }, 300); // 等待动画完成
}

// 编辑功能
function editHouseType(id) {
    // 查找要编辑的户型数据
    const houseType = houseTypes.find(type => type.id === id);
    if (!houseType) {
        showAlert('户型数据未找到', 'error');
        return;
    }
    
    // 显示编辑模态框，预填充数据
    showModal('编辑户型', `
        <form id="editHouseTypeForm">
            <div class="mb-3">
                <label class="form-label">户型名称</label>
                <input type="text" class="form-control" id="editTypeName" value="${houseType.type_name}" required>
            </div>
            <div class="mb-3">
                <label class="form-label">描述</label>
                <textarea class="form-control" id="editTypeDescription" rows="3">${houseType.description || ''}</textarea>
            </div>
        </form>
    `, `updateHouseType(${id})`);
}

async function updateHouseType(id) {
    const typeName = document.getElementById('editTypeName').value;
    const description = document.getElementById('editTypeDescription').value;
    
    if (!typeName.trim()) {
        showAlert('请输入户型名称', 'error');
        return;
    }
    
    try {
        await apiRequest(`/house_types/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                type_name: typeName,
                description: description
            })
        });
        
        showAlert('户型更新成功', 'success');
        closeModal();
        loadHouseTypes();
    } catch (error) {
        showAlert('更新失败', 'error');
    }
}

function editLandlord(id) {
    // 查找要编辑的房东数据
    const landlord = landlords.find(l => l.id === id);
    if (!landlord) {
        showAlert('房东数据未找到', 'error');
        return;
    }
    
    // 显示编辑模态框，预填充数据
    showModal('编辑房东', `
        <form id="editLandlordForm">
            <div class="mb-3">
                <label class="form-label">姓名</label>
                <input type="text" class="form-control" id="editLandlordName" value="${landlord.name}" required>
            </div>
            <div class="mb-3">
                <label class="form-label">电话</label>
                <input type="text" class="form-control" id="editLandlordPhone" value="${landlord.phone}" required>
            </div>
            <div class="mb-3">
                <label class="form-label">邮箱</label>
                <input type="email" class="form-control" id="editLandlordEmail" value="${landlord.email || ''}">
            </div>
            <div class="mb-3">
                <label class="form-label">身份证号</label>
                <input type="text" class="form-control" id="editLandlordIdCard" value="${landlord.id_card || ''}">
            </div>
            <div class="mb-3">
                <label class="form-label">地址</label>
                <input type="text" class="form-control" id="editLandlordAddress" value="${landlord.address || ''}">
            </div>
        </form>
    `, `updateLandlord(${id})`);
}

async function updateLandlord(id) {
    const formData = {
        name: document.getElementById('editLandlordName').value,
        phone: document.getElementById('editLandlordPhone').value,
        email: document.getElementById('editLandlordEmail').value,
        id_card: document.getElementById('editLandlordIdCard').value,
        address: document.getElementById('editLandlordAddress').value
    };
    
    if (!formData.name.trim() || !formData.phone.trim()) {
        showAlert('请填写必要信息', 'error');
        return;
    }
    
    try {
        await apiRequest(`/landlords/${id}`, {
            method: 'PUT',
            body: JSON.stringify(formData)
        });
        
        showAlert('房东信息更新成功', 'success');
        closeModal();
        loadLandlords();
    } catch (error) {
        showAlert('更新失败', 'error');
    }
}

function editHouse(id) {
    // 查找要编辑的房屋数据
    const house = houses.find(h => h.id === id);
    if (!house) {
        showAlert('房屋数据未找到', 'error');
        return;
    }
    
    const houseTypeOptions = houseTypes.map(type => 
        `<option value="${type.id}" ${house.type_id === type.id ? 'selected' : ''}>${type.type_name}</option>`
    ).join('');
    
    const landlordOptions = landlords.map(landlord => 
        `<option value="${landlord.id}" ${house.landlord_id === landlord.id ? 'selected' : ''}>${landlord.name}</option>`
    ).join('');
    
    // 显示编辑模态框，预填充数据
    showModal('编辑房屋', `
        <form id="editHouseForm">
            <div class="mb-3">
                <label class="form-label">房号</label>
                <input type="text" class="form-control" id="editHouseNumber" value="${house.house_number}" required>
            </div>
            <div class="mb-3">
                <label class="form-label">地址</label>
                <input type="text" class="form-control" id="editHouseAddress" value="${house.address}" required>
            </div>
            <div class="mb-3">
                <label class="form-label">面积(平方米)</label>
                <input type="number" class="form-control" id="editHouseArea" value="${house.area || ''}" step="0.01">
            </div>
            <div class="mb-3">
                <label class="form-label">租金</label>
                <input type="number" class="form-control" id="editHouseRent" value="${house.rent_price || ''}" required step="0.01">
            </div>
            <div class="mb-3">
                <label class="form-label">押金</label>
                <input type="number" class="form-control" id="editHouseDeposit" value="${house.deposit || ''}" step="0.01">
            </div>
            <div class="mb-3">
                <label class="form-label">户型</label>
                <select class="form-control" id="editHouseType" required>
                    <option value="">选择户型</option>
                    ${houseTypeOptions}
                </select>
            </div>
            <div class="mb-3">
                <label class="form-label">房东</label>
                <select class="form-control" id="editHouseLandlord" required>
                    <option value="">选择房东</option>
                    ${landlordOptions}
                </select>
            </div>
            <div class="mb-3">
                <label class="form-label">描述</label>
                <textarea class="form-control" id="editHouseDescription" rows="3">${house.description || ''}</textarea>
            </div>
        </form>
    `, `updateHouse(${id})`);
}

async function updateHouse(id) {
    const formData = {
        house_number: document.getElementById('editHouseNumber').value,
        address: document.getElementById('editHouseAddress').value,
        area: parseFloat(document.getElementById('editHouseArea').value) || null,
        rent_price: parseFloat(document.getElementById('editHouseRent').value),
        deposit: parseFloat(document.getElementById('editHouseDeposit').value) || null,
        type_id: parseInt(document.getElementById('editHouseType').value),
        landlord_id: parseInt(document.getElementById('editHouseLandlord').value),
        description: document.getElementById('editHouseDescription').value
    };
    
    if (!formData.house_number.trim() || !formData.address.trim() || !formData.rent_price || !formData.type_id || !formData.landlord_id) {
        showAlert('请填写必要信息', 'error');
        return;
    }
    
    try {
        await apiRequest(`/houses/${id}`, {
            method: 'PUT',
            body: JSON.stringify(formData)
        });
        
        showAlert('房屋信息更新成功', 'success');
        closeModal();
        loadHouses();
    } catch (error) {
        showAlert('更新失败', 'error');
    }
}

function editTenant(id) {
    // 查找要编辑的租客数据
    const tenant = tenants.find(t => t.id === id);
    if (!tenant) {
        showAlert('租客数据未找到', 'error');
        return;
    }
    
    // 显示编辑模态框，预填充数据
    showModal('编辑租客', `
        <form id="editTenantForm">
            <div class="mb-3">
                <label class="form-label">姓名</label>
                <input type="text" class="form-control" id="editTenantName" value="${tenant.name}" required>
            </div>
            <div class="mb-3">
                <label class="form-label">电话</label>
                <input type="text" class="form-control" id="editTenantPhone" value="${tenant.phone}" required>
            </div>
            <div class="mb-3">
                <label class="form-label">邮箱</label>
                <input type="email" class="form-control" id="editTenantEmail" value="${tenant.email || ''}">
            </div>
            <div class="mb-3">
                <label class="form-label">身份证号</label>
                <input type="text" class="form-control" id="editTenantIdCard" value="${tenant.id_card || ''}">
            </div>
            <div class="mb-3">
                <label class="form-label">地址</label>
                <input type="text" class="form-control" id="editTenantAddress" value="${tenant.address || ''}">
            </div>
        </form>
    `, `updateTenant(${id})`);
}

async function updateTenant(id) {
    const formData = {
        name: document.getElementById('editTenantName').value,
        phone: document.getElementById('editTenantPhone').value,
        email: document.getElementById('editTenantEmail').value,
        id_card: document.getElementById('editTenantIdCard').value,
        address: document.getElementById('editTenantAddress').value
    };
    
    if (!formData.name.trim() || !formData.phone.trim()) {
        showAlert('请填写必要信息', 'error');
        return;
    }
    
    try {
        await apiRequest(`/tenants/${id}`, {
            method: 'PUT',
            body: JSON.stringify(formData)
        });
        
        showAlert('租客信息更新成功', 'success');
        closeModal();
        loadTenants();
    } catch (error) {
        showAlert('更新失败', 'error');
    }
}

async function deleteHouse(id) {
    if (confirm('确定要删除这个房屋吗？')) {
        try {
            await apiRequest(`/houses/${id}`, {
                method: 'DELETE'
            });
            
            showAlert('房屋删除成功', 'success');
            loadHouses();
        } catch (error) {
            showAlert('删除失败', 'error');
        }
    }
}

async function deleteLandlord(id) {
    if (confirm('确定要删除这个房东吗？')) {
        try {
            await apiRequest(`/landlords/${id}`, {
                method: 'DELETE'
            });
            
            showAlert('房东删除成功', 'success');
            loadLandlords();
        } catch (error) {
            showAlert('删除失败', 'error');
}
    }
}

async function deleteTenant(id) {
    if (confirm('确定要删除这个租客吗？')) {
        try {
            await apiRequest(`/tenants/${id}`, {
                method: 'DELETE'
            });
            
            showAlert('租客删除成功', 'success');
            loadTenants();
        } catch (error) {
            showAlert('删除失败', 'error');
}
    }
}

async function deletePayment(id) {
    // 权限检查
    if (!currentUser || currentUser.role !== 'admin') {
        showAlert('权限不足，只有管理员可以删除收费记录', 'warning');
        return;
    }
    
    if (confirm('确定要删除这个收费记录吗？')) {
        try {
            await apiRequest(`/payments/${id}`, {
                method: 'DELETE'
            });
            
            showAlert('收费记录删除成功', 'success');
            loadPayments();
        } catch (error) {
            showAlert('删除失败', 'error');
        }
    }
}

async function deleteRental(id) {
    // 权限检查
    if (!currentUser || currentUser.role !== 'admin') {
        showAlert('权限不足，只有管理员可以删除租房记录', 'warning');
        return;
    }
    
    if (confirm('确定要删除这条租房记录吗？删除后相关的收费记录也会被删除，且房屋状态会自动更新为可出租。')) {
        try {
            await apiRequest(`/rentals/${id}`, {
                method: 'DELETE'
            });
            
            showAlert('租房记录删除成功', 'success');
            loadRentals();
            loadHouses(); // 重新加载房屋数据以更新状态
        } catch (error) {
            showAlert('删除失败', 'error');
        }
    }
}

function showRentalPayments(id) {
    // 显示租房记录的缴费情况
    console.log('显示租房记录缴费:', id);
}

function adjustDashboardCardHeights() {
    // 由于新布局中户型分布图表和房屋概览表格不在同一行，不需要调整高度
    // 户型分布图表卡片使用 h-100 类自动填充高度
    console.log('Dashboard card heights adjusted for new layout');
}

// 在窗口尺寸变化时也同步高度
window.addEventListener('resize', () => {
    adjustDashboardCardHeights();
}); 

// 显示押金归还确认模态框
function showDepositReturnModal(rentalId, rental, depositPayment) {
    const tenantName = rental.tenant?.name || '未知租客';
    const contractNumber = rental.contract_number || `租房记录${rental.id}`;
    const houseNumber = rental.house?.house_number || '未知房屋';
    
    showModal('归还房屋确认', `
        <div class="deposit-return-card">
            <div class="rental-info mb-4">
                <h6 class="mb-3"><i class="fas fa-home text-primary"></i> 租房信息</h6>
                <div class="row mb-2">
                    <div class="col-4"><strong>房号：</strong></div>
                    <div class="col-8">${houseNumber}</div>
                </div>
                <div class="row mb-2">
                    <div class="col-4"><strong>租客：</strong></div>
                    <div class="col-8">${tenantName}</div>
                </div>
                <div class="row mb-2">
                    <div class="col-4"><strong>合同号：</strong></div>
                    <div class="col-8">${contractNumber}</div>
                </div>
                <div class="row mb-3">
                    <div class="col-4"><strong>押金：</strong></div>
                    <div class="col-8"><span class="text-success">¥${depositPayment.amount} (已缴费)</span></div>
                </div>
            </div>
            
            <div class="deposit-return-options">
                <h6 class="mb-3"><i class="fas fa-money-bill-wave text-warning"></i> 押金处理</h6>
                <div class="form-check mb-3">
                    <input class="form-check-input" type="radio" name="depositAction" id="returnDeposit" value="return" checked>
                    <label class="form-check-label" for="returnDeposit">
                        <strong>归还押金</strong> - 将押金退还给租客
                    </label>
                </div>
                <div class="form-check mb-3">
                    <input class="form-check-input" type="radio" name="depositAction" id="keepDeposit" value="keep">
                    <label class="form-check-label" for="keepDeposit">
                        <strong>扣留押金</strong> - 因损坏或其他原因扣留押金
                    </label>
                </div>
                
                <div class="mt-3" id="depositReasonDiv" style="display: none;">
                    <label class="form-label">扣留原因：</label>
                    <textarea class="form-control" id="depositReason" rows="3" placeholder="请输入扣留押金的原因..."></textarea>
                </div>
            </div>
            
            <div class="alert alert-info mt-3">
                <i class="fas fa-info-circle"></i> 
                确认后将归还房屋并按选择处理押金。此操作不可撤销！
            </div>
        </div>
        
        <script>
            // 监听单选按钮变化
            document.querySelectorAll('input[name="depositAction"]').forEach(radio => {
                radio.addEventListener('change', function() {
                    const reasonDiv = document.getElementById('depositReasonDiv');
                    if (this.value === 'keep') {
                        reasonDiv.style.display = 'block';
                    } else {
                        reasonDiv.style.display = 'none';
                    }
                });
            });
        </script>
    `, `confirmReturnWithDeposit(${rentalId})`);
}

// 确认归还房屋并处理押金
async function confirmReturnWithDeposit(rentalId) {
    const depositAction = document.querySelector('input[name="depositAction"]:checked')?.value;
    const depositReason = document.getElementById('depositReason')?.value || '';
    
    if (!depositAction) {
        showAlert('请选择押金处理方式', 'error');
        return;
    }
    
    if (depositAction === 'keep' && !depositReason.trim()) {
        showAlert('请输入扣留押金的原因', 'error');
        document.getElementById('depositReason').focus();
        return;
    }
    
    try {
        // 归还房屋
        await apiRequest(`/rentals/${rentalId}/return`, {
            method: 'POST',
            body: JSON.stringify({
                deposit_action: depositAction,
                deposit_reason: depositReason.trim()
            })
        });
        
        // 根据押金处理方式显示不同的成功消息
        if (depositAction === 'return') {
            showAlert('房屋归还成功，押金已退还给租客', 'success');
        } else {
            showAlert('房屋归还成功，押金已扣留', 'success');
        }
        
        closeModal();
        loadRentals();
        loadHouses();
        loadPayments(); // 刷新收费记录
        
    } catch (error) {
        showAlert('归还失败: ' + error.message, 'error');
    }
}

// 用户管理功能
async function loadUsers() {
    console.log('loadUsers 被调用，当前用户:', currentUser);
    
    if (!currentUser || currentUser.role !== 'admin') {
        console.log('权限检查失败:', { currentUser, role: currentUser?.role });
        showAlert('无权限访问用户管理', 'error');
        return;
    }
    
    try {
        console.log('开始加载用户数据...');
        const response = await apiRequest('/users');
        console.log('用户数据加载成功:', response);
        updateUsersTable(response.data);
        updateUserStats(response.data);
    } catch (error) {
        console.error('加载用户列表失败:', error);
        showAlert('加载用户列表失败', 'error');
    }
}

// 更新用户统计信息
function updateUserStats(users) {
    console.log('正在更新用户统计:', users);
    
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.is_active).length;
    const adminUsers = users.filter(user => user.role === 'admin').length;
    const inactiveUsers = users.filter(user => !user.is_active).length;
    
    console.log('统计数据:', { totalUsers, activeUsers, adminUsers, inactiveUsers });
    
    const totalElement = document.getElementById('total-users');
    const activeElement = document.getElementById('active-users');
    const adminElement = document.getElementById('admin-users');
    const inactiveElement = document.getElementById('inactive-users');
    
    console.log('统计元素:', { totalElement, activeElement, adminElement, inactiveElement });
    
    if (totalElement) totalElement.textContent = totalUsers;
    if (activeElement) activeElement.textContent = activeUsers;
    if (adminElement) adminElement.textContent = adminUsers;
    if (inactiveElement) inactiveElement.textContent = inactiveUsers;
}

function updateUsersTable(users) {
    const tbody = document.getElementById('users-table');
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        
        const statusBadge = user.is_active ? 
            '<span class="badge bg-success">激活</span>' : 
            '<span class="badge bg-danger">禁用</span>';
            
        const roleBadge = user.role === 'admin' ? 
            '<span class="badge bg-danger">管理员</span>' : 
            '<span class="badge bg-primary">普通用户</span>';
            
        const lastLogin = user.last_login ? 
            formatDateTime(user.last_login) : 
            '<span class="text-muted">从未登录</span>';
            
        // 判断是否可以操作该用户
        const isCurrentUser = user.id === currentUser.id;
        const isAdmin = user.role === 'admin';
        const canDelete = !isCurrentUser && !isAdmin;
        const canToggleStatus = !isCurrentUser && !isAdmin;
        
        let actionButtons = '';
        
        if (isCurrentUser) {
            actionButtons = '<span class="text-info small"><i class="fas fa-user me-1"></i>当前用户</span>';
        } else if (isAdmin) {
            actionButtons = '<span class="text-warning small"><i class="fas fa-shield-alt me-1"></i>管理员账号</span>';
        } else {
            actionButtons = `
                ${canToggleStatus ? `
                    <button class="btn btn-sm btn-outline-warning me-1" onclick="toggleUserStatus(${user.id}, ${user.is_active})" title="${user.is_active ? '禁用' : '启用'}用户">
                        <i class="fas fa-${user.is_active ? 'ban' : 'check'}"></i>
                    </button>
                ` : ''}
                ${canDelete ? `
                    <button class="btn btn-sm btn-outline-danger" onclick="confirmDeleteUser(${user.id}, '${user.username}')" title="删除用户">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : ''}
            `;
        }
        
        // 为当前用户或管理员账号添加特殊样式
        const rowClass = isCurrentUser ? 'table-info' : (isAdmin ? 'table-warning' : '');
        row.className = rowClass;
        
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}${isCurrentUser ? ' <small class="text-info">(您)</small>' : ''}</td>
            <td>${user.email}</td>
            <td>${user.full_name || '<span class="text-muted">未设置</span>'}</td>
            <td>${user.phone || '<span class="text-muted">未设置</span>'}</td>
            <td>${roleBadge}</td>
            <td>${statusBadge}</td>
            <td>${formatDateTime(user.created_at)}</td>
            <td>${lastLogin}</td>
            <td>${actionButtons}</td>
        `;
        
        tbody.appendChild(row);
    });
}

async function toggleUserStatus(userId, currentStatus) {
    const action = currentStatus ? '禁用' : '启用';
    
    if (!confirm(`确定要${action}这个用户吗？`)) {
        return;
    }
    
    try {
        await apiRequest(`/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify({
                is_active: !currentStatus
            })
        });
        
        showAlert(`用户${action}成功`, 'success');
        loadUsers();
    } catch (error) {
        showAlert(`${action}用户失败`, 'error');
    }
}

// 显示删除用户确认对话框
function confirmDeleteUser(userId, username) {
    showModal('删除用户确认', `
        <div class="alert alert-danger">
            <h6><i class="fas fa-exclamation-triangle me-2"></i>危险操作警告</h6>
            <p class="mb-0">您即将删除用户账号，此操作不可撤销！</p>
        </div>
        
        <div class="user-delete-info">
            <h6>用户信息：</h6>
            <ul>
                <li><strong>用户名：</strong>${username}</li>
                <li><strong>用户ID：</strong>${userId}</li>
            </ul>
        </div>
        
        <div class="alert alert-warning">
            <h6><i class="fas fa-info-circle me-2"></i>删除后果：</h6>
            <ul class="mb-0">
                <li>用户将无法登录系统</li>
                <li>用户的所有个人信息将被清除</li>
                <li>相关的业务数据可能受到影响</li>
            </ul>
        </div>
        
        <div class="form-check mt-3">
            <input class="form-check-input" type="checkbox" id="confirmDelete" required>
            <label class="form-check-label text-danger" for="confirmDelete">
                <strong>我确认要删除此用户账号</strong>
            </label>
        </div>
    `, `executeDeleteUser(${userId}, '${username}')`);
}

// 执行删除用户操作
async function executeDeleteUser(userId, username) {
    const confirmCheckbox = document.getElementById('confirmDelete');
    
    if (!confirmCheckbox.checked) {
        showAlert('请先确认删除操作', 'error');
        return;
    }
    
    try {
        const response = await apiRequest(`/users/${userId}`, {
            method: 'DELETE'
        });
        
        showAlert(response.message || '用户删除成功', 'success');
        closeModal();
        loadUsers();
    } catch (error) {
        const errorMsg = error.response?.data?.error || '删除用户失败';
        showAlert(errorMsg, 'error');
    }
}

// 显示用户个人设置
function showUserProfile() {
    if (!currentUser) {
        showAlert('用户信息未加载', 'error');
        return;
    }
    
    // 角色说明文本
    const roleDescription = currentUser.role === 'admin' ? 
        '<small class="text-info">管理员账号，拥有系统所有权限</small>' : 
        '<small class="text-muted">普通用户角色，角色不可修改</small>';
    
    showModal('个人设置', `
        <form id="userProfileForm">
            <div class="mb-3">
                <label class="form-label">用户名</label>
                <input type="text" class="form-control" value="${currentUser.username}" readonly>
            </div>
            <div class="mb-3">
                <label class="form-label">邮箱</label>
                <input type="email" class="form-control" value="${currentUser.email}" readonly>
            </div>
            <div class="mb-3">
                <label class="form-label">姓名</label>
                <input type="text" class="form-control" id="editFullName" value="${currentUser.full_name || ''}">
            </div>
            <div class="mb-3">
                <label class="form-label">联系电话</label>
                <input type="tel" class="form-control" id="editPhone" value="${currentUser.phone || ''}">
            </div>
            <div class="mb-3">
                <label class="form-label">角色</label>
                <input type="text" class="form-control" value="${getRoleText(currentUser.role)}" readonly>
                ${roleDescription}
            </div>
            <div class="mb-3">
                <label class="form-label">注册时间</label>
                <input type="text" class="form-control" value="${formatDateTime(currentUser.created_at)}" readonly>
            </div>
            <hr>
            <div class="mb-3">
                <label class="form-label">新密码（留空则不修改）</label>
                <input type="password" class="form-control" id="newPassword" placeholder="输入新密码">
            </div>
            <div class="mb-3">
                <label class="form-label">确认新密码</label>
                <input type="password" class="form-control" id="confirmPassword" placeholder="再次输入新密码">
            </div>
        </form>
    `, 'updateUserProfile()');
}

// 更新用户个人信息
async function updateUserProfile() {
    const fullName = document.getElementById('editFullName').value;
    const phone = document.getElementById('editPhone').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // 验证密码
    if (newPassword && newPassword !== confirmPassword) {
        showAlert('两次输入的密码不一致', 'error');
        return;
    }
    
    if (newPassword && newPassword.length < 6) {
        showAlert('密码长度至少6位', 'error');
        return;
    }
    
    try {
        const updateData = {
            full_name: fullName,
            phone: phone
        };
        
        if (newPassword) {
            updateData.password = newPassword;
        }
        
        const response = await apiRequest(`/users/${currentUser.id}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
        
        // 更新本地用户信息
        currentUser.full_name = fullName;
        currentUser.phone = phone;
        updateUserInfo(currentUser);
        
        showAlert('个人信息更新成功', 'success');
        closeModal();
        
        if (newPassword) {
            showAlert('密码已更新，请重新登录', 'info');
            setTimeout(() => {
                logout();
            }, 2000);
        }
    } catch (error) {
        showAlert('更新失败', 'error');
    }
}

