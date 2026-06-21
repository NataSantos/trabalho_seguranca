import { Injectable } from '@nestjs/common';
import { randomBytes, createHmac, timingSafeEqual } from 'node:crypto';
import * as QRCode from 'qrcode';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const OTP_DIGITS = 6;
const OTP_STEP_SECONDS = 30;
const OTP_WINDOW = 1;

function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';

  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

function base32Decode(input: string): Buffer {
  const clean = input.replace(/=+$/u, '').toUpperCase();
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (const char of clean) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index < 0) {
      continue;
    }

    value = (value << 5) | index;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

function hotp(secret: string, counter: number): string {
  const key = base32Decode(secret);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeUInt32BE(Math.floor(counter / 2 ** 32), 0);
  counterBuffer.writeUInt32BE(counter & 0xffffffff, 4);

  const hmac = createHmac('sha1', key).update(counterBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return String(code % 10 ** OTP_DIGITS).padStart(OTP_DIGITS, '0');
}

@Injectable()
export class TwoFactorService {
  generateSecret() {
    return base32Encode(randomBytes(20));
  }

  verifyCode(code: string, secret: string) {
    const normalizedCode = code.replace(/\s+/gu, '');
    const currentCounter = Math.floor(Date.now() / 1000 / OTP_STEP_SECONDS);

    for (let offset = -OTP_WINDOW; offset <= OTP_WINDOW; offset += 1) {
      const expected = hotp(secret, currentCounter + offset);
      if (expected.length !== normalizedCode.length) {
        continue;
      }

      if (timingSafeEqual(Buffer.from(expected), Buffer.from(normalizedCode))) {
        return true;
      }
    }

    return false;
  }

  async generateQrCode(secret: string, email: string) {
    const uri = `otpauth://totp/${encodeURIComponent('Curriculos')}%3A${encodeURIComponent(email)}?secret=${encodeURIComponent(secret)}&issuer=${encodeURIComponent('Curriculos')}&algorithm=SHA1&digits=${OTP_DIGITS}&period=${OTP_STEP_SECONDS}`;

    return await QRCode.toDataURL(uri);
  }
}
