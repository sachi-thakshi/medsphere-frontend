# MedSphere Frontend Web Portal

A high-performance Single Page Application (SPA) providing real-time operational oversight and management for clinical resources, medical personnel, and patient appointments across the MedSphere healthcare cloud platform.

---

## 1. Architecture Overview

The application connects directly to the MedSphere API Gateway Load Balancer. It fetches asynchronous state via Axios and renders interactive components with low latency using React 18, Vite, and Tailwind CSS.

```text
+---------------------+        HTTP/REST        +---------------------------+
| React SPA           | ----------------------> | GCP Load Balancer (Proxy) |
| (Port 80 / 3000)    |  CORS Pre-flight & JSON | 8.233.25.55:80 / 7000     |
+---------------------+                         +---------------------------+
```

---

## 2. Tech Stack & Dependencies

* **Core Framework:** React 18 (Functional Components, Hooks)
* **Build Tool:** Vite
* **Styling Engine:** Tailwind CSS & Lucide Icons
* **HTTP Client:** Axios (Configured with request/response interceptors)
* **Routing:** React Router DOM v6

---

## 3. Environment Variables

Create a `.env` file in the project root:

```env
# URL of the External GCP Load Balancer / API Gateway
VITE_API_BASE_URL=http://8.233.25.55

# Application Port (Development)
PORT=3000
```

---

## 4. Key Functional Modules

### Executive Dashboard

Live metrics displaying:

* Total active doctors
* Clinical procedure catalogs
* Scheduled patient visits

### Doctor Directory

View and manage specialist information, including:

* Specialist profiles
* Room numbers
* Experience levels
* Active consultation states:

  * `AVAILABLE`
  * `IN_CONSULTATION`
  * `OFF_DUTY`

### Clinical Services

A catalog of diagnostic and therapeutic procedures containing:

* Procedure names
* Associated costs
* Expected execution times

### Appointment Scheduling

Modal-driven appointment management with real-time status updates:

* `CONFIRMED`
* `PENDING`
* `CANCELLED`

---

## 5. Local Setup & Execution

### Prerequisites

* Node.js >= 18.x
* npm >= 9.x

### Clone the Repository

```bash
git clone https://github.com/medsphere/medsphere-frontend.git
cd medsphere-frontend
```

### Install Dependencies

```bash
npm install
```

### Start the Local Development Server

```bash
npm run dev
```

The application will run using the configured Vite development server.

### Create a Production Build

```bash
npm run build
```

The production-ready files will be generated in the `dist` directory.

---

## 6. Production Deployment

The application can be served as a static SPA using Nginx.

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name _;

    root /var/www/html/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests if co-located
    location /api/v1/ {
        proxy_pass http://8.233.25.55/api/v1/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

The `try_files` configuration ensures that React Router routes are correctly redirected to `index.html`, allowing client-side routing to work after deployment.

---

## 7. Production Build Workflow

A typical production deployment workflow is:

```bash
# Install dependencies
npm install

# Build the application
npm run build
```

Then serve the generated `dist` directory through Nginx:

```text
/var/www/html/dist
```

---

## 8. API Connectivity

The frontend communicates with the MedSphere API through the configured API Gateway / GCP Load Balancer.

Default API endpoint:

```text
http://8.233.25.55
```

If API requests are proxied through Nginx, requests under:

```text
/api/v1/
```

are forwarded to:

```text
http://8.233.25.55/api/v1/
```

Ensure that the backend API supports the required CORS configuration when the frontend communicates with it directly from the browser.

---

## 9. Project Summary

MedSphere Frontend provides a responsive operational interface for managing clinical operations, including:

* Real-time healthcare operational metrics
* Doctor and specialist management
* Clinical service and procedure catalogs
* Patient appointment scheduling
* Appointment status monitoring
* SPA-based client-side routing
* REST API integration through Axios
* Production deployment with Nginx

---

## 10. License

Refer to the repository's license file for licensing and usage information.
