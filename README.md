
# Drone Delivery Mission Management

## Overview

Drone Delivery Mission Management is a web-based application for managing drone delivery missions with secure search, validation, and update workflows. The system supports:
- dual-key mission lookup using `Mission ID` + `Operator ID`
- detailed mission information display
- controlled updates only when business rules allow
- optional MongoDB persistence or an in-memory mock database for fast demo

## Features

- Search missions by `missionId` and `operatorId`
- Display full mission details and status
- Allow updates only for missions with status `Pending`
- API-driven backend with static frontend pages
- Session and cookie support for user interactions
- Seed script for sample data loading
- Mock DB support to run without MongoDB

## Project Structure

- `server.js` — main Express server
- `routes/missions.js` — API route definitions
- `controllers/missionController.js` — mission search, update, and list logic
- `models/Mission.js` — Mongoose schema for mission data
- `config/db.js` — MongoDB connection settings
- `config/mockDB.js` — in-memory mock database adapter
- `public/` — frontend HTML/CSS/JS pages
- `seed/seedData.js` — sample data seeder
- `.gitignore` — files excluded from Git

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Ashish4147/Drone-Delivery-Mission-Manangement.git
   cd Drone-Delivery-Mission-Manangement
