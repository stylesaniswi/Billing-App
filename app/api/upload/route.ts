import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    console.log(formData)
    const file = formData.get("file") as File;
    
    if (!file) {
      return new NextResponse("No file uploaded", { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename with original extension
    const fileExt = file.name.split('.').pop();
    const uniqueFilename = `${uuidv4()}.${fileExt}`;
    const uploadDir = join(process.cwd(), "public", "uploads");
    const filePath = join(uploadDir, uniqueFilename);

    // Write file to public/uploads directory
    await writeFile(filePath, buffer);

    return NextResponse.json({ 
      url: `/uploads/${uniqueFilename}`,
      filename: file.name 
    });
  } catch (error) {
    console.error("[UPLOAD_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}