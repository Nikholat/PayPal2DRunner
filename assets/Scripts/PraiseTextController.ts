import { _decorator, Component, Label, Node, Vec3, tween, UIOpacity, Tween, randomRangeInt, math } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('PraiseTextController')
export class PraiseTextController extends Component {
    @property(Label)
    praiseLabel: Label = null!;

    @property(Node)
    praiseNode: Node = null!;

    @property([String])
    phrases: string[] = ['Fantastic!', 'Awesome!', 'Nice!'];

    @property({
        tooltip: 'Chance to show praise text. 0 = never, 1 = always'
    })
    showChance: number = 0.45;

    @property
    showDuration: number = 0.45;

    @property
    fadeDuration: number = 0.18;

    private opacity: UIOpacity | null = null;

    start() {
        if (!this.praiseNode && this.praiseLabel) {
            this.praiseNode = this.praiseLabel.node;
        }

        if (!this.praiseNode) return;

        this.opacity = this.praiseNode.getComponent(UIOpacity) || this.praiseNode.addComponent(UIOpacity);
        this.opacity.opacity = 0;
        this.praiseNode.active = false;
    }

    public tryShowRandomPraise() {
        if (Math.random() > math.clamp01(this.showChance)) return;
        this.showRandomPraise();
    }

    public showRandomPraise() {
        if (!this.praiseNode || !this.praiseLabel || this.phrases.length === 0) return;

        const phrase = this.phrases[randomRangeInt(0, this.phrases.length)];
        this.showPraise(phrase);
    }

    public showPraise(text: string) {
        if (!this.praiseNode || !this.praiseLabel) return;

        const opacity = this.opacity || this.praiseNode.getComponent(UIOpacity) || this.praiseNode.addComponent(UIOpacity);

        Tween.stopAllByTarget(this.praiseNode);
        Tween.stopAllByTarget(opacity);

        this.praiseLabel.string = text;
        this.praiseNode.active = true;
        this.praiseNode.setScale(new Vec3(0.75, 0.75, 1));
        opacity.opacity = 0;

        tween(opacity)
            .to(this.fadeDuration, { opacity: 255 })
            .delay(this.showDuration)
            .to(this.fadeDuration, { opacity: 0 })
            .call(() => {
                this.praiseNode.active = false;
            })
            .start();

        tween(this.praiseNode)
            .to(this.fadeDuration, { scale: new Vec3(1.12, 1.12, 1) }, { easing: 'backOut' })
            .to(0.12, { scale: new Vec3(1, 1, 1) }, { easing: 'quadOut' })
            .start();
    }
}