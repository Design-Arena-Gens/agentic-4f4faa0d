"use client";

import imageCompression from "browser-image-compression";
import { FFmpeg } from "@ffmpeg/ffmpeg";

let ffmpegInstance: FFmpeg | null = null;

async function getFfmpeg() {
  if (!ffmpegInstance) {
    ffmpegInstance = new FFmpeg();
    await ffmpegInstance.load({
      coreURL: "https://unpkg.com/@ffmpeg/core@0.12.7/dist/umd/ffmpeg-core.js",
      wasmURL: "https://unpkg.com/@ffmpeg/core@0.12.7/dist/umd/ffmpeg-core.wasm",
      workerURL: "https://unpkg.com/@ffmpeg/core@0.12.7/dist/umd/ffmpeg-core.worker.js",
    });
  }
  return ffmpegInstance;
}

export async function compressImage(file: File): Promise<File> {
  try {
    const compressedBlob = await imageCompression(file, {
      maxWidthOrHeight: 1800,
      maxSizeMB: 2,
      initialQuality: 0.8,
      useWebWorker: true,
    });

    return new File([compressedBlob], file.name, { type: compressedBlob.type });
  } catch (error) {
    console.warn("Image compression failed", error);
    return file;
  }
}

export async function compressVideo(file: File): Promise<File> {
  try {
    const ffmpeg = await getFfmpeg();
    const inputName = "input" + getExtension(file.name);
    const outputName = "output.mp4";

    const fileData = new Uint8Array(await file.arrayBuffer());
    await ffmpeg.writeFile(inputName, fileData);
    await ffmpeg.exec([
      "-i",
      inputName,
      "-vf",
      "scale=iw*0.8:ih*0.8",
      "-b:v",
      "1200k",
      "-preset",
      "veryfast",
      outputName,
    ]);

    const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
    const arrayBuffer = data.slice().buffer;
    const blob = new Blob([arrayBuffer], { type: "video/mp4" });
    await ffmpeg.deleteFile(inputName);
    await ffmpeg.deleteFile(outputName);

    const optimizedName = file.name.endsWith(".mp4") ? file.name : `${file.name.split(".")[0]}-compressed.mp4`;
    return new File([blob], optimizedName, { type: "video/mp4" });
  } catch (error) {
    console.warn("Video compression failed", error);
    return file;
  }
}

function getExtension(filename: string) {
  const parts = filename.split(".");
  return parts.length > 1 ? `.${parts.pop()}` : "";
}
