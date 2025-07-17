import {Core, WebViewerInstance} from "@pdftron/webviewer";


export function createDeviceAnnotation(instance: WebViewerInstance) {
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
    }

    public override draw(ctx: CanvasRenderingContext2D, pageMatrix: unknown): void {
      // the setStyles function is a function on markup annotations that sets up
      // certain properties for us on the canvas for the annotation's stroke thickness.
      this.setStyles(ctx, pageMatrix);

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

  DeviceAnnotation.prototype.elementName = 'deviceAnnotation';

  return DeviceAnnotation;
}
