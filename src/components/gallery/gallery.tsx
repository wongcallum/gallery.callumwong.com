"use client";

import { Aperture, Camera, Film, Ruler, Timer, View } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { RowsPhotoAlbum } from "react-photo-album";
import { Lightbox } from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import { apertureString, shutterSpeedString } from "~/lib/utils";
import { AdminPlugin } from "./lightbox-admin-plugin";

import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import "react-photo-album/rows.css";
import type { InferSelectModel } from "drizzle-orm";
import type { photos } from "~/server/db/schema";

type PhotosOutput = (InferSelectModel<typeof photos> & {
	cameraName: string | null;
	lensName: string | null;
})[];

export default function Gallery({ photos }: { photos: PhotosOutput }) {
	const { data: session } = useSession();

	const [index, setIndex] = useState(-1);

	const lightboxPlugins = [Captions, Fullscreen, Zoom];
	if (session?.user) lightboxPlugins.push(AdminPlugin);

	return (
		<>
			<RowsPhotoAlbum
				photos={
					photos.map((photo) => ({
						src: photo.thumbnailUrl,
						width: photo.thumbnailWidth,
						height: photo.thumbnailHeight,
						key: photo.id,
						alt: photo.title || photo.id,
						title: photo.title || "",
					})) || []
				}
				targetRowHeight={300}
				rowConstraints={{ singleRowMaxHeight: 300 }}
				onClick={({ index }) => setIndex(index)}
				render={{
					container: ({ ref, ...rest }) => (
						<div ref={ref} {...rest} className={`${rest.className} py-4`} />
					),
					image: (props) => (
						// biome-ignore lint/a11y/useAltText: alt passed via spread props
						// biome-ignore lint/performance/noImgElement: managed by react-photo-album
						<img {...props} className={`${props.className} rounded-md`} />
					),
				}}
			/>
			<Lightbox
				index={index}
				slides={photos.map((photo) => ({
					src: photo.url,
					title: `${photo.takenAt?.toLocaleString()}${photo.title ? ` - ${photo.title}` : ""}`,
					width: photo.width,
					height: photo.height,
					description: (
						<div className="flex justify-center">
							<div className="grid w-fit grid-cols-4 justify-items-center gap-x-4 md:gap-x-24">
								<div className="flex flex-row items-center justify-center gap-1">
									<Film />
									<span>{photo.isoSpeed}</span>
								</div>
								<div className="flex flex-row items-center justify-center gap-1">
									<Timer />
									<span title={photo.shutterSpeed?.toString()}>
										{shutterSpeedString(photo.shutterSpeed)}
									</span>
								</div>
								<div className="flex flex-row items-center justify-center gap-1">
									<Aperture />
									<span>{apertureString(photo.aperture)}</span>
								</div>
								<div className="flex flex-row items-center justify-center gap-1">
									<Ruler />
									<span>{photo.focalLength}mm</span>
								</div>
								<div className="col-span-2 flex flex-row items-center justify-center gap-1">
									<Camera />
									<span>{photo.cameraName}</span>
								</div>
								<div className="col-span-2 flex flex-row items-center justify-center gap-1">
									<View />
									<span>{photo.lensName}</span>
								</div>
							</div>
						</div>
					),
				}))}
				controller={{
					closeOnBackdropClick: true,
				}}
				open={index >= 0}
				close={() => setIndex(-1)}
				plugins={lightboxPlugins}
				captions={{
					showToggle: true,
				}}
				styles={{
					root: {
						zIndex: 49,
					},
				}}
				render={{
					slide: ({ slide }) => {
						return (
							// biome-ignore lint/performance/noImgElement: managed by lightbox
							<img
								src={slide.src}
								alt={slide.alt}
								draggable={false}
								className="max-h-full xl:max-h-9/10"
							/>
						);
					},
				}}
			/>
		</>
	);
}
