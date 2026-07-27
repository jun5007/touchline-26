import { ButtonLink } from "@/components/common/Button";

export default function NotFound() {
  return (
    <div className="page-wrap grid min-h-[65vh] place-items-center py-16">
      <section className="panel max-w-xl p-8 text-center sm:p-12">
        <span className="number-tabular text-5xl font-black text-[#f4b860]">90+?</span>
        <h1 className="mt-5 text-3xl font-black tracking-[-.04em] text-white">이 장면은 기록에 없습니다</h1>
        <p className="mt-4 text-sm leading-6 text-[#9fa8b5]">
          존재하지 않는 경기 또는 미션 주소입니다. 검증된 경기 목록으로 돌아가 다시 선택해 주세요.
        </p>
        <ButtonLink href="/matches" className="mt-7">
          경기 목록으로 돌아가기
        </ButtonLink>
      </section>
    </div>
  );
}

