import { LoadingState } from "@/components/LoadingState";

export default function NewDecisionLoading() {
  return (
    <div className="flex flex-1 bg-bg">
      <LoadingState label="Открываем форму…" />
    </div>
  );
}
