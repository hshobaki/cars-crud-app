\# Cars CRUD App 🚗



Full-stack car inventory with Node.js, Express, PostgreSQL.



\## Quick Start



1\. Clone repo: `git clone https://github.com/hshobaki/cars-crud-app`

2\. `cd backend`

3\. `npm install`

4\. Copy `.env.example` → `.env` and set `DATABASE\_URL`

5\. Create PostgreSQL database \& table (see SQL below)

6\. `npm start`



\*\*Live Demo\*\*: http://localhost:3000



\## SQL Setup

CREATE DATABASE cars_db;
CREATE TABLE cars (id SERIAL PRIMARY KEY, make VARCHAR(50), model VARCHAR(50), year INTEGER, price DECIMAL(10,2), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);

## Features
✅ Full CRUD  
✅ Search/Filter  
✅ Sort/Pagination  
✅ Bulk Insert  
✅ Responsive UI


