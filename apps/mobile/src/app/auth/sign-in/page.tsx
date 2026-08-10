import { redirect } from "next/navigation";

type SignInPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

/** Legacy path — prefer `/auth/login`. */
export default async function SignInRedirectPage({
  searchParams,
}: SignInPageProps) {
  const params = (await searchParams) ?? {};
  const next = params.next;
  const nextValue = Array.isArray(next) ? next[0] : next;
  if (nextValue && nextValue.startsWith("/")) {
    redirect(`/auth/login?next=${encodeURIComponent(nextValue)}`);
  }
  redirect("/auth/login");
}
