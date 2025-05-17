import { redirect } from "next/navigation";
import { signIn, auth } from "~/server/auth";
import { providerMap } from "~/server/auth/config";
import { AuthError } from "next-auth";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "~/components/ui/card";

export default function LoginPage(props: {
	searchParams: { callbackUrl: string | undefined };
}) {
	return (
		<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-sm">
				<div className="flex flex-col gap-6">
					<Card>
						<CardContent>
							{Object.values(providerMap).map((provider) => (
								<form
									key={provider.id}
									action={async () => {
										"use server";
										try {
											await signIn(provider.id, {
												redirectTo: props.searchParams?.callbackUrl ?? "",
											});
										} catch (error) {
											// Signin can fail for a number of reasons, such as the user
											// not existing, or the user not having the correct role.
											// In some cases, you may want to redirect to a custom error
											// if (error instanceof AuthError) {
											// 	return redirect(
											// 		`${SIGNIN_ERROR_URL}?error=${error.type}`,
											// 	);
											// }

											// Otherwise if a redirects happens Next.js can handle it
											// so you can just re-thrown the error and let Next.js handle it.
											// Docs:
											// https://nextjs.org/docs/app/api-reference/functions/redirect#server-component
											throw error;
										}
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
