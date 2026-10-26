import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { Encabezado, PaginaNoEncontrada, Pie } from "../components/criterio";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return <PaginaNoEncontrada />;
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Esta página no cargó
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Algo salió mal. Puedes reintentar o volver al inicio.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Reintentar
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Ir al inicio
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Criterio — Metodologías para aprender el porqué del desarrollo" },
      {
        name: "description",
        content:
          "19 metodologías de aprendizaje aplicadas a Python, DDD y TDD, medidas en el tiempo: antes de aprender (t<0), al aprender (t=0) y después (t>0). Pruébalas y elige las que te hacen aprender.",
      },
      { name: "author", content: "benjacode" },
      { name: "theme-color", content: "#5b2bd9" },
      { property: "og:site_name", content: "Criterio" },
      {
        property: "og:title",
        content: "Criterio — Metodologías para aprender el porqué del desarrollo",
      },
      {
        property: "og:description",
        content:
          "Prueba 19 metodologías de aprendizaje con ejemplos de Python, DDD y TDD, y elige las que te hacen aprender.",
      },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "es_PE" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "alternate", type: "text/plain", href: "/llms.txt", title: "Resumen para asistentes" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

// Some hosts (e.g. Netlify Edge) inject nodes into the SSR HTML that the client
// never renders: an attribution comment in <head> and a "/.netlify/scripts/hud"
// script at the end of <body>. Because TanStack Start hydrates the WHOLE document,
// those extra nodes break hydration (React #418). This classic inline script runs
// during HTML parsing — before the async hydration module — and removes any such
// host-injected node (via a MutationObserver so it also catches nodes streamed in
// after this point), keeping the DOM identical to what the client renders.
const STRIP_HOST_INJECTIONS = `(function(){try{
  var junk=function(n){
    if(n.nodeType===8)return /netlify|hosted on|utm_/i.test(n.nodeValue||"");
    if(n.nodeType===1&&n.tagName==="SCRIPT"){
      var s=n.getAttribute("src")||"";
      if(/\\/\\.netlify\\/scripts\\//.test(s))return true;
      if(n.hasAttribute("data-netlify-site-id")||n.hasAttribute("data-app-host"))return true;
    }
    return false;
  };
  var sweep=function(r){if(!r)return;for(var i=r.childNodes.length-1;i>=0;i--){if(junk(r.childNodes[i]))r.removeChild(r.childNodes[i]);}};
  sweep(document.head);
  var mo=new MutationObserver(function(m){for(var i=0;i<m.length;i++){var a=m[i].addedNodes;for(var j=0;j<a.length;j++){if(junk(a[j])&&a[j].parentNode)a[j].parentNode.removeChild(a[j]);}}});
  mo.observe(document.documentElement,{childList:true,subtree:true});
  addEventListener("DOMContentLoaded",function(){sweep(document.head);sweep(document.body);setTimeout(function(){mo.disconnect();},0);});
}catch(e){}})();`;

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <script dangerouslySetInnerHTML={{ __html: STRIP_HOST_INJECTIONS }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen overflow-x-hidden">
        <Encabezado />
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
        <Pie />
      </div>
    </QueryClientProvider>
  );
}
