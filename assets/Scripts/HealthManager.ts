import { _decorator, Component, UIOpacity } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('HealthManager')
export class HealthManager extends Component {
    private hearts: UIOpacity[] = [];
    private currentHealth: number = 3;

    @property
    lowOpacityValue: number = 50; // Прозрачность "пустого" сердца (0-255)

    start() {
        // Собираем компоненты UIOpacity из дочерних нод сердечек
        this.hearts = this.getComponentsInChildren(UIOpacity);
        this.currentHealth = this.hearts.length;
    }

    takeDamage(): boolean {
        if (this.currentHealth <= 0) return false;

        this.currentHealth--;
        
        // Берем сердечко по индексу (справа налево) и снижаем прозрачность
        const heartOpacity = this.hearts[this.currentHealth];
        if (heartOpacity) {
            heartOpacity.opacity = this.lowOpacityValue;
        }

        return this.currentHealth > 0;
    }

    reset() {
        this.currentHealth = this.hearts.length;
        this.hearts.forEach(h => h.opacity = 255);
    }
}