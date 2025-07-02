import Image from "next/image";

const projects = [
  {
    name: "AI 聊天助手",
    description: "一个基于 AI 的智能对话系统，支持上下文记忆与多轮对话。",
    link: "https://example.com/chatbot",
    icon: "https://file.ichiyo.in/sakura/icons/check-light.svg",
  },
  {
    name: "个人博客系统",
    description: "支持 Markdown 编写、评论与标签分类的全栈博客平台。",
    link: "https://example.com/blog",
    icon: "https://file.ichiyo.in/sakura/icons/check-light.svg",
  },
  {
    name: "任务管理工具",
    description: "类似于 Trello 的可视化任务协作平台，支持多人实时协作。",
    link: "https://example.com/tasks",
    icon: "https://file.ichiyo.in/sakura/icons/check-light.svg",
  },
];

export default function HomeProject() {
  return (
    <>
      <div className="border-b bg-gray-50 dark:bg-black">
        <section className="section-base px-8 py-6">
          <div className="flex flex-col">
            <h1 className="text-2xl">项目</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              不才明主弃，多病故人疏。
            </p>
          </div>
        </section>
      </div>
      <div className="border-b">
        <section className="section-base p-0">
          <ul className="grid relative m-0 p-0 list-none">
            {projects.map((project, index) => (
              <li
                key={index}
                className="grid grid-cols-[0.5fr_1fr_0.5fr] h-[200px] max-[920px]:h-[160px] max-[768px]:h-[150px] border-b  last:border-b-0
                    max-[920px]:grid-cols-[0.5fr_1fr] 
                    max-[768px]:grid-cols-1
                    "
              >
                <div
                  className="flex items-center justify-center border-r
                       max-[768px]:hidden"
                >
                  <Image
                    src={project.icon}
                    alt={project.name}
                    width={48}
                    height={48}
                    className="w-12 h-12"
                  />
                </div>

                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`访问项目：${project.name}`}
                  className="px-10 flex flex-col justify-center border-r max-[768px]:items-center max-[768px]:text-center max-[768px]:border-r-0 hover:bg-gray-50 dark:hover:bg-black transition"
                >
                  <h3 className="text-2xl mb-2">{project.name}</h3>
                  <p className=" text-lg text-gray-500 dark:text-gray-300 font-normal">
                    {project.description}
                  </p>
                </a>

                <div className="bg-diagonal-stripes max-[920px]:hidden"></div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
