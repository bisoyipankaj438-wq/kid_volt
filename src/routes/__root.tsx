import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Toaster } from "@/components/ui/sonner";
import appCss from "../styles.css?url";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="text-7xl mb-4">🤖⚡</div>
        <h1 className="text-5xl font-bold">404</h1>
        <p className="mt-2 text-muted-foreground">Page wandered off to spend money.</p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-primary-foreground font-semibold shadow-soft"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "KidVolt — Save While You Play" },
      {
        name: "description",
        content:
          "A fun game that secretly builds money habits. Gamified financial learning for kids and parents.",
      },
      { property: "og:title", content: "KidVolt — Save While You Play" },
      { property: "og:description", content: "A fun game that secretly builds money habits." },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: () => <Outlet />,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <ConvexProvider client={convex}>{children}</ConvexProvider>
        <Toaster position="top-center" richColors theme="dark" />
        <Scripts />
      </body>
    </html>
  );
}
