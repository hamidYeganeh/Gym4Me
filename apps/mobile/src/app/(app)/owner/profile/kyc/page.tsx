import { redirect } from "next/navigation";

/** Alias — prefer `/{role}/kyc`. */
export default function Page() {
  redirect("/owner/kyc");
}
