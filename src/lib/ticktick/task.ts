export type Task = {
  title: string; // Required
  projectId?: string;
  content?: string;
  desc?: string;
  isAllDay?: boolean;
  startDate?: Date;
  dueDate?: Date;
  timeZone?: string;
  reminders?: any[];
  repeatFlag?: string;
  priority?: number;
  sortOrder?: number;
};

const END_POINT = "https://api.ticktick.com";

const ACCESS_TOKEN = Deno.env.get("TICKTICK_ACCESS_TOKEN");
const PROJECT_ID = "<Your project ID>";

export const getUserProject = async () => {
  const res = await fetch(END_POINT + "/open/v1/project", {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
  });
  return await res.json();
};

export const getProjectTasks = async () => {
  const res = await fetch(END_POINT + `/open/v1/project/${PROJECT_ID}/data`, {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
  });
  return await res.json();
};

export const createTask = async (task: Task) => {
  const res = await fetch(END_POINT + `/open/v1/task`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...task,
      projectId: PROJECT_ID,
    }),
  });

  return await res.json();
};

export const completeTask = async (taskId: string) => {
  const res = await fetch(
    END_POINT + `/open/v1/project/${PROJECT_ID}/task/${taskId}/complete`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
  return await res.json();
};
