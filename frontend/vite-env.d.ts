/// <reference types="vite/client" />

import type { PharmacyApi } from "../backend/types/api";

declare global {
  interface Window {
    api: PharmacyApi;
  }
}
