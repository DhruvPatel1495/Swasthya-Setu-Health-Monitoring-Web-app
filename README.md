# Swasthya Setu

**Swasthya Setu** is a cloud-native AI-powered remote patient monitoring platform that uses real-time WebSockets, Groq LLaMA3 for vital analysis, and Neo4j for graph relationships.

## Project Structure
```text
web-app/
├── backend/    # Node.js, Express, Socket.IO, MongoDB, Neo4j, Groq API, AWS
├── frontend/   # React (Vite), Tailwind CSS, Recharts, Socket.IO Client
└── docker-compose.yml
```

## Local Development (Without Docker)

### Backend Setup
1. `cd backend`
2. `npm install`
3. Configure `.env` based on the provided template in `backend/.env`. Add genuine credentials for Groq, Neo4j, MongoDB, and AWS S3.
4. `npm run dev`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Deployment with Docker

To run the entire stack locally using containerization:
```bash
docker-compose up --build -d
```
The frontend will be available at `http://localhost:80` and the backend WebSocket/API at `http://localhost:5000`.

---

## ☁️ AWS DEPLOYMENT GUIDE (EC2 & S3)

### 1. AWS S3 Setup (For Patient Reports)
- Open the AWS Console and go to **S3**.
- Click **Create bucket**. Name it `swasthya-setu-reports` (or similar).
- Choose **us-east-1** region (or your preferred region, and update `.env`).
- Uncheck "Block all public access" to allow report downloading, or utilize presigned URLs.
- Create an IAM User with `AmazonS3FullAccess`. Generate an Access Key ID and Secret Access Key. Add these to your backend `.env`.

### 2. AWS EC2 Setup (For Hosting the Application)
- Open the AWS Console and go to **EC2**.
- Click **Launch Instance**.
- **OS**: Ubuntu Server 22.04 LTS.
- **Instance Type**: t2.micro or t2.small.
- **Key Pair**: Create a new key pair or use an existing one to SSH into your instance.
- **Network Settings**: Allow SSH (port 22), HTTP (port 80), and Custom TCP (port 5000 for backend).
- Launch the Instance and note the Public IPv4 address.

### 3. Deploying to EC2

SSH into your EC2 instance:
```bash
ssh -i "your-key.pem" ubuntu@YOUR_EC2_IP
```

Install Docker and Docker Compose on the Ubuntu instance:
```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu
```
*(You may need to log out and log back in for docker group changes to take effect).*

Clone or copy your project files to the EC2 instance, then add your `.env` configuration file in the `backend/` directory:
```bash
nano backend/.env
# Paste your production environment variables here
```

If deploying the frontend to an EC2 instance meant to be accessed via WAN, be sure to update the WebSockets and fetch URLs in React to point to `http://YOUR_EC2_IP:5000` rather than `http://localhost:5000` before composing.

Run Docker Compose in detached mode:
```bash
docker-compose up --build -d
```

### 4. Accessing Production
- Frontend: `http://YOUR_EC2_IP`
- Backend API: `http://YOUR_EC2_IP:5000/api`
