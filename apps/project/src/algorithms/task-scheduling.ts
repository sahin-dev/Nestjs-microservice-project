// Simple Task Scheduler in TypeScript with skills, priority, and availability

interface Task {
  id: string;
  priority: number; // Higher means more important
  requiredSkills: string[];
  estimatedTime: number; // in hours
}

interface TeamMember {
  id: string;
  name: string;
  skills: string[];
  availability: number; // in hours
  assignedTasks: Task[];
}

interface Assignment {
  taskId: string;
  memberId: string;
}

const alpha = 5; // skill weight
const beta = 3;  // availability weight
const gamma = 2; // workload penalty weight

function score(task: Task, member: TeamMember): number {
  const skillMatch = task.requiredSkills.filter(skill => member.skills.includes(skill)).length;
  const skillScore = skillMatch / task.requiredSkills.length;

  const availabilityScore = (member.availability - task.estimatedTime) / member.availability;
  const workloadPenalty = member.assignedTasks.reduce((sum, t) => sum + t.estimatedTime, 0) / (member.availability || 1);

  return (skillScore * alpha) + (availabilityScore * beta) - (workloadPenalty * gamma);
}

function assignTasks(tasks: Task[], members: TeamMember[]): Assignment[] {
  const assignments: Assignment[] = [];
  const sortedTasks = [...tasks].sort((a, b) => b.priority - a.priority);

  for (const task of sortedTasks) {
    let bestMember: TeamMember | null = null;
    let bestScore = -Infinity;

    for (const member of members) {
      if (task.estimatedTime <= member.availability) {
        const s = score(task, member);
        if (s > bestScore) {
          bestScore = s;
          bestMember = member;
        }
      }
    }

    if (bestMember) {
      bestMember.assignedTasks.push(task);
      bestMember.availability -= task.estimatedTime;
      assignments.push({ taskId: task.id, memberId: bestMember.id });
    }
  }

  return assignments;
}

// Example Usage
const tasks: Task[] = [
  { id: 'T1', priority: 5, requiredSkills: ['backend'], estimatedTime: 10 },
  { id: 'T2', priority: 3, requiredSkills: ['frontend'], estimatedTime: 8 },
  { id: 'T3', priority: 4, requiredSkills: ['devops'], estimatedTime: 6 },
];

const members: TeamMember[] = [
  { id: 'M1', name: 'Alice', skills: ['frontend', 'backend'], availability: 20, assignedTasks: [] },
  { id: 'M2', name: 'Bob', skills: ['devops', 'backend'], availability: 15, assignedTasks: [] },
];

const result = assignTasks(tasks, members);
console.log(result);
