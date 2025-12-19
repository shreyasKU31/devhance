import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-8">
      <Link href="/">
        <Image src="/DH Logo.png" alt="DevHance" width={180} height={50} priority className="object-contain" />
      </Link>
      <SignIn />
    </div>
  );
}
