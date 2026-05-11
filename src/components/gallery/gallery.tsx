"use client";

import { Aperture, Camera, Film, Ruler, Timer, View } from "lucide-react";
import { useState } from "react";
import { RowsPhotoAlbum } from "react-photo-album";
import { Lightbox } from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import { authClient } from "~/lib/auth-client";
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
	const { data: session } = authClient.useSession();

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
					image: ({ alt, ...props }) => (
						// biome-ignore lint/performance/noImgElement: managed by react-photo-album
						<img
							alt={alt}
							{...props}
							className={`${props.className} rounded-md`}
						/>
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
					description: (() => {
						const metadata = [
							photo.isoSpeed != null && {
								icon: <Film />,
								label: String(photo.isoSpeed),
							},
							photo.shutterSpeed != null && {
								icon: <Timer />,
								label: shutterSpeedString(photo.shutterSpeed),
								title: photo.shutterSpeed.toString(),
							},
							photo.aperture != null && {
								icon: <Aperture />,
								label: apertureString(photo.aperture),
							},
							photo.focalLength != null && {
								icon: <Ruler />,
								label: `${photo.focalLength}mm`,
							},
							photo.cameraName && {
								icon: <Camera />,
								label: photo.cameraName,
								wide: true,
							},
							photo.lensName && {
								icon: <View />,
								label: photo.lensName,
								wide: true,
							},
						].filter(Boolean) as {
							icon: React.ReactNode;
							label: string;
							title?: string;
							wide?: boolean;
						}[];

						if (metadata.length === 0) return undefined;

						return (
							<div className="flex justify-center">
								<div className="flex flex-wrap justify-center gap-x-4 gap-y-1 md:gap-x-12">
									{metadata.map((item) => (
										<div
											key={item.label}
											className="flex flex-row items-center justify-center gap-1"
											title={item.title}
										>
											{item.icon}
											<span>{item.label}</span>
										</div>
									))}
								</div>
							</div>
						);
					})(),
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
