import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ResponsiveMetadataForm } from "@/components/templates/ResponsiveMetadataForm";

export default async function CreateYoutubeMetadataPage() {
  // Check for session cookie (middleware also checks, but this is a backup)
  // Full database session validation is handled separately
  // const cookieStore = await cookies();
  // const cookieName = process.env.SESSION_COOKIE_NAME ?? "sid";
  // const sessionId = cookieStore.get(cookieName)?.value;

  // if (!sessionId) {
  //   redirect("/");
  // }

  // TODO: Add full session validation with database when Prisma is configured
  // const user = await getCurrentUser();
  // if (!user) { redirect("/"); }

  return (
    <main 
      id="main-content" 
      className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-12 pt-6 sm:px-6 lg:px-8"
      aria-label="YouTube metadata generation"
    >
      <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl">
        Create YouTube thumbnails and metadata
      </h1>

      <ResponsiveMetadataForm />
    </main>
  );
}

