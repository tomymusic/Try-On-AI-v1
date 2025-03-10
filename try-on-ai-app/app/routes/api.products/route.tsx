import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../../shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  console.log("🔍 Iniciando loader para obtener el producto actual...");

  try {
    console.log("📡 Request recibido:", request.url);

    // ✅ Obtener el parámetro `handle` o `id` de la URL
    const url = new URL(request.url);
    const handle = url.searchParams.get("handle"); // Nombre único del producto
    const productId = url.searchParams.get("id"); // ID único del producto

    // ✅ Validar que al menos un identificador fue proporcionado
    if (!handle && !productId) {
      console.error("🚨 Error: No se proporcionó ni `handle` ni `id` en la URL.");
      return new Response(JSON.stringify({ error: "Falta el identificador del producto." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ✅ Autenticar administrador
    const session = await authenticate.admin(request).catch(() => null);
    if (!session) {
      console.error("🚨 No hay sesión válida, redirigiendo a login.");
      return new Response(null, {
        status: 302,
        headers: { Location: "/auth/login" },
      });
    }
    console.log("🔑 Admin autenticado:", session ? "✅ Sí" : "❌ No");

    // ✅ Consulta GraphQL optimizada para obtener solo el producto solicitado
    const query = `#graphql
      query {
        ${handle ? `productByHandle(handle: "${handle}")` : `product(id: "${productId}")`} {
          id
          title
          descriptionHtml
          featuredImage {
            url
          }
          variants(first: 5) {
            edges {
              node {
                id
                price
              }
            }
          }
        }
      }`;

    console.log("📄 Enviando consulta GraphQL:", query);

    // ✅ Ejecutar la consulta GraphQL con la sesión autenticada
    const response = await session.admin.graphql(query);

    console.log("📡 Respuesta de Shopify recibida:", JSON.stringify(response, null, 2));

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error inesperado en el endpoint de productos:", error);
    return new Response(JSON.stringify({ error: "Error interno del servidor" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
