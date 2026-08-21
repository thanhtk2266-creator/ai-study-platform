import { Progress } from "@/components/ui/progress";

interface QuizProgressProps {
  current: number;
  total: number;
}

export function QuizProgress({ current, total }: QuizProgressProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          Câu {current}/{total}
        </span>
        <span className="text-sm text-gray-500">
          {Math.round(percentage)}% hoàn thành
        </span>
      </div>
      <Progress value={percentage} color="primary" />
    </div>
  );
}
