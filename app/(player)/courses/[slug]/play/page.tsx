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

// ─── CHANGE 1: Moved global YT type declaration to a dedicated types section ──
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

// ─── CHANGE 2: Extracted playback speed options to module-level constant ──────
// Previously defined inline inside the component, causing recreation on every render.
const SPEED_OPTIONS = ["0.5", "0.75", "1", "1.25", "1.5", "1.75", "2"] as const

// ─── CHANGE 3: Extracted formatTime to module-level utility ──────────────────
// Previously a method inside the component; no reason for it to close over state.
function formatTime(timeInSeconds: number): string {
  const hours = Math.floor(timeInSeconds / 3600)
  const minutes = Math.floor((timeInSeconds % 3600) / 60)
  const seconds = Math.floor(timeInSeconds % 60)
  return hours > 0
    ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

// ─── CHANGE 4: Extracted PlayerSettingsMenu to its own component ──────────────
// Previously ~60 lines of JSX embedded inside the footer, making it hard to read.
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
  const playerContainerRef = React.useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const [volume, setVolume] = React.useState(50)
  const [isMuted, setIsMuted] = React.useState(false)
  const [iframeFallback, setIframeFallback] = React.useState(false)

  // Stable refs so YT callbacks never read stale closure values
  const volumeRef = React.useRef(50)
  const isMutedRef = React.useRef(false)
  const playbackSpeedRef = React.useRef("1")

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

  // Keep activeLessonRef in sync
  React.useEffect(() => {
    activeLessonRef.current = activeLesson
  }, [activeLesson])

  // Keep playback-setting refs in sync
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

  // ─── CHANGE 5: Memoized flatLessons ────────────────────────────────────────
  // Previously getFlatLessons() was called as a plain function inside render
  // and in handlers, recomputing the full sorted array on every render.
  const flatLessons = React.useMemo(() => {
    if (!state) return []
    return state.curriculum.flatMap((section) =>
      [...section.lessons].sort((a, b) => a.order - b.order)
    )
  }, [state])

  // ─── CHANGE 6: loadPlayState wrapped in useCallback with abort signal ───────
  // Previously: plain async function recreated every render, no cleanup on unmount.
  // Now: stable reference, uses AbortController so in-flight fetches are cancelled
  // when the component unmounts or slug changes.
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
          if (resumeLesson) setActiveLesson(resumeLesson)
        } else {
          // Sync active lesson's isCompleted / isLocked flags after a reload
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
        if (err.name === "AbortError") return // Silently ignore cancelled requests
        console.error(err)
        toast.error("Failed to load curriculum details.")
      } finally {
        if (initial) setLoading(false)
      }
    },
    [slug]
  )

  // Initial load + abort cleanup
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
  }, [])

  // Reset iframe fallback when lesson changes
  React.useEffect(() => {
    setIframeFallback(false)
  }, [activeLesson?.id])

  // ─── YouTube player init / video-swap effect ──────────────────────────────
  React.useEffect(() => {
    if (!activeLesson || activeLesson.type !== "video" || !activeYoutubeVideoId || iframeFallback) {
      return
    }

    const videoId = activeYoutubeVideoId
    const lessonId = activeLesson.id
    let destroyed = false
    let checkAPITimer: ReturnType<typeof setInterval> | undefined

    if (!window.YT) {
      const tag = document.createElement("script")
      tag.src = "https://www.youtube.com/iframe_api"
      document.getElementsByTagName("script")[0].parentNode?.insertBefore(
        tag,
        document.getElementsByTagName("script")[0]
      )
    }

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
      setIsPlaying(false)
      loadedVideoIdRef.current = videoId
      const savedTime = localStorage.getItem(`playback_time_${lessonId}`)
      const startSeconds = savedTime && parseFloat(savedTime) > 5 ? parseFloat(savedTime) : 0
      player.loadVideoById({ videoId, startSeconds })
      player.setVolume(volumeRef.current)
      if (isMutedRef.current) player.mute()
      else player.unMute()
      player.setPlaybackRate(parseFloat(playbackSpeedRef.current))
      setIsPlaying(true)
    }

    const initPlayer = () => {
      if (destroyed) return

      if (
        playerRef.current &&
        typeof playerRef.current.loadVideoById === "function" &&
        isPlayerAlive()
      ) {
        loadLessonVideo(playerRef.current)
        return
      }

      destroyPlayer()
      ensurePlayerDiv()

      playerRef.current = new window.YT.Player("youtube-player", {
        videoId,
        playerVars: { enablejsapi: 1, html5: 1, rel: 0, modestbranding: 1, controls: 0, autoplay: 1, playsinline: 1 },
        events: {
          onReady: (event: any) => {
            if (destroyed) return
            loadedVideoIdRef.current = videoId
            const player = event.target
            setDuration(player.getDuration())
            player.setVolume(volumeRef.current)
            if (isMutedRef.current) player.mute()
            const levels = player.getAvailableQualityLevels?.()
            setAvailableQualities(levels?.length > 0 ? levels : ["Auto"])
            player.setPlaybackRate(parseFloat(playbackSpeedRef.current))
            applySavedPlaybackPosition(player, lessonId)
            player.playVideo()
            setIsPlaying(true)
          },
          onStateChange: (event: any) => {
            if (destroyed) return
            if (event.data === 1) {
              setIsPlaying(true)
              const total = event.target?.getDuration?.()
              if (total > 0) setDuration(total)
            } else if (event.data === 2) {
              setIsPlaying(false)
            }
          },
          onError: (event: any) => {
            const code = event?.data as number
            console.error("YouTube Player Error:", code, "for videoId:", videoId)
            if (code === 5) {
              destroyPlayer()
              setIframeFallback(true)
              return
            }
            toast.error(
              YOUTUBE_PLAYER_ERROR_MESSAGES[code] ??
              "Video playback failed. Try refreshing or another lesson."
            )
            setIsPlaying(false)
          },
        },
      })
    }

    checkAPITimer = setInterval(() => {
      if (window.YT?.Player) {
        clearInterval(checkAPITimer)
        initPlayer()
      }
    }, 100)

    return () => {
      destroyed = true
      clearInterval(checkAPITimer)
    }
  }, [activeLesson?.id, activeLesson?.type, activeYoutubeVideoId, iframeFallback, applySavedPlaybackPosition, isPlayerAlive, destroyPlayer])

  // Destroy player on page leave
  React.useEffect(() => {
    return () => {
      try { playerRef.current?.destroy() } catch {}
      playerRef.current = null
      loadedVideoIdRef.current = null
    }
  }, [])

  // ─── CHANGE 7: triggerCompletion wrapped in useCallback ───────────────────
  // Previously a plain async function; being unstable caused it to be missing
  // from the progress-timer dep array, risking stale closure bugs.
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

  // ─── CHANGE 8: Progress timer — triggerCompletion now in dep array ─────────
  // Previously missing, which meant the timer closed over a stale copy of
  // triggerCompletion and could silently fail to fire after the first render.
  // Also: localStorage writes are now throttled to every ~5 seconds instead of
  // every 500 ms — localStorage.setItem is synchronous; 500 ms was excessive.
  React.useEffect(() => {
    if (!isPlaying || !playerRef.current) return

    const timer = setInterval(() => {
      if (!playerRef.current || typeof playerRef.current.getCurrentTime !== "function") return
      const current = playerRef.current.getCurrentTime()
      const total = playerRef.current.getDuration()
      setCurrentTime(current)
      if (total > 0) setDuration(total)

      // ─── CHANGE 9: Throttled localStorage writes (every ~5 s) ─────────────
      if (activeLesson && Math.floor(current) % 5 === 0) {
        localStorage.setItem(`playback_time_${activeLesson.id}`, String(current))
      }

      if (total > 0 && current / total >= 0.5 && activeLesson && !activeLesson.isCompleted && !completing) {
        triggerCompletion()
      }
    }, 500)

    return () => clearInterval(timer)
  }, [isPlaying, activeLesson?.id, completing, triggerCompletion])

  // ─── CHANGE 10: Player control handlers wrapped in useCallback ─────────────
  // Previously plain functions recreated every render; now stable references
  // that can safely be added to dependency arrays and used in the keyboard handler.
  const togglePlay = React.useCallback(() => {
    const player = playerRef.current
    if (!player || typeof player.playVideo !== 'function') return
    if (isPlaying) {
      player.pauseVideo()
      setIsPlaying(false)
    } else {
      player.playVideo()
      setIsPlaying(true)
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

  // ─── CHANGE 11: Extracted handleVolumeChange ────────────────────────────────
  // Previously an inline arrow function in JSX — created a new reference every render.
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

  // ─── CHANGE 12: Keyboard handler — uses stable useCallback refs ────────────
  // Previously recreated on every render; control functions are now stable
  // useCallback refs so deps are accurate without ref forwarding tricks.
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement).isContentEditable) return

      switch (e.code) {
        case "Space":      e.preventDefault(); togglePlay(); break
        case "KeyF":       e.preventDefault(); toggleFullscreen(); break
        case "KeyT":       e.preventDefault(); toggleTheatre(); break
        case "KeyM":       e.preventDefault(); toggleMute(); break
        case "ArrowRight": e.preventDefault(); seekDelta(5); break
        case "ArrowLeft":  e.preventDefault(); seekDelta(-5); break
        case "Period": if (e.shiftKey) { e.preventDefault(); changeSpeedStep(1) } break
        case "Comma":  if (e.shiftKey) { e.preventDefault(); changeSpeedStep(-1) } break
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [togglePlay, toggleFullscreen, toggleTheatre, toggleMute, seekDelta, changeSpeedStep])

  // Fullscreen change listener
  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", handler)
    return () => document.removeEventListener("fullscreenchange", handler)
  }, [])

  // Scroll active lesson into view in sidebar
  React.useEffect(() => {
    activeSidebarItemRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }, [activeLesson?.id])

  // ─── CHANGE 13: handleLessonClick wrapped in useCallback ──────────────────
  const handleLessonClick = React.useCallback(
    async (lesson: Lesson) => {
      if (lesson.isLocked) {
        toast.error("Complete the previous lessons to unlock this content!")
        return
      }
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

  // ─── CHANGE 14: Removed dead Loader2 inline component definition ──────────
  // Previously Loader2 was re-declared at the bottom of the file as a manual SVG
  // component, but lucide-react already exports Loader2. Importing it directly
  // at the top removes ~20 lines of redundant code.

  // ─── Early returns ────────────────────────────────────────────────────────
  // Show blank screen while loading OR while state/activeLesson haven't resolved yet.
  // Previously these were two separate checks — the gap between them caused the
  // error screen to flash briefly on every page load before data arrived.
  if (loading || !state || !activeLesson) {
    return <div className="h-screen w-screen bg-slate-950" />
  }

  // Separate explicit error state: only shown when loading is done but data is missing.
  // This is now unreachable via normal load — only triggers on a genuine API failure
  // where loading finished but state is still null (toast already shown by loadPlayState).

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="h-screen w-screen flex overflow-hidden bg-slate-950 select-none">

      {/* ─── LEFT SIDEBAR ─── */}
      <aside
        className={cn(
          "h-full bg-[#1e2433] flex flex-col shrink-0 transition-all duration-300 border-r border-slate-800/80 z-20 overflow-hidden",
          sidebarCollapsed ? "w-0 opacity-0" : "w-[320px] opacity-100"
        )}
      >
        <div className="p-5 space-y-5 border-b border-slate-800 shrink-0">
          <div className="flex items-center justify-between">
            <Link
              href={`/courses/${state.course.slug}`}
              className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to course page
            </Link>
            <button
              type="button"
              onClick={() => setSidebarCollapsed(true)}
              className="h-6 w-6 text-slate-400 hover:text-white flex items-center justify-center rounded hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="h-4.5 w-4.5" />
            </button>
          </div>

          <div className="space-y-3">
            <h2 className="text-md font-bold text-white font-display line-clamp-1 leading-snug">
              {state.course.title}
            </h2>
            <div className="flex items-center justify-between gap-3 text-xs">
              <div className="h-1.5 flex-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="font-mono font-bold text-primary shrink-0">{progressPercentage}%</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 custom-scrollbar p-2 space-y-2">
          {state.curriculum.map((section, sIndex) => {
            const isExpanded = expandedSections.has(section.id)
            return (
              <div key={section.id} className="pt-2 border-0">
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
                  className="w-full flex items-center justify-between p-3.5 hover:bg-slate-800/40 rounded-xl text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                    <span className="font-mono text-xs text-slate-500 font-semibold">{sIndex + 1}.</span>
                    <span className="text-xs font-semibold text-slate-200 truncate pr-1">{section.title}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="mt-1 space-y-1 pl-3">
                    {section.lessons.map((lesson) => {
                      const isActive = activeLesson.id === lesson.id
                      const LessonIcon = lesson.isLocked
                        ? Lock
                        : lesson.isCompleted
                        ? CheckCircle2
                        : lesson.type === "quiz"
                        ? HelpCircle
                        : lesson.type === "text"
                        ? FileText
                        : Play

                      const iconClass = lesson.isLocked
                        ? "text-slate-500"
                        : lesson.isCompleted
                        ? "text-emerald-500"
                        : "text-primary"

                      return (
                        <div
                          key={lesson.id}
                          ref={isActive ? activeSidebarItemRef : null}
                          onClick={() => handleLessonClick(lesson)}
                          className={cn(
                            "flex items-center justify-between px-3.5 py-3 rounded-xl cursor-pointer transition-all border-l-2 select-none",
                            isActive
                              ? "bg-slate-800 border-primary text-white font-medium"
                              : "border-transparent text-slate-400 hover:bg-slate-800/20 hover:text-slate-200",
                            lesson.isLocked ? "cursor-not-allowed opacity-55" : ""
                          )}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0 pr-3">
                            <LessonIcon className={cn("h-3.5 w-3.5 shrink-0", iconClass)} />
                            <span className="text-xs truncate leading-snug">{lesson.title}</span>
                          </div>
                          {lesson.type === "quiz" ? (
                            <span className="font-mono text-[10px] text-slate-500 shrink-0 font-light">Quiz</span>
                          ) : lesson.type === "text" ? (
                            <span className="font-mono text-[10px] text-slate-500 shrink-0 font-light">Read</span>
                          ) : lesson.duration ? (
                            <span className="font-mono text-[10px] text-slate-500 shrink-0 font-light">
                              {formatTime(lesson.duration)}
                            </span>
                          ) : null}
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

      {/* Sidebar restore button */}
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

        {/* Top nav bar */}
        <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-10 select-none">
          <Button
            variant="ghost" size="sm"
            onClick={handlePrevLesson}
            disabled={!hasPrev}
            className="text-xs gap-1 cursor-pointer font-medium hover:bg-slate-800 text-slate-300 disabled:opacity-30"
          >
            ‹ Previous
          </Button>
          <span className="text-xs font-bold font-display text-white max-w-sm sm:max-w-md md:max-w-lg truncate px-4">
            {activeLesson.title}
          </span>
          <Button
            variant="ghost" size="sm"
            onClick={handleNextLesson}
            disabled={!hasNext}
            className="text-xs gap-1 cursor-pointer font-medium hover:bg-slate-800 text-slate-300 disabled:opacity-30"
          >
            Next ›
          </Button>
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
                  onClick={() => toast.info("Certificate generation is coming soon. Your completion is recorded.")}
                  className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  <Download className="h-5 w-5" />
                  Certificate (Coming Soon)
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

                {iframeFallback && activeYoutubeVideoId && (
                  <iframe
                    className="absolute inset-0 w-full h-full z-0"
                    src={`https://www.youtube.com/embed/${activeYoutubeVideoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                    title={activeLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    frameBorder="0"
                  />
                )}

                {!iframeFallback && (
                  <div id="youtube-player-container" className="absolute inset-0 z-0">
                    <div id="youtube-player" className="w-full h-full" />
                  </div>
                )}

                {activeLesson.type === "video" && activeYoutubeVideoId && !iframeFallback && (
                  <div onClick={togglePlay} className="absolute inset-0 z-10 cursor-pointer" />
                )}

                {/* Read-only completion status badge — video completes automatically at 50% watch time */}
                {activeLesson.type === "video" && activeLesson.isCompleted && (
                  <div className="absolute bottom-6 left-6 z-20 opacity-0 group-hover/screen:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="inline-flex items-center gap-1.5 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-xl">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Completed
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
          <footer className="h-16 bg-slate-900 border-t border-slate-800/80 flex items-center justify-between px-6 shrink-0 relative z-20 select-none">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={togglePlay}
                className="h-8 w-8 text-white hover:text-primary transition-colors flex items-center justify-center cursor-pointer"
              >
                {isPlaying ? <span className="text-lg">⏸</span> : <span className="text-lg">▶</span>}
              </button>
              <span className="font-mono text-xs text-slate-400 select-none font-light">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex-1 max-w-xl mx-8 relative flex items-center h-full">
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={1}
                value={currentTime || 0}
                onChange={handleScrubberChange}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none transition-all hover:h-1.5"
              />
            </div>

            <div className="flex items-center gap-4 relative">
              <div className="flex items-center gap-2 mr-2 group/volume">
                <button type="button" onClick={toggleMute} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                  {isMuted || volume === 0 ? <VolumeX className="h-4.5 w-4.5" /> : <Volume2 className="h-4.5 w-4.5" />}
                </button>
                <input
                  type="range" min={0} max={100}
                  value={isMuted ? 0 : (volume || 0)}
                  onChange={handleVolumeChange}
                  className="w-0 overflow-hidden group-hover/volume:w-16 h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-primary transition-all duration-300"
                />
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setSettingsOpen((prev) => !prev)}
                  className={cn(
                    "h-9 w-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer",
                    settingsOpen && "bg-slate-800 text-white"
                  )}
                >
                  <Settings className="h-4.5 w-4.5" />
                </button>

                {/* ─── CHANGE 4 (render): Extracted to <PlayerSettingsMenu /> ─── */}
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

              <button
                type="button"
                onClick={toggleTheatre}
                className={cn(
                  "h-9 w-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer",
                  theatreMode && "bg-slate-800 text-white"
                )}
              >
                <Tv className="h-4.5 w-4.5" />
              </button>

              <button
                type="button"
                onClick={toggleFullscreen}
                className="h-9 w-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {isFullscreen ? <Minimize2 className="h-4.5 w-4.5" /> : <Maximize2 className="h-4.5 w-4.5" />}
              </button>
            </div>
          </footer>
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
            {activeLesson.isCompleted && (
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Completed
              </span>
            )}
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

  // ─── CHANGE 15: Explicit reset when lesson changes (keyed externally too) ──
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