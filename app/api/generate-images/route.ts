import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    console.log("📌 API recibió una solicitud");

    // ✅ Recibimos ambas imágenes y la descripción de la prenda
    const { userImage, productImage, productDescription, productCategory } = await req.json();
    console.log("✅ Recibido en la API:", { userImageLength: userImage?.length, productImage, productDescription, productCategory });

    if (!userImage || !productImage || !productDescription || !productCategory) {
      console.error("❌ Faltan datos: userImage, productImage, productDescription o productCategory", { userImageLength: userImage?.length, productImage, productDescription, productCategory });
      return NextResponse.json({ error: "User image, product image, product description, and product category are required" }, { status: 400 });
    }

    // 🔥 Asegurar que la categoría solo sea una de las 3 permitidas
    const validCategories = ["upper_body", "lower_body", "dresses"];
    if (!validCategories.includes(productCategory)) {
      console.error("❌ Error: La categoría del producto no es válida para este modelo.");
      return NextResponse.json({ error: "Product category is not supported." }, { status: 400 });
    }

    console.log("🔄 Enviando solicitud a Replicate...");
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN!,
    });

    // 🔥 Enviar las dos imágenes al nuevo modelo
    const prediction = await replicate.predictions.create({
      version: "c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4", // Nuevo modelo dm-vton
      input: {
        human_img: userImage,                         // 📸 Imagen del usuario (URL)
        garm_img: productImage,                       // 👕 Imagen del producto (URL)
        garment_des: productDescription,              // 📄 Descripción de la prenda
        category: productCategory,                    // 🏷️ Solo upper_body, lower_body, dresses
        crop: true,                                   // ✂️ Activamos crop por defecto
        seed: 42,                                     // 🌱 Fijamos la semilla en 42 (consistencia en resultados)
        steps: 30,                                    // 🔄 Número de pasos de inferencia
        force_dc: false,                              // ❌ No activamos DressCode (excepto si category = dresses)
        mask_only: false                              // ❌ No queremos solo la máscara, queremos la imagen final
      },
    });

    console.log("🔍 Predicción iniciada en Replicate:", prediction);

    if (!prediction || !prediction.urls || !prediction.urls.get) {
      console.error("❌ Replicate no devolvió una URL de predicción válida", prediction);
      return NextResponse.json({ error: "Failed to initiate prediction" }, { status: 500 });
    }

    // 🔄 Esperamos la respuesta de Replicate
    let response;
    while (!response || response.status !== "succeeded") {
      await new Promise((res) => setTimeout(res, 2000)); // Esperamos 2 segundos entre cada consulta
      response = await fetch(prediction.urls.get, {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
      }).then((res) => res.json());
      console.log("🔄 Estado de la predicción:", response.status);
    }

    console.log("✅ Respuesta final de Replicate:", response);

    // ✅ Verificamos si la respuesta contiene la propiedad output
    let finalImage: string | null = null;

    if (typeof response.output === "string") {
      finalImage = response.output; // ✅ Caso cuando output es una string (URL de la imagen)
    } else if (Array.isArray(response.output) && response.output.length > 0) {
      finalImage = response.output[response.output.length - 1]; // ✅ Caso cuando es un array
    }

    if (!finalImage) {
      console.error("❌ Replicate no devolvió una imagen válida", response);
      return NextResponse.json({ error: "Failed to get image" }, { status: 500 });
    }

    console.log("✅ Imagen generada:", finalImage);
    return NextResponse.json({ image_url: finalImage }, { status: 200 });
  } catch (error) {
    console.error("❌ Error en la API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
