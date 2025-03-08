import { NextRequest, NextResponse } from "next/server";
import cloudinary from "cloudinary";

// 🔥 Configuración de Cloudinary con credenciales desde Vercel
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    console.log("📌 Recibiendo imagen para subir a Cloudinary...");

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.error("❌ No se envió una imagen válida");
      return NextResponse.json({ error: "Invalid image file" }, { status: 400 });
    }

    // 📸 Convertir la imagen a Base64 para Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");
    const dataUri = `data:image/png;base64,${base64Image}`;

    // 🚀 Subir imagen a Cloudinary
    const uploadResponse = await cloudinary.v2.uploader.upload(dataUri, {
      folder: "user_uploads",
    });

    console.log("✅ Imagen subida con éxito:", uploadResponse.secure_url);

    return NextResponse.json({ imageUrl: uploadResponse.secure_url }, { status: 200 });
  } catch (error) {
    console.error("❌ Error al subir imagen a Cloudinary:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
