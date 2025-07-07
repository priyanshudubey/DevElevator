const { Client } = require("basic-ftp");
const fs = require("fs");
const path = require("path");

class FTPService {
  constructor() {
    this.client = new Client();
    this.client.ftp.verbose = false; // Set to true for debugging
  }

  async connect() {
    try {
      await this.client.access({
        host: process.env.FTP_HOST,
        user: process.env.FTP_USER,
        password: process.env.FTP_PASSWORD,
        port: process.env.FTP_PORT || 21,
        secure: false, // Set to true if using FTPS
      });
      console.log("✅ FTP connected successfully");
      return true;
    } catch (error) {
      console.error("❌ FTP connection failed:", error.message);
      throw error;
    }
  }

  async uploadFile(localFilePath, remoteFileName) {
    try {
      await this.connect();

      // Create remote directory if it doesn't exist
      const remoteDir = "/public_html/uploads/linkedin";
      await this.client.ensureDir(remoteDir);

      // Upload file
      const remotePath = `${remoteDir}/${remoteFileName}`;
      await this.client.uploadFrom(localFilePath, remotePath);

      console.log(`✅ File uploaded to: ${remotePath}`);

      // Return the public URL
      const publicUrl = `https://${process.env.FTP_DOMAIN}/uploads/linkedin/${remoteFileName}`;

      return {
        ftpPath: remotePath,
        ftpUrl: publicUrl,
      };
    } catch (error) {
      console.error("❌ FTP upload failed:", error.message);
      throw error;
    } finally {
      this.client.close();
    }
  }

  async deleteFile(ftpPath) {
    try {
      await this.connect();
      await this.client.remove(ftpPath);
      console.log(`✅ File deleted from FTP: ${ftpPath}`);
      return true;
    } catch (error) {
      console.error("❌ FTP delete failed:", error.message);
      throw error;
    } finally {
      this.client.close();
    }
  }

  async fileExists(ftpPath) {
    try {
      await this.connect();
      const list = await this.client.list(path.dirname(ftpPath));
      const fileName = path.basename(ftpPath);
      return list.some((item) => item.name === fileName);
    } catch (error) {
      console.error("❌ FTP file check failed:", error.message);
      return false;
    } finally {
      this.client.close();
    }
  }
}

module.exports = new FTPService();
