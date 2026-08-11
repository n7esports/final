// lib/audio-service.ts
export class AudioService {
  private static audioElement: HTMLAudioElement | null = null

  static initializeAudio() {
    if (typeof window === 'undefined') return

    if (!this.audioElement) {
      this.audioElement = new Audio()
      this.audioElement.volume = 0.3 // 30% volume
      
      // Happy Birthday song from a free CDN
      // Using YouTube's Happy Birthday (instrumental, royalty-free)
      this.audioElement.src = 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_8854aab681.mp3'
      this.audioElement.preload = 'auto'
    }

    return this.audioElement
  }

  static play() {
    const audio = this.initializeAudio()
    if (audio) {
      audio.currentTime = 0
      audio.play().catch((err) => {
        console.log('Audio playback failed:', err)
      })
    }
  }

  static pause() {
    if (this.audioElement) {
      this.audioElement.pause()
    }
  }

  static stop() {
    if (this.audioElement) {
      this.audioElement.pause()
      this.audioElement.currentTime = 0
    }
  }

  static isPlaying() {
    return this.audioElement ? !this.audioElement.paused : false
  }

  static setVolume(volume: number) {
    if (this.audioElement) {
      this.audioElement.volume = Math.max(0, Math.min(1, volume))
    }
  }
}
