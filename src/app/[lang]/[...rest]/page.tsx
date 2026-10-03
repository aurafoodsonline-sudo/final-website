import { notFound } from "next/navigation";

// Any unknown address inside /en or /ur shows the friendly 404 page with the normal header/footer.
export default function CatchAll() {
  notFound();
}
