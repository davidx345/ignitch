import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Shield, Mail, Calendar, Lock, Eye, Database, Trash2 } from "lucide-react"
import Link from "next/link"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            How we collect, use, and protect your data
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Introduction */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Introduction</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                AdFlow ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our social media management platform.
              </p>
              <p className="text-gray-700">
                By using AdFlow, you agree to the collection and use of information in accordance with this policy.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2 text-blue-600" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Personal Information</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Email address and account credentials</li>
                  <li>• Name and profile information</li>
                  <li>• Social media account usernames</li>
                  <li>• Business information and goals</li>
                </ul>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-semibold mb-3">Social Media Data</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Access tokens for connected social media accounts</li>
                  <li>• Content you create and schedule through our platform</li>
                  <li>• Analytics and performance data from your posts</li>
                  <li>• Media files you upload to our platform</li>
                </ul>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-semibold mb-3">Usage Data</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• How you interact with our platform</li>
                  <li>• Features you use most frequently</li>
                  <li>• Performance metrics and analytics</li>
                  <li>• Technical information about your device and browser</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="w-5 h-5 mr-2 text-green-600" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold mb-3">Platform Functionality</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Connect and manage your social media accounts</li>
                    <li>• Create and schedule posts across platforms</li>
                    <li>• Generate AI-powered content suggestions</li>
                    <li>• Provide analytics and performance insights</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Service Improvement</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Improve our AI algorithms and features</li>
                    <li>• Enhance user experience and platform performance</li>
                    <li>• Provide customer support and assistance</li>
                    <li>• Send important service updates and notifications</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="w-5 h-5 mr-2 text-red-600" />
                Data Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                We implement industry-standard security measures to protect your data:
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold mb-3">Technical Security</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• End-to-end encryption for all data transmission</li>
                    <li>• Secure storage with database encryption</li>
                    <li>• Regular security audits and updates</li>
                    <li>• Access controls and authentication</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Operational Security</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Limited access to personal data</li>
                    <li>• Regular backup and disaster recovery</li>
                    <li>• Employee training on data protection</li>
                    <li>• Incident response procedures</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-orange-600" />
                Data Retention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Account Data</h3>
                  <p className="text-gray-700">
                    We retain your account data for as long as your account is active. When you delete your account, we will delete your data within 7 business days.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Social Media Tokens</h3>
                  <p className="text-gray-700">
                    Access tokens are stored securely and can be revoked by you at any time through your social media account settings.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Analytics Data</h3>
                  <p className="text-gray-700">
                    Analytics data is anonymized after 30 days and retained for service improvement purposes.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Media Files</h3>
                  <p className="text-gray-700">
                    Media files are deleted within 7 days of account deletion or when you remove them from our platform.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Deletion */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trash2 className="w-5 h-5 mr-2 text-red-600" />
                Your Rights - Data Deletion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                You have the right to request deletion of your data at any time. This is especially important for users connecting Facebook and Instagram accounts, as required by Meta's privacy policies.
              </p>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-blue-900 mb-2">How to Request Data Deletion</h4>
                <p className="text-blue-800 mb-3">
                  You can request deletion of your data by:
                </p>
                <ul className="text-blue-800 space-y-1">
                  <li>• Visiting our <Link href="/data-deletion" className="underline font-medium">Data Deletion Page</Link></li>
                  <li>• Emailing us at <span className="font-medium">davidayo2603@gmail.com</span></li>
                  <li>• Using the "Delete Account" option in your settings</li>
                </ul>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-2">What Gets Deleted</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Your account and profile information</li>
                    <li>• Connected social media accounts</li>
                    <li>• All created content and scheduled posts</li>
                    <li>• Analytics and performance data</li>
                    <li>• Uploaded media files</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Processing Time</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Account deletion: Within 7 business days</li>
                    <li>• Data removal: Within 7 business days</li>
                    <li>• Backup cleanup: Within 30 days</li>
                    <li>• Email confirmation: Sent upon completion</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Third-Party Services */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Third-Party Services</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                We integrate with the following third-party services:
              </p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Social Media Platforms</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Instagram</Badge>
                    <Badge variant="outline">Facebook</Badge>
                    <Badge variant="outline">Twitter</Badge>
                    <Badge variant="outline">TikTok</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    We connect to these platforms using their official APIs. Your data is shared according to their respective privacy policies.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">AI Services</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">OpenAI GPT</Badge>
                    <Badge variant="outline">Google Cloud</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    We use AI services to generate content suggestions and improve our platform features.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="w-5 h-5 mr-2 text-blue-600" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              
              <div className="space-y-2">
                <p><strong>Email:</strong> davidayo2603@gmail.com</p>
                <p><strong>Data Deletion:</strong> <Link href="/data-deletion" className="text-blue-600 underline">/data-deletion</Link></p>
                <p><strong>Response Time:</strong> Within 48 hours</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <Link 
            href="/"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to AdFlow
          </Link>
        </div>
      </div>
    </div>
  )
}
