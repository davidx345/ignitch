import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-600">Last updated: August 14, 2025</p>
        </div>

        <Card className="shadow-lg">
          <CardContent className="p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  When you use Ignitch, we collect information to provide and improve our social media management services:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Account Information:</strong> Name, email address, and profile information when you create an account</li>
                  <li><strong>Social Media Data:</strong> When you connect social media accounts, we access your profile information, posts, and analytics data as permitted by each platform</li>
                  <li><strong>Content:</strong> Images, videos, and text you upload to create social media posts</li>
                  <li><strong>Usage Data:</strong> How you interact with our platform, including features used and performance metrics</li>
                  <li><strong>Business Information:</strong> Business goals, target audience, and preferences to personalize AI recommendations</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <div className="space-y-4 text-gray-700">
                <p>We use your information to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide social media management and content creation services</li>
                  <li>Generate AI-powered content recommendations and optimizations</li>
                  <li>Schedule and publish content to your connected social media accounts</li>
                  <li>Provide analytics and insights about your social media performance</li>
                  <li>Improve our AI algorithms and platform features</li>
                  <li>Send important updates about our services</li>
                  <li>Provide customer support and respond to your inquiries</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Information Sharing and Disclosure</h2>
              <div className="space-y-4 text-gray-700">
                <p>We do not sell your personal information. We may share information in the following circumstances:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>With Social Media Platforms:</strong> When you authorize us to post content or access analytics from connected accounts</li>
                  <li><strong>Service Providers:</strong> Third-party services that help us operate our platform (hosting, analytics, payment processing)</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and users' safety</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of our business</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We implement industry-standard security measures to protect your information:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Secure authentication and access controls</li>
                  <li>Regular security audits and monitoring</li>
                  <li>Limited access to personal information on a need-to-know basis</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Your Rights and Choices</h2>
              <div className="space-y-4 text-gray-700">
                <p>You have the following rights regarding your personal information:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Access:</strong> Request a copy of your personal information</li>
                  <li><strong>Update:</strong> Correct or update your account information</li>
                  <li><strong>Delete:</strong> Request deletion of your account and associated data</li>
                  <li><strong>Disconnect:</strong> Remove connected social media accounts at any time</li>
                  <li><strong>Data Portability:</strong> Export your content and data</li>
                </ul>
                <p className="mt-4">
                  To exercise these rights, contact us at <strong>privacy@ignitch.com</strong>
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We retain your information for as long as your account is active or as needed to provide services. 
                  When you delete your account, we will delete your personal information within 30 days, except where 
                  required by law or for legitimate business purposes.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Third-Party Services</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Our platform integrates with third-party social media platforms (Instagram, Facebook, TikTok, Twitter, LinkedIn). 
                  Your use of these platforms is governed by their respective privacy policies and terms of service.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Children's Privacy</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Our services are not intended for children under 13. We do not knowingly collect personal information 
                  from children under 13. If we become aware of such collection, we will delete the information immediately.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. International Data Transfers</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Your information may be transferred to and processed in countries other than your country of residence. 
                  We ensure appropriate safeguards are in place to protect your information during such transfers.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to This Policy</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We may update this privacy policy from time to time. We will notify you of any material changes by 
                  posting the new policy on this page and updating the "Last updated" date. Your continued use of our 
                  services after changes take effect constitutes acceptance of the new policy.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Us</h2>
              <div className="space-y-4 text-gray-700">
                <p>If you have questions about this privacy policy or our data practices, contact us:</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>Email:</strong> privacy@ignitch.com</p>
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
