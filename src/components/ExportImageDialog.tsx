"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Dialogs } from "@/stores/dialogStore";
import useDialog from "@/hooks/useDialog";
import { useEffect, useState } from "react";
import { toPng } from "html-to-image";
import { useReactFlow } from "@xyflow/react";
import Image from "next/image";

export default function ExportImageDialog() {
  const { getNodes, getNodesBounds } = useReactFlow();
  const { open, setOpen } = useDialog(Dialogs.ExportImage);
  const [image, setImage] = useState<{
    url: string;
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const element = document.querySelector(".react-flow__viewport");

    if (!element) {
      return;
    }

    const { width, height } = getNodesBounds(getNodes());

    const padding = 50;

    toPng(element as HTMLElement, {
      width: width + padding * 2,
      height: height + padding * 2,
      style: {
        width: width.toString(),
        height: height.toString(),
        transform: `translate(${padding}px, ${padding}px)`,
      },
    }).then((dataUrl) => {
      setImage({
        url: dataUrl,
        width: width,
        height: height,
      });
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const downloadImage = () => {
    if (!image) {
      return;
    }

    const link = document.createElement("a");
    link.href = image.url;
    link.download = "diagram.png";
    link.click();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Export Image</DialogTitle>
          <DialogDescription>
            Export the current diagram as an image.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-md border">
            {image ? (
              <div
                className="relative h-full bg-zinc-900"
                style={{
                  aspectRatio: `${image.width}/${image.height}`,
                }}
              >
                <Image
                  src={image.url}
                  alt="Exported diagram"
                  fill
                  className="object-contain"
                />
              </div>
            ) : null}
          </div>

          <Button
            variant="outline"
            disabled={!image}
            onClick={() => downloadImage()}
          >
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
