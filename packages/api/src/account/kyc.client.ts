import type { ApiClient } from "../client";
import type { KycDocumentType } from "../types";
import type {
  KycDocumentRequest,
  KycStatusResponse,
  SubmitIdentityInput,
} from "./kyc.dto";
import { accountKycEndpoints as ep } from "./kyc.endpoint";

/** Account KYC (`/account/kyc`). */
export function createAccountKycApi(client: ApiClient) {
  return {
    status() {
      return client.request<KycStatusResponse>(ep.root);
    },

    submitIdentity(input: SubmitIdentityInput) {
      return client.request<KycStatusResponse>(ep.identity, {
        method: "POST",
        body: input,
      });
    },

    submitDocument(
      documentType: KycDocumentType,
      file: File | Blob,
      filename?: string,
    ) {
      const formData = new FormData();
      formData.append("documentType", documentType);
      if (filename && file instanceof Blob && !(file instanceof File)) {
        formData.append("file", file, filename);
      } else {
        formData.append("file", file);
      }
      return client.request<KycStatusResponse>(ep.documents, {
        method: "POST",
        formData,
      });
    },

    listDocuments() {
      return client.request<{ items: KycDocumentRequest[] }>(ep.documents);
    },
  };
}

export type AccountKycApi = ReturnType<typeof createAccountKycApi>;
