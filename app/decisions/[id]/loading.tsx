import { LoadingState } from "@/components/LoadingState";

export default function DecisionDetailLoading() {
  return (
    <div className="flex flex-1 flex-col bg-bg text-text">
      <LoadingState label="Загружаем разбор…" />
    </div>
  );
}
