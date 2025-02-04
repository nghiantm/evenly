# Evenly Monorepo

## Overview
Evenly is a monorepo containing a React frontend and a Spring Boot-based backend. The backend provides a secure and scalable API, integrated with Swagger for API documentation, JWT authentication, and MySQL as the database. The frontend is built using React.

## Architecture Diagram
Coming...

## Features
- **Frontend:** React
- **Backend:** Spring Boot 3.4.1
- **Authentication:** JWT-based authentication with Spring Security
- **Database:** MySQL integration with Spring Data JPA
- **API Documentation:** Swagger (Springdoc OpenAPI)
- **Testing:** Unit and integration testing using JUnit and Rest Assured

## Prerequisites
Make sure you have the following installed:
- Java 17
- Maven 3.6+
- Node.js & npm/yarn
- MySQL Database

## Getting Started

### Clone the Repository
```sh
git clone https://github.com/nghiantm/evenly.git
cd evenly
```

### Setting up the Backend
Contact me for env.properties.

#### Build and Run the Backend
```sh
cd backend
mvn clean install
mvn spring-boot:run
```

## API Documentation
Once the backend is running, access Swagger UI at:
```
http://localhost:8080/swagger-ui/index.html
```

## Database Schema
[![db_schema](https://i.postimg.cc/HnbstDJT/evenly-db.png)](https://postimg.cc/tnCjXctc)

## Running Tests
Run the tests using:
```sh
mvn test  # for backend
yarn test  # for frontend
```

## Contact
For any issues, feel free to reach out or create an issue in the repository.

