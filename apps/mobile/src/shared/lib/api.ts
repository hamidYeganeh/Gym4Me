import {
  ACCOUNT_SESSION_KEY,
  createAccountAuthApi,
  createApiClient,
  createLocalStorage,
} from "@repo/api";
import { getApiBaseUrl } from "./env";

const storage = createLocalStorage(ACCOUNT_SESSION_KEY);

export const apiClient = createApiClient({
  baseUrl: getApiBaseUrl(),
  storage,
});

export const accountAuth = createAccountAuthApi(apiClient);
