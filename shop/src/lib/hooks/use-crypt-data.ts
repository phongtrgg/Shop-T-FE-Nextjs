import crypto from 'crypto';
import { useState } from 'react';

function CryptData() {
  const [data, setData] = useState<any>();
  const [token, setToken] = useState<string>();
  const [key] = useState<any>('12345678901234567890123456789012');
  const [iv] = useState('1234567890123456');
  function getToken(id: any, email: any) {
    setToken(`458875${id}${email}`);
  }
  function encryptData(data: any, keyString: string, ivString: any) {
    const key = Buffer.from(keyString, 'utf-8');
    const iv = Buffer.from(ivString, 'utf-8');
    const jsonData = JSON.stringify(data);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encryptedData = cipher.update(jsonData, 'utf-8', 'base64');
    encryptedData += cipher.final('base64');
    setData(encryptedData);
  }

  function decryptData(encryptedData: any, keyString: string, ivString: any) {
    const key = Buffer.from(keyString, 'utf-8');
    const iv = Buffer.from(ivString, 'utf-8');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decryptedData = decipher.update(encryptedData, 'base64', 'utf-8');
    decryptedData += decipher.final('utf-8');
    setData(JSON.parse(decryptedData));
  }
  return { encryptData, decryptData, data, key, iv, getToken, token };
}

export default CryptData;
