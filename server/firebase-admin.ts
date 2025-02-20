import { initializeApp, cert, ServiceAccount } from "firebase-admin/app";
import { Auth, getAuth } from "firebase-admin/auth";
import * as fs from 'fs';
import * as path from 'path';

// Read the service account file
const serviceAccountPath = path.join(process.cwd(), 'attached_assets/mlm-web-f2466-firebase-adminsdk-fbsvc-2ae2b2297f.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Initialize Firebase Admin with the service account
const app = initializeApp({
  credential: cert(serviceAccount)
});

export const auth = getAuth(app);