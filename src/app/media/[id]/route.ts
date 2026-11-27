import { getAdminStore } from "@/lib/admin/store"

/** Админаас оруулсан зураг. Id нь санамсаргүй, агуулга нь өөрчлөгдөхгүй тул удаан cache-лэнэ. */
export async function GET(_request: Request, { params }: RouteContext<"/media/[id]">) {
  const { id } = await params
  const media = await getAdminStore()?.readMedia(id)
  if (!media) return new Response("Not found", { status: 404 })
  return new Response(new Uint8Array(media.data), {
    headers: {
      "content-type": media.mime,
      "cache-control": "public, max-age=31536000, immutable",
      "x-content-type-options": "nosniff",
      ...(media.mime === "application/pdf" && { "content-disposition": "inline" }),
    },
  })
}
