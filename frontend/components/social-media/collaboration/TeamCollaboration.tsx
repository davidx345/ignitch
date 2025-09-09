"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  Send, 
  UserPlus,
  Shield,
  Star,
  Eye,
  Edit,
  MoreHorizontal,
  Calendar,
  Bell,
  Filter
} from "lucide-react"

// Mock data for collaboration features
const pendingApprovals = [
  {
    id: 1,
    content: "Summer sale announcement with 30% off promotion",
    type: "Instagram Post",
    creator: "Sarah Johnson",
    createdAt: "2024-01-15T10:30:00Z",
    platforms: ["Instagram", "Facebook"],
    status: "pending",
    priority: "high",
    comments: 2
  },
  {
    id: 2,
    content: "Behind-the-scenes video of product development",
    type: "TikTok Video",
    creator: "Mike Chen",
    createdAt: "2024-01-15T09:15:00Z",
    platforms: ["TikTok", "Instagram"],
    status: "pending",
    priority: "medium",
    comments: 1
  },
  {
    id: 3,
    content: "Customer testimonial carousel post",
    type: "Carousel Post",
    creator: "Emma Davis",
    createdAt: "2024-01-14T16:45:00Z",
    platforms: ["LinkedIn", "Facebook"],
    status: "reviewing",
    priority: "low",
    comments: 0
  }
]

const teamMembers = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah@company.com",
    role: "Content Creator",
    avatar: "/api/placeholder/32/32",
    status: "online",
    permissions: ["create", "edit"],
    joinedAt: "2024-01-01"
  },
  {
    id: 2,
    name: "Mike Chen",
    email: "mike@company.com",
    role: "Video Producer",
    avatar: "/api/placeholder/32/32",
    status: "offline",
    permissions: ["create", "edit"],
    joinedAt: "2024-01-05"
  },
  {
    id: 3,
    name: "Emma Davis",
    email: "emma@company.com",
    role: "Manager",
    avatar: "/api/placeholder/32/32",
    status: "online",
    permissions: ["create", "edit", "approve", "admin"],
    joinedAt: "2023-12-15"
  },
  {
    id: 4,
    name: "Alex Wilson",
    email: "alex@company.com",
    role: "Approver",
    avatar: "/api/placeholder/32/32",
    status: "away",
    permissions: ["approve", "comment"],
    joinedAt: "2024-01-10"
  }
]

const comments = [
  {
    id: 1,
    postId: 1,
    author: "Emma Davis",
    content: "Love the energy in this post! Can we adjust the CTA to be more specific about the discount terms?",
    createdAt: "2024-01-15T11:00:00Z",
    avatar: "/api/placeholder/32/32"
  },
  {
    id: 2,
    postId: 1,
    author: "Alex Wilson",
    content: "Agreed with Emma. Also, let's make sure we have legal approval for the sale terms before posting.",
    createdAt: "2024-01-15T11:15:00Z",
    avatar: "/api/placeholder/32/32"
  }
]

export default function TeamCollaboration() {
  const [selectedTab, setSelectedTab] = useState("approvals")
  const [newComment, setNewComment] = useState("")
  const [selectedPriority, setSelectedPriority] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")

  const handleApproval = (id: number, action: 'approve' | 'reject') => {
    console.log(`${action} post ${id}`)
    // Implementation for approval/rejection
  }

  const handleComment = (postId: number) => {
    if (newComment.trim()) {
      console.log(`Adding comment to post ${postId}: ${newComment}`)
      setNewComment("")
      // Implementation for adding comments
    }
  }

  const filteredApprovals = pendingApprovals.filter(approval => {
    const priorityMatch = selectedPriority === "all" || approval.priority === selectedPriority
    const statusMatch = selectedStatus === "all" || approval.status === selectedStatus
    return priorityMatch && statusMatch
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Team Collaboration</h2>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="approvals" className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Pending Approvals</span>
            <Badge variant="secondary" className="ml-1">
              {pendingApprovals.filter(p => p.status === 'pending').length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Team Management</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center space-x-2">
            <Bell className="w-4 h-4" />
            <span>Activity Feed</span>
          </TabsTrigger>
        </TabsList>

        {/* Pending Approvals Tab */}
        <TabsContent value="approvals" className="space-y-4">
          {/* Filters */}
          <div className="flex space-x-4 mb-4">
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewing">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Approval Queue */}
          <div className="space-y-4">
            {filteredApprovals.map((approval) => (
              <Card key={approval.id} className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge 
                        variant={approval.priority === 'high' ? 'destructive' : approval.priority === 'medium' ? 'default' : 'secondary'}
                      >
                        {approval.priority} priority
                      </Badge>
                      <Badge variant="outline">{approval.type}</Badge>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(approval.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <h4 className="font-semibold text-lg mb-2">{approval.content}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>by {approval.creator}</span>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{approval.platforms.join(", ")}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{approval.comments} comments</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleApproval(approval.id, 'reject')}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleApproval(approval.id, 'approve')}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                </div>

                {/* Comments Section */}
                {approval.comments > 0 && (
                  <div className="border-t pt-4 mt-4">
                    <h5 className="font-medium mb-3">Comments</h5>
                    <div className="space-y-3">
                      {comments
                        .filter(comment => comment.postId === approval.id)
                        .map((comment) => (
                          <div key={comment.id} className="flex space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={comment.avatar} />
                              <AvatarFallback>{comment.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-sm">{comment.author}</span>
                                <span className="text-xs text-gray-500">
                                  {new Date(comment.createdAt).toLocaleTimeString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                    
                    {/* Add Comment */}
                    <div className="flex space-x-3 mt-4">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>You</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 flex space-x-2">
                        <Input
                          placeholder="Add a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleComment(approval.id)}
                        />
                        <Button 
                          size="sm"
                          onClick={() => handleComment(approval.id)}
                          disabled={!newComment.trim()}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Team Management Tab */}
        <TabsContent value="team" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team Members */}
            <Card className="p-4">
              <h4 className="font-semibold mb-4">Team Members</h4>
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{member.name}</span>
                          <div className={`w-2 h-2 rounded-full ${
                            member.status === 'online' ? 'bg-green-500' : 
                            member.status === 'away' ? 'bg-yellow-500' : 
                            'bg-gray-400'
                          }`} />
                        </div>
                        <div className="text-sm text-gray-600">{member.role}</div>
                        <div className="text-xs text-gray-500">{member.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{member.role}</Badge>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Permissions & Roles */}
            <Card className="p-4">
              <h4 className="font-semibold mb-4">Roles & Permissions</h4>
              <div className="space-y-4">
                <div className="p-3 rounded-lg border border-blue-200 bg-blue-50">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Admin</span>
                  </div>
                  <p className="text-sm text-blue-700 mb-2">Full access to all features and settings</p>
                  <div className="flex flex-wrap gap-1">
                    {["create", "edit", "approve", "admin", "invite"].map(permission => (
                      <Badge key={permission} variant="secondary" className="text-xs">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-green-200 bg-green-50">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-900">Approver</span>
                  </div>
                  <p className="text-sm text-green-700 mb-2">Can approve and reject content</p>
                  <div className="flex flex-wrap gap-1">
                    {["approve", "comment", "view"].map(permission => (
                      <Badge key={permission} variant="secondary" className="text-xs">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-purple-200 bg-purple-50">
                  <div className="flex items-center space-x-2 mb-2">
                    <Edit className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-purple-900">Creator</span>
                  </div>
                  <p className="text-sm text-purple-700 mb-2">Can create and edit content</p>
                  <div className="flex flex-wrap gap-1">
                    {["create", "edit", "comment"].map(permission => (
                      <Badge key={permission} variant="secondary" className="text-xs">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-2 mb-2">
                    <Eye className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-900">Viewer</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">Read-only access to content</p>
                  <div className="flex flex-wrap gap-1">
                    {["view", "comment"].map(permission => (
                      <Badge key={permission} variant="secondary" className="text-xs">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Feed Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card className="p-4">
            <h4 className="font-semibold mb-4">Recent Activity</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 rounded-lg bg-green-50">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">Emma Davis</span> approved 
                    <span className="font-medium"> "Holiday sale announcement"</span>
                  </p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg bg-blue-50">
                <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">Alex Wilson</span> commented on 
                    <span className="font-medium"> "Summer sale announcement"</span>
                  </p>
                  <p className="text-xs text-gray-500">4 hours ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg bg-purple-50">
                <Edit className="w-5 h-5 text-purple-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">Sarah Johnson</span> created 
                    <span className="font-medium"> "Behind-the-scenes video"</span>
                  </p>
                  <p className="text-xs text-gray-500">6 hours ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg bg-yellow-50">
                <UserPlus className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">Mike Chen</span> joined the team as 
                    <span className="font-medium"> Video Producer</span>
                  </p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg bg-red-50">
                <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">Emma Davis</span> rejected 
                    <span className="font-medium"> "Product launch teaser"</span>
                  </p>
                  <p className="text-xs text-gray-500">2 days ago</p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
