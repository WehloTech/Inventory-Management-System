# Inventory Management System (UW Management System)

A high-performance Inventory Management System built with **Laravel 12**, **Inertia.js (React)**, and **Tailwind CSS 4**. This system is designed to provide seamless multi-system inventory tracking and management for organizations with complex asset needs.

---

## 🚀 Features

- **Multi-System Support**: Manage inventory across different categories (Usher, Usherette, Wehlo, Hoclomac, and Shared).
- **Comprehensive Tracking**:
  - **Master List**: Unified view of all assets and items.
  - **Stock In / Stock Out**: Streamlined processes for adding and removing inventory.
  - **In-Use & Deployment**: Real-time tracking of assets in the field.
  - **Damage Tracking**: Record and manage damaged items.
  - **Consumables**: Specialized management for consumable goods.
- **Procurement Workflow**: Integrated Purchase Orders and Purchase Requests.
- **Audit Trails**: Full log history for all inventory movements.
- **Secure Access**: Admin-only authentication system.

---

## 🛠 Tech Stack

- **Backend**: [Laravel 12+](https://laravel.com/)
- **Frontend**: [React 19+](https://react.dev/) via [Inertia.js](https://inertiajs.com/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) & [Lucide Icons](https://lucide.dev/)
- **Testing**: [Pest PHP](https://pestphp.com/)

---

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd uw-management-system
   ```

2. **Backend Setup**:
   ```bash
   composer install
   cp .env.example .env
   php artisan key:generate
   ```

3. **Database Configuration**:
   Configure your database settings in `.env` and run migrations:
   ```bash
   php artisan migrate
   ```

4. **Frontend Setup**:
   ```bash
   npm install
   ```

---

## 💻 Development

You can run both the Laravel server and Vite dev server concurrently:

```bash
composer run dev
```

Alternatively, run them separately:

- **Laravel Server**: `php artisan serve`
- **Vite Dev Server**: `npm run dev`

---

## 🧪 Testing

Run tests using Pest:

```bash
php artisan test
```

---

## 🧹 Linting & Formatting

- **PHP (Laravel Pint)**: `composer run lint`
- **Frontend (Prettier/ESLint)**: `npm run format` and `npm run lint`

---

## 📄 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
