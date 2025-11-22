# WeChat Work Notification Setup Guide

## 📱 企业微信通知配置指南

This guide will help you set up WeChat Work notifications for your food ordering app.

## Prerequisites

1. A WeChat Work (企业微信) account
2. Admin access to create applications

## Setup Steps

### 1. Create WeChat Work Application

1. Log in to [WeChat Work Admin Console](https://work.weixin.qq.com/)
2. Go to **Applications & Mini Programs** (应用管理)
3. Click **Create Application** (创建应用)
4. Fill in application details:
   - Name: "Food Order Notifications" (or any name you prefer)
   - Logo: Upload an icon
   - Description: "Receive food order notifications"
5. Click **Create** (创建)

### 2. Get Required Credentials

After creating the application, you'll need three pieces of information:

#### A. Enterprise ID (企业ID / Corp ID)
- Go to **My Enterprise** (我的企业)
- Find **Enterprise Information** (企业信息)
- Copy the **Enterprise ID** (企业ID)

#### B. Application Secret (应用Secret)
- Go to your application page
- Find **Application Secret** (应用Secret)
- Click **View** (查看) and copy the secret
- ⚠️ Keep this secret safe!

#### C. Application ID (AgentId)
- On your application page
- Find **AgentId**
- Copy the number

### 3. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and fill in your credentials:
   ```env
   REACT_APP_WECHAT_CORPID=your_corp_id_here
   REACT_APP_WECHAT_CORPSECRET=your_corp_secret_here
   REACT_APP_WECHAT_AGENTID=your_agent_id_here
   ```

3. Save the file

### 4. Set Trusted IP (可信IP)

For the API to work, you need to add your server IP to the trusted list:

1. Go to your application settings
2. Find **Enterprise Trusted IP** (企业可信IP)
3. Add your server's public IP address
4. For local development, you might need to use a proxy or deploy to a server

### 5. Test the Integration

1. Start your development server:
   ```bash
   npm start
   ```

2. Create an order and submit it
3. Check your WeChat Work app for the notification

## 🔒 Security Notes

- **Never commit `.env.local` to version control**
- The `.gitignore` file already excludes it
- Keep your Corp Secret safe
- Rotate secrets regularly
- Only share credentials with trusted team members

## 📝 Notification Format

The app sends notifications in Markdown format with:
- Order date and time
- List of items with quantities
- Special instructions for each item
- Total item count

## 🐛 Troubleshooting

### "Failed to get access token"
- Check if your Corp ID and Corp Secret are correct
- Verify the application is active

### "Invalid IP"
- Add your server IP to the trusted IP list
- For local development, consider using ngrok or similar tools

### "Permission denied"
- Ensure the application has permission to send messages
- Check if the application is visible to users

## 📚 Additional Resources

- [WeChat Work API Documentation](https://developer.work.weixin.qq.com/document/)
- [Message Sending API](https://developer.work.weixin.qq.com/document/path/90236)

## 💝 Made with Love

This notification system helps you stay connected with your loved one's food orders! ❤️

---

Made with Bob