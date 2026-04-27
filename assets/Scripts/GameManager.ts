import {
    _decorator,
    Component,
    Node,
    Vec3,
    tween,
    Label,
    UIOpacity,
    input,
    Input,
    EventTouch,
    Tween
} from 'cc';
import { MoneyManager } from './MoneyManager';
import { ConfettiController } from './ConfettiController';
import { PlayerController } from './PlayerController';
import { AudioManager } from './AudioManager';
import { FinishRopeBreak } from './FinishRopeBreak';

const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    @property(Node) levelContent: Node = null!;
    @property(AudioManager) audioManager: AudioManager = null!;
    @property(Node) player: Node = null!;
    @property(Node) finishNode: Node = null!;
    @property(FinishRopeBreak) finishRopeBreak: FinishRopeBreak = null!;
    @property(Node) jumpTutorialPoint: Node = null!;
    @property(MoneyManager) moneyManager: MoneyManager = null!;
    @property(ConfettiController) confettiController: ConfettiController = null!;

    @property(Node) startUI: Node = null!;
    @property(Node) startTextUI: Node = null!;
    @property(Node) jumpTutorialUI: Node = null!;
    @property(Node) failUI: Node = null!;
    @property(Node) loseResultsUI: Node = null!;
    @property(Node) winResultsUI: Node = null!;
    @property(Node) darkOverlay: Node = null!;

    @property(Label) loseMoneyLabel: Label = null!;
    @property(Label) winMoneyLabel: Label = null!;

    @property
    moneyCountDuration: number = 1.0;

    private isStarted = false;
    private isGameOver = false;
    private jumpTutorialShown = false;
    private waitingForJumpTutorialTap = false;

    private readonly finishTriggerDistance = 80;
    private readonly tutorialTriggerDistance = 80;

    onLoad() {
        input.on(Input.EventType.TOUCH_START, this.onFirstTouch, this);
    }

    onDestroy() {
        input.off(Input.EventType.TOUCH_START, this.onFirstTouch, this);
    }

    start() {
        this.pauseAllGameplay();

        const playerComp = this.player?.getComponent(PlayerController);
        if (playerComp) playerComp.setJumpEnabled(false);

        if (this.startUI) this.startUI.active = true;
        if (this.startTextUI) this.startTextUI.active = true;
        if (this.jumpTutorialUI) this.jumpTutorialUI.active = false;

        this.resetEndUI();
    }

    update() {
        if (!this.isStarted || this.isGameOver) return;

        if (!this.jumpTutorialShown && this.player && this.jumpTutorialPoint) {
            const playerX = this.player.worldPosition.x;
            const tutorialX = this.jumpTutorialPoint.worldPosition.x;

            if (tutorialX <= playerX + this.tutorialTriggerDistance) {
                this.pauseForJumpTutorial();
                return;
            }
        }

        if (!this.player || !this.finishNode) return;

        const playerX = this.player.worldPosition.x;
        const finishX = this.finishNode.worldPosition.x;

        if (finishX <= playerX + this.finishTriggerDistance) {
            this.win();
        }
    }

    private onFirstTouch(event: EventTouch) {
        if (this.isGameOver) return;

        if (!this.isStarted) {
            this.isStarted = true;

            if (this.startUI) this.startUI.active = false;
            if (this.startTextUI) this.startTextUI.active = false;

            if (this.audioManager) this.audioManager.playMusic();

            this.resumeIntroRun();
            return;
        }

        if (this.waitingForJumpTutorialTap) {
            this.waitingForJumpTutorialTap = false;

            if (this.jumpTutorialUI) this.jumpTutorialUI.active = false;

            const playerComp = this.player?.getComponent(PlayerController);
            if (playerComp) playerComp.setJumpEnabled(true);

            this.resumeFullGameplay();
        }
    }

    private pauseForJumpTutorial() {
        if (this.jumpTutorialShown || this.waitingForJumpTutorialTap) return;

        this.jumpTutorialShown = true;
        this.waitingForJumpTutorialTap = true;

        this.pauseAllGameplay();

        if (this.jumpTutorialUI) this.jumpTutorialUI.active = true;
    }

    public gameOver() {
        if (this.isGameOver) return;
        this.isGameOver = true;

        this.pauseAllGameplay();
        this.showDarkOverlay();
        this.showGameOverSequence();

        if (this.audioManager) {
            this.audioManager.stopMusic();
            this.audioManager.playFail();
        }
    }

    public win() {
        if (this.isGameOver) return;
        this.isGameOver = true;

        this.pauseAllGameplay();
        this.showDarkOverlay();

        if (this.audioManager) {
            this.audioManager.stopMusic();
            this.audioManager.playWin();
        }

        if (this.finishRopeBreak) this.finishRopeBreak.breakRope();
        if (this.confettiController) this.confettiController.play();

        this.scheduleOnce(() => {
            this.showWinResults();
        }, 0.3);
    }

    private showGameOverSequence() {
        if (!this.failUI) {
            this.showLoseResults();
            return;
        }

        this.failUI.active = true;
        this.failUI.setScale(new Vec3(0, 0, 0));

        const failOpacity = this.failUI.getComponent(UIOpacity);
        if (failOpacity) failOpacity.opacity = 255;

        tween(this.failUI)
            .to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
            .call(() => this.startFailPulse())
            .delay(2.0)
            .call(() => this.hideFailAndShowLoseResults())
            .start();
    }

    private hideFailAndShowLoseResults() {
        if (!this.failUI) {
            this.showLoseResults();
            return;
        }

        Tween.stopAllByTarget(this.failUI);

        const failOpacity = this.failUI.getComponent(UIOpacity);

        if (!failOpacity) {
            this.failUI.active = false;
            this.showLoseResults();
            return;
        }

        tween(failOpacity).to(0.25, { opacity: 0 }).start();

        tween(this.failUI)
            .to(0.25, { scale: new Vec3(0.85, 0.85, 1) }, { easing: 'quadIn' })
            .call(() => {
                this.failUI.active = false;
                this.failUI.setScale(new Vec3(1, 1, 1));
                failOpacity.opacity = 255;
                this.showLoseResults();
            })
            .start();
    }

    private showLoseResults() {
        const amount = this.getFinalAmount();

        if (this.loseMoneyLabel) {
            this.loseMoneyLabel.string = '$0.00';
        }

        this.showPopup(this.loseResultsUI, () => {
            this.animateMoneyLabel(this.loseMoneyLabel, amount);
        });
    }

    private showWinResults() {
        const amount = this.getFinalAmount();

        if (this.winMoneyLabel) {
            this.winMoneyLabel.string = '$0.00';
        }

        this.showPopup(this.winResultsUI, () => {
            this.animateMoneyLabel(this.winMoneyLabel, amount);
        });
    }

    private showPopup(target: Node | null, onShown?: () => void) {
        if (!target) return;

        target.active = true;
        target.setScale(new Vec3(0, 0, 0));

        const uiOpacity = target.getComponent(UIOpacity);
        if (uiOpacity) uiOpacity.opacity = 0;

        tween(target)
            .to(0.4, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
            .call(() => {
                if (uiOpacity) {
                    tween(uiOpacity)
                        .to(0.3, { opacity: 255 })
                        .call(() => {
                            if (onShown) onShown();
                        })
                        .start();
                } else {
                    if (onShown) onShown();
                }
            })
            .start();
    }

    private animateMoneyLabel(label: Label | null, targetAmount: number) {
        if (!label) return;

        Tween.stopAllByTarget(label);

        const counter = { value: 0 };

        tween(counter)
            .to(this.moneyCountDuration, { value: targetAmount }, {
                easing: 'quadOut',
                onUpdate: () => {
                    const value = Math.floor(counter.value);
                    label.string = `$${value}.00`;
                }
            })
            .call(() => {
                label.string = `$${targetAmount}.00`;
            })
            .start();
    }

    private getFinalAmount(): number {
        if (!this.moneyManager) return 0;
        return this.moneyManager.getCurrentAmount();
    }

    private showDarkOverlay() {
        if (!this.darkOverlay) return;

        this.darkOverlay.active = true;

        const overlayOpacity = this.darkOverlay.getComponent(UIOpacity);
        if (!overlayOpacity) return;

        overlayOpacity.opacity = 0;
        tween(overlayOpacity).to(0.3, { opacity: 150 }).start();
    }

    private startFailPulse() {
        if (!this.failUI) return;

        tween(this.failUI)
            .repeatForever(
                tween()
                    .to(0.6, { scale: new Vec3(1.1, 1.1, 1) }, { easing: 'quadInOut' })
                    .to(0.6, { scale: new Vec3(1, 1, 1) }, { easing: 'quadInOut' })
            )
            .start();
    }

    private resetEndUI() {
        if (this.failUI) {
            this.failUI.active = false;
            this.failUI.setScale(new Vec3(1, 1, 1));
            const failOpacity = this.failUI.getComponent(UIOpacity);
            if (failOpacity) failOpacity.opacity = 255;
        }

        if (this.loseResultsUI) {
            this.loseResultsUI.active = false;
            this.loseResultsUI.setScale(new Vec3(1, 1, 1));
            const opacity = this.loseResultsUI.getComponent(UIOpacity);
            if (opacity) opacity.opacity = 255;
        }

        if (this.winResultsUI) {
            this.winResultsUI.active = false;
            this.winResultsUI.setScale(new Vec3(1, 1, 1));
            const opacity = this.winResultsUI.getComponent(UIOpacity);
            if (opacity) opacity.opacity = 255;
        }

        if (this.loseMoneyLabel) this.loseMoneyLabel.string = '$0.00';
        if (this.winMoneyLabel) this.winMoneyLabel.string = '$0.00';

        if (this.darkOverlay) {
            this.darkOverlay.active = true;
            const overlayOpacity = this.darkOverlay.getComponent(UIOpacity);
            if (overlayOpacity) overlayOpacity.opacity = 0;
        }
    }

    private pauseAllGameplay() {
        this.setRoadPaused(true);
        this.setPlayerPaused(true);
        this.setObstaclesPaused(true);
    }

    private resumeIntroRun() {
        this.setRoadPaused(false);
        this.setPlayerPaused(false);
        this.setObstaclesPaused(true);
    }

    private resumeFullGameplay() {
        this.setRoadPaused(false);
        this.setPlayerPaused(false);
        this.setObstaclesPaused(false);
    }

    private setRoadPaused(paused: boolean) {
        const road = this.levelContent.getComponent('RoadController') as any;
        if (road) road.enabled = !paused;
    }

    private setPlayerPaused(paused: boolean) {
        const playerComp = this.player.getComponent('PlayerController') as any;
        if (playerComp) playerComp.enabled = !paused;

        const playerAnim = this.player.getComponent('SimpleSpriteAnim') as any;
        if (playerAnim) playerAnim.enabled = !paused;
    }

    private setObstaclesPaused(paused: boolean) {
        const obstacles = this.levelContent.getComponentsInChildren('Obstacle');
        obstacles.forEach(obs => (obs as any).enabled = !paused);

        const coneObstacles = this.levelContent.getComponentsInChildren('ConeObstacle');
        coneObstacles.forEach(obs => (obs as any).enabled = !paused);
    }
}