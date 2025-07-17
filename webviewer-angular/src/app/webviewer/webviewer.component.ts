import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import WebViewer from '@pdftron/webviewer';
import {createDeviceAnnotation} from "./device-annotation";

@Component({
  selector: 'webviewer',
  templateUrl: './webviewer.component.html',
  standalone: true
})
export class WebViewerComponent implements AfterViewInit {
  @ViewChild('viewer') viewer!: ElementRef;

  constructor() { }

  ngAfterViewInit(): void {
    WebViewer({
      path: '../../lib/webviewer',
      licenseKey: 'Yoshie io GmbH  and Co KG:OEM:Yoshie io::B+:AMS(20260308):B0A5CB9D0417A60A4360B13AA982527160616F0CE75672C29595D68A9D7C588E64DA39F5C7', // sign up to get a free trial key at https://dev.apryse.com
      initialDoc: 'https://apryse.s3.amazonaws.com/public/files/samples/WebviewerDemoDoc.pdf'
    }, this.viewer.nativeElement).then(instance => {

      const { documentViewer, Annotations, annotationManager } = instance.Core;

      instance.UI.openElements(['notesPanel']);

      documentViewer.addEventListener('annotationsLoaded', () => {
        console.log('annotations loaded');
      });



      const DeviceAnnotation = createDeviceAnnotation(instance);
      annotationManager.registerAnnotationType(DeviceAnnotation.prototype.elementName, DeviceAnnotation);


      documentViewer.addEventListener('documentLoaded', () => {
        const rectangleAnnot = new Annotations.RectangleAnnotation({
          PageNumber: 1,
          // values are in page coordinates with (0, 0) in the top left
          X: 100,
          Y: 150,
          Width: 200,
          Height: 50,
          Author: annotationManager.getCurrentUser()
        });
        annotationManager.addAnnotation(rectangleAnnot);
        annotationManager.redrawAnnotation(rectangleAnnot);

        const da = new DeviceAnnotation();
        da.PageNumber = 1;
        da.setX(100);
        da.setY(250);

        //I also called this
        da.enableRotationControl();

        annotationManager.addAnnotation(da);
        annotationManager.redrawAnnotation(da);
      });

    })
  }
}
