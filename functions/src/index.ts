import * as functions from 'firebase-functions';
import { db } from '../init';

import * as express from 'express';
import * as cors from 'cors';
import { Course } from '../../src/app/model/course';

const app = express();
app.use(cors({ origin: true }));

app.get('/courses', async (req, res) => {
  const snaps = await db.collection('courses').get();

  const courses: Course[] = [];
  snaps.forEach(snap => courses.push(snap.data()));

  res.status(200).json({courses});
})

export const getCourses = functions.https.onRequest(app);

