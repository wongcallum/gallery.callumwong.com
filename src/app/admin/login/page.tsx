"use client";

import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { authClient } from "~/lib/auth-client";
import { providerMap } from "~/lib/auth-providers";

export default function AuthLoginPage() {
	return (
		<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-sm">
				<Card>
					<CardContent className="flex flex-col gap-2">
						{providerMap.map((provider) => (
							<Button
								key={provider.id}
								variant="outline"
								className="w-full"
								onClick={() =>
									authClient.signIn.social({
										provider: provider.id,
										callbackURL: "/admin/dashboard/collections",
									})
								}
							>
								Login with {provider.name}
							</Button>
						))}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
