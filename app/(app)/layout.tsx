import Sidebar from "@/app/ui/Sidebar";
import ContentWrapper from "@/app/ui/ContentWrapper";
import { auth0 } from "@/lib/auth0";

// Layout del panel administrativo (todo lo que vive bajo /panel). La landing
// pública en app/(marketing)/ no pasa por acá, así que no carga sidebar ni
// sesión de Auth0.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth0.getSession();
  const userLabel = session?.user?.email ?? session?.user?.name ?? null;

  return (
    <>
      <Sidebar userLabel={userLabel} />
      <ContentWrapper>{children}</ContentWrapper>
    </>
  );
}
