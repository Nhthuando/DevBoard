import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Terms of Service</h1>
        <p className="text-muted-foreground">
          By using DevBoard, you agree to use the platform responsibly, comply with applicable laws,
          and respect all users and project agreements.
        </p>
        <p className="text-muted-foreground">
          This page is a basic placeholder for deployment to avoid broken links. You can replace it
          with your full legal terms anytime.
        </p>
        <Link href="/" className="text-primary hover:underline">
          Back to home
        </Link>
      </div>
    </div>
  );
}
