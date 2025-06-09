import { Aperture, Film, Timer } from "lucide-react";
import { useState } from "react";
import { RowsPhotoAlbum } from "react-photo-album";
import { Lightbox } from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import { apertureString, shutterSpeedString } from "~/lib/utils";
import type { RouterOutputs } from "~/trpc/react";

type PhotosOutput = RouterOutputs["photos"]["search"];

export default function Gallery({ photos }: { photos: PhotosOutput }) {
	const [index, setIndex] = useState(-1);

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
				targetRowHeight={150}
				onClick={({ index }) => setIndex(index)}
				render={{
					container: ({ ref, ...rest }) => (
						<div ref={ref} {...rest} className={`${rest.className} py-4`} />
					),
					// biome-ignore lint/a11y/useAltText: already defined in props
					image: (props) => (
						<img {...props} className={`${props.className} rounded-md`} />
					),
				}}
			/>
			<Lightbox
				index={index}
				slides={photos.map((photo) => ({
					src: photo.url,
					title: photo.title,
					description: (
						<div className="flex justify-center gap-12 md:gap-24">
							<div className="flex flex-row items-center gap-1">
								<Film />
								<span>{photo.isoSpeed}</span>
							</div>
							<div className="flex flex-row items-center gap-1">
								<Timer />
								<span title={photo.shutterSpeed?.toString()}>
									{shutterSpeedString(photo.shutterSpeed)}
								</span>
							</div>
							<div className="flex flex-row items-center gap-1">
								<Aperture />
								<span>{apertureString(photo.aperture)}</span>
							</div>
						</div>
					),
				}))}
				controller={{
					closeOnBackdropClick: true,
				}}
				open={index >= 0}
				close={() => setIndex(-1)}
				plugins={[Captions, Fullscreen, Zoom]}
				captions={{
					showToggle: true,
				}}
				styles={{
					captionsTitleContainer: {
						display: "flex",
						justifyContent: "center",
					},
				}}
				render={{
					slide: ({ slide }) => {
						return (
							<img
								src={slide.src}
								alt={slide.alt}
								className="max-h-full xl:max-h-9/10"
								width={slide.width}
								height={slide.height}
							/>
						);
					},
				}}
			/>
		</>
	);
}
