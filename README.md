# Personal Financial System 💸

![landing-page](https://github.com/user-attachments/assets/aece8337-d51b-4f0e-9019-a2386b9d1d62)

## Features 🚀

- **Transaction Management:**
  - Add, update, and delete transactions (income, expenses, etc.).
  - View transaction history and details.

- **Budget Planning:**
  - Set monthly or custom period budgets for different expense categories.
  - Track budget vs. actual spending.

- **Account Management:**
  - Manage bank accounts, credit cards, and cash balances.
  - Track account balances and transactions.

- **User Authentication:**
  - Secure user authentication and authorization.
  - User profiles with customizable settings.

## Technologies Used 🛠️

- **Backend:**
  - **NestJS** with TypeScript for building scalable server-side applications.
  - **Drizzle ORM** for database management.
  - **PostgreSQL** as the primary database.
  - **Swagger** for API documentation.
  - **JWT** for secure user authentication.
  - **Docker** for containerizing the application and its services.

- **Frontend:**
  - **Next.js** with TypeScript for server-side rendering and React development.
  - **Zustand** for lightweight state management.
  - **Flowbite** for UI components.

## Installation and Setup 📋

1. **Clone the repository:**
   ```bash
   git clone https://github.com/esti08-hu/Personal-Financial-Management-System-PFMS.git
   cd Personal-Financial-Management-System-PFMS
   ```

2. **Install dependencies:**
   ```bash
   # Install server dependencies
   cd server
   pnpm install

   # Install client dependencies
   cd ../client
   pnpm install
   ```

3. **Set up environment variables:**
   - Create a `.env` file in both `server` and `client` directories.
   - Add necessary environment variables, including database connection details, JWT secret, etc.

4. **Run with Docker:**
   ```bash
   # From the root directory, build and run the application using Docker
   docker-compose --profile dev up --build
   ```

5. **Access the Application:**
   - Open your web browser and go to `http://localhost:3000` to access the frontend.
   - API documentation will be available at `http://localhost:3001/api` (Swagger).

## Contributing 🤝

Contributions are welcome! If you'd like to contribute to the project, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature-name`).
3. Commit your changes (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature/your-feature-name`).
5. Create a new Pull Request.
