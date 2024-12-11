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
import {
  useReactFlow,
  getNodesBounds,
  getViewportForBounds,
} from "@xyflow/react";
import Image from "next/image";

export default function ExportImageDialog() {
  const { getNodes } = useReactFlow();
  const { open, setOpen } = useDialog(Dialogs.ExportImage);
  const [imageURL, setImageURL] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const element = document.querySelector(".react-flow__viewport");

    if (!element) {
      return;
    }

    const imageWidth = 1920;
    const imageHeight = 1080;

    const nodesBounds = getNodesBounds(getNodes());
    const viewport = getViewportForBounds(
      nodesBounds,
      imageWidth,
      imageHeight,
      0.5,
      2,
      0.1,
    );

    toPng(element as HTMLElement, {
      width: imageWidth,
      height: imageHeight,
      style: {
        width: imageWidth.toString(),
        height: imageHeight.toString(),
        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
      },
    }).then((dataUrl) => {
      setImageURL(dataUrl);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const downloadImage = () => {
    if (!imageURL) {
      return;
    }

    const link = document.createElement("a");
    link.href = imageURL;
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
          <div className="relative aspect-video w-full overflow-hidden rounded-md border">
            {imageURL ? (
              <Image
                src={imageURL}
                alt="Exported diagram"
                className="object-cover"
                fill
              />
            ) : null}
          </div>

          <Button
            variant="outline"
            disabled={!imageURL}
            onClick={() => downloadImage()}
          >
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
