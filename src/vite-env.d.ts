/// <reference types="vite/client" />

import { Buffer } from 'buffer';

declare global {
  interface Window {
    Buffer: typeof Buffer;
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      disconnect: () => Promise<void>;
    };
  }
}