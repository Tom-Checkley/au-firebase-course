import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Course } from '../model/course';

@Component({
  selector: 'about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  constructor(private db: AngularFirestore) { }

  ngOnInit() {
    this.db.collection('courses').snapshotChanges()
      .subscribe(snaps => {

        const courses: Course[] = snaps.map(snap => {
          return <Course> {
            id: snap.payload.doc.id,
            ...snap.payload.doc.data()
          }
        });
        console.log(courses);
        
      });
  }

}
