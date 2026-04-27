import { _decorator, Component, Node, tween, Tween } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('FinishRopeBreak')
export class FinishRopeBreak extends Component {
    @property(Node)
    leftPivot: Node = null!;

    @property(Node)
    rightPivot: Node = null!;

    @property
    leftDropAngle: number = -75;

    @property
    rightDropAngle: number = 75;

    @property
    duration: number = 0.45;

    private isBroken: boolean = false;

    public breakRope(): void {
        if (this.isBroken) return;
        this.isBroken = true;

        this.rotateDown(this.leftPivot, this.leftDropAngle);
        this.rotateDown(this.rightPivot, this.rightDropAngle);
    }

    private rotateDown(target: Node | null, angle: number): void {
        if (!target) return;

        Tween.stopAllByTarget(target);

        tween(target)
            .to(this.duration, { angle }, { easing: 'backOut' })
            .start();
    }
}