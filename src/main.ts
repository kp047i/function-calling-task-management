import {
  createTask,
  getProjectTasks,
  completeTask,
  Task,
} from "./lib/ticktick/task.ts";

const createMessages = (prompt: string, tasks: Task[]) => {
  const messages = [
    {
      role: "system",
      content: `
      あなたは私のタスク管理を手伝ってくれるアシスタントです。ticktickのAPIを使ってタスクの管理を行います。
        以下は命令文です。
        ---
        ${prompt}
        ---

        以下は制約です。タスクの更新をするときは現状のタスクの情報を利用してtaskIdを指定してください。
        ---
        現在時刻: ${new Date().toLocaleString()}
        タイムゾーン: Asia/Tokyo
        現状のタスク: ${JSON.stringify(tasks)}
      `,
    },
  ];
  return messages;
};

const functions = [
  {
    name: "create_task",
    description: "API経由でticktcikにタスクを生成する関数",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "タスクのタイトル",
        },
        projectId: {
          type: "string",
          description: "タスクを追加するプロジェクトのID",
        },
        content: {
          type: "string",
          desctription: "タスクの詳細",
        },
        desc: {
          type: "string",
          description: "タスクの詳細",
        },
        isAllDay: {
          type: "boolean",
          description: "タスクが終日かどうか",
        },
        startDate: {
          type: "string",
          description: `Start date and time in "yyyy-MM-dd'T'HH:mm:ssZ" format Example : "2019-11-13T03:00:00+0000"`,
          format: "yyyy-MM-dd'T'HH:mm:ssZ",
        },
        dueDate: {
          type: "string",
          description: `Due date and time in "yyyy-MM-dd'T'HH:mm:ssZ" format Example : "2019-11-13T03:00:00+0000"`,
          format: "yyyy-MM-dd'T'HH:mm:ssZ",
        },
        timeZone: {
          type: "string",
          description: "タスクのタイムゾーン",
        },
        priority: {
          type: "number",
          description:
            "タスクの優先度。デフォルトの値が0で、値が大きいほど優先度が高くなる。最大は3",
        },
      },
      required: ["title"],
    },
  },
  {
    name: "get_project_tasks",
    description: "API経由でticktcickからタスクを取得する関数",
    parameters: {
      type: "object",
      properties: {
        projectId: {
          type: "string",
        },
      },
    },
  },
  {
    name: "complete_project_tasks",
    description: "API経由でticktcickのタスクを完了する関数",
    parameters: {
      type: "object",
      properties: {
        projectId: {
          type: "string",
          description: "タスクを完了するプロジェクトのID。現状は固定値",
        },
        taskId: {
          type: "string",
          description: "タスクのID",
        },
      },
    },
  },
];

if (import.meta.main) {
  try {
    const args = Deno.args;
    if (args.length === 0) {
      throw new Error("引数がありません");
    }
    const tasks = (await getProjectTasks()) as Task[];
    const messages = createMessages(args[0], tasks);
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo-0613",
        messages,
        functions,
      }),
    });
    const message = await res.json();
    console.log(JSON.stringify(message.choices[0]));

    if (!message.choices[0].message.function_call) {
      throw Error(
        `function_callがありません, ${JSON.stringify(message.choices[0])}}`
      );
    }
    switch (message.choices[0].message.function_call.name) {
      case "create_task": {
        const task = await createTask(
          JSON.parse(message.choices[0].message.function_call.arguments)
        );
        console.log("task created");
        console.log(task);
        break;
      }
      case "get_project_tasks": {
        const tasks = await getProjectTasks();
        console.log(tasks);
        break;
      }
      case "complete_project_tasks": {
        const foo = message.choices[0].message.function_call.arguments;
        const data = await completeTask(JSON.parse(foo).taskId);
        console.log(data);
      }
    }
  } catch (error) {
    console.log(error);
  }
}
