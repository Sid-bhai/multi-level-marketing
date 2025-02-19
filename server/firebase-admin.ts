import { initializeApp, cert, ServiceAccount } from "firebase-admin/app";
import { Auth, getAuth } from "firebase-admin/auth";

const serviceAccount = {
  "type": "service_account",
  "project_id": "mlm-web-f2466",
  "private_key_id": "2ae2b2297fd26eee991ab45f958686ceef4d7c4e",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDI45fy0OyLuEJu\n27GP//Jn/j7HxYb29iKgNxRDPhRi/TEj4Yq7v5aUclw1dXMw56U5++rRtgoE/dWH\nYB0sfLNvcpJPn6r4GFZqyoSnlswZFHGk0GS4ThfMbBxK9YljXpY9jWJFl5eTtTYo\nsN3bpjCFrX0ZQmYjCCbXZ8xTZDcYY1mNCcZZ81tIdYGqvm/rP0307aYY8rImqrKU\nXSDsFJPqL9gxqPQp7kS9uYSFXwuZjm6NgRd8qhmaOTbiewF5jg+ctb25GphznowR\nUn1tviVdmZrGq7oEmy2OKk5YArzdjhlC6sVHTk8oz9St/kKfZ8QeGeSCbq4k+e58\nU2A4/bY1AgMBAAECggEALyxOqpzH5zliFEEvrYZnSGdKG8Q1ILoEwIWekvm5dNNK\n3kegudzQAdTm9UC6x4Gl6XtQFWW/bZOjuDHoN+Giiymm1N7EGZUxectLokUFcWA9\nHXw4IpVn/j9m121YEUcNVa/lIz1pQSy85oo91s3sN//Yz/0pGdHYuR1tPCnczDNh\nqSXnKkv6KtO1nhi/P+Jrpa14ldNtYKG+aiky4kB+ZWb0KZRO5ruaTHglczILob13\nUpD66f3sedaN4khd9764XBlfDvO3t7jlm3OBkYuKNArdvIqVnwBcfG3yKwpfnix2\nASxdELumOlTTxq4Wfc9g8qVHo5WTjua7KY6DQegoIQKBgQDrJL1WtaBD8jLyTcax\n/RNOuxGPmkRSGu9ton8PQKhFN7Rj2gOU9mD1PBmbb+4017tDWulLGBcRQ49Xgn3q\nNo3Mjsqt9zbYOBVZOOb6SW+qsyJgyzzoUeRmxsyMHafjvkIqkU0L7Rsycx1Q6ApC\n2N3KxzpxGZCgqPspcQ2f4KtsMQKBgQDatQ71EM42sDbbwMUd4JH1fjn4SACsDILm\n3EPwdY+YU4aD9jmpkxOpDMIjRC0UisMoIuSgTZI8EXItAwvZmnA0Gk6mp2LN1zwo\nYnpZoQgo+s9tbTNhbdAxzT1LX4QiA8ov26u+PcizVEIv4Dz9SlRlx9ohnFTlpQL4\nCpImPggdRQKBgHSKS/DKqbijNE7U71JNrKELpAN5IL1Uri+3JqQHlp5fol8OsVHF\n3n4MoGBiVDwKY7xZNWDLertKsaNcgE1xZkvoxVj9OkhlW2dSBWAsv1Rp3fL9J524\n4KtzgfM7y3bbV+3C/92WUTFqzi/IITXKR/p1TWi6k+ycc4aximAfuLYxAoGAftay\nrf3pGl5n8lqB9ynefHmQNSXM/frjj+/+lt4XZmZKhQ2vs2DQ7iGwFbPcUSWIuSZD\nYZSbUqrrhJ9XqAOhPxZittQswSQqh2FVg9WYXevXkKbcPYzqSXe2LJhgkTmRcN/9\nYn+Cfj5HhGyP8nXBLKYTI5r+wZBJgIDg8bzYB+ECgYEAwC5VVTN28HliY+xMdXXu\nMGt4QI/XxePo85r4solBDDfHHBQBrj5C4X9fNjZLskjiqGwHOScoqGZN/Igrettb\nn6rxEMlBROrXyT9wmTrPHuTaBHzWqcdtaIohsxdj1w5sWoFbxMQAQg0Dq9pCJal/\nhDJ6k9wz3iTm0UOENAv1hak=\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@mlm-web-f2466.iam.gserviceaccount.com",
  "client_id": "104775819479945810388",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40mlm-web-f2466.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
} as ServiceAccount;

const app = initializeApp({
  credential: cert(serviceAccount)
});

export const auth = getAuth(app);