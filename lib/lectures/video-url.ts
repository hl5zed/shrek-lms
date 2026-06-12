// 강의 영상 URL 관련 공통 유틸:
// - getEmbedUrl: YouTube/Vimeo URL을 안전한 임베드 URL로 변환
// - isAllowedVideoUrl: 저장 가능한 영상 URL 도메인/스킴 검증

function isHttpUrl(url: URL) {
  return url.protocol === "http:" || url.protocol === "https:";
}

function isYouTubeHost(hostname: string) {
  return (
    hostname === "www.youtube.com" ||
    hostname === "youtube.com" ||
    hostname === "m.youtube.com" ||
    hostname === "youtu.be"
  );
}

function isVimeoHost(hostname: string) {
  return (
    hostname === "vimeo.com" ||
    hostname === "www.vimeo.com" ||
    hostname === "player.vimeo.com"
  );
}

function isBunnyStreamHost(hostname: string) {
  return (
    hostname === "iframe.mediadelivery.net" ||
    hostname.endsWith(".mediadelivery.net") ||
    hostname === "video.bunnycdn.com" ||
    hostname.endsWith(".bunnycdn.com")
  );
}

export function getEmbedUrl(videoUrl: string): string | null {
  try {
    const url = new URL(videoUrl);
    const hostname = url.hostname.toLowerCase();

    if (
      (hostname === "www.youtube.com" ||
        hostname === "youtube.com" ||
        hostname === "m.youtube.com") &&
      url.searchParams.get("v")
    ) {
      return `https://www.youtube.com/embed/${url.searchParams.get("v")}`;
    }
    if (hostname === "youtu.be") {
      return `https://www.youtube.com/embed${url.pathname}`;
    }
    if (
      hostname === "vimeo.com" ||
      hostname === "www.vimeo.com" ||
      hostname === "player.vimeo.com"
    ) {
      return `https://player.vimeo.com/video${url.pathname}`;
    }
    return null;
  } catch {
    return null;
  }
}

export function isAllowedVideoUrl(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl);
    const hostname = url.hostname.toLowerCase();
    if (!isHttpUrl(url)) return false;
    return (
      isYouTubeHost(hostname) ||
      isVimeoHost(hostname) ||
      isBunnyStreamHost(hostname)
    );
  } catch {
    return false;
  }
}
