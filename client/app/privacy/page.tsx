import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="text-muted-foreground">
          DevBoard values your privacy. We only process data required for authentication, project
          workflow, communication, and payment operations.
        </p>
        <p className="text-muted-foreground">
          This page is a basic placeholder for deployment to avoid broken links. You can replace it
          with your full privacy policy anytime.
        </p>
        <Link href="/" className="text-primary hover:underline">
          Back to home
        </Link>
      </div>
    </div>
  );
}
