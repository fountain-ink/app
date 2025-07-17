import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SEO Test Page",
  description: "Testing SEO implementation",
};

export default function SEOTestPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">SEO Test Page</h1>
      <p className="mb-4">This page is for testing SEO implementation.</p>
      
      <div className="space-y-4">
        <section>
          <h2 className="text-xl font-semibold mb-2">Test Links:</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><a href="/p/testuser/testpost" className="text-blue-600 hover:underline">Test Post Page</a></li>
            <li><a href="/u/testuser" className="text-blue-600 hover:underline">Test User Profile</a></li>
            <li><a href="/b/testblog" className="text-blue-600 hover:underline">Test Blog Page</a></li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">Check these in DevTools:</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Right-click → "View Page Source"</li>
            <li>Look for &lt;link rel="canonical"&gt; tags</li>
            <li>Check for &lt;script type="application/ld+json"&gt; tags</li>
            <li>Verify Open Graph meta tags</li>
          </ol>
        </section>
      </div>
    </div>
  );
}