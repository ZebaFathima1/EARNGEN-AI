import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/Layout";
import { RequireAuth } from "@/components/RequireAuth";
import { CourseDetail } from "@/components/learn/CourseDetail";
import { getCourse } from "@/lib/learn/catalog";

export const Route = createFileRoute("/learn/$courseId")({
  head: ({ params }) => {
    const course = getCourse(params.courseId);
    return {
      meta: [
        { title: course ? `${course.title} — Learn — EARNGEN-AI` : "Course — EARNGEN-AI" },
        { name: "description", content: course?.description ?? "Watch and learn on EARNGEN-AI." },
      ],
    };
  },
  component: CoursePage,
});

function CoursePage() {
  const { courseId } = Route.useParams();
  return (
    <Shell>
      <RequireAuth>
        <CourseDetail courseId={courseId} />
      </RequireAuth>
    </Shell>
  );
}
