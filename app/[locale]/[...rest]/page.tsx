import { notFound } from "next/navigation";
// Any URL that matches no page ends up here and shows our own 404.
export default function CatchAll() {
  notFound();
}
