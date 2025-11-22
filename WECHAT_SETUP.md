# Backend API Integration Setup Guide
# 后端 API 集成设置指南

## 📱 English Version

This guide will help you set up backend API integration for sending order notifications to WeChat Work.

## Prerequisites

1. Backend API running at `https://api.chenmo1212.cn`
2. API endpoint `/messages` accepting POST requests

## Setup Steps

### 1. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and update values if needed:
   ```env
   REACT_APP_API_BASE_URL=https://api.chenmo1212.cn
   REACT_APP_SECRET_CODE=dianxin
   ```

3. Save the file

### 2. Restart Development Server

```bash
npm start
```

### 3. Test the Integration

1. Add items to cart
2. Select delivery time
3. Click "Checkout"
4. Enter the secret code: `dianxin` (or your custom code from .env.local)
5. Complete the order
6. Check WeChat Work for the notification

## 📝 API Request Format

The application sends POST requests to `${API_BASE_URL}/messages` with the following JSON structure:

```json
{
  "name": "Food Order System",
  "email": "order@foodmenu.app",
  "content": "🍕 New Order!\n\n📅 Delivery: [delivery time]\n\n[order details in markdown]",
  "website": "Food Menu App",
  "agent": "Food Ordering System",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 🔒 Security Notes

- **Never commit `.env.local` to version control**
- The `.gitignore` file already excludes it
- Keep your secret code secure
- Change the default secret code in production
- Only share credentials with trusted team members

## 🐛 Troubleshooting

### "Failed to send notification"
- Check if the backend API is running
- Verify the API endpoint URL is correct
- Check browser console for detailed error messages
- Ensure network connection is stable

### "Invalid secret code"
- Make sure you're entering the correct code from `.env.local`
- Default code is `dianxin`
- Check for typos

### API returns error
- Verify the backend API is properly configured
- Check if the API endpoint accepts the request format
- Review backend logs for error details

---

## 📱 中文版本

本指南将帮助您设置后端 API 集成，用于向企业微信发送订单通知。

## 前置条件

1. 后端 API 运行在 `https://api.chenmo1212.cn`
2. API 端点 `/messages` 接受 POST 请求

## 设置步骤

### 1. 配置环境变量

1. 复制示例环境文件：
   ```bash
   cp .env.example .env.local
   ```

2. 编辑 `.env.local` 并根据需要更新值：
   ```env
   REACT_APP_API_BASE_URL=https://api.chenmo1212.cn
   REACT_APP_SECRET_CODE=dianxin
   ```

3. 保存文件

### 2. 重启开发服务器

```bash
npm start
```

### 3. 测试集成

1. 添加商品到购物车
2. 选择配送时间
3. 点击"结账"
4. 输入密码：`dianxin`（或你在 .env.local 中自定义的密码）
5. 完成订单
6. 在企业微信中查看通知

## 📝 API 请求格式

应用程序向 `${API_BASE_URL}/messages` 发送 POST 请求，JSON 结构如下：

```json
{
  "name": "Food Order System",
  "email": "order@foodmenu.app",
  "content": "🍕 New Order!\n\n📅 Delivery: [配送时间]\n\n[订单详情（Markdown格式）]",
  "website": "Food Menu App",
  "agent": "Food Ordering System",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 🔒 安全提示

- **永远不要将 `.env.local` 提交到版本控制**
- `.gitignore` 文件已经排除了它
- 保护好你的密码
- 在生产环境中更改默认密码
- 只与可信任的团队成员共享凭证

## 🐛 故障排除

### "发送通知失败"
- 检查后端 API 是否正常运行
- 验证 API 端点 URL 是否正确
- 查看浏览器控制台的详细错误信息
- 确认网络连接稳定

### "密码错误"
- 确保输入的密码与 `.env.local` 中的一致
- 默认密码是 `dianxin`
- 检查是否有拼写错误

### API 返回错误
- 验证后端 API 配置正确
- 检查 API 端点是否接受该请求格式
- 查看后端日志了解错误详情

## 💝 Made with Love

This notification system helps you stay connected with your loved one's food orders! ❤️

---

Made with Bob