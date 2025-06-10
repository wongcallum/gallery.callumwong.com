"use client";
import { useSearchParams } from "next/navigation";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";

enum AuthError {
	AccessDenied = "AccessDenied",
}

const errorMap = {
	[AuthError.AccessDenied]: (
		<p>You are not allowed to access this application.</p>
	),
};

export default function AuthErrorPage() {
	const search = useSearchParams();
	const error = search.get("error") as AuthError;

	return (
		<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-sm">
				<div>
					<Card>
						<CardHeader>
							<CardTitle>Something went wrong</CardTitle>
							<CardDescription>
								{errorMap[error] || "Please contact us if this error persists."}
							</CardDescription>
						</CardHeader>
					</Card>
				</div>
			</div>
		</div>
	);
}
