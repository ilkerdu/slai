// global.d.ts
import { Buffer as ImportedBufferType } from 'buffer/';

declare global {
  interface Window {
    Buffer?: typeof ImportedBufferType;
  }
}
