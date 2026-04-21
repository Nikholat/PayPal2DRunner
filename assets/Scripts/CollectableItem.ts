import { _decorator, Component, Collider2D, Contact2DType } from 'cc';
import { MoneyManager } from './MoneyManager';
const { ccclass, property } = _decorator;

@ccclass('CollectableItem')
export class CollectableItem extends Component {
    @property
    value: number = 10; // Сколько дает этот предмет (например, PayPal может давать больше)

    @property(MoneyManager)
    moneyManager: MoneyManager = null!;

    start() {
        const collider = this.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onCollect, this);
        }
    }

    onCollect(self: Collider2D, other: Collider2D) {
        // ПРОВЕРКА: Если тот, кто коснулся монеты, НЕ является игроком — игнорируем
        // Можно проверять по имени ноды или по наличию скрипта PlayerController
        const isPlayer = other.getComponent('PlayerController');

        if (!isPlayer) {
            return; // Зэк или другой объект просто пролетают мимо
        }

        if (this.moneyManager) {
            this.moneyManager.addMoney(this.value);
        }

        this.node.active = false;
    }
}