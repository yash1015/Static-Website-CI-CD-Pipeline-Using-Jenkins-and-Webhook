Static Website CI/CD Pipeline Using Jenkins and Webhooks

## Overview

This project demonstrates a simple **CI/CD pipeline** for deploying a Node.js static website using **Jenkins, Docker, and GitHub Webhooks**.
Whenever code is pushed to the GitHub repository, Jenkins automatically triggers a pipeline to test, build, and deploy the application on server .

---

## Tech Stack

* **Node.js** – Backend server
* **Docker** – Containerization
* **Jenkins** – CI/CD automation
* **GitHub Webhooks** – Automatic pipeline trigger
* **AWS EC2** – Deployment server

---

## Project Structure

```
.
├── public/
│   └── index.html
├── tests/
│   └── server.test.js
├── Dockerfile
├── Jenkinsfile
├── package.json
├── package-lock.json
└── server.js
```

---

## CI/CD Pipeline Flow

1. Developer pushes code to GitHub.
2. GitHub Webhook triggers Jenkins pipeline.
3. Jenkins installs project dependencies.
4. Automated tests are executed.
5. Docker image is built from the Dockerfile.
6. Existing container (if running) is stopped and removed.
7. A new container is deployed.

---

## Running the Application Locally

Install dependencies:

```
npm install
```

Run the application:

```
node server.js
```

Open in browser:

```
http://localhost:3000
```

---

## Running with Docker

Build the image:

```
docker build -t node-app .
```

Run the container:

```
docker run -d -p 3000:3000 node-app
```

Access the application:

```
http://localhost:3000
```

---

## Jenkins Pipeline Stages

* Install Dependencies
* Run Tests
* Build Docker Image
* Stop Existing Container
* Deploy New Container

---

## Purpose

This project is created as part of a **DevOps learning journey** to demonstrate a basic CI/CD pipeline using Jenkins and Docker with automated testing.

---

## Author

**Yash Kangude**
