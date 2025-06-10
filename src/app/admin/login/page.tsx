import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { signIn } from "~/server/auth";
import { providerMap } from "~/server/auth/config";

export default async function AuthLoginPage(props: {
	searchParams: Promise<{ callbackUrl: string | undefined }>;
}) {
	const params = await props.searchParams;

	return (
		<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-sm">
				<div>
					<Card>
						<CardContent className="flex flex-col gap-2">
							{Object.values(providerMap).map((provider) => (
								<form
									key={provider.id}
									action={async () => {
										"use server";
										await signIn(provider.id, {
											redirectTo: params.callbackUrl ?? "",
										});
									}}
								>
									<Button type="submit" variant="outline" className="w-full">
										{}
										<span>Login with {provider.name}</span>
									</Button>
								</form>
							))}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
