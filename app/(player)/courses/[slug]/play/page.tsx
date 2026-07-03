"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  ChevronRight,
  Play,
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronUp,
  Settings,
  Maximize2,
  Minimize2,
  Tv,
  Volume2,
  VolumeX,
  PlayCircle,
  HelpCircle,
  FileText,
  BookOpen,
  ArrowLeft,
  Trophy,
  Download,
  PartyPopper,
  Check,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { extractYouTubeVideoId, YOUTUBE_PLAYER_ERROR_MESSAGES } from "@/lib/youtube"
import { LessonDiscussion } from "@/components/player/LessonDiscussion"

// ─── Global YT type declaration ────────────────────────────────────────────
declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: (() => void) | undefined
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface QuizQuestion {
  id: string
  text: string
  options: string[]
  correctOptionIndex: number
}

interface LessonContent {
  videoUrl?: string
  text?: string
  questions?: QuizQuestion[]
}

interface Lesson {
  id: string
  title: string
  type: string
  content: LessonContent | null
  duration: number | null
  youtubeVideoId: string | null
  order: number
  isCompleted: boolean
  isLocked: boolean
}

interface Section {
  id: string
  title: string
  order: number
  lessons: Lesson[]
}

interface CoursePlayState {
  course: {
    id: string
    title: string
    slug: string
    logo: string | null
  }
  enrollment: {
    id: string
    progress: number
    currentLessonId: string | null
  }
  completedLessonIds: string[]
  curriculum: Section[]
}

const SPEED_OPTIONS = ["0.5", "0.75", "1", "1.25", "1.5", "1.75", "2"] as const

function formatTime(timeInSeconds: number): string {
  const hours = Math.floor(timeInSeconds / 3600)
  const minutes = Math.floor((timeInSeconds % 3600) / 60)
  const seconds = Math.floor(timeInSeconds % 60)
  return hours > 0
    ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

// ─── Promise-based YouTube IFrame API loader, module-level singleton ──
// Loads the script exactly once for the whole app and resolves a shared
// promise via the official onYouTubeIframeAPIReady callback, chaining any
// pre-existing handler instead of clobbering it.
let ytApiPromise: Promise<void> | null = null

function loadYouTubeIframeAPI(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve()
  if (window.YT?.Player) return Promise.resolve()
  if (ytApiPromise) return ytApiPromise

  ytApiPromise = new Promise((resolve) => {
    const previousCallback = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.()
      resolve()
    }
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement("script")
      tag.src = "https://www.youtube.com/iframe_api"
      document.head.appendChild(tag)
    }
  })

  return ytApiPromise
}

// ─── Player settings menu ──────────────────────────────────────────────────
interface PlayerSettingsMenuProps {
  playbackSpeed: string
  availableQualities: string[]
  activeQuality: string
  ccActive: boolean
  onSpeedSelect: (speed: string) => void
  onQualitySelect: (quality: string) => void
  onToggleCc: () => void
  onClose: () => void
}

function PlayerSettingsMenu({
  playbackSpeed,
  availableQualities,
  activeQuality,
  ccActive,
  onSpeedSelect,
  onQualitySelect,
  onToggleCc,
  onClose,
}: PlayerSettingsMenuProps) {
  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40" />
      <div className="absolute bottom-12 right-0 w-64 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl z-50 animate-fade-in-up space-y-4">
        <div className="space-y-1.5">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Playback speed</p>
          <div className="grid grid-cols-4 gap-1">
            {SPEED_OPTIONS.map((speed) => (
              <button
                key={speed}
                type="button"
                onClick={() => onSpeedSelect(speed)}
                className={cn(
                  "text-[10px] font-semibold py-1 rounded transition-colors text-center cursor-pointer",
                  playbackSpeed === speed
                    ? "bg-primary text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Quality</p>
          <div className="flex flex-wrap gap-1">
            {availableQualities.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => onQualitySelect(q)}
                className={cn(
                  "text-[9px] font-semibold py-0.5 px-1.5 rounded transition-colors cursor-pointer",
                  activeQuality === q
                    ? "bg-primary text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-light">Subtitles / Captions CC</span>
          <button
            type="button"
            onClick={onToggleCc}
            className={cn(
              "px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase transition-colors cursor-pointer",
              ccActive
                ? "bg-emerald-600 text-white"
                : "bg-slate-800 text-slate-500 hover:text-slate-300"
            )}
          >
            {ccActive ? "On" : "Off"}
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CoursePlayerPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [state, setState] = React.useState<CoursePlayState | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [activeLesson, setActiveLesson] = React.useState<Lesson | null>(null)
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(new Set())
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [theatreMode, setTheatreMode] = React.useState(false)
  const [showCompletionBanner, setShowCompletionBanner] = React.useState(true)

  // YouTube player state
  const playerRef = React.useRef<any>(null)
  // FIX: Tracks whether the *current* playerRef.current instance is alive.
  // Event handlers (onReady/onStateChange/onError) read this ref instead of
  // a per-effect-run "destroyed" closure variable. Previously, when the video
  // effect re-ran and *reused* the existing YT.Player (the loadVideoById fast
  // path below, used when navigating between video lessons so the iframe
  // doesn't reload), the reused player's callbacks were still the ones bound
  // to the *previous* effect run's closure — and that previous run's cleanup
  // had already flipped its own local "destroyed" flag to true. Every
  // subsequent onStateChange/onReady call then silently no-op'd, so isPlaying
  // and currentTime stopped updating forever. That's the actual cause of
  // "play/pause and timestamps stop working after the first lesson."
  const playerAliveRef = React.useRef(false)
  const playerContainerRef = React.useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const [volume, setVolume] = React.useState(50)
  const [isMuted, setIsMuted] = React.useState(false)
  const [iframeFallback, setIframeFallback] = React.useState(false)

  // `videoEnded` drives a custom "up next" overlay so YouTube's own suggested-
  // videos grid never gets a chance to show. `videoError` holds a persistent,
  // visible reason when a video genuinely cannot play.
  const [videoEnded, setVideoEnded] = React.useState(false)
  const [videoError, setVideoError] = React.useState<string | null>(null)
  const [retryKey, setRetryKey] = React.useState(0)

  // Stable refs so YT callbacks never read stale closure values
  const volumeRef = React.useRef(50)
  const isMutedRef = React.useRef(false)
  const playbackSpeedRef = React.useRef("1")

  // Consume-once "was this lesson change a real click?" flag. Browsers block
  // unmuted autoplay unless play() happens inside genuine user activation, so
  // page load / resumed lessons must NOT force autoplay. Sidebar clicks and
  // next/prev buttons set this ref right before switching lessons.
  const autoplayIntentRef = React.useRef(false)

  // Settings state
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [playbackSpeed, setPlaybackSpeed] = React.useState("1")
  const [availableQualities, setAvailableQualities] = React.useState<string[]>([])
  const [activeQuality, setActiveQuality] = React.useState("Auto")
  const [ccActive, setCcActive] = React.useState(false)

  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [completing, setCompleting] = React.useState(false)

  // Stable refs used inside async callbacks/effects
  const activeLessonRef = React.useRef<Lesson | null>(null)
  const loadedVideoIdRef = React.useRef<string | null>(null)
  const activeSidebarItemRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    activeLessonRef.current = activeLesson
  }, [activeLesson])

  React.useEffect(() => { volumeRef.current = volume }, [volume])
  React.useEffect(() => { isMutedRef.current = isMuted }, [isMuted])
  React.useEffect(() => { playbackSpeedRef.current = playbackSpeed }, [playbackSpeed])

  const activeYoutubeVideoId = React.useMemo(
    () =>
      activeLesson?.youtubeVideoId
        ? extractYouTubeVideoId(activeLesson.youtubeVideoId)
        : null,
    [activeLesson?.id, activeLesson?.youtubeVideoId]
  )

  const flatLessons = React.useMemo(() => {
    if (!state) return []
    return state.curriculum.flatMap((section) =>
      [...section.lessons].sort((a, b) => a.order - b.order)
    )
  }, [state])

  const loadPlayState = React.useCallback(
    async (initial = false, signal?: AbortSignal) => {
      try {
        if (initial) setLoading(true)
        const res = await fetch(`/api/courses/${slug}/play-state`, { signal })
        if (!res.ok) throw new Error("Failed to load curriculum")
        const json = await res.json()
        const data = json.data as CoursePlayState
        setState(data)

        if (initial && data.curriculum.length > 0) {
          const expanded = new Set<string>()
          data.curriculum.forEach((section) => expanded.add(section.id))
          setExpandedSections(expanded)
        }

        if (initial) {
          let resumeLesson: Lesson | null = null
          if (data.enrollment.currentLessonId) {
            for (const section of data.curriculum) {
              const found = section.lessons.find(
                (l) => l.id === data.enrollment.currentLessonId
              )
              if (found && !found.isLocked) {
                resumeLesson = found
                break
              }
            }
          }
          if (!resumeLesson) {
            for (const section of data.curriculum) {
              const found = section.lessons.find((l) => !l.isLocked)
              if (found) {
                resumeLesson = found
                break
              }
            }
          }
          // Note: autoplayIntentRef is intentionally left false here — this is
          // page load, not a click, so the video will be cued, not force-played.
          if (resumeLesson) setActiveLesson(resumeLesson)
        } else {
          const currentId = activeLessonRef.current?.id
          if (currentId) {
            for (const section of data.curriculum) {
              const found = section.lessons.find((l) => l.id === currentId)
              if (found) {
                setActiveLesson(found)
                break
              }
            }
          }
        }
      } catch (err: any) {
        if (err.name === "AbortError") return
        console.error(err)
        toast.error("Failed to load curriculum details.")
      } finally {
        if (initial) setLoading(false)
      }
    },
    [slug]
  )

  React.useEffect(() => {
    const controller = new AbortController()
    loadPlayState(true, controller.signal)
    return () => controller.abort()
  }, [loadPlayState])

  // ─── YouTube player helpers ───────────────────────────────────────────────

  const applySavedPlaybackPosition = React.useCallback(
    (player: any, lessonId: string) => {
      const savedTime = localStorage.getItem(`playback_time_${lessonId}`)
      if (!savedTime) return
      const timeSec = parseFloat(savedTime)
      const total = player.getDuration?.() ?? 0
      if (timeSec > 5 && total > 0 && timeSec < total - 10) {
        player.seekTo(timeSec, true)
        setCurrentTime(timeSec)
      }
    },
    []
  )

  const isPlayerAlive = React.useCallback(() => {
    if (!playerRef.current) return false
    try {
      const iframe = playerRef.current.getIframe?.()
      return iframe && document.body.contains(iframe)
    } catch {
      return false
    }
  }, [])

  const destroyPlayer = React.useCallback(() => {
    if (playerRef.current) {
      try { playerRef.current.destroy() } catch (e) { console.error("Destroy error:", e) }
      playerRef.current = null
      loadedVideoIdRef.current = null
    }
    playerAliveRef.current = false
  }, [])

  // Reset per-lesson video UI state whenever the lesson changes
  React.useEffect(() => {
    setIframeFallback(false)
    setVideoEnded(false)
    setVideoError(null)
  }, [activeLesson?.id])

  // ─── FIX: Pause playback when the active lesson isn't a video ─────────────
  // The YouTube player is intentionally kept mounted in the background when
  // switching to a quiz/text lesson (see the "always in DOM" comment further
  // down), so that resuming a video lesson doesn't re-fetch/re-buffer it. But
  // nothing was ever telling the *player itself* to stop — only its container
  // was CSS-hidden — so audio/video kept running underneath the quiz/reading
  // UI. This effect explicitly pauses it any time you're not on a video lesson.
  React.useEffect(() => {
    if (activeLesson?.type === "video") return
    const player = playerRef.current
    if (player && typeof player.pauseVideo === "function") {
      try { player.pauseVideo() } catch (e) { console.error("Pause on lesson-switch failed:", e) }
    }
    setIsPlaying(false)
  }, [activeLesson?.type])

  // ─── Retry handler — lets the person recover from a failed load ───────────
  // without a full page refresh.
  const retryVideoLoad = React.useCallback(() => {
    setVideoError(null)
    setIframeFallback(false)
    loadedVideoIdRef.current = null
    destroyPlayer()
    autoplayIntentRef.current = true
    setRetryKey((k) => k + 1)
  }, [destroyPlayer])

  // ─── YouTube player init / video-swap effect ──────────────────────────────
  React.useEffect(() => {
    if (!activeLesson || activeLesson.type !== "video" || !activeYoutubeVideoId || iframeFallback) {
      return
    }

    const videoId = activeYoutubeVideoId
    const lessonId = activeLesson.id
    const shouldAutoplay = autoplayIntentRef.current
    autoplayIntentRef.current = false // consume once — next effect run defaults to "don't force play"
    // Guards only the async loadYouTubeIframeAPI().then() callback below, so
    // we don't create/load a video after this specific effect run was
    // cleaned up. Deliberately NOT read inside the player's event handlers —
    // see playerAliveRef above for why that used to silently break play/pause
    // and the time display across lesson switches.
    let cancelled = false

    const ensurePlayerDiv = () => {
      if (!document.getElementById("youtube-player")) {
        const el = document.createElement("div")
        el.id = "youtube-player"
        el.className = "w-full h-full"
        document.getElementById("youtube-player-container")?.appendChild(el)
      }
    }

    const loadLessonVideo = (player: any) => {
      if (loadedVideoIdRef.current === videoId) return
      setCurrentTime(0)
      setDuration(0)
      setVideoEnded(false)
      loadedVideoIdRef.current = videoId

      const savedTime = localStorage.getItem(`playback_time_${lessonId}`)
      const startSeconds = savedTime && parseFloat(savedTime) > 5 ? parseFloat(savedTime) : 0

      player.setVolume(volumeRef.current)
      if (isMutedRef.current) player.mute()
      else player.unMute()
      player.setPlaybackRate(parseFloat(playbackSpeedRef.current))

      if (shouldAutoplay) {
        // loadVideoById starts playback immediately — safe here because this
        // path only runs from a real click (sidebar item, next/prev, retry).
        player.loadVideoById({ videoId, startSeconds })
      } else {
        // cueVideoById loads the first frame without playing. The visible
        // "play" overlay below is what actually starts it, guaranteeing a
        // real user gesture backs the playVideo() call.
        player.cueVideoById({ videoId, startSeconds })
        setIsPlaying(false)
      }
    }

    const createPlayer = () => {
      if (cancelled) return
      destroyPlayer()
      ensurePlayerDiv()

      playerRef.current = new window.YT.Player("youtube-player", {
        videoId,
        host: "https://www.youtube-nocookie.com",
        playerVars: {
          enablejsapi: 1,
          origin: window.location.origin,
          rel: 0,
          modestbranding: 1,
          controls: 0,
          autoplay: shouldAutoplay ? 1 : 0,
          playsinline: 1,
          fs: 0,
        },
        events: {
          onReady: (event: any) => {
            if (!playerAliveRef.current) return
            loadedVideoIdRef.current = videoId
            const player = event.target
            setDuration(player.getDuration())
            player.setVolume(volumeRef.current)
            if (isMutedRef.current) player.mute()
            const levels = player.getAvailableQualityLevels?.()
            setAvailableQualities(levels?.length > 0 ? levels : ["Auto"])
            player.setPlaybackRate(parseFloat(playbackSpeedRef.current))
            applySavedPlaybackPosition(player, lessonId)
            if (!shouldAutoplay) setIsPlaying(false)
            // If shouldAutoplay is true we deliberately don't setIsPlaying(true)
            // here — onStateChange (below) is now the single source of truth,
            // so if the browser silently blocks the autoplay, the UI correctly
            // still shows the "paused" play button instead of lying about it.
          },
          onStateChange: (event: any) => {
            if (!playerAliveRef.current) return
            const State = window.YT.PlayerState
            if (event.data === State.PLAYING) {
              setIsPlaying(true)
              setVideoEnded(false)
              const total = event.target?.getDuration?.()
              if (total > 0) setDuration(total)
            } else if (event.data === State.PAUSED) {
              setIsPlaying(false)
            } else if (event.data === State.ENDED) {
              setIsPlaying(false)
              setVideoEnded(true)
            }
          },
          onError: (event: any) => {
            if (!playerAliveRef.current) return
            const code = event?.data as number
            console.error("YouTube Player Error:", code, "for videoId:", videoId)
            setIsPlaying(false)

            if (code === 101 || code === 150) {
              // Embedding disallowed by the owner — this is exactly what you get
              // for a video set to Private. Unlisted fixes it; nothing in this
              // component can work around it.
              setVideoError(
                "This video can't be embedded. If it's set to Private on YouTube, switch it to Unlisted — Private videos can never play in an embedded player, for anyone."
              )
            } else if (code === 100) {
              setVideoError("This video doesn't exist, or was deleted/made private.")
            } else if (code === 5) {
              destroyPlayer()
              setIframeFallback(true)
            } else {
              const message =
                YOUTUBE_PLAYER_ERROR_MESSAGES[code] ??
                "Video playback failed. Try refreshing or another lesson."
              setVideoError(message)
              toast.error(message)
            }
          },
        },
      })
      playerAliveRef.current = true
    }

    loadYouTubeIframeAPI().then(() => {
      if (cancelled) return
      if (
        playerRef.current &&
        typeof playerRef.current.loadVideoById === "function" &&
        isPlayerAlive()
      ) {
        loadLessonVideo(playerRef.current)
      } else {
        createPlayer()
      }
    })

    return () => {
      cancelled = true
    }
  }, [
    activeLesson?.id,
    activeLesson?.type,
    activeYoutubeVideoId,
    iframeFallback,
    retryKey,
    applySavedPlaybackPosition,
    isPlayerAlive,
    destroyPlayer,
  ])

  // Destroy player on page leave
  React.useEffect(() => {
    return () => {
      try { playerRef.current?.destroy() } catch { }
      playerRef.current = null
      loadedVideoIdRef.current = null
      playerAliveRef.current = false
    }
  }, [])

  const triggerCompletion = React.useCallback(async () => {
    const curLesson = activeLessonRef.current
    if (!curLesson || completing || curLesson.isCompleted) return
    try {
      setCompleting(true)
      const res = await fetch("/api/lesson-completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: curLesson.id }),
      })
      if (!res.ok) throw new Error("Failed to register completion")
      toast.success(`"${curLesson.title}" completed! 🎉`, { duration: 3000 })
      await loadPlayState()
    } catch (err) {
      console.error(err)
    } finally {
      setCompleting(false)
    }
  }, [completing, loadPlayState])

  React.useEffect(() => {
    if (!isPlaying || !playerRef.current) return

    const timer = setInterval(() => {
      if (!playerRef.current || typeof playerRef.current.getCurrentTime !== "function") return
      const current = playerRef.current.getCurrentTime()
      const total = playerRef.current.getDuration()
      setCurrentTime(current)
      if (total > 0) setDuration(total)

      if (activeLesson && Math.floor(current) % 5 === 0) {
        localStorage.setItem(`playback_time_${activeLesson.id}`, String(current))
      }

      // Bumped from 50% to 60% watched to match the "watched" threshold the
      // sidebar tick now represents — both should agree on what counts as
      // "watched" so the tick and the real completion state never disagree.
      if (total > 0 && current / total >= 0.6 && activeLesson && !activeLesson.isCompleted && !completing) {
        triggerCompletion()
      }
    }, 500)

    return () => clearInterval(timer)
  }, [isPlaying, activeLesson?.id, completing, triggerCompletion])

  const togglePlay = React.useCallback(() => {
    const player = playerRef.current
    if (!player || typeof player.playVideo !== 'function') return
    if (isPlaying) {
      player.pauseVideo()
      setIsPlaying(false)
    } else {
      player.playVideo()
      // Real state confirmed by onStateChange — no optimistic set here.
    }
  }, [isPlaying])

  const toggleMute = React.useCallback(() => {
    if (!playerRef.current) return
    if (isMuted) {
      playerRef.current.unMute()
      setIsMuted(false)
    } else {
      playerRef.current.mute()
      setIsMuted(true)
    }
  }, [isMuted])

  const seekDelta = React.useCallback((seconds: number) => {
    if (!playerRef.current || typeof playerRef.current.getCurrentTime !== "function") return
    const current = playerRef.current.getCurrentTime()
    const total = playerRef.current.getDuration()
    playerRef.current.seekTo(Math.max(0, Math.min(total, current + seconds)), true)
    setCurrentTime((prev) => Math.max(0, Math.min(total, prev + seconds)))
  }, [])

  const handleVolumeChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseInt(e.target.value)
    setVolume(vol)
    setIsMuted(false)
    playerRef.current?.setVolume?.(vol)
  }, [])

  const handleScrubberChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!playerRef.current) return
    const targetTime = parseFloat(e.target.value)
    playerRef.current.seekTo(targetTime, true)
    setCurrentTime(targetTime)
  }, [])

  const changeSpeedStep = React.useCallback(
    (step: number) => {
      const currentIndex = SPEED_OPTIONS.indexOf(playbackSpeed as any)
      const nextSpeed = SPEED_OPTIONS[Math.max(0, Math.min(SPEED_OPTIONS.length - 1, currentIndex + step))]
      setPlaybackSpeed(nextSpeed)
      playerRef.current?.setPlaybackRate?.(parseFloat(nextSpeed))
      toast.success(`Playback Speed: ${nextSpeed}x`)
    },
    [playbackSpeed]
  )

  const handleSpeedSelect = React.useCallback((speed: string) => {
    setPlaybackSpeed(speed)
    playerRef.current?.setPlaybackRate?.(parseFloat(speed))
  }, [])

  const handleQualitySelect = React.useCallback((quality: string) => {
    setActiveQuality(quality)
    playerRef.current?.setPlaybackQuality?.(quality)
  }, [])

  const toggleCc = React.useCallback(() => {
    if (!playerRef.current) return
    if (ccActive) {
      playerRef.current.unloadModule("captions")
      setCcActive(false)
    } else {
      playerRef.current.loadModule("captions")
      setCcActive(true)
    }
  }, [ccActive])

  const toggleTheatre = React.useCallback(() => {
    setTheatreMode((prev) => {
      const next = !prev
      setSidebarCollapsed(next)
      return next
    })
  }, [])

  const toggleFullscreen = React.useCallback(() => {
    const el = playerContainerRef.current
    if (!el) return
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch((err) => console.error("Fullscreen failed:", err))
    } else {
      document.exitFullscreen()
    }
  }, [])

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement).isContentEditable) return

      switch (e.code) {
        case "Space": e.preventDefault(); togglePlay(); break
        case "KeyF": e.preventDefault(); toggleFullscreen(); break
        case "KeyT": e.preventDefault(); toggleTheatre(); break
        case "KeyM": e.preventDefault(); toggleMute(); break
        case "ArrowRight": e.preventDefault(); seekDelta(5); break
        case "ArrowLeft": e.preventDefault(); seekDelta(-5); break
        case "Period": if (e.shiftKey) { e.preventDefault(); changeSpeedStep(1) } break
        case "Comma": if (e.shiftKey) { e.preventDefault(); changeSpeedStep(-1) } break
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [togglePlay, toggleFullscreen, toggleTheatre, toggleMute, seekDelta, changeSpeedStep])

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", handler)
    return () => document.removeEventListener("fullscreenchange", handler)
  }, [])

  React.useEffect(() => {
    activeSidebarItemRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }, [activeLesson?.id])

  const handleLessonClick = React.useCallback(
    async (lesson: Lesson) => {
      if (lesson.isLocked) {
        toast.error("Complete the previous lessons to unlock this content!")
        return
      }
      // Real click → safe to autoplay the next lesson's video.
      autoplayIntentRef.current = true
      setActiveLesson(lesson)
      setShowCompletionBanner(false)
      setSettingsOpen(false)

      if (state?.enrollment?.id) {
        try {
          await fetch(`/api/enrollment/${state.enrollment.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ currentLessonId: lesson.id }),
          })
        } catch (err) {
          console.error("Failed to sync active lesson state:", err)
        }
      }
    },
    [state?.enrollment?.id]
  )

  const handleNextLesson = React.useCallback(() => {
    if (!activeLesson) return
    const currentIndex = flatLessons.findIndex((l) => l.id === activeLesson.id)
    if (currentIndex === -1 || currentIndex >= flatLessons.length - 1) {
      toast.info("You've reached the last lesson in this course!")
      return
    }
    const next = flatLessons[currentIndex + 1]
    if (next.isLocked) toast.error("Unlock this lesson by completing the current lesson first!")
    else handleLessonClick(next)
  }, [activeLesson, flatLessons, handleLessonClick])

  const handlePrevLesson = React.useCallback(() => {
    if (!activeLesson) return
    const currentIndex = flatLessons.findIndex((l) => l.id === activeLesson.id)
    if (currentIndex > 0) handleLessonClick(flatLessons[currentIndex - 1])
  }, [activeLesson, flatLessons, handleLessonClick])

  // ─── Derived values ───────────────────────────────────────────────────────
  const activeIndex = flatLessons.findIndex((l) => l.id === activeLesson?.id)
  const hasPrev = activeIndex > 0
  const hasNext = activeIndex !== -1 && activeIndex < flatLessons.length - 1
  const progressPercentage = state?.enrollment.progress ?? 0
  const isCourseFullyCompleted = progressPercentage === 100

  if (loading || !state || !activeLesson) {
    return <div className="h-screen w-screen bg-slate-950" />
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="h-screen w-screen flex overflow-hidden bg-slate-950 select-none">

      {/* ─── LEFT SIDEBAR ─── */}
      <aside
        className={cn(
          "h-full bg-slate-50 flex flex-col shrink-0 transition-all duration-300 border-r border-slate-200 z-20 overflow-hidden",
          sidebarCollapsed ? "w-0 opacity-0" : "w-[420px] opacity-100"
        )}
      >
        <div className="bg-[#363845] p-6 pt-8 space-y-6 shrink-0 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <Link
              href={`/dashboard/student`}
              className="text-[13px] italic text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to course page
            </Link>
            <button
              type="button"
              onClick={() => setSidebarCollapsed(true)}
              className="h-7 w-7 text-slate-400 hover:text-white flex items-center justify-center rounded hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-medium text-white font-display line-clamp-2 leading-snug">
              {state.course.title}
            </h2>
            <div className="flex items-center justify-between gap-4 text-xs pt-1">
              <div className="h-[3px] flex-1 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="font-semibold text-slate-200 shrink-0">{progressPercentage} %</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {state.curriculum.map((section, sIndex) => {
            const isExpanded = expandedSections.has(section.id)
            const isSectionActive = section.lessons.some(l => l.id === activeLesson.id)

            return (
              <div key={section.id} className={cn("border-b border-slate-200", isSectionActive ? "border-b-0" : "")}>
                <button
                  type="button"
                  onClick={() =>
                    setExpandedSections((prev) => {
                      const next = new Set(prev)
                      if (next.has(section.id)) next.delete(section.id)
                      else next.add(section.id)
                      return next
                    })
                  }
                  className={cn(
                    "w-full flex items-center justify-between p-5 text-left transition-colors",
                    isSectionActive ? "bg-indigo-500 text-white hover:bg-indigo-600" : "bg-white text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                    <span className={cn("text-[15px]", isSectionActive ? "text-white" : "text-slate-500")}>
                      {sIndex + 1}.
                    </span>
                    <span className={cn("text-[15px] truncate pr-1", isSectionActive ? "font-medium" : "")}>{section.title}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className={cn("h-4 w-4 shrink-0", isSectionActive ? "text-white" : "text-slate-400")} />
                  ) : (
                    <ChevronDown className={cn("h-4 w-4 shrink-0", isSectionActive ? "text-white" : "text-slate-400")} />
                  )}
                </button>

                {isExpanded && (
                  <div className="bg-slate-50">
                    {section.lessons.map((lesson) => {
                      const isActive = activeLesson.id === lesson.id
                      // Type-based icon: video → play icon, everything else
                      // (quiz / text / self-assessment / pdf) → book icon.
                      // Unlike before, completion no longer *replaces* this
                      // icon — instead it adds a small check badge on top of
                      // it, so the lesson type stays visible even once watched.
                      const LessonIcon = lesson.isLocked
                        ? Lock
                        : lesson.type === "video"
                          ? PlayCircle
                          : BookOpen
                      const showWatchedTick = !lesson.isLocked && lesson.isCompleted

                      return (
                        <div
                          key={lesson.id}
                          ref={isActive ? activeSidebarItemRef : null}
                          onClick={() => handleLessonClick(lesson)}
                          className={cn(
                            "flex items-start gap-4 px-6 py-4 cursor-pointer transition-all select-none border-l-4 border-b border-white/5 last:border-b-0",
                            isActive
                              ? "bg-[#272935] border-l-indigo-500 text-white"
                              : "bg-[#272935] border-l-transparent text-slate-300 hover:bg-[#323440] hover:text-white",
                            lesson.isLocked ? "cursor-not-allowed opacity-60" : ""
                          )}
                        >
                          <div className="relative mt-0.5 shrink-0">
                            <LessonIcon className={cn("h-4 w-4", isActive ? "text-white" : "text-slate-400")} />
                            {/* Watched tick — badged on the icon itself rather than
                                replacing it, so the video/book icon stays visible.
                                Ring color matches the row background so it reads
                                as a clean cutout on both active (indigo highlight
                                is only on the section header, not this row) and
                                inactive rows. */}
                            {showWatchedTick && (
                              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-[#272935]">
                                <Check className="h-2 w-2 text-white" strokeWidth={3.5} />
                              </span>
                            )}
                          </div>

                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-[14px] font-medium leading-snug break-words">
                              {lesson.title}
                            </span>

                            <div className="flex items-center justify-between mt-1 gap-2">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-[11px] capitalize text-slate-400 font-medium truncate">
                                  {lesson.type === "quiz"
                                    ? "Self-Assessment"
                                    : lesson.type === "text"
                                      ? "Reading"
                                      : "video"}
                                </span>
                              </div>

                              {lesson.duration ? (
                                <span className="text-[11px] text-slate-400 font-medium shrink-0 tabular-nums">
                                  {formatTime(lesson.duration)}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </aside>

      {sidebarCollapsed && (
        <button
          type="button"
          onClick={() => { setSidebarCollapsed(false); setTheatreMode(false) }}
          className="absolute top-4 left-4 h-9 w-9 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-white shadow-xl z-30 transition-all cursor-pointer"
        >
          <ChevronRight className="h-4.5 w-4.5" />
        </button>
      )}

      {/* ─── MAIN CONTENT PANEL ─── */}
      <main ref={playerContainerRef} className="flex-1 flex flex-col h-full overflow-hidden bg-black relative">

        <header className="h-14 bg-[#1e2028] border-b border-black flex items-center justify-center px-8 shrink-0 z-10 select-none relative">
          <div className="w-full max-w-4xl flex items-center justify-between">
            <Button
              variant="ghost" size="sm"
              onClick={handlePrevLesson}
              disabled={!hasPrev}
              className="text-[11px] lowercase tracking-wider gap-1 cursor-pointer font-normal hover:bg-slate-800/50 text-slate-300 disabled:opacity-30"
            >
              ‹ previous
            </Button>

            <div className="flex items-center gap-4">
              {activeLesson.type === "video" && (
                <button onClick={toggleMute} className="text-slate-400 hover:text-white transition-colors cursor-pointer hidden md:flex">
                  {isMuted || volume === 0 ? <VolumeX className="h-4.5 w-4.5" /> : <Volume2 className="h-4.5 w-4.5" />}
                </button>
              )}
              <Button
                variant="ghost" size="sm"
                onClick={handleNextLesson}
                disabled={!hasNext}
                className="text-[11px] lowercase tracking-wider gap-1 cursor-pointer font-normal hover:bg-slate-800/50 text-slate-300 disabled:opacity-30"
              >
                next ›
              </Button>
            </div>
          </div>
        </header>

        {/* Player area */}
        <div className="flex-1 bg-slate-950 flex flex-col justify-center items-center relative overflow-hidden group/screen">

          {isCourseFullyCompleted && showCompletionBanner ? (
            <div className="absolute inset-0 bg-slate-950 flex flex-col justify-center items-center p-8 text-center space-y-6 select-none overflow-y-auto">
              <div className="relative h-28 w-28 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                <Trophy className="h-14 w-14 text-emerald-500" strokeWidth={1.5} />
                <PartyPopper className="h-6 w-6 text-emerald-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div className="space-y-2 max-w-lg">
                <h2 className="text-3xl font-extrabold text-white font-display tracking-tight leading-tight">
                  Congratulations! 🎓
                </h2>
                <p className="text-slate-400 text-sm md:text-base font-light leading-relaxed">
                  You have successfully completed every lesson module inside **{state.course.title}**! Your commitment to learning is exemplary.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 max-w-sm w-full bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <div className="text-center">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Lessons</p>
                  <p className="text-lg font-bold text-white mt-1">{flatLessons.length} / {flatLessons.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Completed</p>
                  <p className="text-lg font-bold text-emerald-500 mt-1">100%</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    if (state?.enrollment?.id) {
                      window.open(`/api/certificates/${state.enrollment.id}`, "_blank")
                    } else {
                      toast.error("Enrollment not found")
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  <Download className="h-5 w-5" />
                  Download Certificate
                </button>
                <button
                  type="button"
                  onClick={() => setShowCompletionBanner(false)}
                  className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  <PlayCircle className="h-5 w-5" />
                  Continue Watching
                </button>
                <Link href="/dashboard/student" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">
                  Back to Dashboard
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* YouTube player — always in DOM to prevent iframe teardown on lesson type switches */}
              <div
                className={cn(
                  "w-full h-full relative",
                  activeLesson.type === "video" ? "flex items-center justify-center" : "hidden"
                )}
              >
                {activeLesson.type === "video" && !activeYoutubeVideoId && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-8 bg-slate-950">
                    <PlayCircle className="h-16 w-16 text-slate-600 mb-4" strokeWidth={1} />
                    <h3 className="text-lg font-bold text-white font-display">No Video Linked</h3>
                    <p className="text-sm text-slate-400 mt-2 max-w-md font-light">
                      This video lesson doesn&apos;t have a YouTube URL configured yet.
                    </p>
                  </div>
                )}

                {/* Persistent, visible error card instead of a toast that vanishes */}
                {videoError && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-8 bg-slate-950">
                    <Lock className="h-14 w-14 text-amber-500 mb-4" strokeWidth={1} />
                    <h3 className="text-lg font-bold text-white font-display">Video unavailable</h3>
                    <p className="text-sm text-slate-400 mt-2 max-w-md font-light">{videoError}</p>
                    <button
                      type="button"
                      onClick={retryVideoLoad}
                      className="mt-5 inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold py-2.5 px-5 rounded-xl transition-colors cursor-pointer"
                    >
                      Try again
                    </button>
                  </div>
                )}

                {/* FIX: also require type==="video" so switching to a quiz/text
                    lesson unmounts (and thus silences) the raw fallback iframe —
                    it has no JS API to pause via postMessage without
                    enablejsapi, so unmounting is the reliable fix here. */}
                {iframeFallback && activeLesson.type === "video" && activeYoutubeVideoId && !videoError && (
                  <iframe
                    key={activeLesson.id}
                    className="absolute inset-0 w-full h-full z-0"
                    src={`https://www.youtube-nocookie.com/embed/${activeYoutubeVideoId}?rel=0&modestbranding=1&playsinline=1`}
                    title={activeLesson.title}
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    frameBorder="0"
                  />
                )}

                {!iframeFallback && (
                  <div id="youtube-player-container" className="absolute inset-0 z-0">
                    <div id="youtube-player" className="w-full h-full" />
                  </div>
                )}

                {/* Visible play button — click is what actually starts playback
                    when the video was only cued (page-load / resume case) */}
                {!iframeFallback && activeLesson.type === "video" && activeYoutubeVideoId && !videoError && (
                  <div
                    onClick={togglePlay}
                    className="absolute inset-0 z-10 cursor-pointer flex items-center justify-center"
                  >
                    {!isPlaying && !videoEnded && (
                      <div className="h-20 w-20 rounded-full bg-black/60 border border-white/20 flex items-center justify-center backdrop-blur-sm transition-transform hover:scale-105">
                        <Play className="h-9 w-9 text-white ml-1" fill="currentColor" />
                      </div>
                    )}
                  </div>
                )}

                {/* Custom end screen — covers the video so YouTube's own
                    suggested-videos grid never becomes visible */}
                {!iframeFallback && videoEnded && !videoError && (
                  <div className="absolute inset-0 z-20 bg-slate-950/95 flex flex-col items-center justify-center text-center p-8 space-y-5">
                    <CheckCircle2 className="h-12 w-12 text-emerald-500" strokeWidth={1.5} />
                    <div className="space-y-1.5">
                      <h3 className="text-lg font-bold text-white font-display">Lesson finished</h3>
                      <p className="text-sm text-slate-400 font-light max-w-xs">{activeLesson.title}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setVideoEnded(false)
                          loadedVideoIdRef.current = null
                          autoplayIntentRef.current = true
                          setRetryKey((k) => k + 1)
                        }}
                        className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold py-2.5 px-5 rounded-xl transition-colors cursor-pointer"
                      >
                        Watch again
                      </button>
                      {hasNext && (
                        <button
                          type="button"
                          onClick={handleNextLesson}
                          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold py-2.5 px-5 rounded-xl transition-colors cursor-pointer"
                        >
                          Next lesson <ChevronRight className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {activeLesson.type === "quiz" && (
                <QuizPlayer
                  key={activeLesson.id}
                  lesson={activeLesson}
                  isCompleted={activeLesson.isCompleted}
                  completing={completing}
                  onComplete={triggerCompletion}
                />
              )}

              {activeLesson.type === "text" && (
                <TextLessonViewer
                  key={activeLesson.id}
                  lesson={activeLesson}
                  isCompleted={activeLesson.isCompleted}
                  completing={completing}
                  onComplete={triggerCompletion}
                />
              )}
            </>
          )}
        </div>

        {/* Bottom controls */}
        {activeLesson.type === "video" ? (
          iframeFallback ? (
            // Fallback mode has no JS control over the player, so give it its
            // own minimal footer instead of leaving dead play/scrubber/volume
            // buttons that silently do nothing.
            <footer className="h-14 bg-slate-900 border-t border-slate-800/80 flex items-center justify-between px-6 shrink-0 relative z-20 select-none">
              <div className="flex items-center gap-3">
                <PlayCircle className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-medium text-slate-300">Playing with YouTube&apos;s built-in controls</span>
              </div>
              <button
                type="button"
                onClick={triggerCompletion}
                disabled={activeLesson.isCompleted || completing}
                className={cn(
                  "inline-flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-xs transition-all",
                  activeLesson.isCompleted
                    ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 cursor-default"
                    : completing
                      ? "bg-slate-800 text-slate-400 cursor-wait"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                )}
              >
                {completing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : activeLesson.isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                {activeLesson.isCompleted ? "Completed" : completing ? "Marking..." : "Mark as complete"}
              </button>
            </footer>
          ) : (
            <footer className="h-16 bg-black flex items-center px-6 shrink-0 relative z-20 select-none border-t border-slate-900">
              <div className="flex items-center gap-4 w-full">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="h-8 w-8 text-indigo-400 hover:text-indigo-300 transition-colors flex items-center justify-center cursor-pointer shrink-0"
                >
                  {isPlaying ? <span className="text-xl">⏸</span> : <span className="text-xl">▶</span>}
                </button>

                <div className="flex-1 relative flex items-center h-full">
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    step={1}
                    value={currentTime || 0}
                    onChange={handleScrubberChange}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none transition-all hover:h-1.5"
                  />
                </div>

                <div className="flex items-center gap-5 shrink-0 pl-4">
                  <span className="font-mono text-[10px] text-slate-300 select-none font-semibold">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setSettingsOpen((prev) => !prev)}
                      className={cn(
                        "flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer",
                        settingsOpen && "text-white"
                      )}
                    >
                      <Settings className="h-4.5 w-4.5" />
                    </button>

                    {settingsOpen && (
                      <PlayerSettingsMenu
                        playbackSpeed={playbackSpeed}
                        availableQualities={availableQualities}
                        activeQuality={activeQuality}
                        ccActive={ccActive}
                        onSpeedSelect={handleSpeedSelect}
                        onQualitySelect={handleQualitySelect}
                        onToggleCc={toggleCc}
                        onClose={() => setSettingsOpen(false)}
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-2 group/volume relative hidden sm:flex">
                    <button type="button" onClick={toggleMute} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                      {isMuted || volume === 0 ? <VolumeX className="h-4.5 w-4.5" /> : <Volume2 className="h-4.5 w-4.5" />}
                    </button>
                    <input
                      type="range" min={0} max={100}
                      value={isMuted ? 0 : (volume || 0)}
                      onChange={handleVolumeChange}
                      className="w-0 overflow-hidden group-hover/volume:w-16 h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-indigo-500 transition-all duration-300"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={toggleTheatre}
                    className={cn(
                      "flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer hidden md:block",
                      theatreMode && "text-white"
                    )}
                  >
                    <Tv className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {isFullscreen ? <Minimize2 className="h-4.5 w-4.5" /> : <Maximize2 className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>
            </footer>
          )
        ) : (
          <footer className="h-14 bg-slate-900 border-t border-slate-800/80 flex items-center justify-between px-6 shrink-0 relative z-20 select-none">
            <div className="flex items-center gap-3">
              {activeLesson.type === "quiz" ? (
                <HelpCircle className="h-4 w-4 text-amber-400" />
              ) : (
                <FileText className="h-4 w-4 text-sky-400" />
              )}
              <span className="text-xs font-medium text-slate-300">
                {activeLesson.type === "quiz" ? "Interactive Quiz" : "Reading Material"}
              </span>
            </div>
          </footer>
        )}
      </main>
    </div>
  )
}

// ─── Quiz Player ──────────────────────────────────────────────────────────────
interface QuizPlayerProps {
  lesson: Lesson
  isCompleted: boolean
  completing: boolean
  onComplete: () => void
}

function QuizPlayer({ lesson, isCompleted, completing, onComplete }: QuizPlayerProps) {
  const questions: QuizQuestion[] = (lesson.content as LessonContent)?.questions || []
  const [selectedAnswers, setSelectedAnswers] = React.useState<Record<number, number>>({})
  const [submitted, setSubmitted] = React.useState(false)
  const [score, setScore] = React.useState(0)

  React.useEffect(() => {
    setSelectedAnswers({})
    setSubmitted(false)
    setScore(0)
  }, [lesson.id])

  const handleSelect = (questionIndex: number, optionIndex: number) => {
    if (submitted) return
    setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }))
  }

  const handleSubmit = () => {
    if (submitted) return
    const correct = questions.reduce(
      (acc, q, i) => acc + (selectedAnswers[i] === q.correctOptionIndex ? 1 : 0),
      0
    )
    setScore(correct)
    setSubmitted(true)
    if (!isCompleted) onComplete()
  }

  const allAnswered = questions.length > 0 && Object.keys(selectedAnswers).length === questions.length
  const scorePercentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0

  if (questions.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center p-8">
        <HelpCircle className="h-16 w-16 text-slate-600 mb-4" strokeWidth={1} />
        <h3 className="text-lg font-bold text-white font-display">Quiz Not Configured</h3>
        <p className="text-sm text-slate-400 mt-2 max-w-md font-light">
          This quiz doesn&apos;t have any questions yet.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar">
      <div className="max-w-2xl mx-auto py-10 px-6 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="h-3.5 w-3.5" />
            Quiz · {questions.length} Question{questions.length !== 1 ? "s" : ""}
          </div>
          <h2 className="text-xl font-bold text-white font-display">{lesson.title}</h2>
        </div>

        {submitted && (
          <div className={cn(
            "rounded-2xl border p-6 text-center space-y-2",
            scorePercentage >= 70 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"
          )}>
            {scorePercentage >= 70 ? (
              <Trophy className="h-8 w-8 text-emerald-400 mx-auto" />
            ) : (
              <BookOpen className="h-8 w-8 text-rose-400 mx-auto" />
            )}
            <p className={cn("text-2xl font-extrabold font-display", scorePercentage >= 70 ? "text-emerald-400" : "text-rose-400")}>
              {score} / {questions.length}
            </p>
            <p className="text-sm text-slate-400 font-light">
              {scorePercentage >= 70 ? "Great job! You passed the quiz! 🎉" : "Review the material and try again next time."}
            </p>
          </div>
        )}

        <div className="space-y-6">
          {questions.map((q, qIndex) => {
            const selectedOption = selectedAnswers[qIndex]
            const isCorrectAnswer = submitted && selectedOption === q.correctOptionIndex
            const isAnswered = selectedOption !== undefined

            return (
              <div
                key={q.id || qIndex}
                className={cn(
                  "rounded-2xl border p-5 space-y-4 transition-all",
                  submitted && isCorrectAnswer
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : submitted && isAnswered && !isCorrectAnswer
                      ? "border-rose-500/30 bg-rose-500/5"
                      : "border-slate-800 bg-slate-900/50"
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center h-7 w-7 rounded-lg bg-slate-800 text-xs font-bold text-slate-300 shrink-0 mt-0.5">
                    {qIndex + 1}
                  </span>
                  <p className="text-sm font-semibold text-white leading-relaxed pt-1">{q.text}</p>
                </div>
                <div className="space-y-2 pl-10">
                  {q.options.map((option, oIndex) => {
                    const isSelected = selectedOption === oIndex
                    const isCorrect = q.correctOptionIndex === oIndex

                    let optionStyle = "border-slate-700/50 bg-slate-800/30 text-slate-300 hover:border-primary/40 hover:bg-slate-800/60 cursor-pointer"
                    if (isSelected && !submitted) optionStyle = "border-primary bg-primary/10 text-white ring-1 ring-primary/30 cursor-pointer"
                    if (submitted) {
                      if (isCorrect) optionStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                      else if (isSelected) optionStyle = "border-rose-500 bg-rose-500/10 text-rose-300"
                      else optionStyle = "border-slate-800 bg-slate-900/30 text-slate-500"
                    }

                    return (
                      <button
                        key={oIndex}
                        type="button"
                        onClick={() => handleSelect(qIndex, oIndex)}
                        disabled={submitted}
                        className={cn(
                          "w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all flex items-center gap-3",
                          optionStyle,
                          submitted && "cursor-default"
                        )}
                      >
                        <span className="flex items-center justify-center h-5 w-5 rounded-md border text-[10px] font-bold shrink-0 bg-slate-900/50 border-slate-700 text-slate-400">
                          {String.fromCharCode(65 + oIndex)}
                        </span>
                        <span className="flex-1">{option}</span>
                        {submitted && isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex justify-center pt-4 pb-6">
          {!submitted ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!allAnswered}
              className={cn(
                "inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-lg",
                allAnswered ? "bg-primary hover:bg-primary/90 text-white cursor-pointer" : "bg-slate-800 text-slate-500 cursor-not-allowed"
              )}
            >
              <CheckCircle2 className="h-4 w-4" />
              Submit Quiz ({Object.keys(selectedAnswers).length}/{questions.length} answered)
            </button>
          ) : (
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
              <CheckCircle2 className="h-4.5 w-4.5" />
              Quiz submitted & lesson marked complete
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Text Lesson Viewer ───────────────────────────────────────────────────────
interface TextLessonViewerProps {
  lesson: Lesson
  isCompleted: boolean
  completing: boolean
  onComplete: () => void
}

function TextLessonViewer({ lesson, isCompleted, completing, onComplete }: TextLessonViewerProps) {
  const textContent = (lesson.content as LessonContent)?.text || ""

  if (!textContent.trim()) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center p-8">
        <FileText className="h-16 w-16 text-slate-600 mb-4" strokeWidth={1} />
        <h3 className="text-lg font-bold text-white font-display">No Content Yet</h3>
        <p className="text-sm text-slate-400 mt-2 max-w-md font-light">
          This text lesson doesn&apos;t have any content yet.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar">
      <div className="max-w-2xl mx-auto py-10 px-6 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 text-sky-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <FileText className="h-3.5 w-3.5" />
            Reading Material
          </div>
          <h2 className="text-xl font-bold text-white font-display">{lesson.title}</h2>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8">
          <div className="prose prose-invert prose-sm max-w-none">
            {textContent.split("\n").map((paragraph, i) => (
              <p key={i} className="text-sm text-slate-300 leading-relaxed mb-4 last:mb-0 whitespace-pre-wrap">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <div className="flex justify-center pt-4 pb-6">
          <button
            type="button"
            onClick={onComplete}
            disabled={isCompleted || completing}
            className={cn(
              "inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-lg",
              isCompleted
                ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 cursor-default"
                : completing
                  ? "bg-slate-800 text-slate-400 cursor-wait"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
            )}
          >
            {completing ? <Loader2 className="h-4 w-4 animate-spin" /> : isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Check className="h-4 w-4" />}
            {isCompleted ? "Lesson Completed ✓" : completing ? "Marking..." : "Mark as Complete"}
          </button>
        </div>
      </div>
    </div>
  )
}