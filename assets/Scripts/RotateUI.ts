import { _decorator, Component, Node, Vec3, math } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('RotateUI')
export class RotateUI extends Component {
    @property
    public speed: number = 30; // degrees per second

    update(deltaTime: number) {
        const currentRotation = this.node.eulerAngles;
        this.node.setRotationFromEuler(
            currentRotation.x,
            currentRotation.y,
            currentRotation.z + this.speed * deltaTime
        );
    }
}