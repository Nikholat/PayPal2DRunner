import { _decorator, Component, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Obstacle')
export class Obstacle extends Component {
    @property
    additionalSpeed: number = 200; // На сколько он движется БЫСТРЕЕ дороги

    private isStopped: boolean = false;

    update(dt: number) {
        if (this.isStopped) return;

        // Двигаем зэка влево по локальной оси X
        const pos = this.node.position;
        this.node.setPosition(pos.x - this.additionalSpeed * dt, pos.y, 0);

        // Если зэк убежал далеко за экран, его можно деактивировать для оптимизации
        if (this.node.position.x < -1500) {
            this.node.active = false;
        }
    }

    // Метод для остановки зэка при смерти игрока
    public stop() {
        this.isStopped = true;
    }
}