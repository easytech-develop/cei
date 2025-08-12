import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Middleware simples - apenas protege rotas
    return;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Permitir acesso a páginas públicas
        const publicPaths = ["/auth/signin", "/auth/error"];
        const isPublicPath = publicPaths.some(path =>
          req.nextUrl.pathname.startsWith(path)
        );

        if (isPublicPath) {
          return true;
        }

        // Para outras rotas, verificar se está autenticado
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
