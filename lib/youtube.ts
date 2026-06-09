/**
 * Extract an 11-character YouTube video ID from a URL or bare ID.
 * Returns null when the value is not a recognizable YouTube reference.
 */
export function extractYouTubeVideoId(
  input: string | null | undefined
): string | null {
  if (!input) return null
  const trimmed = input.trim()
  if (!trimmed) return null

  if (/^[\w-]{11}$/.test(trimmed)) return trimmed

  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`)
    const host = url.hostname.replace(/^www\./, "")

    if (host === "youtu.be") {
      const id = url.pathname.slice(1).split("/")[0]
      return id.length === 11 ? id : null
    }

    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "music.youtube.com"
    ) {
      const fromQuery = url.searchParams.get("v")
      if (fromQuery && fromQuery.length === 11) return fromQuery

      const pathMatch = url.pathname.match(
        /^\/(?:embed|shorts|live|v)\/([\w-]{11})/
      )
      if (pathMatch) return pathMatch[1]
    }
  } catch {
    // Not a valid URL — fall through to regex
  }

  const regExp =
    /(?:youtu\.be\/|v\/|embed\/|shorts\/|live\/|watch\?v=|&v=)([\w-]{11})/
  const match = trimmed.match(regExp)
  return match?.[1]?.length === 11 ? match[1] : null
}

/**
 * Resolve the YouTube video ID for a lesson.
 * Per-lesson `content.videoUrl` (instructor editor) wins over `youtubeVideoId`
 * so a bulk-updated shared column does not override unique lesson URLs.
 */
export function resolveLessonYoutubeVideoId(lesson: {
  youtubeVideoId: string | null
  content: unknown
}): string | null {
  const candidates: (string | null | undefined)[] = []

  if (lesson.content && typeof lesson.content === "object") {
    const videoUrl = (lesson.content as { videoUrl?: string }).videoUrl
    if (videoUrl?.trim()) candidates.push(videoUrl)
  }

  if (lesson.youtubeVideoId?.trim()) {
    candidates.push(lesson.youtubeVideoId)
  }

  for (const candidate of candidates) {
    const id = extractYouTubeVideoId(candidate)
    if (id) return id
  }

  return null
}

export const YOUTUBE_PLAYER_ERROR_MESSAGES: Record<number, string> = {
  2: "Invalid player configuration.",
  5: "This video cannot be played. Check that the lesson has a valid YouTube URL.",
  100: "Video not found or is private.",
  101: "This video cannot be embedded. Open it on YouTube or use a different link.",
  150: "This video cannot be embedded. Open it on YouTube or use a different link.",
}
