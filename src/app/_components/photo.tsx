import { Aperture, Film, Timer } from "lucide-react";
import {
	type ArrayElement,
	apertureString,
	shutterSpeedString,
} from "~/lib/utils";
import type { RouterOutputs } from "~/trpc/react";

type PhotosOutput = ArrayElement<RouterOutputs["photos"]["search"]>;

export function Photo({ photo }: { photo: PhotosOutput }) {
	return (
		<div className="relative">
			<img
				className="h-full w-full rounded-md object-cover"
				src={photo.thumbnailUrl || "/frown.svg"}
				alt={`Thumbnail for ${photo.title}`}
			/>
			<div className="absolute right-0 bottom-0 left-0 flex items-center justify-between rounded-b-md bg-black/60 p-2 text-muted">
				<div className="flex flex-row items-center gap-1">
					<Film />
					<span>{photo.isoSpeed}</span>
				</div>
				<div className="flex flex-row items-center gap-1">
					<Timer />
					<span>{shutterSpeedString(photo.shutterSpeed)}</span>
				</div>
				<div className="flex flex-row items-center gap-1">
					<Aperture />
					<span>{apertureString(photo.aperture)}</span>
				</div>
			</div>
		</div>
	);
}
