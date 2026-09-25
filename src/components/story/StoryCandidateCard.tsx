import type { StoryCandidate } from "../../types/story";
import { Button } from "../common/Button";
import { Card } from "../common/Card";

interface StoryCandidateCardProps {
  candidate: StoryCandidate;
  label: string;
  onSelect: () => void;
}

export function StoryCandidateCard({
  candidate,
  label,
  onSelect,
}: StoryCandidateCardProps) {
  return (
    <Card className="flex flex-col gap-3 text-left">
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <h3 className="text-lg font-semibold text-gray-900">
          {candidate.title}
        </h3>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600">
          장르: {candidate.genre}
        </span>
        <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600">
          분위기: {candidate.tone}
        </span>
      </div>

      <p className="text-sm text-gray-700 leading-relaxed">
        {candidate.summary}
      </p>

      {candidate.twist && (
        <p className="text-sm text-violet-700 bg-violet-50 rounded-lg px-3 py-2">
          반전: {candidate.twist}
        </p>
      )}

      {candidate.characters.length > 0 && (
        <p className="text-xs text-gray-400">
          등장인물: {candidate.characters.join(", ")}
        </p>
      )}

      <Button onClick={onSelect} className="mt-2">
        이 이야기 선택
      </Button>
    </Card>
  );
}
