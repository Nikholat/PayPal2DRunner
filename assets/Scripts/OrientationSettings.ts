import { _decorator, Component, Node, Vec3, view } from 'cc';
const { ccclass, property } = _decorator;

enum LayoutState {
  PHONE_PORTRAIT,
  PHONE_LANDSCAPE,
  TABLET_PORTRAIT,
  TABLET_LANDSCAPE,
  NONE
}

@ccclass('OrientationSettings')
export class OrientationSettings {
  @property(Node)
  public targetNode: Node | null = null;

  @property({ tooltip: 'If false, position will not be modified' })
  public applyPosition: boolean = true;

  @property({ group: 'Phone Settings' })
  public phonePortraitScale: Vec3 = new Vec3(1, 1, 1);
  @property({ group: 'Phone Settings' })
  public phonePortraitPos: Vec3 = new Vec3(0, 0, 0);

  @property({ group: 'Phone Settings' })
  public phoneLandscapeScale: Vec3 = new Vec3(0.7, 0.7, 1);
  @property({ group: 'Phone Settings' })
  public phoneLandscapePos: Vec3 = new Vec3(0, -200, 0);

  @property({ group: 'Tablet Settings' })
  public tabletPortraitScale: Vec3 = new Vec3(0.85, 0.85, 1);
  @property({ group: 'Tablet Settings' })
  public tabletPortraitPos: Vec3 = new Vec3(0, -100, 0);

  @property({ group: 'Tablet Settings' })
  public tabletLandscapeScale: Vec3 = new Vec3(0.85, 0.85, 1);
  @property({ group: 'Tablet Settings' })
  public tabletLandscapePos: Vec3 = new Vec3(0, -150, 0);
}

@ccclass('OrientationAdapter')
export class OrientationAdapter extends Component {
  @property([OrientationSettings])
  public elements: OrientationSettings[] = [];

  private currentState: LayoutState = LayoutState.NONE;

  onLoad(): void {
    view.setResizeCallback(() => this.updateLayout());
  }

  start(): void {
    this.updateLayout();
  }

  private updateLayout(): void {
    const visibleSize = view.getVisibleSize();
    const ratio = visibleSize.width / visibleSize.height;

    let newState = LayoutState.NONE;

    if (ratio > 1) {
      // Landscape mode
      // Если соотношение сторон меньше 1.4 (например, 4:3 = 1.33) -> это планшет
      newState = ratio < 1.4 ? LayoutState.TABLET_LANDSCAPE : LayoutState.PHONE_LANDSCAPE;
    } else {
      // Portrait mode
      // Если соотношение сторон больше 0.7 (например, 3:4 = 0.75) -> это планшет
      newState = ratio > 0.7 ? LayoutState.TABLET_PORTRAIT : LayoutState.PHONE_PORTRAIT;
    }

    // Блокируем лишние вызовы, если стейт не изменился
    if (this.currentState === newState) return;
    this.currentState = newState;

    for (const el of this.elements) {
      if (!el.targetNode) continue;

      switch (this.currentState) {
        case LayoutState.PHONE_PORTRAIT:
          el.targetNode.setScale(el.phonePortraitScale);
          if (el.applyPosition) el.targetNode.setPosition(el.phonePortraitPos);
          break;
        case LayoutState.PHONE_LANDSCAPE:
          el.targetNode.setScale(el.phoneLandscapeScale);
          if (el.applyPosition) el.targetNode.setPosition(el.phoneLandscapePos);
          break;
        case LayoutState.TABLET_PORTRAIT:
          el.targetNode.setScale(el.tabletPortraitScale);
          if (el.applyPosition) el.targetNode.setPosition(el.tabletPortraitPos);
          break;
        case LayoutState.TABLET_LANDSCAPE:
          el.targetNode.setScale(el.tabletLandscapeScale);
          if (el.applyPosition) el.targetNode.setPosition(el.tabletLandscapePos);
          break;
      }
    }
  }
}