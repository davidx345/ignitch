import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Mail, Shield, Clock, Trash2, AlertTriangle, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Data Deletion Request</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We respect your privacy. Request the deletion of your data from AdFlow.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* What We Store */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
                What Data We Store
              </CardTitle>
              <CardDescription>
                When you connect your social media accounts, we may store:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Your social media account usernames</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Access tokens for posting content</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Content you create through our platform</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Analytics and performance data</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Scheduled posts and campaigns</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> We do not store your social media passwords. 
                  We only store secure access tokens that you can revoke at any time 
                  from your social media account settings.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Deletion Process */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trash2 className="w-5 h-5 mr-2 text-red-500" />
                How to Delete Your Data
              </CardTitle>
              <CardDescription>
                Follow these steps to request data deletion:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <Badge className="mr-3 mt-1">1</Badge>
                  <div>
                    <h4 className="font-semibold">Email Us</h4>
                    <p className="text-sm text-gray-600">
                      Send an email to our support team with your request
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Badge className="mr-3 mt-1">2</Badge>
                  <div>
                    <h4 className="font-semibold">Provide Details</h4>
                    <p className="text-sm text-gray-600">
                      Include your email address and social media usernames
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Badge className="mr-3 mt-1">3</Badge>
                  <div>
                    <h4 className="font-semibold">Verification</h4>
                    <p className="text-sm text-gray-600">
                      We'll verify your identity and process your request
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Badge className="mr-3 mt-1">4</Badge>
                  <div>
                    <h4 className="font-semibold">Confirmation</h4>
                    <p className="text-sm text-gray-600">
                      You'll receive confirmation when deletion is complete
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Section */}
        <Card className="mt-8 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center">
              <Mail className="w-5 h-5 mr-2 text-blue-600" />
              Request Data Deletion
            </CardTitle>
            <CardDescription>
              Contact us to delete your data from our systems
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-lg font-medium text-gray-900 mb-2">
                Email Address
              </p>
              <p className="text-2xl font-bold text-blue-600">
                davidayo2603@gmail.com
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">What to Include in Your Email:</h3>
              <div className="grid gap-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Your email address used for AdFlow account
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Social media usernames you connected
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Subject line: "Data Deletion Request"
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Reason for deletion (optional)
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-4">
              <Clock className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-gray-600">
                We will process your request within <strong>7 business days</strong>
              </span>
            </div>
            
            <Button 
              asChild 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            >
              <a href="mailto:davidayo2603@gmail.com?subject=Data%20Deletion%20Request&body=Hello,%0D%0A%0D%0AI would like to request deletion of my data from AdFlow.%0D%0A%0D%0AMy email address: [Your Email]%0D%0AConnected social media accounts: [List your connected accounts]%0D%0A%0D%0AThank you.">
                <Mail className="w-4 h-4 mr-2" />
                Send Deletion Request
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card className="mt-8 shadow-lg">
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-2">What Happens After Deletion?</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• All your account data is permanently removed</li>
                  <li>• Connected social media accounts are disconnected</li>
                  <li>• Scheduled posts and campaigns are cancelled</li>
                  <li>• Analytics data is anonymized or deleted</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">What We Don't Delete</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Data required for legal compliance</li>
                  <li>• Anonymous usage statistics</li>
                  <li>• Data already shared with social platforms</li>
                  <li>• Backup data (deleted within 30 days)</li>
                </ul>
              </div>
            </div>
            
            <Separator />
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">Important Note</h4>
              <p className="text-sm text-yellow-700">
                Deleting your data from AdFlow will not delete your content from social media platforms. 
                You'll need to manually remove posts from Instagram, Facebook, TikTok, or Twitter if desired.
              </p>
            </div>
          </CardContent>
        </Card>

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
