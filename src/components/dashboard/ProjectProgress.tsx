import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ProjectProgressCard } from './ProjectProgressCard'
import type { Project } from '@/types/dashboard'

interface ProjectProgressProps {
  projects: Project[]
  onNavigate?: (pageId: string) => void
}

export function ProjectProgress({ projects, onNavigate }: ProjectProgressProps) {
  return (
    <Card hover>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          项目进度概览
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {projects.map((project) => (
            <ProjectProgressCard
              key={project.id}
              project={project}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
