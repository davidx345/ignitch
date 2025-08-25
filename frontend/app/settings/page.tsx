'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Settings, 
  User, 
  Shield, 
  Bell, 
  Globe, 
  Bot, 
  Palette,
  Link,
  Trash2,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import Navigation from '@/components/enhanced-navigation'
import { useAuth } from '@/contexts/auth-context'

const colors = {
  primary: '#3D5AFE',
  coral: '#FF6B6B',
  ink: '#1B1F3B',
  gray: '#F4F6FA',
  white: '#FFFFFF',
  mint: '#24CCA0',
  charcoal: '#2E2E3A',
  purple: '#8B5CF6',
  orange: '#F59E0B'
}

interface UserSettings {
  // Account Settings
  email: string
  full_name: string
  timezone: string
  language: string
  
  // Privacy Settings
  profile_visibility: 'public' | 'private'
  data_sharing: boolean
  analytics_tracking: boolean
  third_party_integrations: boolean
  
  // Notification Settings
  email_notifications: boolean
  push_notifications: boolean
  marketing_emails: boolean
  weekly_reports: boolean
  
  // AutoPilot Settings
  autopilot_enabled: boolean
  autopilot_goal: string
  content_style: string
  posting_frequency: string
  ai_creativity_level: number
  brand_voice: string
  content_themes: string[]
  exclude_topics: string[]
  
  // Content Settings
  default_hashtag_count: number
  auto_generate_captions: boolean
  auto_schedule_optimal_times: boolean
  content_approval_required: boolean
}

export default function SettingsPage() {
  const { user, session, isLoading } = useAuth()
  const router = useRouter()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [isSaving, setSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (!isLoading && !session) {
      router.push('/signin?redirect=/settings')
    }
  }, [session, isLoading, router])

  // Load user settings
  useEffect(() => {
    if (user && session) {
      // Mock settings - replace with actual API call
      const mockSettings: UserSettings = {
        email: user.email || '',
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        timezone: 'Africa/Lagos',
        language: 'en',
        profile_visibility: 'private',
        data_sharing: false,
        analytics_tracking: true,
        third_party_integrations: true,
        email_notifications: true,
        push_notifications: true,
        marketing_emails: false,
        weekly_reports: true,
        autopilot_enabled: false,
        autopilot_goal: 'engagement',
        content_style: 'balanced',
        posting_frequency: 'optimal',
        ai_creativity_level: 0.7,
        brand_voice: 'Professional yet approachable, with a focus on delivering value and building trust with our audience.',
        content_themes: ['Digital Marketing', 'Business Growth', 'Social Media Tips', 'Industry News'],
        exclude_topics: ['Politics', 'Controversial Topics'],
        default_hashtag_count: 10,
        auto_generate_captions: true,
        auto_schedule_optimal_times: true,
        content_approval_required: false
      }
      setSettings(mockSettings)
    }
  }, [user, session])

  const handleSettingChange = (key: string, value: any) => {
    if (!settings) return
    
    setSettings(prev => prev ? { ...prev, [key]: value } : null)
    setHasUnsavedChanges(true)
  }

  const handleArraySettingChange = (key: string, action: 'add' | 'remove', value: string, index?: number) => {
    if (!settings) return
    
    const currentArray = settings[key as keyof UserSettings] as string[]
    let newArray: string[]
    
    if (action === 'add' && value.trim()) {
      newArray = [...currentArray, value.trim()]
    } else if (action === 'remove' && index !== undefined) {
      newArray = currentArray.filter((_, i) => i !== index)
    } else {
      return
    }
    
    handleSettingChange(key, newArray)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    // Reset to last saved state
    setHasUnsavedChanges(false)
    // Reload settings from API
  }

  if (isLoading || !settings) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.gray }}>
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-200 rounded-lg" />
            <div className="h-64 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null; // Router will handle redirection
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.gray }}>
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: colors.ink }}>
              Settings
            </h1>
            <p className="text-gray-600 mt-1">Manage your account preferences and configurations</p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            {hasUnsavedChanges && (
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                Unsaved Changes
              </Badge>
            )}
            <Button 
              variant="outline" 
              onClick={handleReset}
              disabled={!hasUnsavedChanges || isSaving}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!hasUnsavedChanges || isSaving}
              style={{ backgroundColor: colors.primary }}
            >
              {isSaving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Account
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="autopilot" className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              AutoPilot
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Content
            </TabsTrigger>
          </TabsList>

          {/* Account Settings */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={settings.full_name}
                      onChange={(e) => handleSettingChange('full_name', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.email}
                      onChange={(e) => handleSettingChange('email', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={settings.timezone} onValueChange={(value) => handleSettingChange('timezone', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="US/Eastern">US Eastern</SelectItem>
                        <SelectItem value="US/Pacific">US Pacific</SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                        <SelectItem value="Africa/Lagos">Lagos</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select value={settings.language} onValueChange={(value) => handleSettingChange('language', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="current_password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current_password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter current password"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="new_password">New Password</Label>
                    <Input
                      id="new_password"
                      type="password"
                      placeholder="Enter new password"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="confirm_password">Confirm Password</Label>
                    <Input
                      id="confirm_password"
                      type="password"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
                
                <Button variant="outline" className="w-full sm:w-auto">
                  Update Password
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="profile_visibility">Profile Visibility</Label>
                    <p className="text-sm text-gray-600">Control who can see your profile</p>
                  </div>
                  <Select 
                    value={settings.profile_visibility} 
                    onValueChange={(value) => handleSettingChange('profile_visibility', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="data_sharing">Data Sharing</Label>
                    <p className="text-sm text-gray-600">Share anonymized data to improve services</p>
                  </div>
                  <Switch
                    id="data_sharing"
                    checked={settings.data_sharing}
                    onCheckedChange={(checked) => handleSettingChange('data_sharing', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="analytics_tracking">Analytics Tracking</Label>
                    <p className="text-sm text-gray-600">Allow usage analytics for better experience</p>
                  </div>
                  <Switch
                    id="analytics_tracking"
                    checked={settings.analytics_tracking}
                    onCheckedChange={(checked) => handleSettingChange('analytics_tracking', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="third_party">Third-party Integrations</Label>
                    <p className="text-sm text-gray-600">Allow connections with external services</p>
                  </div>
                  <Switch
                    id="third_party"
                    checked={settings.third_party_integrations}
                    onCheckedChange={(checked) => handleSettingChange('third_party_integrations', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email_notifications">Email Notifications</Label>
                    <p className="text-sm text-gray-600">Receive important updates via email</p>
                  </div>
                  <Switch
                    id="email_notifications"
                    checked={settings.email_notifications}
                    onCheckedChange={(checked) => handleSettingChange('email_notifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push_notifications">Push Notifications</Label>
                    <p className="text-sm text-gray-600">Get real-time updates in your browser</p>
                  </div>
                  <Switch
                    id="push_notifications"
                    checked={settings.push_notifications}
                    onCheckedChange={(checked) => handleSettingChange('push_notifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="marketing_emails">Marketing Emails</Label>
                    <p className="text-sm text-gray-600">Receive product updates and tips</p>
                  </div>
                  <Switch
                    id="marketing_emails"
                    checked={settings.marketing_emails}
                    onCheckedChange={(checked) => handleSettingChange('marketing_emails', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="weekly_reports">Weekly Reports</Label>
                    <p className="text-sm text-gray-600">Get weekly performance summaries</p>
                  </div>
                  <Switch
                    id="weekly_reports"
                    checked={settings.weekly_reports}
                    onCheckedChange={(checked) => handleSettingChange('weekly_reports', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AutoPilot Settings */}
          <TabsContent value="autopilot" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5" style={{ color: colors.primary }} />
                  AutoPilot Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autopilot_enabled">Enable AutoPilot</Label>
                    <p className="text-sm text-gray-600">Let AI manage your content strategy</p>
                  </div>
                  <Switch
                    id="autopilot_enabled"
                    checked={settings.autopilot_enabled}
                    onCheckedChange={(checked) => handleSettingChange('autopilot_enabled', checked)}
                  />
                </div>

                {settings.autopilot_enabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-6 border-t pt-6"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="autopilot_goal">Primary Goal</Label>
                        <Select 
                          value={settings.autopilot_goal} 
                          onValueChange={(value) => handleSettingChange('autopilot_goal', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="engagement">Engagement</SelectItem>
                            <SelectItem value="followers">Followers</SelectItem>
                            <SelectItem value="sales">Sales</SelectItem>
                            <SelectItem value="awareness">Awareness</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="content_style">Content Style</Label>
                        <Select 
                          value={settings.content_style} 
                          onValueChange={(value) => handleSettingChange('content_style', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="casual">Casual</SelectItem>
                            <SelectItem value="professional">Professional</SelectItem>
                            <SelectItem value="creative">Creative</SelectItem>
                            <SelectItem value="balanced">Balanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="ai_creativity">AI Creativity Level: {settings.ai_creativity_level}</Label>
                      <Slider
                        id="ai_creativity"
                        min={0}
                        max={1}
                        step={0.1}
                        value={[settings.ai_creativity_level]}
                        onValueChange={(value) => handleSettingChange('ai_creativity_level', value[0])}
                        className="mt-2"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Conservative</span>
                        <span>Creative</span>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="brand_voice">Brand Voice</Label>
                      <Textarea
                        id="brand_voice"
                        rows={3}
                        value={settings.brand_voice}
                        onChange={(e) => handleSettingChange('brand_voice', e.target.value)}
                        placeholder="Describe your brand's voice and tone..."
                      />
                    </div>

                    <div>
                      <Label>Content Themes</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {settings.content_themes.map((theme, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {theme}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0"
                              onClick={() => handleArraySettingChange('content_themes', 'remove', '', index)}
                            >
                              ×
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Settings */}
          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="hashtag_count">Default Hashtag Count: {settings.default_hashtag_count}</Label>
                  <Slider
                    id="hashtag_count"
                    min={5}
                    max={30}
                    step={1}
                    value={[settings.default_hashtag_count]}
                    onValueChange={(value) => handleSettingChange('default_hashtag_count', value[0])}
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto_captions">Auto-generate Captions</Label>
                    <p className="text-sm text-gray-600">Let AI create captions for your content</p>
                  </div>
                  <Switch
                    id="auto_captions"
                    checked={settings.auto_generate_captions}
                    onCheckedChange={(checked) => handleSettingChange('auto_generate_captions', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto_schedule">Auto-schedule at Optimal Times</Label>
                    <p className="text-sm text-gray-600">Post when your audience is most active</p>
                  </div>
                  <Switch
                    id="auto_schedule"
                    checked={settings.auto_schedule_optimal_times}
                    onCheckedChange={(checked) => handleSettingChange('auto_schedule_optimal_times', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="approval_required">Content Approval Required</Label>
                    <p className="text-sm text-gray-600">Review content before publishing</p>
                  </div>
                  <Switch
                    id="approval_required"
                    checked={settings.content_approval_required}
                    onCheckedChange={(checked) => handleSettingChange('content_approval_required', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="w-5 h-5" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-red-900">Delete Account</h4>
                    <p className="text-sm text-red-700">Permanently delete your account and all data</p>
                  </div>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
