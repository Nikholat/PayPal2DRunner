import { _decorator, Component, AudioSource, AudioClip } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AudioManager')
export class AudioManager extends Component {
    @property(AudioSource)
    sfxSource: AudioSource = null!;

    @property(AudioSource)
    musicSource: AudioSource = null!;

    @property(AudioClip)
    jumpClip: AudioClip = null!;

    @property(AudioClip)
    collectClip: AudioClip = null!;

    @property(AudioClip)
    hitClip: AudioClip = null!;

    @property(AudioClip)
    failClip: AudioClip = null!;

    @property(AudioClip)
    winClip: AudioClip = null!;

    @property(AudioClip)
    buttonClip: AudioClip = null!;

    @property
    sfxVolume: number = 1.0;

    @property
    musicVolume: number = 1.0;

    @property
    muted: boolean = false;

    start() {
        this.applyVolumes();
    }

    public setMuted(value: boolean) {
        this.muted = value;
        this.applyVolumes();
    }

    public setSfxVolume(value: number) {
        this.sfxVolume = value;
        this.applyVolumes();
    }

    public setMusicVolume(value: number) {
        this.musicVolume = value;
        this.applyVolumes();
    }

    public playJump() {
        this.playSfx(this.jumpClip);
    }

    public playCollect() {
        this.playSfx(this.collectClip);
    }

    public playHit() {
        this.playSfx(this.hitClip);
    }

    public playFail() {
        this.playSfx(this.failClip);
    }

    public playWin() {
        this.playSfx(this.winClip);
    }

    public playButton() {
        this.playSfx(this.buttonClip);
    }

    public playMusic(loop: boolean = true) {
        if (!this.musicSource || !this.musicSource.clip || this.muted) return;

        this.musicSource.loop = loop;
        if (!this.musicSource.playing) {
            this.musicSource.play();
        }
    }

    public stopMusic() {
        if (!this.musicSource) return;
        this.musicSource.stop();
    }

    private playSfx(clip: AudioClip | null) {
        if (this.muted) return;
        if (!clip || !this.sfxSource) return;

        this.sfxSource.playOneShot(clip, this.sfxVolume);
    }

    private applyVolumes() {
        if (this.sfxSource) {
            this.sfxSource.volume = this.muted ? 0 : this.sfxVolume;
        }

        if (this.musicSource) {
            this.musicSource.volume = this.muted ? 0 : this.musicVolume;
        }
    }
}