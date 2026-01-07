# Deployment Guide

This guide describes how to deploy the **Coin Tracker** application to the internet.

## Option 1: Vercel (Recommended)

Vercel is the creators of Next.js and provides the easiest, fastest, and free (for hobby usage) deployment experience.

### 1. Create a Vercel Account
1. Go to [vercel.com](https://vercel.com).
2. Sign up using your **GitHub** account.

### 2. Import the Project
1. On your Vercel dashboard, click **"Add New..."** -> **"Project"**.
2. You should see a list of your GitHub repositories. Find `Coin-Tracker` and click **"Import"**.

### 3. Configure and Deploy
1. **Framework Preset**: It should automatically detect `Next.js`.
2. **Root Directory**: Leave as `./`.
3. **Environment Variables**: This project currently typically does **not** require any API keys for basic functionality (it uses public APIs).
    * _Note: If you later add private keys, expand "Environment Variables" and add them there._
4. Click **"Deploy"**.

### 4. Wait for Build
Vercel will clone your repo, install dependencies, and build the project. This usually takes 1-2 minutes.
Once complete, you will get a live URL (e.g., `https://coin-tracker-yourname.vercel.app`).

### 5. Automatic Updates
From now on, every time you push changes to the `main` branch on GitHub, Vercel will automatically redeploy your site!

---

## Option 2: Docker (Self-Hosted)

If you have your own VPS (Virtual Private Server) like DigitalOcean, Linode, or AWS EC2, you can run the app using Docker.

### Prerequisites
- A server with **Docker** installed.
- **Git** installed on the server.

### deployment Steps

1. **Clone the Repository** on your server:
   ```bash
   git clone https://github.com/AtaAkkuzuluoglu/Coin-Tracker.git
   cd Coin-Tracker
   ```

2. **Build the Image**:
   ```bash
   docker build -t coin-tracker .
   ```

3. **Run the Container**:
   Run the container in detached mode (`-d`), mapping port 3000 to port 80 (HTTP default) or 3000.
   ```bash
   # Make accessible on port 3000
   docker run -d -p 3000:3000 --name coin-tracker --restart always coin-tracker
   ```

4. **Access the App**:
   Open your browser and navigate to `http://YOUR_SERVER_IP:3000`.

### Notes
- The `Dockerfile` uses a multi-stage build, so the final image is optimized and small.
- For HTTPS on your own server, you will need to set up a reverse proxy (like Nginx) and use Certbot/Let's Encrypt.
