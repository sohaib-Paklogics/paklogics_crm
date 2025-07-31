"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useLeadStore } from "@/lib/stores/lead-store"
import { useUserStore } from "@/lib/stores/user-store"
import { leadSchema, type LeadFormData } from "@/lib/types"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface AddLeadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddLeadModal({ open, onOpenChange }: AddLeadModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuthStore()
  const { addLead } = useLeadStore()
  const { users } = useUserStore()

  const developers = users.filter((u) => u.role === "developer")

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      status: "new",
    },
  })

  const onSubmit = async (data: LeadFormData) => {
    if (!user) return

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const assignedDeveloper = data.assignedDeveloperId
        ? developers.find((dev) => dev.id === data.assignedDeveloperId)
        : undefined

      const newLead = {
        id: Math.random().toString(36).substr(2, 9),
        clientName: data.clientName,
        jobDescription: data.jobDescription,
        source: data.source,
        status: data.status,
        assignedDeveloperId: data.assignedDeveloperId,
        assignedDeveloper,
        createdById: user.id,
        createdBy: user,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        attachments: [],
        notes: [],
        history: [],
      }

      addLead(newLead)
      reset()
      onOpenChange(false)
    } catch (error) {
      console.error("Error creating lead:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-validiz-brown">Add New Lead</DialogTitle>
          <DialogDescription>Create a new lead opportunity. Fill in the details below.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name *</Label>
              <Input
                id="clientName"
                placeholder="Enter client name"
                className="focus:ring-validiz-mustard focus:border-validiz-mustard"
                {...register("clientName")}
              />
              {errors.clientName && <p className="text-sm text-red-600">{errors.clientName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Lead Source *</Label>
              <Select onValueChange={(value) => setValue("source", value as any)}>
                <SelectTrigger className="focus:ring-validiz-mustard focus:border-validiz-mustard">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="job_board">Job Board</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.source && <p className="text-sm text-red-600">{errors.source.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobDescription">Job Description *</Label>
            <Textarea
              id="jobDescription"
              placeholder="Describe the job requirements and responsibilities"
              rows={4}
              className="focus:ring-validiz-mustard focus:border-validiz-mustard"
              {...register("jobDescription")}
            />
            {errors.jobDescription && <p className="text-sm text-red-600">{errors.jobDescription.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select defaultValue="new" onValueChange={(value) => setValue("status", value as any)}>
                <SelectTrigger className="focus:ring-validiz-mustard focus:border-validiz-mustard">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                  <SelectItem value="test_assigned">Test Assigned</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedDeveloperId">Assign Developer</Label>
              <Select onValueChange={(value) => setValue("assignedDeveloperId", value)}>
                <SelectTrigger className="focus:ring-validiz-mustard focus:border-validiz-mustard">
                  <SelectValue placeholder="Select developer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {developers.map((developer) => (
                    <SelectItem key={developer.id} value={developer.id}>
                      {developer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-validiz-brown hover:bg-validiz-brown/90" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Lead"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
