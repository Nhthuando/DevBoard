import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-xl mx-auto space-y-6 text-center">
        <h1 className="text-3xl font-bold">Forgot Password</h1>
        <p className="text-muted-foreground">
          Password reset flow is not available yet in this build.
        </p>
        <p className="text-muted-foreground">
          Please contact support or return to the login page.
        </p>
        <Link href="/login" className="text-primary hover:underline">
          Back to login
        </Link>
      </div>
    </div>
  );
}
