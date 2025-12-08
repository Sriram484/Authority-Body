

import * as fabric from "fabric";
import {  hashPayloadToBytes,
  embedHashDistributedBlueMulti,} from "../stenography/stego";
import { embedCertificateIdInPngDataUrl } from "./pngMeta";

type TemplateJson = any;

export interface GenerateImageOptions {
  templateJson: TemplateJson;
  qrDataUrl: string;
  certificateId: string; // used for stego
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function formatToPixels(meta: any, dpi = 96) {
  if (!meta) return null;
  const format = (meta.format ?? "").toString().toLowerCase();
  const orientation = (meta.orientation ?? "portrait").toString().toLowerCase();

  if (format === "a4") {
    const wMm = orientation === "landscape" ? 297 : 210;
    const hMm = orientation === "landscape" ? 210 : 297;
    const mmToPx = dpi / 25.4;
    return {
      width: Math.round(wMm * mmToPx),
      height: Math.round(hMm * mmToPx),
      mmWidth: wMm,
      mmHeight: hMm,
      orientation,
    };
  }

  if (meta.width && meta.height) {
    return {
      width: Number(meta.width),
      height: Number(meta.height),
      orientation,
    };
  }
  return null;
}

// you already have this somewhere; keep your existing implementation:
async function loadImageSafe(src: string, timeoutMs = 8000) {
  return new Promise<HTMLImageElement | ImageBitmap | null>((resolve) => {
    let done = false;
    const finish = (val: HTMLImageElement | ImageBitmap | null) => {
      if (done) return;
      done = true;
      resolve(val);
    };

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => finish(img);
      img.onerror = () => finish(null);
      img.src = src;
    } catch {
      finish(null);
    }

    setTimeout(() => finish(null), timeoutMs);
  });
}

export async function generateFinalImageWithQrAndStego(
  options: GenerateImageOptions
): Promise<string> {
  const { templateJson, qrDataUrl, certificateId } = options;

  try {
    // 1) create offscreen <canvas>
    const el = document.createElement("canvas");

    const meta = templateJson.meta ?? {
      format: "A4",
      orientation: "landscape",
    };
    const dims = formatToPixels(meta, 96) || {
      width: 1122,
      height: 793,
      orientation: "landscape",
      mmWidth: 297,
      mmHeight: 210,
    };

    el.width = Math.round(dims.width);
    el.height = Math.round(dims.height);

    const canvas = new fabric.Canvas(el, {
      width: el.width,
      height: el.height,
      backgroundColor: templateJson.background ?? "#ffffff",
      preserveObjectStacking: true,
      renderOnAddRemove: false,
      enableRetinaScaling: true,
    });

    const objs = Array.isArray(templateJson.objects)
      ? templateJson.objects
      : [];
    const deferredImagePromises: Promise<void>[] = [];

    let bgRectInstance: fabric.Rect | null = null;

    // ---------- rebuild template (same as your current logic) ----------
    for (const obj of objs) {
      const f = obj.fabric ?? {};
      const rawType = (f.type ?? "").toString().toLowerCase();
      const hasVariableKey = typeof obj.variableKey !== "undefined";

      try {
        // TEXT
        if (
          rawType.includes("text") ||
          rawType === "itext" ||
          rawType === "i-text" ||
          rawType === "textbox" ||
          typeof f.text !== "undefined"
        ) {
          const text = String(f.text ?? f.value ?? "");
          const opts: any = {
            left: f.left ?? 0,
            top: f.top ?? 0,
            angle: f.angle ?? 0,
            fontSize: f.fontSize ?? 16,
            fontFamily: f.fontFamily ?? undefined,
            fill: f.fill ?? "#000",
            textAlign: f.textAlign ?? "left",
            originX: f.originX ?? "center",
            originY: f.originY ?? "center",
            selectable: false,
            evented: false,
          };

          let inst: fabric.IText | fabric.Textbox;
          if (f.width) {
            inst = new fabric.Textbox(text, { ...opts, width: f.width } as any);
          } else {
            inst = new fabric.IText(text, opts as any);
          }
          if (f.scaleX) inst.scaleX = f.scaleX;
          if (f.scaleY) inst.scaleY = f.scaleY;

          canvas.add(inst);
          continue;
        }

        // IMAGES
        if (rawType.includes("image") || f.src || f.url) {
          const src = f.src ?? f.url ?? null;
          if (!src) {
            const rect = new fabric.Rect({
              left: f.left ?? 0,
              top: f.top ?? 0,
              width: f.width ?? 100,
              height: f.height ?? 30,
              fill: "transparent",
              selectable: false,
              evented: false,
            });
            canvas.add(rect);
            continue;
          }

          const p = (async () => {
            const loaded = await loadImageSafe(src, 12000);
            if (!loaded) {
              const rect = new fabric.Rect({
                left: f.left ?? 0,
                top: f.top ?? 0,
                width: f.width ?? 100,
                height: f.height ?? 30,
                fill: "transparent",
                selectable: false,
                evented: false,
              });
              canvas!.add(rect);
              return;
            }

            let fabricImg: fabric.Image;
            if ((loaded as ImageBitmap).close) {
              const ib = loaded as ImageBitmap;
              const off = document.createElement("canvas");
              off.width = ib.width;
              off.height = ib.height;
              const ctx = off.getContext("2d")!;
              ctx.drawImage(ib, 0, 0);
              fabricImg = new fabric.Image(off as any, {});
            } else {
              fabricImg = new fabric.Image(loaded as HTMLImageElement, {});
            }

            fabricImg.set({
              left: f.left ?? 0,
              top: f.top ?? 0,
              angle: f.angle ?? 0,
              originX: f.originX ?? "center",
              originY: f.originY ?? "center",
              selectable: false,
              evented: false,
            });

            const targetW = f.width ? f.width * (f.scaleX ?? 1) : undefined;
            const targetH = f.height ? f.height * (f.scaleY ?? 1) : undefined;
            if (targetW && targetH && fabricImg.width && fabricImg.height) {
              const sx = targetW / fabricImg.width!;
              const sy = targetH / fabricImg.height!;
              fabricImg.scaleX = sx;
              fabricImg.scaleY = sy;
            } else {
              fabricImg.scaleX = f.scaleX ?? 1;
              fabricImg.scaleY = f.scaleY ?? 1;
            }

            canvas!.add(fabricImg);
          })();
          deferredImagePromises.push(p);
          continue;
        }

        // RECT / BORDER
        if (rawType === "rect") {
          const isBackgroundRect = !hasVariableKey && !bgRectInstance;
          const cw = canvas.width ?? 0;
          const ch = canvas.height ?? 0;
          const strokeWidth = f.strokeWidth ?? 0;
          const strokeColor = f.stroke ?? undefined;
          const bgFill = templateJson.background ?? f.fill ?? "#ffffff";

          if (isBackgroundRect && cw && ch) {
            const bgRect = new fabric.Rect({
              left: 0,
              top: 0,
              width: cw,
              height: ch,
              fill: bgFill,
              strokeWidth: 0,
              selectable: false,
              evented: false,
              originX: "left",
              originY: "top",
            });

            canvas.add(bgRect);
            bgRectInstance = bgRect;
            canvas.sendObjectToBack(bgRect);

            if (strokeColor && strokeWidth > 0) {
              const bw = strokeWidth;
              const margin = 10;
              const borders: fabric.Rect[] = [];

              borders.push(
                new fabric.Rect({
                  left: margin,
                  top: margin,
                  width: cw - margin * 2,
                  height: bw,
                  fill: strokeColor,
                  selectable: false,
                  evented: false,
                  originX: "left",
                  originY: "top",
                })
              );
              borders.push(
                new fabric.Rect({
                  left: margin,
                  top: ch - margin - bw,
                  width: cw - margin * 2,
                  height: bw,
                  fill: strokeColor,
                  selectable: false,
                  evented: false,
                  originX: "left",
                  originY: "top",
                })
              );
              borders.push(
                new fabric.Rect({
                  left: margin,
                  top: margin,
                  width: bw,
                  height: ch - margin * 2,
                  fill: strokeColor,
                  selectable: false,
                  evented: false,
                  originX: "left",
                  originY: "top",
                })
              );
              borders.push(
                new fabric.Rect({
                  left: cw - margin - bw,
                  top: margin,
                  width: bw,
                  height: ch - margin * 2,
                  fill: strokeColor,
                  selectable: false,
                  evented: false,
                  originX: "left",
                  originY: "top",
                })
              );

              borders.forEach((r) => {
                canvas.add(r);
                canvas.sendObjectToBack(r);
              });
              canvas.sendObjectToBack(bgRect);
            }

            continue;
          }

          const rect = new fabric.Rect({
            left: f.left ?? 0,
            top: f.top ?? 0,
            width: f.width ?? 100,
            height: f.height ?? 30,
            fill: f.fill ?? "transparent",
            stroke: f.stroke ?? undefined,
            strokeWidth,
            rx: f.rx ?? 0,
            ry: f.ry ?? 0,
            originX: f.originX ?? "left",
            originY: f.originY ?? "top",
            selectable: false,
            evented: false,
          });

          canvas.add(rect);
          continue;
        }
      } catch (e) {
        console.warn("[final-image] object render failed", e, obj);
      }
    }

    if (deferredImagePromises.length) {
      await Promise.allSettled(deferredImagePromises);
    }

    // ---------- add QR (same as before) ----------
    await new Promise<void>((resolve) => {
      const qrSize = 120;
      const margin = 30;

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const off = document.createElement("canvas");
        off.width = qrSize;
        off.height = qrSize;
        const ctx = off.getContext("2d");
        if (!ctx) {
          resolve();
          return;
        }
        ctx.clearRect(0, 0, qrSize, qrSize);
        ctx.drawImage(img, 0, 0, qrSize, qrSize);

        const fabricImg = new fabric.Image(off as any, {
          selectable: false,
          evented: false,
        });

        let centerX: number;
        let centerY: number;

        if (bgRectInstance) {
          const br = bgRectInstance;
          const rectLeft = br.left ?? 0;
          const rectTop = br.top ?? 0;
          const rectWidth = (br.width ?? qrSize * 2) * (br.scaleX ?? 1);
          const rectHeight = (br.height ?? qrSize * 2) * (br.scaleY ?? 1);

          centerX = rectLeft + margin + qrSize / 2;
          centerY = rectTop + rectHeight - margin - qrSize / 2;
        } else {
          const cw = canvas.width ?? 0;
          const ch = canvas.height ?? 0;
          centerX = margin + qrSize / 2;
          centerY = ch - margin - qrSize / 2;
        }

        fabricImg.set({
          left: centerX,
          top: centerY,
          originX: "center",
          originY: "center",
        });

        canvas.add(fabricImg);
        canvas.bringObjectToFront(fabricImg);
        resolve();
      };

      img.onerror = (e) => {
        console.warn("[final-image] QR image failed to load", e);
        resolve();
      };

      img.src = qrDataUrl;
    });

    canvas.requestRenderAll();
    await wait(50);

    // ---------- STEGO: embed into the SAME canvas element ----------
    const hashBytes = await hashPayloadToBytes(certificateId);
    console.log("[ISSUER] CERTIFICATE ID:", certificateId);
    console.log("[ISSUER] hashBytes bytes:", hashBytes);

embedHashDistributedBlueMulti(el, hashBytes);



    // ---------- Export final image (PNG) ----------
    let imgDataUrl = el.toDataURL("image/png");


// 🔹 additionally store raw certificateId in PNG metadata (tEXt chunk)
imgDataUrl = embedCertificateIdInPngDataUrl(imgDataUrl, certificateId);
    const base64 = imgDataUrl.split(",")[1] ?? "";

    canvas.dispose();
    return base64;
  } catch (e) {
    console.error("[final-image] generateFinalImageWithQrAndStego failed", e);
    throw e;
  }
}
