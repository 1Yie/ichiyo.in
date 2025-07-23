"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface Project {
  name: string;
  description: string;
  link: string;
  icon: string;
}

export default function HomeProject() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch("/api/project");
        if (!res.ok) throw new Error("获取项目列表失败");
        const data = await res.json();
        setProjects(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "未知错误");
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  if (loading) {
    return (
      <section className="section-base px-8 py-6 text-center">
        加载中...
      </section>
    );
  }

  if (error) {
    return (
      <section className="section-base px-8 py-6 text-center text-red-500">
        错误：{error}
      </section>
    );
  }

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
                className="grid grid-cols-[0.5fr_1fr_0.5fr] h-[200px] max-[920px]:h-[160px] max-[768px]:h-[150px] border-b last:border-b-0
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
