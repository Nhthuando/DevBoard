import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { createJob } from '@/services/jobsService'
import { getApiErrorMessage } from '@/lib/api-error'

const initialForm = {
  title: '',
  description: '',
  budgetMin: '',
  budgetMax: '',
  deadline: '',
  skillsRequired: '',
}

export default function CreateJobPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const skills = form.skillsRequired
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean)

      const payload = {
        title: form.title,
        description: form.description,
        budgetMin: Number(form.budgetMin),
        budgetMax: Number(form.budgetMax),
        deadline: form.deadline,
        skillsRequired: skills,
      }

      const response = await createJob(payload)
      const jobId = response?.job?.id

      if (jobId) {
        navigate(`/jobs/${jobId}`)
      } else {
        navigate('/jobs')
      }
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Could not create job.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page-enter min-h-screen bg-background py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Create A Job</h1>
            <p className="text-foreground/70 mt-1">Post your project for developers to apply.</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/jobs">Back to Jobs</Link>
          </Button>
        </div>

        <Card className="p-6 border-border/50 bg-card">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {errorMessage ? (
              <Alert variant="destructive">
                <AlertTitle>Create job failed</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            ) : null}

            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(event) => updateField('title', event.target.value)}
                placeholder="Build a React dashboard for analytics"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(event) => updateField('description', event.target.value)}
                placeholder="Describe scope, deliverables, and expectations..."
                className="mt-2 min-h-40"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budgetMin">Budget Min (USD)</Label>
                <Input
                  id="budgetMin"
                  type="number"
                  min="1"
                  value={form.budgetMin}
                  onChange={(event) => updateField('budgetMin', event.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="budgetMax">Budget Max (USD)</Label>
                <Input
                  id="budgetMax"
                  type="number"
                  min="1"
                  value={form.budgetMax}
                  onChange={(event) => updateField('budgetMax', event.target.value)}
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={form.deadline}
                onChange={(event) => updateField('deadline', event.target.value)}
                className="mt-2"
              />
              <p className="text-xs text-foreground/60 mt-1">Deadline must be at least 24 hours in the future.</p>
            </div>

            <div>
              <Label htmlFor="skillsRequired">Skills (comma separated)</Label>
              <Input
                id="skillsRequired"
                value={form.skillsRequired}
                onChange={(event) => updateField('skillsRequired', event.target.value)}
                placeholder="React, TypeScript, Node.js"
                className="mt-2"
              />
            </div>

            <Button disabled={isSubmitting} type="submit" className="bg-primary hover:bg-primary/90 text-white">
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner /> Creating...
                </span>
              ) : (
                'Create Job'
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
