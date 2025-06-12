import { type PluginProps, addToolbarButton } from "yet-another-react-lightbox";

import { DeletePhotoButton } from "./delete-photo-button";
import { EditPhotoButton } from "./edit-photo-button";

declare module "yet-another-react-lightbox" {
	interface Labels {
		Delete?: string;
		Edit?: string;
	}
}

export function AdminPlugin({ augment }: PluginProps) {
	augment(({ toolbar, ...restProps }) => {
		return {
			toolbar: addToolbarButton(
				addToolbarButton(toolbar, "edit", <EditPhotoButton />),
				"delete",
				<DeletePhotoButton />,
			),
			...restProps,
		};
	});
}
