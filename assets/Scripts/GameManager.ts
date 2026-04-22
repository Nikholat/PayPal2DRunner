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

const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    @property(Node)
    levelContent: Node = null!;

    @property(Node)
    player: Node = null!;

    @property(Node)
    finishNode: Node = null!;

    @property(MoneyManager)
    moneyManager: MoneyManager = null!;

    @property(ConfettiController)
    confettiController: ConfettiController = null!;

    @property(Node)
    startUI: Node = null!;

    @property(Node)
    failUI: Node = null!;

    @property(Node)
    resultsUI: Node = null!;

    @property(Node)
    darkOverlay: Node = null!;

    @property(Label)
    finalMoneyLabel: Label = null!;

    private isStarted: boolean = false;
    private isGameOver: boolean = false;

    private readonly finishTriggerDistance: number = 80;

    onLoad() {
        input.on(Input.EventType.TOUCH_START, this.onFirstTouch, this);
    }

    onDestroy() {
        input.off(Input.EventType.TOUCH_START, this.onFirstTouch, this);
    }

    start() {
        this.setEnginePaused(true);

        if (this.startUI) this.startUI.active = true;

        if (this.failUI) {
            this.failUI.active = false;
            this.failUI.setScale(new Vec3(1, 1, 1));

            const failOpacity = this.failUI.getComponent(UIOpacity);
            if (failOpacity) failOpacity.opacity = 255;
        }

        if (this.resultsUI) {
            this.resultsUI.active = false;
            this.resultsUI.setScale(new Vec3(1, 1, 1));

            const resultsOpacity = this.resultsUI.getComponent(UIOpacity);
            if (resultsOpacity) resultsOpacity.opacity = 255;
        }

        if (this.darkOverlay) {
            this.darkOverlay.active = true;
            const overlayOpacity = this.darkOverlay.getComponent(UIOpacity);
            if (overlayOpacity) overlayOpacity.opacity = 0;
        }
    }

    update() {
        if (!this.isStarted || this.isGameOver) return;
        if (!this.player || !this.finishNode) return;

        const playerX = this.player.worldPosition.x;
        const finishX = this.finishNode.worldPosition.x;

        if (finishX <= playerX + this.finishTriggerDistance) {
            this.win();
        }
    }

    private onFirstTouch(event: EventTouch) {
        if (this.isStarted || this.isGameOver) return;

        this.isStarted = true;

        if (this.startUI) {
            this.startUI.active = false;
        }

        this.setEnginePaused(false);

        input.off(Input.EventType.TOUCH_START, this.onFirstTouch, this);
    }

    public gameOver() {
        if (this.isGameOver) return;
        this.isGameOver = true;

        this.setEnginePaused(true);
        this.showDarkOverlay();
        this.showGameOverSequence();
    }

    private showGameOverSequence() {
        if (!this.failUI) {
            this.showResults();
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
            .call(() => this.hideFailAndShowResults())
            .start();
    }

    public win() {
        if (this.isGameOver) return;
        this.isGameOver = true;

        this.setEnginePaused(true);
        this.showDarkOverlay();

        if (this.confettiController) {
            this.confettiController.play();
        }

        this.scheduleOnce(() => {
            this.showResults();
        }, 0.3);
    }

    private hideFailAndShowResults() {
        if (!this.failUI) {
            this.showResults();
            return;
        }

        Tween.stopAllByTarget(this.failUI);

        const failOpacity = this.failUI.getComponent(UIOpacity);

        if (!failOpacity) {
            this.failUI.active = false;
            this.showResults();
            return;
        }

        tween(failOpacity)
            .to(0.25, { opacity: 0 })
            .start();

        tween(this.failUI)
            .to(0.25, { scale: new Vec3(0.85, 0.85, 1) }, { easing: 'quadIn' })
            .call(() => {
                this.failUI.active = false;
                this.failUI.setScale(new Vec3(1, 1, 1));
                failOpacity.opacity = 255;
                this.showResults();
            })
            .start();
    }

    private showResults() {
        if (this.moneyManager && this.finalMoneyLabel) {
            const amount = this.moneyManager.getCurrentAmount();
            this.finalMoneyLabel.string = `$${amount}.00`;
        }

        if (!this.resultsUI) return;

        this.resultsUI.active = true;
        this.resultsUI.setScale(new Vec3(0, 0, 0));

        const uiOpacity = this.resultsUI.getComponent(UIOpacity);
        if (uiOpacity) uiOpacity.opacity = 0;

        tween(this.resultsUI)
            .to(0.4, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
            .call(() => {
                if (uiOpacity) {
                    tween(uiOpacity)
                        .to(0.3, { opacity: 255 })
                        .start();
                }
            })
            .start();
    }

    private showDarkOverlay() {
        if (!this.darkOverlay) return;

        this.darkOverlay.active = true;

        const overlayOpacity = this.darkOverlay.getComponent(UIOpacity);
        if (!overlayOpacity) return;

        overlayOpacity.opacity = 0;

        tween(overlayOpacity)
            .to(0.3, { opacity: 150 })
            .start();
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

    private setEnginePaused(paused: boolean) {
        const road = this.levelContent.getComponent('RoadController') as any;
        if (road) road.enabled = !paused;

        const playerComp = this.player.getComponent('PlayerController') as any;
        if (playerComp) playerComp.enabled = !paused;

        const playerAnim = this.player.getComponent('SimpleSpriteAnim') as any;
        if (playerAnim) playerAnim.enabled = !paused;

        const obstacles = this.levelContent.getComponentsInChildren('Obstacle');
        obstacles.forEach(obs => (obs as any).enabled = !paused);
    }
}