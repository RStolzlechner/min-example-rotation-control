import {Core, WebViewerInstance} from "@pdftron/webviewer";


export function createDeviceAnnotation(instance: WebViewerInstance) {
  class CustomRectangleSelectionModel extends instance.Core.Annotations.BoxSelectionModel {
    constructor(annotation: any, canModify: boolean, isSelected: boolean = false, documentViewer?: any) {
      // @ts-ignore
      super(annotation, canModify, isSelected, documentViewer);

      const controlHandles = this.getControlHandles();

      // @ts-ignore
      controlHandles.push(new instance.Core.Annotations.RotationControlHandle(10, 10, 10, annotation, documentViewer));
    }
  }

  class DeviceAnnotation extends instance.Core.Annotations.CustomAnnotation {
    public static readonly DEVICE_ANNOTATION_MARKER = 'device-annotation-marker';

    constructor() {
      super('deviceAnnotation');
      this.Subject = 'DeviceAnnotation';
      this.NoResize = false;
      this.setHeight(100);
      this.setWidth(100);

      //I enabled this!
      this.RotationControlEnabled = true;

      // @ts-ignore
      this.selectionModel = CustomRectangleSelectionModel;
    }

    public override draw(ctx: CanvasRenderingContext2D, pageMatrix: unknown): void {
      // the setStyles function is a function on markup annotations that sets up
      // certain properties for us on the canvas for the annotation's stroke thickness.
      this.setStyles(ctx, pageMatrix);

      //@ts-ignore
      const { x, y, width, height } = this.getUnrotatedDimensions();

      ctx.translate(x + width / 2, y + height / 2);

      //@ts-ignore
      ctx.rotate(-instance.Core.Annotations.RotationUtils.getRotationAngleInRadiansByDegrees(this['Rotation']));
      ctx.translate(-x - width / 2, -y - height / 2);

      // first we need to translate to the annotation's x/y coordinates so that it's
      // drawn in the correct location
      ctx.translate(this.X, this.Y);
      ctx.beginPath();
      ctx.moveTo(this.Width / 2, 0);
      ctx.lineTo(this.Width, this.Height);
      ctx.lineTo(0, this.Height);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      const marker = this.getCustomData(DeviceAnnotation.DEVICE_ANNOTATION_MARKER);
      if (marker){
        console.log('marker', marker);
      }
      console.log('draw');
    }

    public override serialize(element: Element, pageMatrix: unknown): Element {
      this.setCustomData(DeviceAnnotation.DEVICE_ANNOTATION_MARKER, 'true');
      return super.serialize(element, pageMatrix);
    }

    public override async deserialize(element: Element, pageMatrix: unknown): Promise<void> {
      super.deserialize(element, pageMatrix);
      // Custom deserialization logic for device annotation can be added here
    }
  }



  //@ts-ignore
  const mixin = instance.Core.Annotations.RotationUtils.RectangularCustomAnnotationRotationMixin;
  const rotate = mixin.rotate;
  const getUnrotatedDimensions = mixin.getUnrotatedDimensions;
  const getRotatedAnnotationBoundingBoxRect = mixin.getRotatedAnnotationBoundingBoxRect;
  const ownSerialize = DeviceAnnotation.prototype.serialize;
  const ownDeserialize = DeviceAnnotation.prototype.deserialize;

  Object.assign(DeviceAnnotation.prototype, {rotate, getRotatedAnnotationBoundingBoxRect, getUnrotatedDimensions});
  DeviceAnnotation.prototype.serialize = function (element: Element, pageMatrix: unknown):Element {
    const newElement = ownSerialize.call(this, element, pageMatrix);
    return mixin.serialize.call(this, newElement, pageMatrix);
  }
  DeviceAnnotation.prototype.deserialize = function (element: Element, pageMatrix: unknown): Promise<void> {
    return ownDeserialize.call(this, element, pageMatrix).then(() => {
      return mixin.deserialize.call(this, element, pageMatrix);
    });
  }

  DeviceAnnotation.prototype.elementName = 'deviceAnnotation';

  return DeviceAnnotation;
}
