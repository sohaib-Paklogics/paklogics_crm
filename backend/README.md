# AI-Driven Driver Training & Scorecard Performance Automation

This is a scalable, modular Node.js backend for the **AI-Driven Driver Training & Scorecard Performance Automation** platform. It integrates with **Netradyne API** for real-time safety and compliance data, and **Twilio WhatsApp API** to deliver training, quizzes, alerts, and certificates to drivers. Built on Express and MongoDB, this system powers web admin panels and automated driver engagement workflows.

## Features

- Express.js API structure
- MongoDB (with Mongoose) for storing drivers, quizzes, and training records
- JWT-based Admin Authentication
- Twilio WhatsApp Integration for driver interaction
- Netradyne API Integration for safety/compliance data
- Quiz and Training Management with retry logic
- Certificate generation and delivery
- Role-based access control (Admin only)
- Environment-based configuration
- ESLint, Prettier, and Husky for code quality

---

## Installation

Make sure you have **Node.js** and **pnpm** installed.

```sh
pnpm install
```

---

## Usage

### Start the development server

```sh
pnpm start
```

### Lint code

```sh
pnpm lint
```

### Format code

```sh
pnpm format
```

---

## Project Structure

```
AI-Driven/
│── src/
│   ├── routes/              # RESTful API endpoints
│   ├── controllers/         # Business logic and workflows
│   ├── models/              # Mongoose models (Driver, Quiz, Training, Admin)
│   ├── services/            # Integration services (Twilio, Netradyne)
│   ├── middleware/          # Auth, validation, error handling
│   ├── utils/               # Helpers (PDF, schedulers, formatting)
│   ├── jobs/                # Scheduled retry or alert tasks
│   ├── index.js             # App entry point
│── .env                     # Environment variables
│── README.md                # Project documentation
```

---

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=mongodb+srv://your_user:your_password@cluster.mongodb.net/dbname
JWT_SECRET=your_jwt_secret

# Twilio
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890

# Netradyne
NETRADYNE_CLIENT_ID=your_client_id
NETRADYNE_CLIENT_SECRET=your_client_secret
NETRADYNE_TENANT_NAME=your_fleet_name
NETRADYNE_AUTH_URL=https://api-demo.netradyne.com/driveri/v1/auth/token
NETRADYNE_API_BASE_URL=https://api-demo.netradyne.com/driveri/v1
```

---

## Core Modules

| Feature           | Description                                                 |
| ----------------- | ----------------------------------------------------------- |
| Admin Auth        | Login and dashboard access with secure session handling     |
| Driver Management | Mapping driver data from Netradyne and WhatsApp integration |
| Training Modules  | Upload multimedia training with associated quizzes          |
| Quiz System       | Configurable MCQs with scoring, retries, and reminders      |
| Certificates      | PDF generation and delivery via WhatsApp                    |
| Safety Dashboard  | Real-time violation tracking via Netradyne API              |
| Compliance Alerts | Automated WhatsApp alerts based on violations               |
| Leaderboard       | Weekly rankings based on Netradyne scorecard                |

---

## Dependencies

### Main Dependencies

- express
- mongoose
- dotenv
- jsonwebtoken
- bcrypt
- joi
- nodemailer
- axios

### Dev Dependencies

- eslint
- prettier
- husky
- nodemon

---

## Contributing

1. Fork this repository.
2. Clone your forked repository:

   ```sh
   git clone https://github.com/your-username/AI-Driven.git
   ```

3. Create a branch for your feature:

   ```sh
   git checkout -b feature-name
   ```

4. Make your changes and commit:

   ```sh
   git commit -m "Added feature"
   ```

5. Push and open a pull request.

---

## License

This project is licensed under the ISC License.

---

## Contact

For technical support, questions, or contributions, please open an issue or reach out to the maintainer.
