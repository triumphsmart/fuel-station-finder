# GoFuel Finder

A fuel station finder platform that allows station owners to register and manage their stations while drivers can find nearby stations, check fuel prices and availability, and view station locations.

## Overview

GoFuel Finder is built to help drivers find fuel stations without wasting time moving from one station to another looking for available fuel.

Station owners can register their stations, manage their station information, and update fuel prices and availability. Drivers can search for stations, view their details on a map, check available fuel types, and leave reviews and ratings.

The platform also supports people looking for diesel or kerosene.

## Features

### For Drivers

- View nearby fuel stations on a map
- Browse stations in a list view
- Filter stations by city, fuel type, and availability
- View station details
- Check current petrol, diesel, and kerosene prices
- View fuel availability
- Leave reviews and ratings for stations

### For Station Owners

- Register a fuel station
- Manage registered stations
- Update fuel prices
- Update fuel availability
- View when prices were last updated
- Edit station information
- Delete stations

### For Admins

- Approve or reject new station registrations
- View all registered stations
- Manage stations
- View and manage users
- Activate or deactivate users
- Delete users
- Create new admin accounts
- Super Admin can create other admin accounts

### Other Features

- Progressive Web App (PWA)
- Mobile responsive interface
- Search and filtering
- Map-based station locations

## Tech Stack

| Layer               | Technology                |
| ------------------- | ------------------------- |
| Frontend            | HTML, CSS, JavaScript     |
| Backend             | Node.js, Express          |
| Database            | PostgreSQL                |
| Maps                | Leaflet.js, OpenStreetMap |
| Authentication      | JWT                       |
| Password Hashing    | bcryptjs                  |
| Backend Deployment  | Render                    |
| Frontend Deployment | Netlify                   |

## Installation

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- PostgreSQL

### Setup

1. Clone the repository:

```bash
git clone https://github.com/triumphsmart/fuel-station-finder.git
cd fuel-station-finder
```

2. Install the backend dependencies:

```bash
cd server
npm install
```

3. Create a `.env` file inside the `server/` folder:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=fuel_finder
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password

JWT_SECRET=your_secret_key_here
```

4. Create the PostgreSQL database:

```sql
CREATE DATABASE fuel_finder;
```

5. Set up the database tables using the SQL schema provided with the project.

6. Seed the admin account:

```bash
node seed.js
```

7. Start the backend server:

```bash
npm run dev
```

8. Open the frontend.

You can open `client/index.html` directly in your browser or use the Live Server extension in VS Code.

## API Endpoints

### Authentication

| Method | Endpoint             | Description             |
| ------ | -------------------- | ----------------------- |
| POST   | `/api/auth/register` | Register a new user     |
| POST   | `/api/auth/login`    | Login and receive a JWT |

### Stations

| Method | Endpoint                    | Description                              |
| ------ | --------------------------- | ---------------------------------------- |
| GET    | `/api/stations`             | Get approved stations                    |
| GET    | `/api/stations/:id`         | Get a station by ID                      |
| POST   | `/api/stations`             | Create a station                         |
| PUT    | `/api/stations/:id`         | Update a station                         |
| DELETE | `/api/stations/:id`         | Delete a station                         |
| GET    | `/api/stations/my-stations` | Get stations owned by the logged-in user |

### Reviews

| Method | Endpoint                    | Description               |
| ------ | --------------------------- | ------------------------- |
| GET    | `/api/stations/:id/reviews` | Get reviews for a station |
| POST   | `/api/stations/:id/reviews` | Add a review              |

### Admin

| Method | Endpoint                          | Description                       |
| ------ | --------------------------------- | --------------------------------- |
| GET    | `/api/admin/stations/pending`     | Get pending station registrations |
| GET    | `/api/admin/stations/all`         | Get all stations                  |
| PUT    | `/api/admin/stations/:id/approve` | Approve a station                 |
| PUT    | `/api/admin/stations/:id/reject`  | Reject a station                  |
| DELETE | `/api/admin/stations/:id`         | Delete a station                  |
| GET    | `/api/admin/users`                | Get all users                     |
| PUT    | `/api/admin/users/:id/activate`   | Activate a user                   |
| PUT    | `/api/admin/users/:id/deactivate` | Deactivate a user                 |
| DELETE | `/api/admin/users/:id`            | Delete a user                     |

## Project Structure

```text
gofuel-finder/
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seed.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── client/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── station-detail.html
│   ├── owner-dashboard.html
│   ├── admin-dashboard.html
│   ├── create-station.html
│   ├── profile.html
│   ├── css/
│   ├── js/
│   ├── images/
│   ├── manifest.json
│   └── sw.js
│
├── .gitignore
└── README.md
```

## Demo Account

If a seeded admin account is available in the project, use the credentials configured in `seed.js`.

For security, do not commit real passwords or production credentials to the repository.

## Project Status

GoFuel Finder is currently under development.

Some features may still be improved as development continues.

## License

This project was built as part of the 3MTT Software Development program.

## Author

Triumph Smart

GitHub: https://github.com/triumphsmart

## Project Link

https://github.com/triumphsmart/fuel-station-finder
