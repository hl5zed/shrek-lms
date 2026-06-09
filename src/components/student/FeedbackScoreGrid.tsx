import ScoreBar from "./ScoreBar";

type FeedbackScoreGridProps = {
  reading: number | null;
  thinking: number | null;
  logic: number | null;
  structure: number | null;
  expression: number | null;
};

export default function FeedbackScoreGrid(props: FeedbackScoreGridProps) {
  const hasAny =
    props.reading !== null ||
    props.thinking !== null ||
    props.logic !== null ||
    props.structure !== null ||
    props.expression !== null;

  if (!hasAny) {
    return <p className="text-sm text-[#6470BF]">아직 점수 데이터가 없습니다.</p>;
  }

  return (
    <div className="grid gap-3">
      <ScoreBar label="독해력" score={props.reading ?? 0} />
      <ScoreBar label="사고력" score={props.thinking ?? 0} />
      <ScoreBar label="논리력" score={props.logic ?? 0} />
      <ScoreBar label="구성력" score={props.structure ?? 0} />
      <ScoreBar label="표현력" score={props.expression ?? 0} />
    </div>
  );
}

