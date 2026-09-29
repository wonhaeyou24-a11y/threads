import { useEffect, useState } from "react";

interface ProgressStepsProps {
  title: string;
  steps: string[];
}

/**
 * 실제 AI 호출은 하나의 요청이라 세부 진행률을 알 수 없으므로,
 * 단계를 일정 간격으로 순차 진행시키는 방식으로 "멈춘 것처럼 보이지 않게" 한다.
 * 마지막 단계에 도달하면 스피너로 계속 작업 중임을 표시하고, 경과 시간을 함께 보여준다.
 */
const STEP_INTERVAL_MS = 2500;

export function ProgressSteps({ title, steps }: ProgressStepsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setActiveIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, STEP_INTERVAL_MS);
    const secondTimer = setInterval(() => {
      setElapsedSec((prev) => prev + 1);
    }, 1000);
    return () => {
      clearInterval(stepTimer);
      clearInterval(secondTimer);
    };
  }, [steps.length]);

  return (
    <div className="flex flex-col items-center gap-3 py-10">
      <p className="text-gray-600">{title}</p>
      <ul className="flex flex-col gap-1.5">
        {steps.map((label, i) => {
          const isDone = i < activeIndex;
          const isActive = i === activeIndex;
          return (
            <li
              key={label}
              className={`text-sm flex items-center gap-2 ${
                isDone || isActive ? "text-gray-800" : "text-gray-400"
              }`}
            >
              <span className="w-4 inline-flex justify-center">
                {isDone ? (
                  "✓"
                ) : isActive ? (
                  <span className="inline-block w-3 h-3 rounded-full border-2 border-violet-400 border-t-transparent animate-spin" />
                ) : (
                  "○"
                )}
              </span>
              {label}
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-gray-400 mt-1">
        {elapsedSec}초 경과{elapsedSec > 15 ? " · 응답이 길어질 수 있어요" : ""}
      </p>
    </div>
  );
}
