import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-lg text-gray-600">Last updated: August 14, 2025</p>
        </div>

        <Card className="shadow-lg">
          <CardContent className="p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  By accessing or using Ignitch ("Service"), you agree to be bound by these Terms of Service ("Terms"). 
                  If you disagree with any part of these terms, you may not access the Service.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Ignitch is an AI-powered social media management platform that helps businesses create, schedule, 
                  and optimize content across multiple social media platforms including Instagram, Facebook, TikTok, 
                  Twitter, and LinkedIn.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
              <div className="space-y-4 text-gray-700">
                <p>To use our Service, you must:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Be at least 13 years old (or legal age in your jurisdiction)</li>
                  <li>Provide accurate and complete information when creating your account</li>
                  <li>Maintain the security of your password and account</li>
                  <li>Be responsible for all activities that occur under your account</li>
                  <li>Notify us immediately of any unauthorized use</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Social Media Account Connections</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  When you connect your social media accounts to Ignitch:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You grant us permission to access and manage your connected accounts as authorized</li>
                  <li>You remain responsible for content posted to your social media accounts</li>
                  <li>You can disconnect accounts at any time through your account settings</li>
                  <li>You must comply with each social media platform's terms of service</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Content and Conduct</h2>
              <div className="space-y-4 text-gray-700">
                <p>You agree not to use the Service to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Upload or share illegal, harmful, or inappropriate content</li>
                  <li>Violate any laws or regulations</li>
                  <li>Infringe upon intellectual property rights</li>
                  <li>Spam, harass, or abuse other users</li>
                  <li>Attempt to hack or compromise our systems</li>
                  <li>Use the Service for any unauthorized commercial purposes</li>
                </ul>
                <p className="mt-4">
                  You retain ownership of content you upload, but grant us a license to use, modify, and distribute 
                  it as necessary to provide our services.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. AI-Generated Content</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Our AI features generate content suggestions and optimizations. You acknowledge that:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>AI-generated content is provided as suggestions only</li>
                  <li>You are responsible for reviewing and approving all content before posting</li>
                  <li>We do not guarantee the accuracy or effectiveness of AI suggestions</li>
                  <li>You should ensure all content complies with applicable laws and platform policies</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Payment and Billing</h2>
              <div className="space-y-4 text-gray-700">
                <p>For paid services:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Fees are charged in advance for subscription periods</li>
                  <li>All fees are non-refundable unless required by law</li>
                  <li>We may change pricing with 30 days notice</li>
                  <li>You can cancel your subscription at any time</li>
                  <li>Your account will be downgraded or suspended for non-payment</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Intellectual Property</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  The Service and its original content, features, and functionality are owned by Ignitch and are 
                  protected by international copyright, trademark, patent, trade secret, and other intellectual 
                  property laws.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Privacy</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Your privacy is important to us. Please review our Privacy Policy, which also governs your use 
                  of the Service, to understand our practices.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Disclaimers and Limitations</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  The Service is provided "as is" without warranties of any kind. We do not guarantee:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Uninterrupted or error-free operation</li>
                  <li>Specific results from using our AI features</li>
                  <li>Compatibility with all social media platforms</li>
                  <li>That the Service will meet your specific needs</li>
                </ul>
                <p className="mt-4">
                  In no event shall Ignitch be liable for any indirect, incidental, special, consequential, or 
                  punitive damages arising from your use of the Service.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Termination</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We may terminate or suspend your account immediately, without prior notice, for conduct that 
                  we believe violates these Terms or is harmful to other users, us, or third parties.
                </p>
                <p>
                  You may terminate your account at any time by contacting us or through your account settings.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Governing Law</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  These Terms are governed by and construed in accordance with the laws of [Your Jurisdiction], 
                  without regard to its conflict of law provisions.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Changes to Terms</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We reserve the right to modify these Terms at any time. If we make material changes, we will 
                  notify you by email or through the Service. Your continued use after changes constitutes 
                  acceptance of the new Terms.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Information</h2>
              <div className="space-y-4 text-gray-700">
                <p>If you have questions about these Terms, contact us:</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>Email:</strong> legal@ignitch.com</p>
                  <p><strong>Support:</strong> support@ignitch.com</p>
                  <p><strong>Address:</strong> Ignitch Inc., [Your Business Address]</p>
                </div>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
