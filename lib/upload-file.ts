export async function uploadSingleFile(file: File): Promise<{ url: string; key: string; name: string }> {
  const presignRes = await fetch("/api/media/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      folder: "general",
    }),
  });
  if (!presignRes.ok) {
    const err = await presignRes.json().catch(() => ({}));
    throw new Error(err.error?.message || "Gagal mendapatkan kebenaran muat naik");
  }
  const { data: { uploadUrl, fileKey, publicUrl } } = await presignRes.json();

  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!putRes.ok) throw new Error("Gagal memuat naik fail ke storan");

  const registerRes = await fetch("/api/media", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: file.name,
      filePath: publicUrl,
      fileKey,
      fileType: file.type,
      fileSize: file.size,
      folder: "general",
    }),
  });
  if (!registerRes.ok) throw new Error("Gagal mendaftarkan fail");
  const { data } = await registerRes.json();
  return { url: data.filePath, key: data.fileKey, name: data.fileName };
}

export async function getCroppedBlob(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  fileName: string,
): Promise<File> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);

  return new Promise<File>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) { reject(new Error("Gagal memproses imej")); return; }
      const baseName = fileName.replace(/\.[^/.]+$/, "");
      resolve(new File([blob], `${baseName}_crop.jpg`, { type: "image/jpeg" }));
    }, "image/jpeg", 0.92);
  });
}
