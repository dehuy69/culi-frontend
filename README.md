# Culi Frontend

Frontend web application cho Culi - AI kế toán cho hộ kinh doanh Việt Nam.

**Language**: [English](#english) | [Tiếng Việt](#tiếng-việt)

---

## Tiếng Việt

### 🌐 Live Demo

**Trải nghiệm Culi ngay bây giờ**: [https://culi.ddns.net/](https://culi.ddns.net/)

Demo này cho phép bạn:
- 💬 Chat với AI agent về kế toán và thuế
- 🔌 Kết nối với các ứng dụng quản lý bán hàng (KiotViet, Misa eShop, ...)
- 📊 Xem và quản lý dữ liệu từ các ứng dụng đã kết nối
- ⚙️ Quản lý workspaces và cài đặt

### 📖 Tổng quan

Culi Frontend là giao diện web hiện đại được xây dựng với React và TypeScript, cung cấp trải nghiệm người dùng mượt mà cho hệ thống AI kế toán Culi. Ứng dụng cho phép người dùng quản lý workspaces, chat với AI agent, kết nối với các ứng dụng quản lý bán hàng và kế toán.

### ✨ Tính năng chính

- 🏠 **Dashboard**: Quản lý nhiều workspaces, tạo và xóa workspace
- 💬 **Chat Interface**: Giao tiếp tự nhiên với AI agent bằng tiếng Việt
- 🔌 **Kết nối ứng dụng**: Kết nối với KiotViet và các ứng dụng khác qua API hoặc MCP
- ⚙️ **Cài đặt**: Quản lý cài đặt workspace và tài khoản
- 🎨 **UI/UX hiện đại**: Giao diện đẹp với Shadcn UI và Tailwind CSS
- 📱 **Responsive**: Tối ưu cho mọi kích thước màn hình

### 🛠️ Công nghệ sử dụng

- **Framework**: React 18.3+ với TypeScript
- **Build Tool**: Vite 5.4+
- **UI Library**: Shadcn UI (Radix UI + Tailwind CSS)
- **Routing**: React Router v6
- **State Management**: React Hooks + React Query
- **Icons**: Lucide React
- **Styling**: Tailwind CSS với custom theme

### 📋 Yêu cầu

- Node.js 18+ và npm/yarn/pnpm
- Backend Culi đang chạy (mặc định: `http://localhost:8001`)

### 🚀 Cài đặt và chạy

1. **Clone repository:**
   ```bash
   git clone <repository-url>
   cd culi-frontend
   ```

2. **Cài đặt dependencies:**
   ```bash
   npm install
   # hoặc
   yarn install
   # hoặc
   pnpm install
   ```

3. **Cấu hình environment:**
   
   Tạo file `.env` trong thư mục root:
   ```env
   VITE_API_BASE_URL=http://localhost:8001
   ```

4. **Chạy development server:**
   ```bash
   npm run dev
   # hoặc
   yarn dev
   # hoặc
   pnpm dev
   ```

   Ứng dụng sẽ chạy tại `http://localhost:8080` (hoặc port khác nếu 8080 đã được sử dụng).

### 🏗️ Build cho production

```bash
npm run build
# hoặc
yarn build
# hoặc
pnpm build
```

Files build sẽ được tạo trong thư mục `dist/`.

Để preview build:
```bash
npm run preview
```

### 📁 Cấu trúc thư mục

```
culi-frontend/
├── public/              # Static files (favicon, robots.txt)
├── src/
│   ├── components/      # React components
│   │   ├── ui/         # Shadcn UI components
│   │   ├── workspace/  # Workspace-related components
│   │   └── user/       # User-related components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities và API client
│   ├── pages/          # Page components
│   │   ├── Auth.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Workspace.tsx
│   │   ├── Settings.tsx
│   │   └── AppConnections.tsx
│   ├── App.tsx         # Main app component
│   └── main.tsx        # Entry point
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

### 🔌 Kết nối với Backend

Frontend kết nối với backend qua REST API. Cấu hình API base URL trong file `.env`:

```env
VITE_API_BASE_URL=http://localhost:8001
```

### 📝 Scripts có sẵn

- `npm run dev` - Chạy development server với hot reload
- `npm run build` - Build cho production
- `npm run build:dev` - Build ở chế độ development
- `npm run preview` - Preview build production
- `npm run lint` - Chạy ESLint

### 🎨 Customization

#### Theme Colors

Màu sắc có thể được tùy chỉnh trong `src/index.css` thông qua CSS variables:

```css
:root {
  --primary: 210 100% 50%;
  --secondary: 210 40% 96%;
  /* ... */
}
```

#### Logo

Logo có thể được thay đổi trong `src/components/Logo.tsx` hoặc thay thế file `public/favicon.svg`.

### 🤝 Đóng góp

Chúng tôi hoan nghênh mọi đóng góp! Vui lòng:

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add some amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Mở Pull Request

### 📄 License

[Thêm license của bạn ở đây]

---

## English

### 🌐 Live Demo

**Try Culi now**: [https://culi.ddns.net/](https://culi.ddns.net/)

This demo allows you to:
- 💬 Chat with AI agent about accounting and tax
- 🔌 Connect with sales management applications (KiotViet, Misa eShop, ...)
- 📊 View and manage data from connected applications
- ⚙️ Manage workspaces and settings

### 📖 Overview

Culi Frontend is a modern web interface built with React and TypeScript, providing a smooth user experience for the Culi AI accounting system. The application allows users to manage workspaces, chat with AI agent, and connect with sales management and accounting applications.

### ✨ Key Features

- 🏠 **Dashboard**: Manage multiple workspaces, create and delete workspaces
- 💬 **Chat Interface**: Natural conversation with AI agent in Vietnamese
- 🔌 **App Connections**: Connect with KiotViet and other apps via API or MCP
- ⚙️ **Settings**: Manage workspace and account settings
- 🎨 **Modern UI/UX**: Beautiful interface with Shadcn UI and Tailwind CSS
- 📱 **Responsive**: Optimized for all screen sizes

### 🛠️ Tech Stack

- **Framework**: React 18.3+ with TypeScript
- **Build Tool**: Vite 5.4+
- **UI Library**: Shadcn UI (Radix UI + Tailwind CSS)
- **Routing**: React Router v6
- **State Management**: React Hooks + React Query
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with custom theme

### 📋 Requirements

- Node.js 18+ and npm/yarn/pnpm
- Culi Backend running (default: `http://localhost:8001`)

### 🚀 Installation and Running

1. **Clone repository:**
   ```bash
   git clone <repository-url>
   cd culi-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Configure environment:**
   
   Create `.env` file in root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:8001
   ```

4. **Run development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

   Application will run at `http://localhost:8080` (or another port if 8080 is in use).

### 🏗️ Build for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

Build files will be generated in `dist/` directory.

To preview the build:
```bash
npm run preview
```

### 📁 Project Structure

```
culi-frontend/
├── public/              # Static files (favicon, robots.txt)
├── src/
│   ├── components/      # React components
│   │   ├── ui/         # Shadcn UI components
│   │   ├── workspace/  # Workspace-related components
│   │   └── user/       # User-related components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities and API client
│   ├── pages/          # Page components
│   │   ├── Auth.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Workspace.tsx
│   │   ├── Settings.tsx
│   │   └── AppConnections.tsx
│   ├── App.tsx         # Main app component
│   └── main.tsx        # Entry point
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

### 🔌 Backend Connection

Frontend connects to backend via REST API. Configure API base URL in `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8001
```

### 📝 Available Scripts

- `npm run dev` - Run development server with hot reload
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### 🎨 Customization

#### Theme Colors

Colors can be customized in `src/index.css` through CSS variables:

```css
:root {
  --primary: 210 100% 50%;
  --secondary: 210 40% 96%;
  /* ... */
}
```

#### Logo

Logo can be changed in `src/components/Logo.tsx` or replace `public/favicon.svg` file.

### 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### 📄 License

[Add your license here]

---

## 🔗 Related Projects

- [Culi Backend](../culi/README.md) - Backend API server
- **🌐 Live Demo**: [https://culi.ddns.net/](https://culi.ddns.net/)

## 📞 Support

Nếu bạn gặp vấn đề hoặc có câu hỏi, vui lòng mở một issue trên GitHub repository.

If you encounter any issues or have questions, please open an issue on the GitHub repository.
