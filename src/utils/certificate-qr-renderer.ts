// // lib/final-certificate.ts
// import * as fabric from "fabric";
// import { jsPDF } from "jspdf";

// const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// type TemplateJson = any;

// export async function generateFinalPdfWithQr(options: {
//   templateJson: TemplateJson;
//   qrDataUrl: string;
// }): Promise<string> {
//   const { templateJson, qrDataUrl } = options;

//   try {
//     // 1) create offscreen <canvas>
//     const el = document.createElement("canvas");

//     const meta = templateJson.meta ?? {
//       format: "A4",
//       orientation: "landscape",
//     };
//     const dims = formatToPixels(meta, 96) || {
//       width: 1122,
//       height: 793,
//       orientation: "landscape",
//       mmWidth: 297,
//       mmHeight: 210,
//     };

//     el.width = Math.round(dims.width);
//     el.height = Math.round(dims.height);

//     const canvas = new fabric.Canvas(el, {
//       width: el.width,
//       height: el.height,
//       backgroundColor: templateJson.background ?? "#ffffff",
//       preserveObjectStacking: true,
//       renderOnAddRemove: false,
//       enableRetinaScaling: true,
//     });

//     const objs = Array.isArray(templateJson.objects)
//       ? templateJson.objects
//       : [];
//     const deferredImagePromises: Promise<void>[] = [];

//     let bgRectInstance: fabric.Rect | null = null;

//     // ---------- rebuild template: TEXT + RECT (and ignore images for now) ----------
//     for (const obj of objs) {
//       const f = obj.fabric ?? {};
//       const rawType = (f.type ?? "").toString().toLowerCase();
//       const hasVariableKey = typeof obj.variableKey !== "undefined";

//       try {
//         // TEXT
//         if (
//           rawType.includes("text") ||
//           rawType === "itext" ||
//           rawType === "i-text" ||
//           rawType === "textbox" ||
//           typeof f.text !== "undefined"
//         ) {
//           const text = String(f.text ?? f.value ?? "");
//           const opts: any = {
//             left: f.left ?? 0,
//             top: f.top ?? 0,
//             angle: f.angle ?? 0,
//             fontSize: f.fontSize ?? 16,
//             fontFamily: f.fontFamily ?? undefined,
//             fill: f.fill ?? "#000",
//             textAlign: f.textAlign ?? "left",
//             originX: f.originX ?? "center",
//             originY: f.originY ?? "center",
//             selectable: false,
//             evented: false,
//           };

//           let inst: fabric.IText | fabric.Textbox;
//           if (f.width) {
//             inst = new fabric.Textbox(text, { ...opts, width: f.width } as any);
//           } else {
//             inst = new fabric.IText(text, opts as any);
//           }
//           if (f.scaleX) inst.scaleX = f.scaleX;
//           if (f.scaleY) inst.scaleY = f.scaleY;

//           canvas.add(inst);
//           continue;
//         }

//         // RECT / BORDER
//         if (rawType === "rect") {
//           const isBackgroundRect = !hasVariableKey && !bgRectInstance;

//           let left = f.left ?? 0;
//           let top = f.top ?? 0;
//           let width = f.width ?? canvas.width ?? 0;
//           let height = f.height ?? canvas.height ?? 0;
//           const strokeWidth = f.strokeWidth ?? 0;

//           if (isBackgroundRect) {
//             const cw = canvas.width ?? 0;
//             const ch = canvas.height ?? 0;

//             // leave a gap so border is fully visible and not clipped
//             const gap = 10;
//             const halfStroke = strokeWidth / 2;
//             const inset = gap + halfStroke;

//             left = inset;
//             top = inset;
//             width = cw - inset * 2;
//             height = ch - inset * 2;
//           }

//           const rect = new fabric.Rect({
//             left,
//             top,
//             width,
//             height,
//             fill: f.fill ?? "transparent",
//             stroke: f.stroke ?? undefined,
//             strokeWidth,
//             rx: f.rx ?? 0,
//             ry: f.ry ?? 0,
//             originX: "left",
//             originY: "top",
//             selectable: false,
//             evented: false,
//           });

//           canvas.add(rect);

//           if (isBackgroundRect) {
//             bgRectInstance = rect;
//             canvas.sendObjectToBack(rect);
//           }
//           continue;
//         }

//         // (optional) ignore images in template for now:
//         // if you want them later, we can add a safe loader similar to CertificateRenderer.
//       } catch (e) {
//         console.warn("[final-certificate] object render failed", e, obj);
//         const fallbackRect = new fabric.Rect({
//           left: 0,
//           top: 0,
//           width: 100,
//           height: 30,
//           fill: "transparent",
//           selectable: false,
//           evented: false,
//         });
//         canvas.add(fallbackRect);
//       }
//     }

//     if (deferredImagePromises.length) {
//       await Promise.allSettled(deferredImagePromises);
//     }

//     // ---------- QR: bottom-left inside border ----------
//     await new Promise<void>((resolve) => {
//       const qrSize = 120; // px
//       const margin = 30; // gap from border/canvas

//       const img = new Image();
//       img.crossOrigin = "anonymous";
//       img.onload = () => {
//         // draw qr into offscreen canvas, then create fabric.Image
//         const off = document.createElement("canvas");
//         off.width = qrSize;
//         off.height = qrSize;
//         const ctx = off.getContext("2d");
//         if (!ctx) {
//           resolve();
//           return;
//         }
//         ctx.clearRect(0, 0, qrSize, qrSize);

//         // draw image scaled into offscreen canvas
//         ctx.drawImage(img, 0, 0, qrSize, qrSize);

//         const fabricImg = new fabric.Image(off as any, {
//           selectable: false,
//           evented: false,
//         });

//         let centerX: number;
//         let centerY: number;

//         if (bgRectInstance) {
//           const br = bgRectInstance;
//           const rectLeft = br.left ?? 0;
//           const rectTop = br.top ?? 0;
//           const rectWidth = (br.width ?? qrSize * 2) * (br.scaleX ?? 1);
//           const rectHeight = (br.height ?? qrSize * 2) * (br.scaleY ?? 1);

//           // bottom-left *inside* decorative rect
//           centerX = rectLeft + margin + qrSize / 2;
//           centerY = rectTop + rectHeight - margin - qrSize / 2;
//         } else {
//           const cw = canvas.width ?? 0;
//           const ch = canvas.height ?? 0;
//           centerX = margin + qrSize / 2;
//           centerY = ch - margin - qrSize / 2;
//         }

//         fabricImg.set({
//           left: centerX,
//           top: centerY,
//           originX: "center",
//           originY: "center",
//         });

//         canvas.add(fabricImg);
//         canvas.bringObjectToFront(fabricImg);
//         resolve();
//       };

//       img.onerror = (e) => {
//         console.warn("[final-certificate] QR image failed to load", e);
//         resolve(); // continue without QR instead of blocking
//       };

//       img.src = qrDataUrl;
//     });

//     canvas.requestRenderAll();
//     await wait(50);

//     // ---------- Export to PDF ----------
//     const imgDataUrl = canvas.toDataURL({
//       format: "png",
//       multiplier: 2,
//     });

//     const orientation =
//       (meta.orientation ?? "landscape").toString().toLowerCase() === "portrait"
//         ? "portrait"
//         : "landscape";

//     const pdf = new jsPDF({
//       unit: "mm",
//       format: "a4",
//       orientation,
//     });

//     const mmW = orientation === "landscape" ? 297 : 210;
//     const mmH = orientation === "landscape" ? 210 : 297;

//     pdf.addImage(imgDataUrl, "PNG", 0, 0, mmW, mmH, undefined, "FAST");
//     const pdfDataUri = pdf.output("datauristring");
//     const base64 = pdfDataUri.split(",")[1] ?? "";

//     canvas.dispose();
//     return base64;
//   } catch (e) {
//     console.error("[final-certificate] generateFinalPdfWithQr failed", e);
//     throw e; // let handleApprove catch it
//   }
// }

// function formatToPixels(meta: any, dpi = 96) {
//   if (!meta) return null;
//   const format = (meta.format ?? "").toString().toLowerCase();
//   const orientation = (meta.orientation ?? "portrait").toString().toLowerCase();

//   if (format === "a4") {
//     const wMm = orientation === "landscape" ? 297 : 210;
//     const hMm = orientation === "landscape" ? 210 : 297;
//     const mmToPx = dpi / 25.4;
//     return {
//       width: Math.round(wMm * mmToPx),
//       height: Math.round(hMm * mmToPx),
//       mmWidth: wMm,
//       mmHeight: hMm,
//       orientation,
//     };
//   }

//   if (meta.width && meta.height) {
//     return {
//       width: Number(meta.width),
//       height: Number(meta.height),
//       orientation,
//     };
//   }
//   return null;
// }

// import * as fabric from "fabric";
// import { jsPDF } from "jspdf";

// const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// type TemplateJson = any;

// export async function generateFinalPdfWithQr(options: {
//   templateJson: TemplateJson;
//   qrDataUrl: string;
// }): Promise<string> {
//   const { templateJson, qrDataUrl } = options;

//   try {
//     // 1) create offscreen <canvas>
//     const el = document.createElement("canvas");

//     const meta = templateJson.meta ?? {
//       format: "A4",
//       orientation: "landscape",
//     };
//     const dims = formatToPixels(meta, 96) || {
//       width: 1122,
//       height: 793,
//       orientation: "landscape",
//       mmWidth: 297,
//       mmHeight: 210,
//     };

//     el.width = Math.round(dims.width);
//     el.height = Math.round(dims.height);

//     const canvas = new fabric.Canvas(el, {
//       width: el.width,
//       height: el.height,
//       backgroundColor: templateJson.background ?? "#ffffff",
//       preserveObjectStacking: true,
//       renderOnAddRemove: false,
//       enableRetinaScaling: true,
//     });

//     const objs = Array.isArray(templateJson.objects)
//       ? templateJson.objects
//       : [];
//     const deferredImagePromises: Promise<void>[] = [];

//     let bgRectInstance: fabric.Rect | null = null;

//     // ---------- rebuild template: TEXT + RECT ----------
//     for (const obj of objs) {
//       const f = obj.fabric ?? {};
//       const rawType = (f.type ?? "").toString().toLowerCase();
//       const hasVariableKey = typeof obj.variableKey !== "undefined";

//       try {
//         // ---------- TEXT ----------
//         if (
//           rawType.includes("text") ||
//           rawType === "itext" ||
//           rawType === "i-text" ||
//           rawType === "textbox" ||
//           typeof f.text !== "undefined"
//         ) {
//           const text = String(f.text ?? f.value ?? "");
//           const opts: any = {
//             left: f.left ?? 0,
//             top: f.top ?? 0,
//             angle: f.angle ?? 0,
//             fontSize: f.fontSize ?? 16,
//             fontFamily: f.fontFamily ?? undefined,
//             fill: f.fill ?? "#000",
//             textAlign: f.textAlign ?? "left",
//             originX: f.originX ?? "center",
//             originY: f.originY ?? "center",
//             selectable: false,
//             evented: false,
//           };

//           let inst: fabric.IText | fabric.Textbox;
//           if (f.width) {
//             inst = new fabric.Textbox(text, { ...opts, width: f.width } as any);
//           } else {
//             inst = new fabric.IText(text, opts as any);
//           }
//           if (f.scaleX) inst.scaleX = f.scaleX;
//           if (f.scaleY) inst.scaleY = f.scaleY;

//           canvas.add(inst);
//           continue;
//         }

//         // ---------- RECT / BORDER ----------
//         if (rawType === "rect") {
//           const isBackgroundRect = !hasVariableKey && !bgRectInstance;

//           const cw = canvas.width ?? 0;
//           const ch = canvas.height ?? 0;

//           const strokeWidth = f.strokeWidth ?? 0;
//           const strokeColor = f.stroke ?? undefined;
//           const bgFill = templateJson.background ?? f.fill ?? "#ffffff";

//           if (isBackgroundRect && cw && ch) {
//             // 1) Full background rect (no stroke)
//             const bgRect = new fabric.Rect({
//               left: 0,
//               top: 0,
//               width: cw,
//               height: ch,
//               fill: bgFill,
//               strokeWidth: 0,
//               selectable: false,
//               evented: false,
//               originX: "left",
//               originY: "top",
//             });

//             canvas.add(bgRect);
//             bgRectInstance = bgRect;
//             canvas.sendObjectToBack(bgRect);

//             // 2) Fake border with 4 rects *inside* the edges with a margin
//             if (strokeColor && strokeWidth > 0) {
//               const bw = strokeWidth;
//               const margin = 10; // gap between border and canvas edge

//               const borders: fabric.Rect[] = [];

//               // top
//               borders.push(
//                 new fabric.Rect({
//                   left: margin,
//                   top: margin,
//                   width: cw - margin * 2,
//                   height: bw,
//                   fill: strokeColor,
//                   selectable: false,
//                   evented: false,
//                   originX: "left",
//                   originY: "top",
//                 })
//               );

//               // bottom
//               borders.push(
//                 new fabric.Rect({
//                   left: margin,
//                   top: ch - margin - bw,
//                   width: cw - margin * 2,
//                   height: bw,
//                   fill: strokeColor,
//                   selectable: false,
//                   evented: false,
//                   originX: "left",
//                   originY: "top",
//                 })
//               );

//               // left
//               borders.push(
//                 new fabric.Rect({
//                   left: margin,
//                   top: margin,
//                   width: bw,
//                   height: ch - margin * 2,
//                   fill: strokeColor,
//                   selectable: false,
//                   evented: false,
//                   originX: "left",
//                   originY: "top",
//                 })
//               );

//               // right
//               borders.push(
//                 new fabric.Rect({
//                   left: cw - margin - bw,
//                   top: margin,
//                   width: bw,
//                   height: ch - margin * 2,
//                   fill: strokeColor,
//                   selectable: false,
//                   evented: false,
//                   originX: "left",
//                   originY: "top",
//                 })
//               );

//               borders.forEach((r) => {
//                 canvas.add(r);
//                 canvas.sendObjectToBack(r);
//               });
//               canvas.sendObjectToBack(bgRect);
//             }

//             continue; // background rect handled fully
//           }

//           // normal non-background rects (shapes inside certificate)
//           const rect = new fabric.Rect({
//             left: f.left ?? 0,
//             top: f.top ?? 0,
//             width: f.width ?? 100,
//             height: f.height ?? 30,
//             fill: f.fill ?? "transparent",
//             stroke: f.stroke ?? undefined,
//             strokeWidth,
//             rx: f.rx ?? 0,
//             ry: f.ry ?? 0,
//             originX: f.originX ?? "left",
//             originY: f.originY ?? "top",
//             selectable: false,
//             evented: false,
//           });

//           canvas.add(rect);
//           continue;
//         }

//         // (optional) ignore images in template for now
//       } catch (e) {
//         console.warn("[final-certificate] object render failed", e, obj);
//         const fallbackRect = new fabric.Rect({
//           left: 0,
//           top: 0,
//           width: 100,
//           height: 30,
//           fill: "transparent",
//           selectable: false,
//           evented: false,
//         });
//         canvas.add(fallbackRect);
//       }
//     }

//     if (deferredImagePromises.length) {
//       await Promise.allSettled(deferredImagePromises);
//     }

//     // ---------- QR: bottom-left inside border ----------
//     await new Promise<void>((resolve) => {
//       const qrSize = 120; // px
//       const margin = 30; // gap from border/canvas

//       const img = new Image();
//       img.crossOrigin = "anonymous";
//       img.onload = () => {
//         const off = document.createElement("canvas");
//         off.width = qrSize;
//         off.height = qrSize;
//         const ctx = off.getContext("2d");
//         if (!ctx) {
//           resolve();
//           return;
//         }
//         ctx.clearRect(0, 0, qrSize, qrSize);
//         ctx.drawImage(img, 0, 0, qrSize, qrSize);

//         const fabricImg = new fabric.Image(off as any, {
//           selectable: false,
//           evented: false,
//         });

//         let centerX: number;
//         let centerY: number;

//         if (bgRectInstance) {
//           const br = bgRectInstance;
//           const rectLeft = br.left ?? 0;
//           const rectTop = br.top ?? 0;
//           const rectWidth = (br.width ?? qrSize * 2) * (br.scaleX ?? 1);
//           const rectHeight = (br.height ?? qrSize * 2) * (br.scaleY ?? 1);

//           // bottom-left *inside* decorative rect
//           centerX = rectLeft + margin + qrSize / 2;
//           centerY = rectTop + rectHeight - margin - qrSize / 2;
//         } else {
//           const cw = canvas.width ?? 0;
//           const ch = canvas.height ?? 0;
//           centerX = margin + qrSize / 2;
//           centerY = ch - margin - qrSize / 2;
//         }

//         fabricImg.set({
//           left: centerX,
//           top: centerY,
//           originX: "center",
//           originY: "center",
//         });

//         canvas.add(fabricImg);
//         canvas.bringObjectToFront(fabricImg);
//         resolve();
//       };

//       img.onerror = (e) => {
//         console.warn("[final-certificate] QR image failed to load", e);
//         resolve();
//       };

//       img.src = qrDataUrl;
//     });

//     canvas.requestRenderAll();
//     await wait(50);

//     // ---------- Export to PDF ----------
//     const imgDataUrl = canvas.toDataURL({
//       format: "png",
//       multiplier: 2,
//     });

//     const orientation =
//       (meta.orientation ?? "landscape").toString().toLowerCase() === "portrait"
//         ? "portrait"
//         : "landscape";

//     const pdf = new jsPDF({
//       unit: "mm",
//       format: "a4",
//       orientation,
//     });

//     const mmW = orientation === "landscape" ? 297 : 210;
//     const mmH = orientation === "landscape" ? 210 : 297;

//     pdf.addImage(imgDataUrl, "PNG", 0, 0, mmW, mmH, undefined, "FAST");
//     const pdfDataUri = pdf.output("datauristring");
//     const base64 = pdfDataUri.split(",")[1] ?? "";

//     canvas.dispose();
//     return base64;
//   } catch (e) {
//     console.error("[final-certificate] generateFinalPdfWithQr failed", e);
//     throw e;
//   }
// }

// function formatToPixels(meta: any, dpi = 96) {
//   if (!meta) return null;
//   const format = (meta.format ?? "").toString().toLowerCase();
//   const orientation = (meta.orientation ?? "portrait").toString().toLowerCase();

//   if (format === "a4") {
//     const wMm = orientation === "landscape" ? 297 : 210;
//     const hMm = orientation === "landscape" ? 210 : 297;
//     const mmToPx = dpi / 25.4;
//     return {
//       width: Math.round(wMm * mmToPx),
//       height: Math.round(hMm * mmToPx),
//       mmWidth: wMm,
//       mmHeight: hMm,
//       orientation,
//     };
//   }

//   if (meta.width && meta.height) {
//     return {
//       width: Number(meta.width),
//       height: Number(meta.height),
//       orientation,
//     };
//   }
//   return null;
// }

import * as fabric from "fabric";
import { jsPDF } from "jspdf";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

type TemplateJson = any;

export async function generateFinalPdfWithQr(options: {
  templateJson: TemplateJson;
  qrDataUrl: string;
}): Promise<string> {
  const { templateJson, qrDataUrl } = options;

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

    // ---------- rebuild template: TEXT + IMAGES + RECT ----------
    for (const obj of objs) {
      const f = obj.fabric ?? {};
      const rawType = (f.type ?? "").toString().toLowerCase();
      const hasVariableKey = typeof obj.variableKey !== "undefined";

      try {
        // ---------- TEXT ----------
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

        // ---------- IMAGES (includes variableKey like "image_...") ----------
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

        // ---------- RECT / BORDER ----------
        if (rawType === "rect") {
          const isBackgroundRect = !hasVariableKey && !bgRectInstance;

          const cw = canvas.width ?? 0;
          const ch = canvas.height ?? 0;

          const strokeWidth = f.strokeWidth ?? 0;
          const strokeColor = f.stroke ?? undefined;
          const bgFill = templateJson.background ?? f.fill ?? "#ffffff";

          if (isBackgroundRect && cw && ch) {
            // 1) Full background rect (no stroke)
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

            // 2) Fake border with 4 rects *inside* the edges with a margin
            if (strokeColor && strokeWidth > 0) {
              const bw = strokeWidth;
              const margin = 10;

              const borders: fabric.Rect[] = [];

              // top
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

              // bottom
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

              // left
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

              // right
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

            continue; // background rect handled fully
          }

          // normal non-background rects
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

        // (optional) other types ignored
      } catch (e) {
        console.warn("[final-certificate] object render failed", e, obj);
        const fallbackRect = new fabric.Rect({
          left: 0,
          top: 0,
          width: 100,
          height: 30,
          fill: "transparent",
          selectable: false,
          evented: false,
        });
        canvas.add(fallbackRect);
      }
    }

    if (deferredImagePromises.length) {
      await Promise.allSettled(deferredImagePromises);
    }

    // ---------- QR: bottom-left inside border ----------
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
        console.warn("[final-certificate] QR image failed to load", e);
        resolve();
      };

      img.src = qrDataUrl;
    });

    canvas.requestRenderAll();
    await wait(50);

    // ---------- Export to PDF ----------
    const imgDataUrl = canvas.toDataURL({
      format: "png",
      multiplier: 2,
    });

    const orientation =
      (meta.orientation ?? "landscape").toString().toLowerCase() === "portrait"
        ? "portrait"
        : "landscape";

    const pdf = new jsPDF({
      unit: "mm",
      format: "a4",
      orientation,
    });

    const mmW = orientation === "landscape" ? 297 : 210;
    const mmH = orientation === "landscape" ? 210 : 297;

    pdf.addImage(imgDataUrl, "PNG", 0, 0, mmW, mmH, undefined, "FAST");
    const pdfDataUri = pdf.output("datauristring");
    const base64 = pdfDataUri.split(",")[1] ?? "";

    canvas.dispose();
    return base64;
  } catch (e) {
    console.error("[final-certificate] generateFinalPdfWithQr failed", e);
    throw e;
  }
}

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

const loadImageSafe = (src: string, timeoutMs = 8000) =>
  new Promise<HTMLImageElement | ImageBitmap | null>((resolve) => {
    let done = false;
    const finish = (val: HTMLImageElement | ImageBitmap | null) => {
      if (done) return;
      done = true;
      resolve(val);
    };

    if (
      typeof (window as any).createImageBitmap === "function" &&
      src.startsWith("data:")
    ) {
      try {
        const arr = src.split(",");
        const meta = arr[0];
        const isBase64 = meta.indexOf(";base64") !== -1;
        const data = arr[1] || "";
        if (isBase64) {
          try {
            const binary = atob(data);
            const len = binary.length;
            const u8 = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
              u8[i] = binary.charCodeAt(i);
            }
            const mime = meta.split(":")[1].split(";")[0] || "image/png";
            const blob = new Blob([u8], { type: mime });
            (window as any)
              .createImageBitmap(blob)
              .then((bitmap: ImageBitmap) => finish(bitmap))
              .catch((err: any) => {
                console.warn(
                  "createImageBitmap failed, falling back to Image element:",
                  err
                );
              });
          } catch (err) {
            console.warn(
              "createImageBitmap path decode error, falling back to Image element:",
              err
            );
          }
        }
      } catch (e) {
        console.warn(
          "createImageBitmap path threw, falling back to Image element",
          e
        );
      }
    }

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => finish(img);
      img.onerror = (err) => {
        console.warn("Image element failed to load:", src, err);
        finish(null);
      };
      img.src = src;
    } catch (err) {
      console.warn("Failed to create Image element for src:", err, src);
      finish(null);
    }

    setTimeout(() => {
      if (!done) {
        console.warn(
          "[CertificateRenderer] image load timed out (safe loader):",
          src
        );
        finish(null);
      }
    }, timeoutMs);
  });
