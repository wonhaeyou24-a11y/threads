export interface ProgressStep {
  label: string;
  done: boolean;
}

interface ProgressStepsProps {
  title: string;
  steps: ProgressStep[];
}

export function ProgressSteps({ title, steps }: ProgressStepsProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-10">
      <p className="text-gray-600">{title}</p>
      <ul className="flex flex-col gap-1.5">
        {steps.map((step) => (
          <li
            key={step.label}
            className={`text-sm flex items-center gap-2 ${
              step.done ? "text-gray-800" : "text-gray-400"
            }`}
          >
            <span>{step.done ? "✓" : "○"}</span>
            {step.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
