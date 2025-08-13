"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, Clock, Instagram, Facebook, Youtube, MessageSquare, TrendingUp, Zap, Play } from "lucide-react"

interface ScheduledPost {
  id: string
  contentId: string
  platform: string
  scheduledTime: Date
  status: "scheduled" | "published" | "failed"
  optimalTime: boolean
}

interface SmartSchedulerProps {
  generatedContent: any[]
}

export default function SmartScheduler({ generatedContent }: SmartSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedPlatform, setSelectedPlatform] = useState("all")
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([
    {
      id: "1",
      contentId: "content1",
      platform: "instagram",
      scheduledTime: new Date(2024, 11, 25, 14, 30),
      status: "scheduled",
      optimalTime: true,
    },
    {
      id: "2",
      contentId: "content2",
      platform: "facebook",
      scheduledTime: new Date(2024, 11, 25, 16, 0),
      status: "scheduled",
      optimalTime: true,
    },
    {
      id: "3",
      contentId: "content3",
      platform: "tiktok",
      scheduledTime: new Date(2024, 11, 26, 19, 0),
      status: "published",
      optimalTime: false,
    },
  ])

  const optimalTimes: { [key: string]: { time: string; engagement: string; day: string; }[] } = {
    instagram: [
      { time: "11:00 AM", engagement: "92%", day: "Tuesday" },
      { time: "2:00 PM", engagement: "88%", day: "Wednesday" },
      { time: "5:00 PM", engagement: "85%", day: "Friday" },
    ],
    facebook: [
      { time: "1:00 PM", engagement: "89%", day: "Wednesday" },
      { time: "3:00 PM", engagement: "86%", day: "Thursday" },
      { time: "8:00 PM", engagement: "83%", day: "Sunday" },
    ],
    tiktok: [
      { time: "6:00 PM", engagement: "94%", day: "Tuesday" },
      { time: "9:00 PM", engagement: "91%", day: "Thursday" },
      { time: "7:00 AM", engagement: "87%", day: "Friday" },
    ],
    youtube: [
      { time: "2:00 PM", engagement: "85%", day: "Saturday" },
      { time: "8:00 PM", engagement: "82%", day: "Sunday" },
      { time: "5:00 PM", engagement: "79%", day: "Wednesday" },
    ],
  }

  const platformIcons: { [key: string]: any } = {
    instagram: Instagram,
    facebook: Facebook,
    youtube: Youtube,
    tiktok: MessageSquare,
    whatsapp: MessageSquare,
  }

  const schedulePost = (contentId: string, platform: string, time: Date) => {
    const newPost: ScheduledPost = {
      id: Math.random().toString(36).substr(2, 9),
      contentId,
      platform,
      scheduledTime: time,
      status: "scheduled",
      optimalTime: true,
    }
    setScheduledPosts([...scheduledPosts, newPost])
  }

  const bulkSchedule = () => {
    // Simulate bulk scheduling with optimal times
    const platforms = ["instagram", "facebook", "tiktok", "youtube"]
    const newPosts: ScheduledPost[] = []

    generatedContent.slice(0, 4).forEach((content, index) => {
      const platform = platforms[index % platforms.length]
      const optimalTime = optimalTimes[platform][0]
      const scheduledTime = new Date()
      scheduledTime.setHours(
        Number.parseInt(optimalTime.time.split(":")[0]) + (optimalTime.time.includes("PM") ? 12 : 0),
      )
      scheduledTime.setMinutes(Number.parseInt(optimalTime.time.split(":")[1].split(" ")[0]))
      scheduledTime.setDate(scheduledTime.getDate() + index + 1)

      newPosts.push({
        id: Math.random().toString(36).substr(2, 9),
        contentId: content.id,
        platform,
        scheduledTime,
        status: "scheduled",
        optimalTime: true,
      })
    })

    setScheduledPosts([...scheduledPosts, ...newPosts])
  }

  return (
    <div className="space-y-6">
      {/* Scheduler Header */}
      <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5 text-purple-600" />
            <span>Smart Scheduler</span>
          </CardTitle>
          <CardDescription>Schedule posts across all platforms with AI-optimized timing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">24</div>
                  <div className="text-sm text-gray-600">Scheduled</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">156</div>
                  <div className="text-sm text-gray-600">Published</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">6</div>
                  <div className="text-sm text-gray-600">Platforms</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">89%</div>
                  <div className="text-sm text-gray-600">Optimal Times</div>
                </Card>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={bulkSchedule}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Auto-Schedule All
                </Button>
                <Button variant="outline">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Optimize Times
                </Button>
                <Button variant="outline">
                  <Play className="w-4 h-4 mr-2" />
                  Publish Now
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <Card className="lg:col-span-2 bg-white/70 backdrop-blur-sm border-purple-200">
          <CardHeader>
            <CardTitle>Content Calendar</CardTitle>
            <CardDescription>Drag and drop to reschedule posts</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="calendar" className="space-y-4">
              <TabsList>
                <TabsTrigger value="calendar">Calendar View</TabsTrigger>
                <TabsTrigger value="timeline">Timeline View</TabsTrigger>
              </TabsList>

              <TabsContent value="calendar" className="space-y-4">
                <div className="flex items-center justify-between">
                  <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Platforms</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </TabsContent>

              <TabsContent value="timeline" className="space-y-4">
                <div className="space-y-3">
                  {scheduledPosts.map((post) => {
                    const Icon = platformIcons[post.platform] || MessageSquare
                    return (
                      <div key={post.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Icon className="w-5 h-5 text-gray-600" />
                          <div>
                            <div className="font-medium capitalize">{post.platform}</div>
                            <div className="text-sm text-gray-600">
                              {post.scheduledTime.toLocaleDateString()} at{" "}
                              {post.scheduledTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {post.optimalTime && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Optimal
                            </Badge>
                          )}
                          <Badge
                            variant={post.status === "published" ? "default" : "secondary"}
                            className={
                              post.status === "published"
                                ? "bg-green-100 text-green-800"
                                : post.status === "failed"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-blue-100 text-blue-800"
                            }
                          >
                            {post.status}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Optimal Times */}
        <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-purple-600" />
              <span>Optimal Times</span>
            </CardTitle>
            <CardDescription>AI-recommended posting times for maximum engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="instagram" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="instagram">Instagram</TabsTrigger>
                <TabsTrigger value="facebook">Facebook</TabsTrigger>
              </TabsList>

              <TabsContent value="instagram" className="space-y-3">
                {optimalTimes.instagram.map((time, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{time.day}</div>
                      <div className="text-sm text-gray-600">{time.time}</div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {time.engagement}
                    </Badge>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="facebook" className="space-y-3">
                {optimalTimes.facebook.map((time, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{time.day}</div>
                      <div className="text-sm text-gray-600">{time.time}</div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {time.engagement}
                    </Badge>
                  </div>
                ))}
              </TabsContent>
            </Tabs>

            <div className="mt-6 p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="font-medium text-purple-900">Pro Tip</span>
              </div>
              <p className="text-sm text-purple-800">
                Posts scheduled during optimal times see 3x higher engagement rates on average.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
