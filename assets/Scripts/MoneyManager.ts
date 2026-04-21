import { _decorator, Component, Label, Node, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MoneyManager')
export class MoneyManager extends Component {
    @property(Label)
    moneyLabel: Label = null!;

    @property(Node)
    visualContainer: Node = null!; // Перетяни сюда всю белую плашку с PayPal

    private currentAmount: number = 0;
    private isAnimate: boolean = false;

    public addMoney(amount: number) {
        this.currentAmount += amount;

        if (this.moneyLabel) {
            // Добавляем символ $ обратно программно
            this.moneyLabel.string = `$${this.currentAmount}`;
        }

        this.playBounceAnimation();
    }

    private playBounceAnimation() {
        if (!this.visualContainer) return;

        // Если анимация уже идет, стопаем её, чтобы начать заново (для быстрых сборов)
        tween(this.visualContainer).stop();

        // Сбрасываем масштаб перед началом
        this.visualContainer.setScale(new Vec3(1, 1, 1));

        tween(this.visualContainer)
            .to(0.05, { scale: new Vec3(1.2, 1.2, 1) }, { easing: 'backOut' }) // Быстрый взлет
            .to(0.1, { scale: new Vec3(1, 1, 1) }, { easing: 'bounceOut' })    // Возврат с отскоком
            .start();
    }
}