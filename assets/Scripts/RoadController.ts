import { _decorator, Component, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('RoadController')
export class RoadController extends Component {
    @property
    moveSpeed: number = 600; // Скорость в пикселях в секунду

    public isMoving: boolean = true;

    update(dt: number) {
        if (!this.isMoving) return;

        // Берем текущую позицию
        const pos = this.node.position;
        
        // Вычитаем скорость, умноженную на время кадра
        // Это гарантирует плавное движение при любом FPS
        this.node.setPosition(pos.x - this.moveSpeed * dt, pos.y, 0);
    }

    // Метод для остановки (вызывай из PlayerController при смерти)
    public stop() {
        this.isMoving = false;
    }
}