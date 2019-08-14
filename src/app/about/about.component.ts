import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Course } from '../model/course';
import { from } from 'rxjs';


@Component({
  selector: 'about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  constructor(private db: AngularFirestore) { }

  ngOnInit() {

    // Persistent Document References
    const courseRef = this.db.doc('/courses/fndv9uFliETIMynK51jr')
                          .snapshotChanges()
                          .subscribe(snap => {
                            const course: any = snap.payload.data();

                            console.log('course.relatedCourseRef', course.relatedCourseRef);
                          });

    const ref = this.db.doc('courses/4N12UNS54hamJiPuNFpB')
                    .snapshotChanges()
                    .subscribe(doc => console.log('ref', doc.payload.ref));
  }

  save() {
    // Batch Writes
    const firebaseCourseRef = this.db.doc('/courses/fndv9uFliETIMynK51jr').ref;
    const rxjsCourseRef = this.db.doc('/courses/4N12UNS54hamJiPuNFpB').ref;

    const batch = this.db.firestore.batch();

    batch.update(firebaseCourseRef, {titles: {description: 'Firebase Course'}});
    batch.update(rxjsCourseRef, {titles: {description: 'RxJs Course'}});

    const batch$ = from(batch.commit());

    batch$.subscribe();
  }

}
